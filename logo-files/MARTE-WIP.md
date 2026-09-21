# Proyecto Marte — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso (lo pidió el usuario el 21-sep-2026): qué está hecho, qué no, qué está
decidido y qué queda pendiente. Leyendo solo esto hay que poder retomarlo.

## Dónde estamos (21-sep-2026, tarde)

- Rama **`mars-project`**, creada desde `main` el 21-sep-2026. **Solo en el
  Mac, sin subir a GitHub.** Nada fusionado ni publicado.
- **Hecho**: estudio del proyecto (abajo), primeras decisiones y **paso 1:
  Marte provisional**, aprobado por el usuario y commiteado en la rama
  (commit `5a99c5c`).
- **Paso 2, giro con la barra espaciadora: hecho y probado por el usuario**
  (21-sep-2026: "Zen de momento va bien parece"). Commit `eafc8b6`.
- **Paso 3, zoom: hecho y probado por el usuario** (21-sep-2026): en Zen
  "no parece que se disparen los vatios" y el pellizco del trackpad "abre
  bien". **Cambio de motor: pasa a WebGL** (ver "Zoom" abajo).
- **Sin commitear** (paso 3): `src/scripts/marte-gl.js`,
  `prototipo-marte/zoom.html`, los niveles de `generar-marte.py`,
  `public/marte/marte-datos.json`, `MARTE_V` (va por 3), `.gitignore` y este
  documento. **Las teselas (`public/marte/n1/`, `n2/`) no se commitean** hasta
  que el pixel art sea el definitivo (decisión del usuario; están en
  `.gitignore`). Hasta entonces solo existen en el Mac.
- **Pendiente de decidir**: subir el zoom máximo a ×5-×6 (lo propuso el
  usuario; ver "Decisiones pendientes").
- **Siguiente paso**: esa decisión; después, el paso 4 (chapas de prueba).

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
- [ ] 4. Dos o tres **chapas de prueba** pegadas al terreno (Curiosity,
      Perseverance…).
- [ ] Giro automático y botón, si se decide (ver pendientes).

Después, sin orden cerrado: pixel art definitivo de Marte, las misiones
(chapa, ficha y nota en la bóveda), página `/marte`, el Marte pequeño que se
pulsa para viajar, y la publicación (merge en `main`).

## Decisiones tomadas

- **Barra espaciadora, como la mano de Photoshop** (usuario, 21-sep-2026):
  con el espacio pulsado, el cursor es una mano abierta; con espacio + clic y
  arrastrar, mano cerrada y el planeta gira. Soltar el clic o el espacio
  termina el arrastre.
- **Zoom máximo ×4** (16 px/grado) "y vamos viendo" (usuario, 21-sep-2026).
  Si se queda corto, ×8 (32 px/grado), sabiendo que pesa cuatro veces más.
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
3. **Zoom máximo ×5-×6** (lo planteó el usuario el 21-sep-2026: "tal vez un
   x8 es demasiado, pero un x5 o x6 como lo ves?"). El mapa más fino (16
   px/grado) está hecho para ×4: pasar de ahí solo agranda las mismas celdas.
   No hay detalle nuevo y los píxeles dejan de ser todos iguales (alguno
   sale doble). Recomendación: **×6, con un cuarto nivel de 32 px/grado**
   (MOLA de 32 y el Viking de 64). Implica ~44 MB más de teselas (una vista
   baja 3-4 MB), bajar el MOLA de 32 (~130 MB, solo en el Mac) y que el motor
   guarde las teselas en una caché de tamaño fijo en la GPU en vez de
   reservar el mapa entero (a 32 px/grado serían 133 MB). Ojo: el MOLA de 32
   está más "rellenado" entre órbitas y las rayitas norte-sur podrían
   notarse más.

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
