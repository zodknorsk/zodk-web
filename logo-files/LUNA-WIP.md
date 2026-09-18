# Proyecto Luna — documento de traspaso

Rama: `moon-project` (creada desde `main` el 16-sep-2026). Primer boceto de
la cara visible hecho y aprobado: ver "Estado". Aparcado a propósito para retomarlo otro día, o con el
reinicio semanal de tokens. **Leer esto primero** al volver, antes de tocar
nada.

## La idea (contada por el usuario, 16-sep-2026)

En la portada de zodk.eu, al lado del planeta Tierra hay un icono de sol/luna
(`.hero-astro`, ver `HERO-WIP.md` y `CLAUDE.md`) que hoy es solo decorativo:
cambia de sol a luna según el tema claro/oscuro, pero no se puede pulsar.

La idea es que **pulsar sobre la Luna lleve a otra página** con un planeta
distinto: la Luna, en el mismo estilo pixel art que la Tierra del hero (mismo
enfoque de proyección, inclinación, resolución, sensación general), pero:

- **En vez de países/biomas/costas, hace falta relieve lunar realista**:
  cráteres grandes, montañas, mares lunares (los "maria", las manchas
  oscuras), tierras altas. Es un planeta sin agua ni vegetación, así que la
  paleta y la lógica de biomas de la Tierra no valen — hay que pensarlo de
  cero (probablemente un peinado de grises/albedo con sombreado por
  elevación real, más que "materiales" por bioma).
- **En vez de banderas de país, chapas en cada alunizaje**: sitios donde ha
  aterrizado algo humano — misiones tripuladas (Apolo) y sondas no
  tripuladas (soviéticas Luna, chinas Chang'e, indias Chandrayaan, privadas
  como SLIM/IM-1...). Cada chapa, igual que las banderas de país en la
  Tierra, despliega una ficha y enlaza a una entrada del blog sobre esa
  misión/alunizaje.
- **Rotación condicionada a los datos, no decidida todavía**: si todos los
  alunizajes que se acaban marcando caen en una sola cara (como pasa de
  hecho con casi todos los históricos, salvo alguna sonda a la cara oculta
  como Chang'e-4/6), el usuario prefiere que el planeta **no gire** (no
  tendría sentido mostrar una cara vacía). Si al final hay sitios repartidos
  por toda la esfera, que **gire igual que la Tierra**. Esto se decide
  cuando se tenga la lista real de sitios a marcar, no antes.

## Qué se puede reutilizar de la Tierra (`src/scripts/planeta.js` +
`logo-files/generar-planeta-hero.py`)

- El propio motor de canvas: proyección ortográfica con inclinación, giro
  continuo (o parado, ver arriba), luz/sombra por producto escalar con el
  sol, mipmaps de longitud para que no parpadeen los detalles finos cerca
  del polo. Todo esto es geometría pura, no depende de que sea la Tierra.
- El patrón de "chapa + ficha al pasar el ratón" de las banderas
  (`BANDERAS`/`CHAPAS` en el generador, `PAISES` en `src/data/paises.ts`,
  `.hero-bandera` en `index.astro`): para la Luna sería un
  `src/data/alunizajes.ts` (o similar) con sitio, misión, fecha, lat/lon,
  tripulada o no, y las etiquetas de artículo — un registro por alunizaje en
  vez de por país.
- El patrón de "relieve real desde un modelo de elevación" que ya existe
  para las montañas de la Tierra (`logo-files/etopo.tiff` + `elev.py` /
  `elevacion.py`, sombreado con `MTN_CONTRAST` etc.): para la Luna hace falta
  el equivalente lunar de ETOPO. Candidato natural: el modelo de elevación
  LOLA de la sonda LRO (NASA), de dominio público, servido por el equipo de
  Astrogeología del USGS — hay que buscar la URL/resolución concreta cuando
  se retome esto (no se ha descargado nada todavía). Para el albedo/textura
  de fondo (distinguir *maria* oscuros de tierras altas claras) el mosaico
  de la cámara WAC de la propia LRO es la referencia obvia, también público.
- El patrón de máscara rasterizada por capas (`mapa_tierra.py`,
  `rasterizar.py`: fuente pesada sin trackear → módulo Python pequeño
  trackeado) es el mismo patrón a seguir para lo que sea que se rasterice de
  la Luna (relieve, límites de *mare*, cráteres con nombre...).

## Lo que es nuevo de verdad (no hay equivalente en la Tierra)

- Fuente de datos de relieve/textura lunar (ver arriba: LOLA + WAC, por
  confirmar al retomarlo).
