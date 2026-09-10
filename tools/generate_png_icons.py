from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.dirname(__file__))
ICON_DIR = os.path.join(BASE, 'icons')
os.makedirs(ICON_DIR, exist_ok=True)

pairs = [(192, 'icon-192.png'), (512, 'icon-512.png')]

for size, name in pairs:
    img = Image.new('RGBA', (size, size), '#eba625')
    draw = ImageDraw.Draw(img)
    # circle
    cx = size//2
    cy = size//3
    r = size//4
    draw.ellipse((cx-r, cy-r, cx+r, cy+r), fill=(255,255,255,255))
    # text
    try:
        # Use a default PIL font if truetype not available
        font_size = int(size*0.24)
        font = ImageFont.truetype('arial.ttf', font_size)
    except Exception:
        font = ImageFont.load_default()
    text = 'PCH'
    w, h = draw.textsize(text, font=font)
    draw.text(((size-w)/2, size - h - int(size*0.08)), text, fill=(255,255,255,255), font=font)
    out_path = os.path.join(ICON_DIR, name)
    img.save(out_path)
    print('Wrote', out_path)
