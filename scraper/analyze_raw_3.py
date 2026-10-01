import json
import re

with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

html = raw['html']
round_parts = re.split(r'<tr class="green-col"[^>]*>', html, flags=re.IGNORECASE)

print(f"Total parts: {len(round_parts)}")
headers_with_matches = []

for idx in range(1, len(round_parts)):
    part = round_parts[idx]
    th = re.search(r'<th[^>]*>([\s\S]*?)</th>', part, flags=re.IGNORECASE)
    title = re.sub(r'<[^>]+>', '', th.group(1)).strip() if th else ''
    title = re.sub(r'\s+', ' ', title)
    match_chunks = re.split(r'<tr class="clicker"[^>]*>', part, flags=re.IGNORECASE)
    cnt = len(match_chunks) - 1
    
    first_m = ''
    all_matches = []
    if cnt > 0:
        for m_idx in range(1, len(match_chunks)):
            chunk = match_chunks[m_idx]
            pos = chunk.find('id="details_')
            main = chunk[:pos] if pos != -1 else chunk
            tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', main, flags=re.IGNORECASE)
            clean = [re.sub(r'<[^>]+>', '', t).strip() for t in tds]
            if len(clean) >= 5:
                all_matches.append({
                    'date': clean[0],
                    'home': clean[1],
                    'away': clean[3],
                    'score': clean[4]
                })
        if all_matches:
            first_m = f"{all_matches[0]['date']} | {all_matches[0]['home']} vs {all_matches[0]['away']} ({all_matches[0]['score']})"
            
    print(f"Header #{idx:2d}: {title:<35} | Matches: {cnt:2d} | Sample: {first_m}")
    if all_matches:
        headers_with_matches.append({
            'idx': idx,
            'title': title,
            'matches': all_matches
        })

print("\n" + "="*80)
print(f"SUMMARY: Found {len(headers_with_matches)} non-empty round headers.")
print("="*80)
for h in headers_with_matches:
    dates = [m['date'] for m in h['matches']]
    print(f"Index {h['idx']:2d} -> Title: '{h['title']}' | {len(h['matches'])} matches | Dates: {', '.join(dates)}")
