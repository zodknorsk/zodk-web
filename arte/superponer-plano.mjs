// Superpone una maqueta (src/data/uas/) en ortográfica, en rojo a medias,
// sobre un plano a escala, para compararlas sin la perspectiva del visor.
// Uso: node arte/superponer-plano.mjs <modelo> <lado|arriba|frente> <plano.png>
//        <salida.png> <x del origen> <y del origen> <píxeles por metro> <ancho> <alto>
// El origen es dónde cae en el plano el punto (0, 0) de la maqueta en metros.
import sharp from "sharp";
import { geometriaDe } from "../src/scripts/uas-geometria.ts";
const [, , modelo, vista, fondo, salida, ox, oy, esc, ancho, alto] = process.argv;
const m = (await import(`../src/data/uas/${modelo}.ts`)).default;
const E = m.escala, O = [+ox, +oy], S = +esc;
const proy = { lado: (x, y, z) => [O[0] + z * S, O[1] - y * S], arriba: (x, y, z) => [O[0] + x * S, O[1] - z * S], frente: (x, y, z) => [O[0] - x * S, O[1] - y * S] }[vista];
let polis = "";
for (const p of m.piezas) for (const g of geometriaDe(p)) {
  const pos = g.getAttribute("position"), idx = g.index ? g.index.array : [...Array(pos.count).keys()];
  for (let i = 0; i < idx.length; i += 3) {
    const pts = [0, 1, 2].map((k) => proy(pos.getX(idx[i + k]) * E, pos.getY(idx[i + k]) * E, pos.getZ(idx[i + k]) * E));
    polis += `<polygon points="${pts.map((q) => q.join(",")).join(" ")}"/>`;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}"><g fill="#e0301e" fill-opacity="0.35" stroke="none">${polis}</g></svg>`;
await sharp(fondo).composite([{ input: Buffer.from(svg) }]).toFile(salida);
