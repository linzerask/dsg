const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_berichte.json'), 'utf-8'));
const html = raw.html;

// Simple DOM parsing without external heavy deps, or using regex / cheerio
// Let's use JSDOM or regex-based row iteration

// Helper to clean text
const cleanText = (str) => str.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Split by table rows
const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
const matches = [];
let trMatch;
const allTrs = [];

while ((trMatch = trRegex.exec(html)) !== null) {
    allTrs.push({
        raw: trMatch[0],
        inner: trMatch[1]
    });
}

console.log('Total <tr> found:', allTrs.length);

let currentRound = 1;
let currentRoundName = "1. Runde";
const parsedMatches = [];

for (let i = 0; i < allTrs.length; i++) {
    const tr = allTrs[i];
    
    // Check if round header
    if (tr.raw.includes('green-col') && tr.raw.includes('Runde')) {
        const roundMatch = tr.inner.match(/(\d+)\.\s*Runde/i);
        if (roundMatch) {
            currentRound = parseInt(roundMatch[1]);
            const fullRoundName = tr.inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            currentRoundName = fullRoundName;
        }
        continue;
    }

    // Check if match header row (class clicker)
    if (tr.raw.includes('class="clicker"') || tr.raw.includes("clicker")) {
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const tds = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(tr.inner)) !== null) {
            tds.push(cleanText(tdMatch[1].replace(/<[^>]+>/g, '')));
        }

        if (tds.length >= 5) {
            const dateStr = tds[0]; // e.g. "Fr, 29.08.25"
            const homeTeam = tds[1];
            const awayTeam = tds[3];
            const resultRaw = tds[4]; // e.g. "4:1 (2:0)" or "3:0* Abgesagt"

            // Look ahead for the details row
            let location = "";
            let time = "";
            let note = "";
            const homeEvents = [];
            const awayEvents = [];
            let homeGoals = [];
            let awayGoals = [];
            let homeCards = [];
            let awayCards = [];

            if (i + 1 < allTrs.length && allTrs[i + 1].raw.includes('details_')) {
                const detailsTr = allTrs[i + 1];
                const detailTds = [];
                let dMatch;
                const dRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                while ((dMatch = dRegex.exec(detailsTr.inner)) !== null) {
                    detailTds.push(dMatch[1]);
                }

                if (detailTds.length >= 1) {
                    const locText = cleanText(detailTds[0].replace(/<[^>]+>/g, ''));
                    if (locText.toLowerCase().includes('abgesagt')) {
                        note = locText;
                    } else {
                        // e.g. "DSG-Platz 18:00" or "Sportplatz Traun 19:00"
                        const parts = locText.split(' ');
                        const last = parts[parts.length - 1];
                        if (last && last.includes(':')) {
                            time = last;
                            location = parts.slice(0, -1).join(' ');
                        } else {
                            location = locText;
                        }
                    }
                }

                // Helper to extract events from cell html
                const extractEvents = (cellHtml, teamName) => {
                    if (!cellHtml) return { goals: [], cards: [] };
                    const goals = [];
                    const cards = [];

                    // Lines separated by <br>
                    const lines = cellHtml.split(/<br\s*[\/]?>/i);
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        const playerName = cleanText(trimmed.replace(/<[^>]+>/g, ''));
                        if (!playerName) continue;

                        // Count tor.gif
                        const torMatches = (trimmed.match(/tor\.gif/gi) || []).length;
                        for (let t = 0; t < torMatches; t++) {
                            goals.push({ player: playerName, team: teamName });
                        }

                        // Check cards
                        if (trimmed.includes('gelbrot')) {
                            cards.push({ player: playerName, team: teamName, type: 'yellowRed' });
                        } else if (trimmed.includes('rot.png') || trimmed.includes('rot.gif')) {
                            cards.push({ player: playerName, team: teamName, type: 'red' });
                        } else if (trimmed.includes('gelb')) {
                            cards.push({ player: playerName, team: teamName, type: 'yellow' });
                        }
                    }
                    return { goals, cards };
                };

                if (detailTds.length >= 2) {
                    const hE = extractEvents(detailTds[1], homeTeam);
                    homeGoals = hE.goals;
                    homeCards = hE.cards;
                }
                if (detailTds.length >= 3) {
                    const aE = extractEvents(detailTds[2], awayTeam);
                    awayGoals = aE.goals;
                    awayCards = aE.cards;
                }
            }

            // Parse score
            let scoreHome = null;
            let scoreAway = null;
            let htHome = null;
            let htAway = null;
            let status = 'Gespielt';

            if (resultRaw.toLowerCase().includes('abgesagt')) {
                if (resultRaw.includes('3:0')) {
                    status = 'Abgesagt 3:0';
                    scoreHome = 3;
                    scoreAway = 0;
                } else if (resultRaw.includes('0:3')) {
                    status = 'Abgesagt 0:3';
                    scoreHome = 0;
                    scoreAway = 3;
                } else {
                    status = 'Abgesagt';
                }
            } else if (resultRaw.includes(':')) {
                const scoreMatch = resultRaw.match(/(\d+):(\d+)(?:\s*\((\d+):(\d+)\))?/);
                if (scoreMatch) {
                    scoreHome = parseInt(scoreMatch[1]);
                    scoreAway = parseInt(scoreMatch[2]);
                    if (scoreMatch[3] && scoreMatch[4]) {
                        htHome = parseInt(scoreMatch[3]);
                        htAway = parseInt(scoreMatch[4]);
                    }
                }
            }

            // Parse date to YYYY-MM-DD
            // e.g. "Fr, 29.08.25"
            let formattedDate = dateStr;
            const datePartsMatch = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
            if (datePartsMatch) {
                const day = datePartsMatch[1].padStart(2, '0');
                const month = datePartsMatch[2].padStart(2, '0');
                let year = datePartsMatch[3];
                if (year.length === 2) year = '20' + year;
                formattedDate = `${year}-${month}-${day}`;
            }

            parsedMatches.push({
                round: currentRound,
                roundName: currentRoundName,
                date: formattedDate,
                rawDate: dateStr,
                time: time || '18:00',
                location: location || 'DSG-Platz',
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                scoreHome: scoreHome,
                scoreAway: scoreAway,
                htHome: htHome,
                htAway: htAway,
                status: status,
                note: note,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                homeCards: homeCards,
                awayCards: awayCards
            });
        }
    }
}

