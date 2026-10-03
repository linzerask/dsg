import os
from PIL import Image, ImageDraw, ImageFont

base_dir = r"C:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\DSG Liga\Logos\Matchday_Wallpapers"

img1_path = os.path.join(base_dir, "Matchday_Futuristic_Sports_Font.png")
img2_path = os.path.join(base_dir, "Matchday_Athletic_Condensed_NoRibbon.png")

im1 = Image.open(img1_path)
im2 = Image.open(img2_path)

# Create 2-panel showcase
showcase = Image.new("RGBA", (2240, 1200), (10, 12, 16, 255))
showcase.paste(im1.resize((1040, 1040)), (50, 100))
showcase.paste(im2.resize((1040, 1040)), (1150, 100))

sdraw = ImageDraw.Draw(showcase)
f_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 36)
f_sub = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)

sdraw.text((50, 40), "OPTION A: Modern Geometric Sports Font (Tracked Bahnschrift / DIN)", fill=(0, 230, 90), font=f_title)
sdraw.text((1150, 40), "OPTION B: Bold Athletic Condensed (Impact / Pure Gradient)", fill=(255, 215, 60), font=f_title)

out_showcase = os.path.join(base_dir, "Sports_Font_Teams_Comparison.png")
showcase.save(out_showcase, "PNG")
print("Saved comparison:", out_showcase)
