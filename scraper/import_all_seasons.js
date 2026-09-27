const fs = require('fs');
const path = require('path');

const reportMappings = [
    { id: 1, seasonKey: "2021/2022", name: "Saison 2021/2022", file: 'raw_berichte_1.html' },
    { id: 2, seasonKey: "2021/2022_1klasse", name: "1. Klasse 2021/2022", file: 'raw_berichte_2.html' },
    { id: 3, seasonKey: "2022/2023", name: "Saison 2022/2023", file: 'raw_berichte_3.html' },
    { id: 4, seasonKey: "2022/2023_1klasse", name: "1. Klasse 2022/2023", file: 'raw_berichte_4.html' },
    { id: 5, seasonKey: "2023/2024", name: "Saison 2023/2024", file: 'raw_berichte_5.html' },
    { id: 6, seasonKey: "2024/2025", name: "Saison 2024/2025", file: 'raw_berichte_6.html' },
    { id: 11, seasonKey: "2024/2025_oberes", name: "Oberes Playoff 2024/2025", file: 'raw_berichte_11.html' },
    { id: 12, seasonKey: "2024/2025_unteres", name: "Unteres Playoff 2024/2025", file: 'raw_berichte_12.html' },
    { id: 13, seasonKey: "2025/2026", name: "Saison 2025/2026", file: 'raw_berichte_13.html' },
    { id: 14, seasonKey: "2026/2027", name: "Saison 2026/2027", file: 'raw_berichte_14.html' }
];

const allPlayersSet = new Set();
const compiledSeasons = {};

