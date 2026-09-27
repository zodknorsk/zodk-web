import type { CollectionEntry } from "astro:content";

// Las notas de los proyectos Luna y Marte (etiquetas "luna" y "marte") viven
// en /luna y /marte, y las de la etiqueta "blog" (sobre la propia web) en
// /blog: se publican, pero no salen en /notas, en la portada ni en el RSS, y
// su "volver" lleva a su página.
export function proyectoDe(tags: string[]): "luna" | "marte" | "blog" | null {
  const t = tags.map((x) => x.toLowerCase());
  if (t.includes("luna")) return "luna";
  if (t.includes("marte")) return "marte";
  if (t.includes("blog")) return "blog";
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

// Fotos de las notas y los eventos, para las miniaturas de la portada. Solo
// las carpetas del blog: las de la Luna y Marte no salen ahí.
const FOTOS = import.meta.glob<ImageMetadata>(
  ["/src/content/notas/*/*.{jpg,jpeg,png,webp}", "/src/content/eventos/**/*.{jpg,jpeg,png,webp}"],
  { eager: true, import: "default" },
);

// La primera foto local del texto (![](./foto.jpg)); las de otras webs no valen.
export function primeraFoto(entrada: CollectionEntry<"notas"> | CollectionEntry<"eventos">): ImageMetadata | undefined {
  const m = entrada.body?.match(/!\[[^\]]*\]\(\.\/([^)\s]+)\)/);
  if (!m || !entrada.filePath) return undefined;
  const carpeta = entrada.filePath.replace(/[^/]+$/, "");
  return FOTOS[`/${carpeta}${decodeURIComponent(m[1])}`];
}

// Un evento sigue abierto si su periodo lo dice ("… · en desarrollo").
export function enCurso(periodo?: string): boolean {
  return /en (desarrollo|curso)/i.test(periodo ?? "");
}
