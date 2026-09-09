#!/usr/bin/env python3
"""Planeta de la portada de zodk.eu — la Tierra grande, hemisferio norte.

Proyección ortográfica de una esfera enorme (como el globo del logo pero a lo
grande), Polo Norte arriba, con inclinación ligera; se dibuja el casquete
visible y por debajo cae en sombra y se funde con el negro del hero. La máscara
tierra/mar/hielo sale de Natural Earth (mapa_tierra.py). Gira sobre el eje polar.

Dos versiones, como el logo día/noche:
  - zodk-planeta-sprite.png : Tierra de día, sol y terminador, ciudades como
    puntos oscuros que se encienden al pasar a la sombra.
  - zodk-planeta-noche.png  : Tierra de noche entera, con luces repartidas por
    los países según densidad de población (luces.py) y las grandes ciudades
    como focos. La web usa esta con el tema oscuro.

Sale como PNG rasterizado (FRAMES fotogramas en fila, 1 px = 1 celda); la web lo
anima con `background-position` a saltos: un "pegado" de bitmap, barato en
cualquier navegador. El dron va aparte en `zodk-dron[-noche].svg`.

    python3 generar-planeta-hero.py
"""
import math
from mapa_tierra import GRID_W, GRID_H, ROWS
from luces import LW, LH, ROWS as LUZ_ROWS
from png8 import write_indexed

# --------------------------------------------------------------- paletas
OCEAN = (0x36, 0x7a, 0xc0)
LAND  = (0x54, 0xa2, 0x59)
ICE   = (0xe6, 0xec, 0xf2)
SPACE = (0x05, 0x06, 0x0a)
ATMO  = (0xbc, 0xdc, 0xff)
CITY_DARK  = (0x0d, 0x17, 0x24)     # marca de ciudad en el lado de día

# noche
N_OCEAN = (0x0b, 0x16, 0x25)
N_LAND  = (0x17, 0x23, 0x2d)
N_ICE   = (0x2a, 0x37, 0x47)
N_ATMO  = (0x3a, 0x5c, 0x8c)
GOLD = ((0xc9, 0x99, 0x3c), (0xf2, 0xc4, 0x52), (0xff, 0xd8, 0x6c))  # dim / medio / metro

# Principales ciudades: (lat, lon, pop_max). Natural Earth (ne_110m), pop >= 5 M.
MEGA = 10_000_000                   # a partir de aqui el punto es de 2x2 celdas
CIUDADES = [
    (35.69, 139.75, 35676000), (40.72, -74.00, 19040000), (19.44, -99.13, 19028000),
    (19.07, 72.88, 18978000), (-23.56, -46.63, 18845000), (31.22, 121.43, 14987000),
    (22.57, 88.37, 14787000), (23.73, 90.41, 12797394), (-34.61, -58.43, 12795000),
    (34.05, -118.23, 12500000), (30.05, 31.25, 11893000), (-22.91, -43.21, 11748000),
    (34.69, 135.50, 11294000), (39.90, 116.39, 11106000), (14.61, 120.98, 11100000),
    (55.75, 37.61, 10452000), (41.02, 28.97, 10061000), (48.86, 2.35, 9904000),
    (37.57, 127.00, 9796000), (6.45, 3.39, 9466000), (-6.17, 106.83, 9125000),
    (41.85, -87.64, 8990000), (51.50, -0.12, 8567000), (-12.05, -77.05, 8012000),
    (35.67, 51.42, 7873000), (-4.33, 15.31, 7843000), (4.60, -74.09, 7772000),
    (22.31, 114.18, 7206000), (25.04, 121.57, 6900273), (12.97, 77.56, 6787000),
    (13.75, 100.51, 6704000), (-33.44, -70.65, 5720000), (25.79, -80.23, 5585000),
    (40.40, -3.69, 5567000), (43.66, -79.39, 5213000), (1.29, 103.85, 5183700),
    (-8.84, 13.23, 5172900), (33.34, 44.39, 5054000),
]

# Luces sueltas que solo se encienden de noche (islas, sitios aislados que
# quedan bonitos como un punto solo en medio del océano).
LUCES_SUELTAS = [
    (21.31, -157.86),   # Honolulu
    (64.13, -21.90),    # Reikiavik
    (18.47, -66.11),    # San Juan (Puerto Rico)
]

