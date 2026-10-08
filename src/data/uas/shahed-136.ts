// Maqueta del Shahed-136 iraní, versión 2.0 (docs/uas-hd.md), con las marcas
// del que se expuso en Kermanshah en septiembre de 2023 (exposición «Cielo de
// poder» de la Fuerza Aeroespacial de la Guardia Revolucionaria).
// La forma, del plano a escala de Commons (Alexpl, la revisión de 2024: 3,22 m
// del morro a la hélice y 2,5 m de envergadura; dibuja un Geran-2 de la serie
// M, que por fuera es igual) y de fotos de ejemplares iraníes en exposiciones
// y desfiles de 2023 y 2024, con la cámara de cada foto encajada
// (arte/uas-fuentes/shahed-136/hd/, fuera de Git). Su vista de lado sale un
// 5 % más corta que la planta: se lleva a la escala de la planta.
// Es un tubo con un ala gruesa: el ala entra en el tubo sin carenado (en las
// fotos de Kermanshah y de Qom la unión es una línea) y, como a 0,3 m del
// centro tiene 0,19 m de grueso, del tubo solo asoma encima un lomo estrecho.
// En metros (escala 1): z hacia el morro, con el morro en z = 1,555; `d` es la
// distancia desde la punta del morro, como se mide en el plano. La maqueta del
// Geran-2 importa estas piezas.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Distancia desde la punta del morro a z.
const z = (d: number) => +(1.555 - d).toFixed(4);

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Redondo, de 0,294 m (plano de frente y de lado), con el morro en ojiva: la
// cabeza de combate. El radio a lo largo, del perfil del plano: [d, radio].
// Detrás acaba en una tapa plana con el borde redondeado, donde se atornilla
// el motor (foto de Kermanshah desde detrás).
// La punta, un casquete esférico de 8,35 cm de radio hasta 60° (el que pasa
// por el perfil del plano a 4,2 cm de la punta), con las secciones repartidas
// por ángulo: con pocas, o muy juntas junto a la punta, la luz hacía un
// hoyuelo o un pico.
const R = 0.147, R_PUNTA = 0.0835;
const CASQUETE: [number, number][] = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60].map((g) => {
  const a = (g * Math.PI) / 180;
  return [R_PUNTA * (1 - Math.cos(a)), R_PUNTA * Math.sin(a)];
});
const RADIOS: [number, number][] = [
  ...CASQUETE, [0.074, 0.09],
  [0.106, 0.105], [0.139, 0.1145], [0.171, 0.121], [0.203, 0.127], [0.235, 0.133], [0.268, 0.138], [0.3, 0.1415],
  [0.35, 0.1445], [0.42, 0.1465], [0.5, R], [2.7, R], [2.76, 0.145], [2.8, 0.139], [2.83, 0.128], [2.845, 0.112],
];
const CUERPO: Seccion[] = RADIOS.map(([d, r]) => ({ z: z(d), ancho: r, arriba: r, abajo: -r, n: 2, nAbajo: 2 }));
// El anillo negro donde la cabeza de combate se une al cuerpo.
const ANILLO = { delante: 0.75, detras: 0.79 };

// ── Ala ────────────────────────────────────────────────────────────────────
// Delta con el borde de ataque recto (1,34 m hacia atrás por cada metro hacia
// la punta) que nace en el cuerpo 15 cm detrás del anillo. El borde de salida,
// recto, con los elevones detrás; junto al cuerpo, el hueco del motor (hasta
// 0,23 m del centro, plano desde arriba). Puntas cortadas a 1,27 m.
const ba = (x: number) => z(0.988 + (x - 0.185) * 1.34);
const SALIDA = { hueco: 2.845, bisagra: 2.895, elevon: 3.055 };
const PUNTA = 1.27;
// Grueso (plano de frente): 0,19 m a 0,3 m del centro y 0,055 m en la punta,
// en línea recta. El plano medio del ala va 2 cm por debajo del eje.
const grueso = (x: number) => 0.21 - 0.1445 * (x - 0.147);
const MEDIO_ALA = -0.02;
// El perfil del visor (`ala`) tiene el extradós más abombado que el intradós:
// el grueso total es 0,775·t y su centro queda 0,1125·t por encima de `sube`.
type Est = [number, number, number, number, number];
const estAla = (x: number, dSalida: number): Est => {
  const t = grueso(x) / 0.775;
  return [x, ba(x), z(dSalida), t, MEDIO_ALA - 0.1125 * t];
};
// Cara de arriba del ala en x, a la fracción f de la cuerda (sin elevón).
const perfilNaca = (s: number) => 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);
const sobreAla = (x: number, f: number) => {
  const [, , , t, sube] = estAla(x, SALIDA.bisagra);
  return sube + t * perfilNaca(f);
};
// Elevones: dos por lado, de la bisagra al borde de salida, con 5 mm de hueco.
const ELEVONES: [number, number][] = [[0.235, 0.715], [0.725, 1.215]];
const estElevon = (x: number): Est => {
  const t = 0.028 / 0.775;
  return [x, z(SALIDA.bisagra + 0.005), z(SALIDA.elevon), t, MEDIO_ALA - 0.1125 * t];
};

// ── Winglets ───────────────────────────────────────────────────────────────
// En las puntas, tanto por encima del ala como por debajo (plano de lado y de
// la DIA): borde de detrás recto y vertical, arriba y abajo rectos, y delante
// dos bordes en ángulo que se juntan en el ala. [z, y].
const WINGLET = { x: PUNTA + 0.006, delante: 2.711, esquina: 2.834, detras: 3.13, arriba: 0.235, abajo: 0.226 };
const PLANTA_WINGLET: [number, number][] = [
  [z(WINGLET.delante), MEDIO_ALA], [z(WINGLET.esquina), MEDIO_ALA + WINGLET.arriba], [z(WINGLET.detras), MEDIO_ALA + WINGLET.arriba],
  [z(WINGLET.detras), MEDIO_ALA - WINGLET.abajo], [z(WINGLET.esquina), MEDIO_ALA - WINGLET.abajo],
];

