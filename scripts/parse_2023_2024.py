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

def extract_matches_from_part(part, default_round_name, season_key="2023/2024", league_name="DSG Liga"):
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
        cards = []
        events = []
        
        # Parse details table for scorers and cards
        # Split details by td colspan="2"
        detail_tds = re.findall(r'<td colspan="2"[^>]*>([\s\S]*?)</td>', details, flags=re.IGNORECASE)
        for side_idx, side_html in enumerate(detail_tds):
            team_name = home if side_idx == 0 else away
            lines = re.split(r'<br\s*/?>|\n', side_html, flags=re.IGNORECASE)
            for line in lines:
                p_name = clean_html(line)
                if not p_name: continue
                
                tor_count = len(re.findall(r'tor\.(?:gif|png|jpg)', line, re.IGNORECASE))
                gelb_count = len(re.findall(r'gelb\.png', line, re.IGNORECASE))
                gelbrot_count = len(re.findall(r'gelb-?rot\.(?:jpg|png)', line, re.IGNORECASE))
                rot_count = len(re.findall(r'rot\.png', line, re.IGNORECASE))
                
                for _ in range(tor_count):
                    scorers.append({'name': p_name, 'player': p_name, 'team': team_name, 'type': 'goal'})
                    events.append({'type': 'goal', 'name': p_name, 'player': p_name, 'team': team_name})
                for _ in range(gelb_count):
                    cards.append({'name': p_name, 'player': p_name, 'team': team_name, 'type': 'yellow'})
                    events.append({'type': 'yellow', 'name': p_name, 'player': p_name, 'team': team_name})
                for _ in range(gelbrot_count):
                    cards.append({'name': p_name, 'player': p_name, 'team': team_name, 'type': 'yellowRed'})
                    events.append({'type': 'yellowRed', 'name': p_name, 'player': p_name, 'team': team_name})
                for _ in range(rot_count):
                    cards.append({'name': p_name, 'player': p_name, 'team': team_name, 'type': 'red'})
                    events.append({'type': 'red', 'name': p_name, 'player': p_name, 'team': team_name})
                
        matches.append({
            'id': len(matches) + 1,
            'date': date_str,
            'time': time_str,
            'weekday': weekday,
            'location': location,
            'venue': location,
            'home': home,
            'away': away,
            'score': score,
            'round': default_round_name,
            'seasonKey': season_key,
            'league': league_name,
            'status': status,
            'referee': referee,
            'scorers': scorers,
            'cards': cards,
            'events': events,
            'yellow': len([c for c in cards if c['type'] == 'yellow']),
            'red': len([c for c in cards if c['type'] == 'red']),
            'yellowRed': len([c for c in cards if c['type'] == 'yellowRed'])
        })
        
    return matches

