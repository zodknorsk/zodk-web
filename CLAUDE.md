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
- Pixel art del hero = lo más importante de la portada. Quiere **renders o
  capturas reales** antes de decidir, e iterar en pasos cortos.
- Vocabulario: "subrayar" un texto = resaltado tipo marcador (fondo detrás,
  texto oscuro), no una línea.

## El planeta de la portada

**Antes de tocarlo, leer `logo-files/HERO-WIP.md`** (punto 7 y "Modo noche"):
cómo funciona, qué se probó y descartó, y por qué.

Estado (13-sep-2026): publicado en `main` (merge de la rama
`daylight-planet-v2`, que se deja en GitHub como registro). Planeta de día en
`<canvas>` con giro continuo (`src/scripts/planeta.js`, 90 s por vuelta), datos
en `public/planeta/` generados por `logo-files/generar-planeta-hero.py`.

- Regenerar: `cd logo-files && python3 generar-planeta-hero.py`; después subir
  `PLANETA_V` en `planeta.js` y el `?v=` de `planeta-quieto.png` en
  `src/styles/global.css` (van por 10). Un fotograma suelto para comparar:
  `python3 generar-planeta-hero.py --frame N salida.png` (lon. central = −6·N°).
- Ver la web: `npm run dev`; en el móvil (misma wifi): `npm run dev:network`.

Decisiones que hay que respetar:
- Vista de horizonte inclinada, hemisferio norte; solo costas (sin fronteras),
  con la línea de costa oscura; giro calmado.
