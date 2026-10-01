# UAS HD: los drones del hangar en versión 2.0

El visor del Hangar de UAS (ver `docs/uas.md`) pinta cada dron como una
maqueta: piezas sencillas (tubos, placas, alas) de un solo color y líneas de
arista. El usuario pidió el 30-sep-2026 una **versión 2.0**: que el modo
Maqueta deje de parecer una maqueta y sea «el propio dron, bien pintado, en
HD», con las medidas y los ángulos perfeccionados al máximo contra fotos, y
después un pixel art con más calidad y detalle. Se empieza por el **MQ-9
Reaper** (el más documentado; idea del usuario) y, si sale bien, se sigue
con los demás.

## Pasar un dron al HD: objetivos

Cuando el usuario pida «pasa el <dron> al HD» (o «mejora el <dron> a la
2.0»), esto es lo que tiene que cumplir el resultado. Lo fijó el usuario el
1-oct-2026, después del MQ-9 y sus cuatro revisiones (ver el registro de
abajo). El cómo, las piezas y las herramientas están en «Dónde estamos» y en
`docs/uas.md`.

**Calidad antes que rapidez.** Un dron en HD se trabaja despacio y bien; no
se enseña una versión rápida para que el usuario la corrija.

**Qué drones**: los que ya están en el hangar se pasan al HD uno a uno
(todos menos el MQ-9, que está terminado). Los drones nuevos se hacen en HD
desde el principio.

**Antes de empezar**

- Leer este documento y `docs/uas.md`.
- Rama propia (`hd-<slug>`); al fusionar en `main` se borra.
- Preguntar al usuario solo lo que no está fijado: qué avión concreto da
  las marcas y con qué carga va. Ya está decidido y no se pregunta: estilo
  **C**, el botón «Maqueta | Pixel», el dron montado como en vuelo, y las
  partes con letras, las vistas y el modo Pixel como están.

**Objetivos**

1. **Modelar bien el dron.** Es lo más importante.
   - Fotos en alta de todos los ángulos, de un avión concreto, y fotos de
     cerca de las piezas pequeñas.
   - Medidas sacadas de las fotos (perfil nivelado, a escala, con rejilla en
     metros), nunca a ojo. Si la foto está girada respecto al eje, se
     corrige antes de medir.
   - Cuerpo de una pieza continua (`casco`), sin tubos ni cajas. Las líneas
     donde la luz cambia de golpe en varias fotos son aristas vivas. Las
     góndolas, carenados y tomas salen del cuerpo; no van posados encima.
   - Alas, cola y aletas medidas con el mismo cuidado que el cuerpo: perfil,
     contorno (borde de ataque, borde de salida, cuerda en la raíz y en la
     punta), y el punto y la altura de donde nacen.
   - El dron no es una sola pieza: flaps, alerones y timones van aparte, con
     su hueco; el tren con sus piezas; tomas y salidas de aire.
   - **Una pieza se coloca y se mide con varias fotos desde ángulos
     distintos**, nunca con una sola. Con el MQ-9, una foto sesgada hizo
     ver el escape ladeado cuando está centrado, y se insistió en el error.
   - **Si al comparar con las fotos algo está claramente mal, se arregla**
     aunque el usuario no lo haya señalado. Con el MQ-9 salió bien lo
     hecho por cuenta propia, pero cuando él señalaba un fallo con fotos no
     se veía el problema. No se espera a que lo diga.
2. **Dibujos que representan al dron**: las marcas reales del avión elegido
   (escarapela, letras de la base, número de serie, escudos, discos). Van
   proyectados como calcas, sobre la forma definitiva.
3. **Luces y sombras con el sol dándole directo desde arriba**: la parte de
   arriba, al sol y sin manchas de sombra; los costados y la panza, más
   oscuros. Se comprueba desde el ángulo de cada foto.
4. **Colores reales del dron**, con varios tonos si las fotos los muestran
   (pintura, metal, piezas negras, cristal). Se miden píxeles en la foto y en
   el render en los mismos puntos hasta que cuadren. Los cambios de color o
   de luz, grandes y comprobados; si un comentario admite dos lecturas, se
   pregunta.
5. **Tornillería, costuras, remaches y juntas**, finos, y solo los que se ven
   en las fotos de cerca. Si algo es una sombra o no se distingue, no se
   dibuja.
