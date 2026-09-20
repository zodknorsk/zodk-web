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
- **Dos caras fijas** (visible luminosa / oculta más oscura y fría) y media
  vuelta de verdad en `<canvas>` (2,8 s) con el mando de abajo en el centro.
  Motor `src/scripts/luna.js`, datos en `public/luna/` que genera
  `logo-files/generar-luna.py`. Al regenerar: subir `LUNA_V` en `luna.js` y el
  `?v=` de `luna-visible.png` en `global.css` (van por 3).
- **28 alunizajes** con chapa de bandera, ficha con foto y enlace "Leer la
  nota". Columna de países a la izquierda (EE. UU. con casillas Surveyor /
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

### Pendiente: subir Astro 5 → 7 (el usuario lo hará la semana del 22-sep)

`npm audit` da 4 vulnerabilidades (1 crítica) en `astro` 5.18.2 y `sharp`:
varios XSS y un RCE por la optimización de imágenes AVIF. La exposición real es
baja (sitio estático, sin servidor, contenido propio), pero conviene ponerse al
día. El arreglo es `npx @astrojs/upgrade` → Astro 7.3.3, **cambio mayor**.

Hacerlo **en rama aparte** y vigilar lo que más se puede romper:
- **ClientRouter**: el vuelo Tierra ↔ Luna vive de `astro:page-load`,
  `astro:before-swap` y `astro:after-swap` (`index.astro`, `luna.astro`,
  `viaje-luna.js`). Es lo más frágil de todo el sitio.
- **Colecciones de contenido**: `src/content/config.ts` y los `getCollection`
  de todas las páginas.
- **Integraciones**: `sitemap` y `tailwind` tendrán que subir a la vez.

Probar antes de fusionar: portada de día y de noche, vuelo a `/luna` y vuelta,
chapas y columna de países, el enlace `moon-project` desde modo día, `/notas`,
`/eventos`, una nota de misión y el RSS.
