import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

base_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos"
output_dir = os.path.join(base_dir, "Matchday_Wallpapers")
assets_dir = os.path.join(output_dir, "assets")
os.makedirs(output_dir, exist_ok=True)

# Assets paths
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
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

font_title_impact = get_font("impact", 80, True)
font_title_impact_large = get_font("impact", 92, True)
font_title_bold = get_font("segoeuib", 58, True)
font_sub = get_font("segoeuib", 30, True)
font_sub_condensed = get_font("arialbd", 26, True)
font_team = get_font("arialbd", 34, True)
font_team_small = get_font("arialbd", 30, True)
font_pill = get_font("segoeuib", 24, True)
font_pill_small = get_font("segoeuib", 20, True)
font_vs = get_font("impact", 40, True)
font_vs_large = get_font("impact", 54, True)
font_badge = get_font("arialbd", 22, True)

def add_drop_shadow(img, offset=(0, 15), blur=28, color=(0, 0, 0, 200)):
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

# ==============================================================================
# CONCEPT 1: CYBER NEON STADIUM CLASH
# ==============================================================================
def render_concept_1():
    bg = Image.open(os.path.join(assets_dir, "bg_concept1.png")).convert("RGBA")
    draw = ImageDraw.Draw(bg)
    
    # 1. Header: DSG Liga Logo at top
    dsg_w, dsg_h = 220, int(logo_dsg.height * (220 / logo_dsg.width))
    dsg_resized = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    bg.paste(dsg_resized, ((W - dsg_w)//2, 45), dsg_resized)
    
    # Matchday Neon Text
    pill_text = "MATCHDAY"
    bbox = font_title_impact_large.getbbox(pill_text)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw)//2, 135), pill_text, fill=(255, 255, 255), font=font_title_impact_large)
    
    # Glowing underline
    draw.line([(W//2 - 180, 240), (W//2 + 180, 240)], fill=(0, 220, 255, 220), width=3)
    
    # Subtitle pill
    sub_pill = "OFFIZIELLER SPIELTAG"
    sp_box = font_badge.getbbox(sub_pill)
    sp_w = sp_box[2] - sp_box[0]
    draw.rounded_rectangle([(W - sp_w)//2 - 16, 255, (W + sp_w)//2 + 16, 285], radius=6, fill=(0, 220, 255, 30), outline=(0, 220, 255, 180), width=1)
    draw.text(((W - sp_w)//2, 259), sub_pill, fill=(0, 220, 255), font=font_badge)
    
    # 2. Team Crests
    crest_size = 270
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    # Glow discs behind crests
    glow_disc = Image.new("RGBA", (W, H), (0,0,0,0))
    gdraw = ImageDraw.Draw(glow_disc)
    gdraw.ellipse([120, 340, 420, 640], fill=(0, 210, 255, 75))
    gdraw.ellipse([660, 340, 960, 640], fill=(255, 140, 0, 75))
    glow_disc = glow_disc.filter(ImageFilter.GaussianBlur(40))
    bg = Image.alpha_composite(bg, glow_disc)
    
    # Paste Crests
    bg.paste(c1, (135, 350), c1)
    bg.paste(c2, (675, 350), c2)
    
    # Center VS Badge
    vs_layer = Image.new("RGBA", (W, H), (0,0,0,0))
    vdraw = ImageDraw.Draw(vs_layer)
    vdraw.ellipse([W//2 - 45, 450, W//2 + 45, 540], fill=(12, 18, 32, 250), outline=(0, 220, 255, 255), width=3)
    vs_text = "VS"
    v_bbox = font_vs.getbbox(vs_text)
    vw = v_bbox[2] - v_bbox[0]
    vdraw.text(((W - vw)//2, 470), vs_text, fill=(255, 255, 255), font=font_vs)
    bg = Image.alpha_composite(bg, vs_layer)
    
    draw = ImageDraw.Draw(bg)
    # Team Names
    t1 = "FC GORNJAK"
    t1_box = font_team.getbbox(t1)
    t1_w = t1_box[2] - t1_box[0]
    draw.text((135 + (crest_size - t1_w)//2, 645), t1, fill=(255, 255, 255), font=font_team)
    h_pill = "HEIM"
    hp_box = font_badge.getbbox(h_pill)
    draw.rounded_rectangle([135 + (crest_size - 80)//2, 692, 135 + (crest_size + 80)//2, 720], radius=6, fill=(0, 200, 255, 40), outline=(0, 200, 255, 180), width=1)
    draw.text((135 + (crest_size - (hp_box[2]-hp_box[0]))//2, 696), h_pill, fill=(0, 220, 255), font=font_badge)
    
    t2 = "UNION HEILIGENBERG"
    t2_box = font_team_small.getbbox(t2)
    t2_w = t2_box[2] - t2_box[0]
    draw.text((675 + (crest_size - t2_w)//2, 647), t2, fill=(255, 255, 255), font=font_team_small)
    a_pill = "GAST"
    ap_box = font_badge.getbbox(a_pill)
    draw.rounded_rectangle([675 + (crest_size - 80)//2, 692, 675 + (crest_size + 80)//2, 720], radius=6, fill=(255, 140, 0, 40), outline=(255, 140, 0, 180), width=1)
    draw.text((675 + (crest_size - (ap_box[2]-ap_box[0]))//2, 696), a_pill, fill=(255, 160, 50), font=font_badge)
    
    # 3. Match Details Glass Container
    card = Image.new("RGBA", (W, H), (0,0,0,0))
    cdraw = ImageDraw.Draw(card)
    card_rect = [100, 770, W - 100, 990]
    cdraw.rounded_rectangle(card_rect, radius=22, fill=(12, 18, 35, 235), outline=(0, 200, 255, 140), width=2)
    
    # Glowing divider inside card
    cdraw.line([(W//2, 795), (W//2, 965)], fill=(0, 200, 255, 70), width=2)
    
    # Left: Date
    cdraw.text((140, 805), "DATUM & SPIELTAG", fill=(0, 220, 255), font=font_badge)
    cdraw.text((140, 845), "SA 03.10.2026", fill=(255, 255, 255), font=font_sub)
    cdraw.text((140, 905), "HEIMSPIEL GORNJAK", fill=(160, 180, 210), font=font_pill_small)
    cdraw.text((140, 935), "DSG MEISTERSCHAFT", fill=(110, 130, 160), font=font_pill_small)
    
    # Right: Kickoff
    cdraw.text((W//2 + 40, 805), "ANSTOSSZEIT", fill=(255, 160, 50), font=font_badge)
    cdraw.text((W//2 + 40, 845), "16:00 UHR", fill=(255, 255, 255), font=font_sub)
    cdraw.text((W//2 + 40, 905), "SPORTPLATZ", fill=(160, 180, 210), font=font_pill_small)
    cdraw.text((W//2 + 40, 935), "LIVE VOR ORT", fill=(110, 130, 160), font=font_pill_small)
    
    bg = Image.alpha_composite(bg, card)
    
    out_path = os.path.join(output_dir, "Concept_1_Cyber_Neon.png")
    bg.save(out_path, "PNG")
    print("Concept 1 generated:", out_path)

# ==============================================================================
# CONCEPT 2: SWISS MINIMALIST EDITORIAL LUXURY
# ==============================================================================
def render_concept_2():
    bg = Image.open(os.path.join(assets_dir, "bg_concept2.png")).convert("RGBA")
    draw = ImageDraw.Draw(bg)
    
    # Watermark background MATCHDAY
    wm = Image.new("RGBA", (W, H), (0,0,0,0))
    wdraw = ImageDraw.Draw(wm)
    w_font = get_font("arialbd", 130, True)
    w_text = "MATCHDAY"
    wbox = w_font.getbbox(w_text)
    ww = wbox[2] - wbox[0]
    wdraw.text(((W - ww)//2, 260), w_text, fill=(255, 255, 255, 10), font=w_font)
    bg = Image.alpha_composite(bg, wm)
    draw = ImageDraw.Draw(bg)
    
    # 1. Header Top Editorial
    margin = 75
    draw.text((margin, 85), "DSG LIGA", fill=(212, 175, 55), font=font_badge)
    draw.text((margin, 115), "OFFIZIELLER SPIELTAG", fill=(150, 155, 165), font=font_pill_small)
    
    # Top Right Date Stamp
    date_stamp = "03 / 10 / 2026"
    ds_box = font_badge.getbbox(date_stamp)
    draw.text((W - margin - (ds_box[2]-ds_box[0]), 85), date_stamp, fill=(255, 255, 255), font=font_badge)
    
    kick_stamp = "ANSTOSS 16:00"
    ks_box = font_pill_small.getbbox(kick_stamp)
    draw.text((W - margin - (ks_box[2]-ks_box[0]), 115), kick_stamp, fill=(150, 155, 165), font=font_pill_small)
    
    # Thin top divider
    draw.line([(margin, 155), (W - margin, 155)], fill=(255, 255, 255, 40), width=1)
    
    # Main Header
    draw.text((margin, 180), "NEXT FIXTURE", fill=(255, 255, 255), font=font_title_bold)
    
    # 2. Match Card Grid (Two Columns)
    card_gap = 30
    card_w = (W - margin*2 - card_gap) // 2
    
    # Cards
    card1 = Image.new("RGBA", (W, H), (0,0,0,0))
    c1draw = ImageDraw.Draw(card1)
    c1_rect = [margin, 280, margin + card_w, 740]
    c1draw.rounded_rectangle(c1_rect, radius=14, fill=(22, 26, 34, 215), outline=(255, 255, 255, 25), width=1)
    
    c2_rect = [W - margin - card_w, 280, W - margin, 740]
    c1draw.rounded_rectangle(c2_rect, radius=14, fill=(22, 26, 34, 215), outline=(255, 255, 255, 25), width=1)
    bg = Image.alpha_composite(bg, card1)
    
    # Paste Logos
    crest_size = 230
    c1_img = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2_img = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    bg.paste(c1_img, (margin + (card_w - crest_size)//2, 315), c1_img)
    bg.paste(c2_img, (W - margin - card_w + (card_w - crest_size)//2, 315), c2_img)
    
    # Text on cards
    draw = ImageDraw.Draw(bg)
    
    # Home Team
    draw.text((margin + 25, 575), "HOME TEAM", fill=(212, 175, 55), font=font_pill_small)
    draw.text((margin + 25, 605), "FC GORNJAK", fill=(255, 255, 255), font=font_team)
    draw.line([(margin + 25, 660), (margin + card_w - 25, 660)], fill=(255, 255, 255, 25), width=1)
    draw.text((margin + 25, 680), "DSG MEISTERSCHAFT", fill=(140, 145, 155), font=font_pill_small)
    
    # Away Team
    draw.text((W - margin - card_w + 25, 575), "AWAY TEAM", fill=(140, 145, 155), font=font_pill_small)
    draw.text((W - margin - card_w + 25, 605), "U. HEILIGENBERG", fill=(255, 255, 255), font=font_team_small)
    draw.line([(W - margin - card_w + 25, 660), (W - margin - 25, 660)], fill=(255, 255, 255, 25), width=1)
    draw.text((W - margin - card_w + 25, 680), "DSG MEISTERSCHAFT", fill=(140, 145, 155), font=font_pill_small)
    
    # Center VS Badge
    draw.ellipse([W//2 - 32, 485, W//2 + 32, 549], fill=(15, 17, 21), outline=(212, 175, 55), width=2)
    vbox = font_badge.getbbox("VS")
    draw.text((W//2 - (vbox[2]-vbox[0])//2, 505), "VS", fill=(212, 175, 55), font=font_badge)
    
    # 3. Bottom Editorial Footer
    footer_rect = [margin, 770, W - margin, 990]
    draw.rounded_rectangle(footer_rect, radius=14, fill=(18, 22, 28, 245), outline=(212, 175, 55, 120), width=1)
    
    # Footer content
    draw.text((margin + 35, 805), "MATCH INFORMATION", fill=(212, 175, 55), font=font_pill_small)
    draw.text((margin + 35, 840), "SAMSTAG, 03. OKTOBER 2026", fill=(255, 255, 255), font=font_sub)
    draw.text((margin + 35, 895), "ANPFIFF 16:00 UHR • SPORTPLATZ", fill=(180, 185, 195), font=font_pill)
    draw.text((margin + 35, 935), "DIÖZESANSPORTGEMEINSCHAFT OÖ", fill=(130, 135, 145), font=font_pill_small)
    
    # DSG Liga Mini Logo on bottom right
    dsg_w = 170
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    bg.paste(dsg_mini, (W - margin - dsg_w - 30, 870), dsg_mini)
    
    out_path = os.path.join(output_dir, "Concept_2_Swiss_Minimalist.png")
    bg.save(out_path, "PNG")
    print("Concept 2 generated:", out_path)

# ==============================================================================
# CONCEPT 3: DYNAMIC DIAGONAL DUEL SPLIT
# ==============================================================================
def render_concept_3():
    bg = Image.open(os.path.join(assets_dir, "bg_concept3.png")).convert("RGBA")
    draw = ImageDraw.Draw(bg)
    
    # 1. Top League Logo & Title
    dsg_w = 200
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    bg.paste(dsg_mini, ((W - dsg_w)//2, 35), dsg_mini)
    
    # Big Kinetic GAME DAY Title
    h_text = "MATCHDAY"
    hbox = font_title_impact_large.getbbox(h_text)
    hw = hbox[2] - hbox[0]
    draw.text(((W - hw)//2, 110), h_text, fill=(255, 255, 255), font=font_title_impact_large)
    
    # Accent Yellow Bar
    draw.rectangle([W//2 - 80, 220, W//2 + 80, 226], fill=(255, 215, 0))
    
    # Badges with 3D drop shadow
    crest_size = 280
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    sh1, off1 = add_drop_shadow(c1, offset=(0, 18), blur=32, color=(0,0,0,220))
    sh2, off2 = add_drop_shadow(c2, offset=(0, 18), blur=32, color=(0,0,0,220))
    
    bg.paste(sh1, (120 - off1[0], 280 - off1[1]), sh1)
    bg.paste(sh2, (680 - off2[0], 280 - off2[1]), sh2)
    
    # Center Big VS Disc
    disc = Image.new("RGBA", (W, H), (0,0,0,0))
    ddraw = ImageDraw.Draw(disc)
    ddraw.ellipse([W//2 - 55, 390, W//2 + 55, 500], fill=(255, 215, 0), outline=(255, 255, 255), width=3)
    vs_box = font_vs_large.getbbox("VS")
    vsw = vs_box[2] - vs_box[0]
    ddraw.text(((W - vsw)//2, 410), "VS", fill=(15, 20, 28), font=font_vs_large)
    bg = Image.alpha_composite(bg, disc)
    
    draw = ImageDraw.Draw(bg)
    
    # Team Names Angled Plates
    # Left Plate
    draw.polygon([(70, 600), (450, 600), (410, 670), (30, 670)], fill=(190, 25, 45, 240))
    draw.text((75, 615), "FC GORNJAK", fill=(255, 255, 255), font=font_team)
    
    # Right Plate
    draw.polygon([(630, 600), (1010, 600), (970, 670), (590, 670)], fill=(0, 140, 110, 240))
    draw.text((640, 615), "HEILIGENBERG", fill=(255, 255, 255), font=font_team)
    
    # Match Details Strip (Angled)
    strip = Image.new("RGBA", (W, H), (0,0,0,0))
    sdraw = ImageDraw.Draw(strip)
    sdraw.polygon([(0, 750), (W, 715), (W, 970), (0, 1005)], fill=(12, 16, 24, 245))
    sdraw.line([(0, 750), (W, 715)], fill=(255, 215, 0), width=4)
    sdraw.line([(0, 1005), (W, 970)], fill=(255, 215, 0), width=4)
    bg = Image.alpha_composite(bg, strip)
    
    draw = ImageDraw.Draw(bg)
    # Content inside strip
    dt_text = "SAMSTAG • 03. OKTOBER 2026"
    dt_box = font_sub.getbbox(dt_text)
    draw.text(((W - (dt_box[2]-dt_box[0]))//2, 765), dt_text, fill=(255, 255, 255), font=font_sub)
    
    time_badge = "ANPFIFF 16:00 UHR"
    tb_box = font_title_bold.getbbox(time_badge)
    draw.text(((W - (tb_box[2]-tb_box[0]))//2, 825), time_badge, fill=(255, 215, 0), font=font_title_bold)
    
    sub_info = "DSG LIGA MEISTERSCHAFT • HEIMSPIEL"
    si_box = font_pill_small.getbbox(sub_info)
    draw.text(((W - (si_box[2]-si_box[0]))//2, 920), sub_info, fill=(180, 195, 215), font=font_pill_small)
    
    out_path = os.path.join(output_dir, "Concept_3_Dynamic_Split.png")
    bg.save(out_path, "PNG")
    print("Concept 3 generated:", out_path)

# ==============================================================================
# CONCEPT 4: ATMOSPHERIC PITCH SPOTLIGHT (CINEMATIC)
# ==============================================================================
def render_concept_4():
    bg = Image.open(os.path.join(assets_dir, "bg_concept4.png")).convert("RGBA")
    draw = ImageDraw.Draw(bg)
    
    # 1. Top League Header
    dsg_w = 230
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    bg.paste(dsg_mini, ((W - dsg_w)//2, 40), dsg_mini)
    
    # Matchday Golden Subtitle
    m_text = "M A T C H D A Y"
    mbox = font_sub.getbbox(m_text)
    draw.text(((W - (mbox[2]-mbox[0]))//2, 145), m_text, fill=(255, 215, 0), font=font_sub)
    draw.line([(W//2 - 120, 190), (W//2 + 120, 190)], fill=(255, 215, 0, 160), width=2)
    
    # Spotlight Badges with Glass Pedestals
    crest_size = 280
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    # Glass Pedestals
    glass = Image.new("RGBA", (W, H), (0,0,0,0))
    gdraw = ImageDraw.Draw(glass)
    gdraw.ellipse([110, 560, 430, 630], fill=(255, 255, 255, 20), outline=(255, 255, 255, 80), width=2)
    gdraw.ellipse([650, 560, 970, 630], fill=(255, 255, 255, 20), outline=(255, 255, 255, 80), width=2)
    glass = glass.filter(ImageFilter.GaussianBlur(3))
    bg = Image.alpha_composite(bg, glass)
    
    # Paste Shields
    bg.paste(c1, (130, 260), c1)
    bg.paste(c2, (670, 260), c2)
    
    # 3D Golden VS Emblem
    vs_card = Image.new("RGBA", (W, H), (0,0,0,0))
    vdraw = ImageDraw.Draw(vs_card)
    vdraw.rounded_rectangle([W//2 - 40, 380, W//2 + 40, 460], radius=14, fill=(14, 20, 26, 245), outline=(255, 215, 0, 220), width=2)
    vs_box = font_vs.getbbox("VS")
    vdraw.text(((W - (vs_box[2]-vs_box[0]))//2, 395), "VS", fill=(255, 215, 0), font=font_vs)
    bg = Image.alpha_composite(bg, vs_card)
    
    draw = ImageDraw.Draw(bg)
    
    # Team Names
    t1 = "FC GORNJAK"
    t1_box = font_team.getbbox(t1)
    draw.text((130 + (crest_size - (t1_box[2]-t1_box[0]))//2, 650), t1, fill=(255, 255, 255), font=font_team)
    
    t2 = "UNION HEILIGENBERG"
    t2_box = font_team_small.getbbox(t2)
    draw.text((670 + (crest_size - (t2_box[2]-t2_box[0]))//2, 652), t2, fill=(255, 255, 255), font=font_team_small)
    
    # Broadcast Lower Third Card
    bcast = Image.new("RGBA", (W, H), (0,0,0,0))
    bdraw = ImageDraw.Draw(bcast)
    b_rect = [90, 760, W - 90, 980]
    bdraw.rounded_rectangle(b_rect, radius=20, fill=(10, 16, 22, 240), outline=(255, 255, 255, 45), width=1)
    
    # Top golden accent border
    bdraw.rounded_rectangle([90, 760, W - 90, 770], radius=4, fill=(255, 215, 0))
    
    # Time & Date
    b_date = "SAMSTAG • 03.10.2026"
    bd_box = font_badge.getbbox(b_date)
    bdraw.text(((W - (bd_box[2]-bd_box[0]))//2, 800), b_date, fill=(255, 215, 0), font=font_badge)
    
    b_time = "ANSTOSS 16:00 UHR"
    bt_box = font_title_bold.getbbox(b_time)
    bdraw.text(((W - (bt_box[2]-bt_box[0]))//2, 840), b_time, fill=(255, 255, 255), font=font_title_bold)
    
    b_loc = "SPORTPLATZ • OFFIZIELLES LIGASPIEL"
    bl_box = font_pill_small.getbbox(b_loc)
    bdraw.text(((W - (bl_box[2]-bl_box[0]))//2, 925), b_loc, fill=(150, 175, 195), font=font_pill_small)
    
    bg = Image.alpha_composite(bg, bcast)
    
    out_path = os.path.join(output_dir, "Concept_4_Atmospheric_Stadium.png")
    bg.save(out_path, "PNG")
    print("Concept 4 generated:", out_path)

# ==============================================================================
# CONCEPT 5: URBAN STREET POSTER (GRUNGE & STENCIL)
# ==============================================================================
def render_concept_5():
    bg = Image.open(os.path.join(assets_dir, "bg_concept5.png")).convert("RGBA")
    draw = ImageDraw.Draw(bg)
    
    # Street Stencil Header
    h1 = "MATCHDAY"
    h1_box = font_title_impact_large.getbbox(h1)
    draw.text(((W - (h1_box[2]-h1_box[0]))//2, 45), h1, fill=(255, 255, 255), font=font_title_impact_large)
    
    # Yellow tape label
    tape = Image.new("RGBA", (W, H), (0,0,0,0))
    tdraw = ImageDraw.Draw(tape)
    tdraw.polygon([(W//2 - 180, 155), (W//2 + 180, 145), (W//2 + 175, 190), (W//2 - 185, 200)], fill=(255, 215, 0))
    t_text = "DSG LIGA MEISTERSCHAFT"
    t_box = font_badge.getbbox(t_text)
    tdraw.text(((W - (t_box[2]-t_box[0]))//2, 163), t_text, fill=(0, 0, 0), font=font_badge)
    bg = Image.alpha_composite(bg, tape)
    
    # Shields with heavy drop shadow
    crest_size = 270
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    sh1, off1 = add_drop_shadow(c1, offset=(0, 16), blur=30, color=(0,0,0,220))
    sh2, off2 = add_drop_shadow(c2, offset=(0, 16), blur=30, color=(0,0,0,220))
    
    bg.paste(sh1, (130 - off1[0], 260 - off1[1]), sh1)
    bg.paste(sh2, (680 - off2[0], 260 - off2[1]), sh2)
    
    # Center Big Industrial VS Box
    vs_box = Image.new("RGBA", (W, H), (0,0,0,0))
    vdraw = ImageDraw.Draw(vs_box)
    vdraw.rectangle([W//2 - 45, 360, W//2 + 45, 450], fill=(255, 215, 0), outline=(0,0,0), width=3)
    v_text = "VS"
    vb = font_title_impact.getbbox(v_text)
    vdraw.text(((W - (vb[2]-vb[0]))//2, 365), v_text, fill=(0,0,0), font=font_title_impact)
    bg = Image.alpha_composite(bg, vs_box)
    
    draw = ImageDraw.Draw(bg)
    
    # Team Names Stencil
    draw.text((130, 560), "FC GORNJAK", fill=(255, 255, 255), font=font_team)
    draw.text((130, 600), "[ HOME SQUAD ]", fill=(255, 215, 0), font=font_pill_small)
    
    draw.text((660, 560), "HEILIGENBERG", fill=(255, 255, 255), font=font_team)
    draw.text((660, 600), "[ AWAY SQUAD ]", fill=(180, 180, 180), font=font_pill_small)
    
    # Match Ticket / Pass Box (Bottom)
    ticket = Image.new("RGBA", (W, H), (0,0,0,0))
    tkdraw = ImageDraw.Draw(ticket)
    
    tk_rect = [80, 680, W - 80, 980]
    tkdraw.rounded_rectangle(tk_rect, radius=12, fill=(245, 245, 245), outline=(255, 215, 0), width=3)
    
    # Barcode simulated lines on left
    for bx in range(110, 210, 5):
        w = 2 if bx % 10 == 0 else 3
        tkdraw.line([(bx, 715), (bx, 945)], fill=(20, 20, 20), width=w)
        
    # Ticket divider line
    tkdraw.line([(235, 705), (235, 955)], fill=(190, 190, 190), width=2)
    
    # Ticket details
    tkdraw.text((260, 715), "OFFICIAL MATCHDAY PASS", fill=(100, 100, 100), font=font_badge)
    tkdraw.text((260, 755), "SAMSTAG, 03.10.2026", fill=(15, 15, 15), font=font_sub)
    tkdraw.text((260, 810), "ANPFIFF 16:00 UHR", fill=(220, 30, 60), font=font_title_bold)
    tkdraw.text((260, 905), "FC GORNJAK vs UNION HEILIGENBERG • DSG LIGA", fill=(60, 60, 60), font=font_pill_small)
    
    # DSG Mini Logo in bottom ticket corner
    dsg_w = 140
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    ticket.paste(dsg_mini, (W - 80 - dsg_w - 20, 715), dsg_mini)
    
    bg = Image.alpha_composite(bg, ticket)
    
    out_path = os.path.join(output_dir, "Concept_5_Urban_Street.png")
    bg.save(out_path, "PNG")
    print("Concept 5 generated:", out_path)

if __name__ == "__main__":
    render_concept_1()
    render_concept_2()
    render_concept_3()
    render_concept_4()
    render_concept_5()
    print("All 5 refined matchday concepts rendered successfully!")
