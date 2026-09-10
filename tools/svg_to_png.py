import os
from cairosvg import svg2png

BASE = os.path.dirname(os.path.dirname(__file__))
ICON_DIR = os.path.join(BASE, 'icons')

pairs = [
    ('icon-192.svg', 'icon-192.png', 192),
    ('icon-512.svg', 'icon-512.png', 512),
]

for svg_name, png_name, size in pairs:
    svg_path = os.path.join(ICON_DIR, svg_name)
    png_path = os.path.join(ICON_DIR, png_name)
    if not os.path.exists(svg_path):
        print(f"Missing {svg_path}, skipping")
        continue
    try:
        svg2png(url=svg_path, write_to=png_path, output_width=size, output_height=size)
        print(f"Wrote {png_path}")
    except Exception as e:
        print('Error converting', svg_path, e)
