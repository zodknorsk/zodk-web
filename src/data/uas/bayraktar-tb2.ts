// Maqueta del Bayraktar TB2 de Baykar, con la carga que sale en casi todas
// las fotos armadas: cuatro bombas MAM-L, dos bajo cada ala. Versión 2.0
// (docs/uas-hd.md), con las marcas del TB2 del Ejército de Tierra turco que
// se expuso en Teknofest 2021, en Estambul.
// Medidas de Baykar (12 m de envergadura, 6,5 m de largo). La planta, el
// frente y el morro, del plano de cinco vistas de Alexpl (Wikimedia Commons,
// a 212,6 px/m); su vista de lado no cuadra con la planta detrás del ala
// (mide 6,26 m de largo) y ahí mandan las fotos. Cada pieza se comprobó
// encajando la cámara de varias fotos (arte/uas-fuentes/bayraktar-tb2/hd/,
// fuera de Git) y pintando la maqueta encima desde el mismo ángulo.
// Todo se escribe en metros, con y = 0 en el plano del ala junto a las vigas
// y z = 0 a mitad del largo, y al final se pasa a unidades de la maqueta.
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 4.5;

const BAYKAR = "https://baykartech.com/en/uav/bayraktar-tb2/";
const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// ── Ala ────────────────────────────────────────────────────────────────────
// Recta y larga, con diedro (3,8°: la punta, 0,3 m más alta que junto a las
// vigas) y gruesa (del 18 % de la cuerda junto al cuerpo al 13 % en la
// punta). Junto al cuerpo nace en un carenado grueso que baja por el costado
// hasta la panza (vista de frente del plano y foto de frente de Teknofest
// 2019): ahí el ala es más gruesa, más ancha y está más baja.
const ALA = { punta: 5.97 };
const RAIZ_ALA_X = 1.3;
const bordeAtaque = (x: number) => 0.724 - 0.0571 * (x - 1.5);
const bordeSalida = (x: number) => -0.118 - 0.0106 * (x - 1.5);
// El grosor y la altura van como parámetros del perfil: el grueso total es
// 0,775 veces `t` y la mitad del grueso queda 0,1125·t por encima de `sube`.
const grosorAla = (x: number) => 0.194 - 0.0198 * (x - 1.5);
const subidaAla = (x: number) => 0.028 + 0.0672 * (x - 1.5);
// Cara de arriba y de abajo del ala en x (en su punto más grueso).
const abajoAla = (x: number) => subidaAla(x) - 0.275 * grosorAla(x);
// Punto de la cuerda a la fracción f, del borde de ataque (0) al de salida (1).
const cuerdaAla = (x: number, f: number) => bordeAtaque(x) - f * (bordeAtaque(x) - bordeSalida(x));
type Est = [number, number, number, number, number];
const estAla = (x: number, bs = bordeSalida(x)): Est => [x, bordeAtaque(x), bs, grosorAla(x), subidaAla(x)];
// Carenado de la raíz: [x, borde de ataque, borde de salida, t, sube].
// El ala empieza en x = 1,3, dentro del ensanche del cuerpo y con su mismo
// perfil (ver «Cuerpo»).
const RAIZ: Est[] = [[RAIZ_ALA_X, 0.745, -0.122, 0.236, 0.016]];
// Alerones, dos por ala (plano desde arriba y desde abajo): de 3,68 a 4,8 m
// y de 4,8 a 5,9, con la bisagra a 0,13 m del borde de salida.
const ALERON = { cuerda: 0.13, hueco: 0.006, tramos: [[3.68, 4.8], [4.8, 5.9]] };
const bisagra = (x: number) => bordeSalida(x) + ALERON.cuerda;
const estAleron = (x: number): Est => {
  const [, , , t, sube] = estAla(x);
  return [x, bisagra(x) - ALERON.hueco, bordeSalida(x), t * 0.42, sube - 0.02 * t];
};

// ── Vigas y cola ───────────────────────────────────────────────────────────
// Dos vigas a 1,02 m del centro, que salen del borde de salida y suben un
// poco hacia atrás, hasta pasada la cola, donde acaban en una luz. El plano
// las pone a 1,14, pero las fotos encajadas con la envergadura (12 m) o con
// la hélice (1,7 m) las dan más juntas: de 0,94 a 1,1. Igual las ruedas
// (±0,82; el plano, ±1,0) y los soportes (1,30 y 1,72, en dos fotos; el
// plano, 1,6 y 2,05). El ancho del cuerpo sí cuadra con el plano.
const VIGA = { x: 1.02, r: 0.065, delante: 0.5, detras: -3.36 };
const alturaViga = (z: number) => (Math.max(0, -z) * 0.11) / 3.3;
// Cola en V invertida (plano de frente y fotos de Teknofest 2021): cada
// mitad sube desde lo alto de una viga hacia el centro, a unos 45°, y se
// junta con la otra a 1,12 m. Cuerda: en la viga, de −2,34 a −3,31; arriba, de
// −2,41 a −3,07 (el borde de salida se adelanta hacia arriba).
const COLA = { x: VIGA.x, yRaiz: 0.17, yVertice: 1.125, baRaiz: -2.34, bsRaiz: -3.29, baVertice: -2.41, bsVertice: -3.07, t: 0.085 };
const enCola = (f: number) => ({
  // f: 0 en el vértice, 1 en la viga.
  x: COLA.x * f, y: COLA.yVertice + (COLA.yRaiz - COLA.yVertice) * f,
  ba: COLA.baVertice + (COLA.baRaiz - COLA.baVertice) * f, bs: COLA.bsVertice + (COLA.bsRaiz - COLA.bsVertice) * f,
});
// Timones: la mitad de atrás de la cuerda (bisagra al 45 %), en dos tramos
// separados por una junta a media altura (foto de la cola de Teknofest 2021).
const TIMON = { bisagra: 0.45, hueco: 0.008, tramos: [[0.09, 0.5], [0.5, 0.86]] };
const bisagraCola = (f: number) => { const c = enCola(f); return c.ba - TIMON.bisagra * (c.ba - c.bs); };
const estCola = (f: number, timon = false): Est => { const c = enCola(f); return [c.x, c.ba, timon ? bisagraCola(f) : c.bs, COLA.t, c.y]; };
const estTimon = (f: number): Est => { const c = enCola(f); return [c.x, bisagraCola(f) - TIMON.hueco, c.bs, COLA.t * 0.62, c.y]; };
const pendienteCola = Math.atan2(COLA.yVertice - COLA.yRaiz, COLA.x);

