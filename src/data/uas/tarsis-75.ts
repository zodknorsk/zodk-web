// Maqueta del TARSIS 75 de AERTEC (hoy Indra) en su versión blanca
// (TARSIS-ISTAR), con la torreta EO/IR de caja bajo el morro.
// Medidas del folleto de AERTEC (3,82 m de largo, 5,22 m de envergadura,
// botalones a 1,32 m, y las tres vistas a 1:40 de la misma página); la forma,
// de las fotos de AERTEC: el perfil del despegue del Centro ATLAS, la planta
// sobre la costa, las de pista y la del morro con la torreta. Todo en
// arte/uas-fuentes/tarsis-75/ (fuera de Git).
// Todo se escribe en metros, con y = 0 a media altura del fuselaje y z = 0 a
// mitad de la cuerda del ala, y al final se pasa a unidades de la maqueta.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.0;

const AERTEC = "https://aertecsolutions.com/";
const FOLLETO = "https://aertecsolutions.com/wp-content/uploads/2025/05/tarsis75.pdf";
const ATLAS = "https://commons.wikimedia.org/wiki/File:AERTEC-TARSIS-CentroATLAS-20230330-004.jpg";

type P2 = [number, number];
type P3 = [number, number, number];
const LADOS = [1, -1];

// ── Fuselaje ───────────────────────────────────────────────────────────────
// Una góndola de 2,57 m, de costados rectos y lomo plano con las esquinas
// redondas (más ancha que alta: 0,37 por 0,34 m). El morro es la pieza que
// le da la cara: el lomo cae en curva hasta una punta algo por encima de la
// mitad, la panza sube más deprisa hasta ella y, entre el lomo y el costado,
// una arista corre desde la punta hasta la junta del morro (perfil del
// despegue y foto del morro). Por debajo, la panza sube recta hasta la
// punta desde la torreta, que cuelga de un boquete justo bajo ella (perfil
// del despegue y fotos de pista). Detrás, el carenado del motor: dos mejillas
// que salen de los costados por debajo de un reborde y la boca abierta con
// el motor dentro (planta, foto del montaje y vídeo desde atrás).
const PUNTA_Z = 1.67;
const COLA_Z = -0.9;
// La junta de la tapa del morro: en el ISTAR de la torreta grande (fotos
// del morro y de la feria), a 0,58 m de la punta, por detrás de la pata
// del morro; en los de la torreta pequeña (perfil del despegue y pista), a
// 0,43, encima de la pata. El morro tiene la misma forma en los dos.
const JUNTA_MORRO = PUNTA_Z - 0.58;
// El carenado del motor, de la junta a la boca: el lomo sigue recto hasta
// el final; en cada costado, una mejilla de caja más ancha, con el frente y
// las esquinas redondos, del reborde a algo por debajo de la mitad; debajo,
// el costado baja hasta casi la panza y se recorta hacia arriba en los
// últimos centímetros. Por debajo está abierto: asoman el motor y los
// escapes (fotos del montaje y de pista con el equipo, vídeo desde atrás).
const CAPO = { z: -0.555, mejilla: 0.25, arriba: 0.09, abajo: -0.05, r: 0.015, bajo: -0.17, recorte: -0.08, piel: 0.006 };

// Medidas de cada sección: d, distancia a la punta; lomo y panza; medio
// ancho; yw, dónde acaba el costado de arriba (el reborde, detrás); ys,
// hasta dónde baja el costado recto; g y k, la arista: cuánto queda por
// debajo del lomo y a qué fracción del medio ancho; a, en grados, cuánto
// dobla ahí (0: sin arista). Debajo, la panza es plana, de xp del medio
// ancho, y la une al costado una cara inclinada con dos aristas: c, cuánto
// dobla arriba, en el costado (0: sin arista, para que el costado no
// cambie de tono de golpe), y p, abajo, en la panza (fotos del morro y de
// la feria: las líneas que corren de la torreta hacia el ala). En la
// barbilla, sin aristas y redonda.
type Med = { d: number; top: number; bot: number; w: number; yw: number; ys: number; g: number; k: number; a: number; c: number; p: number; xp: number };
const MORRO: Med[] = [
  { d: 0.012, top: 0.045, bot: 0.015, w: 0.016, yw: 0.025, ys: 0.021, g: 0.006, k: 0.55, a: 30, c: 0, p: 0, xp: 0.3 },
  { d: 0.03, top: 0.06, bot: 0.006, w: 0.032, yw: 0.024, ys: 0.018, g: 0.012, k: 0.55, a: 35, c: 0, p: 0, xp: 0.3 },
  { d: 0.06, top: 0.078, bot: -0.006, w: 0.054, yw: 0.022, ys: 0.014, g: 0.02, k: 0.56, a: 38, c: 0, p: 0, xp: 0.32 },
  { d: 0.11, top: 0.1, bot: -0.03, w: 0.084, yw: 0.02, ys: 0.008, g: 0.028, k: 0.6, a: 38, c: 0, p: 0, xp: 0.36 },
  { d: 0.17, top: 0.12, bot: -0.058, w: 0.112, yw: 0.03, ys: 0.0, g: 0.032, k: 0.64, a: 35, c: 0, p: 4, xp: 0.42 },
  { d: 0.23, top: 0.136, bot: -0.095, w: 0.136, yw: 0.045, ys: -0.012, g: 0.032, k: 0.68, a: 30, c: 0, p: 12, xp: 0.48 },
  { d: 0.29, top: 0.149, bot: -0.14, w: 0.155, yw: 0.065, ys: -0.025, g: 0.028, k: 0.72, a: 22, c: 0, p: 20, xp: 0.53 },
  { d: 0.36, top: 0.16, bot: -0.162, w: 0.17, yw: 0.09, ys: -0.04, g: 0.024, k: 0.75, a: 12, c: 0, p: 25, xp: 0.58 },
  { d: 0.43, top: 0.168, bot: -0.17, w: 0.178, yw: 0.105, ys: -0.048, g: 0.02, k: 0.77, a: 4, c: 0, p: 27, xp: 0.6 },
  { d: 0.55, top: 0.17, bot: -0.17, w: 0.183, yw: 0.11, ys: -0.05, g: 0.02, k: 0.78, a: 0, c: 0, p: 28, xp: 0.62 },
];
const CUERPO = (d: number, extra: Partial<Med> = {}): Med => ({ d, top: 0.17, bot: -0.17, w: 0.185, yw: CAPO.arriba, ys: -0.05, g: 0.02, k: 0.78, a: 0, c: 0, p: 28, xp: 0.62, ...extra });
const MEDIDAS: Med[] = [...MORRO, CUERPO(1.6), CUERPO(PUNTA_Z - CAPO.z)];

