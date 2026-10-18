// Maqueta del Magura V7 de Uforce, con dos AIM-9M: lancha dron mayor que el
// V5 y de la misma forma, con la proa en cuña; bajo la defensa, una franja en
// vuelo hasta una arista que baja hacia popa, el costado casi vertical y el
// fondo en V hondo; espejo de popa plano. La cubierta de proa, baja y algo
// abombada, con dos tapas grandes; detrás, una rampa sube a la caseta, de
// techo plano que baja un poco hacia popa, con chaflanes hasta las bordas,
// donde van los lanzadores.
// Medidas: 7,2 x 2,1 x 1,5 m del GUR (Ukrinform); el largo del casco, 6,95 m
// en la defensa, medido con el AIM-9 (2,87 m) en las fotos de la
// presentación de mayo de 2025 (el resto, hasta 7,2, sería la tobera). Las
// posiciones, de esas fotos (Militarnyi y GUR) encajadas con el V5 como
// regla (arte/uas-fuentes/magura-v5-v7/hd/v7/, fuera de Git).
// Todo en metros (y = 0 en la línea de flotación); al final, a unidades de la
// maqueta (1 unidad = 2,5 m, como el V5: salen a escala entre sí).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.5;

const EUROMAIDAN = "https://euromaidanpress.com/2025/05/15/ukraine-unveils-new-magura-v7-naval-drone-used-to-shoot-down-two-russian-su-30-jets/";
const TWZ = "https://www.twz.com/sea/our-best-look-yet-at-ukraines-aim-9-sidewinder-toting-magura-7-drone-boat";

// Proa y popa (en la defensa) y alto de la defensa (sobre la flotación).
const PROA = 3.5, POPA = -3.45;
const YS = 0.45;
// Medio ancho del costado: 1,02 (2,1 m en la defensa) desde la popa hasta el
// principio de los lanzadores (z −1,25) y, de ahí a la punta, una cuña como
// la del V5: 1,02 · (1 − t^1,6), con t de 0 en Z_MANGA a 1 en la punta.
const MANGA = 1.02, Z_MANGA = -1.25;
const medioAncho = (z: number) => MANGA * (1 - Math.max(0, (z - Z_MANGA) / (PROA - Z_MANGA)) ** 1.6);

const aTrozos = (t: [number, number][], z: number) => {
  for (let i = 0; i < t.length - 1; i++) {
    const [z0, v0] = t[i], [z1, v1] = t[i + 1];
    if (z <= z0 && z >= z1) return v0 + ((v1 - v0) * (z - z0)) / (z1 - z0);
  }
  return t[t.length - 1][1];
};
const entre = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
// Bajo la defensa: una franja que se mete hacia dentro hasta una arista (la
// línea que en la foto de perfil baja de 12 cm bajo la defensa en la proa a
// 30 cm a media eslora; más clara debajo: el costado de encima cae en
// vuelo), el costado casi vertical hasta el pantoque y el fondo en V hasta la
// quilla, honda (1 m bajo la defensa) y subiendo en la proa.
const ARISTA: [number, number][] = [[PROA, 0.12], [3.3, 0.14], [2.9, 0.18], [2.35, 0.22], [1.3, 0.3], [0, 0.32], [-2, 0.33], [POPA, 0.34]];
const PANTOQUE: [number, number][] = [[PROA, 0.38], [2.9, 0.42], [2, 0.48], [0, 0.52], [-2, 0.5], [POPA, 0.46]];
const QUILLA: [number, number][] = [[PROA, 0.55], [3.45, 0.72], [3.35, 0.82], [3.15, 0.92], [2.9, 0.97], [2.35, 1], [1, 1], [0, 0.98], [-1, 0.94], [-2, 0.86], [-3, 0.72], [POPA, 0.62]];

