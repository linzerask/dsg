import json
import re
import os
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
        
    lines = re.split(r'<br\s*/?>', cell_html, flags=re.IGNORECASE)
    for line in lines:
        line_str = line.strip()
        if not line_str: continue
        
        tor_count = len(re.findall(r'tor\.gif', line_str, flags=re.IGNORECASE))
        gelb_count = len(re.findall(r'gelb\.gif', line_str, flags=re.IGNORECASE))
        rot_count = len(re.findall(r'rot\.gif', line_str, flags=re.IGNORECASE))
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
    all_matches = []
    current_round_name = "1. Runde"
    
    for tr in soup.find_all('tr'):
        th = tr.find('th')
        if th:
            th_txt = clean_html(th.get_text())
            m_r = re.search(r'(\d+)\.\s*Runde', th_txt, flags=re.IGNORECASE)
            if m_r:
                current_round_name = f"{m_r.group(1)}. Runde"
            continue
            
        if 'clicker' in tr.get('class', []):
            tds = tr.find_all('td')
            if len(tds) >= 4:
                raw_date = clean_html(tds[0].get_text())
                home = normalize_team(tds[1].get_text())
                away = normalize_team(tds[3].get_text() if len(tds) > 3 and clean_html(tds[2].get_text()) == '-' else tds[2].get_text())
                raw_score = clean_html(tds[-1].get_text())
                
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

