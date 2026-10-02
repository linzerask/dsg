import glob
import os

OLD_VER = '1790560060000'
NEW_VER = '1790560070000'

# 1. Update store.js
with open('Website/js/store.js', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(f'?v={OLD_VER}', f'?v={NEW_VER}')
code = code.replace('dsg_data_v76', 'dsg_data_v77')
code = code.replace("loadLocal('dsg_data', 76)", "loadLocal('dsg_data', 77)")
code = code.replace('if (i !== 76) localStorage.removeItem(`dsg_data_v${i}`)', 'if (i !== 77) localStorage.removeItem(`dsg_data_v${i}`)')

code = code.replace('dsg_admin_leagues_v32', 'dsg_admin_leagues_v33')
code = code.replace("loadLocal('dsg_admin_leagues', 32)", "loadLocal('dsg_admin_leagues', 33)")
code = code.replace('if (i !== 32) localStorage.removeItem(`dsg_admin_leagues_v${i}`)', 'if (i !== 33) localStorage.removeItem(`dsg_admin_leagues_v${i}`)')

code = code.replace('dsg_admin_rounds_v31', 'dsg_admin_rounds_v32')
code = code.replace("loadLocal('dsg_admin_rounds', 31)", "loadLocal('dsg_admin_rounds', 32)")
code = code.replace('if (i !== 31) localStorage.removeItem(`dsg_admin_rounds_v${i}`)', 'if (i !== 32) localStorage.removeItem(`dsg_admin_rounds_v${i}`)')

code = code.replace('currentSeason: "2024/2025"', 'currentSeason: "2025/2026"')

with open('Website/js/store.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated store.js")

# 2. Update all js and html files in Website/
js_files = glob.glob('Website/**/*.js', recursive=True) + glob.glob('Website/*.html')
count = 0
for fpath in js_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if OLD_VER in content:
        content = content.replace(OLD_VER, NEW_VER)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Updated query string in {fpath}")

print(f"Total files updated: {count}")
