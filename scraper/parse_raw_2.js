const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_berichte_2.json'), 'utf8'));
const html = rawData.html;

// Split by green-col (rounds)
const roundParts = html.split(/<tr class="green-col"[^>]*>/i);

const parsedRounds = [];
const allMatches = [];
const teamStats = {};
const allScorers = {};
const allCards = {};

let matchIdCounter = 1;

roundParts.forEach((part, roundIdx) => {
    if (roundIdx === 0) return;
    
    // Extract round header
    const thMatch = part.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
    if (!thMatch) return;
    
    const roundTitle = thMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    // E.g. "1. Runde (27.08. -22.10.2022)"
    const rundeNumMatch = roundTitle.match(/(\d+)\.\s*Runde/i);
    const rundeNum = rundeNumMatch ? rundeNumMatch[1] : String(roundIdx);
    
    // Extract dates
    let datumVon = '';
    let datumBis = '';
    let datumFull = '';
    const dateRangeMatch = roundTitle.match(/\((.*?)\)/);
    if (dateRangeMatch) {
        datumFull = dateRangeMatch[1].trim();
        const dParts = datumFull.split('-').map(s => s.trim());
        if (dParts.length === 2) {
            let p1 = dParts[0];
            let p2 = dParts[1];
            // If p1 is like "27.08." and p2 is "22.10.2022"
            if (p2.includes('.')) {
                const p2Parts = p2.split('.');
                const yr = p2Parts[p2Parts.length - 1];
                if (!p1.endsWith(yr)) {
                    p1 = p1.endsWith('.') ? p1 + yr : p1 + '.' + yr;
                }
            }
            datumVon = p1;
            datumBis = p2;
        }
    }
    
    parsedRounds.push({
        id: roundIdx,
        saison: "1. Klasse",
        jahr: "2022/2023",
        runde: rundeNum,
        datum: datumFull || roundTitle,
        datumVon: datumVon || '',
        datumBis: datumBis || '',
        liga: "1. Klasse",
        seasonKey: "2022/2023_1klasse",
        status: "Aktiv"
    });
    
    // Now split matches in this round by <tr class="clicker"
    const matchChunks = part.split(/<tr class="clicker"[^>]*>/i);
    
    for (let mIdx = 1; mIdx < matchChunks.length; mIdx++) {
        const mChunk = matchChunks[mIdx];
        
        // Find td elements before id="details_
        const detailsPos = mChunk.indexOf('id="details_');
        const mainRowHtml = detailsPos !== -1 ? mChunk.substring(0, detailsPos) : mChunk;
        
        const tdMatches = Array.from(mainRowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi))
            .map(m => m[1].replace(/<[^>]+>/g, '').trim());
            
        if (tdMatches.length < 5) continue;
        
        const rawDate = tdMatches[0]; // e.g. "Sa, 27.08.22"
        const homeTeam = tdMatches[1];
        const awayTeam = tdMatches[3];
        const rawScore = tdMatches[4]; // e.g. "5:3 (2:2)" or ": (:)"
        
        if (!homeTeam || !awayTeam) continue;
        
        // Normalize date to DD.MM.YYYY
        let normDate = rawDate;
        let weekday = '';
        if (rawDate.includes(',')) {
            const dp = rawDate.split(',');
            weekday = dp[0].trim();
            normDate = dp[1].trim();
        }
        if (normDate.includes('.')) {
            const parts = normDate.split('.');
            if (parts.length === 3) {
                let d = parts[0].padStart(2, '0');
                let m = parts[1].padStart(2, '0');
                let y = parts[2];
                if (y.length === 2) y = '20' + y;
                normDate = `${d}.${m}.${y}`;
            }
        }
        
        // Normalize score & halftime
        let displayScore = '-:-';
        let halftime = '';
        let status = 'Ausstehend';
        
        if (rawScore && rawScore.includes(':') && rawScore !== ': (:)' && rawScore !== '-:-') {
            const scMatch = rawScore.match(/(\d+)\s*:\s*(\d+)/);
            if (scMatch) {
                displayScore = `${scMatch[1]}:${scMatch[2]}`;
                status = 'Gespielt';
                
                const htMatch = rawScore.match(/\((\d+)\s*:\s*(\d+)\)/);
                if (htMatch) {
                    halftime = `${htMatch[1]}:${htMatch[2]}`;
                }
            }
        }
        
        // Extract venue & time & events from details
        let venue = '';
        let time = '';
        const events = [];
        
        if (detailsPos !== -1) {
            const detailsHtml = mChunk.substring(detailsPos);
            
            // Extract venue & time from <td colspan="1" class="datum">Sportplatz DSG Traun 15:00</td>
            const venueMatch = detailsHtml.match(/<td[^>]*class="datum"[^>]*>([\s\S]*?)<\/td>/i);
            if (venueMatch) {
                const venueText = venueMatch[1].replace(/<[^>]+>/g, '').trim();
                // E.g. "Sportplatz DSG Traun 15:00"
                const timeMatch = venueText.match(/(\d{1,2}:\d{2})/);
                if (timeMatch) {
                    time = timeMatch[1];
                    venue = venueText.replace(timeMatch[1], '').trim();
                } else {
                    venue = venueText;
                }
            }
            
            // Extract home side and away side events from <td colspan="2">...</td>
            const sideMatches = Array.from(detailsHtml.matchAll(/<td colspan="2"[^>]*>([\s\S]*?)<\/td>/gi));
            
            sideMatches.forEach((side, sIdx) => {
                const sideTeam = sIdx === 0 ? homeTeam : awayTeam;
                const isHome = sIdx === 0;
                const sideContent = side[1];
                
                const lines = sideContent.split(/<br\s*\/?>/i);
                lines.forEach(line => {
                    const cleanText = line.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                    if (!cleanText) return;
                    
                    const torCount = (line.match(/tor\.(gif|png|jpg)/gi) || []).length;
                    const gelbCount = (line.match(/gelb\.png/gi) || []).length;
                    const gelbrotCount = (line.match(/gelbrot\.(jpg|png)/gi) || []).length;
                    const rotCount = (line.match(/rot\.png/gi) || []).length;
                    
                    if (torCount > 0) {
                        for (let t = 0; t < torCount; t++) {
                            events.push({
                                type: 'goal',
                                player: cleanText,
                                team: sideTeam,
                                isHome: isHome
                            });
                        }
                    }
                    if (gelbCount > 0) {
                        events.push({
                            type: 'yellow',
                            player: cleanText,
                            team: sideTeam,
                            isHome: isHome
                        });
                    }
                    if (gelbrotCount > 0) {
                        events.push({
                            type: 'yellowRed',
                            player: cleanText,
                            team: sideTeam,
                            isHome: isHome
                        });
                    }
                    if (rotCount > 0) {
                        events.push({
                            type: 'red',
                            player: cleanText,
                            team: sideTeam,
                            isHome: isHome
                        });
                    }
                });
            });
        }
        
        allMatches.push({
            id: matchIdCounter++,
            round: `${rundeNum}. Runde`,
            runde: rundeNum,
            date: normDate,
            time: time,
            home: homeTeam,
            away: awayTeam,
            score: displayScore,
            ht: halftime,
            status: status,
            venue: venue,
            location: venue,
            events: events,
            seasonKey: "2022/2023_1klasse"
        });
    }
});

console.log('Total parsed rounds:', parsedRounds.length);
console.log('Total parsed matches:', allMatches.length);
console.log('Sample match:', JSON.stringify(allMatches[0], null, 2));

// Calculate Teams, Scorers, Cards
const teamsSet = new Set();
allMatches.forEach(m => {
    teamsSet.add(m.home);
    teamsSet.add(m.away);
});
console.log('Unique teams (' + teamsSet.size + '):', Array.from(teamsSet));

fs.writeFileSync(path.join(__dirname, 'parsed_2022_2023_1klasse.json'), JSON.stringify({
    rounds: parsedRounds,
    matches: allMatches,
    teams: Array.from(teamsSet)
}, null, 2));
