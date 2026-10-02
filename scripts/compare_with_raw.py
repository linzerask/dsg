import json
import glob

def compare_with_raw():
    print("=== COMPARISON WITH ORIGINAL SCRAPED DATA ===")
    
    # Check parsed_season_2022.json
    with open('scraper/parsed_season_2022.json', 'r', encoding='utf-8') as f:
        s22 = json.load(f)
    print(f"scraper/parsed_season_2022.json: {len(s22.get('matches', []))} matches, {len(s22.get('teams', []))} teams")
    s22_goals = 0
    for m in s22.get('matches', []):
        sc = m.get('score', '')
        if sc and ':' in sc and sc != '-:-':
            p = sc.split('(')[0].split(':')
            s22_goals += int(p[0]) + int(p[1])
    print(f"  -> Goals in parsed_season_2022: {s22_goals}")

    # Check parsed_2022_2023_1klasse.json
    with open('scraper/parsed_2022_2023_1klasse.json', 'r', encoding='utf-8') as f:
        s1k = json.load(f)
    print(f"scraper/parsed_2022_2023_1klasse.json: {len(s1k.get('matches', []))} matches, {len(s1k.get('teams', []))} teams")
    s1k_goals = 0
    for m in s1k.get('matches', []):
        sc = m.get('score', '')
        if sc and ':' in sc and sc != '-:-':
            p = sc.split('(')[0].split(':')
            s1k_goals += int(p[0]) + int(p[1])
    print(f"  -> Goals in parsed_2022_2023_1klasse: {s1k_goals}")

    print(f"\nSum of goals from both scraped raw seasons: {s22_goals} + {s1k_goals} = {s22_goals + s1k_goals}")

if __name__ == '__main__':
    compare_with_raw()
