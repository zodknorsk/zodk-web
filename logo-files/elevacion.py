#!/usr/bin/env python3
"""Elevacion global (ETOPO1, NOAA, dominio publico) -> modulo elev.py para el
hillshade del planeta.

Descargar a este directorio (GeoTIFF float32, 1440x720, ~4.7 MB):
  curl -sSLo etopo.tiff \\
    "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/ETOPO1_ice_surface/ImageServer/exportImage?bbox=-180,-90,180,90&bboxSR=4326&imageSR=4326&size=1440,720&format=tiff&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image"

Uso:  python3 elevacion.py     # escribe elev.py
Solo hace falta si cambias la resolucion de salida; para el planeta basta con
elev.py, que ya esta generado.
"""
import struct, array, zlib, base64

OUT_W, OUT_H = 720, 360        # 0.5 grados; suficiente para un globo de ~280 px


def read_tiff_f32(path):
    d = open(path, "rb").read()
    en = "<" if d[:2] == b"II" else ">"
    off = struct.unpack(en + "I", d[4:8])[0]
    n = struct.unpack(en + "H", d[off:off + 2])[0]
    tags = {}
    for i in range(n):
        e = d[off + 2 + i * 12: off + 2 + i * 12 + 12]
        tag, typ, cnt = struct.unpack(en + "HHI", e[:8])
        tags[tag] = (typ, cnt, e[8:12])

    def vals(tag):
        typ, cnt, v = tags[tag]
        ts = {2: 1, 3: 2, 4: 4, 12: 8}[typ]
        tot = ts * cnt
        raw = v[:tot] if tot <= 4 else d[struct.unpack(en + "I", v)[0]:][:tot]
        fm = {2: "B", 3: "H", 4: "I", 12: "d"}[typ]
        return list(struct.unpack(en + fm * cnt, raw))

    W, H = vals(256)[0], vals(257)[0]
    TW, TH = vals(322)[0], vals(323)[0]              # tiled
    tofs, tbc = vals(324), vals(325)
    tx = (W + TW - 1) // TW
    grid = array.array("f", [0.0]) * (W * H)
    for ti in range(len(tofs)):
        a = array.array("f")
        a.frombytes(d[tofs[ti]:tofs[ti] + tbc[ti]][:TW * TH * 4])
        if en == ">":
            a.byteswap()
        tcx, tcy = ti % tx, ti // tx
        for r in range(TH):
            gy = tcy * TH + r
            if gy >= H:
                break
            w = min(TW, W - tcx * TW)
            grid[gy * W + tcx * TW: gy * W + tcx * TW + w] = a[r * TW: r * TW + w]
    return W, H, grid


def main():
    W, H, g = read_tiff_f32("etopo.tiff")
    sx, sy = W // OUT_W, H // OUT_H
    out = array.array("h", [0]) * (OUT_W * OUT_H)
    for r in range(OUT_H):
        for c in range(OUT_W):
            acc = 0.0
            for dr in range(sy):
                base = (r * sy + dr) * W + c * sx
                for dc in range(sx):
                    acc += g[base + dc]
            v = acc / (sx * sy)
            out[r * OUT_W + c] = int(max(-11000, min(9000, round(v))))
    blob = base64.b64encode(zlib.compress(out.tobytes(), 9)).decode()
    with open("elev.py", "w") as fh:
        fh.write('"""Elevacion (m) 0.5 grados, generada de etopo.tiff por elevacion.py.\n')
        fh.write('No editar a mano."""\n')
        fh.write("import array, zlib, base64\n")
        fh.write(f"W, H = {OUT_W}, {OUT_H}\n")
        fh.write(f"_b = '{blob}'\n")
        fh.write("ELEV = array.array('h'); ELEV.frombytes(zlib.decompress(base64.b64decode(_b)))\n\n")
        fh.write("def elev(lat, lon):\n")
        fh.write("    r = int((90.0 - lat) / 180.0 * H)\n")
        fh.write("    r = 0 if r < 0 else H - 1 if r >= H else r\n")
        fh.write("    c = int((lon + 180.0) / 360.0 * W) % W\n")
        fh.write("    return ELEV[r * W + c]\n")
    import os
    print(f"elev.py: {OUT_W}x{OUT_H}, {os.path.getsize('elev.py')} bytes")


if __name__ == "__main__":
    main()
