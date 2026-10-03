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

font_title_impact = get_font("impact", 86, True)
font_team_impact = get_font("impact", 40, True) # Uniform athletic impact size
font_title_bold = get_font("arialbd", 54, True)
font_sub = get_font("arialbd", 28, True)
font_vs_impact = get_font("impact", 68, True)
font_pill_small = get_font("arialbd", 22, True)

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

def create_hollow_text_image(text, font, color, stroke_w=2):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0] + stroke_w * 4 + 40
    th = bbox[3] - bbox[1] + stroke_w * 4 + 40
    
    outer = Image.new("L", (tw, th), 0)
    odraw = ImageDraw.Draw(outer)
    odraw.text((20 + stroke_w, 20 + stroke_w), text, fill=255, font=font)
    
    dilated = outer.filter(ImageFilter.MaxFilter(stroke_w * 2 + 1))
    
    arr_d = np.array(dilated, dtype=np.int16)
    arr_o = np.array(outer, dtype=np.int16)
    stroke_mask = np.clip(arr_d - arr_o, 0, 255).astype(np.uint8)
    
    stroke_img = Image.fromarray(stroke_mask, mode="L")
    res = Image.new("RGBA", (tw, th), color[:3] + (0,))
    r, g, b, a = res.split()
    alpha = stroke_img.point(lambda p: int(p * (color[3] / 255.0)))
    res.putalpha(alpha)
    return res, (bbox[2] - bbox[0], bbox[3] - bbox[1])

