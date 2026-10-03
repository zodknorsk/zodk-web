// Pista de la portada: debajo del documento, una animación en pixel art que
// enseña que el planeta se mueve. Con ratón, una mano que agarra y arrastra
// y luego Ctrl + rueda; en táctil, un dedo que desliza y dos que pellizcan.
// - Sale un rato después de que entre el título y se repite VUELTAS veces.
// - Se retira para siempre (en esta sesión, como el tema) en cuanto se mueve
//   o se acerca el planeta: eso retira también el título (.titulo-fuera).
// - Canvas pequeño y a 30 fps, como el giro del planeta; sin pista, no pinta.

const VUELTAS = 3;
const ESPERA = 2500;                               // ms tras .titulo-listo: deja acabar la censura del título
const CLAVE = "zodk-pista-vista";

const COL = { o: "#0b0d12", w: "#ffffff", s: "#c3c7cf", d: "#8d929c", k: "#2a2d35" };

// Sprites de 1 px de arte: o contorno, w blanco, s sombra, d líneas.
// La mano, como el cursor de mano del Mac.
const ABIERTA = [
  "........oo.........",
  ".......owsooo......",
  ".....ooowsowso.....",
  "....owsowsowso.....",
  "....owsowsowsooo...",
  "....owsowsowsowso..",
  ".oo.owsowsowsowso..",
  "owsoowsowsowsowso..",
  "oswsowsowsowsowso..",
  ".owwwwsowsowsowso..",
  ".owwwwsowsowsowso..",
  ".oswwwwwwwwwwwwwso.",
  "..owwdwwwwwwwwwwso.",
  "..oswdwwwwwwwwwwso.",
  "...owwwwwwwwwwwwso.",
  "...oswwwwwwwwwwwso.",
  "....owwwwwwwwwwwso.",
  "....oswwwwwwwwwso..",
  ".....oswwwwwwwwso..",
  "......osssssssso...",
  ".......oooooooo....",
];
const CERRADA = [
  "........oo.oo......",
  ".....ooowsowso.....",
  "....owsowsowsooo...",
  "....owsowsowsowso..",
  "....owwwwwwwwwwwso.",
  "...owwwwwwwwwwwwso.",
  "...owwwwwwwwwwwwso.",
  "...owwwwwwwdwwwwso.",
  "...owddddddwwwwwso.",
  "...owwwwwwwwwwwwso.",
  "...oswwwwwwwwwwwso.",
  "....oswwwwwwwwwso..",
  ".....oswwwwwwwwso..",
  "......osssssssso...",
  ".......oooooooo....",
];
// la cerrada empieza 6 filas más abajo que la abierta (la muñeca, en su sitio)
const BAJA_CERRADA = 6;
const RATON = [
  "...............",
  ".....ooooo.....",
  "...oowwdwsoo...",
  "..owwwwdwwwso..",
  ".owwwwwdwwwwso.",
  ".owwwwwdwwwwso.",
  "owwwwwwdwwwwwso",
  "owwwwwwdwwwwwso",
  "owwwwwwdwwwwwso",
  "owdddddddddddso",
  "owwwwwwwwwwwwso",
  "owwwwwwwwwwwwso",
  "owwwwwwwwwwwwso",
  "owwwwwwwwwwwwso",
  "owwwwwwwwwwwwso",
  "owwwwwwwwwwwwso",
  "oswwwwwwwwwwwso",
  ".oswwwwwwwwwso.",
  "..oswwwwwwwso..",
  "...ossssssso...",
  "....ooooooo....",
];
const YEMA = ["..ooo..", ".owwwo.", "owwwwso", "owwwwso", "owwwsso", ".ossso.", "..ooo.."];

const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const tramo = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

/**
 * @param {HTMLElement} hero
 * @param {HTMLCanvasElement} cv
 */
