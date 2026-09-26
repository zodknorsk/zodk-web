# La Luna (`/luna`)

## Estado

**Terminado y publicado.** Lo que queda es menor:

- Con la ventana estrecha, la Orion pasa por detrás de la columna de países
  en el borde izquierdo.
- Fotos poco vistosas (vistas del LRO desde órbita) en las soviéticas, SLIM,
  IM-1 e IM-2: si aparecen mejores, se cambian.
- Las 28 notas de misión siguen en `estado: borrador` en la bóveda (foto y un
  par de párrafos); se publicaron así a propósito.
- El mapa base del giro pesa 1,5 MB.
- Sin comprobar con ventanas muy bajas: el menú de arriba a la derecha y la
  columna de países podrían quedar cerca.

## Qué se ve

- **La Luna** en pixel art, que se gira arrastrando (un dedo en el móvil) y
  se acerca con la rueda, el trackpad o pellizcando hasta ×6, ganando
  detalle. Al acercarse salen los nombres de mares, cráteres y montes (a ×1,
  ninguno). La luz va con la vista: más oscura y fría según domina la cara
  oculta.
- **Mando** abajo en el centro: un solo botón que lleva a la otra cara con un
  giro de 2,8 s; la píldora dorada sigue a la Luna en directo, también al
  arrastrar.
