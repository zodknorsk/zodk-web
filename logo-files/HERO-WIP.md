# Planeta del hero — estado

Portada de zodk.eu: la Tierra en pixel art a pantalla completa, hemisferio
norte, Polo Norte arriba, girando, con un dron sobrevolándola. Encuadre de
"horizonte" inclinado (no cenital). **Cambia de día a noche con el botón de
tema**, igual que el logo. Sin texto de marca.

## Cómo funciona

El planeta es un **sprite PNG** de 28 fotogramas en horizontal (1 px = 1 celda).
La web lo anima moviendo `background-position` a saltos (`steps(28)`, vuelta en
60 s): un recorte de bitmap, barato en cualquier navegador. Se probó un SVG
vectorial animado y calentaba la CPU en Firefox/Zen (ver más abajo).

- Modo claro → `public/zodk-planeta-sprite.png` (Tierra de día, sol, terminador
  suave, ciudades como puntos oscuros — de día no se encienden) + `zodk-dron.svg`.
- Modo oscuro → `public/zodk-planeta-noche.png` (Tierra a oscuras, luces por
  densidad de población + focos de grandes ciudades + luces sueltas de islas) +
  `zodk-dron-noche.svg` (con luces de posición: amarilla en el morro, verde ala
  derecha/arriba, roja ala izquierda/abajo). Solo se descarga en modo oscuro.

El sombreado (terminador, oscurecimiento del borde, atmósfera) va **horneado en
el sprite**, no como capa CSS. Una sola capa animada.

## Pipeline (`logo-files/`)

| Archivo | Qué |
|---|---|
| `rasterizar.py` | `ne_50m_land.geojson` (gitignored) → `mapa_tierra.py`. Costas + hielo (Groenlandia >67N, casquete >82N) + estrecho de Gibraltar. Solo re-ejecutar si cambian resolución/umbrales. |
| `densidad_luces.py` | `ne_10m_populated_places` (gitignored, `pp10.json`) → `luces.py`. Campo de densidad 0-3 para las luces de noche. Umbrales por percentil: `T1/T2/T3 = pct(0.82/0.93/0.982)`. Subirlos = menos luces. |
| `mapa_tierra.py`, `luces.py` | Salidas de los dos anteriores. Es lo que consume el generador. |
| `png8.py` | Escritor mínimo de PNG indexado. |
| `generar-planeta-hero.py` | Todo junto → los 2 sprites + los 2 drones. Parámetros arriba del archivo (`FRAMES`, geometría, sol, `CIUDADES`, `LUCES_SUELTAS`). |
| `generar-estrellas.py` | Baldosa `public/zodk-estrellas.png` para el campo de estrellas del fondo (la web la repite con `background-repeat` en vez de apilar gradientes en el CSS). |

Flujo de iteración:
```
cd ~/Documents/zodk-web/logo-files
python3 densidad_luces.py          # solo si tocas umbrales de luces
python3 generar-planeta-hero.py
python3 generar-estrellas.py       # solo si tocas las estrellas
cp zodk-planeta-sprite.png zodk-planeta-noche.png zodk-dron.svg zodk-dron-noche.svg zodk-estrellas.png ../public/
cd .. && npm run dev
```
Los .geojson se re-descargan con los `curl` documentados en cada script.

## Integración en la web

- `src/layouts/PageLayout.astro` — prop `hero?: boolean`; pinta `<slot name="hero" />`
  a sangre y pone `class="home at-top"` en `<html>`.
- `src/pages/index.astro` — `<section slot="hero">` con estrellas, sparkle,
  `.hero-planet` (div), `.hero-dron` (div), flecha de scroll. Sin texto. Debajo,
  `<div id="hero-sentinel">` marca el límite hero/contenido.
- `src/components/Head.astro` — `initHeader()`: la cabecera de la portada tiene 3
  estados según clases en `<html>`:
  1. `at-top` (sin `scrolled`): nav mínima "notas / eventos / tema", sin logo.
  2. sin nada: al bajar por el hero la cabecera se esconde arriba.
  3. `scrolled`: cabecera sólida con logo, al llegar al contenido del blog.
  Un IntersectionObserver sobre `#hero-sentinel` conmuta `scrolled` (línea de
  activación en `rootMargin: "0px 0px -52% 0px"`, simétrica al subir). El resto
  de páginas, sin centinela, usan el `onScroll()` de siempre.
