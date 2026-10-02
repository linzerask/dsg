import json
import glob
from bs4 import BeautifulSoup

def inspect_html_and_exports():
    # 1. Inspect export_1790446619908.json
    with open('scraper/export_1790446619908.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"export_1790446619908.json is a {type(data)} with {len(data)} items")
    if isinstance(data, list) and len(data) > 0:
        print("Sample item:", list(data[0].keys()) if isinstance(data[0], dict) else data[0])
        # Count goals in export
        exp_goals = 0
        exp_played = 0
        for item in data:
            sc = item.get('score', '')
            if sc and ':' in sc and sc != '-:-':
                try:
                    p = sc.split('(')[0].split(':')
                    exp_goals += int(p[0].strip()) + int(p[1].strip())
                    exp_played += 1
                except:
                    pass
        print(f"Export has {exp_played} played matches with {exp_goals} goals")

    # 2. Inspect raw HTML files (e.g. raw_berichte_*.html)
    print("\n--- Inspecting raw_berichte_*.html files ---")
    total_html_matches = 0
    total_html_goals = 0
    
    html_files = sorted(glob.glob('scraper/raw_berichte*.html'))
    for hf in html_files:
        with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            # Look for match reports or score cells
            # Find tables or rows
            rows = soup.find_all('tr')
            print(f"{hf}: {len(rows)} table rows")

if __name__ == '__main__':
    inspect_html_and_exports()