6. **Detalle de cámaras y armamento**: la óptica con su forma real
   (cuerpo, cara, ventanas, cristal) y las armas con sus lanzadores y
   soportes, pegadas a ellos (nada flotando).

Con eso se gana casi todo el HD. Además, en todos los drones:

- **Comparación lado a lado** con cada foto desde su mismo ángulo, pieza a
  pieza, antes de enseñar nada; las capturas se mandan junto a la foto con
  la que se comparan.
- **Rendimiento** medido en Zen (`docs/rendimiento.md`).
- **Este documento al día en cada paso**: qué se hizo, qué se probó y se
  descartó, y qué falta.
- **Cierre**: el usuario lo da por bueno, se fusiona en `main`, se publica
  y se borra la rama.

**Lo que salió mal con el MQ-9 y no se repite**

- Redondear una arista que se veía en todas las fotos.
- Tomas y góndolas como piezas posadas encima del cuerpo.
- Cola y aletas sin medir; volver con una pieza que el usuario ya había
  señalado sin haberla tocado.
- Fiarse de una sola foto sesgada (el escape) e insistir en el error.
- Inventar piezas (escapes a los lados, antenas de pala, juntas en el ala)
  o dibujar sombras como si fueran forma.
- Cambios de luz o contraste tan pequeños que «ni se notan», o interpretar
  al revés lo que pidió («quiero este azulado»).
- El cielo de reflejos del revés (la fila 0 de la textura es abajo).
- Piezas colgando en el aire, separadas de su soporte.

**Pixel art HD**: la segunda parte («darle un toque más de calidad y
detallar un poco más»). Se empieza con el MQ-9 el 1-oct-2026; sus objetivos
se apuntan aquí cuando estén fijados con el usuario.

## Dónde estamos

- **Fusionado en `main` y publicado el 30-sep-2026**; la rama `uas-hd` se
  borró el 1-oct-2026 (todo estaba en `main`). El HD del MQ-9 está terminado a falta de
  retoques: estilo **C** fijo por defecto; el selector de pruebas solo sale
  con `?hd=a|b|c|no` en la URL.
- **Pendiente para otro día** (lo dejó el usuario, «saturado»): el **pixel
  art 2.0**, y pasar los demás drones al HD.
- **Hecho** (sin commit): las fuentes (abajo); la pieza nueva **`casco`**
  en `uas-geometria.ts` (cuerpo de secciones con forma de superelipse, mitad
  de arriba y de abajo con su alto y su «cuadratura», unidas con una
  interpolación cúbica monótona que no abomba entre medidas); y el cuerpo
  del MQ-9 rehecho con dos cascos, `morro` (con la joroba) y `fuselaje`,
  en lugar de los tres tubos de la 1.0. De paso, la torreta (r 0,26 m), la
  toma de aire, el cono y la hélice, recolocados.
- **Cómo se midió el cuerpo**: la foto del «CH» 152 nivelada (girada 4,79°
  para que la punta del morro y la del cono queden a la misma altura, que es
  el «horizontal» de la maqueta) y a escala con los 11 m de la ficha
  (426,4 px/m); una rejilla en metros encima (`hd/rejilla-m.py`) y lectura
  punto a punto del lomo y la panza cada 0,25 m. El ancho (1,15 m como
  máximo) y la forma de la sección, de la foto de frente con teleobjetivo
  (`frente-armado-2.jpg`). Comparación: `hd/superponer-suave.mjs` (el de
  `arte/` con el rojo más suave) sobre la foto nivelada. En el suelo el
  MQ-9 queda 4,6° morro abajo respecto a esa línea; al despegar, 4,8° morro
  arriba.
- **Pruebas de estilo** (sin commit), en `src/scripts/uas-hd.ts` y el
  visor: con `hd: true` en la maqueta, el modo Maqueta pinta el dron en HD.
  Selector temporal sobre el lienzo («Prueba: 1.0 · A · B · C», se recuerda
  en el navegador) y `?hd=a|b|c|no` en la URL. A, realista: materiales
  físicos (pintura mate con el gris de la foto, metal, cristal), un cielo
  degradado como entorno para los reflejos, sol con sombras del propio dron,
  tono ACES. B, ilustración: tres escalones de luz, aristas y silueta en
  tinta. C, el A con una silueta de tinta fina. La silueta es una copia de
  cada pieza inflada por sus normales y vista por detrás. Probado y
  descartado: el `RoomEnvironment` de Three.js como entorno (quemaba todo a
  blanco). `arte/capturas.mjs` admite ya `--escala=2` (capturas retina).
