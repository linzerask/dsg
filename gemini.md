# DSG Liga — Project Memory, System Directives & Architectural Guidelines

> **Persistent Memory File for AI Agents & Developers**  
> Read this document before making any modifications to the DSG Liga codebase. When completing tasks or resolving issues, **update this document** to ensure past learnings and architectural decisions are preserved.

---

## 1. Aggressive Caching & Version Synchronization Protocol (CRITICAL)
The frontend implements aggressive client-side caching across `localStorage` and ES module imports.
* **The Mistake:** Modifying `Website/data/*.json` or updating JS modules without bumping cache versions. This causes the browser and Puppeteer to serve stale cached state, leading to false bug reports or missing features.
* **The Rule:**
  1. **LocalStorage Keys (`store.js`):** Whenever JSON data structures or initial seeds are modified, bump the corresponding version in `store.js` (e.g. `dsg_data_v50`, `dsg_articles_v37`, `dsg_gallery_v26`, `dsg_admin_players_v12`, `dsg_admin_teams_v12`, `dsg_admin_rounds_v12`, `dsg_admin_leagues_v8`).
  2. **ES Module Query Strings:** When editing JS views or CSS files, increment the query string across import statements (e.g. `import { viewAdmin } from './views/admin.js?v=1790560000100'`) in `index.html`, `main.js`, `router.js`, and parent view modules.

---

## 2. Complete Database Integrity & Scraped Dataset Accuracy
* **The Mistake:** Accidentally replacing or capping large scraped datasets with truncated mock arrays (e.g. only 360 player names instead of the complete historical roster).
* **The Rule:**
  1. **Never Truncate Data:** The canonical player database in `Website/data/players.json` contains **4,386+ players** with exact `#` IDs (`#4491`, `#4490`, etc.), real birthdays, team affiliations, ÖFB clubs, membership dates, and active statuses.
  2. **Initial Data Flow:** `Store.getAdminPlayers()`, `Store.getAdminTeams()`, `Store.getAdminRounds()`, and `Store.getAdminLeagues()` must always load the full dataset from `data/*.json`, cache it in versioned `localStorage`, and synchronize with Firebase Firestore.

---

## 3. Strict SVG Icon Mandate (Zero Unicode Emojis)
* **The Mistake:** Using unicode emojis (e.g. 📁, 📷, 📝, ⚠️, ✅, ✕, ★, 🔗, 🧹, ◀, ▶, ▼, ☰) which look inconsistent, low-res, or juvenile across different operating systems.
* **The Rule:**
  1. **Zero Emojis:** Strictly prohibited in all UI elements, headings, buttons, toasts, tables, dialogs, and text editors.
  2. **Clean SVGs:** Use crisp, accessible inline SVGs with standard 24x24 viewBoxes, `fill="none"`, `stroke="currentColor"`, and semantic stroke widths (1.5–2.5px).
  3. **Badges:** Use styled CSS badges (e.g. yellow/red card squares) for sports indicators instead of emoji squares.

---

