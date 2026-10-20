// Maqueta del SIRTAP de Airbus, el prototipo (SIRTAP001) como rueda en
// Getafe AB en junio de 2026: gris, con el radomo negro y la torreta naranja
// bajo la barbilla, sin armas.
// Medidas del Ministerio de Defensa (7,3 m de largo, 11 m de envergadura); la
// forma, de fotogramas de los vídeos de Airbus (el pintado y el primer rodaje)
// y de la foto del montaje, con las cámaras de seis de ellas encajadas a la
// vez junto con los puntos que se ven en varias (puntas del ala y de la cola,
// ruedas, aleta). Todo en arte/uas-fuentes/sirtap/ (fuera de Git).
// Todo se escribe en metros, con y = 0 a media altura del fuselaje y z = 0 a
// mitad de la cuerda del ala, y al final se pasa a unidades de la maqueta.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion, Toma } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 4.5;

const AIRBUS = "https://www.airbus.com/en/products-services/defence/uas/uas-solutions/sirtap";
const RED = "https://www.defensa.gob.es/Galerias/gabinete/red/2024/04/p-44-46-red-415-sirtap.pdf";
const RODAJE = "https://x.com/AirbusDefence/status/2066493295467876448";
const PINTADO = "https://x.com/AirbusDefence/status/1963583414931489020";
const MONTAJE = "https://www.airbus.com/en/newsroom/press-release/2025-06-first-airbus-sirtap-prototype-ready-to-start-ground-tests";