// Media sección (x ≥ 0) en cinco tramos, de lo alto a lo bajo: el lomo
// hasta la arista, el costado de arriba hasta el reborde, el costado de
// abajo, la cara inclinada y la panza. Sin arista (a, c o p
// = 0), el tramo sigue con la dirección del anterior y no se nota la junta.
const bezier = (p: P2[], n: number): P2[] => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, s = 1 - t;
  return (p.length === 3
    ? [0, 1].map((c) => s * s * p[0][c] + 2 * s * t * p[1][c] + t * t * p[2][c])
    : [0, 1].map((c) => s * s * s * p[0][c] + 3 * s * s * t * p[1][c] + 3 * s * t * t * p[2][c] + t * t * t * p[3][c])) as P2;
});
const rad = (g: number) => (g * Math.PI) / 180;
// La cara inclinada: sale de [x0, y0] doblada c grados hacia dentro y llega
// a la panza [x1, y1] bajando p grados.
const cara = ([x0, y0]: P2, [x1, y1]: P2, c: number, p: number): P2[] => {
  const L = 0.45 * Math.hypot(x0 - x1, y0 - y1);
  return bezier([[x0, y0], [x0 - L * Math.sin(rad(c)), y0 - L * Math.cos(rad(c))], [x1 + L * Math.cos(rad(p)), y1 + L * Math.sin(rad(p))], [x1, y1]], 10);
};
const contorno = (m: Med): P2[][] => {
  const xc = m.k * m.w, yc = m.top - m.g;
  const lomo = bezier([[0, m.top], [0.55 * xc, m.top], [xc, yc]], 10);
  const t = Math.atan2(yc - m.top, 0.45 * xc) - rad(m.a);
  const L = 0.45 * Math.hypot(m.w - xc, yc - m.yw);
  const costado = bezier([[xc, yc], [xc + L * Math.cos(t), yc + L * Math.sin(t)], [m.w, m.yw + 0.45 * (yc - m.yw)], [m.w, m.yw]], 12);
  const xb = m.xp * m.w;
  return [lomo, [...costado, [m.w, m.ys]], cara([m.w, m.ys], [xb, m.bot], m.c, m.p), [[xb, m.bot], [0, m.bot]]];
};
const PUNTA_Y = 0.025;
const punto: P2[] = [[0, PUNTA_Y], [0, PUNTA_Y]];
const seccion = (m: Med): Seccion => ({ z: PUNTA_Z - m.d, ancho: m.w, arriba: m.top, abajo: m.bot, contorno: contorno(m) });
const FUSELAJE: Seccion[] = [
  { z: PUNTA_Z, ancho: 0, arriba: PUNTA_Y, abajo: PUNTA_Y, contorno: [punto, punto, punto, punto] },
  ...MEDIDAS.map(seccion),
];
// Media sección del carenado, de piel fina y abierta por debajo: lomo y
// costado como el cuerpo, la mejilla (W, su medio ancho), el costado de
// abajo igual que el del cuerpo (recto y luego la cara inclinada) hasta yb
// y, por dentro, la piel de vuelta hasta el lomo. Con k < 1, encogida (la
// primera sección, metida en el cuerpo).
const MED_CAPO = CUERPO(PUNTA_Z - CAPO.z);
// El costado del cuerpo bajo la mejilla, cortado en yb.
const bajoCapo = (yb: number): P2[] => {
  const m = MED_CAPO, pts = cara([m.w, m.ys], [m.xp * m.w, m.bot], m.c, m.p);
  const out: P2[] = [[m.w, CAPO.abajo]];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    if (y1 >= yb - 1e-9) { out.push(pts[i]); continue; }
    const [x0, y0] = pts[i - 1], t = (y0 - yb) / (y0 - y1);
    out.push([x0 + (x1 - x0) * t, yb]);
    break;
  }
  return out;
};
// El contorno de fuera sin la mejilla, del lomo al borde de abajo.
const fueraCapo = (yb: number): P2[] => {
  const [lomo, costado] = contorno(MED_CAPO);
  return [...lomo, ...costado, ...bajoCapo(yb).slice(1)].filter((q, i, a) => i === 0 || Math.hypot(q[0] - a[i - 1][0], q[1] - a[i - 1][1]) > 1e-6);
};
// Una línea llevada e hacia dentro, por su normal.
const meter = (q: P2[], e: number): P2[] => q.map(([x, y], i): P2 => {
  const [xa, ya] = q[Math.max(0, i - 1)], [xb, yb] = q[Math.min(q.length - 1, i + 1)];
  const dx = xb - xa, dy = yb - ya, n = Math.hypot(dx, dy) || 1;
  return [Math.max(0, x + (e * dy) / n), y - (e * dx) / n];
});
const contornoCapo = (W: number, yb: number, k = 1): P2[][] => {
  const m = MED_CAPO, [lomo, costado] = contorno(m), { w } = m;
  const r = Math.min(CAPO.r, W - w);
  const esquina = (cx: number, cy: number, a0: number): P2[] => Array.from({ length: 4 }, (_, i): P2 => {
    const a = a0 - (i / 3) * (Math.PI / 2);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const mejilla: P2[] = [[w, CAPO.arriba], ...esquina(W - r, CAPO.arriba - r, Math.PI / 2), ...esquina(W - r, CAPO.abajo + r, 0), [w, CAPO.abajo]];
  const bajo = bajoCapo(yb);
  const dentro: P2[] = [bajo[bajo.length - 1], ...meter(fueraCapo(yb), CAPO.piel).reverse()];
  return [lomo, costado.slice(0, -1), mejilla, bajo, dentro].map((tr) => tr.map(([x, y]): P2 => [x * k, y * k]));
};
// Las secciones: [z, medio ancho de la mejilla, dónde acaba el costado].
const CAPO_Z: P3[] = [[CAPO.z, 0.185, CAPO.bajo], [CAPO.z - 0.004, 0.21, CAPO.bajo], [CAPO.z - 0.014, 0.235, CAPO.bajo], [CAPO.z - 0.03, CAPO.mejilla, CAPO.bajo], [COLA_Z + 0.07, CAPO.mejilla, CAPO.bajo], [COLA_Z + 0.06, CAPO.mejilla, CAPO.recorte], [COLA_Z, CAPO.mejilla, CAPO.recorte]];
// Sale del cuerpo justo donde este acaba, con su misma sección; delante, 1
// cm metido dentro, para que su tapa no caiga en la unión.
const CAPOS: Seccion[] = [
  { z: CAPO.z + 0.01, ancho: 0.184, arriba: 0.169, abajo: CAPO.bajo, contorno: contornoCapo(0.185, CAPO.bajo, 0.995) },
  ...CAPO_Z.map(([z, W, yb]): Seccion => ({ z, ancho: W, arriba: 0.17, abajo: yb, contorno: contornoCapo(W, yb) })),
];
// La tapa de atrás de cada lateral (mejilla y costado de abajo, entre la
// piel de fuera y la de dentro), para que desde atrás no se vea hueco: una
// placa vertical girada hasta quedar de cara a la cola, con su planta en
// [x, y].
const TAPA_CAPO: P2[] = (() => {
  const fuera = contornoCapo(CAPO.mejilla, CAPO.recorte);
  const dentro = meter(fueraCapo(CAPO.recorte), CAPO.piel).filter(([, y]) => y <= CAPO.arriba).reverse();
  return [...fuera[2], ...fuera[3].slice(1), ...dentro];
})();
// Por dentro, negro: un forro pegado a la piel, con la pared de delante,
// donde va el motor.
const forro = (yb: number): P2[][] => {
  const baja = meter(fueraCapo(yb), 0.008);
  return [baja, [baja[baja.length - 1], ...meter(fueraCapo(yb), 0.009).reverse()]];
};
const BOCA: Seccion[] = CAPO_Z.slice(1).map(([z, , yb]) => ({ z: z === CAPO_Z[1][0] ? CAPO.z - 0.005 : z, ancho: 0.177, arriba: 0.162, abajo: yb, contorno: forro(yb) }));

// ── Ala ────────────────────────────────────────────────────────────────────
// Media, recta y de cuerda constante (0,42 m), sin diedro, metida en el
// costado: 5,22 m de punta a punta (folleto). En el borde de salida, la
// bisagra en una sola línea, de 9 cm de cuerda (planta sobre la costa): el
// flap por dentro, hasta pasado el botalón, bajado como en las fotos del
// despegue y del montaje, y el alerón de ahí a la punta.
const ALA = { y: -0.03, punta: 2.61, ba: 0.21, bs: -0.21, t: 0.06 };
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = ALA.bs): Est => [x, ALA.ba, bs, ALA.t, 0];
const MANDO = { desde: 0.19, hasta: 2.607, cuerda: 0.09, flap: 0.75, bajado: 15 };
// El mando, con su hueco de 6 mm delante y el grueso del ala en la bisagra.
const HUECO = 0.006;
const bisagra = (m: { cuerda: number }) => ALA.bs + m.cuerda;
const estMando = (m: { cuerda: number }, x: number, grueso: number): Est => [x, bisagra(m) - HUECO, ALA.bs, grueso, 0];

// ── Botalones y cola ───────────────────────────────────────────────────────
// Dos botalones de sección casi cuadrada colgados del ala, a ±0,658 m, hasta
// las derivas; entre ellas, el estabilizador, algo por encima de la mitad
// de su alto (tres vistas y la foto de pista de frente). Cada deriva: 0,44 m
// de cuerda abajo y 0,26 arriba, 0,49 m de alto, el borde de salida recto
// y el de ataque en flecha; el timón, los últimos 12 cm. Por debajo del
// botalón no hay nada: deriva y botalón son una pieza, el botalón acaba
// con el borde de salida y solo su esquina de atrás, los últimos 8 cm, es
// negra; arriba, la tapa negra (perfil del despegue y foto de pista con el
// equipo). La cola va 5 cm
// más atrás y los botalones 2 cm más bajos que en las tres vistas del
// TARSIS 75: así casan el perfil del despegue y la planta.
const BOTALON = { x: 0.658, y: -0.105, medio: 0.03, desde: 0.22, hasta: -2.2, negro: -2.12 };
const DERIVA = { y: BOTALON.y + BOTALON.medio, alto: 0.49, baRaiz: -1.764, baPunta: -1.938, bs: -2.2, timon: 0.12 };
const baDeriva = (h: number) => DERIVA.baRaiz + ((DERIVA.baPunta - DERIVA.baRaiz) * h) / DERIVA.alto;
const ESTAB = { y: 0.1, ba: -1.83, bs: -2.067, t: 0.026, timon: 0.06 };
// Bajo el ala, el botalón sube hasta ella: un carenado que se funde.
const seccionBotalon = (z: number, f = 1, sube = 0): Seccion => ({ z, ancho: BOTALON.medio * f, arriba: BOTALON.y + BOTALON.medio * f + sube, abajo: BOTALON.y - BOTALON.medio * f, n: 3.6, nAbajo: 3.6 });

// ── Tren ───────────────────────────────────────────────────────────────────
// Triciclo fijo, más alto que el de las tres vistas del TARSIS 75 (en las
// fotos del ISTAR, el eje de la rueda del morro queda 0,40 m bajo la panza).
// Ruedas de 0,2 m las principales y 0,15 la del morro, con la vía de 0,87 m
// de las tres vistas; las principales, en patas de ballesta negras que
// bajan hacia fuera a unos 45°, finas de frente y muy anchas de perfil (18
// cm arriba, 11 junto a la rueda); la del morro, un tubo de metal fino
// algo echado hacia delante, con el amortiguador detrás, un collar abajo y
// un brazo que lleva la rueda un poco hacia atrás (perfil del despegue y
// foto de la feria).
const SUELO = -0.645;
const PRINCIPAL = { r: 0.1, ancho: 0.05, x: 0.435, z: -0.15 };
const MORRO_TREN = { r: 0.075, ancho: 0.04, z: 1.22, collar: -0.45, rueda: 1.2 };

// Rueda: cubierta, llanta y buje, tumbada con el eje en x.
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

// ── Torreta EO/IR ──────────────────────────────────────────────────────────
// Una torreta de caja bajo el morro (foto del morro), colgada de un
// boquete de la panza: arriba, dentro del boquete, el aro fijo, negro; lo
// que gira, más claro: el montaje plano y, debajo, el cuerpo gris oscuro
// entre dos tapas laterales claras con el fondo redondo y tornillos en el
// borde; en la cara, la ventana grande redonda de cristal azul oscuro y,
// debajo, la ventanita alargada dorada del láser, la lente pequeña y la
// pegatina con el código; abajo, en los costados, la rejilla de chapa
// perforada. Mirando al frente.
const TORRETA = { z: 1.48, arriba: -0.085, aro: -0.097, montaje: -0.11, cuerpo: -0.106, abajo: -0.236, ancho: 0.11, largo: 0.125 };
const CARA_Z = TORRETA.z + TORRETA.largo / 2;
const TAPA = { x: 0.06, z0: TORRETA.z - 0.058, z1: TORRETA.z + 0.058, arriba: -0.108, eje: -0.176 };
// La tapa: arriba recta, los lados rectos y el fondo, media vuelta.
const tapaLateral: P2[] = [
  [TAPA.z1, TAPA.arriba], [TAPA.z0, TAPA.arriba],
  ...Array.from({ length: 13 }, (_, i): P2 => {
    const a = Math.PI + (i / 12) * Math.PI, r = (TAPA.z1 - TAPA.z0) / 2;
    return [TORRETA.z + r * Math.cos(a), TAPA.eje + r * Math.sin(a)];
  }),
];
// El boquete: la piel de la panza, 4 mm por fuera, de un negro de hueco,
// solo donde está la boca, apenas mayor que la torreta (foto del morro y
// perfil del despegue). Cada sección, [d, cuánto sube la boca por la piel
// desde el centro de la panza].
const BOQUETE: P2[] = [[0.118, 0.025], [0.13, 0.06], [0.16, 0.072], [0.22, 0.072], [0.25, 0.06], [0.262, 0.025]];
// La torreta sube con la panza, que ahora va más alta bajo el morro.
const SUBE_TORRETA = 0.05;
const medEn = (d: number): Med => {
  const i = Math.max(1, MEDIDAS.findIndex((m) => m.d >= d)), a = MEDIDAS[i - 1], b = MEDIDAS[i], t = (d - a.d) / (b.d - a.d);
  const k = (x: number, y: number) => x + (y - x) * t;
  return { ...a, d, top: k(a.top, b.top), bot: k(a.bot, b.bot), w: k(a.w, b.w), yw: k(a.yw, b.yw), ys: k(a.ys, b.ys), g: k(a.g, b.g), k: k(a.k, b.k), a: k(a.a, b.a), c: k(a.c, b.c), p: k(a.p, b.p), xp: k(a.xp, b.xp) };
};
const seccionBoquete = ([d, largo]: P2): Seccion => {
  const m = medEn(d), q = contorno(m);
  // De la panza hacia arriba, hasta `largo` a lo largo de la piel.
  const bajo = [...q[1], ...q[2], ...q[3]].reverse();
  const tira: P2[] = [bajo[0]];
  for (let i = 1, s = 0; i < bajo.length && s < largo; i++) {
    const [x0, y0] = bajo[i - 1], [x1, y1] = bajo[i], l = Math.hypot(x1 - x0, y1 - y0);
    if (l < 1e-6) continue;
    const f = Math.min(1, (largo - s) / l);
    tira.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
    s += l;
  }
  // Cada punto, llevado hacia fuera (o hacia dentro) por la normal.
  const fuera = (e: number) => tira.map(([x, y], i): P2 => {
    const [xa, ya] = tira[Math.max(0, i - 1)], [xb, yb] = tira[Math.min(tira.length - 1, i + 1)];
    const dx = xb - xa, dy = yb - ya, n = Math.hypot(dx, dy) || 1;
    return [Math.max(0, x + (e * dy) / n), y - (e * dx) / n];
  });
  const dentro = fuera(-0.004), fuerA = fuera(0.004).reverse();
  return { z: PUNTA_Z - d, ancho: m.w, arriba: m.top, abajo: m.bot, contorno: [dentro, [dentro[dentro.length - 1], ...fuerA]] };
};
const VENTANA = { y: -0.143, r: 0.036 };

// ── Motor y hélice ─────────────────────────────────────────────────────────
// Dentro de la boca, un bicilíndrico plano de dos tiempos (100 cm³): el
// cárter en medio, los dos cilindros con aletas a los lados y su pipa de
// bujía en la punta y, detrás, el volante de radios, de color bronce, y el
// plato de la hélice, de aluminio, con seis tornillos. Debajo, los dos
// escapes, que salen por la panza (foto del montaje y vídeo desde atrás).
// Hélice de dos palas negras, de 0,66 m (tres vistas).
const EJE_Y = 0.0;
const HELICE = { tipo: "helice" as const, en: [0, EJE_Y, COLA_Z - 0.035] as P3, radio: 0.33, palas: 2, buje: 0, giro: 75 };
const PALA = { ancho: 0.05, forma: [[0.12, 0.35, 0.35], [0.25, 0.55, 0.45], [0.5, 0.5, 0.4], [0.75, 0.42, 0.32], [0.93, 0.33, 0.22], [1, 0.15, 0.08]] as [number, number, number][] };
const MOTOR_Z = COLA_Z + 0.075;
const ESCAPE_Z = COLA_Z + 0.045;

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "blanco-ta", secciones: FUSELAJE, abierto: "atras" },
  // La tapa de delante, con sus vértices: si no, tuerce la luz del borde y
  // se ve raya en la unión con el cuerpo.
  { tipo: "casco", id: "capo", acabado: "blanco-ta", secciones: CAPOS, abierto: "atras", tapaPlana: true },
  ...LADOS.map((l): Pieza => ({ tipo: "placa", id: `capo-tapa-${l}`, acabado: "blanco-ta", plano: "vertical", x: -(COLA_Z + 0.002), grosor: 0.004, girar: { centro: [0, 0, 0], eje: "y", grados: 90 }, planta: TAPA_CAPO.map(([x, y]): P2 => [l * x, y]) })),
  { tipo: "casco", id: "boca", acabado: "hueco", secciones: BOCA, abierto: "atras" },
  // El motor.
  { tipo: "caja", id: "carter", acabado: "negro", centro: [0, EJE_Y, MOTOR_Z], tam: [0.1, 0.11, 0.08], redondeo: 0.02 },
  ...LADOS.flatMap((l): Pieza[] => [
    { tipo: "varilla", id: `cilindro-${l}`, acabado: "negro", desde: [l * 0.05, EJE_Y + 0.01, MOTOR_Z], hasta: [l * 0.15, EJE_Y + 0.01, MOTOR_Z], radio: 0.032, lados: 20 },
    ...[0.065, 0.08, 0.095, 0.11, 0.125].map((x, i): Pieza => ({ tipo: "disco", id: `aleta-${l}-${i}`, acabado: "junta", en: [l * x, EJE_Y + 0.01, MOTOR_Z], normal: [1, 0, 0], radio: 0.045, grosor: 0.004 })),
  ]),
  ...LADOS.map((l): Pieza => ({ tipo: "varilla", id: `pipa-${l}`, acabado: "negro-ua", desde: [l * 0.15, EJE_Y + 0.01, MOTOR_Z], hasta: [l * 0.178, EJE_Y + 0.01, MOTOR_Z], radio: 0.011, lados: 16 })),
  // El volante: aro de bronce y, delante, el fondo negro con cinco radios.
  { tipo: "disco", id: "volante", acabado: "laton", en: [0, EJE_Y, COLA_Z + 0.025], normal: [0, 0, -1], radio: 0.075, grosor: 0.016 },
  { tipo: "disco", id: "volante-fondo", acabado: "negro", en: [0, EJE_Y, COLA_Z + 0.016], normal: [0, 0, -1], radio: 0.062, grosor: 0.002 },
  ...Array.from({ length: 5 }, (_, i): Pieza => {
    const a = (i / 5) * 2 * Math.PI + 0.3;
    return { tipo: "varilla", id: `radio-${i}`, acabado: "laton", desde: [0.018 * Math.cos(a), EJE_Y + 0.018 * Math.sin(a), COLA_Z + 0.014], hasta: [0.064 * Math.cos(a), EJE_Y + 0.064 * Math.sin(a), COLA_Z + 0.014], radio: 0.006 };
  }),
  { tipo: "disco", id: "plato", acabado: "aluminio", en: [0, EJE_Y, COLA_Z - 0.003], normal: [0, 0, -1], radio: 0.045, grosor: 0.01 },
  ...Array.from({ length: 6 }, (_, i): Pieza => {
    const a = (i / 6) * 2 * Math.PI;
    return { tipo: "disco", id: `tornillo-${i}`, acabado: "metal", en: [0.035 * Math.cos(a), EJE_Y + 0.035 * Math.sin(a), COLA_Z - 0.009], normal: [0, 0, -1], radio: 0.006, grosor: 0.004 };
  }),
  { tipo: "tubo", id: "buje", acabado: "aluminio", centro: [0, EJE_Y], perfil: [[COLA_Z + 0.02, 0.03], [COLA_Z - 0.045, 0.03], [COLA_Z - 0.055, 0.022], [COLA_Z - 0.06, 0]] },
  ...LADOS.map((l): Pieza => ({ tipo: "tubo", id: `escape-${l}`, acabado: "aluminio", centro: [l * 0.1, -0.13], girar: { centro: [l * 0.1, -0.13, ESCAPE_Z], eje: "x", grados: -90 }, perfil: [[ESCAPE_Z - 0.09, 0], [ESCAPE_Z - 0.085, 0.022], [ESCAPE_Z - 0.075, 0.027], [ESCAPE_Z + 0.03, 0.027], [ESCAPE_Z + 0.09, 0.022]] })),
  { ...HELICE, id: "helice", acabado: "negro", ancho: PALA.ancho, forma: PALA.forma },
  {
    // Media ala: donde van el flap y el alerón, el borde de salida se
    // adelanta hasta su bisagra.
    tipo: "ala", id: "ala", acabado: "blanco-ta", y: ALA.y,
    estaciones: [
      estAla(0), estAla(MANDO.desde), estAla(MANDO.desde, bisagra(MANDO)), estAla(ALA.punta, bisagra(MANDO)),
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "blanco-ta", y: ALA.y, girar: { centro: [0, ALA.y, bisagra(MANDO)], eje: "x", grados: -MANDO.bajado },
    estaciones: [estMando(MANDO, MANDO.desde + 0.003, 0.024), estMando(MANDO, MANDO.flap - 0.003, 0.024)] },
  { tipo: "ala", id: "alerones", acabado: "blanco-ta", y: ALA.y, estaciones: [estMando(MANDO, MANDO.flap + 0.003, 0.024), estMando(MANDO, MANDO.hasta, 0.024)] },
  // Botalones, con la punta de delante redonda.
  ...LADOS.map((l): Pieza => ({
    tipo: "casco", id: `botalon-${l}`, acabado: "blanco-ta", x: l * BOTALON.x,
    secciones: [seccionBotalon(BOTALON.desde, 0.25), seccionBotalon(BOTALON.desde - 0.012, 0.75, 0.015), seccionBotalon(BOTALON.desde - 0.035, 1, 0.035), seccionBotalon(ALA.bs, 1, 0.035), seccionBotalon(ALA.bs - 0.2), seccionBotalon(BOTALON.negro)],
  })),
  // Su esquina de atrás, negra.
  ...LADOS.map((l): Pieza => ({ tipo: "casco", id: `botalon-punta-${l}`, acabado: "negro-ua", x: l * BOTALON.x, abierto: true, secciones: [seccionBotalon(BOTALON.hasta), seccionBotalon(BOTALON.negro)] })),
  // Derivas: un ala vertical que cuelga, dada la vuelta para que suba.
  ...LADOS.flatMap((l): Pieza[] => {
    const girar = { centro: [l * BOTALON.x, DERIVA.y, 0] as P3, eje: "z" as const, grados: 180 };
    const bisagra = DERIVA.bs + DERIVA.timon;
    return [
      { tipo: "ala", id: `deriva-${l}`, acabado: "blanco-ta", vertical: true, sola: true, x: l * BOTALON.x, y: DERIVA.y, girar,
        estaciones: [[0, DERIVA.baRaiz, bisagra, 0.03], [DERIVA.alto - 0.02, baDeriva(DERIVA.alto - 0.02), bisagra, 0.02]] },
      { tipo: "ala", id: `timon-${l}`, acabado: "blanco-ta", vertical: true, sola: true, x: l * BOTALON.x, y: DERIVA.y, girar,
        estaciones: [[0.01, bisagra - 0.006, DERIVA.bs, 0.014], [DERIVA.alto - 0.02, bisagra - 0.006, DERIVA.bs, 0.01]] },
      { tipo: "caja", id: `deriva-tapa-${l}`, acabado: "negro", centro: [l * BOTALON.x, DERIVA.y + DERIVA.alto - 0.012, (baDeriva(DERIVA.alto) + DERIVA.bs) / 2 - 0.002], tam: [0.022, 0.024, baDeriva(DERIVA.alto) - DERIVA.bs - 0.004], redondeo: 0.008 },
    ];
  }),
  // Estabilizador y timón de profundidad, de deriva a deriva.
  { tipo: "ala", id: "estabilizador", acabado: "blanco-ta", y: ESTAB.y, estaciones: [[0, ESTAB.ba, ESTAB.bs + ESTAB.timon, ESTAB.t], [BOTALON.x, ESTAB.ba, ESTAB.bs + ESTAB.timon, ESTAB.t]] },
  { tipo: "ala", id: "profundidad", acabado: "blanco-ta", y: ESTAB.y, estaciones: [[0, ESTAB.bs + ESTAB.timon - 0.006, ESTAB.bs, ESTAB.t * 0.45], [BOTALON.x - 0.012, ESTAB.bs + ESTAB.timon - 0.006, ESTAB.bs, ESTAB.t * 0.45]] },
  // La torreta.
  { tipo: "casco", id: "boquete", acabado: "hueco", secciones: BOQUETE.map(seccionBoquete) },
  { tipo: "disco", id: "torreta-aro", acabado: "negro", en: [0, (TORRETA.arriba + TORRETA.aro) / 2, TORRETA.z], normal: [0, 1, 0], radio: 0.072, grosor: TORRETA.arriba - TORRETA.aro },
  { tipo: "caja", id: "torreta-montaje", acabado: "gris-ta2", centro: [0, (TORRETA.aro + TORRETA.montaje) / 2, TORRETA.z], tam: [2 * TAPA.x + 0.008, TORRETA.aro - TORRETA.montaje, TORRETA.largo], redondeo: 0.006 },
  { tipo: "caja", id: "torreta", acabado: "gris-ta", centro: [0, (TORRETA.cuerpo + TORRETA.abajo) / 2, TORRETA.z], tam: [TORRETA.ancho, TORRETA.cuerpo - TORRETA.abajo, TORRETA.largo], redondeo: 0.025 },
  { tipo: "caja", id: "torreta-cara", acabado: "gris-ta", centro: [0, (TORRETA.cuerpo + TORRETA.abajo) / 2 + 0.004, CARA_Z + 0.006], tam: [TORRETA.ancho - 0.008, TORRETA.cuerpo - TORRETA.abajo - 0.014, 0.014], redondeo: 0.02 },
  { tipo: "placa", id: "torreta-tapas", acabado: "gris-ta2", plano: "vertical", x: TAPA.x, espejo: true, grosor: 0.008, bisel: 0.002, planta: tapaLateral },
  { tipo: "disco", id: "torreta-marco", acabado: "negro", en: [0, VENTANA.y, CARA_Z + 0.013], normal: [0, 0, 1], radio: VENTANA.r + 0.005, grosor: 0.004 },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente-ta", en: [0, VENTANA.y, CARA_Z + 0.015], normal: [0, 0, 1], radio: VENTANA.r, grosor: 0.004 },
  { tipo: "tubo", id: "torreta-laser", acabado: "laton", centro: [-0.034, -0.203], seccion: [1, 2.2], perfil: [[CARA_Z + 0.008, 0.008], [CARA_Z + 0.016, 0.008], [CARA_Z + 0.017, 0]] },
  // La chapa perforada clara de abajo, en los costados, bajo las tapas.
  { tipo: "caja", id: "torreta-rejilla", acabado: "aluminio", espejo: true, centro: [TORRETA.ancho / 2 + 0.002, -0.212, TORRETA.z - 0.004], tam: [0.012, 0.046, TORRETA.largo - 0.01], redondeo: 0.004 },
  { tipo: "disco", id: "torreta-lente-aro", acabado: "negro", en: [0.006, -0.212, CARA_Z + 0.013], normal: [0, 0, 1], radio: 0.013, grosor: 0.004 },
  { tipo: "disco", id: "torreta-lente", acabado: "lente", en: [0.006, -0.212, CARA_Z + 0.015], normal: [0, 0, 1], radio: 0.009, grosor: 0.004 },
  // Pitot en la punta del morro: grueso hasta la mitad y fino después.
  { tipo: "tubo", id: "pitot", acabado: "metal", centro: [0, PUNTA_Y], perfil: [[PUNTA_Z - 0.02, 0.009], [PUNTA_Z + 0.1, 0.008], [PUNTA_Z + 0.105, 0.005], [PUNTA_Z + 0.22, 0.005], [PUNTA_Z + 0.225, 0]] },
  // En el lomo: la antena de varilla detrás de la junta del morro, una
  // cúpula y una caja baja oscuras (perfil del despegue y planta).
  { tipo: "varilla", id: "antena-lomo", acabado: "negro", desde: [0, 0.165, JUNTA_MORRO - 0.03], hasta: [0, 0.27, JUNTA_MORRO - 0.035], radio: 0.004 },
  { tipo: "disco", id: "cupula", acabado: "negro", en: [0, 0.172, 0.86], normal: [0, 1, 0], radio: 0.03, grosor: 0.016 },
  { tipo: "caja", id: "caja-lomo", acabado: "negro", centro: [0, 0.178, 0.74], tam: [0.06, 0.022, 0.12], redondeo: 0.01 },
  // Bajo la panza: una varilla blanca y una antena negra delante del ala, y
  // una aleta pequeña al final de la panza, delante del carenado abierto
  // (perfil y foto de pista).
  { tipo: "varilla", id: "varilla-panza", acabado: "blanco-ta", desde: [0, -0.16, 0.55], hasta: [0, -0.26, 0.55], radio: 0.012 },
  { tipo: "varilla", id: "antena-panza", acabado: "negro", desde: [0, -0.16, 0.48], hasta: [0, -0.25, 0.47], radio: 0.003 },
  { tipo: "placa", id: "aleta-panza", acabado: "blanco-ta", plano: "vertical", x: 0, grosor: 0.01, bisel: 0.003, planta: [[-0.475, -0.165], [-0.555, -0.165], [-0.545, -0.205], [-0.515, -0.205]] },
  // El tren.
  { tipo: "viga", id: "patas", acabado: "negro-ua", espejo: true, arriba: 0.9, abajo: 0.9,
    ruta: [[0.09, -0.155, PRINCIPAL.z + 0.01, 0.18, 0.022], [PRINCIPAL.x - 0.035, SUELO + PRINCIPAL.r, PRINCIPAL.z, 0.11, 0.022]] },
  ...LADOS.flatMap((l) => rueda(`rueda-${l}`, [l * PRINCIPAL.x, SUELO + PRINCIPAL.r, PRINCIPAL.z], PRINCIPAL.r, PRINCIPAL.ancho)),
  // La pata del morro.
  { tipo: "varilla", id: "pata-morro", acabado: "aluminio", desde: [0, -0.15, MORRO_TREN.z], hasta: [0, MORRO_TREN.collar, MORRO_TREN.z + 0.02], radio: 0.011, lados: 16 },
  { tipo: "varilla", id: "amortiguador", acabado: "aluminio", desde: [0, -0.3, MORRO_TREN.z - 0.025], hasta: [0, MORRO_TREN.collar + 0.01, MORRO_TREN.z - 0.012], radio: 0.005, lados: 12 },
  { tipo: "varilla", id: "muelle", acabado: "negro", desde: [0, -0.33, MORRO_TREN.z - 0.024], hasta: [0, -0.4, MORRO_TREN.z - 0.019], radio: 0.011, lados: 16 },
  { tipo: "caja", id: "collar", acabado: "aluminio", centro: [0, MORRO_TREN.collar, MORRO_TREN.z + 0.01], tam: [0.062, 0.03, 0.05], redondeo: 0.008 },
  // El brazo: dos chapas, una a cada lado de la rueda, del collar al eje.
  { tipo: "placa", id: "brazo-morro", acabado: "aluminio", plano: "vertical", x: MORRO_TREN.ancho / 2 + 0.008, espejo: true, grosor: 0.006, bisel: 0.002,
    planta: [[MORRO_TREN.z + 0.035, MORRO_TREN.collar + 0.01], [MORRO_TREN.z - 0.01, MORRO_TREN.collar + 0.01], [MORRO_TREN.rueda - 0.016, SUELO + MORRO_TREN.r - 0.005], [MORRO_TREN.rueda - 0.01, SUELO + MORRO_TREN.r - 0.018], [MORRO_TREN.rueda + 0.012, SUELO + MORRO_TREN.r - 0.012], [MORRO_TREN.rueda + 0.016, SUELO + MORRO_TREN.r + 0.01]] },
  ...rueda("rueda-morro", [0, SUELO + MORRO_TREN.r, MORRO_TREN.rueda], MORRO_TREN.r, MORRO_TREN.ancho),
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
const LADO: P3 = [1, 0, 0];
const ARRIBA: P3 = [0, 1, 0];
const GRIS = "#3b403d";
// Los logos, de verdad: la «A» de AERTEC (de su web) y el rótulo «TΛRSIS»
// (calcado de la foto de perfil del despegue), en src/data/uas/logos.ts.
const A_AERTEC = { tipo: "logo", logo: "aertec", color: GRIS } as const;
const TARSIS = { tipo: "logo", logo: "tarsis", color: GRIS } as const;
const CALCAS: Calca[] = [
  // «TΛRSIS» en los costados, detrás de la junta del morro: 0,49 m de largo
  // y 10 cm de alto (perfil del despegue).
  { sobre: ["fuselaje"], en: [0.2, 0.044, JUNTA_MORRO - 0.32], desde: LADO, tam: [0.49, 0.11], espejo: true, dibujo: TARSIS },
  // En el ala, cerca de las puntas, «TΛRSIS» de 14 cm de alto y detrás un
  // «75» gris claro, leyéndose hacia la punta derecha y con las letras
  // mirando al morro (vuelo desde arriba y planta).
  ...LADOS.flatMap((l): Calca[] => [
    { sobre: ["ala"], en: [l * 1.95, 0.1, 0.06], desde: ARRIBA, tam: [0.68, 0.15], giro: 180, dibujo: TARSIS },
    { sobre: ["ala"], en: [l * 1.95 - 0.455, 0.1, 0.06], desde: ARRIBA, tam: [0.17, 0.15], giro: 180, dibujo: { tipo: "texto", texto: "75", color: "#b9bdba", fino: true } },
  ]),
  // La «A» delante de las mejillas y en lo alto del lomo.
  { sobre: ["fuselaje"], en: [0.2, 0.03, -0.36], desde: LADO, tam: [0.134, 0.12], espejo: true, dibujo: A_AERTEC },
  { sobre: ["fuselaje"], en: [0, 0.2, 0.96], desde: ARRIBA, tam: [0.07, 0.07], giro: -90, dibujo: A_AERTEC },
  // En la cara de fuera de cada deriva, una tapa cuadrada con tornillos en
  // las esquinas y, por encima de su centro, la varilla oscura del timón,
  // que sale de la tapa hacia atrás (perfil del despegue).
  ...LADOS.flatMap((l): Calca[] => [
    { sobre: [`deriva-${l}`], en: [l * (BOTALON.x + 0.02), 0.11, -1.955], desde: [l, 0, 0], tam: [0.09, 0.1], dibujo: { tipo: "marco" } },
    ...[[-1.915, 0.075], [-1.995, 0.075], [-1.915, 0.145], [-1.995, 0.145]].map(([z, y]): Calca => ({ sobre: [`deriva-${l}`], en: [l * (BOTALON.x + 0.02), y, z], desde: [l, 0, 0], tam: [0.006, 0.006], dibujo: { tipo: "disco", color: "#55595a" } })),
    { sobre: [`deriva-${l}`, `timon-${l}`], en: [l * (BOTALON.x + 0.02), 0.13, -2.0], desde: [l, 0, 0], tam: [0.16, 0.009], dibujo: { tipo: "rect", color: "#2a2c2b" } },
  ]),
  // Luces de navegación en los costados, delante de la raíz del ala: roja
  // a la izquierda y verde a la derecha (perfiles de la 29 y la 30).
  ...([[1, "#b5262c"], [-1, "#2f8f4e"]] as const).map(([l, color]): Calca => ({ sobre: ["fuselaje"], en: [l * 0.2, -0.03, 0.28], desde: [l, 0, 0], tam: [0.06, 0.026], dibujo: { tipo: "poligono", color, puntos: Array.from({ length: 16 }, (_, i): P2 => [0.5 + 0.5 * Math.cos((i / 16) * 2 * Math.PI), 0.5 + 0.5 * Math.sin((i / 16) * 2 * Math.PI)]) } })),
  // Tornillos en el borde de las tapas de la torreta.
  ...LADOS.flatMap((l) => [[TAPA.z0 + 0.007, -0.117], [TAPA.z0 + 0.007, -0.145], [TAPA.z1 - 0.007, -0.117], [TAPA.z1 - 0.007, -0.145],
    ...[0.25, 0.5, 0.75].map((t): P2 => { const a = Math.PI + t * Math.PI, r = (TAPA.z1 - TAPA.z0) / 2 - 0.007; return [TORRETA.z + r * Math.cos(a), TAPA.eje + r * Math.sin(a)]; })]
    .map(([z, y]): Calca => ({ sobre: ["torreta-tapas"], en: [l * (TAPA.x + 0.004), y, z], desde: [l, 0, 0], tam: [0.005, 0.005], dibujo: { tipo: "disco", color: "#3a3a38" } }))),
  // La pegatina con el código de la torreta.
  { sobre: ["torreta-cara"], en: [-0.012, -0.209, CARA_Z + 0.02], desde: [0, 0, 1], tam: [0.016, 0.018], dibujo: { tipo: "qr" } },
];

const COSTURAS: Costura[] = [
  // Junta del morro, con sus tornillos (perfil y foto del morro).
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.2, 0.172, JUNTA_MORRO], [0.2, -0.172, JUNTA_MORRO]] },
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.15, 0.2, JUNTA_MORRO], [0.15, 0.2, JUNTA_MORRO]] },
  // Tapa del lomo, entre la caja y el ala.
  { sobre: ["fuselaje"], desde: ARRIBA, enVertices: true, puntos: [[-0.1, 0.2, 0.62], [0.1, 0.2, 0.62], [0.1, 0.2, 0.25], [-0.1, 0.2, 0.25], [-0.1, 0.2, 0.62]] },
];

