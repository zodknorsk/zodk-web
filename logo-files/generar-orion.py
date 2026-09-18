"""Pixel art de la Orion de Artemis II (abril de 2026) para /luna.

Genera public/luna/zodk-orion-giro.png (día) y zodk-orion-giro-noche.png: una
tira de 32 fotogramas de 64x56 px, uno por cada 1/32 de la órbita que da la
nave alrededor de la Luna en /luna (.luna-nave en global.css). En cada uno la
nave apunta hacia donde va, calculado con las mismas curvas que la animación
CSS (pos_orbita()): por delante va de perfil, en el borde izquierdo se la ve
de cola (la X de alas entera) y en el derecho de frente.

Los fotogramas salen de un pequeño renderizador 3D (orion()): la nave con
medidas reales aproximadas, girada, iluminada desde arriba a la izquierda y
rasterizada con z-buffer a la rejilla, a la misma escala y centro en todos.
Se pinta con "materiales" y dos paletas; la de noche es la del Sentinel-2 de
la portada (alas algo más claras) y la de día sigue su misma relación.
En PNG y no en SVG: 32 dibujos en un SVG animado es lo que calienta Zen.

Uso:  python3 generar-orion.py [--png DIR]   (--png: tira ampliada x3, PPM)
      python3 generar-orion.py --css         (@keyframes nave-sombra, para
                                              pegar en global.css)
"""
import importlib.util
import math
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("queqiao", os.path.join(AQUI, "generar-queqiao.py"))
q = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(q)

W, H = 64, 56
ESCALA = 3.2                        # celdas por metro, igual en todos los fotogramas
DESTINO = os.path.join(AQUI, "..", "public", "luna")

# Materiales -> (día, noche)
PALETAS = {
    "contorno": ("#0c1526", "#050a12"),
    "g0": ("#5b6069", "#33363c"),   # plata de la cápsula, de oscuro a claro
    "g1": ("#8a9099", "#565a63"),
    "g2": ("#b5bac2", "#767b86"),
    "g3": ("#dde1e6", "#9aa0ab"),
    "g4": ("#f4f6f8", "#c3c8cf"),
    "b0": ("#a4a9b1", "#4f545d"),   # blanco del aislamiento del ESM
    "b1": ("#cdd1d6", "#6f7580"),
    "b2": ("#eceef1", "#8f959f"),
    "escudo": ("#3a2f24", "#1f1a14"),
    "ventana": ("#0d1430", "#0a1020"),
    "brillo": ("#cdd8f2", "#6b789e"),
    "o1": ("#b08a41", "#544629"),   # lámina dorada
    "o2": ("#d9b060", "#6a5837"),
    "o3": ("#f6e2a8", "#877655"),
    # Paneles. De noche, algo más claros que en el Sentinel-2: con su azul se
    # fundían con el espacio (pedido del usuario).
    "p0": ("#0d1430", "#111a33"),
    "p1": ("#1e2850", "#22305a"),
    "p2": ("#41528f", "#40508a"),
    "p3": ("#cdd8f2", "#8494bd"),
    "brazo": ("#8a9099", "#565a63"),
}


class Lienzo(q.Lienzo):
    def contorno(self):
        for (x, y) in list(self.solido):
            for vx, vy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v = (x + vx, y + vy)
                if v not in self.solido and 0 <= v[0] < W and 0 <= v[1] < H:
                    self.fino.setdefault(v, "contorno")

    def pon(self, x, y, c, fino=False):
        if 0 <= x < W and 0 <= y < H:
            (self.fino if fino else self.solido)[(x, y)] = c


def ala(l, ox, oy, ang, largo, ancho):
    """Ala solar recta desde (ox, oy) en la dirección `ang` (radianes), con
    tres paneles separados por un hueco con el brazo en medio."""
    ux, uy = math.cos(ang), math.sin(ang)
    px, py = -uy, ux
    seg = largo / 3
    for y in range(H):
        for x in range(W):
            dx, dy = x + 0.5 - ox, y + 0.5 - oy
            t = dx * ux + dy * uy          # a lo largo del ala
            s = dx * px + dy * py          # a lo ancho
            if not (0 <= t <= largo and abs(s) <= ancho / 2):
                continue
            en_seg = t % seg
            if t < 2.5 or en_seg < 1.6:    # arranque y huecos: solo el brazo
                if abs(s) < 0.8:
                    l.pon(x, y, "brazo")
                continue
            borde = abs(s) > ancho / 2 - 1 or en_seg > seg - 0.9 or en_seg < 2.5
            if borde:
                l.pon(x, y, "p0")
            elif (x * 5 + y * 3) % 13 == 0:
                l.pon(x, y, "p3")
            else:
                l.pon(x, y, "p2" if (x + y) % 2 else "p1")


