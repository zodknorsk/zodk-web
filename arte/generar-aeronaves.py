#!/usr/bin/env python3
"""Aeronaves y satélites del hero de zodk.eu, en pixel art.

Cada nave = un MAPA ASCII (1 carácter = 1 celda) + opcionalmente unos DISCOS
que se dibujan encima (radomos, hélices, platos). Se rasteriza a un SVG por
tema (día / noche), con el estilo del dron original: sombreado de arriba (claro)
a abajo (oscuro), contorno navy de 1 px y, de noche, luces de posición.

    python3 generar-aeronaves.py        # -> ../public/zodk-<id>[-noche].svg

Las dimensiones (viewBox) que imprime al final van a src/data/aeronaves.ts.
Hoy solo queda el Sentinel-2: las demás naves del hero son fotos.

Leyenda:
    .  vacío        #  casco claro     o  casco medio     x  casco oscuro
    =  panel claro  -  panel oscuro    d  radomo/disco    c  cristal/óptica
    b  hélice       *  acento (magenta de día, se apaga de noche)
"""
import math
import os

DIA = {
    "#": "#eef2f6", "o": "#c6cfd7", "x": "#8a94a0", "X": "#6c7681",
    "=": "#dde3e8", "-": "#aab3bb", "d": "#e6ebef", "+": "#ffffff",
    "c": "#243449", "b": "#f4f7fa", "*": "#e91e8c",
    "ring": "#0f1c30",
}
NOCHE = {
    "#": "#5e6874", "o": "#4a5560", "x": "#38414d", "X": "#2b333d",
    "=": "#545e6a", "-": "#3e4754", "d": "#616b77", "+": "#7f8a97",
    "c": "#131c28", "b": "#727d8a", "*": "#5e6874",
    "ring": "#050a12",
}

NAV_NOSE, NAV_RIGHT, NAV_LEFT = "#ffd23c", "#33dd66", "#ff3b30"

# --------------------------------------------------------------- definiciones
# Morro / frente SIEMPRE a la izquierda. 1 celda de margen para el contorno.
CRAFT = {}

# Sentinel-2 (Copernicus / ESA) — colores reales: cuerpo forrado en aislante
# multicapa DORADO (con arrugas: brillos y sombras), y un ala solar larga de
# células AZULES ditheradas (dos tonos alternos + destellos) sobre su yugo.
# Abajo, la óptica del instrumento MSI (negra).
#   Glifos:  # o x  dorado claro/medio/sombra   H brillo dorado
#            = -     célula azul A / B (dither)  | junta rejilla   + destello
#            y       yugo (dorado oscuro)        c óptica / negro
CRAFT["sat-sentinel"] = dict(
    dp=4, label="Sentinel-2",
    pal_d={
        "H": "#f6e2a8", "#": "#d9b060", "o": "#b08a41", "x": "#775824",
        "y": "#5a451e",
        "=": "#41528f", "-": "#1e2850", "+": "#cdd8f2", "|": "#0d1430",
        "c": "#131319", "ring": "#0c1526",
    },
    pal_n={
        "H": "#877655", "#": "#6a5837", "o": "#544629", "x": "#3a3120",
        "y": "#2f2716",
        "=": "#303a66", "-": "#181f3a", "+": "#6b789e", "|": "#0a1020",
        "c": "#0f1016", "ring": "#050a12",
    },
    art="""
..............................................
.....HHH######HHH..............................
....H############H.............................
....#HHHHHHHHHHHH#.............................
....#oooooooooooo#.............................
....#xxxxxxxxxxxx#..-==|--|+=|--|==|--|=+|--|==|-.
....#oooooooooooo#y.-=+|--|==|-+|==|--|==|--|+=|-.
....#HHHHHHHHHHHH#y.-==|-+|==|--|=+|--|+=|--|==|-.
....#oooooooooooo#y.-+=|--|==|--|==|-+|==|--|==|-.
....#xxxxxxxxxxxx#y.-==|--|+=|--|==|--|==|-+|==|-.
....#oooooooooooo#y.-==|-+|==|--|=+|--|==|--|+=|-.
....#HHHHHHHHHHHH#y.-+=|--|==|-+|==|--|+=|--|==|-.
....#oooooooooooo#y.-==|--|==|--|==|--|==|--|==|-.
....H############H.-==|--|+=|--|==|--|=+|--|==|-.
.....xx######xx................................
......#oooo#...................................
......#cccc#...................................
......#cccc#...................................
......occco....................................
.......oooo....................................
.......xoox....................................
..............................................
""",
    discs=[], nav=dict(nose=None, right=None, left=None))


# --------------------------------------------------------------------- render
def _grid(art):
    lines = art.strip("\n").splitlines()
    w = max(len(ln) for ln in lines)
    return [list(ln.ljust(w)) for ln in lines], w, len(lines)


def craft_svg(cid, night):
    spec = CRAFT[cid]
    pal = {**(NOCHE if night else DIA),
           **spec.get("pal_n" if night else "pal_d", {})}
    dp = spec["dp"]
    rows, w, h = _grid(spec["art"])

    for cx, cy, r, ch in spec.get("discs", []):
        for r_ in range(h):
            for c_ in range(w):
                if (c_ - cx) ** 2 + (r_ - cy) ** 2 <= r * r:
                    rows[r_][c_] = ch

    cells = {}
    for r, line in enumerate(rows):
        for c, ch in enumerate(line):
            if ch in pal and ch != "ring":
                cells[(c, r)] = pal[ch]

    if night:
        for key, col in (("nose", NAV_NOSE), ("right", NAV_RIGHT), ("left", NAV_LEFT)):
            p = spec.get("nav", {}).get(key)
            if p and tuple(p) in cells:
                cells[tuple(p)] = col

    ring = {}
    for (c, r) in cells:
        for dc in (-1, 0, 1):
            for dr in (-1, 0, 1):
                if (c + dc, r + dr) not in cells:
                    ring[(c + dc, r + dr)] = pal["ring"]

    vw, vh = (w + 2) * dp, (h + 2) * dp
    rects = "".join(
        f'<rect x="{(c + 1) * dp}" y="{(r + 1) * dp}" width="{dp}" height="{dp}" fill="{col}"/>'
        for (c, r), col in list(ring.items()) + list(cells.items())
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" '
            f'width="{vw}" height="{vh}" shape-rendering="crispEdges" '
            f'role="img" aria-label="{spec["label"]}">{rects}</svg>\n'), vw, vh


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "public")
    for cid in CRAFT:
        svg_d, vw, vh = craft_svg(cid, False)
        svg_n, _, _ = craft_svg(cid, True)
        open(os.path.join(out, f"zodk-{cid}.svg"), "w").write(svg_d)
        open(os.path.join(out, f"zodk-{cid}-noche.svg"), "w").write(svg_n)
        print(f"{cid:16} {vw:3} x {vh:3}")
