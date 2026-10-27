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
  - NEVER add match minutes (e.g., `24.`, `61.`, `(74.)`) for goals, cards, or social media captions — match minutes are never tracked or recorded in the DSG Liga!

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

### A. Cover Wallpaper Suite (V4 Approved — Symmetrical Triad Standard)
- **DSG Header Logo:** Centered horizontally at `y = 52px` (`target_w = 280px`). Bounding box: `x = [400, 675]`, `y = [53, 156]`.
- **Top Subtitle Block (Over Title):**
  - Text: `SAISON 26/27` in pure white (`#FFFFFF`) Impact font (`42px`), tracking `5 * SCALE`.
  - Flanking Accent Lines: Pure white (`RGBA(255, 255, 255, 220)`), `100px` length, `2.5px` height, `24px` horizontal gap to text, centered on text baseline height.
  - Position: Positioned above the top green outline with mathematically equal spacing (`equal_gap = 32px`).
- **Main Title Block (Center `y = 555px`):**
  - **Center Solid Text:** `RUNDE X` in solid pure white (`#FFFFFF`), Impact font (`210px`), tracking `6 * SCALE`.
  - **Top & Bottom Echo Outline Loops:**
    - Color: Vibrant DSG Green (`#00f05f` / `RGB(0, 240, 95)`).
    - Style: Thin wireframe stroke (`1.8px`), fully closed loops (cut horizontal edge closed with contour line).
    - Geometry: `60%` letter slice height cut, separated by a balanced `18px` gap from the solid center text (Zero overlap, mathematically balanced breathing room).
- **Bottom Subtitle Block (Under Title — Category Tag):**
  - Text: `IN ZAHLEN`, `NACHTRAGSSPIEL`, `ERGEBNISSE`, etc. in pure white (`#FFFFFF`) Impact font (`42px`), tracking `5 * SCALE`.
  - Flanking Accent Lines: Pure white (`RGBA(255, 255, 255, 220)`), `100px` length, `2.5px` height, `24px` horizontal gap to text, centered on text baseline height.
  - Position: Positioned below the bottom green outline with identical equal spacing (`equal_gap = 32px`), creating a perfectly symmetrical typographic frame around the central title block.
- **Round Cover Suite Coverage:**
  - Standard Cover: `SAISON 26/27` + `RUNDE X`.
  - Stats Cover (`IN ZAHLEN`): Produced for every round (`rundeX_cover_in_zahlen.png`).
  - Results Cover (`SPIELERGEBNISSE` — Variante 3 Approved): Produced for every round (`rundeX_cover_spielergebnisse.png`), styled with refined `38px` Impact font, tracking `5 * SCALE`, `85px` pure white flanking accent lines, `22px` horizontal gap to text, and identical equal spacing (`equal_gap = 32px`) below the bottom green outline.
  - Table Cover (`TABELLE`): Produced for every round (`rundeX_cover_tabelle.png`), styled with `42px` Impact font, tracking `5 * SCALE`, `100px` pure white flanking accent lines, `24px` horizontal gap to text, and identical equal spacing (`equal_gap = 32px`) below the bottom green outline.
  - Postponed / Separated Fixtures Cover (`NACHTRAGSSPIEL`): Produced for all rounds where matches are scheduled in separate weeks (e.g. Runde 1 on 29.08. vs 05.09., Runde 4 on 13.10., and Runde 6 on 07.11. — `rundeX_cover_nachtragsspiel.png`).
- **Communication Policy:** Always communicate and answer the user in English.

### B. Multi-Game Overview Wallpaper (Upcoming Fixtures — V4 Glass Card Standard)
- **Same-Week Clustering Rule:** Groups **ONLY** matches occurring in the **same week / weekend** (at least 2 games).
- **Separated Fixtures Exclusion:** If a match in a round is scheduled in a separate week (e.g., played earlier as a *Vorgriffspiel* like Runde 1 on 29.08., or weeks later as a *Nachtragsspiel* / postponed fixture like Runde 4 on 13.10. and Runde 6 on 07.11.), it is **STRICTLY EXCLUDED** from the main round overview. It receives its own dedicated single matchday wallpaper or standalone card later.
- **Dynamic Layout Adaptation:** When a round overview contains 2 games due to separated fixtures, it automatically adapts to the **2-Game Hero Standard** (both in 1:1 Square and 9:16 Vertical format).
- **Card Styling & Construction (Medium Sheer Glass):**
  - Card Dimensions: Width `940px`, Corner Radius `14px`.
  - Card Fill: Sheer glass tint `RGBA(1, 20, 10, 110)` (Alpha 110 allows stadium lights to show through cleanly).
  - Card Outline: Subtle green keyline `RGBA(0, 240, 95, 80)`, width `1.2px`.
  - Vertical Green Accent Bars: Left and right flanking bars in vibrant DSG Green `RGBA(0, 240, 95, 240)`, width `6px`, vertical margin `22px` from top/bottom card edges.
- **Internal Card Component Layout:**
  - **Date & Time Pill:** Centered at the top with comfortable padding (`pill_top_offset = 24-25px` in 3-game, `27px` in 2-game). Pill fill `RGBA(0, 0, 0, 160)`, border `RGBA(0, 240, 95, 140)` (`1.2px`), pure white Impact font (`DAY, DD.MM. • HH:MM UHR`).
  - **Venue / Location:** Centered near the bottom with comfortable padding (`loc_bottom_offset = 36px` in 3-game, `38px` in 2-game) in soft mint green `RGBA(195, 235, 210, 220)`.
  - **Versus `V`:** Pure solid white (`#FFFFFF`) Impact font, centered between the date pill and location.
  - **Crests & Team Names:** Crests offset from center (`offset_x = 240px`), with team name directly underneath in uppercase Impact font (`RGBA(255, 255, 255, 240)`), vertically centered relative to the central `V`. Fits even long team names (e.g., `DSG ST. JOSEF / OED`) with ample breathing room.
- **3-Game Weeks Layout Specifications:**
  - Card Height: `184px`.
  - Row Centers: `y = [458, 672, 886]`.
  - Spacing: `54px` gap below `RUNDE X` title, `30px` gap between cards, `102px` bottom margin.
  - Crest Size: `98px`, Team Font: `19px` Impact, `V`: `50px`.
- **2-Game Weeks Layout Specifications (Approved Hero Card Standard):**
  - Card Height: `216px` (Hero presence for 2-game weeks).
  - Row Centers: `y = [505, 785]`.
  - Spacing: `88px` gap below `RUNDE X` title, `70px` gap between cards, `187px` bottom margin.
  - Crest Size: `112px`, Team Font: `20px` Impact, `V`: `55px`.

### C. Single Game Matchday Wallpaper (Style D Approved — Broadcast Split Ribbon Standard)
Single matchday wallpapers feature dedicated hero coverage for every match in both **Square (1:1 — 1080 × 1080 px)** and **Vertical Story (9:16 — 1080 × 1920 px)** formats.

#### 1. Square Single Game Wallpaper (1:1 — 1080 × 1080 px):
- **Top Header Logo:** Centered horizontally at `y = 52px` (`target_w = 280px`). Bounding box: `x = [400, 675]`, `y = [53, 156]`.
- **Header Title Block:** Centered at `y = 275px`.
  - Top: `SAISON 26/27` in pure white (`#FFFFFF`) Impact font (`22px`), tracking `3 * SCALE`, flanked by pure white accent lines (`55px` length, `1.5px` height, `14px` gap).
  - Center Solid Text: `RUNDE X` in solid pure white (`#FFFFFF`), Impact font (`68px`), tracking `4 * SCALE`.
  - Echo Wireframe Loops: Top and bottom closed outline loops in vibrant DSG Green (`#00f05f`), `60%` slice cut, separated by `6px` gap from solid center text.
