# Proyecto Tierra — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso: qué está hecho, qué no, qué está decidido y qué queda pendiente. Leyendo
solo esto hay que poder retomarlo. El detalle del planeta de antes (horizonte
de la portada, noche, nubes, chapas) sigue en `HERO-WIP.md`.

## Dónde estamos (24-sep-2026)

- Rama **`earth-project`**, creada desde `main` el 24-sep-2026 (`main` estaba
  en `6862600`, con Marte y la Luna publicados). **Solo en el Mac, sin subir.**
- **Paso 1 HECHO, sin commitear, pendiente del visto bueno del usuario**:
  banco con la Tierra entera en WebGL (`src/scripts/tierra-gl.js`,
  `logo-files/prototipo-tierra/giro.html`) con los datos de siempre
  (`public/planeta/`, sin regenerar): disco completo, gira sola (90 s, con
  pausa), se arrastra y se acerca hasta ×4, con nubes. Sin chapas, X ni noche.
- La portada no se ha tocado.
- **Tamaño de píxel decidido**: radio 180 px de arte (ver "Decisiones
  tomadas").
- **Paso 2 HECHO (sin commitear)**: banquisa austral estrecha
  (`PACK_EDGE_SUR` en `generar-planeta-hero.py`) y la Antártida con su relieve
  de siempre (tierra nevada, no hielo liso). `public/planeta/` regenerado,
  `PLANETA_V` 11 y `?v=11` en `global.css`. Cambian también
  `planeta-quieto*.png`: la banquisa asoma en el borde de abajo del disco
  (en la portada de ahora solo se vería en el móvil).
- **Siguiente**: paso 3 (chapas de bandera y X de blanco en el motor nuevo).

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
- **Zoom hasta ×6**, como Marte y la Luna (usuario, 24-sep-2026: "¿sería
  posible un x5 o x6?"). Hasta que haya teselas (paso 6) solo amplía el mapa
  de 8 px/grado; con teselas harán falta niveles de 16 y 24 px/grado, como en
  Marte (allí pesan 38 MB).

## Plan

- [ ] 1. Banco: la Tierra entera en WebGL con los datos de ahora, girando
      sola y arrastrable. Enseñar capturas.
- [ ] 2. Hemisferio sur: Antártida, banquisa austral y lo que salga mal al
      verlo entero.
- [ ] 3. Nubes, chapas de bandera y X de blanco en el motor nuevo.
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
