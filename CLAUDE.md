# zodk-web — notas para Claude Code

Blog personal de Hegoi en Astro, publicado en **zodk.eu** (GitHub Pages).
Se trabaja desde un Mac (`~/Documents/zodk-web`) y un PC con Linux Mint en
español (`~/Documentos/zodk-web`); se sincroniza solo por Git: `git pull` al
empezar, `git push` al terminar.

## Cómo trabajar con el usuario

- Todo en español, explicado en llano.
- **Git a mano y por pasos.** `commit` y `push` son órdenes separadas: no
  hacer push si no lo pide ("commit push" = las dos). Le gusta ver
  `git status` / `git diff` antes de commitear. **Solo el push a `main`
  publica la web.** Ramas, merges, rebases: explicarlos antes (qué hacen,
  por qué, cómo se vuelve atrás) con los comandos exactos.
- En el código de la web confía en el criterio de Claude para el CÓMO (no
  quiere menús de disyuntivas técnicas), pero **no ampliar el alcance**: no
  "mejorar" de paso cosas que no ha pedido. Si algo existente parece necesitar
  cambio, avisar y preguntar.
- **Los assets que entrega se usan tal cual** (PNG, SVG de Excalidraw…): nada
  de limpiar, recortar, escalar ni quitar fondos si no lo pide.
- Pixel art del hero = lo más importante de la portada. Quiere **renders o
  capturas reales** antes de decidir, e iterar en pasos cortos.
- Vocabulario: "subrayar" un texto = resaltado tipo marcador (fondo detrás,
  texto oscuro), no una línea.

## El planeta de la portada

**Antes de tocarlo, leer `logo-files/HERO-WIP.md`** (punto 7 y "Modo noche"):
cómo funciona, qué se probó y descartó, y por qué.

Estado (13-sep-2026): publicado en `main` (merge de la rama
`planeta-pixelart-v2`, que se deja en GitHub como registro). Planeta de día en
`<canvas>` con giro continuo (`src/scripts/planeta.js`, 90 s por vuelta), datos
en `public/planeta/` generados por `logo-files/generar-planeta-hero.py`.

- Regenerar: `cd logo-files && python3 generar-planeta-hero.py`; después subir
  `PLANETA_V` en `planeta.js` y el `?v=` de `planeta-quieto.png` en
  `src/styles/global.css` (van por 7). Un fotograma suelto para comparar:
  `python3 generar-planeta-hero.py --frame N salida.png` (lon. central = −6·N°).
- Ver la web: `npm run dev`; en el móvil (misma wifi): `npm run dev:network`.

Decisiones que hay que respetar:
- Vista de horizonte inclinada, hemisferio norte; solo costas (sin fronteras),
  con la línea de costa oscura; giro calmado.
- **Modo noche**: se está rehaciendo desde cero en la rama `planeta-noche`
  (mismo pipeline que el día; ver `HERO-WIP.md`, "Modo noche v2"). Lo
  nocturno anterior es trabajo viejo, no decisiones cerradas.
- Luz del terminador y del limbo en escalones lisos de 1/3 (`LIGHT_SUB`).
- Rechazado, no reintentar salvo que lo pida: punteado Bayer, bordes de luz
  ondulados por ruido, franja de atardecer, brillo especular en el mar, nubes
  de ruido fBm, fundido entre fotogramas, transiciones a racimos de 1 px;
  en el título: rótulo pixel art, título en el cielo, cartela de expediente,
  sombra gruesa, negrita.
- Nubes: las 8 plantillas pixel art de siempre, a escala 1,0-1,3; más grandes
  no quedan bien. "Más adelante le meteremos más mano."
- Biomas por latitud + cajas `DESIERTOS` / `SABANAS`: si una zona sale con el
  bioma equivocado, se corrige con una caja.
- Animaciones: nunca SVG animado con miles de formas (calienta la CPU en Zen,
  su navegador); canvas o sprite PNG.

Pendiente (sin orden, lo decide él):
- Comprobar en un móvil real que en táctil no sale la coordenada MGRS.
- Modo noche: en la rama `planeta-noche` (casi terminado; falta que el usuario
  mire la temperatura en Zen y el móvil, y el merge).
- Hemisferio sur (cómo llegar a sus países en el hero): aparcado para más
  adelante, de día y de noche.
- Ficha de bandera que se sale por abajo si la chapa está muy baja.
- Ideas aparcadas: chapas que se "planten" al pasar por el centro, 120 s por
  vuelta, borde de atmósfera (propuesto, no pedido), E-2 de perfil.
