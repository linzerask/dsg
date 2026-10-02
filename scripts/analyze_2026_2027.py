import re
import json
from bs4 import BeautifulSoup

def analyze_2026_2027():
    with open('scraper/raw_berichte_14.html', 'r', encoding='latin-1') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    rows = soup.find_all('tr')

    matches = []
    current_round = ''
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
                                    events.append({"type": "goal", "player": p_name, "name": p_name, "count": 1, "team": t_name})
                                elif 'gelb-rot' in alt or 'gelb-rot' in src or 'gelbrot' in alt or 'gelbrot' in src:
                                    events.append({"type": "yellowRed", "player": p_name, "name": p_name, "count": 1, "team": t_name})
                                elif 'rot' in alt or 'rot' in src:
                                    events.append({"type": "red", "player": p_name, "name": p_name, "count": 1, "team": t_name})
                                elif 'gelb' in alt or 'gelb' in src:
                                    events.append({"type": "yellow", "player": p_name, "name": p_name, "count": 1, "team": t_name})

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
                    "league": "DSG Liga",
                    "seasonKey": "2026/2027",
                    "events": events
                })
        i += 1

    print(f"Total matches parsed: {len(matches)}")
    rounds = set(m['round'] for m in matches)
    print(f"Rounds ({len(rounds)}): {sorted(list(rounds))}")
    teams = set(m['home'] for m in matches) | set(m['away'] for m in matches)
    print(f"Teams ({len(teams)}): {sorted(list(teams))}")
    
    played = [m for m in matches if m['status'] in ['Gespielt', 'Abgesagt 3:0', 'Abgesagt 0:3']]
    unplayed = [m for m in matches if m['status'] == 'Ausstehend']
    print(f"Played matches: {len(played)}, Unplayed matches: {len(unplayed)}")
    
    for m in matches:
        print(f"[{m['round']}] {m['date']} {m['time']}: {m['home']} vs {m['away']} -> {m['score']} ({m['status']}) - events: {len(m['events'])}")

    # Standings calculation
    table = {}
    for t in teams:
        table[t] = {"name": t, "played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "goalDiff": 0, "points": 0}
    
    for m in matches:
        h = m['home']
        a = m['away']
        status = m['status']
        score = m['score']
        
        if status == 'Gespielt' and ':' in score and score != '-:-':
            try:
                parts = score.split(':')
                hg = int(parts[0].strip())
                ag = int(parts[1].strip())
                table[h]['played'] += 1
                table[a]['played'] += 1
                table[h]['goalsFor'] += hg
                table[h]['goalsAgainst'] += ag
                table[a]['goalsFor'] += ag
                table[a]['goalsAgainst'] += hg
                if hg > ag:
                    table[h]['won'] += 1
                    table[h]['points'] += 3
                    table[a]['lost'] += 1
                elif hg == ag:
                    table[h]['drawn'] += 1
                    table[h]['points'] += 1
                    table[a]['drawn'] += 1
                    table[a]['points'] += 1
                else:
                    table[a]['won'] += 1
                    table[a]['points'] += 3
                    table[h]['lost'] += 1
            except Exception as e:
                print(f"Error parsing score {score}: {e}")
        elif status == 'Abgesagt 3:0':
            table[h]['played'] += 1
            table[a]['played'] += 1
            table[h]['goalsFor'] += 3
            table[h]['goalsAgainst'] += 0
            table[a]['goalsFor'] += 0
            table[a]['goalsAgainst'] += 3
            table[h]['won'] += 1
            table[h]['points'] += 3
            table[a]['lost'] += 1
        elif status == 'Abgesagt 0:3':
            table[h]['played'] += 1
            table[a]['played'] += 1
            table[h]['goalsFor'] += 0
            table[h]['goalsAgainst'] += 3
            table[a]['goalsFor'] += 3
            table[a]['goalsAgainst'] += 0
            table[a]['won'] += 1
            table[a]['points'] += 3
            table[h]['lost'] += 1

    for t in table.values():
        t['goalDiff'] = t['goalsFor'] - t['goalsAgainst']
        
    sorted_teams = sorted(table.values(), key=lambda x: (x['points'], x['goalDiff'], x['goalsFor']), reverse=True)
    for i, t in enumerate(sorted_teams):
        t['rank'] = i + 1
        
    print("\n--- 2026/2027 STANDINGS ---")
    for t in sorted_teams:
        print(f"{t['rank']}. {t['name']:<22} Sp:{t['played']} S:{t['won']} U:{t['drawn']} N:{t['lost']} Tore:{t['goalsFor']}:{t['goalsAgainst']} Diff:{t['goalDiff']} Pkt:{t['points']}")

    # Scorers and Cards
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
    for i, c in enumerate(sorted_cards): c['rank'] = i + 1

    print(f"\n--- TOP SCORERS ({len(sorted_scorers)}) ---")
    for s in sorted_scorers[:10]:
        print(f"{s['rank']}. {s['name']} ({s['team']}): {s['goals']} Tore")

    print(f"\n--- CARDS ({len(sorted_cards)}) ---")
    for c in sorted_cards[:10]:
        print(f"{c['name']} ({c['team']}): Y:{c['yellow']} YR:{c['yellowRed']} R:{c['red']}")

    return matches, sorted_teams, sorted_scorers, sorted_cards

if __name__ == '__main__':
    analyze_2026_2027()
