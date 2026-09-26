const INITIAL_DATA = {
  news: [
    {
      id: 1,
      title: "SV Croatia Linz sichert sich den Meistertitel der DSG Liga 2025/26",
      date: "2026-06-15",
      author: "Michael Angerbauer",
      excerpt: "SV Croatia Linz beendet die Saison als Tabellenerster und feiert den verdienten Meistertitel."
    },
    {
      id: 2,
      title: "Meisterentscheidung am DSG Platz am 12. Juni 2026",
      date: "2026-06-12",
      author: "Michael Angerbauer",
      excerpt: "Am DSG Platz in Linz fiel am 12. Juni die endgültige Entscheidung über die diesjährige Meisterschaft."
    },
    {
      id: 3,
      title: "Saisonabschluss bei sommerlichen Temperaturen",
      date: "2026-06-08",
      author: "Michael Angerbauer",
      excerpt: "Das entscheidende Meisterschaftsspiel am 8. Juni war von hohen Temperaturen geprägt, beide Teams zeigten vollen Einsatz."
    },
    {
      id: 4,
      title: "Viele Tore und Verschiebungen in der Tabelle in Runde 13",
      date: "2026-06-01",
      author: "Michael Angerbauer",
      excerpt: "In der 13. Runde der DSG Liga fielen zahlreiche Tore, was zu wichtigen Veränderungen in der Gesamttabelle führte."
    }
  ],
  currentSeason: "2026/2027",
  seasons: {
    "2025/2026": {
        "teams": [
                {
                        "id": 1,
                        "name": "SV Croatia Linz",
                        "played": 14,
                        "won": 12,
                        "drawn": 2,
                        "lost": 0,
                        "gf": 63,
                        "ga": 19,
                        "diff": 44,
                        "points": 38
                },
                {
                        "id": 2,
                        "name": "DSG St. Josef/Oed FC",
                        "played": 14,
                        "won": 10,
                        "drawn": 3,
                        "lost": 1,
                        "gf": 49,
                        "ga": 18,
                        "diff": 31,
                        "points": 33
                },
                {
                        "id": 3,
                        "name": "Union Heiligenberg",
                        "played": 14,
                        "won": 7,
                        "drawn": 3,
                        "lost": 4,
                        "gf": 50,
                        "ga": 32,
                        "diff": 18,
                        "points": 24
                },
                {
                        "id": 4,
                        "name": "FC Hinzenbach",
                        "played": 14,
                        "won": 7,
                        "drawn": 2,
                        "lost": 5,
                        "gf": 44,
                        "ga": 35,
                        "diff": 9,
                        "points": 23
                },
                {
                        "id": 5,
                        "name": "Walker FC",
                        "played": 14,
                        "won": 4,
                        "drawn": 3,
                        "lost": 7,
                        "gf": 33,
                        "ga": 44,
                        "diff": -11,
                        "points": 15
                },
                {
                        "id": 6,
                        "name": "FC Gornjak",
                        "played": 14,
                        "won": 4,
                        "drawn": 0,
                        "lost": 10,
                        "gf": 29,
                        "ga": 51,
                        "diff": -22,
                        "points": 12
                },
                {
                        "id": 7,
                        "name": "DSG Union Traun",
                        "played": 14,
                        "won": 2,
                        "drawn": 2,
                        "lost": 10,
                        "gf": 23,
                        "ga": 62,
                        "diff": -39,
                        "points": 8
                },
                {
                        "id": 8,
                        "name": "Union Eschenau",
                        "played": 14,
                        "won": 2,
                        "drawn": 1,
                        "lost": 11,
                        "gf": 29,
                        "ga": 59,
                        "diff": -30,
                        "points": 7
                }
        ],
        "matches": [
                {
                        "id": "2025_2026_1",
                        "round": "1. Runde",
                        "date": "2025-08-29",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "Walker FC",
                        "score": "4:1",
                        "ht": "2:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Kevin Schneider",
                                        "player": "Kevin Schneider",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Kevin Schneider",
                                        "player": "Kevin Schneider",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_2",
                        "round": "1. Runde",
                        "date": "2025-08-29",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "FC Hinzenbach",
                        "score": "3:5",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Taher Akbar",
                                        "player": "Taher Akbar",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luca Vogl",
                                        "player": "Luca Vogl",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Ahammer",
                                        "player": "Michael Ahammer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Guggenberger",
                                        "player": "Philipp Guggenberger",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Matthias Kneidinger",
                                        "player": "Matthias Kneidinger",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Taher Akbar",
                                        "player": "Taher Akbar",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luca Vogl",
                                        "player": "Luca Vogl",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Ahammer",
                                        "player": "Michael Ahammer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Guggenberger",
                                        "player": "Philipp Guggenberger",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Matthias Kneidinger",
                                        "player": "Matthias Kneidinger",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_3",
                        "round": "1. Runde",
                        "date": "2025-08-30",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "SV Croatia Linz",
                        "away": "FC Gornjak",
                        "score": "3:0",
                        "ht": "",
                        "status": "Abgesagt 3:0",
                        "note": "Gornjak abgesagt",
                        "events": [],
                        "scorers": [],
                        "cards": []
                },
                {
                        "id": "2025_2026_4",
                        "round": "1. Runde",
                        "date": "2025-10-24",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "Union Heiligenberg",
                        "score": "4:6",
                        "ht": "2:3",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Rudolf Rossgatterer",
                                        "player": "Rudolf Rossgatterer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellowRed",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Rudolf Rossgatterer",
                                        "player": "Rudolf Rossgatterer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_5",
                        "round": "2. Runde",
                        "date": "2025-09-05",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "FC Hinzenbach",
                        "score": "2:2",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Kaimberger",
                                        "player": "Michael Kaimberger",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Kaimberger",
                                        "player": "Michael Kaimberger",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_6",
                        "round": "2. Runde",
                        "date": "2025-09-05",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "Walker FC",
                        "score": "6:2",
                        "ht": "3:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Andreas Humer",
                                        "player": "Andreas Humer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Christoph Mühlbacher",
                                        "player": "Christoph Mühlbacher",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Andreas Humer",
                                        "player": "Andreas Humer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Pühringer",
                                        "player": "Manuel Pühringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Christoph Mühlbacher",
                                        "player": "Christoph Mühlbacher",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_7",
                        "round": "2. Runde",
                        "date": "2025-09-06",
                        "time": "15:00",
                        "location": "Westbahn Linz",
                        "home": "SV Croatia Linz",
                        "away": "DSG Union Traun",
                        "score": "5:2",
                        "ht": "2:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Anto Marcinkovic",
                                        "player": "Anto Marcinkovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Wiener",
                                        "player": "Stefan Wiener",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Walter",
                                        "player": "Fabian Walter",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Anto Marcinkovic",
                                        "player": "Anto Marcinkovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Wiener",
                                        "player": "Stefan Wiener",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Walter",
                                        "player": "Fabian Walter",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_8",
                        "round": "2. Runde",
                        "date": "2025-10-18",
                        "time": "16:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "Union Heiligenberg",
                        "score": "0:4",
                        "ht": "0:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Djordje Malesevic",
                                        "player": "Djordje Malesevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Djordje Malesevic",
                                        "player": "Djordje Malesevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_9",
                        "round": "3. Runde",
                        "date": "2025-09-12",
                        "time": "17:45",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "Walker FC",
                        "score": "3:3",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Christoph Mühlbacher",
                                        "player": "Christoph Mühlbacher",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Dominik Pfannhauser",
                                        "player": "Dominik Pfannhauser",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Christoph Mühlbacher",
                                        "player": "Christoph Mühlbacher",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Dominik Pfannhauser",
                                        "player": "Dominik Pfannhauser",
                                        "team": "Walker FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_10",
                        "round": "3. Runde",
                        "date": "2025-09-12",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "Union Eschenau",
                        "score": "2:2",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Busch",
                                        "player": "Gerhard Busch",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Alexander Gfellner",
                                        "player": "Alexander Gfellner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Busch",
                                        "player": "Gerhard Busch",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Alexander Gfellner",
                                        "player": "Alexander Gfellner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                }
                        ]
                },
                {
                        "id": "2025_2026_11",
                        "round": "3. Runde",
                        "date": "2025-09-12",
                        "time": "19:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "SV Croatia Linz",
                        "score": "2:2",
                        "ht": "1:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Edi Klaric-Jozic",
                                        "player": "Edi Klaric-Jozic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Alex Steiner",
                                        "player": "Alex Steiner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Edi Klaric-Jozic",
                                        "player": "Edi Klaric-Jozic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Igor Vidovic",
                                        "player": "Igor Vidovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Anto Marcinkovic",
                                        "player": "Anto Marcinkovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Berislav Zuljevic",
                                        "player": "Berislav Zuljevic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Edi Klaric-Jozic",
                                        "player": "Edi Klaric-Jozic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Paul Steininger",
                                        "player": "Paul Steininger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Alex Steiner",
                                        "player": "Alex Steiner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Edi Klaric-Jozic",
                                        "player": "Edi Klaric-Jozic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Igor Vidovic",
                                        "player": "Igor Vidovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Anto Marcinkovic",
                                        "player": "Anto Marcinkovic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Berislav Zuljevic",
                                        "player": "Berislav Zuljevic",
                                        "team": "SV Croatia Linz"
                                }
                        ]
                },
                {
                        "id": "2025_2026_12",
                        "round": "3. Runde",
                        "date": "2025-09-13",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "0:7",
                        "ht": "0:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Danijel Majer",
                                        "player": "Danijel Majer",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Danijel Majer",
                                        "player": "Danijel Majer",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_13",
                        "round": "4. Runde",
                        "date": "2025-09-19",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "FC Gornjak",
                        "score": "2:7",
                        "ht": "1:3",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marko Aleksic",
                                        "player": "Marko Aleksic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nemanja Ilic",
                                        "player": "Nemanja Ilic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Philipp Habring",
                                        "player": "Philipp Habring",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marko Aleksic",
                                        "player": "Marko Aleksic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Nemanja Ilic",
                                        "player": "Nemanja Ilic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_14",
                        "round": "4. Runde",
                        "date": "2025-09-20",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "SV Croatia Linz",
                        "score": "1:5",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_15",
                        "round": "4. Runde",
                        "date": "2025-09-20",
                        "time": "17:00",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "Union Eschenau",
                        "score": "3:0",
                        "ht": "1:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Winklehner",
                                        "player": "Manuel Winklehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Felix Übleis",
                                        "player": "Felix Übleis",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Niko Reinthaler",
                                        "player": "Niko Reinthaler",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Winklehner",
                                        "player": "Manuel Winklehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Felix Übleis",
                                        "player": "Felix Übleis",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Niko Reinthaler",
                                        "player": "Niko Reinthaler",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                }
                        ]
                },
                {
                        "id": "2025_2026_16",
                        "round": "4. Runde",
                        "date": "2025-09-20",
                        "time": "19:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "3:3",
                        "ht": "2:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jürgen Hutsteiner",
                                        "player": "Jürgen Hutsteiner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Jan Schützeneder",
                                        "player": "Jan Schützeneder",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Kevin Tiepelt",
                                        "player": "Kevin Tiepelt",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Fabio Froschauer",
                                        "player": "Fabio Froschauer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jürgen Hutsteiner",
                                        "player": "Jürgen Hutsteiner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Jan Schützeneder",
                                        "player": "Jan Schützeneder",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Kevin Tiepelt",
                                        "player": "Kevin Tiepelt",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Fabio Froschauer",
                                        "player": "Fabio Froschauer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Jonas Binder",
                                        "player": "Jonas Binder",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_17",
                        "round": "5. Runde",
                        "date": "2025-09-02",
                        "time": "17:45",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "FC Gornjak",
                        "score": "4:2",
                        "ht": "3:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_18",
                        "round": "5. Runde",
                        "date": "2025-09-27",
                        "time": "19:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "DSG Union Traun",
                        "score": "8:0",
                        "ht": "4:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sebastian Grabner",
                                        "player": "Sebastian Grabner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sebastian Grabner",
                                        "player": "Sebastian Grabner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Felix Trinkfass",
                                        "player": "Felix Trinkfass",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sebastian Grabner",
                                        "player": "Sebastian Grabner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sebastian Grabner",
                                        "player": "Sebastian Grabner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Felix Trinkfass",
                                        "player": "Felix Trinkfass",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Andreas Lederer",
                                        "player": "Andreas Lederer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                }
                        ]
                },
                {
                        "id": "2025_2026_19",
                        "round": "5. Runde",
                        "date": "2025-10-17",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "0:2",
                        "ht": "0:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Kevin Tiepelt",
                                        "player": "Kevin Tiepelt",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Kevin Tiepelt",
                                        "player": "Kevin Tiepelt",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_20",
                        "round": "5. Runde",
                        "date": "2025-10-25",
                        "time": "16:00",
                        "location": "Westbahn Linz",
                        "home": "SV Croatia Linz",
                        "away": "FC Hinzenbach",
                        "score": "7:4",
                        "ht": "3:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Filip Skoro",
                                        "player": "Filip Skoro",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tobias Pointner",
                                        "player": "Tobias Pointner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Rainer Meindlhumer",
                                        "player": "Rainer Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Jungreithmayr",
                                        "player": "Markus Jungreithmayr",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Berger",
                                        "player": "Florian Berger",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Filip Skoro",
                                        "player": "Filip Skoro",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tobias Pointner",
                                        "player": "Tobias Pointner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Rainer Meindlhumer",
                                        "player": "Rainer Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Jungreithmayr",
                                        "player": "Markus Jungreithmayr",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Berger",
                                        "player": "Florian Berger",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_21",
                        "round": "6. Runde",
                        "date": "2025-10-03",
                        "time": "19:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "FC Hinzenbach",
                        "score": "3:6",
                        "ht": "1:4",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Matthias Kneidinger",
                                        "player": "Matthias Kneidinger",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Matthias Kneidinger",
                                        "player": "Matthias Kneidinger",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_22",
                        "round": "6. Runde",
                        "date": "2025-10-03",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "Walker FC",
                        "score": "0:4",
                        "ht": "0:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Wozabal",
                                        "player": "Manuel Wozabal",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Manuel Wozabal",
                                        "player": "Manuel Wozabal",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Tenzin Jayangtsang",
                                        "player": "Tenzin Jayangtsang",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_23",
                        "round": "6. Runde",
                        "date": "2025-10-04",
                        "time": "14:00",
                        "location": "Westbahn Linz",
                        "home": "SV Croatia Linz",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "2:2",
                        "ht": "2:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ivan Peric",
                                        "player": "Ivan Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Pehamberger",
                                        "player": "Michael Pehamberger",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marko Burg",
                                        "player": "Marko Burg",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Peric",
                                        "player": "Ivan Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ivan Peric",
                                        "player": "Ivan Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Pehamberger",
                                        "player": "Michael Pehamberger",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marko Burg",
                                        "player": "Marko Burg",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Peric",
                                        "player": "Ivan Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_24",
                        "round": "6. Runde",
                        "date": "2025-10-04",
                        "time": "16:30",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "Union Eschenau",
                        "score": "4:3",
                        "ht": "1:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nebojsa Krstic",
                                        "player": "Nebojsa Krstic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sasa Nedic",
                                        "player": "Sasa Nedic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Nikolov",
                                        "player": "Ivan Nikolov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sergey Stepanov",
                                        "player": "Sergey Stepanov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Nebojsa Krstic",
                                        "player": "Nebojsa Krstic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sasa Nedic",
                                        "player": "Sasa Nedic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Nikolov",
                                        "player": "Ivan Nikolov",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                }
                        ]
                },
                {
                        "id": "2025_2026_25",
                        "round": "7. Runde",
                        "date": "2025-10-10",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "SV Croatia Linz",
                        "score": "2:4",
                        "ht": "1:3",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luka Budes",
                                        "player": "Luka Budes",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Filip Skoro",
                                        "player": "Filip Skoro",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Luka Budes",
                                        "player": "Luka Budes",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Marco Braumann",
                                        "player": "Marco Braumann",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luka Budes",
                                        "player": "Luka Budes",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Filip Skoro",
                                        "player": "Filip Skoro",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Luka Budes",
                                        "player": "Luka Budes",
                                        "team": "SV Croatia Linz"
                                }
                        ]
                },
                {
                        "id": "2025_2026_26",
                        "round": "7. Runde",
                        "date": "2025-10-11",
                        "time": "14:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "DSG Union Traun",
                        "score": "2:1",
                        "ht": "0:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Stadler",
                                        "player": "Manuel Stadler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Andreas Walter-Raab",
                                        "player": "Andreas Walter-Raab",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Märzinger",
                                        "player": "Manuel Märzinger",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Luger",
                                        "player": "Gerhard Luger",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Stadler",
                                        "player": "Manuel Stadler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Andreas Walter-Raab",
                                        "player": "Andreas Walter-Raab",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Stefan Freudenthaler",
                                        "player": "Stefan Freudenthaler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Märzinger",
                                        "player": "Manuel Märzinger",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Luger",
                                        "player": "Gerhard Luger",
                                        "team": "DSG Union Traun"
                                }
                        ]
                },
                {
                        "id": "2025_2026_27",
                        "round": "7. Runde",
                        "date": "2025-10-11",
                        "time": "16:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "Union Heiligenberg",
                        "score": "1:3",
                        "ht": "1:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_28",
                        "round": "7. Runde",
                        "date": "2025-10-11",
                        "time": "16:00",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "FC Gornjak",
                        "score": "3:1",
                        "ht": "1:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Mladen Nikolic",
                                        "player": "Mladen Nikolic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Matteo Deisenhammer",
                                        "player": "Matteo Deisenhammer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stanislav Korovljevic",
                                        "player": "Stanislav Korovljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Sasa Nedic",
                                        "player": "Sasa Nedic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Michael Ott",
                                        "player": "Fabian Michael Ott",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Mladen Nikolic",
                                        "player": "Mladen Nikolic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Matteo Deisenhammer",
                                        "player": "Matteo Deisenhammer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stanislav Korovljevic",
                                        "player": "Stanislav Korovljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Sasa Nedic",
                                        "player": "Sasa Nedic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_29",
                        "round": "8. Runde",
                        "date": "2026-04-10",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "DSG Union Traun",
                        "score": "5:3",
                        "ht": "0:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Janik Machowetz",
                                        "player": "Janik Machowetz",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Janik Machowetz",
                                        "player": "Janik Machowetz",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_30",
                        "round": "8. Runde",
                        "date": "2026-04-11",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "FC Gornjak",
                        "score": "3:0",
                        "ht": "",
                        "status": "Abgesagt 3:0",
                        "note": "",
                        "events": [],
                        "scorers": [],
                        "cards": []
                },
                {
                        "id": "2025_2026_31",
                        "round": "8. Runde",
                        "date": "2026-04-11",
                        "time": "16:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "FC Hinzenbach",
                        "score": "2:4",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_32",
                        "round": "8. Runde",
                        "date": "2026-04-11",
                        "time": "17:00",
                        "location": "Westbahn Linz",
                        "home": "SV Croatia Linz",
                        "away": "Union Heiligenberg",
                        "score": "5:2",
                        "ht": "1:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Lehner",
                                        "player": "Florian Lehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Wagner",
                                        "player": "Thomas Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Lehner",
                                        "player": "Florian Lehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Wagner",
                                        "player": "Thomas Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Penninger",
                                        "player": "Simon Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_33",
                        "round": "9. Runde",
                        "date": "2026-04-17",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "SV Croatia Linz",
                        "score": "0:9",
                        "ht": "0:4",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Boris Bagaric",
                                        "player": "Boris Bagaric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Mario Peric",
                                        "player": "Mario Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Josip Peric",
                                        "player": "Josip Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Boris Bagaric",
                                        "player": "Boris Bagaric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Mario Peric",
                                        "player": "Mario Peric",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_34",
                        "round": "9. Runde",
                        "date": "2026-04-18",
                        "time": "16:00",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "1:3",
                        "ht": "1:3",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Raphael Deutschmann",
                                        "player": "Raphael Deutschmann",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Ramadan Karakaya",
                                        "player": "Ramadan Karakaya",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_35",
                        "round": "9. Runde",
                        "date": "2026-04-18",
                        "time": "17:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "Union Eschenau",
                        "score": "4:3",
                        "ht": "2:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Bernhard Glatz",
                                        "player": "Bernhard Glatz",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Daniel Dornetshuber",
                                        "player": "Daniel Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Bernhard Altendorfer",
                                        "player": "Bernhard Altendorfer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Bernhard Glatz",
                                        "player": "Bernhard Glatz",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Scheuringer",
                                        "player": "Dominik Scheuringer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Daniel Dornetshuber",
                                        "player": "Daniel Dornetshuber",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Martin Brenner",
                                        "player": "Martin Brenner",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Bernhard Altendorfer",
                                        "player": "Bernhard Altendorfer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                }
                        ]
                },
                {
                        "id": "2025_2026_36",
                        "round": "9. Runde",
                        "date": "2026-04-18",
                        "time": "18:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "FC Gornjak",
                        "score": "5:1",
                        "ht": "2:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Radisavljevic",
                                        "player": "Ivan Radisavljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Dalibor Tatic",
                                        "player": "Dalibor Tatic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Simon Dornetshumer",
                                        "player": "Simon Dornetshumer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Ivan Radisavljevic",
                                        "player": "Ivan Radisavljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Dalibor Tatic",
                                        "player": "Dalibor Tatic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_37",
                        "round": "10. Runde",
                        "date": "2026-04-24",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "SV Croatia Linz",
                        "away": "Walker FC",
                        "score": "3:0",
                        "ht": "",
                        "status": "Abgesagt 3:0",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_38",
                        "round": "10. Runde",
                        "date": "2026-04-24",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "FC Hinzenbach",
                        "score": "1:6",
                        "ht": "1:4",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Ahammer",
                                        "player": "Michael Ahammer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Jan Lettner",
                                        "player": "Jan Lettner",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Ahammer",
                                        "player": "Michael Ahammer",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_39",
                        "round": "10. Runde",
                        "date": "2026-04-25",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "DSG Union Traun",
                        "score": "1:4",
                        "ht": "0:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Moritz Radschiener",
                                        "player": "Moritz Radschiener",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Lukas Wahl",
                                        "player": "Lukas Wahl",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Asanger",
                                        "player": "Markus Asanger",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Wild",
                                        "player": "Fabian Wild",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Taher Akbar",
                                        "player": "Taher Akbar",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Moritz Radschiener",
                                        "player": "Moritz Radschiener",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Lukas Wahl",
                                        "player": "Lukas Wahl",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Asanger",
                                        "player": "Markus Asanger",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Fabian Wild",
                                        "player": "Fabian Wild",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Marco Rajcic",
                                        "player": "Marco Rajcic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Taher Akbar",
                                        "player": "Taher Akbar",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                }
                        ]
                },
                {
                        "id": "2025_2026_40",
                        "round": "10. Runde",
                        "date": "2026-04-25",
                        "time": "17:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "Union Heiligenberg",
                        "score": "4:0",
                        "ht": "4:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_41",
                        "round": "11. Runde",
                        "date": "2026-05-01",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "DSG Union Traun",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "0:3",
                        "ht": "",
                        "status": "Abgesagt 0:3",
                        "note": "",
                        "events": [],
                        "scorers": [],
                        "cards": []
                },
                {
                        "id": "2025_2026_42",
                        "round": "11. Runde",
                        "date": "2026-05-02",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "FC Hinzenbach",
                        "score": "3:2",
                        "ht": "1:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sanel Memic",
                                        "player": "Sanel Memic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Guggenberger",
                                        "player": "Philipp Guggenberger",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Amering",
                                        "player": "Stefan Amering",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sanel Memic",
                                        "player": "Sanel Memic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Philipp Guggenberger",
                                        "player": "Philipp Guggenberger",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Amering",
                                        "player": "Stefan Amering",
                                        "team": "FC Hinzenbach"
                                }
                        ]
                },
                {
                        "id": "2025_2026_43",
                        "round": "11. Runde",
                        "date": "2026-05-02",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "SV Croatia Linz",
                        "away": "Union Eschenau",
                        "score": "3:0",
                        "ht": "",
                        "status": "Abgesagt 3:0",
                        "note": "",
                        "events": [],
                        "scorers": [],
                        "cards": []
                },
                {
                        "id": "2025_2026_44",
                        "round": "11. Runde",
                        "date": "2026-05-13",
                        "time": "19:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "Walker FC",
                        "score": "2:2",
                        "ht": "1:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gregor Mair",
                                        "player": "Gregor Mair",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dominik Penninger",
                                        "player": "Dominik Penninger",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Marco Schmidt",
                                        "player": "Marco Schmidt",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Gregor Mair",
                                        "player": "Gregor Mair",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_45",
                        "round": "12. Runde",
                        "date": "2026-05-08",
                        "time": "19:00",
                        "location": "Sportplatz Traun",
                        "home": "DSG Union Traun",
                        "away": "Union Heiligenberg",
                        "score": "0:6",
                        "ht": "0:1",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ernst Zahrer",
                                        "player": "Ernst Zahrer",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benedict Humer",
                                        "player": "Benedict Humer",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_46",
                        "round": "12. Runde",
                        "date": "2026-05-09",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "Walker FC",
                        "score": "1:5",
                        "ht": "1:3",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Aleksandar Kostic",
                                        "player": "Aleksandar Kostic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Aleksandar Kostic",
                                        "player": "Aleksandar Kostic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Maxwell Agbemor",
                                        "player": "Maxwell Agbemor",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Vladica Petrovic",
                                        "player": "Vladica Petrovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Shankar Poudel",
                                        "player": "Shankar Poudel",
                                        "team": "Walker FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_47",
                        "round": "12. Runde",
                        "date": "2026-05-09",
                        "time": "17:00",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "Union Eschenau",
                        "score": "7:0",
                        "ht": "2:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Feichtenschlager",
                                        "player": "Paul Feichtenschlager",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_48",
                        "round": "12. Runde",
                        "date": "2026-05-15",
                        "time": "18:30",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "SV Croatia Linz",
                        "score": "1:3",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Dejan Jurleta",
                                        "player": "Dejan Jurleta",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Darko Dovoda",
                                        "player": "Darko Dovoda",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mateo Simunovic",
                                        "player": "Mateo Simunovic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Dejan Jurleta",
                                        "player": "Dejan Jurleta",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Darko Dovoda",
                                        "player": "Darko Dovoda",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mateo Simunovic",
                                        "player": "Mateo Simunovic",
                                        "team": "SV Croatia Linz"
                                }
                        ]
                },
                {
                        "id": "2025_2026_49",
                        "round": "13. Runde",
                        "date": "2026-05-22",
                        "time": "18:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "DSG Union Traun",
                        "score": "3:3",
                        "ht": "1:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Anmol Rai",
                                        "player": "Anmol Rai",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Luger",
                                        "player": "Gerhard Luger",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Moritz Radschiener",
                                        "player": "Moritz Radschiener",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Anmol Rai",
                                        "player": "Anmol Rai",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Florian Rebhandl",
                                        "player": "Florian Rebhandl",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Benjamin Stenhaug",
                                        "player": "Benjamin Stenhaug",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Kapfhammer",
                                        "player": "Manuel Kapfhammer",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Mayr",
                                        "player": "Michael Mayr",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Gerhard Luger",
                                        "player": "Gerhard Luger",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Moritz Radschiener",
                                        "player": "Moritz Radschiener",
                                        "team": "DSG Union Traun"
                                }
                        ]
                },
                {
                        "id": "2025_2026_50",
                        "round": "13. Runde",
                        "date": "2026-05-22",
                        "time": "18:30",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "Union Heiligenberg",
                        "score": "2:1",
                        "ht": "0:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dullinger",
                                        "player": "Michael Dullinger",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Jakob Wagner",
                                        "player": "Jakob Wagner",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dullinger",
                                        "player": "Michael Dullinger",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Johannes Steinbock",
                                        "player": "Johannes Steinbock",
                                        "team": "Union Heiligenberg"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Rene Rechtlehner",
                                        "player": "Rene Rechtlehner",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Jakob Wagner",
                                        "player": "Jakob Wagner",
                                        "team": "Union Heiligenberg"
                                }
                        ]
                },
                {
                        "id": "2025_2026_51",
                        "round": "13. Runde",
                        "date": "2026-05-22",
                        "time": "19:00",
                        "location": "Sportplatz Eschenau",
                        "home": "Union Eschenau",
                        "away": "FC Gornjak",
                        "score": "1:8",
                        "ht": "1:6",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dalibor Tatic",
                                        "player": "Dalibor Tatic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sanel Memic",
                                        "player": "Sanel Memic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Darko Maletic",
                                        "player": "Darko Maletic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stanislav Korovljevic",
                                        "player": "Stanislav Korovljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marko Ljubisavljevic",
                                        "player": "Marko Ljubisavljevic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ilija Stojchovski",
                                        "player": "Ilija Stojchovski",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Markus Kalakovic",
                                        "player": "Markus Kalakovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Dalibor Tatic",
                                        "player": "Dalibor Tatic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Sanel Memic",
                                        "player": "Sanel Memic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Darko Maletic",
                                        "player": "Darko Maletic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Farid Alem",
                                        "player": "Farid Alem",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Mario Wolfschluckner",
                                        "player": "Mario Wolfschluckner",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellowRed",
                                        "name": "Michael Dornetshuber",
                                        "player": "Michael Dornetshuber",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Sani Stancic",
                                        "player": "Sani Stancic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stanislav Korovljevic",
                                        "player": "Stanislav Korovljevic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Marko Ljubisavljevic",
                                        "player": "Marko Ljubisavljevic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_52",
                        "round": "13. Runde",
                        "date": "2026-06-12",
                        "time": "18:30",
                        "location": "DSG-Platz",
                        "home": "DSG St. Josef/Oed FC",
                        "away": "SV Croatia Linz",
                        "score": "2:7",
                        "ht": "1:0",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Milic",
                                        "player": "Manuel Milic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Stefan Woschitz",
                                        "player": "Stefan Woschitz",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nicolaus Steurer",
                                        "player": "Nicolaus Steurer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Julian Fischer",
                                        "player": "Julian Fischer",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Valentin Vejic",
                                        "player": "Valentin Vejic",
                                        "team": "SV Croatia Linz"
                                }
                        ]
                },
                {
                        "id": "2025_2026_53",
                        "round": "14. Runde",
                        "date": "2026-05-29",
                        "time": "17:00",
                        "location": "Sportplatz Wörth",
                        "home": "FC Hinzenbach",
                        "away": "DSG Union Traun",
                        "score": "2:3",
                        "ht": "2:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Ferihumer",
                                        "player": "Thomas Ferihumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Denis Petak",
                                        "player": "Denis Petak",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luca Vogl",
                                        "player": "Luca Vogl",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Thomas Ferihumer",
                                        "player": "Thomas Ferihumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Roland Meindlhumer",
                                        "player": "Roland Meindlhumer",
                                        "team": "FC Hinzenbach"
                                },
                                {
                                        "type": "goal",
                                        "name": "Ninoslav Matanovic",
                                        "player": "Ninoslav Matanovic",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Denis Petak",
                                        "player": "Denis Petak",
                                        "team": "DSG Union Traun"
                                },
                                {
                                        "type": "goal",
                                        "name": "Luca Vogl",
                                        "player": "Luca Vogl",
                                        "team": "DSG Union Traun"
                                }
                        ],
                        "cards": []
                },
                {
                        "id": "2025_2026_54",
                        "round": "14. Runde",
                        "date": "2026-05-30",
                        "time": "15:00",
                        "location": "DSG-Platz",
                        "home": "Walker FC",
                        "away": "DSG St. Josef/Oed FC",
                        "score": "1:5",
                        "ht": "0:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Haindl",
                                        "player": "Paul Haindl",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Nik Franzmair",
                                        "player": "Nik Franzmair",
                                        "team": "Walker FC"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Max Grund",
                                        "player": "Max Grund",
                                        "team": "Walker FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Thomas Paulmair",
                                        "player": "Thomas Paulmair",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Clemens Rössler",
                                        "player": "Clemens Rössler",
                                        "team": "DSG St. Josef/Oed FC"
                                },
                                {
                                        "type": "goal",
                                        "name": "Paul Haindl",
                                        "player": "Paul Haindl",
                                        "team": "DSG St. Josef/Oed FC"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Nik Franzmair",
                                        "player": "Nik Franzmair",
                                        "team": "Walker FC"
                                }
                        ]
                },
                {
                        "id": "2025_2026_55",
                        "round": "14. Runde",
                        "date": "2026-05-30",
                        "time": "17:00",
                        "location": "DSG-Platz",
                        "home": "FC Gornjak",
                        "away": "SV Croatia Linz",
                        "score": "1:5",
                        "ht": "0:4",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Dejan Teodorovic",
                                        "player": "Dejan Teodorovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Aleksandar Kostic",
                                        "player": "Aleksandar Kostic",
                                        "team": "FC Gornjak"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Dejan Teodorovic",
                                        "player": "Dejan Teodorovic",
                                        "team": "FC Gornjak"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Branko Marin",
                                        "player": "Branko Marin",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Leonardo Glavas",
                                        "player": "Leonardo Glavas",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Slaven Steko",
                                        "player": "Slaven Steko",
                                        "team": "SV Croatia Linz"
                                },
                                {
                                        "type": "goal",
                                        "name": "Robert Matisic",
                                        "player": "Robert Matisic",
                                        "team": "SV Croatia Linz"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Aleksandar Kostic",
                                        "player": "Aleksandar Kostic",
                                        "team": "FC Gornjak"
                                }
                        ]
                },
                {
                        "id": "2025_2026_56",
                        "round": "14. Runde",
                        "date": "2026-06-03",
                        "time": "20:00",
                        "location": "Sportplatz Heiligenberg",
                        "home": "Union Heiligenberg",
                        "away": "Union Eschenau",
                        "score": "5:2",
                        "ht": "3:2",
                        "status": "Played",
                        "note": "",
                        "events": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Gregor Mair",
                                        "player": "Gregor Mair",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "scorers": [
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Gregor Mair",
                                        "player": "Gregor Mair",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Rittberger",
                                        "player": "Simon Rittberger",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "goal",
                                        "name": "Simon Wenzl",
                                        "player": "Simon Wenzl",
                                        "team": "Union Eschenau"
                                }
                        ],
                        "cards": [
                                {
                                        "type": "yellow",
                                        "name": "Michael Haslehner",
                                        "player": "Michael Haslehner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Manuel Zauner-Wagner",
                                        "player": "Manuel Zauner-Wagner",
                                        "team": "Union Heiligenberg"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Daniel Auer",
                                        "player": "Daniel Auer",
                                        "team": "Union Eschenau"
                                },
                                {
                                        "type": "yellow",
                                        "name": "Christopher Ratzenböck",
                                        "player": "Christopher Ratzenböck",
                                        "team": "Union Eschenau"
                                }
                        ]
                }
        ],
        "stats": {
                "topScorers": [
                        {
                                "rank": 1,
                                "name": "Roland Meindlhumer",
                                "team": "FC Hinzenbach",
                                "goals": 20
                        },
                        {
                                "rank": 2,
                                "name": "Thomas Paulmair",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 14
                        },
                        {
                                "rank": 3,
                                "name": "Michael Haslehner",
                                "team": "Union Heiligenberg",
                                "goals": 13
                        },
                        {
                                "rank": 4,
                                "name": "Leonardo Glavas",
                                "team": "SV Croatia Linz",
                                "goals": 13
                        },
                        {
                                "rank": 5,
                                "name": "Dominik Penninger",
                                "team": "Union Heiligenberg",
                                "goals": 10
                        },
                        {
                                "rank": 6,
                                "name": "Max Grund",
                                "team": "Walker FC",
                                "goals": 9
                        },
                        {
                                "rank": 7,
                                "name": "Jan Lettner",
                                "team": "FC Hinzenbach",
                                "goals": 9
                        },
                        {
                                "rank": 8,
                                "name": "Florian Rebhandl",
                                "team": "Walker FC",
                                "goals": 8
                        },
                        {
                                "rank": 9,
                                "name": "Branko Marin",
                                "team": "SV Croatia Linz",
                                "goals": 8
                        },
                        {
                                "rank": 10,
                                "name": "Valentin Vejic",
                                "team": "SV Croatia Linz",
                                "goals": 8
                        },
                        {
                                "rank": 11,
                                "name": "Michael Dornetshuber",
                                "team": "Union Eschenau",
                                "goals": 6
                        },
                        {
                                "rank": 12,
                                "name": "Ernst Zahrer",
                                "team": "Union Heiligenberg",
                                "goals": 6
                        },
                        {
                                "rank": 13,
                                "name": "Farid Alem",
                                "team": "Union Eschenau",
                                "goals": 6
                        },
                        {
                                "rank": 14,
                                "name": "Sergey Stepanov",
                                "team": "FC Gornjak",
                                "goals": 6
                        },
                        {
                                "rank": 15,
                                "name": "Slaven Steko",
                                "team": "SV Croatia Linz",
                                "goals": 6
                        },
                        {
                                "rank": 16,
                                "name": "Paul Feichtenschlager",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 5
                        },
                        {
                                "rank": 17,
                                "name": "Ilija Stojchovski",
                                "team": "FC Gornjak",
                                "goals": 5
                        },
                        {
                                "rank": 18,
                                "name": "Tenzin Jayangtsang",
                                "team": "Walker FC",
                                "goals": 4
                        },
                        {
                                "rank": 19,
                                "name": "Raphael Deutschmann",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 4
                        },
                        {
                                "rank": 20,
                                "name": "Simon Wenzl",
                                "team": "Union Eschenau",
                                "goals": 4
                        },
                        {
                                "rank": 21,
                                "name": "Johannes Steinbock",
                                "team": "Union Heiligenberg",
                                "goals": 4
                        },
                        {
                                "rank": 22,
                                "name": "Josip Peric",
                                "team": "SV Croatia Linz",
                                "goals": 4
                        },
                        {
                                "rank": 23,
                                "name": "Michael Mayr",
                                "team": "DSG Union Traun",
                                "goals": 4
                        },
                        {
                                "rank": 24,
                                "name": "Marco Rajcic",
                                "team": "FC Gornjak",
                                "goals": 4
                        },
                        {
                                "rank": 25,
                                "name": "Robert Matisic",
                                "team": "SV Croatia Linz",
                                "goals": 4
                        },
                        {
                                "rank": 26,
                                "name": "Manuel Milic",
                                "team": "SV Croatia Linz",
                                "goals": 4
                        },
                        {
                                "rank": 27,
                                "name": "Markus Kalakovic",
                                "team": "FC Gornjak",
                                "goals": 4
                        },
                        {
                                "rank": 28,
                                "name": "Dominik Scheuringer",
                                "team": "Union Eschenau",
                                "goals": 3
                        },
                        {
                                "rank": 29,
                                "name": "Maxwell Agbemor",
                                "team": "Walker FC",
                                "goals": 3
                        },
                        {
                                "rank": 30,
                                "name": "Marco Schmidt",
                                "team": "Walker FC",
                                "goals": 3
                        },
                        {
                                "rank": 31,
                                "name": "Manuel Kapfhammer",
                                "team": "DSG Union Traun",
                                "goals": 3
                        },
                        {
                                "rank": 32,
                                "name": "Clemens Rössler",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 3
                        },
                        {
                                "rank": 33,
                                "name": "Stefan Woschitz",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 3
                        },
                        {
                                "rank": 34,
                                "name": "Fabian Michael Ott",
                                "team": "FC Hinzenbach",
                                "goals": 3
                        },
                        {
                                "rank": 35,
                                "name": "Benjamin Stenhaug",
                                "team": "Walker FC",
                                "goals": 3
                        },
                        {
                                "rank": 36,
                                "name": "Manuel Zauner-Wagner",
                                "team": "Union Heiligenberg",
                                "goals": 3
                        },
                        {
                                "rank": 37,
                                "name": "Julian Fischer",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 3
                        },
                        {
                                "rank": 38,
                                "name": "Jonas Binder",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 2
                        },
                        {
                                "rank": 39,
                                "name": "Luca Vogl",
                                "team": "DSG Union Traun",
                                "goals": 2
                        },
                        {
                                "rank": 40,
                                "name": "Philipp Habring",
                                "team": "DSG Union Traun",
                                "goals": 2
                        },
                        {
                                "rank": 41,
                                "name": "Philipp Guggenberger",
                                "team": "FC Hinzenbach",
                                "goals": 2
                        },
                        {
                                "rank": 42,
                                "name": "Marco Braumann",
                                "team": "Union Eschenau",
                                "goals": 2
                        },
                        {
                                "rank": 43,
                                "name": "Paul Steininger",
                                "team": "Union Heiligenberg",
                                "goals": 2
                        },
                        {
                                "rank": 44,
                                "name": "Manuel Pühringer",
                                "team": "Union Eschenau",
                                "goals": 2
                        },
                        {
                                "rank": 45,
                                "name": "Christopher Ratzenböck",
                                "team": "Union Eschenau",
                                "goals": 2
                        },
                        {
                                "rank": 46,
                                "name": "Stefan Freudenthaler",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 2
                        },
                        {
                                "rank": 47,
                                "name": "Shankar Poudel",
                                "team": "Walker FC",
                                "goals": 2
                        },
                        {
                                "rank": 48,
                                "name": "Sebastian Grabner",
                                "team": "Union Heiligenberg",
                                "goals": 2
                        },
                        {
                                "rank": 49,
                                "name": "Simon Penninger",
                                "team": "Union Heiligenberg",
                                "goals": 2
                        },
                        {
                                "rank": 50,
                                "name": "Filip Skoro",
                                "team": "SV Croatia Linz",
                                "goals": 2
                        },
                        {
                                "rank": 51,
                                "name": "Simon Rittberger",
                                "team": "Union Eschenau",
                                "goals": 2
                        },
                        {
                                "rank": 52,
                                "name": "Benedict Humer",
                                "team": "Union Heiligenberg",
                                "goals": 2
                        },
                        {
                                "rank": 53,
                                "name": "Sanel Memic",
                                "team": "FC Gornjak",
                                "goals": 2
                        },
                        {
                                "rank": 54,
                                "name": "Sani Stancic",
                                "team": "FC Gornjak",
                                "goals": 2
                        },
                        {
                                "rank": 55,
                                "name": "Kevin Schneider",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 56,
                                "name": "Taher Akbar",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 57,
                                "name": "Michael Ahammer",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 58,
                                "name": "Anto Marcinkovic",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 59,
                                "name": "Stefan Wiener",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 60,
                                "name": "Fabian Walter",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 61,
                                "name": "Edi Klaric-Jozic",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 62,
                                "name": "Marko Aleksic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 63,
                                "name": "Manuel Winklehner",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 64,
                                "name": "Felix Übleis",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 65,
                                "name": "Niko Reinthaler",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 66,
                                "name": "Jürgen Hutsteiner",
                                "team": "Union Heiligenberg",
                                "goals": 1
                        },
                        {
                                "rank": 67,
                                "name": "Ramadan Karakaya",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 68,
                                "name": "Felix Trinkfass",
                                "team": "Union Heiligenberg",
                                "goals": 1
                        },
                        {
                                "rank": 69,
                                "name": "Andreas Lederer",
                                "team": "Union Heiligenberg",
                                "goals": 1
                        },
                        {
                                "rank": 70,
                                "name": "Tobias Pointner",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 71,
                                "name": "Rainer Meindlhumer",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 72,
                                "name": "Markus Jungreithmayr",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 73,
                                "name": "Manuel Wozabal",
                                "team": "Walker FC",
                                "goals": 1
                        },
                        {
                                "rank": 74,
                                "name": "Ivan Peric",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 75,
                                "name": "Michael Pehamberger",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 76,
                                "name": "Luka Budes",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 77,
                                "name": "Manuel Stadler",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 78,
                                "name": "Andreas Walter-Raab",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 79,
                                "name": "Mladen Nikolic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 80,
                                "name": "Janik Machowetz",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 81,
                                "name": "Boris Bagaric",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 82,
                                "name": "Mario Peric",
                                "team": "SV Croatia Linz",
                                "goals": 1
                        },
                        {
                                "rank": 83,
                                "name": "Rene Rechtlehner",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 84,
                                "name": "Bernhard Glatz",
                                "team": "Walker FC",
                                "goals": 1
                        },
                        {
                                "rank": 85,
                                "name": "Daniel Dornetshuber",
                                "team": "Union Eschenau",
                                "goals": 1
                        },
                        {
                                "rank": 86,
                                "name": "Simon Dornetshumer",
                                "team": "Union Heiligenberg",
                                "goals": 1
                        },
                        {
                                "rank": 87,
                                "name": "Moritz Radschiener",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 88,
                                "name": "Lukas Wahl",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 89,
                                "name": "Markus Asanger",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 90,
                                "name": "Fabian Wild",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 91,
                                "name": "Aleksandar Kostic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 92,
                                "name": "Michael Dullinger",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 93,
                                "name": "Dalibor Tatic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 94,
                                "name": "Darko Maletic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 95,
                                "name": "Nicolaus Steurer",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 96,
                                "name": "Thomas Ferihumer",
                                "team": "FC Hinzenbach",
                                "goals": 1
                        },
                        {
                                "rank": 97,
                                "name": "Ninoslav Matanovic",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 98,
                                "name": "Denis Petak",
                                "team": "DSG Union Traun",
                                "goals": 1
                        },
                        {
                                "rank": 99,
                                "name": "Paul Haindl",
                                "team": "DSG St. Josef/Oed FC",
                                "goals": 1
                        },
                        {
                                "rank": 100,
                                "name": "Dejan Teodorovic",
                                "team": "FC Gornjak",
                                "goals": 1
                        },
                        {
                                "rank": 101,
                                "name": "Gregor Mair",
                                "team": "Union Heiligenberg",
                                "goals": 1
                        }
                ],
                "cards": [
                        {
                                "name": "Daniel Auer",
                                "team": "Union Eschenau",
                                "yellow": 3,
                                "yellowRed": 1,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Vladica Petrovic",
                                "team": "FC Gornjak",
                                "yellow": 5,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Johannes Steinbock",
                                "team": "Union Heiligenberg",
                                "yellow": 4,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Simon Wenzl",
                                "team": "Union Eschenau",
                                "yellow": 4,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ramadan Karakaya",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 4,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Sasa Nedic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 1,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Stefan Woschitz",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 3,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Martin Brenner",
                                "team": "Walker FC",
                                "yellow": 3,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Mario Wolfschluckner",
                                "team": "Union Eschenau",
                                "yellow": 3,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Simon Dornetshumer",
                                "team": "Union Heiligenberg",
                                "yellow": 3,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Jonas Binder",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 0,
                                "yellowRed": 1,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Manuel Kapfhammer",
                                "team": "DSG Union Traun",
                                "yellow": 3,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Dalibor Tatic",
                                "team": "FC Gornjak",
                                "yellow": 0,
                                "yellowRed": 1,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Michael Dornetshuber",
                                "team": "Union Eschenau",
                                "yellow": 0,
                                "yellowRed": 1,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Raphael Deutschmann",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Philipp Habring",
                                "team": "DSG Union Traun",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Matthias Kneidinger",
                                "team": "FC Hinzenbach",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Benedict Humer",
                                "team": "Union Heiligenberg",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Andreas Lederer",
                                "team": "Union Heiligenberg",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Christoph Mühlbacher",
                                "team": "Walker FC",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ninoslav Matanovic",
                                "team": "DSG Union Traun",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ernst Zahrer",
                                "team": "Union Heiligenberg",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Simon Penninger",
                                "team": "Union Heiligenberg",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Kevin Tiepelt",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Nicolaus Steurer",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Marco Rajcic",
                                "team": "FC Gornjak",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Rene Rechtlehner",
                                "team": "FC Hinzenbach",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Thomas Paulmair",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Gerhard Luger",
                                "team": "DSG Union Traun",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Stanislav Korovljevic",
                                "team": "FC Gornjak",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Sani Stancic",
                                "team": "FC Gornjak",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Michael Haslehner",
                                "team": "Union Heiligenberg",
                                "yellow": 2,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Rudolf Rossgatterer",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Paul Feichtenschlager",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Michael Kaimberger",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Andreas Humer",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Manuel Pühringer",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Maxwell Agbemor",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Djordje Malesevic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Dominik Pfannhauser",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Gerhard Busch",
                                "team": "DSG Union Traun",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Alexander Gfellner",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Simon Rittberger",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Paul Steininger",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Alex Steiner",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Edi Klaric-Jozic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Leonardo Glavas",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Igor Vidovic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Anto Marcinkovic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Berislav Zuljevic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Danijel Majer",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Nemanja Ilic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Marco Braumann",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Jan Schützeneder",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Clemens Rössler",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Fabio Froschauer",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Robert Matisic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Florian Berger",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Roland Meindlhumer",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Josip Peric",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Branko Marin",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Marko Burg",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ivan Peric",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Nebojsa Krstic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ivan Nikolov",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Dominik Scheuringer",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Luka Budes",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Stefan Freudenthaler",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Manuel Märzinger",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Matteo Deisenhammer",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Slaven Steko",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Florian Lehner",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Thomas Wagner",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Bernhard Altendorfer",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Ivan Radisavljevic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Max Grund",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Michael Ahammer",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Taher Akbar",
                                "team": "DSG Union Traun",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Stefan Amering",
                                "team": "FC Hinzenbach",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Gregor Mair",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Shankar Poudel",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Dejan Jurleta",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Darko Dovoda",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Mateo Simunovic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Anmol Rai",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Florian Rebhandl",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Benjamin Stenhaug",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Michael Mayr",
                                "team": "DSG Union Traun",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Moritz Radschiener",
                                "team": "DSG Union Traun",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Jakob Wagner",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Farid Alem",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Marko Ljubisavljevic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Julian Fischer",
                                "team": "DSG St. Josef/Oed FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Valentin Vejic",
                                "team": "SV Croatia Linz",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Nik Franzmair",
                                "team": "Walker FC",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Aleksandar Kostic",
                                "team": "FC Gornjak",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Manuel Zauner-Wagner",
                                "team": "Union Heiligenberg",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        },
                        {
                                "name": "Christopher Ratzenböck",
                                "team": "Union Eschenau",
                                "yellow": 1,
                                "yellowRed": 0,
                                "red": 0,
                                "suspension": ""
                        }
                ]
        }
},
    "2026/2027": {
      teams: [],
      matches: [],
      stats: {
        topScorers: [],
        cards: []
      }
    }
  },
  gallery: [
    {
      id: 'meisterfeier-2026',
      title: 'Meisterfeier 2026',
      date: '12. Juni 2026',
      excerpt: 'Feierlicher Fußballabend am DSG Platz mit Ehrung des neuen Meisters SV Croatia Linz.',
      image: 'stadion.png',
      images: [
        { url: 'stadion.png', title: 'Meisterfeier 2026' }
      ]
    }
  ]
};

