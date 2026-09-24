# Proyecto Tierra — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso: qué está hecho, qué no, qué está decidido y qué queda pendiente. Leyendo
solo esto hay que poder retomarlo. El detalle del planeta de antes (horizonte
de la portada, noche, nubes, chapas) sigue en `HERO-WIP.md`.

## Dónde estamos (24-sep-2026)

- Rama **`earth-project`**, creada desde `main` el 24-sep-2026 (`main` estaba
  en `6862600`, con Marte y la Luna publicados). **Solo en el Mac, sin subir.**
- **Commiteado** (`e2dfc1d`): pasos 1 y 2. El motor `src/scripts/tierra-gl.js`
  (disco completo, gira sola a 90 s por vuelta, se arrastra, zoom hasta ×6,
  nubes; radio de arte 180) y el banco `logo-files/prototipo-tierra/giro.html`;
  hemisferio sur (banquisa austral estrecha, la Antártida con su relieve),
  `public/planeta/` regenerado (`PLANETA_V` 11).
- **Sin commitear**:
  - Paso 3: chapas de bandera con su sombra y X de blanco en `tierra-gl.js`;
    en el banco, un `<div>` encima de cada chapa (nombre del país al pasar el
    ratón, para el giro) y clic para clavar la X (clic sobre ella o Esc la
    quita). La ficha de artículos de verdad llega con la portada.
  - La mano de la Tierra se cierra al empezar a girar, no con un clic suelto
    (`montarMano(..., { alArrastrar: true })`; Marte y la Luna, como antes).
  - Paso 4, el título: banco `logo-files/prototipo-tierra/titulo.html`. **Sin
    título grande ni animación sobre el globo**: solo el rótulo encima del
    globo, "el blog de hegoi márquez" escrito a máquina (75 ms por letra) con
    cursor de bloque que parpadea lento (1,1 s) detrás de la última letra;
    debajo, el lema y la coordenada. **A los 5 s** el nombre, el lema y el
    cursor se desvanecen a la vez (0,6 s) y solo queda la coordenada, en su
    sitio. Todo centrado en el mismo eje (el botón de pausa cuelga a la
    izquierda de la coordenada, en una caja de ancho fijo). Aprobado por el
    usuario ("vamos a dejarlo así").
- La portada todavía no se ha tocado.
- **Siguiente**: montar el paso 4 en la portada de verdad: el globo nuevo en
  vez del horizonte, el rótulo, las chapas con su ficha, la mira y la X con la
  coordenada MGRS, el botón de giro, naves, astros pequeños y vuelos. La noche
  sigue siendo la de antes hasta el paso 7 (ver plan).

## Qué quiere el usuario (24-sep-2026)

"Ahora mismo la Tierra ocupa medio planeta, pero me gustaría hacer lo mismo
que hemos hecho en Marte y Luna: hacer el círculo completo y que sea movible
con el ratón. También me gustaría unificar los tamaños de los planetas para que
sean los mismos. En la Tierra habrá que definir mejor el detalle de
continentes y países cuando ampliemos zoom." Rama `earth-project` hasta que
esté terminada.

## Decisiones tomadas (usuario, 24-sep-2026)

- **Disco completo en la portada**, en vez del horizonte inclinado del
  hemisferio norte (cambia la decisión de sept 2026). Se mantienen título,
  naves, chapas, MGRS y astros pequeños.
- **Tamaño común para los tres astros: uno intermedio**, ~70 % del alto de la
  pantalla (la Luna tenía ~78 % y Marte 60 %).
- **Píxel de la Tierra: radio 180 px de arte** (`RADIO_ARTE` en
  `tierra-gl.js`), unos 360 cuadraditos de lado a lado, algo más grueso que el
  de Marte y la Luna (serían 256). Se le enseñaron los dos: "no veo mucha
  diferencia, pero la que pone radio 180 creo que mejor". **Marte y la Luna
  conservan su píxel**: al unificar, solo cambia lo que ocupa el disco.
- **La Tierra sigue girando sola** (90 s por vuelta, botón play/pausa) **y se
  arrastra**: mientras se arrastra manda la mano; al soltar sigue girando.
