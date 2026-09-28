# UAS: el hangar de drones, las fichas y el visor

La enciclopedia de UAS de zodk.eu («la gran enciclopedia de los UAS»; en la
web, **«Hangar de UAS»**): una nota por dron en la bóveda
(`02 - Temas/Hangar de UAS/`; hasta el 28-sep-2026, «La gran enciclopedia
de los UAS.»), que en la web es una
**ficha** en `/uas/<slug>`, listada en el índice `/uas` y con acceso desde la
tira «Hangar de UAS» de la portada. Las fichas con maqueta llevan un
**visor**: **«el visor»** es el nombre del recuadro completo (lo eligió el
usuario): cabecera, maqueta, tira de siluetas, panel de partes y fuentes. En
el código, el componente `VisorUAS`.

Drones hechos: MICH-2000 (ala volante, Ucrania), Skydio X10D (cuadricóptero,
EE. UU., del Ejército de Tierra) y Wildfire (avión con cola en V, EE. UU.,
hecho solo con renders del fabricante). **Este documento es la receta**: con
él se tiene que poder hacer un dron nuevo desde cero, sin más contexto. Al
final, lo que hay que respetar, lo que se probó y el usuario rechazó, y las
fotos de cada maqueta.

## Estado

**Fusionado en `main` y publicado (27-sep-2026).** Se hizo en la rama
`uas-project`, que se deja en GitHub como registro. Abierto, sin prisa:

- **Probarlo en el iPhone**: el usuario lo mira ya publicado y avisa si sale
  algún fallo.
- **La tira de la portada** lleva dos drones fijos, el X10D y el MICH-2000
  (al lado del hangar solo caben dos). Cómo entran los demás, más adelante.
- Consumo del visor al girar en Zen: el usuario lo ve bien; no se ha medido
  en vatios.

**28-sep-2026**: la carpeta de la bóveda pasó a llamarse «Hangar de UAS» (el
importador la busca por ese nombre); se añadió el **glosario** (apartado
«El glosario», abajo) y se arregló que el hangar de la portada y las
tarjetas de `/uas` enseñaran fotogramas partidos al quitar el ratón a medias
(ver «Animaciones por fotogramas»).

## Pedir una ficha nueva: el guion completo

El usuario pide «hazme la ficha del <dron>» (a veces con tuits o enlaces).
Hay que entregar: **la nota en Obsidian, la maqueta con su visor y su pixel
art, las miniaturas y las fotos de fuentes**, probado en local, con capturas
y, cuando lo diga, commit (y push si lo pide: `commit` y `push` son órdenes
separadas).

0. **Antes de empezar.** `git status` y rama en `~/Documents/zodk-web`. El
   proyecto ya está en `main`: un dron nuevo va en `main` (el push a `main`
   publica zodk.eu: nunca sin que lo pida). `npm run dev` en marcha
   (`localhost:4321`).
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
6. **Documentar**, en este documento: las fotos del dron con sus enlaces
   («Fotos de las maquetas»), lo que el usuario decida o rechace y, si se
   añadió algo al visor (piezas, acabados), la receta.
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

