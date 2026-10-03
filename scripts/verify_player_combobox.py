import time
import os
from playwright.sync_api import sync_playwright

def verify_combobox():
    os.makedirs('artifacts', exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        # Listen to console logs and page errors
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        print("Navigating to admin page...")
        page.goto('http://localhost:8000/#/admin', wait_until='domcontentloaded')
        page.wait_for_timeout(3000)

        # Click on Spiele tab
        print("Clicking on Spiele tab...")
        spiele_tab = page.locator('button.admin-nav-btn[data-target="admin-games"]').first
        if spiele_tab.is_visible():
            spiele_tab.click()
            page.wait_for_timeout(1500)

        # Look for a Spielbericht button
        print("Waiting for games to load and report button to appear...")
        page.wait_for_selector('.btn-report-game', timeout=15000)
        print("Report buttons count:", page.locator('.btn-report-game').count())
        report_btn = page.locator('.btn-report-game').first
        print("Clicking report button...")
        report_btn.click()
        page.wait_for_timeout(1000)

        # Verify modal is visible
        report_modal = page.locator('#report-modal')
        print("Report modal display:", report_modal.evaluate("el => el.style.display"))
        assert report_modal.is_visible(), "Report modal should be visible"

        # Check scorer home search input
        scorer_input = page.locator('#input-search-report-scorer-player-home')
        assert scorer_input.is_visible(), "Scorer search input should be visible"

        # Focus / click on scorer input to trigger dropdown
        print("Testing scorer dropdown click/focus...")
        scorer_input.click()
        page.wait_for_timeout(400)

        # Check dropdown
        dropdown = page.locator('#dropdown-report-scorer-player-home')
        assert dropdown.is_visible(), "Dropdown should open on click/focus"

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_open.png')
        print("Screenshot saved: verify_combobox_open.png")

        # Type filter in scorer input
        print("Typing filter query...")
        scorer_input.fill("a")
        page.wait_for_timeout(300)

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_filter.png')
        print("Screenshot saved: verify_combobox_filter.png")

        # Pick first option
        first_option = dropdown.locator('.player-option-item').first
        opt_text = first_option.inner_text()
        print(f"Selecting option: {opt_text}")
        first_option.click()
        page.wait_for_timeout(300)

        # Check value in search input and hidden input
        hidden_val = page.locator('#report-scorer-player-home').input_value()
        search_val = scorer_input.input_value()
        print(f"Selected hidden value: {hidden_val}, search input value: {search_val}")

        # Click + Hinzufügen
        print("Clicking + Hinzufügen...")
        add_btn = page.locator('#btn-add-goal-home')
        add_btn.click()
        page.wait_for_timeout(400)

        # Check goal list has item
        goals_list = page.locator('#report-goals-list-home')
        print("Goals list content:", goals_list.inner_text())

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_added_goal.png')
        print("Screenshot saved: verify_combobox_added_goal.png")

        # Test Cards combobox
        print("Testing Cards combobox...")
        card_input = page.locator('#input-search-report-card-player-away')
        card_input.click()
        page.wait_for_timeout(300)

        card_dropdown = page.locator('#dropdown-report-card-player-away')
        assert card_dropdown.is_visible(), "Card away dropdown should be visible"

        # Select first card player
        card_first = card_dropdown.locator('.player-option-item').first
        print("Card player:", card_first.inner_text())
        card_first.click()
        page.wait_for_timeout(300)

        # Click + Hinzufügen for card
        page.locator('#btn-add-card-away').click()
        page.wait_for_timeout(400)

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_full_modal.png')
        print("Screenshot saved: verify_combobox_full_modal.png")

        browser.close()
        print("Verification completed successfully!")

if __name__ == '__main__':
    verify_combobox()