// ── Cuerpo ─────────────────────────────────────────────────────────────────
// Una sola pieza con el ala, del morro a la hélice (fotos del J-10 en vuelo y
// en tierra, Teknofest 2021 y desfile de Kiev). Una arista suave nace en la
// punta del morro, corre por el costado subiendo hacia atrás y, a la altura
// del ala, se abre en el ensanche que es la raíz del ala: por arriba, un
// empalme cóncavo sube del ensanche al hombro del cuerpo; por abajo, otro
// baja por el costado hasta la panza redonda. Encima, desde detrás de la tapa
// del morro, el lomo estrecho (0,52 m de ancho, foto polaca de frente) que
// sube hasta el capó del motor. (En la
// primera versión, cuerpo y raíz del ala iban aparte: la raíz parecía un puro
// posado junto al costado y la arista corría baja, a −0,27 m.)
// En la raíz del ala el empalme de arriba sube hasta el pie del lomo: no
// queda hombro del cuerpo por encima del ala (foto polaca de frente).
// Medidas del cuerpo a lo largo: [z, medio ancho del cuerpo, arista (y),
// hasta dónde llega el ensanche, alto del empalme de arriba y de abajo sobre
// y bajo la arista, alto del cuerpo, lo alto del lomo, medio ancho del lomo,
// panza, hasta dónde llega hacia dentro el empalme de arriba (0: el costado)].
type FilaCuerpo = [number, number, number, number, number, number, number, number, number, number, number];
const FILAS: FilaCuerpo[] = [
  [3.27, 0, -0.225, 0, 0, 0, -0.225, -0.225, 0, -0.225, 0],
  [3.22, 0.15, -0.245, 0.165, 0.01, 0.01, -0.15, -0.15, 0, -0.31, 0],
  [3.15, 0.205, -0.245, 0.22, 0.01, 0.01, -0.085, -0.085, 0, -0.335, 0],
  [3.05, 0.27, -0.24, 0.285, 0.012, 0.012, -0.04, -0.04, 0, -0.355, 0],
  [2.95, 0.31, -0.235, 0.325, 0.012, 0.012, 0, 0, 0, -0.365, 0],
  [2.75, 0.38, -0.225, 0.395, 0.012, 0.012, 0.03, 0.03, 0, -0.372, 0],
  [2.5, 0.44, -0.21, 0.455, 0.012, 0.012, 0.07, 0.07, 0, -0.375, 0],
  [2.25, 0.48, -0.19, 0.495, 0.012, 0.012, 0.12, 0.125, 0.05, -0.375, 0],
  [2, 0.5, -0.165, 0.515, 0.012, 0.012, 0.15, 0.175, 0.2, -0.375, 0],
  [1.75, 0.505, -0.13, 0.52, 0.012, 0.012, 0.165, 0.215, 0.26, -0.375, 0],
  // El ensanche delante del ala (planta del plano), hasta la raíz.
  // Hacia el morro, el empalme de arriba llega cada vez menos hacia dentro y
  // la mejilla del costado se ensancha poco a poco hasta el labio (foto tr05
  // y de Baykar en tierra: el costado baja liso y redondo). Antes el empalme
  // llegaba hasta x = 0,27–0,32 hasta z = 1,35 y luego saltaba a 0,4 y 0,5:
  // la mejilla quedaba metida y salía una joroba con dos valles.
  [1.5, 0.53, -0.09, 0.545, 0.04, 0.02, 0.17, 0.245, 0.26, -0.375, 0.46],
  [1.35, 0.545, -0.065, 0.58, 0.075, 0.07, 0.185, 0.262, 0.26, -0.375, 0.41],
  [1.25, 0.555, -0.045, 0.62, 0.105, 0.1, 0.2, 0.274, 0.26, -0.375, 0.37],
  [1.15, 0.565, -0.03, 0.7, 0.14, 0.13, 0.21, 0.285, 0.26, -0.375, 0.33],
  [1.07, 0.57, -0.012, 0.79, 0.17, 0.145, 0.22, 0.293, 0.26, -0.375, 0.3],
  // Bajo la raíz del ala (las del medio salen de RAIZ_CUERPO).
  [0.85, 0.58, 0, 0.85, 0.2, 0.16, 0.235, 0.31, 0.26, -0.373, 0.27],
  [0.3, 0.57, 0, 0.85, 0.12, 0.18, 0.26, 0.345, 0.26, -0.365, 0.27],
  [-0.12, 0.43, 0, 0.85, 0.07, 0.17, 0.25, 0.4, 0.32, -0.29, 0.3],
  // Detrás del ala, el ensanche se cierra hasta el capó (plano).
  [-0.21, 0.41, 0.02, 0.6, 0.06, 0.1, 0.2, 0.395, 0.35, -0.21, 0.35],
  [-0.26, 0.4, 0.035, 0.45, 0.04, 0.04, 0.15, 0.39, 0.39, -0.18, 0],
  [-0.3, 0.39, 0.05, 0.39, 0, 0, 0.1, 0.385, 0.385, -0.15, 0],
  [-0.45, 0.33, 0.14, 0.33, 0, 0, 0.2, 0.36, 0.33, -0.05, 0],
  [-0.5, 0.25, 0.18, 0.25, 0, 0, 0.25, 0.32, 0.25, 0.04, 0],
];
// El ensanche es la raíz del ala: llega hasta x = 1,3, donde empieza el ala
// recta, y acaba ahí con el perfil del ala en cada z (sin escalón). Su planta
// sigue el borde de ataque, que junto al cuerpo se curva hacia delante hasta
// el morro, y el de salida, que se curva hacia atrás hasta el capó (plano
// desde arriba). Así el empalme de arriba sube del ala al lomo en una curva
// larga, desde 0,7 m del costado, como se ve de frente en todas las fotos
// (en la versión anterior el ala salía del cuerpo en x = 0,85 con un empalme
// corto: el ala parecía pinchada en un cuerpo en forma de huevo).
const RAIZ_ALA = { x: RAIZ_ALA_X, ba: 0.745, bs: -0.122, t: 0.236, sube: 0.016 };
// Borde del ensanche delante y detrás del ala: [z, x].
const BORDE_DELANTE: [number, number][] = [
  [1.5, 0.545], [1.42, 0.56], [1.35, 0.58], [1.25, 0.62], [1.15, 0.7], [1.07, 0.79], [1.02, 0.85], [0.97, 0.9],
  [0.92, 0.95], [0.88, 1.0], [0.84, 1.07], [0.8, 1.15], [0.775, 1.21], [0.755, 1.27],
];
const BORDE_DETRAS: [number, number][] = [
  [-0.13, 1.15], [-0.145, 1.0], [-0.16, 0.9], [-0.172, 0.85], [-0.19, 0.72], [-0.21, 0.6], [-0.235, 0.5], [-0.26, 0.45],
];
const perfilNaca = (s: number) => 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);
const filaEn = (z: number): FilaCuerpo => {
  const fs = FILAS.slice().sort((a, b) => a[0] - b[0]);
  const i = Math.max(0, fs.findIndex((f) => f[0] >= z) - 1), a = fs[i], b = fs[Math.min(i + 1, fs.length - 1)];
  const k = b[0] === a[0] ? 0 : (z - a[0]) / (b[0] - a[0]);
  return a.map((v, j) => v + (b[j] - v) * k) as FilaCuerpo;
};
const aSeccion = ([z, costado, cintura, ancho, sube, baja, hombro, arriba, lomo, abajo, costadoArriba]: FilaCuerpo, borde?: [number, number]): Seccion => ({
  z, ancho, costado, ...(costadoArriba > 0 && { costadoArriba }), cintura, sobreArista: cintura + sube, bajoArista: cintura - baja, hombro, arriba, lomo, abajo, n: 2.3, nLomo: 2.4, nAbajo: 2.2,
  ...(borde && { bordeArriba: borde[0], bordeAbajo: borde[1] }),
});
// Una sección en z con el borde del ensanche en x (y, bajo el ala, el grueso
// del perfil del ala en esa z).
const conBorde = (z: number, x: number, borde?: [number, number], redondeo = 0) =>
  ({ ...aSeccion(filaEn(z).map((v, j) => (j === 0 ? z : j === 3 ? x : v)) as FilaCuerpo, borde), ...(redondeo > 0 && { redondeo }) });
