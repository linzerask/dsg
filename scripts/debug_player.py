from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("dialog", lambda dialog: (print(f"DIALOG: {dialog.message}"), dialog.accept()))

    page.goto("http://localhost:8000/#/admin")
    page.evaluate("sessionStorage.setItem('dsg_admin', 'true')")
    page.goto("http://localhost:8000/#/admin")
    time.sleep(1)

    # Click Spieler verwalten
    page.click('.admin-nav-btn[data-target="admin-players"]')
    time.sleep(1)

    print("Clicking #btn-add-player...")
    page.click("#btn-add-player")
    time.sleep(0.5)

    print("Modal display:", page.evaluate("document.getElementById('player-modal').style.display"))
    print("Form action/elements:", page.evaluate("""() => {
        const f = document.getElementById('player-edit-form');
        return {
            hasForm: !!f,
            hasSubmit: !!document.getElementById('btn-submit-player'),
            editId: document.getElementById('edit-player-id').value
        };
    }"""))

    page.fill("#edit-vorname", "Max")
    page.fill("#edit-nachname", "Mustermann")
    page.fill("#edit-geburt", "1995-05-12")
    page.select_option("#edit-mitglied", "Ja")
    page.fill("#edit-seit", "2020-01-01")
    page.select_option("#edit-status", "Aktiv")

    print("Submitting form...")
    page.click("#btn-submit-player")
    time.sleep(1)

    print("Modal display after submit:", page.evaluate("document.getElementById('player-modal').style.display"))
    
    # Search
    page.fill("#player-search", "Mustermann")
    time.sleep(0.5)
    print("Tbody text:", page.inner_text("#players-table-body"))

    browser.close()
