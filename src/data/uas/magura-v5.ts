// Maqueta del Magura V5 de Uforce: lancha dron de caras planas. Una caseta
// central con el techo plano y una cara inclinada delante, que en popa baja en
// rampa y acaba en un castillo; a los lados, el costado de la caseta en dos
// caras, una franja de borda con la defensa de goma negra, el costado casi
// vertical y el fondo en V.
// Medidas del fabricante (5,5 m de largo, 1,5 m de manga); la forma, de las
// dos fotos de la presentación de mayo de 2025 (Militarnyi, a 2560 px)
// encajadas a la vez con sus cámaras (arte/uas-fuentes/magura-v5-v7/hd/rec/,
// fuera de Git; tabla en docs/drones/magura-v5-v7.md). La disposición de las
// caras, también de la maqueta del V5 de DSEI 2023.
// Todo en metros (y = 0 cerca de la línea de flotación); al
// final, a unidades de la maqueta (1 unidad = 2,5 m).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.5;

const EUROMAIDAN = "https://euromaidanpress.com/2025/05/15/ukraine-unveils-new-magura-v7-naval-drone-used-to-shoot-down-two-russian-su-30-jets/";

// La defensa: su medio ancho (x), medido a lo largo en la foto de tres
// cuartos (abajo, DEFENSA_X), y la altura de su eje (y), en la de perfil: va unos 11 cm por
// debajo de la arista larga, así que baja hacia proa, y en la punta sube por
// la roda.
// En planta, una cuña uniforme de la punta a la manga (z −1,4): el medio
// ancho, 0,74 · (1 − t^1,6), con t de 0 en la manga a 1 en la punta (encaja
// las medidas de la foto de tres cuartos).
const DEFENSA_X: [number, number][] = [...Array.from({ length: 21 }, (_, i): [number, number] => { const z = 2.75 - (i * 4.15) / 20; return [z, 0.74 * (1 - Math.max(0, (z + 1.4) / 4.15) ** 1.6)]; }), [-2.75, 0.74]];
const DEFENSA_Y: [number, number][] = [[2.75, 0.17], [2.56, 0.15], [2.4, 0.135], [2.2, 0.118], [1.9, 0.124], [1.55, 0.129], [1.1, 0.144], [0.43, 0.168], [0.12, 0.176], [-0.5, 0.186], [-1.4, 0.193], [-2.75, 0.19]];
const aTrozos = (t: [number, number][], z: number) => {
  for (let i = 0; i < t.length - 1; i++) {
    const [z0, v0] = t[i], [z1, v1] = t[i + 1];
    if (z <= z0 && z >= z1) return v0 + ((v1 - v0) * (z - z0)) / (z1 - z0);
  }
  return t[t.length - 1][1];
};
const defensaY = (z: number) => aTrozos(DEFENSA_Y, z);