// Cubierta de proa: el borde, 10 cm sobre la defensa, y en el eje, 15 cm
// (algo abombada). La caseta: una rampa la sube desde la cubierta (de
// ESCALON_PIE a ESCALON_ARRIBA; arriba, más estrecha, así que sus aristas
// con los chaflanes suben en diagonal hacia dentro), techo plano 27 cm sobre
// la defensa hasta TECHO_BAJA (detrás de la torreta) y, de ahí al espejo,
// bajando a 19 cm (la tapa de popa va inclinada). En el espejo, el techo es casi tan ancho como
// el barco (1,76 m) y el chaflán, casi vertical.
const Y_BORDE = YS + 0.1, Y_CUB = YS + 0.15, Y_CASETA = YS + 0.27, Y_CASETA_POPA = YS + 0.19;
const ESCALON_PIE = -0.15, ESCALON_ARRIBA = -0.37, TECHO_BAJA = -1.35;
const camber = (x: number, hb: number) => Y_CUB - (Y_CUB - Y_BORDE) * (hb > 0 ? Math.min(1, x / hb) ** 2 : 0);
const techo = (z: number) => entre(Y_CASETA, Y_CASETA_POPA, (TECHO_BAJA - z) / (TECHO_BAJA - POPA));
const techoAncho = (z: number) => (z > -0.7 ? entre(0.45, 0.62, (ESCALON_ARRIBA - z) / (ESCALON_ARRIBA + 0.7)) : entre(0.62, 0.84, (TECHO_BAJA - z) / (TECHO_BAJA - POPA)));
const ZS = [PROA, 3.4, 3.25, 3.05, 2.8, 2.5, 2.1, 1.6, 1.0, 0.4, ESCALON_PIE, ESCALON_ARRIBA, -0.7, TECHO_BAJA, -2.3, POPA];
const SECCIONES: Seccion[] = ZS.map((z) => {
  const hb = medioAncho(z), k = hb / MANGA;
  const caseta = z <= ESCALON_ARRIBA;
  // En la cubierta de proa, los dos primeros tramos siguen la cubierta
  // abombada; en la caseta, el techo y el chaflán.
  const xP = caseta ? techoAncho(z) : 0.5 * hb;
  const xL = caseta ? entre(hb - 0.26, 0.9, (TECHO_BAJA - z) / (TECHO_BAJA - POPA)) : 0.75 * hb;
  const yP = caseta ? techo(z) : Y_CUB, yP2 = caseta ? yP : camber(xP, hb), yL = camber(xL, hb);
  const yA = YS - aTrozos(ARISTA, z), yC = YS - aTrozos(PANTOQUE, z), yK = YS - aTrozos(QUILLA, z);
  // La franja en vuelo bajo la defensa se endereza hacia popa: de media
  // eslora atrás, el costado baja vertical hasta el pantoque (foto de popa).
  const f = entre(0, 1, (z + 0.5) / 1.5);
  const xA = hb - 0.06 * k * f, xC = hb - (0.02 + 0.07 * f) * k;
  return {
    z, ancho: hb, arriba: yP, abajo: yK,
    ...([ESCALON_PIE, ESCALON_ARRIBA, TECHO_BAJA].includes(z) && { quiebre: true }),
    contorno: [
      [[0, yP], [xP, yP2]],
      [[xP, yP2], [xL, yL]],
      [[xL, yL], [hb, Y_BORDE]],
      [[hb, Y_BORDE], [hb, YS - 0.03]],
      [[hb, YS - 0.03], [xA, yA]],
      [[xA, yA], [xC, yC]],
      [[xC, yC], [0, yK]],
    ],
  };
});
// Alto de la cubierta de proa a un lado (x) en una z.
const cubiertaEn = (x: number, z: number) => camber(Math.abs(x), medioAncho(z));
const Y_REPISA = camber(0.9, MANGA);

// Defensa de goma negra a la altura YS, 2 cm por fuera del costado: de una
// pieza de popa a popa por la proa, y otra a lo ancho del espejo. Puntos más
// juntos hacia la punta, donde la cuña se cierra.
const DEFENSA_Z = Array.from({ length: 24 }, (_, i) => PROA - (PROA - POPA) * ((i + 1) / 24) ** 1.5);
DEFENSA_Z[DEFENSA_Z.length - 1] = POPA - 0.02;
const DEFENSA_LADO = DEFENSA_Z.map((z): [number, number, number, number, number] => [medioAncho(Math.min(z, PROA)) + 0.02, YS, z, 0.03, 0.03]);
const DEFENSA: [number, number, number, number, number][] = [
  ...DEFENSA_LADO.slice().reverse(),
  [0, YS, PROA + 0.025, 0.03, 0.03],
  ...DEFENSA_LADO.map(([x, y, z, rx, ry]): [number, number, number, number, number] => [-x, y, z, rx, ry]),
];

// Torreta de cámaras, calcada en la foto de frente (TWZ) y la de lado
// (Militarnyi): 18,5 cm de ancho y 28 cm de alto, de una pieza. Abajo, una
// base algo más ancha con una ranura; encima, la cabeza, un cilindro que
// acaba en cúpula; delante, saliendo de ella, la bola de las cámaras: un
// marco alargado de puntas redondas, negro, con la térmica arriba (toda
// negra) y la de día abajo (con aro claro), y debajo, el hueco de la
// horquilla.
const TORRETA_Z = -1.0;
const T = Y_CASETA;
const R_BASE = 0.095, R_CABEZA = 0.084;
const ventana = (w: number, h: number, r: number, y0: number): [number, number][] => {
  const p: [number, number][] = [];
  for (const [cx, cy, a0] of [[w - r, h - r, 0], [-w + r, h - r, 90], [-w + r, -h + r, 180], [w - r, -h + r, 270]] as const)
    for (let k = 0; k <= 4; k++) { const a = ((a0 + k * 22.5) * Math.PI) / 180; p.push([cx + r * Math.cos(a), y0 + cy + r * Math.sin(a)]); }
  return p;
};
const optica = (id: string, x: number, y: number, z: number, r: number, aro: number, acabadoAro: "negro" | "aluminio"): Pieza[] => [
  { tipo: "disco", id: `${id}-aro`, en: [x, y, z], normal: [0, 0, 1], radio: aro, grosor: 0.006, acabado: acabadoAro },
  { tipo: "disco", id, en: [x, y, z + 0.002], normal: [0, 0, 1], radio: r, grosor: 0.006, acabado: "lente" },
];
const BOLA_Y = T + 0.185, BOLA_Z = TORRETA_Z + R_CABEZA - 0.045;
const TORRETA: Pieza[] = [
  { tipo: "codo", id: "torreta", acabado: "gris-qs", puntos: [
    [0, T, TORRETA_Z, R_BASE + 0.002, R_BASE + 0.002], [0, T + 0.046, TORRETA_Z, R_BASE, R_BASE], [0, T + 0.048, TORRETA_Z, R_BASE - 0.003, R_BASE - 0.003],
    [0, T + 0.051, TORRETA_Z, R_BASE - 0.003, R_BASE - 0.003], [0, T + 0.053, TORRETA_Z, R_BASE, R_BASE], [0, T + 0.078, TORRETA_Z, R_BASE, R_BASE],
    [0, T + 0.082, TORRETA_Z, R_CABEZA, R_CABEZA], [0, T + 0.17, TORRETA_Z, R_CABEZA, R_CABEZA], [0, T + 0.2, TORRETA_Z, 0.082, 0.082],
    [0, T + 0.225, TORRETA_Z, 0.076, 0.076], [0, T + 0.25, TORRETA_Z, 0.063, 0.063], [0, T + 0.268, TORRETA_Z, 0.045, 0.045],
    [0, T + 0.278, TORRETA_Z, 0.025, 0.025], [0, T + 0.282, TORRETA_Z, 0, 0],
  ] },
  // Bajo la bola, el hueco oscuro de la horquilla.
  { tipo: "prisma", id: "horquilla", eje: "z", acabado: "gris-fu2", planta: ventana(0.05, 0.04, 0.035, T + 0.125), y: BOLA_Z - 0.005, alto: 0.05 },
  { tipo: "prisma", id: "bola", eje: "z", acabado: "negro", planta: ventana(0.046, 0.085, 0.044, BOLA_Y), y: BOLA_Z, alto: 0.055 },
  { tipo: "prisma", id: "bola-placa", eje: "z", acabado: "gris-fu2", planta: ventana(0.036, 0.074, 0.034, BOLA_Y), y: BOLA_Z, alto: 0.058 },
  ...optica("optica-ir", 0, BOLA_Y + 0.04, BOLA_Z + 0.059, 0.019, 0.026, "negro"),
  ...optica("optica-dia", 0, BOLA_Y - 0.017, BOLA_Z + 0.059, 0.019, 0.027, "aluminio"),
];

