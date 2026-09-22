# Proyecto Marte — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso (lo pidió el usuario el 21-sep-2026): qué está hecho, qué no, qué está
decidido y qué queda pendiente. Leyendo solo esto hay que poder retomarlo.

## Dónde estamos (22-sep-2026: `/marte`, Marte en la portada y el vuelo, commiteados; siguiente, el botón de volver)

**Rama `mars-project`**, creada desde `main` el 21-sep-2026 y **subida a
GitHub** el mismo día (`git push -u origin mars-project`). Nada fusionado ni
publicado: `main` y zodk.eu siguen como estaban.

### Hecho (todo commiteado y aprobado por el usuario)

1. **Estudio y Marte provisional** (`generar-marte.py`, relieve MOLA + color
   Viking, pixel art con el recorrido de la Luna), a 60 svh con el píxel de la
   Luna. Commit `5a99c5c`.
2. **Giro con la mano**, tipo globo (norte arriba). Primero con la barra
   espaciadora (`eafc8b6`); el usuario lo cambió a **clic y arrastrar, como
   Google Maps** (`de62b88`). Quieto no se repinta.
3. **Zoom con rueda y trackpad**, hacia el cursor al acercarse y hacia el
   centro al alejarse, **hasta ×6**, con el detalle creciendo:
   - Motor en **WebGL** (`src/scripts/marte-gl.js`): 0,3-0,6 ms por
     fotograma en Chrome. Zen y trackpad, probados por el usuario.
   - Pirámide de mapas: base de 4 px/grado + teselas de 8, 16 y 24 px/grado
     (`public/marte/n1..n3`), en un atlas de tamaño fijo en la GPU.
   - Commits `c8bc302` (×4) y `21d404b` (×6).
4. **Pulido del pixel art** (sin pasarse de realismo, pidió el usuario):
   - **Sombra menos oscura**: `NOCHE` 0,16 → 0,22 (`1e4641b`).
   - **Llanuras en dos tonos**: el pico de brillo partido en dos tonos casi
     iguales (`a907648`).
   - **Zonas oscuras en "chocolate suave"**: rechazó gris y gris azulado;
     prefiere los tonos reales (`105ff78`).
   - **Casquete norte**: se queda como estaba y la **vista inicial se inclina
     12,5° al norte** (se probó 25°: demasiado) (`3b31e39`).
   - **Grano en las llanuras a ×6**: se probaron tres arreglos y el usuario
     dijo "**No. Déjalo como estaba**". Sin cambios (ver punto 5 del pulido).
5. **Bancos de prueba** en `logo-files/prototipo-marte/`:
   - `zoom.html`: el de ahora, WebGL. Panel mínimo; las comparaciones, por la
     URL.
   - `canvas.html`: el motor de CPU.
   - `index.html`: los PNG del boceto.
   - `probar-en-node.mjs`: pruebas sin navegador.

### Hecho y commiteado el 22-sep-2026 (commit "Proyecto Marte: página /marte, Marte en la portada y el vuelo"; el usuario pidió el commit)

6. **Página `/marte`** (`src/pages/marte.astro` y el bloque "Proyecto Marte"
   de `global.css`), pedida el 21-sep-2026. Marte a pantalla completa sobre
   las estrellas, quieto, con la mano y el zoom de los bancos. **Sin
   título**: el "mars project" animado se hizo, se pulió y el usuario lo
   **quitó** el 22-sep-2026 (ver "El título: esquinas que se cierran",
   registro). Ver "Página /marte" abajo.
7. **Marte en la portada y el vuelo** (pedido el 21-sep-2026): Marte pequeño
   arriba a la derecha (de día y de noche; algo más pegado al borde que la
   luna, pedido el 22-sep-2026), enlace **`mars-project`** en la cabecera y
   **vuelo Tierra → Marte** con el motor del de la Luna, aterrizando en el
   disco de `/marte`. Ver "Marte en la portada y el vuelo" abajo.

Verlo todo: `npm run dev` y abrir `http://localhost:4321/` (pulsar Marte o
`mars-project`) o `http://localhost:4321/marte`.

### Lo que NO está en Git (ojo al cambiar de ordenador)

- **Las teselas** (`public/marte/n1/`, `n2/`, `n3/`, 38 MB): en `.gitignore`
  hasta que el pixel art sea definitivo (decisión del usuario). Solo están en
  el Mac.
- **Las fuentes** (`logo-files/marte-fuentes/`, ~1 GB: MOLA de 16 y 32
  px/grado y el mosaico Viking con sus reducciones a 8, 16 y 24).
- En otro ordenador hay que bajar las fuentes (los `curl`/`sips` están en el
  docstring de `generar-marte.py`) y regenerar: `cd logo-files && python3
  generar-marte.py --canvas ../public/marte/` (unos 4 min).
- Verlo: `python3 -m http.server 4400` en la raíz del repo y abrir
  `http://127.0.0.1:4400/logo-files/prototipo-marte/zoom.html`. Tras tocar
  `marte-gl.js`, recargar a fondo (Cmd+Mayús+R): Chrome guarda en caché el
  módulo.

### Pendiente (sin orden cerrado; lo decide el usuario)

- **Orden que marcó el usuario** (22-sep-2026): commit (hecho), **el botón
  de volver** de `/marte` a la Tierra (siguiente), **un Marte pequeño en
  `/luna`** con el vuelo Luna → Marte ("Vale. un marte pequeño si") y **el
  móvil, lo último**.
- **Duda abierta**: que Marte se vea de día y de noche se dio por bueno (era
  la recomendación; no lo dijo expresamente).
- **Volver de `/marte` a la Tierra**: no hay botón (solo el "atrás" del
  navegador). Lo natural es el de `/luna` ("volver a la Tierra", abajo a la
  derecha) con el mismo vuelo al revés. Propuesto, sin hacer.
- **Luna → Marte**: un Marte también en el cielo de `/luna` con el mismo
  vuelo. Propuesto para después del de la Tierra, sin hacer.
- **`/marte`**: sin menú HUD (aún no hay notas que enlazar).
- **Decisiones abiertas** (detalle en "Decisiones pendientes"):
  - ¿Marte gira solo? Se recomendó que empiece quieto con botón play/pausa.
  - Móvil y táctil.
- **Chapas de las misiones**: aplazadas hasta que se escriban las notas en la
  bóveda.
- **Sin WebGL2**: en `/marte` se queda Marte quieto (`marte-quieto.png`, el
  fondo mientras carga), sin mano ni zoom. Salió de paso con el vuelo; si el
  usuario prefiere el motor de CPU sin zoom, se cambia.
- **Antes de publicar**: commitear las teselas (con el pixel art ya
  definitivo) y fusionar `mars-project` en `main` (explicando el merge al
  usuario antes).

## Plan (pasos cortos, en un banco de pruebas `logo-files/prototipo-marte/`)

- [x] 1. Descargar las fuentes y sacar un **Marte provisional** con el mismo
      recorrido de `generar-luna.py` (sin pulir: el pixel art definitivo va
      después), a ~60 svh. Enseñar un render. **Hecho y aprobado el
      21-sep-2026** ("me gusta mucho el enfoque… vamos muy bien"). Ver
      "Marte provisional" abajo.
- [x] 2. **Giro con la barra espaciadora** (estilo Photoshop, ver
      decisiones). **Hecho y probado por el usuario el 21-sep-2026** (Zen
      bien). Ver "Giro con la barra espaciadora" abajo.