// ── Motor ──────────────────────────────────────────────────────────────────
// Mado MD550 (motor de dos tiempos iraní, copia del Limbach L550E): cárter de
// aluminio, cuatro cilindros con aletas, de dos en dos a cada lado, y la
// corona dentada del arranque, dorada, entre el motor y la hélice (fotos de
// Kermanshah y motor expuesto en Kiev).
const MOTOR = { carter: 2.96, corona: 3.085, buje: 3.12, helice: 3.215 };
const CILINDROS: { s: number; d: number }[] = [
  { s: 1, d: 2.9 }, { s: 1, d: 3.0 }, { s: -1, d: 2.935 }, { s: -1, d: 3.035 },
];
const ALETAS = Array.from({ length: 9 }, (_, i) => 0.078 + i * 0.0135);
const cilindro = ({ s, d }: { s: number; d: number }, i: number): Pieza[] => [
  { tipo: "varilla", id: `cilindro-${i}`, acabado: "aluminio", desde: [s * 0.055, 0, z(d)], hasta: [s * 0.2, 0, z(d)], radio: 0.034 },
  ...ALETAS.map((x, k): Pieza => ({ tipo: "disco", id: `aleta-${i}-${k}`, acabado: "aluminio", en: [s * x, 0, z(d)], normal: [1, 0, 0], radio: 0.05, grosor: 0.0035 })),
  { tipo: "disco", id: `culata-${i}`, acabado: "aluminio", en: [s * 0.2, 0, z(d)], normal: [1, 0, 0], radio: 0.046, grosor: 0.022 },
  { tipo: "varilla", id: `bujia-${i}`, acabado: "negro", desde: [s * 0.211, 0, z(d)], hasta: [s * 0.24, 0.005, z(d)], radio: 0.009 },
];
const piezasMotor: Pieza[] = [
  { tipo: "caja", id: "carter", acabado: "aluminio", centro: [0, -0.005, z(MOTOR.carter)], tam: [0.12, 0.13, 0.21], redondeo: 0.02 },
  ...CILINDROS.flatMap(cilindro),
  // Encima del cárter, el carburador y el encendido; hacia arriba, los tubos
  // de admisión y, hacia abajo, los cuatro escapes (fotos de Kermanshah).
  { tipo: "caja", id: "carburador", acabado: "negro", centro: [0, 0.085, z(2.95)], tam: [0.08, 0.05, 0.1], redondeo: 0.01 },
  ...[[0.06, 2.92], [-0.06, 2.955], [0.06, 3.02]].map(([x, d], i): Pieza => ({ tipo: "varilla", id: `admision-${i}`, acabado: "metal", desde: [x, 0.04, z(d)], hasta: [x, 0.16, z(d)], radio: 0.012 })),
  ...CILINDROS.map(({ s, d }, i): Pieza => ({ tipo: "varilla", id: `escape-${i}`, acabado: "metal", desde: [s * 0.1, -0.04, z(d)], hasta: [s * 0.1, -0.16, z(d)], radio: 0.012 })),
  { tipo: "disco", id: "corona", acabado: "laton", en: [0, 0, z(MOTOR.corona)], normal: [0, 0, 1], radio: 0.105, grosor: 0.012 },
  { tipo: "disco", id: "buje", acabado: "metal", en: [0, 0, z(MOTOR.buje)], normal: [0, 0, 1], radio: 0.05, grosor: 0.03 },
  ...Array.from({ length: 6 }, (_, i): Pieza => {
    const a = (i / 6) * Math.PI * 2;
    return { tipo: "varilla", id: `perno-${i}`, acabado: "metal", desde: [0.035 * Math.cos(a), 0.035 * Math.sin(a), z(MOTOR.buje)], hasta: [0.035 * Math.cos(a), 0.035 * Math.sin(a), z(MOTOR.helice + 0.03)], radio: 0.005 };
  }),
  { tipo: "helice", id: "helice", acabado: "blanco", en: [0, 0, z(MOTOR.helice)], radio: 0.33, palas: 2, giro: 60, ancho: 0.075 },
];

// Mandos de los elevones: un cuerno con su varilla en cada elevón, a los dos
// lados de la junta del tramo de fuera del ala (0,72 m): a 0,64 y 0,78 m del
// centro (plano desde arriba; medidos en las fotos de Kermanshah y de Qom con
// la cámara encajada, de 0,57 a 0,78).
const MANDOS = [0.645, 0.775];
const piezasMandos: Pieza[] = MANDOS.flatMap((x, i): Pieza[] => [
  { tipo: "caja", id: `cuerno-${i}`, acabado: "metal", espejo: true, centro: [x, sobreAla(x, 0.97) + 0.022, z(SALIDA.bisagra + 0.03)], tam: [0.006, 0.04, 0.05] },
  { tipo: "varilla", id: `varilla-${i}`, acabado: "metal", espejo: true, desde: [x, sobreAla(x, 0.97) + 0.035, z(SALIDA.bisagra + 0.03)], hasta: [x, sobreAla(x, 0.86) + 0.012, z(SALIDA.bisagra - 0.15)], radio: 0.0035 },
]);

