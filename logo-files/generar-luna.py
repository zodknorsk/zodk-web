#!/usr/bin/env python3
"""La Luna en pixel art (Proyecto Luna, rama moon-project) — PRIMER BOCETO.

Cara visible tal como se ve desde la Tierra: disco completo, norte arriba, sin
inclinación ni giro. Mismo lenguaje que la Tierra del hero
(generar-planeta-hero.py): proyección ortográfica, luz en escalones lisos de
1/LIGHT_SUB, rampas de color con cambio de tono (sombras frías), relieve en
escalones enteros de rampa.

Fuentes (NASA, dominio público; pesadas y sin trackear, en luna-fuentes/):
  - Relieve: LOLA/LRO, LDEM_16 (16 px/grado, int16 en metros x 0,5):
      curl -sSLO https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img
  - Claros/oscuros (mares y tierras altas): mosaico de color LROC WAC del
    "CGI Moon Kit" (SVS 4720), 4096x2048, centrado en 0° de longitud:
      curl -sSLO https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_4k.tif
      sips -s format bmp lroc_color_poles_4k.tif --out lroc_4k.bmp

Uso:
    python3 generar-luna.py              # luz por la izquierda -> prototipo-luna/luna-visible.png
    python3 generar-luna.py --derecha    # luz por la derecha   -> prototipo-luna/luna-visible-derecha.png
    python3 generar-luna.py --penumbra-corta   # paso luz/sombra más seco (TERM_B 0,15)
    python3 generar-luna.py --noche 0.07 # otra luz cenicienta en el lado sin sol (ver NOCHE)
    python3 generar-luna.py --zoom       # además, un recorte ampliado x4 para revisar los píxeles
    python3 generar-luna.py --recalc     # rehace la pasada lenta (geometría/luz)

Cara oculta (bocetos, 17-sep-2026; siempre luz por la derecha):
    python3 generar-luna.py --oculta             # de frente (lon 180), fase 65° -> luna-oculta-f65.png
    python3 generar-luna.py --oculta --sur       # inclinada 30° al sur: cuenca Polo Sur-Aitken
    python3 generar-luna.py --oculta --fase 90   # otra fase (90 = media luz: la mitad izquierda a oscuras)

Datos del <canvas> (media vuelta entre caras, src/scripts/luna.js):
    python3 generar-luna.py --canvas carpeta/    # mapa + LUT + datos + las dos caras aprobadas

Verlo: desde la raíz del repo, python3 -m http.server 4400 y abrir
http://127.0.0.1:4400/logo-files/prototipo-luna/

La pasada lenta (proyección, relieve, sombras proyectadas) se guarda en
luna-fuentes/cache-<nombre>.bin; si solo cambian paleta o umbrales de albedo, no
se repite.
"""
import array
import colorsys
import math
import os
import pickle
import sys

from png8 import write_rgba

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = os.path.join(AQUI, "luna-fuentes")
SALIDA = os.path.join(AQUI, "prototipo-luna")


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


# ------------------------------------------------------------ geometría
SIZE    = 600          # lienzo cuadrado, en px (el de la Tierra: 600 de ancho)
RADIUS  = 292.5        # radio del disco, en px (el mismo que la Tierra)
LAT0, LON0 = 0.0, 0.0  # punto sub-terrestre: la cara visible de frente
SUPER   = 3            # submuestras por lado de píxel (3x3) para relieve y albedo
LIMB_AA = 1.3          # semiancho del suavizado del borde del disco (px)

# Luz: casi llena, algo ladeada desde arriba a la izquierda (como el sol de la
# Tierra en el hero). FASE = ángulo sol-Luna-observador: 0 = llena de frente
# (plana, sin relieve), 90 = media luna.
FASE    = 38.0         # grados
SOL_ARR = 14.0         # cuánto sube la luz hacia el norte (grados)
LADO    = -1           # de dónde viene la luz: -1 izquierda (oeste), +1 derecha (este)

# Terminador: la Luna no tiene atmósfera, así que es mucho más seco que el de
# la Tierra (allí TERM_A/B = -0,34/0,60).
TERM_A, TERM_B = -0.01, 0.30
# Brillo de la cara sin sol (luz cenicienta: el sol no le da, pero la Tierra
# llena sí la ilumina; es lo que deja ver los mares en el lado oscuro de una
# luna creciente real). Subido de 0,07 a 0,16 el 17-sep-2026: con 0,07 el
# terreno de noche quedaba en (7,6,8), casi idéntico a SPACE (5,6,10), así que
# no se distinguía la Luna del fondo y una chapa puesta ahí parecía flotar en
# el espacio (se vio con Luna 9). Con 0,16 queda en (15,14,17): se ven los
# mares y sigue leyéndose como noche. Comparado en prototipo-luna/noche.html
# (0,07 / 0,12 / 0,16 / 0,22); el usuario eligió 0,16.
NOCHE   = 0.16         # se cambia con --noche (solo color: no rehace la pasada lenta)
LIMB_K  = 0.10         # oscurecimiento del borde (la Luna llena apenas lo tiene)

