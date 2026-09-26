#!/usr/bin/env python3
"""Planeta de la portada de zodk.eu — la Tierra grande, hemisferio norte.

Proyección ortográfica de una esfera enorme (como el globo del logo pero a lo
grande), Polo Norte arriba, con inclinación ligera; se dibuja el casquete
visible y por debajo cae en sombra y se funde con el negro del hero. La máscara
tierra/mar/hielo sale de Natural Earth (mapa_tierra.py). Gira sobre el eje polar.

Día y noche, como el logo: la misma superficie, iluminada por el sol o por
la luna (paleta nocturna, ver noche()), y de noche con las luces de las
ciudades (light_cells()). La web lo pinta en un <canvas> que gira de forma
continua (src/scripts/planeta.js); aquí se exportan sus datos a public/planeta/.

    python3 generar-tierra.py                          # lo de la web -> public/planeta/
    python3 generar-tierra.py --frame 17 prueba.png   # un solo fotograma de prueba (--noche, --ambos)
    python3 generar-tierra.py --canvas carpeta/        # datos del <canvas> a otra carpeta
    python3 generar-tierra.py --sprite                 # el sprite antiguo (ya no se usa)
    python3 generar-tierra.py --nivel 2 carpeta/ [--zona S,N,O,E]
        # nivel de zoom (Proyecto Tierra, TIERRA-WIP.md): el mapa a 2x la
        # resolución (16 px/grado) en teselas carpeta/n1/F-C.png, con las costas
        # de Natural Earth 1:10m y el relieve fino; amplía la LUT y los datos
        # de carpeta/ (que tiene que tener ya la base, de --canvas)
"""
import colorsys
import math
import sys
# Nivel de zoom (Proyecto Tierra): 1 = la base de siempre (8 px/grado, costas
# de ne_50m_land, mapa_tierra.py); K > 1 = K veces la resolución, con la
# máscara de rasterizar.py --nivel K (costas de 1:10m) y el relieve de
# elevacion-fina.py.
NIVEL = int(sys.argv[sys.argv.index("--nivel") + 1]) if "--nivel" in sys.argv else 1
if NIVEL == 1:
    from mapa_tierra import GRID_W, GRID_H, ROWS
else:
    GRID_W, GRID_H, ROWS = 2880 * NIVEL, 1440 * NIVEL, None
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
OCEAN_MID     = (0x4f, 0xb0, 0xd6)  # franja intermedia entre el turquesa y la plataforma
SEA_BANDS     = (2.4, 4.4)          # distancia a costa (celdas de 0,25°) donde acaba cada franja
SEA_WOBBLE    = 2.2                 # cuánto se ondulan los bordes de franja (celdas de 0,25°)
COAST_AA      = False               # mezcla tierra/mar en las celdas de costa (borde borroso)
LAND  = (0x54, 0xa2, 0x59)
ICE   = (0xdb, 0xe3, 0xec)          # hielo continental (Groenlandia, islas árticas)
PACK_OLD   = (0xe6, 0xee, 0xf5)     # banquisa: placa de hielo viejo (más blanca)
PACK_YOUNG = (0xbd, 0xd0, 0xe2)     # banquisa: hielo joven, más fino y azulado
SPACE = (0x05, 0x06, 0x0a)
ATMO  = (0xbc, 0xdc, 0xff)
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
    (15.5, 26.5, 51, 60.5), # Omán, Emiratos y este de Yemen (sin esto, estepa verde)
    (-1.5, 12.5, 40.5, 52), # Cuerno de África: Somalia, Yibuti, Ogadén (salía selva)
    (24, 40, 44, 66),       # meseta iraní
    (35, 48, 62, 112),      # Gobi / Taklamakán
    (18, 30, 66, 78),       # Thar
    (-30, -18, 11, 25),     # Kalahari / Namib
    (-32, -19, 122, 146),   # outback australiano
    (-24, -4, -81, -69),    # costa de Perú / Atacama
    (26, 40, -116, -101),   # SO de EE. UU. / N de México
    (-42, -30, -71, -64),   # Patagonia seca
]
# Sabanas dentro de la franja ecuatorial (que por latitud sale selva): pasan a
# estepa/sabana seca (bioma 3), con el mismo borde difuminado que los desiertos.
SABANAS = [     # (lat0, lat1, lon0, lon1)
    (-12, 5, 29.5, 42),     # África oriental: Kenia, Tanzania, Uganda (el Congo sigue selva)
]

# noche: la misma superficie que de día, vista a la luz de la luna. Cada color
# de día se pasa a su versión nocturna (menos saturado, frío y oscuro) y encima
# se aplica la misma rampa de luz, con la luna en vez del sol.
# Paleta "índigo contrastado" (P3, elegida frente a una gris y otra índigo más
# suave): mar azul profundo, tierra verde azulada, desierto plateado.
MOON_TINT = (0.40, 0.60, 1.0)       # color de la luz de luna
NOCHE_SAT = 0.80                    # saturación que conserva cada color
NOCHE_V   = 0.72                    # brillo de la cara a la luna respecto al día
# Brillo de atmósfera en el borde del disco (la línea que se ve en las fotos
# nocturnas desde la ISS): franjas de AIRGLOW_PX px desde el borde hacia
# dentro, con su mezcla. Todo alrededor, no depende de la luna.
AIRGLOW    = (0x62, 0xb4, 0xff)
AIRGLOW_PX = (1.5, 3.0)             # opción B (fina, azul) frente a sin brillo, ancha y turquesa
AIRGLOW_A  = (0.55, 0.25)
N_ATMO  = (0x3a, 0x5c, 0x8c)


def noche(col):
    r, g, b = col[0] / 255.0, col[1] / 255.0, col[2] / 255.0
    y = 0.299 * r + 0.587 * g + 0.114 * b
    return tuple((y + (x - y) * NOCHE_SAT) * t * NOCHE_V * 255.0
                 for x, t in zip((r, g, b), MOON_TINT))

# ------------------------------------------------------------ geometría
# El sprite ya no es una tira en una sola fila: con más resolución por
# fotograma Y más fotogramas, una fila se iría de largo más allá de lo que
# aguanta una textura de GPU (~8192 px). Se reparte en una REJILLA de
# GRID_COLS x GRID_ROWS fotogramas; el CSS anima background-position con un
# @keyframes explícito (uno por fotograma), no con steps() sobre un solo eje.
COLS      = 600        # ancho del planeta, en px — 280 -> 400 -> 600 (canvas, píxeles más finos)
RADIUS    = 292.5      # radio de la esfera, en px — 143 -> 195 -> 292.5
CDOWN     = 1.0         # fracción del radio que se dibuja hacia abajo (antes 0,92: en
                        # móvil el disco entero cabe en pantalla y se veía el corte)
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

# Luna llena casi de frente, algo arriba a la izquierda (opción C). Del mismo
# lado que el sol a propósito: copas, dunas y relieve llevan la luz horneada
# desde el NO, y con la luna por la derecha la textura contradecía a la esfera.
MOON_DEG = (-25.0, 15.0)
MOON_Z   = 0.9
N_NIGHT  = 0.06                # brillo mínimo en la cara sin luna


def _luz(deg, push):
    az, el = math.radians(deg[0]), math.radians(deg[1])
    x = math.sin(az) * math.cos(el)
    y = -math.cos(az) * math.cos(el)
    z = math.sin(el) + push
    n = math.sqrt(x * x + y * y + z * z)
    return x / n, y / n, z / n


SX, SY, SZ = _luz(SUN_DEG, SUN_Z)
MX, MY, MZ = _luz(MOON_DEG, MOON_Z)

T = math.radians(TILT)
SINT, COST = math.sin(T), math.cos(T)

# --------------------------------------------- máscara tierra/mar submuestreada
_K = {"o": 0, "l": 1, "i": 2}
_FULL = [bytearray(GRID_W) for _ in range(GRID_H)]
if NIVEL > 1:
    import os as _os
    with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)),
                            "tierra-fuentes", f"mascara-n{NIVEL}.bin"), "rb") as _fh:
        _b = _fh.read()
    for r in range(GRID_H):
        _FULL[r][:] = _b[r * GRID_W:(r + 1) * GRID_W]
    del _b
for r, spans in enumerate(ROWS or ()):
    row = _FULL[r]
    for a, b, k in spans:
        v = _K[k]
        for c in range(a, b + 1):
            row[c] = v

