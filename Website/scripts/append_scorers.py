import json

new_scorers = [
    {"rank": 55, "name": "Daniel Dornetshuber", "team": "Union Eschenau", "goals": 1},
    {"rank": 55, "name": "Simon Dornetshumer", "team": "Union Heiligenberg", "goals": 1},
    {"rank": 55, "name": "Michael Dullinger", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Thomas Ferihumer", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Bernhard Glatz", "team": "Walker FC", "goals": 1},
    {"rank": 55, "name": "Kevin Grabmair", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Paul Haindl", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Jürgen Hutsteiner", "team": "Union Heiligenberg", "goals": 1},
    {"rank": 55, "name": "Markus Jungreithmayr", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Ramadan Karakaya", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Edi Klaric-Jozic", "team": "SV Croatia Linz", "goals": 1},
    {"rank": 55, "name": "Aleksandar Kostic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Andreas Lederer", "team": "Union Heiligenberg", "goals": 1},
    {"rank": 55, "name": "Janik Machowetz", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Gregor Mair", "team": "Union Heiligenberg", "goals": 1},
    {"rank": 55, "name": "Darko Maletic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Anto Marcinkovic", "team": "SV Croatia Linz", "goals": 1},
    {"rank": 55, "name": "Ninoslav Matanovic", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Rainer Meindlhumer", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Mladen Nikolic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Michael Pehamberger", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Mario Peric", "team": "SV Croatia Linz", "goals": 1},
    {"rank": 55, "name": "Ivan Peric", "team": "SV Croatia Linz", "goals": 1},
    {"rank": 55, "name": "Denis Petak", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Tobias Pointner", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Moritz Radschiener", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Rene Rechtlehner", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Niko Reinthaler", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Manuel Stadler", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Nicolaus Steurer", "team": "DSG St. Josef/Oed FC", "goals": 1},
    {"rank": 55, "name": "Dalibor Tatic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Dejan Teodorovic", "team": "FC Gornjak", "goals": 1},
    {"rank": 55, "name": "Felix Trinkfass", "team": "Union Heiligenberg", "goals": 1},
    {"rank": 55, "name": "Felix Übleis", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Lukas Wahl", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Fabian Walter", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Andreas Walter-Raab", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Stefan Wiener", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Fabian Wild", "team": "DSG Union Traun", "goals": 1},
    {"rank": 55, "name": "Manuel Winklehner", "team": "FC Hinzenbach", "goals": 1},
    {"rank": 55, "name": "Manuel Wozabal", "team": "Walker FC", "goals": 1}
]

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

# Keep the first 60 just in case and append the new ones
liga['stats']['topScorers'] = liga['stats']['topScorers'][:60] + new_scorers

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
