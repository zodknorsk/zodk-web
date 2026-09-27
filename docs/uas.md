# UAS: el hangar de drones, las fichas y el visor

La enciclopedia de UAS de zodk.eu («la gran enciclopedia de los UAS»; en la
web, **«Hangar de UAS»**): una nota por dron en la bóveda
(`02 - Temas/La gran enciclopedia de los UAS./`), que en la web es una
**ficha** en `/uas/<slug>`, listada en el índice `/uas` y con acceso desde la
tira «Hangar de UAS» de la portada. Las fichas con maqueta llevan un
**visor**: **«el visor»** es el nombre del recuadro completo (lo eligió el
usuario): cabecera, maqueta, tira de siluetas, panel de partes y fuentes. En
el código, el componente `VisorUAS`.

Drones hechos: MICH-2000 (ala volante, Ucrania) y Skydio X10D (cuadricóptero,
EE. UU., del Ejército de Tierra). La historia del proyecto, sesión a sesión y
con lo que el usuario rechazó, está en `logo-files/UAS-WIP.md`. **Este
documento es la receta**: con él se tiene que poder hacer un dron nuevo desde
cero, sin más contexto.

## Pedir una ficha nueva: el guion completo

El usuario pide «hazme la ficha del <dron>» (a veces con tuits o enlaces).
Hay que entregar: **la nota en Obsidian, la maqueta con su visor y su pixel
art, las miniaturas y las fotos de fuentes**, probado en local, con capturas
y, cuando lo diga, commit (y push si lo pide: `commit` y `push` son órdenes
separadas).

0. **Antes de empezar.** `git status` y rama en `~/Documents/zodk-web`.
   Mientras el proyecto no esté fusionado, todo va en la rama
   `uas-project`; si ya se fusionó, en `main` (el push a `main` publica
   zodk.eu: nunca sin que lo pida). En esta rama el usuario decidió que **sí
   van las notas importadas** de la enciclopedia (`src/content/uas/`).
   `npm run dev` en marcha (`localhost:4321`).
1. **Fuentes** (receta, paso 2): artículos (Infodefensa, medios que visitan
   la fábrica, la documentación del fabricante —Skydio tiene la suya—, Army
   Technology, drone-warfare.com si tiene ficha) y **fotos del dron real**:
   de perfil, desde arriba (la planta), de frente, en uso. Tuits del dron en
   acción para «En acción» (buscar `"x.com" <dron>`).
2. **La nota** (receta, paso 1), con `publicar: true`, en la bóveda.
3. **La maqueta** (receta, pasos 3 y 4) y sus **miniaturas de fuentes**
   (paso 5).
4. **Importar y generar**: `npm run importar`, `node arte/generar-uas-miniaturas.mjs <modelo>`
   y **reiniciar `npm run dev`** (no ve las notas nuevas; si el visor no
   carga con «Outdated Optimize Dep» en la consola, parar, `rm -rf
   node_modules/.vite` y arrancar de nuevo).
5. **Comprobar y enseñar** (receta, pasos 6 a 8): la ficha, el visor en todas
   las vistas y en pixel, de día y de noche; la tarjeta de `/uas`; la tira de
   la portada. `npm run lint` y `npx astro check` sin errores nuevos.
6. **Documentar**: `logo-files/UAS-WIP.md` (qué se hizo, fotos con sus
   enlaces) y, si se añadió algo al visor (piezas, acabados), este documento.
7. **Commit** en zodk-web cuando lo pida, y en la bóveda (`~/Documents/boveda-osint`)
   la nota nueva.

Cómo trabajar con el usuario en esto (lo ha dejado claro varias veces):
- Enseñar **capturas en cada paso** (`arte/capturas.mjs`, abajo) y dejarle
  mirar en local. Iterar en pasos cortos.
- Si algo nuevo es **visual y admite varias lecturas** (un dibujo, una vista),
  **preguntar antes de dibujar** o proponer un boceto. Cuando dice
  «cúrratelo», quiere **varias opciones** (colores, formas, animaciones) con
  un selector temporal en la página para comparar.
- No calcar el diseño de otras webs; tomar la idea.
- Escribir como una persona (ver «La nota»), nunca con calcos del inglés.

