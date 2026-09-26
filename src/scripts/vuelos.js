// Vuelos entre astros: la cámara viaja hasta el astro pequeño de una página
// y lo deja tal como se ve en la otra. Lo usan todos: portada → /luna (la luna
// del hero), portada → /marte, /luna → /marte, /marte → portada y las
// vueltas hacia atrás (`inverso`).
//
// Se simula una cámara en 3D y se proyecta en perspectiva, en un bucle de rAF:
// - avanza en línea recta hasta quedar delante del astro, con arranque y
//   frenada suaves; como el tamaño aparente va con 1/distancia, casi no crece
//   al principio y se echa encima al final;
// - en la primera parte gira hacia él, así que se va al centro mientras
//   crece, y las estrellas (en el infinito: solo les afecta el giro) se
//   desplazan.
// El astro que se deja atrás no va en la escena 3D (está entre la cámara y el
// destino): crece un poco y sale por abajo, como si se pasara rozándolo. El
// icono se funde pronto con el dibujo grande, que de pequeño va suavizado.

const DURACION = 6000;             // ms
const ICONO_N = 56;                // lado de los iconos en px de arte (generar-astros.py, generar-marte.py)
const ICONO_DISCO = 32 / 56;       // diámetro del disco en el icono de la luna (r = 16 en 56 px)
const GIRO_HASTA = 0.6;            // parte del vuelo en la que la cámara gira hacia el astro
const FUNDIDO_HASTA = 0.4;         // parte del vuelo en la que el icono pasa al dibujo

// Hacia /marte (y de vuelta): acaba en la caja de marte-quieto.png
// (--marte-caja, centrada). La imagen tiene 450 px de arte y un disco de
// 2 × 219,4 (RADIUS de generar-marte.py); el icono, radio 12 en 56.
export const VUELO_MARTE = {
  tam: "var(--marte-caja)", dy: "0px", imgLado: 450, imgDisco: 438.8,
  iconoDisco: 24 / 56, claseIcono: "viaje-icono-marte",
};
// De /marte a la portada, desde la Tierra pequeña: acaba en la Tierra de la
// portada, cuya caja se mide en un .hero-planet (`destino`). La imagen es
// tierra-quieto*.png, 368 px de arte con el disco de 360 en medio
// (generar-tierra-quieto.mjs); el icono, radio 12 en 56.
export const VUELO_TIERRA = {
  imgLado: 368, imgDisco: 360, iconoDisco: 24 / 56, claseIcono: "viaje-icono-tierra",
};

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function suave(t) { return t * t * (3 - 2 * t); }
const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const escala = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const unit = (a) => escala(a, 1 / Math.hypot(a[0], a[1], a[2]));
// Gira v un ángulo `ang` alrededor del eje unitario `k` (Rodrigues).
const rota = (v, k, ang) => {
  const c = Math.cos(ang), s = Math.sin(ang), d = punto(k, v) * (1 - c);
  return [
    v[0] * c + (k[1] * v[2] - k[2] * v[1]) * s + k[0] * d,
    v[1] * c + (k[2] * v[0] - k[0] * v[2]) * s + k[1] * d,
    v[2] * c + (k[0] * v[1] - k[1] * v[0]) * s + k[2] * d,
  ];
};

// Fase de hoy para la tira de la luna del hero (public/zodk-luna-fases.png,
// FASES fases en fila; arte/generar-astros.py): background-position.
// Edad de la luna desde una luna nueva conocida (6-ene-2000, 18:14 UTC) y mes
// sinódico medio: basta para el día.
export function faseLunaHoy() {
  const FASES = 30, MES_SINODICO = 29.530588853, LUNA_NUEVA = Date.UTC(2000, 0, 6, 18, 14);
  const edad = ((((Date.now() - LUNA_NUEVA) / 86400000) % MES_SINODICO) + MES_SINODICO) % MES_SINODICO;
  const i = Math.round((edad / MES_SINODICO) * FASES) % FASES;
  return `${(i / (FASES - 1)) * 100}% 0`;
}


