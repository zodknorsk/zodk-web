// Maqueta del FP-1 de Fire Point, la versión de serie (ala recta, sin placas
// en las puntas), sin carga a la vista: la ojiva va
// dentro del cuerpo. Versión 2.0 (docs/uas-hd.md), con el gris del ejemplar
// expuesto en Kiev en mayo de 2025.
// Fire Point da 6 m de envergadura y ninguna otra medida: el resto sale de
// encajar la cámara en su render (ficha de Fakty, con las dos puntas del ala)
// y en la foto de Kiev (arte/uas-fuentes/fp-1/hd/, fuera de Git). El ala del
// ejemplar de Kiev está expuesta sin sus tramos de fuera: acaba a 2 m del
// centro, en una cara plana con los agujeros de los largueros.
// Todo se escribe en metros, con y = 0 en la panza del ala (lo alto del
// cuerpo) y z = 0 cerca del centro del ala, y al final se pasa a unidades.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.5;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const LADOS = [1, -1];
type P3 = [number, number, number];

// ── Ala ────────────────────────────────────────────────────────────────────
// Recta, de cuerda constante, en dos mitades unidas sobre el cuerpo con una
// cinta, y sin diedro; las puntas, rectas. Alerones (flaperones) en la mitad
// de fuera, con la bisagra a un cuarto de la cuerda desde atrás.
const ALA = { punta: 3.0, ba: 0.25, bs: -0.35 };
// Grueso: con `t`, el perfil mide 0,775·t y la panza queda 0,275·t por debajo
// de `sube`; la panza del ala, en y = 0.
const T_ALA = 0.115;
const SUBE_ALA = 0.275 * T_ALA;
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = ALA.bs): Est => {
  // La punta, recta y cortada: solo se redondean un poco las esquinas.
  const k = Math.min(1, Math.max(0, (x - (ALA.punta - 0.03)) / 0.03));
  const c = 1 - 0.08 * k;
  const centro = (ALA.ba + ALA.bs) / 2, medio = ((ALA.ba - ALA.bs) / 2) * c;
  return [x, centro + medio, Math.max(bs, centro - medio), T_ALA * (1 - 0.15 * k), SUBE_ALA];
};
const ALERON = { desde: 1.55, hasta: 2.82, cuerda: 0.25, hueco: 0.006 };
const bisagra = ALA.bs + ALERON.cuerda * (ALA.ba - ALA.bs);
const estAleron = (x: number): Est => [x, bisagra - ALERON.hueco, ALA.bs, T_ALA * 0.4, SUBE_ALA - 0.02 * T_ALA];

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Una caja de aristas muy redondeadas, de costados rectos, con lo alto plano
// (el ala va encima) y la tapa del morro redonda. Delante del ala, un lomo
// estrecho sube del techo hasta el borde de ataque.
const CUERPO = { tapa: 0.75, ancho: 0.24, abajo: -0.38 };
// [z, medio ancho, arriba (techo), abajo, lomo (medio ancho), alto del lomo]
const FILAS: [number, number, number, number, number, number][] = [
  // El morro, media elipse de 0,3 m de largo (romo de frente y de planta).
  ...[0, 12, 25, 40, 55, 70, 82].map((g): [number, number, number, number, number, number] => {
    const t = (g * Math.PI) / 180, k = Math.sin(t);
    return [1.3 - 0.3 * (1 - Math.cos(t)), 0.24 * k, -0.19 + 0.19 * k, -0.19 - 0.19 * k, 0, -0.19 + 0.19 * k];
  }),
  [0.95, 0.24, 0, -0.38, 0, 0],
  [0.62, 0.24, 0, -0.38, 0.1, 0],
  [0.56, 0.24, 0, -0.38, 0.145, 0.035],
  [0.49, 0.24, 0, -0.38, 0.16, 0.08],
  [0.42, 0.24, 0, -0.38, 0.165, 0.1],
  [0.27, 0.24, 0, -0.38, 0.165, 0.105],
  [0.1, 0.24, 0, -0.38, 0.15, 0.07],
  [0.0, 0.24, 0, -0.38, 0.12, 0],
  [-0.3, 0.24, 0, -0.375, 0.1, 0],
  // Detrás, se estrecha hacia la bancada del motor (foto de detrás).
  [-0.45, 0.225, 0, -0.36, 0.1, 0],
  [-0.6, 0.16, -0.03, -0.3, 0.08, -0.03],
];
const suave = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const SECCIONES: Seccion[] = FILAS.map(([z, ancho, techo, abajo, lomo, alto]) => ({
  z, ancho, abajo, cintura: (techo + abajo) / 2,
  // Hacia la punta del morro, menos cuadrado: si no, la luz hace un aspa.
  n: z > 1.0 ? 2.4 + 3.6 * suave(1.3, 1.0, z) : 6, nAbajo: z > 1.0 ? 2.4 + 2.6 * suave(1.3, 1.0, z) : 5,
  ...(lomo > 0 ? { lomo, hombro: techo, arriba: Math.max(techo, alto), nLomo: 4, pLomo: 10 } : { arriba: techo }),
}));

