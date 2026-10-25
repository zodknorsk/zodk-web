// Maqueta del XQ-58A Valkyrie de Kratos con la pintura de los Marines: el
// 170741 («108», Laboratorio de Combate de los Marines), en vuelo, sin tren y
// con la bodega cerrada.
// La forma sale de las fotos: las cuatro en vuelo (primer vuelo, cuarto
// vuelo y dos de los Marines) encajadas a la vez con sus puntos (punta del
// morro y de la cola, labio de la toma, puntas y raíces del ala y de las
// derivas; arte/uas-fuentes/xq-58-valkyrie/hd/conjunto-datos.json), a escala
// con los 9,1 m de largo de Kratos; la sección, de las del museo de la Fuerza
// Aérea y la de los Marines en la rampa.
// Todo en metros; al final, a unidades de la maqueta (1 unidad = 3 m).
// Fotos a tamaño completo en arte/uas-fuentes/xq-58-valkyrie/ (fuera de Git;
// tabla en docs/drones/xq-58-valkyrie.md).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 3;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const DVIDS = "https://www.dvidshub.net/image/";

// ── Fuselaje ─────────────────────────────────────────────────────────────────
// z hacia el morro (punta en 4,55, cola en −4,55) e y = 0 a la altura de la
// punta del morro. Cada sección, en dos tramos con arista viva entre ellos: la
// mitad de arriba, del lomo a la arista del costado (el «chine», que va del
// morro a la cola y en medio se hace borde de ataque del ala), y la de abajo,
// de la arista a la panza.
type T2 = [number, number];
const tabla = (pts: T2[]) => (z: number) => {
  const p = pts.slice().sort((a, b) => a[0] - b[0]);
  if (z <= p[0][0]) return p[0][1];
  if (z >= p[p.length - 1][0]) return p[p.length - 1][1];
  const i = p.findIndex(([q]) => q >= z);
  const [z0, v0] = p[i - 1], [z1, v1] = p[i];
  return v0 + ((v1 - v0) * (z - z0)) / (z1 - z0);
};
// Medio ancho en la arista del costado y su altura.
const ARISTA = tabla([[4.55, 0], [4.35, 0.05], [4.0, 0.13], [3.5, 0.24], [3.0, 0.34], [2.5, 0.43], [2.0, 0.51], [1.5, 0.57], [1.0, 0.62], [0.3, 0.65], [-0.5, 0.66], [-1.5, 0.64], [-2.5, 0.59], [-3.2, 0.53], [-3.9, 0.45], [-4.1, 0.36], [-4.3, 0.24], [-4.45, 0.13], [-4.55, 0.03]]);
const Y_ARISTA = tabla([[4.55, 0], [3.5, 0.03], [2.5, 0.08], [1.8, 0.1], [1.0, 0.06], [0, 0.0], [-1.5, -0.08], [-3.0, -0.15], [-3.9, -0.22], [-4.55, -0.31]]);
// Lo alto de los hombros (el cuerpo sin el lomo del motor) y lo bajo de la
// panza, en el eje.
const HOMBRO = tabla([[4.55, 0], [4.35, 0.04], [4.0, 0.1], [3.5, 0.17], [3.0, 0.23], [2.5, 0.29], [2.0, 0.33], [1.45, 0.36], [0, 0.32], [-1.5, 0.27], [-2.5, 0.22], [-3.5, 0.17], [-3.9, 0.18], [-4.1, 0.13], [-4.3, 0.03], [-4.45, -0.13], [-4.55, -0.3]]);
// La panza, medida contra la foto de perfil de los Marines (encajada).
const PANZA = tabla([[4.55, 0], [4.35, -0.07], [4.0, -0.19], [3.5, -0.31], [3.0, -0.41], [2.5, -0.49], [2.0, -0.53], [1.0, -0.595], [0, -0.63], [-1.0, -0.64], [-2.0, -0.62], [-2.8, -0.57], [-3.5, -0.485], [-3.9, -0.45], [-4.2, -0.42], [-4.45, -0.37], [-4.55, -0.33]]);
// Lomo del motor: nace en la boca de la toma (z 1,45) y acaba en el fondo de
// la tobera (z −3,72). Lo alto, en el eje, y su medio ancho.
const LOMO = { boca: 1.45, tobera: -3.72 };
// Donde acaba la capota de la toma, metida bajo la piel del lomo.
const COLA_TOMA = 1.0;
const ALTO_LOMO = tabla([[1.45, 0.61], [1.0, 0.608], [0, 0.57], [-1.0, 0.5], [-2.0, 0.42], [-3.0, 0.33], [-3.5, 0.27], [-3.89, 0.22]]);
const ANCHO_LOMO = tabla([[1.45, 0.55], [0, 0.56], [-2.0, 0.5], [-3.0, 0.42], [-3.89, 0.36]]);
// Detrás de la tobera, la canal: el suelo baja hasta la punta de la cola entre
// dos paredes (los hombros). Arriba, el lomo sigue un poco por los lados y se
// apaga hacia atrás: su borde con la canal baja y se abre hacia la cola, el
// capó de la tobera (foto de los Marines en la rampa, de tres cuartos atrás).
const SUELO_CANAL = tabla([[-3.9, -0.26], [-4.1, -0.27], [-4.3, -0.29], [-4.45, -0.3], [-4.55, -0.3]]);
const ANCHO_CANAL = tabla([[-3.72, 0.24], [-3.9, 0.3], [-4.3, 0.2], [-4.55, 0.03]]);
const suave = (t: number) => { const u = Math.min(1, Math.max(0, t)); return u * u * (3 - 2 * u); };
const apagaLomo = (z: number) => 1 - suave((LOMO.tobera - z) / 0.38);

