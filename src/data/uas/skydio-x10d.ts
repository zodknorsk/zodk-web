// Maqueta del Skydio X10D, sacada de cinco fotos de un X10D de verdad (en el
// suelo, con las hélices plegadas) y de las imágenes de Skydio, con las
// medidas oficiales (desplegado, 79 x 65 x 14,5 cm con hélices; plegado, 35 x
// 16,5 x 12 cm). Las cámaras de las cinco fotos y los puntos que se ven en
// varias (motores, patas, cámaras de navegación, logo, tornillos, topes) se
// encajaron a la vez; con la escala, las hélices de 16 cm cuadran con los 79 x
// 65 cm de la ficha. Fotos y herramientas en arte/uas-fuentes/skydio-x10d/hd/
// (fuera de Git; ver docs/uas-hd.md). 1 unidad = 25 cm.
import type { Acabado, Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const SKYDIO = "https://www.skydio.com/x10d";
const FICHA_TECNICA = "https://www.skydio.com/x10/technical-specs";
const LETONIA = "https://www.infodefensa.com/texto-diario/mostrar/6026918/ejercito-avanza-incorporacion-dron-x10d-elige-letonia-despliegue-operaciones-exterior";

// Todo en centímetros, en los ejes del ajuste de las fotos: x a la izquierda
// del dron de verdad (la maqueta va en espejo: la derecha real es x
// negativa), y desde el suelo, z hacia delante desde la cámara de navegación
// del centro. Al final se pasa a unidades (1 = 25 cm) con el cuerpo en el
// centro.
const ESCALA = 0.25;
const Y0 = 8.5, Z0 = 3.4;

type P2 = [number, number];
type P3 = [number, number, number];

// Motores (el eje, arriba del todo de la tapa de la hélice) y patas (el
// apoyo en el suelo), del ajuste de las cinco fotos.
const MOTOR_D = { x: 23.5, z: 20.03, base: 8.2, tapa: 11.2 };
const MOTOR_T = { x: 21.79, z: -13.19, base: 7.1, tapa: 10.1 };
const PIE_D: P2 = [25.55, 21.35], PIE_T: P2 = [23.88, -15.12];

// Una sección de n puntos: superelipse de semiejes a (a lo largo de `ang`) y
// b, con la «cuadratura» p (2, redonda; 4 o más, casi rectangular).
const seccion = (cx: number, cz: number, a: number, b: number, ang: number, p = 2, n = 16): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const u = a * Math.sign(c) * Math.abs(c) ** (2 / p), v = b * Math.sign(s) * Math.abs(s) ** (2 / p);
    return [cx + u * Math.cos(ang) - v * Math.sin(ang), cz + u * Math.sin(ang) + v * Math.cos(ang)];
  });

// Polígono con las esquinas redondeadas (radio por vértice; 0, esquina viva).
const redondeado = (v: P2[], r: number[], pasos = 4): P2[] => {
  const out: P2[] = [];
  v.forEach((q, i) => {
    const a = v[(i + v.length - 1) % v.length], b = v[(i + 1) % v.length], R = r[i] ?? 0;
    if (!R) { out.push(q); return; }
    const da = Math.hypot(a[0] - q[0], a[1] - q[1]), db = Math.hypot(b[0] - q[0], b[1] - q[1]);
    const p0: P2 = [q[0] + ((a[0] - q[0]) * R) / da, q[1] + ((a[1] - q[1]) * R) / da];
    const p1: P2 = [q[0] + ((b[0] - q[0]) * R) / db, q[1] + ((b[1] - q[1]) * R) / db];
    for (let k = 0; k <= pasos; k++) {
      const t = k / pasos, m = 1 - t;
      out.push([m * m * p0[0] + 2 * m * t * q[0] + t * t * p1[0], m * m * p0[1] + 2 * m * t * q[1] + t * t * p1[1]]);
    }
  });
  return out;
};

// Pieza hecha de secciones a lo largo de z (una `pila` tumbada): cada
// sección, en [x, y] a esa z. Todas con el mismo número de puntos.
const aLoLargoZ = (id: string, acabado: Acabado, secciones: { z: number; s: P2[] }[], espejo = false): Pieza => ({
  tipo: "pila", id, acabado, espejo, girar: { centro: [0, 0, 0], eje: "x", grados: 90 },
  niveles: secciones.map(({ z, s }) => ({ y: z, planta: s.map(([x, y]): P2 => [x, -y]) })),
});
// Lo mismo a lo largo de x: cada sección, en [z, y] a esa x.
const aLoLargoX = (id: string, acabado: Acabado, secciones: { x: number; s: P2[] }[]): Pieza => ({
  tipo: "pila", id, acabado, girar: { centro: [0, 0, 0], eje: "z", grados: -90 },
  niveles: secciones.map(({ x, s }) => ({ y: x, planta: s.map(([z, y]): P2 => [-y, z]) })),
});
// Un cuarto de superelipse de centro c y semiejes a, b, del ángulo a0 al a1
// (grados), sin los extremos.
const arco = (c: P2, a: number, b: number, a0: number, a1: number, n: number, p = 2): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = ((a0 + ((a1 - a0) * (i + 1)) / (n + 1)) * Math.PI) / 180, co = Math.cos(t), si = Math.sin(t);
    return [c[0] + a * Math.sign(co) * Math.abs(co) ** (2 / p), c[1] + b * Math.sign(si) * Math.abs(si) ** (2 / p)];
  });