// Tapas de la cubierta de proa, grandes (casi todo el ancho), en relieve y
// con las esquinas redondas: en la foto de perfil, de z 2,13 a 1,19 y de
// 0,86 hasta el pie de la rampa. Planta: trapecio que sigue la cuña, a 3/4
// del medio ancho de la cubierta; base a la altura de sus bordes (la
// cubierta es abombada) y 1,5 cm por encima del eje.
const plantaTapa = (z0: number, z1: number, w0: number, w1: number, r: number): [number, number][] => [
  [w0 - r, z0], [w0, z0 - r], [w1, z1 + r], [w1 - r, z1], [-w1 + r, z1], [-w1, z1 + r], [-w0, z0 - r], [-w0 + r, z0],
];
const TAPAS_PROA = ([["tapa-proa", 2.13, 1.19], ["tapa-media", 0.86, ESCALON_PIE + 0.02]] as const).map(([id, z0, z1]) => {
  const w0 = 0.75 * medioAncho(z0), w1 = 0.75 * medioAncho(z1), y = cubiertaEn(w1, z1) - 0.004;
  return { id, z0, z1, w0, w1, pieza: { tipo: "prisma", id, acabado: "gris-m7", planta: plantaTapa(z0, z1, w0, w1, 0.07), y, alto: Y_CUB + 0.015 - y } as Pieza };
});
// La tapa de la caseta, detrás de la torreta: inclinada como el techo (en la
// foto desde popa), con la Starlink de popa encima.
const TAPA_POPA = { z0: -1.45, z1: -3.3, w: 0.6 };
const ZT = (TAPA_POPA.z0 + TAPA_POPA.z1) / 2;
const PENDIENTE = (Math.atan((Y_CASETA - Y_CASETA_POPA) / (TECHO_BAJA - POPA)) * 180) / Math.PI;
const TAPAS: Pieza[] = [
  ...TAPAS_PROA.map((t) => t.pieza),
  {
    tipo: "caja", id: "tapa-popa", centro: [0, techo(ZT) + 0.009, ZT], tam: [2 * TAPA_POPA.w, 0.018, TAPA_POPA.z0 - TAPA_POPA.z1], redondeo: 0.07, acabado: "gris-m7",
    girar: { centro: [0, techo(ZT), ZT], eje: "x", grados: -PENDIENTE },
  },
];

// Dos Starlink, placas planas y claras de unos 60 x 60 cm, cada una sobre un
// soporte bajo. La de proa, sobre la tapa media (de z 0,61 a 0,02); la de
// popa, sobre la tapa inclinada de la caseta, con su misma caída.
const STARLINK_Z = 0.31, SL_Y = Y_CUB + 0.015;
const STARLINK: Pieza[] = [
  { tipo: "caja", id: "starlink-soporte", centro: [0, SL_Y + 0.03, STARLINK_Z], tam: [0.3, 0.06, 0.4], acabado: "gris-fu2" },
  { tipo: "caja", id: "starlink", centro: [0, SL_Y + 0.078, STARLINK_Z], tam: [0.58, 0.035, 0.6], redondeo: 0.008, acabado: "blanco" },
];
const STARLINK2_Z = -1.95, SL2_Y = techo(STARLINK2_Z) + 0.018;
const STARLINK2: Pieza[] = ([
  { tipo: "caja", id: "starlink2-soporte", centro: [-0.05, SL2_Y + 0.025, STARLINK2_Z], tam: [0.3, 0.05, 0.4], acabado: "gris-fu2" },
  { tipo: "caja", id: "starlink2", centro: [-0.05, SL2_Y + 0.068, STARLINK2_Z], tam: [0.58, 0.035, 0.6], redondeo: 0.008, acabado: "gris-qs" },
] as Pieza[]).map((p): Pieza => ({ ...p, girar: { centro: [0, SL2_Y, STARLINK2_Z], eje: "x", grados: -PENDIENTE } }));
const CUPULA: Pieza[] = [
  { tipo: "codo", id: "cupula", acabado: "negro", puntos: [[0.4, Y_CASETA, -1.15, 0.05, 0.05], [0.4, Y_CASETA + 0.025, -1.15, 0.046, 0.046], [0.4, Y_CASETA + 0.045, -1.15, 0.03, 0.03], [0.4, Y_CASETA + 0.052, -1.15, 0, 0]] },
];

