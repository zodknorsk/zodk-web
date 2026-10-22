// Maqueta del Wild Hornets Strike de 10 pulgadas, sacada de las cuatro
// imágenes oficiales de Wild Hornets (planta, perspectivas y vista de arriba;
// sin la peana de exposición) y, para la carga, de la foto de DroneXL de un
// FPV en vuelo con la ojiva atada debajo. El fabricante no da medidas del
// marco: la escala sale de las hélices de 10 pulgadas y de un marco de 44 cm
// entre motores en diagonal, como los de su clase. Lo que importa es el
// detalle: placas, motores, mástil de antenas, muelles de impacto, batería y
// ojiva. 1 unidad = 25 cm.
import type { Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const FICHA = "https://wildhornets.com/en/fpv-drone-with-10-inch-propellers-analog";

// Todo en centímetros: x hacia la izquierda del dron de verdad (la maqueta va
// en espejo), y arriba desde el centro de los brazos, z hacia delante desde
// el cruce de los brazos. Al final se pasa a unidades (1 = 25 cm).
const ESCALA = 0.25;

type P3 = [number, number, number];
type P5 = [number, number, number, number, number];

// Ejes de los motores: x a cada lado, z delante y detrás.
const MX = 17, MZ = 15;
// Ángulo de los brazos visto desde arriba, desde el eje z.
const ANG_BRAZO = (Math.atan2(MX, MZ) * 180) / Math.PI;
// Riostras: de qué punto del brazo de detrás al de cuál del de delante
// (fracción del brazo desde el centro, vista de arriba).
const RIOSTRA: [number, number] = [0.82, 0.66];
// Placas: la de abajo bajo los brazos, la de arriba sobre las columnas.
const Y_ABAJO = -0.43, Y_ARRIBA = 3.13, GROSOR_PLACA = 0.25;
const Y_TECHO = Y_ARRIBA + GROSOR_PLACA / 2;

// Planta de las placas (media, x ≥ 0), de la cola al morro: ancha detrás,
// donde va el XT60, recta sobre el cruce de los brazos y estrecha delante,
// donde la cámara.
const PLANTA_PLACA: [number, number][] = [
  [0, -11.6], [1.1, -11.6], [1.5, -11.0], [1.95, -8.8], [1.95, -4.6], [1.8, -3.2],
  [1.8, 3.6], [1.7, 6.2], [1.55, 9.5], [1.45, 11.2], [1.1, 11.8], [0, 11.8],
];

// Un punto del mástil de antenas, a s cm de su pie, subido `h` cm por su cara
// de arriba. El mástil sale de la cola entre las placas y sube hacia atrás.
const MASTIL_PIE: P3 = [0, 2.0, -10.8], MASTIL_PUNTA: P3 = [0, 16.0, -25.0];
const MASTIL_LARGO = Math.hypot(MASTIL_PUNTA[1] - MASTIL_PIE[1], MASTIL_PUNTA[2] - MASTIL_PIE[2]);
const MD: P3 = [0, (MASTIL_PUNTA[1] - MASTIL_PIE[1]) / MASTIL_LARGO, (MASTIL_PUNTA[2] - MASTIL_PIE[2]) / MASTIL_LARGO];
const MN: P3 = [0, -MD[2], MD[1]];
const MASTIL_ANG = (Math.atan2(MD[1], -MD[2]) * 180) / Math.PI;
const enMastil = (s: number, h = 0, x = 0): P3 => [x, MASTIL_PIE[1] + MD[1] * s + MN[1] * h, MASTIL_PIE[2] + MD[2] * s + MN[2] * h];

// Muelles de impacto: un poste negro bajo cada brazo de delante, apuntando
// adelante y abajo, con un muelle enrollado en la punta y una varilla de
// acero por dentro.
const POSTE: P3 = [9.6, -0.7, 8.5];
const BAJADA = 8;
const MUELLE_DIR: P3 = [0, -Math.sin((BAJADA * Math.PI) / 180), Math.cos((BAJADA * Math.PI) / 180)];
const POSTE_LARGO = 4.5;
const masDir = (p: P3, d: P3, s: number): P3 => [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];
const POSTE_PUNTA = masDir(POSTE, MUELLE_DIR, POSTE_LARGO);

// Hélice de alambre alrededor del eje `d` desde `base`: las primeras vueltas
// juntas (enrolladas en el poste) y las demás abiertas.
const espiral = (base: P3, d: P3, radio: number, alambre: number, largo: number, vueltas: number): [number, number, number, number][] => {
  const a: P3 = [1, 0, 0];
  const b: P3 = [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]];
  const n = Math.round(vueltas * 10), juntas = 3.5 / vueltas;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, ang = 2 * Math.PI * vueltas * t;
    const s = t < juntas ? (t / juntas) * 0.35 * largo : 0.35 * largo + ((t - juntas) / (1 - juntas)) * 0.65 * largo;
    const c = Math.cos(ang) * radio, e = Math.sin(ang) * radio;
    return [base[0] + d[0] * s + a[0] * c + b[0] * e, base[1] + d[1] * s + a[1] * c + b[1] * e, base[2] + d[2] * s + a[2] * c + b[2] * e, alambre];
  });
};

// Ojiva: granada de mortero de 81 mm sin la cola (le quitan el tubo con las
// aletas y las cargas para colgarla del dron). Forma de una M821 medida en una
// foto, a lo largo del eje desde la nariz (t, en mm) y el radio (mm). El
// lomo, pegado a la placa de abajo; la banda de obturación, algo por delante
// del centro del dron.
const OJIVA_R = 4.05;
const Z_NARIZ = 23.7;
const zt = (t: number) => Z_NARIZ - t / 10;
const perfilT = (q: [number, number][]): [number, number][] => q.map(([t, r]) => [zt(t), r / 10]);
const OJIVA_Y = Y_ABAJO - GROSOR_PLACA / 2 - OJIVA_R;

