// Maqueta del Sting de Wild Hornets, el ejemplar arena de los lotes de
// fábrica. Sin medidas oficiales (solo 4 ± 0,2 kg): todo sale de las fotos
// en diámetros del cuerpo (D) y D, de las personas que lo sostienen
// (docs/drones/sting.md, «Medidas»). Aproximado, como pidió el usuario.
// Fotos y ajustes en arte/uas-fuentes/sting/ (fuera de Git). 1 unidad = 15 cm.
import type { Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const WH = "https://wildhornets.com/en/sting-interceptor";
const TG = "https://t.me/wild_hornets/";
const U24 = "https://united24media.com/war-in-ukraine/ukrainian-sting-interceptor-drone-sets-new-altitude-record-destroying-russian-uav-at-75-km-21806";

// En metros: z hacia el morro desde donde nacen los brazos, x hacia la punta
// del ala, y hacia el lomo (el lado del logo): tumbado, como en el vuelo
// rápido. Al final se pone de pie, como se posa (ver `dePie`).
const ESCALA = 0.15;
const R = 0.05;               // radio del cuerpo (D = 10 cm)
const PUNTA = 0.31;           // punta de la ojiva: 3,1 D por delante de los brazos
const BRAZO = 0.195;          // del eje al centro del motor
const ALA = { x: 0.183, borde: 0.125, salida: 0.055, grosor: 0.01 };
const COLA = -0.06;

type P2 = [number, number];
type P3 = [number, number, number];

// Los cuatro brazos van en X, a 45° del plano de las alas (u24-lote-arriba,
// tg4595, devua-debajo, tg4567-vuelo-abajo, wh-web-vuelo).
const DIAGONALES: P2[] = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([a, b]) => [a * Math.SQRT1_2, b * Math.SQRT1_2]);

const brazo = ([cx, cy]: P2, i: number): Pieza[] => {
  const [x, y] = [cx * BRAZO, cy * BRAZO];
  return [
    { tipo: "varilla", id: `brazo-${i}`, acabado: "arena-st2", desde: [cx * 0.035, cy * 0.035, 0], hasta: [x - cx * 0.016, y - cy * 0.016, 0], radio: 0.015, lados: 20 },
    // La góndola: cono hacia el morro y el motor negro detrás.
    { tipo: "tubo", id: `gondola-${i}`, acabado: "arena-st2", centro: [x, y], perfil: [[0.055, 0], [0.051, 0.008], [0.043, 0.015], [0.03, 0.021], [0.015, 0.024], [-0.008, 0.024]] },
    // El motor: el bobinado cobrizo asoma entre la góndola y la campana negra.
    { tipo: "tubo", id: `bobinado-${i}`, acabado: "laton", centro: [x, y], perfil: [[-0.008, 0.019], [-0.013, 0.019]] },
    { tipo: "tubo", id: `motor-${i}`, acabado: "negro-ua", centro: [x, y], perfil: [[-0.013, 0.021], [-0.034, 0.021], [-0.037, 0.008], [-0.046, 0.003]] },
    { tipo: "tubo", id: `tuerca-${i}`, acabado: "aluminio", centro: [x, y], perfil: [[-0.044, 0.004], [-0.05, 0.004], [-0.052, 0]] },
    // Los cables del motor, por detrás del brazo hasta el cuerpo.
    ...[-0.004, 0.004].map((d, j): Pieza => ({ tipo: "varilla", id: `cable-${i}-${j}`, acabado: "negro-ua", desde: [cx * 0.045 - cy * d, cy * 0.045 + cx * d, -0.0155], hasta: [x - cx * 0.02 - cy * d, y - cy * 0.02 + cx * d, -0.0155], radio: 0.0018 })),
    // Bridas negras (u24-lote-arriba, defender-oliva-mano).
    ...[0.08, 0.14].flatMap((r, j): Pieza[] => [
      { tipo: "disco", id: `brida-${i}-${j}`, acabado: "negro-ua", en: [cx * r, cy * r, 0], normal: [cx, cy, 0], radio: 0.0158, grosor: 0.003 },
      // La cabeza de la brida, hacia el morro.
      { tipo: "caja", id: `brida-${i}-${j}-cabeza`, acabado: "negro-ua", centro: [cx * r, cy * r, 0.016], tam: [0.006, 0.006, 0.004], redondeo: 0.001 },
    ]),
    { tipo: "helice", id: `helice-${i}`, acabado: "negro-ua", en: [x, y, -0.042], radio: 0.089, palas: 2, ancho: 0.02, paso: 0.3, giro: 25 + 45 * i, buje: 0, inversa: i % 2 === 1 },
  ];
};

