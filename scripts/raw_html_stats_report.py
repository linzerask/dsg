import re
from bs4 import BeautifulSoup

def parse_html_berichte(file_path, filter_type=None):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    rows = soup.find_all('tr')
    current_round = ""
    current_round_header = ""
    matches = []
    i = 0
    include_round = True
    
    while i < len(rows):
        row = rows[i]
        th = row.find('th')
        if th:
            t = th.get_text(strip=True)
            current_round_header = t
            
            if filter_type == '2023_autumn':
                if any(m in t for m in ['.08.', '.09.', '.10.', '.11.', '2023']) and not any(m in t for m in ['04.2023', '05.2023', '06.2023', '04.\n', '05.\n', '06.\n']):
                    include_round = True
                else:
                    include_round = False
            elif filter_type == '2023_spring':
                if any(m in t for m in ['04.2023', '05.2023', '06.2023', '08.04.', '21.04.', '28.04.', '05.05.', '12.05.', '17.05.', '26.05.']):
                    include_round = True
                else:
                    include_round = False
            else:
                include_round = True
                
            m_r = re.search(r'(\d+)\.\s*Runde', t)
            if m_r:
                current_round = f"{m_r.group(1)}. Runde"
            i += 1
            continue
            
        if include_round and 'clicker' in row.get('class', []):
            tds = row.find_all('td')
            if len(tds) >= 5:
                raw_date = tds[0].get_text(strip=True)
                home = tds[1].get_text(strip=True)
                away = tds[3].get_text(strip=True)
                score_raw = tds[4].get_text(strip=True)
                
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
                    "round_header": current_round_header,
                    "date": raw_date,
                    "home": home,
                    "away": away,
                    "score": score,
                    "ht": ht,
                    "status": status,
                    "location": location,
                    "time": time_str,
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
                teams[t] = {"name": t, "played": 0, "won": 0, "drawn": 0, "lost": 0, "gf": 0, "ga": 0, "diff": 0, "points": 0}
        
        status = m['status']
        score = m['score']
        
        if status == 'Gespielt' and ':' in score and score != '-:-':
            parts = score.split(':')
            try:
                hg = int(parts[0].strip())
                ag = int(parts[1].strip())
                teams[h]['played'] += 1
                teams[a]['played'] += 1
                teams[h]['gf'] += hg
                teams[h]['ga'] += ag
                teams[a]['gf'] += ag
                teams[a]['ga'] += hg
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
            teams[h]['gf'] += 3
            teams[a]['ga'] += 0
            teams[h]['won'] += 1
            teams[h]['points'] += 3
            teams[a]['lost'] += 1
        elif status == 'Abgesagt 0:3':
            teams[h]['played'] += 1
            teams[a]['played'] += 1
            teams[h]['gf'] += 0
            teams[a]['ga'] += 3
            teams[a]['won'] += 1
            teams[a]['points'] += 3
            teams[h]['lost'] += 1
            
    for t in teams.values():
        t['diff'] = t['gf'] - t['ga']
        
    sorted_teams = sorted(teams.values(), key=lambda x: (x['points'], x['diff'], x['gf']), reverse=True)
    for i, t in enumerate(sorted_teams):
        t['rank'] = i + 1
    return sorted_teams

def extract_stats(matches):
    scorers = {}
    cards = {}
    total_goals = 0
    total_played = 0
    for m in matches:
        if m['status'] in ['Gespielt', 'Abgesagt 3:0', 'Abgesagt 0:3'] and ':' in m['score'] and m['score'] != '-:-':
            total_played += 1
            parts = m['score'].split(':')
            try:
                total_goals += int(parts[0].strip()) + int(parts[1].strip())
            except: pass
            
        for ev in m['events']:
            p = ev['player']
            t = ev['team']
            etype = ev['type']
            if etype == 'goal':
                scorers[(p, t)] = scorers.get((p, t), 0) + 1
            elif etype in ['yellow', 'yellowRed', 'red']:
                if (p, t) not in cards:
                    cards[(p, t)] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                if etype == 'yellow': cards[(p, t)]['yellow'] += 1
                elif etype == 'yellowRed': cards[(p, t)]['yellowRed'] += 1
                elif etype == 'red': cards[(p, t)]['red'] += 1
                
    sorted_scorers = sorted([{"player": p, "team": t, "goals": g} for (p, t), g in scorers.items()], key=lambda x: x['goals'], reverse=True)
    for i, sc in enumerate(sorted_scorers): sc['rank'] = i + 1
    
    sorted_cards = sorted(cards.values(), key=lambda x: (x['red'] * 5 + x['yellowRed'] * 3 + x['yellow']), reverse=True)
    return sorted_scorers, sorted_cards, total_played, total_goals

