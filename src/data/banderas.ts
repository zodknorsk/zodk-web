// Las banderas en pixel art de toda la web. Los dibujos están en
// banderas.json (lo lee también arte/generar-tierra.py para las chapas del
// planeta); aquí, cómo se piden y cómo se pintan. Un país nuevo = una entrada
// en banderas.json, y sale igual en la Tierra, /luna, /marte y el hangar.
import datos from "./banderas.json" with { type: "json" };

export interface Pais {
  codigo: string;
  nombre: string;
  bandera: string; // emoji, para las columnas, las fichas y las tablas de notas
  filas: string[]; // 7 filas de 11 letras de `paleta`
  paleta: Record<string, string>;
}

type Dibujo = Omit<Pais, "codigo"> & { nota?: string };

const BANDERAS: Pais[] = Object.entries(datos as unknown as Record<string, Dibujo | string>)
  .filter((e): e is [string, Dibujo] => typeof e[1] === "object")
  .map(([codigo, { nombre, bandera, filas, paleta }]) => ({ codigo, nombre, bandera, filas, paleta }));

/** La bandera de un país por su código (el ISO de dos letras; «EU» para Europa). */
export function bandera(codigo: string): Pais {
  const p = BANDERAS.find((b) => b.codigo === codigo);
  if (!p) throw new Error(`No hay bandera «${codigo}» en src/data/banderas.json`);
  return p;
}

/** La bandera cuyo emoji es este (las tablas de las notas del hangar). */
export const banderaPorEmoji = (emoji: string) => BANDERAS.find((p) => p.bandera === emoji);

/** La chapa de un país como SVG (11x7 + contorno de 1 px), igual que en la Tierra. */
export function svgBandera(pais: Pais): string {
  const fw = 11, fh = 7;
  let r = `<rect x="0" y="0" width="${fw + 2}" height="${fh + 2}" fill="#10131c"/>`;
  for (let y = 0; y < fh; y++)
    for (let x = 0; x < fw; x++)
      r += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="${pais.paleta[pais.filas[y][x]]}"/>`;
  return `<svg viewBox="0 0 ${fw + 2} ${fh + 2}" aria-hidden="true">${r}</svg>`;
}