def render_no_ribbon_wallpaper(style="kinetic_echoes", filename="Matchday_NoRibbon_KineticTeams.png"):
    img = Image.new("RGBA", (W, H), (12, 14, 18, 255))
    draw = ImageDraw.Draw(img)
    
    # 1. Dynamic Split Canvas
    left_poly = [(0, 0), (int(W*0.62), 0), (int(W*0.38), H), (0, H)]
    draw.polygon(left_poly, fill=(58, 16, 26, 255)) # Gornjak Burgundy
    
    right_poly = [(int(W*0.62), 0), (W, 0), (W, H), (int(W*0.38), H)]
    draw.polygon(right_poly, fill=(130, 80, 10, 255)) # Heiligenberg Gold
    
    # Shading gradients
    shading = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shading)
    sdraw.ellipse([40, 200, 480, 680], fill=(160, 25, 45, 65))
    sdraw.ellipse([580, 180, 1040, 680], fill=(255, 175, 15, 95))
    sdraw.rectangle([0, 0, W, 240], fill=(0, 0, 0, 85))
    shading = shading.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, shading)
    
    # Speed streaks
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
    
    # Center beam (with DSG Green glow accent)
    beam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(beam)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(0, 200, 83, 200), width=8)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(255, 255, 255, 255), width=2)
    beam = beam.filter(ImageFilter.GaussianBlur(6))
    img = Image.alpha_composite(img, beam)
    
    flare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare)
    fdraw.ellipse([W//2 - 160, 370, W//2 + 160, 540], fill=(0, 200, 83, 40))
    flare = flare.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, flare)
    
    # 2. DSG Liga Mini Logo Top
    dsg_w = 170
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    img.paste(dsg_mini, ((W - dsg_w)//2, 22), dsg_mini)
    
    # =========================================================================
    # 3. KINETIC REPEATED OUTLINE "MATCHDAY" EFFECT
    # =========================================================================
    kinetic_layer = Image.new("RGBA", (W, 360), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(kinetic_layer)
    
    text = "MATCHDAY"
    font = font_title_impact
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    
    cx = (W - tw) // 2
    base_cy = 138
    step_y = 36
    
    fill_main = (255, 255, 255, 255)
    outline_c1 = (0, 200, 83, 220)      # DSG Green Accent
    outline_c2 = (77, 255, 145, 110)    # Green highlight
    
    # Top outlines
    h_top2, _ = create_hollow_text_image(text, font, outline_c2, stroke_w=2)
    kinetic_layer.paste(h_top2, (cx - 22, base_cy - step_y * 2 - 22), h_top2)
    
    h_top1, _ = create_hollow_text_image(text, font, outline_c1, stroke_w=2)
    kinetic_layer.paste(h_top1, (cx - 22, base_cy - step_y - 22), h_top1)
    
    # Bottom outlines
    h_bot1, _ = create_hollow_text_image(text, font, outline_c1, stroke_w=2)
    kinetic_layer.paste(h_bot1, (cx - 22, base_cy + step_y - 22), h_bot1)
    
    h_bot2, _ = create_hollow_text_image(text, font, outline_c2, stroke_w=2)
    kinetic_layer.paste(h_bot2, (cx - 22, base_cy + step_y * 2 - 22), h_bot2)
    
    # Center Hero Solid Text
    kdraw.text((cx + 2, base_cy + 2), text, fill=(10, 0, 2, 240), font=font)
    kdraw.text((cx, base_cy), text, fill=fill_main, font=font)
    
    # Athletic shear (~ -8 degrees)
    sheared_kinetic = kinetic_layer.transform((W, 360), Image.AFFINE, (1, 0.12, -15, 0, 1, 0), resample=Image.BICUBIC)
    img.paste(sheared_kinetic, (0, 42), sheared_kinetic)
    
    # 4. Shields
    crest_size = 280
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    sh1, off1 = add_drop_shadow(c1, offset=(0, 18), blur=32, color=(0,0,0,230))
    sh2, off2 = add_drop_shadow(c2, offset=(0, 18), blur=32, color=(0,0,0,230))
    
    crest1_x = 115
    crest1_y = 280
    crest2_x = 680
    crest2_y = 280
    
    img.paste(sh1, (crest1_x - off1[0], crest1_y - off1[1]), sh1)
    img.paste(sh2, (crest2_x - off2[0], crest2_y - off2[1]), sh2)
    
    # =========================================================================
    # 5. KINETIC REPEATED OUTLINE "VS" EFFECT (No Backdrop/Shadow)
    # =========================================================================
    vs_canvas = Image.new("RGBA", (260, 260), (0, 0, 0, 0))
    vsc_draw = ImageDraw.Draw(vs_canvas)
    
    vs_text = "VS"
    vs_font = font_vs_impact
    vs_bbox = vs_font.getbbox(vs_text)
    vsw = vs_bbox[2] - vs_bbox[0]
    vsh = vs_bbox[3] - vs_bbox[1]
    
    vcx = (260 - vsw) // 2
    vcy = (260 - vsh) // 2
    vs_step_y = 26
    
    # VS Outlines
    vs_top2, _ = create_hollow_text_image(vs_text, vs_font, (0, 200, 83, 90), stroke_w=2)
    vs_canvas.paste(vs_top2, (vcx - 22, vcy - vs_step_y * 2 - 22), vs_top2)
    
    vs_top1, _ = create_hollow_text_image(vs_text, vs_font, (77, 255, 145, 180), stroke_w=2)
    vs_canvas.paste(vs_top1, (vcx - 22, vcy - vs_step_y - 22), vs_top1)
    
    vs_bot1, _ = create_hollow_text_image(vs_text, vs_font, (77, 255, 145, 180), stroke_w=2)
    vs_canvas.paste(vs_bot1, (vcx - 22, vcy + vs_step_y - 22), vs_bot1)
    
    vs_bot2, _ = create_hollow_text_image(vs_text, vs_font, (0, 200, 83, 90), stroke_w=2)
    vs_canvas.paste(vs_bot2, (vcx - 22, vcy + vs_step_y * 2 - 22), vs_bot2)
    
    # Center Solid VS
    vsc_draw.text((vcx, vcy), vs_text, fill=(255, 255, 255, 255), font=vs_font)
    
    # Apply matching athletic shear
    sheared_vs = vs_canvas.transform((260, 260), Image.AFFINE, (1, 0.12, -10, 0, 1, 0), resample=Image.BICUBIC)
    img.paste(sheared_vs, ((W - 260)//2, 305), sheared_vs)
    
    # =========================================================================
    # 6. FLOATING TEAM NAMES (NO RIBBON!) - KINETIC / ATHLETIC STYLING
    # =========================================================================
    # Left Team Center X: crest1_x + crest_size//2 = 115 + 140 = 255
    # Right Team Center X: crest2_x + crest_size//2 = 680 + 140 = 820
    team_center_y = 620
    
    t1_text = "FC GORNJAK"
    t2_text = "UNION HEILIGENBERG"
    
    t_font = font_team_impact
    
    if style == "kinetic_echoes":
        # Each team name gets a kinetic outline echo layer above and below!
        team_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        
        # Left Team: FC GORNJAK
        t1_canvas = Image.new("RGBA", (480, 160), (0, 0, 0, 0))
        t1_draw = ImageDraw.Draw(t1_canvas)
        t1_box = t_font.getbbox(t1_text)
        t1_w = t1_box[2] - t1_box[0]
        t1_h = t1_box[3] - t1_box[1]
        t1_cx = (480 - t1_w) // 2
        t1_cy = (160 - t1_h) // 2
        
        # Outline Echo (Crimson/White)
        t1_echo_top, _ = create_hollow_text_image(t1_text, t_font, (255, 100, 120, 140), stroke_w=2)
        t1_canvas.paste(t1_echo_top, (t1_cx - 22, t1_cy - 18 - 22), t1_echo_top)
        
        t1_echo_bot, _ = create_hollow_text_image(t1_text, t_font, (255, 100, 120, 140), stroke_w=2)
        t1_canvas.paste(t1_echo_bot, (t1_cx - 22, t1_cy + 18 - 22), t1_echo_bot)
        
        t1_draw.text((t1_cx + 2, t1_cy + 2), t1_text, fill=(15, 2, 5, 240), font=t_font)
        t1_draw.text((t1_cx, t1_cy), t1_text, fill=(255, 255, 255, 255), font=t_font)
        
        sheared_t1 = t1_canvas.transform((480, 160), Image.AFFINE, (1, 0.10, -5, 0, 1, 0), resample=Image.BICUBIC)
        team_layer.paste(sheared_t1, (15, team_center_y - 80), sheared_t1)
        
        # Right Team: UNION HEILIGENBERG
        t2_canvas = Image.new("RGBA", (520, 160), (0, 0, 0, 0))
        t2_draw = ImageDraw.Draw(t2_canvas)
        t2_box = t_font.getbbox(t2_text)
        t2_w = t2_box[2] - t2_box[0]
        t2_h = t2_box[3] - t2_box[1]
        t2_cx = (520 - t2_w) // 2
        t2_cy = (160 - t2_h) // 2
        
        # Outline Echo (Gold/Yellow)
        t2_echo_top, _ = create_hollow_text_image(t2_text, t_font, (255, 220, 80, 160), stroke_w=2)
        t2_canvas.paste(t2_echo_top, (t2_cx - 22, t2_cy - 18 - 22), t2_echo_top)
        
        t2_echo_bot, _ = create_hollow_text_image(t2_text, t_font, (255, 220, 80, 160), stroke_w=2)
        t2_canvas.paste(t2_echo_bot, (t2_cx - 22, t2_cy + 18 - 22), t2_echo_bot)
        
        t2_draw.text((t2_cx + 2, t2_cy + 2), t2_text, fill=(25, 15, 2, 240), font=t_font)
        t2_draw.text((t2_cx, t2_cy), t2_text, fill=(255, 255, 255, 255), font=t_font)
        
        sheared_t2 = t2_canvas.transform((520, 160), Image.AFFINE, (1, 0.10, -5, 0, 1, 0), resample=Image.BICUBIC)
        team_layer.paste(sheared_t2, (550, team_center_y - 80), sheared_t2)
        
        img = Image.alpha_composite(img, team_layer)
        
    else:
        # Clean Floating 3D Athletic Typography with sharp contrast outline
        team_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        tdraw = ImageDraw.Draw(team_layer)
        
        # Left
        t1_box = t_font.getbbox(t1_text)
        t1_w = t1_box[2] - t1_box[0]
        c1_x = 255
        for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (2, 2), (3, 3)]:
            tdraw.text((c1_x - t1_w//2 + dx, team_center_y - 20 + dy), t1_text, fill=(10, 2, 4, 255), font=t_font)
        tdraw.text((c1_x - t1_w//2, team_center_y - 20), t1_text, fill=(255, 255, 255), font=t_font)
        
        # Right
        t2_box = t_font.getbbox(t2_text)
        t2_w = t2_box[2] - t2_box[0]
        c2_x = 820
        for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (2, 2), (3, 3)]:
            tdraw.text((c2_x - t2_w//2 + dx, team_center_y - 20 + dy), t2_text, fill=(20, 12, 2, 255), font=t_font)
        tdraw.text((c2_x - t2_w//2, team_center_y - 20), t2_text, fill=(255, 255, 255), font=t_font)
        
        img = Image.alpha_composite(img, team_layer)
    
    # =========================================================================
    # 7. Match Details Section with DSG Green accents & Inclined Background
    # =========================================================================
    banner_angle = math.degrees(math.atan2(-35, 1080))
    
    banner_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bndraw = ImageDraw.Draw(banner_layer)
    bndraw.polygon([(0, 750), (W, 715), (W, 975), (0, 1010)], fill=(10, 14, 20, 245))
    bndraw.line([(0, 750), (W, 715)], fill=(0, 200, 83), width=4)
    bndraw.line([(0, 1010), (W, 975)], fill=(0, 200, 83), width=4)
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
    tcdraw.text(((W - tm_w)//2, 75), time_str, fill=(0, 230, 90), font=font_title_bold)
    
    loc_box = font_pill_small.getbbox(location_str)
    loc_w = loc_box[2] - loc_box[0]
    tcdraw.text(((W - loc_w)//2, 160), location_str, fill=(185, 200, 220), font=font_pill_small)
    
    rotated_text = text_canvas.rotate(banner_angle, resample=Image.Resampling.BICUBIC, expand=False)
    img.paste(rotated_text, (0, 735), rotated_text)
    
    out_file = os.path.join(output_dir, filename)
    img.save(out_file, "PNG")
    
    # Save as default Final concept too
    c_final = os.path.join(output_dir, "Concept_Dynamic_Split_Final.png")
    img.save(c_final, "PNG")
    
    web_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos\Matchday_Wallpapers"
    os.makedirs(web_dir, exist_ok=True)
    img.save(os.path.join(web_dir, filename), "PNG")
    img.save(os.path.join(web_dir, "Concept_Dynamic_Split_Final.png"), "PNG")
    
    print("Rendered No-Ribbon Wallpaper:", out_file)
    return out_file

if __name__ == "__main__":
    render_no_ribbon_wallpaper(style="kinetic_echoes", filename="Matchday_NoRibbon_KineticTeams.png")
    render_no_ribbon_wallpaper(style="clean_floating", filename="Matchday_NoRibbon_CleanFloating.png")