## Receta

### 1. La nota en la bóveda

En `02 - Temas/La gran enciclopedia de los UAS./`, desde la plantilla
`00 - Meta/Plantilla UAS (Templater).md` (modelos: las notas del MICH-2000 y
del X10D).
- **Archivo**: la bandera y el nombre (`🇺🇸 Skydio X10D.md`). El `titulo` da
  la dirección (`Skydio X10D` → `/uas/skydio-x10d`) y **tiene que coincidir
  con el nombre del archivo de la maqueta** (`src/data/uas/skydio-x10d.ts`).
- **Frontmatter**: el de siempre (sin claves propias: lo decidió el usuario;
  «las plantillas de Obsidian tienen todas el mismo formato»). `tipo:
  objeto`, `estado: borrador`, `publicar: true`, `tags` con el país y `dron`.
- **Cuerpo** (pedido por el usuario), sin reglas `---` entre apartados:
  - Una **cita con `>`** justo bajo las propiedades, sin título: un párrafo
    con qué es, quién lo usa y dónde ha destacado. **Cada hecho con su
    enlace** a la foto, la noticia o el tuit. `==resaltado==` para lo clave.
    Si las cifras son del fabricante, un aviso ⚠️ en un párrafo aparte.
  - `## Visor` con `*Aquí se inserta el visor creado para el blog*` (en la
    web se cambia por el visor; el título no sale).
  - `## CARACTERÍSTICAS`: tabla de dos columnas con **País** (con la
    bandera delante: `🇺🇦 Ucrania`; es el país del **fabricante**, y lo usa
    el filtro de `/uas`), Fabricante, Operador, **Categoría** (sale en las
    tarjetas, hasta la primera coma), Situación, Primer uso en combate,
    Envergadura / longitud / peso, Alcance, Carga, Motor, Origen (`[[…]]`).
    Lo que no se sepa, «No publicado»; lo del fabricante, «(fabricante)».
  - `## Historia`: dos párrafos y uno corto de su uso reciente, con enlaces.
  - `## En acción`: tuits embebidos (`![](https://x.com/…/status/…)`).
  - `## Fuentes`: `- **Nombre de la web** ([fuente](url))`, debajo una línea
    sangrada con de qué habla, y una línea en blanco entre fuentes.
- **Cómo se escribe**: castellano llano, como lo contaría una persona. Nada
  de «el tipo», «la plataforma», «capacidades» ni frases de resumen. Nombrar
  los hechos (qué se atacó, cuándo) en vez de resumirlos. Decir siempre lo
  que solo afirma el fabricante.

### 2. Fuentes y fotos

Fotos reales del dron montado: de perfil, desde arriba o abajo, de frente y
de detalle. Buenas fuentes: la web del fabricante (el X10D salió de las de
skydio.com y de su ficha técnica), los medios que visitan la fábrica (el MICH,
de Oboronka), fotos de ejércitos. Descartar dibujos o renders que no se
parezcan. Guardar en `arte/uas-fuentes/<modelo>/` (fuera de Git) con un
`FUENTES.md` (archivo, qué enseña, URL) y copiar la lista a `UAS-WIP.md`.
Para elegir entre muchas, una hoja de contactos con ffmpeg (`tile=9x9`).

### 3. Leer la forma

De las fotos: planta, perfil, dónde van las piezas, **el color real** (el
MICH es negro mate; el X10D, gris claro, también en la foto del Ejército de
Tierra). Si hay medidas oficiales, usarlas (el X10D: 79 x 65 x 14,5 cm
desplegado). Apuntar qué se ve y qué es supuesto.

### 4. La maqueta: `src/data/uas/<modelo>.ts`

Solo datos (tipos en `src/data/uas/tipos.ts`). Copiar `mich-2000.ts` (ala
volante) o `skydio-x10d.ts` (cuadricóptero). Imports de valor con extensión
`.ts` (`import { PAISES_LUNA } from "../alunizajes.ts"`), porque los
generadores de `arte/` leen estos archivos con Node.
- **Ejes**: x hacia la punta del ala derecha, y arriba, z hacia el morro.
  Unidades libres; `escala` = metros por unidad (MICH 1, X10D 0,25): con
  ella los drones salen a escala real entre sí en la tira de la portada.
