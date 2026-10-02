import glob
from bs4 import BeautifulSoup

def identify_seasons():
    html_files = sorted(glob.glob('scraper/raw_berichte*.html'))
    for hf in html_files:
        with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            # Look for h1, h2, h3, title, select or options
            title = soup.find('title')
            headings = [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3', 'h4'])]
            selected_opts = [o.get_text(strip=True) for o in soup.find_all('option', selected=True)]
            
            print(f"File: {hf}")
            print(f"  Title: {title.get_text(strip=True) if title else 'None'}")
            print(f"  Headings: {headings[:3]}")
            print(f"  Selected Options: {selected_opts[:3]}")
            print()

if __name__ == '__main__':
    identify_seasons()