- **30-sep-2026, después de ver las pruebas**: el usuario eligió la **C** «de
  momento», pero A y C «se siguen viendo rollo maqueta». Además señaló la
  **arista a lo largo del costado** del MQ-9, en todas las fotos, con mucho
  contraste al sol: la había medido (la cintura) pero redondeada. Hecho:
  - `casco`: la mitad de abajo puede ser un trapecio (`panza`: cara que baja
    inclinada hasta una panza plana, esquinas redondeadas) y la de arriba
    llegar ya inclinada a la cintura (`arista`); las dos mitades con vértices
    propios, así la arista queda viva. En el MQ-9, `n` 2,6, `arista` 0,35 y
    panza de 4/5 del ancho. Fallo encontrado por el camino: `aUnidades` no
    pasaba `panza` a unidades (salía más ancha que el cuerpo y la cara de
    abajo bajaba recta); arreglado en las tres maquetas que lo tienen.
  - Luz del HD rehecha: el sol **va con la cámara**, alto (65°) y 40° de
    lado del lado de quien mira (fijo en el mundo alumbraba el lado que no
    se ve; justo detrás de la cámara lo aplanaba todo), fuerte (3,9); cielo
    de reflejos propio con la tierra oscura bajo el horizonte, poca luz de
    ambiente: el lomo y el costado brillan y la cara de debajo de la arista
    queda en sombra. Cámara de teleobjetivo (18°) en HD.
  - Materiales del HD por las dos caras (las alas tienen los triángulos al
    revés y salían del revés).
  - Probado y quitado: penumbra de juntas con GTAO (no se notaba y dentaba
    los bordes).
- **Hecho después** (sin commit):
  - Arista del morro afinada: cara de abajo más empinada (panza a 0,87 del
    ancho) y `arista` 0,45.
  - Forma: la **cola en V con perfil** (un `ala` con diedro de 30°, en la
    1.0 una placa), la **aleta de debajo** y los **soportes de las armas con
    perfil** (el `ala` admite `sola` y `vertical`: una mitad colgando hacia
    abajo, en el costado `x`).
  - Piezas separadas: **flaps y alerones** (de 0,75 a 4,5 m y de 4,56 a
    9,55 m, un cuarto de la cuerda, con hueco de 2 cm) y **timones** en la V
    (30 % de la cuerda), piezas aparte del ala y de la cola. Vuelve el
    arreglo de los escalones del ala (vértices propios en cada pared).
  - **Detalle pintado** (`montarDetalles` en `uas-hd.ts`, datos en
    `detalles` de la maqueta): calcas proyectadas con `DecalGeometry` y
    dibujadas en un lienzo 2D (escarapela de baja visibilidad, escudos,
    «CH», «AF 11 · 152», discos rojos y blancos) y costuras llevadas a la
    superficie con rayos, con remaches (borde de la carena de la joroba,
    tapa del morro, tapa de registro atornillada, junta del motor, juntas
    del ala). Solo en HD. Las calcas se quedan en las caras que miran hacia
    donde se proyectan (en la cola y la aleta atravesaban).
