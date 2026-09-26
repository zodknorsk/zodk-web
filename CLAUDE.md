# zodk-web — notas para Claude Code

Blog personal de Hegoi en Astro, publicado en **zodk.eu** (GitHub Pages).
Se trabaja desde un Mac (`~/Documents/zodk-web`) y un PC con Linux Mint en
español (`~/Documentos/zodk-web`); se sincroniza solo por Git: `git pull` al
empezar, `git push` al terminar.

## Cómo trabajar con el usuario

- Todo en español, explicado en llano.
- **Git a mano y por pasos.** `commit` y `push` son órdenes separadas: no
  hacer push si no lo pide ("commit push" = las dos). Le gusta ver
  `git status` / `git diff` antes de commitear. **Solo el push a `main`
  publica la web.** Ramas, merges, rebases: explicarlos antes (qué hacen,
  por qué, cómo se vuelve atrás) con los comandos exactos.
- En el código de la web confía en el criterio de Claude para el CÓMO (no
  quiere menús de disyuntivas técnicas), pero **no ampliar el alcance**: no
  "mejorar" de paso cosas que no ha pedido. Si algo existente parece necesitar
  cambio, avisar y preguntar.
- **Los assets que entrega se usan tal cual** (PNG, SVG de Excalidraw…): nada
  de limpiar, recortar, escalar ni quitar fondos si no lo pide.
- El pixel art de la portada es lo más importante. Quiere **renders o
  capturas reales** antes de decidir, e iterar en pasos cortos.
- Vocabulario: "subrayar" un texto = resaltado tipo marcador (fondo detrás,
  texto oscuro), no una línea.
- Comentarios del código: cortos, qué hace y por qué, sin fechas ni citas.

## Dónde está cada cosa

`README.md` tiene el mapa del repositorio y los comandos. La documentación
está en `docs/`; **antes de tocar un astro, leer su documento**: ahí está lo
que se probó y el usuario RECHAZÓ, que no se reintenta salvo que lo pida.

| Documento | Para |
|---|---|
| `docs/tierra.md` | La portada (la Tierra) |
| `docs/luna.md` | `/luna` |
| `docs/marte.md` | `/marte` |
| `docs/astros.md` | Motores, gestos, vuelos, nombres y versiones de datos comunes |
| `docs/contenido.md` | Importador de Obsidian, notas, eventos, tuits |
| `docs/rendimiento.md` | Consumo en Zen: cómo medir |
| `docs/logo.md` | Logo e iconos |
| `arte/README.md` | Los generadores de pixel art |

## Estado

- **Los tres astros, publicados.** La Tierra entera en la portada y el
  repaso de todo el repositorio (carpetas `arte/` y `docs/`, CSS partido por
  zonas, código muerto fuera, comentarios y documentación al día) se hicieron
  en la rama `earth-project`, fusionada en `main`; la rama se deja en GitHub
  como registro. Lo nuevo va sobre `main` o en rama nueva.
- **En el Mac y en el PC, tras el pull de la reorganización**: las fuentes de
  datos que no están en Git se quedan en la carpeta vieja. Moverlas:
  `mv logo-files/{luna-fuentes,marte-fuentes,tierra-fuentes,ne_land.json,cities15000.txt,etopo.tiff} arte/`
  (las que haya). Lo que quede en `logo-files/` son cachés y renders de
  prueba viejos: mirarlo y borrar la carpeta.
- Pendiente del móvil real: que en táctil no salga la coordenada MGRS y que
  la noche no caliente (si calienta: 30 fps en táctil o sin los pueblos más
  pequeños).

## Reglas técnicas

- **Datos de los astros**: al regenerar, subir su número en
  `src/scripts/versiones.js` y el `?v=` de su foto quieta en el CSS
  (`portada.css`, `luna.css`, `marte.css`). El servidor de desarrollo no manda
  cabeceras de caché: recargar forzando (Cmd+Mayús+R).
