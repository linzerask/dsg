import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()

        errors = []
        page.on('pageerror', lambda err: errors.append(f'PAGE ERROR: {err}'))
        page.on('console', lambda msg: errors.append(f'CONSOLE {msg.type}: {msg.text}') if msg.type == 'error' else None)

        # 1. Home view
        print("Verifying Home view (#/)...")
        await page.goto("http://localhost:8000/#/", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_home_2023_2024.png", full_page=True)
        print("Saved verify_home_2023_2024.png")

        # 2. Liga view - Tabelle
        print("Verifying Liga view (#/liga)...")
        await page.goto("http://localhost:8000/#/liga", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_tabelle_2023.png", full_page=True)
        print("Saved verify_liga_tabelle_2023.png")

        # 3. Liga view - Spiele
        spiele_tab = page.locator('button.tab-btn[data-target="spiele"]')
        if await spiele_tab.count() > 0:
            await spiele_tab.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_spiele_2023.png", full_page=True)
            print("Saved verify_liga_spiele_2023.png")

        # 4. Statistiken view
        print("Verifying Statistiken view (#/statistiken)...")
        await page.goto("http://localhost:8000/#/statistiken", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_statistiken_2023.png", full_page=True)
        print("Saved verify_statistiken_2023.png")

        # 5. Admin Login & Views
        print("Verifying Admin view (#/admin)...")
        await page.goto("http://localhost:8000/#/admin", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Login
        pin_input = page.locator("#pin-input")
        if await pin_input.count() > 0:
            await pin_input.fill("1111")
            await page.locator("#pin-btn").click()
            await page.wait_for_timeout(1500)

        # Admin Ligen
        leagues_tab = page.locator('button.admin-nav-btn[data-target="admin-leagues"]')
        if await leagues_tab.count() > 0:
            await leagues_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_leagues_2023.png")
            print("Saved verify_admin_leagues_2023.png")

        # Admin Spielrunden
        rounds_tab = page.locator('button.admin-nav-btn[data-target="admin-rounds"]')
        if await rounds_tab.count() > 0:
            await rounds_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_2023.png")
            print("Saved verify_admin_rounds_2023.png")

        # Admin Spiele
        games_tab = page.locator('button.admin-nav-btn[data-target="admin-games"]')
        if await games_tab.count() > 0:
            await games_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2023.png")
            print("Saved verify_admin_games_2023.png")

        print("Errors during test:", errors)
        await browser.close()
        print("All verification steps completed!")

if __name__ == '__main__':
    asyncio.run(run())
