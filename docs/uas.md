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
EE. UU., del Ejército de Tierra), Wildfire (avión con cola en V, EE. UU.,
hecho solo con renders del fabricante), MQ-9 Reaper (EE. UU., armado con
cuatro Hellfire y dos GBU-12, con el tren fuera), RQ-11 Raven (EE. UU., de
mano, con el morro de gimbal del Ejército de Tierra), Bayraktar TB2
(Turquía, con cuatro MAM-L), Shahed-136 (Irán, ala en delta, en el gris
claro de los iraníes) y Geran-2 (Rusia, la versión rusa del Shahed, en
negro). **Este documento es la receta**: con
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

**28-sep-2026, fallos del iPhone y del PC** (en `main`, **sin commit**):
hecho que al volver atrás desde un enlace la ficha quede donde se estaba
leyendo (el visor ya se coloca en el build, ver «Las fichas en la web») y
que el giro de las tarjetas de `/uas` no se deslice partido en Safari (ver
«Animaciones por fotogramas»). Hecho también, en la bóveda (sin commit ni importar): las cuatro notas usan
los términos del glosario que eligió el usuario (toda la tabla de
características y cinco cambios en el texto: GPS-denied, RATO, SATCOM,
enjambre, y fuera «se puede perder sin gran drama»). La tira de la portada en el móvil **se queda como estaba** (los dos
drones, sin hangar): decisión del usuario del 28-sep-2026, después de ver
maquetas con el hangar en lugar de los drones (a tamaño natural, al doble
tapando el número, y a 4/3 más a la izquierda con el X10D al lado, con el
texto donde está o arriba). Ninguna llegó al CSS.

**28-sep-2026, MQ-9 Reaper** (commit en `main` y en la bóveda, subido).
Hecho: nota en la bóveda
(`🇺🇸 MQ-9 Reaper.md`, con el tono intermedio que pidió: ni informe técnico
ni redacción de colegio), maqueta `src/data/uas/mq-9-reaper.ts` con ocho
partes, miniaturas de fuentes y del dron, importado. Para hacerlo se añadió
al visor el acabado `oliva` (las bombas) y la `y` de las placas verticales
(aletas en X alrededor de un misil). El enlace de la nota del Wildfire al
Reaper ya funciona (en una tabla, el alias va con la barra escapada:
`[[🇺🇸 MQ-9 Reaper\|MQ-9 Reaper]]`).

**28-sep-2026, Armamento** (commit en `main` y en la bóveda, subido y publicado). El icono de la tira pasó de una mira a «AGM / GBU» en texto: el usuario eligió el texto «para ser igual que el glosario» entre la mira, un misil y una bomba en línea y un misil y una bomba en pixel art. Le gustaron los de pixel art; quedan para más adelante.
Hecho: nota `Armamento.md` en la carpeta del Hangar (una sola nota con
índice, fotos y no visor: decisión del usuario), con cinco municiones, las
que llevan nuestros drones: Hellfire, JSM, LRASM, GBU-12 y GBU-38. En la web,
página `/uas/armamento` y tira debajo de la del glosario (ver «El
armamento», abajo). Después (sin commit): la fila «Carga» del MQ-9 y del
Wildfire enlaza a cada munición (`[[Armamento#GBU-12 Paveway II\|GBU-12]]`),
y el glosario tiene una sección nueva, «Municiones y guiado», con
*semi-active laser*, *fire and forget* y *sea-skimming* (75 términos).

**29-sep-2026, RQ-11 Raven** (commit en `main` y en la bóveda, subido).
Hecho: nota `🇺🇸 RQ-11 Raven.md` (la Historia, la mitad sobre España, como
pidió el usuario), maqueta `src/data/uas/rq-11-raven.ts` con cinco partes,
miniaturas de fuentes y del dron, importado. Versión elegida por el usuario:
**el morro con gimbal** (el Raven digital que tiene el Ejército de Tierra
desde 2016), no el de cámaras fijas de Afganistán. Para hacerlo, el `ala`
admite ya **diedro** (quinto número de cada estación; ver la receta).
Después, a petición del usuario: la junta de los pliegues del ala, la
hélice que se vea en 3D, el gris del Ejército de Tierra (`gris-et`) y el
estabilizador en trapecio, no rectangular. Falta:
**tuits para «En acción»** (no se encontró ninguno del Raven; la sección no
está en la nota). El usuario dio la maqueta por buena el 29-sep-2026, tras
esos cuatro cambios.

**29-sep-2026, Bayraktar TB2** (commit en `main` y en la bóveda, subido;
el usuario la vio «bastante bien» y pidió dos retoques, hechos: el borde de salida del
ala, que junto al cuerpo se curva hacia atrás hasta el motor, y la parte
de atrás del cuerpo, con el cono largo y la hélice de 1,7 m del plano). Orden pedido por el usuario: TB2 y
después Shahed-136. Hecho: nota `🇹🇷 Bayraktar TB2.md` (`completa`), maqueta `src/data/uas/bayraktar-tb2.ts` con seis partes y
cuatro MAM-L, bandera turca en pixel art (hoy en `src/data/banderas.json`), miniaturas de fuentes y del dron, importado. La
maqueta se comparó con el plano de cinco vistas de Commons (a escala con
12 m y 6,5 m) superponiéndola en ortográfica (`arte/superponer-plano.mjs`) y con
fotos. Para hacerlo, el `tubo` admite ya
**eje que sube y alto propio en cada punto** (ver la receta). **Armamento**: el usuario
pidió crear la MAM-L y la MAM-C («tienes todo lo necesario»), hechas en
`Armamento.md` (siete municiones; fotos `armamento-mam-l.jpg` y
`armamento-mam-c.jpg`, de Commons, CC BY-SA 4.0), y la fila «Carga» del TB2
ya enlaza a las dos.

