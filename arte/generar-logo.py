#!/usr/bin/env python3
"""Logo animado de zodk.eu — mapamundi revisado + contorno de contraste."""
import math

OCEAN_L, OCEAN_D = "#3b7dc4", "#1b3c69"
LAND_L,  LAND_D  = "#5aab5f", "#2f6b3c"
ICE_L,   ICE_D   = "#eef3f7", "#b6c7d5"
DRONE_L, DRONE_D = "#dde3e8", "#8b95a0"
ACCENT           = "#e91e8c"
OUTLINE          = "#101d33"      # contorno: invisible sobre oscuro, marca sobre claro

PX      = 10
GLOBE_W = 26
FRAMES  = 20
DEG_COL = 360 / 52.0
CX      = GLOBE_W / 2.0

# ------------------------------------------------- mapamundi equirectangular
# col 0 = 180W, 6.92 grados por columna. fila 0 = 90N, 6.92 grados por fila.
WORLD = {
     0: [(0, 51, "i")],                                              # Artico
     1: [(18, 23, "i")],                                             # Groenlandia
     2: [(2, 16, "l"), (18, 23, "i"), (28, 30, "l"), (34, 51, "l")],
     3: [(2, 17, "l"), (19, 22, "i"), (25, 25, "l"), (27, 27, "l"),
         (29, 51, "l")],                                             # Escocia, Noruega, Botnia
     4: [(2, 12, "l"), (15, 18, "l"), (24, 25, "l"), (27, 28, "l"),
         (30, 44, "l"), (46, 51, "l")],                              # Irlanda + GB, Baltico
     5: [(7, 18, "l"), (27, 44, "l"), (46, 48, "l")],                # canal de la Mancha
     6: [(8, 16, "l"), (25, 30, "l"), (32, 32, "l"), (34, 44, "l"),
         (46, 46, "l")],                                             # golfo de Vizcaya, mar Negro
     7: [(8, 15, "l"), (24, 25, "l"), (28, 28, "l"), (30, 30, "l"),
         (32, 32, "l"), (34, 44, "l"), (46, 46, "l")],               # Iberia, Italia, Balcanes
     8: [(9, 14, "l"), (27, 27, "l"), (30, 43, "l"), (45, 46, "l")],  # Tunez, Anatolia, Japon
     9: [(10, 12, "l"), (14, 14, "l"), (24, 27, "l"), (29, 34, "l"),
         (36, 43, "l")],                                             # golfo de Sirte, Sinai
    10: [(10, 13, "l"), (24, 30, "l"), (32, 34, "l"), (36, 38, "l"),
         (40, 42, "l")],                                             # Sahara, mar Rojo, Arabia
    11: [(12, 17, "l"), (23, 30, "l"), (33, 34, "l"), (36, 38, "l"),
         (40, 41, "l"), (43, 43, "l")],                              # cabo Blanco, golfo de Aden
    12: [(14, 18, "l"), (23, 32, "l"), (37, 37, "l"), (40, 44, "l")],  # Cuerno de Africa
    13: [(14, 20, "l"), (24, 25, "l"), (27, 32, "l"), (40, 47, "l")],  # golfo de Guinea
    14: [(15, 20, "l"), (27, 31, "l")],                              # Gabon: codo del golfo
    15: [(15, 20, "l"), (27, 31, "l"), (43, 45, "l"), (47, 47, "l")],  # Arnhem, Carpentaria, York
    16: [(16, 20, "l"), (27, 31, "l"), (33, 33, "l"), (42, 47, "l")],  # Madagascar, mar del Coral
    17: [(16, 19, "l"), (28, 30, "l"), (33, 33, "l"), (42, 48, "l")],  # Australia, maxima anchura
    18: [(15, 17, "l"), (28, 29, "l"), (42, 42, "l"), (45, 47, "l"),
         (51, 51, "l")],                                             # Gran Bahia Australiana
    19: [(15, 16, "l"), (28, 28, "l"), (47, 47, "l"), (50, 50, "l")],  # Cabo, Tasmania, N. Zelanda
    20: [(15, 15, "l")],                                             # Patagonia
    21: [(17, 17, "l")],
    22: [], 23: [],
    24: [(0, 51, "i")], 25: [(0, 51, "i")],                          # Antartida
}

CIRCLE = [(10, 15), (7, 18), (5, 20), (4, 21), (3, 22), (2, 23), (1, 24), (1, 24),
          (1, 24), (0, 25), (0, 25), (0, 25), (0, 25), (0, 25), (0, 25), (0, 25),
          (0, 25), (1, 24), (1, 24), (1, 24), (2, 23), (3, 22), (4, 21), (5, 20),
          (7, 18), (10, 15)]

SHADOW = [14, 15, 16, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19, 19,
          19, 19, 18, 18, 18, 18, 18, 17, 17, 16, 15, 14]

DRONE_ROWS = {
     0: [(9, 10, "L")],  1: [(9, 11, "L")],  2: [(9, 11, "L")],
     3: [(9, 11, "L"), (19, 21, "L")],
     4: [(2, 5, "L"), (9, 11, "L"), (18, 19, "L")],
     5: [(0, 0, "A"), (1, 19, "L")],
     6: [(0, 19, "D")],
     7: [(2, 5, "D"), (9, 11, "D"), (18, 19, "D")],
     8: [(9, 11, "D"), (19, 21, "D")],
     9: [(9, 11, "D")], 10: [(9, 11, "D")], 11: [(9, 10, "D")],
}
DRONE_COLORS = {"L": DRONE_L, "D": DRONE_D, "A": ACCENT}