// Motor 3115: base negra con sus cuatro tornillos por debajo del brazo,
// bobinado rojo cobrizo, campana gris metalizada con cinco ventanas grandes
// arriba del costado y cinco radios en la tapa (las dos dejan ver el
// bobinado), el logo claro en el costado, eje, cubo de la hélice, arandela y
// tuerca autoblocante.
const motor = (id: string, z: number): Pieza[] => {
  const c = (y: number): P3 => [MX, y, z];
  return [
    { tipo: "disco", id: `${id}-asiento`, acabado: "carbono-wh", en: c(0), normal: [0, 1, 0], radio: 2.05, grosor: 0.6, espejo: true },
    ...[0, 90, 180, 270].map((f, k): Pieza => {
      const r = ((f + 45) * Math.PI) / 180;
      return { tipo: "disco", id: `${id}-tornillo-${k}`, acabado: "aluminio", en: [MX + 0.95 * Math.sin(r), -0.33, z + 0.95 * Math.cos(r)], normal: [0, -1, 0], radio: 0.18, grosor: 0.06, espejo: true };
    }),
    { tipo: "varilla", id: `${id}-base`, acabado: "negro-ua", desde: c(0.3), hasta: c(0.75), radio: 1.85, lados: 32, espejo: true },
    { tipo: "varilla", id: `${id}-cobre`, acabado: "cobre-wh", desde: c(0.75), hasta: c(3.2), radio: 1.78, lados: 32, espejo: true },
    { tipo: "varilla", id: `${id}-campana-baja`, acabado: "campana-wh", desde: c(0.9), hasta: c(2.2), radio: 1.96, lados: 40, espejo: true },
    // Pilares de la campana entre las cinco ventanas.
    ...Array.from({ length: 5 }, (_, k): Pieza[] => {
      const f = (k * 360) / 5 + 36, r = (f * Math.PI) / 180;
      const centro: P3 = [MX + 1.87 * Math.sin(r), 2.63, z + 1.87 * Math.cos(r)];
      return aLosDosLados({ tipo: "caja", id: `${id}-pilar-${k}`, acabado: "campana-wh", centro, tam: [0.75, 0.9, 0.2], girar: { centro, eje: "y", grados: f } });
    }).flat(),
    { tipo: "varilla", id: `${id}-campana`, acabado: "campana-wh", desde: c(3.05), hasta: c(3.3), radio: 1.96, lados: 40, espejo: true },
    // La tapa: el bobinado asoma entre cinco radios.
    { tipo: "disco", id: `${id}-tapa-cobre`, acabado: "cobre-wh", en: c(3.32), normal: [0, 1, 0], radio: 1.55, grosor: 0.04, espejo: true },
    ...Array.from({ length: 5 }, (_, k): Pieza[] => {
      const f = k * 72, r = (f * Math.PI) / 180;
      const centro: P3 = [MX + 1.1 * Math.sin(r), 3.36, z + 1.1 * Math.cos(r)];
      return aLosDosLados({ tipo: "caja", id: `${id}-radio-${k}`, acabado: "campana-wh", centro, tam: [0.45, 0.1, 1.05], girar: { centro, eje: "y", grados: f } });
    }).flat(),
    { tipo: "disco", id: `${id}-buje`, acabado: "campana-wh", en: c(3.38), normal: [0, 1, 0], radio: 0.68, grosor: 0.12, espejo: true },
    { tipo: "varilla", id: `${id}-eje`, acabado: "aluminio", desde: c(3.3), hasta: c(4.95), radio: 0.25, lados: 16, espejo: true },
    // Cubo de la hélice, arandela y tuerca de seis lados con su nailon arriba.
    { tipo: "varilla", id: `${id}-cubo`, acabado: "helice-wh", desde: c(3.44), hasta: c(4.08), radio: 0.88, lados: 28, espejo: true },
    { tipo: "disco", id: `${id}-arandela`, acabado: "aluminio", en: c(4.12), normal: [0, 1, 0], radio: 0.58, grosor: 0.08, espejo: true },
    { tipo: "varilla", id: `${id}-tuerca`, acabado: "aluminio", desde: c(4.16), hasta: c(4.62), radio: 0.46, lados: 6, espejo: true },
    { tipo: "varilla", id: `${id}-nailon`, acabado: "negro-ua", desde: c(4.62), hasta: c(4.8), radio: 0.36, lados: 16, espejo: true },
  ];
};

// Planta de las palas de 10 pulgadas: estrechas en la raíz, anchas a un
// tercio y afinándose hasta una punta redondeada (fotos con hélices).
const PALA: [number, number, number][] = [[0.07, 0.3, 0.3], [0.18, 0.48, 0.44], [0.35, 0.5, 0.42], [0.55, 0.44, 0.36], [0.78, 0.34, 0.26], [0.93, 0.22, 0.14], [1, 0.06, 0.02]];

// Una pieza girada sobre y, a este lado y en espejo al otro (con `espejo`
// el reflejo giraría sobre el centro de este lado y saldría suelta).
const aLosDosLados = (p: Extract<Pieza, { tipo: "caja" }>): Pieza[] => {
  const g = p.girar!;
  const centro: P3 = [-p.centro[0], p.centro[1], p.centro[2]];
  return [p, { ...p, id: `${p.id}-2`, centro, girar: { centro: [-g.centro[0], g.centro[1], g.centro[2]], eje: g.eje, grados: g.eje === "y" ? -g.grados : g.grados } }];
};

// Un tramo de un brazo, de t0 a t1 (fracción del brazo desde el centro).
const tramoBrazo = (z: number, t0: number, t1: number, ancho: number, alto: number, y = 0): P5[] =>
  [[MX * t0, y, z * t0, ancho, alto], [MX * t1, y, z * t1, ancho, alto]];

