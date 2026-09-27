# UAS: el visor de los drones

La enciclopedia de UAS de zodk.eu: una nota por dron en la bóveda
(`02 - Temas/La gran enciclopedia de los UAS./`) y, en la web, un **visor**
por dron. **«El visor»** es el nombre del recuadro completo (lo eligió el
usuario, 27-sep-2026): cabecera, maqueta, tira de siluetas, panel de partes y
fuentes. En el código, el componente `VisorUAS`.

El primero fue el MICH-2000 (rama `uas-project`; historia completa en
`logo-files/UAS-WIP.md`). Este documento es la receta para los siguientes.

## Qué tiene el visor

```
┌──────────────────────────────────────────────────────────────────────┐
│ [bandera] UCRANIA                  Maqueta creada a partir de fotos… │  cabecera
│ MICH-2000                                                 Three.js   │
│ Dron de ataque de largo alcance                           Claude Code│
├ - - - - - - - - - - - - - - - - - - - - - - - - ┬ - - - - - - - - - -┤
│  lienzo (cuadrícula de 24 px)                   │ PARTES  FUENTES 8   │
│   maqueta 3D o pixel, con las partes            │ [A] Canards         │
│   marcadas con letras [A] [B]…                  │ [B] Ala en delta…   │  panel
│   y el rótulo de la elegida                     │  …                  │
│                                                 │ ficha de la parte   │
├─────────────────────────────────────────────────┤ elegida             │
│ [Planta][Perfil][Frente][3D]  Maqueta|Pixel  Girar − + │             │  barra
└──────────────────────────────────────────────────────────────────────┘
```

- **Cabecera**: bandera en pixel art (`svgBandera`, la de /luna y /marte),
  país, nombre, subtítulo; a la derecha y a media altura, el crédito en tres
  líneas: «Maqueta creada a partir de fotos públicas. Hecho con» / icono de
  Three.js + Three.js / Clawd + Claude Code (iconos: Clawd de `STACK` en
  `src/consts.ts`, Three.js de simple-icons).
- **Lienzo**: la maqueta. Se gira arrastrando, se acerca con la rueda o
  pellizcando. Letras en casillas cuadradas sobre cada parte; las tapadas
  por el dron, apagadas. La parte elegida se pinta en blanco papel y sale un
  rótulo unido por una línea.
- **Barra**: la tira de siluetas (Planta, Perfil, Frente, 3D) son los
  botones de vista; se dibujan solas de la maqueta. Luego Maqueta | Pixel,
  Girar (giro automático, apagado al empezar), − y +.
- **Panel**, dos pestañas:
  - **Partes**: lista con letras; al elegir una, casilla rellena en tinta y
    nombre en negrita, y debajo su ficha: qué la respalda («Se ve en las
    fotos», «Reconstrucción», «Dato del fabricante»), texto, nota en cursiva
    (lo supuesto) y «Ver sus fuentes (n) →».
  - **Fuentes**: miniatura, medio, título, enlace al original y «Respalda:
    A · C». Con una parte elegida, se apagan las que no la respaldan.

## Medidas

| Qué | Valor |
|---|---|
| Ancho de la página de prueba | `max-w-[1040px]`, `px-5` |
| Borde y esquinas | 1 px, radio 4 px |
| Cabecera | relleno 1rem 1.25rem, raya discontinua abajo |
| Cuerpo | rejilla `1fr` + panel de 17rem |
| Alto del lienzo | 26rem; 22rem si el visor mide ≤ 720 px; 18rem si ≤ 480 px |
| Cuadrícula | 24 px |
| Casilla de letra | 1.25rem, radio 2 px, IBM Plex Mono 0.68rem |
| Silueta | 64x32 px (44x24 en estrecho) |
| Pixel | 2 px CSS por píxel de arte (`TAM_PIXEL` en `uas-pixelado.ts`) |
| Estrecho (≤ 720 px) | una columna: panel debajo, lista en dos columnas |

Tipografía: IBM Plex Mono en mayúsculas espaciadas (0.12em) para rótulos,
pestañas y siluetas; IBM Plex Sans para el resto (la de la web).

## Colores («tinta, sin color»)

Elegidos por el usuario el 27-sep-2026 entre cuatro opciones. Variables
`--visor-*` al principio del `<style>` de `VisorUAS.astro`.

| Variable | Día | Noche |
|---|---|---|
| Fondo de la tarjeta | `#ebebee` (página `#fafafa`) | `#25252a` (página `#18181b`) |
| Acento (lo elegido) | `#27272a` | `#e4e4e7` |
| Texto sobre acento | `#fafafa` | `#18181b` |
| Maqueta: relleno | `#454950` | `#2c2e33` |
| Maqueta: aristas | `#a3a9b1` | `#9aa0a8` |
| Parte elegida | `#f4f4f5` | `#f4f4f5` |

El dron va en **su color real** (el MICH, negro mate de fábrica). El único
color de la tarjeta es la bandera y las insignias reales del dron.

Paletas del modo Pixel (cuatro tonos por acabado) en `PALETAS` de
`visor-uas.ts`: negro, junta, mando (elevones), metal, amarillo, azul y
resalte; de noche el negro sube un poco y el contorno es un filo claro
(`#6b7079`) para que no se pierda en la tarjeta.

## Archivos