- `src/styles/global.css` — bloque "Portada: el hero del planeta" + reglas
  `html.home` de la cabecera. `html.dark` cambia los sprites a la versión de
  noche; `.hero-stars::after` añade más estrellas solo en oscuro.

## Por qué sprite PNG y no SVG animado

Un SVG vectorial con miles de `<rect>` girando (o fotogramas apilados con
opacidad) le disparaba la temperatura del portátil al usuario en Zen (navegador
basado en Firefox), aunque en Chrome iba fino. Rasterizar a sprite PNG y mover
`background-position` lo resolvió. **No volver a intentar animar el SVG.**

### Idea descartada: "idea A" (sept 2026)

Separar un **sprite de continentes planos** (pocos colores, comprime mucho) que
rota + **sombreado/terminador/atmósfera como gradiente CSS estático** encima +
**fundido cruzado** entre fotogramas (dos capas `.hp-a`/`.hp-b`) para suavizar el
giro. El fundido se veía a trompicones (aun con los `@keyframes` sincronizados
generados) y al usuario no le convenció el conjunto. Se volvió atrás al sprite
con sombreado horneado. Si se retoma la fluidez: subir `FRAMES` y ya, o
plantear otra cosa, pero el fundido de dos capas queda aparcado.

## Pendiente

1. ~~Móvil~~ — hecho (commit `7de9a13`); verificado en un teléfono real.
2. ~~Caché en producción~~ — resuelto de facto: cada cambio del sprite de día
   sube el `?v=` en `global.css` (va ya por `v=11`). Seguir hacíendolo así en
   cada cambio futuro del PNG de día.
3. **Afinar** — tono desierto para el Sáhara, pulir el hielo del polo, tamaño
   de las luces sueltas, nº de luces de noche… sigue pendiente de ir puliendo
   con el usuario. (`MAPRES` ya no aplica: ver punto 5, se subió a resolución
   nativa).
