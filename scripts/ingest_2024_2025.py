import json
import re
from bs4 import BeautifulSoup

def parse_html_berichte(file_path, league_name, season_key):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    rows = soup.find_all('tr')
    current_round = ""
    matches = []
    i = 0
    
    while i < len(rows):
        row = rows[i]
        th = row.find('th')
        if th:
            t = th.get_text(strip=True)
            m_r = re.search(r'(\d+)\.\s*Runde', t)
            if m_r:
                current_round = f"{m_r.group(1)}. Runde"
            i += 1
            continue
            
        if 'clicker' in row.get('class', []):
            tds = row.find_all('td')
            if len(tds) >= 5:
                raw_date = tds[0].get_text(strip=True)
                home = tds[1].get_text(strip=True)
                away = tds[3].get_text(strip=True)
                score_raw = tds[4].get_text(strip=True)
                
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
                    if score == '3:0': status = 'Abgesagt 3:0'
                    elif score == '0:3': status = 'Abgesagt 0:3'
                    else: status = 'Abgesagt'
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
                elif hg < ag:
                    teams[a]['won'] += 1
                    teams[a]['points'] += 3
                    teams[h]['lost'] += 1
                else:
                    teams[h]['drawn'] += 1
                    teams[h]['points'] += 1
                    teams[a]['drawn'] += 1
                    teams[a]['points'] += 1
            except: pass
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

