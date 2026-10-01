import json

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

print("Seasons currently in liga.json:", list(liga.get('seasons', {}).keys()))

for sk, sdata in liga.get('seasons', {}).items():
    matches = sdata.get('matches', [])
    print(f"\n--- Season: {sk} ({len(matches)} matches) ---")
    for m in matches[:5]:
        print(f"  {m.get('date')} | {m.get('home')} vs {m.get('away')} ({m.get('score')}) | Round: {m.get('round')}")

