import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Una "content collection" es una carpeta de archivos Markdown que Astro valida
// contra un esquema (schema) y te expone de forma tipada con getCollection().
// Desde Astro 6 cada colección dice de dónde salen sus archivos con un
// "loader": glob() lee los .md de una carpeta. Los que empiezan por "_" se
// saltan, como hacía Astro antes. El id de cada entrada es su ruta sin ".md" y
// sin el "/index" final (apolo-11-1969/index.md -> "apolo-11-1969"): es lo que
// va en la URL.
//
// OJO: el frontmatter de aquí NO es el de tu bóveda de Obsidian (titulo,
// creado...). El script scripts/importar-notas.mjs lee las notas de la bóveda,
// traduce esas claves al inglés y escribe el resultado en src/content/. Así la
// web compila sin necesitar la bóveda.

// Las secciones las decide el `tipo` de la nota en la bóveda (docs/contenido.md):
// `analisis`, `operacion` y `seguimiento`. Las notas de la Luna, Marte y el
// blog van por su etiqueta, y las del Hangar de UAS, por su carpeta.

// --- notas: las de los proyectos (Luna, Marte y el blog). Una nota = una
// página en /notas/<slug>, con su «volver» a /luna, /marte o /blog.
const notas = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/notas" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(), // fecha de creación (del "creado" de Obsidian)
    updated: z.coerce.date().optional(), // del "actualizado" de Obsidian
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(), // si es true: ni se genera página ni se lista
  }),
});

// --- analisis: explicaciones y opiniones (`tipo: analisis`). Una nota = una
// página en /analisis/<slug>.
const analisis = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/analisis" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    opinion: z.boolean().optional(), // `opinion` en el tipo: lleva la etiqueta «Opinión»
  }),
});

// --- operaciones: crónicas de algo que ya pasó (`tipo: operacion`). Una nota
// = una página en /operaciones/<slug>, ordenadas por la fecha del suceso.
const operaciones = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/operaciones" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    periodo: z.string().optional(), // las fechas del suceso, escritas a mano en la bóveda
  }),
});

// --- seguimientos: un suceso abierto, semana a semana (`tipo: seguimiento`).
// Jerárquico:
//   incidentes-.../index.md          -> /seguimiento/incidentes-...          (kind: index)
//   incidentes-.../semana-01.md      -> /seguimiento/incidentes-.../semana-01 (kind: semana)
//   incidentes-.../ministros-...md   -> /seguimiento/incidentes-.../ministros-... (kind: pagina)
// Cada archivo del seguimiento vive en la misma colección; se relacionan por
// el campo "evento" (slug del índice) y se ordenan las semanas por "orden".
const seguimientos = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/seguimientos" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    kind: z.enum(["index", "semana", "pagina"]).default("pagina"),
    evento: z.string(), // slug del seguimiento al que pertenece
    orden: z.number().default(0), // para ordenar las semanas
    rango: z.string().optional(), // periodo de una semana, p. ej. "30 julio – 5 agosto"
    periodo: z.string().optional(), // solo "index": periodo del suceso escrito a mano en la bóveda
  }),
});

// --- uas: la enciclopedia de drones. Una nota de la carpeta «Hangar de UAS»
// de la bóveda = una ficha en /uas/<slug>. Si hay maqueta
// (src/data/uas/<slug>.ts), la ficha lleva el visor (docs/uas.md). El
// glosario y el armamento viven en la misma carpeta, pero no son drones
// (`glosario`, `armamento`).
const uas = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/uas" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    // Del «País» de la tabla de características: nombre y bandera (emoji).
    pais: z.string().optional(),
    bandera: z.string().optional(),
    // De la «Categoría» de la tabla, hasta la primera coma o paréntesis.
    categoria: z.string().optional(),
    // El glosario del hangar: página aparte, no sale entre las tarjetas.
    glosario: z.boolean().optional(),
    // El armamento del hangar (las municiones de los drones): igual, página
    // aparte.
    armamento: z.boolean().optional(),
  }),
});

export const collections = { notas, analisis, operaciones, seguimientos, uas };
