import json

cards_data = [
    { "name": "Vladica Petrovic", "team": "FC Gornjak", "yellow": 5, "yellowRed": 0, "red": 0, "suspension": "11.4, 22.5" },
    { "name": "Daniel Auer", "team": "Union Eschenau", "yellow": 3, "yellowRed": 1, "red": 0, "suspension": "10.4, Saisonende" },
    { "name": "Ramadan Karakaya", "team": "DSG St. Josef/Oed FC", "yellow": 4, "yellowRed": 0, "red": 0, "suspension": "11.4" },
    { "name": "Johannes Steinbock", "team": "Union Heiligenberg", "yellow": 4, "yellowRed": 0, "red": 0, "suspension": "11.4" },
    { "name": "Simon Wenzl", "team": "Union Eschenau", "yellow": 4, "yellowRed": 0, "red": 0, "suspension": "24.4" },
    { "name": "Martin Brenner", "team": "Walker FC", "yellow": 3, "yellowRed": 0, "red": 0, "suspension": "24.4" },
    { "name": "Simon Dornetshumer", "team": "Union Heiligenberg", "yellow": 3, "yellowRed": 0, "red": 0, "suspension": "25.4" },
    { "name": "Manuel Kapfhammer", "team": "DSG Union Traun", "yellow": 3, "yellowRed": 0, "red": 0, "suspension": "29.5" },
    { "name": "Mario Wolfschluckner", "team": "Union Eschenau", "yellow": 3, "yellowRed": 0, "red": 0, "suspension": "3.6" }
]

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

liga['stats']['cards'] = cards_data

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