- **Piezas** (`uas-geometria.ts`): `tubo` (fuselaje, torno a lo largo de z),
  `ala` (perfil NACA, estaciones de raíz a punta), `placa` (canards,
  winglets, elevones, brazos y patas planos; con `simetrica` y `bisel`,
  cuerpos vistos desde arriba con los bordes redondeados), `varilla`
  (antenas, motores, barras), `caja` (sensores; `redondeo`), `helice`
  (`eje: "y"` para multirrotores; `palas`), `disco` (insignias, objetivos,
  cámaras). `espejo` repite al otro lado.
- **No hacer el cuerpo con cajas y cilindros sueltos**: al usuario le
  parecieron «demasiado cuadrados» (primera versión del X10D). Sacar la
  silueta desde arriba de las fotos y hacerla `placa` simétrica con bisel,
  en uno o dos pisos.
- **Detalles solo si se ven en las fuentes** (escarapela, juntas…), y
  discretos: las juntas marcadas le parecieron exageradas.
- **`acabado`** de cada pieza: negro (por defecto), gris, junta, mando,
  metal, lente, amarillo, azul. Colores nuevos: añadirlos a `Acabado`
  (`tipos.ts`), a `PALETAS` (`uas-paletas.ts`) y, si van en color en la
  maqueta, a `COLOR_MAQUETA` (`visor-uas.ts`).
- **`resalte: "tinta"`** en drones claros (la parte elegida sale oscura; en
  blanco no se distingue). Por defecto, blanco papel.
- **`pais`**: la chapa en pixel art 11x7 (las de `alunizajes.ts`,
  `amartizajes.ts`; si falta, se añade allí).
- **`partes`**: 5-8, en el orden de las letras: punto (`en`), piezas que
  resalta, respaldo (`foto`, `reconstruccion`, `fabricante`), fuentes (ids),
  texto y nota de lo supuesto.
- **`fuentes`**: las fotos (con miniatura) y los artículos (sin ella).

### 5. Miniaturas de las fotos de fuentes

`sips -Z 560 -s format jpeg -s formatOptions 72 <foto> --out
public/uas/<modelo>/fuentes/<foto>.jpg` (~50 KB cada una).

### 6. Probar

En la ficha (`/uas/<slug>`). Atajos en la URL del visor:
`?vista=arriba|lado|frente|detras`, `?parte=C`, `?pestana=fuentes`,
`?estilo=pixel`. Comparar las siluetas con las fotos, sobre todo planta y
perfil.

### 7. Miniaturas del dron (generadas)

`node arte/generar-uas-miniaturas.mjs <modelo>`: la miniatura 3D (día y
noche), el giro hasta ponerse de frente de las tarjetas de `/uas`
(`giro-frente*.png`) y la planta a escala para la tira de la portada
(`planta.png`). Repetir si cambia la maqueta.

### 8. Capturas

`node arte/capturas.mjs URL salida.png [--ir=SELECTOR] [--raton=SELECTOR]
[--noche] [--js=CÓDIGO] [--tam=1300x900]` (con `npm run dev` en marcha).
Ejemplos: la ficha en pixel, `…/uas/<slug>?estilo=pixel`; la tarjeta con el
ratón, `--ir=.uas-tarjetas --raton=.uas-tarjeta`; la tira de la portada con
la puerta abierta, `--ir=.tira-sat --raton=.sat-hangar`. Recortar con
ffmpeg (`crop=`) para enseñar solo lo que importa. Si cambia el motor del
visor, medir el **consumo en Zen** (`docs/rendimiento.md`).

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

- **Cabecera**: bandera en pixel art (`svgBandera`), país, nombre,
  subtítulo; a la derecha y a media altura, el crédito en tres líneas:
  «Maqueta creada a partir de fotos públicas. Hecho con» / icono de Three.js
  + Three.js / Clawd + Claude Code (Clawd de `STACK` en `src/consts.ts`;
  Three.js de simple-icons).
- **Lienzo**: la maqueta. Se gira arrastrando, se acerca con la rueda o
  pellizcando. Letras en casillas sobre cada parte; las tapadas, apagadas.
  La parte elegida se pinta en blanco papel (o tinta) y sale un rótulo.
