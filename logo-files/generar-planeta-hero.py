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

El dron del hero (Bayraktar TB3) ya NO sale de aquí: es una foto tal cual en
`public/zodk-dron.png` (sin versión de noche propia). Este script solo genera
los dos PNG del planeta.

    python3 generar-planeta-hero.py
    python3 generar-planeta-hero.py --frame 17 prueba.png   # un solo fotograma
"""
import colorsys
import math
import sys
from mapa_tierra import GRID_W, GRID_H, ROWS
from luces import LW, LH, ROWS as LUZ_ROWS
from elev import elev as _elev, W as ELEV_W, H as ELEV_H
from png8 import write_rgba


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

# --------------------------------------------------------------- paletas
OCEAN = (0x36, 0x7a, 0xc0)          # (retro) azul medio de referencia
OCEAN_COAST   = (0x5b, 0xd0, 0xe6)  # turquesa vivo junto a la costa (el "punch" alegre)
OCEAN_SHALLOW = (0x43, 0x8f, 0xc6)  # plataforma continental
OCEAN_DEEP    = (0x1d, 0x50, 0x8c)  # océano profundo
LAND  = (0x54, 0xa2, 0x59)
ICE   = (0xdb, 0xe3, 0xec)
SPACE = (0x05, 0x06, 0x0a)
ATMO  = (0xbc, 0xdc, 0xff)
CITY_DARK  = (0x0d, 0x17, 0x24)     # marca de ciudad en el lado de día
COAST_COL  = (0x0e, 0x18, 0x13)     # línea de costa, casi negra (opción 3: sin fronteras políticas)
ROCK       = (0x8b, 0x84, 0x78)     # roca de media/alta montaña
SNOW       = (0xec, 0xf0, 0xf4)     # nieve de cumbre

# Biomas de tierra (aprox. por latitud + cajas de desierto + un poco de ruido).
BIOME_COLS = [
    (0x64, 0xb8, 0x62),   # 0 templado (claro y alegre, algo menos saturado que antes)
    (0x3d, 0x93, 0x46),   # 1 selva / tropical húmedo
    (0xce, 0xb8, 0x82),   # 2 desierto (arena)
    (0xb8, 0xc9, 0x5f),   # 3 estepa / sabana seca
    (0x3c, 0x74, 0x58),   # 4 boreal / taiga
    (0xbf, 0xc7, 0xca),   # 5 tundra (frío, gris pálido)
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
# El sprite ya no es una tira en una sola fila: con más resolución por
# fotograma Y más fotogramas, una fila se iría de largo más allá de lo que
# aguanta una textura de GPU (~8192 px). Se reparte en una REJILLA de
# GRID_COLS x GRID_ROWS fotogramas; el CSS anima background-position con un
# @keyframes explícito (uno por fotograma), no con steps() sobre un solo eje.
COLS      = 400        # ancho del fotograma, en px (1 px = 1 celda) — antes 280
RADIUS    = 195.0      # radio de la esfera, en celdas — antes 143
CDOWN     = 0.92        # fracción del radio que se dibuja hacia abajo
TILT      = 20.0        # latitud del sub-observador (0 = ecuador de frente)
FRAMES    = 60          # fotogramas de la rotación — antes 28, giro más fluido
GRID_COLS = 15          # fotogramas por fila de la rejilla del sprite
MAPRES    = 1           # submuestreo del mapa (1440x720 -> 1 = resolución nativa, 0,25°)
SHADES    = 16          # escalones de brillo del día

SUN_DEG = (-46.0, -12.0)       # (azimut desde arriba, elevación)
SUN_Z   = 0.56                 # empuje del sol hacia el observador
TERM_A, TERM_B = -0.34, 0.60   # borde del terminador
NIGHT   = 0.22                 # brillo mínimo en el lado en sombra (día)
LIMB_K  = 0.23                 # oscurecimiento del borde
LIMB_AA = 1.3                  # semiancho (en px) del suavizado del borde del disco

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
COAST2 = [bytearray(MW) for _ in range(MH)]         # 2ª celda de tierra adentro (línea más gruesa)
COAST3 = [bytearray(MW) for _ in range(MH)]         # 3ª celda: ensancha más y evita huecos por sub-muestreo
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

# Segundo y tercer anillo (celdas más adentro) para engrosar la línea de costa
# Y, sobre todo, para que no se salte por sub-muestreo: con un anillo de 1 sola
# celda, en las zonas donde la proyección comprime más (lejos del centro del
# disco) un píxel puede caer justo entre medias y "perderse" el anillo entero,
# dejando huecos sueltos en la línea. Ensanchar a 3 celdas lo hace más robusto.
for r in range(MH):
    for c in range(MW):
        if _land[r][c] and not COAST[r][c]:
            for dr, dcx in _N4:
                rr, cc = r + dr, (c + dcx) % MW
                if 0 <= rr < MH and _land[rr][cc] and COAST[rr][cc]:
                    COAST2[r][c] = 1
                    break
for r in range(MH):
    for c in range(MW):
        if _land[r][c] and not COAST[r][c] and not COAST2[r][c]:
            for dr, dcx in _N4:
                rr, cc = r + dr, (c + dcx) % MW
                if 0 <= rr < MH and _land[rr][cc] and COAST2[rr][cc]:
                    COAST3[r][c] = 1
                    break

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

# ------------------------------------- relieve: hillshade + roca + nieve de cumbre
# Precalculado por celda del DEM (0.5°), independiente del fotograma:
#   HS       -> multiplicador de brillo (128 = x1.0), laderas al sol claras
#   ROCKAMT  -> cuánta roca gris se mezcla en media/alta montaña (0-200)
#   SNOWAMT  -> cuánta nieve, solo si es alto Y sobresale del entorno (cumbre)
HS = [bytearray(ELEV_W) for _ in range(ELEV_H)]
ROCKAMT = [bytearray(ELEV_W) for _ in range(ELEV_H)]
SNOWAMT = [bytearray(ELEV_W) for _ in range(ELEV_H)]
_dd = 180.0 / ELEV_H
for r in range(ELEV_H):
    lat = 90.0 - (r + 0.5) / ELEV_H * 180.0
    sl = 5400.0 - abs(lat) * 66.0            # línea de nieve (baja hacia los polos)
    for c in range(ELEV_W):
        lon = (c + 0.5) / ELEV_W * 360.0 - 180.0
        e = _elev(lat, lon)
        ex = _elev(lat, lon + _dd) - _elev(lat, lon - _dd)
        ez = _elev(lat + _dd, lon) - _elev(lat - _dd, lon)
        k = 900.0
        nl = math.sqrt(ex * ex + ez * ez + k * k) or 1.0
        hs = (ex * 0.6 - ez * 0.6 + k * 0.75) / nl      # luz desde el NO
        # sin sobre-iluminar (si no, el desierto de media altura se pone neón)
        m = 1.0 if e < 250 else max(0.62, min(1.16, 0.58 + hs * 0.58))
        HS[r][c] = max(1, min(255, (int(m * 128) // 10) * 10))     # a pasos, menos bandas
        if e > 1400:
            ROCKAMT[r][c] = min(180, (int((e - 1400) / 3400.0 * 255) // 45) * 45)
        around = (_elev(lat + 2, lon) + _elev(lat - 2, lon)
                  + _elev(lat, lon + 2) + _elev(lat, lon - 2)) / 4.0
        relief = e - around
        sa = 0.0
        if e > sl and relief > 200:                     # nieve de cumbre
            sa = min(1.0, (e - sl) / 900.0) * min(1.0, (relief - 200) / 500.0)
        latsnow = smooth(58.0, 75.0, abs(lat)) * 0.85   # el norte/sur, nevado
        SNOWAMT[r][c] = (int(min(1.0, max(sa, latsnow)) * 215) // 28) * 28


def _ecell(lat, lon):
    r = int((90.0 - lat) / 180.0 * ELEV_H)
    r = 0 if r < 0 else ELEV_H - 1 if r >= ELEV_H else r
    return r, int((lon + 180.0) / 360.0 * ELEV_W) % ELEV_W


# ------------------------------------------------ rampas con cambio de tono
# Pixel art "de ilustración": sombrear no es mezclar hacia negro. Cada escalón
# de la rampa oscurece Y gira el tono hacia azul-violeta (sombras frías, más
# saturadas); cada escalón hacia la luz lo gira hacia amarillo (luces cálidas,
# menos saturadas). Así el verde oscuro tira a verde azulado y el claro a lima.
STEP        = 0.84                 # cada escalón multiplica el brillo por esto
_LNSTEP     = -math.log(STEP)
HUE_SHADOW  = 250.0 / 360.0        # hacia dónde gira la sombra (azul-violeta)
HUE_LIGHT   = 55.0 / 360.0         # hacia dónde gira la luz (amarillo)
HUE_STEP    = 6.0 / 360.0          # giro de tono por escalón
HUE_MAX     = 26.0 / 360.0         # giro máximo total
SAT_SHADOW  = 0.03                 # saturación que gana cada escalón de sombra
SAT_SH_MAX  = 0.10                 # tope de saturación ganada (si no, el mar de noche chilla)
SAT_LIGHT   = 0.06                 # saturación que pierde cada escalón de luz
_RAMP = {}


def _hue_toward(h, target, amt):
    d = (target - h + 0.5) % 1.0 - 0.5          # camino más corto, -0.5..0.5
    if abs(d) <= amt:
        return target
    return (h + math.copysign(amt, d)) % 1.0


def _hue_shadow(h, amt):
    # Verdes, amarillos verdosos y azules giran "hacia delante" (verde -> verde
    # azulado -> azul); solo los cálidos de verdad (arena, roca, rojos) giran
    # hacia atrás pasando por el rojo. Por el camino corto, la estepa (72°)
    # acababa granate en el lado de sombra.
    if 60.0 / 360.0 <= h <= HUE_SHADOW:
        return min(h + amt, HUE_SHADOW)
    # (a mitad de velocidad: a giro completo el desierto en sombra quedaba óxido)
    back = (h - HUE_SHADOW) % 1.0
    return (h - min(amt * 0.5, back)) % 1.0


def ramp(col, k, hue_mul=1.0):
    """Color `col` desplazado `k` escalones (k<0 sombra, k>0 luz). `hue_mul`
    escala el giro de tono (el mar gira menos: si no, de noche se va a añil)."""
    key = (int(col[0]), int(col[1]), int(col[2]), k, hue_mul)
    hit = _RAMP.get(key)
    if hit:
        return hit
    h, s, v = colorsys.rgb_to_hsv(key[0] / 255.0, key[1] / 255.0, key[2] / 255.0)
    if k < 0:
        if s < 0.12:
            h = 225.0 / 360.0                    # grises: sombra fría, no rosada
        h = _hue_shadow(h, min(HUE_MAX, -k * HUE_STEP) * hue_mul)
        s = min(1.0, s + min(SAT_SH_MAX, -k * SAT_SHADOW) * hue_mul)
        v *= STEP ** -k
    elif k > 0:
        h = _hue_toward(h, HUE_LIGHT, min(HUE_MAX, k * HUE_STEP) * hue_mul)
        s = max(0.0, s - k * SAT_LIGHT)
        v = min(1.0, v / STEP ** k)
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    out = (r * 255.0, g * 255.0, b * 255.0)
    _RAMP[key] = out
    return out


# ------------------------------------------------ relieve a 0,25° y en bandas
# El DEM viene a 0,5°; se interpola bilineal a la resolución del mapa para que
# las crestas no salgan en bloques de 2x2, y el sombreado se reduce a escalones
# ENTEROS de la rampa (bandas nítidas, sin punteado) en vez del multiplicador
# continuo de antes, que con la costa tan marcada se veía blando.
MTN_CONTRAST = 1.5                 # >1: más escalones entre ladera al sol y en sombra


def _elev_bi(lat, lon):
    fr = (90.0 - lat) / 180.0 * ELEV_H - 0.5
    fc = (lon + 180.0) / 360.0 * ELEV_W - 0.5
    r0, c0 = math.floor(fr), math.floor(fc)
    tr, tc = fr - r0, fc - c0
    r0 = 0 if r0 < 0 else ELEV_H - 1 if r0 >= ELEV_H else r0
    r1 = r0 + 1 if r0 + 1 < ELEV_H else r0
    c0 %= ELEV_W
    c1 = (c0 + 1) % ELEV_W
    lat0 = 90.0 - (r0 + 0.5) * 180.0 / ELEV_H
    lat1 = 90.0 - (r1 + 0.5) * 180.0 / ELEV_H
    lon0 = (c0 + 0.5) * 360.0 / ELEV_W - 180.0
    lon1 = (c1 + 0.5) * 360.0 / ELEV_W - 180.0
    a = _elev(lat0, lon0) * (1 - tc) + _elev(lat0, lon1) * tc
    b = _elev(lat1, lon0) * (1 - tc) + _elev(lat1, lon1) * tc
    return a * (1 - tr) + b * tr


MTNK = [bytearray(MW) for _ in range(MH)]           # escalón de relieve + 8
_md = 180.0 / MH
for r in range(MH):
    lat = 90.0 - (r + 0.5) * _md
    for c in range(MW):
        if not _land[r][c]:
            MTNK[r][c] = 8
            continue
        lon = (c + 0.5) * _md - 180.0
        e = _elev_bi(lat, lon)
        if e < 250:
            MTNK[r][c] = 8
            continue
        ex = (_elev_bi(lat, lon + _md) - _elev_bi(lat, lon - _md)) * 2.0
        ez = (_elev_bi(lat + _md, lon) - _elev_bi(lat - _md, lon)) * 2.0
        kk = 900.0
        nl = math.sqrt(ex * ex + ez * ez + kk * kk) or 1.0
        hs = (ex * 0.6 - ez * 0.6 + kk * 0.75) / nl       # luz desde el NO
        m = max(0.62, min(1.16, 0.58 + hs * 0.58))
        MTNK[r][c] = 8 + max(-4, min(2, round(math.log(m) / _LNSTEP * MTN_CONTRAST)))


# ------------------------------------------------------- copas de árbol
# La textura "de ilustración": en vez de ruido, racimos con forma. Copas
# redondas repartidas sobre la ESFERA (rejilla con jitter, espaciado constante
# en grados de arco, no de longitud: no se aplastan hacia el norte), pintadas
# de norte a sur para que las de abajo se monten sobre las de arriba como en
# un bosque dibujado. Cada celda guarda qué parte de copa le toca:
#   0 hueco entre copas, 1 borde en sombra (abajo-dcha), 2 cuerpo, 3 luz (arriba-izda)
# Viven en el mapa (0,25°), así que giran con el planeta como la costa.
CROWN_SP   = 1.0                   # separación media entre copas, en grados de arco
CROWN_R    = (0.55, 0.78)          # radio relativo a CROWN_SP (min, max)
_LX, _LY   = -0.70, 0.71           # hacia la luz, en (este, norte): el NO
CROWN = [bytearray(MW) for _ in range(MH)]
CROWN_U = [bytearray(MW) for _ in range(MH)]        # azar de la copa (densidad por bioma)

# Franja de mezcla entre biomas: en vez de pasar de un bioma a otro con un
# difuminado estrecho de color, una franja ancha (unos ±MEZCLA_R celdas) donde
# los dos se mezclan A MANCHAS: toques verdes que se van aclarando hacia el
# desierto y toques áridos que se meten en la selva, más o menos según la
# proporción de cada bioma alrededor. Las manchas salen de umbralizar un ruido
# de 1-2° contra esa proporción (mismo ruido a los dos lados de la frontera:
# sin costura). MIXBIO = bioma que le toca a cada celda; las copas toman el de
# su centro (copa entera, no partida). Colores planos por bioma: las manchas
# ya hacen de transición, no hace falta difuminar.
MEZCLA_R = 9                           # radio de la ventana, en celdas (~2,25°)
MIXBIO = [bytearray(BIOME[r]) for r in range(MH)]
random.seed(4711)
_MN = [(n, [[random.random() for _ in range(MW // n)] for _ in range(MH // n + 2)])
       for n in (6, 3)]


def _mix_noise(r, c):
    tot = 0.0
    for (n, g), w in zip(_MN, (0.65, 0.35)):
        fr, fc = r / n, c / n
        r0, c0 = int(fr), int(fc)
        tr, tc = fr - r0, fc - c0
        tr, tc = tr * tr * (3 - 2 * tr), tc * tc * (3 - 2 * tc)
        wn = len(g[0])
        c1 = (c0 + 1) % wn
        a = g[r0][c0 % wn] * (1 - tc) + g[r0][c1] * tc
        b = g[r0 + 1][c0 % wn] * (1 - tc) + g[r0 + 1][c1] * tc
        tot += (a * (1 - tr) + b * tr) * w
    return tot


# Tablas de suma acumulada (una por bioma + una de tierra), con la longitud
# ampliada MEZCLA_R celdas por cada lado para que la ventana dé la vuelta en la
# línea de cambio de fecha. Filas como array('i'): 7 tablas de ~1M enteros.
from array import array
from itertools import accumulate
from operator import add

_PADW = MW + 2 * MEZCLA_R


def _sat(match):
    prev = array("i", bytes(4 * (_PADW + 1)))
    rows = [prev]
    for r in range(MH):
        lab = BIOME[r]
        ln = _land[r]
        ind = [0] + [1 if ln[c % MW] and match(lab[c % MW]) else 0
                     for c in range(-MEZCLA_R, MW + MEZCLA_R)]
        prev = array("i", map(add, prev, accumulate(ind)))
        rows.append(prev)
    return rows


_SAT_B = [_sat(lambda v, k=k: v == k) for k in range(6)]
_SAT_L = _sat(lambda v: True)


def _win(S, i0, i1, j0, j1):
    return S[i1][j1] - S[i0][j1] - S[i1][j0] + S[i0][j0]


for r in range(MH):
    i0, i1 = max(0, r - MEZCLA_R), min(MH, r + MEZCLA_R + 1)
    for c in range(MW):
        if not _land[r][c]:
            continue
        j0, j1 = c, c + 2 * MEZCLA_R + 1               # (columnas ya desplazadas por el relleno)
        own = BIOME[r][c]
        tot = _win(_SAT_L, i0, i1, j0, j1)
        if _win(_SAT_B[own], i0, i1, j0, j1) == tot:
            continue                                     # ventana de un solo bioma: nada que mezclar
        cnt = [_win(S, i0, i1, j0, j1) for S in _SAT_B]
        ka = max(range(6), key=cnt.__getitem__)
        kb = max((k for k in range(6) if k != ka), key=cnt.__getitem__)
        lo, hi = min(ka, kb), max(ka, kb)
        fh = cnt[hi] / float(cnt[ka] + cnt[kb])
        MIXBIO[r][c] = hi if smooth(0.25, 0.75, _mix_noise(r, c)) < fh else lo
del _SAT_B, _SAT_L
CROWN_BIO = [bytearray(MW) for _ in range(MH)]

random.seed(20260913)
_crowns = []
_nb = int(180.0 / CROWN_SP)
for _i in range(_nb):
    _lat0 = -90.0 + _i * CROWN_SP
    _nlon = max(1, round(360.0 * math.cos(math.radians(_lat0 + CROWN_SP / 2)) / CROWN_SP))
    for _j in range(_nlon):
        clat = _lat0 + random.uniform(0.1, 0.9) * CROWN_SP
        clon = -180.0 + (_j + random.uniform(0.1, 0.9)) * 360.0 / _nlon
        gr_, gc_ = _mcell(clat, clon)
        gr_ = 0 if gr_ < 0 else MH - 1 if gr_ >= MH else gr_
        if GRID[gr_][gc_ % MW] == 0:
            continue
        cb = MIXBIO[gr_][gc_ % MW]
        _crowns.append((clat, clon, CROWN_SP * random.uniform(*CROWN_R),
                        random.randrange(256), cb))
_crowns.sort(key=lambda t: -t[0])                    # norte primero, sur encima
for clat, clon, rad, u, cb in _crowns:
    cosl = max(0.05, math.cos(math.radians(clat)))
    r0 = int((90.0 - (clat + rad)) / _md)
    r1 = int((90.0 - (clat - rad)) / _md)
    c0 = int((clon - rad / cosl + 180.0) / _md)
    c1 = int((clon + rad / cosl + 180.0) / _md)
    for r in range(max(0, r0), min(MH - 1, r1) + 1):
        dy = (90.0 - (r + 0.5) * _md - clat) / rad
        for cc in range(c0, c1 + 1):
            c = cc % MW
            if not _land[r][c]:
                continue
            dx = ((cc + 0.5) * _md - 180.0 - clon) * cosl / rad
            d2 = dx * dx + dy * dy
            if d2 > 1.0:
                continue
            lit = dx * _LX + dy * _LY
            if lit > 0.28 and d2 < 0.62:
                code = 3
            elif lit < -0.30 and d2 > 0.30:
                code = 1
            else:
                code = 2
            CROWN[r][c] = code
            CROWN_U[r][c] = u
            CROWN_BIO[r][c] = cb

# Por bioma: densidad de copas (0-1) y escalón de rampa de (hueco, borde, cuerpo, luz).
#            templado       selva          desierto      estepa         boreal         tundra
CROWN_DENS = (0.92,          1.0,           0.0,          0.30,          0.88,          0.0)
CROWN_K    = ((-2, -1, 0, 1), (-2, -1, 0, 1), (0, 0, 0, 0), (0, -2, -1, 0), (-2, -1, 0, 1), (0, 0, 0, 0))
# Manchas a gran escala (unos 2-6°): dentro de un mismo bioma alterna bosque
# cerrado con claros (pradera, cultivos) donde las copas se aclaran, los huecos
# dejan de ser sombra y el suelo tira a verde amarillento. Sin esto, zonas
# enormes como EE. UU. o Europa salían como una alfombra uniforme de copas.
#            templado  selva  desierto  estepa  boreal  tundra
PATCH_VAR = (0.80,     0.25,  0.0,      0.5,    0.40,   0.0)   # cuánto aclaran los claros
MEADOW    = (0x9d, 0xbf, 0x6c)         # suelo de los claros del templado
random.seed(777)
_PN = [(n, [[random.random() for _ in range(MW // n)] for _ in range(MH // n + 2)])
       for n in (24, 9)]


def _patch_noise(r, c):
    tot = 0.0
    for (n, g), w in zip(_PN, (0.68, 0.32)):
        fr, fc = r / n, c / n
        r0, c0 = int(fr), int(fc)
        tr, tc = fr - r0, fc - c0
        tr, tc = tr * tr * (3 - 2 * tr), tc * tc * (3 - 2 * tc)
        wn = len(g[0])
        c1 = (c0 + 1) % wn                         # da la vuelta en la línea de cambio de fecha
        a = g[r0][c0 % wn] * (1 - tc) + g[r0][c1] * tc
        b = g[r0 + 1][c0 % wn] * (1 - tc) + g[r0 + 1][c1] * tc
        tot += (a * (1 - tr) + b * tr) * w
    return tot


PATCH = [bytearray(MW) for _ in range(MH)]         # 255 = bosque cerrado, 0 = claro
for r in range(MH):
    for c in range(MW):
        if _land[r][c]:
            PATCH[r][c] = round(smooth(0.30, 0.68, _patch_noise(r, c)) * 255)


# ----------------------------------------------------------------- dunas
# Misma idea que las copas pero para el desierto: dunas en media luna
# (barjanes) repartidas sobre la esfera, con la cresta perpendicular a la luz:
# cara al sol (NO) clara, cara de sotavento (SE) en sombra, cuernos curvados
# hacia la sombra. Se pintan de norte a sur (las de abajo tapan a las de
# arriba). Solo en celdas de bioma desierto y en llano (en montaña manda el
# relieve). Las manchas grandes de PATCH separan "mares de dunas" (erg, arena
# cálida y dunas densas) de llanuras de grava (reg, más gris, dunas sueltas),
# para que el Sáhara no sea una alfombra uniforme.
#   DUNE: 0 nada, 1 sombra fuerte (sotavento), 2 sombra suave, 3 cresta al sol
DUNE_SP   = 1.65                   # separación media entre dunas, en grados de arco
DUNE_LEN  = (0.80, 1.30)           # semilongitud de la cresta, en grados
DUNE_BEND = 0.55                   # curvatura de la media luna (grados en los cuernos)
DUNE_LIT  = 0.30                   # ancho de la cara al sol, en grados
DUNE_SH   = 0.42                   # ancho de la cara en sombra, en grados
DUNE_K    = (0, -2, -1, 1)         # escalón de rampa por código
ERG = (0xdc, 0xb6, 0x76)           # arena de mar de dunas (más cálida)
REG = (0xc2, 0xb0, 0x8e)           # llanura de grava (más gris)
DUNE = [bytearray(MW) for _ in range(MH)]

random.seed(20260914)
_dunes = []
_nb = int(180.0 / DUNE_SP)
for _i in range(_nb):
    _lat0 = -90.0 + _i * DUNE_SP
    _nlon = max(1, round(360.0 * math.cos(math.radians(_lat0 + DUNE_SP / 2)) / DUNE_SP))
    for _j in range(_nlon):
        dlat = _lat0 + random.uniform(0.1, 0.9) * DUNE_SP
        dlon = -180.0 + (_j + random.uniform(0.1, 0.9)) * 360.0 / _nlon
        gr_, gc_ = _mcell(dlat, dlon)
        gr_ = 0 if gr_ < 0 else MH - 1 if gr_ >= MH else gr_
        gc_ %= MW
        if not _land[gr_][gc_] or BIOME[gr_][gc_] != 2:
            continue
        if random.random() > 0.15 + 0.85 * PATCH[gr_][gc_] / 255.0:
            continue                                 # reg: pocas dunas sueltas
        ang = math.atan2(-_LX, _LY) + math.radians(random.uniform(-22, 22))
        _dunes.append((dlat, dlon, ang, random.uniform(*DUNE_LEN)))
_dunes.sort(key=lambda t: -t[0])
_reach = DUNE_LEN[1] + DUNE_SH + DUNE_BEND
for dlat, dlon, ang, hl in _dunes:
    ax, ay = math.cos(ang), math.sin(ang)            # eje de la cresta (este, norte)
    nx, ny = -ay, ax                                 # normal
    if nx * _LX + ny * _LY < 0:
        nx, ny = -nx, -ny                            # normal apuntando hacia la luz
    cosl = max(0.05, math.cos(math.radians(dlat)))
    r0 = int((90.0 - (dlat + _reach)) / _md)
    r1 = int((90.0 - (dlat - _reach)) / _md)
    c0 = int((dlon - _reach / cosl + 180.0) / _md)
    c1 = int((dlon + _reach / cosl + 180.0) / _md)
    for r in range(max(0, r0), min(MH - 1, r1) + 1):
        dy = 90.0 - (r + 0.5) * _md - dlat
        for cc in range(c0, c1 + 1):
            c = cc % MW
            if not _land[r][c] or BIOME[r][c] != 2:
                continue
            dx = ((cc + 0.5) * _md - 180.0 - dlon) * cosl
            t = (dx * ax + dy * ay) / hl                 # -1..1 a lo largo de la cresta
            if t <= -1.0 or t >= 1.0:
                continue
            q = dx * nx + dy * ny + DUNE_BEND * t * t    # >0 lado al sol, <0 sotavento
            taper = 1.0 - t * t
            if 0.0 <= q < DUNE_LIT * (0.4 + 0.6 * taper):
                DUNE[r][c] = 3
            elif -DUNE_SH * taper < q < 0.0:
                DUNE[r][c] = 1 if q > -DUNE_SH * taper * 0.6 else 2

# Nieve y roca van "ganando" copas ENTERAS según sube su cantidad (cada copa
# tiene su umbral al azar, CROWN_U), y los huecos entre copas al final (nieve)
# o al principio (roca: asoma entre los árboles). Transiciones a racimos, en
# vez de mezcla de color o de puntitos sueltos de 1 px.
SNOW_GAP = 0.80                    # cantidad de nieve a partir de la cual cubre los huecos
ROCK_GAP = 0.15                    # cantidad de roca a partir de la cual asoma en los huecos

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
    """
