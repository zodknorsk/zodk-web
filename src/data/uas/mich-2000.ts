// Maqueta del MICH-2000 sacada de fotos públicas (Oboronka, el ejemplar «333»
// en el lanzador y las alas del ZTK-150 en la fábrica china). No hay medidas
// publicadas: las proporciones son a ojo. Las fotos, a tamaño completo, en
// arte/uas-fuentes/mich-2000/ (fuera de Git; enlaces en docs/hangar-de-uas.md).
// En HD (docs/uas-hd.md), la forma de la 1.0 con el detalle de las fotos de
// la fábrica ucraniana: juntas y tornillos del morro, la tapa del costado,
// los mandos de los elevones, las tapas del ala y las escarapelas.
// Ojo: la maqueta va en espejo; el lado izquierdo de verdad es el de x > 0.
import type { Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const OBORONKA = "https://oboronka.mezha.ua/istoriya-dronu-mich-2000-314113/";

type P3 = [number, number, number];
const ARRIBA: P3 = [0, 1, 0];

// El cuerpo: eje en y = 0,02; [z, radio] de delante atrás.
const EJE = 0.02;
const PERFIL: [number, number][] = [
  [1.4, 0], [1.37, 0.07], [1.3, 0.12], [1.18, 0.15], [1.02, 0.16],
  [-0.5, 0.155], [-0.68, 0.11], [-0.78, 0.065], [-0.8, 0.03], [-0.8, 0],
];
const radioEn = (z: number) => {
  for (let i = 0; i < PERFIL.length - 1; i++) {
    const [z0, r0] = PERFIL[i], [z1, r1] = PERFIL[i + 1];
    if (z <= z0 && z >= z1) return r0 + ((r1 - r0) * (z0 - z)) / (z0 - z1 || 1);
  }
  return 0;
};

// Media ala: [x, borde de ataque, borde de salida, grosor].
const ALA: [number, number, number, number][] = [
  [0, 0.62, -0.77, 0.17],
  [1.22, -0.44, -0.76, 0.035],
];
const enAla = (x: number) => {
  const [[, a0, s0, g0], [x1, a1, s1, g1]] = ALA, f = x / x1;
  return { ba: a0 + (a1 - a0) * f, bs: s0 + (s1 - s0) * f, grosor: g0 + (g1 - g0) * f };
};
const naca = (s: number) => 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);
// Cara de arriba del ala en x, a la fracción f de la cuerda.
const sobreAla = (x: number, f: number) => enAla(x).grosor * naca(f);

// Elevones: de 0,2 a 1,16 m, detrás del borde de salida.
const ELEVON = { y: 0.004, grosor: 0.016, bisagra: -0.762, salida: -0.85 };

// Mandos de los elevones: dos por lado, a 0,3 y 0,62 m del centro (fábrica,
// los drones de pie por detrás). Cada servo va bajo una tapa en lo alto del
// ala, delante de la bisagra; su brazo rojo asoma por una ranura y una
// varilla de metal lo une al cuerno blanco del elevón (también en la foto del
// centro del ala).
const MANDOS = [0.3, 0.62];
const SERVO = { z: -0.67, largo: 0.09, ancho: 0.1 };
const piezasMandos: Pieza[] = MANDOS.flatMap((x, i): Pieza[] => {
  const arriba = ELEVON.y + ELEVON.grosor / 2;
  const ala = sobreAla(x, (enAla(x).ba - SERVO.z) / (enAla(x).ba - enAla(x).bs));
  return [
    {
      tipo: "placa", id: `brazo-${i}`, plano: "vertical", acabado: "rojo-vivo", x: x + 0.012, grosor: 0.005, espejo: true,
      planta: [[SERVO.z + 0.012, ala - 0.01], [SERVO.z - 0.012, ala - 0.01], [SERVO.z - 0.006, ala + 0.03], [SERVO.z + 0.004, ala + 0.03]],
    },
    { tipo: "varilla", id: `varilla-${i}`, acabado: "metal", espejo: true, desde: [x + 0.012, ala + 0.024, SERVO.z], hasta: [x + 0.012, arriba + 0.03, ELEVON.bisagra - 0.012], radio: 0.0022 },
    {
      tipo: "placa", id: `cuerno-${i}`, plano: "vertical", acabado: "blanco", x: x + 0.012, grosor: 0.005, espejo: true,
      planta: [[ELEVON.bisagra - 0.004, arriba], [ELEVON.bisagra - 0.032, arriba], [ELEVON.bisagra - 0.016, arriba + 0.036], [ELEVON.bisagra - 0.008, arriba + 0.036]],
    },
  ];
});

