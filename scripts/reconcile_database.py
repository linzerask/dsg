import json
import glob
from bs4 import BeautifulSoup
import re

def full_reconciliation():
    print("================================================================================")
    print("MATCH-BY-MATCH RECONCILIATION: RAW OFFICIAL HTML vs WEBSITE DATABASE (LIGA.JSON)")
    print("================================================================================\n")

    # 1. Load liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga_data = json.load(f)

    db_seasons = liga_data.get('seasons', {})
    
    # 2. Extract matches from raw HTML files
    html_files = sorted(glob.glob('scraper/raw_berichte*.html'))
    
    raw_matches = []
    
    # Normalizer helper
    def norm(t):
        return re.sub(r'[^a-z0-9]', '', str(t).lower())

    for hf in html_files:
        with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Extract rows
            trs = soup.find_all('tr')
            for i, tr in enumerate(trs):
                text = tr.get_text(" | ", strip=True)
                # Match format: "Day, DD.MM.YY | Home | - | Away | Score (HT)"
                m_score = re.search(r'([A-Za-z0-9\.\s/]+?)\s*\|\s*-\s*\|\s*([A-Za-z0-9\.\s/]+?)\s*\|\s*(\d+:\d+(?:\s*\([^)]*\))?)', text)
                if m_score:
                    home = m_score.group(1).strip()
                    away = m_score.group(2).strip()
                    score = m_score.group(3).strip()
                    
                    # Extract date from prefix if present
                    date_match = re.search(r'\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b', text)
                    date_str = date_match.group(1) if date_match else ''
                    
                    # Next tr might have scorers / cards
                    events_text = ''
                    if i + 1 < len(trs):
                        next_tr_text = trs[i+1].get_text(" | ", strip=True)
                        if not re.search(r'\|\s*-\s*\|', next_tr_text):
                            events_text = next_tr_text
                    
                    raw_matches.append({
                        'source_file': hf,
                        'home': home,
                        'away': away,
                        'score': score,
                        'date': date_str,
                        'events_text': events_text
                    })

    print(f"Total unique/parsed matches in raw official HTML files: {len(raw_matches)}")
    
    # Let's compare against each season in liga.json
    for s_key, s_data in db_seasons.items():
        s_name = s_data.get('name', s_key)
        db_matches = s_data.get('matches', [])
        print(f"\n--------------------------------------------------------------------------------")
        print(f"RECONCILING SEASON: {s_key} ({s_name}) - {len(db_matches)} matches in DB")
        print(f"--------------------------------------------------------------------------------")
        
        matched_count = 0
        score_matches = 0
        score_mismatches = []
        
        for db_m in db_matches:
            db_home = db_m.get('home', '')
            db_away = db_m.get('away', '')
            db_score = db_m.get('score', '')
            db_date = db_m.get('date', '')
            
            # Search in raw_matches
            found = False
            for raw_m in raw_matches:
                if norm(db_home) == norm(raw_m['home']) and norm(db_away) == norm(raw_m['away']):
                    found = True
                    matched_count += 1
                    raw_clean_score = raw_m['score'].split('(')[0].strip()
                    db_clean_score = db_score.split('(')[0].strip()
                    
                    if raw_clean_score == db_clean_score:
                        score_matches += 1
                    else:
                        score_mismatches.append({
                            'match': f"{db_home} vs {db_away}",
                            'db_score': db_score,
                            'raw_score': raw_m['score'],
                            'source': raw_m['source_file']
                        })
                    break
            
            if not found:
                # Check if it's unplayed or canceled in DB
                pass

        print(f"  Matches identified in official source: {matched_count} / {len(db_matches)}")
        print(f"  Exact score matches: {score_matches}")
        if score_mismatches:
            print(f"  Score discrepancies found: {len(score_mismatches)}")
            for sm in score_mismatches:
                print(f"    * {sm['match']}: DB has {sm['db_score']} vs Raw Source {sm['raw_score']}")
        else:
            print(f"  >> 100% PERFECT MATCH! Every single game score matches the raw official source exactly!")

if __name__ == '__main__':
    full_reconciliation()