/**
 * Hace el vuelo. `fin` resuelve con la posición final de las estrellas (para
 * colocar igual las de la otra página); la capa del vuelo se queda puesta
 * hasta el cambio de página o hasta `limpiar()`.
 *
 * - `inverso`: el mismo vuelo hacia atrás (de /luna a la portada, de /marte a
 *   /luna). La página pone un icono y un astro con las clases de la de
 *   destino, para medir dónde acaban.
 * - `iconoVisible`: false si en la portada no se ve la luna (de día); la Luna
 *   se apaga en vez de fundirse con el icono.
 * - Destino: `tam`, lado de la caja de la imagen en la otra página, y `dy`,
 *   cuánto sube su centro respecto al de la ventana (CSS). O `destino`: un
 *   elemento con esa caja (su centro es el del disco).
 * - `imgLado` e `imgDisco`: lado de la imagen y diámetro de su disco en px de
 *   arte; `iconoDisco`, diámetro del disco en el icono (fracción de su lado);
 *   `claseIcono`, la clase de su copia en la capa.
 * - `alejar` (vueltas desde /luna y /marte): el astro empieza con el zoom
 *   `zoom` en su lienzo; primero se aleja en él (`ponZoom`), al llegar a ×1
 *   se le hace la foto (`foto`, que además esconde el lienzo) y el vuelo
 *   sigue con ella. Todo en una sola curva, sin pararse. Con `alejar`, `img`
 *   puede faltar.
 * @param {{ icono: HTMLElement, planeta: HTMLElement, estrellas: HTMLElement,
 *   apagar?: HTMLElement[], img?: HTMLImageElement | HTMLCanvasElement | null,
 *   inverso?: boolean, iconoVisible?: boolean,
 *   tam?: string, dy?: string, imgLado?: number, imgDisco?: number,
 *   iconoDisco?: number, claseIcono?: string, destino?: HTMLElement | null,
 *   alejar?: { zoom: number, ponZoom: (z: number) => void, foto: () => HTMLCanvasElement } | null }} o
 * @returns {{ fin: Promise<string>, limpiar: () => void }}
 */
