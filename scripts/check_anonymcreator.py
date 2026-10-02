import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        url = 'https://dsg.anonymcreator.online/#/liga'
        print(f"Navigating to {url}...")
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=15000)
            await page.wait_for_timeout(3000)
            
            heading = await page.locator('h1').all_text_contents()
            options = await page.locator('.season-option').all_text_contents()
            print("Heading on dsg.anonymcreator.online:", heading)
            print("Season options on dsg.anonymcreator.online:", options)
            
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/live_anonymcreator_liga.png", full_page=True)
            print("Saved live_anonymcreator_liga.png")
        except Exception as e:
            print("Error:", e)
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(check())