import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let memoryData = null;
let memoryNews = [];
let memoryGallery = [];

function trySetLocal(key, dataStr) {
  try {
    localStorage.setItem(key, dataStr);
  } catch (e) {
    console.warn("localStorage quota exceeded. Attempting to clear old caches...", e);
    try {
      for (let i = 1; i < 16; i++) {
        localStorage.removeItem(`dsg_data_v${i}`);
        localStorage.removeItem(`dsg_articles_v${i}`);
        localStorage.removeItem(`dsg_gallery_v${i}`);
      }
      localStorage.setItem(key, dataStr);
    } catch(err) {
      console.error("Still exceeded after cleanup:", err);
    }
  }
}

const loadLocal = (prefix, maxVer) => {
  for (let i = maxVer; i >= 1; i--) {
    const data = JSON.parse(localStorage.getItem(`${prefix}_v${i}`));
    if (data && (!Array.isArray(data) || data.length > 0)) {
      return data;
    }
  }
  return null;
};

export const Store = {
  init() {
    // Eagerly load local memory so the app doesn't block on network
    memoryData = loadLocal('dsg_data', 37) || INITIAL_DATA;
    memoryNews = loadLocal('dsg_articles', 18) || INITIAL_DATA.news || [];
    memoryGallery = loadLocal('dsg_gallery', 18) || INITIAL_DATA.gallery || [];

    // Trigger Firebase sync in the background
    this.syncFirebase();
  },

  async syncFirebase() {
    const dataRef = doc(db, 'system', 'liga_data');
    const newsRef = doc(db, 'system', 'news_data');
    const galleryRef = doc(db, 'system', 'gallery_data');

    try {
      const [dataSnap, newsSnap, gallerySnap] = await Promise.all([
        getDoc(dataRef), getDoc(newsRef), getDoc(galleryRef)
      ]);

      let needsMigration = false;
      let hasUpdates = false;

      // Sync Data
      if (dataSnap.exists() && dataSnap.data().data) {
        const fbData = dataSnap.data().data;
        const localData = loadLocal('dsg_data', 37);
        if (localData && localData.lastUpdated && (!fbData.lastUpdated || localData.lastUpdated > fbData.lastUpdated)) {
          memoryData = localData;
          needsMigration = true;
        } else {
          memoryData = fbData;
          hasUpdates = true;
        }
      } else {
        let legacyData = loadLocal('dsg_data', 37);
        if (!legacyData) legacyData = INITIAL_DATA;
        memoryData = legacyData;
        needsMigration = true;
      }

      // Sync News
      if (newsSnap.exists() && newsSnap.data().data) {
        const fbNews = newsSnap.data().data;
        const localNews = loadLocal('dsg_articles', 17) || INITIAL_DATA.news || [];
        if (localNews.length > fbNews.length) {
          memoryNews = localNews;
          needsMigration = true;
        } else {
          memoryNews = fbNews;
          hasUpdates = true;
        }
      } else {
        memoryNews = loadLocal('dsg_articles', 17) || INITIAL_DATA.news || [];
        needsMigration = true;
      }

      // Sync Gallery
      if (gallerySnap.exists() && gallerySnap.data().data) {
        const fbGallery = gallerySnap.data().data;
        const localGallery = loadLocal('dsg_gallery', 17) || INITIAL_DATA.gallery || [];
        const memTime = fbGallery[0]?.lastUpdated || 0;
        const locTime = localGallery[0]?.lastUpdated || 0;
        if (localGallery.length > fbGallery.length || locTime > memTime) {
          memoryGallery = localGallery;
          needsMigration = true;
        } else {
          memoryGallery = fbGallery;
          hasUpdates = true;
        }
      } else {
        memoryGallery = loadLocal('dsg_gallery', 17) || INITIAL_DATA.gallery || [];
        needsMigration = true;
      }

                              // START ONE-TIME MIGRATION FOR R4
if (memoryData.seasons && memoryData.seasons["2026/2027"]) {
    let season = memoryData.seasons["2026/2027"];
    let realEvents = [
        {
            home: "DSG Union Traun",
            away: "FC Gornjak",
            status: "Played",
            score: "8:2",
            ht: "4:1",
            events: [
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Ioan Gafincu", team: "DSG Union Traun" },
                { type: "goal", name: "Ioan Gafincu", team: "DSG Union Traun" },
                { type: "goal", name: "Taher Akbar", team: "DSG Union Traun" },
                { type: "goal", name: "Lukas Wahl", team: "DSG Union Traun" },
                { type: "goal", name: "Michael Mayr", team: "DSG Union Traun" },
                { type: "yellow", name: "Taher Akbar", team: "DSG Union Traun" },
                { type: "yellow", name: "Ninoslav Matanovic", team: "DSG Union Traun" },
                { type: "yellow", name: "Süleyman Targil", team: "DSG Union Traun" },
                { type: "goal", name: "Ilija Stojchovski", team: "FC Gornjak" },
                { type: "yellow", name: "Vladica Petrovic", team: "FC Gornjak" },
                { type: "yellow", name: "Sani Stancic", team: "FC Gornjak" }
            ]
        },
        {
            home: "Walker FC",
            away: "SV Croatia Linz",
            status: "Abgesagt 0:3",
            score: "0:3",
            ht: "",
            events: []
        }
    ];

    realEvents.forEach(re => {
        let match = season.matches.find(m => m.home === re.home && m.away === re.away);
        if (match) {
            match.status = re.status;
            match.score = re.score;
            match.ht = re.ht;
            match.events = re.events;
            match.events.forEach(e => { e.player = e.name; }); 
            match.scorers = match.events.filter(e => e.type === "goal");
            match.cards = match.events.filter(e => e.type === "yellow" || e.type === "red" || e.type === "yellowRed");
        }
    });
    
    season.teams.forEach(t => {
        t.played = 0; t.won = 0; t.drawn = 0; t.lost = 0; t.gf = 0; t.ga = 0; t.points = 0;
    });
    season.stats.topScorers = [];
    season.stats.cards = [];
    
    season.matches.forEach(m => {
        if (m.status !== "Played" && m.status !== "Abgesagt 3:0" && m.status !== "Abgesagt 0:3") return;
        let homeTeam = season.teams.find(t => t.name === m.home);
        let awayTeam = season.teams.find(t => t.name === m.away);
        if (!homeTeam || !awayTeam) return;
        
        let hg = 0, ag = 0;
        if (m.status === "Abgesagt 3:0") { hg = 3; ag = 0; }
        else if (m.status === "Abgesagt 0:3") { hg = 0; ag = 3; }
        else if (m.score) {
            let pts = m.score.split(':');
            if (pts.length === 2) {
                hg = parseInt(pts[0].trim());
                ag = parseInt(pts[1].trim());
            }
        }
        
        homeTeam.played++; awayTeam.played++;
        homeTeam.gf += hg; homeTeam.ga += ag;
        awayTeam.gf += ag; awayTeam.ga += hg;
        
        if (hg > ag) { homeTeam.won++; homeTeam.points += 3; awayTeam.lost++; }
        else if (ag > hg) { awayTeam.won++; awayTeam.points += 3; homeTeam.lost++; }
        else { homeTeam.drawn++; awayTeam.drawn++; homeTeam.points += 1; awayTeam.points += 1; }
        
        if (m.scorers) {
            m.scorers.forEach(s => {
                let obj = season.stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
                if (!obj) { obj = { name: s.name, team: s.team, goals: 0 }; season.stats.topScorers.push(obj); }
                obj.goals++;
            });
        }
        if (m.cards) {
            m.cards.forEach(c => {
                let obj = season.stats.cards.find(tc => tc.name === c.name && tc.team === c.team);
                if (!obj) { obj = { name: c.name, team: c.team, yellow: 0, yellowRed: 0, red: 0 }; season.stats.cards.push(obj); }
                if (c.type === "yellow") obj.yellow++;
                if (c.type === "yellowRed") obj.yellowRed++;
                if (c.type === "red") obj.red++;
            });
        }
    });
    
    season.stats.topScorers.sort((a,b) => b.goals - a.goals);
    
    memoryData.lastUpdated = Date.now();
    needsMigration = true;
}
// END ONE-TIME MIGRATION FOR R4

        // --- HARDCODED HISTORICAL DATA ---
      if (!memoryData.seasons) memoryData.seasons = {};
      
      try {
        const res = await fetch('data/liga.json');
        if (res.ok) {
          const originalData = await res.json();
          memoryData.seasons["2025/2026"] = {
            teams: originalData.teams || [],
            matches: originalData.matches || [],
            stats: originalData.stats || { topScorers: [], cards: [] }
          };
        }
      } catch(e) {
        console.log("Could not fetch liga.json for 2025/2026 history:", e);
      }

      if (!memoryData.seasons["2025/2026"] || !memoryData.seasons["2025/2026"].teams) {
          memoryData.seasons["2025/2026"] = INITIAL_DATA.seasons["2025/2026"];
      }

      for (let s in INITIAL_DATA.seasons) {
        if (s === "2025/2026") continue;
        if (!memoryData.seasons[s]) {
          memoryData.seasons[s] = INITIAL_DATA.seasons[s];
          needsMigration = true;
        }
        if (!memoryData.seasons[s].stats) {
          memoryData.seasons[s].stats = { topScorers: [], cards: [] };
          needsMigration = true;
        }
      }



      if (memoryData.teams) { delete memoryData.teams; needsMigration = true; }
      if (memoryData.matches) { delete memoryData.matches; needsMigration = true; }
      if (memoryData.stats) { delete memoryData.stats; needsMigration = true; }

      memoryNews.forEach(article => {
        if (!article.image) {
          article.image = 'dsg.avif';
          needsMigration = true;
        }
      });

      if (needsMigration) {
        const fbSaveData = JSON.parse(JSON.stringify(memoryData));
        if (fbSaveData.seasons && fbSaveData.seasons["2025/2026"]) {
          delete fbSaveData.seasons["2025/2026"];
        }
        await setDoc(dataRef, { data: fbSaveData }).catch(e => console.error("Firebase save error (data):", e));
        await setDoc(newsRef, { data: memoryNews }).catch(e => console.error("Firebase save error (news):", e));
        await setDoc(galleryRef, { data: memoryGallery }).catch(e => console.error("Firebase save error (gallery):", e));
      }
        
      trySetLocal('dsg_data_v37', JSON.stringify(memoryData));
      trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
      trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
      console.log("Migrated local data to Firebase.");

      if (hasUpdates) {
        window.dispatchEvent(new Event('data-updated'));
      }
    } catch(e) {
      console.error("Firebase sync failed or timed out. Relying on local cache.", e);
    }
  },
  
  getData() {
    return memoryData;
  },
  
  saveData(data) {
    data.lastUpdated = Date.now();
    memoryData = data;
    trySetLocal('dsg_data_v37', JSON.stringify(data));
    
    const fbSaveData = JSON.parse(JSON.stringify(data));
    if (fbSaveData.seasons && fbSaveData.seasons["2025/2026"]) {
      delete fbSaveData.seasons["2025/2026"];
    }
    setDoc(doc(db, 'system', 'liga_data'), { data: fbSaveData }).catch(e => console.error("Firebase save error:", e));
  },

  getNews() {
    return memoryNews;
  },
  
  getArticle(id) {
    return this.getNews().find(a => String(a.id) === String(id));
  },

  deleteArticle(id) {
    memoryNews = memoryNews.filter(a => String(a.id) !== String(id));
    trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
  },
  
  addNews(title, excerpt, content, image, gallery) {
    const newId = title.toLowerCase().replace(/\s+/g, '-');
    memoryNews.unshift({
      id: newId,
      title,
      content: content || `<p>${excerpt}</p>`,
      author: "Admin",
      readTime: "2 min read",
      image: image || 'dsg.avif',
      gallery: gallery || [],
      date: new Date().toISOString().split('T')[0]
    });
    trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
  },

  getLiga(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].teams) return [];
    const teams = [...data.seasons[sid].teams];
    return teams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
  },
  
  getStats(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].stats) return { topScorers: [], cards: [] };
    return data.seasons[sid].stats;
  },

  getMatches(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].matches) return [];
    return data.seasons[sid].matches;
  },

  getMatch(seasonId, matchId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].matches) return null;
    return (data.seasons[sid].matches || []).find(m => String(m.id) === String(matchId));
  },

  getPlayers() {
    return this.getData().players || [];
  },

  saveMatch(seasonId, matchData) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    
    // Reverse previous match stats if editing
    if (matchData.id) {
      this._reverseMatchStats(data, sid, matchData.id);
    } else {
      matchData.id = Date.now().toString();
    }

    // Process new match stats
    this._applyMatchStats(data, sid, matchData);
    
    // Update players autocomplete list
    const newPlayers = new Set(data.players || []);
    (matchData.scorers || []).forEach(s => newPlayers.add(s.name.trim()));
    (matchData.cards || []).forEach(c => newPlayers.add(c.name.trim()));
    data.players = Array.from(newPlayers).filter(n => n.length > 0);

    // Save match
    const matches = data.seasons[sid].matches;
    const existingIndex = matches.findIndex(m => String(m.id) === String(matchData.id));
    if (existingIndex > -1) {
      matches[existingIndex] = matchData;
    } else {
      matches.push(matchData);
    }
    
    // Sort matches by date then round loosely
    matches.sort((a, b) => {
      const parseDate = (d) => {
        if (!d) return 0;
        const p = d.split('.');
        if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime();
        return new Date(d).getTime() || 0;
      };
      return parseDate(b.date) - parseDate(a.date);
    });

    this.saveData(data);
  },

  deleteMatch(seasonId, matchId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    this._reverseMatchStats(data, sid, matchId);
    data.seasons[sid].matches = data.seasons[sid].matches.filter(m => String(m.id) !== String(matchId));
    this.saveData(data);
  },

  _reverseMatchStats(data, sid, matchId) {
    const match = data.seasons[sid].matches.find(m => String(m.id) === String(matchId));
    if (!match) return;

    // Reverse Team Points
    if (match.status === 'Played' || match.status === 'Walkover' || match.status === 'Abgesagt 3:0' || match.status === 'Abgesagt 0:3' || !match.status) { // legacy matches might not have status
      const teamA = data.seasons[sid].teams.find(t => t.name === match.home);
      const teamB = data.seasons[sid].teams.find(t => t.name === match.away);
      
      let goalsA = 0;
      let goalsB = 0;
      let validScore = false;

      if (match.status === 'Abgesagt 3:0') {
        goalsA = 3; goalsB = 0; validScore = true;
      } else if (match.status === 'Abgesagt 0:3') {
        goalsA = 0; goalsB = 3; validScore = true;
      } else {
        let scoreStr = match.score || "";
        if (scoreStr.includes(':')) {
          let parts = scoreStr.split(' ')[0].replace('*', '').split(':');
          goalsA = parseInt(parts[0]);
          goalsB = parseInt(parts[1]);
          validScore = true;
        }
      }
      
      if (validScore && !isNaN(goalsA) && !isNaN(goalsB) && teamA && teamB) {
        teamA.played--; teamB.played--;
        teamA.gf -= goalsA; teamA.ga -= goalsB;
        teamB.gf -= goalsB; teamB.ga -= goalsA;

        if (goalsA > goalsB) { teamA.won--; teamA.points -= 3; teamB.lost--; }
        else if (goalsA < goalsB) { teamB.won--; teamB.points -= 3; teamA.lost--; }
        else { teamA.drawn--; teamB.drawn--; teamA.points--; teamB.points--; }
      }
    }

    // Reverse Scorers
    if (match.scorers) {
      if (!data.seasons[sid].stats.topScorers) data.seasons[sid].stats.topScorers = [];
      match.scorers.forEach(s => {
        const statsObj = data.seasons[sid].stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
        if (statsObj) statsObj.goals--;
      });
      data.seasons[sid].stats.topScorers = data.seasons[sid].stats.topScorers.filter(ts => ts.goals > 0);
    }

    // Reverse Cards
    if (match.cards) {
      match.cards.forEach(c => {
        if (!data.seasons[sid].stats.cards) data.seasons[sid].stats.cards = [];
        const cObj = data.seasons[sid].stats.cards.find(ts => ts.name === c.name && ts.team === c.team);
        if (cObj) {
          if (c.type === 'yellow') cObj.yellow--;
          if (c.type === 'yellowRed') cObj.yellowRed--;
          if (c.type === 'red') cObj.red--;
        }
      });
      data.seasons[sid].stats.cards = data.seasons[sid].stats.cards.filter(ts => ts.yellow > 0 || ts.yellowRed > 0 || ts.red > 0);
    }
  },

  _applyMatchStats(data, sid, match) {
    // Apply Team Points
    if (match.status === 'Played' || match.status === 'Walkover' || match.status === 'Abgesagt 3:0' || match.status === 'Abgesagt 0:3') {
      const teamA = data.seasons[sid].teams.find(t => t.name === match.home);
      const teamB = data.seasons[sid].teams.find(t => t.name === match.away);
      
      let goalsA = 0;
      let goalsB = 0;

      if (match.status === 'Abgesagt 3:0') {
        goalsA = 3; goalsB = 0;
      } else if (match.status === 'Abgesagt 0:3') {
        goalsA = 0; goalsB = 3;
      } else {
        let parts = (match.score || "0:0").split(' ')[0].replace('*', '').split(':');
        goalsA = parseInt(parts[0]) || 0;
        goalsB = parseInt(parts[1]) || 0;
      }
      
      if (!isNaN(goalsA) && !isNaN(goalsB) && teamA && teamB) {
        teamA.played++; teamB.played++;
        teamA.gf += goalsA; teamA.ga += goalsB;
        teamB.gf += goalsB; teamB.ga += goalsA;

        if (goalsA > goalsB) { teamA.won++; teamA.points += 3; teamB.lost++; }
        else if (goalsA < goalsB) { teamB.won++; teamB.points += 3; teamA.lost++; }
        else { teamA.drawn++; teamB.drawn++; teamA.points++; teamB.points++; }
      }
    }

    // Apply Scorers
    if (match.scorers) {
      match.scorers.forEach(s => {
        let statsObj = data.seasons[sid].stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
        if (!statsObj) {
          statsObj = { name: s.name, team: s.team, goals: 0 };
          data.seasons[sid].stats.topScorers.push(statsObj);
        }
        statsObj.goals++;
      });
      data.seasons[sid].stats.topScorers.sort((a, b) => b.goals - a.goals);
    }

    // Apply Cards
    if (match.cards) {
      if (!data.seasons[sid].stats.cards) data.seasons[sid].stats.cards = [];
      match.cards.forEach(c => {
        let cObj = data.seasons[sid].stats.cards.find(ts => ts.name === c.name && ts.team === c.team);
        if (!cObj) {
          cObj = { name: c.name, team: c.team, yellow: 0, yellowRed: 0, red: 0, suspension: "" };
          data.seasons[sid].stats.cards.push(cObj);
        }
        if (c.type === 'yellow') cObj.yellow++;
        if (c.type === 'yellowRed') cObj.yellowRed++;
        if (c.type === 'red') cObj.red++;
      });
    }
  },


  async getAdminTeams() {
    let local = loadLocal('dsg_admin_teams', 3);
    
    // Check Firestore
    try {
      const teamSnap = await getDoc(doc(db, 'system', 'teams_data'));
      if (teamSnap.exists() && teamSnap.data()?.data) {
        const fbTeams = teamSnap.data().data;
        trySetLocal('dsg_admin_teams_v3', JSON.stringify(fbTeams));
        return fbTeams;
      }
    } catch(e) {
      console.warn("Could not fetch teams from Firebase:", e);
    }

    if (local) return local;

    try {
      const res = await fetch('data/teams.json');
      const data = await res.json();
      const normalized = data.map(t => ({
        ...t,
        Status: (t.Status === 'Nein' || !t.Status || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv'
      }));
      trySetLocal('dsg_admin_teams_v3', JSON.stringify(normalized));
      
      // Upload initial teams to Firestore
      setDoc(doc(db, 'system', 'teams_data'), { data: normalized, lastUpdated: Date.now() })
        .catch(e => console.error("Firebase save error (teams):", e));
        
      return normalized;
    } catch(e) { return []; }
  },

  saveAdminTeams(teams) {
    trySetLocal('dsg_admin_teams_v3', JSON.stringify(teams));
    setDoc(doc(db, 'system', 'teams_data'), { data: teams, lastUpdated: Date.now() })
      .catch(e => console.error("Firebase save error (teams):", e));
    window.dispatchEvent(new CustomEvent('teams-updated'));
  },

  async getAdminPlayers() {
    let local = loadLocal('dsg_admin_players', 2);

    // Try reading from Firebase Firestore
    try {
      const metaSnap = await getDoc(doc(db, 'system', 'players_meta'));
      if (metaSnap.exists() && metaSnap.data()?.parts) {
        const partsCount = metaSnap.data().parts;
        const partPromises = [];
        for (let i = 0; i < partsCount; i++) {
          partPromises.push(getDoc(doc(db, 'system', `players_part_${i}`)));
        }
        const partSnaps = await Promise.all(partPromises);
        let fbPlayers = [];
        for (const snap of partSnaps) {
          if (snap.exists() && snap.data()?.data) {
            fbPlayers = fbPlayers.concat(snap.data().data);
          }
        }
        if (fbPlayers.length > 0) {
          trySetLocal('dsg_admin_players_v2', JSON.stringify(fbPlayers));
          return fbPlayers;
        }
      }
    } catch(e) {
      console.warn("Could not fetch players from Firebase:", e);
    }

    if (local) return local;

    try {
      const res = await fetch('data/players.json');
      const data = await res.json();
      trySetLocal('dsg_admin_players_v2', JSON.stringify(data));

      // Upload initial players to Firebase in chunks of 1500
      this._savePlayersToFirebase(data);

      return data;
    } catch(e) { return []; }
  },

  saveAdminPlayers(players) {
    trySetLocal('dsg_admin_players_v2', JSON.stringify(players));
    this._savePlayersToFirebase(players);
    window.dispatchEvent(new CustomEvent('players-updated'));
  },

  _savePlayersToFirebase(players) {
    const CHUNK_SIZE = 1500;
    const chunks = [];
    for (let i = 0; i < players.length; i += CHUNK_SIZE) {
      chunks.push(players.slice(i, i + CHUNK_SIZE));
    }

    // Save meta
    setDoc(doc(db, 'system', 'players_meta'), { 
      count: players.length, 
      parts: chunks.length, 
      lastUpdated: Date.now() 
    }).catch(e => console.error("Firebase save error (players_meta):", e));

    // Save each chunk
    chunks.forEach((chunk, idx) => {
      setDoc(doc(db, 'system', `players_part_${idx}`), { 
        data: chunk 
      }).catch(e => console.error(`Firebase save error (players_part_${idx}):`, e));
    });
  },

  getGallery() {
    return memoryGallery;
  },

  getAlbum(id) {
    return this.getGallery().find(a => String(a.id) === String(id));
  },

  deleteAlbum(id) {
    memoryGallery = memoryGallery.filter(a => String(a.id) !== String(id));
    trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
  },

  addAlbum(title, date, excerpt, coverImage, imagesArray) {
    const newId = title.toLowerCase().replace(/\s+/g, '-');
    memoryGallery.unshift({ id: newId, title, date, excerpt, image: coverImage, images: imagesArray });
    trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
  },

  updateAlbum(id, title, date, excerpt, coverImage, imagesArray) {
    const index = memoryGallery.findIndex(a => String(a.id) === String(id));
    if (index !== -1) {
      memoryGallery[index] = { id, title, date, excerpt, image: coverImage, images: imagesArray };
      trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
      setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
    }
  }
};
















