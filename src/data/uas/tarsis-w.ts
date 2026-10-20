// Maqueta del TARSIS-W de AERTEC (hoy Indra), el gris rotulado «TARSIS-W»,
// con un lanzador bajo cada semiala con dos micromisiles Fox. Medidas de AERTEC (6,2 m de envergadura, 4,3 m de
// largo); la forma, de las fotos de pista (perfil, tres cuartos por delante y
// por detrás, de frente con los lanzadores) y de la de vuelo desde abajo.
// Cola, botalones, tren del morro y hélice, como los del TARSIS 75 (la misma
// familia), a la medida del W. Todo en arte/uas-fuentes/tarsis-w/ (fuera de
// Git). En metros, con y = 0 a media altura del fuselaje y z = 0 a mitad de
// la cuerda del ala, y al final se pasa a unidades de la maqueta.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.4;

const AERTEC = "https://aertecsolutions.com/";
const INDRA = "https://www.indracompany.com/";
const FOLLETO = "https://aertecsolutions.com/wp-content/uploads/2025/05/AERTEC_TARSIS_W_ES-uas.pdf";
const EDR = "https://www.edrmagazine.eu/";

type P2 = [number, number];
type P3 = [number, number, number];
const LADOS = [1, -1];

// ── Fuselaje ───────────────────────────────────────────────────────────────
// Una góndola de 3 m, casi tan ancha como alta (0,40 por 0,43 m), de lomo
// plano con las esquinas redondas, costados rectos y la panza redonda. El
// morro, largo, por delante del ala: el lomo cae en curva hasta una punta
// algo por encima de la mitad y la panza sube recta hasta ella. Una arista
// viva corre por el costado desde la punta, a media altura, y sube hasta la
// esquina del lomo en la junta del morro: encima, un techo inclinado; debajo,
// el costado recto (perfil y tres cuartos por delante y por detrás). Detrás del ala, una joroba a cada lado (la
// culata del motor, con la toma de aire delante) y la cola redonda, que se
// cierra en el buje de la hélice (tres cuartos por detrás).
const PUNTA_Z = 2.12;
const COLA_Z = -0.83;
const JUNTA_MORRO = PUNTA_Z - 0.6;
const PUNTA_Y = 0.05;

// Medidas de cada sección: d, distancia a la punta; lomo y panza; medio
// ancho; g y k, la arista: cuánto queda por debajo del lomo y a qué fracción
// del medio ancho; a, en grados, cuánto dobla ahí (0: sin arista); yw, dónde
// acaba la curva del costado de arriba; rb, alto de la esquina redonda de
// abajo, y xp, la fracción del medio ancho donde empieza la panza plana.
type Med = { d: number; top: number; bot: number; w: number; g: number; k: number; a: number; yw: number; rb: number; xp: number };
// El morro, de 0,6 m, redondo en planta (una U ancha, no una punta). De
// perfil (fotos 29 y 31): el lomo cae en una curva suave hasta la punta; la
// panza sube de golpe al principio y luego en una cuesta casi recta, con una
// arista abajo entre el costado y la cara de debajo.
const MORRO: Med[] = [
  { d: 0.012, top: 0.068, bot: 0.036, w: 0.036, g: 0.017, k: 0.74, a: 26, yw: 0.052, rb: 0.016, xp: 0.65 },
  { d: 0.03, top: 0.08, bot: 0.025, w: 0.056, g: 0.018, k: 0.74, a: 26, yw: 0.047, rb: 0.016, xp: 0.64 },
  { d: 0.06, top: 0.094, bot: 0.013, w: 0.076, g: 0.02, k: 0.74, a: 25, yw: 0.046, rb: 0.018, xp: 0.63 },
  { d: 0.1, top: 0.108, bot: 0.0, w: 0.096, g: 0.022, k: 0.74, a: 25, yw: 0.051, rb: 0.019, xp: 0.62 },
  { d: 0.16, top: 0.13, bot: -0.022, w: 0.116, g: 0.026, k: 0.74, a: 24, yw: 0.062, rb: 0.022, xp: 0.59 },
  { d: 0.22, top: 0.148, bot: -0.04, w: 0.132, g: 0.03, k: 0.74, a: 23, yw: 0.07, rb: 0.024, xp: 0.57 },
  { d: 0.3, top: 0.172, bot: -0.067, w: 0.147, g: 0.035, k: 0.74, a: 22, yw: 0.083, rb: 0.028, xp: 0.55 },
  { d: 0.38, top: 0.19, bot: -0.093, w: 0.158, g: 0.04, k: 0.74, a: 21, yw: 0.092, rb: 0.031, xp: 0.52 },
  { d: 0.46, top: 0.203, bot: -0.125, w: 0.165, g: 0.045, k: 0.74, a: 20, yw: 0.098, rb: 0.035, xp: 0.49 },
  { d: 0.5, top: 0.207, bot: -0.16, w: 0.167, g: 0.048, k: 0.74, a: 19, yw: 0.098, rb: 0.037, xp: 0.48 },
  { d: 0.54, top: 0.211, bot: -0.2, w: 0.169, g: 0.05, k: 0.74, a: 19, yw: 0.099, rb: 0.038, xp: 0.46 },
  { d: 0.58, top: 0.214, bot: -0.213, w: 0.17, g: 0.053, k: 0.74, a: 18, yw: 0.099, rb: 0.04, xp: 0.45 },
];
// El cuerpo, con la arista del costado de arriba a todo lo largo (la luz
// cambia en ella en las fotos 3 y 30). Del ala hacia atrás la panza sube y
// deja ver el motor por debajo (fotos 32 y 3).
const PANZA_MOTOR = { z0: -0.1, z1: -0.24, bot: -0.175 };
const CUERPO = (d: number): Med => {
  const z = PUNTA_Z - d, t = Math.min(1, Math.max(0, (PANZA_MOTOR.z0 - z) / (PANZA_MOTOR.z0 - PANZA_MOTOR.z1)));
  const s = t * t * (3 - 2 * t);
  return { d, top: 0.215, bot: -0.215 + s * (0.215 + PANZA_MOTOR.bot), w: 0.17, g: 0.053, k: 0.74, a: 18, yw: 0.1 - 0.02 * s, rb: 0.04, xp: 0.45 };
};

