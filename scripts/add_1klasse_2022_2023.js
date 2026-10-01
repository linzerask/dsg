const fs = require('fs');
const path = require('path');

const parsed = JSON.parse(fs.readFileSync(path.join(__dirname, '../scraper/parsed_2022_2023_1klasse.json'), 'utf8'));

// 1. Calculate Standings, Scorers, Cards for 1. Klasse 2022/2023
const teamsMap = new Map();
parsed.teams.forEach((name, idx) => {
    teamsMap.set(name, {
        id: idx + 1,
        name: name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        logo: 'stadion.png',
        rank: idx + 1
    });
});

const scorersMap = new Map();
const cardsMap = new Map();

parsed.matches.forEach(m => {
    if (m.status === 'Gespielt' && m.score && m.score.includes(':')) {
        const parts = m.score.split(':');
        const gHome = parseInt(parts[0]);
        const gAway = parseInt(parts[1]);
        
        const homeT = teamsMap.get(m.home);
        const awayT = teamsMap.get(m.away);
        
        if (homeT && awayT) {
            homeT.played++;
            awayT.played++;
            homeT.goalsFor += gHome;
            homeT.goalsAgainst += gAway;
            awayT.goalsFor += gAway;
            awayT.goalsAgainst += gHome;
            
            if (gHome > gAway) {
                homeT.won++;
                homeT.points += 3;
                awayT.lost++;
            } else if (gHome < gAway) {
                awayT.won++;
                awayT.points += 3;
                homeT.lost++;
            } else {
                homeT.drawn++;
                homeT.points += 1;
                awayT.drawn++;
                awayT.points += 1;
            }
        }
    }
    
    // Process Disciplinary & Goal Events
    if (m.events && Array.isArray(m.events)) {
        m.events.forEach(e => {
            if (e.type === 'goal') {
                const sKey = e.player + '___' + e.team;
                if (!scorersMap.has(sKey)) {
                    scorersMap.set(sKey, { name: e.player, team: e.team, goals: 0 });
                }
                scorersMap.get(sKey).goals++;
            } else if (e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'red') {
                const cKey = e.player + '___' + e.team;
                if (!cardsMap.has(cKey)) {
                    cardsMap.set(cKey, { name: e.player, team: e.team, yellow: 0, yellowRed: 0, red: 0 });
                }
                const cardEntry = cardsMap.get(cKey);
                if (e.type === 'yellow') cardEntry.yellow++;
                if (e.type === 'yellowRed') { cardEntry.yellow += 2; cardEntry.red += 1; }
                if (e.type === 'red') cardEntry.red++;
            }
        });
    }
});

const sortedTeams = Array.from(teamsMap.values()).map(t => {
    t.goalDiff = t.goalsFor - t.goalsAgainst;
    t.diff = (t.goalsFor) + ':' + (t.goalsAgainst);
    t.gf = t.goalsFor;
    t.ga = t.goalsAgainst;
    return t;
}).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
}).map((t, i) => ({ ...t, rank: i + 1 }));

const sortedScorers = Array.from(scorersMap.values()).sort((a, b) => b.goals - a.goals);
const sortedCards = Array.from(cardsMap.values()).sort((a, b) => {
    const ptsB = b.red * 3 + b.yellow;
    const ptsA = a.red * 3 + a.yellow;
    if (ptsB !== ptsA) return ptsB - ptsA;
    if (b.red !== a.red) return b.red - a.red;
    return b.yellow - a.yellow;
});

// 2. Update Website/data/liga.json
const ligaPath = path.join(__dirname, '../Website/data/liga.json');
const ligaData = JSON.parse(fs.readFileSync(ligaPath, 'utf8'));

if (!ligaData.seasons) ligaData.seasons = {};

ligaData.seasons['2022/2023_1klasse'] = {
    name: "1. Klasse 2022/2023",
    year: "2022/2023",
    teams: sortedTeams,
    matches: parsed.matches,
    stats: {
        topScorers: sortedScorers,
        cards: sortedCards
    }
};

fs.writeFileSync(ligaPath, JSON.stringify(ligaData, null, 2));
console.log('Updated liga.json with 2022/2023_1klasse.');

// 3. Update Website/data/leagues.json
const leaguesPath = path.join(__dirname, '../Website/data/leagues.json');
let leaguesList = [];
try {
    leaguesList = JSON.parse(fs.readFileSync(leaguesPath, 'utf8'));
} catch(e) {}

const dsgLigaLeague = leaguesList.find(l => l.seasonKey === '2022/2023' || (l.name === 'DSG Liga' && l.year === '2022/2023')) || {
    id: 1,
    name: "DSG Liga",
    year: "2022/2023",
    seasonKey: "2022/2023",
    status: "Aktiv",
    showOnHomepage: true
};

const firstKlasseLeague = {
    id: 2,
    name: "1. Klasse",
    year: "2022/2023",
    seasonKey: "2022/2023_1klasse",
    status: "Aktiv",
    showOnHomepage: true
};

leaguesList = [dsgLigaLeague, firstKlasseLeague];
fs.writeFileSync(leaguesPath, JSON.stringify(leaguesList, null, 2));
console.log('Updated leagues.json with DSG Liga (id 1) and 1. Klasse (id 2).');

// 4. Update Website/data/rounds.json
const roundsPath = path.join(__dirname, '../Website/data/rounds.json');
let roundsList = [];
try {
    roundsList = JSON.parse(fs.readFileSync(roundsPath, 'utf8'));
} catch(e) {}

// Filter existing rounds to only keep DSG Liga rounds, then append 1. Klasse rounds
const cleanDsgRounds = roundsList.filter(r => r.seasonKey === '2022/2023' || (!r.seasonKey && r.saison === 'DSG Liga'));

const new1KlasseRounds = parsed.rounds.map((r, idx) => ({
    id: cleanDsgRounds.length + idx + 1,
    saison: "1. Klasse",
    jahr: "2022/2023",
    runde: r.runde,
    datum: r.datum,
    datumVon: r.datumVon,
    datumBis: r.datumBis,
    liga: "1. Klasse",
    seasonKey: "2022/2023_1klasse",
    status: "Aktiv"
}));

const allRoundsCombined = [...cleanDsgRounds, ...new1KlasseRounds];
fs.writeFileSync(roundsPath, JSON.stringify(allRoundsCombined, null, 2));
console.log('Updated rounds.json with ' + allRoundsCombined.length + ' total rounds.');
