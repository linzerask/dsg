import time
from playwright.sync_api import sync_playwright

def test_league_status_persistence():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to admin login...")
        page.goto('http://localhost:8000/#/admin', wait_until='domcontentloaded')
        time.sleep(1.5)

        # Login with correct PIN '1111'
        pin_input = page.locator('#pin-input')
        if pin_input.is_visible():
            pin_input.fill('1111')
            page.locator('#pin-btn').click()
            time.sleep(1.5)

        # Click on Ligen tab
        print("Opening Ligen tab...")
        page.locator('.admin-nav-btn[data-target="admin-leagues"]').click()
        time.sleep(1.5)

        # Find the first league row edit button (.edit-single-league-btn)
        edit_buttons = page.locator('.edit-single-league-btn')
        assert edit_buttons.count() > 0, "No league edit buttons found"
        
        # Click edit on the first league
        edit_buttons.first.click()
        time.sleep(0.8)

        # Change status to 'Inaktiv'
        page.locator('#edit-league-status').select_option('Inaktiv')
        time.sleep(0.4)
        # Submit the form
        page.locator('#btn-submit-league').click()
        time.sleep(1.5)

        # Verify row shows 'Inaktiv'
        first_row_badge = page.locator('#leagues-table-body tr').first.locator('.badge').first
        first_status = first_row_badge.inner_text().strip()
        print(f"Status before reload: {first_status}")
        assert 'Inaktiv' in first_status, f"Expected Inaktiv before reload, got {first_status}"

        # Reload the page
        print("Reloading the page...")
        page.reload(wait_until='domcontentloaded')
        time.sleep(2)

        # Check Ligen tab after reload
        page.locator('.admin-nav-btn[data-target="admin-leagues"]').click()
        time.sleep(1.5)

        first_row_badge_after = page.locator('#leagues-table-body tr').first.locator('.badge').first
        status_after = first_row_badge_after.inner_text().strip()
        print(f"Status after reload: {status_after}")
        assert 'Inaktiv' in status_after, f"FAIL: Expected Inaktiv after reload, but got {status_after}"
        print("SUCCESS: League status 'Inaktiv' successfully persisted across reload!")

        # Reset back to 'Aktiv' to leave database in clean active state
        print("Restoring status back to 'Aktiv'...")
        page.locator('.edit-single-league-btn').first.click()
        time.sleep(0.8)
        page.locator('#edit-league-status').select_option('Aktiv')
        time.sleep(0.4)
        # Ensure teams are selected
        page.locator('#btn-select-all-league-teams').click()
        time.sleep(0.4)
        page.locator('#btn-submit-league').click()
        time.sleep(1.5)

        # Reload once more to verify Aktiv persistence
        page.reload(wait_until='domcontentloaded')
        time.sleep(2)
        page.locator('.admin-nav-btn[data-target="admin-leagues"]').click()
        time.sleep(1.5)
        restored_status = page.locator('#leagues-table-body tr').first.locator('.badge').first.inner_text().strip()
        print(f"Status after restoring and reloading: {restored_status}")
        assert 'Aktiv' in restored_status, f"FAIL: Expected Aktiv after restore, but got {restored_status}"
        print("ALL TESTS PASSED PERFECTLY!")

        browser.close()

if __name__ == '__main__':
    test_league_status_persistence()
