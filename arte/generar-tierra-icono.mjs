// Tierra pequeña de /marte (public/zodk-tierra.png y zodk-tierra-noche.png):
// se pulsa para ir a la Tierra. Lienzo de 56 px de arte, que el CSS amplía ×3,
// disco de radio 12 con borde seco y halo, como el Marte pequeño
// (generar-marte.py --icono).
//
// Es la Tierra de la portada pintada con sus mismas cuentas (mapa de
// materiales, colores por escalón de luz, terminador, borde y, de noche, las
// luces de las ciudades), a su misma escala (radio 288, 24 píxeles por cada
// uno del icono) y luego reducida a la media. La Tierra de la portada
// reducida sin más quedaba plana y artificial. Además:
//   - de pie, inclinada 12,5° al norte, como Marte en /marte (VISTA);
//   - con la luz de Marte: desde la izquierda, 40° de fase y 20° de subida
//     (FASE y SOL_ARR de generar-marte.py), así que tiene su lado en sombra.
//     De noche, esa luz es la de la luna (colores y suelo de la noche de la
//     portada), y con las luces encendidas: la web en modo oscuro aterriza en
//     la Tierra de noche de la portada y el vuelo no cambia de día a noche.
//   - halo solo por el lado de la luz, como la atmósfera de la portada.
// Rehacerlo si cambia la Tierra de la portada:
//   node arte/generar-tierra-icono.mjs
//   node arte/generar-tierra-icono.mjs --pruebas carpeta/   (caras y halos para comparar)
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const N = 56, R = 12, K = 24;                 // como el Marte pequeño; píxeles de la Tierra grande por cada uno
const VISTA = { lat0: 12.5, lon0: 15 };       // de pie; África y Europa en el lado con luz
const FASE = 40, SOL_ARR = 20;                // la luz de Marte (generar-marte.py)
// Halo: color, opacidad en tres escalones (r+2, r+4, r+7) y si va solo por el
// lado de la luz.
const HALOS = {
  suave: { color: [0x5e, 0x9b, 0xf0], alfa: [40, 16, 6], lado: false },
  atmosfera: { color: [0x6f, 0xa8, 0xff], alfa: [64, 24, 8], lado: true },
};
const HALO = HALOS.atmosfera;                 // la C

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