// Redondeo del ensanche a lo largo del cuerpo: delante del ala es redondo,
// sin arista (el borde de ataque se funde con el costado, fotos del J-10 en
// tierra y en vuelo), y hacia el morro sigue la arista suave. Cambia poco a
// poco: de 0 en el borde de ataque (donde el ensanche acaba con el perfil del
// ala) a 0,75 y otra vez a 0 en la punta del morro. Antes saltaba de 0,75 a 0
// en un centímetro en el borde de ataque y dejaba un pliegue.
const suave = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
// En el borde de ataque, el perfil del ala tiene grueso cero: sin redondeo,
// el empalme entero bajaba ahí hasta el borde y volvía a subir detrás (el
// pliegue). Con redondeo, el empalme queda alto por dentro; detrás del borde
// de ataque se apaga a medida que el ala engorda y da ella la altura.
const REDONDEO = (z: number) => (z <= RAIZ_ALA.ba ? 0.9 * suave(0.4, RAIZ_ALA.ba, z) : 0.9 - 0.15 * suave(0.9, 1.3, z)) * (1 - suave(2.9, 3.27, z));
// Delante del ala, el ensanche no acaba en filo: el borde de ataque sigue
// hacia el morro como un reborde redondo (foto de Baykar en tierra), con el
// grueso de la nariz de un perfil, que se afina hacia el morro. LABIO(z): su
// grueso; la nariz, de un largo algo menor. Antes acababa en un filo de
// grueso cero que chocaba con el ala, gruesa, y dejaba un pliegue.
const LABIO = (z: number) => (z <= RAIZ_ALA.ba ? 0 : 0.03 + 0.06 * suave(RAIZ_ALA.ba, 0.9, z) - 0.04 * suave(1.2, 1.6, z) - 0.03 * suave(1.6, 2.4, z) - 0.02 * suave(2.4, 3.2, z));
const conLabio = (q: Seccion): Seccion => {
  const t = LABIO(q.z), c = q.cintura ?? 0;
  if (t <= 0.002) return q;
  // Sin pasar de lo que suben y bajan los empalmes en esa z.
  const arriba = Math.min(c + 0.55 * t, c + 0.9 * ((q.sobreArista ?? c) - c)), abajo = Math.max(c - 0.45 * t, c - 0.9 * (c - (q.bajoArista ?? c)));
  return { ...q, bordeArriba: arriba, bordeAbajo: abajo, nariz: 0.8 * (arriba - abajo) };
};
// Junto al borde de ataque, el redondeo se saca de la altura a la que debe
// quedar el empalme por dentro (el control de su curva): la de la raíz del
// ala, 0,15, que baja poco a poco hacia delante. Con el redondeo a ojo, el
// empalme quedaba 2,5 cm más bajo en el anillo del borde de ataque que 5 cm
// detrás: un surco. En el borde de ataque, algo más alta: la curva queda
// más por debajo de su control cuanto más bajo está el borde.
const ALTURA_EMPALME = (z: number) => 0.15 - 0.035 * suave(0.72, 1.1, z) + 0.024 * Math.exp(-(((z - 0.76) / 0.09) ** 2)) + 0.016 * Math.exp(-(((z - 0.742) / 0.012) ** 2));
const conAltura = (q: Seccion): Seccion => {
  if (q.z < 0.45 || q.z > 1.1) return q;
  const yB = q.bordeArriba ?? q.cintura ?? 0, yS = q.sobreArista ?? yB;
  if (yS - yB < 1e-3) return q;
  const r = (ALTURA_EMPALME(q.z) - yB) / ((2 / 3) * (yS - yB));
  // Detrás, mezclado con el de siempre a medida que el ala engorda.
  const k = suave(0.45, 0.6, q.z);
  return { ...q, redondeo: Math.max(0, Math.min(1.4, k * r + (1 - k) * (q.redondeo ?? 0))) };
};
const RAIZ_CUERPO = [
  ...BORDE_DELANTE.map(([z, x]) => conAltura(conLabio(conBorde(z, x, undefined, REDONDEO(z))))),
  ...[0, 0.01, 0.03, 0.07, 0.13, 0.22, 0.33, 0.47, 0.62, 0.78, 0.92, 1].map((f) => {
    const z = RAIZ_ALA.ba - f * (RAIZ_ALA.ba - RAIZ_ALA.bs), g = RAIZ_ALA.t * perfilNaca(f);
    return conAltura(conBorde(z, RAIZ_ALA.x, [RAIZ_ALA.sube + g, RAIZ_ALA.sube - 0.55 * g], REDONDEO(z)));
  }),
  ...BORDE_DETRAS.map(([z, x]) => conBorde(z, x)),
];
const CUERPO: Seccion[] = [
  // La arista del morro, también suave (en las fotos de lado no hay un filo
  // con sombra debajo, solo un cambio de luz).
  ...FILAS.filter(([z]) => z > BORDE_DELANTE[0][0] + 1e-6 || z < BORDE_DETRAS[BORDE_DETRAS.length - 1][0] - 1e-6).map((f) => conLabio({ ...aSeccion(f), ...(REDONDEO(f[0]) > 0 && { redondeo: REDONDEO(f[0]) }) })),
  ...RAIZ_CUERPO,
];
// Toma de aire del motor: una sola, en el centro de lo alto del lomo, junto
// al capó (fotos del J-10 en vuelo, desde arriba y de lado, tr05 de lado y
// 030 de frente; a escala con la toma pequeña del lomo, de 17 cm; desde
// arriba cae en la línea de esa toma y de la punta del cono). Un hueco oval y
// hondo de unos 25 cm, con la boca (la pared de atrás) en z = 0,1, 10 cm por
// delante de la junta remachada del capó; delante, una rampa poco honda que
// se estrecha hasta la punta (z = 0,64), con los bordes un poco salidos.
// (Vista desde un lado, solo se ve iluminada la pared de enfrente y parece
// una cuña a un lado: el 2-oct-2026 salieron por error dos tomas laterales.)
const TOMA = { boca: 0.1, largo: 0.25, punta: 0.64, x: 0, y: 0.373, ancho: 0.11, hondo: 0.12, ceja: 0.012 };
// Fondo de la boca: un disco negro contra la pared, centrado en el fondo del
// hueco (solo asoma la mitad que queda dentro de la toma): la entrada del
// conducto, que es un agujero de verdad.
const FONDO_TOMA: [number, number, number] = [0, TOMA.y - TOMA.hondo, TOMA.boca + 0.002];
const HELICE = { y: 0.18, z: -0.62, r: 0.82 };
// Borde delantero del capó, donde está la boca de la toma de aire.
const CAPO = { z: 0.0 };

// ── Tren ───────────────────────────────────────────────────────────────────
// Triciclo fijo. Patas principales de una pieza, que salen de la panza bajo
// la raíz del ala hacia fuera y abajo y acaban en una rodilla corta junto a
// la rueda (fotos de Teknofest y de Lituania); la del morro, un amortiguador
// recto con su compás, detrás de la placa de la panza.
// Ruedas pequeñas, de unos 19 cm (foto de tierra del J-10 con la cámara
// encajada; en la primera versión, de 28 y 26 cm), y la del morro más atrás.
const SUELO = -0.91;
const RUEDA = { x: 0.82, r: 0.095, z: 0.42 };
const RUEDA_MORRO = { r: 0.098, z: 2.31 };

// ── Carga ──────────────────────────────────────────────────────────────────
// Cuatro soportes, dos bajo cada ala, cajas con una percha debajo (fotos de
// Lituania y Teknofest), y en cada uno una MAM-L.
const SOPORTES = [1.3, 1.72];
const LADOS = [1, -1];
const SOPORTE = { largo: 0.46, alto: 0.14, ancho: 0.075 };
// Todo con la distancia al centro, sin signo: con la x negativa del ala
// izquierda el diedro salía al revés y sus dos bombas colgaban 20 cm por
// debajo de los soportes, en el aire.
const bajoSoporte = (x: number) => abajoAla(Math.abs(x)) - SOPORTE.alto + 0.03;
// MAM-L de Roketsan: 1 m y 16 cm de grueso, con el buscador láser redondo
// delante, cuatro alas cortas a media bomba y cuatro timones detrás, colgada
// de la percha por una argolla.
const MAM = { r: 0.08, largo: 1.0 };
const yMam = (x: number) => bajoSoporte(x) - 0.02 - MAM.r;
const zMam = (x: number) => bordeAtaque(Math.abs(x)) + 0.33;