**29-sep-2026, banderas en pixel art** (commit en `main`, subido). El usuario
comparó en local, con un botón temporal (ya quitado), las banderas emoji y
las de pixel art, y eligió **pixel art «definitivamente»**. `BanderaUAS.astro`
pinta la chapa de la maqueta de cada dron (`svgBandera`) en los filtros y
las tarjetas de `/uas`, la cabecera del visor y los rótulos de la tira de
la portada; sin maqueta, el emoji. Después pidió lo mismo **en las tablas**
de las notas del hangar (la fila «País» de los drones y de las municiones):
lo hace el plugin `src/lib/banderas-tablas.mjs` (Sätteri, como el del
glosario), que cambia el emoji del principio de una celda por la chapa; en
la bóveda sigue el emoji. Las chapas se buscan por su emoji entre todas
las de la web (ver «30-sep-2026, banderas en un solo sitio»).
El tamaño, en `base.css` (`.bandera-uas svg`). De paso: la regla que
atenúa el número de cada filtro pasó a `button > span:last-child` (con la
bandera dentro, la apagaba). Windows, además, no pinta las banderas emoji.

**30-sep-2026, banderas en un solo sitio** (sin commit). Lo propuso el
usuario: las chapas estaban dibujadas en cuatro sitios (el planeta del
hero en `arte/generar-tierra.py`, `/luna` en `alunizajes.ts`, `/marte` en
`amartizajes.ts` y el hangar en `banderas-uas.ts`, ya borrado), con EE. UU.
y Ucrania repetidas. Ahora todas están en **`src/data/banderas.json`**
(dibujo, paleta, emoji y, si hace falta, una `nota` de por qué se dibujó
así), que lee también el generador del planeta; en TypeScript se piden con
`bandera("IR")` de `src/data/banderas.ts`, que tiene además `svgBandera` y
`banderaPorEmoji`. **Un país nuevo = una entrada en `banderas.json`** y sale
igual en todas partes; las tablas de las notas del hangar ya cambian
cualquier emoji que tenga chapa. Las chapas del planeta salen idénticas
(comprobado celda a celda; no hubo que regenerarlo). Único cambio visible:
Ucrania en el hangar pasa a 3 filas azules y 4 amarillas, como en el
planeta (lo había elegido el usuario allí); antes, 4 y 3.

**30-sep-2026, Shahed-136** (en `main`, **sin commit**, ni en zodk-web
ni en la bóveda). Orden pedido por el usuario: después del TB2. Decisiones
del usuario: **una sola nota** para Shahed-136 y Geran-2 (el Geran va en la
Historia y Rusia como operador) y la maqueta del **iraní, en gris claro**,
no la del Geran negro. Hecho: nota `🇮🇷 Shahed-136.md` (`borrador`),
maqueta `src/data/uas/shahed-136.ts` con ocho partes (en metros, escala 1,
sacada del plano de Alexpl a 325 px/m y comparada en ortográfica; la planta
cuadra casi exacta), miniaturas de fuentes y del dron, importado. Enlaces
nuevos al Shahed desde la nota del MICH-2000 y desde el glosario (los pidió
el usuario). La bandera de Irán ya existía (la del planeta, por el F-15E) y
sale del archivo único de banderas. El usuario pasó capturas de la ficha
de drone-warfare: su dibujo de tres vistas es una ilustración («not to
exact scale», winglets mal); solo se usó para confirmar la carena de la
antena GNSS, que el plano de Alexpl también dibuja. Falta: que el usuario
revise la nota y la maqueta. (Commit el 30-sep-2026: banderas `4731abb`,
Shahed `0bb7a55`; en la bóveda, `fe0fd0c`.)

**30-sep-2026, Geran-2** (en `main`, **sin commit**). Lo pidió el usuario
después del Shahed: nota aparte, maqueta **en negro**, texto sobre su
historia, dónde se fabrica y qué novedades lleva. País: Rusia (el
fabricante), etiquetas `rusia` y `dron`. En «En acción», **vídeos solo del
Geran en su nota y solo del Shahed iraní en la del Shahed** (el de Kiev pasó
al Geran; al Shahed, el del aeropuerto de Kuwait). El usuario pidió también
**cruzar varias fuentes** y no apoyarse casi solo en drone-warfare: la nota
usa AP, Reuters (vía The Moscow Times), GUR, Defense Express, ISIS, CSIS,
CNN, NPR y Euronews. Maqueta `src/data/uas/geran-2.ts`: importa la del
Shahed y reutiliza lo de detrás (ala hasta el borde de salida, elevones,
winglets, motor, hélice, carena), en negro; rehace el morro (0,19 m más
corto) y el borde de ataque junto al cuerpo con el plano de Alexpl de 2025,
y añade el panel CRPA de cuatro elementos en el ala derecha. Ojo: ese plano
coincide exactamente con el **plano del Shahed de 3,35 m** (Alexpl, 2024),
revisión del de 3,50 m (2023) con que se hizo el Shahed; las proporciones
del de la DIA se parecen más al nuevo. El usuario dijo que se rehiciera
(hecho, sin commit): ahora **la geometría está en `shahed-136.ts`**, medida
del plano de 3,35 m, y `geran-2.ts` la importa entera, la pinta de negro,
cambia el anillo por una junta y añade el panel CRPA. Las notas del Shahed
y del Geran las revisa y retoca el usuario (dice «da eso por tachado»).

