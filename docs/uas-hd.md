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

**Qué drones**: el usuario puede pedir pasar un dron al HD, al pixel HD o a
los dos (todos menos el MQ-9 y el TB2, terminados). Los drones nuevos se
hacen desde el principio en HD y pixel HD.

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

**Medir con fotos encajadas** (desde el TB2, 1-oct-2026). Con fotos en
perspectiva no basta con una rejilla: se encaja la cámara de cada foto y se
pinta la maqueta encima desde ese mismo ángulo.

- `arte/encajar-camara.mjs <ajuste.json> [salida.png]`: en el json, la foto
  y puntos que se reconocen en ella (`[x, y, z, px, py, "nombre"]`, en metros
  de la maqueta). Encaja la cámara (acimut, elevación, giro, distancia, campo)
  y dice el error de cada punto; la salida lleva la silueta de la maqueta en
  rojo y las juntas en amarillo. Un punto con `"medir:z"` (o `x`, `y`) no
  encaja: dice dónde cae su píxel con esa coordenada fija (por ejemplo, el
  ancho de las ruedas si se sabe su z).
- `arte/comparar-foto.mjs <ajuste.json> <salida.png> [--encima] [--pixel]`:
  el visor en HD (o pixel) desde la cámara encajada, debajo de la foto o
  encima a medias. Usa un enganche del visor que solo existe con `npm run
  dev` (`window.__visor.mirar`). Lienzo de 1900 px como mucho.
- `arte/vista-visor.mjs`: el visor desde una cámara cualquiera, sin foto.
- Lo que sí vale y lo que no: medir a lo largo de la vista no sirve (una z en
  una foto de frente). El ancho, con fotos ancladas a medidas que se saben a
  la misma profundidad (la envergadura). Una foto con una sola referencia de
  ancho (una punta del ala) da anchos poco fiables.
- Los json de cada foto, junto a las fotos (fuera de Git).

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

## Pasar un dron al pixel HD: objetivos

El pixel HD sale del HD: el modo Pixel pinta en directo la escena del HD
(forma, materiales, luz y calcas) a 1 px por píxel y la pasada final
(`uas-pixelado.ts`) la pasa a pixel art. Basta con `hd: true` en la maqueta;
no hay que dibujar nada aparte. Por eso **primero va el HD bien hecho**: un
fallo de forma, color o luz del HD sale igual en el pixel. Se fijó con el
MQ-9 el 1-oct-2026.

**Ya decidido** y no se pregunta: 1 px por píxel (el usuario eligió frente
a 2, 1,5 y «2 px más cerca»: «2 px parece muy pixel art, 1 px más un dibujo,
aunque me gusta como queda»), con marcas y costuras (la «B»), contorno de
fuera en negro, sin tramado y sin tornillos.

**Objetivos** (comprobados antes de enseñar nada):

1. **El mismo color y la misma luz que el HD**, desde el mismo ángulo. La
   luz va en siete escalones: la pintura del dron al sol tiene que caer en
   el centro de un escalón y no en el borde, o las caras grandes (el ala)
   salen a franjas. Se mide la luminosidad de la pintura en el HD; los
   escalones están puestos para el gris del MQ-9 (~0,8), y si otro dron cae
   en un borde hay que moverlos: `desfaseLuz` en la maqueta (el TB2, 0,48).
2. **Marcas que se lean**: cada calca, con tinta entera o nada. Se comprueba
   de perfil y desde donde se vean que salen todas.
3. **Líneas limpias**: contorno negro por fuera solo en lo que tiene tres
   píxeles de grueso o más; lo más fino (el ala de frente, colas, patas),
   como raya oscura de su color. Las líneas de dentro (una pieza delante de
   otra, juntas de flaps y alerones), del tono de la pieza más oscuro, nunca
   negras: las piezas oscuras (armas, lanzadores) tienen que distinguirse.
4. **Sin ruido**: ni píxeles sueltos ni tramado.
5. **Revisión pieza a pieza** en las cuatro vistas (3D, perfil, frente y
   planta) junto al HD, y de noche. Si algo está claramente mal, se arregla
   antes de enseñarlo.

**Lo que salió mal con el MQ-9 y no se repite**: el tramado hacía rayas en
las caras planas y puntos sueltos; los escalones repartidos en curva ponían
el ala en un borde y salía a franjas; con líneas negras, los lanzadores eran
un borrón; de frente, el ala y la cola eran barras negras; las marcas no se
veían (la tinta reducida se volvía gris). Sin resolver: en 3D, la punta de
la cola en V sale algo dentada.

**El 2.0 sustituye al 1.0 en todas partes**, no solo en el visor: también
la tarjeta de `/uas` y la planta de la tira de la portada. El usuario lo
dejó claro («ES DE CAJÓN») cuando el MQ-9 se cerró con las dos en 1.0, y
pidió que la tarjeta se viera **como el visor**: `tarjeta.png` y
`tarjeta-noche.png`, 256x144 a 1 px por píxel, quieta (se quitó el giro a
planta de todas las tarjetas), casi de perfil y un poco desde arriba y por
delante (79°, 11°: el ángulo que eligió el usuario con una captura del
visor; desde la vista 3D, 38° y 32°, el ala entera dejaba el cuerpo pequeño
y el dron parecía una X de palos), con un objetivo de 10° (con los 18° del
visor, al llenar la tarjeta, lo cercano salía exagerado), llenando el
recuadro y centrada con la perspectiva de verdad (sin ella, la punta del ala
se salía). La planta (`planta.png`), con un
teleobjetivo cerrado (8°) y las medidas de la 1.0. Salen de
`node arte/generar-uas-miniaturas-hd.mjs <modelo>`, con `npm run dev` en
marcha: un Chrome sin ventana las pinta con el mismo motor del visor
(`src/scripts/uas-miniatura-hd.ts`), y borra el giro 1.0 del dron.
`arte/generar-uas-miniaturas.mjs` se salta los drones con `hd`. Pasar un dron
al pixel HD incluye regenerarlas.

**Las naves del hero de la portada** (`src/data/aeronaves.ts`) también salen
del pixel HD cuando el dron está en el hangar (el TB2 y el MQ-9, desde el
2-oct-2026): `node arte/generar-naves-uas-hd.mjs [id]`, con `npm run dev` en
marcha, pinta `public/zodk-<id>.png` (dron en vuelo, morro a la izquierda,
sombra debajo) y da su `ratio` y sus `luces`; la de noche, con
`python3 arte/generar-naves-noche.py <id>` (el de `/usr/bin`, que tiene
Pillow). Vista E (90°, 28°: casi de lado y desde arriba), elegida por el
usuario. Se pintan a 260 px y se ven a la mitad (`ancho` 132): en retina,
1 px por píxel. **No pintarlas al tamaño que ocupan en pantalla**: a 1 px por
píxel y 60 px de ancho no caben el volumen ni las armas, y el dron queda en
una cruz gris (primer intento, descartado). En vuelo: el MQ-9 con el tren
recogido y armado; el TB2 recoge solo la rueda del morro.

## Dónde estamos

### Estado

- **Cerrados**: el MQ-9 (HD y pixel HD, desde el 1-oct-2026), el TB2
  (2-oct-2026) y el Shahed-136 (3-oct-2026, con su catapulta y el cohete de
  despegue), en `main` y publicados: en el visor, en las tarjetas de `/uas`
  y como naves de la portada.
- **Cerrado también el RQ-11 Raven** (4-oct-2026), con la pintura y las
  marcas del Raven del Ejército de Tierra en Eslovaquia (octubre de 2024):
  fusionado en `main` y publicado, rama `hd-rq-11-raven` borrada. Ver el
  registro.
- **Pendiente**: el rendimiento en Zen (`docs/rendimiento.md`; el Shahed con
  la catapulta, 150 piezas); las maquetas
  en espejo (abajo, «naves de la portada en pixel HD»); el zoom de los
  visores (abajo, «Para el final»); pasar los demás drones (objetivos de
  arriba).
- **En marcha: el Wildfire** (rama `hd-wildfire`, sin commit), con los
  renders oficiales; falta que lo revise el usuario. Ver el registro.
- **Cerrado también el MICH-2000** (5-oct-2026): la forma de la 1.0 con el
  detalle de la fábrica y la catapulta; fusionado en `main` y publicado,
  rama `hd-mich-2000` borrada. Ver el registro.
  Ver el registro.
- **Ramas**: ninguna abierta; `hd-mich-2000`, `hd-wildfire`, `uas-hd`,
  `hd-pixel-mq-9`, `hd-bayraktar-tb2`, `hd-shahed-136` y `hd-rq-11-raven`,
  fusionadas y borradas.

### Registro

Cada vuelta, tal como se fue apuntando. Lo que aquí dice «sin commit» ya
está en `main` (salvo el Wildfire, en su rama).

