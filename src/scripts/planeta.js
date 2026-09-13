// Planeta del hero en <canvas>: la Tierra en pixel art girando de forma
// continua, de día o de noche según el tema. Sustituye a los sprites de
// fotogramas, que iban a saltos.
//
// Los datos salen de logo-files/generar-planeta-hero.py (a public/planeta/):
//   planeta-mapa.png       material de cada celda del mapa (R + G*256; B = hielo)
//   planeta-lut.png        color de cada material para cada escalón de luz (día)
//   planeta-lut-noche.png  lo mismo a la luz de la luna        } solo se bajan
//   planeta-luces.png      luces de ciudades (lat, lon, fuerza) } en modo oscuro
//   planeta-datos.json     geometría, luz, prioridades, nubes, banderas, luces
// El sol (o la luna) y el terminador no se mueven respecto a quien mira, así
// que todo lo que depende del píxel (qué celda del mapa cae ahí, cuánta luz le
// toca, halo, borde) se calcula una vez al cargar; en cada fotograma solo se
// busca "material de la celda -> color para este escalón de luz". Detalle y
// decisiones en logo-files/HERO-WIP.md (punto 7 y "Modo noche v2").
//
// Lo usan la portada (src/pages/index.astro) y el prototipo de
// logo-files/prototipo-canvas/.

// Subir al regenerar public/planeta/ (cache-busting: los archivos se llaman
// siempre igual).
export const PLANETA_V = 8;

const cargas = new Map();              // base -> Promise de datos preparados (una vez por página)
const cargasNoche = new Map();         // base -> Promise de la LUT de noche y las luces

async function bitmap(url) {
  const blob = await fetch(url).then((r) => r.blob());
  // Sin gestión de color: los PNG llevan índices de material, no colores.
  return createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}

function pixels(bm) {
  const c = document.createElement("canvas");
  c.width = bm.width;
  c.height = bm.height;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(bm, 0, 0);
  return x.getImageData(0, 0, bm.width, bm.height).data;
}

const smooth = (e0, e1, x) => {
  let t = (x - e0) / (e1 - e0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
};
const mixc = (a, b, t) =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * Math.max(0, Math.min(1, t))));
const pack = (c) => (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0];
const DEG = 180 / Math.PI;

export function cargarPlaneta(base = "/planeta/") {
  if (!cargas.has(base)) cargas.set(base, preparar(base));
  return cargas.get(base);
}

const lutU32 = (bm) => {
  const lp = pixels(bm);
  const out = new Uint32Array(lp.length / 4);
  for (let i = 0; i < out.length; i++) {
    out[i] = (255 << 24) | (lp[i * 4 + 2] << 16) | (lp[i * 4 + 1] << 8) | lp[i * 4];
  }
  return out;
};

// Lo propio de la noche, aparte: quien no usa el modo oscuro no lo descarga.
// Luces: 2 píxeles por luz en filas de LUZ_PNG_W luces; 1º = latitud en 16
// bits (R, G) + fuerza*16 (B), 2º = longitud en 16 bits (R, G).
function cargarNoche(base, D) {
  if (!cargasNoche.has(base)) {
    cargasNoche.set(base, (async () => {
      const v = `?v=${PLANETA_V}`;
      const [lutBm, lucesBm] = await Promise.all([
        bitmap(`${base}planeta-lut-noche.png${v}`),
        bitmap(`${base}planeta-luces.png${v}`),
      ]);
      const n = D.LUCES_N, lw = D.LUZ_PNG_W, d = pixels(lucesBm);
      // Seno y coseno de latitud y longitud ya calculados: en cada fotograma el
      // giro se aplica con cos(lon - lon0) = cos·cos + sen·sen, sin trigonometría.
      const sLat = new Float32Array(n), cLat = new Float32Array(n);
      const sLon = new Float32Array(n), cLon = new Float32Array(n), A = new Float32Array(n);
      // Para descartar enseguida: por debajo de qué cos(giro) la luz queda por
      // detrás del disco, y la fila más alta del canvas en la que puede caer.
      const cosMin = new Float32Array(n), yMin = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const o = (((i / lw) | 0) * lw * 2 + (i % lw) * 2) * 4;
        const lat = ((d[o] << 8) | d[o + 1]) * 180 / 65535 - 90;
        const lon = ((d[o + 4] << 8) | d[o + 5]) * 360 / 65535 - 180;
        const s = Math.sin(lat / DEG), c = Math.cos(lat / DEG);
        sLat[i] = s;
        cLat[i] = c;
        sLon[i] = Math.sin(lon / DEG);
        cLon[i] = Math.cos(lon / DEG);
        A[i] = d[o + 2] / 16;
        cosMin[i] = (0.02 - D.SINT * s) / (D.COST * c);
        yMin[i] = (-D.COST * s + D.SINT * c) * D.RADIUS + D.CY - 0.5;
      }
      return { lut: lutU32(lutBm), sLat, cLat, sLon, cLon, A, cosMin, yMin };
    })());
  }
  return cargasNoche.get(base);
}

