const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_berichte.json'), 'utf-8'));
const html = raw.html;

const cleanText = (str) => str.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Split by table rows
const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
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
            const dateStr = tds[0]; // e.g. "Sa, 29.08.26"
            const homeTeam = tds[1];
            const awayTeam = tds[3];
            const resultRaw = tds[4]; // e.g. "0:7 (0:4)", "3:0* Abgesagt", ": (:)"

            // Look ahead for details row
            let location = "";
            let time = "";
            let note = "";
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
                    } else if (locText) {
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

                // Helper to extract events
                const extractEvents = (cellHtml, teamName) => {
                    if (!cellHtml) return { goals: [], cards: [] };
                    const goals = [];
                    const cards = [];
                    
                    const lines = cellHtml.split(/<br\s*\/?>/i);
                    for (let line of lines) {
                        line = line.trim();
                        if (!line) continue;
                        
                        // Count goals
                        const goalMatches = line.match(/imgs\/tor\.gif/g) || line.match(/alt=["']tor["']/g);
                        const goalCount = goalMatches ? goalMatches.length : 0;
                        
                        // Check yellow card
                        const hasYellow = line.includes('imgs/gelb.png') || line.includes('alt="gelb"');
                        const hasGelbRot = line.includes('imgs/gelbrot.png') || line.includes('alt="gelbrot"') || line.includes('gelb-rot');
                        const hasRot = line.includes('imgs/rot.png') || line.includes('alt="rot"');
                        
                        const playerName = cleanText(line.replace(/<[^>]+>/g, ''));
                        if (!playerName) continue;
                        
                        if (goalCount > 0) {
                            for (let g = 0; g < goalCount; g++) {
                                goals.push({ player: playerName, team: teamName });
                            }
                        }
                        if (hasGelbRot) {
                            cards.push({ player: playerName, team: teamName, type: 'yellowRed' });
                        } else if (hasRot) {
                            cards.push({ player: playerName, team: teamName, type: 'red' });
                        } else if (hasYellow) {
                            cards.push({ player: playerName, team: teamName, type: 'yellow' });
                        }
                    }
                    return { goals, cards };
                };

                if (detailTds.length >= 3) {
                    const homeEv = extractEvents(detailTds[1], homeTeam);
                    const awayEv = extractEvents(detailTds[2], awayTeam);
                    homeGoals = homeEv.goals;
                    homeCards = homeEv.cards;
                    awayGoals = awayEv.goals;
                    awayCards = awayEv.cards;
                }
            }

            // Parse result
            let scoreHome = null;
            let scoreAway = null;
            let htHome = null;
            let htAway = null;
            let status = "Upcoming";

            // Format standard ISO date from "Sa, 29.08.26" -> "2026-08-29"
            let formattedDate = dateStr;
            const dParts = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
            if (dParts) {
                const day = dParts[1].padStart(2, '0');
                const month = dParts[2].padStart(2, '0');
                let yr = dParts[3];
                if (yr.length === 2) yr = '20' + yr;
                formattedDate = `${yr}-${month}-${day}`;
            }

            if (resultRaw.includes('*') && resultRaw.toLowerCase().includes('abgesagt')) {
                // e.g. "3:0* Abgesagt" or "0:3* Abgesagt"
                const scoreMatch = resultRaw.match(/(\d+):(\d+)/);
                if (scoreMatch) {
                    scoreHome = parseInt(scoreMatch[1]);
                    scoreAway = parseInt(scoreMatch[2]);
                    status = (scoreHome === 3 && scoreAway === 0) ? 'Abgesagt 3:0' : 'Abgesagt 0:3';
                } else {
                    status = 'Canceled';
                }
            } else if (resultRaw.match(/\d+:\d+/)) {
                const fullMatch = resultRaw.match(/(\d+):(\d+)\s*(?:\((\d+):(\d+)\))?/);
                if (fullMatch) {
                    scoreHome = parseInt(fullMatch[1]);
                    scoreAway = parseInt(fullMatch[2]);
                    if (fullMatch[3] !== undefined && fullMatch[4] !== undefined) {
                        htHome = parseInt(fullMatch[3]);
                        htAway = parseInt(fullMatch[4]);
                    }
                    status = "Played";
                }
            } else {
                status = "Upcoming";
            }

            parsedMatches.push({
                round: currentRound,
                roundName: currentRoundName,
                dateStr: dateStr,
                date: formattedDate,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                resultRaw: resultRaw,
                scoreHome: scoreHome,
                scoreAway: scoreAway,
                htHome: htHome,
                htAway: htAway,
                status: status,
                location: location,
                time: time,
                note: note,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                homeCards: homeCards,
                awayCards: awayCards
            });
        }
    }
}

