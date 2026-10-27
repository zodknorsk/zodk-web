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
// Una caja de lo alto plano (el ala va encima) y costados verticales; abajo,
// una arista viva a lo largo y un chaflán hasta la panza plana y ancha
// (fotos de detrás y de MSPO desde abajo). La tapa del morro, en forma de
// bala: por arriba baja desde la junta y por abajo sube en el último tercio
// (foto de Kiev de lado); de planta, redonda. Detrás, la panza sube hasta
// una cara inclinada con la bancada del motor.
const CUERPO = { tapa: 0.75, ancho: 0.24, abajo: -0.38, cola: -0.62 };
const suave = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const elipse = (z: number, z0: number, largo: number) => Math.sqrt(Math.max(0, 1 - ((z - z0) / largo) ** 2));
type P2 = [number, number];
const medidasCuerpo = (z: number) => {
  const techo = z > CUERPO.tapa ? -0.19 + 0.19 * elipse(z, CUERPO.tapa, 1.3 - CUERPO.tapa) : 0;
  const panza = z > 1.0 ? -0.19 - 0.19 * elipse(z, 1.0, 0.3) : CUERPO.abajo + 0.22 * suave(-0.45, CUERPO.cola, z);
  const ancho = (z > 1.0 ? CUERPO.ancho * elipse(z, 1.0, 0.3) : CUERPO.ancho) - 0.012 * suave(-0.4, CUERPO.cola, z);
  return { techo, panza, ancho };
};
// Media sección derecha, en tres tramos con arista viva entre ellos: lo alto
// y el costado (con la esquina de arriba redonda), el chaflán y la panza.
const contornoCuerpo = (z: number): P2[][] => {
  const { techo, panza, ancho: w } = medidasCuerpo(z);
  const alto = techo - panza, arista = panza + 0.21 * alto, wb = w * 0.75;
  const r = Math.min(0.035, w * 0.3, alto * 0.2);
  const esquina = [0.25, 0.5, 0.75].map((f): P2 => [w - r + r * Math.sin((f * Math.PI) / 2), techo - r + r * Math.cos((f * Math.PI) / 2)]);
  return [
    [[0, techo], [w - r, techo], ...esquina, [w, techo - r], [w, arista]],
    [[w, arista], [wb, panza]],
    [[wb, panza], [0, panza]],
  ];
};
const ZS_CUERPO = [1.3, 1.295, 1.285, 1.27, 1.25, 1.22, 1.18, 1.13, 1.07, 1.0, 0.92, 0.84, 0.75, 0.5, 0.0, -0.3, -0.45, -0.52, -0.58, CUERPO.cola];
const SECCIONES: Seccion[] = ZS_CUERPO.map((z) => {
  const { techo, panza, ancho } = medidasCuerpo(z);
  return { z, ancho, arriba: techo, abajo: panza, contorno: contornoCuerpo(z) };
});
// La tapa de lo alto, delante del ala: una pieza aparte que cubre el cuerpo
// desde la junta del morro, con un reborde que sobresale 7 mm por el costado
// (lo sujeta el cierre de «ЗАКРІПИТИ») y, encima, el lomo de lados
// inclinados que sube despacio hasta el borde de ataque (fotos de Kiev y de
// fábrica).
const TAPA = { delante: CUERPO.tapa, detras: 0.24, ancho: 0.247, borde: -0.055, alto: 0.006 };
const altoLomo = (z: number) => TAPA.alto + 0.03 * suave(0.75, 0.68, z) + 0.065 * suave(0.68, 0.3, z);
const contornoTapa = (z: number): P2[][] => {
  const h = altoLomo(z), r = 0.012;
  return [
    [[0, h], [0.12, h], [0.2, TAPA.alto], [TAPA.ancho - r, TAPA.alto], [TAPA.ancho - r * 0.3, TAPA.alto - r * 0.3], [TAPA.ancho, TAPA.alto - r], [TAPA.ancho, TAPA.borde]],
    [[TAPA.ancho, TAPA.borde], [0, TAPA.borde]],
  ];
};
const SECCIONES_TAPA: Seccion[] = [TAPA.delante, 0.735, 0.7, 0.65, 0.55, 0.45, 0.35, TAPA.detras].map((z) => ({ z, ancho: TAPA.ancho, arriba: altoLomo(z), abajo: TAPA.borde, contorno: contornoTapa(z) }));

