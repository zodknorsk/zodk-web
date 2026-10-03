// Encaja la cámara de una foto con puntos conocidos del dron (docs/uas-hd.md,
// «Medir con fotos encajadas») y pinta la maqueta encima, desde ese mismo
// ángulo: la silueta en rojo, las juntas entre piezas en amarillo.
// Uso: node arte/encajar-camara.mjs <ajuste.json> [salida.png]
// ajuste.json: { "foto": "ruta relativa al json", "modelo": "bayraktar-tb2",
//   "puntos": [[x, y, z, px, py, "nombre", "medir:x|y|z"?], ...],
//   "inicio": { "d": 20, "fov": 30, "az"?: … } (opcional), "fijo": {...},
//   "recorte": [x, y, ancho, alto] (opcional), "solo": ["ids"...] (opcional) }
// x, y, z en metros de la maqueta (los de su archivo, antes de pasar a
// unidades); px, py, el píxel de la foto. Los puntos sin «medir» encajan la
// cámara (az, el, giro, distancia, campo y punto al que mira); los que llevan
// «medir:eje» no cuentan: se busca dónde cae su píxel con ese eje fijo (por
// ejemplo, «medir:z» da x e y de una pieza cuya z se conoce). Escribe la
// cámara en <ajuste>.cam.json y el error de cada punto, en píxeles.
// Ojo: medir a lo largo de la vista no vale (una z en una foto de frente).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { geometriaDe } from "../src/scripts/uas-geometria.ts";

const [, , ajusteF, salidaArg] = process.argv;
const A = JSON.parse(fs.readFileSync(ajusteF, "utf8"));
const dir = path.dirname(ajusteF);
const foto = path.resolve(dir, A.foto);
const meta = await sharp(foto).metadata();
const W = meta.width, H = meta.height;
const rad = (g) => (g * Math.PI) / 180;

// Cámara: mira al punto (tx, ty, tz) desde el acimut az (0 = de frente, 90 =
// desde el ala derecha) y la elevación el, a d metros, con un campo vertical
// fov y un giro roll. El centro óptico, en el centro de la foto (más cx, cy).
const NOMBRES = ["az", "el", "roll", "d", "fov", "tx", "ty", "tz", "cabeceo", "cx", "cy"];
const proyector = (c) => {
  const C = [c.tx + c.d * Math.sin(rad(c.az)) * Math.cos(rad(c.el)), c.ty + c.d * Math.sin(rad(c.el)), c.tz + c.d * Math.cos(rad(c.az)) * Math.cos(rad(c.el))];
  let f = [c.tx - C[0], c.ty - C[1], c.tz - C[2]];
  const n = Math.hypot(...f); f = f.map((v) => v / n);
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  let r = cruz(f, [0, 1, 0]); const nr = Math.hypot(...r); r = r.map((v) => v / nr);
  let u = cruz(r, f);
  const cr = Math.cos(rad(c.roll)), sr = Math.sin(rad(c.roll));
  [r, u] = [r.map((v, i) => cr * v + sr * u[i]), u.map((v, i) => -sr * r[i] + cr * v)];
  const F = H / 2 / Math.tan(rad(c.fov) / 2);
  // Cabeceo del dron (morro arriba, en grados), girando sobre el eje x.
  const ca = Math.cos(rad(c.cabeceo ?? 0)), sa = Math.sin(rad(c.cabeceo ?? 0));
  const punto = ([x, y0, z0]) => {
    const y = y0 * ca + z0 * sa, z = -y0 * sa + z0 * ca;
    const p = [x - C[0], y - C[1], z - C[2]];
    const zf = p[0] * f[0] + p[1] * f[1] + p[2] * f[2];
    return [W / 2 + (c.cx ?? 0) + (F * (p[0] * r[0] + p[1] * r[1] + p[2] * r[2])) / zf, H / 2 + (c.cy ?? 0) - (F * (p[0] * u[0] + p[1] * u[1] + p[2] * u[2])) / zf, zf];
  };
  return punto;
};

