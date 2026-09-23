#!/usr/bin/env python3
"""Nombres de lugares de Marte para /marte (Proyecto Marte, rama mars-project).

Saca `public/marte/marte-nombres.json` del catálogo oficial de la Unión
Astronómica Internacional (Gazetteer of Planetary Nomenclature, USGS; dominio
público), quedándose con la lista elegida a mano de abajo.

La fuente es el `.dbf` del zip de puntos centrales, que además del nombre trae
el centro, el diámetro en km y la caja de latitud y longitud de cada lugar:

    cd logo-files/marte-fuentes
    curl -LO https://asc-planetarynames-data.s3.us-west-2.amazonaws.com/MARS_nomenclature_center_pts.zip
    unzip MARS_nomenclature_center_pts.zip

Luego, desde logo-files:

    python3 generar-nombres.py

Cada nombre lleva:
  - `clase`: "region" (planicies, tierras, mesetas: rótulo de región, sin
    marco) o "visor" (formas claras: el marco de esquinas).
  - `px`: a partir de cuántos píxeles de pantalla sale. Por defecto 90; los
    lugares pequeños pero interesantes (Gale, Jezero, la caldera del Olympus)
    llevan uno menor, porque con 90 no saldrían ni al zoom máximo.
  - `menor`: va dentro de otro lugar (letra y marco más pequeños).
Las grandes zonas llevan `px` 0: salen en cuanto se empieza a acercar (zoom
1,2, que es también el mínimo para que salga cualquier nombre) y se van cuando
ya no caben en la pantalla. Las zonas medianas (Kasei Valles, Noctis
Labyrinthus…) llevan rótulo pero con umbral, para que no salgan tan pronto.

Los nombres van en latín, que es como están en el catálogo y en los mapas
(decisión del usuario, 22-sep-2026). El castellano, en la ficha.
"""
import array
import json
import math
import struct
import sys
from pathlib import Path

FUENTE = Path(__file__).parent / "marte-fuentes" / "MARS_nomenclature_center_pts.dbf"
SALIDA = Path(__file__).parent.parent / "public" / "marte" / "marte-nombres.json"
# Relieve MOLA de 32 px/grado (el de generar-marte.py; el curl está en su
# docstring): de él sale el marco ceñido de los montes y los cráteres.
MOLA = Path(__file__).parent / "marte-fuentes" / "megt90n000fb.img"
MOLA_PPD = 32

# nombre del catálogo -> (clase, px, menor)
LISTA = {
    # --- Grandes zonas: rótulo de región ---------------------------------
    "Valles Marineris": ("region", 0, False),
    "Amazonis Planitia": ("region", 0, False),
    "Utopia Planitia": ("region", 0, False),
    "Elysium Planitia": ("region", 0, False),
    "Acidalia Planitia": ("region", 0, False),
    "Chryse Planitia": ("region", 0, False),
    "Isidis Planitia": ("region", 0, False),
    "Hellas Planitia": ("region", 0, False),
    "Argyre Planitia": ("region", 0, False),
    "Arabia Terra": ("region", 0, False),
    "Noachis Terra": ("region", 0, False),
    "Terra Sirenum": ("region", 0, False),
    "Terra Cimmeria": ("region", 0, False),
    "Syrtis Major Planum": ("region", 0, False),
    "Meridiani Planum": ("region", 0, False),
    "Planum Boreum": ("region", 0, False),      # el casquete norte; Vastitas
    # Borealis se quitó: su centro es el polo y el rótulo caía en el borde
    "Planum Australe": ("region", 0, False),
    # Zonas medianas: también rótulo (no tienen una forma que enmarcar), pero
    # con umbral, para que salgan más adelante y no a ×1,2 como las grandes.
    "Kasei Valles": ("region", 260, False),
    "Noctis Labyrinthus": ("region", 220, False),
    "Coprates Chasma": ("region", 220, True),     # dentro de Valles Marineris
    "Melas Chasma": ("region", 200, True),
    "Ma'adim Vallis": ("region", 220, False),
    "Nili Fossae": ("region", 200, False),
    # Los sitios de los amartizajes (usuario, 23-sep-2026: cada uno, bueno o
    # fallido, tiene que tener cerca un accidente con nombre). Zonas:
    "Ares Vallis": ("region", 220, False),        # Mars Pathfinder
    "Scandia Colles": ("region", 200, False),     # Phoenix
    "Samara Valles": ("region", 200, False),      # Mars 6
    "Ultimi Scopuli": ("region", 200, False),     # Mars Polar Lander
    "Nanedi Valles": ("region", 200, False),      # Mars 2
    # --- Formas claras: visor --------------------------------------------
    # Hacia x2 (miden 90 px o más)
    "Olympus Mons": ("visor", 90, False),
    "Alba Mons": ("visor", 90, False),
    "Arsia Mons": ("visor", 90, False),
    "Ascraeus Mons": ("visor", 90, False),
    "Pavonis Mons": ("visor", 90, False),
    "Elysium Mons": ("visor", 90, False),
    "Chasma Boreale": ("visor", 90, True),        # dentro del casquete norte
    "Schiaparelli": ("visor", 90, False),
    "Huygens": ("visor", 90, False),
    "Antoniadi": ("visor", 90, False),
    "Cassini": ("visor", 90, False),
    # Hacia x4
    "Herschel": ("visor", 90, False),
    "Newton": ("visor", 90, False),
    "Lyot": ("visor", 90, False),
    "Lowell": ("visor", 90, False),
    "Apollinaris Mons": ("visor", 90, False),
    "Medusae Fossae": ("visor", 90, False),
    "Holden": ("visor", 60, False),
    "Gale": ("visor", 55, False),                 # Curiosity
    "Gusev": ("visor", 55, False),                # Spirit
    # Hacia x6: los detalles que están dentro de otra cosa
    "Olympus Paterae": ("visor", 34, True),       # la caldera del Olympus Mons
    "Aeolis Mons": ("visor", 36, True),           # el monte Sharp, dentro de Gale
    "Hecates Tholus": ("visor", 80, False),
    "Korolev": ("visor", 34, False),              # el cráter lleno de hielo
    "Jezero": ("visor", 20, False),               # Perseverance
    # Los cráteres de los amartizajes (ver arriba), con el umbral bajado para
    # que salgan a x4-x6
    "Ptolemaeus": ("visor", 55, False),           # Mars 3
    "Miyamoto": ("visor", 55, False),             # Schiaparelli
    "Mie": ("visor", 45, False),                  # Viking 2
    "Endeavour": ("visor", 9, True),              # Opportunity (22 km: sale a x6)
}