- **5-oct-2026, MICH-2000 en HD y pixel HD** (rama `hd-mich-2000`,
  fusionada en `main` y borrada). Lo pidió el usuario sin rehacer la maqueta («está bastante bien»,
  «no te vuelvas loco»): pasarla a HD fijándose sobre todo en lo que se ve
  en las fotos de la fábrica (tornillería, dibujos). La forma de la 1.0 se
  queda; no hay medidas ni fotos para medirla mejor. Hecho:
  - **Fuentes**: las de la 1.0 y, en `arte/uas-fuentes/mich-2000/hd/full/`
    (fuera de Git), dos más del artículo de Oboronka que no se usaban: el
    corte de un tramo del cuerpo (`ob-321329`) y el montaje con la silueta
    del dron en vuelo desde abajo (`doc-321324`). Las demás del artículo son
    mapas, un robot de la fábrica y una caja: no sirven.
  - **Cómo leer la foto de los drones de pie** (`cola-winglets.jpg`, mal
    descrita en la 1.0 como «por detrás»): son las alas con el cuerpo, de
    pie sobre la junta del morro, vistas **desde arriba**, con el borde de
    salida arriba; los morros (con los canards y la escarapela) van aparte,
    de pie delante. Los mandos van en la cara de arriba, como en el Shahed y
    en la foto del centro del ala (el ala, del derecho en su soporte).
  - **Pintura**: acabado nuevo `negro-ua`, neutro (el `negro` sale algo
    azulado) y muy mate (ver la revisión). Elevones en negro (en la 1.0,
    gris de mando).
  - **Morro** (foto del morro de cerca): junta de la tapa de la punta
    (z = 1,14) y del anillo de los canards (0,95), con un tornillo arriba en
    cada una; canards más altos (y = 0,065: en la foto y en el «333» salen de
    la parte alta del morro), algo más finos y con la **pieza de metal** de
    la esquina de detrás de la punta; **escarapela** como calca (nueva,
    `escarapela-ua`) bajo el canard, con el centro a la altura del borde de
    salida de su raíz.
  - **Tapa del costado izquierdo** (x > 0): la ranura negra del pulsador,
    15 × 4 cm, con ocho tornillos de **arandela blanca**, entre la escarapela
    y el ala. En la foto parece más lejos de la escarapela; con el ala de la
    1.0 no cabe más atrás (en esa foto el cuerpo no tiene el ala puesta).
  - **Juntas del cuerpo**: los anillos `junta` de la 1.0 pasan a costuras,
    con un anillo de tornillos (foto de las secciones); la de 0,55 pasa a
    0,42 (cruzaba la tapa del costado). Siguen a ojo.
  - **Ala, por arriba** (los drones de pie): dos **mandos por elevón**, a 0,3
    y 0,62 m: la tapa del servo con un tornillo en cada esquina, el brazo rojo
    que asoma por una ranura, la varilla de metal y el cuerno blanco en el
    elevón. Una tapa cuadrada atornillada entre los dos, la **escarapela**
    hacia la punta, «**НЕ БРАТЬСЯ**» en blanco en cada elevón (leído en la
    foto, del revés: se lee desde detrás del dron), y la tapa del lomo detrás
    del ala con tres pestillos.
  - **Costuras y tornillos** en claro (`claro` en la costura: línea
    gris clara y tornillos de metal; en un dron negro, los oscuros no se
    ven). Los tornillos que se miran de cerca van como calcas (`disco`),
    que crecen con el zoom; las calcas iguales comparten la textura.
  - **Pixel HD**: la pintura al sol, desde arriba, cae en 2,7–2,9
    escalones: `desfaseLuz` −0,3. Tarjeta con `vistaTarjeta` [65, 30] (como
    el Shahed: casi de lado, el ala en delta no se ve) y planta regeneradas;
    fuera los `giro-planta` 1.0.
  - **Visto y sin tocar**: las letras blancas grandes «H» y «V» de las alas
    de pie (marcas de la fábrica: el «333» no las lleva; el usuario no las
    quiere) y la placa de dos conectores de una de ellas, sin sitio claro.
  - **Primera revisión del usuario (5-oct-2026)**, hecho:
    - **Negro, no gris oscuro**: con rugosidad 0,6 el ala reflejaba el cielo
      y desde arriba salía gris (~#666; bajar el color casi no cambiaba
      nada). `negro-ua` pasa a #1c1d1d con rugosidad 0,82: desde arriba,
      ~#323333, y la forma se sigue leyendo en 3D. `desfaseLuz` +0,15 (la
      pintura cae en 1,35 escalones). Planta y tarjeta, negras.
    - **Canard un 25 % más grande**: punta en x = 0,44, cuerda de 0,18 en la
      raíz (de la junta de la punta a la del anillo) y 0,09 en la punta.
    - **Hélice de 0,84 m** (un tercio de la envergadura; la 1.0, 0,56): las
      de las alas de la fábrica china dan ~0,32 de la envergadura y la
      silueta en vuelo algo más.
    - Las letras «H» y «V» de la fábrica, **no** (decisión del usuario).
    - **Escarapelas desde arriba, desvaídas** (las señaló el usuario en
      pixel): la calca, con rugosidad 0,55 sobre el negro mate, reflejaba el
      cielo y salían amarillo crema y azul lavanda (con colores más oscuros
      no se arreglaba). Ahora, sobre una pintura muy mate (rugosidad > 0,7),
      la calca va igual de mate; para eso cada malla lleva su `acabado` en
      `userData`. Los demás drones no cambian.
  - **Pies de foto del artículo**: `fuselaje-secciones.jpg` es «Бойова
    частина», la **cabeza de combate** (el tramo del morro con la
    escarapela); `cola-winglets.jpg`, «"Тушки"», los cuerpos de los drones
    por terminar; y hay una foto del **cohete de arranque** en su caja
    (`hd/full/ob-321333-booster.jpg`, «Ракетний прискорювач для старту
    дрону українського виробництва»). El artículo cuenta que despega con
    cohetes (бустери) desde lanzadores: RATO, como dice el glosario.
  - **Catapulta** (la pidió el usuario, «igual que en el Shahed»; con lo
    que no se ve, aproximado). Despega con **RATO**: el artículo de Oboronka
    cuenta que lo sacan de lanzadores con cohetes (бустери) y que acabaron
    haciéndolos ellos. La rampa, de las fotos del «333» al atardecer: dos
    largueros negros en U a ±0,13 m, calados con agujeros, de z = −1,25 (casi
    en el suelo) a 1,75 (0,35 m por delante del morro), inclinados 22°; dos
    caballetes en A (bajo el morro, z = 1,2, y bajo el ala, z = 0) con aspa,
    travesaño, una riostra entre ellos y patas de husillo sobre discos a
    ±0,45 m; patines en la panza. El **cohete**, de la foto en su caja: cuerpo
    cromatado (acabado nuevo `cromato`), tramo de delante de metal
    escalonado, abrazadera negra y, en la tobera, una silla de bronce con dos
    pasadores; 15 cm por algo más de 1 m, bajo la panza entre los largueros,
    con dos colgadores (cómo se sujeta no se ve). Partes H («Rampa de
    lanzamiento») e I («Cohete de arranque»), fuente nueva `cohete`.
  - **«Despegue» en las características** (lo pidió el usuario): fila nueva
    en las ocho notas de la bóveda, detrás de «Motor»: RATO desde una rampa
    (MICH, Shahed, Geran; en los dos últimos estaba dentro de «Motor» y se
    quitó de ahí), desde pista con tren (TB2, MQ-9), a mano (Raven), VTOL
    (X10D) y no publicado (Wildfire). En la web sale al importar, que solo
    se hace en `main`.
  - **Planta de la portada lisa** (el usuario: las escarapelas «se ven
    cuadradas»; si no se leen como un círculo amarillo y azul, nada): a 72 px
    cada escarapela ocupa unos 4 px. `plantaLisa` en la maqueta pinta la
    planta sin calcas ni costuras; queda el dron negro.
  - Fusionado en `main` y publicado el 5-oct-2026, con la fila «Despegue»
    importada. Falta: rendimiento en Zen.

