// Maqueta del Queen Hornet de 17 pulgadas, sacada de las tres imágenes
// oficiales de Wild Hornets (desde arriba, de lado y de tres cuartos; sin
// hélices ni baterías) y de la foto del soldado con las hélices puestas. El
// fabricante no da medidas del marco: la escala sale de las hélices de 17
// pulgadas (43,2 cm), con los motores en un cuadrado de 55 cm. Las dos
// baterías, encima y en fila como en las fotos de 2024; la carga, una granada
// de mortero M821 de 81 mm tumbada bajo la panza. 1 unidad = 40 cm.
import type { Calca, Costura, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const FICHA = "https://wildhornets.com/en/queen-hornet-17-inch-fpv-drone";

// Todo en centímetros: x hacia la izquierda del dron de verdad (la maqueta va
// en espejo), y arriba desde el centro de los brazos, z hacia delante desde
// el cruce de los brazos. Al final se pasa a unidades (1 = 40 cm).
const ESCALA = 0.4;

type P3 = [number, number, number];
type P5 = [number, number, number, number, number];

// Ejes de los motores: en un cuadrado de 55 cm (planta).
const MX = 27.5, MZ = 27.5;
// Los cuatro brazos: [lado x, lado z].
const BRAZOS: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
// Brazos de aluminio de sección rectangular.
const BRAZO_ANCHO = 3.4, BRAZO_ALTO = 2.0;
// Un punto a lo largo de un brazo (t, fracción desde el centro) y su ángulo
// visto desde arriba, desde el eje z.
const enBrazo = ([sx, sz]: [number, number], t: number, y: number): P3 => [sx * MX * t, y, sz * MZ * t];
const angBrazo = ([sx, sz]: [number, number]) => (Math.atan2(sx, sz) * 180) / Math.PI;
const nombreBrazo = ([sx, sz]: [number, number]) => `${sz > 0 ? "d" : "t"}${sx > 0 ? "i" : "d"}`;

// Cuerpo: el cubo donde se cruzan los brazos, la caja de la electrónica
// encima y la placa de arriba, de 27,7 x 11,7 cm (de z +11,3 a −16,4).
const Y_CAJA = 1.6, Y_PLACA = 4.1, GROSOR_PLACA = 0.4;
const Y_TECHO = Y_PLACA + GROSOR_PLACA / 2;
const PLACA_DELANTE = 11.3, PLACA_DETRAS = -16.4;
const PLANTA_PLACA: [number, number][] = [
  [0, PLACA_DETRAS], [4.9, PLACA_DETRAS], [5.85, -15.4], [5.85, 10.3], [4.9, PLACA_DELANTE], [0, PLACA_DELANTE],
];

// Mástil de antenas: sale de la cola de la placa y sube hacia atrás.
const MASTIL_PIE: P3 = [0, Y_TECHO + 0.6, -15.6];
const MASTIL_ANG = 12, MASTIL_LARGO = 12;
const MD: P3 = [0, Math.cos((MASTIL_ANG * Math.PI) / 180), -Math.sin((MASTIL_ANG * Math.PI) / 180)];
const MN: P3 = [0, -MD[2], MD[1]];
const enMastil = (s: number, h = 0, x = 0): P3 => [x, MASTIL_PIE[1] + MD[1] * s - MN[1] * h, MASTIL_PIE[2] + MD[2] * s - MN[2] * h];
const MASTIL_PUNTA = enMastil(MASTIL_LARGO);

// Caja de suelta bajo el cubo y la granada colgada de ella con un lazo.
const Y_SUELTA_ABAJO = -10.0;
// Granada de mortero M821 de 81 mm, medida en la foto de CAT-UXO (diámetro
// mayor = 81 mm): a lo largo del eje desde la punta de la espoleta (t, mm) y
// el radio (mm). El centro de gravedad, bajo el cruce de los brazos.
const OJIVA_R = 4.05;
const Z_NARIZ = 16.5;
const zt = (t: number) => Z_NARIZ - t / 10;
const perfilT = (q: [number, number][]): [number, number][] => q.map(([t, r]) => [zt(t), r / 10]);
const OJIVA_Y = Y_SUELTA_ABAJO - 0.25 - OJIVA_R;

// Motor 4320, como los del Strike pero negro (foto de lado): asiento sobre
// el brazo con sus cuatro tornillos por debajo, campana negra lisa abajo
// (donde va el rótulo) y con seis ventanas grandes arriba del costado y ocho
// radios en la tapa, las dos dejando ver el bobinado naranja; eje largo,
// cubo de la hélice, arandela y tuerca autoblocante.
const Y_MOTOR = BRAZO_ALTO / 2;
const motor = (b: [number, number]): Pieza[] => {
  const id = `motor-${nombreBrazo(b)}`;
  const c = (y: number): P3 => enBrazo(b, 1, Y_MOTOR + y);
  const radial = (r: number, f: number, y: number): P3 => { const p = c(y), a = (f * Math.PI) / 180; return [p[0] + r * Math.sin(a), p[1], p[2] + r * Math.cos(a)]; };
  return [
    { tipo: "disco", id: `${id}-asiento`, acabado: "anodizado-qh", en: c(0.25), normal: [0, 1, 0], radio: 2.7, grosor: 0.5 },
    ...[45, 135, 225, 315].map((f, k): Pieza => {
      const p = radial(1.6, f, 0);
      return { tipo: "disco", id: `${id}-tornillo-${k}`, acabado: "aluminio", en: [p[0], -BRAZO_ALTO / 2 - 0.03, p[2]], normal: [0, -1, 0], radio: 0.22, grosor: 0.06 };
    }),
    { tipo: "varilla", id: `${id}-base`, acabado: "anodizado-qh", desde: c(0.5), hasta: c(0.9), radio: 2.45, lados: 40 },
    { tipo: "varilla", id: `${id}-cobre`, acabado: "cobre-wh", desde: c(0.9), hasta: c(3.85), radio: 2.38, lados: 32 },
    { tipo: "varilla", id: `${id}-campana`, acabado: "anodizado-qh", desde: c(0.9), hasta: c(2.55), radio: 2.58, lados: 40 },
    // Pilares de la campana entre las seis ventanas.
    ...Array.from({ length: 6 }, (_, k): Pieza => {
      const f = k * 60 + 30, centro = radial(2.47, f, 3.05);
      return { tipo: "caja", id: `${id}-pilar-${k}`, acabado: "anodizado-qh", centro, tam: [0.85, 1.05, 0.24], girar: { centro, eje: "y", grados: f } };
    }),
    { tipo: "varilla", id: `${id}-campana-aro`, acabado: "anodizado-qh", desde: c(3.55), hasta: c(3.8), radio: 2.58, lados: 40 },
    // La tapa: el bobinado asoma entre ocho radios.
    { tipo: "disco", id: `${id}-tapa-cobre`, acabado: "cobre-wh", en: c(3.82), normal: [0, 1, 0], radio: 2.2, grosor: 0.04 },
    ...Array.from({ length: 8 }, (_, k): Pieza => {
      const f = k * 45, centro = radial(1.45, f, 3.86);
      return { tipo: "caja", id: `${id}-radio-${k}`, acabado: "anodizado-qh", centro, tam: [0.4, 0.12, 2.2], girar: { centro, eje: "y", grados: f } };
    }),
    { tipo: "disco", id: `${id}-buje`, acabado: "anodizado-qh", en: c(3.9), normal: [0, 1, 0], radio: 0.95, grosor: 0.14 },
    { tipo: "varilla", id: `${id}-eje`, acabado: "aluminio", desde: c(3.8), hasta: c(6.3), radio: 0.4, lados: 16 },
    // Cubo de la hélice, arandela y tuerca de seis lados con su nailon arriba.
    { tipo: "varilla", id: `${id}-cubo`, acabado: "helice-wh", desde: c(4.4), hasta: c(5.3), radio: 1.3, lados: 28 },
    { tipo: "disco", id: `${id}-arandela`, acabado: "aluminio", en: c(5.36), normal: [0, 1, 0], radio: 0.85, grosor: 0.1 },
    { tipo: "varilla", id: `${id}-tuerca`, acabado: "aluminio", desde: c(5.4), hasta: c(6.0), radio: 0.66, lados: 6 },
    { tipo: "varilla", id: `${id}-nailon`, acabado: "negro-ua", desde: c(6.0), hasta: c(6.25), radio: 0.52, lados: 16 },
  ];
};
const Y_HELICE = Y_MOTOR + 4.85;

// Planta de las palas de 17 pulgadas (foto del soldado): raíz estrecha, lo
// más ancho a un cuarto y una punta larga y afilada.
const PALA: [number, number, number][] = [[0.06, 0.32, 0.3], [0.16, 0.5, 0.44], [0.3, 0.5, 0.4], [0.5, 0.42, 0.33], [0.72, 0.32, 0.24], [0.9, 0.2, 0.13], [1, 0.05, 0.02]];

// Pata de cada brazo: una pletina curva de canto, a lo largo del brazo,
// que baja desde su abrazadera y acaba en un pie que se abre hacia fuera
// (vista de lado). Contorno [a lo largo del brazo, y].
const PATA_T = 0.72;
const PATA: [number, number][] = [[-2.5, -0.9], [2.5, -0.9], [2.3, -4], [1.8, -7.6], [2.8, -9.6], [3.8, -10.3], [3.3, -10.8], [0.2, -10.8], [-1.4, -9.8], [-2.1, -7], [-2.3, -4]];

const brazo = (b: [number, number]): Pieza[] => {
  const n = nombreBrazo(b), ang = angBrazo(b);
  const L = Math.hypot(MX, MZ);
  const pata = enBrazo(b, PATA_T, 0), esc = enBrazo(b, 0.45, BRAZO_ALTO / 2 + 0.55);
  const bisagra = enBrazo(b, 0.3, 0);
  const caja = (id: string, centro: P3, tam: P3, acabado: Pieza["acabado"], redondeo?: number): Pieza => ({ tipo: "caja", id, acabado, centro, tam, ...(redondeo && { redondeo }), girar: { centro, eje: "y", grados: ang } });
  return [
    { tipo: "viga", id: `brazo-${n}`, acabado: "anodizado-qh", arriba: 0.92, abajo: 0.92, ruta: [[...enBrazo(b, 0.12, 0), BRAZO_ANCHO, BRAZO_ALTO], [...enBrazo(b, 1, 0), BRAZO_ANCHO, BRAZO_ALTO], [...enBrazo(b, 1 + 2.4 / L, 0), BRAZO_ANCHO * 0.8, BRAZO_ALTO]] },
    { tipo: "disco", id: `brazo-${n}-punta`, acabado: "anodizado-qh", en: enBrazo(b, 1 + 2.4 / L, 0), normal: [0, 1, 0], radio: BRAZO_ANCHO * 0.4, grosor: BRAZO_ALTO },
    // Bisagra de plegado a la salida del cuerpo, con su pomo encima.
    caja(`brazo-${n}-bisagra`, bisagra, [4.4, 3.0, 4.6], "negro-ua", 0.5),
    { tipo: "varilla", id: `brazo-${n}-bisagra-pomo`, acabado: "negro-ua", desde: [bisagra[0], 1.4, bisagra[2]], hasta: [bisagra[0], 2.3, bisagra[2]], radio: 1.0, lados: 20 },
    // Variador de 80 A encima de cada brazo, con su etiqueta gris.
    caja(`variador-${n}`, esc, [3.0, 1.1, 6.2], "negro-ua", 0.3),
    // Abrazadera de la pata y su brida.
    caja(`pata-${n}-abrazadera`, enBrazo(b, PATA_T, 0), [4.4, 3.2, 5.0], "negro-ua", 0.35),
    caja(`pata-${n}-brida`, enBrazo(b, PATA_T, 0), [4.55, 3.35, 0.5], "negro", 0.1),
    // Dos tornillos encima de la abrazadera y de la bisagra, a lo largo del brazo.
    ...([[PATA_T, 1.6, "pata"], [0.3, 1.5, "bisagra"]] as const).flatMap(([t, y, q]) => [-1.6, 1.6].map((e, j): Pieza => {
      const p = enBrazo(b, t + e / L, y + 0.03);
      return { tipo: "disco", id: `${q}-${n}-tornillo-${j}`, acabado: "aluminio", en: p, normal: [0, 1, 0], radio: 0.22, grosor: 0.06 };
    })),
    { tipo: "placa", id: `pata-${n}`, acabado: "negro-ua", plano: "vertical", x: pata[0], grosor: 1.1, bisel: 0.25, planta: PATA.map(([s, y]): [number, number] => [pata[2] + s, y]), girar: { centro: pata, eje: "y", grados: ang } },
    // Los tres cables del motor, pegados bajo el brazo.
    { tipo: "codo", id: `brazo-${n}-cables`, acabado: "negro", puntos: [[...enBrazo(b, 0.2, -1.1), 0.5, 0.1], [...enBrazo(b, 0.66, -1.1), 0.5, 0.1], [...enBrazo(b, 0.95, -1.1), 0.5, 0.1], [...enBrazo(b, 0.99, 0.2), 0.4, 0.15]] },
    ...motor(b),
  ];
};

// Granada: perfil medido (t en mm desde la punta de la espoleta, radio en mm).
const PERFIL_OJIVA: [number, number][] = [[66, 24.4], [69, 24.8], [76, 28.3], [90, 33], [105, 36.6], [119, 38.7], [133, 39.8], [140, 40.3]];
const PERFIL_CUERPO: [number, number][] = [[163, 40.3], [184, 40.1], [205, 39.1], [227, 36.6], [248, 33], [270, 28.7], [291, 24.7], [313, 20.1], [334, 15.4], [343, 13.6]];
// Aletas: cuatro en X, contorno [z, distancia al eje].
const ALETA: [number, number][] = [[zt(452), 1.4], [zt(462), 3.6], [zt(497), 3.85], [zt(499), 3.6], [zt(499), 1.4]];

const PIEZAS: Pieza[] = [
  // --- Cuerpo: cubo de los brazos, caja de la electrónica y placa de arriba.
  { tipo: "pila", id: "cubo", acabado: "anodizado-qh", niveles: [
    { y: -1.4, planta: [[-4.6, -5.2], [4.6, -5.2], [4.6, 5.2], [-4.6, 5.2]] },
    { y: Y_CAJA, planta: [[-5.6, -9.0], [5.6, -9.0], [5.6, 9.0], [-5.6, 9.0]] },
  ] },
  { tipo: "caja", id: "caja-electronica", acabado: "anodizado-qh", centro: [0, (Y_CAJA + Y_PLACA - GROSOR_PLACA / 2) / 2, -2.6], tam: [10.4, Y_PLACA - GROSOR_PLACA / 2 - Y_CAJA, 25.6], redondeo: 0.6 },
  { tipo: "placa", id: "placa", acabado: "anodizado-qh", plano: "horizontal", y: Y_PLACA, grosor: GROSOR_PLACA, simetrica: true, bisel: 0.1, planta: PLANTA_PLACA },
  // Conectores de las baterías en los costados, a media placa, con sus pines.
  { tipo: "caja", id: "conector", acabado: "negro-ua", centro: [7.0, Y_PLACA - 0.3, -0.4], tam: [2.8, 2.2, 7.0], redondeo: 0.4, espejo: true },
  ...[-1.6, -0.4, 0.8].map((z, k): Pieza => ({ tipo: "disco", id: `conector-pin-${k}`, acabado: "laton", en: [7.0, Y_PLACA + 0.82, z], normal: [0, 1, 0], radio: 0.3, grosor: 0.06, espejo: true })),
  // Tornillos por el borde de la placa (foto de tres cuartos).
  ...([[4.9, 10.2], [5.2, 6.6], [5.2, 2.6], [5.2, -3.6], [5.2, -7.6], [5.2, -11.6], [4.9, -15.3], [1.6, 10.6], [1.6, -15.7]] as const).map(([x, z], k): Pieza => ({ tipo: "disco", id: `tornillo-${k}`, acabado: "aluminio", en: [x, Y_TECHO + 0.03, z], normal: [0, 1, 0], radio: 0.24, grosor: 0.06, espejo: true })),

  // --- Brazos plegables con sus variadores, patas y motores.
  ...BRAZOS.flatMap(brazo),
  { tipo: "helice", id: "helices", acabado: "helice-wh", eje: "y", espejo: true, en: [MX, Y_HELICE, MZ], radio: 21.6, palas: 3, ancho: 4.2, forma: PALA, paso: 0.3, buje: 0, giro: 20 },
  { tipo: "helice", id: "helices-2", acabado: "helice-wh", eje: "y", espejo: true, inversa: true, en: [MX, Y_HELICE, -MZ], radio: 21.6, palas: 3, ancho: 4.2, forma: PALA, paso: 0.3, buje: 0, giro: 70 },

  // --- Cámara delante: dos mejillas a los lados y, entre ellas, la cámara
  // en un barril que la inclina, con el objetivo mirando adelante.
  { tipo: "caja", id: "camara-mejilla", acabado: "negro-ua", centro: [3.3, 2.9, 16.2], tam: [1.2, 5.0, 8.4], redondeo: 0.5, espejo: true },
  { tipo: "caja", id: "camara-base", acabado: "negro-ua", centro: [0, 0.9, 15.0], tam: [7.8, 1.2, 7.4], redondeo: 0.4 },
  { tipo: "varilla", id: "camara-barril", acabado: "negro-ua", desde: [-2.7, 2.6, 17.6], hasta: [2.7, 2.6, 17.6], radio: 2.3, lados: 32 },
  { tipo: "caja", id: "camara", acabado: "negro", centro: [0, 2.6, 19.2], tam: [2.0, 2.0, 1.6], redondeo: 0.15 },
  // El frontal de aluminio oscuro, el objetivo con su rosca, el aro y el cristal.
  { tipo: "caja", id: "camara-frente", acabado: "campana-wh", centro: [0, 2.6, 20.02], tam: [1.95, 1.95, 0.12], redondeo: 0.12 },
  { tipo: "varilla", id: "camara-objetivo", acabado: "negro-ua", desde: [0, 2.6, 20.0], hasta: [0, 2.6, 20.9], radio: 0.72, lados: 24 },
  { tipo: "varilla", id: "camara-objetivo-rosca", acabado: "negro", desde: [0, 2.6, 20.25], hasta: [0, 2.6, 20.5], radio: 0.78, lados: 24 },
  { tipo: "disco", id: "camara-aro", acabado: "metal", en: [0, 2.6, 20.91], normal: [0, 0, 1], radio: 0.62, grosor: 0.05 },
  { tipo: "disco", id: "camara-cristal", acabado: "lente", en: [0, 2.6, 20.94], normal: [0, 0, 1], radio: 0.48, grosor: 0.04 },
  { tipo: "codo", id: "camara-cable", acabado: "negro-ua", puntos: [[0.5, 2.9, 18.4, 0.12], [0.7, 3.4, 17.0, 0.12], [0.6, 3.6, 14.0, 0.12], [0.4, 3.4, 11.6, 0.12]] },
  { tipo: "disco", id: "camara-tornillo", acabado: "naranja", en: [3.92, 2.6, 17.6], normal: [1, 0, 0], radio: 0.32, grosor: 0.05, espejo: true },

  // --- Baterías 6s4p, encima y en fila, como la del Strike: alfombrilla de
  // goma, dos correas con hebilla de escalera y el rabo doblado encima, cable
  // de balanceo con su conector blanco y cables de potencia rojo y negro al
  // conector del costado.
  ...([[4.6, "delante", 1], [-9.6, "detras", -1]] as const).flatMap(([z, n, s]): Pieza[] => [
    { tipo: "caja", id: `bateria-${n}-alfombrilla`, acabado: "negro-ua", centro: [0, Y_TECHO + 0.07, z], tam: [7.6, 0.14, 12.2], redondeo: 0.4 },
    { tipo: "caja", id: `bateria-${n}`, acabado: "azul", centro: [0, Y_TECHO + 3.89, z], tam: [8.8, 7.5, 13.0], redondeo: 0.8 },
    ...[-3.2, 3.2].flatMap((e, k): Pieza[] => [
      { tipo: "caja", id: `bateria-${n}-correa-${k}`, acabado: "negro-ua", centro: [0, Y_TECHO + 3.89, z + e], tam: [8.95, 7.66, 2.0], redondeo: 0.85 },
      ...[-1.05, 1.05].map((d, j): Pieza => ({ tipo: "caja", id: `bateria-${n}-hebilla-${k}-larguero-${j}`, acabado: "metal", centro: [1.5, Y_TECHO + 7.74, z + e + d], tam: [1.5, 0.16, 0.16], redondeo: 0.05 })),
      ...[0.85, 1.5, 2.15].map((x, j): Pieza => ({ tipo: "caja", id: `bateria-${n}-hebilla-${k}-${j}`, acabado: "metal", centro: [x, Y_TECHO + 7.74, z + e], tam: [0.16, 0.16, 2.26], redondeo: 0.05 })),
      { tipo: "caja", id: `bateria-${n}-correa-${k}-rabo`, acabado: "negro-ua", centro: [-0.9, Y_TECHO + 7.74, z + e], tam: [3.0, 0.14, 1.96], redondeo: 0.06 },
    ]),
    // Balanceo: siete hilos finos a un conector blanco, sobre la batería.
    { tipo: "codo", id: `bateria-${n}-balanceo`, acabado: "negro-ua", puntos: [[2.6, Y_TECHO + 5.6, z + s * 6.55, 0.3, 0.12], [2.7, Y_TECHO + 7.0, z + s * 7.0, 0.3, 0.12], [2.6, Y_TECHO + 7.72, z + s * 5.8, 0.3, 0.12], [2.5, Y_TECHO + 7.72, z + s * 4.8, 0.3, 0.12]] },
    { tipo: "caja", id: `bateria-${n}-balanceo-conector`, acabado: "hueso", centro: [2.5, Y_TECHO + 7.8, z + s * 4.2], tam: [1.9, 0.5, 0.6], redondeo: 0.05 },
    { tipo: "caja", id: `bateria-${n}-salida`, acabado: "negro-ua", centro: [-3.2, Y_TECHO + 2.4, z - s * 6.6], tam: [1.6, 1.0, 0.35], redondeo: 0.15 },
    ...([[-2.8, "rojo-vivo", "rojo"], [-3.6, "negro-ua", "negro"]] as const).map(([x, acabado, c]): Pieza => ({ tipo: "codo", id: `bateria-${n}-cable-${c}`, acabado, puntos: [
      [x, Y_TECHO + 2.4, z - s * 6.75, 0.3], [x - 0.6, Y_TECHO + 2.5, z - s * 7.4, 0.3], [x - 2.6, Y_TECHO + 1.8, -0.4 + s * 1.4, 0.3], [x - 3.6, Y_PLACA + 0.9, -0.4 + s * (x < -3 ? 0.5 : 1.1), 0.3],
    ] })),
  ]),

  // --- Mástil de antenas: barra negra plegable que sube hacia atrás, con el
  // transmisor de vídeo (caja con ventilador) abajo, su antena de látigo hacia
  // atrás y, arriba, el receptor y las dos antenas cruzadas.
  { tipo: "caja", id: "mastil-bisagra", acabado: "negro-ua", centro: [0, Y_TECHO + 0.9, -15.8], tam: [3.4, 1.8, 2.6], redondeo: 0.4 },
  { tipo: "viga", id: "mastil", acabado: "negro-ua", arriba: 0.9, abajo: 0.9, ruta: [[...MASTIL_PIE, 2.4, 1.2], [...MASTIL_PUNTA, 2.0, 1.1]] },
  { tipo: "caja", id: "vtx", acabado: "negro", centro: enMastil(4.5, 1.6), tam: [3.2, 3.2, 1.6], redondeo: 0.2, girar: { centro: enMastil(4.5, 1.6), eje: "x", grados: -MASTIL_ANG } },
  { tipo: "disco", id: "vtx-ventilador", acabado: "hueco", en: enMastil(4.5, 2.42), normal: [0, -MN[1], -MN[2]], radio: 1.25, grosor: 0.05 },
  ...[0, 1].map((k): Pieza => ({ tipo: "caja", id: `vtx-ventilador-aspa-${k}`, acabado: "negro-ua", centro: enMastil(4.5, 2.46), tam: k ? [0.3, 2.4, 0.1] : [2.4, 0.3, 0.1], girar: { centro: enMastil(4.5, 2.46), eje: "x", grados: -MASTIL_ANG } })),
  { tipo: "varilla", id: "vtx-conector", acabado: "laton", desde: enMastil(4.5, 2.2, -1.2), hasta: enMastil(4.5, 3.2, -1.2), radio: 0.35, lados: 6 },
  { tipo: "codo", id: "antena-video", acabado: "negro-ua", puntos: [[...enMastil(4.5, 3.2, -1.2), 0.3], [...enMastil(5.2, 5.0, -1.1), 0.3], [...enMastil(8.0, 12.0, -1.0), 0.3], [...enMastil(10.0, 18.0, -1.0), 0.3]] },
  { tipo: "varilla", id: "antena-video-punta", acabado: "negro-ua", desde: enMastil(10.0, 18.0, -1.0), hasta: enMastil(10.6, 20.2, -1.0), radio: 0.9, lados: 20 },
  // Bridas del mástil con su cierre, a uno y otro lado.
  ...[1.6, 7.4, 10.4].flatMap((e, k): Pieza[] => [
    { tipo: "viga", id: `mastil-brida-${k}`, acabado: "negro", arriba: 1, abajo: 1, ruta: [[...enMastil(e), 2.55, 1.3], [...enMastil(e + 0.4), 2.55, 1.3]] },
    { tipo: "caja", id: `mastil-brida-${k}-cierre`, acabado: "negro", centro: enMastil(e + 0.2, 0, k % 2 ? 1.35 : -1.35), tam: [0.45, 0.42, 0.5], girar: { centro: enMastil(e + 0.2, 0, k % 2 ? 1.35 : -1.35), eje: "x", grados: -MASTIL_ANG } },
  ]),
  { tipo: "disco", id: "receptor-led", acabado: "azul", en: enMastil(MASTIL_LARGO + 1.0, 1.12, 0.6), normal: [0, -MN[1], -MN[2]], radio: 0.12, grosor: 0.03 },
  { tipo: "caja", id: "receptor", acabado: "negro", centro: enMastil(MASTIL_LARGO + 1.0), tam: [2.6, 2.0, 2.2], redondeo: 0.3, girar: { centro: enMastil(MASTIL_LARGO + 1.0), eje: "x", grados: -MASTIL_ANG } },
  { tipo: "varilla", id: "antenas-x", acabado: "negro-ua", desde: [-12, enMastil(MASTIL_LARGO + 2.2)[1], enMastil(MASTIL_LARGO + 2.2)[2]], hasta: [12, enMastil(MASTIL_LARGO + 2.2)[1], enMastil(MASTIL_LARGO + 2.2)[2]], radio: 0.12, lados: 8 },
  { tipo: "varilla", id: "antenas-z", acabado: "negro-ua", desde: [0, enMastil(MASTIL_LARGO + 2.4)[1], enMastil(MASTIL_LARGO + 2.4)[2] + 12], hasta: [0, enMastil(MASTIL_LARGO + 2.4)[1], enMastil(MASTIL_LARGO + 2.4)[2] - 12], radio: 0.12, lados: 8 },
  { tipo: "varilla", id: "antenas-cubo", acabado: "negro-ua", desde: enMastil(MASTIL_LARGO + 1.9), hasta: enMastil(MASTIL_LARGO + 2.8), radio: 0.55, lados: 16 },

  // --- Caja de suelta bajo el cubo, con su ranura delante, y el lazo que
  // sujeta la granada.
  { tipo: "caja", id: "suelta", acabado: "negro-ua", centro: [0, (-1.4 + Y_SUELTA_ABAJO) / 2, 0], tam: [6.6, -1.4 - Y_SUELTA_ABAJO, 9.6], redondeo: 0.4 },
  { tipo: "caja", id: "suelta-servo", acabado: "negro", centro: [0, -2.4, 4.85], tam: [4.0, 1.6, 0.3], redondeo: 0.1 },
  { tipo: "codo", id: "suelta-lazo", acabado: "negro", puntos: Array.from({ length: 17 }, (_, i): [number, number, number, number] => {
    const a = (i / 16) * Math.PI * 2, r = OJIVA_R + 0.12;
    return [Math.sin(a) * r, OJIVA_Y + Math.cos(a) * r, 0.4, 0.13];
  }) },
  { tipo: "varilla", id: "suelta-gancho", acabado: "metal", desde: [0, Y_SUELTA_ABAJO, 0.4], hasta: [0, OJIVA_Y + OJIVA_R + 0.1, 0.4], radio: 0.18, lados: 8 },

  // --- Granada M821: espoleta M734 (nariz de plástico pardo, cuerpo de
  // aluminio y aro de latón), ojiva verde oliva con la banda de obturación,
  // cono hasta el tubo de cola gris con sus agujeros y las cuatro aletas.
  { tipo: "tubo", id: "espoleta", acabado: "pardo-gr", centro: [0, OJIVA_Y], perfil: perfilT([[0, 0], [4, 9], [11, 12.5], [19, 16], [33, 20], [40, 20.6]]) },
  { tipo: "tubo", id: "espoleta-cuerpo", acabado: "aluminio", centro: [0, OJIVA_Y], perfil: perfilT([[40, 21.2], [47, 21.4], [60, 23.6], [62, 23.2]]) },
  { tipo: "tubo", id: "espoleta-aro", acabado: "laton", centro: [0, OJIVA_Y], perfil: perfilT([[61.5, 24.5], [66.5, 24.6]]) },
  { tipo: "tubo", id: "ojiva", acabado: "verde-gr", centro: [0, OJIVA_Y], perfil: perfilT([...PERFIL_OJIVA, [143, 40.3]]) },
  { tipo: "tubo", id: "ojiva-banda", acabado: "obturador", centro: [0, OJIVA_Y], perfil: perfilT([[142, 40.5], [143.5, 41.0], [161.5, 41.0], [163, 40.5]]) },
  { tipo: "tubo", id: "ojiva-cuerpo", acabado: "verde-gr", centro: [0, OJIVA_Y], perfil: perfilT([[162, 40.3], ...PERFIL_CUERPO]) },
  { tipo: "tubo", id: "ojiva-cola", acabado: "gris-cola", centro: [0, OJIVA_Y], perfil: perfilT([[342, 13.4], [346, 13], [448, 13], [452, 14.2], [497, 14.2], [499, 12], [500, 6]]) },
  ...[45, -45, 135, -135].map((inclinacion, i): Pieza => ({ tipo: "placa", id: `ojiva-aleta-${i}`, acabado: "gris-cola", plano: "vertical", x: 0, y: OJIVA_Y, grosor: 0.15, bisel: 0.04, inclinacion, planta: ALETA })),
];

// Agujeros y ranuras de la placa de arriba, el logo y las etiquetas.
const HUECO = "#0b0c0d";
const desdeArriba: P3 = [0, 1, 0.001];
const CALCAS: Calca[] = [
  // El avispón amarillo de Wild Hornets en la mitad de delante (bajo la
  // batería de delante: se ve sin ella).
  { sobre: ["placa"], en: [0, Y_TECHO, 6.2], desde: desdeArriba, tam: [6.4, 5.2], giro: -90, dibujo: { tipo: "sting", color: "#e8c51a", solo: true } },
  // Las dos ranuras largas de los lados de la placa.
  ...[-9.0, 6.6].map((z): Calca => ({ sobre: ["placa"], en: [4.6, Y_TECHO, z], desde: desdeArriba, tam: [0.7, 6.0], espejo: true, dibujo: { tipo: "rect", color: HUECO } })),
  // Etiqueta gris de cada variador.
  ...BRAZOS.map((b): Calca => ({ sobre: [`variador-${nombreBrazo(b)}`], en: enBrazo(b, 0.45, BRAZO_ALTO / 2 + 1.1), desde: desdeArriba, tam: [1.7, 1.7], giro: angBrazo(b), dibujo: { tipo: "rect", color: "#8d9093" } })),
  // «4320 / 350KV» en blanco en la campana de cada motor, mirando afuera.
  ...BRAZOS.map((b): Calca => {
    const L = Math.hypot(MX, MZ), d: P3 = [(b[0] * MX) / L, 0, (b[1] * MZ) / L];
    const p = enBrazo(b, 1, Y_MOTOR + 1.75);
    return { sobre: [`motor-${nombreBrazo(b)}-campana`], en: [p[0] + d[0] * 2.55, p[1], p[2] + d[2] * 2.55], desde: d, tam: [3.0, 1.5], dibujo: { tipo: "texto", texto: "4320\n350KV", color: "#d8d8d2" } };
  }),
  // El número del ejemplar en el costado del brazo de delante izquierdo, junto
  // al motor (foto de lado).
  ((): Calca => {
    const b: [number, number] = [1, 1], L = Math.hypot(MX, MZ);
    const fuera: P3 = [-MZ / L, 0, MX / L];
    const p = enBrazo(b, 0.86, 0);
    return { sobre: ["brazo-di"], en: [p[0] + fuera[0] * BRAZO_ANCHO / 2, 0, p[2] + fuera[2] * BRAZO_ANCHO / 2], desde: fuera, tam: [6.4, 1.1], dibujo: { tipo: "texto", texto: "Q0002226", color: "#d8d8d2", fino: true } };
  })(),
  // Etiqueta de cada batería en el costado.
  ...([4.6, -9.6] as const).map((z): Calca => ({ sobre: [`bateria-${z > 0 ? "delante" : "detras"}`], en: [4.4, Y_TECHO + 3.89, z], desde: [1, 0, 0], tam: [4.0, 4.6], espejo: true, dibujo: { tipo: "etiqueta", titulo: "6S4P" } })),
  // Etiqueta blanca del transmisor de vídeo, en su costado.
  { sobre: ["vtx"], en: enMastil(4.5, 1.6, 1.6), desde: [1, 0, 0], tam: [1.2, 1.6], dibujo: { tipo: "rect", color: "#e8e8e2" } },
  // Agujeros del tubo de cola de la granada, en dos filas a cada lado.
  ...[360, 380, 400, 420, 440].flatMap((t): Calca[] => [0.55, -0.55].map((dy): Calca => ({ sobre: ["ojiva-cola"], en: [1.3, OJIVA_Y + dy, zt(t)], desde: [1, 0, 0], tam: [0.4, 0.4], espejo: true, dibujo: { tipo: "disco", color: HUECO } }))),
  // Rótulos de la granada en un costado: en amarillo, el calibre, el
  // explosivo y el modelo sobre el cono; en blanco, el aviso de la ojiva.
  ...([["81MM", 0.95, 3.0, 0.8], ["COMP B", 0, 3.0, 0.7], ["CRTG-M821", -0.85, 4.0, 0.6]] as const).map(([texto, dy, ancho, alto]): Calca => ({ sobre: ["ojiva-cuerpo"], en: [OJIVA_R, OJIVA_Y + dy, zt(235)], desde: [1, 0, 0], tam: [ancho, alto], dibujo: { tipo: "texto", texto, color: "#e0cf3c" } })),
  { sobre: ["ojiva"], en: [OJIVA_R, OJIVA_Y + 0.4, zt(115)], desde: [1, 0, 0], tam: [2.2, 0.42], dibujo: { tipo: "texto", texto: "-WARNING-", color: "#ecece6" } },
];

const COSTURAS: Costura[] = [];

// Las piezas de una parte: las que se llaman así o empiezan así.
const ids = (...prefijos: string[]) => PIEZAS.map((q) => q.id).filter((id) => prefijos.some((x) => id === x || id.startsWith(`${x}-`)));

const PARTES = [
  {
    nombre: "Marco de aluminio",
    en: [0, Y_TECHO, -12.5] as P3,
    piezas: ids("placa", "caja-electronica", "cubo", "conector", "tornillo"),
    respaldo: "foto" as const,
    fuentes: ["arriba", "lado", "tres-cuartos"],
    texto: "Marco de aluminio negro de 17 pulgadas: un cubo donde se cruzan los brazos, la caja de la electrónica y una placa encima con el avispón amarillo de Wild Hornets y los dos conectores de las baterías a los lados.",
  },
  {
    nombre: "Brazos plegables y patas",
    en: enBrazo([1, -1], PATA_T, -8) as P3,
    piezas: ids("brazo", "pata", "variador"),
    respaldo: "foto" as const,
    fuentes: ["arriba", "lado", "tres-cuartos"],
    texto: "Cuatro brazos de aluminio que se pliegan junto al cuerpo para llevarlo. Cada uno lleva su variador de 80 A encima y una pata curva debajo, sujeta con una abrazadera.",
  },
  {
    nombre: "Motores y hélices",
    en: enBrazo([1, 1], 1, Y_HELICE + 0.6) as P3,
    piezas: ids("motor", "helices"),
    respaldo: "fabricante" as const,
    fuentes: ["ficha", "soldado", "lado"],
    texto: "Cuatro motores 4320 de 350 KV con hélices tripala de 17 pulgadas (43,2 cm), en un cuadrado de unos 55 cm.",
    nota: "Los motores y su rótulo salen en las fotos oficiales; las hélices, en la del soldado. El tamaño del marco se ha sacado de las hélices.",
  },
  {
    nombre: "Cámara",
    en: [0, 6.3, 18.5] as P3,
    piezas: ids("camara"),
    respaldo: "foto" as const,
    fuentes: ["tres-cuartos", "arriba", "ficha"],
    texto: "Cámara FPV delante, entre dos mejillas que la protegen. Según la versión, analógica, digital (DJI O3/O4 o Walksnail Avatar GT) o térmica (Caddx IRC-640CA o IRC-384CA).",
    nota: "El soporte sale en las fotos; la cámara de dentro no se distingue y va una de las de 19 mm.",
  },
  {
    nombre: "Mástil de antenas",
    en: enMastil(MASTIL_LARGO - 3, -1.4),
    piezas: ids("mastil", "vtx", "antena-video", "receptor", "antenas"),
    respaldo: "foto" as const,
    fuentes: ["lado", "tres-cuartos"],
    texto: "Una barra plegable sube hacia atrás con el transmisor de vídeo (1,2 a 2,5 W, con ventilador) y su antena de látigo abajo, y el receptor de mando (ELRS o TBS) con dos antenas cruzadas arriba, por encima de las baterías.",
    nota: "Qué es cada caja del mástil no se lee en las fotos: va donde suelen ir en estos FPV.",
  },
  {
    nombre: "Baterías",
    en: [0, Y_TECHO + 7.8, -9.6] as P3,
    piezas: ids("bateria"),
    respaldo: "reconstruccion" as const,
    fuentes: ["ficha", "2024"],
    texto: "Dos baterías de iones de litio 6s4p, encima y en fila, atadas con correas y enchufadas a los conectores de los costados. Dan hasta 25 minutos de vuelo.",
    nota: "Las fotos oficiales salen sin baterías: el tamaño es el de un pack 6s4p de celdas 21700; el sitio y el azul, de las fotos de la versión de 2024.",
  },
  {
    nombre: "Granada de mortero",
    en: [0, OJIVA_Y - OJIVA_R, -6] as P3,
    piezas: ids("ojiva", "espoleta", "suelta"),
    respaldo: "reconstruccion" as const,
    fuentes: ["m821", "plano-m821", "ficha"],
    texto: "Una granada de mortero de 81 mm (4,1 kg) tumbada bajo la panza, sujeta con un lazo a la caja de suelta: el piloto la suelta sobre el objetivo y el Queen vuelve. Puede llevar hasta 9 kg.",
    nota: "La forma, los colores y los rótulos son los de una M821 americana (foto de CAT-UXO y plano del manual); la caja de suelta, de las fotos oficiales. Cómo va colgada no sale en ninguna foto.",
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
      if (p.plano === "vertical") return { ...p, ...g, planta: p.planta.map(([z, y]): [number, number] => [u(z), u(y)]), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
      return { ...p, ...g, planta: p.planta.map(([x, z]): [number, number] => [u(x), u(z)]), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "pila":
      return { ...p, ...g, niveles: p.niveles.map((n) => ({ y: u(n.y), planta: n.planta.map(([x, z]): [number, number] => [u(x), u(z)]) })) };
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
  nombre: "Queen Hornet",
  subtitulo: "Dron FPV bombardero",
  escala: ESCALA,  // 1 unidad = 40 cm (motores en un cuadrado de 55 cm, hélices de 17 pulgadas)
  pais: bandera("UA"),
  hd: true,
  // Con el HD a (30°, 27°), la tapa de las baterías al sol cae en 2,92
  // escalones de luz (en el borde) y lo alto de los brazos, en 1,35: corridos
  // 0,35, quedan los dos dentro de un escalón.
  desfaseLuz: 0.35,
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
    { id: "arriba", imagen: "wh-inch17_3.jpg", titulo: "Desde arriba, con el mástil plegado", medio: "Wild Hornets", url: FICHA },
    { id: "lado", imagen: "wh-inch17_2.jpg", titulo: "De lado, sin hélices ni baterías", medio: "Wild Hornets", url: FICHA },
    { id: "tres-cuartos", imagen: "wh-inch17_1.jpg", titulo: "De tres cuartos por delante y desde arriba", medio: "Wild Hornets", url: FICHA },
    { id: "soldado", imagen: "devua-soldado.jpg", titulo: "Un soldado lo sostiene de frente, con las hélices", medio: "dev.ua", url: "https://dev.ua/en/news/minoboroni-kodyfikuvalo-korolevu-shershniv-1783074136" },
    { id: "2024", imagen: "emp-2024-bulava.jpg", titulo: "La versión de 2024, de carbono, con las dos baterías azules encima", medio: "Wild Hornets (Euromaidan Press)", url: "https://euromaidanpress.com/2024/11/24/ukraines-largest-fpv-drone-makes-history-with-first-ever-assault-rifle-combat-use" },
    { id: "m821", imagen: "m821.jpg", titulo: "Granada de mortero M821 de 81 mm, con su cola", medio: "CAT-UXO", url: "https://cat-uxo.com/" },
    { id: "plano-m821", titulo: "Plano de la M821 (TM 43-0001-28)", medio: "Bulletpicker", url: "https://www.bulletpicker.com/cartridge_-81mm-he_-m821.html" },
    { id: "ficha", titulo: "Ficha del Queen Hornet de 17 pulgadas", medio: "Wild Hornets", url: FICHA },
  ],
};

export default maqueta;
