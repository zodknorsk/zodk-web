// Maqueta del RQ-11B Raven de AeroVironment con el morro de cámara giratoria
// (gimbal) y el enlace digital (DDL), el que vuela hoy el Ejército de Tierra.
// Medidas de la ficha del Ejército de Tierra (1,4 m de envergadura, 0,91 m de
// largo); la forma de cada pieza, de fotos del Ejército de EE. UU., de la
// Fuerza Aérea de EE. UU. y de Raven checos y españoles. La foto de perfil en
// vuelo (casi sin perspectiva) da el contorno de la barquilla, el pilón, el
// motor y la cola; la de detrás, el diedro de las puntas del ala; las de
// frente y desde abajo, la planta. Todo se escribe en metros, con z = 0 bajo
// la mitad del ala y y = 0 en el lomo de la barquilla, y al final se pasa a
// unidades de la maqueta (1 unidad = 0,5 m). Imágenes a tamaño completo en
// arte/uas-fuentes/rq-11-raven/ (fuera de Git; enlaces en docs/uas.md).
import type { Maqueta, Parte, Pieza } from "./tipos";
import { PAISES_LUNA } from "../alunizajes.ts";

const ESCALA = 0.5;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const FICHA_ET = "https://ejercito.defensa.gob.es/materiales/otros/MINI-UAV?__locale=es";
const INFODRON = "https://www.infodron.es/texto-diario/mostrar/3531733/ejercito-moderniza-flota-rpas-sistemas-039raven-039-digitales";
const ARMY = "https://www.army.mil/article/137604/rq_11b_raven_small_unmanned_aircraft_systems_suas";
const WIKIPEDIA = "https://en.wikipedia.org/wiki/AeroVironment_RQ-11_Raven";

// Las placas con bisel crecen hacia fuera lo que mide el bisel: para que la
// silueta quede como en la foto, el contorno se encoge antes lo mismo.
const encoger = (contorno: [number, number][], d: number): [number, number][] => {
  const n = contorno.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [a, b] = contorno[i], [c, e] = contorno[(i + 1) % n];
    area += a * e - c * b;
  }
  const giro = area > 0 ? 1 : -1;
  return contorno.map(([x, y], i) => {
    const [px, py] = contorno[(i - 1 + n) % n], [sx, sy] = contorno[(i + 1) % n];
    // Normales hacia dentro de los dos lados que llegan al vértice.
    const normal = (ax: number, ay: number, bx: number, by: number) => {
      const l = Math.hypot(bx - ax, by - ay);
      return [(-(by - ay) / l) * giro, ((bx - ax) / l) * giro];
    };
    const [n1x, n1y] = normal(px, py, x, y), [n2x, n2y] = normal(x, y, sx, sy);
    const mx = n1x + n2x, my = n1y + n2y, lm = Math.hypot(mx, my);
    const coseno = (n1x * n2x + n1y * n2y + 1) / 2;
    const k = d / Math.sqrt(Math.max(coseno, 0.25));
    return [x + (mx / lm) * k, y + (my / lm) * k];
  });
};

// Barquilla: contorno de perfil [z, y], del morro de la barquilla (detrás del
// módulo de la cámara) a la cola, con la panza que baja para aterrizar de
// barriga. 8 cm de ancho. Por detrás baja casi en vertical y se une al
// botalón con un carenado corto aparte (carenado-botalon).
const BARQUILLA = { ancho: 0.08, bisel: 0.02 };
const PERFIL_BARQUILLA: [number, number][] = [
  [0.2, 0], [-0.07, 0], [-0.075, -0.01], [-0.078, -0.05], [-0.085, -0.068], [-0.085, -0.1],
  [-0.06, -0.105], [-0.021, -0.109], [0.043, -0.126], [0.102, -0.141], [0.17, -0.141],
  [0.187, -0.134], [0.2, -0.119],
];

