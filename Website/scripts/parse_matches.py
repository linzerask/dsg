import json

data_raw = """
1. Runde (29.08. - 24.10.2025)
Fr, 29.08.25 DSG St. Josef/Oed FC - Walker FC 4:1 (2:0)
Fr, 29.08.25 DSG Union Traun - FC Linzenbach 3:5 (1:2)
Sa, 30.08.25 SV Croatia Linz - FC Gornjak 3:0* Abgesagt
Fr, 24.10.25 Union Eschenau - Union Heiligenberg 4:6 (2:3)
2. Runde (05.09. - 18.10.2025)
Fr, 05.09.25 DSG St. Josef/Oed FC - FC Linzenbach 2:2 (1:2)
Fr, 05.09.25 Union Eschenau - Walker FC 6:2 (3:1)
Sa, 06.09.25 SV Croatia Linz - DSG Union Traun 5:2 (2:2)
Sa, 18.10.25 FC Gornjak - Union Heiligenberg 0:4 (0:1)
3. Runde (12.09. - 13.09.2025)
Fr, 12.09.25 FC Linzenbach - Walker FC 3:3 (1:2)
Fr, 12.09.25 DSG Union Traun - Union Eschenau 2:2 (1:2)
Fr, 12.09.25 Union Heiligenberg - SV Croatia Linz 2:2 (1:1)
Sa, 13.09.25 FC Gornjak - DSG St. Josef/Oed FC 0:7 (0:2)
4. Runde (19.09. - 20.09.2025)
Fr, 19.09.25 DSG Union Traun - FC Gornjak 2:7 (1:3)
Sa, 20.09.25 Walker FC - SV Croatia Linz 1:5 (1:2)
Sa, 20.09.25 FC Linzenbach - Union Eschenau 3:0 (1:0)
Sa, 20.09.25 Union Heiligenberg - DSG St. Josef/Oed FC 3:3 (2:1)
5. Runde (02.09. - 25.10.2025)
Di, 02.09.25 Walker FC - FC Gornjak 4:2 (3:1)
Sa, 27.09.25 Union Heiligenberg - DSG Union Traun 8:0 (4:0)
Fr, 17.10.25 Union Eschenau - DSG St. Josef/Oed FC 0:2 (0:0)
Sa, 25.10.25 SV Croatia Linz - FC Linzenbach 7:4 (3:1)
6. Runde (03.10. - 04.10.2025)
Fr, 03.10.25 Union Heiligenberg - FC Linzenbach 3:6 (1:4)
Fr, 03.10.25 DSG Union Traun - Walker FC 0:4 (0:2)
Sa, 04.10.25 SV Croatia Linz - DSG St. Josef/Oed FC 2:2 (2:1)
Sa, 04.10.25 FC Gornjak - Union Eschenau 4:3 (1:1)
7. Runde (10.10. - 11.10.2025)
Fr, 10.10.25 Union Eschenau - SV Croatia Linz 2:4 (1:3)
Sa, 11.10.25 DSG St. Josef/Oed FC - DSG Union Traun 2:1 (0:1)
Sa, 11.10.25 Walker FC - Union Heiligenberg 1:3 (1:1)
Sa, 11.10.25 FC Linzenbach - FC Gornjak 3:1 (1:1)
8. Runde (10.04. - 11.04.2026)
Fr, 10.04.26 Union Eschenau - DSG Union Traun 5:3 (0:2)
Sa, 11.04.26 DSG St. Josef/Oed FC - FC Gornjak 3:0* Abgesagt
Sa, 11.04.26 Walker FC - FC Linzenbach 2:4 (1:2)
Sa, 11.04.26 SV Croatia Linz - Union Heiligenberg 5:2 (1:1)
9. Runde (17.04. - 18.04.2026)
Fr, 17.04.26 DSG Union Traun - SV Croatia Linz 0:9 (0:4)
Sa, 18.04.26 FC Linzenbach - DSG St. Josef/Oed FC 1:3 (1:3)
Sa, 18.04.26 Walker FC - Union Eschenau 4:3 (2:1)
Sa, 18.04.26 Union Heiligenberg - FC Gornjak 5:1 (2:1)
10. Runde (24.04. - 25.04.2026)
Fr, 24.04.26 SV Croatia Linz - Walker FC 3:0* Abgesagt
Fr, 24.04.26 Union Eschenau - FC Linzenbach 1:6 (1:4)
Sa, 25.04.26 FC Gornjak - DSG Union Traun 1:4 (0:1)
Sa, 25.04.26 DSG St. Josef/Oed FC - Union Heiligenberg 4:0 (4:0)
11. Runde (01.05. - 14.05.2026)
Fr, 01.05.26 DSG Union Traun - DSG St. Josef/Oed FC 0:3* Abgesagt
Sa, 02.05.26 FC Gornjak - FC Linzenbach 3:2 (1:0)
Sa, 02.05.26 SV Croatia Linz - Union Eschenau 3:0* Abgesagt
Mi, 13.05.26 Union Heiligenberg - Walker FC 2:2 (1:0)
12. Runde (08.05. - 09.05.2026)
Fr, 08.05.26 DSG Union Traun - Union Heiligenberg 0:6 (0:1)
Sa, 09.05.26 FC Gornjak - Walker FC 1:5 (1:3)
Sa, 09.05.26 DSG St. Josef/Oed FC - Union Eschenau 7:0 (2:0)
Fr, 15.05.26 FC Linzenbach - SV Croatia Linz 1:3 (1:2)
13. Runde (22.05. - 23.05.2026)
Fr, 22.05.26 Walker FC - DSG Union Traun 3:3 (1:2)
Fr, 22.05.26 FC Linzenbach - Union Heiligenberg 2:1 (0:0)
Fr, 22.05.26 Union Eschenau - FC Gornjak 1:8 (1:6)
Fr, 12.06.26 DSG St. Josef/Oed FC - SV Croatia Linz 2:7 (1:0)
14. Runde (29.05. - 30.05.2026)
Fr, 29.05.26 FC Linzenbach - DSG Union Traun 2:3 (2:2)
Sa, 30.05.26 Walker FC - DSG St. Josef/Oed FC 1:5 (0:2)
Sa, 30.05.26 FC Gornjak - SV Croatia Linz 1:5 (0:4)
Mi, 03.06.26 Union Heiligenberg - Union Eschenau 5:2 (3:2)
"""

