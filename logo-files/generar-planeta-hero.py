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
cualquier navegador.

El dron del hero (Bayraktar TB3) ya NO sale de aquí: es un SVG de diseño hecho a
mano que vive tal cual en `public/zodk-dron[-noche].svg`. Este script solo genera
los dos PNG del planeta.

    python3 generar-planeta-hero.py
"""
import math
from mapa_tierra import GRID_W, GRID_H, ROWS
from luces import LW, LH, ROWS as LUZ_ROWS
from png8 import write_indexed


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

# --------------------------------------------------------------- paletas
OCEAN = (0x36, 0x7a, 0xc0)          # (retro) azul medio de referencia
OCEAN_SHALLOW = (0x43, 0x8f, 0xc6)  # plataforma continental
OCEAN_DEEP    = (0x1d, 0x50, 0x8c)  # océano profundo
LAND  = (0x54, 0xa2, 0x59)
ICE   = (0xdb, 0xe3, 0xec)
SPACE = (0x05, 0x06, 0x0a)
ATMO  = (0xbc, 0xdc, 0xff)
CITY_DARK  = (0x0d, 0x17, 0x24)     # marca de ciudad en el lado de día
COAST_COL  = (0x24, 0x40, 0x33)     # línea de costa (verde muy oscuro)

# Biomas de tierra (aprox. por latitud + cajas de desierto + un poco de ruido).
BIOME_COLS = [
    (0x53, 0xa4, 0x58),   # 0 templado
    (0x33, 0x7a, 0x3b),   # 1 selva / tropical húmedo
    (0xd8, 0xbe, 0x7e),   # 2 desierto (arena)
    (0xa6, 0xb0, 0x5f),   # 3 estepa / sabana seca
    (0x33, 0x62, 0x4b),   # 4 boreal / taiga
    (0x9a, 0x95, 0x82),   # 5 tundra / roca pelada
]
DESIERTOS = [   # (lat0, lat1, lon0, lon1)
    (12, 32, -17, 52),      # Sáhara + Arabia
    (24, 40, 44, 66),       # meseta iraní
    (35, 48, 62, 112),      # Gobi / Taklamakán
    (18, 30, 66, 78),       # Thar
    (-30, -18, 11, 25),     # Kalahari / Namib
    (-32, -19, 122, 146),   # outback australiano
    (-24, -4, -81, -69),    # costa de Perú / Atacama
    (26, 40, -116, -101),   # SO de EE. UU. / N de México
    (-42, -30, -71, -64),   # Patagonia seca
]

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
# COLS x FRAMES es el ancho de la tira PNG; hay GPUs (móvil viejo) que no pasan
# de 8192 px de textura, así que COLS <= ~290 con FRAMES 28.
COLS    = 280         # ancho del fotograma, en px (1 px = 1 celda)
RADIUS  = 143.0       # radio de la esfera, en celdas
CDOWN   = 0.92         # fracción del radio que se dibuja hacia abajo
TILT    = 20.0         # latitud del sub-observador (0 = ecuador de frente)
FRAMES  = 28           # fotogramas de la rotación (giro más fluido, PNG algo mayor)
MAPRES  = 2            # submuestreo del mapa (1440x720 -> 2 = 0.5 grado)
SHADES  = 16           # escalones de brillo del día

SUN_DEG = (-46.0, -12.0)       # (azimut desde arriba, elevación)
SUN_Z   = 0.56                 # empuje del sol hacia el observador
TERM_A, TERM_B = -0.34, 0.60   # borde del terminador
NIGHT   = 0.22                 # brillo mínimo en el lado en sombra (día)
LIMB_K  = 0.23                 # oscurecimiento del borde

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

# ------------------------------ costa, profundidad de mar y bioma (en el GRID)
import random
from collections import deque

DMAX = 6
_land = [[GRID[r][c] != 0 for c in range(MW)] for r in range(MH)]
COAST = [bytearray(MW) for _ in range(MH)]
SEADIST = [bytearray(MW) for _ in range(MH)]        # 0 = tierra; 1..DMAX = mar
BIOME = [bytearray(MW) for _ in range(MH)]
_N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
_dq = deque()

# Ruido de valor a baja frecuencia (interpolado): transiciones de bioma suaves,
# sin el "confeti" que daba el ruido por celda.
random.seed(20260910)
_NC = 7                                            # celdas por nodo de ruido
_NW, _NH = MW // _NC + 2, MH // _NC + 2
_NG = [[random.random() for _ in range(_NW)] for _ in range(_NH)]


def _vnoise(r, c):
    fr, fc = r / _NC, c / _NC
    r0, c0 = int(fr), int(fc)
    tr, tc = fr - r0, fc - c0
    a = _NG[r0][c0] * (1 - tc) + _NG[r0][c0 + 1] * tc
    b = _NG[r0 + 1][c0] * (1 - tc) + _NG[r0 + 1][c0 + 1] * tc
    return a * (1 - tr) + b * tr                   # 0..1


for r in range(MH):
    lat = 90.0 - (r + 0.5) / MH * 180.0
    for c in range(MW):
        if _land[r][c]:
            for dr, dcx in _N4:
                rr, cc = r + dr, (c + dcx) % MW
                if 0 <= rr < MH and not _land[rr][cc]:
                    COAST[r][c] = 1
                    break
            lon = (c + 0.5) / MW * 360.0 - 180.0
            nf = _vnoise(r, c) - 0.5              # -0.5..0.5, suave
            des = -1e9                            # margen dentro del desierto más cercano
            for a0, a1, o0, o1 in DESIERTOS:
                m = min(lat - a0, a1 - lat, lon - o0, o1 - lon)
                des = max(des, m)
            if des > 2.0 or (des > -4.0 and nf * 9.0 < des):
                b = 2
            else:
                la = abs(lat) + nf * 4.0          # frontera latitudinal ondulada
                if la < 12:
                    b = 1
                elif la < 34:
                    b = 3
                elif la < 52:
                    b = 0
                elif la < 66:
                    b = 4
                else:
                    b = 5
            BIOME[r][c] = b
        else:
            SEADIST[r][c] = DMAX

# 1 pasada de filtro de moda 3x3 (solo tierra): quita celdas de bioma sueltas
# sin llegar a aplanar las regiones.
for _ in range(1):
    _new = [bytearray(BIOME[r]) for r in range(MH)]
    for r in range(1, MH - 1):
        for c in range(MW):
            if not _land[r][c]:
                continue
            cnt = {}
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    cc = (c + dc) % MW
                    if _land[r + dr][cc]:
                        v = BIOME[r + dr][cc]
                        cnt[v] = cnt.get(v, 0) + 1
            _new[r][c] = max(cnt, key=cnt.get)
    BIOME = _new

for r in range(MH):
    for c in range(MW):
        if _land[r][c]:
            for dr, dcx in _N4:
                rr, cc = r + dr, (c + dcx) % MW
                if 0 <= rr < MH and not _land[rr][cc] and SEADIST[rr][cc] == DMAX:
                    SEADIST[rr][cc] = 1
                    _dq.append((rr, cc))
while _dq:
    r, c = _dq.popleft()
    d = SEADIST[r][c]
    if d >= DMAX:
        continue
    for dr, dcx in _N4:
        rr, cc = r + dr, (c + dcx) % MW
        if 0 <= rr < MH and not _land[rr][cc] and SEADIST[rr][cc] == DMAX:
            SEADIST[rr][cc] = d + 1
            _dq.append((rr, cc))

# Bayer 4x4 normalizado (0..1) para ditherar los degradados y quitar bandas.
_BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def _dither(sx, sy):
    return (_BAYER[sy & 3][sx & 3] + 0.5) / 16.0


# --------------------------------------------------------------------- nubes
# Nubes pixel-art tipo cúmulo (lóbulos irregulares arriba, base plana), con
# BORDE NEGRO para contraste. '#' cuerpo blanco, 'o' sombra gris, '.' vacío.
# 12 plantillas de tamaños/siluetas distintas + escala por instancia, para que
# no se repitan. El borde negro de 1 px se re-genera tras escalar (siempre
# limpio). Se proyectan sobre la esfera como las ciudades y giran con el planeta.
C_BODY = (0xfb, 0xfc, 0xfe)         # cuerpo blanco
C_BASE = (0xb0, 0xbc, 0xcc)         # sombra / base gris azulada
C_EDGE = (0x10, 0x13, 0x1c)         # borde casi negro (contraste)

CLOUD_ART = [
    # --- pequeñas ---
    """
