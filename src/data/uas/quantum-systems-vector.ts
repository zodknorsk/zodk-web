// Maqueta del Vector AI de Quantum Systems, versión 2.0 (docs/nuevodron.md),
// con la cámara giratoria Raptor-360, la que compró el Ejército de Tierra. Las
// marcas, las de un Vector AI de fábrica. La forma, de fotos y vídeos del
// Vector AI español (Infodefensa TV, 2026), de uno en una feria en Ucrania
// (Militarnyi), de los folletos del fabricante y de un Vector rumano
// (arte/uas-fuentes/quantum-systems-vector/, fuera de Git; la lista en
// docs/drones/quantum-systems-vector.md).
// Medidas: 2,8 m de envergadura (folleto) y 1,6 m de largo. La web del
// Vector AI de Quantum Systems en EE. UU. da 4,9 pies (1,49 m), pero con dos
// fotos encajadas en el ala y la cola el morro queda 0,45 m por delante del
// ala: 1,6 m de punta a punta, lo que daba Quantum Systems para el Vector en
// 2023.
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

// ── Barquilla y tubo de cola ───────────────────────────────────────────────
// Una sola pieza: un huevo alargado que detrás se estrecha en un cono y sigue
// sin corte en el tubo de cola, hasta la deriva (fotos de la cola de
// Infodefensa y de Militarnyi). [z, medio ancho, lomo, panza]. De frente
// (vídeo del fabricante, casi sin perspectiva): 0,14 m de ancho y el lomo
// 5,5 cm sobre el ala. De lado (el mismo vídeo, a escala con la Raptor, que
// de frente baja hasta −0,18 m): la panza a −0,12 y el perfil del morro, una
// tapa ovalada con la punta baja, a la altura de la lente de la punta (de
// frente, 6,5 cm bajo el ala); desde arriba (vídeo del fabricante) se afina
// poco a poco: más alto que ancho.
// Detrás del ala, el lomo baja deprisa (vista de lado del fabricante) y la
// barquilla acaba en z = −0,32 m, donde empieza el tubo (junta y cúpula
// negra justo detrás: foto de Militarnyi en el suelo, encajada, y la de la
// cola de Infodefensa). De lado (Militarnyi en vuelo) la barquilla se afina
// en un cono recto y el tubo sigue esa línea casi sin bajar: la panza sube en
// recta desde detrás de la Raptor hasta la junta.
const TUBO = { z0: -0.33, y0: -0.033, r0: 0.0195, z1: -1.15, y1: -0.05, r1: 0.016 };
const tuboEn = (z: number) => {
  const u = (z - TUBO.z0) / (TUBO.z1 - TUBO.z0);
  return { y: TUBO.y0 + (TUBO.y1 - TUBO.y0) * u, r: TUBO.r0 + (TUBO.r1 - TUBO.r0) * u };
};
const BARQUILLA: Seccion[] = [
  ...([
    [0.45, 0, -0.066, -0.066],
    [0.445, 0.015, -0.046, -0.078],
    [0.437, 0.022, -0.033, -0.082],
    [0.422, 0.03, -0.013, -0.084],
    [0.398, 0.036, 0.01, -0.091],
    [0.374, 0.041, 0.024, -0.098],
    [0.348, 0.045, 0.035, -0.104],
    [0.308, 0.052, 0.046, -0.111],
    [0.255, 0.06, 0.054, -0.12],
    [0.2, 0.066, 0.056, -0.122],
    [0.1, 0.069, 0.056, -0.109],
    [0.0, 0.069, 0.055, -0.096],
    [-0.088, 0.062, 0.043, -0.084],
    [-0.177, 0.05, 0.022, -0.073],
    [-0.236, 0.039, 0.005, -0.065],
    [-0.29, 0.027, -0.008, -0.058],
    [-0.318, 0.021, -0.013, -0.054],
  ] as number[][]).map(([z, ancho, arriba, abajo]) => ({ z, ancho, arriba, abajo, cintura: (arriba + abajo) / 2 + 0.01, n: 2.3, nAbajo: 2 })),
  // El tubo: redondo, del grueso que deja el cono; acaba redondo detrás de
  // la deriva.
  ...([TUBO.z0, -0.5, -0.7, -0.9, -1.13, -1.145, -1.152] as number[]).map((z, i, zs) => {
    const { y, r } = tuboEn(z);
    const k = i === zs.length - 1 ? 0 : i === zs.length - 2 ? 0.6 : 1;
    return { z, ancho: r * k, arriba: y + r * k, abajo: y - r * k, cintura: y, n: 2, nAbajo: 2 };
  }),
];

