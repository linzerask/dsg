import json
import re

with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

html = raw['html']
round_parts = re.split(r'<tr class="green-col"[^>]*>', html, flags=re.IGNORECASE)

headers_data = {}

for idx in range(1, len(round_parts)):
    part = round_parts[idx]
    th = re.search(r'<th[^>]*>([\s\S]*?)</th>', part, flags=re.IGNORECASE)
    title = re.sub(r'<[^>]+>', '', th.group(1)).strip() if th else ''
    title = re.sub(r'\s+', ' ', title)
    match_chunks = re.split(r'<tr class="clicker"[^>]*>', part, flags=re.IGNORECASE)
    
    matches = []
    for m_idx in range(1, len(match_chunks)):
        chunk = match_chunks[m_idx]
        pos = chunk.find('id="details_')
        main = chunk[:pos] if pos != -1 else chunk
        details = chunk[pos:] if pos != -1 else ""
        
        tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', main, flags=re.IGNORECASE)
        clean = [re.sub(r'<[^>]+>', '', t).strip() for t in tds]
        if len(clean) >= 5:
            # Check for goals
            goals_list = []
            goal_matches = re.finditer(r'<td[^>]*class="tore"[^>]*>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
            for gm in goal_matches:
                tore_text = re.sub(r'<[^>]+>', '', gm.group(1)).strip()
                if tore_text:
                    goals_list.append(tore_text)
            
            # Check for cards
            yellow_cards = len(re.findall(r'gelb\.png', details, flags=re.IGNORECASE))
            red_cards = len(re.findall(r'rot\.png', details, flags=re.IGNORECASE))
            yellow_red_cards = len(re.findall(r'gelb-rot\.png', details, flags=re.IGNORECASE))
            
            # Referee
            referee = ""
            ref_match = re.search(r'Schiedsrichter:\s*</td>\s*<td>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
            if ref_match:
                referee = re.sub(r'<[^>]+>', '', ref_match.group(1)).strip()
                
            matches.append({
                'date': clean[0],
                'home': clean[1],
                'away': clean[3],
                'score': clean[4],
                'goals_count': len(goals_list),
                'yellow': yellow_cards,
                'red': red_cards,
                'yellow_red': yellow_red_cards,
                'referee': referee,
                'has_full_details': len(details) > 100
            })
    if matches:
        headers_data[idx] = {
            'title': title,
            'matches': matches
        }

mapping = [
    (1, 1, "01.09.2023", "26.10.2023"),
    (2, 3, "26.08.2023", "09.09.2023"),
    (3, 5, "15.09.2023", "16.09.2023"),
    (4, 7, "20.09.2023", "23.09.2023"),
    (5, 9, "30.09.2023", "30.09.2023"),
    (6, 11, "06.10.2023", "07.10.2023"),
    (7, 13, "14.10.2023", "14.10.2023"),
    (8, 15, "20.10.2023", "26.10.2023"),
    (9, 21, "18.10.2023", "28.10.2023"),
    (10, 17, "08.04.2023", "10.06.2023"),
    (11, 19, "21.04.2023", "22.04.2023"),
    (12, 23, "28.04.2023", "29.04.2023"),
    (13, 25, "05.05.2023", "06.05.2023"),
    (14, 27, "12.05.2023", "13.05.2023"),
    (15, 29, "17.05.2023", "20.05.2023"),
    (16, 31, "26.05.2023", "02.06.2023")
]

total_matches = 0
total_goals = 0
total_yellow = 0
total_red = 0
played_matches = 0
unplayed_matches = 0

for target_round, raw_idx, d_from, d_to in mapping:
    h = headers_data[raw_idx]
    for m in h['matches']:
        total_matches += 1
        total_yellow += m['yellow']
        total_red += m['red']
        if m['score'] and ':' in m['score'] and not m['score'].startswith(':'):
            played_matches += 1
            # Parse goals from score e.g. "3:1 (1:0)"
            sp = m['score'].split('(')[0].strip().split(':')
            try:
                total_goals += int(sp[0]) + int(sp[1])
            except:
                pass
        else:
            unplayed_matches += 1

print(f"Total Matches to import: {total_matches}")
print(f"Played Matches: {played_matches}")
print(f"Unplayed / Postponed / Not reported Matches: {unplayed_matches}")
print(f"Total Goals Scored: {total_goals}")
print(f"Total Yellow Cards in Reports: {total_yellow}")
print(f"Total Red Cards in Reports: {total_red}")
