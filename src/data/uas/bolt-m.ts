// Maqueta del Bolt-M de Anduril, medida en capturas del modelo 3D de su web
// (anduril.com/bolt) con una cámara propia casi ortográfica (perfil, planta,
// frente, detrás y de cerca), y con el acabado y las marcas de las fotos de
// los Marines (BLT 1/8, Camp Lejeune, 28-ago-2026): el ejemplar B40E. Anduril
// no da medidas: la escala sale del B44C en la mano del coronel, con un vaso
// al lado (cuerpo de unos 50 cm). Fotos, capturas y herramientas en
// arte/uas-fuentes/bolt-m/ (fuera de Git). 1 unidad = 50 cm.
import type { Acabado, Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const BOLT = "https://www.anduril.com/bolt";
const DVIDS = "https://www.dvidshub.net/image/";
const IUS = "https://insideunmannedsystems.com/anduril-unveils-bolt-isr-drone-and-loitering-munition/";

// Todo en unidades del modelo de Anduril (1 = 20 cm), en sus ejes, que son
// los de la maqueta: x hacia el costado izquierdo del dron de verdad, y
// arriba, z hacia el morro. Al final se pasa a unidades (1 = 50 cm).
const ESCALA = 0.5;
const A = 0.2;

type P2 = [number, number];
type P3 = [number, number, number];

// Motores: x a cada lado, z delante y detrás; y del eje de su brazo (los de
// detrás van 19 cm más altos, en las fotos y en el modelo).
const MX = 2.38;
const MOTOR_D = { z: 1.73, y: -0.006 }, MOTOR_T = { z: -1.9, y: 0.193 };
// Brazos: de la bisagra del costado al motor, vistos desde arriba (23,5°
// hacia delante los de delante, 32,6° hacia atrás los de detrás).
const BRAZO_D: P2 = [0.61, 0.962], BRAZO_T: P2 = [0.56, -0.742];
const R_TUBO = 0.093;
// Un punto del brazo a la x dada.
const enBrazo = (b: P2, m: { z: number; y: number }, x: number): P3 => [x, m.y, b[1] + ((m.z - b[1]) * (x - b[0])) / (MX - b[0])];
const angBrazo = (b: P2, m: { z: number }) => Math.atan2(m.z - b[1], MX - b[0]);

// Pieza hecha de secciones a lo largo de z (una `pila` tumbada): cada
// sección, en [x, y] a esa z, de detrás a delante. Todas con los mismos puntos.
const aLoLargoZ = (id: string, acabado: Acabado, secciones: { z: number; s: P2[] }[]): Pieza => ({
  tipo: "pila", id, acabado, girar: { centro: [0, 0, 0], eje: "x", grados: 90 },
  niveles: secciones.map(({ z, s }) => ({ y: z, planta: s.map(([x, y]): P2 => [x, -y]) })),
});
// Media sección (x ≥ 0, de arriba abajo) completada con su reflejo.
const entera = (m: P2[]): P2[] => [...m, ...m.slice(1, -1).reverse().map(([x, y]): P2 => [-x, y])];

// La sección recortada entre dos alturas y estrechada (las caras
// achaflanadas del frente y de la trasera).
const recortar = (s: P2[], abajo: number, arriba: number, k = 1): P2[] => s.map(([x, y]) => [x * k, Math.min(arriba, Math.max(abajo, y))]);
// Rectángulo [x, z] con las esquinas achaflanadas, centrado en x = 0.
const rectangulo = (x: number, z0: number, z1: number, c: number): P2[] => [
  [x - c, z0], [x, z0 + c], [x, z1 - c], [x - c, z1], [-x + c, z1], [-x, z1 - c], [-x, z0 + c], [-x + c, z0],
];
// Superelipse de medio ancho a y medio alto b alrededor de (0, cy): las
// secciones de la cabeza de guerra, un óvalo algo cuadrado.
const superelipse = (a: number, b: number, cy: number, p = 2.6, n = 28): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    return [a * Math.sign(c) * Math.abs(c) ** (2 / p), cy + b * Math.sign(s) * Math.abs(s) ** (2 / p)];
  });

