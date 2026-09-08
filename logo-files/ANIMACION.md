# Logo animado — zodk.eu v1.0

`zodk-logo-animado.svg` — 89 KB en crudo, **7,1 KB con gzip**, 1.299
rectángulos. Sin dependencias.
`viewBox="-10 -10 280 355"`: el margen negativo deja sitio al contorno.

## Por qué una tira plana no parecía un planeta

Deslizar un mapa rectangular detrás de un círculo simula un cilindro, no una
esfera: todas las longitudes avanzan a la misma velocidad, así que el ojo lee
"banner pasando" en vez de "planeta girando".

Lo que faltaba es la **compresión en el limbo**. En una esfera real, un punto a
longitud λ aparece en `x = R·sin(λ − λ₀)`: cerca del centro del disco los
continentes se estiran y avanzan deprisa, y cerca del borde se aplastan y apenas
se mueven antes de desaparecer. Ese contraste de velocidades entre el centro y
los bordes es toda la ilusión de esfera.

## Cómo se resuelve

No se puede hacer con un `translateX`, así que se precalculan **20 fotogramas**.
Para cada columna visible de cada fila se invierte la proyección:

```python
ratio = (c + 0.5 - centro) / semiancho_de_la_fila
lam   = lam0 + degrees(asin(ratio))     # que longitud cae en esta columna
```

y se consulta el mapamundi ahí. El resultado son 20 dibujos distintos, no 20
posiciones del mismo dibujo.

Los 20 fotogramas se colocan en fila horizontal (uno cada 260 px) y se recorren
con `translateX` y `animation-timing-function: steps(20)`, que salta de uno a
otro sin interpolar. Es la técnica de la hoja de sprites de toda la vida, hecha
en vector.

## Sentido de giro

El meridiano central **decrece** de un fotograma al siguiente
(`frame_cells(-i * 360 / FRAMES)`). Eso hace que los continentes emerjan por el
limbo izquierdo, crucen el disco y salgan por el derecho, que es como se ve
rotar la Tierra desde fuera con el norte arriba.

Con el signo positivo el planeta gira en retrógrado. No es un detalle
imperceptible: África entrando de espaldas se nota aunque no sepas por qué.

## Ahorro de peso

El océano **no** está en los fotogramas: es un disco estático dibujado debajo,
porque la iluminación no rota con el mapa. Cada fotograma solo aporta los
rectángulos de tierra y hielo.

## Cómo está montado

```
<clipPath #zodk-disco>        recorte circular, FIJO
<g #globo>
  disco oceánico estático (con su medialuna en sombra)
  recorte circular → <g #zodk-rotar>  ← los 20 fotogramas en fila
<g #dron>                     dibujado el último, por eso tapa el globo
```

El recorte va **fuera** del grupo que se mueve. Si estuviera dentro viajaría con
los fotogramas y el globo se saldría del círculo.

El dron va después del globo en el orden del documento, que es lo que hace que
lo oculte al pasar por delante.

## El vuelo del dron

Recorre 105 px en vertical y 22 px en horizontal a la vez, así que **planea en
diagonal** en lugar de subir y bajar como un ascensor. En el punto más bajo
cruza por delante del hemisferio norte del globo, derivando hacia el este, o
sea acompañando la rotación. El `cubic-bezier(.45,0,.55,1)` frena en los
extremos del recorrido, que es como se comporta algo que vuela.

Como la animación es `alternate`, en el ascenso la deriva va al revés. A esa
altura el dron ya está por encima del planeta, así que no se lee como
contrasentido. Si quieres el comportamiento de un satélite de observación real
—órbita polar, norte-sur, con el planeta girando por debajo— baja `DRIFT` a `0`.

## Ajustes rápidos

