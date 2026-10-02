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
  - **Agent Communication Mandate:** Always converse, explain, and answer the user in English. Never reply in German unless explicitly asked to translate a specific phrase.

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

## 13. Admin Data Grid Default Sort Orders & Nomenclature
* **The Rule:**
  1. **Spieler Tab (`adminPlayers.js`):** Default sort order is set to **`Datum (neueste)` (`date-desc`)**, sorting by membership/registration date (`seit`) descending from newest to oldest, with `# ID` descending as the secondary tiebreaker.
  2. **Spiele Tab (`adminGames.js`):** Default sort order is set to **`Datum (älteste)` (`date-asc`)**, ordering matches chronologically. Sorting options are:
     - `Saison (neueste)` (`season-desc`): sorts by season year descending, with ascending match round and date as tiebreaker.
     - `Saison (älteste)` (`season-asc`): sorts by season year ascending, with ascending match round and date as tiebreaker.
     - `Datum (neueste)` (`date-desc`): sorts by match epoch timestamp descending (accounting for time `HH:MM`).
     - `Datum (älteste)` (`date-asc`): sorts by match epoch timestamp ascending.
     - `Runde (1 → ..)` (`round-asc`): sorts by round number ascending, with newest season as tiebreaker.
     - `Runde (.. → 1)` (`round-desc`): sorts by round number descending, with newest season as tiebreaker.
     - `Liga (A–Z)` (`league-asc`): sorts by league/season name alphabetically.
     - `Heim (A–Z)` (`home-asc`): sorts by Home team name.
     - `Auswärts (A–Z)` (`away-asc`): sorts by Away team name.
     - **Date Formatting:** Match dates are normalized to 4-digit Austrian format `DD.MM.YYYY HH:MM`.
  3. **Spielrunden Tab (`adminRounds.js`):** Default sort order is **`Saison (neueste)` (`season-desc`)** with ascending round tiebreaker. Sorting options are:
     - `Saison (neueste)` (`season-desc`)
     - `Saison (älteste)` (`season-asc`)
     - `Datum (neueste)` (`date-desc`)
     - `Datum (älteste)` (`date-asc`)
     - `Runde (1 → ..)` (`runde-asc`)
     - `Runde (.. → 1)` (`runde-desc`)
     - `Liga (A–Z)` (`league-asc`)
     Uses true epoch timestamp parsing for Austrian `DD.MM.YYYY` / ISO dates and open-ended dynamic dots (`1 → ..`, `.. → 1`).

---

## 14. Admin Spielrunden Lifecycle & Cache Synchronization
* **The Pitfall:** Adding, editing, or deleting a round in `adminRounds.js` was getting overwritten on reload due to: (1) obsolete cleanup loops in `Store.init()` clearing active cache versions (e.g. whitelist `i !== 22` deleting `dsg_admin_rounds_v23`), (2) `Store.getAdminRounds()` fetching seed JSON before checking Firebase Firestore, (3) strict type equality (`===`) failing between number and string IDs in round updates, and (4) rounds needing scheduled matches to populate the public matchday sliders.
* **The Rule:** Always ensure the cache version whitelist in `Store.init()` precisely matches the active version used by the store (`dsg_admin_rounds_v23`, `dsg_admin_leagues_v22`, `dsg_data_v64`). This guarantees that round date ranges (`datumVon`, `datumBis`) persist synchronously across browser reloads without requiring cache purges.
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

## 19. Dedicated Round Inspection Modal & Expandable Match Details Accordion in Spielrunden
* **The Architectural Decision:** Match creation is unified exclusively in the **Spiele** tab (`adminGames.js`), eliminating duplicate forms and divergent state. On the **Spielrunden** tab (`adminRounds.js`), each round row and mobile accordion card provides a **`Spiele ansehen`** action button with an inline eye SVG icon.
* **The Rule:**
  1. **Dynamic Round Match Resolution:** Clicking `Spiele ansehen` opens `#round-games-modal`, resolving matches from `Store.getMatches(round.seasonKey)` (with cross-season fallback) filtered by round number (`${round.runde}. Runde`, `Runde ${round.runde}`, etc.).
  2. **Interactive Match Details Accordion:** Matches inside `#round-games-modal` render in the exact interactive format as the public `liga.js` match center:
     - Header with weekday, date, kickoff time, location, status badge, and animated `Details ⌄` indicator.
     - Centered score pill with halftime `HT` badge underneath and team dismissal red card indicators adjacent to club names.
     - Expandable `.events-accordion` 2-column layout (Home vs Away) featuring SVG soccer balls for scorers and badges for yellow/yellow-red/red disciplinary cards with Anime.js transitions.
  3. **Empty State:** If no games are registered for that round, renders a clean SVG calendar empty state advising that matches can be scheduled in the **Spiele** tab.

## 20. GitHub Pages Deployment Protocol (Website Subtree Root)
* **The Pitfall:** Pushing the full repository branch `main` directly to `gh-pages` places repository root files (like `README.md`, `scraper/`, `scripts/`) at the web root, causing GitHub Pages / Jekyll to serve the markdown documentation instead of the single-page application.
* **The Rule:**
  1. Always deploy to `gh-pages` using the **`Website` subdirectory subtree**:
     `git subtree push --prefix Website origin gh-pages` or `git push origin $(git subtree split --prefix Website main):gh-pages --force`.
  2. This ensures `Website/index.html` sits directly at `/` on `https://linzerask.github.io/dsg/`.

---

## 22. Disciplinary Card Model & Unified Two-Category Tables
* **The Rule:**
  1. **Only Two Card Categories:** Across the entire web application (both public views and admin inspector modals), disciplinary card statistics are strictly consolidated into **two categories**:
     - **Gelbe Karten (Yellow Cards)** (🟨)
     - **Rote Karten (Red Cards / Dismissals)** (🟥)
  2. **Card Calculation Logic:**
     - A standard Yellow Card event adds **+1 Yellow**.
     - A Yellow-Red dismissal event (2nd yellow sending-off) adds **+2 Yellows** and **+1 Red** to the player's season totals.
     - A direct Straight Red Card event adds **+1 Red**.
  3. **Visual Match Card Indicators:**
     - On match cards, any dismissal (Yellow-Red or direct Red) renders a Sofascore-style red card badge adjacent to the team name (`[Home] [🟥]` and `[🟥] [Away]`).

