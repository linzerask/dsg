import glob
import re

OLD_VER = '1790560070000'
NEW_VER = '1790560080000'

# 1. Update store.js
with open('Website/js/store.js', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(f'?v={OLD_VER}', f'?v={NEW_VER}')
code = code.replace('dsg_data_v77', 'dsg_data_v78')
code = code.replace("loadLocal('dsg_data', 77)", "loadLocal('dsg_data', 78)")
code = code.replace('if (i !== 77) localStorage.removeItem(`dsg_data_v${i}`)', 'if (i !== 78) localStorage.removeItem(`dsg_data_v${i}`)')

code = code.replace('dsg_admin_leagues_v33', 'dsg_admin_leagues_v34')
code = code.replace("loadLocal('dsg_admin_leagues', 33)", "loadLocal('dsg_admin_leagues', 34)")
code = code.replace('if (i !== 33) localStorage.removeItem(`dsg_admin_leagues_v${i}`)', 'if (i !== 34) localStorage.removeItem(`dsg_admin_leagues_v${i}`)')

code = code.replace('dsg_admin_rounds_v32', 'dsg_admin_rounds_v33')
code = code.replace("loadLocal('dsg_admin_rounds', 32)", "loadLocal('dsg_admin_rounds', 33)")
code = code.replace('if (i !== 32) localStorage.removeItem(`dsg_admin_rounds_v${i}`)', 'if (i !== 33) localStorage.removeItem(`dsg_admin_rounds_v${i}`)')

code = code.replace('currentSeason: "2025/2026"', 'currentSeason: "2023/2024"')

# Replace fallback leagues in getAdminLeaguesSync
leagues_fallback_target = """    return sortLeaguesByPriority([
      { id: 1, name: "DSG Liga", year: "2022/2023", seasonKey: "2022/2023", status: "Aktiv", showOnHomepage: true },
      { id: 2, name: "1. Klasse", year: "2022/2023", seasonKey: "2022/2023_1klasse", status: "Aktiv", showOnHomepage: true },
      { id: 3, name: "DSG Liga", year: "2023/2024", seasonKey: "2023/2024", status: "Aktiv", showOnHomepage: true }
    ]);"""

code = re.sub(r'return sortLeaguesByPriority\(\[\s*\{ id: 1.*?\}\s*\]\);', leagues_fallback_target, code, flags=re.DOTALL)

with open('Website/js/store.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated Website/js/store.js")

# 2. Update all js and html files
files = glob.glob('Website/**/*.js', recursive=True) + glob.glob('Website/*.html')
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    updated = content
    if OLD_VER in updated:
        updated = updated.replace(OLD_VER, NEW_VER)
    # Also fix CSS links in index.html if needed
    if 'variables.css?v=' in updated:
        updated = re.sub(r'variables\.css\?v=\d+', f'variables.css?v={NEW_VER}', updated)
    if 'global.css?v=' in updated:
        updated = re.sub(r'global\.css\?v=\d+', f'global.css?v={NEW_VER}', updated)
    if updated != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"Updated {fpath}")

print("Sync complete!")