console.log(`\n🎉 Extracted ${parsedMatches.length} total matches!`);

// Calculate Standings
const standingsMap = {};
const teamsList = new Set();
parsedMatches.forEach(m => {
    if (m.homeTeam) teamsList.add(m.homeTeam);
    if (m.awayTeam) teamsList.add(m.awayTeam);
});

teamsList.forEach(t => {
    standingsMap[t] = {
        name: t,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        diff: 0,
        points: 0
    };
});

parsedMatches.forEach(m => {
    if (m.scoreHome !== null && m.scoreAway !== null) {
        const home = standingsMap[m.homeTeam];
        const away = standingsMap[m.awayTeam];
        if (home && away) {
            home.played++;
            away.played++;
            home.gf += m.scoreHome;
            home.ga += m.scoreAway;
            away.gf += m.scoreAway;
            away.ga += m.scoreHome;

            if (m.scoreHome > m.scoreAway) {
                home.won++;
                home.points += 3;
                away.lost++;
            } else if (m.scoreHome < m.scoreAway) {
                away.won++;
                away.points += 3;
                home.lost++;
            } else {
                home.drawn++;
                away.drawn++;
                home.points += 1;
                away.points += 1;
            }
        }
    }
});

const standings = Object.values(standingsMap).map(t => ({
    ...t,
    diff: t.gf - t.ga
})).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.gf - a.gf;
}).map((t, idx) => ({ id: idx + 1, ...t }));

// Calculate Top Scorers
const scorersMap = {};
parsedMatches.forEach(m => {
    [...m.homeGoals, ...m.awayGoals].forEach(g => {
        const key = `${g.player}_${g.team}`;
        if (!scorersMap[key]) {
            scorersMap[key] = { name: g.player, team: g.team, goals: 0 };
        }
        scorersMap[key].goals++;
    });
});
const topScorers = Object.values(scorersMap).sort((a, b) => b.goals - a.goals);

// Calculate Cards
const cardsMap = {};
parsedMatches.forEach(m => {
    [...m.homeCards, ...m.awayCards].forEach(c => {
        const key = `${c.player}_${c.team}`;
        if (!cardsMap[key]) {
            cardsMap[key] = { name: c.player, team: c.team, yellow: 0, yellowRed: 0, red: 0, suspension: "" };
        }
        if (c.type === 'yellow') cardsMap[key].yellow++;
        if (c.type === 'yellowRed') cardsMap[key].yellowRed++;
        if (c.type === 'red') cardsMap[key].red++;
    });
});
const cards = Object.values(cardsMap).sort((a, b) => {
    const ptsA = a.red * 5 + a.yellowRed * 3 + a.yellow;
    const ptsB = b.red * 5 + b.yellowRed * 3 + b.yellow;
    return ptsB - ptsA;
});

const fullSeason = {
    season: "2025/2026",
    teams: standings,
    matches: parsedMatches,
    stats: {
        topScorers: topScorers,
        cards: cards
    }
};

fs.writeFileSync(path.join(__dirname, 'season_2025_2026_calculated.json'), JSON.stringify(fullSeason, null, 2), 'utf-8');
console.log('✅ Calculated full season with Table, Scorers, Cards & Matches!');
console.log('\n🏆 Standings:');
standings.forEach(s => console.log(`${s.id}. ${s.name.padEnd(25)} Sp:${s.played} S:${s.won} U:${s.drawn} N:${s.lost} Tore:${s.gf}:${s.ga} (${s.diff}) Pkt:${s.points}`));

console.log('\n⚽ Top 5 Scorers:');
topScorers.slice(0, 5).forEach(s => console.log(`- ${s.name} (${s.team}): ${s.goals} Tore`));