// Módulo de la cámara: una capucha que por arriba y por delante es media
// circunferencia (fotos desde abajo), con la bola del gimbal colgando debajo
// y, detrás de la bola, el cuerpo del módulo.
const CAPUCHA = { z0: 0.2, z1: 0.331, arriba: -0.006, abajo: -0.068, ancho: 0.086, bisel: 0.024 };
// Media planta (x ≥ 0), ya encogida lo que mide el bisel.
const plantaCapucha = (): [number, number][] => {
  const r = CAPUCHA.ancho / 2 - CAPUCHA.bisel, zc = CAPUCHA.z1 - CAPUCHA.ancho / 2;
  const arco = Array.from({ length: 9 }, (_, i): [number, number] => {
    const a = (i / 8) * (Math.PI / 2);
    return [r * Math.sin(a), zc + r * Math.cos(a)];
  });
  return [...arco, [r, CAPUCHA.z0 + CAPUCHA.bisel], [0, CAPUCHA.z0 + CAPUCHA.bisel]];
};
const BOLA = { y: -0.094, z: 0.278, r: 0.036 };

// Bola del gimbal, como un torno de media circunferencia.
const esfera = (z: number, r: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });

// Ala en tres piezas: el centro, recto y plano, sobre el pilón; las puntas,
// más estrechas hacia fuera y subidas unos 10° (foto de detrás).
const ALA = { y: 0.057, centro: 0.2, punta: 0.685, ba: 0.085, bs: -0.085, baPunta: 0.035, diedro: 10 };
const SUBIDA = (ALA.punta - ALA.centro) * Math.tan((ALA.diedro * Math.PI) / 180);

// Motor, detrás del ala y un poco por debajo, en lo alto de la cara de atrás
// de la barquilla y el pilón (fotos de perfil en tierra).
const MOTOR = { y: 0.04 };

// Botalón: sube un poco hacia la cola.
const BOTALON = { desde: [0, -0.086, -0.06] as [number, number, number], hasta: [0, -0.068, -0.59] as [number, number, number], radio: 0.0125 };
const enBotalon = (z: number): number =>
  BOTALON.desde[1] + ((BOTALON.hasta[1] - BOTALON.desde[1]) * (z - BOTALON.desde[2])) / (BOTALON.hasta[2] - BOTALON.desde[2]);

// Cola: deriva con timón (la bisagra se ve en todas las fotos de perfil) y,
// debajo del final del botalón, el estabilizador, que se estrecha hacia las
// puntas con el borde de ataque en flecha (fotos desde abajo y desde arriba).
const COLA = { raiz: -0.058, alto: 0.0997, bisagra: -0.524 };
const ESTAB = { y: -0.085, semi: 0.2 };

