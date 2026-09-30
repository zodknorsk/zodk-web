// Maqueta del MQ-9A Reaper de General Atomics, con la carga que sale en
// casi todas las fotos: cuatro misiles Hellfire y dos bombas GBU-12.
// Medidas de la ficha de la Fuerza Aérea de EE. UU. (20,1 m de envergadura,
// 11 m de largo, 3,8 m de alto); la forma de cada pieza, de fotos de la
// Fuerza Aérea y de la RAF (la de perfil en vuelo, casi sin perspectiva, da
// el contorno; las de frente con teleobjetivo, dónde van los soportes).
// Todo se escribe en metros y al final se pasa a unidades de la maqueta, a
// la misma escala que el Wildfire (1 unidad = 7,8 m). Imágenes a tamaño
// completo en arte/uas-fuentes/mq-9-reaper/ (fuera de Git; enlaces en
// docs/uas.md).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 7.8;

const FICHA = "https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS98707/pdf/GOVPUB-D301-PURL-LPS98707.pdf";
const GA = "https://www.ga-asi.com/remotely-piloted-aircraft/mq-9a";
const ASF = "https://www.airandspaceforces.com/weapons/mq-9/";
const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Ala recta y larga: altura, punta, bordes y grosor en la raíz y en la punta.
// Cruza el fuselaje a media altura, a unos 5 m del morro.
const ALA = { y: 0.06, punta: 10.05, baRaiz: 0.45, bsRaiz: -1.15, baPunta: 0.07, bsPunta: -0.88, tRaiz: 0.32, tPunta: 0.16 };
const enAla = (raiz: number, punta: number) => (x: number) => raiz + ((punta - raiz) * x) / ALA.punta;
const bordeAtaque = enAla(ALA.baRaiz, ALA.baPunta);
const bordeSalida = enAla(ALA.bsRaiz, ALA.bsPunta);
const grosorAla = enAla(ALA.tRaiz, ALA.tPunta);

