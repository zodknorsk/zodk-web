// Maqueta del RQ-11B Raven de AeroVironment con el morro de cámara giratoria
// (gimbal) y el enlace digital (DDL), el que vuela hoy el Ejército de Tierra,
// versión 2.0 (docs/uas-hd.md). La pintura y las marcas, las del Raven digital
// del Ejército de Tierra en la misión de la OTAN en Eslovaquia, en octubre de
// 2024 (fotos de El Español y de Defensa.com); la forma, de fotos de Raven del Ejército de EE. UU., de la Guardia
// Nacional, del Ejército italiano y de Raven checos (arte/uas-fuentes/
// rq-11-raven/, fuera de Git; enlaces en docs/uas.md).
// Medidas de la ficha del Ejército de Tierra (1,4 m de envergadura, 0,91 m de
// largo). El perfil, de la foto de perfil en vuelo de Spangdahlem (casi sin
// perspectiva), sacado columna a columna contra el cielo a 1149 px/m.
// Todo se escribe en metros, con z = 0 bajo la mitad del ala y y = 0 en el
// lomo de la barquilla, y al final se pasa a unidades de la maqueta (1 unidad
// = 0,5 m).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 0.5;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const FICHA_ET = "https://ejercito.defensa.gob.es/materiales/otros/MINI-UAV?__locale=es";
const INFODRON = "https://www.infodron.es/texto-diario/mostrar/3531733/ejercito-moderniza-flota-rpas-sistemas-039raven-039-digitales";
const ARMY = "https://www.army.mil/article/137604/rq_11b_raven_small_unmanned_aircraft_systems_suas";
const WIKIPEDIA = "https://en.wikipedia.org/wiki/AeroVironment_RQ-11_Raven";

// ── Módulo de la cámara ────────────────────────────────────────────────────
// Una capucha como un casco, abombada y redonda por delante (la planta, media
// circunferencia), más ancha abajo que arriba y abierta por debajo: ahí
// cuelga la bola del gimbal, que asoma por delante y por debajo. Detrás de
// la bola se ve la cara delantera plana de la barquilla, con un cerco claro
// (fotos de Iowa, del Ejército italiano y del Ejército de Tierra en 2017). El
// perfil, de la foto de Spangdahlem.
const MODULO = { detras: 0.199, delante: 0.331, ancho: 0.041 };
const CAPUCHA: Seccion[] = [
  [0.331, 0, -0.032, -0.052], [0.3295, 0.012, -0.022, -0.058], [0.325, 0.022, -0.0155, -0.0615], [0.317, 0.03, -0.012, -0.064],
  [0.305, 0.036, -0.0095, -0.066], [0.29, 0.04, -0.0085, -0.067], [0.26, MODULO.ancho, -0.007, -0.068], [0.203, MODULO.ancho, -0.005, -0.068],
].map(([z, ancho, arriba, abajo]) => ({ z, ancho, arriba, abajo, cintura: abajo + 0.008, n: 2.3, nAbajo: 8 }));
// La bola: en la foto de perfil, 8,8 cm de diámetro y la panza a −0,127.
const BOLA = { y: -0.083, z: 0.279, r: 0.044 };
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });

// ── Barquilla ──────────────────────────────────────────────────────────────
// Una sola pieza: los costados planos (la tapa de la batería en cada lado),
// el lomo plano con los bordes redondeados, la panza abombada (aterriza de
// barriga) y, detrás, el cuello que sube hasta el ala y lleva el motor,
// fundido con el lomo por un hombro cóncavo. Por detrás del cuello cae en
// vertical y se estrecha hasta el botalón (fotos de Iowa y desde abajo).
// [z, medio ancho, lo alto (con el cuello, su cima), panza, hombro, medio
// ancho del cuello]; la panza, de la foto de perfil.
const CUELLO = { delante: 0.077, detras: -0.078, alto: 0.052, ancho: 0.019 };
const BARQUILLA: Seccion[] = ([
  [0.199, 0.04, 0.0, -0.119], [0.19, 0.04, 0.001, -0.128], [0.175, 0.04, 0.002, -0.137], [0.155, 0.04, 0.003, -0.1405],
  [0.13, 0.04, 0.004, -0.139], [0.1, 0.04, 0.005, -0.1356],
  // La cara delantera del cuello sube casi vertical, con un empalme cóncavo
  // abajo (foto de Iowa).
  [0.092, 0.04, 0.005, -0.1333, 0.005, CUELLO.ancho], [0.085, 0.04, 0.0085, -0.132, 0.005, CUELLO.ancho],
  [0.081, 0.04, 0.017, -0.131, 0.005, CUELLO.ancho], [0.0785, 0.0399, 0.034, -0.1302, 0.005, CUELLO.ancho],
  [0.0755, 0.0399, CUELLO.alto, -0.1296, 0.005, CUELLO.ancho], [0.05, 0.039, CUELLO.alto, -0.124, 0.005, CUELLO.ancho],
  [0.02, 0.037, CUELLO.alto, -0.114, 0.005, CUELLO.ancho], [-0.01, 0.034, CUELLO.alto, -0.107, 0.004, CUELLO.ancho],
  [-0.04, 0.03, CUELLO.alto, -0.104, 0.003, CUELLO.ancho], [-0.066, 0.026, CUELLO.alto, -0.1025, 0.002, CUELLO.ancho],
  [-0.075, 0.024, 0.044, -0.102, 0.0, 0.02], [-0.081, 0.022, 0.0, -0.1018, -0.02, 0.012],
  [-0.087, 0.02, -0.06, -0.1016], [-0.1, 0.0165, -0.0686, -0.1008], [-0.115, 0.0138, -0.073, -0.1002], [-0.13, 0.0127, -0.0745, -0.0995],
] as number[][]).map(([z, ancho, arriba, abajo, hombro, lomo]) => {
  // La cintura (donde es más ancha), a media altura del cuerpo sin el
  // cuello; en la cola, en el eje del botalón.
  const cintura = z > -0.08 ? (Math.min(arriba, hombro ?? arriba) + abajo) / 2 : -0.087;
  return { z, ancho, arriba, abajo, cintura, n: 3.4, nAbajo: 3.1, ...(lomo !== undefined && { hombro, lomo, nLomo: 2.6 }) };
});

// ── Ala ────────────────────────────────────────────────────────────────────
// En tres piezas: el centro, recto y plano, sobre el cuello; las puntas, más
// estrechas hacia fuera y subidas unos 10° (foto de detrás). El centro, de
// 0,50 m: con la cámara de la foto del Raven español desde arriba encajada,
// el error medio baja de 13 px con 0,40 m (la 1.0) a 8 px; las fotos del ala
// sola y de Iowa dicen lo mismo. La cuerda, como en la 1.0 (17 cm); la
// punta (12 cm) se estrecha por los dos bordes: en la misma foto, con el
// borde de ataque recto y todo el estrechamiento detrás (la 1.0) el error
// era el doble que repartido.
const ALA = { y: 0.057, centro: 0.25, punta: 0.685, ba: 0.085, bs: -0.085, baPunta: 0.065, bsPunta: -0.055, diedro: 10 };
const SUBIDA = (ALA.punta - ALA.centro) * Math.tan((ALA.diedro * Math.PI) / 180);

// ── Motor ──────────────────────────────────────────────────────────────────
// En lo alto de la cara de atrás del cuello, bajo el borde de salida, con la
// hélice detrás (fotos de perfil en tierra y del Ejército italiano).
const MOTOR = { y: 0.045, r: 0.0165, desde: -0.05, hasta: -0.088 };

// ── Botalón y cola ─────────────────────────────────────────────────────────
// El botalón sube un poco hacia la cola y se parte en dos para ir en la
// mochila (la junta, a 0,19 m del centro del ala en la foto de perfil).
// Acaba en el borde de salida del timón (foto de perfil de Spangdahlem).
const BOTALON = { desde: [0, -0.087, -0.1] as [number, number, number], hasta: [0, -0.0689, -0.572] as [number, number, number], radio: 0.0125 };
const enBotalon = (z: number): number =>
  BOTALON.desde[1] + ((BOTALON.hasta[1] - BOTALON.desde[1]) * (z - BOTALON.desde[2])) / (BOTALON.hasta[2] - BOTALON.desde[2]);