**30-sep-2026, tarjetas de /uas** (sin commit). El usuario vio el pixel art
de la tarjeta del Shahed «raro» comparado con el visor: en el primer
fotograma salía una franja oscura a lo largo del borde de salida. Era la
línea de salto de profundidad: en la tarjeta cada píxel abarca unas tres
veces más dron que en el visor, y sobre un ala grande vista de lado el
salto normal entre dos píxeles de la misma superficie pasaba de 0,07 y se
pintaba como línea. Arreglado en `generar-uas-miniaturas.mjs`: el umbral es
`max(0,07, el salto de tres píxeles)`. Se regeneraron todas las tarjetas
(los demás drones apenas cambian). Se descartó antes, probando, que fueran
la luz, las normales de los escalones del ala o las caras de espaldas.

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
   node_modules/.vite` y arrancar de nuevo). Ojo: `astro dev` se queda
   corriendo en segundo plano y, si el 4321 está ocupado, arranca otro en el
   4322, 4323…: el navegador sigue viendo el viejo. Antes de arrancar,
   `lsof -nP -iTCP:4321 -sTCP:LISTEN` y cerrar ese proceso (`kill <pid>`).
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
  analisis` (como todas las del hangar), `estado: borrador`, `publicar: true`, `tags` solo con el país del fabricante y `dron`, nunca los países que lo
  operan (lo corrigió el usuario con el Raven, que llevaba también `españa`).
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
  - `## Fuentes` (formato que eligió el usuario con el TB2, 29-sep-2026):
    una línea por fuente, `* **Medio**, mes año - Título real ([fuente](url))`,
    con el título en su idioma. Las webs sin fecha (Wikipedia, fichas del
    fabricante) van primero y sin fecha; el resto, de la más antigua a la
    más reciente. Si no se encuentra la fecha, no se inventa: se deja sin
    ella y se avisa. (La plantilla de Templater aún tiene el formato viejo.)
- **Nombres que se enlazan solos**: en la web, la primera vez que sale un
  término del glosario o una munición del armamento lleva su tarjeta, pero
  solo si está escrito **igual que en su nota**. Términos: tal cual los
  pone el glosario, con las siglas en mayúsculas («MTOW», «jamming», no
  «peso máximo al despegue» ni «interferencia»). Municiones: el nombre de
  su `###` en el armamento, su designación o su nombre («AGM-114 Hellfire»,
  «AGM-114» o «Hellfire»; «GBU-38», no «GBU 38» ni «bomba JDAM de 500
  libras»). Si hace falta un término o una munición que no está, se añade
  a su nota en vez de explicarlo en la ficha.
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
`.ts` (`import { bandera } from "../banderas.ts"`), porque los
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
- **`pais`**: la chapa en pixel art 11x7, `bandera("US")` (de
  `src/data/banderas.ts`; si el país no está, se dibuja en
  `src/data/banderas.json`).
- **Escribir en metros** si hay medidas oficiales: el Reaper se escribe en
  metros y al final pasa a unidades con `aUnidades` (1 unidad = `ESCALA`
  m). Las unidades tienen que ser del orden de las del Wildfire (unas 2-3
  de envergadura): la cámara ve hasta 50 y la línea fuerte del pixel salta
  a 0,07 unidades.
- **Los `tubo` no se reflejan** (no tienen `espejo`): un misil o una bomba
  bajo cada ala se monta dos veces, con `x` y `-x` (en el Reaper, `LADOS`).
  Con el primer Reaper salieron armas enteras en un ala y solo las aletas
  en la otra.
- **Aletas en X** alrededor de un misil: cuatro placas verticales con
  `inclinacion` 45, −45, 135 y −135, el contorno en [z, distancia al eje] y
  `x`, `y` en el eje (`aletasX` del Reaper).
- **Carenados sobre una superficie inclinada** (cola en V): la misma placa,
  con la misma inclinación, más gruesa y en una franja corta.
- **Fuselaje que cambia de sección y con el morro caído** (el TB2): cada
  punto del perfil de un `tubo` admite dos números más, `[z, medio ancho,
  sube, medio alto]`. `sube` mueve el eje en esa z (el morro del TB2 queda
  0,27 m por debajo del lomo); `alto`, el medio alto (el morro es el doble
  de ancho que de alto y detrás el cuerpo es casi redondo). Las z no se
  repiten. Se sacan del plano de perfil (arriba y abajo en cada z) y del
  de planta (el ancho). Con estos números, `aUnidades` tiene que pasar
  todos los números del punto (`q.map(u)`), no solo dos.
