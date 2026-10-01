import json

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)
with open('Website/data/rounds.json', 'r', encoding='utf-8') as f:
    rounds = json.load(f)
with open('Website/data/leagues.json', 'r', encoding='utf-8') as f:
    leagues = json.load(f)

print("=== CURRENT STATE IN WEBSITE DATABASE ===")
for sk in ['2022/2023', '2022/2023_1klasse']:
    sdata = liga.get('seasons', {}).get(sk, {})
    matches = sdata.get('matches', [])
    rounds_for_s = [r for r in rounds if r.get('seasonKey') == sk]
    print(f"\nSeason '{sk}':")
    print(f"  - Matches on website: {len(matches)}")
    print(f"  - Rounds on website: {len(rounds_for_s)} rounds ({', '.join([str(r.get('runde')) for r in rounds_for_s])})")
    
    # Check rounds breakdown in matches
    rounds_in_matches = {}
    for m in matches:
        r = m.get('round', 'Unknown')
        rounds_in_matches[r] = rounds_in_matches.get(r, 0) + 1
    print(f"  - Matches by round on website: {rounds_in_matches}")

print("\n=== WHAT IS IN THE SCRAPED RAW ARCHIVE FOR 2022/2023 ===")
# DSG Liga 2022/2023:
# Hinrunde: raw_berichte_1.json (28 matches, 7 rounds)
# Rückrunde: raw_berichte_3.json (28 matches, 7 rounds, Headers #17, #19, #23, #25, #27, #29, #31)
# Total: 14 rounds, 56 matches

# 1. Klasse 2022/2023:
# Hinrunde: raw_berichte_2.json (28 matches, 7 rounds)
# Rückrunde: raw_berichte_4.json (21 matches, 7 rounds)
# Total: 14 rounds, 49 matches

print("1. DSG Liga 2022/2023:")
print("   - Raw Hinrunde (Autumn 2022): 7 Rounds, 28 Matches (already on website)")
print("   - Raw Rückrunde (Spring 2023): 7 Rounds (Rounds 8-14), 28 Matches (MISSING on website!)")
print("   - Full Season Total: 14 Rounds, 56 Matches")

print("\n2. 1. Klasse 2022/2023:")
print("   - Raw Hinrunde (Autumn 2022): 7 Rounds, 28 Matches (partially on website, currently has 21 matches)")
print("   - Raw Rückrunde (Spring 2023): 7 Rounds (Rounds 8-14), 21 Matches (MISSING on website!)")
print("   - Full Season Total: 14 Rounds, 49 Matches")
