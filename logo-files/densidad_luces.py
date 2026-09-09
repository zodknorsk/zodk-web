#!/usr/bin/env python3
"""Campo de densidad de luces para el modo noche del planeta.

Acumula la población de ~7.300 localidades (Natural Earth
ne_10m_populated_places, dominio publico) en una rejilla equirectangular y la
cuantiza en 4 niveles (0 = oscuro .. 3 = metrópoli). El generador del planeta lo
usa para repartir luces por los países según densidad, como el logo nocturno.

Descargar los datos a este directorio:
  curl -sSLo pp10.json \\
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson

Uso:  python3 densidad_luces.py     # escribe luces.py
"""
import json
import math
import sys

LW, LH = 720, 360          # rejilla de luces: 0.5 grados
SPREAD = 0.40              # cuánto se derrama cada localidad a las celdas vecinas

acc = [[0.0] * LW for _ in range(LH)]
data = json.load(open("pp10.json"))
for feat in data["features"]:
    pop = feat["properties"].get("pop_max") or 0
    if pop <= 0:
        continue
    lon, lat = feat["geometry"]["coordinates"]
    w = max(0.0, math.log10(pop) - 2.4)          # ~0 para pueblos, ~5 para Tokio
    c = int((lon + 180.0) / 360.0 * LW) % LW
    r = int((90.0 - lat) / 180.0 * LH)
    if not (0 <= r < LH):
        continue
    acc[r][c] += w
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == dc == 0:
                continue
            rr, cc = r + dr, (c + dc) % LW
            if 0 <= rr < LH:
                acc[rr][cc] += w * SPREAD

flat = sorted(v for row in acc for v in row if v > 0)
# umbrales por percentiles de las celdas con algo de luz
def pct(p):
    return flat[min(len(flat) - 1, int(len(flat) * p))]
T1, T2, T3 = pct(0.73), pct(0.91), pct(0.975)
print(f"celdas con luz: {len(flat)}  umbrales: {T1:.2f} {T2:.2f} {T3:.2f}",
      file=sys.stderr)

ROWS = []
for r in range(LH):
    row = acc[r]
    spans, c = [], 0
    while c < LW:
        v = row[c]
        lv = 3 if v >= T3 else 2 if v >= T2 else 1 if v >= T1 else 0
        if lv == 0:
            c += 1
            continue
        start = c
        while c < LW:
            v = row[c]
            cur = 3 if v >= T3 else 2 if v >= T2 else 1 if v >= T1 else 0
            if cur != lv:
                break
            c += 1
        spans.append((start, c - 1, lv))
    ROWS.append(spans)

with open("luces.py", "w") as fh:
    fh.write('"""Densidad de luces (0-3) por celda, de ne_10m_populated_places\n')
    fh.write('(Natural Earth). Rejilla equirectangular, fila 0 = 90N. Regenerar\n')
    fh.write('con densidad_luces.py."""\n')
    fh.write(f"LW = {LW}\nLH = {LH}\nROWS = [\n")
    for row in ROWS:
        fh.write("  " + repr(row) + ",\n")
    fh.write("]\n")
lit = sum(b - a + 1 for row in ROWS for a, b, lv in row)
print(f"escrito luces.py  ({lit} celdas iluminadas de {LW*LH})", file=sys.stderr)