// La toma de cada costado (fotos 32, 3 y 31): una pieza en D que sale `sale`
// en su centro, a la altura y, con medio alto h; detrás, redonda, justo
// antes de la cola; delante, el frente recto con la boca. Delante de la
// boca, la cavidad: el costado se hunde hasta `hondo` en la boca y la hondura
// se estrecha y se acaba en `punta`.
const JOROBA = { z0: -0.38, z1: -0.7, y: -0.03, h: 0.09, sale: 0.07, punta: -0.2, hondo: 0.045 };
const tamJoroba = (z: number) => {
  const s = (JOROBA.z0 - z) / (JOROBA.z0 - JOROBA.z1);
  if (s <= 0 || s >= 1) return 0;
  const frente = Math.min(1, s / 0.03) ** 0.5;
  return frente * (1 - s) ** 0.8;
};
const joroba = (z: number) => JOROBA.sale * tamJoroba(z);
// La cavidad delante de la boca: honda y alta en la boca, y cada vez menos
// hacia delante, hasta la punta.
const cavidad = (z: number) => {
  const q = (z - JOROBA.z0) / (JOROBA.punta - JOROBA.z0);
  if (q < -0.02 || q >= 1) return { hondo: 0, alto: 0 };
  const f = Math.min(1, Math.max(0, q));
  return { hondo: JOROBA.hondo * (1 - f) ** 0.8, alto: 0.85 * JOROBA.h * (1 - f) ** 0.5 };
};
// La cola: de z0 hacia atrás, la sección encoge en redondo hasta `fin`.
const CUPULA = { z0: COLA_Z + 0.3, fin: 0.24 };
const encoge = (z: number) => {
  const t = Math.min(1, Math.max(0, (CUPULA.z0 - z) / (CUPULA.z0 - COLA_Z)));
  return CUPULA.fin + (1 - CUPULA.fin) * Math.sqrt(1 - t * t);
};
// Y su centro sube hasta el buje, algo por encima de la mitad (tres cuartos
// por delante y por detrás).
const BUJE_Y = 0.04;
const subeCola = (z: number) => (BUJE_Y * (1 - encoge(z))) / (1 - CUPULA.fin);

const bezier = (p: P2[], n: number): P2[] => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, s = 1 - t;
  return (p.length === 3
    ? [0, 1].map((c) => s * s * p[0][c] + 2 * s * t * p[1][c] + t * t * p[2][c])
    : [0, 1].map((c) => s * s * s * p[0][c] + 3 * s * s * t * p[1][c] + 3 * s * t * t * p[2][c] + t * t * t * p[3][c])) as P2;
});
const rad = (g: number) => (g * Math.PI) / 180;
// Media sección (x ≥ 0) en dos tramos: el lomo hasta la arista y, de ahí,
// el costado, la esquina redonda y la panza. Sin arista (a = 0), el segundo
// tramo sale con la dirección del primero y no se nota la junta.
const contorno = (m: Med, z: number): P2[][] => {
  const xc = m.k * m.w, yc = m.top - m.g;
  const lomo = bezier([[0, m.top], [0.55 * xc, m.top], [xc, yc]], 10);
  const t = Math.atan2(yc - m.top, 0.45 * xc) - rad(m.a);
  const L = 0.45 * Math.hypot(m.w - xc, yc - m.yw);
  const costado = bezier([[xc, yc], [xc + L * Math.cos(t), yc + L * Math.sin(t)], [m.w, m.yw + 0.45 * (yc - m.yw)], [m.w, m.yw]], 12);
  const ys = m.bot + m.rb, xb = m.xp * m.w;
  const recto = Array.from({ length: 60 }, (_, i): P2 => [m.w, m.yw + ((ys - m.yw) * (i + 1)) / 60]);
  const esquina = Array.from({ length: 12 }, (_, i): P2 => {
    const a = ((i + 1) / 12) * (Math.PI / 2);
    return [xb + (m.w - xb) * Math.cos(a), ys - m.rb * Math.sin(a)];
  });
  const bajo: P2[] = [...costado.slice(1), ...recto, ...esquina, [0, m.bot]];
  // La joroba, en lo recto del costado; la cola, encogida.
  const j = joroba(z), h = JOROBA.h * Math.max(0.05, tamJoroba(z)) ** 0.5, f = encoge(z);
  const cav = cavidad(z);
  const conJoroba = bajo.map(([x, y]): P2 => {
    if (x <= 0.6 * m.w) return [x, y];
    const r = (y - JOROBA.y) / h, rc = cav.alto ? (y - JOROBA.y) / cav.alto : 9;
    return [x + (Math.abs(r) < 1 ? j * (1 - r * r) ** 1.6 : 0) - (Math.abs(rc) < 1 ? cav.hondo * (1 - rc * rc) ** 0.6 : 0), y];
  });
  const sube = subeCola(z);
  return [lomo, [[xc, yc], ...conJoroba]].map((tr) => tr.map(([x, y]): P2 => [x * f, y * f + sube]));
};
const punto: P2[] = [[0, PUNTA_Y], [0, PUNTA_Y]];
const seccion = (m: Med): Seccion => {
  const z = PUNTA_Z - m.d, q = contorno(m, z), f = encoge(z);
  return { z, ancho: (m.w + joroba(z)) * f, arriba: m.top * f + subeCola(z), abajo: m.bot * f + subeCola(z), contorno: q };
};
// Del ala a la cola, más secciones donde están la joroba y la cola redonda.
const Z_COLA = [0.2, -0.04, ...Array.from({ length: 12 }, (_, i) => -0.1 - (0.27 * i) / 12), ...Array.from({ length: 121 }, (_, i) => JOROBA.z0 + 0.02 - ((JOROBA.z0 + 0.02 - COLA_Z) * i) / 120)];
const FUSELAJE: Seccion[] = [
  { z: PUNTA_Z, ancho: 0, arriba: PUNTA_Y, abajo: PUNTA_Y, contorno: [punto, punto] },
  ...MORRO.map(seccion),
  ...[0.62, 1.4, ...Z_COLA.map((z) => PUNTA_Z - z)].map((d) => seccion(CUERPO(d))),
];
// La boca de cada toma: lo oscuro, solo dentro, en el frente de la pieza en
// D, entre el fondo de la cavidad y el borde de fuera (con su labio).
const BOCA: P2[] = (() => {
  const { hondo, alto } = cavidad(JOROBA.z0), n = 16, ys = Array.from({ length: n + 1 }, (_, i) => JOROBA.y + 0.9 * alto * Math.cos((Math.PI * i) / n));
  const dentro = ys.map((y): P2 => [CUERPO(0).w - hondo * Math.max(0, 1 - ((y - JOROBA.y) / alto) ** 2) ** 0.6 + 0.004, y]);
  const fuera = ys.map((y): P2 => [CUERPO(0).w + JOROBA.sale * Math.max(0, 1 - ((y - JOROBA.y) / JOROBA.h) ** 2) ** 1.6 - 0.01, y]);
  return [...fuera, ...dentro.reverse()];
})();

