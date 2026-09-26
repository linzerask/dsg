import json

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fix Jonas Binder, Michael Dornetshuber, Dalibor Tatic
for player in data['stats']['cards']:
    if player['name'] in ['Jonas Binder', 'Michael Dornetshuber', 'Dalibor Tatic']:
        player['red'] = 0
        player['yellowRed'] = 1

with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Fixed card types for players.")