import re
matches_data = []
current_round = ""
for line in data_raw.splitlines():
    line = line.strip()
    if not line: continue
    if "Runde" in line:
        # Match Runde line like "1. Runde (29.08. - 24.10.2025)"
        current_round = line
    else:
        # Match: Fr, 29.08.25 DSG St. Josef/Oed FC - Walker FC 4:1 (2:0)
        # Or: Sa, 30.08.25 SV Croatia Linz - FC Gornjak 3:0* Abgesagt
        parts = line.split(" - ")
        if len(parts) == 2:
            left_side = parts[0].strip()
            right_side = parts[1].strip()
            
            # Left side: Date + Home Team
            # 'Fr, 29.08.25 DSG St. Josef/Oed FC'
            date_match = re.match(r'([a-zA-Z]{2},\s\d{2}\.\d{2}\.\d{2})\s+(.+)', left_side)
            date = date_match.group(1) if date_match else ""
            home_team = date_match.group(2) if date_match else left_side
            
            # Right side: Away Team + Score
            # 'Walker FC 4:1 (2:0)'
            # 'FC Gornjak 3:0* Abgesagt'
            score_match = re.search(r'\s+(\d+:\d+\*?(?:\s+[a-zA-Z()0-9:]+)*)$', right_side)
            if score_match:
                score = score_match.group(1).strip()
                away_team = right_side[:score_match.start()].strip()
            else:
                score = ""
                away_team = right_side
                
            matches_data.append({
                "round": current_round,
                "date": date,
                "home": home_team,
                "away": away_team,
                "score": score
            })

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

liga['matches'] = matches_data

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
