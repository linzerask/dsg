import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

base_dir = r"C:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Logos"
output_dir = os.path.join(base_dir, "Matchday_Wallpapers")
assets_dir = os.path.join(output_dir, "assets")
os.makedirs(output_dir, exist_ok=True)
os.makedirs(assets_dir, exist_ok=True)

# Assets
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
        "C:/Windows/Fonts/bahnschrift.ttf",
        "C:/Windows/Fonts/impact.ttf",
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

# Modern Typography Scale
font_hero_watermark = get_font("impact", 210, True)
font_matchday_main = get_font("impact", 96, True)
font_team_name = get_font("impact", 44, True) # Clean bold condensed
font_tag = get_font("arialbd", 16, True)
font_date = get_font("arialbd", 28, True)
font_kickoff = get_font("arialbd", 52, True)
font_details = get_font("arialbd", 20, True)
font_vs = get_font("impact", 54, True)

def add_drop_shadow(img, offset=(0, 20), blur=36, color=(0, 0, 0, 240)):
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

def build_modern_matchday():
    # 1. Canvas: Ultra-deep Obsidian Slate (10, 12, 16)
    img = Image.new("RGBA", (W, H), (10, 12, 16, 255))
    
    # 2. Volumetric Dual Club Lighting Atmosphere (Dark Burgundy Left, Warm Amber Gold Right)
    atmosphere = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    adraw = ImageDraw.Draw(atmosphere)
    
    # Left: Volumetric Crimson / Burgundy Smoke Aura
    adraw.ellipse([-100, 150, 500, 850], fill=(160, 20, 45, 90))
    adraw.ellipse([50, 300, 420, 700], fill=(220, 30, 60, 50))
    
    # Right: Volumetric Warm Amber Gold Smoke Aura
    adraw.ellipse([580, 150, 1180, 850], fill=(235, 150, 15, 90))
    adraw.ellipse([660, 300, 1030, 700], fill=(255, 195, 45, 50))
    
    # Center ambient clash glow
    adraw.ellipse([W//2 - 220, 250, W//2 + 220, 700], fill=(255, 230, 140, 25))
    
    # Top floodlight
    adraw.ellipse([W//2 - 350, -150, W//2 + 350, 300], fill=(255, 255, 255, 30))
    
    atmosphere = atmosphere.filter(ImageFilter.GaussianBlur(95))
    img = Image.alpha_composite(img, atmosphere)
    
    # 3. Massive Kinetic Watermark "MATCHDAY" in Background
    watermark = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(watermark)
    wm_text = "MATCHDAY"
    w_box = font_hero_watermark.getbbox(wm_text)
    ww = w_box[2] - w_box[0]
    wdraw.text(((W - ww)//2, 180), wm_text, fill=(255, 255, 255, 16), font=font_hero_watermark)
    img = Image.alpha_composite(img, watermark)
    
    # Subtle modern architectural grid lines (fine 1px, 8% opacity)
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    for y in range(0, H, 60):
        gdraw.line([(0, y), (W, y)], fill=(255, 255, 255, 12), width=1)
    for x in range(0, W, 60):
        gdraw.line([(x, 0), (x, H)], fill=(255, 255, 255, 12), width=1)
    img = Image.alpha_composite(img, grid)
    
    # 4. Top Header: Modern Floating Pill + DSG Liga Brand
    draw = ImageDraw.Draw(img)
    
    # DSG Logo
    dsg_w = 200
    dsg_h = int(logo_dsg.height * (dsg_w / logo_dsg.width))
    dsg_mini = logo_dsg.resize((dsg_w, dsg_h), Image.Resampling.LANCZOS)
    img.paste(dsg_mini, ((W - dsg_w)//2, 40), dsg_mini)
    
    # Modern Matchday Typography
    m_text = "MATCHDAY"
    mbox = font_matchday_main.getbbox(m_text)
    mw = mbox[2] - mbox[0]
    draw.text(((W - mw)//2, 105), m_text, fill=(255, 255, 255), font=font_matchday_main)
    
    # Sleek Gold Underline with Central Diamond
    draw.line([(W//2 - 140, 220), (W//2 + 140, 220)], fill=(255, 215, 0, 220), width=2)
    draw.polygon([(W//2 - 5, 220), (W//2, 215), (W//2 + 5, 220), (W//2, 225)], fill=(255, 215, 0, 255))
    
    # 5. Team Shields (Large, Floating, 3D Backlight)
    crest_size = 300
    c1 = logo_gornjak.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    c2 = logo_heiligenberg.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
    
    sh1, off1 = add_drop_shadow(c1, offset=(0, 22), blur=40, color=(0, 0, 0, 240))
    sh2, off2 = add_drop_shadow(c2, offset=(0, 22), blur=40, color=(0, 0, 0, 240))
    
    c1_x = 105
    c1_y = 265
    c2_x = 675
    c2_y = 265
    
    img.paste(sh1, (c1_x - off1[0], c1_y - off1[1]), sh1)
    img.paste(sh2, (c2_x - off2[0], c2_y - off2[1]), sh2)
    
    # 6. Central Glowing "VS" Badge (Modern Floating Glass Circle with Golden Stroke)
    vs_glass = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vgdraw = ImageDraw.Draw(vs_glass)
    # Frosted glass circle
    vgdraw.ellipse([W//2 - 42, 385, W//2 + 42, 469], fill=(15, 18, 26, 230), outline=(255, 215, 0, 220), width=2)
    # Subtle inner halo
    vgdraw.ellipse([W//2 - 34, 393, W//2 + 34, 461], outline=(255, 255, 255, 40), width=1)
    
    vs_box = font_vs.getbbox("VS")
    vsw = vs_box[2] - vs_box[0]
    vgdraw.text(((W - vsw)//2, 400), "VS", fill=(255, 225, 80), font=font_vs)
    img = Image.alpha_composite(img, vs_glass)
    
    # 7. Modern Floating Team Name Podiums (Glassmorphic Pills with Team Accent Borders)
    podium_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(podium_layer)
    
    # Left Podium (FC Gornjak)
    p1_rect = [60, 595, 450, 680]
    pdraw.rounded_rectangle(p1_rect, radius=16, fill=(18, 20, 28, 235), outline=(190, 28, 48, 240), width=2)
    # Golden top-left indicator dot
    pdraw.ellipse([80, 610, 88, 618], fill=(220, 30, 60))
    pdraw.text((96, 606), "HEIMTEAM", fill=(200, 70, 90), font=font_tag)
    
    # Name: FC GORNJAK (Uniform 44px)
    t1 = "FC GORNJAK"
    t1_box = font_team_name.getbbox(t1)
    t1_w = t1_box[2] - t1_box[0]
    pdraw.text((60 + (390 - t1_w)//2, 626), t1, fill=(255, 255, 255), font=font_team_name)
    
    # Right Podium (Union Heiligenberg)
    p2_rect = [630, 595, 1020, 680]
    pdraw.rounded_rectangle(p2_rect, radius=16, fill=(18, 20, 28, 235), outline=(240, 165, 18, 240), width=2)
    # Golden top-left indicator dot
    pdraw.ellipse([650, 610, 658, 618], fill=(245, 175, 20))
    pdraw.text((666, 606), "GASTTEAM", fill=(245, 185, 40), font=font_tag)
    
    # Name: UNION HEILIGENBERG (Uniform 44px)
    t2 = "UNION HEILIGENBERG"
    t2_box = font_team_name.getbbox(t2)
    t2_w = t2_box[2] - t2_box[0]
    pdraw.text((630 + (390 - t2_w)//2, 626), t2, fill=(255, 255, 255), font=font_team_name)
    
    img = Image.alpha_composite(img, podium_layer)
    
    # 8. Modern Match Fixture Lower-Third Card (Glassmorphism + Gold Framing)
    card_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(card_layer)
    
    card_rect = [60, 735, W - 60, 990]
    # Dark glass container
    cdraw.rounded_rectangle(card_rect, radius=24, fill=(14, 17, 24, 240), outline=(255, 255, 255, 35), width=1)
    
    # Top Dual Gradient Accent Line (Crimson to Gold)
    cdraw.line([(84, 735), (W//2, 735)], fill=(220, 30, 60, 255), width=3)
    cdraw.line([(W//2, 735), (W - 84, 735)], fill=(245, 175, 20, 255), width=3)
    
    # Top Tag: Date & Spieltag
    date_str = "SAMSTAG • 03. OKTOBER 2026"
    d_box = font_date.getbbox(date_str)
    dw = d_box[2] - d_box[0]
    cdraw.text(((W - dw)//2, 765), date_str, fill=(255, 255, 255), font=font_date)
    
    # Big High-Voltage Kickoff Display
    time_str = "ANPFIFF 16:00 UHR"
    tm_box = font_kickoff.getbbox(time_str)
    tm_w = tm_box[2] - tm_box[0]
    cdraw.text(((W - tm_w)//2, 815), time_str, fill=(255, 215, 0), font=font_kickoff)
    
    # Divider line
    cdraw.line([(180, 895), (W - 180, 895)], fill=(255, 255, 255, 25), width=1)
    
    # Location & League Details (Clean Modern Swiss Format)
    loc_str = "SPIELORT: DSG-PLATZ • OFFIZIELLES LIGASPIEL"
    l_box = font_details.getbbox(loc_str)
    lw = l_box[2] - l_box[0]
    cdraw.text(((W - lw)//2, 920), loc_str, fill=(175, 190, 210), font=font_details)
    
    img = Image.alpha_composite(img, card_layer)
    
    # Save modern wallpaper
    out_file = os.path.join(output_dir, "Matchday_Modern_2026.png")
    img.save(out_file, "PNG")
    
    # Overwrite final wallpaper
    c_final = os.path.join(output_dir, "Concept_Dynamic_Split_Final.png")
    img.save(c_final, "PNG")
    
    web_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos\Matchday_Wallpapers"
    os.makedirs(web_dir, exist_ok=True)
    img.save(os.path.join(web_dir, "Matchday_Modern_2026.png"), "PNG")
    img.save(os.path.join(web_dir, "Concept_Dynamic_Split_Final.png"), "PNG")
    
    print("Modern 2026 Matchday saved to:", out_file)
    return out_file

if __name__ == "__main__":
    build_modern_matchday()