// Carcasa: el cuerpo claro de arriba, calcado del modelo (perfil, planta,
// frente y detrás). Lomo plano a 0,184, panza a −0,257 y medio ancho 0,385,
// con el canto achaflanado; el frente, con un chaflán arriba y otro abajo; la
// trasera cae de 0,184 a 0,13 y a 0 antes de la cara de atrás. Las aletas del
// disipador van en el canto y el costado (de z −0,45 a 0,95) y en el centro
// del lomo, delante (z 0,72 a 1,06) y detrás (z −0,08 a 0,24) de la cúpula
// cuadrada: ahí la carcasa se mete y las aletas, piezas aparte, rellenan
// hasta la forma de fuera.
const CANTO: P2[] = [[0.28, 0.184], [0.3, 0.175], [0.37, 0.11], [0.385, 0.09], [0.385, -0.05]];
const CANTO_METIDO: P2[] = [[0.28, 0.164], [0.29, 0.158], [0.355, 0.098], [0.365, 0.08], [0.365, -0.05]];
const LOMO = 0.184, LOMO_METIDO = 0.16, ALETA_X = 0.215, PANZA = -0.257;
const seccionCarcasa = (costado: boolean, centro: boolean): P2[] => entera([
  [0, centro ? LOMO_METIDO : LOMO], [ALETA_X, centro ? LOMO_METIDO : LOMO], [ALETA_X + 0.005, LOMO],
  ...(costado ? CANTO_METIDO : CANTO), [0.385, -0.235], [0.365, PANZA], [0, PANZA],
]);
const ALETAS_COSTADO: P2 = [-0.45, 0.95];
const ALETAS_CENTRO: P2[] = [[0.72, 1.06], [-0.08, 0.24]];
const dentro = (z: number, [a, b]: P2) => z >= a && z <= b;
const Z_CARCASA = [-0.94, -0.4501, -0.45, -0.0801, -0.08, 0.24, 0.2401, 0.72, 0.7201, 0.95, 0.9501, 1.06, 1.0601, 1.08];
const LISA = seccionCarcasa(false, false);
const nivelesCarcasa = [
  { z: -1.01, s: recortar(LISA, PANZA, -0.04, 0.98) },
  { z: -0.991, s: recortar(LISA, PANZA, 0.008) },
  { z: -0.951, s: recortar(LISA, PANZA, 0.131) },
  ...Z_CARCASA.map((z) => ({ z, s: seccionCarcasa(dentro(z, ALETAS_COSTADO), ALETAS_CENTRO.some((r) => dentro(z, r))) })),
  { z: 1.187, s: recortar(LISA, -0.218, 0.066, 0.97) },
];
// Una aleta del costado: lo que va del canto metido al de fuera, de 1,4 cm de
// grueso, cada 3,5 cm.
const PERFIL_ALETA: P2[] = [...CANTO, ...CANTO_METIDO.slice().reverse()];
const aletasCostado: Pieza[] = [];
for (let z = ALETAS_COSTADO[0] + 0.01; z + 0.014 <= ALETAS_COSTADO[1]; z += 0.035) {
  aletasCostado.push({ tipo: "prisma", id: "aletas", acabado: "blanco-bo", eje: "z", y: z, alto: 0.014, espejo: true, planta: PERFIL_ALETA });
}
const aletasCentro: Pieza[] = ALETAS_CENTRO.flatMap(([a, b]) => {
  const out: Pieza[] = [];
  for (let z = a + 0.008; z + 0.012 <= b; z += 0.03) {
    out.push({ tipo: "prisma", id: "aletas-2", acabado: "blanco-bo", simetrica: true, y: LOMO_METIDO, alto: LOMO - LOMO_METIDO, planta: [[0, z], [ALETA_X, z], [ALETA_X, z + 0.012], [0, z + 0.012]] });
  }
  return out;
});

// Hombros: los bloques de las bisagras, que salen de los costados de la
// carcasa. Delante, en cuña: llegan a x 0,566 entre y −0,19 y 0 y el lomo baja
// hacia fuera desde 0,14. Detrás, un escudo de ±0,545 hasta y 0,02 con la
// cumbre en 0,17 y, abajo, la repisa de ±0,553. Plantas [x, z] por alturas.
const HOMBRO_D: { y: number; planta: P2[] }[] = [
  { y: PANZA, planta: [[0.3, 1.1], [0.36, 1.1], [0.5, 1.03], [0.522, 0.98], [0.522, 0.86], [0.47, 0.8], [0.3, 0.78]] },
  { y: -0.19, planta: [[0.3, 1.15], [0.35, 1.15], [0.54, 1.06], [0.566, 1.02], [0.566, 0.86], [0.48, 0.79], [0.3, 0.76]] },
  { y: 0.0, planta: [[0.3, 1.18], [0.33, 1.18], [0.56, 1.078], [0.566, 1.034], [0.566, 0.85], [0.45, 0.8], [0.3, 0.72]] },
  { y: 0.14, planta: [[0.3, 1.12], [0.31, 1.12], [0.33, 1.1], [0.34, 1.06], [0.34, 0.86], [0.32, 0.8], [0.3, 0.76]] },
];
const HOMBRO_T: { y: number; planta: P2[] }[] = [
  { y: PANZA, planta: [[0.3, -0.5], [0.4, -0.52], [0.511, -0.6], [0.511, -0.98], [0.47, -1.03], [0.3, -1.03]] },
  { y: -0.19, planta: [[0.3, -0.5], [0.42, -0.53], [0.553, -0.6], [0.553, -0.99], [0.51, -1.047], [0.3, -1.047]] },
  { y: -0.13, planta: [[0.3, -0.5], [0.42, -0.54], [0.547, -0.6], [0.547, -0.97], [0.47, -1.01], [0.3, -1.01]] },
  { y: 0.02, planta: [[0.3, -0.48], [0.42, -0.55], [0.545, -0.62], [0.545, -0.81], [0.42, -0.9], [0.3, -0.99]] },
  { y: 0.17, planta: [[0.3, -0.5], [0.38, -0.55], [0.44, -0.62], [0.44, -0.72], [0.38, -0.8], [0.3, -0.95]] },
];

