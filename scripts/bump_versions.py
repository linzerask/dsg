import glob

files_to_bump = [
    'Website/js/store.js',
    'Website/index.html',
    'Website/js/main.js',
    'Website/js/router.js',
    'Website/js/views/admin.js',
    'Website/js/views/home.js',
    'Website/js/views/liga.js',
    'Website/js/views/statistiken.js',
    'Website/js/views/adminGames.js',
    'Website/js/views/adminLeagues.js',
    'Website/js/views/adminRounds.js',
    'Website/js/views/adminPlayers.js',
    'Website/js/views/adminTeams.js'
]

# Update store.js
with open('Website/js/store.js', 'r', encoding='utf-8') as f:
    s = f.read()

s = s.replace('dsg_data_v79', 'dsg_data_v80')
s = s.replace("loadLocal('dsg_data', 79)", "loadLocal('dsg_data', 80)")
s = s.replace('if (i !== 79) localStorage.removeItem(`dsg_data_v', 'if (i !== 80) localStorage.removeItem(`dsg_data_v')

s = s.replace('dsg_admin_leagues_v35', 'dsg_admin_leagues_v36')
s = s.replace("loadLocal('dsg_admin_leagues', 35)", "loadLocal('dsg_admin_leagues', 36)")
s = s.replace('if (i !== 35) localStorage.removeItem(`dsg_admin_leagues', 'if (i !== 36) localStorage.removeItem(`dsg_admin_leagues')

s = s.replace('dsg_admin_rounds_v34', 'dsg_admin_rounds_v35')
s = s.replace("loadLocal('dsg_admin_rounds', 34)", "loadLocal('dsg_admin_rounds', 35)")
s = s.replace('if (i !== 34) localStorage.removeItem(`dsg_admin_rounds', 'if (i !== 35) localStorage.removeItem(`dsg_admin_rounds')

s = s.replace('1790560090000', '1790560100000')

with open('Website/js/store.js', 'w', encoding='utf-8') as f:
    f.write(s)

for p in files_to_bump:
    if p == 'Website/js/store.js': continue
    try:
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
        if '1790560090000' in content:
            content = content.replace('1790560090000', '1790560100000')
            with open(p, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Bumped {p}')
    except Exception as e:
        print(f'Error {p}: {e}')

print('Bump completed!')
