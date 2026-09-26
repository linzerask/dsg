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
    console.log('🚀 Starte Browser für Spielberichte...');
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    await page.goto('https://customer.js-hosting.at/dsgfussball/login', { waitUntil: 'domcontentloaded' });
    
    console.log('\n======================================================');
    console.log('✅ Browser geöffnet!');
    console.log('👉 SCHRITT 1: Bitte im Browser einloggen.');
    console.log('👉 SCHRITT 2: Öffne die Spielberichte (z.B. /berichte/13).');
    console.log('======================================================\n');
    
    await askQuestion('🟢 Drücke ENTER, sobald der Spielberichte-Tab geöffnet ist...');

    // Get all open tabs
    const allPages = await browser.pages();
    console.log(`\n📑 Es sind ${allPages.length} Tabs geöffnet:`);
    
    let targetPage = null;
    for (let i = 0; i < allPages.length; i++) {
        const p = allPages[i];
        const u = p.url();
        console.log(`  Tab ${i + 1}: ${u}`);
        if (u.includes('/berichte/')) {
            targetPage = p;
        }
    }

    if (!targetPage) {
        // If not found by /berichte/, take the last active tab
        targetPage = allPages[allPages.length - 1];
    }

    console.log(`\n🎯 Scrape Daten aus Tab mit URL: ${targetPage.url()} ...`);

    // Bring target page to front
    await targetPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Save full HTML backup
    const htmlContent = await targetPage.content();
    const rawHtmlPath = path.join(__dirname, 'raw_berichte.html');
    fs.writeFileSync(rawHtmlPath, htmlContent, 'utf-8');
    console.log(`💾 HTML Backup gespeichert in: ${rawHtmlPath}`);

    // Parse the entire report page
    const parsedData = await targetPage.evaluate(() => {
        return {
            url: window.location.href,
            title: document.title,
            html: document.body.innerHTML
        };
    });

    const jsonPath = path.join(__dirname, 'raw_berichte.json');
    fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2), 'utf-8');
    console.log(`\n✅ Spielberichte erfolgreich gescrapt & gespeichert in: ${jsonPath}`);

    await askQuestion('\nDrücke ENTER zum Beenden...');
    await browser.close();
    rl.close();
})();
