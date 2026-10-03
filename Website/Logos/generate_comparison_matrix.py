import os
import json
from PIL import Image, ImageDraw, ImageFont

# Load shields data
with open("final_shields.json", "r", encoding="utf-8") as f:
    shields = json.load(f)

# Candidate colors
candidates = [
    {
        "id": "warm_espresso",
        "name": "#221c1c (Warm Espresso Charcoal)",
        "hex": "#221c1c",
        "rgb": (34, 28, 28)
    },
    {
        "id": "cool_slate",
        "name": "#1e293b (Cool Slate Navy - Recommended)",
        "hex": "#1e293b",
        "rgb": (30, 41, 59)
    },
    {
        "id": "mid_slate",
        "name": "#475569 (Mid Slate Gray - Current Default)",
        "hex": "#475569",
        "rgb": (71, 85, 105)
    },
    {
        "id": "neutral_zinc",
        "name": "#18181b (Neutral Dark Zinc)",
        "hex": "#18181b",
        "rgb": (24, 24, 27)
    }
]

# Backgrounds matching DSG Website tokens
backgrounds = [
    {"name": "Light Mode Card (#ffffff)", "rgb": (255, 255, 255), "text_rgb": (26, 26, 36)},
    {"name": "Light Mode Page (#f4f5f7)", "rgb": (244, 245, 247), "text_rgb": (26, 26, 36)},
    {"name": "Dark Mode Card (#242e3f)", "rgb": (36, 46, 63), "text_rgb": (247, 250, 252)},
    {"name": "Dark Mode Page (#1a202c)", "rgb": (26, 32, 44), "text_rgb": (247, 250, 252)},
]

# Pick 3 representative shield shapes for comparison: 01 Classic Heater, 03 Swiss Notched, 05 Modern Hex
sample_shields = [shields[0], shields[2], shields[4]]

# Render each shield variant at 1024x1024
os.makedirs("comparison_assets", exist_ok=True)
rendered = {}

for cand in candidates:
    cand_id = cand["id"]
    rendered[cand_id] = []
    for s in sample_shields:
        img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        poly = [(p[0], p[1]) for p in s["polygon"]]
        
        # Draw fill
        draw.polygon(poly, fill=(*cand["rgb"], 255))
        # Draw 8px white stroke
        draw.line(poly + [poly[0]], fill=(255, 255, 255, 255), width=8, joint="curve")
        
        filename = f"comparison_assets/{cand_id}_{s['id']}.png"
        img.save(filename)
        rendered[cand_id].append(img)

# Now construct a side-by-side comparison matrix image
# Matrix: 4 Columns (one per color candidate) x 4 Rows (one per website background)
# Under each column: 3 shield shapes displayed horizontally

col_width = 380
row_height = 190
header_height = 100
title_height = 80

total_width = 40 + 4 * col_width + 120 # + label margin
total_height = title_height + header_height + 4 * row_height + 40

matrix_img = Image.new("RGB", (total_width, total_height), (15, 23, 42))
matrix_draw = ImageDraw.Draw(matrix_img)

# Title
matrix_draw.text((40, 25), "DSG Liga - Badge Shield Color Palette Comparison Matrix", fill=(255, 255, 255))
matrix_draw.text((40, 50), "Testing against exact DSG Liga CSS website tokens (Light Cards, Light Backgrounds, Dark Surfaces, Dark Backgrounds)", fill=(148, 163, 184))

# Column Headers (Candidate Colors)
start_x = 180
start_y = title_height + 20

for c_idx, cand in enumerate(candidates):
    cx = start_x + c_idx * col_width
    # Header card
    matrix_draw.rectangle([cx, start_y, cx + col_width - 20, start_y + 60], fill=(30, 41, 59), outline=(71, 85, 105))
    # Color swatch
    matrix_draw.rectangle([cx + 10, start_y + 10, cx + 50, start_y + 50], fill=cand["rgb"], outline=(255, 255, 255))
    # Label
    matrix_draw.text((cx + 60, start_y + 12), cand["hex"], fill=(255, 255, 255))
    name_short = cand["name"].split("(")[1].replace(")", "") if "(" in cand["name"] else cand["name"]
    matrix_draw.text((cx + 60, start_y + 34), name_short[:25], fill=(203, 213, 225))

# Draw Grid Rows
grid_top = start_y + 80

for r_idx, bg in enumerate(backgrounds):
    ry = grid_top + r_idx * row_height
    
    # Row background stripe container
    matrix_draw.rectangle([20, ry, total_width - 20, ry + row_height - 15], fill=(20, 28, 45))
    
    # Row Label
    matrix_draw.text((30, ry + 25), bg["name"].split("(")[0].strip(), fill=(255, 255, 255))
    token_hex = bg["name"].split("(")[1].replace(")", "") if "(" in bg["name"] else ""
    matrix_draw.text((30, ry + 50), token_hex, fill=(148, 163, 184))
    
    # Swatch preview for each candidate
    for c_idx, cand in enumerate(candidates):
        cx = start_x + c_idx * col_width
        
        # Sub-card with website background color
        subcard_rect = [cx, ry + 10, cx + col_width - 20, ry + row_height - 25]
        matrix_draw.rectangle(subcard_rect, fill=bg["rgb"], outline=(80, 90, 110) if bg["rgb"] == (255, 255, 255) else None)
        
        # Paste the 3 sample shields on this background
        for s_idx, s_img in enumerate(rendered[cand["id"]]):
            thumb = s_img.resize((100, 100), Image.Resampling.LANCZOS)
            sx = cx + 15 + s_idx * 110
            sy = ry + 25
            matrix_img.paste(thumb, (sx, sy), thumb)

matrix_img.save("comparison_matrix.png")
print("Saved comparison_matrix.png successfully!")
