#!/usr/bin/env python3
"""Baja las fuentes del mapa de una base (docs/nuevabase.md) a
arte/bases-fuentes/<slug>/ (fuera de Git; generar-base.py --elegir la borra):

  dem30.i16/.json   relieve Copernicus GLO-30 (~30 m) de la vista de 40 km
  dem90.i16/.json   relieve Copernicus GLO-90 (~90 m) de la de 90 km
                    (los dos: «Copernicus DEM © DLR e.V. 2010-2014 and © Airbus
                    Defence and Space GmbH 2014-2018 provided under COPERNICUS
                    by the European Union and ESA»)
  lluvia.tif        lluvia anual de WorldClim 2.1 a 10' (los biomas)
  ne_*.geojson      de Natural Earth 1:10m: países, manchas urbanas y lagos secos
  osm-*.json        de OpenStreetMap (© colaboradores de OSM, ODbL), por
                    Overpass: pistas, ciudades, carreteras, agua, minas,
                    pueblos y, en la de 18 km, calles y edificios

Las piezas del relieve son de 1°; las que no existen (solo mar) se saltan y
quedan a 0 m (mar). Uso (desde arte/; necesita Pillow):

  python3 fuentes-base.py <slug>       # el slug de src/data/bases.json

Si falla (Overpass a veces no contesta), se relanza igual: salta lo que ya está
bajado y retoma. Si cambian las coordenadas de la base, borrar antes su carpeta.
"""
import array
import io
import json
import math
import os
import subprocess
import sys
import time
import urllib.parse
import zipfile

from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from vistas_base import BASES, caja, vista  # noqa: E402

COPERNICUS = {30: ("https://copernicus-dem-30m.s3.amazonaws.com", "10", 3600),
              90: ("https://copernicus-dem-90m.s3.amazonaws.com", "30", 1200)}
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_{}.geojson"
LLUVIA = "https://geodata.ucdavis.edu/climate/worldclim/2_1/base/wc2.1_10m_bio.zip"
OVERPASS = ["https://overpass-api.de/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"]


def bajar(url, ruta=None):
    """curl con reintentos; devuelve los bytes o los guarda en `ruta`."""
    for k in range(4):
        r = subprocess.run(["curl", "-sSfL", "-m", "600", url], capture_output=True)
        if r.returncode == 0:
            if ruta:
                with open(ruta, "wb") as fh:
                    fh.write(r.stdout)
            return r.stdout
        if b"404" in r.stderr or b"403" in r.stderr:
            return None                                   # no existe (pieza de mar)
        time.sleep(4 * 2 ** k)
    sys.exit(f"no se pudo bajar {url}: {r.stderr.decode(errors='replace')}")


def relieve(dir_, metros, s, n, o, e):
    """Junta las piezas de 1° de Copernicus que tocan la caja en un .i16."""
    if os.path.exists(os.path.join(dir_, f"dem{metros}.json")):
        return                                             # ya hecho (el .json se escribe el último)
    base, arco, ppd = COPERNICUS[metros]
    la0, la1, lo0, lo1 = math.floor(s), math.ceil(n), math.floor(o), math.ceil(e)
    w, h = (lo1 - lo0) * ppd, (la1 - la0) * ppd
    out = array.array("h", [0]) * (w * h)
    for lat in range(la0, la1):
        for lon in range(lo0, lo1):
            nom = (f"Copernicus_DSM_COG_{arco}_{'N' if lat >= 0 else 'S'}{abs(lat):02d}_00_"
                   f"{'E' if lon >= 0 else 'W'}{abs(lon):03d}_00_DEM")
            datos = bajar(f"{base}/{nom}/{nom}.tif")
            if datos is None:
                continue
            im = Image.open(io.BytesIO(datos))
            # Más al norte de 50° las piezas son más estrechas: se estiran.
            if im.size != (ppd, ppd):
                im = im.resize((ppd, ppd), Image.NEAREST)
            px = list(getattr(im, "get_flattened_data", im.getdata)())
            fila0, col0 = (la1 - 1 - lat) * ppd, (lon - lo0) * ppd
            for r in range(ppd):
                out[(fila0 + r) * w + col0:(fila0 + r) * w + col0 + ppd] = array.array(
                    "h", (max(-32768, min(32767, round(v))) for v in px[r * ppd:(r + 1) * ppd]))
            print(f"  relieve {metros} m: {nom}", file=sys.stderr)
    if sys.byteorder != "little":
        out.byteswap()
    with open(os.path.join(dir_, f"dem{metros}.i16"), "wb") as fh:
        out.tofile(fh)
    with open(os.path.join(dir_, f"dem{metros}.json"), "w") as fh:
        json.dump({"ppd": ppd, "zona": [la0, la1, lo0, lo1], "ancho": w, "alto": h}, fh)