// Secciones, de proa a popa, con arista viva entre sus caras: la cubierta o
// el techo (del eje al borde de la caseta, C4); el costado de la caseta, en
// dos caras: una tendida hasta la arista B, que sigue a lo largo la del borde
// de la cubierta de proa, y otra más empinada hasta la arista larga (C2) o el
// hombro de popa; el hombro y su chaflán (solo en popa); la franja de borda
// (de C2 a bajo la defensa, que va pegada); el costado (hasta el pantoque);
// una franja estrecha bajo el pantoque, y el fondo hasta la quilla. [z, alto
// de la cubierta en el eje, medio ancho y alto de C4, de B, alto de C2, medio
// ancho y alto del pantoque, alto de la quilla]; a proa de la caseta, C4 y B
// son la misma (el borde de la cubierta). C2 va 2 cm por dentro del casco
// bajo la defensa, y este, 1,5 cm por dentro del eje de la defensa. A lo
// largo, el casco es liso; dobla con arista solo en los QUIEBRES: al pie y en
// lo alto de la cara inclinada de delante de la caseta, donde empieza la
// rampa del techo y donde empieza el castillo de popa.
// C2, el pantoque y la quilla, calcados en la foto de perfil: la franja de
// borda, unos 10 cm de alto a todo lo largo; el pantoque baja hasta la mitad
// de popa y sube un poco al final, y la quilla es honda (0,41) y sube en popa.
const MEDIDAS: [number, number, number, number, number, number, number, number, number, number][] = [
  [2.75, 0.205, 0, 0.205, 0, 0.205, 0.205, 0, 0.11, 0.1],
  [2.66, 0.21, 0.008, 0.209, 0.008, 0.209, 0.2, 0.015, 0.06, -0.03],
  [2.56, 0.215, 0.02, 0.212, 0.02, 0.212, 0.205, 0.035, 0.01, -0.08],
  [2.26, 0.24, 0.075, 0.236, 0.075, 0.236, 0.226, 0.1, -0.025, -0.23],
  [1.9, 0.285, 0.16, 0.278, 0.16, 0.278, 0.238, 0.17, -0.045, -0.35],
  [1.55, 0.32, 0.237, 0.312, 0.237, 0.312, 0.243, 0.25, -0.07, -0.4],
  [1.1, 0.345, 0.34, 0.34, 0.34, 0.34, 0.258, 0.36, -0.09, -0.41],
  [0.43, 0.372, 0.41, 0.372, 0.41, 0.372, 0.282, 0.48, -0.148, -0.405],
  // La cara inclinada de delante de la caseta, de 0,39 a 0,55: abajo, tan
  // ancha como la escotilla; arriba, estrecha (0,25), así que su arista con
  // el costado sube en diagonal hacia dentro. Detrás, el techo se ensancha
  // hasta 0,45.
  [0.12, 0.392, 0.46, 0.4, 0.46, 0.4, 0.29, 0.54, -0.165, -0.4],
  [-0.05, 0.55, 0.25, 0.55, 0.52, 0.4, 0.294, 0.57, -0.17, -0.395],
  [-0.5, 0.55, 0.42, 0.55, 0.6, 0.4, 0.3, 0.62, -0.183, -0.37],
  // Techo plano hasta donde acaba la primera Starlink (z −1,04) y, desde
  // ahí, rampa hasta la popa, más empinada al principio.
  [-1.04, 0.55, 0.45, 0.55, 0.645, 0.4, 0.305, 0.67, -0.19, -0.345],
  [-1.5, 0.47, 0.45, 0.47, 0.66, 0.39, 0.307, 0.69, -0.18, -0.32],
  [-1.95, 0.415, 0.44, 0.415, 0.66, 0.375, 0.307, 0.69, -0.165, -0.29],
  // El castillo de popa de las fotos desde detrás, en el último medio metro:
  // la caseta sigue hasta el espejo como un cuerpo central (medio ancho
  // 0,30) y su cara tendida se tuerce en una aleta casi vertical; a los
  // lados nacen dos hombros bajos (HOMBROS), en triángulo, con la esquina de
  // fuera achaflanada.
  [-2.25, 0.39, 0.44, 0.39, 0.66, 0.36, 0.307, 0.69, -0.145, -0.27],
  [-2.75, 0.37, 0.3, 0.37, 0.32, 0.31, 0.295, 0.69, -0.11, -0.24],
];
const QUIEBRES = [0.12, -0.05, -1.04, -2.25];
// Hombros de popa: [z, medio ancho de su borde de fuera]. Van a la altura de
// B, que ahí es el pie del cuerpo central.
const HOMBROS: [number, number][] = [[-2.75, 0.66]];
const SECCIONES: Seccion[] = MEDIDAS.map(([z, yE, x4, y4, xB, yB, y2, xK, yK, yQ]) => {
  const xG = Math.max(0, aTrozos(DEFENSA_X, z) - 0.015), x2 = Math.max(0, xG - 0.02), yG = defensaY(z) - 0.008;
  // Sin hombro, la cara empinada llega a C2 y el hombro no tiene ancho.
  const h = HOMBROS.find(([zz]) => zz === z);
  const [xH, yH, xS] = h ? [xB, yB, h[1]] : [x2, y2, x2];
  // La franja de bajo el pantoque, más estrecha hacia proa.
  const xF = xK * (1 - 0.07), yF = yK - 0.035 * Math.min(1, xK / 0.5);
  return {
    z, ancho: xG, arriba: yE, abajo: yQ,
    ...(QUIEBRES.includes(z) && { quiebre: true }),
    contorno: [
      [[0, yE], [x4, y4]],
      [[x4, y4], [xB, yB]],
      [[xB, yB], [xH, yH]],
      [[xH, yH], [xS, yH]],
      [[xS, yH], [x2, y2]],
      [[x2, y2], [xG, yG]],
      [[xG, yG], [xK, yK]],
      [[xK, yK], [xF, yF]],
      [[xF, yF], [0, yQ]],
    ],
  };
});

