// El armamento del Hangar de UAS: secciones (`## Misiles`, `## Bombas
// guiadas`) y municiones (`### …`) de su Markdown, con el «Tipo» de la tabla
// de cada una, para el índice de la página (GlosarioIndice).
import GithubSlugger from "github-slugger";
import type { SeccionIndice } from "@lib/glosario";

const FUERA = new Set(["Índice", "Fuentes"]);

export function leerArmamento(cuerpo: string): SeccionIndice[] {
  // El ancla de cada munición es la del encabezado que genera Astro.
  const slugger = new GithubSlugger();
  const secciones: SeccionIndice[] = [];
  let dentro = false;
  for (const linea of cuerpo.split("\n")) {
    const h2 = linea.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      slugger.slug(h2[1]);
      dentro = !FUERA.has(h2[1]);
      if (dentro) secciones.push({ titulo: h2[1], terminos: [] });
      continue;
    }
    const h3 = linea.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      const ancla = slugger.slug(h3[1]);
      if (dentro) secciones[secciones.length - 1].terminos.push({ t: h3[1], ancla });
      continue;
    }
    const tipo = linea.match(/^\|\s*\*\*Tipo\*\*\s*\|\s*(.+?)\s*\|/);
    const ultima = secciones[secciones.length - 1]?.terminos.at(-1);
    if (tipo && dentro && ultima && !ultima.nota) ultima.nota = tipo[1];
  }
  return secciones.filter((s) => s.terminos.length);
}
