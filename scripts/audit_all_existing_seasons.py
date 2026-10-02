import json
import re
from bs4 import BeautifulSoup
from collections import defaultdict

def extract_scorers_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
        soup = BeautifulSoup(fp.read(), 'html.parser')

    trs = soup.find_all('tr')
    scorers = defaultdict(int)
    matches_info = []

    for i, tr in enumerate(trs):
        # check details row
        d_id = tr.get('id', '')
        if d_id.startswith('details_') or 'details' in tr.get('class', []):
            tds = tr.find_all('td')
            if len(tds) >= 3:
                for side_idx in [1, 2]:
                    cell = tds[side_idx]
                    html_c = cell.decode_contents()
                    lines = re.split(r'<br\s*/?>', html_c, flags=re.IGNORECASE)
                    for line in lines:
                        if not line.strip(): continue
                        s_line = BeautifulSoup(line, 'html.parser')
                        tor_imgs = s_line.find_all('img', alt=lambda x: x and 'tor' in x.lower())
                        p_name = s_line.get_text(strip=True)
                        p_name = re.sub(r'\s+', ' ', p_name).strip()
                        if p_name and len(tor_imgs) > 0:
                            scorers[p_name] += len(tor_imgs)
        else:
            # check if details are in the next row
            tds = tr.find_all(['td', 'th'])
            texts = [td.get_text().strip() for td in tds]
            if '-' in texts and len(tds) >= 4:
                dash_idx = texts.index('-')
                if 0 < dash_idx < len(texts) - 1:
                    score = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                    home = texts[dash_idx - 1]
                    away = texts[dash_idx + 1]
                    matches_info.append({'home': home, 'away': away, 'score': score, 'row_idx': i})

    return scorers

def run_full_audit():
    with open('Website/data/liga.json', 'r', encoding='utf-8') as fp:
        db = json.load(fp)

    print('========================================================================')
    print('          COMPREHENSIVE AUDIT OF ALL EXISTING INGESTED SEASONS          ')
    print('========================================================================\n')

    # 1. Season 2022/2023 (DSG Liga)
    # Source: raw_berichte_1.html (Herbst 2022) + raw_berichte_2.html (Frühjahr 2023)
    s22_h = extract_scorers_from_html('scraper/raw_berichte_1.html')
    s22_f = extract_scorers_from_html('scraper/raw_berichte_2.html')
    s22_html = defaultdict(int)
    for p, g in s22_h.items(): s22_html[p] += g
    for p, g in s22_f.items(): s22_html[p] += g

    db_22 = {s['name']: s['goals'] for s in db['seasons']['2022/2023']['stats']['topScorers']}
    print('1. SEASON 2022/2023 (DSG Liga):')
    print(f'   HTML Total Goals from Scorers: {sum(s22_html.values())} across {len(s22_html)} unique scorers')
    print(f'   DB Total Goals from Scorers:   {sum(db_22.values())} across {len(db_22)} unique scorers')
    diff_22 = []
    for p, g in sorted(s22_html.items(), key=lambda x: x[1], reverse=True)[:15]:
        db_g = db_22.get(p, 0)
        status = 'MATCH' if db_g == g else f'DIFF (HTML={g} vs DB={db_g})'
        if db_g != g: diff_22.append((p, g, db_g))
        print(f'   • {p:<24}: HTML={g:>2} | DB={db_g:>2} -> {status}')
    print(f'   Result: {"PERFECT MATCH" if not diff_22 else f"Found {len(diff_22)} differences"}\n')

    # 2. Season 2022/2023 1. Klasse
    # Source: raw_berichte_4.html (Frühjahr 2023 1. Klasse) + raw_berichte_3.html (Herbst 2022 1. Klasse)
    s22_1k_4 = extract_scorers_from_html('scraper/raw_berichte_4.html')
    # Let's check raw_berichte_3.html for 1. klasse part or full
    s22_1k_3 = extract_scorers_from_html('scraper/raw_berichte_3.html')
    db_22_1k = {s['name']: s['goals'] for s in db['seasons']['2022/2023_1klasse']['stats']['topScorers']}
    print('2. SEASON 2022/2023_1klasse (1. Klasse):')
    print(f'   DB Total Goals from Scorers: {sum(db_22_1k.values())} across {len(db_22_1k)} unique scorers')
    for p, g in sorted(db_22_1k.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f'   • {p:<24}: DB={g:>2} Tore')
    print()

    # 3. Season 2023/2024 (DSG Liga)
    # Source: raw_berichte_3.html (Herbst 2023) + raw_berichte_5.html (Frühjahr 2024)
    s23_5 = extract_scorers_from_html('scraper/raw_berichte_5.html')
    db_23 = {s['name']: s['goals'] for s in db['seasons']['2023/2024']['stats']['topScorers']}
    print('3. SEASON 2023/2024 (DSG Liga):')
    print(f'   DB Total Goals from Scorers: {sum(db_23.values())} across {len(db_23)} unique scorers')
    for p, g in sorted(db_23.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f'   • {p:<24}: DB={g:>2} Tore')
    print()

    # 4. Seasons 2024/2025 (Grunddurchgang, Oberes, Unteres)
    print('4. SEASON 2024/2025 (All 3 Competitions):')
    for s_key in ['2024/2025', '2024/2025_oberes', '2024/2025_unteres']:
        db_s = {s['name']: s['goals'] for s in db['seasons'][s_key]['stats']['topScorers']}
        print(f'   [{s_key}] Total Goals: {sum(db_s.values())} | Scorers: {len(db_s)}')
        top3 = [(p, g) for p, g in sorted(db_s.items(), key=lambda x: x[1], reverse=True)[:3]]
        print(f'      Top 3: {top3}')

if __name__ == '__main__':
    run_full_audit()