reportMappings.forEach(comp => {
    const filePath = path.join(__dirname, comp.file);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${comp.file}`);
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const matches = [];
    const teamsMap = new Map();
    const scorersMap = new Map();
    const cardsMap = new Map();

    let currentRound = "1. Runde";
    let matchCounter = 1;

    // Split rows
    const trMatches = html.split(/<tr\s+/gi);
    
    for (let i = 1; i < trMatches.length; i++) {
        const row = '<tr ' + trMatches[i];
        
        // Check round header
        const thMatch = row.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
        if (thMatch) {
            const thText = thMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
            if (thText.includes('Runde')) {
                currentRound = thText.split('(')[0].trim();
            }
            continue;
        }

        if (row.includes('class="clicker"') || row.includes("class='clicker'")) {
            const tdMatches = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
            if (tdMatches.length < 5) continue;

            const date = tdMatches[0];
            const home = tdMatches[1];
            const away = tdMatches[3];
            const rawScore = tdMatches[4];

            if (!home || !away) continue;

            // Ensure teams exist in teamsMap
            if (!teamsMap.has(home)) {
                teamsMap.set(home, { name: home, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, diff: 0, points: 0 });
            }
            if (!teamsMap.has(away)) {
                teamsMap.set(away, { name: away, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, diff: 0, points: 0 });
            }

            let status = 'Upcoming';
            let score = rawScore;
            let gHome = 0;
            let gAway = 0;
            let isValidScore = false;

            if (score && score.includes(':') && !score.includes('-:-') && score !== ': (:)') {
                const mainScore = score.split(' ')[0].replace('*', '');
                const parts = mainScore.split(':');
                gHome = parseInt(parts[0]);
                gAway = parseInt(parts[1]);
                if (!isNaN(gHome) && !isNaN(gAway)) {
                    status = 'Played';
                    isValidScore = true;
                }
            } else {
                score = '-:-';
            }

            // Look for details in next row
            let venue = 'DSG-Platz';
            let time = '';
            const matchScorers = [];
            const matchCards = [];

            if (i + 1 < trMatches.length) {
                const nextRow = '<tr ' + trMatches[i + 1];
                if (nextRow.includes('id="details_') || nextRow.includes("id='details_")) {
                    const detailTdMatches = Array.from(nextRow.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi));
                    if (detailTdMatches.length > 0) {
                        const locTimeText = detailTdMatches[0][1].replace(/<[^>]+>/g, '').trim();
                        if (locTimeText) {
                            const parts = locTimeText.split(/\s+/);
                            const lastPart = parts[parts.length - 1];
                            if (lastPart.includes(':') && lastPart.length === 5) {
                                time = lastPart;
                                venue = parts.slice(0, -1).join(' ') || 'DSG-Platz';
                            } else {
                                venue = locTimeText;
                            }
                        }
                    }

                    // Process events
                    const eventCells = Array.from(nextRow.matchAll(/<td colspan="2"[^>]*>([\s\S]*?)<\/td>/gi));
                    eventCells.forEach((ecMatch, sideIdx) => {
                        const teamName = sideIdx === 0 ? home : away;
                        const cellHtml = ecMatch[1];
                        const lines = cellHtml.split(/<br\s*\/?>/i);

                        lines.forEach(line => {
                            const playerName = line.replace(/<[^>]+>/g, '').trim();
                            if (!playerName) return;

                            allPlayersSet.add(playerName);

                            const torCount = (line.match(/tor\.(gif|png|jpg)/gi) || []).length;
                            const gelbCount = (line.match(/gelb\.png/gi) || []).length;
                            const gelbrotCount = (line.match(/gelbrot\.(jpg|png)/gi) || []).length;
                            const rotCount = (line.match(/rot\.png/gi) || []).length;

                            if (torCount > 0) {
                                matchScorers.push({ name: playerName, team: teamName, goals: torCount });
                                const scKey = `${playerName}_${teamName}`;
                                if (!scorersMap.has(scKey)) {
                                    scorersMap.set(scKey, { name: playerName, team: teamName, goals: 0 });
                                }
                                scorersMap.get(scKey).goals += torCount;
                            }

                            if (gelbCount > 0) {
                                for (let g = 0; g < gelbCount; g++) {
                                    matchCards.push({ name: playerName, team: teamName, type: 'yellow' });
                                }
                                const cardKey = `${playerName}_${teamName}`;
                                if (!cardsMap.has(cardKey)) {
                                    cardsMap.set(cardKey, { name: playerName, team: teamName, yellow: 0, yellowRed: 0, red: 0 });
                                }
                                cardsMap.get(cardKey).yellow += gelbCount;
                            }

                            if (gelbrotCount > 0) {
                                for (let g = 0; g < gelbrotCount; g++) {
                                    matchCards.push({ name: playerName, team: teamName, type: 'yellowRed' });
                                }
                                const cardKey = `${playerName}_${teamName}`;
                                if (!cardsMap.has(cardKey)) {
                                    cardsMap.set(cardKey, { name: playerName, team: teamName, yellow: 0, yellowRed: 0, red: 0 });
                                }
                                cardsMap.get(cardKey).yellowRed += gelbrotCount;
                            }

                            if (rotCount > 0) {
                                for (let g = 0; g < rotCount; g++) {
                                    matchCards.push({ name: playerName, team: teamName, type: 'red' });
                                }
                                const cardKey = `${playerName}_${teamName}`;
                                if (!cardsMap.has(cardKey)) {
                                    cardsMap.set(cardKey, { name: playerName, team: teamName, yellow: 0, yellowRed: 0, red: 0 });
                                }
                                cardsMap.get(cardKey).red += rotCount;
                            }
                        });
                    });
                }
            }

            // Update standings if played
            if (isValidScore) {
                const tHome = teamsMap.get(home);
                const tAway = teamsMap.get(away);
                tHome.played++;
                tAway.played++;
                tHome.gf += gHome;
                tHome.ga += gAway;
                tAway.gf += gAway;
                tAway.ga += gHome;

                if (gHome > gAway) {
                    tHome.won++;
                    tHome.points += 3;
                    tAway.lost++;
                } else if (gAway > gHome) {
                    tAway.won++;
                    tAway.points += 3;
                    tHome.lost++;
                } else {
                    tHome.drawn++;
                    tHome.points += 1;
                    tAway.drawn++;
                    tAway.points += 1;
                }
            }

            const cleanSeasonPrefix = comp.seasonKey.replace(/[^a-z0-9]/gi, '_');
            matches.push({
                id: `${cleanSeasonPrefix}_${matchCounter++}`,
                round: currentRound,
                date,
                home,
                away,
                score,
                status,
                venue,
                time: time || undefined,
                scorers: matchScorers,
                cards: matchCards
            });
        }
    }

    // Calculate diff & sort standings
    const standings = Array.from(teamsMap.values()).map((t, idx) => {
        t.id = idx + 1;
        t.diff = t.gf - t.ga;
        return t;
    }).sort((a, b) => (b.points - a.points) || (b.diff - a.diff) || (b.gf - a.gf));

    // Sort Top Scorers
    const topScorers = Array.from(scorersMap.values())
        .sort((a, b) => b.goals - a.goals);

    // Sort Cards
    const cards = Array.from(cardsMap.values())
        .sort((a, b) => ((b.red * 5 + b.yellowRed * 3 + b.yellow) - (a.red * 5 + a.yellowRed * 3 + a.yellow)));

    compiledSeasons[comp.seasonKey] = {
        teams: standings,
        matches,
        stats: {
            topScorers,
            cards
        }
    };

    console.log(`✅ Compiled [${comp.seasonKey}]: ${standings.length} Teams, ${matches.length} Matches, ${topScorers.length} Scorers, ${cards.length} Card recipients.`);
});

// Load existing full data structure
const ligaJsonPath = path.resolve(__dirname, '../Website/data/liga.json');
let baseData = {};
try {
    baseData = JSON.parse(fs.readFileSync(ligaJsonPath, 'utf-8'));
} catch (e) {
    baseData = {};
}

baseData.currentSeason = "2025/2026";
baseData.players = Array.from(allPlayersSet).sort((a, b) => a.localeCompare(b, 'de'));
baseData.seasons = compiledSeasons;

// Clean up any old top-level legacy fields if present
delete baseData.teams;
delete baseData.matches;
delete baseData.stats;

// Write updated liga.json
fs.writeFileSync(ligaJsonPath, JSON.stringify(baseData, null, 2), 'utf-8');
console.log(`\n💾 Saved unified historical database to: ${ligaJsonPath}`);

// Update admin leagues.json cleanly with deduplication
const leaguesJsonPath = path.resolve(__dirname, '../Website/data/leagues.json');
const cleanAdminLeagues = [
    { id: 14, name: "Saison", year: "2026/2027", status: "Aktiv", seasonKey: "2026/2027", showOnHomepage: true },
    { id: 13, name: "Saison", year: "2025/2026", status: "Inaktiv", seasonKey: "2025/2026", showOnHomepage: true },
    { id: 6, name: "Saison", year: "2024/2025", status: "Inaktiv", seasonKey: "2024/2025", showOnHomepage: true },
    { id: 11, name: "Oberes Playoff", year: "2024/2025", status: "Inaktiv", seasonKey: "2024/2025_oberes", showOnHomepage: true },
    { id: 12, name: "Unteres Playoff", year: "2024/2025", status: "Inaktiv", seasonKey: "2024/2025_unteres", showOnHomepage: true },
    { id: 5, name: "Saison", year: "2023/2024", status: "Inaktiv", seasonKey: "2023/2024", showOnHomepage: true },
    { id: 3, name: "Saison", year: "2022/2023", status: "Inaktiv", seasonKey: "2022/2023", showOnHomepage: true },
    { id: 4, name: "1. Klasse", year: "2022/2023", status: "Inaktiv", seasonKey: "2022/2023_1klasse", showOnHomepage: true },
    { id: 1, name: "Saison", year: "2021/2022", status: "Inaktiv", seasonKey: "2021/2022", showOnHomepage: true },
    { id: 2, name: "1. Klasse", year: "2021/2022", status: "Inaktiv", seasonKey: "2021/2022_1klasse", showOnHomepage: true }
];
fs.writeFileSync(leaguesJsonPath, JSON.stringify(cleanAdminLeagues, null, 2), 'utf-8');
console.log(`💾 Saved clean admin leagues to: ${leaguesJsonPath}`);
