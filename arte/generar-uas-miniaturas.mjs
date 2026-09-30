// Miniaturas en pixel art de las maquetas de drones (src/data/uas/*.ts), para
// la tira «Hangar de UAS» de la portada y las tarjetas de /uas. Salen de la
// misma geometría y las mismas paletas que el modo Pixel del visor
// (uas-geometria.ts, uas-paletas.ts), pintadas aquí sin navegador: z-buffer,
// luz fija respecto a la cámara, cuatro tonos por acabado y contorno de 1 px.
// Imágenes fijas: en la portada no hace falta WebGL.
//
// Escribe en public/uas/<modelo>/:
//   giro-planta.png, giro-planta-noche.png
//                                        tira de 8 fotogramas: de la vista 3D
//                                        a verse de planta, con el morro
//                                        arriba (tarjetas de /uas)
//   planta.png                          desde arriba, con el morro hacia
//                                        arriba, a escala real entre drones
//                                        (PX_POR_METRO, con la «escala» de
//                                        cada maqueta) y con sombra, como en
//                                        una foto de satélite; si pasa de
//                                        PLANTA_MAX, se reduce hasta caber
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
const W = 128, H = 72;       // giro de las tarjetas, en píxeles de arte
const PX_POR_METRO = 26;     // planta: la misma escala para todos los drones
const SOMBRA = [3, 3];       // planta: desplazamiento de la sombra, en píxeles
// Planta: tamaño máximo en píxeles de arte (ancho, alto). Los drones más
// grandes (el Wildfire, de ~20 m) se reducen y dejan de ir a escala real.
const PLANTA_MAX = [72, 70];
const LUZ = new Vector3(-0.45, 0.8, 0.4).normalize();  // la del modo Pixel

const modelos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(DATOS).filter((f) => f.endsWith(".ts") && f !== "tipos.ts").map((f) => f.replace(/\.ts$/, ""));

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tono = (luz) => (luz > 0.78 ? 3 : luz > 0.5 ? 2 : luz > 0.25 ? 1 : 0);
// Tramado 2x2 (Bayer), como en el modo Pixel: solo donde la luz cambia deprisa.
const BAYER = [[-0.375, 0.375], [0.125, -0.125]];
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

// Rasteriza a una rejilla ancho x alto: por píxel, [acabado, tono, pieza,
// profundidad] o null. Las juntas del fuselaje van con pieza -1 (sin línea).
// La planta de la portada va sin tramado ni líneas interiores (como antes).
function rasterizar(mallas, vista, ancho, alto, escala, cx, cy, tramado = true) {
  const prof = new Float32Array(ancho * alto).fill(-Infinity);
  const luces = new Float32Array(ancho * alto);
  const color = new Array(ancho * alto).fill(null);
  const a = new Vector3(), n = new Vector3(), m = new Vector3();
  for (const { acabado, pieza, g } of mallas) {
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
          luces[k] = 0.18 + 0.82 * Math.max(0, m.dot(LUZ));
          color[k] = [acabado, 0, pieza, z];
        }
    }
  }
  // Tonos, con tramado donde la luz cambia deprisa (superficies curvas).
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < ancho; x++) {
      const k = y * ancho + x;
      if (!color[k]) continue;
      const l = luces[k];
      const dx = x + 1 < ancho && color[k + 1] ? Math.abs(luces[k + 1] - l) : 0;
      const dy = y + 1 < alto && color[k + ancho] ? Math.abs(luces[k + ancho] - l) : 0;
      const curva = tramado ? Math.min(1, (dx + dy) * 60) : 0;
      color[k][1] = tono(l + BAYER[y % 2][x % 2] * 0.09 * curva);
    }
  return color;
}

// Colorea: el dron con su paleta, contorno de 1 px por fuera y, como en el
// modo Pixel, línea donde la profundidad salta y en la junta entre dos piezas
// (en lo que queda detrás). Si se pide, sombra desplazada debajo.
function pintar(color, ancho, alto, paleta, contorno, umbral, sombra, juntas = true) {
  const img = new Uint8Array(ancho * alto * 4);
  const hay = (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto && color[y * ancho + x];
  const tinta = hex(contorno);
  const mezclar = (c, t) => c.map((v, i) => Math.round(v + (tinta[i] - v) * t));
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < ancho; x++) {
      const k = y * ancho + x;
      const c = color[k];
      if (c) {
        let mezcla = 0;
        for (const [dx, dy] of VECINOS) {
          const v = hay(x + dx, y + dy);
          if (!v) continue;
          if (v[3] - c[3] > umbral) { mezcla = 0.6; break; }
          if (juntas && c[2] >= 0 && v[2] >= 0 && v[2] !== c[2] && v[3] > c[3]) mezcla = 0.45;
        }
        img.set([...mezclar(hex(paleta[c[0]][c[1]]), mezcla), 255], k * 4);
      }
      else if (VECINOS.some(([dx, dy]) => hay(x + dx, y + dy))) img.set([...tinta, 255], k * 4);
      else if (sombra && hay(x - sombra[0], y - sombra[1])) img.set([0, 0, 0, 110], k * 4);
    }
  return img;
}

