#!/usr/bin/env python3
"""Una sola imagen para elegir la vista de una base (/nuevabase, paso 4):
cuatro filas (10, 18, 40 y 90 km), a la izquierda con NE y a la derecha sin
NE (con --seco, una tercera columna). Con la marca y los nombres como en la
web. Genera las variantes (las pruebas de public/bases/prueba/ quedan con
la última) y deja la imagen en ~/Downloads/bases/<slug>.png.

    python3 comparar-base.py <slug> [--seco]
"""
import json, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

if len(sys.argv) < 2:
    sys.exit("uso: comparar-base.py <slug> [--seco]")
SLUG = sys.argv[1]
SECO = "--seco" in sys.argv
AQUI = os.path.dirname(os.path.abspath(__file__))
PRUEBA = os.path.join(AQUI, "..", "public", "bases", "prueba")
KMS = (10, 18, 40, 90)
VARIANTES = [("con NE", []), ("sin NE", ["--sin-ne"])]
if SECO:
    VARIANTES.append(("--seco", ["--seco"]))

# Las variantes, cada una a su carpeta.
copias = {}
for etiqueta, extra in VARIANTES:
    subprocess.run([sys.executable, os.path.join(AQUI, "generar-base.py"), SLUG] + extra, check=True)
    d = os.path.join(AQUI, "bases-fuentes", f"_cmp-{len(copias)}")
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(PRUEBA, d)
    copias[etiqueta] = d


def fuente(estilo, px):
    pruebas = {
        "n": [("/System/Library/Fonts/Menlo.ttc", 0), ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 0)],
        "b": [("/System/Library/Fonts/Menlo.ttc", 1), ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 0)],
        "i": [("/System/Library/Fonts/Menlo.ttc", 2), ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Oblique.ttf", 0)],
    }[estilo]
    for ruta, idx in pruebas:
        if os.path.exists(ruta):
            return ImageFont.truetype(ruta, px, index=idx)
    return ImageFont.load_default()


F_CIU, F_PUE, F_ACC, F_REG = fuente("b", 22), fuente("n", 20), fuente("i", 20), fuente("n", 18)
F_TIT = fuente("n", 30)
MARCA = ["..XXXXX..", ".XOOOOOX.", "XOOWWWOOX", "XOOWWWOOX", "XOOWWWOOX", ".XOOOOOX.", "..XOOOX..", "...XOX...", "....X..."]
COL = {"X": (20, 20, 24), "O": (212, 35, 28), "W": (242, 242, 239)}


def contorno(dr, xy, texto, f, color, sp=0):
    x, y = xy
    for dx in (-2, 0, 2):
        for dy in (-2, 0, 2):
            if dx or dy:
                letras(dr, (x + dx, y + dy), texto, f, (5, 6, 10), sp)
    letras(dr, (x, y), texto, f, color, sp)


def letras(dr, xy, texto, f, color, sp):
    x, y = xy
    for ch in texto:
        dr.text((x, y), ch, font=f, fill=color)
        x += f.getlength(ch) + sp


def vista(carpeta, km):
    im = Image.open(os.path.join(carpeta, f"{SLUG}-{km}.png")).convert("RGB")
    dr = ImageDraw.Draw(im)
    for n in json.load(open(os.path.join(carpeta, f"{SLUG}-{km}.json")))["nombres"]:
        x, y, c, t = n["x"] * 2, n["y"] * 2, n["clase"], n["nombre"]
        if c in ("ciudad", "pueblo"):
            f = F_CIU if c == "ciudad" else F_PUE
            col = (238, 241, 244) if c == "ciudad" else (228, 231, 234)
            dr.rectangle([x + 1, y + 9, x + 9, y + 17], fill=(5, 6, 10))
            dr.rectangle([x + 3, y + 11, x + 7, y + 15], fill=(238, 241, 244))
            contorno(dr, (x + 18, y), t, f, col)
        elif c == "accidente":
            contorno(dr, (x, y), t, F_ACC, (243, 234, 211), 1.2)
        else:
            contorno(dr, (x, y), t.upper(), F_REG, (243, 234, 211), 4)
    for j, fila in enumerate(MARCA):
        for i, k in enumerate(fila):
            if k != ".":
                dr.rectangle([282 + i * 4, 164 + j * 4, 285 + i * 4, 167 + j * 4], fill=COL[k])
    return con_borde(im)


def con_borde(im):
    o = Image.new("RGB", (im.width + 8, im.height + 8), (20, 20, 24))
    o.paste(im, (4, 4))
    return o


ncol = len(VARIANTES)
W, H, M, TOP = 608, 408, 30, 100
ancho = M + ncol * (W + M)
alto = TOP + len(KMS) * (H + 60)
lienzo = Image.new("RGB", (ancho, alto), (255, 255, 255))
dr = ImageDraw.Draw(lienzo)
dr.text((M, 28), f"{SLUG}: " + "  |  ".join(e for e, _ in VARIANTES), font=F_TIT, fill=(40, 40, 40))
for r, km in enumerate(KMS):
    y = TOP + r * (H + 60)
    for c, (etiqueta, _) in enumerate(VARIANTES):
        x = M + c * (W + M)
        dr.text((x, y), f"{km} km - {etiqueta}", font=F_TIT, fill=(60, 60, 60))
        lienzo.paste(vista(copias[etiqueta], km), (x, y + 44))

for d in copias.values():
    shutil.rmtree(d, ignore_errors=True)
sal = os.path.expanduser("~/Downloads/bases")
os.makedirs(sal, exist_ok=True)
sal = os.path.join(sal, f"{SLUG}.png")
lienzo.save(sal)
print(sal)
