// Maqueta del Wildfire de General Atomics, versión 2.0 (docs/uas-hd.md),
// con la carga de su render principal: cuatro misiles JSM, dos bajo cada ala.
// No hay fotos (el dron no ha volado) ni medidas publicadas: la forma sale de
// los tres renders oficiales de la galería de General Atomics (A, el
// enjambre, desde detrás y arriba; B, desde abajo y delante, con los JSM; C,
// desde arriba, lanzando un LRASM), reconstruida en 3D encajando a la vez las
// tres cámaras y los puntos que se reconocen en más de uno (el dron,
// simétrico). La escala, de los misiles: los JSM miden 3,70 m.
// Todo en metros (z hacia el morro, y = 0 a la altura de la cámara de la
// punta del morro) y al final se pasa a unidades de la maqueta (1 unidad =
// 7,8 m, como el MQ-9). Herramientas y medidas en arte/uas-fuentes/wildfire/hd/
// (fuera de Git) y en docs/uas-hd.md.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 7.8;

const GA = "https://www.ga-asi.com/remotely-piloted-aircraft/wildfire";
const COMUNICADO = "https://www.ga-asi.com/ga-asi-unveils-wildfire-uas-for-military-civil-and-commercial-roles";
const TWZ = "https://www.twz.com/air/first-look-at-general-atomics-wildfire-its-successor-to-the-mq-9-reaper";
const TWZ_AGOSTO = "https://www.twz.com/air/wildfire-is-general-atomics-successor-to-the-mq-9-reaper";

// ── Ala ────────────────────────────────────────────────────────────────────
// Bordes medidos cortando los vistos en B y en C (cada uno, un plano desde
// su cámara): el de ataque casi recto y el de salida adelantándose hacia la
// punta; 1,92 m de cuerda junto al cuerpo y 0,76 en la punta. Plana, a la
// altura de la arista del cuerpo. Las puntas, a 11,1 m del eje.
const ALA = { y: 0.03, punta: 11.08, tRaiz: 0.3, tPunta: 0.11 };
const bordeAtaque = (x: number) => 2.15 - 0.038 * x;
const bordeSalida = (x: number) => 0.115 + 0.078 * x;
const grosorAla = (x: number) => ALA.tRaiz + ((ALA.tPunta - ALA.tRaiz) * x) / ALA.punta;

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// [z, medio ancho, lomo, panza]. La arista viva del costado (la cintura,
// ARISTA), con 0,66 m de medio ancho en el centro (C), se cierra en un morro romo alrededor de la cámara
// de la punta (z = 6,66). El lomo, a 0,47–0,49 (las antenas del lomo, en A y
// en C); la panza, donde nacen la antena de pala y la aleta ventral (B).
// Detrás del ala, encima, la góndola del motor, del mismo cuerpo (un lomo más
// estrecho fundido con él): abierta delante, con la boca de la toma de aire
// (C, z = −0,6), y detrás, con la salida del escape (A, z = −2,38). Detrás
// del escape el cuerpo baja, con una chapa de metal encima, hasta el capuchón
// facetado de la cola.
// En el morro la arista se marca más y la cara de abajo es más plana (una
// cuchara, con la cámara de la punta metida en la arista; B).
// Con `lomo` (medio ancho de la góndola) y `hombro` (lo alto del cuerpo de
// debajo), `arriba` es lo alto de la góndola.
// La arista va en línea recta de la cámara del morro a la hélice (en B se ve
// recta de punta a punta); por debajo, el costado se mete enseguida hacia una
// panza más estrecha (en C, desde arriba, solo asoma una franja fina del
// costado de abajo).
const ARISTA = (z: number) => -0.03 + (6.62 - z) * 0.0209;
const HONDO = 1.0;
const ANCHO = 0.8;
const sec = ([z, ancho0, arriba, abajo, lomo, hombro]: number[]): Seccion => {
  const ancho = ancho0 * (z > -0.5 ? ANCHO : ANCHO + (1 - ANCHO) * Math.min(1, (-0.5 - z) / 1.5));
  return {
  z, ancho, arriba, abajo: ARISTA(z) + (abajo - ARISTA(z)) * HONDO, cintura: ARISTA(z), n: 2.3, nAbajo: 2.2, arista: z > 5 ? 0.6 : 0.4, panza: ancho * 0.6,
  ...(lomo !== undefined && { lomo, hombro, nLomo: 2.2, pLomo: z < -2.3 && z > -2.6 ? 12 : 4 }),
  };
};
const CUERPO: Seccion[] = [
  [6.7, 0, -0.01, -0.05],
  [6.65, 0.16, 0.08, -0.13],
  [6.55, 0.27, 0.17, -0.21],
  [6.4, 0.36, 0.26, -0.27],
  [6.2, 0.44, 0.34, -0.31],
  [6.0, 0.49, 0.39, -0.33],
  [5.77, 0.52, 0.43, -0.35],
  [5.16, 0.55, 0.47, -0.38],
  [4.5, 0.58, 0.49, -0.41],
  [4.0, 0.61, 0.49, -0.43],
  [3.35, 0.64, 0.49, -0.45],
  [2.7, 0.66, 0.49, -0.47],
  [1.5, 0.67, 0.48, -0.49],
  [0.5, 0.66, 0.47, -0.49],
  [-0.4, 0.63, 0.49, -0.48],
  // La góndola: su cara de delante, casi vertical, con la boca de la toma
  // (0,35 × 0,22 m, centrada a 0,64 de alto: C, cortando con el eje); sube
  // hasta 0,92 y acaba de golpe en la salida del escape (0,45 × 0,29 m, con
  // lo alto a 0,91: A). Medio ancho de 0,2 a 0,3 m.
  [-0.6, 0.635, 0.5, -0.48, 0, 0.5],
  [-0.64, 0.632, 0.73, -0.48, 0.165, 0.5],
  [-0.9, 0.615, 0.79, -0.47, 0.22, 0.505],
  [-1.4, 0.565, 0.865, -0.43, 0.29, 0.53],
  [-1.9, 0.52, 0.905, -0.37, 0.31, 0.56],
  [-2.2, 0.49, 0.915, -0.33, 0.305, 0.58],
  // El escape: el corte va inclinado, lo de arriba más adelante y lo de
  // abajo más atrás (A: la boca mira hacia arriba y atrás). La góndola baja
  // siguiendo el corte, algo por debajo del conducto oscuro (escape-conducto,
  // de lomo plano), que asoma rodeado por los costados de la góndola.
  [-2.28, 0.483, 0.91, -0.31, 0.3, 0.6],
  [-2.33, 0.478, 0.84, -0.305, 0.3, 0.6],
  [-2.4, 0.474, 0.72, -0.3, 0.29, 0.605],
  [-2.48, 0.468, 0.645, -0.295, 0.25, 0.612],
  [-2.54, 0.465, 0.622, -0.29, 0.15, 0.618],
  [-2.6, 0.461, 0.615, -0.287],
  // Detrás del escape, el cuerpo cae en tejadillo (A: la chapa con un
  // caballete, una cara al sol y otra en sombra) hasta la junta con el
  // capuchón (z = −3,2, a 0,48 de alto; A y C). Por debajo sube antes (B).
  [-2.9, 0.43, 0.58, -0.23],
  [-3.2, 0.37, 0.495, -0.13],
  [-3.3, 0.34, 0.455, -0.06],
  [-3.45, 0.27, 0.39, 0.02],
  [-3.58, 0.17, 0.31, 0.1],
].map(sec).map((q) => ({ ...q, n: 2.3 + 0.7 * Math.min(1, Math.max(0, (-2.45 - q.z) / 0.75)) }));

