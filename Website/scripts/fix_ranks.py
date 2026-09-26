import json

with open('data/liga.json', 'r', encoding='utf-8') as f:
    liga = json.load(f)

scorers = liga['stats']['topScorers']

# We assume scorers are already sorted by goals descending.
# We will use dense ranking.
current_rank = 1
current_goals = -1

for scorer in scorers:
    if current_goals == -1:
        current_goals = scorer['goals']
    
    if scorer['goals'] < current_goals:
        current_rank += 1
        current_goals = scorer['goals']
        
    scorer['rank'] = current_rank

with open('data/liga.json', 'w', encoding='utf-8') as f:
    json.dump(liga, f, indent=2, ensure_ascii=False)
