#!/usr/bin/env python3
"""El mapa en pixel art de la tarjeta de una base (docs/nuevabase.md): la
zona de la base, plana y de día, con el estilo de la Tierra y del mapa del
Sáhara, más lo que da OpenStreetMap a esta escala (pistas, ciudades,
carreteras, agua, minas y, de cerca, calles y edificios).

Las reglas de la Tierra (biomas por la lluvia, mezcla a manchas, copas,
relieve en escalones, roca, nieve, costa, rampas con giro de tono) van
copiadas de generar-sahara.py, con el mismo nombre: si se cambian allí y se
quieren aquí, cambiarlas a mano. Diferencias con el Sáhara:
  - el relieve se sombrea con mucha menos exageración (KK): a 10-90 km de
    ancho, la del planeta convertía un llano en montañas;
  - sin dunas (son del erg sahariano);
  - las ciudades, de OSM más Natural Earth, sin la rejilla de manzanas:
    tejados sueltos de tres tonos y algún árbol;
  - lagos secos (solo los que tienen nombre: una mina sin nombre salía como
    un lago), agua y minas de OSM.

Fuentes: arte/bases-fuentes/<slug>/ (fuentes-base.py). Uso (desde arte/):

  python3 generar-base.py <slug>               # las cuatro vistas, de prueba:
                                               #   public/bases/prueba/<slug>-<km>.png/.json
  python3 generar-base.py <slug> --km 90       # solo una
  python3 generar-base.py <slug> --elegir 90   # la elegida pasa a public/bases/<slug>.png,
                                               #   sus nombres a bases.json; se borran
                                               #   las de prueba y las fuentes
"""
import colorsys
import json
import math
import os
import random
import shutil
import subprocess
import sys
import time
from array import array
from collections import deque
from itertools import accumulate
from operator import add

from png8 import write_rgba
from vistas_base import ALTO, ANCHO, BASES, KMS, caja, vista

T0 = time.time()
AQUI = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(AQUI, "..", "public", "bases")
DATOS = os.path.join(AQUI, "..", "src", "data", "bases.json")


def _arg(nombre, defecto):
    return sys.argv[sys.argv.index(nombre) + 1] if nombre in sys.argv else defecto


if len(sys.argv) < 2 or sys.argv[1] not in {b["slug"] for b in BASES.values()}:
    sys.exit("uso: generar-base.py <slug> [--sin-ne] [--seco] [--sin-arena] [--km 10|18|40|90 | --elegir <km>]")
SLUG = sys.argv[1]
NOMBRE, BASE = next((k, b) for k, b in BASES.items() if b["slug"] == SLUG)
FUENTES_DIR = os.path.join(AQUI, "bases-fuentes", SLUG)
PRUEBA = os.path.join(WEB, "prueba")

if "--elegir" in sys.argv:
    km = int(_arg("--elegir", "0"))
    png = os.path.join(PRUEBA, f"{SLUG}-{km}.png")
    if not os.path.exists(png):
        sys.exit(f"no está {png}: generar antes las vistas")
    shutil.copy(png, os.path.join(WEB, f"{SLUG}.png"))
    with open(os.path.join(PRUEBA, f"{SLUG}-{km}.json")) as fh:
        nombres = json.load(fh)["nombres"]
    with open(DATOS) as fh:
        datos = json.load(fh)
    datos[NOMBRE]["mapa"] = {"km": km, "nombres": nombres}
    with open(DATOS, "w") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    for f in os.listdir(PRUEBA):
        if f.startswith(f"{SLUG}-"):
            os.remove(os.path.join(PRUEBA, f))
    if not os.listdir(PRUEBA):
        os.rmdir(PRUEBA)
    shutil.rmtree(FUENTES_DIR, ignore_errors=True)
    print(f"public/bases/{SLUG}.png ({km} km); borradas las pruebas y {FUENTES_DIR}", file=sys.stderr)
    sys.exit(0)

if "--km" not in sys.argv:
    # Las cuatro vistas, cada una en su proceso (a la vez).
    extra = [a for a in sys.argv[2:] if a in ("--sin-ne", "--seco", "--sin-arena")]
    procs = [subprocess.Popen([sys.executable, os.path.abspath(__file__), SLUG, "--km", str(k)] + extra) for k in KMS]
    sys.exit(max(p.wait() for p in procs))