const error = (c) => {
  const pr = proyector(c);
  // Límites: campo entre 1,5° y 70°, cámara entre 4 (o `dMin` del ajuste: el
  // Shahed, pequeño, se fotografía a 2 o 3 m) y 400 m, el punto al que
  // mira cerca del dron.
  let e = 0;
  const fuera = (v, a, b) => (v < a ? a - v : v > b ? v - b : 0);
  e += 1e6 * (fuera(c.fov, 1.5, 70) ** 2 + fuera(c.d, A.dMin ?? 4, 400) ** 2 + fuera(Math.hypot(c.tx, c.ty, c.tz), 0, 4) ** 2 + fuera(c.el, -60, 89) ** 2 + fuera(c.cabeceo ?? 0, -8, 8) ** 2);
  for (const [x, y, z, px, py, , solo] of A.puntos) { if (solo?.startsWith("medir")) continue; const [a, b] = pr([x, y, z]); e += (a - px) ** 2 + (b - py) ** 2; }
  return e;
};

// Nelder-Mead sobre los parámetros libres.
const ini = { az: 90, el: 5, roll: 0, d: 30, fov: 20, tx: 0, ty: 0, tz: 0, cabeceo: 0, cx: 0, cy: 0, ...A.inicio };
// El cabeceo del dron es lo mismo que mover la cámara: fijo en 0 (así la
// cámara sirve tal cual para el visor).
const libres = NOMBRES.filter((k) => !(A.fijo && k in A.fijo) && k !== "cx" && k !== "cy" && k !== "cabeceo");
const base = { ...ini, ...A.fijo };
const deV = (v) => ({ ...base, ...Object.fromEntries(libres.map((k, i) => [k, v[i]])) });
const pasoIni = { az: 8, el: 6, roll: 3, d: 8, fov: 6, tx: 1, ty: 0.5, tz: 1, cabeceo: 2 };
let mejor = null;
const arranques = A.inicio?.az !== undefined ? [base] : [0, 45, 90, 135, 180, 225, 270, 315].flatMap((az) => [-10, 10, 35].map((el) => ({ ...base, az, el })));
for (let intento = 0; intento < arranques.length + 4; intento++) {
  const b0 = intento < arranques.length ? arranques[intento] : mejor;
  const v0 = libres.map((k) => b0[k]);
  let s = [v0, ...libres.map((k, i) => v0.map((v, j) => (j === i ? v + pasoIni[k] * (intento % 2 ? -1 : 1) : v)))];
  let fs_ = s.map((v) => error(deV(v)));
  for (let it = 0; it < 4000; it++) {
    const o = fs_.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
    s = o.map((i) => s[i]); fs_ = o.map((i) => fs_[i]);
    const n = libres.length;
    const cen = s[0].map((_, j) => s.slice(0, n).reduce((t, v) => t + v[j], 0) / n);
    const ref = cen.map((v, j) => v + (v - s[n][j]));
    const fr = error(deV(ref));
    if (fr < fs_[0]) {
      const exp = cen.map((v, j) => v + 2 * (v - s[n][j])); const fe = error(deV(exp));
      if (fe < fr) { s[n] = exp; fs_[n] = fe; } else { s[n] = ref; fs_[n] = fr; }
    } else if (fr < fs_[n - 1]) { s[n] = ref; fs_[n] = fr; } else {
      const con = cen.map((v, j) => v + 0.5 * (s[n][j] - v)); const fc = error(deV(con));
      if (fc < fs_[n]) { s[n] = con; fs_[n] = fc; } else {
        for (let i = 1; i <= n; i++) { s[i] = s[i].map((v, j) => s[0][j] + 0.5 * (v - s[0][j])); fs_[i] = error(deV(s[i])); }
      }
    }
  }
  const c = deV(s[0]);
  if (!mejor || error(c) < error(mejor)) mejor = c;
}
const cam = mejor;
const pr = proyector(cam);
console.log("cámara:", Object.fromEntries(Object.entries(cam).map(([k, v]) => [k, +(+v).toFixed(3)])));
// Un punto de la foto, llevado al plano x = x0 de la maqueta: busca y, z
// que caigan en ese píxel (por tanteo).
const medir = (px, py, x0, y0, z0, eje = "x") => {
  // Libres: las dos coordenadas que no son `eje` (que queda fija).
  const libres = ["x", "y", "z"].filter((k) => k !== eje);
  const v = { x: x0, y: y0, z: z0 };
  const P = () => pr([v.x, v.y, v.z]);
  for (let it = 0; it < 60; it++) {
    const [a, b] = P(), h = 1e-3;
    v[libres[0]] += h; const [ay, by] = P(); v[libres[0]] -= h;
    v[libres[1]] += h; const [az, bz] = P(); v[libres[1]] -= h;
    const J = [[(ay - a) / h, (az - a) / h], [(by - b) / h, (bz - b) / h]];
    const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    const ea = px - a, eb = py - b;
    v[libres[0]] += (J[1][1] * ea - J[0][1] * eb) / det; v[libres[1]] += (-J[1][0] * ea + J[0][0] * eb) / det;
  }
  return v;
};
// Un píxel llevado a la superficie de la maqueta: el triángulo más cercano
// a la cámara que cae bajo ese píxel (con «medir:superficie»).
let triangulos = null;
const enSuperficie = async (px, py) => {
  if (!triangulos) {
    const m = (await import(`../src/data/uas/${A.modelo ?? "bayraktar-tb2"}.ts?${Date.now()}`)).default;
    triangulos = [];
    for (const p of m.piezas) for (const g of geometriaDe(p)) {
      const pos = g.getAttribute("position"), idx = g.index ? g.index.array : [...Array(pos.count).keys()];
      for (let i = 0; i < idx.length; i += 3) {
        const v = [0, 1, 2].map((k) => [pos.getX(idx[i + k]) * m.escala, pos.getY(idx[i + k]) * m.escala, pos.getZ(idx[i + k]) * m.escala]);
        triangulos.push({ v, q: v.map(pr), pieza: p.id });
      }
    }
  }
  let mejor = null;
  for (const { v, q, pieza } of triangulos) {
    const [a, b, c] = q;
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
    if (Math.abs(area) < 1e-9) continue;
    const w0 = ((b[0] - px) * (c[1] - py) - (c[0] - px) * (b[1] - py)) / area;
    const w1 = ((c[0] - px) * (a[1] - py) - (a[0] - px) * (c[1] - py)) / area;
    const w2 = 1 - w0 - w1;
    if (w0 < 0 || w1 < 0 || w2 < 0) continue;
    const prof = w0 * a[2] + w1 * b[2] + w2 * c[2];
    if (prof <= 0 || (mejor && prof >= mejor.prof)) continue;
    mejor = { prof, pieza, p: [0, 1, 2].map((k) => w0 * v[0][k] + w1 * v[1][k] + w2 * v[2][k]) };
  }
  return mejor;
};
for (const [x, y, z, px, py, nombre, solo] of A.puntos) {
  if (solo === "medir:superficie") {
    const s = await enSuperficie(px, py);
    console.log(`  ${(nombre ?? "").padEnd(18)} foto ${px},${py}  → en la maqueta: ${s ? `${s.pieza} x ${s.p[0].toFixed(3)} y ${s.p[1].toFixed(3)} z ${s.p[2].toFixed(3)}` : "nada"}`);
    continue;
  }
  const [a, b] = pr([x, y, z]);
  const eje = solo?.startsWith("medir") ? (solo.split(":")[1] ?? "x") : null;
  const extra = eje ? (() => { const v = medir(px, py, x, y, z, eje); return `  → con ${eje} fija: x ${v.x.toFixed(3)} y ${v.y.toFixed(3)} z ${v.z.toFixed(3)}`; })() : "";
  console.log(`  ${(nombre ?? `${x},${y},${z}`).padEnd(18)} foto ${px},${py}  maqueta ${a.toFixed(0)},${b.toFixed(0)}  error ${Math.hypot(a - px, b - py).toFixed(1)}${eje ? " (no ajusta)" : ""}${extra}`);
}
fs.writeFileSync(ajusteF.replace(/\.json$/, ".cam.json"), JSON.stringify(cam));

