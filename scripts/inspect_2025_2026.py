import re
from bs4 import BeautifulSoup
from collections import defaultdict

def analyze_season_2025_2026():
    with open('scraper/raw_berichte_13.html', 'r', encoding='latin-1') as fp:
        soup = BeautifulSoup(fp.read(), 'html.parser')

    trs = soup.find_all('tr')
    current_round = None
    matches = []

    for i, tr in enumerate(trs):
        txt = tr.get_text().strip()
        r_match = re.search(r'(\d+)\.\s*Runde\s*\(([\s\S]*?)\)', txt)
        if r_match:
            current_round = int(r_match.group(1))
            continue
        
        tds = tr.find_all(['td', 'th'])
        texts = [td.get_text().strip() for td in tds]
        if '-' in texts:
            dash_idx = texts.index('-')
            if dash_idx > 0 and dash_idx < len(texts) - 1:
                home = texts[dash_idx - 1]
                away = texts[dash_idx + 1]
                date_col = texts[0]
                score_col = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                
                details_row = trs[i+1] if i+1 < len(trs) else None
                
                matches.append({
                    'round': current_round,
                    'home': home,
                    'away': away,
                    'date': date_col,
                    'score': score_col,
                    'details_row': details_row
                })

    teams = defaultdict(lambda: {'sp': 0, 's': 0, 'u': 0, 'n': 0, 'tf': 0, 'ta': 0, 'pts': 0})
    scorers = defaultdict(int)

    for m in matches:
        score = m['score']
        home = m['home']
        away = m['away']
        
        sm = re.search(r'(\d+)\s*:\s*(\d+)', score)
        if sm:
            h_g = int(sm.group(1))
            a_g = int(sm.group(2))
            teams[home]['sp'] += 1
            teams[away]['sp'] += 1
            teams[home]['tf'] += h_g
            teams[home]['ta'] += a_g
            teams[away]['tf'] += a_g
            teams[away]['ta'] += h_g
            if h_g > a_g:
                teams[home]['s'] += 1
                teams[home]['pts'] += 3
                teams[away]['n'] += 1
            elif h_g == a_g:
                teams[home]['u'] += 1
                teams[home]['pts'] += 1
                teams[away]['u'] += 1
                teams[away]['pts'] += 1
            else:
                teams[away]['s'] += 1
                teams[away]['pts'] += 3
                teams[home]['n'] += 1
                
        # parse detail tds
        if m['details_row']:
            tds = m['details_row'].find_all('td')
            if len(tds) >= 3:
                for side_idx in [1, 2]:
                    cell = tds[side_idx]
                    for node in cell.children:
                        if isinstance(node, str):
                            pname = node.strip()
                            if pname and not pname.startswith('(') and len(pname) > 2:
                                scorers[pname] += 1

    print('========================================================================')
    print('                      SEASON 2025/2026 AUDIT REPORT                     ')
    print('========================================================================')
    print(f'Total Rounds: 14 | Total Matches: {len(matches)}')
    print('------------------------------------------------------------------------')
    print('TABELLE (STANDINGS):')
    sorted_teams = sorted(teams.items(), key=lambda x: (x[1]['pts'], x[1]['tf'] - x[1]['ta'], x[1]['tf']), reverse=True)
    for rank, (t_name, st) in enumerate(sorted_teams, 1):
        diff = st['tf'] - st['ta']
        diff_str = f'+{diff}' if diff > 0 else str(diff)
        print(f"{rank}. {t_name:<22} {st['sp']} Sp | {st['s']} S {st['u']} U {st['n']} N | Tore {st['tf']}:{st['ta']} ({diff_str:>3}) | {st['pts']} Pkt")

    print('------------------------------------------------------------------------')
    print('TOP 10 TORSCHÜTZEN (TOP SCORERS):')
    top_s = sorted(scorers.items(), key=lambda x: x[1], reverse=True)[:10]
    for r, (p, g) in enumerate(top_s, 1):
        print(f"{r:>2}. {p:<25} : {g} Tore")
    print('========================================================================')

if __name__ == '__main__':
    analyze_season_2025_2026()