RELIEVE_EXAG = 3.2     # exageración de pendientes para el sombreado
RELIEVE_K    = 1.25    # >1: más escalones entre ladera al sol y en sombra
RELIEVE_MIN, RELIEVE_MAX = -6, 3
# Con el sol alto (centro del disco y la zona a su derecha) las laderas apenas
# cambian de brillo y los cráteres salen blandos, de un solo tono. Para el
# SOMBREADO del relieve (no para la luz general ni las sombras proyectadas) la
# altura del sol se limita a este valor: mismo azimut, luz más rasante.
RELIEVE_ELEV_MAX = 30.0  # grados (aprobado); None = sol real en todas partes
SOMBRA_K     = -9      # escalones que baja una sombra proyectada (no llega a negro)
SOMBRA_ELEV  = 22.0    # por encima de esta altura del sol (grados) no se buscan sombras

LUNA_R = 1737400.0     # radio lunar de referencia (m)

# Limpieza de pixel art: a 600 px un píxel son ~9 km, así que los cráteres
# pequeños y el grano del mosaico salían como píxeles sueltos (parecía una foto
# con ruido). Se suaviza lo que queda por debajo de ~2 px y se quitan los
# píxeles aislados al final.
DERIV_DEG = 0.22       # paso de la derivada del relieve, en grados (~1 px en el centro)
ALB_BLUR  = 3          # radio (px del mosaico, ~0,09° cada uno) del suavizado del albedo
LIMPIAR   = 2          # pasadas de quitar píxeles aislados (0 = sin limpieza)

# ------------------------------------------------ rampas con cambio de tono
# Igual que en la Tierra: cada escalón hacia la sombra oscurece y gira el tono
# hacia azul-violeta; hacia la luz, hacia amarillo y menos saturado.
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

SPACE = (0x05, 0x06, 0x0a)

# Materiales por albedo (valor del mosaico LROC, 0-255; en la cara visible los
# mares se agrupan en torno a 80 y las tierras altas en torno a 145).
ALBEDO = [  # (hasta, color a plena luz)
    (76,  (0x5a, 0x5d, 0x66)),   # mar oscuro (Tranquilidad, Serenidad…)
    (100, (0x6d, 0x70, 0x77)),   # mar
    (124, (0x86, 0x87, 0x8a)),   # borde de mar / tierras bajas
    (160, (0xa3, 0xa1, 0x9d)),   # tierras altas
    (186, (0xbd, 0xba, 0xb3)),   # tierras altas claras
    (256, (0xda, 0xd7, 0xcf)),   # rayos y eyecta fresca (Tycho, Copérnico…)
]
# Pruebas del 17-sep-2026 (la cara visible "parece de poca resolución"): en la
# cara visible los mares se amontonan en 80-89 y el corte de 76 los partía en
# manchas de dos grises casi iguales. Umbrales en los valles del histograma:
# un solo "mar" de 66 a 104 (con "mar oscuro" solo para lo muy oscuro).
ALBEDO_VALLE = [66, 104, 128, 160, 186, 256]
# Relieve extra en los mares (llanos: sin esto no tienen bordes nítidos, solo
# manchas): multiplica la exageración donde el albedo es de mar, con rampa
# entre MARES_A y MARES_B.
RELIEVE_MARES = 1.0
MARES_A, MARES_B = 100, 120
# Paso de la derivada del relieve dentro de los mares, en veces DERIV_DEG: más
# largo = relieve más suave (quita el grano que sale al exagerar, deja las
# arrugas de lava, que miden varios km).
MARES_DERIV = 1.0
# Cara oculta más oscura (bocetos 17-sep-2026): EXPOSICION multiplica toda la
# luz (1 = como la visible); FRIO (0-1) enfría los colores hacia azul.
EXPOSICION = 1.0
FRIO = 0.0


def ramp(col, k):
    h, s, v = colorsys.rgb_to_hsv(col[0] / 255.0, col[1] / 255.0, col[2] / 255.0)
    if k < 0:
        if s < 0.12:
            h = 225.0 / 360.0                   # grises: sombra fría, no rosada
        amt = min(HUE_MAX, -k * HUE_STEP)
        if 60.0 / 360.0 <= h <= HUE_SHADOW:
            h = min(h + amt, HUE_SHADOW)
        s = min(1.0, s + min(SAT_SH_MAX, -k * SAT_SHADOW))
        v *= STEP ** -k
    elif k > 0:
        d = (HUE_LIGHT - h + 0.5) % 1.0 - 0.5
        amt = min(HUE_MAX, k * HUE_STEP)
        h = HUE_LIGHT if abs(d) <= amt else (h + math.copysign(amt, d)) % 1.0
        s = max(0.0, s - k * SAT_LIGHT)
        v = min(1.0, v / STEP ** k)
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    if FRIO:
        r, g, b = r * (1 - 0.10 * FRIO), g * (1 - 0.03 * FRIO), min(1.0, b * (1 + 0.10 * FRIO))
    return (r * 255.0, g * 255.0, b * 255.0)


