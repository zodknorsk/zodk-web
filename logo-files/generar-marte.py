#!/usr/bin/env python3
"""Marte en pixel art (Proyecto Marte, rama mars-project) — BOCETO PROVISIONAL.

Primer Marte para tener algo sobre lo que probar el giro con la barra
espaciadora y el zoom (ver MARTE-WIP.md). El pixel art definitivo va después.
Mismo recorrido que la Luna (generar-luna.py): proyección ortográfica, luz en
escalones lisos de 1/LIGHT_SUB, rampas de color con cambio de tono, relieve en
escalones enteros de rampa, sombras proyectadas cerca del terminador y
limpieza de píxeles sueltos. Lo propio de Marte: fuentes, paleta (óxidos y
casquetes de hielo) y materiales por brillo y color del mosaico.

Fuentes (NASA/USGS, dominio público; pesadas y sin trackear, en marte-fuentes/):
  - Relieve: MOLA MEGDR de Mars Global Surveyor, 16 px/grado, int16 big-endian
    en metros, columnas de 0 a 360° E:
      curl -sSLO https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.img
  - Color: mosaico en color de las Viking, 925 m/píxel (64 px/grado, 764 MB),
    columnas de -180 a 180° E, reducido con sips a COLOR_PPD px/grado:
      curl -sSLO https://planetarymaps.usgs.gov/mosaic/Mars_Viking_ClrMosaic_global_925m.tif
      sips -s format bmp -z 1440 2880 Mars_Viking_ClrMosaic_global_925m.tif --out viking_8.bmp

Uso:
    python3 generar-marte.py              # las dos caras de prueba -> prototipo-marte/
    python3 generar-marte.py tharsis      # solo una (tharsis, syrtis)
    python3 generar-marte.py --zoom       # además, un recorte ampliado x4 del centro
    python3 generar-marte.py --histograma # reparto de brillo del mosaico (para los umbrales)
    python3 generar-marte.py --recalc     # rehace la pasada lenta (geometría/luz)

Datos del <canvas> (el Marte que se gira con la mano y el zoom):
    python3 generar-marte.py --canvas ../public/marte/   # base + teselas n1/, n2/ + LUT + datos (~3 min)
    python3 generar-marte.py --canvas ../public/marte/ --niveles 0   # solo la base
    Necesita también el mosaico a 16 px/grado:
      sips -s format bmp -z 2880 5760 Mars_Viking_ClrMosaic_global_925m.tif --out viking_16.bmp

Verlo: desde la raíz del repo, python3 -m http.server 4400 y abrir
http://127.0.0.1:4400/logo-files/prototipo-marte/

La pasada lenta (proyección, relieve, sombras proyectadas) se guarda en
marte-fuentes/cache-<cara>.bin; si solo cambian paleta o umbrales, no se repite.
"""
import array
import colorsys
import math
import os
import pickle
import sys

from png8 import write_rgba

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = os.path.join(AQUI, "marte-fuentes")
SALIDA = os.path.join(AQUI, "prototipo-marte")


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


# ------------------------------------------------------------ geometría
# Marte va más pequeño que la Luna de /luna (80 svh, radio 292,5) y con el
# mismo tamaño de píxel: a 60 svh, 292,5 x 60/80 = 219,4.
SIZE    = 450
RADIUS  = 219.4
SUPER   = 3            # submuestras por lado de píxel (3x3) para relieve y color
LIMB_AA = 1.3          # semiancho del suavizado del borde del disco (px)

# Caras de prueba (giro "tipo globo": LAT0 inclina hacia el norte, LON0 es la
# longitud del centro, este +).
CARAS = {
    # Tharsis y Valles Marineris; el Olympus Mons, a la izquierda
    "tharsis": (10.0, -80.0),
    # Syrtis Major, Isidis y Jezero a la izquierda, Gale y Elysium a la
    # derecha, Hellas abajo
    "syrtis": (10.0, 105.0),
}

# Luz: desde arriba a la izquierda, como el sol de la Tierra de la portada.
# FASE = ángulo sol-Marte-observador (0 = lleno de frente, plano).
FASE    = 40.0
SOL_ARR = 20.0         # cuánto sube la luz hacia el norte (grados)
LADO    = -1           # -1 izquierda, +1 derecha

