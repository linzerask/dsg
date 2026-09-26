import json

new_cards = [
    # Image 1
    { "name": "Stefan Woschitz", "team": "DSG St. Josef/Oed FC", "yellow": 3, "yellowRed": 0, "red": 0 },
    { "name": "Sasa Nedic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 1, "red": 0, "suspension": "18.10" },
    { "name": "Raphael Deutschmann", "team": "DSG St. Josef/Oed FC", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Philipp Habring", "team": "DSG Union Traun", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Michael Haslehner", "team": "Union Heiligenberg", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Benedict Humer", "team": "Union Heiligenberg", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Matthias Kneidinger", "team": "FC Hinzenbach", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Stanislav Korovljevic", "team": "FC Gornjak", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Andreas Lederer", "team": "Union Heiligenberg", "yellow": 2, "yellowRed": 0, "red": 0 },

    # Image 2
    { "name": "Gerhard Luger", "team": "DSG Union Traun", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Ninoslav Matanovic", "team": "DSG Union Traun", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Christoph Mühlbacher", "team": "Walker FC", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Thomas Paulmair", "team": "DSG St. Josef/Oed FC", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Simon Penninger", "team": "Union Heiligenberg", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Marco Rajcic", "team": "FC Gornjak", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Rene Rechtlehner", "team": "FC Hinzenbach", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Sani Stancic", "team": "FC Gornjak", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Nicolaus Steurer", "team": "DSG St. Josef/Oed FC", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Kevin Tiepelt", "team": "DSG St. Josef/Oed FC", "yellow": 2, "yellowRed": 0, "red": 0 },

    # Image 3
    { "name": "Ernst Zahrer", "team": "Union Heiligenberg", "yellow": 2, "yellowRed": 0, "red": 0 },
    { "name": "Jonas Binder", "team": "DSG St. Josef/Oed FC", "yellow": 0, "yellowRed": 0, "red": 1, "suspension": "4.10" },
    { "name": "Michael Dornetshuber", "team": "Union Eschenau", "yellow": 0, "yellowRed": 0, "red": 1, "suspension": "3.6" },
    { "name": "Dalibor Tatic", "team": "FC Gornjak", "yellow": 0, "yellowRed": 0, "red": 1, "suspension": "25.4" },
    { "name": "Maxwell Agbemor", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Michael Ahammer", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Taher Akbar", "team": "DSG Union Traun", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Farid Alem", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Bernhard Altendorfer", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Stefan Amering", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },

    # Image 4
    { "name": "Florian Berger", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Marco Braumann", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Luka Budes", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Marko Burg", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Gerhard Busch", "team": "DSG Union Traun", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Matteo Deisenhammer", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Darko Dovoda", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Paul Feichtenschlager", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Julian Fischer", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Nik Franzmair", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Stefan Freudenthaler", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },

    # Image 5
    { "name": "Fabio Froschauer", "team": "DSG St. Josef/Oed FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Alexander Gfellner", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Leonardo Glavas", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Max Grund", "team": "Walker FC", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Andreas Humer", "team": "Union Eschenau", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Nemanja Ilic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Dejan Jurleta", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Michael Kaimberger", "team": "FC Hinzenbach", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Edi Klaric-Jozic", "team": "SV Croatia Linz", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Aleksandar Kostic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Nebojsa Krstic", "team": "FC Gornjak", "yellow": 1, "yellowRed": 0, "red": 0 },
    { "name": "Florian Lehner", "team": "Union Heiligenberg", "yellow": 1, "yellowRed": 0, "red": 0 }
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