// ── Catapulta ──────────────────────────────────────────────────────────────
// Despega con un cohete (RATO) desde una rampa: lo cuenta Oboronka, que
// fotografió también el cohete ucraniano en su caja. La rampa, de las fotos
// del «333» al atardecer (aproximada: no hay medidas ni más ángulos): una viga
// negra de acero, inclinada unos 22°, con la parte de arriba agujereada; detrás
// casi toca el suelo y por delante asoma más allá del morro. La sostienen dos
// caballetes en A (bajo el morro y bajo el ala) con patas de husillo sobre
// discos. El cohete, bajo la panza y asomando por detrás (en las fotos del
// «333», un tubo de metal bajo los winglets). Todo en los ejes del dron; el
// suelo, en los del mundo.
const CABECEO = 22;
const cc = Math.cos((CABECEO * Math.PI) / 180), sc = Math.sin((CABECEO * Math.PI) / 180);
// Un punto del mundo (y arriba de verdad), en los ejes del dron inclinado.
const delMundo = (x: number, yw: number, zw: number): P3 => [x, +(yw * cc - zw * sc).toFixed(4), +(yw * sc + zw * cc).toFixed(4)];
const enMundo = (y: number, zd: number) => ({ y: y * cc + zd * sc, z: -y * sc + zd * cc });
const SUELO = -0.8;
// La viga: dos largueros en U a los lados del cohete, del borde de salida
// hacia atrás hasta casi el suelo y 0,35 m por delante del morro.
const VIGA = { x: 0.13, arriba: -0.15, abajo: -0.3, ancho: 0.035, delante: 1.75, detras: -1.25 };
const largoViga = VIGA.delante - VIGA.detras;
// Los caballetes: bajo el morro y bajo el ala; las patas se abren hasta ±0,45.
const CABALLETES = [1.2, 0.0];
const PIE_X = 0.45, HUSILLO = 0.14;
// Travesaños entre los dos largueros, por debajo del cohete.
const TRAVESANOS = [1.65, 1.2, 0.7, 0.0, -0.6, -1.2];
// Los agujeros de aligerar de la cara de fuera de cada larguero (en la foto,
// la parte de arriba de la viga se ve calada).
const AGUJEROS = Array.from({ length: 23 }, (_, i) => VIGA.detras + 0.12 + i * 0.12);
const COHETE = { delante: 0.05, detras: -1.0, r: 0.075, y: -0.24 };
// Patines: un taco en la panza y un travesaño hasta cada larguero.
const PATINES = [0.95, -0.35];
const R_CUERPO = 0.155;
const pieDe = (zd: number, x: number) => { const m = enMundo(VIGA.abajo, zd); return delMundo(x, SUELO + HUSILLO, m.z); };
const arribaDe = (zd: number, x: number): P3 => [x, VIGA.abajo, zd];
const entre = (a: P3, b: P3, t: number): P3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const piezasCatapulta: Pieza[] = [
  ...[1, -1].map((sx, i): Pieza => ({ tipo: "caja", id: `larguero-${i}`, acabado: "negro", centro: [sx * VIGA.x, (VIGA.arriba + VIGA.abajo) / 2, (VIGA.delante + VIGA.detras) / 2], tam: [VIGA.ancho, VIGA.arriba - VIGA.abajo, largoViga] })),
  ...AGUJEROS.flatMap((za, i): Pieza[] => [1, -1].map((sx, j): Pieza => ({ tipo: "disco", id: `agujero-${i}-${j}`, acabado: "hueco", en: [sx * (VIGA.x + VIGA.ancho / 2 + 0.001), VIGA.arriba - 0.045, za], normal: [sx, 0, 0], radio: 0.022, grosor: 0.002 }))),
  ...TRAVESANOS.map((zt, i): Pieza => ({ tipo: "caja", id: `travesano-${i}`, acabado: "negro", centro: [0, VIGA.abajo + 0.02, zt], tam: [2 * VIGA.x, 0.04, 0.05] })),
  // Placa del final de la viga, detrás.
  { tipo: "caja", id: "viga-final", acabado: "negro", centro: [0, (VIGA.arriba + VIGA.abajo) / 2 - 0.02, VIGA.detras + 0.01], tam: [2 * VIGA.x + VIGA.ancho, VIGA.arriba - VIGA.abajo + 0.04, 0.02] },
  // Caballetes: dos patas abiertas en A, un travesaño a media altura, un
  // aspa y, en cada pie, el husillo y su disco.
  ...CABALLETES.flatMap((zc, i): Pieza[] => {
    const a = [arribaDe(zc, VIGA.x), arribaDe(zc, -VIGA.x)], b = [pieDe(zc, PIE_X), pieDe(zc, -PIE_X)];
    const medio = [entre(a[0], b[0], 0.55), entre(a[1], b[1], 0.55)];
    return [
      ...[0, 1].map((k): Pieza => ({ tipo: "varilla", id: `pata-${i}-${k}`, acabado: "negro", desde: a[k], hasta: b[k], radio: 0.022 })),
      { tipo: "varilla", id: `pata-travesano-${i}`, acabado: "negro", desde: medio[0], hasta: medio[1], radio: 0.016 },
      { tipo: "varilla", id: `pata-aspa-${i}-0`, acabado: "negro", desde: a[0], hasta: medio[1], radio: 0.012 },
      { tipo: "varilla", id: `pata-aspa-${i}-1`, acabado: "negro", desde: a[1], hasta: medio[0], radio: 0.012 },
      ...[PIE_X, -PIE_X].flatMap((x, k): Pieza[] => {
        const w = enMundo(pieDe(zc, x)[1], pieDe(zc, x)[2]);
        return [
          { tipo: "varilla", id: `husillo-${i}-${k}`, acabado: "metal", desde: pieDe(zc, x), hasta: delMundo(x, SUELO + 0.012, w.z), radio: 0.012 },
          { tipo: "disco", id: `disco-${i}-${k}`, acabado: "aluminio", en: delMundo(x, SUELO + 0.006, w.z), normal: [0, cc, sc], radio: 0.08, grosor: 0.012 },
        ];
      }),
    ];
  }),
  // Entre los dos caballetes, una riostra a cada lado (fotos del «333»).
  ...[1, -1].map((sx, j): Pieza => ({ tipo: "varilla", id: `riostra-${j}`, acabado: "negro", desde: entre(arribaDe(CABALLETES[0], sx * VIGA.x), pieDe(CABALLETES[0], sx * PIE_X), 0.55), hasta: arribaDe(CABALLETES[1] + 0.05, sx * VIGA.x), radio: 0.012 })),
  // Patines con que el dron apoya en la viga (solo con la catapulta).
  ...PATINES.flatMap((zp, i): Pieza[] => [
    { tipo: "caja", id: `taco-${i}`, acabado: "metal", centro: [0, EJE - R_CUERPO - 0.006, zp], tam: [0.05, 0.025, 0.05], redondeo: 0.004 },
    { tipo: "caja", id: `patin-${i}`, acabado: "metal", centro: [0, VIGA.arriba + 0.01, zp], tam: [2 * VIGA.x + VIGA.ancho, 0.02, 0.045] },
  ]),
  // El cohete (foto en su caja): cuerpo cromatado, el tramo de delante de
  // metal y escalonado, una abrazadera negra en la junta y, en la tobera, una
  // silla de bronce con dos pasadores a los lados. Medidas aproximadas: 15 cm
  // de diámetro y algo más de 1 m.
  {
    tipo: "tubo", id: "cohete-delante", acabado: "metal", centro: [0, COHETE.y],
    perfil: [[COHETE.delante, 0], [COHETE.delante - 0.005, 0.028], [COHETE.delante - 0.06, 0.03], [COHETE.delante - 0.065, 0.05], [COHETE.delante - 0.16, 0.05], [COHETE.delante - 0.17, COHETE.r - 0.008], [COHETE.delante - 0.26, COHETE.r - 0.008], [COHETE.delante - 0.261, 0]],
  },
  { tipo: "tubo", id: "cohete", acabado: "cromato", centro: [0, COHETE.y], perfil: [[COHETE.delante - 0.255, 0], [COHETE.delante - 0.256, COHETE.r], [COHETE.detras + 0.07, COHETE.r], [COHETE.detras + 0.069, 0]] },
  { tipo: "tubo", id: "cohete-abrazadera", acabado: "negro", centro: [0, COHETE.y], perfil: [[COHETE.delante - 0.27, COHETE.r + 0.005], [COHETE.delante - 0.31, COHETE.r + 0.005]] },
  { tipo: "tubo", id: "tobera", acabado: "metal", centro: [0, COHETE.y], perfil: [[COHETE.detras + 0.07, COHETE.r - 0.01], [COHETE.detras + 0.02, 0.05], [COHETE.detras - 0.03, 0.058], [COHETE.detras - 0.031, 0]] },
  { tipo: "disco", id: "tobera-fondo", acabado: "hueco", en: [0, COHETE.y, COHETE.detras - 0.033], normal: [0, 0, -1], radio: 0.048, grosor: 0.004 },
  { tipo: "caja", id: "silla", acabado: "laton", centro: [0, COHETE.y, COHETE.detras + 0.12], tam: [2 * COHETE.r + 0.03, 2 * COHETE.r + 0.02, 0.05] },
  { tipo: "varilla", id: "pasadores", acabado: "laton", desde: [-0.12, COHETE.y, COHETE.detras + 0.12], hasta: [0.12, COHETE.y, COHETE.detras + 0.12], radio: 0.009 },
  // Dos colgadores negros hasta la panza (cómo se sujeta, aproximado).
  ...[-0.35, -0.75].map((zb, i): Pieza => ({ tipo: "caja", id: `colgador-${i}`, acabado: "negro", centro: [0, (COHETE.y + COHETE.r + EJE - R_CUERPO) / 2, zb], tam: [0.04, EJE - R_CUERPO - COHETE.y - COHETE.r + 0.03, 0.04] })),
  ...[-0.35, -0.75].map((zb, i): Pieza => ({ tipo: "tubo", id: `cohete-cinta-${i}`, acabado: "negro", centro: [0, COHETE.y], perfil: [[zb + 0.015, COHETE.r + 0.004], [zb - 0.015, COHETE.r + 0.004]] })),
];
const ID_COHETE = /^(cohete|tobera|silla|pasadores|colgador)/;
const idsCatapulta = piezasCatapulta.map((p) => p.id).filter((id) => !ID_COHETE.test(id));
const idsCohete = piezasCatapulta.map((p) => p.id).filter((id) => ID_COHETE.test(id));

