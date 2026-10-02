import json
import re
from bs4 import BeautifulSoup

def parse_html_berichte(file_path, league_name, season_key):
    with open(file_path, 'r', encoding='latin-1') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    rows = soup.find_all('tr')
    current_round = ""
    matches = []
    i = 0
    
    while i < len(rows):
        row = rows[i]
        
        # Check round header
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
                home = texts[dash_idx - 1]
                away = texts[dash_idx + 1]
                score_raw = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                
                # Parse date
                weekday = ""
                date_str = ""
                if ',' in raw_date:
                    parts = raw_date.split(',')
                    weekday = parts[0].strip()
                    dp = parts[1].strip().split('.')
                    if len(dp) == 3:
                        day = dp[0].zfill(2)
                        month = dp[1].zfill(2)
                        yr = dp[2]
                        if len(yr) == 2: yr = "20" + yr
                        date_str = f"{day}.{month}.{yr}"
                else:
                    date_str = raw_date
                    
                score = score_raw
                ht = ""
                status = "Gespielt"
                if '(' in score_raw and ')' in score_raw:
                    score = score_raw.split('(')[0].strip()
                    ht = score_raw.split('(')[1].replace(')', '').strip()
                elif '*' in score_raw:
                    score = score_raw.replace('*', '').strip()
                    if '3:0' in score:
                        score = '3:0'
                        status = 'Abgesagt 3:0'
                    elif '0:3' in score:
                        score = '0:3'
                        status = 'Abgesagt 0:3'
                    else:
                        status = 'Abgesagt'
                elif score_raw in ['-:-', '- : -', ':', '(:)', '']:
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
                            
                    def parse_events(td, t_name):
                        if not td: return
                        html_c = td.decode_contents()
                        lines = re.split(r'<br\s*/?>', html_c, flags=re.IGNORECASE)
                        for line in lines:
                            line = line.strip()
                            if not line: continue
                            s_line = BeautifulSoup(line, 'html.parser')
                            imgs = s_line.find_all('img')
                            p_name = s_line.get_text(strip=True)
                            p_name = re.sub(r'\s+', ' ', p_name).strip()
                            if not p_name: continue
                            
                            for img in imgs:
                                alt = img.get('alt', '').lower()
                                src = img.get('src', '').lower()
                                if 'tor' in alt or 'tor' in src:
                                    events.append({"type": "goal", "player": p_name, "count": 1, "team": t_name})
                                elif 'gelb-rot' in alt or 'gelb-rot' in src or 'gelbrot' in alt or 'gelbrot' in src:
                                    events.append({"type": "yellowRed", "player": p_name, "count": 1, "team": t_name})
                                elif 'rot' in alt or 'rot' in src:
                                    events.append({"type": "red", "player": p_name, "count": 1, "team": t_name})
                                elif 'gelb' in alt or 'gelb' in src:
                                    events.append({"type": "yellow", "player": p_name, "count": 1, "team": t_name})

                    if len(det_tds) >= 3:
                        parse_events(det_tds[1], home)
                        parse_events(det_tds[2], away)
                    i += 1
                    
                matches.append({
                    "round": current_round,
                    "date": date_str,
                    "time": time_str,
                    "weekday": weekday,
                    "home": home,
                    "away": away,
                    "score": score,
                    "ht": ht,
                    "status": status,
                    "location": location,
                    "referee": "",
                    "league": league_name,
                    "seasonKey": season_key,
                    "events": events
                })
        i += 1
    return matches

