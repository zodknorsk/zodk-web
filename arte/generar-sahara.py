#!/usr/bin/env python3
"""El mapa del Sáhara (/sahara): el pixel art de la Tierra, plano, de día y
solo dentro de su caja (CAJA), a más detalle que el zoom del planeta.

Las mismas reglas que generar-tierra.py (biomas, mezcla a manchas, copas,
dunas, relieve en escalones, roca, nieve, línea de costa, rampas con giro de
tono) copiadas aquí y calculadas solo en la caja más un margen, no en el
planeta entero: a 32 px/grado el generador de la Tierra tardaba 10 min y
4 GB; a 64 no cabría. Las constantes copiadas llevan el mismo nombre que
allí: si se cambian en la Tierra y se quieren aquí, cambiarlas a mano.

Diferencias con la Tierra:
  - celdas cuadradas en km (la longitud se estrecha por cos de la latitud
    media), así que el mapa sale plano y sin estirar;
  - las franjas del mar se miden en km (SEA_KM), no en grados: las de la
    Tierra están pensadas para ver el planeta entero y aquí eran enormes;
  - con --mar fondo, las franjas salen de la profundidad real (ETOPO1).

Fuentes (fuera de Git):
  tierra-fuentes/sahara240.i16         relieve fino y costa (elevacion-sahara.py)
  tierra-fuentes/etopo24.i16           sin el fino (o con --etopo1): el relieve del
                                       zoom de la Tierra (elevacion-fina.py)...
  tierra-fuentes/ne_10m_land.geojson   ...y la costa de Natural Earth (rasterizar.py)
  tierra-fuentes/ne_10m_admin_0_countries.geojson   fronteras:
    curl -sSLo tierra-fuentes/ne_10m_admin_0_countries.geojson \\
      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson

Niveles de zoom: el mapa entero va a 64 px/grado y, para ganar detalle al
acercarse, el cajón (lo que se puede mirar en la web) va también a 128 y
256. Todos comparten la misma rejilla (la de CAJA a su resolución), en
teselas de TESELA px: public/sahara/n<ppd>/<fila>-<columna>.png, con lo que
queda fuera de la zona en transparente. Las manchas grandes (biomas, erg y
reg) salen de un ruido en grados, igual en todos los niveles: al cambiar de
nivel no se mueven; lo que mide lo mismo en píxeles (copas, dunas) sí es
más fino.

Uso (desde arte/), y después subir SAHARA_V en src/scripts/versiones.js:
  python3 generar-sahara.py                       # los tres niveles de la web
  python3 generar-sahara.py --ppd 128 [--zona S,N,O,E] [--prueba salida.png]
      [--mar fondo|distancia] [--frontera discontinua|continua|clara|no]
      [--grosor 1|2]
      # un nivel (sin --zona, la caja entera); con --prueba, en un solo PNG
      # en vez de en las teselas de la web
"""
import colorsys
import math
import os
import random
import sys
import time
from array import array
from collections import deque
from itertools import accumulate
from operator import add

from png8 import write_rgba

T0 = time.time()
AQUI = os.path.dirname(os.path.abspath(__file__))


def _arg(nombre, defecto):
    return sys.argv[sys.argv.index(nombre) + 1] if nombre in sys.argv else defecto


# La caja (S, N, O, E en grados): del sur de Mauritania (La Güera, Cabo
# Blanco) a la costa española del Estrecho, y de El Hierro a Melilla. Es
# todo el mapa; el nivel base la cubre entera.
CAJA = (20.0, 37.2, -19.0, -1.0)
# El cajón: lo que se puede mirar en la web (CAJON en sahara-mapa.js), un
# poco más ancho para que al arrastrar hasta el borde no falte detalle.
CAJON = (20.4, 30.2, -18.6, -6.8)
# Niveles de la web: (px/grado, zona). El base, la caja; los finos, el cajón.
NIVELES = ((64, CAJA), (128, CAJON), (256, CAJON))
TESELA = 512
WEB = os.path.join(AQUI, "..", "public", "sahara")

if "--ppd" not in sys.argv:
    # Sin nivel: los de la web, cada uno en su proceso (cada nivel tiene su
    # rejilla, y así la memoria se libera entre uno y otro).
    import subprocess
    for _ppd, _z in NIVELES:
        print(f"nivel {_ppd} px/grado", file=sys.stderr)
        subprocess.run([sys.executable, os.path.abspath(__file__), "--ppd", str(_ppd),
                        "--zona", ",".join(str(v) for v in _z)] + sys.argv[1:], check=True)
    sys.exit(0)

PPD = int(_arg("--ppd", "64"))         # celdas (píxeles) por grado de latitud
MAR = _arg("--mar", "fondo")
ZONA = tuple(float(v) for v in _arg("--zona", ",".join(str(v) for v in CAJA)).split(","))
PRUEBA = _arg("--prueba", None)
MARGEN = 3.0                           # se calcula con margen para que la mezcla
                                       # de biomas y las franjas no se corten en el borde
