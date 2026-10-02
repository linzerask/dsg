import json
import os
import re
from parse_2025_2026 import parse_berichte_13

def ingest():
    print("Ingesting Season 2025/2026 with full events...")
    
    matches = parse_berichte_13()
    
    # 2. Load existing liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga = json.load(f)
        
    team_names = [
        "SV Croatia Linz",
        "DSG St. Josef/Oed FC",
        "Union Heiligenberg",
        "FC Hinzenbach",
        "Walker FC",
        "FC Gornjak",
        "DSG Union Traun",
        "Union Eschenau"
    ]
    
    team_stats = {name: {
        "name": name,
        "played": 0,
        "won": 0,
        "drawn": 0,
        "lost": 0,
        "gf": 0,
        "ga": 0,
        "goalDiff": 0,
        "diff": 0,
        "points": 0
    } for name in team_names}
    
    scorers_map = {}
    cards_map = {}
    
    for m in matches:
        ht = m["home"]
        at = m["away"]
        score_str = m["score"]
        status = m.get("status", "Gespielt")
        
        sh = None
        sa = None
        if score_str and ':' in score_str and score_str != '-:-':
            p = score_str.split(':')
            sh_str = re.sub(r'\D', '', p[0])
            sa_str = re.sub(r'\D', '', p[1])
            if sh_str and sa_str:
                sh = int(sh_str)
                sa = int(sa_str)
            
        if sh is not None and sa is not None and ht in team_stats and at in team_stats:
            team_stats[ht]["played"] += 1
            team_stats[at]["played"] += 1
            team_stats[ht]["gf"] += sh
            team_stats[ht]["ga"] += sa
            team_stats[at]["gf"] += sa
            team_stats[at]["ga"] += sh
            
            if sh > sa:
                team_stats[ht]["won"] += 1
                team_stats[ht]["points"] += 3
                team_stats[at]["lost"] += 1
            elif sh < sa:
                team_stats[at]["won"] += 1
                team_stats[at]["points"] += 3
                team_stats[ht]["lost"] += 1
            else:
                team_stats[ht]["drawn"] += 1
                team_stats[ht]["points"] += 1
                team_stats[at]["drawn"] += 1
                team_stats[at]["points"] += 1
                
        # Aggregate scorers from events
        for ev in m.get("events", []):
            if ev.get("type") == "goal":
                p = ev.get("player", "").strip()
                t = ev.get("team", "").strip() or ht
                cnt = int(ev.get("count", 1))
                if p:
                    key = (p, t)
                    scorers_map[key] = scorers_map.get(key, 0) + cnt
            elif ev.get("type") in ["yellow", "red", "yellowRed"]:
                p = ev.get("player", "").strip()
                t = ev.get("team", "").strip() or ht
                ctype = ev.get("type")
                if p:
                    key = (p, t)
                    if key not in cards_map:
                        cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                    if ctype == "yellow":
                        cards_map[key]["yellow"] += 1
                    elif ctype == "yellowRed":
                        cards_map[key]["yellowRed"] += 1
                    elif ctype == "red":
                        cards_map[key]["red"] += 1

    # Format teams array
    teams_list = []
    for t in team_stats.values():
        t["goalDiff"] = t["gf"] - t["ga"]
        t["diff"] = t["goalDiff"]
        teams_list.append(t)
        
    teams_list.sort(key=lambda x: (x["points"], x["goalDiff"], x["gf"]), reverse=True)
    for i, t in enumerate(teams_list):
        t["rank"] = i + 1

    # Format top scorers
    top_scorers_list = []
    for (player, team), goals in scorers_map.items():
        top_scorers_list.append({
            "player": player,
            "team": team,
            "goals": goals
        })
    top_scorers_list.sort(key=lambda x: x["goals"], reverse=True)
    for i, s in enumerate(top_scorers_list):
        s["rank"] = i + 1

    # Format cards
    cards_list = list(cards_map.values())
    cards_list.sort(key=lambda x: (x["red"] * 5 + x["yellowRed"] * 3 + x["yellow"]), reverse=True)

    # Put season into liga.json
    liga["seasons"]["2025/2026"] = {
        "teams": teams_list,
        "matches": matches,
        "stats": {
            "topScorers": top_scorers_list,
            "cards": cards_list
        }
    }
    
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga, f, ensure_ascii=False, indent=2)
    print("Saved Website/data/liga.json with 2025/2026")

    # 3. Update leagues.json
    with open('Website/data/leagues.json', 'r', encoding='utf-8') as f:
        leagues = json.load(f)
        
    if not any(l.get('seasonKey') == '2025/2026' for l in leagues):
        next_id = max(l['id'] for l in leagues) + 1
        leagues.append({
            "id": next_id,
            "name": "DSG Liga",
            "year": "2025/2026",
            "seasonKey": "2025/2026",
            "status": "Aktiv",
            "showOnHomepage": True
        })
        with open('Website/data/leagues.json', 'w', encoding='utf-8') as f:
            json.dump(leagues, f, ensure_ascii=False, indent=2)
        print("Updated Website/data/leagues.json with 2025/2026")

    # 4. Update rounds.json
    with open('Website/data/rounds.json', 'r', encoding='utf-8') as f:
        rounds = json.load(f)
        
    rounds_map = {}
    for m in matches:
        r_str = m['round']
        r_num_match = re.search(r'(\d+)', r_str)
        r_num = int(r_num_match.group(1)) if r_num_match else 1
        r_date = m['date']
        if r_num not in rounds_map:
            rounds_map[r_num] = {
                "runde": r_num,
                "name": f"{r_num}. Runde",
                "dates": []
            }
        if r_date:
            rounds_map[r_num]["dates"].append(r_date)
            
    existing_r_keys = set(f"{r.get('seasonKey')}_{r.get('runde')}" for r in rounds)
    next_round_id = max((r.get('id', 0) for r in rounds), default=0) + 1
    
    for r_num in sorted(rounds_map.keys()):
        key = f"2025/2026_{r_num}"
        if key not in existing_r_keys:
            r_info = rounds_map[r_num]
            dates = r_info["dates"]
            d_von_fmt = dates[0] if dates else ""
            d_bis_fmt = dates[-1] if dates else ""
                
            rounds.append({
                "id": next_round_id,
                "runde": str(r_num),
                "name": f"{r_num}. Runde",
                "liga": "DSG Liga",
                "jahr": "2025/2026",
                "seasonKey": "2025/2026",
                "datumVon": d_von_fmt,
                "datumBis": d_bis_fmt,
                "status": "Aktiv"
            })
            next_round_id += 1
            
    with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
        json.dump(rounds, f, ensure_ascii=False, indent=2)
    print("Updated Website/data/rounds.json")

    print("Ingestion complete!")

if __name__ == '__main__':
    ingest()
