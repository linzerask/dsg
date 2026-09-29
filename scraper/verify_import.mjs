import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    console.log('Navigating to http://localhost:8000 ...');
    await page.goto('http://localhost:8000/#/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    const syncResult = await page.evaluate(async () => {
        try {
            const storeModule = await import('./js/store.js?v=' + Date.now());
            const store = storeModule.Store;
            const fb = await import('./js/firebase.js?v=' + Date.now());
            const firestore = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const [ligaRes, leaguesRes, roundsRes] = await Promise.all([
                fetch('data/liga.json'),
                fetch('data/leagues.json'),
                fetch('data/rounds.json')
            ]);
            
            const ligaData = await ligaRes.json();
            const leaguesData = await leaguesRes.json();
            const roundsData = await roundsRes.json();
            
            const now = Date.now();
            
            await Promise.all([
                firestore.setDoc(firestore.doc(fb.db, 'system', 'liga_data'), { data: ligaData, lastUpdated: now }),
                firestore.setDoc(firestore.doc(fb.db, 'system', 'leagues_data'), { data: leaguesData, lastUpdated: now }),
                firestore.setDoc(firestore.doc(fb.db, 'system', 'rounds_data'), { data: roundsData, lastUpdated: now })
            ]);
            
            store.saveData(ligaData);
            store.saveAdminLeagues(leaguesData);
            store.saveAdminRounds(roundsData);
            
            return {
                success: true,
                seasons: Object.keys(ligaData.seasons),
                leaguesCount: leaguesData.length,
                roundsCount: roundsData.length,
                matchesCount: ligaData.seasons['2022/2023']?.matches?.length
            };
        } catch(e) {
            return { success: false, error: e.toString() };
        }
    });

    console.log('Sync result:', syncResult);

    // Screenshot Homepage
    await page.goto('http://localhost:8000/#/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_home_2022.png', fullPage: true });

    // Screenshot Liga
    await page.goto('http://localhost:8000/#/liga', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_2022.png', fullPage: true });

    // Screenshot Stats
    await page.goto('http://localhost:8000/#/statistiken', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_stats_2022.png', fullPage: true });

    // Screenshot Admin Games
    await page.goto('http://localhost:8000/#/admin?tab=games', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2022.png', fullPage: true });

    // Screenshot Admin Rounds
    await page.goto('http://localhost:8000/#/admin?tab=rounds', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_2022.png', fullPage: true });

    // Screenshot Admin Leagues
    await page.goto('http://localhost:8000/#/admin?tab=leagues', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_leagues_2022.png', fullPage: true });

    await browser.close();
    console.log('Verification finished successfully!');
})();