// Cuatro aletas en X alrededor del eje de una bomba: el contorno va en
// [z, distancia al eje].
const aletasX = (id: string, x: number, y: number, contorno: [number, number][], acabado: Pieza["acabado"]): Pieza[] =>
  [45, -45, 135, -135].map((inclinacion, i) => ({
    tipo: "placa", id: `${id}-${i}`, acabado, plano: "vertical", x, y, grosor: 0.008, inclinacion, bisel: 0.002, planta: contorno,
  }));

const mam = (x: number): Pieza[] => {
  const y = yMam(x), z0 = zMam(x), r = MAM.r;
  return [
    {
      tipo: "tubo", id: `mam-${x}`, acabado: "gris", centro: [x, y],
      perfil: [[z0, 0], [z0 - 0.012, 0.04], [z0 - 0.035, 0.062], [z0 - 0.07, 0.075], [z0 - 0.12, r], [z0 - 0.95, r], [z0 - 0.985, 0.07], [z0 - MAM.largo, 0.05], [z0 - MAM.largo - 0.001, 0]],
    },
    { tipo: "tubo", id: `mam-ojo-${x}`, acabado: "lente", centro: [x, y], perfil: [[z0 + 0.004, 0], [z0 - 0.004, 0.035], [z0 - 0.02, 0.05], [z0 - 0.021, 0]] },
    // Dos argollas, colgadas de la percha (antes, una por delante de ella).
    ...[0.1, -0.1].map((dz, i): Pieza => ({ tipo: "varilla", id: `mam-argolla-${x}${i ? "-b" : ""}`, acabado: "metal", desde: [x, y + r - 0.01, cuerdaAla(Math.abs(x), 0.42) + dz], hasta: [x, bajoSoporte(x) - 0.012, cuerdaAla(Math.abs(x), 0.42) + dz], radio: 0.012 })),
    ...aletasX(`mam-alas-${x}`, x, y, [[z0 - 0.36, r - 0.01], [z0 - 0.56, r - 0.01], [z0 - 0.53, 0.17], [z0 - 0.43, 0.17]], "gris"),
    ...aletasX(`mam-timones-${x}`, x, y, [[z0 - 0.8, r - 0.01], [z0 - 0.995, r - 0.01], [z0 - 0.995, 0.175], [z0 - 0.9, 0.175]], "gris"),
  ];
};
const idsMam = (x: number) => [`mam-${x}`, `mam-ojo-${x}`, `mam-argolla-${x}`, `mam-argolla-${x}-b`, ...[0, 1, 2, 3].flatMap((i) => [`mam-alas-${x}-${i}`, `mam-timones-${x}-${i}`])];
const POSICIONES_MAM = LADOS.flatMap((s) => SOPORTES.map((x) => s * x));

// Soporte: una caja bajo el ala con una percha debajo (dos topes).
const soporte = (x: number, i: number): Pieza[] => {
  const zc = cuerdaAla(x, 0.42);
  return [
    { tipo: "caja", id: `soporte-${i}`, acabado: "gris-tr", espejo: true, redondeo: 0.02, centro: [x, abajoAla(x) - SOPORTE.alto / 2 + 0.03, zc], tam: [SOPORTE.ancho, SOPORTE.alto, SOPORTE.largo] },
    { tipo: "caja", id: `percha-${i}`, acabado: "metal", espejo: true, redondeo: 0.01, centro: [x, bajoSoporte(x) - 0.012, zc], tam: [0.05, 0.025, 0.36] },
    ...[0.13, -0.13].map((dz, k): Pieza => ({ tipo: "varilla", id: `percha-tope-${i}-${k}`, acabado: "metal", espejo: true, desde: [x, bajoSoporte(x) - 0.02, zc + dz], hasta: [x + 0.05, bajoSoporte(x) - 0.04, zc + dz], radio: 0.008 })),
  ];
};

// Bola de un torno de media circunferencia.
const esfera = (z: number, r: number, n = 13): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / (n - 1)) * Math.PI;
    return [z + r * Math.cos(a), r * Math.sin(a)];
  });
// Torreta (fotos de tierra y de vuelo del J-10): un tambor del ancho de la
// bola, metido en la panza, y la media esfera debajo; nada de cuello. Unos
// 42 cm de ancho, centrada en z = 1,67 (en la primera versión, una bola de
// 38 cm colgada de un collar, 14 cm más adelante).
const TORRETA = { y: -0.475, z: 1.67, r: 0.21 };

