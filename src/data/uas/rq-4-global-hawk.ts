// Maqueta del RQ-4B Global Hawk de Northrop Grumman: el 04-2015 (Block 20),
// sin armas. Medidas de Designation-Systems y Air & Space Forces (39,9 m de
// envergadura, 14,5 m de largo, 4,7 m de alto); la forma, de fotos de la
// Fuerza Aérea de EE. UU. y de Le Bourget 2009 (la de perfil aterrizando en
// Andersen, casi sin perspectiva, da el contorno: 97 px/m). Todo se escribe
// en metros y al final se pasa a unidades de la maqueta (1 unidad = 15 m).
// Imágenes a tamaño completo en arte/uas-fuentes/rq-4-global-hawk/ (fuera
// de Git; enlaces en docs/drones/rq-4-global-hawk.md).
import type { Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 15;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Ala recta y larga, en mitad del costado: el borde de ataque con algo de
// flecha y el de salida casi recto; en vuelo se dobla hacia arriba (fotos de
// frente aterrizando), más cuanto más fuera.
const ALA = { y: -0.15, punta: 19.95, baRaiz: 0.85, bsRaiz: -1.75, baPunta: -0.75, bsPunta: -1.55, tRaiz: 0.36, tPunta: 0.1, sube: 1.2 };
const enAla = (raiz: number, punta: number) => (x: number) => raiz + ((punta - raiz) * x) / ALA.punta;
const bordeAtaque = enAla(ALA.baRaiz, ALA.baPunta);
const bordeSalida = enAla(ALA.bsRaiz, ALA.bsPunta);
const grosorAla = enAla(ALA.tRaiz, ALA.tPunta);
const subidaAla = (x: number) => ALA.sube * (x / ALA.punta) ** 2;
// Alerones por fuera, de un cuarto de la cuerda, con su hueco.
const MANDO = { cuerda: 0.25, hueco: 0.006, aleron: [11.5, 19.3] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda * (bordeAtaque(x) - bordeSalida(x));
const estAla = (x: number, hastaBisagra = false): [number, number, number, number, number] =>
  [x, bordeAtaque(x), hastaBisagra ? bisagra(x) : bordeSalida(x), grosorAla(x), subidaAla(x)];
const estAleron = (x: number): [number, number, number, number, number] =>
  [x, bisagra(x) - MANDO.hueco, bordeSalida(x), grosorAla(x) * 0.45, subidaAla(x)];

// Cola en V: dos aletas que nacen bajo en los costados de la cola, detrás de
// la góndola, abiertas 45° sobre el horizonte (foto de frente de Sigonella). Contorno del
// perfil de Andersen: 2,8 m de alto, cuerda de 1,65 m en la raíz y 0,82 m en
// la punta, el borde de ataque en flecha y el de salida casi recto.
const COLA = { x: 0.3, y: 0, largo: 3.95, baRaiz: -5.5, bsRaiz: -7.18, baPunta: -6.53, bsPunta: -7.35, angulo: (45 * Math.PI) / 180 };
const enCola = (raiz: number, punta: number) => (d: number) => raiz + ((punta - raiz) * d) / COLA.largo;
const bordeAtaqueCola = enCola(COLA.baRaiz, COLA.baPunta);
const bordeSalidaCola = enCola(COLA.bsRaiz, COLA.bsPunta);
const grosorCola = enCola(0.2, 0.08);
// Timones (ruddervators), de un cuarto de la cuerda.
const TIMON = { cuerda: 0.27, desde: 0.7, hasta: 3.75 };
const bisagraCola = (d: number) => bordeSalidaCola(d) + TIMON.cuerda * (bordeAtaqueCola(d) - bordeSalidaCola(d));
const estCola = (d: number, timon = false): [number, number, number, number, number] =>
  [COLA.x + d * Math.cos(COLA.angulo), bordeAtaqueCola(d), timon ? bisagraCola(d) : bordeSalidaCola(d), grosorCola(d), d * Math.sin(COLA.angulo)];
const estTimon = (d: number): [number, number, number, number, number] =>
  [COLA.x + d * Math.cos(COLA.angulo), bisagraCola(d) - 0.006, bordeSalidaCola(d), grosorCola(d) * 0.45, d * Math.sin(COLA.angulo)];

// Toma de aire del motor (perfil de Andersen): la boca de la góndola, en el
// centro, encima del cuerpo y detrás de la joroba. Mira hacia delante y
// hacia arriba: el labio de abajo va adelantado (z 0,16, a 0,93 m) y el de
// arriba retrasado (z −0,40, a lo alto de la góndola), 32° sobre la
// vertical. Por fuera, 1,06 m de ancho y 1,07 m a lo largo del labio, que
// es grueso y redondo.
const TOMA = { z: -0.12, y: 1.385, alto: 0.535, ancho: 0.53, labio: 0.1, inclina: -32 };

// Tobera del motor (perfil de Andersen, fotos de detrás de Andersen, del
// museo de Glenville y de la NASA): un agujero redondo y grande al final de
// la góndola, con el borde de abajo algo retrasado. Escalones: la góndola
// acaba, sale el aro de la tobera, el labio y dentro, negro.
const TOBERA = { z: -5.75, y: 1.0, radio: 0.33, inclina: 15 };

// Cuerpo, en metros: medio ancho, lomo, panza y cintura (donde es más
// ancho). En el morro, la joroba (la antena del satélite) es un arco alto,
// de 1,7 m de ancho (foto de frente de Sigonella), que se monta un poco
// sobre la parte de abajo: la cintura es una arista (la ceja que se ve en
// todas las fotos de lado, a 0,5 m). Detrás de la toma, la góndola del
// motor sale del cuerpo como un lomo de costados casi rectos, fundido con
// los del cuerpo (foto del museo): `lomo` es su medio ancho y `hombro`, lo
// alto del cuerpo de debajo. Acaba de golpe en la tobera; detrás, la cola
// es una cubierta plana con arista a los lados, donde nacen las aletas.
type Fila = { z: number; ancho: number; arriba: number; abajo: number; cintura: number } & Partial<Seccion>;
const sec = (q: Fila): Seccion => ({ n: 2.6, nAbajo: 2.4, ...q });
const conLomo = (z: number, ancho: number, hombro: number, arriba: number, abajo: number, cintura: number, lomo: number): Fila =>
  ({ z, ancho, hombro, arriba, abajo, cintura, lomo, n: 2.2, nLomo: 2.8, pLomo: 6 });
const CUERPO: Seccion[] = ([
  // El morro, de frente (Le Bourget): arco redondo arriba, costados casi
  // rectos de la ceja abajo y, más abajo, se recoge hacia la mandíbula.
  { z: 7.28, ancho: 0, arriba: 0.2, abajo: 0.2, cintura: 0.2 },
  { z: 7.265, ancho: 0.14, arriba: 0.33, abajo: 0.08, cintura: 0.22, n: 2, nAbajo: 2 },
  { z: 7.22, ancho: 0.29, arriba: 0.5, abajo: -0.03, cintura: 0.27, n: 2.1, nAbajo: 2.1 },
  { z: 7.12, ancho: 0.45, arriba: 0.68, abajo: -0.2, cintura: 0.31, n: 2.3, nAbajo: 2.25 },
  { z: 6.95, ancho: 0.6, arriba: 0.88, abajo: -0.33, cintura: 0.37, n: 2.4, nAbajo: 2.4 },
  { z: 6.7, ancho: 0.7, arriba: 1.12, abajo: -0.4, cintura: 0.43, n: 2.4, nAbajo: 2.6 },
  { z: 6.35, ancho: 0.77, arriba: 1.34, abajo: -0.44, cintura: 0.48, arista: 0.12, n: 2.3, nAbajo: 2.8 },
  { z: 5.8, ancho: 0.82, arriba: 1.555, abajo: -0.5, cintura: 0.52, arista: 0.25, n: 2.3, nAbajo: 2.8 },
  { z: 5.0, ancho: 0.84, arriba: 1.715, abajo: -0.6, cintura: 0.55, arista: 0.25, n: 2.35, nAbajo: 2.8 },
  // Detrás de lo alto, la joroba baja hasta la toma en una curva larga (de
  // perfil, en Andersen), y la panza ondula: baja un poco bajo el ala y
  // sube mucho detrás de ella, hasta la cola.
  { z: 4.4, ancho: 0.84, arriba: 1.67, abajo: -0.78, cintura: 0.52, arista: 0.25, n: 2.4, nAbajo: 2.7 },
  { z: 4.0, ancho: 0.83, arriba: 1.6, abajo: -0.88, cintura: 0.49, arista: 0.22, n: 2.4, nAbajo: 2.6 },
  { z: 3.6, ancho: 0.81, arriba: 1.5, abajo: -0.985, cintura: 0.45, arista: 0.2 },
  { z: 3.25, ancho: 0.785, arriba: 1.41, abajo: -0.99, cintura: 0.4, arista: 0.16 },
  { z: 2.9, ancho: 0.76, arriba: 1.3, abajo: -0.995, cintura: 0.35, arista: 0.12 },
  { z: 2.5, ancho: 0.73, arriba: 1.17, abajo: -1.01, cintura: 0.28, arista: 0.08, n: 2.5 },
  { z: 2.2, ancho: 0.7, arriba: 1.08, abajo: -1.02, cintura: 0.2, arista: 0.05, n: 2.5 },
  { z: 1.75, ancho: 0.68, arriba: 0.95, abajo: -1.025, cintura: 0.12, n: 2.5 },
  { z: 1.4, ancho: 0.66, arriba: 0.875, abajo: -1.035, cintura: 0.05, n: 2.4, nAbajo: 2.3 },
  { z: 1.0, ancho: 0.65, arriba: 0.81, abajo: -1.03, cintura: 0.02, n: 2.3, nAbajo: 2.3 },
  { z: 0.6, ancho: 0.64, arriba: 0.78, abajo: -1.01, cintura: 0, n: 2.2, nAbajo: 2.3, pLomo: 40 },
  { z: 0.25, ancho: 0.64, arriba: 0.78, abajo: -1.0, cintura: 0, n: 2.2, nAbajo: 2.3, pLomo: 40 },
  // La góndola empieza detrás del labio de abajo de la toma: entre los dos
  // queda el hueco (fotos de Le Bourget); su frente, alto, queda dentro de
  // la toma. Donde nace, el empalme es duro: el suave hincha lo alto del
  // cuerpo y salía un escalón delante de la toma. El pliegue fino que baja
  // en diagonal del labio al ala (fotos) no va en la forma: bajando el
  // hombro salía una ondulación ancha en el costado.
  { ...conLomo(-0.02, 0.64, 0.77, 0.77, -0.985, 0.04, 0.45), pLomo: 40 },
  conLomo(-0.12, 0.64, 0.76, 1.3, -0.97, 0.08, 0.53),
  conLomo(-0.25, 0.64, 0.76, 1.48, -0.955, 0.12, 0.55),
  conLomo(-0.38, 0.63, 0.75, 1.67, -0.935, 0.16, 0.555),
  conLomo(-0.5, 0.62, 0.74, 1.77, -0.915, 0.2, 0.54),
  conLomo(-0.9, 0.61, 0.73, 1.795, -0.85, 0.28, 0.55),
  conLomo(-1.5, 0.6, 0.72, 1.79, -0.775, 0.33, 0.56),
  conLomo(-2.2, 0.59, 0.7, 1.76, -0.685, 0.35, 0.56),
  conLomo(-3.0, 0.58, 0.66, 1.71, -0.625, 0.35, 0.56),
  conLomo(-3.6, 0.56, 0.62, 1.67, -0.61, 0.35, 0.55),
  conLomo(-4.6, 0.52, 0.55, 1.56, -0.6, 0.35, 0.52),
  conLomo(-5.15, 0.49, 0.5, 1.47, -0.54, 0.35, 0.46),
  { ...conLomo(-5.55, 0.46, 0.45, 1.35, -0.49, 0.35, 0.38), nLomo: 2.6 },
  { ...conLomo(-5.64, 0.455, 0.43, 1.31, -0.48, 0.35, 0.34), nLomo: 2.4 },
  // Detrás de la tobera, la cubierta plana de la cola, con arista a los
  // lados, y encima, en el centro, el cajón de costados rectos que va de
  // debajo de la tobera hasta el final (fotos de la lluvia y de la NASA).
  { ...conLomo(-5.72, 0.45, 0.41, 0.68, -0.47, 0.32, 0.3), nLomo: 5, pLomo: 10 },
  { ...conLomo(-5.95, 0.44, 0.36, 0.66, -0.43, 0.12, 0.29), n: 5, arista: 0.5, nLomo: 6, pLomo: 12 },
  { ...conLomo(-6.3, 0.42, 0.33, 0.63, -0.36, 0.12, 0.28), n: 5, arista: 0.5, nLomo: 6, pLomo: 12 },
  { ...conLomo(-6.7, 0.38, 0.3, 0.6, -0.25, 0.12, 0.27), n: 5, arista: 0.5, nLomo: 6, pLomo: 12 },
  { ...conLomo(-7.0, 0.34, 0.28, 0.58, -0.15, 0.12, 0.26), n: 5, arista: 0.5, nLomo: 6, pLomo: 12, nAbajo: 2.2 },
  // Acaba recta donde acaban las raíces de las aletas: nada de ellas queda
  // al aire por detrás.
  { ...conLomo(-7.2, 0.31, 0.27, 0.565, -0.06, 0.12, 0.25), n: 5, arista: 0.5, nLomo: 6, pLomo: 12, nAbajo: 2 },
] as Fila[]).map(sec);

// Mandíbula: bajo el morro, un tubo más estrecho que la joroba, metido bajo
// ella (la «boca»; fotos de Beale y Le Bourget). Delante, justo bajo la
// punta del morro, una cara con la ventanita; de ahí la mandíbula se recoge
// hacia atrás en una curva redonda hasta su fondo, casi plano (perfil de
// Andersen y foto de perfil del usuario). Dos muescas la rodean (z 6,34 y
// 5,27); detrás de la segunda, el carenado de debajo hace un escalón. Hacia
// atrás se funde con la panza.
const MUESCA = 0.012;
const anilloMandibula = (z: number, q: Seccion): Seccion[] => [
  { ...q, z: z + 0.02 },
  { ...q, z, ancho: q.ancho - MUESCA, abajo: q.abajo + MUESCA },
  { ...q, z: z - 0.02 },
];
const TUBO = { ancho: 0.4, arriba: -0.18, cintura: -0.58 };
const MANDIBULA: Seccion[] = [
  { z: 7.215, ancho: 0.2, arriba: -0.03, abajo: -0.27, cintura: -0.15 },
  { z: 7.2, ancho: 0.27, arriba: 0.0, abajo: -0.31, cintura: -0.16 },
  { z: 7.12, ancho: 0.33, arriba: 0.0, abajo: -0.38, cintura: -0.2 },
  { z: 7.04, ancho: 0.36, arriba: -0.03, abajo: -0.48, cintura: -0.28 },
  { z: 6.95, ancho: 0.38, arriba: -0.06, abajo: -0.6, cintura: -0.37 },
  { z: 6.85, ancho: 0.39, arriba: -0.09, abajo: -0.68, cintura: -0.44 },
  { z: 6.7, ancho: 0.4, arriba: -0.13, abajo: -0.735, cintura: -0.51 },
  { z: 6.55, ancho: 0.4, arriba: -0.16, abajo: -0.76, cintura: -0.55 },
  { z: 6.42, ...TUBO, abajo: -0.765, cintura: -0.57 },
  ...anilloMandibula(6.34, { z: 0, ...TUBO, abajo: -0.77 }),
  { z: 6.0, ...TUBO, abajo: -0.775 },
  { z: 5.6, ...TUBO, abajo: -0.79 },
  ...anilloMandibula(5.27, { z: 0, ...TUBO, abajo: -0.8 }),
  { z: 5.0, ...TUBO, ancho: 0.41, abajo: -0.82 },
  { z: 4.6, ancho: 0.43, arriba: -0.25, abajo: -0.85, cintura: -0.6 },
  { z: 4.2, ancho: 0.4, arriba: -0.4, abajo: -0.88, cintura: -0.65 },
  { z: 3.9, ancho: 0.3, arriba: -0.55, abajo: -0.92, cintura: -0.72 },
  { z: 3.6, ancho: 0, arriba: -0.8, abajo: -0.8, cintura: -0.8 },
].map((q) => ({ n: 2, nAbajo: 2.3, ...q }));

// Quilla bajo la panza, detrás del ala: un carenado estrecho con el frente
// romo y la cola larga (perfil de Andersen; en la foto del 04-2015, oscura
// bajo la escarapela). El ancho, supuesto.
const QUILLA: Seccion[] = [
  { z: -3.05, ancho: 0.03, abajo: -0.62 },
  { z: -3.12, ancho: 0.1, abajo: -0.8 },
  { z: -3.22, ancho: 0.13, abajo: -0.95 },
  { z: -3.35, ancho: 0.14, abajo: -1.03 },
  { z: -3.48, ancho: 0.14, abajo: -1.05 },
  { z: -3.62, ancho: 0.135, abajo: -1.01 },
  { z: -3.8, ancho: 0.12, abajo: -0.93 },
  { z: -4.0, ancho: 0.1, abajo: -0.83 },
  { z: -4.2, ancho: 0.07, abajo: -0.71 },
  { z: -4.38, ancho: 0, abajo: -0.59 },
].map((q) => ({ arriba: -0.45, cintura: -0.62, n: 2, nAbajo: 2.6, ...q }));

// Aletas de debajo de la cola: una a cada lado, bajo la raíz de cada aleta
// de la V, abiertas hacia fuera y hacia abajo (perfil de Andersen y el
// 04-2015 en vuelo). Nacen del borde de abajo del cuerpo, con la raíz más
// baja delante; el ángulo hacia fuera es supuesto.
const ALETA_BAJA = { x: 0.2, y: -0.31, z: -5.985, abre: 55, pendiente: 11.5 };

// Toma de aire, en forma de D: arriba redonda, abajo casi plana y algo más
// ancha (Le Bourget de tres cuartos). El labio, en secciones que crecen
// desde el borde de la boca; detrás se cierra dentro de la góndola.
// La cara de abajo va horizontal hacia atrás (no inclinada como la boca),
// y deja el hueco sobre el cuerpo hasta el frente de la góndola.
const PLANA = Math.tan((-TOMA.inclina * Math.PI) / 180);
const BOCA = (z: number, f: number): Seccion => {
  const abajo = TOMA.y - TOMA.alto * f + 0.06 + (TOMA.z - z) * PLANA;
  return { z, ancho: TOMA.ancho * f, arriba: TOMA.y + TOMA.alto * f, abajo, cintura: abajo + 0.7 * TOMA.alto * f, n: 2.1, nAbajo: 3.6 };
};
const LABIO = 1 - TOMA.labio / TOMA.alto;

// Hoyuelos de las mejillas: el óvalo hundido bajo la ceja, a cada lado de
// la joroba, donde van las ventanas oscuras (Andersen, Le Bourget, el
// 04-2015 en vuelo). Lo hondo, a ojo por la luz de las fotos.
const MEJILLA = { y: 0.27, z: 5.6, alto: 0.22, largo: 0.95, hondo: 0.09 };

// Carenado de la raíz de la cola: centro en la esquina entre aleta y
// costado, que se acerca al eje hacia atrás con el costado.
const RAIZ = {
  x: 0.41, z: -5.5, giro: 3.9,
  secciones: [
    { z: -5.4, ancho: 0, arriba: 0.06, abajo: 0.06, cintura: 0.06 },
    { z: -5.55, ancho: 0.06, arriba: 0.12, abajo: 0.0, cintura: 0.06 },
    { z: -5.9, ancho: 0.08, arriba: 0.13, abajo: -0.03, cintura: 0.05 },
    { z: -6.6, ancho: 0.085, arriba: 0.13, abajo: -0.05, cintura: 0.04 },
    { z: -7.17, ancho: 0.075, arriba: 0.11, abajo: -0.04, cintura: 0.04 },
  ] as Seccion[],
};

const PIEZAS: Pieza[] = [
  // El cuerpo y la góndola del motor, de una pieza.
  { tipo: "casco", id: "fuselaje", acabado: "gris-gh", secciones: CUERPO, polo: true, hoyuelos: [MEJILLA] },
  // Carenado en la raíz de cada aleta de la V, de punta a punta de la raíz
  // (perfil de Andersen, foto de la NASA): un tubo medio metido en la
  // esquina entre la aleta y el costado, que sigue el costado hacia atrás.
  ...([1, -1] as const).map((lado): Pieza => ({
    tipo: "casco", id: "raices-cola", acabado: "gris-gh", x: lado * RAIZ.x, secciones: RAIZ.secciones,
    girar: { centro: [lado * RAIZ.x, 0, RAIZ.z], eje: "y", grados: lado * RAIZ.giro },
  })),
  // La boca: el labio, grueso y redondo, con la cara de delante tapada por
  // la boca oscura, un poco por delante. Por debajo queda volado sobre el
  // cuerpo, con un hueco.
  {
    tipo: "casco", id: "toma", acabado: "gris-gh",
    girar: { centro: [0, TOMA.y, TOMA.z], eje: "x", grados: TOMA.inclina },
    secciones: [
      BOCA(TOMA.z, LABIO), BOCA(TOMA.z - 0.012, 0.89), BOCA(TOMA.z - 0.035, 0.953), BOCA(TOMA.z - 0.07, 0.993),
      BOCA(TOMA.z - 0.11, 1), BOCA(TOMA.z - 0.25, 0.99), BOCA(TOMA.z - 0.36, 0.9), { z: TOMA.z - 0.42, ancho: 0, arriba: TOMA.y + 0.2, abajo: TOMA.y + 0.2, cintura: TOMA.y + 0.2 },
    ],
  },
  {
    tipo: "casco", id: "toma-boca", acabado: "hueco",
    girar: { centro: [0, TOMA.y, TOMA.z], eje: "x", grados: TOMA.inclina },
    secciones: [BOCA(TOMA.z + 0.004, LABIO + 0.008), BOCA(TOMA.z - 0.004, LABIO + 0.008)],
  },
  // La tobera: el final de la propia góndola, sin aro aparte; el labio
  // redondo y el agujero negro, un poco hundido.
  {
    tipo: "tubo", id: "tobera", acabado: "gris-gh", centro: [0, TOBERA.y],
    girar: { centro: [0, TOBERA.y, TOBERA.z], eje: "x", grados: TOBERA.inclina },
    perfil: [
      [TOBERA.z + 0.3, 0], [TOBERA.z + 0.3, TOBERA.radio], [TOBERA.z + 0.04, TOBERA.radio], [TOBERA.z + 0.012, TOBERA.radio - 0.012],
      [TOBERA.z, TOBERA.radio - 0.035], [TOBERA.z + 0.004, TOBERA.radio - 0.06], [TOBERA.z + 0.03, TOBERA.radio - 0.06], [TOBERA.z + 0.03, 0],
    ],
  },
  {
    tipo: "tubo", id: "tobera-boca", acabado: "hueco", centro: [0, TOBERA.y],
    girar: { centro: [0, TOBERA.y, TOBERA.z], eje: "x", grados: TOBERA.inclina },
    perfil: [[TOBERA.z + 0.029, 0], [TOBERA.z + 0.029, TOBERA.radio - 0.061], [TOBERA.z + 0.026, TOBERA.radio - 0.061], [TOBERA.z + 0.026, 0]],
  },
  // Antena sobre la góndola (perfil de Andersen y el 04-2015 en vuelo): una
  // tapa clara, ancha y fina, sobre un pie estrecho y alargado.
  { tipo: "caja", id: "antena", acabado: "blanco", centro: [0, 1.85, -2.06], tam: [0.05, 0.24, 0.24], redondeo: 0.02 },
  { tipo: "caja", id: "antena", acabado: "blanco", centro: [0, 1.975, -2.03], tam: [0.3, 0.03, 0.42], redondeo: 0.1 },
  // Mandíbula bajo el morro, con su ventanita.
  { tipo: "casco", id: "mandibula", acabado: "gris-gh", secciones: MANDIBULA },
  { tipo: "disco", id: "ventanita", acabado: "lente", en: [0, -0.14, 7.216], normal: [0, 0, 1], radio: 0.07, grosor: 0.004 },
  // Carenado plano bajo la mandíbula, de la segunda muesca hacia atrás, con
  // el fondo que baja hacia atrás (perfil de Andersen).
  {
    tipo: "caja", id: "carenado-panza", acabado: "gris-gh", redondeo: 0.08, centro: [0, -0.84, 4.5], tam: [0.5, 0.2, 1.5],
    girar: { centro: [0, -0.84, 4.5], eje: "x", grados: -5 },
  },
  // Quilla bajo la panza, detrás del ala.
  { tipo: "casco", id: "quilla", acabado: "gris-gh", secciones: QUILLA },
  // Aletas de debajo de la cola: cuelgan de la raíz, se abren hacia fuera y
  // se inclinan con la raíz (más baja delante).
  ...([1, -1] as const).map((lado): Pieza => ({
    tipo: "ala", id: "aletas-bajas", acabado: "gris-gh", vertical: true, sola: true, x: lado * ALETA_BAJA.x, y: ALETA_BAJA.y,
    estaciones: [[0, -5.15, -6.82, 0.05], [0.7, -5.45, -6.55, 0.03]],
    girar: { centro: [lado * ALETA_BAJA.x, ALETA_BAJA.y, ALETA_BAJA.z], eje: "z", grados: lado * ALETA_BAJA.abre },
    girarLuego: { centro: [0, ALETA_BAJA.y, ALETA_BAJA.z], eje: "x", grados: ALETA_BAJA.pendiente },
  })),
  {
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor, subida].
    // Donde van los alerones, el borde de salida se adelanta hasta la bisagra.
    tipo: "ala", id: "ala", acabado: "gris-gh", y: ALA.y,
    estaciones: [
      estAla(0), estAla(4), estAla(8),
      estAla(MANDO.aleron[0]), estAla(MANDO.aleron[0], true),
      estAla(15.5, true),
      estAla(MANDO.aleron[1], true), estAla(MANDO.aleron[1]),
      estAla(ALA.punta),
    ],
  },
  { tipo: "ala", id: "alerones", acabado: "gris-gh", y: ALA.y, estaciones: [estAleron(MANDO.aleron[0] + MANDO.hueco), estAleron(15.5), estAleron(MANDO.aleron[1] - MANDO.hueco)] },
  // Cola en V: cada aleta empieza dentro del cuerpo y sube hacia fuera; los
  // timones, aparte.
  {
    tipo: "ala", id: "cola", acabado: "gris-gh", y: COLA.y,
    estaciones: [estCola(0), estCola(TIMON.desde), estCola(TIMON.desde, true), estCola(TIMON.hasta, true), estCola(TIMON.hasta), estCola(COLA.largo)],
  },
  { tipo: "ala", id: "timones", acabado: "gris-gh", y: COLA.y, estaciones: [estTimon(TIMON.desde + 0.006), estTimon(TIMON.hasta - 0.006)] },
];

const PARTES: Parte[] = [
  {
    nombre: "La joroba del morro",
    en: [0.5, 1.75, 4.6],
    piezas: ["fuselaje", "mandibula", "ventanita"],
    respaldo: "foto",
    fuentes: ["perfil", "paris", "morro"],
    texto: "El bulto del morro guarda la antena de satélite, de más de un metro, con la que el Global Hawk habla con su base desde el otro lado del mundo. Debajo van las cámaras y el radar, en una mandíbula más estrecha que asoma bajo la punta, con una ventanita.",
    nota: "La forma, del perfil de Andersen; el ancho y la mandíbula, de las fotos de Le Bourget y de Beale.",
  },
  {
    nombre: "Toma de aire y motor",
    en: [0, 2.0, -0.3],
    piezas: ["toma", "toma-boca"],
    respaldo: "foto",
    fuentes: ["perfil", "ala", "paris", "vuelo"],
    texto: "El motor, un turbofán Rolls-Royce, va encima del lomo, detrás de las alas, dentro de una góndola que sale del cuerpo. Respira por esta boca en forma de D, de labio grueso, que mira hacia delante y hacia arriba y queda volada sobre el cuerpo.",
    nota: "La boca y el alto de la góndola, del perfil de Andersen; la forma, de las fotos de Le Bourget.",
  },
  {
    nombre: "Tobera",
    en: [0, 1.5, -5.75],
    piezas: ["tobera", "tobera-boca"],
    respaldo: "foto",
    fuentes: ["trasera", "museo", "nasa", "perfil"],
    texto: "El escape del motor: un agujero redondo y grande al final de la góndola, entre las dos aletas de la cola, que así tapan su calor a quien mira desde abajo o de lado. Debajo, un cajón recto llega hasta el final de la cola.",
    nota: "De las fotos de detrás de Andersen, del museo de Glenville y de la NASA; el tamaño, del perfil de Andersen.",
  },
  {
    nombre: "Ala de planeador",
    en: [12.0, 0.6, -0.6],
    piezas: ["ala", "alerones"],
    respaldo: "foto",
    fuentes: ["vuelo", "planta", "ds"],
    texto: "39,9 m de punta a punta, casi el triple que el largo del avión, y muy fina: así aguanta en el aire enrarecido de los 18.000 m gastando poco. En vuelo se dobla hacia arriba.",
    nota: "La envergadura es la oficial; la cuerda y el estrechamiento, medidos en las fotos. Cuánto se dobla en vuelo, aproximado.",
  },
  {
    nombre: "Cola en V",
    en: [2.2, 2.6, -6.9],
    piezas: ["cola", "timones"],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "trasera"],
    texto: "Dos aletas abiertas en V que hacen de timón de dirección y de profundidad a la vez. Nacen bajas, a los lados de la cola, y dejan el escape del motor entre las dos.",
    nota: "El contorno, del perfil de Andersen; el ángulo de la V, de la foto de frente de Sigonella.",
  },
  {
    nombre: "Aletas de la panza",
    en: [0.6, -0.9, -5.9],
    piezas: ["aletas-bajas", "quilla"],
    respaldo: "foto",
    fuentes: ["perfil", "vuelo"],
    texto: "Bajo la cola, dos aletas pequeñas abiertas hacia los lados y, más adelante, una quilla en el centro de la panza.",
    nota: "La forma de lado, del perfil de Andersen; cuánto se abren las aletas y el ancho de la quilla, supuestos.",
  },
  {
    nombre: "Antena del lomo",
    en: [0, 2.15, -2.05],
    piezas: ["antena"],
    respaldo: "foto",
    fuentes: ["perfil", "trasera"],
    texto: "Una antena pequeña sobre la góndola del motor: una lata clara con tapa.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
// En cada sección, todas las medidas; las normas (n, nLomo…) no cambian.
const MEDIDAS = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "lomo", "hombro"] as const;
const aSeccion = (q: Seccion): Seccion => {
  const r = { ...q };
  for (const k of MEDIDAS) if (r[k] !== undefined) r[k] = u(r[k]);
  return r;
};
const aGiro = (g: Pieza["girar"]) => g && { ...g, centro: u3(g.centro) };
const aUnidades = (p: Pieza): Pieza => {
  const q = { ...p, ...(p.girar && { girar: aGiro(p.girar) }), ...(p.girarLuego && { girarLuego: aGiro(p.girarLuego) }) } as Pieza;
  switch (q.tipo) {
    case "tubo":
      return { ...q, perfil: q.perfil.map((v) => v.map(u) as typeof v), ...(q.centro && { centro: u2(q.centro) }) };
    case "casco":
      return { ...q, secciones: q.secciones.map(aSeccion), ...(q.x !== undefined && { x: u(q.x) }), ...(q.hoyuelos && { hoyuelos: q.hoyuelos.map((o) => ({ y: u(o.y), z: u(o.z), alto: u(o.alto), largo: u(o.largo), hondo: u(o.hondo) })) }) };
    case "ala":
      return { ...q, y: u(q.y), ...(q.x !== undefined && { x: u(q.x) }), estaciones: q.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...q, desde: u3(q.desde), hasta: u3(q.hasta), radio: u(q.radio) };
    case "caja":
      return { ...q, centro: u3(q.centro), tam: u3(q.tam), ...(q.redondeo && { redondeo: u(q.redondeo) }) };
    case "disco":
      return { ...q, en: u3(q.en), radio: u(q.radio), grosor: u(q.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${q.tipo}`);
  }
};

const maqueta: Maqueta = {
  nombre: "RQ-4 Global Hawk",
  subtitulo: "Dron de reconocimiento de gran altitud y gran autonomía",
  escala: ESCALA,  // 1 unidad = 15 m; medidas de Designation-Systems
  hd: true,
  contornoPixel: true,
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "vuelo", imagen: "perfil-vuelo-04-2015.jpg", titulo: "El 04-2015 en su primer vuelo, de Palmdale a Edwards (2007)", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Global_Hawk_1.jpg` },
    { id: "perfil", imagen: "aterrizaje-perfil-andersen-2014.jpg", titulo: "De perfil, aterrizando en Andersen (Guam)", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}RQ-4B_Global_Hawk_lands_at_Andersen_AFB_%28140524-F-XD880-9027%29.jpg` },
    { id: "paris", imagen: "paris-3-4-delante-izq.jpg", titulo: "El 04-2015 en Le Bourget 2009, de tres cuartos", medio: "Georges Seguin (Okki), CC BY-SA 3.0 (Wikimedia Commons)", url: `${COMMONS}Salon_du_Bourget_20090619_212.jpg` },
    { id: "ala", imagen: "paris-ala-tren.jpg", titulo: "La raíz del ala, la toma de aire y la pata, en Le Bourget", medio: "Tangopaso, CC BY-SA 3.0 (Wikimedia Commons)", url: `${COMMONS}RQ-4_Global_Hawk_at_Paris_Air_Show-2009.jpg` },
    { id: "morro", imagen: "paris-morro-frente.jpg", titulo: "El morro visto de frente", medio: "Tangopaso, CC BY-SA 3.0 (Wikimedia Commons)", url: `${COMMONS}RQ-4_Global_Hawk_nose.jpg` },
    { id: "trasera", imagen: "trasera-3-4-pista-mojada.jpg", titulo: "De tres cuartos por detrás, bajo la lluvia en Andersen", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}USAF_RQ-4_in_the_rain_at_Anderson.jpg` },
    { id: "museo", imagen: "museo-trasera-dcha.jpg", titulo: "Un fuselaje de RQ-4 visto por detrás, en el museo de Glenville (Nueva York)", medio: "Valder137, CC BY 2.0 (Wikimedia Commons)", url: `${COMMONS}Northrop-Grumman_RQ-4_Global_Hawk_RSideRear_EASM_4Feb2010_%2814404362090%29.jpg` },
    { id: "nasa", imagen: "nasa-motor-cola.jpg", titulo: "La góndola del motor y la cola en V de un Global Hawk de la NASA", medio: "NASA (Wikimedia Commons)", url: `${COMMONS}The_above-the-fuselage_engine_and_V-tail_distinguish_one_of_NASA%27s_two_Global_Hawk_unmanned_aircraft_parked_on_the_ramp_at_the_Dryden_Flight_Research_Center_%28ED07-0244-058%29.jpg` },
    { id: "frente", imagen: "block40-frente-sigonella.jpg", titulo: "De frente, un Block 40 en Sigonella", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}US_Air_Force_RQ-4_Global_Hawk_Block_40_at_Sigonella.jpg` },
    { id: "planta", imagen: "planta-arriba-nasa.jpg", titulo: "Desde arriba, un Global Hawk de la NASA", medio: "NASA, CC BY 2.0 (Wikimedia Commons)", url: `${COMMONS}Global_Hawk_%288009100505%29.jpg` },
    { id: "ds", titulo: "RQ-4 Global Hawk", medio: "Designation-Systems.net", url: "https://www.designation-systems.net/dusrm/app2/q-4.html" },
    { id: "asf", titulo: "RQ-4 Global Hawk", medio: "Air & Space Forces Magazine", url: "https://www.airandspaceforces.com/weapons/rq-4/" },
  ],
};

export default maqueta;