def main():
    print("Parsing Season 2024/2025 raw HTML files...")
    
    # 1. DSG Liga 2024/2025
    f6 = json.load(open('scraper/raw_berichte_6.json', encoding='utf-8'))
    m_2024 = parse_season_html(f6['html'], '2024/2025', 'DSG Liga')
    teams_2024 = sorted(list(set([m['home'] for m in m_2024] + [m['away'] for m in m_2024])))
    table_2024 = calculate_standings(m_2024, teams_2024)
    scorers_2024, cards_2024 = extract_top_scorers(m_2024)
    
    # 2. Oberes Playoff 2024/2025
    f11 = json.load(open('scraper/raw_berichte_11.json', encoding='utf-8'))
    m_oberes = parse_season_html(f11['html'], '2024/2025_oberes', 'Oberes Playoff')
    teams_oberes = sorted(list(set([m['home'] for m in m_oberes] + [m['away'] for m in m_oberes])))
    table_oberes = calculate_standings(m_oberes, teams_oberes)
    scorers_oberes, cards_oberes = extract_top_scorers(m_oberes)
    
    # 3. Unteres Playoff 2024/2025
    f12 = json.load(open('scraper/raw_berichte_12.json', encoding='utf-8'))
    m_unteres = parse_season_html(f12['html'], '2024/2025_unteres', 'Unteres Playoff')
    teams_unteres = sorted(list(set([m['home'] for m in m_unteres] + [m['away'] for m in m_unteres])))
    table_unteres = calculate_standings(m_unteres, teams_unteres)
    scorers_unteres, cards_unteres = extract_top_scorers(m_unteres)
    
    print(f"Parsed 2024/2025: {len(m_2024)} matches, {len(teams_2024)} teams")
    print(f"Parsed 2024/2025_oberes: {len(m_oberes)} matches, {len(teams_oberes)} teams")
    print(f"Parsed 2024/2025_unteres: {len(m_unteres)} matches, {len(teams_unteres)} teams")
    
    # Load and update Website/data/liga.json
    liga_path = 'Website/data/liga.json'
    liga_data = json.load(open(liga_path, encoding='utf-8'))
    
    liga_data['seasons']['2024/2025'] = {
        'teams': table_2024,
        'matches': m_2024,
        'stats': {
            'topScorers': scorers_2024,
            'cards': cards_2024
        }
    }
    
    liga_data['seasons']['2024/2025_oberes'] = {
        'teams': table_oberes,
        'matches': m_oberes,
        'stats': {
            'topScorers': scorers_oberes,
            'cards': cards_oberes
        }
    }
    
    liga_data['seasons']['2024/2025_unteres'] = {
        'teams': table_unteres,
        'matches': m_unteres,
        'stats': {
            'topScorers': scorers_unteres,
            'cards': cards_unteres
        }
    }
    
    liga_data['currentSeason'] = "2024/2025"
    
    with open(liga_path, 'w', encoding='utf-8') as f:
        json.dump(liga_data, f, ensure_ascii=False, indent=2)
    print("Updated Website/data/liga.json with 2024/2025 seasons")
    
    # Update Website/data/leagues.json
    leagues_path = 'Website/data/leagues.json'
    leagues_data = json.load(open(leagues_path, encoding='utf-8'))
    
    # Check if 2024/2025 entries already exist
    existing_keys = [l.get('seasonKey') for l in leagues_data]
    max_id = max([l.get('id', 0) for l in leagues_data]) if leagues_data else 0
    
    if '2024/2025' not in existing_keys:
        max_id += 1
        leagues_data.append({
            'id': max_id,
            'name': 'DSG Liga',
            'year': '2024/2025',
            'seasonKey': '2024/2025',
            'status': 'Aktiv',
            'showOnHomepage': True
        })
    if '2024/2025_oberes' not in existing_keys:
        max_id += 1
        leagues_data.append({
            'id': max_id,
            'name': 'Oberes Playoff',
            'year': '2024/2025',
            'seasonKey': '2024/2025_oberes',
            'status': 'Aktiv',
            'showOnHomepage': True
        })
    if '2024/2025_unteres' not in existing_keys:
        max_id += 1
        leagues_data.append({
            'id': max_id,
            'name': 'Unteres Playoff',
            'year': '2024/2025',
            'seasonKey': '2024/2025_unteres',
            'status': 'Aktiv',
            'showOnHomepage': True
        })
        
    with open(leagues_path, 'w', encoding='utf-8') as f:
        json.dump(leagues_data, f, ensure_ascii=False, indent=2)
    print("Updated Website/data/leagues.json with 2024/2025 competitions")
    
    # Update Website/data/rounds.json
    rounds_path = 'Website/data/rounds.json'
    rounds_data = json.load(open(rounds_path, encoding='utf-8'))
    max_round_id = max([r.get('id', 0) for r in rounds_data]) if rounds_data else 0
    
    # 1. Rounds for DSG Liga 2024/2025 (11 rounds)
    r_dates_2024 = {
        1: ("06.09.2024", "07.09.2024"),
        2: ("13.09.2024", "14.09.2024"),
        3: ("20.09.2024", "21.09.2024"),
        4: ("27.09.2024", "28.09.2024"),
        5: ("04.10.2024", "05.10.2024"),
        6: ("11.10.2024", "12.10.2024"),
        7: ("18.10.2024", "19.10.2024"),
        8: ("25.10.2024", "26.10.2024"),
        9: ("01.11.2024", "02.11.2024"),
        10: ("04.04.2025", "05.04.2025"),
        11: ("11.04.2025", "12.04.2025"),
    }
    for r_nr in range(1, 12):
        if not any(r.get('seasonKey') == '2024/2025' and r.get('runde') == r_nr for r in rounds_data):
            max_round_id += 1
            v, b = r_dates_2024.get(r_nr, ("01.09.2024", "15.04.2025"))
            rounds_data.append({
                'id': max_round_id,
                'liga': 'DSG Liga',
                'jahr': '2024/2025',
                'seasonKey': '2024/2025',
                'runde': r_nr,
                'datumVon': v,
                'datumBis': b,
                'status': 'Aktiv'
            })
            
    # 2. Rounds for Oberes Playoff 2024/2025 (5 rounds)
    r_dates_oberes = {
        1: ("25.04.2025", "30.04.2025"),
        2: ("03.05.2025", "30.05.2025"),
        3: ("07.05.2025", "10.05.2025"),
        4: ("16.05.2025", "17.05.2025"),
        5: ("23.05.2025", "24.05.2025"),
    }
    for r_nr in range(1, 6):
        if not any(r.get('seasonKey') == '2024/2025_oberes' and r.get('runde') == r_nr for r in rounds_data):
            max_round_id += 1
            v, b = r_dates_oberes.get(r_nr, ("25.04.2025", "24.05.2025"))
            rounds_data.append({
                'id': max_round_id,
                'liga': 'Oberes Playoff',
                'jahr': '2024/2025',
                'seasonKey': '2024/2025_oberes',
                'runde': r_nr,
                'datumVon': v,
                'datumBis': b,
                'status': 'Aktiv'
            })
            
    # 3. Rounds for Unteres Playoff 2024/2025 (5 rounds)
    r_dates_unteres = {
        1: ("25.04.2025", "25.04.2025"),
        2: ("30.04.2025", "03.05.2025"),
        3: ("09.05.2025", "09.05.2025"),
        4: ("16.05.2025", "17.05.2025"),
        5: ("23.05.2025", "31.05.2025"),
    }
    for r_nr in range(1, 6):
        if not any(r.get('seasonKey') == '2024/2025_unteres' and r.get('runde') == r_nr for r in rounds_data):
            max_round_id += 1
            v, b = r_dates_unteres.get(r_nr, ("25.04.2025", "31.05.2025"))
            rounds_data.append({
                'id': max_round_id,
                'liga': 'Unteres Playoff',
                'jahr': '2024/2025',
                'seasonKey': '2024/2025_unteres',
                'runde': r_nr,
                'datumVon': v,
                'datumBis': b,
                'status': 'Aktiv'
            })
            
    with open(rounds_path, 'w', encoding='utf-8') as f:
        json.dump(rounds_data, f, ensure_ascii=False, indent=2)
    print("Updated Website/data/rounds.json with 2024/2025 rounds")
    
    # Update Website/data/teams.json
    teams_path = 'Website/data/teams.json'
    teams_data = json.load(open(teams_path, encoding='utf-8'))
    existing_team_names = [t.get('name') for t in teams_data]
    max_team_id = max([t.get('id', 0) for t in teams_data]) if teams_data else 0
    
    all_2024_teams = sorted(list(set(teams_2024 + teams_oberes + teams_unteres)))
    for t_name in all_2024_teams:
        if t_name not in existing_team_names:
            max_team_id += 1
            teams_data.append({
                'id': max_team_id,
                'name': t_name,
                'status': 'Aktiv',
                'league': 'DSG Liga',
                'seasonKey': '2024/2025'
            })
            
    with open(teams_path, 'w', encoding='utf-8') as f:
        json.dump(teams_data, f, ensure_ascii=False, indent=2)
    print(f"Updated Website/data/teams.json (total teams: {len(teams_data)})")

if __name__ == "__main__":
    main()
