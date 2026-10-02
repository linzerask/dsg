import sys
from playwright.sync_api import sync_playwright

def test_mojibake_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        
        # 1. Load Admin View
        page.goto('http://localhost:8000/#/admin')
        page.wait_for_timeout(1000)
        
        # Login if needed
        pin_input = page.query_selector('#pin-input')
        if pin_input:
            pin_input.fill('1111')
            page.click('#pin-btn')
            page.wait_for_timeout(1000)
            
        # Switch to Spiele Tab
        page.click('.admin-nav-btn[data-target="admin-games"]')
        page.wait_for_timeout(1200)
        
        # Check for Match report buttons and click one
        report_btns = page.query_selector_all('.btn-report-game')
        print(f"Found {len(report_btns)} report buttons")
        
        if report_btns:
            report_btns[0].click()
            page.wait_for_timeout(1000)
            
            # Check modal content for player names
            modal = page.query_selector('#report-modal')
            modal_text = modal.inner_text() if modal else ""
            
            # Check for bad characters
            bad_chars = ['Ã', 'â€', 'Â']
            found_bad = [c for c in bad_chars if c in modal_text]
            print(f"Found bad chars in report modal: {found_bad}")
            
            # Check for expected characters
            print(f"Contains 'ü' or 'ö' or 'ä' or 'ß': {'ü' in modal_text or 'ö' in modal_text or 'ä' in modal_text or 'ß' in modal_text}")
            
            page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_mojibake_fixed.png")
            print("Captured screenshot verify_mojibake_fixed.png")
            
        # Check homepage as well
        page.goto('http://localhost:8000/#/')
        page.wait_for_timeout(1000)
        home_text = page.inner_text('body')
        found_bad_home = [c for c in ['Ã', 'â€', 'Â'] if c in home_text]
        print(f"Found bad chars on home: {found_bad_home}")
        
        # Check statistiken
        page.goto('http://localhost:8000/#/statistiken')
        page.wait_for_timeout(1000)
        stats_text = page.inner_text('body')
        found_bad_stats = [c for c in ['Ã', 'â€', 'Â'] if c in stats_text]
        print(f"Found bad chars on statistiken: {found_bad_stats}")
        
        browser.close()

if __name__ == '__main__':
    test_mojibake_fix()
