# Planeta del hero — estado

Portada de zodk.eu: la Tierra en pixel art a pantalla completa, hemisferio
norte, Polo Norte arriba, girando, con un dron sobrevolándola. Encuadre de
"horizonte" inclinado (no cenital). **Cambia de día a noche con el botón de
tema**, igual que el logo. Sin texto de marca.

## Cómo funciona

El planeta es un **sprite PNG** de 28 fotogramas en horizontal (1 px = 1 celda).
La web lo anima moviendo `background-position` a saltos (`steps(28)`, vuelta en
60 s): un recorte de bitmap, barato en cualquier navegador. Se probó un SVG
vectorial animado y calentaba la CPU en Firefox/Zen (ver más abajo).

- Modo claro → `public/zodk-planeta-sprite.png` (Tierra de día, sol, terminador
  suave, ciudades como puntos oscuros — de día no se encienden) + `zodk-dron.svg`.
- Modo oscuro → `public/zodk-planeta-noche.png` (Tierra a oscuras, luces por
  densidad de población + focos de grandes ciudades + luces sueltas de islas) +
  `zodk-dron-noche.svg` (con luces de posición: amarilla en el morro, verde ala
  derecha/arriba, roja ala izquierda/abajo). Solo se descarga en modo oscuro.

El sombreado (terminador, oscurecimiento del borde, atmósfera) va **horneado en
el sprite**, no como capa CSS. Una sola capa animada.

## Pipeline (`logo-files/`)

| Archivo | Qué |
|---|---|
| `rasterizar.py` | `ne_50m_land.geojson` (gitignored) → `mapa_tierra.py`. Costas + hielo (Groenlandia >67N, casquete >82N) + estrecho de Gibraltar. Solo re-ejecutar si cambian resolución/umbrales. |
| `densidad_luces.py` | `ne_10m_populated_places` (gitignored, `pp10.json`) → `luces.py`. Campo de densidad 0-3 para las luces de noche. Umbrales por percentil: `T1/T2/T3 = pct(0.82/0.93/0.982)`. Subirlos = menos luces. |
| `mapa_tierra.py`, `luces.py` | Salidas de los dos anteriores. Es lo que consume el generador. |
| `png8.py` | Escritor mínimo de PNG indexado. |
| `generar-planeta-hero.py` | Todo junto → los 2 sprites + los 2 drones. Parámetros arriba del archivo (`FRAMES`, geometría, sol, `CIUDADES`, `LUCES_SUELTAS`). |
| `generar-estrellas.py` | Baldosa `public/zodk-estrellas.png` para el campo de estrellas del fondo (la web la repite con `background-repeat` en vez de apilar gradientes en el CSS). |

Flujo de iteración:
```
cd ~/Documents/zodk-web/logo-files
python3 densidad_luces.py          # solo si tocas umbrales de luces
python3 generar-planeta-hero.py
python3 generar-estrellas.py       # solo si tocas las estrellas
cp zodk-planeta-sprite.png zodk-planeta-noche.png zodk-dron.svg zodk-dron-noche.svg zodk-estrellas.png ../public/
cd .. && npm run dev
```
Los .geojson se re-descargan con los `curl` documentados en cada script.

## Integración en la web

- `src/layouts/PageLayout.astro` — prop `hero?: boolean`; pinta `<slot name="hero" />`
  a sangre y pone `class="home at-top"` en `<html>`.
- `src/pages/index.astro` — `<section slot="hero">` con estrellas, sparkle,
  `.hero-planet` (div), `.hero-dron` (div), flecha de scroll. Sin texto. Debajo,
  `<div id="hero-sentinel">` marca el límite hero/contenido.
- `src/components/Head.astro` — `initHeader()`: la cabecera de la portada tiene 3
  estados según clases en `<html>`:
  1. `at-top` (sin `scrolled`): nav mínima "notas / eventos / tema", sin logo.
  2. sin nada: al bajar por el hero la cabecera se esconde arriba.
  3. `scrolled`: cabecera sólida con logo, al llegar al contenido del blog.
  Un IntersectionObserver sobre `#hero-sentinel` conmuta `scrolled` (línea de
  activación en `rootMargin: "0px 0px -52% 0px"`, simétrica al subir). El resto
  de páginas, sin centinela, usan el `onScroll()` de siempre.
- `src/styles/global.css` — bloque "Portada: el hero del planeta" + reglas
  `html.home` de la cabecera. `html.dark` cambia los sprites a la versión de
  noche; `.hero-stars::after` añade más estrellas solo en oscuro.

## Por qué sprite PNG y no SVG animado

Un SVG vectorial con miles de `<rect>` girando (o fotogramas apilados con
opacidad) le disparaba la temperatura del portátil al usuario en Zen (navegador
basado en Firefox), aunque en Chrome iba fino. Rasterizar a sprite PNG y mover
`background-position` lo resolvió. **No volver a intentar animar el SVG.**

### Idea descartada: "idea A" (sept 2026)

Separar un **sprite de continentes planos** (pocos colores, comprime mucho) que
rota + **sombreado/terminador/atmósfera como gradiente CSS estático** encima +
**fundido cruzado** entre fotogramas (dos capas `.hp-a`/`.hp-b`) para suavizar el
giro. El fundido se veía a trompicones (aun con los `@keyframes` sincronizados
generados) y al usuario no le convenció el conjunto. Se volvió atrás al sprite
con sombreado horneado. Si se retoma la fluidez: subir `FRAMES` y ya, o
plantear otra cosa, pero el fundido de dos capas queda aparcado.

## Pendiente

1. ~~Móvil~~ — hecho (commit `7de9a13`); verificado en un teléfono real.
2. **Caché en producción** — los PNG se llaman siempre igual. Ya van por el
   segundo cambio con el mismo nombre (28 fotogramas, luces adelgazadas), así que
   quien tenga la versión vieja en caché tarda en ver la nueva. Antes del
   **próximo** cambio del planeta: ponerles versión al nombre (`?v=`) o moverlos
   a `src/assets/` para que Astro les meta hash de contenido.
3. **Afinar** — `MAPRES` 4→3, tono desierto para el Sáhara, pulir el hielo del
   polo, tamaño de las luces sueltas, nº de luces de noche… pendiente de ir
   puliendo con el usuario.
4. **Aparcado** — aurora boreal en el modo noche.
5. Al terminar del todo, borrar este archivo.