// ── Catapulta ──────────────────────────────────────────────────────────────
// El «lanzador ligero» de la exposición de Kermanshah (el mismo ejemplar de
// las marcas; también en una foto de otra exposición que pasó el usuario):
// dos raíles negros sobre una escalera ocre que asoma por delante del morro,
// con cuatro patas arriostradas, travesaños abajo, un volante y ruedas. El
// dron va 15° morro arriba (medido en la foto de Kermanshah de lado: con la
// cámara a nivel, el encaje da menos error con 15°). Debajo, el cohete de
// despegue (desfile de Teherán de 2023: un cilindro blanco con abrazaderas
// bajo la panza; drone-warfare lo dibuja en el mismo sitio), que se suelta al
// salir. Todo en los ejes del dron; el suelo, en los del mundo.
const CABECEO = 15;
const cc = Math.cos((CABECEO * Math.PI) / 180), sc = Math.sin((CABECEO * Math.PI) / 180);
// Un punto del mundo (y arriba de verdad), en los ejes del dron inclinado.
const delMundo = (x: number, yw: number, zw: number): [number, number, number] => [x, +(yw * cc - zw * sc).toFixed(4), +(yw * sc + zw * cc).toFixed(4)];
const enMundo = (y: number, zd: number) => ({ y: y * cc + zd * sc, z: -y * sc + zd * cc });
const SUELO = -0.95;
// Los raíles, por fuera del cuerpo (foto de Qom de frente: a ±0,2 m).
const RAIL = { x: 0.2, y: -0.19, delante: 2.35, detras: -1.25 };
// Patines del dron: dos travesaños bajo la panza que apoyan en los raíles.
// (El de atrás, delante del cohete.)
const PATINES = [0.95, -0.12];
// La escalera va más baja que los raíles, que se apoyan en ella con postes:
// entre los dos raíles y por encima de la escalera queda el hueco del cohete.
const ESCALERA = { x: 0.3, y: -0.42 };
const TRAVESANOS = [2.25, 1.65, 1.05, 0.45, -1.42];
// Patas: arriba, en la escalera; abajo, en el suelo, abiertas hacia fuera.
// En A vistas de frente (foto de Qom de frente con la cámara encajada): arriba,
// las bisagras a ±0,17 m bajo la escalera; abajo, las ruedas a ±0,5 m.
const PATAS = [{ z: 1.75, pie: 0.5 }, { z: -0.95, pie: 0.5 }];
const BISAGRA_X = 0.17;
const PIE_ALTO = 0.16;  // la rueda y su horquilla
const tope = (zd: number): [number, number, number] => [BISAGRA_X, ESCALERA.y - 0.04, zd];
const pie = (zd: number, x: number) => { const m = enMundo(ESCALERA.y, zd); return delMundo(x, SUELO + PIE_ALTO, m.z); };
const atravesar = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const espejoX = ([x, y, zz]: [number, number, number]): [number, number, number] => [-x, y, zz];
// El cohete de despegue (dibujo aproximado: no hay fotos de cerca). Un
// cilindro de 17 cm y algo más de 1 m bajo la panza, de la raíz del ala a la
// hélice, paralelo al dron y a los raíles (como lo dibuja drone-warfare);
// delante, una ojiva; detrás, la tobera. Va pegado a la panza con un pilón
// continuo, dos abrazaderas y un gancho que lo suelta al acabar.
const COHETE = { delante: -0.22, detras: -1.2, r: 0.085, y0: -0.262, z0: -0.7, pendiente: 0 };
const ejeCohete = (zc: number) => COHETE.y0 + (zc - COHETE.z0) * COHETE.pendiente;
// Un perfil de torno a lo largo del eje inclinado: [z, radio] → [z, radio, sube].
const inclinado = (perfil: [number, number][]): [number, number, number][] => perfil.map(([zc, r]) => [zc, r, ejeCohete(zc) - COHETE.y0]);
const zAbrazaderas = [-0.42, -0.95];
const piezasCatapulta: Pieza[] = [
  // Raíles: perfiles negros sobre los travesaños.
  ...[1, -1].map((s, i): Pieza => ({ tipo: "caja", id: `rail-${i}`, acabado: "negro", centro: [s * RAIL.x, RAIL.y, (RAIL.delante + RAIL.detras) / 2], tam: [0.05, 0.06, RAIL.delante - RAIL.detras] })),
  // La escalera: dos largueros y los travesaños.
  ...[1, -1].map((s, i): Pieza => ({ tipo: "caja", id: `larguero-${i}`, acabado: "ocre", centro: [s * ESCALERA.x, ESCALERA.y, (RAIL.delante + RAIL.detras) / 2], tam: [0.05, 0.07, RAIL.delante - RAIL.detras + 0.04] })),
  ...TRAVESANOS.map((zt, i): Pieza => ({ tipo: "caja", id: `travesano-${i}`, acabado: "ocre", centro: [0, ESCALERA.y + 0.01, zt], tam: [2 * ESCALERA.x + 0.05, 0.05, 0.05] })),
  // Patas, con el pie en el suelo y abiertas hacia fuera; a los lados, un
  // aspa entre la pata de delante y la de atrás y un larguero bajo.
  ...PATAS.flatMap(({ z: zp, pie: px }, i): Pieza[] => [1, -1].map((s, j): Pieza => {
    const a = tope(zp), b = pie(zp, px);
    return { tipo: "varilla", id: `pata-${i}-${j}`, acabado: "ocre", desde: s > 0 ? a : espejoX(a), hasta: s > 0 ? b : espejoX(b), radio: 0.024 };
  })),
  ...[1, -1].flatMap((s, j): Pieza[] => {
    const [d, t] = PATAS;
    const dA = tope(d.z), dB = pie(d.z, d.pie), tA = tope(t.z), tB = pie(t.z, t.pie);
    const k = (p: [number, number, number]) => (s > 0 ? p : espejoX(p));
    // Un larguero bajo de pata a pata y, de cada pata, una riostra corta
    // hasta la escalera (fotos de Qom y Kermanshah).
    return [
      { tipo: "varilla", id: `bajo-${j}`, acabado: "ocre", desde: k(atravesar(dA, dB, 0.8)), hasta: k(atravesar(tA, tB, 0.8)), radio: 0.018 },
      { tipo: "varilla", id: `riostra-d-${j}`, acabado: "ocre", desde: k(atravesar(dA, dB, 0.45)), hasta: [k(dA)[0], ESCALERA.y, d.z - 0.45], radio: 0.014 },
      { tipo: "varilla", id: `riostra-t-${j}`, acabado: "ocre", desde: k(atravesar(tA, tB, 0.45)), hasta: [k(tA)[0], ESCALERA.y, t.z + 0.45], radio: 0.014 },
    ];
  }),
  // Delante y detrás, un travesaño bajo entre las dos patas.
  ...PATAS.map(({ z: zp, pie: px }, i): Pieza => { const p = atravesar(tope(zp), pie(zp, px), 0.85); return { tipo: "varilla", id: `bajo-frente-${i}`, acabado: "ocre", desde: p, hasta: espejoX(p), radio: 0.018 }; }),
  // Ruedas: horquilla y rueda bajo cada pie.
  ...PATAS.flatMap(({ z: zp, pie: px }, i): Pieza[] => [1, -1].flatMap((s, j): Pieza[] => {
    const [x, y, zz] = pie(zp, px), xs = s * x, w = enMundo(y, zz);
    return [
      { tipo: "caja", id: `horquilla-${i}-${j}`, acabado: "metal", centro: delMundo(xs, w.y - 0.04, w.z), tam: [0.05, 0.08, 0.05] },
      { tipo: "disco", id: `rueda-${i}-${j}`, acabado: "negro", en: delMundo(xs, SUELO + 0.055, w.z), normal: [1, 0, 0], radio: 0.055, grosor: 0.035 },
    ];
  })),
  // El volante de la manivela, bajo la escalera, delante.
  { tipo: "varilla", id: "volante-eje", acabado: "metal", desde: [0, ESCALERA.y - 0.03, 1.25], hasta: [0, ESCALERA.y - 0.2, 1.25], radio: 0.012 },
  { tipo: "disco", id: "volante", acabado: "negro", en: [0, ESCALERA.y - 0.2, 1.25], normal: [0, 1, 0], radio: 0.09, grosor: 0.014 },
  // Los patines con que el dron apoya en los raíles: un taco en la panza y un
  // travesaño hasta cada raíl (solo con la catapulta).
  ...PATINES.flatMap((zp, i): Pieza[] => [
    { tipo: "caja", id: `taco-${i}`, acabado: "metal", centro: [0, -R - 0.008, zp], tam: [0.05, 0.03, 0.05], redondeo: 0.004 },
    { tipo: "caja", id: `patin-${i}`, acabado: "metal", centro: [0, RAIL.y + 0.04, zp], tam: [2 * RAIL.x + 0.04, 0.02, 0.045] },
  ]),
  // Los raíles, sobre postes en cada travesaño.
  ...TRAVESANOS.flatMap((zt, i): Pieza[] => [1, -1].map((sx, j): Pieza => ({ tipo: "caja", id: `poste-${i}-${j}`, acabado: "ocre", centro: [sx * RAIL.x, (RAIL.y + ESCALERA.y) / 2, zt], tam: [0.04, RAIL.y - ESCALERA.y, 0.04] }))),
  // El cohete, entre los raíles (ver COHETE).
  {
    tipo: "tubo", id: "cohete", acabado: "blanco", centro: [0, COHETE.y0],
    perfil: inclinado([
      [COHETE.delante, 0], [COHETE.delante - 0.012, 0.035], [COHETE.delante - 0.04, 0.062], [COHETE.delante - 0.08, 0.078], [COHETE.delante - 0.13, COHETE.r],
      [COHETE.detras + 0.1, COHETE.r], [COHETE.detras + 0.07, 0.078], [COHETE.detras + 0.05, 0.06], [COHETE.detras + 0.049, 0],
    ]),
  },
  // Dos franjas rojas, delante y detrás.
  ...[COHETE.delante - 0.2, COHETE.detras + 0.2].map((zf, i): Pieza => ({ tipo: "tubo", id: `cohete-franja-${i}`, acabado: "rojo-vivo", centro: [0, COHETE.y0], perfil: inclinado([[zf + 0.025, COHETE.r + 0.002], [zf - 0.025, COHETE.r + 0.002]]) })),
  // Tobera: garganta oscura y campana de metal que se abre hacia atrás, con
  // el fondo negro.
  { tipo: "tubo", id: "tobera", acabado: "metal", centro: [0, COHETE.y0], perfil: inclinado([[COHETE.detras + 0.06, 0.045], [COHETE.detras + 0.02, 0.035], [COHETE.detras - 0.05, 0.058], [COHETE.detras - 0.1, 0.07], [COHETE.detras - 0.101, 0]]) },
  { tipo: "disco", id: "tobera-fondo", acabado: "hueco", en: [0, ejeCohete(COHETE.detras - 0.06), COHETE.detras - 0.06], normal: [0, COHETE.pendiente, -1], radio: 0.055, grosor: 0.004 },
  // Detallitos del cohete (inventados, como el resto): la punta de metal, las
  // juntas de los tramos (ojiva, cuerpo y tobera), dos argollas de izado
  // arriba, la caja del encendido junto a la tobera y su cable hasta la
  // panza, una placa de aviso amarilla y un aro de refuerzo en la boca de la
  // tobera. (Un conducto de cables por el costado se quitó: el usuario lo
  // veía como una línea suelta.)
  { tipo: "tubo", id: "cohete-punta", acabado: "metal", centro: [0, COHETE.y0], perfil: inclinado([[COHETE.delante + 0.001, 0], [COHETE.delante - 0.008, 0.024], [COHETE.delante - 0.018, 0.04], [COHETE.delante - 0.019, 0]]) },
  // (Solo dos: con el filete de tinta del HD, cuatro anillos parecían rayas.)
  ...[COHETE.delante - 0.13, COHETE.detras + 0.1].map((zj, i): Pieza => ({ tipo: "tubo", id: `cohete-junta-${i}`, acabado: "junta", centro: [0, COHETE.y0], perfil: inclinado([[zj + 0.006, COHETE.r + 0.0015], [zj - 0.006, COHETE.r + 0.0015]]) })),
  ...[-0.55, -0.82].map((za, i): Pieza => ({ tipo: "tubo", id: `cohete-argolla-${i}`, acabado: "metal", centro: [0.05, ejeCohete(za) + 0.07], seccion: [0.35, 1], perfil: [[za + 0.016, 0], [za + 0.012, 0.013], [za - 0.012, 0.013], [za - 0.016, 0]] })),
  { tipo: "caja", id: "cohete-encendido", acabado: "negro", centro: [0.07, ejeCohete(-1.07) + 0.045, COHETE.detras + 0.13], tam: [0.04, 0.035, 0.06], redondeo: 0.006 },
  { tipo: "varilla", id: "cohete-cable", acabado: "negro", desde: [0.07, ejeCohete(-1.07) + 0.06, COHETE.detras + 0.13], hasta: [0.03, -R + 0.005, COHETE.detras + 0.25], radio: 0.005 },
  { tipo: "caja", id: "cohete-aviso", acabado: "amarillo", centro: [-0.084, COHETE.y0 - 0.01, -0.7], tam: [0.006, 0.05, 0.12] },
  { tipo: "caja", id: "cohete-aviso-raya", acabado: "negro", centro: [-0.0875, COHETE.y0 - 0.01, -0.7], tam: [0.002, 0.012, 0.1] },
  { tipo: "tubo", id: "tobera-aro", acabado: "junta", centro: [0, COHETE.y0], perfil: inclinado([[COHETE.detras - 0.088, 0.072], [COHETE.detras - 0.1, 0.074]]) },
  // Pilón entre el cohete y la panza, con dos abrazaderas y el gancho.
  ...zAbrazaderas.flatMap((zb, i): Pieza[] => [
    { tipo: "tubo", id: `abrazadera-${i}`, acabado: "negro", centro: [0, COHETE.y0], perfil: inclinado([[zb + 0.02, COHETE.r + 0.006], [zb - 0.02, COHETE.r + 0.006]]) },
    // Cada abrazadera, con una orejeta que sube hasta la panza.
    { tipo: "caja", id: `colgador-${i}`, acabado: "negro", centro: [0, (ejeCohete(zb) + COHETE.r - R) / 2, zb], tam: [0.05, -R - ejeCohete(zb) - COHETE.r + 0.02, 0.04] },
  ]),
  // El pilón: una quilla continua entre el cohete y la panza, casi de punta
  // a punta del cohete (con dos varillas sueltas parecía que flotaba).
  { tipo: "caja", id: "pilon", acabado: "blanco", centro: [0, COHETE.y0 + COHETE.r / 2 + (-R - COHETE.y0) / 2, (COHETE.delante + COHETE.detras) / 2 - 0.02], tam: [0.045, -R - COHETE.y0 - COHETE.r / 2 + 0.03, COHETE.delante - COHETE.detras - 0.3], redondeo: 0.01 },
  { tipo: "varilla", id: "gancho", acabado: "negro", desde: [0, -R - 0.005, -0.25], hasta: [0, ejeCohete(-0.25) + COHETE.r + 0.005, -0.32], radio: 0.008 },
];