// Batería: caja negra de lados rectos (±0,254) bajo la carcasa, de z 0,93 a
// −1,03, con la panza achaflanada a los lados y un chaflán grande abajo
// detrás (de z −0,89 a −1,01).
const BATERIA: P2[] = entera([[0, PANZA], [0.254, PANZA], [0.254, -0.62], [0.235, -0.637], [0, -0.637]]);

// Panel lateral claro (el del «002»): una sola placa en zeta calcada del
// perfil. Arriba, vertical sobre el costado: una barra de z −0,51 a 0,68 que
// acaba en flecha detrás, y en el morro, los lados de la cámara. Por debajo
// de y −0,26 se inclina hacia dentro (de x 0,40 a 0,28): baja en diagonal
// por el morro y sube en otra hasta la barra. Contornos [z, y].
const PANEL_BARRA: P2[] = [[-0.462, -0.251], [-0.511, -0.175], [-0.361, -0.035], [0.644, -0.035], [0.678, -0.07], [0.682, -0.088], [0.611, -0.173], [0.653, -0.234], [0.684, -0.26], [-0.446, -0.26]];
const PANEL_MORRO: P2[] = [[1.111, -0.26], [1.156, -0.229], [1.176, -0.06], [1.19, -0.045], [1.66, -0.045], [1.68, -0.1], [1.678, -0.218], [1.656, -0.26]];
// La parte de abajo, con y desde la doblez (y + 0,26).
const PANEL_ABAJO: P2[] = [[0.296, 0], [1.656, 0], [0.993, -0.356], [0.57, -0.356], [0.539, -0.335], [0.325, -0.02]];

// Cámara (gimbal de dos ejes): cabeza negra que asoma delante de la
// carcasa entre los lados del panel, con el objetivo grande y dos pequeños,
// dentro de una horquilla en U (frente, planta y lado, calcados del modelo).
const CAMARA = { x0: -0.12, x1: 0.216, y0: -0.212, y1: 0.068, z0: 1.275, z1: 1.6 };

// Cabeza de guerra: un vaso de sección oval algo cuadrada (ancho 0,52, alto
// 0,43) con la cara muy abombada hacia delante y arriba (17,5° sobre la horizontal),
// sobre el lomo detrás; se estrecha hacia atrás hasta los enganches.
// Secciones a lo largo de su eje desde el aro de la cara: [s, medio ancho,
// medio alto].
const CABEZA = { y: 0.44, z: -0.21, ang: -17.5 };
const vaso = (id: string, acabado: Acabado, perfil: [number, number, number][]): Pieza => ({
  ...aLoLargoZ(id, acabado, perfil.map(([s, a, b]) => ({ z: CABEZA.z + s, s: superelipse(a, b, CABEZA.y) }))),
  girarLuego: { centro: [0, CABEZA.y, CABEZA.z], eje: "x", grados: CABEZA.ang },
});

// Bisagras: sobre cada hombro, un tetón redondo claro; encima, la rótula
// negra facetada; el tubo entra en un casquillo negro, y junto a él va el
// pestillo, una paleta plana con agujeros y el testigo verde en la punta (el
// de detrás, con un gancho arriba). Planta y alturas del modelo.
const PESTILLO_D: P2[] = [[1.04, 0.995], [1.055, 0.955], [0.74, 0.905], [0.63, 0.76], [0.57, 0.77], [0.66, 0.93], [0.72, 0.99]];
const PESTILLO_T: P2[] = [[1.01, -0.76], [1.0, -0.82], [0.72, -0.73], [0.62, -0.63], [0.66, -0.6], [0.74, -0.68]];

