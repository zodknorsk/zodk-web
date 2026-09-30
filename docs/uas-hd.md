# UAS HD: los drones del hangar en versión 2.0

El visor del Hangar de UAS (ver `docs/uas.md`) pinta cada dron como una
maqueta: piezas sencillas (tubos, placas, alas) de un solo color y líneas de
arista. El usuario pidió el 30-sep-2026 una **versión 2.0**: que el modo
Maqueta deje de parecer una maqueta y sea «el propio dron, bien pintado, en
HD», con las medidas y los ángulos perfeccionados al máximo contra fotos, y
después un pixel art con más calidad y detalle. Se empieza por el **MQ-9
Reaper** (el más documentado; idea del usuario) y, si sale bien, se sigue
con los demás.

## Dónde estamos

- **Rama `uas-hd`**, sacada de `main` el 30-sep-2026 (después de `d3d4686`).
  Sin subir. `main` y zodk.eu no se tocan hasta fusionar. Primer commit
  el 30-sep-2026: el HD del MQ-9 completo (forma, luz, piezas, detalle).
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
- **Siguiente paso**: el **pixel art 2.0** (lo segundo que pidió el
  usuario: «darle un toque más de calidad y detallar un poco más»).

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
- [ ] Pixel art 2.0.
- [ ] Fusionar en `main`.

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
