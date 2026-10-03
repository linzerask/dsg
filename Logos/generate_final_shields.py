import math
import json
import numpy as np

def cubic_bezier(p0, p1, p2, p3, num_points=35):
    t = np.linspace(0, 1, num_points)
    pts = []
    for val in t:
        x = (1-val)**3 * p0[0] + 3*(1-val)**2 * val * p1[0] + 3*(1-val) * val**2 * p2[0] + val**3 * p3[0]
        y = (1-val)**3 * p0[1] + 3*(1-val)**2 * val * p1[1] + 3*(1-val) * val**2 * p2[1] + val**3 * p3[1]
        pts.append([round(float(x), 2), round(float(y), 2)])
    return pts

def arc_points(cx, cy, rx, ry, start_angle_deg, end_angle_deg, num_points=40):
    angles = np.linspace(math.radians(start_angle_deg), math.radians(end_angle_deg), num_points)
    pts = []
    for a in angles:
        pts.append([round(float(cx + rx * math.cos(a)), 2), round(float(cy + ry * math.sin(a)), 2)])
    return pts

shields = []

# 1. Classic Heater Shield (Flat top, vertical sides, smooth sweeping curve to sharp bottom tip)
pts1 = [[160, 140], [864, 140], [864, 480]]
c1_r = cubic_bezier([864, 480], [864, 690], [700, 835], [512, 890], num_points=35)
pts1.extend(c1_r[1:])
c1_l = cubic_bezier([512, 890], [324, 835], [160, 690], [160, 480], num_points=35)
pts1.extend(c1_l[1:])
shields.append({
    "id": "shield_01_classic_heater",
    "name": "Classic Heater Shield",
    "desc": "Traditional European football crest with flat top, vertical flanks, and sweeping arc meeting at a sharp base",
    "polygon": pts1
})

# 2. Iberian / Spanish Rounded Crest (Straight sides, semicircular round base)
pts2 = [[170, 140], [854, 140], [854, 540]]
arc2 = arc_points(512, 540, 342, 342, 0, 180, num_points=50)
pts2.extend(arc2[1:])
shields.append({
    "id": "shield_02_iberian_rounded",
    "name": "Iberian Rounded Crest",
    "desc": "Classic Spanish/Portuguese football shield with straight flanks and a smooth semicircular base",
    "polygon": pts2
})

# 3. Swiss Notched Crest (Concave top dip, ear notches, flared shoulders, pointed bottom)
top_dip_l = cubic_bezier([174, 140], [280, 175], [420, 180], [512, 180], num_points=20)
top_dip_r = cubic_bezier([512, 180], [604, 180], [744, 175], [850, 140], num_points=20)
pts3 = []
pts3.extend(top_dip_l)
pts3.extend(top_dip_r[1:])
pts3.extend([[830, 230], [870, 280], [870, 480]])
c3_r = cubic_bezier([870, 480], [870, 690], [700, 835], [512, 895], num_points=35)
pts3.extend(c3_r[1:])
c3_l = cubic_bezier([512, 895], [324, 835], [154, 690], [154, 480], num_points=35)
pts3.extend(c3_l[1:])
pts3.extend([[154, 280], [194, 230], [174, 140]])
shields.append({
    "id": "shield_03_swiss_notched",
    "name": "Swiss Notched Crest",
    "desc": "Shield with concave top dip, flared shoulder notches, and tapered body to a sharp point",
    "polygon": pts3
})

# 4. Florentine Scalloped Shield (Double arched top with center dip, ear points, waist curves)
top_arch_l = cubic_bezier([512, 185], [420, 130], [280, 130], [194, 170], num_points=25)
top_arch_r = cubic_bezier([830, 170], [744, 130], [604, 130], [512, 185], num_points=25)
pts4 = []
pts4.extend(top_arch_l)
pts4.extend([[214, 245]])
waist_l = cubic_bezier([214, 245], [160, 320], [160, 420], [160, 500], num_points=20)
pts4.extend(waist_l[1:])
flank4_l = cubic_bezier([160, 500], [160, 680], [320, 830], [512, 895], num_points=35)
pts4.extend(flank4_l[1:])
flank4_r = cubic_bezier([512, 895], [704, 830], [864, 680], [864, 500], num_points=35)
pts4.extend(flank4_r[1:])
waist_r = cubic_bezier([864, 500], [864, 420], [864, 320], [810, 245], num_points=20)
pts4.extend(waist_r[1:])
pts4.extend([[830, 170]])
pts4.extend(top_arch_r[1:])
shields.append({
    "id": "shield_04_florentine_scalloped",
    "name": "Florentine Scalloped Shield",
    "desc": "Renaissance / Italian heraldic shield with scalloped double-arched top and side flourishes",
    "polygon": pts4
})