- **Central Broadcast Ribbon:**
  - Card Dimensions: Width `980px`, Height `340px`, centered at `y = 605px` (`y0 = 435px`, `y1 = 775px`), Corner Radius `18px`.
  - Material: Sheer glass tint `RGBA(0, 16, 8, 170)` with subtle green keyline outline `RGBA(0, 240, 95, 100)` (`1.5px`).
  - Angled Green Chevron Divider: Central diagonal slash leaning at `45°` (`width = 14px`, lean `45px`) dividing Home and Away halves in vibrant DSG Green `RGBA(0, 240, 95, 180)`.
  - 2K Monochrome Crests: Centered vertically at `y = 581px` (`crest_sz = 210px`), Home crest at `x = 270px`, Away crest at `x = 810px`.
  - Team Names: Neatly centered directly under each crest at `team_y = 731px` in uppercase Impact font (`24px`, `RGBA(255, 255, 255, 240)`).
  - Center `VS` Badge: Pill badge (`74 × 46px`, radius `6px`) in black `RGBA(0, 0, 0, 240)` with green border `RGBA(0, 240, 95, 240)` (`1.5px`), centered over the diagonal slash with green `VS` text (`28px` Impact).
- **Lower Broadcast Plate (Kickoff & Location Bar):**
  - Dimensions: Width `880px`, Height `115px`, Corner Radius `14px`, centered at `y0 = 890px`.
  - Material: Dark glass tint `RGBA(1, 20, 10, 140)`, green outline `RGBA(0, 240, 95, 90)` (`1.2px`).
  - Date & Time: `DAY, DD.MM. • HH:MM UHR` in pure white (`#FFFFFF`) Impact font (`26px`) at `y = 912px`.
  - Location / Venue: Centered below date at `y = 956px` in soft mint green `RGBA(195, 235, 210, 220)` (`22px` Impact).

#### 2. Vertical Single Game Story Wallpaper (9:16 — 1080 × 1920 px):
- **Safe Zones & Vignette:** Top 0–180px and bottom 1740–1920px story safe zones. Atmospheric vignette falloff at top (0–320px) and bottom (1560–1920px) fading into deep stadium shadow (`#010e07`).
- **Header Block:** NO top logo (uncluttered headroom). Main Title block centered at `y = 340px`:
  - `SAISON 26/27` in pure white Impact (`25px`), flanked by white accent lines (`55px` length, `1.5px` height).
  - `RUNDE X` in solid pure white Impact (`80px`), flanked by top and bottom vibrant green echo outline loops (`#00f05f`).
- **Central Broadcast Arena:**
  - Card Dimensions: Width `960px`, Height `640px`, centered at `y = 880px` (`y0 = 560px`, `y1 = 1200px`), Corner Radius `20px`.
  - Material: Sheer glass tint `RGBA(1, 20, 10, 120)`, green keyline `RGBA(0, 240, 95, 90)` (`1.5px`).
  - Angled Green Chevron Divider: Central diagonal slash leaning at `45°` (`width = 14px`, lean `55px`) in `RGBA(0, 240, 95, 140)`.
  - 2K Monochrome Crests & Team Names (Mathematically Centered Group):
    - Crest Size: Hero size `260px`, Home crest at `cx = 300px`, Away crest at `cx = 780px` (`240px` offset from center).
    - Team Names: Uppercase Impact font (`28px`, `RGBA(255, 255, 255, 240)`), positioned snugly `20px` directly underneath crests (`team_y = crest_top + crest_sz + 20px`).
    - Group Centering: The entire Crest + Text stack (`group_h = crest_sz + 20px + text_h`) is vertically centered inside the arena, eliminating dead space.
  - Center `VS` Badge: Rounded badge (`90 × 54px`, radius `8px`) in black with vibrant green outline (`1.5px`) and green `VS` text (`34px` Impact), centered vertically at `crest_cy`.
- **Lower Broadcast Info Capsule:**
  - Dimensions: Width `760px`, Height `120px`, Corner Radius `16px`, centered at `y0 = 1330px`.
  - Material: Black tint `RGBA(0, 0, 0, 180)`, green outline `RGBA(0, 240, 95, 140)` (`1.2px`).
  - Date & Time: `DAY, DD.MM. • HH:MM UHR` in pure white Impact (`28px`) at `y = 1352px`.
  - Location / Venue: Centered below date at `y = 1398px` in soft mint green `RGBA(195, 235, 210, 220)` (`24px` Impact).
- **Bottom Brand Anchor Logo:** Official white DSG Liga logo (`Wallpapers/Logos/standard/DSGLiga_white.png`) centered horizontally at `y = 1690px`, width `300px`.

#### 3. Standard Production File Naming & Coverage:
- **Square File Format:** `runde{round}_spiel{idx}_{home_slug}_{away_slug}.png`
- **Vertical File Format:** `runde{round}_spiel{idx}_{home_slug}_{away_slug}_9_16.png`
- **Full League Coverage:** All 27 matches across all 9 rounds (3 matches per round) are saved directly into `Wallpapers/Ready/Runde {round}/`.

### D. Result Wallpaper (Option B Approved — Structured Dynamic Arena Standard)
Single match result wallpapers feature dedicated score and event coverage for finished matches in both **Square (1:1 — 1080 × 1080 px)** and **Vertical Story (9:16 — 1080 × 1920 px)** formats.

#### 1. Square Result Wallpaper (1:1 — 1080 × 1080 px):
- **Top Header Logo:** Centered horizontally at `y = 52px` (`target_w = 280px`). Bounding box: `x = [400, 675]`, `y = [53, 156]`.
- **Header Title Block:** Centered at `y = 265px` (guaranteeing a clean **23px clearance** below the logo with ZERO overlap):
  - Top: `SAISON 26/27` in pure white (`#FFFFFF`) Impact font (`20px`), tracking `3 * SCALE`, flanked by pure white accent lines (`50px` length, `1.5px` height, `14px` gap).
  - Center Solid Text: `RUNDE X` in solid pure white (`#FFFFFF`), Impact font (`62px`), tracking `4 * SCALE`.
  - Echo Wireframe Loops: Top and bottom closed outline loops in vibrant DSG Green (`#00f05f`), `60%` slice cut, separated by `6px` gap from solid center text.
- **Dynamic Glass Arena Card:**
  - Card Dimensions: Width `980px`, Corner Radius `18px`, centered horizontally (`ar_x0 = 50px`).
  - Material: Sheer glass tint `RGBA(0, 16, 8, 170)` with subtle green keyline outline `RGBA(0, 240, 95, 95)` (`1.5px`).
  - Vertical Green Accent Bars: Left and right flanking bars in vibrant DSG Green `RGBA(0, 240, 95, 230)`, width `6px`, vertical margin `22px` from card edges.
  - Dynamic Height Formula:
    `arena_h = sb_h (225px) + ev_gap (20px) + (num_rows * line_h (34px)) + bot_pad (22px)`.
    Positioning: `ar_y0 = 360px` for $\le 3$ rows, `345px` for $\le 6$ rows, and `335px` for $> 6$ rows.
- **Scoreboard Block (Upper Arena):**
  - Crests & Team Names: 2K monochrome crests ($160\text{px}$) centered at `cx = 240px` and `cx = 840px` (`crest_cy = ar_y0 + 98px`). Team names directly underneath in uppercase Impact font (`20px`, `RGBA(255, 255, 255, 240)`).
  - Main Score: Bold floating `X : Y` in pure white Impact font (`114px`), vertically centered with crests.
  - Half-Time Score: `HZ (A:B)` centered below the main score in soft mint green `RGBA(195, 235, 210, 230)` (`25px` Impact). NO "ENDSTAND" pill text.
- **Option B Structured Hairlines:**
  - Horizontal Divider Line: Ultra-thin hairline separating scoreboard from events roster at `y = ar_y0 + sb_h + 6px` in `RGBA(0, 240, 95, 75)` (`1.2px`), with `32px` inset from card edges.
  - Vertical Spine Hairline: Subtle line down center spine ($x = 540\text{px}$) from horizontal divider to near card bottom in `RGBA(0, 240, 95, 55)` (`1.2px`).
