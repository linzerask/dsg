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
    console.log('🚀 Starte Browser für DSG Ligen-Scraper...');
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

    console.log('\n🔍 Lese verfügbare Ligen aus der Tabelle...');

    // Extract all league rows and their action links
    const leaguesList = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const list = [];
        for (const row of rows) {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length < 3) continue;
            
            const idText = cells[0]?.innerText.trim() || '';
            const nameText = cells[1]?.innerText.trim() || '';
            const yearText = cells[2]?.innerText.trim() || '';
            const links = Array.from(row.querySelectorAll('a'));

            if (idText) {
                list.push({
                    id: idText,
                    name: nameText,
                    year: yearText,
                    tabelle: links.find(a => a.innerText.includes('Tabelle'))?.href || null,
                    spielberichte: links.find(a => a.innerText.includes('Spielberichte'))?.href || null,
                    karten: links.find(a => a.innerText.includes('Karten'))?.href || null,
                    tore: links.find(a => a.innerText.includes('Tore'))?.href || null
                });
            }
        }
        return list;
    });

    if (leaguesList.length === 0) {
        console.error('❌ Keine Ligen in der Tabelle gefunden. Bitte stelle sicher, dass du auf der Ligen-Übersichtsseite bist.');
        await askQuestion('\nDrücke ENTER zum Beenden...');
        await browser.close();
        rl.close();
        return;
    }

    console.log('\n📋 Gefundene Ligen in deiner Datenbank:');
    leaguesList.forEach(l => {
        console.log(`   #${l.id.padEnd(4)} | Name: ${l.name.padEnd(20)} | Jahr: ${l.year.padEnd(10)}`);
    });

    console.log('\n======================================================');
    const choice = await askQuestion('👉 Welche Liga möchtest du scrapen? (Gib die ID ein, z.B. 1, oder "all" für alle): ');
    
    let targetLeagues = [];
    if (choice.trim().toLowerCase() === 'all') {
        targetLeagues = leaguesList;
    } else {
        const cleanId = choice.trim().replace(/^#/, '');
        const found = leaguesList.find(l => String(l.id) === String(cleanId));
        if (found) {
            targetLeagues = [found];
        } else {
            console.log(`⚠️ Liga #${cleanId} nicht gefunden. Standardmäßig wird die erste Liga gewählt.`);
            targetLeagues = [leaguesList[0]];
        }
    }

    const scrapeSingleLeague = async (league) => {
        console.log(`\n======================================================`);
        console.log(`🚀 Scrape Liga #${league.id}: "${league.name}" (${league.year})...`);
        console.log(`======================================================`);

        const resultData = {
            leagueId: league.id,
            name: league.name,
            year: league.year,
            scrapedAt: new Date().toISOString(),
            standings: [],
            scorers: [],
            cards: [],
            matches: []
        };

        // 1. SCRAPE TABELLE
        if (league.tabelle) {
            console.log('📊 1/4: Scrape Tabelle...');
            await page.goto(league.tabelle, { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1200));
            
            resultData.standings = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                return rows.map(r => {
                    const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                    if (cells.length < 3) return null;
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
                }).filter(Boolean);
            });
            console.log(`   ✅ ${resultData.standings.length} Tabellen-Einträge erfasst.`);
        }

        // 2. SCRAPE TORE (Torschützen)
        if (league.tore) {
            console.log('⚽ 2/4: Scrape Torschützenliste...');
            await page.goto(league.tore, { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1200));

            resultData.scorers = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                return rows.map(r => {
                    const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                    if (cells.length < 3) return null;
                    return {
                        rank: cells[0] || '',
                        player: cells[1] || '',
                        team: cells[2] || '',
                        goals: cells[3] || ''
                    };
                }).filter(Boolean);
            });
            console.log(`   ✅ ${resultData.scorers.length} Torschützen erfasst.`);
        }

        // 3. SCRAPE KARTEN
        if (league.karten) {
            console.log('🟨 3/4: Scrape Karten-Statistik...');
            await page.goto(league.karten, { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1200));

            resultData.cards = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                return rows.map(r => {
                    const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
                    if (cells.length < 3) return null;
                    return {
                        player: cells[0] || '',
                        team: cells[1] || '',
                        yellow: cells[2] || '0',
                        yellowRed: cells[3] || '0',
                        red: cells[4] || '0',
                        suspension: cells[5] || ''
                    };
                }).filter(Boolean);
            });
            console.log(`   ✅ ${resultData.cards.length} Karten erfasst.`);
        }

        // 4. SCRAPE SPIELBERICHTE / SPIELE
        if (league.spielberichte) {
            console.log('📅 4/4: Scrape Spielberichte...');
            await page.goto(league.spielberichte, { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1200));

            resultData.matches = await page.evaluate(() => {
                const allMatches = [];
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
            console.log(`   ✅ ${resultData.matches.length} Spielberichte erfasst.`);
        }

        // Save individual file
        const cleanName = (league.name || 'liga').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const cleanYear = (league.year || '').replace(/[^a-z0-9]/g, '_');
        const filename = `league_${league.id}_${cleanName}_${cleanYear}_raw.json`;
        const outPath = path.join(__dirname, filename);
        fs.writeFileSync(outPath, JSON.stringify(resultData, null, 2), 'utf-8');
        console.log(`💾 Gespeichert: scraper/${filename}`);

        return resultData;
    };

    const allResults = [];
    for (const l of targetLeagues) {
        const res = await scrapeSingleLeague(l);
        allResults.push(res);
    }

    if (allResults.length > 1) {
        const combinedPath = path.join(__dirname, 'all_leagues_scraped.json');
        fs.writeFileSync(combinedPath, JSON.stringify(allResults, null, 2), 'utf-8');
        console.log(`\n🎉 Alle ${allResults.length} Ligen wurden erfolgreich zusammengefasst in: scraper/all_leagues_scraped.json`);
    }

    console.log(`\n✅ Scraping erfolgreich abgeschlossen!`);
    await askQuestion('\nDrücke ENTER zum Schließen des Browsers...');
    await browser.close();
    rl.close();
})();