# --------------------------------------------------------------- fuentes
def cargar():
    dem = array.array("h")
    with open(os.path.join(FUENTES, "ldem_16.img"), "rb") as fh:
        dem.frombytes(fh.read())
    if sys.byteorder != "little":
        dem.byteswap()
    with open(os.path.join(FUENTES, "lroc_4k.bmp"), "rb") as fh:
        bmp = fh.read()
    off = int.from_bytes(bmp[10:14], "little")
    alb = bmp[off + 1::3]                       # canal verde (el mapa es casi gris)
    return dem, _desenfocar(alb, ALB_W, ALB_H, ALB_BLUR)


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


DEM_W, DEM_H, DEM_PPD = 5760, 2880, 16
ALB_W, ALB_H = 4096, 2048


def cargar_dem(ppd):
    """El LDEM de `ppd` px/grado (16 o 64; mismo formato)."""
    dem = array.array("h")
    with open(os.path.join(FUENTES, f"ldem_{ppd}.img"), "rb") as fh:
        dem.frombytes(fh.read())
    if sys.byteorder != "little":
        dem.byteswap()
    return dem


def hacer_muestreo(dem, alb, dem_ppd=DEM_PPD):
    DEM_W, DEM_H = 360 * dem_ppd, 180 * dem_ppd

    def altura(lat, lon):
        """Metros sobre la esfera de referencia (bilineal). lon en grados, cualquier rango."""
        fr = (90.0 - lat) * dem_ppd - 0.5
        fc = (lon % 360.0) * dem_ppd - 0.5
        r0 = math.floor(fr); c0 = math.floor(fc)
        tr = fr - r0; tc = fc - c0
        r0 = 0 if r0 < 0 else DEM_H - 1 if r0 >= DEM_H else r0
        r1 = r0 + 1 if r0 + 1 < DEM_H else r0
        c0 %= DEM_W
        c1 = (c0 + 1) % DEM_W
        b0, b1 = r0 * DEM_W, r1 * DEM_W
        a = dem[b0 + c0] * (1 - tc) + dem[b0 + c1] * tc
        b = dem[b1 + c0] * (1 - tc) + dem[b1 + c1] * tc
        return (a * (1 - tr) + b * tr) * 0.5

    def albedo(lat, lon):
        fr = (90.0 - lat) / 180.0 * ALB_H - 0.5
        fc = ((lon + 180.0) % 360.0) / 360.0 * ALB_W - 0.5
        r0 = math.floor(fr); c0 = math.floor(fc)
        tr = fr - r0; tc = fc - c0
        r0 = 0 if r0 < 0 else ALB_H - 1 if r0 >= ALB_H else r0
        r1 = r0 + 1 if r0 + 1 < ALB_H else r0
        c0 %= ALB_W
        c1 = (c0 + 1) % ALB_W
        b0, b1 = r0 * ALB_W, r1 * ALB_W
        a = alb[b0 + c0] * (1 - tc) + alb[b0 + c1] * tc
        b = alb[b1 + c0] * (1 - tc) + alb[b1 + c1] * tc
        return a * (1 - tr) + b * tr

    return altura, albedo


# ---------------------------------------------------- pasada lenta: geometría
def sol():
    f, a = math.radians(FASE), math.radians(SOL_ARR)
    # coordenadas de vista: x derecha, y arriba, z hacia el observador
    x = LADO * math.sin(f) * math.cos(a)
    y = math.sin(f) * math.sin(a)
    z = math.cos(f)
    n = math.sqrt(x * x + y * y + z * z)
    return x / n, y / n, z / n


