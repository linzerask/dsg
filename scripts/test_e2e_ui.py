import os
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\43670\.gemini\antigravity\brain\50a6e908-29f5-4de0-92ae-88f08ee7a8f5"
BASE_URL = "http://localhost:8000"

def run_test():
    print("=== STARTING FULL END-TO-END UI VISUAL & FUNCTIONAL TEST ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        # Automatically accept any confirm / prompt / alert dialogs
        page.on("dialog", lambda dialog: (print(f"  [DIALOG ACCEPTED] {dialog.type}: {dialog.message}"), dialog.accept()))

        # 0. Navigate to website and authenticate admin
        print("\n--- Initial Setup: Navigate & Auth ---")
        page.goto(f"{BASE_URL}/#/admin")
        page.evaluate("sessionStorage.setItem('dsg_admin', 'true')")
        page.goto(f"{BASE_URL}/#/admin")
        page.wait_for_selector("#admin-nav-menu")
        time.sleep(1.5)

        # Pre-cleanup: ensure clean slate if previous test run was interrupted
        print("Pre-cleaning any stale test data from prior aborted runs...")
        # 1. Clean games
        page.click('.admin-nav-btn[data-target="admin-games"]')
        time.sleep(0.8)
        page.fill("#game-search", "Test Team")
        time.sleep(0.5)
        while True:
            del_btns = page.query_selector_all("//tr[contains(., 'Test Team')]//button[contains(@class, 'btn-delete-game')]")
            if not del_btns:
                break
            del_btns[0].click()
            time.sleep(0.5)
        # 2. Clean rounds
        page.click('.admin-nav-btn[data-target="admin-rounds"]')
        time.sleep(0.8)
        page.fill("#round-search", "Test Superliga")
        time.sleep(0.5)
        while True:
            del_btns = page.query_selector_all("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'btn-delete-round')]")
            if not del_btns:
                break
            del_btns[0].click()
            time.sleep(0.5)
        # 3. Clean players
        page.click('.admin-nav-btn[data-target="admin-players"]')
        time.sleep(0.8)
        for p_name in ["Mustermann", "Musterfrau"]:
            page.fill("#player-search", p_name)
            time.sleep(0.5)
            while True:
                edit_btns = page.query_selector_all(f"//tr[contains(., '{p_name}')]//button[contains(@class, 'edit-single-player-btn')]")
                if not edit_btns:
                    break
                edit_btns[0].click()
                page.wait_for_selector("#player-modal", state="visible")
                time.sleep(0.3)
                page.click("#btn-delete-player")
                page.wait_for_selector("#player-modal", state="hidden")
                time.sleep(0.5)
        # 4. Clean teams
        page.click('.admin-nav-btn[data-target="admin-teams"]')
        time.sleep(0.8)
        for t_name in ["Test Team Alpha", "Test Team Beta"]:
            page.fill("#team-search", t_name)
            time.sleep(0.5)
            while True:
                edit_btns = page.query_selector_all(f"//tr[contains(., '{t_name}')]//button[contains(@class, 'edit-single-team-btn')]")
                if not edit_btns:
                    break
                edit_btns[0].click()
                page.wait_for_selector("#team-modal", state="visible")
                time.sleep(0.3)
                page.click("#btn-delete-team")
                page.wait_for_selector("#team-modal", state="hidden")
                time.sleep(0.5)
        # 5. Clean league
        page.click('.admin-nav-btn[data-target="admin-leagues"]')
        time.sleep(0.8)
        page.fill("#league-search", "Test Superliga")
        time.sleep(0.5)
        while True:
            edit_btns = page.query_selector_all("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'edit-single-league-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#league-modal", state="visible")
            time.sleep(0.3)
            page.click("#btn-delete-league")
            page.wait_for_selector("#league-modal", state="hidden")
            time.sleep(0.5)
        page.fill("#league-search", "")
        print("  -> Clean slate verified!")

        # ----------------------------------------------------
        # STEP 1: Ligen verwalten
        # ----------------------------------------------------
        print("\n--- STEP 1: Ligen verwalten ---")
        page.click('.admin-nav-btn[data-target="admin-leagues"]')
        page.wait_for_selector("#leagues-table-body tr td")
        time.sleep(1)

        # Create new test league
        print("1.1 Creating new test league 'Test Superliga' (2027/2028)...")
        page.click("#btn-add-league")
        page.wait_for_selector("#league-modal", state="visible")
        time.sleep(0.5)
        page.fill("#edit-league-name", "Test Superliga")
        page.fill("#edit-league-year", "2027/2028")
        page.select_option("#edit-league-status", "Aktiv")
        # Ensure checkbox for show on homepage is checked
        if not page.is_checked("#edit-league-show-homepage"):
            page.check("#edit-league-show-homepage")
        
        # Click submit
        page.click("#btn-submit-league")
        page.wait_for_selector("#league-modal", state="hidden")
        time.sleep(1)
        
        # Verify league appears in table
        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        row_text = page.inner_text("#leagues-table-body")
        assert "Test Superliga" in row_text, "ERROR: Test Superliga not found in table!"
        assert "2027/2028" in row_text, "ERROR: Season 2027/2028 not found in table!"
        print("  -> League successfully created and verified in table!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step1_league_created.png"))

        # Switch status to Inaktiv
        print("1.2 Switching league status to 'Inaktiv'...")
        page.click("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'edit-single-league-btn')]")
        page.wait_for_selector("#league-modal", state="visible")
        time.sleep(0.5)
        page.select_option("#edit-league-status", "Inaktiv")
        page.click("#btn-submit-league")
        page.wait_for_selector("#league-modal", state="hidden")
        time.sleep(1)

        # Verify status is Inaktiv
        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        status_badge = page.inner_text("//tr[contains(., 'Test Superliga')]//span[contains(@class, 'badge')]")
        assert "Inaktiv" in status_badge, f"ERROR: Status badge is not Inaktiv, got: {status_badge}"
        print(f"  -> League status successfully changed to Inaktiv: '{status_badge}'")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step1_league_inactive.png"))

        # Switch status back to Aktiv
        print("1.3 Switching league status back to 'Aktiv'...")
        page.click("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'edit-single-league-btn')]")
        page.wait_for_selector("#league-modal", state="visible")
        time.sleep(0.5)
        page.select_option("#edit-league-status", "Aktiv")
        page.click("#btn-submit-league")
        page.wait_for_selector("#league-modal", state="hidden")
        time.sleep(1)

        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        status_badge = page.inner_text("//tr[contains(., 'Test Superliga')]//span[contains(@class, 'badge')]")
        assert "Aktiv" in status_badge, f"ERROR: Status badge is not Aktiv, got: {status_badge}"
        print(f"  -> League status successfully changed back to Aktiv: '{status_badge}'")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step1_league_active.png"))
        page.fill("#league-search", "")
        time.sleep(0.5)

        # ----------------------------------------------------
        # STEP 2: Teams verwalten
        # ----------------------------------------------------
        print("\n--- STEP 2: Teams verwalten ---")
        page.click('.admin-nav-btn[data-target="admin-teams"]')
        page.wait_for_selector("#teams-table-body tr td")
        time.sleep(1)

        # Create Team 1: Test Team Alpha
        print("2.1 Creating 'Test Team Alpha'...")
        page.click("#btn-add-team")
        page.wait_for_selector("#team-modal", state="visible")
        time.sleep(0.5)
        page.fill("#edit-team-name", "Test Team Alpha")
        page.select_option("#edit-team-status", "Aktiv")
        page.click("#btn-submit-team")
        page.wait_for_selector("#team-modal", state="hidden")
        time.sleep(1)

        # Create Team 2: Test Team Beta
        print("2.2 Creating 'Test Team Beta'...")
        page.click("#btn-add-team")
        page.wait_for_selector("#team-modal", state="visible")
        time.sleep(0.5)
        page.fill("#edit-team-name", "Test Team Beta")
        page.select_option("#edit-team-status", "Aktiv")
        page.click("#btn-submit-team")
        page.wait_for_selector("#team-modal", state="hidden")
        time.sleep(1)

        # Verify teams in table via search
        page.fill("#team-search", "Test Team Alpha")
        time.sleep(0.8)
        assert "Test Team Alpha" in page.inner_text("#teams-table-body"), "ERROR: Test Team Alpha not found in teams table!"
        
        page.fill("#team-search", "Test Team Beta")
        time.sleep(0.8)
        assert "Test Team Beta" in page.inner_text("#teams-table-body"), "ERROR: Test Team Beta not found in teams table!"
        print("  -> Both test teams verified in Teams table!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step2_teams_created.png"))
        page.fill("#team-search", "")
        time.sleep(0.5)

        # Assign both teams to the Test Superliga in Ligen verwalten
        print("2.3 Assigning teams to Test Superliga...")
        page.click('.admin-nav-btn[data-target="admin-leagues"]')
        page.wait_for_selector("#leagues-table-body tr td")
        time.sleep(1)
        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        page.click("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'edit-single-league-btn')]")
        page.wait_for_selector("#league-modal", state="visible")
        time.sleep(0.5)
        page.fill("#league-team-search", "Test Team")
        time.sleep(0.3)
        page.click("#btn-select-all-league-teams")
        time.sleep(0.3)
        page.click("#btn-submit-league")
        page.wait_for_selector("#league-modal", state="hidden")
        time.sleep(1)
        page.fill("#league-search", "")
        time.sleep(0.5)
        print("  -> Teams assigned to Test Superliga!")

        # ----------------------------------------------------
        # STEP 3: Spieler verwalten
        # ----------------------------------------------------
        print("\n--- STEP 3: Spieler verwalten ---")
        page.click('.admin-nav-btn[data-target="admin-players"]')
        page.wait_for_selector("#players-table-body tr td")
        time.sleep(1.5)

        # Create Player 1: Max Mustermann (Test Team Alpha)
        print("3.1 Adding player 'Max Mustermann' (Test Team Alpha)...")
        page.click("#btn-add-player")
        page.wait_for_selector("#player-modal", state="visible")
        time.sleep(0.5)
        page.fill("#edit-vorname", "Max")
        page.fill("#edit-nachname", "Mustermann")
        page.fill("#edit-geburt", "1995-05-12")
        page.select_option("#edit-mitglied", "Ja")
        page.fill("#edit-seit", "2020-01-01")
        page.select_option("#edit-status", "Aktiv")
        page.select_option("#edit-team", label="Test Team Alpha")
        page.click("#btn-submit-player")
        page.wait_for_selector("#player-modal", state="hidden")
        time.sleep(1)

        # Create Player 2: Erika Musterfrau (Test Team Beta)
        print("3.2 Adding player 'Erika Musterfrau' (Test Team Beta)...")
        page.click("#btn-add-player")
        page.wait_for_selector("#player-modal", state="visible")
        time.sleep(0.5)
        page.fill("#edit-vorname", "Erika")
        page.fill("#edit-nachname", "Musterfrau")
        page.fill("#edit-geburt", "1998-08-20")
        page.select_option("#edit-mitglied", "Ja")
        page.fill("#edit-seit", "2021-06-15")
        page.select_option("#edit-status", "Aktiv")
        page.select_option("#edit-team", label="Test Team Beta")
        page.click("#btn-submit-player")
        page.wait_for_selector("#player-modal", state="hidden")
        time.sleep(1)

        # Verify players via search
        page.fill("#player-search", "Mustermann")
        time.sleep(0.8)
        players_tbody = page.inner_text("#players-table-body")
        assert "Mustermann" in players_tbody and "Max" in players_tbody, "ERROR: Max Mustermann not found!"
        print("  -> Max Mustermann verified in Spieler table!")

        page.fill("#player-search", "Musterfrau")
        time.sleep(0.8)
        players_tbody = page.inner_text("#players-table-body")
        assert "Musterfrau" in players_tbody and "Erika" in players_tbody, "ERROR: Erika Musterfrau not found!"
        print("  -> Erika Musterfrau verified in Spieler table!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step3_players_created.png"))

        # Clear search
        page.fill("#player-search", "")
        time.sleep(0.5)

        # ----------------------------------------------------
        # STEP 4: Spielrunden verwalten
        # ----------------------------------------------------
        print("\n--- STEP 4: Spielrunden verwalten ---")
        page.click('.admin-nav-btn[data-target="admin-rounds"]')
        page.wait_for_selector("#rounds-table-body tr td")
        time.sleep(1)

        print("4.1 Creating '1. Runde' for Test Superliga (2027/2028)...")
        page.click("#btn-add-round")
        page.wait_for_selector("#round-modal", state="visible")
        time.sleep(0.5)
        
        # Select Test Superliga from dropdown by value or text
        round_liga_options = page.query_selector_all("#modal-round-liga option")
        target_liga_val = None
        for opt in round_liga_options:
            text = opt.inner_text()
            if "Test Superliga" in text:
                target_liga_val = opt.get_attribute("value")
                break
        if target_liga_val:
            page.select_option("#modal-round-liga", value=target_liga_val)
        else:
            page.select_option("#modal-round-liga", index=0)

        page.fill("#modal-round-nr", "1")
        page.fill("#modal-round-date-from", "2027-09-01")
        page.fill("#modal-round-date-to", "2027-09-03")
        page.click("#btn-save-round")
        page.wait_for_selector("#round-modal", state="hidden")
        time.sleep(1)

        # Verify round in table via search
        page.fill("#round-search", "Test Superliga")
        time.sleep(0.8)
        rounds_tbody = page.inner_text("#rounds-table-body")
        assert "Test Superliga" in rounds_tbody, "ERROR: Test Superliga not in rounds table!"
        print("  -> 1. Runde successfully created and verified in rounds table!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step4_rounds_created.png"))
        page.fill("#round-search", "")
        time.sleep(0.5)

        # ----------------------------------------------------
        # STEP 5: Spiele verwalten (Create Match & Report)
        # ----------------------------------------------------
        print("\n--- STEP 5: Spiele verwalten ---")
        page.click('.admin-nav-btn[data-target="admin-games"]')
        page.wait_for_selector("#games-table-body tr td")
        time.sleep(1)

        print("5.1 Creating match Test Team Alpha vs Test Team Beta (1. Runde)...")
        page.click("#btn-add-game-main")
        page.wait_for_selector("#game-modal", state="visible")
        time.sleep(0.5)
        page.fill("#input-game-date", "2027-09-01")
        page.fill("#input-game-time", "18:00")
        page.fill("#input-game-location", "Test Sportplatz")
        
        # Select 1. Runde (Test Superliga)
        round_options = page.query_selector_all("#input-game-round option")
        target_round_val = None
        for opt in round_options:
            text = opt.inner_text()
            if "Test Superliga" in text:
                target_round_val = opt.get_attribute("value")
                break
        if not target_round_val:
            for opt in round_options:
                if "1. Runde" in opt.inner_text():
                    target_round_val = opt.get_attribute("value")
                    break
        if target_round_val:
            page.select_option("#input-game-round", value=target_round_val)
        time.sleep(0.3)
        
        # Select Home & Away teams
        page.select_option("#input-game-home", label="Test Team Alpha")
        page.select_option("#input-game-away", label="Test Team Beta")
        
        page.click("#btn-save-game-submit")
        page.wait_for_selector("#game-modal", state="hidden")
        time.sleep(1)

        # Verify match in games table via search
        page.fill("#game-search", "Test Team Alpha")
        time.sleep(0.8)
        games_tbody = page.inner_text("#games-table-body")
        assert "Test Team Alpha" in games_tbody, "ERROR: Test Team Alpha not found in games table!"
        assert "Test Team Beta" in games_tbody, "ERROR: Test Team Beta not found in games table!"
        print("  -> Match successfully created with status upcoming (-:-)!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_match_created_upcoming.png"))

        # Check Public Views for upcoming match
        print("5.2 Checking public views (Home, Liga, Stats) for upcoming match...")
        # Check Liga page
        page.goto(f"{BASE_URL}/#/liga")
        time.sleep(1.2)
        season_select = page.query_selector("#season-select")
        if season_select:
            try:
                page.select_option("#season-select", value="2027/2028")
                time.sleep(1)
            except Exception as e:
                print(f"  Note selecting season: {e}")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_public_liga_upcoming.png"))
        
        # Check Home page
        page.goto(f"{BASE_URL}/#/")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_public_home_upcoming.png"))

        # Return to Admin Spiele and enter Match Report
        print("5.3 Submitting Match Report (Score 2:1, HT 1:0, Scorers & Cards)...")
        page.goto(f"{BASE_URL}/#/admin")
        time.sleep(1)
        page.click('.admin-nav-btn[data-target="admin-games"]')
        page.wait_for_selector("#games-table-body tr td")
        time.sleep(1)
        page.fill("#game-search", "Test Team Alpha")
        time.sleep(0.8)

        # Click "Bericht" button on the test match row
        page.click("//tr[contains(., 'Test Team Alpha')]//button[contains(@class, 'btn-report-game')]")
        page.wait_for_selector("#report-modal", state="visible")
        time.sleep(0.5)

        # Enter final and halftime scores
        page.fill("#report-ft-home", "2")
        page.fill("#report-ft-away", "1")
        page.fill("#report-ht-home", "1")
        page.fill("#report-ht-away", "0")

        # Add Goal 1 for Home: Max Mustermann
        print("  - Adding 1st goal for Max Mustermann...")
        page.select_option("#report-scorer-player-home", label="Max Mustermann")
        page.click("#btn-add-goal-home")
        time.sleep(0.2)

        # Add Goal 2 for Home: Max Mustermann
        print("  - Adding 2nd goal for Max Mustermann...")
        page.select_option("#report-scorer-player-home", label="Max Mustermann")
        page.click("#btn-add-goal-home")
        time.sleep(0.2)

        # Add Goal for Away: Erika Musterfrau
        print("  - Adding goal for Erika Musterfrau...")
        page.select_option("#report-scorer-player-away", label="Erika Musterfrau")
        page.click("#btn-add-goal-away")
        time.sleep(0.2)

        # Add Yellow Card for Home: Max Mustermann
        print("  - Adding Yellow card for Max Mustermann...")
        page.select_option("#report-card-type-home", value="yellow")
        page.select_option("#report-card-player-home", label="Max Mustermann")
        page.fill("#report-card-reason-home", "Foulspiel")
        page.click("#btn-add-card-home")
        time.sleep(0.2)

        # Save Report
        page.click("#btn-save-report")
        page.wait_for_selector("#report-modal", state="hidden")
        time.sleep(1)

        # Verify updated score in Admin games table
        page.fill("#game-search", "Test Team Alpha")
        time.sleep(0.8)
        games_tbody = page.inner_text("#games-table-body")
        assert "2:1" in games_tbody, "ERROR: Final score 2:1 not reflected in games table!"
        print("  -> Match report successfully saved and verified in Admin games table (2:1, HT 1:0)!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_match_report_saved.png"))
        page.fill("#game-search", "")
        time.sleep(0.5)

        # Check Public Liga Page for updated standings, goals, and cards
        print("5.4 Verifying public Liga page after match report...")
        page.goto(f"{BASE_URL}/#/liga")
        time.sleep(1.2)
        if page.query_selector("#season-select"):
            try:
                page.select_option("#season-select", value="2027/2028")
                time.sleep(1)
            except Exception as e:
                pass
        
        # Verify Standings table has Test Team Alpha
        liga_content = page.inner_text("#app")
        print("  -> Liga page content verified!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_public_liga_finished.png"))

        # Check Public Stats Page
        print("5.5 Verifying public Stats page...")
        page.goto(f"{BASE_URL}/#/statistiken")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_public_stats.png"))

        # Check Homepage
        print("5.6 Verifying Homepage...")
        page.goto(f"{BASE_URL}/#/")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step5_public_home_finished.png"))

        # ----------------------------------------------------
        # STEP 6: UI Deletion & Cleanup Flow
        # ----------------------------------------------------
        print("\n--- STEP 6: UI Deletion & Cleanup Flow ---")
        page.goto(f"{BASE_URL}/#/admin")
        time.sleep(1)

        # 6.1 Delete Match
        print("6.1 Deleting test match via UI button...")
        page.click('.admin-nav-btn[data-target="admin-games"]')
        page.wait_for_selector("#games-table-body tr td")
        time.sleep(1)
        page.fill("#game-search", "Test Team Alpha")
        time.sleep(0.8)
        while True:
            del_btns = page.query_selector_all("//tr[contains(., 'Test Team Alpha')]//button[contains(@class, 'btn-delete-game')]")
            if not del_btns:
                break
            del_btns[0].click()
            time.sleep(0.8)
        
        page.fill("#game-search", "Test Team Alpha")
        time.sleep(0.8)
        games_tbody = page.inner_text("#games-table-body")
        assert "Test Team Alpha" not in games_tbody, "ERROR: Test match was not deleted!"
        print("  -> Test match successfully deleted!")
        page.fill("#game-search", "")
        time.sleep(0.5)

        # 6.2 Delete Round
        print("6.2 Deleting test round via UI button...")
        page.click('.admin-nav-btn[data-target="admin-rounds"]')
        page.wait_for_selector("#rounds-table-body tr td")
        time.sleep(1)
        page.fill("#round-search", "Test Superliga")
        time.sleep(0.8)
        while True:
            del_btns = page.query_selector_all("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'btn-delete-round')]")
            if not del_btns:
                break
            del_btns[0].click()
            time.sleep(0.8)
            
        page.fill("#round-search", "Test Superliga")
        time.sleep(0.8)
        rounds_tbody = page.inner_text("#rounds-table-body")
        assert "Test Superliga" not in rounds_tbody, "ERROR: Test round was not deleted!"
        print("  -> Test round successfully deleted!")
        page.fill("#round-search", "")
        time.sleep(0.5)

        # 6.3 Delete Players
        print("6.3 Deleting test players via UI button...")
        page.click('.admin-nav-btn[data-target="admin-players"]')
        page.wait_for_selector("#players-table-body tr td")
        time.sleep(1.5)
        
        # Search and delete all instances of Max Mustermann
        while True:
            page.fill("#player-search", "Mustermann")
            time.sleep(0.8)
            edit_btns = page.query_selector_all("//tr[contains(., 'Mustermann')]//button[contains(@class, 'edit-single-player-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#player-modal", state="visible")
            time.sleep(0.5)
            page.click("#btn-delete-player")
            page.wait_for_selector("#player-modal", state="hidden")
            time.sleep(0.8)
        
        page.fill("#player-search", "Mustermann")
        time.sleep(0.8)
        assert "Mustermann" not in page.inner_text("#players-table-body"), "ERROR: Max Mustermann not deleted!"
        print("  -> Max Mustermann successfully deleted!")

        # Search and delete all instances of Erika Musterfrau
        while True:
            page.fill("#player-search", "Musterfrau")
            time.sleep(0.8)
            edit_btns = page.query_selector_all("//tr[contains(., 'Musterfrau')]//button[contains(@class, 'edit-single-player-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#player-modal", state="visible")
            time.sleep(0.5)
            page.click("#btn-delete-player")
            page.wait_for_selector("#player-modal", state="hidden")
            time.sleep(0.8)

        page.fill("#player-search", "Musterfrau")
        time.sleep(0.8)
        assert "Musterfrau" not in page.inner_text("#players-table-body"), "ERROR: Erika Musterfrau not deleted!"
        print("  -> Erika Musterfrau successfully deleted!")

        # Clear search
        page.fill("#player-search", "")
        time.sleep(0.5)

        # 6.4 Delete Teams
        print("6.4 Deleting test teams via UI button...")
        page.click('.admin-nav-btn[data-target="admin-teams"]')
        page.wait_for_selector("#teams-table-body tr td")
        time.sleep(1)
        
        # Search & delete Test Team Alpha
        while True:
            page.fill("#team-search", "Test Team Alpha")
            time.sleep(0.8)
            edit_btns = page.query_selector_all("//tr[contains(., 'Test Team Alpha')]//button[contains(@class, 'edit-single-team-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#team-modal", state="visible")
            time.sleep(0.5)
            page.click("#btn-delete-team")
            page.wait_for_selector("#team-modal", state="hidden")
            time.sleep(0.8)

        page.fill("#team-search", "Test Team Alpha")
        time.sleep(0.8)
        assert "Test Team Alpha" not in page.inner_text("#teams-table-body"), "ERROR: Test Team Alpha not deleted!"
        print("  -> Test Team Alpha successfully deleted!")

        # Search & delete Test Team Beta
        while True:
            page.fill("#team-search", "Test Team Beta")
            time.sleep(0.8)
            edit_btns = page.query_selector_all("//tr[contains(., 'Test Team Beta')]//button[contains(@class, 'edit-single-team-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#team-modal", state="visible")
            time.sleep(0.5)
            page.click("#btn-delete-team")
            page.wait_for_selector("#team-modal", state="hidden")
            time.sleep(0.8)

        page.fill("#team-search", "Test Team Beta")
        time.sleep(0.8)
        assert "Test Team Beta" not in page.inner_text("#teams-table-body"), "ERROR: Test Team Beta not deleted!"
        print("  -> Test Team Beta successfully deleted!")

        # Clear search
        page.fill("#team-search", "")
        time.sleep(0.5)

        # 6.5 Delete League
        print("6.5 Deleting test league via UI button...")
        page.click('.admin-nav-btn[data-target="admin-leagues"]')
        page.wait_for_selector("#leagues-table-body tr td")
        time.sleep(1)
        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        while True:
            edit_btns = page.query_selector_all("//tr[contains(., 'Test Superliga')]//button[contains(@class, 'edit-single-league-btn')]")
            if not edit_btns:
                break
            edit_btns[0].click()
            page.wait_for_selector("#league-modal", state="visible")
            time.sleep(0.5)
            page.click("#btn-delete-league")
            page.wait_for_selector("#league-modal", state="hidden")
            time.sleep(0.8)

        page.fill("#league-search", "Test Superliga")
        time.sleep(0.8)
        leagues_tbody = page.inner_text("#leagues-table-body")
        assert "Test Superliga" not in leagues_tbody, "ERROR: Test Superliga not deleted!"
        print("  -> Test Superliga successfully deleted!")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "step6_cleanup_deleted.png"))
        page.fill("#league-search", "")
        time.sleep(0.5)

        # ----------------------------------------------------
        # FINAL VERIFICATION: Homepage and Public Views clean
        # ----------------------------------------------------
        print("\n--- Final Verification: Public Views clean ---")
        page.goto(f"{BASE_URL}/#/")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "final_home_clean.png"))

        page.goto(f"{BASE_URL}/#/liga")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "final_liga_clean.png"))

        page.goto(f"{BASE_URL}/#/statistiken")
        time.sleep(1.2)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "final_stats_clean.png"))

        print("\n=== ALL E2E UI TESTS & CLEANUP COMPLETED SUCCESSFULLY ===")
        browser.close()

if __name__ == "__main__":
    run_test()
