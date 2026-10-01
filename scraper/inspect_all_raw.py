import json
import os
import re

files = ['raw_berichte.json', 'raw_berichte_1.json', 'raw_berichte_2.json', 'raw_berichte_3.json']

for fname in files:
    fpath = os.path.join('scraper', fname)
    if not os.path.exists(fpath): continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    html = data.get('html', '')
    round_parts = re.split(r'<tr class="green-col"[^>]*>', html, flags=re.IGNORECASE)
    titles = []
    total_matches = 0
    for idx in range(1, len(round_parts)):
        part = round_parts[idx]
        th = re.search(r'<th[^>]*>([\s\S]*?)</th>', part, flags=re.IGNORECASE)
        t = re.sub(r'<[^>]+>', '', th.group(1)).strip() if th else ''
        t = re.sub(r'\s+', ' ', t)
        cnt = len(re.split(r'<tr class="clicker"[^>]*>', part, flags=re.IGNORECASE)) - 1
        if cnt > 0:
            total_matches += cnt
            titles.append(f"{t} ({cnt}m)")
    print(f"\n=======================================================")
    print(f"FILE: {fname} | URL: {data.get('url')} | Total matches: {total_matches}")
    print(f"Rounds: {len(titles)}")
    for t in titles[:10]:
        print(f"   - {t}")
    if len(titles) > 10:
        print(f"   ... and {len(titles) - 10} more rounds")
