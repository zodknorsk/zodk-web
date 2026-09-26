import type { CollectionEntry } from "astro:content";

// Las notas de los proyectos Luna y Marte (etiquetas "luna" y "marte") viven
// en /luna y /marte: se publican, pero no salen en /notas, en la portada ni en
// el RSS, y su "volver" lleva a su astro.
export function proyectoDe(tags: string[]): "luna" | "marte" | null {
  const t = tags.map((x) => x.toLowerCase());
  if (t.includes("luna")) return "luna";
  if (t.includes("marte")) return "marte";
  return null;
}

// Lo que se lista en el blog: ni borradores ni lo de los proyectos.
export function esDelBlog(entrada: CollectionEntry<"notas"> | CollectionEntry<"eventos">): boolean {
  return !entrada.data.draft && proyectoDe(entrada.data.tags) === null;
}

// Más reciente primero.
export function porFecha(a: { data: { date: Date } }, b: { data: { date: Date } }): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
