import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()

        print("1. Initializing and waiting for data sync...")
        page.goto("http://localhost:8000/#/")
        page.wait_for_timeout(3000)

        print("2. Testing Liga Page (2023/2024)...")
        page.goto("http://localhost:8000/#/liga")
        page.wait_for_timeout(2500)

        # Select 2023/2024 season
        season_select = page.locator("#season-select")
        if season_select.count() > 0:
            season_select.select_option("2023/2024")
            page.wait_for_timeout(1500)

        page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_2023_2024.png", full_page=True)
        print("  - Saved verify_liga_2023_2024.png")

        # Also click on Runde 1 to view match fixtures
        round_btn = page.locator(".round-pill, .round-btn").first
        if round_btn.count() > 0:
            round_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_liga_round1.png")
            print("  - Saved verify_liga_round1.png")

        print("3. Testing Statistiken Page...")
        page.goto("http://localhost:8000/#/statistiken")
        page.wait_for_timeout(2500)
        page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_stats_2023_2024.png", full_page=True)
        print("  - Saved verify_stats_2023_2024.png")

        print("4. Testing Admin Page...")
        # Authenticate admin in session storage
        page.evaluate("() => { sessionStorage.setItem('dsg_admin', 'true'); }")
        page.goto("http://localhost:8000/#/admin")
        page.wait_for_timeout(2000)

        # Check Ligen Tab
        btn_leagues = page.locator('button.admin-nav-btn[data-target="admin-leagues"]')
        if btn_leagues.count() > 0:
            btn_leagues.click()
            page.wait_for_timeout(1500)
            page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_ligen.png")
            print("  - Saved verify_admin_ligen.png")

        # Check Spielrunden Tab
        btn_rounds = page.locator('button.admin-nav-btn[data-target="admin-rounds"]')
        if btn_rounds.count() > 0:
            btn_rounds.click()
            page.wait_for_timeout(1500)
            page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_rounds.png")
            print("  - Saved verify_admin_rounds.png")

        # Check Spiele Tab
        btn_games = page.locator('button.admin-nav-btn[data-target="admin-games"]')
        if btn_games.count() > 0:
            btn_games.click()
            page.wait_for_timeout(1500)
            league_filter = page.locator("#game-league-filter")
            if league_filter.count() > 0:
                league_filter.select_option("2023/2024")
                page.wait_for_timeout(1000)
            page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_admin_games_2023_2024.png")
            print("  - Saved verify_admin_games_2023_2024.png")

        browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    main()