---

## 23. Streamlined Spielrunde Modal & Dynamic League Ingestion
* **The Rule:**
  1. **Zero Redundant Inputs:** The `Runde anlegen` / `Runde bearbeiten` modal (`#round-modal` in `adminRounds.js`) eliminates separate `Saison` (Herbst/Frühjahr) and manual `Jahr` fields.
  2. **Top-Level League Chooser:** The **Liga** selector sits at the very top of the form and is dynamically populated from active leagues configured in the **Ligen verwalten** tab (`Store.getAdminLeaguesSync()`).
  3. **Auto-Inherited Properties:** Selecting a league automatically assigns `liga`, `seasonKey`, `jahr`, and `saison` to the round.
  4. **Smart Auto-Round Increment:** Selecting a league automatically computes and suggests the next round number based on existing rounds in that league.

---

## 24. Canonical Database Initialization & Zero Hardcoded Season Fallbacks
* **The Pitfall:** Hardcoding `"2026/2027"` as fallback season in `store.js`, `liga.js`, `home.js`, `adminGames.js`, and `adminRounds.js` caused uninitialized or reset state to fabricate empty future seasons (`1. Klasse 2026/2027`, `DSG Liga 2026/2027`) and save them to Firestore and local storage, overwriting real scraped historical seasons.
* **The Rule:**
  1. **Dynamic Season Fallbacks:** Always resolve the default season via `(Store.getData()?.currentSeason || "2022/2023")` or `(currentLeague.seasonKey || currentLeague.name)`. Never hardcode speculative future season years.
  2. **Canonical Data Protection:** On cache invalidation (`dsg_data_v65`, `dsg_admin_leagues_v23`, `dsg_admin_rounds_v23`), `store.js` eagerly seeds from `data/leagues.json`, `data/rounds.json`, and `data/liga.json` to guarantee that canonical leagues (`#1 DSG Liga 2022/2023`), their full team rosters (all 8 clubs), and matchday rounds are intact and immediately synchronized to Firestore.

---

## 25. Public League Visibility (`showOnHomepage`) & Auto-Recalculation
* **The Rule:**
  1. **Public Visibility Enforcement:** The `showOnHomepage` flag on leagues controls public website display across both `home.js` (Homepage table & matches) and `liga.js` (Season selection dropdown). When set to `false`, the league is hidden from public selection. If no leagues are marked visible, views display a clean, friendly SVG placeholder ("Keine aktive Liga verfügbar - Derzeit ist keine Saison für die öffentliche Ansicht freigeschaltet.").
  2. **Automatic Standings Recalculation:** Editing participating teams in `adminLeagues.js` via `Store.setLeagueSeasonTeams(seasonKey, teamNames)` automatically invokes `Store.recalculateSeason(seasonKey)` to re-evaluate match scores, points, and goal differences for all configured teams.
  3. **Event Listener Synchronization:** `Router` listens to both `data-updated` and `leagues-updated` events to immediately re-render public and admin routes upon Firestore updates.

---

## 26. League Participating Teams Checklist & Comprehensive Master Roster Ingestion
* **The Pitfall:** In `adminLeagues.js`, filtering the participating teams checkbox list by `cachedActiveTeams = allTeams.filter(t => t.Status === 'Aktiv')` excluded inactive master clubs (e.g. 5 out of 8 clubs in the historical 2022/2023 season). When saving the edit form, `Store.setLeagueSeasonTeams()` replaced the season's team roster with only the remaining 3 active clubs, truncating the season standings table.
* **The Rule:**
  1. **Comprehensive Eligible Teams Ingestion (`cachedEligibleTeams`):** The league edit modal checklist must aggregate: (1) all master clubs from `teams.json` (with subtle `Aktiv` / `Inaktiv` status badges), (2) all clubs currently registered in `season.teams`, and (3) all clubs participating in `season.matches`.
  2. **Preserve All Checked Teams on Save:** `league-edit-form.onsubmit` maps selected teams against `cachedEligibleTeams` without discarding inactive teams, ensuring all historical clubs (e.g. Union Heiligenberg, FC U. Schleißheim, DSG UKJ Froschberg, DSG St. Josef/Oed FC, FC Hinzenbach, SV Croatia Linz, Union Geboltskirchen, Union Goldwörth) remain intact.
  3. **Auto-Healing in Data Sync:** If a season has fewer teams than the canonical dataset in `data/liga.json`, `Store.syncFirebase()` automatically restores the complete dataset, recalculates standings, and synchronizes to Firebase.

---

## 27. Multi-League Support, 1. Klasse 2022/2023 Ingestion, & League Priority Hierarchy (`sortLeaguesByPriority`)
* **The Core Requirement:** In any given season year, multiple leagues and divisions may exist simultaneously (e.g., `DSG Liga 2022/2023` and `1. Klasse 2022/2023`). **`DSG Liga` is ALWAYS the primary, standard league** and must be prioritized before `1. Klasse`, `Oberes Playoff`, or `Unteres Playoff`.
* **The Rule:**
  1. **Strict Hierarchy Order (`sortLeaguesByPriority`):**
     - Primary Sort: Season year descending (`2025/2026 > 2024/2025 > 2023/2024 > 2022/2023 > 2021/2022`).
     - Secondary Sort (Hierarchy Weight within same year): `DSG Liga` (Weight 1) &rarr; `Oberes Playoff` (Weight 2) &rarr; `Unteres Playoff` (Weight 3) &rarr; `1. Klasse` (Weight 4) &rarr; `Other` (Weight 5).
     - Applied globally in `Store.getAdminLeaguesSync()`, `Store.getAdminLeagues()`, `Store.getVisibleSeasonItems()`, `home.js`, `liga.js`, and admin dropdowns so that `DSG Liga` is always the first item and the default active league view.
  2. **Canonical Keys for Secondary Divisions:** Secondary leagues use specific keys: `2022/2023_1klasse` for `1. Klasse 2022/2023`, `2024/2025_oberes` for Oberes Playoff, etc.
  3. **Multi-League Data Ingestion:**
     - `1. Klasse 2022/2023` (`raw_berichte_2.json` / `seasonKey: "2022/2023_1klasse"`) contains all 8 clubs (DSG Thalheim, Walker FC, Union Eschenau, FC Gornjak, DSG Union Traun, DSG Auberg, FC Bruck, FC Anatolia), 7 rounds (Rounds 8–14 in `rounds.json`), 28 matches, and 59 scorers.
     - Standings and stats for each league are completely isolated in `liga.json.seasons[seasonKey]`, while all-time statistics in `statistiken.js` seamlessly aggregate across all divisions.
  4. **Cache Versions:** Active versions bumped to `dsg_data_v68`, `dsg_admin_leagues_v26`, `dsg_admin_rounds_v25`.