// ── Vigas y cola ───────────────────────────────────────────────────────────
// Dos tubos de carbono colgados bajo el ala con abrazaderas, hasta la cola en
// V invertida: cada mitad sube de una viga al centro, donde se une con la
// otra.
const VIGA = { x: 0.68, r: 0.035, delante: 0.2, detras: -2.02 };
const Y_VIGA = -VIGA.r;
// Encajada en el render de Fire Point (ficha de Fakty) y en la foto de Kiev:
// cada mitad baja del vértice, 0,32 m sobre el ala, hasta 1 m del centro y
// 0,2 m por debajo; las vigas la cruzan a 0,68 m, cerca del borde de salida.
const COLA = { xPie: 1.0, yPie: -0.2, yVertice: 0.32, ba: -1.7, bs: -2.06, t: 0.05 };
const enCola = (f: number) => ({
  // f: 0 en el vértice, 1 en el pie.
  x: COLA.xPie * f, y: COLA.yVertice + (COLA.yPie - COLA.yVertice) * f, ba: COLA.ba, bs: COLA.bs,
});
const TIMON = { bisagra: 0.62, hueco: 0.006, desde: 0.12, hasta: 0.9 };
const bisagraCola = (f: number) => { const c = enCola(f); return c.ba - TIMON.bisagra * (c.ba - c.bs); };
const estCola = (f: number, timon = false): Est => { const c = enCola(f); return [c.x, c.ba, timon ? bisagraCola(f) : c.bs, COLA.t, c.y]; };
const estTimon = (f: number): Est => { const c = enCola(f); return [c.x, bisagraCola(f) - TIMON.hueco, c.bs, COLA.t * 0.6, c.y]; };

