import json

new_cards = [
    # Image 1
    { "name": "Marko Ljubisavljevic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Gregor Mair", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Danijel Majer", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Djordje Malesevic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Anto Marcinkovic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Branko Marin", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Manuel Märzinger", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Robert Matisic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Michael Mayr", "team": "DSG Union Traun", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Roland Meindlhumer", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Ivan Nikolov", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },

    # Image 2
    { "name": "Ivan Peric", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Josip Peric", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Dominik Pfannhauser", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Shankar Poudel", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Manuel Pühringer", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Ivan Radisavljevic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Moritz Radschiener", "team": "DSG Union Traun", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Anmol Rai", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Christopher Ratzenböck", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Florian Rebhandl", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Simon Rittberger", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Rudolf Rossgatterer", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },

    # Image 3
    { "name": "Clemens Rössler", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Dominik Scheuringer", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Jan Schützeneder", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Mateo Simunovic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Alex Steiner", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Paul Steininger", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Slaven Steko", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Benjamin Stenhaug", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Valentin Vejic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },

    # Image 4
    { "name": "Igor Vidovic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Jakob Wagner", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Thomas Wagner", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Manuel Zauner-Wagner", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Berislav Zuljevic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 }
]

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'cards' not in data['stats']:
    data['stats']['cards'] = []

# Deduplicate based on name
existing_names = set(c['name'] for c in data['stats']['cards'])

for player in new_cards:
    if player['name'] not in existing_names:
        data['stats']['cards'].append(player)
        existing_names.add(player['name'])

with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Total cards now: {len(data['stats']['cards'])}")
