// Planeta del hero en <canvas>: la Tierra en pixel art girando de forma
// continua. Sustituye al sprite de 60 fotogramas, que iba a saltos de 2 s.
//
// Los datos salen de logo-files/generar-planeta-hero.py (a public/planeta/):
//   planeta-mapa.png   material de cada celda del mapa (R + G*256; B = hielo)
//   planeta-lut.png    color de cada material para cada escalón de luz
//   planeta-datos.json geometría, luz, prioridades, nubes y banderas
// El sol y el terminador no se mueven respecto a quien mira, así que todo lo
// que depende del píxel (qué celda del mapa cae ahí, cuánta luz le toca, halo,
// borde) se calcula una vez al cargar; en cada fotograma solo se busca
// "material de la celda -> color para este escalón de luz". Detalle y
// decisiones en logo-files/HERO-WIP.md, punto 7.
//
// Lo usan la portada (src/pages/index.astro) y el prototipo de
// logo-files/prototipo-canvas/.

// Subir al regenerar public/planeta/ (cache-busting: los archivos se llaman
// siempre igual).
export const PLANETA_V = 2;

const cargas = new Map();              // base -> Promise de datos preparados (una vez por página)

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
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

export function cargarPlaneta(base = "/planeta/") {
  if (!cargas.has(base)) cargas.set(base, preparar(base));
  return cargas.get(base);
}

async function preparar(base) {
  const v = `?v=${PLANETA_V}`;
  const [D, mapBm, lutBm] = await Promise.all([
    fetch(`${base}planeta-datos.json${v}`).then((r) => r.json()),
    bitmap(`${base}planeta-mapa.png${v}`),
    bitmap(`${base}planeta-lut.png${v}`),
  ]);
  const MW = D.MW, MH = D.MH, KN = D.LUT_KN, KMIN = D.LUT_KMIN;

  // Mapa: material por celda, y qué materiales son hielo (el limbo los
  // oscurece menos y con punteado suave).
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
  const lp = pixels(lutBm);
  const lut = new Uint32Array(D.MATERIALES * KN);
  for (let i = 0; i < lut.length; i++) {
    lut[i] = (255 << 24) | (lp[i * 4 + 2] << 16) | (lp[i * 4 + 1] << 8) | lp[i * 4];
  }

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
      const dc = Math.sqrt(rr), dth = (BAYER[sy & 3][sx & 3] + 0.5) / 16;
      const lam = px * D.SX + py * D.SY + pz * D.SZ;
      const termT = smooth(D.TERM_A, D.TERM_B, lam);
      const limbT = smooth(0.72, 1, dc);
      const ditherW = Math.max(1 - Math.abs(termT * 2 - 1), limbT);
      const kFor = (limbMul, dw) => {
        const bright = (D.NIGHT + (1 - D.NIGHT) * termT) * (1 - D.LIMB_K * limbT * limbMul);
        const k = Math.floor(Math.log(Math.max(bright, 1e-3)) / D.LNSTEP + 0.5 + (dth - 0.5) * 0.8 * dw);
        return Math.max(0, Math.min(KN - 1, k - KMIN));
      };
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
      kN.push(kFor(1, ditherW));
      kI.push(kFor(0.7, ditherW * D.ICE_DITHER));
      let haloA = 0, cov = 1;
      if (dc > 0.93 && lam > 0) {
        const halo = smooth(0.93, 1, dc) * smooth(0, 0.45, lam);
        haloA = 0.3 * (Math.floor(halo * 4 + 0.5 + (dth - 0.5) * 0.8) / 4);
      }
      if (dc > RIN) cov = 1 - smooth(RIN, ROUT, dc);
      if (haloA > 0 || cov < 1) post.push(n, haloA, cov);
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
    D, W, H, R, MW, KN, lv, lut, iceMat, N, rowStart, post,
    pIdx: Int32Array.from(idx), pBase: Int32Array.from(row), pCol: Int32Array.from(col),
    pL, pWrap: Int32Array.from(lev.map((L) => lvW[L])),
    pKN: Uint8Array.from(kN), pKI: Uint8Array.from(kI),
  };
}

