import os
import json

mojibake_patterns = [
    'Ã¼', 'Ã¤', 'Ã¶', 'ÃŸ', 'Ã–', 'Ã„', 'Ãœ', 'Ã©', 'Ã¨', 'Ã ', 'Ã¡', 'Ã³', 'Ã²', 'Ã±', 'Ã§',
    'â€“', 'â€”', 'â€ž', 'â€œ', 'â€™', 'â€˜', 'â€¢', 'â€¦', 'Â', '\ufffd'
]

found = {}

for root, dirs, files in os.walk('Website'):
    for f in files:
        if f.endswith(('.json', '.js', '.html', '.css', '.txt')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                    matches = []
                    for p in mojibake_patterns:
                        count = content.count(p)
                        if count > 0:
                            matches.append(f'{p}: {count}')
                    if matches:
                        found[path] = matches
            except Exception as e:
                pass

for path, m in found.items():
    print(f'{path} -> {m}')
