const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

(async () => {
    console.log('🚀 Starte Browser für Liga #13 (Saison 25/26)...');
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    
    const page = await browser.newPage();
    await page.goto('https://customer.js-hosting.at/dsgfussball/login', { waitUntil: 'domcontentloaded' });
    
    console.log('\n======================================================');
    console.log('✅ Browser geöffnet!');
    console.log('👉 SCHRITT 1: Bitte im Browser einloggen.');
    console.log('👉 SCHRITT 2: Gehe auf "Liga" (Übersicht der Ligen).');
    console.log('======================================================\n');
    
    await askQuestion('🟢 Drücke ENTER, sobald du eingeloggt bist und die Ligen-Tabelle siehst...');

    console.log('\n🔍 Analysiere Links für Liga #13 (2026)...');

    // Extract links for row #13
    const leagueLinks = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        for (const row of rows) {
            const firstCell = row.querySelector('td');
            if (firstCell && firstCell.innerText.trim() === '13') {
                const links = Array.from(row.querySelectorAll('a'));
                return {
                    found: true,
                    tabelle: links.find(a => a.innerText.includes('Tabelle'))?.href,
                    spielberichte: links.find(a => a.innerText.includes('Spielberichte'))?.href,
                    karten: links.find(a => a.innerText.includes('Karten'))?.href,
                    tore: links.find(a => a.innerText.includes('Tore'))?.href
                };
            }
        }
        return { found: false };
    });

    console.log('📌 Gefundene Links:', leagueLinks);

    const resultData = {
        season: "2025/2026",
        leagueId: 13,
        name: "Liga 2025/26",
        standings: [],
        matches: [],
        cards: [],
        scorers: []
    };

    // 1. SCRAPE TABELLE
    if (leagueLinks.tabelle) {
        console.log('\n📊 1/4: Scrape Tabelle...');
        await page.goto(leagueLinks.tabelle, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));
        
        resultData.standings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(r => {
                const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                return {
                    rank: cells[0] || '',
                    team: cells[1] || '',
                    played: cells[2] || '',
                    won: cells[3] || '',
                    drawn: cells[4] || '',
                    lost: cells[5] || '',
                    goals: cells[6] || '',
                    diff: cells[7] || '',
                    points: cells[8] || ''
                };
            }).filter(x => x.team);
        });
        console.log(`✅ Tabelle erfasst (${resultData.standings.length} Teams)`);
    }

    // 2. SCRAPE TORE (Torschützen)
    if (leagueLinks.tore) {
        console.log('\n⚽ 2/4: Scrape Torschützenliste...');
        await page.goto(leagueLinks.tore, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));

        resultData.scorers = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(r => {
                const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                return {
                    rank: cells[0] || '',
                    player: cells[1] || '',
                    team: cells[2] || '',
                    goals: cells[3] || ''
                };
            }).filter(x => x.player);
        });
        console.log(`✅ Torschützen erfasst (${resultData.scorers.length} Spieler)`);
    }

    // 3. SCRAPE KARTEN
    if (leagueLinks.karten) {
        console.log('\n🟨 3/4: Scrape Karten-Statistik...');
        await page.goto(leagueLinks.karten, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));

        resultData.cards = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(r => {
                const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                return {
                    player: cells[0] || '',
                    team: cells[1] || '',
                    yellow: cells[2] || '0',
                    yellowRed: cells[3] || '0',
                    red: cells[4] || '0',
                    suspension: cells[5] || ''
                };
            }).filter(x => x.player);
        });
        console.log(`✅ Karten erfasst (${resultData.cards.length} Einträge)`);
    }

    // 4. SCRAPE SPIELBERICHTE / SPIELE
    if (leagueLinks.spielberichte) {
        console.log('\n📅 4/4: Scrape Spielberichte...');
        await page.goto(leagueLinks.spielberichte, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));

        resultData.matches = await page.evaluate(() => {
            const allMatches = [];
            // Try detecting table or list of matches
            const tables = Array.from(document.querySelectorAll('table'));
            tables.forEach(table => {
                const rows = Array.from(table.querySelectorAll('tbody tr, tr'));
                rows.forEach(r => {
                    const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                    if (cells.length >= 4) {
                        allMatches.push(cells);
                    }
                });
            });
            return allMatches;
        });
        console.log(`✅ Spielberichte erfasst (${resultData.matches.length} Zeilen)`);
    }

    // Save to disk
    const outPath = path.join(__dirname, 'season_25_26_raw.json');
    fs.writeFileSync(outPath, JSON.stringify(resultData, null, 2), 'utf-8');
    console.log(`\n🎉 FERTIG! Daten wurden gespeichert in: ${outPath}`);

    await askQuestion('\nDrücke ENTER zum Schließen des Browsers...');
    await browser.close();
    rl.close();
})();
