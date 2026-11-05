// Maqueta del Airbus Zephyr S (Zephyr 8), el avión solar de gran altitud que
// hoy opera AALTO, filial de Airbus: el de Kenia de 2025 (AALTOPORT,
// Laikipia), sin carga a la vista. Envergadura oficial, 25 m; lo demás,
// medido en las fotos de prensa de AALTO: la de desde arriba en Kenia da la
// planta (con la separación de las hélices como escala) y la de frente en la
// pista de Arizona, el diedro, las puntas y la cola. Todo se escribe en
// metros y al final se pasa a unidades de la maqueta (1 unidad = 10 m).
// Imágenes a tamaño completo en arte/uas-fuentes/airbus-zephyr/ (fuera de
// Git; enlaces en docs/drones/airbus-zephyr.md).
import type { Calca, Maqueta, Parte, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 10;

const AALTO = "https://www.aaltohaps.com/wp-content/uploads/2025/03/";

type P3 = [number, number, number];
type Est = [number, number, number, number, number];

// Ala en tres tramos (foto de frente en Arizona): el del centro, recto y sin
// diedro, de 14,6 m; los de fuera, de 5 m, suben 14°; y las puntas, de 0,8 m,
// caen 55° hacia fuera. Cuerda de 1,9 m en el centro (foto desde arriba),
// algo menor en los tramos de fuera. Muy fina.
const ALA = { y: 0, centro: 7.3, fuera: 5.0, diedro: 14, punta: 0.8, caida: 55, ba: 0.65, bs: -1.25, t: 0.14 };
const rad = (g: number) => (g * Math.PI) / 180;
const X_FUERA = ALA.centro + ALA.fuera * Math.cos(rad(ALA.diedro));
const SUBE_FUERA = ALA.fuera * Math.sin(rad(ALA.diedro));
const X_PUNTA = X_FUERA + ALA.punta * Math.cos(rad(ALA.caida));
const SUBE_PUNTA = SUBE_FUERA - ALA.punta * Math.sin(rad(ALA.caida));
// Hueco entre tramos (las juntas de las fotos de fábrica).
const HUECO = 0.006;
const EST_CENTRO: Est[] = [[0, ALA.ba, ALA.bs, ALA.t, 0], [ALA.centro, ALA.ba, ALA.bs, ALA.t, 0]];
const EST_FUERA: Est[] = [[ALA.centro + HUECO, ALA.ba, ALA.bs, ALA.t, 0], [X_FUERA, 0.55, -1.05, 0.11, SUBE_FUERA]];
const EST_PUNTA: Est[] = [[X_FUERA + HUECO, 0.55, -1.05, 0.1, SUBE_FUERA - HUECO], [X_PUNTA, 0.3, -0.75, 0.06, SUBE_PUNTA]];

// Botalón de carbono bajo el ala, del morro a la cola (foto desde arriba):
// asoma 2,8 m por delante del borde de ataque y llega a la cola 4,2 m por
// detrás del de salida. Bajo el centro del ala, un carenado oscuro que se
// afina hacia atrás hasta el botalón (foto del despegue y desde arriba).
const BOTALON = { y: -0.16, r: 0.045, morro: 3.45, cola: -6.15 };

// Cola en T (fotos de frente y desde arriba): deriva rectangular que sube
// 1,2 m sobre el ala desde el botalón y, encima, el timón de profundidad de
// 4,5 m de punta a punta.
const COLA = { ba: -5.45, bs: -6.15, alto: 1.25 };
const ESTAB = { y: COLA.alto + 0.02, semi: 2.25 };

// Motores: dos góndolas blancas pegadas bajo el borde de ataque, a 4 m del
// centro y asomando 0,9 m por delante, con hélices negras de dos palas de
// 1,4 m (foto de frente: el buje, casi a la altura del ala; desde arriba,
// cuánto asoman).
const MOTOR = { x: 4.0, y: -0.13, z0: 0.15, z1: 1.55, r: 0.065 };

const PIEZAS: Pieza[] = [
  { tipo: "ala", id: "ala", acabado: "plata-ze", y: ALA.y, estaciones: EST_CENTRO },
  { tipo: "ala", id: "ala-fuera", acabado: "plata-ze", y: ALA.y, estaciones: EST_FUERA },
  { tipo: "ala", id: "puntas", acabado: "plata-ze", y: ALA.y, estaciones: EST_PUNTA },
  // Botalón, morro claro y carenado bajo el ala.
  { tipo: "tubo", id: "botalon", acabado: "carbono-wh", centro: [0, BOTALON.y], perfil: [[2.95, BOTALON.r], [BOTALON.cola + 0.02, BOTALON.r], [BOTALON.cola, BOTALON.r * 0.6]] },
  { tipo: "tubo", id: "morro", acabado: "blanco", centro: [0, BOTALON.y], perfil: [[BOTALON.morro, 0], [BOTALON.morro - 0.04, 0.035], [BOTALON.morro - 0.15, 0.052], [2.93, 0.05]] },
  {
    tipo: "casco", id: "carenado", acabado: "carbono-wh", polo: true,
    secciones: [
      { z: 1.05, ancho: 0, arriba: -0.12, abajo: -0.2 },
      { z: 0.7, ancho: 0.08, arriba: -0.03, abajo: -0.29, n: 2.4, nAbajo: 2.2 },
      { z: -0.4, ancho: 0.1, arriba: -0.03, abajo: -0.31, n: 2.4, nAbajo: 2.2 },
      { z: -1.4, ancho: 0.075, arriba: -0.07, abajo: -0.26, n: 2.2, nAbajo: 2.2 },
      { z: -2.7, ancho: 0.04, arriba: -0.12, abajo: -0.2 },
    ],
  },
  // Cúpula blanca sobre el centro del ala (fotos de Arizona y de Kenia).
  { tipo: "tubo", id: "cupula", acabado: "blanco", centro: [0, 0.06], seccion: [1, 0.8], perfil: [[0.0, 0], [-0.03, 0.07], [-0.1, 0.1], [-0.17, 0.07], [-0.2, 0]] },
  // Cola en T.
  { tipo: "placa", id: "deriva", acabado: "plata-ze", plano: "vertical", x: 0, grosor: 0.04, bisel: 0.012, planta: [[COLA.ba, BOTALON.y], [COLA.ba, COLA.alto], [COLA.bs, COLA.alto], [COLA.bs, BOTALON.y]] },
  { tipo: "ala", id: "estabilizador", acabado: "plata-ze", y: ESTAB.y, estaciones: [[0, -5.42, -6.17, 0.06], [ESTAB.semi, -5.47, -6.02, 0.04]] },
  // Motores: góndola y hélice.
  ...([1, -1] as const).map((s): Pieza => ({
    tipo: "tubo", id: "gondolas", acabado: "blanco", centro: [s * MOTOR.x, MOTOR.y],
    perfil: [[MOTOR.z1, 0], [MOTOR.z1 - 0.05, 0.045], [MOTOR.z1 - 0.2, MOTOR.r], [MOTOR.z0 + 0.15, MOTOR.r], [MOTOR.z0, 0.02]],
  })),
  { tipo: "helice", id: "helices", acabado: "negro", en: [MOTOR.x, MOTOR.y, MOTOR.z1 - 0.06], radio: 0.7, palas: 2, ancho: 0.1, buje: 0, espejo: true, giro: 70 },
];

const PARTES: Parte[] = [
  {
    nombre: "Ala solar",
    en: [3.0, 0.15, -0.3],
    piezas: ["ala", "ala-fuera", "puntas"],
    respaldo: "foto",
    fuentes: ["planta", "frente", "fabrica"],
    texto: "25 m de punta a punta, más que un Boeing 737, y el avión entero pesa unos 75 kg. La cara de arriba va forrada de células solares que de día mueven los motores y cargan las baterías para pasar la noche. Así aguanta semanas a unos 20.000 m, por encima del tiempo y de los aviones de línea.",
    nota: "La envergadura es la oficial; la cuerda, el diedro y los tramos, medidos en las fotos de Kenia y de Arizona. El reparto de las células, aproximado.",
  },
  {
    nombre: "Puntas caídas",
    en: [12.3, 1.0, -0.2],
    piezas: ["puntas"],
    respaldo: "foto",
    fuentes: ["frente", "despegue", "amanecer"],
    texto: "Los últimos 80 cm de cada ala se doblan hacia abajo, al revés que los tramos de fuera, que suben.",
    nota: "El ángulo, de la foto de frente en la pista de Arizona.",
  },
  {
    nombre: "Motores y hélices",
    en: [4.0, -0.13, 1.1],
    piezas: ["gondolas", "helices"],
    respaldo: "foto",
    fuentes: ["frente", "despegue", "fabrica"],
    texto: "Dos motores eléctricos en góndolas blancas bajo el borde de ataque, cada uno con una hélice de dos palas. Gastan más o menos lo que una bombilla.",
    nota: "La posición, de las fotos de frente y desde arriba; el largo de las góndolas, aproximado.",
  },
  {
    nombre: "Botalón",
    en: [0, -0.25, 2.2],
    piezas: ["botalon", "morro", "carenado"],
    respaldo: "foto",
    fuentes: ["planta", "despegue"],
    texto: "No tiene fuselaje: un tubo fino de fibra de carbono pasa bajo el ala, asoma por delante y lleva la cola. Bajo el centro del ala, un carenado más grueso.",
    nota: "El largo, medido en la foto desde arriba de Kenia con la escala de las hélices; aproximado.",
  },
  {
    nombre: "Cola en T",
    en: [1.2, 1.4, -5.8],
    piezas: ["deriva", "estabilizador"],
    respaldo: "foto",
    fuentes: ["frente", "planta", "despegue"],
    texto: "Una deriva alta y rectangular y, encima, el timón de profundidad, ancho como un coche largo.",
    nota: "El ancho del timón de profundidad, de tres fotos de frente; el alto de la deriva, de la del despegue.",
  },
  {
    nombre: "Cúpula",
    en: [0, 0.2, -0.1],
    piezas: ["cupula"],
    respaldo: "foto",
    fuentes: ["amanecer", "vuelo"],
    texto: "Una cúpula blanca sobre el centro del ala.",
    nota: "Se ve en las fotos de Arizona y de Kenia; qué lleva dentro no se ha publicado.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const MEDIDAS = ["z", "ancho", "arriba", "abajo", "cintura"] as const;
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((v) => v.map(u) as typeof v), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => { const r = { ...q }; for (const k of MEDIDAS) if (r[k] !== undefined) r[k] = u(r[k]); return r; }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, s = 0]): Est => [u(x), u(a), u(b), u(t), u(s)]) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Las células solares: placas oscuras sobre el forro plateado, en bandas a
// lo ancho del ala, que dejan libres el borde de ataque y el de salida (foto
// desde arriba de Kenia y de la fábrica).
const CELDA = { color: "#1b2130", banda: 0.6, paso: 1.0, delante: 0.12, detras: 0.82 };
const ARRIBA: P3 = [0, 1, 0];
const ARRIBA_FUERA: P3 = [-Math.sin(rad(ALA.diedro)), Math.cos(rad(ALA.diedro)), 0];
const cuerda = (ba: number, bs: number, f: number) => ba - f * (ba - bs);
const celdaCentro = (x: number): Calca => {
  const z0 = cuerda(ALA.ba, ALA.bs, CELDA.delante), z1 = cuerda(ALA.ba, ALA.bs, CELDA.detras);
  return { sobre: ["ala"], en: [x, 0.2, (z0 + z1) / 2], desde: ARRIBA, tam: [CELDA.banda, z0 - z1], dibujo: { tipo: "rect", color: CELDA.color }, espejo: true };
};
const celdaFuera = (d: number): Calca => {
  const f = d / ALA.fuera;
  const ba = ALA.ba + f * (0.55 - ALA.ba), bs = ALA.bs + f * (-1.05 - ALA.bs);
  const z0 = cuerda(ba, bs, CELDA.delante), z1 = cuerda(ba, bs, CELDA.detras);
  const x = ALA.centro + d * Math.cos(rad(ALA.diedro)), y = d * Math.sin(rad(ALA.diedro));
  return { sobre: ["ala-fuera"], en: [x - 0.05, y + 0.2, (z0 + z1) / 2], desde: ARRIBA_FUERA, tam: [z0 - z1, CELDA.banda], dibujo: { tipo: "rect", color: CELDA.color }, espejo: true };
};
const CALCAS: Calca[] = [
  ...Array.from({ length: 7 }, (_, i) => celdaCentro(0.65 + i * CELDA.paso)),
  ...Array.from({ length: 4 }, (_, i) => celdaFuera(0.6 + i * 1.15)),
];
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });

