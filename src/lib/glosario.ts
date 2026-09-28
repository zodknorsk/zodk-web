// El glosario del Hangar de UAS: secciones (`## …`) y términos (puntos de
// lista de primer nivel que empiezan en negrita) de su Markdown, y el ancla
// de cada término, que la página pone en su <li> al cargar. El índice
// (GlosarioIndice) sirve también para el armamento (@lib/armamento).

export interface SeccionIndice {
  titulo: string;
  // `ancla`: si falta, la de un término del glosario. `nota`: texto pequeño
  // detrás del nombre (en el armamento, el tipo de munición).
  terminos: { t: string; ancla?: string; nota?: string }[];
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

export function leerGlosario(cuerpo: string): SeccionIndice[] {
  const secciones: SeccionIndice[] = [];
  for (const linea of cuerpo.split("\n")) {
    const h = linea.match(/^##\s+(.+?)\s*$/);
    if (h) {
      secciones.push({ titulo: h[1], terminos: [] });
      continue;
    }
    const t = linea.match(/^- \*\*(.+?)\*\*/);
    if (t && secciones.length) secciones[secciones.length - 1].terminos.push({ t: t[1].replace(/[*_]/g, "").trim() });
  }
  return secciones.filter((s) => s.terminos.length);
}
