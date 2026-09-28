// El glosario del Hangar de UAS: secciones (`## …`) y términos (puntos de
// lista de primer nivel que empiezan en negrita) de su Markdown, y el ancla
// de cada término, que la página pone en su <li> al cargar.

export interface SeccionGlosario {
  titulo: string;
  terminos: string[];
}

export function anclaTermino(termino: string): string {
  const base = termino
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `t-${base}`;
}

export function leerGlosario(cuerpo: string): SeccionGlosario[] {
  const secciones: SeccionGlosario[] = [];
  for (const linea of cuerpo.split("\n")) {
    const h = linea.match(/^##\s+(.+?)\s*$/);
    if (h) {
      secciones.push({ titulo: h[1], terminos: [] });
      continue;
    }
    const t = linea.match(/^- \*\*(.+?)\*\*/);
    if (t && secciones.length) secciones[secciones.length - 1].terminos.push(t[1].replace(/[*_]/g, "").trim());
  }
  return secciones.filter((s) => s.terminos.length);
}
