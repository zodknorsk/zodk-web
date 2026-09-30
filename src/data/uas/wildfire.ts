// Maqueta del Wildfire de General Atomics, sacada de los renders que publicó
// la empresa en septiembre de 2026 (todavía no hay fotos del dron real).
// No hay medidas publicadas: la planta es casi la del MQ-9A Reaper, así que
// se usan sus proporciones (unos 20 m de envergadura y 11 m de largo).
// 1 unidad ≈ 7,8 m. Imágenes a tamaño completo en arte/uas-fuentes/wildfire/
// (fuera de Git; enlaces en docs/uas.md).
import type { Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const COMUNICADO = "https://www.ga-asi.com/ga-asi-unveils-wildfire-uas-for-military-civil-and-commercial-roles";
const TWZ = "https://www.twz.com/air/first-look-at-general-atomics-wildfire-its-successor-to-the-mq-9-reaper";
const TWZ_AGOSTO = "https://www.twz.com/air/wildfire-is-general-atomics-successor-to-the-mq-9-reaper";
const NEW_ATLAS = "https://newatlas.com/military/general-atomics-wildfire-combat-drone/";

// Ala: altura, punta y bordes en la raíz y en la punta. El ala cruza el
// fuselaje hacia el 40 % de su largo, como en el render visto desde arriba.
const ALA = { y: 0.03, punta: 1.25, baRaiz: 0.06, bsRaiz: -0.13, baPunta: 0.0, bsPunta: -0.07 };
const bordeSalida = (x: number) => ALA.bsRaiz + ((ALA.bsPunta - ALA.bsRaiz) * x) / ALA.punta;

// Soporte de armas bajo cada ala, cerca del fuselaje, con dos JSM uno al lado
// del otro (render del enjambre y detalle de TWZ).
const SOPORTE = { x: 0.36, z: -0.03 };
const JSM = [SOPORTE.x - 0.05, SOPORTE.x + 0.05];

// JSM, como salen en los renders: romos delante, con una boca oscura, y
// afilados detrás, con dos aletas.
const misil = (x: number): Pieza[] => [
  {
    tipo: "tubo", id: `jsm-${x}`, acabado: "gris", centro: [x, -0.094], seccion: [1.12, 0.88],
    perfil: [
      [0.23, 0], [0.228, 0.016], [0.22, 0.024], [0.2, 0.028], [-0.1, 0.028], [-0.18, 0.02], [-0.24, 0.006], [-0.25, 0],
    ],
  },
  { tipo: "disco", id: `jsm-boca-${x}`, acabado: "junta", en: [x, -0.094, 0.231], normal: [0, 0, 1], radio: 0.011, grosor: 0.002 },
  {
    tipo: "placa", id: `jsm-aletas-${x}`, acabado: "gris", plano: "horizontal", y: -0.094, grosor: 0.004,
    planta: [[x - 0.015, -0.17], [x + 0.015, -0.17], [x + 0.036, -0.215], [x + 0.036, -0.23], [x - 0.036, -0.23], [x - 0.036, -0.215]],
  },
];
const PIEZAS_JSM = (x: number) => [`jsm-${x}`, `jsm-boca-${x}`, `jsm-aletas-${x}`];

// Carenados de los mandos del ala: bultos pequeños bajo el borde de salida,
// dos por ala (se ven en el render desde arriba).
const carenado = (x: number): Pieza => ({
  tipo: "caja", id: `carenado-${x}`, acabado: "gris", espejo: true, redondeo: 0.008,
  centro: [x, ALA.y - 0.014, bordeSalida(x) + 0.005], tam: [0.022, 0.018, 0.075],
});
const CARENADOS = [0.62, 1.02];

const maqueta: Maqueta = {
  nombre: "Wildfire",
  subtitulo: "Dron armado de media altitud y gran autonomía",
  escala: 7.8,  // 1 unidad ≈ 7,8 m: unos 20 m de envergadura, como el Reaper (sin medidas oficiales)
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: bandera("US"),
  piezas: [
    {
      // Morro abultado y redondeado, sin la joroba de la antena de satélite
      // del Reaper. Más alto que ancho; detrás del ala se vuelve a ensanchar
      // donde va el motor y termina en la hélice.
      tipo: "tubo", id: "fuselaje", acabado: "gris", seccion: [0.86, 1.15],
      perfil: [
        [0.64, 0], [0.637, 0.025], [0.627, 0.043], [0.608, 0.057], [0.58, 0.067], [0.54, 0.074],
        [0.46, 0.079], [0.32, 0.08], [0.16, 0.076], [0.0, 0.069], [-0.14, 0.06],
        [-0.28, 0.052], [-0.4, 0.053], [-0.48, 0.054], [-0.57, 0.048], [-0.65, 0.038],
        [-0.71, 0.028], [-0.73, 0],
      ],
    },
    {
      // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor].
      // Recta, larga y estrecha, con más cuerda en la raíz.
      tipo: "ala", id: "ala", acabado: "gris", y: ALA.y,
      estaciones: [
        [0, ALA.baRaiz, ALA.bsRaiz, 0.042],
        [ALA.punta, ALA.baPunta, ALA.bsPunta, 0.016],
      ],
    },
    ...CARENADOS.map(carenado),
    {
      // Winglets caídos en las puntas, un poco abiertos hacia fuera.
      tipo: "placa", id: "winglets", acabado: "gris", plano: "vertical", x: ALA.punta, grosor: 0.009,
      espejo: true, inclinacion: -20, bisel: 0.003,
      planta: [[ALA.baPunta, ALA.y], [ALA.bsPunta, ALA.y], [ALA.bsPunta - 0.02, ALA.y - 0.1], [ALA.baPunta - 0.035, ALA.y - 0.1]],
    },
    {
      // Toma de aire del motor: un bulto redondo encima de la parte trasera,
      // delante de la cola, con la boca mirando hacia delante.
      tipo: "tubo", id: "toma", acabado: "gris", centro: [0, 0.052], seccion: [1, 0.95],
      perfil: [[-0.31, 0.03], [-0.322, 0.038], [-0.35, 0.042], [-0.43, 0.042], [-0.51, 0.034], [-0.58, 0.016], [-0.61, 0]],
    },
    { tipo: "disco", id: "toma-boca", acabado: "junta", en: [0, 0.052, -0.309], normal: [0, 0, 1], radio: 0.025, grosor: 0.003 },
    {
      // Cola en V hacia arriba, como la del Reaper: dos superficies largas y
      // en flecha que salen de los lados de la zona del motor.
      tipo: "placa", id: "cola", acabado: "gris", plano: "vertical", x: 0, grosor: 0.013,
      espejo: true, inclinacion: 45, bisel: 0.004,
      planta: [[-0.51, 0], [-0.68, 0], [-0.77, 0.41], [-0.69, 0.41]],
    },
    {
      // Aleta bajo la cola, que protege la hélice al despegar.
      tipo: "placa", id: "aleta-ventral", acabado: "gris", plano: "vertical", x: 0, grosor: 0.013, bisel: 0.004,
      planta: [[-0.53, 0], [-0.67, 0], [-0.73, -0.19], [-0.66, -0.19]],
    },
    {
      // Antena de pala bajo la parte trasera del fuselaje.
      tipo: "placa", id: "antena", acabado: "gris", plano: "vertical", x: 0, grosor: 0.009, bisel: 0.003,
      planta: [[-0.16, -0.03], [-0.25, -0.03], [-0.3, -0.17], [-0.24, -0.17]],
    },
    // Antenas pequeñas en el lomo (los puntos del render desde arriba).
    {
      tipo: "placa", id: "antenas-lomo", acabado: "gris", plano: "vertical", x: 0, grosor: 0.006, bisel: 0.002,
      planta: [[0.26, 0.07], [0.22, 0.07], [0.21, 0.105], [0.235, 0.105]],
    },
    {
      tipo: "placa", id: "antenas-lomo-2", acabado: "gris", plano: "vertical", x: 0, grosor: 0.006, bisel: 0.002,
      planta: [[-0.14, 0.06], [-0.18, 0.06], [-0.19, 0.09], [-0.165, 0.09]],
    },
    // Torreta de sensores bajo el morro: una bola sobre un soporte, con dos
    // ventanas delante.
    { tipo: "varilla", id: "torreta-soporte", acabado: "gris", desde: [0, -0.05, 0.5], hasta: [0, -0.078, 0.5], radio: 0.024 },
    {
      tipo: "tubo", id: "torreta", acabado: "gris", centro: [0, -0.107],
      perfil: [[0.5360, 0], [0.5348, 0.0093], [0.5312, 0.0180], [0.5255, 0.0255], [0.5180, 0.0312], [0.5093, 0.0348], [0.5000, 0.0360], [0.4907, 0.0348], [0.4820, 0.0312], [0.4745, 0.0255], [0.4688, 0.0180], [0.4652, 0.0093], [0.4640, 0]],
    },
    { tipo: "disco", id: "torreta-objetivo", acabado: "lente", en: [-0.006, -0.107, 0.535], normal: [0, 0, 1], radio: 0.017, grosor: 0.004 },
    { tipo: "disco", id: "torreta-objetivo-2", acabado: "lente", en: [0.021, -0.094, 0.527], normal: [0.45, 0.25, 1], radio: 0.008, grosor: 0.003 },
    // Sonda en lo alto del morro.
    { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, 0.04, 0.59], hasta: [0, 0.05, 0.72], radio: 0.0035 },
    // Hélice propulsora al final del cuerpo, con su cono.
    {
      tipo: "tubo", id: "cono", acabado: "gris",
      perfil: [[-0.728, 0.028], [-0.76, 0.026], [-0.79, 0.017], [-0.81, 0.005], [-0.815, 0]],
    },
    { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0, -0.755], radio: 0.15, palas: 3 },
    // Soportes con dos JSM cada uno.
    {
      tipo: "placa", id: "soportes", acabado: "gris", plano: "vertical", x: SOPORTE.x, grosor: 0.016, espejo: true, bisel: 0.004,
      planta: [[SOPORTE.z + 0.1, 0.03], [SOPORTE.z - 0.09, 0.03], [SOPORTE.z - 0.07, -0.058], [SOPORTE.z + 0.07, -0.058]],
    },
    {
      tipo: "caja", id: "soportes-doble", acabado: "gris", espejo: true, redondeo: 0.006,
      centro: [SOPORTE.x, -0.062, SOPORTE.z], tam: [0.12, 0.012, 0.15],
    },
    ...JSM.flatMap((x) => [...misil(x), ...misil(-x)]),
  ],
  partes: [
    {
      nombre: "Morro sin joroba",
      en: [0, 0.085, 0.4],
      piezas: ["fuselaje", "sonda", "antenas-lomo", "antenas-lomo-2"],
      respaldo: "fabricante",
      fuentes: ["morro", "comparacion", "twz"],
      texto: "Donde el Reaper tiene la joroba con la antena de satélite, el Wildfire tiene un morro liso y abultado, que recuerda a los Gnat de los años noventa. General Atomics dice que se controlará a través de constelaciones de satélites en órbita baja, del tipo de Starlink, con antenas más pequeñas.",
      nota: "Se ve en los renders de General Atomics; aún no hay fotos del dron real.",
    },
    {
      nombre: "Torreta de sensores",
      en: [0, -0.16, 0.5],
      piezas: ["torreta", "torreta-soporte", "torreta-objetivo", "torreta-objetivo-2"],
      respaldo: "fabricante",
      fuentes: ["morro", "banda"],
      texto: "Una bola con cámaras bajo el morro, colgada de un soporte corto, como la de los últimos Reaper. Qué sensores lleva no se ha publicado.",
      nota: "Se ve en los renders; el modelo de la torreta no es público.",
    },
    {
      nombre: "Ala recta y larga",
      en: [0.85, 0.055, -0.05],
      piezas: ["ala", "winglets", ...CARENADOS.map((x) => `carenado-${x}`)],
      respaldo: "fabricante",
      fuentes: ["lrasm", "comparacion", "twz-agosto"],
      texto: "Ala recta, larga y estrecha, con las puntas caídas y los carenados de los mandos bajo el borde de salida. La planta es casi la del Reaper, de unos 20 m de envergadura. General Atomics dice que podrá volar más de 8.000 millas náuticas (unos 14.800 km) de un tirón.",
      nota: "No hay medidas publicadas: la envergadura y la forma de las puntas son a ojo, con las proporciones del Reaper.",
    },
    {
      nombre: "Toma de aire del motor",
      en: [0, 0.1, -0.42],
      piezas: ["toma", "toma-boca"],
      respaldo: "fabricante",
      fuentes: ["lrasm"],
      texto: "Un bulto redondo encima de la parte trasera, delante de la cola, con la boca hacia delante: por ahí respira el motor, que va dentro del fuselaje, detrás del ala.",
      nota: "Se ve en el render desde arriba; el motor no se ha dicho.",
    },
    {
      nombre: "Cola en V y aleta ventral",
      en: [0.19, 0.2, -0.69],
      piezas: ["cola", "aleta-ventral"],
      respaldo: "fabricante",
      fuentes: ["lrasm", "banda"],
      texto: "Dos superficies en V hacia arriba y una aleta por debajo, que protege la hélice al despegar y aterrizar. Es la misma cola en Y del Reaper.",
      nota: "Se ven en los renders; el ángulo de la V es a ojo.",
    },
    {
      nombre: "Antena de pala",
      en: [0, -0.2, -0.26],
      piezas: ["antena"],
      respaldo: "fabricante",
      fuentes: ["twz", "banda"],
      texto: "Una antena grande en forma de pala bajo la parte trasera del fuselaje, como en los últimos Reaper.",
    },
    {
      nombre: "Hélice propulsora",
      en: [0.14, 0, -0.76],
      piezas: ["helice", "cono"],
      respaldo: "reconstruccion",
      fuentes: ["twz", "new-atlas"],
      texto: "Una hélice que empuja desde el final del cuerpo, como en toda la familia del Predator y el Reaper. El motor no se ha dicho; lo más probable es un turbohélice.",
      nota: "En los renders la hélice sale borrosa: el número de palas es supuesto.",
    },
    {
      nombre: "Cuatro misiles JSM",
      en: [JSM[1] + 0.06, -0.11, 0.08],
      piezas: ["soportes", "soportes-doble", ...JSM.flatMap((x) => [...PIEZAS_JSM(x), ...PIEZAS_JSM(-x)])],
      respaldo: "fabricante",
      fuentes: ["jsm", "comunicado", "banda"],
      texto: "Un soporte bajo cada ala con dos misiles de crucero JSM, antibuque y de ataque a tierra. General Atomics dice que puede llevar cuatro JSM o dos misiles antibuque LRASM, el doble de lo que pedía el concurso.",
      nota: "Así salen en los renders, romos delante y afilados detrás; la carga máxima no se ha publicado (el concurso pide al menos 1.270 kg).",
    },
  ],
  fuentes: [
    { id: "comunicado", imagen: "gaasi-comunicado.jpg", titulo: "Un enjambre de Wildfire sobre el mar, con misiles JSM", medio: "General Atomics", url: COMUNICADO },
    { id: "comparacion", imagen: "twz-comparacion.jpg", titulo: "El render del Wildfire junto a un MQ-9A Reaper", medio: "The War Zone", url: TWZ },
    { id: "morro", imagen: "twz-morro.jpg", titulo: "El morro sin joroba y la torreta", medio: "The War Zone", url: TWZ },
    { id: "jsm", imagen: "twz-jsm.jpg", titulo: "Dos JSM en el soporte de un ala", medio: "The War Zone", url: TWZ },
    { id: "lrasm", imagen: "na-lrasm.jpg", titulo: "Visto desde arriba, lanzando un LRASM", medio: "General Atomics (New Atlas)", url: NEW_ATLAS },
    { id: "banda", imagen: "na-banda.jpg", titulo: "Desde abajo, con cuatro JSM", medio: "General Atomics (New Atlas)", url: NEW_ATLAS },
    { id: "twz", titulo: "First Look At General Atomics' Wildfire, Its Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ },
    { id: "twz-agosto", titulo: "Wildfire Is General Atomics' Successor To The MQ-9 Reaper", medio: "The War Zone", url: TWZ_AGOSTO },
    { id: "new-atlas", titulo: "General Atomics Unveils Wildfire UAS to Replace MQ-9 Reaper", medio: "New Atlas", url: NEW_ATLAS },
  ],
};

export default maqueta;