## 4. Mobile Responsiveness & Layout Architecture (No Horizontal Slider Chaos)
* **The Pitfall:** Forcing horizontal scrollbars on mobile (`<= 768px`) for tab menus or complex data tables creates a poor user experience.
* **The Rule:**
  1. **Floating Pill Navigation & Mobile Hamburger Drawer:** 
     - On mobile screens (`<= 768px`), the navigation renders as an ultra-compact **Dynamic Island Floating Capsule** centered at the top (`width: auto; max-width: max-content; left: 50%; transform: translateX(-50%); position: fixed; top: 32px;`). It contains the clean DSG logo on the left, an elegant subtle 1px divider, and the crisp SVG hamburger button (`#open-drawer`) on the right.
     - **Smart Dynamic Auto-Hiding on Scroll:** When scrolling down (> 60px), the floating nav smoothly slides up and hides (`.nav-hidden { transform: translate(-50%, -170%); opacity: 0; }`). When scrolling back up or reaching the top of the page (<= 20px), the nav smoothly slides back in (`transform: translateX(-50%); opacity: 1;`).
     - Never stretch the mobile pill edge-to-edge with redundant title text, as the Hero section below already displays the main brand heading.
     - Never add inline `style="display: none"` directly into `#open-drawer` HTML tags, as inline styles override responsive `@media (max-width: 768px)` stylesheet rules.
     - Opening the mobile drawer activates `#drawer-overlay` with backdrop blur, and tapping anywhere outside the drawer or selecting any nav link automatically closes the drawer with Anime.js spring animations.
  2. **Admin Tab Navigation:** On mobile screens, the admin navigation transforms into an **Accordion / Collapsible Dropdown Drawer**. The toggle button displays the current active tab name and an animated SVG chevron that rotates on open/close. Selecting any tab switches the view and collapses the menu automatically.
  3. **Mobile Data Cards (`.admin-m-card`):** Complex desktop tables switch to touch-friendly card accordions on screens `<= 768px`.
  4. **Fluid Typography & Containers:** Use `clamp()`, `word-break: break-word`, and `hyphens: auto` for long German compound words (e.g., *Meisterschaftsbestimmungen*, *Datenschutzerklärung*). Grids must collapse to single columns (`grid-template-columns: 1fr`).
  5. **Stats Section Action Buttons:** On desktop, action buttons remain aligned with section headings (`.stats-header-btn`). On mobile (`<= 768px`), header buttons are hidden and placed cleanly beneath the data card grid (`.stats-mobile-footer-btn`) with concise text ("Zur gesamten Statistik &rarr;") to prevent multi-line button wrapping.
  6. **Topspiel Match Card:** On mobile (`<= 768px`), team names stack vertically (`.topspiel-teams { flex-direction: column; }`): Home team on top, centered `VS` badge in the middle, Guest team at the bottom. Metadata rows below feature strictly equal vertical spacing (`margin-top: 12px; gap: 12px;`) between the Guest team, the Date/Time row, and the Location row.
  7. **News Card Interaction & Navigation:** On all news listing grids (`news.js`) and carousels, the article image (`.news-img-link`), the article headline (`.news-title-link`), and the footer link (`Weiterlesen ->`) must all be direct clickable anchor tags pointing to `#/article/:id` for effortless tap and click ergonomics on both desktop and mobile.
  8. **Table Mobile Accordions:** On mobile screens (`<= 768px`), all multi-column standings and statistics tables (Homepage Top 5 Table in `home.js`, League Standings Modal in `adminLeagues.js`, and Ewige Vereinstabelle in `statistiken.js`) must replace wide horizontal scrolling tables with modern tap-to-expand card accordions displaying team rank, name, points, and a 6-stat breakdown (`Spiele`, `Siege`, `Unent.`, `Nied.`, `Tore`, `Diff`) with Anime.js animations.
  9. **League Details Modal Sub-Nav Tabs:** The sub-navigation tabs in `#league-data-modal` (`Tabelle`, `Spiele`, `Karten`, `Tore`) render as a fixed 4-column segmented control grid (`grid-template-columns: repeat(4, 1fr)`) with zero horizontal overflow on mobile screens.
  10. **All-Time Goal Scorers List on Mobile:** On screens `<= 768px`, the wide table in `statistiken.js` switches to modern, touch-friendly ranking cards displaying player rank badges (Gold Crown for #1, Silver Medal for #2, Bronze Medal for #3), player name, teams, seasons count, and a prominent green accent Goals badge (`XX Tore`). Live search and pagination dynamically update both desktop table rows and mobile card containers.

---

## 5. Modal Viewport Centering & Outside-Click Dismissal
* **The Rule:**
  1. **Direct Body Attachment (CRITICAL):** All dialog modals (`#player-modal`, `#game-modal`, `#round-modal`, `#team-modal`, `#league-modal`, `#league-data-modal`, `#report-modal`, `#add-game-modal`) MUST be attached directly to `document.body` on initialization/open (via `if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);`). This prevents `position: fixed` from becoming trapped inside parent containers animated by Anime.js or styled with CSS `transform` (which resets the containing block coordinate space).
  2. **Centering:** All dialog modals must be fixed and centered in the active viewport:
     ```css
     position: fixed !important;
     inset: 0 !important;
     top: 0 !important;
     left: 0 !important;
     width: 100vw !important;
     height: 100vh !important;
     height: 100dvh !important;
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 99999;
     background: rgba(0, 0, 0, 0.65);
     ```
  3. **Outside-Click Dismissal:** Clicking anywhere on the darkened backdrop outside the modal content container must automatically close the modal.
  4. **Mobile Bounds:** Modal cards must have `max-width: calc(100vw - 24px)` and `max-height: 92vh` with smooth internal scrolling (`overflow-y: auto`).

---

## 6. Sort & Filter Functionality Across All Admin Tabs
* **The Rule:** Every administrative table must feature a comprehensive toolbar with:
  1. **Live Search Input:** Instant debounced filtering on text.
  2. **Contextual Filter Dropdown:** Specific status filters (e.g., `Alle Spiele`, `Nur Gespielte`, `Nur Ausstehend`, `Abgesagt/Verschoben` in Spiele; `Aktiv`/`Inaktiv` in Teams, Runden, Ligen, Spieler).
  3. **Sort Dropdown:** Multi-column sorting options (e.g. by `# ID`, `Datum`, `Runde`, `Name`, `Status`, `Aktive Spieler`).

---

## 7. Match Statuses & Automated Standings Calculations
* **The Rule:**
  1. **Status Definitions:**
     - `Ausstehend`: Unplayed match (`-:-`). Ignored by points/goal calculations.
     - `Beendet`: Finished match with valid score (e.g. `3:1 (1:0)`).
     - `Abgesagt 3:0`: Home team forfeit win (3 points to home, 3:0 score).
     - `Abgesagt 0:3`: Away team forfeit win (3 points to away, 0:3 score).
     - `Abgesagt` / `Verschoben`: Canceled or postponed match without score.
  2. **Recalculation:** `Store.recalculateSeason(season)` must be called after creating, editing, or deleting matches to recalculate points, goal difference, goals scored, and standings order.

---

## 8. Clean DOM Manipulation & String Literal Safety
* **The Mistake:** Injecting complex inline `onmouseover` / `onclick` code with nested quotes into JS template literals, crashing the parser.
* **The Rule:**
  1. Never use inline JS for styles or hover effects.
  2. Keep HTML strings in JS templates clean, declarative, and semantic.
  3. Attach all event listeners programmatically in dedicated `bind...()` / `init...()` lifecycle functions.

---

## 9. Key Mapping & Language Uniformity
* **The Rule:**
  - **Internal Data Keys & IDs:** Standardized in English (e.g. `yellow`, `yellowRed`, `red`, `goalsFor`, `goalsAgainst`, `points`, `goalDiff`).
  - **User-Facing UI Labels:** Authentic, formal Austrian German (e.g. `Gelb`, `Gelb-Rot`, `Rot`, `Tore`, `Punkte`, `Diff`, `Spiele`, `Torschützen`, `Spielbericht`).

---

## 10. Local Server Environment
* **The Rule:** The application relies on vanilla ES modules and dynamic `fetch()` calls. Always run and test the app via the local HTTP server (`http://localhost:8000`) rooted in `Website/`. Never open files directly via the `file://` protocol.

---

## 11. Project Directory Structure
```
DSG Liga/
├── GEMINI.md                  # This persistent memory & rules file
├── scraper/                   # Python scrapers & raw html extraction files
└── Website/                   # Main production web application
    ├── index.html             # Vanilla SPA entry shell
    ├── logo.png               # DSG logo
    ├── css/
    │   ├── variables.css      # CSS variables & typography tokens
    │   └── global.css         # Global stylesheet & responsive rules
    ├── data/
    │   ├── liga.json          # Main league seasons, teams, matches
    │   ├── players.json       # 4,386+ complete historical player database
    │   ├── teams.json         # Teams master list
    │   ├── rounds.json        # Rounds master list
    │   └── leagues.json       # Historical leagues & seasons
    └── js/
        ├── main.js            # App bootstrap & drawer binding
        ├── router.js          # Hash router
        ├── store.js           # Central data store & Firestore sync
        ├── firebase.js        # Firebase SDK config & instances
        └── views/
            ├── home.js        # Homepage view
            ├── liga.js        # Public league standings & matchdays
            ├── news.js        # News masonry list
            ├── article.js     # Single article view
            ├── galerie.js     # Photo gallery view
            ├── statistiken.js # Player rankings & stats
            ├── organisation.js# Board & federation info
            ├── admin.js       # Admin layout & mobile accordion nav
            ├── adminGames.js  # Matches management & match reports
            ├── adminPlayers.js# 4,386+ players database management
            ├── adminTeams.js  # Teams management
            ├── adminRounds.js # Matchday rounds management
            ├── adminLeagues.js# League seasons & archive data
            ├── adminNews.js   # News articles & rich text editor
            └── adminGallery.js# Photo albums & uploads
```

---

## 12. SPA Scroll Management & History Restoration Protocol
* **The Pitfall:** In hash-based SPAs (`#/news`, `#/article/:id`), browsers may remember scroll positions globally or jump asynchronously to the previous route's scroll offset when opening a new page (e.g. starting in the middle of an article). Additionally, naive scroll listeners can accidentally overwrite saved scroll states with `0` while elements are being removed or rendered.
* **The Rule:**
  1. **Manual Scroll Restoration:** Set `history.scrollRestoration = 'manual'` in `Router.init()`.
  2. **Dedicated Route Scroll Map:** Maintain a `scrollPositions = new Map()` on the `Router` object. Track scroll positions in real time via `window.addEventListener('scroll', ...)` only when `!this.isNavigating`.
  3. **Forward Navigation:** When opening any new page or article link forward, immediately reset scroll position to `(top: 0, left: 0)` using `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` and remove `.nav-hidden` from the floating navigation bar.
  4. **Back/Forward Navigation (`popstate`):** When navigating back (browser back button / mobile swipe gesture), detect `isPopState = true`, retrieve the recorded scroll position `savedY` for that route, and restore `window.scrollTo({ top: savedY, left: 0, behavior: 'instant' })` through `requestAnimationFrame` once the DOM is stable.

---

## 13. Admin Data Grid Default Sort Orders
* **The Rule:**
  1. **Spieler Tab (`adminPlayers.js`):** Default sort order is set to **`Datum (neueste)` (`date-desc`)**, sorting by membership/registration date (`seit`) descending from newest to oldest, with `# ID` descending as the secondary tiebreaker.
  2. **Spiele Tab (`adminGames.js`):** Default sort order is set to **`Datum (älteste)` (`date-asc`)**, ordering matches chronologically.

---

## 14. Admin Spielrunden Lifecycle & Cache Synchronization
* **The Pitfall:** Adding, editing, or deleting a round in `adminRounds.js` was getting overwritten on reload due to: (1) obsolete cleanup loops in `Store.init()` clearing active cache versions, (2) `Store.getAdminRounds()` fetching seed JSON before checking Firebase Firestore, (3) strict type equality (`===`) failing between number and string IDs in round updates, and (4) rounds needing scheduled matches to populate the public matchday sliders.
---

## 15. Admin Modal Form Submission, DOM Lifecycle, & Toast Feedback
* **The Pitfall:** When modals are moved to `document.body` for viewport centering, re-rendering admin views can leave stale modal elements in `document.body`. If the cleanup logic incorrectly discards the newly rendered modal in favor of the stale body modal, form submit event listeners become disconnected, causing the modal to fail to close and feedback toasts to not trigger.
* **The Rule:**
  1. **Fresh Modal Promotion (`ensureAllAdminModalsInBody`):** Whenever ensuring modals in `document.body`, always search for the fresh modal in `#admin-content` (`el.parentElement !== document.body`), remove all older stale modal nodes from `document.body`, and append the fresh modal.
  2. **Multi-Element Modal Closure:** Modal close functions (`closeEditModal`, `closeGameModal`, `closeReportModal`, `closeRoundModal`) must always query `document.querySelectorAll('#' + modalId).forEach(m => m.style.display = 'none')` to ensure all instances are dismissed.
  3. **Toast Notifications:** All successful creations, edits, and deletions across all admin tabs (Ligen, Teams, Spieler, Spiele, Spielrunden) must trigger `showToast(message)` with crisp SVG icons.
  4. **Form Validation Feedback:** Form submissions must validate required fields in JavaScript before saving and display error toasts (`showToast('Bitte füllen Sie...', true)`) to guide the user.

---

## 16. Canonical Season Keys & League Inspection Data Mapping
* **The Pitfall:** If `getSeasonKey(league)` in `adminLeagues.js` prepends `"Saison "` to a season whose year is `"2026/2027"` (e.g. producing `"Saison 2026/2027"` instead of the canonical key `"2026/2027"` stored in `liga.json`), inspecting the league data modal will look up an empty/non-existent key and falsely appear as though all season data was deleted.
* **The Rule:**
  1. **Canonical Season Keys:** All standard seasons in `liga.json` and `leagues.json` use format `YYYY/YYYY` (e.g. `'2026/2027'`, `'2025/2026'`, `'2024/2025'`, `'2023/2024'`, `'2022/2023'`, `'2021/2022'`), or playoff suffix variants (e.g. `'2024/2025_oberes'`, `'2022/2023_1klasse'`).
  2. **Preserve `seasonKey` on Edit:** When editing an existing league in `adminLeagues.js`, always preserve `existingLeague.seasonKey` so that updating names or status never alters the underlying dataset key.
  3. **Multi-Strategy Fallback Lookup:** `renderModalContent()` in `adminLeagues.js` must resolve season data using: (1) exact `seasonKey`, (2) computed key via `getSeasonKey()`, (3) year string matching, and (4) 4-digit prefix matching before falling back to empty state.
  4. **Auto-Healing in `Store.init()`:** `Store.init()` must always verify that canonical seasons in `INITIAL_DATA.seasons` exist and are populated with their teams and matches in memory data, preventing stale empty local storage keys from masking the database.

---

## 17. Dynamic Round Dropdown & Season Key Match Resolution
* **The Pitfall:** When creating a match from a specific round row in `adminRounds.js` (`+ Spiel anlegen`), filtering round options with a hardcoded season check (e.g. `r.seasonKey === '2026/2027'`) causes rounds from newly created leagues or other seasons to disappear from the dropdown, falling back to an unrelated round and saving the match to the wrong season key.
* **The Rule:**
  1. **Dynamic Round Ingestion:** `openAddGameModal()` in `adminRounds.js` must populate all active rounds and always guarantee that the round passed as context is included and preselected in `#modal-game-round`.
  2. **Dynamic Team Loading:** Selecting a round in `#modal-game-round` must instantly update the team selection options (`#modal-game-home`, `#modal-game-away`) to reflect the teams belonging to that round's specific league.
  3. **Dynamic Season Key Routing:** Matches created via both `adminRounds.js` and `adminGames.js` must read the target season key from the selected round (`data-season-key`) and save/recalculate via `Store.saveMatch(targetSeasonKey, match)` and `Store.recalculateSeason(targetSeasonKey)`.

---

## 18. Multi-League Dashboard Aggregation & Dynamic Match Management
* **The Pitfall:** In `adminGames.js`, hardcoding the match loader to `gamesData = Store.getMatches('2026/2027')` caused matches created in newly added leagues (e.g. `TEST LIGA 2030/2031`) to only appear on the public frontend while remaining completely invisible and un-editable in the admin Spiele dashboard.
* **The Rule:**
  1. **All-Season Aggregation:** `adminGames.js` (`loadDataAndRender`) must iterate through all active/existing seasons in `Store.getData().seasons` and aggregate all matches into `gamesData`, attaching `seasonKey` to each match item.
  2. **League Filter Dropdown:** `renderAdminGames()` and `populateFilterAndFormDropdowns()` must provide a `#game-league-filter` dropdown containing `Alle Ligen` and all configured leagues, preserving the user's selected league filter on re-renders.
  3. **Multi-League CRUD & Match Reports:** Editing, deleting, and filing match reports in `adminGames.js` (`openEditGameModal`, `deleteGame`, `openReportModal`, `saveReportForm`) must always read and write directly to `match.seasonKey`, ensuring instant recalculations and real-time state synchronization across both dashboard and website.

---

## 19. Dedicated Round Inspection Modal in Spielrunden
* **The Architectural Decision:** Match creation is unified exclusively in the **Spiele** tab (`adminGames.js`), eliminating duplicate forms and divergent state. On the **Spielrunden** tab (`adminRounds.js`), each round row and mobile accordion card provides a **`Spiele ansehen`** action button with an inline eye SVG icon.
* **The Rule:**
  1. **Dynamic Round Match Resolution:** Clicking `Spiele ansehen` opens `#round-games-modal`, resolving matches from `Store.getMatches(round.seasonKey)` (with cross-season fallback) filtered by round number (`${round.runde}. Runde`, `Runde ${round.runde}`, etc.).
  2. **Clean Status Badges & Scores:** Displays match date, kickoff time, status badges (`Beendet`, `Ausstehend`, `Abgesagt`, `Verschoben`), score pill, home and away clubs with responsive mobile flex layouts, and match location.
  3. **Empty State:** If no games are registered for that round, renders a clean SVG calendar empty state advising that matches can be scheduled in the **Spiele** tab.



