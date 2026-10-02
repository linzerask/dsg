import json
import re
from bs4 import BeautifulSoup

def normalize_name(n):
    if not n: return ""
    return re.sub(r'\s+', ' ', n).strip()

def parse_events_from_cell(cell, team_name):
    if not cell: return []
    events = []
    html_c = cell.decode_contents() if hasattr(cell, 'decode_contents') else str(cell)
    lines = re.split(r'<br\s*/?>', html_c, flags=re.IGNORECASE)
    for line in lines:
        line = line.strip()
        if not line: continue
        s_line = BeautifulSoup(line, 'html.parser')
        imgs = s_line.find_all('img')
        p_name = normalize_name(s_line.get_text())
        if not p_name: continue
        
        for img in imgs:
            alt = img.get('alt', '').lower()
            src = img.get('src', '').lower()
            if 'tor' in alt or 'tor' in src:
                events.append({"type": "goal", "player": p_name, "team": team_name})
            elif 'gelb-rot' in alt or 'gelb-rot' in src or 'gelbrot' in alt or 'gelbrot' in src:
                events.append({"type": "yellowRed", "player": p_name, "team": team_name})
            elif 'rot' in alt or 'rot' in src:
                events.append({"type": "red", "player": p_name, "team": team_name})
            elif 'gelb' in alt or 'gelb' in src:
                events.append({"type": "yellow", "player": p_name, "team": team_name})
    return events

def parse_raw_file(file_path):
    raw_bytes = open(file_path, 'rb').read()
    try:
        html = raw_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            html = raw_bytes.decode('latin-1')
        except:
            html = raw_bytes.decode('cp1252', errors='replace')
    soup = BeautifulSoup(html, 'html.parser')
    rows = soup.find_all('tr')
    
    current_round = ""
    matches = []
    i = 0
    while i < len(rows):
        row = rows[i]
        txt = row.get_text().strip()
        m_r = re.search(r'(\d+)\.\s*Runde', txt)
        if m_r and len(row.find_all(['td', 'th'])) <= 2:
            current_round = f"{m_r.group(1)}. Runde"
            i += 1
            continue
            
        tds = row.find_all(['td', 'th'])
        texts = [td.get_text().strip() for td in tds]
        if '-' in texts and len(tds) >= 4:
            dash_idx = texts.index('-')
            if 0 < dash_idx < len(texts) - 1:
                raw_date = texts[0]
                home = normalize_name(texts[dash_idx - 1])
                away = normalize_name(texts[dash_idx + 1])
                score_raw = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                
                # Parse date
                date_str = ""
                if ',' in raw_date:
                    parts = raw_date.split(',')
                    dp = parts[1].strip().split('.')
                    if len(dp) == 3:
                        day = dp[0].zfill(2)
                        month = dp[1].zfill(2)
                        yr = dp[2]
                        if len(yr) == 2: yr = "20" + yr
                        date_str = f"{day}.{month}.{yr}"
                else:
                    date_str = raw_date
                    
                score = score_raw.strip()
                ht = ""
                status = "Gespielt"
                if '*' in score_raw:
                    score = score_raw.replace('*', '').replace('Abgesagt', '').strip()
                    if '3:0' in score:
                        score = '3:0'
                        status = 'Abgesagt 3:0'
                    elif '0:3' in score:
                        score = '0:3'
                        status = 'Abgesagt 0:3'
                    else:
                        status = 'Abgesagt'
                elif '(' in score_raw and ')' in score_raw:
                    score_part = score_raw.split('(')[0].strip()
                    ht_part = score_raw.split('(')[1].replace(')', '').strip()
                    if score_part in [':', '-:-', '', '- : -'] or not score_part:
                        score = "-:-"
                        status = 'Ausstehend'
                    else:
                        score = score_part
                        ht = ht_part
                elif score_raw in ['-:-', '- : -', ':', '(:)', '', ': (:)']:
                    score = "-:-"
                    status = 'Ausstehend'
                elif not score or score == ':':
                    score = "-:-"
                    status = 'Ausstehend'
                    
                location = ""
                time_str = ""
                events = []
                
                if i + 1 < len(rows) and rows[i+1].get('id', '').startswith('details_'):
                    det_row = rows[i+1]
                    det_tds = det_row.find_all('td')
                    if len(det_tds) >= 1:
                        loc_time = det_tds[0].get_text(strip=True)
                        time_m = re.search(r'(\d{1,2}:\d{2})', loc_time)
                        if time_m:
                            time_str = time_m.group(1)
                            location = loc_time.replace(time_str, '').strip()
                        else:
                            location = loc_time
                    if len(det_tds) >= 3:
                        events.extend(parse_events_from_cell(det_tds[1], home))
                        events.extend(parse_events_from_cell(det_tds[2], away))
                    i += 1
                    
                matches.append({
                    "round": current_round,
                    "date": date_str,
                    "time": time_str,
                    "home": home,
                    "away": away,
                    "score": score,
                    "ht": ht,
                    "status": status,
                    "location": location,
                    "events": events
                })
        i += 1
    return matches