// ── Vigas y cola ───────────────────────────────────────────────────────────
// Dos tubos de carbono colgados bajo el ala con abrazaderas, hasta la cola en
// V invertida: cada mitad sube de una viga al centro, donde se une con la
// otra.
const VIGA = { x: 0.68, r: 0.035, delante: 0.2, detras: -2.02 };
const Y_VIGA = -VIGA.r;
// Encajada en el render de Fire Point (ficha de Fakty) y en la foto de Kiev:
// cada mitad baja del vértice, 0,36 m sobre el ala, hasta 1 m del centro y
// 0,16 m por debajo; las vigas, a 0,68 m, quedan justo debajo del panel.
const COLA = { xPie: 1.0, yPie: -0.157, yVertice: 0.363, ba: -1.7, bs: -2.06, grosor: 0.018 };
// Cada mitad es una placa plana y fina (foto de Kiev), con las puntas
// cortadas en recto: se dibuja colgando del vértice y se tumba hacia fuera.
const LARGO_COLA = Math.hypot(COLA.xPie, COLA.yVertice - COLA.yPie);
const TUMBA_COLA = (Math.atan2(COLA.xPie, COLA.yVertice - COLA.yPie) * 180) / Math.PI;
// El timón, el 30 % de atrás de la cuerda, casi de punta a punta.
const TIMON = { bisagra: COLA.ba - 0.7 * (COLA.ba - COLA.bs), hueco: 0.006, margen: 0.03 };
// Altura del plano de la cola a una distancia x del centro.
const yCola = (x: number) => COLA.yVertice + ((COLA.yPie - COLA.yVertice) * x) / COLA.xPie;

