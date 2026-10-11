// El mapa del Sáhara (/sahara): el pixel art de arte/generar-sahara.py en un
// <canvas> 2D, con arrastre y zoom dentro de un cajón.
// - El mapa cubre del sur de Mauritania al Estrecho, pero con el ratón solo
//   se puede mirar dentro de CAJON (el Sáhara Occidental y alrededores): la
//   vista nunca se sale de él. Más allá (Ceuta, Melilla, Perejil) solo irá la
//   cámara cuando lo pida un hito.
// - Niveles de detalle, como el zoom de la Tierra: el mapa entero a 64
//   px/grado y el cajón también a 128 y 256, en teselas
//   (public/sahara/n<ppd>/). Se pinta el más fino cuyo píxel mida al menos
//   PX_ARTE CSS; mientras llegan sus teselas se ve el de debajo.
// - El zoom es continuo y suave (va hacia el objetivo de los gestos como el
//   de la Tierra) y, al pararse, se asienta en una escala entera de píxeles
//   del dispositivo por píxel del nivel, para que el pixel art quieto no
//   tenga píxeles de dos tamaños.
// - Los hitos (irA) llevan la cámara en un vuelo corto hasta su lugar y
//   ponen ahí la marca. Si el lugar está en el mapa pero fuera del cajón
//   (Ceuta, Melilla, Perejil, Rabat), mientras dure ese hito se puede mirar
//   el mapa entero.
// - Solo se repinta cuando algo cambia. Tras cada repintado llama a
//   `alPintar` (la página coloca encima lo suyo, como la flecha de los
//   lugares de fuera del mapa).

import { SAHARA_V } from "./versiones.js";

// El cajón, en grados (S, N, O, E): de La Güera a Sidi Ifni y de El Hierro a
// Tinduf. Los niveles finos del generador (CAJON en generar-sahara.py) lo
// cubren con algo de margen.
const CAJON = [20.6, 30.0, -18.4, -7.0];
const PX_ARTE = 2;                                // px CSS mínimos del píxel del nivel que se pinta
const PX_ARTE_MAX = 6;                            // zoom máximo: el píxel del nivel más fino, a esto
const TAU = 0.07;                                 // s, suavizado del zoom (el de la Tierra)
const ASIENTO = 150;                              // ms quieto antes de asentar la escala
const VUELO = 900;                                // ms del vuelo hasta un hito
const PX_HITO = 4;                                // px CSS del píxel del nivel base al llegar a un hito

// La marca del lugar del hito, en pixel art (la punta, abajo en medio, es el
// sitio): X borde, O rojo, W centro claro.
const MARCA = [
  "..XXXXX..",
  ".XOOOOOX.",
  "XOOWWWOOX",
  "XOOWWWOOX",
  "XOOWWWOOX",
  ".XOOOOOX.",
  "..XOOOX..",
  "...XOX...",
  "....X....",
];
const MARCA_COL = { X: "#141418", O: "#d4231c", W: "#f2f2ef" };   // tinta, rojo y papel del CSS

/** Pinta la marca con su esquina en (x, y), a bloques de `p` px. */
export function dibujarMarca(ctx, x, y, p) {
  MARCA.forEach((fila, j) => [...fila].forEach((k, i) => {
    if (k === ".") return;
    ctx.fillStyle = MARCA_COL[k];
    ctx.fillRect(x + i * p, y + j * p, p, p);
  }));
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ alPintar?: () => void }} [opciones]
 */
