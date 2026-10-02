import re
from bs4 import BeautifulSoup
from collections import defaultdict

def audit_raw_berichte_13():
    with open('scraper/raw_berichte_13.html', 'r', encoding='latin-1') as fp:
        html = fp.read()

    soup = BeautifulSoup(html, 'html.parser')
    trs = soup.find_all('tr')

    current_round = None
    current_round_header = None
    rounds_data = {}
    matches_list = []

    for i, tr in enumerate(trs):
        txt = tr.get_text().strip()
        r_match = re.search(r'(\d+)\.\s*Runde\s*\(([\s\S]*?)\)', txt)
        if r_match:
            current_round = int(r_match.group(1))
            raw_dates = re.sub(r'\s+', ' ', r_match.group(2)).strip()
            current_round_header = f"{current_round}. Runde ({raw_dates})"
            rounds_data[current_round] = {
                'round': current_round,
                'header': current_round_header,
                'dates_raw': raw_dates,
                'matches': []
            }
            continue

        tds = tr.find_all(['td', 'th'])
        texts = [td.get_text().strip() for td in tds]
        if '-' in texts:
            dash_idx = texts.index('-')
            if 0 < dash_idx < len(texts) - 1:
                home = texts[dash_idx - 1]
                away = texts[dash_idx + 1]
                date_cell = texts[0]
                score_cell = texts[dash_idx + 2] if len(texts) > dash_idx + 2 else ''
                
                details_row = trs[i+1] if i+1 < len(trs) else None
                details_tds = [td.get_text().strip() for td in details_row.find_all(['td', 'th'])] if details_row else []
                pitch_time = details_tds[0] if details_tds else ''
                home_events = details_tds[1] if len(details_tds) > 1 else ''
                away_events = details_tds[2] if len(details_tds) > 2 else ''

                match_info = {
                    'round': current_round,
                    'date_cell': date_cell,
                    'pitch_time': pitch_time,
                    'home': home,
                    'away': away,
                    'score': score_cell,
                    'home_events': home_events,
                    'away_events': away_events
                }
                if current_round in rounds_data:
                    rounds_data[current_round]['matches'].append(match_info)
                matches_list.append(match_info)

    print('========================================================================')
    print('          DETAILED VERIFICATION & AUDIT OF scraper/raw_berichte_13.html ')
    print('========================================================================\n')
    
    total_goals = 0
    played_matches = 0
    all_dates = []

    for r_num in sorted(rounds_data.keys()):
        r_info = rounds_data[r_num]
        print(f"--- {r_info['header']} [Matches: {len(r_info['matches'])}] ---")
        for m in r_info['matches']:
            all_dates.append(m['date_cell'])
            print(f"  • {m['date_cell']:<12} | {m['pitch_time']:<24} | {m['home']} vs {m['away']} -> {m['score']}")
            
            # Count goals
            sm = re.search(r'(\d+)\s*:\s*(\d+)', m['score'])
            if sm:
                played_matches += 1
                total_goals += int(sm.group(1)) + int(sm.group(2))
        print()

    print('========================================================================')
    print('SUMMARY STATS FOR raw_berichte_13.html:')
    print(f'Total Rounds Found: {len(rounds_data)}')
    print(f'Total Matches: {len(matches_list)}')
    print(f'Played Matches: {played_matches}')
    print(f'Total Goals: {total_goals}')
    print(f'Distinct Dates Count: {len(set(all_dates))}')
    print('========================================================================')

if __name__ == '__main__':
    audit_raw_berichte_13()