- **Events Section (Spine-Aligned Standard):**
  - **Sorting Order:** **Scorers First, Bookings Last** (Goals ⚽ at top, Yellow Cards 🟨 middle, Red Cards 🟥 bottom).
  - **Goal Multiplier Aggregation:** Multiple goals by a single player are aggregated: `Player Name (3x) ⚽`.
  - **Home Team (Left):** Player name first, right-aligned towards spine, followed by event icon (`icon_cx = 516px`, `text_rx = 500px`).
  - **Away Team (Right):** Event icon first (`icon_cx = 564px`), followed by player name left-aligned from spine (`text_lx = 580px`).
  - **Icon Conventions:**
    - ⚽ **Goal:** Realistic vector football icon (`soccer_ball_realistic.png`, size `18px`).
    - 🟨 **Yellow Card:** Filled vibrant yellow (`#FFCD00`, `13 × 18px`, radius `2.5px`) with subtle white keyline outline (`RGBA(255, 255, 255, 230)`).
    - 🟥 **Red Card:** Filled vibrant red (`#E6232D`, `13 × 18px`, radius `2.5px`) with subtle white keyline outline (`RGBA(255, 255, 255, 230)`).
- **Lower Broadcast Plate (Kickoff & Location Bar):**
  - Dimensions: Width `880px`, Height `86px`, Corner Radius `14px`, anchored dynamically at `cap_y0 = ar_y1 + 26px`.
  - Material: Dark glass tint `RGBA(1, 20, 10, 140)`, green outline `RGBA(0, 240, 95, 90)` (`1.2px`).
  - Date & Time: `DAY, DD.MM. • HH:MM UHR` in pure white Impact (`24px`).
  - Location / Venue: Soft mint green `RGBA(195, 235, 210, 220)` (`21px` Impact).

#### 2. Vertical Result Story Wallpaper (9:16 — 1080 × 1920 px):
- **Safe Zones & Vignette:** Top 0–180px and bottom 1740–1920px story safe zones. Atmospheric vignette falloff at top (0–320px) and bottom (1560–1920px) fading into deep stadium shadow (`#010e07`).
- **Header Block:** NO top logo (uncluttered headroom). Main Title block centered at `y = 340px`:
  - `SAISON 26/27` in pure white Impact (`25px`), flanked by white accent lines (`55px` length, `1.5px` height).
  - `RUNDE X` in solid pure white Impact (`80px`), flanked by top and bottom vibrant green echo outline loops (`#00f05f`).
- **Dynamic Glass Arena Card:**
  - Card Dimensions: Width `960px`, Corner Radius `20px`, centered horizontally (`ar_x0 = 60px`).
  - Material: Sheer glass tint `RGBA(0, 16, 8, 170)` with subtle green keyline outline `RGBA(0, 240, 95, 95)` (`1.5px`).
  - Vertical Green Accent Bars: Left and right flanking bars in vibrant DSG Green `RGBA(0, 240, 95, 230)`, width `7px`, vertical margin `26px`.
  - Dynamic Height Formula:
    `arena_h = sb_h (260px) + ev_gap (22px) + (num_rows * line_h (38px)) + bot_pad (26px)`.
  - Group Centering: The Arena Card + Lower Plate group (`total_h = arena_h + 32px + 100px`) is mathematically centered in the story safe zone `[440, 1620]` around `mid_y = 1030px`.
- **Scoreboard Block (Upper Arena):**
  - Crests & Team Names: 2K monochrome crests ($190\text{px}$) centered at `cx = 240px` and `cx = 840px` (`crest_cy = ar_y0 + 112px`). Team names directly underneath in uppercase Impact font (`22px`, `RGBA(255, 255, 255, 240)`).
  - Main Score: Bold floating `X : Y` in pure white Impact font (`126px`), vertically centered with crests.
  - Half-Time Score: `HZ (A:B)` centered below the main score in soft mint green `RGBA(195, 235, 210, 230)` (`27px` Impact).
- **Option B Structured Hairlines:**
  - Horizontal Divider Line: At `y = ar_y0 + sb_h + 6px` in `RGBA(0, 240, 95, 75)` (`1.2px`), with `34px` inset from card edges.
  - Vertical Spine Hairline: Down center spine ($x = 540\text{px}$) in `RGBA(0, 240, 95, 55)` (`1.2px`).
- **Events Section (Spine-Aligned Standard):**
  - Same spine-aligned standard with `line_h = 38px`.
  - Goal icon size `20px`, card size `14 × 20px`, font size `24px` Impact.
- **Lower Broadcast Plate:**
  - Dimensions: Width `820px`, Height `100px`, Corner Radius `16px`, anchored at `cap_y0 = ar_y1 + 32px`.
  - Material: Dark glass tint `RGBA(1, 20, 10, 140)`, green outline `RGBA(0, 240, 95, 90)` (`1.2px`).
  - Date & Time: `DAY, DD.MM. • HH:MM UHR` in pure white Impact (`26px`).
  - Location / Venue: Soft mint green `RGBA(195, 235, 210, 220)` (`23px` Impact).
- **Bottom Brand Anchor Logo:** Official white DSG Liga logo (`Wallpapers/Logos/standard/DSGLiga_white.png`) centered horizontally at `y = 1690px`, width `300px`.

### E. Vertical Multi-Game Overview Wallpaper (9:16 Story Format — 1080 × 1920 px)
- **Format & Platforms:** 1080 × 1920 px (9:16 vertical), designed specifically for Instagram Stories, WhatsApp Status, and TikTok.
- **Mobile Story Safe Zones:**
  - Top Safe Zone (0–180 px): Reserved for app profile headers, handles, and story progress bars.
  - Bottom Safe Zone (1740–1920 px): Reserved for direct message inputs, reactions, and share controls.
  - Background Scaling: Scaled to cover 1080 × 1920 px with smooth atmospheric vignette falloff at top (0–320 px) and bottom (1560–1920 px) fading into deep stadium shadow (`#010e07`).
- **Same-Week Clustering & Split Round Standard:**
  - Vertical overviews include **ONLY** matches played in the same week/weekend (at least 2 games).
  - Any fixture played earlier (*Vorgriffspiel*) or later (*Nachtragsspiel*) in a separate week (Runde 1 on 29.08., Runde 4 on 13.10., Runde 6 on 07.11.) is **strictly excluded** from the vertical multi-game overview and receives its own standalone single-match graphic later.
  - All split-week rounds automatically adapt to the **2-Game Hero Standard (Option D)**.
- **Header Block (No Top Logo Standard):**
  - NO header logo at the top (gives clean, uncluttered headroom and prevents overlap with story profile UIs).
  - Main Title Block centered at `y = 350px`:
    - Top: `SAISON 26/27` in pure white (`#FFFFFF`) Impact font (`25px`), tracking `3 * SCALE`, flanked by pure white accent lines (`55px` length, `1.5px` height, `12px` gap).
    - Center Solid Text: `RUNDE X` in pure white Impact font (`80px`), tracking `4 * SCALE`.
    - Echo Wireframe Loops: Top and bottom outline loops in vibrant DSG Green (`#00f05f`), closed loops, `60%` slice cut, `6px` gap from solid text.
- **Card Styling & Construction (Medium Sheer Glass):**
  - Card Fill: Sheer glass tint `RGBA(1, 20, 10, 115)`.
  - Card Outline: Subtle green keyline `RGBA(0, 240, 95, 90)`, width `1.2px`.
  - Vertical Green Accent Bars: Left and right flanking bars in vibrant DSG Green `RGBA(0, 240, 95, 240)`.
  - Date & Time Pill: Centered top in `RGBA(0, 0, 0, 160)` with green border `RGBA(0, 240, 95, 140)`.
  - Venue / Location: Centered bottom in soft mint green `RGBA(195, 235, 210, 220)`.
  - Versus `V`: Pure white Impact font centered.
  - Crests & Team Names: Monochrome crests with team name directly underneath in uppercase Impact font.
- **3-Game Weeks Layout Specifications (Approved Option B Standard):**
  - Card Dimensions: Width `950px`, Height `255px`, Corner Radius `16px`.
  - Side Accent Bars: Width `6px`, vertical margin `26px`.
  - Row Centers: `y = [710, 1040, 1370]`.
  - Spacing: `105px` gap below title block, `75px` gap between cards.
  - Crest Size: `122px`, Team Font: `22px` Impact, `V`: `62px`.
  - Date Pill: Top offset `32px`, font `23px` Impact.
  - Location: Bottom offset `44px`, font `23px` Impact.
  - Bottom Anchor Logo: Centered at `y = 1700px`, target width `290px`.
