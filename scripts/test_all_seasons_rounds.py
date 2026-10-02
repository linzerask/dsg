import time
from playwright.sync_api import sync_playwright

def test_all_seasons_round_selection():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        page.goto('http://localhost:8000/#/liga')
        time.sleep(2)
        
        # Click on Spiele tab
        page.locator('.tab-btn[data-target="spiele"]').click()
        time.sleep(1)
        
        # 1. 2026/2027 check
        visible_slide = page.locator('.round-slide:visible')
        sel_text = visible_slide.locator('.round-select-dropdown option:checked').inner_text()
        print(f"2026/2027 standard round: {sel_text}")
        assert "5. Runde" in sel_text, f"Expected 5. Runde for 2026/2027, got {sel_text}"
        
        # 2. Switch to 2025/2026
        page.locator('#season-custom-trigger').click()
        time.sleep(0.3)
        page.locator('.season-option[data-value="2025/2026"]').click()
        time.sleep(1.5)
        
        # Re-click Spiele tab in new season
        page.locator('.tab-btn[data-target="spiele"]').click()
        time.sleep(0.5)
        visible_slide = page.locator('.round-slide:visible')
        sel_text = visible_slide.locator('.round-select-dropdown option:checked').inner_text()
        print(f"2025/2026 standard round: {sel_text}")
        assert "14. Runde" in sel_text, f"Expected 14. Runde for 2025/2026, got {sel_text}"
        
        # 3. Switch to 2024/2025
        page.locator('#season-custom-trigger').click()
        time.sleep(0.3)
        page.locator('.season-option[data-value="2024/2025"]').click()
        time.sleep(1.5)
        
        page.locator('.tab-btn[data-target="spiele"]').click()
        time.sleep(0.5)
        visible_slide = page.locator('.round-slide:visible')
        sel_text = visible_slide.locator('.round-select-dropdown option:checked').inner_text()
        print(f"2024/2025 standard round: {sel_text}")
        assert "11. Runde" in sel_text, f"Expected 11. Runde for 2024/2025, got {sel_text}"
        
        # 4. Switch to 2023/2024
        page.locator('#season-custom-trigger').click()
        time.sleep(0.3)
        page.locator('.season-option[data-value="2023/2024"]').click()
        time.sleep(1.5)
        
        page.locator('.tab-btn[data-target="spiele"]').click()
        time.sleep(0.5)
        visible_slide = page.locator('.round-slide:visible')
        sel_text = visible_slide.locator('.round-select-dropdown option:checked').inner_text()
        print(f"2023/2024 standard round: {sel_text}")
        assert "18. Runde" in sel_text, f"Expected 18. Runde for 2023/2024, got {sel_text}"
        
        # 5. Switch back to 2026/2027
        page.locator('#season-custom-trigger').click()
        time.sleep(0.3)
        page.locator('.season-option[data-value="2026/2027"]').click()
        time.sleep(1.5)
        
        page.locator('.tab-btn[data-target="spiele"]').click()
        time.sleep(0.5)
        visible_slide = page.locator('.round-slide:visible')
        sel_text = visible_slide.locator('.round-select-dropdown option:checked').inner_text()
        print(f"Back to 2026/2027 standard round: {sel_text}")
        assert "5. Runde" in sel_text, f"Expected 5. Runde for 2026/2027, got {sel_text}"
        
        # Take final screenshot
        page.screenshot(path="verify_round_selection_all_seasons.png")
        print("ALL SEASONS ROUND SELECTION VERIFIED SUCCESSFULLY!")
        browser.close()

if __name__ == '__main__':
    test_all_seasons_round_selection()