console.log(`Parsed ${parsedMatches.length} matches across all rounds.`);

// 2. Discover all teams
const teamNamesSet = new Set();
parsedMatches.forEach(m => {
    if (m.homeTeam) teamNamesSet.add(m.homeTeam);
    if (m.awayTeam) teamNamesSet.add(m.awayTeam);
});

const teamList = Array.from(teamNamesSet).map((name, idx) => ({
    id: idx + 1,
    name: name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0
}));

console.log('Discovered Teams:', teamList.map(t => t.name));

// 3. Compute standings & stats from played and verified cancelled matches
const scorersMap = {};
const cardsMap = {};

parsedMatches.forEach(m => {
    if (m.status === 'Played' || m.status === 'Abgesagt 3:0' || m.status === 'Abgesagt 0:3') {
        const homeT = teamList.find(t => t.name === m.homeTeam);
        const awayT = teamList.find(t => t.name === m.awayTeam);
        
        if (homeT && awayT && m.scoreHome !== null && m.scoreAway !== null) {
            homeT.played++;
            awayT.played++;
            homeT.gf += m.scoreHome;
            homeT.ga += m.scoreAway;
            awayT.gf += m.scoreAway;
            awayT.ga += m.scoreHome;
            
            if (m.scoreHome > m.scoreAway) {
                homeT.won++;
                homeT.points += 3;
                awayT.lost++;
            } else if (m.scoreHome < m.scoreAway) {
                awayT.won++;
                awayT.points += 3;
                homeT.lost++;
            } else {
                homeT.drawn++;
                awayT.drawn++;
                homeT.points += 1;
                awayT.points += 1;
            }
        }
    }

    // Tally scorers
    [...(m.homeGoals || []), ...(m.awayGoals || [])].forEach(g => {
        const key = `${g.player}_${g.team}`;
        if (!scorersMap[key]) {
            scorersMap[key] = { name: g.player, team: g.team, goals: 0 };
        }
        scorersMap[key].goals++;
    });

    // Tally cards
    [...(m.homeCards || []), ...(m.awayCards || [])].forEach(c => {
        const key = `${c.player}_${c.team}`;
        if (!cardsMap[key]) {
            cardsMap[key] = { name: c.player, team: c.team, yellow: 0, yellowRed: 0, red: 0 };
        }
        if (c.type === 'yellow') cardsMap[key].yellow++;
        if (c.type === 'yellowRed') cardsMap[key].yellowRed++;
        if (c.type === 'red') cardsMap[key].red++;
    });
});

// Calculate differences
teamList.forEach(t => {
    t.diff = t.gf - t.ga;
});

// Sort Standings
teamList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.gf - a.gf;
});

// Sort Scorers
const topScorers = Object.values(scorersMap).sort((a, b) => b.goals - a.goals).map((s, idx) => ({
    rank: idx + 1,
    name: s.name,
    team: s.team,
    goals: s.goals
}));

// Sort Cards
const cardList = Object.values(cardsMap).sort((a, b) => {
    const ptsB = b.red * 5 + b.yellowRed * 3 + b.yellow;
    const ptsA = a.red * 5 + a.yellowRed * 3 + a.yellow;
    if (ptsB !== ptsA) return ptsB - ptsA;
    return b.red - a.red;
}).map((c, idx) => ({
    rank: idx + 1,
    name: c.name,
    team: c.team,
    yellow: c.yellow,
    yellowRed: c.yellowRed,
    red: c.red
}));

console.log('\n--- 2026/2027 STANDINGS ---');
teamList.forEach((t, i) => {
    console.log(`${i + 1}. ${t.name.padEnd(24)} | Sp:${t.played} S:${t.won} U:${t.drawn} N:${t.lost} | ${t.gf}:${t.ga} (${t.diff >= 0 ? '+' : ''}${t.diff}) | Pkt: ${t.points}`);
});

