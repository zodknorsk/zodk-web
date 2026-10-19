// Maqueta del Wing Loong II de AVIC (Chengdu), el demostrador de exportación
// de las ferias (Dubái 2017, Singapur 2018, MAKS 2019): gris claro, con el
// halcón y «翼龙II / WING LOONG II» en los costados del morro.
// Medidas de AVIC por Xinhua (11 m de largo, 20,5 m de envergadura, 4,1 m de
// alto); la forma, de fotos de las ferias y de fotogramas del rodaje de
// Zhuhai 2021 (otro avión, solo para la forma), con las cámaras de cuatro
// de ellas encajadas a la vez junto con los puntos que se ven en varias
// (morro, cono, toma, antenas de la cola, winglet, ruedas). Todo en
// arte/uas-fuentes/wing-loong-ii/ (fuera de Git).
// Todo se escribe en metros, con y = 0 a la altura de la punta del morro y
// z = 0 cerca del centro del largo, y al final se pasa a unidades.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 7.8;

// ── Ala ────────────────────────────────────────────────────────────────────
// Recta, a media altura, de 20,5 m de winglet a winglet. Medido: el borde de
// ataque en la raíz, en z = 0,50-0,60 (Zhuhai y Dubái), donde un carenado
// abultado sale por delante del ala (Zhuhai, de cerca); la punta, con la
// base del winglet de z = 0,22 a −0,33 (Zhuhai); el plano medio, a y = −0,06
// junto al cuerpo y subiendo 3,3 cm por metro hasta 0,22 en la punta, y el
// grueso, 0,30 m junto al cuerpo (foto de frente y el canto del ala en
// Dubái y Aerofossile). El borde de salida en la
// raíz (z = −1,3) no se ve en ninguna foto: sale de la cuerda que pide el
// carenado.
const ALA = { y: -0.06, punta: 10.1, baRaiz: 0.36, bsRaiz: -1.3, baPunta: 0.22, bsPunta: -0.33, tRaiz: 0.3, tPunta: 0.11, subePunta: 0.28 };
const enAla = (raiz: number, punta: number, desde = 0.45) => (x: number) => raiz + ((punta - raiz) * Math.max(0, x - desde)) / (ALA.punta - desde);
const bordeAtaque = (x: number) => (x >= 2 ? enAla(ALA.baRaiz, ALA.baPunta, 2)(x) : 0.58 - ((0.58 - ALA.baRaiz) * (1 - (1 - (x - 0.45) / 1.55) ** 2)));
const bordeSalida = enAla(ALA.bsRaiz, ALA.bsPunta);
const grosorAla = enAla(ALA.tRaiz, ALA.tPunta);
const subidaAla = (x: number) => (ALA.subePunta * x) / ALA.punta;
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = bordeSalida(x)): Est => [x, bordeAtaque(x), bs, grosorAla(x), subidaAla(x)];
// Flaps por dentro y alerones por fuera, con la bisagra al 25 % de la cuerda:
// reconstrucción (el borde de salida no se ve de cerca en ninguna foto).
const MANDO = { cuerda: 0.25, dentro: 0.01, flap: [1.0, 4.795], aleron: [4.805, 9.6] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda * (bordeAtaque(x) - bordeSalida(x));
const estMando = (x: number): Est => [x, bisagra(x) + MANDO.dentro, bordeSalida(x), grosorAla(x) * 0.45, subidaAla(x)];
// Winglets: de la punta suben 0,53 m hasta (±10,25; 0,76; −0,10), el punto
// encajado en cuatro fotos; el borde de delante en flecha y el de atrás casi
// vertical (Dubái y Zhuhai).
const WINGLET = { x: ALA.punta - 0.02, y: ALA.y + subidaAla(ALA.punta), alto: 0.53, inclinacion: 16 };

// ── Cola ───────────────────────────────────────────────────────────────────
// En V, a 35,6° sobre la horizontal, y nace baja, en los costados del
// fuselaje (en Zhuhai la cola cercana baja hasta media altura del cuerpo).
// Esquinas encajadas a la vez en Dubái (las dos colas) y Zhuhai: punta en
// x = ±3,43, y = 2,09, de z = −3,90 a −4,67; raíz con el borde de ataque en
// z = −3,22 (lo que piden las siluetas de tres fotos; las esquinas daban
// −3,12) y el de salida en −4,74, casi recto hasta la punta.
const COLA = { x0: 0.2, y0: -0.226, largo: 3.97, angulo: (35.6 * Math.PI) / 180 };
const xCola = (d: number) => COLA.x0 + d * Math.cos(COLA.angulo);
const bordeAtaqueCola = (d: number) => -3.22 - 0.2586 * (xCola(d) - 0.785);
const bordeSalidaCola = (d: number) => -4.738 + 0.028 * (xCola(d) - 0.925);
const grosorCola = (d: number) => 0.14 - (0.08 * d) / COLA.largo;
// Timones con la bisagra al 30 % de la cuerda (la línea se ve en las dos colas).
const TIMON = { cuerda: 0.3, desde: 0.9, hasta: 3.8 };
const bisagraCola = (d: number) => bordeSalidaCola(d) + TIMON.cuerda * (bordeAtaqueCola(d) - bordeSalidaCola(d));
const estCola = (d: number, bs = bordeSalidaCola(d)): Est => [xCola(d), bordeAtaqueCola(d), bs, grosorCola(d), d * Math.sin(COLA.angulo)];
const estTimon = (d: number): Est => [xCola(d), bisagraCola(d) - 0.006, bordeSalidaCola(d), grosorCola(d) * 0.45, d * Math.sin(COLA.angulo)];
// Hélice empujadora de tres palas, de 1,37 m de radio (pala con la punta
// amarilla en Dubái), delante del cono; el plato, en z = −5,33 (Zhuhai).
const HELICE = { en: [0, 0.045, -5.45] as [number, number, number], radio: 1.37 };

// ── Tren ───────────────────────────────────────────────────────────────────
// Triciclo fijo. Ruedas medidas en Zhuhai (tele) en su plano: la del morro de
// 0,30 m, con el eje en (0; −1,535; 3,06); las principales de 0,37 m, con el
// eje a y −1,63 y z −0,79 (Zhuhai daba −0,71; las siluetas de Aerofossile y
// Dubái lo piden 8 cm más atrás), y a ±1,36 del centro (foto de frente). Cada pata
// principal sale del costado bajo del fuselaje y baja en diagonal hacia fuera
// hasta un amortiguador vertical, con la rueda por fuera (foto de frente); la
// del morro baja de la panza algo inclinada hacia delante (Zhuhai).
type P3 = [number, number, number];
const RUEDA = { r: 0.185, ancho: 0.13 };
const RUEDA_MORRO = { r: 0.15, ancho: 0.11 };
const PRINCIPAL = { arriba: [0.5, -0.5, -0.82] as P3, codo: [1.18, -1.12, -0.79] as P3, eje: [1.36, -1.63, -0.79] as P3 };
const MORRO_TREN = { arriba: [0, -0.5, 2.87] as P3, horquilla: [0, -1.28, 3.0] as P3, eje: [0, -1.535, 3.06] as P3 };
// Rueda: cubierta de goma y llanta, de torno a lo largo de z, tumbada para que
// el eje vaya en x.
const rueda = (id: string, [x, y, z]: P3, { r, ancho }: { r: number; ancho: number }): Pieza[] => {
  const tumbar = { centro: [x, y, z] as P3, eje: "y" as const, grados: 90 };
  const a = ancho / 2;
  return [
    { tipo: "tubo", id, acabado: "negro-ua", centro: [x, y], girar: tumbar,
      perfil: [[z - a, r * 0.55], [z - a, r * 0.8], [z - a * 0.85, r * 0.93], [z - a * 0.5, r * 0.99], [z, r], [z + a * 0.5, r * 0.99], [z + a * 0.85, r * 0.93], [z + a, r * 0.8], [z + a, r * 0.55]] },
    { tipo: "tubo", id: `${id}-llanta`, acabado: "gris-wl", centro: [x, y], girar: tumbar,
      perfil: [[z - a * 0.8, 0], [z - a * 0.8, r * 0.5], [z - a * 0.9, r * 0.56], [z + a * 0.9, r * 0.56], [z + a * 0.8, r * 0.5], [z + a * 0.8, 0]] },
  ];
};

// ── Torreta ────────────────────────────────────────────────────────────────
// Bola EO/IR bajo el morro, delante de la pata: 0,235 m de radio, con el
// centro en (0; −0,74; 3,5), colgada de un cuello corto y con un plato debajo
// (foto de frente y Zhuhai). En la cara, una ventana grande casi cuadrada
// arriba, hacia la derecha del avión (x < 0), y al otro lado una redonda
// grande y otra pequeña encima (foto de frente).
const TORRETA = { y: -0.74, z: 3.5, r: 0.235 };
// La cara plana de delante de la bola, a 16 cm del centro (queda de 17 cm de radio).
const CARA_TORRETA = TORRETA.z + 0.16;
// Media esfera como perfil de torno [z, radio], de delante atrás.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });

// ── Pilones y armas ────────────────────────────────────────────────────────
// Tres pilones por ala, con perfil y casi tan largos como la cuerda. Medidos
// en la foto de frente (sitio y alto) y en las de tres cuartos (cuerda): el
// de dentro en x = 1,30 y el del medio en 2,22, colgando hasta y = −0,38 y
// −0,37. El demostrador de las ferias solo lleva esos dos (de frente no hay
// nada hasta x = 3,7); el de fuera es del Wing Loong II de seis pilones de
// Zhuhai, donde los tres van al mismo paso: x = 3,14, reconstruido.
type Arma = "ba7" | "ls6";
const PILONES: { id: string; x: number; bajo: number; ba: number; bs: number; arma: Arma }[] = [
  { id: "dentro", x: 1.3, bajo: -0.38, ba: 0.12, bs: -1.0, arma: "ls6" },
  { id: "medio", x: 2.22, bajo: -0.37, ba: 0.12, bs: -1.0, arma: "ba7" },
  { id: "fuera", x: 3.14, bajo: -0.36, ba: 0.12, bs: -0.95, arma: "ba7" },
];
const yAla = (x: number) => ALA.y + subidaAla(x);
// Las armas no se reflejan solas: cada una se monta en los dos lados.
const LADOS = [1, -1];

// Cuatro aletas alrededor del eje de un arma, en X (o las que se pidan): el
// contorno va en [z, distancia al eje].
const aletas = (id: string, x: number, y: number, contorno: [number, number][], acabado: Pieza["acabado"], grados = [45, -45, 135, -135]): Pieza[] =>
  grados.map((inclinacion, i) => ({ tipo: "placa", id: `${id}-${i}`, acabado, plano: "vertical", x, y, grosor: 0.012, inclinacion, planta: contorno }));

// BA-7 (Blue Arrow 7), misil antitanque de Norinco guiado por láser: 1,775 m
// y 170 mm (GlobalSecurity), 47 kg. La forma, de la maqueta 1:1 con su cartel
// junto al demostrador (Aerofossile): buscador rojo, franja azul, dos ganchos
// arriba y cuatro alas en X detrás, con cuatro timones pequeños al final.
const BA7 = { largo: 1.775, r: 0.085 };
const ba7 = (id: string, x: number, y: number, morro: number): Pieza[] => {
  const z = (f: number) => morro - f * BA7.largo;
  return [
    { tipo: "tubo", id: `${id}-buscador`, acabado: "rojo-vivo", centro: [x, y], perfil: [[z(0), 0], [z(0.006), 0.03], [z(0.016), 0.045], [z(0.03), 0.053], [z(0.046), 0.057], [z(0.046), 0]] },
    { tipo: "tubo", id, acabado: "gris-ba7", centro: [x, y], perfil: [[z(0.045), 0], [z(0.045), 0.07], [z(0.06), 0.08], [z(0.08), BA7.r], [z(0.985), BA7.r], [z(1), 0.08], [z(1), 0]] },
    { tipo: "tubo", id: `${id}-franja`, acabado: "azul", centro: [x, y], perfil: [[z(0.225), 0], [z(0.225), BA7.r + 0.002], [z(0.25), BA7.r + 0.002], [z(0.25), 0]] },
    ...[0.31, 0.65].map((f, i): Pieza => ({ tipo: "caja", id: `${id}-gancho-${i}`, acabado: "metal", centro: [x, y + BA7.r + 0.003, z(f)], tam: [0.03, 0.02, 0.05] })),
    ...aletas(`${id}-alas`, x, y, [[z(0.69), 0.08], [z(0.955), 0.08], [z(0.95), 0.18], [z(0.8), 0.18]], "gris-misil"),
    ...aletas(`${id}-timones`, x, y, [[z(0.96), 0.08], [z(0.995), 0.08], [z(0.995), 0.13], [z(0.97), 0.13]], "gris-misil"),
  ];
};

// LS-6 (Lei Shi 6), bomba de planeo guiada por satélite, en su tamaño pequeño:
// medida en la foto de Aerofossile al lado del BA-7, unos 1,9 m y 0,16 m de
// diámetro. Morro blanco romo, cuerpo verde, dos alas plegadas a los
// costados y cola blanca con cuatro aletas en X.
const LS6 = { largo: 1.9, r: 0.08 };
const ls6 = (id: string, x: number, y: number, morro: number): Pieza[] => {
  const z = (f: number) => morro - f * LS6.largo;
  return [
    { tipo: "tubo", id: `${id}-morro`, acabado: "blanco", centro: [x, y], perfil: [[z(0), 0], [z(0.004), 0.03], [z(0.012), 0.045], [z(0.031), 0.051], [z(0.031), 0]] },
    { tipo: "tubo", id, acabado: "verde-ls6", centro: [x, y], perfil: [[z(0.03), 0], [z(0.03), 0.05], [z(0.07), 0.062], [z(0.12), 0.072], [z(0.18), 0.079], [z(0.2), LS6.r], [z(0.8), LS6.r], [z(0.8), 0]] },
    { tipo: "tubo", id: `${id}-cola`, acabado: "blanco", centro: [x, y], perfil: [[z(0.799), 0], [z(0.799), 0.078], [z(0.97), 0.072], [z(1), 0.066], [z(1), 0]] },
    ...[0.35, 0.54].map((f, i): Pieza => ({ tipo: "caja", id: `${id}-gancho-${i}`, acabado: "metal", centro: [x, y + LS6.r + 0.003, z(f)], tam: [0.03, 0.02, 0.05] })),
    ...aletas(`${id}-alas`, x, y + 0.03, [[z(0.5), 0.07], [z(0.83), 0.07], [z(0.83), 0.155], [z(0.53), 0.155]], "blanco", [90, -90]),
    ...aletas(`${id}-aletas`, x, y, [[z(0.885), 0.07], [z(0.995), 0.066], [z(0.995), 0.165], [z(0.94), 0.165]], "blanco"),
  ];
};

// Un lanzador doble en cada pilón (AIN y Defense News: hasta 12 armas, por
// parejas). Bajo los del medio y de fuera (foto de frente): una viga de 0,52 m
// de ancho y dos raíles a ±0,225, con un BA-7 colgado de cada uno, el morro
// algo por delante del ala. Bajo el de dentro, un bastidor que se abre hacia
// abajo hasta dos zapatas a ±0,24, de las que cuelgan las LS-6. Cómo van
// colgadas en el demostrador no sale en ninguna foto (en las ferias, los
// pilones vacíos): es la forma de los soportes de Dubái con las armas debajo.
const RAIL = { dx: 0.225, delante: 0.25, detras: -0.85 };
const PIEZAS_ARMAS: Pieza[] = PILONES.flatMap((p): Pieza[] => [
  {
    tipo: "ala", id: `pilon-${p.id}`, acabado: "gris-wl", vertical: true, espejo: true, x: p.x, y: yAla(p.x),
    estaciones: [[0, p.ba + 0.03, p.bs, 0.16], [yAla(p.x) - p.bajo, p.ba, p.bs + 0.05, 0.15]],
  },
  ...LADOS.flatMap((s): Pieza[] => {
    const x = s * p.x;
    if (p.arma === "ls6") {
      const ancho = (dx: number, z0: number, z1: number): [number, number][] => [[x - dx, z0], [x + dx, z0], [x + dx, z1], [x - dx, z1]];
      return [
        { tipo: "pila", id: `bastidor-${p.id}-${s}`, acabado: "gris-wl", niveles: [{ y: p.bajo - 0.14, planta: ancho(0.22, 0.1, -0.75) }, { y: p.bajo, planta: ancho(0.09, 0.1, -0.75) }] },
        ...[1, -1].flatMap((l): Pieza[] => [
          { tipo: "caja", id: `zapata-${p.id}-${s}-${l}`, acabado: "gris-wl", redondeo: 0.015, centro: [x + l * 0.24, p.bajo - 0.165, -0.325], tam: [0.08, 0.09, 0.85] },
          ...ls6(`ls6-${s}-${l}`, x + l * 0.24, p.bajo - 0.21 - 0.012 - LS6.r, 0.55),
        ]),
      ];
    }
    return [
      { tipo: "caja", id: `lanzador-${p.id}-${s}`, acabado: "gris-wl", redondeo: 0.015, centro: [x, p.bajo - 0.025, -0.3], tam: [0.52, 0.05, 0.8] },
      ...[1, -1].flatMap((l): Pieza[] => [
        { tipo: "caja", id: `rail-${p.id}-${s}-${l}`, acabado: "gris-wl", redondeo: 0.015, centro: [x + l * RAIL.dx, p.bajo - 0.1, (RAIL.delante + RAIL.detras) / 2], tam: [0.07, 0.1, RAIL.delante - RAIL.detras] },
        ...ba7(`ba7-${p.id}-${s}-${l}`, x + l * RAIL.dx, p.bajo - 0.15 - 0.012 - BA7.r, 0.75),
      ]),
    ];
  }),
]);

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Secciones [z, medio ancho, lomo, panza, cintura], medidas en las fotos de
// Dubái y Aerofossile con sus cámaras encajadas: el lomo y la panza, en el
// plano del eje; el ancho, en la foto de frente. El morro es una cuña chata
// que sube en una joroba (la antena del satélite) hasta 0,67 m sobre la punta;
// detrás, el lomo baja hasta el ala y sigue casi recto, y detrás del ala el
// cuerpo se cierra hacia la hélice con la panza subiendo.
// Del morro al ala, arista viva en la cintura, a la altura de la punta del
// morro: arriba claro al sol, debajo el costado casi vertical y en sombra
// (foto de Singapur, de costado). Detrás del ala el cuerpo se redondea.
const sec = ([z, ancho, arriba, abajo, cintura]: number[], n = 2.3, nAbajo = 2.3): Seccion => ({ z, ancho, arriba, abajo, cintura, n, nAbajo, arista: z > -1.5 ? 0.35 : 0 });
// Detrás del ala, la toma de aire: un tubo en el lomo, en el centro, con la
// boca en z = −3,0 y lo alto a 0,53 m (Zhuhai), que se funde hacia atrás con
// el lomo entre las colas. Sale del cuerpo como lomo estrecho (`lomo`, su
// medio ancho; `hombro`, lo alto del cuerpo de debajo).
const conToma = (q: Seccion, lomo: number, hombro: number): Seccion => ({ ...q, lomo, hombro, nLomo: 2.2 });
// La toma (Zhuhai): un tubo posado en el lomo, de unos 30 cm, con el labio
// redondo y la boca negra metida; detrás se funde con la espina del lomo.
const BOCA_TOMA = { z: -2.98, y: 0.39, r: 0.165, boca: 0.125 };
const CUERPO: Seccion[] = [
  sec([5.27, 0, 0, 0, 0]),
  sec([5.22, 0.07, 0.012, -0.03, -0.01], 2.4, 2.6),
  sec([5.13, 0.15, 0.03, -0.09, -0.02], 2.4, 2.6),
  sec([5.0, 0.24, 0.07, -0.19, -0.03], 2.4, 2.6),
  sec([4.85, 0.32, 0.15, -0.31, -0.04], 2.4, 2.6),
  sec([4.6, 0.39, 0.26, -0.42, -0.05], 2.4, 2.6),
  sec([4.4, 0.426, 0.35, -0.455, -0.05], 3.2, 2.6),
  sec([4.2, 0.457, 0.43, -0.475, -0.05], 3.2, 2.6),
  sec([4.0, 0.479, 0.49, -0.49, -0.05], 3.2, 2.6),
  sec([3.6, 0.496, 0.64, -0.5, -0.05], 3.2, 2.6),
  sec([3.2, 0.496, 0.69, -0.51, -0.05], 3.2, 2.6),
  sec([2.8, 0.505, 0.65, -0.515, -0.05], 3.2, 2.6),
  sec([2.4, 0.505, 0.55, -0.52, -0.05], 3.2, 2.6),
  sec([2.0, 0.496, 0.445, -0.525, -0.05], 3.2, 2.6),
  sec([1.6, 0.487, 0.38, -0.53, -0.05], 3.2, 2.6),
  sec([1.0, 0.479, 0.35, -0.55, -0.05], 3.2, 2.6),
  sec([0.0, 0.47, 0.33, -0.565, -0.05], 3.2, 2.6),
  sec([-1.0, 0.452, 0.31, -0.55, -0.05], 3.2, 2.6),
  sec([-2.0, 0.432, 0.29, -0.52, -0.04], 3.2, 2.6),
  sec([-2.8, 0.407, 0.3, -0.45, 0.0]),
  conToma(sec([-3.15, 0.38, 0.32, -0.4, 0.0]), 0.03, 0.3),
  conToma(sec([-3.3, 0.37, 0.42, -0.37, 0.0]), 0.06, 0.31),
  conToma(sec([-3.6, 0.34, 0.45, -0.25, 0.02]), 0.07, 0.33),
  conToma(sec([-4.2, 0.29, 0.45, -0.2, 0.04]), 0.09, 0.36),
  sec([-4.8, 0.25, 0.36, -0.18, 0.05]),
  sec([-5.33, 0.225, 0.27, -0.185, 0.04], 2.0, 2.0),
];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-wl", secciones: CUERPO },
  {
    tipo: "ala", id: "ala", acabado: "gris-wl", y: ALA.y, raizDentro: true,
    estaciones: [
      estAla(0.45), estAla(0.8), estAla(MANDO.flap[0]), estAla(MANDO.flap[0], bisagra(MANDO.flap[0])), estAla(1.5, bisagra(1.5)), estAla(2, bisagra(2)),
      estAla(MANDO.aleron[1], bisagra(MANDO.aleron[1])), estAla(MANDO.aleron[1]), estAla(ALA.punta),
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "gris-wl", y: ALA.y, estaciones: [estMando(MANDO.flap[0]), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris-wl", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1])] },
  {
    tipo: "placa", id: "winglet", acabado: "gris-wl", plano: "vertical", x: WINGLET.x, y: WINGLET.y, grosor: 0.05, bisel: 0.015, espejo: true, inclinacion: WINGLET.inclinacion,
    planta: [[ALA.baPunta - 0.02, 0], [ALA.bsPunta + 0.02, 0], [-0.17, WINGLET.alto], [-0.04, WINGLET.alto]],
  },
  {
    tipo: "ala", id: "cola", acabado: "gris-wl", y: COLA.y0, raizDentro: true,
    estaciones: [estCola(0), estCola(TIMON.desde), estCola(TIMON.desde, bisagraCola(TIMON.desde)), estCola(TIMON.hasta, bisagraCola(TIMON.hasta)), estCola(TIMON.hasta), estCola(COLA.largo)],
  },
  { tipo: "ala", id: "timones", acabado: "gris-wl", y: COLA.y0, estaciones: [estTimon(TIMON.desde + 0.01), estTimon(TIMON.hasta - 0.01)] },
  // Aleta ventral bajo la cola, de 1 m de alto: el borde de atrás casi
  // vertical y el de delante bajando en flecha, con la esquina de abajo
  // redonda (Dubái y Aerofossile).
  { tipo: "ala", id: "aleta-ventral", acabado: "gris-wl", vertical: true, y: -0.12, estaciones: [[0, -3.2, -3.96, 0.07], [0.6, -3.28, -4.03, 0.06], [0.9, -3.38, -4.06, 0.05], [1.0, -3.47, -4.07, 0.04], [1.07, -3.6, -4.07, 0.03]] },
  // Cono de la hélice, del plato a la punta (Zhuhai).
  { tipo: "tubo", id: "cono", acabado: "gris-wl", centro: [0, HELICE.en[1]], perfil: [[-5.34, 0.225], [-5.45, 0.215], [-5.6, 0.17], [-5.75, 0.1], [-5.85, 0.04], [-5.88, 0]] },
  { tipo: "helice", id: "helice", acabado: "gris-wl", en: HELICE.en, radio: HELICE.radio, palas: 3, ancho: 0.2, buje: 0, tramo: [0, 0.9] },
  { tipo: "helice", id: "helice-puntas", acabado: "amarillo", en: HELICE.en, radio: HELICE.radio, palas: 3, ancho: 0.2, buje: 0, tramo: [0.9, 1] },
  ...rueda("rueda-morro", MORRO_TREN.eje, RUEDA_MORRO),
  { tipo: "varilla", id: "pata-morro", acabado: "gris-wl", desde: MORRO_TREN.arriba, hasta: MORRO_TREN.horquilla, radio: 0.05, lados: 16 },
  ...[1, -1].map((l): Pieza => ({ tipo: "varilla", id: `horquilla-morro-${l}`, acabado: "gris-wl", desde: [l * 0.075, MORRO_TREN.horquilla[1] + 0.02, MORRO_TREN.horquilla[2]], hasta: [l * 0.075, MORRO_TREN.eje[1], MORRO_TREN.eje[2]], radio: 0.022, lados: 12 })),
  { tipo: "caja", id: "horquilla-morro", acabado: "gris-wl", centro: [0, MORRO_TREN.horquilla[1], MORRO_TREN.horquilla[2]], tam: [0.2, 0.05, 0.08], redondeo: 0.015 },
  ...[1, -1].flatMap((l): Pieza[] => {
    const [ax, ay, az] = PRINCIPAL.arriba, [cx, cy, cz] = PRINCIPAL.codo, [ex, ey, ez] = PRINCIPAL.eje;
    return [
      ...rueda(`rueda-${l}`, [l * ex, ey, ez], RUEDA),
      { tipo: "varilla", id: `pata-${l}`, acabado: "gris-wl", desde: [l * ax, ay, az], hasta: [l * cx, cy, cz], radio: 0.05, lados: 16 },
      { tipo: "varilla", id: `amortiguador-${l}`, acabado: "gris-wl", desde: [l * cx, cy + 0.04, cz], hasta: [l * cx, ey, ez], radio: 0.045, lados: 16 },
      { tipo: "varilla", id: `eje-${l}`, acabado: "metal", desde: [l * cx, ey, ez], hasta: [l * (ex - 0.03), ey, ez], radio: 0.025, lados: 12 },
    ];
  }),
  // Torreta (Dubái de frente y MAKS 2019 de cerca): un cilindro corto que
  // gira colgado de la panza y, debajo, la bola con la cara de delante plana
  // y tres ventanas (dos redondas arriba, una grande abajo), una tapa redonda
  // a cada lado en el eje de cabeceo y un plato debajo.
  { tipo: "varilla", id: "torreta-cuello", acabado: "gris-wl", desde: [0, -0.4, TORRETA.z], hasta: [0, TORRETA.y + 0.12, TORRETA.z], radio: 0.215, lados: 40 },
  { tipo: "tubo", id: "torreta", acabado: "gris-wl", centro: [0, TORRETA.y], perfil: [[CARA_TORRETA, 0], [CARA_TORRETA, Math.sqrt(TORRETA.r ** 2 - 0.16 ** 2)], ...esfera(TORRETA.z, TORRETA.r).filter(([z]) => z < CARA_TORRETA)] },
  ...[1, -1].map((l): Pieza => ({ tipo: "disco", id: `torreta-tapa-${l}`, acabado: "gris-wl", en: [l * 0.185, TORRETA.y + 0.01, TORRETA.z], normal: [l, 0, 0], radio: 0.165, grosor: 0.03 })),
  { tipo: "disco", id: "torreta-plato", acabado: "gris-wl", en: [0, TORRETA.y - TORRETA.r + 0.005, TORRETA.z], normal: [0, -1, 0], radio: 0.13, grosor: 0.03 },
  { tipo: "caja", id: "torreta-ventana-0", acabado: "lente", centro: [-0.068, TORRETA.y + 0.03, CARA_TORRETA + 0.005], tam: [0.12, 0.16, 0.012], redondeo: 0.03 },
  ...([[0.068, 0.1, 0.045], [0.07, -0.04, 0.075]] as const).map(([x, y, r], i): Pieza => ({ tipo: "disco", id: `torreta-ventana-${i + 1}`, acabado: "lente", en: [x, TORRETA.y + y, CARA_TORRETA + 0.004], normal: [0, 0, 1], radio: r, grosor: 0.01 })),
  // La boca de la toma: el conducto, negro, un poco metido.
  {
    tipo: "tubo", id: "toma", acabado: "gris-wl", centro: [0, BOCA_TOMA.y],
    perfil: [[-3.05, 0], [-3.05, BOCA_TOMA.boca], [BOCA_TOMA.z, BOCA_TOMA.boca + 0.005], [BOCA_TOMA.z - 0.01, 0.152], [BOCA_TOMA.z - 0.04, BOCA_TOMA.r], [-4.3, BOCA_TOMA.r], [-4.6, 0.12], [-4.8, 0]],
  },
  { tipo: "disco", id: "toma-boca", acabado: "hueco", en: [0, BOCA_TOMA.y, -3.045], normal: [0, 0, 1], radio: BOCA_TOMA.boca, grosor: 0.005 },
  ...PIEZAS_ARMAS,
];

// ── Detalle pintado del HD (el demostrador de las ferias) ──────────────────
// El logo del morro, calcado del primer plano de Singapur (src/data/uas/
// logos.ts) y medido en Aerofossile: el halcón de z 4,21 a 2,88 y de y 0,12 a
// 0,53; «翼龙II / WING LOONG II» detrás, de z 3,36 a 2,54. Gris oscuro
// (#3f4046 al sol en Singapur). En el otro costado el halcón también mira al
// morro: lleva su calca en espejo; las letras se leen igual en los dos.
const LADO: P3 = [1, 0, 0];
const TINTA_LOGO = "#3e4045";
const CALCAS: Calca[] = [
  { sobre: ["fuselaje"], en: [0.55, 0.322, 3.543], desde: LADO, tam: [1.27, 0.4], dibujo: { tipo: "logo", logo: "halcon-wl", color: TINTA_LOGO } },
  { sobre: ["fuselaje"], en: [-0.55, 0.322, 3.543], desde: [-1, 0, 0], tam: [1.27, 0.4], dibujo: { tipo: "logo", logo: "halcon-wl-espejo", color: TINTA_LOGO } },
  { sobre: ["fuselaje"], en: [0.55, 0.246, 2.95], desde: LADO, tam: [0.825, 0.26], espejo: true, dibujo: { tipo: "logo", logo: "letras-wl", color: TINTA_LOGO } },
  // Números de paneles: solo los dos que se leen en las fotos (Aerofossile y
  // Singapur), en el costado que se ve.
  { sobre: ["fuselaje"], en: [0.55, 0.039, 3.455], desde: LADO, tam: [0.11, 0.025], dibujo: { tipo: "texto", texto: "101-01C", color: TINTA_LOGO, fino: true } },
  { sobre: ["fuselaje"], en: [0.55, -0.069, 1.884], desde: LADO, tam: [0.11, 0.025], dibujo: { tipo: "texto", texto: "304-02C", color: TINTA_LOGO, fino: true } },
];
// Juntas remachadas del costado, las que se ven en Aerofossile y Singapur: la
// del panel del morro, que corre por encima de la arista y sube en diagonal
// hasta el lomo, y la tapa de detrás (dos filas verticales y la de abajo).
const COSTURAS: Costura[] = [
  { sobre: ["fuselaje"], desde: LADO, espejo: true, remaches: 0.12, puntos: [[0.55, 0.003, 3.6], [0.55, -0.016, 2.8], [0.55, 0.307, 1.49]] },
  { sobre: ["fuselaje"], desde: LADO, espejo: true, remaches: 0.1, puntos: [[0.55, 0.118, 2.23], [0.55, -0.104, 2.216], [0.55, -0.111, 1.36], [0.55, 0.285, 1.417]] },
];

// ── Partes del visor ───────────────────────────────────────────────────────
const SOPORTES = PIEZAS_ARMAS.map((p) => p.id).filter((id) => /^(pilon|lanzador|rail|bastidor|zapata)-/.test(id));
const ARMAS = PIEZAS_ARMAS.map((p) => p.id).filter((id) => /^(ba7|ls6)-/.test(id));
const PARTES: Parte[] = [
  {
    nombre: "Torreta EO/IR",
    en: [0, TORRETA.y - 0.1, TORRETA.z + 0.2],
    piezas: ["torreta", "torreta-cuello", "torreta-plato", "torreta-tapa-1", "torreta-tapa--1", "torreta-ventana-0", "torreta-ventana-1", "torreta-ventana-2"],
    respaldo: "foto",
    fuentes: ["frente", "aerofossile", "maks"],
    texto: "Bajo el morro, una bola que gira con las cámaras de día y térmica y el láser que guía las armas hasta el blanco.",
    nota: "La forma y las ventanas, de la foto de frente; qué lleva dentro no lo ha detallado el fabricante.",
  },
  {
    nombre: "Morro y joroba",
    en: [0, 0.75, 3.2],
    piezas: ["fuselaje"],
    respaldo: "foto",
    fuentes: ["perfil", "singapur", "aerofossile"],
    texto: "El morro se abomba por arriba, como en el Reaper: ahí va la antena del enlace por satélite, que deja pilotarlo desde muy lejos. En los costados, el halcón y el nombre del demostrador de las ferias.",
    nota: "Que en la joroba va la antena del satélite es lo habitual en estos drones; por fuera solo se ve la forma.",
  },
  {
    nombre: "Ala recta con winglets",
    en: [6, 0.3, 0],
    piezas: ["ala", "flaps", "alerones", "winglet"],
    respaldo: "foto",
    fuentes: ["frente", "perfil", "zhuhai"],
    texto: "20,5 m de punta a punta, casi el doble del largo, con las puntas dobladas hacia arriba: un ala de planeador para aguantar unas 20 horas en el aire.",
    nota: "Los flaps y alerones son reconstrucción: ninguna foto enseña de cerca el borde de salida.",
  },
  {
    nombre: "Cola en V y aleta ventral",
    en: [2.2, 1.6, -4.3],
    piezas: ["cola", "timones", "aleta-ventral"],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "aerofossile"],
    texto: "Dos superficies en V que hacen a la vez de timón de profundidad y de dirección, y debajo una aleta que protege la hélice si el morro se levanta al despegar.",
    nota: "La cuerda de los timones es supuesta; la bisagra se ve como una línea.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.7, -3.4],
    piezas: ["toma", "toma-boca", "cono", "helice", "helice-puntas"],
    respaldo: "foto",
    fuentes: ["zhuhai", "perfil"],
    texto: "Un turbohélice en la cola, que respira por la toma del lomo y empuja con una hélice de tres palas; así el morro queda libre para los sensores. Llega a 370 km/h y a 9000 m de altura.",
    nota: "El ancho y la forma de las palas son supuestos; el resto, de las fotos.",
  },
  {
    nombre: "Tren fijo",
    en: [1.36, -1.9, -0.79],
    piezas: ["rueda-morro", "rueda-morro-llanta", "pata-morro", "horquilla-morro", "horquilla-morro-1", "horquilla-morro--1", ...[1, -1].flatMap((l) => [`rueda-${l}`, `rueda-${l}-llanta`, `pata-${l}`, `amortiguador-${l}`, `eje-${l}`])],
    respaldo: "foto",
    fuentes: ["frente", "perfil", "sinodefence"],
    texto: "Tres ruedas que no se recogen: una bajo el morro y dos en patas que salen de la panza hacia fuera.",
  },
  {
    nombre: "Pilones y lanzadores",
    en: [2.22, -0.6, -0.3],
    piezas: SOPORTES,
    respaldo: "foto",
    fuentes: ["frente", "aerofossile", "sinodefence"],
    texto: "Seis puntos de carga, tres en cada ala, con lanzadores dobles: hasta 12 armas y 480 kg en total.",
    nota: "El demostrador solo lleva los cuatro de dentro; el de fuera es reconstrucción, al paso de los que se ven en otros aviones.",
  },
  {
    nombre: "Armas: BA-7 y LS-6",
    en: [3.14, -0.8, 0.6],
    piezas: ARMAS,
    respaldo: "reconstruccion",
    fuentes: ["aerofossile", "singapur", "ba7"],
    texto: "Ocho misiles BA-7 (Blue Arrow 7), de 1,8 m y 47 kg, guiados por láser contra carros, y cuatro bombas planeadoras LS-6 de 50 kg en los pilones de dentro.",
    nota: "Ninguna foto del demostrador las lleva colgadas: su forma sale de las maquetas a tamaño real de las ferias y cómo van, de los lanzadores. El BA-7 es el único que consta usado en combate (Libia, 2019).",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "lomo", "hombro", "costado", "costadoArriba", "sobreArista", "bajoArista", "bordeArriba", "bordeAbajo", "nariz"] as const;
const aSeccion = (q: Seccion): Seccion => {
  const s = { ...q };
  for (const k of LARGOS_SECCION) if (s[k] !== undefined) s[k] = u(s[k]!);
  return s;
};
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aGiro = (p: Pieza): Pieza => (p.girar ? { ...p, girar: { ...p.girar, centro: u3(p.girar.centro) } } : p);
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });
const aUnidades = (q: Pieza): Pieza => {
  const p = aGiro(q);
  switch (p.tipo) {
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map(aSeccion), ...(p.x !== undefined && { x: u(p.x) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): Est => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(([a, b]): [number, number] => [u(a), u(b)]), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(([a, b]): [number, number] => [u(a), u(b)]), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: [u(p.centro[0]), u(p.centro[1])] as [number, number] }) };
    case "helice":
      return { ...p, en: [u(p.en[0]), u(p.en[1]), u(p.en[2])], radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje && { buje: u(p.buje) }) };
    case "pila":
      return { ...p, niveles: p.niveles.map((n) => ({ y: u(n.y), planta: n.planta.map(([a, b]): [number, number] => [u(a), u(b)]) })) };
    case "disco":
      return { ...p, en: [u(p.en[0]), u(p.en[1]), u(p.en[2])], radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

const maqueta: Maqueta = {
  nombre: "Wing Loong II",
  subtitulo: "Dron de ataque MALE",
  escala: ESCALA,  // 1 unidad = 7,8 m, como el MQ-9
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("CN"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "frente", imagen: "commons-dubai2017-frente.jpg", titulo: "El demostrador de frente, Dubai Airshow 2017", medio: "Mztourist, Wikimedia Commons (CC BY-SA 4.0)", url: "https://commons.wikimedia.org/wiki/File:Wing_Loong_II_fron_view.jpg" },
    { id: "perfil", imagen: "commons-dubai2017-perfil.jpg", titulo: "El demostrador de tres cuartos, Dubai Airshow 2017", medio: "Mztourist, Wikimedia Commons (CC BY-SA 4.0)", url: "https://commons.wikimedia.org/wiki/File:Wing_Loong_II_side_view.jpg" },
    { id: "singapur", imagen: "commons-flickr-drone-2018.jpg", titulo: "El morro con el halcón, Singapore Airshow 2018", medio: "aamanatullah, Wikimedia Commons (CC BY 2.0)", url: "https://commons.wikimedia.org/wiki/File:Drone_(40203028111).jpg" },
    { id: "aerofossile", imagen: "flickr-aerofossile.jpg", titulo: "El demostrador con sus armas expuestas al lado", medio: "Aerofossile2012, Flickr (CC BY-NC-SA 2.0)", url: "https://www.flickr.com/photos/17350451@N08/44306344104" },
    { id: "sinodefence", imagen: "flickr-sinodefence-2.jpg", titulo: "El ala con los pilones cargados y el tren, de cerca", medio: "SinoDefence.com, Flickr (dominio público)", url: "https://www.flickr.com/photos/164925283@N02/42858589401" },
    { id: "maks", imagen: "maks2019-95.1.jpg", titulo: "El demostrador en MAKS 2019 (fotograma)", medio: "The Aviationist, YouTube", url: "https://www.youtube.com/watch?v=9hUuDqw7Vh0" },
    { id: "zhuhai", imagen: "zhuhai2021-16.5.jpg", titulo: "Un Wing Loong II rodando en Airshow China 2021 (fotograma)", medio: "New China TV (Xinhua), YouTube", url: "https://www.youtube.com/watch?v=_CR-XGy5Ry8" },
    { id: "xinhua", titulo: "Medidas oficiales del Wing Loong II (AVIC)", medio: "Xinhua, por chinanews.com (28-02-2017)", url: "https://www.chinanews.com/mil/2017/02-28/8161585.shtml" },
    { id: "ba7", titulo: "AKD-10 / Blue Arrow 7", medio: "GlobalSecurity.org", url: "https://www.globalsecurity.org/military/world/china/akd-10.htm" },
  ],
};

export default maqueta;