- **Comparar con un plano en ortográfica**: el visor tiene perspectiva y
  engaña con las piezas que salen del plano (el diedro del TB2, de lado, se
  ve como un trapecio oscuro sobre el cuerpo). Con un plano a escala, mejor
  proyectar los triángulos de la maqueta sobre él, en rojo a medias
  (`arte/superponer-plano.mjs`: modelo, vista, plano, origen y píxeles
  por metro).
- **Diedro** (alas cuyas puntas suben, como las del Raven): cada estación
  del `ala` admite un quinto número, lo que sube sobre `y`
  (`[x, ba, bs, grosor, subida]`). En el Raven, el centro plano hasta 0,2 m
  y las puntas a 10°.
- **Ala en varias piezas, con la junta a la vista**: un `ala` cuya primera
  estación no está en x = 0 salen dos piezas sueltas, una a cada lado. El
  Raven lleva el centro (`ala`) y las puntas (`ala-puntas`) aparte, y entre
  ellos se ve la línea del pliegue (en Maqueta, la arista; en Pixel, la
  junta entre piezas). Lo pidió el usuario: «una línea en los pliegues para
  que parezca que están como dobladas».
- **Hélice parada en un ángulo** (`giro`, en grados): con las palas
  tumbadas, la del Raven quedaba escondida bajo el ala en la vista 3D; a 60°
  asoma una pala por encima.
- **Color de un ejército concreto**: acabado nuevo si hace falta, sacado de
  sus fotos. El `gris-et` (el gris algo verdoso de los Raven del Ejército
  de Tierra, muestreado en la foto de la exposición) lo pidió el usuario.
- **El `bisel` de una placa la hace crecer hacia fuera** lo que mide el
  bisel (lo hace así Three.js): con biseles grandes, encoger antes el
  contorno lo mismo (`encoger` del Raven) y no pasar de la mitad del grosor
  más fino de la pieza, o salen picos. Una **placa horizontal con un bisel
  grande** hace una pieza de bordes redondeados vista de lado y con la
  planta que se quiera (la capucha del gimbal del Raven: media
  circunferencia delante).
- **Una foto de vuelo puede engañar**: en la de perfil del Raven, el ala más
  cercana tapaba el pilón y parecía que el ala iba pegada a la barquilla;
  las de tierra dieron la altura de verdad (5 cm). Contrastar cada medida
  con otra foto.
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
  y ponerla al lado de la foto con ffmpeg (`hstack`), o encima, a medias,
  escalada para que el largo coincida (así se hizo el perfil del Reaper).
  Ojo: al acercar, el visor tiene mucha perspectiva; lo que sale del plano
  (la cola en V vista de lado, las bombas vistas de frente) se deforma, y
  hay que comparar sobre todo el contorno del cuerpo. Mirar proporciones
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
como estaba). La línea de salto de profundidad salta a 0,07 unidades o al
salto de tres píxeles, lo que sea mayor (si no, un ala grande vista de lado
salía entera como línea: el Shahed). Repetir si cambia la maqueta o las
paletas.

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

**Ancho del índice** (30-sep-2026): con más drones, la lista de dos
columnas se hacía muy larga. La página `/uas` va a **860 px** (el resto de la
web, 720), cabecera y pie incluidos, y así caben **tres tarjetas por fila**
con el dron a su tamaño; la cuadrícula es la misma (`minmax(16rem, 1fr)`) y
en el móvil baja a una o dos. Se probaron: tres columnas en 720 con el dron a
3/4, solo el listado a 1080, la página a 920, lista de filas, grupos
plegables por país, estanterías por categoría y un buscador. Quedan como
ideas, sobre todo la lista y el buscador para cuando haya muchos drones, y
el hangar como mapa en pixel art (sin dibujar).

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

En la página, arriba, un **índice** (`GlosarioIndice.astro`): todas las
secciones con sus términos en columnas; al pulsar uno, la página baja hasta
él y lo marca un momento en amarillo, y abajo a la derecha sale «↑ Índice».
Se construye solo de la nota (`src/lib/glosario.ts`): cada término lleva el
ancla `#t-<término>` (`#t-kill-chain`). Se probaron también unos
desplegables por sección y una lista A–Z; el usuario eligió este («se ve
todo»). Las entradas van **con espacio** entre ellas (probado sin espacio;
decidido con espacio).

