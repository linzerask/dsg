with open('Website/js/store.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace version constants and keys
code = code.replace('const DATA_VERSION_STRING = \'?v=1790560039000\';', 'const DATA_VERSION_STRING = \'?v=1790560050000\';')
code = code.replace('if (i !== 74) localStorage.removeItem(`dsg_data_v${i}`);', 'if (i !== 75) localStorage.removeItem(`dsg_data_v${i}`);')
code = code.replace('if (i !== 29) localStorage.removeItem(`dsg_admin_rounds_v${i}`);', 'if (i !== 30) localStorage.removeItem(`dsg_admin_rounds_v${i}`);')
code = code.replace('if (i !== 30) localStorage.removeItem(`dsg_admin_leagues_v${i}`);', 'if (i !== 31) localStorage.removeItem(`dsg_admin_leagues_v${i}`);')

code = code.replace("loadLocal('dsg_data', 74)", "loadLocal('dsg_data', 75)")
code = code.replace("trySetLocal('dsg_data_v74'", "trySetLocal('dsg_data_v75'")
code = code.replace("trySetLocal('dsg_data_v72'", "trySetLocal('dsg_data_v75'")

code = code.replace("loadLocal('dsg_admin_leagues', 30)", "loadLocal('dsg_admin_leagues', 31)")
code = code.replace("trySetLocal('dsg_admin_leagues_v30'", "trySetLocal('dsg_admin_leagues_v31'")

code = code.replace("loadLocal('dsg_admin_rounds', 29)", "loadLocal('dsg_admin_rounds', 30)")
code = code.replace("trySetLocal('dsg_admin_rounds_v29'", "trySetLocal('dsg_admin_rounds_v30'")

with open('Website/js/store.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated Website/js/store.js version keys successfully!")