# Tharsis no está en el catálogo como zona (es un nombre de albedo, un punto
# suelto): su caja va a mano, la de la meseta volcánica.
A_MANO = [{
    "nombre": "Tharsis", "clase": "region", "px": 0, "menor": False,
    "km": 4000, "lat": 5.0, "lon": -105.0, "caja": [-25.0, 35.0, -145.0, -70.0],
    "linea": False,
}]


def dbf(ruta):
    """Filas del .dbf como diccionarios (sin dependencias)."""
    b = ruta.read_bytes()
    n, cabecera, largo = struct.unpack("<xxxxIHH", b[:12])
    campos, p = [], 32
    while b[p] != 0x0D:
        campos.append((b[p:p + 11].split(b"\0")[0].decode(), b[p + 16]))
        p += 32
    filas = []
    for i in range(n):
        r, o, d = b[cabecera + i * largo + 1:cabecera + (i + 1) * largo], 0, {}
        for nombre, ancho in campos:
            d[nombre] = r[o:o + ancho].decode("utf-8", "replace").strip()
            o += ancho
        filas.append(d)
    return filas


# --- El visor ceñido a la geografía (usuario, 22-sep-2026: "para futuros sí
# que quiero que sea ajustado a la geografía"). La caja del catálogo es un
# rectángulo de latitud y longitud que abarca el lugar con holgura (en el
# Olympus Mons sobraba por la derecha). Para los montes se saca del relieve:
# desde el centro, rayos en 36 direcciones, y en cada una el pie, donde la
# ladera baja hasta casi la llanura de alrededor (a un 12 % de la altura
# sobre ella), sin pasar de 1,3 veces su radio (Alba Mons, tan plano, se iba
# lejísimos). La caja nueva abarca esos 36 puntos (sin los que se salen mucho
# de la mediana). Ceñir es estrechar o recolocar, no agrandar: si sale más de
# un 10 % mayor que la del catálogo (Alba Mons, casi plano), se queda esa. Los cráteres y las calderas se quedan con la del catálogo:
# su diámetro ya se mide de borde a borde, y buscar el borde en el relieve
# (probado el 23-sep-2026) lo agrandaba cuando el terreno de fuera es más
# alto. Las fosas y los cañones, también con la del catálogo.
CENIR = {"Mons": "pie", "Tholus": "pie"}
KM_GRADO = math.pi * 3389.5 / 180


def cargar_mola():
    dem = array.array("h")
    dem.frombytes(MOLA.read_bytes())
    if sys.byteorder == "little":
        dem.byteswap()                              # MSB_INTEGER
    return dem


