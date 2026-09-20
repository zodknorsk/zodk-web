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
export const PLANETA_V = 10;

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
  // El planeta (W x H px de arte) se pinta en un lienzo aparte y se vuelca al
  // canvas visible, que mide lo mismo que en pantalla (píxeles de dispositivo),
  // ampliado sin suavizado. Antes el canvas era de W x H y lo ampliaba el CSS
  // con image-rendering: pixelated, pero Firefox/Zen lo suavizaba igual (se
  // veía con menos detalle, más a pantalla completa). Igual que la Luna
  // (src/scripts/luna.js). Tope LADO_MAX de ancho para no disparar la memoria.
  // Desde el 20-sep-2026 el lienzo visible no va a los píxeles de pantalla sino
  // a un múltiplo entero del arte, ×3 como mucho: ver anchoVisible, que es
  // donde está medido por qué.
  const LADO_MAX = 3000;
  // ?medir imprime los ms por fotograma (Zen no se puede manejar desde fuera).
  // ?lienzo=pantalla vuelve al lienzo de antes y ?lienzo=3 (o 4, o 5) fuerza ese
  // múltiplo del arte, para comparar nitidez y coste en el navegador del usuario.
  const OPC = new URLSearchParams(location.search);
  const MEDIR = OPC.has("medir");
  const LIENZO = OPC.get("lienzo");   // "pantalla" = como antes; un número = ese múltiplo del arte
  const fuente = document.createElement("canvas");
  fuente.width = W;
  fuente.height = H;
  const fctx = fuente.getContext("2d");
  const ctx = canvas.getContext("2d");
  let anchoCv = 0;
  const img = fctx.createImageData(W, H);
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

  // Aurora boreal (noche): cortinas de rayos alrededor del polo norte
  // geomagnético (el óvalo auroral), de AUR_H0 a AUR_H1 radios terrestres de
  // altura. Cada rayo es una columna de puntos 3D que gira con la Tierra y se
  // proyecta como el resto; un punto se ve si está en la cara de delante o si
  // cae fuera del disco (por encima del horizonte). Los que quedan por encima
  // del borde de arriba del canvas van a una franja aparte (auroraCv, AUR_MT
  // filas encima del planeta). Brillo por píxel sumado y reducido a pocos
  // niveles (verde abajo, violeta arriba), como las luces de las ciudades.
  // Los pliegues ondulan y los haces van y vienen despacio. Al anochecer (y al
  // cargar de noche) se enciende recorriendo el óvalo como una serpiente que se
  // muerde la cola, con la cabeza más brillante (como el "surge" de una
  // subtormenta; idea del usuario).
  const AUR_POLO = [80.7, -72.7];                      // polo norte geomagnético (lat, lon)
  const AUR_R = 21, AUR_WOB = 2.2;                     // radio del óvalo y ondulación, en grados
  // arcos paralelos: desvío (grados), brillo y si solo están en el lado de medianoche
  const AUR_ARCOS = [[0, 1, 0], [1.3, 0.6, 0]];     // (se probaron 2 más en medianoche: al usuario le gustaba más con menos)
  const AUR_BARRIDO = 3.6;                             // segundos que tarda la "serpiente" en cerrar el óvalo
  const AUR_N = 1000, AUR_K = 11, AUR_H0 = 0.016, AUR_H1 = 0.05;
  const AUR_MT = 24;                                   // filas de canvas por encima del planeta
  // niveles: [intensidad mínima, color, opacidad]; translúcida, el verde de la
  // línea de 557 nm de oxígeno, más pálido solo donde se amontona mucho
  const AUR_NIV = [
    [0.10, [30, 150, 105], 0.13], [0.22, [40, 190, 120], 0.22], [0.40, [60, 225, 140], 0.33],
    [0.70, [100, 245, 165], 0.46], [1.15, [170, 255, 205], 0.6],
  ];
  const AUR_VIOLETA = [140, 90, 240];
  const AUR_DIFUSO = [[-1.8, 0], [1.4, 0]];            // resplandor sobre el suelo, a los lados del arco (grados)
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const TABLA = Float32Array.from({ length: 256 }, (_, i) => rnd(i));
  const ruido = (x) => {                               // ruido de valor 1D, periódico en 256
    const i = Math.floor(x), f = x - i, t = f * f * (3 - 2 * f);
    return TABLA[i & 255] * (1 - t) + TABLA[(i + 1) & 255] * t;
  };
  // por rayo: brillo propio (estrías) y altura propia (borde de arriba dentado)
  const aurEstria = Float32Array.from({ length: AUR_N * AUR_ARCOS.length }, (_, i) => 0.3 + 0.7 * rnd(i + 1000) ** 2);
  const aurTope = Uint8Array.from({ length: AUR_N * AUR_ARCOS.length }, (_, i) => Math.round(AUR_K * (0.35 + 0.65 * rnd(i * 7 + 3) ** 0.8)));
  const aurPerfil = Float32Array.from({ length: AUR_K }, (_, k) => (k < 2 ? 0.55 - k * 0.05 : Math.exp(-(k - 1) / 4.5) * 0.5));
  const aurAlto = Float32Array.from({ length: AUR_K }, (_, k) => 1 + AUR_H0 + (AUR_H1 - AUR_H0) * k / (AUR_K - 1));
  let auroraCv = null, auroraFuente = null, auroraCtx = null, auroraImg = null, auroraBuf = null;
  function vuelcaAurora() {
    if (!auroraCv) return;
    const a = auroraCv.getContext("2d");
    a.imageSmoothingEnabled = auroraCv.width < W;
    a.clearRect(0, 0, auroraCv.width, auroraCv.height);
    a.drawImage(auroraFuente, 0, 0, auroraCv.width, auroraCv.height);
  }
  let aurInicio = null;                                // cuándo empieza a encenderse (ms)
  let aurCola = null, aurSentido = 1;                  // dónde arranca el encendido en el óvalo (0..1) y hacia dónde
  let aurAcc = null, aurVio = null, aurToc = null, aurMarca = null;
  // Cielo alrededor del disco hasta donde llega la aurora: el dibujo del
  // planeta no repinta esos píxeles, así que se vacían en cada fotograma (si
  // no, lo que pinta la aurora, o lo que deja un fundido, se quedaría pegado).
  const aurAnillo = (() => {
    const out = [], rMax = (1 + AUR_H1 + 0.01) * R, rMin = R + D.LIMB_AA;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const d = Math.hypot(x + 0.5 - D.CX, y + 0.5 - D.CY);
        if (d > rMin && d <= rMax) out.push(y * W + x);
      }
    }
    return Int32Array.from(out);
  })();
  function borraCielo() { for (let n = 0; n < aurAnillo.length; n++) buf[aurAnillo[n]] = 0; }
  function aurora(lon0, y0, y1, t) {
    const WT = W * (H + AUR_MT);                       // acumuladores: franja de arriba + canvas
    if (!aurAcc) {
      aurAcc = new Float32Array(WT); aurVio = new Float32Array(WT);
      aurToc = new Int32Array(WT); aurMarca = new Uint8Array(WT);
    }
    const S = D.SINT, C = D.COST, c0 = Math.cos(lon0 / DEG), s0 = Math.sin(lon0 / DEG);
    const fp = AUR_POLO[0] / DEG, lp = AUR_POLO[1] / DEG, sfp = Math.sin(fp), cfp = Math.cos(fp);
    let nt = 0;
    const suma = (X, Y, v, vio) => {
      if (X < 0 || X >= W || Y < -AUR_MT || Y >= y1 || (Y >= 0 && Y < y0)) return;
      const p = (Y + AUR_MT) * W + X;
      if (aurMarca[p] === 0) { aurMarca[p] = 1; aurToc[nt++] = p; }
      aurAcc[p] += v;
      if (vio) aurVio[p] += v;
    };
    // punto del óvalo a th grados del polo, en el azimut al -> (bx, by, bz) en pantalla
    const punto = (al, th) => {
      const sth = Math.sin(th), cth = Math.cos(th);
      const sl = sfp * cth + cfp * sth * Math.cos(al), cl = Math.sqrt(1 - sl * sl);
      const lon = lp + Math.atan2(Math.sin(al) * sth * cfp, cth - sfp * sl);
      const cr = Math.cos(lon) * c0 + Math.sin(lon) * s0, sr = Math.sin(lon) * c0 - Math.cos(lon) * s0;
      const vv = cl * cr;
      return [cl * sr, -C * sl + S * vv, S * sl + C * vv];
    };
    if (aurInicio === null) aurInicio = performance.now() + 300;
    const el = reduce.matches ? 1e9 : (performance.now() - aurInicio) / 1000;
    // Encendido como una serpiente que se muerde la cola: arranca en el punto
    // del óvalo más a la izquierda de la cara de delante, avanza por delante
    // hacia la derecha, vuelve por el fondo y cierra donde empezó.
    const frente = el < AUR_BARRIDO * 1.3 ? el / AUR_BARRIDO * 1.1 : null;
    if (frente !== null && aurCola === null) {
      let mejor = 2, uMejor = 0;
      for (let i = 0; i < AUR_N; i += 4) {
        const b = punto((i / AUR_N) * 2 * Math.PI, AUR_R / DEG);
        if (b[2] > 0.15 && b[0] < mejor) { mejor = b[0]; uMejor = i / AUR_N; }
      }
      // sentido: el que sigue por la parte de delante (más abajo en pantalla),
      // para acabar cerrando por el fondo, con las cortinas sobre el horizonte
      const ya = punto((uMejor + 0.02) * 2 * Math.PI, AUR_R / DEG)[1];
      const yb = punto((uMejor - 0.02) * 2 * Math.PI, AUR_R / DEG)[1];
      aurCola = uMejor;
      aurSentido = ya > yb ? 1 : -1;
    }
    if (frente === null) aurCola = null;
    for (let i = 0; i < AUR_N; i++) {
      const u = i / AUR_N, al = u * 2 * Math.PI;
      // pliegues: el radio del óvalo ondula a lo largo y con el tiempo
      const th0 = AUR_R + AUR_WOB * (ruido(u * 9 + t * 0.05) * 2 - 1) + 0.9 * (ruido(u * 31 - t * 0.09) * 2 - 1);
      // haces: el brillo va y viene a lo largo del óvalo
      let A = 2.05 * Math.max(0, ruido(u * 23 + t * 0.12) * 1.2 - 0.15) * (0.6 + 0.4 * ruido(u * 5 + 40 + t * 0.03));
      if (A < 0.05) continue;
      const base = punto(al, th0 / DEG);
      const med = base[2] <= 0.05 ? 0 : base[2] >= 0.6 ? 1 : (base[2] - 0.05) / 0.55;   // cuánto mira hacia nosotros
      if (frente !== null) {                           // encendido: la cabeza de la serpiente, más brillante
        const d = frente - ((((u - aurCola) * aurSentido) % 1) + 1) % 1;
        if (d <= 0) continue;
        A *= (d < 0.25 ? d / 0.25 : 1) * (d < 0.06 ? 1.8 : d < 0.13 ? 1.35 : 1);
      }
      for (let a = 0; a < AUR_ARCOS.length; a++) {
        const [dth, fa, soloMed] = AUR_ARCOS[a];
        const fm = soloMed ? med : 1;
        if (fm < 0.05) continue;
        const Ai = A * fa * fm * aurEstria[a * AUR_N + i] * (0.7 + 0.3 * ruido(u * 90 + a * 17 - t * 0.4));
        // cada arco con su propia ondulación, para que no vayan paralelos
        const [bx, by, bz] = a ? punto(al, (th0 + dth + 0.8 * (ruido(u * 14 + a * 50 + t * 0.07) * 2 - 1)) / DEG) : base;
        const tope = aurTope[a * AUR_N + i];
        if (bz <= 0) {                                 // por detrás: si ni la punta asoma, fuera
          const rt = aurAlto[tope - 1], xt = bx * rt, yt = by * rt;
          if (xt * xt + yt * yt < 1) continue;
        }
        const paso = soloMed ? 2 : 1;                  // los de medianoche se ven desde arriba: menos puntos
        for (let k = 0; k < tope; k += paso) {
          const r = aurAlto[k], x = bx * r, y = by * r;
          if (bz <= 0 && x * x + y * y < 1) continue;   // tapado por la Tierra
          const fin = k >= tope - 3 ? (tope - k) / 4 : 1;   // cada rayo se apaga en su punta
          suma(Math.round(x * R + D.CX - 0.5), Math.round(y * R + D.CY - 0.5), Ai * aurPerfil[k] * fin * paso, k > tope * 0.62 && tope > AUR_K * 0.7);
        }
      }
      if (i % 3 === 0) {                               // resplandor difuso sobre el suelo, entre los arcos
        for (const [d, soloMed] of AUR_DIFUSO) {
          const fm = soloMed ? med : 1;
          if (fm < 0.05) continue;
          const [bx, by, bz] = punto(al, (th0 + d) / DEG);
          if (bz <= 0) continue;
          suma(Math.round(bx * R + D.CX - 0.5), Math.round(by * R + D.CY - 0.5), A * fm * 0.13 * (1 - Math.abs(d) / 4.5), false);
        }
      }
    }
    if (!auroraBuf) {
      auroraFuente = document.createElement("canvas");
      auroraFuente.width = W; auroraFuente.height = AUR_MT;
      auroraCv = document.createElement("canvas");
      auroraCv.width = canvas.width; auroraCv.height = Math.round(AUR_MT * canvas.height / H);
      auroraCv.className = "hero-aurora";
      auroraCv.setAttribute("aria-hidden", "true");
      auroraCv.style.cssText = `position:absolute;left:0;width:100%;top:${-AUR_MT / H * 100}%;height:${AUR_MT / H * 100}%;image-rendering:pixelated;pointer-events:none`;
      canvas.parentElement?.appendChild(auroraCv);
      auroraCtx = auroraFuente.getContext("2d");
      auroraImg = auroraCtx.createImageData(W, AUR_MT);
      auroraBuf = new Uint32Array(auroraImg.data.buffer);
    }
    auroraBuf.fill(0);
    const LIM = AUR_MT * W;
    for (let n = 0; n < nt; n++) {
      const p = aurToc[n], v = aurAcc[p], vi = aurVio[p] / (v || 1);
      aurAcc[p] = 0; aurVio[p] = 0; aurMarca[p] = 0;
      let l = -1;
      while (l + 1 < AUR_NIV.length && v >= AUR_NIV[l + 1][0]) l++;
      if (l < 0) continue;
      let c = AUR_NIV[l][1];
      const a = AUR_NIV[l][2];
      if (vi > 0.45) c = [c[0] + (AUR_VIOLETA[0] - c[0]) * 0.65, c[1] + (AUR_VIOLETA[1] - c[1]) * 0.65, c[2] + (AUR_VIOLETA[2] - c[2]) * 0.65];
      if (p < LIM) {                                   // por encima del planeta: sobre el cielo
        auroraBuf[p] = (Math.round(a * 255) << 24) | (Math.round(c[2]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[0]);
      } else {
        const q = p - LIM, bg = buf[q];
        if ((bg >>> 24) === 0) {                       // fuera del disco en el canvas: sobre el cielo
          buf[q] = (Math.round(a * 255) << 24) | (Math.round(c[2]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[0]);
          continue;
        }
        const r0 = bg & 255, g0 = (bg >> 8) & 255, b0 = (bg >> 16) & 255;
        buf[q] = (255 << 24) | (Math.round(b0 + (c[2] - b0) * a) << 16) | (Math.round(g0 + (c[1] - g0) * a) << 8) | Math.round(r0 + (c[0] - r0) * a);
      }
    }
    auroraCtx.putImageData(auroraImg, 0, 0);
    vuelcaAurora();
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
  // Pinta en `buf` las filas y0..y1 con la luz del día o de la luna, con todo
  // lo de encima (luces, chapas, nubes, marca). Devuelve las chapas visibles.
  function pinta(rot, y0, y1, luna) {
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
    if (luna) { aurora(lon0, y0, y1, performance.now() / 1000); if (auroraCv) auroraCv.style.visibility = ""; }
    chapas(vis);
    pintaMarca(lon0, luna);
    return vis;
  }

  // Fundido al cambiar de tema: durante FUNDIDO_MS se pinta el planeta con la
  // luz vieja y con la nueva y se mezclan (el doble de trabajo, solo ese rato),
  // así se funde sin cortar el giro ni dejar imagen doble. Va a la par que el
  // sol que se pone tras la Tierra (index.astro / global.css).
  const FUNDIDO_MS = 1500;
  let fundido = null, viejo = null;                    // { t0, desdeLuna } y copia de la luz vieja
  let fundidoPendiente = false;
  function draw(rot, y0 = 0, y1 = H) {
    const luna = esNoche();
    if (luna && !noche) return false;
    const tMed = MEDIR ? performance.now() : 0;
    borraCielo();
    let k = 1;
    if (fundido) {
      k = (performance.now() - fundido.t0) / FUNDIDO_MS;
      if (k >= 1 || (fundido.desdeLuna && !noche)) { fundido = null; k = 1; }
    }
    let vis;
    if (k < 1) {
      if (!viejo) viejo = new Uint32Array(W * H);
      pinta(rot, y0, y1, fundido.desdeLuna);
      viejo.set(buf.subarray(y0 * W, y1 * W), y0 * W);
      borraCielo();
      vis = pinta(rot, y0, y1, luna);
      const e = k * k * (3 - 2 * k), q = Math.round(e * 256), iq = 256 - q;
      for (let p = y0 * W, fin = y1 * W; p < fin; p++) {
        const a = viejo[p], b = buf[p];
        if (a === b) continue;
        buf[p] = (Math.max(a >>> 24, b >>> 24) << 24)
          | ((((a >> 16) & 255) * iq + ((b >> 16) & 255) * q) >> 8) << 16
          | ((((a >> 8) & 255) * iq + ((b >> 8) & 255) * q) >> 8) << 8
          | (((a & 255) * iq + (b & 255) * q) >> 8);
      }
    } else {
      vis = pinta(rot, y0, y1, luna);
    }
    if (auroraCv) {                                    // la franja de la aurora: solo de noche, y se funde con el planeta
      const e = k < 1 ? k * k * (3 - 2 * k) : 1;
      auroraCv.style.opacity = String(k < 1 ? (luna ? e : 1 - e) : 1);
      if (!luna && k >= 1) auroraCv.style.visibility = "hidden";
    }
    fctx.putImageData(img, 0, 0, 0, y0, W, y1 - y0);  // solo la franja pintada
    if (MEDIR) msDibujo += performance.now() - tMed;
    vuelca();
    if (MEDIR) { medN++; medidor(); }
    if (alMoverBanderas) alMoverBanderas(vis.map(([f, ox, oy]) => ({ iso: f.iso, x: ox - 1, y: oy - 1 })), W, H);
    if (alDibujar) alDibujar();
    return true;
  }

  // ---- bucle
  // Giro CONTINUO: en cada fotograma el mapa avanza la fracción de celda que
  // toque y cada borde salta su píxel justo cuando le toca, a ritmo constante.
  // Se dibuja en franjas fijas de 1/FPS (con 4 ms de margen), así que a 120 Hz
  // se pinta uno de cada cuatro fotogramas. Solo se pintan las filas que caen
  // en la ventana.
  // FPS = 30 y no 60 (20-sep-2026): el planeta da una vuelta cada 90 s, así que
  // a 30 fps cada fotograma avanza 0,13° — invisible — y se repinta la mitad de
  // veces. Importa porque cada repintado borra y reescala el lienzo visible
  // entero (vuelca(), unos 5 MP a pantalla completa): a 60 fps eso calentaba el
  // portátil del usuario en Zen (medido: 27-33 W de día y 31-37 de noche, frente
  // a 16 W en reposo). Si se vuelve a tocar, medir con el planeta a pantalla
  // completa, no en una ventana pequeña.
  // Lienzo de arte entero al canvas visible (sin suavizado si se amplía; si
  // se ve más pequeño que el arte, suavizado: reducir sin suavizar pierde
  // píxeles). Entero y no por franjas: con escala no entera, las franjas
  // dejarían costuras.
  const FPS = 30;                                      // repintados por segundo (ver el bloque de arriba)

  // ---- medidor (?medir): caja fija abajo a la izquierda con los ms de cada
  // parte del fotograma. Sin ?medir no se ejecuta nada de esto.
  let msDibujo = 0, msVuelca = 0, medN = 0, medT0 = 0, medCaja = null;
  function medidor() {
    if (!medCaja) {
      medCaja = document.createElement("div");
      medCaja.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;background:#000c;color:#7fff7f;"
        + "font:12px/1.5 ui-monospace,monospace;padding:6px 8px;white-space:pre;pointer-events:none;border-radius:4px";
      document.body.appendChild(medCaja);
      medT0 = performance.now();
      return;
    }
    const dt = performance.now() - medT0;
    if (dt < 1000) return;
    const n = Math.max(1, medN);
    medCaja.textContent =
      `${(medN / dt * 1000).toFixed(0)} fps · dibujo ${(msDibujo / n).toFixed(1)} ms · volcado ${(msVuelca / n).toFixed(1)} ms\n`
      + `arte ${W}x${H} · lienzo ${canvas.width}x${canvas.height} (x${(canvas.width / W).toFixed(2)}) · `
      + `${(canvas.width * canvas.height / 1e6).toFixed(2)} MP por volcado`;
    msDibujo = msVuelca = medN = 0;
    medT0 = performance.now();
  }

  function vuelca() {
    const t = MEDIR ? performance.now() : 0;
    ctx.imageSmoothingEnabled = canvas.width < W;
    ctx.imageSmoothingQuality = "high";
    // "copy" sustituye lo que había: una pasada de relleno en vez de dos
    // (clearRect + drawImage). El resultado es idéntico, también con el cielo
    // transparente, porque se cubre el lienzo entero.
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    if (MEDIR) msVuelca += performance.now() - t;
  }
  // El lienzo visible se queda en un múltiplo ENTERO del arte y como mucho ×3.
  // Lo que falte hasta el tamaño real en pantalla lo amplía el CSS, o sea la
  // GPU al componer, que sale gratis; el volcado por software es lo que cuesta.
  // Medido en Zen a pantalla completa (20-sep-2026, con ?medir): a ×5 (el tope
  // de 3000 px, 8,78 MP) el volcado tardaba 7,1 ms por fotograma; a ×3 (1800 px,
  // 3,16 MP), 3,8 ms. El usuario comparó las dos de noche —las luces de ciudad
  // son el detalle más fino— y **las vio iguales de nítidas**, así que ×3.
  // Por debajo de ×2 se usa el tamaño exacto de pantalla: en ventana estrecha
  // el múltiplo entero se veía suavizado (se probó al hacer 625bffb).
  const MULT_MAX = 3;
  function anchoVisible() {
    const w = Math.round(canvas.getBoundingClientRect().width * (window.devicePixelRatio || 1));
    const bruto = Math.min(LADO_MAX, w > 0 ? w : W);
    if (LIENZO === "pantalla") return bruto;
    const forzado = Number(LIENZO);
    if (forzado >= 1) return Math.min(LADO_MAX, Math.round(forzado) * W);
    const k = Math.min(MULT_MAX, Math.floor(bruto / W));
    return k >= 2 ? k * W : bruto;
  }
  function ajusta() {
    const nuevo = anchoVisible();
    if (nuevo === anchoCv) return;
    anchoCv = nuevo;
    canvas.width = nuevo;                              // (cambiar el tamaño borra el canvas)
    canvas.height = Math.round(nuevo * H / W);
    vuelca();
    if (auroraCv) {
      auroraCv.width = canvas.width;
      auroraCv.height = Math.round(AUR_MT * canvas.height / H);
      vuelcaAurora();
    }
  }
  ajusta();
  const ro = new ResizeObserver(() => ajusta());
  ro.observe(canvas);

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
      if (fundidoPendiente && esNoche() && !reduce.matches) fundido = { t0: performance.now(), desdeLuna: false };
      fundidoPendiente = false;
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
    const slot = Math.floor((now - t0 + 4) / (1000 / FPS));
    if (slot === lastSlot) return;
    lastSlot = slot;
    if (quieto && completo && !sucio && !fundido) return;   // parado y sin cambios: nada que pintar
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
      // fundido solo si ya había planeta pintado, hay bucle y están los datos
      // de las dos luces (si la noche aún no ha llegado, el cambio es seco)
      fundido = listo && !reduce.matches && noche ? { t0: performance.now(), desdeLuna: !temaNoche } : null;
      fundidoPendiente = listo && temaNoche && !noche;   // arranca al llegar los datos de noche
      if (temaNoche) aurInicio = performance.now() + 900;   // la aurora se enciende cuando ya es de noche
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
      auroraCv?.remove();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      mo.disconnect();
      reduce.removeEventListener("change", arrancar);
    },
  };
}
