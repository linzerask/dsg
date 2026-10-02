import asyncio
import json
import os
import re
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(line_buffering=True)

ARTIFACT_DIR = r"C:\Users\43670\.gemini\antigravity\brain\50a6e908-29f5-4de0-92ae-88f08ee7a8f5"

def normalize_team(name):
    s = (name or '').lower()
    s = re.sub(r'fc|dsg|sv|u\.|union|\.', '', s)
    return re.sub(r'\s+', '', s).strip()

async def run_visual_spiele_modal_audit():
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga_data = json.load(f)
        
    print("=== STARTING PLAYWRIGHT ADMIN SPIELE MODAL AUDIT ===", flush=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()
        
        # Navigate to home and log in as admin
        await page.goto("http://localhost:8000", wait_until="domcontentloaded")
        await page.evaluate("""() => {
            sessionStorage.setItem('dsg_admin', 'true');
            window.location.hash = '#/admin';
        }""")
        
        # Wait for admin navigation menu
        await page.wait_for_selector('button[data-target="admin-games"]', timeout=15000)
        await asyncio.sleep(0.5)
        
        # Click the Spiele tab button
        await page.click('button[data-target="admin-games"]')
        
        # Wait for games table to render
        await page.wait_for_selector("#games-table-body", timeout=15000)
        await asyncio.sleep(1.0)
        
        print("Admin Spiele Tab loaded successfully!", flush=True)
        
        all_matches_in_db = []
        for s_key, s_val in liga_data.get('seasons', {}).items():
            for m in s_val.get('matches', []):
                all_matches_in_db.append((s_key, m))
                
        print(f"Total matches in database to audit: {len(all_matches_in_db)}", flush=True)
        
        results = {
            "total_games_tested": 0,
            "perfect_modal_matches": 0,
            "screenshots_taken": [],
            "mismatches": [],
            "season_summaries": {}
        }
        
        seasons = list(liga_data.get('seasons', {}).keys())
        
        for s_key in seasons:
            s_data = liga_data['seasons'][s_key]
            matches = s_data.get('matches', [])
            print(f"\n--- Testing Season '{s_key}' ({len(matches)} matches) ---", flush=True)
            
            season_perfect = 0
            season_mismatches = []
            
            # Switch season in filter dropdown if available
            await page.evaluate(f"""(sKey) => {{
                const filter = document.getElementById('game-league-filter');
                if (filter) {{
                    const opt = Array.from(filter.options).find(o => o.value === sKey || o.text.includes(sKey));
                    if (opt) {{
                        filter.value = opt.value;
                        filter.dispatchEvent(new Event('change'));
                    }}
                }}
            }}""", s_key)
            await asyncio.sleep(0.3)
            
            for m_idx, match in enumerate(matches):
                home = match.get('home', '')
                away = match.get('away', '')
                db_score = match.get('score', '')
                db_ht = match.get('ht', '')
                db_status = match.get('status', '')
                
                raw_scorers = match.get('scorers') if (match.get('scorers') and len(match.get('scorers')) > 0) else [e for e in match.get('events', []) if e.get('type') == 'goal']
                raw_cards = match.get('cards') if (match.get('cards') and len(match.get('cards')) > 0) else [e for e in match.get('events', []) if e.get('type') in ['yellow', 'yellowRed', 'yellow-red', 'gelbrot', 'red']]
                
                # Open modal via view method, scroll to bottom, and read DOM
                modal_data = await page.evaluate("""(matchObj) => {
                    if (typeof window.openAdminReportModalForGame === 'function') {
                        window.openAdminReportModalForGame(matchObj);
                    }
                    
                    const modal = document.getElementById('report-modal');
                    if (!modal) return { error: 'modal not found' };
                    
                    modal.style.display = 'flex';
                    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
                    
                    // Scroll to the bottom of the modal content
                    if (content) {
                        content.scrollTop = content.scrollHeight;
                    }
                    
                    const title = (document.getElementById('report-match-title') || {}).innerText || '';
                    const meta = (document.getElementById('report-match-meta') || {}).innerText || '';
                    const ftHome = (document.getElementById('report-ft-home') || {}).value || '';
                    const ftAway = (document.getElementById('report-ft-away') || {}).value || '';
                    const htHome = (document.getElementById('report-ht-home') || {}).value || '';
                    const htAway = (document.getElementById('report-ht-away') || {}).value || '';
                    const note = (document.getElementById('report-note') || {}).value || '';
                    const cancelStatus = (document.getElementById('report-cancel-select') || {}).value || '';
                    
                    // Scorers
                    const homeScorerEls = Array.from(document.querySelectorAll('#report-goals-list-home strong'));
                    const awayScorerEls = Array.from(document.querySelectorAll('#report-goals-list-away strong'));
                    const homeScorers = homeScorerEls.map(el => el.innerText.trim());
                    const awayScorers = awayScorerEls.map(el => el.innerText.trim());
                    
                    // Cards
                    const homeCardEls = Array.from(document.querySelectorAll('#report-cards-list-home > div'));
                    const homeCards = homeCardEls.map(el => {
                        const badge = el.querySelector('span') ? el.querySelector('span').innerText.trim() : '';
                        const name = el.querySelector('strong') ? el.querySelector('strong').innerText.trim() : '';
                        return { type: badge, player: name };
                    });
                    
                    const awayCardEls = Array.from(document.querySelectorAll('#report-cards-list-away > div'));
                    const awayCards = awayCardEls.map(el => {
                        const badge = el.querySelector('span') ? el.querySelector('span').innerText.trim() : '';
                        const name = el.querySelector('strong') ? el.querySelector('strong').innerText.trim() : '';
                        return { type: badge, player: name };
                    });
                    
                    // Close modal
                    modal.style.display = 'none';
                    
                    return {
                        title,
                        meta,
                        ftHome,
                        ftAway,
                        htHome,
                        htAway,
                        note,
                        cancelStatus,
                        homeScorers,
                        awayScorers,
                        homeCards,
                        awayCards,
                        scrollHeight: content ? content.scrollHeight : 0,
                        scrollTop: content ? content.scrollTop : 0
                    };
                }""", match)
                
                results["total_games_tested"] += 1
                
                is_forfeit_home = db_status == 'Abgesagt 3:0' or (db_status == 'Abgesagt' and db_score and '3:0' in db_score)
                is_forfeit_away = db_status == 'Abgesagt 0:3' or (db_status == 'Abgesagt' and db_score and '0:3' in db_score)
                
                exp_cancel = 'none'
                exp_ft_home, exp_ft_away = "", ""
                
                if is_forfeit_home:
                    exp_cancel = 'Abgesagt 3:0'
                    exp_ft_home, exp_ft_away = "3", "0"
                elif is_forfeit_away:
                    exp_cancel = 'Abgesagt 0:3'
                    exp_ft_home, exp_ft_away = "0", "3"
                elif db_status in ['Postponed', 'Verschoben']:
                    exp_cancel = 'Postponed'
                elif db_status in ['Canceled', 'Abgesagt']:
                    exp_cancel = 'Canceled'
                elif db_score and ':' in db_score and db_score != '-:-':
                    clean_sc = re.sub(r'\s*\([^)]*\)', '', db_score).strip()
                    clean_sc = re.sub(r'[^\d:]', '', clean_sc)
                    if ':' in clean_sc:
                        parts = clean_sc.split(':')
                        exp_ft_home, exp_ft_away = parts[0].strip(), parts[1].strip()
                    
                # Scorers
                exp_home_scorers = []
                exp_away_scorers = []
                for s in raw_scorers:
                    s_name = s.get('name') or s.get('player') or ''
                    s_team = s.get('team') or ''
                    count = s.get('count', 1)
                    if s_team == home or normalize_team(s_team) == normalize_team(home):
                        exp_home_scorers.extend([s_name] * count)
                    else:
                        exp_away_scorers.extend([s_name] * count)
                        
                # Cards
                exp_home_cards = []
                exp_away_cards = []
                for c in raw_cards:
                    c_name = c.get('name') or c.get('player') or ''
                    c_team = c.get('team') or ''
                    c_type = c.get('type') or 'yellow'
                    badge_lbl = 'Gelb' if c_type == 'yellow' else ('Gelb-Rot' if c_type in ['yellowRed', 'yellow-red', 'gelbrot'] else 'Rot')
                    if c_team == home or normalize_team(c_team) == normalize_team(home):
                        exp_home_cards.append((badge_lbl, c_name))
                    else:
                        exp_away_cards.append((badge_lbl, c_name))
                        
                mismatch_reasons = []
                
                # Check status
                if exp_cancel != 'none':
                    if modal_data.get('cancelStatus') != exp_cancel:
                        mismatch_reasons.append(f"Cancel status: modal '{modal_data.get('cancelStatus')}' vs expected '{exp_cancel}'")
                
                # Check scores
                if modal_data.get('ftHome') != exp_ft_home or modal_data.get('ftAway') != exp_ft_away:
                    mismatch_reasons.append(f"Score: modal '{modal_data.get('ftHome')}:{modal_data.get('ftAway')}' vs expected '{exp_ft_home}:{exp_ft_away}'")
                        
                if len(modal_data.get('homeScorers', [])) != len(exp_home_scorers):
                    mismatch_reasons.append(f"Home scorers: modal {len(modal_data.get('homeScorers', []))} vs DB {len(exp_home_scorers)}")
                    
                if len(modal_data.get('awayScorers', [])) != len(exp_away_scorers):
                    mismatch_reasons.append(f"Away scorers: modal {len(modal_data.get('awayScorers', []))} vs DB {len(exp_away_scorers)}")
                    
                if len(modal_data.get('homeCards', [])) != len(exp_home_cards):
                    mismatch_reasons.append(f"Home cards: modal {len(modal_data.get('homeCards', []))} vs DB {len(exp_home_cards)}")
                    
                if len(modal_data.get('awayCards', [])) != len(exp_away_cards):
                    mismatch_reasons.append(f"Away cards: modal {len(modal_data.get('awayCards', []))} vs DB {len(exp_away_cards)}")
                    
                if mismatch_reasons:
                    item_err = {
                        "season": s_key,
                        "game": f"{home} vs {away} ({match.get('date')})",
                        "errors": mismatch_reasons
                    }
                    results["mismatches"].append(item_err)
                    season_mismatches.append(item_err)
                else:
                    results["perfect_modal_matches"] += 1
                    season_perfect += 1
                    
            results["season_summaries"][s_key] = {
                "total": len(matches),
                "perfect": season_perfect,
                "mismatches": season_mismatches
            }
            print(f"Season '{s_key}': {season_perfect} / {len(matches)} verified perfect in Modal DOM", flush=True)
            
            # Take visual screenshot of a sample match with scorers and cards
            # Pick a match that has both scorers and cards if available
            sample_match = next((m for m in matches if (m.get('scorers') or m.get('events')) and (m.get('cards') or m.get('events'))), matches[0] if matches else None)
            if sample_match:
                await page.evaluate("""(m) => {
                    if (typeof window.openAdminReportModalForGame === 'function') {
                        window.openAdminReportModalForGame(m);
                    }
                    const modal = document.getElementById('report-modal');
                    if (modal) {
                        modal.style.display = 'flex';
                        const content = modal.querySelector('.modal-content') || modal.firstElementChild;
                        if (content) content.scrollTop = content.scrollHeight;
                    }
                }""", sample_match)
                await asyncio.sleep(0.6)
                
                safe_name = re.sub(r'[^a-zA-Z0-9_]', '_', s_key)
                screenshot_filename = f"report_modal_bottom_{safe_name}.png"
                screenshot_path = os.path.join(ARTIFACT_DIR, screenshot_filename)
                await page.screenshot(path=screenshot_path)
                results["screenshots_taken"].append({
                    "season": s_key,
                    "filename": screenshot_filename,
                    "match": f"{sample_match.get('home')} vs {sample_match.get('away')}"
                })
                print(f"Saved visual screenshot for {s_key}: {screenshot_filename}", flush=True)
                
                # Close modal
                await page.evaluate("""() => {
                    const modal = document.getElementById('report-modal');
                    if (modal) modal.style.display = 'none';
                }""")
                await asyncio.sleep(0.2)
                
        await browser.close()
        
    print("\n==========================================", flush=True)
    print("FINAL MODAL AUDIT SUMMARY ACROSS ALL SEASONS", flush=True)
    print("==========================================", flush=True)
    print(f"Total Games Tested in Modal: {results['total_games_tested']}", flush=True)
    print(f"Perfect Matches: {results['perfect_modal_matches']}", flush=True)
    print(f"Mismatches: {len(results['mismatches'])}", flush=True)
    
    with open('scripts/spiele_modal_audit_results.json', 'w', encoding='utf-8') as out_f:
        json.dump(results, out_f, indent=2, ensure_ascii=False)
        
    return results

if __name__ == '__main__':
    asyncio.run(run_visual_spiele_modal_audit())