async function preparar(base) {
  const v = `?v=${PLANETA_V}`;
  const [D, mapBm, lutBm] = await Promise.all([
    fetch(`${base}planeta-datos.json${v}`).then((r) => r.json()),
    bitmap(`${base}planeta-mapa.png${v}`),
    bitmap(`${base}planeta-lut.png${v}`),
  ]);
  const MW = D.MW, MH = D.MH, KN = D.LUT_KN, KMIN = D.LUT_KMIN * D.LIGHT_SUB;

  // Mapa: material por celda, y qué materiales son hielo (el limbo los
  // oscurece menos).
  const mp = pixels(mapBm);
  const mat = new Uint16Array(MW * MH);
  const iceMat = new Uint8Array(D.MATERIALES);
  for (let i = 0; i < MW * MH; i++) {
    const m = mp[i * 4] | (mp[i * 4 + 1] << 8);
    mat[i] = m;
    if (mp[i * 4 + 2]) iceMat[m] = 1;
  }

  // Mipmaps en longitud: versiones del mapa con texels de 2, 4… celdas. Donde un
  // píxel abarca varias celdas (cerca del polo, ~2 en latitudes medias), leer
  // UNA hace que costas finas e islas se enciendan y apaguen al girar. Cada
  // píxel lee del nivel cuyo texel mide lo que él; al juntar celdas gana la de
  // más prioridad (costa > tierra > mar). En los niveles gruesos (texel de 8+
  // celdas) la costa ya no gana: si no, los islotes árticos salpicaban el polo.
  const PRIO = Uint8Array.from(D.prio);
  const PRIO_LO = PRIO.map((p) => Math.min(p, 1));
  let LMAX = 0;
  while (LMAX < 6 && MW % (2 << LMAX) === 0) LMAX++;
  const lvOff = [0], lvW = [MW];
  let total = MW * MH;
  for (let L = 1; L <= LMAX; L++) {
    lvOff.push(total);
    lvW.push(MW >> L);
    total += (MW >> L) * MH;
  }
  const lv = new Uint16Array(total);
  lv.set(mat, 0);
  for (let L = 1; L <= LMAX; L++) {
    const w = lvW[L], pw = lvW[L - 1], o = lvOff[L], po = lvOff[L - 1];
    const P = L >= 3 ? PRIO_LO : PRIO;
    for (let r = 0; r < MH; r++) {
      for (let c = 0; c < w; c++) {
        const a = lv[po + r * pw + 2 * c], b = lv[po + r * pw + 2 * c + 1];
        lv[o + r * w + c] = P[b] > P[a] ? b : a;
      }
    }
  }

  // LUT ya en el formato Uint32 del ImageData.
  const lut = lutU32(lutBm);

  // Precálculo por píxel del disco.
  const W = D.COLS, H = D.VIS, R = D.RADIUS;
  const RIN = 1 - D.LIMB_AA / R, ROUT = 1 + D.LIMB_AA / R, RRMAX = ROUT * ROUT;
  const lonAt = (sx, sy) => {
    const px = (sx + 0.5 - D.CX) / R, py = (sy + 0.5 - D.CY) / R;
    const rr = px * px + py * py;
    if (rr > 1) return null;
    return Math.atan2(px, py * D.SINT + Math.sqrt(1 - rr) * D.COST) * DEG;
  };
  const wrapd = (d) => ((d + 540) % 360) - 180;
  const idx = [], row = [], col = [], lev = [], kN = [], kI = [], post = [];
  const kNn = [], kIn = [], postN = [];                // lo mismo a la luz de la luna
  for (let sy = 0; sy < H; sy++) {
    for (let sx = 0; sx < W; sx++) {
      const px = (sx + 0.5 - D.CX) / R, py = (sy + 0.5 - D.CY) / R;
      const rr = px * px + py * py;
      if (rr > RRMAX) continue;
      const pz = Math.sqrt(Math.max(0, 1 - Math.min(rr, 1)));
      const lat = Math.asin(Math.max(-1, Math.min(1, -py * D.COST + pz * D.SINT))) * DEG;
      const lon = Math.atan2(px, py * D.SINT + pz * D.COST) * DEG;
      let r = Math.floor((90 - lat) / 180 * MH);
      r = r < 0 ? 0 : r >= MH ? MH - 1 : r;
      const dc = Math.sqrt(rr);
      const lam = px * D.SX + py * D.SY + pz * D.SZ;
      const termT = smooth(D.TERM_A, D.TERM_B, lam);
      const limbT = smooth(0.72, 1, dc);
      const kFor = (limbMul, floor = D.NIGHT, term = termT) => {
        const bright = (floor + (1 - floor) * term) * (1 - D.LIMB_K * limbT * limbMul);
        const k = Math.floor(Math.log(Math.max(bright, 1e-3)) / D.LNSTEP * D.LIGHT_SUB + 0.5);   // en 1/LIGHT_SUB de escalón
        return Math.max(0, Math.min(KN - 1, k - KMIN));
      };
      const lamN = px * D.MX + py * D.MY + pz * D.MZ;
      const termN = smooth(D.TERM_A, D.TERM_B, lamN);
      // Huella del píxel en celdas de longitud (lo que cambia la longitud al
      // pasar al vecino, en horizontal o en vertical) -> nivel de mipmap, con
      // el texel siempre al menos tan ancho como la huella.
      const lx = lonAt(sx + 1, sy) ?? lonAt(sx - 1, sy), ly = lonAt(sx, sy + 1) ?? lonAt(sx, sy - 1);
      const fx = Math.max(lx === null ? 0 : Math.abs(wrapd(lx - lon)), ly === null ? 0 : Math.abs(wrapd(ly - lon))) / 360 * MW;
      const L = Math.max(0, Math.min(LMAX, Math.ceil(Math.log2(Math.max(fx, 1e-6)))));
      const n = idx.length;
      idx.push(sy * W + sx);
      row.push(lvOff[L] + r * lvW[L]);
      col.push(Math.round((lon + 180) / 360 * MW * 256));   // columna en 1/256 de celda
      lev.push(L);
      kN.push(kFor(1));
      kI.push(kFor(0.7));
      kNn.push(kFor(1, D.N_NIGHT, termN));
      kIn.push(kFor(0.7, D.N_NIGHT, termN));
      const haloDe = (l) => dc > 0.93 && l > 0
        ? 0.3 * (Math.floor(smooth(0.93, 1, dc) * smooth(0, 0.45, l) * 4 + 0.5) / 4) : 0;
      const haloA = haloDe(lam), haloN = haloDe(lamN);
      let cov = 1, glow = 0;
      if (dc > RIN) cov = 1 - smooth(RIN, ROUT, dc);
      const dpx = (1 - dc) * R;                        // brillo de atmósfera (noche): px desde el borde
      for (let j = 0; j < D.AIRGLOW_PX.length; j++) {
        if (dpx < D.AIRGLOW_PX[j]) { glow = D.AIRGLOW_A[j]; break; }
      }
      if (haloA > 0 || cov < 1) post.push(n, haloA, cov);
      if (haloN > 0 || glow > 0 || cov < 1) postN.push(n, haloN, glow, cov);
    }
  }
  const N = idx.length;
  // Primer píxel del disco de cada fila, para pintar solo las filas visibles.
  const rowStart = new Int32Array(H + 1);
  for (let y = 0, n = 0; y <= H; y++) {
    while (n < N && ((idx[n] / W) | 0) < y) n++;
    rowStart[y] = n;
  }
  const pL = Uint8Array.from(lev);
  return {
    D, W, H, R, MW, KN, lv, lut, iceMat, N, rowStart, post, postN, base,
    pIdx: Int32Array.from(idx), pBase: Int32Array.from(row), pCol: Int32Array.from(col),
    pL, pWrap: Int32Array.from(lev.map((L) => lvW[L])),
    pKN: Uint8Array.from(kN), pKI: Uint8Array.from(kI),
    pKNn: Uint8Array.from(kNn), pKIn: Uint8Array.from(kIn),
  };
}