- **2-Game Weeks Layout Specifications (Approved Option D Hero Standard):**
  - Card Dimensions: Width `960px`, Height `305px`, Corner Radius `18px`.
  - Side Accent Bars: Width `7px`, vertical margin `30px`.
  - Row Centers: `y = [780, 1230]`.
  - Spacing: `125px` gap below title block, `145px` gap between cards.
  - Crest Size: `140px`, Team Font: `23px` Impact, `V`: `68px`.
  - Date Pill: Top offset `38px`, font `24px` Impact.
  - Location: Bottom offset `50px`, font `24px` Impact.
  - Bottom Anchor Logo: Centered at `y = 1690px`, target width `300px`.
### F. "In Zahlen" Matchday Statistics Suite (Style 3 Approved — Editorial Split-Ribbon Standard)
Round statistics and records graphics feature 6 genuine matchday facts across both **Square Carousel (1:1 — 1080 × 1080 px)** and **Vertical Story (9:16 — 1080 × 1920 px)** formats.

#### 1. Format Architecture & Coverage:
- **Square (1:1) Carousel Suite (2 Slides, 3 facts each):**
  - **Slide A:** Subtitle Tag `IN ZAHLEN` (Facts 1–3: high-impact scorelines, goal averages, hattricks).
  - **Slide B:** Subtitle Tag `IN ZAHLEN` (Facts 4–6: derby booking stats, clean sheets, match-winning goals, offensive depth).
- **Vertical Story (9:16) All-in-One Story:**
  - All 6 facts cleanly stacked in a single story graphic within mobile safe zones (`0–180px` top and `1740–1920px` bottom).
  - Subtitle Tag: `IN ZAHLEN` in pure white (`#FFFFFF`) with pure white flanking accent lines.

#### 2. Typographic Triad & Header Standards:
- **Square (1:1) Header:**
  - Top Header Logo: Centered horizontally at `y = 52px` (`target_w = 280px`). Bounding box: `x = [400, 675]`, `y = [53, 156]`.
  - Title Center: `y = 250px`.
  - Top: `SAISON 26/27` in pure white Impact (`19px`), tracking `3 * SCALE`, flanked by pure white accent lines (`45px` length, `1.5px` height, `12px` gap).
  - Center Solid Text: `RUNDE X` in solid pure white Impact (`58px`), tracking `4 * SCALE`.
  - Echo Wireframe Loops: Top and bottom closed outline loops in vibrant DSG Green (`#00f05f`), `60%` slice cut, `6px` gap from solid center text.
  - Bottom Subtitle Tag: `IN ZAHLEN` in pure white (`#FFFFFF`) Impact font (`20px`), tracking `3 * SCALE`, flanked by pure white accent lines (`60px` length, `1.5px` height, `12px` gap).
- **Vertical Story (9:16) Header:**
  - NO top header logo (uncluttered headroom).
  - Title Center: `y = 255px`.
  - Top: `SAISON 26/27` in pure white Impact (`21px`), tracking `3 * SCALE`, flanked by pure white accent lines (`50px` length, `1.5px` height, `12px` gap).
  - Center Solid Text: `RUNDE X` in solid pure white Impact (`68px`), tracking `4 * SCALE`.
  - Echo Wireframe Loops: Top and bottom closed outline loops in vibrant DSG Green (`#00f05f`), `60%` slice cut, `6px` gap from solid center text.
  - Bottom Subtitle Tag: `IN ZAHLEN` in pure white (`#FFFFFF`) Impact font (`21px`), tracking `3 * SCALE`, flanked by pure white accent lines (`60px` length, `1.5px` height, `12px` gap).
  - Bottom Brand Anchor Logo: Official white DSG Liga logo centered at `y = 1690px`, width `300px`.

#### 3. Card Styling & Split-Ribbon Construction:
- **Card Geometry & Materials:**
  - **Square:** Width `960px`, Height `184px`, Corner Radius `16px`. Rows at `y0 = [375, 580, 785]`.
  - **Vertical:** Width `960px`, Height `168px`, Corner Radius `16px`, `20px` gap between cards. Starts at `y0 = 405px`.
  - **Material:** Dark sheer glass tint `RGBA(0, 16, 8, 165)` with subtle green outline `RGBA(0, 240, 95, 95)` (`1.5px`).
  - **Angled Green Divider Slash:** Central diagonal slash leaning at `45°` dividing hero stat bay from narrative text in vibrant DSG Green `RGBA(0, 240, 95, 130)`.
- **Internal Bay Composition:**
  - **Left Hero Stat Bay:**
    - Hero Number: Bold pure white Impact font (`80px` Square, `74px` Vertical).
    - Event Icons: Realistic football icon (`28px`) or structured yellow & red card badges (`15 × 22px`).
  - **Right Narrative Bay:**
    - Category Title: Vibrant DSG Green (`#00f05f`) uppercase Impact font (`30px` Square, `28px` Vertical).
    - Main Description: Pure white (`RGBA(255, 255, 255, 245)`) uppercase Impact font (`21px` Square, `20px` Vertical).
    - Subtext / Detail: Soft mint green (`RGBA(195, 235, 210, 220)`) uppercase Impact font (`18px` Square, `17px` Vertical).
    - Monochrome Crest: 2K monochrome vector crest enlarged to **`80px` (Square)** and **`65px` (Vertical)** on the right side with ample margin clearance.
- **Footer:** `DSG-FUSSBALL.COM` centered horizontally at `y = 1030px` in square graphics.

