# Logo zodk.eu — v1.0

Planeta Tierra en pixel art girando sobre su eje con un dron de observación
sobrevolándolo. Sin dependencias, sin peticiones externas, sin JavaScript.

## Contenido

| Archivo | Peso | Para qué |
|---|---|---|
| `zodk-logo-animado.svg` | 89 KB / **7,1 KB gzip** | Home, hero, header |
| `zodk-logo-estatico.svg` | 19 KB / **1,5 KB gzip** | Cuando no hay sitio para el picado del dron |
| `favicon.svg` | 16 KB / **1,2 KB gzip** | Favicon vectorial (solo el globo) |
| `favicon-16.png` `favicon-32.png` `favicon-48.png` | < 4 KB | Fallback para navegadores viejos |
| `apple-touch-icon.png` | 180×180 | iOS. Fondo opaco: Apple no respeta la transparencia |
| `og-image.png` | 1200×630 | Open Graph y Twitter Card |
| `demo-animado.html` | — | Prueba en claro y oscuro, a dos tamaños |
| `ANIMACION.md` | — | Cómo funciona y qué tocar para cambiarlo |
| `generar-logo.py` | — | Regenera el SVG animado. Solo librería estándar |

## Dónde va cada cosa

Copia los estáticos a la raíz pública (`public/` en Astro) y los SVG que se
incrustan a `src/assets/`:

```
public/
  favicon.svg
  favicon-16.png
  favicon-32.png
  favicon-48.png
  apple-touch-icon.png
  og-image.png
src/assets/
  zodk-logo-animado.svg
  zodk-logo-estatico.svg
```

## Etiquetas del `<head>`

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<meta property="og:image" content="https://zodk.eu/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

## Incrustar el logo

```astro
---
import logo from '../assets/zodk-logo-animado.svg?raw';
---
<span class="logo" set:html={logo} />
```

```css
.logo svg { width: 52px; height: 67px; image-rendering: pixelated; }
```

Incrustado en línea es lo preferible: los `@keyframes` van dentro del propio
SVG, así que funciona igual como `<img>`, pero en línea te ahorras una petición
y puedes redefinir el color del contorno desde fuera.

**Escala por múltiplos enteros** de 26×33,5 — 52×67, 78×100, 104×134 — para que
los píxeles queden cuadrados. Cualquier otro valor los deja borrosos aunque
pongas `image-rendering: pixelated`.

## Altura mínima

El dron recorre 105 px de los 335 del `viewBox`. Si en el header solo tienes
sitio para una franja baja, se saldrá de plano: ahí usa
`zodk-logo-estatico.svg`, que trae el mismo dibujo con el dron quieto en su
posición inicial.

## Modo claro y oscuro

El logo lleva dibujado un anillo de píxeles oscuros (`#101d33`) de 5 px
alrededor del globo y del dron. Es lo bastante oscuro para desaparecer sobre un
header negro y lo bastante contrastado para recortar la silueta sobre blanco,
así que el mismo archivo sirve para los dos modos. Si en algún sitio estorba:

```css
.logo { --zodk-borde: transparent; }
```

## Accesibilidad

Trae `role="img"` y `aria-label="zodk.eu"`, y respeta
`prefers-reduced-motion: reduce` deteniendo las dos animaciones. Si lo usas como
`<img>`, pon `alt=""` cuando al lado ya vaya el texto de la marca, para no
duplicar el anuncio del lector de pantalla.

## Regenerar

```bash
python3 generar-logo.py    # escribe zodk-logo-animado.svg en el directorio actual
```

Debe imprimir `rects: 1299 | bytes: 88657`. Si no coincide, el script está
modificado.
