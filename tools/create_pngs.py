import zlib, struct, os

BASE = os.path.dirname(os.path.dirname(__file__))
ICON_DIR = os.path.join(BASE, 'grant-program-website', 'icons')
os.makedirs(ICON_DIR, exist_ok=True)

def write_png(path, width, height, color):
    # color is (r,g,b)
    def png_chunk(chunk_type, data):
        chunk = struct.pack('!I', len(data)) + chunk_type + data
        crc = struct.pack('!I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk + crc

    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr = struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit, Truecolor
    png += png_chunk(b'IHDR', ihdr)

    # IDAT - raw image data (no filter, RGB)
    row = b''
    # Each scanline starts with filter byte 0
    for y in range(height):
        # create RGB for each pixel
        row_bytes = b''
        for x in range(width):
            row_bytes += bytes(color)
        row += b'\x00' + row_bytes
    compressed = zlib.compress(row, level=9)
    png += png_chunk(b'IDAT', compressed)

    # IEND
    png += png_chunk(b'IEND', b'')

    with open(path, 'wb') as f:
        f.write(png)
    print('Wrote', path)

# generate 192x192 and 512x512 solid icons using theme color
write_png(os.path.join(ICON_DIR, 'icon-192.png'), 192, 192, (234,166,37))
write_png(os.path.join(ICON_DIR, 'icon-512.png'), 512, 512, (234,166,37))
print('Done')
