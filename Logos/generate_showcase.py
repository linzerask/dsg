import glob
import os
from PIL import Image, ImageDraw, ImageFont

pngs = sorted(glob.glob("Ready/standard/default/*.png"))
print("Found PNGs:", len(pngs))

# Let's create a visual showcase image: 2 rows of 5 shields on dark background and on light background
# Shield size in showcase: 200x200
# Canvas: 1200 x 600
def make_showcase(bg_color, filename, label_text):
    card_w, card_h = 220, 220
    cols, rows = 5, 2
    img = Image.new("RGB", (cols * card_w + 40, rows * card_h + 100), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Title
    text_color = (255, 255, 255) if sum(bg_color) < 400 else (30, 41, 59)
    draw.text((30, 20), f"DSG Liga - 10 Standard Football Badge Shields ({label_text})", fill=text_color)
    
    for idx, p in enumerate(pngs):
        r = idx // cols
        c = idx % cols
        x = 30 + c * card_w
        y = 60 + r * card_h
        
        shield_img = Image.open(p).convert("RGBA")
        shield_thumb = shield_img.resize((180, 180), Image.Resampling.LANCZOS)
        
        img.paste(shield_thumb, (x + 10, y + 10), shield_thumb)
        
        # Label
        name = os.path.basename(p).replace(".png", "").replace("shield_", "")
        draw.text((x + 15, y + 195), f"{idx+1}. {name[:18]}", fill=text_color)
        
    img.save(filename)
    print("Saved", filename)

make_showcase((15, 23, 42), "showcase_dark_mode.png", "Dark Background #0f172a")
make_showcase((248, 250, 252), "showcase_light_mode.png", "Light Background #f8fafc")
make_showcase((22, 101, 52), "showcase_pitch_green.png", "Grass Green #166534")