const JUNTA = { delante: -0.177, detras: -0.191 };
// Deriva con el timón (la bisagra se ve en todas las fotos de perfil) y,
// detrás, el estabilizador horizontal, enganchado al final del botalón con
// un pasador amarillo (se suelta al aterrizar de golpe). Lo situaban debajo
// de la deriva la 1.0 y la primera versión del HD; las fotos lo ponen detrás:
// la del Raven en vuelo desde abajo (la deriva acaba y justo ahí empieza el
// estabilizador), la del Raven español desde arriba con la cámara encajada,
// la de Spangdahlem de perfil (el botalón acaba en el timón, con el
// pasador) y la italiana en el suelo. Borde de ataque recto y el
// estrechamiento en el de salida: 8,5 cm de cuerda en el centro y 6,5 en las
// puntas, 40 cm de punta a punta. (Con el morro de la cámara giratoria, de
// la punta del morro al estabilizador hay unos 0,99 m: los 0,91 de la ficha
// son del Raven de cámaras fijas, de morro más corto.)
const COLA = { raiz: -0.058, alto: 0.0997, bisagra: -0.524 };
const ESTAB = { y: -0.0715, semi: 0.2, ba: -0.574, raiz: 0.085, punta: 0.065 };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "capucha", acabado: "gris-et", secciones: CAPUCHA, polo: true },
  // El borde de la capucha, que vuela un poco hacia fuera (foto del gimbal de
  // cerca y la del Ejército de Tierra de 2017).
  {
    tipo: "casco", id: "capucha-borde", acabado: "gris-et", polo: true,
    secciones: CAPUCHA.map((q) => ({ ...q, ancho: q.ancho > 0 ? q.ancho + 0.0025 : 0, arriba: q.abajo + 0.007, abajo: q.abajo - 0.0005, cintura: q.abajo + 0.003, n: 2, nAbajo: 2 })),
  },
  {
    // El cerco claro de la cara delantera de la barquilla.
    tipo: "casco", id: "cerco", acabado: "hueso",
    secciones: [MODULO.detras, MODULO.detras + 0.005].map((z) => ({ z, ancho: MODULO.ancho + 0.0015, arriba: -0.002, abajo: -0.121, n: 3.4, nAbajo: 3 })),
  },
  {
    // El cuerpo del gimbal detrás de la bola, que baja hasta la panza.
    tipo: "caja", id: "modulo", acabado: "gris-et", redondeo: 0.01,
    centro: [0, -0.1, 0.221], tam: [0.046, 0.038, 0.036],
  },
  // El cojinete del giro, bajo la capucha, y la bola con su tapa a cada lado
  // (con seis tornillos, foto italiana), la ventana grande de la cámara, con
  // su aro, y la pequeña del infrarrojo.
  { tipo: "disco", id: "bola-giro", acabado: "junta", en: [0, -0.067, BOLA.z], normal: [0, 1, 0], radio: 0.036, grosor: 0.006 },
  { tipo: "tubo", id: "bola", acabado: "gris-et", centro: [0, BOLA.y], perfil: esfera(BOLA.z, BOLA.r) },
  { tipo: "disco", id: "bola-eje", acabado: "junta", espejo: true, en: [BOLA.r - 0.007, BOLA.y, BOLA.z], normal: [1, 0, 0], radio: 0.022, grosor: 0.004 },
  { tipo: "disco", id: "bola-aro", acabado: "negro", en: [0.007, BOLA.y - 0.017, BOLA.z + 0.0385], normal: [0, -0.4, 0.92], radio: 0.0145, grosor: 0.003 },
  { tipo: "disco", id: "bola-ventana", acabado: "lente", en: [0.007, BOLA.y - 0.0175, BOLA.z + 0.0395], normal: [0, -0.4, 0.92], radio: 0.0105, grosor: 0.003 },
  { tipo: "disco", id: "bola-ventana-ir", acabado: "lente", en: [-0.019, BOLA.y - 0.012, BOLA.z + 0.038], normal: [-0.35, -0.3, 0.89], radio: 0.0055, grosor: 0.003 },

  { tipo: "casco", id: "barquilla", acabado: "gris-et", secciones: BARQUILLA },

  {
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor, subida].
    tipo: "ala", id: "ala", acabado: "gris-et", y: ALA.y,
    estaciones: [
      [0, ALA.ba, ALA.bs, 0.02, 0],
      [ALA.centro, ALA.ba, ALA.bs, 0.019, 0],
    ],
  },
  {
    tipo: "ala", id: "ala-puntas", acabado: "gris-et", y: ALA.y,
    estaciones: [
      [ALA.centro, ALA.ba, ALA.bs, 0.019, 0],
      [ALA.punta, ALA.baPunta, ALA.bsPunta, 0.012, SUBIDA],
    ],
  },
  // La sonda en la cara delantera del cuello, bajo el ala: una base negra con
  // tuerca y una varilla de unos 3 cm hacia delante (fotos italiana de
  // perfil y de Iowa).
  {
    tipo: "tubo", id: "sonda", acabado: "negro", centro: [0, 0.027],
    perfil: [[0.074, 0], [0.074, 0.0055], [0.081, 0.0055], [0.083, 0.0035], [0.084, 0.0019], [0.108, 0.0016], [0.1085, 0]],
  },
  // El pestillo que sujeta el ala al cuello, en lo alto del centro.
  { tipo: "caja", id: "pestillo", acabado: "metal", centro: [0, ALA.y + 0.011, -0.025], tam: [0.012, 0.004, 0.026], redondeo: 0.002 },

  {
    tipo: "tubo", id: "motor", acabado: "gris-et", centro: [0, MOTOR.y],
    perfil: [[MOTOR.desde, 0], [MOTOR.desde, MOTOR.r], [-0.082, MOTOR.r], [-0.086, 0.014], [MOTOR.hasta, 0.011], [MOTOR.hasta, 0]],
  },
  { tipo: "disco", id: "motor-tapa", acabado: "junta", espejo: true, en: [MOTOR.r - 0.001, MOTOR.y, -0.069], normal: [1, 0, 0], radio: 0.011, grosor: 0.003 },
  {
    tipo: "tubo", id: "cono", acabado: "negro", centro: [0, MOTOR.y],
    perfil: [[-0.088, 0.0115], [-0.097, 0.0105], [-0.107, 0.0075], [-0.115, 0.002], [-0.116, 0]],
  },
  // Hélice de dos palas claras con el cono negro, parada en diagonal; de
  // 18 cm (foto de detrás, a escala con el centro del ala).
  { tipo: "helice", id: "helice", acabado: "blanco", en: [0, MOTOR.y, -0.093], radio: 0.09, palas: 2, giro: 60, ancho: 0.02 },

  { tipo: "varilla", id: "botalon", acabado: "gris-et", desde: BOTALON.desde, hasta: BOTALON.hasta, radio: BOTALON.radio },
  // La junta del botalón: un manguito apenas más grueso.
  { tipo: "varilla", id: "botalon-junta", acabado: "gris-et", desde: [0, enBotalon(JUNTA.delante), JUNTA.delante], hasta: [0, enBotalon(JUNTA.detras), JUNTA.detras], radio: BOTALON.radio + 0.0012 },
  {
    tipo: "placa", id: "deriva", acabado: "gris-et", plano: "vertical", x: 0, grosor: 0.006, bisel: 0.0025,
    planta: [[-0.4175, COLA.raiz], [COLA.bisagra, COLA.raiz], [COLA.bisagra, COLA.alto], [-0.4601, COLA.alto]],
  },
  {
    tipo: "placa", id: "timon", acabado: "gris-et", plano: "vertical", x: 0, grosor: 0.0055, bisel: 0.0022,
    planta: [[COLA.bisagra - 0.0015, COLA.raiz + 0.004], [-0.567, COLA.raiz + 0.004], [-0.561, COLA.alto], [COLA.bisagra - 0.0015, COLA.alto]],
  },
  // El mando del timón: un cuerno en la cara izquierda y su varilla hacia
  // delante, a media altura de la deriva (fotos de perfil).
  { tipo: "placa", id: "timon-cuerno", acabado: "negro", plano: "vertical", x: 0.0045, grosor: 0.0015, planta: [[-0.522, 0.022], [-0.534, 0.022], [-0.534, 0.034], [-0.527, 0.034]] },
  { tipo: "varilla", id: "timon-varilla", acabado: "negro", desde: [0.0055, 0.03, -0.531], hasta: [0.0055, 0.03, -0.47], radio: 0.0011 },
  {
    tipo: "placa", id: "estabilizador", acabado: "gris-et", plano: "horizontal", y: ESTAB.y, grosor: 0.006, bisel: 0.0025, simetrica: true,
    planta: [[0, ESTAB.ba], [ESTAB.semi, ESTAB.ba], [ESTAB.semi, ESTAB.ba - ESTAB.punta], [0, ESTAB.ba - ESTAB.raiz]],
  },
  // El herraje del final del botalón, que sujeta el estabilizador, y el
  // pasador amarillo que asoma por encima (fotos de Spangdahlem e italiana).
  { tipo: "caja", id: "estab-herraje", acabado: "negro", centro: [0, ESTAB.y - 0.001, ESTAB.ba - 0.006], tam: [0.022, 0.011, 0.022], redondeo: 0.003 },
  { tipo: "varilla", id: "estab-pasador", acabado: "amarillo", desde: [0, ESTAB.y, ESTAB.ba - 0.004], hasta: [0, enBotalon(-0.572) + BOTALON.radio + 0.009, ESTAB.ba - 0.004], radio: 0.0017 },
  // El tapón del final del botalón, en el borde de salida del timón.
  { tipo: "tubo", id: "botalon-fin", acabado: "negro", centro: [0, enBotalon(-0.572)], perfil: [[-0.569, BOTALON.radio + 0.0005], [-0.574, BOTALON.radio * 0.85], [-0.575, 0]] },
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Marcas del Raven digital del Ejército de Tierra en Eslovaquia, en octubre de
// 2024 (fotos de El Español y de Defensa.com, desde arriba): sin bandera ni números; en las
// juntas del ala, dos flechas rojas en la izquierda y dos verdes en la
// derecha, y parches de cinta americana plateada en el borde de ataque y en el de
// salida de cada junta; un parche grande en la punta izquierda, otro en el
// centro y una tira negra en el borde de ataque de la punta izquierda.
// Flechas rojas también en la junta del botalón y en la del estabilizador.
// En los costados, el disco «DDL», las etiquetas de la tapa de la batería,
// la rejilla de nervios y el aviso del láser (fotos del Ejército italiano,
// de Iowa y de la exposición de 2017 del Ejército de Tierra).
const ARRIBA: [number, number, number] = [0, 1, 0];
const LADO: [number, number, number] = [1, 0, 0];
const sobreAla = (x: number) => ALA.y + 0.02 + (Math.abs(x) > ALA.centro ? (Math.abs(x) - ALA.centro) * Math.tan((ALA.diedro * Math.PI) / 180) : 0);
const ALAS = ["ala", "ala-puntas"];
// Los parches son cinta americana plateada; las tiras del borde de ataque,
// cinta negra.
const cinta = (x: number, z: number, tam: [number, number], giro = 0, color?: string): Calca =>
  ({ sobre: ALAS, en: [x, sobreAla(x), z], desde: ARRIBA, tam, giro, dibujo: color ? { tipo: "rect", color } : { tipo: "cinta" } });
