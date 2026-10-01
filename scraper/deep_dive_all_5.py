import json
import os
import re

files = [
    ('raw_berichte_1.json', '# 1: Liga 2022 (2022/2023)'),
    ('raw_berichte_2.json', '# 2: 1. Klasse 2022 (2022/2023)'),
    ('raw_berichte_3.json', '# 3: Liga 2023 (2023/2024)'),
    ('raw_berichte_4.json', '# 4: 1. Klasse 2023 (2023/2024)'),
    ('raw_berichte_5.json', '# 5: Liga 2024 (2024/2025)')
]

results = []

for fname, desc in files:
    fpath = os.path.join('scraper', fname)
    if not os.path.exists(fpath):
        print(f"File {fname} not found!")
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    url = data.get('url', '')
    title = data.get('title', '')
    html = data.get('html', '')
    
    round_parts = re.split(r'<tr class="green-col"[^>]*>', html, flags=re.IGNORECASE)
    
    parsed_rounds = []
    total_matches = 0
    all_teams = set()
    all_dates = []
    
    for idx in range(1, len(round_parts)):
        part = round_parts[idx]
        th = re.search(r'<th[^>]*>([\s\S]*?)</th>', part, flags=re.IGNORECASE)
        rtitle = re.sub(r'<[^>]+>', '', th.group(1)).strip() if th else ''
        rtitle = re.sub(r'\s+', ' ', rtitle)
        
        match_chunks = re.split(r'<tr class="clicker"[^>]*>', part, flags=re.IGNORECASE)
        matches = []
        for m_idx in range(1, len(match_chunks)):
            chunk = match_chunks[m_idx]
            pos = chunk.find('id="details_')
            main = chunk[:pos] if pos != -1 else chunk
            tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', main, flags=re.IGNORECASE)
            clean = [re.sub(r'<[^>]+>', '', t).strip() for t in tds]
            if len(clean) >= 5:
                date = clean[0]
                home = clean[1]
                away = clean[3]
                score = clean[4]
                matches.append({
                    'date': date,
                    'home': home,
                    'away': away,
                    'score': score
                })
                all_teams.add(home)
                all_teams.add(away)
                all_dates.append(date)
                
        if matches:
            total_matches += len(matches)
            parsed_rounds.append({
                'header_index': idx,
                'title': rtitle,
                'matches_count': len(matches),
                'matches': matches
            })
            
    results.append({
        'file': fname,
        'desc': desc,
        'url': url,
        'title': title,
        'total_matches': total_matches,
        'rounds': parsed_rounds,
        'teams': sorted(list(all_teams)),
        'dates': all_dates
    })

print("="*90)
print("DEEP DIVE SUMMARY OF ALL 5 RAW REPORTS")
print("="*90)

for res in results:
    print(f"\n[FILE] {res['file']} -> {res['desc']}")
    print(f"   URL: {res['url']} | Title: '{res['title']}' | Total Rounds: {len(res['rounds'])} | Total Matches: {res['total_matches']}")
    print(f"   Teams ({len(res['teams'])}): {', '.join(res['teams'])}")
    print("   Round list:")
    for r in res['rounds']:
        dates_in_r = [m['date'] for m in r['matches']]
        print(f"     * Header #{r['header_index']}: '{r['title']}' ({r['matches_count']} matches) | Dates: {min(dates_in_r)} to {max(dates_in_r)}")

