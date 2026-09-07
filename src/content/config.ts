import { defineCollection, z } from "astro:content";

// Una "content collection" es una carpeta de archivos Markdown que Astro valida
// contra un esquema (schema) y te expone de forma tipada con getCollection().
//
// Aquí definimos una sola colección, "notas", que vive en src/content/notas/.
// OJO: el frontmatter que se define abajo NO es el de tu bóveda de Obsidian
// (titulo, creado, actualizado...). El script scripts/importar-notas.mjs lee las
// notas de la bóveda, traduce esas claves en español a las claves en inglés de
// aquí, y escribe el resultado en src/content/notas/. Así la web compila sin
// necesitar la bóveda.
const notas = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(), // fecha de creación (del "creado" de Obsidian)
    updated: z.coerce.date().optional(), // del "actualizado" de Obsidian
    tags: z.array(z.string()).default([]),
    draft: z.boolean().optional(), // si es true: se genera la página pero no se lista
  }),
});

export const collections = { notas };
