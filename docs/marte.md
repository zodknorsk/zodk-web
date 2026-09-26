# Marte (`/marte`)

## Estado

**Terminado y publicado.** Abierto, sin prisa:

- El pellizco del trackpad en Safari del Mac está previsto (`gesture*`) pero
  sin probar. En el iPhone el pellizco táctil funciona.
- Al pasar de un nivel de teselas a otro durante el zoom, el detalle "salta"
  (normal en mapas por niveles; suavizarlo pediría mezclar dos niveles en el
  shader). Se deja salvo que moleste.
- Las chapas enlazan a su nota solo cuando está publicada; hoy, ninguna (las
  17 notas están en la bóveda con `publicar: false`).

## Qué se ve

- **Marte quieto** (no gira solo) a pantalla completa, sin cabecera ni
  scroll. Se gira con clic y arrastrar (un dedo en el móvil; flecha normal y
  mano cerrada solo al pinchar) y se acerca con la rueda, el trackpad o
  pellizcando hasta ×6, ganando detalle.
- **Nombres de lugares** al acercarse (a ×1, ninguno): visor de esquinas para
  montes, cráteres y calderas; rótulo de región para llanuras y zonas
  grandes. En latín, los oficiales de la UAI.
- **17 chapas de amartizajes** (bandera en pixel art; las que no llegaron
  enteras, en blanco y negro) con ficha: foto, Lugar / Fecha / Estado y una
  frase. A ×1 son lo único que sale. Perseverance e Ingenuity van pegadas a
  ×1 y se separan al acercarse.
- **Tierra pequeña** arriba a la derecha de Marte: vuelo hacia delante a la
  portada. Va detrás de Marte: al acercarse, Marte la tapa y no se puede
  pulsar.
- **"Volver a la Luna"** abajo a la derecha, solo si se llegó desde `/luna`:
  deshace ese vuelo, desde Marte tal como se ha dejado (si estaba acercado,
  se aleja y vuela en un solo movimiento).

## Cómo se llega

Desde el Marte pequeño de la portada (o `mars-project` en la cabecera) y
desde el de `/luna`, siempre con un vuelo. `/luna` avisa con
`sessionStorage` (`marte-desde`) para que salga "volver a la Luna"; `/marte`
lo lee y lo borra al llegar.

Las notas etiquetadas `marte` tienen los mismos filtros que las de la Luna:
no salen en `/notas`, la portada ni el RSS, y su "volver" lleva a `/marte`.

## Cómo funciona

- **Motor**: `src/scripts/marte-gl.js` (WebGL2; también lo usa la Luna).
  Pirámide de mapas: la base de 4 px/grado entera y tres niveles en teselas
  de 360 × 360 celdas (8, 16 y 24 px/grado). Cada píxel lee del nivel cuya
  celda mide lo que él en latitud; solo se bajan las teselas que se ven, las
  centrales primero, a un atlas de tamaño fijo en la GPU. Quieto no repinta.
  0,25-0,6 ms por fotograma.
- **Gestos**: `src/scripts/gestos.js` (mano y zoom, comunes a los tres
  astros). Giro tipo globo: norte siempre arriba, a los lados cambia la
  longitud, arriba y abajo inclina hasta los polos. Zoom hacia el cursor al
  acercar; al alejar, hacia el centro y sin girar.
- **La página**: `src/pages/marte.astro`; estilos en `src/styles/marte.css`.
- **Datos** en `public/marte/`: mapa base, LUT, `marte-datos.json`, teselas
  `n1`-`n3` (38 MB), `marte-nombres.json` y `marte-quieto.png` (la vista
  inicial, que se ve mientras carga, sin WebGL2 y en los vuelos).
- **Misiones**: `src/data/amartizajes.ts`; fotos en `public/amartizajes/` (las
  mismas que en las notas de la bóveda, `02 - Temas/mars-project`, en `Soft
  Landings` y `Hard Landings`). Criterio de la foto: la nave en Marte si hay;
  si no, lo que vio al llegar; si no, desde órbita, una maqueta o un dibujo.

## Regenerar

Fuentes en `arte/marte-fuentes/` (~1 GB, fuera de Git: MOLA de 16 y 32
px/grado y el mosaico Viking con sus reducciones; los `curl` y `sips`, en el
docstring de `generar-marte.py`).

```bash
cd arte
python3 generar-marte.py --canvas ../public/marte/        # base + teselas (~4 min)
python3 generar-marte.py --icono ../public/zodk-marte.png  # el Marte pequeño
python3 generar-nombres.py                                 # marte-nombres.json
cd .. && node arte/generar-marte-quieto.mjs                # la vista inicial (Chrome sin ventana)
```

Después, subir `MARTE_V` en `src/scripts/versiones.js` y el `?v=` de
`marte-quieto.png` en `src/styles/marte.css`. Bancos: `arte/bancos/marte-zoom.html`
(con `?medir`, `?vista`, `?lut`, `?datos`) y `arte/bancos/marte-nombres.html`.

## Decisiones que hay que respetar

- Marte **no gira solo**, y sin botón de play/pausa.
- Pulido **sin pasarse de realismo**: retoques contenidos sobre lo que había.
- Sombra (lado sin sol) a 0,22. Llanuras con el pico de brillo partido en dos
  tonos casi iguales. Zonas oscuras en "chocolate suave" (el pardo es además
  lo más fiel al color real). Casquete norte "el de verdad". Vista inicial
  inclinada 12,5° al norte. El grano de las llanuras a ×6, como está.
- ×6 con un nivel de 24 px/grado, no de 32: a ×6 un píxel de arte son ~23
  px/grado, así que 32 no enseñaría más y pesaría el doble.
- Sin título al llegar y sin menú.
- Cada amartizaje, bueno o fallido, tiene cerca un accidente con nombre.
- El visor ceñido a la geografía solo en los montes (se busca el pie de la
  ladera en el relieve; nunca agranda más de un 10 % la caja del catálogo).
- Los astros pequeños van arriba y pulsarlos hace un vuelo **hacia delante**;
  el vuelo al revés, solo para un "volver" explícito. Animaciones fluidas, sin
  parones entre fases.

## Probado y rechazado (no reintentar salvo que se pida)

- Girar con la barra espaciadora (como la mano de Photoshop): se cambió por
  clic y arrastrar.
- Colores de las zonas oscuras "basalto", "gris azulado" y chocolate con más
  contraste; llanuras en bandas de altura (parecía un mapa topográfico) o con
  más relieve en lo llano (demasiado realista); casquete norte más amplio;
  vista a 25° al norte ("la mitad por lo menos"); suavizar el grano de las
  llanuras. Todo sigue en el generador (`--variante`, `--oscuras`) por si se
  quiere volver a ver.
- Estilos de nombres "rótulo de atlas" solo y "chapa con ficha" para todo;
  marco de visor en las llanuras (encerraba media cara del planeta).
- Ceñir el visor de cráteres y calderas al relieve (agrandaba el marco donde
  el terreno de fuera es más alto).
- El título "mars project" animado al aterrizar (se hizo, se pulió y se
  quitó).
- Fallidas con aspa (se comía la bandera) o con una raya; quedaron en blanco
  y negro.
- Filas de la ficha "dónde / cuándo / duró".
- Volver de `/marte` con Marte recolocado en su vista inicial antes de
  despegar: sale tal como se dejó.
