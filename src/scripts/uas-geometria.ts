// Geometría de las maquetas de drones (src/data/uas/): de cada pieza, sus
// mallas. La usan el visor (visor-uas.ts) y el generador del pixel art
// (arte/generar-uas-pixel.mjs), así las dos versiones salen de lo mismo.
import {
  BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry,
  Float32BufferAttribute, LatheGeometry, Quaternion, Shape, SphereGeometry,
  Vector2, Vector3,
} from "three";
import type { Pieza, Seccion, Toma } from "../data/uas/tipos";

export type Vista = "3d" | "arriba" | "abajo" | "lado" | "frente" | "detras";

// Ángulos de cada vista: [acimut, elevación] en grados. Acimut 0 = de frente
// (desde el morro), 90 = desde el ala derecha.
export const VISTAS: Record<Vista, [number, number]> = {
  "3d": [38, 32],
  arriba: [180, 89.9],  // desde detrás, para que el morro quede arriba
  abajo: [0, -89.9],  // desde abajo, con el morro arriba (como en las láminas de identificación)
  lado: [90, 0],
  frente: [0, 0],
  detras: [180, 8],
};

// Medio grosor de un perfil NACA de 4 cifras simétrico, en tanto por uno del
// grosor máximo (0 en el borde de ataque, 0,5 hacia un tercio de la cuerda,
// casi 0 en el de salida).
const perfilNaca = (s: number) =>
  5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);

