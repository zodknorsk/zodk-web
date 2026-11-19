// Maqueta del Airbus Zephyr S (Zephyr 8), el avión solar de gran altitud que
// hoy opera AALTO, filial de Airbus: el de Kenia de 2025 (AALTOPORT,
// Laikipia), sin carga a la vista. Envergadura oficial, 25 m; lo demás,
// medido en las fotos de prensa de AALTO a tamaño completo: la de frente en
// la pista de Arizona (cámara encajada; las hélices, a ±4 m, dan 245 px/m)
// para el diedro, las puntas, la cola y las hélices; la de desde arriba en
// Kenia para la planta (escala con las hélices a lo ancho y con el alto de la
// deriva: 0,0103 m/px a lo largo); y la de Kenia de lado, con personas al
// lado, para las góndolas, el morro y la deriva. Todo se escribe en metros a
// la escala de la foto de frente (de punta a punta, 26,3 m) y al pasar a
// unidades se multiplica por K para que el ala mida los 25 m oficiales: las
// fotos dan las proporciones, no el tamaño (1 unidad = 10 m).
// Imágenes en arte/uas-fuentes/airbus-zephyr/ (fuera de Git; enlaces en
// docs/drones/airbus-zephyr.md).
import type { Calca, Costura, Maqueta, Parte, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 10;
// De la escala de las fotos a la de verdad (25 m de punta a punta).
const K = 25 / 26.5;

const AALTO = "https://www.aaltohaps.com/wp-content/uploads/2025/03/";

type P3 = [number, number, number];
type Est = [number, number, number, number, number];

// Ala en tres tramos (foto de frente): el del centro, recto y sin diedro, de
// 14,6 m; los de fuera, de 5,1 m, suben 13,5° (su final, triangulado con las
// dos fotos: a 12,27 m del eje y 1,22 m de alto). La planta, de la foto desde arriba
// de Kenia: cada punto de los dos bordes, a lo largo de las dos alas, llevado
// a metros cortando su rayo con la cara de arriba del ala (cámara encajada) y
// promediando los dos lados. No es un rectángulo: el borde de ataque se echa
// atrás poco a poco del centro (0,52) al quiebro (0,17) y el de salida se
// adelanta (de −1,04 a −0,62): la cuerda baja de 1,56 m a 0,82 m. Los
// tramos de fuera, rectos, con 0,84 m de cuerda. Grueso de 0,26 m en el
// centro (foto de frente), un 17 % de la cuerda.
// Las puntas: el borde de ataque sigue 0,55 m hacia fuera bajando poco hasta
// un codo (de frente, las dos puntas casan con el codo en el borde de
// ataque); de ahí, el borde de fuera baja y se echa atrás hasta acabar en
// pico, a 13,13 m del centro, a 0,46 m de alto y 1,5 m por detrás del borde
// de ataque (triangulado con las dos fotos encajadas). En las dos fotos la
// punta derecha acaba unos 0,13 m antes que la izquierda: se deja simétrica,
// a medio camino.
const ALA = { y: 0, centro: 7.3, fuera: 5.1, diedro: 13.5, ba: 0.52, bs: -1.04, t: 0.26 };
const rad = (g: number) => (g * Math.PI) / 180;
const X_FUERA = ALA.centro + ALA.fuera * Math.cos(rad(ALA.diedro));
const SUBE_FUERA = ALA.fuera * Math.sin(rad(ALA.diedro));
// Planta del ala: [x, borde de ataque, borde de salida, grueso].
const PLANTA_ALA: [number, number, number, number][] = [
  [0, ALA.ba, ALA.bs, ALA.t],
  [2.0, 0.5, -1.0, 0.26],
  [4.0, 0.44, -0.85, 0.22],
  [6.0, 0.34, -0.67, 0.17],
  [ALA.centro, 0.17, -0.62, 0.14],
  [X_FUERA, 0.15, -0.66, 0.12],
];
const enPlanta = (x: number, k: 1 | 2 | 3): number => {
  const ax = Math.abs(x);
  for (let i = 1; i < PLANTA_ALA.length; i++) {
    const a = PLANTA_ALA[i - 1], b = PLANTA_ALA[i];
    if (ax <= b[0] || i === PLANTA_ALA.length - 1) return a[k] + ((b[k] - a[k]) * (ax - a[0])) / (b[0] - a[0]);
  }
  return PLANTA_ALA[0][k];
};
const baAla = (x: number) => enPlanta(x, 1), bsAla = (x: number) => enPlanta(x, 2);
// Altura de la cara de arriba en x (en el tramo de fuera, con el diedro; en
// la punta, la de su raíz).
const sobreAla = (x: number): number => {
  const ax = Math.abs(x);
  if (ax <= ALA.centro) return 0.09;
  return 0.06 + (Math.min(ax, X_FUERA) - ALA.centro) * Math.tan(rad(ALA.diedro));
};
// La cara de arriba, a 0,09 m en el tramo del centro y a 0,06 m (más lo
// que sube el diedro) en los de fuera (foto de frente): lo que engorda el
// perfil va hacia abajo.
const ARRIBA_ALA = (x: number) => (Math.abs(x) <= ALA.centro ? 0.09 : 0.06);
// Raíz, codo y extremo de la punta: [x, y, borde de ataque, de salida, grueso].
const PUNTA: [number, number, number, number, number][] = [
  [X_FUERA, SUBE_FUERA, 0.15, -0.66, 0.11],
  [12.8, 1.0, 0.15, -1.07, 0.07],
  [13.13, 0.46, -1.37, -1.55, 0.04],
];
// Hueco entre tramos (las juntas de las fotos de fábrica).
const HUECO = 0.006;
const EST_CENTRO: Est[] = PLANTA_ALA.filter(([x]) => x <= ALA.centro).map(([x, ba, bs, t]) => [x, ba, bs, t, ARRIBA_ALA(x) - t / 2]);
const EST_FUERA: Est[] = [[ALA.centro + HUECO, baAla(ALA.centro), bsAla(ALA.centro), 0.14, 0.06 - 0.07], [X_FUERA, baAla(X_FUERA), bsAla(X_FUERA), 0.12, SUBE_FUERA]];
const EST_PUNTA: Est[] = PUNTA.map(([x, y, ba, bs, t], i) => [i ? x : x + HUECO, ba, bs, t, i ? y : y - HUECO]);

// Botalón de carbono: de un carenado negro bajo el centro del ala, que sigue
// 1,1 m por detrás del borde de salida (desde arriba, de frente y en el
// despegue), a la deriva, 3,46 m por detrás del borde de salida. Por delante,
// una varilla a media altura del ala lleva una caja blanca de 0,62 × 0,2 ×
// 0,22 m que acaba 1,1 m por delante del borde de ataque (desde arriba; el
// largo y la sección, de la foto de Kenia de lado, con los husos de los
// motores como escala). Junto a la varilla, una bola blanca de 0,15 m, a
// 0,18 m del eje, 0,11 m de alto y 0,26 m por delante del borde de ataque
// (triangulada con las dos fotos encajadas).
const BOTALON = { y: -0.14, r: 0.038, cola: -5.3 };
const DELANTE = { y: -0.04, r: 0.022, punta: ALA.ba + 1.1 };
const CAJA = { largo: 0.62, ancho: 0.2, alto: 0.22 };
const BOLA = { x: 0.18, z: 0.78, y: 0.11, r: 0.075 };

// Cola en T (fotos de frente, desde arriba y de Kenia de lado): deriva de
// 0,8 m de cuerda que sube del botalón a 1,25 m, con un larguero oscuro en
// cada borde y nervios; encima, el timón de profundidad de 4,7 m de punta a
// punta (de frente, 985 px; triangulado con las dos fotos, ±2,32 m), con
// 0,83 m de cuerda en la raíz y 0,7 m en la punta, que se echa 0,14 m atrás
// (desde arriba, cada esquina llevada a metros a la altura del timón), un
// larguero oscuro junto al borde de ataque y nervios cada 0,2 m.
const COLA = { ba: -4.46, bs: -5.26, alto: 1.25 };
const ESTAB = { y: COLA.alto + 0.03, semi: 2.33, raiz: [-4.46, -5.29] as [number, number], punta: [-4.6, -5.3] as [number, number] };

// Motores: un huso blanco de 0,42 m en la punta de una varilla negra que sale
// del borde de ataque, a 3,94 m del centro (de frente, encajada), casi a la
// altura del ala, con la hélice negra de dos palas delante (1,45 m; de
// frente, 364 px), con el buje casi a la altura del ala. El buje, 1,22 m
// por delante (triangulado con las dos fotos encajadas); la varilla asoma
// casi tanto como el huso (fábrica y Kenia de lado).
const MOTOR = { x: 3.94, y: -0.04, z0: 0.85, z1: 1.27, r: 0.07 };

const PIEZAS: Pieza[] = [
  { tipo: "ala", id: "ala", acabado: "plata-ze", y: ALA.y, estaciones: EST_CENTRO },
  { tipo: "ala", id: "ala-fuera", acabado: "plata-ze", y: ALA.y, estaciones: EST_FUERA },
  { tipo: "ala", id: "puntas", acabado: "film-ze", y: ALA.y, estaciones: EST_PUNTA },
  // Botalón, tramo de delante con su caja y su bola, y carenado bajo el ala.
  { tipo: "tubo", id: "botalon", acabado: "carbono-wh", centro: [0, BOTALON.y], perfil: [[ALA.ba - 0.4, BOTALON.r], [BOTALON.cola + 0.02, BOTALON.r], [BOTALON.cola, BOTALON.r * 0.6]] },
  { tipo: "tubo", id: "botalon", acabado: "carbono-wh", centro: [0, DELANTE.y], perfil: [[DELANTE.punta - CAJA.largo + 0.02, DELANTE.r], [ALA.ba - 0.15, DELANTE.r]] },
  { tipo: "caja", id: "morro", acabado: "blanco", centro: [0, DELANTE.y, DELANTE.punta - CAJA.largo / 2], tam: [CAJA.ancho, CAJA.alto, CAJA.largo], redondeo: 0.03 },
  // Soporte de la bola al borde de ataque: no se distingue en las fotos.
  { tipo: "varilla", id: "soporte-bola", acabado: "carbono-wh", desde: [BOLA.x, 0.07, baAla(BOLA.x) - 0.04], hasta: [BOLA.x, BOLA.y - 0.03, BOLA.z - 0.04], radio: 0.012, lados: 10 },
  { tipo: "tubo", id: "bola", acabado: "blanco", centro: [BOLA.x, BOLA.y], perfil: Array.from({ length: 13 }, (_, i): [number, number] => { const a = (i / 12) * Math.PI; return [BOLA.z + BOLA.r * Math.cos(a), BOLA.r * Math.sin(a)]; }) },
  {
    tipo: "casco", id: "carenado", acabado: "carbono-wh", polo: true,
    secciones: [
      { z: ALA.ba - 0.1, ancho: 0, arriba: -0.07, abajo: -0.12 },
      { z: ALA.ba - 0.35, ancho: 0.07, arriba: -0.04, abajo: -0.21, n: 2.4, nAbajo: 2.2 },
      { z: ALA.bs + 0.1, ancho: 0.075, arriba: -0.03, abajo: -0.22, n: 2.4, nAbajo: 2.2 },
      { z: ALA.bs - 0.5, ancho: 0.055, arriba: -0.07, abajo: -0.2, n: 2.2, nAbajo: 2.2 },
      { z: ALA.bs - 1.1, ancho: 0.03, arriba: -0.11, abajo: -0.17 },
    ],
  },
  // Cola en T: deriva con sus dos largueros y el timón de profundidad con su
  // remate sobre la deriva.
  { tipo: "placa", id: "deriva", acabado: "film-ze", plano: "vertical", x: 0, grosor: 0.025, bisel: 0.008, planta: [[COLA.ba, BOTALON.y], [COLA.ba, COLA.alto], [COLA.bs, COLA.alto], [COLA.bs, BOTALON.y]] },
  { tipo: "varilla", id: "largueros-cola", acabado: "carbono-wh", desde: [0, BOTALON.y, COLA.ba - 0.01], hasta: [0, COLA.alto + 0.02, COLA.ba - 0.01], radio: 0.024, lados: 16 },
  { tipo: "varilla", id: "largueros-cola", acabado: "carbono-wh", desde: [0, BOTALON.y, COLA.bs + 0.01], hasta: [0, COLA.alto, COLA.bs + 0.01], radio: 0.016, lados: 12 },
  { tipo: "ala", id: "estabilizador", acabado: "film-ze", y: ESTAB.y, estaciones: [[0, ...ESTAB.raiz, 0.06], [ESTAB.semi, ...ESTAB.punta, 0.045]] },
  // Luz de navegación (un bulto blanco) y una antenita oscura, sobre el ala.
  // No van igual en los dos lados: en la izquierda, la antena en el quiebro
  // y la luz algo más fuera, encima de la raíz de la punta (trianguladas con
  // las dos fotos encajadas); en la derecha, las dos juntas 0,3 m antes del
  // quiebro (de frente, medidas en el ala).
  ...([
    { luz: [12.58, 1.19, -0.38], antena: [12.24, -0.08] },
    { luz: [-11.95, sobreAla(11.95) + 0.035, -0.35], antena: [-11.9, -0.3] },
  ] as const).flatMap(({ luz, antena }): Pieza[] => [
    // Un huso blanco tumbado a lo largo (la caja salía negra: con aristas
    // redondeadas tan pequeñas, sus caras se veían del revés).
    { tipo: "tubo", id: "luces", acabado: "blanco", centro: [luz[0], luz[1]], seccion: [1, 0.75], perfil: [[luz[2] + 0.09, 0], [luz[2] + 0.06, 0.035], [luz[2] + 0.02, 0.048], [luz[2] - 0.04, 0.048], [luz[2] - 0.08, 0.03], [luz[2] - 0.09, 0]] },
    { tipo: "varilla", id: "antenas", acabado: "carbono-wh", desde: [antena[0], sobreAla(antena[0]), antena[1]], hasta: [antena[0], sobreAla(antena[0]) + 0.14, antena[1]], radio: 0.008, lados: 8 },
  ]),
  { tipo: "caja", id: "remate-cola", acabado: "carbono-wh", centro: [0, ESTAB.y + 0.025, (COLA.ba + COLA.bs) / 2], tam: [0.07, 0.05, 0.8], redondeo: 0.02 },
  // Motores: varilla, huso y hélice.
  { tipo: "varilla", id: "varillas-motor", acabado: "carbono-wh", desde: [MOTOR.x, MOTOR.y, baAla(MOTOR.x) - 0.1], hasta: [MOTOR.x, MOTOR.y, MOTOR.z0 + 0.05], radio: 0.017, lados: 12, espejo: true },
  ...([1, -1] as const).map((s): Pieza => ({
    tipo: "tubo", id: "gondolas", acabado: "blanco", centro: [s * MOTOR.x, MOTOR.y],
    perfil: [[MOTOR.z1, 0], [MOTOR.z1 - 0.02, 0.035], [MOTOR.z1 - 0.06, 0.058], [MOTOR.z1 - 0.13, MOTOR.r], [MOTOR.z1 - 0.24, 0.064], [MOTOR.z0 + 0.08, 0.035], [MOTOR.z0, 0.018]],
  })),
  // Palas anchas, con el máximo hacia fuera y la punta redonda; cada hélice,
  // girada como en la foto de frente.
  ...([[1, 123], [-1, 17]] as const).map(([s, giro]): Pieza => ({
    tipo: "helice", id: "helices", acabado: "negro", en: [s * MOTOR.x, MOTOR.y, MOTOR.z1 - 0.05], radio: 0.725, palas: 2, ancho: 0.13, buje: 0, giro,
    forma: [[0, 0.18, 0.18], [0.15, 0.28, 0.28], [0.4, 0.42, 0.42], [0.65, 0.5, 0.5], [0.85, 0.46, 0.46], [0.96, 0.3, 0.3], [1, 0.08, 0.08]],
  })),
];

const PARTES: Parte[] = [
  {
    nombre: "Ala solar",
    en: [3.0, 0.15, -0.3],
    piezas: ["ala", "ala-fuera"],
    respaldo: "foto",
    fuentes: ["frente", "planta", "lado", "celulas"],
    texto: "25 m de punta a punta, más que un Boeing 737, y el avión entero pesa unos 75 kg. Arriba lleva módulos de células solares, negras y brillantes, entre tramos de película plateada: de día mueven los motores y cargan las baterías para pasar la noche. Así aguanta semanas a unos 20.000 m, por encima del tiempo y de los aviones de línea.",
    nota: "La envergadura es la oficial; el diedro y los tramos, de la foto de frente; la planta (1,5 m de cuerda en el centro y 1,0 m desde los quiebros), de la de desde arriba de Kenia enderezada con su cámara. El reparto de los módulos de células, medido en esa misma foto.",
  },
  {
    nombre: "Puntas caídas",
    en: [12.3, 1.0, -0.2],
    piezas: ["puntas", "luces", "antenas"],
    respaldo: "foto",
    fuentes: ["frente", "lado", "despegue"],
    texto: "Al final de cada ala, una pala que cae hacia fuera, al revés que los tramos de fuera, que suben, y se echa hacia atrás hasta acabar en pico. Es un marco forrado de película translúcida, con riostras en aspa y sin células. Justo antes, arriba, un bulto blanco con la luz de navegación y una antenita.",
    nota: "La forma y el extremo, de las fotos de frente y desde arriba, encajadas; las dos coinciden. Con las puntas, el ala sale de unos 26 m de punta a punta; la cifra oficial es de 25 m.",
  },
  {
    nombre: "Motores y hélices",
    en: [3.94, -0.04, 0.95],
    piezas: ["gondolas", "varillas-motor", "helices"],
    respaldo: "foto",
    fuentes: ["frente", "lado", "fabrica"],
    texto: "Dos motores eléctricos, cada uno en un huso blanco en la punta de una varilla de carbono que sale del borde de ataque, con una hélice de dos palas. Gastan más o menos lo que una bombilla.",
    nota: "La posición y la hélice, de la foto de frente; el huso y la varilla, de la de fábrica y la de Kenia de lado.",
  },
  {
    nombre: "Botalón y morro",
    en: [0, 0.1, 1.4],
    piezas: ["botalon", "morro", "bola", "soporte-bola", "carenado"],
    respaldo: "foto",
    fuentes: ["planta", "frente", "lado", "despegue"],
    texto: "No tiene fuselaje: un tubo fino de fibra de carbono lleva la cola, colgado bajo el centro del ala de un carenado negro. Por delante del ala asoma una varilla con una caja blanca en la punta y, junto al ala, una bola blanca.",
    nota: "Los largos, de la foto desde arriba de Kenia con la cámara encajada; la caja, también de la de Kenia de lado; la bola, triangulada con la de frente y la de desde arriba. El soporte de la bola no se distingue en ninguna foto: es una reconstrucción. Qué llevan la caja y la bola no se ha publicado.",
  },
  {
    nombre: "Cola en T",
    en: [1.2, 1.4, -4.9],
    piezas: ["deriva", "largueros-cola", "estabilizador", "remate-cola"],
    respaldo: "foto",
    fuentes: ["frente", "planta", "lado", "amanecer"],
    texto: "Una deriva alta y rectangular, un marco de carbono forrado de película, y encima el timón de profundidad, casi tan ancho como un coche largo.",
    nota: "El ancho del timón de profundidad, de la foto de frente; el alto de la deriva y su cuerda, de la de desde arriba y la de Kenia de lado.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => (v * K) / ESCALA;
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
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// La cara de arriba, medida en la foto desde arriba de Kenia con la cámara
// encajada (perfil de brillo a lo largo del ala, detrás del cajón, sobre la
// planta medida): módulos de células, negros con la cuadrícula, de 0,65 m a
// lo ancho, uno cada 1,53 m (centrados a 2,0, 3,5, 5,1 y 6,6 m del eje),
// casi de borde a borde; entre ellos, película plateada; en el centro, 3,4 m
// sin células. En cada tramo de fuera, tres, de 0,6 m, uno cada 1,76 m a lo
// largo del tramo (a 8,4, 10,2 y 11,9 m del eje; el lado derecho de la foto,
// porque en el izquierdo un foco tapa el tramo). Por delante, el cajón del
// borde de ataque, gris oscuro, en el primer 33 % de la cuerda; una tira
// blanca fina en el borde de ataque y otra de 7 cm en el de salida. Todo sigue la planta.
const MODULO = { ancho: 0.65, paso: 1.53, primero: 2.0, delante: 0.04, detras: 0.96 };
const FUERA_MOD = { ancho: 0.6, paso: 1.76, primero: 1.18 };
const CAJON = { cuerda: 0.33, color: "#4f555c" };
const ARRIBA: P3 = [0, 1, 0];
const ARRIBA_FUERA: P3 = [-Math.sin(rad(ALA.diedro)), Math.cos(rad(ALA.diedro)), 0];
// Un punto de la cuerda en x: del borde de ataque (0) al de salida (1).
const enCuerda = (x: number, f: number) => baAla(x) - f * (baAla(x) - bsAla(x));
// Dos filas de casillas a lo ancho del módulo y 22 a lo largo de la cuerda.
const moduloCentro = (x: number): Calca => {
  const z0 = enCuerda(x, MODULO.delante), z1 = enCuerda(x, MODULO.detras);
  return { sobre: ["ala"], en: [x, 0.3, (z0 + z1) / 2], desde: ARRIBA, tam: [MODULO.ancho, z0 - z1], dibujo: { tipo: "celdas", columnas: 2, filas: 22 }, espejo: true, capa: 2 };
};
// En los tramos de fuera, el ancho de la calca va a lo largo de la cuerda.
const enFuera = (d: number, dy = 0.3): P3 => [ALA.centro + d * Math.cos(rad(ALA.diedro)) - 0.08, d * Math.sin(rad(ALA.diedro)) + dy, 0];
const moduloFuera = (d: number): Calca => {
  const [x, y] = enFuera(d);
  const z0 = enCuerda(x, MODULO.delante), z1 = enCuerda(x, MODULO.detras);
  return { sobre: ["ala-fuera"], en: [x, y, (z0 + z1) / 2], desde: ARRIBA_FUERA, tam: [z0 - z1, FUERA_MOD.ancho], dibujo: { tipo: "celdas", columnas: 22, filas: 2 }, espejo: true, capa: 2 };
};
// Una franja a lo largo de un tramo del centro, de xa a xb (xa < xb, en
// cualquier lado), entre dos z que da zDe en cada x: un polígono en una calca
// que cubre el tramo. Sin `espejo`: con él, el dibujo del otro lado salía
// volteado y la franja, torcida al revés.
const franjaCentro = (xa: number, xb: number, zDe: (x: number) => [number, number], color: string, capa: number): Calca => {
  const [a0, a1] = zDe(xa), [b0, b1] = zDe(xb);
  const zMax = Math.max(a0, a1, b0, b1) + 0.02, zMin = Math.min(a0, a1, b0, b1) - 0.02;
  // En la calca vista desde arriba, la v del dibujo crece hacia atrás (−z).
  const v = (z: number) => (zMax - z) / (zMax - zMin);
  return {
    sobre: ["ala"], en: [(xa + xb) / 2, 0.3, (zMax + zMin) / 2], desde: ARRIBA, tam: [xb - xa, zMax - zMin], capa,
    dibujo: { tipo: "poligono", color, puntos: [[0, v(a0)], [1, v(b0)], [1, v(b1)], [0, v(a1)]] },
  };
};
const cajon = (x: number): [number, number] => [baAla(x) - 0.01, enCuerda(x, CAJON.cuerda)];
const tiraBa = (x: number): [number, number] => [baAla(x) + 0.005, baAla(x) - 0.045];
const tiraBs = (x: number): [number, number] => [bsAla(x) + 0.07, bsAla(x) - 0.005];
const TRAMOS: [number, number][] = [[0, 2.0], [2.0, ALA.centro], [-2.0, 0], [-ALA.centro, -2.0]];
// En los de fuera la cuerda no cambia: franjas rectas.
const franjaFuera = (z0: number, z1: number, color: string, capa: number): Calca =>
  ({ sobre: ["ala-fuera"], en: [...enFuera(ALA.fuera / 2).slice(0, 2), (z0 + z1) / 2] as P3, desde: ARRIBA_FUERA, tam: [z0 - z1, ALA.fuera], dibujo: { tipo: "rect", color }, espejo: true, capa });
const XF = X_FUERA;
const CALCAS: Calca[] = [
  ...Array.from({ length: 4 }, (_, i) => moduloCentro(MODULO.primero + i * MODULO.paso)),
  ...Array.from({ length: 3 }, (_, i) => moduloFuera(FUERA_MOD.primero + i * FUERA_MOD.paso)),
  ...TRAMOS.map(([a, b]) => franjaCentro(a, b, cajon, CAJON.color, 1)),
  ...TRAMOS.map(([a, b]) => franjaCentro(a, b, tiraBa, "#e6e9ea", 3)),
  ...TRAMOS.map(([a, b]) => franjaCentro(a, b, tiraBs, "#f2f3f1", 3)),
  franjaFuera(baAla(XF) - 0.01, enCuerda(XF, CAJON.cuerda), CAJON.color, 1),
  franjaFuera(baAla(XF) + 0.005, baAla(XF) - 0.045, "#e6e9ea", 3),
  franjaFuera(bsAla(XF) + 0.07, bsAla(XF) - 0.005, "#f2f3f1", 3),
  // Larguero oscuro del timón de profundidad, en su primer 20 %.
  ...[1, -1].map((l): Calca => {
    // Larguero oscuro del timón de profundidad, en su primer 20 %, siguiendo
    // el borde de ataque en flecha (un polígono por lado: con `espejo` sale
    // volteado).
    const zr = ESTAB.raiz[0], zp = ESTAB.punta[0], zMax = zr + 0.01, zMin = zp - 0.17, v = (z: number) => (zMax - z) / (zMax - zMin);
    const [i0, i1] = l > 0 ? [0, 1] : [1, 0];
    const pts: [number, number][] = [[i0, v(zr)], [i1, v(zp)], [i1, v(zp - 0.16)], [i0, v(zr - 0.16)]];
    return { sobre: ["estabilizador"], en: [(l * ESTAB.semi) / 2, ESTAB.y + 0.2, (zMax + zMin) / 2], desde: ARRIBA, tam: [ESTAB.semi, zMax - zMin], dibujo: { tipo: "poligono", color: "#2a2c2f", puntos: pts } };
  }),
];

// El marco de las puntas y los nervios de la deriva: líneas oscuras (fotos de
// frente, de Kenia de lado y del despegue).
const puntoPunta = (f: number, c: number): P3 => {
  // f: de la raíz (0) al codo (0,5) y al extremo (1); c: del borde de ataque
  // (0) al de salida (1).
  const k = Math.min(1, Math.floor(f * 2)), t = f * 2 - k;
  const a = PUNTA[k], b = PUNTA[Math.min(2, k + 1)];
  const [x, y, ba, bs] = a.map((v, i) => v + (b[i] - v) * t);
  return [x, y, ba - c * (ba - bs)];
};
const LARGUERO_COLA = COLA.ba - 0.43 * (COLA.ba - COLA.bs);
// Hacia fuera de la cara de arriba de la punta (entre la del primer tramo,
// casi horizontal, y la del segundo, casi vertical).
const FUERA_PUNTA: P3 = [0.7, 0.7, 0];
// Nervios del timón de profundidad, cada 0,2 m, de borde a borde (desde
// arriba); con el larguero oscuro pintado delante.
const NERVIOS_ESTAB = Array.from({ length: 11 }, (_, i) => 0.2 + i * 0.2).filter((x) => x < ESTAB.semi - 0.05);
const COSTURAS: Costura[] = [
  ...NERVIOS_ESTAB.map((x): Costura => ({ sobre: ["estabilizador"], desde: ARRIBA, espejo: true, puntos: [[x, ESTAB.y + 0.2, ESTAB.raiz[0] + ((ESTAB.punta[0] - ESTAB.raiz[0]) * x) / ESTAB.semi - 0.17], [x, ESTAB.y + 0.2, ESTAB.raiz[1] + ((ESTAB.punta[1] - ESTAB.raiz[1]) * x) / ESTAB.semi + 0.02]] })),
  // Nervio del codo, de borde a borde, y larguero a un cuarto de la cuerda.
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [0.05, 0.5, 0.95].map((c) => puntoPunta(0.5, c)) },
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [0.03, 0.25, 0.5, 0.75, 0.95].map((f) => puntoPunta(f, 0.25)) },
  // Deriva: cuatro nervios a lo largo (en el despegue, desde abajo: cinco
  // recuadros iguales) y un larguero al 43 % de la cuerda (Kenia de lado).
  ...[0.21, 0.42, 0.61, 0.81].map((k): Costura => {
    const y = BOTALON.y + k * (COLA.alto - BOTALON.y);
    return { sobre: ["deriva"], desde: [1, 0, 0], espejo: true, puntos: [[0.02, y, COLA.ba], [0.02, y, (COLA.ba + COLA.bs) / 2], [0.02, y, COLA.bs]] };
  }),
  { sobre: ["deriva"], desde: [1, 0, 0], espejo: true, puntos: [[0.02, BOTALON.y + 0.05, LARGUERO_COLA], [0.02, 0.55, LARGUERO_COLA], [0.02, COLA.alto - 0.03, LARGUERO_COLA]] },
  // Riostras en aspa de las puntas (Kenia de lado).
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [puntoPunta(0.03, 0.25), puntoPunta(0.25, 0.6), puntoPunta(0.47, 0.95)] },
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [puntoPunta(0.03, 0.95), puntoPunta(0.25, 0.6), puntoPunta(0.47, 0.25)] },
];
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

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
  // Los marcos de las puntas y de la deriva se ven bien en las fotos.
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura), opacidad: { juntas: 0.6 } },
  pais: bandera("GB"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "frente", imagen: "frente-arizona.jpg", titulo: "De frente sobre su carro en la pista de Arizona", medio: "AALTO HAPS", url: `${AALTO}Zephyr_OnRunway.jpg` },
    { id: "planta", imagen: "planta-kenia.jpg", titulo: "El Zephyr en Kenia, de noche, visto desde arriba en su carro (2025)", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Kenya_2025.png` },
    { id: "lado", imagen: "lado-kenia.jpg", titulo: "En Kenia, de noche, de lado y desde arriba, con el equipo alrededor (2025)", medio: "AALTO HAPS", url: `${AALTO}AALTO-Zephyr.png` },
    { id: "amanecer", imagen: "amanecer-arizona.jpg", titulo: "Al amanecer en Arizona, de frente y a la izquierda", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Sunrise.jpg` },
    { id: "despegue", imagen: "despegue.jpg", titulo: "Despegando en Arizona, visto desde abajo", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Take-off.jpg` },
    { id: "aterrizado", imagen: "aterrizado-kenia.jpg", titulo: "Aterrizado sobre la panza en Kenia (2025)", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Kenya_Landing_2025.jpg` },
    { id: "vuelo", imagen: "vuelo-kenia.jpg", titulo: "En vuelo bajo sobre Kenia (2025)", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Landing_2025.jpg` },
    { id: "fabrica", imagen: "fabrica.jpg", titulo: "En la fábrica de Farnborough, sobre su bancada", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Production_Hangar.jpg` },
    { id: "celulas", imagen: "celulas.jpg", titulo: "Las células solares del ala, de cerca", medio: "AALTO HAPS", url: `${AALTO}Zephyr_Solar_Cells.jpg` },
    { id: "dvids", imagen: "vuelo-yuma.jpg", titulo: "En vuelo sobre Yuma (Arizona), 2022", medio: "Ejército de EE. UU. (DVIDS)", url: "https://www.dvidshub.net/image/6883883" },
    { id: "airbus", titulo: "Zephyr", medio: "Airbus", url: "https://www.airbus.com/en/products-services/defence/uas/zephyr" },
    { id: "record", titulo: "Zephyr sets world record for longest continuous flight, flying 67 days in stratosphere", medio: "AALTO HAPS", url: "https://www.aaltohaps.com/zephyr-sets-world-record-for-longest-continuous-flight-flying-67-days-in-stratosphere/" },
  ],
};

export default maqueta;
