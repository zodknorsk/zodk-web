// Vuelo de la Tierra a la Luna (Proyecto Luna): al pulsar la luna del hero de
// la portada, la luna se amplía mientras la cámara gira hacia ella y la Tierra
// queda atrás, hasta quedar como en /luna. Lo usan src/pages/index.astro
// (luego cambia de página) y el banco de pruebas
// logo-files/prototipo-vuelo/ (para comparar variantes).
// El mismo vuelo lleva a Marte (Proyecto Marte, 21-sep-2026): el Marte
// pequeño de arriba a la derecha crece hasta el disco de /marte. Cambian el
// destino (`tam`, `dy`), el icono (`iconoDisco`, `claseIcono`) y la imagen
// (`img`, `imgLado`, `imgDisco`); por defecto, los de la Luna.
//
// Se simula una cámara que viaja hasta la Luna y de ahí sale cómo se mueve la
// luna (proyección en perspectiva, un bucle de rAF):
// - la cámara avanza en línea recta hasta quedar delante de la Luna, con
//   arranque y frenada suaves; como el tamaño aparente va con 1/distancia, la
//   Luna casi no crece al principio y se echa encima al final;
// - en la primera parte gira hacia ella, así que la Luna se va al centro
//   mientras crece, y las estrellas (en el infinito: solo les afecta el giro)
//   se desplazan.
// La Tierra no va en la misma escena 3D (está entre la cámara y la Luna: el
// trayecto la atravesaba); cómo sale de escena es una VARIANTE (`tierra`), y
// cómo va apareciendo el detalle de la luna, otra (`pixeles`). Detalle en
// logo-files/LUNA-WIP.md.

const ICONO_N = 56;                // lado del icono en px de arte (la luna y Marte, generar-astros.py y generar-marte.py)
const ICONO_DISCO = 32 / 56;       // diámetro del disco en el icono de la luna (r = 16 en 56 px)
const GIRO_HASTA = 0.6;            // parte del vuelo en la que la cámara gira hacia la Luna
const FUNDIDO_HASTA = 0.4;         // "directo": parte del vuelo en la que el icono pasa al dibujo (0,2 y 0,32: cortos)

// Cómo sale la Tierra de escena.
export const TIERRAS = {
  cae: "encoge y cae hacia abajo a la derecha",
  giro: "solo se desliza con el giro de la cámara (sin encoger)",
  aleja: "se queda en su sitio y se aleja hacia el horizonte",
  encima: "pasamos rozándola: crece un poco y sale rápido por abajo",
  apaga: "se desvanece pronto, casi sin moverse",
};
// Cómo aparece el detalle de la luna.
export const PIXELES = {
  etapas: "icono y luego el dibujo a 64, 128 y 256 px, fundiéndose",
  directo: "el dibujo final desde el principio (suavizado de pequeño)",
  icono: "el icono ampliado casi hasta el final y luego el dibujo",
  constante: "píxeles siempre del mismo tamaño: el detalle crece poco a poco",
};