- **Barra**: la tira de siluetas (Planta, Perfil, Frente, 3D) son los
  botones de vista; se dibujan solas de la maqueta. Luego Maqueta | Pixel,
  Girar (apagado al empezar), − y +.
- **Modo Pixel** (`uas-pixelado.ts`): la misma escena pintada en directo a
  2 px por píxel de arte, cuatro tonos por acabado, tramado solo en
  superficies curvas y contorno de 1 px. Se gira libre.
- **Panel**, dos pestañas: **Partes** (lista con letras; la elegida con la
  casilla en tinta y el nombre en negrita; debajo su ficha: respaldo, texto,
  nota y «Ver sus fuentes (n) →») y **Fuentes** (miniatura, medio, título,
  enlace y «Respalda: A · C»; con una parte elegida, se apagan las que no la
  respaldan).
- Rendimiento: solo pinta cuando algo cambia, 60 fps como mucho, las letras
  tapadas se miran cada 200 ms, suelta el contexto WebGL al cambiar de
  página (si no, al ir atrás y adelante fallaba).

### Medidas

| Qué | Valor |
|---|---|
| Ancho del visor en la ficha | `min(1040px, 100vw − 2.5rem)`, centrado sobre el texto de 720 px (el usuario prefirió esto a ajustarlo al texto) |
| Borde y esquinas | 1 px, radio 4 px |
| Cabecera | relleno 1rem 1.25rem, raya discontinua abajo |
| Cuerpo | rejilla `1fr` + panel de 17rem |
| Alto del lienzo | 26rem; 22rem si el visor mide ≤ 720 px; 18rem si ≤ 480 px |
| Cuadrícula | 24 px |
| Casilla de letra | 1.25rem, radio 2 px, IBM Plex Mono 0.68rem |
| Silueta | 64x32 px (44x24 en estrecho) |
| Pixel | 2 px CSS por píxel de arte (`TAM_PIXEL`) |

### Colores («tinta, sin color»)

Variables `--visor-*` al principio del `<style>` de `VisorUAS.astro`.

| Variable | Día | Noche |
|---|---|---|
| Fondo de la tarjeta | `#ebebee` (página `#fafafa`) | `#25252a` (página `#18181b`) |
| Acento (lo elegido) | `#27272a` | `#e4e4e7` |
| Maqueta: relleno | `#454950` | `#2c2e33` |
| Maqueta: aristas | `#a3a9b1` | `#9aa0a8` |
| Parte elegida | `#f4f4f5` | `#f4f4f5` |

El dron va en **su color real**. Paletas del pixel (cuatro tonos por
acabado, de día y de noche) en `src/scripts/uas-paletas.ts`, que comparten el
visor y los generadores de `arte/`.

## El hangar: la tira de la portada y el índice

**La tira de la portada**, entre la Luna y Marte y la del blog: la
plataforma de un aeródromo de noche (asfalto oscuro, como el resto de
tarjetas; línea amarilla de rodadura).
- A la izquierda, «HANGAR DE UAS», el número y «N drones en el hangar».
- El **hangar de arco en carbón con anexo, de lado y un poco girado**
  (boceto del usuario): «UAS» con plantilla, ventanucos, óxido, puerta de
  servicio con farol, respiraderos, antena, bidones; a la derecha, el
  testero con la puerta en arco mirando a los drones. Entreabierta con luz
  tenue; al pasar el ratón se abre en 5 fotogramas y la luz del suelo (medio
  óvalo, «el arco completo») se ensancha y aviva. Lo dibuja
  `arte/generar-uas-hangar.mjs` (`ELEGIDO` dice color y forma; hay verde
  militar, aluminio, arena y carbón, con y sin anexo).
- A la derecha, **hasta tres drones vistos desde arriba, a escala real entre
  ellos**, en puestos con discontinuas, con recuadro y rótulo amarillos
  (nombre y bandera). Con más de tres, van rotando cada 7 s.
