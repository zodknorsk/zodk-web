// Maqueta del Hero-30 de UVision, versión 2.0 (docs/nuevodron.md), con las
// marcas del ejemplar blanco de serie (UVision y Rheinmetall) de la ILA 2022.
// La forma, de la animación de la web de UVision (un render que gira el dron
// montado) a escala con las medidas publicadas (0,78 m de largo y 0,8 m de
// envergadura), y de fotos de ferias y del Ejército húngaro con la cámara de
// cada una encajada (arte/uas-fuentes/hero-30/, fuera de Git).
// En metros: z hacia el morro, con la punta del morro en z = 0,39; `d` es la
// distancia desde la punta, como se mide en el render.
// Las alas van en X y no salen del centro: cada una es una tabla un poco
// curva que gira sobre un pasador en la superficie del cuerpo, tangente a él,
// y su raíz pasa por encima del cuerpo hasta el otro lado. Las cuatro forman
// un molinillo: plegadas, se enrollan alrededor del cuerpo dentro del tubo
// (foto húngara de la boca del tubo). Las aletas de la cola, igual, más
// pequeñas.
import type { Calca, Costura, Maqueta, Parte, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

type P2 = [number, number];
type P3 = [number, number, number];

const ESCALA = 0.3;
const z = (d: number) => +(0.39 - d).toFixed(4);

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Un cilindro de 8,2 cm (render de planta, a escala con el largo). «Abajo» es el lado de la cámara y de
// la varilla del morro (render encajado): las alas quedan en X a 45°.
const R = 0.041;
// Delante, la cabeza de la cámara, medida de lado en el render (f084) y de
// frente (f116): un collarín del grueso del cuerpo, con una joroba debajo;
// delante, la cabeza, algo más estrecha (6,8 cm) y subida, con el lomo casi a
// ras del cuerpo. La cabeza es una capota arriba y una bola que gira debajo
// (la cámara, que se ve de lado por el hueco).
const COLLARIN = { delante: 0.085, detras: 0.144, r: 0.0415 };
const CABEZA = { r: 0.034, y: 0.005, atras: 0.0855 };
// La bola, cortada por delante en una cara plana donde va el objetivo.
const BOLA = { d: 0.031, y: 0, r: 0.0305, corte: 0.018, cabeceo: 18 };
// Detrás (render de lado, f084, con su cámara encajada): tras una junta, un
// tramo más estrecho (3,4 cm de radio) donde nacen las aletas; detrás de
// ellas, un cono corto hasta un cilindro de 2,3 cm que se afina hasta el aro
// de metal del motor.
const COLA = { junta: 0.638, r: 0.034, cono: 0.7 };
const PERFIL_CUERPO: P2[] = [
  [COLLARIN.detras, R], [COLA.junta - 0.002, R], [COLA.junta, 0.0395], [COLA.junta + 0.003, COLA.r], [COLA.cono, COLA.r],
  [0.712, 0.0265], [0.72, 0.0235], [0.757, 0.0185], [0.758, 0],
];
const PERFIL_COLLARIN: P2[] = [[COLLARIN.delante, 0.039], [COLLARIN.delante + 0.003, COLLARIN.r], [COLLARIN.detras - 0.002, COLLARIN.r], [COLLARIN.detras, R]];
// La capota: la mitad de arriba de la cabeza, de y = 1,1 cm al lomo. Delante
// baja redonda hasta la punta del morro, a 2,1 cm de altura (render de lado),
// y por debajo vuelve a la cara de abajo; vista desde arriba, también redonda.
const BAJO_CAPOTA = 0.011;
const seccionCapota = (d: number, ancho: number, arriba: number, abajo = BAJO_CAPOTA) =>
  ({ z: z(d), ancho, arriba, abajo, cintura: abajo + Math.min(0.001, (arriba - abajo) / 2), n: 2, nAbajo: 6 });
const NARIZ = 0.028;
const SECCIONES_CAPOTA = [
  seccionCapota(0, 0, 0.0212, 0.0208),
  ...([[0.002, 0.016], [0.006, 0.0125], [0.012, BAJO_CAPOTA], [0.02, BAJO_CAPOTA], [NARIZ, BAJO_CAPOTA]] as P2[]).map(([d, abajo]) => {
    const q = Math.sqrt(Math.max(0, 1 - ((NARIZ - d) / NARIZ) ** 2));
    return seccionCapota(d, CABEZA.r * q, 0.021 + (CABEZA.y + CABEZA.r - 0.021) * q, abajo);
  }),
  seccionCapota(CABEZA.atras, CABEZA.r, CABEZA.y + CABEZA.r),
];
const esfera = (d0: number, r: number): P2[] =>
  [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map((g) => [d0 - r * Math.cos((g * Math.PI) / 180), r * Math.sin((g * Math.PI) / 180)]);
const tubo = (perfil: P2[]): P2[] => perfil.map(([d, r]) => [z(d), r]);

// ── Alas y aletas ──────────────────────────────────────────────────────────
// La X: la primera ala, a ROLL grados del costado derecho; las demás, cada
// 90°. Cada tabla va a la altura del cuerpo (tangente) y empieza al otro lado.
const ROLL = 45;
// La cuerda, 10 cm: medida en la foto de la ILA con la cámara encajada (en el
// render de planta salía mayor: la cámara está muy cerca y el ala, más cerca
// de ella que el cuerpo, se ve más grande).
const ALA = { ba: 0.38, bs: 0.48, punta: 0.395, grueso: 0.008 };
// La punta no es simétrica (render casi de planta, f084, y foto de la ILA):
// sobresale 2,5 cm de las esquinas, con lo más saliente a dos tercios de la
// cuerda hacia el borde de ataque; del lado del borde de salida el corte
// arranca casi plano y del de ataque baja con una esquina redonda.
// [lo que falta hasta la punta, en fracción de lo que sobresale; recorte del
// borde de ataque y del de salida, en fracción de la cuerda], leído en el
// contorno del render.
// Sobresale 3 cm de la junta de la punta (medido con la cuerda en el render
// de lado, f084, en las dos alas que se ven de plano).
const SALIENTE = 0.03;
const PUNTA_ALA: [number, number, number][] = ([
  [1, 0, 0], [0.88, 0.01, 0.11], [0.76, 0.01, 0.22], [0.65, 0.03, 0.28], [0.53, 0.05, 0.32], [0.41, 0.08, 0.37],
  [0.29, 0.08, 0.42], [0.18, 0.13, 0.47], [0.06, 0.21, 0.53], [0, 0.3, 0.62],
] as [number, number, number][]).map(([f, a, b]) => [f * SALIENTE, a, b]);
// La raíz pasa por encima del cuerpo hasta casi el otro lado y acaba con las
// esquinas redondas (render f084). No puede pasar de 0,9 radios: ahí está la
// tabla del ala de al lado.
const RAIZ_ALA: [number, number, number][] = [[-0.9, 0.3, 0.3], [-0.87, 0.1, 0.1], [-0.82, 0.03, 0.03], [-0.75, 0, 0]];
const estacionesAla = (r: number) => {
  const { ba, bs, punta, grueso } = ALA, c = bs - ba;
  const t = grueso / 0.775;
  return ([...RAIZ_ALA.map(([f, a, b]) => [f * r, a, b]), ...PUNTA_ALA.map(([f, a, b]) => [punta - f, a, b])] as [number, number, number][])
    .map(([x, a, b]): [number, number, number, number] => [x, z(ba + a * c), z(bs - b * c), t * Math.min(1, 1.3 - a - b)]);
};
// Las aletas nacen en el tramo estrecho; sus puntas, a unos 16,5 cm del eje
// (fotos de la ILA y de la feria checa). La cuerda, 7 cm, y el sitio, del
// render de lado encajado. Junto a la raíz, el borde de ataque tiene una
// muesca de 1,2 cm en el borde de salida, donde va la bisagra.
const ALETA = { ba: 0.624, bs: 0.694, punta: 0.16, grueso: 0.005, muesca: 0.012 };
const R_ALETA = COLA.r;
const estacionesAleta = (r: number) => {
  const { ba, bs, punta, grueso, muesca } = ALETA;
  const t = grueso / 0.775;
  return ([[-0.8 * r, ba, bs - muesca], [r + 0.011, ba, bs - muesca], [r + 0.015, ba, bs], [punta - 0.006, ba, bs], [punta, ba + 0.004, bs - 0.004]] as [number, number, number][])
    .map(([x, a, b]): [number, number, number, number] => [x, z(a), z(b), t]);
};
const molinillo = (id: string, y: number, estaciones: [number, number, number, number][]): Pieza[] =>
  [0, 1, 2, 3].map((k): Pieza => ({
    tipo: "ala", id: `${id}-${k}`, acabado: "blanco-h30", sola: true, y, estaciones,
    girar: { centro: [0, 0, 0], eje: "z", grados: ROLL + 90 * k },
  }));
// El pasador de cada ala, cerca de la raíz y del borde de salida (render).
const PASADOR = { x: -0.55 * R, d: 0.44 };
const pasadores: Pieza[] = [0, 1, 2, 3].map((k): Pieza => ({
  tipo: "disco", id: `pasador-${k}`, acabado: "metal", en: [PASADOR.x, R + ALA.grueso + 0.0005, z(PASADOR.d)], normal: [0, 1, 0], radio: 0.006, grosor: 0.0015,
  girar: { centro: [0, 0, 0], eje: "z", grados: ROLL + 90 * k },
}));

// ── Motor y hélice ─────────────────────────────────────────────────────────
// Eléctrico, en la punta de la cola (render de lado encajado): el aro de
// metal del motor, el buje con las dos horquillas donde se pliegan las palas
// y una hélice de dos palas negras de unos 30 cm, como remos: estrechas en
// la horquilla y anchas y redondas en la punta (foto de la ILA).
// Las palas, casi en vertical en el render de lado (se ven de canto).
const HELICE = 0.792, GIRO_PALAS = 88;
const piezasMotor: Pieza[] = [
  { tipo: "tubo", id: "motor", acabado: "metal", centro: [0, 0], perfil: tubo([[0.757, 0.0178], [0.759, 0.0182], [0.772, 0.0182], [0.775, 0.0145], [0.776, 0]]) },
  { tipo: "tubo", id: "buje", acabado: "metal", centro: [0, 0], perfil: tubo([[0.775, 0.008], [0.784, 0.0085], [0.8, 0.0085], [0.803, 0.005], [0.808, 0.003], [0.809, 0]]) },
  // Las horquillas: dos orejas a cada lado del buje, con el perno de la pala.
  ...[1, -1].map((s, i): Pieza => ({ tipo: "caja", id: `horquilla-${i}`, acabado: "metal", centro: [0, s * 0.011, z(HELICE)], tam: [0.012, 0.009, 0.014], redondeo: 0.002, girar: { centro: [0, 0, z(HELICE)], eje: "z", grados: GIRO_PALAS - 90 } })),
  {
    tipo: "helice", id: "helice", acabado: "negro", en: [0, 0, z(HELICE)], radio: 0.153, palas: 2, giro: GIRO_PALAS, ancho: 0.032, buje: 0, paso: 0.2,
    forma: [[0.08, 0.12, 0.12], [0.2, 0.2, 0.2], [0.4, 0.34, 0.34], [0.65, 0.46, 0.46], [0.85, 0.5, 0.5], [0.95, 0.42, 0.42], [1, 0.18, 0.18]],
  },
];

// ── Cámara ─────────────────────────────────────────────────────────────────
// Todo del render (de lado, f084 y f096; de frente y desde abajo, f116):
// - la bola de la cámara, de 6,1 cm, metida bajo la capota (de lado se ve
//   por el hueco bajo la capota); por delante tiene una cara plana, un poco
//   hacia abajo, con el objetivo grande metido en ella (aro negro y cristal);
// - el objetivo pequeño, en la punta de la capota, encima del grande;
// - detrás de la bola, la parte de atrás de la cabeza, entera;
// - la joroba: el collarín baja 0,65 cm del cuerpo y, por delante, sube en
//   rampa hasta la cabeza; en la rampa, dos ventanas.
const caraBola = BOLA.d - BOLA.corte;
const bolaCortada: P2[] = [[caraBola, 0], ...esfera(BOLA.d, BOLA.r).filter(([d]) => d > caraBola + 0.0005)];
bolaCortada.splice(1, 0, [caraBola, Math.sqrt(BOLA.r ** 2 - BOLA.corte ** 2)]);
const enBola = (p: Pieza): Pieza => ({ ...p, girar: { centro: [0, BOLA.y, z(BOLA.d)], eje: "x", grados: BOLA.cabeceo } });
const seccionJoroba = (d: number, abajo: number, ancho = 0.021) => ({ z: z(d), ancho, arriba: -0.012, abajo, n: 2, nAbajo: 3 });
const piezasCamara: Pieza[] = [
  { tipo: "casco", id: "capota", acabado: "blanco-h30", secciones: SECCIONES_CAPOTA, polo: true },
  { tipo: "tubo", id: "cabeza", acabado: "blanco-h30", centro: [0, CABEZA.y], perfil: tubo([[0.06, 0], [0.0602, CABEZA.r], [CABEZA.atras, CABEZA.r], [CABEZA.atras + 0.0002, 0]]) },
  enBola({ tipo: "tubo", id: "bola", acabado: "blanco-h30", centro: [0, BOLA.y], perfil: tubo(bolaCortada) }),
  enBola({ tipo: "disco", id: "objetivo-aro", acabado: "negro", en: [0, BOLA.y, z(caraBola - 0.0002)], normal: [0, 0, 1], radio: 0.0195, grosor: 0.0006 }),
  enBola({ tipo: "disco", id: "objetivo-cristal", acabado: "lente", en: [0, BOLA.y, z(caraBola - 0.0005)], normal: [0, 0, 1], radio: 0.0158, grosor: 0.0006 }),
  { tipo: "disco", id: "camara-chica-aro", acabado: "negro", en: [0, 0.0165, z(0.0012)], normal: [0, 0, 1], radio: 0.0072, grosor: 0.0015 },
  { tipo: "disco", id: "camara-chica", acabado: "lente", en: [0, 0.0165, z(0.0003)], normal: [0, 0, 1], radio: 0.0055, grosor: 0.0006 },
  {
    tipo: "casco", id: "joroba", acabado: "blanco-h30", secciones: [
      seccionJoroba(0.0845, -0.0245, 0.019), seccionJoroba(0.09, -0.031), seccionJoroba(0.095, -0.037), seccionJoroba(0.1, -0.0445),
      seccionJoroba(0.105, -0.0475), seccionJoroba(0.131, -0.0475), seccionJoroba(0.137, -0.0445), seccionJoroba(0.142, -0.039, 0.019),
    ],
  },
  // La varilla: una L corta y blanca bajo el cuerpo, detrás del collarín,
  // que baja 2,3 cm y apunta 4 cm hacia delante (render f084).
  { tipo: "varilla", id: "varilla-baja", acabado: "blanco-h30", desde: [0, -R + 0.002, z(0.166)], hasta: [0, -0.0645, z(0.166)], radio: 0.0015 },
  { tipo: "varilla", id: "varilla-punta", acabado: "blanco-h30", desde: [0, -0.0645, z(0.1668)], hasta: [0, -0.0655, z(0.125)], radio: 0.0015 },
];

// ── Lanzadera ──────────────────────────────────────────────────────────────
// El tubo de la feria checa (fotos de perfil de Reise Reise, medidas sobre la
// foto girada hasta dejar el tubo horizontal, a escala con un grueso de 17 cm
// junto a la boca): negro verdoso, de fibra de carbono, 1,07 m de punta a
// punta. Delante, un bloque de espuma oscura de ocho caras a ras de la boca;
// detrás, el bloque de la culata, más largo, con un pie por debajo que apoya
// en el suelo y un resalte redondo encima. Tres bandas negras con sus cierres
// abajo, la botella del aire comprimido, larga y negra, a un costado delante
// del bloque de detrás, la correa por encima con su mando, y el bípode a un
// tercio de la boca, de patas largas con puntas de metal. Inclinado 24°, como
// en la foto. El dron sale por la boca con la hélice a ras.
// Todo en los ejes del dron; el suelo, en los del mundo. `s`: distancia desde
// la boca a lo largo del tubo.
const CABECEO = 24;
const cc = Math.cos((CABECEO * Math.PI) / 180), sc = Math.sin((CABECEO * Math.PI) / 180);
const delMundo = (x: number, yw: number, zw: number): P3 => [x, +(yw * cc - zw * sc).toFixed(4), +(yw * sc + zw * cc).toFixed(4)];
const enMundo = (y: number, zd: number) => ({ y: y * cc + zd * sc, z: -y * sc + zd * cc });
const TUBO = { boca: z(HELICE + 0.01), largo: 1.07, r: 0.085, dentro: 0.078 };
const zs = (s: number) => +(TUBO.boca - s).toFixed(4);
// Los bloques: ocho caras (medio ancho y chaflán de las esquinas), visto de
// frente, de `desde` a `hasta`. El de detrás, con el pie y el resalte.
const BLOQUES = { delante: { desde: 0, hasta: 0.121, medio: 0.11, chaflan: 0.035 }, detras: { desde: 0.88, hasta: TUBO.largo, medio: 0.106, chaflan: 0.03 } };
const PIE = { desde: 0.8, hasta: 1.05, arriba: -0.07, abajo: -0.145, medio: 0.1 };
const octogono = (m: number, c: number): P2[] => [[0, m], [m - c, m], [m, m - c], [m, -(m - c)], [m - c, -m], [0, -m]];
const SUELO = enMundo(PIE.abajo, zs(PIE.hasta)).y;
const PATAS = { s: 0.33, abiertas: 0.16, adelante: 0.2, punta: 0.05 };
const piePata = (sx: number): P3 => { const m = enMundo(-TUBO.r, zs(PATAS.s)); return delMundo(sx * PATAS.abiertas, SUELO, m.z + PATAS.adelante); };
const arranquePata = (sx: number): P3 => [sx * 0.012, -TUBO.r - 0.02, zs(PATAS.s)];
const entre = (a: P3, b: P3, t: number): P3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
// La botella, en el costado que se ve en la foto (x negativa), algo por debajo
// del eje: de 6 cm de grueso, de la boca del bloque de detrás hacia delante.
const BOTELLA = { x: -(TUBO.r + 0.026), y: -0.015, delante: 0.66, detras: 0.95, r: 0.03 };
const BANDAS = [0.473, 0.538, 0.62];
const piezasLanzadera: Pieza[] = [
  { tipo: "tubo", id: "tubo", acabado: "tubo-h30", centro: [0, 0], perfil: [[zs(-0.004), TUBO.dentro], [zs(-0.002), TUBO.r], [zs(TUBO.largo - 0.01), TUBO.r], [zs(TUBO.largo), 0]] },
  { tipo: "disco", id: "tubo-boca", acabado: "hueco", en: [0, 0, zs(-0.0035)], normal: [0, 0, 1], radio: TUBO.dentro, grosor: 0.001 },
  ...(["delante", "detras"] as const).map((k): Pieza => ({
    tipo: "prisma", id: `bloque-${k}`, acabado: "espuma", eje: "z", simetrica: true, y: zs(BLOQUES[k].hasta), alto: BLOQUES[k].hasta - BLOQUES[k].desde,
    planta: octogono(BLOQUES[k].medio, BLOQUES[k].chaflan), chaflanArriba: [0.006, 0.006], chaflanAbajo: [0.006, 0.006],
  })),
  { tipo: "caja", id: "bloque-pie", acabado: "espuma", centro: [0, (PIE.arriba + PIE.abajo) / 2, zs((PIE.desde + PIE.hasta) / 2)], tam: [2 * PIE.medio, PIE.arriba - PIE.abajo, PIE.hasta - PIE.desde], redondeo: 0.025 },
  { tipo: "caja", id: "bloque-resalte", acabado: "espuma", centro: [0, BLOQUES.detras.medio + 0.008, zs(0.98)], tam: [0.17, 0.03, 0.08], redondeo: 0.014 },
  // Las tres bandas, algo más gruesas que el tubo, y el cierre de cada una,
  // abajo, en el costado de la botella.
  ...BANDAS.map((sb, i): Pieza => ({ tipo: "tubo", id: `banda-${i}`, acabado: "negro", centro: [0, 0], perfil: [[zs(sb - 0.018), TUBO.r + 0.003], [zs(sb + 0.018), TUBO.r + 0.003]] })),
  ...BANDAS.map((sb, i): Pieza => ({ tipo: "caja", id: `banda-cierre-${i}`, acabado: "negro", centro: [-0.045, -0.076, zs(sb)], tam: [0.024, 0.016, 0.04], redondeo: 0.003 })),
  // La correa por encima, de detrás del bloque de delante al de detrás, y su
  // mando, cerca de la culata.
  { tipo: "caja", id: "correa", acabado: "negro", centro: [0, TUBO.r + 0.006, zs(0.56)], tam: [0.036, 0.007, 0.64], redondeo: 0.003 },
  { tipo: "caja", id: "correa-mando", acabado: "negro", centro: [0, TUBO.r + 0.022, zs(0.725)], tam: [0.032, 0.036, 0.032], redondeo: 0.01 },
  { tipo: "tubo", id: "botella", acabado: "negro", centro: [BOTELLA.x, BOTELLA.y], perfil: [[zs(BOTELLA.delante), 0], [zs(BOTELLA.delante + 0.004), BOTELLA.r - 0.006], [zs(BOTELLA.delante + 0.012), BOTELLA.r], [zs(BOTELLA.detras), BOTELLA.r], [zs(BOTELLA.detras + 0.001), 0]] },
  { tipo: "disco", id: "botella-tapa", acabado: "metal", en: [BOTELLA.x, BOTELLA.y, zs(BOTELLA.delante - 0.002)], normal: [0, 0, 1], radio: 0.02, grosor: 0.004 },
  // El bípode: la abrazadera bajo el tubo, las dos patas y sus puntas.
  { tipo: "caja", id: "patas-abrazadera", acabado: "negro", centro: [0, -TUBO.r - 0.01, zs(PATAS.s)], tam: [0.05, 0.024, 0.04], redondeo: 0.006 },
  ...[1, -1].flatMap((sx, i): Pieza[] => {
    const a = arranquePata(sx), b = piePata(sx), m = entre(b, a, PATAS.punta / Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    return [
      { tipo: "varilla", id: `pata-${i}`, acabado: "negro", desde: a, hasta: m, radio: 0.007 },
      { tipo: "varilla", id: `pata-punta-${i}`, acabado: "metal", desde: m, hasta: b, radio: 0.003 },
    ];
  }),
];
// Lo escrito en el tubo, en blanco, en el costado que se ve en la foto: la
// flecha «DIRECTION OF LAUNCH» justo detrás del bloque de delante y, más
// atrás, «IMPORTANT / POSITION ON FLAT GROUND», los dos por encima del
// costado (a unos 50° y 40°, para que se lean desde el visor) y repetidos
// en el otro costado.
const enTubo = (s: number, grados: number, lado = -1) => {
  const a = ((lado < 0 ? 180 - grados : grados) * Math.PI) / 180;
  return { en: [+(TUBO.r * Math.cos(a)).toFixed(4), +(TUBO.r * Math.sin(a)).toFixed(4), zs(s)] as P3, desde: [+Math.cos(a).toFixed(4), +Math.sin(a).toFixed(4), 0] as P3 };
};
const BLANCO_TUBO = "#ecebe6";
// Para que las piezas no se fundan (todo es casi negro): una junta clara en
// cada borde de las bandas y donde el tubo entra en los bloques.
const aroTubo = (sobre: string, s: number, r: number): Costura[] => [0, 90, 180, 270].map((g) => ({
  sobre: [sobre], claro: true, desde: [+Math.cos((g * Math.PI) / 180).toFixed(4), +Math.sin((g * Math.PI) / 180).toFixed(4), 0],
  puntos: Array.from({ length: 9 }, (_, i) => { const a = ((g - 46 + (92 * i) / 8) * Math.PI) / 180; return [+(r * Math.cos(a)).toFixed(4), +(r * Math.sin(a)).toFixed(4), zs(s)] as P3; }),
}));
const COSTURAS_LANZADERA: Costura[] = [
  ...BANDAS.flatMap((sb, i) => [...aroTubo(`banda-${i}`, sb - 0.017, TUBO.r + 0.01), ...aroTubo(`banda-${i}`, sb + 0.017, TUBO.r + 0.01)]),
  ...aroTubo("tubo", BLOQUES.delante.hasta + 0.002, TUBO.r + 0.01), ...aroTubo("tubo", BLOQUES.detras.desde - 0.002, TUBO.r + 0.01),
];
const CALCAS_LANZADERA: Calca[] = [
  { sobre: ["tubo"], ...enTubo(0.187, 52), tam: [0.117, 0.039], dibujo: { tipo: "flecha-texto", texto: "DIRECTION OF LAUNCH", color: BLANCO_TUBO } },
  // En el otro costado la boca queda a la izquierda: la flecha, al revés.
  { sobre: ["tubo"], ...enTubo(0.187, 52, 1), tam: [0.117, 0.039], dibujo: { tipo: "flecha-texto", texto: "DIRECTION OF LAUNCH", color: BLANCO_TUBO, izquierda: true } },
  { sobre: ["tubo"], ...enTubo(0.37, 40), tam: [0.146, 0.035], espejo: true, dibujo: { tipo: "texto", texto: "IMPORTANT\nPOSITION ON FLAT GROUND", color: BLANCO_TUBO, fino: true } },
];

// ── Detalles del cuerpo ────────────────────────────────────────────────────
// Un ángulo alrededor del eje (0 = costado izquierdo, x positiva; 90 = arriba)
// y un punto a esa distancia del eje.
const alrededor = (grados: number, r: number, d: number): P3 => {
  const a = (grados * Math.PI) / 180;
  return [+(r * Math.cos(a)).toFixed(4), +(r * Math.sin(a)).toFixed(4), z(d)];
};
// La tapa en D de detrás del ala, arriba y del lado del ala de arriba a la
// derecha, y el asa pequeña encima (render encajado: 135°).
const TAPA = { angulo: 135, delante: 0.515, detras: 0.625, medio: 34 };
const ASA = { delante: 0.552, detras: 0.588, alto: 0.011 };
const piezasAsa: Pieza[] = [
  { tipo: "varilla", id: "asa-0", acabado: "blanco-h30", desde: alrededor(TAPA.angulo, R - 0.002, ASA.delante), hasta: alrededor(TAPA.angulo, R + ASA.alto, ASA.delante), radio: 0.0022 },
  { tipo: "varilla", id: "asa-1", acabado: "blanco-h30", desde: alrededor(TAPA.angulo, R + ASA.alto, ASA.delante), hasta: alrededor(TAPA.angulo, R + ASA.alto, ASA.detras), radio: 0.0022 },
  { tipo: "varilla", id: "asa-2", acabado: "blanco-h30", desde: alrededor(TAPA.angulo, R + ASA.alto, ASA.detras), hasta: alrededor(TAPA.angulo, R - 0.002, ASA.detras), radio: 0.0022 },
];
// Las bisagras de las aletas: un taco de metal junto a la raíz, delante
// (foto de la ILA).
const bisagras: Pieza[] = [0, 1, 2, 3].map((k): Pieza => ({
  tipo: "caja", id: `bisagra-${k}`, acabado: "metal", centro: [0.4 * R_ALETA, R_ALETA + 0.0045, z(ALETA.bs - ALETA.muesca / 2)], tam: [0.016, 0.008, 0.012], redondeo: 0.002,
  girar: { centro: [0, 0, 0], eje: "z", grados: ROLL + 90 * k },
}));

const PIEZAS: Pieza[] = [
  { tipo: "tubo", id: "fuselaje", acabado: "blanco-h30", centro: [0, 0], perfil: tubo(PERFIL_CUERPO) },
  { tipo: "tubo", id: "collarin", acabado: "blanco-h30", centro: [0, 0], perfil: tubo(PERFIL_COLLARIN) },
  ...piezasCamara,
  ...molinillo("ala", R, estacionesAla(R)),
  ...pasadores,
  ...molinillo("aleta", R_ALETA, estacionesAleta(R_ALETA)),
  ...bisagras,
  ...piezasAsa,
  ...piezasMotor,
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Las marcas del ejemplar de la ILA 2022: el logo de UVision con el de
// Rheinmetall debajo, a cada costado entre las alas (en la foto de la ILA y
// en el render salen en costados distintos), y el triángulo negro detrás.
// El sitio, medido en la foto de la ILA con la cámara encajada.
const CALCAS: Calca[] = [
  { sobre: ["fuselaje"], en: [R, 0.013, z(0.243)], desde: [1, 0, 0], tam: [0.105, 0.042], dibujo: { tipo: "uvision", rheinmetall: true }, espejo: true },
  { sobre: ["fuselaje"], en: [R, -0.006, z(0.305)], desde: [1, 0, 0], tam: [0.016, 0.013], dibujo: { tipo: "triangulo" }, espejo: true },
  // Dos tornillos a cada costado de la capota (render f084 y f096).
  ...[[0.051, 0.0233], [0.013, 0.028]].map(([d, y]): Calca => ({ sobre: ["capota"], en: [0.03, y, z(d)], desde: [1, 0, 0], tam: [0.0035, 0.0035], dibujo: { tipo: "disco", color: "#2a2c30" }, espejo: true })),
  // Las dos ventanas de la rampa de la joroba (render f116).
  { sobre: ["joroba"], en: [0.0085, -0.033, z(0.092)], desde: [0, -0.55, 0.83], tam: [0.0115, 0.011], dibujo: { tipo: "ventana" }, espejo: true },
];
// Juntas: los dos anillos de la sección del ala (render de planta), la tapa
// en D y, en cada ala, el pliegue a lo largo cerca del borde de salida
// (fotos de la feria alemana y render).
// Un anillo, en cuatro arcos llevados cada uno desde su lado.
const anilloJunta = (d: number): Costura[] => [0, 90, 180, 270].map((g) => ({
  sobre: ["fuselaje"], desde: [+Math.cos((g * Math.PI) / 180).toFixed(4), +Math.sin((g * Math.PI) / 180).toFixed(4), 0],
  puntos: Array.from({ length: 8 }, (_, i) => alrededor(g - 46 + (92 * i) / 7, R + 0.01, d)),
}));
const juntaTapa = (): Costura => {
  const { angulo, delante, detras, medio } = TAPA, radio = (detras - delante) / 3;
  const borde: P3[] = [];
  for (let i = 0; i <= 8; i++) borde.push(alrededor(angulo - medio + (2 * medio * i) / 8, R + 0.01, detras));
  for (let i = 0; i <= 8; i++) {
    const t = (i / 8) * Math.PI;
    borde.push(alrededor(angulo + medio * Math.cos(t), R + 0.01, delante + radio * (1 - Math.sin(t))));
  }
  borde.push(borde[0]);
  const a = (angulo * Math.PI) / 180;
  return { sobre: ["fuselaje"], desde: [Math.cos(a), Math.sin(a), 0], puntos: borde };
};
// Un punto de la tabla de un ala o una aleta (k: cuál; x: a lo largo, desde
// el eje; f: fracción de la cuerda desde el borde de ataque) y la dirección
// de su cara de fuera (cara 1) o de dentro (cara -1).
const enTabla = (k: number, y: number, ba: number, bs: number, x: number, f: number, cara = 1, alto = 0.02) => {
  const a = ((ROLL + 90 * k) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), yy = y + cara * alto;
  return {
    en: [+(x * ca - yy * sa).toFixed(4), +(x * sa + yy * ca).toFixed(4), z(ba + f * (bs - ba))] as P3,
    desde: [+(-sa * cara).toFixed(4), +(ca * cara).toFixed(4), 0] as P3,
  };
};
const enAla = (k: number, x: number, f: number, cara = 1, alto = 0.02) => enTabla(k, R, ALA.ba, ALA.bs, x, f, cara, alto);
const enAleta = (k: number, x: number, f: number, cara = 1, alto = 0.02) => enTabla(k, R_ALETA, ALETA.ba, ALETA.bs, x, f, cara, alto);
const K4 = [0, 1, 2, 3];
// En cada ala (render f084 y f078): la junta a lo largo, cerca del borde de
// salida, hasta la junta de la punta, que la cruza de lado a lado; por las
// dos caras.
const JUNTA_PUNTA = ALA.punta - SALIENTE;
const juntasAla: Costura[] = K4.flatMap((k) => [1, -1].flatMap((c): Costura[] => [
  { sobre: [`ala-${k}`], desde: enAla(k, 0, 0, c).desde, puntos: [enAla(k, R + 0.01, 0.83, c).en, enAla(k, JUNTA_PUNTA, 0.83, c).en] },
  { sobre: [`ala-${k}`], desde: enAla(k, 0, 0, c).desde, puntos: [enAla(k, JUNTA_PUNTA, 0.01, c).en, enAla(k, JUNTA_PUNTA, 0.99, c).en] },
]));
// En cada aleta, la junta a lo largo, a un tercio del borde de ataque.
const juntasAleta: Costura[] = K4.map((k): Costura => (
  { sobre: [`aleta-${k}`], desde: enAleta(k, 0, 0).desde, puntos: [enAleta(k, R_ALETA + 0.016, 0.3).en, enAleta(k, ALETA.punta - 0.006, 0.3).en] }
));
// Lo pintado en alas y aletas, ala por ala, solo lo que se ve en el render
// (f084 y f078; ala-1 es la de arriba en f084 y ala-2 la de abajo; ala-3, la
// de atrás abajo en f078; de ala-0 no se ve nada pintado). Las caras que no
// se ven, solo con sus juntas.
// - ala-2, cara de dentro: cerca de la punta, las rayas de aviso amarillas y
//   grises y, más adentro, «Autonomous / Technology» en gris (en espejo, como
//   en el render); el tornillo de la junta de la punta y el cierre de metal a
//   media ala.
// - ala-1, cara de fuera: junto a la raíz, «Munition System» a lo largo y un
//   agujero.
// - ala-3, cara de dentro: «Munition System» a lo largo cerca de la punta, el
//   tornillo de la junta y el cierre cerca de la raíz.
// En las aletas, rayas pequeñas cerca de la punta.
const RAYAS = { tipo: "rayas", color: "#dfe37a", fondo: "#9ba0a5" } as const;
const GRIS_LETRA = "#8a8f95";
const MUNITION = { tipo: "texto", texto: "Munition System", color: GRIS_LETRA, fino: true } as const;
const TORNILLO = { tipo: "disco", color: "#9aa0a6" } as const;
const CIERRE = { tipo: "rect", color: "#a9afb5" } as const;
const calca = (sobre: string, p: { en: P3; desde: P3 }, tam: [number, number], dibujo: Calca["dibujo"], giro?: number): Calca => ({ sobre: [sobre], ...p, tam, dibujo, ...(giro !== undefined && { giro }) });
const CALCAS_TABLAS: Calca[] = [
  calca("ala-2", enAla(2, JUNTA_PUNTA - 0.018, 0.42, -1), [0.062, 0.011], RAYAS),
  calca("ala-2", enAla(2, JUNTA_PUNTA - 0.045, 0.45, -1), [0.05, 0.013], { tipo: "texto", texto: "Autonomous\nTechnology", color: GRIS_LETRA, fino: true, espejo: true }),
  calca("ala-2", enAla(2, JUNTA_PUNTA - 0.005, 0.87, -1), [0.0032, 0.0032], TORNILLO),
  calca("ala-2", enAla(2, JUNTA_PUNTA - 0.155, 0.7, -1), [0.045, 0.01], CIERRE),
  calca("ala-1", enAla(1, 0.048, 0.22), [0.042, 0.006], MUNITION, -90),
  calca("ala-1", enAla(1, 0.032, 0.84), [0.0035, 0.0035], { tipo: "disco", color: "#2a2c30" }),
  calca("ala-3", enAla(3, JUNTA_PUNTA - 0.055, 0.53, -1), [0.042, 0.006], MUNITION, -90),
  calca("ala-3", enAla(3, JUNTA_PUNTA - 0.005, 0.87, -1), [0.0032, 0.0032], TORNILLO),
  calca("ala-3", enAla(3, JUNTA_PUNTA - 0.2, 0.7, -1), [0.045, 0.01], CIERRE),
  ...K4.map((k) => calca(`aleta-${k}`, enAleta(k, ALETA.punta - 0.02, 0.45), [0.026, 0.006], RAYAS)),
];
// En el cuerpo: tornillos en el tramo de las aletas y en el collarín, y
// debajo, detrás de la joroba, la ranura con su agujero (render f116).
const CALCAS_CUERPO: Calca[] = [
  ...[70, 110].map((g): Calca => ({ sobre: ["fuselaje"], en: alrededor(g, COLA.r, COLA.junta + 0.008), desde: [Math.cos((g * Math.PI) / 180), Math.sin((g * Math.PI) / 180), 0], tam: [0.0035, 0.0035], dibujo: { tipo: "disco", color: "#9aa0a6" } })),
  // Los dos tornillos del borde de arriba de la tapa en D (render f078).
  ...[TAPA.detras - 0.012, TAPA.delante + 0.02].map((d): Calca => {
    const g = TAPA.angulo - TAPA.medio - 6, a = (g * Math.PI) / 180;
    return { sobre: ["fuselaje"], en: alrededor(g, R, d), desde: [+Math.cos(a).toFixed(4), +Math.sin(a).toFixed(4), 0], tam: [0.0035, 0.0035], dibujo: TORNILLO };
  }),
  { sobre: ["collarin"], en: alrededor(-25, COLLARIN.r, COLLARIN.detras - 0.006), desde: [0.9, -0.42, 0], tam: [0.0045, 0.0045], dibujo: { tipo: "disco", color: "#9aa0a6" }, espejo: true },
  { sobre: ["fuselaje"], en: [0, -R, z(0.205)], desde: [0, -1, 0.02], tam: [0.0028, 0.018], dibujo: { tipo: "rect", color: "#2a2c30" } },
  { sobre: ["fuselaje"], en: [0, -R, z(0.226)], desde: [0, -1, 0.02], tam: [0.004, 0.004], dibujo: { tipo: "disco", color: "#2a2c30" } },
];
const COSTURAS: Costura[] = [...anilloJunta(0.375), ...anilloJunta(0.505), juntaTapa(), ...juntasAla, ...juntasAleta];

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const ids = (re: RegExp, piezas: Pieza[]) => piezas.map((p) => p.id).filter((id) => re.test(id));
const medioPata = entre(arranquePata(1), piePata(1), 0.5);
const PARTES: Parte[] = [
  {
    nombre: "Cámara EO/IR",
    en: [0, BOLA.y - 0.004, z(0.001)],
    piezas: ["capota", "cabeza", "bola", "objetivo-aro", "objetivo-cristal", "camara-chica-aro", "camara-chica", "joroba"],
    respaldo: "foto",
    fuentes: ["render", "ila-frente", "boca-hu"],
    texto: "En el morro, una bola que gira bajo una capota, con la cámara de día y la térmica. El operador ve en directo lo que ve el dron, elige el blanco y puede seguirlo solo con un seguidor de imagen.",
    nota: "Qué cámara va detrás de cada objetivo no se publica.",
  },
  {
    nombre: "Alas en X",
    en: [0.148, 0.206, z(0.43)],
    piezas: [...ids(/^ala-/, PIEZAS), ...ids(/^pasador-/, PIEZAS)],
    respaldo: "foto",
    fuentes: ["ila", "render", "boca-hu"],
    texto: "Cuatro alas en X, de 0,8 m de punta a punta. No salen del centro del cuerpo: cada una gira sobre un pasador y, dentro del tubo, van plegadas hacia atrás, enrolladas alrededor del cuerpo. Al salir se abren solas.",
  },
  {
    nombre: "Aletas de la cola",
    en: [0.11, -0.06, z(0.69)],
    piezas: [...ids(/^aleta-/, PIEZAS), ...ids(/^bisagra-/, PIEZAS)],
    respaldo: "foto",
    fuentes: ["ila", "checa"],
    texto: "Otras cuatro aletas más pequeñas en la cola, en la misma X, que se pliegan igual que las alas.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.03, z(0.78)],
    piezas: ["motor", "buje", "horquilla-0", "horquilla-1", "helice"],
    respaldo: "foto",
    fuentes: ["ila", "rhk", "defensenews"],
    texto: "Un motor eléctrico en la cola con una hélice de dos palas que empuja desde atrás. Las palas se pliegan para caber en el tubo. Hace poco ruido y apenas da calor, así que cuesta oírlo y verlo con una cámara térmica.",
  },
  {
    nombre: "Cuerpo y cabeza de combate",
    en: [R, 0, z(0.3)],
    piezas: ["fuselaje", "collarin"],
    respaldo: "fabricante",
    fuentes: ["fabricante", "folleto"],
    texto: "Un tubo de 8 cm con la cabeza de combate, de medio kilo: antipersonal o anticarro, con espoleta de impacto, de proximidad o de retardo. Hasta segundos antes del impacto el operador puede abortar y volver a merodear.",
    nota: "Dónde va la cabeza de combate dentro del cuerpo no se publica.",
  },
  {
    nombre: "Varilla bajo el morro",
    en: [0, -0.0645, z(0.145)],
    piezas: ["varilla-baja", "varilla-punta"],
    respaldo: "foto",
    fuentes: ["render", "ila", "boca-hu"],
    texto: "Una varilla corta en L bajo el cuerpo, detrás de la cabeza, que baja y apunta hacia delante.",
    nota: "Se ve en todas las fotos, pero no se publica para qué sirve.",
  },
  {
    nombre: "Tubo lanzador",
    en: [0, TUBO.r, zs(0.45)],
    piezas: ids(/^(tubo|bloque|banda|correa|botella)/, piezasLanzadera),
    respaldo: "foto",
    fuentes: ["checa", "tubo-hu", "alemana"],
    texto: "El dron viaja plegado en un tubo que hace de contenedor y de lanzador, y que un soldado lleva a la espalda. Se apoya en el suelo, inclinado, y el aire comprimido de la botella lo dispara sin fogonazo y casi sin ruido. En menos de dos minutos está en el aire.",
    nota: "El tubo es el de la feria checa (el del Ejército húngaro es oliva, con otros bloques). Las medidas son de la foto de perfil, a escala con el grueso del tubo: 1,07 m con los bloques; la ficha da 95 cm de contenedor.",
    catapulta: true,
  },
  {
    nombre: "Bípode",
    en: medioPata,
    piezas: ["patas-abrazadera", "pata-0", "pata-1", "pata-punta-0", "pata-punta-1"],
    respaldo: "foto",
    fuentes: ["checa", "tubo-hu"],
    texto: "Dos patas plegables con puntas de metal, a un tercio de la boca, que dejan el tubo con la inclinación de lanzamiento; la culata apoya en el suelo.",
    catapulta: true,
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: P2): P2 => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  const q = aUnidadesForma(p);
  return p.girar ? { ...q, girar: { ...p.girar, centro: u3(p.girar.centro) } } : q;
};
const aUnidadesForma = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo) })) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, s]) => (s === undefined ? [u(x), u(a), u(b), u(t)] : [u(x), u(a), u(b), u(t), u(s)]) as typeof p.estaciones[number]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto), ...(p.chaflanArriba && { chaflanArriba: u2(p.chaflanArriba) }), ...(p.chaflanAbajo && { chaflanAbajo: u2(p.chaflanAbajo) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

const calcaAUnidades = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const costuraAUnidades = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "Hero-30",
  subtitulo: "Munición merodeadora portátil",
  escala: ESCALA,  // 1 unidad = 30 cm
  pais: bandera("IL"),
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  // La pintura al sol cae a 5,95 escalones en el ala desde arriba (en el
  // borde): +0,5 la lleva al centro del de arriba.
  desfaseLuz: 0.5,
  // La tarjeta, del ángulo que eligió el usuario en el visor (captura
  // encajada: casi de perfil, con el morro a la izquierda).
  vistaTarjeta: [69, 4],
  // En la planta de la portada, solo las alas y aletas de arriba: las de
  // abajo asomaban corridas (el molinillo) como una mancha gris.
  plantaSin: ["ala-2", "ala-3", "aleta-2", "aleta-3", "pasador-2", "pasador-3", "bisagra-2", "bisagra-3"],
  detalles: { calcas: [...CALCAS, ...CALCAS_TABLAS, ...CALCAS_CUERPO].map(calcaAUnidades), costuras: COSTURAS.map(costuraAUnidades), opacidad: { juntas: 0.5 } },
  catapulta: { piezas: piezasLanzadera.map(aUnidades), cabeceo: CABECEO, nombre: "Lanzadera", detalles: { calcas: CALCAS_LANZADERA.map(calcaAUnidades), costuras: COSTURAS_LANZADERA.map(costuraAUnidades), opacidad: { juntas: 0.45 } } },
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "ila", imagen: "c-ila-a.jpg", titulo: "Con las marcas de UVision y Rheinmetall, en la ILA de Berlín (2022)", medio: "Boevaya mashina (Wikimedia Commons)", url: `${COMMONS}Uvision_Hero-30_ILA-2022.jpg` },
    { id: "ila-frente", imagen: "c-ila-frente.jpg", titulo: "De frente: la cámara y las alas en X (ILA 2022)", medio: "Boevaya mashina (Wikimedia Commons)", url: `${COMMONS}Uvision_Hero-30_front_ILA-2022.jpg` },
    { id: "render", imagen: "render-uvision.jpg", titulo: "El dron montado, en la animación de su web", medio: "UVision", url: "https://uvisionuav.com/loitering-munitions/hero-30/" },
    { id: "boca-hu", imagen: "hu-3.jpg", titulo: "Plegado dentro del tubo: la cámara y las alas enrolladas", medio: "Balogh Ákos, honvedelem.hu (vía X)", url: "https://x.com/RyszardJonski/status/1934896848461762628" },
    { id: "tubo-hu", imagen: "hu-1.jpg", titulo: "El tubo del Ejército húngaro sobre su bípode (2025)", medio: "Balogh Ákos, honvedelem.hu (vía X)", url: "https://x.com/RyszardJonski/status/1934896848461762628" },
    { id: "alemana", imagen: "de-1.jpg", titulo: "Saliendo del tubo oliva, en una feria alemana (2025)", medio: "MartinRosenkra3 (X)", url: "https://x.com/MartinRosenkra3/status/1928836402994667974" },
    { id: "checa", imagen: "c-reise-2.jpg", titulo: "Saliendo de un tubo negro, de lado, en una feria checa", medio: "Reise Reise (Wikimedia Commons)", url: `${COMMONS}UVision_Hero-30_(2).jpg` },
    { id: "rhk", imagen: "c-rhk-2022.jpg", titulo: "Con la cola en la boca del tubo y la hélice a ras", medio: "Rhk111 (Wikimedia Commons)", url: `${COMMONS}2022-04-27_Hero-30_Drone.jpg` },
    { id: "instruccion", imagen: "ar-1.jpg", titulo: "Un ejemplar de instrucción del Ejército argentino (2023)", medio: "Zona Militar (vía X)", url: "https://x.com/SA_Defensa/status/1733193453897728066" },
    { id: "fabricante", titulo: "HERO 30", medio: "UVision", url: "https://uvisionuav.com/loitering-munitions/hero-30/" },
    { id: "folleto", titulo: "HERO 30. Man-Portable Loitering Munition for the Maneuvering Forces", medio: "UVision", url: "https://uvisionuav.com/wp-content/uploads/2025/05/Hero-30-2024.pdf" },
    { id: "defensenews", titulo: "Man-packable kamikaze drones offer front-line tracking and strike packages", medio: "Defense News", url: "https://www.defensenews.com/news/your-army/2018/10/09/man-packable-kamikaze-drones-offer-front-line-tracking-and-strike-packages/" },
  ],
};

export default maqueta;