def altura(dem, lat, lon):
    """Altura MOLA (m) en (lat, lon), bilineal. Filas desde 90° N, columnas
    desde 0° E."""
    w, h = 360 * MOLA_PPD, 180 * MOLA_PPD
    y = (90 - lat) * MOLA_PPD - 0.5
    x = (lon % 360) * MOLA_PPD - 0.5
    y0, x0 = math.floor(y), math.floor(x)
    fy, fx = y - y0, x - x0
    def v(yy, xx):
        return dem[min(h - 1, max(0, yy)) * w + (xx % w)]
    return ((v(y0, x0) * (1 - fx) + v(y0, x0 + 1) * fx) * (1 - fy)
            + (v(y0 + 1, x0) * (1 - fx) + v(y0 + 1, x0 + 1) * fx) * fy)


def punto(lat, lon, az, km):
    """El punto a `km` de (lat, lon) hacia el acimut `az` (radianes), en plano
    local (vale para lo que mide un lugar)."""
    dlat = km * math.cos(az) / KM_GRADO
    dlon = km * math.sin(az) / (KM_GRADO * max(0.05, math.cos(math.radians(lat))))
    return lat + dlat, lon + dlon


def ceñir(dem, n, forma):
    r = n["km"] / 2
    paso = max(0.4, r / 120)                        # km entre muestras
    puntos = []
    for i in range(36):
        az = 2 * math.pi * i / 36
        ds = [k * paso for k in range(int(1.3 * r / paso) + 1)]
        hs = [altura(dem, *punto(n["lat"], n["lon"], az, d)) for d in ds]
        if forma == "borde":
            cand = [(hh, d) for hh, d in zip(hs, ds) if 0.5 * r <= d <= 1.4 * r]
            puntos.append(max(cand)[1])
        else:
            cima = max(hh for hh, d in zip(hs, ds) if d <= 0.3 * r)
            base = min(hs)
            corte = base + 0.12 * (cima - base)
            puntos.append(next((d for hh, d in zip(hs, ds) if d >= 0.3 * r and hh <= corte), ds[-1]))
    m = sorted(puntos)[len(puntos) // 2]
    lats, lons = [], []
    for i, d in enumerate(puntos):
        d = max(0.6 * m, min(1.4 * m, d))
        la, lo = punto(n["lat"], n["lon"], 2 * math.pi * i / 36, d)
        lats.append(la)
        lons.append(lo)
    return [round(min(lats), 2), round(max(lats), 2), round(min(lons), 2), round(max(lons), 2)]


def main():
    filas = {r["name"]: r for r in dbf(FUENTE) if r["approval"].startswith("Adopted")}
    fuera = [n for n in LISTA if n not in filas]
    if fuera:
        raise SystemExit(f"No están en el catálogo: {fuera}")
    # Longitud del catálogo: 0..360 al este. Aquí, -180..180.
    def lon(x):
        x = float(x)
        return x - 360 if x > 180 else x

    nombres = list(A_MANO)
    for nombre, (clase, px, menor) in LISTA.items():
        r = filas[nombre]
        o, e = lon(r["min_lon"]), lon(r["max_lon"])
        if e < o:                                  # la caja cruza los 180°
            e += 360
        nombres.append({
            "nombre": nombre, "clase": clase, "px": px, "menor": menor,
            "km": round(float(r["diameter"]), 1),
            "lat": round(float(r["center_lat"]), 2), "lon": round(lon(r["center_lon"]), 2),
            "caja": [round(float(r["min_lat"]), 2), round(float(r["max_lat"]), 2),
                     round(o, 2), round(e, 2)],
            "tipo": r["type"].split(",")[0],
        })
        # Un lugar alargado (un valle, un cañón) lleva el rótulo en una línea;
        # una zona más o menos redonda, en dos, como en los mapas.
        c = nombres[-1]["caja"]
        ancho, alto = (c[3] - c[2]) * 0.94, c[1] - c[0]     # 0,94: el coseno medio
        nombres[-1]["linea"] = max(ancho, alto) / max(1e-6, min(ancho, alto)) >= 1.8
    # El marco de los montes y los cráteres, ceñido al relieve.
    if MOLA.exists():
        dem = cargar_mola()
        for n in nombres:
            forma = CENIR.get(n.get("tipo"))
            if n["clase"] == "visor" and forma:
                nueva = ceñir(dem, n, forma)
                area = lambda c: (c[1] - c[0]) * (c[3] - c[2])
                if area(nueva) <= 1.1 * area(n["caja"]):
                    n["caja"] = nueva
    else:
        print(f"Sin {MOLA.name}: los marcos van con la caja del catálogo.")
    # Los grandes primero: si dos rótulos se pisan en la pantalla, se queda el
    # del lugar más grande.
    nombres.sort(key=lambda n: -n["km"])
    SALIDA.write_text(json.dumps(nombres, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(nombres)} nombres -> {SALIDA}")


if __name__ == "__main__":
    main()
