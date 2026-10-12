# Fase 4. El pixel HD

Parte de `docs/nuevodron.md`, que se lee antes. Lo que pase con el dron, en su diario.

Sale solo del HD: con `hd: true`, el modo Pixel pinta en directo la escena
del HD (forma, materiales, luz, calcas) y la pasada final
(`src/scripts/uas-pixelado.ts`) la pasa a pixel art. No se dibuja nada
aparte; **un fallo del HD sale igual en el pixel**, así que primero el HD.

**Ya decidido**: 1 px por píxel, con marcas y costuras, contorno de fuera en
negro (`contornoPixel: true`), sin tramado y sin tornillos.

**Objetivos, comprobados antes de enseñar**:

1. **El mismo color y la misma luz que el HD**, desde el mismo ángulo. La
   luz va en siete escalones: la pintura al sol tiene que caer **en el
   centro de un escalón**, no en el borde, o el ala sale a franjas. Se mide
   en cuántos escalones cae la pintura al sol y se corrige con
   `desfaseLuz` (TB2 0,48, MICH 0,15, Shahed −0,2, Raven −0,5; el
   Wildfire y el X10D no lo necesitan).
2. **Marcas que se lean**: cada calca, tinta entera o nada. Comprobarlo de
   perfil y desde donde se vean.
3. **Líneas limpias**: contorno negro solo en lo que tiene tres píxeles de
   grueso o más; lo fino (el ala de frente, colas, patas), como raya oscura
   de su color. Las líneas de dentro, del tono de la pieza más oscuro,
   nunca negras.
4. **Sin ruido**: ni píxeles sueltos ni tramado.
5. **Revisión pieza a pieza** en 3D, perfil, frente y planta junto al HD, y
   de noche.

**La 2.0 está en todas partes, sin preguntar**:

- **Tarjeta de `/uas`**: `tarjeta.png` y `tarjeta-noche.png` (256x144, 1 px
  por píxel, quieta). El ángulo, `vistaTarjeta: [acimut, elevación]` en la
  maqueta (sin él, 79°, 11°, casi de perfil). Se elige el que enseñe el
  dron: con ala en delta o ala larga, de más arriba ([61, 20] el TB2, el
  Raven y el Wildfire; [65, 30] el Shahed y el MICH); un multirrotor, de
  tres cuartos con el sensor de frente ([30, 27] el X10D). Si el usuario
  elige con una captura del visor, se saca con `arte/encajar-camara.mjs`
  sobre ella.
- **Planta de la tira de la portada**: `planta.png`. Si a ese tamaño las
  marcas salen como cuadrados, `plantaLisa: true`. Un dron pequeño con
  piezas finas, `plantaDoble: true` (pinta al doble y se queda con el píxel
  más claro de cada 2x2) y, si hace falta, `plantaSin` (piezas que no
  salen).
- Las dos salen de `node arte/generar-uas-miniaturas-hd.mjs <slug>`, con
  `npm run dev` en marcha. Repetir cada vez que cambia la maqueta.
- **Nave del hero de la portada**: solo si el usuario la pide (hoy lo son
  el MQ-9, el TB2 y el Shahed). Se añade a `NAVES` en
  `arte/generar-naves-uas-hd.mjs` y a `src/data/aeronaves.ts`;
  `node arte/generar-naves-uas-hd.mjs <id>` pinta `public/zodk-<id>.png` y
  da su `ratio` y sus `luces`; la de noche, `python3
  arte/generar-naves-noche.py <id>` (el de `/usr/bin`, con Pillow). Vista E
  (90°, 28°; con un ala en delta, 42°), pintada a 260 px y vista a la mitad
  (`ancho` 132). **Nunca pintarla al tamaño de pantalla** (60 px: sale una
  cruz gris). En vuelo: sin las piezas que recoge (`quitar`; mirar las
  fuentes: el MQ-9 recoge todo el tren, el TB2 solo la rueda del morro).
  Las pruebas se enseñan a su tamaño real, no ampliadas.
- La tira de la portada lleva siempre el X10D y el MICH-2000 (`EN_HANGAR`
  en `index.astro`): no se toca.

## Probado y rechazado (no se reintenta salvo que lo pida)

- Tramado, escalones de luz en curva, líneas de dentro negras, calcas
  reducidas a gris, 2 px y 1,5 px por píxel.
- Tarjetas de `/uas` que giran o se ponen de frente al pasar el ratón.
- Nave del hero pintada al tamaño de pantalla o casi desde arriba.