def pasada_lenta():
    dem, alb = cargar()
    altura, albedo = hacer_muestreo(dem, alb)
    SX, SY, SZ = sol()
    d_deg = DERIV_DEG
    d_m = math.radians(d_deg) * LUNA_R
    sl0, cl0 = math.sin(math.radians(LAT0)), math.cos(math.radians(LAT0))
    paso_sombra = 1.0 / DEM_PPD                  # grados por paso al buscar sombras
    paso_m = math.radians(paso_sombra) * LUNA_R
    subs = [((i + 0.5) / SUPER) for i in range(SUPER)]

    out = []                                     # por píxel: None o (albedo, lam_esfera, k_relieve, sombra, dc)
    for sy in range(SIZE):
        fila = []
        for sx in range(SIZE):
            cx = (sx + 0.5 - SIZE / 2.0) / RADIUS
            cy = -(sy + 0.5 - SIZE / 2.0) / RADIUS
            dc = math.sqrt(cx * cx + cy * cy)
            if dc > 1.0 + LIMB_AA / RADIUS:
                fila.append(None)
                continue
            a_acc = 0.0
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
                    # rotar al sistema de la Luna (solo inclinación en latitud; LON0 se suma)
                    yy = y * cl0 + z * sl0
                    zz = -y * sl0 + z * cl0
                    lat = math.degrees(math.asin(max(-1.0, min(1.0, yy))))
                    lon = math.degrees(math.atan2(x, zz)) + LON0
                    a_acc += albedo(lat, lon)   # (se vuelve a leer abajo si RELIEVE_MARES; da igual, es barato)
                    # normal local desde el relieve
                    cl = max(0.02, math.cos(math.radians(lat)))
                    he = (altura(lat, lon + d_deg / cl) - altura(lat, lon - d_deg / cl)) / (2 * d_m)
                    hn = (altura(lat + d_deg, lon) - altura(lat - d_deg, lon)) / (2 * d_m)
                    exag = RELIEVE_EXAG
                    if RELIEVE_MARES != 1.0 or MARES_DERIV != 1.0:
                        t_mar = 1.0 - smooth(MARES_A, MARES_B, albedo(lat, lon))   # 1 = mar
                        exag *= 1.0 + (RELIEVE_MARES - 1.0) * t_mar
                        if MARES_DERIV != 1.0 and t_mar > 0.0:
                            d2 = d_deg * MARES_DERIV
                            d2_m = d_m * MARES_DERIV
                            he2 = (altura(lat, lon + d2 / cl) - altura(lat, lon - d2 / cl)) / (2 * d2_m)
                            hn2 = (altura(lat + d2, lon) - altura(lat - d2, lon)) / (2 * d2_m)
                            he += (he2 - he) * t_mar
                            hn += (hn2 - hn) * t_mar
                    ne, nn, nu = -he * exag, -hn * exag, 1.0
                    ln = math.sqrt(ne * ne + nn * nn + 1.0)
                    ne, nn, nu = ne / ln, nn / ln, nu / ln
                    # base local (E, N, U) en coordenadas de vista
                    Ux, Uy, Uz = x, y, z
                    # eje de giro de la Luna en vista (con LAT0 = 0 es (0, 1, 0);
                    # con LAT0 < 0 el polo norte se inclina hacia atrás)
                    ax, ay, az = 0.0, cl0, sl0
                    # E = eje x U, normalizado
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
                # anillo de suavizado exterior: sin superficie, solo borde
                fila.append((None, 0.0, 0, False, dc))
                continue
            A = a_acc / cnt
            nx, ny, nz = n_acc
            ln = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            nx, ny, nz = nx / ln, ny / ln, nz / ln
            ux, uy, uz = Uc
            lam_s = ux * SX + uy * SY + uz * SZ     # luz sobre la esfera lisa
            lam_l = nx * SX + ny * SY + nz * SZ     # luz sobre el relieve
            if lam_s > 0.02:
                ratio = max(lam_l, 0.004) / lam_s
                if RELIEVE_ELEV_MAX is not None and lam_s > math.sin(math.radians(RELIEVE_ELEV_MAX)):
                    ex_, ey_, ez_ = Ec
                    nx_, ny_, nz_ = Nc
                    se = SX * ex_ + SY * ey_ + SZ * ez_
                    sn = SX * nx_ + SY * ny_ + SZ * nz_
                    ls = math.sqrt(se * se + sn * sn) or 1.0
                    ch = math.cos(math.radians(RELIEVE_ELEV_MAX)) / ls
                    sv = math.sin(math.radians(RELIEVE_ELEV_MAX))
                    Lx = ch * (se * ex_ + sn * nx_) + sv * ux
                    Ly = ch * (se * ey_ + sn * ny_) + sv * uy
                    Lz = ch * (se * ez_ + sn * nz_) + sv * uz
                    ratio = max(nx * Lx + ny * Ly + nz * Lz, 0.004) / sv
                k_rel = round(math.log(ratio) / _LNSTEP * RELIEVE_K)
                k_rel = max(RELIEVE_MIN, min(RELIEVE_MAX, k_rel))
            else:
                k_rel = 0
            # sombra proyectada: marcha sobre el relieve hacia el sol
            sombra = False
            if lam_l <= 0.0 and lam_s > 0.0:
                sombra = True
            elev_sol = math.degrees(math.asin(max(-1.0, min(1.0, lam_s))))
            if not sombra and 0.0 < elev_sol < SOMBRA_ELEV:
                se = SX * Ec[0] + SY * Ec[1] + SZ * Ec[2]
                sn = SX * Nc[0] + SY * Nc[1] + SZ * Nc[2]
                ls = math.sqrt(se * se + sn * sn) or 1.0
                se, sn = se / ls, sn / ls
                tan_e = math.tan(math.radians(elev_sol))
                h0 = altura(lat_c, lon_c)
                cl = max(0.05, math.cos(math.radians(lat_c)))
                # hasta donde podría llegar la sombra del pico más alto (~6 km)
                n_pasos = min(160, int(6000.0 / max(tan_e, 0.02) / paso_m) + 1)
                for i in range(1, n_pasos + 1):
                    t = i * paso_sombra
                    D = i * paso_m
                    h = altura(lat_c + sn * t, lon_c + se * t / cl) - D * D / (2 * LUNA_R)
                    if h > h0 + D * tan_e:
                        sombra = True
                        break
            fila.append((A, lam_s, k_rel, sombra, dc))
        out.append(fila)
        if sy % 50 == 0:
            print(f"  fila {sy}/{SIZE}", flush=True)
    return out