COSLAT = math.cos(math.radians((CAJA[0] + CAJA[1]) / 2))
DLAT = 1.0 / PPD
DLON = 1.0 / (PPD * COSLAT)            # celdas cuadradas en km
KM = 111.2 / PPD                       # km por celda
# La rejilla del nivel: la de CAJA a PPD (ANCHO x ALTO px). De ella se
# calculan las filas RA..RB y columnas CA..CB de la zona, más el margen.
ALTO = round((CAJA[1] - CAJA[0]) * PPD)
ANCHO = round((CAJA[3] - CAJA[2]) / DLON)
RA, RB = max(0, math.floor((CAJA[1] - ZONA[1]) * PPD)), min(ALTO, math.ceil((CAJA[1] - ZONA[0]) * PPD))
CA, CB = max(0, math.floor((ZONA[2] - CAJA[2]) / DLON)), min(ANCHO, math.ceil((ZONA[3] - CAJA[2]) / DLON))
MR, MC = math.ceil(MARGEN * PPD), math.ceil(MARGEN / DLON)
N = CAJA[1] - (RA - MR) * DLAT         # borde norte y oeste de la rejilla con margen
O = CAJA[2] + (CA - MC) * DLON
H = RB - RA + 2 * MR
W = CB - CA + 2 * MC
S = N - H * DLAT
E = O + W * DLON

# Equivalencias con los niveles de la Tierra (nivel K = 8K px/grado):
#   KC    = celdas por cada 0,25° (lo que mide lo mismo RESPECTO AL PLANETA)
#   SCALE = píxeles respecto al planeta de 400 px (lo que mide lo mismo EN PÍXELES)
KC = PPD / 4.0
SCALE = 1.5 * PPD / 8.0


def lat_de(r):
    return N - (r + 0.5) * DLAT


def lon_de(c):
    return O + (c + 0.5) * DLON


def celda(lat, lon):
    return int((N - lat) * PPD), int((lon - O) / DLON)


def _hash01(i, j, semilla):
    """Azar fijo para un nodo (i, j): el mismo en todos los niveles."""
    h = (i * 374761393 + j * 668265263 + semilla * 1442695041) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFFFF) / float(0x1000000)


def ruido_geo(capas, semilla, suave=True):
    """Ruido de valor en grados: [(separación de nodos en grados, peso)].
    Los nodos van en la rejilla de CAJA, así que es igual en todos los
    niveles y zonas. Devuelve f(r, c) para las celdas de esta rejilla."""
    gs = []
    for k, (sep, w) in enumerate(capas):
        i0 = math.floor((CAJA[1] - N) / sep) - 1
        j0 = math.floor((O - CAJA[2]) * COSLAT / sep) - 1
        ni = int(H * DLAT / sep) + 4
        nj = int(W * DLON * COSLAT / sep) + 4
        g = [[_hash01(i0 + i, j0 + j, semilla * 31 + k) for j in range(nj)] for i in range(ni)]
        gs.append((sep, w, i0, j0, g))

    def f(r, c):
        tot = 0.0
        for sep, w, i0, j0, g in gs:
            fy = (CAJA[1] - lat_de(r)) / sep - i0
            fx = (lon_de(c) - CAJA[2]) * COSLAT / sep - j0
            a0, b0 = int(fy), int(fx)
            ty, tx = fy - a0, fx - b0
            if suave:
                ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
            a = g[a0][b0] * (1 - tx) + g[a0][b0 + 1] * tx
            b = g[a0 + 1][b0] * (1 - tx) + g[a0 + 1][b0 + 1] * tx
            tot += (a * (1 - ty) + b * ty) * w
        return tot
    return f


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def paso(msg):
    print(f"  {msg} ({time.time() - T0:.0f} s)", file=sys.stderr)


# ------------------------------------------- paleta (de generar-tierra.py)
OCEAN_COAST   = (0x5b, 0xd0, 0xe6)
OCEAN_SHALLOW = (0x43, 0x8f, 0xc6)
OCEAN_DEEP    = (0x1d, 0x50, 0x8c)
OCEAN_MID     = (0x4f, 0xb0, 0xd6)
COAST_COL     = (0x0e, 0x18, 0x13)
ROCK          = (0x8b, 0x84, 0x78)
SNOW          = (0xec, 0xf0, 0xf4)
BIOME_COLS = [
    (0x64, 0xb8, 0x62),   # 0 templado
    (0x3d, 0x93, 0x46),   # 1 selva / tropical húmedo
    (0xce, 0xb8, 0x82),   # 2 desierto (arena)
    (0xb8, 0xc9, 0x5f),   # 3 estepa / sabana seca
    (0x3c, 0x74, 0x58),   # 4 boreal / taiga
    (0xbf, 0xc7, 0xca),   # 5 tundra
]
DESIERTOS = [(12, 32, -17, 52)]        # la del Sáhara (las demás caen fuera)
MEADOW     = (0x9d, 0xbf, 0x6c)
SAV_GROUND = (0xc9, 0xb1, 0x62)
SAV_THIN   = 0.62
ERG = (0xdc, 0xb6, 0x76)
REG = (0xc2, 0xb0, 0x8e)