// Pinta la maqueta: triángulos de detrás hacia delante, en rojo a medias.
if (salidaArg) {
  const m = (await import(`../src/data/uas/${A.modelo ?? "bayraktar-tb2"}.ts?${Date.now()}`)).default;
  const E = m.escala;
  // Rasterizado propio con profundidad: cada píxel guarda la pieza que se ve.
  // Se pinta la silueta en rojo, las juntas entre piezas en amarillo y un
  // velo rojo muy suave por dentro.
  const prof = new Float32Array(W * H).fill(Infinity), ids = new Int32Array(W * H).fill(-1);
  let n = 0;
  for (const p of m.piezas) {
    n++;
    if (A.solo && !A.solo.includes(p.id)) continue;
    for (const g of geometriaDe(p)) {
      const pos = g.getAttribute("position"), idx = g.index ? g.index.array : [...Array(pos.count).keys()];
      for (let i = 0; i < idx.length; i += 3) {
        const q = [0, 1, 2].map((k) => pr([pos.getX(idx[i + k]) * E, pos.getY(idx[i + k]) * E, pos.getZ(idx[i + k]) * E]));
        if (q.some((v) => v[2] <= 0)) continue;
        const x0 = Math.max(0, Math.floor(Math.min(q[0][0], q[1][0], q[2][0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(q[0][0], q[1][0], q[2][0])));
        const y0 = Math.max(0, Math.floor(Math.min(q[0][1], q[1][1], q[2][1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(q[0][1], q[1][1], q[2][1])));
        const [a, b, c] = q;
        const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
        if (Math.abs(area) < 1e-9) continue;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((b[0] - px) * (c[1] - py) - (c[0] - px) * (b[1] - py)) / area;
          const w1 = ((c[0] - px) * (a[1] - py) - (a[0] - px) * (c[1] - py)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * a[2] + w1 * b[2] + w2 * c[2];
          const k = y * W + x;
          if (z < prof[k]) { prof[k] = z; ids[k] = n; }
        }
      }
    }
  }
  const capa = Buffer.alloc(W * H * 4);
  const grueso = A.grueso ?? 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, v = ids[k];
    let borde = 0;
    for (let dy = -grueso; dy <= grueso && borde < 2; dy++) for (let dx = -grueso; dx <= grueso; dx++) {
      const X = x + dx, Y = y + dy;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const o = ids[Y * W + X];
      if (o !== v) { if (o === -1 || v === -1) { borde = 2; break; } else if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) borde = 1; }
    }
    const o = k * 4;
    if (borde === 2) { capa[o] = 255; capa[o + 1] = 30; capa[o + 2] = 20; capa[o + 3] = 230; }
    else if (borde === 1 && v !== -1) { capa[o] = 255; capa[o + 1] = 230; capa[o + 2] = 0; capa[o + 3] = 150; }
    else if (v !== -1) { capa[o] = 255; capa[o + 1] = 40; capa[o + 2] = 20; capa[o + 3] = Math.round(255 * (A.opacidad ?? 0.1)); }
  }
  const marcas = A.puntos.map(([x, y, z, px, py]) => {
    const [a, b] = pr([x, y, z]);
    return `<circle cx="${px}" cy="${py}" r="6" fill="none" stroke="#00e0ff" stroke-width="2"/><line x1="${px}" y1="${py}" x2="${a}" y2="${b}" stroke="#00e0ff" stroke-width="2"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${A.sinMarcas ? "" : marcas}</svg>`;
  let img = sharp(await sharp(foto).composite([{ input: capa, raw: { width: W, height: H, channels: 4 } }, { input: Buffer.from(svg) }]).png().toBuffer());
  const salida = path.resolve(process.cwd(), salidaArg);
  if (A.recorte) {
    img = img.extract({ left: A.recorte[0], top: A.recorte[1], width: A.recorte[2], height: A.recorte[3] });
  }
  await img.toFile(salida);
  console.log(salida);
}