---

## 28. Firestore Multi-League Sync Protection & Dynamic Meister Honor Card Titles
* **The Pitfall:** (1) When Firestore has an older single-league snapshot, naive synchronization overwrites local multi-league datasets (`leagues.json` and `rounds.json`), causing newly added leagues (such as `1. Klasse 2022/2023`) to vanish from the Admin Dashboard and Stats pages. (2) Round dropdowns without explicit `datumVon`/`datumBis` failed to show dates on the public Liga page. (3) Champion cards in `statistiken.js` were displaying raw keys (`Saison 2022/2023_1klasse`) instead of formal dynamic league titles.
* **The Rule:**
  1. **Canonical Dataset Protection in `Store.syncFirebase()`:** Before syncing leagues or rounds from Firestore, verify that Firestore contains the complete canonical dataset (`leagues >= 2`, `rounds >= 14`). If Firestore has fewer items or is missing secondary leagues, merge canonical items from `data/leagues.json` and `data/rounds.json` and write back to Firestore.
  2. **Dynamic Round Date Fallback:** In `liga.js`, if round metadata does not provide date ranges, dynamically compute the earliest and latest match dates from the round's scheduled matches and format as `${nr}. Runde (${firstDate} - ${lastDate})`.
  3. **Dynamic Meister Honor Labels (`getSeasonHonorLabel`):** In `statistiken.js`, champion card titles resolve via `getSeasonHonorLabel(seasonKey)`, dynamically mapping keys like `2022/2023` to `DSG Liga Saison 2022/2023` and `2022/2023_1klasse` to `1. Klasse Saison 2022/2023`, with automatic support for any newly added leagues.
  4. **Cache Versions:** Active cache keys are `dsg_data_v70`, `dsg_admin_leagues_v28`, `dsg_admin_rounds_v27`.

---

## 29. Standings Goal Difference Ratio Parsing (`NaN` Fix), FC Anatolia Unplayed Club Cleanup, & Data Fetch Cache-Busting
* **The Pitfall:** (1) When raw scraped data stores goal difference as a ratio string (e.g. `"29:12"` or `"16:12"`) rather than a difference integer, `Number(t.diff)` evaluates to `NaN`, breaking table sorting and displaying `NaN` in public and admin standings. (2) Clubs that never played a single match (e.g., `FC Anatolia` in 1. Klasse 2022/2023 with 0 played, 0 points, and 7 unplayed fixtures) distort division standings and round match counts. (3) Browser HTTP caching can serve stale `data/*.json` files on local servers unless query strings are passed to `fetch()`.
* **The Rule:**
  1. **Goal Difference Normalization:** `t.goalDiff` must always be stored as an integer (`goalsFor - goalsAgainst`). In table sorting and row rendering (`liga.js`, `home.js`, `statistiken.js`), diff calculation must prioritize `t.goalDiff !== undefined && !isNaN(Number(t.goalDiff)) ? Number(t.goalDiff) : (gf - ga)`.
  2. **Unplayed Club Cleanup:** `FC Anatolia` and its 7 unplayed fixtures are completely excluded from `seasons['2022/2023_1klasse']`, leaving 7 active clubs and 21 played matches (3 matches per round for rounds 1–7).
  3. **Fetch Cache-Busting Protocol:** In `store.js`, all internal `fetch('data/*.json')` calls append `DATA_VERSION_STRING` (`?v=...`) to ensure that fresh data is always loaded without hitting stale browser HTTP caches.
  4. **Cache Versions:** Active cache keys are `dsg_data_v70`, `dsg_admin_leagues_v28`, `dsg_admin_rounds_v27`.

---

## 30. Post-Modification Manual Verification Checklist & Step-by-Step Testing Protocol (MANDATORY)
* **The Directive:** After completing any task, bugfix, or feature edit, the assistant must **ALWAYS provide a clear, step-by-step manual verification checklist** in the final response to the user.
* **The Rule:**
  1. **Structure of the Verification Guide:**
     - **Step 1: Cache Bypass & URL Access:** Provide the exact local/production URL with latest query parameters (e.g. `http://localhost:8000/#/...` or `https://linzerask.github.io/dsg/#/...`).
     - **Step 2: Navigation & Action Steps:** Explicit step-by-step instructions on what buttons/tabs to click, dropdowns to select, or inputs to test.
     - **Step 3: Expected Visual & Data Checkpoints:** Concrete numbers, badge states, table columns, titles, or behavior to look for (e.g. exact ranks, diff values like `+17`, dynamic Meister labels, 0 NaN occurrences).
     - **Step 4: Cross-Device / Responsiveness Check (if applicable):** Mobile viewport toggle or accordion behavior check.
  2. **Core Verification Areas:**
     - **Liga Page (`#/liga`):** Check season dropdown switching, team standings count, numeric goal diffs (`+X`/`-X`), form badges, round dates, match report accordions.
     - **Homepage (`#/`):** Check count-up stats numbers, Top 5 standings, Top 4 scorers, Topspiel banner, Match Center results.
     - **Statistiken Page (`#/statistiken`):** Check tab switching (`Torschützen`, `Vereine`, `Meister`, `Fairplay`, `Rekorde`), pagination, live search, and dynamic card headers.
     - **Admin Dashboard (`#/admin`):** Check all 7 admin tabs, modal dialog openings, form saves, toast confirmations, and real-time frontend reflection.

---

