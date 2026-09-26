# El logo

La Tierra en pixel art girando, con un dron que la sobrevuela. Es el logo de
la **cabecera** (no confundir con la Tierra de la portada). Un SVG animado
sin JavaScript: 89 KB, 7 KB con gzip, 1.299 rectángulos.

## Archivos

| En `arte/` | En la web | Para qué |
|---|---|---|
| `generar-logo.py` | — | Genera el SVG animado (solo librería estándar) |
| — | `public/zodk-logo-animado.svg` | El logo, modo claro |
| — | `public/zodk-logo-nocturno.svg` | El logo, modo oscuro |
| `zodk-favicon.svg` | `public/zodk-favicon-v2.svg` | Favicon vectorial (solo el globo) |
| `favicon-16.png`, `favicon-32.png` | `public/favicon-16-v2.png`, `favicon-32-v2.png` | Para navegadores viejos |
| `favicon.ico` | `public/favicon-v2.ico` y `public/favicon.ico` | El de la raíz lo piden algunos navegadores por su nombre |
| `apple-touch-icon.png` | `public/apple-touch-icon-v2.png` y el de la raíz | iOS; fondo opaco (Apple no respeta la transparencia) |
| — | `public/og-image.png` | Vista previa al compartir (1200 × 630) |

El sufijo `-v2` es para que los navegadores suelten el icono viejo (Safari lo
guarda por URL y no lo suelta ni borrando datos). Si se cambia el icono:
`-v3`, y actualizar `src/components/Head.astro`. `public/favicon.ico` y
`public/apple-touch-icon.png` no los enlaza nada, pero se quedan: los
navegadores y iOS los piden por su nombre.

```bash
cd arte && python3 generar-logo.py   # escribe zodk-logo-animado.svg aquí
```

Debe imprimir `rects: 1299 | bytes: 88657`; si no, el script ha cambiado.

## En la web

Va de fondo en CSS (`.logo-home` en `src/styles/base.css`), no como `<img>`:
así solo se baja el SVG del tema activo (89 KB el de día, 154 KB el de noche).
Siempre a múltiplos enteros de 26 × 33,5 (52 × 67, 78 × 100, 104 × 134) para
que los píxeles queden cuadrados. Necesita su alto completo: el dron recorre
105 px de los 335 del `viewBox`.

Lleva dibujado un anillo de píxeles oscuros (`#101d33`) alrededor del globo y
del dron: desaparece sobre fondo negro y recorta la silueta sobre blanco. Va
dibujado y no con `drop-shadow()`, que se recalcularía en cada fotograma y
daría un borde suavizado. Respeta `prefers-reduced-motion`.

## Cómo gira

Deslizar un mapa detrás de un círculo parece un cilindro, no una esfera: lo
que da la ilusión es que cerca del borde los continentes se aplastan y apenas
avanzan (x = R·sin(λ − λ₀)). Por eso hay **20 fotogramas precalculados**: para
cada columna de cada fila se invierte la proyección y se mira el mapamundi
ahí. Los 20 van en fila y se recorren con `translateX` y `steps(20)`, como una
hoja de sprites en vector.

- El meridiano central **decrece** de un fotograma al siguiente: los
  continentes entran por la izquierda, como se ve girar la Tierra desde fuera
  con el norte arriba. Con el signo contrario gira al revés, y se nota.
- El océano es un disco quieto debajo (la luz no gira con el mapa); cada
  fotograma solo lleva tierra y hielo.
- El recorte circular va fuera del grupo que se mueve; si no, viajaría con
  los fotogramas.
- El dron se dibuja el último (tapa el globo) y planea en diagonal: 105 px en
  vertical y 22 en horizontal, con `cubic-bezier(.45,0,.55,1)`.

Ajustes rápidos, en el script y en el SVG: velocidad (`#zodk-rotar`, 20 s por
vuelta), fotogramas (`FRAMES`, 20; más fotogramas, más peso casi en
proporción), vuelo (`#dron`, 7 s), `DIVE` (105 px), `DRIFT` (22 px; a 0 sería
una órbita polar), terminador (`SHADOW`), color del contorno (`--zodk-borde`).

## El mapamundi

Rejilla de 52 × 26 celdas de 6,92°, en `WORLD` (tramos de tierra `l` y hielo
`i` por fila), revisada celda a celda con las coordenadas reales: el codo del
golfo de Guinea, el istmo de Suez como único punto de unión entre África y
Asia, Iberia con Portugal saliente, las islas británicas en L, Australia
separada de Indonesia por una fila de mar (sin ella se tocan y deja de
leerse), Japón como arco de cuatro celdas.

Favicon, `apple-touch-icon` y la imagen para compartir son estáticos: salen
del fotograma 0, con África y Europa de frente.
