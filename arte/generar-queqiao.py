"""Pixel art de los relés Queqiao y Queqiao-2 para la cara oculta de /luna.

Genera public/luna/zodk-sat-queqiao-noche.svg y zodk-sat-queqiao2-noche.svg:
rejilla de 56x36 celdas de 4 px (viewBox 224x144, como antes), un <rect> por
celda, con la paleta de noche del Sentinel-2 de la portada. Solo hay versión
noche: la cara oculta no cambia con el tema.

Referencias: los renders de Wikipedia de cada uno. Lo que los
distingue:
  - Queqiao (2018): caja de lámina dorada, plato GRIS enorme de malla con
    varillas delante, un ala solar corta y antenas largas y finas en diagonal.
  - Queqiao-2 (2024): cuerpo AZUL, plato DORADO encima con el trípode de la
    antena, alas largas de tres paneles a cada lado y una antenita verde.

Uso:  python3 generar-queqiao.py [--png DIR]   (--png: vista ampliada x10)
"""
import math
import os
import sys

W, H = 56, 36
AQUI = os.path.dirname(os.path.abspath(__file__))
DESTINO = os.path.join(AQUI, "..", "public", "luna")

CONTORNO = "#050a12"
# Paleta de noche del Sentinel-2 (zodk-sat-sentinel-noche.svg) + grises.
ORO = ["#2f2716", "#3a3120", "#544629", "#6a5837", "#877655", "#a3916a"]
PANEL = ["#0a1020", "#181f3a", "#303a66", "#6b789e"]
GRIS = ["#33363c", "#565a63", "#767b86", "#9aa0ab", "#c3c8cf"]
AZUL = ["#15283a", "#1f3b52", "#2c5570", "#3f7190", "#6594ad"]
VERDE = ["#2f4f27", "#4d7a3c", "#6d9b52"]
# Plato del Queqiao-2: dorado más vivo que la lámina (en el render es amarillo).
DORADO = ["#5e4a1f", "#7d6428", "#a38536", "#c4a24a", "#dcc070"]


class Lienzo:
    def __init__(self):
        self.solido = {}   # celdas que llevan contorno
        self.fino = {}     # antenas y varillas: encima y sin contorno

    def pon(self, x, y, c, fino=False):
        if 0 <= x < W and 0 <= y < H:
            (self.fino if fino else self.solido)[(x, y)] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.pon(x, y, c)

    def elipse(self, cx, cy, rx, ry, color_de):
        """Rellena la elipse; color_de(dx, dy, r) da el color de cada celda
        (dx, dy relativos al centro, r = radio normalizado 0..1)."""
        for y in range(math.floor(cy - ry), math.ceil(cy + ry) + 1):
            for x in range(math.floor(cx - rx), math.ceil(cx + rx) + 1):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                r = math.hypot(dx / rx, dy / ry)
                if r <= 1:
                    c = color_de(dx, dy, r)
                    if c:
                        self.pon(x, y, c)

    def linea(self, x0, y0, x1, y1, c, fino=True):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            t = i / n if n else 0
            self.pon(round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t), c, fino)

    def contorno(self):
        for (x, y) in list(self.solido):
            for vx, vy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v = (x + vx, y + vy)
                if v not in self.solido and 0 <= v[0] < W and 0 <= v[1] < H:
                    self.fino.setdefault(v, None)
                    if self.fino[v] is None:
                        self.fino[v] = CONTORNO
        # El contorno no debe pisar antenas ya dibujadas: se pintan después.

    def celdas(self):
        todo = dict(self.solido)
        todo.update({k: v for k, v in self.fino.items() if v})
        return todo


def panel_solar(l, x0, y0, ancho, alto):
    """Un panel: marco oscuro y celdas en damero con algún brillo."""
    l.rect(x0, y0, x0 + ancho - 1, y0 + alto - 1, PANEL[0])
    for y in range(y0 + 1, y0 + alto - 1):
        for x in range(x0 + 1, x0 + ancho - 1):
            c = PANEL[2] if (x + y) % 2 else PANEL[1]
            if (x * 7 + y * 3) % 11 == 0:
                c = PANEL[3]
            l.pon(x, y, c)