// Mitad de arriba sin lomo: una «tienda» de caras casi planas que suben de la
// arista y se redondean arriba (fotos del morro en el museo y en la ILA).
const tienda = (u: number, r: number) => (Math.sqrt(1 + r * r) - Math.sqrt(Math.min(1, u) ** 2 + r * r)) / (Math.sqrt(1 + r * r) - r);
const hombros = (z: number, x: number) => {
  const c = ARISTA(z), yc = Y_ARISTA(z);
  if (c < 1e-6) return yc;
  return yc + (HOMBRO(z) - yc) * tienda(x / c, 0.32);
};
// El lomo (o, en la canal, el hundimiento), sumado a los hombros; se funde
// con ellos sin arista.
const campana = (x: number, ancho: number) => (x >= ancho ? 0 : (1 - (x / ancho) ** 2.5) ** 1.6);
// En la toma, el lomo es una caja de techo plano y paredes casi verticales
// (fotos del museo); hacia atrás se suaviza poco a poco hasta la campana (z −1,5), sin cintura.
const caja = (x: number, ancho: number) => (x >= ancho ? 0 : (1 - (x / ancho) ** 6) ** 0.4);
const kCaja = (z: number) => { const t = Math.min(1, Math.max(0, (z + 1.5) / (LOMO.boca + 1.5))); return t * t * (3 - 2 * t); };
const forma = (z: number, x: number, ancho: number) => (1 - kCaja(z)) * campana(x, ancho) + kCaja(z) * caja(x, ancho);
// En la caja, lo alto se cuenta desde los hombros de cada punto: techo plano
// de lado a lado, sin la curva de la tienda (fotos del museo).
const conLomo = (z: number, x: number, alto: number, ancho: number) => hombros(z, x) + (alto - HOMBRO(z) - (hombros(z, x) - HOMBRO(z)) * kCaja(z)) * forma(z, x, ancho);
// Justo detrás de la boca, el lomo se hunde un poco bajo la capota (que lo
// tapa): el canto de la boca no asoma por ella.
const bajoCapota = (z: number, x: number) => (x >= ANCHO_LOMO(z) ? 0 : 0.015 * suave((z - COLA_TOMA) / 0.4) * (1 - (x / ANCHO_LOMO(z)) ** 10));
// Delante de la toma, la rampa: el suelo se hunde poco a poco hasta la boca.
// Detrás de la tobera, el lomo que se apaga, sin la canal (el capó de la
// tobera va por aquí).
const sobreCanal = (z: number, x: number) => hombros(z, x) + (ALTO_LOMO(z) - HOMBRO(z)) * campana(x, ANCHO_LOMO(z)) * apagaLomo(z);
const RAMPA = tabla([[2.7, 0], [2.3, 0.02], [1.93, 0.04], [1.45, 0.06]]);
const arriba = (z: number, x: number) => {
  if (z <= LOMO.boca && z >= LOMO.tobera) return conLomo(z, x, ALTO_LOMO(z), ANCHO_LOMO(z)) - bajoCapota(z, x);
  if (z < LOMO.tobera) {
    const w = ANCHO_CANAL(z);
    return sobreCanal(z, x) + (SUELO_CANAL(z) - sobreCanal(z, x)) * (x >= w ? 0 : 1 - (x / w) ** 8);
  }
  return hombros(z, x) - RAMPA(z) * campana(x, ANCHO_LOMO(LOMO.boca));
};
// Mitad de abajo: otra tienda, más chata, hasta una panza ancha.
const abajo = (z: number, x: number) => {
  const c = ARISTA(z), yc = Y_ARISTA(z);
  if (c < 1e-6) return yc;
  return yc - (yc - PANZA(z)) * tienda(x / c, 0.55);
};
// Puntos de 0 a c, más juntos cerca de la arista.
const xs = (c: number, n: number) => Array.from({ length: n + 1 }, (_, i) => c * Math.sin((Math.PI / 2) * (i / n)));
const seccion = (z: number): Seccion => {
  const c = ARISTA(z), yc = Y_ARISTA(z);
  const alto = xs(c, 48).map((x): T2 => [x, arriba(z, x)]);
  const bajo = xs(c, 16).reverse().map((x): T2 => [x, abajo(z, x)]);
  return { z, ancho: c, arriba: alto[0][1], abajo: bajo[bajo.length - 1][1], cintura: yc, contorno: [alto, bajo] };
};
const ZS = [4.55, 4.45, 4.3, 4.0, 3.5, 3.0, 2.5, 2.2, 1.93, 1.75, 1.6, 1.46, 1.45, 1.3, 1.2, 1.1, 1.0, 0.5, 0, -0.6, -1.2, -1.8, -2.4, -3.0, -3.4, -3.6, -3.72, -3.73, -3.8, -3.9, -4.05, -4.2, -4.35, -4.47, -4.55];
const SECCIONES = ZS.map(seccion);

