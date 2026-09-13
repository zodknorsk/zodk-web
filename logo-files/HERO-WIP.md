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

(HISTÓRICO: desde sept 2026 el día y la noche son el MISMO `<canvas>`, ver
punto 7 y "Modo noche v2". Lo de esta sección describe los sprites viejos.)
- Modo claro → `public/zodk-planeta-sprite.png` (Tierra de día, sol, terminador
  suave, ciudades como puntos oscuros — de día no se encienden) + `zodk-dron.svg`.
- Modo oscuro → `public/zodk-planeta-noche.png` (retirado) + `zodk-dron-noche.svg`.

El sombreado (terminador, oscurecimiento del borde, atmósfera) va **horneado en
el sprite**, no como capa CSS. Una sola capa animada.

## Pipeline (`logo-files/`)

| Archivo | Qué |
|---|---|
| `rasterizar.py` | `ne_50m_land.geojson` (gitignored) → `mapa_tierra.py`. Costas + hielo (Groenlandia >67N, casquete >82N) + estrecho de Gibraltar. Solo re-ejecutar si cambian resolución/umbrales. |
| `cities15000.txt` | GeoNames (gitignored, curl en el generador): las luces de noche. Sustituye a `densidad_luces.py`/`luces.py` (retirados). |
| `mapa_tierra.py` | Salida de `rasterizar.py`. Es lo que consume el generador. |
| `png8.py` | Escritor mínimo de PNG indexado. |
| `generar-planeta-hero.py` | Todo junto → datos del canvas de día y de noche en `public/planeta/`. Parámetros arriba del archivo (geometría, sol, luna, paleta de noche) y en cada sección (`LUZ_*`, nubes, banderas…). |
| `generar-estrellas.py` | Baldosa `public/zodk-estrellas.png` para el campo de estrellas del fondo (la web la repite con `background-repeat` en vez de apilar gradientes en el CSS). |

Flujo de iteración (desde sept 2026 el planeta de DÍA es un canvas, ver punto 7):
```
cd ~/Documents/zodk-web/logo-files
python3 generar-planeta-hero.py            # -> public/planeta/ (datos del canvas + planeta-quieto.png)
python3 generar-planeta-hero.py --frame 17 prueba.png   # un fotograma suelto para comparar
# tras regenerar: subir PLANETA_V en src/scripts/planeta.js y el ?v= de
# planeta-quieto.png en global.css
cd .. && npm run dev                       # o el banco de pruebas: python3 -m http.server 4400
                                           #   -> http://127.0.0.1:4400/logo-files/prototipo-canvas/
```
El planeta de NOCHE (`public/zodk-planeta-noche.png`) no se regenera: congelado.
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

## Modo noche v2 — EN CURSO (rama `planeta-noche`, desde el 13-sep-2026)

El usuario reabrió la noche: se rehace **desde cero con el mismo pipeline que
el día** (generador Python → canvas, giro continuo, misma geografía y
texturas), cuidando lo propio de la noche (luces de ciudades, naves nocturnas
con luces de posición, toques de luz en el título; el lema es el mismo). Todo
lo nocturno anterior (sprite viejo, `densidad_luces.py`, la sección de abajo)
es **trabajo viejo**: referencia de intenciones, no decisiones cerradas.
Se commitea poco a poco en la rama; push/merge cuando esté todo.

Hecho y aprobado:
1. **Luz de luna** (`noche()`, `MOON_*`, `N_NIGHT` en el generador): cada color
   de día pasa a su versión nocturna (desatura poco, tiñe de luz fría y
   oscurece) y encima va la misma rampa de luz con la luna en vez del sol.
   Elegidas con renders: paleta **P3 "índigo contrastado"** (frente a una gris
   "cemento" y otra índigo suave) y **luna llena casi de frente, algo arriba a
   la izquierda** (C). Luna por la derecha descartada: copas/dunas/relieve
   llevan la luz horneada desde el NO y la textura contradecía a la esfera.
   Probar: `python3 generar-planeta-hero.py --frame 0 prueba.png --noche`
   (o `--ambos` para día y noche de una vez).

