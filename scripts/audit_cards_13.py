import re
from bs4 import BeautifulSoup
from collections import defaultdict

def audit_cards():
    with open('scraper/raw_berichte_13.html', 'r', encoding='latin-1') as fp:
        soup = BeautifulSoup(fp.read(), 'html.parser')

    trs = soup.find_all('tr')
    cards = defaultdict(lambda: {'yellow': 0, 'yellowRed': 0, 'red': 0, 'team': ''})

    for tr in trs:
        d_id = tr.get('id', '')
        if d_id.startswith('details_'):
            tds = tr.find_all('td')
            if len(tds) >= 3:
                for side_idx in [1, 2]:
                    cell = tds[side_idx]
                    html_c = cell.decode_contents()
                    lines = re.split(r'<br\s*/?>', html_c, flags=re.IGNORECASE)
                    for line in lines:
                        if not line.strip(): continue
                        s_line = BeautifulSoup(line, 'html.parser')
                        imgs = s_line.find_all('img')
                        p_name = s_line.get_text(strip=True)
                        if not p_name: continue
                        for img in imgs:
                            alt = img.get('alt', '').lower()
                            src = img.get('src', '').lower()
                            if 'gelb-rot' in alt or 'gelb-rot' in src or 'gelbrot' in alt or 'gelbrot' in src:
                                cards[p_name]['yellowRed'] += 1
                            elif 'rot' in alt or 'rot' in src:
                                cards[p_name]['red'] += 1
                            elif 'gelb' in alt or 'gelb' in src:
                                cards[p_name]['yellow'] += 1

    print('========================================================================')
    print('          DISCIPLINARY CARDS AUDIT (scraper/raw_berichte_13.html)       ')
    print('========================================================================')
    sorted_cards = sorted(cards.items(), key=lambda x: (x[1]['red'] * 5 + x[1]['yellowRed'] * 3 + x[1]['yellow']), reverse=True)
    total_yellow = sum(c['yellow'] for c in cards.values())
    total_yr = sum(c['yellowRed'] for c in cards.values())
    total_red = sum(c['red'] for c in cards.values())
    print(f"Total Card Events: {total_yellow} Gelb, {total_yr} Gelb-Rot, {total_red} Rot across {len(cards)} players\n")
    print("TOP 10 VERWARNUNGEN:")
    for rank, (p, c) in enumerate(sorted_cards[:10], 1):
        print(f"{rank:>2}. {p:<25}: Gelb={c['yellow']}, Gelb-Rot={c['yellowRed']}, Rot={c['red']}")

if __name__ == '__main__':
    audit_cards()
