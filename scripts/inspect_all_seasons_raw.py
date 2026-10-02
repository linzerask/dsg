import json
import os
import re

def clean_html(text):
    if not text: return ''
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

for fname in sorted(os.listdir('scraper')):
    if fname.startswith('raw_berichte') and fname.endswith('.json'):
        fpath = os.path.join('scraper', fname)
        try:
            d = json.load(open(fpath, encoding='utf-8'))
            html = d.get('html', '')
            clickers = re.findall(r'<tr class="clicker"[^>]*>([\s\S]*?)</tr>', html, flags=re.IGNORECASE)
            dates = []
            teams = set()
            for c in clickers:
                tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', c, flags=re.IGNORECASE)
                if len(tds) >= 4:
                    dates.append(clean_html(tds[0]))
                    teams.add(clean_html(tds[1]))
                    teams.add(clean_html(tds[2]))
            
            rounds = re.findall(r'(\d+\.\s*Runde[^\n<]*)', html, flags=re.IGNORECASE)
            print(f"=== {fname} ({d.get('url')}) ===")
            print(f"  Clicker matches: {len(clickers)}")
            print(f"  Sample dates ({len(dates)}): {dates[:3]} ... {dates[-2:] if len(dates) > 1 else []}")
            print(f"  Unique teams ({len(teams)}): {list(teams)[:5]}")
            print(f"  Rounds sample: {list(set(rounds))[:4]}")
            print()
        except Exception as e:
            print(f"{fname}: {e}")