// Monta el planeta en `canvas` y lo pone a girar. Devuelve { desmontar, draw,
// setVuelta, P }. `banderas`: códigos iso de las chapas a pintar (null = todas);
// `alMoverBanderas(lista, W, H)` recibe tras cada dibujo dónde queda cada chapa
// visible ({ iso, x, y } en píxeles del canvas, esquina de su contorno), para
// colocar encima lo que reacciona al ratón. Se para solo: fuera de pantalla, en modo oscuro (ahí se ve el
// sprite de noche de siempre), con la pestaña oculta y mientras `pausado()`
// devuelva true (en la portada: ratón sobre una nave). Con
// prefers-reduced-motion se pinta quieto.
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, vuelta?: number, pausado?: () => boolean, alPintar?: () => void,
 *   banderas?: string[] | null,
 *   alMoverBanderas?: ((lista: { iso: string, x: number, y: number }[], W: number, H: number) => void) | null }} [opciones]
 */
export async function montarPlaneta(canvas, {
  base = "/planeta/",
  vuelta = 90,                         // segundos por vuelta (elegido por el usuario)
  pausado = () => false,
  alPintar = () => {},                 // tras el primer dibujo completo
  banderas = null,
  alMoverBanderas = null,
} = {}) {
  const P = await cargarPlaneta(base);
  const { D, W, H, R, MW, KN, lv, lut, iceMat, rowStart, post } = P;
  const { pIdx, pBase, pCol, pL, pWrap, pKN, pKI } = P;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(W, H);
  const buf = new Uint32Array(img.data.buffer);
  const stamped = new Uint8Array(W * H);
  const SP = D.SPACE, AT = D.ATMO;
  const FLAGS = banderas ? D.banderas.filter((f) => banderas.includes(f.iso)) : D.banderas;

  function proyecta(lat, lon, lon0) {
    const rlat = lat / DEG, rlon = (lon - lon0) / DEG;
    const a = Math.sin(rlat), cl = Math.cos(rlat), vv = cl * Math.cos(rlon);
    const px = cl * Math.sin(rlon), py = -D.COST * a + D.SINT * vv, pz = D.SINT * a + D.COST * vv;
    const lam = px * D.SX + py * D.SY + pz * D.SZ;
    return [px, py, pz, smooth(D.TERM_A + 0.06, D.TERM_B + 0.2, lam)];
  }

  // Nubes: plantillas ya escaladas en Python, estampadas encima.
  function nubes(lon0) {
    const touched = [];
    for (const nb of D.nubes) {
      const [px, py, pz, bright] = proyecta(nb.lat, nb.lon, lon0);
      if (pz <= 0.5 || bright < 0.12) continue;
      const cx = px * R + D.CX - 0.5, cy = py * R + D.CY - 0.5;
      const xsc = 0.72 + 0.28 * pz, t = 0.72 + 0.28 * bright;
      const cols = [pack(mixc(SP, D.C_BODY, Math.min(1, t + 0.1))),
                    pack(mixc(SP, D.C_BASE, t)),
                    pack(mixc(SP, D.C_EDGE, Math.max(0.7, t)))];
      for (const [ox, oy, k] of nb.cells) {
        const ddx = ox - nb.dw / 2;
        const x = Math.round(cx + (nb.flip ? -ddx : ddx) * xsc);
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

  // Chapas de bandera (países del blog): sombra de 1 px sobre el planeta, y la
  // chapa encima de las nubes. Solo en la cara iluminada y lejos del borde.
  function chapasVisibles(lon0) {
    const vis = [];
    for (const f of FLAGS) {
      const [px, py, pz, bright] = proyecta(f.lat, f.lon, lon0);
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

  // rot: giro en celdas del mapa, con decimales; y0..y1: filas a pintar.
  function draw(rot, y0 = 0, y1 = H) {
    const rf = Math.round(rot * 256);                 // coma fija: 1/256 de celda
    const n0 = rowStart[y0], n1 = rowStart[y1];
    for (let n = n0; n < n1; n++) {
      let c = (pCol[n] - rf) >> (8 + pL[n]);           // >> redondea hacia abajo también en negativos
      if (c < 0) c += pWrap[n];
      const m = lv[pBase[n] + c];
      buf[pIdx[n]] = lut[m * KN + (iceMat[m] ? pKI[n] : pKN[n])];
    }
    for (let i = 0; i < post.length; i += 3) {       // halo y borde suavizado
      if (post[i] < n0 || post[i] >= n1) continue;
      const p = pIdx[post[i]], a = post[i + 1], cov = post[i + 2];
      const v = buf[p];
      let r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255;
      if (a > 0) { r += (AT[0] - r) * a; g += (AT[1] - g) * a; b += (AT[2] - b) * a; }
      if (cov < 1) { r = SP[0] + (r - SP[0]) * cov; g = SP[1] + (g - SP[1]) * cov; b = SP[2] + (b - SP[2]) * cov; }
      buf[p] = (255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r);
    }
    const lon0 = -rot * 360 / MW;
    const vis = chapasVisibles(lon0);
    sombras(vis);
    nubes(lon0);
    chapas(vis);
    ctx.putImageData(img, 0, 0, 0, y0, W, y1 - y0);  // solo sube a la GPU la franja pintada
    if (alMoverBanderas) alMoverBanderas(vis.map(([f, ox, oy]) => ({ iso: f.iso, x: ox - 1, y: oy - 1 })), W, H);
  }

  // ---- bucle
  // Giro CONTINUO: en cada fotograma el mapa avanza la fracción de celda que
  // toque y cada borde salta su píxel justo cuando le toca, a ritmo constante.
  // Se dibuja en franjas fijas de 1/60 s (con 4 ms de margen): a 120 Hz, justo
  // un fotograma de cada dos. Solo se pintan las filas que caen en la ventana.
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let rot = 0, raf = 0, last = null, t0 = null, lastSlot = -1;
  let enVista = true, completo = false, listo = false;

  const activo = () => enVista && !html.classList.contains("dark") && !reduce.matches;

  function pintar(todo) {
    if (todo) {
      draw(rot, 0, H);
    } else {
      const bb = canvas.getBoundingClientRect(), k = H / bb.height;
      const y0 = Math.max(0, Math.floor(-bb.top * k));
      const y1 = Math.min(H, Math.ceil((innerHeight - bb.top) * k));
      if (y1 > y0) draw(rot, y0, y1);
    }
    if (!listo) { listo = true; alPintar(); }
  }

  function frame(now) {
    raf = 0;
    if (!activo()) { last = null; return; }            // se reanuda con arrancar()
    raf = requestAnimationFrame(frame);
    const dt = last === null ? 0 : Math.min(100, now - last);   // sin saltos al volver
    last = now;
    if (pausado()) return;
    rot = (rot + dt / 1000 * MW / vuelta) % MW;
    if (t0 === null) t0 = now;
    const slot = Math.floor((now - t0 + 4) / (1000 / 60));
    if (slot === lastSlot) return;
    lastSlot = slot;
    pintar(!completo);                                  // al (re)arrancar, una vez entero
    completo = true;
  }

  function arrancar() {
    if (reduce.matches) {                               // sin movimiento: planeta quieto
      if (!html.classList.contains("dark")) pintar(true);
      return;
    }
    if (!raf && activo()) {
      last = null;
      completo = false;
      raf = requestAnimationFrame(frame);
    }
  }

  const io = new IntersectionObserver(([e]) => { enVista = e.isIntersecting; arrancar(); });
  io.observe(canvas);
  const mo = new MutationObserver(arrancar);           // cambio de tema (clase .dark en <html>)
  mo.observe(html, { attributes: true, attributeFilter: ["class"] });
  reduce.addEventListener("change", arrancar);
  arrancar();

  return {
    P,
    draw,
    setVuelta(s) { vuelta = s; },
    desmontar() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      mo.disconnect();
      reduce.removeEventListener("change", arrancar);
    },
  };
}
