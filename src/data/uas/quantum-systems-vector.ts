// Maqueta del Vector AI de Quantum Systems, versión 2.0 (docs/nuevodron.md),
// con la cámara giratoria Raptor-360, la que compró el Ejército de Tierra. Las
// marcas, las de un Vector AI de fábrica. La forma, de fotos y vídeos del
// Vector AI español (Infodefensa TV, 2026), de uno en una feria en Ucrania
// (Militarnyi), de los folletos del fabricante y de un Vector rumano
// (arte/uas-fuentes/quantum-systems-vector/, fuera de Git; la lista en
// docs/drones/quantum-systems-vector.md).
// Medidas: 2,8 m de envergadura y 1,49 m de largo (4,9 pies; web del
// Vector AI de Quantum Systems en EE. UU.).
// Todo se escribe en metros, con z = 0 en el borde de ataque de la raíz del
// ala e y = 0 en el plano del ala, y al final se pasa a unidades de la
// maqueta (1 unidad = 1 m).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 1;

const VIDEO_QS = "https://www.youtube.com/watch?v=mnlKJicrADY";
const VIDEO_MILITARNYI = "https://www.youtube.com/watch?v=9mqX663D97I";
const VIDEO_INFODEFENSA = "https://www.youtube.com/watch?v=iTrau6YlfKk";
const FOLLETO = "https://lp.quantum-systems.com/hubfs/Downloadables/QS_Vector_AI_A4_BS_3mm_250822_Screen.pdf";

// ── Barquilla ──────────────────────────────────────────────────────────────
// Un huevo alargado, con el morro redondo; detrás se estrecha en un cono largo
// que acaba en el tubo de cola. El ala va encima. [z, medio ancho, lomo,
// panza]. De frente (vídeo del fabricante, casi sin perspectiva): 0,14 m de
// ancho, el lomo 6 cm sobre el ala y la panza 9 cm por debajo.
const BARQUILLA: Seccion[] = ([
  [0.34, 0, -0.035, -0.035],
  [0.335, 0.03, -0.004, -0.068],
  [0.31, 0.05, 0.024, -0.098],
  [0.26, 0.061, 0.045, -0.118],
  [0.19, 0.069, 0.06, -0.13],
  [0.1, 0.071, 0.068, -0.134],
  [0.0, 0.069, 0.068, -0.13],
  [-0.088, 0.062, 0.058, -0.118],
  [-0.177, 0.052, 0.042, -0.1],
  [-0.265, 0.041, 0.022, -0.08],
  [-0.354, 0.032, 0.004, -0.062],
  [-0.442, 0.026, -0.012, -0.05],
  [-0.478, 0.025, -0.015, -0.047],
] as number[][]).map(([z, ancho, arriba, abajo]) => ({ z, ancho, arriba, abajo, cintura: (arriba + abajo) / 2 + 0.01, n: 2.3, nAbajo: 2 }));

// ── Ala ────────────────────────────────────────────────────────────────────
// Recta y sin diedro (vista de frente).
const ALA = { y: 0, semi: 1.4 };

// ── Góndolas y rotores delanteros ─────────────────────────────────────────
// De frente, a 0,62-0,64 m del eje y a la altura del ala.
// Un tubo blanco que nace del borde de ataque y sale unos 13 cm hacia
// delante; en la punta, el motor negro con la hélice (fotos españolas del ala
// desde arriba y del morro). Por detrás se mete bajo el ala.
const GONDOLA = { x: 0.63, y: 0, delante: 0.14, detras: -0.16, r: 0.027 };
const MOTOR = { delante: 0.215, detras: 0.135, r: 0.031 };
const gondola = (x: number): Pieza => ({
  tipo: "casco", id: x > 0 ? "gondola-izq" : "gondola-der", acabado: "gris-qs", x,
  secciones: ([
    [GONDOLA.delante, GONDOLA.r], [0.0, GONDOLA.r], [-0.08, GONDOLA.r * 0.8], [GONDOLA.detras + 0.02, GONDOLA.r * 0.4], [GONDOLA.detras, 0],
  ] as number[][]).map(([z, a]) => ({ z, ancho: a, arriba: GONDOLA.y + a, abajo: GONDOLA.y - a * 1.1, cintura: GONDOLA.y, n: 2, nAbajo: 2 })),
});
const motor = (x: number, y: number, m: typeof MOTOR, id: string): Pieza => ({
  tipo: "tubo", id, acabado: "negro", centro: [x, y],
  perfil: [[m.detras, m.r * 0.9], [m.detras + 0.01, m.r], [m.delante - 0.025, m.r], [m.delante - 0.01, m.r * 0.75], [m.delante, m.r * 0.3], [m.delante + 0.002, 0]],
});