- **Modo noche** (hecho y publicado el 13-sep-2026, ver `HERO-WIP.md`, "Modo
  noche v2"): el mismo canvas a la luz de la luna, luces de ciudades
  (GeoNames), aurora boreal, naves con luces verde/roja, título que se pone en
  verde de visión nocturna al fijar coordenada, sol y luna (fase real) arriba
  a la izquierda y transición al cambiar de tema (el astro se pone tras la
  Tierra y el planeta se funde).
- Luz del terminador y del limbo en escalones lisos de 1/3 (`LIGHT_SUB`).
- Rechazado, no reintentar salvo que lo pida: punteado Bayer, bordes de luz
  ondulados por ruido, franja de atardecer, brillo especular en el mar, nubes
  de ruido fBm, fundido entre fotogramas, transiciones a racimos de 1 px;
  en el título: rótulo pixel art, título en el cielo, cartela de expediente,
  sombra gruesa, negrita.
- Nubes: las 8 plantillas pixel art de siempre, a escala 1,0-1,3; más grandes
  no quedan bien. "Más adelante le meteremos más mano."
- Biomas por latitud + cajas `DESIERTOS` / `SABANAS`: si una zona sale con el
  bioma equivocado, se corrige con una caja.
- Animaciones: nunca SVG animado con miles de formas (calienta la CPU en Zen,
  su navegador); canvas o sprite PNG.

## Proyecto Luna (`/luna`) — publicado

Segunda "portada": la Luna en pixel art, con la historia de los alunizajes.
**Fusionado en `main` y publicado el 20-sep-2026** (la rama `moon-project` se
deja en GitHub como registro). **Antes de tocarlo, leer
`logo-files/LUNA-WIP.md`**: ahí está el detalle de todo y, sobre todo, lo que
se probó y RECHAZÓ.

Qué hay hoy en `/luna`:
- **La Luna gira y se acerca como Marte** (desde el 23-sep-2026, en la rama
  `mars-project`): clic y arrastrar (un dedo en el móvil), rueda, trackpad o
  pellizco hasta ×6, con teselas `n1`-`n4` y nombres de accidentes que salen
  al acercarse. La luz va con la vista: más oscura y fría según domina la
  cara oculta. El mando de abajo en el centro lleva a cada cara con un giro
  de 2,8 s. Motor `src/scripts/luna-gl.js` (el WebGL de Marte,
  `marte-gl.js`); datos en `public/luna/` de `logo-files/generar-luna.py
  --canvas` y `--teselas`; nombres de `generar-nombres.py --luna`. Las dos
  caras aprobadas (`luna-visible.png`, `luna-oculta.png`) quedan para el
  aterrizaje del vuelo, sin WebGL2 y mientras carga. Al regenerar: subir
  `LUNA_V` en `luna.js` y el `?v=` de `luna-visible.png` en `global.css` (van
  por 4). Ojo al probar: el servidor de pruebas no manda cabeceras de caché
  y el navegador puede seguir con datos viejos (Cmd+Mayús+R).
- **28 alunizajes** con chapa de bandera, ficha con foto y enlace "Leer la
  nota"; salen los de la zona que se ve, y al adentrarse en la cara oculta se
  enciende China y aparecen los relés. Columna de países a la izquierda (EE. UU. con casillas Surveyor /
  Apolo / privadas). Datos en `src/data/alunizajes.ts`: añadir una misión =
  una línea ahí y su foto en `public/alunizajes/`.
- **Relés Queqiao y Queqiao-2** en la cara oculta, con ficha y ondas
  nave → relé → Tierra, y la **Orion de Artemis II** orbitando las dos caras
  (32 fotogramas, ficha y sombra de la Luna).
- **Menú HUD arriba a la derecha** (`alunizajes / relés / orion`) con enlaces
  a sus notas del blog. `/luna` no lleva cabecera normal (`cabecera={false}`
  en `PageLayout`): este menú hace de cabecera.
- **Se llega** pulsando la luna del hero (solo de noche) o el enlace
  **`moon-project`** de la cabecera. Desde la portada ese enlace hace el mismo
  vuelo; si está en modo día, primero cambia a noche y después vuela. Desde el
  resto de páginas es una navegación normal.
- **La selección aguanta**: los países/subgrupos encendidos y la cara que se
  está viendo se guardan en `sessionStorage`, así que entrar en una nota y
  volver con "Volver a la Luna" lo deja todo igual. Al pulsar "volver a la
  Tierra" se borra, para que una llegada nueva empiece limpia.

**Las notas etiquetadas `luna` viven solo en la Luna**: no salen en `/notas`,
ni en "últimas notas" de la portada, ni en el RSS, y su botón de volver lleva
a `/luna` en vez de a `/notas` (filtros en `src/pages/notas/index.astro`,
`src/pages/index.astro`, `src/pages/rss.xml.ts` y `notas/[...slug].astro`).
Sus páginas sí se generan: los enlaces desde `/luna` funcionan.

Pendiente (sin orden, lo decide él):
- **Probar `/luna` en Zen y en el móvil**: solo se ha visto en Chrome. En
  táctil no hay fichas (chapas y columna se ocultan con `@media (hover: none)`).
- Las 28 notas de misión siguen en `estado: borrador` en la bóveda (foto y un
  par de párrafos); se publicaron así a propósito.
- Con la ventana estrecha, la Orion pasa por detrás de la columna de países.
- Fotos poco vistosas (vistas del LRO desde órbita) en las soviéticas, SLIM,
  IM-1 e IM-2: si aparecen mejores, se cambian.
- El mapa del giro de la Luna pesa 1,5 MB.
- Polo sur: **descartado**, Chandrayaan-3, IM-1 e IM-2 se quedan pegadas al
  borde de abajo.

## Proyecto Marte (`/marte`) — en la rama `mars-project`, sin publicar

Tercera "portada": Marte en pixel art con los amartizajes. **Se trabaja en la
rama `mars-project`**; el usuario decide cuándo fusionar en `main` (explicarle
antes el merge: el push a `main` publica). **Antes de tocarlo, leer
`logo-files/MARTE-WIP.md`**: arriba dice en qué punto está, y se actualiza en
cada paso (lo pidió el usuario).

Qué hay hoy en `/marte`:
- **Marte quieto** (no gira solo: decisión del usuario) que se **gira con
  clic y arrastrar** (un dedo en el móvil) y se **acerca con la rueda, el
  trackpad o pellizcando** hasta ×6, ganando detalle. Motor WebGL
  `src/scripts/marte-gl.js` y la mano en `src/scripts/marte.js`; datos en
  `public/marte/` de `logo-files/generar-marte.py` (las teselas `n1`-`n3`,
  38 MB, van en Git desde que el pixel art es definitivo, 23-sep-2026). Al
  regenerar: subir `MARTE_V` en `marte.js` y el `?v=` de `marte-quieto.png`
  en `global.css`.
- **Nombres de lugares** que salen al acercarse (a ×1, ninguno): visor de
  esquinas para montes y cráteres, rótulo de región para llanuras y zonas.
  Lista elegida a mano en `logo-files/generar-nombres.py` →
  `public/marte/marte-nombres.json`; la capa, `src/scripts/marte-nombres.js`.
- **17 chapas de amartizajes** (bandera en pixel art; las fallidas en blanco
  y negro) con ficha: foto, Lugar / Fecha / Estado y una frase. Datos en
  `src/data/amartizajes.ts`, fotos en `public/amartizajes/` (las mismas que
  en las notas de la bóveda, `02 - Temas/mars-project`). La chapa enlaza a su
  nota solo si está publicada.
- **Se llega** con un vuelo desde el Marte pequeño de la portada (o
  `mars-project` en la cabecera) y desde el de `/luna`; **se va** pulsando la
  Tierra pequeña (vuelo hacia delante) o "volver a la Luna" si se vino de
  allí. Vuelos: `src/scripts/viaje-luna.js`.

Pendiente: ver "Pendiente" en `MARTE-WIP.md`. Ojo antes de publicar notas de
Marte: las de la Luna tienen filtros para no salir en `/notas`, la portada ni
el RSS (ver arriba); las de Marte (etiqueta `marte`) aún no.

## Pendiente del planeta de la Tierra

- Comprobar en un móvil real que en táctil no sale la coordenada MGRS.
- Probar la noche en su móvil real (consumo: si se calienta, 30 fps en táctil
  o sin los pueblos más pequeños).
- Hemisferio sur (cómo llegar a sus países en el hero): aparcado para más
  adelante, de día y de noche.
- Ficha de bandera que se sale por abajo si la chapa está muy baja.
- Ideas aparcadas: chapas que se "planten" al pasar por el centro, 120 s por
  vuelta, borde de atmósfera (propuesto, no pedido), E-2 de perfil.

## Mantenimiento

### La portada calentaba en Zen: resuelto (20-sep-2026) — ver `temperatura-zen.md`

Una regresión de rendimiento que entró con el trabajo de la Luna (commit
`625bffb`) dejaba la portada haciendo 17,6 megapíxeles de relleno por fotograma
a 60 fps. Arreglado en tres pasos —30 fps, volcado en una pasada (`copy`) y
lienzo visible a ×3 del arte— y medido por el usuario: de 19,6 W a **9,7-13,5 W**,
el reposo de su portátil. La nitidez del pixel art no se resiente (lo comparó él
de noche a ×5 y a ×3).

**`/luna` también**, la misma noche: el pico del giro de cara (la CPU subía de
50-54 °C a 60-64) se va saltando las dos pasadas de limpieza mientras gira
—invisible en 2,8 s, y la cara final es un PNG ya limpio—, con un tope de 60 fps
(a 30 "se nota muchísimo": rechazado) y el mismo arreglo del lienzo. Y el vuelo
Tierra ↔ Luna ya no hace pico: el planeta seguía girando y repintándose durante
los 6 segundos del vuelo, y ahora se para al empezar.

**Hay medidores puestos**: en la portada, `?medir` (fps y ms partidos en dibujo
y volcado) y `?lienzo=N`; en `/luna`, `?orion=...` para atribuir vatios a la
nave que orbita. Antes de optimizar nada, mirar ahí: razonando sobre el papel se
falló cinco veces seguidas en este tema. Todo el detalle, los números, lo que se
probó sin éxito y las trampas al medir (vatios, nunca ventiladores, y sin grabar
la pantalla) están en `temperatura-zen.md`. Cabo suelto conocido: **la Orion de
`/luna` se lleva la mitad de los vatios de la página** solo por moverse, y las
cinco hipótesis probadas se descartaron; el usuario lo aparcó porque en reposo
el portátil está en silencio y a 49 °C.

### Repaso del repositorio (20-sep-2026, commit `9ceb03b`)

Revisión completa a petición del usuario: buscar cosas raras, borrar lo que ya
no se usa, corregir código y dejar la documentación como está la web hoy.

- **ESLint estaba roto y ahora pasa limpio.** Los `<script>` de los `.astro`
  llevan TypeScript, pero `eslint-plugin-astro` los extrae como ficheros
  virtuales `.js` que el override de `*.astro` no alcanza: se parseaban como JS
  a secas (4 errores, `'string' is not defined` y `Parsing error`). Se añadió
  el override de `**/*.astro/*.js` con el parser de TypeScript.
  **Límite conocido del extractor**, anotado también en `.eslintrc.cjs`: una
  llamada con genérico cuyos argumentos ocupan varias líneas
  (`querySelectorAll<HTMLElement>(\n … \n)`) rompe el parser. Dejar el genérico
  y sus argumentos en una línea.
- **Documentación al día**: este archivo, `README.md` (con el aviso de que las
  notas etiquetadas `luna` no salen en los listados), `logo-files/HERO-WIP.md`
  (describía el sprite PNG como el sistema actual, cuando es un canvas desde
  sept 2026), `logo-files/LUNA-WIP.md` (decía "sin fusionar con main") y
  `logo-files/README.md` (citaba cuatro ficheros que ya no existen). En los dos
  WIP se separó el **estado de hoy** del **registro histórico**, que se conserva
  entero: ahí está lo que se probó y el usuario RECHAZÓ.
- **Borrado por no usarse**: `public/zodk-sat-recon{,-noche}.svg` (un satélite
  que se dibujó pero nunca llegó a `AERONAVES`), `public/zodk-favicon.svg`
  (duplicado byte a byte de `zodk-favicon-v2.svg`, que es el que enlaza
  `Head.astro`) y tres avatares de tweet huérfanos. Sin trackear, también
  fuera: `public/_bocetos/` y `public/zodk-tb3{,-noche}.svg`.
  **Se quedan a propósito** `public/favicon.ico` y `public/apple-touch-icon.png`
  aunque nada los enlace: los navegadores y iOS los piden por su nombre.
- **Dependencias**: fuera `@astrojs/mdx` (estaba activado en
  `astro.config.mjs` sin un solo `.mdx`; el importador solo escribe `.md`), y
  `eslint` con sus plugins a `devDependencies`, que el despliegue no los
  necesita. **`typescript` se queda en `dependencies` a propósito** (decisión
  del usuario, 20-sep): `npm run build` ejecuta `astro check`, así que es
  dependencia de compilación. No moverlo.
- **Se conserva a propósito** `logo-files/prototipo-luna/` (12 MB de PNG de
  comparación): es el registro visual de por qué la Luna quedó como quedó, y
  `LUNA-WIP.md` los cita por su nombre.
- Comprobado al cerrar: `npm run build` OK (51 páginas), `npm run lint` limpio,
  ningún enlace interno roto en `dist/` y nada que apunte a lo borrado.

### Subida a Astro 7 (21-sep-2026): publicada (merge `516d933` de la rama `astro-7`, que se conserva)

Astro 5.18.2 → **7.3.3** (con Vite 8). `npm audit` pasó de 4 vulnerabilidades
(1 crítica, en `astro` y `sharp`) a **0**. Lo que cambió:

- **Colecciones de contenido**: `src/content/config.ts` pasó a
  `src/content.config.ts`, con un `loader: glob()` por colección y `z` desde
  `astro/zod`. En las páginas, `entrada.slug` → `entrada.id` y
  `entrada.render()` → `render(entrada)`. El `id` sale igual que el viejo
  `slug` (sin `.md` ni `/index` final): las 51 URLs no cambiaron.
- **Tailwind**: fuera `@astrojs/tailwind` (no funciona desde Astro 6). Sigue
  Tailwind 3, conectado como plugin de PostCSS en `astro.config.mjs`, igual
  que lo hacía la integración por dentro. Pasar a Tailwind 4 sería otro
  trabajo (cambian nombres de clases); no hace falta.
- **`compressHTML: true`** en `astro.config.mjs`: Astro 7 borra por defecto
  los saltos de línea entre etiquetas (reglas de JSX) y podía pegar palabras.
- **Minificado del CSS con esbuild** (`vite.build.cssMinify`): ver la trampa
  de abajo.
- `sharp` a 0.35 y `allowScripts` de `package.json` al día (solo `esbuild`
  0.28.2 y `fsevents` necesitan script de instalación).

**Trampa: Lightning CSS se estrella sin mensaje.** Si `astro build` muere con
`Segmentation fault` justo tras "Building static entrypoints", es Lightning
CSS (1.33, en Rust). Lo tumba el ancho de `.hero-lectura` en `global.css`:
`calc(16px + 0.8rem + 0.14em + 18 * (1ch + 0.14em))` (un número por un
paréntesis con unidades mezcladas). Vite 8 lo usa para minificar: por eso
`cssMinify: "esbuild"`, el minificador de Astro 5, y el CSS sale idéntico
byte a byte. **Pero el compilador de Astro 7 también usa Lightning CSS para los
`<style>` de los componentes, y ahí `cssMinify` no protege**: si esa forma de
`calc` va algún día en un `.astro`, deshacer el paréntesis a mano
(`18ch + 18 * 0.14em` sí compila).

Comprobado antes de publicar: el HTML de las 51 páginas comparado con el de
`main` solo cambia en espacios entre etiquetas, `&quot;` en los tuits, `alt=""`
en las imágenes de las notas, el nombre interno de los estilos
(`data-astro-cid-…`) y un ancla del evento del F-15E que ahora acaba en guion
(nada la enlaza). En Chrome: portada de día y de noche, vuelo a `/luna` y
vuelta (eventos del router en orden), `moon-project` desde modo día, columna
de países (chapas en la misma posición que en `main`), cara oculta, volver a
`/luna` desde una nota con la selección guardada, `/notas`, `/eventos`, una
semana de Ceuta, una nota de misión y el RSS. `npm run lint` y `npm run dev`,
bien. Visto de paso y **no es de la migración** (también en `main`): durante
el vuelo de vuelta a la Tierra, la mitad de abajo de la pantalla sale gris
lisa en Chrome.
