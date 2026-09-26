#!/usr/bin/env python3
"""Nombres de la Tierra: continentes, océanos, mares y accidentes
geográficos, en castellano, para la capa de nombres de la portada
(src/scripts/nombres.js) -> public/planeta/tierra-nombres.json.

Sin fronteras ni países (se probaron y no quedaban bien). Como en Marte:
rótulo de región (sin marco) para las zonas (océanos, mares, desiertos,
cordilleras, mesetas, penínsulas) y visor para lo concreto (estrechos y
picos); a ×1, ninguno. Los continentes salen primero y se retiran (`zmax`)
cuando empiezan los mares y las regiones.

Fuentes (Natural Earth, dominio público; nombres en español de su NAME_ES):
  tierra-fuentes/ne_10m_geography_marine_polys.geojson     (océanos, mares, estrechos)
  tierra-fuentes/ne_50m_geography_regions_polys.geojson    (desiertos, cordilleras...)
  tierra-fuentes/ne_10m_geography_regions_elevation_points.geojson  (picos)
  curl -sSLo tierra-fuentes/<archivo> \
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/<archivo>
El tamaño (`km`) de una zona es el lado de un cuadrado de la superficie de su
trozo más grande, y su rótulo va en el centro de ese trozo. La lista de lo que
sale va por la importancia que les da Natural Earth (scalerank), con lo que
se quita o se añade a mano (NO_REGIONES, MARES_4, REGIONES_4), y a mano los
estrechos y los picos (ESTRECHOS, PICOS).
Uso:  python3 generar-nombres-tierra.py
"""
import json
import math
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = os.path.join(AQUI, "tierra-fuentes")
SALIDA = os.path.join(AQUI, "..", "public", "planeta", "tierra-nombres.json")
KM_GRADO = 111.32

# Continentes: sitio del rótulo (lat, lon) y tamaño aproximado (km).
CONTINENTES = [
    ("Asia", 48.0, 92.0, 9000),
    ("África", 6.0, 20.0, 7500),
    ("América del Norte", 48.0, -102.0, 7000),
    ("América del Sur", -14.0, -60.0, 6000),
    ("Antártida", -80.0, 20.0, 4500),
    ("Oceanía", -25.0, 134.0, 4000),
    ("Europa", 53.0, 22.0, 3500),
]
CONT_ZMAX = 2.6          # los continentes se van al acercarse, cuando salen mares y regiones
# Mares y regiones salen por orden de importancia (el `scalerank` de Natural
# Earth: 0-1 lo más conocido, 4 lo de detalle), cada uno desde su zoom y
# cuando mide ZONA_PX en pantalla.
ZONA_ZMIN = {0: 1.8, 1: 1.8, 2: 2.2, 3: 2.8, 4: 3.4}
ZONA_PX = 90
VISOR_ZMIN = 3.0         # estrechos y picos, ya acercado
VISOR_PX = 10
VISOR_MIN = 0.7          # lado mínimo del visor, en grados (los estrechos son finísimos)

# Mares, golfos y bahías: todos los de scalerank 0-3 de Natural Earth 1:10m
# (con menos, Oceanía, Australia y China quedaban casi vacías) y estos de
# detalle (4).
MAR_RANGO = 3
MARES_4 = ["Gran barrera de coral", "mar Jónico", "mar de Bohai", "Golfo de Tonkín",
           "Golfo de San Lorenzo", "Río de la Plata", "mar de Salomón", "mar de Bismarck",
           "Golfo de Finlandia", "Golfo de León", "mar Balear", "mar Egeo", "mar de Molucas"]
# Regiones (desiertos, cordilleras, mesetas, llanuras, cuencas, penínsulas,
# islas y archipiélagos): las de scalerank 0-3 de Natural Earth 1:50m, menos
# las clases que no son accidentes (costas y tierras de la Antártida) y los
# nombres raros o sueltos de NO_REGIONES; y estas de detalle (4), para que
# Australia y China tengan lo suyo.
REG_RANGO = 3
REG_CLASES = {"Range/mtn", "Desert", "Plateau", "Plain", "Basin", "Lowland", "Tundra", "Valley",
              "Pen/cape", "Peninsula", "Island", "Island group", "Isthmus", "Delta", "Wetlands",
              "Geoarea"}