if not os.path.isdir(FUENTES_DIR):
    sys.exit(f"faltan las fuentes: python3 fuentes-base.py {SLUG}")
V = vista(int(_arg("--km", "90")))
KM_VISTA = V["km"]
PPD = V["ppd"]
CAJA = caja(BASE, V)                                # S, N, O, E de lo que se ve
COSLAT = math.cos(math.radians(BASE["lat"]))
DLAT = 1.0 / PPD
DLON = 1.0 / (PPD * COSLAT)                         # celdas cuadradas en km
KM = 111.2 / PPD                                    # km por celda
MR = MC = math.ceil(V["margen"] * PPD)              # margen, en celdas
N = CAJA[1] + MR * DLAT                             # la rejilla con el margen
O = CAJA[2] - MC * DLON
H, W = ALTO + 2 * MR, ANCHO + 2 * MC
S = N - H * DLAT
E = O + W * DLON
KC = PPD / 4.0                                      # celdas por cada 0,25°
SCALE = 1.5 * PPD / 8.0                             # píxeles respecto al planeta de 400 px
KK = 6000.0                                         # aplanado del sombreado (la Tierra: 900)


def fuente(nombre):
    return os.path.join(FUENTES_DIR, nombre)


def lat_de(r):
    return N - (r + 0.5) * DLAT


def lon_de(c):
    return O + (c + 0.5) * DLON


def celda(lat, lon):
    return int((N - lat) * PPD), int((lon - O) / DLON)


def _hash01(i, j, semilla):
    h = (i * 374761393 + j * 668265263 + semilla * 1442695041) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFFFF) / float(0x1000000)


def ruido_geo(capas, semilla, suave=True):
    """Ruido de valor en grados: [(separación de nodos en grados, peso)], con
    los nodos en grados enteros: igual en las cuatro vistas."""
    gs = []
    for k, (sep, w) in enumerate(capas):
        i0 = math.floor((90 - N) / sep) - 1
        j0 = math.floor((O + 180) * COSLAT / sep) - 1
        ni = int(H * DLAT / sep) + 4
        nj = int(W * DLON * COSLAT / sep) + 4
        g = [[_hash01(i0 + i, j0 + j, semilla * 31 + k) for j in range(nj)] for i in range(ni)]
        gs.append((sep, w, i0, j0, g))

    def f(r, c):
        tot = 0.0
        for sep, w, i0, j0, g in gs:
            fy = (90 - lat_de(r)) / sep - i0
            fx = (lon_de(c) + 180) * COSLAT / sep - j0
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
    print(f"  [{KM_VISTA} km] {msg} ({time.time() - T0:.0f} s)", file=sys.stderr)


# ------------------------------------------- paleta (de generar-tierra.py)
OCEAN_COAST   = (0x5b, 0xd0, 0xe6)
OCEAN_SHALLOW = (0x43, 0x8f, 0xc6)
OCEAN_DEEP    = (0x1d, 0x50, 0x8c)
OCEAN_MID     = (0x4f, 0xb0, 0xd6)
OCEAN_TALUD   = (0x2f, 0x6e, 0xab)
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
# --seco (zonas desérticas, como Oriente Medio): la estepa, en pardo, y la
# lluvia sin aumentar por la altura (la de WorldClim ya la lleva).
SECO = "--seco" in sys.argv
if SECO:
    BIOME_COLS[3] = (0xa6, 0x8c, 0x5e)