def orion_perfil():
    """Primera versión, dibujada a mano de perfil y en 48x36 (la que gustó
    antes de pedir ver las cuatro alas). Ya no se usa: el perfil sale ahora del
    renderizador, como las otras vistas. Se deja como referencia."""
    l = Lienzo()
    cy = 18
    # Alas en X: la pareja de delante, en diagonal arriba-derecha y
    # abajo-derecha, saliendo del ESM.
    ala(l, 28, cy - 4, -math.radians(50), 14, 6)
    ala(l, 28, cy + 4, math.radians(50), 14, 6)
    # ESM: cilindro blanco de aislamiento, con bandas y sombra abajo.
    for x in range(19, 31):
        for y in range(cy - 6, cy + 6):
            c = "b2" if y < cy - 2 else "b1" if y < cy + 3 else "b0"
            if x in (22, 27):
                c = "b0" if c != "b0" else "g1"   # juntas del aislamiento
            l.pon(x, y, c)
    # Tobera del motor principal, detrás.
    for i, x in enumerate(range(31, 35)):
        for y in range(cy - 2 - i // 2, cy + 2 + i // 2):
            l.pon(x, y, "g1" if y < cy else "g0")
    # Adaptador cápsula-ESM con lámina dorada.
    for x in (17, 18):
        for y in range(cy - 6, cy + 6):
            l.pon(x, y, "o3" if y < cy - 3 else "o2" if y < cy + 2 else "o1")
    # Escudo térmico (borde trasero de la cápsula).
    for y in range(cy - 7, cy + 7):
        l.pon(16, y, "escudo")
    # Cápsula: tronco de cono corto y ancho, como la de verdad (base de 5 m y
    # 3,3 de alto, lados a ~32°): de la punta (x=8, alto 4) a la base (x=15,
    # alto 14), con escalones regulares. Plateada, con luz desde arriba.
    for x, m in zip(range(8, 16), (2, 3, 4, 4, 5, 6, 6, 7)):
        for y in range(cy - m, cy + m):
            rel = (y - (cy - m)) / (2 * m)
            c = "g4" if rel < 0.2 else "g3" if rel < 0.5 else "g2" if rel < 0.8 else "g1"
            l.pon(x, y, c)
    # Punta: anillo de acoplamiento.
    for y in range(cy - 2, cy + 2):
        l.pon(7, y, "g1")
    # Ventanillas.
    for x in (11, 13):
        l.pon(x, cy - 3, "ventana")
        l.pon(x + 1, cy - 3, "ventana")
        l.pon(x, cy - 4, "brillo")
    l.contorno()
    return l


# --- Vista 3/4 desde delante: pequeño renderizador ---------------------------
# La nave se modela en 3D (metros, eje X de la punta de la cápsula hacia el
# motor), se gira a la vista, se ilumina desde arriba a la izquierda y se
# rasteriza por puntos con z-buffer en la rejilla. Medidas reales aproximadas
# salvo las alas, más cortas para que la cápsula no quede diminuta.
VISTA_EJE = (0.62, -0.50, 0.60)     # eje de la nave en cámara (x der, y abajo, z adentro)
VISTA_GIRO = 0                      # giro de la X de alas sobre el eje (grados)
LUZ = (-0.55, -0.65, -0.5)          # hacia la luz: arriba-izquierda y hacia quien mira
ALA_LARGO = 5.2                     # m (de verdad ~7)
CENTRO = 6.4                        # m desde la punta: va al centro de la rejilla
ALA_BARRIDO = 35                    # alas inclinadas hacia el motor (grados),
                                    # como en el primer dibujo de perfil
ALA_CARA = 65                       # giro de cada ala sobre su largo (grados):
                                    # 0 = de canto desde delante; las de la
                                    # Orion giran para buscar el sol

RAMPAS = {
    "capsula": ["g0", "g1", "g2", "g3"],   # más oscura que el ESM: se separan
    "esm": ["b0", "b1", "b2", "b2"],
    "oro": ["o1", "o2", "o3"],
    "tobera": ["g0", "g1", "g2"],
    "escudo": ["escudo"],
    "ventana": ["ventana"],
    "brazo": ["g1", "g2"],
    "panel": ["p1", "p2"],
    "marco": ["p0"],
}


def _norm(v):
    n = math.sqrt(sum(c * c for c in v))
    return tuple(c / n for c in v)


def _cruz(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def _punto(o, *pares):
    return tuple(o[i] + sum(k * v[i] for k, v in pares) for i in range(3))


def orion(eje=None, giro=None, cara=None, barrido=None, esc=None, ref=(0, 0, 1)):
    """Renderiza una vista. Sin `esc`, la nave se encaja en la rejilla; con
    `esc` (celdas por metro), va a esa escala con el punto del eje a CENTRO m de la
    punta en el centro de la rejilla: así varias vistas casan al
    cambiar de una a otra."""
    eje = VISTA_EJE if eje is None else eje
    giro = VISTA_GIRO if giro is None else giro
    cara = ALA_CARA if cara is None else cara
    barrido = ALA_BARRIDO if barrido is None else barrido
    a = _norm(eje)
    u = _norm(_cruz(a, ref))   # `ref`: sin él, el giro de la X va con la pantalla
    v = _cruz(a, u)
    g = math.radians(giro)
    u, v = (_punto((0, 0, 0), (math.cos(g), u), (math.sin(g), v)),
            _punto((0, 0, 0), (-math.sin(g), u), (math.cos(g), v)))
    luz = _norm(LUZ)
    pts = []   # (pos, normal, material, parte)

    def radial(phi):
        return _punto((0, 0, 0), (math.cos(phi), u), (math.sin(phi), v))

    def superficie_rev(x0, x1, r0, r1, mat, parte, ventanas=False):
        pasos_x = max(2, int((x1 - x0) / 0.04))
        for i in range(pasos_x + 1):
            x = x0 + (x1 - x0) * i / pasos_x
            r = r0 + (r1 - r0) * (x - x0) / (x1 - x0)
            dr = (r1 - r0) / (x1 - x0)
            for k in range(int(2 * math.pi * r / 0.04) + 1):
                phi = 2 * math.pi * k / (int(2 * math.pi * r / 0.04) + 1)
                rad = radial(phi)
                pos = _punto((0, 0, 0), (x, a), (r, rad))
                n = _norm(_punto((0, 0, 0), (1, rad), (-dr, a)))
                m = mat
                if ventanas and 1.3 < x < 1.9 and any(abs(((phi - w) + math.pi) % (2 * math.pi) - math.pi) < 0.2 for w in (0.9, 2.1, 3.3, 4.5)):
                    m = "ventana"
                pts.append((pos, n, m, parte))

    def disco(x, r0, r1, normal, mat, parte):
        for k in range(int(r1 / 0.04) + 1):
            r = r0 + (r1 - r0) * k / (int(r1 / 0.04) + 1)
            n_phi = int(2 * math.pi * max(r, 0.05) / 0.04) + 1
            for j in range(n_phi):
                phi = 2 * math.pi * j / n_phi
                pts.append((_punto((0, 0, 0), (x, a), (r, radial(phi))), normal, mat, parte))

    # Cápsula (tronco de cono), su cara delantera y el escudo que asoma.
    superficie_rev(0, 3.3, 1.0, 2.5, "capsula", 1, ventanas=True)
    disco(0, 0, 1.0, tuple(-c for c in a), "capsula", 1)
    disco(3.3, 2.1, 2.5, a, "escudo", 1)
    # Adaptador con lámina dorada, módulo de servicio y tobera.
    superficie_rev(3.3, 3.9, 2.1, 2.1, "oro", 2)
    superficie_rev(3.9, 7.9, 2.05, 2.05, "esm", 3)
    disco(7.9, 0, 2.05, a, "esm", 3)
    superficie_rev(7.9, 9.1, 0.5, 0.95, "tobera", 4)
    # Cuatro alas en X, en la parte de atrás del ESM: de r=2.3 hacia fuera,
    # 1,9 m de ancho a lo largo del eje, tres paneles con huecos.
    b = math.radians(cara)
    sw = math.radians(barrido)
    for kk in range(4):
        d = radial(math.pi / 4 + kk * math.pi / 2)
        d = _norm(_punto((0, 0, 0), (math.cos(sw), d), (math.sin(sw), a)))
        tg = _cruz(a, d)
        wdir = _norm(_punto((0, 0, 0), (math.cos(b), a), (math.sin(b), tg)))
        n = _norm(_cruz(d, wdir))
        r0, r1 = 2.6, 2.6 + ALA_LARGO
        seg = (r1 - r0) / 3
        for i in range(int((r1 - 2.05) / 0.03) + 1):
            r = 2.05 + i * 0.03
            for j in range(int(1.9 / 0.03) + 1):
                x = 5.9 + j * 0.03
                pos = _punto((0, 0, 0), (6.85, a), (r, d), (x - 6.85, wdir))
                if r < r0:
                    if abs(x - 6.85) < 0.12:
                        pts.append((pos, n, "brazo", 5 + kk))
                    continue
                t = (r - r0) % seg
                if t < 0.25:
                    if abs(x - 6.85) < 0.12:
                        pts.append((pos, n, "brazo", 5 + kk))
                    continue
                borde = x < 5.99 or x > 7.71 or t < 0.37 or t > seg - 0.1
                pts.append((pos, n, "marco" if borde else "panel", 5 + kk))

    # Encaje en la rejilla.
    xs = [p[0][0] for p in pts]
    ys = [p[0][1] for p in pts]
    if esc is None:
        esc = min((W - 3) / (max(xs) - min(xs)), (H - 3) / (max(ys) - min(ys)))
        ox = (W - (max(xs) - min(xs)) * esc) / 2 - min(xs) * esc
        oy = (H - (max(ys) - min(ys)) * esc) / 2 - min(ys) * esc
    else:
        c = _punto((0, 0, 0), (CENTRO, a))
        ox, oy = W / 2 - c[0] * esc, H / 2 - c[1] * esc
    zbuf = {}
    for pos, n, m, parte in pts:
        cx, cy = int(pos[0] * esc + ox), int(pos[1] * esc + oy)
        if (cx, cy) not in zbuf or pos[2] < zbuf[(cx, cy)][0]:
            # Las dos caras de las alas: la normal, hacia quien mira.
            if m in ("panel", "marco", "brazo") and n[2] > 0:
                n = tuple(-c for c in n)
            zbuf[(cx, cy)] = (pos[2], n, m, parte)
    l = Lienzo()
    for (cx, cy), (z, n, m, parte) in zbuf.items():
        luzv = max(0.0, sum(n[i] * luz[i] for i in range(3)))
        rampa = RAMPAS[m]
        idx = min(len(rampa) - 1, int((0.2 + 0.8 * luzv) * len(rampa)))
        mat = rampa[idx]
        if m == "panel" and (cx * 5 + cy * 3) % 13 == 0:
            mat = "p3"
        l.pon(cx, cy, mat)
    # Contorno por fuera, entre piezas a distinta profundidad (alas por
    # delante del cuerpo) y siempre alrededor de la cápsula, para que se
    # separe del resto a tamaño real.
    for (cx, cy), (z, n, m, parte) in list(zbuf.items()):
        for vx, vy in ((1, 0), (0, 1)):
            w = (cx + vx, cy + vy)
            otra = zbuf.get(w)
            if otra and otra[3] != parte and (abs(otra[0] - z) > 1.2 or 1 in (parte, otra[3])):
                if abs(otra[0] - z) > 1.2:
                    lejos = w if otra[0] > z else (cx, cy)
                else:   # cápsula junto al anillo: la línea, en la cápsula
                    lejos = (cx, cy) if parte == 1 else w
                l.solido[lejos] = "contorno"
    l.contorno()
    return l


# --- La órbita de /luna, fotograma a fotograma --------------------------------
# Misma cuenta que .luna-nave-x / .luna-nave-y en global.css: dos vaivenes
# ease-in-out de T cada tramo (alternate), X de -1 a 1 empezando en el extremo
# izquierdo e Y con -1,5 T de retraso. En 3D es una circunferencia en un plano
# inclinado (sen i = RY / RX): lo de arriba en pantalla queda detrás. La nave
# apunta hacia donde va (el eje, de la punta al motor, es -velocidad) y su giro
# se mide respecto a la normal del plano de la órbita, que no cambia.
RX, RY = 0.62, 0.16
FOTOGRAMAS = 32
GIRO_ORBITA = 45                    # giro de la X respecto al plano de la órbita
CARA_ORBITA = 30


def _ease(u):
    """cubic-bezier(0.42, 0, 0.58, 1) (ease-in-out de CSS): progreso en u."""
    lo, hi = 0.0, 1.0
    for _ in range(40):            # busca el parámetro s con x(s) = u
        m = (lo + hi) / 2
        x = 3 * (1 - m) ** 2 * m * 0.42 + 3 * (1 - m) * m ** 2 * 0.58 + m ** 3
        lo, hi = (m, hi) if x < u else (lo, m)
    m = (lo + hi) / 2
    return 3 * (1 - m) * m ** 2 + m ** 3


def _vaiven(f):
    """Posición -1..1 de una animación alternate en la fracción f de su
    periodo doble (0..1): ida en la primera mitad y vuelta en la segunda."""
    f %= 1.0
    return -1 + 2 * _ease(f * 2) if f < 0.5 else 1 - 2 * _ease(f * 2 - 1)


def pos_orbita(f):
    """Posición 3D en cámara (x der, y abajo, z adentro) en la fracción f de la
    vuelta (0 = extremo izquierdo, como la animación)."""
    sen_i = RY / RX
    nx, ny = _vaiven(f), _vaiven(f + 0.75)     # Y: retraso de -1,5 T = +3/4
    return (nx * RX, ny * RY, -ny * RX * math.sqrt(1 - sen_i ** 2))


def fotograma(k):
    """Vista de la nave en el fotograma k (centrado en su tramo de tiempo)."""
    f = (k + 0.5) / FOTOGRAMAS
    p0, p1 = pos_orbita(f - 0.002), pos_orbita(f + 0.002)
    vel = _norm(tuple(p1[i] - p0[i] for i in range(3)))
    sen_i = RY / RX
    normal = (0, math.sqrt(1 - sen_i ** 2), sen_i)
    eje = tuple(-c for c in vel)
    return orion(eje, GIRO_ORBITA, CARA_ORBITA, esc=ESCALA, ref=normal)


# Sombra de la Luna sobre la Orion en la cara visible (idea del usuario): el
# Sol de esa cara (luz por la derecha, fase 38°, 14° por encima, como
# generar-luna.py --derecha) proyecta la sombra de la Luna hacia la izquierda y
# hacia atrás. La nave entra en ella al llegar al borde izquierdo y sale ya
# tapada por el disco. Radios en tanto por uno del diámetro del disco, como
# pos_orbita(). Sale como animación CSS de brillo (--css).
SOL_VISIBLE = (38, 14)              # fase y altura del Sol en la cara visible
SOMBRA_BRILLO = 0.35                # brillo en plena sombra (luz de la Tierra)
FRANJA = 0.08                       # ancho del paso a la sombra en la línea día/noche
PENUMBRA = (0.70, 0.50)             # de dónde empieza a oscurecer a sombra plena
                                    # (distancia al eje de la sombra). Era
                                    # (0,56, 0,46): el usuario la quiso antes


def sombra(f):
    """0 (al sol) .. 1 (en plena sombra) en la fracción f de la vuelta."""
    fase, alt = (math.radians(g) for g in SOL_VISIBLE)
    sol = (math.sin(fase) * math.cos(alt), -math.sin(alt), -math.cos(fase) * math.cos(alt))
    p = pos_orbita(f)
    d = sum(p[i] * sol[i] for i in range(3))     # < 0: más allá de la Luna vista desde el Sol

    def suave(a, b, x):
        u = min(1.0, max(0.0, (x - a) / (b - a)))
        return u * u * (3 - 2 * u)
    eje = math.sqrt(max(0.0, sum(c * c for c in p) - d * d))
    proyectada = suave(0.1, -0.05, d) * suave(PENUMBRA[0], PENUMBRA[1], eje)
    # Y la franja oscura del disco tal como se ve (pedido del usuario: "que se
    # oscurezca cuando llega a la sombra de la Luna"): a la izquierda de la
    # línea día/noche de la cara visible, x < -cos(fase)·√(R² - y²), también
    # más allá del borde izquierdo, para que no se aclare al salir del disco.
    x, y = p[0], p[1]
    if abs(y) >= 0.5:
        return proyectada
    frontera = -math.cos(fase) * math.sqrt(0.25 - y * y)
    vista = suave(frontera, frontera - FRANJA, x)
    return max(proyectada, vista)


def css_sombra(pasos=64):
    """@keyframes nave-sombra: filter brightness a lo largo de la vuelta."""
    vals = [round(1 - (1 - SOMBRA_BRILLO) * sombra((k / pasos) % 1.0), 3) for k in range(pasos + 1)]
    lineas = []
    for k, b in enumerate(vals):
        # Sin los puntos de en medio de un tramo constante (sí sus extremos).
        if 0 < k < pasos and vals[k - 1] == b == vals[k + 1]:
            continue
        lineas.append(f"  {k / pasos * 100:.2f}% {{ filter: brightness({b}); }}")
    return "@keyframes nave-sombra {\n" + "\n".join(lineas) + "\n}"


def png(celdas, ancho, alto, paleta, ruta):
    """PNG RGBA de 1 px por celda (fondo transparente), sin dependencias."""
    import struct
    import zlib
    filas = bytearray()
    for y in range(alto):
        filas.append(0)
        for x in range(ancho):
            m = celdas.get((x, y))
            if m:
                c = PALETAS[m][paleta]
                filas += bytes((int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), 255))
            else:
                filas += b"\0\0\0\0"

    def trozo(tipo, datos):
        return (struct.pack(">I", len(datos)) + tipo + datos
                + struct.pack(">I", zlib.crc32(tipo + datos) & 0xFFFFFFFF))
    with open(ruta, "wb") as fh:
        fh.write(b"\x89PNG\r\n\x1a\n"
                 + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 6, 0, 0, 0))
                 + trozo(b"IDAT", zlib.compress(bytes(filas), 9))
                 + trozo(b"IEND", b""))