# Terminador algo menos seco que el de la Luna (-0,01/0,30): Marte tiene una
# atmósfera fina.
TERM_A, TERM_B = -0.03, 0.32
NOCHE   = 0.16         # brillo del lado sin sol: el de la Luna, para que no se funda con el fondo
LIMB_K  = 0.10         # oscurecimiento del borde

RELIEVE_EXAG = 2.5     # exageración de pendientes para el sombreado
RELIEVE_K    = 1.25
RELIEVE_MIN, RELIEVE_MAX = -6, 3
RELIEVE_ELEV_MAX = 30.0  # el sol no sube de aquí para sombrear el relieve (como en la Luna)
SOMBRA_K     = -9
SOMBRA_ELEV  = 22.0
PICO_MAX     = 22000.0   # hasta dónde se busca quien tape el sol (el Olympus Mons, ~21 km)

MARTE_R = 3396000.0    # radio de referencia del MOLA (m)

DERIV_DEG = 0.25       # paso de la derivada del relieve (~1 px en el centro del disco)
COLOR_BLUR = 1         # radio (px del mosaico reducido) del suavizado del color
LIMPIAR   = 2          # pasadas de quitar píxeles aislados

# ------------------------------------------------ rampas con cambio de tono
STEP        = 0.84
LIGHT_SUB   = 3
_LNSTEP     = -math.log(STEP)
HUE_SHADOW  = 250.0 / 360.0
HUE_LIGHT   = 55.0 / 360.0
HUE_STEP    = 6.0 / 360.0
HUE_MAX     = 26.0 / 360.0
SAT_SHADOW  = 0.03
SAT_SH_MAX  = 0.10
SAT_LIGHT   = 0.06
# En ramp(), los rojos y naranjas de Marte se van hacia el granate/violeta en
# la sombra (tono hacia abajo, pasando por el 0); la rampa de la Luna solo
# movía los tonos entre amarillo y azul y dejaba los óxidos solo más oscuros.

SPACE = (0x05, 0x06, 0x0a)

# Materiales: por brillo del mosaico (0-255) y, en los polos, hielo.
# (hasta, color a plena luz); los umbrales salen de --histograma.
MATERIALES = [
    (None, (0x5c, 0x3c, 0x31)),   # basalto muy oscuro (el corazón de Syrtis Major)
    (None, (0x72, 0x49, 0x37)),   # regiones oscuras (Acidalia, Mare Erythraeum…)
    (None, (0x8c, 0x56, 0x3b)),   # transición
    (None, (0xa6, 0x64, 0x40)),   # óxido medio
    (None, (0xbc, 0x77, 0x49)),   # ocre
    (None, (0xcf, 0x8d, 0x5a)),   # polvo claro (Tharsis, Arabia, Elysium)
]
UMBRALES = [56, 68, 80, 98, 112]   # el pico (84-95) entero en un material: si no, sale a manchas
HIELO = (0xe4, 0xe1, 0xda)
HIELO_LAT = 50.0       # por debajo de esta latitud no hay hielo
HIELO_T = 0.5          # cobertura de hielo (0-1, suavizada) a partir de la que se pinta hielo


def ramp(col, k):
    h, s, v = colorsys.rgb_to_hsv(col[0] / 255.0, col[1] / 255.0, col[2] / 255.0)
    if k < 0:
        amt = min(HUE_MAX, -k * HUE_STEP)
        if s < 0.12:
            h = 225.0 / 360.0                   # grises (hielo): sombra fría
        elif 60.0 / 360.0 <= h <= HUE_SHADOW:
            h = min(h + amt, HUE_SHADOW)
        elif h < 60.0 / 360.0:                  # óxidos: hacia el granate
            h = (h - amt) % 1.0
        s = min(1.0, s + min(SAT_SH_MAX, -k * SAT_SHADOW))
        v *= STEP ** -k
    elif k > 0:
        d = (HUE_LIGHT - h + 0.5) % 1.0 - 0.5
        amt = min(HUE_MAX, k * HUE_STEP)
        h = HUE_LIGHT if abs(d) <= amt else (h + math.copysign(amt, d)) % 1.0
        s = max(0.0, s - k * SAT_LIGHT)
        v = min(1.0, v / STEP ** k)
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return (r * 255.0, g * 255.0, b * 255.0)