// ── Ala ────────────────────────────────────────────────────────────────────
// Media, algo por encima de la mitad del fuselaje (de frente), recta y de
// cuerda constante, sin diedro: 6,2 m de punta a punta (AERTEC). En el borde
// de salida, el flap por dentro, del fuselaje a pasado el botalón, y el
// alerón por fuera, que se queda antes de la punta; entre los dos, un trozo
// de ala entera (tres cuartos por detrás).
const ALA = { y: 0.04, punta: 3.1, ba: 0.25, bs: -0.25, t: 0.065 };
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = ALA.bs): Est => [x, ALA.ba, bs, ALA.t, 0];
const MANDO = { cuerda: 0.13, flap: [0.2, 1.25], aleron: [1.35, 2.85] };
const HUECO = 0.006;
// Donde empieza y acaba cada mando, el borde de salida del ala pasa poco a
// poco (en PASO) de la cuerda entera a la bisagra: con un escalón en la misma
// x sale una línea que parpadea a lo largo del ala.
const PASO = 0.012;
const bisagra = (m: { cuerda: number }) => ALA.bs + m.cuerda;
const estMando = (m: { cuerda: number }, x: number, grueso: number): Est => [x, bisagra(m) - HUECO, ALA.bs, grueso, 0];
const BAJO_ALA = ALA.y - 0.3 * ALA.t;

// ── Botalones y cola ───────────────────────────────────────────────────────
// Dos botalones de sección casi cuadrada colgados del ala hasta las derivas;
// entre ellas, el estabilizador, a media altura de la deriva (de frente).
// Cada deriva, con el borde de salida recto y el de ataque en flecha, el
// timón en los últimos 13 cm y la tapa oscura arriba (de frente y perfil).
const BOTALON = { x: 0.65, y: -0.065, medio: 0.04, desde: 0.27, hasta: -2.18, negro: -2.1 };
const DERIVA = { y: BOTALON.y + BOTALON.medio, alto: 0.55, baRaiz: -1.68, baPunta: -1.88, bs: -2.18, timon: 0.13 };
const baDeriva = (h: number) => DERIVA.baRaiz + ((DERIVA.baPunta - DERIVA.baRaiz) * h) / DERIVA.alto;
const ESTAB = { y: DERIVA.y + 0.25, ba: -1.9, bs: -2.16, t: 0.03, timon: 0.07 };
const seccionBotalon = (z: number, f = 1, sube = 0): Seccion => ({ z, ancho: BOTALON.medio * f, arriba: BOTALON.y + BOTALON.medio * f + sube, abajo: BOTALON.y - BOTALON.medio * f, n: 3.6, nAbajo: 3.6 });
const SUBE_BOTALON = BAJO_ALA - (BOTALON.y + BOTALON.medio) + 0.01;

// ── Tren ───────────────────────────────────────────────────────────────────
// Triciclo fijo. Las principales, en ballestas anchas de perfil y finas de
// frente, del color del avión: salen de bajo el costado casi en horizontal y
// se curvan hacia abajo hasta el eje de la rueda, que llevan por dentro, con
// el tapacubos de aluminio por fuera (de frente, perfil y tres cuartos por
// detrás). La del morro, la misma que la del TARSIS 75: un tubo de metal con
// el amortiguador detrás, un collar y un brazo de dos chapas.
const SUELO = -0.62;
const PRINCIPAL = { r: 0.11, ancho: 0.06, x: 0.53, z: -0.13 };
const MORRO_TREN = { r: 0.075, ancho: 0.04, z: 1.36, collar: SUELO + 0.195, rueda: 1.34 };
const EJE_PRINCIPAL = SUELO + PRINCIPAL.r;

const rueda = (id: string, [x, y, z]: P3, r: number, ancho: number): Pieza[] => {
  const tumbar = { centro: [x, y, z] as P3, eje: "y" as const, grados: 90 };
  const torno = (q: P2[]) => q.map(([dz, rr]): P2 => [z + dz, rr]);
  const a = ancho / 2;
  return [
    { tipo: "tubo", id, acabado: "negro-ua", centro: [x, y], girar: tumbar,
      perfil: torno([[-a, r * 0.55], [-a, r * 0.78], [-a * 0.85, r * 0.92], [-a * 0.5, r * 0.99], [0, r], [a * 0.5, r * 0.99], [a * 0.85, r * 0.92], [a, r * 0.78], [a, r * 0.55]]) },
    { tipo: "tubo", id: `${id}-llanta`, acabado: "junta", centro: [x, y], girar: tumbar,
      perfil: torno([[-a * 0.8, 0], [-a * 0.8, r * 0.5], [-a * 0.85, r * 0.58], [a * 0.85, r * 0.58], [a * 0.8, r * 0.5], [a * 0.8, 0]]) },
    { tipo: "tubo", id: `${id}-buje`, acabado: "metal", centro: [x, y], girar: tumbar,
      perfil: torno([[-a * 1.1, 0], [-a * 1.1, r * 0.14], [-a * 0.9, r * 0.2], [a * 0.9, r * 0.2], [a * 1.1, r * 0.14], [a * 1.1, 0]]) },
  ];
};