// Superficies de mando del ala, piezas aparte con su hueco (fotos de cerca):
// flaps por dentro y alerones por fuera, de un cuarto de la cuerda.
const MANDO = { cuerda: 0.24, hueco: 0.02, flap: [0.75, 4.5], aleron: [4.56, 9.55] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda * (bordeAtaque(x) - bordeSalida(x));
const estMando = (x: number): [number, number, number, number] => [x, bisagra(x) - MANDO.hueco, bordeSalida(x), grosorAla(x) * 0.3];

// Dos soportes bajo cada ala (foto de frente con teleobjetivo): el de dentro
// con una GBU-12 y el de fuera con dos Hellfire.
const SOPORTE = { dentro: 1.3, fuera: 2.25 };
const GBU = { y: -0.5 };
const HELLFIRE = { y: -0.66, xs: [SOPORTE.fuera - 0.19, SOPORTE.fuera + 0.19] };
// Los tubos no se reflejan solos: cada arma se monta en los dos lados.
const LADOS = [1, -1];

// Suelo, bajo las ruedas: con él, 3,8 m de alto hasta la punta de la cola.
const SUELO = -1.62;
// Patas del tren: dónde empiezan y acaban, y un punto a lo largo de ellas
// (f de 0 a 1), desplazado `dz` hacia el morro.
const PATA = { arriba: [0.62, -0.2, -0.3] as [number, number, number], abajo: [1.7, SUELO + 0.23, -0.05] as [number, number, number] };
const enPata = (f: number, dz = 0): [number, number, number] =>
  [PATA.arriba[0] + (PATA.abajo[0] - PATA.arriba[0]) * f, PATA.arriba[1] + (PATA.abajo[1] - PATA.arriba[1]) * f, PATA.arriba[2] + (PATA.abajo[2] - PATA.arriba[2]) * f + dz];
const NARIZ_TREN = { arriba: [0, -0.45, 2.35] as [number, number, number], abajo: [0, -1.25, 2.87] as [number, number, number] };
const enPataMorro = (f: number, dz = 0): [number, number, number] =>
  [0, NARIZ_TREN.arriba[1] + (NARIZ_TREN.abajo[1] - NARIZ_TREN.arriba[1]) * f, NARIZ_TREN.arriba[2] + (NARIZ_TREN.abajo[2] - NARIZ_TREN.arriba[2]) * f + dz];

// Cuatro aletas en X alrededor del eje de un misil o una bomba: el contorno
// va en [z, distancia al eje].
const aletasX = (id: string, x: number, y: number, contorno: [number, number][], acabado: Pieza["acabado"]): Pieza[] =>
  [45, -45, 135, -135].map((inclinacion, i) => ({
    tipo: "placa", id: `${id}-${i}`, acabado, plano: "vertical", x, y, grosor: 0.014, inclinacion, planta: contorno,
  }));

// GBU-12: bomba de 227 kg (Mk 82) con la cabeza láser Paveway II delante
// (con cuatro aletas pequeñas) y cuatro alas plegables detrás.
const gbu = (x: number): Pieza[] => [
  {
    tipo: "tubo", id: `gbu-cabeza-${x}`, acabado: "gris", centro: [x, GBU.y],
    perfil: [[1.92, 0], [1.9, 0.045], [1.86, 0.07], [1.8, 0.085], [1.72, 0.09], [1.36, 0.09], [1.3, 0.1], [1.3, 0]],
  },
  { tipo: "disco", id: `gbu-ojo-${x}`, acabado: "lente", en: [x, GBU.y, 1.915], normal: [0, 0, 1], radio: 0.03, grosor: 0.01 },
  {
    tipo: "tubo", id: `gbu-cuerpo-${x}`, acabado: "oliva", centro: [x, GBU.y],
    perfil: [[1.32, 0], [1.32, 0.1], [1.2, 0.116], [1.0, 0.132], [0.8, 0.137], [-0.55, 0.137], [-0.8, 0.125], [-0.95, 0.105], [-0.95, 0]],
  },
  {
    tipo: "tubo", id: `gbu-cola-${x}`, acabado: "gris", centro: [x, GBU.y],
    perfil: [[-0.9, 0], [-0.9, 0.1], [-1.1, 0.1], [-1.36, 0.088], [-1.43, 0.06], [-1.43, 0]],
  },
  ...aletasX(`gbu-canard-${x}`, x, GBU.y, [[1.74, 0.08], [1.52, 0.08], [1.56, 0.19], [1.68, 0.19]], "gris"),
  ...aletasX(`gbu-ala-${x}`, x, GBU.y, [[-0.96, 0.08], [-1.42, 0.08], [-1.42, 0.37], [-1.28, 0.37]], "gris"),
];
const PIEZAS_GBU = LADOS.flatMap((s) => gbu(s * SOPORTE.dentro));

// Hellfire: 1,63 m, con el buscador redondo delante, la franja amarilla de
// la carga explosiva y dos juegos de aletas en X. Van de dos en dos, colgados
// de un lanzador bajo el soporte de fuera.
const hellfire = (x: number): Pieza[] => [
  {
    tipo: "tubo", id: `hellfire-${x}`, acabado: "negro", centro: [x, HELLFIRE.y],
    perfil: [[0.8, 0], [0.795, 0.035], [0.78, 0.06], [0.75, 0.08], [0.71, 0.089], [-0.8, 0.089], [-0.83, 0.075], [-0.83, 0]],
  },
  {
    tipo: "tubo", id: `hellfire-franja-${x}`, acabado: "amarillo", centro: [x, HELLFIRE.y],
    perfil: [[0.47, 0], [0.47, 0.092], [0.41, 0.092], [0.41, 0]],
  },
  ...aletasX(`hellfire-alas-${x}`, x, HELLFIRE.y, [[0.26, 0.08], [-0.04, 0.08], [0.0, 0.16], [0.13, 0.16]], "negro"),
  ...aletasX(`hellfire-timones-${x}`, x, HELLFIRE.y, [[-0.63, 0.08], [-0.82, 0.08], [-0.82, 0.17], [-0.71, 0.17]], "negro"),
];
const idsHellfire = (x: number) => [
  `hellfire-${x}`, `hellfire-franja-${x}`,
  ...[0, 1, 2, 3].flatMap((i) => [`hellfire-alas-${x}-${i}`, `hellfire-timones-${x}-${i}`]),
];

// Soportes bajo el ala: casi tan largos como la cuerda y con perfil.
const soporte = (id: string, x: number): Pieza => ({
  // Con perfil, como una aleta que cuelga del ala (en la 1.0, una caja).
  tipo: "ala", id, acabado: "gris", vertical: true, espejo: true, x, y: 0.02,
  estaciones: [[0, bordeAtaque(x) - 0.02, bordeAtaque(x) - 0.84, 0.14], [0.34, bordeAtaque(x) - 0.06, bordeAtaque(x) - 0.84, 0.13]],
});

// Carenados de los mandos del ala: bultos alargados bajo el borde de salida,
// cuatro por ala (foto desde abajo).
const CARENADOS = [3.0, 5.0, 6.6, 8.3];
const carenado = (x: number): Pieza => ({
  tipo: "caja", id: `carenado-${x}`, acabado: "gris", espejo: true, redondeo: 0.03,
  centro: [x, 0.03, bordeSalida(x) + 0.14], tam: [0.09, 0.1, 0.5],
});

// Cola en V: contorno en su plano, [z, distancia a lo largo de la
// superficie], de la raíz (dentro del fuselaje) a la punta.
const COLA = { largo: 3.95, baRaiz: -2.9, bsRaiz: -3.9, baPunta: -4.04, bsPunta: -4.67, angulo: (30 * Math.PI) / 180 };
const bordeSalidaCola = (d: number) => COLA.bsRaiz + ((COLA.bsPunta - COLA.bsRaiz) * d) / COLA.largo;
const bordeAtaqueCola = (d: number) => COLA.baRaiz + ((COLA.baPunta - COLA.baRaiz) * d) / COLA.largo;
// Estación de la cola a d metros de la raíz, a lo largo de la superficie en V;
// con `timon`, el borde de salida adelantado hasta la bisagra del timón.
const TIMON = { cuerda: 0.3, desde: 0.5, hasta: 3.75 };
const bisagraCola = (d: number) => bordeSalidaCola(d) + TIMON.cuerda * (bordeAtaqueCola(d) - bordeSalidaCola(d));
const grosorCola = (d: number) => 0.13 + ((0.07 - 0.13) * d) / COLA.largo;
const estCola = (d: number, timon = false): [number, number, number, number, number] =>
  [d * Math.cos(COLA.angulo), bordeAtaqueCola(d), timon ? bisagraCola(d) : bordeSalidaCola(d), grosorCola(d), d * Math.sin(COLA.angulo)];
const estTimon = (d: number): [number, number, number, number, number] =>
  [d * Math.cos(COLA.angulo), bisagraCola(d) - 0.02, bordeSalidaCola(d), grosorCola(d) * 0.35, d * Math.sin(COLA.angulo)];
// Carenados de los mandos de la cola: la misma superficie, más gruesa en una
// franja corta junto al borde de salida (fotos de perfil).
const carenadoCola = (d: number): Pieza => ({
  tipo: "placa", id: `carenado-cola-${d}`, acabado: "gris", plano: "vertical", x: 0, grosor: 0.17,
  espejo: true, inclinacion: 60, bisel: 0.04,
  planta: [[bordeSalidaCola(d) + 0.45, d], [bordeSalidaCola(d) - 0.05, d], [bordeSalidaCola(d + 0.09) - 0.05, d + 0.09], [bordeSalidaCola(d + 0.09) + 0.45, d + 0.09]],
});
const CARENADOS_COLA = [1.6, 2.9];

// Bola de la torreta de sensores, como un torno de media circunferencia.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
const TORRETA = { y: -0.64, z: 4.41, r: 0.26 };

// Secciones del cuerpo: [z, medio ancho, lomo, panza, cintura], en metros.
// Arriba, una superelipse de n = 2,8 (la joroba vista de frente). Abajo, la
// arista viva que se ve en todas las fotos: el costado de arriba llega a la
// cintura ya inclinado hacia arriba (recoge el sol) y ahí se quiebra hacia
// dentro en una cara empinada que mira abajo (en sombra) hasta una panza plana
// de casi todo el ancho (la cara baja unos 15° desde la vertical), con las esquinas bien redondeadas (foto de frente
// de Kandahar). La señaló el
// usuario: en la primera versión el paso era redondeado y no se veía.
const sec = ([z, ancho, arriba, abajo, cintura]: number[]): Seccion => ({ z, ancho, arriba, abajo, cintura, n: 2.6, arista: 0.45, panza: ancho * 0.87 });
const MORRO: Seccion[] = [
  [5.505, 0, 0, 0, 0],
  [5.45, 0.13, 0.091, -0.105, -0.02],
  [5.33, 0.24, 0.217, -0.228, -0.04],
  [5.2, 0.32, 0.318, -0.296, -0.06],
  [5.0, 0.42, 0.497, -0.363, -0.1],
  [4.75, 0.49, 0.657, -0.4, -0.12],
  [4.5, 0.53, 0.766, -0.417, -0.13],
  [4.25, 0.555, 0.833, -0.429, -0.135],
  [4.0, 0.565, 0.871, -0.438, -0.135],
  [3.75, 0.57, 0.865, -0.445, -0.14],
  [3.5, 0.572, 0.826, -0.451, -0.14],
  [3.25, 0.574, 0.762, -0.461, -0.14],
  [3.0, 0.575, 0.679, -0.468, -0.145],
  [2.75, 0.575, 0.603, -0.478, -0.145],
  [2.5, 0.574, 0.528, -0.488, -0.15],
  [2.2, 0.572, 0.458, -0.5, -0.15],
].map(sec);
const CUERPO: Seccion[] = [
  [2.2, 0.572, 0.458, -0.5, -0.15],
  [1.5, 0.566, 0.43, -0.524, -0.15],
  [1.0, 0.56, 0.408, -0.532, -0.145],
  [0, 0.54, 0.386, -0.53, -0.13],
  [-1, 0.52, 0.353, -0.52, -0.12],
  [-2.2, 0.48, 0.31, -0.51, -0.1],
  [-3.3, 0.44, 0.315, -0.5, -0.08],
  [-4.1, 0.4, 0.335, -0.47, -0.05],
  [-4.6, 0.37, 0.33, -0.39, -0.03],
  [-5.08, 0.3, 0.3, -0.3, 0],
].map(sec);

const PIEZAS: Pieza[] = [
  // Cuerpo en dos cascos seguidos: el morro con la joroba del satélite y, desde
  // detrás de la joroba, el resto hasta la hélice. Secciones medidas en el
  // perfil del «CH» 152 al despegar (foto nivelada con la punta del morro y
  // la del cono a la misma altura; 426,7 px/m) y en la de frente con
  // teleobjetivo de Kandahar (ancho y forma de la sección). Arriba, la joroba
  // es una superelipse algo cuadrada; abajo, la panza es casi plana. La arista
  // del costado (cintura) va algo por debajo del eje.
  { tipo: "casco", id: "morro", acabado: "gris", secciones: MORRO },
  { tipo: "casco", id: "fuselaje", acabado: "gris", secciones: CUERPO },
  // Sonda y cámara de vuelo en la punta del morro.
  { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, 0.08, 5.42], hasta: [0, 0.09, 6.0], radio: 0.013 },
  { tipo: "disco", id: "camara-morro", acabado: "lente", en: [0, -0.02, 5.49], normal: [0, 0, 1], radio: 0.045, grosor: 0.02 },
  // Torreta de sensores bajo el morro: una bola con una ventana grande
  // delante y otra pequeña al lado, colgada de un collar.
  { tipo: "disco", id: "torreta-collar", acabado: "gris", en: [0, -0.45, TORRETA.z], normal: [0, 1, 0], radio: 0.2, grosor: 0.07 },
  { tipo: "tubo", id: "torreta", acabado: "gris", centro: [0, TORRETA.y], perfil: esfera(TORRETA.z, TORRETA.r) },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: [0, TORRETA.y, TORRETA.z + TORRETA.r - 0.01], normal: [0, 0, 1], radio: 0.14, grosor: 0.02 },
  { tipo: "disco", id: "torreta-ventana-2", acabado: "lente", en: [0.13, TORRETA.y + 0.1, TORRETA.z + 0.17], normal: [0.5, 0.3, 1], radio: 0.045, grosor: 0.015 },
  // Antenas del lomo, detrás de la joroba: una cúpula pequeña y una en T.
  { tipo: "varilla", id: "cupula-pie", acabado: "gris", desde: [0, 0.4, 2.07], hasta: [0, 0.56, 2.07], radio: 0.07 },
  { tipo: "disco", id: "cupula", acabado: "gris", en: [0, 0.6, 2.07], normal: [0, 1, 0], radio: 0.2, grosor: 0.08 },
  { tipo: "disco", id: "cupula-tapa", acabado: "gris", en: [0, 0.66, 2.07], normal: [0, 1, 0], radio: 0.13, grosor: 0.05 },
  {
    tipo: "placa", id: "antena-t", acabado: "gris", plano: "vertical", x: 0, grosor: 0.04, bisel: 0.012,
    planta: [[1.85, 0.4], [1.62, 0.4], [1.5, 0.86], [1.64, 0.86]],
  },
  { tipo: "varilla", id: "antena-t-barra", acabado: "gris", desde: [0, 0.87, 1.7], hasta: [0, 0.87, 0.98], radio: 0.022 },
  // Antena en forma de gota bajo la panza, delante de la pata del morro.
  { tipo: "varilla", id: "gota-pie", acabado: "gris", desde: [0, -0.47, 2.72], hasta: [0, -0.62, 2.72], radio: 0.03 },
  {
    tipo: "tubo", id: "gota", acabado: "gris", centro: [0, -0.68],
    perfil: [[2.95, 0], [2.91, 0.045], [2.83, 0.075], [2.7, 0.08], [2.58, 0.05], [2.5, 0]],
  },
  {
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor]. Donde
    // van los flaps y los alerones, el borde de salida se adelanta hasta la
    // bisagra (escalones: dos estaciones en la misma x).
    tipo: "ala", id: "ala", acabado: "gris", y: ALA.y,
    estaciones: [
      [0, ALA.baRaiz, ALA.bsRaiz, ALA.tRaiz],
      [MANDO.flap[0], bordeAtaque(MANDO.flap[0]), bordeSalida(MANDO.flap[0]), grosorAla(MANDO.flap[0])],
      [MANDO.flap[0], bordeAtaque(MANDO.flap[0]), bisagra(MANDO.flap[0]), grosorAla(MANDO.flap[0])],
      [MANDO.aleron[1], bordeAtaque(MANDO.aleron[1]), bisagra(MANDO.aleron[1]), grosorAla(MANDO.aleron[1])],
      [MANDO.aleron[1], bordeAtaque(MANDO.aleron[1]), bordeSalida(MANDO.aleron[1]), grosorAla(MANDO.aleron[1])],
      [ALA.punta, ALA.baPunta, ALA.bsPunta, ALA.tPunta],
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "gris", y: ALA.y, estaciones: [estMando(MANDO.flap[0] + MANDO.hueco), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1] - MANDO.hueco)] },
  ...CARENADOS.map(carenado),
  // Toma de aire del motor: una joroba sobre el lomo, delante de la cola, que
  // nace del cuerpo (perfil del «CH» 152: el borde a 2,44 m detrás del
  // centro, el techo a 0,64 m) con una boca ovalada ancha, oscura y partida
  // en dos, y un borde grueso alrededor (foto de cerca de Cannon).
  { tipo: "casco", id: "toma", acabado: "gris", secciones: [
    { z: -2.44, ancho: 0.24, arriba: 0.62, abajo: 0.26, n: 2.4, nAbajo: 2.4 },
    { z: -2.7, ancho: 0.34, arriba: 0.645, abajo: 0.2, n: 2.4, nAbajo: 2.4 },
    { z: -3.2, ancho: 0.4, arriba: 0.6, abajo: 0.18, n: 2.4, nAbajo: 2.4 },
    { z: -3.8, ancho: 0.38, arriba: 0.47, abajo: 0.18, n: 2.4, nAbajo: 2.4 },
    { z: -4.3, ancho: 0.3, arriba: 0.35, abajo: 0.18, n: 2.4, nAbajo: 2.4 },
  ] },
  { tipo: "tubo", id: "toma-boca", acabado: "negro", centro: [0, 0.44], seccion: [1.45, 1], perfil: [[-2.43, 0], [-2.435, 0.135], [-2.44, 0.14]] },
  {
    tipo: "placa", id: "toma-tabique", acabado: "gris", plano: "vertical", x: 0, grosor: 0.03, bisel: 0.008,
    planta: [[-2.415, 0.31], [-2.45, 0.31], [-2.45, 0.57], [-2.415, 0.57]],
  },
  // Salidas de aire a los lados de la panza, bajo el motor.
  {
    tipo: "caja", id: "escapes", acabado: "junta", espejo: true, redondeo: 0.03,
    centro: [0.39, -0.27, -2.35], tam: [0.06, 0.16, 0.42],
  },
  {
    // Cola en Y: dos superficies en V hacia arriba, de unos 6,7 m de punta a
    // punta y a 34° sobre la horizontal...
    tipo: "ala", id: "cola", acabado: "gris", y: 0,
    // Con perfil de ala (en la 1.0, una placa plana) y a 30° sobre la
    // horizontal (foto de frente con teleobjetivo): la punta, a lo largo de la
    // superficie, a COLA.largo de la raíz.
    estaciones: [
      estCola(0), estCola(TIMON.desde), estCola(TIMON.desde, true), estCola(TIMON.hasta, true), estCola(TIMON.hasta), estCola(COLA.largo),
    ],
  },
  // Timones de la V, piezas aparte con su hueco.
  { tipo: "ala", id: "timones", acabado: "gris", y: 0, estaciones: [estTimon(TIMON.desde + 0.02), estTimon(TIMON.hasta - 0.02)] },
  ...CARENADOS_COLA.map(carenadoCola),
  {
    // ...y una aleta por debajo, que protege la hélice al despegar. Con perfil
    // (en la 1.0, una placa).
    tipo: "ala", id: "aleta-ventral", acabado: "gris", vertical: true, y: -0.25,
    estaciones: [[0, -2.84, -4.08, 0.13], [0.95, -3.4, -4.05, 0.07]],
  },
  {
    tipo: "placa", id: "carenado-ventral", acabado: "gris", plano: "vertical", x: 0, grosor: 0.17, bisel: 0.04,
    planta: [[-3.62, -0.7], [-4.12, -0.7], [-4.12, -0.79], [-3.62, -0.79]],
  },
  // Hélice propulsora de tres palas y 2,6 m, con su cono.
  {
    tipo: "tubo", id: "cono", acabado: "metal", centro: [0, 0],
    perfil: [[-5.07, 0.3], [-5.2, 0.265], [-5.35, 0.185], [-5.46, 0.08], [-5.505, 0]],
  },
  { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0, -5.12], radio: 1.3, palas: 3 },
  // Soportes y armas.
  soporte("soporte-dentro", SOPORTE.dentro),
  soporte("soporte-fuera", SOPORTE.fuera),
  ...PIEZAS_GBU,
  // Lanzador de los Hellfire (foto de cerca de Cannon): un cuerpo negro corto
  // colgado del soporte por dos ganchos, y debajo dos raíles, uno por misil.
  { tipo: "caja", id: "lanzador", acabado: "negro", espejo: true, redondeo: 0.03, centro: [SOPORTE.fuera, -0.4, 0.05], tam: [0.3, 0.14, 0.95] },
  ...[0.3, -0.2].map((dz, i): Pieza => ({ tipo: "varilla", id: `lanzador-gancho-${i}`, acabado: "metal", espejo: true, desde: [SOPORTE.fuera, -0.33, bordeAtaque(SOPORTE.fuera) - 0.45 + dz], hasta: [SOPORTE.fuera, -0.28, bordeAtaque(SOPORTE.fuera) - 0.45 + dz], radio: 0.025 })),
  ...[-0.19, 0.19].map((dx, i): Pieza => ({ tipo: "caja", id: `lanzador-rail-${i}`, acabado: "negro", espejo: true, redondeo: 0.015, centro: [SOPORTE.fuera + dx, -0.53, -0.05], tam: [0.07, 0.07, 1.45] })),
  ...[-0.19, 0.19].map((dx, i): Pieza => ({ tipo: "caja", id: `lanzador-brazo-${i}`, acabado: "negro", espejo: true, centro: [SOPORTE.fuera + dx * 0.55, -0.47, 0.05], tam: [Math.abs(dx) * 1.1, 0.05, 0.7] })),
  ...LADOS.flatMap((s) => HELLFIRE.xs.flatMap((x) => hellfire(s * x))),
  // Tren triciclo: la pata del morro, detrás de la torreta, y dos patas que
  // salen hacia fuera de unos carenados bajo la raíz del ala, con 3,5 m
  // entre ruedas. Con sus piezas, como en la foto de cerca de Cannon: cada
  // pata principal lleva el amortiguador en paralelo; la del morro, un
  // amortiguador con su vástago brillante, el compás y un tirante.
  { tipo: "varilla", id: "pata-morro", acabado: "negro", desde: NARIZ_TREN.arriba, hasta: enPataMorro(0.58), radio: 0.055 },
  { tipo: "varilla", id: "vastago-morro", acabado: "metal", desde: enPataMorro(0.55), hasta: NARIZ_TREN.abajo, radio: 0.035 },
  { tipo: "varilla", id: "tirante-morro", acabado: "negro", desde: [0, -0.47, 1.95], hasta: enPataMorro(0.42), radio: 0.03 },
  { tipo: "varilla", id: "compas-morro", acabado: "metal", desde: enPataMorro(0.62, 0.1), hasta: enPataMorro(0.8, 0.13), radio: 0.014 },
  { tipo: "varilla", id: "compas-morro-2", acabado: "metal", desde: enPataMorro(0.8, 0.13), hasta: enPataMorro(0.97, 0.05), radio: 0.014 },
  { tipo: "varilla", id: "horquilla", acabado: "metal", espejo: true, desde: [0.08, NARIZ_TREN.abajo[1], NARIZ_TREN.abajo[2]], hasta: [0.08, SUELO + 0.19, 2.95], radio: 0.025 },
  { tipo: "disco", id: "rueda-morro", acabado: "negro", en: [0, SUELO + 0.19, 2.95], normal: [1, 0, 0], radio: 0.19, grosor: 0.12 },
  { tipo: "disco", id: "buje-morro", acabado: "metal", espejo: true, en: [0.062, SUELO + 0.19, 2.95], normal: [1, 0, 0], radio: 0.085, grosor: 0.01 },
  {
    tipo: "caja", id: "carenados-tren", acabado: "gris", espejo: true, redondeo: 0.12,
    centro: [0.55, -0.1, -0.35], tam: [0.32, 0.26, 1.5],
  },
  { tipo: "varilla", id: "patas", acabado: "gris", espejo: true, desde: PATA.arriba, hasta: PATA.abajo, radio: 0.075 },
  { tipo: "varilla", id: "amortiguadores", acabado: "negro", espejo: true, desde: enPata(0.45, 0.12), hasta: enPata(0.95, 0.12), radio: 0.065 },
  { tipo: "varilla", id: "ejes", acabado: "metal", espejo: true, desde: PATA.abajo, hasta: [1.78, SUELO + 0.23, -0.05], radio: 0.035 },
  { tipo: "disco", id: "ruedas", acabado: "negro", espejo: true, en: [1.78, SUELO + 0.23, -0.05], normal: [1, 0, 0], radio: 0.23, grosor: 0.14 },
  { tipo: "disco", id: "bujes", acabado: "metal", espejo: true, en: [1.855, SUELO + 0.23, -0.05], normal: [1, 0, 0], radio: 0.1, grosor: 0.02 },
  { tipo: "disco", id: "bujes-dentro", acabado: "metal", espejo: true, en: [1.705, SUELO + 0.23, -0.05], normal: [1, 0, 0], radio: 0.1, grosor: 0.02 },
  // Antenas y sondas (foto de Cannon y perfil del «CH» 152): una varilla fina
  // que cuelga de la gota, una sonda en L a cada lado del morro, a la altura
  // de la arista, y antenas de pala en la panza.
  { tipo: "varilla", id: "gota-varilla", acabado: "gris", desde: [0, -0.74, 2.7], hasta: [0, -0.98, 2.68], radio: 0.008 },
  { tipo: "varilla", id: "sondas-morro", acabado: "metal", espejo: true, desde: [0.4, -0.12, 4.95], hasta: [0.4, -0.12, 5.17], radio: 0.009 },
  { tipo: "varilla", id: "sondas-morro-pie", acabado: "metal", espejo: true, desde: [0.4, -0.12, 4.95], hasta: [0.44, -0.12, 4.95], radio: 0.012 },
  ...[0.6, -0.9, -1.9].map((z, i): Pieza => ({
    tipo: "placa", id: `pala-${i}`, acabado: "gris", plano: "vertical", x: 0, grosor: 0.018, bisel: 0.005,
    planta: [[z + 0.1, -0.5], [z - 0.06, -0.5], [z - 0.1, -0.66], [z - 0.02, -0.66]],
  })),
];