2. **Luces de ciudades** (`light_cells()`, `LUZ_*` en el generador; "bastante
   realista"). Datos: GeoNames `cities15000.txt` (gitignored, curl en el
   generador), ~34.000 ciudades; Natural Earth (`pp10.json`) dejaba EE. UU.
   casi a oscuras (617 localidades para 27 veces Alemania). Cada ciudad deja
   una huella en píxeles de pantalla: intensidad (pob/100.000)^0,4 → pueblo
   1 px tenue, ciudad con halo, ≥3 M núcleo 2×2 casi blanco. Los núcleos que
   caen en el mismo píxel se suman (áreas metropolitanas); la suma de halos
   solo da un velo tenue (nivel 1). 6 niveles de ámbar, emisivos (no dependen
   de la luna); nubes por encima. `LUZ_PAIS`: África subsahariana ×0,5, Corea
   del Norte ×0,08 (a oscuras), EE. UU. ×2,2 y Canadá ×1,5 (el usuario lo veía
   flojo). Descartado por el camino: huellas 3×3 en todo pueblo (confeti),
   dejar que la suma de halos suba a niveles altos (Benelux/Inglaterra
   quemados en mancha plana naranja).

3. **Brillo de atmósfera en el borde** (`AIRGLOW*`): sin él, de noche el
   horizonte se fundía con el cielo negro. Elegida la opción B: línea azul fina
   (1,5 px al 55 % + 1,5 px más al 25 %), todo alrededor, por DENTRO del disco
   (el canvas empieza justo en el borde de arriba; un resplandor fuera con
   filtro CSS se recalcularía cada fotograma en Zen). Descartadas: ancha de 3
   escalones y turquesa. Costa, hielo y nieve de noche: se dejan como salen
   (se leen bien).

4. **La noche, en el canvas** (`planeta.js`, `PLANETA_V` 8, `?v=8`). Mismo
   canvas de día y de noche según el tema; al cambiarlo en caliente se repinta
   entero sin cortar el giro. Lo de la noche se descarga solo si hace falta:
   `planeta-lut-noche.png` (misma lista de materiales, colores a la luz de la
   luna) y `planeta-luces.png` (34.091 luces, 2 px por luz: lat/lon en 16 bits
   + fuerza en 1/16; ~160 KB). Por píxel se precalculan también los escalones
   de luz de la luna (`pKNn`/`pKIn`) y el borde nocturno (`postN`: halo, brillo
   de atmósfera, borde suavizado). Las luces se ESTAMPAN en cada fotograma como
   en `light_cells()` (hornearlas en el mapa las haría titilar al girar, como
   pasaba con las costas). Respaldo sin JS: `planeta-quieto-noche.png`.
   Retirados: el sprite viejo `public/zodk-planeta-noche.png` y su animación
   CSS, `luces.py` y `densidad_luces.py`.
   Rendimiento (Chrome sin ventana en el Mac, 280 filas visibles): día 0,35 ms
   por dibujo, noche ~1,7 ms (casi todo, sumar huellas de ~15.000 luces). Ya
   optimizado: descartes sin trigonometría (por detrás del disco, por debajo de
   la ventana) y giro con cos/sen precalculados. Probado y DESCARTADO por el
   aspecto: quitar el halo a los pueblos de <100.000 (Europa perdía el velo).
   Otra vía no probada: fundir localidades a <0,1° (solo −23 % de luces).
   Pendiente: que el usuario lo compruebe en Zen (temperatura).
5. **Chapas, coordenada MGRS y X también de noche** (pedido del usuario). Las
   chapas conservan sus colores (son marcadores) con la luz de la luna; se
   pintan por encima de las luces de ciudades. `geo()` ya no devuelve null de
   noche. En el generador, `flag_cells(lon0, night)`.
