"""Lo que comparten fuentes-base.py y generar-base.py: las bases
(src/data/bases.json) y las cuatro vistas del mapa de su tarjeta."""
import json
import math
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(AQUI, "..", "src", "data", "bases.json")) as fh:
    BASES = {k: v for k, v in json.load(fh).items() if not k.startswith("_")}

# El mapa: 600 x 400 px, en la tarjeta a 300 x 200 px CSS (un píxel del
# dibujo por píxel de una pantalla retina). Las vistas, por lo que mide de
# ancho (km).
ANCHO, ALTO = 600, 400
KMS = (10, 18, 40, 90)


def vista(km):
    """px por grado de latitud, margen (grados, para que la mezcla de biomas
    no se corte en el borde) y paso del sombreado del relieve (grados)."""
    return {"km": km, "ppd": ANCHO * 111.2 / km, "margen": km / 450, "dd": km / 25000}


def caja(base, v, margen=False):
    """(S, N, O, E) de la vista `v` centrada en la base, con o sin margen."""
    m = v["margen"] if margen else 0.0
    dlat = ALTO / v["ppd"] / 2 + m
    dlon = (ANCHO / v["ppd"] / 2 + m) / math.cos(math.radians(base["lat"]))
    return (base["lat"] - dlat, base["lat"] + dlat, base["lon"] - dlon, base["lon"] + dlon)
