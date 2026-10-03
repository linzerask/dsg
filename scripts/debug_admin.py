from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
    
    page.goto('http://localhost:8000/#/admin', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)
    
    print("Page title:", page.title())
    print("Active hash:", page.evaluate("() => window.location.hash"))
    print("Admin layout exists:", page.locator('.admin-layout').count())
    print("Nav buttons:", page.locator('.admin-nav-btn').count())
    for i in range(page.locator('.admin-nav-btn').count()):
        btn = page.locator('.admin-nav-btn').nth(i)
        print(f"  btn {i}: {btn.get_attribute('data-target')} text: {btn.inner_text().strip()}")
    
    # Click games button
    print("Clicking games tab...")
    page.locator('.admin-nav-btn[data-target="admin-games"]').click()
    page.wait_for_timeout(3000)
    
    print("Admin games section display:", page.locator('#admin-games').evaluate("el => el.style.display"))
    print("Desktop table rows:", page.locator('#games-table-body tr').count())
    print("First row text:", page.locator('#games-table-body tr').first.inner_text())
    
    page.screenshot(path='C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/debug_admin.png')
    browser.close()