def overpass(consulta, ruta):
    if os.path.exists(ruta):
        return                                             # ya bajado: se retoma tras un fallo
    datos = urllib.parse.urlencode({"data": f"[out:json][timeout:300];{consulta}"})
    for k in range(6):
        for url in OVERPASS:
            r = subprocess.run(["curl", "-sS", "--connect-timeout", "20", "-m", "400", "--data", datos, url],
                               capture_output=True)
            if r.returncode == 0 and r.stdout[:1] == b"{":
                with open(ruta + ".parte", "wb") as fh:
                    fh.write(r.stdout)
                os.replace(ruta + ".parte", ruta)          # así un corte no deja un archivo a medias
                print(f"  {os.path.basename(ruta)}: {len(json.loads(r.stdout)['elements'])} elementos",
                      file=sys.stderr)
                return
        time.sleep(10 * (k + 1))                           # servidores ocupados
    sys.exit(f"Overpass no contesta para {ruta}")


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in {b["slug"] for b in BASES.values()}:
        sys.exit(f"uso: fuentes-base.py <slug>  ({', '.join(b['slug'] for b in BASES.values())})")
    slug = sys.argv[1]
    b = next(b for b in BASES.values() if b["slug"] == slug)
    dir_ = os.path.join(AQUI, "bases-fuentes", slug)
    os.makedirs(dir_, exist_ok=True)

    # El relieve: el de 90 m para la vista de 90 km y el de 30 m para la de 40
    # (las de 18 y 10 caben dentro), con su margen.
    relieve(dir_, 90, *caja(b, vista(90), margen=True))
    relieve(dir_, 30, *caja(b, vista(40), margen=True))

    for nom in ("admin_0_countries", "urban_areas", "playas"):
        if not os.path.exists(os.path.join(dir_, f"ne_{nom}.geojson")):
            bajar(NE.format(nom), os.path.join(dir_, f"ne_{nom}.geojson"))
    if not os.path.exists(os.path.join(dir_, "lluvia.tif")):
        with zipfile.ZipFile(io.BytesIO(bajar(LLUVIA))) as z:
            with open(os.path.join(dir_, "lluvia.tif"), "wb") as fh:
                fh.write(z.read("wc2.1_10m_bio_12.tif"))
    print("  Natural Earth y WorldClim", file=sys.stderr)

    s, n, o, e = caja(b, vista(90), margen=True)
    g = f"({s:.4f},{o:.4f},{n:.4f},{e:.4f})"
    overpass(f'way["aeroway"~"^(runway|taxiway|apron)$"]{g};out geom;', os.path.join(dir_, "osm-pistas.json"))
    overpass(f'(way["landuse"~"^(residential|commercial|industrial|retail)$"]{g};'
             f'relation["landuse"~"^(residential|commercial|industrial|retail)$"]{g};);out geom;',
             os.path.join(dir_, "osm-urbano.json"))
    overpass(f'way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link)$"]{g};out geom;',
             os.path.join(dir_, "osm-carreteras.json"))
    overpass(f'(way["natural"="water"]{g};relation["natural"="water"]{g};'
             f'way["waterway"~"^(river|canal)$"]{g};'
             f'way["natural"~"^(sand|mud)$"]["name"]{g};relation["natural"~"^(sand|mud)$"]["name"]{g};);out geom;',
             os.path.join(dir_, "osm-agua.json"))
    overpass(f'(way["landuse"="quarry"]{g};relation["landuse"="quarry"]{g};);out geom;',
             os.path.join(dir_, "osm-minas.json"))
    overpass(f'node["place"~"^(city|town|village)$"]{g};out;', os.path.join(dir_, "osm-pueblos.json"))
    s, n, o, e = caja(b, vista(18), margen=True)
    g = f"({s:.4f},{o:.4f},{n:.4f},{e:.4f})"
    overpass(f'way["highway"~"^(residential|unclassified|service|living_street)$"]{g};out geom;',
             os.path.join(dir_, "osm-calles.json"))
    overpass(f'way["building"]{g};out geom;', os.path.join(dir_, "osm-edificios.json"))
    mb = sum(os.path.getsize(os.path.join(dir_, f)) for f in os.listdir(dir_)) / 1e6
    print(f"{dir_}: {mb:.0f} MB", file=sys.stderr)


if __name__ == "__main__":
    main()
