import json
import re
from bs4 import BeautifulSoup

with open('scraper/raw_berichte_13.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

html = raw['html']
soup = BeautifulSoup(html, 'html.parser')

rows = soup.find_all('tr')
print(f"Total rows in HTML: {len(rows)}")

# Check details_315
d315 = soup.find('tr', id='details_315')
if d315:
    print("details_315 text:", repr(d315.get_text()))
    print("details_315 html:", d315.prettify())
