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
        tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', main, flags=re.IGNORECASE)
        clean = [re.sub(r'<[^>]+>', '', t).strip() for t in tds]
        if len(clean) >= 5:
            # check cards/goals in details
            goals = re.findall(r'<td[^>]*class="tore"[^>]*>([\s\S]*?)</td>', chunk, flags=re.IGNORECASE)
            cards = re.findall(r'<img[^>]*src="[^"]*(gelb|rot|gelb-rot)[^"]*"', chunk, flags=re.IGNORECASE)
            matches.append({
                'date': clean[0],
                'home': clean[1],
                'away': clean[3],
                'score': clean[4],
                'details_len': len(chunk[pos:]) if pos != -1 else 0
            })
    if matches:
        headers_data[idx] = {
            'title': title,
            'matches': matches
        }

# User's mapped order:
# 1. Runde: Header #1
# 2. Runde: Header #3
# 3. Runde: Header #5
# 4. Runde: Header #7
# 5. Runde: Header #9
# 6. Runde: Header #11
# 7. Runde: Header #13
# 8. Runde: Header #15
# 9. Runde: Header #21
# 10. Runde: Header #17
# 11. Runde: Header #19
# 12. Runde: Header #23
# 13. Runde: Header #25
# 14. Runde: Header #27
# 15. Runde: Header #29
# 16. Runde: Header #31

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

print("="*90)
print(f"{'Mapped Round':<15} | {'Raw Header':<35} | {'Matches':<8} | {'Teams involved'}")
print("="*90)

all_teams_autumn = set()
all_teams_spring = set()

for target_round, raw_idx, d_from, d_to in mapping:
    h = headers_data[raw_idx]
    teams = set()
    for m in h['matches']:
        teams.add(m['home'])
        teams.add(m['away'])
        if target_round <= 9:
            all_teams_autumn.add(m['home'])
            all_teams_autumn.add(m['away'])
        else:
            all_teams_spring.add(m['home'])
            all_teams_spring.add(m['away'])
            
    print(f"{target_round}. Runde: ({d_from} - {d_to}) | {h['title']:<35} | {len(h['matches'])} matches | {len(teams)} teams")

print("\n--- Autumn Teams (Rounds 1-9) ---", len(all_teams_autumn), "teams:")
print(", ".join(sorted(all_teams_autumn)))

print("\n--- Spring Teams (Rounds 10-16) ---", len(all_teams_spring), "teams:")
print(", ".join(sorted(all_teams_spring)))

