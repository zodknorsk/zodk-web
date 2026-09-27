// Maqueta del Skydio X10D, sacada de las fotos de Skydio y del Ejército de
// Tierra y de las medidas oficiales (desplegado, 79 x 65 x 14,5 cm con
// hélices; plegado, 35 x 16,5 x 12 cm). 1 unidad ≈ 25 cm. Las formas son
// simplificadas: el cuerpo real tiene más aristas, rejillas y tapas. Fotos a tamaño completo en
// arte/uas-fuentes/skydio-x10d/ (fuera de Git; enlaces en logo-files/UAS-WIP.md).
import type { Maqueta } from "./tipos";
import { PAISES_LUNA } from "../alunizajes";

const SKYDIO = "https://www.skydio.com/x10d";
const FICHA_TECNICA = "https://www.skydio.com/x10/technical-specs";
const LETONIA = "https://www.infodefensa.com/texto-diario/mostrar/6026918/ejercito-avanza-incorporacion-dron-x10d-elige-letonia-despliegue-operaciones-exterior";

// Motores: delante más bajos que detrás, como en las fotos (los brazos
// traseros salen de la parte alta del cuerpo).
const DELANTE = { x: 1.0, y: 0.06, z: 0.7 };
const DETRAS = { x: 1.0, y: 0.26, z: -0.75 };

// Brazo plano que se estrecha hacia el motor: planta [x, z] de la bisagra al
// motor, con su ancho en cada punta.
function brazo(x1: number, z1: number, x2: number, z2: number, ancho1: number, ancho2: number): [number, number][] {
  const largo = Math.hypot(x2 - x1, z2 - z1);
  const nx = -(z2 - z1) / largo, nz = (x2 - x1) / largo;
  return [
    [x1 + (nx * ancho1) / 2, z1 + (nz * ancho1) / 2],
    [x2 + (nx * ancho2) / 2, z2 + (nz * ancho2) / 2],
    [x2 - (nx * ancho2) / 2, z2 - (nz * ancho2) / 2],
    [x1 - (nx * ancho1) / 2, z1 - (nz * ancho1) / 2],
  ];
}