// Las patas: cuatro, en X como los brazos (en wh-web-vuelo salen dos fuera y
// dos dentro, girados como los motores). Cada una, una chapa fina que baja
// del costado de la cola y acaba en un pie (wh-web-vuelo, twz, u24).
const PATAS: Pieza[] = DIAGONALES.map(([cx, cy], i): Pieza => ({
  tipo: "placa", id: `pata-${i}`, acabado: "arena-st", plano: "horizontal", y: -0.0025, grosor: 0.005, bisel: 0.001,
  planta: [[0.035, -0.012], [0.045, -0.012], [0.066, -0.058], [0.066, -0.088], [0.056, -0.088], [0.056, -0.064], [0.035, -0.05]],
  girar: { centro: [0, 0, 0], eje: "z", grados: (Math.atan2(cy, cx) * 180) / Math.PI },
}));

const PIEZAS: Pieza[] = [
  // La ojiva (la carga): negra y mate, casi media esfera alargada, con el
  // anillo estriado en la base.
  { tipo: "tubo", id: "ojiva", acabado: "negro-ua", perfil: [[PUNTA, 0], [0.309, 0.008], [0.305, 0.017], [0.298, 0.026], [0.287, 0.034], [0.272, 0.041], [0.255, 0.046], [0.238, 0.0488], [0.227, 0.05]] },
  // El pitón de la punta.
  { tipo: "tubo", id: "piton", acabado: "negro-ua", perfil: [[PUNTA + 0.004, 0.0045], [PUNTA - 0.004, 0.0045]] },
  { tipo: "tubo", id: "anillo", acabado: "negro-ua", perfil: [[0.227, 0.0512], [0.215, 0.0512]] },
  // Las estrías del anillo (twz-dos-en-mano, devua-lateral-caja).
  ...Array.from({ length: 28 }, (_, k): Pieza => ({ tipo: "caja", id: `estria-${k}`, acabado: "negro-ua", centro: [0.0518, 0, 0.221], tam: [0.0022, 0.0028, 0.011], girar: { centro: [0, 0, 0], eje: "z", grados: (k * 360) / 28 } })),
  // El cuerpo: un cilindro de D que se cierra redondo en la cola (en el lote
  // es plano por el lado del logo; redondo a petición del usuario).
  { tipo: "tubo", id: "cuerpo", acabado: "arena-st", perfil: [[0.215, R], [-0.02, R], [-0.035, 0.048], [-0.048, 0.043], [-0.056, 0.035], [COLA, 0.024], [COLA - 0.004, 0]] },
  // Alas: rectas, con perfil y la punta redondeada en las dos esquinas, como
  // media pastilla (twz-dos-en-mano, wh-web-vuelo).
  {
    tipo: "ala", id: "alas", acabado: "arena-st2", y: 0,
    estaciones: [[0, ALA.borde, ALA.salida, ALA.grosor], [ALA.x - 0.02, ALA.borde, ALA.salida, ALA.grosor], ...[[0.011, 0.002], [0.016, 0.006], [0.0195, 0.013], [0.0205, 0.022]].map(([d, m]): [number, number, number, number] => [ALA.x - 0.02 + d, ALA.borde - m, ALA.salida + m, ALA.grosor * (1 - m / 0.04)])],
  },
  ...DIAGONALES.flatMap(brazo),
  ...PATAS,
  // Los cierres de la tapa de la batería, uno a cada costado (amarillos en
  // defender-oliva-mano; arena en el lote).
  { tipo: "caja", id: "cierre-tapa", acabado: "arena-st", centro: [0.051, 0, -0.028], tam: [0.008, 0.014, 0.022], espejo: true, redondeo: 0.002 },
  // Los dos cierres del lomo, que sujetan la cámara (u24-lote-arriba).
  { tipo: "varilla", id: "cierre", acabado: "arena-st", desde: [0.025, 0.043, 0.005], hasta: [0.025, 0.043, -0.055], radio: 0.005, espejo: true },
  // La cámara FPV: una caja negra en la cola, entre los cierres, con el
  // objetivo redondo y su aro claro mirando hacia el lomo (tg3907, tg4595,
  // u24-lote-arriba).
  { tipo: "caja", id: "camara", acabado: "negro-ua", centro: [0, 0.052, -0.04], tam: [0.03, 0.026, 0.03], redondeo: 0.004 },
  { tipo: "disco", id: "camara-aro", acabado: "aluminio", en: [0, 0.067, -0.04], normal: [0, 1, 0], radio: 0.0078, grosor: 0.005 },
  { tipo: "disco", id: "camara-lente", acabado: "lente", en: [0, 0.0698, -0.04], normal: [0, 1, 0], radio: 0.0058, grosor: 0.001 },
];