# ------------------------------------------------------------ geometría
COLS    = 164          # ancho del fotograma, en px (1 px = 1 celda)
RADIUS  = 84.0         # radio de la esfera, en celdas
CDOWN   = 0.92         # fracción del radio que se dibuja hacia abajo
TILT    = 20.0         # latitud del sub-observador (0 = ecuador de frente)
FRAMES  = 28           # fotogramas de la rotación (giro más fluido, PNG algo mayor)
MAPRES  = 4            # submuestreo del mapa (4 -> ~1 grado)
SHADES  = 16           # escalones de brillo del día

SUN_DEG = (-46.0, -12.0)       # (azimut desde arriba, elevación)
SUN_Z   = 0.56                 # empuje del sol hacia el observador
TERM_A, TERM_B = -0.34, 0.60   # borde del terminador
NIGHT   = 0.20                 # brillo mínimo en el lado en sombra (día)
LIMB_K  = 0.28                 # oscurecimiento del borde

CX  = COLS / 2.0
CY  = RADIUS
VIS = int(RADIUS + RADIUS * CDOWN)

_az, _el = math.radians(SUN_DEG[0]), math.radians(SUN_DEG[1])
SX = math.sin(_az) * math.cos(_el)
SY = -math.cos(_az) * math.cos(_el)
SZ = math.sin(_el) + SUN_Z
_n = math.sqrt(SX * SX + SY * SY + SZ * SZ)
SX, SY, SZ = SX / _n, SY / _n, SZ / _n

T = math.radians(TILT)
SINT, COST = math.sin(T), math.cos(T)

# --------------------------------------------- máscara tierra/mar submuestreada
_K = {"o": 0, "l": 1, "i": 2}
_FULL = [bytearray(GRID_W) for _ in range(GRID_H)]
for r, spans in enumerate(ROWS):
    row = _FULL[r]
    for a, b, k in spans:
        v = _K[k]
        for c in range(a, b + 1):
            row[c] = v

MH, MW = GRID_H // MAPRES, GRID_W // MAPRES
GRID = [bytearray(MW) for _ in range(MH)]
for r in range(MH):
    for c in range(MW):
        cnt = [0, 0, 0]
        for dr in range(MAPRES):
            src = _FULL[r * MAPRES + dr]
            for dc in range(MAPRES):
                cnt[src[c * MAPRES + dc]] += 1
        GRID[r][c] = cnt.index(max(cnt))


def _mcell(lat, lon):
    return (int((90.0 - lat) / 180.0 * MH), int((lon + 180.0) / 360.0 * MW))


# Estrecho de Gibraltar: el submuestreo une Iberia y Marruecos; se abre a mano
# una celda de mar (~1 grado, un pixel de canal).
_gr, _gc = _mcell(35.6, -5.5)
for _c in (_gc - 1, _gc, _gc + 1):
    GRID[_gr][_c] = 0

# ------------------------------------------------- rejilla de densidad de luces
LUZ = [bytearray(LW) for _ in range(LH)]
for r, spans in enumerate(LUZ_ROWS):
    row = LUZ[r]
    for a, b, lv in spans:
        for c in range(a, b + 1):
            row[c] = lv


def luz_at(lat, lon):
    lr = int((90.0 - lat) / 180.0 * LH)
    lr = 0 if lr < 0 else LH - 1 if lr >= LH else lr
    lc = int((lon + 180.0) / 360.0 * LW) % LW
    return LUZ[lr][lc]


# ------------------------------------------------------------------ color
def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


PAL = [(0, 0, 0, 0)]      # 0 = espacio transparente
_idx = {}