const PIEZAS: Pieza[] = [
  // `polo`: la punta del morro, con la normal del eje (sin ella, un hoyuelo).
  { tipo: "casco", id: "fuselaje", acabado: "crema-ir", secciones: CUERPO, polo: true },
  {
    tipo: "tubo", id: "anillo", acabado: "negro", centro: [0, 0],
    perfil: [[z(ANILLO.delante), R + 0.0025], [z(ANILLO.detras), R + 0.0025]],
  },
  {
    tipo: "ala", id: "ala", acabado: "crema-ir", y: 0,
    estaciones: [
      // El borde de salida pasa del hueco del motor a la bisagra poco a poco,
      // de 0,20 a 0,26 m (la esquina del hueco, redondeada como en el plano),
      // y de la bisagra al borde de los elevones en la punta. Con un escalón
      // (dos estaciones en la misma x), el perfil de cada lado se repartía
      // sobre una cuerda distinta y no casaban: un pliegue a lo largo de
      // todo el ala, que además parpadeaba (la pared del escalón, pegada a
      // las caras).
      ...[[0, 0], [0.2, 0], [0.215, 0.16], [0.23, 0.5], [0.245, 0.84], [0.26, 1]].map(([x, k]) => estAla(x, SALIDA.hueco + k * (SALIDA.bisagra - SALIDA.hueco))),
      estAla(ELEVONES[1][1] + 0.005, SALIDA.bisagra), estAla(ELEVONES[1][1] + 0.015, SALIDA.bisagra + 0.5 * (SALIDA.elevon - SALIDA.bisagra)),
      estAla(ELEVONES[1][1] + 0.025, SALIDA.elevon), estAla(PUNTA, SALIDA.elevon),
    ],
  },
  ...ELEVONES.map(([a, b], i): Pieza => ({ tipo: "ala", id: i ? "elevon-fuera" : "elevon-dentro", acabado: "crema-ir", y: 0, estaciones: [estElevon(a), estElevon(b)] })),
  ...piezasMandos,
  { tipo: "placa", id: "winglets", acabado: "crema-ir", plano: "vertical", x: WINGLET.x, grosor: 0.012, espejo: true, bisel: 0.004, planta: PLANTA_WINGLET },
  // Tubos de Pitot: uno en el borde de ataque de cada ala, a 0,77 m del
  // centro (medido en la foto de Qom con la cámara encajada). Los del Parque
  // Aeroespacial y los dos planos llevan dos; el de Qom, solo el izquierdo.
  { tipo: "varilla", id: "pitot", acabado: "metal", espejo: true, desde: [0.77, MEDIO_ALA, ba(0.77) - 0.02], hasta: [0.77, MEDIO_ALA, ba(0.77) + 0.2], radio: 0.006 },
  // En lo alto, detrás del anillo, un conector pequeño (fotos de Qom, a
  // escala con el anillo y la bandera: unos 10 cm detrás del anillo).
  { tipo: "caja", id: "conector", acabado: "negro", centro: [0, R + 0.006, 0.67], tam: [0.032, 0.016, 0.04], redondeo: 0.006 },
  ...[-0.009, 0.009].map((x, i): Pieza => ({ tipo: "varilla", id: `conector-pata-${i}`, acabado: "metal", desde: [x, R + 0.012, 0.655], hasta: [x, R + 0.022, 0.655], radio: 0.003 })),
  // En el ala derecha, una antena en cúpula negra (plano desde arriba y foto
  // de Kermanshah desde detrás).
  { tipo: "tubo", id: "antena-ala", acabado: "negro", centro: [-0.554, sobreAla(0.554, 0.45) - 0.004], seccion: [1, 0.45], perfil: [[z(1.78), 0], [z(1.785), 0.015], [z(1.805), 0.022], [z(1.825), 0.015], [z(1.83), 0]] },
  // Bajo el lomo, una caja de conexiones (plano desde abajo).
  { tipo: "caja", id: "caja-panza", acabado: "junta", centro: [0, -R + 0.004, z(1.72)], tam: [0.06, 0.016, 0.12], redondeo: 0.01 },

  // Antena del GNSS: una placa baja en lo alto del lomo (plano desde arriba).
  { tipo: "caja", id: "carena-gnss", acabado: "junta", centro: [0, R - 0.002, z(1.985)], tam: [0.05, 0.012, 0.075], redondeo: 0.008 },
  ...piezasMotor,
];