# --------------------------------------------------------- pasada rápida: color
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


def colorear(datos):
    _cache = {}
    filas = []
    r_in = 1.0 - LIMB_AA / RADIUS
    r_out = 1.0 + LIMB_AA / RADIUS
    # 1) material y escalón de rampa por píxel (enteros/tercios: se pueden limpiar)
    grid = [[None] * SIZE for _ in range(SIZE)]
    k_noche = math.log(NOCHE * EXPOSICION) / _LNSTEP
    for y, fila in enumerate(datos):
        for x, p in enumerate(fila):
            if p is None or p[0] is None:
                continue
            A, lam_s, k_rel, sombra, dc = p
            m = 0
            while m < len(ALBEDO) - 1 and A >= ALBEDO[m][0]:
                m += 1
            bright = NOCHE + (1.0 - NOCHE) * smooth(TERM_A, TERM_B, lam_s)
            bright *= (1.0 - LIMB_K * smooth(0.75, 1.0, dc)) * EXPOSICION
            kg = math.floor(math.log(max(bright, 1e-3)) / _LNSTEP * LIGHT_SUB + 0.5) / LIGHT_SUB
            if lam_s > 0.0:
                k = max(kg + (SOMBRA_K if sombra else k_rel), k_noche)   # la sombra no pasa de la luz cenicienta
            else:
                k = kg
            grid[y][x] = (m, round(k * LIGHT_SUB))
    for _ in range(LIMPIAR):
        grid = _limpiar(grid)
    # 2) color
    for y, fila in enumerate(datos):
        row = bytearray(SIZE * 4)
        for i, p in enumerate(fila):
            if p is None:
                continue
            dc = p[4]
            g = grid[y][i]
            if g is None:
                col = SPACE
            else:
                col = _cache.get(g)
                if col is None:
                    col = _cache[g] = ramp(ALBEDO[g[0]][1], g[1] / LIGHT_SUB)
            if dc > r_in:
                col = mix(SPACE, col, 1.0 - smooth(r_in, r_out, dc))
            j = i * 4
            row[j:j + 4] = bytes((max(0, min(255, round(col[0]))),
                                  max(0, min(255, round(col[1]))),
                                  max(0, min(255, round(col[2]))), 255))
        filas.append(bytes(row))
    return filas


# ------------------------------------------------------ datos del <canvas>
# La Luna en reposo es el PNG aprobado de cada cara (con sombras proyectadas,
# supermuestreo y limpieza). Solo durante la media vuelta se pinta en tiempo
# real desde un mapa en latitud/longitud:
#   luna-mapa.png  MAPA_W x MAPA_H: R = material por albedo (0-5), G/B = normal
#                  del relieve (este, norte; ya exagerada) de -1..1 a 0..255
#   luna-lut.png   color de cada material (fila) por escalón de luz (columna)
#   luna-datos.json  constantes de luz/geometría y las dos caras
# Las aprobadas (17-sep-2026). Las dos llevan los mares de la V2 (--valles
# --relieve-mares 2.5: el mapa del giro es uno solo para las dos caras).
#   visible: --derecha --valles --relieve-mares 2.5                         (V2)
#   oculta:  --oculta --sur --valles --relieve-mares 2.5 --exposicion 0.6 --frio 0.5   (D3)
CARAS = {
    "visible": {"lat0": 0.0, "lon0": 0.0, "fase": 38.0, "lado": 1, "exposicion": 1.0, "frio": 0.0,
                "png": "luna-visible-derecha-valles-rm2.5.png"},
    "oculta": {"lat0": -30.0, "lon0": 180.0, "fase": 65.0, "lado": 1, "exposicion": 0.6, "frio": 0.5,
               "png": "luna-oculta-sur-f65-valles-rm2.5-e0.6-frio0.5.png"},
}
MAPA_W, MAPA_H = 1440, 720  # 4 px/grado (~7,6 km por celda; un píxel del disco son ~6 km)
LUT_KMIN, LUT_KMAX = -20, 4   # escalones de rampa que caben (noche con exposición 0,6 + relieve + sombra)
FRIO_PASOS = 5                # LUT por cada tono frío de 0 a FRIO_MAX (el giro pasa de uno a otro)
NORMAL_NIVELES = 64           # niveles por componente de la normal en el mapa (menos = PNG más ligero)


