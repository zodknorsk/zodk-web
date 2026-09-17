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

# Baldosa extra SOLO de noche (encima de la de siempre): bastantes más
# estrellas (pedido del usuario), casi todas tenues, algunas blancas, pocas de
# 2x2 y alguna con tinte cálido o azulado. Más grande (480) para que no se
# note la repetición.
WN = HN = 480
NN = 170                     # 60 se quedaba corto, 95 también ("sube más la cantidad")
PAL_N = [(0, 0, 0, 0), (0xff, 0xff, 0xff, 255), (0xc4, 0xcc, 0xda, 255),
         (0x8a, 0x94, 0xa8, 255), (0x5e, 0x68, 0x7c, 255),
         (0xff, 0xe6, 0xb4, 255), (0xb8, 0xcf, 0xff, 255)]
rows = [bytearray(WN) for _ in range(HN)]
rnd = random.Random(SEED + 1)
for _ in range(NN):
    x = rnd.randint(2, WN - 3)
    y = rnd.randint(2, HN - 3)
    col = rnd.choices([1, 2, 3, 4, 5, 6], weights=[3, 5, 9, 7, 1, 1])[0]
    big = col in (1, 2) and rnd.random() < 0.3
    for dx in range(2 if big else 1):
        for dy in range(2 if big else 1):
            rows[y + dy][x + dx] = col

write_indexed("zodk-estrellas-noche.png", WN, HN, rows, PAL_N)
print(f"zodk-estrellas-noche.png  {WN}x{HN}, {NN} estrellas/baldosa")