// Carenados de los mandos de los timones, en la cara de dentro (la de abajo)
// de cada mitad de la cola, con la varilla de mando (foto de la cola).
const carenadosTimon = (f: number, i: number): Pieza[] => {
  const c = enCola(f), zc = bisagraCola(f);
  const n = [-Math.sin(pendienteCola), -Math.cos(pendienteCola)];
  const p = (d: number, dz: number): [number, number, number] => [c.x + n[0] * d, c.y + n[1] * d, zc + dz];
  // Grandes: en la foto desde detrás sobresalen casi 10 cm de la cara.
  const perfil: [number, number][] = [[zc + 0.2, 0], [zc + 0.14, 0.035], [zc, 0.048], [zc - 0.12, 0.04], [zc - 0.2, 0]];
  return [
    ...LADOS.map((s): Pieza => ({ tipo: "tubo", id: `carenado-timon-${i}${s < 0 ? "-b" : ""}`, acabado: "gris-tr", centro: [s * p(0.06, 0)[0], p(0.06, 0)[1]], seccion: [1, 0.8], perfil })),
    { tipo: "varilla", id: `varilla-timon-${i}`, acabado: "metal", espejo: true, desde: p(0.07, -0.15), hasta: p(0.03, -0.3), radio: 0.008 },
  ];
};

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-tr", secciones: CUERPO, tomas: [TOMA] },
  // Toma de aire del motor (foto de Baykar en tierra, J-10 en vuelo y polaca
  // de frente): el capó del motor es algo más grueso que el cuerpo de delante
  // y su borde delantero queda separado, con una boca negra que lo rodea por
  // los costados y por arriba. De lado se ve como una banda negra vertical;
  // de frente, como dos medias lunas a los lados del lomo; desde arriba, como
  // dos huecos oscuros delante del capó (en la versión anterior, mal
  // entendidos como dos tomas sumergidas encima y una ranura en el costado).
  {
    // Con la forma del cuerpo de delante, algo más grande: un lomo alto y
    // estrecho (foto polaca de frente) sobre unos hombros de 0,4 m de medio
    // ancho (plano desde arriba: el capó es lo más ancho detrás del ala). Delante
    // de él, el empalme del ala con el lomo es bajo: la boca baja por los
    // costados hasta el ala (foto de Baykar en tierra). La boca,
    // entre los dos, es una U fina alrededor del lomo que se abre en dos
    // medias lunas abajo, a los lados, donde el cuerpo de delante baja hacia
    // el ala.
    tipo: "casco", id: "capo", acabado: "gris-tr", abierto: true, secciones: [
      { z: CAPO.z, ancho: 0.4, cintura: 0.1, hombro: 0.24, arriba: 0.41, lomo: 0.315, abajo: 0.0, n: 2.3, nLomo: 2.4, nAbajo: 2 },
      { z: CAPO.z - 0.08, ancho: 0.405, cintura: 0.1, hombro: 0.24, arriba: 0.41, lomo: 0.335, abajo: -0.03, n: 2.3, nLomo: 2.4, nAbajo: 2 },
      { z: -0.18, ancho: 0.42, cintura: 0.13, hombro: 0.24, arriba: 0.4, lomo: 0.37, abajo: -0.06, n: 2.3, nLomo: 2.4, nAbajo: 2 },
      { z: -0.3, ancho: 0.38, cintura: 0.14, hombro: 0.24, arriba: 0.375, lomo: 0.37, abajo: -0.06, n: 2.3, nLomo: 2.4, nAbajo: 2 },
    ],
  },
  // El fondo de la boca, unos centímetros dentro del borde.
  {
    tipo: "casco", id: "capo-boca", acabado: "hueco", secciones: [
      { z: CAPO.z - 0.04, ancho: 0.385, cintura: 0.1, hombro: 0.235, arriba: 0.4, lomo: 0.3, abajo: 0.0, n: 2.3, nLomo: 2.4, nAbajo: 2 },
      { z: CAPO.z - 0.08, ancho: 0.39, cintura: 0.1, hombro: 0.235, arriba: 0.403, lomo: 0.32, abajo: -0.02, n: 2.3, nLomo: 2.4, nAbajo: 2 },
    ],
  },
  { tipo: "disco", id: "toma-fondo", acabado: "hueco", en: FONDO_TOMA, normal: [0, 0, 1], radio: 0.95 * TOMA.hondo, grosor: 0.004 },
  // Toma de aire central: una boca rectangular en lo alto del lomo, sobre la
  // raíz del ala (fotos del J-10 en vuelo: no está en el capó, como en la
  // primera versión, sino 1 m por delante). Un capuchón bajo con la boca
  // negra mirando adelante.
  { tipo: "caja", id: "toma", acabado: "gris-tr", centro: [0, 0.3, 1.0], tam: [0.17, 0.05, 0.16], redondeo: 0.03 },
  { tipo: "caja", id: "toma-boca", acabado: "negro", centro: [0, 0.305, 1.075], tam: [0.14, 0.035, 0.012] },
  // Morro: la sonda de datos de aire en la punta, con sus dos veletas, una
  // antena corta encima y las dos placas de los costados, a la altura de la
  // arista (foto de Kiev 2019).
  { tipo: "varilla", id: "sonda", acabado: "metal", desde: [0, -0.23, 3.25], hasta: [0, -0.24, 4.0], radio: 0.011 },
  {
    tipo: "placa", id: "sonda-veleta", acabado: "blanco", plano: "vertical", x: 0, grosor: 0.004,
    planta: [[3.86, -0.235], [3.78, -0.235], [3.76, -0.16], [3.8, -0.16]],
  },
  {
    tipo: "placa", id: "sonda-veleta-2", acabado: "blanco", plano: "horizontal", y: -0.24, grosor: 0.004,
    planta: [[0, 3.72], [0.06, 3.66], [0.06, 3.62], [0, 3.64], [-0.06, 3.62], [-0.06, 3.66]],
  },
  { tipo: "varilla", id: "antena-morro", acabado: "negro", desde: [0, -0.03, 2.92], hasta: [0, 0.05, 2.92], radio: 0.012 },
  {
    tipo: "placa", id: "orejas", acabado: "gris-tr", plano: "horizontal", y: -0.262, grosor: 0.018, espejo: true, bisel: 0.006,
    planta: [[0.35, 2.6], [0.54, 2.58], [0.56, 2.55], [0.56, 2.33], [0.54, 2.31], [0.35, 2.3]],
  },
  // Placa de la panza, bajo el morro, con una antena de pala delante.
  // Caja larga bajo el morro, de detrás de la pata hasta casi la punta (foto
  // de tierra del J-10; en la primera versión, una placa fina y corta).
  { tipo: "caja", id: "placa-panza", acabado: "gris-tr", centro: [0, -0.39, 2.55], tam: [0.22, 0.07, 0.95], redondeo: 0.03 },
  {
    tipo: "placa", id: "antena-panza", acabado: "negro", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.004,
    planta: [[2.95, -0.395], [2.89, -0.395], [2.9, -0.5], [2.93, -0.5]],
  },
  // Antenas pequeñas del lomo y luces blancas del carenado del ala.
  { tipo: "tubo", id: "antena-lomo", acabado: "blanco", centro: [0, 0.205], seccion: [1, 0.45], perfil: esfera(1.9, 0.04) },
  { tipo: "tubo", id: "antena-lomo-2", acabado: "blanco", centro: [0, 0.3], seccion: [1, 0.45], perfil: esfera(1.0, 0.04) },
  ...LADOS.map((s): Pieza => ({ tipo: "tubo", id: `luz-raiz-${s}`, acabado: "blanco", centro: [s * 1.3, 0.12], seccion: [1, 0.35], perfil: esfera(0.6, 0.03) })),
  // Ala con su carenado, en una pieza; donde van los alerones el borde de
  // salida se adelanta hasta la bisagra.
  {
    tipo: "ala", id: "ala", acabado: "gris-tr", y: 0, raizDentro: true,
    estaciones: [
      ...RAIZ,
      estAla(1.5), estAla(2.5),
      estAla(ALERON.tramos[0][0]), estAla(ALERON.tramos[0][0], bisagra(ALERON.tramos[0][0])),
      estAla(ALERON.tramos[1][1], bisagra(ALERON.tramos[1][1])), estAla(ALERON.tramos[1][1]),
      estAla(ALA.punta),
    ],
  },
  ...ALERON.tramos.map(([a, b], i): Pieza => ({ tipo: "ala", id: `aleron-${i}`, acabado: "gris-tr", y: 0, estaciones: [estAleron(a + ALERON.hueco), estAleron(b - ALERON.hueco)] })),
  // Carenados de los mandos de los alerones, bajo el ala (plano desde abajo).
  ...[3.8, 4.92].map((x, i): Pieza => ({ tipo: "caja", id: `carenado-aleron-${i}`, acabado: "gris-tr", espejo: true, redondeo: 0.012, centro: [x, abajoAla(x) - 0.012, bordeSalida(x) + 0.12], tam: [0.025, 0.035, 0.2] })),
  // Luces de las puntas del ala y el tubo pitot, bajo un ala.
  ...LADOS.map((s): Pieza => ({ tipo: "tubo", id: `luz-punta-${s}`, acabado: "blanco", centro: [s * ALA.punta, subidaAla(ALA.punta)], seccion: [0.5, 0.5], perfil: esfera(cuerdaAla(ALA.punta, 0.35), 0.05) })),
  { tipo: "varilla", id: "pitot-pie", acabado: "gris-tr", desde: [2.62, abajoAla(2.62) + 0.01, cuerdaAla(2.62, 0.2)], hasta: [2.62, abajoAla(2.62) - 0.06, cuerdaAla(2.62, 0.15)], radio: 0.012 },
  { tipo: "varilla", id: "pitot", acabado: "blanco", desde: [2.62, abajoAla(2.62) - 0.06, cuerdaAla(2.62, 0.3)], hasta: [2.62, abajoAla(2.62) - 0.06, bordeAtaque(2.62) + 0.18], radio: 0.012 },
  // Vigas: del borde de salida a pasada la cola, con la punta de atrás
  // redondeada y una luz.
  ...LADOS.map((s): Pieza => ({
    // Ovalada, más alta que ancha (0,12 × 0,175 m; plano de lado y desfile de
    // Kiev), y algo más fina hacia la cola. (La sección estira también lo que
    // sube el eje: por eso va dividido.)
    tipo: "tubo", id: `viga-${s}`, acabado: "gris-tr", centro: [s * VIGA.x, 0], seccion: [0.95, 1.35],
    perfil: ([
      [VIGA.delante, 0], [VIGA.delante - 0.08, 0.8], [0.2, 1], [-1, 0.97], [-2, 0.92], [-3.0, 0.86],
      [VIGA.detras + 0.06, 0.78], [VIGA.detras + 0.02, 0.5], [VIGA.detras, 0],
    ] as const).map(([z, k]): [number, number, number] => [z, VIGA.r * k, alturaViga(z) / 1.35]),
  })),
  // Franjas rojas alrededor de cada viga, a los dos lados del aviso de la
  // hélice (fotos de Teknofest 2021).
  ...LADOS.flatMap((s) => [-0.62, -1.06].map((z, i): Pieza => ({
    tipo: "tubo", id: `franja-viga-${s}-${i}`, acabado: "rojo-vivo", centro: [s * VIGA.x, 0], seccion: [0.95, 1.35],
    perfil: [[z + 0.022, VIGA.r * 0.99 + 0.002, alturaViga(z) / 1.35], [z - 0.022, VIGA.r * 0.99 + 0.002, alturaViga(z) / 1.35]],
  }))),
  ...LADOS.map((s): Pieza => ({ tipo: "tubo", id: `luz-viga-${s}`, acabado: "metal", centro: [s * VIGA.x, alturaViga(VIGA.detras)], perfil: esfera(VIGA.detras + 0.01, 0.025) })),
  // Cola en V invertida, con perfil, y sus timones aparte.
  {
    tipo: "ala", id: "cola", acabado: "gris-tr", y: 0,
    estaciones: [
      estCola(0), estCola(TIMON.tramos[0][0]), estCola(TIMON.tramos[0][0], true), estCola(TIMON.tramos[1][1], true), estCola(TIMON.tramos[1][1]), estCola(1),
    ],
  },
  ...TIMON.tramos.map(([a, b], i): Pieza => ({ tipo: "ala", id: `timon-${i}`, acabado: "gris-tr", y: 0, estaciones: [estTimon(a + 0.006), estTimon(b - 0.006)] })),
  ...[0.32, 0.72].flatMap(carenadosTimon),
  // Antena en la punta de la cola, hacia atrás.
  { tipo: "varilla", id: "antena-cola", acabado: "negro", desde: [0, COLA.yVertice + 0.03, COLA.bsVertice + 0.05], hasta: [0, COLA.yVertice + 0.06, COLA.bsVertice - 0.2], radio: 0.005 },
  // Motor: cono blanco, hélice negra de dos palas y 1,7 m, el aro oscuro
  // alrededor del cono, las rejillas de la panza de la góndola y el escape.
  { tipo: "disco", id: "aro-helice", acabado: "junta", en: [0, HELICE.y, -0.5], normal: [0, 0, 1], radio: 0.2, grosor: 0.02 },
  {
    tipo: "tubo", id: "cono", acabado: "blanco", centro: [0, HELICE.y],
    perfil: [[-0.51, 0.175], [-0.6, 0.17], [-0.7, 0.155], [-0.78, 0.13], [-0.86, 0.09], [-0.92, 0.045], [-0.95, 0]],
  },
  { tipo: "helice", id: "helice", acabado: "negro", en: [0, HELICE.y, HELICE.z], radio: HELICE.r, palas: 2, giro: 60, ancho: 0.13 },
  ...[0, 1, 2, 3].map((i): Pieza => ({ tipo: "caja", id: `rejilla-${i}`, acabado: "negro", centro: [0.1, -0.165 + i * 0.012, -0.08 - i * 0.07], tam: [0.16, 0.012, 0.025] })),
  { tipo: "varilla", id: "escape", acabado: "metal", desde: [0.12, -0.13, -0.22], hasta: [0.12, -0.26, -0.3], radio: 0.022 },
  { tipo: "varilla", id: "escape-2", acabado: "metal", desde: [0.12, -0.26, -0.3], hasta: [0.12, -0.28, -0.46], radio: 0.022 },
  // Torreta de sensores: una bola blanca colgada de un cuello bajo el morro,
  // con la ventana de las cámaras y el láser.
  { tipo: "disco", id: "torreta-tambor", acabado: "blanco", en: [0, TORRETA.y + 0.07, TORRETA.z], normal: [0, 1, 0], radio: TORRETA.r, grosor: 0.14 },
  { tipo: "tubo", id: "torreta", acabado: "blanco", centro: [0, TORRETA.y], perfil: esfera(TORRETA.z, TORRETA.r, 17) },
  // La ventana, en la cara de delante de la bola, mirando abajo y adelante.
  { tipo: "disco", id: "torreta-marco", acabado: "negro", en: [0, TORRETA.y - 0.1, TORRETA.z + 0.17], normal: [0, -0.5, 0.87], radio: 0.1, grosor: 0.03 },
  { tipo: "disco", id: "torreta-ventana", acabado: "lente", en: [0.025, TORRETA.y - 0.105, TORRETA.z + 0.182], normal: [0, -0.5, 0.87], radio: 0.055, grosor: 0.01 },
  { tipo: "disco", id: "torreta-ventana-2", acabado: "lente", en: [-0.05, TORRETA.y - 0.14, TORRETA.z + 0.16], normal: [0, -0.5, 0.87], radio: 0.03, grosor: 0.01 },
  // Soportes y bombas.
  ...SOPORTES.flatMap(soporte),
  ...POSICIONES_MAM.flatMap(mam),
  // Tren: patas principales con su rodilla, ejes y ruedas.
  { tipo: "varilla", id: "patas", acabado: "gris-tr", espejo: true, desde: [0.38, -0.3, RUEDA.z + 0.02], hasta: [RUEDA.x - 0.07, SUELO + RUEDA.r + 0.1, RUEDA.z], radio: 0.042 },
  { tipo: "varilla", id: "rodillas", acabado: "gris-tr", espejo: true, desde: [RUEDA.x - 0.07, SUELO + RUEDA.r + 0.1, RUEDA.z], hasta: [RUEDA.x - 0.06, SUELO + RUEDA.r, RUEDA.z], radio: 0.034 },
  { tipo: "varilla", id: "ejes", acabado: "metal", espejo: true, desde: [RUEDA.x - 0.07, SUELO + RUEDA.r, RUEDA.z], hasta: [RUEDA.x, SUELO + RUEDA.r, RUEDA.z], radio: 0.018 },
  { tipo: "disco", id: "ruedas", acabado: "negro", espejo: true, en: [RUEDA.x, SUELO + RUEDA.r, RUEDA.z], normal: [1, 0, 0], radio: RUEDA.r, grosor: 0.075 },
  { tipo: "disco", id: "bujes", acabado: "metal", espejo: true, en: [RUEDA.x + 0.039, SUELO + RUEDA.r, RUEDA.z], normal: [1, 0, 0], radio: 0.065, grosor: 0.006 },
  { tipo: "varilla", id: "pata-morro", acabado: "gris-tr", desde: [0, -0.39, RUEDA_MORRO.z - 0.03], hasta: [0, SUELO + RUEDA_MORRO.r + 0.2, RUEDA_MORRO.z - 0.02], radio: 0.03 },
  { tipo: "varilla", id: "vastago-morro", acabado: "metal", desde: [0, SUELO + RUEDA_MORRO.r + 0.22, RUEDA_MORRO.z - 0.02], hasta: [0, SUELO + RUEDA_MORRO.r + 0.05, RUEDA_MORRO.z - 0.01], radio: 0.02 },
  { tipo: "varilla", id: "compas-morro", acabado: "metal", desde: [0, SUELO + RUEDA_MORRO.r + 0.2, RUEDA_MORRO.z + 0.01], hasta: [0, SUELO + RUEDA_MORRO.r + 0.12, RUEDA_MORRO.z + 0.06], radio: 0.009 },
  { tipo: "varilla", id: "compas-morro-2", acabado: "metal", desde: [0, SUELO + RUEDA_MORRO.r + 0.12, RUEDA_MORRO.z + 0.06], hasta: [0, SUELO + RUEDA_MORRO.r + 0.06, RUEDA_MORRO.z + 0.01], radio: 0.009 },
  { tipo: "varilla", id: "horquilla", acabado: "gris-tr", espejo: true, desde: [0.05, SUELO + RUEDA_MORRO.r + 0.06, RUEDA_MORRO.z - 0.01], hasta: [0.05, SUELO + RUEDA_MORRO.r, RUEDA_MORRO.z], radio: 0.014 },
  { tipo: "disco", id: "rueda-morro", acabado: "negro", en: [0, SUELO + RUEDA_MORRO.r, RUEDA_MORRO.z], normal: [1, 0, 0], radio: RUEDA_MORRO.r, grosor: 0.065 },
  { tipo: "disco", id: "buje-morro", acabado: "metal", espejo: true, en: [0.034, SUELO + RUEDA_MORRO.r, RUEDA_MORRO.z], normal: [1, 0, 0], radio: 0.055, grosor: 0.005 },
];