## 31. Season Year Input & Display Normalization (`formatLeagueYear`)
* **The Pitfall:** (1) Using `parseInt(yearInput.value)` on season inputs stripped trailing year parts (e.g. converting `"2022/2023"` into integer `2022`), saving truncated 4-digit years into Firestore. (2) Displaying raw `l.year` on desktop tables and mobile cards resulted in single-year labels (`Jahr: 2022`) instead of full Austrian amateur season notation (`Jahr: 2022/2023`).
* **The Rule:**
  1. **Dual-Format Input Support & Normalization:** In `adminLeagues.js`, `yearInput` accepts both `YYYY` and `YYYY/YYYY` strings. Single 4-digit years are automatically expanded to `${yr}/${yr + 1}` (e.g. `2022` $\rightarrow$ `2022/2023`).
  2. **Display Normalization (`formatLeagueYear`):** All league tables, mobile cards (`admin-m-card`), and modal inputs pass `l.year` through `formatLeagueYear()`, guaranteeing that `2022` is always displayed as `2022/2023`.
  3. **Auto-Healing in `store.js`:** `Store.syncFirebase()` and `Store.getAdminLeagues()` sanitize any legacy 4-digit years into `YYYY/YYYY` and synchronize the corrected records to Firestore and `localStorage` (`dsg_admin_leagues_v29`).
  4. **Cache Versions:** Active cache keys are `dsg_data_v70`, `dsg_admin_leagues_v29`, `dsg_admin_rounds_v27`.

---

## 32. Round Season Year Formatting & Internal Key Suffix Isolation (`getDisplaySeason`)
* **The Pitfall:** In `adminRounds.js`, `getDisplaySeason(r)` was prioritizing raw internal database routing keys (`r.seasonKey || r.jahr`), causing sub-division rounds like 1. Klasse to display internal database keys (`2022/2023_1klasse`) in the `SAISON / JAHR` column and mobile card titles instead of the clean competition year (`2022/2023`).
* **The Rule:**
  1. **Strict Suffix Stripping & Season Normalization (`getDisplaySeason`):** `getDisplaySeason(r)` in `adminRounds.js` must always isolate and return the clean `YYYY/YYYY` competition season year (e.g. `2022/2023`) by prioritizing `r.jahr` and stripping internal routing suffixes (`_1klasse`, `_oberes`, `_unteres`). Single 4-digit years are expanded via `${yr}/${yr + 1}`.
  2. **Dropdown Normalization:** Modal league selection options in `adminRounds.js` display clean season years in labels (e.g. `1. Klasse (2022/2023)`) while storing the exact routing key in `data-season`.
  3. **Universal Application:** Applied across desktop datagrids, mobile cards, round inspection modal headers, and round edit forms.

---

## 33. Game Modal Round Selector & League Name Normalization
* **The Pitfall:** In `adminGames.js`, `populateFilterAndFormDropdowns()` was building round selection labels directly from `r.seasonKey`, causing 1. Klasse rounds to display raw internal keys like `1. Klasse 2022/2023_1klasse Runde 11` in the Add/Edit Match dialog instead of the clean competition format `1. Klasse 2022/2023 Runde 11`.
* **The Rule:**
  1. **Clean Display Labels:** `populateFilterAndFormDropdowns()` in `adminGames.js` extracts and normalizes the clean competition year (`2022/2023`) by stripping internal database suffixes (`_1klasse`, `_oberes`, `_unteres`) and normalizing 4-digit years.
  2. **Intact Backend Routing:** The `<option>` tag preserves `data-season-key="2022/2023_1klasse"` and `value="${r.runde}. Runde"` so match creation, team roster loading, and season recalculations remain 100% reliable.
  3. **Logical Grouping & Natural Sorting:** The round dropdown options are naturally sorted by League name, Year descending, and Round number ascending ($1 \to 2 \to 3 \dots$) for intuitive navigation.
  4. **Display League Name Helper (`getDisplayLeagueName`):** Resolves clean competition names from `leaguesData` or strips internal routing suffixes, preventing any raw database keys from appearing in match filters or search queries.

---

## 34. Homepage Visibility Decoupling & Inactive Season Administrative Edit Locking
* **The Pitfall:** (1) Checking `l.status !== 'Inaktiv'` on public views (`liga.js`, `home.js`, `store.js`) caused completed / archived seasons to disappear from the public website even when `Homepage: Ja` (`showOnHomepage: true`) was enabled. (2) Without admin-side protection, inactive historical seasons could accidentally have rounds/matches modified, deleted, or added.
* **The Rule:**
  1. **Strict Public Visibility Decoupling:** Public website views (`#/`, `#/liga`, `#/statistiken`) filter leagues strictly by `l.showOnHomepage !== false`. A league with `Status: Inaktiv` and `Homepage: Ja` remains 100% visible and browsable on the public website.
  2. **Admin-Side Inactive Season Locking:**
     - **Spielrunden (`adminRounds.js`):** Rounds belonging to an `Inaktiv` league render `Editieren` and `Löschen` as disabled/greyed out with `opacity: 0.45; cursor: not-allowed;` wrapped in a `.tooltip-trigger` displaying the interactive DSG custom floating tooltip. `Spiele ansehen` remains active and clickable.
     - **Spiele (`adminGames.js`):** Matches belonging to an `Inaktiv` league render `Bericht`, `Bearbeiten`, and `Löschen` as disabled/greyed out with the custom floating tooltip.
     - **Creation Restrictions (Strict Inactive Locking):** 
       - Adding new rounds (`+ Runde anlegen`) only allows selecting active leagues (`status === 'Aktiv'`). If no active leagues exist, the button is disabled with a floating tooltip and form submissions are blocked.
       - Adding new games (`+ Spiel anlegen`) only allows selecting rounds from active leagues. If no active leagues or rounds exist, the button is disabled with a floating tooltip and form submissions are blocked.
     - **Execution Guards:** Functions `openEditRoundModal`, `deleteRound`, `openEditGameModal`, `deleteGame`, `openReportModal`, and form handlers guard against inactive season operations and display an alert toast.
     - **Reactivation:** Switching a league back to `Aktiv` in **Ligen verwalten** immediately unlocks all administrative controls for that competition.