// Sección del cuerpo (fotos 1 y 4): la cara de arriba, una franja inclinada
// hasta el reborde de los tornillos, que sobresale, y debajo la tapa de la
// batería, metida y estrechándose hacia el suelo. Media sección (x ≥ 0), de
// arriba abajo. `W` es el medio ancho del reborde: 3,18 en el cuerpo y más
// detrás, donde la carcasa de arriba se abre en la «Y» (con la misma franja y
// el mismo reborde, y la cara de arriba bajando 10° hacia fuera, de 12,55 a
// las cámaras de detrás); la batería sigue debajo. `k` estrecha la batería,
// `d` mete arriba y abajo y `e` estrecha toda la sección (los extremos).
const PENDIENTE = Math.tan((10 * Math.PI) / 180);
const seccionCuerpo = (W: number, k = 1, d = 0, e = 1): P2[] => {
  const tw = 1.75 + (W - 3.18), yt = 12.55 - (tw - 1.75) * PENDIENTE;
  const m: P2[] = [
    [0, 12.55], [1.75, 12.55], [tw, yt], ...arco([tw, yt - 0.6], 0.6, 0.6, 90, 25, 3),
    [W - 0.18, 10.85], [W, 10.62], [W, 10.02], [W - 0.24, 9.88],
    [2.94 * k, 9.88], [2.72 * k, 7.2], [2.5 * k, 5.75], [2.1 * k, 5.0], [0, 5.0],
  ].map(([x, y]): P2 => [x * e, Math.min(12.55 - d, Math.max(5.0 + d, y))]);
  return [...m, ...m.slice(1, -1).reverse().map(([x, y]): P2 => [-x, y])];
};
// El medio ancho del reborde detrás (planta de la foto 5 enderezada a 12
// cm): sale del costado en curva, llega a la punta redonda bajo cada cámara
// y vuelve hasta el borde de detrás. Puntos [z, W], unidos con una curva
// suave (Catmull-Rom).
const Y_PLANTA: P2[] = [[-0.6, 3.18], [-1.6, 3.2], [-2.6, 3.3], [-3.3, 3.5], [-4.1, 3.92], [-5.0, 4.6], [-5.9, 5.3], [-6.7, 5.85], [-7.5, 6.2], [-8.2, 6.15], [-8.75, 5.8], [-9.05, 5.1]];
const tramosY: P2[] = Y_PLANTA.slice(0, -1).flatMap((_, i) => {
  const p0 = Y_PLANTA[Math.max(0, i - 1)], p1 = Y_PLANTA[i], p2 = Y_PLANTA[i + 1], p3 = Y_PLANTA[Math.min(Y_PLANTA.length - 1, i + 2)];
  return [0, 1 / 3, 2 / 3].map((t): P2 => {
    const c = (a: number, b: number, c2: number, d2: number) => 0.5 * (2 * b + (c2 - a) * t + (2 * a - 5 * b + 4 * c2 - d2) * t * t + (3 * b - a - 3 * c2 + d2) * t * t * t);
    return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
  });
}).concat([Y_PLANTA[Y_PLANTA.length - 1]]);

// Mejilla: bajo cada carril de la jaula, el cuerpo sigue hacia delante hasta
// la punta (los topes grises, que bajan a 8,15 cm). Atrás sube en una S hasta
// el reborde del cuerpo y baja hasta la raíz del brazo de delante, que sale
// de ella (foto 4, y la 1 y la 3). Cada sección: [x de dentro, x de fuera, y
// de abajo, y de arriba].
const mejilla = (x0: number, x1: number, y0: number, y1: number): P2[] =>
  redondeado([[x0, y1], [x1, y1], [x1, y0], [x0, y0]], [0.2, 0.3, 0.3, 0.2], 2);

// Pata: bajo el motor, la base gris del brazo, que se estrecha sin escalón
// y sigue como pata, abierta hacia fuera, hasta el suelo (fotos 2 y 4). La
// pata es más ancha de delante a atrás (~3 cm arriba, de costado en la foto
// 4) que de lado (~2 cm, de frente en la foto 2).
const pata = (m: typeof MOTOR_D, pie: P2, alto: number): { y: number; planta: P2[] }[] => {
  const en = (t: number): P2 => [m.x + (pie[0] - m.x) * t, m.z + (pie[1] - m.z) * t];
  const baja = m.base - alto;
  return [
    { y: m.base, planta: seccion(m.x, m.z, 1.95, 1.95, 0) },
    { y: baja + 0.6, planta: seccion(...en(0.04), 1.6, 1.85, 0, 2.4) },
    { y: baja - 0.6, planta: seccion(...en(0.18), 0.95, 1.5, 0, 3.5) },
    { y: 0, planta: seccion(...pie, 0.42, 0.65, 0, 4) },
  ];
};