**Los términos y las municiones en los artículos** (29-sep-2026). En las
notas, los eventos y las fichas del Hangar, la primera vez que sale un
término del glosario (MALE, MTOW, jamming…) o una munición del armamento
(Hellfire, GBU-38…) queda enlazado a su entrada. Para que no se confunda con un enlace
normal (azul) va del color del texto, en IBM Plex Mono algo más pequeña,
con rayas finas debajo (pintadas con un degradado: con `text-decoration`
salían desiguales según lo que mide la palabra), y el puntero es una «i»
blanca en un círculo oscuro (el usuario los eligió el 30-sep-2026 entre
cinco estilos y diez punteros). Al pasar el ratón sale una tarjeta con el término, su nombre
completo, la definición (siete líneas como mucho) y «Ver en el glosario →».
En táctil, el primer toque abre la tarjeta. Es automático: en la bóveda no
se marca nada (el usuario lo prefirió a enlazar a mano en Obsidian).
- `src/lib/glosario-enlaces.mjs`: plugin de Sätteri, el procesador de
  Markdown de Astro 7 (va en `astro.config.mjs` con `markdown.processor`;
  los `rehypePlugins` de siempre ya no los ejecuta). Lee los términos de la
  nota del glosario importada. Siglas con mayúsculas exactas (LOS no es
  «los»), palabras sin distinguir y plural con «s»; la sigla detrás de una
  coma en el paréntesis también cuenta («…, OWA»). Salta títulos, enlaces,
  código y tuits; un enlace a mano al glosario cuyo texto es un término
  gana la tarjeta.
- `src/components/GlosarioTarjeta.astro`: la tarjeta, en las páginas de
  notas, eventos y UAS.
- Las municiones salen de las `###` del armamento: vale el nombre entero
  («AGM-114 Hellfire»), la designación («AGM-114») y el nombre de detrás
  («Hellfire»). Su tarjeta lleva el «Tipo» de la tabla, el primer párrafo
  de su ficha y «Ver en el armamento →». En la página del armamento no se
  enlazan entre ellas. Los enlaces a mano (`[[Armamento#GBU-38 JDAM|GBU-38]]`)
  también ganan la tarjeta.
- **Para que enlace, hay que escribirlo igual** (lo pidió el usuario): en
  cualquier nota, el término o la munición con el nombre exacto del
  glosario o del armamento (ver «Nombres que se enlazan solos» en la
  receta).
- Al cambiar el plugin, `astro dev` no lo recarga: parar, borrar
  `node_modules/.astro` y `.astro/data-store.json` (ahí guarda el HTML de
  las notas) y arrancar.


## El armamento

La nota `Armamento.md` de la misma carpeta de la bóveda (el importador la
reconoce porque empieza por «Armamento») recoge las **municiones** que llevan
los drones del hangar: misiles y bombas guiadas. Como el glosario, no es un
dron: sale en `/uas/armamento`, sin visor, con `armamento: true` en su
frontmatter de la web, y no cuenta entre las tarjetas ni en la portada.

- **La nota**: `## Misiles` y `## Bombas guiadas`, y dentro una `###` por
  munición (sin bandera en el título, para que el enlace
  `[[Armamento#AGM-114 Hellfire]]` quede limpio; la bandera va en la fila
  «País»). Cada una lleva foto con pie y crédito, tabla (País, Fabricante,
  Tipo, Guiado, Peso / longitud, Warhead, Alcance, En servicio, Lo llevan)
  y dos párrafos. La bandera es la del fabricante, como en los drones. El
  usuario pidió «munición», no «bomba», como palabra general.
- **Una munición nueva**: la `###` es «designación nombre» («AGM-114
  Hellfire», «GBU-12 Paveway II»), o solo el nombre si no tiene designación
  de EE. UU. («JSM»). De ahí salen los nombres con los que se enlaza sola en
  las demás notas, así que las fichas y notas tienen que escribirla igual.
  El primer párrafo es el que sale en la tarjeta: que empiece diciendo qué
  es.
- **El índice**: la nota tiene uno propio (`## Índice`) para Obsidian; el
  importador lo quita y la página monta el suyo con `GlosarioIndice` (el
  mismo componente del glosario, que ahora recibe las secciones ya leídas):
  `leerArmamento` (`src/lib/armamento.ts`) saca las `##`, las `###` y el
  «Tipo» de cada tabla, que sale en pequeño debajo del nombre.
- **La tira de `/uas`**: debajo de la del glosario, mismo estilo, con
  «AGM / GBU» (los prefijos de misiles y bombas guiadas) en lugar de «A–Z»,
  las cuatro primeras municiones y cuántas hay («7 bombas o misiles
  disponibles en la armería», texto del usuario del 29-sep-2026). El número
  de las dos tiras va en una chapa en tinta que cuenta desde 0 al cargar,
  en 3 s (el usuario la eligió entre seis opciones y luego la velocidad,
  probando de 0,9 a 3,5 s; primero 1,6 s, y el 30-sep-2026 pidió más lento
  porque al recargar casi no se veía subir; descartadas: casillas de dígitos, punto verde que
  late, número grande a la derecha y rotulador amarillo).
- **Las fotos**: en `02 - Temas/Adjuntos/armamento-*.jpg`, de Wikimedia
  Commons, con licencia libre (dominio público del ejército de EE. UU., o
  CC BY-SA / OGL con su crédito en el pie).
