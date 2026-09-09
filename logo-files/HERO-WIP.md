# Planeta del hero — estado

Portada de zodk.eu: la Tierra en pixel art a pantalla completa, hemisferio
norte, Polo Norte arriba, girando, con un dron sobrevolándola. **Cambia de día
a noche con el botón de tema**, igual que el logo. Sin texto de marca.

## Cómo funciona

El planeta es un **sprite PNG** de 28 fotogramas en horizontal (1 px = 1 celda).
La web lo anima moviendo `background-position` a saltos (`steps()`): un recorte
de bitmap, barato en cualquier navegador. Se probó un SVG vectorial animado y
calentaba la CPU en Firefox/Zen.

- Modo claro → `public/zodk-planeta-sprite.png` (Tierra de día, sol, terminador
  suave, ciudades como puntos oscuros que se encienden al pasar a la sombra) +
  `zodk-dron.svg`.
- Modo oscuro → `public/zodk-planeta-noche.png` (Tierra a oscuras, luces por
  densidad de población + focos de grandes ciudades + luces sueltas de islas) +
  `zodk-dron-noche.svg` (con luces de posición). Solo se descarga en modo oscuro.

## Pipeline (`logo-files/`)

| Archivo | Qué |
|---|---|
| `rasterizar.py` | `ne_50m_land.geojson` (gitignored) → `mapa_tierra.py`. Costas + hielo (Groenlandia >67N, casquete >82N) + estrecho de Gibraltar. Solo re-ejecutar si cambian resolución/umbrales. |
| `densidad_luces.py` | `ne_10m_populated_places` (gitignored, `pp10.json`) → `luces.py`. Campo de densidad 0-3 para las luces de noche. |
| `mapa_tierra.py`, `luces.py` | Salidas de los dos anteriores. Es lo que consume el generador. |
| `png8.py` | Escritor mínimo de PNG indexado. |
| `generar-planeta-hero.py` | Todo junto → los 2 sprites + los 2 drones. Parámetros arriba del archivo (geometría, sol, `CIUDADES`, `LUCES_SUELTAS`). |

Flujo de iteración:
```
cd ~/Documents/zodk-web/logo-files
python3 generar-planeta-hero.py
cp zodk-planeta-sprite.png zodk-planeta-noche.png zodk-dron.svg zodk-dron-noche.svg ../public/
cd .. && npm run dev
```
Los .geojson se re-descargan con los `curl` documentados en cada script.

## Integración en la web

- `src/layouts/PageLayout.astro` — prop `hero?: boolean`; pinta `<slot name="hero" />`
  a sangre y pone `class="home"` en `<html>`.
- `src/pages/index.astro` — `<section slot="hero">` con estrellas, sparkle,
  `.hero-planet` (div), `.hero-dron` (div), flecha de scroll. Sin texto.
- `src/styles/global.css` — bloque "Portada: el hero del planeta". `html.dark`
  cambia los sprites a la versión de noche; `.hero-stars::after` añade más
  estrellas solo en oscuro.

## Pendiente

1. ~~Móvil~~ — hecho (commit 7de9a13); verificado en un teléfono real.
2. **Caché en producción** — los PNG se llaman siempre igual; al desplegar una
   versión nueva, los visitantes con la vieja en caché no la ven. En el primer
   despliegue da igual (no hay caché previa); antes del **segundo** cambio del
   planeta, ponerles versión al nombre (`?v=`) o moverlos a `src/assets/` para
   que Astro les meta hash de contenido.
3. **Afinar** — nº de luces de noche, tono desierto para el Sáhara, tamaño de
   las luces sueltas… pendiente de ir puliendo con el usuario.
4. Al terminar del todo, borrar este archivo.