// ── Motor ──────────────────────────────────────────────────────────────────
// Bóxer de dos cilindros detrás del cuerpo, con los cilindros a los lados, y
// la hélice de madera de dos palas que empuja desde detrás.
const MOTOR = { y: -0.17, z: -0.71 };
const HELICE = { y: MOTOR.y, z: -0.85, r: 0.55 };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-fp", secciones: SECCIONES, tapaPlana: true },
  { tipo: "casco", id: "tapa-lomo", acabado: "gris-fp", secciones: SECCIONES_TAPA, tapaPlana: true },
  {
    tipo: "ala", id: "ala", acabado: "gris-fp", y: 0,
    estaciones: [
      estAla(0), estAla(ALERON.desde), estAla(ALERON.desde, bisagra), estAla(ALERON.hasta, bisagra), estAla(ALERON.hasta),
      estAla(2.9), estAla(2.96), estAla(ALA.punta),
    ],
  },
  // Las cintas de las uniones del ala, en relieve: la del centro, sobre el
  // cuerpo, y la de cada tramo de fuera, junto a la viga (foto de fábrica).
  { tipo: "ala", id: "cinta-centro", acabado: "gris-fp", y: 0, estaciones: [[0, ALA.ba + 0.004, ALA.bs - 0.002, T_ALA * 1.08, SUBE_ALA], [0.05, ALA.ba + 0.004, ALA.bs - 0.002, T_ALA * 1.08, SUBE_ALA]] },
  { tipo: "ala", id: "cintas", acabado: "gris-fp", y: 0, estaciones: [[0.74, ALA.ba + 0.004, ALA.bs - 0.002, T_ALA * 1.08, SUBE_ALA], [0.8, ALA.ba + 0.004, ALA.bs - 0.002, T_ALA * 1.08, SUBE_ALA]] },
  { tipo: "ala", id: "aleron", acabado: "gris-fp", y: 0, estaciones: [estAleron(ALERON.desde + ALERON.hueco), estAleron(ALERON.hasta - ALERON.hueco)] },
  // Vigas, con su punta de atrás tapada, y dos abrazaderas bajo el ala.
  ...LADOS.map((s): Pieza => ({
    tipo: "tubo", id: `viga-${s}`, acabado: "carbono-wh", centro: [s * VIGA.x, Y_VIGA],
    perfil: [[VIGA.delante, 0], [VIGA.delante - 0.01, VIGA.r], [VIGA.detras + 0.01, VIGA.r], [VIGA.detras, 0]],
  })),
  ...[0.12, -0.28].map((z, i): Pieza => ({ tipo: "caja", id: `abrazadera-${i}`, acabado: "negro", espejo: true, centro: [VIGA.x, -0.035, z], tam: [0.1, 0.075, 0.05], redondeo: 0.012 })),
  // Cola en V invertida y sus timones.
  { tipo: "placa", id: "cola", acabado: "gris-fp", plano: "vertical", x: 0, y: COLA.yVertice, espejo: true, inclinacion: TUMBA_COLA, grosor: COLA.grosor, bisel: 0.004, planta: [[COLA.ba, 0], [TIMON.bisagra, 0], [TIMON.bisagra, -LARGO_COLA], [COLA.ba, -LARGO_COLA]] },
  { tipo: "placa", id: "timon", acabado: "gris-fp", plano: "vertical", x: 0, y: COLA.yVertice, espejo: true, inclinacion: TUMBA_COLA, grosor: COLA.grosor * 0.8, bisel: 0.003, planta: [[TIMON.bisagra - TIMON.hueco, -TIMON.margen], [COLA.bs, -TIMON.margen], [COLA.bs, -LARGO_COLA + TIMON.margen], [TIMON.bisagra - TIMON.hueco, -LARGO_COLA + TIMON.margen]] },
  // El tubo de unión de las dos mitades, a lo largo del vértice.
  { tipo: "varilla", id: "tubo-vertice", acabado: "gris-fp", desde: [0, COLA.yVertice + 0.004, COLA.ba + 0.01], hasta: [0, COLA.yVertice + 0.004, COLA.bs - 0.005], radio: 0.013, lados: 16 },
  // Donde la viga llega a la cola (foto de Kiev): la viga pasa bajo el panel
  // y un manguito gris la sujeta abrazando el panel por encima, con una brida
  // metálica en la viga; encima, el brazo negro del timón con su varilla.
  { tipo: "caja", id: "soporte-cola", acabado: "gris-fp", espejo: true, centro: [VIGA.x, Y_VIGA + 0.012, -1.79], tam: [0.08, 0.04, 0.14], redondeo: 0.012 },
  ...LADOS.map((s): Pieza => ({ tipo: "caja", id: `manguito-cola-${s}`, acabado: "gris-fp", centro: [s * VIGA.x, yCola(VIGA.x) + 0.012, -1.79], tam: [0.1, 0.012, 0.13], redondeo: 0.005, girar: { centro: [s * VIGA.x, yCola(VIGA.x), -1.79], eje: "z", grados: s * -(90 - TUMBA_COLA) } })),
  ...LADOS.map((s): Pieza => ({ tipo: "tubo", id: `brida-cola-${s}`, acabado: "aluminio", centro: [s * VIGA.x, Y_VIGA], perfil: [[-1.69, VIGA.r + 0.004], [-1.71, VIGA.r + 0.004]] })),
  ...LADOS.map((s): Pieza => ({ tipo: "placa", id: `brazo-timon-${s}`, acabado: "negro", plano: "vertical", x: s * (VIGA.x + 0.07), grosor: 0.004, planta: [[-1.93, yCola(VIGA.x + 0.07) + 0.005], [-1.985, yCola(VIGA.x + 0.07) + 0.005], [-1.96, yCola(VIGA.x + 0.07) + 0.05]] })),
  ...LADOS.map((s): Pieza => ({ tipo: "varilla", id: `varilla-brazo-${s}`, acabado: "metal", desde: [s * (VIGA.x + 0.07), yCola(VIGA.x + 0.07) + 0.045, -1.96], hasta: [s * (VIGA.x + 0.05), yCola(VIGA.x + 0.05) + 0.02, -1.82], radio: 0.003 })),
  // La varilla de mando fina bajo cada viga, de la raíz del ala a la cola.
  { tipo: "varilla", id: "varilla-timon", acabado: "negro", espejo: true, desde: [VIGA.x - 0.01, -0.085, -0.2], hasta: [VIGA.x, -0.075, -1.72], radio: 0.005 },
  // Motor (foto de detrás y de MSPO desde abajo): bóxer de dos cilindros con
  // muchas aletas, la culata con su bujía, la corona dentada del arranque
  // entre el motor y la hélice, el carburador debajo con el filtro negro
  // grande, y la bancada atornillada a la cara de atrás del cuerpo.
  { tipo: "caja", id: "bancada", acabado: "aluminio", centro: [0, MOTOR.y + 0.01, CUERPO.cola - 0.012], tam: [0.2, 0.17, 0.024], redondeo: 0.01 },
  { tipo: "caja", id: "carter", acabado: "aluminio", centro: [0, MOTOR.y, MOTOR.z], tam: [0.15, 0.2, 0.16], redondeo: 0.03 },
  { tipo: "varilla", id: "cilindros", acabado: "aluminio", desde: [-0.22, MOTOR.y + 0.01, MOTOR.z], hasta: [0.22, MOTOR.y + 0.01, MOTOR.z], radio: 0.055, lados: 24 },
  ...Array.from({ length: 9 }, (_, i) => 0.085 + i * 0.016).map((x, i): Pieza => ({ tipo: "disco", id: `aleta-${i}`, acabado: "aluminio", espejo: true, en: [x, MOTOR.y + 0.01, MOTOR.z], normal: [1, 0, 0], radio: 0.085, grosor: 0.005 })),
  { tipo: "caja", id: "culatas", acabado: "aluminio", espejo: true, centro: [0.25, MOTOR.y + 0.015, MOTOR.z], tam: [0.06, 0.15, 0.14], redondeo: 0.015 },
  ...[-0.045, -0.015, 0.015, 0.045].map((dz, i): Pieza => ({ tipo: "caja", id: `aleta-culata-${i}`, acabado: "aluminio", espejo: true, centro: [0.285, MOTOR.y + 0.015, MOTOR.z + dz], tam: [0.025, 0.14, 0.004] })),
  { tipo: "varilla", id: "bujias", acabado: "negro", espejo: true, desde: [0.26, MOTOR.y + 0.08, MOTOR.z - 0.03], hasta: [0.3, MOTOR.y + 0.13, MOTOR.z - 0.05], radio: 0.011 },
  { tipo: "disco", id: "corona", acabado: "metal", en: [0, HELICE.y, MOTOR.z - 0.105], normal: [0, 0, 1], radio: 0.11, grosor: 0.016 },
  { tipo: "disco", id: "volante", acabado: "aluminio", en: [0, HELICE.y, MOTOR.z - 0.09], normal: [0, 0, 1], radio: 0.075, grosor: 0.03 },
  { tipo: "caja", id: "carburador", acabado: "aluminio", centro: [0, MOTOR.y - 0.14, MOTOR.z + 0.01], tam: [0.06, 0.07, 0.07], redondeo: 0.01 },
  { tipo: "disco", id: "filtro", acabado: "negro", en: [0, MOTOR.y - 0.24, MOTOR.z + 0.01], normal: [0, 1, 0], radio: 0.055, grosor: 0.1 },
  // Buje de la hélice con sus seis tornillos.
  { tipo: "disco", id: "buje", acabado: "aluminio", en: [0, HELICE.y, HELICE.z + 0.03], normal: [0, 0, 1], radio: 0.055, grosor: 0.05 },
  ...Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3).map((g, i): Pieza => ({ tipo: "disco", id: `tornillo-buje-${i}`, acabado: "metal", en: [0.035 * Math.cos(g), HELICE.y + 0.035 * Math.sin(g), HELICE.z - 0.008], normal: [0, 0, -1], radio: 0.008, grosor: 0.01 })),
  { tipo: "helice", id: "helice", acabado: "madera-fp", en: [0, HELICE.y, HELICE.z], radio: HELICE.r, palas: 2, giro: 70, ancho: 0.13, buje: 0 },
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
  // Conectores naranjas, en el costado derecho: el de la carga bajo el aviso
  // y los tres del arranque y del encendido, detrás.
  { tipo: "disco", id: "conector", acabado: "laton", en: [-CUERPO.ancho - 0.002, -0.168, 0.32], normal: [-1, 0, 0], radio: 0.007, grosor: 0.006 },
  ...[0.3, 0.34].map((z, i): Pieza => ({ tipo: "disco", id: `tornillo-conector-${i}`, acabado: "aluminio", en: [-CUERPO.ancho - 0.002, -0.168, z], normal: [-1, 0, 0], radio: 0.003, grosor: 0.003 })),
  ...[-0.48, -0.45, -0.42].map((z, i): Pieza => ({ tipo: "disco", id: `conector-arranque-${i}`, acabado: "laton", en: [-CUERPO.ancho - 0.002, -0.055, z], normal: [-1, 0, 0], radio: 0.008, grosor: 0.006 })),
);
// Escapes (fotos de detrás y de Kiev): de cada culata, un tubo grueso sube,
// se dobla en U hacia delante y entra en un silenciador largo que va por
// encima del cuerpo, detrás del ala, y sigue sobre ella; dos abrazaderas,
// la boca redonda delante con un tubito de salida, y dos patas.
const SILENCIADOR = { x: 0.1, y: 0.14, r: 0.045, delante: 0.0, detras: -0.64 };
PIEZAS.push(
  ...LADOS.map((s): Pieza => ({
    tipo: "codo", id: `escape-${s}`, acabado: "aluminio",
    puntos: [[s * 0.25, MOTOR.y + 0.09, MOTOR.z - 0.02, 0.022], [s * 0.25, 0.03, MOTOR.z - 0.07, 0.022], [s * 0.2, SILENCIADOR.y, MOTOR.z - 0.04, 0.022], [s * SILENCIADOR.x, SILENCIADOR.y, SILENCIADOR.detras - 0.01, 0.022]],
  })),
  ...LADOS.map((s): Pieza => ({
    tipo: "tubo", id: `silenciador-${s}`, acabado: "aluminio", centro: [s * SILENCIADOR.x, SILENCIADOR.y],
    perfil: [[SILENCIADOR.delante + 0.06, 0], [SILENCIADOR.delante + 0.055, 0.012], [SILENCIADOR.delante + 0.02, 0.012], [SILENCIADOR.delante + 0.015, 0.03], [SILENCIADOR.delante, SILENCIADOR.r], [SILENCIADOR.detras + 0.03, SILENCIADOR.r], [SILENCIADOR.detras, 0.028], [SILENCIADOR.detras - 0.001, 0]],
  })),
  ...LADOS.flatMap((s) => [-0.12, -0.45].map((z, i): Pieza => ({ tipo: "tubo", id: `abrazadera-silenciador-${s}-${i}`, acabado: "metal", centro: [s * SILENCIADOR.x, SILENCIADOR.y], perfil: [[z + 0.012, SILENCIADOR.r + 0.004], [z - 0.012, SILENCIADOR.r + 0.004]] }))),
  ...[-0.12, -0.45].map((z, i): Pieza => ({ tipo: "caja", id: `pata-silenciador-${i}`, acabado: "aluminio", espejo: true, centro: [SILENCIADOR.x, (SILENCIADOR.y - SILENCIADOR.r + 0.02) / 2, z], tam: [0.02, SILENCIADOR.y - SILENCIADOR.r - 0.0, 0.025] })),
  // Dos tubitos de respiradero sobre el centro del ala (fotos de Kiev y de fábrica).
  ...[-0.03, 0.03].map((x, i): Pieza => ({ tipo: "varilla", id: `respiradero-${i}`, acabado: "aluminio", desde: [x, 0.08, -0.3], hasta: [x, 0.13, -0.3], radio: 0.007 })),
);