..###....
.#####.##
##...####
##ooo.###
.##oooo##
..##oo##.
""",
    """
...##..###..
..####.####.
.###......##
##.........#
##oooooo..##
.##oooooo##.
..##ooo###..
""",
    """
....##...
..######.
.###..###
##......#
##ooo..##
.##oooo##
..##oo##.
""",
    """
..###...##..
.#####.####.
##...#....##
##.........#
##ooooo...##
.##oooooo##.
..###oo###..
""",
]

CLOUD_W_PICK = list(range(len(CLOUD_ART)))


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
        random.uniform(0.62, 0.92),      # escala por instancia (nubes pequeñas)
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
# PNG en color real (sin paleta): antes esto era un PNG-8 indexado a 256
# colores y había que "sembrar" con cuidado qué tonos se reservaban para no
# quedarse sin hueco (banding/tonos sucios al llenarse). Con las mejoras de
# calidad (degradado de mar, atardecer, brillo) el catálogo de colores creció
# mucho más allá de 256, así que se deja de indexar: cada píxel lleva su RGBA
# exacto. Pesa algo más el PNG pero el pixel art sale limpio siempre.
TRANSPARENT = (0, 0, 0, 0)


def rgba(rgb):
    return (max(0, min(255, round(rgb[0]))),
            max(0, min(255, round(rgb[1]))),
            max(0, min(255, round(rgb[2]))),
            255)


# ------------------------------------------------------------- proyección
# El límite se ensancha un poco (LIMB_AA px) más allá del radio real para poder
# suavizar el borde del disco en vez de cortarlo en seco al píxel.
_R_IN  = 1.0 - LIMB_AA / RADIUS
_R_OUT = 1.0 + LIMB_AA / RADIUS
_RR_MAX = _R_OUT * _R_OUT


def _project_xy(x, y):
    px = (x - CX) / RADIUS
    py = (y - CY) / RADIUS
    rr = px * px + py * py
    if rr > _RR_MAX:
        return None
    pz  = math.sqrt(max(0.0, 1.0 - min(rr, 1.0)))
    lat = math.degrees(math.asin(max(-1.0, min(1.0, -py * COST + pz * SINT))))
    v   = py * SINT + pz * COST
    lon = math.degrees(math.atan2(px, v))
    return px, py, pz, rr, lat, lon


def _project(sx, sy):
    return _project_xy(sx + 0.5, sy + 0.5)


def terrain_at(sx, sy, lon0):
    p = _project(sx, sy)
    if p is None:
        return None
    gr, gc = _mcell(p[4], p[5] + lon0)
    gr = 0 if gr < 0 else MH - 1 if gr >= MH else gr
    return GRID[gr][gc % MW]


def _surface_at(lat, lon):
    """(terrain, surf, tex_k, gr, gc) de un punto geográfico, sin sombra.
    tex_k = escalones de rampa que pone la textura (copas, relieve)."""
    gr, gc = _mcell(lat, lon)
    gr = 0 if gr < 0 else MH - 1 if gr >= MH else gr
    gc %= MW
    terrain = GRID[gr][gc]
    tex_k = 0
    if terrain == 0:                       # mar: turquesa en costa -> plataforma -> abisal
        sd = SEADIST[gr][gc]
        if sd <= 1:
            surf = OCEAN_COAST
        elif sd <= 3:
            surf = mix(OCEAN_COAST, OCEAN_SHALLOW, (sd - 1) / 2.0)
        else:
            surf = mix(OCEAN_SHALLOW, OCEAN_DEEP, min(1.0, (sd - 3) / 3.0))
    elif terrain == 2:                     # hielo
        surf = ICE
    else:                                  # tierra: bioma + copas + relieve (la línea de costa
        bg = MIXBIO[gr][gc]                # se pinta aparte, en cell_index: si se mete aquí,
        pv = 1.0 - PATCH[gr][gc] / 255.0   # el AA de costa la diluye promediándola con el mar)
        code = CROWN[gr][gc]
        u = (CROWN_U[gr][gc] + 0.5) / 256.0
        b = CROWN_BIO[gr][gc] if code else bg
        dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv)      # claros: menos copas
        if code and u >= dens:
            b, tex_k = bg, 0               # copa descartada (bioma poco denso o claro): suelo liso
        elif code == 0:                    # hueco: sombra en bosque cerrado, suelo en claros
            b = bg
            dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv)
            tex_k = round(CROWN_K[b][0] * smooth(0.45, 0.85, dens))
        else:
            tex_k = CROWN_K[b][code]
        surf = BIOME_COLS[b]               # plano: la franja de mezcla hace de transición
        claro = PATCH_VAR[b] * pv
        if b == 0 and claro:
            surf = mix(surf, MEADOW, claro * 0.75)
        mk = MTNK[gr][gc] - 8
        if b == 2:                         # desierto: erg/reg por manchas + dunas en llano
            surf = mix(surf, mix(REG, ERG, PATCH[gr][gc] / 255.0), 0.6)
            if mk == 0:
                tex_k = DUNE_K[DUNE[gr][gc]]
        er, ec = _ecell(lat, lon)
        _ra, _sa = ROCKAMT[er][ec] / 180.0, SNOWAMT[er][ec] / 215.0
        if _sa and (_sa > SNOW_GAP if code == 0 else _sa > 0.05 + u * 0.55):
            surf = SNOW                    # copa nevada: conserva su sombreado de copa
            tex_k = (min(0, tex_k) if code else 0) + mk
        elif _ra and (_ra > ROCK_GAP if code == 0 else _ra > 0.35 + u * 0.6):
            surf, tex_k = ROCK, mk
        else:
            tex_k += mk
    return terrain, surf, tex_k, gr, gc


# Costa/limbo "en crudo": el mapa está a 0.5°/celda y el disco se mira con un
# radio de unas 143 celdas, así que un píxel de pantalla no siempre cae limpio
# dentro de una sola celda de mapa. Se sub-muestrea SOLO el anillo costero (los
# píxeles cuya celda ya venía marcada COAST/SEADIST==1) para mezclar tierra/mar
# en proporción en vez de dejar el escalón crudo del rasterizado.
_COAST_OFF = (-0.28, 0.28)


def _coast_aa(sx, sy, lon0, terrain, surf, tex_k, gr, gc):
    need = (terrain == 1 and COAST[gr][gc]) or (terrain == 0 and SEADIST[gr][gc] == 1)
    if not need:
        return surf, tex_k
    rs = gs = bs = ks = 0.0
    n = 0
    for oy in _COAST_OFF:
        for ox in _COAST_OFF:
            sp = _project_xy(sx + 0.5 + ox, sy + 0.5 + oy)
            if sp is None:
                continue
            _, _, _, _, slat, slon = sp
            _, ssurf, sk, _, _ = _surface_at(slat, slon + lon0)
            rs += ssurf[0]; gs += ssurf[1]; bs += ssurf[2]; ks += sk; n += 1
    if n == 0:
        return surf, tex_k
    return (rs / n, gs / n, bs / n), ks / n


# Línea de costa robusta a islas pequeñas: si solo se mira la celda del píxel
# central, una isla más pequeña que un píxel de pantalla puede "perderse" el
# anillo entero (el único punto de muestreo cae en su interior, o directamente
# en el mar) y queda sin línea — es justo el patrón "huecos sueltos y random"
# que se veía en el archipiélago filipino. Se comprueban 8 sub-muestras más
# dentro del píxel y se usa la más fuerte que aparezca.
_OUTLINE_OFF = (-0.33, 0.0, 0.33)


def _coast_line_mix(sx, sy, lon0, terrain, gr, gc, surf):
    if terrain == 0:
        return surf
    level = 3 if COAST[gr][gc] else 2 if COAST2[gr][gc] else 1 if COAST3[gr][gc] else 0
    if level < 3:
        for oy in _OUTLINE_OFF:
            for ox in _OUTLINE_OFF:
                if ox == 0.0 and oy == 0.0:
                    continue
                sp = _project_xy(sx + 0.5 + ox, sy + 0.5 + oy)
                if sp is None:
                    continue
                _, _, _, _, slat, slon = sp
                sgr, sgc = _mcell(slat, slon + lon0)
                sgr = 0 if sgr < 0 else MH - 1 if sgr >= MH else sgr
                sgc %= MW
                if GRID[sgr][sgc] == 0:
                    continue                    # cae en mar: no aporta anillo de tierra
                slvl = 3 if COAST[sgr][sgc] else 2 if COAST2[sgr][sgc] else 1 if COAST3[sgr][sgc] else 0
                if slvl > level:
                    level = slvl
                    if level == 3:
                        break
            if level == 3:
                break
    if level == 3:
        return mix(surf, COAST_COL, 0.84)
    if level == 2:
        return mix(surf, COAST_COL, 0.48)
    if level == 1:
        return mix(surf, COAST_COL, 0.20)
    return surf


def cell_index(sx, sy, lon0, night):
    p = _project(sx, sy)
    if p is None:
        return TRANSPARENT
    px, py, pz, rr, lat, lon = p
    lon += lon0
    dc = math.sqrt(rr)
    dth = _dither(sx, sy)

    terrain, surf, tex_k, gr, gc = _surface_at(lat, lon)
    surf, tex_k = _coast_aa(sx, sy, lon0, terrain, surf, tex_k, gr, gc)
    # Línea de costa: aparte del AA de arriba (que suaviza la transición
    # tierra/mar y diluiría la línea si se mezclara antes). Sub-muestreada
    # (ver _coast_line_mix) para no perderse islas más pequeñas que un píxel.
    surf = _coast_line_mix(sx, sy, lon0, terrain, gr, gc, surf)

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
        return rgba(col)

    # --- día
    lam = px * SX + py * SY + pz * SZ
    term_t = smooth(TERM_A, TERM_B, lam)
    bright = NIGHT + (1.0 - NIGHT) * term_t
    limb_t = smooth(0.72, 1.0, dc)
    limb = LIMB_K * limb_t
    if terrain == 2:
        limb *= 0.7
    bright *= 1.0 - limb
    # La luz global (terminador + limbo) se pasa a escalones de rampa y se le
    # suman los de la textura (copas, relieve). Se redondea a escalón ENTERO:
    # colores de paleta, no degradado. El Bayer solo rompe las bandas del
    # terminador y del limbo; copas y montañas quedan nítidas, sin punteado.
    term_edge = 1.0 - abs(term_t * 2.0 - 1.0)
    dither_w = max(term_edge, limb_t)
    kf = math.log(max(bright, 1e-3)) / _LNSTEP + tex_k
    k = math.floor(kf + 0.5 + (dth - 0.5) * 0.8 * dither_w)
    col = ramp(surf, k, 0.45 if terrain == 0 else 1.0)
    if dc > 0.93 and lam > 0.0:
        halo = smooth(0.93, 1.0, dc) * smooth(0.0, 0.45, lam)
        col = mix(col, ATMO, 0.3 * (math.floor(halo * 4 + 0.5 + (dth - 0.5) * 0.8) / 4))
    # AA del limbo: el disco ya no corta en seco al radio exacto, se apaga hacia
    # el color del fondo (SPACE, que es justo el fondo real de la portada) en
    # una banda de ±LIMB_AA px alrededor del borde real.
    if dc > _R_IN:
        coverage = 1.0 - smooth(_R_IN, _R_OUT, dc)
        if coverage < 1.0:
            col = mix(SPACE, col, coverage)
    return rgba(col)


def city_cells(lon0, night):
    """Celdas (sx, sy) -> color de las ciudades. De día: siempre punto oscuro.
    De noche: todas encendidas en ámbar."""
    ci_dark  = rgba(CITY_DARK)
    ci_light = rgba(GOLD[2])
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
            "b": rgba(mix(SPACE, C_BODY, min(1.0, t + 0.1))),
            "s": rgba(mix(SPACE, C_BASE, t)),
            "e": rgba(mix(SPACE, C_EDGE, max(0.7, t))),
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
GRID_ROWS = (FRAMES + GRID_COLS - 1) // GRID_COLS


def render(night, path, frames=None):
    """Sprite en rejilla. Con `frames=[f]` sale solo ese fotograma, suelto
    (para probar cambios sin rehacer los 60)."""
    todos = frames is None
    frames = range(FRAMES) if todos else frames
    sw, sh = (COLS * GRID_COLS, VIS * GRID_ROWS) if todos else (COLS, VIS)
    rows = [bytearray(sw * 4) for _ in range(sh)]
    for f in frames:
        lon0 = -f * 360.0 / FRAMES
        gx, gy = (f % GRID_COLS, f // GRID_COLS) if todos else (0, 0)
        xoff, yoff = gx * COLS, gy * VIS
        overlay = {} if night else cloud_cells(lon0)
        if night:                                   # de día, sin puntos de ciudad (de momento)
            overlay.update(city_cells(lon0, night))    # ciudades por encima de nubes
        for sy in range(VIS):
            row = rows[yoff + sy]
            for sx in range(COLS):
                c = overlay.get((sx, sy)) or cell_index(sx, sy, lon0, night)
                o = (xoff + sx) * 4
                row[o] = c[0]; row[o + 1] = c[1]; row[o + 2] = c[2]; row[o + 3] = c[3]
    write_rgba(path, sw, sh, rows)
    return sw, sh


# El sprite de NOCHE ya no se genera aquí: es public/zodk-planeta-noche.png tal
# cual, el de producción (el usuario pidió no tocar el modo oscuro). Solo día.
# El dron tampoco se genera aquí (foto en public/zodk-dron.png).
if len(sys.argv) >= 3 and sys.argv[1] == "--frame":
    _f = int(sys.argv[2])
    _out = sys.argv[3] if len(sys.argv) > 3 else f"prueba-f{_f}.png"
    SW, SH = render(False, _out, [_f])
    print(f"fotograma {_f}: {SW}x{SH} px -> {_out}")
else:
    SW, SH = render(False, "zodk-planeta-sprite.png")
    print(f"sprite día: {SW}x{SH} px, color real (sin paleta)")
