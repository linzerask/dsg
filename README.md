# DSG Liga - Project Documentation & Lessons Learned

Welcome to the DSG Liga website project! This document serves as a record of the workflow, architecture, and the common pitfalls we encountered during development. It's designed to help you (and anyone else working on the project) avoid making the same mistakes twice.

## 1. The LocalStorage Caching Trap
**What Happened:** We updated the `liga.json` database with new stats and cards, but the website kept showing the old data.
**The Lesson:** The app uses `localStorage` to cache data in the browser to load faster. In `Website/js/store.js`, the cache is tied to a version key (e.g., `dsg_data_v6`). **Every time you manually update `liga.json`, you MUST increment this version key in `store.js`** (e.g., to `dsg_data_v7`). Otherwise, the browser will stubbornly refuse to fetch the new JSON file.

## 2. CORS and Local File Restrictions
**What Happened:** Opening `index.html` directly by double-clicking it caused the page to be blank or fail to load data.
**The Lesson:** Modern browsers block JavaScript from fetching local JSON files (like `data/liga.json`) for security reasons (CORS policies). **You must run a local web server** to view the site properly during development.
*Command to run inside the `Website` folder:* `python -m http.server 8000`
*URL to visit:* `http://localhost:8000`

## 3. Directory Structure Changes
**What Happened:** Moving files around (e.g., into the new `Website` folder) temporarily broke our setup.
**The Lesson:** The site relies on relative paths. All core folders (`css/`, `js/`, `data/`, `assets/`) must stay bundled alongside `index.html`. If you move the project, move the entire `Website` folder as a single unit. Always remember to restart your local server in the *new* directory location.

## 4. UI/UX: Hover Effects & Inline JS
**What Happened:** Attempting to add an `onmouseover` hover effect using inline JavaScript inside a string literal caused quotes to collide, breaking `liga.js` entirely and resulting in a white screen of death.
**The Lesson:** Avoid inline JavaScript (`onmouseover="..."`) inside generated HTML strings. It's a quoting nightmare. Instead, add a clean CSS class (like `.link-btn`) to `global.css` and rely on standard CSS `:hover` pseudoclasses. It's cleaner, safer, and much easier to maintain.

## 5. ID Mismatches in JavaScript Event Listeners
**What Happened:** The "Alle anschauen" buttons wouldn't expand the cards list.
**The Lesson:** We generated the HTML button IDs using English keys (`yellow`, `yellowRed`, `red`) but tried to attach the click listeners using a loop with German keys (`gelb`, `gelbrot`, `rot`). Always ensure that the data keys used to generate DOM IDs perfectly match the keys used in your event listeners!

## 6. Data Entry: Reading the Icons
**What Happened:** Players with a "Gelb-Rot" (yellow-red) card were accidentally entered into the database as having a straight "Rot" (red) card.
**The Lesson:** Pay close attention to the overlapping UI icons in screenshots. A red card sitting slightly behind a yellow card denotes a Yellow-Red booking, not a straight Red booking. Double-check the raw data objects when appending bulk statistics.

## 7. Mobile Responsiveness & Layout Architecture
**What Happened:** The Organisation page layouts (Funktionäre grids, large document titles) looked great on desktop but were severely squished or overflowed the screen on mobile devices.
**The Lesson:** Always design with responsive mobile fallbacks.
- Switch multi-column grids to vertical stacked columns (`flex-direction: column`) on small screens (`max-width: 768px`).
- Use `clamp()` for fluid typography rather than fixed `rem` sizes.
- Extremely long compound words (common in German, e.g., "Meisterschaftsbestimmungen") require `word-break: break-word` and `hyphens: auto` to prevent them from breaking outside their glass containers.
- Avoid centering absolute pseudo-elements (like nav underlines) if the menu alignment changes on mobile (e.g., from center-aligned top bar to left-aligned drawer). Use `left: 0` and `transform-origin: left`.

## 8. Automated Scoring & Cancelled Matches
**What Happened:** Replacing the ambiguous `Strafverifiziert 3:0` with `Abgesagt 3:0` and `Abgesagt 0:3` required deep changes to the score calculation logic.
**The Lesson:** Any status that should automatically allocate points (like Walkovers or specific Cancelled matches) MUST be explicitly handled in `store.js` inside both `_applyMatchStats` and `_reverseMatchStats`. Furthermore, planned matches that haven't occurred yet should use the `Ausstehend` status with NO entered results (represented visually as `-:-`) to ensure they are cleanly ignored by the statistical engine.

## 9. Mobile Accordions in Dense Data Tables
**What Happened:** The league table expanded to 10 columns (adding Siege, Unentschieden, Niederlagen, Diff), which made it impossible to fit on a mobile screen.
**The Lesson:** When dealing with dense data tables, use a `hide-mobile` utility class (which sets `display: none;` via media query) to hide secondary columns on small screens. To maintain access to this data, implement a clickable accordion (like `.has-table-accordion`) that expands a hidden drawer (`.table-accordion`) showing the full breakdown. Always ensure your JavaScript query selectors (e.g., `card.querySelector('.table-accordion')`) are highly specific to the container being clicked to avoid triggering the wrong animations on the same page.