// El vuelo a Marte (y de vuelta): acaba en la caja de marte-quieto.png en
// /marte (--marte-caja, centrada). La imagen es de 450 px de arte con un disco
// de 2 x 219,4 (RADIUS de generar-marte.py); el icono, radio 12 en 56.
export const VUELO_MARTE = {
  tam: "var(--marte-caja)", dy: "0px", imgLado: 450, imgDisco: 438.8,
  iconoDisco: 24 / 56, claseIcono: "viaje-icono-marte",
};
// El vuelo de /marte a la Tierra (hacia delante, desde la Tierra pequeña):
// acaba en la Tierra de la portada, que no es un disco centrado sino el
// horizonte de abajo; su caja se mide en un .hero-planet (`destino`). La
// imagen es planeta-quieto*.png (600 x 585, el disco la llena de alto) puesta
// en un lienzo cuadrado de 1200 con el disco en medio (ver /marte); el icono,
// radio 12 en 56.
export const VUELO_TIERRA = {
  imgLado: 1200, imgDisco: 1170, iconoDisco: 24 / 56, claseIcono: "viaje-icono-tierra",
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
// FASES fases en fila; logo-files/generar-astros.py): background-position.
// Edad de la luna desde una luna nueva conocida (6-ene-2000, 18:14 UTC) y mes
// sinódico medio: basta para el día.
export function faseLunaHoy() {
  const FASES = 30, MES_SINODICO = 29.530588853, LUNA_NUEVA = Date.UTC(2000, 0, 6, 18, 14);
  const edad = ((((Date.now() - LUNA_NUEVA) / 86400000) % MES_SINODICO) + MES_SINODICO) % MES_SINODICO;
  const i = Math.round((edad / MES_SINODICO) * FASES) % FASES;
  return `${(i / (FASES - 1)) * 100}% 0`;
}

/**
 * Hace el vuelo. Resuelve con la posición final de las estrellas (para
 * colocar las de la otra página igual) cuando termina; la capa del vuelo se
 * queda puesta (la quita el cambio de página, o `limpiar()` del resultado).
 * `inverso`: el mismo vuelo hacia atrás, de /luna a la Tierra (en /luna se
 * ponen un icono y una Tierra con las clases de la portada, para medir dónde
 * acaban); `iconoVisible` = false si en la portada no se ve la luna (de día):
 * entonces la Luna se apaga en vez de fundirse con el icono.
 * Elegido por el usuario (17-sep-2026): tierra "encima", píxeles "directo"
 * (con el fundido del icono al dibujo algo más largo) y 6 s.
 * Destino: `tam` es el lado de la caja de la imagen en la otra página y `dy`
 * cuánto sube su centro respecto al de la ventana (CSS); `imgLado` e
 * `imgDisco`, el lado de la imagen y el diámetro de su disco en px de arte;
 * `iconoDisco`, el diámetro del disco en el icono (fracción de su lado), y
 * `claseIcono`, la clase de su copia en la capa del vuelo. `destino`, en vez
 * de `tam` y `dy`: un elemento con la caja de la imagen en la otra página (su
 * centro es el del disco); lo usa el vuelo a la Tierra de la portada.
 * `alejar` (solo la vuelta desde /marte, con `inverso`): Marte empieza con el
 * zoom `zoom` en su lienzo; primero se aleja en él (`ponZoom`) y al llegar a
 * x1 se le hace la foto (`foto`, que además esconde el lienzo) y sigue el
 * vuelo con ella. Alejarse y volar van en una sola curva del tamaño aparente,
 * sin pararse entre medias: el usuario lo quería "practicamente fluido" y a
 * la misma velocidad (22-sep-2026). `img` puede faltar: la pone `foto`.
 * @param {{ icono: HTMLElement, planeta: HTMLElement, estrellas: HTMLElement,
 *   apagar?: HTMLElement[], img?: HTMLImageElement | HTMLCanvasElement | null, duracion?: number,
 *   tierra?: keyof typeof TIERRAS, pixeles?: keyof typeof PIXELES,
 *   velocidad?: number, inverso?: boolean, iconoVisible?: boolean,
 *   tam?: string, dy?: string, imgLado?: number, imgDisco?: number,
 *   iconoDisco?: number, claseIcono?: string, destino?: HTMLElement | null,
 *   alejar?: { zoom: number, ponZoom: (z: number) => void, foto: () => HTMLCanvasElement } | null }} o
 * @returns {{ fin: Promise<string>, limpiar: () => void }}
 */
export function volarALuna({
  icono, planeta, estrellas, apagar = [], img = null,
  duracion = 6000, tierra = "encima", pixeles = "directo", velocidad = 1,
  inverso = false, iconoVisible = true,
  tam = "var(--luna-tam)", dy = "var(--luna-dy)", imgLado = 600, imgDisco = 585,
  iconoDisco = ICONO_DISCO, claseIcono = "viaje-icono", alejar = null, destino = null,
}) {
  const CARA_DISCO = imgDisco / imgLado;
  // Tamaño y sitio del astro en la otra página (en /luna, --luna-tam y
  // --luna-dy: cuánto sube respecto al centro), medidos con una sonda. La
  // cámara acaba mirando a ese punto, así que CY es el centro del disco, no el
  // de la ventana.
  const W = innerWidth, H = innerHeight;
  let rs, CX, CY, inclina = 0;
  if (destino) {
    // La Tierra de la portada acaba abajo (su centro, por debajo de la
    // pantalla). La cámara llega mirándola de frente en el centro y, al final,
    // mientras se acerca, sube la vista lo justo (`inclina`) para que la
    // Tierra baje hasta su sitio: como quien llega y se queda viendo el
    // horizonte. Si la cámara apuntara desde el principio a ese sitio, la
    // Tierra se iría pequeña hasta el borde de abajo y crecería desde allí.
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

  // --- Capa con la luna
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
  let imagen = img;                                   // con `alejar`, la pone la foto al llegar a x1
  const reducida = (res) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = Math.max(1, Math.round(res / CARA_DISCO));
    const x = cv.getContext("2d");
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = "high";
    x.drawImage(imagen, 0, 0, cv.width, cv.height);
    return cv;
  };
  const NIVELES = [64, 128, 256];
  /** @type {HTMLElement | null} */
  let ic = null;
  let iIcono = -1, iOriginal = -1, iNiveles = [];
  // "constante": un canvas que se redibuja a la resolución que toque
  let vivo = null, vivoRes = 0;
  const montarCapas = () => {
    ic = document.createElement("div");
    ic.className = claseIcono;
    ic.style.backgroundPosition = getComputedStyle(icono).backgroundPosition;
    iIcono = pon(ic, ladoIcono, iconoDisco * ICONO_N);
    iNiveles = pixeles === "etapas" ? NIVELES.map((res) => pon(reducida(res), lado1, res)) : [];
    if (pixeles === "constante") vivo = pon(document.createElement("canvas"), lado1);
    // La imagen puede ser un lienzo (la vuelta desde /marte vuela con una foto
    // de Marte tal como se ha dejado): ese se usa tal cual, que al clonarlo
    // saldría vacío.
    let original;
    if (imagen instanceof HTMLCanvasElement) original = imagen;
    else {
      original = /** @type {HTMLImageElement} */ (imagen.cloneNode());
      original.alt = "";
    }
    iOriginal = pon(original, lado1);
  };
  if (!alejar) montarCapas();
  // La capa va DETRÁS de la Tierra (dentro del hero, justo antes que ella):
  // la Tierra está más cerca, así que si se cruzan la Luna pasa por detrás.
  capa.style.zIndex = "0";
  planeta.before(capa);
  icono.style.visibility = "hidden";                  // lo sustituye su copia en la capa

  for (const el of apagar) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duracion * 0.25 / velocidad, easing: "ease-out", fill: "forwards" });
  }
  planeta.style.willChange = "transform, opacity";

  // Opacidad de cada capa de la luna en el instante t con diámetro d.
  const opacidades = (t, d) => {
    const o = capas.map(() => 0);
    const orig = (desde) => suave(clamp01((t - desde) / (1 - desde)));
    if (pixeles === "directo") {
      const f = suave(clamp01(t / FUNDIDO_HASTA));
      // el icono sigue opaco debajo hasta que el dibujo casi lo tapa (si no, a
      // mitad de fundido se transparentan las estrellas), y luego se apaga su halo
      o[iIcono] = iconoVisible ? 1 - suave(clamp01((f - 0.5) / 0.5)) : 0;
      o[iOriginal] = f;
    } else if (pixeles === "icono") {
      o[iIcono] = 1;
      o[iOriginal] = orig(0.8);
    } else if (pixeles === "constante") {
      const f = clamp01((d / dLuna0 - 1.3) / 0.6);   // del icono al dibujo cuando ha crecido un poco
      o[iIcono] = 1 - f;
      o[vivo] = f;
      o[iOriginal] = orig(0.86);
    } else {                                         // etapas
      const BLOQUE_MAX = 4.5, BANDA = 0.3;
      const nivel = Math.min(NIVELES.length, Math.max(0, Math.log2(d / (BLOQUE_MAX * 32)) + 1));
      const base = Math.floor(nivel), mezcla = suave(clamp01((nivel - base - (1 - BANDA)) / BANDA));
      const idx = [iIcono, ...iNiveles];
      o[idx[base]] = 1;
      if (base + 1 < idx.length) o[idx[base + 1]] = mezcla;
      o[iOriginal] = orig(0.86);
    }
    return o;
  };

  // Tierra: transform y opacidad según la variante. `ix, iy`: desplazamiento
  // de las estrellas por el giro. "La Tierra" es el astro que se deja atrás:
  // la Tierra de la portada, o la Luna de /luna en el vuelo a Marte; se
  // respeta la colocación de su CSS (translateX(-50%) la Tierra,
  // translate(-50%, -50%) la Luna).
  const T0 = getComputedStyle(planeta).transform;
  const TIERRA_T0 = T0 === "none" ? "" : T0;
  const rp = planeta.getBoundingClientRect();
  // "encima": crece hasta ENCIMA_K y baja lo justo para que su borde de arriba
  // (con margen para la aurora) acabe por debajo de la pantalla.
  const ENCIMA_K = 1.5, ENCIMA_HASTA = 0.5;
  const encimaBaja = H - (rp.top + rp.height / 2 - (ENCIMA_K * rp.height) / 2) + H * 0.15;
  const moverTierra = (t, ix, iy) => {
    const u = inOutCubic(t);
    let dx = 0, dy = 0, k = 1, op = 1;
    if (tierra === "cae") {
      k = 1 / (1 + 6 * u);
      dx = ix;
      dy = iy + H * 0.4 * u;
    } else if (tierra === "giro") {
      const g = inOutSine(clamp01(t / 0.7));
      dx = ix * 1.6;
      dy = iy * 1.6 + H * 0.9 * g;
    } else if (tierra === "aleja") {
      k = 1 / (1 + 9 * u);
    } else if (tierra === "encima") {
      const e = clamp01(t / ENCIMA_HASTA), ee = e * e;
      k = 1 + (ENCIMA_K - 1) * ee;
      dy = encimaBaja * ee;
      dx = ix * 0.5;
    } else if (tierra === "apaga") {
      const e = clamp01(t / 0.35);
      k = 1 - 0.12 * e;
      op = 1 - suave(e);
    }
    planeta.style.transform = `translate(${dx}px, ${dy}px) ${TIERRA_T0} scale(${k})`;
    planeta.style.opacity = String(op);
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
  // estrellas y Tierra.
  const pintaT = (t) => {
    const c = camara(t);
    const r = resta(luna, c.pos), z = punto(r, c.del);
    const lx = CX + (F * punto(r, c.der)) / z, ly = CY + (F * punto(r, c.aba)) / z;
    const d = (2 * F) / z;                           // diámetro del disco en px
    const k = d / dLuna1;
    if (vivo !== null) {
      // resolución para que cada píxel de arte mida ~3 px de pantalla, en pasos de 8
      const res = Math.min(imgDisco, Math.max(16, Math.round(d / 3 / 8) * 8));
      if (res !== vivoRes) {
        vivoRes = res;
        const cv = /** @type {HTMLCanvasElement} */ (capas[vivo].el);
        cv.width = cv.height = Math.round(res / CARA_DISCO);
        const x = cv.getContext("2d");
        x.imageSmoothingEnabled = true;
        x.imageSmoothingQuality = "high";
        x.drawImage(imagen, 0, 0, cv.width, cv.height);
      }
    }
    const ops = capas.length ? opacidades(t, d) : [];
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
    moverTierra(t, ix, iy);
    return pos;
  };

  // Ritmo. Por defecto, el de siempre: t lineal en el tiempo (la cámara ya
  // lleva sus curvas). Con `alejar`, por tamaño: el logaritmo del tamaño
  // aparente de Marte (1 = x1 en /marte) baja desde log(zoom) hasta el del
  // icono siguiendo una sola curva E, que arranca desde parado, tiene la
  // velocidad máxima hacia un tercio y frena despacio hasta el final
  // (E' = 12x(1-x)²). Mientras el tamaño es mayor que 1 se aleja el lienzo;
  // después, el vuelo: del tamaño se saca la distancia de la cámara (mirando
  // a Marte de frente, que es como empieza la vuelta) y de ahí el instante t,
  // así que el giro, la Tierra y el fundido con el icono llegan donde
  // siempre. La duración crece con el zoom (1,6 s por cada e de zoom), para
  // que la velocidad máxima sea la misma que sin zoom.
  const E = (x) => x * x * (6 - 8 * x + 3 * x * x);
  const invInOutCubic = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt(2 * (1 - u)) / 2);
  const Lmag = Math.hypot(luna[0], luna[1], luna[2]), D1 = (2 * F) / dLuna1;
  const logZ0 = alejar ? Math.log(Math.max(1, alejar.zoom)) : 0;
  const recorrido = logZ0 + Math.log(Lmag / D1);
  const total = duracion + (alejar ? 1600 * logZ0 : 0);
  // Instante t de la escena para el avance p (0..1), o null mientras se aleja
  // el lienzo (ya con su zoom puesto).
  const instante = (p) => {
    if (!alejar) return inverso ? 1 - p : p;
    const L = logZ0 - recorrido * E(p);
    if (L > 0) {
      alejar.ponZoom(Math.exp(L));
      return null;
    }
    if (!capas.length) {                               // llega a x1: la foto, y a volar con ella
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
      const p = Math.min(1, ((ahora - t0) * velocidad) / total);
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
