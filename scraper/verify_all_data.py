import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for s_key in ['2022/2023', '2022/2023_1klasse']:
    s = d['seasons'][s_key]
    print(f"\n==================== {s_key} ====================")
    print(f"Total Teams: {len(s['teams'])}")
    print("Standings Table:")
    for t in s['teams']:
        print(f"  {t.get('rank', '-')}. {t['name']:<25} Sp:{t['played']:>2} S:{t['won']:>2} U:{t['drawn']:>2} N:{t['lost']:>2} Tore:{t['goalsFor']:>2}:{t['goalsAgainst']:<2} Diff:{t['goalDiff']:>3} Pkt:{t['points']:>2}")
    
    print(f"\nTotal Matches: {len(s['matches'])}")
    matches_with_events = [m for m in s['matches'] if len(m.get('events', [])) > 0]
    print(f"Matches with structured events (goals/cards): {len(matches_with_events)} / {len(s['matches'])}")
    
    print(f"\nTotal Top Scorers: {len(s['stats']['topScorers'])}")
    print("Top 5 Scorers:")
    for sc in s['stats']['topScorers'][:5]:
        print(f"  {sc.get('rank', '-')}. {sc['name']:<25} ({sc['team']}) - {sc['goals']} Tore")
        
    print(f"\nTotal Carded Players: {len(s['stats']['cards'])}")
    print("Top 5 Carded Players:")
    for cd in s['stats']['cards'][:5]:
        print(f"  {cd.get('rank', '-')}. {cd['name']:<25} ({cd['team']}) - Gelb: {cd['yellow']}, Rot: {cd['red']}, Gelb-Rot: {cd['yellowRed']}")