// ── Toma de aire ─────────────────────────────────────────────────────────────
// Encima del morro, delante del lomo: una capota con la sección del lomo,
// techo plano de lado a lado, esquinas redondeadas y paredes casi verticales.
// El labio va recto por el techo (z 1,93); desde las esquinas cae por las
// paredes y se va hacia atrás hasta su pie (z 1,74; foto de perfil,
// encajada): de frente, horizontal arriba y luego cae (fotos del museo y de
// la ILA). Delante, la rampa hundida; al fondo, la boca del conducto, la
// cara oscura del frente del lomo. Detrás de la boca, la capota sigue unos
// centímetros pegada al lomo y se mete poco a poco bajo su piel (acaba en z
// 1,0): así tapa el canto de la boca del fuselaje y la unión no hace raya.
const TOMA = { labio: 1.93, lados: 1.74, fin: LOMO.boca, cola: COLA_TOMA, grosor: 0.05, esquina: 0.7 };
const ANCHO_TOMA = ANCHO_LOMO(LOMO.boca);
const anchoCapota = (z: number) => Math.max(ANCHO_TOMA, z < TOMA.fin ? ANCHO_LOMO(z) : 0);
// Techo horizontal hasta la boca; detrás, el del lomo.
const altoCapota = (z: number) => (z < TOMA.fin ? ALTO_LOMO(z) : ALTO_LOMO(LOMO.boca));
// Un pelo por encima del cuerpo, para que no se pisen, salvo al pie de las
// paredes, que se meten 2 cm en él delante de la boca; hacia
// atrás, poco a poco a ras (sin escalón ni quiebro).
const fuera = (z: number, x: number) => {
  const w = anchoCapota(z);
  const g = suave((z - TOMA.cola) / 0.4);
  return conLomo(z, x, altoCapota(z), w) + 0.001 + 0.005 * g - 0.02 * suave((z - TOMA.fin) / 0.1) * (x / w) ** 10;
};
// Cáscaras (la capota y el capó de la tobera): una media sección de lo alto
// (x = 0) al pie, recortada entre dos fracciones de su largo (lo demás lo
// corta el labio), y la misma metida hacia dentro el grueso, entre un suelo y
// un techo.
const acumulado = (p: T2[]) => p.reduce((L: number[], q, i) => [...L, i ? L[i - 1] + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0], []);
const cortar = (p: T2[], de: number, a: number, n: number): T2[] => {
  const L = acumulado(p), tot = L[L.length - 1];
  let i = 1;
  return Array.from({ length: n + 1 }, (_, k): T2 => {
    const d = tot * (de + ((a - de) * k) / n);
    while (i < p.length - 1 && L[i] < d) i++;
    const t = Math.min(1, Math.max(0, (d - L[i - 1]) / (L[i] - L[i - 1] || 1)));
    return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t];
  });
};
const metida = (p: T2[], g: number, suelo: (x: number) => number, techo: (x: number) => number): T2[] =>
  p.map(([x, y], i): T2 => {
    const [a, b] = [p[Math.max(0, i - 1)], p[Math.min(p.length - 1, i + 1)]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const q = Math.max(0, x + ((b[1] - a[1]) / l) * g);
    return [q, Math.min(techo(q), Math.max(suelo(q), y - ((b[0] - a[0]) / l) * g))];
  });
const perfilCapota = (z: number) => xs(anchoCapota(z), 48).map((x): T2 => [x, fuera(z, x)]);
// Hasta dónde llega la capota en la sección z: delante del labio, solo el
// techo; de ahí al pie de las paredes, cada vez más abajo.
const corteCapota = (z: number, p: T2[]) => {
  const L = acumulado(p);
  const esq = L[p.findIndex(([x]) => x >= TOMA.esquina * anchoCapota(z))] / L[L.length - 1];
  return esq + (1 - esq) * Math.min(1, Math.max(0, (TOMA.labio - z) / (TOMA.labio - TOMA.lados)));
};
const seccionCapota = (z: number): Seccion => {
  const p = perfilCapota(z);
  const ext = cortar(p, 0, corteCapota(z, p), 36);
  // Delante del labio, sin grueso: cierra el canto.
  const int = z > TOMA.labio ? ext.map((q): T2 => [q[0], q[1]]) : metida(ext, TOMA.grosor, (x) => arriba(z, x) + 0.003, (x) => fuera(z, x) - 0.004);
  const pie = ext[ext.length - 1];
  return { z, ancho: pie[0], arriba: ext[0][1], abajo: int[0][1], contorno: [ext, [pie, int[int.length - 1]], int.reverse()] };
};
const SECCIONES_CAPOTA = [TOMA.labio + 0.012, TOMA.labio, 1.925, 1.915, 1.9, 1.88, 1.86, 1.84, 1.82, 1.8, 1.78, 1.76, TOMA.lados, 1.65, 1.55, TOMA.fin, 1.38, 1.3, 1.2, 1.1, TOMA.cola].map(seccionCapota);
// La boca: entre el suelo y el interior de la capota, en el frente del lomo.
const BOCA: T2[] = [
  ...xs(ANCHO_TOMA, 16).map((x): T2 => [x, fuera(LOMO.boca, x) - TOMA.grosor]),
  ...xs(ANCHO_TOMA, 16).reverse().map((x): T2 => [x, arriba(LOMO.boca + 0.01, x) + 0.004]),
];
// Por dentro, la capota es negra como el conducto (fotos del museo): un forro
// pegado bajo su techo, un pelo más corto que ella.
const seccionForro = (z: number): Seccion => {
  const p = perfilCapota(z);
  const c = cortar(p, 0, corteCapota(z, p) - 0.02, 36);
  const ext = metida(c, TOMA.grosor + 0.002, (x) => arriba(z, x) + 0.002, (x) => fuera(z, x) - 0.006);
  const int = metida(c, TOMA.grosor + 0.008, (x) => arriba(z, x) + 0.001, (x) => fuera(z, x) - 0.008);
  return { z, ancho: ext[ext.length - 1][0], arriba: ext[0][1], abajo: int[0][1], contorno: [ext, [ext[ext.length - 1], int[int.length - 1]], int.reverse()] };
};
const SECCIONES_FORRO = [1.92, 1.915, 1.9, 1.88, 1.86, 1.84, 1.82, 1.8, 1.78, 1.76, TOMA.lados, 1.65, 1.55, TOMA.fin + 0.004].map(seccionForro);

// ── Tobera ───────────────────────────────────────────────────────────────────
// La tobera redonda, grande, de canto fino, metida bajo un capó: la piel del
// lomo sigue por encima unos centímetros más, fina, y su borde arranca justo
// detrás de la tobera, arriba, y baja y se va hacia atrás por los lados hasta
// las paredes de la canal (fotos de los Marines en la rampa, de tres cuartos
// atrás, y del cuarto vuelo, desde arriba y detrás).
const TOBERA = { y: -0.01, r: 0.2, labio: 0.012, z: LOMO.tobera - 0.09 };
const CAPO = { desde: LOMO.tobera + 0.02, borde: TOBERA.z - 0.04, pie: TOBERA.z - 0.16, grosor: 0.02 };
// Un pelo por encima del lomo, con su misma forma: sin cruzarse con él, la
// unión no hace raya ni arrugas.
const anchoCapo = (z: number) => ANCHO_CANAL(z) + 0.04;
const fueraCapo = (z: number, x: number) => sobreCanal(z, x) + 0.002;
const perfilCapo = (z: number) => xs(anchoCapo(z), 40).map((x): T2 => [x, fueraCapo(z, x)]);
// Lo que queda del capó en la sección z: entero hasta el borde; de ahí al
// pie, solo los lados, cada vez más abajo.
const seccionCapo = (z: number): Seccion => {
  const p = perfilCapo(z);
  const ext = cortar(p, Math.min(0.98, Math.max(0, (CAPO.borde - z) / (CAPO.borde - CAPO.pie))), 1, 28);
  const int = metida(ext, CAPO.grosor, (x) => arriba(z, x) + 0.003, (x) => fueraCapo(z, x) - 0.002).reverse();
  return { z, ancho: ext[ext.length - 1][0], arriba: ext[0][1], abajo: int[int.length - 1][1], contorno: [ext, int, [int[int.length - 1], ext[0]]] };
};
const SECCIONES_CAPO = [CAPO.desde, LOMO.tobera, LOMO.tobera - 0.01, -3.76, -3.8, CAPO.borde, ...[0.2, 0.4, 0.6, 0.8].map((t) => CAPO.borde + (CAPO.pie - CAPO.borde) * t), CAPO.pie].map(seccionCapo);

// ── Ala ──────────────────────────────────────────────────────────────────────
// Del encaje: punta del borde de ataque en (4,09, 0,09, −1,53), del de
// salida en z −2,2; el borde de ataque, en flecha de 34°, nace de la arista
// del costado en z 0,84; el de salida, casi recto, en z −0,95. Fina, con un
// poco de diedro y la punta roja aparte (una tapa con su junta). Nace de la
// arista, a su altura. En la raíz, el borde de salida no llega recto al
// cuerpo: se curva hacia atrás y se funde con la arista (la muesca de las
// fotos de los Marines, de perfil y desde arriba).
// Nace justo en la arista: inclinada como ella (baja hacia atrás), y con más
// diedro para que la punta siga donde se midió.
const ALA = { y: 0.0, cabeceo: 0.053, raiz: 0.45, punta: 4.1, tapa: 3.93, sube: 0.17, tRaiz: 0.13, tPunta: 0.035 };
// El borde de salida, recto de la punta (z −2,2) a la esquina de la muesca
// (x 1,0, z −0,81; foto desde arriba, encajada); desde ahí se curva hacia
// atrás hasta la arista (x 0,66, z −1,45).
const MUESCA: T2[] = [[0.45, -1.6], [0.66, -1.45], [0.72, -1.2], [0.8, -0.99], [0.88, -0.87], [0.95, -0.82]];
const bordeAtaque = (x: number) => -1.53 + 0.684 * (4.09 - x);
const bordeSalida = (x: number) => (x >= 1.0 ? -2.2 + 0.45 * (4.1 - x) : tabla([...MUESCA, [1.0, -0.805]])(x));
const grosorAla = (x: number) => ALA.tRaiz + ((ALA.tPunta - ALA.tRaiz) * (x - ALA.raiz)) / (ALA.punta - ALA.raiz);
const subeAla = (x: number) => (ALA.sube * (x - ALA.raiz)) / (ALA.punta - ALA.raiz);
const estAla = (x: number): [number, number, number, number, number] => [x, bordeAtaque(x), bordeSalida(x), grosorAla(x), subeAla(x)];
// Alerón en la mitad de fuera del borde de salida (la línea de la bisagra,
// en la foto de los Marines desde arriba), con su hueco.
const MANDO = { cuerda: 0.25, hueco: 0.006, desde: 2.3, hasta: 3.85 };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda;
const estAlaCorta = (x: number): [number, number, number, number, number] => [x, bordeAtaque(x), bisagra(x), grosorAla(x), subeAla(x)];
const estMando = (x: number): [number, number, number, number, number] => [x, bisagra(x) - MANDO.hueco, bordeSalida(x), grosorAla(x) * 0.45, subeAla(x) - grosorAla(x) * 0.06];

// ── Cola en V ────────────────────────────────────────────────────────────────
// Medida en la foto de perfil y en la de arriba (encajadas), que casan a
// pocos centímetros: de z −2,66 a −3,57 en la raíz y llega a la punta en
// (2,05, 1,12), de −3,63 a −4,06. Su plano pasa por la arista del costado
// (x 0,54, y −0,155): nace justo en ella, abierta a 40° sobre la horizontal. El borde de salida se quiebra a un
// tercio de la punta (x 1,6, z −4,29): de ahí abajo se recorta hacia delante.
// Puntas rojas aparte.
const DERIVA = { raiz: 0.42, quiebro: 1.6, punta: 2.05, tapa: 1.89, tRaiz: 0.08, tPunta: 0.03 };
const recta = (x0: number, v0: number, x1: number, v1: number) => (x: number) => v0 + ((v1 - v0) * (x - x0)) / (x1 - x0);
const yDeriva = recta(0.54, -0.155, 2.05, 1.12);
const baDeriva = recta(0.55, -2.66, 2.05, -3.63);
const bsDeriva = (x: number) => (x < DERIVA.quiebro ? recta(0.55, -3.57, DERIVA.quiebro, -4.29)(x) : recta(DERIVA.quiebro, -4.29, 2.05, -4.06)(x));
const tDeriva = recta(DERIVA.raiz, DERIVA.tRaiz, DERIVA.punta, DERIVA.tPunta);
const Y_DERIVA = yDeriva(DERIVA.raiz);
const estDeriva = (x: number): [number, number, number, number, number] => [x, baDeriva(x), bsDeriva(x), tDeriva(x), yDeriva(x) - Y_DERIVA];

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-xq", secciones: SECCIONES },
  { tipo: "casco", id: "capota", acabado: "gris-xq", abierto: true, tapaPlana: true, secciones: SECCIONES_CAPOTA },
  { tipo: "casco", id: "toma-forro", acabado: "hueco", abierto: true, secciones: SECCIONES_FORRO },
  { tipo: "prisma", id: "toma-boca", acabado: "hueco", eje: "z", simetrica: true, y: LOMO.boca + 0.002, alto: 0.002, planta: BOCA },
  { tipo: "casco", id: "capo-tobera", acabado: "gris-xq", abierto: "atras", facetas: true, secciones: SECCIONES_CAPO },
  { tipo: "tubo", id: "tobera", acabado: "gris-xq", centro: [0, TOBERA.y], perfil: [[LOMO.tobera + 0.02, TOBERA.r], [TOBERA.z, TOBERA.r], [TOBERA.z, TOBERA.r - TOBERA.labio], [LOMO.tobera + 0.02, TOBERA.r - TOBERA.labio]] },
  { tipo: "tubo", id: "tobera-boca", acabado: "hueco", centro: [0, TOBERA.y], perfil: [[TOBERA.z + 0.05, 0], [TOBERA.z + 0.05, TOBERA.r - TOBERA.labio + 0.002], [TOBERA.z + 0.048, TOBERA.r - TOBERA.labio + 0.002], [TOBERA.z + 0.048, 0]] },
  { tipo: "ala", id: "ala", acabado: "gris-xq", y: ALA.y, cabeceo: ALA.cabeceo, raizDentro: true, estaciones: [
    ...MUESCA.map(([x]) => estAla(x)), estAla(1.0), estAla(MANDO.desde), estAlaCorta(MANDO.desde), estAlaCorta(MANDO.hasta), estAla(MANDO.hasta), estAla(ALA.tapa),
  ] },
  { tipo: "ala", id: "alerones", acabado: "gris-xq", y: ALA.y, cabeceo: ALA.cabeceo, estaciones: [estMando(MANDO.desde + MANDO.hueco), estMando(MANDO.hasta - MANDO.hueco)] },
  { tipo: "ala", id: "ala-puntas", acabado: "rojo-xq", y: ALA.y, cabeceo: ALA.cabeceo, estaciones: [estAla(ALA.tapa + 0.004), estAla(ALA.punta)] },
  { tipo: "ala", id: "derivas", acabado: "gris-xq", y: Y_DERIVA, raizDentro: true, estaciones: [estDeriva(DERIVA.raiz), estDeriva(DERIVA.quiebro), estDeriva(DERIVA.tapa)] },
  { tipo: "ala", id: "derivas-puntas", acabado: "rojo-xq", y: Y_DERIVA, estaciones: [estDeriva(DERIVA.tapa + 0.004), estDeriva(DERIVA.punta)] },
  // Antenas: una pala sobre la capota (foto de la rampa) y una varilla en la
  // punta de la canal.
  { tipo: "placa", id: "antena-capota", acabado: "gris-xq", plano: "vertical", x: 0, grosor: 0.014, bisel: 0.004, planta: [[1.68, 0.62], [1.58, 0.62], [1.57, 0.7], [1.61, 0.7]] },
  { tipo: "varilla", id: "varilla-cola", acabado: "metal", desde: [0, -0.3, -4.54], hasta: [0, -0.3, -4.74], radio: 0.008 },
];

