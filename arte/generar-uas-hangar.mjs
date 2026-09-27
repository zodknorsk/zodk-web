// El hangar en pixel art de la tira «Hangar de UAS» de la portada, de lado
// y un poco girado para que se vea la puerta, a la derecha, mirando a los
// drones. Y la baldosa del suelo de la plataforma. Todo dibujado a
// mano con código, píxel a píxel, sin navegador.
//
// Escribe en public/uas/hangar/:
//   hangar-<color>-<forma>.png   tira de 5 fotogramas: la puerta de
//                                entreabierta (luz tenue) a abierta (luz viva)
//   posiciones.json              dónde cae la puerta (para la luz del suelo)
//   suelo-asfalto.png            baldosa del suelo, oscura como el resto de
//                                tarjetas de la portada
// Uso (desde la raíz del repo):  node arte/generar-uas-hangar.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DESTINO = path.join(REPO, "public/uas/hangar");
fs.mkdirSync(DESTINO, { recursive: true });

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Lienzo con utilidades de pixel art.
function lienzo(ancho, alto) {
  const d = new Uint8Array(ancho * alto * 4);
  const c = {
    ancho, alto, d,
    px(x, y, color, alfa = 255) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= ancho || y >= alto) return;
      const k = (y * ancho + x) * 4;
      const [r, g, b] = typeof color === "string" ? hex(color) : color;
      if (alfa === 255 || d[k + 3] === 0) { d.set([r, g, b, alfa], k); return; }
      const a = alfa / 255;  // mezcla sobre lo que haya
      d.set([d[k] * (1 - a) + r * a, d[k + 1] * (1 - a) + g * a, d[k + 2] * (1 - a) + b * a, Math.max(d[k + 3], alfa)], k);
    },
    rect(x, y, w, h, color, alfa) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) c.px(i, j, color, alfa); },
    lleno: (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto && d[(y * ancho + x) * 4 + 3] > 0,
    // Contorno de 1 px por fuera de lo pintado.
    contorno(color) {
      const marcar = [];
      for (let y = 0; y < alto; y++)
        for (let x = 0; x < ancho; x++)
          if (!c.lleno(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => c.lleno(x + a, y + b))) marcar.push([x, y]);
      for (const [x, y] of marcar) c.px(x, y, color);
    },
    // Sombra: lo pintado, desplazado abajo a la derecha, por detrás.
    sombra(dx, dy, alfa) {
      const copia = d.slice();
      for (let y = alto - 1; y >= 0; y--)
        for (let x = ancho - 1; x >= 0; x--) {
          const sx = x - dx, sy = y - dy;
          if (d[(y * ancho + x) * 4 + 3] === 0 && sx >= 0 && sy >= 0 && copia[(sy * ancho + sx) * 4 + 3] > 0)
            d.set([0, 0, 0, alfa], (y * ancho + x) * 4);
        }
    },
    guardar: (nombre) => sharp(Buffer.from(d), { raw: { width: ancho, height: alto, channels: 4 } })
      .png({ compressionLevel: 9 }).toFile(path.join(DESTINO, nombre)),
  };
  return c;
}