def calculate_table(matches):
    teams = {}
    for m in matches:
        h = m['home']
        a = m['away']
        for t in [h, a]:
            if t not in teams:
                teams[t] = {"name": t, "played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "goalDiff": 0, "points": 0}
        
        status = m['status']
        score = m['score']
        
        if status == 'Gespielt' and ':' in score and score != '-:-':
            parts = score.split(':')
            try:
                hg = int(parts[0].strip())
                ag = int(parts[1].strip())
                teams[h]['played'] += 1
                teams[a]['played'] += 1
                teams[h]['goalsFor'] += hg
                teams[h]['goalsAgainst'] += ag
                teams[a]['goalsFor'] += ag
                teams[a]['goalsAgainst'] += hg
                if hg > ag:
                    teams[h]['won'] += 1
                    teams[h]['points'] += 3
                    teams[a]['lost'] += 1
                elif hg == ag:
                    teams[h]['drawn'] += 1
                    teams[h]['points'] += 1
                    teams[a]['drawn'] += 1
                    teams[a]['points'] += 1
                else:
                    teams[a]['won'] += 1
                    teams[a]['points'] += 3
                    teams[h]['lost'] += 1
            except:
                pass
        elif status == 'Abgesagt 3:0':
            teams[h]['played'] += 1
            teams[a]['played'] += 1
            teams[h]['goalsFor'] += 3
            teams[h]['goalsAgainst'] += 0
            teams[a]['goalsFor'] += 0
            teams[a]['goalsAgainst'] += 3
            teams[h]['won'] += 1
            teams[h]['points'] += 3
            teams[a]['lost'] += 1
        elif status == 'Abgesagt 0:3':
            teams[h]['played'] += 1
            teams[a]['played'] += 1
            teams[h]['goalsFor'] += 0
            teams[h]['goalsAgainst'] += 3
            teams[a]['goalsFor'] += 3
            teams[a]['goalsAgainst'] += 0
            teams[a]['won'] += 1
            teams[a]['points'] += 3
            teams[h]['lost'] += 1
            
    for t in teams.values():
        t['goalDiff'] = t['goalsFor'] - t['goalsAgainst']
        
    sorted_teams = sorted(teams.values(), key=lambda x: (x['points'], x['goalDiff'], x['goalsFor']), reverse=True)
    for i, t in enumerate(sorted_teams):
        t['rank'] = i + 1
    return sorted_teams

def extract_stats(matches):
    scorers = {}
    cards = {}
    for m in matches:
        ht = m['home']
        for ev in m['events']:
            p = ev['player']
            t = ev.get('team') or ht
            etype = ev['type']
            if etype == 'goal':
                scorers[(p, t)] = scorers.get((p, t), 0) + 1
            elif etype in ['yellow', 'yellowRed', 'red']:
                if (p, t) not in cards:
                    cards[(p, t)] = {"player": p, "name": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                if etype == 'yellow': cards[(p, t)]['yellow'] += 1
                elif etype == 'yellowRed': cards[(p, t)]['yellowRed'] += 1
                elif etype == 'red': cards[(p, t)]['red'] += 1
                
    sorted_scorers = sorted([{"player": p, "name": p, "team": t, "goals": g} for (p, t), g in scorers.items()], key=lambda x: x['goals'], reverse=True)
    for i, sc in enumerate(sorted_scorers): sc['rank'] = i + 1
    
    sorted_cards = sorted(cards.values(), key=lambda x: (x['red'] * 5 + x['yellowRed'] * 3 + x['yellow']), reverse=True)
    return sorted_scorers, sorted_cards

def ingest_2025_2026():
    print("Ingesting Season 2025/2026 from scraper/raw_berichte_13.html...")
    matches_25 = parse_html_berichte('scraper/raw_berichte_13.html', 'DSG Liga', '2025/2026')
    table_25 = calculate_table(matches_25)
    scorers_25, cards_25 = extract_stats(matches_25)
    
    print(f"Season 2025/2026: {len(matches_25)} matches, {len(table_25)} teams, {len(scorers_25)} scorers, {len(cards_25)} card records.")
    
    # Load and update liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga_data = json.load(f)
        
    liga_data['currentSeason'] = '2025/2026'
    liga_data['seasons']['2025/2026'] = {
        "teams": table_25,
        "matches": matches_25,
        "stats": {
            "topScorers": scorers_25,
            "cards": cards_25
        }
    }
    
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga_data, f, indent=2, ensure_ascii=False)
    print("Updated Website/data/liga.json successfully.")
    
    # Load and update leagues.json
    with open('Website/data/leagues.json', 'r', encoding='utf-8') as f:
        leagues = json.load(f)
        
    # Check if 2025/2026 exists or append
    existing = next((l for l in leagues if l['seasonKey'] == '2025/2026'), None)
    if not existing:
        max_id = max([l.get('id', 0) for l in leagues] + [0])
        leagues.append({
            "id": max_id + 1,
            "name": "DSG Liga",
            "year": "2025/2026",
            "seasonKey": "2025/2026",
            "status": "Aktiv",
            "showOnHomepage": True
        })
        
    with open('Website/data/leagues.json', 'w', encoding='utf-8') as f:
        json.dump(leagues, f, indent=2, ensure_ascii=False)
    print("Updated Website/data/leagues.json successfully.")
    
    # Load and update rounds.json
    with open('Website/data/rounds.json', 'r', encoding='utf-8') as f:
        rounds = json.load(f)
        
    # Extract round date spans for 2025/2026
    rounds_map = {}
    for m in matches_25:
        r_num_m = re.search(r'(\d+)', m['round'])
        if not r_num_m: continue
        r_num = int(r_num_m.group(1))
        if r_num not in rounds_map:
            rounds_map[r_num] = []
        if m['date']:
            rounds_map[r_num].append(m['date'])
            
    # Remove existing 2025/2026 rounds if any
    rounds = [r for r in rounds if r.get('seasonKey') != '2025/2026']
    max_round_id = max([r.get('id', 0) for r in rounds] + [0])
    
    for r_num in sorted(rounds_map.keys()):
        dates = rounds_map[r_num]
        dates_sorted = sorted(dates, key=lambda d: [int(x) for x in reversed(d.split('.'))] if len(d.split('.')) == 3 else [0])
        d_von = dates_sorted[0] if dates_sorted else ""
        d_bis = dates_sorted[-1] if dates_sorted else ""
        
        max_round_id += 1
        rounds.append({
            "id": max_round_id,
            "runde": r_num,
            "seasonKey": "2025/2026",
            "liga": "DSG Liga",
            "datumVon": d_von,
            "datumBis": d_bis,
            "status": "Aktiv"
        })
        
    with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
        json.dump(rounds, f, indent=2, ensure_ascii=False)
    print(f"Updated Website/data/rounds.json with {len(rounds_map)} rounds.")

if __name__ == '__main__':
    ingest_2025_2026()