// ── Detalle pintado del HD (el «CH» 11-4152 de Creech) ─────────────────────
// Marcas y costuras de las fotos del «CH» 152 (perfil al despegar) y de otros
// MQ-9 de la Fuerza Aérea para lo que en esas no se ve (los discos rojos y
// blancos del lomo y del ala). En metros, como las piezas.
const LADO: [number, number, number] = [1, 0, 0];
const ARRIBA: [number, number, number] = [0, 1, 0];
// Cara de fuera de la cola derecha (la de abajo de la V, que mira afuera).
const FUERA_COLA: [number, number, number] = [Math.sin(COLA.angulo), -Math.cos(COLA.angulo), 0];
const enCola = (d: number, z: number): [number, number, number] =>
  [d * Math.cos(COLA.angulo) + 0.1 * Math.sin(COLA.angulo), d * Math.sin(COLA.angulo) - 0.1 * Math.cos(COLA.angulo), z];
const cuerdaMedia = (x: number, f: number) => bordeAtaque(x) - f * (bordeAtaque(x) - bordeSalida(x));

const CALCAS: Calca[] = [
  // Escarapela de baja visibilidad, detrás del ala y a la altura de la arista.
  { sobre: ["fuselaje"], en: [0.6, -0.05, -2.15], desde: LADO, tam: [0.52, 0.235], dibujo: { tipo: "escarapela" }, espejo: true },
  // Escudo del 432.º Ala, detrás del morro.
  { sobre: ["fuselaje"], en: [0.6, 0.07, 1.42], desde: LADO, tam: [0.2, 0.26], dibujo: { tipo: "escudo" }, espejo: true },
  // «CH» (Creech) y el escudo del Mando de Combate Aéreo, en la cara de fuera
  // de cada cola.
  { sobre: ["cola"], en: enCola(1.3, -3.55), desde: FUERA_COLA, tam: [0.5, 0.26], dibujo: { tipo: "texto", texto: "CH" }, espejo: true },
  { sobre: ["cola"], en: enCola(3.0, -3.98), desde: FUERA_COLA, tam: [0.19, 0.2], dibujo: { tipo: "escudo" }, espejo: true },
  // Número de serie en la aleta ventral: «AF» sobre «11» y el «152».
  { sobre: ["aleta-ventral"], en: [0.1, -0.6, -3.58], desde: LADO, tam: [0.62, 0.24], dibujo: { tipo: "serie", ano: "11", numero: "152" }, espejo: true },
  // Luces: la roja bajo la punta del morro (foto de Cannon) y las de posición
  // en las puntas del ala, roja a la izquierda y verde a la derecha.
  { sobre: ["morro"], en: [0, -0.1, 5.5], desde: [0, -0.3, 1], tam: [0.06, 0.06], dibujo: { tipo: "disco", color: "#d0222a" } },
  { sobre: ["ala"], en: [ALA.punta, ALA.y, bordeAtaque(ALA.punta) - 0.12], desde: [1, 0, 0], tam: [0.07, 0.07], dibujo: { tipo: "disco", color: "#1fae5a" } },
  { sobre: ["ala"], en: [-ALA.punta, ALA.y, bordeAtaque(ALA.punta) - 0.12], desde: [-1, 0, 0], tam: [0.07, 0.07], dibujo: { tipo: "disco", color: "#d0222a" } },
  // Discos blancos y rojos del lomo y del ala.
  ...[1.2, 0.95, -0.4, -1.1].map((z): Calca => ({ sobre: ["fuselaje"], en: [0, 0.5, z], desde: ARRIBA, tam: [0.1, 0.1], dibujo: { tipo: "disco", color: "#f1f1ec" } })),
  ...[1.55, 0.2, -0.75].map((z): Calca => ({ sobre: ["fuselaje"], en: [0.12, 0.5, z], desde: ARRIBA, tam: [0.09, 0.09], dibujo: { tipo: "disco", color: "#b5262c" }, espejo: true })),
  ...[2.4, 6.0].map((x): Calca => ({ sobre: ["ala"], en: [x, 0.4, cuerdaMedia(x, 0.45)], desde: ARRIBA, tam: [0.11, 0.11], dibujo: { tipo: "disco", color: "#b5262c" }, espejo: true })),
];