# --------------------------------------------------------------- fuentes
DEM_W, DEM_H, DEM_PPD = 5760, 2880, 16
COLOR_PPD = 8
COLOR_W, COLOR_H = 360 * COLOR_PPD, 180 * COLOR_PPD


def _leer_bmp(ruta):
    """BMP de 24 bits (el que saca sips) -> filas de arriba abajo, BGR."""
    with open(ruta, "rb") as fh:
        bmp = fh.read()
    off = int.from_bytes(bmp[10:14], "little")
    w = int.from_bytes(bmp[18:22], "little", signed=True)
    h = int.from_bytes(bmp[22:26], "little", signed=True)
    bpp = int.from_bytes(bmp[28:30], "little")
    assert bpp == 24, f"{ruta}: {bpp} bits por píxel"
    fila = (w * 3 + 3) // 4 * 4
    filas = [bmp[off + r * fila:off + r * fila + w * 3] for r in range(abs(h))]
    if h > 0:                                   # BMP normal: de abajo arriba
        filas.reverse()
    return w, abs(h), filas


def cargar(color_ppd=COLOR_PPD, blur=COLOR_BLUR):
    dem = array.array("h")
    with open(os.path.join(FUENTES, "megt90n000eb.img"), "rb") as fh:
        dem.frombytes(fh.read())
    if sys.byteorder == "little":
        dem.byteswap()                          # MSB_INTEGER
    w, h, filas = _leer_bmp(os.path.join(FUENTES, f"viking_{color_ppd}.bmp"))
    assert (w, h) == (360 * color_ppd, 180 * color_ppd), (w, h)
    brillo = array.array("f", bytes(4 * w * h))
    hielo = array.array("f", bytes(4 * w * h))
    for r, f in enumerate(filas):
        lat = 90.0 - (r + 0.5) / color_ppd
        polar = abs(lat) >= HIELO_LAT
        base = r * w
        B, G, R = f[0::3], f[1::3], f[2::3]
        for c in range(w):
            # La columna 0 (180° O) sale oscura: sips la mezcla con negro al
            # reducir (37 de brillo frente a 88 en sus vecinas). Se usa la de
            # al lado; si no, en el giro sale una raya de un polo al otro.
            cc = c if c else 1
            rr, gg, bb = R[cc], G[cc], B[cc]
            brillo[base + c] = 0.30 * rr + 0.59 * gg + 0.11 * bb
            # hielo: claro y poco rojo (el polvo es naranja, el hielo casi gris)
            if polar and bb > 0.78 * rr and rr > 150:
                hielo[base + c] = 1.0
    return dem, _desenfocar(brillo, w, h, blur), _desenfocar(hielo, w, h, blur)


def _desenfocar(src, w, h, rad):
    """Media móvil separable (horizontal circular, vertical con borde)."""
    if rad <= 0:
        return src
    n = 2 * rad + 1
    tmp = array.array("f", bytes(4 * w * h))
    for r in range(h):
        b = r * w
        fila = src[b:b + w]
        acc = sum(fila[-rad:]) + sum(fila[:rad + 1])
        for c in range(w):
            tmp[b + c] = acc / n
            acc += fila[(c + rad + 1) % w] - fila[(c - rad) % w]
    out = array.array("f", bytes(4 * w * h))
    for c in range(w):
        col = [tmp[r * w + c] for r in range(h)]
        acc = col[0] * rad + sum(col[:rad + 1])
        for r in range(h):
            out[r * w + c] = acc / n
            acc += col[min(h - 1, r + rad + 1)] - col[max(0, r - rad)]
    return out


