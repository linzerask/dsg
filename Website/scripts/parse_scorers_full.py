import json

scorers_data = [
    {"rank": 1, "name": "Roland Meindlhumer", "team": "FC Hinzenbach", "goals": 20},
    {"rank": 2, "name": "Thomas Paulmair", "team": "DSG St. Josef/Oed FC", "goals": 14},
    {"rank": 3, "name": "Leonardo Glavas", "team": "SV Croatia Linz", "goals": 13},
    {"rank": 3, "name": "Michael Haslehner", "team": "Union Heiligenberg", "goals": 13},
    {"rank": 5, "name": "Dominik Penninger", "team": "Union Heiligenberg", "goals": 10},
    {"rank": 6, "name": "Max Grund", "team": "Walker FC", "goals": 9},
    {"rank": 6, "name": "Jan Lettner", "team": "FC Hinzenbach", "goals": 9},
    {"rank": 8, "name": "Branko Marin", "team": "SV Croatia Linz", "goals": 8},
    {"rank": 8, "name": "Florian Rebhandl", "team": "Walker FC", "goals": 8},
    {"rank": 8, "name": "Valentin Vejic", "team": "SV Croatia Linz", "goals": 8},
    {"rank": 11, "name": "Farid Alem", "team": "Union Eschenau", "goals": 6},
    {"rank": 11, "name": "Michael Dornetshuber", "team": "Union Eschenau", "goals": 6},
    {"rank": 11, "name": "Slaven Steko", "team": "SV Croatia Linz", "goals": 6},
    {"rank": 11, "name": "Sergey Stepanov", "team": "FC Gornjak", "goals": 6},
    {"rank": 11, "name": "Ernst Zahrer", "team": "Union Heiligenberg", "goals": 6},
    {"rank": 16, "name": "Paul Feichtenschlager", "team": "DSG St. Josef/Oed FC", "goals": 5},
    {"rank": 16, "name": "Ilija Stojchovski", "team": "FC Gornjak", "goals": 5},
    {"rank": 18, "name": "Raphael Deutschmann", "team": "DSG St. Josef/Oed FC", "goals": 4},
    {"rank": 18, "name": "Tenzin Jayangtsang", "team": "Walker FC", "goals": 4},
    {"rank": 18, "name": "Markus Kalakovic", "team": "FC Gornjak", "goals": 4},
    {"rank": 18, "name": "Robert Matisic", "team": "SV Croatia Linz", "goals": 4},
    {"rank": 18, "name": "Michael Mayr", "team": "DSG Union Traun", "goals": 4},
    {"rank": 18, "name": "Manuel Milic", "team": "SV Croatia Linz", "goals": 4},
    {"rank": 18, "name": "Josip Peric", "team": "SV Croatia Linz", "goals": 4},
    {"rank": 18, "name": "Marco Rajcic", "team": "FC Gornjak", "goals": 4},
    {"rank": 18, "name": "Johannes Steinbock", "team": "Union Heiligenberg", "goals": 4},
    {"rank": 18, "name": "Simon Wenzl", "team": "Union Eschenau", "goals": 4},
    {"rank": 28, "name": "Maxwell Agbemor", "team": "Walker FC", "goals": 3},
    {"rank": 28, "name": "Julian Fischer", "team": "DSG St. Josef/Oed FC", "goals": 3},
    {"rank": 28, "name": "Manuel Kapfhammer", "team": "DSG Union Traun", "goals": 3},
    {"rank": 28, "name": "Fabian Michael Ott", "team": "FC Hinzenbach", "goals": 3},
    {"rank": 28, "name": "Clemens Rössler", "team": "DSG St. Josef/Oed FC", "goals": 3},
    {"rank": 28, "name": "Dominik Scheuringer", "team": "Union Eschenau", "goals": 3},
    {"rank": 28, "name": "Marco Schmidt", "team": "Walker FC", "goals": 3},
    {"rank": 28, "name": "Benjamin Stenhaug", "team": "Walker FC", "goals": 3},
    {"rank": 28, "name": "Stefan Weichhart", "team": "DSG St. Josef/Oed FC", "goals": 3},
    {"rank": 28, "name": "Manuel Zauner-Wagner", "team": "Union Heiligenberg", "goals": 3},
    {"rank": 38, "name": "Jonas Binder", "team": "DSG St. Josef/Oed FC", "goals": 2},
    {"rank": 38, "name": "Marco Braumann", "team": "Union Eschenau", "goals": 2},
    {"rank": 38, "name": "Stefan Freudenthaler", "team": "DSG St. Josef/Oed FC", "goals": 2},
    {"rank": 38, "name": "Sebastian Grabner", "team": "Union Heiligenberg", "goals": 2},
    {"rank": 38, "name": "Philipp Guggenberger", "team": "FC Hinzenbach", "goals": 2},
    {"rank": 38, "name": "Philipp Habring", "team": "DSG Union Traun", "goals": 2},
    {"rank": 38, "name": "Benedict Humer", "team": "Union Heiligenberg", "goals": 2},
    {"rank": 38, "name": "Sanel Memic", "team": "FC Gornjak", "goals": 2},
    {"rank": 38, "name": "Simon Penninger", "team": "Union Heiligenberg", "goals": 2},
    {"rank": 38, "name": "Shankar Poudel", "team": "Walker FC", "goals": 2},
    {"rank": 38, "name": "Manuel Pühringer", "team": "Union Eschenau", "goals": 2},
    {"rank": 38, "name": "Christopher Ratzenböck", "team": "Union Eschenau", "goals": 2},
    {"rank": 38, "name": "Simon Rittberger", "team": "Union Eschenau", "goals": 2},
    {"rank": 38, "name": "Filip Skoro", "team": "SV Croatia Linz", "goals": 2},
    {"rank": 38, "name": "Sani Stancic", "team": "FC Gornjak", "goals": 2},
    {"rank": 38, "name": "Paul Steininger", "team": "Union Heiligenberg", "goals": 2},
    {"rank": 38, "name": "Luca Vogl", "team": "DSG Union Traun", "goals": 2},
    {"rank": 55, "name": "Michael Ahammer", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Taher Akbar", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Marko Aleksic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Markus Asanger", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Boris Bagaric", "team": "SV Croatia Linz", "goals": 1},
    {"rank": 55, "name": "Luka Budes", "team": "SV Croatia Linz", "goals": 1}
]

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

if 'stats' not in liga:
    liga['stats'] = {}

liga['stats']['topScorers'] = scorers_data

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
