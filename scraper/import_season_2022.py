import json
import re

def build_import_data():
    with open('scraper/parsed_season_2022.json', 'r', encoding='utf-8') as f:
        parsed = json.load(f)

    season_key = "2022/2023"

    # 1. Build Leagues entry
    leagues = [
        {
            "id": 1,
            "name": "DSG Liga",
            "year": "2022/2023",
            "seasonKey": season_key,
            "status": "Aktiv"
        }
    ]

    # 2. Build Rounds entries
    round_dates_ranges = [
        ("24.08.2022", "31.08.2022"),
        ("02.09.2022", "25.10.2022"),
        ("14.09.2022", "06.06.2023"),
        ("23.09.2022", "22.10.2022"),
        ("30.09.2022", "22.10.2022"),
        ("05.10.2022", "08.10.2022"),
        ("14.10.2022", "05.11.2022")
    ]
    rounds = []
    for r_idx in range(1, 8):
        d_from, d_to = round_dates_ranges[r_idx - 1]
        rounds.append({
            "id": r_idx,
            "saison": "DSG Liga",
            "jahr": "2022/2023",
            "runde": str(r_idx),
            "datum": f"{d_from} - {d_to}",
            "datumVon": d_from,
            "datumBis": d_to,
            "liga": "DSG Liga 2022/2023",
            "seasonKey": season_key,
            "status": "Aktiv"
        })

    # 3. Build Matches & Events
    all_matches = []
    match_id = 1

    team_logos = {
        "Union Heiligenberg": "stadion.png",
        "FC U. Schleißheim": "stadion.png",
        "DSG UKJ Froschberg": "stadion.png",
        "DSG St. Josef/Oed FC": "stadion.png",
        "FC Hinzenbach": "stadion.png",
        "SV Croatia Linz": "stadion.png",
        "Union Geboltskirchen": "stadion.png",
        "Union Goldwörth": "stadion.png"
    }

    teams_table = {}
    for team_name in team_logos.keys():
        teams_table[team_name] = {
            "name": team_name,
            "played": 0,
            "won": 0,
            "drawn": 0,
            "lost": 0,
            "goalsFor": 0,
            "goalsAgainst": 0,
            "goalDiff": 0,
            "points": 0,
            "logo": team_logos[team_name]
        }

    for r_idx, round_data in enumerate(parsed['rounds'], 1):
        round_name = f"{r_idx}. Runde"
        for m in round_data['matches']:
            if m['home_goals'] is None or m['away_goals'] is None:
                continue

            home_team = m['home_team']
            away_team = m['away_team']
            score_str = f"{m['home_goals']}:{m['away_goals']}"
            ht_str = m.get('halftime', '')
            if ht_str and ':' in ht_str:
                ht_clean = ht_str.strip()
            else:
                ht_clean = ''

            venue_time = m.get('venue_time', '').strip()
            time_match = re.search(r'(\d{1,2}:\d{2})', venue_time)
            match_time = time_match.group(1) if time_match else '18:00'
            venue_clean = re.sub(r'\d{1,2}:\d{2}', '', venue_time).strip()
            if not venue_clean:
                venue_clean = 'DSG-Platz'

            date_clean = m['date']
            d_m = re.search(r'(\d{1,2}\.\d{1,2}\.\d{2,4})', date_clean)
            formatted_date = d_m.group(1) if d_m else date_clean

            scorers = []
            cards = []
            events = []

            for sc in m.get('home_scorers', []):
                p_name = sc['player']
                count = sc['goals']
                for _ in range(count):
                    scorers.append({"name": p_name, "player": p_name, "team": home_team, "type": "goal"})
                    events.append({"type": "goal", "player": p_name, "name": p_name, "team": home_team})

            for sc in m.get('away_scorers', []):
                p_name = sc['player']
                count = sc['goals']
                for _ in range(count):
                    scorers.append({"name": p_name, "player": p_name, "team": away_team, "type": "goal"})
                    events.append({"type": "goal", "player": p_name, "name": p_name, "team": away_team})

            for p in m.get('home_yellows', []):
                cards.append({"name": p, "player": p, "team": home_team, "type": "yellow"})
                events.append({"type": "yellow", "player": p, "name": p, "team": home_team})
            for p in m.get('home_yellow_reds', []):
                cards.append({"name": p, "player": p, "team": home_team, "type": "yellowRed"})
                events.append({"type": "yellowRed", "player": p, "name": p, "team": home_team})
            for p in m.get('home_reds', []):
                cards.append({"name": p, "player": p, "team": home_team, "type": "red"})
                events.append({"type": "red", "player": p, "name": p, "team": home_team})

            for p in m.get('away_yellows', []):
                cards.append({"name": p, "player": p, "team": away_team, "type": "yellow"})
                events.append({"type": "yellow", "player": p, "name": p, "team": away_team})
            for p in m.get('away_yellow_reds', []):
                cards.append({"name": p, "player": p, "team": away_team, "type": "yellowRed"})
                events.append({"type": "yellowRed", "player": p, "name": p, "team": away_team})
            for p in m.get('away_reds', []):
                cards.append({"name": p, "player": p, "team": away_team, "type": "red"})
                events.append({"type": "red", "player": p, "name": p, "team": away_team})

            status = "Played"
            if m.get('score', '').strip() == "3:0 (:)":
                status = "Abgesagt 3:0"
            elif m.get('score', '').strip() == "0:3 (:)":
                status = "Abgesagt 0:3"

            match_obj = {
                "id": match_id,
                "seasonKey": season_key,
                "round": round_name,
                "roundNr": r_idx,
                "date": formatted_date,
                "time": match_time,
                "home": home_team,
                "away": away_team,
                "score": score_str,
                "ht": ht_clean,
                "status": status,
                "venue": venue_clean,
                "location": venue_clean,
                "note": "Strafverifiziert 3:0" if "Abgesagt" in status else "",
                "scorers": scorers,
                "cards": cards,
                "events": events
            }
            all_matches.append(match_obj)
            match_id += 1

            hg = m['home_goals']
            ag = m['away_goals']
            if home_team in teams_table and away_team in teams_table:
                h_st = teams_table[home_team]
                a_st = teams_table[away_team]

                h_st['played'] += 1
                a_st['played'] += 1
                h_st['goalsFor'] += hg
                h_st['goalsAgainst'] += ag
                h_st['goalDiff'] = h_st['goalsFor'] - h_st['goalsAgainst']

                a_st['goalsFor'] += ag
                a_st['goalsAgainst'] += hg
                a_st['goalDiff'] = a_st['goalsFor'] - a_st['goalsAgainst']

                if hg > ag:
                    h_st['won'] += 1
                    h_st['points'] += 3
                    a_st['lost'] += 1
                elif ag > hg:
                    a_st['won'] += 1
                    a_st['points'] += 3
                    h_st['lost'] += 1
                else:
                    h_st['drawn'] += 1
                    h_st['points'] += 1
                    a_st['drawn'] += 1
                    a_st['points'] += 1

    sorted_teams = sorted(teams_table.values(), key=lambda t: (t['points'], t['goalDiff'], t['goalsFor']), reverse=True)
    for idx, t in enumerate(sorted_teams, 1):
        t['id'] = idx
        t['rank'] = idx

    stats_scorers = [
        {"rank": s["rank"], "name": s["player"], "player": s["player"], "team": s["team"], "goals": s["goals"]}
        for s in parsed["top_scorers"]
    ]
    
    cards_map = {}
    for c in parsed["cards"]["yellow"]:
        p = c["player"]
        cards_map[p] = {"name": p, "player": p, "team": "", "yellow": c["count"], "yellowRed": 0, "red": 0}
    for c in parsed["cards"]["yellow_red"]:
        p = c["player"]
        if p not in cards_map:
            cards_map[p] = {"name": p, "player": p, "team": "", "yellow": 0, "yellowRed": c["count"], "red": 0}
        else:
            cards_map[p]["yellowRed"] = c["count"]
    for c in parsed["cards"]["red"]:
        p = c["player"]
        if p not in cards_map:
            cards_map[p] = {"name": p, "player": p, "team": "", "yellow": 0, "yellowRed": 0, "red": c["count"]}
        else:
            cards_map[p]["red"] = c["count"]

    stats_cards = list(cards_map.values())

    liga_data = {
        "currentSeason": season_key,
        "seasons": {
            season_key: {
                "name": f"DSG Liga {season_key}",
                "year": season_key,
                "teams": sorted_teams,
                "matches": all_matches,
                "stats": {
                    "topScorers": stats_scorers,
                    "cards": stats_cards
                }
            }
        }
    }

    with open('Website/data/leagues.json', 'w', encoding='utf-8') as f:
        json.dump(leagues, f, ensure_ascii=False, indent=2)

    with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
        json.dump(rounds, f, ensure_ascii=False, indent=2)

    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga_data, f, ensure_ascii=False, indent=2)

    print("Import JSON files rebuilt successfully!")

if __name__ == '__main__':
    build_import_data()
