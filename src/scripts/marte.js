// Marte en <canvas> (Proyecto Marte, rama mars-project): un planeta que se
// gira con la mano (clic y arrastrar, como Google Maps).
//
// Giro "tipo globo terráqueo": el norte siempre arriba y sin ladear. La
// orientación son dos números, `lat0` (cuánto se inclina el norte hacia quien
// mira, de -90 a 90) y `lon0` (longitud del centro); la misma cuenta que
// orientacion() de src/scripts/luna.js con Ry(lon0)·Rx(lat0). La luz se
// queda fija respecto a quien mira, como en la Tierra.
//
// Por qué es barato: con `lat0` fija, cada píxel de pantalla cae siempre en la
// misma latitud y en la misma longitud RELATIVA al centro, y el eje del
// planeta no se mueve en pantalla, así que también es fija la luz del sol en
// la base local (este, norte, arriba) de ese píxel. Todo eso se calcula una
// vez en tablas por píxel (montarTablas) y cambiar `lon0` es solo desplazar
// la columna del mapa: arrastrar a los lados cuesta como el giro de la Tierra
// de la portada. Inclinar (cambiar `lat0`) rehace las tablas, solo mientras
// se arrastra. Quieto no se repinta nada.
//
// En reposo se pinta un fotograma limpio (dos pasadas de quitar píxeles
// sueltos, como el generador); mientras se arrastra, sin ellas (en la Luna el
// usuario no las echaba de menos durante el giro).
//
// Datos de `python3 logo-files/generar-marte.py --canvas public/marte/`:
//   marte-mapa.png   R = material, G/B = normal este/norte (0..NORMAL_NIVELES-1 -> -1..1)
//   marte-lut.png    color por material y escalón de luz
//   marte-datos.json constantes de luz y geometría
// Lo usa logo-files/prototipo-marte/canvas.html. Detalle y decisiones en
// logo-files/MARTE-WIP.md.

// Subir al regenerar public/marte/ (cache-busting: los archivos se llaman
// siempre igual).
export const MARTE_V = 4;

const DEG = Math.PI / 180;

async function bitmap(url) {
  const blob = await fetch(url).then((r) => r.blob());
  // Sin gestión de color: el mapa y la LUT llevan índices y normales.
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

// Datos, mapa con mipmaps en longitud (todos los niveles seguidos en un array
// por dato, como luna.js) y LUT en el formato Uint32 del ImageData.
const cargas = new Map();
export function cargarMarte(base = "/marte/") {
  if (!cargas.has(base)) {
    cargas.set(base, (async () => {
      const v = `?v=${MARTE_V}`;
      const [D, mapBm, lutBm] = await Promise.all([
        fetch(`${base}marte-datos.json${v}`).then((r) => r.json()),
        bitmap(`${base}marte-mapa.png${v}`),
        bitmap(`${base}marte-lut.png${v}`),
      ]);
      const MW = D.MAPA_W, MH = D.MAPA_H, NQ = (D.NORMAL_NIVELES - 1) / 2;
      // Mipmaps en longitud: hacia los polos un píxel del disco abarca varias
      // celdas de longitud, y leer una sola hace que el detalle parpadee al
      // girar. En latitud no hace falta (en la Luna dejaba bloques en abanico
      // alrededor del polo). Material: gana el de la izquierda del par (en
      // Marte los materiales no son "prioridades" como las costas de la
      // Tierra); normal: la media.
      const mp = pixels(mapBm);
      const niv = [{ w: MW, mat: new Uint8Array(MW * MH), ne: new Int8Array(MW * MH), nn: new Int8Array(MW * MH) }];
      for (let i = 0; i < MW * MH; i++) {
        niv[0].mat[i] = mp[i * 4];
        niv[0].ne[i] = Math.round((mp[i * 4 + 1] / NQ - 1) * 127);
        niv[0].nn[i] = Math.round((mp[i * 4 + 2] / NQ - 1) * 127);
      }
      while (niv[niv.length - 1].w % 2 === 0 && niv.length < 6) {
        const p = niv[niv.length - 1], pw = p.w, w = pw >> 1;
        const n = { w, mat: new Uint8Array(w * MH), ne: new Int8Array(w * MH), nn: new Int8Array(w * MH) };
        for (let r = 0; r < MH; r++) {
          for (let c = 0; c < w; c++) {
            const a = r * pw + 2 * c, o = r * w + c;
            n.mat[o] = p.mat[a];
            n.ne[o] = Math.round((p.ne[a] + p.ne[a + 1]) / 2);
            n.nn[o] = Math.round((p.nn[a] + p.nn[a + 1]) / 2);
          }
        }
        niv.push(n);
      }
      const NIV = niv.length, nvOff = new Int32Array(NIV), nvW = new Int32Array(NIV);
      let total = 0;
      niv.forEach((n, L) => { nvOff[L] = total; nvW[L] = n.w; total += n.w * MH; });
      const MAT = new Uint8Array(total), NE = new Int8Array(total), NN = new Int8Array(total);
      niv.forEach((n, L) => { MAT.set(n.mat, nvOff[L]); NE.set(n.ne, nvOff[L]); NN.set(n.nn, nvOff[L]); });
      const lp = pixels(lutBm);
      const lut = new Uint32Array(lp.length / 4);
      for (let i = 0; i < lut.length; i++) {
        lut[i] = (255 << 24) | (lp[i * 4 + 2] << 16) | (lp[i * 4 + 1] << 8) | lp[i * 4];
      }
      return { D, NIV, nvOff, nvW, MAT, NE, NN, lut };
    })());
  }
  return cargas.get(base);
}

// Monta Marte en `canvas`, que ocupa todo su contenedor (el disco va centrado
// en él). `disco()` da el diámetro del disco en píxeles CSS: el tamaño del
// píxel de arte sale de ahí (diámetro / 2·RADIUS). `alPintar(ms)` avisa tras
// cada fotograma con lo que ha tardado.
// Devuelve { vista(), ponVista(lat0, lon0), mueve(dx, dy), suelta(), medir(),
// desmontar() }. `mueve` y `suelta` son para montarMano (abajo).
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, lat0?: number, lon0?: number, disco?: () => number,
 *   alPintar?: (ms: number, limpio: boolean) => void }} [opciones]
 */
