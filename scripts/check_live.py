import asyncio
from playwright.async_api import async_playwright

async def check_live():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})
        
        url = 'https://linzerask.github.io/dsg/Website/#/statistiken'
        print('Checking:', url)
        await page.goto(url, wait_until='load')
        await page.wait_for_timeout(2500)
        
        # Click Vereine tab
        await page.click('button[data-tab="clubs"]')
        await page.wait_for_timeout(1500)
        
        # Screenshot
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/live_check_clubs.png')
        first_row = await page.locator('#stats-section-clubs tbody tr').first.inner_text()
        print('Live first row:', first_row.replace('\n', ' | '))
        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_live())