const guardar = (img, ancho, alto, salida) =>
  sharp(Buffer.from(img), { raw: { width: ancho, height: alto, channels: 4 } }).png({ compressionLevel: 9 }).toFile(salida);

for (const modelo of modelos) {
  const { default: maqueta } = await import(path.join(DATOS, `${modelo}.ts`));
  const mallas = [];
  for (const [i, p] of maqueta.piezas.entries())
    for (const g of geometriaDe(p))
      mallas.push({ acabado: p.acabado ?? "negro", pieza: p.acabado === "junta" ? -1 : i, g: g.index ? g.toNonIndexed() : g });
  // Contorno: los drones claros, siempre oscuro (como en el visor).
  const contorno = (momento) => PALETAS[momento][maqueta.resalte === "tinta" ? "contornoClaro" : "contorno"];
  // Salto de profundidad que marca línea: el mismo que el visor (0,07 unidades).
  const UMBRAL = 0.07;
  const caja = new Box3();
  for (const { g } of mallas) caja.expandByObject(new Mesh(g));
  const centro = caja.getCenter(new Vector3());
  const dir = path.join(REPO, "public/uas", modelo);
  fs.mkdirSync(dir, { recursive: true });

  // Giro para las tarjetas (de la vista 3D a verse de planta, con el morro
  // arriba, como la vista «Planta» del visor), centrado en el centro del
  // dron para que no baile. Se probó ponerse de frente, pero los
  // winglets y las hélices, vistos de canto, desaparecían.
  const PASOS = 8;
  const giros = {
    planta: Array.from({ length: PASOS }, (_, i) => {
      const t = i / (PASOS - 1), s = t * t * (3 - 2 * t);  // suave al empezar y al acabar
      return [38 + (180 - 38) * s, 32 + (89.9 - 32) * s];
    }),
  };
  for (const [nombre, vistas] of Object.entries(giros)) {
    const matrices = vistas.map((v) => camaraDesde(v, centro));
    // La escala va de la que llena el primer fotograma a la que llena el
    // último (sin pasarse en los de en medio): así el 3D y la planta
    // aprovechan el recuadro y el cambio de tamaño se ve como un zoom suave.
    const cabe = matrices.map((m) => {
      const o = ocupacion(mallas, m);
      return Math.min((W - 4) / (2 * Math.max(-o.min.x, o.max.x)), (H - 4) / (2 * Math.max(-o.min.y, o.max.y)));
    });
    const escalas = cabe.map((c, f) => Math.min(c, cabe[0] + ((cabe.at(-1) - cabe[0]) * f) / (cabe.length - 1)));
    const colores = matrices.map((m, f) => rasterizar(mallas, m, W, H, escalas[f], 0, 0));
    for (const momento of ["dia", "noche"]) {
      const tira = new Uint8Array(W * vistas.length * H * 4);
      colores.forEach((color, f) => {
        // En la tarjeta cada píxel abarca más dron que en el visor: una
        // superficie grande vista de lado (el ala del Shahed) ya salta más de
        // 0,07 de un píxel al siguiente y salía entera como línea. El salto
        // tiene que ser, como poco, el de tres píxeles.
        const img = pintar(color, W, H, PALETAS[momento], contorno(momento), Math.max(UMBRAL, 3 / escalas[f]));
        for (let y = 0; y < H; y++) tira.set(img.subarray(y * W * 4, (y + 1) * W * 4), (y * W * vistas.length + f * W) * 4);
      });
      await guardar(tira, W * vistas.length, H, path.join(dir, `giro-${nombre}${momento === "dia" ? "" : "-noche"}.png`));
    }
  }

  // Planta a escala real, con sombra.
  {
    const vista = camaraDesde(VISTAS.arriba, centro);
    const o = ocupacion(mallas, vista);
    const real = PX_POR_METRO * maqueta.escala;
    const escala = Math.min(real,
      (PLANTA_MAX[0] - 4 - SOMBRA[0]) / (o.max.x - o.min.x),
      (PLANTA_MAX[1] - 4 - SOMBRA[1]) / (o.max.y - o.min.y));
    const ancho = Math.ceil((o.max.x - o.min.x) * escala) + 4 + SOMBRA[0];
    const alto = Math.ceil((o.max.y - o.min.y) * escala) + 4 + SOMBRA[1];
    // Centrado dejando sitio a la sombra (abajo a la derecha).
    const cx = (o.max.x + o.min.x) / 2 + SOMBRA[0] / 2 / escala;
    const cy = (o.max.y + o.min.y) / 2 - SOMBRA[1] / 2 / escala;
    const color = rasterizar(mallas, vista, ancho, alto, escala, cx, cy, false);
    await guardar(pintar(color, ancho, alto, PALETAS.dia, PALETAS.dia.contorno, Infinity, SOMBRA, false), ancho, alto, path.join(dir, "planta.png"));
    console.log(`${modelo}: giro de ${W}x${H} (día y noche) y planta de ${ancho}x${alto}`);
  }
}