- [x] 3. **Zoom** con rueda y trackpad, hasta ×4, con la pirámide de mapas.
      **Hecho y probado por el usuario el 21-sep-2026** (Zen y trackpad
      bien). Ver "Zoom" abajo.
- [x] 3b. **Zoom hasta ×6** (pedido por el usuario tras probar el ×4). **Hecho
      el 21-sep-2026.** Ver "Zoom ×6" abajo.
- [ ] 4. Dos o tres **chapas de prueba** pegadas al terreno (Curiosity,
      Perseverance…). **Aplazado** por el usuario (21-sep-2026): se hará
      cuando se empiecen a escribir las notas de las misiones.
- [ ] Giro automático y botón, si se decide (ver pendientes).
- [x] 6. **Página `/marte`** con Marte, la mano, el zoom y el título "mars
      project" animado. **Hecho el 21-sep-2026, sin commitear**: falta que la
      vea el usuario. Ver "Página /marte" abajo.

- [x] 5. **Pulido del pixel art** (21-sep-2026), **sin pasarse de realismo**
      (ver decisiones). Hecho: sombra menos oscura, llanuras en dos tonos,
      zonas oscuras en chocolate suave y vista inicial a 12,5°. El casquete y
      el grano de las llanuras se quedan como estaban (decisión del usuario).

Después, sin orden cerrado: las misiones
(chapa, ficha y nota en la bóveda), el Marte pequeño que se pulsa para
viajar, y la publicación (merge en `main`).

## Decisiones tomadas

- **Girar con clic y arrastrar, como Google Maps** (usuario, 21-sep-2026). Al
  pasar por encima, mano abierta; al arrastrar, mano cerrada, y el planeta
  gira. Sustituye a la barra espaciadora (espacio + arrastrar, como la mano
  de Photoshop), que fue lo primero que eligió y probó. La cambió "antes de
  seguir": "en lugar de barra espaciadora, se pueda desplazar haciendo click?
  a lo google maps". La barra espaciadora ya no hace nada.
- **Zoom máximo ×6** (usuario, 21-sep-2026). Primero decidió ×4 "y vamos
  viendo". Tras probarlo preguntó por ×5-×6 ("tal vez un x8 es demasiado"),
  y con la recomendación de hacerlo con un nivel nuevo, no agrandando el de
  ×4: "vamos con el x6".
- **Pulido sin pasarse de realismo** (usuario, 21-sep-2026, al empezar el
  pulido): "me gusta bastante como está el pixel art ahora, tal vez si
  añadimos muchísimo realismo se pase de frenada (creo que en la luna se
  cometió ese fallo)". Retoques contenidos sobre lo que hay, siempre con la
  versión actual como referencia al comparar.
- Criterio propio, propuesto al usuario y sin objeciones (se cambia si lo
  pide):
  - Giro **tipo globo terráqueo**: norte siempre arriba y sin ladear;
    arrastrar a los lados cambia la longitud, arriba y abajo inclina hasta
    ver los polos.
  - El píxel no cambia de tamaño con el zoom: el planeta gana detalle.
  - Zoom **hacia el cursor** al acercarse, como en un mapa; al alejarse,
    hacia el centro y sin girar (como Google Earth; ver "Zoom").
  - Las chapas no crecen con el zoom.
  - La luz se queda fija respecto a quien mira, como en la Tierra.
  - El planeta, a ~60 svh (la Luna está a 80): se confirma con un render.
- **Vista inicial inclinada 12,5° al norte** (usuario, 21-sep-2026). Antes
  era 10°. Se probó 25° y le pareció demasiado: "la mitad por lo menos".