const PIEZAS: Pieza[] = [
  // --- Marco: dos placas de carbono, columnas, brazos y riostras.
  { tipo: "placa", id: "placa-abajo", acabado: "carbono-wh", plano: "horizontal", y: Y_ABAJO, grosor: GROSOR_PLACA, simetrica: true, bisel: 0.05, planta: PLANTA_PLACA },
  { tipo: "placa", id: "placa-arriba", acabado: "carbono-wh", plano: "horizontal", y: Y_ARRIBA, grosor: GROSOR_PLACA, simetrica: true, bisel: 0.05, planta: PLANTA_PLACA },
  ...([[-10.4, 1.0], [-7.6, 1.65], [-3.4, 1.5], [3.4, 1.5], [7.4, 1.4], [10.6, 1.1]] as const).flatMap(([z, x], k): Pieza[] => [
    { tipo: "varilla", id: `columna-${k}`, acabado: "negro-ua", desde: [x, -0.3, z], hasta: [x, 3.0, z], radio: 0.27, lados: 12, espejo: true },
    { tipo: "disco", id: `tornillo-${k}`, acabado: "aluminio", en: [x, Y_TECHO + 0.04, z], normal: [0, 1, 0], radio: 0.24, grosor: 0.08, espejo: true },
    { tipo: "disco", id: `tornillo-abajo-${k}`, acabado: "aluminio", en: [x, Y_ABAJO - GROSOR_PLACA / 2 - 0.04, z], normal: [0, -1, 0], radio: 0.24, grosor: 0.08, espejo: true },
  ]),
  { tipo: "viga", id: "brazos", acabado: "carbono-wh", arriba: 0.92, abajo: 0.92, espejo: true, ruta: [...tramoBrazo(MZ, 0, 0.9, 1.5, 0.6), [MX * 1.1, 0, MZ * 1.1, 1.0, 0.6]] },
  { tipo: "viga", id: "brazos-2", acabado: "carbono-wh", arriba: 0.92, abajo: 0.92, espejo: true, ruta: [...tramoBrazo(-MZ, 0, 0.9, 1.5, 0.6), [MX * 1.1, 0, -MZ * 1.1, 1.0, 0.6]] },
  { tipo: "disco", id: "brazos-punta", acabado: "carbono-wh", en: [MX * 1.1, 0, MZ * 1.1], normal: [0, 1, 0], radio: 0.5, grosor: 0.6, espejo: true },
  { tipo: "disco", id: "brazos-2-punta", acabado: "carbono-wh", en: [MX * 1.1, 0, -MZ * 1.1], normal: [0, 1, 0], radio: 0.5, grosor: 0.6, espejo: true },
  // Dos tornillos de la sujeción de cada brazo, a la salida de las placas.
  ...([MZ, -MZ] as const).flatMap((z, i): Pieza[] => [-0.42, 0.42].map((d, k): Pieza => {
    const L = Math.hypot(MX, z), px = Math.abs(z) / L, pz = (-MX * Math.sign(z)) / L;
    return { tipo: "disco", id: `brazo-tornillo-${i}-${k}`, acabado: "aluminio", en: [MX * 0.2 + px * d, 0.32, z * 0.2 + pz * d], normal: [0, 1, 0], radio: 0.2, grosor: 0.07, espejo: true };
  })),
  // Bridas de los cables de los motores, cerca del cuerpo.
  { tipo: "viga", id: "bridas", acabado: "negro-ua", arriba: 0.92, abajo: 0.92, espejo: true, ruta: tramoBrazo(MZ, 0.3, 0.32, 1.72, 0.82) },
  { tipo: "viga", id: "bridas-2", acabado: "negro-ua", arriba: 0.92, abajo: 0.92, espejo: true, ruta: tramoBrazo(-MZ, 0.3, 0.32, 1.72, 0.82) },
  // Riostra de cada costado: pletina de carbono de canto, de cerca del motor
  // de detrás a medio brazo de delante, por debajo. En cada punta, una
  // abrazadera de TPU en dos mitades alrededor del brazo, con sus dos
  // tornillos, y la escuadra que baja hasta la pletina.
  { tipo: "viga", id: "riostras", acabado: "carbono-gris", arriba: 1, abajo: 1, espejo: true, ruta: [[MX * RIOSTRA[0], -0.95, -MZ * RIOSTRA[0], 0.32, 1.2], [MX * RIOSTRA[1], -0.95, MZ * RIOSTRA[1], 0.32, 1.2]] },
  ...([1, -1] as const).flatMap((s, k): Pieza[] => {
    const t = RIOSTRA[s > 0 ? 1 : 0], L = Math.hypot(MX, MZ), d: P3 = [MX / L, 0, (s * MZ) / L];
    const c = (y: number): P3 => [MX * t, y, s * MZ * t];
    return [
      ...aLosDosLados({ tipo: "caja", id: `abrazadera-${k}`, acabado: "negro-ua", centro: c(0.2), tam: [1.95, 0.5, 1.3], redondeo: 0.15, girar: { centro: c(0.2), eje: "y", grados: s * ANG_BRAZO } }),
      ...aLosDosLados({ tipo: "caja", id: `abrazadera-${k}-abajo`, acabado: "negro-ua", centro: c(-0.45), tam: [1.95, 0.4, 1.3], redondeo: 0.15, girar: { centro: c(-0.45), eje: "y", grados: s * ANG_BRAZO } }),
      ...aLosDosLados({ tipo: "caja", id: `abrazadera-${k}-escuadra`, acabado: "negro-ua", centro: c(-1.0), tam: [0.9, 1.0, 1.3], redondeo: 0.1, girar: { centro: c(-1.0), eje: "y", grados: s * ANG_BRAZO } }),
      ...[-0.38, 0.38].map((e, j): Pieza => ({ tipo: "disco", id: `abrazadera-${k}-tornillo-${j}`, acabado: "aluminio", en: [MX * t + d[0] * e, 0.47, s * MZ * t + d[2] * e], normal: [0, 1, 0], radio: 0.17, grosor: 0.06, espejo: true })),
    ];
  }),
  // Los tres cables de cada motor, en un mazo plano pegado bajo el brazo.
  ...([MZ, -MZ] as const).map((z, k): Pieza => ({ tipo: "codo", id: k ? "cable-motor-2" : "cable-motor", acabado: "negro-ua", espejo: true, puntos: [[MX * 0.12, -0.36, z * 0.12, 0.34, 0.07], [MX * 0.5, -0.37, z * 0.5, 0.34, 0.07], [MX * 0.86, -0.37, z * 0.86, 0.34, 0.07], [MX * 0.93, -0.15, z * 0.93, 0.3, 0.1]] })),

  // --- Electrónica entre las placas: la pila de control y motores y el
  // condensador del costado izquierdo, con sus anillos claros.
  { tipo: "caja", id: "pila", acabado: "negro-ua", centro: [0, 1.35, -1.5], tam: [2.6, 2.0, 5.2], redondeo: 0.2 },
  // Las dos placas de la pila (variadores abajo, controlador arriba) con sus
  // conectores blancos asomando al costado y el cable plano entre ellas.
  { tipo: "caja", id: "pila-esc", acabado: "carbono-gris", centro: [0, 0.55, -1.5], tam: [3.0, 0.16, 5.6], redondeo: 0.15 },
  { tipo: "caja", id: "pila-fc", acabado: "carbono-gris", centro: [0, 2.15, -1.5], tam: [2.9, 0.16, 3.4], redondeo: 0.15 },
  ...[-2.6, -1.6, -0.4].map((z, k): Pieza => ({ tipo: "caja", id: `conector-${k}`, acabado: "hueso", centro: [1.55, 2.38, z], tam: [0.5, 0.42, 0.7], redondeo: 0.04, espejo: true })),
  { tipo: "caja", id: "pila-cinta", acabado: "negro-ua", centro: [-1.25, 1.35, 0.6], tam: [0.08, 1.6, 0.9] },
  // Componentes: el procesador y el giróscopo del controlador, su LED, los
  // ocho transistores de los variadores y los cables de potencia del XT60.
  { tipo: "caja", id: "electronica-procesador", acabado: "negro", centro: [0, 2.28, -1.9], tam: [0.9, 0.12, 0.9] },
  { tipo: "caja", id: "electronica-giroscopo", acabado: "negro", centro: [0.75, 2.26, -0.6], tam: [0.4, 0.1, 0.4] },
  { tipo: "disco", id: "electronica-led", acabado: "rojo-vivo", en: [-0.9, 2.25, -0.4], normal: [0, 1, 0], radio: 0.1, grosor: 0.06 },
  ...[-3.4, -2.2, -0.8, 0.4].map((z, k): Pieza => ({ tipo: "caja", id: `electronica-transistor-${k}`, acabado: "negro", centro: [1.05, 0.7, z], tam: [0.55, 0.14, 0.5], espejo: true })),
  { tipo: "codo", id: "electronica-potencia-rojo", acabado: "rojo-vivo", puntos: [[-1.2, 2.0, -5.2, 0.2], [-1.1, 1.2, -4.6, 0.2], [-0.8, 0.75, -4.1, 0.2]] },
  { tipo: "codo", id: "electronica-potencia-negro", acabado: "negro-ua", puntos: [[-1.6, 1.9, -4.9, 0.2], [-1.5, 1.1, -4.3, 0.2], [-1.2, 0.75, -3.9, 0.2]] },
  { tipo: "varilla", id: "condensador", acabado: "negro-ua", desde: [2.3, 1.0, -3.2], hasta: [2.3, 1.0, 2.6], radio: 0.6, lados: 20 },
  ...[-2.4, -1.0, 0.4, 1.8].map((z, k): Pieza => ({ tipo: "disco", id: `condensador-anillo-${k}`, acabado: "aluminio", en: [2.3, 1.0, z], normal: [0, 0, 1], radio: 0.63, grosor: 0.14 })),
  { tipo: "codo", id: "condensador-patas", acabado: "rojo-vivo", puntos: [[2.3, 1.0, 2.6, 0.08], [2.25, 1.0, 3.2, 0.08], [1.6, 0.8, 3.4, 0.08]] },

  // --- Cámara delante, entre las placas, en su soporte de TPU y mirando
  // 20° arriba.
  { tipo: "caja", id: "soporte-camara", acabado: "negro-ua", centro: [1.22, 1.45, 10.9], tam: [0.36, 2.9, 2.8], redondeo: 0.3, espejo: true },
  // La jaula de TPU: travesaño de abajo y visera sobre el objetivo.
  { tipo: "caja", id: "soporte-camara-abajo", acabado: "negro-ua", centro: [0, 0.18, 10.9], tam: [2.8, 0.36, 2.4], redondeo: 0.2 },
  { tipo: "caja", id: "soporte-camara-visera", acabado: "negro-ua", centro: [0, 2.72, 12.0], tam: [2.4, 0.22, 1.1], redondeo: 0.1, girar: { centro: [0, 2.72, 12.0], eje: "x", grados: -20 } },
  { tipo: "disco", id: "camara-tornillo", acabado: "aluminio", en: [1.42, 1.45, 10.9], normal: [1, 0, 0], radio: 0.24, grosor: 0.06, espejo: true },
  { tipo: "disco", id: "camara-tornillo-hueco", acabado: "hueco", en: [1.45, 1.45, 10.9], normal: [1, 0, 0], radio: 0.1, grosor: 0.02, espejo: true },
  { tipo: "codo", id: "camara-cable", acabado: "negro-ua", puntos: [[0.4, 1.6, 9.9, 0.12], [0.6, 1.9, 8.8, 0.12], [0.5, 2.0, 7.0, 0.12], [0.3, 1.9, 1.2, 0.12]] },
  { tipo: "caja", id: "camara", acabado: "negro-ua", centro: [0, 1.45, 10.9], tam: [1.95, 1.95, 1.95], redondeo: 0.15, girar: { centro: [0, 1.45, 10.9], eje: "x", grados: -20 } },
  { tipo: "varilla", id: "camara-objetivo", acabado: "negro-ua", desde: [0, 1.45 + 0.34 * 0.95, 10.9 + 0.94 * 0.95], hasta: [0, 1.45 + 0.34 * 1.85, 10.9 + 0.94 * 1.85], radio: 0.72, lados: 24 },
  { tipo: "varilla", id: "camara-objetivo-rosca", acabado: "negro", desde: [0, 1.45 + 0.34 * 1.2, 10.9 + 0.94 * 1.2], hasta: [0, 1.45 + 0.34 * 1.45, 10.9 + 0.94 * 1.45], radio: 0.78, lados: 24 },
  { tipo: "disco", id: "camara-aro", acabado: "metal", en: [0, 1.45 + 0.34 * 1.86, 10.9 + 0.94 * 1.86], normal: [0, 0.34, 0.94], radio: 0.62, grosor: 0.05 },
  // El frontal de la cámara, de aluminio oscuro, y el marco de la jaula
  // alrededor (travesaños arriba y abajo).
  { tipo: "caja", id: "camara-frente", acabado: "campana-wh", centro: [0, 1.45 + 0.34 * 0.98, 10.9 + 0.94 * 0.98], tam: [1.9, 1.9, 0.12], redondeo: 0.12, girar: { centro: [0, 1.45 + 0.34 * 0.98, 10.9 + 0.94 * 0.98], eje: "x", grados: -20 } },
  ...[2.55, 0.35].map((y, k): Pieza => ({ tipo: "caja", id: `soporte-camara-marco-${k}`, acabado: "negro-ua", centro: [0, y + 0.2, 12.05 - k * 0.35], tam: [2.7, 0.32, 0.4], redondeo: 0.12, girar: { centro: [0, y + 0.2, 12.05 - k * 0.35], eje: "x", grados: -20 } })),
  { tipo: "disco", id: "camara-cristal", acabado: "lente", en: [0, 1.45 + 0.34 * 1.88, 10.9 + 0.94 * 1.88], normal: [0, 0.34, 0.94], radio: 0.48, grosor: 0.04 },

  // --- Mástil de antenas (la cola): pletina de carbono de canto con tres
  // agujeros de aligerado, sujeta entre las placas por una pieza de TPU con
  // dos tornillos. Lleva el transmisor de vídeo en su caja con aletas y la
  // antena de vídeo por un costado, bridas con su cierre a uno y otro lado,
  // etiquetas blancas y, en la punta, el receptor con su mástil corto y las
  // dos antenas en V.
  { tipo: "viga", id: "mastil", acabado: "carbono-wh", arriba: 1, abajo: 1, ruta: [[...MASTIL_PIE, 0.4, 1.7], [...MASTIL_PUNTA, 0.4, 1.0]] },
  { tipo: "caja", id: "mastil-pie", acabado: "negro-ua", centro: enMastil(1.4, 0), tam: [1.3, 2.4, 2.8], redondeo: 0.3, girar: { centro: enMastil(1.4, 0), eje: "x", grados: MASTIL_ANG } },
  { tipo: "disco", id: "mastil-pie-tornillo", acabado: "aluminio", en: enMastil(1.4, 0, 0.66), normal: [1, 0, 0], radio: 0.2, grosor: 0.06, espejo: true },
  { tipo: "caja", id: "vtx", acabado: "negro", centro: enMastil(5, 0.75), tam: [2.2, 0.8, 3.0], redondeo: 0.15, girar: { centro: enMastil(5, 0.75), eje: "x", grados: MASTIL_ANG } },
  ...[-0.6, 0, 0.6].map((x, k): Pieza => ({ tipo: "caja", id: `vtx-aleta-${k}`, acabado: "metal", centro: enMastil(5, 1.25, x), tam: [0.14, 0.25, 2.6], girar: { centro: enMastil(5, 1.25, x), eje: "x", grados: MASTIL_ANG } })),
  { tipo: "varilla", id: "vtx-conector", acabado: "laton", desde: enMastil(5.6, 0.7, 0.6), hasta: enMastil(5.6, 0.7, 1.15), radio: 0.2, lados: 6 },
  { tipo: "codo", id: "antena-video", acabado: "negro-ua", puntos: [[...enMastil(5.6, 0.7, 1.15), 0.13], [...enMastil(7, 1.4, 1.6), 0.13], [...enMastil(10, 2.4, 1.7), 0.13], [...enMastil(13, 2.6, 1.5), 0.13], [...enMastil(15, 2.1, 1.3), 0.13]] },
  { tipo: "varilla", id: "antena-video-punta", acabado: "negro-ua", desde: enMastil(15, 2.1, 1.3), hasta: enMastil(16.8, 2.4, 1.3), radio: 0.3, lados: 12 },
  { tipo: "varilla", id: "antena-video-latigo", acabado: "negro-ua", desde: enMastil(16.8, 2.4, 1.3), hasta: enMastil(19.0, 2.75, 1.3), radio: 0.07, lados: 8 },
  { tipo: "caja", id: "antena-video-soporte", acabado: "negro-ua", centro: enMastil(14.5, 1.1, 0.7), tam: [1.4, 0.3, 0.6], girar: { centro: enMastil(14.5, 1.1, 0.7), eje: "x", grados: MASTIL_ANG } },
  { tipo: "caja", id: "receptor", acabado: "negro-ua", centro: enMastil(16.6, 0.75), tam: [1.3, 0.7, 1.8], redondeo: 0.12, girar: { centro: enMastil(16.6, 0.75), eje: "x", grados: MASTIL_ANG } },
  { tipo: "disco", id: "receptor-led", acabado: "azul", en: enMastil(16.1, 1.12, 0.3), normal: MN, radio: 0.09, grosor: 0.03 },
  { tipo: "varilla", id: "antenas-receptor-pie", acabado: "negro-ua", desde: enMastil(17.4, 0.75), hasta: enMastil(19.0, 0.9), radio: 0.16, lados: 10 },
  { tipo: "varilla", id: "antenas-receptor", acabado: "negro-ua", desde: enMastil(19.0, 0.9, 0.1), hasta: enMastil(21.2, 1.3, 1.7), radio: 0.08, espejo: true },
  { tipo: "varilla", id: "antenas-receptor-punta", acabado: "negro-ua", desde: enMastil(20.4, 1.15, 1.1), hasta: enMastil(21.3, 1.32, 1.78), radio: 0.17, lados: 10, espejo: true },
  ...[2.9, 7.4, 9.8, 12.4, 15.2].flatMap((s, k): Pieza[] => [
    { tipo: "viga", id: `mastil-brida-${k}`, acabado: "negro-ua", arriba: 1, abajo: 1, ruta: [[...enMastil(s), 0.62, 1.9 - s * 0.045], [...enMastil(s + 0.35), 0.62, 1.9 - s * 0.045]] },
    { tipo: "caja", id: `mastil-brida-${k}-cierre`, acabado: "negro-ua", centro: enMastil(s + 0.18, 0, k % 2 ? 0.45 : -0.45), tam: [0.35, 0.5, 0.42], girar: { centro: enMastil(s + 0.18, 0, k % 2 ? 0.45 : -0.45), eje: "x", grados: MASTIL_ANG } },
  ]),

  // --- XT60 en el costado derecho de la cola, enchufado al de la batería,
  // con sus cables rojo y negro.
  { tipo: "caja", id: "xt60", acabado: "amarillo", centro: [-2.35, 3.75, -8.3], tam: [1.2, 0.85, 1.7], redondeo: 0.12 },
  { tipo: "caja", id: "xt60-bateria", acabado: "amarillo", centro: [-2.35, 3.75, -10.0], tam: [1.26, 0.9, 1.7], redondeo: 0.12 },
  // Las aletas de agarre de los costados de cada XT60.
  ...[-8.0, -8.6, -9.7, -10.3].map((z, k): Pieza => ({ tipo: "caja", id: `xt60-agarre-${k}`, acabado: "amarillo", centro: [-2.35, 3.75, z], tam: [1.36, 0.6, 0.14] })),
  { tipo: "caja", id: "xt60-funda", acabado: "negro-ua", centro: [-2.35, 3.75, -11.0], tam: [1.1, 0.6, 0.5], redondeo: 0.1 },
  { tipo: "codo", id: "cable-rojo", acabado: "rojo-vivo", puntos: [[-2.05, 3.75, -7.4, 0.22], [-2.1, 3.4, -6.6, 0.22], [-2.0, 2.5, -5.9, 0.22], [-1.2, 2.0, -5.2, 0.22]] },
  { tipo: "codo", id: "cable-negro", acabado: "negro-ua", puntos: [[-2.65, 3.75, -7.4, 0.22], [-2.7, 3.3, -6.5, 0.22], [-2.5, 2.4, -5.6, 0.22], [-1.6, 1.9, -4.9, 0.22]] },
  { tipo: "codo", id: "cable-rojo-bateria", acabado: "rojo-vivo", puntos: [[-2.05, 3.75, -10.8, 0.24], [-2.05, 4.3, -11.8, 0.24], [-2.0, 5.6, -11.4, 0.24], [-2.3, 6.1, -9.0, 0.24], [-2.2, 5.9, -7.0, 0.24]] },
  { tipo: "codo", id: "cable-negro-bateria", acabado: "negro-ua", puntos: [[-2.65, 3.75, -10.8, 0.24], [-2.65, 4.4, -12.0, 0.24], [-2.55, 5.2, -11.6, 0.24], [-2.9, 5.5, -9.0, 0.24], [-2.8, 5.2, -7.0, 0.24]] },

  // --- Batería de iones de litio 6s3p sobre la placa de arriba, con dos
  // correas y sus hebillas.
  { tipo: "caja", id: "bateria-alfombrilla", acabado: "negro-ua", centro: [0, Y_TECHO + 0.07, 0], tam: [3.6, 0.14, 13.2], redondeo: 0.3 },
  { tipo: "caja", id: "bateria", acabado: "amarillo-wh", centro: [0, Y_TECHO + 2.4, 0], tam: [6.8, 4.6, 14], redondeo: 0.7 },
  // Cable de balanceo: siete hilos finos a un conector blanco, metido bajo la
  // correa de detrás.
  { tipo: "codo", id: "bateria-balanceo", acabado: "negro-ua", puntos: [[1.6, Y_TECHO + 3.4, -7.05, 0.28, 0.12], [1.7, Y_TECHO + 4.4, -7.6, 0.28, 0.12], [1.6, Y_TECHO + 4.95, -6.4, 0.28, 0.12], [1.5, Y_TECHO + 4.95, -4.9, 0.28, 0.12]] },
  { tipo: "caja", id: "bateria-balanceo-conector", acabado: "hueso", centro: [1.5, Y_TECHO + 5.05, -2.0], tam: [1.9, 0.5, 0.6], redondeo: 0.05 },
  { tipo: "caja", id: "bateria-salida", acabado: "negro-ua", centro: [-2.35, Y_TECHO + 3.0, -7.15], tam: [1.5, 0.9, 0.35], redondeo: 0.15 },
  ...[-3.6, 3.6].flatMap((z, k): Pieza[] => [
    { tipo: "caja", id: `correa-${k}`, acabado: "negro-ua", centro: [0, Y_TECHO + 2.4, z], tam: [6.95, 4.76, 2.0], redondeo: 0.75 },
    // Hebilla de escalera: dos largueros y tres travesaños.
    ...[-1.05, 1.05].map((e, j): Pieza => ({ tipo: "caja", id: `hebilla-${k}-larguero-${j}`, acabado: "metal", centro: [1.1, Y_TECHO + 4.84, z + e], tam: [1.3, 0.16, 0.16], redondeo: 0.05 })),
    ...[0.5, 1.1, 1.7].map((x, j): Pieza => ({ tipo: "caja", id: `hebilla-${k}-${j}`, acabado: "metal", centro: [x, Y_TECHO + 4.84, z], tam: [0.16, 0.16, 2.26], redondeo: 0.05 })),
    // El rabo de la correa que sobra, doblado sobre la batería.
    { tipo: "caja", id: `correa-${k}-rabo`, acabado: "negro-ua", centro: [-0.6, Y_TECHO + 4.84, z], tam: [2.6, 0.14, 1.96], redondeo: 0.06 },
  ]),

  // --- Motores y hélices tripala de 10 pulgadas.
  ...motor("motores", MZ),
  ...motor("motores-2", -MZ),
  { tipo: "helice", id: "helices", acabado: "helice-wh", eje: "y", espejo: true, en: [MX, 3.76, MZ], radio: 12.7, palas: 3, ancho: 2.4, forma: PALA, paso: 0.3, buje: 0, giro: 15 },
  { tipo: "helice", id: "helices-2", acabado: "helice-wh", eje: "y", espejo: true, inversa: true, en: [MX, 3.76, -MZ], radio: 12.7, palas: 3, ancho: 2.4, forma: PALA, paso: 0.3, buje: 0, giro: 75 },

  // --- Muelles de impacto bajo los brazos de delante.
  // Abrazadera en dos mitades alrededor del brazo, con dos tornillos.
  ...aLosDosLados({ tipo: "caja", id: "muelle-abrazadera", acabado: "negro-ua", centro: [POSTE[0], 0.2, POSTE[2]], tam: [2.0, 0.5, 1.6], redondeo: 0.15, girar: { centro: [POSTE[0], 0.2, POSTE[2]], eje: "y", grados: ANG_BRAZO } }),
  ...aLosDosLados({ tipo: "caja", id: "muelle-abrazadera-abajo", acabado: "negro-ua", centro: [POSTE[0], -0.5, POSTE[2]], tam: [2.0, 0.55, 1.6], redondeo: 0.15, girar: { centro: [POSTE[0], -0.5, POSTE[2]], eje: "y", grados: ANG_BRAZO } }),
  ...[-0.45, 0.45].map((e, j): Pieza => {
    const L = Math.hypot(MX, MZ);
    return { tipo: "disco", id: `muelle-abrazadera-tornillo-${j}`, acabado: "aluminio", en: [POSTE[0] + (MX / L) * e, 0.47, POSTE[2] + (MZ / L) * e], normal: [0, 1, 0], radio: 0.17, grosor: 0.06, espejo: true };
  }),
  // Tuerca de seis lados donde el poste entra en la abrazadera.
  { tipo: "varilla", id: "muelle-tuerca", acabado: "negro", desde: masDir(POSTE, MUELLE_DIR, -0.1), hasta: masDir(POSTE, MUELLE_DIR, 0.45), radio: 0.85, lados: 6, espejo: true },
  // Los dos hilos del contacto, del pie del poste por debajo del brazo al cuerpo.
  { tipo: "codo", id: "muelle-hilos", acabado: "rojo-vivo", espejo: true, puntos: [[POSTE[0] - 0.3, -0.9, POSTE[2] - 0.5, 0.07], [POSTE[0] - 1.2, -0.62, POSTE[2] - 1.3, 0.07], [MX * 0.3, -0.5, MZ * 0.3, 0.07], [1.6, -0.62, 3.2, 0.07]] },
  { tipo: "varilla", id: "muelle-poste", acabado: "negro-ua", desde: POSTE, hasta: POSTE_PUNTA, radio: 0.65, lados: 20, espejo: true },
  ...[0.25, 0.55].map((f, k): Pieza => ({ tipo: "disco", id: `muelle-poste-anillo-${k}`, acabado: "negro", en: masDir(POSTE, MUELLE_DIR, POSTE_LARGO * f), normal: MUELLE_DIR, radio: 0.72, grosor: 0.22, espejo: true })),
  { tipo: "disco", id: "muelle-collar", acabado: "hueso", en: masDir(POSTE_PUNTA, MUELLE_DIR, -1.35), normal: MUELLE_DIR, radio: 1.08, grosor: 0.22, espejo: true },
  { tipo: "codo", id: "muelle", acabado: "muelle-wh", espejo: true, puntos: espiral(masDir(POSTE_PUNTA, MUELLE_DIR, -1.2), MUELLE_DIR, 0.95, 0.085, 5.6, 10) },
  { tipo: "varilla", id: "muelle-varilla", acabado: "aluminio", desde: masDir(POSTE_PUNTA, MUELLE_DIR, -0.2), hasta: masDir(POSTE_PUNTA, MUELLE_DIR, 14), radio: 0.06, lados: 8, espejo: true },
  { tipo: "varilla", id: "muelle-varilla-punta", acabado: "aluminio", desde: masDir(POSTE_PUNTA, MUELLE_DIR, 13.7), hasta: masDir(POSTE_PUNTA, MUELLE_DIR, 14.05), radio: 0.12, lados: 10, espejo: true },

  // --- Granada bajo el cuerpo, con la espoleta delante: nariz de plástico
  // pardo, cuerpo de aluminio con sus ranuras y aro de latón; ojiva verde,
  // banda de obturación de plástico verde, cono largo hasta donde iba la cola
  // y, en su lugar, un tapón negro impreso, sujeto con cinta amarilla, con el
  // detonador y sus dos cables.
  { tipo: "tubo", id: "espoleta", acabado: "pardo-gr", centro: [0, OJIVA_Y], perfil: perfilT([[0, 0], [1.5, 5.5], [4, 8.5], [10, 11.5], [20, 14.8], [32, 18], [44, 20.6], [48, 21.2]]) },
  { tipo: "tubo", id: "espoleta-cuerpo", acabado: "aluminio", centro: [0, OJIVA_Y], perfil: perfilT([[48, 21.6], [52, 22.6], [74, 22.8], [75, 22.4]]) },
  ...[0, 1, 2, 3].map((k): Pieza => ({ tipo: "caja", id: `espoleta-ranura-${k}`, acabado: "hueco", centro: [0, OJIVA_Y, zt(64)], tam: [0.5, 4.58, 1.2], girar: { centro: [0, OJIVA_Y, zt(64)], eje: "z", grados: k * 45 } })),
  { tipo: "tubo", id: "espoleta-aro", acabado: "laton", centro: [0, OJIVA_Y], perfil: perfilT([[74.5, 24.8], [79, 25.4]]) },
  { tipo: "tubo", id: "ojiva", acabado: "verde-gr", centro: [0, OJIVA_Y], perfil: perfilT([[78, 24.6], [80, 25], [92, 28.6], [104, 31.6], [118, 34.6], [134, 37], [150, 38.6], [168, 39.7], [186, 40.3], [201, 40.5], [221, 40.5], [240, 40.1], [262, 38.9], [290, 36.9], [320, 34.4], [350, 31.6], [380, 28.4], [405, 25.3], [428, 21.4], [430, 18]]) },
  { tipo: "tubo", id: "ojiva-banda", acabado: "obturador", centro: [0, OJIVA_Y], perfil: perfilT([[200, 40.6], [201.5, 41.2], [219.5, 41.2], [221, 40.6]]) },
  ...[205, 210, 215].map((t, k): Pieza => ({ tipo: "tubo", id: `ojiva-banda-surco-${k}`, acabado: "verde-gr", centro: [0, OJIVA_Y], perfil: perfilT([[t - 0.4, 41.25], [t + 0.4, 41.25]]) })),
  // Junta de la ojiva con el cuerpo, delante de la banda.
  { tipo: "tubo", id: "ojiva-junta", acabado: "verde-gr", centro: [0, OJIVA_Y], perfil: perfilT([[176, 40.25], [177, 40.4], [178.5, 40.4], [179.5, 40.25]]) },
  // Cinta amarilla de atrás, que sujeta el tapón, en dos vueltas.
  { tipo: "tubo", id: "ojiva-cinta", acabado: "amarillo-wh", centro: [0, OJIVA_Y], perfil: perfilT([[392, 27.5], [394, 27.4], [428, 21.9], [436, 21.3], [448, 20.9], [450, 20.4]]) },
  { tipo: "tubo", id: "ojiva-cinta-2", acabado: "amarillo-wh", centro: [0, OJIVA_Y], perfil: perfilT([[414, 24.4], [416, 24.4], [428, 22.3], [440, 21.6], [442, 21.2]]) },
  { tipo: "tubo", id: "ojiva-culote", acabado: "negro-ua", centro: [0, OJIVA_Y], perfil: perfilT([[428, 20.2], [450, 20.0], [456, 18.5], [460, 14]]) },
  { tipo: "tubo", id: "ojiva-tapon", acabado: "negro", centro: [0, OJIVA_Y], perfil: perfilT([[459, 7], [468, 7], [470, 5], [471, 0]]) },
  // Cables del detonador: suben por detrás de las placas, entran entre ellas
  // y acaban en un conector blanco sobre el controlador de vuelo.
  ...([[1, "rojo-vivo"], [-1, "negro-ua"]] as const).map(([x, acabado]): Pieza => ({ tipo: "codo", id: x > 0 ? "ojiva-cable-rojo" : "ojiva-cable-negro", acabado, puntos: [
    [x * 0.25, OJIVA_Y + 0.2, zt(470), 0.09], [x * 0.4, OJIVA_Y + 0.6, zt(482), 0.09], [x * 0.6, OJIVA_Y + 2.6, zt(486), 0.09], [x * 0.85, -1.6, -19.5, 0.09],
    [x * 0.9, -1.0, -14.5, 0.09], [x * 0.9, -0.85, -12.3, 0.09], [x * 0.9, 0.5, -12.0, 0.09], [x * 0.9, 1.4, -10.6, 0.09],
    [x * 0.8, 1.9, -7.0, 0.09], [x * 0.5, 2.25, -4.6, 0.09], [x * 0.18, 2.38, -3.45, 0.09],
  ] })),
  { tipo: "caja", id: "ojiva-conector", acabado: "hueso", centro: [0, 2.4, -3.0], tam: [0.95, 0.38, 0.7], redondeo: 0.04 },
];