// ── Lanzadores y Fox ───────────────────────────────────────────────────────
// Bajo cada semiala, por fuera del botalón, una plataforma plana casi pegada
// al ala y, de ella, en dos postes cortos, un raíl por misil, con su Fox
// colgado de dos tetones (de frente y foto del lanzador de la FEINDEF 2023).
// Los dos Fox, uno al lado del otro.
// El Fox (folleto de AERTEC y fotos de la FEINDEF): 900 mm, 50 mm de
// calibre; azul grisáceo, la cúpula de cristal del buscador delante, el
// cuerpo en tramos con sus juntas, cuatro aletas pequeñas en X hacia un
// tercio, la banda amarilla detrás de ellas y cuatro aletas en flecha en la
// cola, con la tobera.
const PILON = { x: 1.3, z: 0.05, largo: 0.42 };
const PLATAFORMA = { y: BAJO_ALA - 0.022, ancho: 0.27, grueso: 0.03 };
const TRAVIESA = { y: PLATAFORMA.y - PLATAFORMA.grueso / 2 };
const RAIL = { y: TRAVIESA.y - 0.034, ancho: 0.028, largo: 0.5, grueso: 0.009 };
const FOX = { r: 0.025, largo: 0.9, punta: 0.53, sep: 0.09, y: RAIL.y - RAIL.grueso / 2 - 0.007 - 0.025 };
const zFox = (d: number) => FOX.punta - d;
const fox = (x: number, id: string): Pieza[] => {
  const aletas = (nom: string, contorno: P2[], grosor: number): Pieza[] => [45, -45, 135, -135].map((inclinacion, i) => ({
    tipo: "placa", id: `${id}-${nom}-${i}`, acabado: "azul-fox", plano: "vertical", x, y: FOX.y, grosor, bisel: grosor * 0.3, inclinacion, planta: contorno,
  }));
  const r = FOX.r, r2 = r * 0.94;
  return [
    // La cúpula del buscador, en su aro oscuro.
    { tipo: "tubo", id: `${id}-cabeza`, acabado: "lente", centro: [x, FOX.y], perfil: Array.from({ length: 9 }, (_, i): P2 => { const a = (i / 8) * (Math.PI / 2); return [zFox(0.022 * (1 - Math.cos(a))), 0.021 * Math.sin(a)]; }) },
    { tipo: "tubo", id: `${id}-aro`, acabado: "negro", centro: [x, FOX.y], perfil: [[zFox(0.02), 0], [zFox(0.02), 0.022], [zFox(0.024), r], [zFox(0.034), r], [zFox(0.034), 0]] },
    // El cuerpo: el tramo de delante, con las aletas, y el de detrás, algo
    // más fino, hasta la tobera.
    { tipo: "tubo", id, acabado: "azul-fox", centro: [x, FOX.y], perfil: [[zFox(0.033), 0], [zFox(0.033), r], [zFox(0.6), r], [zFox(0.61), r2], [zFox(FOX.largo - 0.02), r2], [zFox(FOX.largo), 0.018], [zFox(FOX.largo), 0]] },
    { tipo: "tubo", id: `${id}-tobera`, acabado: "negro", centro: [x, FOX.y], perfil: [[zFox(FOX.largo - 0.002), 0], [zFox(FOX.largo - 0.002), 0.016], [zFox(FOX.largo + 0.012), 0.013], [zFox(FOX.largo + 0.012), 0]] },
    // Las juntas entre tramos.
    ...[0.13, 0.3, 0.6, 0.76].map((d, i): Pieza => ({ tipo: "tubo", id: `${id}-junta-${i}`, acabado: "junta", centro: [x, FOX.y], perfil: [[zFox(d - 0.003), 0], [zFox(d - 0.003), (d < 0.6 ? r : r2) + 0.0006], [zFox(d + 0.003), (d < 0.6 ? r : r2) + 0.0006], [zFox(d + 0.003), 0]] })),
    { tipo: "tubo", id: `${id}-banda`, acabado: "amarillo", centro: [x, FOX.y], perfil: [[zFox(0.42), 0], [zFox(0.42), r + 0.0008], [zFox(0.455), r + 0.0008], [zFox(0.455), 0]] },
    ...aletas("canard", [[zFox(0.29), r - 0.002], [zFox(0.36), r - 0.002], [zFox(0.355), r + 0.026], [zFox(0.335), r + 0.026]], 0.003),
    ...aletas("cola", [[zFox(0.77), r2 - 0.002], [zFox(0.885), r2 - 0.002], [zFox(0.895), r2 + 0.048], [zFox(0.855), r2 + 0.048]], 0.004),
    // Los dos tetones que lo cuelgan del raíl.
    ...[0.27, 0.57].map((d, i): Pieza => ({ tipo: "caja", id: `${id}-teton-${i}`, acabado: "metal", centro: [x, FOX.y + r + 0.0045, zFox(d)], tam: [0.012, 0.012, 0.024], redondeo: 0.003 })),
  ];
};
const lanzador = (l: number): Pieza[] => {
  const x = l * PILON.x;
  return [
    { tipo: "caja", id: `pilon-${l}`, acabado: "gris-tw", centro: [x, PLATAFORMA.y, PILON.z], tam: [PLATAFORMA.ancho, PLATAFORMA.grueso + 0.012, PILON.largo], redondeo: 0.012 },
    ...[1, -1].flatMap((s): Pieza[] => {
      const xm = x + s * FOX.sep, id = `fox-${l}-${s > 0 ? "a" : "b"}`;
      return [
        ...[0.08, -0.08].map((dz, i): Pieza => ({ tipo: "varilla", id: `poste-${l}-${s}-${i}`, acabado: "metal", desde: [xm, TRAVIESA.y, PILON.z + dz], hasta: [xm, RAIL.y, PILON.z + dz], radio: 0.006, lados: 12 })),
        { tipo: "caja", id: `rail-${l}-${s}`, acabado: "aluminio", centro: [xm, RAIL.y, zFox(0.42)], tam: [RAIL.ancho, RAIL.grueso, RAIL.largo], redondeo: 0.002 },
        ...fox(xm, id),
      ];
    }),
  ];
};

