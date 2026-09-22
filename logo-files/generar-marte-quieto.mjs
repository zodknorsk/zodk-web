// Marte quieto (public/marte/marte-quieto.png): la vista inicial de /marte
// (VISTA_INICIAL de marte-gl.js: lat0 12,5°, lon0 -80°; zoom x1) en píxeles
// de arte, 450 x 450 con el disco centrado (radio RADIUS = 219,4) y
// transparente alrededor.
// Lo usan el vuelo de la portada a /marte (la imagen que crece desde el Marte
// pequeño) y /marte mientras carga el lienzo (fondo de .marte-disco), así que
// tiene que ser exactamente lo que pinta el motor: se ejecuta
// src/scripts/marte.js tal cual en Node, con un canvas simulado (como
// prototipo-marte/probar-en-node.mjs), con un píxel de arte = un píxel de
// imagen y el disco en el centro de un lienzo par (como marte-gl.js).
// Rehacerlo cada vez que cambien los datos de Marte (generar-marte.py
// --canvas) y subir MARTE_V en marte.js:
//   node logo-files/generar-marte-quieto.mjs
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SALIDA = path.join(REPO, "public/marte/marte-quieto.png");
const LADO = 450;

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

// --- simulación mínima del navegador (lo que usa marte.js)
const lienzos = [];
class Ctx {
  constructor(cv) { this.cv = cv; this.img = null; }
  drawImage(src) { if (src.data) this.img = src; }
  getImageData() { return this.img; }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData(img) { this.cv.puesto = img; }
}
class Canvas {
  constructor() { this.width = 300; this.height = 150; this.style = {}; this._ctx = new Ctx(this); lienzos.push(this); }
  getContext() { return this._ctx; }
}
globalThis.document = { createElement: () => new Canvas() };
globalThis.window = { devicePixelRatio: 1, innerHeight: LADO };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.createImageBitmap = async (blob) => decodePNG(Buffer.from(await blob.arrayBuffer()));
globalThis.fetch = async (url) => {
  const b = fs.readFileSync(path.join(REPO, "public", url.split("?")[0]));
  return { json: async () => JSON.parse(b), blob: async () => new Blob([b]) };
};

const { montarMarte } = await import(path.join(REPO, "src/scripts/marte.js"));
const { VISTA_INICIAL } = await import(path.join(REPO, "src/scripts/marte-gl.js"));
const D = JSON.parse(fs.readFileSync(path.join(REPO, "public/marte/marte-datos.json")));
const cv = new Canvas();
cv.parentElement = { getBoundingClientRect: () => ({ width: LADO, height: LADO }) };
// disco = 2·RADIUS: un píxel de arte por píxel de imagen
const m = await montarMarte(cv, { base: "/marte/", ...VISTA_INICIAL, disco: () => 2 * D.RADIUS });
await new Promise((r) => setTimeout(r, 50));
const img = lienzos.find((c) => c !== cv && c.puesto).puesto;
if (img.width !== LADO || img.height !== LADO) throw new Error(`lienzo de ${img.width} x ${img.height}`);
fs.writeFileSync(SALIDA, encodePNG(img.width, img.height, img.data));
m.desmontar();
console.log("->", path.relative(REPO, SALIDA), `${img.width} x ${img.height}`);