// Alto de la cubierta en el eje a una z (sobre ella van las piezas).
const cubierta = (z: number) => aTrozos(MEDIDAS.map(([zz, yE]) => [zz, yE]), z);

// Defensa de goma: un perfil fino pegado a la borda, de una pieza: de la
// popa a la punta por babor, sube un poco por la roda y vuelve por estribor;
// y otro a lo ancho del espejo de popa.
const DEFENSA_LADO: [number, number, number, number, number][] = DEFENSA_X.filter(([z]) => z < 2.7).map(([z, x]) => [x - 0.006, defensaY(z), z, 0.01, 0.014]);
DEFENSA_LADO[DEFENSA_LADO.length - 1][2] = -2.77;
DEFENSA_LADO.unshift([0.012, 0.185, 2.74, 0.01, 0.014]);
const DEFENSA: [number, number, number, number, number][] = [
  ...DEFENSA_LADO.slice().reverse(),
  [0, 0.19, 2.762, 0.01, 0.014],
  ...DEFENSA_LADO.map(([x, y, z, rx, ry]): [number, number, number, number, number] => [-x, y, z, rx, ry]),
];

// Torreta de las cámaras (día y térmica), calcada en las dos fotos de la
// presentación: base en campana con ranuras abajo, dos aros, y la cabeza,
// un cilindro con la cúpula redonda; delante, un marco ovalado en relieve con
// las dos ópticas una sobre otra (la térmica, arriba, toda negra; la de día,
// con aro claro). 35 cm de alto.
const TORRETA_Z = -0.31;
const T = cubierta(TORRETA_Z);
const R_CABEZA = 0.096;
// Ventana: rectángulo de esquinas redondas, de frente (en [x, y]).
const ventana = (w: number, h: number, r: number, y0: number): [number, number][] => {
  const p: [number, number][] = [];
  for (const [cx, cy, a0] of [[w - r, h - r, 0], [-w + r, h - r, 90], [-w + r, -h + r, 180], [w - r, -h + r, 270]] as const)
    for (let k = 0; k <= 4; k++) { const a = ((a0 + k * 22.5) * Math.PI) / 180; p.push([cx + r * Math.cos(a), y0 + cy + r * Math.sin(a)]); }
  return p;
};
// Óptica: aro y cristal, mirando a proa.
const optica = (id: string, x: number, y: number, z: number, r: number, aro: number, acabadoAro: "negro" | "aluminio"): Pieza[] => [
  { tipo: "disco", id: `${id}-aro`, en: [x, y, z], normal: [0, 0, 1], radio: aro, grosor: 0.006, acabado: acabadoAro },
  { tipo: "disco", id, en: [x, y, z + 0.002], normal: [0, 0, 1], radio: r, grosor: 0.006, acabado: "lente" },
];
const TORRETA: Pieza[] = [
  { tipo: "disco", id: "torreta-placa", en: [0, T + 0.003, TORRETA_Z], normal: [0, 1, 0], radio: 0.14, grosor: 0.006, acabado: "gris-mg" },
  ...Array.from({ length: 6 }, (_, i): Pieza => { const a = (i / 6) * Math.PI * 2 + 0.5; return { tipo: "disco", id: `torreta-tornillo-${i}`, en: [0.128 * Math.cos(a), T + 0.007, TORRETA_Z + 0.128 * Math.sin(a)], normal: [0, 1, 0], radio: 0.006, grosor: 0.004, acabado: "aluminio" }; }),
  { tipo: "codo", id: "torreta", acabado: "gris-mg", puntos: [
    [0, T + 0.004, TORRETA_Z, 0.118, 0.118], [0, T + 0.02, TORRETA_Z, 0.115, 0.115], [0, T + 0.045, TORRETA_Z, 0.109, 0.109], [0, T + 0.069, TORRETA_Z, 0.104, 0.104],
    [0, T + 0.072, TORRETA_Z, 0.1, 0.1], [0, T + 0.075, TORRETA_Z, 0.103, 0.103], [0, T + 0.092, TORRETA_Z, 0.103, 0.103],
    [0, T + 0.095, TORRETA_Z, 0.099, 0.099], [0, T + 0.098, TORRETA_Z, 0.102, 0.102], [0, T + 0.118, TORRETA_Z, 0.102, 0.102],
    [0, T + 0.122, TORRETA_Z, R_CABEZA, R_CABEZA],
  ] },
  // Ranuras de la campana, alrededor del pie.
  ...Array.from({ length: 10 }, (_, i): Pieza => { const a = (i / 10) * Math.PI * 2 + 0.3, r = 0.113; return { tipo: "caja", id: `torreta-ranura-${i}`, centro: [r * Math.sin(a), T + 0.016, TORRETA_Z + r * Math.cos(a)], tam: [0.005, 0.016, 0.004], acabado: "gris-fu2", girar: { centro: [r * Math.sin(a), T + 0.016, TORRETA_Z + r * Math.cos(a)], eje: "y", grados: (a * 180) / Math.PI } }; }),
  { tipo: "codo", id: "cabeza", acabado: "gris-mg", puntos: [
    [0, T + 0.122, TORRETA_Z, R_CABEZA, R_CABEZA], [0, T + 0.26, TORRETA_Z, R_CABEZA, R_CABEZA], [0, T + 0.295, TORRETA_Z, 0.09, 0.09],
    [0, T + 0.322, TORRETA_Z, 0.075, 0.075], [0, T + 0.34, TORRETA_Z, 0.05, 0.05], [0, T + 0.35, TORRETA_Z, 0, 0],
  ] },
  // El marco ovalado (7,5 x 13 cm) y, dentro, la placa oscura de las ópticas.
  { tipo: "prisma", id: "ventana", eje: "z", acabado: "gris-mg", planta: ventana(0.0375, 0.065, 0.0365, T + 0.26), y: TORRETA_Z + 0.05, alto: 0.056 },
  { tipo: "prisma", id: "ventana-placa", eje: "z", acabado: "gris-fu2", planta: ventana(0.029, 0.056, 0.028, T + 0.26), y: TORRETA_Z + 0.05, alto: 0.059 },
  ...optica("optica-ir", 0, T + 0.29, TORRETA_Z + 0.109, 0.016, 0.022, "negro"),
  ...optica("optica-dia", 0, T + 0.228, TORRETA_Z + 0.109, 0.012, 0.02, "aluminio"),
];