MEADOW     = (0x9d, 0xbf, 0x6c)
SAV_GROUND = (0xc9, 0xb1, 0x62)
SAV_THIN   = 0.62
ERG = (0xdc, 0xb6, 0x76)
REG = (0xc2, 0xb0, 0x8e)
# Lo de OSM.
PISTA_COL = (None, (0xb8, 0xa8, 0x8e), (0x4a, 0x48, 0x48), (0x8c, 0x88, 0x84))   # tierra/sal, asfalto, plataforma
PLAYA_COL = (0xe8, 0xdf, 0xcc)                       # lago seco
MINA_COL = (0xb4, 0xab, 0x9e)                        # cantera, mina (con su relieve)
CAMINO_COL = (None, (0x8a, 0x7b, 0x68), (0x5a, 0x4f, 0x45), (0xa8, 0x9d, 0x8a))  # carretera, autovía, calle
RIO_COL = (0x3f, 0x8c, 0xc8)
EDIF_COL = (0xd6, 0xd2, 0xca)
URB_COL = (None, (0xdc, 0xd3, 0xc2), (0xbd, 0xb0, 0x98), (0x92, 0x84, 0x6e), (0x86, 0xa8, 0x5c))

# Franjas del mar: la turquesa pegada a la costa (km) y el resto por
# profundidad (m): intermedia, plataforma, talud y profundo.
SEA_KM0 = 4.0
FONDO = (-80.0, -600.0, -1500.0)

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


def rejilla():
    return [bytearray(W) for _ in range(H)]


def rasterizar(features, rej, valor):
    """Pone `valor` en las celdas de `rej` que caen dentro de los polígonos
    GeoJSON (cruces por fila y relleno par-impar)."""
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
        fila = rej[r]
        for i in range(0, len(xs) - 1, 2):
            for c in range(max(0, int(xs[i] + 0.5)), min(W, int(xs[i + 1] + 0.5))):
                fila[c] = valor


def trazar(puntos, rej, valor, rad=0.0):
    """Una línea (lista de [lon, lat]) celda a celda, sin huecos; con `rad`
    (celdas) de grosor, un disco en cada paso. Si dos se cruzan, se queda el
    valor mayor."""
    k = int(rad + 1)
    disco = [(a, b) for a in range(-k, k + 1) for b in range(-k, k + 1)
             if a * a + b * b <= rad * rad + 0.25] if rad >= 0.75 else [(0, 0)]
    for (lo1, la1), (lo2, la2) in zip(puntos, puntos[1:]):
        r1, c1 = (N - la1) * PPD, (lo1 - O) / DLON
        r2, c2 = (N - la2) * PPD, (lo2 - O) / DLON
        if max(r1, r2) < -k or min(r1, r2) > H + k or max(c1, c2) < -k or min(c1, c2) > W + k:
            continue
        n = int(max(abs(r2 - r1), abs(c2 - c1)) * 2) + 1
        for j in range(n + 1):
            r0, c0 = int(r1 + (r2 - r1) * j / n), int(c1 + (c2 - c1) * j / n)
            for a, b in disco:
                r, c = r0 + a, c0 + b
                if 0 <= r < H and 0 <= c < W and rej[r][c] < valor:
                    rej[r][c] = valor


# ------------------------------------------------------------- relieve
# Copernicus a 30 m donde lo hay y la vista lo pide; si no, a 90 m. Lo que
# no cubre ninguno (las piezas de solo mar) es mar, a 0 m.
def _dem(nombre, ppd_minimo=0):
    if PPD < ppd_minimo or not os.path.exists(fuente(nombre + ".json")):
        return None
    with open(fuente(nombre + ".json")) as fh:
        d = json.load(fh)
    s, n, o, e = d["zona"]
    datos = array("h")
    with open(fuente(nombre + ".i16"), "rb") as fh:
        datos.frombytes(fh.read())
    if sys.byteorder != "little":
        datos.byteswap()
    return (d["ppd"], n, o, s, e, d["ancho"], d["alto"], datos)


DEMS = [f for f in (_dem("dem30", 600), _dem("dem90")) if f]
_EPPD = DEMS[0][0]


def _bilineal(f, lat, lon):
    ppd, n, o, _, _, ancho, alto, datos = f
    fr = min(max((n - lat) * ppd - 0.5, 0.0), alto - 1.001)
    fc = min(max((lon - o) * ppd - 0.5, 0.0), ancho - 1.001)
    r0, c0 = int(fr), int(fc)
    tr, tc = fr - r0, fc - c0
    i0, i1 = r0 * ancho, (r0 + 1) * ancho
    a = datos[i0 + c0] * (1 - tc) + datos[i0 + c0 + 1] * tc
    b = datos[i1 + c0] * (1 - tc) + datos[i1 + c0 + 1] * tc
    return a * (1 - tr) + b * tr


