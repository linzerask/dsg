# Gemini AI - Project Memory & System Directives

This document is a persistent memory file for Gemini/Antigravity. Read this before making structural changes to the DSG Liga project to avoid repeating past mistakes.

## 1. Caching Protocol (CRITICAL)
The frontend implements aggressive caching via `localStorage` in `Website/js/store.js`. 
- **The Mistake:** Modifying `Website/data/liga.json` without bumping the cache key, causing the AI to hallucinate that the changes were broken or missing.
- **The Rule:** Whenever you write or append to `liga.json`, you MUST simultaneously open `store.js` and increment the storage key (e.g., `dsg_data_v6` -> `dsg_data_v7`). There are three instances of this key in `store.js` that must be replaced.

## 2. String Literal Escaping & DOM Manipulation
- **The Mistake:** Injecting complex inline `onmouseover` styles into a Javascript template literal that already contained nested quotes. This broke the JS syntax and crashed the view.
- **The Rule:** NEVER use inline Javascript for styling or hover states. ALWAYS define a class in `Website/css/global.css` and apply that class in the JS string literal. Keep HTML strings in JS as dumb and clean as possible.

## 3. Key Mapping Disconnects
- **The Mistake:** Generating HTML elements dynamically using one set of keys (English: `yellow`, `yellowRed`, `red`) while iterating over a different set of keys (German: `gelb`, `gelbrot`, `rot`) to bind event listeners via `document.getElementById()`.
- **The Rule:** Trace the exact variable used to generate an ID in the HTML template back to the event listener loop. Ensure language uniformity (prefer English for keys/IDs, German for user-facing labels).

## 4. Local Server Awareness
- **The Mistake:** Failing to realize the user was opening `index.html` via the `file://` protocol, which blocks `fetch('data/liga.json')` due to CORS. 
- **The Rule:** If the user reports "no content" or a blank screen after a fresh load, verify that the local Python server is running in the correct root directory (`Website/`), and remind the user to use `http://localhost:8000`.

## 5. Visual Data Transcription
- **The Mistake:** Misinterpreting an overlapping yellow-and-red card icon as a straight red card during bulk data entry from images.
- **The Rule:** When parsing sports statistics from screenshots, look closely at icon composites. A Yellow-Red card is a distinct statistical category from a straight Red card. Map data specifically to `yellowRed` vs `red` integer counts.

## 6. Directory Context
- **The Rule:** All web assets have been moved to the `Website/` subdirectory. Do not attempt to write or edit files in the root `DSG Liga/` directory (except for these markdown documentation files). Ensure scripts have the correct `Cwd` or path targets.

## 7. Mobile Responsiveness & Layout Architecture
- **The Rule:** When designing pages (like the `Organisation` page), always implement responsive CSS (using `@media (max-width: 768px)`).
- **The Pitfall:** Hardcoded widths, rigid grids without `flex-wrap`, and missing font clamps (`clamp()`) lead to text overflowing or UI elements squishing on mobile devices.
- **The Fix:** Ensure grids switch to stacked flex columns on mobile (e.g. `grid-template-columns: 1fr` or `flex-direction: column`). Use `word-break: break-word` and `hyphens: auto` alongside `clamp()` for long compound words (like "Meisterschaftsbestimmungen") so they fit inside screen bounds without horizontally scrolling or clipping.

## 8. Match Status & Automatic Scoring
- **The Rule:** The old `Strafverifiziert 3:0` status was deleted and replaced by directionally-aware `Abgesagt 3:0` and `Abgesagt 0:3` statuses. These new statuses trigger automated points and score assignments in `store.js` (`_applyMatchStats` and `_reverseMatchStats`), while visually rendering in red with no Halftime score on the Liga page. Furthermore, planned matches should use the `Ausstehend` status with NO entered results (`-:-`) so they are ignored by points calculation.

## 9. Mobile Accordions in Complex Tables
- **The Rule:** The main league table in `liga.js` displays 10 columns on desktop using a complex CSS grid. To maintain readability on mobile devices, secondary stats (like S, U, N, Sp, Tore, Diff) are hidden using a `hide-mobile` class.
- **The Fix:** We implemented a slide-down accordion (powered by Anime.js) attached to `.has-table-accordion` row elements, revealing the hidden stats upon tapping. Always ensure query selectors accurately target the local accordion (`.table-accordion` vs `.events-accordion`) to prevent event collisions between different interactive components on the same page.
