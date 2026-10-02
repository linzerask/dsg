import json
import re
from bs4 import BeautifulSoup

def parse_and_enrich_2023_2024():
    print("Enriching Season 2023/2024 with complete match events...")
    
    with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f:
        r3 = json.load(f)
    with open('scraper/raw_berichte_5.json', 'r', encoding='utf-8') as f:
        r5 = json.load(f)
        
    soup3 = BeautifulSoup(r3.get('html', ''), 'html.parser')
    soup5 = BeautifulSoup(r5.get('html', ''), 'html.parser')
    
    def parse_soup(soup, is_autumn=True):
        rows = soup.find_all('tr')
        current_round = ""
        include_round = True if not is_autumn else False
        results = []
        i = 0
        while i < len(rows):
            row = rows[i]
            th = row.find('th')
            if th:
                t = th.get_text(strip=True)
                if is_autumn:
                    if any(m in t for m in ['.08.', '.09.', '.10.', '.11.', '2023']) and not any(m in t for m in ['04.2023', '05.2023', '06.2023', '04.\n', '05.\n', '06.\n']):
                        include_round = True
                        m_r = re.search(r'(\d+)\.\s*Runde', t)
                        if m_r: current_round = f"{m_r.group(1)}. Runde"
                    else:
                        include_round = False
                else:
                    include_round = True
                    m_r = re.search(r'(\d+)\.\s*Runde', t)
                    if m_r: current_round = f"{m_r.group(1)}. Runde"
                i += 1
                continue
                
            if include_round and 'clicker' in row.get('class', []):
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
                        
                    results.append({
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
                        "seasonKey": "2023/2024",
                        "events": events
                    })
            i += 1
        return results

    matches_h = parse_soup(soup3, is_autumn=True)
    matches_f = parse_soup(soup5, is_autumn=False)
    all_23_matches = matches_h + matches_f
    print(f"Parsed {len(all_23_matches)} matches for Season 2023/2024 ({len(matches_h)} Herbst + {len(matches_f)} Frühjahr).")
    
    # Update liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga = json.load(f)
        
    s23 = liga['seasons']['2023/2024']
    s23['matches'] = all_23_matches
    
    # Recalculate season stats
    scorers_map = {}
    cards_map = {}
    for m in all_23_matches:
        ht = m['home']
        at = m['away']
        for ev in m.get('events', []):
            p = ev.get('player', '').strip()
            t = ev.get('team', '').strip() or ht
            etype = ev.get('type')
            cnt = int(ev.get('count', 1))
            if etype == 'goal' and p:
                scorers_map[(p, t)] = scorers_map.get((p, t), 0) + cnt
            elif etype == 'yellow' and p:
                key = (p, t)
                if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                cards_map[key]["yellow"] += cnt
            elif etype in ['yellowRed', 'yellow-red', 'gelb-rot'] and p:
                key = (p, t)
                if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                cards_map[key]["yellowRed"] += cnt
            elif etype in ['red', 'rot'] and p:
                key = (p, t)
                if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                cards_map[key]["red"] += cnt

    top_scorers = []
    for (p, t), g in scorers_map.items():
        top_scorers.append({"player": p, "team": t, "goals": g})
    top_scorers.sort(key=lambda x: x['goals'], reverse=True)
    for i, sc in enumerate(top_scorers):
        sc['rank'] = i + 1
        
    cards_list = list(cards_map.values())
    cards_list.sort(key=lambda x: (x['red'] * 5 + x['yellowRed'] * 3 + x['yellow']), reverse=True)
    
    s23['stats'] = {
        "topScorers": top_scorers,
        "cards": cards_list
    }
    
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga, f, ensure_ascii=False, indent=2)
    print(f"Updated 2023/2024: {len(top_scorers)} scorers, {len(cards_list)} cards, {len(all_23_matches)} matches.")

if __name__ == '__main__':
    parse_and_enrich_2023_2024()
