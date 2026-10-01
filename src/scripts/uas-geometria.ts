// Geometría de las maquetas de drones (src/data/uas/): de cada pieza, sus
// mallas. La usan el visor (visor-uas.ts) y el generador del pixel art
// (arte/generar-uas-pixel.mjs), así las dos versiones salen de lo mismo.
import {
  BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry,
  Float32BufferAttribute, LatheGeometry, Quaternion, Shape, SphereGeometry,
  Vector2, Vector3,
} from "three";
import type { Pieza, Seccion } from "../data/uas/tipos";

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
function geometriaAla(y: number, estaciones: Estacion[]): BufferGeometry {
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
function geometriaCasco(secciones: Seccion[]): BufferGeometry {
  const ss = secciones.slice().sort((a, b) => a.z - b.z);
  // Con lomo, más puntos arriba: el hombro entre el cuerpo y el lomo es una
  // curva cerrada.
  const conLomo = ss.some((q) => q.lomo !== undefined);
  const PASOS = 12, MEDIO = conLomo ? 44 : 28;  // anillos entre secciones; puntos por mitad
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
  const anillosZ: number[] = [];
  for (let i = 0; i < zs.length - 1; i++)
    for (let j = 0; j < PASOS; j++) anillosZ.push(zs[i] + ((zs[i + 1] - zs[i]) * j) / PASOS);
  anillosZ.push(zs[zs.length - 1]);

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
      const media = (yLado: number, yCentro: number, n: number, ws: number): [number, number][] => {
        const pts: [number, number][] = [];
        for (let k = 0; k < KF; k++) {
          const t = k / KF;
          pts.push([(1 - t) ** 2 * w + 2 * (1 - t) * t * ws + t * t * ws, (1 - t) ** 2 * c + 2 * (1 - t) * t * c + t * t * yLado]);
        }
        for (let k = 0; k <= KS; k++) {
          const t = (k / KS) * (Math.PI / 2), co = Math.cos(t), si = Math.sin(t);
          pts.push([ws * co ** (2 / n), yLado + (yCentro - yLado) * si ** (2 / n)]);
        }
        return pts;
      };
      const yS = Math.min(top, Math.max(c, sobreArista(z))), yB = Math.max(bot, Math.min(c, bajoArista(z)));
      const arribaD = media(yS, top, na, wsA), abajoD = media(yB, bot, nb, ws0);
      const arribaPts = [...arribaD, ...arribaD.slice(0, -1).reverse().map(([x, y]): [number, number] => [-x, y])];
      const abajoPts2 = [...abajoD.map(([x, y]): [number, number] => [-x, y]), ...abajoD.slice(0, -1).reverse()];
      // Lomo, como arriba.
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
        tiras[0].push(x, y, z);
      }
      for (const [x, y] of abajoPts2) tiras[1].push(x, y, z);
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
  const N = MEDIO + 1;
  for (const tira of tiras) {
    const base = pos.length / 3;
    pos.push(...tira);
    for (let i = 0; i < anillosZ.length - 1; i++)
      for (let k = 0; k < MEDIO; k++) {
        const a = base + i * N + k, b = a + 1, c = a + N, d = b + N;
        idx.push(a, b, c, b, d, c);
      }
  }
  // Tapas donde el cuerpo no acaba en punta.
  for (const [i, atras] of [[0, true], [anillosZ.length - 1, false]] as const) {
    const anillo = [0, 1].flatMap((t) => Array.from({ length: N }, (_, k) => t * anillosZ.length * N + i * N + k));
    const xs = anillo.map((v) => pos[v * 3]);
    if (Math.max(...xs) - Math.min(...xs) < 1e-6) continue;
    const centro = pos.length / 3;
    pos.push(0, anillo.reduce((s, v) => s + pos[v * 3 + 1], 0) / anillo.length, anillosZ[i]);
    for (let t = 0; t < 2; t++)
      for (let k = 0; k < MEDIO; k++) {
        const a = anillo[t * N + k], b = anillo[t * N + k + 1];
        if (atras) idx.push(centro, b, a); else idx.push(centro, a, b);
      }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
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
      if (mitad[0][0] > 0) return [geometriaAla(p.y, reflejo), geometriaAla(p.y, mitad)];
      return [geometriaAla(p.y, [...reflejo, ...mitad.filter(([x]) => x > 0)])];
    }
    case "casco":
      return [geometriaCasco(p.secciones)];
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