// ── Detalle pintado del HD (el TB2 del Ejército de Tierra turco, Teknofest 2021)
// Marcas y juntas de las fotos del TB2 de Teknofest 2021 (los dos lados) y,
// para lo que en ellas no se ve (las alas por arriba y por abajo), del plano.
// En metros, como las piezas.
const LADO: [number, number, number] = [1, 0, 0];
const ARRIBA: [number, number, number] = [0, 1, 0];
// Cara de fuera de la mitad derecha de la cola (la de arriba, que mira hacia
// fuera) y un punto sobre ella: f de 0 (vértice) a 1 (viga), y la fracción
// de la cuerda desde el borde de ataque.
const FUERA_COLA: [number, number, number] = [Math.sin(pendienteCola), Math.cos(pendienteCola), 0];
const sobreCola = (f: number, cuerda: number): [number, number, number] => {
  const c = enCola(f);
  return [c.x + FUERA_COLA[0] * 0.04, c.y + FUERA_COLA[1] * 0.04, c.ba - cuerda * (c.ba - c.bs)];
};
const CALCAS: Calca[] = [
  // Bandera en la cara de fuera de cada mitad de la cola, arriba, en la
  // parte fija; debajo, cerca de la viga, el logo de Baykar.
  { sobre: ["cola"], en: sobreCola(0.3, 0.27), desde: FUERA_COLA, tam: [0.3, 0.2], dibujo: { tipo: "bandera-tr" }, espejo: true },
  { sobre: ["cola"], en: sobreCola(0.74, 0.24), desde: FUERA_COLA, tam: [0.25, 0.2], dibujo: { tipo: "baykar" }, espejo: true },
  // Escarapelas: en los costados de la góndola, detrás de la salida de aire,
  // y en las alas (plano): arriba en el ala izquierda y abajo en la derecha.
  { sobre: ["capo", "fuselaje"], en: [0.45, 0.17, -0.25], desde: LADO, tam: [0.22, 0.22], dibujo: { tipo: "escarapela-tr" }, espejo: true },
  { sobre: ["ala"], en: [3.4, subidaAla(3.4) + 0.1, cuerdaAla(3.4, 0.42)], desde: ARRIBA, tam: [0.3, 0.3], dibujo: { tipo: "escarapela-tr" } },
  { sobre: ["ala"], en: [-3.4, subidaAla(3.4) - 0.1, cuerdaAla(3.4, 0.42)], desde: [0, -1, 0], tam: [0.3, 0.3], dibujo: { tipo: "escarapela-tr" } },
  // En la cara de fuera de cada viga: el nombre y, entre las dos franjas
  // rojas, el aviso de la hélice.
  { sobre: ["viga-1", "viga--1"], en: [VIGA.x + 0.1, alturaViga(-1.62), -1.62], desde: LADO, tam: [0.82, 0.085], dibujo: { tipo: "texto", texto: "BAYRAKTAR  TB2", fino: true }, espejo: true },
  { sobre: ["viga-1", "viga--1"], en: [VIGA.x + 0.1, alturaViga(-0.84), -0.84], desde: LADO, tam: [0.34, 0.07], dibujo: { tipo: "texto", texto: "DİKKAT PERVANE\nDANGER PROPELLER", color: "#d81e2a", fino: true }, espejo: true },
  // Avisos amarillos rayados en la tapa del morro.
  { sobre: ["fuselaje"], en: [0.3, 0.2, 2.05], desde: [0.35, 1, 0], tam: [0.17, 0.075], dibujo: { tipo: "aviso" }, espejo: true },
];

