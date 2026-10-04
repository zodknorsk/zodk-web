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
import type { Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
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
// [z, medio ancho, lomo, panza, cintura]. La arista viva del costado (la
// cintura), cortando la vista en B con la vista en C: 0,69 m de medio ancho y
// y = 0,15 en z = 2,7, y se cierra en un morro romo alrededor de la cámara
// de la punta (z = 6,66). El lomo, a 0,47–0,49 (las antenas del lomo, en A y
// en C); la panza, donde nacen la antena de pala y la aleta ventral (B).
// Detrás del ala sube la joroba del motor hasta la boca del escape (0,77 m en
// z = −2,4) y sigue gruesa hasta el final (en los tres renders acaba de
// golpe, con unos 0,7 m de alto), donde la tapa un capuchón facetado.
// En el morro la arista se marca más y la cara de abajo es más plana (una
// cuchara, con la cámara de la punta metida en la arista; B).
const sec = ([z, ancho, arriba, abajo, cintura]: number[]): Seccion => ({ z, ancho, arriba, abajo, cintura, n: 2.3, nAbajo: z > 5 ? 3.2 : 2.4, arista: z > 5 ? 0.6 : 0.4 });
const CUERPO: Seccion[] = [
  [6.7, 0, -0.01, -0.05, -0.03],
  [6.65, 0.18, 0.08, -0.15, -0.03],
  [6.55, 0.3, 0.17, -0.24, -0.03],
  [6.4, 0.4, 0.26, -0.3, -0.03],
  [6.2, 0.485, 0.34, -0.33, -0.03],
  [6.0, 0.53, 0.39, -0.35, -0.025],
  [5.77, 0.545, 0.43, -0.34, -0.022],
  [5.16, 0.56, 0.47, -0.37, 0.018],
  [4.5, 0.58, 0.49, -0.41, 0.057],
  [4.0, 0.62, 0.49, -0.44, 0.094],
  [3.35, 0.66, 0.49, -0.47, 0.128],
  [2.7, 0.69, 0.49, -0.5, 0.15],
  [1.5, 0.7, 0.48, -0.52, 0.18],
  [0.5, 0.69, 0.47, -0.51, 0.2],
  [-0.4, 0.65, 0.49, -0.49, 0.22],
  [-1.2, 0.58, 0.6, -0.45, 0.24],
  [-1.9, 0.52, 0.72, -0.37, 0.26],
  [-2.4, 0.47, 0.77, -0.3, 0.27],
  [-2.9, 0.43, 0.64, -0.25, 0.24],
  [-3.25, 0.37, 0.52, -0.17, 0.2],
  [-3.45, 0.32, 0.46, -0.1, 0.18],
].map(sec);

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
// el de fuera a 2,27; el eje a 0,55 m bajo el ala; 3,70 m de largo, de
// z = 3,38 a −0,32. Como salen en el render: delante, una boca trapezoidal
// con labio; detrás de ella un cuello y el cuerpo, más ancho que alto, como
// una canoa; la cola, redonda, con cuatro aletas en X. Cuelgan de una viga
// bajo un soporte con perfil, entre los dos.
const JSM = { y: -0.555, xs: [1.37, 2.27], delante: 3.38, detras: -0.32 };
const SOPORTE = { x: (JSM.xs[0] + JSM.xs[1]) / 2, abajo: -0.29 };
const LADOS = [1, -1];
// Sección del JSM a esa z (medidas desde su eje): casi cuadrada, más ancha
// que alta, con la arista abajo; la boca, un trapecio (más estrecha abajo).
const secJsm = (z: number, ancho: number, arriba: number, abajo: number, panza = ancho * 0.85): Seccion =>
  ({ z, ancho, arriba: JSM.y + arriba, abajo: JSM.y + abajo, cintura: JSM.y - 0.02, n: 3, nAbajo: 2.6, arista: 0.25, panza });
const jsm = (x: number): Pieza[] => [
  {
    tipo: "casco", id: `jsm-${x}`, acabado: "gris-ga", x, abierto: true,
    secciones: [
      secJsm(JSM.delante, 0.165, 0.12, -0.11, 0.1), secJsm(JSM.delante - 0.035, 0.19, 0.14, -0.13, 0.12), secJsm(JSM.delante - 0.22, 0.185, 0.13, -0.12, 0.12),
      secJsm(2.6, 0.27, 0.19, -0.18), secJsm(2.0, 0.29, 0.21, -0.2), secJsm(0.6, 0.29, 0.21, -0.2), secJsm(0.2, 0.26, 0.19, -0.18),
      secJsm(-0.05, 0.2, 0.15, -0.14), secJsm(-0.22, 0.12, 0.09, -0.085), secJsm(JSM.detras, 0, 0.01, -0.01),
    ],
  },
  // Fondo oscuro de la boca.
  { tipo: "casco", id: `jsm-boca-${x}`, acabado: "hueco", x, secciones: [secJsm(JSM.delante - 0.02, 0.15, 0.105, -0.095, 0.09), secJsm(JSM.delante - 0.2, 0.15, 0.105, -0.095, 0.09)] },
  ...[45, -45, 135, -135].map((inclinacion, i): Pieza => ({
    tipo: "placa", id: `jsm-aleta-${x}-${i}`, acabado: "gris-ga", plano: "vertical", x, y: JSM.y, grosor: 0.02, inclinacion,
    planta: [[0.2, 0.17], [-0.18, 0.17], [-0.24, 0.32], [-0.04, 0.32]],
  })),
  // Los dos ganchos que lo cuelgan de la viga.
  ...[2.1, 0.9].map((z, i): Pieza => ({ tipo: "varilla", id: `jsm-gancho-${x}-${i}`, acabado: "metal", desde: [x, JSM.y + 0.2, z], hasta: [x, SOPORTE.abajo - 0.02, z], radio: 0.025 })),
];
const idsJsm = (x: number) => [`jsm-${x}`, `jsm-boca-${x}`, ...[0, 1, 2, 3].map((i) => `jsm-aleta-${x}-${i}`), `jsm-gancho-${x}-0`, `jsm-gancho-${x}-1`];

const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
// Torreta (B y C): la bola, de 0,54 m, colgada de un collar bajo el morro, con
// la ventana grande delante, tres pequeñas encima y la pegatina amarilla.
const TORRETA = { y: -0.63, z: 5.68, r: 0.27 };

// Antenas redondas del lomo (A y C): ocho, dos de ellas en pareja; la tercera
// es blanca (una luz).
const ANTENAS: { z: number; x: number; luz?: boolean }[] = [
  { z: -0.04, x: 0 }, { z: 0.24, x: 0 }, { z: 0.55, x: 0, luz: true }, { z: 0.94, x: 0.09 },
  { z: 1.54, x: 0 }, { z: 2.06, x: 0.095 }, { z: 2.42, x: 0 }, { z: 2.74, x: 0 },
];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-ga", secciones: CUERPO },
  // Final de la joroba: un capuchón de metal facetado (A, B y C) y el cono.
  { tipo: "casco", id: "cola-metal", acabado: "metal", secciones: [
    { z: -3.43, ancho: 0.31, arriba: 0.45, abajo: -0.09, cintura: 0.18, n: 1.5, nAbajo: 1.5 },
    { z: -3.72, ancho: 0.17, arriba: 0.31, abajo: 0.03, cintura: 0.17, n: 1.5, nAbajo: 1.5 },
  ] },
  { tipo: "tubo", id: "cono", acabado: "metal", centro: [0, 0.17], perfil: [[-3.7, 0.12], [-3.8, 0.11], [-3.92, 0.07], [-4.0, 0]] },
  { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0.17, -3.78], radio: 1.05, palas: 3, ancho: 0.2, buje: 0 },
  // Escape en lo alto de la joroba, abierto hacia atrás (A), y la chapa de
  // metal que lo sigue hasta la cola.
  { tipo: "disco", id: "escape", acabado: "hueco", en: [0, 0.71, -2.5], normal: [0, 0.55, -1], radio: 0.17, grosor: 0.02 },
  // Toma de aire en el costado izquierdo, bajo la raíz de la V (C; en el otro
  // lado, que C ve de frente, no hay).
  { tipo: "tubo", id: "toma", acabado: "gris-ga", centro: [0.5, 0.26], perfil: [[-1.28, 0.075], [-1.3, 0.1], [-1.36, 0.11], [-1.6, 0.1], [-1.85, 0.05], [-1.95, 0]] },
  { tipo: "disco", id: "toma-boca", acabado: "hueco", en: [0.5, 0.26, -1.279], normal: [0, 0, 1], radio: 0.07, grosor: 0.005 },
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
    // Aleta ventral (B): el borde de detrás vertical, el de delante en flecha,
    // el fondo a 1,33 m bajo el eje.
    tipo: "ala", id: "aleta-ventral", acabado: "gris-ga", vertical: true, y: -0.43,
    estaciones: [[0, -0.85, -1.98, 0.12], [0.9, -1.34, -1.97, 0.07]],
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
  // La capucha de la torreta, abombada y algo más ancha que la bola (B).
  { tipo: "casco", id: "torreta-collar", acabado: "gris-ga", secciones: [
    { z: TORRETA.z - 0.3, ancho: 0, arriba: -0.33, abajo: -0.36 },
    { z: TORRETA.z - 0.22, ancho: 0.17, arriba: -0.3, abajo: -0.4, cintura: -0.39 },
    { z: TORRETA.z + 0.02, ancho: 0.26, arriba: -0.3, abajo: -0.42, cintura: -0.41 },
    { z: TORRETA.z + 0.16, ancho: 0.22, arriba: -0.31, abajo: -0.41, cintura: -0.4 },
    { z: TORRETA.z + 0.24, ancho: 0, arriba: -0.33, abajo: -0.38 },
  ] },
  { tipo: "tubo", id: "torreta", acabado: "gris-ga", centro: [0, TORRETA.y], perfil: esfera(TORRETA.z, TORRETA.r) },
  // La cara de delante: una placa casi cuadrada y oscura con la ventana grande.
  { tipo: "caja", id: "torreta-marco", acabado: "negro", centro: [0, TORRETA.y - 0.04, TORRETA.z + 0.215], tam: [0.26, 0.26, 0.08], redondeo: 0.06 },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: [0, TORRETA.y - 0.07, TORRETA.z + 0.258], normal: [0, 0, 1], radio: 0.07, grosor: 0.01 },
  ...([[-0.07, -0.44, 5.86], [0.02, -0.43, 5.87], [-0.03, -0.49, 5.89]] as [number, number, number][]).map((en, i): Pieza => ({
    tipo: "disco", id: `torreta-ventanilla-${i}`, acabado: "lente", en, normal: [0, 0.3, 1], radio: 0.03, grosor: 0.01,
  })),
  { tipo: "caja", id: "torreta-pegatina", acabado: "amarillo", centro: [-0.25, -0.55, 5.66], tam: [0.01, 0.05, 0.08] },
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
  ...LADOS.flatMap((s) => JSM.xs.flatMap((x) => jsm(s * x))),
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
    piezas: ["torreta", "torreta-collar", "torreta-marco", "torreta-ventana", "torreta-ventanilla-0", "torreta-ventanilla-1", "torreta-ventanilla-2", "torreta-pegatina"],
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
    piezas: ["cola", "timones", "aleta-ventral"],
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
    nombre: "Hélice propulsora",
    en: [0.6, 0.2, -3.9],
    piezas: ["helice", "cono", "cola-metal", "escape", "toma", "toma-boca"],
    respaldo: "reconstruccion",
    fuentes: ["twz"],
    texto: "Una hélice que empuja desde el final del cuerpo, como en toda la familia del Predator y el Reaper. El motor no se ha dicho.",
    nota: "En los renders la hélice no se ve o sale borrosa: el número de palas y el tamaño son supuestos.",
  },
  {
    nombre: "Cuatro misiles JSM",
    en: [2.6, -0.9, 3.0],
    piezas: LADOS.flatMap((s) => [`soporte-${s}`, `viga-${s}`, ...JSM.xs.flatMap((x) => idsJsm(s * x))]),
    respaldo: "fabricante",
    fuentes: ["abajo", "comunicado"],
    texto: "Un soporte bajo cada ala con dos misiles de crucero JSM, antibuque y de ataque a tierra, de 3,7 m. General Atomics dice que puede llevar cuatro JSM o dos misiles antibuque LRASM.",
  },
];