// ── Rampa y cohete (botón «Rampa») ─────────────────────────────────────────
// El FP-1 despega de una rampa inclinada con un cohete de combustible sólido
// colgado bajo la cola; el motor ya va en marcha.
const CABECEO = 18;
// Muy inclinado (unos 40°) y enganchado bajo el borde de salida del ala (foto
// de detrás), para que empuje por el centro de gravedad.
const COHETE = { r: 0.08, delante: [0, -0.46, -0.28] as P3, detras: [0, -1.22, -1.12] as P3 };
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
  // Las tres varillas, paralelas a la jaula y 10 cm por encima (del lado de
  // la panza), desde su punta de atrás hasta la panza.
  const L = Math.hypot(y1 - y0, z1 - z0), d = [(y1 - y0) / L, (z1 - z0) / L], n = [-d[1], d[0]];
  const pie: [number, number] = [y1 + 0.1 * n[0], z1 + 0.1 * n[1]];
  const k = (CUERPO.abajo + 0.005 - pie[0]) / -d[0];
  return [
    // La jaula de aluminio, calada (ver las calcas), y la tobera parda.
    { tipo: "tubo", id: "cohete-jaula", acabado: "aluminio", centro: [0, 0], perfil: sobre([[z0, 0], [z0 - 0.01, r], [z1 + 0.06, r], [z1 + 0.059, 0]]) },
    { tipo: "tubo", id: "cohete-tobera", acabado: "pardo-gr", centro: [0, 0], perfil: sobre([[z1 + 0.06, r - 0.004], [z1, r - 0.01], [z1 - 0.001, 0]]) },
    ...[-0.045, 0, 0.045].map((x, i): Pieza => ({ tipo: "varilla", id: `cohete-varilla-${i}`, acabado: "carbono-wh", desde: [x, pie[0], pie[1]], hasta: [x, pie[0] - k * d[0], pie[1] - k * d[1]], radio: 0.01 })),
    { tipo: "caja", id: "cohete-pie", acabado: "metal", centro: [0, (CUERPO.abajo + eje(z0 - 0.04) + r) / 2, z0 - 0.04], tam: [0.12, CUERPO.abajo - eje(z0 - 0.04) - r + 0.02, 0.08] },
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
// Marcas del ejemplar de Kiev, leídas en sus fotos y colocadas con la cámara
// encajada. Bajo el borde de ataque: la etiqueta plateada
// «ЗАКРІПИТИ» sobre el cierre de la tapa, el aviso de no dar corriente (placa
// plateada con el marco negro de rayas amarillas), un conector naranja y la
// etiqueta «ЖИВЛЕННЯ». Detrás, los tres conectores del arranque y del
// encendido con sus etiquetas verticales. Todo en el costado derecho, el de
// las dos fotos de Kiev: del izquierdo no hay fotos de cerca.
const PLATA = "#c9cac5";
const ARRIBA: P3 = [0, 1, 0];
const etiqueta = (x: number, y: number, z: number, tam: [number, number], texto: string, giro = 0): Calca[] => {
  const desde: P3 = [Math.sign(x), 0, 0];
  return [
    { sobre: ["fuselaje", "tapa-lomo"], en: [x, y, z], desde, tam, giro, dibujo: { tipo: "rect", color: PLATA }, capa: 1 },
    { sobre: ["fuselaje", "tapa-lomo"], en: [x, y, z], desde, tam: [tam[0] * 0.88, tam[1] * 0.62], giro, dibujo: { tipo: "texto", texto, fino: true }, capa: 2 },
  ];
};
const avisos = (x: number): Calca[] => {
  const desde: P3 = [Math.sign(x), 0, 0];
  return [
    ...etiqueta(x, -0.017, 0.34, [0.1, 0.02], "ЗАКРІПИТИ"),
    // El marco: negro, con rayitas amarillas rectas a lo largo.
    { sobre: ["fuselaje"], en: [x, -0.136, 0.32], desde, tam: [0.15, 0.048], dibujo: { tipo: "rect", color: "#151515" }, capa: 1 },
    ...[-1, 1].flatMap((lado) => Array.from({ length: 7 }, (_, i): Calca => ({ sobre: ["fuselaje"], en: [x, -0.136 + lado * 0.0205, 0.32 + Math.sign(x) * (i - 3) * 0.021], desde, tam: [0.011, 0.004], dibujo: { tipo: "rect", color: "#e3c33c" }, capa: 2 }))),
    ...[-1, 1].map((lado): Calca => ({ sobre: ["fuselaje"], en: [x, -0.136, 0.32 + lado * 0.0715], desde, tam: [0.004, 0.012], dibujo: { tipo: "rect", color: "#e3c33c" }, capa: 2 })),
    { sobre: ["fuselaje"], en: [x, -0.136, 0.32], desde, tam: [0.134, 0.03], dibujo: { tipo: "rect", color: PLATA }, capa: 3 },
    { sobre: ["fuselaje"], en: [x, -0.136, 0.32], desde, tam: [0.124, 0.022], dibujo: { tipo: "texto", texto: "НЕ ВМИКАТИ ЖИВЛЕННЯ\nБЕЗ ЗНЯТТЯ ФІКСАЦІЇ ПОВЕРХОНЬ", fino: true }, capa: 4 },
    ...etiqueta(x, -0.186, 0.32, [0.08, 0.018], "ЖИВЛЕННЯ"),
  ];
};
const XD = -CUERPO.ancho;
const ARRANQUE = [[-0.48, "СТАРТЕР"], [-0.45, "ЗАПАЛЮВАННЯ 2"], [-0.42, "ЗАПАЛЮВАННЯ 1"]] as const;
const CALCAS: Calca[] = [
  ...avisos(XD),
  ...ARRANQUE.flatMap(([z, texto]) => etiqueta(XD, -0.125, z, [0.13, 0.017], texto, -90)),
  // En la panza, la placa metálica en «T» del enganche de la rampa (foto de
  // MSPO desde abajo); en el costado derecho, abajo, el óvalo claro de un asa.
  { sobre: ["fuselaje"], en: [0, CUERPO.abajo - 0.1, -0.2], desde: [0, -1, 0], tam: [0.26, 0.26], dibujo: { tipo: "poligono", color: "#b4b8bb", puntos: [[0.05, 0.05], [0.95, 0.05], [0.95, 0.28], [0.62, 0.28], [0.62, 0.95], [0.38, 0.95], [0.38, 0.28], [0.05, 0.28]] }, mate: true },
  { sobre: ["fuselaje"], en: [XD, -0.29, 0.45], desde: [-1, 0, 0], tam: [0.07, 0.028], dibujo: { tipo: "disco", color: "#d6d6d1" }, capa: 1 },
  { sobre: ["fuselaje"], en: [XD, -0.29, 0.45], desde: [-1, 0, 0], tam: [0.05, 0.014], dibujo: { tipo: "disco", color: "#2a2b2c" }, capa: 2 },
  // La etiqueta blanca de la viga derecha, junto a la hélice (foto de Kiev).
  { sobre: ["viga--1"], en: [-VIGA.x - 0.04, Y_VIGA + 0.01, -0.75], desde: [-1, 0.3, 0], tam: [0.13, 0.03], dibujo: { tipo: "rect", color: "#ecebe6" }, capa: 1 },
  { sobre: ["viga--1"], en: [-VIGA.x - 0.04, Y_VIGA + 0.01, -0.75], desde: [-1, 0.3, 0], tam: [0.11, 0.018], dibujo: { tipo: "texto", texto: "ЛІВА ЧАСТИНА", fino: true, cursiva: true }, capa: 2 },
];
// La jaula del cohete, calada con huecos (foto de detrás), a los dos lados.
const ANGULO_COHETE = (Math.atan2(COHETE.delante[1] - COHETE.detras[1], COHETE.delante[2] - COHETE.detras[2]) * 180) / Math.PI;
const CALCAS_RAMPA: Calca[] = [
  { sobre: ["cohete-jaula"], en: [COHETE.r, (COHETE.delante[1] + COHETE.detras[1]) / 2, (COHETE.delante[2] + COHETE.detras[2]) / 2], desde: [1, 0, 0], tam: [0.95, 0.12], giro: ANGULO_COHETE, dibujo: { tipo: "malla", hex: true }, espejo: true },
];
const COSTURAS: Costura[] = [
  // Junta de la tapa del morro, arriba, por los costados y por la panza.
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.24, 0.2, CUERPO.tapa], [0, 0.2, CUERPO.tapa], [0.24, 0.2, CUERPO.tapa]] },
  { sobre: ["fuselaje"], desde: [1, 0, 0], espejo: true, puntos: [[0.4, -0.06, CUERPO.tapa], [0.4, -0.2, CUERPO.tapa], [0.4, -0.3, CUERPO.tapa]] },
  { sobre: ["fuselaje"], desde: [0, -1, 0], puntos: [[-0.17, -0.6, CUERPO.tapa], [0, -0.6, CUERPO.tapa], [0.17, -0.6, CUERPO.tapa]] },
  // Costura a lo largo del centro de la panza (foto de MSPO desde abajo).
  { sobre: ["fuselaje"], desde: [0, -1, 0], puntos: [[0, -0.6, CUERPO.tapa - 0.02], [0, -0.6, 0.3], [0, -0.6, -0.4]] },
];