def run_deep_audit():
    # Load Website data
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        db_data = json.load(f)
        
    seasons_map = {
        "2022/2023": ["scraper/raw_berichte_1.html", "scraper/raw_berichte.html"],
        "2022/2023_1klasse": ["scraper/raw_berichte_2.html", "scraper/raw_berichte_4.html"],
        "2023/2024": ["scraper/raw_berichte_3.html", "scraper/raw_berichte_5.html"],
        "2024/2025": ["scraper/raw_berichte_6.html"],
        "2024/2025_oberes": ["scraper/raw_berichte_11.html"],
        "2024/2025_unteres": ["scraper/raw_berichte_12.html"],
        "2025/2026": ["scraper/raw_berichte_13.html"],
        "2026/2027": ["scraper/raw_berichte_14.html"]
    }
    
    audit_results = {}
    
    for s_key, raw_files in seasons_map.items():
        db_season = db_data['seasons'].get(s_key, {})
        db_matches = db_season.get('matches', [])
        
        raw_matches = []
        for rf in raw_files:
            parsed = parse_raw_file(rf)
            for m in parsed:
                # Avoid duplicate matches if raw_files overlap
                exists = any(
                    (rm['home'] == m['home'] and rm['away'] == m['away'] and rm['round'] == m['round']) or
                    (rm['home'] == m['home'] and rm['away'] == m['away'] and rm['date'] == m['date'])
                    for rm in raw_matches
                )
                if not exists:
                    raw_matches.append(m)
                    
        audit_results[s_key] = {
            "db_count": len(db_matches),
            "raw_count": len(raw_matches),
            "matched": 0,
            "perfect_matches": 0,
            "discrepancies": []
        }
        
        # Match each db game with raw game
        for db_m in db_matches:
            db_h = normalize_name(db_m.get('home'))
            db_a = normalize_name(db_m.get('away'))
            db_date = db_m.get('date', '').strip()
            db_score = db_m.get('score', '').strip()
            db_ht = db_m.get('ht', '').strip()
            db_events = db_m.get('events', [])
            
            # Find raw match
            # Match by home + away + (date or round)
            candidates = [rm for rm in raw_matches if rm['home'] == db_h and rm['away'] == db_a]
            if not candidates:
                # Try fuzzy name matching (e.g. Schleißheim / Schleissheim)
                candidates = [rm for rm in raw_matches if rm['home'][:6] == db_h[:6] and rm['away'][:6] == db_a[:6]]
                
            matched_raw = None
            if len(candidates) == 1:
                matched_raw = candidates[0]
            elif len(candidates) > 1:
                # Pick best by date or round
                for c in candidates:
                    if c['date'] == db_date or c['round'] == db_m.get('round'):
                        matched_raw = c
                        break
                if not matched_raw:
                    matched_raw = candidates[0]
                    
            if not matched_raw:
                audit_results[s_key]["discrepancies"].append({
                    "type": "MISSING_IN_RAW",
                    "db_game": f"{db_m.get('round')} {db_date}: {db_h} vs {db_a} ({db_score})"
                })
                continue
                
            audit_results[s_key]["matched"] += 1
            
            # Compare details
            issues = []
            
            # Date check
            if matched_raw['date'] and db_date and matched_raw['date'] != db_date:
                issues.append(f"Date: DB '{db_date}' vs Raw '{matched_raw['date']}'")
                
            # Score check
            norm_raw_score = matched_raw['score'].replace('Abgesagt', '').replace('*', '').strip()
            norm_db_score = db_score.replace('Abgesagt', '').replace('*', '').strip()
            if norm_raw_score and norm_db_score and norm_raw_score != norm_db_score:
                issues.append(f"Score: DB '{db_score}' vs Raw '{matched_raw['score']}'")
                
            # Halftime check
            if matched_raw['ht'] and db_ht and matched_raw['ht'] != db_ht:
                issues.append(f"HT Score: DB '{db_ht}' vs Raw '{matched_raw['ht']}'")
                
            # Scorers check
            raw_goals = [e for e in matched_raw['events'] if e['type'] == 'goal']
            db_goals = [e for e in db_events if e['type'] == 'goal']
            
            # Group goals by player
            raw_goals_by_p = {}
            for g in raw_goals:
                p = g['player']
                raw_goals_by_p[p] = raw_goals_by_p.get(p, 0) + 1
                
            db_goals_by_p = {}
            for g in db_goals:
                p = normalize_name(g.get('player') or g.get('name'))
                count = int(g.get('count', 1))
                db_goals_by_p[p] = db_goals_by_p.get(p, 0) + count
                
            if raw_goals_by_p != db_goals_by_p:
                issues.append(f"Scorers: DB {db_goals_by_p} vs Raw {raw_goals_by_p}")
                
            # Cards check
            raw_cards = [e for e in matched_raw['events'] if e['type'] in ['yellow', 'yellowRed', 'red']]
            db_cards = [e for e in db_events if e['type'] in ['yellow', 'yellowRed', 'red']]
            
            raw_cards_by_p = {}
            for c in raw_cards:
                p = c['player']
                raw_cards_by_p[(p, c['type'])] = raw_cards_by_p.get((p, c['type']), 0) + 1
                
            db_cards_by_p = {}
            for c in db_cards:
                p = normalize_name(c.get('player') or c.get('name'))
                ctype = c.get('type')
                if ctype == 'yellow-red': ctype = 'yellowRed'
                count = int(c.get('count', 1))
                db_cards_by_p[(p, ctype)] = db_cards_by_p.get((p, ctype), 0) + count
                
            if raw_cards_by_p != db_cards_by_p:
                issues.append(f"Cards: DB {db_cards_by_p} vs Raw {raw_cards_by_p}")
                
            if not issues:
                audit_results[s_key]["perfect_matches"] += 1
            else:
                audit_results[s_key]["discrepancies"].append({
                    "game": f"{db_m.get('round')} {db_date}: {db_h} vs {db_a} ({db_score})",
                    "issues": issues
                })
                
    return audit_results

if __name__ == '__main__':
    results = run_deep_audit()
    print(json.dumps(results, indent=2))