const PIEZAS: Pieza[] = [
  {
    tipo: "placa", id: "barquilla", acabado: "gris-et", plano: "vertical", x: 0,
    grosor: BARQUILLA.ancho, bisel: BARQUILLA.bisel, planta: encoger(PERFIL_BARQUILLA, BARQUILLA.bisel),
  },
  {
    // Tapa de la batería en el costado.
    tipo: "placa", id: "tapa", acabado: "gris-et", plano: "vertical", x: 0, grosor: BARQUILLA.ancho + 0.004, bisel: 0.001,
    planta: [[0.19, -0.022], [0.052, -0.022], [0.052, -0.088], [0.19, -0.088]],
  },
  {
    // Placa con la planta de la capucha (media circunferencia delante) y un
    // bisel grande, que redondea el borde de arriba como en las fotos.
    tipo: "placa", id: "capucha", acabado: "gris-et", plano: "horizontal", simetrica: true,
    y: (CAPUCHA.arriba + CAPUCHA.abajo) / 2, grosor: CAPUCHA.arriba - CAPUCHA.abajo, bisel: CAPUCHA.bisel,
    planta: plantaCapucha(),
  },
  {
    tipo: "caja", id: "modulo", acabado: "gris-et", redondeo: 0.012,
    centro: [0, -0.094, 0.218], tam: [0.08, 0.054, 0.044],
  },
  { tipo: "tubo", id: "bola", acabado: "gris", centro: [0, BOLA.y], perfil: esfera(BOLA.z, BOLA.r) },
  { tipo: "disco", id: "bola-eje", acabado: "negro", espejo: true, en: [BOLA.r - 0.004, BOLA.y, BOLA.z], normal: [1, 0, 0], radio: 0.019, grosor: 0.006 },
  { tipo: "disco", id: "bola-ventana", acabado: "lente", en: [0, BOLA.y - 0.017, BOLA.z + 0.03], normal: [0, -0.5, 0.87], radio: 0.015, grosor: 0.006 },
  {
    // Pilón: levanta el ala unos 5 cm sobre la barquilla (fotos de perfil en
    // tierra; en la de vuelo lo tapa el ala) y lleva el motor detrás.
    tipo: "placa", id: "pilon", acabado: "gris-et", plano: "vertical", x: 0, grosor: 0.045, bisel: 0.005,
    planta: encoger([[0.092, -0.004], [0.086, 0.012], [0.079, 0.032], [0.076, 0.054], [-0.072, 0.054], [-0.076, 0.03], [-0.078, -0.004]], 0.005),
  },
  {
    // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor, subida].
    // El centro y las puntas son piezas aparte: entre ellas se ve la junta,
    // como el pliegue del ala de verdad.
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
      [ALA.punta, ALA.baPunta, ALA.bs, 0.012, SUBIDA],
    ],
  },
  {
    tipo: "tubo", id: "motor", acabado: "gris-et", centro: [0, MOTOR.y],
    perfil: [[-0.05, 0], [-0.05, 0.017], [-0.08, 0.017], [-0.084, 0.012], [-0.084, 0]],
  },
  {
    tipo: "tubo", id: "cono", acabado: "negro", centro: [0, MOTOR.y],
    perfil: [[-0.086, 0.011], [-0.095, 0.01], [-0.105, 0.007], [-0.113, 0]],
  },
  // Hélice de dos palas claras con el cono negro (fotos del Ejército de
  // Tierra y de detrás), parada en diagonal, como en las fotos.
  { tipo: "helice", id: "helice", acabado: "gris", en: [0, MOTOR.y, -0.089], radio: 0.08, palas: 2, giro: 60 },
  {
    tipo: "tubo", id: "carenado-botalon", acabado: "gris-et", centro: [0, enBotalon(-0.1)], seccion: [0.85, 1],
    perfil: [[-0.05, 0], [-0.05, 0.03], [-0.08, 0.028], [-0.092, 0.022], [-0.102, 0.016], [-0.112, 0.0135], [-0.118, 0]],
  },
  { tipo: "varilla", id: "botalon", acabado: "gris-et", desde: BOTALON.desde, hasta: BOTALON.hasta, radio: BOTALON.radio },
  // Junta del botalón, que se parte en dos para ir en la mochila.
  { tipo: "varilla", id: "botalon-junta", acabado: "gris-et", desde: [0, enBotalon(-0.178), -0.178], hasta: [0, enBotalon(-0.19), -0.19], radio: BOTALON.radio + 0.0018 },
  {
    tipo: "placa", id: "deriva", acabado: "gris-et", plano: "vertical", x: 0, grosor: 0.006, bisel: 0.002,
    planta: [[-0.4175, COLA.raiz], [COLA.bisagra, COLA.raiz], [COLA.bisagra, COLA.alto], [-0.4601, COLA.alto]],
  },
  {
    tipo: "placa", id: "timon", acabado: "gris-et", plano: "vertical", x: 0, grosor: 0.006, bisel: 0.002,
    planta: [[COLA.bisagra, COLA.raiz], [-0.567, COLA.raiz], [-0.561, COLA.alto], [COLA.bisagra, COLA.alto]],
  },
  {
    tipo: "placa", id: "estabilizador", acabado: "gris-et", plano: "horizontal", y: ESTAB.y, grosor: 0.006, bisel: 0.002, simetrica: true,
    planta: [[0, -0.475], [ESTAB.semi, -0.52], [ESTAB.semi, -0.585], [0, -0.585]],
  },
];

