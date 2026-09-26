# La Tierra (portada)

## Estado

**En la rama `earth-project`, sin fusionar.** `main` sigue publicando la
portada de antes (el horizonte del hemisferio norte). Hecho: la Tierra entera
en WebGL, hemisferio sur, chapas y X, tamaño común de los tres astros, zoom
con detalle y nombres, la noche entera, el acercamiento al cargar y el título
en papel.

Queda, por este orden:

1. **Probar en Zen y en el móvil** lo que es nuevo en la GPU: las luces (un
   punto por ciudad, 34.091) y la aurora (hasta ~340.000 puntos a ×6), y el
   acercamiento, que pinta a 60 fps durante 5 s. Medir en vatios (ver
   `rendimiento.md`). Si pesa: menos puntos de aurora a ×6 (`F` en
   `pintaCon`, `tierra-gl.js`) o menos fps.
2. **Fusionar en `main`** y publicar.

Opcional, ofrecido y sin decidir: que la vista de lejos (por debajo de ×3,6)
también nieve los Pirineos con el relieve fino (hoy solo lo hace el zoom). Los
nombres "se irán puliendo con el tiempo".

## Qué se ve

- La Tierra entera, centrada, que **gira sola** (90 s por vuelta, botón de
  play/pausa), **se arrastra** con el ratón y **se acerca** hasta ×6 con
  pellizco o Ctrl + rueda. La rueda sola y un dedo bajan la página; con zoom,
  un dedo mueve el globo.
- **Al cargar la portada**: un segundo de Tierra entera y luego la cámara se
  acerca en 5 s hasta el horizonte del hemisferio norte (zoom 2,5). Al acabar
  entra el título y después la nave. Al volver en vuelo desde la Luna o Marte
  no hay acercamiento: se queda el disco entero.
- **El título** es un documento clasificado: papel viejo girado −2,2°, nombre
  en Mono negro, sello rojo de NATO SECRET abajo a la derecha, el visor de
  esquinas alrededor y la barra de censura (se destacha al entrar y se tacha
  al bajar por la página). **Solo se ve en el encuadre de llegada** (zoom 2,5
  y sin arrastrar). Con cualquier otro zoom, a ×1 o al volver en vuelo se
  retira, y la coordenada y sus botones pasan a un recuadro color papel abajo
  a la izquierda. Si solo se gira arrastrando, vuelve un momento después de
  soltar.
- **Coordenada MGRS** del punto bajo el cursor (mira en vez de cursor sobre
  el planeta). Clic: se clava una X y la coordenada queda fija y resaltada;
  clic en la X o Esc la quita. En táctil no hay coordenada.
- **Chapas de bandera** en los países con artículos; al pasar el ratón, ficha
  con esos artículos (sin fichas en táctil).
- **Una nave** a la vez sobrevolando (dron, aviones, satélite), al 55 % del
  tamaño de antes; el botón de la hélice trae otra. Al pasar el ratón, ficha
  y se para toda la portada.
- **Sol y luna** arriba a la izquierda y **Marte** a la derecha, cerca del
  borde de arriba del globo; durante el acercamiento se van a las esquinas.
  La luna lleva la fase real del día. Pulsar la luna (de noche) o Marte hace
  el vuelo a su página.
- **De noche**: luz de luna, luces de las ciudades, brillo de atmósfera en el
  borde, aurora boreal que se enciende "como una serpiente" y X verde de
  visión nocturna. Al cambiar de tema el astro se esconde tras la Tierra, sale
  el otro y el planeta se funde de una luz a la otra en 1,5 s.
- **Cada visita empieza de día.** El tema elegido va en `sessionStorage`:
  aguanta al navegar y al recargar, pero otra pestaña u otro día arranca de
  día. Si no, el vuelo de `moon-project`, que pasa a noche, dejaba la web de
  noche para siempre.

## Cómo funciona

- **Motor**: `src/scripts/tierra-gl.js` (WebGL2), hecho sobre el de Marte con
  las cuentas del planeta de antes. Radio de arte 180 px (algo más grueso que
  el píxel de Marte y la Luna). Mapa de materiales (1.579) en una textura con
  mipmaps en longitud por prioridad, para que no parpadeen costas e islas
  cerca del polo. Luz en escalones de 1/3, halo de atmósfera, nubes, chapas y
  X como puntos de un píxel de arte, luces y aurora sumadas en texturas
  aparte. Gira a 30 fps (0,13° por fotograma a 90 s por vuelta); la mano y el
  zoom, a 60. Quieto no repinta.
- **La página**: `src/scripts/portada.ts` monta el motor en cada llegada a la
  portada (la web cambia de página sin recargar) y lleva el acercamiento, el
  título, la mira y la coordenada, las chapas, los vuelos y el tema. El HTML
  está en `src/pages/index.astro` y los estilos en `src/styles/portada.css`
  (lo común a los tres astros, en `astros.css`).
- **Datos** en `public/planeta/`: `planeta-mapa.png`, las LUT de día y de
  noche, `planeta-datos.json`, `planeta-luces.png` (34.091 ciudades de
  GeoNames), el nivel de zoom `n1/` (16 px/grado, 128 teselas, 2,6 MB),
  `tierra-nombres.json` y la Tierra quieta (`tierra-quieto*.png`), que se ve
  mientras carga, sin WebGL2 y en los vuelos. `planeta-quieto-noche.png` es
  de la portada de antes y solo sirve de icono de "volver a la Tierra" en
  `/luna`: no se regenera ni se borra.
