// Geometría de las maquetas de drones (src/data/uas/): de cada pieza, sus
// mallas. La usan el visor (visor-uas.ts) y el generador del pixel art
// (arte/generar-uas-pixel.mjs), así las dos versiones salen de lo mismo.
import {
  BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry,
  Float32BufferAttribute, LatheGeometry, Quaternion, Shape, SphereGeometry,
  Vector2, Vector3,
} from "three";
import type { Pieza } from "../data/uas/tipos";

export type Vista = "3d" | "arriba" | "lado" | "frente" | "detras";

// Ángulos de cada vista: [acimut, elevación] en grados. Acimut 0 = de frente
// (desde el morro), 90 = desde el ala derecha.
export const VISTAS: Record<Vista, [number, number]> = {
  "3d": [38, 32],
  arriba: [180, 89.9],  // desde detrás, para que el morro quede arriba
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
  for (const [x, zBA, zBS, t, sube] of estaciones)
    for (const [s, lado] of contorno) pos.push(x, y + sube + lado * t * perfilNaca(s), zBA + (zBS - zBA) * s);
  const idx: number[] = [];
  for (let e = 0; e < estaciones.length - 1; e++)
    for (let k = 0; k < M; k++) {
      const a = e * M + k, b = e * M + ((k + 1) % M), c = a + M, d = b + M;
      idx.push(a, b, c, b, d, c);
    }
  // Tapas de las puntas: abanico desde el centro de cada contorno.
  for (const e of [0, estaciones.length - 1]) {
    const [x, zBA, zBS, , sube] = estaciones[e];
    const centro = pos.length / 3;
    pos.push(x, y + sube, (zBA + zBS) / 2);
    for (let k = 0; k < M; k++) idx.push(centro, e * M + k, e * M + ((k + 1) % M));
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
      const mitad = p.estaciones.map(([x, a, b, t, sube = 0]): Estacion => [x, a, b, t, sube]);
      const reflejo = mitad.slice().reverse().map(([x, a, b, t, sube]): Estacion => [-x, a, b, t, sube]);
      if (mitad[0][0] > 0) return [geometriaAla(p.y, reflejo), geometriaAla(p.y, mitad)];
      return [geometriaAla(p.y, [...reflejo, ...mitad.filter(([x]) => x > 0)])];
    }
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
          const pala = new BoxGeometry(p.radio, ancho, 0.008);
          pala.translate(p.radio / 2, 0, 0);
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