const CANARD_Y = 0.065;

const PIEZAS: Pieza[] = [
  {
    // El cuerpo va medio hundido en el ala, como en las fotos del lanzador:
    // por encima asoma el lomo y por delante sobresale el morro.
    tipo: "tubo", id: "fuselaje", acabado: "negro-ua", centro: [0, EJE], perfil: PERFIL,
  },
  { tipo: "ala", id: "ala", acabado: "negro-ua", y: 0, estaciones: ALA },
  {
    tipo: "placa", id: "elevones", acabado: "negro-ua", plano: "horizontal", y: ELEVON.y, grosor: ELEVON.grosor, espejo: true,
    planta: [[0.2, ELEVON.bisagra], [1.16, ELEVON.bisagra], [1.16, ELEVON.salida], [0.2, ELEVON.salida]],
  },
  {
    // En la parte alta del morro, por encima de la escarapela (foto del morro
    // y el «333»).
    tipo: "placa", id: "canards", acabado: "negro-ua", plano: "horizontal", y: CANARD_Y, grosor: 0.012, espejo: true,
    // Un 25 % más grande que en la 1.0 (en la foto del morro, de cerca, la
    // punta llega más lejos y la cuerda es mayor): la raíz, de la junta de la
    // tapa de la punta a la del anillo.
    planta: [[0.14, 1.13], [0.44, 1.005], [0.44, 0.915], [0.14, 0.95]],
  },
  // La pieza de metal en la esquina de detrás de la punta de cada canard
  // (foto del morro, de cerca).
  { tipo: "caja", id: "canard-punta", acabado: "metal", espejo: true, centro: [0.41, CANARD_Y, 0.922], tam: [0.06, 0.017, 0.016] },
  {
    // Más por debajo del ala que por encima, como el «333» del lanzador.
    tipo: "placa", id: "winglets", acabado: "negro-ua", plano: "vertical", x: 1.23, grosor: 0.015, espejo: true,
    planta: [[-0.46, 0.12], [-0.78, 0.16], [-0.8, -0.3], [-0.54, -0.26]],
  },
  ...piezasMandos,
  { tipo: "varilla", id: "motor", acabado: "metal", desde: [0, EJE, -0.79], hasta: [0, EJE, -0.9], radio: 0.045 },
  // De 0,84 m, un tercio de la envergadura (en la 1.0, 0,56): así sale en
  // las alas de la fábrica china y algo más grande aún en la silueta del dron
  // en vuelo.
  { tipo: "helice", id: "helice", acabado: "metal", en: [0, EJE, -0.92], radio: 0.42, palas: 2 },
  { tipo: "varilla", id: "antena", acabado: "metal", desde: [0, 0.16, 0.82], hasta: [0, 0.28, 0.78], radio: 0.008 },
];