export async function montarMapaSahara(canvas, { alPintar = () => {} } = {}) {
  const datos = await fetch(`/sahara/sahara-mapa.json?v=${SAHARA_V}`).then((r) => r.json());
  const niveles = datos.niveles.map((n) => ({ ...n, hay: new Set(n.teselas) }));
  const base = niveles[0];
  const T = datos.tesela;
  const [, norte, oeste] = datos.caja;
  /** Grados a píxeles del nivel base. */
  const aMapa = (lat, lon) => [(lon - oeste) * base.ppd * datos.coslat, (norte - lat) * base.ppd];
  const [x0, y1] = aMapa(CAJON[0], CAJON[2]);
  const [x1, y0] = aMapa(CAJON[1], CAJON[3]);
  const CAJONPX = [x0, y0, x1, y1];
  const MAPAPX = [0, 0, base.ancho, base.alto];
  let lim = CAJONPX;                              // lo que se puede mirar ahora
  const dentro = ([a, b, c, d], x, y) => x >= a && x <= c && y >= b && y <= d;

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;                      // lienzo en px del dispositivo
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;    // centro de la vista, en px del nivel base
  let escala = 0, objetivo = 0;                   // px del dispositivo por px del nivel base
  let ancla = null;                               // { px, py, mx, my }: punto que el zoom deja quieto
  let ultimoGesto = 0, raf = 0, antes = 0, vivo = true;
  let vuelo = null;                               // { de: [cx, cy, e], a: [cx, cy, e], t0 }
  let marca = null;                               // [x, y] en px del nivel base

  const escalaMin = () => Math.max(W / (lim[2] - lim[0]), H / (lim[3] - lim[1]));
  const escalaMax = () => PX_ARTE_MAX * dpr * niveles[niveles.length - 1].ppd / base.ppd;
  const limitar = (e) => Math.min(Math.max(e, escalaMin()), escalaMax());
  /** El nivel que toca a una escala: el más fino con píxel de PX_ARTE CSS o más. */
  const nivelPara = (e) => {
    let n = base;
    // (con margen: 7,99999 tiene que contar como 8, o el nivel parpadea)
    for (const m of niveles) if ((e / dpr) * base.ppd / m.ppd >= PX_ARTE - 1e-6) n = m;
    return n;
  };
  /** La escala entera más cercana para el nivel que toca (sin bajar de la mínima). */
  const asentada = (e) => {
    const n = nivelPara(e), f = n.ppd / base.ppd;
    let k = Math.max(1, Math.round(e / f));
    if (k * f < escalaMin()) k = Math.ceil(escalaMin() / f);
    return Math.min(k * f, escalaMax());
  };
  // El centro, dentro del cajón.
  const encajado = (x, y, e) => {
    const mx = W / (2 * e), my = H / (2 * e);
    return [Math.min(Math.max(x, lim[0] + mx), lim[2] - mx), Math.min(Math.max(y, lim[1] + my), lim[3] - my)];
  };
  const encajar = () => { [cx, cy] = encajado(cx, cy, escala); };

  // Teselas: se piden al hacer falta y al llegar se repinta.
  const teselas = new Map();
  const tesela = (n, f, c, pedir) => {
    const clave = `${n.ppd}/${f}-${c}`;
    let img = teselas.get(clave);
    if (!img && pedir) {
      img = new Image();
      img.onload = () => { if (vivo) repintar(); };
      img.src = `/sahara/n${n.ppd}/${f}-${c}.png?v=${SAHARA_V}`;
      teselas.set(clave, img);
    }
    return img && img.complete && img.naturalWidth ? img : null;
  };

  const pintar = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    const ox = Math.round(W / 2 - cx * escala), oy = Math.round(H / 2 - cy * escala);
    const fino = nivelPara(escala);
    for (const n of niveles) {
      if (n.ppd > fino.ppd) break;
      const s = escala * base.ppd / n.ppd;        // px del dispositivo por px de este nivel
      const f0 = Math.max(0, Math.floor(-oy / s / T)), f1 = Math.floor((H - oy) / s / T);
      const c0 = Math.max(0, Math.floor(-ox / s / T)), c1 = Math.floor((W - ox) / s / T);
      for (let f = f0; f <= f1; f++) {
        for (let c = c0; c <= c1; c++) {
          if (!n.hay.has(`${f}-${c}`)) continue;
          const img = tesela(n, f, c, n === fino || n === base);
          if (!img) continue;
          // Bordes redondeados a px enteros: las teselas casan sin costuras.
          const dx = Math.round(ox + c * T * s), dy = Math.round(oy + f * T * s);
          const dw = Math.round(ox + (c * T + img.width) * s) - dx;
          const dh = Math.round(oy + (f * T + img.height) * s) - dy;
          ctx.drawImage(img, dx, dy, dw, dh);
        }
      }
    }
    if (marca) {
      // A bloques de px enteros, con la punta en el sitio.
      const p = Math.max(2, Math.round(2 * dpr));
      dibujarMarca(ctx, Math.round(ox + marca[0] * escala) - 4 * p, Math.round(oy + marca[1] * escala) - 9 * p, p);
    }
    alPintar();
  };

  // Un fotograma: el zoom se acerca a su objetivo con el punto agarrado
  // quieto; si ya está y los gestos llevan un rato parados, se asienta.
  const fotograma = (t) => {
    raf = 0;
    const dt = antes ? Math.min(0.1, (t - antes) / 1000) : 1 / 60;
    antes = t;
    if (vuelo) {
      // Suave al salir y al llegar; la escala, en logaritmo.
      const u = Math.min(1, (performance.now() - vuelo.t0) / VUELO);
      const k = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
      cx = vuelo.de[0] + (vuelo.a[0] - vuelo.de[0]) * k;
      cy = vuelo.de[1] + (vuelo.a[1] - vuelo.de[1]) * k;
      escala = objetivo = u === 1 || vuelo.de[2] === vuelo.a[2] ? vuelo.a[2]
        : Math.exp(Math.log(vuelo.de[2]) + (Math.log(vuelo.a[2]) - Math.log(vuelo.de[2])) * k);
      if (u === 1) vuelo = null;
      pintar();
      seguir();
      return;
    }
    if (escala !== objetivo) {
      escala += (objetivo - escala) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(objetivo - escala) < objetivo * 1e-3) escala = objetivo;
      if (ancla) {
        cx = ancla.mx - (ancla.px - W / 2) / escala;
        cy = ancla.my - (ancla.py - H / 2) / escala;
      }
      encajar();
    }
    if (escala === objetivo && performance.now() - ultimoGesto > ASIENTO) {
      const a = asentada(objetivo);
      if (a !== objetivo) objetivo = a;
    }
    pintar();
    if (escala !== objetivo || performance.now() - ultimoGesto <= ASIENTO) seguir();
    else antes = 0;
  };
  const seguir = () => { if (!raf && vivo) raf = requestAnimationFrame(fotograma); };
  const repintar = seguir;

  const medir = () => {
    dpr = window.devicePixelRatio || 1;
    W = Math.round(canvas.clientWidth * dpr);
    H = Math.round(canvas.clientHeight * dpr);
    canvas.width = W;
    canvas.height = H;
    escala = objetivo = escala ? limitar(escala) : asentada(escalaMin());   // la primera vez: el cajón entero
    encajar();
    pintar();
  };
  const observador = new ResizeObserver(medir);
  observador.observe(canvas);
  medir();

  return {
    /**
     * Lleva la cámara al lugar de un hito y pone ahí la marca (`al momento`:
     * sin vuelo). Si está fuera del mapa, no se mueve, quita la marca y
     * devuelve false.
     */
    irA(lat, lon, { alMomento = false } = {}) {
      const [x, y] = aMapa(lat, lon);
      if (!dentro(MAPAPX, x, y)) {
        marca = null;
        repintar();
        return false;
      }
      lim = dentro(CAJONPX, x, y) ? CAJONPX : MAPAPX;
      marca = [x, y];
      const e = asentada(limitar(PX_HITO * dpr));
      const [ax, ay] = encajado(x, y, e);
      ancla = null;
      if (alMomento) {
        vuelo = null;
        cx = ax; cy = ay; escala = objetivo = e;
        pintar();
      } else {
        vuelo = { de: [cx, cy, escala], a: [ax, ay, e], t0: performance.now() };
        seguir();
      }
      return true;
    },
    /** Un punto en grados, en px CSS del lienzo (puede caer fuera). */
    aPantalla(lat, lon) {
      const [x, y] = aMapa(lat, lon);
      return [(W / 2 + (x - cx) * escala) / dpr, (H / 2 + (y - cy) * escala) / dpr];
    },
    /** Px CSS por píxel del mapa base. */
    escalaCss: () => escala / dpr,
    /** El centro de la vista, en grados. */
    centro() {
      return [norte - cy / base.ppd, oeste + cx / (base.ppd * datos.coslat)];
    },
    /** Arrastre de la mano (px CSS). */
    mueve(dx, dy) {
      vuelo = null;
      cx -= (dx * dpr) / escala;
      cy -= (dy * dpr) / escala;
      encajar();
      if (ancla) {
        ancla.mx = cx + (ancla.px - W / 2) / escala;
        ancla.my = cy + (ancla.py - H / 2) / escala;
      }
      repintar();
    },
    suelta() {},
    /** Zoom hacia el punto (clientX, clientY): ese punto del mapa no se mueve. */
    zoom(factor, clientX, clientY) {
      vuelo = null;
      const caja = canvas.getBoundingClientRect();
      const px = clientX === undefined ? W / 2 : (clientX - caja.left) * dpr;
      const py = clientY === undefined ? H / 2 : (clientY - caja.top) * dpr;
      ancla = { px, py, mx: cx + (px - W / 2) / escala, my: cy + (py - H / 2) / escala };
      objetivo = limitar(objetivo * factor);
      ultimoGesto = performance.now();
      seguir();
    },
    aMapa,
    quitar() {
      vivo = false;
      observador.disconnect();
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