// Boca de la toma y salida del escape, en el eje (medio alto / medio ancho
// de su óvalo en `alto`).
const TOMA = { z: -0.585, y: 0.625, alto: 0.63, k: 0.78 };

// ── Cola en V ──────────────────────────────────────────────────────────────
// El plano de cada mitad, de la vista de canto de la izquierda en C (35° sobre
// la horizontal; el de la derecha, su espejo); en él, las esquinas de la raíz
// y la bisagra, vistas en A, y las de la punta (2,96 m del eje, 1,94 de
// alto). Nace del costado del cuerpo. Detrás, el timón, en la mitad de fuera.
const COLA = { y: -0.113, pendiente: 0.704 };
const estCola = (x: number, ba: number, bs: number, t: number): [number, number, number, number, number] => [x, ba, bs, t, COLA.pendiente * x];

// ── Aletas de las puntas ───────────────────────────────────────────────────
// En flecha, hacia arriba y hacia abajo: el vértice de delante en el ala y
// las dos mitades echadas atrás (las seis esquinas, encajadas en B y en C).
const ALETA: [number, number][] = [
  [1.43, 0.1], [1.0, 0.55], [0.59, 0.5], [0.84, 0.06], [0.61, -0.45], [1.03, -0.42],
];

// ── Superficies de mando del ala ──────────────────────────────────────────
// En A se ve la línea de la bisagra a lo largo del ala, con el corte entre el
// flap y el alerón a 6,47 m del eje; sobre el borde de salida, los carenados
// de los mandos (A y C, los mismos en los dos lados; desde abajo, en B, el
// ala está limpia). Piezas aparte con su
// hueco; el ala pasa poco a poco a la cuerda de la bisagra (con un escalón en
// un ala gruesa sale una línea que parpadea).
const MANDO = { cuerda: 0.28, hueco: 0.012, flap: [0.85, 6.42], aleron: [6.52, 10.75] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda * (bordeAtaque(x) - bordeSalida(x));
const estMando = (x: number): [number, number, number, number] => [x, bisagra(x) - MANDO.hueco, bordeSalida(x), grosorAla(x) * 0.42];
const CARENADOS = [1.75, 4.25, 6.47, 8.13, 9.8];

// ── Misiles JSM ────────────────────────────────────────────────────────────
// Dos bajo cada ala, uno junto al otro (B): el de dentro a 1,37 m del eje y
// el de fuera a 2,27, el eje a 0,55 m bajo el ala. La forma es la del JSM de
// verdad (Kongsberg), no la del render, donde sale pequeño y simplificado:
// las maquetas a tamaño real de las ferias (Farnborough, ILA 2024, Japan
// Aerospace 2016, Bruselas, la entrega a Japón), el corte de Kongsberg de
// 2014 y sus renders. Medidas oficiales: 4,00 m de largo, 0,48 de ancho y
// 0,52 de alto con las alas plegadas. Se escribe en metros del misil (d, desde
// la punta) y se reduce entero a los 3,70 m que ocupa en la maqueta (que no
// está a escala exacta), así guarda sus proporciones.
const JSM = { y: -0.555, xs: [1.37, 2.27], delante: 3.38, detras: -0.32 };
const KJ = (JSM.delante - JSM.detras) / 4.0;
const zj = (d: number) => JSM.delante - d * KJ;
const SOPORTE = { x: (JSM.xs[0] + JSM.xs[1]) / 2, abajo: -0.29 };
const LADOS = [1, -1];
// Sección a d metros de la punta, en metros del misil desde su eje: más ancho
// que alto, con el lomo redondeado, los costados que se abren hacia abajo
// hasta una arista baja y la panza plana (renders de Kongsberg).
const secJsm = (d: number, ancho: number, arriba: number, abajo: number, cintura: number, n = 2.4, panza = ancho * 0.82): Seccion => ({
  z: zj(d), ancho: ancho * KJ, arriba: JSM.y + arriba * KJ, abajo: JSM.y + abajo * KJ, cintura: JSM.y + cintura * KJ,
  n, nAbajo: 3, arista: 0.45, panza: panza * KJ,
});
const CUERPO_JSM: Seccion[] = [
  // El morro, romo: la cara de delante casi vertical y, en su mitad de
  // abajo, la ventana del buscador mirando hacia delante como una boca
  // abierta (VENTANA_JSM). Hasta 0,035 m solo existe lo de encima de la
  // ventana; ahí el cuerpo baja de golpe y deja la cara donde va la ventana,
  // que asoma rodeada de su marco. La junta del radomo, a 0,82 m.
  secJsm(0, 0.14, 0.04, 0.0, 0.002, 2, 0.1),
  secJsm(0.035, 0.18, 0.08, -0.004, -0.002, 2.2, 0.13),
  secJsm(0.04, 0.183, 0.083, -0.165, -0.06, 2.2, 0.12),
  secJsm(0.08, 0.195, 0.1, -0.172, -0.07, 2.2, 0.13),
  secJsm(0.16, 0.205, 0.13, -0.18, -0.08, 2.3),
  secJsm(0.3, 0.215, 0.155, -0.188, -0.1),
  secJsm(0.5, 0.222, 0.15, -0.19, -0.105),
  secJsm(0.72, 0.228, 0.18, -0.19, -0.11),
  secJsm(0.9, 0.23, 0.19, -0.19, -0.11),
  secJsm(3.3, 0.23, 0.19, -0.19, -0.11),
  // La cola se cierra redondeada hasta la tobera.
  secJsm(3.55, 0.205, 0.17, -0.175, -0.09, 2.2),
  secJsm(3.78, 0.15, 0.125, -0.135, -0.06, 2.1, 0.09),
  secJsm(3.93, 0.09, 0.075, -0.085, -0.03, 2, 0.05),
  secJsm(4.0, 0.055, 0.045, -0.05, -0.02, 2, 0.03),
];
// Alas plegadas encima, en tijera: giran sobre un mismo eje en el lomo
// (d = 2,15) y quedan una hacia delante y otra hacia atrás (corte de 2014).
// Dos anclajes de 30" (0,76 m) para colgarlo (corte de 2014: «lugs»).
// La ventana del buscador (renders de Kongsberg, maquetas de Farnborough y
// Japan Aerospace): en la cara de delante, un rectángulo de esquinas
// redondeadas más ancho que alto, de y = −0,01 a −0,15 m, con dos cristales
// planos que se juntan en una arista vertical en el centro (una cuña que
// apunta adelante: [d, medio ancho]).
const VENTANA_JSM: [number, number][] = [[0.024, 0.012], [0.038, 0.16]];
const ALA_JSM = { eje: 2.15, largo: 0.8, raiz: 0.32, punta: 0.14 };
const ANCLAJES_JSM = [1.77, 2.53];
const jsm = (x: number): Pieza[] => {
  const lomo = JSM.y + 0.19 * KJ;
  const alaPlegada = (id: string, sentido: number, y: number): Pieza => {
    const d0 = ALA_JSM.eje, d1 = ALA_JSM.eje + sentido * ALA_JSM.largo, r = ALA_JSM.raiz / 2, t = ALA_JSM.punta / 2;
    return {
      tipo: "placa", id, acabado: "gris-ga", plano: "horizontal", y, grosor: 0.016 * KJ, bisel: 0.005 * KJ,
      planta: [[x - r * KJ, zj(d0)], [x + r * KJ, zj(d0)], [x + t * KJ, zj(d1 - sentido * 0.06)], [x, zj(d1)], [x - t * KJ, zj(d1 - sentido * 0.12)]],
    };
  };
  return [
    { tipo: "casco", id: `jsm-${x}`, acabado: "gris-ga", x, secciones: CUERPO_JSM },
    { tipo: "casco", id: `jsm-ventana-${x}`, acabado: "negro", x, secciones: VENTANA_JSM.map(([d, a]) => ({
      z: zj(d), ancho: a * KJ, arriba: JSM.y - 0.012 * KJ, abajo: JSM.y - 0.15 * KJ, cintura: JSM.y - 0.08 * KJ, n: 5, nAbajo: 5,
    })) },
    { tipo: "disco", id: `jsm-tobera-${x}`, acabado: "hueco", en: [x, JSM.y, zj(4.0) - 0.002], normal: [0, 0, -1], radio: 0.04 * KJ, grosor: 0.004 },
    // Toma de aire en el costado izquierdo, abajo, detrás del ala: una
    // ranura alta y estrecha que sale del costado y se funde con la cola
    // (maqueta de Farnborough; en el derecho no hay).
    { tipo: "casco", id: `jsm-toma-${x}`, acabado: "gris-ga", x: x + 0.215 * KJ, abierto: true, secciones: [
      { z: zj(2.8), ancho: 0.05 * KJ, arriba: JSM.y + 0.0 * KJ, abajo: JSM.y - 0.19 * KJ, cintura: JSM.y - 0.095 * KJ, n: 3.5, nAbajo: 3.5 },
      { z: zj(2.95), ancho: 0.052 * KJ, arriba: JSM.y + 0.0 * KJ, abajo: JSM.y - 0.19 * KJ, cintura: JSM.y - 0.095 * KJ, n: 3.5, nAbajo: 3.5 },
      { z: zj(3.3), ancho: 0.035 * KJ, arriba: JSM.y - 0.03 * KJ, abajo: JSM.y - 0.17 * KJ, cintura: JSM.y - 0.1 * KJ, n: 3, nAbajo: 3 },
      { z: zj(3.55), ancho: 0, arriba: JSM.y - 0.08 * KJ, abajo: JSM.y - 0.14 * KJ, cintura: JSM.y - 0.11 * KJ },
    ] },
    { tipo: "casco", id: `jsm-toma-boca-${x}`, acabado: "hueco", x: x + 0.215 * KJ, secciones: [
      { z: zj(2.81), ancho: 0.034 * KJ, arriba: JSM.y - 0.015 * KJ, abajo: JSM.y - 0.175 * KJ, cintura: JSM.y - 0.095 * KJ, n: 3.5, nAbajo: 3.5 },
      { z: zj(3.0), ancho: 0.034 * KJ, arriba: JSM.y - 0.015 * KJ, abajo: JSM.y - 0.175 * KJ, cintura: JSM.y - 0.095 * KJ, n: 3.5, nAbajo: 3.5 },
    ] },
    alaPlegada(`jsm-ala-1-${x}`, -1, lomo + 0.012 * KJ),
    alaPlegada(`jsm-ala-2-${x}`, 1, lomo + 0.03 * KJ),
    // Aletas de cola en X (Farnborough: dos arriba en V y dos abajo), en
    // flecha y con la punta recortada.
    ...[45, -45, 135, -135].map((inclinacion, i): Pieza => ({
      tipo: "placa", id: `jsm-aleta-${x}-${i}`, acabado: "gris-ga", plano: "vertical", x, y: JSM.y, grosor: 0.02 * KJ, bisel: 0.006 * KJ, inclinacion,
      planta: ([[3.62, 0.12], [3.97, 0.12], [3.985, 0.34], [3.84, 0.36]] as [number, number][]).map(([d, r]): [number, number] => [zj(d), r * KJ]),
    })),
    // Los dos anclajes hasta la viga.
    ...ANCLAJES_JSM.map((d, i): Pieza => ({ tipo: "varilla", id: `jsm-gancho-${x}-${i}`, acabado: "metal", desde: [x, lomo, zj(d)], hasta: [x, SOPORTE.abajo - 0.02, zj(d)], radio: 0.022 })),
  ];
};
const idsJsm = (x: number) => [
  `jsm-${x}`, `jsm-ventana-${x}`, `jsm-tobera-${x}`, `jsm-toma-${x}`, `jsm-toma-boca-${x}`, `jsm-ala-1-${x}`, `jsm-ala-2-${x}`,
  ...[0, 1, 2, 3].map((i) => `jsm-aleta-${x}-${i}`), `jsm-gancho-${x}-0`, `jsm-gancho-${x}-1`,
];
const MISILES = LADOS.flatMap((s) => JSM.xs.map((x) => s * x));

const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
// Torreta (B y C): la bola, de 0,54 m, colgada de un collar bajo el morro, con
// la ventana grande delante, tres pequeñas encima y la pegatina amarilla.
const TORRETA = { z: 5.68 };

// Antenas redondas del lomo (A y C): ocho, dos de ellas en pareja; la tercera
// es blanca (una luz).
const ANTENAS: { z: number; x: number; luz?: boolean }[] = [
  { z: -0.04, x: 0 }, { z: 0.24, x: 0 }, { z: 0.55, x: 0, luz: true }, { z: 0.94, x: 0.09 },
  { z: 1.54, x: 0 }, { z: 2.06, x: 0.095 }, { z: 2.42, x: 0 }, { z: 2.74, x: 0 },
];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-ga", secciones: CUERPO },
  // Final de la joroba: un capuchón de metal facetado (A, B y C) y el cono.
  // El capuchón de metal del final, encima del cuerpo: un escudo claro y
  // facetado (A: el borde de arriba recto en la junta con la chapa, z = −3,2,
  // y los lados que se juntan abajo, en punta), que cae hasta el buje. Debajo
  // y a los lados sigue el cuerpo pintado, que se cierra en el buje.
  { tipo: "casco", id: "cola-metal", acabado: "aluminio", secciones: [
    { z: -3.18, ancho: 0.19, arriba: 0.497, abajo: 0.3, cintura: 0.44, n: 3.5, nAbajo: 1.2 },
    { z: -3.32, ancho: 0.19, arriba: 0.465, abajo: 0.24, cintura: 0.4, n: 3.5, nAbajo: 1.2 },
    { z: -3.47, ancho: 0.16, arriba: 0.4, abajo: 0.2, cintura: 0.34, n: 3.2, nAbajo: 1.2 },
    { z: -3.6, ancho: 0.1, arriba: 0.325, abajo: 0.2, cintura: 0.29, n: 3, nAbajo: 1.2 },
  ] },
  { tipo: "tubo", id: "cono", acabado: "metal", centro: [0, 0.21], perfil: [[-3.57, 0.11], [-3.66, 0.1], [-3.78, 0.06], [-3.85, 0]] },
  { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0.21, -3.65], radio: 1.05, palas: 3, ancho: 0.2, buje: 0 },
  // Toma de aire, en el centro, en lo alto: el labio redondo de la boca, que
  // asoma un poco de la cara de la góndola, y el conducto oscuro y hondo
  // (C: una boca ovalada, negra, con el labio claro alrededor).
  { tipo: "tubo", id: "toma", acabado: "gris-ga", centro: [0, TOMA.y], seccion: [1, TOMA.alto], perfil: [
    [TOMA.z, 0.168 * TOMA.k], [TOMA.z + 0.01, 0.185 * TOMA.k], [TOMA.z + 0.002, 0.202 * TOMA.k], [TOMA.z - 0.03, 0.207 * TOMA.k], [TOMA.z - 0.1, 0.207 * TOMA.k],
  ] },
  // El conducto: paredes y fondo oscuros. El fondo, justo delante de la cara
  // de la góndola (un casco no tiene agujeros: detrás estaría su cara clara).
  { tipo: "tubo", id: "toma-conducto", acabado: "hueco", centro: [0, TOMA.y], seccion: [1, TOMA.alto], perfil: [[TOMA.z + 0.002, 0.17 * TOMA.k], [TOMA.z - 0.012, 0.17 * TOMA.k], [TOMA.z - 0.013, 0]] },
  // El tabique que parte la boca, vertical (C: una raya clara en el negro).
  { tipo: "placa", id: "toma-tabique", acabado: "gris-ga", plano: "vertical", x: 0, grosor: 0.025, bisel: 0.006, planta: [[TOMA.z - 0.004, TOMA.y + 0.083], [TOMA.z - 0.012, TOMA.y + 0.083], [TOMA.z - 0.012, TOMA.y - 0.083], [TOMA.z - 0.004, TOMA.y - 0.083]] },
  // Salida del escape: el conducto oscuro asoma por el corte inclinado de
  // la góndola (sus costados hacen de borde). Arriba sigue la línea del
  // corte unos milímetros por encima de la góndola; abajo acaba en la chapa.
  { tipo: "casco", id: "escape-conducto", acabado: "hueco", secciones: [
    // Más estrecho que la góndola y con los costados hundidos en ella: solo
    // asoma por el corte, nunca por los lados (es el fondo del hueco).
    { z: -2.29, ancho: 0.18, arriba: 0.905, abajo: 0.45, cintura: 0.5, n: 3 },
    { z: -2.36, ancho: 0.18, arriba: 0.84, abajo: 0.45, cintura: 0.5, n: 3 },
    { z: -2.45, ancho: 0.17, arriba: 0.75, abajo: 0.45, cintura: 0.5, n: 3 },
    { z: -2.53, ancho: 0.14, arriba: 0.665, abajo: 0.45, cintura: 0.5, n: 3 },
    { z: -2.575, ancho: 0, arriba: 0.63, abajo: 0.45, cintura: 0.5 },
  ] },  // En lo alto de la góndola (C), una ranura a lo largo y, delante, una
  // toma pequeña de refrigeración en cuña, mirando adelante.
  { tipo: "caja", id: "ranura-gondola", acabado: "hueco", centro: [0, 0.872, -1.11], tam: [0.035, 0.02, 0.2], redondeo: 0.012 },
  { tipo: "placa", id: "toma-gondola", acabado: "gris-ga", plano: "vertical", x: 0, grosor: 0.07, bisel: 0.015, planta: [[-0.72, 0.818], [-0.9, 0.84], [-0.9, 0.875]] },
  { tipo: "disco", id: "toma-gondola-boca", acabado: "hueco", en: [0, 0.855, -0.901], normal: [0, 0, -1], radio: 0.02, grosor: 0.004 },
  // La chapa de metal que sigue al escape hasta el capuchón (A: azulada, con
  // los bordes claros; desde arriba, en C, brilla). Apenas sale del cuerpo.
  { tipo: "casco", id: "chapa-escape", acabado: "metal", secciones: [
    { z: -2.58, ancho: 0.19, arriba: 0.62, abajo: 0.5, cintura: 0.6, n: 3 },
    { z: -2.9, ancho: 0.185, arriba: 0.584, abajo: 0.46, cintura: 0.565, n: 3 },
    { z: -3.19, ancho: 0.17, arriba: 0.5, abajo: 0.38, cintura: 0.48, n: 3 },
  ] },
  {
    // Media ala; pasa poco a poco a la cuerda de la bisagra donde van el flap
    // y el alerón.
    tipo: "ala", id: "ala", acabado: "gris-ga", y: ALA.y,
    estaciones: [
      [0, bordeAtaque(0), bordeSalida(0), ALA.tRaiz],
      [MANDO.flap[0] - 0.25, bordeAtaque(MANDO.flap[0] - 0.25), bordeSalida(MANDO.flap[0] - 0.25), grosorAla(MANDO.flap[0] - 0.25)],
      [MANDO.flap[0], bordeAtaque(MANDO.flap[0]), bisagra(MANDO.flap[0]), grosorAla(MANDO.flap[0])],
      [MANDO.aleron[1], bordeAtaque(MANDO.aleron[1]), bisagra(MANDO.aleron[1]), grosorAla(MANDO.aleron[1])],
      [MANDO.aleron[1] + 0.2, bordeAtaque(MANDO.aleron[1] + 0.2), bordeSalida(MANDO.aleron[1] + 0.2), grosorAla(MANDO.aleron[1] + 0.2)],
      [ALA.punta, bordeAtaque(ALA.punta), bordeSalida(ALA.punta), ALA.tPunta],
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "gris-ga", y: ALA.y, estaciones: [estMando(MANDO.flap[0] + MANDO.hueco), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris-ga", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1] - MANDO.hueco)] },
  ...CARENADOS.map((x): Pieza => ({
    tipo: "caja", id: `carenado-${x}`, acabado: "gris-ga", espejo: true, redondeo: 0.03,
    centro: [x, ALA.y + 0.035, bordeSalida(x) + 0.1], tam: [0.07, 0.06, 0.45],
  })),
  { tipo: "placa", id: "aletas", acabado: "gris-ga", plano: "vertical", x: ALA.punta - 0.02, grosor: 0.06, bisel: 0.02, espejo: true, planta: ALETA },
  { tipo: "ala", id: "cola", acabado: "gris-ga", y: COLA.y, estaciones: [estCola(0, -0.84, -1.82, 0.17), estCola(0.9, -1.09, -1.85, 0.14), estCola(2.96, -1.65, -1.88, 0.07)] },
  { tipo: "ala", id: "timones", acabado: "gris-ga", y: COLA.y, estaciones: [estCola(0.95, -1.86, -1.93, 0.03), estCola(1.72, -1.87, -2.16, 0.04), estCola(2.94, -1.89, -2.22, 0.03)] },
  {
    // Aleta ventral, medida en B y en A a la vez (las dos esquinas de abajo
    // triangulando): el borde de detrás vertical en z = −2,02 (la raíz, metida
    // en el cuerpo: con la panza nueva, más estrecha, quedaba separada), el de delante
    // en flecha, el fondo a 1,33 m bajo el eje. Detrás, el timón (pieza aparte,
    // con su hueco) y, a media altura, una barra que la cruza por los dos lados.
    tipo: "ala", id: "aleta-ventral", acabado: "gris-ga", vertical: true, y: -0.25,
    estaciones: [[0, -0.86, -1.72, 0.12], [1.08, -1.37, -1.79, 0.07]],
  },
  { tipo: "ala", id: "timon-ventral", acabado: "gris-ga", vertical: true, y: -0.25, estaciones: [[0, -1.735, -2.02, 0.05], [1.07, -1.805, -2.02, 0.03]] },
  {
    tipo: "placa", id: "aleta-ventral-barra", acabado: "gris-ga", plano: "horizontal", y: -0.79, grosor: 0.035, bisel: 0.015, simetrica: true,
    planta: [[0, -1.4], [0.075, -1.42], [0.085, -1.48], [0.085, -1.93], [0, -1.96]],
  },
  {
    // Antena de pala bajo el ala (B y C): un rectángulo de 0,6 m de largo
    // que baja hasta 1,24 m bajo el eje.
    tipo: "placa", id: "antena", acabado: "gris-ga", plano: "vertical", x: 0, grosor: 0.05, bisel: 0.015,
    planta: [[0.75, -0.45], [0.13, -0.45], [0.14, -1.26], [0.73, -1.21]],
  },
  // Antenas pequeñas: la pala de la panza bajo el morro y la aleta negra del
  // costado, delante (B).
  { tipo: "placa", id: "antena-morro", acabado: "gris-ga", plano: "vertical", x: 0, grosor: 0.02, bisel: 0.006, planta: [[4.4, -0.42], [4.3, -0.42], [4.33, -0.5], [4.37, -0.5]] },
  { tipo: "placa", id: "aleta-costado", acabado: "negro", plano: "horizontal", y: -0.2, grosor: 0.012, espejo: true, planta: [[0.6, 4.33], [0.6, 4.2], [0.68, 4.22]] },
  ...ANTENAS.flatMap(({ z, x, luz }, i): Pieza[] => [
    { tipo: "disco", id: `antena-lomo-${i}`, acabado: luz ? "blanco" : "gris", espejo: x > 0, en: [x, 0.49, z], normal: [0, 1, 0], radio: 0.05, grosor: 0.02 },
    { tipo: "disco", id: `antena-lomo-centro-${i}`, acabado: "junta", espejo: x > 0, en: [x, 0.502, z], normal: [0, 1, 0], radio: 0.018, grosor: 0.006 },
  ]),
  // Torreta y cámara de la punta del morro.
  // La torreta (render B y foto del usuario, de frente y a un lado): una
  // capucha como un plato, más ancha que la bola, pegada a la panza; debajo,
  // la bola de la cámara, más alta que ancha, con el fondo redondo y la cara
  // de delante plana. En la cara, la lente grande metida en un tubo corto con
  // un aro oscuro grueso; encima, a un lado, tres ventanas pequeñas (dos
  // juntas y una debajo) y en el costado la pegatina amarilla.
  // Capucha redonda en planta (radio 0,3 m), abombada por arriba y plana
  // por debajo.
  { tipo: "casco", id: "torreta-collar", acabado: "gris-ga", secciones: [-0.3, -0.27, -0.2, -0.1, 0, 0.1, 0.2, 0.27, 0.3].map((dz) => {
    const w = Math.sqrt(Math.max(0, 0.09 - dz * dz));
    return { z: TORRETA.z - 0.02 + dz, ancho: w, arriba: -0.3, abajo: -0.33 - 0.1 * (w / 0.3), cintura: -0.325 - 0.1 * (w / 0.3), nAbajo: 4 };
  }) },
  // La bola, casi esférica (0,5 m), algo más alta que ancha y con la cara de
  // delante plana.
  { tipo: "casco", id: "torreta", acabado: "gris-ga", secciones: [-0.25, -0.23, -0.18, -0.1, 0, 0.1, 0.17, 0.215].map((dz) => {
    const k = Math.sqrt(Math.max(0, 1 - (dz / 0.25) ** 2));
    return { z: TORRETA.z + dz, ancho: 0.245 * k, arriba: -0.42 - 0.12 * (1 - k), abajo: -0.66 - 0.25 * k, cintura: -0.63, n: 2.3, nAbajo: 2 };
  }) },
  // La horquilla que la deja girar en elevación (render B): un brazo a cada
  // lado, colgado de la capucha, con el eje redondo a media altura.
  { tipo: "placa", id: "torreta-horquilla", acabado: "gris-ga", plano: "vertical", x: 0.248, grosor: 0.024, bisel: 0.008, espejo: true,
    planta: [[TORRETA.z + 0.07, -0.43], [TORRETA.z - 0.12, -0.43], [TORRETA.z - 0.125, -0.64], [TORRETA.z - 0.1, -0.7], [TORRETA.z - 0.06, -0.73], [TORRETA.z - 0.02, -0.74], [TORRETA.z + 0.02, -0.73], [TORRETA.z + 0.055, -0.7], [TORRETA.z + 0.075, -0.64]] },
  { tipo: "disco", id: "torreta-eje", acabado: "gris-ga", espejo: true, en: [0.27, -0.635, TORRETA.z - 0.025], normal: [1, 0, 0], radio: 0.06, grosor: 0.016 },
  // La cara de delante, plana.
  { tipo: "disco", id: "torreta-cara", acabado: "gris-ga", en: [0, -0.64, TORRETA.z + 0.205], normal: [0, 0, 1], radio: 0.19, grosor: 0.03 },
  // La lente: tubo corto con el aro oscuro y el cristal metido.
  { tipo: "tubo", id: "torreta-marco", acabado: "negro", centro: [0.04, -0.67], perfil: [[TORRETA.z + 0.275, 0.095], [TORRETA.z + 0.28, 0.12], [TORRETA.z + 0.27, 0.135], [TORRETA.z + 0.18, 0.135]] },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: [0.04, -0.67, TORRETA.z + 0.266], normal: [0, 0, 1], radio: 0.095, grosor: 0.01 },
  ...([[-0.1, -0.5, 0.032], [-0.025, -0.49, 0.032], [-0.095, -0.565, 0.022]] as [number, number, number][]).map(([x, y, r], i): Pieza => ({
    tipo: "disco", id: `torreta-ventanilla-${i}`, acabado: "negro", en: [x, y, TORRETA.z + 0.222], normal: [0, 0, 1], radio: r, grosor: 0.012,
  })),
  { tipo: "caja", id: "torreta-pegatina", acabado: "amarillo", centro: [-0.262, -0.49, TORRETA.z - 0.025], tam: [0.012, 0.03, 0.08], redondeo: 0.01 },
  { tipo: "disco", id: "camara-morro-aro", acabado: "gris-ga", en: [0, -0.02, 6.69], normal: [0, 0, 1], radio: 0.05, grosor: 0.03 },
  { tipo: "disco", id: "camara-morro", acabado: "lente", en: [0, -0.02, 6.707], normal: [0, 0, 1], radio: 0.032, grosor: 0.01 },
  { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, 0.04, 6.6], hasta: [0, 0.12, 7.0], radio: 0.014 },
  // Soportes, vigas y misiles.
  ...LADOS.map((s): Pieza => ({
    tipo: "ala", id: `soporte-${s}`, acabado: "gris-ga", vertical: true, sola: true, x: s * SOPORTE.x, y: ALA.y - 0.08,
    estaciones: [[0, 2.45, 0.55, 0.13], [0.21, 2.35, 0.65, 0.12]],
  })),
  ...LADOS.map((s): Pieza => ({
    tipo: "caja", id: `viga-${s}`, acabado: "gris-ga", redondeo: 0.03,
    centro: [s * SOPORTE.x, SOPORTE.abajo + 0.02, 1.5], tam: [1.0, 0.06, 1.4],
  })),
  ...MISILES.flatMap(jsm),
];