const maqueta: Maqueta = {
  nombre: "Skydio X10D",
  subtitulo: "Microdrón de reconocimiento",
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: PAISES_LUNA.find((p) => p.codigo === "US")!,
  piezas: [
    // Cuerpo en dos pisos, con forma de hueso vista desde arriba: ancho
    // delante y detrás (donde se articulan los brazos) y estrecho en medio.
    {
      tipo: "placa", id: "cuerpo", acabado: "gris", plano: "horizontal", simetrica: true, bisel: 0.045,
      y: 0.23, grosor: 0.18,
      planta: [
        [0, 0.58], [0.17, 0.58], [0.24, 0.5], [0.27, 0.4], [0.19, 0.27], [0.17, 0.05],
        [0.17, -0.3], [0.28, -0.5], [0.32, -0.62], [0.25, -0.72], [0, -0.72],
      ],
    },
    {
      tipo: "placa", id: "cuerpo-bajo", acabado: "gris", plano: "horizontal", simetrica: true, bisel: 0.045,
      y: 0.05, grosor: 0.18,
      planta: [
        [0, 0.6], [0.21, 0.6], [0.29, 0.46], [0.29, 0.34], [0.19, 0.2], [0.19, -0.4], [0.25, -0.6], [0, -0.68],
      ],
    },
    // Sensor VT300: cuelga delante, con el bloque de rejillas detrás y sus
    // tres objetivos (el grande, el teleobjetivo y la térmica).
    { tipo: "caja", id: "sensor", acabado: "gris", centro: [-0.01, -0.02, 0.73], tam: [0.24, 0.26, 0.22], redondeo: 0.07 },
    { tipo: "caja", id: "sensor-rejilla", acabado: "metal", centro: [0.02, 0.03, 0.56], tam: [0.2, 0.2, 0.16], redondeo: 0.03 },
    { tipo: "disco", id: "objetivos", acabado: "lente", en: [-0.06, -0.005, 0.845], normal: [0, 0, 1], radio: 0.055, grosor: 0.012 },
    { tipo: "disco", id: "objetivos-2", acabado: "lente", en: [0.05, 0.05, 0.845], normal: [0, 0, 1], radio: 0.04, grosor: 0.012 },
    { tipo: "disco", id: "objetivos-3", acabado: "lente", en: [0.05, -0.065, 0.845], normal: [0, 0, 1], radio: 0.042, grosor: 0.012 },
    // Protección de fibra de carbono: un marco plano sobre el sensor que baja
    // por los lados.
    { tipo: "varilla", id: "proteccion", acabado: "negro", desde: [0.19, 0.27, 0.5], hasta: [0.19, 0.27, 0.88], radio: 0.018, espejo: true },
    { tipo: "varilla", id: "proteccion-frente", acabado: "negro", desde: [-0.19, 0.27, 0.88], hasta: [0.19, 0.27, 0.88], radio: 0.018 },
    { tipo: "varilla", id: "proteccion-bajada", acabado: "negro", desde: [0.19, 0.27, 0.88], hasta: [0.19, -0.08, 0.8], radio: 0.018, espejo: true },
    // Cámaras de navegación: tres arriba y tres abajo.
    { tipo: "disco", id: "navegacion", acabado: "lente", en: [0.19, 0.325, 0.42], normal: [0, 1, 0], radio: 0.04, grosor: 0.01, espejo: true },
    { tipo: "disco", id: "navegacion-2", acabado: "lente", en: [0, 0.325, -0.6], normal: [0, 1, 0], radio: 0.04, grosor: 0.01 },
    { tipo: "disco", id: "navegacion-3", acabado: "lente", en: [0.2, -0.045, 0.42], normal: [0, -1, 0], radio: 0.04, grosor: 0.01, espejo: true },
    { tipo: "disco", id: "navegacion-4", acabado: "lente", en: [0, -0.045, -0.55], normal: [0, -1, 0], radio: 0.04, grosor: 0.01 },
    // Brazos plegables, planos y más estrechos hacia el motor.
    {
      tipo: "placa", id: "brazos", acabado: "gris", plano: "horizontal", espejo: true, bisel: 0.015,
      y: DELANTE.y, grosor: 0.07, planta: brazo(0.24, 0.42, DELANTE.x, DELANTE.z, 0.16, 0.09),
    },
    {
      tipo: "placa", id: "brazos-2", acabado: "gris", plano: "horizontal", espejo: true, bisel: 0.015,
      y: DETRAS.y, grosor: 0.07, planta: brazo(0.26, -0.56, DETRAS.x, DETRAS.z, 0.16, 0.09),
    },
    // Motores y hélices de tres palas.
    { tipo: "varilla", id: "motores", acabado: "negro", desde: [DELANTE.x, DELANTE.y - 0.04, DELANTE.z], hasta: [DELANTE.x, DELANTE.y + 0.1, DELANTE.z], radio: 0.075, espejo: true },
    { tipo: "varilla", id: "motores-2", acabado: "negro", desde: [DETRAS.x, DETRAS.y - 0.04, DETRAS.z], hasta: [DETRAS.x, DETRAS.y + 0.1, DETRAS.z], radio: 0.075, espejo: true },
    { tipo: "helice", id: "helices", acabado: "negro", eje: "y", espejo: true, en: [DELANTE.x, DELANTE.y + 0.12, DELANTE.z], radio: 0.55, palas: 3 },
    { tipo: "helice", id: "helices-2", acabado: "negro", eje: "y", espejo: true, en: [DETRAS.x, DETRAS.y + 0.12, DETRAS.z], radio: 0.55, palas: 3 },
    // Patas: una hoja plana bajo cada motor, más estrecha abajo.
    {
      tipo: "placa", id: "patas", acabado: "gris", plano: "vertical", x: DELANTE.x, grosor: 0.04, espejo: true, bisel: 0.01,
      planta: [[DELANTE.z - 0.09, DELANTE.y], [DELANTE.z + 0.09, DELANTE.y], [DELANTE.z + 0.05, -0.42], [DELANTE.z - 0.02, -0.42]],
    },
    {
      tipo: "placa", id: "patas-2", acabado: "gris", plano: "vertical", x: DETRAS.x, grosor: 0.04, espejo: true, bisel: 0.01,
      planta: [[DETRAS.z - 0.09, DETRAS.y], [DETRAS.z + 0.09, DETRAS.y], [DETRAS.z + 0.02, -0.42], [DETRAS.z - 0.05, -0.42]],
    },
  ],
  partes: [
    {
      nombre: "Sensor VT300",
      en: [0, 0.14, 0.86],
      piezas: ["sensor", "sensor-rejilla", "objetivos", "objetivos-2", "objetivos-3"],
      respaldo: "foto",
      fuentes: ["frente", "militar", "ficha"],
      texto: "Cámara estabilizada que va delante del cuerpo y gira para mirar hacia arriba o hacia abajo. Lleva una cámara térmica FLIR Boson+ (640 x 512) y dos cámaras de 48 a 64 megapíxeles; la versión Z tiene teleobjetivo y la L, gran angular y un foco de 1.000 lúmenes.",
      nota: "El sensor es intercambiable: VT300-Z o VT300-L.",
    },
    {
      nombre: "Cámaras de navegación",
      en: [0.19, 0.35, 0.42],
      piezas: ["navegacion", "navegacion-2", "navegacion-3", "navegacion-4"],
      respaldo: "fabricante",
      fuentes: ["ficha", "arriba"],
      texto: "Seis cámaras de ojo de pez, tres arriba y tres abajo, que ven 360° a su alrededor hasta 20 m. Con ellas esquiva obstáculos y sabe dónde está sin GPS; en el X10D, también a oscuras (NightSense).",
      nota: "Su sitio exacto en el cuerpo es aproximado.",
    },
    {
      nombre: "Brazos plegables",
      en: [0.62, 0.1, 0.56],
      piezas: ["brazos", "brazos-2"],
      respaldo: "foto",
      fuentes: ["plegado", "arriba"],
      texto: "Los cuatro brazos se pliegan pegados al cuerpo: así mide 35 x 16,5 x 12 cm y cabe en una mochila. Desplegado, en menos de 40 segundos está listo para volar.",
    },
    {
      nombre: "Motores y hélices",
      en: [DETRAS.x, DETRAS.y + 0.18, DETRAS.z],
      piezas: ["motores", "motores-2", "helices", "helices-2"],
      respaldo: "foto",
      fuentes: ["arriba", "frente"],
      texto: "Cuatro motores eléctricos con hélices plegables de tres palas. Los de atrás van más altos que los de delante, para que las hélices no choquen. Hasta 72 km/h y 40 minutos de vuelo.",
    },
    {
      nombre: "Cuerpo y batería",
      en: [0, 0.34, -0.2],
      piezas: ["cuerpo", "cuerpo-bajo"],
      respaldo: "fabricante",
      fuentes: ["ficha", "plegado"],
      texto: "Cuerpo cerrado en dos pisos, estrecho en el centro y ancho donde se articulan los brazos, resistente al agua y al polvo (IP55). Lleva una batería de 154 Wh; con ella pesa 2,11 kg.",
      nota: "La forma está simplificada: el real tiene más aristas, rejillas y tapas.",
    },
    {
      nombre: "Patas",
      en: [DELANTE.x, -0.28, DELANTE.z + 0.02],
      piezas: ["patas", "patas-2"],
      respaldo: "foto",
      fuentes: ["frente", "militar"],
      texto: "Cada brazo termina en una pata, así que no necesita tren de aterrizaje aparte. Se puede lanzar y recoger a mano, como en la foto del Ejército de Tierra.",
    },
  ],
  fuentes: [
    { id: "arriba", imagen: "desplegado.jpg", titulo: "Desplegado y en vuelo, visto desde arriba", medio: "Skydio", url: SKYDIO },
    { id: "frente", imagen: "frente.jpg", titulo: "De frente, con el sensor VT300", medio: "Skydio", url: SKYDIO },
    { id: "plegado", imagen: "plegado.jpg", titulo: "Plegado", medio: "Skydio", url: SKYDIO },
    { id: "militar", imagen: "ejercito-tierra.jpg", titulo: "Un militar del Ejército de Tierra con el X10D", medio: "Ejército de Tierra (Infodefensa)", url: LETONIA },
    { id: "ficha", titulo: "Ficha técnica del X10", medio: "Skydio", url: FICHA_TECNICA },
  ],
};

export default maqueta;