const PIEZAS: Pieza[] = [
  aLoLargoZ("carcasa", "blanco-bo", nivelesCarcasa),
  ...aletasCostado,
  ...aletasCentro,
  { tipo: "pila", id: "hombros", acabado: "blanco-bo", espejo: true, niveles: HOMBRO_D },
  { tipo: "pila", id: "hombros-2", acabado: "blanco-bo", espejo: true, niveles: HOMBRO_T },
  // La repisa de la trasera, bajo el panel de estado (perfil y detrás).
  { tipo: "prisma", id: "repisa", acabado: "blanco-bo", simetrica: true, y: -0.215, alto: 0.065, chaflanArriba: [0.015, 0.015], planta: [[0, -0.95], [0.42, -0.95], [0.42, -1.047], [0, -1.047]] },
  aLoLargoZ("bateria", "negro-bo", [
    { z: -1.032, s: recortar(BATERIA, -0.459, PANZA) },
    { z: -1.01, s: recortar(BATERIA, -0.5, PANZA) },
    { z: -0.89, s: BATERIA },
    { z: 0.93, s: BATERIA },
  ]),
  // Los cierres de la batería, a los lados junto a la trasera.
  { tipo: "caja", id: "cierres", acabado: "negro-bo", espejo: true, centro: [0.277, -0.34, -0.96], tam: [0.046, 0.107, 0.1], redondeo: 0.01 },
  // Bajo la cámara, el bloque oscuro del frente de la batería.
  { tipo: "caja", id: "frente", acabado: "negro-bo", centro: [0, -0.36, 1.013], tam: [0.66, 0.2, 0.17], redondeo: 0.02 },
  { tipo: "placa", id: "panel", acabado: "blanco-bo", plano: "vertical", x: 0.395, grosor: 0.02, espejo: true, bisel: 0.005, planta: PANEL_BARRA },
  { tipo: "placa", id: "panel-2", acabado: "blanco-bo", plano: "vertical", x: 0.385, grosor: 0.02, espejo: true, bisel: 0.005, planta: PANEL_MORRO },
  { tipo: "placa", id: "panel-3", acabado: "blanco-bo", plano: "vertical", x: 0.395, y: -0.26, grosor: 0.02, espejo: true, bisel: 0.005, inclinacion: 18.6, planta: PANEL_ABAJO },
  // Abajo, en la punta del panel, una cartela hacia dentro (frente).
  { tipo: "prisma", id: "cartelas", acabado: "blanco-bo", eje: "z", espejo: true, y: 0.97, alto: 0.02, planta: [[0.31, -0.464], [0.2, -0.464], [0.28, -0.61]] },
  // Cúpula cuadrada del lomo, negra: la cara de atrás en rampa suave y la de
  // delante más empinada (perfil).
  { tipo: "pila", id: "cupula", acabado: "negro-bo", niveles: [
    { y: LOMO - 0.005, planta: rectangulo(0.21, 0.231, 0.718, 0.04) },
    { y: 0.345, planta: rectangulo(0.19, 0.287, 0.7, 0.04) },
    { y: 0.379, planta: rectangulo(0.15, 0.394, 0.673, 0.03) },
  ] },
  // Horquilla de la cámara: una banda vertical en U que rodea la cabeza por
  // los lados y por detrás, abierta delante (planta y frente).
  { tipo: "prisma", id: "horquilla", acabado: "negro", y: -0.24, alto: 0.29, chaflanArriba: [0.005, 0.005], planta: [
    [0.307, 1.666], [0.307, 1.25], [0.267, 1.2], [-0.233, 1.2], [-0.273, 1.25], [-0.273, 1.666],
    [-0.248, 1.666], [-0.248, 1.26], [-0.218, 1.225], [0.252, 1.225], [0.282, 1.26], [0.282, 1.666],
  ] },
  // Los tetones de giro, por fuera de la banda a cada lado.
  { tipo: "varilla", id: "horquilla-2", acabado: "negro", desde: [0.3, -0.1, 1.45], hasta: [0.36, -0.1, 1.45], radio: 0.042, lados: 24 },
  { tipo: "varilla", id: "horquilla-2", acabado: "negro", desde: [-0.265, -0.1, 1.45], hasta: [-0.325, -0.1, 1.45], radio: 0.042, lados: 24 },
  // La cabeza: la caja de los objetivos, el motor alto a la derecha (x
  // negativa), otro pequeño a la izquierda, la tapa de arriba y el motor
  // ancho de debajo.
  { tipo: "caja", id: "camara", acabado: "negro", centro: [(CAMARA.x0 + CAMARA.x1) / 2, (CAMARA.y0 + CAMARA.y1) / 2, (CAMARA.z0 + CAMARA.z1) / 2], tam: [CAMARA.x1 - CAMARA.x0, CAMARA.y1 - CAMARA.y0, CAMARA.z1 - CAMARA.z0], redondeo: 0.04 },
  { tipo: "caja", id: "camara-2", acabado: "negro", centro: [-0.22, -0.1, 1.42], tam: [0.09, 0.28, 0.36], redondeo: 0.02 },
  { tipo: "caja", id: "camara-2", acabado: "negro", centro: [0.245, -0.07, 1.45], tam: [0.05, 0.2, 0.25], redondeo: 0.015 },
  { tipo: "caja", id: "camara-tapa", acabado: "negro", centro: [0.07, 0.08, 1.42], tam: [0.16, 0.04, 0.13], redondeo: 0.015 },
  { tipo: "varilla", id: "camara-motor", acabado: "negro", desde: [0.076, -0.19, 1.44], hasta: [0.076, -0.31, 1.44], radio: 0.09, lados: 40 },
  // Objetivos: el grande; los dos pequeños, uno sobre otro a la izquierda
  // (x positiva).
  ...([["objetivo", 0.02, -0.058, 0.06], ["objetivo-2", 0.16, -0.009, 0.04], ["objetivo-3", 0.16, -0.1, 0.04]] as const).flatMap(([id, x, y, r]): Pieza[] => [
    { tipo: "varilla", id: `${id}-aro`, acabado: "negro", desde: [x, y, CAMARA.z1], hasta: [x, y, CAMARA.z1 + 0.02], radio: r + 0.012, lados: 32 },
    { tipo: "disco", id, acabado: "lente", en: [x, y, CAMARA.z1 + 0.021], normal: [0, 0, 1], radio: r, grosor: 0.004 },
  ]),
  // Cabeza de guerra: base negra sobre el lomo, el vaso, la banda azul del
  // aro (en las de EE. UU., azul es de instrucción; amarillo, explosiva) y la
  // cara abombada.
  { tipo: "prisma", id: "cabeza-base", acabado: "negro", simetrica: true, y: LOMO - 0.005, alto: 0.05, chaflanArriba: [0.015, 0.015], planta: [[0, -0.62], [0.2, -0.62], [0.2, -0.05], [0, -0.05]] },
  vaso("cabeza", "negro-bo", [[-0.6, 0.16, 0.13], [-0.5, 0.19, 0.155], [-0.3, 0.235, 0.19], [-0.075, 0.255, 0.21]]),
  vaso("cabeza-banda", "azul-bo", [[-0.077, 0.262, 0.217], [0.0, 0.262, 0.217]]),
  vaso("cabeza-cara", "negro", [[0.0, 0.255, 0.21], [0.03, 0.24, 0.198], [0.06, 0.2, 0.165], [0.085, 0.14, 0.115], [0.1, 0.06, 0.05]]),
  // Los dos enganches de la cabeza («POSITION BEFORE FLIGHT»), detrás.
  { tipo: "caja", id: "enganches", acabado: "negro", espejo: true, centro: [0.13, 0.27, -0.8], tam: [0.2, 0.16, 0.18], redondeo: 0.015 },
  // Dos antenas de pala detrás, a los lados de la cabeza.
  { tipo: "caja", id: "antenas", acabado: "negro", espejo: true, centro: [0.27, 0.46, -0.93], tam: [0.025, 0.54, 0.06], redondeo: 0.008 },
  // Bisagras y brazos.
  ...([["", BRAZO_D, MOTOR_D], ["-2", BRAZO_T, MOTOR_T]] as const).flatMap(([s, b, m]): Pieza[] => {
    const a = angBrazo(b, m);
    const delante = m.z > 0;
    // La rótula va girada con su brazo: una a cada lado (con `espejo`, la
    // copia giraría sobre el centro de la otra).
    const nudo: P3 = delante ? [0.6, 0.09, 0.85] : [0.54, 0.295, -0.67];
    const rotulas = ([1, -1] as const).map((sx): Pieza => {
      const c: P3 = [sx * nudo[0], nudo[1], nudo[2]];
      return { tipo: "caja", id: `rotulas${s}`, acabado: "negro", centro: c, tam: delante ? [0.13, 0.17, 0.21] : [0.14, 0.2, 0.24], redondeo: 0.03, girar: { centro: c, eje: "y", grados: (-sx * a * 180) / Math.PI } };
    });
    return [
      delante
        ? { tipo: "varilla", id: "tetones", acabado: "blanco-bo", espejo: true, desde: [0.5, -0.075, 0.91], hasta: [0.575, -0.05, 0.95], radio: 0.095, lados: 32 }
        : { tipo: "varilla", id: "tetones-2", acabado: "blanco-bo", espejo: true, desde: [0.5, 0.12, -0.66], hasta: [0.565, 0.15, -0.68], radio: 0.09, lados: 32 },
      ...rotulas,
      { tipo: "varilla", id: `manguitos${s}`, acabado: "negro", espejo: true, desde: enBrazo(b, m, 0.6), hasta: enBrazo(b, m, 0.83), radio: 0.105, lados: 32 },
      { tipo: "varilla", id: `brazos${s}`, acabado: "carbono-wh", espejo: true, desde: enBrazo(b, m, 0.83), hasta: [MX, m.y, m.z], radio: R_TUBO, lados: 32 },
      { tipo: "prisma", id: `pestillos${s}`, acabado: "negro", espejo: true, y: delante ? -0.02 : 0.2, alto: delante ? 0.06 : 0.08, chaflanArriba: [0.01, 0.01], planta: delante ? PESTILLO_D : PESTILLO_T },
    ];
  }),
  // El gancho del pestillo de detrás.
  { tipo: "caja", id: "ganchos", acabado: "negro", espejo: true, centro: [0.595, 0.34, -0.62], tam: [0.05, 0.1, 0.06], redondeo: 0.01 },
  // Motores: debajo el variador, el aro donde acaba el brazo, la jaula que se
  // estrecha, la campana y la tapa del buje.
  ...([["motores", MOTOR_D], ["motores-2", MOTOR_T]] as const).flatMap(([id, m]): Pieza[] => [
    { tipo: "pila", id: `${id}-variador`, acabado: "negro", espejo: true, niveles: [[-0.1, 0.1], [-0.03, 0.15], [0, 0.15]].map(([dy, r]) => ({ y: m.y + dy, planta: Array.from({ length: 16 }, (_, k): P2 => {
      const t = (k / 16) * Math.PI * 2;
      return [MX + r * Math.cos(t), m.z + r * Math.sin(t)];
    }) })) },
    { tipo: "varilla", id: `${id}-aro`, acabado: "negro", espejo: true, desde: [MX, m.y, m.z], hasta: [MX, m.y + 0.1, m.z], radio: 0.195, lados: 40 },
    // La jaula: ocho radios del aro a la campana alrededor de un cubo.
    { tipo: "varilla", id: `${id}-jaula`, acabado: "negro", espejo: true, desde: [MX, m.y + 0.1, m.z], hasta: [MX, m.y + 0.165, m.z], radio: 0.075, lados: 24 },
    ...Array.from({ length: 8 }, (_, k): Pieza => {
      const t = ((k + 0.5) / 8) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
      return { tipo: "varilla", id: `${id}-jaula`, acabado: "negro", espejo: true, desde: [MX + 0.175 * c, m.y + 0.1, m.z + 0.175 * sn], hasta: [MX + 0.085 * c, m.y + 0.17, m.z + 0.085 * sn], radio: 0.014, lados: 8 };
    }),
    { tipo: "varilla", id, acabado: "negro", espejo: true, desde: [MX, m.y + 0.165, m.z], hasta: [MX, m.y + 0.22, m.z], radio: 0.087, lados: 32 },
    { tipo: "varilla", id: `${id}-tapa`, acabado: "negro", espejo: true, desde: [MX, m.y + 0.26, m.z], hasta: [MX, m.y + 0.34, m.z], radio: 0.075, lados: 32 },
  ]),
  // El aro de color entre la campana y la hélice, por parejas en diagonal
  // según el sentido de giro: rojo detrás a la izquierda y delante a la
  // derecha; azul en los otros dos (fotos del B40E, posado y en vuelo).
  ...([[MOTOR_D, 1, "azul-bo"], [MOTOR_D, -1, "rojo"], [MOTOR_T, 1, "rojo"], [MOTOR_T, -1, "azul-bo"]] as const).map(([m, sx, acabado]): Pieza => (
    { tipo: "varilla", id: acabado === "rojo" ? "aros" : "aros-2", acabado, desde: [sx * MX, m.y + 0.22, m.z], hasta: [sx * MX, m.y + 0.26, m.z], radio: 0.095, lados: 32 }
  )),
  // Hélices bipala de carbono, de 72 cm, con un borde casi recto y la cuerda
  // más ancha a un tercio (planta del modelo). Cada pareja en diagonal gira
  // al revés que la otra.
  ...[
    { id: "helices", m: MOTOR_D, inversa: false, giro: 35 },
    { id: "helices-2", m: MOTOR_T, inversa: true, giro: -35 },
  ].map(({ id, m, inversa, giro }): Pieza => ({
    tipo: "helice", id, acabado: "helice-wh", eje: "y", espejo: true, en: [MX, m.y + 0.27, m.z], radio: 1.79, palas: 2, ancho: 0.345, buje: 0, paso: 0.25, inversa, giro,
    forma: [[0.04, 0.25, 0.21], [0.1, 0.27, 0.2], [0.2, 0.45, 0.3], [0.3, 0.47, 0.53], [0.4, 0.47, 0.51], [0.5, 0.46, 0.45], [0.6, 0.46, 0.36], [0.7, 0.46, 0.26], [0.8, 0.45, 0.19], [0.9, 0.4, 0.13], [0.95, 0.29, 0.1], [1, 0.07, 0.03]],
  })),
];