// El logo en relieve en el lomo, entre las alas, y la etiqueta blanca pequeña
// que lleva cada ejemplar del lote, a su izquierda (u24-lote-arriba).
const CALCAS: Calca[] = [
  { sobre: ["cuerpo"], en: [0, R, 0.08], desde: [0, 1, 0], tam: [0.05, 0.047], giro: 0, dibujo: { tipo: "sting", color: "#6f5a38" } },
  { sobre: ["cuerpo"], en: [0.024, R, 0.11], desde: [0, 1, 0], tam: [0.011, 0.017], giro: -15, dibujo: { tipo: "rect", color: "#ecebe4" } },
  // Panza: la ranura doble bajo la ojiva y el conector negro a la altura de
  // los brazos (twz-dos-en-mano).
  ...[0.011, 0.017].map((x): Calca => ({ sobre: ["cuerpo"], en: [x, -R, 0.165], desde: [0, -1, 0], tam: [0.0025, 0.075], dibujo: { tipo: "rect", color: "#2a2622" } })),
  { sobre: ["cuerpo"], en: [-0.012, -R, 0.0], desde: [0, -1, 0], tam: [0.018, 0.007], dibujo: { tipo: "rect", color: "#1c1d1d" } },
  // Roces de posarse en el suelo, en la cola.
  ...[1, -1].map((g): Calca => ({ sobre: ["cuerpo"], en: [0, g * 0.045, -0.045], desde: [0, g, 0], tam: [0.06, 0.03], dibujo: { tipo: "desgaste" } })),
  // Tornillos en fila por los dos costados (defender-oliva-mano).
  ...[0.2, 0.15, 0.1, 0.045].map((z): Calca => ({ sobre: ["cuerpo"], en: [R, 0, z], desde: [1, 0, 0], tam: [0.0055, 0.0055], espejo: true, dibujo: { tipo: "disco", color: "#2e281f" } })),
];

// Juntas: un aro alrededor del cuerpo, en cuatro cuartos (cada uno visto
// desde su lado).
const aro = (z: number): Costura[] => [0, 90, 180, 270].map((g) => {
  const a = (g * Math.PI) / 180;
  const puntos = Array.from({ length: 7 }, (_, i): P3 => { const t = a - Math.PI / 4 + (i * Math.PI) / 12; return [R * Math.cos(t), R * Math.sin(t), z]; });
  return { sobre: ["cuerpo"], puntos, desde: [Math.cos(a), Math.sin(a), 0], remaches: 0.026 };
});
const COSTURAS: Costura[] = [
  // El final de la banda de debajo de la ojiva (wh-web-vuelo) y la junta a
  // la altura de los brazos (twz-dos-en-mano).
  ...aro(0.157), ...aro(0.02),
  // La junta de la tapa de la batería, en la cola.
  ...aro(-0.035),
];

