#!/usr/bin/env python3
"""Rasteriza ne_50m_land.geojson a una rejilla equirectangular tierra/mar/hielo
y la vuelca como modulo Python (RLE por fila) para el generador del planeta.

Datos de origen (Natural Earth, dominio publico). Descargar a este directorio:
  curl -sSLo ne_land.json \\
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson

Uso:  python3 rasterizar.py     # escribe mapa_tierra.py
Solo hace falta si cambias la resolucion o los umbrales de hielo; para el
planeta basta con mapa_tierra.py, que ya esta generado.
"""
import json, math, sys, time

GRID_W = 1440           # columnas: 0.25 grados
GRID_H = 720            # filas
ICE_WATER_LAT = 82.0    # mar por encima de esta latitud -> hielo
ICE_LAND_LAT  = 75.0    # tierra por encima de esta latitud -> hielo
# Groenlandia como hielo (su silueta girando anima el polo). Solo de 70N hacia
# arriba: el sur y las costas quedan verdes/tundra, el casquete no come tanto.
GREENLAND = (70.0, 84.0, -70.0, -15.0)

t0 = time.time()
data = json.load(open("ne_land.json"))

def rings(geom):
    if geom["type"] == "Polygon":
        yield geom["coordinates"]
    else:
        for poly in geom["coordinates"]:
            yield poly

# Tabla de aristas: por cada fila entera y, lista de x de cruce (en celdas).
crossings = [[] for _ in range(GRID_H)]
edge_count = 0
for feat in data["features"]:
    for poly in rings(feat["geometry"]):
        for ring in poly:
            n = len(ring)
            for i in range(n):
                lon1, lat1 = ring[i]
                lon2, lat2 = ring[(i + 1) % n]
                if lat1 == lat2:
                    continue
                if abs(lon1 - lon2) > 180.0:
                    continue                      # arista que cruza el antimeridiano
                # a coordenadas de celda
                y1 = (90.0 - lat1) / 180.0 * GRID_H
                y2 = (90.0 - lat2) / 180.0 * GRID_H
                x1 = (lon1 + 180.0) / 360.0 * GRID_W
                x2 = (lon2 + 180.0) / 360.0 * GRID_W
                if y1 > y2:
                    y1, y2, x1, x2 = y2, y1, x2, x1
                lo = max(0, int(math.floor(y1)))
                hi = min(GRID_H - 1, int(math.ceil(y2)))
                for r in range(lo, hi + 1):
                    yc = r + 0.5
                    if y1 <= yc < y2:
                        crossings[r].append(x1 + (x2 - x1) * (yc - y1) / (y2 - y1))
                edge_count += 1

print(f"aristas: {edge_count}  ({time.time()-t0:.1f}s)", file=sys.stderr)

def kind(r, c, is_land):
    lat = 90.0 - (r + 0.5) / GRID_H * 180.0
    lon = -180.0 + (c + 0.5) / GRID_W * 360.0
    la0, la1, lo0, lo1 = GREENLAND
    if is_land and (lat >= ICE_LAND_LAT or (la0 <= lat <= la1 and lo0 <= lon <= lo1)):
        return "i"
    if not is_land and lat >= ICE_WATER_LAT:
        return "i"
    return "l" if is_land else "o"

ROWS = []
for r in range(GRID_H):
    xs = sorted(crossings[r])
    land = [False] * GRID_W
    for i in range(0, len(xs) - 1, 2):
        a = max(0, int(xs[i] + 0.5))
        b = min(GRID_W, int(xs[i + 1] + 0.5))
        for c in range(a, b):
            land[c] = True
    # RLE de todo lo que no sea oceano abierto
    spans, c = [], 0
    while c < GRID_W:
        k = kind(r, c, land[c])
        if k == "o":
            c += 1
            continue
        start = c
        while c < GRID_W and kind(r, c, land[c]) == k:
            c += 1
        spans.append((start, c - 1, k))
    ROWS.append(spans)

land_cells = sum((b - a + 1) for row in ROWS for a, b, k in row)
print(f"filas: {len(ROWS)}  celdas no-oceano: {land_cells}  ({time.time()-t0:.1f}s)",
      file=sys.stderr)

with open("mapa_tierra.py", "w") as fh:
    fh.write('"""Mascara tierra/mar/hielo generada de ne_50m_land.geojson (Natural Earth,\n')
    fh.write('dominio publico). Rejilla equirectangular, fila 0 = 90N. No editar a mano:\n')
    fh.write('regenerar con rasterizar.py."""\n')
    fh.write(f"GRID_W = {GRID_W}\nGRID_H = {GRID_H}\n")
    fh.write("ROWS = [\n")
    for row in ROWS:
        fh.write("  " + repr(row) + ",\n")
    fh.write("]\n")
print("escrito mapa_tierra.py", file=sys.stderr)