def export_canvas(outdir):
    import json
    import shutil
    global ALBEDO, RELIEVE_MARES, FRIO
    os.makedirs(outdir, exist_ok=True)
    ALBEDO = [(u, col) for u, (_, col) in zip(ALBEDO_VALLE, ALBEDO)]
    RELIEVE_MARES = 2.5
    q = NORMAL_NIVELES - 1
    dem, alb = cargar()
    altura, albedo = hacer_muestreo(dem, alb)
    d_deg = DERIV_DEG
    d_m = math.radians(d_deg) * LUNA_R
    filas = []
    for r in range(MAPA_H):
        lat = 90.0 - (r + 0.5) * 180.0 / MAPA_H
        cl = max(0.02, math.cos(math.radians(lat)))
        fila = bytearray(MAPA_W * 4)
        for c in range(MAPA_W):
            lon = (c + 0.5) * 360.0 / MAPA_W - 180.0
            A = albedo(lat, lon)
            m = 0
            while m < len(ALBEDO) - 1 and A >= ALBEDO[m][0]:
                m += 1
            he = (altura(lat, lon + d_deg / cl) - altura(lat, lon - d_deg / cl)) / (2 * d_m)
            hn = (altura(lat + d_deg, lon) - altura(lat - d_deg, lon)) / (2 * d_m)
            exag = RELIEVE_EXAG * (1.0 + (RELIEVE_MARES - 1.0) * (1.0 - smooth(MARES_A, MARES_B, A)))
            ne, nn = -he * exag, -hn * exag
            ln = math.sqrt(ne * ne + nn * nn + 1.0)
            o = c * 4
            fila[o:o + 4] = bytes((m, round((ne / ln + 1) / 2 * q), round((nn / ln + 1) / 2 * q), 255))
        filas.append(bytes(fila))
        if r % 90 == 0:
            print(f"  mapa {r}/{MAPA_H}", flush=True)
    write_rgba(os.path.join(outdir, "luna-mapa.png"), MAPA_W, MAPA_H, filas)
    kn = (LUT_KMAX - LUT_KMIN) * LIGHT_SUB + 1
    frio_max = max(c["frio"] for c in CARAS.values())
    lut = []                                    # filas: FRIO_PASOS+1 bloques de materiales
    for paso in range(FRIO_PASOS + 1):
        FRIO = frio_max * paso / FRIO_PASOS
        for _, col in ALBEDO:
            fila = bytearray(kn * 4)
            for j in range(kn):
                rgb = ramp(col, LUT_KMIN + j / LIGHT_SUB)
                fila[j * 4:j * 4 + 4] = bytes([max(0, min(255, round(v))) for v in rgb] + [255])
            lut.append(bytes(fila))
    FRIO = 0.0
    write_rgba(os.path.join(outdir, "luna-lut.png"), kn, len(lut), lut)
    caras = {}
    for nombre, cara in CARAS.items():
        shutil.copyfile(os.path.join(SALIDA, cara["png"]), os.path.join(outdir, f"luna-{nombre}.png"))
        caras[nombre] = {k: v for k, v in cara.items() if k != "png"}
    datos = {
        "SIZE": SIZE, "RADIUS": RADIUS, "LIMB_AA": LIMB_AA, "SOL_ARR": SOL_ARR,
        "TERM_A": TERM_A, "TERM_B": TERM_B, "NOCHE": NOCHE, "LIMB_K": LIMB_K,
        "RELIEVE_K": RELIEVE_K, "RELIEVE_MIN": RELIEVE_MIN, "RELIEVE_MAX": RELIEVE_MAX,
        "RELIEVE_ELEV_MAX": RELIEVE_ELEV_MAX, "SOMBRA_K": SOMBRA_K,
        "LNSTEP": _LNSTEP, "LIGHT_SUB": LIGHT_SUB, "LUT_KMIN": LUT_KMIN, "LUT_KN": kn,
        "MAPA_W": MAPA_W, "MAPA_H": MAPA_H, "SPACE": SPACE, "caras": caras,
        "MATERIALES": len(ALBEDO), "FRIO_PASOS": FRIO_PASOS, "FRIO_MAX": frio_max,
        "NORMAL_NIVELES": NORMAL_NIVELES,
    }
    with open(os.path.join(outdir, "luna-datos.json"), "w") as fh:
        json.dump(datos, fh, separators=(",", ":"))


# ------------------------------------------------ teselas del zoom (/luna)
# La Luna que gira y se acerca (23-sep-2026, ver LUNA-WIP.md): como Marte
# (generar-marte.py), tres niveles finos en teselas de 360 x 360 celdas para
# el motor WebGL (src/scripts/marte-gl.js): 8, 16 y 24 px/grado. El mapa base
# (luna-mapa.png, 4 px/grado) y las dos caras aprobadas no se tocan.
# Pixel art contenido (usuario, 23-sep-2026: "demasiado detalle hace que
# parezca menos pixel art… lo que no quiero es que se convierta en algo súper
# realista"): los materiales (mares y tierras altas) salen del mismo mosaico
# de 4k y con el mismo suavizado que la base, así que el zoom no añade
# manchas nuevas, solo afina los bordes; el detalle nuevo es solo el relieve,
# del LDEM de 16 px/grado (el de 32 no existe), con la derivada a
# TESELA_DERIV celdas del nivel (1 = lo más fino que da el dato; el usuario
# eligió esta, la "d1", frente a una más suavizada).
# El nivel de 32 px/grado (n4) sale del LDEM de 64 (530 MB) (usuario,
# 23-sep-2026: "¿no se puede sacar un pelín más de resolución?"): la Luna se
# dibuja con 292,5 px de arte de radio, así que a x6 son 30,6 px de arte por
# grado; con el de 24 cada celda ocupaba 1,28 px (bloques de 1 y 2 px), con
# el de 32, 0,96, como Marte a x6.
TESELA = 360
NIVELES_ZOOM = [4, 8, 16, 24, 32]             # px/grado; el 4 es luna-mapa.png
DEM_FINO = {32: 64}                           # nivel -> LDEM del que sale (si no, el de 16)
TESELA_DERIV = 1.0