// Una junta alrededor del cuerpo en z, en tramos de 30° (cada uno llevado a
// la superficie desde su lado), con tornillos cada `paso` si se dan.
const anillo = (z: number, paso?: number): Costura[] => {
  const r = radioEn(z) + 0.01;
  return Array.from({ length: 12 }, (_, i) => {
    const a0 = (i / 12) * Math.PI * 2, a1 = ((i + 1) / 12) * Math.PI * 2, am = (a0 + a1) / 2;
    const puntos = Array.from({ length: 5 }, (_, j): P3 => {
      const a = a0 + ((a1 - a0) * j) / 4;
      return [r * Math.cos(a), EJE + r * Math.sin(a), z];
    });
    return { sobre: ["fuselaje"], puntos, desde: [Math.cos(am), Math.sin(am), 0], ...(paso ? { remaches: paso } : {}) };
  });
};
// Tornillo de metal (calca: crece con el zoom, a diferencia de los remaches
// de las costuras); con arandela blanca, los de la tapa del costado.
const tornillo = (en: P3, desde: P3, sobre: string[], espejo = false): Calca =>
  ({ sobre, en, desde, espejo, tam: [0.008, 0.008], dibujo: { tipo: "disco", color: "#a9aeb3" } });
const arandela = (en: P3, desde: P3): Calca => ({ sobre: ["fuselaje"], en, desde, tam: [0.009, 0.009], dibujo: { tipo: "disco", color: "#d9dbdc" } });
// Tapa rectangular en lo alto del ala, en planta (x, z): la ranura y un
// tornillo en cada esquina y `n` más en cada lado.
const tapaAla = (x0: number, x1: number, z0: number, z1: number, n: number): { costura: Costura; tornillos: Calca[] } => {
  const lado = (a: [number, number], b: [number, number]) =>
    Array.from({ length: n + 1 }, (_, i): P3 => [a[0] + ((b[0] - a[0]) * i) / (n + 1), 0.2, a[1] + ((b[1] - a[1]) * i) / (n + 1)]);
  const puntos = [...lado([x0, z0], [x1, z0]), ...lado([x1, z0], [x1, z1]), ...lado([x1, z1], [x0, z1]), ...lado([x0, z1], [x0, z0])];
  // Los tornillos, un poco por dentro de la ranura.
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const dentro = ([x, y, z]: P3): P3 => [x + Math.sign(cx - x) * 0.008, y, z + Math.sign(cz - z) * 0.008];
  return {
    costura: { sobre: ["ala"], desde: ARRIBA, espejo: true, puntos: [...puntos, puntos[0]] },
    tornillos: puntos.map((q) => tornillo(dentro(q), ARRIBA, ["ala"], true)),
  };
};
const TAPAS_ALA = [
  // Las de los servos, un tornillo en cada esquina.
  ...MANDOS.map((x) => tapaAla(x + 0.012 - SERVO.ancho / 2, x + 0.012 + SERVO.ancho / 2, SERVO.z + SERVO.largo / 2, SERVO.z - SERVO.largo / 2, 0)),
  // Entre los dos mandos, una tapa cuadrada atornillada (fábrica).
  tapaAla(0.36, 0.56, -0.2, -0.4, 2),
];