// ── Detalle pintado del HD ─────────────────────────────────────────────────
// Marcas del Shahed de Kermanshah (2023): el cartel de la bandera en la cara
// de fuera de cada winglet, medido en la foto de lado con la cámara encajada
// (entre y = 0,05 y 0,21 m y entre z = −1,31 y −1,55), y
// la pegatina de código QR en el ala derecha junto al winglet (foto desde
// detrás). Las tapas y sus tornillos, de la planta del plano de 2024 (a
// 326,9 px/m, con el centro en x = 1296 y el morro en y = 88), que coinciden
// con las de las fotos de Kermanshah y de Qom.
const ARRIBA: [number, number, number] = [0, 1, 0];
const ABAJO: [number, number, number] = [0, -1, 0];
const plano = (X: number, Y: number): [number, number, number] => [+((1296 - X) / 326.9).toFixed(3), 0.4, z((Y - 88) / 326.9)];
const tapa = (puntos: [number, number][], espejo: boolean, tornillos = true): Costura => ({
  sobre: ["fuselaje", "ala"], desde: ARRIBA, espejo, enVertices: tornillos,
  puntos: [...puntos, puntos[0]].map(([X, Y]) => plano(X, Y)),
});
// Un rectángulo con tornillos en las esquinas y en medio de cada lado.
const rect = (x0: number, y0: number, x1: number, y1: number, espejo = true): Costura =>
  tapa([[x0, y0], [(x0 + x1) / 2, y0], [x1, y0], [x1, (y0 + y1) / 2], [x1, y1], [(x0 + x1) / 2, y1], [x0, y1], [x0, (y0 + y1) / 2]], espejo);