const maqueta: Maqueta = {
  nombre: "Airbus Zephyr",
  subtitulo: "Avión solar de gran altitud (HAPS)",
  escala: ESCALA,  // 1 unidad = 10 m; envergadura oficial de 25 m
  hd: true,
  contornoPixel: true,
  resalte: "tinta",
  // Ala larga: de más arriba, como el TB2 y el Global Hawk.
  vistaTarjeta: [61, 20],
  plantaLisa: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: [] },
  pais: bandera("GB"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "planta", imagen: "planta-kenia.jpg", titulo: "El Zephyr en Kenia, de noche, visto desde arriba en su carro (2025)", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Kenya_2025.png` },
    { id: "frente", imagen: "frente-arizona.jpg", titulo: "De frente sobre su carro en la pista de Arizona", medio: "AALTO HAPS", url: `${AALTO}Zephyr_OnRunway.jpg` },
    { id: "amanecer", imagen: "amanecer-arizona.jpg", titulo: "Al amanecer en Arizona, de frente y a la izquierda", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Sunrise.jpg` },
    { id: "despegue", imagen: "despegue.jpg", titulo: "Despegando en Arizona, visto desde abajo", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Take-off.jpg` },
    { id: "vuelo", imagen: "vuelo-kenia.jpg", titulo: "En vuelo bajo sobre Kenia (2025)", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Landing_2025.jpg` },
    { id: "fabrica", imagen: "fabrica.jpg", titulo: "En la fábrica de Farnborough, sobre su bancada", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Production_Hangar.jpg` },
    { id: "dvids", imagen: "vuelo-yuma.jpg", titulo: "En vuelo sobre Yuma (Arizona), 2022", medio: "Ejército de EE. UU. (DVIDS)", url: "https://www.dvidshub.net/image/6883883" },
    { id: "airbus", titulo: "Zephyr", medio: "Airbus", url: "https://www.airbus.com/en/products-services/defence/uas/zephyr" },
    { id: "record", titulo: "Zephyr sets world record for longest continuous flight, flying 67 days in stratosphere", medio: "AALTO HAPS", url: "https://www.aaltohaps.com/zephyr-sets-world-record-for-longest-continuous-flight-flying-67-days-in-stratosphere/" },
  ],
};

export default maqueta;