// La tapa del costado izquierdo (x > 0): una ranura negra con un pulsador,
// de 15 × 4 cm, con cuatro tornillos de arandela blanca encima y cuatro
// debajo (foto del morro: algo por encima de media altura, entre la
// escarapela y el ala).
const TAPA_COSTADO = { z: 0.57, y: EJE + 0.02 };
const IZQ: P3 = [1, 0, 0];

const CALCAS: Calca[] = [
  // Escarapela a cada lado del morro, bajo el canard, con el centro a la
  // altura del borde de salida de su raíz (foto del morro y la de las
  // secciones).
  { sobre: ["fuselaje"], en: [0.16, EJE - 0.07, 0.94], desde: [1, -0.45, 0], tam: [0.14, 0.14], dibujo: { tipo: "escarapela-ua" }, espejo: true },
  // Y en lo alto de cada ala, hacia la punta (fábrica, los drones de pie).
  { sobre: ["ala"], en: [0.8, 0.2, -0.33], desde: ARRIBA, tam: [0.15, 0.15], dibujo: { tipo: "escarapela-ua" }, espejo: true },
  // La tapa del costado.
  { sobre: ["fuselaje"], en: [0.16, TAPA_COSTADO.y, TAPA_COSTADO.z], desde: IZQ, tam: [0.15, 0.036], dibujo: { tipo: "rect", color: "#0b0c0d" } },
  { sobre: ["fuselaje"], en: [0.16, TAPA_COSTADO.y, TAPA_COSTADO.z + 0.015], desde: IZQ, tam: [0.032, 0.024], dibujo: { tipo: "marco" } },
  ...[-0.06, -0.02, 0.02, 0.06].flatMap((dz) => [
    arandela([0.16, TAPA_COSTADO.y + 0.03, TAPA_COSTADO.z + dz], IZQ),
    arandela([0.16, TAPA_COSTADO.y - 0.03, TAPA_COSTADO.z + dz], IZQ),
  ]),
  // «НЕ БРАТЬСЯ» («no agarrar») en blanco en lo alto de cada elevón, como en
  // el Geran-2 (fábrica, los drones de pie).
  { sobre: ["elevones"], en: [0.85, 0.1, -0.806], desde: ARRIBA, tam: [0.16, 0.03], giro: 180, dibujo: { tipo: "texto", texto: "НЕ БРАТЬСЯ", color: "#e9ebec", fino: true }, espejo: true },
  // Un tornillo arriba a cada lado de las dos juntas del morro (foto del
  // morro, de cerca).
  ...[1.125, 0.935].map((z) => tornillo([0.055, 0.2, z], [0.35, 1, 0], ["fuselaje"], true)),
  ...TAPAS_ALA.flatMap((t) => t.tornillos),
  // La ranura por la que asoma el brazo de cada servo.
  ...MANDOS.map((x): Calca => ({ sobre: ["ala"], en: [x + 0.012, 0.2, SERVO.z], desde: ARRIBA, tam: [0.008, 0.045], dibujo: { tipo: "rect", color: "#0b0c0d" }, espejo: true })),
  // Tres pestillos en el borde de delante de la tapa del lomo, detrás del ala.
  ...[-0.06, 0, 0.06].map((x): Calca => ({ sobre: ["fuselaje"], en: [x, 0.3, -0.27], desde: ARRIBA, tam: [0.025, 0.018], dibujo: { tipo: "rect", color: "#101112" } })),
];