// ── Ala ────────────────────────────────────────────────────────────────────
// Recta y sin diedro (vista de frente). La planta, medida en la foto desde
// abajo (Militarnyi, encajada): hasta las góndolas casi no se estrecha; desde
// ahí, los dos bordes se van juntando hasta una punta estrecha y redonda.
const ALA = { y: 0, semi: 1.4 };

// ── Rotores ────────────────────────────────────────────────────────────────
// Los tres, iguales y basculantes (Soldat & Technik): en la punta de su
// góndola, una carcasa gris oscura que gira sobre una bisagra lateral, con el
// motor negro de campana y el cono encima. Van en vertical, de despegue (como
// en casi todas las fotos). La unidad se escribe tumbada, mirando hacia
// delante, y se gira 90° sobre la bisagra: cambiando ese ángulo pasaría a
// vuelo de crucero. Medidas, de la foto de frente en vuelo del fabricante
// (contra el ancho de la carcasa) y de la vista de frente.
const ROTOR = { carcasaAtras: -0.035, carcasaDelante: 0.029, r: 0.032, campana: 0.066, rCampana: 0.023, cono: 0.1, rCono: 0.019, helice: 0.19 };
const rotor = (x: number, y: number, z: number, id: string, espejo = false): Pieza[] => {
  const girar = { centro: [x, y, z] as [number, number, number], eje: "x" as const, grados: -90 };
  const R = ROTOR;
  return [
    {
      // La carcasa, con el fondo redondo (abajo, en vertical).
      tipo: "tubo", id: `${id}-carcasa`, acabado: "negro", centro: [x, y], girar,
      perfil: [[z + R.carcasaAtras, 0], [z + R.carcasaAtras + 0.004, R.r * 0.62], [z + R.carcasaAtras + 0.012, R.r * 0.92], [z + R.carcasaAtras + 0.022, R.r], [z + R.carcasaDelante - 0.004, R.r], [z + R.carcasaDelante, R.r * 0.85], [z + R.carcasaDelante + 0.001, 0]],
    },
    {
      // La campana del motor y, encima, el cono.
      tipo: "tubo", id: `${id}-motor`, acabado: "negro-ua", centro: [x, y], girar,
      // El cono, una bala de punta redonda.
      perfil: [[z + R.carcasaDelante - 0.002, 0], [z + R.carcasaDelante - 0.001, R.rCampana], [z + R.campana - 0.004, R.rCampana], [z + R.campana, R.rCampana * 0.9], [z + R.campana + 0.002, R.rCono], [z + R.cono - 0.02, R.rCono * 0.92], [z + R.cono - 0.011, R.rCono * 0.72], [z + R.cono - 0.004, R.rCono * 0.42], [z + R.cono, 0]],
    },
    // La bisagra: un disco a cada lado de la carcasa.
    { tipo: "disco", id: `${id}-bisagra`, acabado: "negro", en: [x + R.r + 0.002, y, z], normal: [1, 0, 0], radio: 0.009, grosor: 0.004, girar },
    { tipo: "disco", id: `${id}-bisagra-2`, acabado: "negro", en: [x - R.r - 0.002, y, z], normal: [-1, 0, 0], radio: 0.009, grosor: 0.004, girar },
    // La hélice: dos palas anchas en la raíz que se afinan hacia la punta.
    {
      tipo: "helice", id: `${id}-helice`, acabado: "negro", en: [x, y + R.campana + 0.004, z], eje: "y", radio: R.helice, palas: 2, ancho: 0.034, buje: 0, giro: espejo ? 120 : 60,
      forma: [[0.04, 0.35, 0.35], [0.15, 0.5, 0.55], [0.35, 0.48, 0.5], [0.6, 0.38, 0.38], [0.85, 0.26, 0.24], [0.97, 0.15, 0.1], [1, 0.02, 0.0]],
    },
  ];
};