- **28 alunizajes** con chapa de bandera y ficha (foto, título, país y año,
  texto y "Leer la nota"). Salen los de la zona que se ve. Columna de países a
  la izquierda (en el móvil, fila de banderas encima del mando); EE. UU. se
  despliega en Surveyor / Apolo / misiones privadas. Al adentrarse en la cara
  oculta se apaga todo y se enciende China (Chang'e 4 y 6).
- **Relés Queqiao y Queqiao-2** sobre la cuenca Polo Sur-Aitken, con ficha y
  ondas nave → relé → Tierra por turnos (sin China encendida no hay ondas).
- **La Orion de Artemis II** orbitando las dos caras (32 fotogramas que giran
  según va), con ficha; en la cara visible se oscurece al cruzar la línea
  día/noche y la sombra de la Luna.
- **Menú** arriba a la derecha (`alunizajes / relés / orion`), enlaces a sus
  notas; hace de cabecera, que en `/luna` no se pinta.
- **Marte pequeño** arriba a la izquierda: vuelo a `/marte`. **Volver a la
  Tierra** abajo a la derecha: el vuelo de ida al revés. Su icono es la Tierra
  de noche de la portada de antes (`public/planeta/planeta-quieto-noche.png`):
  ya no la genera ningún script, pero se usa.
- **La selección aguanta**: países encendidos y vista se guardan en
  `sessionStorage` (`luna-estado`), así que entrar en una nota y volver con
  "Volver a la Luna" lo deja todo igual. Al volver a la Tierra se borra.
- En táctil, un toque en una chapa, un relé o la Orion abre su ficha en un
  panel arriba.

## Cómo se llega

Pulsando la luna del hero (solo de noche) o `moon-project` en la cabecera.
Desde la portada ese enlace hace el mismo vuelo; si está de día, primero
cambia a noche y después vuela. Desde el resto de páginas es un enlace
normal.

**Las notas etiquetadas `luna` viven solo en la Luna**: no salen en `/notas`,
en la portada ni en el RSS, y su "volver" lleva a `/luna`
(`src/lib/contenido.ts`). Sus páginas sí se generan.

## Cómo funciona

- **Motor**: `src/scripts/luna-gl.js`, que monta el WebGL de Marte
  (`marte-gl.js`) con la luz de la Luna (fase, exposición y tono frío según
  cuánto de cara oculta se ve) y añade el giro a cada cara.
- **La página**: `src/pages/luna.astro` (HTML y todo su JavaScript: chapas,
  columna, relés, Orion, mando, vuelos, estado). Estilos en
  `src/styles/luna.css`.
- **Datos** en `public/luna/`: mapa base de 4 px/grado, LUT, `luna-datos.json`,
  teselas `n1`-`n4` (8, 16, 24 y 32 px/grado, 179 MB), `luna-nombres.json`, las
  dos caras fijas (`luna-visible.png`, `luna-oculta.png`: aterrizaje del
  vuelo, sin WebGL2 y mientras carga), los relés y la tira de la Orion.
- **Misiones**: `src/data/alunizajes.ts`. Añadir una = una entrada ahí y su
  foto en `public/alunizajes/`. Entran todas las que se posaron, aunque fuera
  mal (Luna 23, IM-1 e IM-2 volcaron); las que se estrellaron no
  (Chandrayaan-2, Peregrine, Beresheet). Chandrayaan-3, IM-1 e IM-2 solo en la
  cara visible, para que en la oculta estén solo los dos únicos alunizajes de
  allí.
- **Chapas que se pisan** (Surveyor 3 cayó a 180 m del Apolo 12): se ponen
  lado a lado en su punto medio y se separan al acercarse.

## Regenerar

Fuentes en `arte/luna-fuentes/` (fuera de Git; los `curl`, en el docstring de
`generar-luna.py`).

```bash
cd arte
python3 generar-luna.py --derecha --valles --relieve-mares 2.5          # cara visible
python3 generar-luna.py --oculta --sur --valles --relieve-mares 2.5 --exposicion 0.6 --frio 0.5
python3 generar-luna.py --canvas ../public/luna/     # mapa, LUT, datos y las dos caras
python3 generar-luna.py --teselas ../public/luna/    # n1-n4 (tarda; --solo 4 para uno)
python3 generar-nombres.py --luna                    # luna-nombres.json
python3 generar-orion.py                             # la Orion (--css: la sombra)
python3 generar-queqiao.py                           # los relés
```

Después, subir `LUNA_V` en `src/scripts/versiones.js` y el `?v=` de
`luna-visible.png` en `src/styles/luna.css`. **Ojo al probar**: el servidor
de desarrollo no manda cabeceras de caché y el navegador puede seguir con
datos viejos; recargar forzando (Cmd+Mayús+R).

## Decisiones que hay que respetar

- Pixel art contenido, **no realista**: el zoom solo afina bordes y relieve,
  no añade manchas nuevas.
- Cara visible con luz por la derecha, fase 38°, mares con `--valles
  --relieve-mares 2.5`. Cara oculta inclinada 30° al sur (Aitken en el centro),
  fase 65°, luz al 60 % y tono frío suave.
- Luz cenicienta del lado de noche a 0,16: con menos, la Luna se confundía con
  el fondo y una chapa parecía flotar.
- El giro va siempre hacia el mismo lado (la superficie se mueve a la
  derecha) y la luz cambia a la vez que gira.
- Las fichas de `/luna` se quedan como están, sin las filas Lugar / Fecha /
  Estado de las de Marte.
- La columna de países lleva el nombre siempre visible.
- Polo sur: Chandrayaan-3, IM-1 e IM-2 se quedan pegadas al borde de abajo.

## Probado y rechazado (no reintentar salvo que se pida)

- **Vuelo**: la Tierra que encoge y cae, que va a una esquina ("nononono"),
  que gira, se aleja o se apaga; el detalle de la Luna por etapas (32 → 585
  px, "va pasando por fases") o manteniendo el icono; zoom 2D plano. En la
  vuelta, la Tierra escondida detrás de la Luna ("detrás" y "rodea"): se
  queda la de ida al revés.
- **Luna**: halo alrededor del disco ("prefiero sin halo"); penumbra más corta;
  cara oculta de frente sin inclinar, o a fase 90° o 115°; luz al 50 % o al
  70 %, o con tono frío fuerte (parecía un filtro); relieve de los mares
  suavizado; derivada del zoom más suave (`d4`, borroso a ×6).
- **Botones**: iconos pixel sueltos, subrayado discreto, discos con aro,
  mando segmentado o de cristal; las fases de la luna como iconos del mando;
  encoger la Luna para dejar sitio al mando (se sube 3,5 svh).
- **Chapas**: nombre del país solo al pasar el ratón en la columna; fichas
  junto a la chapa en el móvil (se salían).
- **Orion**: cambiar de vista con volteos instantáneos (el espejo al pasar
  por el borde "no me gusta"); se calculan 32 fotogramas que giran pasando
  por la cola.

## Rendimiento

La Orion se lleva la mitad de los vatios de `/luna` solo por moverse, y las
cinco hipótesis probadas se descartaron (ver `rendimiento.md`). Aparcado: en
reposo el portátil está en silencio.