.###.
#####
#oo##
.oo#.
""",
    """
..##..
.####.
##.###
#oo###
.oo##.
""",
    """
.###..
#####.
##.###
#oooo#
.oo##.
""",
    """
...##..
.######
##.####
#oo.###
.oo##..
""",
    # --- medianas ---
    """
...###...
.###.###.
###...###
##oooo.##
.##oooo##
..##oo##.
""",
    """
....###....
..##.#####.
.###...####
###.....###
##ooooo.###
.##oooooo##
..###ooo##.
""",
    """
..##..###...
.####.#####.
###..#....##
##........##
##oooooo..##
.##ooooooo##
...###ooo##.
""",
    """
.....##.....
...######...
..###..####.
.###.....###
###.......##
##ooooo...##
.##oooooo##.
..##oooo##..
""",
    # --- grandes / irregulares ---
    """
......###.......##..
....########..####..
...####...##########
..###.......########
..##.........#######
..##oooooo...#######
..##ooooooooo.#####.
...##ooooooo###....
""",
    """
.......##.........
....######...###..
..#####...########
.####.......#######
###..........######
##.............####
##ooooooo......###.
.##ooooooooo..###..
..###oooooo###.....
""",
    """
....##...####......
..######.######.##.
.#####...#####.####
####..........#####
##.............####
##ooooooo......###.
.##ooooooooooo.##..
..####oooooo###....
""",
    """
