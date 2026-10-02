import json

def rollback_to_2023_2024():
    print("Rolling back database to up to 2023/2024...")
    
    # 1. liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga = json.load(f)
        
    allowed_seasons = ['2022/2023', '2022/2023_1klasse', '2023/2024']
    liga['seasons'] = {k: v for k, v in liga['seasons'].items() if k in allowed_seasons}
    liga['currentSeason'] = '2023/2024'
    
    with open('Website/data/liga.json', 'w', encoding='utf-8') as f:
        json.dump(liga, f, ensure_ascii=False, indent=2)
    print("Reset Website/data/liga.json to [2022/2023, 2022/2023_1klasse, 2023/2024]")

    # 2. leagues.json
    with open('Website/data/leagues.json', 'r', encoding='utf-8') as f:
        leagues = json.load(f)
        
    leagues = [l for l in leagues if l.get('seasonKey') in allowed_seasons]
    with open('Website/data/leagues.json', 'w', encoding='utf-8') as f:
        json.dump(leagues, f, ensure_ascii=False, indent=2)
    print("Reset Website/data/leagues.json")

    # 3. rounds.json
    with open('Website/data/rounds.json', 'r', encoding='utf-8') as f:
        rounds = json.load(f)
        
    rounds = [r for r in rounds if r.get('seasonKey') in allowed_seasons or r.get('jahr') in allowed_seasons]
    with open('Website/data/rounds.json', 'w', encoding='utf-8') as f:
        json.dump(rounds, f, ensure_ascii=False, indent=2)
    print(f"Reset Website/data/rounds.json to {len(rounds)} rounds")

if __name__ == '__main__':
    rollback_to_2023_2024()