// Góndolas delanteras: un tubo blanco bajo el ala, de frente a ±0,63 m, que
// sale unos 13 cm por delante del borde de ataque hasta la bisagra; por
// detrás se mete bajo el ala.
const GONDOLA = { x: 0.63, y: -0.002, delante: 0.165, detras: -0.16, r: 0.026 };
const gondola = (x: number): Pieza => ({
  tipo: "casco", id: x > 0 ? "gondola-izq" : "gondola-der", acabado: "gris-qs", x,
  secciones: ([
    [GONDOLA.delante, GONDOLA.r * 0.9], [GONDOLA.delante - 0.03, GONDOLA.r], [0.0, GONDOLA.r], [-0.08, GONDOLA.r * 0.8], [GONDOLA.detras + 0.02, GONDOLA.r * 0.4], [GONDOLA.detras, 0],
  ] as number[][]).map(([z, a]) => ({ z, ancho: a, arriba: GONDOLA.y + a, abajo: GONDOLA.y - a * 1.1, cintura: GONDOLA.y, n: 2, nAbajo: 2 })),
});

// ── Estabilizador y deriva ─────────────────────────────────────────────────
// El estabilizador, una pala ovalada de 0,66 m apoyada encima del tubo (de
// frente y en las fotos de la cola; foto de Militarnyi en el suelo,
// encajada: el borde de ataque en la raíz a z = −0,71).
const ESTAB = { grosor: 0.012 };
const ESTAB_Y = tuboEn(-0.78).y + tuboEn(-0.78).r + ESTAB.grosor / 2 - 0.001;
const ESTAB_PLANTA: [number, number][] = Array.from({ length: 13 }, (_, i) => {
  const a = (i / 12) * Math.PI;
  return [0.33 * Math.sin(a), -0.79 + 0.078 * Math.cos(a)];
});
// La deriva sale del final del tubo hacia arriba, con la esquina de abajo
// detrás redonda y nada por debajo del tubo; arriba se dobla hacia delante
// en un codo redondo y sigue como góndola hasta la bisagra del rotor de cola.
// Una sola placa (fotos de Militarnyi en el suelo, de Infodefensa y del
// fabricante en vuelo). Alto de la vista de frente: la hélice de cola, a
// +0,145 m.
const DERIVA = { delante: -1.03, detras: -1.15, arriba: 0.158, brazo: 0.04, bisagra: -0.975, grosor: 0.018 };
const arco = (cz: number, cy: number, r: number, a0: number, a1: number, n = 6): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; });
const DERIVA_PLANTA = ((): [number, number][] => {
  const D = DERIVA, r1 = 0.03, r2 = 0.035, r3 = 0.012, r4 = 0.02;
  // Al final, el tubo: su centro y su panza; delante, lo alto del tubo.
  const yDetras = tuboEn(D.detras).y, panza = yDetras - tuboEn(D.detras).r + 0.002;
  const yDelante = tuboEn(D.delante).y, lomoTubo = yDelante + tuboEn(D.delante).r;
  return [
    // Por dentro del tubo, del borde de ataque hacia atrás, por la panza.
    [D.delante + r4, yDelante],
    [D.detras + r1, panza],
    // Esquina de abajo detrás, redonda.
    ...arco(D.detras + r1, panza + r1, r1, 270, 180),
    // Borde de salida y codo de arriba.
    ...arco(D.detras + r2, D.arriba - r2, r2, 180, 90),
    // El brazo, hasta la bisagra (dentro de la carcasa).
    [D.bisagra, D.arriba],
    [D.bisagra, D.arriba - D.brazo],
    // Bajo el brazo, hasta el borde de ataque, con un empalme cóncavo.
    ...arco(D.delante + r3, D.arriba - D.brazo - r3, r3, 90, 180, 4),
    // El borde de ataque baja hasta el tubo con otro.
    ...arco(D.delante + r4, lomoTubo + r4, r4, 180, 270, 4),
  ];
})();

// La Raptor-360: cuelga de la panza, bajo el final de la tapa del morro; una
// horquilla de dos brazos redondos, con la tapa del eje a cada lado, y entre
// ellos el cuerpo de la cámara, que sale por delante del eje: delante, el
// objetivo grande con su aro, que llena casi toda la cara, y debajo una
// barbilla oscura con tres lentes pequeñas en fila. De frente, 0,1 m de
// ancho y hasta −0,18 m (vista de frente del fabricante y foto de frente de
// Militarnyi en la feria); de lado, el eje 0,2 m por detrás de la punta del
// morro y la cara 0,14 m (vista de lado del fabricante y foto del fabricante en
// vuelo, encajada); la forma, de la foto del folleto.
const RAPTOR = { eje: 0.25, ejeY: -0.148, delante: 0.309, detras: 0.227, ancho: 0.1, brazo: 0.012, arriba: -0.106, abajo: -0.184 };
const RAPTOR_FRENTE = RAPTOR.delante;