export function montarPista(hero, cv) {
  try { if (sessionStorage.getItem(CLAVE)) return () => {}; } catch { /* sin almacenamiento: se enseña */ }
  const ctx = cv.getContext("2d");
  const titulo = hero.querySelector(".hero-marco");
  if (!ctx || !titulo) return () => {};
  const tactil = matchMedia("(pointer: coarse)").matches;
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CICLO = tactil ? 5 : 7;                    // s por vuelta
  let P = 3, W = 0, H = 0, cx = 0, cy = 0, raf = 0, ultimo = 0, t0 = 0, espera = 0, hecho = false;

  // Tamaño y sitio: justo debajo del documento, centrado con él. El píxel de
  // arte sigue al tamaño del hero (unos 2,5 px de pantalla a 800 de ancho).
  const coloca = () => {
    const h = hero.getBoundingClientRect(), r = titulo.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    P = Math.max(2, Math.round(Math.max(h.width, tactil ? h.height * 0.75 : 0) * d / 800 * 2.5));
    const p = P / d;                               // píxel de arte en px CSS
    const ancho = tactil ? h.width : Math.max(h.width * 0.3, 70 * p);
    const alto = tactil ? 30 * p + h.width * 0.1 : 40 * p;
    cv.style.width = `${ancho}px`;
    cv.style.height = `${alto}px`;
    cv.style.left = `${r.left + r.width / 2 - h.left - ancho / 2}px`;
    cv.style.top = `${r.bottom - h.top + h.height * (tactil ? 0.06 : 0.025)}px`;
    W = cv.width = Math.round(ancho * d);
    H = cv.height = Math.round(alto * d);
    cx = W / 2;
    cy = tactil ? 4 * P + W * 0.05 : 5 * P;
  };

  const sprite = (s, x, y, al, m = P) => {
    ctx.globalAlpha = al;
    const ox = Math.round(x), oy = Math.round(y);
    s.forEach((fila, j) => {
      for (let i = 0; i < fila.length; i++) {
        if (fila[i] === ".") continue;
        ctx.fillStyle = COL[fila[i]];
        ctx.fillRect(ox + i * m, oy + j * m, m, m);
      }
    });
    ctx.globalAlpha = 1;
  };
  const caja = (x, y, w, h, color, al) => {
    ctx.globalAlpha = al;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w * P, h * P);
    ctx.globalAlpha = 1;
  };
  // rótulo con contorno negro de 1 px, como el título
  const rotulo = (txt, x, y, al) => {
    ctx.font = `500 ${Math.round(P * 5.4)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = al;
    ctx.lineWidth = P;
    ctx.lineJoin = "round";
    ctx.strokeStyle = COL.o;
    ctx.fillStyle = COL.w;
    ctx.strokeText(txt, x, y);
    ctx.fillText(txt, x, y);
    ctx.globalAlpha = 1;
  };
  // tecla Ctrl: cara clara y canto oscuro; pulsada, la cara baja un píxel
  const tecla = (x, y, pulsada, al) => {
    const w = 17, h = 11;
    caja(x, y, w, h + 1, COL.o, al);
    caja(x + P, y + P, w - 2, h - 1, COL.d, al);
    const dy = pulsada ? 2 * P : P;
    caja(x + P, y + dy, w - 2, h - 3, COL.w, al);
    ctx.font = `500 ${Math.round(P * 4.4)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = al;
    ctx.fillStyle = COL.k;
    ctx.fillText("ctrl", x + (w * P) / 2, y + dy + ((h - 3) * P) / 2 + P * 0.3);
    ctx.globalAlpha = 1;
  };
  // ratón con la rueda girando hacia delante (las rayas suben): acercar
  const raton = (x, y, fase, al) => {
    sprite(RATON, x, y, al);
    const rx = x + 6 * P, ry = y + 3 * P;
    caja(rx, ry, 3, 5, COL.o, al);
    for (let k = 0; k < 5; k++) {
      const luz = (((k - Math.floor(fase * 10)) % 3) + 3) % 3 === 0;
      caja(rx + P, ry + (4 - k) * P, 1, 1, luz ? COL.w : COL.k, al);
    }
  };

  const pintaRaton = (t) => {
    const c = (t % CICLO) / CICLO;
    if (c < 0.6) {
      // agarra y arrastra: abierta, se cierra, va a un lado y al otro, se abre
      const k = c / 0.6, A = Math.min(W * 0.23, 40 * P);
      const al = tramo(k, 0, 0.08) * (1 - tramo(k, 0.92, 1));
      const cerrada = k > 0.16 && k < 0.84;
      const u = Math.sin(tramo(k, 0.22, 0.8) * Math.PI * 2);
      const m = Math.max(2, Math.round(P * 0.95));
      const x = cx + u * A - 9.5 * m, y = cy - (1 - u * u) * P - 4 * m;
      if (cerrada) sprite(CERRADA, x, y + BAJA_CERRADA * m, al, m);
      else sprite(ABIERTA, x, y, al, m);
      rotulo("ARRASTRA", cx, cy + 30 * P, al);
    } else {
      // Ctrl + rueda: la tecla se aprieta y la rueda gira
      const k = (c - 0.6) / 0.4;
      const al = tramo(k, 0, 0.1) * (1 - tramo(k, 0.9, 1));
      const pulsada = k > 0.18 && k < 0.85;
      const x0 = cx - (42 * P) / 2;
      tecla(x0, cy + 4 * P, pulsada, al);
      rotulo("+", x0 + 23 * P, cy + 12 * P, al);
      raton(x0 + 27 * P, cy - P, pulsada ? t * 1.6 : 0, al);
      rotulo("AMPLÍA", cx, cy + 30 * P, al);
    }
  };
  const pintaTactil = (t) => {
    const c = (t % CICLO) / CICLO;
    if (c < 0.5) {
      const k = c / 0.5, u = -1 + 2 * suave(tramo(k, 0.15, 0.85)), A = W * 0.22;
      const al = tramo(k, 0, 0.1) * (1 - tramo(k, 0.9, 1));
      sprite(YEMA, cx + u * A - 3.5 * P, cy - (1 - u * u) * A * 0.12, al);
      rotulo("DESLIZA", cx, cy + 20 * P, al);
    } else {
      const k = (c - 0.5) / 0.5, d = 4 * P + suave(tramo(k, 0.15, 0.8)) * W * 0.14;
      const al = tramo(k, 0, 0.1) * (1 - tramo(k, 0.9, 1));
      sprite(YEMA, cx - d - 3.5 * P, cy + d * 0.35, al);
      sprite(YEMA, cx + d - 3.5 * P, cy - d * 0.35, al);
      rotulo("PELLIZCA", cx, cy + 20 * P, al);
    }
  };

  const para = () => { cancelAnimationFrame(raf); raf = 0; };
  const retira = () => {
    if (hecho) return;
    hecho = true;
    clearTimeout(espera);
    cv.classList.remove("visible");
    window.setTimeout(para, 600);                  // deja acabar el fundido
    try { sessionStorage.setItem(CLAVE, "1"); } catch { /* da igual */ }
  };
  const bucle = (ms) => {
    raf = requestAnimationFrame(bucle);
    if (ms - ultimo < 33) return;                  // 30 fps
    ultimo = ms;
    if (!t0) t0 = ms;
    const t = (ms - t0) / 1000;
    if (t > CICLO * VUELTAS) return retira();
    ctx.clearRect(0, 0, W, H);
    (tactil ? pintaTactil : pintaRaton)(t);
  };
  const empieza = () => {
    if (hecho) return;
    coloca();
    cv.classList.add("visible");
    if (quieto) {                                  // sin movimiento: un fotograma fijo
      ctx.clearRect(0, 0, W, H);
      (tactil ? pintaTactil : pintaRaton)(CICLO * 0.2);
      return;
    }
    raf = requestAnimationFrame(bucle);
  };

  // Espera al título; al retirarse el título (se ha movido o acercado), fuera.
  const mo = new MutationObserver(() => {
    if (hero.classList.contains("titulo-fuera")) return retira();
    if (hero.classList.contains("titulo-listo") && !espera && !hecho) espera = window.setTimeout(empieza, ESPERA);
  });
  mo.observe(hero, { attributes: true, attributeFilter: ["class"] });
  if (hero.classList.contains("titulo-listo")) espera = window.setTimeout(empieza, ESPERA);
  const alCambiar = () => { if (cv.classList.contains("visible")) coloca(); };
  window.addEventListener("resize", alCambiar);

  return () => {
    mo.disconnect();
    clearTimeout(espera);
    para();
    window.removeEventListener("resize", alCambiar);
  };
}
