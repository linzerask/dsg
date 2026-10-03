import math
import numpy as np
from PIL import Image, ImageDraw

def cubic_bezier(p0, p1, p2, p3, num_points=40):
    t = np.linspace(0, 1, num_points)
    pts = []
    for val in t:
        x = (1-val)**3 * p0[0] + 3*(1-val)**2 * val * p1[0] + 3*(1-val) * val**2 * p2[0] + val**3 * p3[0]
        y = (1-val)**3 * p0[1] + 3*(1-val)**2 * val * p1[1] + 3*(1-val) * val**2 * p2[1] + val**3 * p3[1]
        pts.append([round(x, 2), round(y, 2)])
    return pts

def arc_points(cx, cy, rx, ry, start_angle_deg, end_angle_deg, num_points=40):
    angles = np.linspace(math.radians(start_angle_deg), math.radians(end_angle_deg), num_points)
    pts = []
    for a in angles:
        pts.append([round(cx + rx * math.cos(a), 2), round(cy + ry * math.sin(a), 2)])
    return pts

# Let's design all 10 shield polygon point sets with high precision:
# Canvas: 1024 x 1024. Center: (512, 512).

shields_data = {}

# 1. Classic Heater Shield (Flat top, vertical sides, smooth sweeping curve to sharp bottom tip)
pts1 = [[160, 140], [864, 140], [864, 480]]
# right curve from (864, 480) to (512, 890)
c_right = cubic_bezier([864, 480], [864, 680], [700, 830], [512, 890], num_points=35)
pts1.extend(c_right[1:])
# left curve from (512, 890) to (160, 480)
c_left = cubic_bezier([512, 890], [324, 830], [160, 680], [160, 480], num_points=35)
pts1.extend(c_left[1:])
shields_data["shield_01_classic_heater"] = {
    "name": "Classic Heater Shield",
    "desc": "Traditional European football crest with straight top, vertical sides, and sweeping curve to a sharp point",
    "polygon": pts1
}

# 2. Iberian / Spanish Rounded Crest (Straight sides, semicircular round base)
pts2 = [[170, 140], [854, 140], [854, 540]]
# semicircle from (854, 540) to (170, 540) with radius 342, center (512, 540)
arc2 = arc_points(512, 540, 342, 342, 0, 180, num_points=50)
pts2.extend(arc2[1:])
shields_data["shield_02_iberian_rounded"] = {
    "name": "Iberian Rounded Crest",
    "desc": "Classic Spanish/Portuguese football shield with straight sides and a smooth semicircular base",
    "polygon": pts2
}

# 3. Swiss Notched Crest (Concave top dip, ear notches, flared shoulders, pointed bottom)
top_dip = cubic_bezier([184, 140], [300, 175], [450, 175], [512, 175], num_points=20)
top_dip_r = cubic_bezier([512, 175], [574, 175], [724, 140], [840, 140], num_points=20)
pts3 = []
pts3.extend(top_dip)
pts3.extend(top_dip_r[1:])
pts3.extend([[820, 230], [864, 280], [864, 480]])
c3_r = cubic_bezier([864, 480], [864, 680], [700, 830], [512, 890], num_points=35)
pts3.extend(c3_r[1:])
c3_l = cubic_bezier([512, 890], [324, 830], [160, 680], [160, 480], num_points=35)
pts3.extend(c3_l[1:])
pts3.extend([[160, 280], [204, 230], [184, 140]])
shields_data["shield_03_swiss_notched"] = {
    "name": "Swiss Notched Crest",
    "desc": "Shield with concave top dip, flared shoulder notches, and tapered body to a sharp point",
    "polygon": pts3
}

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
shields_data["shield_04_florentine_scalloped"] = {
    "name": "Florentine Scalloped Shield",
    "desc": "Renaissance / Italian heraldic shield with scalloped double-arched top and side horn flourishes",
    "polygon": pts4
}