// ── Motor ──────────────────────────────────────────────────────────────────
// Bóxer de dos cilindros detrás del cuerpo, con los cilindros a los lados, y
// la hélice de madera de dos palas que empuja desde detrás.
const MOTOR = { y: -0.17, z: -0.71 };
const HELICE = { y: MOTOR.y, z: -0.85, r: 0.55 };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-fp", secciones: SECCIONES, suave: 0.05, polo: true },
  {
    tipo: "ala", id: "ala", acabado: "gris-fp", y: 0,
    estaciones: [
      estAla(0), estAla(ALERON.desde), estAla(ALERON.desde, bisagra), estAla(ALERON.hasta, bisagra), estAla(ALERON.hasta),
      estAla(2.9), estAla(2.96), estAla(ALA.punta),
    ],
  },
  { tipo: "ala", id: "aleron", acabado: "gris-fp", y: 0, estaciones: [estAleron(ALERON.desde + ALERON.hueco), estAleron(ALERON.hasta - ALERON.hueco)] },
  // Vigas, con su punta de atrás tapada, y dos abrazaderas bajo el ala.
  ...LADOS.map((s): Pieza => ({
    tipo: "tubo", id: `viga-${s}`, acabado: "carbono-wh", centro: [s * VIGA.x, Y_VIGA],
    perfil: [[VIGA.delante, 0], [VIGA.delante - 0.01, VIGA.r], [VIGA.detras + 0.01, VIGA.r], [VIGA.detras, 0]],
  })),
  ...[0.12, -0.28].map((z, i): Pieza => ({ tipo: "caja", id: `abrazadera-${i}`, acabado: "negro", espejo: true, centro: [VIGA.x, -0.035, z], tam: [0.1, 0.075, 0.05], redondeo: 0.012 })),
  // Cola en V invertida y sus timones.
  { tipo: "ala", id: "cola", acabado: "gris-fp", y: 0, estaciones: [estCola(0), estCola(TIMON.desde), estCola(TIMON.desde, true), estCola(TIMON.hasta, true), estCola(TIMON.hasta), estCola(1)] },
  { tipo: "ala", id: "timon", acabado: "gris-fp", y: 0, estaciones: [estTimon(TIMON.desde + 0.01), estTimon(TIMON.hasta - 0.01)] },
  // Motor: cárter en el centro, un cilindro con aletas a cada lado, el filtro
  // de aire negro debajo y el buje de la hélice (foto de detrás).
  { tipo: "caja", id: "carter", acabado: "aluminio", centro: [0, MOTOR.y, MOTOR.z], tam: [0.17, 0.2, 0.2], redondeo: 0.03 },
  // Cilindros: a lo largo de x, de aluminio con aletas (discos finos) y la
  // culata.
  { tipo: "varilla", id: "cilindros", acabado: "aluminio", desde: [-0.25, MOTOR.y + 0.01, MOTOR.z], hasta: [0.25, MOTOR.y + 0.01, MOTOR.z], radio: 0.05, lados: 24 },
  ...[0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22].map((x, i): Pieza => ({ tipo: "disco", id: `aleta-${i}`, acabado: "aluminio", espejo: true, en: [x, MOTOR.y + 0.01, MOTOR.z], normal: [1, 0, 0], radio: 0.07, grosor: 0.007 })),
  { tipo: "caja", id: "culatas", acabado: "aluminio", espejo: true, centro: [0.255, MOTOR.y + 0.01, MOTOR.z], tam: [0.04, 0.13, 0.13], redondeo: 0.015 },
  // Corona dentada del arranque, entre el motor y la hélice, y el carburador
  // bajo el cárter, con el filtro.
  { tipo: "disco", id: "corona", acabado: "metal", en: [0, HELICE.y, MOTOR.z - 0.11], normal: [0, 0, 1], radio: 0.1, grosor: 0.02 },
  { tipo: "caja", id: "carburador", acabado: "aluminio", centro: [0, MOTOR.y - 0.13, MOTOR.z + 0.02], tam: [0.06, 0.06, 0.07], redondeo: 0.01 },
  { tipo: "disco", id: "filtro", acabado: "negro", en: [0, MOTOR.y - 0.21, MOTOR.z + 0.02], normal: [0, 1, 0], radio: 0.045, grosor: 0.08 },
  { tipo: "disco", id: "buje", acabado: "aluminio", en: [0, HELICE.y, HELICE.z + 0.04], normal: [0, 0, 1], radio: 0.06, grosor: 0.06 },
  { tipo: "helice", id: "helice", acabado: "madera-fp", en: [0, HELICE.y, HELICE.z], radio: HELICE.r, palas: 2, giro: 70, ancho: 0.11, buje: 0 },
];
// Cierres del costado (fotos de Kiev y de fábrica): dos bandas negras con un
// tornillo en cada punta que cruzan la junta de la tapa del morro, otra
// vertical bajo el borde de ataque y una caja negra junto a la raíz del ala.
const CIERRES: [number, number, number, number][] = [[-0.115, 0.71, -0.112, 0.8], [-0.275, 0.72, -0.277, 0.81]];
PIEZAS.push(
  ...CIERRES.flatMap(([y0, z0, y1, z1], i): Pieza[] => [
    { tipo: "caja", id: `cierre-${i}`, acabado: "negro", espejo: true, centro: [CUERPO.ancho + 0.003, (y0 + y1) / 2, (z0 + z1) / 2], tam: [0.006, 0.012, z1 - z0] },
    ...[z0, z1].map((z, k): Pieza => ({ tipo: "disco", id: `tornillo-${i}-${k}`, acabado: "aluminio", espejo: true, en: [CUERPO.ancho + 0.006, k ? y1 : y0, z], normal: [1, 0, 0], radio: 0.011, grosor: 0.005 })),
  ]),
  { tipo: "caja", id: "cierre-ala", acabado: "negro", espejo: true, centro: [CUERPO.ancho + 0.003, -0.05, 0.322], tam: [0.006, 0.09, 0.012] },
  { tipo: "disco", id: "tornillo-ala", acabado: "aluminio", espejo: true, en: [CUERPO.ancho + 0.006, -0.09, 0.322], normal: [1, 0, 0], radio: 0.011, grosor: 0.005 },
  { tipo: "caja", id: "caja-raiz", acabado: "negro", espejo: true, centro: [CUERPO.ancho + 0.012, -0.045, 0.19], tam: [0.03, 0.04, 0.07], redondeo: 0.008 },
  { tipo: "caja", id: "interruptor", acabado: "negro", centro: [-CUERPO.ancho - 0.004, -0.193, 0.584], tam: [0.01, 0.025, 0.025] },
);
// Escapes: de cada culata suben y van hacia delante por encima del cuerpo,
// con su silenciador, hasta encima del ala.
PIEZAS.push(
  ...LADOS.map((s): Pieza => ({
    tipo: "codo", id: `escape-${s}`, acabado: "aluminio",
    puntos: [[s * 0.26, MOTOR.y + 0.06, MOTOR.z, 0.018], [s * 0.2, MOTOR.y + 0.24, MOTOR.z + 0.02, 0.018], [s * 0.09, 0.13, MOTOR.z + 0.14, 0.018], [s * 0.07, 0.15, -0.5, 0.018]],
  })),
  ...LADOS.map((s): Pieza => ({
    tipo: "tubo", id: `silenciador-${s}`, acabado: "aluminio", centro: [s * 0.07, 0.15],
    perfil: [[0.1, 0], [0.09, 0.025], [0.05, 0.04], [-0.42, 0.04], [-0.46, 0.025], [-0.5, 0.018], [-0.501, 0]],
  })),
  // Cada silenciador, sobre dos patas cortas atornilladas al ala.
  ...[0.0, -0.36].map((z, i): Pieza => ({ tipo: "caja", id: `pata-silenciador-${i}`, acabado: "aluminio", espejo: true, centro: [0.07, 0.1, z], tam: [0.025, 0.04, 0.03] })),
);