// ── Detalle pintado del HD: el 170741 («108») ───────────────────────────────
// Marcas en gris claro sobre el gris; puntas rojas (piezas aparte). Las del
// costado van debajo de la arista, en la cara de abajo (foto de perfil).
const CLARO = "#c3cad0", ESCARAPELA = "#9fadb5", OSCURO = "#24292d";
// Un punto del costado derecho (x negativa) a `bajo` metros por debajo de la
// arista, y la dirección desde la que se proyecta (la cara de abajo mira
// afuera y algo hacia abajo).
const costado = (z: number, bajo: number): [number, number, number] => [-(ARISTA(z) - bajo * 0.55), Y_ARISTA(z) - bajo, z];
const LADO_BAJO: [number, number, number] = [-1, -0.45, 0];
// Un punto de la deriva izquierda (x positiva) a una fracción de su envergadura
// y de su cuerda, y las normales de sus dos caras: la de fuera mira afuera y
// abajo; la de dentro, adentro y arriba.
const enDeriva = (s: number, t: number): [number, number, number] => {
  const x = DERIVA.raiz + (DERIVA.punta - DERIVA.raiz) * s;
  const ba = baDeriva(x), bs = bsDeriva(x);
  return [x, yDeriva(x), ba + (bs - ba) * t];
};
const pendiente = Math.atan2(yDeriva(1) - yDeriva(0), 1);
const DERIVA_FUERA: [number, number, number] = [Math.sin(pendiente), -Math.cos(pendiente), 0];
const DERIVA_DENTRO: [number, number, number] = [-Math.sin(pendiente), Math.cos(pendiente), 0];
// Un punto sobre el ala a una distancia del eje y a una fracción de la cuerda.
const sobreAla = (x: number, t: number): [number, number, number] => {
  const z = bordeAtaque(Math.abs(x)) + (bordeSalida(Math.abs(x)) - bordeAtaque(Math.abs(x))) * t;
  return [x, ALA.y + subeAla(Math.abs(x)) + ALA.cabeceo * z + 0.06, z];
};
// La «V» blanca del costado de la capota («DANGER JET INTAKE»): una línea por
// el borde del labio y otra por el pie, que se juntan detrás. Una calca por
// costado: con `espejo`, la del izquierdo saldría además subida o bajada.
const V_TOMA: T2[] = [[0, 0.5], [1, 1], [1, 0.8], [0.22, 0.5], [1, 0.2], [1, 0]];
const vToma = (lado: 1 | -1): Calca => ({
  sobre: ["capota", "fuselaje"], en: [lado * 0.4, 0.47, 1.66], desde: [lado, 0.8, 0], tam: [0.55, 0.24],
  dibujo: { tipo: "poligono", color: CLARO, puntos: V_TOMA.map(([a, b]) => [lado < 0 ? a : 1 - a, b]) },
});
const CALCAS: Calca[] = [
  // Costado, de atrás adelante: caja oscura, rejilla, tapa clara y toma
  // pequeña del morro;
  // escarapela de baja visibilidad delante del ala y «MARINES» detrás.
  { sobre: ["fuselaje"], en: costado(2.36, 0.09), desde: LADO_BAJO, tam: [0.38, 0.12], dibujo: { tipo: "malla", hex: true }, espejo: true },
  { sobre: ["fuselaje"], en: costado(1.72, 0.09), desde: LADO_BAJO, tam: [0.36, 0.15], dibujo: { tipo: "rect", color: OSCURO }, espejo: true },
  { sobre: ["fuselaje"], en: costado(2.45, 0.42), desde: LADO_BAJO, tam: [0.4, 0.16], dibujo: { tipo: "rect", color: "#8e979d" }, espejo: true },
  { sobre: ["fuselaje"], en: costado(3.08, 0.1), desde: LADO_BAJO, tam: [0.34, 0.15], dibujo: { tipo: "rect", color: OSCURO }, espejo: true },
  { sobre: ["fuselaje"], en: costado(0.82, 0.3), desde: LADO_BAJO, tam: [0.42, 0.21], dibujo: { tipo: "escarapela", color: ESCARAPELA }, espejo: true },
  // «MARINES», entero por encima de la arista y subiendo hacia el morro, de
  // la raíz de la cola hacia delante (foto de perfil). Una calca en cada
  // costado.
  ...([1, -1] as const).map((lado): Calca => ({ sobre: ["fuselaje"], en: [lado * 0.6, 0.06, -1.72], desde: [lado, 0.15, 0], tam: [1.8, 0.24], giro: -lado * 3, dibujo: { tipo: "texto", texto: "MARINES", color: CLARO, letra: "din", llenar: true } })),
  vToma(1), vToma(-1),
  // La rampa de la toma, desde arriba: el conducto que entra, oscuro; en
  // punta hacia el morro (foto de los Marines desde arriba).
  { sobre: ["fuselaje"], en: [0, 0.4, 2.0], desde: [0, 1, 0.001], tam: [1.1, 1.1], mate: true, dibujo: { tipo: "poligono", color: "#14181b", puntos: [[0.5, 0], [0.92, 0.62], [0.92, 1], [0.08, 1], [0.08, 0.62]] } },
  // Bajo la capota, el suelo ya es el conducto: oscuro de pared a pared.
  { sobre: ["fuselaje"], en: [0, 0.4, (TOMA.labio + LOMO.boca) / 2], desde: [0, 1, 0.001], tam: [1.08, TOMA.labio - LOMO.boca], mate: true, dibujo: { tipo: "rect", color: "#14181b" } },
  // Derivas: por fuera, «108», el escudo del Departamento de Aviación de los
  // Marines y, abajo, «XQ-58A / 170741»; por dentro, el del Laboratorio de Combate (de su web y de
  // Commons, tal cual).
  { sobre: ["derivas"], en: enDeriva(0.7, 0.42), desde: DERIVA_FUERA, tam: [0.6, 0.25], dibujo: { tipo: "texto", texto: "108", color: CLARO, letra: "din" }, espejo: true },
  { sobre: ["derivas"], en: enDeriva(0.13, 0.36), desde: DERIVA_FUERA, tam: [0.68, 0.28], dibujo: { tipo: "texto", texto: "XQ-58A\n170741", color: CLARO, letra: "din-estrecha" }, espejo: true },
  { sobre: ["derivas"], en: enDeriva(0.36, 0.42), desde: DERIVA_FUERA, tam: [0.56, 0.56], dibujo: { tipo: "imagen", src: "/uas/xq-58-valkyrie/logos/aviacion.png" }, espejo: true },
  { sobre: ["derivas"], en: enDeriva(0.55, 0.5), desde: DERIVA_DENTRO, tam: [0.62, 0.73], dibujo: { tipo: "imagen", src: "/uas/xq-58-valkyrie/logos/mcwl.png" }, espejo: true },
  // Encima del ala: la escarapela en la izquierda, con las barras a lo largo
  // de la cuerda, y «MARINES» en la derecha, paralelo al borde de ataque.
  { sobre: ["ala"], en: sobreAla(2.6, 0.45), desde: [0, 1, 0.001], tam: [0.8, 0.4], giro: 90, dibujo: { tipo: "escarapela", color: ESCARAPELA } },
  { sobre: ["ala", "alerones"], en: sobreAla(-2.25, 0.33), desde: [0, 1, 0.001], tam: [1.7, 0.32], giro: 146, dibujo: { tipo: "texto", texto: "MARINES", color: CLARO, letra: "din", llenar: true } },
];
// Juntas y tornillos calcados de las fotos de cerca, cada una encajada con su
// cámara (arte/uas-fuentes/xq-58-valkyrie/hd/): la del 170741 en su rampa
// (DVIDS, 3000 px; las «r-»: morro, lomo, ala y timones) y la de otro avión de
// los Marines en el Pentágono (8256 px; el resto: costado bajo y cola). Cada
// línea trazada en la foto, llevada a la piel de la maqueta. Cada tramo:
// nombre, piezas sobre las que va, dirección desde la que se proyecta,
// tornillos cada tantos metros (0, sin ellos) y sus puntos. Iguales en los dos
// costados, salvo las tapas que van en el eje (`true` al final).
const SOBRE = { cuerpo: ["fuselaje", "capota"], ala: ["ala", "alerones"], raiz: ["ala", "fuselaje"], deriva: ["derivas"] };
type Junta = [string, keyof typeof SOBRE, [number, number, number], number, [number, number, number][], boolean?];
const JUNTAS: Junta[] = [
  ["r-nariz", "cuerpo", [0.58, 0.8, 0.15], 0.06, [[0.037, 0.112, 3.854], [0.079, 0.085, 3.854], [0.147, 0.03, 3.869]]],
  ["r-nariz", "cuerpo", [0.95, 0.23, 0.22], 0.06, [[0.147, 0.03, 3.869], [0.154, 0.013, 3.882]]],
  ["r-nariz", "cuerpo", [0.84, -0.51, 0.18], 0.06, [[0.154, 0.013, 3.882], [0.105, -0.101, 3.859], [0.076, -0.166, 3.83], [0.043, -0.215, 3.812], [0.02, -0.234, 3.814]]],
  ["r-lomo-morro", "cuerpo", [0.47, 0.88, 0.11], 0.07, [[0.011, 0.12, 3.858], [0.04, 0.127, 3.745], [0.089, 0.137, 3.5], [0.173, 0.182, 2.863], [0.195, 0.215, 2.484], [0.183, 0.237, 2.168]]],
  ["r-lomo-morro", "cuerpo", [0.8, 0.6, 0.01], 0.07, [[0.183, 0.237, 2.168], [0.536, 0.324, 1.813]]],
  ["r-lomo-morro", "cuerpo", [0.99, 0.15, -0.01], 0.07, [[0.536, 0.324, 1.813], [0.533, 0.342, 1.578]]],
  ["r-C", "cuerpo", [0.95, 0.25, 0.19], 0.06, [[0.337, 0.071, 2.919], [0.36, 0.059, 2.888]]],
  ["r-C", "cuerpo", [0.86, -0.49, 0.14], 0.06, [[0.36, 0.059, 2.888], [0.231, -0.191, 2.871], [0.175, -0.281, 2.873], [0.126, -0.345, 2.884]]],
  ["r-B", "cuerpo", [0.83, -0.54, 0.11], 0.07, [[0.026, -0.311, 3.464], [0.059, -0.302, 3.405], [0.11, -0.284, 3.241], [0.165, -0.262, 3.015], [0.265, -0.208, 2.566], [0.327, -0.171, 2.243], [0.405, -0.132, 1.755], [0.512, -0.08, 1.137]]],
  ["r-capota-cola", "cuerpo", [0.96, 0.28, -0.02], 0, [[0.545, 0.27, 1.297], [0.537, 0.341, 1.226], [0.52, 0.411, 1.163], [0.501, 0.461, 1.122], [0.472, 0.507, 1.088]]],
  ["r-capota-cola", "cuerpo", [0.64, 0.77, -0.08], 0, [[0.472, 0.507, 1.088], [0.432, 0.546, 1.062], [0.394, 0.569, 1.056]]],
  ["r-capota-cola", "cuerpo", [0.11, 0.99, -0.05], 0, [[0.394, 0.569, 1.056], [0.34, 0.588, 1.064], [0.304, 0.596, 1.076], [0.213, 0.606, 1.117], [0, 0.612, 1.163]]],
  ["r-zigzag", "cuerpo", [0.57, 0.81, -0.14], 0, [[0.467, 0.446, 0.664], [0.403, 0.505, 0.656], [0.36, 0.531, 0.663], [0.307, 0.556, 0.679]]],
  ["r-zigzag", "cuerpo", [0.05, 1, -0.07], 0, [[0.307, 0.556, 0.679], [0.201, 0.586, 0.726], [0.108, 0.594, 0.693], [0, 0.597, 0.68]]],
  ["r-zigzag-frente", "cuerpo", [0.88, 0.47, -0.09], 0, [[0.467, 0.446, 0.664], [0.498, 0.39, 0.626], [0.521, 0.332, 0.595]]],
  ["r-lomo-lado-b", "cuerpo", [0.82, 0.57, -0.11], 0, [[0.521, 0.332, 0.595], [0.485, 0.316, 0.17], [0.406, 0.286, -0.441], [0.381, 0.227, -0.978]]],
  ["r-panel-motor", "cuerpo", [0.6, 0.79, -0.11], 0, [[0.406, 0.286, -0.441], [0.304, 0.393, -0.476], [0.252, 0.436, -0.485], [0.192, 0.478, -0.486], [0.107, 0.509, -0.593]]],
  ["r-panel-motor", "cuerpo", [0.22, 0.97, -0.08], 0, [[0.107, 0.509, -0.593], [0.059, 0.52, -0.629], [0.005, 0.529, -0.588]]],
  ["r-cola-panel", "cuerpo", [0.63, 0.77, -0.08], 0.05, [[0.397, 0.21, -0.948], [0.262, 0.348, -1.135], [0.191, 0.422, -1.036], [0.134, 0.452, -1.123], [0.075, 0.473, -1.181], [0.07, 0.469, -1.261]]],
  ["r-cola-panel", "cuerpo", [0.17, 0.98, -0.08], 0.05, [[0.07, 0.469, -1.261], [0.044, 0.452, -1.548], [0.002, 0.43, -1.876]]],
  ["r-timon-cerca", "deriva", [0.64, -0.77, -0.02], 0, [[1.583, 0.718, -3.995], [0.69, -0.041, -3.361]]],
  ["r-V2", "cuerpo", [0.93, -0.36, 0.09], 0.06, [[0.55, 0.14, 1.651], [0.55, 0.083, 1.624], [0.473, -0.043, 1.647]]],
  ["B2", "cuerpo", [0.85, -0.52, 0.1], 0.07, [[0.337, -0.157, 2.234], [0.434, -0.112, 1.619], [0.442, -0.126, 1.486], [0.468, -0.125, 1.267]]],
  ["P5", "cuerpo", [0.47, 0.88, 0.06], 0.06, [[0.174, 0.234, 2.352], [0.33, 0.151, 2.357], [0.448, 0.096, 2.249]]],
  ["P5", "cuerpo", [0.95, 0.28, 0.15], 0.06, [[0.448, 0.096, 2.249], [0.468, 0.077, 2.227]]],
  ["P5", "cuerpo", [0.82, -0.56, 0.1], 0.06, [[0.468, 0.077, 2.227], [0.415, -0.023, 2.218], [0.298, -0.22, 2.237], [0.223, -0.334, 2.242], [0.134, -0.44, 2.251], [0.079, -0.482, 2.268]]],
  ["capota-pie", "cuerpo", [1, 0.08, 0], 0.07, [[0.544, 0.26, 1.787], [0.545, 0.255, 1.472]]],
  ["P7", "cuerpo", [1, 0.04, 0], 0.06, [[0.543, 0.267, 1.75], [0.55, 0.142, 1.731], [0.55, 0.092, 1.733]]],
  ["P7", "cuerpo", [0.88, -0.46, 0.08], 0.06, [[0.55, 0.092, 1.733], [0.523, 0.067, 1.752], [0.403, -0.118, 1.853]]],
  ["switch", "cuerpo", [0.86, -0.49, 0.11], 0, [[0.411, -0.041, 2.174], [0.432, -0.033, 2.041], [0.393, -0.099, 2.046], [0.372, -0.108, 2.179], [0.411, -0.041, 2.174]]],
  ["puerta-baja", "cuerpo", [0.84, -0.53, 0.09], 0, [[0.284, -0.209, 2.415], [0.297, -0.206, 2.326], [0.228, -0.316, 2.313], [0.215, -0.317, 2.421], [0.284, -0.209, 2.415]]],
  ["lomo-lado", "cuerpo", [1, 0.09, 0], 0, [[0.545, 0.255, 1.472], [0.548, 0.24, 0.975], [0.543, 0.251, 0.615]]],
  ["raya-baja", "cuerpo", [1, 0.04, 0.01], 0, [[0.55, 0.152, 1.355], [0.549, 0.228, 1.027]]],
  ["raya-baja", "cuerpo", [0.89, 0.07, -0.45], 0, [[0.549, 0.228, 1.027], [0.548, 0.24, 0.974]]],
  ["baja-1", "cuerpo", [0.8, -0.59, 0.04], 0.1, [[0.52, -0.147, 0.487], [0.54, -0.144, 0.201], [0.548, -0.154, -0.097], [0.565, -0.155, -0.551]]],
  ["baja-2", "cuerpo", [0.77, -0.64, 0.03], 0.1, [[0.386, -0.323, 0.525], [0.406, -0.318, 0.237], [0.409, -0.331, -0.068], [0.428, -0.325, -0.518]]],
  ["baja-v1", "cuerpo", [0.8, -0.6, 0.05], 0.08, [[0.523, -0.146, 0.451], [0.393, -0.317, 0.466]]],
  ["baja-v2", "cuerpo", [0.79, -0.61, 0.03], 0.08, [[0.546, -0.155, -0.09], [0.41, -0.331, -0.071]]],
  ["baja-v3", "cuerpo", [0.8, -0.59, 0.03], 0.08, [[0.642, -0.043, -0.395], [0.561, -0.152, -0.393]]],
  ["bahia-larga", "cuerpo", [0.79, -0.6, 0.06], 0.1, [[0.329, -0.3, 1.434], [0.36, -0.302, 1.112], [0.387, -0.294, 0.883], [0.389, -0.305, 0.702], [0.4, -0.305, 0.521]]],
  ["Z1", "cuerpo", [0.76, -0.64, 0.08], 0, [[0.391, -0.17, 1.674], [0.325, -0.288, 1.555], [0.222, -0.405, 1.683], [0.154, -0.481, 1.628], [0.117, -0.512, 1.613], [0.09, -0.528, 1.611]]],
  ["Z2", "cuerpo", [0.77, -0.64, 0.08], 0, [[0.436, -0.132, 1.499], [0.405, -0.173, 1.535], [0.331, -0.297, 1.434], [0.23, -0.41, 1.561], [0.162, -0.486, 1.504], [0.1, -0.532, 1.484]]],
];
const COSTURAS: Costura[] = [
  ...JUNTAS.map(([, sobre, desde, remaches, puntos, central]): Costura => ({ sobre: SOBRE[sobre], desde, espejo: !central, puntos, ...(remaches > 0 && { remaches }) })),
  // Dos tapas sobre el lomo, en el eje (foto de la rampa, casi de canto: el
  // tamaño y el sitio, aproximados).
  ...[[0.3, 0.6], [-1.05, -0.75]].map(([z0, z1]): Costura => ({ sobre: ["fuselaje"], desde: [0, 1, 0.001], puntos: [[-0.12, 0.8, z0], [0.12, 0.8, z0], [0.12, 0.8, z1], [-0.12, 0.8, z1], [-0.12, 0.8, z0]] })),
  // Tornillos a lo largo de la junta de las puntas rojas (ala y derivas) y el
  // canto de arriba de cada timón, de la bisagra al borde de salida (fotos de
  // la rampa y del Pentágono).
  { sobre: ["ala"], desde: [0, 1, 0.001], espejo: true, remaches: 0.04, puntos: [0.03, 0.5, 0.97].map((t) => sobreAla(ALA.tapa - 0.012, t)) },
  ...[DERIVA_FUERA, DERIVA_DENTRO].map((desde): Costura => ({ sobre: ["derivas"], desde, espejo: true, remaches: 0.04, puntos: [0.03, 0.5, 0.97].map((t) => enDeriva((DERIVA.tapa - 0.012 - DERIVA.raiz) / (DERIVA.punta - DERIVA.raiz), t)) })),
  ...[DERIVA_FUERA, DERIVA_DENTRO].map((desde): Costura => ({ sobre: ["derivas"], desde, espejo: true, puntos: [[1.588, 0.741, -4.048], enDeriva((1.59 - DERIVA.raiz) / (DERIVA.punta - DERIVA.raiz), 0.995)] })),
];

