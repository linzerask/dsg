import time
from playwright.sync_api import sync_playwright

def test_spiele_tab_default_round():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to Liga view (#/liga)...")
        page.goto('http://localhost:8000/#/liga', wait_until='domcontentloaded')
        time.sleep(2)

        # Click on the 'Spiele' tab
        print("Clicking on 'Spiele' tab...")
        spiele_tab_btn = page.locator('.tab-btn[data-target="spiele"]')
        spiele_tab_btn.click()
        time.sleep(1)

        # Verify active slide is visible
        visible_slide = page.locator('.round-slide:visible')
        assert visible_slide.count() == 1, f"Expected 1 visible round slide, got {visible_slide.count()}"

        # Get the selected option in the round dropdown
        selected_option = visible_slide.locator('.round-select-dropdown option:checked')
        selected_text = selected_option.inner_text().strip()
        print(f"Selected round in dropdown: {selected_text}")

        # Assert that it is 5. Runde (Round 5)
        assert "5. Runde" in selected_text, f"FAIL: Expected '5. Runde' as standard, but got '{selected_text}'"
        print("SUCCESS: '5. Runde' is correctly displayed as standard for season 2026/2027!")

        # Verify matches inside 5. Runde
        match_cards = visible_slide.locator('.match-card')
        match_count = match_cards.count()
        print(f"Number of match cards in 5. Runde: {match_count}")
        assert match_count == 3, f"Expected 3 matches in 5. Runde, got {match_count}"

        # Check match card content
        first_match_teams = match_cards.first.locator('.match-card-body').inner_text().strip()
        print(f"First match in 5. Runde: {first_match_teams}")
        assert "Etehad Linz" in first_match_teams and "Walker FC" in first_match_teams, f"Expected Etehad Linz vs Walker FC, got {first_match_teams}"

        # Take screenshot for verification
        page.screenshot(path="verify_spiele_tab_round5.png")
        print("Screenshot saved to verify_spiele_tab_round5.png")

        print("ALL ROUND SELECTION TESTS PASSED!")
        browser.close()

if __name__ == '__main__':
    test_spiele_tab_default_round()