// ── Ala ────────────────────────────────────────────────────────────────────
// Alta, recta y trapezoidal, metida en lo alto del fuselaje: 11 m de punta a
// punta (los del Ministerio; las fotos encajadas dan de 10,8 a 11,2 según la
// lente que se suponga en la del montaje). La cuerda baja de 1,17 m junto al
// cuerpo a 0,4 en la punta, con los dos bordes en flecha suave, y la punta
// queda 0,1 m más baja que la raíz.
const ALA = { y: 0.16, punta: 5.5, baRaiz: 0.58, bsRaiz: -0.59, baPunta: 0.03, bsPunta: -0.37, tRaiz: 0.15, tPunta: 0.06, bajaPunta: 0.1 };
const enAla = (raiz: number, punta: number) => (x: number) => raiz + ((punta - raiz) * x) / ALA.punta;
const bordeAtaque = enAla(ALA.baRaiz, ALA.baPunta);
const bordeSalida = enAla(ALA.bsRaiz, ALA.bsPunta);
const grosorAla = enAla(ALA.tRaiz, ALA.tPunta);
const subidaAla = enAla(0, -ALA.bajaPunta);
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = bordeSalida(x)): Est => [x, bordeAtaque(x), bs, grosorAla(x), subidaAla(x)];
// Junta entre el tramo de dentro y el de fuera del ala (foto del montaje).
const JUNTA_ALA = 2.0;
// Flaps por dentro y alerones por fuera, con la bisagra al 25 % de la cuerda.
// El morro de cada uno entra un poco en el ala (dentro) y entre los dos queda
// 1 cm: con rendijas que dejan ver el fondo, el pixel las pintaba en negro.
const MANDO = { cuerda: 0.25, dentro: 0.01, flap: [0.45, 1.995], aleron: [2.005, 5.2] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda * (bordeAtaque(x) - bordeSalida(x));
const estMando = (x: number): Est => [x, bisagra(x) + MANDO.dentro, bordeSalida(x), grosorAla(x) * 0.45, subidaAla(x)];

// ── Cola en V ──────────────────────────────────────────────────────────────
// Ancha y baja: dos superficies a 28° sobre la horizontal, de 4 m de punta a
// punta (puntas encajadas en seis fotos), con el borde de ataque en flecha y
// la punta ancha, con la esquina de atrás redonda (perfil del rodaje medido).
// Nacen en lo alto de los costados de la góndola: entre ellas queda el lomo,
// con la toma de aire (foto del montaje).
const COLA = { y: 0.224, largo: 2.265, baRaiz: -2.08, baPunta: -2.26, esquina: 2.0, bsPunta: -2.66, angulo: (28 * Math.PI) / 180 };
const enCola = (raiz: number, punta: number) => (d: number) => raiz + ((punta - raiz) * d) / COLA.largo;
const bordeAtaqueCola = enCola(COLA.baRaiz, COLA.baPunta);
// El borde de salida, medido en el perfil a lo largo de la superficie (d, de
// la raíz a la punta), y desde la esquina un cuarto de elipse hasta la punta.
const SALIDA_COLA: [number, number][] = [[0, -2.99], [0.42, -2.953], [0.906, -2.872], [1.65, -2.788], [COLA.esquina, -2.745]];
const bordeSalidaCola = (d: number) => {
  if (d > COLA.esquina) {
    const t = Math.min(1, (d - COLA.esquina) / (COLA.largo - COLA.esquina)), bs = SALIDA_COLA[SALIDA_COLA.length - 1][1];
    return bs + (COLA.bsPunta - bs) * (1 - Math.sqrt(1 - t * t));
  }
  const i = Math.max(1, SALIDA_COLA.findIndex(([q]) => q >= d));
  const [d0, z0] = SALIDA_COLA[i - 1], [d1, z1] = SALIDA_COLA[i];
  return z0 + ((z1 - z0) * (d - d0)) / (d1 - d0);
};
const grosorCola = enCola(0.1, 0.04);
const TIMON = { cuerda: 0.3, desde: 0.35, hasta: 2.17 };
const bisagraCola = (d: number) => bordeSalidaCola(d) + TIMON.cuerda * (bordeAtaqueCola(d) - bordeSalidaCola(d));
const estCola = (d: number, timon = false): [number, number, number, number, number] =>
  [d * Math.cos(COLA.angulo), bordeAtaqueCola(d), timon ? bisagraCola(d) : bordeSalidaCola(d), grosorCola(d), d * Math.sin(COLA.angulo)];
const estTimon = (d: number): [number, number, number, number, number] =>
  [d * Math.cos(COLA.angulo), bisagraCola(d) - 0.006, bordeSalidaCola(d), grosorCola(d) * 0.45, d * Math.sin(COLA.angulo)];

// ── Tren ───────────────────────────────────────────────────────────────────
// Triciclo fijo. Ruedas encajadas en las fotos: la del morro en z = 2,09 y
// las principales a ±0,77 m del eje, en z = −0,55.
type P3 = [number, number, number];
const SUELO = -1.0;
const RUEDA = { r: 0.127, ancho: 0.08 };
const MORRO_TREN = { arriba: [0, -0.22, 2.05] as P3, eje: [0, SUELO + RUEDA.r, 2.09] as P3 };
const PRINCIPAL = { arriba: [0.15, -0.22, -0.4] as P3, rodilla: [0.66, -0.78, -0.44] as P3, eje: [0.7, SUELO + RUEDA.r, -0.55] as P3, rueda: [0.77, SUELO + RUEDA.r, -0.55] as P3 };

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Secciones [z, medio ancho, lomo, panza, cintura], medidas de perfil en el
// fotograma del rodaje con la cámara encajada. El radomo es una cabeza ancha
// y chata, más alta que el resto del fuselaje; detrás del ala el lomo sube
// hasta la góndola del motor, ancha y de cara casi cuadrada, mientras la
// panza sigue casi plana hasta ella. El fuselaje, de costados rectos y
// esquinas redondas: más cuadrado que un óvalo.
const sec = ([z, ancho, arriba, abajo, cintura]: number[], n = 2.6, nAbajo = 2.6): Seccion => ({ z, ancho, arriba, abajo, cintura, n, nAbajo });
const RADOMO: Seccion[] = [
  sec([3.824, 0, -0.089, -0.089, -0.089], 2.2, 2.2),
  sec([3.74, 0.12, 0.06, -0.15, -0.07], 2.2, 2.4),
  sec([3.62, 0.2, 0.162, -0.177, -0.04], 2.3, 2.6),
  sec([3.44, 0.27, 0.268, -0.203, -0.02], 2.3, 2.8),
  sec([3.26, 0.32, 0.339, -0.216, 0.0], 2.3, 3),
  sec([3.05, 0.35, 0.385, -0.227, 0.02], 2.3, 3),
  sec([2.9, 0.36, 0.409, -0.233, 0.03], 2.3, 3),
];
const FUSELAJE: Seccion[] = [
  sec([2.9, 0.36, 0.409, -0.233, 0.03], 2.3, 3),
  sec([2.535, 0.36, 0.413, -0.236, 0.04], 2.3, 3),
  sec([2.246, 0.35, 0.368, -0.237, 0.03], 2.5, 3.1),
  sec([1.956, 0.33, 0.315, -0.238, 0.02], 2.7, 3.2),
  sec([1.594, 0.31, 0.24, -0.239, 0.0], 2.9, 3.4),
  sec([1.377, 0.305, 0.217, -0.24, 0.0], 3, 3.4),
  sec([0.5, 0.3, 0.205, -0.245, 0.0], 3, 3.4),
  sec([-0.5, 0.297, 0.195, -0.252, 0.0], 3, 3.4),
  sec([-1.084, 0.293, 0.185, -0.256, 0.0], 3, 3.4),
  sec([-1.447, 0.29, 0.218, -0.256, 0.0], 2.9, 3.4),
  sec([-1.809, 0.288, 0.287, -0.25, 0.02], 2.8, 3.3),
  sec([-2.2, 0.287, 0.37, -0.232, 0.06], 2.7, 3.2),
  sec([-2.53, 0.287, 0.44, -0.21, 0.1], 2.7, 3),
  sec([-2.86, 0.287, 0.474, -0.18, 0.14], 2.7, 2.8),
  sec([-3.05, 0.282, 0.468, -0.115, 0.17], 3.2, 2.7),
  sec([-3.162, 0.272, 0.46, -0.045, 0.2], 3.6, 2.7),
];

// Media esfera como perfil de torno [z, radio], de delante atrás.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
// Torreta: un bote con el fondo redondo bajo la barbilla (perfil del rodaje).
const TORRETA = { z: 2.52, r: 0.2, arriba: -0.22, cuello: -0.385 };
// Puntas del ala: dónde acaba y a qué altura.
const PUNTA = { x: ALA.punta, y: ALA.y + subidaAla(ALA.punta) };
const LADOS = [1, -1];
// Toma de aire del lomo, delante de la cola (foto del montaje y vídeo del
// rodaje): una sola boca ancha y cuadrada, hundida, que ocupa casi todo lo
// alto de la góndola, partida en dos por un tabique; delante, la rampa, y
// encima una ceja de chapa que sobresale hacia delante.
const TOMA: Toma = { boca: -2.0, largo: 0.2, punta: -1.6, x: 0, y: 0.33, ancho: 0.17, hondo: 0.1, ceja: 0.008, cuadrada: true };
// Lo alto de la góndola en la boca (z = −2): la superelipse de su sección.
const lomoToma = (x: number) => 0.04 + 0.29 * (1 - Math.abs(x / 0.2875) ** 2.75) ** (1 / 2.75);
// Palas de la hélice: [t, delante, detrás] de la raíz a la punta, en
// fracciones del radio y de la cuerda. Arrancan del buje con un casquillo de
// metal (primeros planos del rodaje).
const PALA = { ancho: 0.12, forma: [[0.17, 0.3, 0.3], [0.25, 0.5, 0.42], [0.5, 0.5, 0.4], [0.75, 0.45, 0.35], [0.92, 0.38, 0.28], [1, 0.2, 0.1]] as [number, number, number][] };
const HELICE = { tipo: "helice" as const, en: [0, 0.33, -3.22] as P3, radio: 0.76, palas: 3, buje: 0, giro: 20 };
// La góndola acaba en la boca del motor: abierta, con un borde fino, y
// dentro, negro, el motor (primeros planos del rodaje, por detrás). La hélice
// va delante, con un plato blanco y el buje de metal atornillado (sin cono).
const CARA = -3.162;
// Forro de la boca: la góndola por dentro, 1,2 cm más pequeña, hasta el
// fondo, a 19 cm del borde.
const FORRO = 0.012;
const BOCA: Seccion[] = [
  sec([-2.97, 0.285, 0.471, -0.145, 0.16], 3, 2.75),
  sec([-3.05, 0.282, 0.468, -0.115, 0.17], 3.2, 2.7),
  sec([CARA + 0.001, 0.272, 0.46, -0.045, 0.2], 3.6, 2.7),
].map((q) => ({ ...q, ancho: q.ancho - FORRO, arriba: q.arriba - FORRO, abajo: q.abajo + FORRO }));
// La pared de la cara de atrás, con la boca: una «D» tumbada, con el borde
// de arriba recto y ancho, casi en el lomo, los lados rectos y el fondo
// redondo; debajo, la pared gruesa (primer plano del rodaje, enderezado).
// El contorno de fuera es la última sección de la góndola.
const supe = (t: number, n: number) => Math.sign(t) * Math.abs(t) ** (2 / n);
const contornoCara: [number, number][] = Array.from({ length: 49 }, (_, i): [number, number] => {
  const a = (i / 48) * 2 * Math.PI, cx = Math.cos(a), sy = Math.sin(a);
  return [0.271 * supe(cx, sy >= 0 ? 3.6 : 2.7), 0.2 + (sy >= 0 ? 0.259 : 0.239) * supe(sy, sy >= 0 ? 3.6 : 2.7)];
});
// La boca, de lo alto en el centro hacia la derecha (x > 0) y vuelta por
// abajo: esquina de arriba, lado y fondo redondo.
const esquinaBoca = Array.from({ length: 8 }, (_, i): [number, number] => {
  const a = Math.PI / 2 - (i / 7) * (Math.PI / 2);
  return [0.2 + 0.045 * Math.cos(a), 0.385 + 0.045 * Math.sin(a)];
});
const fondoBoca = Array.from({ length: 17 }, (_, i): [number, number] => {
  const a = -(i / 16) * Math.PI;
  return [0.245 * supe(Math.cos(a), 2.3), 0.255 + 0.225 * supe(Math.sin(a), 2.3)];
});
const reflejo = (q: [number, number][]) => q.map(([x, y]): [number, number] => [-x, y]).reverse();
const contornoBoca: [number, number][] = [[0.0005, 0.43], ...esquinaBoca, ...fondoBoca, ...reflejo(esquinaBoca), [-0.0005, 0.43]];
// La pared: un aro, el contorno de fuera de lo alto hacia la izquierda y
// vuelta, y por dentro la boca, unidos por un corte fino en lo alto.
const paredCara: [number, number][] = [[-0.0005, 0.459], ...contornoCara.slice(13, 48), ...contornoCara.slice(0, 12), [0.0005, 0.459], ...contornoBoca];

// Los dos soportes del motor, a los lados del eje: discos de goma negra con
// sus tornillos y la tuerca del centro.
const SOPORTES = [0.19, -0.19].map((x): P3 => [x, 0.33, -3.06]);
// Ruedas: cubierta de goma, llanta negra hundida, buje de metal y cinco
// tornillos por cara. Torno a lo largo de z, tumbado para que el eje vaya en x.
const rueda = (id: string, [x, y, z]: P3): Pieza[] => {
  const tumbar = { centro: [x, y, z] as P3, eje: "y" as const, grados: 90 };
  const torno = (q: [number, number][]) => q.map(([dz, r]): [number, number] => [z + dz, r]);
  return [
    { tipo: "tubo", id, acabado: "negro-ua", centro: [x, y], girar: tumbar,
      perfil: torno([[-0.04, 0.076], [-0.04, 0.096], [-0.035, 0.114], [-0.022, 0.124], [0, RUEDA.r], [0.022, 0.124], [0.035, 0.114], [0.04, 0.096], [0.04, 0.076]]) },
    { tipo: "tubo", id: `${id}-llanta`, acabado: "negro", centro: [x, y], girar: tumbar,
      perfil: torno([[-0.03, 0], [-0.03, 0.068], [-0.034, 0.08], [0.034, 0.08], [0.03, 0.068], [0.03, 0]]) },
    { tipo: "tubo", id: `${id}-buje`, acabado: "metal", centro: [x, y], girar: tumbar,
      perfil: torno([[-0.046, 0], [-0.046, 0.016], [-0.04, 0.026], [0.04, 0.026], [0.046, 0.016], [0.046, 0]]) },
    ...[1, -1].flatMap((s) => Array.from({ length: 5 }, (_, i): Pieza => {
      const a = (i / 5) * 2 * Math.PI;
      return { tipo: "disco", id: `${id}-tornillo-${s}-${i}`, acabado: "metal", en: [x + s * 0.031, y + 0.046 * Math.sin(a), z + 0.046 * Math.cos(a)], normal: [s, 0, 0], radio: 0.007, grosor: 0.004 };
    })),
  ];
};

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "radomo", acabado: "negro-ua", secciones: RADOMO },
  {
    // Delante de la cola, una toma de aire sumergida en el lomo, partida en dos
    // por un tabique (foto del montaje): la rampa baja hacia atrás hasta la boca.
    tipo: "casco", id: "fuselaje", acabado: "gris-si", secciones: FUSELAJE,
    tomas: [TOMA], abierto: "atras",
  },
  // Fondo de cada boca: la entrada del conducto, negra, contra la pared.
  { tipo: "caja", id: "toma-fondo", acabado: "hueco", centro: [0, TOMA.y - 0.55 * TOMA.hondo, TOMA.boca + 0.004], tam: [1.8 * TOMA.ancho, 0.8 * TOMA.hondo, 0.004], redondeo: 0.01 },
  // El tabique que parte la boca en dos, del fondo a la ceja, bajando hacia
  // delante con la rampa.
  { tipo: "placa", id: "toma-tabique", acabado: "gris-si", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.003, planta: [[TOMA.boca - 0.005, TOMA.y - TOMA.hondo - 0.01], [TOMA.boca - 0.005, TOMA.y + 0.004], [TOMA.boca + 0.06, TOMA.y], [TOMA.boca + 0.17, TOMA.y - 0.035], [TOMA.boca + 0.17, TOMA.y - 0.05]] },
  // La ceja encima de la boca: una chapa fina que sigue lo alto de la
  // góndola y sobresale 3 cm hacia delante.
  { tipo: "viga", id: "toma-ceja", acabado: "gris-si", ruta: Array.from({ length: 13 }, (_, i): [number, number, number, number, number] => {
    const x = -0.18 + (0.36 * i) / 12;
    return [x, lomoToma(x) + 0.005, TOMA.boca + 0.012, 0.06, 0.012];
  }) },
  // Cámara del morro, en lo alto del radomo: una caja negra con una lente
  // redonda con aro de latón y otra cuadrada, oscura, y debajo la ceja de
  // metal (vídeo del pintado y foto del montaje).
  { tipo: "caja", id: "camara-morro", acabado: "negro", centro: [0, 0.272, 3.46], tam: [0.12, 0.06, 0.13], redondeo: 0.02 },
  { tipo: "disco", id: "camara-morro-aro", acabado: "laton", en: [0.027, 0.272, 3.527], normal: [0, 0, 1], radio: 0.02, grosor: 0.006 },
  { tipo: "disco", id: "camara-morro-ventana-0", acabado: "lente", en: [0.027, 0.272, 3.531], normal: [0, 0, 1], radio: 0.013, grosor: 0.004 },
  { tipo: "caja", id: "camara-morro-ventana-1", acabado: "hueco", centro: [-0.027, 0.272, 3.527], tam: [0.032, 0.032, 0.006] },
  { tipo: "caja", id: "camara-morro-ceja", acabado: "aluminio", centro: [0, 0.236, 3.54], tam: [0.13, 0.012, 0.05], redondeo: 0.006 },
  // Dentro de la boca, el motor: los dos soportes, el eje hasta el plato, un
  // muelle y un cárter abajo, con cables (primeros planos del rodaje).
  { tipo: "casco", id: "boca-motor", acabado: "hueco", abierto: "atras", secciones: BOCA },
  { tipo: "prisma", id: "cara-motor", acabado: "gris-si", eje: "z", y: CARA - 0.002, alto: 0.03, planta: paredCara },
  ...SOPORTES.flatMap(([x, y, z], i): Pieza[] => [
    { tipo: "disco", id: `soporte-${i}`, acabado: "junta", en: [x, y, z], normal: [0, 0, -1], radio: 0.05, grosor: 0.03 },
    { tipo: "disco", id: `soporte-tuerca-${i}`, acabado: "aluminio", en: [x, y, z - 0.02], normal: [0, 0, -1], radio: 0.013, grosor: 0.012 },
    ...Array.from({ length: 4 }, (_, k): Pieza => {
      const a = ((k + 0.5) / 4) * 2 * Math.PI;
      return { tipo: "disco", id: `soporte-tornillo-${i}-${k}`, acabado: "aluminio", en: [x + 0.034 * Math.cos(a), y + 0.034 * Math.sin(a), z - 0.017], normal: [0, 0, -1], radio: 0.006, grosor: 0.006 };
    }),
  ]),
  { tipo: "varilla", id: "eje-motor", acabado: "metal", desde: [0, HELICE.en[1], -2.98], hasta: [0, HELICE.en[1], CARA - 0.02], radio: 0.03, lados: 20 },
  { tipo: "caja", id: "carter", acabado: "negro", centro: [0.02, 0.15, -3.02], tam: [0.3, 0.12, 0.08], redondeo: 0.02 },
  { tipo: "varilla", id: "muelle", acabado: "metal", desde: [-0.19, 0.22, -3.0], hasta: [-0.07, 0.24, -3.04], radio: 0.018 },
  { tipo: "varilla", id: "cable-motor", acabado: "negro", desde: [-0.2, 0.08, -3.0], hasta: [0.17, 0.18, -3.08], radio: 0.01 },
  { tipo: "caja", id: "etiqueta-motor", acabado: "blanco", centro: [0.16, 0.25, -3.04], tam: [0.06, 0.02, 0.002] },
  // Plato blanco y buje de metal con seis tornillos y la tuerca del centro.
  { tipo: "disco", id: "plato", acabado: "blanco", en: [0, HELICE.en[1], CARA - 0.03], normal: [0, 0, -1], radio: 0.115, grosor: 0.025 },
  { tipo: "tubo", id: "buje", acabado: "aluminio", centro: [0, HELICE.en[1]], perfil: [[CARA - 0.04, 0.068], [-3.25, 0.066], [-3.265, 0.05], [-3.272, 0.02], [-3.274, 0]] },
  ...Array.from({ length: 6 }, (_, i): Pieza => {
    const a = (i / 6) * 2 * Math.PI;
    return { tipo: "disco", id: `buje-tornillo-${i}`, acabado: "aluminio", en: [0.04 * Math.cos(a), HELICE.en[1] + 0.04 * Math.sin(a), -3.266], normal: [0, 0, -1], radio: 0.008, grosor: 0.006 };
  }),
  // Casquillos de metal en la raíz de cada pala.
  ...Array.from({ length: 3 }, (_, i): Pieza => {
    const a = ((HELICE.giro + i * 120) * Math.PI) / 180;
    return { tipo: "varilla", id: `casquillo-${i}`, acabado: "metal", desde: [0.05 * Math.cos(a), HELICE.en[1] + 0.05 * Math.sin(a), HELICE.en[2]], hasta: [0.135 * Math.cos(a), HELICE.en[1] + 0.135 * Math.sin(a), HELICE.en[2]], radio: 0.026 };
  }),
  // Hélice propulsora de tres palas blancas, de 1,5 m, con dos franjas negras
  // cerca de la punta (vista de detrás). Las franjas, algo más gruesas que la
  // pala para que asomen por las dos caras.
  { ...HELICE, id: "helice", acabado: "blanco", ancho: PALA.ancho, forma: PALA.forma, tramo: [0.17, 1] },
  ...[[0.84, 0.87], [0.9, 0.93]].map(([a, b], i): Pieza => ({ ...HELICE, id: `helice-franjas-${i}`, acabado: "negro", ancho: PALA.ancho * 1.25, forma: PALA.forma.map(([t, f, g]): [number, number, number] => [t, f / 1.25, g / 1.25]), tramo: [a, b] })),
  {
    // Media ala (x ≥ 0): donde van los flaps y los alerones, el borde de
    // salida se adelanta hasta la bisagra.
    tipo: "ala", id: "ala", acabado: "gris-si", y: ALA.y,
    estaciones: [
      estAla(0), estAla(MANDO.flap[0]), estAla(MANDO.flap[0], bisagra(MANDO.flap[0])),
      estAla(MANDO.aleron[1], bisagra(MANDO.aleron[1])), estAla(MANDO.aleron[1]), estAla(ALA.punta),
    ],
  },
  { tipo: "ala", id: "flaps", acabado: "gris-si", y: ALA.y, estaciones: [estMando(MANDO.flap[0]), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris-si", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1])] },
  // Luces de posición: una cápsula transparente en el borde de ataque de cada
  // punta (vídeo del pintado).
  ...LADOS.map((l): Pieza => ({
    tipo: "tubo", id: `luz-punta-${l}`, acabado: "aluminio", centro: [l * (PUNTA.x - 0.01), PUNTA.y],
    perfil: [[ALA.baPunta + 0.07, 0], [ALA.baPunta + 0.05, 0.018], [ALA.baPunta, 0.024], [ALA.baPunta - 0.12, 0.02], [ALA.baPunta - 0.16, 0]],
  })),
  {
    tipo: "ala", id: "cola", acabado: "gris-si", y: COLA.y,
    estaciones: [estCola(0), estCola(TIMON.desde), estCola(TIMON.desde, true), estCola(0.42, true), estCola(0.906, true), estCola(1.65, true), estCola(COLA.esquina, true), estCola(2.1, true), estCola(TIMON.hasta, true), estCola(TIMON.hasta), estCola(2.21), estCola(2.245), estCola(COLA.largo)],
  },
  { tipo: "ala", id: "timones", acabado: "gris-si", y: COLA.y, estaciones: [estTimon(TIMON.desde + 0.02), estTimon(0.42), estTimon(0.906), estTimon(1.65), estTimon(COLA.esquina), estTimon(2.1), estTimon(TIMON.hasta - 0.02)] },
  // Aleta bajo la cola, negra: el borde de delante recto, el de atrás
  // cerrándose hacia abajo y las esquinas de abajo redondas (perfil medido).
  {
    tipo: "ala", id: "aleta-ventral", acabado: "negro-ua", vertical: true, y: -0.18,
    estaciones: [[0, -1.38, -1.63, 0.05], [0.425, -1.38, -1.566, 0.04], [0.443, -1.386, -1.561, 0.034], [0.455, -1.4, -1.553, 0.024]],
  },
  // Varilla bajo la góndola, delante de la hélice (perfil del rodaje).
  { tipo: "varilla", id: "varilla-cola", acabado: "negro", desde: [0, -0.15, -2.72], hasta: [0, -0.46, -2.74], radio: 0.012 },
  { tipo: "varilla", id: "torreta-cuello", acabado: "naranja-si", desde: [0, TORRETA.arriba, TORRETA.z], hasta: [0, TORRETA.cuello, TORRETA.z], radio: TORRETA.r, lados: 32 },
  { tipo: "tubo", id: "torreta", acabado: "naranja-si", centro: [0, TORRETA.cuello], perfil: esfera(TORRETA.z, TORRETA.r) },
  // Su montaje bajo la panza, la junta entre el bote y la bola que gira, y
  // la ventanita oscura del costado, abajo (perfil del rodaje).
  ...([["torreta-montaje", "junta", TORRETA.arriba - 0.012, 0.012, 0.207], ["torreta-junta", "negro", TORRETA.cuello, 0.005, 0.203]] as const).map(([id, acabado, y, medio, r]): Pieza => ({
    tipo: "tubo", id, acabado, centro: [0, y], girar: { centro: [0, y, TORRETA.z], eje: "x", grados: 90 },
    perfil: [[TORRETA.z - medio, r], [TORRETA.z + medio, r]],
  })),
  ...(() => {
    const d: P3 = [0.82, -0.5, -0.28], n = Math.hypot(...d), u3n = d.map((v) => v / n) as P3;
    const en = (r: number): P3 => [u3n[0] * r, TORRETA.cuello + u3n[1] * r, TORRETA.z + u3n[2] * r];
    return [
      { tipo: "disco", id: "torreta-marco", acabado: "negro", en: en(TORRETA.r - 0.004), normal: u3n, radio: 0.045, grosor: 0.01 },
      { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: en(TORRETA.r + 0.002), normal: u3n, radio: 0.032, grosor: 0.006 },
    ] as Pieza[];
  })(),
  // Antenas: una pala negra sobre el ala, dos en el lomo detrás de ella y otra
  // bajo la panza; dos cúpulas de GPS detrás del radomo y la luz roja
  // anticolisión (perfil del rodaje y foto del montaje).
  { tipo: "placa", id: "antena-ala", acabado: "negro", plano: "vertical", x: 0, grosor: 0.014, bisel: 0.004, planta: [[0.17, 0.21], [0.05, 0.21], [0.08, 0.33], [0.13, 0.33]] },
  { tipo: "placa", id: "antena-lomo", acabado: "gris-si", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.004, planta: [[-0.87, 0.18], [-0.97, 0.18], [-0.99, 0.27], [-0.95, 0.27]] },
  { tipo: "placa", id: "antena-lomo-2", acabado: "negro", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.004, planta: [[-1.32, 0.2], [-1.4, 0.2], [-1.42, 0.28], [-1.38, 0.28]] },
  { tipo: "placa", id: "antena-panza", acabado: "negro", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.004, planta: [[1.53, -0.23], [1.43, -0.23], [1.41, -0.31], [1.45, -0.31]] },
  ...[1.88, 1.52].map((z, i): Pieza => ({ tipo: "disco", id: `gps-${i}`, acabado: "gris-si", en: [0, i ? 0.232 : 0.312, z], normal: [0, 1, 0], radio: 0.05, grosor: 0.018 })),
  { tipo: "disco", id: "baliza-base", acabado: "gris-si", en: [0, 0.188, -1.12], normal: [0, 1, 0], radio: 0.035, grosor: 0.01 },
  { tipo: "tubo", id: "baliza", acabado: "rojo", centro: [0, 0.19], seccion: [1, 0.7], perfil: esfera(-1.12, 0.026) },
  // Tren triciclo fijo (perfil, vistas de detrás y vídeo del pintado). La pata
  // del morro, con su amortiguador brillante, la horquilla y el tirante hacia
  // atrás; las principales, una pata recta hacia fuera con el amortiguador al
  // lado y un brazo corto que lleva la rueda hacia atrás.
  // La del morro: la pata gris con el collar de la dirección, el vástago
  // brillante con la tijera delante, la horquilla y el eje (foto del montaje).
  { tipo: "varilla", id: "pata-morro", acabado: "gris-si", desde: MORRO_TREN.arriba, hasta: [0, -0.6, 2.07], radio: 0.034, lados: 20 },
  { tipo: "varilla", id: "collar-morro", acabado: "junta", desde: [0, -0.3, 2.055], hasta: [0, -0.335, 2.057], radio: 0.043, lados: 20 },
  { tipo: "varilla", id: "vastago-morro", acabado: "metal", desde: [0, -0.6, 2.07], hasta: [0, -0.78, 2.08], radio: 0.021, lados: 20 },
  { tipo: "varilla", id: "tijera-arriba", acabado: "gris-si", desde: [0, -0.575, 2.104], hasta: [0, -0.675, 2.15], radio: 0.009 },
  { tipo: "varilla", id: "tijera-abajo", acabado: "gris-si", desde: [0, -0.675, 2.15], hasta: [0, -0.77, 2.11], radio: 0.009 },
  { tipo: "caja", id: "horquilla-puente", acabado: "gris-si", centro: [0, -0.79, 2.085], tam: [0.15, 0.035, 0.06], redondeo: 0.012 },
  { tipo: "caja", id: "horquilla", acabado: "gris-si", espejo: true, centro: [0.062, (-0.79 + MORRO_TREN.eje[1]) / 2, 2.088], tam: [0.014, -0.79 - MORRO_TREN.eje[1] + 0.03, 0.045] },
  { tipo: "varilla", id: "eje-morro", acabado: "metal", desde: [-0.075, MORRO_TREN.eje[1], MORRO_TREN.eje[2]], hasta: [0.075, MORRO_TREN.eje[1], MORRO_TREN.eje[2]], radio: 0.012 },
  { tipo: "varilla", id: "tirante-morro", acabado: "gris-si", desde: [0, -0.235, 1.78], hasta: [0, -0.5, 2.065], radio: 0.016 },
  ...rueda("rueda-morro", MORRO_TREN.eje),
  // Las principales: una pata plana que se afina, con su anclaje en la panza,
  // el amortiguador al lado, una rodilla y el brazo corto hacia atrás; la
  // rueda, por fuera, con el disco del freno (foto del montaje y perfil).
  { tipo: "viga", id: "patas", acabado: "gris-si", espejo: true, ruta: [[PRINCIPAL.arriba[0], PRINCIPAL.arriba[1], PRINCIPAL.arriba[2], 0.11, 0.06], [PRINCIPAL.rodilla[0], PRINCIPAL.rodilla[1], PRINCIPAL.rodilla[2], 0.065, 0.05]] },
  { tipo: "caja", id: "anclajes", acabado: "gris-si", espejo: true, centro: [0.15, -0.245, -0.4], tam: [0.12, 0.04, 0.17], redondeo: 0.02 },
  { tipo: "varilla", id: "amortiguadores", acabado: "metal", espejo: true, desde: [0.21, -0.235, -0.3], hasta: [0.6, -0.7, -0.37], radio: 0.018 },
  { tipo: "varilla", id: "amortiguadores-funda", acabado: "gris-si", espejo: true, desde: [0.21, -0.235, -0.3], hasta: [0.4, -0.46, -0.335], radio: 0.026 },
  { tipo: "caja", id: "rodillas", acabado: "junta", espejo: true, centro: PRINCIPAL.rodilla, tam: [0.07, 0.07, 0.08], redondeo: 0.015 },
  { tipo: "varilla", id: "brazos", acabado: "gris-si", espejo: true, desde: PRINCIPAL.rodilla, hasta: PRINCIPAL.eje, radio: 0.026 },
  { tipo: "varilla", id: "ejes", acabado: "metal", espejo: true, desde: PRINCIPAL.eje, hasta: [PRINCIPAL.rueda[0] + 0.03, PRINCIPAL.eje[1], PRINCIPAL.eje[2]], radio: 0.018 },
  { tipo: "disco", id: "frenos", acabado: "metal", espejo: true, en: [PRINCIPAL.rueda[0] - 0.05, PRINCIPAL.rueda[1], PRINCIPAL.rueda[2]], normal: [1, 0, 0], radio: 0.065, grosor: 0.006 },
  ...LADOS.flatMap((l) => rueda(`rueda-${l}`, [l * PRINCIPAL.rueda[0], PRINCIPAL.rueda[1], PRINCIPAL.rueda[2]])),
  // El tapón de la T de la tapa de registro, detrás del radomo (foto del
  // montaje y del pintado).
  { tipo: "disco", id: "tapa-pomo", acabado: "aluminio", espejo: true, en: [0.352, 0.165, 2.56], normal: [1, 0, 0], radio: 0.022, grosor: 0.01 },
  { tipo: "varilla", id: "tapa-tirador", acabado: "aluminio", espejo: true, desde: [0.362, 0.165, 2.56], hasta: [0.356, 0.165, 2.43], radio: 0.008 },
];

// ── Detalle pintado del HD (el SIRTAP001 en el rodaje de Getafe AB) ────────
const LADO: P3 = [1, 0, 0];
const ARRIBA: P3 = [0, 1, 0];
const NEGRO_RADOMO = "#1c1d1d";
const AZUL_AIRBUS = "#1c2a46";
const ROJO = "#a3212b";
const CALCAS: Calca[] = [
  // Lo negro del radomo sigue por el costado, por encima de la tapa de
  // registro (y > 0,17), hasta z = 2,34, y sube con la esquina redonda hasta
  // lo alto en z = 2,28 (perfil del rodaje medido). Una por costado, sin
  // espejo: reflejada, la curva saldría al revés. Mate, como el radomo.
  ...LADOS.map((l): Calca => {
    const Z0 = 2.94, Z1 = 2.22, Y0 = 0.15, Y1 = 0.48;
    const borde: [number, number][] = [[Z0, Y1], [2.276, Y1], [2.278, 0.36], [2.283, 0.3], [2.29, 0.26], [2.3, 0.228], [2.312, 0.202], [2.325, 0.185], [2.34, 0.174], [2.36, 0.17], [Z0, 0.17]];
    const puntos = borde.map(([z, y]): [number, number] => { const u = (Z0 - z) / (Z0 - Z1); return [l > 0 ? u : 1 - u, (y - Y0) / (Y1 - Y0)]; });
    return { sobre: ["fuselaje"], en: [l * 0.3, (Y0 + Y1) / 2, (Z0 + Z1) / 2], desde: [l, 0, 0], tam: [Z0 - Z1, Y1 - Y0], mate: true, dibujo: { tipo: "poligono", color: NEGRO_RADOMO, puntos } };
  }),
  {
    // Desde arriba algo inclinada hacia atrás: así el dibujo va con u hacia −x
    // y v hacia el morro; el borde, en z = 2,28 en el centro.
    sobre: ["fuselaje"], en: [0, 0.42, 2.62], desde: [0, 1, -0.3], tam: [0.76, 0.68], mate: true,
    dibujo: { tipo: "poligono", color: NEGRO_RADOMO, puntos: [[0, 1], [0, 0.03], [0.2, 0.012], [0.5, 0], [0.8, 0.012], [1, 0.03], [1, 1]] },
  },
  // «AIRBUS» delante del ala, con el logotipo de la casa (a su proporción),
  // y «SIRTAP001» detrás, en DIN gruesa, en los dos costados. Tamaños y
  // sitio, medidos en el perfil del rodaje.
  { sobre: ["fuselaje"], en: [0.3, -0.04, 0.84], desde: LADO, tam: [0.72, 0.133], espejo: true, dibujo: { tipo: "airbus", color: AZUL_AIRBUS } },
  { sobre: ["fuselaje"], en: [0.3, -0.04, -1.75], desde: LADO, tam: [1.01, 0.23], espejo: true, dibujo: { tipo: "texto", texto: "SIRTAP001", color: AZUL_AIRBUS, letra: "din", espaciado: 0.08, llenar: true, grueso: 0.025 } },
  // «III» bajo la cola: tres barras finas, algo inclinadas hacia atrás.
  ...[0, 0.36, 0.72].map((u0): Calca => ({ sobre: ["fuselaje"], en: [0.29, 0.19, -2.48], desde: LADO, tam: [0.11, 0.11], espejo: true, dibujo: { tipo: "poligono", color: AZUL_AIRBUS, puntos: [[u0, 0], [u0 + 0.16, 0], [u0 + 0.28, 1], [u0 + 0.12, 1]] } })),
  // El triángulo blanco que apunta al morro, en el costado izquierdo.
  { sobre: ["fuselaje"], en: [0.3, 0.0, -0.9], desde: LADO, tam: [0.22, 0.13], dibujo: { tipo: "poligono", color: "#eef0f0", puntos: [[0, 0.5], [1, 1], [1, 0]] } },
  { sobre: ["fuselaje"], en: [0.35, -0.13, 2.22], desde: LADO, tam: [0.12, 0.04], espejo: true, dibujo: { tipo: "rect", color: ROJO } },
  // Franja roja fina de la carena del motor, en z = −3,045, recta en el
  // perfil: da la vuelta entera a la góndola (perfil medido y vistas de
  // detrás). Por trozos: costado, hombro, lomo, canto y panza; cada uno,
  // una raya en medio de una calca más ancha para que siga la curva.
  ...([[[0.28, 0.12, -3.045], LADO, 0.52, true], [[0.2, 0.4, -3.045], [1, 1, 0], 0.3, true], [[0, 0.47, -3.045], ARRIBA, 0.34, false], [[0.22, -0.06, -3.045], [1, -1, 0], 0.3, true], [[0, -0.1, -3.045], [0, -1, 0], 0.42, false]] as [P3, P3, number, boolean][]).map(([en, desde, largo, espejo]): Calca => {
    const a = 0.028 / 0.14, raya: [number, number][] = desde[0] ? [[0.5 - a / 2, 0], [0.5 + a / 2, 0], [0.5 + a / 2, 1], [0.5 - a / 2, 1]] : [[0, 0.5 - a / 2], [1, 0.5 - a / 2], [1, 0.5 + a / 2], [0, 0.5 + a / 2]];
    return { sobre: ["fuselaje"], en, desde, tam: desde[0] ? [0.14, largo] : [largo, 0.14], espejo, dibujo: { tipo: "poligono", color: ROJO, puntos: raya } };
  }),
  // Rejilla de cuatro lamas claras abajo, en el costado izquierdo de la
  // góndola, entre la franja y la cara de atrás (vista de detrás).
  ...[0, 1, 2, 3].map((i): Calca => ({ sobre: ["fuselaje"], en: [0.19, -0.095 - i * 0.016, -3.1], desde: [1, -1, 0], tam: [0.11, 0.008], dibujo: { tipo: "rect", color: "#d5d9da" } })),
  // «DO NOT PAINT» junto a la cámara del morro.
  { sobre: ["radomo"], en: [0, 0.3, 3.31], desde: ARRIBA, tam: [0.08, 0.045], dibujo: { tipo: "texto", texto: "DO NOT\nPAINT", color: "#e8e8e4" } },
];

const COSTURAS: Costura[] = [
  // Borde de abajo del panel de encima, que sigue desde lo negro hacia atrás
  // por el costado (vídeo del pintado).
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.36, 0.2, 2.26], [0.34, 0.17, 1.8], [0.31, 0.12, 1.3]] },
  // Junta del tramo de fuera del ala.
  { sobre: ["ala"], desde: ARRIBA, espejo: true, puntos: [[JUNTA_ALA, 0.4, bordeAtaque(JUNTA_ALA) + 0.02], [JUNTA_ALA, 0.4, bisagra(JUNTA_ALA)]] },
  // Junta de la carena del motor y, delante de la franja roja, su fila de
  // remaches claros.
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.3, 0.46, -2.62], [0.3, -0.18, -2.62]] },
  { sobre: ["fuselaje"], desde: LADO, espejo: true, claro: true, remaches: 0.035, puntos: [[0.27, 0.37, -3.015], [0.29, 0.17, -3.015], [0.29, 0.0, -3.015]] },
];

