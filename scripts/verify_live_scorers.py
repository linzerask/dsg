import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Opening live site...")
        await page.goto('https://linzerask.github.io/dsg/Website/#/liga', wait_until='domcontentloaded')
        await page.wait_for_timeout(2500)
        
        # Click stats tab
        stats_tab = page.locator('button.tab-btn[data-target="stats"]')
        if await stats_tab.count() > 0:
            await stats_tab.click()
            await page.wait_for_timeout(1500)
            scorers = await page.locator('#stats-tore .glass-card').all_text_contents()
            print('Live site top scorers count:', len(scorers))
            for s in scorers[:5]:
                print(' ', s.replace('\n', ' ').strip())
                
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/live_verified_scorers.png', full_page=True)
        print('Saved live_verified_scorers.png')
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
