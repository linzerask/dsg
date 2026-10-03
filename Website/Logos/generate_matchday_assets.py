import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

output_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos\Matchday_Wallpapers"
assets_dir = os.path.join(output_dir, "assets")
os.makedirs(assets_dir, exist_ok=True)

W, H = 1080, 1080

def create_concept1_bg():
    """Concept 1: Cyber Neon Dark Mode"""
    img = Image.new("RGBA", (W, H), (8, 12, 22, 255))
    draw = ImageDraw.Draw(img)
    
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    for y in range(0, H, 45):
        gdraw.line([(0, y), (W, y)], fill=(0, 200, 255, 25), width=1)
    for x in range(0, W, 45):
        gdraw.line([(x, 0), (x, H)], fill=(0, 200, 255, 25), width=1)
    img = Image.alpha_composite(img, grid)
        
    glow1 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw1 = ImageDraw.Draw(glow1)
    gdraw1.ellipse([80, 260, 480, 660], fill=(0, 210, 255, 60))
    gdraw1.ellipse([600, 260, 1000, 660], fill=(255, 140, 0, 60))
    gdraw1.ellipse([300, -120, 780, 320], fill=(0, 160, 255, 50))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow1)
    
    path = os.path.join(assets_dir, "bg_concept1.png")
    img.save(path)
    print("Saved:", path)

def create_concept2_bg():
    """Concept 2: Swiss Minimalist Luxury Dark Slate"""
    img = Image.new("RGBA", (W, H), (14, 16, 20, 255))
    
    lines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(lines)
    margin = 75
    ldraw.rectangle([margin, margin, W - margin, H - margin], outline=(255, 255, 255, 25), width=1)
    ldraw.line([(margin - 15, H//2), (margin + 15, H//2)], fill=(212, 175, 55, 180), width=2)
    ldraw.line([(W - margin - 15, H//2), (W - margin + 15, H//2)], fill=(212, 175, 55, 180), width=2)
    ldraw.line([(W//2, margin - 15), (W//2, margin + 15)], fill=(212, 175, 55, 180), width=2)
    ldraw.line([(W//2, H - margin - 15), (W//2, H - margin + 15)], fill=(212, 175, 55, 180), width=2)
    img = Image.alpha_composite(img, lines)
    
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([180, 180, 900, 900], fill=(40, 48, 60, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img, glow)
    
    path = os.path.join(assets_dir, "bg_concept2.png")
    img.save(path)
    print("Saved:", path)

def create_concept3_bg():
    """Concept 3: Dynamic Diagonal Duel Split (Premium Dark Split)"""
    img = Image.new("RGBA", (W, H), (12, 14, 18, 255))
    draw = ImageDraw.Draw(img)
    
    # Left deep burgundy / maroon block
    left_poly = [(0, 0), (int(W*0.62), 0), (int(W*0.38), H), (0, H)]
    draw.polygon(left_poly, fill=(40, 16, 24, 255))
    
    # Right deep dark teal block
    right_poly = [(int(W*0.62), 0), (W, 0), (W, H), (int(W*0.38), H)]
    draw.polygon(right_poly, fill=(12, 34, 38, 255))
    
    # Diagonal subtle dark accent lines
    stripes = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(stripes)
    for i in range(-5, 15):
        offset = i * 110
        p1 = (offset, 0)
        p2 = (offset + 30, 0)
        p3 = (offset - 270, H)
        p4 = (offset - 300, H)
        sdraw.polygon([p1, p2, p3, p4], fill=(255, 255, 255, 12))
    img = Image.alpha_composite(img, stripes)
        
    # Clash divider glowing beam
    beam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(beam)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(255, 215, 0, 220), width=6)
    bdraw.line([(int(W*0.62), 0), (int(W*0.38), H)], fill=(255, 255, 255, 255), width=2)
    beam = beam.filter(ImageFilter.GaussianBlur(6))
    img = Image.alpha_composite(img, beam)
    
    # Center flare
    flare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare)
    fdraw.ellipse([W//2 - 200, H//2 - 200, W//2 + 200, H//2 + 200], fill=(255, 210, 50, 60))
    flare = flare.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, flare)
    
    path = os.path.join(assets_dir, "bg_concept3.png")
    img.save(path)
    print("Saved:", path)

def create_concept4_bg():
    """Concept 4: Atmospheric Pitch Spotlight (Cinematic Stadium)"""
    img = Image.new("RGBA", (W, H), (6, 10, 15, 255))
    draw = ImageDraw.Draw(img)
    
    for y in range(H//2, H):
        ratio = (y - H//2) / (H//2)
        r = int(6 + (10 - 6) * ratio)
        g = int(10 + (48 - 10) * ratio)
        b = int(15 + (25 - 15) * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255), width=1)
        
    lights = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(lights)
    ldraw.polygon([(0, 0), (280, 0), (520, int(H*0.85)), (80, int(H*0.85))], fill=(180, 230, 255, 45))
    ldraw.polygon([(W-280, 0), (W, 0), (W-80, int(H*0.85)), (W-520, int(H*0.85))], fill=(180, 230, 255, 45))
    ldraw.ellipse([W//2 - 320, -120, W//2 + 320, 360], fill=(255, 255, 255, 50))
    lights = lights.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, lights)
    
    bokeh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(bokeh)
    import random
    random.seed(77)
    for _ in range(50):
        bx = random.randint(40, W-40)
        by = random.randint(80, H-120)
        br = random.randint(4, 20)
        alpha = random.randint(10, 45)
        bdraw.ellipse([bx-br, by-br, bx+br, by+br], fill=(200, 230, 255, alpha))
    bokeh = bokeh.filter(ImageFilter.GaussianBlur(5))
    img = Image.alpha_composite(img, bokeh)
    
    path = os.path.join(assets_dir, "bg_concept4.png")
    img.save(path)
    print("Saved:", path)

def create_concept5_bg():
    """Concept 5: Urban Street Poster (Subtle Screenprint Halftone)"""
    img = Image.new("RGBA", (W, H), (18, 20, 24, 255))
    
    dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ddraw = ImageDraw.Draw(dots)
    for y in range(0, H, 20):
        for x in range(0, W, 20):
            dist_to_center = math.sqrt((x - W/2)**2 + (y - H/2)**2)
            if dist_to_center > 240:
                rad = 1
                if dist_to_center > 440:
                    rad = 2
                ddraw.ellipse([x-rad, y-rad, x+rad, y+rad], fill=(255, 255, 255, 20))
    img = Image.alpha_composite(img, dots)
                
    noise = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ndraw = ImageDraw.Draw(noise)
    import random
    random.seed(123)
    for _ in range(50):
        x1 = random.randint(0, W)
        y1 = random.randint(0, H)
        length = random.randint(20, 100)
        angle = random.uniform(0, 3.14)
        x2 = int(x1 + length * math.cos(angle))
        y2 = int(y1 + length * math.sin(angle))
        ndraw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, random.randint(8, 22)), width=1)
    noise = noise.filter(ImageFilter.GaussianBlur(1))
    img = Image.alpha_composite(img, noise)
    
    path = os.path.join(assets_dir, "bg_concept5.png")
    img.save(path)
    print("Saved:", path)

if __name__ == "__main__":
    create_concept1_bg()
    create_concept2_bg()
    create_concept3_bg()
    create_concept4_bg()
    create_concept5_bg()
    print("Assets successfully regenerated!")