// Caja de cámaras de la proa (dos ópticas mirando adelante), como la del
// V5, en la cubierta de proa.
const arco = (w: number, y0: number, y1: number, r: number): [number, number][] => [
  [w, y0],
  ...Array.from({ length: 5 }, (_, k): [number, number] => { const a = (k * Math.PI) / 8; return [w - r + r * Math.cos(a), y1 - r + r * Math.sin(a)]; }),
  ...Array.from({ length: 5 }, (_, k): [number, number] => { const a = Math.PI / 2 + (k * Math.PI) / 8; return [-w + r + r * Math.cos(a), y1 - r + r * Math.sin(a)]; }),
  [-w, y0],
];
const CAJA_Z = 2.93, CY = Y_CUB;
const CAJA: Pieza[] = [
  { tipo: "prisma", id: "caja-placa", acabado: "negro", y: CY - 0.004, alto: 0.022, planta: [[-0.08, CAJA_Z - 0.1], [0.08, CAJA_Z - 0.1], [0.08, CAJA_Z + 0.08], [0.06, CAJA_Z + 0.1], [-0.06, CAJA_Z + 0.1], [-0.08, CAJA_Z + 0.08]] },
  { tipo: "prisma", id: "caja-camaras", eje: "z", acabado: "gris-qs", y: CAJA_Z - 0.09, alto: 0.175, planta: arco(0.065, CY + 0.018, CY + 0.1, 0.03) },
  ...optica("caja-optica", -0.03, CY + 0.055, CAJA_Z + 0.085, 0.014, 0.02, "negro"),
  ...optica("caja-optica-2", 0.03, CY + 0.055, CAJA_Z + 0.085, 0.009, 0.013, "negro"),
];

// Lanzadores: en cada borda, junto a la caseta, una caja de aluminio (la
// base, de z −1,38 a −3,27 en la foto de perfil), con ranuras en la cara de
// fuera y, a popa, la bisagra que levanta el raíl (dos placas con un eje y
// mangueras trenzadas a la cubierta); encima, un LAU-7, el lanzador de los
// AIM-9 de los aviones: cuerpo gris claro, con la proa gorda y redonda bajo
// las aletas de mando, y el misil colgado encima de tres orejetas.
const MX = 0.92;
const BASE_Y = Y_REPISA + 0.25, LAU_Y = BASE_Y + 0.075, MISIL_Y = LAU_Y + 0.15;
const BASE_Z0 = -1.38, BASE_Z1 = -3.27;
const LANZADOR = (s: number): Pieza[] => [
  { tipo: "caja", id: `lanzador-base-${s}`, centro: [s * MX, Y_REPISA + 0.125, (BASE_Z0 + BASE_Z1) / 2], tam: [0.2, 0.25, BASE_Z0 - BASE_Z1], redondeo: 0.008, acabado: "aluminio" },
  // Ranuras de la cara de fuera: cinco cortas delante y una larga detrás.
  ...Array.from({ length: 5 }, (_, i): Pieza => ({ tipo: "caja", id: `lanzador-ranura-${i}-${s}`, centro: [s * (MX + 0.1), Y_REPISA + 0.12, -1.5 - i * 0.085], tam: [0.006, 0.11, 0.04], acabado: "hueco" })),
  { tipo: "caja", id: `lanzador-ranura-larga-${s}`, centro: [s * (MX + 0.1), Y_REPISA + 0.13, -2.55], tam: [0.006, 0.035, 1.15], acabado: "hueco" },
  { tipo: "caja", id: `lanzador-ranura-alta-${s}`, centro: [s * (MX + 0.1), Y_REPISA + 0.2, -2.55], tam: [0.006, 0.015, 1.15], acabado: "hueco" },
  // Bisagra de popa: dos placas a los lados del raíl y el eje.
  ...[1, -1].map((j): Pieza => ({ tipo: "caja", id: `lanzador-bisagra-${j}-${s}`, centro: [s * MX + j * 0.085, BASE_Y + 0.04, -3.15], tam: [0.012, 0.13, 0.2], redondeo: 0.004, acabado: "aluminio" })),
  { tipo: "disco", id: `lanzador-eje-${s}`, en: [s * MX + s * 0.095, BASE_Y + 0.05, -3.18], normal: [s, 0, 0], radio: 0.03, grosor: 0.012, acabado: "metal" },
  { tipo: "codo", id: `lanzador-manguera-${s}`, acabado: "gris-fu2", puntos: [[s * (MX - 0.06), BASE_Y + 0.02, -3.08, 0.012, 0.012], [s * (MX - 0.14), BASE_Y - 0.06, -3.12, 0.012, 0.012], [s * (MX - 0.2), BASE_Y - 0.2, -3.1, 0.012, 0.012], [s * (MX - 0.24), Y_REPISA + 0.01, -3.0, 0.012, 0.012]] },
  { tipo: "tubo", id: `lanzador-${s}`, acabado: "gris-misil", centro: [s * MX, LAU_Y], seccion: [1, 1.1], perfil: [[-0.5, 0], [-0.515, 0.035], [-0.55, 0.06], [-0.62, 0.075], [-0.72, 0.078], [-0.9, 0.07], [-3.15, 0.07], [-3.2, 0.055], [-3.21, 0]] },
  // Las tres orejetas que cogen el misil, entre el raíl y el misil.
  ...[0.75, 1.15, 2.0].map((d, i): Pieza => ({ tipo: "caja", id: `lanzador-orejeta-${i}-${s}`, centro: [s * MX, LAU_Y + 0.085, NARIZ - d], tam: [0.03, 0.03, 0.06], acabado: "metal" })),
];

