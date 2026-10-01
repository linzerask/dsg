import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import os
import re

# Load players database for name matching
with open('Website/data/players.json', 'r', encoding='utf-8') as f:
    all_players = json.load(f)

print(f"Loaded {len(all_players)} players from players.json")

all_full_names = []
player_team_map = {}
for p in all_players:
    fn = p.get('Vorname', '').strip()
    ln = p.get('Nachname', '').strip()
    full = f"{fn} {ln}".strip()
    if full:
        all_full_names.append(full)
        if p.get('Team'):
            player_team_map[full.lower()] = p.get('Team')

def clean_html(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def normalize_team(name):
    name = clean_html(name)
    name = name.replace('Union Goldwrth', 'Union Goldwörth').replace('Union Goldwrth', 'Union Goldwörth')
    name = name.replace('FC U. Schleiheim', 'FC U. Schleißheim').replace('FC U. Schleiheim', 'FC U. Schleißheim')
    name = name.replace('Schleiheim', 'Schleißheim').replace('Schleiheim', 'Schleißheim')
    name = name.replace('Hrsching', 'Hörsching').replace('Hörsching', 'Hörsching')
    name = name.replace('Mnzkirchen', 'Münzkirchen').replace('Münzkirchen', 'Münzkirchen')
    name = name.replace('Knigswiesen', 'Königswiesen').replace('Königswiesen', 'Königswiesen')
    name = name.replace('Wrth', 'Wörth').replace('Wörth', 'Wörth')
    if name in ['DSG St. Josef / Oed', 'DSG St. Josef Oed', 'DSG St. Josef/Oed']:
        return 'DSG St. Josef/Oed FC'
    if name == 'SV Croatia':
        return 'SV Croatia Linz'
    if name == 'DSG Traun':
        return 'DSG Union Traun'
    if name == 'UKJ Froschberg':
        return 'DSG UKJ Froschberg'
    return name

def normalize_player_name(raw_name):
    raw_name = clean_html(raw_name)
    if not raw_name: return "", ""
    
    # Check if there is a minute e.g. (12.) or (90.+2)
    min_match = re.search(r'\((\d+\.?[\+\d]*)\)', raw_name)
    minute = min_match.group(1) if min_match else ""
    name_only = re.sub(r'\(\d+\.?[\+\d]*\)', '', raw_name).strip()
    name_only = re.sub(r'^\d+:\d+\s*', '', name_only).strip()
    
    if not name_only: return "", ""
    
    # Direct case-insensitive match
    for fn in all_full_names:
        if fn.lower() == name_only.lower():
            return fn, minute
            
    # Wildcard regex match for broken characters
    escaped = ''.join(['.' if c in ['\ufffd', '?', ''] else re.escape(c) for c in name_only])
    pattern = re.compile('^' + escaped + '$', re.IGNORECASE)
    for fn in all_full_names:
        if pattern.match(fn):
            return fn, minute
            
    return name_only, minute

def parse_date_and_time(raw_date):
    raw_date = clean_html(raw_date)
    weekday = ""
    date_str = raw_date
    time_str = "17:00"
    
    if ',' in raw_date:
        parts = raw_date.split(',')
        weekday = parts[0].strip().upper()
        date_str = parts[1].strip()
        
    if ' ' in date_str:
        dp = date_str.split(' ')
        date_str = dp[0].strip()
        if len(dp) > 1 and ':' in dp[1]:
            time_str = dp[1].strip()
            
    if '.' in date_str:
        p = date_str.split('.')
        if len(p) == 3:
            d = p[0].strip().zfill(2)
            m = p[1].strip().zfill(2)
            y = p[2].strip()
            if len(y) == 2:
                y = '20' + y
            date_str = f"{d}.{m}.{y}"
            
    return date_str, time_str, weekday

def parse_events_from_td(td_html, team_name):
    events = []
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

def extract_matches_and_stats(part, default_round_name, season_key, league_name, scorers_agg, cards_agg):
    matches = []
    match_chunks = re.split(r'<tr class="clicker"[^>]*>', part, flags=re.IGNORECASE)
    
    for m_idx in range(1, len(match_chunks)):
        chunk = match_chunks[m_idx]
        pos = chunk.find('id="details_')
        main = chunk[:pos] if pos != -1 else chunk
        details = chunk[pos:] if pos != -1 else ""
        
        tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', main, flags=re.IGNORECASE)
        clean_tds = [clean_html(t) for t in tds]
        if len(clean_tds) < 5: continue
        
        raw_date = clean_tds[0]
        home = normalize_team(clean_tds[1])
        away = normalize_team(clean_tds[3])
        score = clean_tds[4]
        
        if not home or not away: continue
        
        date_str, time_str, weekday = parse_date_and_time(raw_date)
        
        # Parse details row: venue, time, home events, away events
        location = ""
        events = []
        scorers = []
        cards = []
        
        if details:
            dt_tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
            if len(dt_tds) >= 1:
                dt_info = clean_html(dt_tds[0])
                # E.g. "Sportplatz Wörth 18:30"
                if dt_info:
                    # check for time
                    time_m = re.search(r'(\d{1,2}:\d{2})', dt_info)
                    if time_m:
                        time_str = time_m.group(1)
                        location = dt_info.replace(time_str, '').strip()
                    else:
                        location = dt_info
                        
            if len(dt_tds) >= 3:
                home_events = parse_events_from_td(dt_tds[1], home)
                away_events = parse_events_from_td(dt_tds[2], away)
                events = home_events + away_events
                
        if not location:
            location = f"Sportplatz {home}"
            
        location = normalize_team(location)
        
        # HT score extraction if exists
        ht = ""
        if '(' in score and ')' in score:
            ht_m = re.search(r'\(([^)]+)\)', score)
            if ht_m: ht = ht_m.group(1).strip()
            
        status = "Beendet"
        if not score or score.startswith(':') or score == '-:-' or score == '- : -':
            status = "Ausstehend"
            score = "-:-"
        elif 'abgesagt' in score.lower() or 'str' in score.lower():
            status = "Abgesagt"
            
        # Classify events into scorers and cards lists
        y_count = 0
        r_count = 0
        yr_count = 0
        
        for ev in events:
            cnt = int(ev.get('count', 1))
            if ev['type'] == 'goal':
                for _ in range(cnt):
                    scorers.append({
                        'name': ev['player'],
                        'player': ev['player'],
                        'team': ev['team'],
                        'count': 1,
                        'minute': ev['minute']
                    })
                # Aggregate top scorers
                p_key = (ev['player'] + '___' + ev['team']).lower()
                if p_key not in scorers_agg:
                    scorers_agg[p_key] = {'name': ev['player'], 'team': ev['team'], 'goals': 0}
                scorers_agg[p_key]['goals'] += cnt
            else:
                for _ in range(cnt):
                    cards.append({
                        'name': ev['player'],
                        'player': ev['player'],
                        'team': ev['team'],
                        'type': ev['type'],
                        'count': 1,
                        'minute': ev['minute']
                    })
                # Disciplinary Card Model per Rule 22:
                p_key = (ev['player'] + '___' + ev['team']).lower()
                if p_key not in cards_agg:
                    cards_agg[p_key] = {'name': ev['player'], 'team': ev['team'], 'yellow': 0, 'red': 0, 'yellowRed': 0, 'suspension': ''}
                
                if ev['type'] == 'yellow':
                    cards_agg[p_key]['yellow'] += cnt
                    y_count += cnt
                elif ev['type'] == 'yellowRed':
                    # Rule 22: Yellow-Red dismissal counts as 2 Yellows and 1 Red
                    cards_agg[p_key]['yellow'] += (2 * cnt)
                    cards_agg[p_key]['red'] += cnt
                    cards_agg[p_key]['yellowRed'] += cnt
                    yr_count += cnt
                elif ev['type'] == 'red':
                    cards_agg[p_key]['red'] += cnt
                    r_count += cnt
                    
        matches.append({
            'date': date_str,
            'time': time_str,
            'weekday': weekday,
            'location': location,
            'venue': location,
            'home': home,
            'away': away,
            'score': score,
            'ht': ht,
            'round': default_round_name,
            'seasonKey': season_key,
            'league': league_name,
            'status': status,
            'events': events,
            'scorers': scorers,
            'cards': cards,
            'yellow': y_count,
            'red': r_count,
            'yellowRed': yr_count
        })
        
    return matches

# -------------------------------------------------------------
# RUN IMPORT
# -------------------------------------------------------------
with open('scraper/raw_berichte_1.json', 'r', encoding='utf-8') as f: d1 = json.load(f)
with open('scraper/raw_berichte_2.json', 'r', encoding='utf-8') as f: d2 = json.load(f)
with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f: d3 = json.load(f)
with open('scraper/raw_berichte_4.json', 'r', encoding='utf-8') as f: d4 = json.load(f)

parts_1 = re.split(r'<tr class="green-col"[^>]*>', d1['html'], flags=re.IGNORECASE)
parts_2 = re.split(r'<tr class="green-col"[^>]*>', d2['html'], flags=re.IGNORECASE)
parts_3 = re.split(r'<tr class="green-col"[^>]*>', d3['html'], flags=re.IGNORECASE)
parts_4 = re.split(r'<tr class="green-col"[^>]*>', d4['html'], flags=re.IGNORECASE)

dsg_liga_matches = []
dsg_liga_rounds = []
dsg_liga_scorers = {}
dsg_liga_cards = {}

# 1. DSG Liga 2022/2023
r1_indices = [1, 3, 5, 7, 9, 11, 13]
r1_dates = [
    ("24.08.2022", "31.08.2022"),
    ("02.09.2022", "25.10.2022"),
    ("14.09.2022", "06.06.2023"),
    ("23.09.2022", "22.10.2022"),
    ("30.09.2022", "22.10.2022"),
    ("05.10.2022", "08.10.2022"),
    ("14.10.2022", "05.11.2022")
]
for idx, p_idx in enumerate(r1_indices):
    r_num = idx + 1
    r_name = f"{r_num}. Runde"
    d_von, d_bis = r1_dates[idx]
    m_list = extract_matches_and_stats(parts_1[p_idx], r_name, "2022/2023", "DSG Liga", dsg_liga_scorers, dsg_liga_cards)[:4]
    dsg_liga_matches.extend(m_list)
    dsg_liga_rounds.append({
        'id': r_num,
        'saison': "DSG Liga",
        'jahr': "2022/2023",
        'runde': str(r_num),
        'datum': f"{r_name} ({d_von} - {d_bis})",
        'datumVon': d_von,
        'datumBis': d_bis,
        'liga': "DSG Liga",
        'seasonKey': "2022/2023",
        'status': "Inaktiv"
    })

r3_indices = [17, 19, 23, 25, 27, 29, 31]
r3_dates = [
    ("08.04.2023", "10.06.2023"),
    ("21.04.2023", "22.04.2023"),
    ("28.04.2023", "29.04.2023"),
    ("05.05.2023", "06.05.2023"),
    ("12.05.2023", "13.05.2023"),
    ("17.05.2023", "20.05.2023"),
    ("26.05.2023", "02.06.2023")
]
for idx, p_idx in enumerate(r3_indices):
    r_num = idx + 8
    r_name = f"{r_num}. Runde"
    d_von, d_bis = r3_dates[idx]
    m_list = extract_matches_and_stats(parts_3[p_idx], r_name, "2022/2023", "DSG Liga", dsg_liga_scorers, dsg_liga_cards)
    dsg_liga_matches.extend(m_list)
    dsg_liga_rounds.append({
        'id': r_num,
        'saison': "DSG Liga",
        'jahr': "2022/2023",
        'runde': str(r_num),
        'datum': f"{r_name} ({d_von} - {d_bis})",
        'datumVon': d_von,
        'datumBis': d_bis,
        'liga': "DSG Liga",
        'seasonKey': "2022/2023",
        'status': "Inaktiv"
    })

# 2. 1. Klasse 2022/2023
klasse_matches = []
klasse_rounds = []
klasse_scorers = {}
klasse_cards = {}

r2_indices = [1, 3, 5, 7, 9, 11, 13]
r2_dates = [
    ("27.08.2022", "22.10.2022"),
    ("02.09.2022", "03.09.2022"),
    ("16.09.2022", "17.09.2022"),
    ("23.09.2022", "24.09.2022"),
    ("30.09.2022", "01.10.2022"),
    ("07.10.2022", "08.10.2022"),
    ("14.10.2022", "08.04.2023")
]
for idx, p_idx in enumerate(r2_indices):
    r_num = idx + 1
    r_name = f"{r_num}. Runde"
    d_von, d_bis = r2_dates[idx]
    m_list = extract_matches_and_stats(parts_2[p_idx], r_name, "2022/2023_1klasse", "1. Klasse", klasse_scorers, klasse_cards)
    klasse_matches.extend(m_list)
    klasse_rounds.append({
        'id': r_num + 50,
        'saison': "1. Klasse",
        'jahr': "2022/2023",
        'runde': str(r_num),
        'datum': f"{r_name} ({d_von} - {d_bis})",
        'datumVon': d_von,
        'datumBis': d_bis,
        'liga': "1. Klasse",
        'seasonKey': "2022/2023_1klasse",
        'status': "Inaktiv"
    })

r4_indices = [1, 3, 5, 7, 9, 11, 13]
r4_dates = [
    ("02.06.2023", "10.06.2023"),
    ("21.04.2023", "07.06.2023"),
    ("29.04.2023", "03.06.2023"),
    ("05.05.2023", "06.05.2023"),
    ("13.05.2023", "03.06.2023"),
    ("17.05.2023", "20.05.2023"),
    ("26.05.2023", "27.05.2023")
]
for idx, p_idx in enumerate(r4_indices):
    r_num = idx + 8
    r_name = f"{r_num}. Runde"
    d_von, d_bis = r4_dates[idx]
    m_list = extract_matches_and_stats(parts_4[p_idx], r_name, "2022/2023_1klasse", "1. Klasse", klasse_scorers, klasse_cards)
    klasse_matches.extend(m_list)
    klasse_rounds.append({
        'id': r_num + 50,
        'saison': "1. Klasse",
        'jahr': "2022/2023",
        'runde': str(r_num),
        'datum': f"{r_name} ({d_von} - {d_bis})",
        'datumVon': d_von,
        'datumBis': d_bis,
        'liga': "1. Klasse",
        'seasonKey': "2022/2023_1klasse",
        'status': "Inaktiv"
    })

# Format top scorers
def format_scorers(scorers_dict):
    lst = sorted(scorers_dict.values(), key=lambda x: x['goals'], reverse=True)
    for idx, row in enumerate(lst):
        row['rank'] = idx + 1
    return lst

# Format cards
def format_cards(cards_dict):
    lst = sorted(cards_dict.values(), key=lambda x: (x['red'], x['yellowRed'], x['yellow']), reverse=True)
    for idx, row in enumerate(lst):
        row['rank'] = idx + 1
    return lst

# Calculate standings
def calculate_standings(matches):
    stats = {}
    for m in matches:
        h = m['home']
        a = m['away']
        if h not in stats: stats[h] = {'name': h, 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'goalDiff': 0, 'points': 0}
        if a not in stats: stats[a] = {'name': a, 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'goalDiff': 0, 'points': 0}
        
        sc = m['score']
        if sc and ':' in sc and not sc.startswith(':') and m['status'] == 'Beendet':
            sp = sc.split('(')[0].strip().split(':')
            try:
                gh = int(sp[0])
                ga = int(sp[1])
                
                stats[h]['played'] += 1
                stats[a]['played'] += 1
                stats[h]['goalsFor'] += gh
                stats[h]['goalsAgainst'] += ga
                stats[a]['goalsFor'] += ga
                stats[a]['goalsAgainst'] += gh
                
                if gh > ga:
                    stats[h]['won'] += 1
                    stats[h]['points'] += 3
                    stats[a]['lost'] += 1
                elif ga > gh:
                    stats[a]['won'] += 1
                    stats[a]['points'] += 3
                    stats[h]['lost'] += 1
                else:
                    stats[h]['drawn'] += 1
                    stats[h]['points'] += 1
                    stats[a]['drawn'] += 1
                    stats[a]['points'] += 1
            except:
                pass
                
    for t, s in stats.items():
        s['goalDiff'] = s['goalsFor'] - s['goalsAgainst']
        
    table = sorted(stats.values(), key=lambda x: (x['points'], x['goalDiff'], x['goalsFor']), reverse=True)
    for idx, row in enumerate(table):
        row['rank'] = idx + 1
    return table

liga_table = calculate_standings(dsg_liga_matches)
klasse_table = calculate_standings(klasse_matches)

# Write to Website/data/liga.json
with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    liga_full = json.load(f)

liga_full['seasons']['2022/2023'] = {
    'teams': liga_table,
    'matches': dsg_liga_matches,
    'stats': {
        'topScorers': format_scorers(dsg_liga_scorers),
        'cards': format_cards(dsg_liga_cards)
    }
}

liga_full['seasons']['2022/2023_1klasse'] = {
    'teams': klasse_table,
    'matches': klasse_matches,
    'stats': {
        'topScorers': format_scorers(klasse_scorers),
        'cards': format_cards(klasse_cards)
    }
}

with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga_full, f, ensure_ascii=False, indent=2)

print(f"DSG Liga 2022/2023: {len(dsg_liga_matches)} matches, {len(dsg_liga_scorers)} scorers, {len(dsg_liga_cards)} carded players")
print(f"1. Klasse 2022/2023: {len(klasse_matches)} matches, {len(klasse_scorers)} scorers, {len(klasse_cards)} carded players")
print("Saved Website/data/liga.json successfully!")

# Write rounds to Website/data/rounds.json
all_season_rounds = dsg_liga_rounds + klasse_rounds
with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
    json.dump(all_season_rounds, f, ensure_ascii=False, indent=2)

print(f"Saved {len(all_season_rounds)} rounds to Website/data/rounds.json successfully!")