// Cornamusa en T, negra: dos patas y, encima, una barra a lo largo con las
// puntas afinadas; una a cada lado. `y`, la superficie bajo ella.
const cornamusa = (id: string, x: number, y: number, z: number): Pieza[] => [1, -1].flatMap((s): Pieza[] => [
  ...[1, -1].map((j): Pieza => ({ tipo: "caja", id: `${id}-pata-${s}-${j}`, centro: [s * x, y + 0.012, z + j * 0.028], tam: [0.016, 0.026, 0.018], acabado: "negro" })),
  { tipo: "tubo", id: `${id}-${s}`, centro: [s * x, y + 0.029], seccion: [1, 0.75], perfil: [[z + 0.075, 0.003], [z + 0.068, 0.007], [z + 0.05, 0.009], [z + 0.025, 0.007], [z - 0.025, 0.007], [z - 0.05, 0.009], [z - 0.068, 0.007], [z - 0.075, 0.003]], acabado: "negro" },
]);

// Tapas de la cubierta, en relieve y con las esquinas redondas: cada Starlink
// va atornillada encima de una (se ven en las fotos del GUR desde arriba y en
// las del río). `y`, la cubierta bajo su centro; `grados`, su caída.
const tapa = (id: string, z: number, largo: number, ancho: number, y: number, grados = 0): Pieza => ({ tipo: "caja", id, centro: [0, y + 0.009, z], tam: [ancho, 0.018, largo], redondeo: 0.07, acabado: "gris-mg", ...(grados && { girar: { centro: [0, y, z], eje: "x", grados } }) });