// AIM-9M, del misil de verdad (2,87 m de largo y 12,7 cm de diámetro) y las
// bandas medidas en la foto de perfil: la cúpula del buscador, gris clara;
// un cuello de acero; la sección de guía y mando, gris muy oscuro, que se
// estrecha hacia la punta, con las aletas de mando (doble delta, la punta
// hacia atrás); un aro, la cinta naranja «CAUTION BREAKABLE WINDOW» sobre
// la espoleta; el resto, gris claro, con la banda amarilla (cabeza de
// guerra) y la marrón (motor), las juntas, y las alas de cola con los
// rolerones (las ruedas de las puntas). En la tobera, la tapa roja; de la
// espoleta cuelga la cinta roja «REMOVE BEFORE FLIGHT».
const NARIZ = -0.21, R = 0.0635;
const zm = (d: number) => NARIZ - d;
const banda = (id: string, s: number, d0: number, d1: number, acabado: "amarillo" | "marron" | "naranja" | "metal" | "junta" | "rojo-vivo", sobre = 0.0015): Pieza => ({
  tipo: "tubo", id: `${id}-${s}`, acabado, centro: [s * MX, MISIL_Y], perfil: [[zm(d0), 0], [zm(d0), R + sobre], [zm(d1), R + sobre], [zm(d1), 0]],
});
// Cuatro aletas en X alrededor del misil: contorno [z, distancia al eje].
const EN_X = [45, 135, -45, -135];
const aletas = (id: string, s: number, contorno: [number, number][], acabado: "gris-misil" | "junta"): Pieza[] => EN_X.map((g, i) => ({
  tipo: "placa", id: `${id}-${i}-${s}`, acabado, plano: "vertical", x: s * MX, y: MISIL_Y, grosor: 0.006, bisel: 0.002, inclinacion: s * g, planta: contorno,
}) as Pieza);
// Una pieza en el plano de la aleta g, a la distancia r del eje.
const enAleta = (s: number, g: number, r: number): [number, number] => {
  const a = ((s * g) * Math.PI) / 180;
  return [s * MX + s * r * Math.sin(a), MISIL_Y + r * Math.cos(a)];
};
const MISIL = (s: number): Pieza[] => [
  { tipo: "tubo", id: `misil-cupula-${s}`, acabado: "hueso", centro: [s * MX, MISIL_Y], perfil: [[zm(0), 0], [zm(0.01), 0.026], [zm(0.025), 0.037], [zm(0.045), 0.044], [zm(0.06), 0.046], [zm(0.06), 0]] },
  { tipo: "tubo", id: `misil-cuello-${s}`, acabado: "metal", centro: [s * MX, MISIL_Y], perfil: [[zm(0.06), 0], [zm(0.06), 0.047], [zm(0.12), 0.054], [zm(0.12), 0]] },
  { tipo: "tubo", id: `misil-guia-${s}`, acabado: "gris-fu2", centro: [s * MX, MISIL_Y], perfil: [[zm(0.12), 0], [zm(0.12), 0.054], [zm(0.25), 0.06], [zm(0.36), R], [zm(0.64), R], [zm(0.64), 0]] },
  { tipo: "tubo", id: `misil-${s}`, acabado: "gris-misil", centro: [s * MX, MISIL_Y], perfil: [[zm(0.64), 0], [zm(0.64), R], [zm(2.84), R], [zm(2.87), R - 0.008], [zm(2.87), 0]] },
  banda("misil-aro", s, 0.64, 0.655, "metal", 0.002),
  banda("misil-cinta", s, 0.66, 0.82, "naranja"),
  banda("misil-cinta-roja", s, 0.7, 0.745, "rojo-vivo", 0.003),
  banda("misil-cabeza", s, 1.04, 1.11, "amarillo"),
  banda("misil-motor", s, 1.41, 1.47, "marron"),
  banda("misil-junta", s, 1.9, 1.908, "junta"),
  banda("misil-junta-2", s, 1.93, 1.938, "junta"),
  { tipo: "disco", id: `misil-tapa-${s}`, en: [s * MX, MISIL_Y, zm(2.87) - 0.005], normal: [0, 0, -1], radio: R + 0.004, grosor: 0.012, acabado: "rojo" },
  // La cinta roja: cuelga por fuera, hasta bajo el lanzador.
  { tipo: "placa", id: `misil-cinta-cuelga-${s}`, acabado: "rojo-vivo", plano: "vertical", x: s * (MX + R + 0.004), grosor: 0.003, planta: [[zm(0.7), MISIL_Y], [zm(0.745), MISIL_Y], [zm(0.79), LAU_Y - 0.3], [zm(0.745), LAU_Y - 0.3]] },
  ...aletas("misil-canard", s, [[zm(0.3), R - 0.005], [zm(0.42), R + 0.05], [zm(0.6), R + 0.224], [zm(0.53), R - 0.005]], "junta"),
  ...aletas("misil-ala", s, [[zm(2.25), R - 0.005], [zm(2.68), R + 0.256], [zm(2.76), R + 0.256], [zm(2.76), R + 0.17], [zm(2.84), R + 0.17], [zm(2.84), R - 0.005]], "gris-misil"),
  ...EN_X.map((g, i): Pieza => {
    const [x, y] = enAleta(s, g, R + 0.215), a = ((s * g) * Math.PI) / 180;
    return { tipo: "disco", id: `misil-rolleron-${i}-${s}`, en: [x, y, zm(2.8)], normal: [Math.cos(a), -Math.sin(a), 0], radio: 0.042, grosor: 0.01, acabado: "metal" };
  }),
];