- **Acercamiento**: zoom hacia un punto fijo cerca del polo. El centro del
  disco baja a la par que crece (`encuadre(zoom)` en el motor, uniforme `uDes`
  en los shaders) y a 2,5 lo alto del disco queda al 12 % del alto (22 % en
  vertical). Al alejar se vuelve solo al disco entero centrado.
- **Nombres**: continentes, océanos, mares, regiones, estrechos y picos, en
  castellano, sin países ni fronteras. Capa común a los tres astros
  (`src/scripts/nombres.js`).

## Regenerar

Las fuentes pesan y no van en Git (`arte/tierra-fuentes/`, `ne_land.json`,
`cities15000.txt`, `etopo.tiff`); cómo bajarlas está en el docstring de cada
script.

```bash
cd arte
python3 rasterizar.py --nivel 2                         # máscara fina (costas 1:10m)
python3 generar-tierra.py                               # base -> public/planeta/
python3 generar-tierra.py --nivel 2 ../public/planeta/ --relieve 3   # teselas n1 (~2 min)
python3 generar-nombres-tierra.py                       # tierra-nombres.json
cd .. && node arte/generar-tierra-quieto.mjs            # la Tierra quieta (Chrome sin ventana)
node arte/generar-tierra-icono.mjs                      # la Tierra pequeña de /marte
```

Después, subir `PLANETA_V` en `src/scripts/versiones.js` y el `?v=` de
`tierra-quieto*.png` en `src/styles/portada.css`. Banco de pruebas:
`arte/bancos/tierra.html` (con `?medir`).

## Decisiones que hay que respetar

- Disco completo; solo costas, sin fronteras políticas, con la línea de costa
  oscura. Giro calmado.
- Tamaño común de los tres astros: 70 svh (en vertical, el 88 % del ancho).
- Luz del terminador y del limbo en escalones lisos de 1/3 (`LIGHT_SUB`).
- Banquisa austral estrecha (borde a 62-69° S). La Antártida con su relieve
  (tierra con nieve por latitud y roca en las montañas), no hielo liso.
- Nubes: las 8 plantillas pixel art de siempre, a escala 1,0-1,3; más grandes
  no quedan bien. "Más adelante le meteremos más mano."
- Biomas por latitud más las cajas `DESIERTOS` y `SABANAS` de
  `generar-tierra.py`: si una zona sale con el bioma equivocado, se corrige
  con una caja.
- Luces de noche: `LUZ_PAIS` (África subsahariana ×0,5, Corea del Norte a
  oscuras, EE. UU. ×2,2, Canadá ×1,5). Con zoom, la huella de cada ciudad va
  agarrada al terreno. Las luces flojas se pintan con un ámbar claro al 50 %
  (con el ámbar oscuro el azul de la noche se volvía marrón).
- Brillo de atmósfera de noche: 1,5 px al 55 % y 1,5 px más al 25 %, por
  dentro del disco.
- Naves de noche: la foto a la luz de la luna, más clara que el planeta, y
  solo luces verde (ala derecha) y roja (izquierda). El Shahed-136 va a
  oscuras y el satélite no lleva.
- Sol y luna en el mismo sitio de día y de noche. Da igual que la fase de la
  luna no cuadre con la luz del planeta.
- Animaciones: nunca SVG animado con miles de formas (calienta la CPU en Zen);
  canvas, WebGL o PNG.

## Probado y rechazado (no reintentar salvo que se pida)

**Pixel art del planeta**: punteado Bayer en el terminador (parecía una
mosquitera); bordes de luz ondulados por ruido; franja cálida de atardecer;
brillo especular en el mar; nubes de ruido fBm; fundido entre fotogramas de
un sprite (iba a trompicones); transiciones a racimos de 1 px entre biomas;
huellas de 3×3 en todos los pueblos (confeti); dejar que la suma de halos de
luz subiera a niveles altos (Benelux e Inglaterra en una mancha naranja);
quitar el halo a los pueblos pequeños (Europa perdía el velo); nieve
ensanchada en los Pirineos a 0,2° ("déjalo como antes"); aurora con rayos
apartados al azar (confeti) o con cuatro arcos (carriles de autopista); luna
por la derecha de noche (contradecía la luz horneada de copas y relieve).

**Título**: rótulo pixel art, título en el cielo bajando el planeta, cartela
de expediente ("tapa mucho planeta"), sombra gruesa, negrita; cabecera de
revista, rótulo curvado sobre el océano, cabecera de periódico y chincheta en
la X; el rótulo a máquina de escribir encima del globo; la marca roja "NATO
SECRET" arriba (queda solo el sello).

**Otros**: parar el planeta al apuntar (la mira casi siempre está encima y
no giraría nunca); coordenada flotando donde estaba el título, abajo en el
centro o pegada a la mira (va en la esquina); recuadro oscuro con esquinas de
visor (va del color del papel).

## Ideas aparcadas

Chapas que se "planten" al pasar por el centro, 120 s por vuelta, E-2 de
perfil, ficha de bandera que se abra hacia arriba si la chapa está muy abajo.
Antes del zoom grande (pixel art detallado de países) hay que sacar las
teselas de Git: ver "Peso del repositorio" en `CLAUDE.md`.
