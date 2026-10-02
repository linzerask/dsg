import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import re

with open('Website/data/players.json', 'r', encoding='utf-8') as f:
    all_players = json.load(f)

all_full_names = []
for p in all_players:
    fn = p.get('Vorname', '').strip()
    ln = p.get('Nachname', '').strip()
    full = f"{fn} {ln}".strip()
    if full: all_full_names.append(full)

def clean_html(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def normalize_player_name(raw_name):
    raw_name = clean_html(raw_name)
    if not raw_name: return "", ""
    min_match = re.search(r'\((\d+\.?[\+\d]*)\)', raw_name)
    minute = min_match.group(1) if min_match else ""
    name_only = re.sub(r'\(\d+\.?[\+\d]*\)', '', raw_name).strip()
    name_only = re.sub(r'^\d+:\d+\s*', '', name_only).strip()
    if not name_only: return "", ""
    for fn in all_full_names:
        if fn.lower() == name_only.lower():
            return fn, minute
    escaped = ''.join(['.' if c in ['\ufffd', '?', ''] else re.escape(c) for c in name_only])
    pattern = re.compile('^' + escaped + '$', re.IGNORECASE)
    for fn in all_full_names:
        if pattern.match(fn):
            return fn, minute
    return name_only, minute

def parse_events_from_td(td_html, team_name):
    events = []
    # Split only by <br> tags, preserving inner newlines
    blocks = re.split(r'<br\s*/?>', td_html, flags=re.IGNORECASE)
    for block in blocks:
        block_clean = block.strip()
        if not block_clean or block_clean == '&nbsp;': continue
        if '<img' not in block_clean: continue
        
        # Count goal icons (tor.gif or alt="tor")
        tor_imgs = re.findall(r'<img[^>]+(?:alt="tor"|src="[^"]*\/tor\.(?:gif|png|jpg)")[^>]*>', block_clean, flags=re.IGNORECASE)
        
        # Count yellow-red icons (gelbrot.jpg, gelb-rot.png, alt="gelbrot", alt="gelb-rot")
        yr_imgs = re.findall(r'<img[^>]+(?:alt="gelb-?rot"|src="[^"]*\/gelb-?rot\.(?:gif|png|jpg)")[^>]*>', block_clean, flags=re.IGNORECASE)
        
        # Count yellow icons (gelb.png or alt="gelb" where NOT gelbrot or gelb-rot)
        # Strip gelb-rot / gelbrot first to prevent substring false positive
        temp_block = re.sub(r'gelb-?rot', '', block_clean, flags=re.IGNORECASE)
        y_imgs = re.findall(r'<img[^>]+(?:alt="gelb"|src="[^"]*\/gelb\.(?:gif|png|jpg)")[^>]*>', temp_block, flags=re.IGNORECASE)
        
        # Count red icons (rot.png or alt="rot" where NOT gelb-rot or gelbrot)
        r_imgs = re.findall(r'<img[^>]+(?:alt="rot"|src="[^"]*\/rot\.(?:gif|png|jpg)")[^>]*>', temp_block, flags=re.IGNORECASE)
        
        raw_player = clean_html(block_clean)
        clean_name, minute = normalize_player_name(raw_player)
        if not clean_name or clean_name.lower().startswith('eigentor'): continue
        
        if tor_imgs:
            events.append({
                'type': 'goal',
                'player': clean_name,
                'name': clean_name,
                'team': team_name,
                'count': len(tor_imgs),
                'minute': minute
            })
        if yr_imgs:
            events.append({
                'type': 'yellowRed',
                'player': clean_name,
                'name': clean_name,
                'team': team_name,
                'count': len(yr_imgs),
                'minute': minute
            })
        if y_imgs:
            events.append({
                'type': 'yellow',
                'player': clean_name,
                'name': clean_name,
                'team': team_name,
                'count': len(y_imgs),
                'minute': minute
            })
        if r_imgs:
            events.append({
                'type': 'red',
                'player': clean_name,
                'name': clean_name,
                'team': team_name,
                'count': len(r_imgs),
                'minute': minute
            })
    return events

# Test on 5. Runde Hinzenbach vs Croatia (id="details_37")
with open('scraper/raw_berichte_1.json', 'r', encoding='utf-8') as f:
    d1 = json.load(f)

pos = d1['html'].find('id="details_37"')
pos_end = d1['html'].find('</tr>', pos)
chunk = d1['html'][pos:pos_end]
tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', chunk, flags=re.IGNORECASE)

home_events = parse_events_from_td(tds[1], "FC Hinzenbach")
away_events = parse_events_from_td(tds[2], "SV Croatia Linz")

print("\nParsed Home Events:")
for h in home_events: print(h)

print("\nParsed Away Events:")
for a in away_events: print(a)