const COSTURAS: Costura[] = [
  // Borde de la carena de la joroba, fino y atornillado (foto del «CH» 152):
  // baja detrás de ella con los tornillos juntos (7 cm) y recorre el costado
  // por encima de la arista hasta el morro, con uno cada 15 cm.
  { sobre: ["morro", "fuselaje"], desde: LADO, espejo: true, remaches: 0.07, puntos: [[0.62, 0.44, 2.3], [0.62, 0.2, 2.34], [0.62, 0.06, 2.45]] },
  { sobre: ["morro", "fuselaje"], desde: LADO, espejo: true, remaches: 0.15, puntos: [
    [0.62, 0.06, 2.45], [0.62, 0.03, 3.0], [0.62, 0.03, 4.0], [0.62, 0.07, 4.7], [0.62, 0.16, 5.1], [0.62, 0.3, 5.3],
  ] },
  { sobre: ["morro", "fuselaje"], desde: ARRIBA, remaches: 0.07, puntos: [[-0.5, 0.9, 2.3], [0.5, 0.9, 2.3]] },
  // Tapa de la punta del morro.
  { sobre: ["morro"], desde: LADO, espejo: true, puntos: [[0.6, 0.35, 5.33], [0.6, -0.3, 5.33]] },
  // Tapa de registro junto al escudo: tornillos solo en las esquinas y en el
  // centro de cada lado, como en la foto.
  { sobre: ["fuselaje"], desde: LADO, espejo: true, enVertices: true, puntos: [
    [0.62, 0.135, 1.9], [0.62, 0.135, 2.04], [0.62, 0.135, 2.18], [0.62, 0.0125, 2.18], [0.62, -0.11, 2.18],
    [0.62, -0.11, 2.04], [0.62, -0.11, 1.9], [0.62, 0.0125, 1.9], [0.62, 0.135, 1.9],
  ] },
  // Otra tapa atornillada, junto a la raíz del ala (perfil del «CH» 152).
  { sobre: ["fuselaje"], desde: LADO, espejo: true, enVertices: true, puntos: [
    [0.6, 0.09, -0.69], [0.6, 0.09, -0.84], [0.6, 0.09, -0.99], [0.6, -0.005, -0.99], [0.6, -0.1, -0.99],
    [0.6, -0.1, -0.84], [0.6, -0.1, -0.69], [0.6, -0.005, -0.69], [0.6, 0.09, -0.69],
  ] },
  // Tapas de los soportes, a los dos lados de cada uno (foto de Cannon).
  ...(["dentro", "fuera"] as const).flatMap((q): Costura[] => [1, -1].map((l) => {
    const x = SOPORTE[q] + l * 0.075, z0 = bordeAtaque(SOPORTE[q]) - 0.35;
    return { sobre: [`soporte-${q}`], desde: [l, 0, 0], espejo: true, enVertices: true, puntos: [
      [x, -0.05, z0], [x, -0.05, z0 - 0.3], [x, -0.24, z0 - 0.3], [x, -0.24, z0], [x, -0.05, z0],
    ] };
  })),
  // Tapas de registro del ala (por arriba, junto a la raíz y a media ala).
  ...[1.25, 5.8].map((x): Costura => ({ sobre: ["ala"], desde: ARRIBA, espejo: true, enVertices: true, puntos: [
    [x - 0.2, 0.4, cuerdaMedia(x, 0.3)], [x + 0.2, 0.4, cuerdaMedia(x, 0.3)], [x + 0.2, 0.4, cuerdaMedia(x, 0.5)], [x - 0.2, 0.4, cuerdaMedia(x, 0.5)], [x - 0.2, 0.4, cuerdaMedia(x, 0.3)],
  ] })),
  // Tapa de la raíz de cada cola, en su cara de fuera.
  { sobre: ["cola"], desde: FUERA_COLA, espejo: true, enVertices: true, puntos: [enCola(0.45, -3.05), enCola(0.45, -3.4), enCola(0.8, -3.45), enCola(0.8, -3.1), enCola(0.45, -3.05)] },
  // Junta de la carena del motor.
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.6, 0.4, -4.35], [0.6, -0.5, -4.35]] },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.4, 0.6, -4.35], [0.4, 0.6, -4.35]] },
  // Juntas de los paneles del ala, de delante a la bisagra.
  ...[1.9, 3.5, 5.2, 6.9, 8.4].map((x): Costura => ({ sobre: ["ala"], desde: ARRIBA, espejo: true, puntos: [[x, 0.4, bordeAtaque(x) - 0.03], [x, 0.4, bisagra(x) + 0.03]] })),
];

