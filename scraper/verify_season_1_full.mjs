import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  await page.goto('http://localhost:8000/#/liga', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Check rounds on liga view
  const roundsCount = await page.evaluate(() => {
    const selector = document.querySelectorAll('.round-card, .tab-btn, .match-card');
    return {
      title: document.title,
      matchesCount: document.querySelectorAll('.match-row, .match-card, .game-card, .liga-match-card').length,
      tableRows: document.querySelectorAll('tbody tr').length
    };
  });

  console.log('Public Liga View Info:', roundsCount);

  // Go to admin view
  await page.evaluate(() => {
    sessionStorage.setItem('dsg_admin', 'true');
  });
  await page.goto('http://localhost:8000/#/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const adminInfo = await page.evaluate(() => {
    return {
      tableRows: document.querySelectorAll('tbody tr').length,
      roundsText: document.querySelector('tbody')?.innerText?.substring(0, 300)
    };
  });

  console.log('Admin View Info:', adminInfo);
  console.log('Errors:', errors);

  await page.screenshot({ path: 'C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/season_1_completed_verified.png' });

  await browser.close();
  console.log('Screenshot saved: season_1_completed_verified.png');
})();
