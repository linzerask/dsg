import asyncio
from playwright.async_api import async_playwright

async def verify_statistiken_clubs():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})
        
        await page.goto('http://localhost:8000/#/statistiken', wait_until='load')
        await page.wait_for_timeout(1000)
        
        # Click on Vereine tab
        await page.click('button[data-tab="clubs"]')
        await page.wait_for_timeout(600)
        
        # Take screenshot of Ewige Vereinstabelle
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_ewige_vereinstabelle_fixed.png', full_page=False)
        print("Captured verify_ewige_vereinstabelle_fixed.png")
        
        # Read text of first row to verify Tore
        first_row_text = await page.locator('#stats-section-clubs tbody tr').first.inner_text()
        print("First row text:", first_row_text.replace('\n', ' | '))
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify_statistiken_clubs())
