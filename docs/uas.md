# UAS: la enciclopedia de drones y su visor

La enciclopedia de UAS de zodk.eu: una nota por dron en la bóveda
(`02 - Temas/La gran enciclopedia de los UAS./`), que en la web es una
**ficha** en `/uas/<slug>`, listada en el índice `/uas` con filtro por país.
Las fichas con maqueta llevan un **visor**. **«El visor»** es el nombre del recuadro completo (lo eligió el
usuario, 27-sep-2026): cabecera, maqueta, tira de siluetas, panel de partes y
fuentes. En el código, el componente `VisorUAS`.

El primero fue el MICH-2000 (rama `uas-project`; historia completa en
`logo-files/UAS-WIP.md`). Este documento es la receta para los siguientes.

## Pedir una ficha nueva

El usuario pide «hazme la ficha del <dron>». **Lo que da él**: el nombre y,
si los tiene, tuits o enlaces (para «En acción» y las fuentes). **Lo que se
hace**, en este orden, enseñándole el resultado en cada paso:

1. Buscar fuentes y fotos (receta, paso 2) y leer la forma (paso 3).
2. Escribir la nota en la bóveda desde `00 - Meta/Plantilla UAS
   (Templater).md` (paso 1), con `publicar: false`. Que la revise.
3. Hacer la maqueta y las miniaturas (pasos 4 y 5), probar y enseñar
   capturas (pasos 6 y 7). Iterar con él la forma.
4. Publicar: `publicar: true`, `npm run importar`, revisar `/uas/<slug>` en
   local y, en `main`, commit y push cuando lo pida. (Mientras el proyecto
   viva en una rama, ver «Las fichas en la web».)

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
| Ancho del visor en la ficha | `min(1040px, 100vw − 2.5rem)`, centrado sobre el texto de 720 px |
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
| `src/pages/uas/index.astro` | El índice `/uas`, con filtro por país |
| `src/pages/uas/[...slug].astro` | La ficha `/uas/<slug>`, con el visor en su hueco |
| `scripts/importar-notas.mjs` | Lleva las notas de la carpeta a `src/content/uas/` (`clasificar`, `paisDeFicha`, `colocarVisor`) |
| `00 - Meta/Plantilla UAS (Templater).md` (bóveda) | Esqueleto de la nota de un dron |

## Receta: un dron nuevo

