import json

scorers_data = [
    {"rank": 1, "name": "Roland Meindlhumer", "team": "FC Linzenbach", "goals": 20},
    {"rank": 2, "name": "Thomas Paulmair", "team": "DSG St. Josef/Oed FC", "goals": 14},
    {"rank": 3, "name": "Leonardo Glavas", "team": "SV Croatia Linz", "goals": 13},
    {"rank": 3, "name": "Michael Haslehner", "team": "Union Heiligenberg", "goals": 13},
    {"rank": 5, "name": "Dominik Penninger", "team": "Union Heiligenberg", "goals": 10},
    {"rank": 6, "name": "Max Grund", "team": "Walker FC", "goals": 9},
    {"rank": 6, "name": "Jan Lettner", "team": "FC Linzenbach", "goals": 9},
    {"rank": 8, "name": "Branko Marin", "team": "SV Croatia Linz", "goals": 8},
    {"rank": 8, "name": "Florian Rebhandl", "team": "Walker FC", "goals": 8},
    {"rank": 8, "name": "Valentin Vejic", "team": "SV Croatia Linz", "goals": 8},
    {"rank": 11, "name": "Farid Alem", "team": "Union Eschenau", "goals": 6},
    {"rank": 11, "name": "Michael Dornetshuber", "team": "Union Eschenau", "goals": 6},
    {"rank": 11, "name": "Slaven Steko", "team": "SV Croatia Linz", "goals": 6}
]

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

if 'stats' not in liga:
    liga['stats'] = {}

liga['stats']['topScorers'] = scorers_data

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
