import os
from PIL import Image, ImageDraw, ImageFont

base_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Website\Logos\Matchday_Wallpapers"

c1 = Image.open(os.path.join(base_dir, "Concept_1_Cyber_Neon.png"))
c2 = Image.open(os.path.join(base_dir, "Concept_2_Swiss_Minimalist.png"))
c3 = Image.open(os.path.join(base_dir, "Concept_3_Dynamic_Split.png"))
c4 = Image.open(os.path.join(base_dir, "Concept_4_Atmospheric_Stadium.png"))
c5 = Image.open(os.path.join(base_dir, "Concept_5_Urban_Street.png"))

# Create 5-concept presentation banner / showcase (e.g. 5x1 or 3+2 layout)
# Let's make a luxury 3+2 grid: 3200 x 2400 px
SW, SH = 3400, 2400
showcase = Image.new("RGBA", (SW, SH), (10, 12, 16, 255))
draw = ImageDraw.Draw(showcase)

def get_font(size, bold=True):
    for p in ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/segoeuib.ttf"]:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

font_title = get_font(68)
font_sub = get_font(34, False)
font_badge = get_font(28)

# Header Title
draw.text((120, 80), "DSG LIGA • INSTAGRAM MATCHDAY CONCEPTS", fill=(212, 175, 55), font=font_badge)
draw.text((120, 125), "FC Gornjak vs Union Heiligenberg", fill=(255, 255, 255), font=font_title)
draw.text((120, 210), "5 Design Directions (Square 1:1 format for Instagram Feed & Story)", fill=(160, 170, 185), font=font_sub)
draw.line([(120, 265), (SW - 120, 265)], fill=(255, 255, 255, 35), width=2)

# Row 1: 3 concepts (width = 960)
thumb_size = 940
gap_x = 100
start_x = 120
row1_y = 310

c1_thumb = c1.resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)
c2_thumb = c2.resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)
c3_thumb = c3.resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)

showcase.paste(c1_thumb, (start_x, row1_y))
showcase.paste(c2_thumb, (start_x + thumb_size + gap_x, row1_y))
showcase.paste(c3_thumb, (start_x + (thumb_size + gap_x)*2, row1_y))

# Row 1 Labels
draw.text((start_x, row1_y + thumb_size + 20), "01. CYBER NEON STADIUM", fill=(0, 220, 255), font=font_badge)
draw.text((start_x + thumb_size + gap_x, row1_y + thumb_size + 20), "02. SWISS EDITORIAL MINIMALIST", fill=(212, 175, 55), font=font_badge)
draw.text((start_x + (thumb_size + gap_x)*2, row1_y + thumb_size + 20), "03. DYNAMIC DIAGONAL DUEL", fill=(255, 80, 80), font=font_badge)

# Row 2: 2 concepts centered
row2_y = 1340
r2_start_x = (SW - (thumb_size * 2 + gap_x * 2)) // 2

c4_thumb = c4.resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)
c5_thumb = c5.resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)

showcase.paste(c4_thumb, (r2_start_x, row2_y))
showcase.paste(c5_thumb, (r2_start_x + thumb_size + gap_x*2, row2_y))

# Row 2 Labels
draw.text((r2_start_x, row2_y + thumb_size + 20), "04. ATMOSPHERIC SPOTLIGHT BROADCAST", fill=(255, 215, 0), font=font_badge)
draw.text((r2_start_x + thumb_size + gap_x*2, row2_y + thumb_size + 20), "05. URBAN STREET TICKET POSTER", fill=(255, 255, 255), font=font_badge)

out_showcase = os.path.join(base_dir, "Matchday_5_Concepts_Showcase.png")
showcase.save(out_showcase, "PNG")
print("Showcase saved:", out_showcase)
