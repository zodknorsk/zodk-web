#!/usr/bin/env python3
"""Los nombres y las ciudades del mapa del Sáhara: public/sahara/sahara-nombres.json.

Lo lee la web (la capa de nombres de /sahara, src/scripts/sahara-nombres.js)
y generar-sahara.py (dibuja la mancha de cada ciudad y pueblo en el mapa).
Salen de dos sitios:
  - las ciudades de GeoNames de más de 15.000 habitantes (cities15000.txt,
    el de las luces de la Tierra) que caen en la caja del mapa, sin los
    barrios (PPLX), con su nombre en castellano si está en EXONIMOS; en
    Marruecos, fuera del Sáhara, solo las de MARRUECOS_MIN o más (eran casi
    todas las del mapa y lo llenaban);
  - lo que se pone a mano (A_MANO): países, regiones, mares, cabos y los
    pueblos del Sáhara que GeoNames no trae (Tarfaya, La Güera, Tifariti...);
    y los accidentes geográficos (ACCIDENTES): picos con su altura, ríos,
    bahías, sebjas, ergs y valles, pocos y de los conocidos.

Cada nombre lleva su clase (pais, region, mar, cabo, ciudad, pueblo, pico,
agua, accidente), la
población (las ciudades y pueblos) y `desde`: a partir de qué zoom sale en la
web, en px CSS por píxel del mapa base (64 px/grado; al abrir son ~2).

Uso (desde arte/):  python3 generar-nombres-sahara.py
Después, rehacer el mapa (generar-sahara.py) si cambian ciudades o pueblos.
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "public", "sahara", "sahara-nombres.json")
CAJA = (20.0, 37.2, -21.5, -1.0)       # la de generar-sahara.py

# GeoNames trae el nombre local o el inglés: los que tienen nombre en
# castellano.
EXONIMOS = {
    "Laayoune": "El Aaiún", "Dakhla": "Dajla", "Tangier": "Tánger", "Tétouan": "Tetuán",
    "Marrakesh": "Marrakech", "Fes": "Fez", "Meknes": "Mequinez", "Oujda": "Uchda",
    "Kenitra": "Kenitra", "Al Hoceïma": "Alhucemas", "Nouadhibou": "Nuadibú",
    "Zouerate": "Zuérat", "Zouérat": "Zuérat", "Tindouf": "Tinduf", "Essaouira": "Esauira", "Ouarzazate": "Uarzazat",
    "Larache": "Larache", "Ksar El Kebir": "Alcazarquivir", "Cadiz": "Cádiz", "Tan-Tan": "Tan-Tan",
    "Sidi Ifni": "Sidi Ifni", "Es-Semara": "Smara", "Smara": "Smara", "Boujdour": "Bojador",
    "Béchar": "Béchar", "Tlemcen": "Tremecén", "Safi": "Safí", "El Jadida": "El Jadida",
    "Asilah": "Arcila", "Chefchaouen": "Chauen", "Taroudant": "Tarudant", "Tiznit": "Tiznit",
}

# A mano: (nombre, clase, lat, lon, población estimada o 0, desde).
A_MANO = [
    ("Marruecos", "pais", 31.6, -6.2, 0, 0),
    ("Sáhara Occidental", "pais", 24.9, -13.0, 0, 0),
    ("Mauritania", "pais", 21.4, -11.4, 0, 0),
    ("Argelia", "pais", 27.4, -4.0, 0, 0),
    ("Malí", "pais", 20.6, -3.4, 0, 0),
    ("España", "pais", 37.0, -4.6, 0, 1.5),
    ("Islas Canarias", "region", 29.4, -16.6, 0, 0),
    ("Saguía el Hamra", "region", 26.8, -11.6, 0, 1.5),
    ("Río de Oro", "region", 23.2, -14.4, 0, 1.5),
    ("Alto Atlas", "region", 31.25, -6.6, 0, 1.5),
    ("Antiatlas", "region", 29.9, -8.3, 0, 2.5),
    ("Rif", "region", 34.95, -4.6, 0, 2.5),
    ("Hamada de Tinduf", "region", 28.4, -6.6, 0, 2.5),
    ("Tiris", "region", 22.6, -12.6, 0, 2.5),
    ("Océano Atlántico", "mar", 30.5, -14.6, 0, 0),
    ("Mar Mediterráneo", "mar", 36.35, -2.6, 0, 1.5),
    ("Estrecho de Gibraltar", "mar", 35.98, -5.62, 0, 4),
    ("Monte Tropic", "mar", 23.83, -20.73, 0, 2),
    ("Cabo Bojador", "cabo", 26.13, -14.49, 0, 3),
    ("Cabo Blanco", "cabo", 20.77, -17.05, 0, 3),
    ("Cabo Juby", "cabo", 27.95, -12.97, 0, 4),
    ("Cabo Ghir", "cabo", 30.63, -9.88, 0, 4),
    # Pueblos y sitios del Sáhara que no están en cities15000 (menos de 15.000
    # habitantes): coordenadas y población del GeoNames de cada país (EH, MA,
    # MR); los campamentos de Tinduf y Gdeim Izik, que no están, aproximados.
    ("Tarfaya", "pueblo", 27.939, -12.926, 5615, 0),
    ("La Güera", "pueblo", 20.832, -17.09, 3127, 0),
    ("Bucraa", "pueblo", 26.354, -12.784, 2519, 0),
    ("El Marsa", "pueblo", 27.096, -13.416, 28848, 0),
    ("Guerguerat", "pueblo", 21.427, -16.96, 30, 0),
    ("Mahbes", "pueblo", 27.414, -9.048, 130, 0),
    ("Tifariti", "pueblo", 26.158, -10.559, 3000, 0),
    ("Bir Lehlu", "pueblo", 26.35, -9.577, 1000, 0),
    ("Haouza", "pueblo", 27.1, -11.01, 2400, 0),
    ("Guelta Zemmur", "pueblo", 25.133, -12.367, 500, 0),
    ("Auserd", "pueblo", 22.554, -14.33, 5832, 0),
    ("Bir Gandús", "pueblo", 21.603, -16.45, 4625, 0),
    ("Tichla", "pueblo", 21.584, -14.972, 6036, 0),
    ("Mijek", "pueblo", 23.449, -12.825, 519, 0),
    ("Agüenit", "pueblo", 22.193, -13.141, 222, 0),
    ("Edchera", "pueblo", 27.026, -13.052, 1745, 0),
    ("Amgala", "pueblo", 26.287, -11.135, 4398, 0),
    ("Gdeim Izik", "pueblo", 27.08, -13.11, 0, 2.5),       # el campamento de 2010, 12 km al SE de El Aaiún
    ("Campamentos de Tinduf", "pueblo", 27.53, -8.02, 90000, 0),
    ("Smara", "ciudad", 26.74, -11.67, 60000, 0),
    ("Bojador", "ciudad", 26.13, -14.48, 40000, 0),
    ("Zuérat", "ciudad", 22.73, -12.47, 45000, 0),
    ("Tinduf", "ciudad", 27.67, -8.15, 160000, 0),
    ("Sidi Ifni", "ciudad", 29.38, -10.17, 21000, 0),
    ("Tan-Tan", "ciudad", 28.44, -11.10, 75000, 0),
    ("Ceuta", "ciudad", 35.889, -5.317, 84000, 0),
    ("Melilla", "ciudad", 35.293, -2.938, 86000, 0),
    ("Perejil", "pueblo", 35.914, -5.418, 0, 4),
    ("Arrecife", "ciudad", 28.96, -13.55, 64000, 0),
    ("Puerto del Rosario", "ciudad", 28.50, -13.86, 41000, 0),
    ("Gibraltar", "ciudad", 36.14, -5.35, 34000, 0),
]
A_MANO_NOMBRES = {n for n, *_ in A_MANO}

# Accidentes geográficos: (nombre, clase, lat, lon, desde). pico, con su
# altura (el punto, en la cumbre); agua, ríos y bahías (los ríos, sobre su
# trazo de Natural Earth; el Draa no viene y va sobre su valle); accidente,
# sebjas, ergs y valles (centrados). Salen al acercarse, para no llenar el
# mapa. La sebja de Tah, centrada en lo que el relieve fino tiene bajo el
# nivel del mar al noreste de Tarfaya.
ACCIDENTES = [
    ("Teide · 3.715 m", "pico", 28.2724, -16.6425, 1.5),
    ("Toubkal · 4.167 m", "pico", 31.0597, -7.9156, 1.5),
    ("Mulhacén · 3.479 m", "pico", 37.0531, -3.3114, 2.5),
    ("M'Goun · 4.071 m", "pico", 31.51, -6.45, 3.5),
    ("Jbel Siroua · 3.305 m", "pico", 30.737, -7.607, 4),
    ("Roque de los Muchachos · 2.426 m", "pico", 28.754, -17.885, 3.5),
    ("Pico de las Nieves · 1.949 m", "pico", 27.9592, -15.5733, 3.5),
    ("Kediet ej Jill · 915 m", "pico", 22.633, -12.55, 2.5),
    ("Uad Draa", "agua", 28.65, -10.4, 2.5),
    ("Sus", "agua", 30.394, -9.331, 3),
    ("Oum er Rbia", "agua", 32.414, -7.35, 3.5),
    ("Sebú", "agua", 34.336, -5.469, 3.5),
    ("Muluya", "agua", 34.013, -3.418, 3.5),
    ("Guadalquivir", "agua", 37.099, -6.099, 3.5),
    ("Bahía de Dajla", "agua", 23.62, -15.83, 3),
    ("Bahía de Cintra", "agua", 23.05, -16.22, 3.5),
    ("Sebja de Tah", "accidente", 28.0, -12.55, 3),
    ("Valle del Draa", "accidente", 30.25, -5.8, 3),
    ("Erg Chebbi", "accidente", 31.15, -3.97, 3),
    ("Erg Iguidi", "accidente", 26.8, -5.0, 1.5),
]
# En Marruecos, fuera del Sáhara, solo las ciudades de tantos habitantes.
MARRUECOS_MIN = 100_000


# Lo del Sáhara Occidental sale antes que lo de fuera: es de lo que va el mapa.
SAHARA = (20.7, 27.7, -17.2, -8.6)


def desde_por_poblacion(p, lat, lon):
    """Zoom desde el que sale una ciudad: las grandes antes; las del Sáhara,
    desde el principio."""
    d = 0 if p >= 400_000 else 1.5 if p >= 150_000 else 2.5 if p >= 60_000 else 3.5 if p >= 20_000 else 5
    if SAHARA[0] <= lat <= SAHARA[1] and SAHARA[2] <= lon <= SAHARA[3]:
        d = min(d, 0)
    return d


def main():
    nombres = []
    with open(os.path.join(AQUI, "cities15000.txt"), encoding="utf-8") as fh:
        for linea in fh:
            c = linea.rstrip("\n").split("\t")
            lat, lon, codigo, pob = float(c[4]), float(c[5]), c[7], int(c[14] or 0)
            if not (CAJA[0] <= lat <= CAJA[1] and CAJA[2] <= lon <= CAJA[3]) or codigo == "PPLX":
                continue
            fuera_del_sahara = not (SAHARA[0] <= lat <= SAHARA[1] and SAHARA[2] <= lon <= SAHARA[3])
            if c[8] == "MA" and pob < MARRUECOS_MIN and fuera_del_sahara:
                continue
            nombre = EXONIMOS.get(c[1], c[1])
            if nombre in A_MANO_NOMBRES:
                continue
            nombres.append({"nombre": nombre, "clase": "ciudad", "lat": lat, "lon": lon,
                            "poblacion": pob, "desde": desde_por_poblacion(pob, lat, lon)})
    for nombre, clase, lat, lon, pob, desde in A_MANO:
        n = {"nombre": nombre, "clase": clase, "lat": lat, "lon": lon, "desde": desde}
        if clase in ("ciudad", "pueblo"):
            n["poblacion"] = pob
            if clase == "ciudad":
                n["desde"] = desde_por_poblacion(pob, lat, lon)
        nombres.append(n)
    for nombre, clase, lat, lon, desde in ACCIDENTES:
        nombres.append({"nombre": nombre, "clase": clase, "lat": lat, "lon": lon, "desde": desde})
    # Primero lo que más importa: así, si dos se pisan, la web deja el primero.
    orden = {"pais": 0, "mar": 1, "region": 2, "ciudad": 3, "cabo": 4, "pico": 5, "agua": 6,
             "accidente": 7, "pueblo": 8}
    nombres.sort(key=lambda n: (orden[n["clase"]], n["desde"], -n.get("poblacion", 0)))
    with open(SALIDA, "w", encoding="utf-8") as fh:
        json.dump(nombres, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"{SALIDA}: {len(nombres)} nombres")
    comprobar_tierra(nombres)


EN_EL_MAR = {"Monte Tropic", "Océano Atlántico", "Mar Mediterráneo", "Estrecho de Gibraltar",
             "Bahía de Dajla", "Bahía de Cintra"}


def comprobar_tierra(nombres):
    """Avisa de las ciudades, pueblos y lugares de los hitos que caen en el
    mar según el relieve fino (sahara240.i16): un sitio de tierra puesto mal."""
    import array
    ruta = os.path.join(AQUI, "tierra-fuentes", "sahara240.json")
    if not os.path.exists(ruta):
        print("(sin el relieve fino no se comprueba que caigan en tierra)")
        return
    with open(ruta) as fh:
        d = json.load(fh)
    alt = array.array("h")
    with open(os.path.splitext(ruta)[0] + ".i16", "rb") as fh:
        alt.frombytes(fh.read())
    S, N, O, E = d["zona"]

    def en_tierra(lat, lon):
        if not (S <= lat < N and O <= lon < E):
            return None
        # el punto o algo de tierra a menos de ~1 km (los de la orilla)
        r0, c0 = int((N - lat) * d["ppd"]), int((lon - O) * d["ppd"])
        return any(alt[(r0 + i) * d["ancho"] + c0 + j] > 0 for i in (-2, 0, 2) for j in (-2, 0, 2))

    with open(os.path.join(AQUI, "..", "src", "data", "sahara", "lugares.json"), encoding="utf-8") as fh:
        lugares = [(k, *v) for k, v in json.load(fh).items() if not k.startswith("_")]
    sitios = [(n["nombre"], n["lat"], n["lon"]) for n in nombres if n["clase"] in ("ciudad", "pueblo")] + lugares
    malos = [s for s in sitios if s[0] not in EN_EL_MAR and en_tierra(s[1], s[2]) is False]
    for n, la, lo in malos:
        print(f"  ⚠ cae en el mar: {n} ({la}, {lo})")
    if not malos:
        print("Todos los sitios de tierra caen en tierra.")


if __name__ == "__main__":
    main()