// ── Hélice ─────────────────────────────────────────────────────────────────
// Dos palas negras de madera o carbono, con paso: la raíz redonda y
// estrecha que sale del cubo, la pala ancha hacia un tercio, que se va
// afinando hasta la punta redonda (fotos 32, 3 y 31). En el centro, el cubo
// negro que las aprieta entre dos platos de aluminio con seis tornillos y,
// delante, el volante oscuro del motor (foto 3).
const HELICE = { tipo: "helice" as const, en: [0, BUJE_Y, COLA_Z - 0.06] as P3, radio: 0.38, palas: 2, buje: 0, giro: 75, paso: 0.16 };
const PALA = { ancho: 0.078, forma: [[0.06, 0.14, 0.14], [0.11, 0.18, 0.18], [0.16, 0.42, 0.3], [0.24, 0.58, 0.42], [0.36, 0.6, 0.4], [0.5, 0.54, 0.36], [0.64, 0.47, 0.31], [0.78, 0.4, 0.26], [0.9, 0.32, 0.2], [0.97, 0.22, 0.13], [1, 0.08, 0.04]] as [number, number, number][] };
const HZ = HELICE.en[2];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-tw", secciones: FUSELAJE, abierto: "atras" },
  ...LADOS.map((l): Pieza => ({ tipo: "placa", id: `toma-${l}`, acabado: "hueco", plano: "vertical", x: -(JOROBA.z0 + 0.002), grosor: 0.003, girar: { centro: [0, 0, 0], eje: "y", grados: 90 }, planta: BOCA.map(([x, y]): P2 => [l * x, y]) })),
  // El volante, los platos con sus tornillos y el cubo.
  { tipo: "disco", id: "volante", acabado: "negro", en: [0, BUJE_Y, COLA_Z - 0.006], normal: [0, 0, -1], radio: 0.058, grosor: 0.014 },
  { tipo: "disco", id: "plato", acabado: "aluminio", en: [0, BUJE_Y, HZ + 0.03], normal: [0, 0, -1], radio: 0.045, grosor: 0.008 },
  ...Array.from({ length: 6 }, (_, i): Pieza => {
    const a = (i / 6) * 2 * Math.PI + 0.3;
    return { tipo: "disco", id: `tornillo-${i}`, acabado: "metal", en: [0.034 * Math.cos(a), BUJE_Y + 0.034 * Math.sin(a), HZ + 0.025], normal: [0, 0, -1], radio: 0.006, grosor: 0.004 };
  }),
  { tipo: "tubo", id: "buje", acabado: "negro", centro: [0, BUJE_Y], perfil: [[HZ + 0.026, 0], [HZ + 0.026, 0.032], [HZ - 0.022, 0.032], [HZ - 0.03, 0.026], [HZ - 0.034, 0]] },
  { tipo: "disco", id: "plato-tapa", acabado: "aluminio", en: [0, BUJE_Y, HZ - 0.03], normal: [0, 0, -1], radio: 0.028, grosor: 0.006 },
  { ...HELICE, id: "helice", acabado: "negro", ancho: PALA.ancho, forma: PALA.forma },
  // El motor, que asoma bajo la panza detrás del ala: el cárter, los dos
  // cilindros a los lados con sus aletas y los escapes de cobre que van
  // hacia la cola (fotos 32 y 3).
  { tipo: "caja", id: "carter", acabado: "negro", centro: [0, PANZA_MOTOR.bot - 0.02, -0.6], tam: [0.11, 0.06, 0.3], redondeo: 0.02 },
  ...LADOS.flatMap((l): Pieza[] => [
    { tipo: "varilla", id: `cilindro-${l}`, acabado: "negro", desde: [l * 0.05, PANZA_MOTOR.bot - 0.035, -0.52], hasta: [l * 0.175, PANZA_MOTOR.bot - 0.035, -0.52], radio: 0.03, lados: 20 },
    ...[0.075, 0.09, 0.105, 0.12, 0.135, 0.15].map((x, i): Pieza => ({ tipo: "disco", id: `aleta-${l}-${i}`, acabado: "junta", en: [l * x, PANZA_MOTOR.bot - 0.035, -0.52], normal: [1, 0, 0], radio: 0.04, grosor: 0.004 })),
    { tipo: "varilla", id: `escape-${l}`, acabado: "laton", desde: [l * 0.165, PANZA_MOTOR.bot - 0.045, -0.48], hasta: [l * 0.13, PANZA_MOTOR.bot - 0.055, -0.78], radio: 0.015, lados: 14 },
  ]),
  {
    tipo: "ala", id: "ala", acabado: "gris-tw", y: ALA.y,
    estaciones: [
      estAla(0), ...[MANDO.flap, MANDO.aleron].flatMap(([a, b]) => [estAla(a), estAla(a + PASO, bisagra(MANDO)), estAla(b - PASO, bisagra(MANDO)), estAla(b)]), estAla(ALA.punta),
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "gris-tw", y: ALA.y, estaciones: [estMando(MANDO, MANDO.flap[0] + PASO + HUECO, 0.026), estMando(MANDO, MANDO.flap[1] - PASO - HUECO, 0.026)] },
  { tipo: "ala", id: "alerones", acabado: "gris-tw", y: ALA.y, estaciones: [estMando(MANDO, MANDO.aleron[0] + PASO + HUECO, 0.026), estMando(MANDO, MANDO.aleron[1] - PASO - HUECO, 0.026)] },
  // Botalones, con la punta de delante redonda; bajo el ala suben hasta ella.
  ...LADOS.map((l): Pieza => ({
    tipo: "casco", id: `botalon-${l}`, acabado: "gris-tw", x: l * BOTALON.x,
    secciones: [seccionBotalon(BOTALON.desde, 0.25), seccionBotalon(BOTALON.desde - 0.012, 0.75, SUBE_BOTALON * 0.4), seccionBotalon(BOTALON.desde - 0.035, 1, SUBE_BOTALON), seccionBotalon(ALA.bs, 1, SUBE_BOTALON), seccionBotalon(ALA.bs - 0.2), seccionBotalon(BOTALON.negro)],
  })),
  // Su final, bajo el borde de salida de la deriva, negro (tres cuartos por
  // detrás).
  ...LADOS.map((l): Pieza => ({ tipo: "casco", id: `botalon-punta-${l}`, acabado: "negro-ua", x: l * BOTALON.x, abierto: true, secciones: [seccionBotalon(BOTALON.hasta), seccionBotalon(BOTALON.negro)] })),
  ...LADOS.flatMap((l): Pieza[] => {
    const girar = { centro: [l * BOTALON.x, DERIVA.y, 0] as P3, eje: "z" as const, grados: 180 };
    const bis = DERIVA.bs + DERIVA.timon;
    return [
      { tipo: "ala", id: `deriva-${l}`, acabado: "gris-tw", vertical: true, sola: true, x: l * BOTALON.x, y: DERIVA.y, girar,
        estaciones: [[0, DERIVA.baRaiz, bis, 0.032], [DERIVA.alto - 0.02, baDeriva(DERIVA.alto - 0.02), bis, 0.022]] },
      { tipo: "ala", id: `timon-${l}`, acabado: "gris-tw", vertical: true, sola: true, x: l * BOTALON.x, y: DERIVA.y, girar,
        estaciones: [[0.01, bis - 0.006, DERIVA.bs, 0.015], [DERIVA.alto - 0.02, bis - 0.006, DERIVA.bs, 0.011]] },
      // En la cara de fuera, una antena de barra negra hacia el timón, con la
      // punta azul (fotos 32 y 31).
      { tipo: "varilla", id: `deriva-antena-${l}`, acabado: "negro", desde: [l * (BOTALON.x + 0.024), DERIVA.y + 0.21, -2.09], hasta: [l * (BOTALON.x + 0.024), DERIVA.y + 0.21, -1.95], radio: 0.006, lados: 10 },
      { tipo: "varilla", id: `deriva-antena-punta-${l}`, acabado: "azul", desde: [l * (BOTALON.x + 0.024), DERIVA.y + 0.21, -2.11], hasta: [l * (BOTALON.x + 0.024), DERIVA.y + 0.21, -2.09], radio: 0.007, lados: 10 },
      ...[-2.05, -1.97].map((z, i): Pieza => ({ tipo: "varilla", id: `deriva-antena-pie-${l}-${i}`, acabado: "negro", desde: [l * (BOTALON.x + 0.01), DERIVA.y + 0.21, z], hasta: [l * (BOTALON.x + 0.024), DERIVA.y + 0.21, z], radio: 0.004, lados: 8 })),
      { tipo: "caja", id: `deriva-tapa-${l}`, acabado: "negro", centro: [l * BOTALON.x, DERIVA.y + DERIVA.alto - 0.012, (baDeriva(DERIVA.alto) + DERIVA.bs) / 2 - 0.002], tam: [0.024, 0.026, baDeriva(DERIVA.alto) - DERIVA.bs - 0.004], redondeo: 0.008 },
    ];
  }),
  { tipo: "ala", id: "estabilizador", acabado: "gris-tw", y: ESTAB.y, estaciones: [[0, ESTAB.ba, ESTAB.bs + ESTAB.timon, ESTAB.t], [BOTALON.x, ESTAB.ba, ESTAB.bs + ESTAB.timon, ESTAB.t]] },
  { tipo: "ala", id: "profundidad", acabado: "gris-tw", y: ESTAB.y, estaciones: [[0, ESTAB.bs + ESTAB.timon - 0.006, ESTAB.bs, ESTAB.t * 0.45], [BOTALON.x - 0.012, ESTAB.bs + ESTAB.timon - 0.006, ESTAB.bs, ESTAB.t * 0.45]] },
  // Lanzadores y Fox.
  ...LADOS.flatMap(lanzador),
  // Pitot en la punta del morro.
  { tipo: "tubo", id: "pitot", acabado: "metal", centro: [0, PUNTA_Y], perfil: [[PUNTA_Z - 0.02, 0.009], [PUNTA_Z + 0.1, 0.008], [PUNTA_Z + 0.105, 0.005], [PUNTA_Z + 0.24, 0.005], [PUNTA_Z + 0.245, 0]] },
  // El tren.
  ...LADOS.flatMap((l): Pieza[] => {
    const xe = PRINCIPAL.x - PRINCIPAL.ancho / 2 - 0.016;
    return [
      { tipo: "viga", id: `pata-${l}`, acabado: "gris-tw", arriba: 0.9, abajo: 0.9,
        ruta: [[l * 0.1, -0.1, PRINCIPAL.z, 0.17, 0.024], [l * 0.24, -0.14, PRINCIPAL.z, 0.16, 0.024], [l * 0.35, -0.2, PRINCIPAL.z, 0.145, 0.024], [l * 0.42, -0.28, PRINCIPAL.z, 0.13, 0.024], [l * 0.45, -0.37, PRINCIPAL.z, 0.125, 0.022], [l * (xe - 0.006), EJE_PRINCIPAL + 0.03, PRINCIPAL.z, 0.11, 0.022], [l * xe, EJE_PRINCIPAL - 0.02, PRINCIPAL.z, 0.08, 0.022]] },
      // El eje, de la ballesta a la rueda, y el tapacubos de fuera.
      { tipo: "varilla", id: `eje-${l}`, acabado: "metal", desde: [l * (xe + 0.01), EJE_PRINCIPAL, PRINCIPAL.z], hasta: [l * (PRINCIPAL.x + PRINCIPAL.ancho / 2 + 0.008), EJE_PRINCIPAL, PRINCIPAL.z], radio: 0.009, lados: 12 },
      { tipo: "disco", id: `tapacubos-${l}`, acabado: "aluminio", en: [l * (PRINCIPAL.x + PRINCIPAL.ancho / 2 - 0.004), EJE_PRINCIPAL, PRINCIPAL.z], normal: [l, 0, 0], radio: 0.045, grosor: 0.01 },
      ...rueda(`rueda-${l}`, [l * PRINCIPAL.x, EJE_PRINCIPAL, PRINCIPAL.z], PRINCIPAL.r, PRINCIPAL.ancho),
    ];
  }),
  // La pata del morro.
  { tipo: "varilla", id: "pata-morro", acabado: "aluminio", desde: [0, -0.19, MORRO_TREN.z], hasta: [0, MORRO_TREN.collar, MORRO_TREN.z + 0.02], radio: 0.011, lados: 16 },
  { tipo: "varilla", id: "amortiguador", acabado: "aluminio", desde: [0, SUELO + 0.345, MORRO_TREN.z - 0.025], hasta: [0, MORRO_TREN.collar + 0.01, MORRO_TREN.z - 0.012], radio: 0.005, lados: 12 },
  { tipo: "varilla", id: "muelle", acabado: "negro", desde: [0, SUELO + 0.315, MORRO_TREN.z - 0.024], hasta: [0, SUELO + 0.245, MORRO_TREN.z - 0.019], radio: 0.011, lados: 16 },
  { tipo: "caja", id: "collar", acabado: "aluminio", centro: [0, MORRO_TREN.collar, MORRO_TREN.z + 0.01], tam: [0.062, 0.03, 0.05], redondeo: 0.008 },
  // El brazo: dos chapas, una a cada lado de la rueda, del collar al eje.
  { tipo: "placa", id: "brazo-morro", acabado: "aluminio", plano: "vertical", x: MORRO_TREN.ancho / 2 + 0.008, espejo: true, grosor: 0.006, bisel: 0.002,
    planta: [[MORRO_TREN.z + 0.035, MORRO_TREN.collar + 0.01], [MORRO_TREN.z - 0.01, MORRO_TREN.collar + 0.01], [MORRO_TREN.rueda - 0.016, SUELO + MORRO_TREN.r - 0.005], [MORRO_TREN.rueda - 0.01, SUELO + MORRO_TREN.r - 0.018], [MORRO_TREN.rueda + 0.012, SUELO + MORRO_TREN.r - 0.012], [MORRO_TREN.rueda + 0.016, SUELO + MORRO_TREN.r + 0.01]] },
  ...rueda("rueda-morro", [0, SUELO + MORRO_TREN.r, MORRO_TREN.rueda], MORRO_TREN.r, MORRO_TREN.ancho),
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
const LADO: P3 = [1, 0, 0];
const ARRIBA: P3 = [0, 1, 0];
const GRIS = "#33373a";
// «TARSIS-W»: el «TΛRSIS» calcado del TARSIS 75 con el guion y la W
// trazados con su mismo alto y grueso (src/data/uas/logos.ts).
const ROTULO = { tipo: "logo", logo: "tarsis-w", color: GRIS } as const;
const ROTULO_TAM: [number, number] = [0.13 * (1810 / 350), 0.13];
const ALA_TAM: [number, number] = [0.16 * (1810 / 350), 0.16];
const CALCAS: Calca[] = [
  // En los dos costados, por delante del ala (perfil y tres cuartos).
  ...LADOS.map((l): Calca => ({ sobre: ["fuselaje"], en: [l * 0.25, 0.02, 1.08], desde: [l, 0, 0], tam: ROTULO_TAM, dibujo: ROTULO })),
  // En el extradós de las dos alas, cerca de la punta, al derecho visto desde
  // detrás (tres cuartos por detrás y foto 27).
  ...LADOS.map((l): Calca => ({ sobre: ["ala"], en: [l * 2.3, 0.1, 0.07], desde: ARRIBA, tam: ALA_TAM, giro: 180, dibujo: ROTULO })),
];

// Las tapas del lomo, con sus tornillos: una larga detrás de la junta del
// morro y otra hasta el ala (fotos 30, 3 y 1); la junta del carenado del
// motor, detrás del ala; y en la cara de fuera de cada deriva, una tapa
// pequeña hacia el timón (fotos 32 y 31).
const tapa = (x0: number, x1: number, z0: number, z1: number): P3[] => [[x0, 0.3, z0], [x1, 0.3, z0], [x1, 0.3, z1], [x0, 0.3, z1], [x0, 0.3, z0]];
const COSTURAS: Costura[] = [
  // Junta del morro (tres cuartos por detrás).
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.25, 0.217, JUNTA_MORRO], [0.25, -0.217, JUNTA_MORRO]] },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.2, 0.25, JUNTA_MORRO], [0.2, 0.25, JUNTA_MORRO]] },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: tapa(-0.1, 0.1, JUNTA_MORRO - 0.08, 1.02), remaches: 0.07 },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: tapa(-0.1, 0.1, 0.94, 0.3), remaches: 0.07 },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.2, 0.25, -0.26], [0.2, 0.25, -0.26]] },
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.25, 0.217, -0.26], [0.25, -0.1, -0.26]] },
  ...LADOS.map((l): Costura => ({ sobre: [`deriva-${l}`], desde: [l, 0, 0], enVertices: true,
    puntos: [[l * 0.8, DERIVA.y + 0.16, -1.84], [l * 0.8, DERIVA.y + 0.16, -1.94], [l * 0.8, DERIVA.y + 0.26, -1.94], [l * 0.8, DERIVA.y + 0.26, -1.84], [l * 0.8, DERIVA.y + 0.16, -1.84]] })),
];

