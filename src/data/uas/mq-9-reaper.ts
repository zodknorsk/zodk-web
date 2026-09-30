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
import type { Maqueta, Parte, Pieza } from "./tipos";
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

// Dos soportes bajo cada ala (foto de frente con teleobjetivo): el de dentro
// con una GBU-12 y el de fuera con dos Hellfire.
const SOPORTE = { dentro: 1.3, fuera: 2.25 };
const GBU = { y: -0.5 };
const HELLFIRE = { y: -0.66, xs: [SOPORTE.fuera - 0.19, SOPORTE.fuera + 0.19] };
// Los tubos no se reflejan solos: cada arma se monta en los dos lados.
const LADOS = [1, -1];

// Suelo, bajo las ruedas: con él, 3,8 m de alto hasta la punta de la cola.
const SUELO = -1.62;

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

// Soportes bajo el ala: cajas con el frente redondeado, casi tan largas como
// la cuerda.
const soporte = (id: string, x: number): Pieza => ({
  tipo: "caja", id, acabado: "gris", espejo: true, redondeo: 0.06,
  centro: [x, -0.14, bordeAtaque(x) - 0.43], tam: [0.14, 0.34, 0.8],
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
const COLA = { largo: 3.95, baRaiz: -2.9, bsRaiz: -3.9, baPunta: -4.04, bsPunta: -4.67 };
const bordeSalidaCola = (d: number) => COLA.bsRaiz + ((COLA.bsPunta - COLA.bsRaiz) * d) / COLA.largo;
// Carenados de los mandos de la cola: la misma superficie, más gruesa en una
// franja corta junto al borde de salida (fotos de perfil).
const carenadoCola = (d: number): Pieza => ({
  tipo: "placa", id: `carenado-cola-${d}`, acabado: "gris", plano: "vertical", x: 0, grosor: 0.17,
  espejo: true, inclinacion: 56, bisel: 0.04,
  planta: [[bordeSalidaCola(d) + 0.45, d], [bordeSalidaCola(d) - 0.05, d], [bordeSalidaCola(d + 0.09) - 0.05, d + 0.09], [bordeSalidaCola(d + 0.09) + 0.45, d + 0.09]],
});
const CARENADOS_COLA = [1.6, 2.9];

// Bola de la torreta de sensores, como un torno de media circunferencia.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
const TORRETA = { y: -0.66, z: 4.34, r: 0.23 };

const PIEZAS: Pieza[] = [
  {
    // Cuerpo, de la punta del morro al cono de la hélice: 1,1 m de ancho
    // (foto de frente con teleobjetivo), algo más ancho que alto; por abajo,
    // plano hasta la cola, donde sube hacia la hélice.
    tipo: "tubo", id: "fuselaje", acabado: "gris", centro: [0, -0.02], seccion: [1, 0.85],
    perfil: [
      [5.5, 0], [5.47, 0.12], [5.4, 0.21], [5.26, 0.31], [5.1, 0.38], [4.97, 0.42], [4.65, 0.52], [4.2, 0.54],
      [3.0, 0.55], [1.0, 0.55], [-0.5, 0.54], [-1.5, 0.52], [-2.5, 0.49], [-3.2, 0.46], [-3.8, 0.4],
      [-4.3, 0.35], [-4.7, 0.29], [-4.95, 0.23], [-4.97, 0],
    ],
  },
  {
    // La joroba del morro, con la antena de satélite dentro: sube hasta 1,3 m
    // sobre la panza y deja un pliegue a lo largo del costado.
    tipo: "tubo", id: "joroba", acabado: "gris", centro: [0, 0.1], seccion: [0.8, 1],
    perfil: [
      [5.4, 0], [5.34, 0.05], [5.2, 0.18], [5.05, 0.31], [4.85, 0.45], [4.65, 0.57], [4.35, 0.66], [4.08, 0.7],
      [3.63, 0.7], [3.3, 0.64], [3.02, 0.59], [2.7, 0.49], [2.33, 0.37], [2.0, 0.3], [1.8, 0],
    ],
  },
  {
    // Parte de atrás, la del motor: el lomo sigue recto hasta la hélice y la
    // panza sube.
    tipo: "tubo", id: "fuselaje-motor", acabado: "gris", centro: [0, 0.1],
    perfil: [[-0.3, 0], [-0.5, 0.25], [-1.5, 0.31], [-2.5, 0.335], [-3.3, 0.345], [-4.0, 0.34], [-4.6, 0.33], [-4.95, 0.32], [-4.96, 0]],
  },
  // Sonda y cámara de vuelo en la punta del morro.
  { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, 0.08, 5.42], hasta: [0, 0.09, 6.0], radio: 0.013 },
  { tipo: "disco", id: "camara-morro", acabado: "lente", en: [0, -0.02, 5.49], normal: [0, 0, 1], radio: 0.045, grosor: 0.02 },
  // Torreta de sensores bajo el morro: una bola con una ventana grande
  // delante y otra pequeña al lado, colgada de un collar.
  { tipo: "disco", id: "torreta-collar", acabado: "gris", en: [0, -0.47, TORRETA.z], normal: [0, 1, 0], radio: 0.17, grosor: 0.07 },
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
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor].
    tipo: "ala", id: "ala", acabado: "gris", y: ALA.y,
    estaciones: [
      [0, ALA.baRaiz, ALA.bsRaiz, ALA.tRaiz],
      [ALA.punta, ALA.baPunta, ALA.bsPunta, ALA.tPunta],
    ],
  },
  ...CARENADOS.map(carenado),
  {
    // Toma de aire del motor: una góndola redonda sobre el lomo, delante de
    // la cola, con la boca partida en dos.
    tipo: "tubo", id: "toma", acabado: "gris", centro: [0, 0.55], seccion: [1.2, 1],
    perfil: [[-2.28, 0.17], [-2.3, 0.21], [-2.36, 0.235], [-2.5, 0.255], [-2.8, 0.26], [-3.1, 0.245], [-3.4, 0.2], [-3.7, 0.1], [-3.85, 0]],
  },
  { tipo: "disco", id: "toma-boca", acabado: "junta", en: [0, 0.55, -2.29], normal: [0, 0, 1], radio: 0.2, grosor: 0.02 },
  {
    tipo: "placa", id: "toma-tabique", acabado: "gris", plano: "vertical", x: 0, grosor: 0.03,
    planta: [[-2.28, 0.37], [-2.5, 0.37], [-2.5, 0.73], [-2.28, 0.73]],
  },
  // Salidas de aire a los lados de la panza, bajo el motor.
  {
    tipo: "caja", id: "escapes", acabado: "junta", espejo: true, redondeo: 0.03,
    centro: [0.39, -0.27, -2.35], tam: [0.06, 0.16, 0.42],
  },
  {
    // Cola en Y: dos superficies en V hacia arriba, de unos 6,7 m de punta a
    // punta y a 34° sobre la horizontal...
    tipo: "placa", id: "cola", acabado: "gris", plano: "vertical", x: 0, grosor: 0.1,
    espejo: true, inclinacion: 56, bisel: 0.03,
    planta: [[COLA.baRaiz, 0], [COLA.bsRaiz, 0], [COLA.bsPunta, COLA.largo], [COLA.baPunta, COLA.largo]],
  },
  ...CARENADOS_COLA.map(carenadoCola),
  {
    // ...y una aleta por debajo, que protege la hélice al despegar.
    tipo: "placa", id: "aleta-ventral", acabado: "gris", plano: "vertical", x: 0, grosor: 0.1, bisel: 0.03,
    planta: [[-2.84, -0.25], [-4.08, -0.25], [-4.05, -1.2], [-3.4, -1.2]],
  },
  {
    tipo: "placa", id: "carenado-ventral", acabado: "gris", plano: "vertical", x: 0, grosor: 0.17, bisel: 0.04,
    planta: [[-3.62, -0.7], [-4.12, -0.7], [-4.12, -0.79], [-3.62, -0.79]],
  },
  // Hélice propulsora de tres palas y 2,6 m, con su cono.
  {
    tipo: "tubo", id: "cono", acabado: "metal", centro: [0, 0.12],
    perfil: [[-4.93, 0.32], [-5.1, 0.3], [-5.3, 0.22], [-5.45, 0.1], [-5.5, 0]],
  },
  { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0.12, -5.05], radio: 1.3, palas: 3 },
  // Soportes y armas.
  soporte("soporte-dentro", SOPORTE.dentro),
  soporte("soporte-fuera", SOPORTE.fuera),
  ...PIEZAS_GBU,
  {
    tipo: "caja", id: "lanzador", acabado: "negro", espejo: true, redondeo: 0.04,
    centro: [SOPORTE.fuera, -0.45, -0.02], tam: [0.3, 0.24, 1.45],
  },
  ...LADOS.flatMap((s) => HELLFIRE.xs.flatMap((x) => hellfire(s * x))),
  // Tren triciclo: la pata del morro, detrás de la torreta, y dos patas que
  // salen hacia fuera de unos carenados bajo la raíz del ala, con 3,5 m
  // entre ruedas.
  { tipo: "varilla", id: "pata-morro", acabado: "metal", desde: [0, -0.45, 2.35], hasta: [0, -1.25, 2.87], radio: 0.05 },
  { tipo: "varilla", id: "horquilla", acabado: "metal", espejo: true, desde: [0.08, -1.25, 2.87], hasta: [0.08, SUELO + 0.19, 2.95], radio: 0.025 },
  { tipo: "disco", id: "rueda-morro", acabado: "negro", en: [0, SUELO + 0.19, 2.95], normal: [1, 0, 0], radio: 0.19, grosor: 0.12 },
  {
    tipo: "caja", id: "carenados-tren", acabado: "gris", espejo: true, redondeo: 0.12,
    centro: [0.55, -0.1, -0.35], tam: [0.32, 0.26, 1.5],
  },
  { tipo: "varilla", id: "patas", acabado: "gris", espejo: true, desde: [0.62, -0.2, -0.3], hasta: [1.7, SUELO + 0.23, -0.05], radio: 0.07 },
  { tipo: "disco", id: "ruedas", acabado: "negro", espejo: true, en: [1.78, SUELO + 0.23, -0.05], normal: [1, 0, 0], radio: 0.23, grosor: 0.14 },
  { tipo: "disco", id: "bujes", acabado: "metal", espejo: true, en: [1.855, SUELO + 0.23, -0.05], normal: [1, 0, 0], radio: 0.1, grosor: 0.02 },
];