1. **La nota en la bóveda**, en `02 - Temas/La gran enciclopedia de los
   UAS./`, desde la plantilla `00 - Meta/Plantilla UAS (Templater).md`. El
   nombre del archivo lleva delante la bandera (`🇺🇦 MICH-2000.md`); el
   `titulo` da la dirección (`MICH 2000` → `/uas/mich-2000`) y tiene que
   coincidir con el nombre de la maqueta. Frontmatter de siempre (sin claves
   propias: lo decidió el usuario) y este cuerpo, pedido por él (modelo: la
   del MICH-2000):
   una cita con `>` justo bajo las propiedades, sin título (un párrafo: qué
   es, quién lo usa, dónde ha destacado, con un enlace a la foto, noticia o
   tuit de cada hecho; en la web sale bajo las etiquetas), `## Visor` (vacío
   en la bóveda: ahí va el visor en la web), `## CARACTERÍSTICAS` (tabla de
   dos columnas: País, Fabricante, Operador, Categoría, Situación, Primer uso
   en combate, Envergadura / longitud / peso, Alcance, Carga, Motor, Origen),
   `## Historia` (dos párrafos y uno corto de su uso reciente), `## En
   acción` (tuits del dron en uso) y `## Fuentes` (`- Web ([fuente](url))` y
   debajo de qué habla, con el nombre en negrita y una línea en blanco
   entre fuentes). Sin reglas `---` entre apartados. Lo que venga solo
   del fabricante se dice. Castellano llano, sin calcos del inglés. La fila
   «País» de la tabla, con su bandera delante (`🇺🇦 Ucrania`), es la que usa
   el filtro de `/uas`.
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
     estaciones de raíz a punta), `placa` (canards, winglets, elevones,
     brazos y patas planos; con `simetrica` y `bisel`, cuerpos vistos desde
     arriba con los bordes redondeados, como el del X10D), `varilla`
     (antenas, motores, barras), `caja` (sensores; `redondeo` para las
     esquinas),
     `helice` (con `eje: "y"`, horizontal, para multirrotores), `disco`
     (insignias, objetivos, cámaras). `espejo` repite al otro lado.
   - Escala: la que convenga (el MICH, ~2,5 de envergadura; el X10D, 1
     unidad ≈ 25 cm). El visor encuadra solo. Si hay medidas oficiales,
     úsalas (el X10D sale de las de Skydio).
   - `acabado` de cada pieza: negro (por defecto), gris, junta, mando,
     metal, lente, amarillo, azul. Colores nuevos: añadirlos a `Acabado`, a
     `PALETAS` y, si van en color en la maqueta, a `COLOR_MAQUETA`. El dron
     va en su color real (MICH, negro; X10D, gris claro).
   - `resalte: "tinta"` en drones claros (la parte elegida sale oscura; en
     blanco no se distingue). Por defecto, blanco papel.
   - `pais`: chapa de 11x7 como las de `alunizajes.ts`.
   - `partes`: 5-8, en el orden de las letras. Cada una con su punto (`en`),
     las piezas que resalta, el respaldo, las fuentes (ids), el texto y la
     nota de lo supuesto.
   - `fuentes`: las fotos (con miniatura) y los artículos (sin ella).
   - Modelos a copiar: `mich-2000.ts` (ala volante) y `skydio-x10d.ts`
     (cuadricóptero).
   - Evitar cajas y cilindros sueltos para el cuerpo: el usuario los ve
     «demasiado cuadrados» (primera versión del X10D). Mejor sacar la
     silueta desde arriba de las fotos y hacerla `placa` simétrica con
     bisel, en uno o dos pisos.
5. **Miniaturas**: `sips -Z 560 -s format jpeg -s formatOptions 72
   <foto> --out public/uas/<modelo>/fuentes/<foto>.jpg` (~50 KB cada una).
6. **Probar** en `npm run dev`, en la ficha (`/uas/<slug>`, con la nota
   importada) o poniendo `<VisorUAS modelo="…" />` en una página suelta. Atajos en la URL:
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
  "http://localhost:4321/uas/mich-2000?parte=B"
```

Chrome no termina solo: esperar a que exista el PNG y cerrarlo. La noche va
en `sessionStorage`; para capturarla, un HTML temporal en `public/` que haga
`sessionStorage.setItem("theme","dark")` y redirija a la página (y borrarlo
después).

## Las fichas en la web

Toda nota de la carpeta de la enciclopedia es una ficha de la colección
`uas` (`src/content/uas/`), en `/uas/<slug>`; no sale en `/notas` ni en el
blog, y su «Volver» lleva a `/uas`. El importador la reconoce por la
carpeta y saca el país de la fila «País» de la tabla (`pais` y `bandera` en
el frontmatter importado, que usa el filtro de `/uas`).

Si existe `src/data/uas/<slug>.ts`, el importador (`colocarVisor`) cambia la
sección `## Visor` (título incluido: en la web no sale) por un hueco
(`<div class="visor-hueco">`) y la
ficha pinta el visor y lo mueve a ese hueco, más ancho que el texto (hasta
1040 px, centrado) y sin los estilos del texto (`not-prose`). Si no hay
maqueta, la sección «Visor» no sale y el índice no le pone la marca
«Visor».

En las fichas, la línea sangrada bajo un punto de lista (la descripción de
cada fuente) sale debajo, como en Obsidian (`saltosEnListas`).

Los `==resaltados==` de Obsidian se convierten a `<mark>` (rotulador
amarillo, texto oscuro); la del MICH fue la primera nota publicada que los
usaba.

Tras `npm run importar`, el servidor de desarrollo no ve las notas nuevas
hasta reiniciarlo (el importador borra y regenera `src/content/`).

Mientras el proyecto está en una rama, la nota se prueba con `publicar:
true` solo en local y luego se deja en `false` y se borra lo importado: las
notas de la bóveda se publican siempre desde `main`.

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