def hacer_muestreo(dem, brillo, hielo, color_ppd=COLOR_PPD):
    cw, chh = 360 * color_ppd, 180 * color_ppd

    def altura(lat, lon):
        """Metros sobre el areoide (bilineal). lon en grados este, cualquier rango."""
        fr = (90.0 - lat) * DEM_PPD - 0.5
        fc = (lon % 360.0) * DEM_PPD - 0.5
        r0 = math.floor(fr); c0 = math.floor(fc)
        tr = fr - r0; tc = fc - c0
        r0 = 0 if r0 < 0 else DEM_H - 1 if r0 >= DEM_H else r0
        r1 = r0 + 1 if r0 + 1 < DEM_H else r0
        c0 %= DEM_W
        c1 = (c0 + 1) % DEM_W
        b0, b1 = r0 * DEM_W, r1 * DEM_W
        a = dem[b0 + c0] * (1 - tc) + dem[b0 + c1] * tc
        b = dem[b1 + c0] * (1 - tc) + dem[b1 + c1] * tc
        return a * (1 - tr) + b * tr

    def color(lat, lon):
        """(brillo, hielo) del mosaico (bilineal)."""
        fr = (90.0 - lat) * color_ppd - 0.5
        fc = ((lon + 180.0) % 360.0) * color_ppd - 0.5
        r0 = math.floor(fr); c0 = math.floor(fc)
        tr = fr - r0; tc = fc - c0
        r0 = 0 if r0 < 0 else chh - 1 if r0 >= chh else r0
        r1 = r0 + 1 if r0 + 1 < chh else r0
        c0 %= cw
        c1 = (c0 + 1) % cw
        b0, b1 = r0 * cw, r1 * cw
        w00, w01 = (1 - tr) * (1 - tc), (1 - tr) * tc
        w10, w11 = tr * (1 - tc), tr * tc
        br = brillo[b0 + c0] * w00 + brillo[b0 + c1] * w01 + brillo[b1 + c0] * w10 + brillo[b1 + c1] * w11
        hi = hielo[b0 + c0] * w00 + hielo[b0 + c1] * w01 + hielo[b1 + c0] * w10 + hielo[b1 + c1] * w11
        return br, hi

    return altura, color


# ---------------------------------------------------- pasada lenta: geometría
def sol():
    f, a = math.radians(FASE), math.radians(SOL_ARR)
    # coordenadas de vista: x derecha, y arriba, z hacia el observador
    x = LADO * math.sin(f) * math.cos(a)
    y = math.sin(f) * math.sin(a)
    z = math.cos(f)
    n = math.sqrt(x * x + y * y + z * z)
    return x / n, y / n, z / n


