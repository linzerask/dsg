import json
import re
from bs4 import BeautifulSoup

def parse_berichte_13():
    with open('scraper/raw_berichte_13.json', 'r', encoding='utf-8') as f:
        raw = json.load(f)
        
    html = raw['html']
    soup = BeautifulSoup(html, 'html.parser')
    
    current_round = ""
    matches = []
    
    # Iterate through table rows
    rows = soup.find_all('tr')
    
    i = 0
    while i < len(rows):
        row = rows[i]
        
        # Check if round header
        th = row.find('th')
        if th:
            text = th.get_text(strip=True)
            m_round = re.search(r'(\d+)\.\s*Runde', text)
            if m_round:
                current_round = f"{m_round.group(1)}. Runde"
            i += 1
            continue
            
        # Check if match header row
        if 'clicker' in row.get('class', []):
            tds = row.find_all('td')
            if len(tds) >= 5:
                raw_date = tds[0].get_text(strip=True) # e.g. "Fr, 29.08.25"
                home_team = tds[1].get_text(strip=True)
                away_team = tds[3].get_text(strip=True)
                score_raw = tds[4].get_text(strip=True) # e.g. "4:1 (2:0)" or "3:0*" or "-:-"
                
                # Parse date & weekday
                weekday = ""
                date_str = ""
                if ',' in raw_date:
                    w_part, d_part = raw_date.split(',', 1)
                    weekday = w_part.strip()
                    d_clean = d_part.strip()
                    # e.g. 29.08.25 -> 29.08.2025
                    parts = d_clean.split('.')
                    if len(parts) == 3:
                        day = parts[0].zfill(2)
                        month = parts[1].zfill(2)
                        year = parts[2]
                        if len(year) == 2:
                            year = "20" + year
                        date_str = f"{day}.{month}.{year}"
                else:
                    date_str = raw_date
                    
                # Parse score & ht
                score = score_raw
                ht = ""
                status = "Gespielt"
                
                if '(' in score_raw and ')' in score_raw:
                    score_main = score_raw.split('(')[0].strip()
                    ht = score_raw.split('(')[1].replace(')', '').strip()
                    score = score_main
                elif '*' in score_raw:
                    score = score_raw.replace('*', '').strip()
                    if score == '3:0':
                        status = 'Abgesagt 3:0'
                    elif score == '0:3':
                        status = 'Abgesagt 0:3'
                elif score_raw in ['-:-', '- : -', '']:
                    status = 'Ausstehend'
                    
                # Next row is details
                location = ""
                time_str = ""
                events = []
                home_goals = []
                away_goals = []
                home_cards = []
                away_cards = []
                
                if i + 1 < len(rows) and rows[i+1].get('id', '').startswith('details_'):
                    det_row = rows[i+1]
                    det_tds = det_row.find_all('td')
                    
                    if len(det_tds) >= 1:
                        loc_time = det_tds[0].get_text(strip=True) # e.g. "DSG-Platz 18:00"
                        # Extract time (HH:MM)
                        time_match = re.search(r'(\d{1,2}:\d{2})', loc_time)
                        if time_match:
                            time_str = time_match.group(1)
                            location = loc_time.replace(time_str, '').strip()
                        else:
                            location = loc_time
                            
                    # Helper to parse events from TD
                    def parse_td_events(td, team_name, goals_list, cards_list):
                        if not td:
                            return
                        # Find all imgs and following text
                        # In the HTML: <img src="...tor.gif" alt="tor"> Player Name<br>
                        # Note: multiple tor.gif consecutive before one player name means multiple goals!
                        html_content = td.decode_contents()
                        # Split by <br> or <br/>
                        lines = re.split(r'<br\s*/?>', html_content, flags=re.IGNORECASE)
                        for line in lines:
                            line = line.strip()
                            if not line:
                                continue
                            soup_line = BeautifulSoup(line, 'html.parser')
                            imgs = soup_line.find_all('img')
                            p_name = soup_line.get_text(strip=True)
                            p_name = re.sub(r'\s+', ' ', p_name).strip()
                            if not p_name:
                                continue
                                
                            for img in imgs:
                                alt = img.get('alt', '').lower()
                                src = img.get('src', '').lower()
                                if 'tor' in alt or 'tor' in src:
                                    events.append({
                                        "type": "goal",
                                        "player": p_name,
                                        "count": 1,
                                        "team": team_name
                                    })
                                    goals_list.append({"player": p_name, "team": team_name})
                                elif 'gelb-rot' in alt or 'gelb-rot' in src or 'gelbrot' in alt or 'gelbrot' in src:
                                    events.append({
                                        "type": "yellowRed",
                                        "player": p_name,
                                        "count": 1,
                                        "team": team_name
                                    })
                                    cards_list.append({"player": p_name, "team": team_name, "type": "yellowRed"})
                                elif 'rot' in alt or 'rot' in src:
                                    events.append({
                                        "type": "red",
                                        "player": p_name,
                                        "count": 1,
                                        "team": team_name
                                    })
                                    cards_list.append({"player": p_name, "team": team_name, "type": "red"})
                                elif 'gelb' in alt or 'gelb' in src:
                                    events.append({
                                        "type": "yellow",
                                        "player": p_name,
                                        "count": 1,
                                        "team": team_name
                                    })
                                    cards_list.append({"player": p_name, "team": team_name, "type": "yellow"})

                    if len(det_tds) >= 3:
                        parse_td_events(det_tds[1], home_team, home_goals, home_cards)
                        parse_td_events(det_tds[2], away_team, away_goals, away_cards)
                        
                    i += 1 # advance past details row
                    
                match_obj = {
                    "round": current_round,
                    "date": date_str,
                    "time": time_str,
                    "weekday": weekday,
                    "home": home_team,
                    "away": away_team,
                    "score": score,
                    "ht": ht,
                    "status": status,
                    "location": location,
                    "referee": "",
                    "league": "DSG Liga",
                    "seasonKey": "2025/2026",
                    "events": events,
                    "homeGoals": home_goals,
                    "awayGoals": away_goals,
                    "homeCards": home_cards,
                    "awayCards": away_cards
                }
                matches.append(match_obj)
        i += 1
        
    print(f"Parsed {len(matches)} matches for Season 2025/2026.")
    return matches

if __name__ == '__main__':
    matches = parse_berichte_13()
    print("Sample parsed match 0:", json.dumps(matches[0], ensure_ascii=False, indent=2))
    print("Sample parsed match 10:", json.dumps(matches[10], ensure_ascii=False, indent=2))
    
    total_goals = sum(len([e for e in m['events'] if e['type'] == 'goal']) for m in matches)
    total_cards = sum(len([e for e in m['events'] if e['type'] in ['yellow', 'red', 'yellowRed']]) for m in matches)
    print(f"Total goal events: {total_goals}, Total card events: {total_cards}")
