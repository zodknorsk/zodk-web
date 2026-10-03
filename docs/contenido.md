# Análisis, operaciones y seguimiento

El contenido **no se escribe aquí**: se escribe en la bóveda de Obsidian
(`boveda-osint`) y se trae con el importador. Lo que genera sí va en Git,
para que GitHub pueda compilar la web sin la bóveda ni X.

## Publicar una nota

1. En Obsidian, `publicar: true` en el frontmatter de la nota.
2. `npm run importar`, en `main` (en otra rama se niega y dice cómo volver).
3. Con `npm run dev` abierto, la página se actualiza sola: no hace falta
   reiniciar el servidor.
4. Commit y push a `main`. GitHub Actions compila y publica solo
   (`.github/workflows/deploy.yml`).

Al terminar, el importador dice qué notas son **nuevas**, cuáles han
**cambiado** y cuáles se **retiran** (las que ya no llevan `publicar: true`),
y cuántos tuits nuevos ha guardado. Es lo que va a salir en `git status`: una
nota que no se ha tocado en la bóveda no cambia.

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

1. Se queda con los `.md` que llevan `publicar: true`. No mira en `.obsidian`,
   `00 - Meta` (salvo `00 - Meta/Notas`, donde hay notas sobre la web sin
   publicar), `07 - Clippings` ni `Adjuntos`.
2. Traduce el frontmatter: `creado` → `date`, `actualizado` → `updated`,
   `tags` igual. La descripción es el primer párrafo de la nota.
3. Convierte lo de Obsidian a Markdown normal:
   - `![[imagen.png]]` → imagen copiada junto a la nota;
   - `![[vídeo.mp4]]` → `<video>` con el archivo en `public/adjuntos/`;
   - `![](youtube…)` → vídeo de YouTube incrustado;
   - `[[Nota]]` y `[[Nota#sección|texto]]` → enlace (o texto, si la nota no se
     publica);
   - una URL de X sola en su línea → tarjeta del tuit (ver «Tuits», abajo).
     Dentro de una frase se queda como enlace;
   - un embed de TikTok → cita con enlace.
4. Escribe en `src/content/` (`notas`, `analisis`, `operaciones`,
   `seguimientos` y `uas`) **solo lo que ha cambiado**, y borra de ahí y de
   `public/adjuntos/` lo que ya no se publica. Por eso `npm run dev` puede
   seguir abierto (antes lo rehacía todo y había que reiniciarlo).
5. Resume qué notas son nuevas, cuáles han cambiado y cuáles se retiran.

Las fotos se reducen al copiarlas a 2400 px de **ancho** como mucho (el alto
no se limita, para que un esquema largo no quede con la letra ilegible). Los
PNG grandes pasan a JPG, o a WebP si tienen transparencia. En Obsidian siguen
a tamaño completo. Una foto ya copiada solo se rehace si el original de la
bóveda es más nuevo.

**Imágenes de día y de noche.** Si una nota lleva `![[algo-claro.png]]` y en
la bóveda hay también `algo-oscuro.png` (o `.jpg`, `.webp`), el importador
pone las dos seguidas y el CSS (`base.css`) enseña la clara con el tema de día
y la oscura con el de noche. En Obsidian se ve solo la clara. Una `-claro` sin
pareja se ve siempre. La primera fue el esquema de «Cómo funciona el
importador» (29-sep-2026).

Los vídeos de la bóveda llevan en el nombre un código sacado de su ruta
**dentro** de la bóveda, así que salen igual importando desde el Mac o desde
el PC.

## Tuits

En vez del JavaScript de X, cada tuit va como una tarjeta fija con texto,
autor, avatar, fotos y fecha (`scripts/tweets.mjs`). La web no depende de X.

**El archivo de tuits** (`src/data/tuits/<id>.json`, desde el 29-sep-2026):
cada tuit se pide a X **una sola vez**, la primera vez que sale en una nota,
y se guarda tal como estaba ese día. Las importaciones siguientes lo sacan
del archivo sin preguntar a X. Así:

- un tuit que X borre (o una cuenta suspendida) sigue saliendo entero en la
  web, para la posteridad;
- el avatar se queda congelado: si el autor cambia de foto, no cambia nada.
  Antes cada importación traía avatares nuevos y dejaba los viejos sueltos;
- importar tarda menos de un segundo si no hay tuits nuevos (antes, ~17 s
  preguntando por los ~500).

Cada archivo lleva `capturado` (el día en que se guardó) y `tuit` (solo los
datos que usa la tarjeta, ~1 KB). Tres tuits de Ceuta que X ya había borrado
llevan `tarjeta` en su lugar: la tarjeta hecha, recuperada del historial de
Git, porque el archivo no existía cuando se guardaron. Se perdieron el
29-sep-2026 al pasar de «eventos» a «seguimiento» y se recuperaron el mismo
día. Todo el archivo ocupa ~0,7 MB.

Un tuit que X ya no da y que no se llegó a guardar sale como enlace «no
disponible»; el importador lo avisa al final.

`npm run importar -- --refrescar-tuits` vuelve a pedirlos todos a X y pone
al día los que responda (con su avatar actual). Los que X ya no dé se quedan
como estaban. Solo hace falta si se cambia `videos_locales` o el diseño de la
tarjeta necesita datos nuevos.

**Avatares** (decisión del usuario, 29-sep-2026): se quedan, porque dejan ver
de un vistazo de quién es el tuit (un periódico, por ejemplo).

**Imágenes y vídeos** en `public/tweets/`: se bajan una vez y no se vuelven a
pedir. Los vídeos se comprimen con ffmpeg y la tarjeta lleva primero la
fuente en vivo de X y después la copia propia. Con `videos_locales: false`
(el seguimiento de Ceuta, en su índice) no se guarda copia: si X borra el
tuit, queda la tarjeta con la miniatura pero el vídeo ya no se reproduce. Al
importar se borra de `public/tweets/` lo que no pertenece a ningún tuit del
archivo; las imágenes de un tuit que se quite de todas las notas se quedan.

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
`src/consts.ts`, con el color de cada marca para el hover), el último
seguimiento a todo el ancho y, debajo, en dos columnas, las dos últimas
operaciones y los dos últimos análisis (`SITE.NUM_NOTAS_ON_HOMEPAGE`). La foto de cada fila
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
`02 - Temas/blog/` de la bóveda, con sus imágenes en `blog/Adjuntos/`): salen
en `/blog` como tarjetas grandes con su primera foto, la más nueva arriba, y
su volver lleva a `/blog`. Manda la etiqueta, no la carpeta.

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
| `src/data/tuits/` | El archivo de tuits (uno por archivo, lo escribe el importador) |
| `public/tweets/`, `public/adjuntos/` | Imágenes y vídeos de tuits; vídeos de la bóveda |
