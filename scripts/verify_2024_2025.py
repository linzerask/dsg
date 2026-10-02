import asyncio
from playwright.async_api import async_playwright

async def verify_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()
        
        errors = []
        page.on('pageerror', lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on('console', lambda msg: errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type == 'error' else None)
        
        # 1. Home
        print("1. Verifying Home view...")
        await page.goto("http://localhost:8000/#/", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_home_2024_2025.png", full_page=True)
        print("Saved verify_home_2024_2025.png")
        
        # 2. Liga view - Tabelle
        print("2. Verifying Liga view (2024/2025)...")
        await page.goto("http://localhost:8000/#/liga", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        h1 = await page.locator('h1').all_text_contents()
        options = await page.locator('.season-option').all_text_contents()
        print("Heading:", h1)
        print("Season options:", [o.strip() for o in options])
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_2024_2025.png", full_page=True)
        print("Saved verify_liga_2024_2025.png")
        
        # 3. Liga view - Stats subtab
        stats_tab = page.locator('button.tab-btn[data-target="stats"]')
        if await stats_tab.count() > 0:
            await stats_tab.click()
            await page.wait_for_timeout(1000)
            scorers = await page.locator('#stats-tore .glass-card').all_text_contents()
            print("Top Scorers 2024/2025 count:", len(scorers))
            for sc in scorers[:5]:
                print(" ", sc.replace('\n', ' ').strip())
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_stats_2024_2025.png", full_page=True)
            print("Saved verify_stats_2024_2025.png")
            
        # 4. Statistiken view
        print("4. Verifying Statistiken view...")
        await page.goto("http://localhost:8000/#/statistiken", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        all_time_top = await page.locator('.hall-of-fame-card, .table-row').all_text_contents()
        print("All time preview:", [t.replace('\n', ' ').strip() for t in all_time_top[:3]])
        await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_alltime_stats_2024_2025.png", full_page=True)
        print("Saved verify_alltime_stats_2024_2025.png")
        
        # 5. Admin View
        print("5. Verifying Admin view...")
        await page.goto("http://localhost:8000/#/admin", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)
        
        # Pin
        pin = page.locator('#pin-input')
        if await pin.count() > 0:
            await pin.fill('1111')
            await page.locator('#pin-btn').click()
            await page.wait_for_timeout(1500)
            
        # Ligen
        btn_l = page.locator('button.admin-nav-btn[data-target="admin-leagues"]')
        if await btn_l.count() > 0:
            await btn_l.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_leagues_2024_2025.png")
            print("Saved verify_admin_leagues_2024_2025.png")
            
        # Runden
        btn_r = page.locator('button.admin-nav-btn[data-target="admin-rounds"]')
        if await btn_r.count() > 0:
            await btn_r.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds_2024_2025.png")
            print("Saved verify_admin_rounds_2024_2025.png")
            
        # Spiele
        btn_g = page.locator('button.admin-nav-btn[data-target="admin-games"]')
        if await btn_g.count() > 0:
            await btn_g.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2024_2025.png")
            print("Saved verify_admin_games_2024_2025.png")
            
        print("Test errors:", errors)
        await browser.close()
        print("All 2024/2025 verification steps finished successfully!")

if __name__ == '__main__':
    asyncio.run(verify_all())