### G. Instagram Pinned Profile Header Suite (Concept 2 Refined Approved — Hall of Clubs Standard)
Dedicated 3-post pinned grid triptych banner for the official Instagram profile [`@dsg_fussballliga_ooe`](https://instagram.com/dsg_fussballliga_ooe). Produces a seamless 3240 × 1080 px stadium panorama sliced into 3 equal 1080 × 1080 px posts.
- **Production Output Directory:** `Wallpapers/Ready/Instagram_Header/`
  - `header_panorama.png` (3240 × 1080 px continuous banner)
  - `tile_1_left_clubs.png` (1080 × 1080 px — SV Croatia, DSG Traun, SV Etehad)
  - `tile_2_center_dsg.png` (1080 × 1080 px — Official white DSG logo + SAISON 2026/2027)
  - `tile_3_right_clubs.png` (1080 × 1080 px — FC Gornjak, Union Heiligenberg, Walker FC, Oed)
  - `instagram_profile_mockup.png` (1080 × 1920 px mobile preview)
  - `captions_and_upload_guide.txt` (Complete upload order, pinning steps, and copy-pasteable German captions)
- **Continuous Background Architecture:**
  - **Source:** `Wallpapers/Backgrounds/stadium_green_02.png` scaled proportionally to 3240 × 3240 px.
  - **Bottom Pitch Framing:** Cropped at `crop_y = 1700` (`(0, 1700, 3240, 2780)`), framing the authentic football pitch, center circle, kickoff spot, players in action, penalty box, and goal net across the banner.
  - **Gradient Style:** Authentic Sporting CP emerald luxury gradient (`#24b262` / `#00b341` / `#008f33` / `#010e07`) with organic fine grain, matching the matchday covers below.
  - **Zero Duplication & Zero Mirroring:** Strictly ONE continuous image sliced into 3 tiles.
- **Instagram 3:4 Vertical Profile Grid Safe Zone Standard:**
  - Instagram rolls out a 3:4 portrait profile grid where square 1:1 posts are displayed in a ~3:4 vertical window (~800px visible width in a 1080px canvas, cropping ~140px off the left and right sides).
  - All critical graphics, cards, logos, and typography are strictly designed within the central **720px safe zone** ($x \in [180, 900]$), guaranteeing $\ge 40\text{px}$ of breathing room from the Instagram crop edges.
- **Center Hero Tile (Tile 2):**
  - Official white DSG Liga logo scaled down to **`360px` wide** (height `135px`) centered horizontally and vertically at `card_cy = 540px` for refined, balanced hierarchy matching the club crests.
  - `SAISON 2026/2027` in pure solid white (`#FFFFFF`) Impact font (`30px`), flanked by pure white accent lines (`65px` length, `2.5px` height, `14px` gap).
  - Strictly NO subtitles (`EINE LIGA. EIN ZIEL.` removed) and zero pills.
- **7 Equal Club Cards Standard (Grid-Optimized):**
  - Card Dimensions: Width **`155px`**, Height **`215px`**, Corner Radius **`14px`**.
  - Material: Sheer dark glass `RGBA(1, 20, 10, 140)`, emerald keyline `RGBA(0, 240, 95, 110)` (`1.2px`), left green accent bar `RGBA(0, 240, 95, 240)` (`3.5px` wide, `14px` margin).
  - Snug Logo-to-Name Spacing: Exactly **8px** vertical gap between bottom of monochrome crest (`115px` max bounding box) and top of uppercase team name (`17px` Impact, `#FFFFFF`), vertically centered as a group.
  - Tile 1 Centers (3 Clubs): `x = [305, 540, 775]` (80px equal gaps, 87.5px breathing margin to Instagram crop line).
  - Tile 3 Centers (4 Clubs): `x = [2422.5, 2607.5, 2792.5, 2977.5]` (Local `x = [262.5, 447.5, 632.5, 817.5]`, 30px gaps, 45px breathing margin to Instagram crop line).
- **Instagram Upload & Pinning Protocol:**
  - Post 1: `tile_3_right_clubs.png` (Right tile)
  - Post 2: `tile_2_center_dsg.png` (Center hero tile)
  - Post 3: `tile_1_left_clubs.png` (Left tile)
  - Pin each in order so Tile 1 lands at top-left, Tile 2 at top-center, and Tile 3 at top-right of the Instagram 3-column grid.

### G. League Table Wallpaper Suite (Approved Clean Glass Arena Standard)
League table wallpapers feature official standings, goal records, and points across both **Square (1:1 — 1080 × 1080 px)** and **Vertical Story (9:16 — 1080 × 1920 px)** formats.

#### 1. Square League Table Wallpaper (1:1 — 1080 × 1080 px):
- **Top Header Logo:** Official DSG Liga logo centered horizontally at `y = 52px` (`target_w = 275px`). Bounding box: `x = [402, 678]`, `y = [52, 150]`.
- **No Redundant Title Text:** The title block is strictly omitted on the table wallpaper itself (as Slide 1 is the dedicated `rundeX_cover_tabelle.png` cover), allowing maximum vertical expansion and large typography.
- **Table Arena Card:**
  - Dimensions: Width `980px`, Corner Radius `18px`, centered horizontally (`x0 = 50px`, `y0 = 180px`, `y1 = 1030px`). Total Height `850px`.
  - Material: Sheer glass tint `RGBA(0, 16, 8, 175)` with subtle green keyline `RGBA(0, 240, 95, 95)` (`1.5px`).
  - Vertical Green Accent Bars: Left and right flanking bars in vibrant DSG Green `RGBA(0, 240, 95, 240)`, width `6px`, vertical margin `20px`.
- **Column Architecture & Metrics (100% Pure White Typography):**
  - Header Bar: Height `52px` with hairline divider in `RGBA(0, 240, 95, 90)`. Header labels in pure white Impact (`21px`).
  - Columns: `#` (Rank), `TEAM` (Crest + Name), `SP`, `S`, `U`, `N`, `TORE`, `DIFF`, `PKT`.
  - Column Centers: `#` (`x = 92px`), Crest (`x = 150px`), Team Name (`x = 192px`, left-aligned), `SP` (`x = 485px`), `S` (`x = 545px`), `U` (`x = 605px`), `N` (`x = 665px`), `TORE` (`x = 755px`), `DIFF` (`x = 855px`), `PKT` (`x = 970px`).
  - 7 Generous Team Rows: Height `114px` per row, featuring large team names in pure white Impact (`26px`), 2K monochrome white crests (`54px`), and stats in pure white (`24px`).
  - **1st Place Highlighting:** Rank badge and Points capsule in solid DSG green `RGBA(0, 140, 52, 230)` with vibrant green outline `RGBA(0, 240, 95, 255)` (`1.5px`) and **100% PURE WHITE TEXT** (`#FFFFFF` — strictly zero dark text!).
  - **Podium (2nd & 3rd):** Dark glass pill `RGBA(0, 0, 0, 180)` with vibrant green outline `RGBA(0, 240, 95, 220)` and pure white text (`#FFFFFF`).
  - **Ranks 4–7:** Dark glass pill `RGBA(0, 0, 0, 120)` with subtle keyline and pure white text (`#FFFFFF`).

#### 2. Vertical League Table Story Wallpaper (9:16 — 1080 × 1920 px):
- **Safe Zones & Vignette:** Top 0–180px and bottom 1740–1920px story safe zones with atmospheric top & bottom vignette falloff fading into deep stadium shadow (`#010e07`).
- **Clean Headroom (Zero Top Text):** Title block and top logo omitted completely.
- **Table Arena Card (Moved Up for Optimal Spacing):**
  - Dimensions: Width `980px`, Corner Radius `20px`, centered horizontally (`x0 = 50px`, `y0 = 220px`, `y1 = 1530px`). Total Height `1310px`.
  - Vertical Green Accent Bars: Width `7px`, vertical margin `24px`.
  - Header Bar: Height `68px` with hairline divider in `RGBA(0, 240, 95, 90)`. Header labels in pure white Impact (`24px`).
  - 7 Hero Team Rows: Height `177px` per row, featuring prominent rank badges (`40 × 40px`), hero monochrome crests (`72px`), extra large team names in pure white Impact (`30px`), stats in pure white (`28px`), and hero points capsules (`66 × 46px`, font `32px`).
  - **1st Place Highlighting:** Solid DSG green `RGBA(0, 140, 52, 230)` with bright green outline `RGBA(0, 240, 95, 255)` and **100% PURE WHITE TEXT** (`#FFFFFF` — strictly zero dark text!).
- **Bottom Brand Anchor Logo:** Official white DSG Liga logo centered horizontally at `y = 1710px`, width `300px`, with a generous `128px` clearance above it and `158px` safe clearance from the screen bottom.

#### 3. Standard Production File Naming:
- **Table Cover:** `runde{round}_cover_tabelle.png`
- **Square Table:** `runde{round}_tabelle.png`
- **Vertical Story Table:** `runde{round}_tabelle_9_16.png`
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
4. **No PSD Files in `Ready/` Standard:** NEVER save `.psd` files into `Wallpapers/Ready/` or its round subfolders. The `Ready/` directory is reserved exclusively for production-ready PNG image assets and `.txt` captions. Master PSD files belong strictly in `Wallpapers/Test/` or generation templates.

---

## 7. Website & News Editor Standards
- **Dynamic DOM Querying for RTE:** Always query `#rte-editor` actively via `document.getElementById('rte-editor')` inside submit and edit handlers. Never rely on stale module-scope closure variables that may have been initialized before DOM mounts or re-renders.
- **Article Content Fallback Ladder:** When loading an article into the editor or previewing, resolve content using the fallback ladder: `article.content || article.body || article.text || (article.excerpt ? '<p>' + article.excerpt + '</p>' : '')`.
- **No Unwanted Default Images:** Never auto-assign placeholder/logo images (`dsg.avif`) to newly created articles. If no image was selected by the admin, store `image: ''`.
- **Branded Pitch News Fallback Header:** When an article has no uploaded image (`!article.image || article.image === 'dsg.avif'`), render the standard authentic football pitch fallback header (`renderNewsFallbackHeader('NEWSLETTER')` via `logos.js`) featuring the official white DSG Liga logo (`Logos/Ready/standard/DSGLiga_white.png`), authentic pitch geometry, emerald radial gradient, glassmorphic `NEWSLETTER` tag, and bottom accent line.
- **Graceful Image-less Rendering:** All article cards and detail views (`article.js`, `news.js`, `home.js`, `adminNews.js`) must check `a.image && a.image.trim() !== '' && a.image !== 'dsg.avif'` before rendering image elements or hero backgrounds.
- **Cache Busting Protocol:** Any modifications to client-side JS or HTML files must increment the global version query string (e.g. `?v=1791176000000`) across all import declarations and script tags.

---

## 8. Dynamic Monochrome Team Logos & Admin Upload Standard
- **Monochrome Logo Directory:** `Website/Logos/monochrome/` contains the white vector transparent PNG logos for the active teams (`croatia.png`, `dsgtraun.png`, `etehad.png`, `fcgornjak.png`, `oed.png`, `unionheiligenberg.png`, `walker.png`).
- **Dynamic Light/Dark Mode Color Switching:**
  - **Light Mode:** Rendered in sharp black/charcoal via `.team-logo-monochrome` (`filter: brightness(0) opacity(0.88)`).
  - **Dark Mode:** Rendered in pure radiant white via `[data-theme="dark"] .team-logo-monochrome` (`filter: brightness(0) invert(1) opacity(0.95)`).
- **Universal Application:** Applied across all views: League Tables, Matchdays/Spiele, Topspiel Banner, Scorers, All-Time Stats (Ewige Tabelle), and Admin Panel.
- **Admin Teams Management:**
  - Standard Color Logo upload (`logoUrl`) and Monochrome Logo upload (`monochromeLogoUrl`) are both available with live previews and delete options in the Admin Teams tab (`adminTeams.js`).
  - Fallbacks gracefully handle historical teams and custom uploaded badges without missing assets.

---

## 9. Players & Teams Architecture & Deep Linking Standards
- **Players Page (`#/spieler`) & Team Rosters (`#/teams`):**
  - Displays exclusively active registered players from the database.
  - **Avatar Display Standard:** Renders deterministic avatars (`Spieler/1.jpg` to `Spieler/20.jpg` via `getPlayerHash()`) or custom uploaded photos (`player.photoUrl`). Avatars MUST use `object-fit: contain` and `object-position: bottom center` to prevent clipping or excessive zooming.
  - **No-Emoji Rule:** Strictly prohibited to use raw Unicode emojis anywhere on the site. Use only SVG icons via `renderIcon()` or pure CSS geometric tags.
  - **Deep Linking Protocol:** All goalscorer and booking entries across Matchdays/Spiele (`liga.js`) and Top Scorer widgets link directly to individual player profiles via their database ID: `#/spieler?id=ID` (or `#/spieler?search=Name` as fallback).
  - **Interactive Team Scorers Widget (`teams.js`):**
    - Season Selector: Toggles between active seasons (e.g. `Saison 2026/27`) and All-Time club stats (`Gesamt (Alle Saisons)`).
    - Compact Initial View: Renders the Top 5 club scorers with a toggle button to expand all club scorers.
    - Clean Pagination: Shows 5 players per page when expanded with responsive mobile layout.

---

## 10. Admin Player Management & Modern Positions Architecture
- **Firebase Storage Photo Upload (`adminPlayers.js`):**
  - Features a dedicated avatar upload card with live image preview circle, "Foto hochladen", "Entfernen", and dynamic status feedback.
  - Uploads directly to Firebase Storage bucket under `players/` with automated client-side canvas compression fallback (`MAX_SIZE = 600px`, JPEG 0.75).
- **Comprehensive Modern Football Positions:**
  - Organized in `<optgroup>`s in the admin position selector:
    - **Torwart:** Torwart (TW), Mitspielender Torwart.
    - **Abwehr / Verteidigung:** Innenverteidiger (IV), Linksverteidiger (LV), Rechtsverteidiger (RV), Linker Schienenspieler (LWB), Rechter Schienenspieler (RWB), Libero (LIB), Abwehr (Allround).
    - **Mittelfeld:** Defensives Mittelfeld (DM / 6er), Zentrales Mittelfeld (ZM / 8er), Offensives Mittelfeld (OM / 10er), Linkes Mittelfeld (LM), Rechtes Mittelfeld (RM), Flügelspieler, Mittelfeld (Allround).
    - **Angriff / Sturm:** Mittelstürmer (MS / 9er), Linksaußen (LA / LW), Rechtsaußen (RA / RW), Hängende Spitze (HS / CF), Zweiter Stürmer (SS), Sturm (Allround).
  - **Spielfuß / Seite / Detail:** Rechtsfuß (R), Linksfuß (L), Beidfüßig (B), Zentral, Links, Rechts, Flexibel / Universal.
- **Intelligent Category Mapping:**
  - Public position filter buttons (`Torwart`, `Abwehr`, `Mittelfeld`, `Sturm`) use `getPlayerPositionCategory()` to map all respective subpositions automatically.

---

## 11. Human Copywriting & Social Voice (Avoid AI Writing Standard)
- **Strict Prohibition of AI-isms & Robotic Boilerplate:**
  - Never use hollow intensifiers or generic AI marketing clichés (e.g. *"Torfeuerwerk"*, *"Hochspannung pur"*, *"Packende Duelle"*, *"Ein torreiches Wochenende liegt hinter uns"*, *"Testament to"*, *"Fostering"*).
  - Avoid AI formatting artifacts: excessive emoji-stacking, bullet-heavy over-explanations, hollow rule-of-three phrasing, or artificial hype.
- **Authentic Football Tone:**
  - Write direct, punchy, grounded captions that read like a real local football club admin or league organizer.
  - Present scorelines, goalscorers, and match dates clearly and plainly.
  - Deliver stats and facts as concrete, genuine observations rather than exaggerated marketing copy.
- **Mandatory Social Text File Export:**
  - Every round's social media text / caption MUST always be exported as a UTF-8 `.txt` file (`rundeX_caption.txt` or `caption.txt`) directly into the round's directory (both in `Wallpapers/Test/` during drafting and `Wallpapers/Ready/Runde X/` upon final approval).
  - Allows instant copy-pasting alongside image assets.

---

## 12. DSGVO & Austrian TKG 2021 Privacy Standards
- **Two-Tier Consent Architecture:**
  - Strictly no tracking cookies or Google Analytics (`gtag.js` / `G-JLXYJPG360`) are executed or loaded before the user provides explicit opt-in consent.
  - Rejection ("Nur notwendige") immediately disables non-essential storage and keeps Google Analytics completely deactivated without nagging.
  - Dedicated privacy view (`#/datenschutz`) provides transparent declarations compliant with Austrian DSGVO & TKG 2021, including a live interactive consent status widget allowing users to change or revoke consent at any time.
- **Zero-Layout Shift Responsive Navigation:**
  - Dynamic responsive breakpoint ensures that navigation links never break into two awkward rows; it collapses seamlessly into the full slide-out drawer burger menu whenever viewport width constrains the horizontal pill links.
  - Standard navigation order: `Home`, `Liga`, `Teams`, `Spieler`, `Statistiken`, `News`, `Galerie`, `Organisation`, `Verwaltung`.
  - Standard admin tab order: `Spiele`, `Spielrunden`, `Ligen verwalten`, `Teams verwalten`, `Spieler verwalten`, `News verwalten`, `Galerie verwalten`.

---

## 13. Data Store, Cloud Synchronization & Lossless Persistence Standards
- **Authoritative Firestore Cloud Synchronization:**
  - Firestore document `system/liga_data` serves as the authoritative real-time database.
  - Static fallback `Website/data/liga.json` is always maintained in sync as an offline/initial seed repository.
- **Lossless Match Synchronization Rule:**
  - When synchronizing data between cloud and local storage or saving scores via admin, `deduplicateMatches([...targetSeason.matches, ...memSeason.matches])` must ALWAYS be applied.
  - A played match with recorded scores, scorers, or cards must NEVER be overwritten or dropped by an unplayed placeholder (`-:-`).
- **Dynamic Season Fallback Mandate:**
  - NEVER hardcode obsolete season strings (e.g. `'2022/2023'`) in admin views or form handlers. Always resolve dynamically via `(Store.getData()?.currentSeason || '2026/2027')`.
- **Cache-Busting & LocalStorage Keys:**
  - Any architectural schema or data updates must systematically increment the localStorage version key (`dsg_data_vXX`, current: `v89`) and bump the query parameter on `Website/index.html` (`main.js?v=...`) to prevent stale browser cache collisions across clients.

---

## 14. Performance & Zero-Freeze Loading Standards
- **Global Transition Loader (`#dsg-global-loader`):**
  - Features a frosted glassmorphism card with dual emerald-green spinner ring (`#00b341` / `#24b262`) and localized German status copy (*„Wird geladen...“*, *„Saison wird geladen...“*).
  - Matches both Light Mode and Dark Mode automatically.
- **Frame-Yielding Architecture (Zero Main-Thread Freezes):**
  - In `router.js` and `liga.js`, transitions trigger `showLoader()` immediately in 0ms and yield to the browser's paint engine using `requestAnimationFrame` before initiating heavy DOM rendering (e.g. recalculating standings, hundreds of players, or historical seasons).
  - Eliminates the 1-2 second unresponsive freezing sensation across navigation and league dropdown switches.

---

## 15. Website News & Match Report Editorial Standards
- **Authentic Amateur Journalism Tone:**
  - **Balanced Perspective:** Combine the polished narrative structure of sports journalism with deep respect and authenticity for the reality of Austrian amateur and hobby football.
  - **Grounded Reality:** Acknowledge genuine grassroots factors: thin substitute benches, players rushing from work or family commitments, fatigue in the second half, early injuries without professional physios, and passionate volunteer dedication.
  - **Natural Austrian Sports Vocabulary:** Use authentic phrasing (*Kabinengang*, *Eckball*, *Nadelstiche*, *Ersatzbank*, *Arbeitssieg*, *Schlagzahl*, *Offensivdrang*, *Pausenführung*).
  - **Anti-AI Writing Mandate:** Strictly ban hollow AI marketing clichés (*"Torfeuerwerk"*, *"Packende Duelle"*, *"Hochspannung pur"*, *"Ein torreiches Wochenende liegt hinter uns"*, *"Testament to"*, *"Delve into"*, *"Fostering"*).
- **Match Minutes & Context Rules:**
  - Standard league database does not record match minutes. Social graphics, wallpapers, and scoreboard plates NEVER include minute markers (e.g., `(24.)`, `61.'`).
  - In website articles: When specific user context or match witness accounts are provided (e.g., injury after 10 minutes, corner header goal in the 35th minute), integrate them organically into the match narrative (*"bereits nach knapp zehn Minuten"*, *"nach etwas mehr als einer halben Stunde"* or *"in Minute 35"*). Keep summary goal blocks cleanly aggregated by player name and tally.
- **Milestone & League Facts Integration:**
  - Every round recap article MUST incorporate genuine database facts and statistical milestones from `dsg.anonymcreator.online` / Firestore:
    - Total round goals and average goals per match.
    - League-wide milestone counters (e.g., 100-goal barrier broken).
    - Top scorer leaderboard updates and streaks (e.g., 10-goal threshold, hattricks).
    - Table movements, points ties at the top, and defensive/clean sheet streaks.
    - Bye team status (*Spielfrei*).
- **Article Schema & Semantic Typography Standards:**
  - **Title:** Direct and punchy; strictly NO raw Unicode emojis in titles or headers (in adherence to the site's No-Emoji Rule).
  - **Concise Length Guideline:** Keep round recaps compact and easily digestible (approx. 1–2 focused paragraphs per match, followed by clear goal lists and bulleted key facts). Avoid overly long essays.
  - **Semantic HTML & Clean Markdown:** Structure text with clean paragraphs, bold scores, and bulleted facts.
  - **Cover Image Banner:** 800 × 480 px (5:3 / 16:9 ratio) branded asset located in `Website/news/` (e.g., `Website/news/runde-7.png`).
- **Dashboard Workflow (NEVER Auto-Publish to Website):**
  - **Strictly Prohibited:** NEVER push, overwrite, or publish articles directly to `Website/data/articles.json` or Firestore `system/news_data` automatically.
  - **User-Controlled Dashboard Publishing:** ALWAYS deliver the finalized text, title, excerpt, and match facts directly in chat so the user can review, fine-tune, and publish it manually via the Admin Dashboard (`#/admin`).
  - **Banner Asset Provision:** Generate and save the ready-to-use cover banner in `Website/news/` (e.g., `Website/news/runde-7.png`) for the user to select or link in the admin news form.






---

## 16. Matchday Meme Suite & Viral Social Media Standards
- **Weekly Schedule Integration:**
  - Wednesday is the official **"Round Memes & Viral Highlights"** post day in the 7-day social media cycle.
- **Dual-Format Production Mandate:**
  - **Square Format (1:1 — 1080 × 1080 px):** Optimized for high-engagement Instagram feed swipe carousels.
  - **Vertical Story Format (9:16 — 1080 × 1920 px):** Full-bleed story format for Instagram Stories, WhatsApp Status, and TikTok.
- **Branded Canvas Architecture:**
  - **Atmospheric Background:** Branded stadium night atmosphere (`Wallpapers/Backgrounds/stadium_green_01.png`) with smooth top and bottom vignettes fading into deep stadium shadow (`#010e07`).
  - **Header Block:** `DSG LIGA MEMES` in white Impact display font (`54px` square, `62px` vertical), flanked by vibrant DSG Green (`#00f05f`) accent lines, with subtitle `SAISON 26/27 • RUNDE X` in DSG green.
  - **Meme Card Container:** White or light-tinted meme card with rounded corners (`radius = 10-12px`), dark drop shadow (`alpha = 220`, blur `10px`), and subtle green keyline border (`RGBA(0, 240, 95, 150)`, width `2px`).
  - **Bottom Brand Anchor:** Official white DSG Liga logo (`Wallpapers/Logos/standard/DSGLiga_white.png`) centered horizontally at the bottom (`y = 928px` square, `y = 1690px` vertical).
- **Typography Standards (Authentic Meme Styling):**
  - **STRICT ANTI-PATTERN:** NEVER put dark UI pills, dark rectangles, or green borders around meme labels/captions on top of photos!
  - **Meme Text Rule:** Use authentic classic meme typography — bold pure white Impact text (`#FFFFFF`) with a heavy black outline (`stroke_width = 4`, `stroke_fill = (0, 0, 0)`) and subtle drop shadow for maximum contrast and legibility over complex photographic backgrounds.
  - **Brevity & Punchiness:** Keep captions short, punchy, and instantly readable on mobile devices.
- **Badge & Crest Placement Standards:**
  - **Official Standard Logos:** Always use official full-color crests from `Logos/Ready/standard/`.
  - **Character Face Protection:** NEVER obscure or cover the characters' faces, eyes, or smiles with club crests (e.g. Disaster Girl: badge sits on her hair/head, leaving her facial expression and smirk 100% visible).
  - **Multi-Panel Composition Rule:** In multi-panel memes (e.g. Sad Pablo Escobar Waiting), do NOT scatter duplicate crests across every panel. Use **ONE single prominent crest** positioned in the **exact geometric center** (`x = 50%`, `y = 50%`) where all panels converge.
  - **Drop Shadow:** Always paste crests with a soft Gaussian drop shadow (`alpha = 220`, blur `4-5px`).
- **Comprehensive League Coverage:**
  - Every round meme drop should cover all clubs and major round storylines: high-scoring thrillers, comebacks, collapses, postponed matches (*"Hast du abgesagt?"*), and bye teams (*Spielfrei*).
- **Standard File Structure & Delivery:**
  - Square Memes: `Wallpapers/Ready/Runde {X}/Memes/runde{X}_meme_{idx}_{slug}.png`
  - Vertical Memes: `Wallpapers/Ready/Runde {X}/Memes/runde{X}_meme_{idx}_{slug}_9_16.png`
  - Caption File: `Wallpapers/Ready/Runde {X}/Memes/runde{X}_memes_caption.txt`


---

## 17. Instagram Profile Grid Uniformity & Story Exclusivity Strategy
- **3x3 Triad Grid Uniformity Mandate:**
  - The main Instagram profile feed grid MUST remain 100% aesthetically uniform and brand-aligned at all times.
  - Every single feed post must feature the approved V4 Symmetrical Triad cover (`SAISON 26/27` + `RUNDE X` + Subtitle Tag) as Slide 1. This includes:
    - Round Preview / Overview posts (`rundeX_cover.png`)
    - Result drops (`rundeX_cover_spielergebnisse.png`)
    - League Table drops (`rundeX_cover_tabelle.png`)
    - In Zahlen Stats drops (`rundeX_cover_in_zahlen.png`)
    - Postponed Match announcements (`rundeX_cover_nachtragsspiel.png` / `runde8_cover_spielverschiebung.png`)
    - Matchday Meme carousels (`rundeX_cover_memes.png`)
  - When viewing the 3x3 profile grid, all tiles present an unbroken tapestry of deep stadium shadows, emerald green glow, and sharp white Impact typography.
- **Story Exclusivity for Matchday Countdown / Kickoff Posts (Friday & Saturday):**
  - Single Matchday graphics (Style D Split Ribbon: `rundeX_spielY_...`) are **STRICTLY EXCLUSIVE TO STORIES** (Instagram Stories, Facebook Stories, WhatsApp Status) in the **9:16 Vertical format** (`rundeX_spielY_..._9_16.png`).
  - They are **NEVER posted as standalone feed posts** to the main profile page, as standalone matchday cards disrupt the 3x3 Triad Cover rhythm and look disparate on the grid.
  - **Publishing Schedule & Routing:**
    - **Friday Kickoff:** Post `rundeX_spiel1_..._9_16.png` exclusively to Stories (afternoon/pre-match).
    - **Saturday Kickoffs:** Post `rundeX_spiel2_..._9_16.png` and `rundeX_spiel3_..._9_16.png` exclusively to Stories (morning/midday before the first game).
    - **Multi-Game Overview (Thursday):** Can be posted to Feed as a carousel (Slide 1: `rundeX_cover.png`, Slide 2: `rundeX_games_overview.png`) alongside the Story broadcast (`rundeX_games_overview_9_16.png`).
- **Staggered Matchday Publishing Rhythm (Anti-Cannibalization Mandate):**
  - **STRICT ANTI-PATTERN:** NEVER bundle or post *Spielergebnisse* and *Tabelle* on the same day! Instagram throttles reach on consecutive posts, and players/fans need distinct focus moments.
  - **The 7-Day Matchday & Content Distribution Calendar:**
    - **Thursday (~17:00–18:30):** **Round Preview ("Vorschau")**
      - Feed Carousel: Slide 1 `rundeX_cover.png`, Slide 2 `rundeX_games_overview.png`.
      - Story: `rundeX_games_overview_9_16.png` with Interactive Poll Sticker ("Welches Match schaust du dir an?").
    - **Friday (Afternoon / ~16:00):** **Friday Matchday Countdown**
      - Story Exclusive (9:16): `rundeX_spiel1_..._9_16.png` with Prediction / Slider Sticker ("Flutlicht-Hit! Dein Tipp?").
    - **Saturday (Morning / ~11:00):** **Saturday Matchday Countdowns**
      - Story Exclusive (9:16): `rundeX_spiel2_..._9_16.png` & `rundeX_spiel3_..._9_16.png` with Matchday Quiz / Tipp stickers.
    - **Saturday Evening (~18:00–19:30, Immediately Post-Match):** **Round Results ("Spielergebnisse")**
      - Feed Carousel: Slide 1 `rundeX_cover_spielergebnisse.png` + dynamic result scorecards.
      - Stories: Individual 9:16 vertical result cards.
      - Strategic Goal: Captures players, coaches, and spectators immediately after the final whistles while post-game discussions are peaking.
    - **Sunday (~12:00–17:00):** **Die Tabelle (League Standings)**
      - Feed Post: Slide 1 `rundeX_cover_tabelle.png` + updated official league table.
      - Story: 9:16 vertical table overview.
      - Strategic Goal: Provides a clean, dedicated spotlight for league table debates, championship races, and relegation battles without competing against the Results post.
    - **Tuesday (~17:00–19:00):** **In Zahlen (Matchday Records & Statistics)**
      - Feed Carousel: Slide 1 `rundeX_cover_in_zahlen.png` + Slides 2 & 3 (6 curated league facts).
      - Story: `rundeX_in_zahlen_9_16.png`.
      - Strategic Goal: Mid-week analytical engagement celebrating top scorers, defensive clean sheets, and statistical milestones.
    - **Wednesday (~17:00–19:00):** **Matchday Memes & Viral Highlights**
      - Feed Carousel: Slide 1 `rundeX_cover_memes.png` + approved meme suite covering all clubs.
      - Stories: Individual 9:16 meme slides.
      - Strategic Goal: Maximum viral reach, humor, club banter, and non-follower explore traffic.

---

## 18. Organic Growth Engine & Proactive Generation Reminders
- **Core Insights from Professional Dashboard Analysis:**
  - Non-follower discovery accounts for >52% of impressions; Reels & Memes drive external viral traffic, Stories drive local player retention (~35% of views), and Feed Carousels drive >42% of all interactions.
  - The primary bottleneck is **profile-visit to follower conversion** (13.8% visit rate, but only ~6% follow conversion).
- **Collab Tagging Standard (`Beitragenden einladen`):**
  - Whenever publishing *Spielergebnisse*, *Tabelle*, or *Matchday Preview*, the user should invite the featured clubs as **Instagram Co-Authors / Collaborators**.
  - Cross-posts the graphic directly onto the clubs' official feeds, instantly unlocking hundreds of local players and supporters with zero ad spend.
- **Mandatory Caption Tagging Implementation Standard:**
  - **STRICT MANDATE:** Whenever writing or generating ANY new Instagram caption (for Round Previews, Single Matchday Stories, Results / *Spielergebnisse*, Table, *In Zahlen*, Memes, or Stories), the assistant MUST automatically pull the verified Instagram handles from [`DSG_Liga_Instagram_Directory.md`](file:///c:/Users/43670/Desktop/Graphics/AnonymCreator%20-%20Digitalstudion/Webseiten/DSG%20Liga/Wallpapers/Instagram%20Accounts/DSG_Liga_Instagram_Directory.md) and implement them directly into the caption!
  - **Strict Direct-Mention Rule for Players:** ONLY tag an individual player's Instagram handle when that player is explicitly discussed, named, or highlighted in the caption (e.g., goalscorer, MOTM, milestone record holder). NEVER mass-tag or spam players who are not directly part of the story/text. Clubs can be tagged for team fixtures and results, but players are tagged strictly on direct editorial relevance.
  - **In Matchday Previews & Overviews:** Tag the participating official club accounts (e.g., `@union_heiligenberg`, `@dsg_josefoed`, `@etehadlinz`, `@walkerfc_linz`, `@dsg_traun`, `@svcroatialinz`) and only key players who are directly discussed in the text.
  - **In Results & Stats Drops:** Tag every goalscorer, MOTM, clean-sheet goalkeeper, and carded player directly next to their name or in a dedicated "⚽ Torschützen & Akteure" tag section (e.g. `⚽ @moritz_rad, @serban_nicolae_alexandru14, @dejan_1950, @mehraliamiri`).
  - **Zero Generic Placeholders:** Never output plain untagged text or placeholder names when verified Instagram handles exist in the directory.
  - **Master Directory Location:** Permanently maintained in [`Wallpapers/Instagram Accounts/DSG_Liga_Instagram_Directory.md`](file:///c:/Users/43670/Desktop/Graphics/AnonymCreator%20-%20Digitalstudion/Webseiten/DSG%20Liga/Wallpapers/Instagram%20Accounts/DSG_Liga_Instagram_Directory.md) (72+ verified accounts).
- **Interactive Story Stickers Standard:**
  - Every 9:16 matchday and overview story should incorporate native Instagram engagement stickers (Polls, Tippspiel Sliders, Quizzes, Question boxes) to maximize sticker tap rates and boost story tray priority to the first position.
- **MANDATORY PROACTIVE REMINDER DIRECTIVE:**
  - Whenever generating match previews, results captions, table posts, stats drops, or story assets, the assistant MUST proactively include a dedicated **"📲 Social Growth & Posting Reminders"** box containing:
    1. **Recommended Publishing Window** (exact day & optimal hour).
    2. **Collab Partners to Invite** (e.g. `@club1`, `@club2`).
    3. **Key Player / Scorer Tagging List** for caption and story.
    4. **Interactive Story Sticker Suggestion** (e.g. specific poll question or slider text).

