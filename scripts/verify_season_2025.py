import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()

        # 1. Liga view - Table & Matches
        print("Navigating to #/liga...")
        await page.goto("http://localhost:8000/#/liga", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_2025_2026.png", full_page=True)

        # Click on Spiele tab
        spiele_tab = page.locator('button.tab-btn[data-target="spiele"]')
        if await spiele_tab.count() > 0:
            await spiele_tab.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_matches_2025.png", full_page=True)
            print("Screenshot verify_liga_matches_2025.png saved.")

        # 2. Admin Login & Views
        print("Navigating to #/admin...")
        await page.goto("http://localhost:8000/#/admin", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Login with PIN 1111
        pin_input = page.locator("#pin-input")
        if await pin_input.count() > 0:
            await pin_input.fill("1111")
            login_btn = page.locator("#pin-btn")
            await login_btn.click()
            await page.wait_for_timeout(2000)

        # Admin Ligen
        leagues_tab = page.locator('button.admin-nav-btn[data-target="admin-leagues"]')
        if await leagues_tab.count() > 0:
            await leagues_tab.click()
            await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_ligen_2025.png")
        print("Screenshot verify_admin_ligen_2025.png saved.")

        # Admin Spielrunden
        rounds_tab = page.locator('button.admin-nav-btn[data-target="admin-rounds"]')
        if await rounds_tab.count() > 0:
            await rounds_tab.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_2025.png")
            print("Screenshot verify_admin_rounds_2025.png saved.")

        # Admin Spiele
        games_tab = page.locator('button.admin-nav-btn[data-target="admin-games"]')
        if await games_tab.count() > 0:
            await games_tab.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2025.png")
            print("Screenshot verify_admin_games_2025.png saved.")

        await browser.close()
        print("Verification complete!")

if __name__ == '__main__':
    asyncio.run(run())
