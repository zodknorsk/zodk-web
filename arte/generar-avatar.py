"""Fotogramas del avatar que se mueve (src/scripts/avatar.js), sacados del
primer fotograma de public/zodk-avatar.gif, que no se toca.

El GIF es pixel art de 24 x 26 a 8 px por píxel. Aquí se lee a 1 px por
píxel de arte y se cambian solo unos píxeles (ojos, cabeza, pantalla):

  public/zodk-avatar-tira.png   los fotogramas en fila (FOTOGRAMAS, en ese orden)
  public/zodk-avatar-nota.png   la nota musical que sale de los auriculares
  public/zodk-avatar-z.png      la "z" de cuando se duerme

Solo con la biblioteca estándar de Python:
  python3 arte/generar-avatar.py
"""
import os
import struct
import zlib

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GIF = os.path.join(REPO, "public/zodk-avatar.gif")
ESCALA = 8                        # px del GIF por píxel de arte
OJOS = ((12, 9), (12, 14))        # (fila, columna) de arriba de cada ojo; miden 1 x 2
PANTALLA = ((21, 11), (21, 12), (22, 11), (22, 12))   # el cuadrito blanco del portátil
FOTOGRAMAS = ["frente", "izquierda", "derecha", "arriba", "abajo", "cerrados",
              "guino", "tecleando", "cabeceo"]


def lee_gif(ruta):
    """Primer fotograma del GIF como filas de tuplas RGB."""
    d = open(ruta, "rb").read()
    ancho, alto, banderas = struct.unpack("<HHB", d[6:11])
    o = 13
    paleta = []
    if banderas & 0x80:
        n = 2 << (banderas & 7)
        paleta = [tuple(d[o + 3 * i:o + 3 * i + 3]) for i in range(n)]
        o += 3 * n
    while d[o] != 0x2C:           # extensiones hasta el primer fotograma
        o += 2
        while d[o]:
            o += d[o] + 1
        o += 1
    x0, y0, w, h, b = struct.unpack("<HHHHB", d[o + 1:o + 10])
    o += 10
    if b & 0x80:
        n = 2 << (b & 7)
        paleta = [tuple(d[o + 3 * i:o + 3 * i + 3]) for i in range(n)]
        o += 3 * n
    minimo = d[o]
    o += 1
    datos = bytearray()
    while d[o]:
        datos += d[o + 1:o + 1 + d[o]]
        o += d[o] + 1
    indices = lzw(datos, minimo)
    assert (x0, y0, w, h) == (0, 0, ancho, alto) and not b & 0x40
    return [[paleta[indices[y * w + x]] for x in range(w)] for y in range(h)]


def lzw(datos, minimo):
    limpiar, fin = 1 << minimo, (1 << minimo) + 1
    tam, tabla, prev, salida = minimo + 1, None, None, []
    bits = nbits = 0
    i = 0
    while True:
        while nbits < tam:
            if i >= len(datos):
                return salida
            bits |= datos[i] << nbits
            nbits += 8
            i += 1
        cod = bits & ((1 << tam) - 1)
        bits >>= tam
        nbits -= tam
        if cod == limpiar:
            tabla = [[k] for k in range(limpiar)] + [None, None]
            tam, prev = minimo + 1, None
            continue
        if cod == fin:
            return salida
        if prev is None:
            ent = tabla[cod]
        elif cod < len(tabla):
            ent = tabla[cod]
            tabla.append(prev + [ent[0]])
        else:
            ent = prev + [prev[0]]
            tabla.append(ent)
        salida += ent
        prev = ent
        if len(tabla) == (1 << tam) and tam < 12:
            tam += 1


def guarda_png(ruta, filas):
    """Filas de tuplas RGBA a PNG."""
    alto, ancho = len(filas), len(filas[0])
    crudo = b"".join(b"\0" + bytes(c for p in f for c in p) for f in filas)
    def trozo(tipo, datos):
        return struct.pack(">I", len(datos)) + tipo + datos + struct.pack(">I", zlib.crc32(tipo + datos))
    png = (b"\x89PNG\r\n\x1a\n" + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 6, 0, 0, 0))
           + trozo(b"IDAT", zlib.compress(crudo, 9)) + trozo(b"IEND", b""))
    open(ruta, "wb").write(png)
    print("->", os.path.relpath(ruta, REPO))


def main():
    gif = lee_gif(GIF)
    base = [[gif[y * ESCALA][x * ESCALA] + (255,) for x in range(len(gif[0]) // ESCALA)]
            for y in range(len(gif) // ESCALA)]
    piel = base[11][8]
    tinta = base[OJOS[0][0]][OJOS[0][1]]
    gris = base[20][10]

    def copia():
        return [f[:] for f in base]

    def ojos(m, df, dc, cerrados=(False, False)):
        for (f, c) in OJOS:
            m[f][c] = m[f + 1][c] = piel
        for (f, c), cerrado in zip(OJOS, cerrados):
            if not cerrado:
                m[f + df][c + dc] = tinta
            m[f + 1 + df][c + dc] = tinta
        return m

    def cabeza_abajo(m):
        # la cabeza (filas 2-15) baja 1 px y tapa el cuello; el cuerpo, quieto
        n = [f[:] for f in m]
        for y in range(16, 2, -1):
            n[y] = m[y - 1][:]
        n[2] = m[0][:]
        return n

    tecleando = ojos(copia(), 1, 0)
    for f, c in PANTALLA:
        tecleando[f][c] = gris
    fotos = {
        "frente": copia(),
        "izquierda": ojos(copia(), 0, -1),
        "derecha": ojos(copia(), 0, 1),
        "arriba": ojos(copia(), -1, 0),
        "abajo": ojos(copia(), 1, 0),
        "cerrados": ojos(copia(), 0, 0, (True, True)),
        "guino": ojos(copia(), 0, 0, (False, True)),
        "tecleando": tecleando,
        "cabeceo": cabeza_abajo(ojos(copia(), 0, 0, (True, True))),
    }
    tira = [sum((fotos[n][y] for n in FOTOGRAMAS), []) for y in range(len(base))]
    guarda_png(os.path.join(REPO, "public/zodk-avatar-tira.png"), tira)

    blanco, nada = (0xF2, 0xF4, 0xF7, 255), (0, 0, 0, 0)
    def glifo(dibujo):
        return [[blanco if ch == "#" else nada for ch in fila] for fila in dibujo]
    guarda_png(os.path.join(REPO, "public/zodk-avatar-nota.png"), glifo([
        "..#..",
        "..##.",
        "..#.#",
        "..#..",
        "###..",
        "###..",
    ]))
    guarda_png(os.path.join(REPO, "public/zodk-avatar-z.png"), glifo([
        "####",
        "..#.",
        ".#..",
        "####",
    ]))


if __name__ == "__main__":
    main()
