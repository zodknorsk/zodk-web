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
// las puntas se cierran.
function geometriaAla(y: number, mitad: [number, number, number, number][]): BufferGeometry {
  const N = 14;  // puntos por cara, más juntos cerca del borde de ataque
  const cuerda = Array.from({ length: N + 1 }, (_, i) => (1 - Math.cos((i / N) * Math.PI)) / 2);
  // El contorno va del borde de salida por arriba hasta el de ataque y vuelve
  // por abajo, sin repetir los extremos.
  const contorno: [number, number][] = [
    ...cuerda.slice().reverse().map((s): [number, number] => [s, 1]),
    ...cuerda.slice(1, -1).map((s): [number, number] => [s, -0.55]),
  ];
  const M = contorno.length;
  const estaciones = [
    ...mitad.slice().reverse().map(([x, a, b, t]) => [-x, a, b, t] as const),
    ...mitad.filter(([x]) => x > 0),
  ];
  const pos: number[] = [];
  for (const [x, zBA, zBS, t] of estaciones)
    for (const [s, lado] of contorno) pos.push(x, y + lado * t * perfilNaca(s), zBA + (zBS - zBA) * s);
  const idx: number[] = [];
  for (let e = 0; e < estaciones.length - 1; e++)
    for (let k = 0; k < M; k++) {
      const a = e * M + k, b = e * M + ((k + 1) % M), c = a + M, d = b + M;
      idx.push(a, b, c, b, d, c);
    }
  // Tapas de las puntas: abanico desde el centro de cada contorno.
  for (const e of [0, estaciones.length - 1]) {
    const [x, zBA, zBS] = estaciones[e];
    const centro = pos.length / 3;
    pos.push(x, y, (zBA + zBS) / 2);
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
    case "ala":
      return [geometriaAla(p.y, p.estaciones)];
    case "tubo": {
      // El torno gira alrededor de y; luego se tumba para que el eje sea z.
      const puntos = p.perfil.map(([z, r]) => new Vector2(r, z)).reverse();
      const g = new LatheGeometry(puntos, 28);
      g.rotateX(Math.PI / 2);
      g.translate(p.centro?.[0] ?? 0, p.centro?.[1] ?? 0, 0);
      return [g];
    }
    case "placa": {
      const lados = p.espejo ? [1, -1] : [1];
      return lados.map((s) => {
        const forma = new Shape(p.planta.map(([a, b]) => new Vector2(p.plano === "horizontal" ? a * s : a, b)));
        const g = new ExtrudeGeometry(forma, { depth: p.grosor, bevelEnabled: false });
        if (p.plano === "horizontal") {
          // Planta en [x, z]; el grosor queda hacia abajo desde y.
          g.rotateX(Math.PI / 2);
          g.translate(0, p.y + p.grosor / 2, 0);
        } else {
          // Contorno en [z, y]; el grosor, a lo largo de x.
          g.rotateY(-Math.PI / 2);
          g.translate(s * p.x + p.grosor / 2, 0, 0);
        }
        return g;
      });
    }
    case "varilla": {
      const a = new Vector3(...p.desde);
      const b = new Vector3(...p.hasta);
      const dir = b.clone().sub(a);
      const g = new CylinderGeometry(p.radio, p.radio, dir.length(), 12);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize()));
      g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      return [g];
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
      for (let i = 0; i < p.palas; i++) {
        const pala = new BoxGeometry(p.radio, 0.045, 0.008);
        pala.translate(p.radio / 2, 0, 0);
        pala.rotateX(0.35);  // paso de la pala
        pala.rotateZ((i / p.palas) * Math.PI * 2);
        pala.translate(...p.en);
        piezas.push(pala);
      }
      const buje = new SphereGeometry(0.035, 12, 8);
      buje.translate(...p.en);
      piezas.push(buje);
      return piezas;
    }
  }
}

