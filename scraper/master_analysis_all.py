import json
import os
import re

reports = [
    (1, 'raw_berichte_1.json', 'ID #1: Liga 2022'),
    (2, 'raw_berichte_2.json', 'ID #2: 1. Klasse 2022'),
    (3, 'raw_berichte_3.json', 'ID #3: Liga 2023'),
    (4, 'raw_berichte_4.json', 'ID #4: 1. Klasse 2023'),
    (5, 'raw_berichte_5.json', 'ID #5: Liga 2024'),
    (6, 'raw_berichte_6.json', 'ID #6: Liga 2025'),
    (11, 'raw_berichte_11.json', 'ID #11: Oberes Playoff 2025'),
    (12, 'raw_berichte_12.json', 'ID #12: Unteres Playoff 2025'),
    (13, 'raw_berichte_13.json', 'ID #13: Liga 2026'),
    (14, 'raw_berichte_14.json', 'ID #14: Liga 26/27 2026')
]

all_data = []

for old_id, fname, label in reports:
    fpath = os.path.join('scraper', fname)
    if not os.path.exists(fpath):
        all_data.append({'old_id': old_id, 'file': fname, 'error': 'FILE_NOT_FOUND', 'label': label})
        continue
        
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    url = data.get('url', '')
    title = data.get('title', '')
    html = data.get('html', '')
    
    round_parts = re.split(r'<tr class="green-col"[^>]*>', html, flags=re.IGNORECASE)
    
    parsed_rounds = []
    total_matches = 0
    played_matches = 0
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
                
                is_played = bool(score and ':' in score and not score.startswith(':'))
                if is_played:
                    played_matches += 1
                    
                matches.append({
                    'date': date,
                    'home': home,
                    'away': away,
                    'score': score,
                    'played': is_played
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
            
    all_data.append({
        'old_id': old_id,
        'file': fname,
        'label': label,
        'url': url,
        'title': title,
        'total_rounds': len(parsed_rounds),
        'total_matches': total_matches,
        'played_matches': played_matches,
        'teams': sorted(list(all_teams)),
        'rounds': parsed_rounds,
        'min_date': min(all_dates) if all_dates else 'N/A',
        'max_date': max(all_dates) if all_dates else 'N/A'
    })

print("="*100)
print(f"{'Old ID':<8} | {'Filename':<22} | {'Label':<26} | {'Rounds':<7} | {'Matches':<8} | {'Played':<7} | {'Teams'}")
print("="*100)

for d in all_data:
    if 'error' in d:
        print(f"{d['old_id']:<8} | {d['file']:<22} | {d['label']:<26} | ERROR: {d['error']}")
    else:
        print(f"{d['old_id']:<8} | {d['file']:<22} | {d['label']:<26} | {d['total_rounds']:<7} | {d['total_matches']:<8} | {d['played_matches']:<7} | {len(d['teams']):<2} teams ({', '.join(d['teams'][:3])}...)")

print("\n" + "="*100)
print("DETAILED BREAKDOWN BY REPORT")
print("="*100)

for d in all_data:
    if 'error' in d: continue
    print(f"\n[REPORT ID #{d['old_id']}] {d['label']} ({d['file']})")
    print(f"  URL: {d['url']}")
    print(f"  Total Rounds: {d['total_rounds']} | Total Matches: {d['total_matches']} (Played: {d['played_matches']})")
    print(f"  Teams ({len(d['teams'])}): {', '.join(d['teams'])}")
    print("  Rounds:")
    for r in d['rounds']:
        dates = [m['date'] for m in r['matches']]
        print(f"    - {r['title']} ({r['matches_count']} matches) | Sample: {dates[0]} ({r['matches'][0]['home']} vs {r['matches'][0]['away']})")

