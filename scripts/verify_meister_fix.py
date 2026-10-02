import asyncio
from playwright.async_api import async_playwright

async def verify_meister_tab():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})
        
        await page.goto('http://localhost:8000/#/statistiken', wait_until='load')
        await page.wait_for_timeout(1000)
        
        # Click Meister tab
        await page.click('button[data-tab="champions"]')
        await page.wait_for_timeout(600)
        
        # Screenshot
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_meister_fixed.png', full_page=False)
        print("Captured verify_meister_fixed.png")
        
        # Get cards text
        cards = await page.locator('#stats-section-champions .glass-card').all_inner_texts()
        for idx, card in enumerate(cards):
            print(f"Card {idx}:", card.replace('\n', ' | '))
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify_meister_tab())