const PARTES: Parte[] = [
  {
    nombre: "Morro sin joroba",
    en: [0, 0.6, 4.5],
    piezas: ["fuselaje", "camara-morro", "camara-morro-aro", "sonda", "antena-morro", "aleta-costado", ...ANTENAS.flatMap((_, i) => [`antena-lomo-${i}`, `antena-lomo-centro-${i}`])],
    respaldo: "fabricante",
    fuentes: ["arriba", "abajo", "twz"],
    texto: "Donde el Reaper tiene la joroba con la antena de satélite, el Wildfire tiene un morro liso: General Atomics dice que se controlará a través de constelaciones de satélites en órbita baja, del tipo de Starlink, con antenas más pequeñas.",
    nota: "Se ve en los renders de General Atomics; aún no hay fotos del dron real.",
  },
  {
    nombre: "Torreta de sensores",
    en: [0, -1.0, 5.68],
    piezas: ["torreta", "torreta-collar", "torreta-horquilla", "torreta-eje", "torreta-cara", "torreta-marco", "torreta-ventana", "torreta-ventanilla-0", "torreta-ventanilla-1", "torreta-ventanilla-2", "torreta-pegatina"],
    respaldo: "fabricante",
    fuentes: ["abajo", "arriba"],
    texto: "Una bola con cámaras bajo el morro, como la de los últimos Reaper. Qué sensores lleva no se ha publicado.",
  },
  {
    nombre: "Ala recta y larga",
    en: [8.0, 0.3, 1.2],
    piezas: ["ala", "flaps", "alerones", "aletas", ...CARENADOS.map((x) => `carenado-${x}`)],
    respaldo: "fabricante",
    fuentes: ["arriba", "abajo", "twz-agosto"],
    texto: "Unos 22 m de punta a punta, más que el Reaper, con aletas en flecha hacia arriba y hacia abajo en las puntas. General Atomics dice que podrá volar más de 8.000 millas náuticas (unos 14.800 km) de un tirón.",
    nota: "No hay medidas publicadas: la envergadura sale de los renders, a escala con los misiles.",
  },
  {
    nombre: "Cola en V",
    en: [2.0, 1.6, -1.9],
    piezas: ["cola", "timones", "aleta-ventral", "timon-ventral", "aleta-ventral-barra"],
    respaldo: "fabricante",
    fuentes: ["enjambre", "arriba", "abajo"],
    texto: "Dos superficies en V sobre la joroba del motor y una aleta por debajo, que protege la hélice al despegar y aterrizar.",
  },
  {
    nombre: "Antena de pala",
    en: [0, -1.4, 0.45],
    piezas: ["antena"],
    respaldo: "fabricante",
    fuentes: ["abajo", "twz"],
    texto: "Una antena grande en forma de pala bajo el ala.",
  },
  {
    nombre: "Toma de aire y escape",
    en: [0, 1.1, -1.4],
    piezas: ["toma", "toma-conducto", "toma-tabique", "escape-conducto", "chapa-escape", "ranura-gondola", "toma-gondola", "toma-gondola-boca"],
    respaldo: "fabricante",
    fuentes: ["arriba", "enjambre"],
    texto: "El motor va dentro de la góndola de encima del cuerpo, detrás del ala: respira por la boca de delante y suelta los gases por la salida de detrás, sobre una chapa de metal que aguanta el calor hasta la cola.",
    nota: "La boca se ve en el render desde arriba y la salida en el del enjambre, desde detrás; el motor no se ha dicho.",
  },
  {
    nombre: "Hélice propulsora",
    en: [0.6, 0.2, -3.9],
    piezas: ["helice", "cono", "cola-metal"],
    respaldo: "reconstruccion",
    fuentes: ["twz"],
    texto: "Una hélice que empuja desde el final del cuerpo, como en toda la familia del Predator y el Reaper. El motor no se ha dicho.",
    nota: "En los renders la hélice no se ve o sale borrosa: el número de palas y el tamaño son supuestos.",
  },
  {
    nombre: "Cuatro misiles JSM",
    en: [2.6, -0.9, 3.0],
    piezas: [...LADOS.flatMap((s) => [`soporte-${s}`, `viga-${s}`]), ...MISILES.flatMap(idsJsm)],
    respaldo: "fabricante",
    fuentes: ["abajo", "comunicado", "jsm-kongsberg", "jsm-farnborough"],
    texto: "Un soporte bajo cada ala con dos misiles de crucero JSM noruegos, antibuque y de ataque a tierra: 4 m y 416 kg, con la ventana del buscador infrarrojo en el morro, la toma de aire del motor en el costado, las alas plegadas encima hasta el lanzamiento y cuatro aletas de cola en X. General Atomics dice que puede llevar cuatro JSM o dos misiles antibuque LRASM.",
    nota: "La forma del misil sale de las maquetas a tamaño real de Kongsberg y de sus renders; cómo van colgados, del render de General Atomics.",
  },
];

