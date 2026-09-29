# Análisis, operaciones y seguimiento

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

## Las secciones: manda el `tipo`

Desde el 29-sep-2026 la web tiene tres secciones, y **el `tipo` de la nota
en la bóveda decide a cuál va**, no la carpeta ni las etiquetas (decisión
del usuario: las etiquetas son para filtrar en Obsidian y para las chapas
de la Tierra, «no mueven hilos de un lado a otro»):

| `tipo` | Sección | Qué es |
|---|---|---|
| `seguimiento` | `/seguimiento` | Un suceso abierto, semana a semana (Ceuta) |
| `operacion` | `/operaciones` | Crónica de algo que ya pasó (John Chapman, el F-15E) |
| `analisis` | `/analisis` | El resto: explicaciones y opiniones. Con `opinion` también en el `tipo`, lleva la etiqueta «Opinión» |

En la bóveda se ordenan igual: `03 - Operaciones y Seguimiento/` (con
`Operaciones/` y `Seguimientos/` dentro) y `06 - Analisis/`, pero la carpeta
es solo orden; una nota de `02 - Temas` con `tipo: operacion` sale en
Operaciones. Una nota con `publicar: true` y ninguno de esos tipos **no se
publica** y el importador avisa.

Fuera de esta regla, como siempre: las notas con etiqueta `luna`, `marte` o
`blog` (colección `notas`, `/notas/<slug>`) y las del Hangar de UAS (por su
carpeta, `/uas`).

Las direcciones de antes (`/eventos/…`, `/notas` y `/notas/<análisis>`)
redirigen a las nuevas (`Redireccion.astro`, con `<meta refresh>` porque la
web es estática) y no salen en el sitemap.

## Cabeceras de /analisis, /operaciones y /seguimiento

Arriba de cada listado, una tira como las del glosario y el armamento de
`/uas` (`src/components/TiraCabecera.astro`): cuadro con la cuadrícula a la
izquierda, título, descripción y cuántas hay, contado solo. En
`/seguimiento`, un piloto rojo que late con «EN CURSO» si alguno lo está
(si no, gris y «ARCHIVO»); en `/analisis`, el número como un expediente
(«N.º 03»). El usuario las eligió entre tres opciones cada una (una línea
de tiempo y un mes de calendario; «¶» y una hoja de cuaderno). En
`/operaciones`, los años que abarcan («2002 | 2026»); esta no se eligió
entre opciones.

`/operaciones` va por la fecha del suceso, la más reciente arriba: sale del
`periodo` («4 de marzo de 2002», «Del 3 al 5 de abril de 2026»;
`fechaDePeriodo` en `src/lib/contenido.ts`), así que cada operación debe
llevarlo.

## Términos y municiones con tarjeta

En cualquier artículo, la primera vez que sale un término del glosario
de UAS (MALE, jamming…) o una munición del armamento (Hellfire, GBU-38…)
se enlaza solo y enseña su tarjeta al pasar el ratón. **Solo si está escrito
igual que en el glosario o el armamento**: al escribir notas en la bóveda,
usar ese nombre exacto. Detalles en `docs/uas.md` («El glosario»).

## El importador (`scripts/importar-notas.mjs`)

Busca la bóveda en `BOVEDA_PATH` o, si no, en `~/Documents/boveda-osint`
(Mac) o `~/Documentos/boveda-osint` (Linux Mint). Cada vez:

1. Borra y rehace `src/content/` (`notas`, `analisis`, `operaciones`,
   `seguimientos` y `uas`) y `public/adjuntos/`. `public/tweets/` no se borra: hace de caché.
2. Se queda con los `.md` que llevan `publicar: true`. No mira en `.obsidian`,
   `00 - Meta` (salvo `00 - Meta/Notas`, donde van las notas del blog),
   `07 - Clippings` ni `Adjuntos`.
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

## Seguimientos

Un seguimiento de varias páginas es una carpeta con una nota índice que se
llama como ella y lleva `tipo: seguimiento`
(`03 - Operaciones y Seguimiento/Seguimientos/<carpeta>/`). Todo lo de
dentro va con él, sea cual sea su tipo:

- el índice → `/seguimiento/<slug>`;
- `SEMANA N - …` → `/seguimiento/<slug>/semana-0N`;
- cualquier otra nota de la carpeta → `/seguimiento/<slug>/<slug-nota>`.

Una nota suelta con `tipo: seguimiento` es un seguimiento de una sola
página. Los `[[SEMANA 2]]` y `[[…#30 de julio]]` se convierten en enlaces y
anclas. El índice puede llevar `periodo` (las fechas reales, escritas a
mano). Si dice "en desarrollo" (o "en curso"), lleva en la portada el sello
rojo de **EN CURSO** (`enCurso` en `src/lib/contenido.ts`).

## La portada, debajo del planeta

Los bloques de la Luna y Marte (con cuántos alunizajes, amartizajes y notas
hay; con el ratón encima, el astro gira despacio con su motor, cargado al
pasar el ratón la primera vez: `montarGiroBloques` en `portada.ts`), la tira del blog con las insignias de "hecho con" (`STACK` en
`src/consts.ts`, con el color de cada marca para el hover) y, en dos
columnas: a la izquierda, el último seguimiento y debajo las dos últimas
operaciones; a la derecha, los cinco últimos análisis. La foto de cada fila
es la primera foto local del texto (`primeraFoto`); un seguimiento sin foto
en el índice coge la de su semana más reciente que tenga.

## Notas que no salen en los listados

Las etiquetadas `luna` o `marte` se publican pero **no salen** en
`/analisis`, en la portada, en las chapas de bandera de la Tierra ni en
el RSS: viven en su astro, y su botón de volver lleva a `/luna` o `/marte`.
Son la colección `notas` (el importador las separa por la etiqueta;
`proyectoDe` en `src/lib/contenido.ts`). Las
fichas de `/luna` y `/marte` solo enlazan a una nota si está publicada.

Lo mismo con la etiqueta `blog` (notas sobre la propia web, en
`00 - Meta/Notas`): salen en `/blog` como tarjetas grandes con su primera
foto, la más nueva arriba, y su volver lleva a `/blog`.

## Dónde está cada cosa

| Archivo | Qué es |
|---|---|
| `src/content.config.ts` | Esquema de las colecciones (`notas`, `analisis`, `operaciones`, `seguimientos`, `uas`) |
| `src/content/` | Lo que escribe el importador (no editar a mano) |
| `src/pages/analisis/` | Listado por años y página de cada análisis |
| `src/pages/operaciones/` | Listado por fecha del suceso y página de cada operación |
| `src/pages/seguimiento/` | Listado y página de índice, semana o pieza suelta |
| `src/pages/notas/` | Las notas de la Luna, Marte y el blog; y redirecciones |
| `src/pages/eventos/` | Solo redirecciones a las direcciones nuevas |
| `src/components/ArticuloPagina.astro` | La página de un análisis, una operación o una nota |
| `src/pages/rss.xml.ts` | El RSS (los análisis) |
| `src/lib/contenido.ts` | Proyecto de una nota, fotos, orden por fecha y `fechaDePeriodo` |
| `src/data/paises.ts` | Países con chapa sobre la Tierra (por etiquetas) |
| `public/tweets/`, `public/adjuntos/` | Imágenes y vídeos de tuits; vídeos de la bóveda |