// Costuras y tornillos, de las fotos del J-10 en vuelo (desde arriba y de
// lado) con la cámara encajada y cada punto llevado a la superficie.
const LOMO_COSTURA: [number, number][] = [[0.27, 2.2], [0.3, 1.43], [0.33, 0.99], [0.36, 0.52], [0.39, 0.1]];
const tapaAla = (x0: number, x1: number, z0: number, z1: number): Costura => ({
  sobre: ["fuselaje", "ala"], desde: ARRIBA, espejo: true, enVertices: true, puntos: [
    [x0, 0.4, z0], [(x0 + x1) / 2, 0.4, z0], [x1, 0.4, z0], [x1, 0.4, (z0 + z1) / 2], [x1, 0.4, z1],
    [(x0 + x1) / 2, 0.4, z1], [x0, 0.4, z1], [x0, 0.4, (z0 + z1) / 2], [x0, 0.4, z0],
  ],
});
const COSTURAS: Costura[] = [
  // Los dos bordes del lomo, de la tapa del morro al capó, con tornillos
  // cada 12 cm (en la primera versión, una costura en el costado que no
  // existe).
  { sobre: ["fuselaje"], desde: [0.5, 1, 0], espejo: true, remaches: 0.12, puntos: LOMO_COSTURA.map(([x, z]): [number, number, number] => [x, 0.5, z]) },
  // Tapa del morro: grande, cubre la punta por arriba y baja por los
  // costados hasta cerca de la arista; el borde de atrás, en z = 2,3.
  { sobre: ["fuselaje"], desde: ARRIBA, puntos: [[-0.3, 0.5, 2.36], [-0.15, 0.5, 2.31], [0, 0.5, 2.3], [0.15, 0.5, 2.31], [0.3, 0.5, 2.36]] },
  { sobre: ["fuselaje"], desde: LADO, espejo: true, puntos: [[0.6, 0.08, 2.35], [0.6, -0.07, 2.47], [0.6, -0.15, 2.87], [0.6, -0.19, 3.1], [0.6, -0.2, 3.18]] },
  // Junta en anillo del capó, con tornillos juntos: arriba en z = 0, más
  // atrás según baja por el costado.
  { sobre: ["capo"], desde: LADO, espejo: true, remaches: 0.06, puntos: [[0.6, 0.38, -0.04], [0.6, 0.27, -0.06], [0.6, 0.06, -0.08]] },
  { sobre: ["capo"], desde: ARRIBA, remaches: 0.06, puntos: [[-0.3, 0.6, -0.04], [0, 0.6, -0.04], [0.3, 0.6, -0.04]] },
  // Tapas atornilladas encima de la raíz del ala: una detrás (sobre el
  // empalme) y otra delante, más fuera.
  tapaAla(0.53, 0.75, 0.25, 0.5),
  tapaAla(0.6, 0.95, 0.8, 1.05),
];

