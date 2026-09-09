#!/usr/bin/env python3
"""Baldosa de estrellas para el fondo del hero (public/zodk-estrellas.png).

Un PNG pequeño, transparente y tileable: la web lo repite con
`background-repeat` en vez de apilar ~50 gradientes radiales en el CSS. Pintar
una baldosa repetida es mucho más barato para el navegador.

    python3 generar-estrellas.py
"""
import random
from png8 import write_indexed

W = H = 320
SEED = 7                     # fijo: la baldosa siempre sale igual
N = 6                        # estrellas por baldosa (~60 en pantalla completa)

# 0 = transparente. Blancas y un par de tonos fríos, como en el CSS anterior.
PAL = [(0, 0, 0, 0), (0xff, 0xff, 0xff, 255),
       (0xd7, 0xde, 0xe8, 255), (0xaa, 0xb4, 0xc2, 255)]

rows = [bytearray(W) for _ in range(H)]
rnd = random.Random(SEED)
for _ in range(N):
    x = rnd.randint(2, W - 3)
    y = rnd.randint(2, H - 3)
    col = rnd.choices([1, 2, 3], weights=[6, 2, 2])[0]
    big = rnd.random() < 0.35            # unas pocas de 2x2
    for dx in range(2 if big else 1):
        for dy in range(2 if big else 1):
            rows[y + dy][x + dx] = col

write_indexed("zodk-estrellas.png", W, H, rows, PAL)
print(f"zodk-estrellas.png  {W}x{H}, {N} estrellas/baldosa")