// Azar con semilla: siempre el mismo dibujo.
function azar(semilla) {
  let s = semilla;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// El hangar de arco visto de lado y un poco girado: la pared larga de frente
// con el tejado curvo encima y, a la derecha, el testero en perspectiva con
// la puerta en arco (el boceto del usuario). Se construye como un sólido: una
// sección (paredes y medio arco) que se repite a lo largo del hangar y se
// proyecta con la profundidad hacia arriba a la derecha; se pinta de atrás
// adelante y, al final, el testero con la puerta.
const H = 100;
const SUELO = 88;            // línea del suelo, en el lado cercano
const LARGO = 92;            // cuánto mide a lo largo
// Formas: el arco solo o con un anexo de chapa a la izquierda (más ancho).
// (Más ancho de la cuenta a la derecha: ahí cae la luz de la puerta.)
const FORMAS = { arco: { ancho: 184, x0: 14 }, anexo: { ancho: 212, x0: 42 } };
let W = 148, X0 = 14;
const FONDO = [28, 14];      // cómo se proyecta la profundidad: [dx, dy hacia arriba]
const PARED = 38, ARCO = 26; // alto de las paredes y del arco del tejado
// Colores: seis tonos de la chapa (de oscuro a claro), el óxido y la pintura
// de las letras.
const COLORES = {
  verde: { tonos: ["#2f352c", "#3d4439", "#4a5146", "#5d6558", "#737c6c", "#8a9482"], oxido: "#5a4a36", letras: "#c9cdbf" },
  aluminio: { tonos: ["#2c3036", "#3b4047", "#4d535b", "#646b74", "#7f8791", "#9da5ae"], oxido: "#4e463c", letras: "#e4e7ea" },
  arena: { tonos: ["#3a3124", "#4d4130", "#655640", "#7e6d51", "#998765", "#b5a27c"], oxido: "#5b3f28", letras: "#efe6d0" },
  carbon: { tonos: ["#17191c", "#1f2226", "#292d32", "#353a40", "#444a52", "#565d66"], oxido: "#3b2f24", letras: "#d6a51c" },
};
let T = COLORES.verde.tonos, OXIDO = COLORES.verde.oxido, LETRAS_COLOR = COLORES.verde.letras;
const LUZ_TENUE = ["#9a5a1e", "#7a4417", "#5e3413"];
const LUZ_VIVA = ["#ffe1a0", "#ffb44a", "#e8872a"];

// Alto del tejado en cada punto de la sección (d de 0, el lado cercano, a 1).
const altoEn = (d) => PARED + ARCO * Math.sqrt(Math.max(0, 1 - (2 * d - 1) ** 2));
// De sección (a lo largo t, profundidad d, altura h) a píxel.
const aPixel = (t, d, h) => [X0 + t + d * FONDO[0], SUELO - h - d * FONDO[1]];
// Píxel sobre la pared cercana (d = 0): a lo largo t, altura h.
const enPared = (c, t, h, color, alfa) => { const [x, y] = aPixel(t, 0, h); c.px(x, y, color, alfa); };
// Píxel sobre el testero (t = LARGO): profundidad d, altura h.
const enTestero = (c, d, h, color, alfa) => { const [x, y] = aPixel(LARGO, d, h); c.px(x, y, color, alfa); };

// Letras de plantilla, 3x5 (con el corte de plantilla en la O y la A).
const PLANTILLA = {
  U: ["101", "101", "101", "101", "111"],
  A: ["111", "101", "111", "101", "101"],
  S: ["111", "100", "111", "001", "111"],
};

// Mezcla de dos colores hex (t de 0 a 1).
const mezcla = (a, b, t) => { const [x, y] = [hex(a), hex(b)]; return x.map((v, i) => Math.round(v + (y[i] - v) * t)); };

// El hangar con la puerta abierta en fracción f (0: entreabierta, 1: abierta).
function hangar(f, forma) {
  const c = lienzo(W, H);
  const rnd = azar(21);
  // Anexo: una caseta de chapa pegada a la izquierda, con tejado de una
  // pendiente. Se pinta antes, porque su parte de atrás queda tras el hangar.
  if (forma === "anexo") {
    for (let k = 40; k >= 0; k--) {
      const d = (k / 40) * 0.7;
      const alto = 20 + 6 * (d / 0.7);
      for (let t = -26; t <= 0; t++) {
        const [x, ySuelo] = aPixel(t, d, 0);
        const [, yTecho] = aPixel(t, d, alto);
        for (let y = Math.round(yTecho); y <= Math.round(ySuelo); y++) {
          const h = ySuelo - y;
          let tono = d > 0 ? (h > alto - 1.5 ? 4 : 3) : (h < 3 ? 1 : 2);
          if (d === 0 && Math.abs(h - alto) < 0.6) tono = 4;
          if (d === 0 && t % 4 === 0) tono = Math.max(0, tono - 1);
          c.px(x, y, T[tono]);
        }
      }
    }
    for (let a = 0; a < 5; a++) for (let h = 1; h <= 10; h++) enPared(c, -20 + a, h, a === 0 || a === 4 || h === 10 ? T[0] : T[1]);
    for (let a = 0; a < 5; a++) for (let e = 0; e < 3; e++) enPared(c, -10 + a, 13 - e, f >= 0.5 ? LUZ_VIVA[1] : LUZ_TENUE[1]);
  }
  const PASOS = 80;
  // De atrás adelante: cada rebanada de profundidad pinta su columna.
  for (let k = PASOS; k >= 0; k--) {
    const d = k / PASOS;
    const alto = altoEn(d);
    // Tono del tejado según hacia dónde mira (luz de arriba a la izquierda).
    const tonoTejado = d < 0.12 ? 3 : d < 0.3 ? 4 : d < 0.6 ? 5 : d < 0.85 ? 4 : 3;
    for (let t = 0; t <= LARGO; t++) {
      const [x, ySuelo] = aPixel(t, d, 0);
      const [, yTecho] = aPixel(t, d, alto);
      const nervio = Math.round(t) % 3 === 0;
      for (let y = Math.round(yTecho); y <= Math.round(ySuelo); y++) {
        const h = ySuelo - y;
        let tono = h > PARED - 0.5 || d > 0 ? tonoTejado : 3;
        if (d === 0 && h <= PARED) tono = h < 3 ? 1 : 3;       // zócalo más oscuro
        if (d === 0 && Math.abs(h - PARED) < 0.6) tono = 1;    // alero: pared y tejado
        if (nervio) tono = Math.max(0, tono - 1);
        c.px(x, y, T[tono]);
      }
    }
  }

  // Chorretones de óxido bajo el alero, en la pared.
  for (let t = 2; t < LARGO - 2; t += 1) {
    if (rnd() > 0.16) continue;
    const largo = 3 + Math.floor(rnd() * 9);
    for (let h = PARED - 2; h > PARED - 2 - largo; h--) enPared(c, t, h, OXIDO, Math.round(150 * (1 - (PARED - 2 - h) / largo)));
  }

  // «UAS» pintado con plantilla, en blanco gastado (letras al doble).
  [..."UAS"].forEach((l, i) => PLANTILLA[l].forEach((fila, j) => [...fila].forEach((b, k) => {
    if (b !== "1") return;
    for (let a = 0; a < 2; a++) for (let e = 0; e < 2; e++) {
      if (rnd() < 0.12) continue;  // desgaste
      enPared(c, 16 + i * 9 + k * 2 + a, 27 - j * 2 - e, LETRAS_COLOR, 170);
    }
  })));

  // Tres ventanucos altos: luz cálida tenue; con la puerta abierta, encendidos.
  for (const t0 of [52, 60, 68]) {
    for (let a = 0; a < 5; a++) for (let e = 0; e < 3; e++) enPared(c, t0 + a, PARED - 6 - e, f >= 0.5 ? (e === 2 ? LUZ_VIVA[0] : LUZ_VIVA[1]) : (e === 2 ? LUZ_TENUE[0] : LUZ_TENUE[1]));
    for (let a = -1; a <= 5; a++) enPared(c, t0 + a, PARED - 10, T[1]);  // alféizar de arriba
  }

  // Puerta de servicio con su farol, cerca de la esquina.
  for (let a = 0; a < 6; a++) for (let h = 1; h <= 12; h++) enPared(c, 78 + a, h, a === 0 || a === 5 || h === 12 ? T[0] : T[1]);
  enPared(c, 82, 6, "#8a8f86");                     // manilla
  enPared(c, 80, 15, "#ffd978"); enPared(c, 81, 15, "#ffd978");  // farol
  for (let a = -3; a <= 5; a++) for (let e = 0; e <= 4; e++) {
    const dist = Math.hypot(a - 1, e);
    if (dist < 4.5 && !(e === 0 && (a === 0 || a === 1))) enPared(c, 80 + a, 14 - e, "#ffd978", Math.round(60 * (1 - dist / 4.5)));
  }

  // El testero (al final del largo): la sección entera, en sombra.
  for (let k = 0; k <= 160; k++) {
    const d = k / 160;
    const [x, ySuelo] = aPixel(LARGO, d, 0);
    const [, yTecho] = aPixel(LARGO, d, altoEn(d));
    for (let y = Math.round(yTecho); y <= Math.round(ySuelo); y++) c.px(x, y, (SUELO - y) < 3 ? T[0] : T[2]);
  }
  // Aristas: la esquina entre la pared (con luz) y el testero, y el borde del
  // arco del testero.
  for (let h = 0; h <= PARED; h++) enPared(c, LARGO, h, T[4]);
  for (let k = 0; k <= 160; k++) { const d = k / 160; enTestero(c, d, altoEn(d), T[4]); }

  // Tejado: dos respiraderos y una antena con su piloto rojo.
  for (const t0 of [24, 58]) {
    const [x, y] = aPixel(t0, 0.5, altoEn(0.5));
    c.rect(Math.round(x), Math.round(y) - 3, 5, 3, T[1]);
    c.rect(Math.round(x), Math.round(y) - 4, 5, 1, T[4]);
  }
  {
    const [x, y] = aPixel(80, 0.45, altoEn(0.45));
    for (let e = 1; e <= 9; e++) c.px(Math.round(x), Math.round(y) - e, e > 7 ? "#8a8f86" : T[1]);
    c.px(Math.round(x), Math.round(y) - 10, "#ff4a3a");
  }

  // La puerta grande en arco, en el centro del testero, con su raíl encima.
  const PUERTA = [0.26, 0.74];
  const altoPuerta = (d) => { const u = (d - 0.5) / 0.24; return 20 + 7 * Math.sqrt(Math.max(0, 1 - u * u)); };
  for (let k = 0; k <= 160; k++) {
    const d = PUERTA[0] + (k / 160) * (PUERTA[1] - PUERTA[0]);
    const u = (d - 0.5) / 0.24;
    const alto = altoPuerta(d);
    // Las hojas se abren hacia los lados: el hueco crece con f y la luz pasa
    // de tenue a viva.
    const hueco = Math.abs(u) < 0.1 + 0.9 * f;
    for (let h = 0; h <= alto; h++) {
      let color;
      if (hueco) {
        const i = h > alto - 5 ? 0 : h > alto * 0.35 ? 1 : 2;
        color = mezcla(LUZ_TENUE[i], LUZ_VIVA[i], f);
      } else color = Math.abs(u) > 0.92 || h > alto - 1 || Math.round(k) % 20 === 0 ? T[0] : T[1];  // hojas con juntas
      enTestero(c, d, h, color);
    }
    enTestero(c, d, alto + 2, T[0]);  // raíl
  }

  // Bidones y una caja junto a la esquina, delante de la pared.
  const bidon = (x, y, color) => {
    c.rect(x, y - 6, 4, 7, color);
    c.rect(x, y - 6, 4, 1, "#b0a58a");
    c.rect(x, y - 3, 4, 1, T[0]);
  };
  bidon(X0 + LARGO - 18, SUELO + 3, "#6e3a2a");
  bidon(X0 + LARGO - 13, SUELO + 4, "#4f5a3a");
  c.rect(X0 + LARGO - 30, SUELO - 1, 8, 6, "#7a6446");
  c.rect(X0 + LARGO - 30, SUELO - 1, 8, 1, "#9a8260");
  c.rect(X0 + LARGO - 27, SUELO - 1, 1, 6, "#5c4a33");

  c.contorno("#121410");
  c.sombra(0, 2, 90);  // solo en la base
  // La luz que sale al suelo: medio óvalo apoyado en la base de la puerta
  // (a lo largo de la pared del testero) y redondeado hacia la derecha, el
  // «arco completo». Tres bandas, más clara junto a la puerta; con la puerta
  // entreabierta es estrecho y tenue, y al abrir se ensancha y se aviva.
  {
    const base = aPixel(LARGO, 0.5, 0);
    // La luz se abre al salir: más ancha que la puerta.
    const [ax, ay] = aPixel(LARGO, 0.5 + 0.24 * (1 + 1.6 * f), 0);
    const E1 = [ax - base[0], ay - base[1]];  // a lo largo de la base del testero
    const E2 = [30 + 14 * f, 0];              // hacia fuera, sobre el suelo
    const det = E1[0] * E2[1] - E1[1] * E2[0];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const px = x + 0.5 - base[0], py = y + 0.5 - base[1];
        const a = (px * E2[1] - py * E2[0]) / det;
        const b = (E1[0] * py - E1[1] * px) / det;
        const r = Math.hypot(a, b);
        if (b < 0 || r > 1) continue;
        const clave = y * W + x;
        if (c.d[clave * 4 + 3] === 255) continue;  // no encima del hangar
        const banda = r < 0.45 ? 0 : r < 0.75 ? 1 : 2;
        c.px(x, y, mezcla(LUZ_TENUE[banda], LUZ_VIVA[banda], f), Math.round([200, 130, 65][banda] * (0.35 + 0.65 * f)));
      }
  }
  return c;
}