// Agujeros de aligerado de la placa de arriba, en la textura del carbono.
const HUECO = "#0b0c0d";
const desdeArriba: P3 = [0, 1, 0.001];
const CALCAS: Calca[] = [
  { sobre: ["placa-arriba"], en: [0, Y_TECHO, 0], desde: desdeArriba, tam: [4.0, 23.6], dibujo: { tipo: "carbono" } },
  { sobre: ["placa-abajo"], en: [0, Y_ABAJO - GROSOR_PLACA / 2, 0], desde: [0, -1, 0.001], tam: [4.0, 23.6], dibujo: { tipo: "carbono" } },
  // El logo claro del costado de cada motor, mirando hacia fuera.
  ...[MZ, -MZ].map((z, k): Calca => {
    const L = Math.hypot(MX, z), d: P3 = [MX / L, 0, z / L];
    return { sobre: [k ? "motores-2-campana-baja" : "motores-campana-baja"], en: [MX + d[0] * 1.96, 1.5, z + d[2] * 1.96], desde: d, tam: [0.85, 0.85], espejo: true, dibujo: { tipo: "escudo", color: "#d6c99a" } };
  }),
  // Detrás, el triángulo con la punta hacia la cola.
  { sobre: ["placa-arriba"], en: [0, Y_TECHO, -8.6], desde: desdeArriba, tam: [2.2, 3.6], capa: 1, dibujo: { tipo: "poligono", color: HUECO, puntos: [[0.5, 0.05], [0.04, 0.95], [0.96, 0.95]] } },
  // En el centro, la celosía en X: cuatro triángulos.
  ...([
    [[0.16, 0.95], [0.84, 0.95], [0.5, 0.57]],
    [[0.16, 0.05], [0.5, 0.43], [0.84, 0.05]],
    [[0.06, 0.12], [0.06, 0.88], [0.4, 0.5]],
    [[0.94, 0.12], [0.6, 0.5], [0.94, 0.88]],
  ] as [number, number][][]).map((puntos): Calca => ({ sobre: ["placa-arriba"], en: [0, Y_TECHO, 0.2], desde: desdeArriba, tam: [2.7, 6.4], capa: 1, dibujo: { tipo: "poligono", color: HUECO, puntos } })),
  // Delante, la ranura larga.
  { sobre: ["placa-arriba"], en: [0, Y_TECHO, 6.9], desde: desdeArriba, tam: [1.0, 3.6], capa: 1, dibujo: { tipo: "poligono", color: HUECO, puntos: Array.from({ length: 20 }, (_, i): [number, number] => {
    const t = (i / 20) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    return [0.5 + 0.5 * c, 0.5 + (0.36 + 0.14 * Math.abs(s)) * Math.sign(s) * Math.abs(s) ** 0.3];
  }) } },
  // Etiqueta negra en cada costado de la batería, con sus líneas de texto
  // blancas (la de la foto del soldado).
  { sobre: ["bateria"], en: [3.4, Y_TECHO + 2.4, 0], desde: [1, 0, 0], tam: [6.4, 3.3], espejo: true, dibujo: { tipo: "rect", color: "#141414" } },
  ...[0.9, 0.4, -0.1].map((dy, k): Calca => ({ sobre: ["bateria"], en: [3.4, Y_TECHO + 2.4 + dy, k === 0 ? 0 : -0.6], desde: [1, 0, 0], tam: [k === 0 ? 4.6 : 3.4, 0.14], espejo: true, capa: 1, dibujo: { tipo: "rect", color: "#d8d8d2" } })),
  // Etiqueta blanca del transmisor de vídeo.
  { sobre: ["vtx"], en: enMastil(4.4, 1.2), desde: MN, tam: [1.4, 1.0], dibujo: { tipo: "rect", color: "#e8e8e2" } },
  // Agujeros de aligerado de la cola y sus dos etiquetas blancas.
  ...[8.6, 11.1, 13.6].map((s): Calca => ({ sobre: ["mastil"], en: enMastil(s, 0, 0.2), desde: [1, 0, 0], tam: [0.62, 0.62], espejo: true, dibujo: { tipo: "disco", color: HUECO } })),
  { sobre: ["mastil"], en: enMastil(6.6, 0, 0.2), desde: [1, 0, 0], tam: [0.9, 0.75], dibujo: { tipo: "rect", color: "#e8e8e2" } },
  { sobre: ["mastil"], en: enMastil(10.0, -0.3, -0.2), desde: [-1, 0, 0], tam: [0.8, 0.6], dibujo: { tipo: "rect", color: "#e8e8e2" } },
  // Rótulos de la granada, en un costado: en amarillo sobre el cono de atrás,
  // el calibre, el explosivo y el modelo; en blanco, el aviso de la ojiva.
  ...([["81MM", 0.95, 3.2, 0.85], ["COMP B", 0, 3.2, 0.75], ["CRTG-M821", -0.85, 4.2, 0.62]] as const).map(([texto, dy, ancho, alto]): Calca => ({ sobre: ["ojiva"], en: [OJIVA_R, OJIVA_Y + dy, zt(300)], desde: [1, 0, 0], tam: [ancho, alto], dibujo: { tipo: "texto", texto, color: "#e0cf3c" } })),
  { sobre: ["ojiva"], en: [OJIVA_R, OJIVA_Y - 1.6, zt(305)], desde: [1, 0, 0], tam: [4.4, 0.32], dibujo: { tipo: "texto", texto: "AMMO LOT", color: "#e0cf3c", fino: true } },
  { sobre: ["ojiva"], en: [OJIVA_R, OJIVA_Y + 0.5, zt(150)], desde: [1, 0, 0], tam: [2.3, 0.45], dibujo: { tipo: "texto", texto: "-WARNING-", color: "#ecece6" } },
  ...[-0.05, -0.4].map((dy): Calca => ({ sobre: ["ojiva"], en: [OJIVA_R, OJIVA_Y + dy, zt(152)], desde: [1, 0, 0], tam: [3.0, 0.1], capa: 1, dibujo: { tipo: "rect", color: "#d8d8d2" } })),
  // Pegatina de la batería entre las correas, con su código de barras.
  { sobre: ["bateria"], en: [0, Y_TECHO + 4.7, 0], desde: desdeArriba, tam: [3.4, 2.6], dibujo: { tipo: "etiqueta", titulo: "6S3P" } },
];