def pasada_lenta(fuentes, lat0, lon0):
    altura, color = fuentes
    SX, SY, SZ = sol()
    d_deg = DERIV_DEG
    d_m = math.radians(d_deg) * MARTE_R
    sl0, cl0 = math.sin(math.radians(lat0)), math.cos(math.radians(lat0))
    paso_sombra = 1.0 / DEM_PPD                  # grados por paso al buscar sombras
    paso_m = math.radians(paso_sombra) * MARTE_R
    subs = [((i + 0.5) / SUPER) for i in range(SUPER)]
    sin_em = math.sin(math.radians(RELIEVE_ELEV_MAX))
    cos_em = math.cos(math.radians(RELIEVE_ELEV_MAX))

    out = []                                     # por píxel: None o (brillo, hielo, lam_esfera, k_relieve, sombra, dc)
    for sy in range(SIZE):
        fila = []
        for sx in range(SIZE):
            cx = (sx + 0.5 - SIZE / 2.0) / RADIUS
            cy = -(sy + 0.5 - SIZE / 2.0) / RADIUS
            dc = math.sqrt(cx * cx + cy * cy)
            if dc > 1.0 + LIMB_AA / RADIUS:
                fila.append(None)
                continue
            b_acc = h_acc = 0.0
            n_acc = [0.0, 0.0, 0.0]
            cnt = 0
            lat_c = lon_c = None
            for oy in subs:
                for ox in subs:
                    x = (sx + ox - SIZE / 2.0) / RADIUS
                    y = -(sy + oy - SIZE / 2.0) / RADIUS
                    rr = x * x + y * y
                    if rr >= 1.0:
                        continue
                    z = math.sqrt(1.0 - rr)
                    yy = y * cl0 + z * sl0
                    zz = -y * sl0 + z * cl0
                    lat = math.degrees(math.asin(max(-1.0, min(1.0, yy))))
                    lon = math.degrees(math.atan2(x, zz)) + lon0
                    br, hi = color(lat, lon)
                    b_acc += br
                    h_acc += hi
                    cl = max(0.02, math.cos(math.radians(lat)))
                    he = (altura(lat, lon + d_deg / cl) - altura(lat, lon - d_deg / cl)) / (2 * d_m)
                    hn = (altura(lat + d_deg, lon) - altura(lat - d_deg, lon)) / (2 * d_m)
                    ne, nn = -he * RELIEVE_EXAG, -hn * RELIEVE_EXAG
                    ln = math.sqrt(ne * ne + nn * nn + 1.0)
                    ne, nn, nu = ne / ln, nn / ln, 1.0 / ln
                    Ux, Uy, Uz = x, y, z
                    ax, ay, az = 0.0, cl0, sl0           # eje de Marte en vista
                    Ex, Ey, Ez = ay * Uz - az * Uy, az * Ux - ax * Uz, ax * Uy - ay * Ux
                    le = math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez) or 1e-9
                    Ex, Ey, Ez = Ex / le, Ey / le, Ez / le
                    Nx, Ny, Nz = Uy * Ez - Uz * Ey, Uz * Ex - Ux * Ez, Ux * Ey - Uy * Ex
                    n_acc[0] += ne * Ex + nn * Nx + nu * Ux
                    n_acc[1] += ne * Ey + nn * Ny + nu * Uy
                    n_acc[2] += ne * Ez + nn * Nz + nu * Uz
                    cnt += 1
                    if lat_c is None or (abs(ox - 0.5) < 0.2 and abs(oy - 0.5) < 0.2):
                        lat_c, lon_c = lat, lon
                        Ec, Nc, Uc = (Ex, Ey, Ez), (Nx, Ny, Nz), (Ux, Uy, Uz)
            if cnt == 0:
                fila.append((None, 0.0, 0.0, 0, False, dc))   # anillo de suavizado: solo borde
                continue
            nx, ny, nz = n_acc
            ln = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            nx, ny, nz = nx / ln, ny / ln, nz / ln
            ux, uy, uz = Uc
            lam_s = ux * SX + uy * SY + uz * SZ     # luz sobre la esfera lisa
            lam_l = nx * SX + ny * SY + nz * SZ     # luz sobre el relieve
            if lam_s > 0.02:
                ratio = max(lam_l, 0.004) / lam_s
                if RELIEVE_ELEV_MAX is not None and lam_s > sin_em:
                    ex_, ey_, ez_ = Ec
                    nx_, ny_, nz_ = Nc
                    se = SX * ex_ + SY * ey_ + SZ * ez_
                    sn = SX * nx_ + SY * ny_ + SZ * nz_
                    ls = math.sqrt(se * se + sn * sn) or 1.0
                    ch = cos_em / ls
                    Lx = ch * (se * ex_ + sn * nx_) + sin_em * ux
                    Ly = ch * (se * ey_ + sn * ny_) + sin_em * uy
                    Lz = ch * (se * ez_ + sn * nz_) + sin_em * uz
                    ratio = max(nx * Lx + ny * Ly + nz * Lz, 0.004) / sin_em
                k_rel = round(math.log(ratio) / _LNSTEP * RELIEVE_K)
                k_rel = max(RELIEVE_MIN, min(RELIEVE_MAX, k_rel))
            else:
                k_rel = 0
            # sombra proyectada: marcha sobre el relieve hacia el sol
            sombra = lam_l <= 0.0 < lam_s
            elev_sol = math.degrees(math.asin(max(-1.0, min(1.0, lam_s))))
            if not sombra and 0.0 < elev_sol < SOMBRA_ELEV:
                se = SX * Ec[0] + SY * Ec[1] + SZ * Ec[2]
                sn = SX * Nc[0] + SY * Nc[1] + SZ * Nc[2]
                ls = math.sqrt(se * se + sn * sn) or 1.0
                se, sn = se / ls, sn / ls
                tan_e = math.tan(math.radians(elev_sol))
                h0 = altura(lat_c, lon_c)
                cl = max(0.05, math.cos(math.radians(lat_c)))
                n_pasos = min(160, int(PICO_MAX / max(tan_e, 0.02) / paso_m) + 1)
                for i in range(1, n_pasos + 1):
                    t = i * paso_sombra
                    D = i * paso_m
                    h = altura(lat_c + sn * t, lon_c + se * t / cl) - D * D / (2 * MARTE_R)
                    if h > h0 + D * tan_e:
                        sombra = True
                        break
            fila.append((b_acc / cnt, h_acc / cnt, lam_s, k_rel, sombra, dc))
        out.append(fila)
        if sy % 50 == 0:
            print(f"  fila {sy}/{SIZE}", flush=True)
    return out