const PARTES: Parte[] = [
  {
    nombre: "Joroba del satélite",
    en: [0, 0.95, 3.9],
    piezas: ["morro", "cupula", "cupula-pie", "cupula-tapa", "antena-t", "antena-t-barra", "gota", "gota-pie", "gota-varilla", "pala-0", "pala-1", "pala-2"],
    respaldo: "foto",
    fuentes: ["perfil", "morro", "suelo"],
    texto: "El bulto de encima del morro guarda la antena que habla con el satélite: por ahí se maneja el Reaper desde bases al otro lado del mundo. Detrás van una cúpula pequeña y una antena en forma de T.",
  },
  {
    nombre: "Torreta de sensores",
    en: [0, -1.0, 4.34],
    piezas: ["torreta", "torreta-collar", "torreta-ventana", "torreta-ventana-2", "camara-morro", "sondas-morro", "sondas-morro-pie"],
    respaldo: "foto",
    fuentes: ["frente", "morro", "perfil", "ficha"],
    texto: "Una bola que gira bajo el morro con cámaras de día y térmica y un láser que marca el blanco para los misiles y las bombas guiadas. El piloto se orienta con otra cámara pequeña en la punta del morro.",
    nota: "Qué lleva dentro sale de la ficha de la Fuerza Aérea; la forma, de las fotos.",
  },
  {
    nombre: "Ala recta y larga",
    en: [7.0, 0.3, -0.4],
    piezas: ["ala", "flaps", "alerones", ...CARENADOS.map((x) => `carenado-${x}`)],
    respaldo: "foto",
    fuentes: ["arriba", "abajo", "ficha"],
    texto: "20,1 m de punta a punta, casi el doble que el largo del avión: un ala de planeador, pensada para aguantar muchas horas en el aire gastando poco. Debajo del borde de salida, los bultos de los mandos.",
    nota: "La envergadura es la de la ficha; la cuerda y el estrechamiento hacia la punta, medidos en las fotos.",
  },
  {
    nombre: "Cuatro misiles Hellfire",
    en: [SOPORTE.fuera + 0.35, HELLFIRE.y - 0.1, 0.4],
    piezas: ["soporte-fuera", "lanzador", "lanzador-gancho-0", "lanzador-gancho-1", "lanzador-rail-0", "lanzador-rail-1", "lanzador-brazo-0", "lanzador-brazo-1", ...LADOS.flatMap((s) => HELLFIRE.xs.flatMap((x) => idsHellfire(s * x)))],
    respaldo: "foto",
    fuentes: ["frente", "taxi", "abajo", "perfil", "asf"],
    texto: "Dos en cada ala, colgados de un lanzador bajo el soporte de fuera. Es un misil pequeño, de 1,6 m y unos 50 kg, guiado por el láser de la torreta: el arma con la que el Reaper hizo su primer ataque, en Afganistán, en 2007.",
    nota: "La franja amarilla marca la carga explosiva; así se ve en las fotos de misiles reales.",
  },
  {
    nombre: "Dos bombas GBU-12",
    en: [SOPORTE.dentro, GBU.y - 0.25, 1.4],
    piezas: ["soporte-dentro", ...PIEZAS_GBU.map((p) => p.id)],
    respaldo: "foto",
    fuentes: ["frente", "taxi", "morro", "perfil"],
    texto: "Una en cada soporte de dentro: una bomba normal de 227 kg con una cabeza que sigue el punto del láser y alas detrás para corregir la caída. Con ellas el Reaper llega a blancos más grandes que los que rompe un Hellfire.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 1.0, -2.6],
    piezas: ["toma", "toma-boca", "toma-tabique", "escapes", "helice", "cono"],
    respaldo: "foto",
    fuentes: ["morro", "suelo", "perfil", "ga"],
    texto: "Un turbohélice Honeywell de 900 caballos metido en la parte de atrás, que respira por la góndola del lomo y mueve una hélice de tres palas que empuja desde la cola.",
    nota: "El motor sale de la ficha y del fabricante; la hélice y la toma, de las fotos.",
  },
  {
    nombre: "Cola en Y",
    en: [1.9, 1.45, -3.9],
    piezas: ["cola", "timones", "aleta-ventral", "carenado-ventral", ...CARENADOS_COLA.map((d) => `carenado-cola-${d}`)],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "suelo"],
    texto: "Dos superficies en V hacia arriba y una aleta por debajo, que evita que la hélice toque el suelo si el morro sube de más al despegar o aterrizar.",
    nota: "El ángulo de la V, medido en la foto de frente; la altura, la de la ficha.",
  },
  {
    nombre: "Tren de aterrizaje",
    en: [1.95, SUELO - 0.1, -0.05],
    piezas: ["carenados-tren", "patas", "amortiguadores", "ejes", "ruedas", "bujes", "bujes-dentro", "pata-morro", "vastago-morro", "tirante-morro", "compas-morro", "compas-morro-2", "horquilla", "rueda-morro", "buje-morro"],
    respaldo: "foto",
    fuentes: ["frente", "armas", "suelo"],
    texto: "Tres ruedas: una bajo el morro y dos en patas largas que salen de la panza hacia fuera. En vuelo no se recogen del todo: se ven colgando en muchas fotos.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.panza !== undefined && { panza: u(q.panza) }) })) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
  }
};