const PARTES: Parte[] = [
  {
    nombre: "Fuselaje",
    en: [0, 0.95, -0.4],
    piezas: ["fuselaje", "antena-capota", "varilla-cola"],
    respaldo: "foto",
    fuentes: ["perfil", "rampa", "museo", "ila"],
    texto: "9,1 m de largo y de sección en «tienda»: caras casi planas con una arista viva en cada costado, del morro a la cola, que en medio se hace borde de ataque del ala. Encima, el lomo del motor. Sin cabina: lo que sobresale delante es la toma de aire.",
    nota: "La forma, de encajar a la vez cuatro fotos en vuelo, a escala con el largo de Kratos. Va sin tren, como en vuelo.",
  },
  {
    nombre: "Toma de aire",
    en: [0, 0.95, 1.85],
    piezas: ["capota", "toma-forro", "toma-boca"],
    respaldo: "foto",
    fuentes: ["museo", "ila", "rampa", "arriba"],
    texto: "Una sola toma, encima del morro: una capota de techo plano con el labio en punta hacia delante y los lados que bajan hacia atrás. Delante, una rampa hundida lleva el aire a la boca, ancha y baja, y de ahí al motor por un conducto en «S», que esconde sus álabes al radar.",
    nota: "El recorrido del conducto por dentro es supuesto.",
  },
  {
    nombre: "Ala y alerones",
    en: [-2.7, 0.4, -1.2],
    piezas: ["ala", "alerones", "ala-puntas"],
    respaldo: "foto",
    fuentes: ["arriba", "cuarto", "primer"],
    texto: "8,2 m de envergadura, en flecha de unos 34° y fina, con un alerón en la mitad de fuera de cada lado y las puntas en rojo. Encima, la escarapela en la izquierda y «MARINES» en la derecha.",
    nota: "La planta, del encaje de las fotos en vuelo; el alerón, de la línea de su bisagra en la foto desde arriba. Por debajo no hay fotos del 170741: va sin marcas.",
  },
  {
    nombre: "Cola en V",
    en: [1.6, 1.25, -3.8],
    piezas: ["derivas", "derivas-puntas"],
    respaldo: "foto",
    fuentes: ["perfil", "arriba", "primer"],
    texto: "Dos derivas muy abiertas, con timón y la punta roja. Por fuera, «108», el escudo del Departamento de Aviación de los Marines y «XQ-58A 170741»; por dentro, el del Laboratorio de Combate de los Marines, el dragón.",
    nota: "Los dos escudos, los oficiales tal cual (Commons y la web del Laboratorio).",
  },
  {
    nombre: "Tobera",
    en: [0, 0.6, -4.1],
    piezas: ["capo-tobera", "tobera", "tobera-boca"],
    respaldo: "foto",
    fuentes: ["perfil", "arriba", "cuarto"],
    texto: "Al final del lomo sale el chorro del motor, un Williams FJ33, por una tobera redonda al fondo de un capó, que da a una canal entre dos paredes: desde abajo y desde los lados casi no se ve, para que el calor del motor se note menos.",
    nota: "Qué motor lleva el 170741 no se ha publicado; el FJ33 es el de los primeros XQ-58A.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.contorno && { contorno: q.contorno.map((t) => t.map(u2)) }) })) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto) };
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "XQ-58 Valkyrie",
  subtitulo: "Loyal wingman furtivo",
  escala: ESCALA,
  hd: true,
  contornoPixel: true,
  // Sin raya donde la capota y el capó de la tobera siguen al lomo, ni en
  // las raíces del ala y la cola.
  soldadura: 0.08 / ESCALA,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "perfil-marines.jpg", titulo: "El 170741 («108») de los Marines en vuelo, de perfil", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Marine_Corps_XQ-58A_Valkyrie.jpg` },
    { id: "arriba", imagen: "arriba-marines.jpg", titulo: "El «107» de los Marines en vuelo, desde arriba", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}U.S._Marine_Corps_XQ-58A_Valkyrie.jpg` },
    { id: "rampa", imagen: "rampa-eglin.jpg", titulo: "El 170741 en su rampa de lanzamiento, en Eglin AFB", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}8261981` },
    { id: "museo", imagen: "museo-toma.jpg", titulo: "La toma de aire, en el Museo Nacional de la Fuerza Aérea", medio: "Logan Rickert (Wikimedia Commons, CC BY 4.0)", url: `${COMMONS}Kratos_XQ-58A_Valkyrie.jpg` },
    { id: "ila", imagen: "ila.jpg", titulo: "Maqueta con las marcas de los Marines en la ILA de Berlín, 2026", medio: "André Gerwing (Wikimedia Commons, CC BY-SA 4.0)", url: `${COMMONS}Kratos_XQ-58A_Valkyrie_Mockup_2026-06-11_Andre_Gerwing_Collection_ID_029735.jpg` },
    { id: "primer", imagen: "primer-vuelo.jpg", titulo: "El primer XQ-58A en su primer vuelo, de perfil", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}XQ-58A_Valkyrie_demonstrator_first_flight.jpg` },
    { id: "cuarto", imagen: "cuarto-vuelo.jpg", titulo: "En su cuarto vuelo, desde arriba y detrás", medio: "Laboratorio de Investigación de la Fuerza Aérea (Wikimedia Commons)", url: `${COMMONS}AFRL_XQ-58A_Valkyrie_expands_flight_envelope_in_fourth_test_6054347.jpg` },
  ],
};

export default maqueta;