// Ala con perfil: cada estación es un contorno de perfil (extradós abombado,
// intradós más plano); las estaciones se unen a lo largo de la envergadura y
// las puntas se cierran. Cada estación puede subir sobre y (el diedro).
type Estacion = readonly [number, number, number, number, number];
function geometriaAla(y: number, estaciones: Estacion[], sinTapa: number[] = []): BufferGeometry {
  const N = 14;  // puntos por cara, más juntos cerca del borde de ataque
  const cuerda = Array.from({ length: N + 1 }, (_, i) => (1 - Math.cos((i / N) * Math.PI)) / 2);
  // El contorno va del borde de salida por arriba hasta el de ataque y vuelve
  // por abajo, sin repetir los extremos.
  const contorno: [number, number][] = [
    ...cuerda.slice().reverse().map((s): [number, number] => [s, 1]),
    ...cuerda.slice(1, -1).map((s): [number, number] => [s, -0.55]),
  ];
  const M = contorno.length;
  const pos: number[] = [];
  const idx: number[] = [];
  // Un anillo de vértices con el perfil de una estación; devuelve el primero.
  const anillo = ([x, zBA, zBS, t, sube]: Estacion) => {
    const base = pos.length / 3;
    for (const [s, lado] of contorno) pos.push(x, y + sube + lado * t * perfilNaca(s), zBA + (zBS - zBA) * s);
    return base;
  };
  const unir = (a: number, b: number) => {
    for (let k = 0; k < M; k++) {
      const a0 = a + k, a1 = a + ((k + 1) % M), b0 = b + k, b1 = b + ((k + 1) % M);
      idx.push(a0, a1, b0, a1, b1, b0);
    }
  };
  // Las estaciones seguidas comparten vértices (normales suaves a lo largo de
  // la envergadura). Un escalón (dos estaciones en la misma x: donde el borde
  // de salida cambia de sitio, junto a un alerón o el hueco de un motor) es
  // una pared de lado con vértices propios; compartidos, su normal torcía la
  // luz del tramo de ala de al lado.
  const primero = anillo(estaciones[0]);
  let previo = primero;
  for (let e = 0; e < estaciones.length - 1; e++) {
    if (estaciones[e][0] === estaciones[e + 1][0]) {
      unir(anillo(estaciones[e]), anillo(estaciones[e + 1]));
      previo = anillo(estaciones[e + 1]);
    } else {
      const siguiente = anillo(estaciones[e + 1]);
      unir(previo, siguiente);
      previo = siguiente;
    }
  }
  // Tapas de las puntas: abanico desde el centro de cada contorno.
  for (const [e, base] of [[0, primero], [estaciones.length - 1, previo]]) {
    if (sinTapa.includes(e)) continue;
    const [x, zBA, zBS, , sube] = estaciones[e];
    const centro = pos.length / 3;
    pos.push(x, y + sube, (zBA + zBS) / 2);
    for (let k = 0; k < M; k++) idx.push(centro, base + k, base + ((k + 1) % M));
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Interpolación cúbica monótona (Fritsch-Carlson) de v en función de z: pasa
// por todos los puntos, es suave y no se pasa de largo entre dos medidas
// (una curva normal abombaría el cuerpo entre secciones muy distintas).
function monotona(zs: number[], vs: number[]) {
  const n = zs.length;
  const d = zs.slice(1).map((z, i) => (vs[i + 1] - vs[i]) / (z - zs[i]));
  const m = zs.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (z: number) => {
    let i = 0;
    while (i < n - 2 && z > zs[i + 1]) i++;
    const h = zs[i + 1] - zs[i], t = (z - zs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * vs[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * vs[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

// Casco: anillos a lo largo de z, con las medidas de las secciones
// interpoladas. La mitad de arriba es una superelipse (su alto y su
// «cuadratura»); la de abajo, otra superelipse o, si la sección da `panza`,
// un trapecio: del costado baja una cara inclinada hasta una panza plana de
// ese medio ancho, con las esquinas de abajo redondeadas (el fuselaje del
// MQ-9). Las dos mitades van con vértices propios, así la arista del costado
// (la cintura) queda viva en la luz. Las puntas con ancho 0 quedan cerradas;
// si no, se tapan.
// Una curva abierta, suavizada: se reparte por su largo, se le pega delante y
// detrás su reflejo en el extremo (así los extremos no se mueven y la
// dirección con la que salen se conserva) y se pasa una campana de ancho
// `sigma` (en largo de curva). Sale con el mismo número de puntos, repartidos
// por igual a lo largo.
// Con `crece`, la campana va creciendo desde los extremos (ancho = crece ×
// distancia al extremo, hasta `sigma`): una nariz pequeña junto al borde se
// conserva y su unión con el resto queda lisa.
function suavizarCurva(pts: [number, number][], sigma: number, crece = 0): [number, number][] {
  const n = pts.length;
  const L = [0];
  for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[n - 1];
  if (total < 1e-9) return pts;
  const enLargo = (d: number): [number, number] => {
    let i = 1;
    while (i < n - 1 && L[i] < d) i++;
    const t = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
  };
  const M = 240, paso = total / M;
  const s = Math.min(sigma, 0.12 * total);
  const base = Array.from({ length: M + 1 }, (_, k) => enLargo(k * paso));
  // Con el reflejo en cada extremo (punto = 2·extremo − punto).
  const ext = (k: number): [number, number] => {
    if (k < 0) { const q = base[Math.min(M, -k)]; return [2 * base[0][0] - q[0], 2 * base[0][1] - q[1]]; }
    if (k > M) { const q = base[Math.max(0, 2 * M - k)]; return [2 * base[M][0] - q[0], 2 * base[M][1] - q[1]]; }
    return base[k];
  };
  const lisa = base.map((_, k) => {
    const sk = crece > 0 ? Math.min(s, crece * Math.min(k, M - k) * paso) : s;
    if (sk < 1e-9) return base[k];
    const R = Math.ceil((3 * sk) / paso);
    let x = 0, y = 0, suma = 0;
    for (let j = -R; j <= R; j++) { const w = Math.exp(-0.5 * ((j * paso) / sk) ** 2), q = ext(k + j); x += q[0] * w; y += q[1] * w; suma += w; }
    return [x / suma, y / suma] as [number, number];
  });
  // De vuelta a n puntos, por igual a lo largo de la curva lisa (con
  // `crece`, cuatro veces más juntos junto a los extremos: la nariz, con
  // pocos puntos, salía poligonal).
  const L2 = [0];
  for (let i = 1; i <= M; i++) {
    const d = Math.min(i, M - i) * paso, peso = crece > 0 ? 1 + 3 * Math.exp(-d / (s || 1)) : 1;
    L2.push(L2[i - 1] + Math.hypot(lisa[i][0] - lisa[i - 1][0], lisa[i][1] - lisa[i - 1][1]) * peso);
  }
  let i = 1;
  return Array.from({ length: n }, (_, k) => {
    const d = (k / (n - 1)) * L2[M];
    while (i < M && L2[i] < d) i++;
    const t = (d - L2[i - 1]) / ((L2[i] - L2[i - 1]) || 1);
    return [lisa[i - 1][0] + (lisa[i][0] - lisa[i - 1][0]) * t, lisa[i - 1][1] + (lisa[i][1] - lisa[i - 1][1]) * t] as [number, number];
  });
}

// Una sección cerrada (la mitad de arriba, de +x a −x, y la de abajo, de −x
// a +x), suavizada entera como una sola curva: sin arista entre las dos
// mitades. Devuelve las dos mitades con sus números de puntos, repartidos
// por igual a lo largo.
function suavizarCerrada(arriba: [number, number][], abajo: [number, number][], sigma: number): [[number, number][], [number, number][]] {
  const lazo = [...arriba, ...abajo.slice(1, -1)];
  const n = lazo.length;
  const L = [0];
  for (let i = 1; i <= n; i++) { const a = lazo[i - 1], b = lazo[i % n]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const total = L[n];
  let largoArriba = 0;
  for (let i = 1; i < arriba.length; i++) largoArriba += Math.hypot(arriba[i][0] - arriba[i - 1][0], arriba[i][1] - arriba[i - 1][1]);
  if (total < 1e-9) return [arriba, abajo];
  const enLargo = (d: number): [number, number] => {
    d = ((d % total) + total) % total;
    let i = 1;
    while (i < n && L[i] < d) i++;
    const t = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1), a = lazo[i - 1], b = lazo[i % n];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  const M = 480, paso = total / M, s = Math.min(sigma, 0.06 * total);
  const base = Array.from({ length: M }, (_, k) => enLargo(k * paso));
  const R = Math.ceil((3 * s) / paso), pesos = Array.from({ length: 2 * R + 1 }, (_, j) => Math.exp(-0.5 * (((j - R) * paso) / (s || 1)) ** 2));
  const suma = pesos.reduce((a, b) => a + b, 0);
  const lisa = base.map((_, k) => {
    if (s < 1e-9) return base[k];
    let x = 0, y = 0;
    for (let j = -R; j <= R; j++) { const q = base[(((k + j) % M) + M) % M]; x += q[0] * pesos[j + R]; y += q[1] * pesos[j + R]; }
    return [x / suma, y / suma] as [number, number];
  });
  const m1 = Math.round((M * largoArriba) / total);
  const repartir = (pts: [number, number][], cuantos: number): [number, number][] => {
    const Lp = [0];
    for (let i = 1; i < pts.length; i++) Lp.push(Lp[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let i = 1;
    return Array.from({ length: cuantos }, (_, k) => {
      const d = (k / (cuantos - 1)) * Lp[Lp.length - 1];
      while (i < pts.length - 1 && Lp[i] < d) i++;
      const t = (d - Lp[i - 1]) / ((Lp[i] - Lp[i - 1]) || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t] as [number, number];
    });
  };
  const arr = Array.from({ length: m1 + 1 }, (_, k) => lisa[k]);
  const ab = Array.from({ length: M - m1 + 1 }, (_, k) => lisa[(m1 + k) % M]);
  return [repartir(arr, arriba.length), repartir(ab, abajo.length)];
}

function geometriaCasco(secciones: Seccion[], abierto = false, tomas: Toma[] = [], alisado = 0): BufferGeometry {
  const ss = secciones.slice().sort((a, b) => a.z - b.z);
  // Con lomo, más puntos arriba: el hombro entre el cuerpo y el lomo es una
  // curva cerrada. Con tomas, más todavía (y apretados en las tomas).
  const conLomo = ss.some((q) => q.lomo !== undefined);
  // Con `alisado`, más puntos por mitad (la sección lisa va repartida por
  // igual a lo largo y con pocos puntos salía poligonal) y los anillos por
  // distancia, uno cada 1/260 del largo (con 12 entre cada dos secciones se
  // amontonaban donde hay muchas, en la raíz del ala).
  const PASOS = 12, MEDIO = alisado > 0 ? 96 : conLomo ? 44 : 28;  // anillos entre secciones; puntos por mitad
  const zs = ss.map((q) => q.z);
  const f = (v: (q: Seccion) => number) => monotona(zs, ss.map(v));
  const ancho = f((q) => q.ancho), arriba = f((q) => q.arriba), abajo = f((q) => q.abajo);
  const cintura = f((q) => q.cintura ?? (q.arriba + q.abajo) / 2);
  const nA = f((q) => q.n ?? 2), nB = f((q) => q.nAbajo ?? q.n ?? 2);
  const conPanza = ss.some((q) => q.panza !== undefined);
  const panza = f((q) => q.panza ?? q.ancho * 0.5);
  const arista = f((q) => q.arista ?? 0);
  // Lomo: medio ancho del lomo (0, sin lomo) y alto del cuerpo de debajo (el
  // hombro); con lomo, `arriba` es lo alto del lomo.
  const lomo = f((q) => q.lomo ?? 0), hombro = f((q) => q.hombro ?? q.arriba), nL = f((q) => q.nLomo ?? 2.4);
  // Ensanche (arista que se hace raíz del ala): medio ancho del cuerpo y
  // dónde acaban los empalmes por arriba y por abajo.
  const conEnsanche = ss.some((q) => q.costado !== undefined);
  const costado = f((q) => q.costado ?? q.ancho);
  const costadoArriba = f((q) => q.costadoArriba ?? q.costado ?? q.ancho);
  const sobreArista = f((q) => q.sobreArista ?? q.cintura ?? (q.arriba + q.abajo) / 2);
  const bajoArista = f((q) => q.bajoArista ?? q.cintura ?? (q.arriba + q.abajo) / 2);
  const bordeArriba = f((q) => q.bordeArriba ?? q.cintura ?? (q.arriba + q.abajo) / 2);
  const bordeAbajo = f((q) => q.bordeAbajo ?? q.cintura ?? (q.arriba + q.abajo) / 2);
  const redondeo = f((q) => q.redondeo ?? 0);
  const nariz = f((q) => q.nariz ?? 0);
  const CAP = 7;
  const anillosZ: number[] = [];
  const pasoZ = (zs[zs.length - 1] - zs[0]) / 260;
  for (let i = 0; i < zs.length - 1; i++) {
    const pasos = alisado > 0 ? Math.max(1, Math.ceil((zs[i + 1] - zs[i]) / pasoZ)) : PASOS;
    for (let j = 0; j < pasos; j++) anillosZ.push(zs[i] + ((zs[i + 1] - zs[i]) * j) / pasos);
  }
  anillosZ.push(zs[zs.length - 1]);

  // Tomas de aire sumergidas (ver `Toma`): cada una, en ángulo alrededor de
  // la cintura, para hundir la sección hacia su centro. Un anillo justo en
  // la boca y otros detrás: entre ellos, la pared de la boca y el final de
  // la ceja.
  const huecos = tomas.map((t) => {
    const c = cintura(t.boca), r0 = Math.hypot(t.x, t.y - c);
    return { ...t, ang: Math.atan2(t.y - c, t.x), dAng: t.ancho / r0, pared: 0.15 * t.hondo, finCeja: 0.35 * t.hondo };
  });
  // (Los anillos de siempre ya van cada centímetro o así; los de la boca
  // apartan a los que les quedan pegados: con anillos casi juntos, los
  // triángulos salen planos y la luz, a rayas.)
  const fijos = huecos.flatMap((t) => [t.boca, t.boca - t.pared, t.boca - 2 * t.pared, t.boca - t.finCeja]);
  const cerca = (z: number) => fijos.some((f) => Math.abs(z - f) < 0.5 * Math.min(...huecos.map((t) => t.pared)));
  for (let i = anillosZ.length - 1; i >= 0; i--) if (cerca(anillosZ[i])) anillosZ.splice(i, 1);
  anillosZ.push(...fijos);
  anillosZ.sort((a, b) => a - b);
  const anguloDe = (x: number, y: number, c: number) => Math.atan2(y - c, Math.abs(x));
  // Más puntos en las tomas. La parte baja de la media sección (el empalme
  // y el costado, hasta el punto K0) se queda como está: ahí están las
  // esquinas que dan la luz. De ahí hasta lo alto, los puntos van en ángulos
  // fijos desde la cintura (los mismos en todos los anillos: si un punto se
  // cruza con otro de un anillo al siguiente, la luz sale a rayas), más
  // juntos en las tomas, sobre la curva suave del radio según el ángulo.
  const K0 = 12 + CAP, EXTRA = 16;
  const porAngulo = (pts: [number, number][], c: number): [number, number][] => {
    const K = (pts.length - 1) / 2, media = pts.slice(0, K + 1);
    // Solo los puntos con el ángulo creciente (en el morro, donde la sección
    // es casi un punto, alguno se repite).
    const arriba = media.slice(K0).filter(([x, y], i, l) => i === 0 || Math.atan2(y - c, x) > Math.atan2(l[i - 1][1] - c, l[i - 1][0]) + 1e-9);
    const angs = arriba.map(([x, y]) => Math.atan2(y - c, x)), radios = arriba.map(([x, y]) => Math.hypot(x, y - c));
    const n = K - K0 + EXTRA;
    const espejo = (mitad: [number, number][]) => [...mitad, ...mitad.slice(0, -1).reverse().map(([x, y]): [number, number] => [-x, y])];
    // Una sección que es casi un punto: el último, repetido.
    if (angs.length < 2) return espejo([...media.slice(0, K0 + 1), ...Array.from({ length: n }, () => media[K])]);
    const radio = monotona(angs, radios);
    const a0 = angs[0], a1 = Math.PI / 2;
    // Reparto con una campana de densidad en cada toma (integrada a pasos).
    const peso = (a: number) => 1 + huecos.reduce((s, t) => s + 7 * Math.exp(-(((a - t.ang) / (1.5 * t.dAng)) ** 2)), 0);
    const PASOS_A = 400, acum = [0];
    for (let i = 1; i <= PASOS_A; i++) acum.push(acum[i - 1] + peso(a0 + ((a1 - a0) * (i - 0.5)) / PASOS_A));
    const nuevos: [number, number][] = [];
    for (let k = 1; k <= n; k++) {
      const objetivo = (k / n) * acum[PASOS_A];
      let i = 1;
      while (i < PASOS_A && acum[i] < objetivo) i++;
      const a = a0 + ((a1 - a0) * (i - 1 + (objetivo - acum[i - 1]) / (acum[i] - acum[i - 1]))) / PASOS_A;
      const r = radio(a);
      nuevos.push(k === n ? [0, c + r] : [r * Math.cos(a), c + r * Math.sin(a)]);
    }
    return espejo([...media.slice(0, K0 + 1), ...nuevos]);
  };
  // Los mismos puntos repartidos a lo largo de la curva, más juntos donde
  // `peso` es mayor.
  // Los `fijo` primeros y últimos no se mueven (el tramo que cierra el
  // borde por dentro del ala: si no, se cortaba la esquina con el ala).
  const aLoLargo = (todos: [number, number][], fijo: number, peso: (x: number, y: number) => number): [number, number][] => {
    if (fijo > 0) return [...todos.slice(0, fijo), ...aLoLargo(todos.slice(fijo, todos.length - fijo), 0, peso), ...todos.slice(todos.length - fijo)];
    const pts = todos;
    const L = [0];
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]];
      L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]) * peso((a[0] + b[0]) / 2, (a[1] + b[1]) / 2));
    }
    const total = L[L.length - 1] || 1;
    let i = 1;
    return pts.map((_, k) => {
      const d = (k / (pts.length - 1)) * total;
      while (i < pts.length - 1 && L[i] < d) i++;
      const t = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    });
  };
  // Hunde la sección en cada toma (hacia el centro, a lo largo del radio
  // desde la cintura) y saca un poco sus bordes.
  const suave = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hundir = (pts: [number, number][], z: number, c: number): [number, number][] => pts.map(([x, y]) => {
    const ang = anguloDe(x, y, c);
    let r = Math.hypot(x, y - c);
    for (const t of huecos) {
      if (z > t.punta) continue;
      const kPared = z >= t.boca ? 1 : 1 - suave(0, t.pared, t.boca - z);
      const kCeja = z >= t.boca ? 1 : 1 - suave(0, t.finCeja, t.boca - z);
      // El hueco: en planta, un cuarto de elipse (ancho entero en la boca, a
      // cero en el frente), con las paredes casi rectas y el frente en cuesta.
      const q = Math.min(1, Math.max(0, (z - t.boca) / t.largo));
      const fw = Math.sqrt(1 - q * q);
      const dHueco = fw > 0 ? Math.abs(ang - t.ang) / (t.dAng * fw) : 9;
      const hueco = (1 - q ** 1.5) * (1 - suave(0.5, 1, dHueco));
      // La rampa de delante, poco honda, que se abre hacia la boca.
      const s = Math.min(1, (t.punta - z) / (t.punta - t.boca));
      const ancho = t.dAng * (0.12 + 0.88 * s ** 0.6);
      const dRampa = Math.abs(ang - t.ang) / ancho;
      const rampa = 0.3 * s ** 1.5 * (1 - suave(0.55, 1, dRampa));
      // Los bordes, un poco salidos, a lo largo de la rampa y del hueco.
      const borde = Math.abs(ang - t.ang) / Math.max(ancho, t.dAng * fw);
      const ceja = t.ceja * suave(0, 0.8, s) * kCeja * Math.exp(-(((borde - 1.05) / 0.18) ** 2));
      r += -t.hondo * kPared * Math.max(hueco, rampa) + ceja;
    }
    return [Math.sign(x) * r * Math.cos(ang), c + r * Math.sin(ang)];
  });

  // Mitad de abajo en trapecio: de (-w, c) a (-p, b), (p, b) y (w, c), con
  // las esquinas de abajo redondeadas, repartida por su largo.
  const trapecio = (w: number, p: number, c: number, b: number): [number, number][] => {
    const r = Math.min(0.4 * Math.hypot(w - p, c - b), 0.5 * p);
    const esquina = (ax: number, ay: number, ox: number, oy: number, bx: number, by: number) => {
      const d1 = Math.hypot(ax - ox, ay - oy) || 1, d2 = Math.hypot(bx - ox, by - oy) || 1;
      const p1 = [ox + ((ax - ox) * r) / d1, oy + ((ay - oy) * r) / d1], p2 = [ox + ((bx - ox) * r) / d2, oy + ((by - oy) * r) / d2];
      return Array.from({ length: 7 }, (_, i) => {
        const t = i / 6;
        return [(1 - t) ** 2 * p1[0] + 2 * (1 - t) * t * ox + t * t * p2[0], (1 - t) ** 2 * p1[1] + 2 * (1 - t) * t * oy + t * t * p2[1]] as [number, number];
      });
    };
    const linea: [number, number][] = [[-w, c], ...esquina(-w, c, -p, b, p, b), ...esquina(-p, b, p, b, w, c), [w, c]];
    const largos = [0];
    for (let i = 1; i < linea.length; i++) largos.push(largos[i - 1] + Math.hypot(linea[i][0] - linea[i - 1][0], linea[i][1] - linea[i - 1][1]));
    const total = largos[largos.length - 1] || 1;
    return Array.from({ length: MEDIO + 1 }, (_, k) => {
      const d = (k / MEDIO) * total;
      let i = 1;
      while (i < linea.length - 1 && largos[i] < d) i++;
      const t = (d - largos[i - 1]) / ((largos[i] - largos[i - 1]) || 1);
      return [linea[i - 1][0] + (linea[i][0] - linea[i - 1][0]) * t, linea[i - 1][1] + (linea[i][1] - linea[i - 1][1]) * t];
    });
  };

  // Dos tiras: la de arriba (de +x a −x por el lomo) y la de abajo (de −x a
  // +x por la panza), cada una con MEDIO + 1 puntos por anillo.
  const tiras: number[][] = [[], []];
  const aplazados: { z: number; c: number; fijo: number; arriba: [number, number][]; abajo: [number, number][] }[] = [];
  for (const z of anillosZ) {
    const w = Math.max(0, ancho(z)), c = cintura(z);
    const cima = Math.max(c, arriba(z)), bot = Math.min(c, abajo(z));
    const wl = conLomo ? Math.max(0, lomo(z)) : 0;
    const top = conLomo ? Math.max(c, Math.min(cima, hombro(z))) : cima;
    const na = Math.max(0.5, nA(z)), nb = Math.max(0.5, nB(z));
    if (conEnsanche) {
      // Media sección derecha, de la arista hacia el centro: el empalme
      // (curva con el punto de control en la esquina, cóncava) y el cuerpo
      // (cuarto de superelipse); luego su reflejo.
      const ws0 = Math.min(w, Math.max(0, costado(z))), wsA = Math.min(w, Math.max(0, costadoArriba(z)));
      const K = MEDIO / 2, KF = 9, KS = K - KF;
      // El empalme sale del borde del ensanche (a la altura yBorde) en
      // horizontal, como sigue el ala, y se curva hasta el costado.
      const r = Math.min(1.4, Math.max(0, redondeo(z)));
      // Con nariz, el borde del ensanche es media elipse de ese largo hacia
      // dentro (entre bordeArriba y bordeAbajo) y los empalmes salen de sus
      // extremos; sin ella, los CAP puntos de la nariz caen en el borde.
      const a = Math.min(Math.max(0, nariz(z)), 0.9 * Math.max(0, w - Math.max(ws0, wsA)));
      const wE = w - a;
      const media = (yLado: number, yCentro: number, n: number, ws: number, yBorde: number, yMedio: number): [number, number][] => {
        const pts: [number, number][] = [];
        for (let k = 0; k < CAP; k++) {
          const t = (k / CAP) * (Math.PI / 2);
          pts.push([wE + a * Math.cos(t), yMedio + (yBorde - yMedio) * Math.sin(t)]);
        }
        // Con redondeo, el empalme sale del borde inclinado (no en horizontal)
        // y sigue llegando en vertical al costado: sin pliegue con el cuerpo.
        // Es la cuadrática con el control en (ws, cy) escrita como cúbica, con
        // el último tramo vertical al menos del 45 % del alto: con mucho
        // redondeo el control quedaba casi arriba, la curva iba recta y
        // giraba en un codo junto al costado (delante del ala del TB2 se veía
        // como un bulto).
        const cy = yBorde + r * (yLado - yBorde);
        const p1 = [wE + (2 / 3) * (ws - wE), yBorde + (2 / 3) * (cy - yBorde)];
        const p2 = [ws, yLado - Math.max((2 / 3) * (yLado - cy), 0.45 * (yLado - yBorde))];
        for (let k = 0; k < KF; k++) {
          const t = k / KF, u = 1 - t;
          pts.push([u ** 3 * wE + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * ws, u ** 3 * yBorde + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * yLado]);
        }
        for (let k = 0; k <= KS; k++) {
          const t = (k / KS) * (Math.PI / 2), co = Math.cos(t), si = Math.sin(t);
          pts.push([ws * co ** (2 / n), yLado + (yCentro - yLado) * si ** (2 / n)]);
        }
        return pts;
      };
      const yS = Math.min(top, Math.max(c, sobreArista(z))), yB = Math.max(bot, Math.min(c, bajoArista(z)));
      const yBA = Math.min(yS, Math.max(c, bordeArriba(z))), yBB = Math.max(yB, Math.min(c, bordeAbajo(z)));
      const yMedio = (yBA + yBB) / 2;
      const arribaD = media(yS, top, na, wsA, yBA, yMedio), abajoD = media(yB, bot, nb, ws0, yBB, yMedio);
      const arribaPts = [...arribaD, ...arribaD.slice(0, -1).reverse().map(([x, y]): [number, number] => [-x, y])];
      const abajoPts2 = [...abajoD.map(([x, y]): [number, number] => [-x, y]), ...abajoD.slice(0, -1).reverse()];
      // Lomo, como arriba.
      const anillo: [number, number][] = [];
      for (const [x0, y0] of arribaPts) {
        let x = x0, y = y0;
        if (wl > 0) {
          const hL2 = cima - c;
          const ang = Math.atan2(y - c, x), r1 = Math.hypot(x, y - c);
          const ca = Math.abs(Math.cos(ang)), sa = Math.abs(Math.sin(ang)), nl2 = Math.max(0.5, nL(z));
          const r2 = hL2 > 1e-6 ? 1 / ((ca / wl) ** nl2 + (sa / hL2) ** nl2) ** (1 / nl2) : 0;
          const r = (r1 ** 8 + r2 ** 8) ** (1 / 8);
          if (r1 > 1e-9) { x *= r / r1; y = c + ((y - c) * r) / r1; }
        }
        anillo.push([x, y]);
      }
      // Con `suave`, cada mitad es una sola curva lisa del borde de un lado
      // al del otro: sin las esquinas y los dobleces donde se juntan el
      // empalme, el costado, el hombro y el lomo (cada una salía como una
      // línea en la luz).
      // Donde el ensanche es la raíz del ala, el borde no se mueve (el ala
      // nace ahí con su perfil) y el tramo que lo cierra por dentro del ala
      // tampoco (si no, la superficie bajaba junto al ala y salía un surco). Donde el ensanche apenas sale del costado (delante
      // del ala), la sección se suaviza entera: con el borde fijo, la arista
      // quedaba en V. Entre medias, poco a poco.
      let arribaLisa = anillo, abajoLisa = abajoPts2;
      // Sin nariz, el tramo que cierra el borde por dentro del ala no se
      // suaviza. Con nariz, entra en el suavizado, pero con la campana
      // creciendo desde el borde: la nariz es más pequeña que la campana y,
      // suavizada entera, salía en V de cuchillo; fuera del suavizado, hacía
      // esquina con el resto.
      const fijo = a > 1e-6 ? 0 : CAP;
      if (alisado > 0) {
        const abierta = (pts: [number, number][]) => [...pts.slice(0, fijo), ...suavizarCurva(pts.slice(fijo, pts.length - fijo), alisado, 0.35), ...pts.slice(pts.length - fijo)];
        const [ar1, ab1] = [abierta(anillo), abierta(abajoPts2)];
        const k = 1 - suave(0.4 * alisado, 1.8 * alisado, w - Math.max(ws0, wsA));
        if (k > 1e-3) {
          const [ar2, ab2] = suavizarCerrada(anillo, abajoPts2, alisado);
          const mezcla = (p: [number, number][], q: [number, number][]) => p.map(([x, y], i): [number, number] => [x + (q[i][0] - x) * k, y + (q[i][1] - y) * k]);
          arribaLisa = mezcla(ar1, ar2); abajoLisa = mezcla(ab1, ab2);
        } else { arribaLisa = ar1; abajoLisa = ab1; }
      }
      // Con la sección lisa, las tomas y los anillos se ponen al final, tras
      // suavizar también a lo largo del cuerpo (ver abajo).
      if (alisado > 0) { aplazados.push({ z, c, fijo, arriba: arribaLisa, abajo: abajoLisa }); continue; }
      // Con tomas, más puntos en ellas, por ángulo (con la sección lisa, a lo
      // largo de la curva, abajo: por ángulo, la parte plana junto al ala se
      // quedaba con muy pocos puntos).
      for (const [x, y] of huecos.length ? hundir(porAngulo(arribaLisa, c), z, c) : arribaLisa) tiras[0].push(x, y, z);
      for (const [x, y] of abajoLisa) tiras[1].push(x, y, z);
      continue;
    }
    // Arriba, la superelipse tiene su centro «virtual» por debajo de la
    // cintura (arista: qué parte del alto de arriba baja) y se corta en la
    // cintura: así llega a ella ya inclinada, mirando hacia arriba, y la
    // arista con la cara de abajo marca un ángulo (y un contraste de luz).
    const k0 = Math.min(0.9, Math.max(0, arista(z)));
    const c0 = c - k0 * (top - c), alto = top - c0;
    const t0 = Math.asin(Math.min(1, ((c - c0) / (alto || 1)) ** (na / 2)));
    const W = k0 > 0 ? w / Math.max(1e-6, Math.abs(Math.cos(t0)) ** (2 / na)) : w;
    // Lomo: una superelipse más estrecha y más alta, unida al cuerpo con una
    // unión suave (la norma p de los dos radios vistos desde la cintura): sale
    // un hombro cóncavo, sin arista, como en el lomo del TB2.
    const hL = cima - c, nl = Math.max(0.5, nL(z)), P = 8;
    const radioLomo = (ang: number) => {
      if (wl <= 1e-6 || hL <= 1e-6) return 0;
      const ca = Math.abs(Math.cos(ang)), sa = Math.abs(Math.sin(ang));
      return 1 / ((ca / wl) ** nl + (sa / hL) ** nl) ** (1 / nl);
    };
    for (let k = 0; k <= MEDIO; k++) {
      const t = t0 + (k / MEDIO) * (Math.PI - 2 * t0), co = Math.cos(t), si = Math.sin(t);
      let x = W * Math.sign(co) * Math.abs(co) ** (2 / na), y = c0 + alto * Math.abs(si) ** (2 / na);
      if (wl > 0) {
        const ang = Math.atan2(y - c, x), r1 = Math.hypot(x, y - c), r2 = radioLomo(ang);
        const r = (r1 ** P + r2 ** P) ** (1 / P);
        if (r1 > 1e-9) { x *= r / r1; y = c + ((y - c) * r) / r1; }
      }
      tiras[0].push(x, y, z);
    }
    const abajoPts: [number, number][] = conPanza
      ? trapecio(w, Math.min(w, Math.max(0, panza(z))), c, bot)
      : Array.from({ length: MEDIO + 1 }, (_, k) => {
        const t = Math.PI + (k / MEDIO) * Math.PI, co = Math.cos(t), si = Math.sin(t);
        return [w * Math.sign(co) * Math.abs(co) ** (2 / nb), c - (c - bot) * Math.abs(si) ** (2 / nb)];
      });
    for (const [x, y] of abajoPts) tiras[1].push(x, y, z);
  }
  const pos: number[] = [], idx: number[] = [];
  // Con `alisado`, también a lo largo del cuerpo: cada punto, con los del
  // mismo número en los anillos vecinos (campana de 0,6·alisado en z). Sin
  // esto quedaba un escalón de 1 a 3 cm entre dos secciones seguidas en el
  // borde de ataque, a lo largo de la raíz del ala: se veía una línea, como
  // si el ala acabase ahí. Junto al borde del ensanche no se toca (el ala
  // nace ahí con su perfil), ni en las puntas del cuerpo.
  if (aplazados.length) {
    const sZ = 0.6 * alisado, z0 = aplazados[0].z, zN = aplazados[aplazados.length - 1].z;
    const alisarZ = (cual: "arriba" | "abajo") => aplazados.map((r, k) => {
      const borde = Math.abs(r[cual][0][0]), fin = suave(0, 3 * sZ, Math.min(r.z - z0, zN - r.z));
      let j0 = k, j1 = k;
      while (j0 > 0 && r.z - aplazados[j0 - 1].z < 3 * sZ) j0--;
      while (j1 < aplazados.length - 1 && aplazados[j1 + 1].z - r.z < 3 * sZ) j1++;
      return r[cual].map(([x, y], i): [number, number] => {
        const p = fin * suave(0.3 * alisado, 1.5 * alisado, borde - Math.abs(x));
        if (p < 1e-4) return [x, y];
        let sx = 0, sy = 0, sw = 0;
        for (let j = j0; j <= j1; j++) { const w = Math.exp(-0.5 * ((aplazados[j].z - r.z) / sZ) ** 2), q = aplazados[j][cual][i]; sx += q[0] * w; sy += q[1] * w; sw += w; }
        return [x + (sx / sw - x) * p, y + (sy / sw - y) * p];
      });
    });
    const [arribas, abajos] = [alisarZ("arriba"), alisarZ("abajo")];
    aplazados.forEach(({ z, c, fijo }, k) => {
      const arribaLisa = arribas[k], abajoLisa = abajos[k];
      // Con tomas, más puntos en ellas, a lo largo de la curva con más peso
      // cerca de la toma (y, como al suavizar, junto a los bordes).
      const xBorde = Math.abs(arribaLisa[0][0]);
      const conTomas = huecos.length ? aLoLargo(arribaLisa, fijo, (x, y) => 1 + 3 * Math.exp(-Math.hypot(xBorde - Math.abs(x), y - arribaLisa[0][1]) / alisado) + huecos.reduce((acc, t) => acc + 4 * Math.exp(-(((anguloDe(x, y, c) - t.ang) / (1.6 * t.dAng)) ** 2)), 0)) : arribaLisa;
      for (const [x, y] of huecos.length ? hundir(conTomas, z, c) : arribaLisa) tiras[0].push(x, y, z);
      for (const [x, y] of abajoLisa) tiras[1].push(x, y, z);
    });
  }
  // Puntos por anillo de cada tira (la de arriba, con los de las tomas).
  const Ns = tiras.map((t) => t.length / 3 / anillosZ.length);
  const bases = [0, tiras[0].length / 3];
  tiras.forEach((tira, t) => {
    const base = pos.length / 3, N = Ns[t];
    for (const v of tira) pos.push(v);
    for (let i = 0; i < anillosZ.length - 1; i++)
      for (let k = 0; k < N - 1; k++) {
        const a = base + i * N + k, b = a + 1, c = a + N, d = b + N;
        idx.push(a, b, c, b, d, c);
      }
  });
  // Tapas donde el cuerpo no acaba en punta.
  for (const [i, atras] of [[0, true], [anillosZ.length - 1, false]] as const) {
    if (abierto && !atras) continue;
    const anillos = [0, 1].map((t) => Array.from({ length: Ns[t] }, (_, k) => bases[t] + i * Ns[t] + k));
    const anillo = anillos.flat();
    const xs = anillo.map((v) => pos[v * 3]);
    if (Math.max(...xs) - Math.min(...xs) < 1e-6) continue;
    const centro = pos.length / 3;
    pos.push(0, anillo.reduce((s, v) => s + pos[v * 3 + 1], 0) / anillo.length, anillosZ[i]);
    for (const a of anillos)
      for (let k = 0; k < a.length - 1; k++) {
        if (atras) idx.push(centro, a[k + 1], a[k]); else idx.push(centro, a[k], a[k + 1]);
      }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Con `suave`, la arista entre la mitad de arriba y la de abajo, sin línea:
  // donde sus extremos caen en el mismo sitio, las dos llevan la misma normal.
  if (alisado > 0) {
    const nor = g.getAttribute("normal");
    const [n0, n1] = Ns, b1 = bases[1];
    for (let i = 0; i < anillosZ.length; i++)
      for (const [a, b] of [[i * n0, b1 + i * n1 + n1 - 1], [i * n0 + n0 - 1, b1 + i * n1]]) {
        if (Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1]) > 1e-6) continue;
        const v = [0, 1, 2].map((k) => nor.getComponent(a, k) + nor.getComponent(b, k));
        const l = Math.hypot(...v) || 1;
        for (const q of [a, b]) nor.setXYZ(q, v[0] / l, v[1] / l, v[2] / l);
      }
  }
  return g;
}

export function geometriaDe(p: Pieza): BufferGeometry[] {
  switch (p.tipo) {
    case "ala": {
      // Media ala (x ≥ 0) y su reflejo. Si no empieza en x = 0 (las puntas de
      // un ala en tres piezas), son dos piezas sueltas, sin unir por el centro.
      // `sola`: solo la mitad dada, sin reflejo. `vertical`: la mitad cuelga
      // hacia abajo (x pasa a −y), en el plano x = 0: aletas y soportes con
      // perfil. `x` la mueve de lado (con `espejo`, también al otro).
      const mitad = p.estaciones.map(([x, a, b, t, sube = 0]): Estacion => [x, a, b, t, sube]);
      const reflejo = mitad.slice().reverse().map(([x, a, b, t, sube]): Estacion => [-x, a, b, t, sube]);
      if (p.vertical || p.sola) {
        return (p.espejo ? [1, -1] : [1]).map((sx) => {
          const g = geometriaAla(0, mitad);
          if (p.vertical) g.rotateZ(-Math.PI / 2);
          g.translate((p.x ?? 0) * sx, p.y, 0);
          return g;
        });
      }
      // Con la raíz dentro del cuerpo, sin tapa en la raíz: la tapa compartía
      // vértices con el último anillo, le torcía la luz y se veía una costura
      // donde el ala sale del cuerpo (el TB2).
      if (mitad[0][0] > 0) return [geometriaAla(p.y, reflejo, p.raizDentro ? [reflejo.length - 1] : []), geometriaAla(p.y, mitad, p.raizDentro ? [0] : [])];
      return [geometriaAla(p.y, [...reflejo, ...mitad.filter(([x]) => x > 0)])];
    }
    case "casco":
      return [geometriaCasco(p.secciones, p.abierto, p.tomas, p.suave)];
    case "tubo": {
      // El torno gira alrededor de y; luego se tumba para que el eje sea z.
      const puntos = p.perfil.map(([z, r]) => new Vector2(r, z)).reverse();
      const g = new LatheGeometry(puntos, 28);
      g.rotateX(Math.PI / 2);
      // Puntos con eje que sube o baja (el morro caído del TB2) o con su
      // propio alto (un cuerpo más ancho que alto en el morro y casi redondo
      // detrás): cada anillo del torno está a la z de su punto del perfil.
      if (p.perfil.some((q) => q[2] || q[3] !== undefined)) {
        const pos = g.getAttribute("position");
        for (let i = 0; i < pos.count; i++) {
          const q = p.perfil.find(([z]) => Math.abs(z - pos.getZ(i)) < 1e-4);
          if (!q) continue;
          const [, r, sube = 0, alto] = q;
          const y = alto !== undefined && r > 0 ? (pos.getY(i) * alto) / r : pos.getY(i);
          pos.setY(i, y + sube);
        }
        g.computeVertexNormals();
      }
      if (p.seccion) g.scale(p.seccion[0], p.seccion[1], 1);
      g.translate(p.centro?.[0] ?? 0, p.centro?.[1] ?? 0, 0);
      return [g];
    }
    case "placa": {
      const lados = p.espejo ? [1, -1] : [1];
      // Simétrica: la planta es media (x ≥ 0) y se completa con su reflejo,
      // en una sola pieza (sin costura en el centro).
      const planta = p.plano === "horizontal" && p.simetrica
        ? [...p.planta, ...p.planta.slice().reverse().filter(([x]) => x > 0).map(([x, z]): [number, number] => [-x, z])]
        : p.planta;
      // Bisel: bordes redondeados; el grosor total no cambia.
      const b = Math.min(p.bisel ?? 0, p.grosor / 2.5);
      const d = p.grosor - 2 * b;
      return lados.map((s) => {
        const forma = new Shape(planta.map(([u, v]) => new Vector2(p.plano === "horizontal" ? u * s : u, v)));
        const g = new ExtrudeGeometry(forma, {
          depth: d, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6,
        });
        if (p.plano === "horizontal") {
          // Planta en [x, z]; el grosor, centrado en y.
          g.rotateX(Math.PI / 2);
          g.translate(0, p.y + d / 2, 0);
        } else {
          // Contorno en [z, y]; el grosor, centrado en x. Inclinada: se
          // tumba hacia fuera girando sobre su línea y = 0.
          g.rotateY(-Math.PI / 2);
          g.translate(d / 2, 0, 0);
          if (p.inclinacion) g.rotateZ((-s * p.inclinacion * Math.PI) / 180);
          g.translate(s * p.x, p.y ?? 0, 0);
        }
        return g;
      });
    }
    case "varilla": {
      return (p.espejo ? [1, -1] : [1]).map((sx) => {
        const a = new Vector3(p.desde[0] * sx, p.desde[1], p.desde[2]);
        const b = new Vector3(p.hasta[0] * sx, p.hasta[1], p.hasta[2]);
        const dir = b.clone().sub(a);
        const g = new CylinderGeometry(p.radio, p.radio, dir.length(), 12);
        g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize()));
        g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        return g;
      });
    }
    case "caja": {
      return (p.espejo ? [1, -1] : [1]).map((sx) => {
        const [ancho, alto, largo] = p.tam;
        let g: BufferGeometry;
        if (p.redondeo) {
          // Esquinas redondeadas vistas desde arriba y un bisel arriba y abajo.
          const r = Math.min(p.redondeo, ancho / 2, largo / 2);
          const w = ancho / 2 - r, l = largo / 2 - r;
          const forma = new Shape();
          forma.moveTo(-w, -largo / 2);
          forma.lineTo(w, -largo / 2);
          forma.absarc(w, -l, r, -Math.PI / 2, 0, false);
          forma.lineTo(ancho / 2, l);
          forma.absarc(w, l, r, 0, Math.PI / 2, false);
          forma.lineTo(-w, largo / 2);
          forma.absarc(-w, l, r, Math.PI / 2, Math.PI, false);
          forma.lineTo(-ancho / 2, -l);
          forma.absarc(-w, -l, r, Math.PI, Math.PI * 1.5, false);
          const b = Math.min(r * 0.5, alto / 4);
          g = new ExtrudeGeometry(forma, { depth: alto - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: 0, bevelSegments: 2, curveSegments: 6 });
          g.rotateX(Math.PI / 2);
          g.translate(0, (alto - 2 * b) / 2, 0);
        } else {
          g = new BoxGeometry(ancho, alto, largo);
        }
        g.translate(p.centro[0] * sx, p.centro[1], p.centro[2]);
        return g;
      });
    }
    case "disco": {
      const lados = p.espejo ? [1, -1] : [1];
      return lados.map((sx) => {
        const g = new CylinderGeometry(p.radio, p.radio, p.grosor, 24);
        const normal = new Vector3(p.normal[0] * sx, p.normal[1], p.normal[2]).normalize();
        g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal));
        g.translate(p.en[0] * sx, p.en[1], p.en[2]);
        return g;
      });
    }
    case "helice": {
      const piezas: BufferGeometry[] = [];
      for (const sx of p.espejo ? [1, -1] : [1]) {
        const en: [number, number, number] = [p.en[0] * sx, p.en[1], p.en[2]];
        const ancho = Math.max(0.045, p.radio * 0.16);
        const hoja: BufferGeometry[] = [];
        for (let i = 0; i < p.palas; i++) {
          let pala: BufferGeometry;
          if (p.ancho) {
            // Planta de la pala, de la raíz (x = 0) a la punta (x = radio).
            const c = p.ancho, R = p.radio, forma = new Shape();
            const borde: [number, number][] = [[0.08, 0.32], [0.3, 0.5], [0.6, 0.45], [0.85, 0.36], [0.96, 0.24], [1, 0]];
            forma.moveTo(R * 0.06, -c * 0.22);
            for (const [t, a] of borde) forma.lineTo(R * t, c * a * (t === 1 ? 0 : 1));
            for (const [t, a] of borde.slice(0, -1).reverse()) forma.lineTo(R * t, -c * a * 0.8);
            forma.lineTo(R * 0.06, -c * 0.22);
            pala = new ExtrudeGeometry(forma, { depth: c * 0.06, bevelEnabled: false });
            pala.translate(0, 0, -c * 0.03);
          } else {
            pala = new BoxGeometry(p.radio, ancho, 0.008);
            pala.translate(p.radio / 2, 0, 0);
          }
          pala.rotateX(0.35);  // paso de la pala
          pala.rotateZ((i / p.palas) * Math.PI * 2 + ((p.giro ?? 0) * Math.PI) / 180);
          hoja.push(pala);
        }
        hoja.push(new SphereGeometry(Math.max(0.035, p.radio * 0.08), 12, 8));
        for (const g of hoja) {
          if (p.eje === "y") g.rotateX(-Math.PI / 2);  // a plano horizontal
          g.translate(...en);
          piezas.push(g);
        }
      }
      return piezas;
    }
  }
}