MH, MW = GRID_H // MAPRES, GRID_W // MAPRES
GRID = _FULL if MAPRES == 1 else [bytearray(MW) for _ in range(MH)]
for r in range(MH if MAPRES > 1 else 0):
    for c in range(MW):
        cnt = [0, 0, 0]
        for dr in range(MAPRES):
            src = _FULL[r * MAPRES + dr]
            for dc in range(MAPRES):
                cnt[src[c * MAPRES + dc]] += 1
        GRID[r][c] = cnt.index(max(cnt))


def _mcell(lat, lon):
    return (int((90.0 - lat) / 180.0 * MH), int((lon + 180.0) / 360.0 * MW))


# Escalas para que el resto de parámetros no dependa de la resolución:
#   KC    = celdas del mapa por cada celda de 0,25° (1 a 0,25°, 2 a 0,125°)
#   SCALE = píxeles del planeta respecto al de 400 px (1,5 con COLS = 600)
# Lo que debe medir lo mismo EN PÍXELES (copas, dunas, manchas de mezcla) se
# divide entre SCALE en grados; lo que debe medir lo mismo RESPECTO AL PLANETA
# (franjas del mar, franja de mezcla, claros) se mantiene en grados (x KC celdas).
# En los niveles de zoom, lo que mide lo mismo EN PÍXELES se hace NIVEL veces
# más pequeño en grados (las copas miden lo mismo en celdas del mapa, que a
# su zoom son ~1 px de pantalla); lo que va RESPECTO AL PLANETA, igual.
KC = MW // 1440
SCALE = COLS / 400.0 * NIVEL

# Estrecho de Gibraltar: el submuestreo une Iberia y Marruecos; se abre a mano
# una celda de mar (~1 grado, un pixel de canal). Con las costas de 1:10m (los
# niveles de zoom) ya está abierto.
if NIVEL == 1:
    _gr, _gc = _mcell(35.6, -5.5)
    for _c in (_gc - 1, _gc, _gc + 1):
        GRID[_gr][_c] = 0

# ------------------------------ costa, profundidad de mar y bioma (en el GRID)
import random
from collections import deque

DMAX = 8 * KC
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
_NC = 7 * KC                                       # celdas por nodo de ruido
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
            sab = max(min(lat - a0, a1 - lat, lon - o0, o1 - lon) for a0, a1, o0, o1 in SABANAS)
            if des > 2.0 or (des > -4.0 and nf * 9.0 < des):
                b = 2
            elif sab > 2.0 or (sab > -4.0 and nf * 9.0 < sab):
                b = 3
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

# Anillos de la línea de costa por distancia tierra adentro (en celdas):
# COAST = anillo oscuro, COAST2/COAST3 = los dos que lo suavizan hacia dentro.
# A 0,25° (KC=1) eran 1+1+1 celdas; a 0,125° el oscuro va de 2 celdas para que
# siga midiendo ~1 px de pantalla y el muestreo (sobre todo el vertical, que no
# tiene mipmaps) no se lo salte. Tres anillos también evitan huecos cuando la
# proyección comprime el mapa lejos del centro del disco.
# En los niveles de zoom, los mismos anillos en celdas (2, 3, 4): la costa
# sigue midiendo ~1-2 px a su zoom en vez de engordar con KC.
_T3, _T2, _T1 = (KC, KC + 1, KC + 2) if NIVEL == 1 else (2, 3, 4)
_LD = [bytearray(MW) for _ in range(MH)]
_dq2 = deque()
for r in range(MH):
    for c in range(MW):
        if COAST[r][c]:
            _LD[r][c] = 1
            _dq2.append((r, c))
while _dq2:
    r, c = _dq2.popleft()
    d = _LD[r][c]
    if d >= _T1:
        continue
    for dr, dcx in _N4:
        rr, cc = r + dr, (c + dcx) % MW
        if 0 <= rr < MH and _land[rr][cc] and not _LD[rr][cc]:
            _LD[rr][cc] = d + 1
            _dq2.append((rr, cc))
for r in range(MH):
    lr, c1, c2, c3 = _LD[r], COAST[r], COAST2[r], COAST3[r]
    for c in range(MW):
        d = lr[c]
        if d:
            c1[c] = 1 if d <= _T3 else 0
            c2[c] = 1 if _T3 < d <= _T2 else 0
            c3[c] = 1 if _T2 < d <= _T1 else 0
del _LD

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
LIGHT_SUB   = 3                    # la luz global (terminador, limbo) va en tercios de escalón:
                                   # con escalones enteros las franjas se notaban demasiado
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


# Relieve fino de los niveles de zoom: ETOPO1 a 24 px/grado
# (tierra-fuentes/etopo24.i16, de elevacion-fina.py), interpolado.
if NIVEL > 1:
    from array import array as _arr
    _EF = _arr("h")
    with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)),
                            "tierra-fuentes", "etopo24.i16"), "rb") as _fh:
        _EF.frombytes(_fh.read())
    if sys.byteorder != "little":
        _EF.byteswap()
    _EFW, _EFH = 8640, 4320

    def _elev_bi(lat, lon):
        fr = (90.0 - lat) * 24.0 - 0.5
        fc = (lon + 180.0) * 24.0 - 0.5
        r0, c0 = math.floor(fr), math.floor(fc)
        tr, tc = fr - r0, fc - c0
        r0 = 0 if r0 < 0 else _EFH - 1 if r0 >= _EFH else r0
        r1 = r0 + 1 if r0 + 1 < _EFH else r0
        c0 %= _EFW
        c1 = (c0 + 1) % _EFW
        a = _EF[r0 * _EFW + c0] * (1 - tc) + _EF[r0 * _EFW + c1] * tc
        b = _EF[r1 * _EFW + c0] * (1 - tc) + _EF[r1 * _EFW + c1] * tc
        return a * (1 - tr) + b * tr


# En los niveles de zoom, la pendiente se mide a RELIEVE_PASO celdas a cada
# lado (1 = la más fina; más = relieve más suavizado, "de dibujo").
RELIEVE_PASO = float(sys.argv[sys.argv.index("--relieve") + 1]) if "--relieve" in sys.argv else 1.0
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
        _dd = _md * RELIEVE_PASO
        ex = (_elev_bi(lat, lon + _dd) - _elev_bi(lat, lon - _dd)) * (0.5 / _dd)   # desnivel por grado
        ez = (_elev_bi(lat + _dd, lon) - _elev_bi(lat - _dd, lon)) * (0.5 / _dd)
        kk = 900.0
        nl = math.sqrt(ex * ex + ez * ez + kk * kk) or 1.0
        hs = (ex * 0.6 - ez * 0.6 + kk * 0.75) / nl       # luz desde el NO
        m = max(0.62, min(1.16, 0.58 + hs * 0.58))
        MTNK[r][c] = 8 + max(-4, min(2, round(math.log(m) / _LNSTEP * MTN_CONTRAST)))


# Roca y nieve de los niveles de zoom, con el relieve fino (usuario,
# 25-sep-2026: "pese a salir cadenas montañosas (ejemplo Pirineos) me
# gustaría que se representasen con nieve"). Las de la base (ROCKAMT,
# SNOWAMT) salen de celdas de 0,25°, cuya altura media se queda por debajo
# de la línea de nieve en las cordilleras estrechas (Pirineos, Alpes,
# Cáucaso...). Las mismas reglas que en la base y los mismos escalones, pero
# con la altura del punto, y el "sobresale del entorno" medido a 1° (en vez
# de 2°) para que las mesetas altas (Tíbet, Altiplano) no se vuelvan blancas.
# ETOPO1 a 2,5' interpolado y suavizado también rebaja las cumbres (el Aneto
# se queda en ~2560 m, las crestas de los Pirineos en 2200-2500): la línea de
# nieve va más baja que en la base (1960 m en los Pirineos, 1770 en los
# Alpes, 2760 en el Himalaya, 4300 en el ecuador) y cubre antes; y la roca
# empieza antes (1200 m), para que asome en las crestas entre los árboles.
NIEVE_FINA_L0, NIEVE_FINA_LK, NIEVE_FINA_RANGO = 4300.0, 55.0, 600.0
ROCA_FINA_E0, ROCA_FINA_RANGO = 1200.0, 3000.0


