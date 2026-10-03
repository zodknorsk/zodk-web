import type { CollectionEntry } from "astro:content";

// Las notas de los proyectos Luna y Marte (etiquetas "luna" y "marte") viven
// en /luna y /marte, y las de la etiqueta "blog" (sobre la propia web) en
// /blog: son la colección "notas" y su "volver" lleva a su página.
export function proyectoDe(tags: string[]): "luna" | "marte" | "blog" | null {
  const t = tags.map((x) => x.toLowerCase());
  if (t.includes("luna")) return "luna";
  if (t.includes("marte")) return "marte";
  if (t.includes("blog")) return "blog";
  return null;
}

// "13 sept 2026": las fechas de las filas de la portada y de /blog, cortas.
export function fechaCorta(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).replace(".", "");
}

// Las cuentas de las cabeceras de la portada y de /blog, con dos cifras ("05").
export function dos(n: number): string {
  return String(n).padStart(2, "0");
}

// Más reciente primero.
export function porFecha(a: { data: { date: Date } }, b: { data: { date: Date } }): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

type Articulo = CollectionEntry<"notas"> | CollectionEntry<"analisis"> | CollectionEntry<"operaciones"> | CollectionEntry<"seguimientos">;

// Fotos de las tres secciones y de las notas, para las miniaturas de la
// portada y de /blog.
const FOTOS = import.meta.glob<ImageMetadata>(
  [
    "/src/content/notas/*/*.{jpg,jpeg,png,webp}",
    "/src/content/analisis/*/*.{jpg,jpeg,png,webp}",
    "/src/content/operaciones/*/*.{jpg,jpeg,png,webp}",
    "/src/content/seguimientos/**/*.{jpg,jpeg,png,webp}",
  ],
  { eager: true, import: "default" },
);

// La primera foto local del texto (![](./foto.jpg)); las de otras webs no valen.
export function primeraFoto(entrada: Articulo): ImageMetadata | undefined {
  const m = entrada.body?.match(/!\[[^\]]*\]\(\.\/([^)\s]+)\)/);
  if (!m || !entrada.filePath) return undefined;
  const carpeta = entrada.filePath.replace(/[^/]+$/, "");
  return FOTOS[`/${carpeta}${decodeURIComponent(m[1])}`];
}

// Un seguimiento sigue abierto si su periodo lo dice ("… · en desarrollo").
export function enCurso(periodo?: string): boolean {
  return /en (desarrollo|curso)/i.test(periodo ?? "");
}

// La fecha del suceso a partir del `periodo` escrito a mano («4 de marzo de
// 2002», «Del 3 al 5 de abril de 2026»): el primer día, el primer mes y el
// primer año que salgan. Sin periodo o sin año, la de respaldo.
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export function fechaDePeriodo(periodo: string | undefined, respaldo: Date): Date {
  const texto = (periodo ?? "").toLowerCase();
  const ano = texto.match(/\b(1[5-9]\d\d|20\d\d)\b/);
  if (!ano) return respaldo;
  const mes = MESES.findIndex((m) => texto.includes(m));
  const dia = texto.match(/\b(\d{1,2})\b/);
  return new Date(Number(ano[1]), Math.max(mes, 0), dia ? Number(dia[1]) : 1);
}