| Qué | Dónde | Valor |
|---|---|---|
| Velocidad de giro | `#zodk-rotar` | `20s` una vuelta |
| Suavidad del giro | `FRAMES` en el `.py` | `20` fotogramas |
| Sentido de giro | signo de `lam0` en el bucle `tira` | negativo = este |
| Duración del vuelo | `#dron` | `7s` ida y vuelta |
| Profundidad del picado | `DIVE` | `105` px |
| Deriva lateral | `DRIFT` | `22` px |
| Posición del terminador | lista `SHADOW` | columnas 14 → 19 → 14 |
| Grosor del contorno | `sub=2` en `outline()` | 5 px (PX/2) |
| Color del contorno | `--zodk-borde` | `#101d33` |

Subir `FRAMES` suaviza el giro y engorda el archivo casi en proporción directa.
A 20 fotogramas cada salto es de 18°, que a este tamaño de píxel se lee como
movimiento continuo.

## El contorno

Anillo de píxeles oscuros alrededor de la silueta del globo y del dron,
calculado buscando las celdas vecinas que quedan fuera de cada forma. El del
globo se calcula sobre una rejilla al doble de resolución (`sub=2`), así que
mide 5 px en vez de 10 y no engorda la silueta.

Va dibujado, no aplicado con `filter: drop-shadow()`. Dos razones: un filtro CSS
se recalcularía en cada fotograma de la animación, y produce un borde suavizado
que rompe la rejilla. Dibujado queda nítido y sale gratis.

El contorno del dron también hace de separación cuando pasa por delante del
globo, que es lo que evita que el gris del fuselaje se confunda con el azul del
océano.

## El mapamundi

Rejilla equirectangular de 52×26: cada celda son 6,92° de longitud por 6,92° de
latitud. Cada fila del diccionario `WORLD` es una lista de tramos
`(desde, hasta, tipo)` con `l` de tierra y `i` de hielo.

Al dibujarlo se comprobó celda a celda qué hay en el centro de cada una según
sus coordenadas reales. Lo que quedó:

- **África.** El saliente del cabo Blanco sobresale solo en las filas 11-12. El
  golfo de Guinea es un ángulo recto: la costa se mantiene en la columna 24 toda
  la fila 13 y salta a la 27 en la 14, tres columnas de retroceso contra una de
  caída, que es la proporción real del codo de Camerún. El mar Rojo baja en
  diagonal y queda cerrado por arriba: el istmo de Suez es el único punto donde
  África toca Asia. El Cuerno llega a la columna 32 y se separa de Yemen por el
  golfo de Adén. El continente se afila de verdad hacia el sur: cinco celdas en
  el Congo, tres, dos y una en el cabo de Buena Esperanza. Madagascar en las
  filas 16-17, su latitud real.
- **Norte de África.** La costa no es una línea recta: el Magreb va por la fila
  9, Túnez sobresale a la 8, el golfo de Sirte muerde hasta la 10 y Egipto
  vuelve a subir para enlazar con el Sinaí.
- **Europa.** Iberia estrecha arriba y ancha abajo, con Portugal sobresaliendo
  al oeste y el golfo de Vizcaya abierto a su derecha. Islas Británicas en L —
  Escocia arriba, Irlanda y Gran Bretaña debajo — rodeadas de mar por los cuatro
  lados. Noruega como franja con el golfo de Botnia detrás y el Báltico en
  diagonal debajo. Italia aislada entre dos mares, mar Negro y Caspio de dos
  celdas cada uno.
- **Australia.** Seis columnas por cuatro filas. El golfo de Carpentaria recorta
  el norte dejando el cabo York suelto, la Gran Bahía Australiana muerde dos
  celdas en el sur entre Perth y Australia Meridional, y Tasmania cuelga en la
  fila 19. La fila 14 se deja completamente marina para separarla de Indonesia;
  sin esa fila vacía las dos masas se tocan y Australia deja de leerse.
- **Japón** es un arco de cuatro celdas separado del continente por el mar del
  Japón, que es como se lee un arco insular a esta resolución.

## Lo que sigue estático

Favicon, `apple-touch-icon` y la imagen Open Graph. Los navegadores no animan
favicons SVG y las redes rasterizan la OG image. Los tres salen del fotograma 0,
con África y Europa de frente.