// --- la Tierra de la portada: mapa, colores, luz y luces
const P = path.join(REPO, "public/planeta");
const D = JSON.parse(fs.readFileSync(path.join(P, "planeta-datos.json")));
const mapa = decodePNG(fs.readFileSync(path.join(P, "planeta-mapa.png")));
const LUT = {
  dia: decodePNG(fs.readFileSync(path.join(P, "planeta-lut.png"))),
  noche: decodePNG(fs.readFileSync(path.join(P, "planeta-lut-noche.png"))),
};
const KMIN = D.LUT_KMIN * D.LIGHT_SUB, KN = D.LUT_KN;
const smooth = (e0, e1, x) => { let t = (x - e0) / (e1 - e0); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
const DEG = Math.PI / 180;
const sol = (() => {                                      // x derecha, y arriba, z hacia quien mira
  const f = FASE * DEG, a = SOL_ARR * DEG;
  const v = [-Math.sin(f) * Math.cos(a), Math.sin(f) * Math.sin(a), Math.cos(f)];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();

// Luces de las ciudades (planeta-luces.png).
const luces = (() => {
  const png = decodePNG(fs.readFileSync(path.join(P, "planeta-luces.png"))), d = png.data, lw = D.LUZ_PNG_W, out = [];
  for (let i = 0; i < D.LUCES_N; i++) {
    const o = (((i / lw) | 0) * lw * 2 + (i % lw) * 2) * 4;
    out.push([((d[o] << 8) | d[o + 1]) * 180 / 65535 - 90, ((d[o + 4] << 8) | d[o + 5]) * 360 / 65535 - 180, d[o + 2] / 16]);
  }
  return out;
})();

// La Tierra grande, de día o de noche, a la escala de la portada: RGBA de
// (N·K)², con el disco de radio R·K en medio.
function tierraGrande({ lat0, lon0 }, noche) {
  const L = N * K, RG = R * K, c = L / 2, lut = noche ? LUT.noche : LUT.dia, suelo = noche ? D.N_NIGHT : D.NIGHT;
  const sl = Math.sin(lat0 * DEG), cl = Math.cos(lat0 * DEG);
  const px = new Uint8ClampedArray(L * L * 4);
  for (let py = 0; py < L; py++) {
    for (let pxx = 0; pxx < L; pxx++) {
      const x = (pxx + 0.5 - c) / RG, y = -(py + 0.5 - c) / RG, rr = x * x + y * y;
      if (rr >= 1) continue;
      const z = Math.sqrt(1 - rr), dc = Math.sqrt(rr);
      const lat = Math.asin(Math.max(-1, Math.min(1, y * cl + z * sl))) / DEG;
      const lon = lon0 + Math.atan2(x, -y * sl + z * cl) / DEG;
      let r = Math.floor((90 - lat) / 180 * D.MH);
      r = Math.max(0, Math.min(D.MH - 1, r));
      const col = Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * D.MW);
      const o = (r * D.MW + col) * 4;
      const m = mapa.data[o] | (mapa.data[o + 1] << 8), hielo = mapa.data[o + 2] > 0;
      const lam = x * sol[0] + y * sol[1] + z * sol[2];
      const bright = (suelo + (1 - suelo) * smooth(D.TERM_A, D.TERM_B, lam)) * (1 - D.LIMB_K * smooth(0.72, 1, dc) * (hielo ? 0.7 : 1));
      const k = Math.floor(Math.log(Math.max(bright, 1e-3)) / D.LNSTEP * D.LIGHT_SUB + 0.5);
      const q = (m * KN + Math.max(0, Math.min(KN - 1, k - KMIN))) * 4, p = (py * L + pxx) * 4;
      px[p] = lut.data[q]; px[p + 1] = lut.data[q + 1]; px[p + 2] = lut.data[q + 2]; px[p + 3] = 255;
    }
  }
  if (noche) {
    // Luces: huella por ciudad, suma, pico y núcleos por píxel y de ahí el
    // nivel de ámbar, con las mismas reglas que la portada.
    const acc = new Float32Array(L * L), pico = new Float32Array(L * L), nuc = new Float32Array(L * L);
    const HUELLAS = [D.HUELLA, D.HUELLA_R2, D.HUELLA_GRANDE];
    const nivel = (v) => { let l = 0; while (l < D.LUZ_UMBRAL.length && v >= D.LUZ_UMBRAL[l]) l++; return l; };
    for (const [lat, lon, a0] of luces) {
      const s = Math.sin(lat * DEG), cla = Math.cos(lat * DEG), dl = (lon - lon0) * DEG;
      const x = cla * Math.sin(dl), yv = cla * Math.cos(dl);
      const y = s * cl - yv * sl, z = s * sl + yv * cl;          // inversa de la vista de arriba
      if (z <= 0.02) continue;
      let a = a0;
      if (z < 0.25) { const t = (z - 0.02) / 0.23; a *= t * t * (3 - 2 * t); }
      const X = Math.round(x * RG + c - 0.5), Y = Math.round(-y * RG + c - 0.5);
      const h = HUELLAS[a >= D.LUZ_CORE2 ? 2 : a >= D.LUZ_R2_MIN ? 1 : 0];
      for (const [dx, dy, w] of h) {
        const XX = X + dx, YY = Y + dy;
        if (XX < 0 || YY < 0 || XX >= L || YY >= L) continue;
        const p = YY * L + XX;
        if (w === 1) { acc[p] += a; nuc[p] += a; }
        else { const v = a * w; acc[p] += v; if (v > pico[p]) pico[p] = v; }
      }
    }
    for (let p = 0; p < L * L; p++) {
      if (!acc[p] || px[p * 4 + 3] === 0) continue;
      const lvl = Math.max(nivel(Math.max(pico[p], nuc[p])), Math.min(D.LUZ_SUMA_MAX, nivel(acc[p])));
      if (!lvl) continue;
      const [cc, t] = D.LUZ_RAMPA[lvl - 1];
      for (let j = 0; j < 3; j++) px[p * 4 + j] = px[p * 4 + j] + (cc[j] - px[p * 4 + j]) * t;
    }
  }
  return px;
}

// La Tierra grande reducida al icono (media de sus K x K píxeles) y el halo.
function icono(vista, noche, halo) {
  const big = tierraGrande(vista, noche), L = N * K;
  const px = new Uint8ClampedArray(N * N * 4), c = N / 2;
  const sx = sol[0], sy = -sol[1], sn = Math.hypot(sx, sy);   // la luz en pantalla (y hacia abajo)
  for (let py = 0; py < N; py++) {
    for (let pxx = 0; pxx < N; pxx++) {
      const q = (py * N + pxx) * 4, d = Math.hypot(pxx + 0.5 - c, py + 0.5 - c);
      if (d <= R) {
        let r = 0, g = 0, b = 0, n = 0;
        for (let j = 0; j < K; j++) {
          for (let i = 0; i < K; i++) {
            const o = ((py * K + j) * L + pxx * K + i) * 4;
            if (!big[o + 3]) continue;
            r += big[o]; g += big[o + 1]; b += big[o + 2]; n++;
          }
        }
        if (n) { px[q] = r / n; px[q + 1] = g / n; px[q + 2] = b / n; px[q + 3] = 255; }
      } else if (halo) {
        let a = d <= R + 2 ? halo.alfa[0] : d <= R + 4 ? halo.alfa[1] : d <= R + 7 ? halo.alfa[2] : 0;
        if (a && halo.lado) {                              // más por el lado de la luz, nada por el de atrás
          const dx = (pxx + 0.5 - c) / d, dy = (py + 0.5 - c) / d;
          a *= smooth(-0.2, 0.8, (dx * sx + dy * sy) / sn);
        }
        if (a >= 1) { px[q] = halo.color[0]; px[q + 1] = halo.color[1]; px[q + 2] = halo.color[2]; px[q + 3] = Math.round(a); }
      }
    }
  }
  return px;
}

const i = process.argv.indexOf("--pruebas");
if (i > 0) {
  const dir = path.resolve(process.argv[i + 1]);
  fs.mkdirSync(dir, { recursive: true });
  for (const noche of [false, true]) {
    for (const [nombre, halo] of Object.entries(HALOS)) {
      fs.writeFileSync(path.join(dir, `tierra-${nombre}${noche ? "-noche" : ""}.png`), encodePNG(N, N, icono(VISTA, noche, halo)));
    }
  }
  console.log("->", dir);
} else {
  for (const noche of [false, true]) {
    const f = `public/zodk-tierra${noche ? "-noche" : ""}.png`;
    fs.writeFileSync(path.join(REPO, f), encodePNG(N, N, icono(VISTA, noche, HALO)));
    console.log("->", f);
  }
}
