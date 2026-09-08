#!/usr/bin/env python3
"""Genera el favicon simplificado y exporta PNG/ICO del logo de zodk.eu."""
from PIL import Image
from build_logo import (GLOBE_ROWS, SHADOW, DRONE_ROWS, DRONE_COLORS,
                        PALETTE, rect)

OUT = "/mnt/user-data/outputs"

# ------------------------------------------------- version simplificada 16x16
FAVI_ROWS = {
     0: [(6, 9, "i")],
     1: [(4, 11, "o")],
     2: [(3, 5, "o"), (6, 12, "l")],
     3: [(2, 4, "o"), (5, 13, "l")],
     4: [(1, 5, "o"), (6, 14, "l")],
     5: [(1, 7, "o"), (8, 14, "l")],
     6: [(0, 4, "o"), (5, 9, "l"), (10, 10, "o"), (11, 12, "l"), (13, 15, "o")],
     7: [(0, 4, "o"), (5, 10, "l"), (11, 15, "o")],
     8: [(0, 5, "o"), (6, 9, "l"), (10, 15, "o")],
     9: [(0, 5, "o"), (6, 9, "l"), (10, 15, "o")],
    10: [(1, 5, "o"), (6, 8, "l"), (9, 14, "o")],
    11: [(1, 6, "o"), (7, 7, "l"), (8, 14, "o")],
    12: [(2, 13, "o")],
    13: [(3, 12, "o")],
    14: [(4, 5, "o"), (6, 9, "i"), (10, 11, "o")],
    15: [(6, 9, "i")],
}
FAVI_SHADOW = [9, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 10, 9]


def split_rows(rows, shadow):
    """Devuelve [(col, fila, color)] aplicando el terminador."""
    cells = []
    for r, segs in rows.items():
        ss = shadow[r]
        for c0, c1, kind in segs:
            light, dark = PALETTE[kind]
            for c in range(c0, c1 + 1):
                cells.append((c, r, dark if c >= ss else light))
    return cells


def to_image(cells, w, h, scale):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for c, r, color in cells:
        px[c, r] = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    return img.resize((w * scale, h * scale), Image.NEAREST)


# --------------------------------------------------------------- favicon SVG
favi_cells = split_rows(FAVI_ROWS, FAVI_SHADOW)
body = "\n  ".join(rect(c, r, 1, 1, col) for c, r, col in favi_cells)
favi_svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" '
    'height="16" shape-rendering="crispEdges" role="img" aria-label="zodk.eu">\n'
    f'  {body}\n</svg>\n'
)
open(f"{OUT}/zodk-favicon.svg", "w").write(favi_svg)

# --------------------------------------------------------------- PNG e ICO
favi = to_image(favi_cells, 16, 16, 1)
favi.resize((16, 16), Image.NEAREST).save(f"{OUT}/favicon-16.png")
favi.resize((32, 32), Image.NEAREST).save(f"{OUT}/favicon-32.png")
favi.save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

apple = Image.new("RGBA", (180, 180), (0, 0, 0, 0))
apple.paste(favi.resize((176, 176), Image.NEAREST), (2, 2))
apple.save(f"{OUT}/apple-touch-icon.png")

# --------------------------------------- logo completo en media-celda (52x67)
full = []
for c, r, col in split_rows(GLOBE_ROWS, SHADOW):          # globo: 1 celda = 2
    for dx in (0, 1):
        for dy in (0, 1):
            full.append((c * 2 + dx, 15 + r * 2 + dy, col))
for r, segs in DRONE_ROWS.items():                        # dron: 1 celda = 1
    for c0, c1, kind in segs:
        for c in range(c0, c1 + 1):
            full.append((c, r, DRONE_COLORS[kind]))

to_image(full, 52, 67, 8).save(f"{OUT}/zodk-logo.png")

print("hecho")