// Calcas y costuras (en unidades del modelo, como las piezas).
const DETRAS: P3 = [0, 0, -1];
const CALCAS: Calca[] = [
  // Trasera: el panel de estado (testigos y botón) y la pegatina «B40E».
  { sobre: ["carcasa"], en: [0.013, -0.06, -1.03], desde: DETRAS, tam: [0.445, 0.18], dibujo: { tipo: "rect", color: "#2a2c2f" } },
  ...([[0.17, 0.02], [0.09, 0.02], [0.17, -0.06], [0.09, -0.06], [0.0, 0.0]] as P2[]).map(([x, y]): Calca => ({ sobre: ["carcasa"], en: [x, y - 0.02, -1.035], desde: DETRAS, tam: [0.025, 0.025], dibujo: { tipo: "disco", color: "#5b5f64" }, capa: 1 })),
  { sobre: ["carcasa"], en: [-0.11, -0.02, -1.035], desde: DETRAS, tam: [0.08, 0.08], dibujo: { tipo: "disco", color: "#141516" }, capa: 1 },
  { sobre: ["carcasa"], en: [-0.25, -0.12, -1.03], desde: DETRAS, tam: [0.12, 0.05], dibujo: { tipo: "rect", color: "#f2f1ec" }, capa: 1 },
  { sobre: ["carcasa"], en: [-0.25, -0.12, -1.035], desde: DETRAS, tam: [0.1, 0.04], dibujo: { tipo: "texto", texto: "B40E", letra: "din" }, capa: 2 },
  // Fibra de carbono a los lados de la batería.
  { sobre: ["bateria"], en: [0.254, -0.44, 0], desde: [1, 0, 0], tam: [1.9, 0.36], dibujo: { tipo: "carbono" }, espejo: true },
  // «REAR» en los pestillos de detrás (foto de arriba del B44C).
  { sobre: ["pestillos-2"], en: [0.86, 0.28, -0.75], desde: [0, 1, 0], tam: [0.16, 0.05], giro: 12, dibujo: { tipo: "texto", texto: "REAR", color: "#d9d9d4", letra: "din" }, espejo: true },
  // Testigos verdes en la punta de los pestillos.
  ...([[1.03, 0.04, 0.975], [1.0, 0.28, -0.79]] as P3[]).map((en): Calca => ({ sobre: ["pestillos", "pestillos-2"], en, desde: [0, 1, 0], tam: [0.05, 0.05], dibujo: { tipo: "rect", color: "#b8d63c" }, espejo: true })),
  // «POSITION BEFORE FLIGHT» en los enganches de la cabeza, por detrás.
  ...[0.13, -0.13].map((x): Calca => ({ sobre: ["enganches"], en: [x, 0.3, -0.89], desde: DETRAS, tam: [0.17, 0.05], dibujo: { tipo: "texto", texto: "POSITION\nBEFORE FLIGHT", color: "#cfd0cc", fino: true } })),
  // Los dos tornillos de la barra del panel lateral.
  ...([0.514, -0.33] as number[]).map((z): Calca => ({ sobre: ["panel"], en: [0.406, -0.065, z], desde: [1, 0, 0], tam: [0.035, 0.035], dibujo: { tipo: "disco", color: "#55585c" }, espejo: true })),
];
const COSTURAS: Costura[] = [];

