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
import json
import struct
from pathlib import Path

FUENTE = Path(__file__).parent / "marte-fuentes" / "MARS_nomenclature_center_pts.dbf"
SALIDA = Path(__file__).parent.parent / "public" / "marte" / "marte-nombres.json"

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
    # Los grandes primero: si dos rótulos se pisan en la pantalla, se queda el
    # del lugar más grande.
    nombres.sort(key=lambda n: -n["km"])
    SALIDA.write_text(json.dumps(nombres, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(nombres)} nombres -> {SALIDA}")


if __name__ == "__main__":
    main()