def rect(x, y, w, h, fill=None):
    f = f' fill="{fill}"' if fill else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"{f}/>'


def merge(cells, cell_px, dx=0, dy=0):
    """Une celdas contiguas del mismo color en rectangulos."""
    out, by_row = [], {}
    for c, r, col in cells:
        by_row.setdefault(r, {})[c] = col
    for r in sorted(by_row):
        cols, start, prev, cur = by_row[r], None, None, None
        for c in sorted(cols):
            if cols[c] != cur or (prev is not None and c != prev + 1):
                if cur:
                    out.append(rect(dx + start * cell_px, dy + r * cell_px,
                                    (prev - start + 1) * cell_px, cell_px, cur))
                start, cur = c, cols[c]
            prev = c
        if cur:
            out.append(rect(dx + start * cell_px, dy + r * cell_px,
                            (prev - start + 1) * cell_px, cell_px, cur))
    return out


def outline(shape, cell_px, dx=0, dy=0, sub=1):
    """Anillo de celdas vecinas fuera de la silueta, en rejilla sub-dividida."""
    fine = {(c * sub + i, r * sub + j) for c, r in shape
            for i in range(sub) for j in range(sub)}
    ring = {(c + i, r + j) for c, r in fine
            for i in (-1, 0, 1) for j in (-1, 0, 1)} - fine
    return merge([(c, r, OUTLINE) for c, r in ring], cell_px // sub, dx, dy)


def kind_at(row, wc):
    for a, b, k in WORLD[row]:
        if a <= wc <= b:
            return k
    return "o"


def frame_cells(lam0):
    """Un fotograma con compresion ortografica en el limbo."""
    out = []
    for r in range(26):
        c0, c1 = CIRCLE[r]
        hw = (c1 - c0 + 1) / 2.0
        for c in range(c0, c1 + 1):
            ratio = max(-1.0, min(1.0, (c + 0.5 - CX) / hw))
            lam = lam0 + math.degrees(math.asin(ratio))
            out.append((c, r, kind_at(r, int(((lam + 180) / DEG_COL) % 52))))
    return out


# ----------------------------------------------------------------- capas
disc = {(c, r) for r, (c0, c1) in enumerate(CIRCLE) for c in range(c0, c1 + 1)}
borde_globo = outline(disc, PX, sub=2)

ocean = merge([(c, r, OCEAN_D if c >= SHADOW[r] else OCEAN_L)
               for c, r in disc], PX)

tira = []
for i in range(FRAMES):
    cells = [(c, r, (ICE_D if c >= SHADOW[r] else ICE_L) if k == "i" else
                    (LAND_D if c >= SHADOW[r] else LAND_L))
             for c, r, k in frame_cells(-i * 360.0 / FRAMES) if k != "o"]
    tira += merge(cells, PX, dx=i * GLOBE_W * PX)

clip = [rect(c0 * PX, r * PX, (c1 - c0 + 1) * PX, PX)
        for r, (c0, c1) in enumerate(CIRCLE)]

DRONE_X = 60
dron_shape = {(c, r) for r, segs in DRONE_ROWS.items()
              for c0, c1, _ in segs for c in range(c0, c1 + 1)}
borde_dron = outline(dron_shape, 5, dx=DRONE_X)
dron = merge([(c, r, DRONE_COLORS[k]) for r, segs in DRONE_ROWS.items()
              for c0, c1, k in segs for c in range(c0, c1 + 1)], 5, dx=DRONE_X)

GLOBE_Y, DIVE, DRIFT = 75, 105, 22
TOTAL_W = FRAMES * GLOBE_W * PX

J = "\n      ".join
SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 280 355" width="280" height="355" shape-rendering="crispEdges" role="img" aria-label="zodk.eu">
  <style>
    .zodk-borde {{ fill: var(--zodk-borde, {OUTLINE}); }}
    #zodk-rotar {{ animation: zodk-girar 20s steps({FRAMES}) infinite; }}
    #dron {{ animation: zodk-volar 7s cubic-bezier(.45,0,.55,1) infinite alternate; }}
    @keyframes zodk-girar {{ to {{ transform: translateX(-{TOTAL_W}px); }} }}
    @keyframes zodk-volar {{ to {{ transform: translate({DRIFT}px, {DIVE}px); }} }}
    @media (prefers-reduced-motion: reduce) {{
      #zodk-rotar, #dron {{ animation: none; }}
    }}
  </style>
  <defs>
    <clipPath id="zodk-disco">
      {J(clip)}
    </clipPath>
  </defs>

  <g id="globo" transform="translate(0 {GLOBE_Y})">
    <g class="zodk-borde">
      {J(borde_globo)}
    </g>
    {J(ocean)}
    <g clip-path="url(#zodk-disco)">
      <g id="zodk-rotar">
        {J(tira)}
      </g>
    </g>
  </g>

  <g id="dron">
    <g class="zodk-borde">
      {J(borde_dron)}
    </g>
    {J(dron)}
  </g>
</svg>
'''

open("zodk-logo-animado.svg", "w").write(SVG)
print("rects:", SVG.count("<rect"), "| bytes:", len(SVG))
