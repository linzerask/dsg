import json

with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Current Season:", data.get("currentSeason"))
print("All seasons:", list(data.get("seasons", {}).keys()))

for sKey, sData in data.get("seasons", {}).items():
    stats = sData.get("stats", {})
    topScorers = stats.get("topScorers", [])
    cards = stats.get("cards", [])
    matches = sData.get("matches", [])
    playedMatches = [m for m in matches if m.get("score") and m.get("score") != "-:-"]
    matchesWithScorers = [m for m in matches if m.get("scorers") or (m.get("events") and any(e.get("type") == "goal" for e in m.get("events", [])))]
    matchesWithCards = [m for m in matches if m.get("cards") or (m.get("events") and any(e.get("type") in ["yellow", "yellowRed", "red"] for e in m.get("events", [])))]
    print(f"Season '{sKey}':")
    print(f"  Teams count: {len(sData.get('teams', []))}")
    print(f"  Matches count: {len(matches)} (played: {len(playedMatches)}, withScorers: {len(matchesWithScorers)}, withCards: {len(matchesWithCards)})")
    print(f"  stats.topScorers count: {len(topScorers)}")
    print(f"  stats.cards count: {len(cards)}")