const IDS_FOX = (id: string) => [id, `${id}-cabeza`, `${id}-aro`, `${id}-tobera`, `${id}-banda`, ...[0, 1, 2, 3].flatMap((i) => [`${id}-junta-${i}`, `${id}-canard-${i}`, `${id}-cola-${i}`]), `${id}-teton-0`, `${id}-teton-1`];
const PARTES: Parte[] = [
  {
    nombre: "Morro",
    en: [0, 0.3, 1.9],
    piezas: ["fuselaje", "pitot"],
    respaldo: "foto",
    fuentes: ["perfil", "trasera"],
    texto: "Largo y por delante del ala, con la forma de la familia TARSIS: el lomo cae en curva hasta una punta redonda, la panza sube a su encuentro y por el costado corre una arista. Delante, la sonda pitot; en el lomo, las tapas de la electrónica.",
  },
  {
    nombre: "Ala recta",
    en: [2.0, 0.25, 0],
    piezas: ["ala", "flaps", "alerones"],
    respaldo: "foto",
    fuentes: ["trasera", "frente", "folleto"],
    texto: "Unos 6 m de punta a punta, casi un metro más que la del TARSIS 75, y la misma cuerda de la raíz a la punta, con flaps por dentro y alerones por fuera.",
  },
  {
    nombre: "Lanzadores y Fox",
    en: [1.3, -0.3, 0.1],
    piezas: LADOS.flatMap((l) => [`pilon-${l}`, ...[1, -1].flatMap((s) => [`rail-${l}-${s}`, `poste-${l}-${s}-0`, `poste-${l}-${s}-1`, ...IDS_FOX(`fox-${l}-${s > 0 ? "a" : "b"}`)])]),
    respaldo: "foto",
    fuentes: ["frente", "lanzador", "fox"],
    texto: "Bajo cada semiala, un lanzador con dos micromisiles Fox de AERTEC: 90 cm y 3 kg cada uno, guiados por láser hasta unos 4 km. Cuatro en total.",
    nota: "En el TARSIS-W gris no van puestos: los lanzadores, de la foto de pista de frente; los Fox, de las de la FEINDEF.",
  },
  {
    nombre: "Botalones y cola en H",
    en: [0.75, 0.62, -1.85],
    piezas: ["botalon-1", "botalon--1", "deriva-1", "deriva--1", "timon-1", "timon--1", "deriva-tapa-1", "deriva-tapa--1", "estabilizador", "profundidad", ...LADOS.flatMap((l) => [`deriva-antena-${l}`, `deriva-antena-punta-${l}`, `deriva-antena-pie-${l}-0`, `deriva-antena-pie-${l}-1`])],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "abajo"],
    texto: "Dos vigas salen del ala y llevan la cola: dos derivas unidas por el estabilizador, y la hélice gira entre ellas.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.32, -0.6],
    piezas: ["fuselaje", "toma-1", "toma--1", "carter", "cilindro-1", "cilindro--1", "escape-1", "escape--1", "volante", "plato", "plato-tapa", ...Array.from({ length: 6 }, (_, i) => `tornillo-${i}`), "buje", "helice"],
    respaldo: "foto",
    fuentes: ["trasera", "perfil"],
    texto: "El motor va en la cola del fuselaje y asoma por debajo: una toma de aire a cada lado, que lo refrigera, los escapes hacia atrás y la hélice de dos palas detrás.",
    nota: "AERTEC no dice qué motor lleva; los cilindros, supuestos, de lo que asoma en las fotos.",
  },
  {
    nombre: "Tren fijo",
    en: [0.55, SUELO - 0.06, -0.15],
    piezas: ["pata-1", "pata--1", "eje-1", "eje--1", "tapacubos-1", "tapacubos--1", "pata-morro", "amortiguador", "muelle", "collar", "brazo-morro", ...["rueda-morro", "rueda-1", "rueda--1"].flatMap((r) => [r, `${r}-llanta`, `${r}-buje`])],
    respaldo: "foto",
    fuentes: ["perfil", "trasera"],
    texto: "Tres ruedas que no se recogen: despega y aterriza solo en pista, sin piloto a los mandos (ATOL), y puede volver en paracaídas.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: P2): P2 => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura"] as const;
