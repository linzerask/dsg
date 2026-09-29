import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Catch errors and console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    console.log('Navigating to http://localhost:8000 ...');
    await page.goto('http://localhost:8000/#/', { waitUntil: 'networkidle0' });

    // Wait a moment for Firebase sync to trigger
    await new Promise(r => setTimeout(r, 2000));

    // Evaluate Firestore sync directly inside browser context
    const syncResult = await page.evaluate(async () => {
        try {
            const store = window.__DSG_STORE__ || (await import('./js/store.js?v=' + Date.now())).Store;
            const fb = await import('./js/firebase.js?v=' + Date.now());
            const firestore = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            // Read fresh data from files
            const [ligaRes, leaguesRes, roundsRes] = await Promise.all([
                fetch('data/liga.json'),
                fetch('data/leagues.json'),
                fetch('data/rounds.json')
            ]);
            
            const ligaData = await ligaRes.json();
            const leaguesData = await leaguesRes.json();
            const roundsData = await roundsRes.json();
            
            const now = Date.now();
            
            // Save to Firestore
            await Promise.all([
                firestore.setDoc(firestore.doc(fb.db, 'system', 'liga_data'), { data: ligaData, lastUpdated: now }),
                firestore.setDoc(firestore.doc(fb.db, 'system', 'leagues_data'), { data: leaguesData, lastUpdated: now }),
                firestore.setDoc(firestore.doc(fb.db, 'system', 'rounds_data'), { data: roundsData, lastUpdated: now })
            ]);
            
            // Update local memory & storage
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

    // Take screenshot of Homepage
    await page.goto('http://localhost:8000/#/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_home_2022.png', fullPage: true });

    // Take screenshot of Liga tab
    await page.goto('http://localhost:8000/#/liga', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_2022.png', fullPage: true });

    // Take screenshot of Stats tab
    await page.goto('http://localhost:8000/#/statistiken', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_stats_2022.png', fullPage: true });

    // Take screenshot of Admin Games tab
    await page.goto('http://localhost:8000/#/admin?tab=games', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2022.png', fullPage: true });

    // Take screenshot of Admin Rounds tab
    await page.goto('http://localhost:8000/#/admin?tab=rounds', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_2022.png', fullPage: true });

    // Take screenshot of Admin Leagues tab
    await page.goto('http://localhost:8000/#/admin?tab=leagues', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_leagues_2022.png', fullPage: true });

    await browser.close();
    console.log('Verification finished successfully!');
})();