// Caja del sensor VT300 (nivelada, mirando al frente), medida en la foto de
// producto de Skydio de frente y con su tamaño de las fotos del dron: 7,3 x
// 5,75 cm de frente y 5,2 de fondo. Sus coordenadas, desde su centro.
const CAJA = { x: -0.8, y: 8.4, z0: 16.4, z1: 21.6 };
const cx = (x: number) => CAJA.x + x, cy = (y: number) => CAJA.y + y;
// La caja no es cuadrada (vista de frente de Skydio y fotos 2 y 3): por el
// lado del térmico, la esquina de arriba va redondeada y la de abajo es una
// curva grande que baja hasta el medio; y vista desde arriba, la esquina de
// detrás de ese lado está recortada (las aletas, más cortas). Su sección, de
// frente, y el recorte: a la z dada, la x más a la izquierda.
const caraCaja: P2[] = redondeado([
  [-3.65, 2.88], [3.65, 2.88], [3.65, -2.88], [0.05, -2.88],
  ...arco([0.05, -0.55], 3.7, 2.33, 270, 180, 7, 2.4), [-3.65, -0.55],
], [0.7, 0.35, 0.35]);
const RECORTE = { z: 18.6, ancho: 2.1, fondo: 2.2 };
const izquierdaCaja = (z: number) => {
  const t = Math.min(1, Math.max(0, (RECORTE.z - z) / RECORTE.fondo));
  return -3.65 + RECORTE.ancho * (1 - Math.sqrt(1 - t * t));
};
// La placa de la cara, con el bisel en diagonal arriba y abajo a la
// izquierda y el aro del térmico.
const placaCara: P2[] = [
  ...redondeado([[3.45, 2.64], [3.45, -2.68], [-0.52, -2.68]], [0.2, 0.2, 0]),
  ...Array.from({ length: 9 }, (_, i): P2 => {
    const a = ((225 - (i * 91) / 8) * Math.PI) / 180;
    return [-1.87 + 1.55 * Math.cos(a), 0.09 + 1.55 * Math.sin(a)];
  }),
  [-0.52, 2.64],
].map(([x, y]) => [cx(x), cy(y)]);
// Aletas del disipador, a lo largo de z, encima de la caja (un peine unido
// por delante). Por el lado del térmico empiezan más atrás, con el recorte.
const ALETAS = 15;
const peine: P2[] = [];
for (let i = 0; i < ALETAS; i++) {
  const x = -2.95 + (i * 6.35) / (ALETAS - 1);
  // La z de detrás: la del recorte en esa x (y la de siempre, 17,5).
  let zr = 16.4;
  while (zr < RECORTE.z && izquierdaCaja(zr) > x - 0.3) zr += 0.05;
  const z0 = Math.max(17.5, zr + 0.45), x0 = cx(x) - 0.07, x1 = x0 + 0.14;
  peine.push([x0, 20.85], [x0, z0], [x1, z0], [x1, 20.85]);
}
peine.push([peine[peine.length - 1][0], 21.1], [peine[0][0], 21.1]);
// Los tres objetivos: [x, y, aro, cristal] desde el centro de la caja.
const TERMICO = [-1.87, 0.09], GRAN_ANGULAR = [1.52, 1.55], TELE = [1.55, -1.09];

// Placa de carbono de la jaula: una U abierta por delante (dos carriles a
// ±6 cm hasta z = 22) con el travesaño junto al cuerpo y dos alas sobre los
// brazos de delante (foto 5, desde arriba).
const JAULA: P2[] = [[0, 10.3], [3.8, 10.3], [5.4, 11.0], [8.6, 12.4], [8.9, 13.2], [8.2, 13.9], [6.9, 15.0], [6.75, 16.0], [6.75, 21.6], [6.4, 22.1], [5.9, 22.1], [5.6, 21.7], [5.6, 16.0], [5.2, 14.3], [4.2, 13.1], [2.5, 12.4], [0, 12.25]];

