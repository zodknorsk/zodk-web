"""Capas por fecha del mapa del Sáhara (/sahara): líneas que salen o se van
según el hito del deslizador.

  python3 generar-capas-sahara.py      → public/sahara/sahara-capas.json

Cada capa: `id`, `nombre`, `estilo` (cómo la pinta sahara-mapa.js), `desde` y
`hasta` (fechas AAAA-MM-DD, comparadas con el `orden` del hito; `hasta`
null = sigue) y `lineas` (listas de [lat, lon]).

- El muro: de Natural Earth 1:10m, que lo dibuja como frontera entre
  Marruecos y el Sáhara Occidental (el tramo compartido de los dos
  polígonos, sin el del paralelo 27°40'). Entero desde 1980; las fases de
  1980-87, más adelante.
- El reparto de 1976 con Mauritania: el convenio de Rabat del 14-abr-1976
  (ONU, Treaty Series n.º 15406), «una línea recta desde el punto en que la
  costa atlántica corta el paralelo 24 N hasta el cruce del paralelo 23 N
  con el meridiano 13 O». La costa, de Natural Earth. Hasta el 5-ago-1979,
  cuando Mauritania renuncia.
- La cinta de Bucraa: 100 km casi rectos de la mina a El Marsa (25 km al
  suroeste de El Aaiún) y el cargadero de 3 km mar adentro. APROXIMADA: en
  línea recta entre los extremos.
"""

import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "public", "sahara", "sahara-capas.json")

with open(os.path.join(AQUI, "tierra-fuentes", "ne_10m_admin_0_countries.geojson")) as fh:
    PAISES = {f["properties"]["ADM0_A3"]: f["geometry"] for f in json.load(fh)["features"]}


def anillos(g):
    return [p[0] for p in ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"])]


def clave(p):
    return (round(p[0], 6), round(p[1], 6))


def muro():
    """El tramo del Sáhara de Natural Earth que comparte con Marruecos, sin
    los puntos sobre el paralelo 27°40' (esa es la frontera, no el muro)."""
    marruecos = {clave(p) for r in anillos(PAISES["MAR"]) for p in r}
    sah = anillos(PAISES["SAH"])[0][:-1]
    comun = [clave(p) in marruecos and p[1] < 27.66 for p in sah]
    # El tramo seguido más largo, dando la vuelta al anillo.
    n = len(sah)
    inicio = next(i for i in range(n) if comun[i] and not comun[i - 1])
    tramo = []
    for k in range(n):
        i = (inicio + k) % n
        if not comun[i]:
            break
        tramo.append(sah[i])
    # Se cierra hasta el paralelo, donde el muro llega a la frontera.
    sigue = sah[(inicio + len(tramo)) % n]
    tramo.append(sigue)
    return [[round(lat, 4), round(lon, 4)] for lon, lat in tramo]


def costa_en(lat):
    """La costa atlántica (lo más al oeste de Marruecos en Natural Earth) a esa latitud."""
    xs = []
    for r in anillos(PAISES["MAR"]):
        for (x1, y1), (x2, y2) in zip(r, r[1:]):
            if (y1 - lat) * (y2 - lat) <= 0 and y1 != y2:
                xs.append(x1 + (lat - y1) * (x2 - x1) / (y2 - y1))
    return min(xs)


capas = [
    {
        "id": "cinta", "nombre": "Cinta transportadora de Bucraa", "estilo": "cinta",
        "desde": "1969-01-01", "hasta": None,
        "lineas": [[[26.318, -12.857], [27.075, -13.435], [27.087, -13.466]]],
    },
    {
        "id": "reparto-1976", "nombre": "Reparto con Mauritania (1976-79)", "estilo": "reparto",
        "desde": "1976-04-14", "hasta": "1979-08-05",
        "lineas": [[[24.0, round(costa_en(24.0), 4)], [23.0, -13.0]]],
    },
    {
        "id": "muro", "nombre": "El muro", "estilo": "muro",
        "desde": "1980-01-01", "hasta": None,
        "lineas": [muro()],
    },
]

with open(SALIDA, "w") as fh:
    json.dump(capas, fh, ensure_ascii=False, separators=(",", ":"))
for c in capas:
    print(f"{c['id']}: {sum(len(l) for l in c['lineas'])} puntos, {c['desde']} → {c['hasta'] or 'hoy'}")