NO_REGIONES = {
    "Antártida Oriental", "Antártida Occidental", "Tierra de Wilkes", "Tierra de la Reina Maud",
    "Tierra de Marie Byrd", "Tierra de Victoria", "Tierra de Mac. Robertson", "Tierra de Enderby",
    "Nueva Suabia", "Tierra de Coats", "Tierra de Ellsworth", "Tierra de Kemp", "Tierra de Palmer",
    "Tierra de Graham", "Talos Dome", "Domo C", "Domo A", "Domo F", "Tierras Altas Americanas",
    "Meseta Hollick-Kenyon", "Meseta de Rockefeller", "Isla Berkner", "KNUD RASMUSSEN LAND",
    "SELVAS", "Punyab", "Isla Bolshói Bégichev", "Central Highlands", "Cabo de Cà Mau",
    "Kiribati", "Islas de la Línea", "Isla de Hawái", "Isla Espíritu Santo", "Maui", "Tahití",
    "Bougainville", "Guadalcanal", "Viti Levu", "Isla Isabela", "Tundra Bol’shezemel’skaya",
    "BARREN GROUNDS", "ISLAS PARRY", "Isla Gran Nicobar", "Isla Andamán del Sur",
    "Isla Andamán del Medio", "Isla Andamán del Norte", "Chaco Boreal", "Chaco Austral",
    "Yungas", "Sudd", "Montañas de Air", "MONTAÑAS DE CRISTAL", "MONTAÑAS MITUMBA",
    "Apeninos ligures", "Planicie Costera", "TIERRAS BAJAS CENTRALES", "North Slope", "Piedmont",
    "Meseta de Allegheny", "Meseta de Cumberland", "Cadena costera del Pacífico",
    "Archipiélago de Mergui", "Islas Spratly", "Istmo de Kra", "Corredor del Hexi",
    "Llanura nordeuropea", "Nueva Escocia", "Labrador", "Asia", "África", "Europa",
    "América del Norte", "América del Sur", "Antártida", "Australia", "Melanesia", "Micronesia",
    "Polinesia", "Archipiélago malayo", "Indias Occidentales", "subcontinente indio",
    "Cordillera Occidental", "Cordillera Oriental", "Cordillera Real",
}
REGIONES_4 = ["Desierto de Gibson", "MESETA DE KIMBERLEY", "Meseta de Loes", "Cordillera Qin",
              "Cuenca de Junggar", "Cuenca de Qaidam", "Taklamakán", "Hainan", "Timor",
              "Meandro de Ordos", "Montañas Yin", "Montañas Taihang"]
# Nombres que Natural Earth trae en mayúsculas o raros
ARREGLOS = {"SAHEL": "Sahel", "Cordillera de Los Andes": "Cordillera de los Andes",
            "Jaya": "Puncak Jaya", "Kliuchevskoi": "Kliuchevskói", "monte Cook": "Aoraki (monte Cook)",
            "mar de Chukotka.": "mar de Chukotka", "Meandro de Ordos": "Desierto de Ordos",
            "Cordillera Qin": "Qinling", "Región pampeana": "La Pampa",
            "Gran barrera de coral": "Gran Barrera de Coral",
            "Montañas Transantárticas": "Montes Transantárticos", "Montaña Nan Ling": "Nan Ling",
            "Cordillera Lesser Khingan": "Pequeño Khingan", "MONTE MACKENZIE": "Montes Mackenzie",
            "Región Delta del Río Mekong": "Delta del Mekong", "Monte Wuyi": "Montes Wuyi"}
ESTRECHOS = ["Estrecho de Gibraltar", "Bósforo", "Dardanelos", "Bab el-Mandeb",
             "Estrecho de Malaca", "Estrecho de Taiwán", "Estrecho de Bass", "estrecho de Torres",
             "Estrecho de Magallanes", "Estrecho de Cook", "Estrecho de Corea"]
