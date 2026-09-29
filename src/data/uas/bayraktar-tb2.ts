// Maqueta del Bayraktar TB2 de Baykar, con la carga que sale en casi todas
// las fotos armadas: cuatro bombas MAM-L, dos bajo cada ala.
// Medidas de Baykar (12 m de envergadura, 6,5 m de largo); la forma, del
// plano de cinco vistas de Wikimedia Commons (a escala con esas medidas) y
// de fotos del dron en Ucrania, Polonia y las ferias Teknofest e IDEF. Todo
// se escribe en metros, con y = 0 en el plano del ala junto a las vigas y
// z = 0 a mitad del largo, y al final se pasa a unidades de la maqueta.
// Imágenes a tamaño completo en arte/uas-fuentes/bayraktar-tb2/ (fuera de
// Git; enlaces en docs/uas.md).
import type { Maqueta, Parte, Pieza } from "./tipos";
import { TURQUIA } from "../banderas-uas.ts";

const ESCALA = 4.5;

const BAYKAR = "https://baykartech.com/en/uav/bayraktar-tb2/";
const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Ala recta y larga, con un poco de diedro: la punta sube 0,27 m (plano de
// frente). Cruza el fuselaje a media altura.
const ALA = { punta: 6.0, baRaiz: 0.72, bsRaiz: -0.11, baPunta: 0.64, bsPunta: -0.04, tRaiz: 0.12, tPunta: 0.06, subida: 0.27 };
const enAla = (raiz: number, punta: number) => (x: number) => raiz + ((punta - raiz) * x) / ALA.punta;
const bordeAtaque = enAla(ALA.baRaiz, ALA.baPunta);
const subidaAla = enAla(0, ALA.subida);

// Las dos vigas de cola, a 1,14 m del centro, suben un poco hacia atrás.
const VIGA = { x: 1.14, y: 0.02, delante: 0.62, detras: -3.3 };

// Cuatro soportes, dos bajo cada ala (plano de frente): a 1,7 y 2,16 m.
const SOPORTES = [1.7, 2.16];
const LADOS = [1, -1];

// Suelo, bajo las ruedas.
const SUELO = -1.0;

// Cuatro aletas en X alrededor del eje de una bomba: el contorno va en
// [z, distancia al eje].
const aletasX = (id: string, x: number, y: number, contorno: [number, number][], acabado: Pieza["acabado"]): Pieza[] =>
  [45, -45, 135, -135].map((inclinacion, i) => ({
    tipo: "placa", id: `${id}-${i}`, acabado, plano: "vertical", x, y, grosor: 0.01, inclinacion, planta: contorno,
  }));

// MAM-L de Roketsan: 1 m y 16 cm de grueso, con el buscador láser redondo
// delante, cuatro alas cortas a media bomba y cuatro timones detrás.
const MAM = { y: -0.29, delante: 1.02 };
const mam = (x: number): Pieza[] => {
  const z0 = MAM.delante;
  return [
    {
      tipo: "tubo", id: `mam-${x}`, acabado: "negro", centro: [x, MAM.y],
      perfil: [[z0, 0], [z0 - 0.015, 0.045], [z0 - 0.04, 0.066], [z0 - 0.08, 0.078], [z0 - 0.14, 0.08], [z0 - 0.93, 0.08], [z0 - 0.98, 0.066], [z0 - 1.0, 0]],
    },
    { tipo: "disco", id: `mam-ojo-${x}`, acabado: "lente", en: [x, MAM.y, z0 - 0.01], normal: [0, 0, 1], radio: 0.035, grosor: 0.01 },
    ...aletasX(`mam-alas-${x}`, x, MAM.y, [[z0 - 0.3, 0.07], [z0 - 0.5, 0.07], [z0 - 0.48, 0.15], [z0 - 0.36, 0.15]], "negro"),
    ...aletasX(`mam-timones-${x}`, x, MAM.y, [[z0 - 0.78, 0.07], [z0 - 1.0, 0.07], [z0 - 1.0, 0.17], [z0 - 0.9, 0.17]], "negro"),
  ];
};
const idsMam = (x: number) => [`mam-${x}`, `mam-ojo-${x}`, ...[0, 1, 2, 3].flatMap((i) => [`mam-alas-${x}-${i}`, `mam-timones-${x}-${i}`])];
const POSICIONES_MAM = LADOS.flatMap((s) => SOPORTES.map((x) => s * x));

// Soporte bajo el ala: una aleta corta, casi tan larga como la cuerda.
const soporte = (x: number): Pieza => ({
  tipo: "caja", id: `soporte-${x}`, acabado: "gris", espejo: true, redondeo: 0.02,
  centro: [x, subidaAla(x) - 0.1, bordeAtaque(x) - 0.28], tam: [0.04, 0.14, 0.42],
});

// Cola en V invertida: cada superficie sale de lo alto de una viga y sube
// hacia el centro hasta juntarse con la otra, 1,04 m por encima (plano de
// frente y foto desde detrás). Contorno en su plano, [z, distancia a lo
// largo de la superficie], de la viga al vértice.
const COLA = { largo: 1.55, inclinacion: -47.5, baRaiz: -2.36, bsRaiz: -3.3, baPunta: -2.43, bsPunta: -3.03 };

// Bola de la torreta de sensores, como un torno de media circunferencia.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
const TORRETA = { y: -0.47, z: 1.72, r: 0.22 };

const PIEZAS: Pieza[] = [
  {
    // Cuerpo, del morro a la hélice: [z, medio ancho, altura del eje, medio
    // alto]. El morro es ancho y bajo, y cae por debajo del lomo; detrás del
    // ala el cuerpo se estrecha y se hace casi redondo alrededor del motor.
    tipo: "tubo", id: "fuselaje", acabado: "gris",
    perfil: [
      [3.25, 0, -0.27, 0], [3.21, 0.1, -0.27, 0.05], [3.14, 0.15, -0.255, 0.085], [3.0, 0.25, -0.23, 0.13],
      [2.8, 0.35, -0.2, 0.17], [2.53, 0.42, -0.165, 0.205], [2.31, 0.46, -0.135, 0.235], [1.96, 0.5, -0.09, 0.28],
      [1.6, 0.5, -0.065, 0.31], [1.33, 0.48, -0.05, 0.33], [0.84, 0.43, -0.03, 0.35], [0.35, 0.35, 0.0, 0.34],
      [0.0, 0.36, 0.035, 0.35], [-0.3, 0.4, 0.06, 0.33], [-0.5, 0.4, 0.075, 0.31], [-0.53, 0.3, 0.08, 0.27],
      [-0.56, 0.18, 0.1, 0.18], [-0.58, 0, 0.1, 0],
    ],
  },
  // Toma de aire del motor: una boca en media luna en el lomo, sobre el ala
  // (plano desde arriba y foto de frente).
  {
    tipo: "placa", id: "toma", acabado: "junta", plano: "horizontal", simetrica: true, y: 0.36, grosor: 0.03, bisel: 0.008,
    planta: [[0, 0.21], [0.1, 0.23], [0.19, 0.27], [0.25, 0.31], [0.26, 0.28], [0.2, 0.22], [0.11, 0.17], [0, 0.155]],
  },
  // Escape, que asoma bajo la panza delante de la hélice.
  { tipo: "varilla", id: "escape", acabado: "metal", desde: [0.12, -0.2, -0.28], hasta: [0.12, -0.3, -0.45], radio: 0.025 },
  // Sonda en la parte baja del morro.
  { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, -0.26, 3.2], hasta: [0, -0.28, 4.2], radio: 0.012 },
  // Dos aletas pequeñas a los lados del morro (plano desde arriba y foto
  // de IDEF).
  {
    tipo: "placa", id: "orejas", acabado: "gris", plano: "horizontal", y: -0.06, grosor: 0.025, espejo: true, bisel: 0.008,
    planta: [[0.4, 2.58], [0.62, 2.55], [0.62, 2.3], [0.4, 2.28]],
  },
  {
    // Carenado entre el fuselaje y el ala: el cuerpo se abre en una curva
    // ancha hasta el borde de ataque, a 1,4 m del centro, y por detrás el
    // borde de salida se curva hacia atrás hasta el motor.
    tipo: "placa", id: "carenado-ala", acabado: "gris", plano: "horizontal", simetrica: true, y: -0.05, grosor: 0.16, bisel: 0.06,
    planta: [
      [0, 1.8], [0.44, 1.78], [0.5, 1.66], [0.53, 1.45], [0.61, 1.23], [0.76, 1.05], [0.95, 0.9], [1.21, 0.79],
      [1.53, 0.73], [1.55, -0.11], [1.2, -0.12], [0.81, -0.15], [0.58, -0.21], [0.45, -0.26], [0.39, -0.3], [0, -0.3],
    ],
  },
  {
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor, subida].
    tipo: "ala", id: "ala", acabado: "gris", y: 0,
    estaciones: [
      [0, ALA.baRaiz, ALA.bsRaiz, ALA.tRaiz, 0],
      [ALA.punta, ALA.baPunta, ALA.bsPunta, ALA.tPunta, ALA.subida],
    ],
  },
  // Vigas de cola: del ala a la cola, con la punta redondeada delante.
  ...LADOS.map((s): Pieza => ({
    tipo: "tubo", id: `viga-${s}`, acabado: "gris", centro: [s * VIGA.x, VIGA.y],
    perfil: [
      [VIGA.delante, 0, 0], [VIGA.delante - 0.04, 0.035, 0], [VIGA.delante - 0.12, 0.05, 0],
      [VIGA.detras + 0.05, 0.05, 0.1], [VIGA.detras, 0, 0.1],
    ],
  })),
  {
    tipo: "placa", id: "cola", acabado: "gris", plano: "vertical", x: VIGA.x, y: VIGA.y + 0.11, grosor: 0.07,
    espejo: true, inclinacion: COLA.inclinacion, bisel: 0.02,
    planta: [[COLA.baRaiz, 0], [COLA.bsRaiz, 0], [COLA.bsPunta, COLA.largo], [COLA.baPunta, COLA.largo]],
  },
  // Hélice propulsora de dos palas y 1,7 m, detrás del motor, con un cono
  // largo y afilado.
  {
    tipo: "tubo", id: "cono", acabado: "gris", centro: [0, 0.16],
    perfil: [[-0.56, 0.17], [-0.6, 0.16], [-0.68, 0.145], [-0.76, 0.12], [-0.84, 0.08], [-0.91, 0.04], [-0.96, 0]],
  },
  { tipo: "helice", id: "helice", acabado: "negro", en: [0, 0.16, -0.7], radio: 0.86, palas: 2, giro: 60 },
  // Torreta de sensores bajo el cuerpo, delante del ala: una bola con la
  // ventana delante, colgada de un collar.
  { tipo: "disco", id: "torreta-collar", acabado: "gris", en: [0, -0.34, TORRETA.z], normal: [0, 1, 0], radio: 0.16, grosor: 0.06 },
  { tipo: "tubo", id: "torreta", acabado: "gris", centro: [0, TORRETA.y], perfil: esfera(TORRETA.z, TORRETA.r) },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: [0, TORRETA.y - 0.02, TORRETA.z + TORRETA.r - 0.01], normal: [0, -0.2, 1], radio: 0.11, grosor: 0.02 },
  // Soportes y bombas.
  ...SOPORTES.map(soporte),
  ...POSICIONES_MAM.flatMap(mam),
  // Tren triciclo fijo: la pata del morro, con un tirante, y dos patas que
  // salen hacia fuera de la panza, con 2 m entre ruedas.
  { tipo: "varilla", id: "pata-morro", acabado: "metal", desde: [0, -0.33, 2.28], hasta: [0, SUELO + 0.12, 2.43], radio: 0.025 },
  { tipo: "varilla", id: "tirante-morro", acabado: "metal", desde: [0, -0.34, 2.62], hasta: [0, -0.66, 2.36], radio: 0.015 },
  { tipo: "disco", id: "rueda-morro", acabado: "negro", en: [0, SUELO + 0.12, 2.43], normal: [1, 0, 0], radio: 0.12, grosor: 0.07 },
  { tipo: "varilla", id: "patas", acabado: "metal", espejo: true, desde: [0.36, -0.3, 0.38], hasta: [0.96, SUELO + 0.14, 0.44], radio: 0.03 },
  { tipo: "disco", id: "ruedas", acabado: "negro", espejo: true, en: [1.0, SUELO + 0.14, 0.44], normal: [1, 0, 0], radio: 0.14, grosor: 0.08 },
  { tipo: "disco", id: "bujes", acabado: "metal", espejo: true, en: [1.045, SUELO + 0.14, 0.44], normal: [1, 0, 0], radio: 0.06, grosor: 0.015 },
];