- `[[#sección]]` sin texto se lee ahora «sección» en la web, como en
  Obsidian (antes salía «#sección»).

## Animaciones por fotogramas

La puerta del hangar (5 fotogramas) y el giro de las tarjetas (8) son tiras
de fotogramas. **No animarlas con `transition: background-position …
steps()`**: si se quita el ratón a medias, la vuelta se hace en saltos del
tramo recorrido, que no caen en fotogramas enteros, y se ven dos fotogramas
partidos (medido: 2 → 1,5 → 1 → 0,5). Se anima un número de fotograma
registrado como entero (`@property --hangar-fotograma` / `--giro-fotograma`,
`syntax: "<integer>"`) y la posición se calcula con él: el navegador lo
redondea siempre a un fotograma entero. **Safari no**: lo anima con
decimales (medido en WebKit: 0,72 → 1,5 → 2,09…) y la tira se desliza de
lado con dos dibujos partidos. Por eso la posición lleva además
`round(var(--giro-fotograma), 1)`. Hecho en las tarjetas (28-sep-2026, el
usuario lo vio en el iPhone); la puerta del hangar de la portada usa lo
mismo sin `round()`, pero en el móvil no se ve (el hangar está oculto).

## Las fichas en la web

Toda nota de la carpeta de la enciclopedia es una ficha de la colección
`uas` (`src/content/uas/`), en `/uas/<slug>`; no sale en `/analisis` ni en el
blog, y su «Volver» lleva a `/uas`. El importador (`scripts/importar-notas.mjs`)
la reconoce por la carpeta y saca de la tabla el país (`pais`, `bandera`) y
la categoría (`categoria`).

Si existe `src/data/uas/<slug>.ts`, el importador (`colocarVisor`) cambia la
sección `## Visor` (título incluido) por un hueco (`<div class="visor-hueco">`)
y la ficha pinta el visor en ese hueco, más ancho que el texto y sin sus
estilos (`not-prose`). Si no hay maqueta, la sección no sale. El visor se
coloca en el hueco **al construir la página** (`[...slug].astro` parte el
HTML de la nota por el hueco). Hasta el 28-sep-2026 se pintaba al final y un
script lo subía al cargar: la página crecía por encima de lo que se leía y,
al volver atrás desde un enlace, la lectura no quedaba donde estaba (medido
en Zen: de 1.200 px a 1.838). No volver a moverlo con JavaScript.

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
- **Banderas del hangar en pixel art** (`BanderaUAS.astro`), no emoji, en
  `/uas`, el visor y la portada (el usuario, 29-sep-2026).
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

**MQ-9 Reaper.** Medidas de la ficha de la Fuerza Aérea (20,1 x 11 x 3,8
m). Todas de Wikimedia Commons: las de la Fuerza Aérea, de dominio público;
las de la RAF, con licencia OGL. La de perfil en vuelo (casi sin
perspectiva) da el contorno; las de frente con teleobjetivo, los soportes
(a 1,3 y 2,25 m del centro), la vía del tren (3,5 m) y el ángulo de la cola
(34°). El plano de tres vistas es orientativo: su cuerda del ala no
coincide con las fotos. Ojo: `bajo-ala-armas.jpg` lleva GBU-38, no GBU-12.

| Archivo | Qué enseña | URL |
|---|---|---|
| perfil-vuelo-armado.jpg | De perfil en vuelo, con Hellfire y GBU-12 (RAF): el contorno | https://upload.wikimedia.org/wikipedia/commons/1/1d/Royal_Air_Force_MQ-9_Reaper_1_November_2010.jpg |
| perfil-suelo.jpg | En tierra, de perfil | https://upload.wikimedia.org/wikipedia/commons/5/57/138th_Attack_Squadron_-_General_Atomics_MQ-9B_Reaper_09-4066.jpg |
| planta-arriba-vuelo.jpg | Desde arriba, en vuelo | https://upload.wikimedia.org/wikipedia/commons/8/89/MQ-9_Reaper_UAV.jpg |
| planta-abajo.jpg | Desde abajo, en vuelo | https://upload.wikimedia.org/wikipedia/commons/a/a9/MQ-9_Reaper.jpg |
| abajo-armado.jpg | Desde abajo, armado (RAF) | https://upload.wikimedia.org/wikipedia/commons/8/81/Reaper_UAV_Takes_to_the_Skies_of_Southern_Afghanistan_MOD_45151418.jpg |
| frente-armado.jpg | De frente, con Hellfire y GBU-12, 2007 | https://upload.wikimedia.org/wikipedia/commons/c/cd/MQ-9_Reaper_taxis.jpg |
| frente-armado-2.jpg | De frente con teleobjetivo, con Hellfire y GBU-12 (RAF) | https://upload.wikimedia.org/wikipedia/commons/5/5b/Reaper_UAV_Taxis_at_Kandahar_Airfield_MOD_45151487.jpg |
| frente-armado-3.jpg | De frente con teleobjetivo, con cuatro GBU-38 | https://upload.wikimedia.org/wikipedia/commons/4/44/U.S._Air_Force_MQ-9_Reaper_%2839807129124%29.jpg |
| morro-armado.jpg | Morro, torreta, antena en gota y toma de aire partida (RAF) | https://upload.wikimedia.org/wikipedia/commons/3/3c/RAF_Reaper_MQ-9_Remotely_Piloted_Air_System_MOD_45152585.jpg |
| bajo-ala-armas.jpg | Bajo el ala: soportes, GBU-38 y tren | https://upload.wikimedia.org/wikipedia/commons/4/48/An_MQ-9_Reaper_armed_with_four_GBU-38_JDAM_parks_on_a_flightline_on_Kandahar_Airfield%2C_Afghanistan_in_February_2018_-_3.jpg |
| tres-vistas-medidas.png | Plano de tres vistas con medidas (orientativo) | https://upload.wikimedia.org/wikipedia/commons/d/d8/MQ-9_Reaper_dimensioned_sketch.png |

Hay más en `arte/uas-fuentes/mq-9-reaper/FUENTES.md` (despegue, tres
cuartos, cola y tren en París 2013).

**RQ-11 Raven.** Medidas de la ficha del Ejército de Tierra (1,4 m de
envergadura, 0,91 m de largo, 1,9 kg). Todas de Wikimedia Commons. La de
perfil en vuelo da el contorno de la barquilla, el gimbal y la cola; las
de tierra, la altura del pilón (5 cm); la de detrás, el diedro (10°). El
estabilizador (0,40 m) es una reconstrucción.

| Archivo | Qué enseña | URL |
|---|---|---|
| perfil-vuelo.jpg | De perfil en vuelo, con gimbal y DDL (Fuerza Aérea de EE. UU., dominio público): el contorno | https://commons.wikimedia.org/wiki/File:52nd_SFS_trains_with_Raven_for_first_time_at_Spangdahlem_(6243202).jpg |
| frente-manos.jpg | Desde detrás: centro del ala plano y puntas a unos 10° (Ejército de EE. UU., dominio público) | https://commons.wikimedia.org/wiki/File:Dark_Rifles_take_Battle_Group_Poland_Raven_training_to_new_heights_(6768246).jpg |
| abajo-vuelo.jpg | Desde abajo en vuelo, cámaras fijas: planta del ala (dominio público) | https://commons.wikimedia.org/wiki/File:Raven_UAV_flying.jpg |
| suelo-tres-cuartos.jpg | En la hierba, de tres cuartos: el pilón levanta el ala (Fuerza Aérea de EE. UU., dominio público) | https://commons.wikimedia.org/wiki/File:52nd_SFS_trains_with_Raven_for_first_time_at_Spangdahlem_(6243199).jpg |
| perfil-soldado.jpg | De perfil en las manos de un soldado: altura del pilón y del motor (dominio público) | https://commons.wikimedia.org/wiki/File:U.S._Army_Spc._Corey_Lee,_a_military_policeman_assigned_to_the_603rd_Military_Police_Company,_displays_an_RQ-11_Raven_unmanned_aerial_vehicle_to_a_group_of_distinguished_visitors_at_Fort_Hunter_Liggett,_Calif_120615-A-XX999-111.jpg |
| gimbal-tres-cuartos.jpg | Capucha y bola del gimbal desde abajo (CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:SUAV_Raven_(1).jpg |
| gimbal-abajo.jpg | Raven checo colgado, desde abajo (CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:SUAV_Raven_(2).jpg |
| ala-planta.jpg | El ala sola: las tres piezas y sus juntas (CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:SUAV_Raven_(3).jpg |
| planta-suelo.jpg | Raven rumano sobre las mochilas, desde arriba: cola (dominio público) | https://commons.wikimedia.org/wiki/File:Romanian_RQ-11_Raven.jpg |
| et-mesa.jpg | Raven del Ejército de Tierra en una exposición (CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:RQ-11_Raven_E.T..JPG |
| ea-lanzamiento.jpg | Lanzamiento a mano en un ejercicio del Ejército del Aire (CC BY-SA 2.0) | https://commons.wikimedia.org/wiki/File:Ejercicio_SIRIO_fase_Tormenta_(13147049315).jpg |
| lanzamiento-irak.jpg | Lanzamiento en Irak (dominio público) | https://commons.wikimedia.org/wiki/File:RQ-11_Raven_2.jpg |

**Bayraktar TB2.** Medidas de Baykar (12 m de envergadura, 6,4 m de largo,
700 kg). La forma, del plano de cinco vistas de Commons (a escala con 12 m
y 6,5 m): de ahí salen las secciones del cuerpo, el carenado del ala, las
vigas a ±1,14 m, la cola en V invertida (1,04 m sobre las vigas, a 47,5°),
los soportes a 1,7 y 2,16 m y el diedro (0,27 m en la punta). El plano
tiene la pata del morro en gris, pero en las fotos en vuelo se ve fuera.
Hay 46 fotos más de Commons en `arte/uas-fuentes/bayraktar-tb2/todas/`
(con `indice.txt`).

| Archivo | Qué enseña | URL |
|---|---|---|
| plano-cinco-vistas.jpg | Plano de cinco vistas a escala, con una MAM-L y una MAM-C (Alexpl, CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar-TB2-draw.svg |
| vuelo-armado.jpg | En vuelo desde arriba, con cuatro MAM-L (ArmyInform, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2.jpg |
| arriba-ucrania.jpg | Desde arriba y detrás, en una base ucraniana: planta y cola (Ministerio de Defensa de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2_of_UAF,_2019,_01.jpg |
| detras-ucrania.jpg | Desde detrás: cola, hélice de dos palas y tren (Ministerio de Defensa de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2_of_UAF,_2019,_06.jpg |
| perfil-ucrania.jpg | De lado: viga, cola y motor (Ministerio de Defensa de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2_of_UAF,_2019,_07.jpg |
| radom-armado.jpg | TB2 polaco armado, de tres cuartos (Boevaya mashina, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:PAF_Bayraktar_TB2_at_Radom-2023.jpg |
| kiev-morro.jpg | El morro de cerca: sonda y aletas de los lados (Zinnsoldat, CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2,_Kyiv,_2019_03.jpg |
| frente-teknofest.jpg | De frente (Kingbjelica, CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:Bayraktar_TB2_S-%C4%B0HA,_Teknofest_2019.jpg |
| despegue-armado.jpg | Despegando, armado, con el tren fuera (Fuerza Aérea de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Ukrainian_bayraktar.jpg |

**Shahed-136.** Medidas de los restos y analistas (de 3,35 a 3,5 m de
largo, 2,5 m de envergadura, unos 200 kg). La forma, del plano de cuatro
vistas de Commons de Alexpl, **revisión de 2024 (3,35 m)**, a 325 px/m en
el PNG de 1920 px (dibuja un Geran-2 de la serie M, iraní, igual por
fuera): el morro, el cuerpo de 0,29 m, el borde de ataque (1,34 m hacia
atrás por metro de envergadura), el corte del motor, los elevones, las
winglets (+0,21 / −0,235 m) y los Pitot. La primera maqueta se hizo con la
versión de 2023 (3,5 m: morro 0,19 m más largo y borde de ataque de 1,5 m
por metro) y se rehízo el 30-sep-2026. En los dos planos, la vista de
perfil no cuadra del todo con la de planta (la cola, ~0,1 m); manda la
planta. El color, de las fotos al aire libre
del desfile de Teherán (en las exposiciones, con luz cálida, parece beige).
Hay 30 candidatas de Commons en `arte/uas-fuentes/shahed-136/candidatas/`
(con `info.json`).

| Archivo | Qué enseña | URL |
|---|---|---|
| plano-cuatro-vistas.jpg | Plano a escala de cuatro vistas, revisión de 2024 (Alexpl, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Shahed-136-335-250draw.svg |
| plano-dia.jpg | Planta, perfil y panza con sus partes (DIA, dominio público) | https://commons.wikimedia.org/wiki/File:Shahed-136_(Geran-2)_drawing_by_Defense_Intelligence_Agency.jpg |
| desfile-teheran.jpg | De lado, en un desfile en Teherán, 2023 (Meghdad Madadi, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Military_equipment_displayed_for_the_44th_Iranian_revolution_anniversary_rally_-_Shahed_136.jpg |
| expo-lado.jpg | De lado con el motor al aire, Kermanshah (Behrouz Ahmadi, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(018).jpg |
| expo-detras.jpg | Desde detrás: motor, hélice y elevones, Kermanshah (Yahya Biabadi, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(033).jpg |
| expo-frente.jpg | De frente, Qom (Mohammadreza Jabbari, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Qom_(33).jpg |
| motor-md-550.jpg | Motor MD-550 recuperado en Ucrania (Zenwort, CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:MD-550_Shahed-136_20260702_122912cr.jpg |
| mercer-street-winglet.jpg | Winglet en el Mercer Street, 2021 (CENTCOM, dominio público) | https://commons.wikimedia.org/wiki/File:29-30JULY2021_Drone_Attack_on_MT_Mercer_Street_-_Vertical_Stabilizer.jpg |

**Geran-2.** La forma de detrás es la del Shahed (misma maqueta). El morro
y el borde de ataque, del plano de Alexpl del Geran-2 de 2025 (3,35 m, a 325
px/m, igual que el del Shahed): morro 0,19 m más corto, cuerpo de 0,29 m,
borde de ataque 1,34 m hacia atrás por metro de envergadura, que llega a
la misma punta. El panel CRPA, del mismo plano (x = 0,57 m, a 2,19 m del
morro). El negro, de las fotos de restos de la Policía Nacional de Ucrania.

| Archivo | Qué enseña | URL |
|---|---|---|
| plano-2025.jpg | Plano a escala del Geran-2 de 2025, en negro, con variantes del panel GNSS (Alexpl, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Geran2-335-250-2025.svg |
| vinnytsia-negro.jpg | Geran negro caído en Vínnytsia, 2024 (Policía Nacional de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Remains_of_Shahed_drone_in_Vinnytsia_Oblast,_2024-03-18_(01).jpg |
| sumy-negro.jpg | Geran-2 negro con artificieros, Sumy, 2024 (Policía Nacional de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Shahed_drone_in_Sumy_Oblast_(2024-10-17)_01.jpg |
| chernihiv-hielo.jpg | Sobre el hielo del embalse de Kiev, 2026 (Servicio de Emergencias de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Remains_of_Shahed_drone_in_Chernihiv_Oblast,_2026-02-19_(01).jpg |
| kiev-winglet.jpg | Winglet con ГЕРАНЬ-2 y elevón con НЕ БРАТЬСЯ, Kiev, 2022 (GUR, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Remains_of_a_downed_Geran-2_drone_in_Kyiv,_2022-12-14.jpg |
| motor-vinnytsia.jpg | Motor de un Geran caído en Vínnytsia (Policía Nacional de Ucrania, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:Remains_of_Shahed_drone_in_Vinnytsia_Oblast,_2024-03-15_(01).jpg |
