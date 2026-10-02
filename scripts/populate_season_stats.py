import json

def populate_stats_in_liga():
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga = json.load(f)
        
    for s_key, s_data in liga['seasons'].items():
        matches = s_data.get('matches', [])
        scorers_map = {}
        cards_map = {}
        
        for m in matches:
            ht = m.get('home', '')
            at = m.get('away', '')
            
            # Events
            for ev in m.get('events', []):
                p = (ev.get('player') or ev.get('name') or '').strip()
                t = (ev.get('team') or ht).strip()
                etype = ev.get('type')
                cnt = int(ev.get('count', 1))
                
                if etype == 'goal' and p:
                    scorers_map[(p, t)] = scorers_map.get((p, t), 0) + cnt
                elif etype in ['yellow', 'gelb'] and p:
                    key = (p, t)
                    if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                    cards_map[key]["yellow"] += cnt
                elif etype in ['yellowRed', 'yellow-red', 'gelb-rot'] and p:
                    key = (p, t)
                    if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                    cards_map[key]["yellowRed"] += cnt
                elif etype in ['red', 'rot'] and p:
                    key = (p, t)
                    if key not in cards_map: cards_map[key] = {"player": p, "team": t, "yellow": 0, "yellowRed": 0, "red": 0}
                    cards_map[key]["red"] += cnt

        # Build list
        top_scorers = []
        for (p, t), g in scorers_map.items():
            top_scorers.append({
                "player": p,
                "team": t,
                "goals": g
            })
        top_scorers.sort(key=lambda x: x['goals'], reverse=True)
        for i, sc in enumerate(top_scorers):
            sc['rank'] = i + 1
            
        cards_list = list(cards_map.values())
        cards_list.sort(key=lambda x: (x['red'] * 5 + x['yellowRed'] * 3 + x['yellow']), reverse=True)
        
        s_data['stats'] = {
            "topScorers": top_scorers,
            "cards": cards_list
        }
        print(f"Season {s_key}: generated {len(top_scorers)} scorers, {len(cards_list)} cards")
        
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga, f, ensure_ascii=False, indent=2)
    print("Saved Website/data/liga.json with full stats!")

if __name__ == '__main__':
    populate_stats_in_liga()