def tira(vistas):
    """Junta las vistas en una tira horizontal (celdas desplazadas W)."""
    t = {}
    for i, l in enumerate(vistas):
        for (x, y), m in l.celdas().items():
            t[(x + i * W, y)] = m
    return t


def svg(celdas, ancho, paleta, nombre):
    r = "".join(
        f'<rect x="{x * 4}" y="{y * 4}" width="4" height="4" fill="{PALETAS[m][paleta]}"/>'
        for (x, y), m in sorted(celdas.items(), key=lambda k: (k[0][1], k[0][0]))
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho * 4} {H * 4}" '
            f'width="{ancho * 4}" height="{H * 4}" shape-rendering="crispEdges" '
            f'role="img" aria-label="{nombre}">{r}</svg>')


def ppm(celdas, ancho, paleta, ruta, z=10, fondo=(40, 40, 48)):
    filas = []
    for y in range(H * z):
        f = bytearray()
        for x in range(ancho * z):
            m = celdas.get((x // z, y // z))
            c = PALETAS[m][paleta] if m else None
            f += bytes(int(c[i:i + 2], 16) for i in (1, 3, 5)) if c else bytes(fondo)
        filas.append(bytes(f))
    with open(ruta, "wb") as fh:
        fh.write(b"P6 %d %d 255\n" % (ancho * z, H * z) + b"".join(filas))


if __name__ == "__main__":
    if "--css" in sys.argv:
        print(css_sombra())
        sys.exit()
    vista = sys.argv[sys.argv.index("--png") + 1] if "--png" in sys.argv else None
    t = tira([fotograma(k) for k in range(FOTOGRAMAS)])
    ancho = W * FOTOGRAMAS
    for paleta, fichero in ((0, "zodk-orion-giro"), (1, "zodk-orion-giro-noche")):
        png(t, ancho, H, paleta, os.path.join(DESTINO, fichero + ".png"))
        if vista:
            ppm(t, ancho, paleta, os.path.join(vista, fichero + ".ppm"), z=3)
    print("Orion:", FOTOGRAMAS, "fotogramas,", len(t), "celdas")