6. **Naves de noche** (opción B, aprobada). `generar-naves-noche.py` saca
   `public/zodk-<id>-noche.png` de las fotos del usuario (los originales NO se
   tocan): mismo tratamiento de luna que el planeta pero más claro (probadas
   tres intensidades sobre el planeta de noche; las oscuras camuflaban las
   naves grises contra el mar). El alfa no se toca (sombra y bordes igual; la
   sombra solo se enfría un poco de color). Zonas con luz propia (`EMISIVO`:
   postquemadores del SR-71) sin oscurecer. **Luces de posición** como puntos
   CSS encima de la nave (`.craft-luz`, tamaño fijo en pantalla: dentro de la
   foto reducida saldrían de <1 px), posiciones en `aeronaves.ts` (`luces`, en
   % de la imagen; morro a la izquierda → ala derecha = arriba = verde,
   izquierda = abajo = roja), fijas. Se probaron también blanca de cola,
   destellos blancos en las puntas y baliza roja intermitente: el usuario las
   QUITÓ ("quita las luces adicionales que no sean verde y rojo"), no
   reponerlas. Decisión propia, avisada: el Shahed-136 va a
   oscuras (como en la realidad) y el Sentinel-2 no lleva (satélite; tiene su
   SVG de noche de antes).

7. **Título de noche — opción D (la propuso el usuario, frente a A/B/C que
   se le enseñaron: verde fijo con lema blanco / verde / ámbar)**. De noche el
   título se ve como de día, en blanco (se quitó el lema ámbar de la noche
   vieja). Al FIJAR una coordenada (clic en el planeta, `.hero-mgrs.fijada`)
   pasan a verde de visión nocturna (`--nvg` #8dff9e + resplandor): marco,
   coordenada resaltada (marcador verde, texto oscuro), lema y botón
   play/pausa; la X del planeta también (`X_CELLS_N` en `planeta.js`). Con
   `:has()` en el CSS. La mira del cursor sigue blanca (no la pidió).
8. **Más estrellas de noche** (pedido del usuario, "bastante más" y luego
   "unas cuantas más"): baldosa propia `public/zodk-estrellas-noche.png`
   (480 px, 95 estrellas, casi todas tenues; `generar-estrellas.py`) en
   `.hero-stars::after`, encima de la de siempre.

Siguiente: hemisferio sur (pendiente de hablarlo), revisión general en Zen
(temperatura) y móvil, y decidir el merge.

## Modo noche — notas VIEJAS (antes del rediseño del día)

El usuario quiere trabajar el modo noche **más adelante** (lo dijo el
13-sep-2026, al comprobar que el de ahora se ve bien). Todo lo que hay que
saber para arrancar sin re-preguntar:

**Estado actual (congelado).** `public/zodk-planeta-noche.png`: tira antigua de
28 fotogramas de 164x161 px (4592x161), PNG indexado. CSS en `global.css`:
`html.dark .hero-planet` con `aspect-ratio: 280 / 274`, `background-size:
2800% 100%` y `hero-spin 60s steps(28)` — las mismas reglas que en `main`; el
canvas de día se oculta en oscuro y `planeta.js` deja de dibujar. El generador
ya NO regenera la noche (la rama `night` de `cell_index()` y `city_cells()`
siguen en el código tal cual, por si acaso).

**Por qué está congelado.** En sept 2026, tras unos cambios, el usuario dijo
"el modo oscuro es un desastre, no toques nada, vuelve a como antes, todos los
cambios hazlos en el modo día". Desde entonces no se toca. Cuando se retome,
es él quien lo abre: no cambiar nada de la noche por iniciativa propia.

**Lo que ya se sabe que quiere de noche** (decisiones suyas de sept 2026):
- Luces repartidas **por densidad de población** (como el logo pequeño), no
  solo las grandes ciudades: `densidad_luces.py` → `luces.py` (campo 0-3,
  umbrales por percentil `T1/T2/T3`). Más focos de las grandes ciudades
  (`CIUDADES`, ≥10 M = bloque) y luces sueltas en islas (`LUCES_SUELTAS`:
  Honolulu, Reikiavik, San Juan). Las luces se adelgazaron una vez (había
  demasiadas).
- Naves con **luces de posición solo de noche** (amarilla en el morro, verde
  ala derecha, roja ala izquierda); de día, como están.
- Guiño de noche en el título: el lema en ámbar. Más estrellas solo en oscuro
  (`.hero-stars::after`).
- **Aparcado**: aurora boreal en el polo.

**Lo que el día ha enseñado y seguramente querrá también de noche** (hay que
preguntárselo, no darlo por hecho):
- Canvas con giro continuo en vez de sprite a saltos (lo pidió al ver los
  saltos del de día). Mismos píxeles finos (600 px) y 90 s por vuelta.
- Misma geografía: costas a 0,125°, banquisa con forma (el casquete circular
  sigue en el sprite de noche viejo), relieve.
- Estilo pixel art "de ilustración" (rampas con cambio de tono, racimos).
- ¿Chapas de bandera también de noche? (hoy solo de día, con su ficha de
  artículos al pasar el ratón).
- **Hemisferio sur**: pensar aquí cómo llegar a los países del sur (no se ven
  en el hero; ver punto 7, "Problema para el futuro"). Lo pidió él para
  cuando se retome la noche.

**Cómo encajaría técnicamente (propuesta, no hecha).** El canvas ya separa
"material de cada celda" (`planeta-mapa.png`) de "color por material y luz"
(`planeta-lut.png`). La noche podría ser: otra LUT de noche del mismo mapa
(tierra/mar/hielo en azules oscuros con sus rampas) + una capa de luces por
celda (de `luces.py`, en otro PNG o en bits libres del mapa) que se pinta
encima en ámbar (`GOLD`). Al cambiar de tema, `planeta.js` cambiaría de LUT sin
descargar otro planeta ni cortar el giro. El sprite de noche viejo se
retiraría como se retiró el de día.

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
   - **Observación del usuario (13-sep, resuelta en el punto 6)**: con la costa ahora
     tan marcada, el relieve de montaña (roca/nieve, `ROCK`/`SNOW`/hillshade
     en `_surface_at`) "pierde valor", se ve blando/con poca resolución en
     comparación — el contraste de la línea de costa deja el sombreado de
     montaña en evidencia. Candidato fuerte para la siguiente sesión: dar al
     relieve el mismo tratamiento "con carácter" que a la costa (más
     contraste, bandas más deliberadas/posterizadas o algún trazo de cresta,
     en vez del hillshade continuo actual).
   - **Otra observación del usuario (13-sep, superada: se quitaron las ciudades de día, punto 6)**: los puntos de
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
6. **Pixel art "de ilustración" (13-sep-2026, misma rama)** — el usuario trajo
   de referencia una escena pixel art de monolitos con hierba y pidió acercar
   el planeta a ese estilo. Hecho en `generar-planeta-hero.py` (aprobado paso a
   paso con renders), **aún sin regenerar el sprite de 60 fotogramas ni
   copiarlo a `public/`**:
   - **Rampas con cambio de tono** (`ramp()`): sombrear ya no es mezclar hacia
     negro; cada escalón oscurece y gira el tono hacia azul-violeta (sombras)
     o hacia amarillo (luces). Los cálidos giran a media velocidad (si no, el
     desierto en sombra quedaba óxido); el mar gira menos de la mitad (si no,
     el lado de noche se iba a añil).
   - **Copas de árbol** (`CROWN`): racimos redondos sobre la esfera, pintados
     de norte a sur, con luz arriba-izquierda y borde en sombra. Densidad y
     escalones por bioma (`CROWN_DENS`, `CROWN_K`). Manchas grandes (`PATCH`)
     alternan bosque cerrado y claros de pradera: sin ellas EE. UU./Europa
     salían uniformes y saturados (lo señaló el usuario).
   - **Relieve en bandas** (`MTNK`): DEM interpolado a 0,25°, sombreado en
     escalones enteros de rampa, sin punteado Bayer. Resuelve lo del relieve
     "blando" junto a la costa marcada.
   - **Nieve y roca por copas enteras**: la nieve cuaja en copas completas
     (le gusta cómo queda), la roca asoma primero entre los árboles.
   - **Dunas** (`DUNE`): medias lunas en todos los desiertos, cresta al sol y
     sotavento en sombra, solo en llano. Erg (arena cálida, dunas densas) y reg
     (grava gris, dunas sueltas) por manchas. Le gustaron.
   - **Franja de mezcla entre biomas** (`MIXBIO`, idea del usuario): en vez de
     difuminar el color en la frontera, una franja de ~4-5° donde los dos
     biomas se mezclan a manchas (toques verdes en el desierto, toques áridos
     en la selva). Global. Sustituye al difuminado `BIOME_RGB`, que se quitó.
     Antes se probó entrelazar copas sueltas + frontera deshilachada a escala
     de 1 px y quedaba peor (ruido, bordes de recortable): descartado.
   - **Ciudades quitadas del sprite de día** (pedido del usuario: "de momento
     pasamos de ellas"). `city_cells()` sigue ahí para la noche congelada.
   - `python3 generar-planeta-hero.py --frame N salida.png` genera un solo
     fotograma (~9 s) para probar sin rehacer los 60.
   - **Mar en franjas planas**: turquesa de costa → turquesa medio
     (`OCEAN_MID`) → plataforma → abisal, con los bordes ondulados por ruido
     (`SEA_BANDS`, `SEA_WOBBLE`), mismo ancho que el degradado de antes. Sin
     la mezcla tierra/mar en celdas de costa (`COAST_AA = False`): costa en
     escalón de píxel limpio. Gustó ("muy bien").
   - **Sprite de 60 fotogramas regenerado** con todo lo anterior, copiado a
     `public/` y `?v=12` en `global.css` (3,6 MB, algo menos que antes).
   Pendiente de este bloque (menor): quizá cambiar el punteado Bayer del
   terminador por franjas onduladas (se le preguntó, no opinó), quizá que las
   manchas verdes dentro del desierto sean copas sueltas (sabana) en vez de
   selva cerrada.
7. **Planeta en `<canvas>` en vez de sprite (EN CURSO, 13-sep-2026)** — al
   ver el sprite nuevo en la web el usuario notó que "va a saltos de 2 s": 60
   fotogramas en 120 s, cada salto gira 6° ≈ 20 px del sprite ≈ 90 px de su
   pantalla (el planeta se pinta a ~4,6 px de pantalla por píxel del sprite).
   Opciones planteadas: **A** más fotogramas (120 → saltos de 1 s, ~7 MB; no
   recomendado) o **B** canvas girando píxel a píxel. **Eligió B.**
   - **Prototipo**: `logo-files/prototipo-canvas/index.html` (fuera de
     `public/`, no se publica). Datos con
     `python3 generar-planeta-hero.py --canvas prototipo-canvas` (gitignored):
     `planeta-mapa.png` (material por celda a 0,25°, R+G*256, B=hielo),
     `planeta-lut.png` (color por material y escalón de luz, rampas incluidas),
     `planeta-datos.json` (constantes, prioridades, nubes). ~255 KB en total
     frente a 3,6 MB del sprite. Para verlo: `cd ~/Documents/zodk-web &&
     python3 -m http.server 4400` y abrir
     `http://127.0.0.1:4400/logo-files/prototipo-canvas/`. Botón para comparar
     con el sprite a saltos y botones de velocidad.
   - **Cómo funciona**: el sol/terminador no se mueven respecto al observador,
     así que por píxel se precalcula al cargar la celda del mapa, el escalón de
     luz, halo y borde; en cada fotograma solo se busca material → color.
   - **Lo que se aprendió por el camino (no repetir)**:
     1. Girar a golpes de una celda entera (12/s) se veía a tirones: en la
        zona visible (35-70°N) una celda son 0,5-0,8 px y todos los bordes se
        reajustaban a la vez con patrón irregular 1,1,0,1…
     2. Ajustar la celda para que un paso = 1 px exacto NO sirve: la velocidad
        en píxeles depende de la latitud (cos φ), solo cuadra en una.
     3. **Giro continuo** (redibujar cada fotograma con fracción de celda, en
        coma fija 1/256) = cada borde avanza su píxel a ritmo constante.
     4. **Mipmaps en longitud con prioridad** (costa > tierra > mar): cerca del
        polo un píxel abarca 2-6 celdas y leer una sola hacía parpadear costas
        e islas. Titileo de costa medido: ~1,5 % → ~0,27 % (polo), ~1,7 % →
        ~0,6 % (latitudes medias). Umbral `setTol(0)`.
     5. Dibujar en franjas fijas de 1/60 s (su pantalla va a 120 Hz): con
        `now - last >= 15` se colaba algún fotograma de más. Medido: 240/240
        dibujos exactos cada 16,7 ms. ~1,9 ms por dibujo; temperatura en Zen
        bien (lo comprobó el usuario).
   - **Velocidad: 90 s por vuelta** (elegida por el usuario al ver los píxeles
     finos de 600 px; con los de 400 px había elegido 180). Ha dicho que quizá
     más adelante pida 120 s: es solo cambiar `VUELTA`. Explicado: más lento = más nítido (menos
     titileo por segundo) pero no más fluido (el salto sigue siendo de 4,6 px
     de pantalla, solo más espaciado).
   - **Más resolución — HECHO (le encantó: "te está quedando de puta madre")**:
     `COLS` 600 / `RADIUS` 292,5, costas a 0,125° (`rasterizar.py` 2880x1440),
     relieve a 0,25° (`elevacion.py` 1440x720 desde el mismo `etopo.tiff`).
     Parámetros escalados con `KC` (celdas por celda de 0,25°) y `SCALE`
     (px respecto al de 400): copas/dunas/manchas de mezcla miden lo mismo en
     píxeles (más finas respecto al planeta); franjas del mar, franja de mezcla
     y claros miden lo mismo en grados. Línea de costa: anillo oscuro de 2
     celdas (sigue ≥1 px). Datos del canvas: ~770 KB. Solo se dibujan las filas
     del canvas que caen en la ventana (1,2 ms/fotograma frente a 3,4).
     Titileo de costa medido: 0,2 % polo, 0,33 % latitudes medias.
     Temperatura en Zen: bien. OJO: el sprite completo de 60 fotogramas a
     600 px saldría de 9000 px de ancho (más que una textura de GPU): si hiciera
     falta un sprite, bajar `GRID_COLS`.
     Contexto de la decisión: 
     Es lo que buscaba en parte con la referencia de Owlboy: allí un píxel son
     ~3,7 px de pantalla, aquí 4,6. A 1,5× (canvas de 600 px) quedaría ~3,1 y
     el movimiento sería más fino. Implica: mapa a 0,125° (re-rasterizar
     Natural Earth, relieve de `etopo.tiff` más fino), recalibrar en grados
     copas/dunas/franjas para que sigan midiendo lo mismo en píxeles, textura
     ~2880×1440 y 2,25× más píxeles que dibujar (vigilar temperatura en Zen).
   - **Polo norte: banquisa con forma (le gustó "cómo ha quedado")**. Antes,
     `rasterizar.py` convertía en hielo todo el mar >82°N: círculo perfecto con
     línea de costa. Ahora `ICE_WATER_LAT` está desactivado y el generador
     dibuja la banquisa (`PACK`, terreno 3): borde por longitud (`PACK_EDGE`,
     extensión de principios de verano: cuenca ártica hasta las costas, este de
     Groenlandia hasta ~70°N, Barents/Svalbard ~79-80°N), roto en témpanos en
     una franja (`PACK_FRINGE`), placas grandes de hielo viejo/joven
     (`PACK_OLD`/`PACK_YOUNG`). Sin línea de costa ni franjas turquesa: la
     tierra que toca (Groenlandia, islas) conserva la suya y se distingue
     (pedido del usuario: "que se diferencie ligeramente la isla del hielo").
     Lecciones: el ruido de la banquisa va en coordenadas POLARES (`_pnoise`),
     en lat/lon salían rayas en estrella desde el polo; punteado de sombra
     sobre hielo a `ICE_DITHER` = 0,35 (a 1 parecía estática, a 0 dejaba una
     línea recta cruzando Groenlandia); en el canvas, en mipmaps de nivel ≥3
     la costa ya no gana (si no, islotes árticos salpicaban el polo de negro);
     grietas de agua probadas y quitadas (quedaban como puntos sueltos).
   - **Banderas (13-sep-2026)**: chapas pixel art sobre los países del blog.
     Opciones dadas: A todos los países (satura, desaconsejado), B solo los
     grandes, **C solo los países que salen en el blog — elegida**, de momento
     España, Marruecos, Irán y EE. UU. Estilo: se enseñaron renders de
     **chapa** (bandera plana 11x7 con contorno oscuro, esquinas recortadas y
     sombra de 1 px) y de banderín en mástil ondeando; eligió **"clarísimamente
     la chapa"**. Siempre visibles en la cara iluminada (`BAND_PZ`, misma luz
     que las nubes). En `BANDERAS` / `BAND_PAL` del generador y en el JSON del
     canvas. Aparcado para más adelante: que se "planten" al pasar por el
     centro.
   - **Ficha de artículos al pasar el ratón por una chapa — HECHO (13-sep,
     "Zen perfecto")**: misma ficha que las naves (`.craft-dossier` /
     `.craft-linea` / `.craft-specs`). Relación país → artículos por las
     ETIQUETAS que ya llevan (`src/data/paises.ts`: iso, nombre, etiquetas);
     solo se pinta la chapa de un país con algún artículo (`banderas` en
     `montarPlaneta`). Capa `.hero-banderas` (misma geometría que el planeta,
     z-index 2) con un `<div>` por chapa que coloca el script de `index.astro`
     con lo que avisa `alMoverBanderas`. "Puente" invisible sobre la línea para
     llegar a la ficha sin que se cierre (tiene enlaces). Congela el hero como
     las naves; accesible con teclado (`:focus-within`); sin fichas en móvil ni
     de noche. Pendientes menores: si la chapa está muy abajo, la ficha se sale
     por abajo (abrirla hacia arriba); el evento de incidentes España-Marruecos
     solo lleva la etiqueta `marruecos` (el usuario decide si añade `españa`).
   - **Título rediseñado + coordenadas MGRS (13-sep-2026)**. Con el planeta
     más realista el título perdía protagonismo; se le enseñaron maquetas
     reales en el navegador. Descartó: rótulo pixel art, título en el cielo
     (bajando el planeta), cartela de expediente ("tapa mucho planeta"),
     sombra gruesa, nombre en negrita. Eligió: marco de visor con esquinas
     largas blancas (`.hero-marco`) alrededor de todo el título; nombre sin
     negrita, algo más grande, con contorno negro de 1 px; lema en IBM Plex
     Mono 600. Bajo la esquina inferior derecha, `.hero-mgrs`: MGRS con 5
     dígitos (`src/scripts/mgrs.js`, con UPS en los casquetes) del punto bajo el
     cursor, que da `geo(x, y)` de `planeta.js`; guiones fuera del planeta y de
     noche; congelado con una ficha abierta. Sobre el planeta el cursor es una
     mira (`.hero-mira`). Solo con ratón.
   - **Marca de blanco y play/pausa (13-sep-2026)**. Parar el planeta al
     apuntar se descartó ("la mira casi siempre estará sobre el planeta, no
     giraría nunca"). Clic en el planeta: X en pixel art blanca (`setMarca`,
     gira con el planeta; se oculta de noche/por detrás y reaparece) y la
     coordenada queda fija (`.hero-mgrs.fijada`). Clic en otro punto: la mueve;
     clic sobre la X o Esc: la quita. Botón `.hero-giro` junto a la coordenada
     (`setParado`; también para el sprite de noche con `.giro-parado`); al
     cargar siempre gira.
   - **Retoques del 13-sep por la tarde (hechos, aprobados)**:
     1. X de blanco en 5x5 (`X_ART`), antes 7x7.
     2. `.hero-lectura` de ancho fijo (el de la coordenada más larga, 18
        caracteres): el botón play/pausa ya no se mueve con `8T`/`11T`/UPS.
     3. Coordenada fijada con resaltado tipo MARCADOR (fondo blanco, contorno
        oscuro de 1 px, texto oscuro), no subrayado.
     4. En táctil (`hover: none` / `pointer: coarse`) no hay coordenada (se
        quedaba en guiones): solo el botón. Pendiente de verlo en un móvil real.
     5. Disco completo (`CDOWN` 0,92 → 1,0, lienzo 600x585): en móvil el
        planeta entero cabe en pantalla y se veía el corte recto de abajo.
     6. **Luz del terminador/limbo en escalones LISOS de 1/3** (`LIGHT_SUB` = 3;
        la LUT lleva 37 columnas). Se quitó el punteado Bayer (mosquitera). Se
        probaron bordes ONDULADOS por ruido y el usuario los RECHAZÓ ("no me
        gusta esa ondulación para nada"): no reintentar. Con escalones enteros
        las franjas "se notaban demasiado"; con cuartos casi es un degradado.
     7. Nubes: mismas 8 plantillas, pero eran solo un CONTORNO y por eso salían
        como donuts: `_cloud_fill` rellena el interior (las muescas de 1 celda
        entre lóbulos se respetan), rampa de tonos (`C_NUBE`) y escala
        `CLOUD_SIZE` 1,0-1,3 (se enseñó 1,3-1,7; eligió la pequeña; "más
        adelante le meteremos más mano"; ojo, muy grandes no quedan bien).
     8. Sabana (`SAV`): en la franja de mezcla desierto/verde, copas más
        sueltas y suelo de hierba seca a manchas (no mezclando colores).
     9. Desiertos nuevos en `DESIERTOS`: Omán/Emiratos/este de Yemen y Cuerno
        de África (salían estepa verde y selva). Y `SABANAS` (cajas que pasan
        a estepa/sabana seca dentro de la franja ecuatorial, que por latitud
        sale selva): de momento África oriental (Kenia, Tanzania, Uganda).
     10. Con una ficha de país abierta, `.hero-banderas` sube a z-index 4 (una
        nave que pasaba por delante la tapaba).
   - **Problema para el futuro (lo señaló el usuario): hemisferio sur.** El
     hero enseña sobre todo el hemisferio norte (Polo Norte arriba, inclinación
     de 20° y el planeta más grande que la pantalla: se ve de ~20°N hacia
     arriba). Un país del sur (Australia, Argentina…) nunca pasaría por la zona
     visible y su chapa/ficha no se podría usar. Pidió pensarlo **cuando se
     retome el modo noche**. Ideas a valorar entonces: chapas del sur "ancladas"
     en el borde inferior visible cuando su país pasa por debajo; un índice de
     países aparte (lista con banderas) que abra la misma ficha; que el planeta
     cabecee hacia el sur un momento al elegir un país; o encuadre distinto.
   - **Integrado en la portada (13-sep-2026, rama, sin merge)**: el código
     vive en `src/scripts/planeta.js` (lo usan la portada y el prototipo, que
     ahora solo es un banco de pruebas con botones de velocidad). `index.astro`
     lleva `<canvas class="hero-planet-canvas">` dentro de `.hero-planet` y lo
     monta en `astro:page-load` / desmonta en `astro:before-swap` (la web usa
     ClientRouter). Se para fuera de pantalla (IntersectionObserver), en modo
     oscuro (el canvas se oculta y se ve el sprite de noche de siempre), con la
     pestaña oculta y con el ratón sobre una nave (como el resto del hero). Con
     `prefers-reduced-motion`, quieto. Sin JS / mientras carga: fondo
     `planeta-quieto.png` (fotograma de giro 0, el mismo con el que arranca el
     canvas); se quita con `.planeta-listo` tras el primer dibujo. Sprite de día
     de 3,6 MB retirado de `public/`. Datos totales ~930 KB.
     Pendiente: verlo en Zen/Chrome de verdad (la extensión de Chrome se
     desconectó al integrarlo), móvil, y luego merge a `main`.
8. Al terminar del todo, borrar este archivo.