// Antenas Starlink planas (0,51 x 0,59) sobre un pie bajo, encima de su tapa:
// la primera, plana, detrás de la torreta; la segunda, sobre la rampa del
// techo, con su caída.
const caida = (z: number) => (-Math.atan2(cubierta(z + 0.3) - cubierta(z - 0.3), 0.6) * 180) / Math.PI;
const SL1_Z = -0.745, SL1_Y = cubierta(SL1_Z) + 0.018;
const SL2_Z = -1.555, SL2_Y = cubierta(SL2_Z) + 0.018, RAMPA = caida(SL2_Z);
const TAPA2_Z = -1.62;
// La escotilla grande de la cubierta de proa, delante de la caseta.
const ESCOTILLA_Z = 0.505;

// Caja de cámaras de la proa, calcada en las dos fotos: gris clara, con el
// frente plano y el techo redondeado, una óptica grande y otra pequeña lado a
// lado; va sobre una placa negra gruesa con las esquinas de proa cortadas.
// Frente de techo redondo: abajo, recto; arriba, las esquinas de radio r.
const arco = (w: number, y0: number, y1: number, r: number): [number, number][] => [
  [w, y0],
  ...Array.from({ length: 5 }, (_, k): [number, number] => { const a = (k * Math.PI) / 8; return [w - r + r * Math.cos(a), y1 - r + r * Math.sin(a)]; }),
  ...Array.from({ length: 5 }, (_, k): [number, number] => { const a = Math.PI / 2 + (k * Math.PI) / 8; return [-w + r + r * Math.cos(a), y1 - r + r * Math.sin(a)]; }),
  [-w, y0],
];
const CAJA_Z = 1.59, CY = cubierta(CAJA_Z);
const CAJA: Pieza[] = [
  { tipo: "prisma", id: "caja-placa", acabado: "negro", y: CY - 0.004, alto: 0.022, planta: [[-0.07, CAJA_Z - 0.095], [0.07, CAJA_Z - 0.095], [0.07, CAJA_Z + 0.075], [0.05, CAJA_Z + 0.095], [-0.05, CAJA_Z + 0.095], [-0.07, CAJA_Z + 0.075]] },
  { tipo: "prisma", id: "caja-camaras", eje: "z", acabado: "gris-qs", y: CAJA_Z - 0.085, alto: 0.165, planta: arco(0.0575, CY + 0.018, CY + 0.086, 0.026) },
  ...optica("caja-optica", -0.028, CY + 0.046, CAJA_Z + 0.08, 0.012, 0.018, "negro"),
  ...optica("caja-optica-2", 0.025, CY + 0.046, CAJA_Z + 0.08, 0.007, 0.011, "negro"),
];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "casco", secciones: SECCIONES, facetas: true, tapaPlana: true, acabado: "gris-mg" },
  { tipo: "codo", id: "defensa", puntos: DEFENSA, acabado: "negro" },
  { tipo: "varilla", id: "defensa-popa", desde: [-0.74, defensaY(-2.75), -2.765], hasta: [0.74, defensaY(-2.75), -2.765], radio: 0.012, acabado: "negro" },
  ...TORRETA,
  tapa("tapa-escotilla", ESCOTILLA_Z, 0.75, 0.72, cubierta(ESCOTILLA_Z), caida(ESCOTILLA_Z)),
  tapa("tapa-starlink", SL1_Z, 0.66, 0.66, cubierta(SL1_Z)),
  tapa("tapa-starlink-2", TAPA2_Z, 0.8, 0.68, cubierta(TAPA2_Z), caida(TAPA2_Z)),
  { tipo: "caja", id: "starlink-pie", centro: [0, SL1_Y + 0.015, SL1_Z], tam: [0.42, 0.03, 0.5], acabado: "negro" },
  { tipo: "caja", id: "starlink", centro: [0, SL1_Y + 0.05, SL1_Z], tam: [0.51, 0.04, 0.59], redondeo: 0.02, acabado: "gris-qs" },
  { tipo: "caja", id: "starlink-2-pie", centro: [0, SL2_Y + 0.015, SL2_Z], tam: [0.42, 0.03, 0.5], acabado: "negro", girar: { centro: [0, SL2_Y, SL2_Z], eje: "x", grados: RAMPA } },
  { tipo: "caja", id: "starlink-2", centro: [0, SL2_Y + 0.05, SL2_Z], tam: [0.51, 0.04, 0.59], redondeo: 0.02, acabado: "gris-qs", girar: { centro: [0, SL2_Y, SL2_Z], eje: "x", grados: RAMPA } },
  ...CAJA,
  // Cornamusas, medidas en las dos fotos: un par a proa, junto a la caja; otro
  // a los lados de la escotilla; otro en el borde de la rampa y otro en los
  // hombros de popa.
  ...cornamusa("cornamusa-proa", 0.19, 0.278, 1.78),
  ...cornamusa("cornamusa", 0.4, 0.372, 0.515),
  ...cornamusa("cornamusa-rampa", 0.47, cubierta(-1.39) - 0.006, -1.39),
  ...cornamusa("cornamusa-popa", 0.47, 0.31, -2.66),
  // Cúpula negra pequeña en el costado de la caseta, a babor de la torreta,
  // sobre un aro gris.
  { tipo: "codo", id: "cupula-aro", acabado: "gris-fu2", puntos: [[0.374, 0.455, -0.151, 0.052, 0.052], [0.374, 0.47, -0.151, 0.052, 0.052]] },
  { tipo: "codo", id: "cupula", acabado: "negro", puntos: [[0.374, 0.468, -0.151, 0.044, 0.044], [0.374, 0.49, -0.151, 0.04, 0.04], [0.374, 0.505, -0.151, 0.026, 0.026], [0.374, 0.51, -0.151, 0, 0]] },
  // Caja gris de popa, en la rampa y en el eje, como la de proa sin ópticas.
  { tipo: "caja", id: "caja-popa-placa", centro: [0, cubierta(-2.36) + 0.006, -2.36], tam: [0.12, 0.012, 0.16], acabado: "negro" },
  { tipo: "caja", id: "caja-popa", centro: [0, cubierta(-2.36) + 0.046, -2.36], tam: [0.105, 0.068, 0.15], redondeo: 0.03, acabado: "gris-qs" },
  // El espejo de popa: dos ventiladores cuadrados con su rejilla redonda en el
  // cuerpo central, tres tornillos debajo y, bajo la defensa, dos salidas
  // ovaladas y dos herrajes pequeños.
  ...[1, -1].flatMap((s): Pieza[] => [
    { tipo: "caja", id: `ventilador-${s}`, centro: [s * 0.21, 0.318, -2.752], tam: [0.072, 0.072, 0.008], acabado: "negro" },
    { tipo: "disco", id: `ventilador-rejilla-${s}`, en: [s * 0.21, 0.318, -2.757], normal: [0, 0, -1], radio: 0.03, grosor: 0.003, acabado: "gris-fu2" },
    { tipo: "disco", id: `salida-${s}`, en: [s * 0.25, 0.07, -2.752], normal: [0, 0, -1], radio: 0.026, grosor: 0.006, acabado: "negro" },
    { tipo: "caja", id: `herraje-${s}`, centro: [s * 0.6, 0.09, -2.753], tam: [0.045, 0.016, 0.008], acabado: "aluminio" },
  ]),
  ...[-0.2, 0, 0.2].map((x, i): Pieza => ({ tipo: "disco", id: `tornillo-popa-${i}`, en: [x, 0.235, -2.752], normal: [0, 0, -1], radio: 0.009, grosor: 0.004, acabado: "negro" })),
];