const CALCAS: Calca[] = [
  // Flechas de las juntas del ala (la izquierda de verdad es la x positiva:
  // la maqueta va en espejo), a un cuarto de la cuerda.
  // Cada calca va sobre una sola pieza: las flechas y la cinta de una junta,
  // en dos, una a cada lado.
  ...([[ALA.centro, "#c8202a"], [-ALA.centro, "#1f9a4a"]] as [number, string][]).flatMap(([x, color]): Calca[] => [1, -1].map((s) => ({
    sobre: [s > 0 ? "ala-puntas" : "ala"], en: [x + Math.sign(x) * s * 0.013, sobreAla(x), 0.04 - s * 0.007], desde: ARRIBA, tam: [0.024, 0.012], giro: Math.sign(x) * s > 0 ? 180 : 0,
    dibujo: { tipo: "flecha", color },
  }))),
  ...[ALA.centro, -ALA.centro].flatMap((x) => [0.072, -0.07].flatMap((z) => [1, -1].map((s) => ({ ...cinta(x + Math.sign(x) * s * 0.0075, z, [0.0145, 0.026]), sobre: [s > 0 ? "ala-puntas" : "ala"] })))),
  cinta(0.33, -0.015, [0.06, 0.042], 18),
  cinta(0.07, -0.045, [0.038, 0.032], 8),
  cinta(0.36, 0.079, [0.08, 0.012], 0, "#1d1f22"),
  cinta(0.66, 0.036, [0.05, 0.01], 0, "#1d1f22"),
  // Botalón y estabilizador.
  { sobre: ["botalon", "botalon-junta"], en: [0, 0, (JUNTA.delante + JUNTA.detras) / 2], desde: ARRIBA, tam: [0.045, 0.022], giro: 90, dibujo: { tipo: "flechas", color: "#c8202a" } },
  { sobre: ["estabilizador"], en: [0.022, 0, ESTAB.ba - 0.014], desde: ARRIBA, tam: [0.024, 0.014], giro: 90, dibujo: { tipo: "flechas", color: "#c8202a" } },
  // Costados: la rendija de cada lado del cuello (foto italiana de perfil).
  { sobre: ["barquilla"], en: [0.03, 0.03, 0.062], desde: LADO, tam: [0.0045, 0.02], dibujo: { tipo: "rect", color: "#1b1c1f" }, espejo: true },
  { sobre: ["barquilla"], en: [0.05, -0.043, -0.028], desde: LADO, tam: [0.017, 0.017], dibujo: { tipo: "ddl" }, espejo: true },
  { sobre: ["deriva"], en: [0.01, -0.014, -0.496], desde: LADO, tam: [0.02, 0.02], dibujo: { tipo: "ddl", color: "#b8262b" }, espejo: true },
  { sobre: ["barquilla"], en: [0.05, -0.034, 0.155], desde: LADO, tam: [0.045, 0.026], dibujo: { tipo: "etiqueta" }, espejo: true },
  { sobre: ["barquilla"], en: [0.05, -0.06, 0.135], desde: LADO, tam: [0.032, 0.016], dibujo: { tipo: "etiqueta" }, espejo: true },
  { sobre: ["barquilla"], en: [0.05, -0.072, 0.1], desde: LADO, tam: [0.024, 0.032], dibujo: { tipo: "rejilla" }, espejo: true },
  { sobre: ["capucha"], en: [0.05, -0.038, 0.262], desde: LADO, tam: [0.046, 0.022], dibujo: { tipo: "etiqueta", titulo: "CAUTION" }, espejo: true },
  // Los seis tornillos de la tapa de la bola.
  ...Array.from({ length: 6 }, (_, i): Calca => {
    const a = (i / 6) * Math.PI * 2, r = 0.016;
    return { sobre: ["bola-eje"], en: [BOLA.r, BOLA.y + r * Math.sin(a), BOLA.z + r * Math.cos(a)], desde: LADO, tam: [0.0035, 0.0035], dibujo: { tipo: "disco", color: "#8c9196" }, espejo: true };
  }),
  // Etiquetas del timón.
  { sobre: ["timon"], en: [0.01, 0.02, -0.553], desde: LADO, tam: [0.01, 0.032], dibujo: { tipo: "etiqueta" }, espejo: true },
];
// La tapa de la batería en cada costado, con un tornillo en cada esquina; y
// la tapa de lo alto del módulo, con cuatro.
const COSTURAS: Costura[] = [
  { sobre: ["barquilla"], desde: LADO, espejo: true, enVertices: true, puntos: [[0.05, -0.015, 0.192], [0.05, -0.015, 0.054], [0.05, -0.1, 0.054], [0.05, -0.1, 0.192], [0.05, -0.015, 0.192]] },
  { sobre: ["capucha"], desde: ARRIBA, enVertices: true, puntos: [[0.026, 0, 0.214], [-0.026, 0, 0.214], [-0.026, 0, 0.252], [0.026, 0, 0.252], [0.026, 0, 0.214]] },
];