- Lógica de "material" del terreno lunar: probablemente algo mucho más
  simple que los biomas de la Tierra (no hay clima) — quizá solo "*mare*"
  vs "tierras altas" por elevación/albedo, más el sombreado de cráteres
  grandes por relieve. Sin costas, sin desiertos, sin nubes (la Luna no
  tiene atmósfera — ojo, esto también afecta a si tiene sentido dibujar
  "cielo"/limbo con el mismo brillo de atmósfera que la Tierra, o quitarlo).
- Base de datos de alunizajes: hay que compilarla a mano (son pocos, no hace
  falta un dataset enorme como Natural Earth) — sitio, coordenadas, misión,
  fecha, agencia/país, tripulada o no, y a qué entrada del blog enlaza.
- Decisión de si el planeta gira o no (pendiente de esa lista, ver arriba).
- Una ruta/página nueva en Astro para este segundo planeta, y hacer que el
  icono de la Luna en la portada de la Tierra sea un enlace de verdad.

## Estado

### Decisión de diseño (16-sep-2026)

Los alunizajes/chapas se aparcan: primero se diseña la Luna. **Dos caras
FIJAS** (no gira): la **cara visible**, luminosa, con la historia de
alunizajes, y un botón que lleve a la **cara oculta**, más oscura (luz rasante,
media luz; ojo, la "cara oscura" es un mito, es decisión de estilo), con las
naves chinas y futuras. Idea para el cambio: la Luna gira media vuelta en 1-2 s
al pulsar el botón y la luz cambia a la vez. Protagonista posible de la cara
oculta: la cuenca Polo Sur-Aitken (ahí alunizaron Chang'e 4 y 6).

### Cara visible — PRIMER BOCETO APROBADO (16-sep-2026)

- Generador: `logo-files/generar-luna.py` (Python estándar, ~9 s). Imagen
  estática 600x600 (radio 292,5, como la Tierra), norte arriba, de frente.
  `python3 generar-luna.py --derecha --zoom` saca la aprobada:
  `prototipo-luna/luna-visible-derecha.png` (+ zoom x4 del centro).
- Banco de pruebas: `logo-files/prototipo-luna/` (servir la raíz del repo con
  `python3 -m http.server 4400`, abrir `/logo-files/prototipo-luna/`).
- Fuentes (NASA, dominio público, en `logo-files/luna-fuentes/`, gitignored,
  ~70 MB; los `curl` están en el docstring del script): relieve LOLA
  `ldem_16.img` (16 px/grado) y mosaico de color LROC WAC 4k del CGI Moon Kit
  (SVS 4720), pasado a BMP con `sips`.
- Aprobado por el usuario:
  - **Luz por la derecha** (`LADO` = 1), fase 38°, subida 14°. Por la
    izquierda la sombra tapaba el Mar de las Crisis.
  - **Penumbra original** (`TERM_A/B` = -0,01/0,30). Se probó una más corta
    (0,15) y la descartó: "la de antes está bien".
  - Colores por albedo en 6 materiales (`ALBEDO`: mares gris algo frío,
    tierras altas gris algo cálido, rayos claros) con las rampas de la Tierra.
  - Cráteres: relieve con exageración 3,2, sombras proyectadas cerca del
    terminador y **limpieza** (`DERIV_DEG` 0,22, `ALB_BLUR` 3, `LIMPIAR` 2:
    sin ella salía grano de foto).
  - **Relieve rasante** (`RELIEVE_ELEV_MAX` = 30°): con el sol alto los
    cráteres del centro salían blandos, de un solo tono (82 % de píxeles sin
    escalón de relieve). Para sombrear el relieve el sol no sube de 30°
    (mismo azimut); luz general y sombras proyectadas siguen con el sol real.
- En `prototipo-luna/` quedan también descartes para comparar:
  `luna-visible.png` (luz por la izquierda) y `…-penumbra-corta.png`, ambos
  ANTERIORES al relieve rasante.

### Cara visible — mares retocados: V2 APROBADA (17-sep-2026)

Al usuario la visible le parecía "de poca resolución" (la oculta menos, por
los cráteres). Causa: en la visible los mares se amontonan en albedo 80-89 y
el corte de 76 los partía en manchas de dos grises casi iguales; y los mares,
llanos, no tenían relieve que diera bordes nítidos.
- **Aprobada V2**: `--derecha --valles --relieve-mares 2.5`
  (`luna-visible-derecha-valles-rm2.5.png`). `--valles` = umbrales de albedo
  en los valles del histograma (`ALBEDO_VALLE`: un solo "mar" de 66 a 104);
  `--relieve-mares 2.5` = exageración del relieve ×2,5 donde el albedo es de
  mar (rampa `MARES_A/B` 100-120): salen las arrugas de lava.
- Descartes: V1 (solo `--valles`), V2a (relieve ×1,8: menos grano pero
  arrugas flojas), V2b (×2,5 con `--suave-mares 2`, derivada más larga en los
  mares: más suave; el usuario prefirió la V2 tal cual, con su grano), y
  `--limpiar 4` (no cambia casi nada: el grano va en grupitos, no sueltos).
- Pendiente: pasar estos ajustes a `CARAS`/`--canvas` (el mapa del giro usa
  un solo juego de umbrales y relieve para las dos caras).

### Cara oculta — PRIMER BOCETO APROBADO (17-sep-2026)

- `python3 generar-luna.py --oculta --sur --zoom` saca la aprobada:
  `prototipo-luna/luna-oculta-sur-f65.png` (**O2** en el banco de pruebas).
- Mismo generador, paleta, limpieza y relieve que la cara visible; solo
  cambian encuadre y luz:
  - **Encuadre**: de espaldas a la Tierra (`LON0` = 180) e **inclinada 30° al
    sur** (`LAT0` = -30), para que la cuenca Polo Sur-Aitken (~53° S, 191° E) y
    los sitios de Chang'e 4 y 6 queden en el centro-abajo del disco.
  - **Luz por la derecha, fase 65°** (`--fase`): el tercio izquierdo en
    sombra y los cráteres junto al terminador en luz rasante.
- Descartes: fase 90° ("media luz", O3 en el banco: la mitad izquierda negra y
  Chang'e 4 casi en sombra), 115° (casi todo a oscuras, ni se enseñó) y de
  frente sin inclinar (O1: Aitken queda pegada al borde de abajo).
- Aún no es "más oscura" que la visible (la cara oculta es casi toda tierras
  altas, claras). Si se quiere apagar: brillo general o paleta.
- El botón "marcas" del banco de pruebas dibuja el contorno aproximado de
  Aitken y los dos Chang'e encima (solo referencia, no es parte del dibujo).
- Corregido de paso: el eje de giro en vista tenía el signo de `LAT0` al
  revés (`az`); con `LAT0` = 0 (cara visible) no cambiaba nada.

### Cara oculta oscura — D3 APROBADA (17-sep-2026)

- `--oculta --sur --valles --relieve-mares 2.5 --exposicion 0.6 --frio 0.5`
  (`luna-oculta-sur-f65-valles-rm2.5-e0.6-frio0.5.png`): luz al 60 % y tono
  frío suave. Lleva también los mares de la V2 (el mapa del giro es uno solo).
- Descartes: D1 luz 70 % (tras el giro apenas se nota el cambio), D2 50 %
  (plana y sucia), D4 60 % con frío 1 (demasiado azul, parece un filtro).
  El usuario dudó y pidió criterio: se eligió D3.

### Página /luna y vuelo desde la Tierra (17-sep-2026, a revisar por el usuario)

- **`src/pages/luna.astro`** (ruta `/luna`): mismo fondo de estrellas que la
  portada (`PageLayout hero`), la Luna centrada (`.luna-disco`, tamaño
  `--luna-tam` en `global.css`) y un **botón PLACEHOLDER** abajo
  (`.luna-cambio`, texto "cara oculta"/"cara visible") que da la media vuelta.
  Sin JS se ve la cara visible (fondo del div).
- **Datos en `public/luna/`** (`generar-luna.py --canvas public/luna/`, con
  `CARAS` = V2 y D3). Al regenerar: subir `LUNA_V` en `src/scripts/luna.js` y
  el `?v=` de `luna-visible.png` en `global.css` (`.luna-disco`).
  - Durante el giro cambian a la vez vista, fase, exposición (1 → 0,6) y tono
    frío (0 → 0,5; LUT con `FRIO_PASOS` = 5 tonos intermedios).
  - **Giro rehecho (17-sep-2026, tarde)**: antes giraba e inclinaba a la vez
    (bamboleo), en 1,6 s, y la luz se apagaba a mitad. Ahora UNA rotación de
    verdad de una orientación a la otra (`trayecto()`: eje y ángulo de
    MB·MAᵀ; de la visible a la oculta, eje casi vertical inclinado 15° hacia
    quien mira), en **2,8 s** con arranque y frenada en seno ("un pelín más
    rápido" que 3,2). Fase, exposición y tono frío cambian **a la vez que
    gira** (se probó que la exposición llegara al final, como una cámara que
    se adapta; el usuario prefiere que se oscurezca según rota).
  - **Gira siempre hacia el mismo lado**, a la ida y a la vuelta: la
    superficie se mueve hacia la DERECHA (`SENTIDO` = -1 en `luna.js`; lon0
    siempre decrece). Pedido del usuario; se probó antes hacia la izquierda y
    era "al revés".
  - Mapa con normales en 64 niveles (`NORMAL_NIVELES`): 1,5 MB (antes 2,3).
    Se baja en segundo plano tras enseñar la cara; si se pulsa antes, el giro
    espera.
- **Vuelo**: en la portada, de noche, un enlace `.hero-luna-enlace` sobre la
  luna de arriba a la izquierda (el sol no enlaza). Al pulsar (`montarViaje()`
  en `index.astro`), la cara visible crece desde el disco del icono hasta su
  sitio en `/luna` en 2,2 s mientras la Tierra baja, encoge y se apaga (acaba
  al 85 % del tiempo) y el título, naves y demás se apagan; al terminar,
  `navigate("/luna")` (ClientRouter). La Luna de `/luna` arranca con la misma
  imagen en el mismo sitio. Las estrellas no se mueven (así casan con las de
  `/luna`). Siempre aterriza en la cara visible. Con reduced-motion, directo.
- **Vuelo rehecho (17-sep-2026, tarde)**, en `src/scripts/viaje-luna.js`
  (lo usa `index.astro`; banco `logo-files/prototipo-vuelo/` con botones para
  combinar variantes y duración). Cámara simulada: avanza hasta la Luna con
  perspectiva (tamaño con 1/distancia: casi no crece al principio y se echa
  encima al final) y en el primer 60 % gira hacia ella (la Luna va al centro,
  las estrellas se desplazan y `/luna` las coloca igual al aterrizar).
  - Idea del usuario: "viajar a la Luna es ampliarla cada vez más hasta que
    aparece el dibujo original".
  - **Elegido: Tierra "encima"** (como si pasáramos rozándola: crece ×1,5 y
    sale rápido por abajo, del todo) **+ 6 s** ("el sweet spot"; 3,4 era
    rápido) **+ píxeles "directo"**: el dibujo HD desde el principio (de
    pequeño se reduce suavizado, no pixelado, que titilaba) y el icono pixel
    art se funde con él en el primer 40 % del vuelo (`FUNDIDO_HASTA`; con 0,2 y 0,32
    "pasaba demasiado rápido de pixel a HD").
  - Probado y DESCARTADO "gradual": versiones del dibujo de 32 a 585 px con
    la paleta del dibujo, afinándose a lo largo del vuelo. "Se ve muy raro,
    como que va pasando por fases": quiere HD desde el principio, solo un
    fundido más largo.
  - La capa de la Luna va DETRÁS de la Tierra (la Tierra está más cerca): se
    veía la Luna por encima cuando se cruzaban.
  - Descartes (siguen en el banco): Tierra "cae" (encoge y cae; primera
    versión), "a una esquina" (quitada: "nononono"), "giro", "aleja", "apaga";
    píxeles "etapas" (icono → 64/128/256 px), "icono", "constante". Primera
    versión aún más plana (zoom 2D uniforme) y otra en la que la cámara
    atravesaba la Tierra (en la escena 3D la Tierra está entre la cámara y la
    Luna: por eso la Tierra va aparte).
- **Vuelta a la Tierra (17-sep-2026)**: botón PLACEHOLDER "volver a la
  Tierra" abajo a la izquierda de `/luna` (el de cambio de cara pasó abajo a
  la derecha: en el centro lo tapaba la barra de Astro en desarrollo). Es el
  mismo vuelo hacia atrás (`volarALuna({ inverso: true })`): la Luna (la cara
  que se esté viendo) se aleja hacia arriba a la izquierda y se funde con el
  icono (de día, se apaga: allí está el sol), la Tierra sube desde abajo y
  las estrellas giran de vuelta; al llegar, `navigate("/")` y la portada
  coloca sus estrellas donde quedaron. Para medir dónde acaban icono y
  Tierra, `/luna` añade al hero un `.hero-astro` y un `.hero-planet` con las
  clases de la portada (misma geometría y la Tierra quieta del tema). La fase
  de hoy del icono sale de `faseLunaHoy()` (viaje-luna.js; la usa también la
  portada).
  - **La vuelta se queda así** (Tierra "encima" al revés: sube desde abajo).
    Se probaron y DESCARTARON dos ideas de Tierra "escondida detrás de la
    Luna": "detras" (la Luna encogía en su sitio y la Tierra aparecía: "¿qué
    mierda es esta?") y "rodea" (la Luna se apartaba grande a su esquina
    destapando la Tierra, que luego se acercaba). Tras la segunda: "Nada, deja
    esto. Vuelve a lo que me hiciste antes, que me gustó." No reintentar.
- **Detalles de la web hechos en esta rama (17-sep-2026)** (no son solo de la
  Luna; se publican con el merge):
  - Botón de tema con dos modelos, vacío y relleno: se rellena con
    transición al pasar el ratón o con foco, y al pulsar el icono nuevo sale
    relleno y se vacía (`.tema-icono`, `.tema-pulsado`). Sobre el hero, al
    pasar el ratón, en blanco (en tema claro se pintaba negro sobre negro).
  - Estrellas de noche: 170 por baldosa (antes 95; `generar-estrellas.py`,
    `?v=2` en el CSS); al pasar a noche con el botón se encienden en 3 s
    (`html.estrellas-entrando`). En `/luna`, siempre las de noche.
- **Pruebas en Zen (17-sep-2026)**: vuelo y animaciones bien, pero la media
  vuelta iba a trompicones y la Luna se veía "con menos detalle", sobre todo
  a pantalla completa. Causas y arreglos en `luna.js`:
  - Zen/Firefox suaviza el canvas ampliado por CSS aunque lleve
    `image-rendering: pixelated`. Ahora el lienzo va al tamaño real en
    pantalla (píxeles de dispositivo, `ajusta()` con ResizeObserver) y la Luna
    de 600 px se amplía al dibujarla sin suavizado (`vuelca()`).
  - Cálculo del giro: 20-22 ms por fotograma en Zen (12 en Chrome). Con tablas
    (brillo del terminador, fila del mapa y mipmap, coseno de la latitud,
    escalón de relieve por tabla directa en vez de `Math.log`, que era lo más
    caro en Firefox), niveles de mipmap en arrays planos y `atan2` aproximado:
    7-9 ms en Zen y 7 en Chrome. Ojo: el escalón de relieve con un BUCLE de
    umbrales era más lento que el log.
  - El banco `prototipo-luna/canvas.html?medir` mide solo al cargar (para
    navegadores que no se pueden manejar desde fuera).
  - **La Tierra de la portada (`planeta.js`) tenía el mismo problema** en Zen
    y lleva el mismo arreglo: se pinta en un lienzo de arte aparte (600 x 585)
    y se vuelca entero y sin suavizado a un canvas del tamaño real en pantalla
    (tope 3000 px de ancho); la aurora igual. Se probó ampliar solo por
    factores enteros: con la ventana estrecha (menos de ×2) seguía suavizada.
    Comparado en Zen con la misma ventana y el mismo giro: antes bordes
    difuminados, después bloques nítidos.
  - Comprobado con el usuario: con esto **en Zen no se calienta** (era la duda,
    porque el canvas de la Tierra pasa a ser bastante más grande).
- Pendiente: que el usuario lo pruebe (Chrome, Zen, móvil); dibujo definitivo
  del botón; volver a la Tierra desde `/luna` (hoy solo con el logo/cabecera).

### Chapas de alunizaje — BANCO DE PRUEBAS (17-sep-2026, noche)

Hecho en `prototipo-luna/chapas.html` (banco aparte: **no se ha tocado
`luna.astro` ni `luna.js`**, decisión del usuario: "primero en el banco de
pruebas"). Servir la raíz del repo y abrir
`/logo-files/prototipo-luna/chapas.html`.

- **Qué se marca**: los 20 alunizajes reales de la bóveda
  (`02 - Temas/moon-project/` en boveda-osint: 6 Apolo, 6 Luna soviéticas, 4
  Chang'e, Chandrayaan-3, SLIM, IM-1 y Blue Ghost). En el banco están cargadas
  las 16 de EE. UU./Rusia/China. **Los fracasos se quedan fuera** (decisión del
  usuario): Chandrayaan-2, Peregrine, IM-2 y Beresheet no alunizaron. Se
  descartó de paso la idea previa de "éxitos en color, fracasos en blanco y
  negro": ya no hay fracasos que pintar.
- **Dibujo de la chapa: bandera del país**, en el mismo píxel art que la
  Tierra (filas de 11x7 + contorno de 1px, como `BANDERAS`/`_chapa()` en
  `generar-planeta-hero.py`). La de EE. UU. es literalmente la de la Tierra;
  Rusia, China, India y Japón son nuevas. **Aprobadas todas el 17-sep-2026**
  ("las banderas me gustan, go"); se revisan en `prototipo-luna/banderas.html`
  (cada una grande y al tamaño real). Ojo con China: el primer intento repartía
  las estrellas por toda la tela y se rehizo (estrella grande de 2x2 y las
  cuatro pequeñas en arco, compactas arriba a la izquierda).
- **Ficha al pasar el ratón**: las clases del sitio tal cual
  (`.craft-dossier`/`.craft-linea`/`.craft-specs`), copiadas al banco porque es
  HTML suelto. Nuevo respecto a la Tierra: lleva **foto de la misión**. El
  usuario eligió el **boceto A (con foto)**; la foto va en recorte **cuadrado**
  (`aspect-ratio: 1/1`), porque con la tira apaisada de la primera versión
  Aldrin salía cortado por la mitad. El boceto B (solo texto) sigue en el banco
  con un botón, por si acaso.
- **Sin enlace todavía**: decisión del usuario, las entradas del blog se irán
  escribiendo poco a poco. El hueco del "leer más" queda para entonces.
- **Filtro por país**: columna de banderas a la izquierda, en blanco y negro
  (`filter: grayscale(1)`). Al clicar una se pone a color y aparecen sus
  chapas; es **acumulativo** (EE. UU. + Rusia = las dos a la vez) y funciona
  como **interruptor** (clic otra vez y se apaga). Solo se pintan las chapas de
  **la cara que se está viendo** (decisión del usuario): si se activa China
  mirando la visible, salen Chang'e 3 y 5, y Chang'e 4 y 6 aparecerán al girar
  a la oculta, sin girar sola la Luna.
- **Colocación**: `proyecta()` en el banco es la misma cuenta de
  `orientacion()` en `luna.js`, generalizada con `lon0` (el `proyecta` del
  `index.html` tenía 180 fijo porque solo servía para revisar la oculta). La
  chapa se coloca restando medio ancho/alto **en %**, no en px, para que siga
  bien cuando el disco se amplía.
- La columna ocupa una franja a la izquierda (`--franja`) y la Luna se centra
  en lo que queda: antes, con la ventana estrecha, la columna tapaba la chapa
  de Luna 9.

### Cuánto se estorban las chapas entre sí (cuentas del 17-sep-2026)

Con las coordenadas reales y esta proyección (chapa de 13x9 px del lienzo de
600, como `.hero-bandera`):

- La mayoría van sobradas, a 60 px o más unas de otras.
- **El polo sur es el problema**: Chandrayaan-3 e IM-1 caen a 13 y 4 px del
  borde del disco, aplastadas contra el limbo, y a 56 px entre ellas. Con los
  fracasos dentro era peor (IM-2 a 0,9 px del borde y a 12 px de IM-1: se
  solapaban). **Candidato a marcarse como una sola zona destacada** (el hielo
  del polo sur) en vez de chapas sueltas.
- Cerca pero manejable: Luna 16 y Luna 20 (22 px; son vecinas de verdad, a
  127 km) y Apolo 17 con Luna 21 (28 px). No se solapan, pero sus fichas sí se
  pisarían si no se desplazan.
- Chang'e 4 y 6, en la oculta, van a 105 px y bien dentro del disco.

### Luz cenicienta del lado de noche: NOCHE 0,07 -> 0,16 (17-sep-2026)

Al poner la chapa de **Luna 9** (7° N, 64° O), que cae pasado el terminador, el
usuario vio que "parecía que estaba flotando". No era un fallo de posición: con
`NOCHE = 0,07` el terreno sin sol se pintaba en **(7,6,8)** y el fondo del
espacio es **(5,6,10)** — el mismo color, así que no se veía la Luna debajo.

- Se probó antes un **halo** alrededor del disco (idea del usuario) y **lo
  descartó**: "el halo no me ha gustado nada, prefiero sin halo que con halo".
  Además solo habría servido para chapas justo en el borde, y Luna 9 está
  bastante hacia dentro.
- `generar-luna.py` tiene ahora **`--noche`** (solo color: no rehace la pasada
  lenta). Comparación de 0,07 / 0,12 / 0,16 / 0,22 con la chapa encima en
  `prototipo-luna/noche.html`. **Elegido 0,16** (terreno en (15,14,17): se ven
  los mares y sigue leyéndose como noche), y es ya el valor por defecto.
- Aplicado a la página real: `--canvas public/luna/` regenerado (las dos caras,
  el mapa, la LUT y `luna-datos.json`, que lleva NOCHE y por tanto el giro en
  tiempo real también cambia), con `LUNA_V` a **3** en `luna.js` y el `?v=3` de
  `.luna-disco` en `global.css`. La cara oculta también se aclara en su lado de
  noche: es el mismo NOCHE por 0,6 de exposición.

### Chapas en /luna de verdad (18-sep-2026, madrugada) — HECHO

El banco ya está llevado a la página real. Lo que hay ahora:

- **`src/data/alunizajes.ts`**: los 20 alunizajes (nombre, país, año, lat/lon,
  foto y texto) y los cinco países con su bandera en pixel art (filas de 11x7 +
  paleta, mismo formato que `BANDERAS` en `generar-planeta-hero.py`), más
  `svgBandera()`. Añadir una misión = una línea ahí y su foto en
  `public/alunizajes/`.
- **`luna.js`**: `sitio(lat, lon, cara?)` devuelve dónde cae un punto en la
  cara que se ve (píxeles del lienzo de 600, tanto por uno y `vis`). La
  geometría no se repite fuera del motor. Ojo: las caras vienen en
  `luna-datos.json` bajo la clave **`caras`** (minúscula).
- **`luna.astro`**: capa `.luna-chapas` y columna `.luna-paises`, con las
  clases reales de `global.css` (`.craft-dossier`, `.craft-linea`,
  `.craft-specs`), no las copias del banco.
  - Mientras la Luna gira, las chapas se esconden (`alEmpezar`) y al terminar
    se recolocan en la cara nueva (`alTerminar`), así que Chang'e 4 y 6
    aparecen solas al pasar a la oculta.
  - Al volver a la Tierra, la capa y la columna van en la lista de lo que se
    apaga con el vuelo: si no, se quedaban flotando mientras la Luna se aleja.
  - En táctil no se pintan (`@media (hover: none)`), como las banderas de país
    de la portada: sin ratón no hay ficha que abrir.
- **La columna** (revisada por el usuario la misma noche): bandera de pixel
  art —la misma chapa que va sobre la Luna, no el emoji— con el **nombre del
  país al lado, siempre visible**. En gris cuando está apagada, a color al
  encenderla, y el nombre en dorado. Se probó la versión estrecha con el
  nombre solo al pasar el ratón y **la descartó**: quería ver los nombres.
  Margen izquierdo de `max(2rem, 5vw)`.

Comprobado en `/luna` con el servidor de desarrollo: los cinco países encienden
y apagan, la ficha sale con su foto y se coloca al lado que quepa, el giro
lleva bien las chapas de una cara a otra y la vuelta a la Tierra las apaga.

### PRÓXIMA SESIÓN

Lo gordo está hecho. Lo que queda, por orden de lo que más se nota:

1. **Enlace a los artículos**: hoy la ficha no enlaza a ningún sitio (decisión
   del usuario: las entradas del blog se irán escribiendo poco a poco). Cuando
   haya alguna, añadir el enlace a la ficha. Las notas de la bóveda están en
   `02 - Temas/moon-project/` (boveda-osint), una por alunizaje.
2. **El polo sur**: Chandrayaan-3 e IM-1 están tan cerca del polo que se ven
   desde LAS DOS caras y salen aplastados contra el borde de abajo. Sin
   decidir: agruparlos como una sola "zona del polo sur" (el hielo) o dejarlos
   como están. Ver las cuentas en "Cuánto se estorban las chapas entre sí".
3. **Ventana estrecha**: con ~750 px de ancho la columna pisa el borde
   izquierdo de la Luna (ahí el disco ocupa el 90 % del ancho y no queda hueco
   al lado). Habría que bajarla o achicarla solo en pantallas estrechas.
4. **Probarlo en Zen y en móvil**, que hasta ahora solo se ha visto en Chrome.
5. **Dibujo definitivo de los botones** de cambio de cara y volver a la Tierra
   (siguen siendo los PLACEHOLDER de siempre).
6. Pendientes viejos que siguen: el mapa del giro pesa 1,5 MB; y las fotos de
   las misiones soviéticas, SLIM e IM-1 son imágenes orbitales del LRO (el
   punto de alunizaje visto desde arriba), menos vistosas que las de superficie
   de los Apolo — si aparecen mejores, se cambian.

### Por dónde se fue pasando (histórico, todo hecho)

1. ~~Cara oculta~~ (hecho, ver arriba).
2. ~~Media vuelta en `<canvas>`~~ (hecho, 17-sep-2026; el usuario eligió
   canvas frente a dos PNG con fundido). Motor en `src/scripts/luna.js`, banco
   de pruebas `prototipo-luna/canvas.html` (botón "girar"; en consola
   `luna.fotograma(0.5)` pinta un fotograma intermedio sin animar).
   - **En reposo se pinta el PNG aprobado** de cada cara, tal cual. Solo
     durante el giro (1,6 s, ease-in-out) se pinta en tiempo real: la vista va
     de (lat0 0, lon0 0, fase 38°) a (lat0 -30, lon0 180, fase 65°) interpolando
     los tres; luz siempre por la derecha. Con la Luna quieta no gasta CPU.
   - Datos: `python3 generar-luna.py --canvas prototipo-luna/canvas/` →
     `luna-mapa.png` (1440x720, 4 px/grado: R = material por albedo, G/B =
     normal del relieve ya exagerada), `luna-lut.png`, `luna-datos.json` y copia
     de las dos caras aprobadas. **El mapa pesa 2,3 MB**: aligerar antes de
     publicar (normales con menos niveles, WebP sin pérdida…).
   - En tiempo real es la misma luz que el generador (terminador, relieve
     rasante, autosombra, limpieza de 2 pasadas) salvo sombras proyectadas y
     supermuestreo; el último fotograma y el PNG casi no se distinguen, así que
     el cambio al PNG al acabar no se nota.
   - Mipmaps solo en longitud (como la Tierra): con pirámide 2x2 salían bloques
     en abanico alrededor del polo sur.
   - Rendimiento (Mac, Chrome): ~12 ms por fotograma tras calentar; el primero
     tarda ~45 ms, por eso se pinta uno en un rato libre al cargar. Falta
     probarlo en Zen y en móvil.
   - Con `prefers-reduced-motion` cambia de cara sin giro.
3. ~~Página nueva en Astro y enlace desde el icono de la Luna~~ (hecho, a
   revisar: ver "Página /luna y vuelo desde la Tierra").
4. ~~Chapas de alunizajes~~: primero en el banco de pruebas y luego en `/luna`
   de verdad (18-sep-2026). Ver "Chapas de alunizaje" y "Chapas en /luna de
   verdad" arriba.

## Candidatos a alunizaje/sonda (repaso del 16-sep-2026; DECIDIDO el 17-sep)

**Ya decidido**: entran los 20 que sí alunizaron, uno por nota en la bóveda
(`02 - Temas/moon-project/`), y quedan fuera los que se estrellaron o no
llegaron (Chandrayaan-2, Peregrine, IM-2 y Beresheet). Entran también Chang'e 4
y 6, así que **la Luna tiene las dos caras** (ya estaba montado el giro).
La lista de abajo se deja como repaso de dónde cae cada una.

- **Tripulados — Apolo (EE. UU., cara visible):** 11 (Mar de la Tranquilidad,
  1969, primer paso humano), 12, 14, 15, 16, 17 (1972, el último). El 13 no
  cuenta, no llegó a alunizar.
- **Programa soviético Luna (cara visible):** Luna 9 (1966, primer alunizaje
  suave de la historia), Luna 16/20/24 (retorno de muestras sin
  tripulación), Luna 17 y 21 (róvers Lunojod 1 y 2, primeros vehículos con
  ruedas en otro cuerpo celeste). Luna 2 fue un impacto deliberado, no un
  aterrizaje.
- **Surveyor (EE. UU., cara visible):** 1, 3, 5, 6, 7 — aterrizajes suaves de
  prueba antes de mandar gente.
- **China — Chang'e:** Chang'e 3 (2013, cara visible, róver Yutu);
  **Chang'e 4 (2019, cara OCULTA**, cráter Von Kármán, róver Yutu-2: primer
  alunizaje de la historia en la cara oculta); Chang'e 5 (2020, cara
  visible, retorno de muestras); **Chang'e 6 (2024, cara OCULTA**, primeras
  muestras traídas de la cara oculta).
- **India:** Chandrayaan-3 (2023, primer éxito indio, cerca del polo sur
  lunar — zona de interés por el hielo de agua). Chandrayaan-2 se estrelló
  en 2019 (candidato si se quieren incluir también fracasos).
- **Japón:** SLIM (2024, alunizaje de precisión, cráter Shioli, cara
  visible).
- **Privados (EE. UU.):** Intuitive Machines "Odysseus"/IM-1 (2024, primer
  alunizaje privado con éxito, cerca del polo sur, aunque acabó tumbado de
  lado) e IM-2 (2025); Firefly "Blue Ghost" (2025, éxito); Astrobotic
  Peregrine (2024, fallo, no llegó a posarse).
- **Israel:** Beresheet (2019, intento privado, fallo — se estrelló).

Pendiente: el usuario decide qué entra de esta lista antes de avanzar con el
código (rovers vs solo alunizajes, si se incluyen fracasos, polo sur como
zona destacada por el hielo...).