- **Al acercarse: nombres de continentes y países, sin fronteras** (sigue
  "solo costas"): rótulos de región como en Marte, y más detalle de costa y
  relieve.
- **Primero el día, luego la noche**, las dos en esta rama.
- **Banquisa austral estrecha** (borde a 62-69° S) frente a la ancha del
  invierno austral (58-66° S), que tapaba la silueta del continente: "la
  estrecha, dale".
- **La Antártida conserva su relieve** (tierra con nieve por latitud y roca
  en las montañas), no hielo liso: "me gusta la Antártida no blanca entera
  sino con el relieve que tenía antes. Le da una personalidad más fuerte".
  Se había probado como hielo (terreno 2, como Groenlandia) y se deshizo.
- **Animación del título** (usuario, 24-sep-2026): "para aparecer, visor (al
  lado contrario que ahora, como está en la web)" = las esquinas llegan desde
  fuera y se cierran, como `marte-cierra`; "para desaparecer, visor pero que
  se pliegue a la vez la caja que las letras"; "después, puede aparecer de
  forma más minimalista arriba del globo. Dame opciones, cúrratelo". De las
  primeras cuatro (visor, tele antigua, censura, teletipo) quedó el visor.
- **Título, versión definitiva a probar** (usuario, 24-sep-2026, tras ver
  las opciones): "algo tipo 2 rótulo, pero vamos a mejorarlo". (1) Entrada:
  "con el censurado pero de derecha a izquierda, como en la web actual" y
  "en la entrada no existen coordenadas, solo el título"; (2) salida: "el
  bloque se cierra como atrapando las letras (los marcos del lado izquierdo
  y derecho se van cerrando y con él cierran el título)"; (3) después, arriba
  del globo: "tipo máquina de escribir … pondrá el blog de hegoi márquez"
  (en minúscula), con cursor; "el resto como está" (lema y coordenada).
  El marco de visor está puesto durante la censura (es el que atrapa las
  letras).
- **Cambio del usuario (24-sep-2026, después)**: "no existe animación de
  entrada y salida en el globo. Todo directamente arriba, con máquina de
  escribir como está ahora" y "el blog de hegoi márquez, las letras más
  juntas". Se quitan el título grande, la censura y el cierre del marco (lo
  de arriba queda como historia); el espaciado pasa de 0,6em a 0,28em.