def main():
    print("=== EXTRACTING COMPLETE 2023/2024 SEASON ===")
    
    with open('scraper/raw_berichte_3.json', 'r', encoding='utf-8') as f:
        d3 = json.load(f)
    with open('scraper/raw_berichte_5.json', 'r', encoding='utf-8') as f:
        d5 = json.load(f)

    parts_3 = re.split(r'<tr class="green-col"[^>]*>', d3['html'], flags=re.IGNORECASE)
    parts_5 = re.split(r'<tr class="green-col"[^>]*>', d5['html'], flags=re.IGNORECASE)

    all_matches = []
    all_rounds = []
    all_teams = set()

    # In raw_berichte_3: parts 1 to 15 have 2023 matches
    # Part 1 -> 1. Runde (01.09 - 26.10.2023)
    # Part 3 -> 2. Runde (26.08 - 09.09.2023)
    # Part 5 -> 3. Runde (15.09 - 16.09.2023)
    # Part 7 -> 4. Runde (20.09 - 23.09.2023)
    # Part 9 -> 5. Runde (30.09.2023)
    # Part 11 -> 6. Runde (06.10 - 07.10.2023)
    # Part 13 -> 7. Runde (14.10.2023)
    # Part 15 -> 8. Runde (20.10 - 26.10.2023)
    # Part 21 -> 9. Runde (18.10 - 28.10.2023)

    herbst_map = [
        (1, "1. Runde", "01.09.2023", "26.10.2023"),
        (3, "2. Runde", "26.08.2023", "09.09.2023"),
        (5, "3. Runde", "15.09.2023", "16.09.2023"),
        (7, "4. Runde", "20.09.2023", "23.09.2023"),
        (9, "5. Runde", "30.09.2023", "30.09.2023"),
        (11, "6. Runde", "06.10.2023", "07.10.2023"),
        (13, "7. Runde", "14.10.2023", "14.10.2023"),
        (15, "8. Runde", "20.10.2023", "26.10.2023"),
        (21, "9. Runde", "18.10.2023", "28.10.2023")
    ]

    for p_idx, r_name, d_von, d_bis in herbst_map:
        r_num = int(r_name.split('.')[0])
        matches = extract_matches_from_part(parts_3[p_idx], r_name, "2023/2024", "DSG Liga")
        all_matches.extend(matches)
        for m in matches:
            all_teams.add(m['home'])
            all_teams.add(m['away'])
        all_rounds.append({
            'id': r_num + 100,
            'saison': "DSG Liga",
            'jahr': "2023/2024",
            'runde': str(r_num),
            'datum': f"{r_name} ({d_von} - {d_bis})",
            'datumVon': d_von,
            'datumBis': d_bis,
            'liga': "DSG Liga",
            'seasonKey': "2023/2024",
            'status': "Inaktiv"
        })

    # Frühjahr 2024 (Rounds 10 to 18 from raw_berichte_5)
    fruehjahr_map = [
        (1, "10. Runde", "06.04.2024", "06.04.2024"),
        (3, "11. Runde", "13.04.2024", "13.04.2024"),
        (5, "12. Runde", "20.04.2024", "20.04.2024"),
        (7, "13. Runde", "27.04.2024", "27.04.2024"),
        (9, "14. Runde", "04.05.2024", "05.05.2024"),
        (11, "15. Runde", "08.05.2024", "11.05.2024"),
        (13, "16. Runde", "15.05.2024", "18.05.2024"),
        (15, "17. Runde", "25.05.2024", "29.05.2024"),
        (17, "18. Runde", "31.05.2024", "01.06.2024")
    ]

    for p_idx, r_name, d_von, d_bis in fruehjahr_map:
        r_num = int(r_name.split('.')[0])
        matches = extract_matches_from_part(parts_5[p_idx], r_name, "2023/2024", "DSG Liga")
        all_matches.extend(matches)
        for m in matches:
            all_teams.add(m['home'])
            all_teams.add(m['away'])
        all_rounds.append({
            'id': r_num + 100,
            'saison': "DSG Liga",
            'jahr': "2023/2024",
            'runde': str(r_num),
            'datum': f"{r_name} ({d_von} - {d_bis})",
            'datumVon': d_von,
            'datumBis': d_bis,
            'liga': "DSG Liga",
            'seasonKey': "2023/2024",
            'status': "Inaktiv"
        })

    # Assign sequential IDs to matches
    for idx, m in enumerate(all_matches):
        m['id'] = 2000 + idx + 1

    print(f"Total Matches Extracted: {len(all_matches)}")
    print(f"Total Rounds: {len(all_rounds)}")
    print(f"Total Teams ({len(all_teams)}): {sorted(list(all_teams))}")

    # Calculate Standings
    stats = {}
    for t in all_teams:
        stats[t] = {'name': t, 'played': 0, 'won': 0, 'draw': 0, 'lost': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'goalDiff': 0, 'points': 0}

    total_goals = 0
    total_played = 0

    for m in all_matches:
        h = m['home']
        a = m['away']
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
                
                total_goals += (gh + ga)
                total_played += 1
                
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

    print(f"\nTotal Goals Scored: {total_goals} across {total_played} played matches (Ø {total_goals/total_played:.2f} goals/game)")
    print("\n--- FINAL STANDINGS TABLE 2023/2024 ---")
    for t in table:
        print(f"#{t['rank']} {t['name']:<30} | Pld: {t['played']:>2} | W: {t['won']:>2} D: {t['draw']:>2} L: {t['lost']:>2} | Goals: {t['goalsFor']:>3}:{t['goalsAgainst']:>3} ({t['goalDiff']:>+3}) | Pts: {t['points']:>2}")

if __name__ == '__main__':
    main()
