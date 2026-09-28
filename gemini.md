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
     - The floating navigation pill expands to full screen width on mobile (`calc(100% - 28px)`), displays the DSG logo on the left, **centered bold green title `DSG Fußballmeisterschaft`** (`.brand-mobile-title`, `color: var(--color-accent)`, `position: absolute; left: 50%; transform: translateX(-50%);`) in the middle, and the crisp SVG hamburger button (`#open-drawer`) on the right.
     - On desktop (`> 768px`), `.brand-mobile-title` is hidden (`display: none;`) to maintain the clean pill aesthetic.
     - Never add inline `style="display: none"` directly into `#open-drawer` HTML tags, as inline styles override responsive `@media (max-width: 768px)` stylesheet rules.
     - Opening the mobile drawer activates `#drawer-overlay` with backdrop blur, and tapping anywhere outside the drawer or selecting any nav link automatically closes the drawer with Anime.js spring animations.
  2. **Admin Tab Navigation:** On mobile screens, the admin navigation transforms into an **Accordion / Collapsible Dropdown Drawer**. The toggle button displays the current active tab name and an animated SVG chevron that rotates on open/close. Selecting any tab switches the view and collapses the menu automatically.
  3. **Mobile Data Cards (`.admin-m-card`):** Complex desktop tables switch to touch-friendly card accordions on screens `<= 768px`.
  4. **Fluid Typography & Containers:** Use `clamp()`, `word-break: break-word`, and `hyphens: auto` for long German compound words (e.g., *Meisterschaftsbestimmungen*, *Datenschutzerklärung*). Grids must collapse to single columns (`grid-template-columns: 1fr`).

---

## 5. Modal Viewport Centering & Outside-Click Dismissal
* **The Rule:**
  1. **Centering:** All dialog modals (`#player-modal`, `#game-modal`, `#round-modal`, `#team-modal`, `#league-modal`, `#league-data-modal`, `#report-modal`) must be fixed and centered in the active viewport:
     ```css
     position: fixed;
     inset: 0;
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 9999;
     background: rgba(0, 0, 0, 0.65);
     backdrop-filter: blur(4px);
     ```
  2. **Outside-Click Dismissal:** Clicking anywhere on the darkened backdrop outside the modal content container must automatically close the modal.
  3. **Mobile Bounds:** Modal cards must have `max-width: calc(100vw - 24px)` and `max-height: 90vh` with smooth internal scrolling (`overflow-y: auto`).

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