# Franjas del mar, en km desde la costa: turquesa, intermedia, plataforma;
# más allá, profundo. Los bordes se ondulan SEA_WOBBLE_KM.
SEA_KM = (4.0, 12.0, 30.0)
SEA_WOBBLE_KM = 8.0
# Con --mar fondo: la turquesa sigue pegada a la costa y el resto va por
# profundidad (m): intermedia hasta FONDO[0], plataforma hasta FONDO[1].
FONDO = (-80.0, -600.0)

# ------------------------------------------------ rampas (de generar-tierra.py)
STEP        = 0.84
_LNSTEP     = -math.log(STEP)
HUE_SHADOW  = 250.0 / 360.0
HUE_LIGHT   = 55.0 / 360.0
HUE_STEP    = 6.0 / 360.0
HUE_MAX     = 26.0 / 360.0
SAT_SHADOW  = 0.03
SAT_SH_MAX  = 0.10
SAT_LIGHT   = 0.06
_RAMP = {}


def _hue_toward(h, target, amt):
    d = (target - h + 0.5) % 1.0 - 0.5
    if abs(d) <= amt:
        return target
    return (h + math.copysign(amt, d)) % 1.0


def _hue_shadow(h, amt):
    if 60.0 / 360.0 <= h <= HUE_SHADOW:
        return min(h + amt, HUE_SHADOW)
    back = (h - HUE_SHADOW) % 1.0
    return (h - min(amt * 0.5, back)) % 1.0


def ramp(col, k, hue_mul=1.0):
    """Color `col` desplazado `k` escalones (k<0 sombra, k>0 luz)."""
    key = (int(col[0]), int(col[1]), int(col[2]), k, hue_mul)
    hit = _RAMP.get(key)
    if hit:
        return hit
    h, s, v = colorsys.rgb_to_hsv(key[0] / 255.0, key[1] / 255.0, key[2] / 255.0)
    if k < 0:
        if s < 0.12:
            h = 225.0 / 360.0
        h = _hue_shadow(h, min(HUE_MAX, -k * HUE_STEP) * hue_mul)
        s = min(1.0, s + min(SAT_SH_MAX, -k * SAT_SHADOW) * hue_mul)
        v *= STEP ** -k
    elif k > 0:
        h = _hue_toward(h, HUE_LIGHT, min(HUE_MAX, k * HUE_STEP) * hue_mul)
        s = max(0.0, s - k * SAT_LIGHT)
        v = min(1.0, v / STEP ** k)
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    out = (round(r * 255.0), round(g * 255.0), round(b * 255.0))
    _RAMP[key] = out
    return out


# ------------------------------------------------------- tierra / mar
import json