const PARTES: Maqueta["partes"] = [
  {
    nombre: "Cabeza de guerra",
    en: [0, 0.68, -0.3],
    piezas: ["cabeza", "cabeza-banda", "cabeza-cara", "cabeza-base", "enganches"],
    respaldo: "foto",
    fuentes: ["b40e", "b44c", "anduril"],
    texto: "Va encima, detrás, mirando hacia delante, y se cambia según el blanco: antipersona, antimaterial, anticarro o de instrucción. Pesa unos 1,4 kg (3 lb). Dos enganches la sujetan al lomo.",
    nota: "Del modelo de Anduril, con banda amarilla, y de las fotos de los Marines: el B44C, sin armar, no la lleva; el B40E la lleva con banda azul, el color de la munición de instrucción en EE. UU. Lo que hay dentro no se ve.",
  },
  {
    nombre: "Cámara EO/IR",
    en: [0.03, 0.08, 1.55],
    piezas: ["camara", "camara-2", "camara-motor", "camara-tapa", "objetivo", "objetivo-2", "objetivo-3", "objetivo-aro", "objetivo-2-aro", "objetivo-3-aro", "horquilla", "horquilla-2"],
    respaldo: "fabricante",
    fuentes: ["anduril", "b44c"],
    texto: "Cámara de día y térmica en un soporte de dos ejes, entre los lados del panel del morro. Con ella el operador ve en tiempo real y el dron sigue solo a un blanco, aunque se esconda un momento.",
    nota: "La forma, del modelo de Anduril; en la foto de arriba del B44C se ve el módulo negro delante.",
  },
  {
    nombre: "Batería",
    en: [0.3, -0.45, -0.3],
    piezas: ["bateria", "cierres"],
    respaldo: "foto",
    fuentes: ["b40e", "anduril"],
    texto: "Toda la panza es la batería, de fibra de carbono. Se suelta desde atrás y se cambia sin herramientas en menos de 10 segundos. Da unos 40 minutos de vuelo.",
  },
  {
    nombre: "Testigos de estado",
    en: [0, 0.02, -1.04],
    piezas: ["carcasa"],
    respaldo: "foto",
    fuentes: ["b40e", "anduril"],
    texto: "En la trasera, luces y un botón para comprobar antes y después del vuelo si está armado y cuánta batería le queda.",
  },
  {
    nombre: "Brazos plegables",
    en: [1.2, 0.12, 1.23],
    piezas: ["brazos", "brazos-2", "manguitos", "manguitos-2", "rotulas", "rotulas-2", "pestillos", "pestillos-2", "ganchos", "tetones", "tetones-2", "hombros", "hombros-2"],
    respaldo: "foto",
    fuentes: ["b44c", "b40e"],
    texto: "Cuatro tubos de carbono que se pliegan pegados al cuerpo para llevarlo en la mochila. Un pestillo los bloquea abiertos; los de detrás van marcados «REAR» y más altos que los de delante.",
  },
  {
    nombre: "Motores y hélices",
    en: [MX, MOTOR_T.y + 0.45, MOTOR_T.z],
    piezas: ["motores", "motores-2", "motores-variador", "motores-2-variador", "motores-aro", "motores-2-aro", "motores-jaula", "motores-2-jaula", "motores-tapa", "motores-2-tapa", "aros", "aros-2", "helices", "helices-2"],
    respaldo: "foto",
    fuentes: ["b40e", "vuelo"],
    texto: "Cuatro motores eléctricos con hélices de carbono de dos palas, de unos 72 cm. Cada pareja en diagonal gira al revés que la otra; el aro de la tapa, rojo o azul, dice qué hélice va en cada motor.",
    nota: "El diámetro sale de la escala de la maqueta, que es aproximada.",
  },
];