const PARTES: Parte[] = [
  {
    nombre: "Cámara giratoria",
    en: [0, BOLA.y - 0.07, BOLA.z],
    piezas: ["bola", "bola-giro", "bola-eje", "bola-aro", "bola-ventana", "bola-ventana-ir", "capucha", "capucha-borde", "modulo", "cerco"],
    respaldo: "foto",
    fuentes: ["perfil", "gimbal-cerca", "italiano-morro", "raven-digitales", "gimbal", "gimbal-abajo", "infodron"],
    texto: "Una bola que gira bajo una capucha en el morro, con cámara de día, cámara térmica y un láser para señalar. Sigue sola al blanco que marca el operador. El Ejército de Tierra la tiene desde finales de 2016; sus primeros Raven llevaban cámaras fijas.",
    nota: "Qué lleva dentro sale de Infodron y de la ficha del Ejército de EE. UU.; la forma, de las fotos.",
  },
  {
    nombre: "Barquilla",
    en: [0, -0.2, 0.08],
    piezas: ["barquilla", "sonda"],
    respaldo: "foto",
    fuentes: ["perfil", "italiano-perfil", "iowa-morro", "suelo-gimbal", "et", "ficha-et"],
    texto: "El cuerpo, de kevlar, lleva la batería detrás de la tapa del costado. No tiene tren: aterriza de barriga, así que la panza baja y es lo que toca el suelo.",
    nota: "El ancho se mide en las fotos de frente; lo demás, en la de perfil.",
  },
  {
    nombre: "Ala en tres piezas",
    en: [0.52, 0.12, 0],
    piezas: ["ala", "ala-puntas", "pestillo"],
    respaldo: "foto",
    fuentes: ["eslovaquia", "eslovaquia-galeria", "detras", "suelo-gimbal", "abajo", "ficha-et"],
    texto: "1,4 m de punta a punta. El centro va recto sobre un pilón y las puntas suben hacia fuera, lo que hace que el avión vuelva solo a nivelarse. Las tres piezas se desmontan para meterlo en la mochila.",
    nota: "La envergadura es la de la ficha; la cuerda y el ángulo de las puntas, medidos en las fotos.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.16, -0.1],
    piezas: ["motor", "motor-tapa", "cono", "helice"],
    respaldo: "foto",
    fuentes: ["perfil", "suelo", "detras", "wikipedia"],
    texto: "Un motor eléctrico justo detrás del ala, con una hélice de dos palas que empuja. Así el morro queda libre para la cámara.",
    nota: "El diámetro de la hélice es aproximado: en las fotos de vuelo sale borrosa.",
  },
  {
    nombre: "Botalón y cola",
    en: [0, 0.15, -0.5],
    piezas: ["botalon", "botalon-junta", "botalon-fin", "deriva", "timon", "timon-cuerno", "timon-varilla", "estabilizador", "estab-herraje", "estab-pasador"],
    respaldo: "foto",
    fuentes: ["perfil", "abajo", "eslovaquia", "suelo-gimbal", "italiano-perfil", "detras"],
    texto: "Un tubo fino, que se parte en dos para guardarlo, lleva la cola: la deriva con su timón y, detrás, el estabilizador, sujeto al final del tubo con un pasador para que salte en los aterrizajes de golpe sin romperse.",
    nota: "La forma del estabilizador sale de fotos en perspectiva (desde arriba, desde abajo y de perfil); su cuerda es aproximada, a un centímetro.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo", "cintura", "panza", "hombro", "lomo"] as const;
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, ...Object.fromEntries(LARGOS_SECCION.filter((k) => q[k] !== undefined).map((k) => [k, u(q[k] as number)])) })) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), estaciones: p.estaciones.map(([x, a, b, t, s = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(s)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
  }
};
const calcaAUnidades = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const costuraAUnidades = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "RQ-11 Raven",
  subtitulo: "Dron de reconocimiento lanzado a mano",
  escala: ESCALA,  // 1 unidad = 0,5 m; medidas de la ficha del Ejército de Tierra
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: bandera("US"),
  hd: true,
  // Pixel HD: la pintura al sol cae justo en el borde entre el sexto y el
  // séptimo escalón de luz (6,0 en la vista 3D): corridos medio escalón.
  desfaseLuz: -0.5,
  // Tarjeta de /uas: el ángulo del TB2 (con el de todas, casi de perfil, el
  // ala larga salía de canto y el dron era un tubo).
  vistaTarjeta: [61, 20],
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(calcaAUnidades), costuras: COSTURAS.map(costuraAUnidades) },
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "perfil-vuelo.jpg", titulo: "De perfil en vuelo, con la cámara giratoria y el enlace digital", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}52nd_SFS_trains_with_Raven_for_first_time_at_Spangdahlem_(6243202).jpg` },
    { id: "detras", imagen: "frente-manos.jpg", titulo: "Desde detrás: el ala recta en el centro y las puntas subidas", medio: "Ejército de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Dark_Rifles_take_Battle_Group_Poland_Raven_training_to_new_heights_(6768246).jpg` },
    { id: "abajo", imagen: "abajo-vuelo.jpg", titulo: "Desde abajo, en vuelo (un Raven de cámaras fijas)", medio: "Ejército de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Raven_UAV_flying.jpg` },
    { id: "suelo", imagen: "suelo-tres-cuartos.jpg", titulo: "En la hierba, de tres cuartos", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}52nd_SFS_trains_with_Raven_for_first_time_at_Spangdahlem_(6243199).jpg` },
    { id: "gimbal", imagen: "gimbal-tres-cuartos.jpg", titulo: "La capucha y la bola del gimbal, desde abajo", medio: "Wikimedia Commons (CC BY-SA 4.0)", url: `${COMMONS}SUAV_Raven_(1).jpg` },
    { id: "gimbal-abajo", imagen: "gimbal-abajo.jpg", titulo: "Un Raven checo colgado, desde abajo", medio: "Wikimedia Commons (CC BY-SA 4.0)", url: `${COMMONS}SUAV_Raven_(2).jpg` },
    { id: "planta", imagen: "planta-suelo.jpg", titulo: "Un Raven rumano sobre sus mochilas, desde arriba", medio: "Ejército de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Romanian_RQ-11_Raven.jpg` },
    { id: "et", imagen: "et-mesa.jpg", titulo: "Un Raven del Ejército de Tierra en una exposición", medio: "Wikimedia Commons (CC BY-SA 3.0)", url: `${COMMONS}RQ-11_Raven_E.T..JPG` },
    { id: "italiano-perfil", imagen: "italiano-perfil.jpg", titulo: "De perfil, en manos de un soldado italiano (Cerdeña, 2023)", medio: "OTAN, Martin Glinker (Wikimedia Commons)", url: `${COMMONS}Exercise_Noble_Jump_2023_(7762012).jpg` },
    { id: "italiano-morro", imagen: "italiano-morro.jpg", titulo: "De tres cuartos por delante: la capucha, la bola y la tapa de la batería", medio: "OTAN, Martin Glinker (Wikimedia Commons)", url: `${COMMONS}Exercise_Noble_Jump_2023_(7762021).jpg` },
    { id: "suelo-gimbal", imagen: "suelo-gimbal.jpg", titulo: "En el suelo, con las flechas de las juntas del ala", medio: "OTAN, Martin Glinker (Wikimedia Commons)", url: `${COMMONS}Exercise_Noble_Jump_2023_(7762011).jpg` },
    { id: "gimbal-cerca", imagen: "gimbal-cerca.jpg", titulo: "La cámara giratoria de cerca, desde abajo", medio: "Ejército de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Troopers_receive_new_Raven_UAS_camera_upgrade_150819-A-JE145-071.jpg` },
    { id: "iowa-morro", imagen: "iowa-morro.jpg", titulo: "El morro y el costado de cerca, con la tapa de la batería quitada", medio: "ZLEA (Wikimedia Commons, CC BY-SA 4.0)", url: `${COMMONS}AeroVironment_RQ-11B_Raven_(cn_22247)_(6-24-2023).jpg` },
    { id: "eslovaquia", titulo: "La misión de la OTAN española en Eslovaquia (con el Raven de la pintura y las marcas, octubre de 2024)", medio: "El Español", url: "https://www.elespanol.com/espana/20241019/dias-cocina-mision-otan-espanola-eslovaquia-enemigo-entrado-territorio/893911100_0.html" },
    { id: "eslovaquia-galeria", titulo: "Las tropas españolas en un ejercicio de la OTAN (octubre de 2024)", medio: "Defensa.com", url: "https://www.defensa.com/galeria/espectaculares-imagenes-tropas-espanolas-aliados-otan-ejercicio" },
    { id: "raven-digitales", titulo: "Los nuevos Raven digitales del Ejército de Tierra español", medio: "Defensa.com", url: "https://www.defensa.com/espana/nuevos-raven-digitales-ejercito-tierra-espanol" },
    { id: "ficha-et", titulo: "Mini UAV Raven B (ficha del material)", medio: "Ejército de Tierra", url: FICHA_ET },
    { id: "infodron", titulo: "El Ejército moderniza su flota de RPAS con sistemas Raven digitales", medio: "Infodron", url: INFODRON },
    { id: "army", titulo: "RQ-11B Raven Small Unmanned Aircraft Systems", medio: "Ejército de EE. UU.", url: ARMY },
    { id: "wikipedia", titulo: "AeroVironment RQ-11 Raven", medio: "Wikipedia", url: WIKIPEDIA },
  ],
};

export default maqueta;