const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "MQ-9 Reaper",
  subtitulo: "Dron armado de media altitud y gran autonomía",
  escala: ESCALA,  // 1 unidad = 7,8 m; medidas de la ficha de la Fuerza Aérea
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "perfil-vuelo-armado.jpg", titulo: "De perfil, aterrizando en Kandahar con Hellfire y GBU-12", medio: "Ministerio de Defensa británico (Wikimedia Commons)", url: `${COMMONS}Royal_Air_Force_MQ-9_Reaper_1_November_2010.jpg` },
    { id: "arriba", imagen: "planta-arriba-vuelo.jpg", titulo: "Desde arriba, en una misión sobre Afganistán", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}MQ-9_Reaper_UAV.jpg` },
    { id: "abajo", imagen: "abajo-armado.jpg", titulo: "Desde abajo, con toda la carga", medio: "Ministerio de Defensa británico (Wikimedia Commons)", url: `${COMMONS}Reaper_UAV_Takes_to_the_Skies_of_Southern_Afghanistan_MOD_45151418.jpg` },
    { id: "frente", imagen: "frente-kandahar.jpg", titulo: "De frente, con cuatro Hellfire y dos GBU-12", medio: "Ministerio de Defensa británico (Wikimedia Commons)", url: `${COMMONS}Reaper_UAV_Taxis_at_Kandahar_Airfield_MOD_45151487.jpg` },
    { id: "taxi", imagen: "taxi-2007.jpg", titulo: "Armado en Afganistán en noviembre de 2007, su primer año en combate", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}MQ-9_Reaper_taxis.jpg` },
    { id: "morro", imagen: "morro-armado.jpg", titulo: "El morro, la torreta y la toma de aire del motor", medio: "Ministerio de Defensa británico (Wikimedia Commons)", url: `${COMMONS}RAF_Reaper_MQ-9_Remotely_Piloted_Air_System_MOD_45152585.jpg` },
    { id: "suelo", imagen: "perfil-suelo.jpg", titulo: "En tierra, de perfil, en la base de Syracuse", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}138th_Attack_Squadron_-_General_Atomics_MQ-9B_Reaper_09-4066.jpg` },
    { id: "armas", imagen: "bajo-ala-armas.jpg", titulo: "Bajo el ala: soportes, bombas GBU-38 y tren", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}An_MQ-9_Reaper_armed_with_four_GBU-38_JDAM_parks_on_a_flightline_on_Kandahar_Airfield,_Afghanistan_in_February_2018_-_3.jpg` },
    { id: "ficha", titulo: "MQ-9 Reaper Unmanned Aircraft System (ficha oficial)", medio: "Fuerza Aérea de EE. UU.", url: FICHA },
    { id: "ga", titulo: "MQ-9A Reaper (Predator B)", medio: "General Atomics", url: GA },
    { id: "asf", titulo: "MQ-9 Reaper", medio: "Air & Space Forces Magazine", url: ASF },
  ],
};

export default maqueta;
