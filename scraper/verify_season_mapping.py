import json
import os
import re

# Load all 5 files
def load_file(fname):
    with open(os.path.join('scraper', fname), 'r', encoding='utf-8') as f:
        return json.load(f)

d1 = load_file('raw_berichte_1.json')
d2 = load_file('raw_berichte_2.json')
d3 = load_file('raw_berichte_3.json')
d4 = load_file('raw_berichte_4.json')
d5 = load_file('raw_berichte_5.json')

print("Loaded all 5 files successfully!")
