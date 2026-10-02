import sys
from playwright.sync_api import sync_playwright

def test_exact_traun_gornjak_2026():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        
        page.goto('http://localhost:8000/#/admin')
        page.wait_for_timeout(1000)
        
        pin_input = page.query_selector('#pin-input')
        if pin_input:
            pin_input.fill('1111')
            page.click('#pin-btn')
            page.wait_for_timeout(1000)
            
        page.click('.admin-nav-btn[data-target="admin-games"]')
        page.wait_for_timeout(1200)
        
        # Search "25.09.2026"
        search_input = page.query_selector('#game-search')
        if search_input:
            search_input.fill('25.09.2026')
            page.wait_for_timeout(600)
            
        report_btns = page.query_selector_all('.btn-report-game')
        print(f"Found {len(report_btns)} matches on 25.09.2026")
        
        for btn in report_btns:
            btn.click()
            page.wait_for_timeout(800)
            title = page.query_selector('#report-match-title').inner_text() if page.query_selector('#report-match-title') else ""
            print(f"Checking: {title}")
            if "Traun" in title and "Gornjak" in title:
                print("MATCH FOUND! Inspecting modal text...")
                modal_text = page.query_selector('#report-modal').inner_text()
                print("Dominik Prilmüller present:", "Dominik Prilmüller" in modal_text)
                print("Süleyman Targil present:", "Süleyman Targil" in modal_text)
                print("Taher Akbar present:", "Taher Akbar" in modal_text)
                print("Ninoslav Matanovic present:", "Ninoslav Matanovic" in modal_text)
                bad_chars = [c for c in ['Ã', 'â€', 'Â'] if c in modal_text]
                print("Mojibake characters found:", bad_chars)
                page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/verify_traun_gornjak_fixed.png")
                break
            page.click('.btn-close-report-modal')
            page.wait_for_timeout(400)
            
        browser.close()

if __name__ == '__main__':
    test_exact_traun_gornjak_2026()
