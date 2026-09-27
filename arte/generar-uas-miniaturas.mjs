// Miniaturas en pixel art de las maquetas de drones (src/data/uas/*.ts), para
// la tira «Hangar de UAS» de la portada y las tarjetas de /uas. Salen de la
// misma geometría y las mismas paletas que el modo Pixel del visor
// (uas-geometria.ts, uas-paletas.ts), pintadas aquí sin navegador: z-buffer,
// luz fija respecto a la cámara, cuatro tonos por acabado y contorno de 1 px.
// Imágenes fijas: en la portada no hace falta WebGL.
//
// Escribe en public/uas/<modelo>/:
//   miniatura.png, miniatura-noche.png  la vista 3D del visor, ajustada a
//                                        96x56 (día y noche)
//   giro-frente.png, giro-frente-noche.png
//                                        tira de 6 fotogramas: de la vista 3D
//                                        a ponerse de frente (tarjetas de /uas)
//   planta.png                          desde arriba, con el morro hacia
//                                        arriba, a escala real entre drones
//                                        (PX_POR_METRO, con la «escala» de
//                                        cada maqueta) y con sombra, como en
//                                        una foto de satélite
// Uso (desde la raíz del repo):  node arte/generar-uas-miniaturas.mjs [modelo…]
// Sin modelos, todas.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { Box3, Mesh, OrthographicCamera, Spherical, Vector3 } from "three";
import { geometriaDe, VISTAS } from "../src/scripts/uas-geometria.ts";
import { PALETAS } from "../src/scripts/uas-paletas.ts";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATOS = path.join(REPO, "src/data/uas");
const W = 96, H = 56;        // miniatura 3D, en píxeles de arte
const PX_POR_METRO = 26;     // planta: la misma escala para todos los drones
const SOMBRA = [3, 3];       // planta: desplazamiento de la sombra, en píxeles
const LUZ = new Vector3(-0.45, 0.8, 0.4).normalize();  // la del modo Pixel

const modelos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(DATOS).filter((f) => f.endsWith(".ts") && f !== "tipos.ts").map((f) => f.replace(/\.ts$/, ""));

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tono = (luz) => (luz > 0.78 ? 3 : luz > 0.5 ? 2 : luz > 0.25 ? 1 : 0);
const VECINOS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Cámara ortográfica mirando al centro del dron desde [acimut, elevación].
function camaraDesde([az, el], centro) {
  const c = new OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  c.position.setFromSpherical(new Spherical(20, ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180)).add(centro);
  c.lookAt(centro);
  c.updateMatrixWorld();
  return c.matrixWorldInverse;
}

// Lo que ocupa el dron visto desde ahí (los vértices, no la caja que lo envuelve).
function ocupacion(mallas, vista) {
  const ocupa = new Box3(), v = new Vector3();
  for (const { g } of mallas) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) ocupa.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(vista));
  }
  return ocupa;
}

// Rasteriza a una rejilla ancho x alto: por píxel, [acabado, tono] o null.
function rasterizar(mallas, vista, ancho, alto, escala, cx, cy) {
  const prof = new Float32Array(ancho * alto).fill(-Infinity);
  const color = new Array(ancho * alto).fill(null);
  const a = new Vector3(), n = new Vector3(), m = new Vector3();
  for (const { acabado, g } of mallas) {
    const pos = g.attributes.position, nor = g.attributes.normal;
    const pv = [], nv = [];
    for (let i = 0; i < pos.count; i++) {
      a.fromBufferAttribute(pos, i).applyMatrix4(vista);
      pv.push([ancho / 2 + (a.x - cx) * escala, alto / 2 - (a.y - cy) * escala, a.z]);
      n.fromBufferAttribute(nor, i).transformDirection(vista);
      nv.push([n.x, n.y, n.z]);
    }
    for (let t = 0; t < pos.count; t += 3) {
      const [p0, p1, p2] = [pv[t], pv[t + 1], pv[t + 2]];
      const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]);
      if (Math.abs(area) < 1e-9) continue;
      const x0 = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
      const x1 = Math.min(ancho - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
      const y0 = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
      const y1 = Math.min(alto - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((p1[0] - px) * (p2[1] - py) - (p2[0] - px) * (p1[1] - py)) / area;
          const w1 = ((p2[0] - px) * (p0[1] - py) - (p0[0] - px) * (p2[1] - py)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
          const k = y * ancho + x;
          if (z <= prof[k]) continue;
          prof[k] = z;
          const [n0, n1, n2] = [nv[t], nv[t + 1], nv[t + 2]];
          m.set(w0 * n0[0] + w1 * n1[0] + w2 * n2[0], w0 * n0[1] + w1 * n1[1] + w2 * n2[1], w0 * n0[2] + w1 * n1[2] + w2 * n2[2]).normalize();
          if (m.z < 0) m.negate();  // caras vistas por detrás
          color[k] = [acabado, tono(0.18 + 0.82 * Math.max(0, m.dot(LUZ)))];
        }
    }
  }
  return color;
}

