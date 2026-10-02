import json
import re

def clean_html(text):
    if not text: return ''
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def inspect_file(fname):
    d = json.load(open(f'scraper/{fname}', encoding='utf-8'))
    html = d.get('html', '')
    
    # Split by rounds
    round_blocks = re.split(r'<table[^>]*class="[^"]*table[^"]*"[^>]*>', html, flags=re.IGNORECASE)
    print(f"=== {fname} ({d.get('url')}) ===")
    
    # Extract round names and matches
    matches = []
    clickers = re.findall(r'<tr class="clicker"[^>]*>([\s\S]*?)</tr>', html, flags=re.IGNORECASE)
    for c in clickers:
        tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', c, flags=re.IGNORECASE)
        if len(tds) >= 5:
            date_str = clean_html(tds[0])
            home = clean_html(tds[1])
            away = clean_html(tds[2])
            score = clean_html(tds[3])
            round_info = clean_html(tds[4]) if len(tds) > 4 else ""
            matches.append({'date': date_str, 'home': home, 'away': away, 'score': score, 'round': round_info})
            
    print(f"Total parsed matches: {len(matches)}")
    rounds_found = set(m['round'] for m in matches if m['round'])
    print(f"Rounds: {sorted(list(rounds_found))}")
    teams = set(m['home'] for m in matches if m['home'] and m['home'] != '-') | set(m['away'] for m in matches if m['away'] and m['away'] != '-')
    print(f"Teams ({len(teams)}): {sorted(list(teams))}")
    played = [m for m in matches if m['score'] and m['score'] != '-:-']
    print(f"Played matches: {len(played)}")
    print("First 3 matches:")
    for m in matches[:3]:
        print(f"  {m['round']} | {m['date']} | {m['home']} vs {m['away']} | {m['score']}")
    print("Last 3 matches:")
    for m in matches[-3:]:
        print(f"  {m['round']} | {m['date']} | {m['home']} vs {m['away']} | {m['score']}")
    print()

inspect_file('raw_berichte_6.json')
inspect_file('raw_berichte_11.json')
inspect_file('raw_berichte_12.json')
