#!/usr/bin/env python3
"""Versión de noche de las fotos de las naves del hero (public/zodk-<id>.png ->
public/zodk-<id>-noche.png), a la luz de la luna como el planeta: cada color se
desatura un poco, se tiñe de luz fría y se oscurece (misma idea que noche() en
generar-planeta-hero.py, algo más suave para que la nave se lea sobre el
planeta oscuro). El alfa NO se toca: la sombra y los bordes quedan tal cual.
Las zonas que dan luz propia (postquemadores del SR-71) se dejan como están.

Las luces de posición no van aquí: son puntos encima de la nave (CSS), con
tamaño fijo en pantalla, porque las fotos se ven muy reducidas (una de 857 px
se muestra a ~210 px) y un punto dibujado en la foto quedaría de menos de 1 px.
Sus posiciones están en src/data/aeronaves.ts (campo `luces`).

    python3 generar-naves-noche.py
"""
import os

from PIL import Image

NAVES = ["dron", "rq4", "mq9", "e2-hawkeye", "u2", "sr71", "shahed136"]
# Elegido con pruebas sobre el planeta de noche: más oscuro, las naves grises
# se camuflaban contra el mar azul y casi desaparecían.
TINTE = (0.60, 0.72, 1.0)          # luz de luna
SAT = 0.80                          # saturación que conserva cada color
BRILLO = 0.92                       # brillo respecto al día
# Zonas con luz propia, en fracciones de la imagen (x0, y0, x1, y1): no se
# oscurecen.
EMISIVO = {
    "sr71": [(0.84, 0.22, 1.0, 0.36), (0.84, 0.64, 1.0, 0.78)],
}

PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")


def noche(r, g, b, sat=SAT, brillo=BRILLO, tinte=TINTE):
    y = 0.299 * r + 0.587 * g + 0.114 * b
    return tuple(max(0, min(255, round((y + (c - y) * sat) * t * brillo)))
                 for c, t in zip((r, g, b), tinte))


def procesa(nid, **kw):
    im = Image.open(os.path.join(PUB, f"zodk-{nid}.png")).convert("RGBA")
    w, h = im.size
    px = im.load()
    cajas = [(x0 * w, y0 * h, x1 * w, y1 * h) for x0, y0, x1, y1 in EMISIVO.get(nid, [])]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0 or any(x0 <= x < x1 and y0 <= y < y1 for x0, y0, x1, y1 in cajas):
                continue
            px[x, y] = noche(r, g, b, **kw) + (a,)
    return im


if __name__ == "__main__":
    for nid in NAVES:
        procesa(nid).save(os.path.join(PUB, f"zodk-{nid}-noche.png"), optimize=True)
        print("->", f"zodk-{nid}-noche.png")