const PIEZAS: Pieza[] = [
  // Cuerpo: secciones de detrás a delante, con la «Y» de detrás en la misma
  // pieza (se estrecha en los extremos: planta de la foto 5).
  aLoLargoZ("cuerpo", "gris-x10", [
    { z: -9.2, s: seccionCuerpo(4.7, 0.78, 0.3) },
    ...tramosY.slice().reverse().map(([z, W]) => ({ z, s: seccionCuerpo(W, z < -6.2 ? 1 - (0.15 * (-6.2 - z)) / 2.85 : 1) })),
    { z: 9.8, s: seccionCuerpo(3.18) },
    { z: 10.2, s: seccionCuerpo(3.18, 1, 0.2, 0.87) },
  ]),
  // Las mejillas, de la punta de delante hasta el cuerpo.
  aLoLargoZ("mejillas", "gris-x10", [
    { z: 9.6, s: mejilla(2.4, 3.1, 5.4, 10.6) },
    { z: 10.6, s: mejilla(2.6, 4.1, 5.5, 10.6) },
    { z: 11.8, s: mejilla(3.2, 5.4, 5.9, 10.25) },
    { z: 13.0, s: mejilla(4.3, 6.5, 6.6, 9.95) },
    { z: 14.2, s: mejilla(5.0, 6.9, 7.7, 9.95) },
    { z: 15.6, s: mejilla(5.25, 7.0, 8.15, 9.95) },
    { z: 22.2, s: mejilla(5.3, 7.0, 8.15, 9.95) },
    { z: 22.45, s: mejilla(5.45, 6.85, 8.3, 9.95) },
  ], true),
  // Delante, encima, el escalón de los dos tornillos azules, de todo el
  // ancho del cuerpo (foto 5), que baja por los costados hasta la franja.
  { tipo: "prisma", id: "frente", acabado: "gris-x10", simetrica: true, y: 10.6, alto: 2.12, chaflanArriba: [0.15, 0.15], planta: [[0, 10.15], [3.05, 10.15], [3.05, 8.1], [0, 8.1]] },
  // En los brazos de la «Y», dos pastillas ovaladas en diagonal (A3 y A4).
  ...([1, -1] as const).map((sx): Pieza => ({
    tipo: "prisma", id: sx > 0 ? "pastillas" : "pastillas-2", acabado: "gris-x10", y: 12.45, alto: 0.2, chaflanArriba: [0.06, 0.06],
    planta: seccion(2.55 * sx, -4.3, 0.85, 0.27, -0.95 * sx, 3, 16), girar: { centro: [1.75 * sx, 12.55, 0], eje: "z", grados: -10 * sx },
  })),
  // Cámaras de navegación de arriba, con su anillo azul: la del centro, en la
  // cara de arriba; las de detrás, en las puntas de la «Y».
  { tipo: "disco", id: "navegacion", acabado: "azul-x10", en: [0, 12.56, 0], normal: [0, 1, 0], radio: 0.6, grosor: 0.05 },
  { tipo: "disco", id: "navegacion-lente", acabado: "lente", en: [0, 12.6, 0], normal: [0, 1, 0], radio: 0.4, grosor: 0.05 },
  { tipo: "varilla", id: "navegacion-2", acabado: "gris-x10", desde: [4.77, 10.9, -7.87], hasta: [4.77, 12.12, -7.87], radio: 1.0, lados: 32, espejo: true },
  { tipo: "disco", id: "navegacion-3", acabado: "azul-x10", en: [4.77, 12.13, -7.87], normal: [0, 1, 0], radio: 0.62, grosor: 0.05, espejo: true },
  { tipo: "disco", id: "navegacion-4", acabado: "lente", en: [4.77, 12.17, -7.87], normal: [0, 1, 0], radio: 0.42, grosor: 0.05, espejo: true },
  // Brazos: vigas de seis caras, rectas y casi planas (foto 2 de canto, foto
  // 5 desde arriba), que se ensanchan al llegar al cuerpo. Los de delante
  // salen de bajo la jaula; los de detrás, de bajo la «Y», y entran en el
  // motor por delante y por dentro.
  { tipo: "viga", id: "brazos", acabado: "gris-x10", espejo: true, arriba: 0.84, abajo: 0.7, cintura: 0.42, ruta: [[2.9, 7.0, 12.0, 5.0, 1.9], [5, 7.05, 13.6, 3.4, 1.9], [10, 7.1, 15.2, 2.85, 1.9], [18, 7.2, 17.8, 2.2, 1.95], [22.6, 7.3, 19.3, 2.0, 2.0]] },
  { tipo: "viga", id: "brazos-2", acabado: "gris-x10", espejo: true, arriba: 0.84, abajo: 0.7, cintura: 0.42, ruta: [[2.9, 8.9, -6.49, 2.6, 2.0], [5, 8.58, -7.13, 2.3, 2.0], [10, 7.81, -8.67, 2.1, 1.95], [18, 6.59, -11.12, 1.95, 1.9], [21.2, 6.1, -12.1, 1.9, 1.9]] },
  // Bajo cada motor, la base redonda del brazo y la pata, que se abre hacia
  // fuera y se afina hasta el suelo.
  { tipo: "pila", id: "patas", acabado: "gris-x10", espejo: true, niveles: pata(MOTOR_D, PIE_D, 2.2) },
  { tipo: "pila", id: "patas-2", acabado: "gris-x10", espejo: true, niveles: pata(MOTOR_T, PIE_T, 2.1) },
  // Motores: el bobinado de cobre que asoma abajo, la campana negra y, encima,
  // la tapa de la hélice.
  ...([["motores", MOTOR_D], ["motores-2", MOTOR_T]] as const).flatMap(([id, m]): Pieza[] => [
    { tipo: "varilla", id: `${id}-cobre`, acabado: "laton", desde: [m.x, m.base, m.z], hasta: [m.x, m.base + 0.35, m.z], radio: 1.7, espejo: true, lados: 32 },
    { tipo: "varilla", id, acabado: "negro", desde: [m.x, m.base + 0.35, m.z], hasta: [m.x, m.tapa - 0.9, m.z], radio: 1.85, espejo: true, lados: 32 },
    { tipo: "varilla", id: `${id}-tapa`, acabado: "negro", desde: [m.x, m.tapa - 0.9, m.z], hasta: [m.x, m.tapa, m.z], radio: 0.85, espejo: true, lados: 32 },
  ]),
  // Hélices de tres palas de 16 cm, negras, con una franja azul en el borde
  // de ataque cerca de la punta (más ancha al final y con un escalón; fotos
  // 2 y 5). Cada pareja en diagonal gira al revés que la otra.
  ...[
    { id: "helices", m: MOTOR_D, inversa: false, giro: 20 },
    { id: "helices-2", m: MOTOR_T, inversa: true, giro: 50 },
  ].flatMap(({ id, m, inversa, giro }): Pieza[] => {
    const forma: [number, number, number][] = [[0.06, 0.22, 0.22], [0.15, 0.42, 0.36], [0.3, 0.5, 0.44], [0.6, 0.5, 0.42], [0.85, 0.47, 0.38], [0.95, 0.42, 0.32], [1, 0.3, 0.16]];
    const comun = { tipo: "helice" as const, eje: "y" as const, espejo: true, en: [m.x, m.tapa - 0.35, m.z] as P3, radio: 16, palas: 3, buje: 0, paso: 0.3, inversa, giro };
    // La franja, algo más gruesa que la pala para que asome por las dos
    // caras: el mismo borde de ataque y `ancho` de cuerda hacia atrás.
    const K = 1.25;
    const franja = (ancho: number): [number, number, number][] => forma.map(([t, a]) => [t, a / K, (ancho - a) / K]);
    return [
      { ...comun, id, acabado: "negro", ancho: 2.3, forma, tramo: [0.06, 1] },
      // La raíz de cada pala, gruesa (la bisagra del pliegue): con la tapa,
      // la estrella de tres lóbulos de las fotos.
      { ...comun, id: `${id}-raiz`, acabado: "negro", ancho: 3.6, forma: [[0.02, 0.2, 0.2], [0.06, 0.24, 0.22], [0.13, 0.2, 0.18], [0.17, 0.13, 0.12]], paso: 0.15 },
      { ...comun, id: `${id}-puntas`, acabado: "azul-x10", ancho: 2.3 * K, forma: franja(0.3), tramo: [0.86, 1] },
      { ...comun, id: `${id}-puntas-2`, acabado: "azul-x10", ancho: 2.3 * K, forma: franja(0.14), tramo: [0.76, 0.86] },
    ];
  }),
  // Jaula del sensor: la placa de carbono de arriba, con sus cuatro topes de
  // goma, y debajo, otra negra (va sobre las mejillas).
  { tipo: "placa", id: "jaula", acabado: "negro", plano: "horizontal", simetrica: true, y: 11.75, grosor: 0.3, bisel: 0.04, planta: JAULA },
  { tipo: "placa", id: "jaula-abajo", acabado: "negro", plano: "horizontal", simetrica: true, y: 9.95, grosor: 0.3, bisel: 0.04, planta: [[0, 10.3], [4.2, 10.3], [6.6, 12.8], [6.6, 21.9], [5.2, 21.9], [5.0, 15.0], [4.0, 13.6], [2.2, 13.0], [0, 13.0]] },
  { tipo: "varilla", id: "jaula-topes", acabado: "negro", desde: [6.14, 12.05, 19.36], hasta: [6.14, 12.45, 19.36], radio: 0.62, lados: 32, espejo: true },
  { tipo: "varilla", id: "jaula-topes-2", acabado: "negro", desde: [5.04, 12.05, 12.69], hasta: [5.04, 12.45, 12.69], radio: 0.62, lados: 32, espejo: true },
  // Gimbal: la cabeza de giro, que asoma por el hueco de la jaula; de ella
  // sale el brazo de cabeceo, que va por la izquierda de la caja (x
  // positiva) y baja hasta el motor de cabeceo (fotos 1, 3 y 5; al otro lado
  // de la caja no hay brazo). La caja, corrida a la derecha.
  { tipo: "prisma", id: "gimbal-soporte", acabado: "gris-x10", simetrica: true, y: 10.9, alto: 0.85, planta: [[0, 10.2], [1.0, 10.2], [1.0, 14.0], [0, 14.0]] },
  // El brazo es una sola pieza (fotos 2 y 3): arriba, su extremo redondo va
  // encima de la cabeza de giro, y de ahí sale una banda ancha que pasa por
  // encima de la esquina de la caja, baja por el costado con un codo
  // redondo y acaba en la carcasa redonda del motor de cabeceo.
  { tipo: "varilla", id: "gimbal-cabeza", acabado: "gris-x10", desde: [-0.4, 10.4, 14.7], hasta: [-0.4, 11.75, 14.7], radio: 1.45, lados: 32 },
  { tipo: "varilla", id: "gimbal-cabeza-tapa", acabado: "gris-x10", desde: [-0.4, 11.75, 14.7], hasta: [-0.4, 13.06, 14.7], radio: 1.35, lados: 32 },
  { tipo: "viga", id: "gimbal-brazo", acabado: "gris-x10", arriba: 0.85, abajo: 0.85, cintura: 0.3, ruta: [[-0.4, 12.4, 14.7, 2.5, 1.2], [2.0, 12.4, 16.7, 2.3, 1.2], [3.6, 12.4, 18.6, 2.2, 1.2]] },
  aLoLargoX("gimbal-brazo-2", "gris-x10", ([[3.35, 13.0], [3.75, 12.9], [4.05, 12.6], [4.25, 12.05]] as P2[]).map(([x, arriba]) => ({
    x,
    s: redondeado([[17.9, arriba], [20.1, arriba], [20.3, 8.85], ...arco([19.0, 8.85], 1.3, 1.3, 0, -180, 9), [17.7, 8.85]], [0.45, 0.45], 3),
  }))),
  { tipo: "varilla", id: "gimbal-motor", acabado: "gris-x10", desde: [2.85, cy(0.45), 19.0], hasta: [3.4, cy(0.45), 19.0], radio: 1.05, lados: 32 },
  { tipo: "disco", id: "gimbal-motor-2", acabado: "negro", en: [3.1, cy(0.45), 19.0], normal: [1, 0, 0], radio: 1.08, grosor: 0.06 },
  // La caja: su sección de frente, con el recorte de detrás y los bordes de
  // delante y de detrás achaflanados.
  aLoLargoZ("sensor", "gris-x10", [
    [CAJA.z0, 0.3], [CAJA.z0 + 0.3, 0], ...Array.from({ length: 7 }, (_, i): [number, number] => [CAJA.z0 + 0.6 + (i * (RECORTE.z - CAJA.z0 - 0.6)) / 6, 0]), [CAJA.z1 - 0.35, 0], [CAJA.z1, 0.35],
  ].map(([z, m]) => {
    const xi = izquierdaCaja(z);
    return { z, s: caraCaja.map(([x, y]): P2 => [cx(Math.max(xi, x) * (1 - m / 3.65)), cy(y * (1 - m / 2.88))]) };
  })),
  { tipo: "prisma", id: "sensor-cara", acabado: "gris-x10", eje: "z", y: CAJA.z1 - 0.1, alto: 0.32, chaflanArriba: [0.08, 0.08], planta: placaCara },
  { tipo: "prisma", id: "sensor-aletas", acabado: "gris-x10", y: cy(2.88) - 0.05, alto: 0.32, planta: peine },
  // Objetivos: el térmico en su aro saliente; los otros dos, en la cara.
  { tipo: "varilla", id: "objetivo-termico", acabado: "gris-x10", desde: [cx(TERMICO[0]), cy(TERMICO[1]), CAJA.z1], hasta: [cx(TERMICO[0]), cy(TERMICO[1]), CAJA.z1 + 0.65], radio: 1.18, lados: 32 },
  { tipo: "disco", id: "objetivo-termico-2", acabado: "negro", en: [cx(TERMICO[0]), cy(TERMICO[1]), CAJA.z1 + 0.66], normal: [0, 0, 1], radio: 1.0, grosor: 0.04 },
  { tipo: "disco", id: "objetivo-termico-3", acabado: "lente", en: [cx(TERMICO[0]), cy(TERMICO[1]), CAJA.z1 + 0.69], normal: [0, 0, 1], radio: 0.82, grosor: 0.04 },
  ...([["objetivo-gran", GRAN_ANGULAR, 0.85, 0.7, 0.47], ["objetivo-tele", TELE, 1.22, 1.08, 0.95]] as const).flatMap(([id, [x, y], aro, negro, cristal]): Pieza[] => [
    { tipo: "disco", id, acabado: "metal", en: [cx(x), cy(y), CAJA.z1 + 0.23], normal: [0, 0, 1], radio: aro, grosor: 0.04 },
    { tipo: "disco", id: `${id}-2`, acabado: "negro", en: [cx(x), cy(y), CAJA.z1 + 0.26], normal: [0, 0, 1], radio: negro, grosor: 0.04 },
    { tipo: "disco", id: `${id}-3`, acabado: "lente", en: [cx(x), cy(y), CAJA.z1 + 0.29], normal: [0, 0, 1], radio: cristal, grosor: 0.04 },
  ]),
];