const COSTURAS: Costura[] = [];

// Las piezas de una parte: las que se llaman así o empiezan así.
const ids = (...prefijos: string[]) => PIEZAS.map((q) => q.id).filter((id) => prefijos.some((x) => id === x || id.startsWith(`${x}-`)));

const PARTES = [
  {
    nombre: "Marco de carbono",
    en: [0, Y_TECHO, 1.5] as P3,
    piezas: ids("placa-arriba", "placa-abajo", "pila", "condensador", "conector", "columna", "tornillo", "electronica"),
    respaldo: "foto" as const,
    fuentes: ["arriba", "planta"],
    texto: "Dos placas de fibra de carbono con agujeros de aligerado (un triángulo detrás, una celosía en X sobre el cruce de los brazos y una ranura delante), unidas por columnas. Entre ellas van el controlador de vuelo y los variadores de los motores (55 A).",
  },
  {
    nombre: "Brazos y riostras",
    en: [MX * 0.74, -0.65, -1.2] as P3,
    piezas: ids("brazos", "brazo", "riostras", "abrazadera", "bridas", "cable-motor"),
    respaldo: "foto" as const,
    fuentes: ["arriba", "planta", "helices"],
    texto: "Brazos rectos de carbono en X. Una riostra en cada costado une el brazo de delante con el de detrás para que el marco no se tuerza con el peso de la carga.",
  },
  {
    nombre: "Motores y hélices",
    en: [MX, 4.0, MZ] as P3,
    piezas: ids("motores", "helices"),
    respaldo: "fabricante" as const,
    fuentes: ["ficha", "helices", "arriba"],
    texto: "Cuatro motores 3115 de 900 KV con hélices tripala de 10 pulgadas (25,4 cm). El bobinado rojo asoma por las ventanas de la campana.",
  },
  {
    nombre: "Cámara",
    en: [0, 2.2, 12.6] as P3,
    piezas: ids("camara", "soporte-camara"),
    respaldo: "foto" as const,
    fuentes: ["planta", "ficha"],
    texto: "Cámara FPV delante, entre las placas. De día va una analógica; para la noche, una térmica Caddx IRC-640CA o IRC-384CA.",
    nota: "El soporte y la inclinación (20° hacia arriba) se ven en la planta; el objetivo, de la cámara de día.",
  },
  {
    nombre: "Mástil de antenas",
    en: enMastil(12, 1.0),
    piezas: ids("mastil", "vtx", "antena-video", "receptor", "antenas-receptor"),
    respaldo: "foto" as const,
    fuentes: ["planta", "arriba"],
    texto: "Una barra de carbono sube hacia atrás con el transmisor de vídeo (2,5 W) y el receptor de mando en la punta, por encima de la batería y lejos de la ojiva. Con ellas llega a 30 km de ida.",
    nota: "Qué es cada caja del mástil no se distingue en las fotos: va donde suelen ir en estos FPV.",
  },
  {
    nombre: "Muelles de impacto",
    en: masDir(POSTE_PUNTA, MUELLE_DIR, 3),
    piezas: ids("muelle"),
    respaldo: "foto" as const,
    fuentes: ["planta", "arriba", "helices"],
    texto: "Dos postes bajo los brazos de delante, con un muelle y una varilla de acero que sobresalen por delante del dron. Al chocar, la varilla toca el muelle y cierra el circuito que hace estallar la carga.",
    nota: "La forma sale de las fotos; para qué sirven es una lectura nuestra: es el contacto de impacto de muchos FPV ucranianos.",
  },
  {
    nombre: "Batería",
    en: [0, Y_TECHO + 4.6, 3] as P3,
    piezas: ids("bateria", "correa", "hebilla", "xt60", "cable-rojo", "cable-negro"),
    respaldo: "reconstruccion" as const,
    fuentes: ["ficha", "ojiva"],
    texto: "Batería de iones de litio 6s3p (o 6s4p) para hasta 25 minutos de vuelo, atada encima con dos correas y enchufada al conector XT60 amarillo del costado.",
    nota: "Las fotos oficiales salen sin batería: el tamaño es el de un pack 6s3p de celdas 21700 y el color, el de la batería de la foto del soldado.",
  },
  {
    nombre: "Granada de mortero",
    en: [0, OJIVA_Y - OJIVA_R, 4] as P3,
    piezas: ids("ojiva", "espoleta"),
    respaldo: "foto" as const,
    fuentes: ["ojiva", "m821", "ficha"],
    texto: "Granada de mortero de 81 mm sin la cola: le quitan el tubo con las aletas y las cargas y cierran el hueco con un tapón impreso, sujeto con cinta. La espoleta va delante; el detonador del tapón se dispara desde el mando o al cerrarse los contactos de impacto, por dos cables que suben hasta el controlador de vuelo.",
    nota: "La forma, los colores y los rótulos son los de una granada de mortero M821 de 81 mm; el tapón y la cinta, de la foto del soldado. El fabricante solo dice que la carga óptima es de 2,5 kg; los cables del detonador no se ven en las fotos.",
  },
];

