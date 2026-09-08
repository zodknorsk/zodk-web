#!/usr/bin/env python3
"""Genera los SVG del logo de zodk.eu a partir de la rejilla de pixeles."""

OCEAN_L, OCEAN_D = "#3b7dc4", "#1b3c69"
LAND_L,  LAND_D  = "#5aab5f", "#2f6b3c"
ICE_L,   ICE_D   = "#eef3f7", "#b6c7d5"
DRONE_L, DRONE_D = "#dde3e8", "#8b95a0"
ACCENT           = "#e91e8c"

# ---------------------------------------------------------------- globo 26x26
# (fila: [(col_ini, col_fin, tipo), ...])  tipo: o=oceano l=tierra i=hielo
GLOBE_ROWS = {
     0: [(10, 15, "i")],
     1: [(7, 18, "o")],
     2: [(5, 11, "o"), (12, 20, "l")],
     3: [(4, 9, "o"), (10, 21, "l")],
     4: [(3, 8, "o"), (9, 9, "l"), (10, 10, "o"), (11, 12, "l"), (13, 13, "o"), (14, 22, "l")],
     5: [(2, 7, "o"), (8, 9, "l"), (10, 10, "o"), (11, 23, "l")],
     6: [(1, 9, "o"), (10, 13, "l"), (14, 15, "o"), (16, 24, "l")],
     7: [(1, 7, "o"), (8, 10, "l"), (11, 11, "o"), (12, 12, "l"), (13, 13, "o"), (14, 24, "l")],
     8: [(1, 7, "o"), (8, 9, "l"), (10, 11, "o"), (12, 12, "l"), (13, 13, "o"), (14, 24, "l")],
     9: [(0, 13, "o"), (14, 25, "l")],
    10: [(0, 7, "o"), (8, 11, "l"), (12, 12, "o"), (13, 16, "l"), (17, 17, "o"), (18, 25, "l")],
    11: [(0, 6, "o"), (7, 14, "l"), (15, 15, "o"), (16, 17, "l"), (18, 18, "o"), (19, 25, "l")],
    12: [(0, 6, "o"), (7, 15, "l"), (16, 16, "o"), (17, 18, "l"), (19, 19, "o"),
         (20, 22, "l"), (23, 23, "o"), (24, 25, "l")],
    13: [(0, 6, "o"), (7, 16, "l"), (17, 20, "o"), (21, 21, "l"), (22, 23, "o"), (24, 25, "l")],
    14: [(0, 8, "o"), (9, 16, "l"), (17, 25, "o")],
    15: [(0, 10, "o"), (11, 16, "l"), (17, 25, "o")],
    16: [(0, 10, "o"), (11, 16, "l"), (17, 25, "o")],
    17: [(1, 10, "o"), (11, 15, "l"), (16, 16, "o"), (17, 17, "l"), (18, 24, "o")],
    18: [(1, 10, "o"), (11, 15, "l"), (16, 16, "o"), (17, 17, "l"), (18, 24, "o")],
    19: [(1, 11, "o"), (12, 15, "l"), (16, 24, "o")],
    20: [(2, 11, "o"), (12, 14, "l"), (15, 23, "o")],
    21: [(3, 12, "o"), (13, 13, "l"), (14, 22, "o")],
    22: [(4, 21, "o")],
    23: [(5, 20, "o")],
    24: [(7, 18, "i")],
    25: [(10, 15, "i")],
}

# columna donde empieza la sombra (terminador escalonado)
SHADOW = [14, 15, 16, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19, 19,
          19, 19, 18, 18, 18, 18, 18, 17, 17, 16, 15, 14]

PALETTE = {"o": (OCEAN_L, OCEAN_D), "l": (LAND_L, LAND_D), "i": (ICE_L, ICE_D)}

# ---------------------------------------------------------------- dron 22x12
DRONE_ROWS = {
     0: [(9, 10, "L")],
     1: [(9, 11, "L")],
     2: [(9, 11, "L")],
     3: [(9, 11, "L"), (19, 21, "L")],
     4: [(2, 5, "L"), (9, 11, "L"), (18, 19, "L")],
     5: [(0, 0, "A"), (1, 19, "L")],
     6: [(0, 19, "D")],
     7: [(2, 5, "D"), (9, 11, "D"), (18, 19, "D")],
     8: [(9, 11, "D"), (19, 21, "D")],
     9: [(9, 11, "D")],
    10: [(9, 11, "D")],
    11: [(9, 10, "D")],
}
DRONE_COLORS = {"L": DRONE_L, "D": DRONE_D, "A": ACCENT}


def rect(x, y, w, h, fill):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'


def globe_rects(px, ox, oy):
    out = []
    for r, segs in GLOBE_ROWS.items():
        y, ss = oy + r * px, SHADOW[r]
        for c0, c1, kind in segs:
            light, dark = PALETTE[kind]
            # partir el segmento en el terminador
            for a, b, fill in ((c0, min(c1, ss - 1), light), (max(c0, ss), c1, dark)):
                if a <= b:
                    out.append(rect(ox + a * px, y, (b - a + 1) * px, px, fill))
    return out


def drone_rects(px, ox, oy):
    out = []
    for r, segs in DRONE_ROWS.items():
        y = oy + r * px
        for c0, c1, kind in segs:
            out.append(rect(ox + c0 * px, y, (c1 - c0 + 1) * px, px, DRONE_COLORS[kind]))
    return out


def build(px_globe, px_drone, drone_ox, drone_oy, globe_ox, globe_oy, w, h, title):
    body = drone_rects(px_drone, drone_ox, drone_oy) + globe_rects(px_globe, globe_ox, globe_oy)
    inner = "\n  ".join(body)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" shape-rendering="crispEdges" role="img" '
        f'aria-label="{title}">\n  {inner}\n</svg>\n'
    )


# logo completo: globo 26x26 a 10px + dron 22x12 a 5px
# dron  x 0..110  y 0..60
# globo x 0..260  y 75..335
logo = build(
    px_globe=10, px_drone=5,
    drone_ox=0, drone_oy=0,
    globe_ox=0, globe_oy=75,
    w=260, h=335,
    title="zodk.eu",
)

with open("/mnt/user-data/outputs/zodk-logo.svg", "w") as f:
    f.write(logo)

print("logo:", len(logo), "bytes")