- **Animaciones**: nunca SVG animado con miles de formas (calienta la CPU en
  Zen, su navegador); canvas, WebGL o PNG.
- **Rendimiento**: medir en vatios y sin grabar la pantalla antes de
  optimizar nada (`docs/rendimiento.md`); razonando sobre el papel se falló
  cinco veces seguidas.
- **Capturas sin ventana**: Chrome con `localhost:4321` (no `127.0.0.1`). Al
  lanzar muchos a la vez, alguno sale sin WebGL.
- **Importar** (`npm run importar`) regenera `src/content/` entero y suele
  traer cambios ajenos (el avatar de un tuit, notas tocadas en la bóveda):
  mirarlos y descartar lo que no toque.
- **ESLint y los `<script>` de los `.astro`**: el extractor no entiende una
  llamada con genérico partida en varias líneas
  (`querySelectorAll<HTMLElement>(\n … \n)`) ni `new Set<string>()`. Dejar el
  genérico en una línea y escribir `const x: Set<string> = new Set()`.
- **Lightning CSS se estrella sin mensaje** (`Segmentation fault` tras
  "Building static entrypoints") con el ancho de `.hero-lectura` en
  `portada.css`: `calc(… + 18 * (1ch + 0.14em))`. Por eso
  `vite.build.cssMinify: "esbuild"` en `astro.config.mjs`. En los `<style>` de
  los `.astro` Astro sigue usando Lightning CSS: si esa forma de `calc` va ahí,
  deshacer el paréntesis (`18ch + 18 * 0.14em`).
- `compressHTML: true` en `astro.config.mjs`: sin él, Astro 7 borra los saltos
  de línea entre etiquetas y pega palabras.
- Tailwind 3 va como plugin de PostCSS (`astro.config.mjs`). Pasar a Tailwind
  4 cambia nombres de clases: no hacerlo sin que lo pida.
- `typescript` va en `dependencies` a propósito (decisión del usuario): `npm
  run build` ejecuta `astro check`. No moverlo.
- `public/favicon.ico` y `public/apple-touch-icon.png` se quedan aunque nada
  los enlace: los navegadores y iOS los piden por su nombre.

## Peso del repositorio: plan acordado, sin empezar

La web publicada no sufre (los visitantes no bajan el historial); lo que
engorda es el repositorio, y borrar no adelgaza el historial. Medido: ~500 MB
de archivos (teselas de la Luna 179 MB, fotos de notas y eventos 170 MB,
tuits 67 MB, Marte 39 MB, la Tierra 4 MB) y más de 600 MB de historial. Lo
que más crece son **las fotos de los artículos**: el importador las copia a
tamaño original (capturas PNG de 26 MB).

Decidido: **seguir con Astro y GitHub Pages**. Descartados: WordPress/Ghost
(se pierde el pixel art y el flujo de Obsidian), servidor propio, Git LFS
(cuota gratis pequeña y cada despliegue la vuelve a bajar), cambiar de
framework o de hosting (no arregla el historial). Por orden, cuando toque:

1. ~~Terminar el Proyecto Tierra~~: hecho y publicado.
2. **Que `scripts/importar-notas.mjs` reduzca las fotos** antes de copiarlas
   (máx. ~2400 px de ancho, JPG/WebP de buena calidad). En Obsidian siguen a
   tamaño completo.
3. **Antes del zoom grande de la Tierra** (pixel art detallado de países),
   sacar las teselas (y los vídeos) de Git a Cloudflare R2 con un subdominio
   tipo `media.zodk.eu`, o pintar el pixel art al vuelo en la GPU. Cuentas:
   cada nivel de zoom ×4 teselas; la Tierra a 1 px = 1 km son ~100-150 MB, a
   250 m ~2 GB (no cabe en GitHub Pages).
4. Opcional: limpiar el historial viejo (reescribe la historia de Git y
   obliga a volver a clonar en el Mac y en el PC). Explicárselo con los
   comandos exactos antes de hacer nada.
