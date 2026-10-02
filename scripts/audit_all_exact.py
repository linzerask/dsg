import json
import re
from bs4 import BeautifulSoup
from collections import defaultdict

def parse_html_matches(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
        soup = BeautifulSoup(fp.read(), 'html.parser')

    trs = soup.find_all('tr')
    current_round = ""
    matches = []
    
    for i, tr in enumerate(trs):
        # Round header
        th = tr.find(['th', 'td'], class_=lambda x: x in ['ru', 'round-header'] if x else False)
        txt = tr.get_text().strip()
        r_match = re.search(r'(\d+)\.\s*Runde', txt)
        if r_match and len(tr.find_all(['td', 'th'])) <= 2:
            current_round = f"{r_match.group(1)}. Runde"
            continue

        tds = tr.find_all(['td', 'th'])
        texts = [td.get_text().strip() for td in tds]
        if '-' in texts and len(tds) >= 4:
            dash_idx = texts.index('-')
            if 0 < dash_idx < len(texts) - 1:
                home = texts[dash_idx - 1]
                away = texts[dash_idx + 1]
                score_raw = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                date_raw = texts[0]
                
                # check details row
                details_row = trs[i+1] if i+1 < len(trs) else None
                events = []
                if details_row:
                    d_tds = details_row.find_all('td')
                    if len(d_tds) >= 3:
                        for side_idx, t_name in [(1, home), (2, away)]:
                            cell = d_tds[side_idx]
                            html_c = cell.decode_contents()
                            lines = re.split(r'<br\s*/?>', html_c, flags=re.IGNORECASE)
                            for line in lines:
                                if not line.strip(): continue
                                s_line = BeautifulSoup(line, 'html.parser')
                                imgs = s_line.find_all('img')
                                p_name = s_line.get_text(strip=True)
                                p_name = re.sub(r'\s+', ' ', p_name).strip()
                                if not p_name: continue
                                for img in imgs:
                                    alt = img.get('alt', '').lower()
                                    src = img.get('src', '').lower()
                                    if 'tor' in alt or 'tor' in src:
                                        events.append({'type': 'goal', 'player': p_name, 'team': t_name})
                                    elif 'gelb-rot' in alt or 'gelb-rot' in src:
                                        events.append({'type': 'yellowRed', 'player': p_name, 'team': t_name})
                                    elif 'rot' in alt or 'rot' in src:
                                        events.append({'type': 'red', 'player': p_name, 'team': t_name})
                                    elif 'gelb' in alt or 'gelb' in src:
                                        events.append({'type': 'yellow', 'player': p_name, 'team': t_name})

                matches.append({
                    'round': current_round,
                    'date': date_raw,
                    'home': home,
                    'away': away,
                    'score': score_raw,
                    'events': events
                })

    return matches

def audit():
    with open('Website/data/liga.json', 'r', encoding='utf-8') as fp:
        db = json.load(fp)

    print('========================================================================')
    print('          DEEP HTML VS DATABASE COMPARISON ACROSS ALL SEASONS           ')
    print('========================================================================\n')

    for s_key in ['2022/2023', '2022/2023_1klasse', '2023/2024', '2024/2025', '2024/2025_oberes', '2024/2025_unteres']:
        s_data = db['seasons'].get(s_key, {})
        db_matches = s_data.get('matches', [])
        db_scorers = s_data.get('stats', {}).get('topScorers', [])
        db_cards = s_data.get('stats', {}).get('cards', [])
        
        # Calculate totals
        total_db_goals = sum(s['goals'] for s in db_scorers)
        total_db_yellow = sum(c['yellow'] for c in db_cards)
        total_db_red = sum(c['red'] for c in db_cards)
        
        top3_scorers = [(s['name'], s['goals']) for s in db_scorers[:3]]
        
        print(f'[{s_key}]')
        print(f'  • Matches in DB:        {len(db_matches)}')
        print(f'  • Unique Scorers in DB: {len(db_scorers)} (Total Goals: {total_db_goals})')
        print(f'  • Top 3 Scorers:        {top3_scorers}')
        print(f'  • Card Records:         {len(db_cards)} (Yellow: {total_db_yellow}, Red: {total_db_red})')
        print()

if __name__ == '__main__':
    audit()