// Rejillas de ventilación del costado: un hueco negro bajo la defensa con
// cinco lamas, de z 1,07 a 1,57 (en las dos fotos de la presentación),
// giradas con el costado, que ahí ya se cierra hacia la proa.
const REJILLA_Z = 1.32;
const REJILLA_X = medioAncho(REJILLA_Z) - 0.025;
const REJILLA_GIRO = (Math.atan((medioAncho(REJILLA_Z - 0.25) - medioAncho(REJILLA_Z + 0.25)) / 0.5) * 180) / Math.PI;
const REJILLA = (s: number): Pieza[] => ([
  { tipo: "caja", id: `rejilla-${s}`, centro: [s * REJILLA_X, YS - 0.11, REJILLA_Z], tam: [0.04, 0.18, 0.5], redondeo: 0.01, acabado: "negro" },
  ...Array.from({ length: 5 }, (_, i): Pieza => ({ tipo: "caja", id: `rejilla-lama-${i}-${s}`, centro: [s * (REJILLA_X + 0.02), YS - 0.11, REJILLA_Z - 0.2 + i * 0.1], tam: [0.016, 0.15, 0.045], redondeo: 0.008, acabado: "gris-fu2" })),
] as Pieza[]).map((p): Pieza => ({ ...p, girar: { centro: [s * REJILLA_X, YS - 0.11, REJILLA_Z], eje: "y", grados: -s * REJILLA_GIRO } }));

// Cornamusas negras en T a proa (como las del V5) y argollas amarillas: dos
// en la borda (z 0,85) y dos grilletes en las esquinas del espejo.
const cornamusa = (id: string, x: number, y: number, z: number): Pieza[] => [1, -1].flatMap((s): Pieza[] => [
  ...[1, -1].map((j): Pieza => ({ tipo: "caja", id: `${id}-pata-${s}-${j}`, centro: [s * x, y + 0.012, z + j * 0.03], tam: [0.018, 0.026, 0.02], acabado: "negro" })),
  { tipo: "tubo", id: `${id}-${s}`, centro: [s * x, y + 0.031], seccion: [1, 0.75], perfil: [[z + 0.085, 0.003], [z + 0.077, 0.008], [z + 0.056, 0.01], [z + 0.028, 0.008], [z - 0.028, 0.008], [z - 0.056, 0.01], [z - 0.077, 0.008], [z - 0.085, 0.003]], acabado: "negro" },
]);
const argolla = (id: string, x: number, y: number, z: number, eje: "x" | "z"): Pieza => ({
  tipo: "codo", id, acabado: "amarillo",
  puntos: Array.from({ length: 13 }, (_, i): [number, number, number, number, number] => {
    const a = (i / 12) * Math.PI * 2, r = 0.03;
    return eje === "x" ? [x, y + r * Math.sin(a), z + r * Math.cos(a), 0.008, 0.008] : [x + r * Math.cos(a), y + r * Math.sin(a), z, 0.008, 0.008];
  }),
});
const CORNAMUSA_Z = 2.6, CORNAMUSA_X = 0.7 * medioAncho(CORNAMUSA_Z);
const ARGOLLA_Z = 0.85, ARGOLLA_X = medioAncho(ARGOLLA_Z) - 0.09;

// El espejo de popa (foto desde detrás): bajo la defensa, un panel en
// relieve de 1,3 m de ancho hasta 26 cm por debajo, que sigue en trapecio
// hasta 39 cm (0,97 m de ancho abajo), con el dispositivo redondo negro algo
// a babor y un piloto pequeño a estribor; encima de la defensa, en la cara
// de popa de la caseta, dos rejillas y una caja con una luz ámbar.
const PANEL: [number, number][] = [[0.65, YS - 0.04], [0.65, YS - 0.235], [0.625, YS - 0.26], [0.485, YS - 0.39], [-0.485, YS - 0.39], [-0.625, YS - 0.26], [-0.65, YS - 0.235], [-0.65, YS - 0.04]];
const ESPEJO: Pieza[] = [
  { tipo: "prisma", id: "espejo-panel", eje: "z", acabado: "gris-m7", planta: PANEL, y: POPA - 0.03, alto: 0.04 },
  { tipo: "disco", id: "espejo-aro", en: [0.17, YS - 0.15, POPA - 0.034], normal: [0, 0, -1], radio: 0.08, grosor: 0.012, acabado: "negro" },
  { tipo: "disco", id: "espejo-disco", en: [0.17, YS - 0.15, POPA - 0.041], normal: [0, 0, -1], radio: 0.05, grosor: 0.006, acabado: "gris-fu2" },
  { tipo: "disco", id: "espejo-piloto", en: [-0.45, YS - 0.09, POPA - 0.033], normal: [0, 0, -1], radio: 0.018, grosor: 0.006, acabado: "aluminio" },
  { tipo: "caja", id: "espejo-rejilla-1", centro: [0.22, YS + 0.12, POPA - 0.004], tam: [0.25, 0.05, 0.008], acabado: "negro" },
  { tipo: "caja", id: "espejo-rejilla-2", centro: [-0.37, YS + 0.12, POPA - 0.004], tam: [0.21, 0.05, 0.008], acabado: "negro" },
  { tipo: "caja", id: "espejo-caja", centro: [-0.11, YS + 0.12, POPA - 0.015], tam: [0.15, 0.08, 0.03], redondeo: 0.006, acabado: "gris-fu2" },
  { tipo: "disco", id: "espejo-luz", en: [-0.11, YS + 0.12, POPA - 0.031], normal: [0, 0, -1], radio: 0.018, grosor: 0.004, acabado: "amarillo" },
];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "casco", secciones: SECCIONES, facetas: true, tapaPlana: true, acabado: "gris-m7" },
  { tipo: "codo", id: "defensa", puntos: DEFENSA, acabado: "negro" },
  { tipo: "varilla", id: "defensa-popa", desde: [-MANGA - 0.02, YS, POPA - 0.02], hasta: [MANGA + 0.02, YS, POPA - 0.02], radio: 0.03, acabado: "negro" },
  ...TORRETA,
  ...STARLINK,
  ...STARLINK2,
  ...CUPULA,
  ...CAJA,
  ...TAPAS,
  ...[1, -1].flatMap(LANZADOR),
  ...[1, -1].flatMap(MISIL),
  ...[1, -1].flatMap(REJILLA),
  ...cornamusa("cornamusa-proa", CORNAMUSA_X, cubiertaEn(CORNAMUSA_X, CORNAMUSA_Z), CORNAMUSA_Z),
  ...[1, -1].map((s) => argolla(`argolla-${s}`, s * ARGOLLA_X, cubiertaEn(ARGOLLA_X, ARGOLLA_Z) + 0.03, ARGOLLA_Z, "z")),
  ...[1, -1].map((s) => argolla(`grillete-${s}`, s * (MANGA + 0.035), YS - 0.065, POPA + 0.04, "x")),
  ...ESPEJO,
];