// ── Rampa y cohete (botón «Rampa») ─────────────────────────────────────────
// El FP-1 despega de una rampa inclinada con un cohete de combustible sólido
// colgado bajo la cola; el motor ya va en marcha.
const CABECEO = 18;
// Muy inclinado (unos 35°, foto de detrás), para que empuje por el centro de gravedad.
const COHETE = { r: 0.075, delante: [0, -0.46, -0.1] as P3, detras: [0, -0.95, -0.8] as P3 };
// Dos vigas, con el cohete colgando entre ellas.
const RAIL = { y: -0.8, x: 0.17, delante: 1.6, detras: -3.4 };
// Suelo: en los ejes del mundo (con el cabeceo puesto), 0,35 m por debajo del
// final de los raíles; en los del dron, una recta inclinada.
const rad = (g: number) => (g * Math.PI) / 180;
const SUELO = RAIL.y * Math.cos(rad(CABECEO)) + RAIL.detras * Math.sin(rad(CABECEO)) - 0.35;
const delMundo = (x: number, yw: number, zw: number): P3 => [x, yw * Math.cos(rad(CABECEO)) - zw * Math.sin(rad(CABECEO)), yw * Math.sin(rad(CABECEO)) + zw * Math.cos(rad(CABECEO))];
const enMundo = (y: number, z: number) => ({ y: y * Math.cos(rad(CABECEO)) + z * Math.sin(rad(CABECEO)), z: -y * Math.sin(rad(CABECEO)) + z * Math.cos(rad(CABECEO)) });
const pata = (z: number, x: number): Pieza[] => {
  const w = enMundo(RAIL.y - 0.1, z);
  return LADOS.map((s, i): Pieza => ({ tipo: "varilla", id: `pata-${z}-${i}`, acabado: "metal", desde: [s * RAIL.x, RAIL.y - 0.1, z], hasta: delMundo(s * x, SUELO, w.z), radio: 0.025 }));
};
// El cohete, a lo largo de su eje inclinado (el tubo sube su eje con `sube`).
const cohete = (): Pieza[] => {
  const [, y0, z0] = COHETE.delante, [, y1, z1] = COHETE.detras;
  const eje = (z: number) => y0 + ((z - z0) * (y1 - y0)) / (z1 - z0);
  const r = COHETE.r;
  const sobre = (pts: [number, number][]) => pts.map(([z, q]): [number, number, number] => [z, q, eje(z)]);
  return [
    // La jaula de aluminio ranurada y, dentro, el cohete gris.
    { tipo: "tubo", id: "cohete-jaula", acabado: "aluminio", centro: [0, 0], perfil: sobre([[z0, 0], [z0 - 0.01, r], [z1 + 0.1, r], [z1 + 0.099, 0]]) },
    { tipo: "tubo", id: "cohete", acabado: "campana-wh", centro: [0, 0], perfil: sobre([[z1 + 0.1, r * 0.8], [z1 + 0.04, r * 0.8], [z1 + 0.039, 0]]) },
    // Tobera de color pardo, abierta hacia atrás.
    { tipo: "tubo", id: "cohete-tobera", acabado: "pardo-gr", centro: [0, 0], perfil: sobre([[z1 + 0.04, 0.035], [z1, 0.05], [z1 - 0.001, 0]]) },
    // Dos varillas de carbono del frente del cohete a la panza.
    ...LADOS.map((s, i): Pieza => ({ tipo: "varilla", id: `cohete-varilla-${i}`, acabado: "carbono-wh", desde: [s * 0.05, eje(z0 - 0.15) + 0.05, z0 - 0.15], hasta: [s * 0.08, CUERPO.abajo + 0.01, 0.55], radio: 0.012 })),
    { tipo: "caja", id: "cohete-pie", acabado: "metal", centro: [0, (CUERPO.abajo + eje(z0 - 0.05) + r) / 2, z0 - 0.05], tam: [0.08, CUERPO.abajo - eje(z0 - 0.05) - r + 0.02, 0.1] },
  ];
};
const piezasCatapulta: Pieza[] = [
  // Los raíles: dos vigas largas unidas por travesaños, y la cuna en la que
  // apoya la panza.
  ...LADOS.map((s, i): Pieza => ({ tipo: "caja", id: `rail-${i}`, acabado: "metal", centro: [s * RAIL.x, RAIL.y - 0.05, (RAIL.delante + RAIL.detras) / 2], tam: [0.07, 0.1, RAIL.delante - RAIL.detras] })),
  ...[1.4, 0.2, -1.4, -3.2].map((z, i): Pieza => ({ tipo: "caja", id: `travesano-${i}`, acabado: "metal", centro: [0, RAIL.y - 0.08, z], tam: [2 * RAIL.x, 0.04, 0.06] })),
  // La cuna, alta para que la hélice no toque los raíles: dos postes y una
  // pieza curva bajo la panza, delante y detrás.
  ...[0.95, 0.25].flatMap((z, i): Pieza[] => [
    { tipo: "caja", id: `cuna-${i}`, acabado: "metal", centro: [0, CUERPO.abajo - 0.02, z], tam: [2 * RAIL.x + 0.07, 0.04, 0.08] },
    ...LADOS.map((s, j): Pieza => ({ tipo: "caja", id: `poste-${i}-${j}`, acabado: "metal", centro: [s * RAIL.x, (CUERPO.abajo + RAIL.y) / 2, z], tam: [0.05, CUERPO.abajo - RAIL.y - 0.02, 0.05] })),
  ]),
  ...pata(1.2, 0.6), ...pata(-1.4, 0.5),
  ...cohete(),
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Marcas del costado derecho del ejemplar de Kiev (el único lado fotografiado
// de cerca), colocadas con la cámara encajada: bajo el borde de ataque, el
// aviso amarillo de «no dar corriente» entre dos etiquetas blancas, y detrás,
// la etiqueta vertical del arranque (foto de detrás).
const DERECHA: P3 = [-1, 0, 0];
const XD = -CUERPO.ancho;
const CALCAS: Calca[] = [
  { sobre: ["fuselaje"], en: [XD, -0.002 - 0.015, 0.34], desde: DERECHA, tam: [0.11, 0.022], dibujo: { tipo: "rect", color: "#e9e9e4" }, capa: 1 },
  { sobre: ["fuselaje"], en: [XD, -0.002 - 0.015, 0.34], desde: DERECHA, tam: [0.1, 0.016], dibujo: { tipo: "texto", texto: "ЗАКРІПИТИ", fino: true }, capa: 2 },
  { sobre: ["fuselaje"], en: [XD, -0.136, 0.32], desde: DERECHA, tam: [0.14, 0.042], dibujo: { tipo: "aviso" } },
  { sobre: ["fuselaje"], en: [XD, -0.184, 0.324], desde: DERECHA, tam: [0.09, 0.02], dibujo: { tipo: "rect", color: "#e9e9e4" }, capa: 1 },
  { sobre: ["fuselaje"], en: [XD, -0.184, 0.324], desde: DERECHA, tam: [0.08, 0.014], dibujo: { tipo: "texto", texto: "ЖИВЛЕННЯ", fino: true }, capa: 2 },
  { sobre: ["fuselaje"], en: [XD, -0.17, -0.33], desde: DERECHA, tam: [0.045, 0.15], dibujo: { tipo: "rect", color: "#e9e9e4" }, capa: 1 },
  { sobre: ["fuselaje"], en: [XD, -0.17, -0.33], desde: DERECHA, tam: [0.13, 0.035], giro: 90, dibujo: { tipo: "texto", texto: "СТАРТЕР\nЗАПАЛЮВАННЯ", fino: true }, capa: 2 },
];
const ARRIBA: P3 = [0, 1, 0];
const COSTURAS: Costura[] = [
  // Junta de la tapa del morro: arriba y por los costados.
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.24, 0.2, CUERPO.tapa], [0, 0.2, CUERPO.tapa], [0.24, 0.2, CUERPO.tapa]] },
  { sobre: ["fuselaje"], desde: [1, 0, 0], espejo: true, puntos: [[0.4, -0.01, CUERPO.tapa], [0.4, -0.19, CUERPO.tapa], [0.4, -0.37, CUERPO.tapa]] },
  // Las dos mitades del ala se juntan en el centro, y cada tramo de fuera
  // se une al de dentro con una cinta, junto a las vigas (foto de fábrica).
  { sobre: ["ala"], desde: ARRIBA, puntos: [[0, 0.3, ALA.ba], [0, 0.3, ALA.bs]] },
  ...[0.74, 0.8].map((x): Costura => ({ sobre: ["ala"], desde: ARRIBA, espejo: true, puntos: [[x, 0.3, ALA.ba], [x, 0.3, ALA.bs]] })),
];