const aSeccion = (q: Seccion): Seccion => {
  const s = { ...q };
  for (const k of LARGOS_SECCION) if (s[k] !== undefined) s[k] = u(s[k]!);
  if (s.contorno) s.contorno = s.contorno.map((t) => t.map(u2));
  return s;
};
const aGiro = (p: Pieza): Pieza => (p.girar ? { ...p, girar: { ...p.girar, centro: u3(p.girar.centro) } } : p);
const aUnidades = (q: Pieza): Pieza => {
  const p = aGiro(q);
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map(aSeccion), ...(p.x !== undefined && { x: u(p.x) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): Est => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    case "viga":
      return { ...p, ruta: p.ruta.map((q) => q.map(u) as typeof q) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "TARSIS-W",
  subtitulo: "Dron armado Clase I",
  escala: ESCALA,  // 1 unidad = 2,4 m
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  vistaTarjeta: [61, 20],
  plantaLisa: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("ES"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "29-usuario-pista-perfil.jpg", titulo: "En pista, de perfil", medio: "Indra", url: INDRA },
    { id: "trasera", imagen: "32-usuario-pista-trasera.jpg", titulo: "En pista, de tres cuartos por detrás", medio: "Indra", url: INDRA },
    { id: "frente", imagen: "01-w-pista-frente.jpg", titulo: "En pista, de frente, con los dos lanzadores", medio: "AERTEC", url: AERTEC },
    { id: "abajo", imagen: "25-usuario-vuelo-abajo.jpg", titulo: "En vuelo, desde abajo", medio: "Indra", url: INDRA },
    { id: "lanzador", imagen: "06-w-feindef23-lanzador.jpg", titulo: "Un lanzador con su Fox bajo el ala (FEINDEF 2023)", medio: "EDR Magazine", url: EDR },
    { id: "fox", imagen: "14-fox-feindef25.jpg", titulo: "Un micromisil Fox en la FEINDEF 2025", medio: "EDR Magazine", url: EDR },
    { id: "feindef23", imagen: "07-w-feindef23-morro-fox.jpg", titulo: "El morro con la torreta y dos Fox (FEINDEF 2023)", medio: "EDR Magazine", url: EDR },
    { id: "folleto", titulo: "TARSIS-W: folleto con la ficha", medio: "AERTEC", url: FOLLETO },
  ],
};

export default maqueta;
