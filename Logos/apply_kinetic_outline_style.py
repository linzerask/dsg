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

font_title_impact = get_font("impact", 80, True)
font_team_impact = get_font("impact", 38, True)
font_title_bold = get_font("arialbd", 54, True)
font_sub = get_font("arialbd", 28, True)
font_vs = get_font("impact", 58, True)
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

def draw_outlined_text(draw_ctx, x, y, text, font, fill_outline, stroke_width=2):
    # Draw hollow outline by stroking 8 directions
    for dx in range(-stroke_width, stroke_width + 1):
        for dy in range(-stroke_width, stroke_width + 1):
            if dx == 0 and dy == 0:
                continue
            if abs(dx) + abs(dy) <= stroke_width * 1.5:
                draw_ctx.text((x + dx, y + dy), text, fill=fill_outline, font=font)
    # Clear inner with transparent if needed, or we draw outline on fresh transparent layer
    # Better: draw silhouette and cut out center!

def create_hollow_text_image(text, font, color, stroke_w=2):
    # Calculate bounds
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0] + stroke_w * 4 + 20
    th = bbox[3] - bbox[1] + stroke_w * 4 + 20
    
    # Outer mask
    outer = Image.new("L", (tw, th), 0)
    odraw = ImageDraw.Draw(outer)
    odraw.text((10 + stroke_w, 10 + stroke_w), text, fill=255, font=font)
    
    # Dilate outer to get stroke
    dilated = outer.filter(ImageFilter.MaxFilter(stroke_w * 2 + 1))
    
    # Hollow stroke = dilated - outer
    arr_d = np.array(dilated, dtype=np.int16)
    arr_o = np.array(outer, dtype=np.int16)
    stroke_mask = np.clip(arr_d - arr_o, 0, 255).astype(np.uint8)
    
    stroke_img = Image.fromarray(stroke_mask, mode="L")
    
    # Create colored result
    res = Image.new("RGBA", (tw, th), color[:3] + (0,))
    # Apply alpha
    r, g, b, a = res.split()
    alpha = stroke_img.point(lambda p: int(p * (color[3] / 255.0)))
    res.putalpha(alpha)
    return res, (bbox[2] - bbox[0], bbox[3] - bbox[1])