// Monta el planeta en `canvas` y lo pone a girar. Devuelve { desmontar, draw,
// setVuelta, setParado, setMarca, posMarca, geo, P }. `banderas`: códigos iso de las chapas a pintar (null = todas);
// `alMoverBanderas(lista, W, H)` recibe tras cada dibujo dónde queda cada chapa
// visible ({ iso, x, y } en píxeles del canvas, esquina de su contorno), para
// colocar encima lo que reacciona al ratón. `alDibujar()` se llama tras cada
// dibujo (con el planeta parado, no), y `geo(x, y)` da la latitud/longitud del
// punto de pantalla (x, y) en ese momento, o null fuera del disco.
// Con el tema oscuro pinta la noche (luz de luna y luces de ciudades). Se para
// solo: fuera de pantalla, con la pestaña oculta y mientras `pausado()`
// devuelva true (en la portada: ratón sobre una nave). Con
// prefers-reduced-motion se pinta quieto.
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, vuelta?: number, pausado?: () => boolean, alPintar?: () => void,
 *   banderas?: string[] | null,
 *   alMoverBanderas?: ((lista: { iso: string, x: number, y: number }[], W: number, H: number) => void) | null,
 *   alDibujar?: (() => void) | null }} [opciones]
 */
export async function montarPlaneta(canvas, {
  base = "/planeta/",
  vuelta = 90,                         // segundos por vuelta (elegido por el usuario)
  pausado = () => false,
  alPintar = () => {},                 // tras el primer dibujo completo
  banderas = null,
  alMoverBanderas = null,
  alDibujar = null,
} = {}) {
  const P = await cargarPlaneta(base);
  const { D, W, H, R, MW, KN, lv, lut, iceMat, rowStart, post, postN } = P;
  const { pIdx, pBase, pCol, pL, pWrap, pKN, pKI, pKNn, pKIn } = P;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(W, H);
  const buf = new Uint32Array(img.data.buffer);
  const stamped = new Uint8Array(W * H);
  const SP = D.SPACE, AT = D.ATMO, NAT = D.N_ATMO, GL = D.AIRGLOW;
  const FLAGS = banderas ? D.banderas.filter((f) => banderas.includes(f.iso)) : D.banderas;
  const html = document.documentElement;
  const esNoche = () => html.classList.contains("dark");
  let noche = null;                                    // LUT de noche y luces, cuando lleguen

  // `luna`: iluminada por la luna (noche) en vez de por el sol.
  function proyecta(lat, lon, lon0, luna = false) {
    const rlat = lat / DEG, rlon = (lon - lon0) / DEG;
    const a = Math.sin(rlat), cl = Math.cos(rlat), vv = cl * Math.cos(rlon);
    const px = cl * Math.sin(rlon), py = -D.COST * a + D.SINT * vv, pz = D.SINT * a + D.COST * vv;
    const lam = luna ? px * D.MX + py * D.MY + pz * D.MZ : px * D.SX + py * D.SY + pz * D.SZ;
    return [px, py, pz, smooth(D.TERM_A + 0.06, D.TERM_B + 0.2, lam)];
  }

  // Nubes: plantillas ya escaladas, en espejo y sombreadas en Python,
  // estampadas encima. Tonos de D.C_NUBE (de noche, D.C_NUBE_NOCHE): canto al
  // sol, cuerpo, canto en sombra, base, borde (el _cloud_t del generador:
  // junto al terminador se apagan).
  const NUBE_T = [(t) => Math.min(1, t + 0.1), (t) => Math.min(1, t + 0.1), (t) => t, (t) => t, (t) => Math.max(0.7, t)];
  function nubes(lon0, luna) {
    const touched = [];
    const tonos = luna ? D.C_NUBE_NOCHE : D.C_NUBE;
    for (const nb of D.nubes) {
      const [px, py, pz, bright] = proyecta(nb.lat, nb.lon, lon0, luna);
      if (pz <= 0.5 || bright < 0.12) continue;
      const cx = px * R + D.CX - 0.5, cy = py * R + D.CY - 0.5;
      const xsc = 0.72 + 0.28 * pz, t = 0.72 + 0.28 * bright;
      const cols = tonos.map((c, i) => pack(mixc(SP, c, NUBE_T[i](t))));
      for (const [ox, oy, k] of nb.cells) {
        const x = Math.round(cx + (ox - nb.dw / 2) * xsc);
        const y = Math.round(cy + oy - nb.dh / 2);
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const p = y * W + x;
        if (stamped[p]) continue;
        stamped[p] = 1;
        touched.push(p);
        buf[p] = cols[k];
      }
    }
    for (const p of touched) stamped[p] = 0;
  }

  // Luces de las ciudades (noche): como light_cells() del generador. Cada
  // ciudad deja una huella en píxeles de pantalla; por píxel se guarda la
  // suma de todo (solo da un velo tenue, hasta LUZ_SUMA_MAX), el halo más
  // fuerte y la suma de núcleos, y de ahí sale el nivel de ámbar.
  // Huellas: desplazamiento en x, en y, en el búfer (y*W + x) y peso; el
  // centro (peso 1) aparte. Todas caben en x, y de -2 a +3.
  const HUELLAS = [D.HUELLA, D.HUELLA_R2, D.HUELLA_GRANDE].map((h) => ({
    dx: Int32Array.from(h, (e) => e[0]), dy: Int32Array.from(h, (e) => e[1]),
    dp: Int32Array.from(h, (e) => e[1] * W + e[0]), w: Float32Array.from(h, (e) => e[2]),
    centro: Uint8Array.from(h, (e) => (e[2] === 1 ? 1 : 0)), n: h.length,
  }));
  const UMB = D.LUZ_UMBRAL, NUMB = UMB.length, RAMPA = D.LUZ_RAMPA, SUMA_MAX = D.LUZ_SUMA_MAX;
  const CORE2 = D.LUZ_CORE2, R2MIN = D.LUZ_R2_MIN, CX = D.CX - 0.5, CY = D.CY - 0.5;
  const nivel = (v) => { let l = 0; while (l < NUMB && v >= UMB[l]) l++; return l; };
  let acc = null, pico, nuc, toc;
  function luces(lon0, y0, y1) {
    if (!acc) {
      acc = new Float32Array(W * H); pico = new Float32Array(W * H); nuc = new Float32Array(W * H);
      toc = new Int32Array(W * H);
    }
    const { sLat, cLat, sLon, cLon, A, cosMin, yMin } = noche;
    const S = D.SINT, C = D.COST, yTope = y1 + 3;
    const c0 = Math.cos(lon0 / DEG), s0 = Math.sin(lon0 / DEG);
    let nt = 0;
    for (let i = 0, n = A.length; i < n; i++) {
      if (yMin[i] > yTope) continue;                   // cae siempre por debajo de la ventana
      const cr = cLon[i] * c0 + sLon[i] * s0;          // cos(lon - lon0)
      if (cr <= cosMin[i]) continue;                   // por detrás del planeta
      const cl = cLat[i], s = sLat[i];
      const vv = cl * cr, pz = S * s + C * vv;
      const y = Math.round((-C * s + S * vv) * R + CY);
      if (y < y0 - 3 || y >= yTope) continue;
      const x = Math.round(cl * (sLon[i] * c0 - cLon[i] * s0) * R + CX);   // sen(lon - lon0)
      let a = A[i];
      if (pz < 0.25) { const t = (pz - 0.02) / 0.23; a *= t * t * (3 - 2 * t); }   // smooth(0.02, 0.25, pz)
      const h = HUELLAS[a >= CORE2 ? 2 : a >= R2MIN ? 1 : 0];
      const dentro = x >= 2 && x < W - 3 && y >= y0 + 2 && y < y1 - 3;
      const p0 = y * W + x;
      for (let j = 0; j < h.n; j++) {
        if (!dentro) {
          const X = x + h.dx[j], Y = y + h.dy[j];
          if (X < 0 || X >= W || Y < y0 || Y >= y1) continue;
        }
        const p = p0 + h.dp[j];
        if (stamped[p] === 0) { stamped[p] = 1; toc[nt++] = p; }
        if (h.centro[j] === 1) { acc[p] += a; nuc[p] += a; }
        else { const v = a * h.w[j]; acc[p] += v; if (v > pico[p]) pico[p] = v; }
      }
    }
    for (let k = 0; k < nt; k++) {
      const p = toc[k];
      const lvl = Math.max(nivel(Math.max(pico[p], nuc[p])), Math.min(SUMA_MAX, nivel(acc[p])));
      acc[p] = pico[p] = nuc[p] = 0;
      stamped[p] = 0;
      const v = buf[p];
      if (!lvl || (v >>> 24) === 0) continue;         // fuera del disco
      const c = RAMPA[lvl - 1][0], t = RAMPA[lvl - 1][1];
      const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255;
      buf[p] = (255 << 24) | (Math.round(b + (c[2] - b) * t) << 16)
        | (Math.round(g + (c[1] - g) * t) << 8) | Math.round(r + (c[0] - r) * t);
    }
  }

  // Chapas de bandera (países del blog): sombra de 1 px sobre el planeta, y la
  // chapa encima de las nubes. Solo en la cara iluminada y lejos del borde.
  function chapasVisibles(lon0, luna) {
    const vis = [];
    for (const f of FLAGS) {
      const [px, py, pz, bright] = proyecta(f.lat, f.lon, lon0, luna);
      if (pz <= D.BAND_PZ || bright < 0.12) continue;
      vis.push([f, Math.round(px * R + D.CX - 0.5 - f.ax), Math.round(py * R + D.CY - 0.5 - f.ay),
                0.72 + 0.28 * bright]);
    }
    return vis;
  }
  function sombras(vis) {
    for (const [f, ox, oy] of vis) {
      for (const [x, y] of f.sombra) {
        const X = ox + x, Y = oy + y;
        if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
        const p = Y * W + X, v = buf[p];
        if ((v >>> 24) === 0) continue;               // fuera del disco
        buf[p] = (255 << 24) | ((((v >> 16) & 255) >> 1) + 6 << 16)
          | ((((v >> 8) & 255) >> 1) << 8) | ((v & 255) >> 1);
      }
    }
  }
  function chapas(vis) {
    for (const [f, ox, oy, t] of vis) {
      for (const [x, y, r, g, b] of f.cells) {
        const X = ox + x, Y = oy + y;
        if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
        buf[Y * W + X] = pack(mixc(SP, [r, g, b], t));
      }
    }
  }

  // Marca de blanco: una X en pixel art (blanca con contorno oscuro, como la
  // mira) clavada en un punto del planeta; gira con él. Solo se ve en la cara
  // iluminada y por delante; al volver a pasar, reaparece.
  const X_ART = ["#...#", "##.##", ".###.", "##.##", "#...#"];
  const XN = X_ART.length;
  // De noche, en verde de visión nocturna (a juego con el visor del título).
  const X_CELLS = [], X_CELLS_N = [];
  for (let y = -1; y <= XN; y++) {
    for (let x = -1; x <= XN; x++) {
      const lleno = (yy, xx) => yy >= 0 && yy < XN && xx >= 0 && xx < XN && X_ART[yy][xx] === "#";
      if (lleno(y, x)) {
        const bajo = y >= XN - 2;
        X_CELLS.push([x, y, pack(bajo ? [214, 220, 228] : [246, 248, 250])]);
        X_CELLS_N.push([x, y, pack(bajo ? [104, 222, 126] : [141, 255, 158])]);
      } else if (lleno(y - 1, x) || lleno(y + 1, x) || lleno(y, x - 1) || lleno(y, x + 1)) {
        X_CELLS.push([x, y, pack([16, 19, 28])]);
        X_CELLS_N.push([x, y, pack([6, 20, 10])]);
      }
    }
  }
  let marca = null, marcaPos = null;                 // { lat, lon } y dónde quedó en el canvas
  function pintaMarca(lon0, luna) {
    marcaPos = null;
    if (!marca) return;
    const [px, py, pz, bright] = proyecta(marca.lat, marca.lon, lon0, luna);
    if (pz <= 0.06 || bright < 0.12) return;
    const cx = px * R + D.CX, cy = py * R + D.CY;
    const ox = Math.round(cx - 0.5 - (XN >> 1)), oy = Math.round(cy - 0.5 - (XN >> 1));
    for (const [x, y, c] of luna ? X_CELLS_N : X_CELLS) {
      const X = ox + x, Y = oy + y;
      if (X >= 0 && X < W && Y >= 0 && Y < H) buf[Y * W + X] = c;
    }
    marcaPos = { cx, cy };
  }

  // rot: giro en celdas del mapa, con decimales; y0..y1: filas a pintar. De
  // noche, mientras no hayan llegado sus datos, no pinta (devuelve false).
  function draw(rot, y0 = 0, y1 = H) {
    const luna = esNoche();
    if (luna && !noche) return false;
    const LUT = luna ? noche.lut : lut, KNp = luna ? pKNn : pKN, KIp = luna ? pKIn : pKI;
    const rf = Math.round(rot * 256);                 // coma fija: 1/256 de celda
    const n0 = rowStart[y0], n1 = rowStart[y1];
    for (let n = n0; n < n1; n++) {
      let c = (pCol[n] - rf) >> (8 + pL[n]);           // >> redondea hacia abajo también en negativos
      if (c < 0) c += pWrap[n];
      const m = lv[pBase[n] + c];
      buf[pIdx[n]] = LUT[m * KN + (iceMat[m] ? KIp[n] : KNp[n])];
    }
    if (luna) {
      for (let i = 0; i < postN.length; i += 4) {    // halo, brillo de atmósfera y borde suavizado
        if (postN[i] < n0 || postN[i] >= n1) continue;
        const p = pIdx[postN[i]], a = postN[i + 1], gl = postN[i + 2], cov = postN[i + 3];
        const v = buf[p];
        let r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255;
        if (a > 0) { r += (NAT[0] - r) * a; g += (NAT[1] - g) * a; b += (NAT[2] - b) * a; }
        if (gl > 0) { r += (GL[0] - r) * gl; g += (GL[1] - g) * gl; b += (GL[2] - b) * gl; }
        if (cov < 1) { r = SP[0] + (r - SP[0]) * cov; g = SP[1] + (g - SP[1]) * cov; b = SP[2] + (b - SP[2]) * cov; }
        buf[p] = (255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r);
      }
    } else {
      for (let i = 0; i < post.length; i += 3) {     // halo y borde suavizado
        if (post[i] < n0 || post[i] >= n1) continue;
        const p = pIdx[post[i]], a = post[i + 1], cov = post[i + 2];
        const v = buf[p];
        let r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255;
        if (a > 0) { r += (AT[0] - r) * a; g += (AT[1] - g) * a; b += (AT[2] - b) * a; }
        if (cov < 1) { r = SP[0] + (r - SP[0]) * cov; g = SP[1] + (g - SP[1]) * cov; b = SP[2] + (b - SP[2]) * cov; }
        buf[p] = (255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r);
      }
    }
    const lon0 = -rot * 360 / MW;
    if (luna) luces(lon0, y0, y1);                     // de noche, bajo las chapas y las nubes
    const vis = chapasVisibles(lon0, luna);
    sombras(vis);
    nubes(lon0, luna);
    chapas(vis);
    pintaMarca(lon0, luna);
    ctx.putImageData(img, 0, 0, 0, y0, W, y1 - y0);  // solo sube a la GPU la franja pintada
    if (alMoverBanderas) alMoverBanderas(vis.map(([f, ox, oy]) => ({ iso: f.iso, x: ox - 1, y: oy - 1 })), W, H);
    if (alDibujar) alDibujar();
    return true;
  }

  // ---- bucle
  // Giro CONTINUO: en cada fotograma el mapa avanza la fracción de celda que
  // toque y cada borde salta su píxel justo cuando le toca, a ritmo constante.
  // Se dibuja en franjas fijas de 1/60 s (con 4 ms de margen): a 120 Hz, justo
  // un fotograma de cada dos. Solo se pintan las filas que caen en la ventana.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let rot = 0, raf = 0, last = null, t0 = null, lastSlot = -1;
  let enVista = true, completo = false, listo = false;
  let parado = false, sucio = false;                   // botón de pausa; hay que repintar aunque esté quieto

  const activo = () => enVista && !reduce.matches;

  // Los datos de noche se piden la primera vez que hacen falta; al llegar se
  // repinta entero.
  let pidiendo = false;
  function pideNoche() {
    if (noche || pidiendo) return;
    pidiendo = true;
    cargarNoche(base, D).then((n) => {
      noche = n;
      completo = false;
      sucio = true;
      if (reduce.matches || !raf) pintar(true);
    });
  }

  function pintar(todo) {
    let hecho = false;
    if (todo) {
      hecho = draw(rot, 0, H);
    } else {
      const bb = canvas.getBoundingClientRect(), k = H / bb.height;
      const y0 = Math.max(0, Math.floor(-bb.top * k));
      const y1 = Math.min(H, Math.ceil((innerHeight - bb.top) * k));
      hecho = y1 > y0 ? draw(rot, y0, y1) : true;
    }
    if (hecho && !listo) { listo = true; alPintar(); }
    return hecho;
  }

  function frame(now) {
    raf = 0;
    if (!activo()) { last = null; return; }            // se reanuda con arrancar()
    raf = requestAnimationFrame(frame);
    const dt = last === null ? 0 : Math.min(100, now - last);   // sin saltos al volver
    last = now;
    const quieto = parado || pausado();
    if (!quieto) rot = (rot + dt / 1000 * MW / vuelta) % MW;
    if (t0 === null) t0 = now;
    const slot = Math.floor((now - t0 + 4) / (1000 / 60));
    if (slot === lastSlot) return;
    lastSlot = slot;
    if (quieto && completo && !sucio) return;           // parado y sin cambios: nada que pintar
    sucio = false;
    if (pintar(!completo)) completo = true;             // al (re)arrancar, una vez entero
  }

  function arrancar() {
    if (esNoche()) pideNoche();
    if (reduce.matches) {                               // sin movimiento: planeta quieto
      pintar(true);
      return;
    }
    if (!raf && activo()) {
      last = null;
      completo = false;
      raf = requestAnimationFrame(frame);
    }
  }

  // Cambio de tema (clase .dark en <html>; la misma lista de clases cambia
  // también al hacer scroll, de ahí comparar con el tema anterior): repintar
  // entero con la otra luz.
  let temaNoche = esNoche();
  const mo = new MutationObserver(() => {
    if (esNoche() !== temaNoche) {
      temaNoche = esNoche();
      completo = false;
      sucio = true;
    }
    arrancar();
  });
  const io = new IntersectionObserver(([e]) => { enVista = e.isIntersecting; arrancar(); });
  io.observe(canvas);
  mo.observe(html, { attributes: true, attributeFilter: ["class"] });
  reduce.addEventListener("change", arrancar);
  arrancar();

  // Punto de pantalla -> latitud/longitud (la inversa de la proyección del
  // precálculo, más el giro actual), de día y de noche.
  function geo(x, y) {
    const bb = canvas.getBoundingClientRect();
    const px = ((x - bb.left) * W / bb.width - D.CX) / R;
    const py = ((y - bb.top) * H / bb.height - D.CY) / R;
    const rr = px * px + py * py;
    if (rr > 1) return null;
    const pz = Math.sqrt(1 - rr);
    const lat = Math.asin(Math.max(-1, Math.min(1, -py * D.COST + pz * D.SINT))) * DEG;
    const lon = Math.atan2(px, py * D.SINT + pz * D.COST) * DEG - rot * 360 / MW;
    return { lat, lon: ((lon % 360) + 540) % 360 - 180 };
  }

  return {
    P,
    draw,
    geo,
    setVuelta(s) { vuelta = s; },
    // Botón de play/pausa: con el planeta parado el bucle sigue vivo (para
    // repintar la marca si cambia) pero no avanza el giro.
    setParado(b) { parado = b; },
    // Marca de blanco en { lat, lon } (null = quitarla).
    setMarca(p) {
      marca = p;
      if (!p) marcaPos = null;
      sucio = true;
      if (!raf) pintar(true);                         // sin bucle (reduce-motion…)
    },
    // Dónde se ve la marca ahora, en coordenadas de pantalla (null si no se ve).
    posMarca() {
      if (!marcaPos) return null;
      const bb = canvas.getBoundingClientRect();
      return { x: bb.left + marcaPos.cx * bb.width / W, y: bb.top + marcaPos.cy * bb.height / H };
    },
    desmontar() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      mo.disconnect();
      reduce.removeEventListener("change", arrancar);
    },
  };
}
