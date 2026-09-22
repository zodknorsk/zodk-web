// Tierra pequeña de /marte (public/zodk-tierra.png y zodk-tierra-noche.png):
// la Tierra de la portada (public/planeta/planeta-quieto*.png, un disco de
// radio 292,5 en 600 x 585, de generar-planeta-hero.py) reducida a un icono
// como el Marte pequeño (generar-marte.py --icono): lienzo de 56 px de arte,
// que el CSS amplía x3, disco de radio 12 con borde seco y halo en tres
// escalones, aquí azulado como el de la luna. Cada píxel del icono es la media
// de los de la Tierra grande que caen en él. En /marte se pulsa para volver a
// la Tierra (usuario, 22-sep-2026). Rehacerlo si cambia la Tierra:
//   node logo-files/generar-tierra-icono.mjs
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const N = 56, R = 12;                        // como el Marte pequeño
const CX = 300, CY = 292.5, RT = 292.5;      // el disco en planeta-quieto.png
const HALO = [0xa9, 0xc8, 0xff];

function decodePNG(buf) {
  let o = 8, w, h, ct, idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString("ascii", o + 4, o + 8);
    const d = buf.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8) throw new Error("bits"); }
    if (type === "IDAT") idat.push(d);
    o += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : 0;
  if (!bpp) throw new Error("ct " + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp, out = new Uint8ClampedArray(w * h * 4);
  let prev = new Uint8Array(stride), p = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[p++], line = new Uint8Array(stride);
    for (let x = 0; x < stride; x++) {
      const r = raw[p++], a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v;
      if (ft === 0) v = r; else if (ft === 1) v = r + a; else if (ft === 2) v = r + b;
      else if (ft === 3) v = r + ((a + b) >> 1);
      else { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      line[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const q = (y * w + x) * 4;
      if (bpp === 4) { out[q] = line[x * 4]; out[q + 1] = line[x * 4 + 1]; out[q + 2] = line[x * 4 + 2]; out[q + 3] = line[x * 4 + 3]; }
      else if (bpp === 3) { out[q] = line[x * 3]; out[q + 1] = line[x * 3 + 1]; out[q + 2] = line[x * 3 + 2]; out[q + 3] = 255; }
      else { out[q] = out[q + 1] = out[q + 2] = line[x]; out[q + 3] = 255; }
    }
    prev = line;
  }
  return { width: w, height: h, data: out };
}

function encodePNG(w, h, rgba) {
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

function icono(src) {
  const { width: w, data } = decodePNG(fs.readFileSync(path.join(REPO, "public/planeta", src)));
  const k = RT / R, c = N / 2, px = new Uint8ClampedArray(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const q = (y * N + x) * 4, d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      if (d <= R) {
        // media de la Tierra grande bajo este píxel (solo lo que es disco)
        let r = 0, g = 0, b = 0, n = 0;
        const x0 = CX + (x - c) * k, y0 = CY + (y - c) * k;
        for (let sy = Math.floor(y0); sy < Math.ceil(y0 + k); sy++) {
          for (let sx = Math.floor(x0); sx < Math.ceil(x0 + k); sx++) {
            if (sx < 0 || sy < 0 || sx >= w || Math.hypot(sx + 0.5 - CX, sy + 0.5 - CY) > RT) continue;
            const o = (sy * w + sx) * 4, a = data[o + 3] / 255;
            r += data[o] * a; g += data[o + 1] * a; b += data[o + 2] * a; n += a;
          }
        }
        if (n > 0) { px[q] = r / n; px[q + 1] = g / n; px[q + 2] = b / n; px[q + 3] = 255; }
      } else {
        const a = d <= R + 2 ? 60 : d <= R + 4 ? 26 : d <= R + 7 ? 10 : 0;
        if (a) { px[q] = HALO[0]; px[q + 1] = HALO[1]; px[q + 2] = HALO[2]; px[q + 3] = a; }
      }
    }
  }
  return px;
}

for (const [src, dst] of [["planeta-quieto.png", "zodk-tierra.png"], ["planeta-quieto-noche.png", "zodk-tierra-noche.png"]]) {
  fs.writeFileSync(path.join(REPO, "public", dst), encodePNG(N, N, icono(src)));
  console.log("->", `public/${dst}`);
}