## 35. Custom Cursor-Following Floating Tooltip Badge System
* **The Pitfall:** Standard browser `title="..."` tooltips render as low-res OS-native dark boxes that do not track the cursor, have arbitrary system display delays, and do not follow the application's glassmorphic design language. Furthermore, native HTML `disabled` buttons swallow mouse events in several browsers, preventing tooltips from triggering reliably.
* **The Rule:**
  1. **Dynamic Cursor Tracking:** Tooltips dynamically follow the mouse pointer coordinates (`clientX`, `clientY`) via `translate3d(x, y, 0)` with smart viewport boundary collision detection (automatically flipping horizontally or vertically if close to window edges).
  2. **Athletic Glassmorphic Design:** Renders via `#dsg-floating-tooltip` in `main.js` and `global.css` with slate/emerald glass backdrop blur, subtle green border glow (`rgba(0, 230, 118, 0.3)`), crisp inline SVG lock/info icons, and Outfit typography.
  3. **Disabled Element Support:** Elements with `disabled` attributes are wrapped in `<span class="tooltip-trigger" data-tooltip="...">` with `pointer-events: none` on inner disabled buttons to ensure mouseenter/mousemove events trigger instantly across all browsers.

---

## 36. Historical Archive Ingestion & Multi-Season Database Reconstruction
* **The Pitfall:** The legacy database stored competitions under disconnected IDs using single calendar years (`2022`, `2023`, `2024`) and split Hinrunde (Autumn) and Rückrunde (Spring) across multiple database rows (e.g. Autumn 2023 under ID #3 and Spring 2024 under ID #5; Autumn 2022 under ID #1/#2 and Spring 2023 under ID #3/#4).
* **The Rule:**
  1. **Canonical Season Structure:** Reassemble historical seasons into full academic football campaigns (`2022/2023`, `2023/2024`, `2024/2025`, `2025/2026`, `2026/2027`).
  2. **Season 2022/2023 Ingestion:**
     - **DSG Liga 2022/2023 (`2022/2023`):** 14 rounds, 56 matches between 8 teams (*Hinzenbach, Schleißheim, Oed, Froschberg, Geboltskirchen, Heiligenberg, Croatia Linz, Goldwörth*).
     - **1. Klasse 2022/2023 (`2022/2023_1klasse`):** 14 rounds, 49 matches between 8/7 teams (*Auberg, Thalheim, Traun, Bruck, Gornjak, Eschenau, Walker FC*).
  3. **Data Integrity Verification:** Always verify that all 14 rounds are present in `rounds.json` (28 rounds total for Season 1) and that `Store.syncFirebase()` automatically migrates and writes full season datasets directly to Firebase Firestore without requiring manual Admin UI reactivation.

## 37. Clean Match Score Formatting & Explicit Halftime Separation
* **The Pitfall:** When match scores in the database or scraper files contain embedded halftime results in parentheses (e.g. `"4:6 (3:2)"`, `"5:2 (3:2)"`), rendering `m.score` directly inside the primary score pill badge while also rendering the secondary `.match-ht-badge` (`HT 3:2`) underneath causes the halftime score to be displayed twice (once inside the green badge and once in the small gray text below). Similarly, in the Admin Spiele table, this resulted in the `ERGEBNIS` column displaying `"4:6 (3:2)"` while the adjacent `HZ` column showed `"3:2"`.
* **The Rule:**
  1. **Primary Score Badge (`.match-score-badge`):** The main score pill badge must strictly display the clean full-time match score (e.g. `4:6`, `5:2`, `1:1`, `Abges. 3:0`, `Verschoben`, `-:-`), stripping out any parenthesized halftime suffix via `.replace(/\s*\([^)]*\)/g, '').trim()`.
  2. **Dedicated Halftime Indicator (`.match-ht-badge`):** The halftime score is displayed exclusively via the small, elegant gray badge below the score (e.g. `HT 3:2`, `HT 1:1`), resolved from `m.ht || (m.score.match(/\(([^)]+)\)/)?.[1] || '')`.
  3. **Admin Spiele Data Grid:** The `ERGEBNIS` column renders the clean full-time score (`1:1`, `5:1`), while the separate `HZ` column renders the distinct halftime score (`0:1`, `2:1`).
  4. **Consistent Implementation:** This separation is enforced consistently across all public and administrative match views: Public Liga match center (`liga.js`), Homepage Match Center (`home.js`), Admin Spiele table & mobile cards (`adminGames.js`), Admin Spielrunden match inspection modal (`adminRounds.js`), and Admin Ligen inspection modal (`adminLeagues.js`).

---

## 38. Continuous Git Synchronization Protocol (Push After Every Change)
* **The Pitfall:** Making local changes and verifying them only on `localhost:8000` leaves the remote repository and live GitHub Pages deployment (`linzerask.github.io/dsg/Website/`) in a stale state. This causes the user or external testing devices to see outdated data or missing features.
* **The Rule:**
  1. **Commit & Push After Every Task:** Whenever a feature, bugfix, UI enhancement, or dataset ingestion (e.g. adding a new season) is completed and verified, immediately stage all changed and newly created files (`git add -A`), create a descriptive conventional commit (`git commit -m "..."`), and push directly to `origin/main` (`git push origin main`).
  2. **GitHub Pages Real-Time Synchronization:** Always confirm that `origin/main` is up-to-date with local changes so that GitHub Pages and remote clients reflect the current state without manual intervention.

---

## 39. Database Step-by-Step State: Seasons 2022/2023 & 2023/2024 Locked and Verified
* **The Milestone:** The database is strictly locked and verified for **Season 2022/2023** (DSG Liga & 1. Klasse) and **Season 2023/2024** (DSG Liga).
* **The Exact Statistics & Milestones (2022/2023 + 2023/2024):**
  1. **Season 2022/2023 DSG Liga:** Champion Union Heiligenberg (30 Pkt), #2 DSG St. Josef/Oed FC (30 Pkt), #3 FC U. Schleißheim (27 Pkt). Top Scorer: Michael Haslehner (21 Tore).
  2. **Season 2022/2023 1. Klasse:** Champion DSG Thalheim (31 Pkt), #2 Union Eschenau (24 Pkt), #3 Walker FC (23 Pkt). Top Scorer: Aaron Außermair (15 Tore).
  3. **Season 2023/2024 DSG Liga:** Champion SV Croatia Linz (38 Pkt), #2 Union Heiligenberg (37 Pkt), #3 FC Hinzenbach (35 Pkt). Top Scorer: Roland Meindlhumer (34 Tore).
  4. **All-Time Historical Totals Across Ingested Seasons (2022/2023 & 2023/2024):**
     - **Total Documented Competitions:** 3 Leagues (`2022/2023`, `2022/2023_1klasse`, `2023/2024`)
     - **Total Matches:** 213 matches (105 in 2022/23 across 2 leagues + 108 in 2023/24)
     - **Total Played Matches:** 206
     - **Total Goals Recorded:** 1,011
     - **Total Unique Scorers:** 245
     - **All-Time Top 3 Scorers:**
       1. **Roland Meindlhumer** (FC Hinzenbach): **52 Tore** (18 in 22/23 + 34 in 23/24)
       2. **Thomas Paulmair** (DSG St. Josef/Oed FC): **26 Tore**
       3. **Michael Haslehner** (Union Heiligenberg): **23 Tore**
     - **Current Cache Keys:** `dsg_data_v80`, `dsg_admin_leagues_v36`, `dsg_admin_rounds_v35`, query string `?v=1790560100000`.

---

## 40. Top Scorer and Card Event Player Property Normalization
* **The Pitfall:** In match event statistics and season datasets, individual scorer and card entries historically mapped the athlete's name under `player` (or in legacy views under `name`). Accessing only `s.name` in UI views (`liga.js`, `home.js`, `statistiken.js`, `adminLeagues.js`) caused the player name to render as `undefined` in the public Liga Top Torjäger / Karten tab.
* **The Rule:**
  1. **Dual Property Normalization:** `Store.getStats()` must always normalize all `topScorers` and `cards` entries to guarantee both `name: s.name || s.player || ''` and `player: s.player || s.name || ''`.
  2. **Safe Template Literal Fallback:** All UI views rendering scorers and disciplinary cards must use `${s.player || s.name || ''}` to guarantee robust display across all historical seasons and newly filed match reports.

---

## 41. Database Step-by-Step State: Season 2024/2025 Ingested & Verified
* **The Milestone:** The database now contains **Season 2022/2023**, **Season 2023/2024**, and **Season 2024/2025** (comprising Grunddurchgang, Oberes Playoff, and Unteres Playoff).
* **The Exact Statistics & Milestones for 2024/2025:**
  1. **Season 2024/2025 Grunddurchgang (`2024/2025`):** 11 teams, 11 rounds, 55 matches. #1 SV Croatia Linz (26 Pkt), #2 DSG St. Josef/Oed FC (22 Pkt), #3 FC U. Schleißheim (21 Pkt). Top Scorer: Julian Fischer (15 Tore).
  2. **Season 2024/2025 Oberes Playoff (`2024/2025_oberes`):** 6 teams, 5 rounds, 15 matches. Champion SV Croatia Linz (12 Pkt), #2 DSG St. Josef/Oed FC (10 Pkt), #3 FC Hinzenbach (9 Pkt). Top Scorer: Roland Meindlhumer (13 Tore).
  3. **Season 2024/2025 Unteres Playoff (`2024/2025_unteres`):** 5 teams, 5 rounds, 10 matches. #1 Union Eschenau (10 Pkt), #2 Union Heiligenberg (9 Pkt), #3 DSG Froschberg (6 Pkt). Top Scorer: Michael Haslehner (11 Tore).
  4. **All-Time Historical Totals Across 6 Competitions (2022/2023, 2023/2024, 2024/2025):**
     - **Total Documented Competitions:** 6 Leagues (`2022/2023`, `2022/2023_1klasse`, `2023/2024`, `2024/2025`, `2024/2025_oberes`, `2024/2025_unteres`)
     - **Total Matches:** 293 matches
     - **Total Played Matches:** 284 matches
     - **Total Goals Recorded:** 1,433 goals
     - **Total Unique Scorers:** 308 scorers
     - **All-Time Top 3 Scorers:**
       1. **Roland Meindlhumer** (FC Hinzenbach): **65 Tore** (18 in 22/23 + 34 in 23/24 + 13 in 24/25 Oberes Playoff)
       2. **Thomas Paulmair** (DSG St. Josef/Oed FC): **37 Tore** (14 in 22/23 + 12 in 23/24 + 8 in 24/25 Grund + 3 in 24/25 Oberes)
       3. **Michael Haslehner** (Union Heiligenberg): **34 Tore** (21 in 22/23 + 2 in 23/24 + 11 in 24/25 Unteres)
## 42. All-Time Club Standings Goal Aggregation Property Mapping
* **The Pitfall:** In `statistiken.js` (`computeAllTimeStats`), aggregating historical club statistics attempted to read `t.gf` and `t.ga` from season team objects. Because the canonical database keys defined in `liga.json` / `store.js` are `goalsFor` and `goalsAgainst`, `t.gf` and `t.ga` were `undefined`, causing the *Ewige Vereinstabelle* to display `0:0` for Tore and `0` for Diff for all teams.
* **The Rule:**
  1. **Canonical Property Resolution:** All team statistics aggregators must read `t.goalsFor ?? t.gf ?? 0` and `t.goalsAgainst ?? t.ga ?? 0`.
  2. **Tiebreaker Sorting:** Club and champion sorting logic must consistently use `(t.goalsFor ?? t.gf ?? 0)` and `(t.goalsAgainst ?? t.ga ?? 0)` when comparing goal differences and goals scored.

---

## 43. Season Honors Top Scorer Resolution Protocol
* **The Pitfall:** When extracting the top scorer for historical honor cards (`seasonHonors`), reading only `topScorer.name` caused players stored with `player` (e.g. Roland Meindlhumer with 34 goals in Season 2023/2024) to evaluate to `undefined`, making the entire `Torschützenkönig:` line disappear from the card.
* **The Rule:**
  1. **Dual Name Resolution:** Always resolve top scorers with `topScorer ? (topScorer.name || topScorer.player || 'N/A') : 'N/A'`.
  2. **Sorting Assurance:** Season honors top scorer selection must dynamically sort by `(b.goals || 0) - (a.goals || 0)` to guarantee the top athlete is selected.

---

## 44. Human-Readable Competition & Season Label Normalization in Records
* **The Pitfall:** In `statistiken.js` (`computeAllTimeStats` & Records tab), passing raw database keys (`seasonKey`) directly into user-facing record cards caused labels to print internal strings such as `2024/2025_oberes`, `2022/2023_1klasse`, or truncated league names like `in der Saison DSG Liga`.
* **The Rule:**
  1. **Dynamic Formatter (`formatSeasonDisplay`):** Always route competition keys through `formatSeasonDisplay(seasonKey)`. This resolves the canonical name and academic year from `Store.getAdminLeaguesSync()` (e.g. `DSG Liga 2023/2024`, `Oberes Playoff 2024/2025`, `1. Klasse 2022/2023`).
  2. **Consistency Across All Records:** Apply `formatSeasonDisplay` uniformly to `Saison-Torrekord`, `Torreichstes Spiel`, `Höchster Sieg`, `Rekordmeister`, `Die Schießbude`, and `Torreichster Spieltag`.

---

## 45. Database Step-by-Step State: Season 2025/2026 Ingested & Verified
* **The Milestone:** The database now contains **7 competitions** spanning 3 academic football years (2022/2023, 2023/2024, 2024/2025, 2025/2026).
* **The Exact Statistics & Milestones for 2025/2026:**
  1. **Season 2025/2026 DSG Liga (`2025/2026`):** 8 teams, 14 rounds, 56 matches. Champion **SV Croatia Linz** (38 Pkt), #2 DSG St. Josef/Oed FC (33 Pkt), #3 Union Heiligenberg (24 Pkt). Top Scorer: **Roland Meindlhumer** (20 Tore).
  2. **Teams:** SV Croatia Linz, DSG St. Josef/Oed FC, Union Heiligenberg, FC Hinzenbach, Walker FC, FC Gornjak, DSG Union Traun, Union Eschenau.
  3. **Disciplinary Totals:** 138 Yellow, 5 Yellow-Red, 0 Red across 98 players.
  4. **All-Time Historical Totals Across 7 Competitions:**
     - **Total Documented Competitions:** 7 Leagues (`2022/2023`, `2022/2023_1klasse`, `2023/2024`, `2024/2025`, `2024/2025_oberes`, `2024/2025_unteres`, `2025/2026`)
     - **Total Matches:** 349 matches
     - **Total Goals Recorded:** ~1,800+
     - **All-Time Top 3 Scorers:**
       1. **Roland Meindlhumer** (FC Hinzenbach): **85 Tore** (18 in 22/23 + 34 in 23/24 + 13 in 24/25 Oberes + 20 in 25/26)
       2. **Thomas Paulmair** (DSG St. Josef/Oed FC): **51 Tore** (14 in 22/23 + 12 in 23/24 + 8+3 in 24/25 + 14 in 25/26)
       3. **Michael Haslehner** (Union Heiligenberg): **47 Tore** (21 in 22/23 + 2 in 23/24 + 11 in 24/25 Unteres + 13 in 25/26)
     - **Current Cache Keys:** `dsg_data_v82`, `dsg_admin_leagues_v38`, `dsg_admin_rounds_v37`, query string `?v=1790560210000`.


---

## 46. Database Step-by-Step State: Current Season 2026/2027 Ingested & Verified
* **The Milestone:** The database now contains all **8 competitions** spanning 4 academic football years (2022/2023, 2023/2024, 2024/2025, 2025/2026, 2026/2027). Season 2026/2027 is the active current championship.
* **The Exact Statistics & Current Standings for 2026/2027:**
  1. **Season 2026/2027 DSG Liga (`2026/2027`):** 7 teams, 9 rounds, 27 matches (11 completed/decided, 16 scheduled/upcoming).
  2. **Teams (7 Clubs):** Union Heiligenberg, SV Croatia Linz, Etehad Linz (new club), DSG Union Traun, FC Gornjak, Walker FC, DSG St. Josef/Oed FC.
  3. **Current Standings (Active Season):**
     - #1 **Union Heiligenberg** (9 Pkt, 3 Sp, 18:0 Tore, Diff: +18)
     - #2 **SV Croatia Linz** (9 Pkt, 3 Sp, 15:4 Tore, Diff: +11)
     - #3 **Etehad Linz** (6 Pkt, 3 Sp, 12:8 Tore, Diff: +4)
     - #4 **DSG Union Traun** (4 Pkt, 4 Sp, 9:15 Tore, Diff: -6)
     - #5 **FC Gornjak** (3 Pkt, 3 Sp, 4:12 Tore, Diff: -8)
     - #6 **Walker FC** (1 Pkt, 3 Sp, 0:11 Tore, Diff: -11)
     - #7 **DSG St. Josef/Oed FC** (0 Pkt, 3 Sp, 2:10 Tore, Diff: -8)
  4. **Top 5 Scorers (2026/2027):**
     1. **Leonardo Glavas** (SV Croatia Linz): **5 Tore**
     2. **Dominik Penninger** (Union Heiligenberg): **4 Tore**
     3. **Zia Ghaderi** (Etehad Linz): **4 Tore**
     4. **Hamid Fouladi** (Etehad Linz): **4 Tore**
     5. **Dominik Prilmüller** (DSG Union Traun): **3 Tore**
  5. **Disciplinary Cards (2026/2027):** 26 cards recorded (25 Yellow, 1 Red).
  6. **All-Time Historical Totals Across All 8 Competitions:**
     - **Total Documented Competitions:** 8 Leagues (`2022/2023`, `2022/2023_1klasse`, `2023/2024`, `2024/2025`, `2024/2025_oberes`, `2024/2025_unteres`, `2025/2026`, `2026/2027`)
     - **Total Matches in Database:** 376 matches (353 played/forfeit, 16 unplayed)
     - **All-Time Top 3 Scorers:**
       1. **Roland Meindlhumer** (FC Hinzenbach): **85 Tore**
       2. **Thomas Paulmair** (DSG St. Josef/Oed FC): **51 Tore**
       3. **Michael Haslehner** (Union Heiligenberg): **47 Tore**
     - **Current Cache Keys:** dsg_data_v83, dsg_admin_leagues_v40, dsg_admin_rounds_v40, query string ?v=1790560800000.

---

## 47. Non-Destructive Firebase Synchronization & Admin Status Persistence (Leagues & Rounds)
* **The Pitfall:** When an administrator toggled a league's status (e.g. from Aktiv to Inaktiv), the updated status reverted back to Aktiv upon refreshing the browser page. This occurred because Store.init() / syncFirebase() unconditionally fetched the static JSON seed files (data/leagues.json and data/rounds.json) on every page reload, overwriting local storage and Firestore with the static default status (Aktiv). Additionally, cache version keys were mismatched (dsg_admin_leagues_v38 in save vs 39 in load).
* **The Rule:**
  1. **Authoritative Timestamp Synchronization:** syncFirebase() must never unconditionally overwrite leagues or rounds from static seed files. Instead, it compares the local update timestamp (dsg_leagues_last_updated, dsg_rounds_last_updated) with the Firestore timestamp (lastUpdated).
  2. **Timestamp Evaluation Flow:**
     - If bTime > localTime: apply the cloud state locally and update localStorage.
     - If localTime > fbTime: push the local modifications to Firestore.
     - **Only Fallback on Empty:** Fetch from data/leagues.json / data/rounds.json if and only if neither local storage nor Firestore contains any data.
  3. **Version Key Parity:** Always ensure cache version keys match strictly across Store.init() cleanup whitelists, loadLocal, trySetLocal, and save methods (dsg_admin_leagues_v40, dsg_admin_rounds_v40).

---

## 48. Dynamic Next-Match Round Selection Algorithm (Spiele Round Slider)
* **The Pitfall:** Defaulting the public matchday round slider (`#tab-spiele` in `liga.js`) to round index `0` (Round 1) or an arbitrary round forced visitors to manually click through the slider to find the current upcoming match during an active season. Conversely, naively taking `rounds[rounds.length - 1]` caused unplayed rounds in active seasons to jump to the very end of the year instead of the immediate next matchday.
* **The Rule:**
  1. **Active Season Chronological Next-Match Resolution:**
     - For active/ongoing seasons (`isCurrent` or active match schedule), scan all rounds and unplayed matches (`score === '-:-'`, unplayed status).
     - Parse match date and time into exact epoch timestamps (`parseMatchTimestamp(m.date, m.time)`).
     - Sort unplayed matches chronologically by timestamp ascending (with round number as tiebreaker).
     - Dynamically set the default selected slide (`initialRoundIdx`) and dropdown value to the round containing the **earliest upcoming match**.
     - *Example:* For season 2026/2027, matches in Round 5 on `02.10.2026` / `03.10.2026` precede the rescheduled Round 4 match on `13.10.2026`, correctly opening **5. Runde** by default.
  2. **Completed Seasons Fallback:** For past or finished seasons (where all matches have completed scores or forfeit status), default `initialRoundIdx` to the **final round of the season** (`lastPlayedIdx`) so visitors immediately see the championship finale and final match results.
  3. **Dropdown & Arrow State Synchronization:**
     - The custom round dropdown (`.round-select-dropdown`) and navigation chevrons (`.prev-round`, `.next-round`) must automatically synchronize their selected index, button opacities, and pointer-event states on initialization and whenever switching rounds.
  4. **Fast First-Visit Eager Population:**
     - `Store.syncFirebase()` must eagerly populate `state.memoryData`, `dsg_admin_leagues_v40`, and `dsg_admin_rounds_v40` from static JSON files on first visit and dispatch `data-updated` / `rounds-updated` / `leagues-updated` so that the round slider renders immediately without waiting for cloud timeouts.


---

## 49. League-to-Round Active Status Inheritance & Academic Year Matching Integrity
* **The Pitfall:** In `adminRounds.js`, helper functions (`isLeagueActive`, `getDisplayLeagueName`, `openEditRoundModal`, `deleteRound`, `roundForm.onsubmit`) used a loose fallback matching condition `|| (l.name && (r.liga === l.name || r.saison === l.name))`. Because `leaguesData` is sorted with newest leagues first (`DSG Liga 2026/2027` at index 0), any past season named `"DSG Liga"` (e.g. `DSG Liga 2022/2023`) loosely matched `DSG Liga 2026/2027` (which is `Aktiv`), causing rounds of inactive historical leagues to falsely display green `Aktiv` status badges and maintain active Edit/Delete buttons.
* **The Rule:**
  1. **Dedicated `findMatchingLeague(r)` Resolver:**
     - Always resolve a round's parent league in `adminRounds.js` through a strict multi-tier algorithm:
       1. **Exact `seasonKey` match:** Match `l.seasonKey === r.seasonKey`.
       2. **Year Prefix + Sub-Division match:** Extract 4-digit academic start year from `r.jahr` / `r.seasonKey` (e.g. `2022`) and compare strictly with `l.year` / `l.seasonKey`. Ensure sub-division qualifiers (`1. Klasse`, `Oberes Playoff`, `Unteres Playoff`) match identically between round and league.
       3. **Never perform unconstrained name comparisons:** Never allow a bare string comparison like `r.liga === l.name` without verifying the year prefix.
  2. **Strict Inactive Round Protection & UX:**
     - When a parent league is `Inaktiv`, its rounds must:
       - Display a grey `Inaktiv` badge in both desktop table and mobile card accordion views.
       - Disable `Editieren` and `Löschen` buttons with `disabled`, `pointer-events: none`, opacity reduction, and a hover tooltip explaining: *"Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter 'Ligen verwalten' auf 'Aktiv'."*
       - Allow `Spiele ansehen` inspection to remain fully functional.
       - Accurately filter under the `#round-status-filter` (`Nur Aktiv` vs `Nur Inaktiv`).
     - Form submissions in `adminRounds.js` (`roundForm.onsubmit`) must validate the active state via `findMatchingLeague` before writing new rounds.
