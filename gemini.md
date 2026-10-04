# DSG Liga — Project Rules, Lessons Learned & Design Standards

This document serves as the persistent memory and operational guideline for all graphic design, background rendering, and asset composition workflows for DSG Liga. Always analyze and strictly adhere to these rules before executing any user instructions.

---

## 1. Core Brand & Visual Identity
- **Primary Brand Green:** `#00b341` (DSG Liga primary green).
- **Approved Aesthetic Reference:** Sporting CP "Game Day" poster style.
  - **Atmospheric Palette:** Vibrant emerald highlights (`#24b262` / `#20a85c`), rich midtones (`#008f33`), and deep dark-room stadium shadows (`#021c0e` down to `#010e07`).
  - **Surface & Texture:** Organic fine grain, subtle cloud/canvas micro-contrast, and directional/radial light falloff.
  - **Underlying Elements:** Authentic football stadium night atmosphere, floodlights, or dynamic geometric wave/radial curves (39 curated production backgrounds in `Wallpapers/Backgrounds/`).
- **Anti-Patterns (What NOT to do):**
  - NEVER use flat linear tint overlays or raw semi-transparent blocks over photos.
  - NEVER use muddy or washed-out green shades.
  - NEVER stretch or distort images when fitting to square aspect ratios. Always crop proportionally with visual centering.

---

## 2. Graphic Asset & Layout Standards (1080 × 1080 px)
- **Standard Canvas Format:** 1080 × 1080 px (1:1 square), 300/72 DPI RGB.
- **Top Header Logo:**
  - File: `Wallpapers/Logos/standard/DSGLiga_white.png`
  - Position: Horizontally centered at the top (`header_y = 52px`, `target_w = 280px`). Bounding box: `x = [400, 675]`, `y = [53, 156]`.
  - **Identical across all covers, matchday cards, and result wallpapers for seamless visual alignment.**

---

## 3. Standard Round Wallpaper Suite Specifications

For each round (e.g. Runde 4, 5, 6, 7, 8...), the following wallpaper types are produced:

### A. Cover Wallpaper
- **DSG Header Logo:** Centered at `y = 52px`.
- **Title Block:** Centered vertically in canvas (approx `center_y = 560px`).
  - Line 1: `SAISON 26/27` (Impact font, tracking `6 * SCALE`).
  - Line 2: `RUNDE X` (Impact font, large `210 * SCALE` with signature razor slice line: 5.5px diagonal slice).

### B. Multi-Game Overview Wallpaper (Upcoming Fixtures)
- Groups all matches occurring in the **same week / weekend**.
- If a match is scheduled weeks later (e.g. postponed or separated fixture), it receives its own dedicated overview / matchday card.
- **Sizing & Tight Spacing Standard (V3 Approved):**
  - Crests offset from center: `x_offset = 150px` (`center_x_home = 390px`, `center_x_away = 690px`, `gap to V = ~70px`).
  - 2-Game Weeks: `crest_size = 185px`, row centers `y = [480, 750]`, divider at center.
  - 3-Game Weeks: `crest_size = 145px - 150px`, row centers `y = [430, 640, 850]`, dividers at center.

### C. Single Game Matchday Wallpaper (V3 Approved)
- **Header Block:** `SAISON 26/27` + `RUNDE X` centered at `y = 270px`.
- **Matchup (Center `y = 615px`):** `HOME CREST` (Left, `x = 270px`) — `V` (Center `x = 540px`, Impact font) — `AWAY CREST` (Right, `x = 810px`).
  - **Equalized Breathing Room:** Mathematically balanced spacing (~165px top gap from `RUNDE X`, ~170px bottom gap to match details).
- **Match Details (Bottom Info Bar at `y = 915px`):**
  - Line 1: `TIME, DATE` in format `HH:MM, DD.MM.` or `HH:MM UHR, DD.MM.` (Impact font).
  - Line 2: `LOCATION` (e.g., `SPORTPLATZ TRAUN`, `DSG-PLATZ`) in Impact font (`y = 949px`).

### D. Result Wallpaper
- **Header Block:** `SAISON 26/27` + `RUNDE X` centered at `y = 270px`.
- **Matchup & Scoreboard (Center `y = 560px`):**
  - Crests: Left (`x = 270px`), Right (`x = 810px`), height `270px`.
  - Main Score: Floating bold `X : Y` (or `- : -` for templates) in large Impact font (`120px`), centered at `y = 560px`.
  - Half-Time Score: `HZ (A:B)` or `HZ (-:-)` placed directly below main score in lighter contrast (`36px`).
