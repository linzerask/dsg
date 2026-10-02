from analyze_2026_2027 import analyze_2026_2027
from bs4 import BeautifulSoup
import re

matches, teams, scorers, cards = analyze_2026_2027()

with open('scraper/raw_berichte_14.html', 'r', encoding='latin-1') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

for m in matches:
    if m['status'] == 'Gespielt' and ':' in m['score'] and m['score'] != '-:-':
        hg, ag = [int(x) for x in m['score'].split(':')]
        h_goals = sum(1 for e in m['events'] if e['type'] == 'goal' and e.get('team') == m['home'])
        a_goals = sum(1 for e in m['events'] if e['type'] == 'goal' and e.get('team') == m['away'])
        if hg != h_goals or ag != a_goals:
            print(f"\nMISMATCH in {m['round']}: {m['home']} {m['score']} {m['away']}")
            print(f"  Home expected: {hg}, got {h_goals}")
            print(f"  Away expected: {ag}, got {a_goals}")
            print(f"  Events recorded: {[e['name'] for e in m['events'] if e['type'] == 'goal']}")