const COSTURAS: Costura[] = [
  // Tornillos de las tapas, 3 cm por dentro del borde.
  ...TAPAS_PROA.map(({ id, z0, z1, w0, w1 }): Costura => ({ sobre: [id], desde: [0, 1, 0], puntos: [[-(w0 - 0.03), 1.2, z0 - 0.03], [w0 - 0.03, 1.2, z0 - 0.03], [w1 - 0.03, 1.2, z1 + 0.03], [-(w1 - 0.03), 1.2, z1 + 0.03], [-(w0 - 0.03), 1.2, z0 - 0.03]], remaches: 0.1 })),
  { sobre: ["tapa-popa"], desde: [0, 1, 0], puntos: [[-0.56, 1.2, TAPA_POPA.z0 - 0.04], [0.56, 1.2, TAPA_POPA.z0 - 0.04], [0.56, 1.2, TAPA_POPA.z1 + 0.04], [-0.56, 1.2, TAPA_POPA.z1 + 0.04], [-0.56, 1.2, TAPA_POPA.z0 - 0.04]], remaches: 0.1 },
  // Tornillos de la base de los lanzadores, arriba y abajo de la cara de fuera.
  ...[1, -1].flatMap((s) => [Y_REPISA + 0.235, Y_REPISA + 0.02].map((y): Costura => ({ sobre: [`lanzador-base-${s}`], desde: [s, 0, 0], puntos: [[s * 2, y, BASE_Z0 - 0.05], [s * 2, y, BASE_Z1 + 0.05]], remaches: 0.07 }))),
];

// «UFORCE MAGURA» en blanco en los dos costados, cerca de la popa (de z
// −1,74 a −2,87, bajo la defensa), y el emblema del GUR en la cubierta de
// proa, entre la caja de cámaras y la primera tapa.
const BLANCO_LOGO = "#e6e8e8";
const CALCAS: Calca[] = [
  ...[1, -1].map((s): Calca => ({ sobre: ["casco"], en: [s * MANGA, YS - 0.2, -2.3], desde: [s, 0, 0], tam: [1.13, 0.27], dibujo: { tipo: "logo", logo: "magura", color: BLANCO_LOGO } })),
  { sobre: ["casco"], en: [0, Y_CUB, 2.5], desde: [0, 1, 0], tam: [0.4, 0.43], dibujo: { tipo: "logo", logo: "gur", color: BLANCO_LOGO } },
];

