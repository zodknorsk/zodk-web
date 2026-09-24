#!/usr/bin/env python3
"""Nombres de la Tierra (Proyecto Tierra, TIERRA-WIP.md): continentes,
océanos, mares y accidentes geográficos, en castellano, para la capa de
nombres de la portada (la de Marte y la Luna, src/scripts/marte-nombres.js)
-> public/planeta/tierra-nombres.json.

Decidido por el usuario (24-sep-2026): al acercarse salen nombres, SIN
fronteras; primero se probaron países y los quitó: "quitamos los nombres de
países. Dejamos continentes y ponemos océanos, mares y accidentes geográficos
que sean interesantes". Como en Marte: rótulo de región (sin marco) para las
zonas (océanos, mares, desiertos, cordilleras, mesetas, penínsulas) y visor
para lo concreto (estrechos y picos); a x1, ninguno. Los continentes salen
primero y se retiran (`zmax`) cuando empiezan los mares y las regiones.

Fuentes (Natural Earth, dominio público; nombres en español de su NAME_ES):
  tierra-fuentes/ne_10m_geography_marine_polys.geojson     (océanos, mares, estrechos)
  tierra-fuentes/ne_50m_geography_regions_polys.geojson    (desiertos, cordilleras...)
  tierra-fuentes/ne_10m_geography_regions_elevation_points.geojson  (picos)
  curl -sSLo tierra-fuentes/<archivo> \
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/<archivo>
El tamaño (`km`) de una zona es el lado de un cuadrado de la superficie de su
trozo más grande, y su rótulo va en el centro de ese trozo. La lista de lo que
sale está elegida a mano (MARES, REGIONES, ESTRECHOS, PICOS).
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
ZONA_ZMIN = 1.8          # mares y regiones, no antes
ZONA_PX = 90             # y cada uno cuando mide esto en pantalla
VISOR_ZMIN = 3.0         # estrechos y picos, ya acercado
VISOR_PX = 10
VISOR_MIN = 0.7          # lado mínimo del visor, en grados (los estrechos son finísimos)

MARES = [
    "Mediterráneo", "mar Caribe", "mar Rojo", "mar Negro", "mar Caspio", "mar Arábigo",
    "golfo Pérsico", "Golfo de Omán", "Golfo de Adén", "Golfo de México", "Bahía de Bengala",
    "Bahía de Hudson", "mar de China Meridional", "mar de China Oriental", "mar Amarillo",
    "mar del Japón", "mar de Ojotsk", "mar de Bering", "Mar Báltico", "mar del Norte",
    "Mar de Barents", "mar de Noruega", "mar de Groenlandia", "mar de Kara", "mar de Láptev",
    "mar de Beaufort", "mar de Labrador", "mar del Coral", "mar de Tasmania", "mar de Filipinas",
    "mar de Weddell", "mar de Ross", "Golfo de Guinea", "Golfo de Vizcaya", "mar de los Sargazos",
    "mar Adriático", "mar Egeo", "mar de Azov", "mar de Andamán", "mar de Java", "Golfo de Alaska",
    "canal de la Mancha", "Canal de Mozambique", "Pasaje de Drake",
]
REGIONES = [
    "Sahara", "Desierto de Gobi", "Kalahari", "Desierto de Rub al-Jali", "Desierto de Atacama",
    "Namib", "Desierto de Thar", "Taklamakán", "Cuenca del Amazonas", "Cuenca del Congo",
    "Siberia", "Patagonia", "SAHEL", "Meseta Tibetana", "Himalaya", "Cordillera de Los Andes",
    "Alpes", "Montañas Rocosas", "Cáucaso", "Montes Urales", "Atlas", "Zagros", "Hindú Kush",
    "Cordillera del Karakórum", "Cordillera del Pamir", "Tian Shan", "Apalaches",
    "Gran Cordillera Divisoria", "Pirineos", "montes Cárpatos", "Grandes Llanuras",
    "Estepa kazaja", "Escandinavia", "Arabia", "Anatolia", "península balcánica",
    "península ibérica", "Indochina", "Cuerno de África", "península de Kamchatka",
    "península de Crimea", "Mesopotamia", "Gran Valle del Rift", "Macizo etíope",
    "Península Antártica", "Meseta Antártica", "Escudo Canadiense", "península de Yucatán",
    "Península de Corea",
]
# Nombres que Natural Earth trae en mayúsculas o raros
ARREGLOS = {"SAHEL": "Sahel", "Cordillera de Los Andes": "Cordillera de los Andes"}
ESTRECHOS = ["Estrecho de Gibraltar", "Bósforo", "Dardanelos", "Bab el-Mandeb",
             "Estrecho de Malaca", "Estrecho de Taiwán"]
# Ormuz no viene en Natural Earth: a mano (caja S, N, O, E)
A_MANO = [("Estrecho de Ormuz", 26.55, 56.35, [25.9, 27.1, 55.6, 57.2])]
PICOS = ["Everest", "K2", "Aconcagua", "Denali", "Kilimanjaro", "Mont Blanc", "Monte Elbrus",
         "Macizo Vinson", "Monte Ararat", "Teide", "Monte Fuji", "Mauna Kea", "Monte Etna",
         "Vesubio", "Volcán Chimborazo", "Mulhacén", "Pico Aneto"]


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

    for n, fs in busca(marinos, "name_es", MARES).items():
        for f in fs:
            km, lat, lon, _c = zona(f["geometry"])
            nombres.append({"nombre": ARREGLOS.get(n, n), "clase": "region", "px": ZONA_PX, "menor": True,
                            "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2), "linea": True,
                            "zmin": ZONA_ZMIN})
    for n, fs in busca(carga("ne_50m_geography_regions_polys.geojson"), "NAME_ES", REGIONES).items():
        km, lat, lon, _c = max((zona(f["geometry"]) for f in fs), key=lambda z: z[0])
        nombres.append({"nombre": ARREGLOS.get(n, n), "clase": "region", "px": ZONA_PX, "menor": True,
                        "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2), "linea": True,
                        "zmin": ZONA_ZMIN})
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
        nombres.append({"nombre": n, "clase": "visor", "px": VISOR_PX, "menor": True,
                        "km": round(km, 1), "lat": round(lat, 2), "lon": round(lon, 2),
                        "caja": [round(x, 2) for x in (s_, n_, o, e)], "linea": True, "zmin": VISOR_ZMIN})
    # de mayor a menor: la capa deja el del lugar más grande cuando dos se pisan
    nombres.sort(key=lambda n: -n["km"])
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
