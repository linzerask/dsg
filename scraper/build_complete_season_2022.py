import json
import os
import re

def clean_html(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def normalize_team(name):
    name = clean_html(name)
    name = name.replace('Union Goldwrth', 'Union Goldwörth').replace('Union Goldwrth', 'Union Goldwörth')
    name = name.replace('FC U. Schleiheim', 'FC U. Schleißheim').replace('FC U. Schleiheim', 'FC U. Schleißheim')
    name = name.replace('Schleiheim', 'Schleißheim').replace('Schleiheim', 'Schleißheim')
    if name in ['DSG St. Josef / Oed', 'DSG St. Josef Oed', 'DSG St. Josef/Oed']:
        return 'DSG St. Josef/Oed FC'
    if name == 'SV Croatia':
        return 'SV Croatia Linz'
    if name == 'DSG Traun':
        return 'DSG Union Traun'
    if name == 'UKJ Froschberg':
        return 'DSG UKJ Froschberg'
    return name

def parse_date_and_time(raw_date):
    raw_date = clean_html(raw_date)
    weekday = ""
    date_str = raw_date
    time_str = "17:00"
    
    if ',' in raw_date:
        parts = raw_date.split(',')
        weekday = parts[0].strip()
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

def extract_matches_from_part(part, default_round_name, season_key, league_name):
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
        
        referee = ""
        location = ""
        
        ref_m = re.search(r'Schiedsrichter:\s*</td>\s*<td>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
        if ref_m: referee = clean_html(ref_m.group(1))
        
        loc_m = re.search(r'Spielort:\s*</td>\s*<td>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
        if loc_m: location = clean_html(loc_m.group(1))
        if not location:
            location = f"Sportplatz {home}"
            
        status = "Beendet"
        if not score or score.startswith(':') or score == '-:-':
            status = "Ausstehend"
            score = "-:-"
        elif 'abgesagt' in score.lower() or 'str' in score.lower():
            status = "Abgesagt"
            
        scorers = []
        tore_blocks = re.findall(r'<td[^>]*class="tore"[^>]*>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
        for tb in tore_blocks:
            lines = re.split(r'<br\s*/?>|\n', tb, flags=re.IGNORECASE)
            for line in lines:
                cline = clean_html(line)
                if not cline: continue
                scorers.append(cline)
                
        matches.append({
            'date': date_str,
            'time': time_str,
            'weekday': weekday,
            'location': location,
            'home': home,
            'away': away,
            'score': score,
            'round': default_round_name,
            'seasonKey': season_key,
            'league': league_name,
            'status': status,
            'referee': referee,
            'scorers': scorers,
            'yellow': len(re.findall(r'gelb\.png', details, flags=re.IGNORECASE)),
            'red': len(re.findall(r'rot\.png', details, flags=re.IGNORECASE)),
            'yellowRed': len(re.findall(r'gelb-rot\.png', details, flags=re.IGNORECASE)),
            'report': details
        })
        
    return matches

# -------------------------------------------------------------
# 1. PARSE DSG LIGA 2022/2023 (56 matches, 14 rounds)
# -------------------------------------------------------------
print("\n--- Parsing DSG Liga 2022/2023 ---")
with open('scraper/raw_berichte_1.json', 'r', encoding='utf-8') as f:
    d1 = json.load(f)
with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f:
    d3 = json.load(f)

parts_1 = re.split(r'<tr class="green-col"[^>]*>', d1['html'], flags=re.IGNORECASE)
parts_3 = re.split(r'<tr class="green-col"[^>]*>', d3['html'], flags=re.IGNORECASE)

dsg_liga_matches = []
dsg_liga_rounds = []

# Rounds 1-7 from raw_berichte_1
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
    
    matches = extract_matches_from_part(parts_1[p_idx], r_name, "2022/2023", "DSG Liga")
    # Take first 4 matches (deduping any accidental 5th match in round 1)
    matches = matches[:4]
    
    dsg_liga_matches.extend(matches)
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

# Rounds 8-14 from raw_berichte_3
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
    
    matches = extract_matches_from_part(parts_3[p_idx], r_name, "2022/2023", "DSG Liga")
    dsg_liga_matches.extend(matches)
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

print(f"DSG Liga 2022/2023 Total Matches: {len(dsg_liga_matches)} (Expected 56)")
print(f"DSG Liga 2022/2023 Total Rounds: {len(dsg_liga_rounds)} (Expected 14)")

# -------------------------------------------------------------
# 2. PARSE 1. KLASSE 2022/2023 (49 matches, 14 rounds)
# -------------------------------------------------------------
print("\n--- Parsing 1. Klasse 2022/2023 ---")
with open('scraper/raw_berichte_2.json', 'r', encoding='utf-8') as f:
    d2 = json.load(f)
with open('scraper/raw_berichte_4.json', 'r', encoding='utf-8') as f:
    d4 = json.load(f)

parts_2 = re.split(r'<tr class="green-col"[^>]*>', d2['html'], flags=re.IGNORECASE)
parts_4 = re.split(r'<tr class="green-col"[^>]*>', d4['html'], flags=re.IGNORECASE)

klasse_matches = []
klasse_rounds = []

# Rounds 1-7 from raw_berichte_2
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
    
    matches = extract_matches_from_part(parts_2[p_idx], r_name, "2022/2023_1klasse", "1. Klasse")
    klasse_matches.extend(matches)
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

# Rounds 8-14 from raw_berichte_4
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
    
    matches = extract_matches_from_part(parts_4[p_idx], r_name, "2022/2023_1klasse", "1. Klasse")
    klasse_matches.extend(matches)
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

print(f"1. Klasse 2022/2023 Total Matches: {len(klasse_matches)} (Expected 49)")
print(f"1. Klasse 2022/2023 Total Rounds: {len(klasse_rounds)} (Expected 14)")

# -------------------------------------------------------------
# 3. CALCULATE STANDINGS
# -------------------------------------------------------------
def calculate_standings(matches):
    stats = {}
    for m in matches:
        h = m['home']
        a = m['away']
        if h not in stats: stats[h] = {'name': h, 'played': 0, 'won': 0, 'draw': 0, 'lost': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'goalDiff': 0, 'points': 0}
        if a not in stats: stats[a] = {'name': a, 'played': 0, 'won': 0, 'draw': 0, 'lost': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'goalDiff': 0, 'points': 0}
        
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
                    stats[h]['draw'] += 1
                    stats[h]['points'] += 1
                    stats[a]['draw'] += 1
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

print("\n--- DSG Liga 2022/2023 Final Standings ---")
for t in liga_table:
    print(f"#{t['rank']} {t['name']:<25} | Pld: {t['played']} | W: {t['won']} D: {t['draw']} L: {t['lost']} | Goals: {t['goalsFor']}:{t['goalsAgainst']} ({t['goalDiff']:+3d}) | Pts: {t['points']}")

print("\n--- 1. Klasse 2022/2023 Final Standings ---")
for t in klasse_table:
    print(f"#{t['rank']} {t['name']:<25} | Pld: {t['played']} | W: {t['won']} D: {t['draw']} L: {t['lost']} | Goals: {t['goalsFor']}:{t['goalsAgainst']} ({t['goalDiff']:+3d}) | Pts: {t['points']}")

