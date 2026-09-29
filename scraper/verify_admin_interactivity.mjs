import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:8000/#/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        sessionStorage.setItem('dsg_admin', 'true');
    });

    // Go to admin
    await page.goto('http://localhost:8000/#/admin', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Click 'Spielrunden'
    await page.click('button[data-target="admin-rounds"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_active.png', fullPage: true });

    // Click 'Spiele'
    await page.click('button[data-target="admin-games"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_active.png', fullPage: true });

    // Click first 'Spielbericht erfassen' button on games tab
    const reportBtn = await page.$('.btn-report-game');
    if (reportBtn) {
        await reportBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_report_modal.png', fullPage: true });
    }

    await browser.close();
    console.log('Admin interactivity verified!');
})();