const PARTES: Parte[] = [
  {
    nombre: "Radomo y cámara del morro",
    en: [0, 0.48, 3.2],
    piezas: ["radomo", "camara-morro", "camara-morro-aro", "camara-morro-ventana-0", "camara-morro-ventana-1", "camara-morro-ceja"],
    respaldo: "foto",
    fuentes: ["perfil", "morro", "montaje", "red"],
    texto: "La cabeza negra es el radomo, la tapa que deja pasar las ondas de un radar SAR con modo GMTI: ve el terreno y los vehículos de noche o entre nubes. Encima lleva una cámara pequeña que mira hacia delante.",
    nota: "Que dentro va el radar lo cuentan Airbus y Defensa; el modelo no se ha publicado.",
  },
  {
    nombre: "Torreta EO/IR",
    en: [0, -0.68, 2.52],
    piezas: ["torreta", "torreta-cuello", "torreta-montaje", "torreta-junta", "torreta-marco", "torreta-ventana"],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "morro", "airbus"],
    texto: "Bajo la barbilla, una bola que gira con cámaras de día y térmica y un designador láser. Es la misma que lleva el avión de patrulla C295 MSA, así que sus operadores casi no tienen que aprender nada nuevo.",
    nota: "En todas las fotos del prototipo es un bote naranja, quizá de pruebas; qué lleva la definitiva, de Airbus.",
  },
  {
    nombre: "Ala alta y recta",
    en: [3.6, 0.3, 0.0],
    piezas: ["ala", "flaps", "alerones", "luz-punta-1", "luz-punta--1"],
    respaldo: "foto",
    fuentes: ["detras", "frente", "montaje", "red"],
    texto: "11 m de punta a punta, una vez y media el largo del avión, y estrechándose hacia la punta: un ala de planeador para aguantar más de 20 horas en el aire. Se desmonta, igual que la hélice, para que quepan dos SIRTAP en un C295.",
    nota: "La envergadura es la del Ministerio de Defensa; las fotos encajadas dan de 10,8 a 11,2 m.",
  },
  {
    nombre: "Cola en V",
    en: [1.75, 1.25, -2.42],
    piezas: ["cola", "timones", "aleta-ventral"],
    respaldo: "foto",
    fuentes: ["detras", "perfil", "frente"],
    texto: "Dos superficies en V, anchas y bajas, de 4 m de punta a punta, que hacen a la vez de timón de profundidad y de dirección. Debajo, una aleta negra.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.62, -2.9],
    piezas: ["fuselaje", "toma-ceja", "toma-fondo", "toma-tabique", "helice", "helice-franjas-0", "helice-franjas-1", "plato", "buje", "boca-motor", "cara-motor", "soporte-0", "soporte-1", "eje-motor", "carter", "muelle"],
    respaldo: "foto",
    fuentes: ["detras", "montaje", "perfil"],
    texto: "Un solo motor en la cola, que respira por una toma en el lomo y empuja con una hélice de tres palas: así el morro queda libre para los sensores. Airbus no ha dicho qué motor lleva; Defensa ha encargado a ITP Aero el diseño de un turbohélice para él.",
    nota: "La toma y la hélice salen de las fotos; el motor no se ha publicado.",
  },
  {
    nombre: "Tren fijo",
    en: [0.95, SUELO - 0.08, -0.55],
    piezas: ["patas", "anclajes", "amortiguadores", "amortiguadores-funda", "rodillas", "brazos", "ejes", "frenos", ...["rueda-morro", "rueda-1", "rueda--1"].flatMap((r) => [r, `${r}-llanta`, `${r}-buje`]), "pata-morro", "collar-morro", "vastago-morro", "tijera-arriba", "tijera-abajo", "horquilla", "horquilla-puente", "eje-morro", "tirante-morro"],
    respaldo: "foto",
    fuentes: ["perfil", "tren", "detras"],
    texto: "Tres ruedas que no se recogen: la del morro y dos en patas que salen de la panza hacia fuera. Le basta una pista de tierra de 800 m, y rueda solo hasta la cabecera.",
  },
  {
    nombre: "Antenas y luces",
    en: [0, 0.5, -1.3],
    piezas: ["antena-ala", "antena-lomo", "antena-lomo-2", "antena-panza", "gps-0", "gps-1", "baliza", "baliza-base", "varilla-cola"],
    respaldo: "foto",
    fuentes: ["perfil", "montaje", "red"],
    texto: "Palas de radio en el lomo y bajo la panza, dos cúpulas de GPS detrás del radomo y una luz roja anticolisión. El enlace con la estación de tierra lo hace Sener; más allá del horizonte, va por satélite.",
    nota: "Qué es cada antena es supuesto: solo se ven por fuera.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "lomo", "hombro", "costado", "costadoArriba", "sobreArista", "bajoArista", "bordeArriba", "bordeAbajo", "nariz"] as const;
const aSeccion = (q: Seccion): Seccion => {
  const s = { ...q };
  for (const k of LARGOS_SECCION) if (s[k] !== undefined) s[k] = u(s[k]!);
  return s;
};
const aToma = (t: Toma): Toma => ({ ...t, boca: u(t.boca), largo: u(t.largo), punta: u(t.punta), x: u(t.x), y: u(t.y), ancho: u(t.ancho), hondo: u(t.hondo), ceja: u(t.ceja) });
const aGiro = (p: Pieza): Pieza => (p.girar ? { ...p, girar: { ...p.girar, centro: u3(p.girar.centro) } } : p);
const aUnidades = (q: Pieza): Pieza => {
  const p = aGiro(q);
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map(aSeccion), ...(p.x !== undefined && { x: u(p.x) }), ...(p.tomas && { tomas: p.tomas.map(aToma) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto), ...(p.chaflanArriba && { chaflanArriba: u2(p.chaflanArriba) }), ...(p.chaflanAbajo && { chaflanAbajo: u2(p.chaflanAbajo) }) };
    case "viga":
      return { ...p, ruta: p.ruta.map((q) => q.map(u) as typeof q) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "SIRTAP",
  subtitulo: "Dron de reconocimiento MALE",
  escala: ESCALA,  // 1 unidad = 4,5 m, como el TB2
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  // Su gris al sol cae en el centro de un escalón del pixel HD: sin desfase.
  contornoPixel: true,
  // Ala larga: la tarjeta de /uas, desde más arriba (como el TB2).
  vistaTarjeta: [61, 20],
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("ES"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "rodaje-perfil.jpg", titulo: "De perfil, en su primer rodaje por la pista de Getafe AB (junio de 2026)", medio: "Airbus Defence and Space (vídeo en X)", url: RODAJE },
    { id: "frente", imagen: "rodaje-frente.jpg", titulo: "De frente, antes del rodaje", medio: "Airbus Defence and Space (vídeo en X)", url: RODAJE },
    { id: "detras", imagen: "rodaje-detras.jpg", titulo: "Desde atrás: la cola en V y la hélice", medio: "Airbus Defence and Space (vídeo en X)", url: RODAJE },
    { id: "morro", imagen: "pintado-morro.jpg", titulo: "El morro, recién pintado (septiembre de 2025)", medio: "Airbus Defence and Space (vídeo en X)", url: PINTADO },
    { id: "tren", imagen: "pintado-tren.jpg", titulo: "El tren y la torreta, recién pintado", medio: "Airbus Defence and Space (vídeo en X)", url: PINTADO },
    { id: "montaje", imagen: "montaje.jpg", titulo: "El primer prototipo en montaje, sin pintar (junio de 2025)", medio: "Airbus Defence and Space", url: MONTAJE },
    { id: "airbus", titulo: "U850 SIRTAP", medio: "Airbus", url: AIRBUS },
    { id: "red", titulo: "Nuevos ojos electrónicos en vuelo (abril de 2024)", medio: "Revista Española de Defensa", url: RED },
  ],
};

export default maqueta;