# Ormuz no viene en Natural Earth: a mano (caja S, N, O, E)
A_MANO = [("Estrecho de Ormuz", 26.55, 56.35, [25.9, 27.1, 55.6, 57.2])]
# Picos: los conocidos en todo el mundo (los más altos de cada continente,
# los ochomiles más famosos y los volcanes célebres). Sin los de interés solo
# local, como el Mulhacén.
PICOS = ["Everest", "K2", "Kanchenjunga", "Aconcagua", "Denali", "Kilimanjaro", "Monte Elbrus",
         "Macizo Vinson", "Jaya", "Mont Blanc", "Monte Fuji", "Mauna Kea", "Monte Kenia",
         "Volcán Chimborazo", "Nevado Ojos del Salado", "Huascarán", "Citlaltépetl", "Damavand",
         "Monte Ararat", "Kliuchevskoi", "Monte Etna", "Vesubio", "Teide", "Monte Kosciuszko",
         "monte Cook", "Kailash", "Monte Gongga", "Monte Kinabalu", "Monte Whitney"]


def titulo(n):
    """Los que Natural Earth trae en mayúsculas, en minúscula con la inicial."""
    if n != n.upper():
        return n
    menores = {"de", "del", "la", "las", "los", "y"}
    return " ".join(w if i and w.lower() in menores else w.capitalize()
                    for i, w in enumerate(n.lower().split()))


def area_km2(anillo):
    """Superficie aproximada de un anillo (lon, lat) en km², proyectándolo con
    el coseno de su latitud media."""
    lat_m = sum(p[1] for p in anillo) / len(anillo)
    k = math.cos(math.radians(lat_m))
    a = 0.0
    for (x0, y0), (x1, y1) in zip(anillo, anillo[1:] + anillo[:1]):
        a += x0 * k * y1 - x1 * k * y0
    return abs(a) / 2 * KM_GRADO * KM_GRADO


def poligonos(geom):
    if geom["type"] == "Polygon":
        yield geom["coordinates"]
    else:
        yield from geom["coordinates"]


def desenrolla(anillo):
    """Longitudes seguidas (sin saltos de 360° en la línea de cambio de fecha)."""
    out, prev = [], None
    for lon, lat in anillo:
        if prev is not None:
            while lon - prev > 180:
                lon -= 360
            while lon - prev < -180:
                lon += 360
        out.append((lon, lat))
        prev = lon
    return out


def zona(geom):
    """(km, lat, lon, caja) del trozo más grande: lado del cuadrado de su
    superficie, su centro (centroide) y su caja [S, N, O, E]."""
    anillo = max((desenrolla(pol[0]) for pol in poligonos(geom)), key=area_km2)
    lat_m = sum(p[1] for p in anillo) / len(anillo)
    k = math.cos(math.radians(lat_m))
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(anillo, anillo[1:] + anillo[:1]):
        cr = x0 * k * y1 - x1 * k * y0
        a += cr
        cx += (x0 * k + x1 * k) * cr
        cy += (y0 + y1) * cr
    if abs(a) < 1e-12:
        lon, lat = anillo[0]
    else:
        lon, lat = cx / (3 * a) / k, cy / (3 * a)
    lon = (lon + 540) % 360 - 180
    lons = [p[0] for p in anillo]
    lats = [p[1] for p in anillo]
    caja = [min(lats), max(lats), (min(lons) + 540) % 360 - 180, (max(lons) + 540) % 360 - 180]
    return math.sqrt(area_km2(anillo)), lat, lon, caja


def carga(nombre):
    with open(os.path.join(FUENTES, nombre)) as fh:
        return json.load(fh)["features"]


