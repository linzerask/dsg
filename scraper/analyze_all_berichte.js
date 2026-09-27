const fs = require('fs');
const path = require('path');

const reportFiles = [
    { id: 1, name: "Liga 2021/2022", file: 'raw_berichte_1.html' },
    { id: 2, name: "1. Klasse 2021/2022", file: 'raw_berichte_2.html' },
    { id: 3, name: "Liga 2022/2023", file: 'raw_berichte_3.html' },
    { id: 4, name: "1. Klasse 2022/2023", file: 'raw_berichte_4.html' },
    { id: 5, name: "Liga 2023/2024", file: 'raw_berichte_5.html' },
    { id: 6, name: "Liga 2024/2025", file: 'raw_berichte_6.html' },
    { id: 11, name: "Oberes Playoff 2024/2025", file: 'raw_berichte_11.html' },
    { id: 12, name: "Unteres Playoff 2024/2025", file: 'raw_berichte_12.html' },
    { id: 13, name: "Saison 2025/2026", file: 'raw_berichte_13.html' },
    { id: 14, name: "Saison 2026/2027", file: 'raw_berichte_14.html' },
];

const statsBySeason = [];
let totalGamesOverall = 0;
let totalPlayedGames = 0;
let totalGoalsOverall = 0;
let totalYellowCards = 0;
let totalYellowRedCards = 0;
let totalRedCards = 0;
const allScorersMap = new Map();
const allTeamsSet = new Set();

reportFiles.forEach(rf => {
    const filePath = path.join(__dirname, rf.file);
    if (!fs.existsSync(filePath)) return;

    const html = fs.readFileSync(filePath, 'utf-8');

    let seasonGames = 0;
    let seasonPlayed = 0;
    let seasonGoals = 0;
    let seasonYellow = 0;
    let seasonYellowRed = 0;
    let seasonRed = 0;
    const seasonScorers = new Map();
    const seasonTeams = new Set();

    // Match rows: <tr class="clicker"...>...</tr> followed by <tr id="details_...">...</tr>
    // Let's split by <tr class="clicker"
    const matchChunks = html.split('<tr class="clicker"');
    
    for (let i = 1; i < matchChunks.length; i++) {
        const chunk = matchChunks[i];
        
        // Extract match cells
        const tdMatches = Array.from(chunk.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
        if (tdMatches.length < 5) continue;

        const date = tdMatches[0];
        const home = tdMatches[1];
        const away = tdMatches[3];
        const score = tdMatches[4];

        if (!home || !away) continue;

        seasonGames++;
        totalGamesOverall++;
        seasonTeams.add(home); allTeamsSet.add(home);
        seasonTeams.add(away); allTeamsSet.add(away);

        if (score && score.includes(':') && !score.includes('-:-') && score !== ': (:)') {
            const mainScore = score.split(' ')[0].replace('*', '');
            const parts = mainScore.split(':');
            const gHome = parseInt(parts[0]);
            const gAway = parseInt(parts[1]);
            if (!isNaN(gHome) && !isNaN(gAway)) {
                seasonPlayed++;
                totalPlayedGames++;
                const goalsCount = gHome + gAway;
                seasonGoals += goalsCount;
                totalGoalsOverall += goalsCount;
            }
        }

        // Parse events from details row
        // Extract the section after id="details_
        const detailsIdx = chunk.indexOf('id="details_');
        if (detailsIdx !== -1) {
            const detailsChunk = chunk.substring(detailsIdx);
            const detailTdMatches = Array.from(detailsChunk.matchAll(/<td colspan="2"[^>]*>([\s\S]*?)<\/td>/gi));

            detailTdMatches.forEach((dtMatch, sideIdx) => {
                const sideHtml = dtMatch[1];
                const teamName = sideIdx === 0 ? home : away;

                // Split by <br> or lines
                const lines = sideHtml.split(/<br\s*\/?>/i);
                lines.forEach(line => {
                    const text = line.replace(/<[^>]+>/g, '').trim();
                    if (!text) return;

                    const torCount = (line.match(/tor\.(gif|png|jpg)/gi) || []).length;
                    const gelbCount = (line.match(/gelb\.png/gi) || []).length;
                    const gelbrotCount = (line.match(/gelbrot\.(jpg|png)/gi) || []).length;
                    const rotCount = (line.match(/rot\.png/gi) || []).length;

                    if (torCount > 0) {
                        seasonScorers.set(text, (seasonScorers.get(text) || 0) + torCount);
                        allScorersMap.set(text, (allScorersMap.get(text) || 0) + torCount);
                    }
                    if (gelbCount > 0) {
                        seasonYellow += gelbCount;
                        totalYellowCards += gelbCount;
                    }
                    if (gelbrotCount > 0) {
                        seasonYellowRed += gelbrotCount;
                        totalYellowRedCards += gelbrotCount;
                    }
                    if (rotCount > 0) {
                        seasonRed += rotCount;
                        totalRedCards += rotCount;
                    }
                });
            });
        }
    }

    const topScorerSeason = Array.from(seasonScorers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, goals]) => ({ name, goals }));

    statsBySeason.push({
        id: rf.id,
        name: rf.name,
        totalGames: seasonGames,
        playedGames: seasonPlayed,
        totalGoals: seasonGoals,
        goalsPerGame: seasonPlayed > 0 ? (seasonGoals / seasonPlayed).toFixed(2) : "0.00",
        yellowCards: seasonYellow,
        yellowRedCards: seasonYellowRed,
        redCards: seasonRed,
        teamsCount: seasonTeams.size,
        teams: Array.from(seasonTeams),
        topScorers: topScorerSeason
    });
});

const allTopScorers = Array.from(allScorersMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, goals], idx) => ({ rank: idx + 1, name, goals }));

const result = {
    overview: {
        totalSeasonsScraped: statsBySeason.length,
        totalTeamsAcrossHistory: allTeamsSet.size,
        totalGamesScheduled: totalGamesOverall,
        totalGamesPlayed: totalPlayedGames,
        totalGoalsScored: totalGoalsOverall,
        averageGoalsPerGame: (totalGoalsOverall / totalPlayedGames).toFixed(2),
        totalYellowCards: totalYellowCards,
        totalYellowRedCards: totalYellowRedCards,
        totalRedCards: totalRedCards,
        totalCards: totalYellowCards + totalYellowRedCards + totalRedCards
    },
    allTimeTopScorers: allTopScorers,
    seasons: statsBySeason
};

console.log(JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(__dirname, 'stats_summary.json'), JSON.stringify(result, null, 2), 'utf-8');