// Calcas y costuras (en cm, como las piezas).
const ARRIBA: P3 = [0, 1, 0];
const tornillo = (en: P3, color: string, r: number, sobre: string[], desde: P3 = ARRIBA, espejo = true): Calca => ({ sobre, en, desde, tam: [r * 2, r * 2], dibujo: { tipo: "disco", color }, espejo });
const CALCAS: Calca[] = [
  // El logo, delante de la cámara de navegación del centro, para leerse
  // desde detrás.
  { sobre: ["cuerpo"], en: [0, 12.55, 5.55], desde: ARRIBA, tam: [1.5, 2.1], dibujo: { tipo: "skydio" } },
  // Fibra de carbono de la placa de la jaula.
  { sobre: ["jaula"], en: [0, 12.05, 11.3], desde: ARRIBA, tam: [18.5, 23], dibujo: { tipo: "carbono" } },
  // Tornillos: los azules del frente; los negros de detrás; los de la jaula.
  tornillo([1.95, 12.75, 8.84], "#2f6fd6", 0.26, ["frente"]),
  tornillo([2.8, 12.5, -6.7], "#2a2b2e", 0.2, ["cuerpo"]),
  // Junto a cada cámara de detrás, una ranura pequeña (foto 5).
  { sobre: ["cuerpo"], en: [3.4, 12.5, -7.45], desde: ARRIBA, tam: [0.5, 0.22], giro: -50, dibujo: { tipo: "rect", color: "#3a3d42" }, espejo: true },
  ...([[6.1, 21.9], [2.9, 13.25], [1.6, 10.95], [7.9, 13.0], [6.2, 16.6]] as P2[]).map(([x, z]) => tornillo([x, 12.05, z], "#55585c", 0.17, ["jaula"])),
  tornillo([0.1, 12.05, 11.9], "#55585c", 0.17, ["jaula"], ARRIBA, false),
  // Ranuras pequeñas entre la cámara del centro y el hexágono.
  { sobre: ["cuerpo"], en: [0, 12.55, -0.9], desde: ARRIBA, tam: [0.35, 0.55], dibujo: { tipo: "rect", color: "#2a2b2e" } },
  tornillo([0, 12.55, -1.85], "#2a2b2e", 0.15, ["cuerpo"], ARRIBA, false),
  // Las dos ranuras de la base de cada motor, hacia fuera (foto 4).
  ...([MOTOR_D, MOTOR_T] as const).flatMap((m): Calca[] => [-0.45, 0.45].map((dy) => {
    const a = Math.atan2(m.z, m.x);
    return { sobre: ["patas", "patas-2"], en: [m.x + 1.9 * Math.cos(a), m.base - 0.9 + dy, m.z + 1.9 * Math.sin(a)], desde: [Math.cos(a), 0, Math.sin(a)], tam: [1.4, 0.22], dibujo: { tipo: "rect", color: "#3a3d42" }, espejo: true };
  })),
  // Las tres ranuras de la cara de arriba de la caja del sensor.
  ...[-0.6, 0, 0.6].map((dx): Calca => ({ sobre: ["sensor-aletas", "sensor"], en: [cx(-0.3 + dx), cy(3.3), 20.1], desde: ARRIBA, tam: [0.35, 0.9], dibujo: { tipo: "rect", color: "#1d1e20" } })),
  // Costado izquierdo (x positiva): el botón de delante y los tornillos de
  // la tapa.
  { sobre: ["cuerpo"], en: [3.15, 8.7, 8.7], desde: [1, 0, 0], tam: [0.8, 0.45], dibujo: { tipo: "rect", color: "#5d6166" } },
  tornillo([3.15, 10.0, -2.8], "#3a3c40", 0.16, ["cuerpo"], [1, 0, 0], false),
  tornillo([3.15, 10.0, 4.4], "#3a3c40", 0.16, ["cuerpo"], [1, 0, 0], false),
];
const COSTURAS: Costura[] = [
  // La tapa del costado izquierdo (foto 4).
  { sobre: ["cuerpo"], puntos: [[3.15, 5.6, -3.1], [3.15, 10.3, -3.1], [3.15, 10.3, 4.6], [3.15, 5.6, 8.3]], desde: [1, 0, 0] },
  // El hexágono de la cara de arriba, detrás.
  { sobre: ["cuerpo"], puntos: [[-1.12, 12.55, -4.5], [-0.6, 12.55, -3.55], [0.6, 12.55, -3.55], [1.12, 12.55, -4.5], [0.6, 12.55, -5.4], [-0.6, 12.55, -5.4], [-1.12, 12.55, -4.5]], desde: ARRIBA },
  // Las costuras de la «Y», de las esquinas de abajo del hexágono hacia
  // las cámaras de detrás (foto 5).
  { sobre: ["cuerpo"], puntos: [[0.6, 12.6, -5.4], [3.4, 12.6, -7.0]], desde: ARRIBA, espejo: true },
];