const COSTURAS: Costura[] = [
  // El morro: la tapa de la punta y el anillo de los canards (foto del morro,
  // de cerca).
  ...anillo(1.14),
  ...anillo(0.95),
  // Las juntas de los tramos del cuerpo, con un anillo de tornillos (foto de
  // las secciones). Cuántas son y dónde, a ojo, como en la 1.0.
  ...anillo(0.42, 0.06),
  ...anillo(0.05, 0.06),
  ...anillo(-0.42, 0.06),
  // La tapa del lomo, detrás del ala: del borde de salida hasta los
  // pestillos, a todo el ancho del lomo (fábrica, los drones de pie).
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[0.12, 0.3, -0.77], [0.12, 0.3, -0.27], [-0.12, 0.3, -0.27], [-0.12, 0.3, -0.77]] },
  // Las tapas del ala (los tornillos van como calcas).
  ...TAPAS_ALA.map((t) => t.costura),
];

const maqueta: Maqueta = {
  nombre: "MICH-2000",
  subtitulo: "Dron de ataque de largo alcance",
  // ~2,5 m de envergadura, como el Shahed-136 (no hay medidas publicadas).
  escala: 1,
  pais: bandera("UA"),
  hd: true,
  contornoPixel: true,
  // La pintura al sol, desde arriba, cae en 1,35 escalones: cerca del borde.
  desfaseLuz: 0.15,
  catapulta: { piezas: piezasCatapulta, cabeceo: CABECEO },
  // En la portada, solo el dron negro (las escarapelas, a 4 px, eran cuadrados).
  plantaLisa: true,
  // Algo desde arriba, como el Shahed: casi de lado, el ala en delta no se ve.
  vistaTarjeta: [65, 30],
  detalles: { calcas: CALCAS, costuras: COSTURAS.map((k) => ({ ...k, claro: true })) },
  piezas: PIEZAS,
  partes: [
    {
      nombre: "Canards",
      en: [0.34, CANARD_Y, 1.0],
      piezas: ["canards", "canard-punta"],
      respaldo: "foto",
      fuentes: ["morro", "ztk150"],
      texto: "Dos aletas pequeñas a los lados del morro, por delante del ala. Son lo que distingue a primera vista al MICH-2000 —y al ZTK-150 chino del que sale— del Shahed iraní.",
      nota: "La pieza de metal de la punta se ve en la foto del morro, de cerca.",
    },
    {
      nombre: "Ala en delta recortada",
      en: [0.7, 0.07, -0.25],
      piezas: ["ala"],
      respaldo: "foto",
      fuentes: ["ztk150", "lanzador", "centro", "cola"],
      texto: "Ala volante: el borde de ataque va en flecha hasta unas puntas cortadas, y el borde de salida es casi recto. No tiene cola. Lleva la escarapela encima y tapas atornilladas.",
      nota: "La flecha y la envergadura son a ojo: no hay medidas publicadas. Las tapas y las escarapelas, de los drones de pie en la fábrica.",
    },
    {
      nombre: "Winglets",
      en: [1.23, -0.12, -0.66],
      piezas: ["winglets"],
      respaldo: "foto",
      fuentes: ["lanzador", "cola"],
      texto: "Placas verticales en las puntas del ala. Hacen de deriva, porque el dron no tiene cola. En el ejemplar blanco del lanzador llevan pintado el número 333.",
    },
    {
      nombre: "Elevones",
      en: [0.8, 0.012, -0.81],
      piezas: ["elevones", ...MANDOS.flatMap((_, i) => [`brazo-${i}`, `varilla-${i}`, `cuerno-${i}`])],
      respaldo: "foto",
      fuentes: ["ztk150", "centro", "cola"],
      texto: "Superficies móviles en el borde de salida. Suben y bajan a la vez para cabecear, y en sentido contrario para alabear. Cada una se mueve con dos servos, metidos en el ala bajo una tapa atornillada: el brazo rojo del servo asoma por una ranura y una varilla de metal lo une al cuerno blanco del elevón. Llevan escrito «НЕ БРАТЬСЯ» («no agarrar»), como el Geran-2 ruso.",
      nota: "Los mandos se ven en la fábrica ucraniana; las bisagras, en las alas del ZTK-150 de la fábrica china.",
    },
    {
      nombre: "Fuselaje y cabeza de combate",
      en: [0.1, 0.16, 0.45],
      piezas: ["fuselaje"],
      respaldo: "fabricante",
      fuentes: ["secciones", "morro", "oboronka"],
      texto: "Un tubo que sobresale por delante del ala; en la fábrica ucraniana se monta por tramos atornillados. El fabricante habla de una cabeza de combate de 25 a 60 kg y de depósitos de varios tamaños según el alcance, hasta 2.000 km.",
      nota: "Dónde va cada cosa por dentro no se ha publicado. Las juntas del morro y la tapa del costado salen de la foto del morro; cuántas juntas hay detrás y dónde, a ojo.",
    },
    {
      nombre: "Motor y hélice",
      en: [0.2, 0.02, -0.92],
      piezas: ["motor", "helice"],
      respaldo: "foto",
      fuentes: ["cola", "centro", "united24"],
      texto: "Motor de explosión de fabricación ucraniana con una hélice de dos palas que empuja desde atrás, al final del cuerpo.",
      nota: "El modelo del motor no es público.",
    },
    {
      nombre: "Antena dorsal",
      en: [0, 0.28, 0.78],
      piezas: ["antena"],
      respaldo: "reconstruccion",
      fuentes: ["lanzador", "oboronka"],
      texto: "Un mástil pequeño encima del morro. El fabricante ofrece enlace analógico, digital o por Starlink, y una antena anti-interferencias (CRPA) opcional.",
      nota: "Se ve un mástil en la foto del lanzador; qué antena es, no se sabe.",
    },
    {
      nombre: "Rampa de lanzamiento",
      en: [0.13, VIGA.abajo, 1.6],
      piezas: idsCatapulta,
      respaldo: "foto",
      fuentes: ["lanzador", "oboronka"],
      texto: "No despega solo: sale de una rampa empujado por un cohete (RATO). La rampa es una viga de acero negra, calada por arriba, sobre dos caballetes con patas de husillo apoyadas en discos.",
      nota: "Sale de las fotos del «333» al atardecer, casi a contraluz: la inclinación (unos 22°) y las medidas son aproximadas.",
      catapulta: true,
    },
    {
      nombre: "Cohete de arranque",
      en: [0.08, COHETE.y - COHETE.r, COHETE.detras + 0.2],
      piezas: idsCohete,
      respaldo: "foto",
      fuentes: ["cohete", "oboronka", "lanzador"],
      texto: "Un cohete de combustible sólido bajo la panza que lo saca de la rampa a velocidad de vuelo y se suelta. Los hace la propia empresa: según Oboronka, empezaron a fabricarlos después de que unos cohetes comprados fuera les quemaran equipo de un millón de dólares.",
      nota: "El cohete es el de la foto de su caja; cómo va sujeto a la panza y sus medidas son aproximados.",
      catapulta: true,
    },
  ],
  fuentes: [
    { id: "morro", imagen: "morro-canard.jpg", titulo: "Morro con los canards, en la fábrica ucraniana", medio: "Oboronka", url: OBORONKA },
    { id: "lanzador", imagen: "lanzador-333-a.jpg", titulo: "El ejemplar «333» en su lanzador", medio: "Oboronka", url: OBORONKA },
    { id: "cola", imagen: "cola-winglets.jpg", titulo: "Alas de pie en la fábrica, vistas desde arriba", medio: "Oboronka", url: OBORONKA },
    { id: "ztk150", imagen: "ztk150-fabrica-china-a.jpg", titulo: "Alas del ZTK-150 en la fábrica china", medio: "Oboronka", url: OBORONKA },
    { id: "secciones", imagen: "fuselaje-secciones.jpg", titulo: "La cabeza de combate, antes de montarla", medio: "Oboronka", url: OBORONKA },
    { id: "cohete", imagen: "cohete-caja.jpg", titulo: "El cohete de arranque ucraniano, en su caja", medio: "Oboronka", url: OBORONKA },
    { id: "centro", imagen: "centro-ala-motor.jpg", titulo: "Centro del ala y soporte del motor", medio: "Oboronka", url: OBORONKA },
    { id: "oboronka", titulo: "Дрон MICH 2000: історія українського діпстрайку (datos del fabricante)", medio: "Oboronka", url: OBORONKA },
    { id: "united24", titulo: "Ukraine Secretly Built a Shahed-Like Drone for SBU", medio: "United24 Media", url: "https://united24media.com/defense-tech/ukraine-secretly-built-a-shahed-like-drone-for-sbu-now-thousands-are-flying-deep-into-russia-21681" },
  ],
};

export default maqueta;