// Tornillos de la cabeza de combate: un anillo a 20 cm de la punta (z =
// 1,36), de los que en las fotos de Qom se ven los de arriba.
const TORNILLOS_MORRO: Calca[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2, r = 0.131;
  const n: [number, number, number] = [Math.cos(a), Math.sin(a), 0.25];
  return { sobre: ["fuselaje"], en: [r * Math.cos(a), r * Math.sin(a), 1.36], desde: n, tam: [0.008, 0.008], dibujo: { tipo: "disco", color: "#6a6862" } };
});
const CALCAS: Calca[] = [
  // La bandera pegada sobre la cabeza de combate, delante del anillo, con el
  // verde hacia él (las fotos de Qom: empieza justo delante del anillo y su
  // centro, medido con la cámara encajada, cae en z = 0,95; los bordes, al
  // ras de la superficie, no se pueden medir). El de Kermanshah lleva el
  // morro liso; la del morro sale del de Qom (el usuario dejó mezclar
  // ejemplares iraníes).
  { sobre: ["fuselaje"], en: [0, 0.3, 0.92], desde: ARRIBA, tam: [0.25, 0.2], dibujo: { tipo: "bandera-ir", pegatina: true } },
  ...TORNILLOS_MORRO,
  { sobre: ["winglets"], en: [WINGLET.x + 0.02, 0.13, -1.43], desde: [1, 0, 0], tam: [0.24, 0.165], dibujo: { tipo: "bandera-ir" }, espejo: true },
  { sobre: ["ala"], en: [-1.12, 0.2, -1.24], desde: ARRIBA, tam: [0.065, 0.065], giro: 30, dibujo: { tipo: "qr" } },
  // La antena CRPA del ala derecha, de cuatro elementos pequeños (plano desde
  // arriba; en la foto de Kermanshah desde detrás, unos puntos oscuros).
  ...[[1465, 775], [1490, 775], [1465, 800], [1490, 800]].map(([X, Y]): Calca => ({ sobre: ["ala"], en: plano(X, Y), desde: ARRIBA, tam: [0.032, 0.032], dibujo: { tipo: "disco", color: "#4a4b4d" } })),
  // Dos agujeros negros bajo cada ala (foto del parque aeroespacial, desde
  // abajo, y plano desde abajo).
  { sobre: ["ala"], en: [0.55, -0.4, z(1.93)], desde: ABAJO, tam: [0.04, 0.04], dibujo: { tipo: "disco", color: "#141518" }, espejo: true },
];
const COSTURAS: Costura[] = [
  // Cuatro tapas en lo alto del lomo, la última en trapecio.
  { ...rect(1252.5, 352.5, 1337.5, 500, false), sobre: ["fuselaje"] },
  { ...rect(1256, 542.5, 1333.5, 680, false), sobre: ["fuselaje"] },
  { ...rect(1257.5, 749, 1334, 889, false), sobre: ["fuselaje"] },
  { ...tapa([[1258.5, 904], [1334, 904], [1322.5, 1000], [1270, 1000]], false), sobre: ["fuselaje"] },
  // En cada ala: dos triángulos junto al borde de ataque, un rectángulo a
  // media ala y dos junto al borde de salida.
  tapa([[1152.5, 557.5], [1165, 660], [1070, 660]], true),
  tapa([[1035, 727.5], [1047.5, 840], [952.5, 835]], true),
  rect(1077.5, 690, 1148.5, 845),
  rect(932.5, 911, 1019, 989),
  rect(1087.5, 911, 1220, 989),
  // La junta del tramo de fuera del ala, del borde de ataque a la bisagra.
  { sobre: ["ala"], desde: ARRIBA, espejo: true, puntos: [plano(1060, 640), plano(1060, 1030)] },
  { sobre: ["ala"], desde: ABAJO, espejo: true, puntos: [[0.722, -0.4, ba(0.722) - 0.005], [0.722, -0.4, z(SALIDA.bisagra)]] },
];