# --------------------------------------------------------- pasada rápida: color
def material(br, hi, umbrales):
    if hi >= HIELO_T:
        return len(MATERIALES)                  # hielo, el último
    m = 0
    while m < len(umbrales) and br >= umbrales[m]:
        m += 1
    return m


def _limpiar(grid):
    """Un píxel cuyos 4 vecinos coinciden entre sí (y no con él) toma su valor;
    uno con 3 de 4 vecinos iguales y distintos a él, también."""
    out = [fila[:] for fila in grid]
    for y in range(1, SIZE - 1):
        for x in range(1, SIZE - 1):
            v = grid[y][x]
            if v is None:
                continue
            vec = (grid[y - 1][x], grid[y + 1][x], grid[y][x - 1], grid[y][x + 1])
            if None in vec or v in vec:
                continue
            for cand in vec:
                if vec.count(cand) >= 3:
                    out[y][x] = cand
                    break
    return out


def colorear(datos, umbrales):
    colores = [c for _, c in MATERIALES] + [HIELO]
    _cache = {}
    filas = []
    r_in = 1.0 - LIMB_AA / RADIUS
    r_out = 1.0 + LIMB_AA / RADIUS
    grid = [[None] * SIZE for _ in range(SIZE)]
    k_noche = math.log(NOCHE) / _LNSTEP
    for y, fila in enumerate(datos):
        for x, p in enumerate(fila):
            if p is None or p[0] is None:
                continue
            br, hi, lam_s, k_rel, sombra, dc = p
            m = material(br, hi, umbrales)
            bright = NOCHE + (1.0 - NOCHE) * smooth(TERM_A, TERM_B, lam_s)
            bright *= 1.0 - LIMB_K * smooth(0.75, 1.0, dc)
            kg = math.floor(math.log(max(bright, 1e-3)) / _LNSTEP * LIGHT_SUB + 0.5) / LIGHT_SUB
            if lam_s > 0.0:
                k = max(kg + (SOMBRA_K if sombra else k_rel), k_noche)
            else:
                k = kg
            grid[y][x] = (m, round(k * LIGHT_SUB))
    for _ in range(LIMPIAR):
        grid = _limpiar(grid)
    for y, fila in enumerate(datos):
        row = bytearray(SIZE * 4)
        for i, p in enumerate(fila):
            if p is None:
                continue
            dc = p[5]
            g = grid[y][i]
            if g is None:
                col = SPACE
            else:
                col = _cache.get(g)
                if col is None:
                    col = _cache[g] = ramp(colores[g[0]], g[1] / LIGHT_SUB)
            if dc > r_in:
                col = mix(SPACE, col, 1.0 - smooth(r_in, r_out, dc))
            j = i * 4
            row[j:j + 4] = bytes((max(0, min(255, round(col[0]))),
                                  max(0, min(255, round(col[1]))),
                                  max(0, min(255, round(col[2]))), 255))
        filas.append(bytes(row))
    return filas


def histograma(brillo, hielo):
    """Reparto del brillo por área (pesado por cos lat), sin el hielo."""
    cubos = [0.0] * 256
    for r in range(COLOR_H):
        wlat = math.cos(math.radians(90.0 - (r + 0.5) / COLOR_PPD))
        base = r * COLOR_W
        for c in range(COLOR_W):
            if hielo[base + c] >= HIELO_T:
                continue
            cubos[max(0, min(255, int(brillo[base + c])))] += wlat
    total = sum(cubos)
    acum = 0.0
    for v in range(0, 256, 4):
        s = sum(cubos[v:v + 4])
        acum += s
        if s / total > 0.0005:
            print(f"{v:3d}-{v + 3:3d} {s / total * 100:5.1f}% {acum / total * 100:5.1f}% " + "#" * int(s / total * 400))