const PARTES = [
  {
    nombre: "Ojiva",
    en: [0, 0.035, 0.27] as P3,
    piezas: ["ojiva", "piton", "anillo", ...Array.from({ length: 28 }, (_, k) => `estria-${k}`)],
    respaldo: "foto" as const,
    fuentes: ["vuelo", "dos-en-mano", "primer-plano"],
    texto: "La carga explosiva va delante, en la ojiva negra: el Sting no dispara, choca contra el dron que persigue.",
    nota: "Forma y anillo de las fotos; lo que lleva dentro no se ve.",
  },
  {
    nombre: "Cuerpo",
    en: [0, R, 0.17] as P3,
    piezas: ["cuerpo", "cierre", "cierre-tapa"],
    respaldo: "foto" as const,
    fuentes: ["lote", "dos-en-mano", "lateral"],
    texto: "Un tubo impreso en 3D, de unos 10 cm de grueso y plano por el lado del logo, con la batería dentro.",
  },
  {
    nombre: "Alas",
    en: [0.13, 0.004, 0.1] as P3,
    piezas: ["alas"],
    respaldo: "foto" as const,
    fuentes: ["lote", "dos-en-mano", "vuelo"],
    texto: "Dos alas cortas y planas que lo sostienen en el vuelo rápido, cuando va tumbado.",
  },
  {
    nombre: "Brazos y motores",
    en: [BRAZO * Math.SQRT1_2, BRAZO * Math.SQRT1_2, 0.03] as P3,
    piezas: [0, 1, 2, 3].flatMap((i) => [`brazo-${i}`, `cable-${i}-0`, `cable-${i}-1`, `brida-${i}-0`, `brida-${i}-1`, `brida-${i}-0-cabeza`, `brida-${i}-1-cabeza`, `gondola-${i}`, `bobinado-${i}`, `motor-${i}`, `tuerca-${i}`, `helice-${i}`]),
    respaldo: "foto" as const,
    fuentes: ["campo", "lote", "vuelo-abajo", "vuelo"],
    texto: "Cuatro brazos en X, cada uno con un motor y su hélice detrás: despega de pie como un cuadricóptero y vuela tumbado como un avión.",
  },
  {
    nombre: "Cámara",
    en: [0, 0.07, -0.04] as P3,
    piezas: ["camara", "camara-aro", "camara-lente"],
    respaldo: "foto" as const,
    fuentes: ["lote", "primer-plano", "campo"],
    texto: "Una cámara FPV pequeña en la cola, sujeta entre los dos cierres: es la que ve el piloto, que vuela con gafas.",
  },
  {
    nombre: "Patas",
    en: [0.047, 0.047, -0.088] as P3,
    piezas: ["pata-0", "pata-1", "pata-2", "pata-3"],
    respaldo: "foto" as const,
    fuentes: ["vuelo", "dos-en-mano", "lote"],
    texto: "Se posa de pie sobre la cola, sobre cuatro patas finas en X, como los brazos.",
    nota: "La forma de las patas sale de la foto de frente en vuelo; su grueso, supuesto.",
    
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: P2): P2 => [u(a), u(b)];
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const LARGOS_SECCION = ["z", "ancho", "arriba", "abajo"] as const;
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, ...Object.fromEntries(LARGOS_SECCION.map((k) => [k, u(q[k])])) })) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "placa":
      if (p.plano !== "horizontal") throw new Error("Placa vertical sin convertir");
      return { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), estaciones: p.estaciones.map(([x, a, b, t]): [number, number, number, number] => [u(x), u(a), u(b), u(t)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "codo":
      return { ...p, puntos: p.puntos.map((q) => q.map(u) as typeof q) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
// De pie, como se posa: todo girado 90° sobre x, la ojiva arriba y el lomo
// mirando atrás. Las piezas con `girar`; las calcas, las costuras y las
// chinchetas, girando sus puntos igual.
const GIRO = -90;
const dePie = ([x, y, z]: P3): P3 => [x, z, -y];
const calcaAUnidades = (k: Calca): Calca => ({ ...k, en: u3(dePie(k.en)), desde: dePie(k.desde), tam: u2(k.tam) });
const costuraAUnidades = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map((q) => u3(dePie(q))), desde: dePie(k.desde), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "Sting",
  subtitulo: "Dron interceptor contra drones Shahed",
  escala: ESCALA,  // 1 unidad = 15 cm; medidas aproximadas, de las fotos
  pais: bandera("UA"),
  // Abre de pie, visto por el lomo y algo de lado (el lomo mira atrás).
  vista3d: [200, 8],
  // Frente por la cara del logo (de pie, el lomo mira atrás).
  vistaFrente: [180, 0],
  // La tarjeta de /uas, de pie como abre el visor (elegido por el usuario
  // frente a dos en vuelo).
  vistaTarjeta: [200, 8],
  // En el perfil, tumbado como vuela: el morro a la izquierda y la cámara
  // arriba (se deshace el giro de `dePie`).
  posturaPerfil: { eje: "x", grados: -GIRO },
  // En la planta de la portada, tumbado y visto por el lomo, como los demás.
  plantaEnVuelo: true,
  // Pixel: la arena al sol cae en 5,0 escalones y la cara del logo, en la
  // vista con que abre, en 2,45; con 0,25 las dos quedan a un cuarto del borde.
  desfaseLuz: 0.25,
  hd: true,
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(calcaAUnidades), costuras: COSTURAS.map(costuraAUnidades) },
  piezas: PIEZAS.map(aUnidades).map((p) => ({ ...p, girarLuego: { centro: [0, 0, 0], eje: "x", grados: GIRO } })),
  partes: PARTES.map((p) => ({ ...p, en: u3(dePie(p.en)) })),
  fuentes: [
    { id: "lote", imagen: "u24-lote-arriba.jpg", titulo: "Un lote de fábrica desde arriba", medio: "United24 Media", url: U24 },
    { id: "dos-en-mano", imagen: "twz-dos-en-mano.jpg", titulo: "Dos Sting de pie sobre las manos", medio: "Wild Hornets, vía TWZ", url: "https://www.twz.com/news-features/ukrainian-companies-prohibited-from-exporting-shahed-interceptor-drones" },
    { id: "vuelo", imagen: "wh-web-vuelo.jpg", titulo: "En vuelo estacionario, de frente", medio: "Wild Hornets", url: WH },
    { id: "campo", imagen: "tg4595-campo-tres-cuartos.jpg", titulo: "De pie en el campo: los cuatro brazos en X", medio: "Wild Hornets (Telegram)", url: `${TG}4595` },
    { id: "vuelo-abajo", imagen: "tg4567-vuelo-abajo.jpg", titulo: "En vuelo, desde abajo, con la varilla y los pies", medio: "Wild Hornets (Telegram)", url: `${TG}4567` },
    { id: "lateral", imagen: "devua-lateral-caja.jpg", titulo: "Sobre su caja, de lado, con el piloto detrás", medio: "Wild Hornets, vía dev.ua", url: "https://dev.ua/en/news/perekhopliuvachamy-sting-1783597380" },
    { id: "primer-plano", imagen: "tg3907-primer-plano.jpg", titulo: "La ojiva y el cuerpo de cerca", medio: "Wild Hornets (Telegram)", url: `${TG}3907` },
    { id: "oliva-mesa", imagen: "tg5098-oliva-mesa.jpg", titulo: "Un Sting verde oliva en la mesa de trabajo", medio: "Wild Hornets (Telegram)", url: `${TG}5098` },
    { id: "fabricante", titulo: "Sting interceptor", medio: "Wild Hornets", url: WH },
  ],
};

export default maqueta;
