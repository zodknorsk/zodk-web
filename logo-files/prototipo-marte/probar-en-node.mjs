// Prueba sin navegador de src/scripts/marte.js (para cuando no hay Chrome a
// mano): simula canvas, fetch y createImageBitmap, ejecuta el motor tal cual y
// guarda el lienzo de arte en PNG, en una ventana de 1512 x 945 con el disco a
// 60 svh. Saca varias vistas (Tharsis, Syrtis, los dos polos, la cara de
// atrás) y dos fotogramas a mitad de arrastre, y mide los ms por fotograma
// (Node usa el mismo motor de JavaScript que Chrome).
//   node logo-files/prototipo-marte/probar-en-node.mjs carpeta-de-salida/
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.resolve(process.argv[2] || ".");
fs.mkdirSync(OUT, { recursive: true });

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
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// --- simulación mínima del navegador
const lienzos = [];
class Ctx {
  constructor(cv) { this.cv = cv; this.img = null; }
  drawImage(src) { if (src.data) this.img = src; }
  getImageData(x, y, w, h) { return this.img; }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData(img) { this.cv.puesto = img; }
}
class Canvas {
  constructor() { this.width = 300; this.height = 150; this.style = {}; this._ctx = new Ctx(this); lienzos.push(this); }
  getContext() { return this._ctx; }
}
globalThis.document = { createElement: () => new Canvas() };
globalThis.window = { devicePixelRatio: 2, innerHeight: 945 };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.createImageBitmap = async (blob) => decodePNG(Buffer.from(await blob.arrayBuffer()));
globalThis.fetch = async (url) => {
  const f = path.join(REPO, url.split("?")[0].replace(/^\.\.\/\.\.\//, ""));
  const b = fs.readFileSync(f);
  return { json: async () => JSON.parse(b), blob: async () => new Blob([b]) };
};

const { montarMarte } = await import(path.join(REPO, "src/scripts/marte.js"));
const cv = new Canvas();
cv.parentElement = { getBoundingClientRect: () => ({ width: 1512, height: 945 }) };
const tiempos = [];
const m = await montarMarte(cv, {
  base: "../../public/marte/", lat0: 10, lon0: -80,
  disco: () => 0.6 * 945,
  alPintar: (ms, limpio) => tiempos.push([ms, limpio]),
});
const fuente = lienzos.find((c) => c !== cv && c.puesto);
const guarda = (nombre) => {
  const img = fuente.puesto;
  fs.writeFileSync(path.join(OUT, nombre), encodePNG(img.width, img.height, img.data));
  console.log(nombre, img.width, "x", img.height, "lienzo visible", cv.width, "x", cv.height, cv.style.width, cv.style.height);
};
guarda("m-tharsis.png");
const espera = () => new Promise((r) => setTimeout(r, 30));
for (const [n, la, lo] of [["m-syrtis.png", 10, 105], ["m-norte.png", 90, -80], ["m-sur.png", -90, -80], ["m-lado.png", 0, 180]]) {
  m.ponVista(la, lo);
  await espera();
  guarda(n);
}
// arrastre: a los lados y hacia abajo, fotograma sucio
m.ponVista(10, -80); await espera();
m.mueve(-120, 0); await espera();
guarda("m-arrastre-lado.png");
m.mueve(0, 150); await espera();
guarda("m-arrastre-abajo.png");
m.suelta(); await espera();
console.log("vista", m.vista());
for (let i = 0; i < 6; i++) m.medir();
const r = [];
for (let i = 0; i < 5; i++) r.push(m.medir());
console.log("ms inclinando", r.map((x) => x.conTablas.toFixed(1)).join(" "), "| a los lados", r.map((x) => x.soloLon.toFixed(1)).join(" "));
m.desmontar();
