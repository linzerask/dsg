import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

base_dir = r"C:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Logos"
output_dir = os.path.join(base_dir, "Matchday_Wallpapers")
os.makedirs(output_dir, exist_ok=True)

gornjak_logo_path = os.path.join(base_dir, "Ready", "standard", "fcgornjak.png")
heiligenberg_logo_path = os.path.join(base_dir, "Ready", "standard", "unionheiligenberg.png")
dsg_logo_path = os.path.join(base_dir, "Ready", "standard", "DSGLiga.png")

logo_gornjak = Image.open(gornjak_logo_path).convert("RGBA")
logo_heiligenberg = Image.open(heiligenberg_logo_path).convert("RGBA")
logo_dsg = Image.open(dsg_logo_path).convert("RGBA")

W, H = 1080, 1080

def get_font(name, size, bold=False):
    font_paths = [
        f"C:/Windows/Fonts/{name}.ttf",
        f"C:/Windows/Fonts/{name}.otf",
        f"C:/Windows/Fonts/{name}bd.ttf",
        f"C:/Windows/Fonts/{name}b.ttf",
        "C:/Windows/Fonts/impact.ttf",
        "C:/Windows/Fonts/bahnschrift.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

font_title_impact_large = get_font("impact", 92, True)
font_title_bold = get_font("arialbd", 54, True)
font_sub = get_font("arialbd", 28, True)
font_vs = get_font("impact", 58, True)
font_pill_small = get_font("arialbd", 22, True)

font_team_impact = get_font("impact", 38, True)
font_team_prefix = get_font("arialbd", 20, True)
font_team_hero = get_font("impact", 42, True)
font_team_bahnschrift = get_font("bahnschrift", 34, True)

def add_drop_shadow(img, offset=(0, 16), blur=32, color=(0, 0, 0, 230)):
    shadow = Image.new("RGBA", (img.width + blur*2 + abs(offset[0])*2, img.height + blur*2 + abs(offset[1])*2), (0,0,0,0))
    r, g, b, a = img.split()
    shadow_alpha = a.point(lambda p: int(p * (color[3] / 255.0)))
    shadow_img = Image.new("RGBA", img.size, color[:3] + (255,))
    shadow_img.putalpha(shadow_alpha)
    
    paste_x = blur + max(0, offset[0])
    paste_y = blur + max(0, offset[1])
    shadow.paste(shadow_img, (paste_x, paste_y), shadow_img)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur//2))
    
    final = Image.new("RGBA", shadow.size, (0,0,0,0))
    final.paste(shadow, (0,0))
    final.paste(img, (blur + max(0, -offset[0]), blur + max(0, -offset[1])), img)
    return final, (blur + max(0, -offset[0]), blur + max(0, -offset[1]))

def build_base_split():
    img = Image.new("RGBA", (W, H), (12, 14, 18, 255))
    draw = ImageDraw.Draw(img)
    
    # 1. Background Split
    left_poly = [(0, 0), (int(W*0.62), 0), (int(W*0.38), H), (0, H)]
    draw.polygon(left_poly, fill=(58, 16, 26, 255))
    
    right_poly = [(int(W*0.62), 0), (W, 0), (W, H), (int(W*0.38), H)]
    draw.polygon(right_poly, fill=(130, 80, 10, 255))
    
    shading = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shading)
    sdraw.ellipse([40, 200, 480, 680], fill=(160, 25, 45, 65))
    sdraw.ellipse([580, 180, 1040, 680], fill=(255, 175, 15, 95))
    sdraw.rectangle([0, 0, W, 220], fill=(0, 0, 0, 75))
    shading = shading.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, shading)
    
    streaks = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    stdraw = ImageDraw.Draw(streaks)
    for i in range(-6, 16):
        offset = i * 105
        p1 = (offset, 0)
        p2 = (offset + 35, 0)
        p3 = (offset - 265, H)
        p4 = (offset - 300, H)
        stdraw.polygon([p1, p2, p3, p4], fill=(255, 255, 255, 10))
    img = Image.alpha_composite(img, streaks)
    
    beam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(beam)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(255, 225, 90, 240), width=6)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(255, 255, 255, 255), width=2)
    beam = beam.filter(ImageFilter.GaussianBlur(5))
    img = Image.alpha_composite(img, beam)
    
    flare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare)
    fdraw.ellipse([W//2 - 180, 360, W//2 + 180, 560], fill=(255, 220, 100, 50))
    flare = flare.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img, flare)
    
    # 2. Header
    draw = ImageDraw.Draw(img)
    dsg_w = 210
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    img.paste(dsg_mini, ((W - dsg_w)//2, 35), dsg_mini)
    
    m_text = "MATCHDAY"
    mbox = font_title_impact_large.getbbox(m_text)
    mw = mbox[2] - mbox[0]
    draw.text(((W - mw)//2, 105), m_text, fill=(255, 255, 255), font=font_title_impact_large)
    draw.rectangle([W//2 - 90, 215, W//2 + 90, 220], fill=(255, 215, 0))
    
    # 3. Shields
    crest_size = 285
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    sh1, off1 = add_drop_shadow(c1, offset=(0, 18), blur=32, color=(0,0,0,230))
    sh2, off2 = add_drop_shadow(c2, offset=(0, 18), blur=32, color=(0,0,0,230))
    
    crest1_x = 115
    crest1_y = 275
    crest2_x = 680
    crest2_y = 275
    
    img.paste(sh1, (crest1_x - off1[0], crest1_y - off1[1]), sh1)
    img.paste(sh2, (crest2_x - off2[0], crest2_y - off2[1]), sh2)
    
    # VS
    vs_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vs_layer)
    vdraw.ellipse([W//2 - 45, 385, W//2 + 45, 475], fill=(10, 12, 16, 190))
    vs_layer = vs_layer.filter(ImageFilter.GaussianBlur(12))
    img = Image.alpha_composite(img, vs_layer)
    
    draw = ImageDraw.Draw(img)
    vs_text = "VS"
    vs_box = font_vs.getbbox(vs_text)
    vsw = vs_box[2] - vs_box[0]
    draw.text(((W - vsw)//2, 400), vs_text, fill=(255, 225, 80), font=font_vs)
    
    # Clean Ribbons
    ribbon_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(ribbon_layer)
    
    lx1, lx2 = 45, 470
    rx1, rx2 = 610, 1035
    ly_top, ly_bot = 600, 670
    ry_top, ry_bot = 600, 670
    skew_r = 40
    
    gornjak_poly = [(lx1 + skew_r, ly_top), (lx2, ly_top), (lx2 - skew_r, ly_bot), (lx1, ly_bot)]
    rdraw.polygon(gornjak_poly, fill=(185, 25, 45, 245), outline=(255, 255, 255, 50), width=1)
    
    heiligenberg_poly = [(rx1 + skew_r, ry_top), (rx2, ry_top), (rx2 - skew_r, ry_bot), (rx1, ry_bot)]
    rdraw.polygon(heiligenberg_poly, fill=(240, 165, 18, 245), outline=(255, 255, 255, 50), width=1)
    
    img = Image.alpha_composite(img, ribbon_layer)
    
    # Match Details Section with Inclined Text
    banner_angle = math.degrees(math.atan2(-35, 1080))
    
    banner_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bndraw = ImageDraw.Draw(banner_layer)
    bndraw.polygon([(0, 750), (W, 715), (W, 975), (0, 1010)], fill=(10, 14, 20, 245))
    bndraw.line([(0, 750), (W, 715)], fill=(255, 215, 0), width=4)
    bndraw.line([(0, 1010), (W, 975)], fill=(255, 215, 0), width=4)
    img = Image.alpha_composite(img, banner_layer)
    
    text_canvas = Image.new("RGBA", (W, 300), (0, 0, 0, 0))
    tcdraw = ImageDraw.Draw(text_canvas)
    
    location_str = "SPIELORT: DSG-PLATZ • OFFIZIELLES LIGASPIEL"
    
    date_str = "SAMSTAG • 03. OKTOBER 2026"
    d_box = font_sub.getbbox(date_str)
    dw = d_box[2] - d_box[0]
    tcdraw.text(((W - dw)//2, 25), date_str, fill=(255, 255, 255), font=font_sub)
    
    time_str = "ANPFIFF 16:00 UHR"
    tm_box = font_title_bold.getbbox(time_str)
    tm_w = tm_box[2] - tm_box[0]
    tcdraw.text(((W - tm_w)//2, 75), time_str, fill=(255, 215, 0), font=font_title_bold)
    
    loc_box = font_pill_small.getbbox(location_str)
    loc_w = loc_box[2] - loc_box[0]
    tcdraw.text(((W - loc_w)//2, 160), location_str, fill=(185, 200, 220), font=font_pill_small)
    
    rotated_text = text_canvas.rotate(banner_angle, resample=Image.Resampling.BICUBIC, expand=False)
    img.paste(rotated_text, (0, 735), rotated_text)
    
    return img

# ==============================================================================
# 4 MODERN TEXT STYLING VARIATIONS
# ==============================================================================

# Option A: Athletic Clean 3D White (Pure High Contrast with Tactile Shadow)
def make_opt_a():
    base = build_base_split()
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    
    lx1, lx2 = 45, 470
    rx1, rx2 = 610, 1035
    ly_top, ly_bot = 600, 670
    center_lx = (lx1 + lx2) // 2
    center_rx = (rx1 + rx2) // 2
    
    font = font_team_impact
    
    t1 = "FC GORNJAK"
    b1 = font.getbbox(t1)
    w1, h1 = b1[2]-b1[0], b1[3]-b1[1]
    
    t2 = "UNION HEILIGENBERG"
    b2 = font.getbbox(t2)
    w2, h2 = b2[2]-b2[0], b2[3]-b2[1]
    
    # Left Shadow & Text
    draw.text((center_lx - w1//2 + 2, ly_top + (70 - h1)//2 + 2), t1, fill=(20, 2, 5, 220), font=font)
    draw.text((center_lx - w1//2, ly_top + (70 - h1)//2 - 2), t1, fill=(255, 255, 255), font=font)
    
    # Right Shadow & Text
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (1, 1), (2, 2)]:
        draw.text((center_rx - w2//2 + dx, ly_top + (70 - h2)//2 + dy - 2), t2, fill=(35, 18, 2, 240), font=font)
    draw.text((center_rx - w2//2, ly_top + (70 - h2)//2 - 2), t2, fill=(255, 255, 255), font=font)
    
    res = Image.alpha_composite(base, layer)
    p = os.path.join(output_dir, "Text_Option_A_Clean3DWhite.png")
    res.save(p)
    return res, p

# Option B: Two-Tone Accent Hierarchy (Prefix in Golden Accent Pill + Bold Hero Name)
def make_opt_b():
    base = build_base_split()
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    
    lx1, lx2 = 45, 470
    rx1, rx2 = 610, 1035
    ly_top, ly_bot = 600, 670
    center_lx = (lx1 + lx2) // 2
    center_rx = (rx1 + rx2) // 2
    
    # Left: FC (Gold Tag) + GORNJAK (Bold White)
    font_hero = font_team_hero
    font_pre = font_team_prefix
    
    # FC GORNJAK
    p1 = "FC "
    n1 = "GORNJAK"
    bp1 = font_pre.getbbox(p1)
    bn1 = font_hero.getbbox(n1)
    tot1 = (bp1[2]-bp1[0]) + (bn1[2]-bn1[0]) + 6
    
    start1_x = center_lx - tot1//2
    # Draw FC
    draw.text((start1_x, ly_top + 22), p1, fill=(255, 215, 0), font=font_pre)
    # Draw GORNJAK
    gx = start1_x + (bp1[2]-bp1[0]) + 6
    draw.text((gx + 2, ly_top + 13), n1, fill=(20, 2, 5, 220), font=font_hero)
    draw.text((gx, ly_top + 11), n1, fill=(255, 255, 255), font=font_hero)
    
    # Right: UNION (Dark Tag) + HEILIGENBERG (Bold Hero)
    p2 = "UNION "
    n2 = "HEILIGENBERG"
    bp2 = font_pre.getbbox(p2)
    bn2 = font_hero.getbbox(n2)
    tot2 = (bp2[2]-bp2[0]) + (bn2[2]-bn2[0]) + 6
    
    start2_x = center_rx - tot2//2
    # Draw UNION
    draw.text((start2_x, ly_top + 22), p2, fill=(30, 15, 2), font=font_pre)
    # Draw HEILIGENBERG
    hx = start2_x + (bp2[2]-bp2[0]) + 6
    for dx, dy in [(-1,0),(1,0),(0,-1),(0,1),(1,1)]:
        draw.text((hx + dx, ly_top + 11 + dy), n2, fill=(30, 15, 2), font=font_hero)
    draw.text((hx, ly_top + 11), n2, fill=(255, 255, 255), font=font_hero)
    
    res = Image.alpha_composite(base, layer)
    p = os.path.join(output_dir, "Text_Option_B_TwoToneHierarchy.png")
    res.save(p)
    return res, p

# Option C: Slanted Dynamic Athletic (Matching the exact -12° clash speed shear)
def make_opt_c():
    base = build_base_split()
    
    # Render text onto large transparent canvas then apply shear transform
    tc = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(tc)
    
    lx1, lx2 = 45, 470
    rx1, rx2 = 610, 1035
    ly_top, ly_bot = 600, 670
    center_lx = (lx1 + lx2) // 2
    center_rx = (rx1 + rx2) // 2
    
    font = font_team_impact
    
    t1 = "FC GORNJAK"
    b1 = font.getbbox(t1)
    w1, h1 = b1[2]-b1[0], b1[3]-b1[1]
    
    t2 = "UNION HEILIGENBERG"
    b2 = font.getbbox(t2)
    w2, h2 = b2[2]-b2[0], b2[3]-b2[1]
    
    # Left
    tdraw.text((center_lx - w1//2 + 2, ly_top + (70 - h1)//2 + 2), t1, fill=(255, 215, 0), font=font)
    tdraw.text((center_lx - w1//2, ly_top + (70 - h1)//2 - 2), t1, fill=(255, 255, 255), font=font)
    
    # Right
    for dx, dy in [(-2,0),(2,0),(0,-2),(0,2),(1,1),(-1,-1)]:
        tdraw.text((center_rx - w2//2 + dx, ly_top + (70 - h2)//2 + dy - 2), t2, fill=(35, 18, 4), font=font)
    tdraw.text((center_rx - w2//2, ly_top + (70 - h2)//2 - 2), t2, fill=(255, 255, 255), font=font)
    
    # Shear by -0.2 (approx -11 degrees)
    # Affine matrix: x' = x - 0.2*y, y' = y
    sheared = tc.transform((W, H), Image.AFFINE, (1, 0.15, -15, 0, 1, 0), resample=Image.BICUBIC)
    
    res = Image.alpha_composite(base, sheared)
    p = os.path.join(output_dir, "Text_Option_C_SlantedAthletic.png")
    res.save(p)
    return res, p

# Option D: Modern German DIN Engineering (Bahnschrift Bold Condensed with Fine Letterspacing)
def make_opt_d():
    base = build_base_split()
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    
    lx1, lx2 = 45, 470
    rx1, rx2 = 610, 1035
    ly_top, ly_bot = 600, 670
    center_lx = (lx1 + lx2) // 2
    center_rx = (rx1 + rx2) // 2
    
    font = font_team_bahnschrift
    
    t1 = "FC GORNJAK"
    b1 = font.getbbox(t1)
    w1, h1 = b1[2]-b1[0], b1[3]-b1[1]
    
    t2 = "UNION HEILIGENBERG"
    b2 = font.getbbox(t2)
    w2, h2 = b2[2]-b2[0], b2[3]-b2[1]
    
    # Left: Crisp White with 3D Shadow
    draw.text((center_lx - w1//2 + 2, ly_top + (70 - h1)//2 + 2), t1, fill=(20, 2, 5, 220), font=font)
    draw.text((center_lx - w1//2, ly_top + (70 - h1)//2 - 2), t1, fill=(255, 255, 255), font=font)
    
    # Right: Crisp White with Dark Shadow
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (1, 1), (2, 2)]:
        draw.text((center_rx - w2//2 + dx, ly_top + (70 - h2)//2 + dy - 2), t2, fill=(35, 18, 2, 240), font=font)
    draw.text((center_rx - w2//2, ly_top + (70 - h2)//2 - 2), t2, fill=(255, 255, 255), font=font)
    
    res = Image.alpha_composite(base, layer)
    p = os.path.join(output_dir, "Text_Option_D_DIN_Bahnschrift.png")
    res.save(p)
    return res, p

# Build 4-up Comparison Showcase
def build_comparison_showcase(imgA, imgB, imgC, imgD):
    SW, SH = 2240, 2240
    showcase = Image.new("RGBA", (SW, SH), (10, 12, 16, 255))
    draw = ImageDraw.Draw(showcase)
    
    font_hdr = get_font("arialbd", 48, True)
    font_lbl = get_font("arialbd", 28, True)
    
    # Title
    draw.text((60, 40), "TEAM NAME TEXT STYLING OPTIONS (DYNAMIC SPLIT)", fill=(255, 215, 0), font=font_hdr)
    draw.line([(60, 110), (SW - 60, 110)], fill=(255, 255, 255, 40), width=2)
    
    size = 1000
    # Top Left: Option A
    tA = imgA.resize((size, size), Image.LANCZOS)
    showcase.paste(tA, (60, 140))
    draw.text((70, 150), "[ OPTION A ] Pure Athletic 3D White", fill=(255, 215, 0), font=font_lbl)
    
    # Top Right: Option B
    tB = imgB.resize((size, size), Image.LANCZOS)
    showcase.paste(tB, (1180, 140))
    draw.text((1190, 150), "[ OPTION B ] Two-Tone Hierarchy (Prefix + Hero)", fill=(255, 215, 0), font=font_lbl)
    
    # Bottom Left: Option C
    tC = imgC.resize((size, size), Image.LANCZOS)
    showcase.paste(tC, (60, 1180))
    draw.text((70, 1190), "[ OPTION C ] Slanted Kinetic Speed (Sheared -11°)", fill=(255, 215, 0), font=font_lbl)
    
    # Bottom Right: Option D
    tD = imgD.resize((size, size), Image.LANCZOS)
    showcase.paste(tD, (1180, 1180))
    draw.text((1190, 1190), "[ OPTION D ] German DIN Athletic (Bahnschrift)", fill=(255, 215, 0), font=font_lbl)
    
    p = os.path.join(output_dir, "Text_Styling_Comparison_Showcase.png")
    showcase.save(p)
    print("Comparison showcase saved to:", p)
    return p

if __name__ == "__main__":
    imgA, pA = make_opt_a()
    imgB, pB = make_opt_b()
    imgC, pC = make_opt_c()
    imgD, pD = make_opt_d()
    pShow = build_comparison_showcase(imgA, imgB, imgC, imgD)
    print("All 4 text styling options generated!")