// Juntas de las tapas de la cubierta: la redonda de la proa, la redonda de
// encima de la escotilla y los tornillos de las tapas en relieve.
const circulo = (z: number, r: number): [number, number, number][] => Array.from({ length: 25 }, (_, i) => [r * Math.cos((i / 24) * Math.PI * 2), 0.9, z + r * Math.sin((i / 24) * Math.PI * 2)]);
const COSTURAS: Costura[] = [
  { sobre: ["casco"], desde: [0, 1, 0], puntos: circulo(2.14, 0.13) },
  { sobre: ["tapa-escotilla"], desde: [0, 1, 0], puntos: circulo(0.35, 0.1) },
  // Tornillos alrededor de las tapas de la escotilla y de las Starlink.
  ...([["tapa-escotilla", ESCOTILLA_Z, 0.34, 0.32], ["tapa-starlink", SL1_Z, 0.29, 0.29], ["tapa-starlink-2", TAPA2_Z, 0.36, 0.3]] as const).map(([id, z, l, w]): Costura => ({ sobre: [id], desde: [0, 1, 0], puntos: [[-w, 0.9, z - l], [w, 0.9, z - l], [w, 0.9, z + l], [-w, 0.9, z + l], [-w, 0.9, z - l]], remaches: 0.1 })),
];

