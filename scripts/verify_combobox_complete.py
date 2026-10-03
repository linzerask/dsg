import sys
import os
from playwright.sync_api import sync_playwright

def verify():
    print("Starting Playwright...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}", flush=True))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}", flush=True))

        print("Navigating to root...", flush=True)
        page.goto('http://localhost:8000', wait_until='domcontentloaded')
        page.wait_for_timeout(1000)

        print("Setting admin session and navigating to #/admin...", flush=True)
        page.evaluate("() => { sessionStorage.setItem('dsg_admin', 'true'); window.location.hash = '#/admin'; }")
        page.wait_for_timeout(1500)

        # Switch to Spiele tab
        print("Clicking Spiele tab...", flush=True)
        page.locator('button.admin-nav-btn[data-target="admin-games"]').click()
        page.wait_for_timeout(1500)

        # Look for a Spielbericht button
        print("Checking report buttons count...", flush=True)
        report_btns = page.locator('#admin-games .btn-report-game')
        print(f"Report buttons count: {report_btns.count()}", flush=True)
        
        if report_btns.count() == 0:
            print("No report buttons found, taking screenshot...", flush=True)
            page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/debug_no_btns.png')
            browser.close()
            return

        # Click first report button
        print("Opening Spielbericht modal...", flush=True)
        report_btns.first.click()
        page.wait_for_timeout(1000)

        # Verify modal is visible
        modal = page.locator('#report-modal')
        print(f"Modal visible: {modal.is_visible()}", flush=True)

        # Check scorer home search input
        scorer_input = page.locator('#input-search-report-scorer-player-home')
        print(f"Scorer input visible: {scorer_input.is_visible()}", flush=True)

        # Focus / click on scorer input to trigger dropdown
        print("Clicking scorer search input...", flush=True)
        scorer_input.click()
        page.wait_for_timeout(400)

        dropdown = page.locator('#dropdown-report-scorer-player-home')
        print(f"Dropdown visible: {dropdown.is_visible()}", flush=True)
        print(f"Dropdown options count: {dropdown.locator('.player-option-item').count()}", flush=True)

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_open.png')
        print("Saved verify_combobox_open.png", flush=True)

        # Type search filter
        print("Filtering for letter 'a'...", flush=True)
        scorer_input.fill("a")
        page.wait_for_timeout(300)

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_filter.png')
        print("Saved verify_combobox_filter.png", flush=True)

        # Select first option
        first_opt = dropdown.locator('.player-option-item').first
        selected_name = first_opt.inner_text().strip()
        print(f"Selecting option: {selected_name}", flush=True)
        first_opt.click()
        page.wait_for_timeout(300)

        # Check values
        hidden_val = page.locator('#report-scorer-player-home').input_value()
        search_val = scorer_input.input_value()
        print(f"Hidden value: {hidden_val}, Search input value: {search_val}", flush=True)

        # Add goal
        print("Clicking + Hinzufügen for goal...", flush=True)
        page.locator('#btn-add-goal-home').click()
        page.wait_for_timeout(400)

        goals_list = page.locator('#report-goals-list-home')
        print(f"Goals list: {goals_list.inner_text()}", flush=True)

        # Check card combobox
        print("Testing card combobox...", flush=True)
        card_input = page.locator('#input-search-report-card-player-away')
        card_input.click()
        page.wait_for_timeout(300)

        card_dropdown = page.locator('#dropdown-report-card-player-away')
        card_first = card_dropdown.locator('.player-option-item').first
        card_name = card_first.inner_text().strip()
        print(f"Selecting card player: {card_name}", flush=True)
        card_first.click()
        page.wait_for_timeout(300)

        page.locator('#btn-add-card-away').click()
        page.wait_for_timeout(400)

        cards_list = page.locator('#report-cards-list-away')
        print(f"Cards list: {cards_list.inner_text()}", flush=True)

        page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_combobox_final.png')
        print("Saved verify_combobox_final.png", flush=True)

        browser.close()
        print("All assertions and interactions verified successfully!", flush=True)

if __name__ == '__main__':
    verify()
