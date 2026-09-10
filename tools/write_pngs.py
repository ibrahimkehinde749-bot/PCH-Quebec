from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.dirname(__file__))
ICON_DIR = os.path.join(BASE, 'grant-program-website', 'icons')
os.makedirs(ICON_DIR, exist_ok=True)

pairs = [(192, 'icon-192.png'), (512, 'icon-512.png')]
results = []
for size, name in pairs:
    img = Image.new('RGB', (size, size), (234, 166, 37))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 3
    r = size // 4
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255))
    try:
        font_size = int(size * 0.24)
        font = ImageFont.truetype('arial.ttf', font_size)
    except Exception:
        font = ImageFont.load_default()
    text = 'PCH'
    w, h = draw.textsize(text, font=font)
    draw.text(((size - w) / 2, size - h - int(size * 0.08)), text, fill=(255, 255, 255), font=font)
    out_path = os.path.join(ICON_DIR, name)
    img.save(out_path)
    results.append(f"{name}: {img.width}x{img.height}, {os.path.getsize(out_path)} bytes")

with open(os.path.join(os.path.dirname(__file__), 'png_sizes.txt'), 'w') as f:
    f.write('\n'.join(results))
