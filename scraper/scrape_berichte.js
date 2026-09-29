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
    console.log('🚀 Starte Browser für fortlaufendes Spielberichte-Scraping...');
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    await page.goto('https://customer.js-hosting.at/dsgfussball/berichte/1', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    console.log('\n========================================================================');
    console.log('✅ Browser geöffnet!');
    console.log('👉 SCHRITT 1: Bitte im Browser einloggen (falls erforderlich).');
    console.log('👉 SCHRITT 2: Gehe auf https://customer.js-hosting.at/dsgfussball/berichte/1');
    console.log('========================================================================\n');
    
    let scrapeCount = 0;

    while (true) {
        const promptText = scrapeCount === 0 
            ? '🟢 Drücke ENTER, sobald du die erste Spielberichte-Seite geöffnet hast (oder "exit" zum Beenden): '
            : '\n👉 Öffne die nächste Saison/Spielberichte im Browser und drücke ENTER (oder "exit" zum Beenden): ';

        const answer = await askQuestion(promptText);
        if (answer.trim().toLowerCase() === 'exit' || answer.trim().toLowerCase() === 'q') {
            break;
        }

        // Get all open tabs
        const allPages = await browser.pages();
        let targetPage = null;

        // Find the page with /berichte/
        for (let i = allPages.length - 1; i >= 0; i--) {
            const p = allPages[i];
            const u = p.url();
            if (u.includes('/berichte/')) {
                targetPage = p;
                break;
            }
        }

        if (!targetPage) {
            targetPage = allPages[allPages.length - 1];
        }

        const currentUrl = targetPage.url();
        const urlParts = currentUrl.split('/');
        let reportId = urlParts[urlParts.length - 1] || `${scrapeCount + 1}`;
        if (reportId.includes('?')) reportId = reportId.split('?')[0];

        console.log(`\n🔍 Scrape Spielberichte aus: ${currentUrl} (ID: #${reportId})...`);

        try {
            await targetPage.bringToFront();
            await new Promise(r => setTimeout(r, 600));

            // Extract page HTML content
            const htmlContent = await targetPage.content();
            const rawHtmlPath = path.join(__dirname, `raw_berichte_${reportId}.html`);
            fs.writeFileSync(rawHtmlPath, htmlContent, 'utf-8');

            const parsedData = await targetPage.evaluate(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    html: document.body.innerHTML
                };
            });

            const jsonPath = path.join(__dirname, `raw_berichte_${reportId}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2), 'utf-8');

            scrapeCount++;
            console.log(`✅ [${scrapeCount}] Spielbericht #${reportId} erfolgreich gespeichert!`);
            console.log(`   📄 scraper/raw_berichte_${reportId}.json`);
            console.log(`   📄 scraper/raw_berichte_${reportId}.html`);
        } catch (err) {
            console.error(`❌ Fehler beim Scrapen von #${reportId}:`, err.message);
        }
    }

    console.log(`\n🎉 Fertig! Insgesamt ${scrapeCount} Spielberichte-Seiten gescrapt.`);
    await browser.close();
    rl.close();
})();