// Del modelo de Anduril a unidades de la maqueta: × 0,2 m / 0,5 m.
const u = (v: number) => (v * A) / ESCALA;
const u2 = ([a, b]: P2): P2 => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  const g = { ...(p.girar && { girar: { ...p.girar, centro: u3(p.girar.centro) } }), ...(p.girarLuego && { girarLuego: { ...p.girarLuego, centro: u3(p.girarLuego.centro) } }) };
  switch (p.tipo) {
    case "viga":
      return { ...p, ...g, ruta: p.ruta.map(([x, y, z, a, h]) => [u(x), u(y), u(z), u(a), u(h)] as [number, number, number, number, number]) };
    case "prisma":
      return { ...p, ...g, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto), ...(p.chaflanArriba && { chaflanArriba: u2(p.chaflanArriba) }), ...(p.chaflanAbajo && { chaflanAbajo: u2(p.chaflanAbajo) }) };
    case "pila":
      return { ...p, ...g, niveles: p.niveles.map(({ y, planta }) => ({ y: u(y), planta: planta.map(u2) })) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, ...g, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, ...g, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "tubo":
      return { ...p, ...g, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "varilla":
      return { ...p, ...g, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, ...g, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

const maqueta: Maqueta = {
  nombre: "Bolt-M",
  subtitulo: "Munición merodeadora de mochila",
  escala: ESCALA,  // 1 unidad = 50 cm; aproximada, de una foto con un vaso
  // Es blanco: la parte elegida, en tinta.
  resalte: "tinta",
  pais: bandera("US"),
  hd: true,
  contornoPixel: true,
  vistaTarjeta: [30, 27],
  plantaLisa: true,
  piezas: PIEZAS.map(aUnidades),
  detalles: {
    calcas: CALCAS.map((c) => ({ ...c, en: u3(c.en), tam: u2(c.tam) })),
    costuras: COSTURAS.map((c) => ({ ...c, puntos: c.puntos.map(u3) })),
  },
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "b40e", imagen: "b40e.jpg", titulo: "El B40E despega en Camp Lejeune, visto por detrás", medio: "Sgt. Jorge Borjas, Cuerpo de Marines (DVIDS)", url: `${DVIDS}9901713` },
    { id: "b44c", imagen: "b44c.jpg", titulo: "El coronel Stansberry sostiene el B44C, visto desde arriba", medio: "Cpl. Matthew Williams, Cuerpo de Marines (DVIDS)", url: `${DVIDS}9901709` },
    { id: "morro", imagen: "morro.jpg", titulo: "Preparando un Bolt-M para el lanzamiento", medio: "Sgt. Jorge Borjas, Cuerpo de Marines (DVIDS)", url: `${DVIDS}9901736` },
    { id: "vuelo", imagen: "vuelo.jpg", titulo: "En vuelo, de lado", medio: "Anduril (Breaking Defense)", url: "https://breakingdefense.com/2024/10/anduril-debuts-new-bolt-quadcopter-for-sensing-strike-missions/" },
    { id: "anduril", titulo: "Bolt: modelo 3D interactivo y ficha", medio: "Anduril", url: BOLT },
    { id: "carga", titulo: "Anduril Unveils Bolt ISR Drone and Loitering Munition", medio: "Inside Unmanned Systems", url: IUS },
  ],
};

export default maqueta;
