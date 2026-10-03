import math

# Let's define the 10 shields using standard SVG Path data first,
# then we can both export high-res SVG and convert to Photoshop PathPoints accurately!

# Canvas: 1024x1024. Center is 512, 512.
# Shields will fit within roughly X: [160..864] (width 704), Y: [140..884] (height 744)

shields_svg = [
    {
        "id": "shield_01_classic_heater",
        "name": "Classic Heater Shield",
        "desc": "Traditional European football crest with straight top, vertical sides, and sweeping curve to a sharp point",
        # Top-left (160,140) -> Top-right (864,140) -> Side-right (864,520) -> Bottom tip (512,884) -> Side-left (160,520) -> Close
        # C x1 y1, x2 y2, x y
        "svg_d": "M 160,140 L 864,140 L 864,500 C 864,680 720,810 512,884 C 304,810 160,680 160,500 Z",
        # Exact PathPoints for Photoshop:
        # For each point: [anchor_x, anchor_y, leftDir_x, leftDir_y, rightDir_x, rightDir_y, kind]
        # In Photoshop: leftDirection = incoming handle from prev point; rightDirection = outgoing handle to next point.
        "points": [
            [160, 140, 160, 140, 160, 140, "CORNERPOINT"], # P0: top-left
            [864, 140, 864, 140, 864, 140, "CORNERPOINT"], # P1: top-right
            [864, 500, 864, 500, 864, 660, "CORNERPOINT"], # P2: right straight end, outgoing curves down-left
            [512, 884, 680, 810, 344, 810, "CORNERPOINT"], # P3: bottom point (sharp tip)
            [160, 500, 160, 660, 160, 500, "CORNERPOINT"], # P4: left straight end
        ]
    },
    {
        "id": "shield_02_iberian_rounded",
        "name": "Iberian Rounded Crest",
        "desc": "Classic Spanish/Portuguese football shield with straight sides and a smooth semicircular base",
        "svg_d": "M 170,140 L 854,140 L 854,540 C 854,730 700,884 512,884 C 324,884 170,730 170,540 Z",
        "points": [
            [170, 140, 170, 140, 170, 140, "CORNERPOINT"], # top-left
            [854, 140, 854, 140, 854, 140, "CORNERPOINT"], # top-right
            [854, 540, 854, 540, 854, 730, "CORNERPOINT"], # right straight end
            [512, 884, 700, 884, 324, 884, "SMOOTHPOINT"], # smooth rounded bottom
            [170, 540, 170, 730, 170, 540, "CORNERPOINT"], # left straight end
        ]
    },
    {
        "id": "shield_03_swiss_notched",
        "name": "Swiss Notched Crest",
        "desc": "Shield with concave top dip, flared shoulder notches, and tapered body to a sharp point",
        "svg_d": "M 512,170 C 620,170 730,140 840,140 L 820,230 L 864,280 L 864,520 C 864,680 720,810 512,884 C 304,810 160,680 160,520 L 160,280 L 204,230 L 184,140 C 294,140 404,170 512,170 Z",
        "points": [
            [512, 170, 420, 170, 604, 170, "SMOOTHPOINT"], # top center dip
            [840, 140, 730, 140, 840, 140, "CORNERPOINT"], # top right ear
            [820, 230, 820, 230, 820, 230, "CORNERPOINT"], # notch right
            [864, 280, 864, 280, 864, 280, "CORNERPOINT"], # shoulder right
            [864, 520, 864, 520, 864, 680, "CORNERPOINT"], # right flank start curve
            [512, 884, 720, 810, 304, 810, "CORNERPOINT"], # bottom tip
            [160, 520, 160, 680, 160, 520, "CORNERPOINT"], # left flank end curve
            [160, 280, 160, 280, 160, 280, "CORNERPOINT"], # shoulder left
            [204, 230, 204, 230, 204, 230, "CORNERPOINT"], # notch left
            [184, 140, 184, 140, 294, 140, "CORNERPOINT"], # top left ear
        ]
    },
    {
        "id": "shield_04_florentine_scalloped",
        "name": "Florentine Scalloped Shield",
        "desc": "Renaissance / Italian heraldic shield with scalloped double-arched top and side horn flourishes",
        "svg_d": "M 512,200 C 580,140 700,130 830,170 L 810,250 C 850,300 870,400 870,490 C 870,680 720,810 512,890 C 304,810 154,680 154,490 C 154,400 174,300 214,250 L 194,170 C 324,130 444,140 512,200 Z",
        "points": [
            [512, 200, 450, 150, 574, 150, "CORNERPOINT"], # top center notch
            [830, 170, 720, 130, 830, 170, "CORNERPOINT"], # right ear
            [810, 250, 810, 250, 840, 280, "CORNERPOINT"], # waist notch right
            [870, 490, 870, 370, 870, 680, "CORNERPOINT"], # right flank
            [512, 890, 720, 810, 304, 810, "CORNERPOINT"], # bottom tip
            [154, 490, 154, 680, 154, 370, "CORNERPOINT"], # left flank
            [214, 250, 184, 280, 214, 250, "CORNERPOINT"], # waist notch left
            [194, 170, 194, 170, 304, 130, "CORNERPOINT"], # left ear
        ]
    },
    {
        "id": "shield_05_modern_hexagonal",
        "name": "Modern Hexagonal Badge",
        "desc": "Sharp geometric angular football crest with 6 faceted sides and modern sharp silhouette",
        "svg_d": "M 280,140 L 744,140 L 874,370 L 874,600 L 512,884 L 150,600 L 150,370 Z",
        "points": [
            [280, 140, 280, 140, 280, 140, "CORNERPOINT"],
            [744, 140, 744, 140, 744, 140, "CORNERPOINT"],
            [874, 370, 874, 370, 874, 370, "CORNERPOINT"],
            [874, 600, 874, 600, 874, 600, "CORNERPOINT"],
            [512, 884, 512, 884, 512, 884, "CORNERPOINT"],
            [150, 600, 150, 600, 150, 600, "CORNERPOINT"],
            [150, 370, 150, 370, 150, 370, "CORNERPOINT"],
        ]
    },
    {
        "id": "shield_06_crown_crenellated",
        "name": "Crown Stepped Crest",
        "desc": "Shield with 3-turret/crenellated castle crown header and sleek tapered lower body",
        "svg_d": "M 160,240 L 260,240 L 260,140 L 380,140 L 380,210 L 440,210 L 440,140 L 584,140 L 584,210 L 644,210 L 644,140 L 764,140 L 764,240 L 864,240 L 864,520 C 864,680 720,810 512,884 C 304,810 160,680 160,520 Z",
        "points": [
            [160, 240, 160, 240, 160, 240, "CORNERPOINT"],
            [260, 240, 260, 240, 260, 240, "CORNERPOINT"],
            [260, 140, 260, 140, 260, 140, "CORNERPOINT"],
            [380, 140, 380, 140, 380, 140, "CORNERPOINT"],
            [380, 210, 380, 210, 380, 210, "CORNERPOINT"],
            [440, 210, 440, 210, 440, 210, "CORNERPOINT"],
            [440, 140, 440, 140, 440, 140, "CORNERPOINT"],
            [584, 140, 584, 140, 584, 140, "CORNERPOINT"],
            [584, 210, 584, 210, 584, 210, "CORNERPOINT"],
            [644, 210, 644, 210, 644, 210, 644, "CORNERPOINT"],
            [644, 140, 644, 140, 644, 140, "CORNERPOINT"],
            [764, 140, 764, 140, 764, 140, "CORNERPOINT"],
            [764, 240, 764, 240, 764, 240, "CORNERPOINT"],
            [864, 240, 864, 240, 864, 240, "CORNERPOINT"],
            [864, 520, 864, 520, 864, 680, "CORNERPOINT"],
            [512, 884, 720, 810, 304, 810, "CORNERPOINT"],
            [160, 520, 160, 680, 160, 520, "CORNERPOINT"],
        ]
    },
    {
        "id": "shield_07_gothic_ogive",
        "name": "Gothic Ogive Shield",
        "desc": "Continuous elegant arc from top corners meeting at a sharp ogive base",
        "svg_d": "M 170,140 L 854,140 C 854,420 760,730 512,890 C 264,730 170,420 170,140 Z",
        "points": [
            [170, 140, 170, 140, 170, 140, "CORNERPOINT"],
            [854, 140, 854, 140, 854, 380, "CORNERPOINT"],
            [512, 890, 760, 730, 264, 730, "CORNERPOINT"],
            [170, 140, 170, 380, 170, 140, "CORNERPOINT"],
        ]
    },
    {
        "id": "shield_08_stadium_pill",
        "name": "Stadium Rounded Shield",
        "desc": "Modern arena badge with convex arched top, straight sides, and convex arched bottom",
        "svg_d": "M 170,240 C 270,140 754,140 854,240 L 854,720 C 754,884 270,884 170,720 Z",
        "points": [
            [170, 240, 170, 240, 280, 140, "CORNERPOINT"],
            [854, 240, 744, 140, 854, 240, "CORNERPOINT"],
            [854, 720, 854, 720, 744, 880, "CORNERPOINT"],
            [170, 720, 280, 880, 170, 720, "CORNERPOINT"],
        ]
    },
    {
        "id": "shield_09_diamond_lozenge",
        "name": "Diamond Lozenge Crest",
        "desc": "Dynamic 4-point football diamond crest with slightly bowed aerodynamic flanks",
        "svg_d": "M 512,130 C 700,290 880,410 880,512 C 880,614 700,734 512,894 C 324,734 144,614 144,512 C 144,410 324,290 512,130 Z",
        "points": [
            [512, 130, 370, 250, 654, 250, "CORNERPOINT"],
            [880, 512, 880, 420, 880, 604, "CORNERPOINT"],
            [512, 894, 654, 774, 370, 774, "CORNERPOINT"],
            [144, 512, 144, 604, 144, 420, "CORNERPOINT"],
        ]
    },
    {
        "id": "shield_10_pointed_scutum",
        "name": "Pointed Chevron Scutum",
        "desc": "Modern dynamic football shield with chevron pointed top roof and athletic tapered body",
        "svg_d": "M 512,130 L 860,220 L 860,520 C 860,680 720,810 512,884 C 304,810 164,680 164,520 L 164,220 Z",
        "points": [
            [512, 130, 512, 130, 512, 130, "CORNERPOINT"], # top peak
            [860, 220, 860, 220, 860, 220, "CORNERPOINT"], # top right
            [860, 520, 860, 520, 860, 680, "CORNERPOINT"], # right flank start curve
            [512, 884, 720, 810, 304, 810, "CORNERPOINT"], # bottom tip
            [164, 520, 164, 680, 164, 520, "CORNERPOINT"], # left flank end curve
            [164, 220, 164, 220, 164, 220, "CORNERPOINT"], # top left
        ]
    }
]

import json
with open("shields_data.json", "w", encoding="utf-8") as f:
    json.dump(shields_svg, f, indent=2)

print("Saved shields_data.json")
