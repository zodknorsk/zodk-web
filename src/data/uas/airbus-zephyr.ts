// Maqueta del Airbus Zephyr S (Zephyr 8), el avión solar de gran altitud que
// hoy opera AALTO, filial de Airbus: el de Kenia de 2025 (AALTOPORT,
// Laikipia), sin carga a la vista. Envergadura oficial, 25 m; lo demás,
// medido en las fotos de prensa de AALTO a tamaño completo: la de frente en
// la pista de Arizona (cámara encajada; las hélices, a ±4 m, dan 245 px/m)
// para el diedro, las puntas, la cola y las hélices; la de desde arriba en
// Kenia para la planta (escala con las hélices a lo ancho y con el alto de la
// deriva: 0,0103 m/px a lo largo); y la de Kenia de lado, con personas al
// lado, para las góndolas, el morro y la deriva. Todo se escribe en metros y
// al final se pasa a unidades de la maqueta (1 unidad = 10 m).
// Imágenes en arte/uas-fuentes/airbus-zephyr/ (fuera de Git; enlaces en
// docs/drones/airbus-zephyr.md).
import type { Calca, Costura, Maqueta, Parte, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 10;

const AALTO = "https://www.aaltohaps.com/wp-content/uploads/2025/03/";

type P3 = [number, number, number];
type Est = [number, number, number, number, number];

// Ala en tres tramos (foto de frente): el del centro, recto y sin diedro, de
// 14,6 m; los de fuera, de 5 m, suben 14°. Cuerda de 1,5 m, la misma hasta
// las puntas (desde arriba: 144 px); grueso de 0,18 m (de frente, 45-55 px).
// Las puntas, una pala que se echa atrás hasta acabar en pico: de frente,
// primero sale casi en horizontal (cae 0,3 m en 0,75 m) y desde un codo cae
// casi en vertical; su extremo, a 13,15 m del centro, a 0,64 m de alto y
// 0,5 m por detrás del borde de salida (las dos fotos encajadas, las dos
// puntas). Con ellas, el ala mide unos 26 m de punta a punta; la cifra
// oficial es de 25 m.
const ALA = { y: 0, centro: 7.3, fuera: 5.0, diedro: 14, ba: 0.5, bs: -1.0, t: 0.18 };
const rad = (g: number) => (g * Math.PI) / 180;
const X_FUERA = ALA.centro + ALA.fuera * Math.cos(rad(ALA.diedro));
const SUBE_FUERA = ALA.fuera * Math.sin(rad(ALA.diedro));
// Raíz, codo y extremo de la punta: [x, y, borde de ataque, de salida, grueso].
const PUNTA: [number, number, number, number, number][] = [
  [X_FUERA, SUBE_FUERA, ALA.ba, ALA.bs, 0.13],
  [12.9, 1.0, -0.4, -1.35, 0.08],
  [13.15, 0.62, -1.3, -1.55, 0.04],
];
// Hueco entre tramos (las juntas de las fotos de fábrica).
const HUECO = 0.006;
const EST_CENTRO: Est[] = [[0, ALA.ba, ALA.bs, ALA.t, 0], [ALA.centro, ALA.ba, ALA.bs, ALA.t, 0]];
const EST_FUERA: Est[] = [[ALA.centro + HUECO, ALA.ba, ALA.bs, ALA.t, 0], [X_FUERA, ALA.ba, ALA.bs, 0.15, SUBE_FUERA]];
const EST_PUNTA: Est[] = PUNTA.map(([x, y, ba, bs, t], i) => [i ? x : x + HUECO, ba, bs, t, i ? y : y - HUECO]);

// Botalón de carbono: de un carenado negro bajo el centro del ala, que sigue
// 1,1 m por detrás del borde de salida (desde arriba, de frente y en el
// despegue), a la deriva, 3,46 m por detrás del borde de salida. Por delante,
// un tramo corto a la altura del ala, con una caja blanca en la punta, 1,1 m
// por delante del borde de ataque, y una bola blanca de 0,27 m sobre él,
// 0,3 m por delante del borde de ataque, con la cima a 0,35 m: las dos fotos
// encajadas (de frente y desde arriba) la ponen en el mismo sitio. En la foto
// de Kenia de lado, la bola es el bulto blanco junto al borde de ataque y la
// caja, el bloque con conectores.
const BOTALON = { y: -0.14, r: 0.038, cola: -5.3 };
const DELANTE = { y: 0.07, r: 0.03, punta: ALA.ba + 1.1 };
const CAJA = { largo: 0.45, ancho: 0.12, alto: 0.14 };
const BOLA = { z: ALA.ba + 0.31, y: 0.215, r: 0.135 };

// Cola en T (fotos de frente, desde arriba y de Kenia de lado): deriva de
// 0,8 m de cuerda que sube del botalón a 1,25 m, con un larguero oscuro en
// cada borde y nervios; encima, el timón de profundidad de 4,7 m de punta a
// punta (de frente, 985 px), con la misma cuerda que la deriva (desde
// arriba), un larguero oscuro junto al borde de ataque y nervios cada 0,2 m.
const COLA = { ba: ALA.bs - 3.46, bs: ALA.bs - 4.26, alto: 1.25 };
const ESTAB = { y: COLA.alto + 0.03, semi: 2.35 };

// Motores: un huso blanco de 0,42 m en la punta de una varilla negra que sale
// del borde de ataque, a 3,94 m del centro (de frente, encajada), casi a la
// altura del ala, con la hélice negra de dos palas delante (1,45 m; de
// frente, 364 px), con el buje casi a la altura del ala. La punta del huso, 0,7 m por delante del borde de ataque
// (desde arriba, 59 px); la varilla asoma casi tanto como el huso (fábrica y
// Kenia de lado).
const MOTOR = { x: 3.94, y: -0.04, z0: ALA.ba + 0.28, z1: ALA.ba + 0.7, r: 0.07 };

const PIEZAS: Pieza[] = [
  { tipo: "ala", id: "ala", acabado: "plata-ze", y: ALA.y, estaciones: EST_CENTRO },
  { tipo: "ala", id: "ala-fuera", acabado: "plata-ze", y: ALA.y, estaciones: EST_FUERA },
  { tipo: "ala", id: "puntas", acabado: "film-ze", y: ALA.y, estaciones: EST_PUNTA },
  // Botalón, tramo de delante con su caja y su bola, y carenado bajo el ala.
  { tipo: "tubo", id: "botalon", acabado: "carbono-wh", centro: [0, BOTALON.y], perfil: [[ALA.ba - 0.4, BOTALON.r], [BOTALON.cola + 0.02, BOTALON.r], [BOTALON.cola, BOTALON.r * 0.6]] },
  { tipo: "tubo", id: "botalon", acabado: "carbono-wh", centro: [0, DELANTE.y], perfil: [[DELANTE.punta - CAJA.largo + 0.02, DELANTE.r], [ALA.ba - 0.15, DELANTE.r]] },
  { tipo: "caja", id: "morro", acabado: "blanco", centro: [0, DELANTE.y, DELANTE.punta - CAJA.largo / 2], tam: [CAJA.ancho, CAJA.alto, CAJA.largo], redondeo: 0.03 },
  { tipo: "tubo", id: "bola", acabado: "blanco", centro: [0, BOLA.y], perfil: Array.from({ length: 13 }, (_, i): [number, number] => { const a = (i / 12) * Math.PI; return [BOLA.z + BOLA.r * Math.cos(a), BOLA.r * Math.sin(a)]; }) },
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
  { tipo: "ala", id: "estabilizador", acabado: "film-ze", y: ESTAB.y, estaciones: [[0, COLA.ba + 0.01, COLA.bs - 0.01, 0.06], [ESTAB.semi, COLA.ba - 0.01, COLA.bs + 0.01, 0.045]] },
  // Luz de navegación: un bulto blanco sobre el final de cada tramo de fuera,
  // justo en el quiebro (de frente, en las dos puntas; desde arriba).
  { tipo: "caja", id: "luces", acabado: "blanco", centro: [X_FUERA - 0.07, SUBE_FUERA - 0.07 * Math.tan(rad(ALA.diedro)) + 0.07, -0.37], tam: [0.1, 0.07, 0.18], redondeo: 0.035, espejo: true },
  // Antenita oscura sobre el tramo de fuera, poco antes del quiebro (de
  // frente, en los dos lados).
  { tipo: "varilla", id: "luces", acabado: "carbono-wh", desde: [X_FUERA - 0.3, SUBE_FUERA - 0.3 * Math.tan(rad(ALA.diedro)) + 0.04, -0.3], hasta: [X_FUERA - 0.3, SUBE_FUERA - 0.3 * Math.tan(rad(ALA.diedro)) + 0.2, -0.3], radio: 0.008, lados: 8, espejo: true },
  { tipo: "caja", id: "remate-cola", acabado: "carbono-wh", centro: [0, ESTAB.y + 0.025, (COLA.ba + COLA.bs) / 2], tam: [0.07, 0.05, 0.8], redondeo: 0.02 },
  // Motores: varilla, huso y hélice.
  { tipo: "varilla", id: "varillas-motor", acabado: "carbono-wh", desde: [MOTOR.x, MOTOR.y, ALA.ba - 0.15], hasta: [MOTOR.x, MOTOR.y, MOTOR.z0 + 0.05], radio: 0.017, lados: 12, espejo: true },
  ...([1, -1] as const).map((s): Pieza => ({
    tipo: "tubo", id: "gondolas", acabado: "blanco", centro: [s * MOTOR.x, MOTOR.y],
    perfil: [[MOTOR.z1, 0], [MOTOR.z1 - 0.02, 0.035], [MOTOR.z1 - 0.06, 0.058], [MOTOR.z1 - 0.13, MOTOR.r], [MOTOR.z1 - 0.24, 0.064], [MOTOR.z0 + 0.08, 0.035], [MOTOR.z0, 0.018]],
  })),
  { tipo: "helice", id: "helices", acabado: "negro", en: [MOTOR.x, MOTOR.y, MOTOR.z1 - 0.05], radio: 0.725, palas: 2, ancho: 0.12, buje: 0, espejo: true, giro: 55 },
];

const PARTES: Parte[] = [
  {
    nombre: "Ala solar",
    en: [3.0, 0.15, -0.3],
    piezas: ["ala", "ala-fuera"],
    respaldo: "foto",
    fuentes: ["frente", "planta", "lado", "celulas"],
    texto: "25 m de punta a punta, más que un Boeing 737, y el avión entero pesa unos 75 kg. Arriba lleva módulos de células solares, negras y brillantes, entre tramos de película plateada: de día mueven los motores y cargan las baterías para pasar la noche. Así aguanta semanas a unos 20.000 m, por encima del tiempo y de los aviones de línea.",
    nota: "La envergadura es la oficial; la cuerda, el diedro y los tramos, medidos en las fotos de Kenia y de Arizona. El paso de los módulos de células, de la foto de Kenia de lado; aproximado.",
  },
  {
    nombre: "Puntas caídas",
    en: [12.3, 1.0, -0.2],
    piezas: ["puntas", "luces"],
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
    piezas: ["botalon", "morro", "bola", "carenado"],
    respaldo: "foto",
    fuentes: ["planta", "frente", "lado", "despegue"],
    texto: "No tiene fuselaje: un tubo fino de fibra de carbono lleva la cola, colgado bajo el centro del ala de un carenado negro. Por delante del ala asoma un tramo corto con una caja blanca en la punta y, encima, una bola blanca.",
    nota: "Los largos, de la foto desde arriba de Kenia con la cámara encajada; la altura de la bola, de esa y de la de frente, que coinciden. Qué llevan la caja y la bola no se ha publicado.",
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
// encajada (perfil de brillo a lo largo del ala): módulos de células, negros
// con la cuadrícula, de 0,55 m a lo ancho, uno cada 1,55 m, casi de borde a
// borde; entre ellos, película plateada; en el centro, 3,4 m sin células. En
// los tramos de fuera, más juntos (cada 1,2 m) y algo más estrechos. Por
// delante, el cajón del borde de ataque, gris oscuro, en el primer 28 % de la
// cuerda; detrás, una tira blanca fina en el borde de salida.
const MODULO = { ancho: 0.55, paso: 1.55, primero: 1.95, delante: 0.04, detras: 0.96 };
const FUERA_MOD = { ancho: 0.45, paso: 1.2, primero: 0.72 };
const ARRIBA: P3 = [0, 1, 0];
const ARRIBA_FUERA: P3 = [-Math.sin(rad(ALA.diedro)), Math.cos(rad(ALA.diedro)), 0];
const enCuerda = (f: number) => ALA.ba - f * (ALA.ba - ALA.bs);
const Z_MOD = (enCuerda(MODULO.delante) + enCuerda(MODULO.detras)) / 2;
const LARGO_MOD = enCuerda(MODULO.delante) - enCuerda(MODULO.detras);
const CAJON = { cuerda: 0.28, color: "#4f555c" };
const Z_CAJON = enCuerda(CAJON.cuerda / 2), LARGO_CAJON = CAJON.cuerda * (ALA.ba - ALA.bs);
// Dos filas de casillas a lo ancho del módulo y 22 a lo largo de la cuerda.
const moduloCentro = (x: number): Calca =>
  ({ sobre: ["ala"], en: [x, 0.3, Z_MOD], desde: ARRIBA, tam: [MODULO.ancho, LARGO_MOD], dibujo: { tipo: "celdas", columnas: 2, filas: 22 }, espejo: true, capa: 2 });
// En los tramos de fuera, el ancho de la calca va a lo largo de la cuerda.
const enFuera = (d: number, dy = 0.3): P3 => [ALA.centro + d * Math.cos(rad(ALA.diedro)) - 0.08, d * Math.sin(rad(ALA.diedro)) + dy, 0];
const moduloFuera = (d: number): Calca => {
  const [x, y] = enFuera(d);
  return { sobre: ["ala-fuera"], en: [x, y, Z_MOD], desde: ARRIBA_FUERA, tam: [LARGO_MOD, FUERA_MOD.ancho], dibujo: { tipo: "celdas", columnas: 22, filas: 2 }, espejo: true, capa: 2 };
};
const franja = (z: number, ancho: number, color: string, capa: number): Calca[] => [
  { sobre: ["ala"], en: [ALA.centro / 2, 0.3, z], desde: ARRIBA, tam: [ALA.centro, ancho], dibujo: { tipo: "rect", color }, espejo: true, capa },
  { sobre: ["ala-fuera"], en: [...enFuera(ALA.fuera / 2).slice(0, 2), z] as P3, desde: ARRIBA_FUERA, tam: [ancho, ALA.fuera], dibujo: { tipo: "rect", color }, espejo: true, capa },
];
const CALCAS: Calca[] = [
  ...Array.from({ length: 4 }, (_, i) => moduloCentro(MODULO.primero + i * MODULO.paso)),
  ...Array.from({ length: 4 }, (_, i) => moduloFuera(FUERA_MOD.primero + i * FUERA_MOD.paso)),
  ...franja(Z_CAJON, LARGO_CAJON, CAJON.color, 1),
  ...franja(ALA.ba - 0.02, 0.05, "#e6e9ea", 3),
  ...franja(ALA.bs + 0.025, 0.04, "#f2f3f1", 3),
  // Larguero oscuro del timón de profundidad, en su primer 20 %.
  { sobre: ["estabilizador"], en: [ESTAB.semi / 2, ESTAB.y + 0.2, COLA.ba - 0.09], desde: ARRIBA, tam: [ESTAB.semi, 0.16], dibujo: { tipo: "rect", color: "#2a2c2f" }, espejo: true },
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
const NERVIOS_ESTAB = Array.from({ length: 11 }, (_, i) => 0.2 + i * 0.2);
const COSTURAS: Costura[] = [
  ...NERVIOS_ESTAB.map((x): Costura => ({ sobre: ["estabilizador"], desde: ARRIBA, espejo: true, puntos: [[x, ESTAB.y + 0.2, COLA.ba - 0.15], [x, ESTAB.y + 0.2, COLA.bs + 0.02]] })),
  // Nervio del codo, de borde a borde, y larguero a un cuarto de la cuerda.
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [0.05, 0.5, 0.95].map((c) => puntoPunta(0.5, c)) },
  { sobre: ["puntas"], desde: FUERA_PUNTA, espejo: true, puntos: [0.03, 0.25, 0.5, 0.75, 0.95].map((f) => puntoPunta(f, 0.25)) },
  // Deriva: tres nervios a lo largo y un larguero al 43 % de la cuerda
  // (Kenia de lado).
  ...[0.28, 0.53, 0.8].map((k): Costura => {
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
