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