- **A los ~10 s se van el nombre y el lema** (usuario, 24-sep-2026: "con el
  tiempo (unos 10 segundos) el blog de hegoi márquez e historia
  inteligencia osint desaparece, solo dejando las coordenadas arriba"). Se
  desvanecen (1,2 s); la coordenada no se mueve. El cursor sigue
  parpadeando al final del nombre hasta ese momento y se va con él ("deja el
  cursor moviéndose durante todo el tiempo hasta que desaparezca").
- **Rótulo, se queda como está** (usuario, 24-sep-2026: "no me convence tu
  propuesta, vamos a dejarlo así"; se le propuso nombre más grande, dos
  grupos y un visor pequeño en la coordenada). Cambios: **a los 5 s**, no a
  los 10, y la retirada "al unísono con un desvanecimiento medio rápido":
  nombre, lema y cursor en un bloque que se desvanece entero en 0,6 s (antes
  el lema se iba de golpe y el nombre en 1,2 s: la animación de salida del
  lema pisaba la de entrada).
- **Portada: maqueta A**, título encima del globo, "un poco más arriba y un
  poco más pequeño" (usuario, 24-sep-2026; se le recomendó la B).
- **Zoom hasta ×6**, como Marte y la Luna (usuario, 24-sep-2026: "¿sería
  posible un x5 o x6?"). Hasta que haya teselas (paso 6) solo amplía el mapa
  de 8 px/grado; con teselas harán falta niveles de 16 y 24 px/grado, como en
  Marte (allí pesan 38 MB).

## Plan

- [x] 1. Banco: la Tierra entera en WebGL con los datos de ahora, girando
      sola y arrastrable. Enseñar capturas.
- [x] 2. Hemisferio sur: Antártida, banquisa austral y lo que salga mal al
      verlo entero.
- [x] 3. Nubes, chapas de bandera y X de blanco en el motor nuevo.
- [ ] 4. Portada: el globo sustituye al horizonte; sitio del título, MGRS,
      naves y astros pequeños; vuelos a la Luna y a Marte.
- [ ] 5. Tamaño común: Luna y Marte al tamaño intermedio.
- [ ] 6. Zoom con teselas (más detalle de costa y relieve) y nombres de
      continentes y países.
- [ ] 7. Noche: luces de ciudades, aurora, luz de luna.
- [ ] 8. Probar en Zen y en el móvil; fusionar en `main`.

## Decisiones pendientes

(ninguna)

## Registro

### 24-sep-2026 — paso 1: la Tierra entera en WebGL

- `tierra-gl.js` sale del esqueleto de `marte-gl.js` (vista con `lat0`/`lon0`,
  mano de `montarMano`, zoom de `montarZoom`, lienzo a múltiplo entero ×3) con
  las cuentas de `planeta.js`: material por celda (1529, R + G·256), mipmaps
  en longitud por prioridad (desde el nivel 3 la costa no gana), hielo con
  menos limbo, escalones de luz de 1/3, halo de atmósfera y borde suavizado.
  Mapa y mipmaps en una textura R16UI de 2880 × 2880 (nivel 0 arriba, los
  demás en fila debajo). Nubes: un punto de un píxel de arte por celda de las
  plantillas de siempre, en orden inverso para que gane la primera.
- El sol no se mueve respecto a quien mira (arriba a la izquierda, como
  siempre): al ver la Tierra entera, el cuarto de abajo a la derecha cae en
  la noche.
- Giro a 30 fotogramas por segundo, como la portada; la mano y el zoom, a 60.
  Mientras se arrastra no gira; al soltar sigue. Con zoom, el giro va más
  despacio a la par (la superficie cruza la pantalla igual que a ×1).
- Visto en Chrome sin ventana: Europa-África, polo sur (la Antártida ya sale
  blanca, sin banquisa alrededor), Oceanía, Sudamérica y ×4 sobre Europa (el
  mapa de 8 px/grado ampliado: franjas del mar y costas en bloques; hace falta
  el paso 6).

### 24-sep-2026 — paso 2: hemisferio sur

- Radio de arte 180 elegido por el usuario (ver decisiones).
- La Antártida era tierra con bioma de tundra y nieve por latitud: salía gris
  con manchas de roca y, en sombra, casi negra. Ahora es hielo (terreno 2,
  como Groenlandia), con su línea de costa.
- Banquisa austral con las reglas de la ártica (borde por longitud roto en
  témpanos, placas de hielo viejo y joven, ruido en coordenadas polares con
  semillas propias). La primera, con el borde del invierno austral (58-66° S),
  tapaba la silueta del continente; se hizo una más estrecha para comparar.
- El generador tarda ~33 s.
- El usuario eligió la estrecha y quiso la Antártida con el relieve de antes:
  se deshizo el cambio de `rasterizar.py`/`mapa_tierra.py` y se regeneró
  `public/planeta/` con la banquisa estrecha.

### 24-sep-2026 — paso 3: chapas y X de blanco

- Chapas, sombra y X como puntos de un píxel de arte (programa "sprites"),
  con las reglas de `planeta.js`: la chapa y su sombra solo en la cara
  iluminada y lejos del borde (`BAND_PZ`), apagándose hacia el terminador;
  la X, blanca con contorno, a partir de `pz` 0,06. Orden: sombras, nubes,
  chapas, X (el de siempre).
- Los colores de chapas y X van en una paleta (G = 128, R = color, B = luz).
  La sombra suma 128 al escalón de luz con mezcla aditiva solo en el azul, y
  la pasada de color la oscurece a la mitad (+6 de azul), como antes.
- El motor da `chapas()` (dónde queda cada chapa visible, en píxeles CSS de
  la ventana, la esquina de su contorno como `alMoverBanderas`), `ponMarca`,
  `posMarca`, `geo` y la opción `pausado` (no gira mientras dé true).
- Las chapas y la X no crecen con el zoom (como las chapas de Marte).
- En el banco, `window.tierra` era el `<canvas id="tierra">` hasta que
  llegaba el motor (los elementos con id se ven como variables globales): el
  primer pintado fallaba. Arreglado con una variable propia.
- Un clic suelto ya no cierra la mano en la Tierra (usuario: "si se hace un
  solo click, que no salga la mano cerrada de agarrar; si se hace click y se
  mantiene para girar, sí"). `montarMano` tiene la opción `alArrastrar`: la
  clase `agarrando` llega al pasar el umbral de arrastre. Marte y la Luna no
  la usan (no se pidió allí).

### 24-sep-2026 — paso 4: maquetas de la portada

- Hechas inyectando el motor en la portada de `npm run dev` (hay que usar
  `localhost:4321`, no `127.0.0.1`): se oculta el planeta de antes, sus
  chapas y la mira, y se pone el globo a 70 svh. En las capturas el sol y la
  luna salen a la vez por forzar el modo día a mano (no es un fallo de la
  web), y la nave es la que toque al azar.
- A: título donde está (45 %, encima del globo). Se lee peor: letras sobre
  tierra y nubes.
- B: globo 9 % más abajo y título arriba (13 %), en el cielo. El globo llega
  justo a la flecha de bajar.
- C: globo a la derecha (15 %) y título a la izquierda (22 %). La luna de
  arriba a la izquierda cae detrás del título: habría que moverla.
- El usuario eligió la A, más arriba y más pequeña, con una animación de
  entrada y salida. Banco `titulo.html` con cuatro: **visor** (las esquinas
  salen de un punto y se abren; el texto se descubre del centro a los lados;
  al irse, al revés), **tele antigua** (se enciende como una pantalla de tubo,
  una raya de luz que se abre, y se apaga en raya y punto), **censura** (las
  líneas aparecen tachadas con barras negras que se retiran, como la carga de
  la portada de hoy; al irse vuelven a tachar y todo se cierra en vertical) y
  **teletipo** (el marco se abre y el texto se escribe letra a letra con
  cursor de bloque; al irse, se borra hacia atrás y el marco se cierra).
- Capturas: al lanzar muchos Chrome sin ventana a la vez, alguno sale en
  negro (sin WebGL); de uno en uno, bien.
- Segunda ronda del banco `titulo.html`: entrada con el visor desde fuera
  (escala 1,5 → 1, como `marte-cierra`) y el texto descubriéndose del centro
  a los lados; salidas A (todo el bloque encoge a un punto) y B (se aplasta en
  una raya y la raya se recoge al centro); y cinco minimalistas encima del
  globo, entre la cabecera y el borde de arriba: **1 línea** (nombre y lema en
  una línea mono dentro de un visor pequeño, coordenada debajo), **2 rótulo**
  (como los rótulos de región de Marte: letras muy separadas, sin marco; entra
  cerrando el espaciado), **3 retícula** (raya de mira con marcas, el nombre en
  el hueco del centro, lema y coordenada debajo; la raya se dibuja del centro
  afuera), **4 mini visor** (el título grande en pequeño, solo el nombre) y
  **5 arco** (nombre y lema siguiendo la curva del globo, justo por fuera del
  borde, SVG `textPath`).
- En las cinco la coordenada MGRS y el botón de giro siguen a la vista (en la
  portada viven bajo el marco del título, que ya no está).
- Tercera ronda de `titulo.html`, ya sin opciones: censura con las barras de
  la portada (`transform-origin: left`, escalonadas); salida con el marco
  (`inset` de 0 a 50 % a los lados) y el texto recortado a la par
  (`clip-path`, misma curva: el relleno va en `.texto` para que midan igual);
  rótulo con las letras puestas desde el principio (transparentes hasta que
  les toca, así el texto centrado no se mueve al escribirse) y el cursor de
  bloque en la casilla de la siguiente letra, que parpadea 1,5 s al acabar y
  se apaga. Con `visibility` para ocultar las letras, el cursor asomaba antes
  de tiempo (un hijo con `visible` se ve aunque el padre esté oculto).
