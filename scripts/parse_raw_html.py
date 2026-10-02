import json
import glob
from bs4 import BeautifulSoup
import re

def parse_html_berichte():
    print("=========================================================")
    print("PARSING RAW OFFICIAL HTML BERICHTE FILES")
    print("=========================================================\n")
    
    html_files = sorted(glob.glob('scraper/raw_berichte*.html'))
    
    scraped_matches = []
    
    for hf in html_files:
        with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
            html_text = f.read()
            soup = BeautifulSoup(html_text, 'html.parser')
            
            # Look for round titles, match rows, etc.
            # In DSG portal, let's see how match rows are structured
            for tr in soup.find_all('tr'):
                text = tr.get_text(" | ", strip=True)
                # Check if it has a score pattern like \d+:\d+
                if re.search(r'\b\d+\s*:\s*\d+\b', text):
                    scraped_matches.append((hf, text))

    print(f"Total rows with match scores found in raw HTML files: {len(scraped_matches)}")
    print("\nSample rows from raw HTML:")
    for hf, row in scraped_matches[:15]:
        print(f"  [{hf}] {row}")

if __name__ == '__main__':
    parse_html_berichte()