...###.......###....
.########...######..
#####...##.#....####
###......#.......###
##...............###
##ooooooo........##.
.##ooooooooooo..##..
..###oooooooo##....
""",
]

# peso: las plantillas 0-3 son demasiado pequeñas para el borde negro a esta
# escala; se usan solo las medianas (4-7, más frecuentes) y grandes (8-11).
CLOUD_W_PICK = [4, 5, 6, 7, 4, 5, 6, 7, 4, 5] + [8, 9, 10, 11]


def _cloud_body(art):
    """{(x, y): 'b'|'s'} con origen en (0, 0)."""
    out = {}
    for y, r in enumerate(art.strip("\n").split("\n")):
        for x, ch in enumerate(r):
            if ch == "#":
                out[(x, y)] = "b"
            elif ch == "o":
                out[(x, y)] = "s"
    return out


CLOUD_BODIES = [_cloud_body(a) for a in CLOUD_ART]

# Reparto: 40 nubes, semilla fija. Longitud ESTRATIFICADA (una por sector con
# jitter) para que no se amontonen y cada fotograma tenga un número parecido;
# latitud y todo lo demás al azar. (lat, lon, forma, espejo, escala).
random.seed(4242)
NUBES = []
_N = 40
for _i in range(_N):
    lon = -180.0 + (_i + random.uniform(0.15, 0.85)) * (360.0 / _N)
    lat = random.triangular(-52, 52, random.choice((-8, 8, 20, -20, 36, -36, 0)))
    NUBES.append((
        lat, lon,
        random.choice(CLOUD_W_PICK),
        random.random() < 0.5,
        random.uniform(0.8, 1.2),        # escala por instancia
    ))
random.shuffle(NUBES)

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
PAL = [(0, 0, 0, 0)]      # 0 = espacio transparente
_idx = {}


def color_index(rgb):
    rgb = tuple((c // 4) * 4 for c in rgb)
    i = _idx.get(rgb)
    if i is not None:
        return i
    if len(PAL) >= 256:                     # paleta llena: al color más cercano
        i = min(range(1, len(PAL)),
                key=lambda j: sum((PAL[j][k] - rgb[k]) ** 2 for k in range(3)))
        _idx[rgb] = i                       # y se cachea (si no, es lentísimo)
        return i
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
    gc %= MW
    terrain = GRID[gr][gc]
    dth = _dither(sx, sy)

    # --- color de la superficie, sin sombra ---
    if terrain == 0:                       # mar: más claro en plataforma, oscuro en abisal
        sd = SEADIST[gr][gc]
        t = 0.0 if sd <= 1 else min(1.0, (sd - 1) / 2.5)
        surf = mix(OCEAN_SHALLOW, OCEAN_DEEP, t)
        surf_n = N_OCEAN
    elif terrain == 2:                     # hielo
        surf = ICE
        surf_n = N_ICE
    else:                                  # tierra: bioma + línea de costa
        surf = BIOME_COLS[BIOME[gr][gc]]
        if COAST[gr][gc]:
            surf = mix(surf, COAST_COL, 0.5)
        surf_n = N_LAND

    if night:
        # MODO OSCURO CONGELADO: este script ya NO regenera el sprite de noche
        # (decisión del usuario, sept 2026: "no toques nada en el modo oscuro").
        # public/zodk-planeta-noche.png es el de producción, intocable. Esta
        # rama se deja como estaba por si algún día se quiere regenerar.
        base = (N_OCEAN, N_LAND, N_ICE)[terrain]
        col = mix(SPACE, base, 1.0 - 0.55 * smooth(0.80, 1.0, dc))
        if terrain != 0 and dc < 0.95:
            lv = luz_at(lat, lon)
            if lv == 1 and ((gr * 7 + gc * 3) % 6):     # nivel 1: dispersas
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
        limb *= 0.7
    bright *= 1.0 - limb
    # dither centrado: redondea, pero mueve el umbral ±0.4 para romper las bandas
    q = (math.floor(bright * SHADES + 0.5 + (dth - 0.5) * 0.8)) / SHADES
    q = 0.0 if q < 0.0 else 1.0 if q > 1.0 else q
    col = mix(SPACE, surf, q)
    if dc > 0.93 and lam > 0.0:
        halo = smooth(0.93, 1.0, dc) * smooth(0.0, 0.45, lam)
        col = mix(col, ATMO, 0.3 * (math.floor(halo * 4 + 0.5 + (dth - 0.5) * 0.8) / 4))
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


def _scaled_cloud(body, size):
    """Escala el cuerpo (nearest) y le regenera el borde negro. -> dict local."""
    xs = [p[0] for p in body]
    ys = [p[1] for p in body]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    dw = max(2, round((x1 - x0 + 1) * size))
    dh = max(2, round((y1 - y0 + 1) * size))
    dest = {}
    for oy in range(dh):
        sy = y0 + int(oy / size + 0.5)
        for ox in range(dw):
            k = body.get((x0 + int(ox / size + 0.5), sy))
            if k:
                dest[(ox, oy)] = k
    for (ox, oy) in list(dest):
        for ex in (-1, 0, 1):
            for ey in (-1, 0, 1):
                p = (ox + ex, oy + ey)
                if p not in dest:
                    dest.setdefault(p, "e")
    return dest, dw, dh


def cloud_cells(lon0):
    """(sx, sy) -> índice de color. Nubes pixel-art tipo cúmulo, proyectadas
    sobre la esfera y sombreadas por el terminador. Solo día."""
    out = {}
    for clat, clon, shp, flip, size in NUBES:
        rlat = math.radians(clat)
        rlon = math.radians(clon - lon0)
        a = math.sin(rlat)
        clat_c = math.cos(rlat)
        vv = clat_c * math.cos(rlon)
        px = clat_c * math.sin(rlon)
        py = -COST * a + SINT * vv
        pz = SINT * a + COST * vv
        if pz <= 0.50:                       # cerca del limbo o cara oculta
            continue
        lam = px * SX + py * SY + pz * SZ
        bright = smooth(TERM_A + 0.06, TERM_B + 0.2, lam)
        if bright < 0.12:                     # zona de noche del sprite de día
            continue
        cx = px * RADIUS + CX - 0.5
        cy = py * RADIUS + CY - 0.5
        xsc = 0.72 + 0.28 * pz               # se aplasta un poco hacia el borde
        t = 0.72 + 0.28 * bright             # nube blanca casi siempre; solo se
        cix = {                              # apaga pegada al terminador
            "b": color_index(mix(SPACE, C_BODY, min(1.0, t + 0.1))),
            "s": color_index(mix(SPACE, C_BASE, t)),
            "e": color_index(mix(SPACE, C_EDGE, max(0.7, t))),
        }
        cells, dw, dh = _scaled_cloud(CLOUD_BODIES[shp], size)
        for (ox, oy), k in cells.items():
            ddx = (ox - dw / 2.0)
            x = int(round(cx + (-ddx if flip else ddx) * xsc))
            y = int(round(cy + oy - dh / 2.0))
            if 0 <= x < COLS and 0 <= y < VIS and (x, y) not in out:
                out[(x, y)] = cix[k]
    return out


# ------------------------------------------------------ sprites
def render(night, path):
    sw, sh = COLS * FRAMES, VIS
    rows = [bytearray(sw) for _ in range(sh)]
    for f in range(FRAMES):
        lon0 = -f * 360.0 / FRAMES
        xoff = f * COLS
        overlay = {} if night else cloud_cells(lon0)
        overlay.update(city_cells(lon0, night))    # ciudades por encima de nubes
        for sy in range(VIS):
            row = rows[sy]
            for sx in range(COLS):
                row[xoff + sx] = overlay.get((sx, sy)) or cell_index(sx, sy, lon0, night)
    write_indexed(path, sw, sh, rows, PAL)
    return sw, sh


# El sprite de NOCHE ya no se genera aquí: es public/zodk-planeta-noche.png tal
# cual, el de producción (el usuario pidió no tocar el modo oscuro). Solo día.
SW, SH = render(False, "zodk-planeta-sprite.png")
assert len(PAL) <= 256, f"paleta de {len(PAL)} colores, no cabe en PNG-8"

# El dron tampoco se genera aquí (SVG de diseño en public/zodk-dron*.svg).

print(f"sprite día: {SW}x{SH} px, {len(PAL)} colores")