- **4-oct-2026, Wildfire en HD y pixel HD** (rama `hd-wildfire`, sin
  commit). Lo eligió el usuario entre el Wildfire y el MICH-2000, con los
  renders oficiales, la pintura de General Atomics tal cual y los cuatro JSM
  («no es reciclar del MQ-9, es aprender de él para no cometer los mismos
  fallos»: forma medida de cero, nada copiado del Reaper). Hecho:
  - **Fuentes**: `arte/uas-fuentes/wildfire/hd/` (fuera de Git). Los
    originales de la galería de `ga-asi.com/remotely-piloted-aircraft/
    wildfire` (`imgs/Wildfire-Media-Graphics_Sc{A,B,C}_…`): **A** (enjambre,
    desde detrás y arriba, 1290x726), **B** (desde abajo y delante con los
    cuatro JSM, 1920x600, la más nítida) y **C** (desde arriba lanzando un
    LRASM, 1290x726). Las de TWZ y el vídeo de YouTube son las mismas,
    reescaladas: no aportan. B es un recorte del 16:9 del vídeo: encajándolo
    por correlación, su centro óptico está en (955,7; 252,6) (`registrar.py`).
    Sin medidas publicadas.
  - **Cómo se midió** (nuevo; sin fotos no hay ni una medida): se marcaron
    a mano en los tres renders unos 30 puntos que se reconocen en varios
    (cámara de la punta del morro, sonda, torreta, antenas del lomo, puntas
    de la V, las seis esquinas de cada aleta de las puntas, antena de pala,
    aleta ventral, aro de la hélice, puntas y colas de los JSM) y
    `reconstruir.py` encaja a la vez las tres cámaras (rotación, posición,
    focal) y la posición 3D de los puntos, con el dron simétrico (los del eje
    en x = 0, los de los lados en pareja). La escala, de los JSM (3,70 m;
    las dos parejas paralelas y a la misma altura). Error medio 1,4 px.
    Remuestreando los píxeles (±1,5 px, 12 veces): largo del morro al aro de
    la hélice 10,26 ± 0,14 m, envergadura **22,1 ± 0,8 m** (lo menos seguro),
    punta de la V a 1,94 ± 0,11 m de alto. Después `medir.py` lleva píxeles a
    3D: cortando con un plano, triangulando un punto en dos renders, cortando
    los planos de un borde visto en dos (los bordes del ala) o siguiendo una
    línea viva de un render a otro (`epi`, la arista del costado).
  - **Errores por el camino**: (1) en C y en A los lados salen cambiados
    respecto a como los marqué (el espejo de las maquetas otra vez); con los
    lados bien, el error de A bajó de 72 px a 0,4. (2) A es casi ortográfica
    (campo de 10°) y la búsqueda de cámara caía en la vista espejo, desde
    delante; `camara-sola.py` arranca desde un ángulo dado. (3)
    `encajar-camara.mjs` también se atasca en A: su `.cam.json` sale de
    `camara-sola.py`. (4) Puntos mal leídos que se fueron: el capuchón de la
    cola tomado por el buje, un bulto del borde de salida en A, los
    carenados en C (son varios y no se sabe cuál es cuál).
  - **Forma**: cuerpo en un `casco` con la **arista viva** del costado (medida
    con `epi`: 0,69 m de medio ancho y y = 0,15 en z = 2,7, bajando hasta la
    cámara de la punta, metida en la arista), la cara de abajo del morro más
    plana (una cuchara, como en B), la **joroba del motor** de la misma pieza
    hasta la boca del escape (0,77 m en z = −2,4), que acaba de golpe en un
    capuchón facetado de metal. Ala del corte de bordes de B y C: cuerda de
    1,92 m a 0,76, plana; flap y alerón con su hueco (corte a 6,47 m, A),
    pasando poco a poco a la bisagra (sin escalón: lección del Shahed);
    carenados encima del borde de salida (A y C; desde abajo, en B, el ala
    está limpia). **Cola en V** en el plano que da su vista de canto en C (35°
    sobre la horizontal), con las esquinas de A llevadas a ese plano; nace
    del costado; timón en la mitad de fuera. Aletas de las puntas en flecha
    arriba y abajo (seis esquinas encajadas). Aleta ventral y antena de pala
    medidas en B. Torreta con su capucha, la cara cuadrada
    oscura, tres ventanillas y la pegatina amarilla. Ocho antenas redondas en
    el lomo (una blanca).
  - **JSM**: sección casi cuadrada y más ancha que alta, con la boca
    trapezoidal abierta (`casco` con `abierto`), aletas en X, ganchos, viga y
    soporte con perfil. El `casco` admite ahora `x` (desplazado del eje).
  - **Color**: `gris-ga` nuevo (#a6a6b2): con el `gris` del MQ-9 el visor
    salía azulado; medido en C sobre puntos proyectados de la maqueta, render
    0,73 de media al sol y visor 0,75, los dos gris neutro.
  - **Marcas**: en los renders no se ve ninguna (ni escarapela ni números);
    solo la tapa del costado delante del ala y la junta del capuchón, como
    costuras.
  - **Pixel HD**: sin franjas en el ala con los escalones de siempre (no hace
    falta `desfaseLuz`). Tarjeta con `vistaTarjeta` [61, 20] (con la de todas,
    la mitad cercana de la V salía negra) y planta regeneradas; fuera los
    `giro-planta` 1.0 y las seis miniaturas de fuentes viejas (TWZ y New
    Atlas: las mismas imágenes, peores). No es nave del hero.
  - **Toma de aire rehecha** (la señaló el usuario: «tiene una puñetera toma
    de aire centrada arriba, como todos los aviones»; en la primera vuelta
    la puse solo en el costado izquierdo porque en C se veía a un lado, y la
    de verdad desapareció: el mismo error del MQ-9). **Va en el centro, en
    lo alto**: una góndola del mismo cuerpo (`lomo` del `casco`, de 0,2 a
    0,3 m de medio ancho, hasta 0,92 m de alto) detrás del ala, abierta por
    los dos lados. **Boca** (C, cortando con el eje): z = −0,585, centro a
    0,64 m, unos 0,35 × 0,22 m, con labio redondo y un tabique vertical; la
    góndola se afina hasta ella como una bala. **Salida del escape** (A):
    z = −2,4, 0,45 × 0,29 m, lo alto a 0,91, mirando atrás, con la chapa de
    metal detrás hasta el capuchón. Las dos encajan con el eje en las dos
    vistas (la boca de C proyectada en A y la salida de A en C caen donde
    deben), y en C se ven además, justo en el eje, una ranura en lo alto de
    la góndola (z ≈ −1,1) y una toma pequeña en cuña (z ≈ −0,8), añadidas.
    Ojo con el motor: un `casco` no tiene agujeros; si la cara de la góndola
    tapa la boca, el fondo «hueco» sale claro. La cara de delante va detrás
    del labio y la de atrás delante de la salida, y el fondo oscuro de cada
    conducto, justo fuera de la cara.
  - **Segunda vuelta de la toma** (el usuario: «dale un poco más de trabajo…
    suavizado, agujeros, formas; el trasero cae un poco diferente»), todo
    comparado con A y C desde sus cámaras:
    - **Suavizado**: el `casco` admite `pLomo` (norma de la unión del lomo
      con el cuerpo; 8 por defecto, los demás drones igual): la góndola, con
      4, se funde con el cuerpo sin el pliegue de antes. La góndola se afina
      más despacio hasta el labio (en C, una bala) y se estrecha al final
      hasta el borde del escape, sin escalón visto desde delante.
    - **Escape**: el boquete ocupa casi toda la cara de atrás de la góndola;
      el borde es la propia góndola (en la primera vuelta asomaba el aro por
      encima).
    - **El trasero**: midiendo con A y C, la junta de la chapa con el
      capuchón está en z ≈ −3,2 a ~0,49 m (antes el capuchón empezaba en
      −3,43). El cuerpo cae detrás del escape con la cara de arriba casi
      plana (n = 3) y algo más alto (C: ~0,6 en z = −2,85), y por debajo
      sube antes, cerrándose en el buje (z ≈ −3,58). El capuchón es una pieza
      más estrecha, de aluminio, encima: un escudo con el borde de arriba
      recto y los lados en punta abajo (A); antes era un bulbo de metal que
      ocupaba toda la cola. La chapa, de metal más oscuro que la pintura
      (en C, 0,54 frente a 0,73 al sol; en A sale azul porque refleja el
      cielo), casi a ras, con los cantos como costura.
    - Probado y quitado: dos rebordes a los lados de la chapa (las rayas
      claras de A), como cascos aparte: salían como tubos posados; las rayas
      son los cantos de la chapa.
  - **JSM rehecho a partir del misil de verdad** (lo pidió el usuario: «no
    tienes que fijarte tanto del render como del tipo de armamento»). Del
    render solo queda cómo va colgado (dos por ala, viga y soporte); la
    forma, de las maquetas 1:1 de Kongsberg (Farnborough, ILA 2024, la
    entrega a Japón, Bruselas, Japan Aerospace 2016), el corte de la PSAR de
    2014 y los renders de Kongsberg (`arte/uas-fuentes/jsm/`, con su
    `FUENTES.md`). Medidas oficiales: 4,00 m, 0,48 × 0,52 m plegado. **Ojo:
    el primer JSM se escaló con 3,70 m** (como el NSM); el dron se queda con
    su escala (decisión del usuario: «es una maqueta»), y el misil se
    escribe en metros reales y se reduce entero a los 3,70 m que ocupa
    (`KJ`). Lo que tenía mal el de antes: la «boca trapezoidal abierta» del
    morro era la **ventana del buscador infrarrojo** (cristal oscuro en la
    cara de abajo del morro, que da la vuelta por los costados; calca nueva
    `ventana`, un trapecio con brillo); el cuerpo era demasiado ancho; las
    aletas no eran así. Ahora: morro en cuchara, cuerpo más ancho que alto
    con arista baja y panza plana, junta del radomo a 0,82 m, **toma de aire
    en el costado izquierdo**, abajo, detrás del ala (ranura alta, solo en
    ese lado en la maqueta de Farnborough), alas **plegadas en tijera
    encima** (como van colgados; una hacia delante y otra hacia atrás, corte
    de 2014), cuatro aletas de cola en X, cola redondeada con la tobera y
    dos anclajes de 30" hasta la viga.
  - **Revisión del usuario (5-oct-2026)**, analizada con fotos antes de tocar
    y aprobada; hecho:
    - **Boca del JSM**: era una calca plana. Ahora es una cavidad: el morro
      hasta 0,25 m solo tiene la mitad de arriba (un labio que vuela) y
      debajo, metida, la ventana (`jsm-ventana`, `lente`): dos cristales
      planos en V (nAbajo 1,15). Calca `ventana` ya no se usa en el JSM.
    - **Aleta ventral**: medida en B y A a la vez (esquinas de abajo
      triangulando): borde de detrás en z = −2,02 (antes −1,98). Timón aparte
      con su hueco (bisagra a −1,73/−1,79) y la barra que la cruza a media
      altura (`aleta-ventral-barra`).
    - **Línea del cuerpo**: la arista hacía una S (secciones medidas a
      trozos); ahora es una recta (`ARISTA(z)`) de la cámara del morro a la
      hélice. El cuerpo, un 20 % más estrecho por delante de la góndola
      (`ANCHO`; con la silueta sobre B y C el de antes se salía por arriba) y
      la mitad de abajo en trapecio (panza al 60 % del ancho).
    - **Cámara**: capucha redonda en planta, bola casi esférica con la cara
      de delante plana, lente en un tubo corto con aro oscuro, tres ventanas
      pequeñas (dos juntas y una debajo) y la pegatina amarilla en el costado.
    - **Toma de aire**: la boca, un 22 % más pequeña (`TOMA.k`), con la
      góndola afinada hasta ella. **Escape al revés**: lo de abajo va más
      atrás (corte inclinado, la boca mira arriba y atrás). Como un casco no
      se abre por arriba, la góndola acaba en un corte recto y detrás van el
      conducto oscuro con la cara de arriba inclinada (`escape-conducto`) y
      dos bordes que bajan con el corte (`escape-borde-±1`). Cantos de la
      chapa en relieve y claros (`reborde-±1`, aluminio) y las aristas del
      capuchón como costura.
  - **Segunda revisión (5-oct-2026)**:
    - **Boca del JSM, otra vez** («la apertura es como una O, como una boca
      abierta; el tuyo es una cavidad hacia abajo»). Mirando el render de
      Kongsberg de frente y las maquetas de Farnborough y Japan Aerospace: la
      ventana está en la **cara de delante** del morro, mirando adelante: un
      rectángulo de esquinas redondeadas, más ancho que alto, en la mitad de
      abajo de la cara, con su marco alrededor y dos cristales planos que se
      juntan en una arista vertical. Ahora el morro es romo, solo existe lo
      de encima de la ventana hasta 0,035 m y ahí el cuerpo baja de golpe;
      en esa cara va la ventana (`jsm-ventana`, una cuña de 1,4 cm con la
      sección casi rectangular, n = 5) y alrededor queda el marco.
    - **Aleta ventral pegada al cuerpo**: con la panza nueva, más estrecha,
      quedaba separada; la raíz va ahora metida (y = −0,25).
    - **Horquilla de la cámara** (el soporte de elevación que señaló el
      usuario en el render B): un brazo a cada lado colgado de la capucha,
      con el eje redondo a media altura.
    - **Escape suavizado**: fuera los dos bordes (`escape-borde`), los
      cantos de la chapa en relieve y las aristas del capuchón (el usuario
      los quería quitados). La góndola baja siguiendo el corte, algo por
      debajo del conducto oscuro (de lomo plano, n = 5), y en ese tramo la
      unión del lomo con el cuerpo va con `pLomo` 12 (con 4 abombaba el
      centro por encima del conducto y lo partía en dos, como una pajarita).
      La n del cuerpo pasa poco a poco de 2,3 a 3 detrás del escape (de golpe
      dejaba una línea en el costado).
    - **El conducto oscuro ya no sobresale por los lados** (el usuario: «la
      oscuridad no tiene sentido que sobresalga»): más estrecho que la
      góndola (0,18 m de medio ancho) y con los costados hundidos en ella
      (cintura a 0,5); solo asoma por el corte.
  - **Falta**: que lo revise el usuario; rendimiento en Zen; la ficha de la
    bóveda dice «unos 20 m de envergadura» y la maqueta da unos 22 (no se ha
    tocado la nota). Visto y sin hacer: la hélice no se ve en ningún render
    (tamaño y palas supuestos).

- **4-oct-2026, RQ-11 Raven en HD y pixel HD** (rama `hd-rq-11-raven`,
  fusionada en `main` y borrada; el usuario lo dio por bueno: «ahora mejor
  sí»). Lo eligió el usuario el día antes, **pintado como el del Ejército
  de Tierra** y con la forma sacada de las muchas fotos de Raven americanos
  («hay muchísimas fotos de este dron»). Hecho:
  - **Fuentes**: `arte/uas-fuentes/rq-11-raven/hd/` (fuera de Git):
    `indice.json` (las 552 fotos de las categorías de Commons del Raven),
    `full/` (las que se usan, de la Guardia Nacional de Iowa, del Ejército de
    EE. UU., las tres del Ejército italiano en Cerdeña de 2023 y las checas)
    y `es/` (las españolas de prensa). Commons ya solo sirve miniaturas de
    tamaños fijos (1920, 3840) y corta con 429 si se bajan originales
    seguidos: bajarlas despacio.
  - **Avión de las marcas**: el **Raven digital del Ejército de Tierra en la
    misión de la OTAN en Eslovaquia, octubre de 2024** (El Español y la
    galería de Defensa.com, desde arriba; el gimbal, también en la de la
    exposición de 2017 de Defensa.com). Gris muy claro, sin bandera ni
    números; flechas rojas en la junta del ala izquierda y verdes en la
    derecha, rojas en la junta del botalón y en la del estabilizador; cinta
    gris azulada en los bordes de cada junta, un parche grande en la punta
    izquierda y otro en el centro, y tiras negras en el borde de ataque de la
    punta izquierda.
  - **Forma**: el perfil de la barquilla, sacado columna a columna contra el
    cielo de la foto de Spangdahlem (1149 px/m con los 0,91 m), con la cámara
    encajada después: errores de 1 a 10 px. **Barquilla de una pieza**
    (`casco` con `lomo`): costados planos, panza abombada, el cuello del ala
    fundido con un hombro cóncavo y la caída de detrás hasta el botalón (en
    la 1.0, placas con bisel). **Ala**: el centro es de **0,50 m** (la 1.0,
    0,40): encajando la foto española desde arriba, el error medio baja de
    13 px a 8; la punta (12 cm) se estrecha por los dos bordes (con todo el
    estrechamiento delante, como la 1.0, el doble de error). **Módulo de la
    cámara**: capucha de casco más ancha abajo, bola de 8,8 cm con su tapa de
    seis tornillos y dos ventanas, cuerpo del gimbal detrás y el cerco claro
    de la cara delantera de la barquilla. **Hélice** de 18 cm (foto de
    detrás, a escala con el centro del ala). Pestillo del ala, tapa del
    motor, cuerno y varilla del timón.
  - **Color**: `gris-et` pasa a #b9c4cf: al sol, el render da #d9dde1 y la
    foto española desde arriba, #d9dfe6 (la 1.0 tenía un gris verdoso más
    oscuro, de la foto de 2009 bajo techo). Acabado nuevo `hueso` (el cerco).
  - **Detalle**: calcas nuevas `rect` (cinta), `flecha`, `flechas`, `ddl`,
    `etiqueta` (con `titulo`, el «CAUTION» del módulo) y `rejilla` (la placa
    de nervios del costado); tapa de la batería y tapa del módulo con sus
    tornillos. Una calca solo cae en una pieza: las flechas y la cinta de las
    juntas del ala van en dos, una a cada lado.
  - **Pixel HD**: la pintura al sol caía justo en el borde de dos escalones
    (6,0): `desfaseLuz` −0,5. Tarjeta con el ángulo del TB2 (`vistaTarjeta`
    [61, 20]; con el de todas, el ala salía de canto) y planta regeneradas;
    fuera los `giro-planta` 1.0. No sale en la portada (no es nave del hero).
  - **Errores por el camino**: (1) la foto del Raven en el suelo junto a la
    mochila (Cerdeña) no encaja: el ala de delante apoya en la mochila y se
    dobla; no vale para medir el ala. (2) Las fotos de cerca con casi todos
    los puntos en el eje del dron no fijan la cámara (sale desde detrás o
    con teleobjetivo): hacen falta puntos de las puntas del ala.
  - **Segunda pasada** (lo pidió el usuario: «matizar un poco más», para no
    encontrarse fallos de diseño), con las fotos de cerca: la **sonda** de la
    cara delantera del cuello, bajo el ala (base negra con tuerca y una
    varilla de unos 3 cm; foto italiana de perfil y la de Iowa), la
    **rendija** vertical a cada lado del cuello, el **borde de la capucha**
    que vuela un poco hacia fuera, y la cara delantera del cuello casi
    vertical con un empalme cóncavo abajo (antes, inclinada). Tarjeta y
    planta regeneradas.
  - **Cola corregida** (la señaló el usuario con la foto española desde
    arriba; analizado con fotos y aprobado por él): el estabilizador iba
    debajo de la deriva (error que venía de la 1.0) y va **detrás**,
    enganchado al final del botalón con un **pasador amarillo** (se suelta en
    los aterrizajes de golpe). Lo dicen la foto en vuelo desde abajo (la
    deriva acaba y ahí empieza el estabilizador), la española desde arriba con
    la cámara encajada, la de Spangdahlem de perfil (el botalón acaba en el
    borde de salida del timón, con el pasador) y la italiana en el suelo.
    Borde de ataque recto, el estrechamiento en el de salida: 8,5 cm de
    cuerda en el centro y 6,5 en las puntas, 40 cm de punta a punta; herraje
    negro bajo el pasador. El botalón acaba ahora en el timón (−0,572). La
    deriva se queda (3 a 7 px en el perfil). Visto y sin tocar: en la foto de
    Spangdahlem el estabilizador sale girado unos 6° respecto al ala (va
    suelto, sujeto por el pasador); no se puede modelar fijo.
  - **Cinta americana** (lo pidió el usuario): los parches de cinta son
    plateados, con la trama de tela, los extremos rasgados y brillo de metal
    (calca nueva `cinta`, con `metalness` 0,55); las tiras del borde de
    ataque siguen negras.
  - **Última revisión del usuario** (en local, con cinco fotos suyas,
    guardadas como `hd/full/usuario-*.png`), analizada con fotos y hecha:
    - **Panza**: era parte del mismo cuerpo, con el fondo curvo. En las fotos
      es una quilla aparte: la caja acaba a −0,099 con una arista y debajo
      abomba la panza (fondo a −0,138 en Spangdahlem), algo más estrecha,
      con el frente redondo detrás del cerco. Ahora la caja tiene el fondo
      plano y la panza es un `casco` propio.
    - **Color** menos azulado: `gris-et` #bdc1c4 (al sol, #d8dadd).
    - **Tapa de la batería**: placa apenas salida con su ranura (calca
      nueva `marco`) y un tornillo en cada esquina, medida en Spangdahlem.
      Fuera las dos pegatinas de la tapa y la rejilla pintada.
    - **Disipador**: el «radiador» es una placa negra con aletas que
      sobresalen, solo en la tapa del lado derecho (fotos italianas; en el
      izquierdo, Spangdahlem, no hay), en el tercio de atrás.
    - **Flechas**: las del botalón eran un par aplastado sobre la junta;
      ahora una a cada lado, a lo largo del tubo, apuntándose. La del
      estabilizador, una sola junto al pasador, apuntándole.
    - **Las «grapas» de la cola**: en la cara izquierda de la deriva van la
      tapa clara de los servos y dos mandos: la varilla del timón con su
      cuerno amarillo y, abajo, la del estabilizador, negra con un tramo rojo
      (Spangdahlem, VAMTAC y AeroVironment).
  - **Panza y hélice, más matizadas** (lo pidió el usuario), con fotos de
    cerca:
    - **Panza** (tercera vuelta; el usuario, con razón: «¿no eres capaz
      de ver que son dos piezas separadas?»). En todas las fotos (Spangdahlem,
      la del usuario desde abajo, el render de AeroVironment, la del
      Ejército de Tierra de 2009) la panza es **otra pieza**: una quilla
      redondeada **más estrecha que la caja** (unos 6 de los 8 cm) colgada
      bajo un **fondo plano** con el borde marcado; frente redondo detrás del
      cerco, se mete en la caja hacia la mitad. Error mío por el camino: la
      ensanché hasta el ancho de la caja para quitar un fallo de pintado y
      acabé fundiéndola con ella, borrando justo lo que se ve. Además, el
      **fondo de la caja y la parte de abajo del botalón son una sola línea
      recta** de la barquilla a la cola (lo preguntó el usuario con la foto de
      2009; la línea que marcó en Spangdahlem, llevada a la maqueta con la
      cámara, lo confirma): `fondoCaja` es la prolongación del botalón
      (−0,111 m detrás del cerco). Antes la caja bajaba más que el botalón y
      quedaba un escalón. La silueta de la panza, ajustada contra la foto de
      Spangdahlem con la cámara encajada (`hd/ajpanza.py`) a ±1–2 mm; el
      cerco acaba en el fondo nuevo. Con la panza más estrecha la junta es una
      arista, sin z-fighting.
      Después (lo pidió el usuario: «hay algún borde como recto raro»), la
      panza **suavizada**: 54 secciones calculadas, con la nariz y la cola en
      media elipse en planta y en hondo, y la sección ovalada (n = 2). Con
      las 15 secciones a mano, el ancho iba a saltos: caras planas, la cola
      en flecha y, al final, una lámina fina y ancha pegada al fondo (allí
      la cintura quedaba por debajo del fondo de la panza y la mitad de abajo
      salía del revés). Ahora el ancho se cierra a la vez que el hondo. La
      silueta sigue a ±1 mm de la foto (2–3 mm en la cola, donde se apaga).
    - **Hélice**: de 13,5 cm (antes 18, de una foto movida): la pala sale
      unos 5,5 cm del cono en las italianas y en la de Polonia, a escala con
      el cono. Palas anchas en la raíz y afiladas hasta la punta (`helice`
      admite `punta`), blancas con una franja azul a media pala por las dos
      caras; sin bola blanca en el centro (`buje: 0`). Cono negro abombado
      como una bala, con el capuchón de la punta.
  - **Sin insignias españolas**: el usuario preguntó si el Ejército de Tierra
    le pone algún dibujo de España. En ninguna de las fotos españolas (la de
    Eslovaquia de 2024 desde arriba y al lanzarlo, la de la exposición de
    2017, la del campo de 2024 de Defensa.com, la del VAMTAC de Infodron ni
    la de la exposición de 2009 de Commons) lleva bandera, escarapela,
    «ET» ni número pintado: solo las etiquetas del fabricante (DDL, aviso
    del láser, códigos de barras), las flechas de las juntas y la cinta.
  - Falta: que lo revise el usuario; rendimiento en Zen.