console.log('\n--- TOP SCORERS ---');
topScorers.slice(0, 5).forEach(s => console.log(`${s.rank}. ${s.name} (${s.team}): ${s.goals} Tore`));

// Format matches for schema
const formattedSchedule = parsedMatches.map((m, idx) => {
    const events = [];
    (m.homeGoals || []).forEach(g => events.push({ type: 'goal', name: g.player, player: g.player, team: m.homeTeam }));
    (m.awayGoals || []).forEach(g => events.push({ type: 'goal', name: g.player, player: g.player, team: m.awayTeam }));
    (m.homeCards || []).forEach(c => events.push({ type: c.type, name: c.player, player: c.player, team: m.homeTeam }));
    (m.awayCards || []).forEach(c => events.push({ type: c.type, name: c.player, player: c.player, team: m.awayTeam }));

    let scoreStr = '-:-';
    if (m.scoreHome !== null && m.scoreAway !== null) {
        scoreStr = `${m.scoreHome}:${m.scoreAway}`;
    }
    let htStr = '';
    if (m.htHome !== null && m.htAway !== null) {
        htStr = `${m.htHome}:${m.htAway}`;
    }

    return {
        id: `2026_2027_${idx + 1}`,
        round: `${m.round}. Runde`,
        date: m.date,
        time: m.time || '18:00',
        location: m.location || 'DSG-Platz',
        home: m.homeTeam,
        away: m.awayTeam,
        score: scoreStr,
        ht: htStr,
        status: m.status,
        note: m.note || '',
        events: events,
        scorers: events.filter(e => e.type === 'goal'),
        cards: events.filter(e => e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'red')
    };
});

const season2026_2027_Data = {
    teams: teamList,
    stats: {
        topScorers: topScorers,
        cards: cardList
    },
    matches: formattedSchedule,
    schedule: formattedSchedule
};

// Save calculated JSON
const outputPath = path.join(__dirname, 'season_2026_2027_calculated.json');
fs.writeFileSync(outputPath, JSON.stringify(season2026_2027_Data, null, 2), 'utf-8');
console.log(`\n💾 Saved calculated season to: ${outputPath}`);

// 4. Update Website/data/liga.json
const ligaJsonPath = path.join(__dirname, '..', 'Website', 'data', 'liga.json');
let ligaJson = JSON.parse(fs.readFileSync(ligaJsonPath, 'utf-8'));

// Inject into 2026/2027
if (!ligaJson.seasons) ligaJson.seasons = {};
ligaJson.seasons['2026/2027'] = season2026_2027_Data;
// Also update root properties for current season compatibility
ligaJson.currentSeason = '2026/2027';
ligaJson.teams = teamList;
ligaJson.stats = season2026_2027_Data.stats;
ligaJson.matches = formattedSchedule;

fs.writeFileSync(ligaJsonPath, JSON.stringify(ligaJson, null, 2), 'utf-8');
console.log('✅ Updated Website/data/liga.json with 2026/2027 data');

// 5. Update Website/js/store.js
const storePath = path.join(__dirname, '..', 'Website', 'js', 'store.js');
let storeContent = fs.readFileSync(storePath, 'utf-8');

// Bump cache keys to v39
storeContent = storeContent.replace(/dsg_data_v37/g, 'dsg_data_v39');
storeContent = storeContent.replace(/dsg_data_v38/g, 'dsg_data_v39');
storeContent = storeContent.replace(/loadLocal\('dsg_data',\s*\d+\)/g, "loadLocal('dsg_data', 39)");

// Replace seasons["2026/2027"] in store.js
const season2627Regex = /"2026\/2027":\s*\{[\s\S]*?\n\s*\}/m;
const newSeason2627Str = `"2026/2027": ${JSON.stringify(season2026_2027_Data, null, 8).trim()}`;

if (season2627Regex.test(storeContent)) {
    storeContent = storeContent.replace(season2627Regex, newSeason2627Str);
    console.log('✅ Replaced 2026/2027 season in INITIAL_DATA in store.js');
} else {
    console.warn('⚠️ Could not find 2026/2027 regex in store.js, appending/updating...');
}

fs.writeFileSync(storePath, storeContent, 'utf-8');
console.log('✅ Updated Website/js/store.js with v39 cache key and current season');