# 5. Modern Hexagonal Badge (6-sided sharp geometric shield)
pts5 = [
    [270, 135],
    [754, 135],
    [874, 380],
    [874, 620],
    [512, 895],
    [150, 620],
    [150, 380]
]
shields.append({
    "id": "shield_05_modern_hexagonal",
    "name": "Modern Hexagonal Badge",
    "desc": "Sharp geometric angular football crest with 6 faceted sides and modern sharp silhouette",
    "polygon": pts5
})

# 6. Crown Crenellated Crest (Castle battlement top header, straight sides, curved sharp bottom)
pts6 = [
    [160, 235],
    [255, 235],
    [255, 135],
    [375, 135],
    [375, 205],
    [435, 205],
    [435, 135],
    [589, 135],
    [589, 205],
    [649, 205],
    [649, 135],
    [769, 135],
    [769, 235],
    [864, 235],
    [864, 480]
]
c6_r = cubic_bezier([864, 480], [864, 690], [700, 835], [512, 890], num_points=35)
pts6.extend(c6_r[1:])
c6_l = cubic_bezier([512, 890], [324, 835], [160, 690], [160, 480], num_points=35)
pts6.extend(c6_l[1:])
shields.append({
    "id": "shield_06_crown_crenellated",
    "name": "Crown Stepped Crest",
    "desc": "Shield with 3-turret/crenellated castle crown header and sleek tapered lower body",
    "polygon": pts6
})

# 7. Gothic Ogive Shield (Continuous elegant outward arc from top corners meeting at sharp bottom point)
pts7 = [[170, 140], [854, 140]]
c7_r = cubic_bezier([854, 140], [854, 460], [740, 755], [512, 895], num_points=40)
pts7.extend(c7_r[1:])
c7_l = cubic_bezier([512, 895], [284, 755], [170, 460], [170, 140], num_points=40)
pts7.extend(c7_l[1:])
shields.append({
    "id": "shield_07_gothic_ogive",
    "name": "Gothic Ogive Shield",
    "desc": "Continuous elegant arc from top corners meeting at a sharp ogive base",
    "polygon": pts7
})

# 8. Stadium Rounded Crest (Convex curved top, straight sides, convex curved bottom)
top_arc8 = cubic_bezier([170, 220], [300, 135], [724, 135], [854, 220], num_points=30)
bot_arc8 = cubic_bezier([854, 740], [724, 885], [300, 885], [170, 740], num_points=30)
pts8 = []
pts8.extend(top_arc8)
pts8.append([854, 740])
pts8.extend(bot_arc8[1:])
pts8.append([170, 220])
shields.append({
    "id": "shield_08_stadium_pill",
    "name": "Stadium Rounded Shield",
    "desc": "Modern arena badge with convex arched top, straight sides, and convex arched bottom",
    "polygon": pts8
})

# 9. Diamond Lozenge Crest (Dynamic 4-point football diamond badge with curved flanks)
d9_tr = cubic_bezier([512, 130], [680, 280], [874, 380], [874, 512], num_points=25)
d9_br = cubic_bezier([874, 512], [874, 644], [680, 744], [512, 894], num_points=25)
d9_bl = cubic_bezier([512, 894], [344, 744], [150, 644], [150, 512], num_points=25)
d9_tl = cubic_bezier([150, 512], [150, 380], [344, 280], [512, 130], num_points=25)
pts9 = []
pts9.extend(d9_tr)
pts9.extend(d9_br[1:])
pts9.extend(d9_bl[1:])
pts9.extend(d9_tl[1:])
shields.append({
    "id": "shield_09_diamond_lozenge",
    "name": "Diamond Lozenge Crest",
    "desc": "Dynamic 4-point football diamond crest with slightly bowed aerodynamic flanks",
    "polygon": pts9
})

# 10. Pointed Chevron Scutum (Pointed top roof, angled corners, curved tapered body to bottom sharp tip)
pts10 = [[512, 130], [860, 220], [860, 480]]
c10_r = cubic_bezier([860, 480], [860, 690], [700, 835], [512, 895], num_points=35)
pts10.extend(c10_r[1:])
c10_l = cubic_bezier([512, 895], [324, 835], [164, 690], [164, 480], num_points=35)
pts10.extend(c10_l[1:])
pts10.extend([[164, 220], [512, 130]])
shields.append({
    "id": "shield_10_pointed_scutum",
    "name": "Pointed Chevron Scutum",
    "desc": "Modern dynamic football shield with chevron pointed top roof and athletic tapered body",
    "polygon": pts10
})

with open("final_shields.json", "w", encoding="utf-8") as f:
    json.dump(shields, f, indent=2)

print(f"Final shields count: {len(shields)}")