def export_teselas(outdir, zona=None, deriv=TESELA_DERIV, solo=None):
    """`zona` = (lat sur, lat norte, lon oeste, lon este): solo las teselas
    que la tocan (para comparar variantes sin hacer la Luna entera). `solo`:
    los niveles que se hacen (los demás se dejan como estén)."""
    import json
    global ALBEDO, RELIEVE_MARES
    ALBEDO = [(u, col) for u, (_, col) in zip(ALBEDO_VALLE, ALBEDO)]   # como export_canvas
    RELIEVE_MARES = 2.5
    q = NORMAL_NIVELES - 1
    dem16, alb = cargar()
    for n, ppd in enumerate(NIVELES_ZOOM):
        if n == 0 or (solo and n not in solo):
            continue
        dppd = DEM_FINO.get(ppd, DEM_PPD)
        altura, albedo = hacer_muestreo(dem16 if dppd == DEM_PPD else cargar_dem(dppd), alb, dppd)
        carpeta = os.path.join(outdir, f"n{n}")
        os.makedirs(carpeta, exist_ok=True)
        d_deg = max(deriv / ppd, 1.0 / dppd)        # la derivada, nunca más fina que el dato
        d_m = math.radians(d_deg) * LUNA_R
        w, h = 360 * ppd, 180 * ppd
        grados = TESELA / ppd
        for tf in range(h // TESELA):
            cols = list(range(w // TESELA))
            if zona:
                norte, sur = 90.0 - tf * grados, 90.0 - (tf + 1) * grados
                if sur >= zona[1] or norte <= zona[0]:
                    continue
                cols = [tc for tc in cols
                        if -180.0 + tc * grados < zona[3] and -180.0 + (tc + 1) * grados > zona[2]]
            for tc in cols:
                filas = []
                for r in range(tf * TESELA, (tf + 1) * TESELA):
                    lat = 90.0 - (r + 0.5) / ppd
                    cl = max(0.02, math.cos(math.radians(lat)))
                    fila = bytearray(TESELA * 4)
                    for i, c in enumerate(range(tc * TESELA, (tc + 1) * TESELA)):
                        lon = (c + 0.5) / ppd - 180.0
                        A = albedo(lat, lon)
                        m = 0
                        while m < len(ALBEDO) - 1 and A >= ALBEDO[m][0]:
                            m += 1
                        he = (altura(lat, lon + d_deg / cl) - altura(lat, lon - d_deg / cl)) / (2 * d_m)
                        hn = (altura(lat + d_deg, lon) - altura(lat - d_deg, lon)) / (2 * d_m)
                        exag = RELIEVE_EXAG * (1.0 + (RELIEVE_MARES - 1.0) * (1.0 - smooth(MARES_A, MARES_B, A)))
                        ne, nn = -he * exag, -hn * exag
                        ln = math.sqrt(ne * ne + nn * nn + 1.0)
                        fila[i * 4:i * 4 + 4] = bytes((m, round((ne / ln + 1) / 2 * q), round((nn / ln + 1) / 2 * q), 255))
                    filas.append(bytes(fila))
                write_rgba(os.path.join(carpeta, f"{tf}-{tc}.png"), TESELA, TESELA, filas)
            print(f"  nivel {n}: banda {tf + 1}/{h // TESELA}", flush=True)
    # los niveles, en luna-datos.json (el resto, como lo dejó --canvas)
    ruta = os.path.join(outdir, "luna-datos.json")
    with open(ruta) as fh:
        datos = json.load(fh)
    datos["TESELA"] = TESELA
    datos["NIVELES"] = [{"ppd": p, "teselas": i > 0} for i, p in enumerate(NIVELES_ZOOM)]
    with open(ruta, "w") as fh:
        json.dump(datos, fh, separators=(",", ":"))


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--teselas":
        # python3 generar-luna.py --teselas carpeta/ [--zona S,N,O,E] [--deriv 1.5] [--solo 4]
        zona = tuple(map(float, sys.argv[sys.argv.index("--zona") + 1].split(","))) if "--zona" in sys.argv else None
        deriv = float(sys.argv[sys.argv.index("--deriv") + 1]) if "--deriv" in sys.argv else TESELA_DERIV
        # --solo 4: solo el nivel n4 (los demás, como estén)
        solo = set(map(int, sys.argv[sys.argv.index("--solo") + 1].split(","))) if "--solo" in sys.argv else None
        export_teselas(sys.argv[2], zona, deriv, solo)
        print("->", sys.argv[2])
        return
    if len(sys.argv) >= 3 and sys.argv[1] == "--canvas":
        export_canvas(sys.argv[2])
        print("->", sys.argv[2])
        return
    os.makedirs(SALIDA, exist_ok=True)
    global LADO, TERM_B, LAT0, LON0, FASE
    nombre = "luna-visible"
    if "--oculta" in sys.argv:                  # media vuelta: la cara que nunca se ve desde la Tierra
        LON0, FASE, LADO, nombre = 180.0, 65.0, 1, "luna-oculta"
        if "--sur" in sys.argv:                 # la cuenca Polo Sur-Aitken (~53° S, 191° E) hacia el centro
            LAT0 = -30.0
            nombre += "-sur"
        if "--fase" in sys.argv:
            FASE = float(sys.argv[sys.argv.index("--fase") + 1])
        nombre += f"-f{FASE:g}"
    elif "--derecha" in sys.argv:
        LADO, nombre = 1, "luna-visible-derecha"
    global ALBEDO, RELIEVE_MARES
    if "--valles" in sys.argv:                  # umbrales de albedo en los valles del histograma
        ALBEDO = [(u, col) for u, (_, col) in zip(ALBEDO_VALLE, ALBEDO)]
        nombre += "-valles"
    if "--relieve-mares" in sys.argv:           # más relieve en los mares
        RELIEVE_MARES = float(sys.argv[sys.argv.index("--relieve-mares") + 1])
        nombre += f"-rm{RELIEVE_MARES:g}"
    global LIMPIAR, MARES_DERIV, EXPOSICION, FRIO, NOCHE
    if "--exposicion" in sys.argv:              # no toca la pasada lenta: solo el color
        EXPOSICION = float(sys.argv[sys.argv.index("--exposicion") + 1])
        nombre += f"-e{EXPOSICION:g}"
    if "--noche" in sys.argv:                   # luz cenicienta del lado sin sol (solo color)
        NOCHE = float(sys.argv[sys.argv.index("--noche") + 1])
        nombre += f"-n{NOCHE:g}"
    if "--frio" in sys.argv:
        FRIO = float(sys.argv[sys.argv.index("--frio") + 1])
        nombre += f"-frio{FRIO:g}"
    if "--suave-mares" in sys.argv:             # relieve de los mares más suave (menos grano)
        MARES_DERIV = float(sys.argv[sys.argv.index("--suave-mares") + 1])
        nombre += f"-sm{MARES_DERIV:g}"
    if "--limpiar" in sys.argv:                 # pasadas de quitar píxeles aislados (no toca la pasada lenta)
        LIMPIAR = int(sys.argv[sys.argv.index("--limpiar") + 1])
        nombre += f"-l{LIMPIAR}"
    if "--penumbra-corta" in sys.argv:          # no toca la pasada lenta: solo el color
        TERM_B = 0.15
        nombre += "-penumbra-corta"
    cache = os.path.join(FUENTES, "cache-visible.bin" if nombre.startswith("luna-visible") and RELIEVE_MARES == 1.0
                         and MARES_DERIV == 1.0
                         else f"cache-{nombre}.bin")
    firma = (SIZE, RADIUS, LAT0, LON0, SUPER, FASE, SOL_ARR, LADO, DERIV_DEG, ALB_BLUR, RELIEVE_ELEV_MAX, RELIEVE_EXAG, RELIEVE_K,
             RELIEVE_MIN, RELIEVE_MAX, SOMBRA_ELEV) + ((RELIEVE_MARES, MARES_A, MARES_B, MARES_DERIV)
                                                if RELIEVE_MARES != 1.0 or MARES_DERIV != 1.0 else ())
    datos = None
    if "--recalc" not in sys.argv and os.path.exists(cache):
        with open(cache, "rb") as fh:
            f, d = pickle.load(fh)
        if f == firma:
            datos = d
    if datos is None:
        print("pasada lenta (proyección, relieve, sombras)…")
        datos = pasada_lenta()
        with open(cache, "wb") as fh:
            pickle.dump((firma, datos), fh)
    filas = colorear(datos)
    ruta = os.path.join(SALIDA, nombre + ".png")
    write_rgba(ruta, SIZE, SIZE, filas)
    print("->", ruta)
    if "--zoom" in sys.argv:                    # recorte ampliado x4 (vecino más próximo) para revisar píxeles
        x0, y0, n, z = 225, 225, 150, 4       # centro del disco
        zfilas = []
        for fila in filas[y0:y0 + n]:
            fz = bytearray()
            for i in range(x0, x0 + n):
                fz += fila[i * 4:i * 4 + 4] * z
            zfilas += [bytes(fz)] * z
        rz = os.path.join(SALIDA, nombre + "-zoom.png")
        write_rgba(rz, n * z, n * z, zfilas)
        print("->", rz)


if __name__ == "__main__":
    main()
