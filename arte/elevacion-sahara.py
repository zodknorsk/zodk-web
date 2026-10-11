#!/usr/bin/env python3
"""Relieve fino del mapa del Sáhara: el mosaico global de NOAA
(DEM_global_mosaic, dominio público; ETOPO 2022 y modelos más finos donde
los hay) a 240 px/grado (15", ~460 m), solo en la caja del mapa con su
margen. Se baja por trozos de TROZO grados a tierra-fuentes/sahara-dem/ y
se junta en un archivo de enteros de 16 bits (metros, little-endian), fila 0
= el norte:
  tierra-fuentes/sahara240.i16 (~270 MB, fuera de Git) y sahara240.json
  (la zona). Lo lee generar-sahara.py; sin él, usa ETOPO1 (etopo24.i16).

Uso (desde arte/; necesita Pillow):  python3 elevacion-sahara.py
Los trozos ya bajados no se vuelven a pedir.
"""
import array
import json
import os
import subprocess

from PIL import Image

PPD = 240
ZONA = (17.0, 41.0, -28.0, 2.0)        # S, N, O, E: la caja de generar-sahara.py con su margen
TROZO = 6                              # grados por lado de cada trozo
AQUI = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(AQUI, "tierra-fuentes", "sahara-dem")
SALIDA = os.path.join(AQUI, "tierra-fuentes", "sahara240.i16")
URL = ("https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_global_mosaic/ImageServer/"
       "exportImage?bbox={o},{s},{e},{n}&bboxSR=4326&imageSR=4326&size={t},{t}&format=tiff"
       "&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image")


def main():
    os.makedirs(DIR, exist_ok=True)
    S, N, O, E = ZONA
    t = TROZO * PPD
    W, H = round((E - O) * PPD), round((N - S) * PPD)
    out = array.array("h", [0]) * (W * H)
    for i, n in enumerate(range(int(N), int(S), -TROZO)):
        for j, o in enumerate(range(int(O), int(E), TROZO)):
            ruta = os.path.join(DIR, f"t_{n - TROZO}_{o}.tiff")
            if not os.path.exists(ruta):
                print("bajando", os.path.basename(ruta))
                subprocess.run(["curl", "-sSfo", ruta, URL.format(o=o, s=n - TROZO, e=o + TROZO, n=n, t=t)],
                               check=True)
            im = Image.open(ruta)
            assert im.size == (t, t), (ruta, im.size)
            datos = list(im.getdata())
            for r in range(t):
                base = (i * t + r) * W + j * t
                out[base:base + t] = array.array("h", (round(v) for v in datos[r * t:(r + 1) * t]))
    if os.sys.byteorder != "little":
        out.byteswap()
    with open(SALIDA, "wb") as fh:
        out.tofile(fh)
    with open(os.path.splitext(SALIDA)[0] + ".json", "w") as fh:
        json.dump({"ppd": PPD, "zona": ZONA, "ancho": W, "alto": H}, fh)
    print(f"{SALIDA}: {W} x {H}")


if __name__ == "__main__":
    main()