const PARTES: Maqueta["partes"] = [
  {
    nombre: "Sensor VT300",
    en: [cx(0), 12.6, 21.6],
    piezas: ["gimbal-cabeza", "gimbal-cabeza-tapa", "gimbal-brazo", "gimbal-brazo-2", "gimbal-motor", "sensor", "sensor-cara", "sensor-aletas", "objetivo-termico", "objetivo-gran", "objetivo-tele", "jaula", "jaula-abajo", "jaula-topes", "jaula-topes-2"],
    respaldo: "foto",
    fuentes: ["frente", "militar", "ficha"],
    texto: "Cámara estabilizada que va delante del cuerpo y gira para mirar hacia arriba o hacia abajo. Lleva una cámara térmica FLIR Boson+ (640 x 512) y dos cámaras de 48 a 64 megapíxeles; la versión Z tiene teleobjetivo y la L, gran angular y un foco de 1.000 lúmenes.",
    nota: "El sensor es intercambiable: VT300-Z o VT300-L.",
  },
  {
    nombre: "Cámaras de navegación",
    en: [4.77, 12.6, -7.87],
    piezas: ["navegacion", "navegacion-lente", "navegacion-2", "navegacion-3", "navegacion-4"],
    respaldo: "fabricante",
    fuentes: ["ficha", "arriba"],
    texto: "Seis cámaras de ojo de pez, tres arriba y tres abajo, que ven 360° a su alrededor hasta 20 m. Con ellas esquiva obstáculos y sabe dónde está sin GPS; en el X10D, también a oscuras (NightSense).",
    nota: "Las tres de abajo no se ven en las fotos y no están en la maqueta.",
  },
  {
    nombre: "Brazos plegables",
    en: [13.5, 9.0, 16.3],
    piezas: ["brazos", "brazos-2"],
    respaldo: "foto",
    fuentes: ["plegado", "arriba"],
    texto: "Los cuatro brazos se pliegan pegados al cuerpo: así mide 35 x 16,5 x 12 cm y cabe en una mochila. Desplegado, en menos de 40 segundos está listo para volar.",
  },
  {
    nombre: "Motores y hélices",
    en: [MOTOR_T.x, MOTOR_T.tapa + 0.8, MOTOR_T.z],
    piezas: ["motores", "motores-2", "motores-tapa", "motores-2-tapa", "motores-cobre", "motores-2-cobre", "helices", "helices-2", "helices-raiz", "helices-2-raiz", "helices-puntas", "helices-2-puntas", "helices-puntas-2", "helices-2-puntas-2"],
    respaldo: "foto",
    fuentes: ["arriba", "frente"],
    texto: "Cuatro motores eléctricos con hélices plegables de tres palas. Los de delante van algo más altos que los de detrás. Hasta 72 km/h y 40 minutos de vuelo.",
  },
  {
    nombre: "Cuerpo y batería",
    en: [0, 13.2, -2],
    piezas: ["cuerpo", "frente", "pastillas", "pastillas-2", "mejillas"],
    respaldo: "foto",
    fuentes: ["ficha", "plegado"],
    texto: "Cuerpo cerrado en dos pisos, estrecho en el centro y ancho donde se articulan los brazos, resistente al agua y al polvo (IP55). Lleva una batería de 154 Wh; con ella pesa 2,11 kg.",
  },
  {
    nombre: "Patas",
    en: [PIE_D[0], 2.0, PIE_D[1]],
    piezas: ["patas", "patas-2"],
    respaldo: "foto",
    fuentes: ["frente", "militar"],
    texto: "Cada brazo termina en una pata, así que no necesita tren de aterrizaje aparte. Se puede lanzar y recoger a mano, como en la foto del Ejército de Tierra.",
  },
];