// «UFORCE MAGURA» en blanco en los dos costados (src/data/uas/logos.ts),
// medido en el perfil: de z −0,21 a −1,08 y de y 0,14 a −0,07. Una calca en
// cada costado, para que se lea al derecho en los dos.
const BLANCO_LOGO = "#e6e8e8";
const CALCAS: Calca[] = [
  ...[1, -1].map((s): Calca => ({ sobre: ["casco"], en: [s * 0.72, 0.035, -0.645], desde: [s, 0, 0], tam: [0.87, 0.21], dibujo: { tipo: "logo", logo: "magura", color: BLANCO_LOGO } })),
  // El emblema del GUR en blanco en la cubierta de proa, detrás de la caja de
  // cámaras: el anillo, de 0,46 (medido en el perfil); con las alas, 0,51.
  // Las alas y «РОЗВІДКА» hacia popa (en el perfil, las letras salen a popa).
  { sobre: ["casco"], en: [0, 0.34, 1.22], desde: [0, 1, 0], tam: [0.51, 0.545], dibujo: { tipo: "logo", logo: "gur", color: BLANCO_LOGO } },
];

const PARTES: Parte[] = [
  {
    nombre: "Casco",
    en: [0.72, -0.02, -1.8],
    piezas: ["casco"],
    respaldo: "foto",
    fuentes: ["perfil", "juntos", "navalnews"],
    texto: "Lancha de planeo de 5,5 m de largo y 1,5 m de manga, de fibra de carbono y resina y toda de caras planas: una caseta central con el techo plano que en popa baja en rampa, chaflanes hasta la borda, el costado casi vertical y el fondo en V. Asoma solo medio metro sobre el agua. Dentro van el motor de gasolina y los 320 kg de explosivo.",
    nota: "La forma, de la foto de perfil y la de tres cuartos de la presentación de mayo de 2025, encajadas a la vez; las medidas, del fabricante. La quilla y el fondo, que en las fotos casi no se ven, son aproximados, y la línea de flotación es supuesta.",
  },
  {
    nombre: "Defensa",
    en: [0.62, defensaY(0.2), 0.2],
    piezas: ["defensa", "defensa-popa"],
    respaldo: "foto",
    fuentes: ["perfil", "juntos"],
    texto: "Defensa de goma negra a lo largo de toda la borda, de la proa al espejo de popa.",
  },
  {
    nombre: "Torreta de cámaras",
    en: [0, T + 0.3, TORRETA_Z + 0.1],
    piezas: TORRETA.map((p) => p.id),
    respaldo: "foto",
    fuentes: ["perfil", "juntos", "marina"],
    texto: "Torreta giratoria con una cámara de día y una térmica, una sobre otra: con ellas el operador guía el dron en el último tramo, hasta el blanco.",
    nota: "35 cm de alto, medida en la foto de perfil.",
  },
  {
    nombre: "Antenas Starlink",
    en: [0.25, 0.62, -0.75],
    piezas: ["starlink", "starlink-pie", "starlink-2", "starlink-2-pie", "tapa-starlink", "tapa-starlink-2"],
    respaldo: "foto",
    fuentes: ["perfil", "juntos", "kyivpost"],
    texto: "Dos antenas planas de Starlink detrás de la torreta, cada una atornillada sobre una tapa de la cubierta, la segunda en la rampa del techo: el dron se maneja desde tierra por satélite.",
    nota: "Reconocidas por su tamaño, el de la Starlink plana de alto rendimiento (0,58 x 0,51 m).",
  },
  {
    nombre: "Cámaras de proa",
    en: [0.04, cubierta(1.59) + 0.07, 1.59],
    piezas: CAJA.map((p) => p.id),
    respaldo: "foto",
    fuentes: ["juntos", "perfil"],
    texto: "Una caja gris clara sobre una placa negra, con dos ópticas mirando adelante, una grande y otra pequeña. Detrás de la caja, el emblema de la inteligencia militar ucraniana (GUR), pintado en blanco.",
    nota: "Qué hace cada una no está publicado.",
  },
  {
    nombre: "Cornamusas",
    en: [0.47, 0.33, -2.55],
    piezas: PIEZAS.map((p) => p.id).filter((id) => id.startsWith("cornamusa")),
    respaldo: "foto",
    fuentes: ["perfil", "juntos"],
    texto: "Cornamusas de amarre en forma de T, por pares: junto a la caja de proa, a los lados de la escotilla, en el borde de la rampa y en los hombros de popa. Las tapas de la cubierta dan al motor y a la carga.",
  },
  {
    nombre: "Cúpula y caja de popa",
    en: [0.374, 0.53, -0.151],
    piezas: ["cupula", "cupula-aro", "caja-popa", "caja-popa-placa"],
    respaldo: "foto",
    fuentes: ["perfil", "juntos"],
    texto: "Una cúpula negra pequeña junto a la torreta y una caja gris en la rampa de popa, como la de proa pero sin ópticas.",
    nota: "Qué son no está publicado; por la forma, antenas.",
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
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aUnidades = (p: Pieza): Pieza => ({ ...aUnidadesSola(p), ...(p.girar && { girar: { ...p.girar, centro: u3(p.girar.centro) } }), ...(p.girarLuego && { girarLuego: { ...p.girarLuego, centro: u3(p.girarLuego.centro) } }) });

const maqueta: Maqueta = {
  nombre: "Magura V5",
  vista3d: [78, 25],
  subtitulo: "Dron naval de ataque USV",
  escala: ESCALA,
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("UA"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "v5-v7-militarnyi-frente.jpg", titulo: "El V5 de perfil, delante del V7, en la presentación del GUR (mayo de 2025)", medio: "Militarnyi (vía Euromaidan Press)", url: EUROMAIDAN },
    { id: "juntos", imagen: "v7-v5-militarnyi-juntos.jpg", titulo: "El V7 y el V5 en la presentación; el V5, de tres cuartos por delante", medio: "Militarnyi (vía Euromaidan Press)", url: EUROMAIDAN },
    { id: "marina", imagen: "v5-militarnyi-marina.jpg", titulo: "Un V5 en el agua, de una versión anterior, con la torreta y una antena ovalada a popa", medio: "Militarnyi", url: "https://militarnyi.com/wp-content/uploads/2024/03/MAGURA_V5.jpg" },
    { id: "gur", imagen: "v5-gur-flota.jpg", titulo: "Una fila de V5 desde arriba, con las tapas quitadas", medio: "GUR (vía Euromaidan Press)", url: "https://euromaidanpress.com/wp-content/uploads/2024/03/20231222-3.jpg" },
    { id: "crimea", imagen: "v5-crimea-capturado.jpg", titulo: "Un V5 varado en Crimea", medio: "dva mayora (vía mil.in.ua)", url: "https://euromaidanpress.com/wp-content/uploads/2024/03/photo_2023-11-22_18-11-57-e1700728320624-1.jpg" },
    { id: "lanzamiento", imagen: "v5-lanzamiento-cpd.jpg", titulo: "Un V5 saliendo al mar, por detrás", medio: "cpd.gov.ua (vía Euromaidan Press)", url: "https://euromaidanpress.com/wp-content/uploads/2024/03/img_7118.jpeg" },
    { id: "navalnews", titulo: "Ukraine's Magura V5 USV on the stage at DSEI 2023", medio: "Naval News", url: "https://www.navalnews.com/?p=49232" },
    { id: "kyivpost", titulo: "Analysis: The Magura-V5 Sea Drone – Scourge of Russia's Black Sea Operations", medio: "Kyiv Post", url: "https://www.kyivpost.com/post/29068" },
    { id: "wikipedia", titulo: "MAGURA V5", medio: "Wikipedia", url: "https://en.wikipedia.org/wiki/MAGURA_V5" },
  ],
};

export default maqueta;