| Archivo | Qué es |
|---|---|
| `src/data/uas/tipos.ts` | Qué es una maqueta: piezas, acabados, partes, fuentes, país |
| `src/data/uas/<modelo>.ts` | La maqueta de un dron, **solo datos** |
| `src/scripts/uas-geometria.ts` | Vistas y mallas de cada tipo de pieza |
| `src/scripts/visor-uas.ts` | El motor (Three.js): escena, cámara, letras, vistas, modos |
| `src/scripts/uas-pixelado.ts` | El modo Pixel: materiales por escalones y pasada de contorno |
| `src/components/VisorUAS.astro` | El marco, generado en el build: `<VisorUAS modelo="mich-2000" />` |
| `public/uas/<modelo>/fuentes/` | Miniaturas de las fotos de referencia |
| `arte/uas-fuentes/<modelo>/` | Fotos a tamaño completo y `FUENTES.md` (fuera de Git) |

## Receta: un dron nuevo

1. **La nota en la bóveda**, en `02 - Temas/La gran enciclopedia de los
   UAS./`. (Pendiente: campos del frontmatter y la página `/uas`, pasos 4-6
   de `UAS-WIP.md`.)
2. **Fuentes.** Buscar fotos reales del dron montado: de perfil, desde
   arriba o abajo (la planta), de frente y de detalle (morro, cola, motor).
   Los mejores sitios son los medios que visitan la fábrica (para el MICH,
   Oboronka). Descartar dibujos o renders que no se parezcan (en el MICH,
   el de dronestrike.com). Guardarlas en `arte/uas-fuentes/<modelo>/` con un
   `FUENTES.md` (archivo, qué enseña, URL) y copiar la lista al WIP del
   proyecto, que sí va en Git.
3. **Leer la forma** de las fotos: planta, perfil, dónde van las piezas.
   Apuntar qué se ve y qué es supuesto. Casi nunca hay medidas publicadas:
   las proporciones van a ojo y el visor lo avisa.
4. **La maqueta** en `src/data/uas/<modelo>.ts` (copiar la del MICH):
   - Ejes: x hacia la punta del ala derecha, y arriba, z hacia el morro.
     Unidades libres; el MICH mide ~2,5 de envergadura.
   - Piezas: `tubo` (fuselaje, torno a lo largo de z), `ala` (con perfil,
     estaciones de raíz a punta), `placa` (canards, winglets, elevones),
     `varilla` (antenas, motor), `helice`, `disco` (insignias). `espejo`
     repite al otro lado.
   - `acabado` de cada pieza: negro (por defecto), junta, mando, metal,
     amarillo, azul. Colores nuevos: añadirlos a `Acabado`, a `PALETAS` y,
     si van en color en la maqueta, a `COLOR_MAQUETA`.
   - `pais`: chapa de 11x7 como las de `alunizajes.ts`.
   - `partes`: 5-8, en el orden de las letras. Cada una con su punto (`en`),
     las piezas que resalta, el respaldo, las fuentes (ids), el texto y la
     nota de lo supuesto.
   - `fuentes`: las fotos (con miniatura) y los artículos (sin ella).
5. **Miniaturas**: `sips -Z 560 -s format jpeg -s formatOptions 72
   <foto> --out public/uas/<modelo>/fuentes/<foto>.jpg` (~50 KB cada una).
6. **Probar** en `npm run dev`, con la página de prueba o poniendo
   `<VisorUAS modelo="…" />` donde toque. Atajos en la URL:
   `?vista=arriba|lado|frente|detras`, `?parte=C`, `?pestana=fuentes`,
   `?estilo=pixel`. Comparar las siluetas con las fotos, sobre todo planta
   y perfil. `npm run lint` y `npx astro check`.
7. **Capturas** para el usuario (día y noche; ver abajo) antes de dar nada
   por bueno, y **consumo en Zen** si cambia el motor (`docs/rendimiento.md`).

### Capturas sin ventana

Chrome sin ventana contra `npm run dev` (siempre `localhost:4321`):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --use-angle=metal --ignore-gpu-blocklist --hide-scrollbars \
  --window-size=1200,900 --virtual-time-budget=5000 \
  --screenshot=captura.png --user-data-dir=/tmp/chrome-captura \
  "http://localhost:4321/uas/prueba?parte=B"
```

Chrome no termina solo: esperar a que exista el PNG y cerrarlo. La noche va
en `sessionStorage`; para capturarla, un HTML temporal en `public/` que haga
`sessionStorage.setItem("theme","dark")` y redirija a la página (y borrarlo
después).

## Lo que el usuario quiere (y lo que rechazó)

- **Diseño propio.** El primer marco calcaba el de drone-warfare.com y lo
  rechazó: «me gusta la idea, pero no que le copiemos todo». Tomar la idea
  de otras webs, nunca su diseño.
- **Sin acento de color**: rechazó el verde azulado (`#2f8f8a`, «muy IA»);
  también se descartaron el azul del blog, el naranja y el rojo de sello.
  Fuera el sello rojo y el código de ficha («UAS-UA-001»).
- **El dron en su color real**, no en tinta ni en otro ejemplar.
- **Pixel art con detalle y giro libre.** Una tira de 39 dibujos fijos fue
  rechazada («hay que detallarlo más», «no me deja girarlo libremente»). Se
  pinta en directo a 2 px con tramado.
- **Solo detalles que se vean en las fuentes.** Preguntó si la escarapela
  salía en las fotos (sí) y si las juntas eran reales (sí, pero su sitio es
  a ojo, y así se dice). Los detalles, discretos: las juntas marcadas le
  parecieron exageradas («son mucho más suaves»).
- **Decir siempre de qué foto sale cada cosa** (respaldo y fuentes de cada
  parte) y avisar de lo supuesto.
- **Consumo**: al girar sube algo en Zen. Se limitó a 60 fps, las letras
  tapadas se miran cada 200 ms y el rótulo se mide al cambiar de texto;
  falta medirlo en vatios.
