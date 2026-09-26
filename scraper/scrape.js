const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

(async () => {
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    
    const page = await browser.newPage();
    await page.goto('https://customer.js-hosting.at/dsgfussball/login', { waitUntil: 'domcontentloaded' });
    
    console.log('\n======================================================');
    console.log('✅ Browser ready.');
    console.log('👉 STEP 1: Log in manually.');
    console.log('👉 STEP 2: Navigate to your table (e.g. Players).');
    console.log('======================================================\n');
    
    await askQuestion('🟢 Press ENTER when you are on Page 1 and ready to start auto-detecting...');

    let allData = [];
    let pageNum = 1;
    let isFinished = false;
    
    console.log(`\n👀 I am now watching the table!`);
    console.log(`👉 Just click 'Next Page' in the browser at your own speed.`);
    console.log(`⚠️ Type 'save' and press ENTER here when you are completely done.\n`);

    rl.on('line', (input) => {
        if (input.trim().toLowerCase() === 'save') {
            isFinished = true;
        }
    });

    // Helper to scrape table
    const scrapeTable = async (headers) => {
        return await page.evaluate((headers) => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            const data = [];
            for (const row of rows) {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length === 0) continue; 
                let rowObj = {};
                for (let i = 0; i < headers.length; i++) {
                    const key = headers[i] || `column_${i}`;
                    rowObj[key] = cells[i] ? cells[i].innerText.trim() : "";
                }
                data.push(rowObj);
            }
            return data;
        }, headers);
    };

    let headers = [];
    let lastFirstRowText = "";

    while (!isFinished) {
        try {
            // If we don't have headers yet, get them
            if (headers.length === 0) {
                headers = await page.evaluate(() => {
                    const ths = Array.from(document.querySelectorAll('table th'));
                    return ths.map(th => th.innerText.trim());
                });
            }

            // Check if the first row has changed
            const currentFirstRowText = await page.evaluate(() => {
                const tr = document.querySelector('table tbody tr');
                return tr ? tr.innerText.trim() : '';
            });

            if (currentFirstRowText && currentFirstRowText !== lastFirstRowText) {
                // Table content changed!
                console.log(`🔄 Detected new page data! Scraping Page ${pageNum}...`);
                const pageData = await scrapeTable(headers);
                allData.push(...pageData);
                console.log(`✅ Auto-Scraped ${pageData.length} items. (Total in memory: ${allData.length})`);
                
                lastFirstRowText = currentFirstRowText;
                pageNum++;
            }
        } catch (e) {
            // Ignored: This usually happens while the page is actively reloading (context destroyed)
        }
        
        await new Promise(r => setTimeout(r, 500)); // Check every 0.5 seconds
    }

    rl.close();

    console.log('\n💾 Scraping stopped!');
    const safeFilename = `export_${Date.now()}.json`; // Auto-naming to save you a step
    fs.writeFileSync(safeFilename, JSON.stringify(allData, null, 2));
    
    console.log(`🎉 Success! Saved ${allData.length} total items to ${safeFilename}`);
    
    console.log('You can close the browser and terminal window now.');
    process.exit(0);
})();