# 5. Modern Hexagonal Badge (6-sided sharp geometric shield)
pts5 = [
    [280, 140],
    [744, 140],
    [874, 370],
    [874, 600],
    [512, 890],
    [150, 600],
    [150, 370]
]
shields_data["shield_05_modern_hexagonal"] = {
    "name": "Modern Hexagonal Badge",
    "desc": "Sharp geometric angular football crest with 6 faceted sides and modern sharp silhouette",
    "polygon": pts5
}

# 6. Crown Crenellated Crest (Castle battlement top header, straight sides, curved sharp bottom)
pts6 = [
    [160, 240],
    [260, 240],
    [260, 140],
    [380, 140],
    [380, 205],
    [440, 205],
    [440, 140],
    [584, 140],
    [584, 205],
    [644, 205],
    [644, 140],
    [764, 140],
    [764, 240],
    [864, 240],
    [864, 480]
]
c6_r = cubic_bezier([864, 480], [864, 680], [700, 830], [512, 890], num_points=35)
pts6.extend(c6_r[1:])
c6_l = cubic_bezier([512, 890], [324, 830], [160, 680], [160, 480], num_points=35)
pts6.extend(c6_l[1:])
shields_data["shield_06_crown_crenellated"] = {
    "name": "Crown Stepped Crest",
    "desc": "Shield with 3-turret/crenellated castle crown header and sleek tapered lower body",
    "polygon": pts6
}

# 7. Gothic Ogive Shield (Continuous elegant outward arc from top corners meeting at sharp bottom point)
pts7 = [[170, 140], [854, 140]]
c7_r = cubic_bezier([854, 140], [854, 450], [740, 750], [512, 895], num_points=40)
pts7.extend(c7_r[1:])
c7_l = cubic_bezier([512, 895], [284, 750], [170, 450], [170, 140], num_points=40)
pts7.extend(c7_l[1:])
shields_data["shield_07_gothic_ogive"] = {
    "name": "Gothic Ogive Shield",
    "desc": "Continuous elegant arc from top corners meeting at a sharp ogive base",
    "polygon": pts7
}

# 8. Stadium Rounded Crest (Convex curved top, straight sides, convex curved bottom)
top_arc8 = cubic_bezier([170, 220], [300, 135], [724, 135], [854, 220], num_points=30)
bot_arc8 = cubic_bezier([854, 740], [724, 885], [300, 885], [170, 740], num_points=30)
pts8 = []
pts8.extend(top_arc8)
pts8.append([854, 740])
pts8.extend(bot_arc8[1:])
pts8.append([170, 220])
shields_data["shield_08_stadium_pill"] = {
    "name": "Stadium Rounded Shield",
    "desc": "Modern arena badge with convex arched top, straight sides, and convex arched bottom",
    "polygon": pts8
}

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
shields_data["shield_09_diamond_lozenge"] = {
    "name": "Diamond Lozenge Crest",
    "desc": "Dynamic 4-point football diamond crest with slightly bowed aerodynamic flanks",
    "polygon": pts9
}

# 10. Pointed Chevron Scutum (Pointed top roof, angled corners, curved tapered body to bottom sharp tip)
pts10 = [[512, 130], [860, 220], [860, 480]]
c10_r = cubic_bezier([860, 480], [860, 680], [700, 830], [512, 895], num_points=35)
pts10.extend(c10_r[1:])
c10_l = cubic_bezier([512, 895], [324, 830], [164, 680], [164, 480], num_points=35)
pts10.extend(c10_l[1:])
pts10.extend([[164, 220], [512, 130]])
shields_data["shield_10_pointed_scutum"] = {
    "name": "Pointed Chevron Scutum",
    "desc": "Modern dynamic football shield with chevron pointed top roof and athletic tapered body",
    "polygon": pts10
}

# Let's generate preview images to verify all 10 immediately
import os
os.makedirs("preview", exist_ok=True)
for sid, sinfo in shields_data.items():
    img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    poly = [(p[0], p[1]) for p in sinfo["polygon"]]
    # Draw gray fill
    draw.polygon(poly, fill=(75, 85, 99, 255))
    # Draw 8px white stroke
    draw.line(poly + [poly[0]], fill=(255, 255, 255, 255), width=8, joint="curve")
    img.save(f"preview/{sid}.png")

print("Generated 10 preview images in preview/ folder")