- **Events (Scorers & Cards) — Spine-Aligned Standard (Starts at `y = 725px`):**
  - **Sorting Order:** **Scorers First, Bookings Last** (Goals ⚽ always at the top of the event list, followed by Yellow Cards 🟨, and finally Red Cards 🟥).
  - **Home Team (Left):** Player Name first, followed by event icon: `Player Name (Multiplier) [Icon]` (right-aligned towards center spine).
  - **Away Team (Right):** Event icon first, followed by player name: `[Icon] Player Name (Multiplier)` (left-aligned from center spine).
  - **Icon Conventions & Colors:**
    - ⚽ **Goal (Soccer Ball):** Realistic vector football icon (white base circle, central dark pentagon `#191919`, radiating seam lines, 5 outer perimeter dark patches, crisp white outline). Multi-goals use multiplier format: `Player Name (4x) ⚽` or `⚽ Player Name (3x)`.
    - 🟨 **Yellow Card:** Filled vibrant football card yellow (`#FFCD00` / `RGB(255, 205, 0)`) with rounded corners and a clean subtle white keyline outline (`RGBA(255, 255, 255, 220)`).
    - 🟥 **Red Card:** Filled vibrant football card red (`#E6232D` / `RGB(230, 35, 45)`) with rounded corners and a clean subtle white keyline outline (`RGBA(255, 255, 255, 220)`).
- **Bottom Info Bar:** Compact `TIME, DATE` at `y = 915px` and `LOCATION` at `y = 949px` in Impact font.

---

## 4. 2K Vector Monochrome Crest Standard
- **Location:** `Wallpapers/Logos/Monochrom/`
- **Resolution:** 2K ($2048 \times 2048$ px) transparent PNGs and fully layered PSDs.
- **Linework Quality:** Pure solid white line art ($RGB = 255, 255, 255$), rendered with 4K supersampling and Lanczos downscaling for anti-aliased sharpness.
- **PSD Layer Organization:** Named component layers for each element (`Shield Outline`, `Wreath/Leaves`, `Center Symbols`, `Typography`, `Border Rings`).

---

## 5. Background Strategy & Round Consistency Standard
- **Round-Level Consistency:** Use **ONE consistent background** across all cards of a specific round (Cover, Multi-Game Overviews, Single Matchdays, and Results) to maintain a cohesive visual identity for each round.
- **Inter-Round Diversity:** Change/rotate to a fresh, distinct background from the 39 production backgrounds in `Wallpapers/Backgrounds/` whenever moving to a **new round** (e.g., Runde 4 = `stadium_green_19`, Runde 5 = `stadium_green_07`, Runde 6 = `pattern_green_14`, etc.).

---

## 6. Strict File Management & Approval Gate Rules
1. **Strict Destination Gate:** All working drafts, newly generated wallpapers, PNG previews, and work-in-progress `.psd` files MUST remain in `Wallpapers/Test/`.
2. **Never Save to `Ready/` or `Templates/` Prematurely:** Do NOT write or move files into `Wallpapers/Ready/` or `Wallpapers/Templates/` until the user explicitly says the draft is approved and ready.
3. **Automated Visual Self-Testing:** Always inspect and verify generated outputs with high-res comparison sheets before presenting them to the user.

---

## 7. Website & News Editor Standards
- **Dynamic DOM Querying for RTE:** Always query `#rte-editor` actively via `document.getElementById('rte-editor')` inside submit and edit handlers. Never rely on stale module-scope closure variables that may have been initialized before DOM mounts or re-renders.
- **Article Content Fallback Ladder:** When loading an article into the editor or previewing, resolve content using the fallback ladder: `article.content || article.body || article.text || (article.excerpt ? '<p>' + article.excerpt + '</p>' : '')`.
- **No Unwanted Default Images:** Never auto-assign placeholder/logo images (`dsg.avif`) to newly created articles. If no image was selected by the admin, store `image: ''`.
- **Branded Pitch News Fallback Header:** When an article has no uploaded image (`!article.image || article.image === 'dsg.avif'`), render the standard authentic football pitch fallback header (`renderNewsFallbackHeader('NEWSLETTER')` via `logos.js`) featuring the official white DSG Liga logo (`Logos/Ready/standard/DSGLiga_white.png`), authentic pitch geometry, emerald radial gradient, glassmorphic `NEWSLETTER` tag, and bottom accent line.
- **Graceful Image-less Rendering:** All article cards and detail views (`article.js`, `news.js`, `home.js`, `adminNews.js`) must check `a.image && a.image.trim() !== '' && a.image !== 'dsg.avif'` before rendering image elements or hero backgrounds.
- **Cache Busting Protocol:** Any modifications to client-side JS or HTML files must increment the global version query string (e.g. `?v=1791171000000`) across all import declarations and script tags.