def queqiao():
    l = Lienzo()
    # Ala solar corta a la derecha, detrás: dos paneles unidos por un brazo.
    l.rect(40, 19, 42, 19, GRIS[1])
    panel_solar(l, 43, 15, 6, 10)
    l.rect(49, 19, 49, 19, GRIS[1])
    panel_solar(l, 50, 15, 6, 10)
    # Caja de lámina dorada, en 3/4: frente con franjas y lateral más oscuro.
    for y in range(6, 20):
        for x in range(28, 40):
            banda = ORO[4] if (y // 2) % 2 else ORO[3]
            if x >= 36:
                banda = ORO[2] if (y // 2) % 2 else ORO[1]
            if y == 6:
                banda = ORO[5] if x < 36 else ORO[3]
            l.pon(x, y, banda)
    # Plato gris de malla, grande, delante y a la izquierda. Varillas claras en
    # abanico desde el centro, malla más clara arriba a la izquierda (luz).
    cx, cy, rx, ry = 17.5, 19.5, 16.5, 15.5
    def malla(dx, dy, r):
        if r > 0.93:
            return GRIS[3]                      # borde
        luz = -(dx + dy) / (rx + ry)            # arriba-izquierda = claro
        if luz > 0.25:
            return GRIS[2]
        if luz < -0.35:
            return GRIS[0]
        return GRIS[1]
    l.elipse(cx, cy, rx, ry, malla)
    # Varillas: 12 radios del buje al borde.
    for i in range(12):
        a = i * math.pi / 6 + 0.26
        l.linea(round(cx - 0.5), round(cy - 0.5),
                round(cx - 0.5 + math.cos(a) * rx * 0.9), round(cy - 0.5 + math.sin(a) * ry * 0.9),
                GRIS[3], fino=False)
    # Buje del plato.
    l.elipse(cx, cy, 2.6, 2.6, lambda dx, dy, r: GRIS[3] if r > 0.6 else GRIS[4])
    l.contorno()
    # Antenas largas y finas, encima y sin contorno.
    l.linea(38, 6, 55, 0, GRIS[2])
    l.linea(31, 6, 25, 0, GRIS[2])
    l.linea(4, 29, 0, 33, GRIS[2])
    l.linea(12, 34, 9, 35, GRIS[2])
    return l


def queqiao2():
    l = Lienzo()
    # Alas largas: tres paneles a cada lado, unidos por un brazo al cuerpo.
    for i in range(3):
        panel_solar(l, 0 + i * 6, 21, 5, 7)
        panel_solar(l, 39 + i * 6, 21, 5, 7)
    for x in (5, 11, 17, 18, 19):
        l.pon(x, 24, GRIS[1])
    for x in (36, 37, 38, 44, 50):
        l.pon(x, 24, GRIS[1])
    # Cuerpo azul en 3/4: frente y lateral más oscuro.
    for y in range(17, 32):
        for x in range(20, 36):
            c = AZUL[3] if x < 31 else AZUL[1]
            if y == 17:
                c = AZUL[4] if x < 31 else AZUL[2]
            elif x == 20 or (x < 31 and y == 31):
                c = AZUL[2]
            l.pon(x, y, c)
    # Detalles del cuerpo: caja clara, parche amarillo, puntitos rojos.
    l.rect(26, 20, 29, 23, GRIS[3])
    l.rect(27, 21, 28, 22, GRIS[4])
    l.rect(22, 26, 24, 26, ORO[5])
    l.pon(25, 28, "#8a3a3a")
    # Antenita verde abajo a la derecha.
    l.elipse(36.5, 30.5, 2.6, 2.6, lambda dx, dy, r: VERDE[2] if dx + dy < -0.8 else VERDE[1] if r < 0.8 else VERDE[0])
    # Plato dorado encima: primero la panza (más oscura), luego el interior
    # visto desde arriba, con nervios.
    l.elipse(28, 12, 15, 5.5, lambda dx, dy, r: DORADO[1] if dy > 0 else None)
    def interior(dx, dy, r):
        if r > 0.9:
            return DORADO[4]                     # borde
        return DORADO[3] if dx - dy * 2 < 4 else DORADO[2]
    l.elipse(28, 9.5, 17, 6, interior)
    # Nervios: radios del centro hacia el borde, en perspectiva.
    for i in range(10):
        a = i * math.pi / 5 + 0.3
        l.linea(28, 9, round(28 + math.cos(a) * 14), round(9 + math.sin(a) * 4.6),
                DORADO[1], fino=False)
    # Mástil entre cuerpo y plato.
    l.rect(27, 15, 28, 16, GRIS[1])
    l.contorno()
    # Trípode de la antena, encima del plato, y el alimentador arriba.
    l.linea(19, 8, 27, 1, GRIS[2])
    l.linea(37, 8, 29, 1, GRIS[2])
    l.linea(28, 10, 28, 2, GRIS[2])
    l.rect(27, 0, 29, 1, GRIS[3])
    for (x, y) in ((27, 0), (28, 0), (29, 0), (27, 1), (28, 1), (29, 1)):
        l.fino[(x, y)] = GRIS[3]
    return l


def svg(l, nombre):
    r = "".join(
        f'<rect x="{x * 4}" y="{y * 4}" width="4" height="4" fill="{c}"/>'
        for (x, y), c in sorted(l.celdas().items(), key=lambda k: (k[0][1], k[0][0]))
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W * 4} {H * 4}" '
            f'width="{W * 4}" height="{H * 4}" shape-rendering="crispEdges" '
            f'role="img" aria-label="{nombre}">{r}</svg>')


def ppm(l, ruta, z=10, fondo=(40, 40, 48)):
    cel = l.celdas()
    filas = []
    for y in range(H * z):
        f = bytearray()
        for x in range(W * z):
            c = cel.get((x // z, y // z))
            f += bytes(int(c[i:i + 2], 16) for i in (1, 3, 5)) if c else bytes(fondo)
        filas.append(bytes(f))
    with open(ruta, "wb") as fh:
        fh.write(b"P6 %d %d 255\n" % (W * z, H * z) + b"".join(filas))


if __name__ == "__main__":
    png = sys.argv[sys.argv.index("--png") + 1] if "--png" in sys.argv else None
    for nombre, fichero, fn in (("Queqiao", "zodk-sat-queqiao-noche", queqiao),
                                ("Queqiao-2", "zodk-sat-queqiao2-noche", queqiao2)):
        l = fn()
        with open(os.path.join(DESTINO, fichero + ".svg"), "w") as fh:
            fh.write(svg(l, nombre))
        if png:
            ppm(l, os.path.join(png, fichero + ".ppm"))
        print(fichero, len(l.celdas()), "celdas")