// De centímetros a unidades de la maqueta.
const u = (v: number) => v / 100 / ESCALA;
const u3 = ([a, b, c]: P3): P3 => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  const g = p.girar && { girar: { ...p.girar, centro: u3(p.girar.centro) } };
  switch (p.tipo) {
    case "viga":
      return { ...p, ...g, ruta: p.ruta.map((q) => q.map(u) as P5) };
    case "placa":
      if (p.plano !== "horizontal") throw new Error("Placa vertical sin convertir");
      return { ...p, ...g, planta: p.planta.map(([x, z]): [number, number] => [u(x), u(z)]), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "varilla":
      return { ...p, ...g, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "codo":
      return { ...p, ...g, puntos: p.puntos.map((q) => q.map(u) as [number, number, number, number]) };
    case "helice":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), ...(p.ancho && { ancho: u(p.ancho) }), ...(p.buje !== undefined && { buje: u(p.buje) }) };
    case "caja":
      return { ...p, ...g, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, ...g, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    case "tubo":
      return { ...p, ...g, perfil: p.perfil.map((q) => q.map(u) as [number, number]), ...(p.centro && { centro: [u(p.centro[0]), u(p.centro[1])] as [number, number] }) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};

const maqueta: Maqueta = {
  nombre: "Wild Hornets Strike",
  subtitulo: "Dron FPV de ataque",
  escala: ESCALA,  // 1 unidad = 25 cm (marco de 44 cm en diagonal, hélices de 10 pulgadas)
  pais: bandera("UA"),
  hd: true,
  // El verde de la granada al sol cae en 0,98 escalones de luz del pixel HD
  // (en el borde: salía a franjas y más claro) y la batería en 5,66:
  // corridos 0,6 hacia arriba, los dos quedan dentro de un escalón.
  desfaseLuz: 0.6,
  contornoPixel: true,
  vistaTarjeta: [30, 27],
  plantaLisa: true,
  plantaDoble: true,
  piezas: PIEZAS.map(aUnidades),
  detalles: {
    calcas: CALCAS.map((c) => ({ ...c, en: u3(c.en), tam: [u(c.tam[0]), u(c.tam[1])] })),
    costuras: COSTURAS.map((c) => ({ ...c, puntos: c.puntos.map(u3) })),
  },
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "planta", imagen: "wh-10inch_1.jpg", titulo: "De tres cuartos por delante, sin hélices", medio: "Wild Hornets", url: FICHA },
    { id: "helices", imagen: "wh-10inch_2.jpg", titulo: "En perspectiva, con las hélices", medio: "Wild Hornets", url: FICHA },
    { id: "arriba", imagen: "wh-10inch_4.jpg", titulo: "Desde arriba", medio: "Wild Hornets", url: FICHA },
    { id: "negro", imagen: "wh-bg_10_analog_full.jpg", titulo: "Sobre fondo negro", medio: "Wild Hornets", url: FICHA },
    { id: "ojiva", imagen: "dronexl-soldado-ojiva.jpg", titulo: "Un FPV de Wild Hornets en vuelo con la ojiva atada debajo (53.ª Brigada, 2023)", medio: "DroneXL", url: "https://cdn.dronexl.co/wp-content/uploads/2024/02/img_0615.jpg" },
    { id: "m821", imagen: "m821.jpg", titulo: "Granada de mortero M821 de 81 mm, con su cola", medio: "CAT-UXO", url: "https://cat-uxo.com/" },
    { id: "ficha", titulo: "Ficha del FPV de 10 pulgadas (analógico)", medio: "Wild Hornets", url: FICHA },
  ],
};

export default maqueta;
