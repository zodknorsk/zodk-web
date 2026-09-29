// Banderas en pixel art de los países del hangar de UAS (drones y
// municiones), con el mismo formato que las chapas de /luna y /marte (11x7,
// svgBandera). Las usan las maquetas (src/data/uas/), la bandera de los
// filtros, las tarjetas y el visor (BanderaUAS.astro) y las tablas de las
// notas del hangar (src/lib/banderas-tablas.mjs), que las buscan por su
// emoji. Un país nuevo = una entrada aquí.
import { PAISES_LUNA, type Pais } from "./alunizajes.ts";

export const UCRANIA: Pais = {
  codigo: "UA", nombre: "Ucrania", bandera: "🇺🇦",
  filas: ["aaaaaaaaaaa", "aaaaaaaaaaa", "aaaaaaaaaaa", "aaaaaaaaaaa",
          "ooooooooooo", "ooooooooooo", "ooooooooooo"],
  paleta: { a: "#0057b7", o: "#ffd700" },
};

export const TURQUIA: Pais = {
  // Media luna y estrella blancas sobre rojo.
  codigo: "TR", nombre: "Turquía", bandera: "🇹🇷",
  filas: ["rrrrrrrrrrr", "rrrwwrrrrrr", "rrwrrrrwrrr", "rrwrrrwwwrr", "rrwrrrrwrrr", "rrrwwrrrrrr", "rrrrrrrrrrr"],
  paleta: { r: "#e30a17", w: "#f4f4f0" },
};

export const NORUEGA: Pais = {
  // Cruz nórdica azul con borde blanco sobre rojo.
  codigo: "NO", nombre: "Noruega", bandera: "🇳🇴",
  filas: ["rrrwbwrrrrr", "rrrwbwrrrrr", "wwwwbwwwwww", "bbbbbbbbbbb", "wwwwbwwwwww", "rrrwbwrrrrr", "rrrwbwrrrrr"],
  paleta: { r: "#ba0c2f", w: "#f4f4f0", b: "#00205b" },
};

export const EEUU: Pais = PAISES_LUNA.find((p) => p.codigo === "US")!;

export const BANDERAS_UAS: Pais[] = [EEUU, UCRANIA, TURQUIA, NORUEGA];

export const banderaPorEmoji = (emoji: string) => BANDERAS_UAS.find((p) => p.bandera === emoji);