const ID_COHETE = /^(cohete|tobera|abrazadera|colgador|pilon|gancho)/;
const idsCatapulta = piezasCatapulta.map((p) => p.id).filter((id) => !ID_COHETE.test(id));
const idsCohete = piezasCatapulta.map((p) => p.id).filter((id) => ID_COHETE.test(id));
const idsMotor = piezasMotor.map((p) => p.id).filter((id) => id !== "helice" && id !== "buje" && !id.startsWith("perno"));

const PARTES: Parte[] = [
  {
    nombre: "Morro y cabeza de combate",
    en: [0, 0.15, z(0.4)],
    piezas: ["fuselaje", "anillo"],
    respaldo: "foto",
    fuentes: ["desfile", "frente", "plano", "csis"],
    texto: "La cabeza de combate va en el morro, delante del anillo oscuro que lo une al cuerpo: unos 50 kg de explosivo. Detrás van el depósito, la electrónica de navegación y el motor.",
    nota: "Qué hay dentro de cada tramo sale de los restos analizados en Ucrania y del plano de la DIA, no de Irán.",
  },
  {
    nombre: "Ala en delta",
    en: [0.75, 0.06, z(2.305)],
    piezas: ["ala"],
    respaldo: "foto",
    fuentes: ["plano", "lado", "detras"],
    texto: "Ala volante en delta, sin cola, de 2,5 m de punta a punta. El borde de ataque va en flecha hasta unas puntas cortadas y el de salida es recto.",
  },
  {
    nombre: "Winglets",
    en: [WINGLET.x, 0.2, z(3.005)],
    piezas: ["winglets"],
    respaldo: "foto",
    fuentes: ["desfile", "lado", "mercer"],
    texto: "Placas verticales en las puntas del ala, por encima y por debajo, que hacen de deriva. En las exposiciones iraníes llevan un cartel con la bandera, «Made in I.R. Iran» y «ساخت ایران» («hecho en Irán»); en el desfile, un número de serie. Una de ellas, con su número, se recuperó entre los restos del Mercer Street.",
  },
  {
    nombre: "Elevones",
    en: [0.9, 0.02, z(2.975)],
    piezas: ["elevon-dentro", "elevon-fuera", ...piezasMandos.map((p) => p.id)],
    respaldo: "foto",
    fuentes: ["detras", "plano"],
    texto: "Dos superficies móviles a cada lado del borde de salida. Encima del ala se ven las varillas que las mueven.",
  },
  {
    nombre: "Motor MD-550",
    en: [0.22, 0.02, z(2.975)],
    piezas: idsMotor,
    respaldo: "foto",
    fuentes: ["motor", "detras", "lado"],
    texto: "Motor de explosión iraní de cuatro cilindros opuestos, el Mado MD-550, copia del alemán Limbach L550E. Va al aire, al final del cuerpo, y es lo que hace ese zumbido de moto que se oye desde el suelo.",
  },
  {
    nombre: "Hélice propulsora",
    en: [0, 0.3, z(MOTOR.helice)],
    piezas: ["helice", "buje", ...Array.from({ length: 6 }, (_, i) => `perno-${i}`)],
    respaldo: "foto",
    fuentes: ["lado", "detras"],
    texto: "Hélice de dos palas que empuja desde atrás.",
  },
  {
    nombre: "Antena GNSS",
    en: [0, 0.2, z(1.985)],
    piezas: ["carena-gnss"],
    respaldo: "reconstruccion",
    fuentes: ["plano", "detras", "dronewarfare"],
    texto: "Una placa baja en lo alto del lomo con la antena del receptor de satélites. Con ella y la navegación inercial sigue su ruta sin que nadie lo pilote.",
    nota: "Sale en el plano de Alexpl y en el esquema de drone-warfare; en las fotos iraníes solo se adivina. Su forma exacta es supuesta.",
  },
  {
    nombre: "Tubo de Pitot",
    en: [0.77, 0.02, ba(0.77) + 0.2],
    piezas: ["pitot"],
    respaldo: "reconstruccion",
    fuentes: ["frente", "dia"],
    texto: "Un tubo fino que sale del borde de ataque del ala izquierda, para medir la velocidad del aire.",
    nota: "En la foto de Qom solo hay uno, en el ala izquierda; el plano de la DIA dibuja uno en cada ala. Su largo, del plano.",
  },
  {
    nombre: "Catapulta",
    en: [0.3, ESCALERA.y, 1.6],
    piezas: idsCatapulta,
    respaldo: "foto",
    fuentes: ["lado", "lanzador", "desfile-cohetes"],
    texto: "No despega solo: sale de un raíl inclinado, empujado por un cohete. En las exposiciones iraníes va sobre un lanzador ligero con ruedas, dos raíles sobre una escalera con patas; en los desfiles, en camiones con cinco raíles.",
    nota: "El lanzador es el de la exposición de Kermanshah: la inclinación, 15°, está medida en su foto de lado; las patas de atrás, que apenas se ven, son aproximadas.",
    catapulta: true,
  },
  {
    nombre: "Cohete de despegue",
    en: [0.1, COHETE.y0 - COHETE.r, COHETE.detras + 0.25],
    piezas: idsCohete,
    respaldo: "reconstruccion",
    fuentes: ["desfile-cohetes", "dronewarfare"],
    texto: "Un cohete de combustible sólido colgado bajo la panza que empuja dos o tres segundos, lo justo para sacarlo del raíl a velocidad de vuelo, y se suelta. Después tira el motor de pistón, que ya iba en marcha al lanzarlo.",
    nota: "No hay fotos de cerca: el sitio y el tamaño salen de los camiones del desfile de Teherán y de los esquemas publicados; los detalles son aproximados.",
    catapulta: true,
  },
];