def ingest_2024_2025():
    print("Ingesting Season 2024/2025 (Grunddurchgang, Oberes Playoff, Unteres Playoff)...")
    
    # 1. Grunddurchgang (raw_berichte_6.html)
    matches_gd = parse_html_berichte('scraper/raw_berichte_6.html', 'DSG Liga', '2024/2025')
    teams_gd = calculate_table(matches_gd)
    scorers_gd, cards_gd = extract_stats(matches_gd)
    print(f"Grunddurchgang: {len(matches_gd)} matches, {len(teams_gd)} teams, {len(scorers_gd)} scorers.")
    
    # 2. Oberes Playoff (raw_berichte_11.html)
    matches_ob = parse_html_berichte('scraper/raw_berichte_11.html', 'Oberes Playoff', '2024/2025_oberes')
    teams_ob = calculate_table(matches_ob)
    scorers_ob, cards_ob = extract_stats(matches_ob)
    print(f"Oberes Playoff: {len(matches_ob)} matches, {len(teams_ob)} teams, {len(scorers_ob)} scorers.")
    
    # 3. Unteres Playoff (raw_berichte_12.html)
    matches_un = parse_html_berichte('scraper/raw_berichte_12.html', 'Unteres Playoff', '2024/2025_unteres')
    teams_un = calculate_table(matches_un)
    scorers_un, cards_un = extract_stats(matches_un)
    print(f"Unteres Playoff: {len(matches_un)} matches, {len(teams_un)} teams, {len(scorers_un)} scorers.")
    
    # Update liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga = json.load(f)
        
    liga['currentSeason'] = '2024/2025'
    liga['seasons']['2024/2025'] = {
        "teams": teams_gd,
        "matches": matches_gd,
        "stats": {
            "topScorers": scorers_gd,
            "cards": cards_gd
        }
    }
    liga['seasons']['2024/2025_oberes'] = {
        "teams": teams_ob,
        "matches": matches_ob,
        "stats": {
            "topScorers": scorers_ob,
            "cards": cards_ob
        }
    }
    liga['seasons']['2024/2025_unteres'] = {
        "teams": teams_un,
        "matches": matches_un,
        "stats": {
            "topScorers": scorers_un,
            "cards": cards_un
        }
    }
    
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga, f, ensure_ascii=False, indent=2)
    print("Updated Website/data/liga.json!")
    
    # Update leagues.json
    with open('Website/data/leagues.json', 'r', encoding='utf-8') as f:
        leagues = json.load(f)
        
    # Remove any duplicates of 2024/2025
    leagues = [l for l in leagues if l.get('seasonKey') not in ['2024/2025', '2024/2025_oberes', '2024/2025_unteres'] and l.get('year') != '2024/2025']
    
    leagues.append({
        "id": 4,
        "name": "DSG Liga",
        "year": "2024/2025",
        "seasonKey": "2024/2025",
        "status": "Aktiv",
        "showOnHomepage": True
    })
    leagues.append({
        "id": 5,
        "name": "Oberes Playoff",
        "year": "2024/2025",
        "seasonKey": "2024/2025_oberes",
        "status": "Aktiv",
        "showOnHomepage": True
    })
    leagues.append({
        "id": 6,
        "name": "Unteres Playoff",
        "year": "2024/2025",
        "seasonKey": "2024/2025_unteres",
        "status": "Aktiv",
        "showOnHomepage": True
    })
    
    with open('Website/data/leagues.json', 'w', encoding='utf-8') as f:
        json.dump(leagues, f, ensure_ascii=False, indent=2)
    print(f"Updated Website/data/leagues.json with {len(leagues)} leagues!")
    
    # Update rounds.json
    with open('Website/data/rounds.json', 'r', encoding='utf-8') as f:
        rounds = json.load(f)
        
    rounds = [r for r in rounds if r.get('seasonKey') not in ['2024/2025', '2024/2025_oberes', '2024/2025_unteres']]
    
    # Extract rounds for Grunddurchgang (1-11)
    gd_rounds = set(m['round'] for m in matches_gd)
    for r_str in sorted(gd_rounds, key=lambda x: int(re.search(r'\d+', x).group(0))):
        r_num = int(re.search(r'\d+', r_str).group(0))
        r_matches = [m for m in matches_gd if m['round'] == r_str]
        dates = [m['date'] for m in r_matches if m['date']]
        d_von = dates[0] if dates else ""
        d_bis = dates[-1] if dates else ""
        rounds.append({
            "id": len(rounds) + 1,
            "name": f"{r_num}. Runde",
            "runde": r_num,
            "jahr": "2024/2025",
            "seasonKey": "2024/2025",
            "datumVon": d_von,
            "datumBis": d_bis,
            "status": "Aktiv"
        })
        
    # Extract rounds for Oberes Playoff (1-5)
    ob_rounds = set(m['round'] for m in matches_ob)
    for r_str in sorted(ob_rounds, key=lambda x: int(re.search(r'\d+', x).group(0))):
        r_num = int(re.search(r'\d+', r_str).group(0))
        r_matches = [m for m in matches_ob if m['round'] == r_str]
        dates = [m['date'] for m in r_matches if m['date']]
        d_von = dates[0] if dates else ""
        d_bis = dates[-1] if dates else ""
        rounds.append({
            "id": len(rounds) + 1,
            "name": f"{r_num}. Runde (Oberes Playoff)",
            "runde": r_num,
            "jahr": "2024/2025",
            "seasonKey": "2024/2025_oberes",
            "datumVon": d_von,
            "datumBis": d_bis,
            "status": "Aktiv"
        })
        
    # Extract rounds for Unteres Playoff (1-5)
    un_rounds = set(m['round'] for m in matches_un)
    for r_str in sorted(un_rounds, key=lambda x: int(re.search(r'\d+', x).group(0))):
        r_num = int(re.search(r'\d+', r_str).group(0))
        r_matches = [m for m in matches_un if m['round'] == r_str]
        dates = [m['date'] for m in r_matches if m['date']]
        d_von = dates[0] if dates else ""
        d_bis = dates[-1] if dates else ""
        rounds.append({
            "id": len(rounds) + 1,
            "name": f"{r_num}. Runde (Unteres Playoff)",
            "runde": r_num,
            "jahr": "2024/2025",
            "seasonKey": "2024/2025_unteres",
            "datumVon": d_von,
            "datumBis": d_bis,
            "status": "Aktiv"
        })
        
    with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
        json.dump(rounds, f, ensure_ascii=False, indent=2)
    print(f"Updated Website/data/rounds.json with {len(rounds)} rounds!")

if __name__ == '__main__':
    ingest_2024_2025()