const PARTES: Parte[] = [
  {
    nombre: "Morro y torreta",
    en: [0, -0.8, 1.72],
    piezas: ["torreta", "torreta-collar", "torreta-ventana", "sonda", "orejas"],
    respaldo: "foto",
    fuentes: ["kiev", "radom", "frente", "baykar"],
    texto: "El morro es ancho y bajo. Debajo cuelga la bola de las cámaras, de día y térmica, con un láser que marca el blanco para las bombas. Es turca, de Aselsan, desde que en 2020 Canadá dejó de vender la suya a Turquía.",
    nota: "Qué lleva dentro sale de Baykar; la forma, de las fotos.",
  },
  {
    nombre: "Ala recta y larga",
    en: [4.2, 0.35, 0.3],
    piezas: ["ala", "carenado-ala"],
    respaldo: "foto",
    fuentes: ["vuelo", "arriba", "plano", "baykar"],
    texto: "12 m de punta a punta, casi el doble que el largo del dron, con las puntas un poco levantadas. Junto al cuerpo se ensancha en una curva que lo une al fuselaje.",
    nota: "La envergadura es la de Baykar; la cuerda y el diedro, medidos en el plano.",
  },
  {
    nombre: "Cuatro bombas MAM-L",
    en: [SOPORTES[1] + 0.25, MAM.y - 0.15, 0.5],
    piezas: [...SOPORTES.map((x) => `soporte-${x}`), ...POSICIONES_MAM.flatMap(idsMam)],
    respaldo: "foto",
    fuentes: ["vuelo", "radom", "despegue", "baykar"],
    texto: "Dos bajo cada ala. Es una bomba pequeña de Roketsan, de 1 m y unos 22 kg, que planea hasta el punto del láser de la torreta. En los cuatro soportes caben también las MAM-C, más finas, y otras municiones turcas.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.75, -0.6],
    piezas: ["helice", "cono", "toma", "escape"],
    respaldo: "foto",
    fuentes: ["detras", "perfil", "baykar"],
    texto: "Un motor de avioneta de unos 100 caballos en la parte de atrás del cuerpo, que mueve una hélice de dos palas y 1,7 m que empuja desde detrás. Al principio era el austriaco Rotax 912; cuando su fabricante dejó de venderlo en 2020, Baykar hizo el suyo.",
    nota: "El motor sale de Baykar y de la prensa; la hélice y la toma, de las fotos.",
  },
  {
    nombre: "Vigas y cola en V invertida",
    en: [0, 1.3, -2.7],
    piezas: ["viga-1", "viga--1", "cola"],
    respaldo: "foto",
    fuentes: ["detras", "arriba", "perfil", "plano"],
    texto: "Dos vigas salen del ala y llevan la cola, dos superficies que suben desde ellas y se juntan arriba, en el centro. La hélice gira en el hueco que queda entre las vigas.",
    nota: "El alto y el ángulo de la cola, medidos en el plano de frente y en la foto desde detrás.",
  },
  {
    nombre: "Tren de aterrizaje",
    en: [1.15, SUELO - 0.1, 0.44],
    piezas: ["patas", "ruedas", "bujes", "pata-morro", "tirante-morro", "rueda-morro"],
    respaldo: "foto",
    fuentes: ["frente", "despegue", "perfil"],
    texto: "Tres ruedas: una bajo el morro y dos en patas que salen de la panza hacia fuera. No se recogen: en las fotos en vuelo se ven siempre fuera.",
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
      return { ...p, y: u(p.y), estaciones: p.estaciones.map((e) => e.map(u) as typeof e) };
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
  nombre: "Bayraktar TB2",
  subtitulo: "Dron armado de media altitud",
  escala: ESCALA,  // 1 unidad = 4,5 m; medidas de Baykar
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: TURQUIA,
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "vuelo", imagen: "vuelo-armado.jpg", titulo: "En vuelo, desde arriba, con cuatro MAM-L", medio: "ArmyInform, Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2.jpg` },
    { id: "arriba", imagen: "arriba-ucrania.jpg", titulo: "Desde arriba, en una base ucraniana", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_01.jpg` },
    { id: "detras", imagen: "detras-ucrania.jpg", titulo: "Desde detrás: la cola, la hélice y el tren", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_06.jpg` },
    { id: "perfil", imagen: "perfil-ucrania.jpg", titulo: "De lado: una viga, la cola y el motor", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_07.jpg` },
    { id: "radom", imagen: "radom-armado.jpg", titulo: "Un TB2 polaco armado, en Radom en 2023", medio: "Boevaya mashina (Wikimedia Commons)", url: `${COMMONS}PAF_Bayraktar_TB2_at_Radom-2023.jpg` },
    { id: "kiev", imagen: "kiev-morro.jpg", titulo: "El morro, de cerca, en una feria en Kiev en 2019", medio: "Zinnsoldat (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2,_Kyiv,_2019_03.jpg` },
    { id: "frente", imagen: "frente-teknofest.jpg", titulo: "De frente, en Teknofest 2019", medio: "Kingbjelica (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_S-%C4%B0HA,_Teknofest_2019.jpg` },
    { id: "despegue", imagen: "despegue-armado.jpg", titulo: "Despegando, armado", medio: "Fuerza Aérea de Ucrania (Wikimedia Commons)", url: `${COMMONS}Ukrainian_bayraktar.jpg` },
    { id: "plano", imagen: "plano-cinco-vistas.jpg", titulo: "Plano de cinco vistas, a escala", medio: "Alexpl (Wikimedia Commons)", url: `${COMMONS}Bayraktar-TB2-draw.svg` },
    { id: "baykar", titulo: "Bayraktar TB2 (ficha técnica)", medio: "Baykar", url: BAYKAR },
  ],
};

export default maqueta;
