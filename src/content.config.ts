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

// --- notas: entradas sueltas del blog. Una nota = una página en /notas/<slug>.
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

// --- eventos: seguimiento de un suceso. Jerárquico:
//   incidentes-.../index.md          -> /eventos/incidentes-...          (kind: index)
//   incidentes-.../semana-01.md      -> /eventos/incidentes-.../semana-01 (kind: semana)
//   incidentes-.../ministros-...md   -> /eventos/incidentes-.../ministros-... (kind: pagina)
// Cada archivo del evento vive en la misma colección; se relacionan por el
// campo "evento" (slug del evento padre) y se ordenan las semanas por "orden".
const eventos = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/eventos" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(),
    kind: z.enum(["index", "semana", "pagina"]).default("pagina"),
    evento: z.string(), // slug del evento al que pertenece
    orden: z.number().default(0), // para ordenar las semanas
    rango: z.string().optional(), // periodo de una semana, p. ej. "30 julio – 5 agosto"
    periodo: z.string().optional(), // solo "index": periodo del evento escrito a mano en la bóveda
  }),
});

export const collections = { notas, eventos };