const PARTES: Parte[] = [
  {
    nombre: "Joroba del satélite",
    en: [0, 0.95, 3.9],
    piezas: ["joroba", "cupula", "cupula-pie", "cupula-tapa", "antena-t", "antena-t-barra"],
    respaldo: "foto",
    fuentes: ["perfil", "morro", "suelo"],
    texto: "El bulto de encima del morro guarda la antena que habla con el satélite: por ahí se maneja el Reaper desde bases al otro lado del mundo. Detrás van una cúpula pequeña y una antena en forma de T.",
  },
  {
    nombre: "Torreta de sensores",
    en: [0, -1.0, 4.34],
    piezas: ["torreta", "torreta-collar", "torreta-ventana", "torreta-ventana-2", "camara-morro"],
    respaldo: "foto",
    fuentes: ["frente", "morro", "perfil", "ficha"],
    texto: "Una bola que gira bajo el morro con cámaras de día y térmica y un láser que marca el blanco para los misiles y las bombas guiadas. El piloto se orienta con otra cámara pequeña en la punta del morro.",
    nota: "Qué lleva dentro sale de la ficha de la Fuerza Aérea; la forma, de las fotos.",
  },
  {
    nombre: "Ala recta y larga",
    en: [7.0, 0.3, -0.4],
    piezas: ["ala", ...CARENADOS.map((x) => `carenado-${x}`)],
    respaldo: "foto",
    fuentes: ["arriba", "abajo", "ficha"],
    texto: "20,1 m de punta a punta, casi el doble que el largo del avión: un ala de planeador, pensada para aguantar muchas horas en el aire gastando poco. Debajo del borde de salida, los bultos de los mandos.",
    nota: "La envergadura es la de la ficha; la cuerda y el estrechamiento hacia la punta, medidos en las fotos.",
  },
  {
    nombre: "Cuatro misiles Hellfire",
    en: [SOPORTE.fuera + 0.35, HELLFIRE.y - 0.1, 0.4],
    piezas: ["soporte-fuera", "lanzador", ...LADOS.flatMap((s) => HELLFIRE.xs.flatMap((x) => idsHellfire(s * x)))],
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
    piezas: ["toma", "toma-boca", "toma-tabique", "escapes", "helice", "cono", "fuselaje-motor"],
    respaldo: "foto",
    fuentes: ["morro", "suelo", "perfil", "ga"],
    texto: "Un turbohélice Honeywell de 900 caballos metido en la parte de atrás, que respira por la góndola del lomo y mueve una hélice de tres palas que empuja desde la cola.",
    nota: "El motor sale de la ficha y del fabricante; la hélice y la toma, de las fotos.",
  },
  {
    nombre: "Cola en Y",
    en: [1.9, 1.45, -3.9],
    piezas: ["cola", "aleta-ventral", "carenado-ventral", ...CARENADOS_COLA.map((d) => `carenado-cola-${d}`)],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "suelo"],
    texto: "Dos superficies en V hacia arriba y una aleta por debajo, que evita que la hélice toque el suelo si el morro sube de más al despegar o aterrizar.",
    nota: "El ángulo de la V, medido en la foto de frente; la altura, la de la ficha.",
  },
  {
    nombre: "Tren de aterrizaje",
    en: [1.95, SUELO - 0.1, -0.05],
    piezas: ["carenados-tren", "patas", "ruedas", "bujes", "pata-morro", "horquilla", "rueda-morro"],
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
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), estaciones: p.estaciones.map(([x, a, b, t]): [number, number, number, number] => [u(x), u(a), u(b), u(t)]) };
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

const maqueta: Maqueta = {
  nombre: "MQ-9 Reaper",
  subtitulo: "Dron armado de media altitud y gran autonomía",
  escala: ESCALA,  // 1 unidad = 7,8 m; medidas de la ficha de la Fuerza Aérea
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
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
