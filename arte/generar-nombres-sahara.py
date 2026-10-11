#!/usr/bin/env python3
"""Los nombres y las ciudades del mapa del Sáhara: public/sahara/sahara-nombres.json.

Lo lee la web (la capa de nombres de /sahara, src/scripts/sahara-nombres.js)
y generar-sahara.py (dibuja la mancha de cada ciudad y pueblo en el mapa).
Salen de dos sitios:
  - las ciudades de GeoNames de más de 15.000 habitantes (cities15000.txt,
    el de las luces de la Tierra) que caen en la caja del mapa, sin los
    barrios (PPLX), con su nombre en castellano si está en EXONIMOS;
  - lo que se pone a mano (A_MANO): países, regiones, mares, cabos y los
    pueblos del Sáhara que GeoNames no trae (Tarfaya, La Güera, Tifariti...).

Cada nombre lleva su clase (pais, region, mar, cabo, ciudad, pueblo), la
población (las ciudades y pueblos) y `desde`: a partir de qué zoom sale en la
web, en px CSS por píxel del mapa base (64 px/grado; al abrir son ~2).

Uso (desde arte/):  python3 generar-nombres-sahara.py
Después, rehacer el mapa (generar-sahara.py) si cambian ciudades o pueblos.
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "public", "sahara", "sahara-nombres.json")
CAJA = (20.0, 37.2, -19.0, -1.0)       # la de generar-sahara.py

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
    ("Cabo Bojador", "cabo", 26.13, -14.49, 0, 3),
    ("Cabo Blanco", "cabo", 20.77, -17.05, 0, 3),
    ("Cabo Juby", "cabo", 27.95, -12.97, 0, 4),
    ("Cabo Ghir", "cabo", 30.63, -9.88, 0, 4),
    # Pueblos y sitios del Sáhara que GeoNames no trae (o con menos de 15.000)
    ("Tarfaya", "pueblo", 27.94, -12.93, 8000, 0),
    ("La Güera", "pueblo", 20.83, -17.10, 500, 0),
    ("Bucraa", "pueblo", 26.33, -12.85, 2000, 0),
    ("El Marsa", "pueblo", 27.09, -13.40, 3000, 0),
    ("Guerguerat", "pueblo", 21.37, -16.95, 100, 0),
    ("Mahbes", "pueblo", 27.42, -9.06, 500, 0),
    ("Tifariti", "pueblo", 26.16, -10.57, 300, 0),
    ("Bir Lehlu", "pueblo", 26.35, -9.57, 300, 0),
    ("Haouza", "pueblo", 27.13, -11.10, 1500, 0),
    ("Guelta Zemmur", "pueblo", 25.13, -12.36, 1500, 0),
    ("Auserd", "pueblo", 22.55, -14.33, 1000, 0),
    ("Bir Gandús", "pueblo", 21.61, -16.48, 300, 0),
    ("Tichla", "pueblo", 21.60, -14.95, 300, 0),
    ("Mijek", "pueblo", 23.45, -12.83, 200, 0),
    ("Agüenit", "pueblo", 22.18, -13.11, 200, 0),
    ("Edchera", "pueblo", 27.03, -13.05, 100, 0),
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
    # Primero lo que más importa: así, si dos se pisan, la web deja el primero.
    orden = {"pais": 0, "mar": 1, "region": 2, "ciudad": 3, "cabo": 4, "pueblo": 5}
    nombres.sort(key=lambda n: (orden[n["clase"]], n["desde"], -n.get("poblacion", 0)))
    with open(SALIDA, "w", encoding="utf-8") as fh:
        json.dump(nombres, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"{SALIDA}: {len(nombres)} nombres")


if __name__ == "__main__":
    main()