- **`/marte` sin título** (usuario, 22-sep-2026: "Quitamos el titulo mars
  project con la animacion cuando llega al planeta"). Antes se había hecho
  con las esquinas de visor del blog y cierre en dos puertas (opción C,
  pulida); se quitó del código y queda descrito en "El título: esquinas que
  se cierran".
- **Marte más a la derecha en la portada** (usuario, 22-sep-2026: "un poco
  más a la derecha"): `right: 3%` en vez del 5 % simétrico a la luna (solo
  en escritorio; en el móvil ya estaba al 3 %).
- **Marte en la portada** (usuario, 21-sep-2026): arriba a la derecha,
  "un poco más pequeña que la luna" (opción B), enlace `mars-project` en la
  cabecera y vuelo como el de la Luna. De día y de noche: la recomendación,
  sin objeción expresa.

## Decisiones pendientes

1. **¿Marte gira solo?** El usuario lo está pensando (21-sep-2026). Dos
   opciones que planteó él:
   - A: siempre quieto; solo gira cuando el usuario lo arrastra.
   - B: **empieza quieto** y un botón play/pausa, como el de la Tierra, lo
     arranca y lo para.

   Recomendación: **B**. Quieto por defecto es lo mejor para hacer zoom y
   leer chapas, y en reposo no gasta nada: el lienzo solo se repinta al
   tocarlo. El botón da la opción de verlo girar y es coherente con la
   Tierra. En los dos casos, al soltar el espacio el planeta **se queda donde
   se dejó**, y si el giro está encendido sigue girando desde ahí. La idea
   de "volver adonde estaba" deja de tener sentido y se descarta.

   No bloquea nada: los pasos 1 a 4 son iguales con A y con B, y el botón se
   añade al final.
2. **Móvil / táctil**: sin barra espaciadora, ¿cómo se gira y se hace zoom?
   (lo natural sería arrastrar con un dedo y pellizcar). El usuario lo deja
   por decidir (21-sep-2026).
3. **El Marte de la portada**: **decidido** el 21-sep-2026 ("Si, opción B,
   un poco más pequeña que la luna. Si, mars project en cabecera y que haga
   el viaje") y hecho (ver "Marte en la portada y el vuelo"). Opciones que se
   le dieron, con la recomendación:
   - **Sitio**: arriba a la derecha, simétrico al sol y la luna (que están
     arriba a la izquierda). Comprobado en capturas de día y de noche: esa
     esquina está libre (la cabecera va más al centro y la nave
     `fijo-arriba-der` queda debajo, en el 60 %). Recomendado.
   - **Tamaño**: A, como el icono de la luna (se lee y se pulsa bien, pero
     parece tan cerca como ella); **B, unos dos tercios (recomendado)**: más
     lejano y aún se ven el casquete y las zonas oscuras; C, un punto rojizo
     con brillo, como se ve de verdad a simple vista (difícil de ver, de
     pulsar y de reconocer).
   - **Cuándo se ve**: **de día y de noche (recomendado**: el fondo del hero
     es siempre espacio negro y así siempre se puede ir), o solo de noche
     como la luna.
   - **Enlace `mars-project` en la cabecera**, junto a `moon-project`, que
     hace el mismo vuelo (recomendado).
   - **Vuelo**: el de la Luna (`viaje-luna.js`) hacia la derecha: la cámara
     gira hacia Marte, la Tierra sale por la izquierda y Marte aterriza justo
     en el disco de `/marte`; al aterrizar entra el título. En `/marte`, un
     "volver a la Tierra" con el vuelo al revés, como en `/luna`.
   - **Luna → Marte**: necesita un Marte también en el cielo de `/luna`
     (arriba a la izquierda parece libre: el menú va a la derecha y la
     columna de países, centrada a la izquierda). Recomendado hacerlo
     después del de la Tierra, con el mismo vuelo.
   - Pixel art del icono: sacado de los datos de Marte (misma paleta), para
     que el vuelo aterrice en el mismo planeta. Antes de decidir tamaño, se
     le enseña una captura de la portada con Marte puesto.

## Marte provisional (paso 1, 21-sep-2026)

- **Generador**: `logo-files/generar-marte.py` (Python estándar, como el de
  la Luna; ~6 s por cara). Script nuevo: `generar-luna.py` no se ha tocado.
  `python3 generar-marte.py --zoom` saca las dos caras y un recorte ×4 del
  centro de cada una en `prototipo-marte/`.
- **Banco**: `logo-files/prototipo-marte/index.html`. Servir la raíz del repo
  (`python3 -m http.server 4400`) y abrir
  `http://127.0.0.1:4400/logo-files/prototipo-marte/`. Enseña el disco a 60
  svh sobre las estrellas de la portada, con botones de cara y de zoom ×4.
- **Fuentes descargadas** en `logo-files/marte-fuentes/` (824 MB, en
  `.gitignore`; los `curl` y el `sips` están en el docstring del script):
  MOLA de 16 px/grado y el mosaico Viking de 925 m, reducido con `sips` a
  8 px/grado (`viking_8.bmp`). Para el zoom ×4 habrá que reducirlo a 16.
- **Lo que hay en el dibujo**:
  - Disco de 450 px con radio de 219,4: a 60 svh, el píxel mide lo mismo que
    el de la Luna de `/luna`.
  - Dos caras de prueba (en giro "tipo globo", `CARAS`): **tharsis** (lat0
    10, lon0 -80: Olympus Mons, Tharsis, Valles Marineris) y **syrtis** (lat0
    10, lon0 105: Syrtis Major, Isidis, Utopia, Elysium, Hellas).
  - Luz desde arriba a la izquierda, como el sol de la Tierra de la portada:
    fase 40°, subida 20°. Terminador algo más suave que el de la Luna (Marte
    tiene atmósfera fina). Luz del lado sin sol, la de la Luna (0,16).
  - **Seis materiales por brillo del mosaico** más **hielo** en los polos.
    Hielo = claro y poco rojo, por encima de 50° de latitud. Cortes de brillo
    56/68/80/98/112, con el pico del histograma (84-95) entero en un solo
    material, porque en la Luna partirlo salía a manchas. Paleta de óxidos:
    de basalto oscuro a polvo claro.
  - Rampa de la Luna con un cambio: en la sombra, los óxidos giran hacia el
    granate (antes solo se oscurecían).
  - Relieve MOLA con exageración de 2,5, relieve rasante (el sol no sube de
    30° para sombrearlo), sombras proyectadas cerca del terminador (se buscan
    picos de hasta 22 km) y dos pasadas de limpieza.
- **Flojo, a propósito (es provisional)**: las llanuras grandes salen de un
  solo tono (Utopia, Tharsis); el casquete norte se ve pequeño; las regiones
  oscuras, algo pardas. Todo eso es del pulido del pixel art, que va después.
- **Pedido por el usuario para el pulido**: la sombra, **menos oscura** ("se
  podrá tocar luego"). Se refiere a la zona sin sol de la derecha (hoy
  `NOCHE` = 0,16, el valor de la Luna) y quizá al terminador.
- **Aviso para el motor**: este render lleva supermuestreo y sombras
  proyectadas, que el giro en tiempo real de la Luna no hace. Como Marte
  estará casi siempre quieto, en reposo se puede pintar un fotograma de
  calidad y dejar el rápido solo para mientras se arrastra o se hace zoom (la
  Luna ya hace eso mismo: gira "sucia" y acaba en el PNG limpio).
- Para revisar el banco no se pudo usar Chrome: la extensión no estaba
  conectada. Se revisaron los PNG directamente.

## Giro con la barra espaciadora (paso 2, 21-sep-2026)

- **Banco**: `prototipo-marte/canvas.html` (mismo servidor que el otro
  banco). Marte a 60 svh sobre las estrellas, en una ventana de pantalla
  completa. Con **espacio** pulsado sale la mano abierta; con **espacio +
  clic y arrastrar**, la mano cerrada y el planeta gira. Botones para saltar a
  Tharsis, Syrtis y los dos polos; abajo, la vista (lat0/lon0) y los ms del
  último fotograma. `?medir` mide al cargar (para Zen).
- **Motor**: `src/scripts/marte.js`.
  - `montarMarte(canvas, opciones)` pinta el planeta.
  - `montarMano(zona, marte)` hace la mano. Pone las clases `mano` y
    `agarrando` en la zona; el cursor lo pone el CSS de la página.
  - Datos en `public/marte/`, de `generar-marte.py --canvas ../public/marte/`
    (mapa de 1440 x 720, 641 KB). Al regenerar hay que subir `MARTE_V`; va
    por 2.
- **Cómo gira**:
  - Tipo globo: el norte siempre arriba. Arrastrar a los lados cambia la
    longitud del centro y arriba o abajo inclina hasta los polos (tope de
    ±90°).
  - Un radio de disco arrastrado es un radián de giro.
  - Al soltar se queda donde se dejó, sin inercia.
  - Se puede agarrar en todo el hero, no solo sobre el disco.
- **Coste** (medido en Node, que usa el motor de JavaScript de Chrome; sin
  contar el volcado a pantalla): **1,5 ms** por fotograma arrastrando a los
  lados (solo se desplaza el mapa, como la Tierra) y **6 ms** inclinando
  (rehace las tablas por píxel). Mientras se arrastra, como mucho 60
  fotogramas por segundo y sin limpieza. Al soltar se pinta uno limpio y ya
  no se gasta nada. **Falta medir en Zen.**
- **El lienzo ya ocupa toda la ventana**, con el disco centrado, pensando en
  el zoom: al acercarse, el disco se saldrá de la pantalla. El píxel de arte
  mide lo mismo que en la Luna. El volcado es a un múltiplo entero, ×3 como
  mucho, como en la Luna y la Tierra.
- **La barra espaciadora** no hace scroll ni pulsa el último botón clicado.
  Si se navega con el teclado (foco visible en un botón), el espacio sigue
  pulsando ese botón. Si la ventana pierde el foco con el espacio pulsado
  (Cmd+Tab), se da por soltado.
- **Arreglado de paso**: una raya oscura de polo a polo en los 180° O. La
  columna 0 del mosaico reducido con `sips` sale oscura (la mezcla con negro
  del borde); el generador usa la columna de al lado.
- **Aún sin hacer (a propósito)**:
  - Las sombras proyectadas y el supermuestreo del render de Python: el
    fotograma en reposo no los tiene. Por la geometría no hacían falta;
    comparar a ojo si se echan de menos.
  - Pantallas táctiles: no hay barra espaciadora. **Pendiente de decidir**
    (el usuario, 21-sep-2026: "Móvil se queda por decidir").
- **Prueba sin navegador**: `node logo-files/prototipo-marte/probar-en-node.mjs
  carpeta/` ejecuta `marte.js` con un canvas simulado y guarda en PNG varias
  vistas y dos fotogramas a mitad de arrastre, además de medir los ms. Sirvió
  para ver la raya de los 180° antes de enseñarlo.

### Cambio: clic y arrastrar en vez de barra espaciadora (21-sep-2026)

- `montarMano(zona, marte)` en `marte.js`, la misma para los dos motores.
  Pone en `zona` la clase `arrastrable` (cursor `grab` en el CSS de la
  página) y `agarrando` mientras se arrastra (`grabbing`).
- El giro no empieza hasta moverse **4 px**: un clic sin arrastrar sigue
  siendo un clic (lo necesitarán las chapas). Tras un arrastre de verdad se
  anula el clic que manda el navegador al soltar.
- No se agarra sobre botones, enlaces, campos ni lo que lleve
  `data-sin-arrastre` (el panel de los bancos lo lleva).
- Probado en Chrome: el arrastre gira, un clic sin moverse no cambia nada y
  los botones del panel funcionan igual.
- Se quitó todo lo de la barra espaciadora (anular el scroll, el foco
  visible, etc.). Queda en el historial de Git (commit `eafc8b6`) por si
  vuelve.

## Zoom (paso 3, 21-sep-2026)

- **Banco**: `prototipo-marte/zoom.html`, en el mismo servidor. Rueda o
  trackpad (pellizco o dos dedos) para el zoom, hasta ×4; espacio + arrastrar
  para girar, como en el paso 2. Tiene botones de sitios y de zoom ×1/×4.
  Abajo salen el zoom, la vista y cuántas teselas han llegado. `?medir` mide
  al cargar (para Zen).
- **Cambio de motor: WebGL** (`src/scripts/marte-gl.js`). Marte se pinta en
  la tarjeta gráfica. El motor de CPU (`marte.js`, el del paso 2) no daba
  abasto con el zoom:
  - A ×4 el disco llena la pantalla: unos 850.000 píxeles de arte por
    fotograma en vez de unos 150.000.
  - Medido en Node, que usa el motor de JavaScript de Chrome, y sin contar el
    volcado: **35 ms** por fotograma inclinando y 11 a los lados. La animación
    del zoom rehace todo en cada fotograma.
  - **En WebGL: 0,5-0,6 ms por fotograma** en Chrome, a ×1 y a ×4, con la GPU
    incluida.
  - Hace las mismas cuentas de luz, la misma paleta y la misma limpieza de
    píxeles sueltos, y ahora limpia **siempre**, también mientras se arrastra.
    A ×1 se ve igual que el motor de CPU.
  - Quieto no se repinta.
  - `marte.js` se queda por ahora, como respaldo si no hay WebGL2 (pendiente
    de decidir) y porque `montarMano` vive ahí y la usan los dos motores.
- **Cómo funciona el zoom**:
  - El píxel de arte mide siempre lo mismo y el radio del disco crece
    (`RADIUS × zoom`).
  - Hay una **pirámide de mapas**: la base de 4 px/grado (`marte-mapa.png`,
    entera) y dos niveles finos, **8 y 16 px/grado, en teselas** de 360 × 360
    celdas (`public/marte/n1/` = 32 teselas y 2,4 MB; `n2/` = 128 y 11 MB).
    Pesan menos de lo estimado en el estudio.
  - Cada nivel se calcula desde las fuentes a su resolución: al acercarse
    aparecen de verdad cráteres, fosas y cañones que la base no tiene.
  - Cada píxel lee del nivel cuya celda mide lo que él **en latitud**. Si su
    tesela no ha llegado, lee del nivel de debajo.
  - Solo se bajan las teselas que se ven, las más centrales primero, como
    mucho 6 a la vez. Una vista a ×4 baja unas 20-30 (~2-3 MB).
- **Controles**: la rueda cambia el zoom ×1,28 por golpe (100 px); el
  pellizco (rueda con `ctrlKey`) es más sensible. Hay suavizado de 0,07 s.
  Safari manda el pellizco como `gesture*`: está previsto, sin probar.
  **Pellizco y dos dedos sin probar con un trackpad de verdad**: las
  sensibilidades (`k` en `montarZoom`) se ajustan cuando lo pruebe el
  usuario.
- **Comprobado en Chrome** (21-sep-2026):
  - A ×4 se ven Noctis Labyrinthus, Kasei Valles, las calderas de Tharsis, las
    fosas de Nili junto a Jezero, **Gale con el Monte Sharp** en el centro y
    **las espirales del casquete norte** con Chasma Boreale.
- **Arreglado mientras se probaba**:
  - **Bloques en abanico en el polo** a ×4. El nivel se elegía también por la
    longitud, y cerca del polo bajaba a la base. Ahora se elige solo por la
    latitud. En longitud, las columnas se agrupan de 2 en 2, de 4 en 4… en una
    rejilla fija del mapa, así que no parpadea al girar.
  - **Alejar desde una esquina tumbaba el planeta** (de lat0 29° a 83°):
    mantener el punto bajo el ratón al encoger obliga a girar cada vez más.
    Ahora, al alejar, hacia el centro y sin girar.
- **Sin probar o pendiente**:
  - Safari (el pellizco llega por `gesture*`).
  - Sin WebGL2, el banco solo lo dice. Para la página de verdad: el motor de
    CPU sin zoom, o una imagen quieta.
  - Al pasar de un nivel a otro durante el zoom (×1,5 y ×3) el detalle
    "salta" de golpe. Es lo normal en un mapa por niveles. Si molesta, se
    puede mirar.
  - En las llanuras grandes se ven rayitas de norte a sur a ×4. Parecen
    fosas reales, pero podrían ser huellas de las órbitas del MOLA. Mirar al
    pulir.
  - **Teselas y Git** (decidido): 13 MB por versión, y cada regeneración
    (con el pulido del pixel art) sumaría otros 13 MB al historial. **No se
    commitean hasta que el pixel art sea el definitivo** (usuario,
    21-sep-2026: "me vale así"; esa semana no iba a usar el PC de Linux). En
    `.gitignore` (`public/marte/n*/`). Para tenerlas en otro ordenador hay
    que regenerarlas: 800 MB de fuentes y unos 90 s.
  - **Zen y trackpad: probados por el usuario**, bien.

## Zoom ×6 (21-sep-2026)

- **Por qué un nivel nuevo**: el nivel de 16 px/grado está hecho para ×4. Por
  encima solo se agrandarían las mismas celdas: sin detalle nuevo y con
  píxeles de tamaños distintos, que en pixel art se nota.
- **Nivel 3 de 24 px/grado, no de 32** (cambio sobre lo propuesto al usuario,
  que era 32 y ~44 MB):
  - A ×6 un píxel de arte son ~23 px/grado, así que 32 no enseñaría más
    detalle y pesaría el doble. Con 24 cada celda cae en un píxel.
  - Relieve del **MOLA de 32 px/grado** (`megt90n000fb.img`, un solo archivo
    global de 133 MB, mismo formato que el de 16; `curl` en el docstring).
  - Color del Viking reducido a 24 (`viking_24.bmp`).
  - Resultado: **288 teselas y 23 MB**, generadas en 2,4 min (`--canvas
    ../public/marte/ --niveles 3`). En total, n1 + n2 + n3 = 36 MB.
- **Cambios en el motor** (`marte-gl.js`):
  - **Niveles genéricos**: el shader recorre los niveles que traiga
    `marte-datos.json`. El corte entre dos niveles va a mitad de camino (en
    escala logarítmica) entre sus resoluciones: de 16 a 24 se pasa hacia
    ×5,1.
  - **Atlas de teselas de tamaño fijo en la GPU**: 12 × 12 huecos (37 MB), en
    vez de reservar el mapa entero de cada nivel (el de 24 serían 75 MB). Un
    índice dice en qué hueco está cada tesela. Si se llena, sale la que lleva
    más tiempo sin usarse, nunca una que esté a la vista.
  - Solo se piden las teselas que caben, las más centrales primero. Las de
    respaldo (nivel de debajo) solo mientras la fina no ha llegado. Con esto,
    aunque se vean más teselas que huecos, no entran y salen sin parar.
    Probado con un atlas de 6 × 6 mirando al polo a ×6: se llena y se queda
    quieto. `?atlas=N` en el banco cambia el tamaño para probarlo.
  - `MARTE_V` a 4: el navegador guardaba el `marte-datos.json` viejo, sin el
    nivel 3.
- **Comprobado en Chrome**:
  - Gale a ×6 con muchos más cráteres pequeños.
  - Jezero con las fosas de Nili muy marcadas.
  - **El casquete norte entero a ×6** con sus espirales y Chasma Boreale:
    84 teselas y 3,5 MB para ir de ×1 a ×6 mirando al polo.
  - 0,25 ms por fotograma.
- **Visto y apuntado para el pulido**: en las llanuras (p. ej. Elysium
  Planitia) a ×6 hay algo de grano. Son rayitas finas norte-sur, seguramente
  las órbitas del MOLA, y puntitos sueltos. Es sutil. Si molesta: suavizar el
  relieve del nivel 3 (derivada a 1,5 celdas) o el color.
- **Falta**: que lo pruebe el usuario (trackpad y Zen) y el commit.

## Pulido del pixel art (desde el 21-sep-2026)

### 1. La sombra menos oscura

- Es la zona sin sol (a la derecha) y el suelo de las sombras del relieve.
  Lo controla `NOCHE` en `generar-marte.py`, que pasa a `marte-datos.json`
  (hoy 0,16, el valor de la Luna). La LUT ya tiene esos tonos: cambiarlo no
  toca los mapas ni las teselas, solo el JSON.
- **Banco**: en `zoom.html`, fila "sombra": **0,16 (la de ahora)**, 0,22, 0,28
  y 0,35. Cambian al momento (`marte.ajustaLuz({ NOCHE })` recompila el
  shader).
- Visto en Chrome: con 0,16 el lado oscuro es casi negro granate; con 0,28 se
  lee el terreno y sigue pareciendo de noche; con 0,35 se ve bastante. El
  relieve no se ve en la zona sin sol, porque no hay luz que lo dibuje.
  Mejor compararlo a zoom ×1.
- Se recomendó 0,28 y **el usuario eligió 0,22** (21-sep-2026). Aplicado:
  `NOCHE` = 0,22 en el generador, base regenerada (`--canvas ../public/marte/
  --niveles 0`, que reescribe el JSON; mapa y LUT salen idénticos) y
  `MARTE_V` a 5. Los botones siguen en el banco para comparar.
- Los PNG del paso 1 (`marte-tharsis.png`, `marte-syrtis.png`) se quedan con
  0,16: son el registro del boceto provisional.

### 2. Las llanuras de un solo tono (21-sep-2026)

- **Por qué salen lisas**: casi la mitad del planeta cae en el pico de brillo
  del mosaico (80-98), que es un solo material, y las llanuras son tan llanas
  que el relieve no dibuja nada.
- **Variantes** (`generar-marte.py --variante X`, solo la base, sin teselas:
  se comparan a ×1). Están en `prototipo-marte/llanuras/<variante>/`
  (`antes` = como estaba, un solo tono; B y C se generaron sobre esa):
  - **A · `dos-tonos`**: el material del pico se parte en dos tonos casi
    iguales (`DOS_TONOS`: corte en 89, `#a1613e` y `#ab6843`). Salen manchas
    suaves que siguen el brillo real (polvo, coladas).
  - **B · `bandas`**: cada 1000 m de altura suavizada, la banda impar se
    aclara un tercio de escalón (materiales 8-15 en la LUT). Son terrazas que
    dibujan las cuencas.
  - **C · `relieve-llanos`**: la exageración del relieve ×3 donde la pendiente
    es menor del 0,5 %, con rampa hasta el 3 %. Es como los mares de la Luna.
- **Banco**: `zoom.html`, fila "llanuras": "la de verdad" (con teselas),
  "antes", A, B y C. Recarga con los otros datos y la misma vista
  (`?datos=llanuras/X&vista=lat0,lon0,zoom`). Hay botones nuevos de sitio:
  **Utopia** (30, 115) y **Amazonis** (20, −155).
- **Visto en Chrome** (Utopia y Amazonis a ×1):
  - A rompe las llanuras con manchas suaves y naturales.
  - B hace terrazas, pero alrededor del volcán Elysium salen anillos
    concéntricos, como una diana: parece un mapa topográfico.
  - C llena las llanuras (y algo las tierras altas) de granitos: es lo que
    más empuja al realismo.
- **Elegida: A** (usuario, 21-sep-2026: "la A"), la recomendada.
  Aplicada:
  - Los dos tonos ya son lo normal en `MATERIALES` y `UMBRALES` del
    generador: 8 materiales con el hielo.
  - `--variante` solo admite ya las descartadas, B y C, por si se quieren
    volver a ver.
  - Base y teselas regeneradas y `MARTE_V` a 6. En el banco, "antes (un
    tono)" y "A · dos tonos (elegida)".
- **Arreglado de paso** en `marte-gl.js`: sin niveles finos (como en estas
  variantes), el shader no compilaba. GLSL no admite listas vacías y quedaba
  una coma colgando.
- Ojo al probar: Chrome guarda en caché los módulos JS del banco. Tras
  cambiar `marte-gl.js` hace falta recargar a fondo (Cmd+Mayús+R).

### 3. Las zonas oscuras "algo pardas" (21-sep-2026)

- Son los tres materiales oscuros: basalto muy oscuro (el corazón de Syrtis
  Major), regiones oscuras (Acidalia, Mare Erythraeum…) y la transición. Eran
  tres marrones (`#5c3c31`, `#724937`, `#8c563b`) que junto al naranja quedan
  apagados.
- **Solo cambia la LUT**: el mapa y las teselas son los mismos. Por eso se
  comparan con todos los niveles de zoom: `generar-marte.py --solo-lut
  prototipo-marte/oscuras/X.png --oscuras X`, y en el banco `?lut=`.
- **Variantes** (`OSCURAS` en el generador; `antes` = la de verdad):
  - **A · `basalto`**: el mismo marrón menos saturado y algo más frío
    (`#57443f`, `#6c5247`, `#885d46`).
  - **B · `gris-azulado`**: gris con un punto frío (`#4e474c`, `#655653`,
    `#845d49`), contraste con el naranja como en las ilustraciones clásicas.
  - **C · `chocolate`**: marrón más hondo y oscuro (`#4f3129`, `#67402f`,
    `#88543a`).
- **Banco**: `zoom.html`, fila "zonas oscuras" (recarga con la misma vista).
  Botón de sitio nuevo: **Acidalia** (40, −25). Syrtis Major sale con el
  botón Syrtis o con `?vista=10,85,1`.
- **Visto en Chrome** (Syrtis a ×1 y ×4, Acidalia a ×1):
  - A se lee como basalto y se separa mejor del naranja.
  - B da el contraste más fuerte a ×1, pero a ×4, con la pantalla llena de
    Syrtis, se ve fría, casi como un filtro (en la Luna se rechazó por "demasiado
    azul").
  - C gana contraste pero sigue terrosa.
- Se recomendó A. **El usuario rechazó A y B** (21-sep-2026): "no me gusta
  basalto ni gris, me gusta de hecho el pardo / chocolate, ¿son las más
  reales?".
  - Respuesta: sí, de las cuatro son las más fieles. En color real, las
    zonas oscuras de Marte son pardo oscuro (arena basáltica con polvo
    encima), algo menos rojas que las claras. El gris azulado sale de
    imágenes procesadas: el mosaico Viking coloreado, contrastes forzados.
  - Contraste: el albedo de las zonas oscuras es aproximadamente la mitad o
    un tercio del de las claras. En luminancia, el material más oscuro frente
    al polvo claro está a ~0,44 en el pardo y a ~0,37 en el chocolate: el
    chocolate se acerca un poco más.
  - El usuario: "el chocolate. O un pelín menos de contraste que
    chocolate". Se hizo **`chocolate-suave`**, a un 70 % del camino del
    pardo al chocolate (`#53342b`, `#6a4331`, `#89553a`). Comparado sin
    navegador (prueba en Node, Syrtis a ×1), la diferencia es sutil: deja
    Syrtis un pelín menos pesada.
  - **Aplicado el chocolate suave y confirmado por el usuario**
    (21-sep-2026): en `MATERIALES`, base regenerada (solo cambia la LUT) y
    `MARTE_V` a 7. En el banco: "la de verdad (chocolate suave)",
    "pardo (antes)", A, B, C y "C2 · chocolate suave (elegida)".
  - Durante esta comparación la ventana de Chrome cambió de tamaño y las
    capturas del navegador fallaron. Para comparar colores sin navegador:
    la prueba en Node con otra LUT en la carpeta de datos.

### 4. El casquete norte pequeño a ×1 (21-sep-2026)

- **Cuánto hielo hay en el mapa** (base, % de celdas por banda de 2°):
  entero hasta 84° N, a medias en ~83° N (57 % en 84-82°), y se acaba hacia
  76° N. El casquete residual real llega más o menos a 80-81° N: el nuestro
  es algo más pequeño, pero no mucho. El sur (pequeño y descentrado, 86-90°
  S) cuadra con el real.
- **Por qué se ve pequeño**: sobre todo por la vista. Con `lat0` = 10 el polo
  cae al 98 % del radio, casi en el borde, y el casquete se ve de canto.
- **Opciones**:
  1. **Casquete más amplio** (`--variante casquete-amplio`: umbrales de hielo
     `HIELO_R_MIN` 125, `HIELO_B_R` 0,72, `HIELO_T` 0,3; antes 150, 0,78,
     0,5). A medias en ~82,7° N en vez de ~83,2°: apenas se nota.
  2. **Vista inicial más inclinada al norte** (25° en vez de 10°). El
     casquete se ve de frente, como un óvalo arriba, y encaja con la Tierra
     de la portada (vista de horizonte inclinada, hemisferio norte). Es la
     vista con la que arrancaría la página `/marte`.
  3. Las dos.
- Comparado sin navegador (prueba en Node, Tharsis, `lat0` 10 y 25, con y
  sin casquete amplio): lo que cambia de verdad es la inclinación.
- **Banco**: `zoom.html`, botón "inclinar 25° al norte" (fila "ir a") y fila
  "casquete norte": "el de verdad" / "más amplio" (`?datos=casquete/amplio`,
  solo la base).
- Se recomendó la 3. **El usuario prefiere el casquete "de verdad"**
  (21-sep-2026: "me gusta más el de 'verdad'"): los umbrales de hielo no
  cambian. La variante `casquete-amplio` queda en el generador y en el banco
  como descartada.
- **Vista inicial más inclinada al norte** (opción 2):
  - Primero a 25° (el usuario: "vale, dale, que quiero ver cómo queda").
  - Al verlo: "no tanta inclinación, la mitad por lo menos de 25". Queda en
    **12,5°**: `lat0` por defecto en `marte-gl.js` y `marte.js`, y los
    botones Tharsis y Syrtis de los bancos. Aprobado: "está bien así".
  - Si elige el amplio: dejar los umbrales en el generador, regenerar base
    y teselas (unos 4 min) y subir `MARTE_V`.
  - Si elige la vista: `lat0` inicial = 25 (en el banco y en `/marte`).
- Una posible opción más, **no preparada**: un casquete "de invierno" más
  grande (escarcha estacional hasta ~65° N). Es real en invierno, pero no
  sale del mosaico: habría que inventar su borde.

### 5. El grano en las llanuras a ×6 (21-sep-2026)

- **Qué es** (visto a ×6 en Elysium Planitia, `?vista=3,150,6`):
  - Rayitas verticales discontinuas, de norte a sur. Son las huellas de las
    órbitas del MOLA, casi de polo a polo: entre pasadas el relieve se
    rellena y quedan escalones este-oeste que la derivada este-oeste recoge.
  - Puntitos oscuros sueltos: muchos son cráteres pequeños reales.
  - Líneas diagonales: parecen crestas reales y no se tocan.
- **Variantes** (`--variante X`, solo en los niveles de 16 px/grado o más,
  `GRANO_DESDE_PPD`):
  - **A · `grano-eo`**: derivada este-oeste a 3 celdas en todas partes. Quita
    las rayitas, pero **ablanda Gale y las mesetas** de alrededor.
  - **B · `grano-suave`**: A y además 1,5 celdas norte-sur. Algo más blanda
    todavía.
  - **C · `grano-llanos`**: la derivada este-oeste de 3 celdas **solo donde
    es llano** (pendiente regional por debajo del 1 %, con rampa hasta el
    4 %); en el relieve abrupto, la de siempre. **Quita las rayitas de las
    llanuras y deja Gale igual de nítido.**
- **Generar solo una zona**: `--zona lat_sur,lat_norte,lon_oeste,lon_este`
  saca solo las teselas que la tocan (unos segundos en vez de minutos). Las
  variantes están en `prototipo-marte/grano/<eo|suave|llanos>/`, con la base,
  n2 y n3 de la zona −12..18° N, 132..168° E (Gale y Elysium Planitia) y n1
  enlazado a `public/marte/n1`. Fuera de la zona, el banco cae al nivel 1.
  Sin variante, el generador saca las teselas idénticas a las de antes
  (comprobado).
- **Se comparó** (`zoom.html`, sin botones: por la URL):
  - Elysium: `?vista=3,150,6` (actual) y `?vista=3,150,6&datos=grano/llanos`.
  - Gale: `?vista=-5.4,137.4,6` y `?vista=-5.4,137.4,6&datos=grano/llanos`.
- Se recomendó C. **El usuario dijo "No. Déjalo como estaba"**
  (21-sep-2026): no se aplica ninguna. Las variantes se quedan en el
  generador como descartadas (`--variante grano-eo|grano-suave|grano-llanos`,
  y `--zona` para generar solo una zona). Los datos de prueba de
  `prototipo-marte/grano/` (6,4 MB de teselas) se borraron: se sacan de
  nuevo con `--canvas prototipo-marte/grano/llanos/ --niveles 0,2,3 --zona
  -12,18,132,168 --variante grano-llanos` (y un enlace de `n1` a
  `public/marte/n1`).

## Página /marte (21-sep-2026)

- **Lo que pidió el usuario**: montar la página `/marte` y "una animación
  parecida a la del blog 'el blog de hegoi marquez' que ponga mars project y
  que esté un par de segundos y desaparezca".
- **`src/pages/marte.astro`**, calcada de `/luna`: `PageLayout` con `hero` y
  `cabecera={false}`, las estrellas de la portada (siempre las de noche, como
  en `/luna`) y el lienzo de `marte-gl.js`. Se monta en cada llegada
  (`astro:page-load`) y se desmonta al salir (`astro:before-swap`), porque la
  web cambia de página sin recargar. La mano (`montarMano`) y el zoom
  (`montarZoom`) se agarran en todo el hero, como en el banco. El disco a ×1
  lo mide una sonda de 60 svh, también como en el banco.
- **La página no hace scroll** (`html:has(.marte-hero) { overflow: hidden }`):
  la rueda es el zoom. El pie de página existe pero no se ve.
- **El título, primera versión** (sustituida por la de las esquinas, ver "El
  título: esquinas que se cierran"; `.marte-titulo`, solo CSS): mismo tipo, contorno negro de
  1 px, velo oscuro detrás y barra de censura que el título de la portada.
  Centrado sobre Marte. Tiempos:
  - 0-1,3 s tachado; en 0,5 s se destacha (la misma animación de la
    portada, `hero-redact-in`).
  - 2 s a la vista.
  - Desde 3,8 s se vuelve a tachar en 0,5 s (como el de la portada al bajar)
    y desde 4,6 s se funde en 0,5 s. A los 5,1 s ya no está.
  - No estorba: el arrastre y el zoom funcionan por debajo desde el primer
    momento. Con "reducir movimiento" no hay barra: se ve y se funde.
- **Comprobado** (Chrome sin ventana desde la terminal, 1440 × 900; la
  extensión de Chrome no estaba conectada): Marte a ×1 con Tharsis, el
  título fotograma a fotograma (tachado, destachando, a la vista, tachando,
  fundiéndose), un arrastre que gira y seis golpes de rueda que acercan sin
  mover la página. `astro check` sin errores y lint limpio.
- **No hecho, a propósito**: sin menú HUD (aún no hay notas de Marte), sin
  botón de salir, nada enlaza a `/marte` (eso llegará con el Marte pequeño y
  el viaje), sin respaldo si no hay WebGL2 (pantalla de estrellas vacía) y
  sin nada para táctil (pendiente de decidir).

## Marte en la portada y el vuelo (21/22-sep-2026)

- **Lo que pidió el usuario**: "un 'marte' en pixel art … en la pagina
  principal del blog, pero a la derecha, para que desde la tierra se viaje a
  un lado o se viaje a otro … El vuelo seria similar al que se hace
  tierra-luna". Eligió el tamaño B, "un poco más pequeña que la luna", el
  enlace en la cabecera y "que haga el viaje".
- **El Marte pequeño** (`public/zodk-marte.png`, de `generar-marte.py
  --icono`):
  - Mismo lienzo que la luna (56 px de arte, ×3; ×2 en móvil) con **radio
    12 frente a 16** (tres cuartos).
  - Sale de los datos de Marte con la misma cara y la misma luz que la
    vista inicial de `/marte` (12,5° N, 80° O: Tharsis), para que el vuelo
    acabe en el mismo planeta.
  - Borde seco y halo cálido en tres escalones, como el de la luna.
  - Se probaron radio 11 y 12 y otros ajustes del relieve; se quedó el de 12
    con los ajustes del Marte grande.
- **En la portada** (`index.astro`, `global.css`): `.hero-marte` arriba a la
  derecha (`right: 3%`, `top: 5%`; primero al 5 %, simétrico al sol y la
  luna, y el usuario lo quiso "un poco más a la derecha"), detrás del
  planeta, de día y de noche. Encima, el enlace `.hero-marte-enlace` (círculo
  de 168 px, como el de la luna).
- **Cabecera** (`Header.astro`): `notas / eventos / moon-project /
  mars-project`. En la portada, `mars-project` hace el mismo vuelo que pulsar
  Marte (sin pasar a noche: Marte se ve siempre). En el resto de páginas es un
  enlace normal a `/marte`.
  - **Arreglo en el móvil**: con el enlace nuevo el menú no cabía; partía
    "moon-" / "project" por el guion y en la portada se salía por la
    izquierda (a 320 px). Ahora los enlaces no se cortan y la letra del menú
    baja en pantallas estrechas (`clamp(0.72rem, 3.6vw, 1rem)`: 11,5 px a
    320, 14 px a 390; desde ~440 px, los 16 de siempre). Comprobado a 320,
    360, 390 y 430.
- **El vuelo** (`viaje-luna.js`, generalizado): el mismo motor que el de la
  Luna, con el destino, el icono y la imagen como parámetros (por defecto,
  los de la Luna: su vuelo no cambia). Para Marte:
  - Destino: la caja de `marte-quieto.png` en `/marte` (`--marte-caja`,
    centrada, `dy` 0).
  - La cámara gira hacia la derecha, Marte crece y se centra, la Tierra sale
    por abajo ("encima", la variante elegida para la Luna) y las estrellas se
    desplazan; en `/marte` quedan donde acabaron.
  - Se apagan el título, las naves, las banderas y la cabecera, y también
    el sol o la luna (no giran con la cámara). En el vuelo a la Luna, Marte
    se apaga igual.
  - En `index.astro`, `montarViaje` y `montarEnlaceCabecera` sirven para los
    dos destinos (`LUNA` y `MARTE`); un solo vuelo a la vez.
- **El aterrizaje sin saltos**:
  - `public/marte/marte-quieto.png` (de `node
    logo-files/generar-marte-quieto.mjs`) es la vista inicial pintada por
    el propio motor (`marte.js` en Node), en píxeles de arte, 450 × 450.
  - Es la imagen que crece en el vuelo y el fondo de `.marte-disco` en
    `/marte` mientras carga el lienzo. Cuando el lienzo pinta, se oculta.
  - Para que caigan en la misma rejilla, los dos motores usan ahora un lienzo
    de arte de lado **par** (el centro del disco entre dos píxeles, como en
    la imagen).
  - Comprobado: el fotograma final del vuelo y `/marte` coinciden en sitio,
    tamaño y estrellas. **Hay que rehacer `marte-quieto.png` si cambian los
    datos de Marte** (y subir `MARTE_V`).
- **Comprobado en Chrome sin ventana** (1440 × 900): vuelo pulsando Marte (de
  noche) y con `mars-project` (de día), fotograma a fotograma; el vuelo a la
  Luna sigue igual y llega a `/luna`. Sin errores en la consola. Móvil a 320
  y 390. `astro check`, lint y `npm run build`, limpios; el panel del título
  no llega a la web publicada.
- **Sin hacer**: volver de `/marte` a la Tierra con el vuelo al revés, y
  Luna → Marte.

## El título: esquinas que se cierran (21-sep-2026) — QUITADO

**Registro: el 22-sep-2026 el usuario pidió quitar el título ("Quitamos el
titulo mars project con la animacion cuando llega al planeta").** Se borró
todo del código (marcado, CSS y panel). Lo de abajo queda como historia.


- **Lo que pidió el usuario** tras ver la primera versión: que al terminar el
  vuelo Tierra-Marte o Luna-Marte salga el título "con los mismos o unos
  recuadros similares a los que tiene 'el blog de hegoi marquez'", aguante
  un par de segundos y se vaya, con "una animación en la que los cuadrados
  se cierren, cerrando el título, dame opciones".
- **Montado** (sustituye a la barra de censura sola de la primera versión):
  - El título lleva las esquinas de `.hero-marco` de la portada (28 px,
    1,5 px, blanco al 85 %). Texto y marco van en la misma caja, y el texto
    se corta con el marco (`clip-path` con los mismos valores que el `inset`
    del marco).
  - Sin la sombra difusa del texto de la portada (el corte la dejaría en
    seco); el velo oscuro de detrás entra y sale en 0,6 s.
  - Entra cuando Marte ya está pintado (clase `.entra`, la pone
    `marte.astro`). Cuando haya vuelo, entrará al aterrizar.
  - La entrada es el mismo movimiento que la salida, al revés. A la vista,
    2 s (2,1 en A-C).
- **Opciones** (`data-cierre` en `.marte-titulo`; panel abajo a la izquierda
  con A-D, que las cambia y las repite; solo sale con `npm run dev`):
  - **A · al centro**: las cuatro esquinas se juntan en diagonal hasta un
    cuadradito, como un blanco fijado, que se apaga. 3,6 s en total.
  - **B · monitor viejo**: primero de arriba abajo hasta una raya y luego la
    raya se cierra al centro. 3,6 s.
  - **C · por los lados**: las esquinas izquierdas y derechas se juntan como
    dos puertas. 3,6 s.
  - **D · tachado y cierre**: se abre como A sobre el texto tachado y se
    quita la barra (como en la portada); al irse, la barra tacha y las
    esquinas se cierran sobre ella hasta un cuadradito negro. 4,5 s.
- Comprobado fotograma a fotograma en Chrome sin ventana (las cuatro).
  `astro check` y lint, limpios.
- **Elegida la C** (usuario, 21-sep-2026): "me quedo con C aunque me
  gustaría que lo pulieses un poco". Se quitaron A, B y D del código (quedan
  descritas aquí).
- **C pulida** (`data-cierre="c"`, 3,7 s), sin cambiar la idea:
  - Antes, al cerrarse quedaban dos rayitas sueltas arriba y abajo (los
    brazos de las esquinas) y se apagaban. Ahora, al juntarse las puertas,
    sale una **costura** vertical entera (`.marte-titulo-costura`) que se
    recoge hacia el centro.
  - Al entrar, lo mismo al revés: la costura crece desde el centro y de ella
    se abren las esquinas.
  - Las puertas se cierran con arranque y frenada suaves (antes, acelerando
    hasta el golpe). El velo entra y sale en 0,8 s, a la par que las puertas.
  - Tiempos: costura 0,2 s; se abre en 0,6 s; 2,1 s abierto; se cierra en
    0,55 s; la costura se recoge en 0,25 s.
  - La C de antes sigue como `data-cierre="c0"` y en el panel ("C antes")
    para comparar. Se quita con el visto bueno.
- Comprobado fotograma a fotograma (las dos).
- **Duda**: "mars project" (así está) o "mars-project" (como el enlace de
  la cabecera).

## La idea (contada por el usuario, 21-sep-2026)

Seguir la idea de `/luna` (ver `LUNA-WIP.md`), pero con Marte, y aprovechar
para **probar dos funciones nuevas**. Si funcionan, más adelante se llevarían
también a la Tierra y a la Luna.

1. **Zoom** con la rueda del ratón y con el trackpad. "La cantidad de píxeles,
   resolución, etc. variará según el zoom": al acercarse, el planeta gana
   detalle; no se limita a ampliar los píxeles.
2. **Barra espaciadora**: mientras se pulsa, el cursor pasa a una mano y el
   planeta se puede girar a voluntad hacia un lado y hacia otro, y mirar los
   polos norte y sur.
   - El planeta, algo más pequeño que la Luna de `/luna`.
   - Las chapas se quedan pegadas a su sitio mientras se gira y se hace zoom.

Para más adelante (dicho por el usuario): Marte en el mismo estilo pixel art,
fiel a los accidentes del terreno; las misiones que se han posado allí, con
chapa y ficha; un Marte pequeño en algún sitio que se pulse para viajar.

## Estudio (21-sep-2026)

### Qué se puede aprovechar

- **`src/scripts/luna.js` ya pinta una esfera en cualquier orientación en
  tiempo real**: es lo que hace durante la media vuelta de 2,8 s (`calcular()`
  con una matriz de orientación, a partir de un mapa lat/lon de material +
  normal del relieve). Sirve de base para girar Marte con la mano. Coste
  medido: 7-9 ms por fotograma en Zen a 600 px, sin las pasadas de limpieza.
- **`src/scripts/planeta.js` (la Tierra) gira casi gratis**: con la
  inclinación fija, cada píxel de pantalla cae siempre en la misma latitud y
  en la misma longitud relativa; girar es solo desplazar la columna del mapa.
- **`generar-luna.py`**: relieve (DEM) + albedo → material + normal + LUT. Para
  Marte es el mismo recorrido con otras fuentes y otra paleta.
- Chapas que siguen al terreno en cada fotograma: `alMoverBanderas` de la
  portada.

### Cómo girar sin gastar (la idea técnica)

Con el giro tipo globo, la orientación son solo dos números, igual que en
`orientacion(lat0, lon0)` de la Luna. Con eso:

- **Girar solo o arrastrar hacia los lados** = cambiar `lon0` con la
  inclinación fija. Es el caso de la Tierra: tablas por píxel calculadas una
  vez y desplazamiento de columna. Hasta la luz del relieve se puede
  precalcular por píxel, porque el eje del planeta no se mueve en pantalla.
  Barato.
- **Inclinar o hacer zoom** = rehacer esas tablas. Cuesta como un fotograma
  del giro de la Luna, y solo mientras se está haciendo.
- **Quieto** = no se repinta nada.

Lo que se arrastra hacia la zona de sombra se oscurece (la luz no se mueve).

### Zoom con detalle: pirámide de mapas por teselas

El píxel de pantalla no cambia de tamaño: lo que crece es el radio del disco
en píxeles de arte, y hace falta un mapa más fino para rellenarlo. Con el
disco a ~60 svh (radio de ~225 px de arte, con el píxel de la Luna) el mapa
base de 4 px/grado basta para el zoom ×1:

| zoom | px/grado | mapa entero  | peso aprox. (como el de la Luna) |
|------|----------|--------------|----------------------------------|
| ×1   | 4        | 1440 × 720   | ~1,5 MB                          |
| ×2   | 8        | 2880 × 1440  | ~6 MB                            |
| ×4   | 16       | 5760 × 2880  | ~24 MB                           |
| ×8   | 32       | 11520 × 5760 | ~95 MB (no se hace por ahora)    |

Los niveles finos se cortan en teselas y solo se baja lo que se ve: una
pantalla cuesta unos cientos de KB a cualquier zoom. Lo que sí crece es el
**repositorio**: `.git` ya ocupa 321 MB, así que hasta ×4 va bien (~30 MB) y
×8 (~125 MB, y otro tanto cada vez que se regenere) pesa. Mientras se itera,
las teselas no se commitean; solo la versión aprobada.

Qué se ve con el zoom ×4 (16 px/grado): el Olympus Mons ocupa ~170 px de
arte, el cráter Gale (Curiosity) ~40 y Jezero (Perseverance) ~12.

Detalles para cuando se programe:
- Trackpad: el pellizco llega como rueda con `ctrlKey` en Chrome y Firefox
  (en Safari, con los eventos `gesture*`).
- Si gira solo y hay zoom, la velocidad se divide por el zoom: si no, el
  terreno pasaría volando.
- La barra espaciadora hace scroll y pulsa el botón que tenga el foco: hay
  que anular eso mientras se usa para girar.

### Fuentes de datos (NASA/USGS, dominio público)

- **Relieve**: MOLA MEGDR (Mars Global Surveyor), a 4, 16, 32, 64 y
  128 px/grado. El de 16:
  `https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.img`
- **Color / albedo**: mosaico en color de las Viking, 925 m/píxel
  (64 px/grado, 23059 × 11530, 764 MB):
  `https://planetarymaps.usgs.gov/mosaic/Mars_Viking_ClrMosaic_global_925m.tif`
  (existe también a 232 m, 12 GB: no hace falta).
- Irán a `logo-files/marte-fuentes/`, sin trackear, como `luna-fuentes/`.