En `02 - Temas/Hangar de UAS/`, desde la plantilla
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
    bandera delante: `🇺🇦 Ucrania`; es **siempre el país del fabricante
    oficial**, lo opere quien lo opere —lo decidió el usuario con el X10D,
    que usa España—, y lo usa el filtro de `/uas`), Fabricante, Operador, **Categoría** (sale en las
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
`FUENTES.md` (archivo, qué enseña, URL) y copiar la lista a «Fotos de las
maquetas», al final de este documento (lo que está fuera de Git no llega al
PC con Linux).
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
- **Piezas** (`uas-geometria.ts`): `tubo` (fuselaje, torno a lo largo de z;
  con `seccion` [ancho, alto], más alto que ancho),
  `ala` (perfil NACA, estaciones de raíz a punta), `placa` (canards,
  winglets, elevones, brazos y patas planos; con `simetrica` y `bisel`,
  cuerpos vistos desde arriba con los bordes redondeados; las verticales,
  con `inclinacion`, se tumban hacia fuera: cola en V, winglets caídos),
  `varilla`
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
- **Solo renders** (dron que aún no ha volado, como el Wildfire): las
  partes que se ven en ellos van como `fabricante` («Dato del fabricante»),
  no como `foto`, y la nota lo dice; lo que en los renders no se distingue,
  `reconstruccion`.
- **`partes`**: 5-8, en el orden de las letras: punto (`en`), piezas que
  resalta, respaldo (`foto`, `reconstruccion`, `fabricante`), fuentes (ids),
  texto y nota de lo supuesto.
- **`fuentes`**: las fotos (con miniatura) y los artículos (sin ella).

- **Trabajar la maqueta antes de enseñarla** (el usuario, tras el X10D y el
  Wildfire: «si no te estoy corrigiendo, la primera versión es mala»). Hacer
  varias vueltas comparando con las fotos **desde el mismo ángulo**: en la
  captura, `--js` puede mandar teclas al lienzo (flechas giran 10°, `+`
  acerca), por ejemplo
  `--js="(()=>{const c=document.querySelector('.visor canvas');for(const k of ['ArrowUp','+','+'])c.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}))})()"`,
  y ponerla al lado de la foto con ffmpeg (`hstack`). Mirar proporciones
  (largo y alto del fuselaje, dónde cruza el ala), secciones, carenados,
  tomas de aire, antenas y cómo van colgadas las armas.

### 5. Miniaturas de las fotos de fuentes

`sips -Z 560 -s format jpeg -s formatOptions 72 <foto> --out
public/uas/<modelo>/fuentes/<foto>.jpg` (~50 KB cada una).

### 6. Probar

En la ficha (`/uas/<slug>`). Atajos en la URL del visor:
`?vista=arriba|lado|frente|detras`, `?parte=C`, `?pestana=fuentes`,
`?estilo=pixel`. Comparar las siluetas con las fotos, sobre todo planta y
perfil.

### 7. Miniaturas del dron (generadas)

`node arte/generar-uas-miniaturas.mjs <modelo>`: el giro hasta verse de planta de las tarjetas de `/uas`
(`giro-planta*.png`, 8 fotogramas de 128x72) y la planta a escala para la
tira de la portada (`planta.png`; los drones muy grandes se reducen hasta
72x70, `PLANTA_MAX`). Pinta como el modo Pixel del visor: mismo contorno,
líneas en los saltos de profundidad y en las juntas entre piezas, y
tramado en las curvas (la planta de la portada, sin líneas ni tramado,
como estaba). Repetir si cambia la maqueta o las paletas.

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

**Líneas del pixel** (lo que hace que se lea bien; el usuario vio el pixel
del Wildfire y las tarjetas de noche «reguleros», con poco contraste):
- Contorno de 1 px por fuera. De noche, los drones negros llevan un filo
  claro (`contorno`), pero **los claros (`resalte: "tinta"`) lo llevan
  oscuro** (`contornoClaro`): con el filo claro, las líneas se perdían sobre
  el gris.
- Línea fuerte (60 % del contorno) donde la profundidad salta más de 0,07
  unidades (antes 0,2: en el Wildfire, con piezas finas, no salía nada).
- Línea suave (45 %) en la **junta entre dos piezas** distintas, en la que
  queda detrás (el ala que entra en el fuselaje): cada pieza lleva su número
  en el canal alfa (`marcaPieza`). Los anillos `junta` del MICH, sin línea.
- El gris tiene más recorrido (`#50555d` a `#dcdfe3`) para que se note la
  luz.

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
- A la derecha, **drones vistos desde arriba, a escala real entre ellos**,
  en puestos con discontinuas, con recuadro y rótulo amarillos (nombre y
  bandera). Al lado del hangar solo caben dos puestos: **de momento, siempre
  el X10D y, a su derecha, el MICH-2000** (`EN_HANGAR` en `index.astro`,
  decisión del usuario); cómo entran los demás está por decidir. (Se probó
  el Wildfire reducido con «≈20 m» en el rótulo y dos puestos que rotaban;
  el usuario prefirió dejarlo como estaba.)
- Rechazado: drones en 3/4 quietos en fila, «hangar a oscuras», línea de
  barrido, números «01», «02», rótulo «Reconstrucción · drones a escala»,
  suelo claro, hangares vistos desde arriba («se ven FATAL»), luz del suelo
  hecha con CSS, silueta de dron dentro de la puerta (parecía una sombra),
  piloto rojo y dron que sale volando (no los eligió).

**El índice `/uas`**: «Volver a la portada», título «Hangar de UAS», filtro
por país y tarjetas con el dron en pixel art (128x72 al doble) sobre la
cuadrícula del visor, país, nombre, categoría y el principio de la
introducción. Al pasar el ratón, el dron **gira hasta verse de planta**, con
el morro arriba (`giro-planta.png`), y el país resalta; con un filtro puesto,
el país sale marcado en todas las tarjetas. (Se probó una vuelta completa y
luego «de frente», pero de frente los winglets y las hélices, de canto,
desaparecían; el usuario pidió la planta. El filtro por tipo se quitó.)

## El glosario

La nota `Glosario y Terminología.md` de la misma carpeta de la bóveda (el
importador reconoce como glosario la que empieza por «Glosario») no es un
dron: sale en `/uas/glosario-y-terminologia`, sin visor, con `glosario: true`
en su frontmatter de la web, y **no cuenta** entre las tarjetas de `/uas` ni
entre los drones de la tira de la portada. En `/uas` tiene una tira propia
encima del filtro de países: una tarjeta tumbada con «A–Z» sobre la
cuadrícula, el título, unos ejemplos y cuántos términos tiene (cuenta los
puntos de lista de primer nivel que empiezan en negrita). Las entradas del
glosario van con el término en inglés delante y el castellano detrás
(decisión del usuario).

## Animaciones por fotogramas

La puerta del hangar (5 fotogramas) y el giro de las tarjetas (8) son tiras
de fotogramas. **No animarlas con `transition: background-position …
steps()`**: si se quita el ratón a medias, la vuelta se hace en saltos del
tramo recorrido, que no caen en fotogramas enteros, y se ven dos fotogramas
partidos (medido: 2 → 1,5 → 1 → 0,5). Se anima un número de fotograma
registrado como entero (`@property --hangar-fotograma` / `--giro-fotograma`,
`syntax: "<integer>"`) y la posición se calcula con él: el navegador lo
redondea siempre a un fotograma entero.

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
| `arte/generar-uas-miniaturas.mjs` | Giro de las tarjetas y planta de cada dron |
| `arte/generar-uas-hangar.mjs` | El hangar y el asfalto de la tira |
| `arte/capturas.mjs` | Capturas para enseñar al usuario |
| `public/uas/<modelo>/` | Miniaturas, giro, planta y `fuentes/` |
| `arte/uas-fuentes/<modelo>/` | Fotos a tamaño completo y `FUENTES.md` (fuera de Git) |
| `00 - Meta/Plantilla UAS (Templater).md` (bóveda) | Esqueleto de la nota |

## Decisiones que hay que respetar

- **Diseño propio**: la idea del «Airframe explorer» de drone-warfare.com
  (https://drone-warfare.com/research/mich-2000/), pero ni su diseño ni su
  código ni su geometría. El marco es una «tarjeta de identificación», como
  los manuales de reconocimiento de aeronaves.
- **Nombres**: «el visor» (el recuadro completo), «Hangar de UAS» (la
  sección), fichas en **`/uas/<slug>`**. Crédito del visor: «Maqueta creada a
  partir de fotos públicas. Hecho con» Three.js y Claude Code; se queda igual
  también en drones hechos con renders (el usuario: «déjalo así»).
- **«Tinta, sin color»**: tarjeta `#ebebee` de día y `#25252a` de noche, lo
  elegido en tinta; el único color es la bandera.
- **El dron en su color real**, en la maqueta y en el pixel.
- **Pixel art con detalle y giro libre**, pintado en directo de la maqueta.
- **Solo detalles que se vean en las fuentes**, discretos, y decir de qué
  foto sale cada cosa y qué es supuesto.
- **Maquetas trabajadas antes de enseñarlas**: comparadas con las fotos
  desde el mismo ángulo (receta, paso 4).
- **País = el del fabricante oficial**, lo opere quien lo opere (el X10D,
  bajo Estados Unidos).
- Ancho del visor en la ficha: 1040 px, más ancho que el texto (opción A).
- El encuadre del visor se queda como está, aunque los drones de ala larga
  (el Wildfire) salen pequeños (el usuario: «déjalo»).
- La tira de la portada: dos drones fijos, X10D y MICH-2000.
- Las notas de la enciclopedia van sin claves propias en el frontmatter; el
  primer párrafo es una cita `>`, sin `## Introducción`.

## Probado y rechazado (no reintentar salvo que se pida)

- El primer visor, calcado del de drone-warfare («me gusta la idea, pero no
  que le copiemos todo»). Sello rojo y código «Ficha UAS-UA-001».
- Acento verde azulado `#2f8f8a` («muy IA»); también se descartaron el azul
  del blog, el naranja de señalización y el rojo de sello.
- Pixel art como tira de 39 dibujos fijos (poco detalle, giro a saltos) y en
  el blanco del «333»: el MICH va en negro mate.
- El hueco de la hélice en el ala del MICH (no se ve en ninguna foto) y las
  juntas del fuselaje marcadas («son mucho más suaves»).
- El X10D con el cuerpo de cajas y cilindros («demasiado cuadrado») y
  hélices de dos palas.
- La primera maqueta del Wildfire, «de bulto» (fuselaje de puro, sin toma de
  aire ni carenados).
- Ancho del visor B (720, panel debajo), C (720 compacto) y D (banda de lado
  a lado).
- Tarjetas de `/uas` que dan una vuelta completa o se ponen de frente al
  pasar el ratón (de frente, winglets y hélices desaparecían); filtro por
  tipo.
- En la tira: el Wildfire reducido con «≈20 m» en el rótulo y dos puestos
  que rotan; y todo lo del hangar que se lista en su apartado.
- Como referencia del MICH, el dibujo de dronestrike.com (no se parece).

## Fotos de las maquetas

Las fotos a tamaño completo están en `arte/uas-fuentes/<modelo>/`, fuera de
Git. Para bajarlas en otro ordenador:

**MICH-2000.** Artículo principal: Oboronka,
https://oboronka.mezha.ua/istoriya-dronu-mich-2000-314113/ (visitó la
fábrica). Otros: United24 Media, Ukrainska Pravda, Euromaidan Press,
defence-blog, tvd.im. No hay medidas publicadas ni una buena vista cenital:
la planta sale de las fotos de la fábrica china y del lanzador.

| Archivo | Qué enseña | URL |
|---|---|---|
| lanzador-333-a.jpg | Blanco en el lanzador, 3/4 trasero | https://img.mezha.ua/mezha/system/MediaPhoto/photo/a/a/321351/aabf8b394e34b359be32397c2c4aa4b51786538922.jpg |
| lanzador-333-b.jpg | La misma escena | https://24tv.ua/resources/photos/news/202608/3122320.jpg |
| lanzador-333-c.jpg | La misma escena, más grande | https://defence-blog.com/wp-content/uploads/2026/08/DB_image_2146.jpg |
| morro-canard.jpg | Morro negro con canards | https://img.mezha.ua/mezha/system/MediaPhoto/photo/1/b/321326/1b01c51be0da403b311990a802e2aafa1786534016.jpg |
| cola-winglets.jpg | Negros por detrás: winglets y hélices | https://img.mezha.ua/mezha/system/MediaPhoto/photo/b/4/321332/b415b6b4d35ef9b1fa5510349079f9ed1786534206.jpg |
| fuselaje-secciones.jpg | Secciones del fuselaje | https://img.mezha.ua/mezha/system/MediaPhoto/photo/0/b/321334/0badf14ac7041fb4acf227d9e1c02e511786534297.jpg |
| centro-ala-motor.jpg | Centro del ala y soporte del motor | https://img.mezha.ua/mezha/system/MediaPhoto/photo/c/7/321337/c749f73c418ea7150269e8dd965264391786534591.jpg |
| ztk150-fabrica-china-a.jpg | ZTK-150 en China: planta completa | https://img.mezha.ua/mezha/system/MediaPhoto/photo/d/8/321349/d85dbea0c9b1a14fbac86d2689411b751786538636.jpeg |
| ztk150-fabrica-china-b.jpg | La misma nave, más cerca | https://24tv.ua/resources/photos/news/202608/3122320_17882710.jpg |

**Skydio X10D.** Medidas oficiales de la ficha técnica de Skydio (79 x 65 x
14,5 cm desplegado).

| Archivo | Qué enseña | URL |
|---|---|---|
| desplegado.jpg | En vuelo, 3/4 desde arriba | https://cdn.sanity.io/images/mgxz50fq/production-v3-red/99d884fbf52968d4e6b023c5a9f65b0f9376bc92-2930x1228.png |
| frente.jpg | De frente, sensor y patas | https://cdn.sanity.io/images/mgxz50fq/production-v3-red/3de3cab301639f41b671fbee417b7ef92f75a24d-768x411.png |
| plegado.jpg | Plegado | https://cdn.sanity.io/images/mgxz50fq/production-v3-red/34409812b6c1ae5b98614556dbd7e866d70b51ef-2352x1232.png |
| ejercito-tierra.jpg | Militar del Ejército de Tierra con el dron | https://www.infodefensa.com/images/showid2/8152692?w=1200&zc=4 |

**Wildfire.** Solo renders de General Atomics (el dron no ha volado) y sin
medidas: proporciones del Reaper, unos 20 m de envergadura.

| Archivo | Qué enseña | URL |
|---|---|---|
| gaasi-comunicado.jpg | Enjambre sobre el mar, con JSM | https://www.ga-asi.com/images/BlogFeaturedImages/ga-asi-unveils-wildfire-uas.jpg |
| twz-comparacion.jpg | Render junto a un MQ-9A | https://www.twz.com/wp-content/uploads/2026/09/wildfire-reaper-comparison.jpg |
| twz-morro.jpg | Morro sin joroba y torreta | https://www.twz.com/wp-content/uploads/2026/09/wildfire-nose-end.jpg |
| twz-jsm.jpg | Dos JSM en un soporte | https://www.twz.com/wp-content/uploads/2026/09/wildfire-jsm-cruise-missiles.jpg |
| na-lrasm.jpg | Desde arriba, lanzando un LRASM (planta) | https://assets.newatlas.com/01/69/5b812ef848e48255875a40984a50/wildfire-media-graphics-scc-re-1290x726.jpg |
| na-banda.jpg | Desde abajo, con cuatro JSM (perfil) | https://assets.newatlas.com/86/b8/98eff06a4272ab530fa0a87fe4a6/wildfire-media-graphics-scb-desktop-1920x600.jpg |
