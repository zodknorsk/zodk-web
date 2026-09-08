# Logo zodk.eu — pixel art

## Archivos

| Archivo | Uso |
|---|---|
| `zodk-logo.svg` | Versión completa (globo + dron). Header, redes, Open Graph. 260×335 |
| `zodk-logo.png` | La misma, rasterizada a 416×536 con bordes nítidos |
| `zodk-favicon.svg` | Versión simplificada 16×16, solo globo. Favicon vectorial |
| `favicon.ico` | Contiene 16, 32 y 48 px |
| `favicon-16.png` / `favicon-32.png` | PNG sueltos por si tu build los pide |
| `apple-touch-icon.png` | 180×180 |

Fondo transparente en todos. Funcionan igual sobre claro y sobre oscuro.

## Por qué dos artes distintos

El logo completo tiene el globo a 26×26 píxeles para que se distingan Iberia,
Italia, Gran Bretaña e India. A 16 px eso se convierte en ruido, así que el
favicon usa un globo simplificado a 16×16 sin dron. Es lo habitual en marcas con
iconos detallados.

## Integración

Coloca los archivos en `public/` (o `static/`, según tu framework) y añade al
`<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/zodk-favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

El navegador elige el SVG si lo soporta y cae al `.ico` si no.

En el header, usa el SVG completo:

```html
<img src="/zodk-logo.svg" alt="zodk.eu" width="52" height="67"
     style="image-rendering: pixelated;">
```

`image-rendering: pixelated` importa: sin ella, algunos navegadores suavizan los
bordes al escalar y se pierde el aspecto pixel art. Escala siempre por múltiplos
enteros (52×67, 104×134, 156×201…) para que los píxeles queden cuadrados.

`site.webmanifest` mínimo:

```json
{
  "name": "zodk.eu",
  "icons": [
    { "src": "/favicon-32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

## Paleta

| Elemento | Iluminado | En sombra |
|---|---|---|
| Océano | `#3b7dc4` | `#1b3c69` |
| Tierra | `#5aab5f` | `#2f6b3c` |
| Hielo | `#eef3f7` | `#b6c7d5` |
| Dron | `#dde3e8` | `#8b95a0` |
| Acento de marca (sensor) | `#e91e8c` | — |

## Regenerar

`build_logo.py` y `build_icons.py` contienen la rejilla como datos, no como
rectángulos sueltos. Para tocar la geografía se editan los diccionarios
`GLOBE_ROWS` / `FAVI_ROWS` (una línea por fila, con tramos `(col_inicio,
col_fin, tipo)`) y se vuelve a ejecutar. El terminador vive en la lista
`SHADOW`.

---

# Prompt para recrearlo desde cero

Si pierdes los archivos, este prompt reproduce el diseño. Adjunta también
`zodk-logo.svg` si lo conservas: es mucho más fiable que cualquier descripción.

```
Necesito un logo en estilo pixel art para zodk.eu: un globo terráqueo centrado
en Europa/África con un dron de observación de ala fija sobrevolándolo.
Trabaja en SVG con rectángulos alineados a rejilla y shape-rendering="crispEdges".
Fondo transparente. Nada de degradados ni suavizado.

GLOBO — rejilla de 26×26 celdas, círculo inscrito, 10 px por celda.
Paleta de dos tonos por material (claro = iluminado, oscuro = en sombra):
océano #3b7dc4 / #1b3c69, tierra #5aab5f / #2f6b3c, hielo #eef3f7 / #b6c7d5.
El terminador entre luz y sombra NO es una línea recta: es un borde escalonado
que sigue la curvatura de la esfera, desplazado a la derecha del centro (empieza
sobre la columna 14 arriba, se abomba hasta la 19 en el ecuador y vuelve a la 14
abajo). Casquetes polares pequeños: una fila arriba, fila y media abajo.

GEOGRAFÍA — vista centrada en 20°E. Lo que tiene que leerse:
- Gran Bretaña como isla separada del continente por mar en todos sus lados.
- Península ibérica en dos filas, colgando de Francia solo por su esquina
  superior derecha y estrechándose hacia el sur.
- Italia como franja vertical de un píxel de ancho y dos de alto, con mar a
  ambos lados (Tirreno y Adriático).
- Mar Negro como lago cerrado de dos píxeles, con tierra arriba y abajo.
- Entrante del Báltico recortando Escandinavia.
- Asia SIN ningún entrante: bloque macizo que llega hasta el borde del globo.
  El contraste entre la Europa toda picada de mares y la Asia sólida es
  intencionado y es el punto clave del diseño.
- Mediterráneo: una sola fila de agua separando Europa de África.
- Costa norte de África escalonada, nunca horizontal: el Magreb sobresale una
  fila por encima, el golfo de Sirte muerde hacia dentro con un píxel de mar, y
  Egipto queda una fila más abajo. África se conecta a Asia por el istmo, a la
  derecha.
- Costa oeste de África retrocediendo en tres escalones (Sáhara Occidental →
  Guinea → Gabón) para formar el golfo de Guinea.
- Cuerno de África sobresaliendo al este, bajo el golfo de Adén.
- Mar Rojo y golfo Pérsico como diagonales de agua de dos píxeles que recortan
  la península arábiga.
- India como península que sobresale al sur, con mar Arábigo a un lado y golfo
  de Bengala al otro, estrechándose a un píxel en la punta.
- Madagascar como isla de dos píxeles junto a la costa este.
- África llega bastante al sur, hasta dos filas del hielo antártico.

DRON — rejilla propia de 22×12 celdas a 5 px por celda, es decir la MITAD del
tamaño de píxel del globo. Esa diferencia de rejilla es deliberada: da detalle al
objeto pequeño. Vista en planta, morro a la izquierda:
- Morro bulboso de 6×4 celdas.
- Sensor frontal de un píxel en magenta #e91e8c (único punto de color de marca).
- Fuselaje largo y estrecho de dos filas de alto.
- Alas rectas de gran alargamiento, cuerda de tres celdas, afinadas a dos en las
  puntas, cruzando el fuselaje perpendicularmente.
- Cola en V invertida barrida hacia atrás, dos aletas simétricas.
- Sombreado en dos tonos: mitad superior #dde3e8, mitad inferior #8b95a0.
Colócalo arriba a la izquierda, sin tocar el globo.

ENTREGABLES
1. SVG completo (dron + globo).
2. SVG simplificado de 16×16 SOLO con el globo, sin dron, para el favicon: a ese
   tamaño el detalle de costas se convierte en ruido.
3. PNG de ambos, favicon.ico con 16/32/48 y apple-touch-icon de 180×180.
Genera los SVG desde un script con la rejilla guardada como datos (una lista de
tramos por fila), no escribiendo los rectángulos a mano.
```