// Una tira de 5 fotogramas (la puerta abriéndose) por color y forma:
// hangar-<color>-<forma>.png. Y dónde caen el piloto de la antena y la
// puerta, para las animaciones de la portada (posiciones.json).
const FOTOGRAMAS = [0, 0.25, 0.5, 0.75, 1];
const posiciones = {};
// El elegido por el usuario (27-sep-2026): carbón con anexo. Las demás
// combinaciones siguen aquí por si se quieren volver a probar.
const ELEGIDO = { color: "carbon", forma: "anexo" };
for (const [forma, { ancho, x0 }] of Object.entries(FORMAS).filter(([f]) => f === ELEGIDO.forma)) {
  W = ancho; X0 = x0;
  const [ax, ay] = aPixel(80, 0.45, altoEn(0.45));
  const [px, py] = aPixel(LARGO, 0.5, 0);
  posiciones[forma] = { ancho: W, alto: H, fotogramas: FOTOGRAMAS.length, piloto: [Math.round(ax), Math.round(ay) - 10], puerta: [Math.round(px), Math.round(py)] };
  for (const [color, { tonos, oxido, letras }] of Object.entries(COLORES).filter(([c]) => c === ELEGIDO.color)) {
    T = tonos; OXIDO = oxido; LETRAS_COLOR = letras;
    const tira = lienzo(W * FOTOGRAMAS.length, H);
    FOTOGRAMAS.forEach((f, i) => {
      const fot = hangar(f, forma);
      for (let y = 0; y < H; y++) tira.d.set(fot.d.subarray(y * W * 4, (y + 1) * W * 4), (y * tira.ancho + i * W) * 4);
    });
    await tira.guardar(`hangar-${color}-${forma}.png`);
  }
}
fs.writeFileSync(path.join(DESTINO, "posiciones.json"), JSON.stringify(posiciones));


// Suelos: baldosas que se repiten.
{
  // Asfalto oscuro, casi liso.
  const c = lienzo(32, 32), r = azar(9);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const g = 22 + Math.floor(r() * 3) * 2 + (r() < 0.02 ? 8 : 0); c.px(x, y, [g, g + 2, g + 6]); }
  await c.guardar("suelo-asfalto.png");
}
console.log(`Hangares y suelos en ${path.relative(REPO, DESTINO)}/`);