// ── Costuras ───────────────────────────────────────────────────────────────
// Solo las que se distinguen en los renders: la tapa del costado, delante
// del ala (B, con su arista redondeada), y la junta de la chapa de metal del
// final de la joroba (A y C).
const LADO: [number, number, number] = [1, 0, 0];
const COSTURAS: Costura[] = [
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.7, 0.1, 3.67], [0.7, 0.1, 3.88], [0.7, -0.1, 3.88], [0.7, -0.1, 3.67], [0.7, 0.1, 3.67]] },
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.6, 0.6, -2.9], [0.6, -0.2, -2.9]] },
  { sobre: ["fuselaje"], desde: [0, 1, 0], puntos: [[-0.4, 0.8, -2.9], [0.4, 0.8, -2.9]] },
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
  detalles: { calcas: [], costuras: COSTURAS.map((k) => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) })) },
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "abajo", imagen: "gaasi-abajo.jpg", titulo: "Desde abajo, con cuatro misiles JSM", medio: "General Atomics", url: GA },
    { id: "arriba", imagen: "gaasi-arriba.jpg", titulo: "Desde arriba, lanzando un misil LRASM", medio: "General Atomics", url: GA },
    { id: "enjambre", imagen: "gaasi-enjambre.jpg", titulo: "Un enjambre de Wildfire sobre el mar", medio: "General Atomics", url: GA },
    { id: "comunicado", titulo: "GA-ASI Unveils Wildfire UAS for Military, Civil and Commercial Roles", medio: "General Atomics", url: COMUNICADO },
    { id: "twz", titulo: "First Look At General Atomics' Wildfire, Its Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ },
    { id: "twz-agosto", titulo: "Wildfire Is General Atomics' Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ_AGOSTO },
  ],
};

export default maqueta;