4. **Aparcado** — aurora boreal en el modo noche.
5. **Pasada de calidad del pixel art (sprite de DÍA)** — EN CURSO, rama
   `planeta-pixelart-v2` (creada 13-sep-2026 tal como estaba previsto, sin
   esperar al 15). Todo esto ya está hecho y en `public/` (sin commitear):
   - **Rampas de paleta**: mar en 3 tonos (turquesa de costa → plataforma →
     abisal). Colores de bioma más vivos/alegres (verdes más claros y
     saturados). Se probó una franja cálida de amanecer/atardecer en el
     terminador y un brillo especular en el mar (glint) — **el usuario los
     probó y los rechazó los dos explícitamente, no reintentar salvo que lo
     pida otra vez**. El turquesa de costa sí gustó, se queda.
   - **Biomas suavizados**: desenfoque de caja en 2 pasadas sobre el color de
     bioma (solo entre tierra, sin mezclar con el mar) para que la frontera
     bosque-oscuro/verde-claro o verde/desierto no corte en seco. Gustó mucho.
   - **Dither con criterio**: el punteado Bayer que rompe banding ahora se
     pesa por `term_edge`/`limb_t`/`mtn_edge` — solo actúa cerca del
     terminador, el limbo o relieve marcado; el interior de mar/tierra en
     pleno día queda liso.
   - **AA de limbo y costas**: el borde del disco ya no corta en seco (banda
     `LIMB_AA` px de suavizado hacia el color de fondo real de la portada);
     las celdas de costa se sub-muestrean (4 puntos) para mezclar tierra/mar
     en proporción en vez del escalón crudo del mapa.
   - **Línea de costa reforzada** (pedido nuevo del usuario, no estaba en la
     lista original): anillo casi negro (`COAST_COL`) de 3 celdas de grosor
     decreciente (0,84 / 0,48 / 0,20 de mezcla) alrededor de TODA tierra
     firme y hielo (Groenlandia incluida — cuidado, es fácil olvidarse del
     hielo como "terreno" aparte). Al usuario le encantó ("resalta muchísimo").
     Sub-muestreada con 8 puntos extra por píxel y quedándose con el anillo
     más fuerte encontrado: sin eso, las islas más pequeñas que un píxel de
     pantalla (Filipinas, islotes sueltos) perdían la línea de forma
     aparentemente aleatoria. **Sin fronteras políticas** — se preguntó
     explícitamente y el usuario reafirmó que no, solo contorno de costa.
   - **Más fotogramas + más resolución a la vez**: `COLS` 280→400, `RADIUS`
     143→195, `MAPRES` 2→1 (resolución nativa del mapa, 0,25°), `FRAMES`
     28→60. Para que quepa en una textura razonable el sprite pasa de tira en
     fila a REJILLA (`GRID_COLS`=15, `GRID_ROWS`=4, en `generar-planeta-hero.py`).
   - **Paleta indexada → color real**: con tanto degradado nuevo, el PNG-8 de
     256 colores se quedó corto (colores "sucios", al más parecido que
     hubiera libre). Se pasó el sprite de DÍA a PNG truecolor (`png8.write_rgba`,
     nueva función). El de noche NO se toca, sigue indexado tal cual estaba.
     Coste: el PNG de día pesa bastante más (~430 KB → ~3 MB entre esto y la
     subida de resolución/fotogramas). Vigilar si el usuario quiere que se
     optimice más adelante (oxipng/pngquant sobre el resultado, o replantear).
   - **Animación CSS rehecha**: la rejilla rompía el truco de un solo eje
     (`background-position-x` + `steps(FRAMES)`). Se probó un `@keyframes`
     con una parada manual por fotograma (60 paradas) + `steps(1)` — el
     usuario lo notó "a trompicones" (sospecha: Firefox/Zen interpola entre
     paradas tan pegadas en vez de saltar en seco, técnica poco habitual).
     Se sustituyó por DOS animaciones `steps()` nativas independientes, una
     por eje (`hero-spin-x`: recorre `GRID_COLS` columnas en `DURACION/GRID_ROWS`
     segundos; `hero-spin-y`: recorre `GRID_ROWS` filas en toda la `DURACION`),
     sincronizadas porque el ciclo de X divide exacto a la duración total.
     Es la misma técnica robusta de siempre, solo que en 2 ejes — si se vuelve
     a tocar la rejilla, reusar este patrón, no volver al de paradas manuales.
     De paso: el usuario prefiere el giro CALMADO — con 60 fotogramas en 60s
     se sentía más ajetreado que antes con 28, aunque la velocidad angular
     real era la misma; se subió la duración a 120s para compensar. Si se
     tocan `FRAMES`/`GRID_COLS`/`GRID_ROWS` otra vez, recalcular
     `aspect-ratio`, `background-size` y las duraciones/steps() de
     `.hero-planet` en `src/styles/global.css` a mano (están comentadas ahí).
   - **Pendiente de verificar**: nadie ha visto la animación funcionar en un
     navegador real todavía (la extensión Claude in Chrome no conectó en toda
     la sesión). Antes de dar esto por bueno o mergear a `main`, comprobar en
     Zen/Firefox que el giro va fluido y sin tirones.
   - **Observación del usuario (13-sep, sin resolver)**: con la costa ahora
     tan marcada, el relieve de montaña (roca/nieve, `ROCK`/`SNOW`/hillshade
     en `_surface_at`) "pierde valor", se ve blando/con poca resolución en
     comparación — el contraste de la línea de costa deja el sombreado de
     montaña en evidencia. Candidato fuerte para la siguiente sesión: dar al
     relieve el mismo tratamiento "con carácter" que a la costa (más
     contraste, bandas más deliberadas/posterizadas o algún trazo de cresta,
     en vez del hillshade continuo actual).
   - **Otra observación del usuario (13-sep, sin resolver)**: los puntos de
     ciudad (`CITY_DARK` en `city_cells()`) también "pierden valor", casi no
     se ven. Sospecha razonable: su tamaño en píxeles está fijo en el código
     (1 celda normal, bloque 2×2 para las "grandes"/`MEGA`) y NO se escaló al
     subir `COLS`/`RADIUS` ~1,4× — el mismo punto absoluto ahora es una
     fracción más pequeña de un disco más grande. Probar a agrandar el bloque
     (¿2×2 normal, 3×3 grandes?) antes de tocar el color.
   - Sigue pendiente el **halo atmosférico** (no se ha tocado más allá del
     `ATMO` mix que ya había) y el **tono del desierto del Sáhara** de la
     lista original.
   Recordar siempre: solo el sprite de día (el de noche no se toca), vista de
   horizonte inclinada, nada de nubes de ruido fBm, cache-busting `?v=` en
   cada cambio del PNG de día.
6. Al terminar del todo, borrar este archivo.
