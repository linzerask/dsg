import re

v_str = "1790560060000"

# 1. Update store.js
with open('Website/js/store.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("DATA_VERSION_STRING = '?v=1790560050000'", f"DATA_VERSION_STRING = '?v={v_str}'")

# Whitelist in Store.init
content = re.sub(r'if \(i !== \d+\) localStorage\.removeItem\(`dsg_data_v\$\{i\}`\);', f'if (i !== 76) localStorage.removeItem(`dsg_data_v${{i}}`);', content)
content = re.sub(r'if \(i !== \d+\) localStorage\.removeItem\(`dsg_admin_leagues_v\$\{i\}`\);', f'if (i !== 32) localStorage.removeItem(`dsg_admin_leagues_v${{i}}`);', content)
content = re.sub(r'if \(i !== \d+\) localStorage\.removeItem\(`dsg_admin_rounds_v\$\{i\}`\);', f'if (i !== 31) localStorage.removeItem(`dsg_admin_rounds_v${{i}}`);', content)

# Keys
content = re.sub(r"loadLocal\('dsg_data',\s*\d+\)", "loadLocal('dsg_data', 76)", content)
content = re.sub(r"loadLocal\('dsg_admin_leagues',\s*\d+\)", "loadLocal('dsg_admin_leagues', 32)", content)
content = re.sub(r"loadLocal\('dsg_admin_rounds',\s*\d+\)", "loadLocal('dsg_admin_rounds', 31)", content)

content = re.sub(r"trySetLocal\('dsg_data_v\d+'", "trySetLocal('dsg_data_v76'", content)
content = re.sub(r"trySetLocal\('dsg_admin_leagues_v\d+'", "trySetLocal('dsg_admin_leagues_v32'", content)
content = re.sub(r"trySetLocal\('dsg_admin_rounds_v\d+'", "trySetLocal('dsg_admin_rounds_v31'", content)

with open('Website/js/store.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated store.js cache versions to dsg_data_v76, leagues_v32, rounds_v31")

# 2. Update router.js
with open('Website/js/router.js', 'r', encoding='utf-8') as f:
    rc = f.read()
rc = re.sub(r'\?v=\d+', f'?v={v_str}', rc)
with open('Website/js/router.js', 'w', encoding='utf-8') as f:
    f.write(rc)
print("Updated router.js query params")

# 3. Update main.js
with open('Website/js/main.js', 'r', encoding='utf-8') as f:
    mc = f.read()
mc = re.sub(r'\?v=\d+', f'?v={v_str}', mc)
with open('Website/js/main.js', 'w', encoding='utf-8') as f:
    f.write(mc)
print("Updated main.js query params")

# 4. Update index.html
with open('Website/index.html', 'r', encoding='utf-8') as f:
    ic = f.read()
ic = re.sub(r'src="js/main\.js\?v=\d+"', f'src="js/main.js?v={v_str}"', ic)
with open('Website/index.html', 'w', encoding='utf-8') as f:
    f.write(ic)
print("Updated index.html query params")

# 5. Update statistiken.js
with open('Website/js/views/statistiken.js', 'r', encoding='utf-8') as f:
    sc = f.read()
sc = re.sub(r'\?v=\d+', f'?v={v_str}', sc)
with open('Website/js/views/statistiken.js', 'w', encoding='utf-8') as f:
    f.write(sc)
print("Updated statistiken.js query params")

# 6. Update admin.js
with open('Website/js/views/admin.js', 'r', encoding='utf-8') as f:
    ac = f.read()
ac = re.sub(r'\?v=\d+', f'?v={v_str}', ac)
with open('Website/js/views/admin.js', 'w', encoding='utf-8') as f:
    f.write(ac)
print("Updated admin.js query params")

# 7. Update home.js
with open('Website/js/views/home.js', 'r', encoding='utf-8') as f:
    hc = f.read()
hc = re.sub(r'\?v=\d+', f'?v={v_str}', hc)
with open('Website/js/views/home.js', 'w', encoding='utf-8') as f:
    f.write(hc)
print("Updated home.js query params")

# 8. Update liga.js
with open('Website/js/views/liga.js', 'r', encoding='utf-8') as f:
    lc = f.read()
lc = re.sub(r'\?v=\d+', f'?v={v_str}', lc)
with open('Website/js/views/liga.js', 'w', encoding='utf-8') as f:
    f.write(lc)
print("Updated liga.js query params")