const PARTES: Parte[] = [
  {
    nombre: "Casco",
    en: [MANGA, YS - 0.2, -0.6],
    piezas: ["casco", "defensa", "defensa-popa", ...TAPAS.map((p) => p.id), ...ESPEJO.map((p) => p.id)],
    respaldo: "foto",
    fuentes: ["perfil", "juntos", "popa", "torreta"],
    texto: "Lancha de 7,2 m y 2,1 m de manga, de polietileno y fibra de vidrio, con la misma forma que el V5: proa en cuña, costado vertical con una defensa de goma a todo lo largo y fondo en V. En la cubierta de proa, dos tapas grandes; detrás, una rampa sube a la caseta, que llega hasta popa con los lanzadores a los lados. Lleva un motor diésel y 1.200 litros de gasóleo: dos días de autonomía como mínimo.",
    nota: "Las medidas, del GUR; la forma, de las fotos de la presentación de mayo de 2025, con el V5 al lado como regla. La planta de la proa no se ve en ninguna foto: va como la del V5. El fondo, tapado por el carro, es aproximado, y la línea de flotación, supuesta.",
  },
  {
    nombre: "AIM-9M y lanzadores",
    en: [MX, MISIL_Y + 0.1, -1.2],
    piezas: PIEZAS.map((p) => p.id).filter((id) => id.startsWith("misil") || id.startsWith("lanzador")),
    respaldo: "foto",
    fuentes: ["railes", "detalle", "popa", "navalnews"],
    texto: "Dos misiles aire-aire AIM-9M Sidewinder, de guía infrarroja, sobre sus LAU-7, los lanzadores de los aviones, montados en una base de aluminio con una bisagra que los levanta para disparar. Con ellos derribó el V7 dos Su-30 rusos en mayo de 2025.",
    nota: "El misil, de sus medidas de fábrica y las bandas de la foto de perfil; los lanzadores, de las fotos. En la presentación llevaban las tapas rojas de la tobera y las cintas «REMOVE BEFORE FLIGHT».",
  },
  {
    nombre: "Torreta de cámaras",
    en: [0, T + 0.28, TORRETA_Z + 0.05],
    piezas: TORRETA.map((p) => p.id),
    respaldo: "foto",
    fuentes: ["camara", "railes", "juntos"],
    texto: "Torreta giratoria con una cámara de día y una térmica, para buscar y seguir el blanco.",
  },
  {
    nombre: "Starlink",
    en: [0, SL_Y + 0.15, STARLINK_Z],
    piezas: [...STARLINK.map((p) => p.id), ...STARLINK2.map((p) => p.id), "cupula"],
    respaldo: "foto",
    fuentes: ["camara", "proa", "popa"],
    texto: "Dos antenas Starlink planas, una en la cubierta de proa sobre un soporte con agujeros y otra detrás de la torreta, para mandar el vídeo y recibir órdenes por satélite. Detrás de la torreta, una cúpula negra.",
    nota: "Qué es la cúpula no está publicado; por la forma, otra antena.",
  },
  {
    nombre: "Cámaras de proa",
    en: [0.04, CY + 0.12, CAJA_Z],
    piezas: CAJA.map((p) => p.id),
    respaldo: "foto",
    fuentes: ["proa", "railes"],
    texto: "Una caja gris clara con dos ópticas mirando adelante, como en el V5. Detrás, el emblema de la inteligencia militar ucraniana (GUR).",
  },
  {
    nombre: "Rejillas",
    en: [REJILLA_X + 0.02, YS - 0.12, REJILLA_Z],
    piezas: PIEZAS.map((p) => p.id).filter((id) => id.startsWith("rejilla")),
    respaldo: "foto",
    fuentes: ["perfil", "juntos", "torreta"],
    texto: "Una rejilla de cinco lamas en cada costado, bajo la defensa: la toma de aire del motor.",
    nota: "Para qué es no está publicado; por la forma, ventilación.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });
const aUnidadesSola = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.contorno && { contorno: q.contorno.map((t) => t.map(u2)) }) })) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "codo":
      return { ...p, puntos: p.puntos.map((q) => q.map(u) as typeof q) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aUnidades = (p: Pieza): Pieza => ({ ...aUnidadesSola(p), ...(p.girar && { girar: { ...p.girar, centro: u3(p.girar.centro) } }), ...(p.girarLuego && { girarLuego: { ...p.girarLuego, centro: u3(p.girarLuego.centro) } }) });

const maqueta: Maqueta = {
  nombre: "Magura V7",
  vista3d: [78, 25],
  subtitulo: "Dron naval",
  escala: ESCALA,
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("UA"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "v5-v7-militarnyi-frente.jpg", titulo: "El V7 de perfil, detrás del V5, en la presentación del GUR (mayo de 2025)", medio: "Militarnyi (vía Euromaidan Press)", url: EUROMAIDAN },
    { id: "juntos", imagen: "v7-v5-militarnyi-juntos.jpg", titulo: "El V7 y el V5 en la presentación; el V7, de costado por delante", medio: "Militarnyi (vía Euromaidan Press)", url: EUROMAIDAN },
    { id: "popa", imagen: "v7-militarnyi-popa.jpg", titulo: "El V7 por detrás: espejo de popa y los dos AIM-9 con la tapa roja", medio: "Militarnyi", url: "https://militarnyi.com/wp-content/uploads/2025/05/Bez-imeni-16aa-1-scaled.jpg" },
    { id: "torreta", imagen: "v7-militarnyi-torreta.jpg", titulo: "El V7 con un módulo de ametralladora en vez de misiles", medio: "Militarnyi", url: "https://militarnyi.com/wp-content/uploads/2025/05/Bez-imeni-14-1-scaled.jpg" },
    { id: "railes", imagen: "v7-twz-railes.jpg", titulo: "Los dos AIM-9 sobre sus raíles, la torreta y las rejillas del costado", medio: "GUR (vía The War Zone)", url: TWZ },
    { id: "detalle", imagen: "v7-twz-aim9-detalle.jpg", titulo: "Un AIM-9 y su lanzador, de cerca", medio: "GUR (vía The War Zone)", url: TWZ },
    { id: "camara", imagen: "v7-twz-camara.jpg", titulo: "La torreta de cámaras y la placa de delante", medio: "GUR (vía The War Zone)", url: TWZ },
    { id: "proa", imagen: "v7-twz-vista-nueva.jpg", titulo: "El V7 desde la proa: la caja de cámaras, la caseta y los misiles", medio: "GUR (vía The War Zone)", url: TWZ },
    { id: "navalnews", titulo: "First Image Of Ukraine's Sidewinder-Armed Magura V7 Surface Drone", medio: "Naval News", url: "https://www.navalnews.com/naval-news/2025/05/first-image-of-ukraines-sidewinder-armed-magura-v7-surface-drone/" },
    { id: "ukrinform", titulo: "HUR unveils Magura V7 naval drone in Kyiv", medio: "Ukrinform", url: "https://ukrinform.net/rubric-defense/3993194-hur-unveils-magura-v7-naval-drone-in-kyiv.html" },
  ],
};

export default maqueta;
