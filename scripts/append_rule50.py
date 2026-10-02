rule_50 = """

---

## 50. Universal Mojibake & Double-UTF8 Auto-Healing Protocol
* **The Pitfall:** When historical match reports, events, or player names stored in Firebase Firestore or browser `localStorage` contain double-UTF-8 or Windows-1252 encoded sequences (e.g. `Ã¼` for `ü`, `Ã¤` for `ä`, `Ã¶` for `ö`, `ÃŸ` for `ß`, `â€“` for `–`, `â€ž` for `„`), text renders with corrupted mojibake characters in modals, tables, and dropdowns (e.g. "SÃ¼leyman Targil", "Dominik PrilmÃ¼ller").
* **The Rule:**
  1. **Centralized Sanitizer Engine (`store.js`):**
     - `store.js` exports `sanitizeMojibake(val)` and recursive `deepSanitize(obj)` covering all German umlauts (`ä`, `ö`, `ü`, `ß`, `Ä`, `Ö`, `Ü`), common accented characters (`é`, `è`, `à`, `á`, etc.), punctuation dashes and quotes (`–`, `—`, `„`, `“`, `”`), degree/section signs (`°`, `§`), and Eastern European characters (`Č`, `č`, `Š`, `š`, `Ž`, `ž`, `Ć`, `ć`, `Đ`, `đ`).
  2. **Automatic Read/Write Auto-Healing:**
     - `loadLocal()` in `store.js` passes all retrieved items through `deepSanitize()`.
     - `Store.saveData()`, `Store.saveMatch()`, and `Store.syncFirebase()` automatically sanitize datasets on write, permanently curing any legacy mojibake in both `localStorage` and Firebase Firestore.
  3. **View-Level Defense-in-Depth:**
     - Match reports in `adminGames.js`, stats computations in `statistiken.js`, player listings in `adminPlayers.js`, and league tables in `liga.js` explicitly sanitize player names, team names, and card reasons during rendering and form processing.
  4. **Cache Key & Import Version Parity:**
     - Store versions: `dsg_data_v84`, `dsg_articles_v38`, `dsg_gallery_v27`, `dsg_admin_players_v13`, `dsg_admin_teams_v13`, `dsg_admin_rounds_v41`, `dsg_admin_leagues_v41`.
     - Script import query strings: `?v=1790957000000` across `index.html`, `main.js`, `router.js`, `admin.js`, and all view modules.
"""

with open('GEMINI.md', 'a', encoding='utf-8') as f:
    f.write(rule_50)
print('Appended Rule 50 successfully!')