const PARTES: Parte[] = [
  {
    nombre: "Morro y torreta",
    en: [0, -0.85, TORRETA.z],
    piezas: ["torreta", "torreta-tambor", "torreta-marco", "torreta-ventana", "torreta-ventana-2", "sonda", "sonda-veleta", "sonda-veleta-2", "orejas", "antena-morro", "placa-panza", "antena-panza"],
    respaldo: "foto",
    fuentes: ["kiev", "radom", "frente", "baykar"],
    texto: "El morro es ancho y bajo. Debajo cuelga la bola de las cámaras, de día y térmica, con un láser que marca el blanco para las bombas. Es turca, de Aselsan, desde que en 2020 Canadá dejó de vender la suya a Turquía.",
    nota: "Qué lleva dentro sale de Baykar; la forma, de las fotos.",
  },
  {
    nombre: "Ala recta y larga",
    en: [4.2, 0.55, 0.3],
    piezas: ["ala", "aleron-0", "aleron-1", "carenado-aleron-0", "carenado-aleron-1", "luz-punta-1", "luz-punta--1", "pitot", "pitot-pie", "luz-raiz-1", "luz-raiz--1"],
    respaldo: "foto",
    fuentes: ["vuelo", "arriba", "plano", "baykar"],
    texto: "12 m de punta a punta, casi el doble que el largo del dron, con las puntas un poco levantadas. Junto al cuerpo se ensancha y engorda en un carenado que baja por el costado hasta la panza.",
    nota: "La envergadura es la de Baykar; la cuerda, el grueso y el diedro, medidos en el plano y en las fotos.",
  },
  {
    nombre: "Cuatro bombas MAM-L",
    en: [SOPORTES[1] + 0.3, yMam(SOPORTES[1]) - 0.15, 0.5],
    piezas: [...SOPORTES.flatMap((_, i) => [`soporte-${i}`, `percha-${i}`, `percha-tope-${i}-0`, `percha-tope-${i}-1`]), ...POSICIONES_MAM.flatMap(idsMam)],
    respaldo: "foto",
    fuentes: ["vuelo", "radom", "despegue", "baykar"],
    texto: "Dos bajo cada ala. Es una bomba pequeña de Roketsan, de 1 m y unos 22 kg, que planea hasta el punto del láser de la torreta. En los cuatro soportes caben también las MAM-C, más finas, y otras municiones turcas.",
  },
  {
    nombre: "Motor y hélice",
    en: [0, 0.85, -0.5],
    piezas: ["helice", "cono", "aro-helice", "capo", "capo-boca", "toma", "toma-boca", "escape", "escape-2", "rejilla-0", "rejilla-1", "rejilla-2", "rejilla-3"],
    respaldo: "foto",
    fuentes: ["detras", "perfil", "baykar"],
    texto: "Un motor de avioneta de unos 100 caballos en la parte de atrás del cuerpo, que mueve una hélice de dos palas y 1,7 m que empuja desde detrás. Al principio era el austriaco Rotax 912; cuando su fabricante dejó de venderlo en 2020, Baykar hizo el suyo.",
    nota: "El motor sale de Baykar y de la prensa; la hélice y la toma, de las fotos.",
  },
  {
    nombre: "Vigas y cola en V invertida",
    en: [0, 1.45, -2.7],
    piezas: ["viga-1", "viga--1", "luz-viga-1", "luz-viga--1", ...LADOS.flatMap((s) => [0, 1].map((i) => `franja-viga-${s}-${i}`)), "cola", "timon-0", "timon-1", "antena-cola", "carenado-timon-0", "carenado-timon-0-b", "carenado-timon-1", "carenado-timon-1-b", "varilla-timon-0", "varilla-timon-1"],
    respaldo: "foto",
    fuentes: ["detras", "arriba", "perfil", "plano"],
    texto: "Dos vigas salen del ala y llevan la cola, dos superficies que suben desde ellas y se juntan arriba, en el centro. La hélice gira en el hueco que queda entre las vigas.",
    nota: "El alto y el ángulo de la cola, medidos en el plano de frente y en las fotos.",
  },
  {
    nombre: "Tren de aterrizaje",
    en: [1.2, SUELO - 0.1, RUEDA.z],
    piezas: ["patas", "rodillas", "ejes", "ruedas", "bujes", "pata-morro", "vastago-morro", "compas-morro", "compas-morro-2", "horquilla", "rueda-morro", "buje-morro"],
    respaldo: "foto",
    fuentes: ["frente", "despegue", "perfil"],
    texto: "Tres ruedas: una bajo el morro y dos en patas que salen de la panza hacia fuera. No se recogen: en las fotos en vuelo se ven siempre fuera.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.panza !== undefined && { panza: u(q.panza) }), ...(q.lomo !== undefined && { lomo: u(q.lomo) }), ...(q.hombro !== undefined && { hombro: u(q.hombro) }), ...(q.costado !== undefined && { costado: u(q.costado) }), ...(q.costadoArriba !== undefined && { costadoArriba: u(q.costadoArriba) }), ...(q.bordeArriba !== undefined && { bordeArriba: u(q.bordeArriba) }), ...(q.bordeAbajo !== undefined && { bordeAbajo: u(q.bordeAbajo) }), ...(q.sobreArista !== undefined && { sobreArista: u(q.sobreArista) }), ...(q.bajoArista !== undefined && { bajoArista: u(q.bajoArista) }), ...(q.nariz !== undefined && { nariz: u(q.nariz) }) })), ...(p.tomas && { tomas: p.tomas.map((t) => ({ boca: u(t.boca), largo: u(t.largo), punta: u(t.punta), x: u(t.x), y: u(t.y), ancho: u(t.ancho), hondo: u(t.hondo), ceja: u(t.ceja) })) }) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
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
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "Bayraktar TB2",
  subtitulo: "Dron armado de media altitud",
  escala: ESCALA,  // 1 unidad = 4,5 m; medidas de Baykar
  // Es gris claro: la parte elegida, en tinta.
  resalte: "tinta",
  hd: true,
  // Su gris al sol tiene una luminosidad de 0,717, en el borde de dos
  // escalones del pixel HD (puestos para el MQ-9): corridos medio escalón.
  desfaseLuz: 0.48,
  // Ángulo de la tarjeta de /uas: el que eligió el usuario el 2-oct-2026 con
  // una captura del visor (cámara encajada: acimut 61°, elevación 20°), en
  // vez del de todas (79°, 11°).
  vistaTarjeta: [61, 20],
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("TR"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "vuelo", imagen: "vuelo-armado.jpg", titulo: "En vuelo, desde arriba, con cuatro MAM-L", medio: "ArmyInform, Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2.jpg` },
    { id: "arriba", imagen: "arriba-ucrania.jpg", titulo: "Desde arriba, en una base ucraniana", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_01.jpg` },
    { id: "detras", imagen: "detras-ucrania.jpg", titulo: "Desde detrás: la cola, la hélice y el tren", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_06.jpg` },
    { id: "perfil", imagen: "perfil-ucrania.jpg", titulo: "De lado: una viga, la cola y el motor", medio: "Ministerio de Defensa de Ucrania (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_of_UAF,_2019,_07.jpg` },
    { id: "radom", imagen: "radom-armado.jpg", titulo: "Un TB2 polaco armado, en Radom en 2023", medio: "Boevaya mashina (Wikimedia Commons)", url: `${COMMONS}PAF_Bayraktar_TB2_at_Radom-2023.jpg` },
    { id: "kiev", imagen: "kiev-morro.jpg", titulo: "El morro, de cerca, en una feria en Kiev en 2019", medio: "Zinnsoldat (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2,_Kyiv,_2019_03.jpg` },
    { id: "frente", imagen: "frente-teknofest.jpg", titulo: "De frente, en Teknofest 2019", medio: "Kingbjelica (Wikimedia Commons)", url: `${COMMONS}Bayraktar_TB2_S-%C4%B0HA,_Teknofest_2019.jpg` },
    { id: "despegue", imagen: "despegue-armado.jpg", titulo: "Despegando, armado", medio: "Fuerza Aérea de Ucrania (Wikimedia Commons)", url: `${COMMONS}Ukrainian_bayraktar.jpg` },
    { id: "plano", imagen: "plano-cinco-vistas.jpg", titulo: "Plano de cinco vistas, a escala", medio: "Alexpl (Wikimedia Commons)", url: `${COMMONS}Bayraktar-TB2-draw.svg` },
    { id: "baykar", titulo: "Bayraktar TB2 (ficha técnica)", medio: "Baykar", url: BAYKAR },
  ],
};

export default maqueta;