def elev(lat, lon):
    """Altura (m), interpolada, de la fuente más fina que cubre el punto."""
    for f in DEMS:
        if f[3] <= lat < f[1] and f[2] <= lon < f[4]:
            return _bilineal(f, lat, lon)
    return 0.0


# La costa: donde la altura pasa de 0; es mar lo que está por debajo y
# conectado con el borde (lo bajo de tierra adentro sigue siendo tierra).
_bajo = [bytearray(1 if elev(lat_de(r), lon_de(c)) <= 0 else 0 for c in range(W)) for r in range(H)]
_mar = rejilla()
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
LAND = [bytearray(1 - v for v in _mar[r]) for r in range(H)]
del _bajo, _mar
paso(f"costa: {W} x {H} celdas con margen, {KM * 1000:.0f} m/celda")


def _en_la_rejilla(f):
    g = f["geometry"]
    polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    return any(min(p[0] for p in poly[0]) <= E and max(p[0] for p in poly[0]) >= O and
               min(p[1] for p in poly[0]) <= N and max(p[1] for p in poly[0]) >= S for poly in polys)


def _ne(nombre):
    with open(fuente(f"ne_{nombre}.geojson")) as fh:
        return [f for f in json.load(fh)["features"] if f["geometry"] and _en_la_rejilla(f)]


# Países, de Natural Earth 1:10m (para las fronteras).
PAIS = rejilla()
for i, f in enumerate(_ne("admin_0_countries")):
    rasterizar([f], PAIS, i + 1)
paso("países")

# ----------------------------------------------- ruidos (de generar-tierra.py)
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
# Manchas de claros, erg y reg: cada 0,6° y 0,22° (en el Sáhara, 6° y
# 2,25°: en una base quedaban fijas y caían al azar en un extremo).
_patch_noise = ruido_geo([(0.6, 0.68), (0.22, 0.32)], 2)

# ---------------------------------------------------------------- biomas
# Por la lluvia de verdad (WorldClim 2.1, lluvia anual a 10'), que sube con
# la altura (en los montes llueve más): desierto, estepa o verde.
LLUVIA_DESIERTO, LLUVIA_ESTEPA = 200.0, 450.0      # mm al año (con la altura)
LLUVIA_ALTURA = (300.0, 1200.0)                    # desde dónde y cada cuánto se dobla
from PIL import Image  # noqa: E402

_ll = Image.open(fuente("lluvia.tif")).load()


def lluvia(lat, lon):
    """mm al año, interpolada (el mar de WorldClim, como el vecino más seco)."""
    fx, fy = (lon + 180) * 6 - 0.5, (90 - lat) * 6 - 0.5
    x0, y0 = int(fx), int(fy)
    tx, ty = fx - x0, fy - y0
    v = [_ll[x, y] for y in (y0, y0 + 1) for x in (x0, x0 + 1)]
    tierra = [a for a in v if a > -1e30] or [0.0]
    v = [a if a > -1e30 else min(tierra) for a in v]
    return (v[0] * (1 - tx) + v[1] * tx) * (1 - ty) + (v[2] * (1 - tx) + v[3] * tx) * ty


BIOME = rejilla()
_umbral = (math.log(LLUVIA_DESIERTO), math.log(LLUVIA_ESTEPA))
for r in range(H):
    lat = lat_de(r)
    for c in range(W):
        if not LAND[r][c]:
            continue
        lon = lon_de(c)
        sube = 1.0 if SECO else 1 + max(0.0, elev(lat, lon) - LLUVIA_ALTURA[0]) / LLUVIA_ALTURA[1]
        x = math.log(max(1.0, lluvia(lat, lon) * sube))
        x += (_vnoise(r, c) - 0.5) * 0.4                # borde ondulado, como el de la Tierra
        BIOME[r][c] = 2 if x < _umbral[0] else 3 if x < _umbral[1] else 0
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
_N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
COASTLVL = rejilla()                                 # 3 anillo oscuro, 2 y 1 los que suavizan
SEADIST = rejilla()                                  # 0 = tierra; km al mar, en celdas (hasta 255)
_LD = rejilla()
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
_dm = deque()
for r, c in _dq:
    for dr, dc in _N4:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and not LAND[rr][cc] and not SEADIST[rr][cc]:
            SEADIST[rr][cc] = 1
            _dm.append((rr, cc))
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
while _dm:
    r, c = _dm.popleft()
    d = SEADIST[r][c]
    if d >= 254:
        continue
    for dr, dc in _N4:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and not LAND[rr][cc] and not SEADIST[rr][cc]:
            SEADIST[rr][cc] = d + 1
            _dm.append((rr, cc))
