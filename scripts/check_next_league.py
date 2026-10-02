import json, glob, re
from bs4 import BeautifulSoup

def check_leagues():
    with open('Website/data/leagues.json', 'r', encoding='utf-8') as fp:
        current_leagues = json.load(fp)

    print('========================================================================')
    print('                 CURRENT INGESTED LEAGUES IN DATABASE                   ')
    print('========================================================================')
    for l in current_leagues:
        print(f"#{l['id']:<2} {l['name']:<18} ({l['year']}) -> seasonKey: {l['seasonKey']}")

    print('\n========================================================================')
    print('                     AVAILABLE SCRAPER FILES AUDIT                      ')
    print('========================================================================')
    for f in sorted(glob.glob('scraper/raw_berichte*.html')):
        with open(f, 'r', encoding='latin-1') as fp:
            soup = BeautifulSoup(fp.read(), 'html.parser')
        text = soup.get_text()
        dates = re.findall(r'\b\d{2}\.\d{2}\.\d{4}\b', text)
        first_d = dates[0] if dates else 'N/A'
        last_d = dates[-1] if dates else 'N/A'
        trs = len(soup.find_all('tr'))
        
        # Check rounds
        rounds = []
        for tr in soup.find_all('tr'):
            txt = tr.get_text().strip()
            m = re.search(r'(\d+)\.\s*Runde', txt)
            if m:
                rounds.append(int(m.group(1)))
        
        # Check teams
        teams = set()
        for tr in soup.find_all('tr'):
            tds = [td.get_text().strip() for td in tr.find_all(['td', 'th'])]
            if '-' in tds:
                dash_idx = tds.index('-')
                if 0 < dash_idx < len(tds) - 1:
                    teams.add(tds[dash_idx - 1])
                    teams.add(tds[dash_idx + 1])
                    
        r_str = f"Runden 1-{max(rounds)}" if rounds else "Keine Runden"
        print(f"{f:<28} | {trs:>3} TRs | {len(teams):>2} Teams | {r_str:<12} | {first_d} bis {last_d}")

if __name__ == '__main__':
    check_leagues()