// Colorea: el dron con su paleta, contorno de 1 px por fuera y, si se pide,
// sombra desplazada debajo.
function pintar(color, ancho, alto, paleta, sombra) {
  const img = new Uint8Array(ancho * alto * 4);
  const hay = (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto && color[y * ancho + x];
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < ancho; x++) {
      const k = y * ancho + x;
      if (color[k]) img.set([...hex(paleta[color[k][0]][color[k][1]]), 255], k * 4);
      else if (VECINOS.some(([dx, dy]) => hay(x + dx, y + dy))) img.set([...hex(paleta.contorno), 255], k * 4);
      else if (sombra && hay(x - sombra[0], y - sombra[1])) img.set([0, 0, 0, 110], k * 4);
    }
  return img;
}

const guardar = (img, ancho, alto, salida) =>
  sharp(Buffer.from(img), { raw: { width: ancho, height: alto, channels: 4 } }).png({ compressionLevel: 9 }).toFile(salida);

for (const modelo of modelos) {
  const { default: maqueta } = await import(path.join(DATOS, `${modelo}.ts`));
  const mallas = [];
  for (const p of maqueta.piezas)
    for (const g of geometriaDe(p)) mallas.push({ acabado: p.acabado ?? "negro", g: g.index ? g.toNonIndexed() : g });
  const caja = new Box3();
  for (const { g } of mallas) caja.expandByObject(new Mesh(g));
  const centro = caja.getCenter(new Vector3());
  const dir = path.join(REPO, "public/uas", modelo);
  fs.mkdirSync(dir, { recursive: true });

  // Miniatura 3D: la vista 3D del visor, ajustada a 96x56.
  {
    const vista = camaraDesde(VISTAS["3d"], centro);
    const o = ocupacion(mallas, vista);
    const escala = Math.min((W - 4) / (o.max.x - o.min.x), (H - 4) / (o.max.y - o.min.y));
    const color = rasterizar(mallas, vista, W, H, escala, (o.max.x + o.min.x) / 2, (o.max.y + o.min.y) / 2);
    await guardar(pintar(color, W, H, PALETAS.dia), W, H, path.join(dir, "miniatura.png"));
    await guardar(pintar(color, W, H, PALETAS.noche), W, H, path.join(dir, "miniatura-noche.png"));
  }

  // Giro para las tarjetas (de la vista 3D a ponerse de frente): la misma
  // escala en todos los fotogramas (la que hace caber al más grande) y
  // centrados en el centro del dron, para que no bailen.
  const giros = {
    frente: [[38, 32], [30, 27], [22, 22], [14, 17], [7, 12], [0, 8]],
  };
  for (const [nombre, vistas] of Object.entries(giros)) {
    const matrices = vistas.map((v) => camaraDesde(v, centro));
    const escala = Math.min(...matrices.map((m) => {
      const o = ocupacion(mallas, m);
      return Math.min((W - 4) / (2 * Math.max(-o.min.x, o.max.x)), (H - 4) / (2 * Math.max(-o.min.y, o.max.y)));
    }));
    const colores = matrices.map((m) => rasterizar(mallas, m, W, H, escala, 0, 0));
    for (const momento of ["dia", "noche"]) {
      const tira = new Uint8Array(W * vistas.length * H * 4);
      colores.forEach((color, f) => {
        const img = pintar(color, W, H, PALETAS[momento]);
        for (let y = 0; y < H; y++) tira.set(img.subarray(y * W * 4, (y + 1) * W * 4), (y * W * vistas.length + f * W) * 4);
      });
      await guardar(tira, W * vistas.length, H, path.join(dir, `giro-${nombre}${momento === "dia" ? "" : "-noche"}.png`));
    }
  }

  // Planta a escala real, con sombra.
  {
    const vista = camaraDesde(VISTAS.arriba, centro);
    const o = ocupacion(mallas, vista);
    const escala = PX_POR_METRO * maqueta.escala;
    const ancho = Math.ceil((o.max.x - o.min.x) * escala) + 4 + SOMBRA[0];
    const alto = Math.ceil((o.max.y - o.min.y) * escala) + 4 + SOMBRA[1];
    // Centrado dejando sitio a la sombra (abajo a la derecha).
    const cx = (o.max.x + o.min.x) / 2 + SOMBRA[0] / 2 / escala;
    const cy = (o.max.y + o.min.y) / 2 - SOMBRA[1] / 2 / escala;
    const color = rasterizar(mallas, vista, ancho, alto, escala, cx, cy);
    await guardar(pintar(color, ancho, alto, PALETAS.dia, SOMBRA), ancho, alto, path.join(dir, "planta.png"));
    console.log(`${modelo}: miniatura ${W}x${H} (día y noche) y planta ${ancho}x${alto}`);
  }
}