paso("costa y mar")

# --------------------------------------------- relieve en escalones, roca, nieve
MTN_CONTRAST = 1.5
# Pendiente medida a ±dd grados (vistas_base.py), sin bajar de lo que da el dato.
RELIEVE_DD = max(V["dd"], 1.5 / _EPPD)
MTNK = rejilla()                                     # escalón de relieve + 8
for r in range(H):
    lat = lat_de(r)
    for c in range(W):
        MTNK[r][c] = 8
        if not LAND[r][c]:
            continue
        lon = lon_de(c)
        dd = RELIEVE_DD
        ex = (elev(lat, lon + dd) - elev(lat, lon - dd)) * (0.5 / dd)
        ez = (elev(lat + dd, lon) - elev(lat - dd, lon)) * (0.5 / dd)
        nl = math.sqrt(ex * ex + ez * ez + KK * KK) or 1.0
        hs = (ex * 0.6 - ez * 0.6 + KK * 0.75) / nl         # luz desde el NO
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
MEZCLA_R = round(0.4 * KC)
MIXBIO = [bytearray(BIOME[r]) for r in range(H)]
SAV = rejilla()


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

PATCH = rejilla()                                    # 255 = bosque cerrado, 0 = claro
for r in range(H):
    for c in range(W):
        if LAND[r][c]:
            PATCH[r][c] = round(smooth(0.30, 0.68, _patch_noise(r, c)) * 255)

# ------------------------------------------------------------ copas
CROWN_SP = 1.0 / SCALE
CROWN_R = (0.55, 0.78)
_LX, _LY = -0.70, 0.71                 # hacia la luz (este, norte): el NO
CROWN = rejilla()
CROWN_U = rejilla()
CROWN_BIO = rejilla()
CROWN_DENS = (0.92, 1.0, 0.0, 0.30, 0.88, 0.0)
CROWN_K = ((-2, -1, 0, 1), (-2, -1, 0, 1), (0, 0, 0, 0), (0, -2, -1, 0), (-2, -1, 0, 1), (0, 0, 0, 0))
PATCH_VAR = (0.80, 0.25, 0.0, 0.5, 0.40, 0.0)


def _reparto(sp):
    """Puntos con jitter repartidos a `sp` grados de arco por la rejilla."""
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


# ------------------------------------------------------------ OpenStreetMap
def _osm(nombre):
    with open(fuente(f"osm-{nombre}.json")) as fh:
        return json.load(fh)["elements"]


def _geom(e):
    return [(p["lon"], p["lat"]) for p in e.get("geometry", [])]


def _anillos(rel):
    """Junta los ways «outer» de una relación en anillos cerrados."""
    trozos = [[(p["lon"], p["lat"]) for p in m["geometry"]] for m in rel.get("members", [])
              if m.get("role") == "outer" and m.get("geometry")]
    anillos = []
    while trozos:
        a = trozos.pop()
        while a[0] != a[-1]:
            for i, t in enumerate(trozos):
                if t[0] == a[-1]:
                    a += t[1:]
                elif t[-1] == a[-1]:
                    a += t[::-1][1:]
                elif t[-1] == a[0]:
                    a = t[:-1] + a
                elif t[0] == a[0]:
                    a = t[::-1][:-1] + a
                else:
                    continue
                trozos.pop(i)
                break
            else:
                break
        anillos.append(a)
    return anillos


