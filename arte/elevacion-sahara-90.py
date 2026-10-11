#!/usr/bin/env python3
"""Relieve más fino del mapa del Sáhara, para su nivel de 512 px/grado: el
Copernicus DEM GLO-90 (3", ~90 m; ESA, libre con atribución: «Copernicus DEM
© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided
under COPERNICUS by the European Union and ESA»), en toda la caja. Se baja
por piezas de 1° (las de solo mar no existen y se saltan) a
tierra-fuentes/sahara-dem90/ y se junta en un archivo de enteros de 16 bits
(metros, little-endian), fila 0 = el norte:
  tierra-fuentes/sahara1200.i16 (~1,1 GB, fuera de Git) y sahara1200.json
Lo lee generar-sahara.py antes que el de 15" (elevacion-sahara.py) donde lo
cubre.

Uso (desde arte/; necesita Pillow):  python3 elevacion-sahara-90.py
Las piezas ya bajadas no se vuelven a pedir.
"""
import array
import json
import os
import subprocess

from PIL import Image

PPD = 1200
ZONA = (20, 38, -22, -1)               # S, N, O, E (grados enteros): la caja de generar-sahara.py
AQUI = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(AQUI, "tierra-fuentes", "sahara-dem90")
SALIDA = os.path.join(AQUI, "tierra-fuentes", "sahara1200.i16")
URL = "https://copernicus-dem-90m.s3.amazonaws.com/{n}/{n}.tif"


def nombre(lat, lon):
    return (f"Copernicus_DSM_COG_30_{'N' if lat >= 0 else 'S'}{abs(lat):02d}_00_"
            f"{'E' if lon >= 0 else 'W'}{abs(lon):03d}_00_DEM")


def main():
    os.makedirs(DIR, exist_ok=True)
    S, N, O, E = ZONA
    W, H = (E - O) * PPD, (N - S) * PPD
    out = array.array("h", [0]) * (W * H)            # el mar (sin pieza), a 0
    piezas = 0
    for lat in range(S, N):
        for lon in range(O, E):
            n = nombre(lat, lon)
            ruta = os.path.join(DIR, f"{n}.tif")
            if not os.path.exists(ruta) and not os.path.exists(ruta + ".no"):
                r = subprocess.run(["curl", "-sSfo", ruta, URL.format(n=n)], capture_output=True)
                if r.returncode:
                    open(ruta + ".no", "w").close()   # no existe: solo mar
                    continue
                print("bajada", n)
            if not os.path.exists(ruta):
                continue
            im = Image.open(ruta)
            assert im.size == (PPD, PPD), (n, im.size)
            datos = list(im.getdata())
            fila0, col0 = (N - 1 - lat) * PPD, (lon - O) * PPD
            for r in range(PPD):
                base = (fila0 + r) * W + col0
                out[base:base + PPD] = array.array("h", (max(-32768, min(32767, round(v))) for v in datos[r * PPD:(r + 1) * PPD]))
            piezas += 1
    if os.sys.byteorder != "little":
        out.byteswap()
    with open(SALIDA, "wb") as fh:
        out.tofile(fh)
    with open(os.path.splitext(SALIDA)[0] + ".json", "w") as fh:
        json.dump({"ppd": PPD, "zona": ZONA, "ancho": W, "alto": H}, fh)
    print(f"{SALIDA}: {W} x {H}, {piezas} piezas")


if __name__ == "__main__":
    main()