const PARTES: Parte[] = [
  {
    nombre: "Cuerpo",
    en: [CUERPO.ancho + 0.05, -0.2, 1.0],
    piezas: ["fuselaje", "tapa-lomo", "conector", "tornillo-conector-0", "tornillo-conector-1", ...[0, 1, 2].map((i) => `conector-arranque-${i}`), ...[0, 1].flatMap((i) => [`cierre-${i}`, `tornillo-${i}-0`, `tornillo-${i}-1`]), "cierre-ala", "tornillo-ala", "caja-raiz", "interruptor"],
    respaldo: "foto",
    fuentes: ["kiev", "fabrica", "taller"],
    texto: "Una caja larga de lo alto plano y costados rectos, con un chaflán a lo largo de la panza y la tapa del morro aparte. Delante del ala, una tapa con el lomo cubre lo alto. Dentro van la ojiva, de 60 kg, el combustible y la navegación.",
    nota: "La forma, de las fotos; qué lleva dentro, de Fire Point y la prensa.",
  },
  {
    nombre: "Ala recta",
    en: [2.2, 0.15, 0],
    piezas: ["ala", "aleron", "cinta-centro", "cintas"],
    respaldo: "foto",
    fuentes: ["kiev", "fabrica", "fakty"],
    texto: "6 m de punta a punta, recta y sin diedro, en dos mitades unidas encima del cuerpo con una cinta. Los alerones de fuera hacen también de flaps.",
    nota: "La envergadura es la de Fire Point; la cuerda y el grueso, medidos en las fotos.",
  },
  {
    nombre: "Vigas y cola en V invertida",
    en: [0, COLA.yVertice + 0.2, -1.9],
    piezas: ["viga-1", "viga--1", "abrazadera-0", "abrazadera-1", "cola", "timon", "tubo-vertice", "soporte-cola", ...LADOS.flatMap((s) => [`manguito-cola-${s}`, `brida-cola-${s}`, `brazo-timon-${s}`, `varilla-brazo-${s}`]), "varilla-timon"],
    respaldo: "foto",
    fuentes: ["kiev", "rampa", "mspo"],
    texto: "Dos tubos de carbono atornillados bajo el ala llevan la cola: dos superficies que suben desde ellos y se juntan arriba, en el centro.",
  },
  {
    nombre: "Motor y hélice",
    en: [0.35, MOTOR.y, MOTOR.z],
    piezas: ["carter", "cilindros", "bancada", ...Array.from({ length: 9 }, (_, i) => `aleta-${i}`), "culatas", ...[0, 1, 2, 3].map((i) => `aleta-culata-${i}`), "bujias", "corona", "volante", "carburador", "filtro", ...Array.from({ length: 6 }, (_, i) => `tornillo-buje-${i}`), "buje", "helice"],
    respaldo: "foto",
    fuentes: ["motor", "mspo"],
    texto: "Un motor de pistón de dos cilindros opuestos detrás del cuerpo, con una hélice de madera de dos palas que empuja desde detrás.",
  },
  {
    nombre: "Escapes",
    en: [0, 0.3, -0.6],
    piezas: ["escape-1", "escape--1", "silenciador-1", "silenciador--1", "pata-silenciador-0", "pata-silenciador-1", ...LADOS.flatMap((s) => [0, 1].map((i) => `abrazadera-silenciador-${s}-${i}`)), "respiradero-0", "respiradero-1"],
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
// El centro de `girar` va también en metros.
const aUnidades = (p: Pieza): Pieza => {
  const q = aUnidadesForma(p);
  return p.girar ? { ...q, girar: { ...p.girar, centro: u3(p.girar.centro) } } : q;
};
const aUnidadesForma = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.lomo !== undefined && { lomo: u(q.lomo) }), ...(q.hombro !== undefined && { hombro: u(q.hombro) }), ...(q.contorno && { contorno: q.contorno.map((t) => t.map(([x, y]): [number, number] => [u(x), u(y)])) }) })), ...(p.suave && { suave: u(p.suave) }) };
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
  catapulta: { piezas: piezasCatapulta.map(aUnidades), cabeceo: CABECEO, nombre: "Rampa", detalles: { calcas: CALCAS_RAMPA.map(aCalca), costuras: [] } },
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
