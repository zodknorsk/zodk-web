"""Escritor mínimo de PNG indexado (paleta, 8 bits) en Python estándar.
Suficiente para el pixel art del planeta: pocos colores, se comprime muy bien."""
import struct
import zlib


def _chunk(typ, data):
    return (struct.pack(">I", len(data)) + typ + data +
            struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF))


def write_indexed(path, width, height, rows, palette):
    """rows: iterable de `height` secuencias de `width` índices de paleta.
    palette: lista de (r, g, b) o (r, g, b, a). Las entradas con alfa < 255
    deben ir al principio para que tRNS quede compacto."""
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 3, 0, 0, 0)  # tipo 3 = indexado
    plte = b"".join(struct.pack(">BBB", c[0], c[1], c[2]) for c in palette)
    alphas = [c[3] for c in palette if len(c) > 3]
    raw = bytearray()
    for row in rows:
        raw.append(0)                      # filtro: ninguno
        raw.extend(row)
    idat = zlib.compress(bytes(raw), 9)
    out = sig + _chunk(b"IHDR", ihdr) + _chunk(b"PLTE", plte)
    if alphas:
        out += _chunk(b"tRNS", bytes(alphas))
    out += _chunk(b"IDAT", idat) + _chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(out)


def write_rgba(path, width, height, rows):
    """rows: iterable de `height` secuencias de width*4 bytes (R,G,B,A por
    píxel). Sin paleta: para degradados que no caben en 256 colores."""
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)  # tipo 6 = RGBA
    raw = bytearray()
    for row in rows:
        raw.append(0)                      # filtro: ninguno
        raw.extend(row)
    idat = zlib.compress(bytes(raw), 9)
    out = (sig + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", idat) +
           _chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(out)