const maqueta: Maqueta = {
  nombre: "Shahed-136",
  subtitulo: "Dron de ataque de un solo uso",
  escala: 1,
  pais: bandera("IR"),
  resalte: "tinta",
  hd: true,
  // La crema al sol cae entre 5,5 y 5,9 escalones de luz del pixel HD (cerca
  // del borde con el 6 en la planta): corridos 0,2 hacia abajo.
  desfaseLuz: -0.2,
  // Tarjeta de /uas: el ángulo de una captura del visor del usuario
  // (arte/encajar-camara.mjs: acimut 65°, elevación 30°).
  vistaTarjeta: [65, 30],
  contornoPixel: true,
  detalles: { calcas: CALCAS, costuras: COSTURAS },
  catapulta: { piezas: piezasCatapulta, cabeceo: CABECEO },
  piezas: PIEZAS,
  partes: PARTES,
  fuentes: [
    { id: "desfile", imagen: "desfile-teheran.jpg", titulo: "En un desfile en Teherán, en 2023", medio: "Meghdad Madadi, Tasnim (Wikimedia Commons)", url: `${COMMONS}Military_equipment_displayed_for_the_44th_Iranian_revolution_anniversary_rally_-_Shahed_136.jpg` },
    { id: "lado", imagen: "expo-lado.jpg", titulo: "De lado, con el motor al aire, en Kermanshah", medio: "Behrouz Ahmadi (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(018).jpg` },
    { id: "detras", imagen: "expo-detras.jpg", titulo: "Desde detrás: el motor, la hélice y los elevones", medio: "Yahya Biabadi, Mehr (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(033).jpg` },
    { id: "frente", imagen: "expo-frente.jpg", titulo: "De frente, en una exposición en Qom", medio: "Mohammadreza Jabbari (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Qom_(33).jpg` },
    { id: "motor", imagen: "motor-md-550.jpg", titulo: "Un motor MD-550 recuperado en Ucrania", medio: "Zenwort (Wikimedia Commons)", url: `${COMMONS}MD-550_Shahed-136_20260702_122912cr.jpg` },
    { id: "mercer", imagen: "mercer-street-winglet.jpg", titulo: "Restos del winglet en el Mercer Street, 2021", medio: "Mando Central Naval de EE. UU. (Wikimedia Commons)", url: `${COMMONS}29-30JULY2021_Drone_Attack_on_MT_Mercer_Street_-_Vertical_Stabilizer.jpg` },
    { id: "plano", imagen: "plano-cuatro-vistas.jpg", titulo: "Plano de cuatro vistas, a escala (revisión de 2024)", medio: "Alexpl (Wikimedia Commons)", url: `${COMMONS}Shahed-136-335-250draw.svg` },
    { id: "dia", imagen: "plano-dia.jpg", titulo: "Planta, perfil y panza, con sus partes", medio: "Agencia de Inteligencia de Defensa de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Shahed-136_(Geran-2)_drawing_by_Defense_Intelligence_Agency.jpg` },
    { id: "lanzador", imagen: "lanzador-qom.jpg", titulo: "Sobre su lanzador ligero, en Qom", medio: "Zahra Pourvahab, Mehr (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Qom_(42).jpg` },
    { id: "desfile-cohetes", imagen: "desfile-cohetes.jpg", titulo: "En los raíles de un camión, con el cohete bajo la panza (desfile de Teherán, 2023)", medio: "Mohammadreza Abbasi, Mehr (Wikimedia Commons)", url: `${COMMONS}Sacred_Defence_Week_parade,_2023,_in_Tehran_(170).jpg` },
    { id: "dronewarfare", titulo: "Shahed-136 and Geran: Specs, Production, Jet Variants", medio: "Drone Warfare", url: "https://drone-warfare.com/research/shahed-136/" },
    { id: "csis", titulo: "Shahed-131 and -136", medio: "CSIS Missile Defense Project", url: "https://missilethreat.csis.org/missile/shahed-131-and-136/" },
  ],
};

export default maqueta;