def rasterizar(features, rejilla, valor):
    """Pone `valor` en las celdas de `rejilla` que caen dentro de los
    polígonos GeoJSON, como rasterizar.py (cruces por fila y relleno
    par-impar), solo en la caja."""
    cruces = [[] for _ in range(H)]
    for feat in features:
        g = feat["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in polys:
            for ring in poly:
                lons = [p[0] for p in ring]
                lats = [p[1] for p in ring]
                if max(lons) < O or min(lons) > E or max(lats) < S or min(lats) > N:
                    continue
                n = len(ring)
                for i in range(n):
                    lon1, lat1 = ring[i]
                    lon2, lat2 = ring[(i + 1) % n]
                    if lat1 == lat2:
                        continue
                    y1, y2 = (N - lat1) * PPD, (N - lat2) * PPD
                    x1, x2 = (lon1 - O) / DLON, (lon2 - O) / DLON
                    if y1 > y2:
                        y1, y2, x1, x2 = y2, y1, x2, x1
                    for r in range(max(0, math.floor(y1)), min(H - 1, math.ceil(y2)) + 1):
                        yc = r + 0.5
                        if y1 <= yc < y2:
                            cruces[r].append(x1 + (x2 - x1) * (yc - y1) / (y2 - y1))
    for r in range(H):
        xs = sorted(cruces[r])
        fila = rejilla[r]
        for i in range(0, len(xs) - 1, 2):
            for c in range(max(0, int(xs[i] + 0.5)), min(W, int(xs[i + 1] + 0.5))):
                fila[c] = valor


# ------------------------------------------------------------- relieve
# El fino (elevacion-sahara.py: 240 px/grado, solo la zona del mapa) si
# está; si no, ETOPO1 a 24 px/grado (el del zoom de la Tierra).
_FINO = os.path.join(AQUI, "tierra-fuentes", "sahara240.json")
if os.path.exists(_FINO) and "--etopo1" not in sys.argv:
    with open(_FINO) as fh:
        _d = json.load(fh)
    _EPPD, (_, _EN, _EO, _) = _d["ppd"], _d["zona"]
    _EFW, _ruta = _d["ancho"], os.path.splitext(_FINO)[0] + ".i16"
else:
    _EPPD, _EN, _EO, _EFW = 24, 90.0, -180.0, 8640
    _ruta = os.path.join(AQUI, "tierra-fuentes", "etopo24.i16")
_EF = array("h")
with open(_ruta, "rb") as fh:
    _EF.frombytes(fh.read())
if sys.byteorder != "little":
    _EF.byteswap()
_EFH = len(_EF) // _EFW


def elev(lat, lon):
    """Altura (m), interpolada."""
    fr = (_EN - lat) * _EPPD - 0.5
    fc = (lon - _EO) * _EPPD - 0.5
    # fuera del dato (las cuentas de nieve miran 1° alrededor), el borde
    fr = min(max(fr, 0.0), _EFH - 1.001)
    fc = min(max(fc, 0.0), _EFW - 1.001)
    r0, c0 = math.floor(fr), math.floor(fc)
    tr, tc = fr - r0, fc - c0
    i0, i1 = r0 * _EFW, (r0 + 1) * _EFW
    a = _EF[i0 + c0] * (1 - tc) + _EF[i0 + c0 + 1] * tc
    b = _EF[i1 + c0] * (1 - tc) + _EF[i1 + c0 + 1] * tc
    return a * (1 - tr) + b * tr


# La costa: con el relieve fino, donde la altura pasa de 0, y es mar solo lo
# que está por debajo y conectado con el borde del mapa (las sebjas bajo el
# nivel del mar, como la de Tah junto a Tarfaya, siguen siendo tierra). Con
# ETOPO1, de Natural Earth 1:10m (a esta escala el relieve no da la costa).
LAND = [bytearray(W) for _ in range(H)]
if _EPPD >= 240:
    _bajo = [bytearray(1 if elev(lat_de(r), lon_de(c)) <= 0 else 0 for c in range(W)) for r in range(H)]
    _mar = [bytearray(W) for _ in range(H)]
    _cola = deque((r, c) for r in range(H) for c in (0, W - 1) if _bajo[r][c])
    _cola.extend((r, c) for r in (0, H - 1) for c in range(W) if _bajo[r][c])
    for r, c in _cola:
        _mar[r][c] = 1
    while _cola:
        r, c = _cola.popleft()
        for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= rr < H and 0 <= cc < W and _bajo[rr][cc] and not _mar[rr][cc]:
                _mar[rr][cc] = 1
                _cola.append((rr, cc))
    for r in range(H):
        LAND[r] = bytearray(1 - v for v in _mar[r])
    del _bajo, _mar
else:
    with open(os.path.join(AQUI, "tierra-fuentes", "ne_10m_land.geojson")) as fh:
        rasterizar(json.load(fh)["features"], LAND, 1)
paso(f"costas: {W} x {H} celdas con margen, {KM:.2f} km/celda")

# Países, de Natural Earth 1:10m. Natural Earth pone en Marruecos lo que
# controla al oeste del muro y deja al Sáhara Occidental solo lo de detrás;
# aquí el Sáhara Occidental va entero, con su frontera de 1975 (la de la
# ONU): lo de Marruecos al sur del paralelo 27°40' pasa al Sáhara.
# El muro y los cambios de frontera de cada época van en capas aparte.
PAISES = ["ESP", "PRT", "GIB", "DZA", "MRT", "MLI", "MAR", "SAH"]
LIMITE_SAHARA = 27.0 + 40.0 / 60.0
PAIS = [bytearray(W) for _ in range(H)]              # 0 = ninguno, i+1 = PAISES[i]
with open(os.path.join(AQUI, "tierra-fuentes", "ne_10m_admin_0_countries.geojson")) as fh:
    _feats = {f["properties"]["ADM0_A3"]: f for f in json.load(fh)["features"]}
for i, iso in enumerate(PAISES):
    rasterizar([_feats[iso]], PAIS, i + 1)
del _feats
_MAR, _SAH = PAISES.index("MAR") + 1, PAISES.index("SAH") + 1
for r in range(H):
    if lat_de(r) < LIMITE_SAHARA:
        fila = PAIS[r]
        for c in range(W):
            if fila[c] == _MAR:
                fila[c] = _SAH
paso("países")

# ----------------------------------------------- ruidos (de generar-tierra.py)
# El de la frontera de los biomas, cada 1,75° (7 celdas de 0,25°).
_vnoise = ruido_geo([(1.75, 1.0)], 1, suave=False)


def _ruido(capas):
    """Ruido de valor suave en varias escalas: [(celdas por nodo, peso)]."""
    gs = [(n, [[random.random() for _ in range(W // n + 2)] for _ in range(H // n + 2)], w)
          for n, w in capas]

    def f(r, c):
        tot = 0.0
        for n, g, w in gs:
            fr, fc = r / n, c / n
            r0, c0 = int(fr), int(fc)
            tr, tc = fr - r0, fc - c0
            tr, tc = tr * tr * (3 - 2 * tr), tc * tc * (3 - 2 * tc)
            a = g[r0][c0] * (1 - tc) + g[r0][c0 + 1] * tc
            b = g[r0 + 1][c0] * (1 - tc) + g[r0 + 1][c0 + 1] * tc
            tot += (a * (1 - tr) + b * tr) * w
        return tot
    return f


random.seed(4711)
_mix_noise = _ruido([(max(1, round(6 * KC / SCALE)), 0.65), (max(1, round(3 * KC / SCALE)), 0.35)])
# Manchas grandes (claros, erg y reg), cada 6° y 2,25°.
_patch_noise = ruido_geo([(6.0, 0.68), (2.25, 0.32)], 2)

# ---------------------------------------------------- biomas (como la Tierra)
_N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
BIOME = [bytearray(W) for _ in range(H)]
for r in range(H):
    lat = lat_de(r)
    for c in range(W):
        if not LAND[r][c]:
            continue
        lon = lon_de(c)
        nf = _vnoise(r, c) - 0.5
        des = max(min(lat - a0, a1 - lat, lon - o0, o1 - lon) for a0, a1, o0, o1 in DESIERTOS)
        if des > 2.0 or (des > -4.0 and nf * 9.0 < des):
            b = 2
        else:
            la = abs(lat) + nf * 4.0
            b = 1 if la < 12 else 3 if la < 34 else 0 if la < 52 else 4 if la < 66 else 5
        BIOME[r][c] = b
# filtro de moda 3x3: quita celdas de bioma sueltas
_nuevo = [bytearray(BIOME[r]) for r in range(H)]
for r in range(1, H - 1):
    for c in range(1, W - 1):
        if not LAND[r][c]:
            continue
        cnt = {}
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if LAND[r + dr][c + dc]:
                    v = BIOME[r + dr][c + dc]
                    cnt[v] = cnt.get(v, 0) + 1
        _nuevo[r][c] = max(cnt, key=cnt.get)
BIOME = _nuevo
paso("biomas")

# ------------------------------------- línea de costa y distancia al mar
COASTLVL = [bytearray(W) for _ in range(H)]          # 3 anillo oscuro, 2 y 1 los que suavizan
_LD = [bytearray(W) for _ in range(H)]
_dq = deque()
for r in range(H):
    for c in range(W):
        if LAND[r][c]:
            for dr, dc in _N4:
                rr, cc = r + dr, c + dc
                if 0 <= rr < H and 0 <= cc < W and not LAND[rr][cc]:
                    _LD[r][c] = 1
                    _dq.append((r, c))
                    break
while _dq:
    r, c = _dq.popleft()
    d = _LD[r][c]
    if d >= 4:
        continue
    for dr, dc in _N4:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and LAND[rr][cc] and not _LD[rr][cc]:
            _LD[rr][cc] = d + 1
            _dq.append((rr, cc))
for r in range(H):
    for c in range(W):
        d = _LD[r][c]
        if d:
            COASTLVL[r][c] = 3 if d <= 2 else 2 if d == 3 else 1
del _LD

DMAX = min(255, int((SEA_KM[2] + SEA_WOBBLE_KM) / KM) + 2)
SEADIST = [bytearray(W) for _ in range(H)]           # 0 = tierra; 1..DMAX = mar
for r in range(H):
    for c in range(W):
        if not LAND[r][c]:
            SEADIST[r][c] = DMAX
for r in range(H):
    for c in range(W):
        if LAND[r][c]:
            for dr, dc in _N4:
                rr, cc = r + dr, c + dc
                if 0 <= rr < H and 0 <= cc < W and SEADIST[rr][cc] == DMAX:
                    SEADIST[rr][cc] = 1
                    _dq.append((rr, cc))
while _dq:
    r, c = _dq.popleft()
    d = SEADIST[r][c]
    if d >= DMAX - 1:
        continue
    for dr, dc in _N4:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and SEADIST[rr][cc] == DMAX:
            SEADIST[rr][cc] = d + 1
            _dq.append((rr, cc))
paso("costa y mar")

# --------------------------------------------- relieve en escalones, roca, nieve
MTN_CONTRAST = 1.5
# Pendiente medida a ±RELIEVE_DD grados: 3 celdas, como las teselas de la
# Tierra (--relieve 3), así que cada nivel tiene su relieve; sin bajar de lo
# que da el dato.
RELIEVE_DD = max(3.0 / PPD, 1.5 / _EPPD)
MTNK = [bytearray(W) for _ in range(H)]              # escalón de relieve + 8
for r in range(H):
    lat = lat_de(r)
    for c in range(W):
        MTNK[r][c] = 8
        if not LAND[r][c]:
            continue
        lon = lon_de(c)
        if elev(lat, lon) < 250:
            continue
        dd = RELIEVE_DD
        ex = (elev(lat, lon + dd) - elev(lat, lon - dd)) * (0.5 / dd)
        ez = (elev(lat + dd, lon) - elev(lat - dd, lon)) * (0.5 / dd)
        kk = 900.0
        nl = math.sqrt(ex * ex + ez * ez + kk * kk) or 1.0
        hs = (ex * 0.6 - ez * 0.6 + kk * 0.75) / nl          # luz desde el NO
        m = max(0.62, min(1.16, 0.58 + hs * 0.58))
        MTNK[r][c] = 8 + max(-4, min(2, round(math.log(m) / _LNSTEP * MTN_CONTRAST)))
paso("relieve")

NIEVE_FINA_L0, NIEVE_FINA_LK, NIEVE_FINA_RANGO = 4300.0, 55.0, 600.0
ROCA_FINA_E0, ROCA_FINA_RANGO = 1200.0, 3000.0
SNOW_GAP, ROCK_GAP = 0.80, 0.15


def roca_nieve(lat, lon):
    e = elev(lat, lon)
    ra = (min(180, (int((e - ROCA_FINA_E0) / ROCA_FINA_RANGO * 255) // 45) * 45) / 180.0
          if e > ROCA_FINA_E0 else 0.0)
    sl = NIEVE_FINA_L0 - abs(lat) * NIEVE_FINA_LK
    sa = 0.0
    if e > sl:
        around = (elev(lat + 1, lon) + elev(lat - 1, lon)
                  + elev(lat, lon + 1) + elev(lat, lon - 1)) / 4.0
        relief = e - around
        if relief > 200:
            sa = min(1.0, (e - sl) / NIEVE_FINA_RANGO) * min(1.0, (relief - 200) / 500.0)
    sa = (int(min(1.0, sa) * 215) // 28) * 28 / 215.0
    return ra, sa


# ------------------------------------- mezcla de biomas a manchas y sabana
MEZCLA_R = round(9 * KC)
MIXBIO = [bytearray(BIOME[r]) for r in range(H)]
SAV = [bytearray(W) for _ in range(H)]


def _sat(match):
    """Tabla de suma acumulada de las celdas de tierra que cumplen `match`."""
    prev = array("i", bytes(4 * (W + 1)))
    filas = [prev]
    for r in range(H):
        lab, ln = BIOME[r], LAND[r]
        ind = [0] + [1 if ln[c] and match(lab[c]) else 0 for c in range(W)]
        prev = array("i", map(add, prev, accumulate(ind)))
        filas.append(prev)
    return filas


_SAT_B = [_sat(lambda v, k=k: v == k) for k in range(6)]
_SAT_L = _sat(lambda v: True)


def _win(T, i0, i1, j0, j1):
    return T[i1][j1] - T[i0][j1] - T[i1][j0] + T[i0][j0]


for r in range(H):
    i0, i1 = max(0, r - MEZCLA_R), min(H, r + MEZCLA_R + 1)
    for c in range(W):
        if not LAND[r][c]:
            continue
        j0, j1 = max(0, c - MEZCLA_R), min(W, c + MEZCLA_R + 1)
        own = BIOME[r][c]
        tot = _win(_SAT_L, i0, i1, j0, j1)
        if _win(_SAT_B[own], i0, i1, j0, j1) == tot:
            continue
        cnt = [_win(T, i0, i1, j0, j1) for T in _SAT_B]
        ka = max(range(6), key=cnt.__getitem__)
        kb = max((k for k in range(6) if k != ka), key=cnt.__getitem__)
        lo, hi = min(ka, kb), max(ka, kb)
        fh = cnt[hi] / float(cnt[ka] + cnt[kb])
        MIXBIO[r][c] = hi if smooth(0.25, 0.75, _mix_noise(r, c)) < fh else lo
        if hi == 2 and lo in (0, 1):
            SAV[r][c] = round(255 * cnt[2] / float(cnt[ka] + cnt[kb]))
del _SAT_B, _SAT_L
paso("mezcla de biomas")

PATCH = [bytearray(W) for _ in range(H)]             # 255 = bosque cerrado, 0 = claro
for r in range(H):
    for c in range(W):
        if LAND[r][c]:
            PATCH[r][c] = round(smooth(0.30, 0.68, _patch_noise(r, c)) * 255)

# ------------------------------------------------------------ copas
CROWN_SP = 1.0 / SCALE
CROWN_R = (0.55, 0.78)
_LX, _LY = -0.70, 0.71                 # hacia la luz (este, norte): el NO
CROWN = [bytearray(W) for _ in range(H)]
CROWN_U = [bytearray(W) for _ in range(H)]
CROWN_BIO = [bytearray(W) for _ in range(H)]
CROWN_DENS = (0.92, 1.0, 0.0, 0.30, 0.88, 0.0)
CROWN_K = ((-2, -1, 0, 1), (-2, -1, 0, 1), (0, 0, 0, 0), (0, -2, -1, 0), (-2, -1, 0, 1), (0, 0, 0, 0))
PATCH_VAR = (0.80, 0.25, 0.0, 0.5, 0.40, 0.0)


def _reparto(sp):
    """Puntos con jitter repartidos a `sp` grados de arco por la caja."""
    for i in range(int((N - S) / sp)):
        lat0 = S + i * sp
        nlon = max(1, round((E - O) * math.cos(math.radians(lat0 + sp / 2)) / sp))
        for j in range(nlon):
            yield (lat0 + random.uniform(0.1, 0.9) * sp,
                   O + (j + random.uniform(0.1, 0.9)) * (E - O) / nlon)


random.seed(20260913)
_copas = []
for clat, clon in _reparto(CROWN_SP):
    gr, gc = celda(clat, clon)
    if not (0 <= gr < H and 0 <= gc < W) or not LAND[gr][gc]:
        continue
    _copas.append((clat, clon, CROWN_SP * random.uniform(*CROWN_R),
                   random.randrange(256), MIXBIO[gr][gc]))
_copas.sort(key=lambda t: -t[0])                     # norte primero, sur encima
for clat, clon, rad, u, cb in _copas:
    cosl = math.cos(math.radians(clat))
    r0, c0 = celda(clat + rad, clon - rad / cosl)
    r1, c1 = celda(clat - rad, clon + rad / cosl)
    for r in range(max(0, r0), min(H - 1, r1) + 1):
        dy = (lat_de(r) - clat) / rad
        for c in range(max(0, c0), min(W - 1, c1) + 1):
            if not LAND[r][c]:
                continue
            dx = (lon_de(c) - clon) * cosl / rad
            d2 = dx * dx + dy * dy
            if d2 > 1.0:
                continue
            lit = dx * _LX + dy * _LY
            CROWN[r][c] = 3 if lit > 0.28 and d2 < 0.62 else 1 if lit < -0.30 and d2 > 0.30 else 2
            CROWN_U[r][c] = u
            CROWN_BIO[r][c] = cb
paso(f"copas ({len(_copas)})")

# ------------------------------------------------------------ dunas
DUNE_SP   = 1.65 / SCALE
DUNE_LEN  = (0.80 / SCALE, 1.30 / SCALE)
DUNE_BEND = 0.55 / SCALE
DUNE_LIT  = 0.30 / SCALE
DUNE_SH   = 0.42 / SCALE
DUNE_K    = (0, -2, -1, 1)
DUNE = [bytearray(W) for _ in range(H)]
random.seed(20260914)
_dunas = []
for dlat, dlon in _reparto(DUNE_SP):
    gr, gc = celda(dlat, dlon)
    if not (0 <= gr < H and 0 <= gc < W) or not LAND[gr][gc] or BIOME[gr][gc] != 2:
        continue
    if random.random() > 0.15 + 0.85 * PATCH[gr][gc] / 255.0:
        continue                                     # reg: pocas dunas sueltas
    ang = math.atan2(-_LX, _LY) + math.radians(random.uniform(-22, 22))
    _dunas.append((dlat, dlon, ang, random.uniform(*DUNE_LEN)))
_dunas.sort(key=lambda t: -t[0])
_alc = DUNE_LEN[1] + DUNE_SH + DUNE_BEND
for dlat, dlon, ang, hl in _dunas:
    ax, ay = math.cos(ang), math.sin(ang)
    nx, ny = -ay, ax
    if nx * _LX + ny * _LY < 0:
        nx, ny = -nx, -ny
    cosl = math.cos(math.radians(dlat))
    r0, c0 = celda(dlat + _alc, dlon - _alc / cosl)
    r1, c1 = celda(dlat - _alc, dlon + _alc / cosl)
    for r in range(max(0, r0), min(H - 1, r1) + 1):
        dy = lat_de(r) - dlat
        for c in range(max(0, c0), min(W - 1, c1) + 1):
            if not LAND[r][c] or BIOME[r][c] != 2:
                continue
            dx = (lon_de(c) - dlon) * cosl
            t = (dx * ax + dy * ay) / hl
            if t <= -1.0 or t >= 1.0:
                continue
            q = dx * nx + dy * ny + DUNE_BEND * t * t
            taper = 1.0 - t * t
            if 0.0 <= q < DUNE_LIT * (0.4 + 0.6 * taper):
                DUNE[r][c] = 3
            elif -DUNE_SH * taper < q < 0.0:
                DUNE[r][c] = 1 if q > -DUNE_SH * taper * 0.6 else 2
paso(f"dunas ({len(_dunas)})")


# ------------------------------------------------------ color de cada celda
_COAST_MIXK = (0.0, 0.20, 0.48, 0.84)


def color(r, c):
    """Como _surface_at + celda_material de la Tierra, a plena luz."""
    lat, lon = lat_de(r), lon_de(c)
    if not LAND[r][c]:
        sd = SEADIST[r][c]
        if sd * KM <= SEA_KM[0]:
            surf = OCEAN_COAST
        elif MAR == "fondo":
            e = elev(lat, lon) + (_mix_noise(r, c) - 0.5) * 60.0
            surf = OCEAN_MID if e > FONDO[0] else OCEAN_SHALLOW if e > FONDO[1] else OCEAN_DEEP
        else:
            d = sd * KM + (_mix_noise(r, c) - 0.5) * SEA_WOBBLE_KM
            surf = OCEAN_MID if d <= SEA_KM[1] else OCEAN_SHALLOW if d <= SEA_KM[2] else OCEAN_DEEP
        return ramp(surf, 0, 0.45)
    bg = MIXBIO[r][c]
    pv = 1.0 - PATCH[r][c] / 255.0
    code = CROWN[r][c]
    u = (CROWN_U[r][c] + 0.5) / 256.0
    b = CROWN_BIO[r][c] if code else bg
    sav = smooth(0.0, 0.5, SAV[r][c] / 255.0)
    thin = 1.0 - SAV_THIN * sav
    dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv) * thin
    suelo = True
    tex_k = 0
    if code and u >= dens:
        b, tex_k = bg, 0
    elif code == 0:
        b = bg
        dens = CROWN_DENS[b] * (1.0 - PATCH_VAR[b] * pv) * thin
        tex_k = round(CROWN_K[b][0] * smooth(0.45, 0.85, dens))
    else:
        tex_k = CROWN_K[b][code]
        suelo = False
    surf = BIOME_COLS[b]
    claro = PATCH_VAR[b] * pv
    if b == 0 and claro:
        surf = mix(surf, MEADOW, claro * 0.75)
    if sav and suelo and b in (0, 1) and \
            smooth(0.25, 0.75, _mix_noise(H - 1 - r, (c + W // 2) % W)) < sav:
        surf = SAV_GROUND
    mk = MTNK[r][c] - 8
    if b == 2:
        surf = mix(surf, mix(REG, ERG, PATCH[r][c] / 255.0), 0.6)
        if mk == 0:
            tex_k = DUNE_K[DUNE[r][c]]
    ra, sa = roca_nieve(lat, lon)
    if sa and (sa > SNOW_GAP if code == 0 else sa > 0.05 + u * 0.55):
        surf = SNOW
        tex_k = (min(0, tex_k) if code else 0) + mk
    elif ra and (ra > ROCK_GAP if code == 0 else ra > 0.35 + u * 0.6):
        surf, tex_k = ROCK, mk
    else:
        tex_k += mk
    lvl = COASTLVL[r][c]
    if lvl:
        surf = mix(surf, COAST_COL, _COAST_MIXK[lvl])
    return ramp(surf, int(tex_k), 1.0)


# ------------------------------------------------------------ fronteras
# Una celda es frontera si su vecina de la derecha o de abajo es de otro país
# (así la línea sale de 1 px). Solo entre celdas de tierra con país: donde la
# costa de Natural Earth y la de los países no coinciden no sale línea.
FRONTERA = _arg("--frontera", "discontinua")   # continua | discontinua | clara
FRONTERA_COL = {"continua": (COAST_COL, 0.55), "discontinua": (COAST_COL, 0.70),
                "clara": ((0xf6, 0xf0, 0xe0), 0.85)}
TRAZO = 3                              # px de trazo y de hueco en las discontinuas
GROSOR = int(_arg("--grosor", "2"))    # 1: la línea a un lado; 2: a los dos
_VECINAS = ((0, 1), (1, 0)) if GROSOR == 1 else ((0, 1), (1, 0), (0, -1), (-1, 0))


def es_frontera(r, c):
    p = PAIS[r][c]
    if not p or not LAND[r][c]:
        return False
    for dr, dc in _VECINAS:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and LAND[rr][cc] and PAIS[rr][cc] and PAIS[rr][cc] != p:
            return True
    return False


def con_frontera(col, r, c):
    if FRONTERA == "no" or not es_frontera(r, c):
        return col
    if FRONTERA != "continua" and (r // TRAZO + c // TRAZO) % 2:
        return col
    tinta, a = FRONTERA_COL[FRONTERA]
    return mix(col, tinta, a)


# ------------------------------------------------------------- salida
# La zona, sin el margen: filas RA..RB y columnas CA..CB de la rejilla del
# nivel, que en la rejilla con margen empiezan en MR y MC.
def pixel(R, C):
    """RGBA del píxel (R, C) de la rejilla del nivel; transparente fuera de la zona."""
    if not (RA <= R < RB and CA <= C < CB):
        return b"\0\0\0\0"
    r, c = R - RA + MR, C - CA + MC
    col = con_frontera(color(r, c), r, c)
    return bytes((col[0], col[1], col[2], 255))


if PRUEBA:
    filas = [b"".join(pixel(R, C) for C in range(CA, CB)) for R in range(RA, RB)]
    write_rgba(PRUEBA, CB - CA, RB - RA, filas)
    paso(f"{PRUEBA}: {CB - CA} x {RB - RA} px, {len(_RAMP)} colores")
    sys.exit(0)

# Teselas de la web. Se borran antes las del nivel que haya.
import shutil
carpeta = os.path.join(WEB, f"n{PPD}")
shutil.rmtree(carpeta, ignore_errors=True)
os.makedirs(carpeta)
teselas = []
for f in range(RA // TESELA, (RB - 1) // TESELA + 1):
    for k in range(CA // TESELA, (CB - 1) // TESELA + 1):
        R0, C0 = f * TESELA, k * TESELA
        alto, ancho = min(TESELA, ALTO - R0), min(TESELA, ANCHO - C0)
        filas = [b"".join(pixel(R, C) for C in range(C0, C0 + ancho)) for R in range(R0, R0 + alto)]
        write_rgba(os.path.join(carpeta, f"{f}-{k}.png"), ancho, alto, filas)
        teselas.append(f"{f}-{k}")
paso(f"{carpeta}: {len(teselas)} teselas, {len(_RAMP)} colores")

# sahara-mapa.json: lo que necesita la web para pasar de grados a píxeles
# (x = (lon - caja[2]) * ppd * coslat, y = (caja[1] - lat) * ppd) y qué
# teselas hay de cada nivel.
ruta = os.path.join(WEB, "sahara-mapa.json")
try:
    with open(ruta) as fh:
        datos = json.load(fh)
except (OSError, ValueError):
    datos = {}
niveles = [n for n in datos.get("niveles", []) if n["ppd"] != PPD]
niveles.append({"ppd": PPD, "ancho": ANCHO, "alto": ALTO, "teselas": teselas})
datos = {"caja": CAJA, "coslat": COSLAT, "tesela": TESELA,
         "niveles": sorted(niveles, key=lambda n: n["ppd"])}
with open(ruta, "w") as fh:
    json.dump(datos, fh, separators=(",", ":"))