// ── Mástil de la antena y disipador ────────────────────────────────────────
// Un poste negro recto hacia arriba con la cabeza redonda (fino de frente
// y ancho de lado) y, delante, un casquillo con una varilla de metal y
// la punta negra (foto del folleto; de lado, en el vídeo del fabricante, la
// varilla a unos +0,09 m y hasta encima de la tapa del morro).
const MASTIL = { z: 0.228, y: 0.094 };
// El disipador de aluminio encima del morro, delante del mástil: una base
// con aletas a lo largo (de frente, 5 cm de ancho y unas nueve aletas).
const DISIPADOR = { z0: 0.25, z1: 0.34, ancho: 0.056 };
const lomoEn = (z: number) => {
  const q = BARQUILLA.filter((s) => s.z <= 0.45 && s.z >= 0).sort((a, b) => a.z - b.z);
  for (let i = 0; i < q.length - 1; i++) if (z >= q[i].z && z <= q[i + 1].z) return q[i].arriba + ((q[i + 1].arriba - q[i].arriba) * (z - q[i].z)) / (q[i + 1].z - q[i].z);
  return q[0].arriba;
};
const PENDIENTE = (Math.atan2(lomoEn(DISIPADOR.z0) - lomoEn(DISIPADOR.z1), DISIPADOR.z1 - DISIPADOR.z0) * 180) / Math.PI;
const girarDisipador = { centro: [0, lomoEn(DISIPADOR.z0), DISIPADOR.z0] as [number, number, number], eje: "x" as const, grados: PENDIENTE };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "barquilla", acabado: "gris-qs", secciones: BARQUILLA, polo: true },
  {
    // Media ala: [x, borde de ataque, borde de salida, grosor].
    tipo: "ala", id: "ala", acabado: "gris-qs", y: ALA.y,
    estaciones: [
      [0, 0, -0.232, 0.026],
      [0.6, 0, -0.222, 0.024],
      [0.85, -0.011, -0.203, 0.021],
      [1.05, -0.019, -0.183, 0.018],
      [1.2, -0.033, -0.164, 0.015],
      [1.29, -0.047, -0.151, 0.012],
      [1.345, -0.064, -0.143, 0.01],
      [1.38, -0.088, -0.137, 0.007],
      [ALA.semi, -0.117, -0.132, 0.004],
    ],
  },
  gondola(GONDOLA.x),
  gondola(-GONDOLA.x),
  ...rotor(GONDOLA.x, GONDOLA.y, GONDOLA.delante + 0.01, "rotor-izq"),
  ...rotor(-GONDOLA.x, GONDOLA.y, GONDOLA.delante + 0.01, "rotor-der", true),
  { tipo: "placa", id: "estabilizador", acabado: "gris-qs", plano: "horizontal", y: ESTAB_Y, grosor: ESTAB.grosor, bisel: 0.005, simetrica: true, planta: ESTAB_PLANTA },
  { tipo: "placa", id: "deriva", acabado: "gris-qs", plano: "vertical", x: 0, grosor: DERIVA.grosor, bisel: 0.007, planta: DERIVA_PLANTA },
  ...rotor(0, DERIVA.arriba - DERIVA.brazo / 2, DERIVA.bisagra + 0.012, "rotor-cola"),

  // Las antenas negras (fotos de la cola de Infodefensa y de Militarnyi, y
  // del fabricante en vuelo): una cúpula alargada sobre el tubo, justo detrás
  // de la barquilla; delante del estabilizador, una antena alta y redonda
  // como un pulgar, sobre una abrazadera oscura que rodea el tubo; y debajo de
  // la barquilla, detrás del ala, otra que cuelga como un cilindro.
  {
    tipo: "tubo", id: "antena-cupula", acabado: "negro", centro: [0, tuboEn(-0.37).y + 0.012], seccion: [1, 1.7],
    perfil: [[-0.34, 0, 0.002], [-0.344, 0.009, 0.002], [-0.352, 0.0145, 0.001], [-0.37, 0.016, 0], [-0.39, 0.0135, -0.002], [-0.401, 0.0085, -0.003], [-0.406, 0, -0.003]],
  },
  {
    // La abrazadera del pie de la antena pulgar, de unos 7 cm.
    tipo: "tubo", id: "abrazadera", acabado: "negro", centro: [0, tuboEn(-0.645).y],
    perfil: [[-0.645, 0, 0], [-0.648, tuboEn(-0.645).r + 0.0025, 0], [-0.717, tuboEn(-0.72).r + 0.0025, tuboEn(-0.72).y - tuboEn(-0.645).y], [-0.72, 0, tuboEn(-0.72).y - tuboEn(-0.645).y]],
  },
  {
    tipo: "codo", id: "antena-pulgar", acabado: "negro",
    puntos: [[0, tuboEn(-0.68).y, -0.678, 0.011, 0.02], [0, tuboEn(-0.68).y + 0.03, -0.679, 0.0105, 0.018], [0, tuboEn(-0.68).y + 0.05, -0.683, 0.0095, 0.015], [0, tuboEn(-0.68).y + 0.061, -0.688, 0.0075, 0.011], [0, tuboEn(-0.68).y + 0.066, -0.692, 0, 0]],
  },
  {
    tipo: "codo", id: "antena-abajo", acabado: "negro",
    puntos: [[0, -0.045, -0.33, 0.013], [0, -0.1, -0.334, 0.013], [0, -0.132, -0.338, 0.0125], [0, -0.143, -0.34, 0.009], [0, -0.147, -0.341, 0]],
  },

  // La Raptor-360. Arriba se mete en la panza (de frente, asoma desde los
  // costados de la barquilla).
  {
    tipo: "placa", id: "raptor-brazo", acabado: "gris-qs", plano: "vertical", x: RAPTOR.ancho / 2 - RAPTOR.brazo / 2, espejo: true, grosor: RAPTOR.brazo, bisel: 0.004,
    planta: [[RAPTOR.eje - 0.031, RAPTOR.arriba + 0.004], [RAPTOR.eje + 0.031, RAPTOR.arriba + 0.004], ...arco(RAPTOR.eje, RAPTOR.ejeY, 0.031, 0, -180, 10)],
  },
  { tipo: "disco", id: "raptor-eje", acabado: "gris-qs", espejo: true, en: [RAPTOR.ancho / 2 + 0.0005, RAPTOR.ejeY, RAPTOR.eje], normal: [1, 0, 0], radio: 0.021, grosor: 0.0012 },
  { tipo: "caja", id: "raptor-cuerpo", acabado: "gris-qs", centro: [0, (RAPTOR.arriba - 0.16) / 2, (RAPTOR.delante + RAPTOR.detras) / 2], tam: [RAPTOR.ancho - 2 * RAPTOR.brazo - 0.002, RAPTOR.arriba + 0.16, RAPTOR.delante - RAPTOR.detras], redondeo: 0.016 },
  // La barbilla oscura de las tres lentes, que sale un poco por delante.
  { tipo: "caja", id: "raptor-franja", acabado: "negro", centro: [0, RAPTOR.abajo + 0.015, (RAPTOR.delante + RAPTOR.detras) / 2 + 0.004], tam: [RAPTOR.ancho - 2 * RAPTOR.brazo - 0.004, 0.03, RAPTOR.delante - RAPTOR.detras], redondeo: 0.012 },
  { tipo: "disco", id: "raptor-aro-objetivo", acabado: "metal", en: [0, -0.132, RAPTOR_FRENTE + 0.002], normal: [0, 0, 1], radio: 0.027, grosor: 0.006 },
  { tipo: "disco", id: "raptor-objetivo", acabado: "lente", en: [0, -0.132, RAPTOR_FRENTE + 0.0045], normal: [0, 0, 1], radio: 0.022, grosor: 0.003 },
  ...([[-0.0215, 0.0098], [0.0005, 0.0088], [0.0215, 0.0088]] as [number, number][]).map(([x, r], i): Pieza =>
    ({ tipo: "disco", id: `raptor-lente-${i}`, acabado: "lente", en: [x, RAPTOR.abajo + 0.014, RAPTOR_FRENTE + 0.0085], normal: [0, 0, 1], radio: r, grosor: 0.003 })),

  // La lente de la punta del morro, metida en un agujero negro.
  { tipo: "disco", id: "morro-agujero", acabado: "negro", en: [0, -0.066, 0.4485], normal: [0, 0, 1], radio: 0.011, grosor: 0.004 },
  { tipo: "disco", id: "morro-lente", acabado: "lente", en: [0, -0.066, 0.4505], normal: [0, 0, 1], radio: 0.006, grosor: 0.002 },

  // La cajita gris de encima del ala, junto a la góndola, cerca del borde de
  // ataque (fotos españolas del ala desde arriba).
  { tipo: "caja", id: "ala-cajita", acabado: "gris", espejo: true, centro: [0.56, 0.016, -0.035], tam: [0.028, 0.012, 0.022], redondeo: 0.003 },

  // El tren: dos patas negras finas, de pala, que salen de la panza junto a
  // los costados y bajan abiertas en V invertida, unos 40° de la vertical,
  // hasta bien por debajo de la Raptor (fotos de frente de Militarnyi y foto
  // del folleto); desde abajo, las puntas a ±0,18 m y un poco hacia atrás
  // (vídeo del fabricante).
  {
    tipo: "viga", id: "tren", acabado: "negro", espejo: true,
    ruta: [[0.04, -0.095, 0.05, 0.045, 0.012], [0.11, -0.175, 0.035, 0.034, 0.01], [0.18, -0.255, 0.018, 0.024, 0.008]],
  },

  // El mástil.
  {
    tipo: "codo", id: "mastil", acabado: "negro-ua",
    puntos: [[0, 0.045, MASTIL.z, 0.011, 0.02], [0, 0.06, MASTIL.z, 0.008, 0.015], [0, MASTIL.y + 0.004, MASTIL.z, 0.008, 0.015], [0, MASTIL.y + 0.011, MASTIL.z, 0.006, 0.011], [0, MASTIL.y + 0.014, MASTIL.z, 0, 0]],
  },
  { tipo: "codo", id: "mastil-casquillo", acabado: "negro-ua", puntos: [[0, MASTIL.y, MASTIL.z, 0.0085], [0, MASTIL.y, MASTIL.z + 0.024, 0.0085], [0, MASTIL.y, MASTIL.z + 0.027, 0.0065]] },
  { tipo: "varilla", id: "antena", acabado: "metal", desde: [0, MASTIL.y, MASTIL.z + 0.025], hasta: [0, MASTIL.y, 0.35], radio: 0.0045 },
  { tipo: "codo", id: "antena-punta", acabado: "negro", puntos: [[0, MASTIL.y, 0.345, 0.0065], [0, MASTIL.y, 0.384, 0.0065], [0, MASTIL.y, 0.388, 0.005], [0, MASTIL.y, 0.39, 0]] },

  // El disipador: base y aletas, inclinados como el lomo.
  {
    tipo: "prisma", id: "disipador", acabado: "aluminio", simetrica: true, y: lomoEn(DISIPADOR.z0) - 0.004, alto: 0.008, girar: girarDisipador,
    planta: [[0, DISIPADOR.z0], [DISIPADOR.ancho / 2, DISIPADOR.z0], [DISIPADOR.ancho / 2, DISIPADOR.z1 - 0.025], [DISIPADOR.ancho / 2 - 0.012, DISIPADOR.z1], [0, DISIPADOR.z1]],
  },
  ...Array.from({ length: 9 }, (_, i): Pieza => {
    // Las aletas de los lados, más cortas por delante: el frente en punta.
    const x = (i - 4) * 0.0058, borde = Math.abs(i - 4) / 4;
    const z1 = DISIPADOR.z1 - 0.004 - borde * 0.02;
    return { tipo: "caja", id: `disipador-aleta-${i}`, acabado: "aluminio", centro: [x, lomoEn(DISIPADOR.z0) + 0.01, (DISIPADOR.z0 + 0.004 + z1) / 2], tam: [0.0026, 0.013, z1 - DISIPADOR.z0 - 0.004], girar: girarDisipador };
  }),
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Un Vector AI de fábrica, como los españoles: sin bandera ni números. En el
// costado de la barquilla, delante del ala, el asa negra vertical y la ranura
// negra con su marco; bajo el ala, el agujero negro y la rejilla; las juntas
// de la tapa del morro, del panel de delante, de la tapa de arriba y de la
// barquilla con el tubo; la etiqueta del mástil. En el ala, la ranura del
// alerón, la tapa de su servo, los cuadros azules y «NO TOUCH»; en el
// estabilizador, la tapa de su servo; en la deriva, la rejilla. Posiciones de
// la vista de lado del fabricante (a escala con la Raptor), de la foto del
// folleto y de las de Militarnyi e Infodefensa.
const ARRIBA: [number, number, number] = [0, 1, 0];
const LADO: [number, number, number] = [1, 0, 0];
const NEGRO = "#1d1f22";
const CALCAS: Calca[] = [
  { sobre: ["barquilla"], en: [0.07, -0.008, 0.076], desde: LADO, tam: [0.012, 0.106], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.07, -0.042, 0.2], desde: LADO, tam: [0.088, 0.02], dibujo: { tipo: "marco" }, espejo: true },
  { sobre: ["barquilla"], en: [0.07, -0.042, 0.2], desde: LADO, tam: [0.082, 0.015], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.07, -0.05, 0.03], desde: LADO, tam: [0.013, 0.013], dibujo: { tipo: "disco", color: NEGRO }, espejo: true },
  { sobre: ["barquilla"], en: [0.06, -0.068, -0.03], desde: LADO, tam: [0.045, 0.038], dibujo: { tipo: "rejilla" }, espejo: true },
  { sobre: ["mastil"], en: [0.01, 0.068, MASTIL.z], desde: LADO, tam: [0.024, 0.014], dibujo: { tipo: "etiqueta" }, espejo: true },
  // El ala (la izquierda de verdad es la x positiva: la maqueta va en espejo).
  { sobre: ["ala"], en: [0.6, 0.02, -0.17], desde: ARRIBA, tam: [0.01, 0.085], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["ala"], en: [0.66, 0.02, -0.125], desde: ARRIBA, tam: [0.04, 0.016], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  { sobre: ["ala"], en: [0.92, 0.02, -0.045], desde: ARRIBA, tam: [0.05, 0.022], dibujo: { tipo: "rect", color: "#2f6fb8" }, espejo: true },
  { sobre: ["ala"], en: [1.05, 0.02, -0.14], desde: ARRIBA, tam: [0.07, 0.016], giro: 180, dibujo: { tipo: "texto", texto: "NO TOUCH", color: "#8a8d8f", fino: true }, espejo: true },
  { sobre: ["estabilizador"], en: [0.12, 0.02, -0.81], desde: ARRIBA, tam: [0.06, 0.024], dibujo: { tipo: "rect", color: NEGRO }, espejo: true },
  // La rejilla de la deriva, en lo alto.
  { sobre: ["deriva"], en: [0.01, 0.07, -1.09], desde: LADO, tam: [0.025, 0.03], dibujo: { tipo: "rejilla" }, espejo: true },
];
const COSTURAS: Costura[] = [
  // La tapa del morro: da la vuelta por delante del disipador y baja por el
  // costado hasta delante de la Raptor.
  { sobre: ["barquilla"], desde: ARRIBA, puntos: [[-0.04, 0.05, 0.344], [0, 0.05, 0.35], [0.04, 0.05, 0.344]] },
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.045, 0.03, 0.344], [0.05, 0.0, 0.322], [0.05, -0.05, 0.318], [0.045, -0.08, 0.33], [0.035, -0.095, 0.36]] },
  // El panel de delante, del lomo a la panza.
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.06, 0.05, 0.205], [0.068, 0.0, 0.19], [0.066, -0.06, 0.178], [0.055, -0.095, 0.182], [0.04, -0.11, 0.21]] },
  // La tapa de arriba, a lo largo del costado y por encima.
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.07, -0.003, 0.02], [0.07, -0.003, 0.125], [0.062, 0.025, 0.15], [0.045, 0.05, 0.158]] },
  // La junta de la barquilla con el tubo.
  { sobre: ["barquilla"], desde: LADO, espejo: true, puntos: [[0.03, -0.012, -0.322], [0.03, -0.054, -0.322]] },
];
const PARTES: Parte[] = [
  {
    nombre: "Cámara Raptor-360",
    en: [0, -0.32, RAPTOR.eje],
    piezas: ["raptor-brazo", "raptor-eje", "raptor-cuerpo", "raptor-franja", "raptor-aro-objetivo", "raptor-objetivo", "raptor-lente-0", "raptor-lente-1", "raptor-lente-2"],
    respaldo: "foto",
    fuentes: ["raptor", "et-morro", "lado-fabrica", "ficha", "infodefensa-2025"],
    texto: "Una cámara de día con 40 aumentos, una térmica y, si se quiere, un láser, en un cuerpo que da la vuelta entera bajo el morro. Es la que lleva el Vector AI del Ejército de Tierra. Se quita en segundos para poner otro sensor, como el acústico WASP, que oye los disparos de artillería.",
    nota: "Lo que lleva dentro sale del folleto del fabricante; la forma, de las fotos españolas y del folleto.",
  },
  {
    nombre: "Barquilla",
    en: [0, 0.3, 0.02],
    piezas: ["barquilla", "mastil", "mastil-casquillo", "antena", "antena-punta", "disipador", ...Array.from({ length: 9 }, (_, i) => `disipador-aleta-${i}`), "morro-agujero", "morro-lente", "antena-abajo"],
    respaldo: "foto",
    fuentes: ["et-morro", "lado-fabrica", "frente", "suelo-sol"],
    texto: "Lleva la batería, para unas tres horas de vuelo, y el ordenador con dos procesadores Nvidia Jetson Orin, que reconoce y sigue blancos sin depender de la radio. Encima del morro, el disipador de aluminio y el mástil de una antena; en la punta, una cámara pequeña; debajo, detrás del ala, otra antena.",
    nota: "El ancho y el alto, de la vista de frente del vídeo del fabricante; el perfil del morro, de su vista de lado."
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
    piezas: ["gondola-izq", "gondola-der", ...["rotor-izq", "rotor-der"].flatMap((r) => ["carcasa", "motor", "bisagra", "bisagra-2", "helice"].map((k) => `${r}-${k}`))],
    respaldo: "foto",
    fuentes: ["et-ala", "abajo-fabrica", "abajo-vuelo", "kipprotoren"],
    texto: "Despega y aterriza en vertical, como un multicóptero, y en el aire vuela como un avión: sus tres rotores se inclinan hacia delante y tiran de él. Por eso no necesita pista ni catapulta.",
    nota: "Van en vertical, como al despegar y aterrizar; en crucero se tumban hacia delante sobre su bisagra."
  },
  {
    nombre: "Cola y rotor trasero",
    en: [0, 0.42, -1.05],
    piezas: ["estabilizador", "deriva", ...["carcasa", "motor", "bisagra", "bisagra-2", "helice"].map((k) => `rotor-cola-${k}`), "antena-pulgar", "abrazadera", "antena-cupula"],
    respaldo: "foto",
    fuentes: ["suelo-sol", "abajo-vuelo", "et-cola", "kipprotoren"],
    texto: "La barquilla se estira en un tubo fino que lleva el estabilizador encima y, al final, la deriva; arriba de esta, doblada hacia delante, va el tercer rotor, que también se inclina. En el tubo, dos antenas negras.",
    nota: "El largo total, 1,6 m, y la cola, medidos en fotos encajadas de Militarnyi (en el suelo y desde abajo).",
  },
  {
    nombre: "Tren",
    en: [0.3, -0.32, 0.05],
    piezas: ["tren"],
    respaldo: "foto",
    fuentes: ["abajo-fabrica", "et-morro"],
    texto: "Dos patas negras finas que bajan abiertas desde la panza. Al aterrizar en vertical se apoya en ellas y en el pie de la deriva.",
    nota: "El ángulo, de las fotos de frente; el largo, aproximado.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "hombro", "lomo", "costado", "sobreArista", "bajoArista", "bordeArriba", "bordeAbajo", "nariz"] as const;
const aUnidades = (p: Pieza): Pieza => {
  const q = aUnidadesForma(p);
  return p.girar ? { ...q, girar: { ...p.girar, centro: u3(p.girar.centro) } } : q;
};
const aUnidadesForma = (p: Pieza): Pieza => {
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
    case "codo":
      return { ...p, puntos: p.puntos.map((q) => q.map(u) as typeof q) };
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const calcaAUnidades = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const costuraAUnidades = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "Quantum Systems Vector",
  subtitulo: "Dron de reconocimiento de ala fija con despegue vertical",
  escala: ESCALA,  // 1 unidad = 1 m; envergadura del fabricante, largo medido
  resalte: "tinta",
  pais: bandera("DE"),
  hd: true,
  // Tarjeta de /uas: de más arriba, como el TB2 y el Raven (ala larga).
  vistaTarjeta: [61, 20],
  // En la planta de la portada, las palas de las hélices quedan en píxeles sueltos.
  plantaSin: ["rotor-izq-helice", "rotor-der-helice", "rotor-cola-helice"],
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