export function volarALuna({
  icono, planeta, estrellas, apagar = [], img = null,
  inverso = false, iconoVisible = true,
  tam = "var(--luna-tam)", dy = "var(--luna-dy)", imgLado = 600, imgDisco = 585,
  iconoDisco = ICONO_DISCO, claseIcono = "viaje-icono", alejar = null, destino = null,
}) {
  const CARA_DISCO = imgDisco / imgLado;
  // Tamaño y sitio del astro en la otra página (en /luna, --luna-tam y
  // --luna-dy), medidos con una sonda. La cámara acaba mirando a ese punto,
  // así que CY es el centro del disco, no el de la ventana.
  const W = innerWidth, H = innerHeight;
  let rs, CX, CY, inclina = 0;
  if (destino) {
    // La cámara llega mirando la Tierra de frente en el centro y, al final,
    // sube la vista lo justo (`inclina`) para que baje hasta su sitio. Si
    // apuntara desde el principio a ese sitio, la Tierra se iría pequeña
    // hasta el borde de abajo y crecería desde allí.
    rs = destino.getBoundingClientRect();
    CX = rs.left + rs.width / 2;
    CY = H / 2;
    inclina = Math.atan((rs.top + rs.height / 2 - CY) / (Math.max(W, H) * 0.9));
  } else {
    const sonda = document.createElement("div");
    sonda.style.cssText = `position:fixed;visibility:hidden;top:0;width:${tam};margin-top:${dy}`;
    document.body.append(sonda);
    rs = sonda.getBoundingClientRect();
    sonda.remove();
    CX = W / 2;
    CY = H / 2 + rs.top;
  }
  const F = Math.max(W, H) * 0.9;                    // focal en px
  const ri = icono.getBoundingClientRect();
  const m0 = [ri.left + ri.width / 2, ri.top + ri.height / 2];
  const dLuna0 = ri.width * iconoDisco;
  const dLuna1 = rs.width * CARA_DISCO;

  // --- Escena en 3D (x derecha, y abajo, z hacia dentro)
  const zL = (2 * F) / dLuna0;
  const luna = [((m0[0] - CX) / F) * zL, ((m0[1] - CY) / F) * zL, zL];
  const dir = unit(luna);
  const fin = resta(luna, escala(dir, (2 * F) / (dLuna1 * Math.cos(inclina))));   // donde acaba la cámara
  const ejeGiro = unit([-dir[1], dir[0], 0]);             // z × dir
  const angGiro = Math.acos(clamp01(dir[2]));
  const camara = (t) => {
    const a = angGiro * inOutSine(clamp01(t / GIRO_HASTA));
    const der = rota([1, 0, 0], ejeGiro, a);
    let aba = rota([0, 1, 0], ejeGiro, a), del = rota([0, 0, 1], ejeGiro, a);
    if (inclina) {                                   // subir la vista, después del giro
      const b = inclina * inOutSine(clamp01((t - GIRO_HASTA) / (1 - GIRO_HASTA)));
      aba = rota(aba, der, b);
      del = rota(del, der, b);
    }
    return { pos: escala(fin, inOutCubic(t)), der, aba, del };
  };

  // --- Capa con el astro
  const capa = document.createElement("div");
  capa.className = "viaje-luna";
  const lado1 = dLuna1 / CARA_DISCO;
  const ladoIcono = dLuna1 / iconoDisco;
  /** @type {{ el: HTMLElement, lado: number, res: number }[]} */
  const capas = [];
  const pon = (el, lado, res = imgDisco) => {
    el.style.width = el.style.height = `${lado}px`;
    el.style.opacity = "0";
    capa.append(el);
    capas.push({ el, lado, res });
    return capas.length - 1;
  };
  let imagen = img;                                   // con `alejar`, la pone la foto al llegar a ×1
  /** @type {HTMLElement | null} */
  let ic = null;
  let iIcono = -1, iOriginal = -1;
  const montarCapas = () => {
    ic = document.createElement("div");
    ic.className = claseIcono;
    ic.style.backgroundPosition = getComputedStyle(icono).backgroundPosition;
    iIcono = pon(ic, ladoIcono, iconoDisco * ICONO_N);
    // Un lienzo (la foto de las vueltas) se usa tal cual: clonado saldría vacío.
    let original;
    if (imagen instanceof HTMLCanvasElement) original = imagen;
    else {
      original = /** @type {HTMLImageElement} */ (imagen.cloneNode());
      original.alt = "";
    }
    iOriginal = pon(original, lado1);
  };
  if (!alejar) montarCapas();
  // La capa va detrás del astro que se deja atrás (justo antes que él en el
  // hero): está más cerca, así que si se cruzan, el destino pasa por detrás.
  capa.style.zIndex = "0";
  planeta.before(capa);
  icono.style.visibility = "hidden";                  // lo sustituye su copia en la capa

  for (const el of apagar) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DURACION * 0.25, easing: "ease-out", fill: "forwards" });
  }
  planeta.style.willChange = "transform, opacity";

  // Opacidad de cada capa en el instante t: el dibujo entra durante la
  // primera parte del vuelo. El icono sigue opaco debajo hasta que el dibujo
  // casi lo tapa (si no, a mitad de fundido se transparentan las estrellas) y
  // luego se apaga su halo.
  const opacidades = (t) => {
    const o = capas.map(() => 0);
    const f = suave(clamp01(t / FUNDIDO_HASTA));
    o[iIcono] = iconoVisible ? 1 - suave(clamp01((f - 0.5) / 0.5)) : 0;
    o[iOriginal] = f;
    return o;
  };

  // El astro que se deja atrás (la Tierra de la portada, la Luna de /luna...)
  // crece hasta ENCIMA_K y baja lo justo para que su borde de arriba (con
  // margen para la aurora) acabe por debajo de la pantalla. Se respeta la
  // colocación de su CSS (translateX(-50%) la Tierra, translate(-50%, -50%)
  // la Luna). `ix`: desplazamiento de las estrellas por el giro.
  const T0 = getComputedStyle(planeta).transform;
  const PLANETA_T0 = T0 === "none" ? "" : T0;
  const rp = planeta.getBoundingClientRect();
  const ENCIMA_K = 1.5, ENCIMA_HASTA = 0.5;
  const encimaBaja = H - (rp.top + rp.height / 2 - (ENCIMA_K * rp.height) / 2) + H * 0.15;
  const moverPlaneta = (t, ix) => {
    const e = clamp01(t / ENCIMA_HASTA), ee = e * e;
    const k = 1 + (ENCIMA_K - 1) * ee;
    planeta.style.transform = `translate(${ix * 0.5}px, ${encimaBaja * ee}px) ${PLANETA_T0} scale(${k})`;
    planeta.style.opacity = "1";
  };

  // Estrellas: dónde queda el punto del infinito que al principio estaba en
  // el centro, sumado a donde ya estuvieran (tras un vuelo anterior) y
  // contando desde el instante en que empieza este vuelo.
  const posPrevia = getComputedStyle(estrellas).getPropertyValue("--estrellas-pos").trim();
  const [bx, by] = (posPrevia.match(/-?[\d.]+/g) ?? ["0", "0"]).map(Number);
  const desplaza = (c) => [(F * c.der[2]) / c.del[2], (F * c.aba[2]) / c.del[2]];
  const [ix0, iy0] = desplaza(camara(inverso ? 1 : 0));

  // Pinta el vuelo en el instante t de la escena (0 = en el icono, 1 = en la
  // otra página). Sin capas aún (con `alejar`, antes de la foto), solo
  // estrellas y el astro que se deja atrás.
  const pintaT = (t) => {
    const c = camara(t);
    const r = resta(luna, c.pos), z = punto(r, c.del);
    const lx = CX + (F * punto(r, c.der)) / z, ly = CY + (F * punto(r, c.aba)) / z;
    const d = (2 * F) / z;                           // diámetro del disco en px
    const k = d / dLuna1;
    const ops = capas.length ? opacidades(t) : [];
    capas.forEach(({ el, lado, res }, i) => {
      el.style.opacity = String(ops[i]);
      if (ops[i] === 0) return;
      el.style.transform = `translate(${lx - (lado * k) / 2}px, ${ly - (lado * k) / 2}px) scale(${k})`;
      // si sus píxeles miden menos de uno de pantalla, suavizada (en pixelado titila)
      if (el !== ic) el.style.imageRendering = d / res < 0.97 ? "auto" : "pixelated";
    });
    const [ix, iy] = desplaza(c);
    const pos = `${(bx + ix - ix0).toFixed(1)}px ${(by + iy - iy0).toFixed(1)}px`;
    estrellas.style.setProperty("--estrellas-pos", pos);
    moverPlaneta(t, ix);
    return pos;
  };

  // Ritmo. Sin `alejar`, t lineal en el tiempo (la cámara ya lleva sus
  // curvas). Con `alejar`, por tamaño: el logaritmo del tamaño aparente del
  // astro (1 = ×1 en su página) baja desde log(zoom) hasta el del icono
  // siguiendo una sola curva E, que arranca desde parado, tiene la velocidad
  // máxima hacia un tercio y frena despacio hasta el final (E' = 12x(1-x)²).
  // Mientras el tamaño es mayor que 1 se aleja el lienzo; después, el vuelo:
  // del tamaño sale la distancia de la cámara (mirando al astro de frente,
  // que es como empieza la vuelta) y de ahí el instante t, así que el giro y
  // el fundido con el icono llegan donde siempre. La duración crece con el
  // zoom (1,6 s por cada e de zoom) para que la velocidad máxima sea la misma.
  const E = (x) => x * x * (6 - 8 * x + 3 * x * x);
  const invInOutCubic = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt(2 * (1 - u)) / 2);
  const Lmag = Math.hypot(luna[0], luna[1], luna[2]), D1 = (2 * F) / dLuna1;
  const logZ0 = alejar ? Math.log(Math.max(1, alejar.zoom)) : 0;
  const recorrido = logZ0 + Math.log(Lmag / D1);
  const total = DURACION + (alejar ? 1600 * logZ0 : 0);
  // Instante t de la escena para el avance p (0..1), o null mientras se aleja
  // el lienzo (ya con su zoom puesto).
  const instante = (p) => {
    if (!alejar) return inverso ? 1 - p : p;
    const L = logZ0 - recorrido * E(p);
    if (L > 0) {
      alejar.ponZoom(Math.exp(L));
      return null;
    }
    if (!capas.length) {                               // llega a ×1: la foto, y a volar con ella
      alejar.ponZoom(1);
      imagen = alejar.foto();
      montarCapas();
    }
    const u = clamp01((Lmag - D1 * Math.exp(-L)) / (Lmag - D1));
    return invInOutCubic(u);
  };
  const pinta = (p) => {
    const t = instante(p);
    return pintaT(t === null ? (inverso ? 1 : 0) : t);
  };

  let raf = 0;
  pinta(0);                                          // ya, antes de que el navegador pinte nada
  const fin$ = new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (ahora) => {
      const p = Math.min(1, (ahora - t0) / total);
      const pos = pinta(p);
      if (p < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      raf = 0;
      resolve(pos);
    };
    raf = requestAnimationFrame(frame);
  });

  const limpiar = () => {
    if (raf) cancelAnimationFrame(raf);
    capa.remove();
    icono.style.visibility = "";
    planeta.style.transform = planeta.style.opacity = planeta.style.willChange = "";
    if (posPrevia) estrellas.style.setProperty("--estrellas-pos", posPrevia);
    else estrellas.style.removeProperty("--estrellas-pos");
    for (const el of apagar) el.getAnimations().forEach((a) => a.cancel());
  };
  return { fin: fin$, limpiar };
}