export async function montarMarte(canvas, {
  base = "/marte/",
  lat0: lat0Ini = 10,
  lon0: lon0Ini = -80,
  disco = () => 0.6 * window.innerHeight,
  alPintar = () => {},
} = {}) {
  const P = await cargarMarte(base);
  const { D, NIV, nvOff, nvW, MAT, NE, NN, lut } = P;
  const MW = D.MAPA_W, MH = D.MAPA_H, R = D.RADIUS;
  const LS = D.LIGHT_SUB, LN = D.LNSTEP, KN = D.LUT_KN, KMIN = D.LUT_KMIN * LS;
  const EM = D.RELIEVE_ELEV_MAX * DEG, sinEM = Math.sin(EM), cosEM = Math.cos(EM);
  const RIN = 1 - D.LIMB_AA / R, ROUT = 1 + D.LIMB_AA / R;
  const SP = D.SPACE;
  const jNoche = Math.round(Math.log(D.NOCHE) / LN * LS);   // la sombra no pasa del lado sin sol

  // Sol en coordenadas de vista (x derecha, y arriba, z hacia quien mira).
  const f = D.FASE * DEG, a = D.SOL_ARR * DEG;
  let SX = D.LADO * Math.sin(f) * Math.cos(a), SY = Math.sin(f) * Math.sin(a), SZ = Math.cos(f);
  const sn0 = Math.hypot(SX, SY, SZ);
  SX /= sn0; SY /= sn0; SZ /= sn0;

  // Escalón de relieve round(log(ratio)·k) por tabla directa (como luna.js).
  const KR_PASO = 1024, KR_N = 4 * KR_PASO;
  const KREL = new Int8Array(KR_N);
  for (let i = 0; i < KR_N; i++) {
    const k = Math.round(Math.log(Math.max(i + 0.5, 0.5) / KR_PASO) * D.RELIEVE_K / LN);
    KREL[i] = k < D.RELIEVE_MIN ? D.RELIEVE_MIN : k > D.RELIEVE_MAX ? D.RELIEVE_MAX : k;
  }

  let lat0 = lat0Ini, lon0 = lon0Ini, vivo = true;

  // --- Lienzo. El arte (W x H píxeles de arte, tantos como quepan en el
  // contenedor) se pinta en `fuente` y se vuelca ampliado sin suavizado al
  // canvas visible, que va a un múltiplo ENTERO del arte (x3 como mucho) y lo
  // que falte lo amplía el CSS. Es el arreglo de la Luna y la Tierra: Zen
  // suaviza el canvas ampliado por CSS, y a más de x3 el volcado sale caro
  // sin ganar nitidez (ver temperatura-zen.md).
  const MULT_MAX = 3;
  const ctx = canvas.getContext("2d");
  const fuente = document.createElement("canvas");
  const fctx = fuente.getContext("2d");
  let W = 0, H = 0, CX = 0, CY = 0, px = 1, img = null, buf = null, cod = null, cod2 = null;
  let caja = [0, 0, 0, 0];                       // x0, y0, x1, y1 del disco en el arte

  function ajusta() {
    const r = canvas.parentElement.getBoundingClientRect();
    const d = disco();
    if (!(r.width > 0 && r.height > 0 && d > 0)) return false;
    px = d / (2 * R);                            // píxeles CSS por píxel de arte
    const nW = Math.ceil(r.width / px), nH = Math.ceil(r.height / px);
    const dpr = window.devicePixelRatio || 1;
    const k = Math.min(MULT_MAX, Math.floor(px * dpr));
    canvas.style.width = `${nW * px}px`;
    canvas.style.height = `${nH * px}px`;
    // por debajo de x2, el tamaño exacto de pantalla (como la Luna)
    const cw = k >= 2 ? nW * k : Math.round(nW * px * dpr), ch = k >= 2 ? nH * k : Math.round(nH * px * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    if (nW === W && nH === H) return true;
    W = fuente.width = nW;
    H = fuente.height = nH;
    CX = W / 2; CY = H / 2;
    img = fctx.createImageData(W, H);
    buf = new Uint32Array(img.data.buffer);
    cod = new Int32Array(W * H).fill(-1);
    cod2 = new Int32Array(W * H);
    const x0 = Math.max(0, Math.floor(CX - R - 2)), x1 = Math.min(W, Math.ceil(CX + R + 2));
    const y0 = Math.max(0, Math.floor(CY - R - 2)), y1 = Math.min(H, Math.ceil(CY + R + 2));
    caja = [x0, y0, x1, y1];
    tablasLat = NaN;                             // hay que rehacer las tablas
    return true;
  }

  // --- Tablas por píxel del disco, para una inclinación `lat0` dada.
  let NP = 0, tablasLat = NaN;
  let pIdx, pBase, pSh, pCol, pJ, pSE, pSN, pLS, pCH, pCov;
  function montarTablas() {
    const [x0, y0, x1, y1] = caja;
    const cap = (x1 - x0) * (y1 - y0);
    if (!pIdx || pIdx.length < cap) {
      pIdx = new Int32Array(cap); pBase = new Int32Array(cap);
      pSh = new Uint8Array(cap); pCol = new Int32Array(cap); pJ = new Int16Array(cap);
      pSE = new Float32Array(cap); pSN = new Float32Array(cap); pLS = new Float32Array(cap);
      pCH = new Float32Array(cap); pCov = new Float32Array(cap);
    }
    const cl0 = Math.cos(lat0 * DEG), sl0 = Math.sin(lat0 * DEG);
    const ax = 0, ay = cl0, az = sl0;            // eje de Marte en vista
    const CELDA0 = MW / 360 / DEG / R;           // celdas de longitud por píxel en el ecuador
    const invLN = LS / LN;
    let n = 0;
    for (let sy = y0; sy < y1; sy++) {
      const y = -(sy + 0.5 - CY) / R;
      for (let sx = x0; sx < x1; sx++) {
        const x = (sx + 0.5 - CX) / R;
        const rr0 = x * x + y * y, dc = Math.sqrt(rr0);
        if (dc > ROUT) continue;
        // en el anillo de suavizado se lee el punto del borde
        const k0 = rr0 >= 0.9999 ? Math.sqrt(0.9999 / rr0) : 1;
        const ux = x * k0, uy = y * k0, uz = Math.sqrt(Math.max(0, 1 - (ux * ux + uy * uy)));
        // a coordenadas de Marte sin lon0 (Rx(lat0))
        const yy = uy * cl0 + uz * sl0, zz = -uy * sl0 + uz * cl0;
        const lat = Math.asin(yy < -1 ? -1 : yy > 1 ? 1 : yy);
        const lonRel = Math.atan2(ux, zz);        // -π..π
        let r = ((0.5 - lat / Math.PI) * MH) | 0;
        r = r < 0 ? 0 : r >= MH ? MH - 1 : r;
        const cl = Math.cos(lat);
        const foot = CELDA0 / Math.max(0.02, cl);
        let L = 0;
        if (foot > 1) { L = 1; let fm = 2; while (fm < foot && L < NIV - 1) { fm *= 2; L++; } }
        // base local: E = eje x U (su módulo es cos lat), N = U x E
        const le = 1 / Math.max(1e-6, cl);
        const Ex = (ay * uz - az * uy) * le, Ey = (az * ux - ax * uz) * le, Ez = (ax * uy - ay * ux) * le;
        const Nx = uy * Ez - uz * Ey, Ny = uz * Ex - ux * Ez, Nz = ux * Ey - uy * Ex;
        const lamS = ux * SX + uy * SY + uz * SZ;
        const se = SX * Ex + SY * Ey + SZ * Ez, sn = SX * Nx + SY * Ny + SZ * Nz;
        const bright = D.NOCHE + (1 - D.NOCHE) * smooth(D.TERM_A, D.TERM_B, lamS);
        const limb = 1 - D.LIMB_K * smooth(0.75, 1, dc);
        pIdx[n] = sy * W + sx;
        pBase[n] = nvOff[L] + r * nvW[L];
        pSh[n] = L;
        pCol[n] = Math.round((lonRel / (2 * Math.PI) + 0.5) * MW * 256);
        pJ[n] = Math.floor(Math.log(Math.max(bright, 1e-3)) * invLN + Math.log(limb) * invLN + 0.5);
        pSE[n] = se; pSN[n] = sn; pLS[n] = lamS;
        pCH[n] = lamS > sinEM ? cosEM / (Math.sqrt(se * se + sn * sn) || 1) : 0;   // relieve rasante
        pCov[n] = dc > RIN ? 1 - smooth(RIN, ROUT, dc) : 1;
        n++;
      }
    }
    NP = n;
    tablasLat = lat0;
  }

  // --- Un fotograma: material y escalón de luz por píxel -> código de LUT,
  // limpieza (si `limpio`) y color.
  const INV127 = 1 / 127;
  function calcular(limpio) {
    let sh = Math.round(((lon0 / 360) % 1 + 1) % 1 * MW * 256);   // desplazamiento de columna, en 1/256 de celda
    if (sh >= MW * 256) sh -= MW * 256;
    const MW256 = MW * 256;
    for (let n = 0; n < NP; n++) {
      let c0 = pCol[n] + sh;
      if (c0 >= MW256) c0 -= MW256;
      const i = pBase[n] + ((c0 >> 8) >> pSh[n]);
      const m = MAT[i];
      let j = pJ[n];
      const lamS = pLS[n];
      if (lamS > 0) {
        const ne = NE[i] * INV127, nn = NN[i] * INV127;
        const nu = Math.sqrt(Math.max(0, 1 - ne * ne - nn * nn));
        const se = pSE[n], sn = pSN[n];
        const lamL = ne * se + nn * sn + nu * lamS;
        let kRel = 0;
        if (lamL <= 0) kRel = D.SOMBRA_K;
        else if (lamS > 0.02) {
          let ratio;
          const ch = pCH[n];
          if (ch > 0) {                           // relieve rasante: el sol no sube de RELIEVE_ELEV_MAX
            const d = ch * (ne * se + nn * sn) + nu * sinEM;
            ratio = (d > 0.004 ? d : 0.004) / sinEM;
          } else ratio = (lamL > 0.004 ? lamL : 0.004) / lamS;
          kRel = ratio >= 4 ? D.RELIEVE_MAX : KREL[(ratio * KR_PASO) | 0];
        }
        j += kRel * LS;
        if (j < jNoche) j = jNoche;
      }
      j -= KMIN;
      j = j < 0 ? 0 : j >= KN ? KN - 1 : j;
      cod[pIdx[n]] = m * KN + j;
    }
    // limpieza: como _limpiar() del generador, dos pasadas sobre la caja del disco
    let src = cod, dst = cod2;
    const [x0, y0, x1, y1] = caja;
    for (let pasada = 0; limpio && pasada < 2; pasada++) {
      dst.set(src);
      for (let yy = Math.max(1, y0); yy < Math.min(H - 1, y1); yy++) {
        for (let xx = Math.max(1, x0); xx < Math.min(W - 1, x1); xx++) {
          const p = yy * W + xx, v = src[p];
          if (v < 0) continue;
          const a1 = src[p - W], b1 = src[p + W], c1 = src[p - 1], d1 = src[p + 1];
          if (a1 < 0 || b1 < 0 || c1 < 0 || d1 < 0 || v === a1 || v === b1 || v === c1 || v === d1) continue;
          if ((a1 === b1 && (a1 === c1 || a1 === d1)) || (a1 === c1 && a1 === d1)) dst[p] = a1;
          else if (b1 === c1 && b1 === d1) dst[p] = b1;
        }
      }
      const t = src; src = dst; dst = t;
    }
    for (let n = 0; n < NP; n++) {
      const p = pIdx[n];
      let col = lut[src[p]];
      const t = pCov[n];
      if (t < 1) {                                // borde: mezcla con el color del espacio
        const r0 = col & 255, g0 = (col >> 8) & 255, b0 = (col >> 16) & 255;
        col = (255 << 24) | (Math.round(SP[2] + (b0 - SP[2]) * t) << 16)
          | (Math.round(SP[1] + (g0 - SP[1]) * t) << 8) | Math.round(SP[0] + (r0 - SP[0]) * t);
      }
      buf[p] = col;
    }
  }

  function pinta(limpio) {
    const t0 = performance.now();
    if (tablasLat !== lat0) montarTablas();
    calcular(limpio);
    const [x0, y0, x1, y1] = caja;
    fctx.putImageData(img, 0, 0, x0, y0, x1 - x0, y1 - y0);
    ctx.imageSmoothingEnabled = canvas.width < W;
    ctx.globalCompositeOperation = "copy";        // una pasada en vez de clearRect + drawImage
    ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    const ms = performance.now() - t0;
    alPintar(ms, limpio);
    return ms;
  }

  // Bucle: solo corre mientras hay algo que pintar. Mientras se arrastra, un
  // fotograma "rápido" por hueco de 1/60 s (el portátil del usuario va a
  // 120 Hz; a 60 se ve igual y gasta la mitad, como el giro de la Luna); al
  // soltar, uno limpio.
  const FPS = 60;
  let raf = 0, pendiente = false, limpioPendiente = false, ultimoHueco = -1;
  function bucle(ahora) {
    raf = 0;
    if (!vivo) return;
    const hueco = Math.floor(ahora / 1000 * FPS);
    if (pendiente && hueco !== ultimoHueco) {
      ultimoHueco = hueco;
      pendiente = false;
      pinta(false);
    }
    if (pendiente) { raf = requestAnimationFrame(bucle); return; }
    if (limpioPendiente) { limpioPendiente = false; pinta(true); }
  }
  const pide = () => { if (!raf) raf = requestAnimationFrame(bucle); };

  function mueve(dx, dy) {
    // Píxeles CSS -> grados, como si se agarrara el globo por su centro: un
    // radio de arrastre es un radián de giro.
    const k = 180 / Math.PI / (R * px);
    lon0 -= dx * k;
    lat0 = Math.max(-90, Math.min(90, lat0 + dy * k));
    pendiente = true;
    pide();
  }
  function suelta() {
    limpioPendiente = true;
    pide();
  }
  function ponVista(la, lo) {
    lat0 = Math.max(-90, Math.min(90, la));
    lon0 = lo;
    limpioPendiente = true;
    pide();
  }

  const observa = new ResizeObserver(() => { if (ajusta()) { limpioPendiente = true; pide(); } });
  observa.observe(canvas.parentElement);
  if (ajusta()) pinta(true);

  return {
    vista: () => ({ lat0, lon0: ((lon0 + 540) % 360 + 360) % 360 - 180 }),
    ponVista,
    mueve,
    suelta,
    // Banco de pruebas: ms de un fotograma rápido tras rehacer las tablas y
    // de uno sin rehacerlas (lo que cuesta arrastrar hacia arriba o a los lados).
    medir() {
      tablasLat = NaN;
      const conTablas = pinta(false);
      lon0 += 1;
      const soloLon = pinta(false);
      lon0 -= 1;
      pinta(true);
      return { conTablas, soloLon };
    },
    desmontar() {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      observa.disconnect();
    },
  };
}

// La mano, a lo Google Maps: sobre `zona` el cursor es una mano abierta, y
// clic y arrastrar gira el planeta con la mano cerrada. Al soltar se queda
// donde se dejó. (Hasta el 21-sep-2026 era con la barra espaciadora pulsada,
// como la mano de Photoshop; el usuario lo cambió por esto.)
// - El giro no empieza hasta que el ratón se ha movido UMBRAL píxeles: un clic
//   sin arrastrar sigue siendo un clic (lo necesitarán las chapas).
// - Sobre botones, enlaces, campos y lo marcado con `data-sin-arrastre` no se
//   agarra: siguen funcionando como siempre.
// - Tras un arrastre de verdad se anula el clic que el navegador manda al
//   soltar, para que no pulse nada de lo que quede debajo.
// `zona` es el elemento donde se puede agarrar (el hero entero, no solo el
// disco). Pone en `zona` la clase `arrastrable` siempre y `agarrando` mientras
// se arrastra; el cursor lo pone el CSS de la página. Devuelve la función que
// lo desmonta.
/**
 * @param {HTMLElement} zona
 * @param {{ mueve: (dx: number, dy: number) => void, suelta: () => void }} marte
 */
export function montarMano(zona, marte) {
  const UMBRAL = 4;                               // px CSS antes de que cuente como arrastre
  const NO_AGARRA = "a, button, input, select, textarea, label, summary, [data-sin-arrastre]";
  let pulsado = null, arrastrado = false;         // pulsado: { id, x0, y0, x, y, activo }
  zona.classList.add("arrastrable");
  const terminar = () => {
    if (!pulsado) return;
    if (pulsado.activo) {
      if (zona.hasPointerCapture(pulsado.id)) zona.releasePointerCapture(pulsado.id);
      zona.classList.remove("agarrando");
      arrastrado = true;
      marte.suelta();
    }
    pulsado = null;
  };
  const empieza = (e) => {
    if (e.button !== 0 || pulsado || (e.target instanceof Element && e.target.closest(NO_AGARRA))) return;
    e.preventDefault();                           // sin selección de texto ni arrastrar imágenes
    pulsado = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, activo: false };
    arrastrado = false;
  };
  const mueve = (e) => {
    if (!pulsado || e.pointerId !== pulsado.id) return;
    if (!pulsado.activo) {
      if (Math.hypot(e.clientX - pulsado.x0, e.clientY - pulsado.y0) < UMBRAL) return;
      pulsado.activo = true;
      zona.setPointerCapture(pulsado.id);
      zona.classList.add("agarrando");
    }
    const dx = e.clientX - pulsado.x, dy = e.clientY - pulsado.y;
    pulsado.x = e.clientX;
    pulsado.y = e.clientY;
    if (dx || dy) marte.mueve(dx, dy);
  };
  const acaba = (e) => { if (pulsado && e.pointerId === pulsado.id) terminar(); };
  const clic = (e) => {
    if (!arrastrado) return;
    arrastrado = false;
    e.stopPropagation();
    e.preventDefault();
  };
  zona.addEventListener("pointerdown", empieza);
  zona.addEventListener("pointermove", mueve);
  zona.addEventListener("pointerup", acaba);
  zona.addEventListener("pointercancel", acaba);
  zona.addEventListener("click", clic, true);
  window.addEventListener("blur", terminar);
  return () => {
    zona.removeEventListener("pointerdown", empieza);
    zona.removeEventListener("pointermove", mueve);
    zona.removeEventListener("pointerup", acaba);
    zona.removeEventListener("pointercancel", acaba);
    zona.removeEventListener("click", clic, true);
    window.removeEventListener("blur", terminar);
    terminar();
    zona.classList.remove("arrastrable", "agarrando");
  };
}
