# Notas y eventos

El contenido **no se escribe aquí**: se escribe en la bóveda de Obsidian
(`boveda-osint`) y se trae con el importador. Lo que genera sí va en Git,
para que GitHub pueda compilar la web sin la bóveda ni X.

## Publicar una nota

1. En Obsidian, `publicar: true` en el frontmatter de la nota.
2. `npm run importar`.
3. `npm run dev` y mirar cómo queda. Si el servidor ya estaba abierto,
   reiniciarlo (Ctrl+C y otra vez `npm run dev`): la importación regenera
   `src/content/` y limpia la caché `.astro`, y el servidor en marcha se lía.
4. Commit y push a `main`. GitHub Actions compila y publica solo
   (`.github/workflows/deploy.yml`).

Al importar suele colarse algún cambio ajeno (el avatar de un tuit que X ha
cambiado, notas que se tocaron en la bóveda): mirar `git status` y descartar
lo que no toque con `git checkout -- <archivo>`.

## El importador (`scripts/importar-notas.mjs`)

Busca la bóveda en `BOVEDA_PATH` o, si no, en `~/Documents/boveda-osint`
(Mac) o `~/Documentos/boveda-osint` (Linux Mint). Cada vez:

1. Borra y rehace `src/content/notas/`, `src/content/eventos/` y
   `public/adjuntos/`. `public/tweets/` no se borra: hace de caché.
2. Se queda con los `.md` que llevan `publicar: true`.
3. Traduce el frontmatter: `creado` → `date`, `actualizado` → `updated`,
   `tags` igual. La descripción es el primer párrafo de la nota.
4. Convierte lo de Obsidian a Markdown normal:
   - `![[imagen.png]]` → imagen copiada junto a la nota;
   - `![[vídeo.mp4]]` → `<video>` con el archivo en `public/adjuntos/`;
   - `![](youtube…)` → vídeo de YouTube incrustado;
   - `[[Nota]]` y `[[Nota#sección|texto]]` → enlace (o texto, si la nota no se
     publica);
   - una URL de X sola en su línea → tarjeta del tuit ya descargada (texto,
     fotos y vídeo, con copia propia por si X lo borra; `scripts/tweets.mjs`).
     Dentro de una frase se queda como enlace;
   - un embed de TikTok → cita con enlace.

Las fotos se copian **a tamaño original**. Astro las aligera para la web, pero
el original queda en Git y es lo que más engorda el repositorio: reducirlas al
importar es el paso 2 del plan de "Peso del repositorio" (`CLAUDE.md`).

## Eventos

Las notas de `03 - Eventos/<carpeta>/` forman un evento:

- el `.md` que se llama como la carpeta → índice, `/eventos/<slug>`;
- `SEMANA N - …` → `/eventos/<slug>/semana-0N`;
- cualquier otra nota de la carpeta → `/eventos/<slug>/<slug-nota>`.

Una nota suelta en `03 - Eventos/` es un evento de una sola página. Los
`[[SEMANA 2]]` y `[[…#30 de julio]]` se convierten en enlaces y anclas. El
índice puede llevar `periodo` (las fechas reales, escritas a mano).

## Notas que no salen en los listados

Las etiquetadas `luna` o `marte` se publican pero **no salen** en `/notas`,
en "últimas notas" de la portada, en las chapas de bandera de la Tierra ni en
el RSS: viven en su astro, y su botón de volver lleva a `/luna` o `/marte`.
El filtro está en `src/lib/contenido.ts` (`esDelBlog`, `proyectoDe`). Las
fichas de `/luna` y `/marte` solo enlazan a una nota si está publicada.

## Dónde está cada cosa

| Archivo | Qué es |
|---|---|
| `src/content.config.ts` | Esquema de las colecciones `notas` y `eventos` |
| `src/content/` | Lo que escribe el importador (no editar a mano) |
| `src/pages/notas/` | Listado por años y página de cada nota |
| `src/pages/eventos/` | Listado de eventos y página de índice, semana o análisis |
| `src/pages/rss.xml.ts` | El RSS |
| `src/lib/contenido.ts` | Qué es del blog y orden por fecha |
| `src/data/paises.ts` | Países con chapa sobre la Tierra (por etiquetas) |
| `public/tweets/`, `public/adjuntos/` | Imágenes y vídeos de tuits; vídeos de la bóveda |