// ── Costuras ───────────────────────────────────────────────────────────────
// Solo las que se distinguen en los renders: la tapa del costado, delante
// del ala (B, con su arista redondeada), y la junta de la chapa de metal del
// final de la joroba (A y C).
const LADO: [number, number, number] = [1, 0, 0];
// Del JSM: la ventana del buscador en la cara de abajo del morro (Farnborough
// y renders de Kongsberg: un trapecio oscuro, más ancho arriba) y la junta
// del radomo, a 0,82 m de la punta, alrededor del cuerpo.
const CALCAS: Calca[] = [];
const juntaJsm = (x: number, d: number): Costura[] => {
  const z = zj(d), w = 0.3 * KJ, y0 = JSM.y;
  return [
    { sobre: [`jsm-${x}`], desde: [1, 0, 0], puntos: [[x + w, y0 + w, z], [x + w, y0 - w, z]] },
    { sobre: [`jsm-${x}`], desde: [-1, 0, 0], puntos: [[x - w, y0 + w, z], [x - w, y0 - w, z]] },
    { sobre: [`jsm-${x}`], desde: [0, 1, 0], puntos: [[x - w, y0 + w, z], [x + w, y0 + w, z]] },
    { sobre: [`jsm-${x}`], desde: [0, -1, 0], puntos: [[x - w, y0 - w, z], [x + w, y0 - w, z]] },
  ];
};

