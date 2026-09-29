import json

with open('scraper/parsed_season_2022.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print("="*80)
print(f"SEASON REPORT: {d['season']}")
print(f"Total Rounds: {d['total_rounds']} | Total Matches: {d['total_matches']} | Total Goals: {d['total_goals']}")
print("="*80)

print("\n--- STANDINGS TABLE ---")
print(f"{'Pl':<3} {'Team':<25} {'Sp':<4} {'S':<4} {'U':<4} {'N':<4} {'Tore':<10} {'Diff':<6} {'Pkt':<4}")
print("-" * 70)
for row in d['standings']:
    diff_str = f"+{row['diff']}" if row['diff'] > 0 else str(row['diff'])
    print(f"{row['rank']:<3} {row['team']:<25} {row['p']:<4} {row['w']:<4} {row['d']:<4} {row['l']:<4} {row['gf']}:{row['ga']:<7} {diff_str:<6} {row['pts']:<4}")

print("\n--- TOP SCORERS (Verified Multi-Goal Balls) ---")
for s in d['top_scorers'][:15]:
    print(f"#{s['rank']:<2} {s['player']:<28} | {s['team']:<22} | {s['goals']} Tore")

print("\n--- ROUND-BY-ROUND MATCH DETAILS ---")
for r in d['rounds']:
    print(f"\n[ {r['name']} ]")
    for m in r['matches']:
        home_s_txt = ', '.join([f"{s['player']} ({s['goals']})" for s in m['home_scorers']]) if m['home_scorers'] else '-'
        away_s_txt = ', '.join([f"{s['player']} ({s['goals']})" for s in m['away_scorers']]) if m['away_scorers'] else '-'
        
        cards_h = []
        if m['home_yellows']: cards_h.append('Gelb: ' + ', '.join(m['home_yellows']))
        if m['home_yellow_reds']: cards_h.append('Gelb-Rot: ' + ', '.join(m['home_yellow_reds']))
        if m['home_reds']: cards_h.append('Rot: ' + ', '.join(m['home_reds']))
        
        cards_a = []
        if m['away_yellows']: cards_a.append('Gelb: ' + ', '.join(m['away_yellows']))
        if m['away_yellow_reds']: cards_a.append('Gelb-Rot: ' + ', '.join(m['away_yellow_reds']))
        if m['away_reds']: cards_a.append('Rot: ' + ', '.join(m['away_reds']))
        
        print(f"  • {m['date']} | {m['home_team']} {m['score']} {m['away_team']} | {m['venue_time']}")
        if m['home_scorers'] or m['away_scorers']:
            print(f"      Torschützen {m['home_team']}: {home_s_txt}")
            print(f"      Torschützen {m['away_team']}: {away_s_txt}")
        if cards_h or cards_a:
            print(f"      Karten: [{m['home_team']}: {'; '.join(cards_h) if cards_h else '-'}] [{m['away_team']}: {'; '.join(cards_a) if cards_a else '-'}]")
