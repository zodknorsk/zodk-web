# Lo común a los tres astros

La Tierra (portada), la Luna (`/luna`) y Marte (`/marte`) comparten motor,
gestos, capa de nombres, fichas y vuelos. Lo propio de cada uno está en
`tierra.md`, `luna.md` y `marte.md`.

## Motores

| Archivo | Qué hace |
|---|---|
| `src/scripts/marte-gl.js` | Motor WebGL2 de Marte y base del de la Luna: pirámide de mapas en teselas, luz, limpieza de píxeles sueltos, `proyecta()`, `instantanea()` |
| `src/scripts/luna-gl.js` | La Luna sobre `marte-gl.js`: luz según la cara que domina y giro a cada cara |
| `src/scripts/tierra-gl.js` | Motor de la Tierra: giro solo, nubes, chapas, X, luces, aurora, acercamiento |
| `src/scripts/gestos.js` | La mano (arrastrar) y el zoom (rueda, trackpad, pellizco) |
| `src/scripts/nombres.js` | Capa de nombres de lugares y chapas con ficha encima del lienzo |
| `src/scripts/vuelos.js` | Los vuelos entre páginas |
| `src/scripts/versiones.js` | Versión de los datos de cada astro (`?v=`) |
| `src/scripts/mgrs.js` | Coordenada MGRS (la de la portada) |

Los tres motores pintan en un lienzo de píxeles de arte enteros y el CSS solo
lo centra. El píxel no crece con el zoom: crece el radio del disco y hace
falta un mapa más fino, que llega en teselas.

## Tamaño y sitio

- Los tres discos miden lo mismo a ×1: 70 svh (en vertical, el 88 % del
  ancho). Cada astro conserva su píxel: solo cambia lo que ocupa.
- Los astros pequeños van arriba: en la portada, sol/luna a la izquierda y
  Marte a la derecha; en `/luna`, Marte a la izquierda; en `/marte`, la Tierra
  a la derecha de Marte. Van detrás del astro grande: si este los tapa al
  acercarse, su enlace deja de llevarse el clic.

## Gestos

- Ratón: arrastrar gira (a partir de 4 px, para que un clic siga siendo un
  clic). En la portada la rueda baja la página y el zoom va con
  pellizco o Ctrl + rueda; en `/luna` y `/marte` la rueda es el zoom.
- Táctil: en `/luna` y `/marte`, un dedo gira y dos pellizcan. En la portada,
  un dedo baja la página y dos acercan; con zoom, un dedo mueve el globo.
- Zoom hasta ×6, hacia el cursor al acercar y hacia el centro al alejar.

## Vuelos (`vuelos.js`)

Un solo vuelo para todos: portada → `/luna`, portada → `/marte`, `/luna` →
`/marte`, `/marte` → portada y las vueltas hacia atrás (`/luna` → portada,
`/marte` → `/luna`). Dura 6 s.

- Se simula una cámara que avanza hasta el astro pequeño (su tamaño va con
  1/distancia: casi no crece al principio y se echa encima al final) y en el
  primer 60 % gira hacia él, así que las estrellas se desplazan. Al aterrizar,
  la página nueva coloca sus estrellas donde quedaron.
- El astro que se deja atrás crece ×1,5 y sale por abajo, como si se pasara
  rozándolo. El icono se funde con el dibujo grande durante el primer 40 %.
- Las vueltas desde `/luna` y `/marte` salen del astro tal como se ha dejado:
  si estaba acercado, se aleja en el lienzo y vuela una foto, todo en una
  sola curva y sin pararse.
- La imagen que crece es la foto quieta de la página de destino
  (`tierra-quieto*.png`, `luna-visible.png`, `marte-quieto.png`), así que el
  aterrizaje cae al píxel. Si cambian los datos de un astro, rehacer su foto.
- Con `prefers-reduced-motion`, sin vuelo.

## Nombres y fichas

- Nombres oficiales (UAI en la Luna y Marte, en latín; Natural Earth en la
  Tierra, en castellano). Visor de esquinas para lo que tiene forma clara y
  rótulo de región para las zonas. Salen según cuánto mide el lugar en
  pantalla; a ×1, ninguno. Si dos se pisan, gana el más grande.
- Las fichas (naves, banderas, alunizajes, amartizajes, relés, Orion) usan
  las mismas clases (`.craft-dossier`, `.craft-linea`, `.craft-specs`) de
  `astros.css`. Solo enlazan a una nota si está publicada.
- Las banderas de las chapas son pixel art de 11 × 7 más contorno; para la
  URSS se usa la rusa (Unicode no tiene una soviética que se vea en la mayoría
  de sistemas).

## Datos y caché

Los archivos de `public/planeta/`, `public/luna/` y `public/marte/` se llaman
siempre igual. Al regenerarlos, subir su número en
`src/scripts/versiones.js` y el `?v=` de su foto quieta en el CSS
(`portada.css`, `luna.css`, `marte.css`). El servidor de desarrollo no manda
cabeceras de caché: tras regenerar, recargar forzando (Cmd+Mayús+R).

## Bancos de pruebas

En `arte/bancos/`, fuera de la web. Se sirven desde la raíz del repo con
`python3 -m http.server 4400` y se abren en
`http://127.0.0.1:4400/arte/bancos/<archivo>.html`:

- `tierra.html`: la Tierra con los datos de la portada (`?vista`, `?medir`).
- `marte-zoom.html`: Marte con zoom (`?vista`, `?medir`, `?lut`, `?datos`).
- `marte-nombres.html`: los nombres y dos chapas de prueba.
