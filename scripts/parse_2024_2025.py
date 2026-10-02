import json
import re
from bs4 import BeautifulSoup

def clean_html(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def normalize_team(name):
    name = clean_html(name)
    name = name.replace('Union Goldwrth', 'Union Goldwörth')
    name = name.replace('FC U. Schleiheim', 'FC U. Schleißheim')
    name = name.replace('Schleiheim', 'Schleißheim')
    name = name.replace('U. Schleiheim', 'U. Schleißheim')
    name = name.replace('Goldwrth', 'Goldwörth')
    if name in ['DSG St. Josef / Oed', 'DSG St. Josef Oed', 'DSG St. Josef/Oed']:
        return 'DSG St. Josef/Oed FC'
    if name == 'SV Croatia':
        return 'SV Croatia Linz'
    if name == 'DSG Traun':
        return 'DSG Union Traun'
    if name == 'UKJ Froschberg':
        return 'DSG UKJ Froschberg'
    if name == 'Hrvatski centar':
        return 'Hrvatski centar Linz'
    if name == 'FC U. Schleiheim':
        return 'FC U. Schleißheim'
    if name == 'Union Goldwrth':
        return 'Union Goldwörth'
    return name

def parse_date_and_time(raw_date, raw_time_loc):
    raw_date = clean_html(raw_date)
    weekday = ""
    date_str = raw_date
    time_str = "17:00"
    location = "DSG-Platz"
    
    if ',' in raw_date:
        parts = raw_date.split(',')
        weekday = parts[0].strip()
        date_str = parts[1].strip()
        
    if '.' in date_str:
        p = date_str.split('.')
        if len(p) == 3:
            d = p[0].strip().zfill(2)
            m = p[1].strip().zfill(2)
            y = p[2].strip()
            if len(y) == 2:
                y = '20' + y
            date_str = f"{d}.{m}.{y}"
            
    if raw_time_loc:
        clean_tl = clean_html(raw_time_loc)
        # Extract time
        tm = re.search(r'(\d{1,2}:\d{2})', clean_tl)
        if tm:
            time_str = tm.group(1)
            loc_clean = clean_tl.replace(tm.group(1), '').strip()
            if loc_clean:
                location = loc_clean
        elif clean_tl:
            location = clean_tl
            
    return date_str, time_str, weekday, location

def parse_events_from_cell(cell_html, team_name):
    events = []
    if not cell_html:
        return events
        
    # Lines in cell are separated by <br> or newlines
    lines = re.split(r'<br\s*/?>', cell_html, flags=re.IGNORECASE)
    for line in lines:
        line_str = line.strip()
        if not line_str: continue
        
        # Count tor.gif images
        tor_count = len(re.findall(r'tor\.gif', line_str, flags=re.IGNORECASE))
        # Count gelb.gif
        gelb_count = len(re.findall(r'gelb\.gif', line_str, flags=re.IGNORECASE))
        # Count rot.gif
        rot_count = len(re.findall(r'rot\.gif', line_str, flags=re.IGNORECASE))
        # Count gelbrot.gif
        gelbrot_count = len(re.findall(r'gelb-?rot\.gif', line_str, flags=re.IGNORECASE))
        
        player_name = clean_html(line_str)
        if not player_name or player_name.startswith('SR:') or player_name.startswith('Schiedsrichter'):
            continue
            
        if tor_count > 0:
            events.append({
                'type': 'goal',
                'player': player_name,
                'count': tor_count,
                'team': team_name
            })
        if gelb_count > 0:
            events.append({
                'type': 'yellow',
                'player': player_name,
                'count': gelb_count,
                'team': team_name
            })
        if gelbrot_count > 0:
            events.append({
                'type': 'yellowRed',
                'player': player_name,
                'count': gelbrot_count,
                'team': team_name
            })
        if rot_count > 0:
            events.append({
                'type': 'red',
                'player': player_name,
                'count': rot_count,
                'team': team_name
            })
            
    return events

def parse_season_html(html, season_key, league_name):
    soup = BeautifulSoup(html, 'html.parser')
    tables = soup.find_all('table', class_=lambda c: c and 'table' in c)
    
    all_matches = []
    
    current_round_name = "1. Runde"
    
    for tr in soup.find_all('tr'):
        # Check if round header
        th = tr.find('th')
        if th:
            th_txt = clean_html(th.get_text())
            m_r = re.search(r'(\d+)\.\s*Runde', th_txt, flags=re.IGNORECASE)
            if m_r:
                current_round_name = f"{m_r.group(1)}. Runde"
            continue
            
        # Check if match row
        if 'clicker' in tr.get('class', []):
            tds = tr.find_all('td')
            if len(tds) >= 4:
                raw_date = clean_html(tds[0].get_text())
                home = normalize_team(tds[1].get_text())
                away = normalize_team(tds[3].get_text() if len(tds) > 3 and clean_html(tds[2].get_text()) == '-' else tds[2].get_text())
                raw_score = clean_html(tds[-1].get_text())
                
                # Next sibling is details row
                details_tr = tr.find_next_sibling('tr')
                raw_time_loc = ""
                referee = ""
                events = []
                
                if details_tr and details_tr.get('id', '').startswith('details_'):
                    d_tds = details_tr.find_all('td')
                    if len(d_tds) >= 1:
                        raw_time_loc = clean_html(d_tds[0].get_text())
                    if len(d_tds) >= 2:
                        home_events = parse_events_from_cell(str(d_tds[1]), home)
                        events.extend(home_events)
                    if len(d_tds) >= 3:
                        away_events = parse_events_from_cell(str(d_tds[2]), away)
                        events.extend(away_events)
                    if len(d_tds) >= 4:
                        ref_txt = clean_html(d_tds[3].get_text())
                        if 'SR:' in ref_txt:
                            referee = ref_txt.replace('SR:', '').strip()
                        elif ref_txt:
                            referee = ref_txt
                            
                date_str, time_str, weekday, location = parse_date_and_time(raw_date, raw_time_loc)
                if not location or location == 'DSG-Platz':
                    location = f"Sportplatz {home}"
                    
                score = "-:-"
                ht = ""
                status = "Ausstehend"
                
                if 'abgesagt' in raw_score.lower():
                    if '3:0' in raw_score:
                        status = 'Abgesagt 3:0'
                        score = '3:0'
                    elif '0:3' in raw_score:
                        status = 'Abgesagt 0:3'
                        score = '0:3'
                    else:
                        status = 'Abgesagt'
                        score = '-:-'
                elif ':' in raw_score and not raw_score.startswith('-'):
                    status = 'Gespielt'
                    sm = re.search(r'(\d+:\d+)', raw_score)
                    if sm:
                        score = sm.group(1)
                    htm = re.search(r'\(([^)]+)\)', raw_score)
                    if htm:
                        ht = htm.group(1).strip()
                        
                all_matches.append({
                    'round': current_round_name,
                    'date': date_str,
                    'time': time_str,
                    'weekday': weekday,
                    'home': home,
                    'away': away,
                    'score': score,
                    'ht': ht,
                    'status': status,
                    'location': location,
                    'referee': referee,
                    'league': league_name,
                    'seasonKey': season_key,
                    'events': events
                })
                
    return all_matches

def calculate_standings(matches, team_names):
    standings = {t: {
        'name': t, 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0,
        'gf': 0, 'ga': 0, 'goalDiff': 0, 'diff': 0, 'points': 0
    } for t in team_names}
    
    for m in matches:
        home = m['home']
        away = m['away']
        score = m['score']
        status = m['status']
        
        if home not in standings:
            standings[home] = {'name': home, 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'gf': 0, 'ga': 0, 'goalDiff': 0, 'diff': 0, 'points': 0}
        if away not in standings:
            standings[away] = {'name': away, 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'gf': 0, 'ga': 0, 'goalDiff': 0, 'diff': 0, 'points': 0}
            
        gA = 0
        gB = 0
        is_played = False
        
        if status == 'Abgesagt 3:0':
            gA = 3; gB = 0; is_played = True
        elif status == 'Abgesagt 0:3':
            gA = 0; gB = 3; is_played = True
        elif status == 'Gespielt' and ':' in score:
            parts = score.split(':')
            gA = int(parts[0])
            gB = int(parts[1])
            is_played = True
            
        if is_played:
            tA = standings[home]
            tB = standings[away]
            tA['played'] += 1
            tB['played'] += 1
            tA['gf'] += gA
            tA['ga'] += gB
            tB['gf'] += gB
            tB['ga'] += gA
            tA['goalDiff'] = tA['gf'] - tA['ga']
            tA['diff'] = tA['goalDiff']
            tB['goalDiff'] = tB['gf'] - tB['ga']
            tB['diff'] = tB['goalDiff']
            
            if gA > gB:
                tA['won'] += 1
                tA['points'] += 3
                tB['lost'] += 1
            elif gB > gA:
                tB['won'] += 1
                tB['points'] += 3
                tA['lost'] += 1
            else:
                tA['drawn'] += 1
                tA['points'] += 1
                tB['drawn'] += 1
                tB['points'] += 1
                
    sorted_teams = sorted(standings.values(), key=lambda t: (t['points'], t['goalDiff'], t['gf']), reverse=True)
    for idx, t in enumerate(sorted_teams):
        t['rank'] = idx + 1
    return sorted_teams

def extract_top_scorers(matches):
    scorers = {}
    cards_list = []
    
    for m in matches:
        for ev in m.get('events', []):
            p = ev.get('player', '').strip()
            t = ev.get('team', '').strip()
            ev_type = ev.get('type')
            cnt = int(ev.get('count', 1))
            
            if ev_type == 'goal' and p:
                if p not in scorers:
                    scorers[p] = {'name': p, 'team': t, 'goals': 0}
                scorers[p]['goals'] += cnt
                if t: scorers[p]['team'] = t
                
            if ev_type in ['yellow', 'yellowRed', 'red'] and p:
                cards_list.append({
                    'player': p,
                    'team': t,
                    'type': ev_type,
                    'count': cnt,
                    'match': f"{m['home']} vs {m['away']}",
                    'round': m['round'],
                    'date': m['date']
                })
                
    sorted_scorers = sorted(scorers.values(), key=lambda x: x['goals'], reverse=True)
    for idx, s in enumerate(sorted_scorers):
        s['rank'] = idx + 1
        
    return sorted_scorers, cards_list

print("=== Parsing Season 2024/2025 ===")
f6 = json.load(open('scraper/raw_berichte_6.json', encoding='utf-8'))
matches_2024 = parse_season_html(f6['html'], '2024/2025', 'DSG Liga')
print(f"DSG Liga 2024/2025 matches: {len(matches_2024)}")
teams_2024 = sorted(list(set([m['home'] for m in matches_2024] + [m['away'] for m in matches_2024])))
print(f"Teams ({len(teams_2024)}): {teams_2024}")
table_2024 = calculate_standings(matches_2024, teams_2024)
scorers_2024, cards_2024 = extract_top_scorers(matches_2024)
print("Top 5 Teams 2024/2025:")
for t in table_2024[:5]:
    print(f"  #{t['rank']} {t['name']} - {t['points']} Pkt ({t['gf']}:{t['ga']})")
print("Top 5 Scorers 2024/2025:")
for s in scorers_2024[:5]:
    print(f"  #{s['rank']} {s['name']} ({s['team']}) - {s['goals']} Tore")

print("\n=== Parsing Oberes Playoff 2024/2025 ===")
f11 = json.load(open('scraper/raw_berichte_11.json', encoding='utf-8'))
matches_oberes = parse_season_html(f11['html'], '2024/2025_oberes', 'Oberes Playoff')
print(f"Oberes Playoff matches: {len(matches_oberes)}")
teams_oberes = sorted(list(set([m['home'] for m in matches_oberes] + [m['away'] for m in matches_oberes])))
print(f"Teams ({len(teams_oberes)}): {teams_oberes}")
table_oberes = calculate_standings(matches_oberes, teams_oberes)
scorers_oberes, cards_oberes = extract_top_scorers(matches_oberes)
print("Top 5 Teams Oberes Playoff:")
for t in table_oberes[:5]:
    print(f"  #{t['rank']} {t['name']} - {t['points']} Pkt ({t['gf']}:{t['ga']})")
print("Top 5 Scorers Oberes Playoff:")
for s in scorers_oberes[:5]:
    print(f"  #{s['rank']} {s['name']} ({s['team']}) - {s['goals']} Tore")

print("\n=== Parsing Unteres Playoff 2024/2025 ===")
f12 = json.load(open('scraper/raw_berichte_12.json', encoding='utf-8'))
matches_unteres = parse_season_html(f12['html'], '2024/2025_unteres', 'Unteres Playoff')
print(f"Unteres Playoff matches: {len(matches_unteres)}")
teams_unteres = sorted(list(set([m['home'] for m in matches_unteres] + [m['away'] for m in matches_unteres])))
print(f"Teams ({len(teams_unteres)}): {teams_unteres}")
table_unteres = calculate_standings(matches_unteres, teams_unteres)
scorers_unteres, cards_unteres = extract_top_scorers(matches_unteres)
print("Top 5 Teams Unteres Playoff:")
for t in table_unteres[:5]:
    print(f"  #{t['rank']} {t['name']} - {t['points']} Pkt ({t['gf']}:{t['ga']})")
print("Top 5 Scorers Unteres Playoff:")
for s in scorers_unteres[:5]:
    print(f"  #{s['rank']} {s['name']} ({s['team']}) - {s['goals']} Tore")