def color_index(rgb):
    rgb = tuple((c // 3) * 3 for c in rgb)
    i = _idx.get(rgb)
    if i is None:
        if len(PAL) >= 256:
            return min(range(1, len(PAL)),
                       key=lambda j: sum((PAL[j][k] - rgb[k]) ** 2 for k in range(3)))
        i = len(PAL)
        PAL.append(rgb)
        _idx[rgb] = i
    return i


# ------------------------------------------------------------- proyección
def _project(sx, sy):
    px = (sx + 0.5 - CX) / RADIUS
    py = (sy + 0.5 - CY) / RADIUS
    rr = px * px + py * py
    if rr > 1.0:
        return None
    pz  = math.sqrt(1.0 - rr)
    lat = math.degrees(math.asin(max(-1.0, min(1.0, -py * COST + pz * SINT))))
    v   = py * SINT + pz * COST
    lon = math.degrees(math.atan2(px, v))
    return px, py, pz, rr, lat, lon


def terrain_at(sx, sy, lon0):
    p = _project(sx, sy)
    if p is None:
        return None
    gr, gc = _mcell(p[4], p[5] + lon0)
    gr = 0 if gr < 0 else MH - 1 if gr >= MH else gr
    return GRID[gr][gc % MW]


def cell_index(sx, sy, lon0, night):
    p = _project(sx, sy)
    if p is None:
        return 0
    px, py, pz, rr, lat, lon = p
    lon += lon0
    dc = math.sqrt(rr)
    gr, gc = _mcell(lat, lon)
    gr = 0 if gr < 0 else MH - 1 if gr >= MH else gr
    terrain = GRID[gr][gc % MW]

    if night:
        base = (N_OCEAN, N_LAND, N_ICE)[terrain]
        col = mix(SPACE, base, 1.0 - 0.55 * smooth(0.80, 1.0, dc))
        if terrain != 0 and dc < 0.95:
            lv = luz_at(lat, lon)
            if lv == 1 and ((gr * 7 + (gc % MW) * 3) % 6):   # nivel 1: dispersas
                lv = 0
            if lv:
                col = GOLD[lv - 1]
        if dc > 0.94:
            col = mix(col, N_ATMO, 0.35 * smooth(0.94, 1.0, dc))
        return color_index(col)

    # --- día
    lam = px * SX + py * SY + pz * SZ
    bright = NIGHT + (1.0 - NIGHT) * smooth(TERM_A, TERM_B, lam)
    limb = LIMB_K * smooth(0.72, 1.0, dc)
    if terrain == 2:
        limb *= 0.4
    bright *= 1.0 - limb
    q = round(bright * SHADES) / SHADES
    col = mix(SPACE, (OCEAN, LAND, ICE)[terrain], q)
    if dc > 0.93 and lam > 0.0:
        halo = smooth(0.93, 1.0, dc) * smooth(0.0, 0.45, lam)
        col = mix(col, ATMO, 0.3 * (round(halo * 3) / 3))
    return color_index(col)


def city_cells(lon0, night):
    """Celdas (sx, sy) -> color de las ciudades. De día: siempre punto oscuro.
    De noche: todas encendidas en ámbar."""
    ci_dark  = color_index(CITY_DARK)
    ci_light = color_index(GOLD[2])
    out = {}
    for clat, clon, pop in CIUDADES:
        rlat = math.radians(clat)
        rlon = math.radians(clon - lon0)
        a  = math.sin(rlat)
        cl = math.cos(rlat)
        vv = cl * math.cos(rlon)
        px = cl * math.sin(rlon)
        py = -COST * a + SINT * vv
        pz =  SINT * a + COST * vv
        if pz <= 0.07:
            continue
        lit = bool(night)          # de día las ciudades no se encienden (solo puntos)
        col = ci_light if lit else ci_dark
        cx = int(round(px * RADIUS + CX - 0.5))
        cy = int(round(py * RADIUS + CY - 0.5))

        if terrain_at(cx, cy, lon0) == 0:      # cae en el mar -> a tierra cercana
            best = None
            for r in (1, 2):
                for dx in range(-r, r + 1):
                    for dy in range(-r, r + 1):
                        if terrain_at(cx + dx, cy + dy, lon0) in (1, 2):
                            d2 = dx * dx + dy * dy
                            if best is None or d2 < best[0]:
                                best = (d2, dx, dy)
                if best:
                    break
            if best:
                cx, cy = cx + best[1], cy + best[2]

        dc = math.sqrt(px * px + py * py)
        big = (pop >= MEGA or lit) and dc < 0.72      # encoge al acercarse al limbo
        block = ((0, 0), (1, 0), (0, 1), (1, 1)) if big else ((0, 0),)
        for dx, dy in block:
            x, y = cx + dx, cy + dy
            if 0 <= x < COLS and 0 <= y < VIS:
                out[(x, y)] = col

    if night:                                        # luces sueltas (islas)
        for clat, clon in LUCES_SUELTAS:
            rlat = math.radians(clat)
            rlon = math.radians(clon - lon0)
            a  = math.sin(rlat)
            cl = math.cos(rlat)
            vv = cl * math.cos(rlon)
            px = cl * math.sin(rlon)
            py = -COST * a + SINT * vv
            pz =  SINT * a + COST * vv
            if pz <= 0.10:
                continue
            x = int(round(px * RADIUS + CX - 0.5))
            y = int(round(py * RADIUS + CY - 0.5))
            if 0 <= x < COLS and 0 <= y < VIS:
                out[(x, y)] = ci_light
    return out


# ------------------------------------------------------ sprites
def render(night, path):
    sw, sh = COLS * FRAMES, VIS
    rows = [bytearray(sw) for _ in range(sh)]
    for f in range(FRAMES):
        lon0 = -f * 360.0 / FRAMES
        xoff = f * COLS
        cities = city_cells(lon0, night)
        for sy in range(VIS):
            row = rows[sy]
            for sx in range(COLS):
                row[xoff + sx] = cities.get((sx, sy)) or cell_index(sx, sy, lon0, night)
    write_indexed(path, sw, sh, rows, PAL)
    return sw, sh


SW, SH = render(False, "zodk-planeta-sprite.png")
render(True, "zodk-planeta-noche.png")
assert len(PAL) <= 256, f"paleta de {len(PAL)} colores, no cabe en PNG-8"

# --------------------------------------------------------------- el dron
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
DP = 4
DW, DH = 24 * DP, 14 * DP


NAV_NOSE  = "#ffd23c"     # morro: amarillo
NAV_RIGHT = "#33dd66"     # ala derecha (arriba): verde
NAV_LEFT  = "#ff3b30"     # ala izquierda (abajo): rojo


def drone_svg(night):
    body_l = "#5a6472" if night else "#dde3e8"
    body_d = "#3a424e" if night else "#8b95a0"
    accent = body_l if night else "#e91e8c"          # el dron de día se queda igual
    hexmap = {"L": body_l, "D": body_d, "A": accent}
    cells = {}
    for r, segs in DRONE_ROWS.items():
        for a, b, k in segs:
            for c in range(a, b + 1):
                cells[(c, r)] = hexmap[k]
    if night:
        # Luces de posición (solo de noche). El dron mira a la izquierda: proa a
        # la izq, ala vertical en el centro. Amarilla en el morro, verde en la
        # punta de arriba del ala, roja en la de abajo.
        cells[(0, 5)] = NAV_NOSE
        cells[(0, 6)] = NAV_NOSE
        cells[(10, 0)] = NAV_RIGHT
        cells[(9, 0)] = NAV_RIGHT
        cells[(10, 11)] = NAV_LEFT
        cells[(9, 11)] = NAV_LEFT
    ring = {}
    for (c, r) in cells:
        for dc in (-1, 0, 1):
            for dr in (-1, 0, 1):
                if (c + dc, r + dr) not in cells:
                    ring[(c + dc, r + dr)] = "#050a12" if night else "#101d33"
    rects = "".join(
        f'<rect x="{(c + 1) * DP}" y="{(r + 1) * DP}" width="{DP}" height="{DP}" fill="{col}"/>'
        for (c, r), col in list(ring.items()) + list(cells.items()))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {DW} {DH}" '
            f'width="{DW}" height="{DH}" shape-rendering="crispEdges" '
            f'role="img" aria-label="Dron">{rects}</svg>\n')


with open("zodk-dron.svg", "w") as fh:
    fh.write(drone_svg(False))
with open("zodk-dron-noche.svg", "w") as fh:
    fh.write(drone_svg(True))

print(f"sprite: {SW}x{SH} px, {len(PAL)} colores | dia + noche + 2 drones")
