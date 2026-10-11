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

Fuentes (las mismas del zoom de la Tierra, fuera de Git):
  tierra-fuentes/ne_10m_land.geojson   costas (ver rasterizar.py)
  tierra-fuentes/etopo24.i16           relieve (ver elevacion-fina.py)

Uso (desde arte/):
  python3 generar-sahara.py salida.png [--ppd 64] [--mar fondo|distancia]
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


PPD = int(_arg("--ppd", "64"))         # celdas (píxeles) por grado de latitud
MAR = _arg("--mar", "fondo")
SALIDA = [a for i, a in enumerate(sys.argv[1:], 1)
          if not a.startswith("--") and not sys.argv[i - 1].startswith("--")][0]

# La caja (S, N, O, E en grados): del sur de Mauritania (La Güera, Cabo
# Blanco) a la costa española del Estrecho, y de El Hierro a Melilla.
CAJA = (20.0, 37.2, -19.0, -1.0)
MARGEN = 3.0                           # se calcula con margen para que la mezcla
                                       # de biomas y las franjas no se corten en el borde
S, N, O, E = CAJA[0] - MARGEN, CAJA[1] + MARGEN, CAJA[2] - MARGEN, CAJA[3] + MARGEN
COSLAT = math.cos(math.radians((CAJA[0] + CAJA[1]) / 2))
DLAT = 1.0 / PPD
DLON = 1.0 / (PPD * COSLAT)            # celdas cuadradas en km
H = round((N - S) / DLAT)
W = round((E - O) / DLON)
KM = 111.2 / PPD                       # km por celda

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
# Rasterizado de las costas de Natural Earth 1:10m, como rasterizar.py
# (cruces por fila y relleno par-impar), solo en la caja.
import json
with open(os.path.join(AQUI, "tierra-fuentes", "ne_10m_land.geojson")) as fh:
    _geo = json.load(fh)
_cruces = [[] for _ in range(H)]
for feat in _geo["features"]:
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
                        _cruces[r].append(x1 + (x2 - x1) * (yc - y1) / (y2 - y1))
del _geo
LAND = [bytearray(W) for _ in range(H)]
for r in range(H):
    xs = sorted(_cruces[r])
    fila = LAND[r]
    for i in range(0, len(xs) - 1, 2):
        for c in range(max(0, int(xs[i] + 0.5)), min(W, int(xs[i + 1] + 0.5))):
            fila[c] = 1
del _cruces
paso(f"costas: {W} x {H} celdas con margen, {KM:.2f} km/celda")

# ------------------------------------------------------------- relieve
_EF = array("h")
with open(os.path.join(AQUI, "tierra-fuentes", "etopo24.i16"), "rb") as fh:
    _EF.frombytes(fh.read())
if sys.byteorder != "little":
    _EF.byteswap()
_EFW, _EFH = 8640, 4320


def elev(lat, lon):
    """Altura (m) de ETOPO1 a 24 px/grado, interpolada."""
    fr = (90.0 - lat) * 24.0 - 0.5
    fc = (lon + 180.0) * 24.0 - 0.5
    r0, c0 = math.floor(fr), math.floor(fc)
    tr, tc = fr - r0, fc - c0
    i0, i1 = r0 * _EFW, (r0 + 1) * _EFW
    a = _EF[i0 + c0] * (1 - tc) + _EF[i0 + c0 + 1] * tc
    b = _EF[i1 + c0] * (1 - tc) + _EF[i1 + c0 + 1] * tc
    return a * (1 - tr) + b * tr


# ----------------------------------------------- ruidos (de generar-tierra.py)
random.seed(20260910)
_NC = max(1, round(7 * KC))
_NG = [[random.random() for _ in range(W // _NC + 2)] for _ in range(H // _NC + 2)]


def _vnoise(r, c):
    fr, fc = r / _NC, c / _NC
    r0, c0 = int(fr), int(fc)
    tr, tc = fr - r0, fc - c0
    a = _NG[r0][c0] * (1 - tc) + _NG[r0][c0 + 1] * tc
    b = _NG[r0 + 1][c0] * (1 - tc) + _NG[r0 + 1][c0 + 1] * tc
    return a * (1 - tr) + b * tr


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
random.seed(777)
_patch_noise = _ruido([(round(24 * KC), 0.68), (round(9 * KC), 0.32)])

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
RELIEVE_DD = 3.0 / 32.0                # pendiente medida a ±este paso (grados), el de las
                                       # teselas de la Tierra con --relieve 3 a 32 px/grado
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


# Recorte a la caja, sin el margen.
r0, r1 = round((N - CAJA[1]) * PPD), round((N - CAJA[0]) * PPD)
c0, c1 = round((CAJA[2] - O) / DLON), round((CAJA[3] - O) / DLON)
filas = []
for r in range(r0, r1):
    fila = bytearray((c1 - c0) * 4)
    for i, c in enumerate(range(c0, c1)):
        col = color(r, c)
        fila[i * 4:i * 4 + 4] = bytes((col[0], col[1], col[2], 255))
    filas.append(fila)
write_rgba(SALIDA, c1 - c0, r1 - r0, filas)
paso(f"{SALIDA}: {c1 - c0} x {r1 - r0} px, {len(_RAMP)} colores")
