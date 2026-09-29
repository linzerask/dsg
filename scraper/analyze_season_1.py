import json
import re
from bs4 import BeautifulSoup
from collections import defaultdict

def fix_umlauts(text):
    if not text:
        return ""
    # Common replacements for corrupted byte characters
    replacements = {
        'Schleiheim': 'Schleißheim',
        'Goldwrth': 'Goldwörth',
        'Wrth': 'Wörth',
        'Jrg': 'Jörg',
        'Frstl': 'Fröstl',
        'Phrer': 'Pöhrer',
        'Cmlek': 'Cömlek',
        'Rssler': 'Rössler',
        'Frnschu': 'Fürnschuß',
        'Krbler': 'Körbler',
        'Hllinger': 'Höllinger',
        'Grobck': 'Großböck',
        'Mrzinger': 'Märzinger',
        'Klausmller': 'Klausmüller',
        '': ''
    }
    res = text
    for k, v in replacements.items():
        res = res.replace(k, v)
    return res

def analyze():
    with open('scraper/raw_berichte_1.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open('Website/data/teams.json', 'r', encoding='utf-8') as f:
        teams_master = json.load(f)
    team_names = [t['Name'] for t in teams_master]

    with open('Website/data/players.json', 'r', encoding='utf-8') as f:
        players_master = json.load(f)
    player_names = [f"{p.get('Vorname', '')} {p.get('Nachname', '')}".strip() for p in players_master]
    
    html = data['html']
    soup = BeautifulSoup(html, 'html.parser')
    
    table = soup.find('table')
    if not table:
        print("No table found!")
        return

    rows = table.find_all('tr')
    
    rounds = []
    current_round = None
    
    scorers_total = defaultdict(int)
    player_team_map = {}
    cards_yellow = defaultdict(int)
    cards_yellow_red = defaultdict(int)
    cards_red = defaultdict(int)
    
    matches_list = []
    team_stats = defaultdict(lambda: {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0})
    
    i = 0
    while i < len(rows):
        tr = rows[i]
        
        # Round Header
        if 'green-col' in tr.get('class', []) or tr.find('th'):
            th = tr.find('th')
            if th:
                round_raw = th.get_text(" ", strip=True)
                # Clean multiple spaces and linebreaks
                round_clean = re.sub(r'\s+', ' ', round_raw).strip()
                current_round = {
                    'name': round_clean,
                    'matches': []
                }
                rounds.append(current_round)
            i += 1
            continue
            
        # Match row
        if 'clicker' in tr.get('class', []):
            tds = tr.find_all('td')
            if len(tds) >= 5:
                date_str = tds[0].get_text(strip=True)
                raw_home = tds[1].get_text(strip=True)
                raw_away = tds[3].get_text(strip=True)
                score_raw = tds[4].get_text(strip=True)
                
                home_team = fix_umlauts(raw_home)
                away_team = fix_umlauts(raw_away)
                
                details_tr = rows[i+1] if i + 1 < len(rows) and rows[i+1].get('id', '').startswith('details_') else None
                
                venue_time = ""
                home_events_html = ""
                away_events_html = ""
                
                if details_tr:
                    det_tds = details_tr.find_all('td')
                    if len(det_tds) >= 1:
                        venue_raw = det_tds[0].get_text(" ", strip=True)
                        venue_time = fix_umlauts(re.sub(r'\s+', ' ', venue_raw).strip())
                    if len(det_tds) >= 2:
                        home_events_html = str(det_tds[1])
                    if len(det_tds) >= 3:
                        away_events_html = str(det_tds[2])
                    i += 1
                
                # Parse score
                score_match = re.search(r'(\d+)\s*:\s*(\d+)(?:\s*\((.*?)\))?', score_raw)
                home_goals = int(score_match.group(1)) if score_match else None
                away_goals = int(score_match.group(2)) if score_match else None
                halftime = score_match.group(3) if score_match and score_match.group(3) else ""
                
                is_unplayed = (home_goals is None or away_goals is None)
                
                # Parse events
                def parse_team_events(html_str, team_name):
                    scorers = []
                    yellows = []
                    yellow_reds = []
                    reds = []
                    
                    if not html_str:
                        return scorers, yellows, yellow_reds, reds
                    
                    lines = re.split(r'<br\s*/?>', html_str, flags=re.IGNORECASE)
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                        
                        # Count balls (tor.gif, tor.png, tor.jpg)
                        tor_count = len(re.findall(r'tor\.(?:gif|png|jpg)', line, re.IGNORECASE))
                        has_gelb = bool(re.search(r'gelb\.(?:png|gif|jpg)', line, re.IGNORECASE))
                        has_gelbrot = bool(re.search(r'gelbrot\.(?:jpg|png|gif)', line, re.IGNORECASE))
                        has_rot = bool(re.search(r'rot\.(?:png|gif|jpg)', line, re.IGNORECASE))
                        
                        raw_player_name = re.sub(r'<[^>]+>', '', line).strip()
                        raw_player_name = re.sub(r'\s+', ' ', raw_player_name)
                        
                        if raw_player_name:
                            player_name = fix_umlauts(raw_player_name)
                            if tor_count > 0:
                                scorers.append({'player': player_name, 'goals': tor_count})
                                scorers_total[player_name] += tor_count
                                player_team_map[player_name] = team_name
                            
                            if has_gelb:
                                yellows.append(player_name)
                                cards_yellow[player_name] += 1
                            if has_gelbrot:
                                yellow_reds.append(player_name)
                                cards_yellow_red[player_name] += 1
                            if has_rot:
                                reds.append(player_name)
                                cards_red[player_name] += 1
                                
                    return scorers, yellows, yellow_reds, reds

                home_scorers, home_yellows, home_yr, home_reds = parse_team_events(home_events_html, home_team)
                away_scorers, away_yellows, away_yr, away_reds = parse_team_events(away_events_html, away_team)
                
                home_scorer_sum = sum(s['goals'] for s in home_scorers)
                away_scorer_sum = sum(s['goals'] for s in away_scorers)
                
                status = "Ausstehend" if is_unplayed else "Beendet"
                if score_raw.strip() == "3:0 (:)":
                    status = "Abgesagt 3:0"
                elif score_raw.strip() == "0:3 (:)":
                    status = "Abgesagt 0:3"
                
                match_data = {
                    'date': date_str,
                    'venue_time': venue_time,
                    'home_team': home_team,
                    'away_team': away_team,
                    'score': score_raw,
                    'home_goals': home_goals,
                    'away_goals': away_goals,
                    'halftime': halftime,
                    'status': status,
                    'home_scorers': home_scorers,
                    'away_scorers': away_scorers,
                    'home_yellows': home_yellows,
                    'away_yellows': away_yellows,
                    'home_yellow_reds': home_yr,
                    'away_yellow_reds': away_yr,
                    'home_reds': home_reds,
                    'away_reds': away_reds,
                    'home_scorer_sum': home_scorer_sum,
                    'away_scorer_sum': away_scorer_sum
                }
                
                if current_round:
                    current_round['matches'].append(match_data)
                matches_list.append(match_data)
                
                # Table calculation for finished matches
                if not is_unplayed:
                    h_stat = team_stats[home_team]
                    a_stat = team_stats[away_team]
                    
                    h_stat['p'] += 1
                    a_stat['p'] += 1
                    h_stat['gf'] += home_goals
                    h_stat['ga'] += away_goals
                    a_stat['gf'] += away_goals
                    a_stat['ga'] += home_goals
                    
                    if home_goals > away_goals:
                        h_stat['w'] += 1
                        h_stat['pts'] += 3
                        a_stat['l'] += 1
                    elif home_goals < away_goals:
                        a_stat['w'] += 1
                        a_stat['pts'] += 3
                        h_stat['l'] += 1
                    else:
                        h_stat['d'] += 1
                        h_stat['pts'] += 1
                        a_stat['d'] += 1
                        a_stat['pts'] += 1

        i += 1

    print("=== SEASON 2022/2023 (HERBST) PARSED ANALYSIS ===")
    print(f"Total Rounds: {len(rounds)}")
    print(f"Total Matches: {len(matches_list)} (Finished: {len([m for m in matches_list if m['status'] != 'Ausstehend'])}, Unplayed: {len([m for m in matches_list if m['status'] == 'Ausstehend'])})")
    print(f"Total Goals: {sum(m['home_goals'] + m['away_goals'] for m in matches_list if m['home_goals'] is not None)}")
    print(f"Total Yellow Cards: {sum(cards_yellow.values())}")
    print(f"Total Yellow-Red Cards: {sum(cards_yellow_red.values())}")
    print(f"Total Red Cards: {sum(cards_red.values())}")

    parsed_output = {
        'season': '2022/2023 Herbst',
        'total_rounds': len(rounds),
        'total_matches': len(matches_list),
        'total_goals': sum(m['home_goals'] + m['away_goals'] for m in matches_list if m['home_goals'] is not None),
        'rounds': rounds,
        'standings': [
            {'rank': idx, 'team': team, **st, 'diff': st['gf'] - st['ga']}
            for idx, (team, st) in enumerate(sorted(team_stats.items(), key=lambda x: (x[1]['pts'], x[1]['gf'] - x[1]['ga'], x[1]['gf']), reverse=True), 1)
        ],
        'top_scorers': [
            {'rank': idx, 'player': player, 'team': player_team_map.get(player, ''), 'goals': goals}
            for idx, (player, goals) in enumerate(sorted(scorers_total.items(), key=lambda x: x[1], reverse=True), 1)
        ],
        'cards': {
            'yellow': [{'player': p, 'count': c} for p, c in sorted(cards_yellow.items(), key=lambda x: x[1], reverse=True)],
            'yellow_red': [{'player': p, 'count': c} for p, c in sorted(cards_yellow_red.items(), key=lambda x: x[1], reverse=True)],
            'red': [{'player': p, 'count': c} for p, c in sorted(cards_red.items(), key=lambda x: x[1], reverse=True)]
        }
    }
    
    with open('scraper/parsed_season_2022.json', 'w', encoding='utf-8') as f:
        json.dump(parsed_output, f, ensure_ascii=False, indent=2)
    print("Exported clean JSON to scraper/parsed_season_2022.json")

if __name__ == '__main__':
    analyze()
