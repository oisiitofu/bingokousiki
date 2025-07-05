let players = [];
players.push({ name, rating: 1500, matches: 0, wins: 0 });
let history = [];
let lastSnapshot = null;

function registerPlayer() {
  const name = document.getElementById('playerName').value.trim();
  if (!name || players.find(p => p.name === name)) return;
  players.push({ name, rating: 1500, matches: 0, wins: 0 }); // ← 試合数と勝利数を初期化！
  updateRanking();
  renderTeamSelectors();
}


function renderTeamSelectors() {
  const teamSize = parseInt(document.querySelector('input[name="teamSize"]:checked').value);
  ['team1Selectors', 'team2Selectors'].forEach(id => {
    const div = document.getElementById(id);
    div.innerHTML = '';
    for (let i = 0; i < teamSize; i++) {
      const sel = document.createElement('select');
      sel.innerHTML = players.map(p => `<option>${p.name}</option>`).join('');
      div.appendChild(sel);
    }
  });
}

function reportMatch(winnerSide) {
  lastSnapshot = {
    players: JSON.parse(JSON.stringify(players)),
    history: [...history]
  };

  const team1 = [...document.getElementById('team1Selectors').querySelectorAll('select')].map(sel => sel.value);
  const team2 = [...document.getElementById('team2Selectors').querySelectorAll('select')].map(sel => sel.value);
  if (new Set([...team1, ...team2]).size < team1.length + team2.length) return;

  const side1 = team1.map(name => players.find(p => p.name === name));
  const side2 = team2.map(name => players.find(p => p.name === name));
  const [winners, losers] = winnerSide === '1' ? [side1, side2] : [side2, side1];

  const avgW = average(winners.map(p => p.rating));
  const avgL = average(losers.map(p => p.rating));
  const expected = 1 / (1 + Math.pow(10, (avgL - avgW) / 400));
  const change = Math.round(32 * (1 - expected));

  // レートと試合数の更新
  winners.forEach(p => {
    p.rating += change;
    p.matches = (p.matches || 0) + 1;
    p.wins = (p.wins || 0) + 1;
  });

  losers.forEach(p => {
    p.rating -= change;
    p.matches = (p.matches || 0) + 1;
  });

  const winnerText = winners.map(p => `${p.name}(+${change})`).join('＆');
  const loserText = losers.map(p => `${p.name}(-${change})`).join('＆');

  addHistory(
    `${winnerText} 勝利（敗者: ${loserText}）`,
    {
      winners: winners.map(p => p.name),
      losers: losers.map(p => p.name),
      diff: change
    }
  );

  updateRanking();
}


function average(arr) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function updateRanking() {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const tbody = document.querySelector('#ranking tbody');
  tbody.innerHTML = sorted.map((p, i) => {
    const matchCount = p.matches || 0;
    const winCount = p.wins || 0;
    const winRate = matchCount > 0 ? `${Math.round((winCount / matchCount) * 100)}%` : "-";
    return `<tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.rating}</td>
      <td>${matchCount}</td>
      <td>${winCount}</td>
      <td>${winRate}</td>
    </tr>`;
  }).join('');
  localStorage.players = JSON.stringify(players);
}



function addHistory(text, meta = null) {
  const timestamp = new Date().toLocaleString();
  const item = { timestamp, text, meta };
  history.unshift(item);
  if (history.length > 100) history.pop();
  updateHistory();
  localStorage.history = JSON.stringify(history); // 保存
}

function updateHistory() {
  const ul = document.getElementById('historyLog');
  ul.innerHTML = history.map(item => {
    const time = item.timestamp || "―";
    const msg = item.text || "―";
    return `<li>${time}：${msg}</li>`;
  }).join('');
}


window.onload = function() {
  if (localStorage.players) players = JSON.parse(localStorage.players);
  if (localStorage.history) history = JSON.parse(localStorage.history);
  updateRanking();
  renderTeamSelectors();
  updateHistory();
};

function resetAll() {
  if (!confirm("すべてのプレイヤーと履歴を削除します。よろしいですか？")) return;
  players = [];
  history = [];
  updateRanking();
  updateHistory();
  renderTeamSelectors();
  localStorage.removeItem('players');
  localStorage.removeItem('history');
}

function undoLastMatch() {
  if (!lastSnapshot) {
    alert("戻る対象がありません。");
    return;
  }
  players = JSON.parse(JSON.stringify(lastSnapshot.players));
  history = [...lastSnapshot.history];
  updateRanking();
  updateHistory();
  renderTeamSelectors();
  lastSnapshot = null;
}
function exportCSV() {
  if (history.length === 0) {
    alert("エクスポートできる履歴がありません。");
    return;
  }

  const header = "日時,勝者,敗者,勝者変動,敗者変動";
  const rows = history.map(item => {
    if (!item.meta) return `"${item.timestamp}","${item.text}","","",""`;
    const { winners, losers, diff } = item.meta;
    return `"${item.timestamp}","${winners.join('＆')}","${losers.join('＆')}","+${diff}","-${diff}"`;
  });

  const csv = [header, ...rows].join("\n");
  const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  const link = document.createElement("a");
  link.setAttribute("href", uri);
  link.setAttribute("download", "team_match_history.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function changeTitle(newTitle) {
    const titleElement = document.getElementById("title");
    titleElement.textContent = newTitle;
}
