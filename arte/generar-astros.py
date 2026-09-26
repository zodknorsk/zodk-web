#!/usr/bin/env python3
"""Sol y luna de la portada, en pixel art (arriba a la izquierda, en el mismo
sitio de día y de noche; el planeta pasa por delante).

  public/zodk-sol.png          el sol (56x56 de arte)
  public/zodk-luna-fases.png   la luna en FASES fases del mes, en fila
                               (fase i = edad i/FASES del mes sinódico: 0 luna
                               nueva, FASES/2 llena). La web elige la de hoy.

Se guardan a 1 px de arte = 1 px de imagen; el CSS los escala x3 (x2 en móvil)
con image-rendering: pixelated, como el planeta.

    python3 generar-astros.py
"""
import math
import os
import random

from PIL import Image

N = 56                     # lienzo de cada astro, en px de arte
FASES = 30
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")


def hexc(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def sol(r=8):
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    px = im.load()
    c = N / 2
    for y in range(N):
        for x in range(N):
            d = math.hypot(x + 0.5 - c, y + 0.5 - c)
            if d <= r:
                f = d / r
                px[x, y] = hexc("#fffdf2" if f < 0.5 else "#fff1b8" if f < 0.8 else "#ffd35e")
            elif d <= r + 2:                     # halo fino en tres escalones
                px[x, y] = hexc("#ffd76a", 120)
            elif d <= r + 5:
                px[x, y] = hexc("#ffcf5a", 52)
            elif d <= r + 9:
                px[x, y] = hexc("#ffc84a", 20)
    return im


def luna(ilum, creciente, r=16, seed=3):
    """`ilum` 0..1 fracción iluminada; creciente = iluminada por la derecha.
    La parte en sombra con luz cenicienta (el disco apenas se intuye)."""
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    px = im.load()
    c = N / 2
    rnd = random.Random(seed)
    mares = [(rnd.uniform(-0.6, 0.5), rnd.uniform(-0.6, 0.5), rnd.uniform(0.18, 0.34)) for _ in range(6)]
    crateres = [(rnd.uniform(-0.8, 0.8), rnd.uniform(-0.8, 0.8), rnd.uniform(0.05, 0.11)) for _ in range(14)]
    ah = 0.45 + 0.55 * ilum                       # el halo crece con la fase
    for y in range(N):
        for x in range(N):
            dx, dy = x + 0.5 - c, y + 0.5 - c
            d = math.hypot(dx, dy)
            if d > r:
                if d <= r + 2:
                    px[x, y] = hexc("#a9c8ff", int(70 * ah))
                elif d <= r + 5:
                    px[x, y] = hexc("#a9c8ff", int(32 * ah))
                elif d <= r + 9:
                    px[x, y] = hexc("#a9c8ff", int(13 * ah))
                continue
            ux, uy = dx / r, dy / r
            col = "#e2e6ee"
            if any(math.hypot(ux - mx, uy - my) < mr for mx, my, mr in mares):
                col = "#b8c0cf"
            for kx, ky, kr in crateres:
                dd = math.hypot(ux - kx, uy - ky)
                if dd < kr:
                    col = "#9aa3b5" if (ux - kx) + (uy - ky) < -kr * 0.3 else "#f4f6fa" if dd > kr * 0.7 else "#c9cfda"
                    break
            if d > r - 1.5:
                col = "#aeb6c6"
            nx = dx / math.sqrt(max(1e-6, r * r - dy * dy))    # -1..1 sobre la esfera
            lit = nx > 1 - 2 * ilum if creciente else nx < -1 + 2 * ilum
            k = hexc(col)
            if not lit:
                k = (int(k[0] * 0.20) + 14, int(k[1] * 0.22) + 18, int(k[2] * 0.26) + 28, 255)
            px[x, y] = k
    return im


if __name__ == "__main__":
    sol().save(os.path.join(PUB, "zodk-sol.png"), optimize=True)
    tira = Image.new("RGBA", (N * FASES, N), (0, 0, 0, 0))
    for i in range(FASES):
        ilum = (1 - math.cos(2 * math.pi * i / FASES)) / 2
        tira.alpha_composite(luna(ilum, i < FASES / 2), (i * N, 0))
    tira.save(os.path.join(PUB, "zodk-luna-fases.png"), optimize=True)
    print(f"zodk-sol.png {N}x{N}, zodk-luna-fases.png {N * FASES}x{N} ({FASES} fases)")
