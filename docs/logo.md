# Logo zodk.eu

Planeta Tierra en pixel art girando sobre su eje con un dron de observación
sobrevolándolo. Sin dependencias, sin peticiones externas, sin JavaScript.
Es el logo de la **cabecera**: no confundirlo con el planeta del hero, que es
otra cosa y va en un canvas (ver `HERO-WIP.md`).

## Qué hay aquí y qué sirve la web

| Archivo (aquí) | En la web | Para qué |
|---|---|---|
| `generar-logo.py` | — | Regenera el SVG animado. Solo librería estándar |
| `ANIMACION.md` | — | Cómo funciona la animación y qué tocar |
| `zodk-favicon.svg` | `public/zodk-favicon-v2.svg` | Favicon vectorial (solo el globo) |
| `favicon-16.png` `favicon-32.png` | `public/favicon-16-v2.png` `favicon-32-v2.png` | Fallback para navegadores viejos |
| `favicon.ico` | `public/favicon-v2.ico` (y `public/favicon.ico`) | El `.ico` de siempre; el de la raíz lo piden solos algunos navegadores |
| `apple-touch-icon.png` | `public/apple-touch-icon-v2.png` (y el de la raíz) | iOS. Fondo opaco: Apple no respeta la transparencia |
| — | `public/zodk-logo-animado.svg` | El logo de la cabecera, modo claro |
| — | `public/zodk-logo-nocturno.svg` | El mismo, modo oscuro |
| — | `public/og-image.png` | Open Graph y Twitter Card (1200×630) |

El sufijo **`-v2`** es cache-busting: los navegadores cachean el favicon por
URL de forma muy agresiva y no lo sueltan ni borrando datos, así que al cambiar
el icono se sube el número en vez de pisar el archivo. Si se vuelve a cambiar:
`-v3`, y actualizar `src/components/Head.astro`.

## Etiquetas del `<head>` (las que hay hoy)

```html
<link rel="icon" href="/favicon-v2.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32-v2.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16-v2.png">
<link rel="icon" type="image/svg+xml" href="/zodk-favicon-v2.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-v2.png">
```

La imagen de Open Graph la pone `Head.astro` por su cuenta: `/og-image.png`, o
la que traiga la página.

## Cómo se incrusta el logo

**No** se incrusta en línea: va como imagen de fondo en CSS, para que el
navegador se baje solo el SVG del tema activo (el de día pesa 89 KB y el de
noche 154 KB; con dos `<img>` se bajarían los dos en cada página).

```css
/* src/styles/global.css */
.logo-home {
  width: 78px; height: 100px;
  background: url(/zodk-logo-animado.svg) center / contain no-repeat;
  image-rendering: pixelated;
}
html.dark .logo-home { background-image: url(/zodk-logo-nocturno.svg); }
```

**Escala por múltiplos enteros** de 26×33,5 — 52×67, 78×100, 104×134 — para que
los píxeles queden cuadrados. Cualquier otro valor los deja borrosos aunque
pongas `image-rendering: pixelated`.

## Altura mínima

El dron recorre 105 px de los 335 del `viewBox`, así que el logo necesita su
alto completo o se sale de plano. Hubo una versión estática para franjas bajas
(`zodk-logo-estatico.svg`) que nunca se usó y ya no está en el repo; si hiciera
falta, sale de `generar-logo.py` con el dron quieto.

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