- **3-oct-2026, Shahed-136 en HD y pixel HD** (rama `hd-shahed-136`, sin
  commit). El usuario eligió el Shahed («aprender de las lecciones del MQ-9 y
  del TB2») y, para las marcas, el **ejemplar de la exposición de Kermanshah
  de septiembre de 2023** (fotos de Fars y Mehr; las galerías originales no
  tienen más ni más grandes que las de Commons, 800–1300 px). Pidió que
  mande el dron iraní sobre los restos rusos o ucranianos y dejó mezclar
  ejemplares iraníes para las marcas. Hecho:
  - **Fuentes**: `arte/uas-fuentes/shahed-136/hd/` (fuera de Git): `full/`
    con las fotos iraníes (Kermanshah, Qom, Parque Aeroespacial, desfiles),
    los dos planos de Alexpl (2023 y 2024: la misma forma, 3,35 m medidos
    por la envergadura; los «3,5 m» de la barra y del cartel de la
    exposición son redondeos), los de la DIA, los restos del Mercer Street y
    los motores expuestos en Kiev; `ajustes/` con las cámaras encajadas de
    Kermanshah de lado y de Qom de frente.
  - **Forma**: la planta del plano de 2024 se comprueba con las dos fotos
    encajadas (errores de 2 a 15 px). **Es un tubo con un ala gruesa, sin
    carenado**: en las fotos la unión del ala con el cuerpo es una línea; el
    ala (0,19 m de grueso a 0,3 m del centro, 0,055 en la punta, plano de
    frente) corta el tubo de 0,294 m a 8,5 cm sobre el eje y del tubo solo
    asoma un lomo. Cuerpo en `casco` redondo; la punta del morro, un casquete
    esférico de 8,35 cm con las secciones por ángulo y `polo` (nuevo en el
    `casco`: la normal del eje en la punta; sin él, un hoyuelo de luz).
    Winglets simétricos (en la foto, el vértice queda a 92 px de la esquina
    de arriba y a 93 de la de abajo: la sensación de que cuelgan la dan el
    cartel y la perspectiva). Elevones en dos tramos con la junta del ala a
    0,72 m; **un cuerno con su varilla en cada elevón, a 0,645 y 0,775 m**
    (plano y las dos fotos con la z de la bisagra fija; la primera vez los
    puse a ojo a 0,4 y 0,47). **Un solo pitot**, en el ala izquierda a
    0,77 m (Qom). Motor MD550 con cárter, cuatro cilindros con aletas, culatas,
    bujías, admisión, escapes, corona dorada, buje con seis pernos y hélice
    blanca. Antena negra y CRPA de cuatro elementos en el ala derecha; caja y
    tacos del lanzador bajo el lomo.
  - **Marcas** (calcas nuevas `bandera-ir` y `qr`): el cartel de la bandera
    con «MADE IN I.R.IRAN» y «ساخت ایران» en la cara de fuera de cada
    winglet (medido con la cámara: y de 0,05 a 0,21, z de −1,31 a −1,55; en
    la exposición es una placa puesta encima, se dibuja como calca) y el QR
    del ala derecha. Tapas y tornillos de la planta del plano (coinciden con
    las fotos), junta del tramo de fuera arriba y abajo, dos agujeros bajo
    cada ala.
  - **Color**: `crema-ir` (#bcae95): al sol el render da #dad0bf, como la
    foto de Qom (las de Kermanshah salen amarillenta una y gris la otra por
    su luz). `aluminio` (nuevo) para el motor y `laton` para la corona.
  - **Pixel HD**: la crema al sol cae en 5,5–5,9 escalones: `desfaseLuz`
    −0,2. Tarjeta con su ángulo (`vistaTarjeta` [61, 20], el del TB2: con el
    de todas, casi de lado, el ala en delta no se veía), planta y nave del
    hero (`generar-naves-uas-hd.mjs shahed136`, vista E, `ancho` 132; sin
    luces: el Shahed no lleva). Fuera los `giro-planta` 1.0.
  - **Errores por el camino** (para no repetirlos): (1) **la maqueta va en
    espejo**: el ala izquierda de verdad es la de x positiva; al encajar
    fotos con el signo cambiado, nada cuadraba (salía la cámara desde
    detrás y por debajo). (2) **Lo que se ve de un anillo desde arriba es su
    borde de arriba**, no su centro: marcado como centro, el encaje de Qom
    dejaba el morro de la maqueta ancho y largo. (3) En fotos muy cercanas
    (el Shahed se fotografía a 2–3 m), `encajar-camara.mjs` necesita
    `dMin` (nuevo, en el json del ajuste; por defecto 4 m). (4) Esquinas
    tapadas por el lanzador o el cartel, leídas mal: mejor pocos puntos
    seguros.
  - El Geran-2 (no publicado) importa estas piezas: cambia con ellas.
- **3-oct-2026, primera revisión del usuario del Shahed** («está muy muy bien
  realmente»), analizada con fotos antes de tocar y aprobada punto por punto:
  - **Dos líneas a lo largo del ala que parpadeaban**: el escalón del borde de
    salida en x = 0,23 (del hueco del motor a la bisagra, dos estaciones en
    la misma x). A cada lado el perfil se reparte sobre otra cuerda y no
    casan (un pliegue en todo el ala), y la pared del escalón, pegada a las
    caras, hacía z-fighting. Ahora el borde pasa poco a poco de 0,20 a
    0,26 m (la esquina del hueco, redondeada como en el plano); igual en la
    punta, de la bisagra al borde de los elevones. **No usar escalones en
    alas gruesas.**
  - **Bandera sobre la cabeza de combate** (la del de Qom; el de Kermanshah
    la lleva lisa): `bandera-ir` con `pegatina`, solo la bandera con «ساخت» y
    «ایران» a los lados del emblema, justo delante del anillo. Los bordes
    medidos al ras de la superficie salían detrás del anillo: mandan el
    centro medido (z = 0,95) y la foto (empieza en el anillo).
  - De Qom también: el **conector** en lo alto, unos 10 cm detrás del anillo,
    y los **tornillos** de la cabeza de combate (un anillo de ocho en z =
    1,36). No hay más marcas en las fotos iraníes (el «A642» del desfile
    choca con el cartel de Kermanshah en el winglet).
  - **Dos pitot** (Parque Aeroespacial y los dos planos; el de Qom, uno).
  - **Color** un punto menos crema: `crema-ir` #b8ae9e.
  - **Tarjeta** a [65, 30], encajando la cámara sobre una captura del visor
    del usuario.
  - **Nave del hero** a 42° de elevación (vista [90, 42]), como la 1.0: con la
    vista E de 28° el ala en delta no se leía. `ratio` 263 / 185.
- **3-oct-2026, catapulta del Shahed** (la pidió el usuario con un botón, y
  pasó fotos y renders de referencia, guardados como `full/usuario-*`):
  - **Fuentes**: el lanzador ligero de Kermanshah (el ejemplar de las marcas,
    foto de lado), el de Qom (otro distinto: raíles cortos, el dron en la
    punta; fotos 42, 95 y la de frente de abajo), el render de TurboSquid
    del mismo lanzador de Kermanshah (solo como guía de cómo es por detrás;
    no se copia), y la infografía de drone-warfare con el cohete de
    despegue bajo la panza.
  - **El dron va 15° morro arriba**: encajando la foto de Kermanshah con la
    cámara a nivel y el cabeceo fijo, el error sale mínimo con 15°
    (10,6 px; con 0°, 60).
  - **Cómo es**: dos raíles negros a ±0,2 m, por fuera del cuerpo, sobre una
    escalera ocre que asoma 0,8 m por delante del morro; el dron cuelga de
    dos patines transversales. Dos patas en A (arriba a ±0,17 m y con las
    ruedas a ±0,5 m, foto de Qom de frente con la cámara encajada), un
    larguero bajo a cada lado y riostras cortas, el volante y el cohete
    blanco con su tobera y dos abrazaderas. Acabado nuevo `ocre`.
  - **Visor**: `catapulta: { piezas, cabeceo }` en la maqueta; botón
    «Catapulta» (solo en los drones que la tienen) y `?catapulta=1` en la
    URL. Las piezas van aparte (no cuentan para las siluetas, las tarjetas
    ni las naves); al ponerla, la raíz se inclina, se vuelve a centrar y el
    encuadre crece un 15 %. Las letras de las partes y las calcas giran con
    el dron (las calcas cuelgan ya de la raíz). `comparar-foto.mjs` y
    `vista-visor.mjs` admiten `--catapulta`; para compararla con una foto, la
    cámara se encaja con `fijo: { cabeceo: 15 }`.
  - **Cohete de despegue** (lo pidió el usuario, «aproximado, inventado»): no
    hay fotos de cerca; sale del desfile de Teherán de 2023 y de la
    infografía de drone-warfare. Cilindro blanco de 17 cm y 1 m bajo la
    panza, con ojiva, dos franjas rojas, tobera de metal con el fondo negro,
    dos abrazaderas y el gancho de suelta. Primero inclinado 6° y colgado de
    dos varillas: al usuario no le parecía unido. Ahora **paralelo al dron y
    a los raíles** (como el recuadro de drone-warfare) y pegado a la panza con
    un pilón continuo y una orejeta en cada abrazadera. Detallitos (los pidió
    el usuario; inventados): punta de metal, dos juntas (con cuatro, el
    filete de tinta del HD las volvía rayas), dos argollas de izado, la caja
    del encendido y su cable a la panza, placa de aviso amarilla y aro en la
    boca de la tobera. Fuera el conducto de cables del costado (el usuario
    lo veía como una línea).
  - **Partes I y J** (las pidió el usuario): «Catapulta» y «Cohete de
    despegue», con `catapulta: true` en la parte: su chincheta solo sale con
    la catapulta puesta y elegirlas la pone. Fuentes nuevas: el lanzador de
    Qom (42) y los cohetes del desfile de Teherán de 2023 (170).
  - El usuario lo dio por terminado el 3-oct-2026: fusionado en `main`,
    publicado y rama borrada. (El Geran-2, sin publicar, se deja como está.) Para que se vea, la escalera va 23 cm
    más baja que los raíles, que se apoyan en ella con postes, y sin
    travesaños donde va el cohete.
  - **Botón en la tira de vistas** (lo pidió el usuario): «Catapulta» va
    después de «3D», con la silueta de perfil del dron sobre ella, y se
    queda marcado mientras está puesta.
  - **Los patines** (taco en la panza y travesaño hasta cada raíl) son de
    la catapulta: en el dron salían como barras negras bajo el morro y bajo
    el ala sin catapulta (el usuario no entendía qué eran). Tarjeta, planta
    y nave regeneradas sin ellos.
  - Falta: que lo revise el usuario; rendimiento en Zen.

- **2-oct-2026, naves de la portada en pixel HD**: el TB2 (sustituye al TB3,
  que se quitó) y el MQ-9, con `arte/generar-naves-uas-hd.mjs` (ver arriba).
  Pendiente de mirar: las maquetas del hangar están en espejo respecto al
  avión de verdad (ejes x derecha, y arriba, z morro en un Three.js que es de
  mano derecha): con el morro a la izquierda y desde arriba, la punta verde
  (derecha) sale abajo. Afecta a todo el visor. La maqueta del TB2 dice que
  el tren no se recoge, pero la rueda del morro sí se recoge.
- **2-oct-2026, TB2 retomado y cerrado otra vez**: toma de aire en el centro
  del lomo, ala en su sitio, cuerpo sin las líneas de las uniones, tarjeta y
  planta regeneradas, y el zoom de todos los visores (hacia el cursor).
  Fusionado en `main` (rama `hd-bayraktar-tb2` borrada). Queda: rendimiento
  en Zen; la joroba de delante del ala, que el usuario ve bien.
- **El MQ-9 está cerrado** (HD y pixel HD) desde el 1-oct-2026: el pixel HD,
  fusionado en `main` y publicado ese día, y las ramas `uas-hd` y
  `hd-pixel-mq-9`, borradas. Lo que sigue es pasar otros drones (ver los
  objetivos de arriba).
- **HD fusionado en `main` y publicado el 30-sep-2026**. El HD del MQ-9 está terminado a falta de
  retoques: estilo **C** fijo por defecto; el selector de pruebas solo sale
  con `?hd=a|b|c|no` en la URL.
- **Pendiente para otro día** (lo dejó el usuario, «saturado»): el **pixel
  art 2.0** (hecho el 1-oct-2026: el pixel HD), y pasar los demás drones al
  HD.
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
- **1-oct-2026, pixel HD del MQ-9** (rama `hd-pixel-mq-9`, fusionada en
  `main` y borrada). El
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
- **1-oct-2026, tarjeta y planta de la portada del MQ-9 en pixel HD** (en
  `main`, sin commit): seguían en 1.0; ver «Pasar un dron al pixel HD».
- **1-oct-2026, visor** (en `main`, sin commit): cada vista fija se encuadra
  con lo que ocupa el dron desde ahí (el perfil del MQ-9 salía pequeñísimo) y
  hay una vista nueva, **Abajo**, con el morro arriba. Desde abajo el dron se
  ve **oscuro, con la misma luz de siempre**: el usuario lo dejó así después
  de probar a pasar el sol debajo (al girar saltaba y llenaba el dron de
  sombras) y a subir la luz del cielo en la panza. No volver a tocar la luz
  para esa vista.
- **1-oct-2026, Bayraktar TB2 en HD y pixel HD** (rama `hd-bayraktar-tb2`,
  fusionada en `main` el 2-oct-2026). Lo pidió el usuario («no
  quiero un producto rápido, quiero un producto bueno»), con un avión
  **turco** («es el original») y **cuatro MAM-L**. Avión de las marcas: el
  **TB2 del Ejército de Tierra turco de Teknofest 2021** (Estambul; tres
  fotos de CeeGee en Commons, de los dos lados). Se descartó el TC-SRM (el
  PT-2 de Baykar, con matrícula) porque solo tiene una foto. Hecho:
  - **Cuerpo** en una pieza (`casco` con lomo, ver abajo): el morro ancho
    del plano con su arista baja, el lomo que sube hasta la góndola y la
    góndola, fundidos (con el lomo y la góndola como piezas aparte salían
    posados, con cintura). Carenado de la raíz del ala que sube hasta el
    hombro del cuerpo y baja por el costado. Toma de aire en lo alto de la
    góndola, con la boca hacia delante.
  - **Ala** del plano: cuerda de 0,84 a 0,64 m, borde de salida casi recto
    (en la 1.0 la punta iba 12 cm adelantada), grueso del 18 al 13 %, diedro
    de 3,8°, dos alerones por ala con sus carenados, pitot y luces.
  - **Vigas, ruedas y soportes, más juntos que en el plano.** Encajando
    fotos con la envergadura de 12 m (la polaca de frente y la ucraniana
    desde arriba), la turca de 3/4 y la de detrás anclada a la hélice de
    1,7 m: vigas a ±1,02 (medidas de 0,94 a 1,1; plano ±1,14), ruedas a
    ±0,82 (0,78 a 0,87; plano ±1,0), soportes a 1,30 y 1,72 (1,33 y 1,71
    desde detrás; plano 1,6–1,7 y 2,05–2,15). El ancho del cuerpo sí cuadra
    con el plano (±0,48 frente a ±0,50 en z = 2). Ojo con la foto polaca: es
    de gran angular y deforma hacia los bordes. Vigas ovaladas (0,12 × 0,175 m, plano de lado y desfile de
    Kiev) que acaban en una luz junto al borde de salida de la cola.
  - **Cola** en V invertida a unos 45°, con los **timones en dos tramos**
    (la mitad de atrás de la cuerda), dos carenados con su varilla en la
    cara de dentro de cada mitad y la antena de la punta.
  - Torreta blanca (z = 1,81, r 0,19), placa y antena de la panza, sonda
    con veletas, placas de los costados del morro, tren con patas gruesas y
    rodilla, rueda del morro con amortiguador y compás, hélice de 1,64 m
    con palas con forma (`helice` con `ancho`), cono blanco, rejillas y
    escape bajo la góndola.
  - **MAM-L** (punta en z ≈ 1,05, medida en el desfile de Kiev): buscador,
    alas y timones en X y argolla, colgadas de soportes con percha.
  - **Marcas** (Teknofest 2021): bandera turca y logo de Baykar en la cara
    de fuera de cada mitad de la cola; escarapela turca en los costados de
    la góndola y, como en el plano, arriba en un ala y abajo en la otra;
    «BAYRAKTAR TB2» y «DİKKAT PERVANE / DANGER PROPELLER» en las vigas,
    entre dos franjas rojas (piezas, en `rojo-vivo`); ranura negra de la
    salida de aire; avisos amarillos rayados en el morro. En las fotos de los
    dos lados la bandera va como una pegatina vista desde fuera (la media
    luna hacia el morro en un lado y hacia la cola en el otro), igual que
    proyecta el visor.
  - **Costuras**: la tapa grande del morro y la costura larga del lomo,
    atornilladas; la junta de la carena del motor; una tapa en la joroba.
  - **Color**: gris propio, `gris-tr` (#8d999f): al sol el render da
    #afb9c0 y las fotos turcas #acb8bf de media (el `gris` del MQ-9 salía un
    12 % más claro).
  - **Pixel HD**: con ese gris, el ala al sol tenía una luminosidad de 0,717,
    en el borde de dos escalones; la maqueta lleva `desfaseLuz: 0.48` (los
    escalones, medio escalón corridos) y sale lisa. Tarjeta y planta
    regeneradas (fuera el giro 1.0).
  - Para hacerlo, en el motor: `casco` admite `lomo`, `hombro` y `nLomo` (un
    lomo más estrecho fundido con el cuerpo); `helice` admite `ancho`;
    dibujos de calca nuevos (`bandera-tr`, `escarapela-tr`, `baykar`,
    `aviso`; el `texto` admite color, dos líneas y letra fina); acabados
    `gris-tr` y `rojo-vivo`; `desfaseLuz`. El MQ-9 sale igual.
  - Falta: que lo revise el usuario; el rendimiento en Zen.
- **1-oct-2026, primera revisión del usuario del TB2** (con tres fotos suyas
  del J-10 turco: dos en vuelo y una en tierra con el pod de Aselsan, en
  `arte/uas-fuentes/bayraktar-tb2/hd/full/usuario-*.png`). Pidió analizar
  cada fallo con fotos antes de tocar nada; color, marcas, motor y hélice,
  bien. Hecho, midiendo con las tres fotos encajadas:
  - **Dos MAM-L flotando**: las del ala izquierda colgaban 20 cm por debajo
    de sus soportes. Causa: la altura y la z de cada bomba salían de las
    fórmulas del ala con la x del soporte, negativa en ese lado (el diedro
    salía al revés). Ahora con la distancia al centro, y dos argollas bajo la
    percha (la de antes quedaba por delante).
  - **Raíz del ala y cuerpo, una sola pieza**: el `casco` admite un
    ensanche (`costado`, `costadoArriba`, `sobreArista`, `bajoArista`, ver
    `docs/uas.md`). La arista nace en la punta del morro, sube por el
    costado y se abre en la raíz del ala (planta del plano); por arriba, un
    empalme cóncavo sube hasta el pie del lomo, sin hombro por encima del ala
    (foto polaca de frente); por abajo, otro baja a la panza. El ala, delgada,
    nace del ensanche desde x = 0,7. Antes: raíz gruesa aparte (un puro
    posado) y la arista baja.
  - **Tomas de aire**: la central es una boca rectangular en lo alto del
    lomo en z = 1,05 (antes, una rampa encima del capó, donde no hay nada);
    las laterales, dos tomas sumergidas NACA a los lados del lomo, de z = 0,6
    a la boca en 0,15 (calca `naca`).
  - **Tornillería**: los dos bordes del lomo (x de 0,27 a 0,39) con tornillos
    cada 12 cm; la tapa grande del morro (borde de atrás en z = 2,3, baja por
    los costados); la junta en anillo del capó con tornillos juntos; dos
    tapas atornilladas en cada raíz del ala. Fuera la costura del costado y
    la tapa de la joroba, que no existen.
  - **Torreta**: tambor del ancho de la bola metido en la panza y media
    esfera debajo, de 42 cm, en z = 1,67 (antes, bola colgada de un collar,
    14 cm más adelante).
  - Encontrado por el camino: **ruedas** de 19 cm (antes 28 y 26) y la del
    morro en z = 2,31; suelo en −0,91; la **caja bajo el morro**, larga
    (0,95 m).
  - Herramientas: `arte/encajar-camara.mjs` admite `medir:superficie` (el
    píxel llevado a la superficie de la maqueta con un rayo); el enganche
    del visor deja la cámara fija.
  - Visto y sin tocar (no lo pidió): en las fotos en vuelo el tren principal
    no se ve; podría recogerse.
- **1-oct-2026, segunda revisión del usuario del TB2** (commit `d7ca5ce` en
  la rama, sin subir). Bien: misiles, gimbal; tornillería «mejor pero
  bueno». Mal:
  - **Las alas, peor**: de frente hay un salto. En todas las fotos el ala y
    el cuerpo son prácticamente una sola pieza. Causa entendida: el ensanche
    del `casco` acaba en una arista de grueso cero y el ala (0,19 m de grueso)
    sale de él desde x = 0,7, así que donde se cruzan hay un escalón.
    Arreglo previsto: que el ensanche acabe en x = 0,85 con el mismo perfil
    que la raíz del ala en cada z (arriba y abajo del perfil NACA en esa
    cuerda: campos nuevos de la sección para el alto de arriba y de abajo
    del borde) y que el ala empiece ahí, sin hueco ni escalón; los empalmes
    salen tangentes al ala (horizontales) y suben o bajan al cuerpo.
  - **La toma de aire**: las dos calcas NACA y la ranura negra eran la misma
    toma mal entendida. En la foto de Baykar de tierra
    (`usuario-aselsan-suelo.png`, x 500 px, y 230–320) la toma principal es
    el hueco negro en anillo delante del capó: el capó es más grande que el
    final del cuerpo y su borde delantero queda separado, con una ranura
    oscura que rodea el frente del capó por los costados y por arriba. De
    lado se ve como una banda negra vertical; de frente (foto polaca), como
    dos medias lunas a los lados del lomo; desde arriba (J-10), como las
    bocas oscuras que tomé por tomas NACA. Arreglo previsto: el capó como
    pieza aparte, algo más grande que el cuerpo en su borde de delante, con
    un anillo negro dentro (la boca); fuera las calcas NACA y la ranura.
    Buscarla en todas las fotos (tr05, 032, tr04, detras, 030, usuario-*)
    para medir su z, su alto y su ancho.
  Hecho el 2-oct-2026 (sin commit):
  - **Alas**: el ensanche del cuerpo llega ya hasta x = 1,3, donde empieza
    el ala recta, y bajo el ala acaba con el mismo perfil que la raíz del
    ala (`bordeArriba`/`bordeAbajo` en la sección); el ala nace ahí sin tapa
    (`raizDentro` en el `ala`: con tapa, la luz se torcía y se veía una
    costura). La planta del ensanche sigue el borde de ataque y el de salida
    del plano. Delante del ala, el ensanche es redondo (`redondeo`): el borde
    de ataque se funde con el costado; la arista del morro, también suave.
    Comprobado de frente (polaca), en tierra (Baykar) y en vuelo (J-10).
  - **Toma de aire**: el capó es una pieza aparte (`casco` con `abierto`,
    sin tapa delante) con la forma del cuerpo de delante, algo mayor: lomo
    alto y estrecho y hombros de 0,4 m (plano desde arriba). La boca (fondo
    en `hueco`, casi negro y mate) queda entre los dos: una U fina alrededor
    del lomo que baja por los costados hasta el ala. Para que baje hasta el
    ala, el lomo de delante pasa a 0,26 m de medio ancho (antes 0,37; foto
    polaca de frente) y el empalme del ala con el lomo, junto al capó, es
    bajo. Fuera las calcas NACA y la ranura negra, que eran esta misma toma
    mal leída. La toma pequeña del lomo (z = 1,05) se queda.
  El usuario lo dio por bueno el 2-oct-2026 («creo que está bastante bien»);
  fusionado en `main` y publicado, rama borrada. **Pendiente si se retoma**
  (lo que no convencía al cerrarlo):
  - Desde arriba, el hueco de la toma no se ve tan hondo como en la foto del
    J-10 en vuelo (`usuario-j10-arriba.png`): allí parece una cavidad que se
    mete hacia atrás en el hombro del capó.
  - De 3/4 por delante queda un pliegue suave donde el ensanche de delante
    del ala (`redondeo`) se junta con el costado.
  - Rendimiento en Zen sin medir.
  - Visto y sin tocar: en las fotos en vuelo el tren principal no se ve;
    podría recogerse.
  - 2-oct-2026, después: la tarjeta de `/uas` del TB2, con el ángulo que
    eligió el usuario con una captura del visor (acimut 61°, elevación 20°;
    `vistaTarjeta` en la maqueta). El visor sigue con el de siempre.
- **2-oct-2026, tercera vuelta del TB2** (rama `hd-bayraktar-tb2` otra
  vez, sin commit). El usuario pidió el pendiente («la toma de aire entiende
  que es un agujero hacia dentro y que sale un poquito; las tomas laterales
  vamos a dejarlas; dale caña a las alas»). Hecho:
  - **Toma de aire del lomo**: no era la U del capó. Una sola, en el centro
    de lo alto del lomo (desde arriba cae en la línea de la toma pequeña
    del lomo y de la punta del cono): un hueco oval y hondo de unos 25 cm,
    con la boca (pared de atrás) en z = 0,1, 10 cm por delante de la junta
    remachada del capó; delante, una rampa poco honda hasta z = 0,64, con
    los bordes un poco salidos (1,2 cm; más, de frente salían orejas). En
    el `casco` (`tomas`), con un disco `hueco` en la boca. Las ranuras
    laterales del capó (la U), como estaban. Errores por el camino, que el
    usuario corrigió: primero hice **dos tomas**, una a cada lado (desde un
    lado solo se ve iluminada la pared de enfrente y parecía una cuña a un
    lado), y oscurecí el fondo con un tono por vértice copiado de la foto
    («te has basado en la sombra de una foto»: la luz la pone el visor; se
    quitó). Descartados también: en el costado mirando afuera (desde tr05
    salía un tajo) y una rampa larga sin hueco.
  - **El pliegue de delante del ala**, medido con cortes del cuerpo y un
    mapa de alturas: (1) el `redondeo` saltaba de 0,75 a 0 en 1 cm en el
    borde de ataque; (2) en ese anillo el perfil del ala tiene grueso cero y
    el empalme entero bajaba a ras del borde: un surco de 3 cm cruzando hasta
    el cuerpo; (3) delante del ala el ensanche acababa en un filo de grueso
    cero (en la foto de Baykar en tierra es un labio redondo). Arreglo:
    redondeo que cambia poco a poco y que, junto al borde de ataque, sale de
    la altura a la que debe quedar el empalme (`ALTURA_EMPALME`, 0,15 detrás
    y bajando hacia delante); `nariz` y `LABIO` (de 3 a 9 cm, afinándose
    hacia el morro); empalme en cúbica sin codo; el empalme de arriba llega
    cada vez menos hacia dentro hacia el morro (`costadoArriba` de 0,27 a
    0,46). Queda un escalón de ~1 cm en 2 cm justo en el borde de ataque.
  - **Sigue**: la joroba del costado de delante del ala (z 0,9–1,3, x
    0,28–0,4): es la mejilla del cuerpo, más estrecha que el labio, sobre la
    repisa plana de delante del ala; en las fotos el costado baja más liso.
  - Visto y sin tocar: motas negras en la junta remachada del capó (ya
    estaban en `main`).
  - Herramientas: `comparar-foto` con `--zoom` y `--sin`; el enganche del
    visor da también `raiz`.
  - **El ala, mal colocada** (2-oct-2026, con la foto del J-10 desde arriba
    que señaló el usuario): el ajuste de cámara de las dos fotos del J-10
    dejaba 13–17 px de error; con las puntas en z ≈ 0,28 en vez de 0,15
    baja a la mitad (13,5 → 5,3 px desde arriba; 17,1 → 11,9 de lado).
    Medido punto a punto en las dos: borde de ataque 10–23 cm más adelante
    que la maqueta (0,93 / 0,81 / 0,70 / 0,60 en x 2 / 3,4 / 4,7 / punta,
    desde arriba; 0,83 / 0,70 / 0,60 / 0,55 de lado), borde de salida 15–22
    cm más adelante (0,10 / 0,07 / 0,05 desde arriba; 0,05 / 0,00 / −0,05
    de lado); cuerda de la punta 0,55 (maqueta 0,63), junto al cuerpo igual
    (0,82); alerón, ~25 % de la cuerda. El plano de cinco vistas, de donde
    salió, coloca mal el ala. Y la unión con el cuerpo: en la foto el borde
    de ataque se curva liso hacia delante hasta el costado, y el de salida
    también se abre en curva; en la maqueta el borde de ataque recto choca
    con la curva del ensanche en x = 1,3 (esquina).
  - **Ala movida** (2-oct-2026): bordes de ataque y de salida, la media de
    las dos fotos del J-10 (`bordeAtaque` 0,913 − 0,078·(x − 1,5),
    `bordeSalida` 0,082 − 0,0168·(x − 1,5)); puntas en z = 0,29 en los
    ajustes de cámara. Error del ajuste: J-10 desde arriba 13,5 → 5,3 px,
    de lado 17,1 → 11,9; 032 21,4 → 19,8; tr04 17,0 → 16,3; tr05 9,3 → 11,5
    y 030 4,0 → 5,3 (en esas dos manda el gran angular en morro y cola). El
    ensanche y sus empalmes, medidos con el ala del plano, se llevan a su
    sitio con `alSitio` (estirados en la raíz y cada vez menos hacia el morro
    y el capó). Alerón al 24 % de la cuerda (foto de lado; antes 13 cm
    fijos), carenados en la bisagra. Las MAM-L, con la punta donde estaba
    medida (z ≈ 1,05: 14 cm por delante del borde de ataque); los soportes
    van con el ala y ahora quedan centrados en la bomba. La toma pequeña del
    lomo, 1,2 cm más hundida (lo pidió el usuario). El redondeo del empalme
    se queda solo en la nariz del perfil (detrás, el empalme sale en
    horizontal, tangente al ala).
  - **Las líneas del cuerpo** (las marcó el usuario el 2-oct-2026 con tres
    capturas: «es como si el cuerpo no tuviese la misma forma»). En los
    cortes del cuerpo: (1) el pie del lomo hace esquina con el empalme de
    arriba (x ≈ 0,28; en z = 0,5 casi en ángulo recto): la línea larga a
    los dos lados del lomo, del capó al morro; (2) en z ≈ 1,1–1,5, la unión
    del labio, el empalme y el costado hace una S con dos dobleces: la línea
    del costado que se ve de lado y de 3/4; (3) del morro a z ≈ 1,8, el
    labio (`nariz`) deja un cordón en la arista; (4) el lomo, unido al
    cuerpo con una norma p, sale como cresta y las secciones, poligonales.
    La sección de arriba es un montaje de piezas (empalme, costado, hombro,
    lomo, labio) y cada unión concentra la curvatura en una línea.
  - **Las líneas, quitadas** (2-oct-2026, sin commit): el `casco` admite
    `suave` (el TB2, 7 cm): cada mitad de la sección se suaviza como una
    sola curva (campana a lo largo de la curva, que crece desde el borde
    para no aplanar la nariz redonda; el borde y su dirección no se mueven,
    ni el tramo que cierra el borde por dentro del ala) y, donde el ensanche
    apenas sale del costado (delante del ala), la sección entera, arriba y
    abajo juntas (con el borde fijo la arista quedaba en V); la arista entre
    las dos mitades, con la normal común. Anillos por distancia (1/260 del
    largo) y 96 puntos por mitad: el fuselaje baja de 163 000 a 124 000
    triángulos. El labio, de 3 a 4 cm (tenía 9) y apagado antes de z = 1,7
    (dejaba un cordón en la arista).
  - **Queda la joroba** del costado de delante del ala: la planta del
    ensanche (del plano) salta de 0,56 a 0,69 m entre z = 1,45 y 1,3 y la
    sección pasa de abombada a cóncava en 15 cm; en la foto de Teknofest
    (tr05) el costado baja liso. Hay que medir esa planta en fotos.
  - **La línea del borde de ataque** (la marcó el usuario: «como si el ala
    ahí ya terminase»): escalón de 1–3 cm entre dos secciones seguidas a lo
    largo de la raíz. Arreglo (sin commit): con `suave`, las secciones
    también se suavizan a lo largo del cuerpo (campana de 4 cm en z), salvo
    junto al borde del ensanche y en las puntas; las tomas se tallan
    después.
  - **La joroba, dos intentos descartados**: alargar el paso entre la
    sección entera y la de borde fijo (no cambia nada) y suavizar a lo largo
    del cuerpo con una campana de 13 cm (salen ondas: mezcla puntos que no
    se corresponden). La causa está en los datos de delante del ala, no en
    el suavizado: entre z = 1,6 y 1,3 la cara de arriba del costado baja
    empinada y el empalme de arriba sube de golpe (`sobreArista` de −0,05 a
    0,06 en 20 cm) mientras la planta se abre de 0,56 a 0,70.
  - El usuario lo ve bien (2-oct-2026): la joroba se deja como está.
  - **Zoom de los visores** (lo pidió el usuario): la rueda y el pellizco
    acercan hacia lo que hay bajo el cursor (`zoomToCursor`), hasta 1/16
    del encuadre; alejar, hasta 1,2 veces (antes, de 0,45 a 2,2 y siempre
    hacia el centro: se alejaba hasta perder el dron y casi no se
    acercaba). Al alejarse, el punto de mira vuelve al centro; las vistas
    fijas lo devuelven también. Botones y teclas, alrededor del punto de
    mira.
  - **Contorno del estilo C, arreglado** (2-oct-2026): el shader usaba
    `objectNormal`, que `MeshBasicMaterial` solo declara con mapa de entorno
    o esqueleto; no compilaba y desde el 30-sep el contorno no se pintaba.
    Ahora con el atributo `normal`. Al usuario le gusta, más fino: grosor
    `radio * 0.0011` (era 0.0022). En el pixel HD también, con
    `contornoPixel: true` en la maqueta (MQ-9 y TB2); en la tarjeta y la
    planta no se ve (menos de un píxel).
- **Siguiente paso**: el dron que pida el usuario; rendimiento en Zen del
  TB2.
- **Para el final, cuando esté todo** (lo pidió el usuario el 2-oct-2026, no
  en mitad del cuerpo): en todos los visores, el zoom aleja sin límite pero
  acerca poco; retocarlo en general.

## Decisiones del usuario (30-sep-2026)

- Rama propia, `uas-hd` (ya fusionada y borrada).
- El MQ-9 como ahora (cuatro Hellfire, dos GBU-12, tren fuera), **con las
  marcas reales de un avión concreto** de la Fuerza Aérea: escarapela,
  número de cola y código de la base.
- Estilo del HD: **pruebas para elegir**, dos o tres versiones del mismo
  MQ-9 con un selector temporal en la página.
- El botón se sigue llamando **«Maqueta | Pixel»**; solo cambia cómo se ve.
- El avión de las marcas: **el «CH» 152 de Creech** (432.º Ala), elegido
  frente al «HO» 16-307 de Holloman. Sin armas en sus fotos; los Hellfire y
  las GBU-12, de otras.

**Bayraktar TB2 (1-oct-2026)**: un avión **turco** («es el original»), con
**cuatro MAM-L**. El avión concreto lo eligió Claude con permiso del usuario
(«te dejo trabajando»): el del Ejército de Tierra de Teknofest 2021.

## Plan (MQ-9)

- [x] Fuentes: fotos en alta de todos los ángulos y el avión de las marcas.
- [x] Forma: cuerpo continuo hecho de secciones medidas (no tubos sueltos),
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
- [x] Pixel art 2.0 del MQ-9 (pixel HD, 1 px), fusionado el 1-oct-2026.
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
