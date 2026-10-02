import glob
import re
from bs4 import BeautifulSoup

for f in sorted(glob.glob('scraper/raw_berichte*.html')):
    content = open(f, 'r', encoding='latin-1').read()
    soup = BeautifulSoup(content, 'html.parser')
    trs = soup.find_all('tr')
    teams = set()
    match_count = 0
    for tr in trs:
        tds = [td.get_text().strip() for td in tr.find_all(['td', 'th'])]
        if '-' in tds:
            idx = tds.index('-')
            if 0 < idx < len(tds) - 1:
                teams.add(tds[idx-1])
                teams.add(tds[idx+1])
                match_count += 1
    dates = re.findall(r'\b\d{1,2}\.\d{1,2}\.(?:20)?(2[0-9])\b', content)
    yr_set = sorted(list(set(dates)))
    print(f"=== {f} ===")
    print(f"  Years: {yr_set}, Matches: {match_count}")
    print(f"  Teams ({len(teams)}): {sorted(list(teams))}")