const PARTES: Parte[] = [
  {
    nombre: "Cámara giratoria",
    en: [0, BOLA.y - 0.07, BOLA.z],
    piezas: ["bola", "bola-eje", "bola-ventana", "capucha", "modulo"],
    respaldo: "foto",
    fuentes: ["perfil", "gimbal", "gimbal-abajo", "infodron"],
    texto: "Una bola que gira bajo una capucha en el morro, con cámara de día, cámara térmica y un láser para señalar. Sigue sola al blanco que marca el operador. El Ejército de Tierra la tiene desde finales de 2016; sus primeros Raven llevaban cámaras fijas.",
    nota: "Qué lleva dentro sale de Infodron y de la ficha del Ejército de EE. UU.; la forma, de las fotos.",
  },
  {
    nombre: "Barquilla",
    en: [0, -0.2, 0.08],
    piezas: ["barquilla", "tapa", "carenado-botalon"],
    respaldo: "foto",
    fuentes: ["perfil", "suelo", "et", "ficha-et"],
    texto: "El cuerpo, de kevlar, lleva la batería detrás de la tapa del costado. No tiene tren: aterriza de barriga, así que la panza baja y es lo que toca el suelo.",
    nota: "El ancho se mide en las fotos de frente; lo demás, en la de perfil.",
  },
  {
    nombre: "Ala en tres piezas",
    en: [0.52, 0.12, 0],
    piezas: ["ala", "ala-puntas", "pilon"],
    respaldo: "foto",
    fuentes: ["detras", "abajo", "planta", "ficha-et"],
    texto: "1,4 m de punta a punta. El centro va recto sobre un pilón y las puntas suben hacia fuera, lo que hace que el avión vuelva solo a nivelarse. Las tres piezas se desmontan para meterlo en la mochila.",
    nota: "La envergadura es la de la ficha; la cuerda y el ángulo de las puntas, medidos en las fotos.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.16, -0.1],
    piezas: ["motor", "cono", "helice"],
    respaldo: "foto",
    fuentes: ["perfil", "suelo", "detras", "wikipedia"],
    texto: "Un motor eléctrico justo detrás del ala, con una hélice de dos palas que empuja. Así el morro queda libre para la cámara.",
    nota: "El diámetro de la hélice es aproximado: en las fotos de vuelo sale borrosa.",
  },
  {
    nombre: "Botalón y cola",
    en: [0, 0.15, -0.5],
    piezas: ["botalon", "botalon-junta", "deriva", "timon", "estabilizador"],
    respaldo: "foto",
    fuentes: ["perfil", "detras", "planta"],
    texto: "Un tubo fino, que se parte en dos para guardarlo, lleva la cola: la deriva con su timón y, debajo, el estabilizador.",
    nota: "La envergadura del estabilizador es una reconstrucción: ninguna foto lo enseña de planta sin perspectiva.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map(u2), ...(p.centro && { centro: u2(p.centro) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), estaciones: p.estaciones.map(([x, a, b, t, s = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(s)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "helice":
      return { ...p, en: u3(p.en), radio: u(p.radio) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
  }
};

const maqueta: Maqueta = {
  nombre: "RQ-11 Raven",
  subtitulo: "Dron de reconocimiento lanzado a mano",
  escala: ESCALA,  // 1 unidad = 0,5 m; medidas de la ficha del Ejército de Tierra
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  pais: PAISES_LUNA.find((p) => p.codigo === "US")!,
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
    { id: "ficha-et", titulo: "Mini UAV Raven B (ficha del material)", medio: "Ejército de Tierra", url: FICHA_ET },
    { id: "infodron", titulo: "El Ejército moderniza su flota de RPAS con sistemas Raven digitales", medio: "Infodron", url: INFODRON },
    { id: "army", titulo: "RQ-11B Raven Small Unmanned Aircraft Systems", medio: "Ejército de EE. UU.", url: ARMY },
    { id: "wikipedia", titulo: "AeroVironment RQ-11 Raven", medio: "Wikipedia", url: WIKIPEDIA },
  ],
};

export default maqueta;
