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
// - Solo se repinta cuando algo cambia.

import { SAHARA_V } from "./versiones.js";

// El cajón, en grados (S, N, O, E): de La Güera a Sidi Ifni y de El Hierro a
// Tinduf. Los niveles finos del generador (CAJON en generar-sahara.py) lo
// cubren con algo de margen.
const CAJON = [20.6, 30.0, -18.4, -7.0];
const PX_ARTE = 2;                                // px CSS mínimos del píxel del nivel que se pinta
const PX_ARTE_MAX = 6;                            // zoom máximo: el píxel del nivel más fino, a esto
const TAU = 0.07;                                 // s, suavizado del zoom (el de la Tierra)
const ASIENTO = 150;                              // ms quieto antes de asentar la escala

/**
 * @param {HTMLCanvasElement} canvas
 */
export async function montarMapaSahara(canvas) {
  const datos = await fetch(`/sahara/sahara-mapa.json?v=${SAHARA_V}`).then((r) => r.json());
  const niveles = datos.niveles.map((n) => ({ ...n, hay: new Set(n.teselas) }));
  const base = niveles[0];
  const T = datos.tesela;
  const [, norte, oeste] = datos.caja;
  /** Grados a píxeles del nivel base. */
  const aMapa = (lat, lon) => [(lon - oeste) * base.ppd * datos.coslat, (norte - lat) * base.ppd];
  const [x0, y1] = aMapa(CAJON[0], CAJON[2]);
  const [x1, y0] = aMapa(CAJON[1], CAJON[3]);

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;                      // lienzo en px del dispositivo
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;    // centro de la vista, en px del nivel base
  let escala = 0, objetivo = 0;                   // px del dispositivo por px del nivel base
  let ancla = null;                               // { px, py, mx, my }: punto que el zoom deja quieto
  let ultimoGesto = 0, raf = 0, antes = 0, vivo = true;

  const escalaMin = () => Math.max(W / (x1 - x0), H / (y1 - y0));
  const escalaMax = () => PX_ARTE_MAX * dpr * niveles[niveles.length - 1].ppd / base.ppd;
  const limitar = (e) => Math.min(Math.max(e, escalaMin()), escalaMax());
  /** El nivel que toca a una escala: el más fino con píxel de PX_ARTE CSS o más. */
  const nivelPara = (e) => {
    let n = base;
    for (const m of niveles) if ((e / dpr) * base.ppd / m.ppd >= PX_ARTE) n = m;
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
  const encajar = () => {
    const mx = W / (2 * escala), my = H / (2 * escala);
    cx = Math.min(Math.max(cx, x0 + mx), x1 - mx);
    cy = Math.min(Math.max(cy, y0 + my), y1 - my);
  };

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
  };

  // Un fotograma: el zoom se acerca a su objetivo con el punto agarrado
  // quieto; si ya está y los gestos llevan un rato parados, se asienta.
  const fotograma = (t) => {
    raf = 0;
    const dt = antes ? Math.min(0.1, (t - antes) / 1000) : 1 / 60;
    antes = t;
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
    /** Arrastre de la mano (px CSS). */
    mueve(dx, dy) {
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