def run_full_report():
    print("="*90)
    print("COMPLETE DATASET EXTRACTED DIRECTLY FROM RAW HTML BERICHTE FILES")
    print("="*90 + "\n")
    
    # 1. Season 2022/2023 DSG Liga (raw_berichte_1.html Herbst + raw_berichte_3.html Spring 2023)
    m1_h = parse_html_berichte('scraper/raw_berichte_1.html')
    m1_f = parse_html_berichte('scraper/raw_berichte_3.html', filter_type='2023_spring')
    m1 = m1_h + m1_f
    t1 = calculate_table(m1)
    s1, c1, played1, goals1 = extract_stats(m1)
    
    print("1. SEASON 2022/2023 — DSG LIGA (raw_berichte_1.html Herbst + raw_berichte_3.html Frühjahr 2023)")
    print(f"Total Matches: {len(m1)} ({len(m1_h)} Herbst + {len(m1_f)} Frühjahr) | Played: {played1} | Total Goals: {goals1} | Scorers: {len(s1)}")
    print("\n--- STANDINGS TABLE ---")
    print(f"{'#':<3} {'Team':<25} {'Sp':<4} {'S':<3} {'U':<3} {'N':<3} {'Tore':<10} {'Diff':<6} {'Pkt':<4}")
    for t in t1:
        print(f"{t['rank']:<3} {t['name']:<25} {t['played']:<4} {t['won']:<3} {t['drawn']:<3} {t['lost']:<3} {str(t['gf']) + ':' + str(t['ga']):<10} {t['diff']:<+6} {t['points']:<4}")
    print("\n--- TOP 10 SCORERS ---")
    for sc in s1[:10]:
        print(f"#{sc['rank']:<2} {sc['player']} ({sc['team']}): {sc['goals']} Tore")
        
    print("\n" + "="*90 + "\n")
    
    # 2. Season 2022/2023 1. Klasse (raw_berichte_2.html Herbst + raw_berichte_4.html Frühjahr)
    m2_h = parse_html_berichte('scraper/raw_berichte_2.html')
    m2_f = parse_html_berichte('scraper/raw_berichte_4.html')
    m2 = m2_h + m2_f
    t2 = calculate_table(m2)
    s2, c2, played2, goals2 = extract_stats(m2)
    
    print("2. SEASON 2022/2023 — 1. KLASSE (raw_berichte_2.html Herbst + raw_berichte_4.html Frühjahr)")
    print(f"Total Matches: {len(m2)} ({len(m2_h)} Herbst + {len(m2_f)} Frühjahr) | Played: {played2} | Total Goals: {goals2} | Scorers: {len(s2)}")
    print("\n--- STANDINGS TABLE ---")
    print(f"{'#':<3} {'Team':<25} {'Sp':<4} {'S':<3} {'U':<3} {'N':<3} {'Tore':<10} {'Diff':<6} {'Pkt':<4}")
    for t in t2:
        print(f"{t['rank']:<3} {t['name']:<25} {t['played']:<4} {t['won']:<3} {t['drawn']:<3} {t['lost']:<3} {str(t['gf']) + ':' + str(t['ga']):<10} {t['diff']:<+6} {t['points']:<4}")
    print("\n--- TOP 10 SCORERS ---")
    for sc in s2[:10]:
        print(f"#{sc['rank']:<2} {sc['player']} ({sc['team']}): {sc['goals']} Tore")
        
    print("\n" + "="*90 + "\n")
    
    # 3. Season 2023/2024 DSG Liga (raw_berichte_3.html Autumn 2023 + raw_berichte_5.html Spring 2024)
    m3_h = parse_html_berichte('scraper/raw_berichte_3.html', filter_type='2023_autumn')
    m3_f = parse_html_berichte('scraper/raw_berichte_5.html')
    m3 = m3_h + m3_f
    t3 = calculate_table(m3)
    s3, c3, played3, goals3 = extract_stats(m3)
    
    print("3. SEASON 2023/2024 — DSG LIGA (raw_berichte_3.html Herbst 2023 + raw_berichte_5.html Frühjahr 2024)")
    print(f"Total Matches: {len(m3)} ({len(m3_h)} Herbst + {len(m3_f)} Frühjahr) | Played: {played3} | Total Goals: {goals3} | Scorers: {len(s3)}")
    print("\n--- STANDINGS TABLE ---")
    print(f"{'#':<3} {'Team':<25} {'Sp':<4} {'S':<3} {'U':<3} {'N':<3} {'Tore':<10} {'Diff':<6} {'Pkt':<4}")
    for t in t3:
        print(f"{t['rank']:<3} {t['name']:<25} {t['played']:<4} {t['won']:<3} {t['drawn']:<3} {t['lost']:<3} {str(t['gf']) + ':' + str(t['ga']):<10} {t['diff']:<+6} {t['points']:<4}")
    print("\n--- TOP 10 SCORERS ---")
    for sc in s3[:10]:
        print(f"#{sc['rank']:<2} {sc['player']} ({sc['team']}): {sc['goals']} Tore")
        
    print("\n" + "="*90 + "\n")
    
    # Combined All-Time
    all_scorers = {}
    for sc in s1:
        p = sc['player']
        all_scorers[p] = all_scorers.get(p, 0) + sc['goals']
    for sc in s2:
        p = sc['player']
        all_scorers[p] = all_scorers.get(p, 0) + sc['goals']
    for sc in s3:
        p = sc['player']
        all_scorers[p] = all_scorers.get(p, 0) + sc['goals']
        
    sorted_all_scorers = sorted(all_scorers.items(), key=lambda x: x[1], reverse=True)
    
    total_matches = len(m1) + len(m2) + len(m3)
    total_played = played1 + played2 + played3
    total_goals = goals1 + goals2 + goals3
    
    print("ALL-TIME HISTORICAL TOTALS (Across 2022/2023 DSG Liga, 2022/2023 1. Klasse & 2023/2024 DSG Liga):")
    print(f"Total Documented Matches: {total_matches}")
    print(f"Total Played Matches: {total_played}")
    print(f"Total Goals: {total_goals} (Average: {total_goals / total_played:.2f} per match)")
    print(f"Total Unique Goal Scorers: {len(sorted_all_scorers)}")
    print("\n--- TOP 20 ALL-TIME SCORERS ---")
    for i, (p, g) in enumerate(sorted_all_scorers[:20]):
        print(f"#{i+1:<2} {p}: {g} Tore")

if __name__ == '__main__':
    run_full_report()
