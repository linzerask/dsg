import os
import re

def check_file(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()
    
    # Try decoding as utf-8
    try:
        text = raw_bytes.decode('utf-8')
    except Exception as e:
        print(f"Error decoding {filepath} as utf-8: {e}")
        return

    # Check for common mojibake patterns
    # In UTF-8, Ã followed by various bytes is typical mojibake of 2-byte UTF-8 sequences (C3 xx)
    # Also \ufffd, Â, â€
    patterns = [
        r'Ã[\x80-\xbf]',
        r'â[\x80-\xbf]{2}',
        r'Â[\xa0-\xff]',
        r'[\ufffd\x7f-\x9f]'
    ]
    
    found_mojibake = []
    for line_no, line in enumerate(text.splitlines(), 1):
        for pat in patterns:
            matches = re.findall(pat, line)
            if matches:
                found_mojibake.append((line_no, line[:100], matches))
                break
                
    if found_mojibake:
        print(f"=== {filepath} has {len(found_mojibake)} suspect lines ===")
        for lno, snippet, m in found_mojibake[:10]:
            print(f"  Line {lno}: {snippet} -> {m}")

print("Scanning Website folder...")
for root, dirs, files in os.walk('Website'):
    for f in files:
        if f.endswith(('.json', '.js', '.html', '.css')):
            check_file(os.path.join(root, f))

print("Scanning scraper folder...")
for root, dirs, files in os.walk('scraper'):
    for f in files:
        if f.endswith(('.json', '.js', '.html', '.py')):
            check_file(os.path.join(root, f))