- **Costuras afinadas** a petición del usuario («un poco gruesas, sobre todo
  el cuadrado»): línea más clara y transparente (#4a4f56 al 22 %), tornillos
  redondos y pequeños (1,3 px al 55 %, tras pedirlos aún más finos); el borde de la joroba con tornillos como en la foto
  (7 cm en la bajada de detrás, 15 cm a lo largo del costado); la tapa de
  registro con tornillos solo en las esquinas y el centro de cada lado
  (`enVertices`).
- **Piezas pequeñas** (foto de cerca de Cannon y perfil del «CH» 152): tren
  principal con amortiguador negro en paralelo, eje y bujes por los dos
  lados; pata del morro con amortiguador, vástago de metal, tirante,
  compás y bujes; varilla que cuelga de la gota, sondas en L a los lados
  del morro, tres antenas de pala en la panza; luces (roja bajo el morro,
  de posición roja y verde en las puntas del ala, como calcas) y otra tapa
  atornillada junto a la raíz del ala. Tornillos más finos (1,3 px) a
  petición del usuario.
- **Lanzadores, toma y tapas** (foto de cerca de Cannon): el lanzador de los
  Hellfire es un cuerpo negro corto colgado del soporte por dos ganchos,
  con dos brazos y dos raíles debajo (en la 1.0, una caja); la **toma de
  aire**, un `casco` que nace del lomo (borde a 2,44 m detrás, techo a
  0,645 m, medidos en el perfil del «CH» 152) con la boca ovalada ancha y
  oscura, el tabique y el borde grueso (en la 1.0, una góndola posada
  encima); tapas atornilladas en los dos lados de cada soporte, dos por
  ala por arriba y una en la raíz de cada cola.
- **30-sep-2026, revisión del usuario (7 puntos)**, sin commit:
  1. **Ala 20 cm más baja** (`ALA.y` −0,14: la cara de arriba a la altura de
     la arista) y **cola en V rehecha**: sale del costado a media altura
     (`COLA.y` −0,38), a 32°, punta a 1,71 m; medida en el perfil del «CH»
     152 corrigiendo que la foto está hecha algo desde atrás (las puntas de
     las dos colas salen 1,9 m separadas en z). **Toma nueva**: boca redonda
     y corta (r 0,13 m, sin tabique en el «CH» 152) delante de una carena
     grande (`casco` hasta 0,74 m) y salidas de aire atrás.
  2. **Cúpula en seta** (gota de 0,46 × 0,29 × 0,18 m sobre un cuello) y
     **antena en T** con la pala ancha abajo y la varilla hacia atrás hasta
     una bola.
  3. **Luces en relieve**: cúpulas rojas y blancas con aro de metal (acabados
     nuevos `rojo` y `blanco`), en el lomo y el ala, en lugar de calcas.
  4. **Lanzador** con tirantes, cajas, conectores y patines, pegado al
     soporte; **GBU-12 pegada** al suyo con dos ganchos (colgaba 4 cm en el
     aire); **torreta** con cuello de dos anillos, cara plana, marco y tres
     ventanas.
  5. Fuera las **juntas de paneles del ala** (no están en las fotos);
     flaps, alerones y timones con hueco de 6 mm y el grosor del ala.
  6. **Más contraste**: sol más fuerte (4,6), poco ambiente, la tierra del
     cielo de reflejos más oscura, exposición 0,82.
  7. **Sin tono azulado**: gris neutro de la pintura (#a8aaad), luz de cielo
     y cielo de reflejos sin azul, sol blanco (probado uno cálido: salía
     beige).
- **Segunda revisión del usuario** (muy molesto con la primera): la toma
  «SE FUNDE CON EL CUERPO», la cola «no se parece», luces «con varicela»,
  contraste y azulado «ni se nota» (quería el azulado de la foto italiana,
  y yo lo había quitado). Hecho: la **góndola del motor es el propio cuerpo**
  (secciones del `fuselaje` suben a 0,74 m entre 2,3 y 4,5 m detrás del
  centro; la toma, solo una boca corta delante); **cola** con la cuerda más
  ancha y las bisagras pequeñas; **cinco luces en el lomo y dos por ala**,
  pequeñas; **luz como la foto italiana**: sol blanco fuerte (5,4), alto
  (58°) y del lado contrario a quien mira (125°), luz de cielo azul (0,75),
  pintura gris azulada (#a3b3c5), cielo de reflejos azul con el suelo casi
  negro: arriba casi blanco azulado, costado azul oscuro, panza negra.
  Colores medidos en la foto y en el render en los mismos puntos.
- **Tercera revisión** («tómate tu tiempo»; todo medido en fotos antes de
  tocar):
  - **Cola**: el contorno, medido en el perfil del «CH» 152 quitando el giro
    de la cámara (~16°, 0,28 m por metro de separación del eje): borde de
    ataque en flecha, **borde de salida casi recto**, cuerda de 1,39 a 0,61
    m. Antes los dos bordes iban en flecha.
  - **Aleta de debajo** (en el eje, la foto no la deforma): borde de detrás
    vertical en −3,95, fondo plano a −1,65, timón de 0,25 m (costura),
    carenado pequeño dentro de la cuerda; fuera la barra que sobresalía.
  - **Góndola**: sube casi a pico detrás de la toma (0,39 → 0,72 m en 0,6 m);
    **toma** con cono corto, boca ovalada de 0,29 × 0,22 m, labio grueso,
    tabique y ranura encima (fotos francesa e italiana); **salidas de aire**:
    una capucha a cada lado de la parte de atrás, abierta hacia atrás (foto
    del 05-015).
  - **Torreta** (MTS-B, fotos de cerca): tambor aplastado de 0,56 m con el
    fondo redondeado, cara plana grande, ventana principal abajo con aro
    claro y cuatro pequeñas encima; cristal algo verdoso.
  - Fuera las **antenas de pala** de la panza (la panza es lisa).
  - **Luz**: el cielo de reflejos estaba **del revés** (la fila 0 de la
    textura es abajo): arriba se reflejaba el suelo y la parte de arriba
    salía más oscura que la de abajo. Arreglado; sol 4,3 y más luz en las
    sombras (menos contraste, como pidió).
- **Cuarta revisión**: algo menos de contraste y de azul (pintura #a6b0bb,
  cielo de relleno más gris, sol 3,9); **sol casi encima** (78°, 45° del
  lado de quien mira): el usuario no quería sombras en la mitad de arriba
  («le está dando el sol directamente»), y el sol bajo y del lado contrario
  las manchaba; sesgo de sombra mayor contra el acné. **Escape**: una **capucha centrada en lo alto de la góndola**, que nace
  lisa y se levanta hacia atrás hasta una boca ovalada negra mirando a la
  hélice. Probado y descartado: dos capuchas a los lados (inventadas), un
  tubo hacia delante (al revés), la capucha ladeada a la derecha y un canal
  oscuro detrás (en la foto era una sombra; el usuario: «te lo has
  inventado»).
  **Torreta**: un `casco` con la cara plana en «D» al revés, fondo redondo,
  ventana grande con aro claro, cuatro pequeñas y pegatina amarilla;
  cristal verdoso.
- **1-oct-2026, pixel HD del MQ-9** (rama `hd-pixel-mq-9`, con commit, sin
  subir ni fusionar). El
  usuario pidió aplicar los objetivos del HD al pixel y probar también más
  resolución. Cómo funciona: en los drones con `hd`, el modo Pixel pinta la
  escena con los materiales, la luz (sol desde arriba, con sombras) y las
  calcas del HD a baja resolución, y la pasada final (`uas-pixelado.ts`) le
  aplica el tono de pantalla del HD (ACES y sRGB, que Three.js no aplica en
  un destino intermedio) y deja la luz en siete escalones conservando el
  color. El número de cada pieza va en el alfa, como en el pixel 1.0, para
  las juntas; las calcas y costuras lo respetan (`sinTocarAlfa`). Sin
  tornillos (a un píxel cada uno, ruido).
  Pruebas en local: un panel abajo a la derecha (solo con `npm run dev`) con
  dos filas: **Actual · A** (color y luz) **· B** (+ marcas y costuras)
  **· C** (+ contorno del color de la pieza) y **2 px · 1 px · 2 px más
  cerca**. Probado y quitado: el tramado (con la luz del HD dibujaba rayas
  en las caras planas y puntos sueltos) y escalones repartidos en curva (el
  gris del ala al sol caía justo en el borde de dos escalones y salía a
  franjas).
  El usuario eligió la **B** (con marcas y costuras): fuera la A, la C y el
  botón «Actual»; el MQ-9 en Pixel es siempre el pixel HD. Pidió un tamaño
  de **1,5 px** (2 px «muy pixel art», 1 px «más un dibujo, aunque me gusta»)
  y «otra pasada de calidad». Hecho, comparando con el HD desde el mismo
  ángulo en las vistas 3D, perfil, frente y planta:
  - El píxel de 1,5 px solo sale limpio en pantallas retina (3 píxeles de
    pantalla); en las normales pasa a 2 (`ponerHD`).
  - Líneas de dentro (saltos de profundidad y juntas entre piezas) en el tono
    de la pieza más oscuro, no en negro: las juntas del ala pesaban mucho
    más que en el HD y los lanzadores de Hellfire eran un borrón negro.
  - Limpieza de píxeles sueltos (un píxel rodeado de un mismo escalón, a un
    escalón del suyo, toma el color de al lado): el lomo salía salpicado.
  - Lo fino (uno o dos píxeles de grueso) sin contorno y más oscuro: de
    frente, el ala y la cola en V salían como barras negras de cuatro
    píxeles; en el HD son rayas finas.
  - Calcas nítidas en el pixel (cada píxel, tinta entera o nada): reducidas
    a pocos píxeles se volvían un gris que se perdía y no se veían ni el
    «CH», ni el «152», ni la escarapela.
  Queda: en 3D, la punta de la cola en V sale algo dentada (el grosor pasa
  de dos a tres píxeles a saltos).
  El usuario eligió **1 px** (frente a 2, 1,5 y «2 px más cerca»): fuera el
  panel de pruebas; el pixel HD va siempre a 1 px.
- **Siguiente paso**: subir y fusionar `hd-pixel-mq-9` cuando lo diga el
  usuario; decidir si se regeneran las miniaturas de `/uas` y la portada
  (hoy salen del pixel 1.0).

## Decisiones del usuario (30-sep-2026)

- Rama propia, `uas-hd`.
- El MQ-9 como ahora (cuatro Hellfire, dos GBU-12, tren fuera), **con las
  marcas reales de un avión concreto** de la Fuerza Aérea: escarapela,
  número de cola y código de la base.
- Estilo del HD: **pruebas para elegir**, dos o tres versiones del mismo
  MQ-9 con un selector temporal en la página.
- El botón se sigue llamando **«Maqueta | Pixel»**; solo cambia cómo se ve.
- El avión de las marcas: **el «CH» 152 de Creech** (432.º Ala), elegido
  frente al «HO» 16-307 de Holloman. Sin armas en sus fotos; los Hellfire y
  las GBU-12, de otras.

## Plan

- [x] Fuentes: fotos en alta de todos los ángulos y el avión de las marcas.
- [ ] Forma: cuerpo continuo hecho de secciones medidas (no tubos sueltos),
      carenados, tomas de aire, antenas, tren, torreta; comparado en
      ortográfica con el plano y con fotos desde el mismo ángulo.
- [x] Pruebas de estilo con selector temporal: el usuario eligió la C «de momento».
- [x] Afinar la arista del morro.
- [x] Alas, cola, tren y carenados (cola y aleta con perfil, soportes, tren con sus piezas).
- [x] Piezas separadas (lo pidió el usuario el 30-sep-2026: «no todo es una
      única pieza»): alerones y flaps con su hueco, tapas de registro,
      bisagras, tornillería, antenas y luces, sacadas de las fotos de cerca.
- [x] Detalle pintado, al final y sobre la forma definitiva: líneas de
      paneles, remaches, marcas del «CH» 152 (escarapela, «CH», número de
      serie), los discos rojos y blancos del lomo. Con calcas proyectadas.
- [ ] Rendimiento en Zen (`docs/rendimiento.md`).
- [x] Pixel art 2.0 del MQ-9 (pixel HD, 1 px; sin fusionar).
- [x] Fusionar en `main` (30-sep-2026).

## Fuentes

- **El avión**: MQ-9 del 432.º Ala al despegar en Creech, el 1-sep-2021
  (Fuerza Aérea de EE. UU., dominio público, 5532x3562):
  https://commons.wikimedia.org/wiki/File:A_U.S._Air_Force_MQ-9_Reaper_assigned_to_the_432nd_Wing_432nd_Air_Expeditionary_Wing,_takes_off_from_the_flightline_at_Creech_Air_Force_Base,_Nevada,_Sept._1,_2021.jpg
  Un perfil casi perfecto, que sirve también para medir la forma. Marcas:
  «CH» y el escudo del Mando de Combate Aéreo en la cola en V, escarapela
  en el costado de atrás, escudo del 432.º Ala junto al morro y, en la
  aleta ventral, «AF 11» y «152»: el **11-4152** (deducido de la aleta; no
  hay pie de foto con el número).
- **Detalle de cerca**: el MQ-9 de Cannon del 29-may-2016 (4256x2832, dominio
  público): torreta, antena en gota, toma de aire, lanzadores de Hellfire
  vacíos, tren, antenas del lomo.
  https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_performs_a_low_pass_during_an_air_show_demonstration_May_29,_2016,_at_Cannon_Air_Force_Base,_N.M.jpg
- **Todas las demás**: 263 archivos en las categorías de Commons del MQ-9,
  171 de más de 6 MP y casi todos de dominio público. Lista, miniaturas y
  hojas de contactos en `arte/uas-fuentes/mq-9-reaper/hd/` (fuera de Git):
  `indice.json` (número, título, tamaño, licencia, URL), `mini/`, `med/`
  (1280 px) y `full/` (tamaño completo de las que se usan).
- Las 18 fotos de la maqueta 1.0 siguen en `arte/uas-fuentes/mq-9-reaper/`.

## Principios

- Diseño y geometría propios, sacados de fotos públicas: no se usan modelos
  3D de otros.
- Se mantienen las partes con letras, las vistas y el modo Pixel.