const PARTES: Parte[] = [
  {
    nombre: "Morro",
    en: [0, 0.26, 1.45],
    piezas: ["fuselaje", "pitot"],
    respaldo: "foto",
    fuentes: ["morro", "atlas"],
    texto: "Una tapa de fibra con la forma de la casa: el lomo cae en curva hasta una punta alta y, entre el lomo y el costado, corre una arista. Delante, la sonda pitot que mide la velocidad.",
  },
  {
    nombre: "Torreta EO/IR",
    en: [0, -0.34, 1.48],
    piezas: ["boquete", "torreta-aro", "torreta", "torreta-montaje", "torreta-cara", "torreta-tapas", "torreta-marco", "torreta-ventana", "torreta-laser", "torreta-lente-aro", "torreta-lente", "torreta-rejilla"],
    respaldo: "foto",
    fuentes: ["morro", "feindef"],
    texto: "Bajo la barbilla, una torreta que gira con una cámara de día y otra térmica detrás de la ventana grande y, debajo, un designador láser: puede marcar un blanco para que lo ataque otro.",
    nota: "La forma, de la foto del morro; el modelo de la torreta, AERTEC no lo dice.",
  },
  {
    nombre: "Ala recta",
    en: [1.6, 0.2, 0],
    piezas: ["ala", "flaps", "alerones"],
    respaldo: "foto",
    fuentes: ["planta", "folleto"],
    texto: "5,22 m de punta a punta y la misma cuerda de la raíz a la punta, con flaps por dentro y alerones por fuera. Se desmonta para llevarlo en un remolque.",
  },
  {
    nombre: "Botalones y cola en H",
    en: [0.658, 0.55, -1.9],
    piezas: ["botalon-1", "botalon--1", "deriva-1", "deriva--1", "timon-1", "timon--1", "deriva-tapa-1", "deriva-tapa--1", "botalon-punta-1", "botalon-punta--1", "estabilizador", "profundidad"],
    respaldo: "foto",
    fuentes: ["planta", "atlas", "folleto"],
    texto: "Dos vigas salen del ala y llevan la cola: dos derivas unidas por el estabilizador. Así la hélice, detrás del fuselaje, gira entre ellas sin tocar nada.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.3, -0.9],
    piezas: ["fuselaje", "capo", "capo-tapa-1", "capo-tapa--1", "boca", "carter", "cilindro-1", "cilindro--1", "pipa-1", "pipa--1", "volante", "volante-fondo", ...Array.from({ length: 5 }, (_, i) => `radio-${i}`), "plato", ...Array.from({ length: 6 }, (_, i) => `tornillo-${i}`), "buje", "escape-1", "escape--1", "helice"],
    respaldo: "foto",
    fuentes: ["montaje", "atlas", "video"],
    texto: "Un motor de gasolina de dos tiempos y 100 cm³, metido en la cola del fuselaje con la boca abierta para que se refrigere, empuja con una hélice de dos palas.",
    nota: "Los cilindros, el volante, el plato y los escapes se ven en la foto del montaje y en el vídeo desde atrás; el modelo del motor, AERTEC no lo dice.",
  },
  {
    nombre: "Tren fijo",
    en: [0.5, SUELO - 0.06, -0.15],
    piezas: ["patas", "pata-morro", "amortiguador", "muelle", "collar", "brazo-morro", ...["rueda-morro", "rueda-1", "rueda--1"].flatMap((r) => [r, `${r}-llanta`, `${r}-buje`])],
    respaldo: "foto",
    fuentes: ["pista", "atlas", "folleto"],
    texto: "Tres ruedas que no se recogen: las de atrás, en patas de ballesta anchas; la del morro, en una pata de metal con amortiguador: despega y aterriza en una pista de tierra, y también puede salir de una catapulta y volver en paracaídas.",
  },
  {
    nombre: "Antenas",
    en: [0, 0.4, 0.9],
    piezas: ["antena-lomo", "cupula", "caja-lomo", "varilla-panza", "antena-panza", "aleta-panza"],
    respaldo: "foto",
    fuentes: ["atlas", "planta", "pista"],
    texto: "Antenas de varilla arriba y abajo para el enlace con la estación de tierra, que llega a 70 km (200 con repetidor), y en el lomo, las de GPS y del enlace por satélite opcional.",
    nota: "Qué es cada antena es supuesto: solo se ven por fuera.",
  },
];