def _poligonos(e):
    if e["type"] == "relation":
        return [{"geometry": {"type": "Polygon", "coordinates": [a]}} for a in _anillos(e)]
    g = _geom(e)
    return [{"geometry": {"type": "Polygon", "coordinates": [g]}}] if len(g) > 2 else []


def _ancho(t, defecto):
    """Ancho (m) de una pista: la etiqueta `width` (en m, o en pies con ')."""
    a = t.get("width", "")
    try:
        return float(a.rstrip("'")) * (0.3048 if a.endswith("'") else 1)
    except ValueError:
        return defecto


# Ciudades: las manchas de Natural Earth más las zonas urbanas de OSM (en
# OSM hay ciudades a medio mapear). Con --sin-ne, solo OSM: la mancha de
# Natural Earth de Fort Bragg cubre también todo su bosque.
URBANA = rejilla()
if "--sin-ne" not in sys.argv:
    rasterizar(_ne("urban_areas"), URBANA, 1)
rasterizar([q for e in _osm("urbano") for q in _poligonos(e)], URBANA, 1)
# Agua: lagos, embalses y balsas; ríos y canales (1 px).
LAGO, RIO = rejilla(), rejilla()
# Lagos secos: los de Natural Earth y los de OSM con nombre.
PLAYA = rejilla()
rasterizar(_ne("playas"), PLAYA, 1)
for e in _osm("agua"):
    t = e.get("tags", {})
    if t.get("natural") == "water":
        rasterizar(_poligonos(e), LAGO, 1)
    elif t.get("waterway"):
        trazar(_geom(e), RIO, 1)
    elif t.get("natural") == "sand" and "--sin-arena" in sys.argv:
        continue  # el desierto de arena de OSM (Registán) no es un lago seco: se queda el terreno
    else:
        rasterizar(_poligonos(e), PLAYA, 1)
MINA = rejilla()
rasterizar([q for e in _osm("minas") for q in _poligonos(e)], MINA, 1)
# Carreteras: autovías (2) y carreteras (1); las terciarias, de cerca.
CAMINO = rejilla()
for e in _osm("carreteras"):
    tipo = e["tags"].get("highway", "")
    if tipo.startswith(("motorway", "trunk")):
        trazar(_geom(e), CAMINO, 2, 12 / (KM * 1000))
    elif tipo in ("primary", "secondary") or (tipo == "tertiary" and PPD >= 600):
        trazar(_geom(e), CAMINO, 1, 7 / (KM * 1000))
# Calles (3) y edificios: solo de cerca (las vistas de 10 y 18 km).
EDIF = rejilla()
if PPD >= 1800:
    for e in _osm("calles"):
        trazar(_geom(e), CAMINO, 3)
    rasterizar([q for e in _osm("edificios") for q in _poligonos(e)], EDIF, 1)
# Pistas: 1 de tierra o sal, 2 asfaltada, 3 plataforma; con su ancho.
PISTA = rejilla()
for e in _osm("pistas"):
    t = e.get("tags", {})
    if t.get("aeroway") == "apron":
        rasterizar(_poligonos(e), PISTA, 3)
for e in _osm("pistas"):
    t = e.get("tags", {})
    if t.get("aeroway") in ("runway", "taxiway"):
        duro = t.get("surface") in ("asphalt", "concrete", "paved")
        if t.get("aeroway") == "taxiway" and not duro:
            continue
        an = _ancho(t, 45.0 if t.get("aeroway") == "runway" else 23.0)
        trazar(_geom(e), PISTA, 2 if duro else 1, an / 2 / (KM * 1000))