const PARTES: Parte[] = [
  {
    nombre: "Cuerpo",
    en: [CUERPO.ancho + 0.05, -0.2, 1.0],
    piezas: ["fuselaje", ...[0, 1].flatMap((i) => [`cierre-${i}`, `tornillo-${i}-0`, `tornillo-${i}-1`]), "cierre-ala", "tornillo-ala", "caja-raiz", "interruptor"],
    respaldo: "foto",
    fuentes: ["kiev", "fabrica", "taller"],
    texto: "Una caja larga de aristas redondeadas, con la tapa del morro aparte. Dentro van la ojiva, de 60 kg, el combustible y la navegación; delante del ala, un lomo estrecho.",
    nota: "La forma, de las fotos; qué lleva dentro, de Fire Point y la prensa.",
  },
  {
    nombre: "Ala recta",
    en: [2.2, 0.15, 0],
    piezas: ["ala", "aleron"],
    respaldo: "foto",
    fuentes: ["kiev", "fabrica", "fakty"],
    texto: "6 m de punta a punta, recta y sin diedro, en dos mitades unidas encima del cuerpo con una cinta. Los alerones de fuera hacen también de flaps.",
    nota: "La envergadura es la de Fire Point; la cuerda y el grueso, medidos en las fotos.",
  },
  {
    nombre: "Vigas y cola en V invertida",
    en: [0, COLA.yVertice + 0.2, -2.35],
    piezas: ["viga-1", "viga--1", "abrazadera-0", "abrazadera-1", "cola", "timon"],
    respaldo: "foto",
    fuentes: ["kiev", "rampa", "mspo"],
    texto: "Dos tubos de carbono atornillados bajo el ala llevan la cola: dos superficies que suben desde ellos y se juntan arriba, en el centro.",
  },
  {
    nombre: "Motor y hélice",
    en: [0.35, MOTOR.y, MOTOR.z],
    piezas: ["carter", "cilindros", ...[0, 1, 2, 3, 4, 5, 6].map((i) => `aleta-${i}`), "culatas", "corona", "carburador", "filtro", "buje", "helice"],
    respaldo: "foto",
    fuentes: ["motor", "mspo"],
    texto: "Un motor de pistón de dos cilindros opuestos detrás del cuerpo, con una hélice de madera de dos palas que empuja desde detrás.",
  },
  {
    nombre: "Escapes",
    en: [0, 0.3, -0.6],
    piezas: ["escape-1", "escape--1", "silenciador-1", "silenciador--1", "pata-silenciador-0", "pata-silenciador-1"],
    respaldo: "foto",
    fuentes: ["motor", "kiev", "rampa"],
    texto: "Los dos escapes suben de los cilindros y van hacia delante por encima del cuerpo, cada uno con su silenciador, hasta encima del ala.",
  },
  {
    nombre: "Rampa",
    en: [RAIL.x + 0.1, RAIL.y - 0.05, -2.2],
    piezas: piezasCatapulta.map((p) => p.id).filter((id) => !id.startsWith("cohete")),
    respaldo: "foto",
    fuentes: ["rampa", "noche"],
    texto: "No necesita pista: sale de una rampa inclinada sobre un remolque o un camión, apoyado en una cuna alta, y la deja empujado por el cohete.",
    nota: "La rampa es la de las fotos de Fire Point (de una versión anterior del dron); la inclinación, 18°, y las patas son aproximadas.",
    catapulta: true,
  },
  {
    nombre: "Cohete de despegue",
    en: [0.12, COHETE.detras[1], COHETE.detras[2] + 0.2],
    piezas: piezasCatapulta.map((p) => p.id).filter((id) => id.startsWith("cohete")),
    respaldo: "foto",
    fuentes: ["motor", "despegue"],
    texto: "Un cohete de combustible sólido dentro de una jaula de aluminio, colgado bajo la cola y muy inclinado para que empuje por el centro del dron. Arde un par de segundos y se suelta; el motor ya iba en marcha.",
    nota: "La jaula, las varillas y la inclinación salen de la foto del ejemplar de Kiev, que lo lleva puesto.",
    catapulta: true,
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.lomo !== undefined && { lomo: u(q.lomo) }), ...(q.hombro !== undefined && { hombro: u(q.hombro) }) })), ...(p.suave && { suave: u(p.suave) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): Est => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "codo":
      return { ...p, puntos: p.puntos.map((q) => q.map(u) as typeof q) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "FP-1",
  subtitulo: "Dron de ataque de largo alcance",
  escala: ESCALA,
  pais: bandera("UA"),
  resalte: "tinta",
  hd: true,
  // Su gris al sol tiene una luminosidad de 0,73-0,76 en el HD, en el borde
  // bajo de un escalón del pixel: corrido 0,3.
  desfaseLuz: 0.3,
  // La planta de la portada, pintada al doble: las vigas, finas, no se pierden.
  plantaDoble: true,
  contornoPixel: true,
  // Tarjeta de /uas: desde más arriba, como los drones de ala larga.
  vistaTarjeta: [61, 20],
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  catapulta: { piezas: piezasCatapulta.map(aUnidades), cabeceo: CABECEO, nombre: "Rampa" },
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "kiev", imagen: "kiev-delante.jpg", titulo: "El ejemplar gris de Kiev, de tres cuartos por delante", medio: "Mezha Media / RBC-Ukraine (Militarnyi)", url: "https://militarnyi.com/en/news/it-can-fly-up-to-1600-km-ukraine-presents-fp-1-attack-drone/" },
    { id: "motor", imagen: "kiev-motor.jpg", titulo: "El mismo, por detrás: motor, hélice y cohete de despegue", medio: "Mezha Media / RBC-Ukraine (Militarnyi)", url: "https://militarnyi.com/en/news/it-can-fly-up-to-1600-km-ukraine-presents-fp-1-attack-drone/" },
    { id: "fabrica", imagen: "fabrica.jpg", titulo: "En la fábrica, desde arriba", medio: "AP (UNITED24 Media)", url: "https://united24media.com/latest-news/ukraines-fp-1-drone-becomes-anti-aircraft-platform-to-hunt-russian-uavs-16946" },
    { id: "taller", imagen: "taller.jpg", titulo: "En el taller, desde arriba por detrás", medio: "H I Sutton (Covert Shores)", url: "https://www.hisutton.com/FP-1-Drone.html" },
    { id: "rampa", imagen: "rampa.jpg", titulo: "En su rampa, al amanecer (versión primera)", medio: "Fire Point (drone-warfare.com)", url: "https://drone-warfare.com/research/fire-point-fp-1/" },
    { id: "noche", imagen: "noche.jpg", titulo: "En la rampa, de noche", medio: "Fire Point (Defender Media)", url: "https://thedefender.media/en/2026/07/new-fire-point-fp1-3400/" },
    { id: "despegue", imagen: "despegue.jpg", titulo: "Despegando con el cohete encendido", medio: "Fire Point (Defender Media)", url: "https://thedefender.media/en/2026/07/new-fire-point-fp1-3400/" },
    { id: "mspo", imagen: "mspo.jpg", titulo: "Colgado en la feria MSPO 2026, en Kielce", medio: "Michał Derela (Wikimedia Commons)", url: `${COMMONS}FP1-2_MSPO2026_4.jpg` },
    { id: "fakty", titulo: "Ficha del FP-1 con los datos de Fire Point", medio: "Fakty", url: "https://fakty.com.ua/ua/ukraine/20260618-dron-fp-1-shho-vidomo-pro-ukrayinskyj-bpla-yakyj-polyuye-na-rosijski-npz/" },
  ],
};

export default maqueta;