// La torreta y sus calcas, SUBE_TORRETA más arriba.
const esTorreta = (id: string) => id.startsWith("torreta");
const subir = (p: Pieza): Pieza => {
  if (!esTorreta(p.id)) return p;
  const s = SUBE_TORRETA;
  switch (p.tipo) {
    case "disco": return { ...p, en: [p.en[0], p.en[1] + s, p.en[2]] };
    case "caja": return { ...p, centro: [p.centro[0], p.centro[1] + s, p.centro[2]] };
    case "placa": return { ...p, planta: p.planta.map(([z, y]): P2 => [z, y + s]) };
    case "tubo": return { ...p, centro: [p.centro![0], p.centro![1] + s] };
    default: throw new Error(`Torreta sin subir: ${p.tipo}`);
  }
};
const subirCalca = (k: Calca): Calca => (k.sobre.some(esTorreta) ? { ...k, en: [k.en[0], k.en[1] + SUBE_TORRETA, k.en[2]] } : k);

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
  nombre: "TARSIS-ISTAR",
  subtitulo: "Dron de reconocimiento de Clase I small",
  escala: ESCALA,  // 1 unidad = 2 m
  // Es blanco: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  // Pixel: el blanco al sol cae en 6,2-6,3 escalones (borde de abajo del 6) y
  // el costado en sombra en 3,6; corridos 0,15, los dos más al centro.
  desfaseLuz: 0.15,
  // Tarjeta de /uas desde arriba, como los de ala larga.
  vistaTarjeta: [61, 20],
  // En la planta de la portada, los rótulos del ala salían como rectángulos.
  plantaLisa: true,
  // El carenado del motor sigue al cuerpo sin raya en la unión.
  soldadura: 0.05 / ESCALA,
  detalles: { calcas: CALCAS.map(subirCalca).map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("ES"),
  piezas: PIEZAS.map(subir).map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "atlas", imagen: "30-istar-despegue-atlas.jpg", titulo: "Despegando delante de la torre del Centro ATLAS (marzo de 2023)", medio: "AntonioTote (Wikimedia Commons, CC BY-SA 4.0)", url: ATLAS },
    { id: "morro", imagen: "22-istar-morro-gimbal.jpg", titulo: "El morro con la torreta, en una prueba de designación láser", medio: "AERTEC", url: AERTEC },
    { id: "planta", imagen: "27-istar-planta-costa.jpg", titulo: "Desde arriba, en vuelo sobre la costa", medio: "AERTEC", url: AERTEC },
    { id: "pista", imagen: "23-istar-pista-frente.jpg", titulo: "En pista, de tres cuartos por delante", medio: "AERTEC", url: AERTEC },
    { id: "montaje", imagen: "31-istar-montaje-trasera.jpg", titulo: "En la cadena de montaje: la cola del fuselaje con el motor", medio: "AERTEC", url: AERTEC },
    { id: "feindef", imagen: "21-istar-feria-gimbal.jpg", titulo: "En la feria FEINDEF, con otra torreta bajo el morro", medio: "AERTEC", url: AERTEC },
    { id: "video", titulo: "Surveillance of rural areas with 5G and UAS TARSIS", medio: "AERTEC (YouTube)", url: "https://www.youtube.com/watch?v=jvHfhx5I7po" },
    { id: "folleto", titulo: "TARSIS 75: folleto con las tres vistas y la ficha", medio: "AERTEC", url: FOLLETO },
  ],
};

export default maqueta;