const COSTURAS: Costura[] = [
  ...MISILES.flatMap((x) => [...juntaJsm(x, 0.82), ...juntaJsm(x, 3.42)]),
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.7, 0.1, 3.67], [0.7, 0.1, 3.88], [0.7, -0.1, 3.88], [0.7, -0.1, 3.67], [0.7, 0.1, 3.67]] },
  // La junta de la chapa del escape con el capuchón.
  { sobre: ["cola-metal"], desde: [0, 1, 0], puntos: [[-0.18, 0.8, -3.2], [0.18, 0.8, -3.2]] },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "hombro", "lomo"] as const;
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, ...(p.x !== undefined && { x: u(p.x) }), secciones: p.secciones.map((q) => ({ ...q, ...Object.fromEntries(LARGOS_SECCION.filter((k) => q[k] !== undefined).map((k) => [k, u(q[k] as number)])) })) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
  }
};

const maqueta: Maqueta = {
  nombre: "Wildfire",
  subtitulo: "Dron armado de media altitud y gran autonomía",
  escala: ESCALA,  // 1 unidad = 7,8 m; medidas sacadas de los renders, a escala con los JSM
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  // Tarjeta de /uas con el ángulo del TB2: con el de todas, casi de lado, la
  // mitad cercana de la V salía negra.
  vistaTarjeta: [61, 20],
  detalles: { calcas: CALCAS.map((k) => ({ ...k, en: u3(k.en), tam: u2(k.tam) })), costuras: COSTURAS.map((k) => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) })) },
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "abajo", imagen: "gaasi-abajo.jpg", titulo: "Desde abajo, con cuatro misiles JSM", medio: "General Atomics", url: GA },
    { id: "arriba", imagen: "gaasi-arriba.jpg", titulo: "Desde arriba, lanzando un misil LRASM", medio: "General Atomics", url: GA },
    { id: "enjambre", imagen: "gaasi-enjambre.jpg", titulo: "Un enjambre de Wildfire sobre el mar", medio: "General Atomics", url: GA },
    { id: "comunicado", titulo: "GA-ASI Unveils Wildfire UAS for Military, Civil and Commercial Roles", medio: "General Atomics", url: COMUNICADO },
    { id: "jsm-kongsberg", titulo: "Joint Strike Missile (JSM)", medio: "Kongsberg", url: "https://www.kongsberg.com/what-we-do/defence-and-security/missile-systems/joint-strike-missile-jsm/" },
    { id: "jsm-farnborough", titulo: "La maqueta del JSM a tamaño real", medio: "Army Recognition", url: "https://www.armyrecognition.com/military-products/army/missiles/cruise-missiles/jsm-joint-strike-missile" },
    { id: "twz", titulo: "First Look At General Atomics' Wildfire, Its Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ },
    { id: "twz-agosto", titulo: "Wildfire Is General Atomics' Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ_AGOSTO },
  ],
};

export default maqueta;