// ── Tubo de cola, estabilizador y deriva ──────────────────────────────────
// El tubo, un poco por debajo del ala: de frente, el estabilizador queda
// escondido tras ella.
const TUBO = { desde: -0.47, hasta: -1.15, y: -0.018, r0: 0.02, r1: 0.016 };
const ESTAB = { z: -0.9, semi: 0.33, cuerda: 0.13 };
const elipse = (zc: number, semi: number, cuerda: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [semi * Math.sin(a), zc + (cuerda / 2) * Math.cos(a)];
  });
// El alto de la deriva, de su proporción en las fotos (de 2 a 2,2 veces la
// cuerda en las españolas y en la de Militarnyi al sol).
const DERIVA = { x: 0, delante: -1.025, detras: -1.15, abajo: -0.08, alto: 0.16 };
const COLA_ROTOR = { y: 0.175, delante: -0.975, detras: -1.15, r: 0.028 };
const MOTOR_COLA = { delante: -0.905, detras: -0.98, r: 0.029 };

// La Raptor-360: un cuerpo gris de esquinas redondas que cuelga bajo el
// morro y gira; de frente, 0,105 m de ancho y hasta 0,17 m bajo el ala. Por
// delante, el objetivo grande y, debajo, tres pequeños; a cada lado, la tapa
// redonda del eje (fotos españolas y del folleto).
const RAPTOR = { y: -0.13, z: 0.18, ancho: 0.105, alto: 0.085, largo: 0.1 };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "barquilla", acabado: "gris-qs", secciones: BARQUILLA, polo: true },
  {
    // Media ala: [x, borde de ataque, borde de salida, grosor]. Cuerda de
    // 0,21 m (desde abajo, contra el ancho de la barquilla; el grosor de la
    // vista de frente, 2-3 cm, dice lo mismo) y la punta redonda.
    tipo: "ala", id: "ala", acabado: "gris-qs", y: ALA.y,
    estaciones: [
      [0, 0, -0.21, 0.025],
      [1.22, 0, -0.18, 0.021],
      [1.33, -0.012, -0.165, 0.017],
      [1.385, -0.04, -0.145, 0.012],
      [ALA.semi, -0.07, -0.12, 0.008],
    ],
  },
  gondola(GONDOLA.x),
  gondola(-GONDOLA.x),
  motor(GONDOLA.x, GONDOLA.y, MOTOR, "motor-izq"),
  motor(-GONDOLA.x, GONDOLA.y, MOTOR, "motor-der"),
  // Las hélices delanteras, desplegadas como en vuelo.
  { tipo: "helice", id: "rotor-del", acabado: "negro", en: [GONDOLA.x, GONDOLA.y, MOTOR.delante - 0.02], radio: 0.19, palas: 2, espejo: true, ancho: 0.032, buje: 0, giro: 70 },
  { tipo: "tubo", id: "tubo", acabado: "gris-qs", centro: [0, TUBO.y], perfil: [[TUBO.desde, TUBO.r0], [TUBO.hasta, TUBO.r1], [TUBO.hasta - 0.005, 0]] },
  { tipo: "placa", id: "estabilizador", acabado: "gris-qs", plano: "horizontal", y: TUBO.y, grosor: 0.012, bisel: 0.005, simetrica: true, planta: elipse(ESTAB.z, ESTAB.semi, ESTAB.cuerda) },
  // La deriva: una placa con el canto delantero recto que arriba se curva
  // hacia delante hasta meterse bajo la góndola del rotor (fotos españolas y
  // rumana de la cola).
  {
    tipo: "placa", id: "deriva", acabado: "gris-qs", plano: "vertical", x: DERIVA.x, grosor: 0.016, bisel: 0.007,
    planta: [
      [DERIVA.delante, DERIVA.abajo], [DERIVA.detras, DERIVA.abajo], [DERIVA.detras, DERIVA.alto + 0.012],
      [COLA_ROTOR.delante + 0.03, DERIVA.alto + 0.012], [COLA_ROTOR.delante + 0.03, DERIVA.alto - 0.01],
      [DERIVA.delante - 0.01, DERIVA.alto - 0.03], [DERIVA.delante, DERIVA.alto - 0.07],
    ],
  },
  // El tope negro de debajo de la deriva, que apoya en el suelo (desde abajo).
  { tipo: "caja", id: "deriva-tope", acabado: "negro", centro: [DERIVA.x, DERIVA.abajo - 0.006, (DERIVA.delante + DERIVA.detras) / 2], tam: [0.022, 0.014, 0.08], redondeo: 0.007 },
  {
    tipo: "casco", id: "gondola-cola", acabado: "gris-qs", x: DERIVA.x,
    secciones: ([[COLA_ROTOR.delante, COLA_ROTOR.r], [COLA_ROTOR.detras + 0.03, COLA_ROTOR.r], [COLA_ROTOR.detras + 0.005, COLA_ROTOR.r * 0.6], [COLA_ROTOR.detras, 0]] as number[][])
      .map(([z, a]) => ({ z, ancho: a, arriba: COLA_ROTOR.y + a, abajo: COLA_ROTOR.y - a, cintura: COLA_ROTOR.y, n: 2, nAbajo: 2 })),
  },
  motor(DERIVA.x, COLA_ROTOR.y, MOTOR_COLA, "motor-cola"),
  { tipo: "helice", id: "rotor-cola", acabado: "negro", en: [DERIVA.x, COLA_ROTOR.y, MOTOR_COLA.delante - 0.02], radio: 0.17, palas: 2, ancho: 0.03, buje: 0, giro: 20 },
  // Las antenas del tubo: una pala negra encima, delante del estabilizador,
  // y una cúpula negra cerca de la barquilla (fotos españolas de la cola).
  { tipo: "caja", id: "antena-pala", acabado: "negro", centro: [0, TUBO.y + 0.04, -0.76], tam: [0.008, 0.05, 0.035], redondeo: 0.004 },
  { tipo: "tubo", id: "antena-cupula", acabado: "negro", centro: [0, TUBO.y + 0.02], perfil: Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [-0.53 + 0.022 * Math.cos(a), 0.016 * Math.sin(a)] as [number, number]; }) },

  { tipo: "caja", id: "raptor", acabado: "gris", centro: [0, RAPTOR.y - 0.004, RAPTOR.z], tam: [RAPTOR.ancho, RAPTOR.alto, RAPTOR.largo], redondeo: 0.03 },
  { tipo: "varilla", id: "raptor-cuello", acabado: "gris", desde: [0, -0.1, RAPTOR.z - 0.01], hasta: [0, -0.085, RAPTOR.z - 0.01], radio: 0.03 },
  { tipo: "disco", id: "raptor-eje", acabado: "gris", espejo: true, en: [RAPTOR.ancho / 2 + 0.002, RAPTOR.y, RAPTOR.z - 0.005], normal: [1, 0, 0], radio: 0.026, grosor: 0.006 },
  { tipo: "disco", id: "raptor-objetivo", acabado: "lente", en: [0.008, RAPTOR.y + 0.008, RAPTOR.z + RAPTOR.largo / 2 + 0.002], normal: [0, 0, 1], radio: 0.03, grosor: 0.006 },
  ...[-0.022, 0, 0.022].map((x, i): Pieza => ({ tipo: "disco", id: `raptor-lente-${i}`, acabado: "lente", en: [x, RAPTOR.y - 0.03, RAPTOR.z + RAPTOR.largo / 2 + 0.002], normal: [0, 0, 1], radio: 0.009, grosor: 0.005 })),

  // La cajita gris de encima del ala, junto a la góndola, cerca del borde de
  // ataque (fotos españolas del ala desde arriba).
  { tipo: "caja", id: "ala-cajita", acabado: "gris", espejo: true, centro: [0.56, 0.016, -0.035], tam: [0.028, 0.012, 0.022], redondeo: 0.003 },

  // El tren: una sola pieza negra y curvada, como un ala de gaviota, bajo la
  // barquilla delante del ala (vídeo del fabricante desde abajo).
  {
    tipo: "viga", id: "tren", acabado: "negro", espejo: true,
    ruta: [[0, -0.105, 0.05, 0.05, 0.012], [0.08, -0.128, 0.055, 0.045, 0.01], [0.17, -0.158, 0.05, 0.035, 0.009], [0.24, -0.178, 0.04, 0.028, 0.008]],
  },
  // El mástil: un tocón negro curvado y, arriba, la varilla de metal hacia
  // delante con la punta negra; de frente, hasta 0,16 m sobre el ala.
  { tipo: "varilla", id: "mastil", acabado: "negro", desde: [0, 0.05, 0.1], hasta: [0, 0.155, 0.105], radio: 0.015 },
  { tipo: "varilla", id: "antena", acabado: "metal", desde: [0, 0.143, 0.11], hasta: [0, 0.143, 0.23], radio: 0.005 },
  { tipo: "varilla", id: "antena-punta", acabado: "negro", desde: [0, 0.143, 0.21], hasta: [0, 0.143, 0.27], radio: 0.008 },
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Un Vector AI de fábrica, como los españoles: sin bandera ni números. En el
// costado de la barquilla, la franja negra vertical, la ranura negra de
// delante y un ojo negro bajo el ala; encima del morro, la rejilla
// traslúcida; abajo, la rejilla de ventilación; la junta de la tapa del morro
// y la de la tapa de arriba. En el ala, la ranura del alerón, la tapa de su
// servo y «NO TOUCH» cerca del borde de salida. Fotos españolas (Infodefensa),
// de Militarnyi y del vídeo del fabricante.
const ARRIBA: [number, number, number] = [0, 1, 0];
const LADO: [number, number, number] = [1, 0, 0];
const NEGRO = "#1d1f22";
const CALCAS: Calca[] = [
  { sobre: ["barquilla"], en: [0.07, 0.015, -0.07], desde: LADO, tam: [0.013, 0.1], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.07, -0.018, 0.075], desde: LADO, tam: [0.065, 0.014], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.07, -0.055, -0.035], desde: LADO, tam: [0.012, 0.012], dibujo: { tipo: "disco", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.06, -0.085, -0.02], desde: LADO, tam: [0.04, 0.025], dibujo: { tipo: "rejilla" }, espejo: true },
  // El agujero de la punta del morro (de frente, en el vídeo del fabricante).
  { sobre: ["barquilla"], en: [0, -0.03, 0.34], desde: [0, 0, 1], tam: [0.014, 0.014], dibujo: { tipo: "disco", color: NEGRO } },
  { sobre: ["barquilla"], en: [0, 0.07, 0.205], desde: ARRIBA, tam: [0.05, 0.075], giro: 90, dibujo: { tipo: "rejilla" } },
  // El ala (la izquierda de verdad es la x positiva: la maqueta va en espejo).
  { sobre: ["ala"], en: [0.6, 0.02, -0.165], desde: ARRIBA, tam: [0.01, 0.085], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["ala"], en: [0.66, 0.02, -0.12], desde: ARRIBA, tam: [0.04, 0.016], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["ala"], en: [1.05, 0.02, -0.15], desde: ARRIBA, tam: [0.07, 0.016], giro: 180, dibujo: { tipo: "texto", texto: "NO TOUCH", color: "#8a8d8f", fino: true }, espejo: true },
  // La rejilla pequeña de lo alto de la deriva.
  { sobre: ["deriva"], en: [0.01, 0.13, -1.09], desde: LADO, tam: [0.025, 0.03], dibujo: { tipo: "rejilla" }, espejo: true },
];
const COSTURAS: Costura[] = [
  // La junta de la tapa del morro.
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.07, 0.06, 0.13], [0.07, 0.0, 0.105], [0.07, -0.06, 0.085], [0.07, -0.12, 0.08]] },
  { sobre: ["barquilla"], desde: ARRIBA, puntos: [[-0.05, 0.07, 0.13], [0, 0.07, 0.132], [0.05, 0.07, 0.13]] },
  // La tapa de arriba, a lo largo del costado.
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.07, 0.035, 0.11], [0.07, 0.03, 0.0], [0.07, 0.025, -0.14]] },
];
const PARTES: Parte[] = [
  {
    nombre: "Cámara Raptor-360",
    en: [0, -0.32, RAPTOR.z],
    piezas: ["raptor", "raptor-cuello", "raptor-eje", "raptor-objetivo", "raptor-lente-0", "raptor-lente-1", "raptor-lente-2"],
    respaldo: "foto",
    fuentes: ["raptor", "et-morro", "lado-fabrica", "ficha", "infodefensa-2025"],
    texto: "Una cámara de día con 40 aumentos, una térmica y, si se quiere, un láser, en un cuerpo que da la vuelta entera bajo el morro. Es la que lleva el Vector AI del Ejército de Tierra. Se quita en segundos para poner otro sensor, como el acústico WASP, que oye los disparos de artillería.",
    nota: "Lo que lleva dentro sale del folleto del fabricante; la forma, de las fotos españolas y del folleto.",
  },
  {
    nombre: "Barquilla",
    en: [0, 0.3, 0.02],
    piezas: ["barquilla", "mastil", "antena", "antena-punta"],
    respaldo: "foto",
    fuentes: ["et-morro", "lado-fabrica", "frente", "suelo-sol"],
    texto: "Lleva la batería, para unas tres horas de vuelo, y el ordenador con dos procesadores Nvidia Jetson Orin, que reconoce y sigue blancos sin depender de la radio. Encima del morro, el mástil de una antena.",
    nota: "El ancho y el alto, de la vista de frente del vídeo del fabricante; el perfil del morro, de fotos de cerca con gran angular, y es aproximado.",
  },
  {
    nombre: "Ala",
    en: [1.0, 0.18, -0.1],
    piezas: ["ala", "ala-cajita"],
    respaldo: "foto",
    fuentes: ["abajo-vuelo", "et-ala", "frente", "web-qs"],
    texto: "Recta, de 2,8 m de punta a punta. Se desmonta en dos mitades para que el dron entero quepa en una mochila y lo monte un solo soldado en pocos minutos.",
    nota: "La envergadura es la del fabricante; la cuerda y la punta, medidas en la foto desde abajo.",
  },
  {
    nombre: "Rotores delanteros",
    en: [-GONDOLA.x, 0.3, GONDOLA.delante],
    piezas: ["gondola-izq", "gondola-der", "motor-izq", "motor-der", "rotor-del"],
    respaldo: "foto",
    fuentes: ["et-ala", "abajo-fabrica", "abajo-vuelo", "kipprotoren"],
    texto: "Despega y aterriza en vertical, como un multicóptero, y en el aire vuela como un avión: sus tres rotores se inclinan hacia delante y tiran de él. Por eso no necesita pista ni catapulta.",
    nota: "Van como en vuelo, con las hélices abiertas; en el suelo se pliegan hacia atrás.",
  },
  {
    nombre: "Cola y rotor trasero",
    en: [0, 0.42, -1.05],
    piezas: ["tubo", "estabilizador", "deriva", "deriva-tope", "gondola-cola", "motor-cola", "rotor-cola", "antena-pala", "antena-cupula"],
    respaldo: "foto",
    fuentes: ["suelo-sol", "abajo-vuelo", "et-cola", "kipprotoren"],
    texto: "Un tubo fino lleva el estabilizador y la deriva; arriba de esta va el tercer rotor, que también se inclina. Debajo, un tope negro apoya en el suelo. En el tubo, dos antenas negras.",
    nota: "El largo total, 1,49 m, es el del fabricante; la cola, medida en la foto de Militarnyi desde abajo.",
  },
  {
    nombre: "Tren",
    en: [0.3, -0.32, 0.05],
    piezas: ["tren"],
    respaldo: "foto",
    fuentes: ["abajo-fabrica", "et-morro"],
    texto: "Una sola pieza negra curvada, como un ala de gaviota, bajo la barquilla. Al aterrizar en vertical se apoya en ella y en el tope de la deriva.",
    nota: "La forma, del vídeo del fabricante desde abajo; la curva, aproximada.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "hombro", "lomo", "costado", "sobreArista", "bajoArista", "bordeArriba", "bordeAbajo", "nariz"] as const;
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, ...(p.x !== undefined && { x: u(p.x) }), secciones: p.secciones.map((q) => ({ ...q, ...Object.fromEntries(LARGOS_SECCION.filter((k) => q[k] !== undefined).map((k) => [k, u(q[k] as number)])) })) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }), ...(p.seccion && { seccion: p.seccion }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, s = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(s)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    case "viga":
      return { ...p, ruta: p.ruta.map((q) => q.map(u) as typeof q) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const calcaAUnidades = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const costuraAUnidades = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "Quantum Systems Vector",
  subtitulo: "Dron de reconocimiento de ala fija con despegue vertical",
  escala: ESCALA,  // 1 unidad = 1 m; envergadura y largo del fabricante
  resalte: "tinta",
  pais: bandera("DE"),
  hd: true,
  // Tarjeta de /uas: de más arriba, como el TB2 y el Raven (ala larga).
  vistaTarjeta: [61, 20],
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(calcaAUnidades), costuras: COSTURAS.map(costuraAUnidades) },
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "frente", imagen: "frente-fabrica.jpg", titulo: "De frente, en el vídeo de presentación del Vector AI", medio: "Quantum Systems (YouTube)", url: VIDEO_QS },
    { id: "abajo-fabrica", imagen: "abajo-fabrica.jpg", titulo: "Desde abajo: el tren curvado y la Raptor-360", medio: "Quantum Systems (YouTube)", url: VIDEO_QS },
    { id: "lado-fabrica", imagen: "lado-fabrica.jpg", titulo: "La barquilla de lado", medio: "Quantum Systems (YouTube)", url: VIDEO_QS },
    { id: "abajo-vuelo", imagen: "abajo-vuelo.jpg", titulo: "En vuelo, desde abajo, en una feria en Ucrania (con el sensor acústico en el morro)", medio: "Militarnyi (YouTube)", url: VIDEO_MILITARNYI },
    { id: "suelo-sol", imagen: "suelo-sol.jpg", titulo: "En el suelo, desde detrás: la cola y la deriva", medio: "Militarnyi (YouTube)", url: VIDEO_MILITARNYI },
    { id: "et-morro", imagen: "et-morro.jpg", titulo: "El morro de un Vector AI del Ejército de Tierra (Brigada Aragón I, 2026)", medio: "Infodefensa TV (YouTube)", url: VIDEO_INFODEFENSA },
    { id: "et-ala", imagen: "et-ala.jpg", titulo: "El ala por arriba, con la góndola del rotor", medio: "Infodefensa TV (YouTube)", url: VIDEO_INFODEFENSA },
    { id: "et-cola", imagen: "et-cola.jpg", titulo: "La cola: la deriva con el rotor y el estabilizador", medio: "Infodefensa TV (YouTube)", url: VIDEO_INFODEFENSA },
    { id: "raptor", imagen: "raptor.jpg", titulo: "La cámara Raptor-360", medio: "Quantum Systems (folleto del Vector AI, 2025)", url: FOLLETO },
    { id: "ficha", titulo: "Vector AI: the ultimate 2-in-1 ISR system (folleto)", medio: "Quantum Systems", url: FOLLETO },
    { id: "web-qs", titulo: "Vector AI (ficha técnica: 9,2 pies de envergadura y 4,9 de largo)", medio: "Quantum Systems", url: "https://quantum-systems.com/us/vector-ai/" },
    { id: "kipprotoren", titulo: "Vector – Quantum-Systems setzt auf innovatives Drohnenkonzept", medio: "Soldat & Technik", url: "https://soldat-und-technik.de/2021/09/fuehrung-kommunikation/28490/vector-quantum-systems-setzt-auf-innovatives-drohnenkonzept/" },
    { id: "infodefensa-2025", titulo: "El Ejército de Tierra incorporará más de 120 drones Vector para misiones de vigilancia e inteligencia por 31,3 millones", medio: "Infodefensa", url: "https://www.infodefensa.com/texto-diario/mostrar/5701527/ejercito-tierra-incorporara-120-drones-vector-misiones-vigilancia-e-inteligencia-313-millones" },
  ],
};

export default maqueta;
