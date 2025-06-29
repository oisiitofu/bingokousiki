// プレイヤー名をソースコードに直接記載
const players = ["おいしいとうふ", "えだ", "リーマ", "Lickey", "ジャン", "Kento"];

// 初期化: 各プレイヤーの成績データ
let playerStats = players.map(player => ({
    name: player,
    wins: 0,
    losses: 0
}));

const combinations = [];

// チーム組み合わせ生成
const generateUniqueCombinations = (arr) => {
    let usedTeams = new Set();
    for (let i = 0; i < arr.length - 2; i++) {
        for (let j = i + 1; j < arr.length - 1; j++) {
            for (let k = j + 1; k < arr.length; k++) {
                const team1 = [arr[i], arr[j], arr[k]];
                const team2 = arr.filter(player => !team1.includes(player));
                const teamKey1 = team1.sort().join(",");
                const teamKey2 = team2.sort().join(",");

                if (!usedTeams.has(teamKey1) && !usedTeams.has(teamKey2)) {
                    combinations.push({ team1, team2 });
                    usedTeams.add(teamKey1);
                    usedTeams.add(teamKey2);

                    if (combinations.length >= 10) return;
                }
            }
        }
    }
};

generateUniqueCombinations(players);

// 成績表をリセット
const resetStats = () => {
    playerStats = players.map(player => ({
        name: player,
        wins: 0,
        losses: 0
    }));
    updateStatsTable(); // 表をリセット
};

// 成績表を更新する関数
const updateStatsTable = () => {
    const statsTableBody = document.querySelector("#playerStats tbody");
    statsTableBody.innerHTML = "";
    const sortedStats = [...playerStats].sort((a, b) => {
        const winRateA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const winRateB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        return winRateB - winRateA;
    });

    sortedStats.forEach(stat => {
        const winRate = stat.wins + stat.losses > 0
            ? ((stat.wins / (stat.wins + stat.losses)) * 100).toFixed(1) + "%"
            : "N/A";
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.wins}</td>
            <td>${stat.losses}</td>
            <td>${winRate}</td>
        `;
        statsTableBody.appendChild(row);
    });
};

// 試合結果を表示する関数
const displayMatches = (matches) => {
    const resultsDiv = document.getElementById("matchResults");
    resultsDiv.innerHTML = "";
    matches.forEach((match, index) => {
        const matchDiv = document.createElement("div");
        matchDiv.innerHTML = `
            試合 ${index + 1}: 
            (${match.team1.join(", ")}) vs (${match.team2.join(", ")})
            <select id="winner-${index}">
                <option value="">勝者を選択</option>
                <option value="team1">チーム1</option>
                <option value="team2">チーム2</option>
            </select>
        `;
        matchDiv.querySelector(`#winner-${index}`).addEventListener("change", (event) => {
            const winner = event.target.value;
            match.team1.forEach(player => {
                const stat = playerStats.find(p => p.name === player);
                if (winner === "team1") {
                    stat.wins++;
                } else if (winner === "team2") {
                    stat.losses++;
                }
            });
            match.team2.forEach(player => {
                const stat = playerStats.find(p => p.name === player);
                if (winner === "team2") {
                    stat.wins++;
                } else if (winner === "team1") {
                    stat.losses++;
                }
            });
            updateStatsTable();
        });
        resultsDiv.appendChild(matchDiv);
    });
};

// 初期表示
displayMatches(combinations);
updateStatsTable(); // 成績表を表示

// シャッフルボタン機能
document.getElementById("shuffleButton").addEventListener("click", () => {
    resetStats(); // 成績リセット
    const shuffledMatches = combinations.sort(() => Math.random() - 0.5);
    displayMatches(shuffledMatches);
});