# La ciudad, sin rejilla: tejados sueltos de tres tonos y algún árbol, a
# manchas de 2 px mezcladas con píxeles sueltos.
URB = rejilla()                                      # 0 nada, 1-3 tejado, 4 árbol
for r in range(H):
    for c in range(W):
        if URBANA[r][c] and LAND[r][c]:
            R, C = round((90 - lat_de(r)) * PPD), round((lon_de(c) + 180) / DLON)
            h = 0.6 * _hash01(R // 2, C // 2, 7) + 0.4 * _hash01(R, C, 9)
            URB[r][c] = 4 if h < 0.14 else 3 if h < 0.26 else 2 if h < 0.58 else 1
paso("OpenStreetMap")


# ------------------------------------------------------ color de cada celda
_COAST_MIXK = (0.0, 0.20, 0.48, 0.84)


def color(r, c):
    """Como _surface_at + celda_material de la Tierra, a plena luz, y encima
    lo de OSM."""
    lat, lon = lat_de(r), lon_de(c)
    if not LAND[r][c]:
        if SEADIST[r][c] * KM <= SEA_KM0:
            surf = OCEAN_COAST
        else:
            e = elev(lat, lon) + (_mix_noise(r, c) - 0.5) * 60.0
            surf = (OCEAN_MID if e > FONDO[0] else OCEAN_SHALLOW if e > FONDO[1]
                    else OCEAN_TALUD if e > FONDO[2] else OCEAN_DEEP)
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
    ra, sa = roca_nieve(lat, lon)
    if sa and (sa > SNOW_GAP if code == 0 else sa > 0.05 + u * 0.55):
        surf = SNOW
        tex_k = (min(0, tex_k) if code else 0) + mk
    elif ra and (ra > ROCK_GAP if code == 0 else ra > 0.35 + u * 0.6):
        surf, tex_k = ROCK, mk
    else:
        tex_k += mk
    if PISTA[r][c]:
        surf, tex_k = PISTA_COL[PISTA[r][c]], 0
    elif LAGO[r][c]:
        surf, tex_k = OCEAN_MID, 0
    elif CAMINO[r][c] in (1, 2):                        # (por encima de los ríos: puentes)
        surf, tex_k = CAMINO_COL[CAMINO[r][c]], 0
    elif EDIF[r][c]:
        surf, tex_k = EDIF_COL, 0
    elif CAMINO[r][c]:
        surf, tex_k = CAMINO_COL[3], 0
    elif RIO[r][c]:
        surf, tex_k = RIO_COL, 0
    elif PLAYA[r][c]:
        surf, tex_k = PLAYA_COL, 0
    elif MINA[r][c]:
        surf, tex_k = MINA_COL, mk                    # con su relieve: las terrazas
    elif URB[r][c]:
        surf, tex_k = URB_COL[URB[r][c]], 0
    if not EDIF[r][c] and r and c and EDIF[r - 1][c - 1]:
        surf = mix(surf, (0x30, 0x2c, 0x28), 0.4)     # sombra del edificio, al SE
    lvl = COASTLVL[r][c]
    if lvl:
        surf = mix(surf, COAST_COL, _COAST_MIXK[lvl])
    return ramp(surf, int(tex_k), 1.0)


# ------------------------------------------------------------ fronteras
# Discontinuas de 2 px, como en el Sáhara: una celda es frontera si una
# vecina de tierra es de otro país.
TRAZO = 3


def con_frontera(col, r, c):
    p = PAIS[r][c]
    if not p or not LAND[r][c] or (r // TRAZO + c // TRAZO) % 2:
        return col
    for dr, dc in _N4:
        rr, cc = r + dr, c + dc
        if 0 <= rr < H and 0 <= cc < W and LAND[rr][cc] and PAIS[rr][cc] and PAIS[rr][cc] != p:
            return mix(col, COAST_COL, 0.70)
    return col


os.makedirs(PRUEBA, exist_ok=True)
filas = []
for y in range(ALTO):
    fila = bytearray()
    for x in range(ANCHO):
        r, c = MR + y, MC + x
        fila += bytes(con_frontera(color(r, c), r, c)) + b"\xff"
    filas.append(bytes(fila))
write_rgba(os.path.join(PRUEBA, f"{SLUG}-{KM_VISTA}.png"), ANCHO, ALTO, filas)
paso("dibujo")


# ------------------------------------------------------------- nombres
# Encima del mapa, en HTML, con el estilo de los del Sáhara; aquí solo se
# colocan, en px CSS del mapa en la tarjeta (la mitad que los del PNG):
# de más a menos importante, sin pisarse, sin salirse y sin tapar la marca.
# Las regiones («Desierto de Mojave») se mueven alrededor de su punto hasta
# quedar encima del mismo terreno que el punto (desierto, verde…).
LETRA = {"ciudad": (11, 0.0), "pueblo": (10, 0.0), "accidente": (10, 0.06), "region": (9, 0.22)}
CON_PUNTO = {"ciudad", "pueblo"}
AIRE = 4
CW, CH = ANCHO // 2, ALTO // 2                     # el mapa en la tarjeta, px CSS


def a_css(lat, lon):
    r, c = (N - lat) * PPD - MR, (lon - O) / DLON - MC
    return c / 2, r / 2


def terreno(x, y):
    """Bioma (0-5) o -1 (mar) bajo el punto (x, y) en px CSS."""
    r, c = MR + int(y * 2), MC + int(x * 2)
    if not (0 <= r < H and 0 <= c < W):
        return None
    return MIXBIO[r][c] if LAND[r][c] else -1


nombres = []
pueblos = []
for e in _osm("pueblos"):
    t = e.get("tags", {})
    # Solo nombres en letras latinas (en Afganistán, el de OSM va en pastún).
    nom = next((v for v in (t.get("name:es"), t.get("name:en"), t.get("int_name"), t.get("name"))
                if v and all(ord(ch) < 0x250 for ch in v)), None)
    if not nom:
        continue
    try:
        pob = int(t.get("population", "0").replace(",", "").replace(".", "").split()[0] or 0)
    except ValueError:
        pob = 0
    clase = "ciudad" if t.get("place") == "city" or pob >= 100000 else "pueblo"
    # De lejos, los pueblos pequeños no.
    if KM_VISTA >= 90 and clase == "pueblo" and t.get("place") == "village" and pob < 5000:
        continue
    pueblos.append({"nombre": nom, "clase": clase, "lat": e["lat"], "lon": e["lon"],
                    "orden": (0 if clase == "ciudad" else 2, -pob)})
extra = [dict(n, orden=(1 if n["clase"] == "accidente" else 3, 0)) for n in BASE.get("nombres", [])]
candidatos = sorted(pueblos + extra, key=lambda n: n["orden"])
puestos = [(CW / 2 - 9, CH / 2 - 18, CW / 2 + 9, CH / 2)]       # la marca
for n in candidatos:
    fs, ls = LETRA[n["clase"]]
    w = len(n["nombre"]) * fs * (0.6 + ls) + (9 if n["clase"] in CON_PUNTO else 0)
    h = fs + 2
    px, py = a_css(n["lat"], n["lon"])
    if not (0 <= px <= CW and 0 <= py <= CH):
        continue
    sitios = [(0, 0)]
    if n["clase"] == "region":
        sitios = sorted(((dx, dy) for dx in range(-90, 91, 6) for dy in range(-60, 61, 4)),
                        key=lambda d: math.hypot(*d))
    elif n["clase"] == "accidente":
        sitios = sorted(((dx, dy) for dx in range(-48, 49, 4) for dy in range(-28, 29, 4)),
                        key=lambda d: math.hypot(*d))
    suyo = terreno(px, py)
    for dx, dy in sitios:
        x, y = (px - 3, py - h / 2) if n["clase"] in CON_PUNTO else (px + dx - w / 2, py + dy - h / 2)
        if x < 2 or y < 2 or x + w > CW - 2 or y + h > CH - 2:
            continue
        if any(x < p[2] + AIRE and x + w + AIRE > p[0] and y < p[3] + AIRE and y + h + AIRE > p[1]
               for p in puestos):
            continue
        if n["clase"] == "region":
            bajo = [terreno(x + i * w / 8, y + h / 2) for i in range(9)]
            if sum(b == suyo for b in bajo) < 8:
                continue
        puestos.append((x, y, x + w, y + h))
        nombres.append({"nombre": n["nombre"], "clase": n["clase"], "x": round(x), "y": round(y)})
        break
with open(os.path.join(PRUEBA, f"{SLUG}-{KM_VISTA}.json"), "w") as fh:
    json.dump({"km": KM_VISTA, "nombres": nombres}, fh, ensure_ascii=False)
paso(f"public/bases/prueba/{SLUG}-{KM_VISTA}.png, {len(nombres)} nombres")
