import asyncio
from playwright.async_api import async_playwright

async def snap():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1400, 'height': 1200})
        await page.goto('http://localhost:8000/#/statistiken', wait_until='load')
        await page.wait_for_timeout(1000)
        await page.click('button[data-tab="champions"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_meister_fixed_full.png', full_page=True)
        print("Done capturing verify_meister_fixed_full.png")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(snap())
