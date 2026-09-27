// Maqueta del Skydio X10D, sacada de las fotos de Skydio y del Ejército de
// Tierra y de las medidas oficiales (desplegado, 79 x 65 x 14,5 cm con
// hélices; plegado, 35 x 16,5 x 12 cm). 1 unidad ≈ 25 cm. Las formas son
// simplificadas: el cuerpo real es más redondeado. Fotos a tamaño completo en
// arte/uas-fuentes/skydio-x10d/ (fuera de Git; enlaces en logo-files/UAS-WIP.md).
import type { Maqueta } from "./tipos";
import { PAISES_LUNA } from "../alunizajes";

const SKYDIO = "https://www.skydio.com/x10d";
const FICHA_TECNICA = "https://www.skydio.com/x10/technical-specs";
const LETONIA = "https://www.infodefensa.com/texto-diario/mostrar/6026918/ejercito-avanza-incorporacion-dron-x10d-elige-letonia-despliegue-operaciones-exterior";

// Motores: delante más bajos que detrás, como en las fotos (los brazos
// traseros salen de la parte alta del cuerpo).
const DELANTE = { x: 1.0, y: 0.08, z: 0.7 };
const DETRAS = { x: 1.0, y: 0.25, z: -0.75 };

const maqueta: Maqueta = {
  nombre: "Skydio X10D",
  subtitulo: "Microdrón de reconocimiento",
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: PAISES_LUNA.find((p) => p.codigo === "US")!,
  piezas: [
    // Cuerpo alargado y, encima de la parte de atrás, la batería.
    { tipo: "caja", id: "cuerpo", acabado: "gris", centro: [0, 0.1, -0.05], tam: [0.56, 0.3, 1.3] },
    { tipo: "caja", id: "bateria", acabado: "gris", centro: [0, 0.29, -0.32], tam: [0.46, 0.1, 0.62] },
    // Sensor VT300 delante, con sus tres objetivos (el grande, el
    // teleobjetivo y la térmica).
    { tipo: "caja", id: "sensor", acabado: "gris", centro: [0, 0.02, 0.74], tam: [0.34, 0.3, 0.24] },
    { tipo: "disco", id: "objetivos", acabado: "lente", en: [-0.07, 0.05, 0.865], normal: [0, 0, 1], radio: 0.07, grosor: 0.012 },
    { tipo: "disco", id: "objetivos-2", acabado: "lente", en: [0.085, 0.09, 0.865], normal: [0, 0, 1], radio: 0.045, grosor: 0.012 },
    { tipo: "disco", id: "objetivos-3", acabado: "lente", en: [0.085, -0.05, 0.865], normal: [0, 0, 1], radio: 0.045, grosor: 0.012 },
    // Protección de fibra de carbono alrededor del sensor.
    { tipo: "varilla", id: "proteccion", acabado: "negro", desde: [0.21, 0.22, 0.55], hasta: [0.21, 0.22, 0.92], radio: 0.02, espejo: true },
    { tipo: "varilla", id: "proteccion-frente", acabado: "negro", desde: [-0.21, 0.22, 0.92], hasta: [0.21, 0.22, 0.92], radio: 0.02 },
    { tipo: "varilla", id: "proteccion-bajada", acabado: "negro", desde: [0.21, 0.22, 0.92], hasta: [0.21, -0.12, 0.92], radio: 0.02, espejo: true },
    // Cámaras de navegación: tres arriba y tres abajo.
    { tipo: "disco", id: "navegacion", acabado: "lente", en: [0.16, 0.255, 0.45], normal: [0, 1, 0], radio: 0.045, grosor: 0.01, espejo: true },
    { tipo: "disco", id: "navegacion-2", acabado: "lente", en: [0, 0.345, -0.55], normal: [0, 1, 0], radio: 0.045, grosor: 0.01 },
    { tipo: "disco", id: "navegacion-3", acabado: "lente", en: [0.16, -0.055, 0.45], normal: [0, -1, 0], radio: 0.045, grosor: 0.01, espejo: true },
    { tipo: "disco", id: "navegacion-4", acabado: "lente", en: [0, -0.055, -0.55], normal: [0, -1, 0], radio: 0.045, grosor: 0.01 },
    // Brazos plegables.
    { tipo: "varilla", id: "brazos", acabado: "gris", desde: [0.26, DELANTE.y, 0.35], hasta: [DELANTE.x, DELANTE.y, DELANTE.z], radio: 0.05, espejo: true },
    { tipo: "varilla", id: "brazos-2", acabado: "gris", desde: [0.26, DETRAS.y, -0.45], hasta: [DETRAS.x, DETRAS.y, DETRAS.z], radio: 0.05, espejo: true },
    // Motores y hélices bipala.
    { tipo: "varilla", id: "motores", acabado: "negro", desde: [DELANTE.x, DELANTE.y - 0.05, DELANTE.z], hasta: [DELANTE.x, DELANTE.y + 0.09, DELANTE.z], radio: 0.075, espejo: true },
    { tipo: "varilla", id: "motores-2", acabado: "negro", desde: [DETRAS.x, DETRAS.y - 0.05, DETRAS.z], hasta: [DETRAS.x, DETRAS.y + 0.09, DETRAS.z], radio: 0.075, espejo: true },
    { tipo: "helice", id: "helices", acabado: "negro", eje: "y", espejo: true, en: [DELANTE.x, DELANTE.y + 0.11, DELANTE.z], radio: 0.55, palas: 2 },
    { tipo: "helice", id: "helices-2", acabado: "negro", eje: "y", espejo: true, en: [DETRAS.x, DETRAS.y + 0.11, DETRAS.z], radio: 0.55, palas: 2 },
    // Patas: bajan de la punta de cada brazo.
    { tipo: "varilla", id: "patas", acabado: "gris", desde: [DELANTE.x, DELANTE.y, DELANTE.z], hasta: [DELANTE.x, -0.42, DELANTE.z + 0.04], radio: 0.035, espejo: true },
    { tipo: "varilla", id: "patas-2", acabado: "gris", desde: [DETRAS.x, DETRAS.y, DETRAS.z], hasta: [DETRAS.x, -0.42, DETRAS.z - 0.04], radio: 0.035, espejo: true },
  ],
  partes: [
    {
      nombre: "Sensor VT300",
      en: [0, 0.2, 0.86],
      piezas: ["sensor", "objetivos", "objetivos-2", "objetivos-3"],
      respaldo: "foto",
      fuentes: ["frente", "militar", "ficha"],
      texto: "Cámara estabilizada que va delante del cuerpo y gira para mirar hacia arriba o hacia abajo. Lleva una cámara térmica FLIR Boson+ (640 x 512) y dos cámaras de 48 a 64 megapíxeles; la versión Z tiene teleobjetivo y la L, gran angular y un foco de 1.000 lúmenes.",
      nota: "El sensor es intercambiable: VT300-Z o VT300-L.",
    },
    {
      nombre: "Cámaras de navegación",
      en: [0.16, 0.27, 0.45],
      piezas: ["navegacion", "navegacion-2", "navegacion-3", "navegacion-4"],
      respaldo: "fabricante",
      fuentes: ["ficha", "arriba"],
      texto: "Seis cámaras de ojo de pez, tres arriba y tres abajo, que ven 360° a su alrededor hasta 20 m. Con ellas esquiva obstáculos y sabe dónde está sin GPS; en el X10D, también a oscuras (NightSense).",
      nota: "Su sitio exacto en el cuerpo es aproximado.",
    },
    {
      nombre: "Brazos plegables",
      en: [0.62, 0.12, 0.52],
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
      texto: "Cuatro motores eléctricos con hélices de dos palas. Los de atrás van más altos que los de delante, para que las hélices no choquen. Hasta 72 km/h y 40 minutos de vuelo.",
    },
    {
      nombre: "Cuerpo y batería",
      en: [0, 0.36, -0.3],
      piezas: ["cuerpo", "bateria"],
      respaldo: "fabricante",
      fuentes: ["ficha", "plegado"],
      texto: "Cuerpo cerrado y resistente al agua y al polvo (IP55). La batería, de 154 Wh, va encima de la parte trasera. Con ella pesa 2,11 kg.",
      nota: "Las formas del cuerpo están simplificadas: el real es más redondeado.",
    },
    {
      nombre: "Patas",
      en: [DELANTE.x, -0.3, DELANTE.z + 0.03],
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