// De centímetros a unidades de la maqueta: x/25, y desde Y0 y z desde Z0.
const u = (v: number) => v / 100 / ESCALA;
const u2 = ([a, b]: P2): P2 => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b - Y0), u(c - Z0)];
const aUnidades = (p: Pieza): Pieza => {
  const g = p.girar && { girar: { ...p.girar, centro: u3(p.girar.centro) } };
  switch (p.tipo) {
    case "viga":
      return { ...p, ...g, ruta: p.ruta.map(([x, y, z, a, h]) => [u(x), u(y - Y0), u(z - Z0), u(a), u(h)] as [number, number, number, number, number]) };
    case "prisma": {
      // Planta [x, z] (o [x, y] a lo largo de z) y la altura (o la z).
      const plantaU = p.eje === "z" ? p.planta.map(([x, y]): P2 => [u(x), u(y - Y0)]) : p.planta.map(([x, z]): P2 => [u(x), u(z - Z0)]);
      return { ...p, ...g, planta: plantaU, y: p.eje === "z" ? u(p.y - Z0) : u(p.y - Y0), alto: u(p.alto), ...(p.chaflanArriba && { chaflanArriba: u2(p.chaflanArriba) }), ...(p.chaflanAbajo && { chaflanAbajo: u2(p.chaflanAbajo) }) };
    }
    case "pila":
      return { ...p, ...g, niveles: p.niveles.map(({ y, planta }) => ({ y: u(y - Y0), planta: planta.map(([x, z]): P2 => [u(x), u(z - Z0)]) })) };
    case "placa":
      if (p.plano !== "horizontal") throw new Error("Placa vertical sin convertir");
      return { ...p, ...g, planta: p.planta.map(([x, z]): P2 => [u(x), u(z - Z0)]), y: u(p.y - Y0), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "varilla":
      return { ...p, ...g, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, ...g, centro: u3(p.centro), tam: [u(p.tam[0]), u(p.tam[1]), u(p.tam[2])], ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

const maqueta: Maqueta = {
  nombre: "Skydio X10D",
  subtitulo: "Microdrón de reconocimiento",
  escala: ESCALA,  // 1 unidad = 25 cm (medidas oficiales)
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: bandera("US"),
  hd: true,
  // Tarjeta de /uas: de tres cuartos por delante y desde arriba, con el
  // sensor de frente (el ángulo que eligió el usuario con una captura del
  // visor, 6-oct-2026).
  vistaTarjeta: [30, 27],
  // La planta de la portada (unos 21 px de lado): sin calcas y pintada al
  // doble, para que los brazos y las palas (de 2 cm, medio píxel) se vean.
  plantaLisa: true,
  plantaDoble: true,
  piezas: PIEZAS.map(aUnidades),
  detalles: {
    calcas: CALCAS.map((c) => ({ ...c, en: u3(c.en), tam: u2(c.tam) })),
    costuras: COSTURAS.map((c) => ({ ...c, puntos: c.puntos.map(u3) })),
  },
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "arriba", imagen: "desplegado.jpg", titulo: "Desplegado y en vuelo, visto desde arriba", medio: "Skydio", url: SKYDIO },
    { id: "frente", imagen: "frente.jpg", titulo: "De frente, con el sensor VT300", medio: "Skydio", url: SKYDIO },
    { id: "plegado", imagen: "plegado.jpg", titulo: "Plegado", medio: "Skydio", url: SKYDIO },
    { id: "militar", imagen: "ejercito-tierra.jpg", titulo: "Un militar del Ejército de Tierra con el X10D", medio: "Ejército de Tierra (Infodefensa)", url: LETONIA },
    { id: "ficha", titulo: "Ficha técnica del X10", medio: "Skydio", url: FICHA_TECNICA },
  ],
};

export default maqueta;