def main():
    nombres = []
    for nombre, lat, lon, km in CONTINENTES:
        nombres.append({"nombre": nombre, "clase": "region", "px": 0, "menor": False,
                        "km": km, "lat": lat, "lon": lon, "linea": True, "zmax": CONT_ZMAX})
    marinos = carga("ne_10m_geography_marine_polys.geojson")
    for f in marinos:                               # océanos: todos, como los continentes
        p = f["properties"]
        if p["featurecla"] == "ocean":
            km, lat, lon, _c = zona(f["geometry"])
            nombres.append({"nombre": p["name_es"], "clase": "region", "px": 0, "menor": False,
                            "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2), "linea": True})
    faltan = []

    def busca(feats, clave, lista):
        por_nombre = {}
        for f in feats:
            n = f["properties"].get(clave)
            if n in lista:
                por_nombre.setdefault(n, []).append(f)
        faltan.extend(n for n in lista if n not in por_nombre)
        return por_nombre

    def zona_nombre(n, feats, rango):
        km, lat, lon, _c = max((zona(f["geometry"]) for f in feats), key=lambda z: z[0])
        nombres.append({"nombre": titulo(ARREGLOS.get(n, n)), "clase": "region", "px": ZONA_PX,
                        "menor": True, "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2),
                        "linea": True, "zmin": ZONA_ZMIN[rango]})

    # mares: por nombre (el Pacífico y el Atlántico vienen en dos trozos)
    mares = {}
    for f in marinos:
        p = f["properties"]
        n = p["name_es"]
        if p["featurecla"] in ("sea", "gulf", "bay", "reef", "sound") and n and \
                (p["scalerank"] <= MAR_RANGO or n in MARES_4):
            mares.setdefault(n, [p["scalerank"], []])[1].append(f)
    for n, (rango, fs) in mares.items():
        zona_nombre(n, fs, rango)
    regiones = {}
    for f in carga("ne_50m_geography_regions_polys.geojson"):
        p = f["properties"]
        n = p["NAME_ES"]
        if n and n not in NO_REGIONES and p["FEATURECLA"] in REG_CLASES and \
                (p["SCALERANK"] <= REG_RANGO or n in REGIONES_4):
            r = regiones.setdefault(n, [p["SCALERANK"], []])
            r[0] = min(r[0], p["SCALERANK"])
            r[1].append(f)
    faltan.extend(n for n in REGIONES_4 if n not in regiones)
    faltan.extend(n for n in MARES_4 if n not in mares)
    for n, (rango, fs) in regiones.items():
        zona_nombre(n, fs, rango)
    visores = []
    for n, fs in busca(marinos, "name_es", ESTRECHOS).items():
        km, lat, lon, caja = zona(fs[0]["geometry"])
        visores.append((n, lat, lon, caja))
    visores += A_MANO
    for n, fs in busca(carga("ne_10m_geography_regions_elevation_points.geojson"), "name_es", PICOS).items():
        p = fs[0]["properties"]
        lat, lon = p["lat_y"], p["long_x"]
        d = 0.35
        visores.append((n, lat, lon, [lat - d, lat + d, lon - d / math.cos(math.radians(lat)),
                                      lon + d / math.cos(math.radians(lat))]))
    for_visores = []
    for n, lat, lon, (s_, n_, o, e) in visores:
        cl = math.cos(math.radians(lat))
        if n_ - s_ < VISOR_MIN:
            s_, n_ = lat - VISOR_MIN / 2, lat + VISOR_MIN / 2
        if ((e - o) % 360) * cl < VISOR_MIN:
            o, e = lon - VISOR_MIN / 2 / cl, lon + VISOR_MIN / 2 / cl
        for_visores.append((n, lat, lon, (s_, n_, o, e)))
    for n, lat, lon, (s_, n_, o, e) in for_visores:
        km = max((n_ - s_) * KM_GRADO, (e - o) % 360 * KM_GRADO * math.cos(math.radians(lat)))
        nombres.append({"nombre": ARREGLOS.get(n, n), "clase": "visor", "px": VISOR_PX, "menor": True,
                        "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2),
                        "caja": [round(x, 2) for x in (s_, n_, o, e)], "linea": True, "zmin": VISOR_ZMIN})
    # Cuando dos se pisan, la capa deja el primero del archivo: primero los
    # visores (son pequeños y marcan un sitio exacto: Bab el-Mandeb no salía
    # nunca, tapado por el rótulo del golfo de Adén) y luego, de mayor a menor.
    nombres.sort(key=lambda n: (n["clase"] != "visor", -n["km"]))
    with open(SALIDA, "w") as fh:
        json.dump(nombres, fh, ensure_ascii=False, indent=1)
    cuenta = {}
    for n in nombres:
        cuenta[n["clase"]] = cuenta.get(n["clase"], 0) + 1
    print(f"{os.path.relpath(SALIDA, AQUI)}: {len(nombres)} nombres {cuenta}")
    if faltan:
        print("no encontrados:", ", ".join(faltan))


if __name__ == "__main__":
    main()
