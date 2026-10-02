import asyncio
from playwright.async_api import async_playwright

async def verify_stats_tab():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()
        
        await page.goto('http://localhost:8000/#/liga', wait_until='domcontentloaded')
        await page.wait_for_timeout(1500)
        
        # Click on Statistiken tab in Liga view
        stats_tab = page.locator('button.tab-btn[data-target="stats"]')
        await stats_tab.click()
        await page.wait_for_timeout(1500)
        
        # Check rendered text in scorers (#stats-tore)
        card_texts = await page.locator('#stats-tore .glass-card').all_text_contents()
        print('Scorers rendered count:', len(card_texts))
        for t in card_texts[:6]:
            print('  Scorer card:', t.replace('\n', ' ').strip())
            
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_stats_scorers_fixed.png', full_page=True)
        print('Saved verify_liga_stats_scorers_fixed.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify_stats_tab())