# ------------------------------------------------------ datos del <canvas>
# Marte se pinta siempre en tiempo real (se gira con la mano y se hace zoom:
# no hay caras fijas en PNG como en la Luna), desde mapas en latitud/longitud
# con el mismo formato que el de la Luna: R = material (0-6, el 6 es hielo),
# G/B = normal del relieve (este, norte; ya exagerada) de -1..1 a
# 0..NORMAL_NIVELES-1.
#
# Para el zoom hay una pirámide de NIVELES: al acercarse, el píxel de pantalla
# mide lo mismo y el disco crece, así que hace falta un mapa más fino. Cada
# nivel dobla la resolución del anterior. La base va entera
# (marte-mapa.png); los finos, en teselas de TESELA x TESELA celdas
# (n1/F-C.png, n2/F-C.png: fila y columna de tesela, desde 90° N y 180° O),
# y el navegador solo baja las que se ven. Cada nivel se calcula desde las
# fuentes a su propia resolución (derivada del relieve al paso de una celda),
# así que al acercarse aparecen cráteres y cañones que la base no tiene.
#   marte-lut.png    color de cada material (fila) por escalón de luz (columna)
#   marte-datos.json constantes de luz y geometría, niveles y caras de prueba
MAPA_W, MAPA_H = 1440, 720    # 4 px/grado: en el zoom x1 un píxel del disco son ~0,26°
NIVELES = [                   # (px/grado del mapa, px/grado del mosaico de color, en teselas)
    (4, 8, False),            # base: zoom x1
    (8, 8, True),             # hasta x2
    (16, 16, True),           # hasta x4 (el máximo decidido)
]
TESELA = 360
LUT_KMIN, LUT_KMAX = -16, 4   # escalones de rampa que caben (noche + relieve + limbo)
NORMAL_NIVELES = 64           # niveles por componente de la normal (menos = PNG más ligero)


def _filas_mapa(altura, color, ppd, r0, r1):
    """Filas r0..r1-1 del mapa a `ppd` px/grado, en RGBA."""
    q = NORMAL_NIVELES - 1
    w = 360 * ppd
    d_deg = 1.0 / ppd                           # derivada al paso de una celda
    d_m = math.radians(d_deg) * MARTE_R
    for r in range(r0, r1):
        lat = 90.0 - (r + 0.5) / ppd
        cl = max(0.02, math.cos(math.radians(lat)))
        fila = bytearray(w * 4)
        for c in range(w):
            lon = (c + 0.5) / ppd - 180.0
            br, hi = color(lat, lon)
            m = material(br, hi, UMBRALES)
            he = (altura(lat, lon + d_deg / cl) - altura(lat, lon - d_deg / cl)) / (2 * d_m)
            hn = (altura(lat + d_deg, lon) - altura(lat - d_deg, lon)) / (2 * d_m)
            ne, nn = -he * RELIEVE_EXAG, -hn * RELIEVE_EXAG
            ln = math.sqrt(ne * ne + nn * nn + 1.0)
            o = c * 4
            fila[o:o + 4] = bytes((m, round((ne / ln + 1) / 2 * q), round((nn / ln + 1) / 2 * q), 255))
        yield bytes(fila)


