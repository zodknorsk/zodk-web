#!/usr/bin/env python3
"""Relieve fino de la Tierra (Proyecto Tierra, niveles de zoom): ETOPO1 (NOAA,
dominio público) a 24 px/grado, de los 72 trozos de 30° x 30° bajados a
tierra-fuentes/etopo24/, en un solo archivo de enteros de 16 bits (metros,
little-endian), 8640 x 4320, fila 0 = 90° N:
  tierra-fuentes/etopo24.i16  (~75 MB, fuera de Git)
Lo lee generar-tierra.py con --nivel (el relieve de las teselas).

Bajar los trozos (desde arte/tierra-fuentes/etopo24/):
  for lat0 in -90 -60 -30 0 30 60; do for lon0 in -180 -150 ... 150; do
    curl -o t_${lat0}_${lon0}.tiff "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/ETOPO1_ice_surface/ImageServer/exportImage?bbox=${lon0},${lat0},$((lon0+30)),$((lat0+30))&bboxSR=4326&imageSR=4326&size=720,720&format=tiff&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image"
  done; done
Uso:  python3 elevacion-fina.py
"""
import array
import os
import sys

from elevacion import read_tiff_f32

PPD = 24
W, H = 360 * PPD, 180 * PPD
T = 30 * PPD                                   # lado de cada trozo
AQUI = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(AQUI, "tierra-fuentes", "etopo24")
SALIDA = os.path.join(AQUI, "tierra-fuentes", "etopo24.i16")


def main():
    out = array.array("h", [0]) * (W * H)
    for lat0 in range(-90, 90, 30):
        for lon0 in range(-180, 180, 30):
            w, h, g = read_tiff_f32(os.path.join(DIR, f"t_{lat0}_{lon0}.tiff"))
            if (w, h) != (T, T):
                sys.exit(f"t_{lat0}_{lon0}.tiff: {w} x {h}, se esperaba {T} x {T}")
            r0 = (90 - (lat0 + 30)) * PPD          # fila de arriba del trozo
            c0 = (lon0 + 180) * PPD
            for r in range(T):
                fila = g[r * T:(r + 1) * T]
                out[(r0 + r) * W + c0:(r0 + r) * W + c0 + T] = array.array(
                    "h", (int(max(-11000, min(9000, round(v)))) for v in fila))
        print(f"  latitudes {lat0}..{lat0 + 30} hechas", file=sys.stderr)
    if sys.byteorder != "little":
        out.byteswap()
    with open(SALIDA, "wb") as fh:
        fh.write(out.tobytes())
    print(f"escrito {SALIDA}: {W} x {H}")


if __name__ == "__main__":
    main()