def _roca_nieve_fina(lat, lon):
    e = _elev_bi(lat, lon)
    ra = (min(180, (int((e - ROCA_FINA_E0) / ROCA_FINA_RANGO * 255) // 45) * 45) / 180.0
          if e > ROCA_FINA_E0 else 0.0)
    sl = NIEVE_FINA_L0 - abs(lat) * NIEVE_FINA_LK
    sa = 0.0
    if e > sl:
        around = (_elev_bi(lat + 1, lon) + _elev_bi(lat - 1, lon)
                  + _elev_bi(lat, lon + 1) + _elev_bi(lat, lon - 1)) / 4.0
        relief = e - around
        if relief > 200:
            sa = min(1.0, (e - sl) / NIEVE_FINA_RANGO) * min(1.0, (relief - 200) / 500.0)
    latsnow = smooth(58.0, 75.0, abs(lat)) * 0.85
    sa = (int(min(1.0, max(sa, latsnow)) * 215) // 28) * 28 / 215.0
    return ra, sa


# ------------------------------------------------------- copas de árbol
# La textura "de ilustración": en vez de ruido, racimos con forma. Copas
# redondas repartidas sobre la ESFERA (rejilla con jitter, espaciado constante
# en grados de arco, no de longitud: no se aplastan hacia el norte), pintadas
# de norte a sur para que las de abajo se monten sobre las de arriba como en
# un bosque dibujado. Cada celda guarda qué parte de copa le toca:
#   0 hueco entre copas, 1 borde en sombra (abajo-dcha), 2 cuerpo, 3 luz (arriba-izda)
# Viven en el mapa (0,25°), así que giran con el planeta como la costa.
CROWN_SP   = 1.0 / SCALE           # separación media entre copas, en grados de arco (~4-5 px)
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
MEZCLA_R = 9 * KC                      # radio de la ventana, en celdas (~2,25°)
MIXBIO = [bytearray(BIOME[r]) for r in range(MH)]
# Sabana: en la franja de mezcla entre desierto y verde (templado/selva), SAV =
# proporción de desierto alrededor (0-255), en todas sus celdas (varía suave:
# una copa que pisa varias celdas no se parte). Cuanto más desierto, copas más
# sueltas, y el suelo verde entre ellas pasa a hierba seca (SAV_GROUND), en vez
# de selva cerrada. Al alejarse del desierto la proporción baja sola hasta 0:
# sin costura con la selva de dentro.
SAV = [bytearray(MW) for _ in range(MH)]
SAV_THIN   = 0.62                      # cuánto aclara las copas la sabana plena
SAV_GROUND = (0xc9, 0xb1, 0x62)        # hierba seca entre los árboles
random.seed(4711)
_MN = [(n, [[random.random() for _ in range(MW // n)] for _ in range(MH // n + 2)])
       for n in (round(6 * KC / SCALE), round(3 * KC / SCALE))]


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
        if hi == 2 and lo in (0, 1):                   # verde + desierto: sabana
            SAV[r][c] = round(255 * cnt[2] / float(cnt[ka] + cnt[kb]))
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
       for n in (24 * KC, 9 * KC)]


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
DUNE_SP   = 1.65 / SCALE           # separación media entre dunas, en grados de arco
DUNE_LEN  = (0.80 / SCALE, 1.30 / SCALE)   # semilongitud de la cresta, en grados
DUNE_BEND = 0.55 / SCALE           # curvatura de la media luna (grados en los cuernos)
DUNE_LIT  = 0.30 / SCALE           # ancho de la cara al sol, en grados
DUNE_SH   = 0.42 / SCALE           # ancho de la cara en sombra, en grados
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

# ----------------------------------------------------------- banquisa
# El hielo marino ya no es "todo el mar por encima de 82°N" (un círculo
# perfecto con línea de costa alrededor): se dibuja aquí con forma.
#  - Borde por longitud (PACK_EDGE), aproximando la extensión de principios de
#    verano: llena la cuenca ártica hasta las costas de Siberia, Alaska y el
#    archipiélago canadiense, baja por la costa este de Groenlandia con la
#    corriente y se retira al norte en el lado atlántico (Barents, Svalbard).
#  - Borde roto en témpanos: la proporción de hielo sube de 0 a 1 en una franja
#    y se umbraliza contra un ruido de manchas (mismo truco que MIXBIO).
#  - Dentro: placas grandes de hielo viejo y manchas de hielo joven.
#  - Es terreno 3: sin línea de costa ni franjas turquesa. La tierra que toca
#    (Groenlandia, islas) conserva SU línea de costa, así que se distingue.
#   PACK: 0 nada, 1 hielo joven, 2 hielo viejo
PACK_EDGE = [   # (longitud, latitud del borde)
    (-180, 72.0), (-160, 71.5), (-140, 71.0), (-120, 71.0), (-95, 69.5),
    (-75, 72.5), (-60, 74.5), (-40, 71.0), (-22, 69.5), (-10, 76.0),
    (0, 79.0), (15, 80.3), (30, 79.5), (45, 78.5), (60, 77.5),
    (75, 75.5), (100, 76.5), (130, 75.0), (150, 73.0), (180, 72.0),
]
PACK_FRINGE = (1.9, 0.6)           # grados al sur / al norte del borde donde se rompe en témpanos


def _edge_lat(lon):
    for (l0, a0), (l1, a1) in zip(PACK_EDGE, PACK_EDGE[1:]):
        if l0 <= lon <= l1:
            t = (lon - l0) / (l1 - l0)
            return a0 + (a1 - a0) * t
    return PACK_EDGE[-1][1]


def _vnoise_factory(ncells, seed):
    """Ruido de valor 0..1 con nodos cada `ncells` celdas, que da la vuelta en
    longitud (sin costura en la línea de cambio de fecha)."""
    rnd = random.Random(seed)
    wn = max(1, MW // ncells)
    g = [[rnd.random() for _ in range(wn)] for _ in range(MH // ncells + 2)]

    def f(r, c):
        fr, fc = r / ncells, c / ncells
        r0, c0 = int(fr), int(fc)
        tr, tc = fr - r0, fc - c0
        tr, tc = tr * tr * (3 - 2 * tr), tc * tc * (3 - 2 * tc)
        c0 %= wn
        c1 = (c0 + 1) % wn
        a = g[r0][c0] * (1 - tc) + g[r0][c1] * tc
        b = g[r0 + 1][c0] * (1 - tc) + g[r0 + 1][c1] * tc
        return a * (1 - tr) + b * tr
    return f


# Ruido de la banquisa en coordenadas POLARES (x, y en grados desde el polo):
# en latitud/longitud los nodos del ruido se juntan hacia el polo y las placas
# salían como rayos de una estrella. Así el ruido es igual de redondo en todo
# el casquete. Retícula sin tabla: valor pseudoaleatorio por hash de (ix, iy).
def _hash01(ix, iy, seed):
    n = (ix * 374761393 + iy * 668265263 + seed * 2246822519) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return (n ^ (n >> 16)) / 4294967295.0


def _pnoise(x, y, size, seed):
    fx, fy = x / size, y / size
    ix, iy = math.floor(fx), math.floor(fy)
    tx, ty = fx - ix, fy - iy
    tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
    a = _hash01(ix, iy, seed) * (1 - tx) + _hash01(ix + 1, iy, seed) * tx
    b = _hash01(ix, iy + 1, seed) * (1 - tx) + _hash01(ix + 1, iy + 1, seed) * tx
    return a * (1 - ty) + b * ty


PACK = [bytearray(MW) for _ in range(MH)]
for r in range(MH):
    lat = 90.0 - (r + 0.5) * _md
    if lat < 62.0:
        break
    for c in range(MW):
        if GRID[r][c] != 0:
            continue
        lon = (c + 0.5) * _md - 180.0
        rho, th = 90.0 - lat, math.radians(lon)
        px_, py_ = rho * math.cos(th), rho * math.sin(th)
        edge = _edge_lat(lon) + (_pnoise(px_, py_, 3.0, 501) - 0.5) * 3.0
        p = smooth(edge - PACK_FRINGE[0], edge + PACK_FRINGE[1], lat)
        if p <= 0.0:
            continue
        floe = smooth(0.25, 0.75, 0.6 * _pnoise(px_, py_, 0.32 / SCALE * 1.5, 502)
                      + 0.4 * _pnoise(px_, py_, 0.8 / SCALE * 1.5, 503))
        if floe > p:
            continue                                   # agua entre témpanos
        # Hielo joven (azulado) sobre todo cerca del borde; dentro, placas
        # grandes de hielo viejo con alguna mancha de joven. (Se probaron
        # grietas de agua: cerca del polo quedaban en puntos sueltos, fuera.)
        young = _pnoise(px_, py_, 1.8 / SCALE * 1.5, 504) < 0.30 + 0.45 * (1.0 - p)
        PACK[r][c] = 1 if young else 2

# Banquisa austral (Proyecto Tierra, 24-sep-2026: con el disco entero se ve el
# sur). Las mismas reglas que la ártica, con el borde de la misma época del
# año: principios del verano del norte es principios del invierno del sur, así
# que el hielo rodea la Antártida con anchura (más ancho en el mar de Weddell y
# el de Ross, más estrecho frente a la península y en el de Amundsen).
PACK_EDGE_SUR = [   # (longitud, latitud del borde)
    (-180, -66.0), (-150, -68.0), (-120, -69.0), (-90, -68.5), (-70, -65.5),
    (-55, -63.0), (-40, -62.0), (-20, -63.0), (0, -64.0), (20, -65.0),
    (40, -65.5), (60, -65.5), (90, -64.5), (120, -64.5), (150, -66.0),
    (170, -67.0), (180, -66.0),
]


def _edge_lat_sur(lon):
    for (l0, a0), (l1, a1) in zip(PACK_EDGE_SUR, PACK_EDGE_SUR[1:]):
        if l0 <= lon <= l1:
            return a0 + (a1 - a0) * (lon - l0) / (l1 - l0)
    return PACK_EDGE_SUR[-1][1]


for r in range(MH - 1, -1, -1):
    lat = 90.0 - (r + 0.5) * _md
    if lat > -54.0:
        break
    for c in range(MW):
        if GRID[r][c] != 0:
            continue
        lon = (c + 0.5) * _md - 180.0
        rho, th = 90.0 + lat, math.radians(lon)
        px_, py_ = rho * math.cos(th), rho * math.sin(th)
        edge = _edge_lat_sur(lon) - (_pnoise(px_, py_, 3.0, 601) - 0.5) * 3.0
        # como la ártica, en latitud hacia el polo (-lat): 0 fuera, 1 dentro
        p = smooth(-edge - PACK_FRINGE[0], -edge + PACK_FRINGE[1], -lat)
        if p <= 0.0:
            continue
        floe = smooth(0.25, 0.75, 0.6 * _pnoise(px_, py_, 0.32 / SCALE * 1.5, 602)
                      + 0.4 * _pnoise(px_, py_, 0.8 / SCALE * 1.5, 603))
        if floe > p:
            continue
        young = _pnoise(px_, py_, 1.8 / SCALE * 1.5, 604) < 0.30 + 0.45 * (1.0 - p)
        PACK[r][c] = 1 if young else 2

# Nieve y roca van "ganando" copas ENTERAS según sube su cantidad (cada copa
# tiene su umbral al azar, CROWN_U), y los huecos entre copas al final (nieve)
# o al principio (roca: asoma entre los árboles). Transiciones a racimos, en
# vez de mezcla de color o de puntitos sueltos de 1 px.
SNOW_GAP = 0.80                    # cantidad de nieve a partir de la cual cubre los huecos
ROCK_GAP = 0.15                    # cantidad de roca a partir de la cual asoma en los huecos

# --------------------------------------------------------------------- nubes
# Nubes pixel-art tipo cúmulo (lóbulos irregulares arriba, base plana), con
# BORDE NEGRO para contraste. '#' cuerpo blanco, 'o' sombra gris, '.' vacío.
# 12 plantillas de tamaños/siluetas distintas + escala por instancia, para que
# no se repitan. El borde negro de 1 px se re-genera tras escalar (siempre
# limpio). Se proyectan sobre la esfera como las ciudades y giran con el planeta.
C_BODY = (0xfb, 0xfc, 0xfe)         # cuerpo blanco
C_EDGE = (0x10, 0x13, 0x1c)         # borde casi negro (contraste)
# Rampa de la nube, como las del resto del planeta (luces hacia amarillo,
# sombras hacia azul-violeta): canto al sol, cuerpo, canto en sombra, base y
# borde exterior.
CLOUD_KINDS = "hbmse"
C_NUBE = {
    "h": (0xff, 0xfd, 0xf2),
    "b": C_BODY,
    "m": (0xd6, 0xdc, 0xec),
    "s": (0xa4, 0xab, 0xcc),
    "e": C_EDGE,
}
CLOUD_SIZE = (1.0, 1.3)             # escala por instancia (antes 0,62-0,92: casi no se veían)


def _cloud_t(k, t):
    """Cuánto se ve cada tono con la luz t (junto al terminador se apaga)."""
    return min(1.0, t + 0.1) if k in "hb" else max(0.7, t) if k == "e" else t

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


def _cloud_fill(body):
    """Las plantillas son un contorno: rellena su interior de cuerpo ('b').
    Sin rellenar, la nube salía como un anillo blanco con un agujero oscuro
    (parecía un donut). Algunos contornos están abiertos por la muesca entre
    dos lóbulos: un hueco de 1 celda entre dos celdas de nube (en horizontal o
    en vertical) hace de tapón para decidir qué es interior, y él mismo se
    queda vacío (sale como una muesca oscura de 1 px entre lóbulos)."""
    xs = [p[0] for p in body]
    ys = [p[1] for p in body]
    X0, X1, Y0, Y1 = min(xs) - 2, max(xs) + 2, min(ys) - 2, max(ys) + 2
    muro = set(body)
    for y in range(Y0, Y1 + 1):
        for x in range(X0, X1 + 1):
            if (x, y) not in body and (((x - 1, y) in body and (x + 1, y) in body)
                                       or ((x, y - 1) in body and (x, y + 1) in body)):
                muro.add((x, y))
    fuera, pila = set(), [(X0, Y0)]
    while pila:
        p = pila.pop()
        if p in fuera or p in muro or not (X0 <= p[0] <= X1 and Y0 <= p[1] <= Y1):
            continue
        fuera.add(p)
        x, y = p
        pila += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    out = dict(body)
    for y in range(Y0, Y1 + 1):
        for x in range(X0, X1 + 1):
            if (x, y) in out or (x, y) in fuera:
                continue
            if (x, y) in muro and any(v in fuera for v in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))):
                continue                        # tapón que da al exterior: muesca
            out[(x, y)] = "b"
    return out


CLOUD_BODIES = [_cloud_fill(_cloud_body(a)) for a in CLOUD_ART]

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
        random.uniform(*CLOUD_SIZE),     # escala por instancia
    ))
random.shuffle(NUBES)

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


def _surface_at(lat, lon):
    """(terrain, surf, tex_k, gr, gc) de un punto geográfico, sin sombra.
    tex_k = escalones de rampa que pone la textura (copas, relieve)."""
    gr, gc = _mcell(lat, lon)
    gr = 0 if gr < 0 else MH - 1 if gr >= MH else gr
    gc %= MW
    terrain = GRID[gr][gc]
    tex_k = 0
    if terrain == 0 and PACK[gr][gc]:      # banquisa: terreno 3 (ni costa ni franjas)
        terrain = 3
        surf = (PACK_YOUNG, PACK_OLD)[PACK[gr][gc] - 1]
    elif terrain == 0:                     # mar en FRANJAS planas: turquesa de costa ->
        sd = SEADIST[gr][gc]               # turquesa medio -> plataforma -> abisal. Los
        if sd <= KC:                       # bordes se ondulan con el ruido de manchas para
            surf = OCEAN_COAST             # no calcar el contorno de la costa.
        else:
            d = sd + (_mix_noise(gr, gc) - 0.5) * SEA_WOBBLE * KC
            if d <= SEA_BANDS[0] * KC:
                surf = OCEAN_MID
            elif d <= SEA_BANDS[1] * KC:
                surf = OCEAN_SHALLOW
            else:
                surf = OCEAN_DEEP
    elif terrain == 2:                     # hielo
        surf = ICE
    else:                                  # tierra: bioma + copas + relieve (la línea de costa
        bg = MIXBIO[gr][gc]                # se pinta aparte, en cell_index: si se mete aquí,
        pv = 1.0 - PATCH[gr][gc] / 255.0   # el AA de costa la diluye promediándola con el mar)
        code = CROWN[gr][gc]
        u = (CROWN_U[gr][gc] + 0.5) / 256.0
        b = CROWN_BIO[gr][gc] if code else bg
        sav = smooth(0.0, 0.5, SAV[gr][gc] / 255.0)
        thin = 1.0 - SAV_THIN * sav
        dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv) * thin   # claros y sabana: menos copas
        suelo = True
        if code and u >= dens:
            b, tex_k = bg, 0               # copa descartada (bioma poco denso o claro): suelo liso
        elif code == 0:                    # hueco: sombra en bosque cerrado, suelo en claros
            b = bg
            dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv) * thin
            tex_k = round(CROWN_K[b][0] * smooth(0.45, 0.85, dens))
        else:
            tex_k = CROWN_K[b][code]
            suelo = False
        surf = BIOME_COLS[b]               # plano: la franja de mezcla hace de transición
        claro = PATCH_VAR[b] * pv
        if b == 0 and claro:
            surf = mix(surf, MEADOW, claro * 0.75)
        if sav and suelo and b in (0, 1) and \
                smooth(0.25, 0.75, _mix_noise(MH - 1 - gr, (gc + MW // 2) % MW)) < sav:
            surf = SAV_GROUND              # hierba seca entre los árboles, a manchas (sin mezclar)
        mk = MTNK[gr][gc] - 8
        if b == 2:                         # desierto: erg/reg por manchas + dunas en llano
            surf = mix(surf, mix(REG, ERG, PATCH[gr][gc] / 255.0), 0.6)
            if mk == 0:
                tex_k = DUNE_K[DUNE[gr][gc]]
        if NIVEL > 1:
            _ra, _sa = _roca_nieve_fina(lat, lon)
        else:
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
    if terrain in (0, 3):                  # mar y banquisa: sin línea de costa
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
    terrain, surf, tex_k, gr, gc = _surface_at(lat, lon)
    if COAST_AA:
        surf, tex_k = _coast_aa(sx, sy, lon0, terrain, surf, tex_k, gr, gc)
    # Línea de costa: aparte del AA de arriba (que suaviza la transición
    # tierra/mar y diluiría la línea si se mezclara antes). Sub-muestreada
    # (ver _coast_line_mix) para no perderse islas más pequeñas que un píxel.
    surf = _coast_line_mix(sx, sy, lon0, terrain, gr, gc, surf)

    if night:                              # luz de luna: misma rampa, otra luz y otra paleta
        surf = noche(surf)
        lam = px * MX + py * MY + pz * MZ
        floor, atmo = N_NIGHT, N_ATMO
    else:
        lam = px * SX + py * SY + pz * SZ
        floor, atmo = NIGHT, ATMO
    term_t = smooth(TERM_A, TERM_B, lam)
    bright = floor + (1.0 - floor) * term_t
    limb_t = smooth(0.72, 1.0, dc)
    limb = LIMB_K * limb_t
    helado = terrain in (2, 3)             # hielo continental o banquisa
    if helado:
        limb *= 0.7
    bright *= 1.0 - limb
    # La luz global (terminador + limbo) se pasa a escalones de rampa y se le
    # suman los de la textura (copas, relieve). Se redondea a escalón ENTERO:
    # colores de paleta, no degradado. El terminador y el limbo quedan en
    # escalones lisos que siguen la curva de la luz: sin punteado Bayer (se veía
    # como una mosquitera) ni bordes ondulados por ruido (probados en sept 2026
    # y rechazados por el usuario).
    kg = math.floor(math.log(max(bright, 1e-3)) / _LNSTEP * LIGHT_SUB + 0.5) / LIGHT_SUB
    col = ramp(surf, kg + tex_k, 0.45 if terrain == 0 else 1.0)
    if dc > 0.93 and lam > 0.0:
        halo = smooth(0.93, 1.0, dc) * smooth(0.0, 0.45, lam)
        col = mix(col, atmo, 0.3 * (math.floor(halo * 4 + 0.5) / 4))
    if night and AIRGLOW_PX:
        dpx = (1.0 - dc) * RADIUS          # px desde el borde hacia dentro
        for w, a in zip(AIRGLOW_PX, AIRGLOW_A):
            if dpx < w:
                col = mix(col, AIRGLOW, a)
                break
    # AA del limbo: el disco ya no corta en seco al radio exacto, se apaga hacia
    # el color del fondo (SPACE, que es justo el fondo real de la portada) en
    # una banda de ±LIMB_AA px alrededor del borde real.
    if dc > _R_IN:
        coverage = 1.0 - smooth(_R_IN, _R_OUT, dc)
        if coverage < 1.0:
            col = mix(SPACE, col, coverage)
    return rgba(col)


def _scaled_cloud(body, size, flip=False):
    """Escala el cuerpo (nearest; ya relleno, ver _cloud_fill), en espejo si
    toca, y lo sombrea como el resto del pixel art: borde exterior oscuro, luz
    en el canto de arriba/izquierda y sombra en el de abajo/derecha.
    -> ({(x, y): tipo}, dw, dh), con tipo en CLOUD_KINDS."""
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
                dest[(dw - 1 - ox if flip else ox, oy)] = k
    out = {}
    for (x, y), k in dest.items():
        if k == "s":
            out[(x, y)] = "s"
        elif (x, y - 1) not in dest or (x - 1, y) not in dest:
            out[(x, y)] = "h"                    # canto al sol
        elif (x, y + 1) not in dest or (x + 1, y) not in dest:
            out[(x, y)] = "m"                    # canto en sombra
        else:
            out[(x, y)] = "b"
    for (x, y) in list(dest):
        for ex in (-1, 0, 1):
            for ey in (-1, 0, 1):
                p = (x + ex, y + ey)
                if p not in dest and p not in out:
                    out[p] = "e"
    return out, dw, dh


def cloud_cells(lon0, night=False):
    """(sx, sy) -> índice de color. Nubes pixel-art tipo cúmulo, proyectadas
    sobre la esfera y sombreadas por el terminador (de noche, el de la luna)."""
    LX_, LY_, LZ_ = (MX, MY, MZ) if night else (SX, SY, SZ)
    tonos = {k: (c if k == "e" else noche(c)) if night else c for k, c in C_NUBE.items()}
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
        lam = px * LX_ + py * LY_ + pz * LZ_
        bright = smooth(TERM_A + 0.06, TERM_B + 0.2, lam)
        if bright < 0.12:                     # zona de noche del sprite de día
            continue
        cx = px * RADIUS + CX - 0.5
        cy = py * RADIUS + CY - 0.5
        xsc = 0.72 + 0.28 * pz               # se aplasta un poco hacia el borde
        t = 0.72 + 0.28 * bright             # nube blanca casi siempre; solo se
        cix = {k: rgba(mix(SPACE, c, _cloud_t(k, t)))   # apaga pegada al terminador
               for k, c in tonos.items()}
        cells, dw, dh = _scaled_cloud(CLOUD_BODIES[shp], size, flip)
        for (ox, oy), k in cells.items():
            ddx = (ox - dw / 2.0)
            x = int(round(cx + ddx * xsc))
            y = int(round(cy + oy - dh / 2.0))
            if 0 <= x < COLS and 0 <= y < VIS and (x, y) not in out:
                out[(x, y)] = cix[k]
    return out


# ------------------------------------------------------------ banderas
# Chapas pixel art (elegidas frente al banderín en mástil) sobre los países que
# salen en el blog (opción C: de momento España, Marruecos, Irán y EE. UU.).
# Bandera de 11x7 px con contorno oscuro de 1 px, esquinas recortadas y una
# sombra de 1 px abajo a la derecha; centrada en el punto del país, gira con el
# planeta, solo en la cara iluminada y lejos del borde, con la luz de las nubes.
# Añadir un país = una entrada en BANDERAS (filas de 11 letras de BAND_PAL) y
# otra en src/data/paises.ts (su nombre y las etiquetas de artículo que le
# corresponden). En la web solo se pintan las de países con algún artículo.
BAND_PAL = {
    "R": (0xc8, 0x1e, 0x2d), "Y": (0xf4, 0xc4, 0x30), "E": (0x8e, 0x16, 0x20),   # España
    "r": (0xc1, 0x27, 0x2d), "g": (0x1f, 0x7a, 0x3c),                           # Marruecos
    "G": (0x2a, 0x9d, 0x48), "W": (0xf4, 0xf4, 0xf0), "Q": (0xd4, 0x16, 0x1c),   # Irán
    "u": (0xb8, 0x26, 0x38), "w": (0xf4, 0xf4, 0xf0), "B": (0x33, 0x3d, 0x74),   # EE. UU.
    "k": (0x1a, 0x1a, 0x1a),                                                    # Afganistán
}
BANDERAS = [   # (iso, nombre, lat, lon del punto del país, filas) — iso = el de src/data/paises.ts
    ("ES", "España", 40.2, -3.6, ["RRRRRRRRRRR", "RRRRRRRRRRR", "YYEEYYYYYYY", "YYEEYYYYYYY",
                            "YYYYYYYYYYY", "RRRRRRRRRRR", "RRRRRRRRRRR"]),
    ("MA", "Marruecos", 31.8, -6.3, ["rrrrrrrrrrr", "rrrrrgrrrrr", "rrrgggggrrr", "rrrrgggrrrr",
                               "rrrrgrgrrrr", "rrrgrrrgrrr", "rrrrrrrrrrr"]),
    ("IR", "Irán", 32.5, 54.0, ["GGGGGGGGGGG", "GGGGGGGGGGG", "WWWWQWQWWWW", "WWWWQQQWWWW",
                          "WWWWWQWWWWW", "QQQQQQQQQQQ", "QQQQQQQQQQQ"]),
    ("US", "EE. UU.", 39.5, -98.5, ["BwBwBuuuuuu", "BBBBBwwwwww", "BwBwBuuuuuu", "BBBBBwwwwww",
                              "uuuuuuuuuuu", "wwwwwwwwwww", "uuuuuuuuuuu"]),
    # Afganistán: bandera talibán actual, blanca con la shahada. Tres palabras
    # sueltas (sin línea base continua, que se leía como un peine), una cola en
    # diagonal y dos puntos bajo la palabra de la derecha.
    ("AF", "Afganistán", 34.5553, 69.2075, ["WWWWWWWWWWW", "WWkWWWWkWkW", "WWkWWkWkWkW", "WkkWkkWkkkW",
                                      "WWWWkWWWWWW", "WWWkWWWkWkW", "WWWWWWWWWWW"]),
]
BAND_PZ = 0.30                     # no se pinta más cerca del borde del disco que esto
BAND_EDGE = (0x10, 0x13, 0x1c)


def _chapa(rows):
    """-> (celdas {(x, y): rgb} con origen en la esquina de la tela, sombra
    [(x, y)], ancla (centro de la tela))."""
    fw, fh = len(rows[0]), len(rows)
    cells = {}
    for y in range(-1, fh + 1):
        for x in range(-1, fw + 1):
            if x in (-1, fw) and y in (-1, fh):
                continue                             # esquinas recortadas
            inside = 0 <= x < fw and 0 <= y < fh
            cells[(x, y)] = BAND_PAL[rows[y][x]] if inside else BAND_EDGE
    sombra = [(x + 1, y + 1) for (x, y) in cells if (x + 1, y + 1) not in cells]
    return cells, sombra, (fw / 2.0, fh / 2.0)


CHAPAS = [(iso, la, lo) + _chapa(rows) for iso, _n, la, lo, rows in BANDERAS]


def flag_cells(lon0, night=False):
    """(sx, sy) -> rgba de las chapas, y el conjunto de píxeles en su sombra."""
    out, sombra = {}, set()
    for _n, clat, clon, cells, sh, (ax, ay) in CHAPAS:
        rlat, rlon = math.radians(clat), math.radians(clon - lon0)
        a, cl = math.sin(rlat), math.cos(rlat)
        vv = cl * math.cos(rlon)
        px = cl * math.sin(rlon)
        py = -COST * a + SINT * vv
        pz = SINT * a + COST * vv
        if pz <= BAND_PZ:
            continue
        lam = px * MX + py * MY + pz * MZ if night else px * SX + py * SY + pz * SZ
        bright = smooth(TERM_A + 0.06, TERM_B + 0.2, lam)
        if bright < 0.12:
            continue                                   # lado en sombra
        t = 0.72 + 0.28 * bright                       # misma luz que las nubes
        ox = round(px * RADIUS + CX - 0.5 - ax)
        oy = round(py * RADIUS + CY - 0.5 - ay)
        for (x, y) in sh:
            sombra.add((ox + x, oy + y))
        for (x, y), col in cells.items():
            out[(ox + x, oy + y)] = rgba(mix(SPACE, col, t))
    return out, sombra


# ------------------------------------------------------ luces de noche
# Cada ciudad de más de 15.000 habitantes de GeoNames (CC BY 4.0; ~34.000, con
# la densidad real: Natural Earth dejaba EE. UU. casi a oscuras) deja una
# huella de intensidad en píxeles. Descargar a este directorio (gitignored):
#   curl -sSLO https://download.geonames.org/export/dump/cities15000.zip && \
#     unzip cities15000.zip && rm cities15000.zip
# La huella va en píxeles
# de PANTALLA (tamaño fijo, no se encoge con el planeta): centro + vecinos,
# más ancha cuanto más grande. Las huellas se SUMAN, así que las zonas densas
# (Benelux, Ruhr, valle del Po…) se funden solas en mancha de luz, y la suma
# se reduce a pocos niveles de ámbar (pixel art, no degradado). Es emisiva: no
# depende de la luna. Las nubes van por encima.
LUZ_POP_MIN = 15000
LUZ_EXP     = 0.4                  # intensidad del centro = (población / 100.000) ** esto:
                                   # pueblo = 1 px tenue, 1 M = núcleo con halo, 10 M = mancha
LUZ_N4, LUZ_DIAG, LUZ_R2 = 0.30, 0.15, 0.12   # huella: vecinos, diagonales, anillo de radio 2
LUZ_R2_MIN  = 2.5                  # a partir de esta intensidad la huella lleva anillo de radio 2
# Factor de luz por país (1 = lo que diga su población). Por debajo: países
# con red eléctrica escasa (África subsahariana salvo Sudáfrica, y algunos
# más) y Corea del Norte, casi a oscuras, como en las fotos reales. Por encima:
# EE. UU. y Canadá, que gastan mucha más luz por habitante y cuya población
# vive en buena parte en suburbios de menos de 15.000 (GeoNames no los cuenta).
_LUZ_BAJA = ("AO BI BJ BF BW CF CI CM CD CG KM DJ ER ET GA GH GN GM GW GQ KE LR LS MG ML "
             "MZ MR MW NA NE NG RW SD SS SN SL SO SZ TD TG TZ UG ZM ZW AF MM YE HT PG").split()
LUZ_PAIS = dict({k: 0.5 for k in _LUZ_BAJA}, KP=0.08, US=2.2, CA=1.5)
# Nivel -> (color, opacidad sobre el suelo a la luz de la luna).
LUZ_UMBRAL = (0.35, 1.0, 1.8, 2.6, 3.4, 4.2)
LUZ_RAMPA = (
    ((0xc0, 0x80, 0x34), 0.35),
    ((0xc0, 0x80, 0x34), 0.70),
    ((0xd6, 0x98, 0x3e), 1.0),
    ((0xf2, 0xc2, 0x52), 1.0),
    ((0xff, 0xdc, 0x78), 1.0),
    ((0xff, 0xf4, 0xcc), 1.0),
)


def _cargar_luces():
    import os
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cities15000.txt")
    out = []
    with open(ruta, encoding="utf-8") as fh:
        for linea in fh:
            f = linea.split("\t")          # 4 lat, 5 lon, 8 país (ISO2), 14 población
            pop = int(f[14] or 0)
            if pop < LUZ_POP_MIN:
                continue
            a = (pop / 1e5) ** LUZ_EXP * LUZ_PAIS.get(f[8], 1.0)
            # Ya cuantizado como va en planeta-luces.png (lat/lon en 16 bits,
            # intensidad en 1/16): el render de Python y el canvas, idénticos.
            qa = round((float(f[4]) + 90.0) / 180.0 * 65535)
            qo = round((float(f[5]) + 180.0) / 360.0 * 65535) % 65536
            qi = min(255, round(a * 16))
            out.append((qa * 180.0 / 65535 - 90.0, qo * 360.0 / 65535 - 180.0, qi / 16.0, qa, qo, qi))
    out.sort(key=lambda t: t[4])
    return [t[:3] for t in out], [t[3:] for t in out]


LUCES, _LUCES_Q = _cargar_luces()
_HUELLA = [(0, 0, 1.0)] + [(dx, dy, LUZ_N4) for dx, dy in _N4] + \
          [(dx, dy, LUZ_DIAG) for dx in (-1, 1) for dy in (-1, 1)]
_HUELLA_R2 = [(2 * dx, 2 * dy, LUZ_R2) for dx, dy in _N4]
LUZ_CORE2 = 3.9                    # (~3 M hab.) a partir de aquí el núcleo es de 2x2
_hg = {}
for _ox, _oy in ((0, 0), (1, 0), (0, 1), (1, 1)):   # la huella grande = máximo de 4 huellas desplazadas
    for _dx, _dy, _w in _HUELLA + _HUELLA_R2:
        _k = (_dx + _ox, _dy + _oy)
        _hg[_k] = max(_hg.get(_k, 0.0), _w)
_HUELLA_GRANDE = [(dx, dy, w) for (dx, dy), w in _hg.items()]
del _hg


def _luz_nivel(v):
    lv = 0
    while lv < len(LUZ_UMBRAL) and v >= LUZ_UMBRAL[lv]:
        lv += 1
    return lv


# La suma de TODAS las huellas solo da un velo tenue (nivel 1) en las zonas
# densas: si llegara más arriba, el Benelux o Inglaterra se quemaban en una
# mancha plana. El brillo de verdad sale de cada píxel por separado: el
# halo más fuerte que le llegue, o la suma de los NÚCLEOS que caen en él (así
# una ciudad con sus afueras, como París, gana brillo).
LUZ_SUMA_MAX = 1


def light_cells(lon0):
    """(sx, sy) -> nivel de luz (1..len(LUZ_RAMPA))."""
    acc, pico, nucleo = {}, {}, {}
    for lat, lon, a in LUCES:
        rlat, rlon = math.radians(lat), math.radians(lon - lon0)
        s, cl = math.sin(rlat), math.cos(rlat)
        vv = cl * math.cos(rlon)
        pz = SINT * s + COST * vv
        if pz <= 0.02:
            continue
        a *= smooth(0.02, 0.25, pz)                # se apagan al llegar al limbo
        x = round(cl * math.sin(rlon) * RADIUS + CX - 0.5)
        y = round((-COST * s + SINT * vv) * RADIUS + CY - 0.5)
        huella = (_HUELLA_GRANDE if a >= LUZ_CORE2 else
                  _HUELLA + _HUELLA_R2 if a >= LUZ_R2_MIN else _HUELLA)
        for dx, dy, w in huella:
            k = (x + dx, y + dy)
            acc[k] = acc.get(k, 0.0) + a * w
            if w == 1.0:
                nucleo[k] = nucleo.get(k, 0.0) + a
            elif a * w > pico.get(k, 0.0):
                pico[k] = a * w
    out = {}
    for k, v in acc.items():
        fuerte = max(pico.get(k, 0.0), nucleo.get(k, 0.0))
        lv = max(_luz_nivel(fuerte), min(LUZ_SUMA_MAX, _luz_nivel(v)))
        if lv and 0 <= k[0] < COLS and 0 <= k[1] < VIS:
            out[k] = lv
    return out


def light_mix(c, lv):
    col, a = LUZ_RAMPA[lv - 1]
    return rgba(mix(c, col, a))


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
        overlay = cloud_cells(lon0, night)
        sombra = set()
        fl, sombra = flag_cells(lon0, night)         # chapas por encima de las nubes
        overlay.update(fl)
        luces = light_cells(lon0) if night else {}
        for sy in range(VIS):
            row = rows[yoff + sy]
            for sx in range(COLS):
                c = overlay.get((sx, sy))
                if c is None:
                    c = cell_index(sx, sy, lon0, night)
                    lv = luces.get((sx, sy))
                    if lv and c[3]:
                        c = light_mix(c, lv)
                    if (sx, sy) in sombra and c[3]:
                        c = (c[0] // 2, c[1] // 2, c[2] // 2 + 6, 255)
                o = (xoff + sx) * 4
                row[o] = c[0]; row[o + 1] = c[1]; row[o + 2] = c[2]; row[o + 3] = c[3]
    write_rgba(path, sw, sh, rows)
    return sw, sh


# ------------------------------------------------- exportar para el <canvas>
# En vez de 60 fotogramas pregenerados, el navegador proyecta el mapa y lo gira
# celda a celda (movimiento continuo). Como el sol y el terminador están quietos
# respecto al observador, el sombreado por píxel se calcula una vez al cargar;
# en cada paso solo hay que buscar "material de la celda -> color para este
# escalón de luz". El giro es CONTINUO (el mapa se desplaza una fracción de
# celda en cada fotograma de pantalla): así cada borde avanza su píxel a ritmo
# constante según su latitud. A saltos de una celda entera, todos los bordes se
# reajustaban a la vez con un patrón irregular (1,1,0,1…) y se veía a tirones.
# Aquí se exporta:
#   planeta-mapa.png : MW x MH, material de cada celda (R + G*256), B=1 si hielo
#   planeta-lut.png  : LUT_KN x nº de materiales, color de cada material para
#                      cada escalón de luz global LUT_KMIN..0, en pasos de
#                      1/LIGHT_SUB (rampas incluidas)
#   planeta-datos.json : constantes de geometría/luz + nubes ya escaladas
LUT_KMIN = -12
LUT_KN = 1 - LUT_KMIN * LIGHT_SUB
LUZ_PNG_W = 256                     # luces por fila en planeta-luces.png
_COAST_MIXK = (0.0, 0.20, 0.48, 0.84)


def escribe_luts(outdir, orden):
    """LUT de día y de noche (LUT_KN x nº de materiales) y prioridades, para
    la lista de materiales `orden` (claves (r, g, b, tex_k, terreno, costa))."""
    import os
    lut, lut_n, prio = [], [], []
    for rr, gg, bb, tk, terrain, lvl in orden:
        # Prioridad al reducir el mapa para las zonas donde un píxel abarca
        # varias celdas (mipmaps en el navegador): la línea de costa gana, luego
        # la tierra, luego el mar -> costas e islas pequeñas no desaparecen.
        prio.append(2 * lvl + (1 if terrain != 0 else 0))
        hm = 0.45 if terrain == 0 else 1.0
        for surf, dst in (((rr, gg, bb), lut), (noche((rr, gg, bb)), lut_n)):
            row = bytearray(LUT_KN * 4)
            for j in range(LUT_KN):
                row[j * 4:j * 4 + 4] = bytes(rgba(ramp(surf, LUT_KMIN + j / LIGHT_SUB + tk, hm)))
            dst.append(row)
    write_rgba(os.path.join(outdir, "planeta-lut.png"), LUT_KN, len(lut), lut)
    write_rgba(os.path.join(outdir, "planeta-lut-noche.png"), LUT_KN, len(lut_n), lut_n)
    return lut, lut_n, prio


def celda_material(lat, lon):
    """Clave del material de un punto: la superficie y, en tierra, el anillo de
    la línea de costa mezclado encima."""
    terrain, surf, tex_k, gr, gc = _surface_at(lat, lon)
    lvl = 0
    if terrain != 0:
        lvl = 3 if COAST[gr][gc] else 2 if COAST2[gr][gc] else 1 if COAST3[gr][gc] else 0
        if lvl:
            surf = mix(surf, COAST_COL, _COAST_MIXK[lvl])
    return (round(surf[0]), round(surf[1]), round(surf[2]), int(tex_k), terrain, lvl)


TESELA = 360                        # celdas por lado de las teselas de los niveles de zoom


def export_nivel(outdir, zona=None):
    """Nivel de zoom NIVEL en teselas de TESELA x TESELA celdas:
    outdir/n{NIVEL-1}/F-C.png (fila F desde el norte, columna C desde 180° O),
    con el material en R + G*256 y B = 1 si es hielo, como planeta-mapa.png.
    Los materiales parten de los de la base (planeta-materiales.json de
    --canvas: sus índices no cambian) y los nuevos se añaden al final; luego se
    rehacen las LUT y se ponen NIVELES, TESELA, MATERIALES y prio en
    planeta-datos.json. `zona` (S, N, O, E en grados): solo las teselas que la
    tocan (para probar)."""
    import json
    import os
    with open(os.path.join(outdir, "planeta-materiales.json")) as fh:
        orden = [tuple(k) for k in json.load(fh)]
    mats = {k: i for i, k in enumerate(orden)}
    nbase = len(orden)
    carpeta = os.path.join(outdir, f"n{NIVEL - 1}")
    os.makedirs(carpeta, exist_ok=True)
    ppd = MW / 360.0
    nf, nc = MH // TESELA, MW // TESELA
    hechas = 0
    for f in range(nf):
        la1, la0 = 90.0 - f * TESELA / ppd, 90.0 - (f + 1) * TESELA / ppd
        for c in range(nc):
            lo0, lo1 = -180.0 + c * TESELA / ppd, -180.0 + (c + 1) * TESELA / ppd
            if zona and (la1 <= zona[0] or la0 >= zona[1] or lo1 <= zona[2] or lo0 >= zona[3]):
                continue
            filas = []
            for r in range(f * TESELA, (f + 1) * TESELA):
                lat = 90.0 - (r + 0.5) * _md
                fila = bytearray(TESELA * 4)
                for cc in range(TESELA):
                    lon = (c * TESELA + cc + 0.5) * _md - 180.0
                    key = celda_material(lat, lon)
                    m = mats.get(key)
                    if m is None:
                        m = mats[key] = len(orden)
                        orden.append(key)
                    o = cc * 4
                    fila[o] = m & 255; fila[o + 1] = m >> 8; fila[o + 2] = 1 if key[4] in (2, 3) else 0
                    fila[o + 3] = 255
                filas.append(fila)
            write_rgba(os.path.join(carpeta, f"{f}-{c}.png"), TESELA, TESELA, filas)
            hechas += 1
        print(f"  fila {f + 1}/{nf} de teselas ({hechas} hechas)", file=sys.stderr)
    if len(orden) > 32767:
        raise SystemExit(f"{len(orden)} materiales: no caben en 15 bits (el 16 es el hielo)")
    with open(os.path.join(outdir, "planeta-materiales.json"), "w") as fh:
        json.dump(orden, fh, separators=(",", ":"))
    lut, _ln, prio = escribe_luts(outdir, orden)
    with open(os.path.join(outdir, "planeta-datos.json")) as fh:
        datos = json.load(fh)
    niveles = [n for n in datos.get("NIVELES", [{"ppd": 2880 / 360}]) if n["ppd"] != ppd]
    niveles.append({"ppd": ppd, "teselas": True})
    datos.update({"MATERIALES": len(lut), "prio": prio, "TESELA": TESELA,
                  "NIVELES": sorted(niveles, key=lambda n: n["ppd"])})
    with open(os.path.join(outdir, "planeta-datos.json"), "w") as fh:
        json.dump(datos, fh, separators=(",", ":"))
    return hechas, nbase, len(orden)


def export_canvas(outdir):
    import json
    import os
    os.makedirs(outdir, exist_ok=True)
    mats = {}
    mapa = [bytearray(MW * 4) for _ in range(MH)]
    for r in range(MH):
        lat = 90.0 - (r + 0.5) * _md
        row = mapa[r]
        for c in range(MW):
            lon = (c + 0.5) * _md - 180.0
            key = celda_material(lat, lon)
            terrain = key[4]
            m = mats.get(key)
            if m is None:
                m = mats[key] = len(mats)
            o = c * 4
            row[o] = m & 255; row[o + 1] = m >> 8; row[o + 2] = 1 if terrain in (2, 3) else 0
            row[o + 3] = 255
    write_rgba(os.path.join(outdir, "planeta-mapa.png"), MW, MH, mapa)
    orden = [k for k, _m in sorted(mats.items(), key=lambda kv: kv[1])]
    with open(os.path.join(outdir, "planeta-materiales.json"), "w") as fh:
        json.dump(orden, fh, separators=(",", ":"))
    lut, lut_n, prio = escribe_luts(outdir, orden)
        # Prioridad al reducir el mapa para las zonas donde un píxel abarca
        # varias celdas (mipmaps en el navegador): la línea de costa gana, luego
        # la tierra, luego el mar -> costas e islas pequeñas no desaparecen.
    # Luces: 2 píxeles por luz, en filas de LUZ_PNG_W luces (ordenadas por
    # longitud). 1º = latitud (R alto, G bajo) + intensidad*16 (B); 2º =
    # longitud (R alto, G bajo). Alfa siempre 255 (si no, el navegador
    # premultiplica y pierde el color).
    nl = len(_LUCES_Q)
    lh = (nl + LUZ_PNG_W - 1) // LUZ_PNG_W
    filas = [bytearray(LUZ_PNG_W * 2 * 4) for _ in range(lh)]
    for i, (qa, qo, qi) in enumerate(_LUCES_Q):
        f, o = filas[i // LUZ_PNG_W], (i % LUZ_PNG_W) * 8
        f[o:o + 8] = bytes((qa >> 8, qa & 255, qi, 255, qo >> 8, qo & 255, 0, 255))
    write_rgba(os.path.join(outdir, "planeta-luces.png"), LUZ_PNG_W * 2, lh, filas)
    nubes = []
    for clat, clon, shp, flip, size in NUBES:
        cells, dw, dh = _scaled_cloud(CLOUD_BODIES[shp], size, flip)   # espejo ya aplicado
        nubes.append({"lat": clat, "lon": clon, "dw": dw, "dh": dh,
                      "cells": [[ox, oy, CLOUD_KINDS.index(k)] for (ox, oy), k in cells.items()]})
    datos = {
        "COLS": COLS, "VIS": VIS, "RADIUS": RADIUS, "CX": CX, "CY": CY,
        "SINT": SINT, "COST": COST, "SX": SX, "SY": SY, "SZ": SZ,
        "TERM_A": TERM_A, "TERM_B": TERM_B, "NIGHT": NIGHT, "LIMB_K": LIMB_K,
        "LIMB_AA": LIMB_AA, "LNSTEP": _LNSTEP, "MW": MW, "MH": MH,
        "LUT_KMIN": LUT_KMIN, "LUT_KN": LUT_KN, "LIGHT_SUB": LIGHT_SUB, "MATERIALES": len(lut), "prio": prio,
        "SPACE": SPACE, "ATMO": ATMO, "C_NUBE": [C_NUBE[k] for k in CLOUD_KINDS],
        "nubes": nubes,
        # noche
        "MX": MX, "MY": MY, "MZ": MZ, "N_NIGHT": N_NIGHT, "N_ATMO": N_ATMO,
        "AIRGLOW": AIRGLOW, "AIRGLOW_PX": AIRGLOW_PX, "AIRGLOW_A": AIRGLOW_A,
        "C_NUBE_NOCHE": [C_NUBE[k] if k == "e" else [round(v) for v in noche(C_NUBE[k])]
                         for k in CLOUD_KINDS],
        "LUCES_N": nl, "LUZ_PNG_W": LUZ_PNG_W,
        "HUELLA": _HUELLA, "HUELLA_R2": _HUELLA + _HUELLA_R2, "HUELLA_GRANDE": _HUELLA_GRANDE,
        "LUZ_R2_MIN": LUZ_R2_MIN, "LUZ_CORE2": LUZ_CORE2, "LUZ_UMBRAL": LUZ_UMBRAL,
        "LUZ_RAMPA": LUZ_RAMPA, "LUZ_SUMA_MAX": LUZ_SUMA_MAX,
        "BAND_PZ": BAND_PZ,
        "banderas": [{"iso": iso, "lat": la, "lon": lo, "ax": ax, "ay": ay,
                      "cells": [[x, y, *col] for (x, y), col in cells.items()],
                      "sombra": [[x, y] for (x, y) in sh]}
                     for iso, la, lo, cells, sh, (ax, ay) in CHAPAS],
    }
    with open(os.path.join(outdir, "planeta-datos.json"), "w") as fh:
        json.dump(datos, fh, separators=(",", ":"))
    return len(lut)


if NIVEL > 1:
    _args = [a for a in sys.argv[1:] if not a.startswith("--")]
    _dir = _args[1]                                  # (el primero es el número del nivel)
    _zona = None
    if "--zona" in sys.argv:
        _zona = [float(x) for x in sys.argv[sys.argv.index("--zona") + 1].split(",")]
        _dir = [a for a in _args[1:] if a != sys.argv[sys.argv.index("--zona") + 1]][0]
    _h, _nb, _nt = export_nivel(_dir, _zona)
    print(f"nivel {NIVEL}: {_h} teselas -> {_dir}/n{NIVEL - 1}/; materiales {_nb} -> {_nt}")
elif len(sys.argv) >= 3 and sys.argv[1] == "--canvas":
    _n = export_canvas(sys.argv[2])
    print(f"canvas: {_n} materiales -> {sys.argv[2]}")
elif len(sys.argv) >= 3 and sys.argv[1] == "--frame":
    # --frame N [salida.png] [--noche | --ambos]   (--ambos: día y noche, salida-dia/-noche.png)
    _f = int(sys.argv[2])
    _args = [a for a in sys.argv[3:] if not a.startswith("--")]
    _out = _args[0] if _args else f"prueba-f{_f}.png"
    if "--ambos" in sys.argv:
        _b = _out[:-4] if _out.endswith(".png") else _out
        for _nt, _suf in ((False, "dia"), (True, "noche")):
            SW, SH = render(_nt, f"{_b}-{_suf}.png", [_f])
            print(f"fotograma {_f} ({_suf}): {SW}x{SH} px -> {_b}-{_suf}.png")
    else:
        SW, SH = render("--noche" in sys.argv, _out, [_f])
        print(f"fotograma {_f}: {SW}x{SH} px -> {_out}")
else:
    # Lo que usa la web: los datos del motor en public/planeta/. Después, subir
    # PLANETA_V en src/scripts/versiones.js y rehacer la Tierra quieta con
    # generar-tierra-quieto.mjs.
    import os
    _dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "planeta")
    _n = export_canvas(_dst)
    print(f"web: {_n} materiales -> public/planeta/ (sube PLANETA_V y rehaz tierra-quieto)")