def build_kinetic_matchday():
    img = Image.new("RGBA", (W, H), (12, 14, 18, 255))
    draw = ImageDraw.Draw(img)
    
    # 1. Dynamic Split Canvas
    left_poly = [(0, 0), (int(W*0.62), 0), (int(W*0.38), H), (0, H)]
    draw.polygon(left_poly, fill=(58, 16, 26, 255))
    
    right_poly = [(int(W*0.62), 0), (W, 0), (W, H), (int(W*0.38), H)]
    draw.polygon(right_poly, fill=(130, 80, 10, 255))
    
    # Shading gradients
    shading = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shading)
    sdraw.ellipse([40, 200, 480, 680], fill=(160, 25, 45, 65))
    sdraw.ellipse([580, 180, 1040, 680], fill=(255, 175, 15, 95))
    sdraw.rectangle([0, 0, W, 220], fill=(0, 0, 0, 75))
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
    
    # Center beam
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
    
    # 2. DSG Liga Mini Logo Top
    dsg_w = 170
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    img.paste(dsg_mini, ((W - dsg_w)//2, 25), dsg_mini)
    
    # =========================================================================
    # 3. KINETIC REPEATED OUTLINE "MATCHDAY" EFFECT (From User's Reference!)
    # =========================================================================
    # Create kinetic stack canvas
    kinetic_layer = Image.new("RGBA", (W, 350), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(kinetic_layer)
    
    text = "MATCHDAY"
    font = font_title_impact
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    cx = (W - tw) // 2
    base_cy = 135 # Center main text Y
    
    step_y = 38 # Tight vertical stack offset
    
    # Top Outline Echo 2 (Topmost, subtle)
    h_top2, _ = create_hollow_text_image(text, font, (255, 255, 255, 70), stroke_w=1)
    kinetic_layer.paste(h_top2, (cx - 12, base_cy - step_y * 2 - 12), h_top2)
    
    # Top Outline Echo 1 (Upper, brighter)
    h_top1, _ = create_hollow_text_image(text, font, (255, 220, 100, 160), stroke_w=2)
    kinetic_layer.paste(h_top1, (cx - 12, base_cy - step_y - 12), h_top1)
    
    # Bottom Outline Echo 1 (Lower, brighter)
    h_bot1, _ = create_hollow_text_image(text, font, (255, 220, 100, 160), stroke_w=2)
    kinetic_layer.paste(h_bot1, (cx - 12, base_cy + step_y - 12), h_bot1)
    
    # Bottom Outline Echo 2 (Bottommost, subtle)
    h_bot2, _ = create_hollow_text_image(text, font, (255, 255, 255, 70), stroke_w=1)
    kinetic_layer.paste(h_bot2, (cx - 12, base_cy + step_y * 2 - 12), h_bot2)
    
    # CENTER HERO SOLID TEXT (Bold Solid White / Red Glow with 3D drop shadow)
    # 3D shadow for center text
    kdraw.text((cx + 2, base_cy + 2), text, fill=(15, 2, 5, 240), font=font)
    kdraw.text((cx, base_cy), text, fill=(255, 255, 255, 255), font=font)
    
    # Optional dynamic athletic shear on the kinetic stack (approx -8 degrees)
    sheared_kinetic = kinetic_layer.transform((W, 350), Image.AFFINE, (1, 0.12, -15, 0, 1, 0), resample=Image.BICUBIC)
    
    img.paste(sheared_kinetic, (0, 45), sheared_kinetic)
    
    # 4. Shields (Positioned perfectly below kinetic header)
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
    
    # 5. Clean "VS" Typography (No Yellow Circle)
    vs_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vs_layer)
    vdraw.ellipse([W//2 - 45, 390, W//2 + 45, 480], fill=(10, 12, 16, 190))
    vs_layer = vs_layer.filter(ImageFilter.GaussianBlur(12))
    img = Image.alpha_composite(img, vs_layer)
    
    draw = ImageDraw.Draw(img)
    vs_text = "VS"
    vs_box = font_vs.getbbox(vs_text)
    vsw = vs_box[2] - vs_box[0]
    draw.text(((W - vsw)//2, 405), vs_text, fill=(255, 225, 80), font=font_vs)
    
    # 6. Team Ribbons with Clean Styled Typography
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
    
    # Team Names Typography (Pure 3D White High Contrast)
    text_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(text_layer)
    
    center_lx = (lx1 + lx2) // 2
    t1 = "FC GORNJAK"
    t1_box = font_team_impact.getbbox(t1)
    t1_w = t1_box[2] - t1_box[0]
    t1_h = t1_box[3] - t1_box[1]
    
    center_rx = (rx1 + rx2) // 2
    t2 = "UNION HEILIGENBERG"
    t2_box = font_team_impact.getbbox(t2)
    t2_w = t2_box[2] - t2_box[0]
    t2_h = t2_box[3] - t2_box[1]
    
    # Left (FC Gornjak)
    tdraw.text((center_lx - t1_w//2 + 2, ly_top + (70 - t1_h)//2 + 2), t1, fill=(20, 2, 5, 220), font=font_team_impact)
    tdraw.text((center_lx - t1_w//2, ly_top + (70 - t1_h)//2 - 2), t1, fill=(255, 255, 255), font=font_team_impact)
    
    # Right (Union Heiligenberg)
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (1, 1), (2, 2)]:
        tdraw.text((center_rx - t2_w//2 + dx, ly_top + (70 - t2_h)//2 + dy - 2), t2, fill=(35, 18, 2, 240), font=font_team_impact)
    tdraw.text((center_rx - t2_w//2, ly_top + (70 - t2_h)//2 - 2), t2, fill=(255, 255, 255), font=font_team_impact)
    
    img = Image.alpha_composite(img, text_layer)
    
    # 7. Match Details Section with Inclined / Angled Background and Text
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
    
    out_file = os.path.join(output_dir, "Matchday_Kinetic_Outline_Style.png")
    img.save(out_file, "PNG")
    
    # Save to main file
    c_final = os.path.join(output_dir, "Concept_Dynamic_Split_Final.png")
    img.save(c_final, "PNG")
    
    web_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos\Matchday_Wallpapers"
    os.makedirs(web_dir, exist_ok=True)
    img.save(os.path.join(web_dir, "Matchday_Kinetic_Outline_Style.png"), "PNG")
    img.save(os.path.join(web_dir, "Concept_Dynamic_Split_Final.png"), "PNG")
    
    print("Kinetic outline MATCHDAY wallpaper saved:", out_file)
    return out_file

if __name__ == "__main__":
    build_kinetic_matchday()