def export_canvas(outdir, cuales=None):
    import json
    os.makedirs(outdir, exist_ok=True)
    fuentes = {}                                # px/grado del color -> (altura, color)
    for n, (ppd, cppd, teselas) in enumerate(NIVELES):
        if cuales is not None and n not in cuales:
            continue
        if cppd not in fuentes:
            print(f"cargando color a {cppd} px/grado…", flush=True)
            dem, brillo, hielo = cargar(cppd, COLOR_BLUR)
            fuentes[cppd] = hacer_muestreo(dem, brillo, hielo, cppd)
        altura, color = fuentes[cppd]
        w, h = 360 * ppd, 180 * ppd
        if not teselas:
            write_rgba(os.path.join(outdir, "marte-mapa.png"), w, h, list(_filas_mapa(altura, color, ppd, 0, h)))
            print(f"  nivel {n}: {w} x {h}", flush=True)
            continue
        carpeta = os.path.join(outdir, f"n{n}")
        os.makedirs(carpeta, exist_ok=True)
        for tf in range(h // TESELA):
            filas = list(_filas_mapa(altura, color, ppd, tf * TESELA, (tf + 1) * TESELA))
            for tc in range(w // TESELA):
                a, b = tc * TESELA * 4, (tc + 1) * TESELA * 4
                write_rgba(os.path.join(carpeta, f"{tf}-{tc}.png"), TESELA, TESELA, [f[a:b] for f in filas])
            print(f"  nivel {n}: banda {tf + 1}/{h // TESELA}", flush=True)
    kn = (LUT_KMAX - LUT_KMIN) * LIGHT_SUB + 1
    lut = []
    for col in [c for _, c in MATERIALES] + [HIELO]:
        fila = bytearray(kn * 4)
        for j in range(kn):
            rgb = ramp(col, LUT_KMIN + j / LIGHT_SUB)
            fila[j * 4:j * 4 + 4] = bytes([max(0, min(255, round(v))) for v in rgb] + [255])
        lut.append(bytes(fila))
    write_rgba(os.path.join(outdir, "marte-lut.png"), kn, len(lut), lut)
    datos = {
        "RADIUS": RADIUS, "LIMB_AA": LIMB_AA, "FASE": FASE, "SOL_ARR": SOL_ARR, "LADO": LADO,
        "TERM_A": TERM_A, "TERM_B": TERM_B, "NOCHE": NOCHE, "LIMB_K": LIMB_K,
        "RELIEVE_K": RELIEVE_K, "RELIEVE_MIN": RELIEVE_MIN, "RELIEVE_MAX": RELIEVE_MAX,
        "RELIEVE_ELEV_MAX": RELIEVE_ELEV_MAX, "SOMBRA_K": SOMBRA_K,
        "LNSTEP": _LNSTEP, "LIGHT_SUB": LIGHT_SUB, "LUT_KMIN": LUT_KMIN, "LUT_KN": kn,
        "MAPA_W": MAPA_W, "MAPA_H": MAPA_H, "SPACE": SPACE, "MATERIALES": len(lut),
        "NORMAL_NIVELES": NORMAL_NIVELES, "TESELA": TESELA,
        "NIVELES": [{"ppd": ppd, "teselas": t} for ppd, _, t in NIVELES],
        "caras": {n: {"lat0": la, "lon0": lo} for n, (la, lo) in CARAS.items()},
    }
    with open(os.path.join(outdir, "marte-datos.json"), "w") as fh:
        json.dump(datos, fh, separators=(",", ":"))
    print("->", outdir)


def main():
    os.makedirs(SALIDA, exist_ok=True)
    if "--canvas" in sys.argv:
        cuales = None
        if "--niveles" in sys.argv:             # p. ej. --niveles 0 (solo la base)
            cuales = {int(x) for x in sys.argv[sys.argv.index("--niveles") + 1].split(",")}
        export_canvas(sys.argv[sys.argv.index("--canvas") + 1], cuales)
        return
    dem, brillo, hielo = cargar()
    if "--histograma" in sys.argv:
        histograma(brillo, hielo)
        return
    fuentes = hacer_muestreo(dem, brillo, hielo)
    nombres = [a for a in sys.argv[1:] if a in CARAS] or list(CARAS)
    for nombre in nombres:
        lat0, lon0 = CARAS[nombre]
        cache = os.path.join(FUENTES, f"cache-{nombre}.bin")
        firma = (SIZE, RADIUS, lat0, lon0, SUPER, FASE, SOL_ARR, LADO, DERIV_DEG, COLOR_PPD, COLOR_BLUR,
                 HIELO_LAT, RELIEVE_ELEV_MAX, RELIEVE_EXAG, RELIEVE_K, RELIEVE_MIN, RELIEVE_MAX, SOMBRA_ELEV, PICO_MAX)
        datos = None
        if "--recalc" not in sys.argv and os.path.exists(cache):
            with open(cache, "rb") as fh:
                f, d = pickle.load(fh)
            if f == firma:
                datos = d
        if datos is None:
            print(f"pasada lenta de {nombre} (proyección, relieve, sombras)…")
            datos = pasada_lenta(fuentes, lat0, lon0)
            with open(cache, "wb") as fh:
                pickle.dump((firma, datos), fh)
        filas = colorear(datos, UMBRALES)
        ruta = os.path.join(SALIDA, f"marte-{nombre}.png")
        write_rgba(ruta, SIZE, SIZE, filas)
        print("->", ruta)
        if "--zoom" in sys.argv:                # recorte ampliado x4 (vecino más próximo) del centro
            n, z = 112, 4
            x0 = y0 = (SIZE - n) // 2
            zfilas = []
            for fila in filas[y0:y0 + n]:
                fz = bytearray()
                for i in range(x0, x0 + n):
                    fz += fila[i * 4:i * 4 + 4] * z
                zfilas += [bytes(fz)] * z
            rz = os.path.join(SALIDA, f"marte-{nombre}-zoom.png")
            write_rgba(rz, n * z, n * z, zfilas)
            print("->", rz)


if __name__ == "__main__":
    main()