- Rechazado: drones en 3/4 quietos en fila, «hangar a oscuras», línea de
  barrido, números «01», «02», rótulo «Reconstrucción · drones a escala»,
  suelo claro, hangares vistos desde arriba («se ven FATAL»), luz del suelo
  hecha con CSS, silueta de dron dentro de la puerta (parecía una sombra),
  piloto rojo y dron que sale volando (no los eligió).

**El índice `/uas`**: título «Hangar de UAS», filtro por país y tarjetas con
el dron en pixel art sobre la cuadrícula del visor, país, nombre, categoría y
el principio de la introducción. Al pasar el ratón, el dron **gira hasta
ponerse de frente** (`giro-frente.png`) y el país resalta; con un filtro
puesto, el país sale marcado en todas las tarjetas. (Se probó una vuelta
completa; eligió «de frente». El filtro por tipo se quitó.)

## Las fichas en la web

Toda nota de la carpeta de la enciclopedia es una ficha de la colección
`uas` (`src/content/uas/`), en `/uas/<slug>`; no sale en `/notas` ni en el
blog, y su «Volver» lleva a `/uas`. El importador (`scripts/importar-notas.mjs`)
la reconoce por la carpeta y saca de la tabla el país (`pais`, `bandera`) y
la categoría (`categoria`).

Si existe `src/data/uas/<slug>.ts`, el importador (`colocarVisor`) cambia la
sección `## Visor` (título incluido) por un hueco (`<div class="visor-hueco">`)
y la ficha pinta el visor en ese hueco, más ancho que el texto y sin sus
estilos (`not-prose`). Si no hay maqueta, la sección no sale.

También en el importador: la línea sangrada bajo un punto de lista (la
descripción de cada fuente) sale debajo, como en Obsidian (`saltosEnListas`);
los `==resaltados==` pasan a `<mark>` (rotulador amarillo); los tuits salen
del tamaño de un embed de X (34rem, foto o vídeo con alto máximo).

## Archivos

| Archivo | Qué es |
|---|---|
| `src/data/uas/tipos.ts` | Qué es una maqueta: piezas, acabados, partes, fuentes, país, escala |
| `src/data/uas/<modelo>.ts` | La maqueta de un dron, **solo datos** |
| `src/scripts/uas-geometria.ts` | Vistas y mallas de cada tipo de pieza |
| `src/scripts/uas-paletas.ts` | Paletas del pixel art (visor y generadores) |
| `src/scripts/visor-uas.ts` | El motor (Three.js): escena, cámara, letras, vistas, modos |
| `src/scripts/uas-pixelado.ts` | El modo Pixel |
| `src/components/VisorUAS.astro` | El marco del visor: `<VisorUAS modelo="mich-2000" />` |
| `src/pages/uas/index.astro` | El índice `/uas` |
| `src/pages/uas/[...slug].astro` | La ficha `/uas/<slug>` |
| `src/pages/index.astro`, `src/styles/portada.css` | La tira «Hangar de UAS» (`.tira-sat`) |
| `scripts/importar-notas.mjs` | Notas de la carpeta → `src/content/uas/` |
| `arte/generar-uas-miniaturas.mjs` | Miniatura, giro y planta de cada dron |
| `arte/generar-uas-hangar.mjs` | El hangar y el asfalto de la tira |
| `arte/capturas.mjs` | Capturas para enseñar al usuario |
| `public/uas/<modelo>/` | Miniaturas, giro, planta y `fuentes/` |
| `arte/uas-fuentes/<modelo>/` | Fotos a tamaño completo y `FUENTES.md` (fuera de Git) |
| `00 - Meta/Plantilla UAS (Templater).md` (bóveda) | Esqueleto de la nota |

## Lo que el usuario quiere (y lo que rechazó)

- **Diseño propio**: el primer visor calcaba el de drone-warfare.com («me
  gusta la idea, pero no que le copiemos todo»).
- **Sin acento de color** en el visor: rechazó el verde azulado («muy IA»),
  el sello rojo y el código de ficha.
- **El dron en su color real.**
- **Pixel art con detalle y giro libre** (una tira de 39 dibujos fijos fue
  rechazada).
- **Solo detalles que se vean en las fuentes**, y decir de qué foto sale cada
  cosa y qué es supuesto.
- **Consumo**: al girar sube algo en Zen; está limitado, falta medirlo.
