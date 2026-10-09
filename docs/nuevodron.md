# Nuevo dron: de la nota de Obsidian al dron publicado

Todo lo que hace falta para añadir un dron al Hangar de UAS de
hegoimarquez.com y que quede **igual que los que ya hay**: nota en la
bóveda, maqueta en HD, pixel HD, miniaturas, ficha en `/uas/<slug>` y
publicación. Se usa con `/nuevodron` (`.claude/skills/nuevodron/`).

**Cómo se usa este documento**

- Para hacer un dron **solo se lee este documento**. `docs/hangar-de-uas.md` y
  `docs/uas-hd.md` son el archivo histórico (de dónde sale cada regla): no
  se abren salvo que el usuario lo pida o para afinar este documento.
- **Este documento solo cambia cuando el usuario lo marca.** Si durante un
  dron sale algo que debería entrar, se le propone al final, en el chat, y
  él decide. No se añade nada por cuenta propia.
- Va en **fases** (abajo). El usuario dice en el `/nuevodron` qué fases
  quiere y en qué centrarse («solo la nota», «empieza por la maqueta», «céntrate
  en el gimbal»): se hace eso y se para. Sin indicación, se hacen en orden y
  se para al final de cada fase para que la vea.
- Lo que va pasando con ese dron (decisiones, medidas, lo probado y
  descartado, qué falta) va en **su diario**, `docs/drones/<slug>.md`, no
  aquí. Ver «El diario del dron».

| Fase | Qué sale | Dónde |
|---|---|---|
| 1. La nota | Nota del dron en borrador | Bóveda |
| 2. Fuentes y fotos | Fotos, avión de las marcas, `FUENTES.md` | `arte/uas-fuentes/<slug>/` (fuera de Git) |
| 3. La maqueta HD | `src/data/uas/<slug>.ts` con forma, color, marcas, partes | zodk-web |
| 4. El pixel HD | Pixel del visor, tarjeta y planta | zodk-web |
| 5. En la web | Importada, probada, capturas | zodk-web |
| 6. Revisión del usuario | Fallos analizados con fotos y corregidos | zodk-web |
| 7. Cierre | Commit, push (cuando lo pida) | Los dos repos |

## Cómo trabajar con el usuario

Vale para todas las fases.

- Todo en castellano y en llano. Comentarios del código cortos (qué hace y
  por qué), sin fechas.
- **Git a mano.** `commit` y `push` son órdenes separadas («commit push» =
  las dos). Enseñar `git status` / `git diff` antes de commitear. **El push
  a `main` publica la web**: nunca sin que lo pida.
- **No escribir en la bóveda sin permiso explícito** para eso en concreto.
  Una sugerencia de pasada no es permiso. La nota nueva del dron sí se
  escribe (es el encargo), pero no se tocan otras notas (glosario,
  armamento, notas de otros drones) sin pedirlo: se propone en el chat.
- **No ampliar el alcance**: nada de «mejorar de paso» lo que no ha pedido.
  Si algo existente parece necesitar cambio, se avisa y se pregunta.
- **Los assets que entrega se usan tal cual** (fotos, PNG, dibujos): nada de
  recortar, limpiar ni escalar si no lo pide.
- Confía en el criterio técnico para el **cómo**: no darle menús de
  disyuntivas técnicas. Se le pregunta solo lo que tiene consecuencias
  visibles y no está ya fijado aquí, con una recomendación.
- **Capturas**: en vista previa (`SendUserFile` con `display: "render"`). Si
  son varias, juntas en **una sola página HTML** (base64, fondo oscuro,
  rótulo por fila, foto y render lado a lado). Decir qué es cada una.
- **Opciones visuales** (cuando pide «varias opciones» o «cúrratelo»):
  montadas en la página real en localhost con un panel temporal de botones
  (abajo a la derecha, solo con `import.meta.env.DEV`, recordando la
  elección en `localStorage`). Al elegir, se quita el panel y el código de
  pruebas antes del commit.
- Si algo nuevo es **visual y admite varias lecturas** (un dibujo, un punto
  de vista), preguntar antes de dibujar o enseñar un boceto.
- Si dice «como estaba» o «la original», se vuelve a la última versión
  buena (`git show HEAD:archivo`) y se aplica solo el cambio pedido.
- Después de aplicar cambios, el resumen va corto.

## El diario del dron

`docs/drones/<slug>.md`, uno por dron, en Git (es lo único que ve también el
PC con Linux). Se crea al empezar y se actualiza **en cada paso**, como parte
del paso. Lleva:

- **Dónde estamos**, arriba: fase, qué está hecho, qué falta, qué está sin
  commitear y el siguiente paso.
- **Decisiones del usuario** (qué avión da las marcas, qué carga, qué
  versión), con la fecha.
- **Fuentes**: la tabla de fotos (archivo, qué enseña, autor y licencia,
  URL), copiada del `FUENTES.md` de fuera de Git, para poder bajarlas en
  otro ordenador. De dónde salen las medidas.
- **Registro**: lo hecho en cada vuelta, lo probado y descartado, y lo visto
  y sin hacer.

Al retomar un dron, se lee este documento y su diario, nada más.

## Antes de empezar

1. En `~/Documents/zodk-web`: `git pull`, `git status` y rama. **Un dron
   nuevo va en `main`**: el importador se niega fuera de `main`. Como el
   push a `main` publica, no se hace push hasta que el usuario dé el dron
   por bueno; si mientras tanto hace falta publicar otra cosa, avisar de
   que el dron a medias saldría también.
2. En la bóveda (`~/Documents/boveda-osint`), `git pull` y `git status`.
3. **Preguntar solo lo que no está fijado**: qué versión del dron (si hay
   varias, como el Raven de gimbal o de cámaras fijas), **qué avión
   concreto** da las marcas y **con qué carga** va. El usuario puede dejar
   elegir el avión («te dejo trabajando»); entonces se elige el que tenga
   más fotos de los dos lados.
4. **Ya decidido, no se pregunta**: el dron va **montado como en vuelo**
   (alas desplegadas, hélices puestas; nada plegado ni en la mochila), en
   HD con estilo C, botón «Maqueta | Pixel», partes con letras, vistas y
   modo Pixel como en los demás, pixel HD a 1 px. País = el del fabricante.
5. `npm run dev` en marcha (`localhost:4321`, no `127.0.0.1`). Antes de
   arrancarlo, `lsof -nP -iTCP:4321 -sTCP:LISTEN` y cerrar ese proceso si lo
   hay (`kill <pid>`): si el 4321 está ocupado, Astro arranca en el 4322 y
   el navegador sigue viendo el viejo.

## Fase 1. La nota en la bóveda

En `02 - Temas/Hangar de UAS/`. Modelos: la nota del Bayraktar TB2 y la del
MQ-9 Reaper. La plantilla `00 - Meta/Plantilla UAS (Templater).md` da el
esqueleto, pero **tiene viejos el formato de las fuentes y le falta la fila
«Despegue»**: manda lo de aquí.

**Archivo**: la bandera y el nombre, `🇺🇸 Skydio X10D.md`. El `titulo` (sin
bandera) da la dirección: `Skydio X10D` → `/uas/skydio-x10d`, y **tiene que
coincidir con el nombre de la maqueta** (`src/data/uas/skydio-x10d.ts`).

**Frontmatter**, el de todas las notas, en este orden y sin claves propias:

```yaml
---
titulo: Bayraktar TB2
tipo:
  - analisis
autor:
  - hegoi-marquez
estado:
  - borrador
creado: 2026-09-29
actualizado: 29-09-2026 18:38
publicar: true
tags:
  - turquia
  - dron
---
```

- `estado: borrador` y se queda así: **la nota la revisa y la pasa a
  `completa` el usuario**. No preguntarle si se pasa.
- `tags`: solo el **país del fabricante** y `dron`. Nunca los países que lo
  operan.
- Sin línea en blanco entre el `---` de cierre y el cuerpo.

**Cuerpo**, sin reglas `---` entre apartados y con una línea en blanco antes
de cada `##`:

- **Una cita `>`** justo debajo, sin título: un párrafo con qué es, quién lo
  fabrica y para qué se usa. **Sin enlaces.** `==resaltado==` para lo clave. Si las cifras son del
  fabricante, un aviso ⚠️ en un párrafo aparte.
- `## Visor` con `*Aquí se inserta el visor creado para el blog*` (en la web
  se cambia por el visor).
- `## CARACTERÍSTICAS`: tabla de dos columnas, filas en negrita, en este
  orden:
  - **País**: con la bandera delante (`🇹🇷 Turquía`). Siempre el **país del
    fabricante oficial**, lo opere quien lo opere. Lo usa el filtro de
    `/uas`.
  - **Fabricante**, **Operador** (aquí van los países que lo usan).
  - **Categoría**: sale en las tarjetas, hasta la primera coma («Dron armado
    MALE»).
  - **Situación**, **Primer uso en combate**, **Envergadura / longitud /
    peso**, **Alcance**, **Carga**, **Motor**.
  - **Despegue**: RATO desde una rampa, desde pista con tren, a mano, VTOL…
    o «No publicado».
  - **Origen**, con `[[…]]`.
  - Lo que no se sepa: «No publicado». Lo que solo dice el fabricante:
    «(fabricante)». En una tabla, el alias de un enlace va con la barra
    escapada: `[[🇹🇷 MAM-L\|MAM-L]]`.
- `## Historia`: **solo el origen**: quién lo hizo, de dónde sale, por qué
  nace y cómo llega a su primer uso. Uno o dos párrafos, sin balance de
  derribos ni de uso reciente. Se cuenta como un relato que se lee de
  corrido, con frases de largo normal. **Ni informe técnico ni redacción de
  colegio.**
- `## Especificaciones y Uso`: todo lo demás, **en párrafos sueltos, sin
  subtítulos**: diseño y prestaciones, carga y cámaras, versiones y
  variantes, cómo se maneja y se emplea, hitos y contra qué se usa. Amplía
  la tabla, no la repite; las cifras del texto, solo las que hacen falta.
- **Enlaces en el texto: pocos**, solo donde el lector querrá comprobar algo
  (una cifra discutible, un hito, el vídeo del primer derribo). Lo demás se
  apoya en `## Fuentes`. Los balances del tipo «en 2024 llevaba tantos
  derribos» solo van si definen al dron, no por defecto en todos.
- `## En acción`: tuits embebidos (`![](https://x.com/…/status/…)`), de este
  dron y no de sus variantes (buscar `"x.com" <dron>`). Si no se encuentra
  ninguno, la sección no va y se dice. x.com no deja leer los tuits; para
  ver el texto, la fecha y si lleva vídeo de cada candidato:
  `curl -s "https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a"`
  (JSON con `text`, `created_at` y `mediaDetails[].type`: `video` o
  `photo`).
- `## Fuentes`: una línea por fuente,
  `* **Medio**, mes año - Título real ([fuente](url))`:
  - el medio en negrita, con el nombre que use el usuario;
  - el título real, en su idioma, no un resumen;
  - primero las webs sin fecha (Wikipedia, ficha del fabricante), sin mes
    ni año: `* **Wikipedia** - Título ([fuente](url))`;
  - después, de la más antigua a la más reciente;
  - si no se encuentra la fecha de algo que la tiene, no se inventa: se deja
    sin ella y se avisa.

**Fuentes de la nota**: **varias e independientes**, cada cifra en al menos
dos cuando se pueda. Think tanks (CSIS, RUSI), inteligencia ucraniana (GUR),
medios especializados (Infodefensa, Militarnyi, Defense Express, The War
Zone, Naval News, Army Technology), agencias y prensa general, la web del
fabricante, los medios que visitan la fábrica. drone-warfare.com y
Wikipedia sirven para orientarse, no como base.

**Cómo se escribe**:

- Castellano llano, como lo contaría una persona. Nada de calcos del inglés
  («el tipo», «la plataforma», «capacidades»), frases de resumen ni giros
  grandilocuentes («se puede perder sin gran drama»). Se dice «el dron» o
  su nombre.
- Nombrar los hechos (qué se atacó, cuándo) en vez de resumirlos.
- Decir siempre lo que solo afirma el fabricante.
- **Carga útil no es cabeza de combate.** Si la ficha solo da la carga útil
  máxima, se dice eso y que no se publica cuánto es explosivo.
- Cuando dos fuentes dan cifras distintas (autonomía, velocidad), se ponen
  las dos con su atribución y la tabla se queda con la del fabricante.
- Comillas latinas «», raya pegada para los incisos (`—así—`). Las fotos,
  con su pie en cursiva en la línea siguiente.

**Nombres que se enlazan solos**: en la web, la primera vez que sale un
término del glosario o una munición del armamento lleva su tarjeta (y otra
vez la primera vez en la tabla), pero **solo si está escrito igual que en su
nota**:

- Términos: tal cual los pone `Glosario y Terminología.md`, con las siglas
  en mayúsculas («MTOW», «jamming», «RATO», «SATCOM»; no «peso máximo al
  despegue» ni «interferencia»). La categoría, «Dron armado MALE», no «MALE,
  de media altitud y gran autonomía». En tablas, término siempre; en el
  texto corrido, con mesura.
- Municiones: el nombre de su nota en `Hangar de UAS/Armamento/`, su
  designación o su nombre («AGM-114 Hellfire», «AGM-114», «Hellfire»;
  «GBU-38», no «GBU 38» ni «bomba JDAM de 500 libras»).
- Si hace falta un término o una munición que no está, **se propone** añadirlo
  a su nota, en vez de explicarlo en la del dron (ver «Si el dron trae algo
  nuevo»).

**Variante de un dron ya hecho** (el Geran-2 del Shahed): nota aparte con su
país (el del fabricante), su historia y sus fotos; en «En acción», solo
vídeos de esa variante. La maqueta importa la del original y cambia lo que
cambie (ver fase 3).

## Fase 2. Fuentes y fotos

**Qué buscar**: fotos en alta del dron real **montado**, de **un avión
concreto** para las marcas, y de todos los ángulos: de perfil, desde arriba
(la planta), desde abajo, de frente, de detrás, y de cerca de las piezas
pequeñas (cámara, tren, tomas, mandos, armas). Si hay medidas oficiales
(ficha del fabricante o del ejército), se apuntan: dan la escala.

- Wikimedia Commons: mirar las categorías del dron (dominio público de los
  ejércitos, CC BY / CC BY-SA). Commons solo sirve miniaturas de tamaños
  fijos (1920, 3840) y corta con un 429 si se bajan originales seguidos:
  **bajar despacio**.
- Planos a escala de Commons (los de Alexpl): sirven para empezar, pero
  **pueden estar mal** (el del TB2 colocaba mal el ala y abría de más las
  vigas). Mandan las fotos. Un dibujo de tres vistas de una web
  («not to exact scale») es una ilustración: solo para confirmar piezas.
- Renders o dibujos que no se parecen: fuera. Si el dron **solo tiene
  renders** (aún no ha volado, como el Wildfire), se usan los originales del
  fabricante (las copias de otros medios son los mismos, peores).
- Si el usuario pasa fotos suyas, se guardan como `usuario-*` y se usan tal
  cual.
- Para elegir entre muchas, una hoja de contactos con ffmpeg (`tile=9x9`).

**Dónde se guardan** (fuera de Git): `arte/uas-fuentes/<slug>/`, con las
grandes en `full/` y un `FUENTES.md` (archivo, miniatura, qué enseña, autor
y licencia, URL). Si son muchas, un `indice.json`. La tabla se copia al
diario del dron.

**Leer la forma** antes de modelar, y apuntarlo en el diario: planta,
perfil, dónde va cada pieza, **el color real** (de fotos al aire libre: con
la luz cálida de una exposición, un gris parece beige), y qué se ve y qué es
supuesto.

**Una foto puede engañar**: en vuelo, un ala tapa el pilón; desde un lado,
una pieza central parece ladeada; con gran angular, los bordes se deforman;
en un dron colgado o apoyado, el ala se dobla. **Cada medida, con otra foto.**

## Fase 3. La maqueta HD

**Calidad antes que rapidez**: no se enseña una versión rápida para que el
usuario la corrija. Si no se le está corrigiendo, la primera versión es
mala: hay que hacer varias vueltas contra las fotos antes de enseñar nada.

**De los drones hechos se aprenden los fallos, no se reciclan sus piezas**:
cada dron se mide desde sus propias fuentes. (Excepción: una variante, que
importa la maqueta del original.)

### El archivo

`src/data/uas/<slug>.ts`: **solo datos**, con el tipo `Maqueta` de
`src/data/uas/tipos.ts` (ahí está comentado qué hace cada campo de cada
pieza). Para empezar, copiar la estructura de la maqueta más parecida:
`bayraktar-tb2.ts` o `mq-9-reaper.ts` (avión con tren), `shahed-136.ts` (ala
en delta, con catapulta), `rq-11-raven.ts` (pequeño, de mano),
`skydio-x10d.ts` (multirrotor), `wildfire.ts` (solo renders). La estructura,
no las piezas.

- Los imports de valor llevan `.ts` (`import { bandera } from
  "../banderas.ts"`): los generadores de `arte/` leen estos archivos con Node.
- **Ejes**: x hacia la punta del ala derecha, y arriba, z hacia el morro.
  **La maqueta va en espejo** respecto al avión: el ala izquierda de verdad
  es la de **x positiva**. Al encajar fotos con el signo cambiado, nada
  cuadra (la cámara sale por detrás o por debajo).
- **Se escribe en metros** y al final se pasa a unidades con una función
  `aUnidades` (1 unidad = `ESCALA` m), que tiene que pasar **todos** los
  números de cada punto y de cada sección (`q.map(u)`; con `panza` se
  olvidó una vez). Las unidades, del orden de 2-3 de envergadura (la cámara
  ve hasta 50): MQ-9 y Wildfire 7,8 m por unidad, TB2 4,5, Raven 0,5, X10D
  0,25. Con `escala` los drones salen a escala entre sí.
- Campos de la maqueta: `nombre`, `subtitulo`, `pais: bandera("US")`,
  `piezas`, `partes`, `fuentes`, `escala`, `resalte: "tinta"` (en drones
  claros; en los oscuros, papel por defecto), `hd: true`,
  `contornoPixel: true`, `detalles: { calcas, costuras }`, `vistaTarjeta`,
  `desfaseLuz` y, si hace falta, `plantaLisa`, `plantaDoble`, `plantaSin`,
  `catapulta` (ver más abajo cada uno).
- **País nuevo**: una entrada en `src/data/banderas.json` (dibujo de 11x7,
  paleta, emoji y, si hace falta, una `nota`), y sale igual en todas partes.

### 1. Modelar bien el dron (lo más importante)

**Medir, nunca a ojo.** Dos herramientas, en `arte/` (en Git):

- **Foto de perfil nivelada y a escala**: girar la foto hasta que morro y
  cola queden a la misma altura, escalarla con una medida oficial (el largo)
  y leer el lomo y la panza cada pocos centímetros sobre una rejilla en
  metros. El ancho y la sección, de una foto de frente con teleobjetivo.
- **Fotos encajadas** (lo normal desde el TB2): `arte/encajar-camara.mjs
  <ajuste.json> [salida.png]`. En el json, la foto y puntos que se
  reconocen en ella, `[x, y, z, px, py, "nombre"]` en metros de la maqueta.
  Encaja la cámara (acimut, elevación, giro, distancia, campo), da el error
  de cada punto y pinta la silueta de la maqueta en rojo y las juntas en
  amarillo. Un punto `"medir:z"` (o `x`, `y`) no encaja: dice dónde cae su
  píxel con esa coordenada fija; `"medir:superficie"` lo lleva a la
  superficie de la maqueta. En fotos muy cercanas (a 2-3 m), `dMin` en el
  json (por defecto 4 m). `fijo: { cabeceo: 15 }` fija un ángulo. Los json,
  junto a las fotos (fuera de Git).
- **Lo que vale y lo que no al medir**:
  - Medir a lo largo de la vista no sirve (una z en una foto de frente).
  - Los anchos, con fotos ancladas a medidas a la misma profundidad (la
    envergadura). Una foto con una sola referencia de ancho da anchos poco
    fiables.
  - Fotos de cerca con casi todos los puntos en el eje no fijan la cámara:
    hacen falta puntos de las puntas del ala.
  - Pocos puntos seguros mejor que muchos dudosos (esquinas tapadas por un
    cartel o un lanzador, leídas mal).
  - De un anillo visto desde arriba se ve su **borde de arriba**, no su
    centro.
  - **Si el error de una foto pasa de unos 8 px**, sospechar de lo que vino
    del plano y mover esos puntos: el plano puede estar mal (así salió el
    ala del TB2, 10-20 cm mal).
- **Comparar con un plano a escala en ortográfica**:
  `arte/superponer-plano.mjs` (modelo, vista, plano, origen y píxeles por
  metro) proyecta los triángulos de la maqueta sobre el plano en rojo a
  medias. El visor tiene perspectiva y engaña con lo que sale del plano.
- **Cuando no hay medidas** (solo renders) o las fotos son de muy cerca (las
  del usuario con el móvil), se puede encajar a la vez varias fotos y los
  puntos 3D con los scripts de Python de `arte/uas-fuentes/wildfire/hd/` y
  `arte/uas-fuentes/skydio-x10d/hd/tools/` (numpy, scipy, OpenCV). Están
  **fuera de Git, solo en el Mac**, y solo se usan si
  `encajar-camara.mjs` no basta.

**La forma**:

- **El cuerpo, de una pieza continua** (`casco`), no de tubos ni cajas
  sueltas («demasiado cuadrado»). Secciones medidas a lo largo de z; bastan
  pocas bien medidas. Las góndolas, carenados, lomos y tomas **salen del
  cuerpo** (`lomo`, `hombro`, `nLomo`, `pLomo` en la sección), no van
  posados encima: con piezas aparte quedan con cintura.
- **Las líneas donde la luz cambia de golpe en varias fotos son aristas
  vivas** (la del costado del MQ-9): `panza` y `arista` en la sección. No
  redondearlas: el dron parecería de juguete.
- **Alas, cola y aletas, medidas con el mismo cuidado que el cuerpo**:
  borde de ataque, borde de salida, cuerda en la raíz y en la punta, grueso,
  diedro, y el punto y la altura de donde nacen.
- **El dron no es una sola pieza**: flaps, alerones, elevones y timones
  aparte, con su hueco (unos 6 mm) y el grueso del ala; el tren con sus
  piezas; tomas y salidas de aire. **Lo que en las fotos son piezas
  separadas se deja separado** (la panza del Raven); si al separarlas sale
  un fallo de pintado, se arregla de otra forma (más estrecha, otra
  forma), nunca fundiéndolas.
- **Partes de un mismo cuerpo que se unen** (la «Y» de detrás del X10D): en
  la misma pieza, con secciones que crecen. Con piezas pegadas salen
  aristas y picos.
- **Una pieza se coloca y se mide con varias fotos de ángulos distintos**,
  nunca con una sola (el escape del MQ-9 salió ladeado por una foto
  sesgada).
- **La toma de aire del motor va una, en el centro, arriba**, con su boca
  delante y su salida detrás: buscarlas en todas las vistas. Que una foto o
  un render la enseñe a un lado no quiere decir que vaya a un lado (pasó en
  el MQ-9, el TB2 y el Wildfire). **Antes de poner una pieza en pareja,
  trazar en la foto la línea del eje** (morro, cono, piezas del centro) y
  ver si cae encima.
- **Nada flotando**: armas pegadas a sus lanzadores y soportes, lanzadores
  a sus pilones, aletas al cuerpo. Comprobarlo de frente y de lado. Una
  bomba en el ala izquierda se coloca con la distancia al centro, no con la
  x negativa (las MAM-L del TB2 colgaban 20 cm por el diedro al revés).
- **No inventar piezas** (escapes a los lados, antenas, juntas) ni
  **dibujar sombras como si fueran forma**. Lo que no se ve en ninguna foto
  no se pone; lo que se pone sin verlo va como `reconstruccion` en su parte.
- **Sin escalones en alas gruesas** (dos estaciones en la misma x): el
  perfil no casa a los dos lados y sale una línea que parpadea a lo largo
  del ala. Mejor que el borde pase poco a poco.
- **Si al comparar algo está claramente mal, se arregla** aunque el usuario
  no lo haya señalado.
- **Piezas que se mueven** (gimbal, alerón): la foto no basta para saber
  dónde va un detalle; enderezar una donde esté quieta y, si sigue dudoso,
  enseñar un boceto antes de rehacer la pieza.

**Las piezas** (todas comentadas en `tipos.ts`; las de geometría, en
`src/scripts/uas-geometria.ts`):

| Pieza | Para |
|---|---|
| `casco` | El cuerpo: secciones `{z, ancho, arriba, abajo, cintura, n, nAbajo}` unidas con curvas suaves. `panza` y `arista`: arista viva. `lomo`, `hombro`, `nLomo`, `pLomo` (norma de la unión, 8 por defecto; 4 funde más; 12 si abomba): lomo o góndola fundidos. `costado`, `costadoArriba`, `sobreArista`, `bajoArista`, `bordeArriba`, `bordeAbajo`, `redondeo`, `nariz`: ala que nace del cuerpo sin escalón (el TB2). `suave`: quita las líneas de las uniones. `tomas`: tomas sumergidas (`Toma`). `abierto`: sin tapa delante (un capó con boca). `polo`: punta redonda sin hoyuelo de luz. `x`: desplazado del eje (un misil bajo el ala). |
| `ala` | Perfil NACA, estaciones `[x, z borde de ataque, z borde de salida, grosor, subida]` de la raíz a la punta (la subida, el diedro). `raizDentro`: nace dentro del cuerpo, sin tapa. `sola` y `vertical`: aletas o soportes con perfil. Si la primera estación no está en x = 0, salen dos piezas sueltas (puntas con su junta, como el Raven). |
| `placa` | Placas planas. Horizontal con `simetrica` y `bisel` (el bisel la hace crecer hacia fuera lo que mide: encoger antes el contorno lo mismo y no pasar de la mitad del grosor más fino). Vertical con `inclinacion` (colas en V, winglets) e `y` (aletas en X alrededor de un misil: cuatro placas a 45, −45, 135 y −135). |
| `tubo` | Cuerpos de revolución (misiles, bombas). Puntos `[z, medio ancho, sube, medio alto]`. **No tiene `espejo`**: un misil bajo cada ala se monta dos veces, con `x` y `-x`. |
| `viga`, `prisma`, `pila` | Piezas de caras planas: brazos de multirrotor, cajas de sensores (`prisma` con `eje: "z"`), patas que se afinan. |
| `varilla` | Antenas, mástiles, varillas de mando. `lados: 32` para cilindros grandes. |
| `caja`, `disco` | Cajas con `redondeo`; discos (luces, objetivos, cámaras). |
| `helice` | `radio`, `palas`, `eje: "y"` en multirrotores, `ancho` (palas con forma), `punta` (afiladas), `forma`, `tramo` (puntas de otro color), `inversa`, `paso`, `buje: 0` (sin bola si la tapa un cono), `giro` (que una pala asome y no quede escondida bajo el ala). |
| Cualquiera | `acabado`, `girar` (alrededor de una recta), `espejo` (repite en −x). |

Si a una forma le falta algo, **se amplía la pieza en el motor** (y se
comenta en `tipos.ts`) en vez de aproximarla con piezas sueltas; los
drones que ya existen tienen que salir igual.

### 2. Color

- **El color real del dron**, con varios tonos si las fotos los muestran
  (pintura, metal, piezas negras, cristal). Cada dron suele llevar su
  acabado propio (`gris-tr`, `gris-et`, `crema-ir`, `gris-x10`…): con el
  gris de otro sale azulado o claro de más.
- **Se mide**: luminosidad y color de la foto en zonas al sol, en el costado
  y bajo la arista, y del render en los mismos puntos desde el mismo
  ángulo, hasta que cuadren (por ejemplo, al sol en la cara de arriba:
  render #d9dfe3, fotos #dbe4e7). Las diferencias de luz de una foto a otra
  son de la foto.
- Un acabado nuevo va en cuatro sitios: `Acabado` (`tipos.ts`), `PALETAS`
  (`src/scripts/uas-paletas.ts`, cuatro tonos), los materiales del HD
  (`src/scripts/uas-hd.ts`: color, metal, rugosidad) y `COLOR_MAQUETA`
  (`src/scripts/visor-uas.ts`).
- **Un dron negro**: negro neutro y muy mate (el `negro` sale azulado; el
  MICH, `negro-ua` #1c1d1d con rugosidad 0,82). Con poca rugosidad refleja
  el cielo y desde arriba sale gris. Las costuras, con `claro`.
- **Cambios de color o de luz, grandes y comprobados** lado a lado: los
  pequeños «ni se notan». Si un comentario admite dos lecturas («tiene un
  punto azulado»), se pregunta o manda la foto de referencia (se
  interpretó al revés una vez).

### 3. Luz

La luz la pone el visor y **no se toca por dron**: sol casi encima (la parte
de arriba al sol, sin manchas de sombra; costados y panza más oscuros),
cielo de reflejos y teleobjetivo de 18°. Desde abajo el dron sale oscuro, y
así se queda. **En la maqueta no se pintan sombras ni degradados** copiados
de una foto: solo forma y pintura (lo negro de verdad, como la boca de un
conducto, es un hueco: acabado `hueco`).

### 4. Marcas, costuras y tornillería

En `detalles` de la maqueta, **al final y sobre la forma definitiva**. Solo
en HD.

- **Calcas** (`Calca`): se proyectan sobre las piezas `sobre` desde
  `desde`, centradas en `en`, de `tam`. Las marcas reales **del avión
  elegido**: escarapela, letras de la base, número de serie, escudos,
  banderas, logos, avisos, etiquetas, cinta. Si no hay un dibujo que sirva,
  se añade uno nuevo a `Dibujo` (`tipos.ts`) y a `uas-hd.ts`. Una calca solo
  cae en una pieza: si cruza una junta, una a cada lado. Las calcas iguales
  comparten textura. Sobre una pintura muy mate, la calca va igual de mate.
- **Costuras** (`Costura`): líneas de panel, tapas y juntas llevadas a la
  superficie, con `remaches` (cada tantas unidades) o `enVertices` (tapa:
  esquinas y centros de los lados). Finas: línea clara y transparente,
  tornillos de 1,3 px. Los tornillos que se miran de cerca, mejor como
  calcas `disco` (crecen con el zoom).
- **Solo lo que se ve en fotos de cerca.** Lo que es una sombra o no se
  distingue, no se dibuja. Sin juntas de paneles en el ala si no están en
  las fotos («varicela»).
- Sobre piezas blancas o claras, **pocos detalles y grandes**: el filete de
  tinta del HD vuelve rayas gruesas los finos.
- Si el usuario pregunta si lleva tal insignia, se mira en todas sus fotos
  antes de contestar.

### 5. Cámaras y armamento

- **La óptica con su forma real**: cuerpo, cara, ventanas, cristal (algo
  verdoso), soporte (horquilla, brazo), pegatinas.
- **Las armas, del arma de verdad**, no del render ni de la foto del dron:
  se buscan fotos y medidas de la munición (maquetas 1:1 en ferias, cortes,
  fichas oficiales) y se escribe en metros reales. Del dron solo sale cómo
  va colgada. Con sus lanzadores, soportes y ganchos, pegadas.

### 6. Accesorios: catapulta, rampa, cohete

Si el dron despega de un lanzador y el usuario lo pide: `catapulta: {
piezas, cabeceo }` en la maqueta. El visor pone el botón «Catapulta» en la
tira de vistas (después de «3D») y, al pulsarlo, enseña esas piezas e inclina
el dron `cabeceo` grados morro arriba (`?catapulta=1` en la URL). Las piezas
van en los ejes del dron y no cuentan para siluetas, tarjetas ni naves.

- **Todo lo que es del accesorio va en el accesorio** (los patines de la
  catapulta del Shahed salían en el dron como barras negras).
- El cabeceo, encajando una foto del dron en su lanzador.
- Lo que pide «aproximado, inventado» (el cohete) tiene que verse **unido y
  paralelo** a lo que lo sostiene; colgado de varillas finas parece suelto.
- Sus partes llevan `catapulta: true` (la chincheta solo sale con la
  catapulta puesta y elegirlas la pone).

### 7. Partes y fuentes del visor

- **`partes`**: 5 a 8 (más si hay catapulta), en el orden de las letras.
  Cada una: `nombre`, `en` (dónde va la chincheta), `piezas` que resalta,
  `respaldo` (`foto`, `reconstruccion` o `fabricante`), `fuentes` (ids),
  `texto` y `nota` (de qué foto sale, qué es supuesto). Con solo renders, lo
  que se ve en ellos va como `fabricante` y lo que no se distingue, como
  `reconstruccion`.
- **`fuentes`**: las fotos (con `imagen`, la miniatura) y los artículos (sin
  ella). Miniaturas: `sips -Z 560 -s format jpeg -s formatOptions 72 <foto>
  --out public/uas/<slug>/fuentes/<foto>.jpg` (~50 KB cada una).

### 8. Comparar antes de enseñar

**Lado a lado con cada foto, desde su mismo ángulo, pieza a pieza**, y las
capturas se mandan junto a la foto:

- `arte/comparar-foto.mjs <ajuste.json> <salida.png> [--encima] [--pixel]
  [--zoom] [--recorte] [--sin=helice,…] [--catapulta]`: el visor en HD (o
  pixel) desde la cámara encajada, debajo de la foto o encima a medias. Usa
  `window.__visor`, que solo existe con `npm run dev`.
- `arte/vista-visor.mjs`: el visor desde una cámara cualquiera, sin foto.
- Mirar sobre todo el **contorno** (al acercar, el visor tiene mucha
  perspectiva y deforma lo que sale del plano): proporciones, dónde cruza
  el ala, secciones, carenados, tomas, antenas, cómo van colgadas las armas,
  y la luz y el color desde ese ángulo.

## Fase 4. El pixel HD

Sale solo del HD: con `hd: true`, el modo Pixel pinta en directo la escena
del HD (forma, materiales, luz, calcas) y la pasada final
(`src/scripts/uas-pixelado.ts`) la pasa a pixel art. No se dibuja nada
aparte; **un fallo del HD sale igual en el pixel**, así que primero el HD.

**Ya decidido**: 1 px por píxel, con marcas y costuras, contorno de fuera en
negro (`contornoPixel: true`), sin tramado y sin tornillos.

**Objetivos, comprobados antes de enseñar**:

1. **El mismo color y la misma luz que el HD**, desde el mismo ángulo. La
   luz va en siete escalones: la pintura al sol tiene que caer **en el
   centro de un escalón**, no en el borde, o el ala sale a franjas. Se mide
   en cuántos escalones cae la pintura al sol y se corrige con
   `desfaseLuz` (TB2 0,48, MICH 0,15, Shahed −0,2, Raven −0,5; el
   Wildfire y el X10D no lo necesitan).
2. **Marcas que se lean**: cada calca, tinta entera o nada. Comprobarlo de
   perfil y desde donde se vean.
3. **Líneas limpias**: contorno negro solo en lo que tiene tres píxeles de
   grueso o más; lo fino (el ala de frente, colas, patas), como raya oscura
   de su color. Las líneas de dentro, del tono de la pieza más oscuro,
   nunca negras.
4. **Sin ruido**: ni píxeles sueltos ni tramado.
5. **Revisión pieza a pieza** en 3D, perfil, frente y planta junto al HD, y
   de noche.

**La 2.0 está en todas partes, sin preguntar**:

- **Tarjeta de `/uas`**: `tarjeta.png` y `tarjeta-noche.png` (256x144, 1 px
  por píxel, quieta). El ángulo, `vistaTarjeta: [acimut, elevación]` en la
  maqueta (sin él, 79°, 11°, casi de perfil). Se elige el que enseñe el
  dron: con ala en delta o ala larga, de más arriba ([61, 20] el TB2, el
  Raven y el Wildfire; [65, 30] el Shahed y el MICH); un multirrotor, de
  tres cuartos con el sensor de frente ([30, 27] el X10D). Si el usuario
  elige con una captura del visor, se saca con `arte/encajar-camara.mjs`
  sobre ella.
- **Planta de la tira de la portada**: `planta.png`. Si a ese tamaño las
  marcas salen como cuadrados, `plantaLisa: true`. Un dron pequeño con
  piezas finas, `plantaDoble: true` (pinta al doble y se queda con el píxel
  más claro de cada 2x2) y, si hace falta, `plantaSin` (piezas que no
  salen).
- Las dos salen de `node arte/generar-uas-miniaturas-hd.mjs <slug>`, con
  `npm run dev` en marcha. Repetir cada vez que cambia la maqueta.
- **Nave del hero de la portada**: solo si el usuario la pide (hoy lo son
  el MQ-9, el TB2 y el Shahed). Se añade a `NAVES` en
  `arte/generar-naves-uas-hd.mjs` y a `src/data/aeronaves.ts`;
  `node arte/generar-naves-uas-hd.mjs <id>` pinta `public/zodk-<id>.png` y
  da su `ratio` y sus `luces`; la de noche, `python3
  arte/generar-naves-noche.py <id>` (el de `/usr/bin`, con Pillow). Vista E
  (90°, 28°; con un ala en delta, 42°), pintada a 260 px y vista a la mitad
  (`ancho` 132). **Nunca pintarla al tamaño de pantalla** (60 px: sale una
  cruz gris). En vuelo: sin las piezas que recoge (`quitar`; mirar las
  fuentes: el MQ-9 recoge todo el tren, el TB2 solo la rueda del morro).
  Las pruebas se enseñan a su tamaño real, no ampliadas.
- La tira de la portada lleva siempre el X10D y el MICH-2000 (`EN_HANGAR`
  en `index.astro`): no se toca.

## Fase 5. En la web

1. **Importar** (en `main`): `npm run importar`. Solo escribe lo que cambia
   y dice qué notas son nuevas. Los tuits salen de `src/data/tuits/`: no
   borrar esa carpeta.
2. **Reiniciar `npm run dev`** (no ve las notas nuevas). Si el visor no
   carga con «Outdated Optimize Dep» en la consola: parar, `rm -rf
   node_modules/.vite` y arrancar. Recargar forzando (Cmd+Mayús+R).
3. **Miniaturas** del dron (fase 4) y de las fuentes (fase 3, apartado 7),
   si no están.
4. **Probar** en `/uas/<slug>`. Atajos en la URL: `?vista=arriba|lado|frente|detras`,
   `?parte=C`, `?pestana=fuentes`, `?estilo=pixel`, `?catapulta=1`.
   Mirar: la ficha entera (nota, tabla con las banderas, términos y
   municiones enlazados), el visor en todas las vistas, en Maqueta y en
   Pixel, de día y de noche, las partes y las fuentes; la tarjeta en `/uas`
   y su filtro de país.
5. `npm run lint` y `npx astro check` sin errores nuevos. Ojo con los
   genéricos en los `<script>` de los `.astro` (en una línea).
6. **Capturas**: `node arte/capturas.mjs URL salida.png [--ir=SELECTOR]
   [--raton=SELECTOR] [--noche] [--js=CÓDIGO] [--tam=1300x900]
   [--escala=2]`. Con `--js` se pueden mandar teclas al lienzo (flechas
   giran 10°, `+` acerca):
   `--js="(()=>{const c=document.querySelector('.visor canvas');for(const k of ['ArrowUp','+','+'])c.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}))})()"`.
   La tarjeta con el ratón: `--ir=.uas-tarjetas --raton=.uas-tarjeta`.
   Recortar con ffmpeg (`crop=`) y poner al lado de la foto (`hstack`).
   Si se lanzan muchos Chrome a la vez, alguno sale sin WebGL.
7. Si se tocó el motor del visor: **consumo en Zen** (`docs/rendimiento.md`).

## Fase 6. La revisión del usuario

El usuario mira en local y señala fallos (a veces con líneas dibujadas sobre
fotos o capturas suyas: se guardan como `usuario-*` en `full/`).

- **Antes de tocar código, analizar cada fallo con fotos**: mirar sus fotos
  y las fuentes, comparar con el render desde el mismo ángulo, y contestar
  punto por punto qué está mal, **por qué** (también si es un fallo del
  motor) y cómo se va a arreglar. **Esperar su visto bueno.**
- Al corregir, medir con fotos encajadas y decir también lo que se
  encuentre de paso (sin arreglar lo que no pidió: se dice).
- No volver con una pieza que ya señaló sin haberla tocado.
- Corregir **solo lo señalado**; lo demás, igual.
- Todo, apuntado en el diario del dron (lo hecho y lo probado y
  descartado).

## Fase 7. Cierre

Cuando el usuario lo da por bueno:

1. Antes de cerrar, comprobar que la 2.0 está en todas partes (visor,
   tarjeta, planta, nave si la tiene) y que no queda nada de pruebas
   (paneles, código temporal).
2. El diario del dron al día, con «Dónde estamos: cerrado».
3. En `docs/hangar-de-uas.md`, el dron nuevo en la lista «Drones hechos»
   del principio (nombre, tipo y país, como los demás).
4. **Commit cuando lo pida**: en zodk-web (maqueta, miniaturas, fuentes,
   contenido importado, diario) y en la bóveda (la nota). Mensajes en
   castellano.
5. **Push cuando lo pida**: el de `main` en zodk-web publica.
6. Proponer en el chat, si las hay, las lecciones que deberían entrar en
   este documento. Se añaden solo si el usuario lo marca.

## Si el dron trae algo nuevo

- **Una munición que no está en el armamento**: se propone al usuario
  crearla. Va en `Hangar de UAS/Armamento/`, una nota por munición
  (`🇺🇸 AGM-114 Hellfire.md`): `titulo` «designación nombre» o solo el
  nombre si no tiene designación de EE. UU. («JSM»); el frontmatter de
  siempre; fotos con su pie (varias seguidas, con una línea en blanco entre
  ellas, salen en carrusel); tabla (País, Fabricante, Tipo, Guiado, Peso /
  longitud, Warhead, Alcance, En servicio, Lo llevan); el texto, cuyo
  **primer párrafo empieza diciendo qué es** (sale en la tarjeta); y
  `## Fuentes` como los drones. Se añade al `## Índice` de `Armamento.md`
  en su grupo. Las fotos, en `02 - Temas/Adjuntos/armamento-*.jpg`, de
  Commons con licencia libre y su crédito en el pie.
- **Un término que no está en el glosario**: se propone añadirlo a
  `Glosario y Terminología.md` (el término en inglés delante y el
  castellano detrás).
- **Un país nuevo**: su bandera en `src/data/banderas.json`.
- **Un enlace desde otra nota** (otro dron, el glosario) al nuevo: se
  propone; no se toca otra nota sin permiso.

## Decisiones que hay que respetar

- **Diseño propio**: la idea del «Airframe explorer» de drone-warfare.com,
  pero ni su diseño ni su código ni su geometría. No se usan modelos 3D de
  otros; un render de otro solo como guía de cómo es una pieza.
- **Nombres**: «el visor» (el recuadro completo, `VisorUAS`; nunca
  «tarjeta», «ficha» ni «expediente»), «Hangar de UAS» (la sección), fichas
  en `/uas/<slug>`, «munición» (no «bomba») como palabra general.
- El crédito del visor se queda igual en todos los drones, también los de
  renders: «Maqueta creada a partir de fotos públicas. Hecho con» Three.js
  y Claude Code.
- «Tinta, sin color» en el marco del visor; el único color es la bandera.
  El dron, en su color real, en la maqueta y en el pixel.
- Banderas en pixel art (`BanderaUAS.astro`), no emoji, en `/uas`, el visor
  y la portada.
- El encuadre del visor se queda como está, aunque los drones de ala larga
  salgan pequeños.
- La nota, sin claves propias en el frontmatter; el primer párrafo es una
  cita `>`, sin `## Introducción`.

## Probado y rechazado (no se reintenta salvo que lo pida)

- Cuerpos de cajas y cilindros sueltos («demasiado cuadrado»); fuselaje de
  puro sin tomas ni carenados («de bulto»).
- Juntas marcadas y exageradas («son mucho más suaves»); piezas que no
  salen en ninguna foto (el hueco de la hélice en el ala del MICH).
- Tomas de aire en pareja o a un lado cuando es una en el centro; tomas y
  góndolas posadas encima del cuerpo.
- Sombras de una foto pintadas en la maqueta («te has basado en la sombra
  de una foto»).
- Partes de un cuerpo como piezas pegadas («a trozos»).
- Biseles o cortes en una caja que no se ven claros en las fotos (la caja
  del sensor del X10D: «no merece la pena ni poner»).
- Letras y marcas de fábrica que el ejemplar elegido no lleva (las «H» y
  «V» de las alas del MICH).
- Pixel: tramado, escalones de luz en curva, líneas de dentro negras,
  calcas reducidas a gris, 2 px y 1,5 px por píxel.
- Tarjetas de `/uas` que giran o se ponen de frente al pasar el ratón.
- Sol debajo o más luz en la panza para la vista «Abajo».
- Nave del hero pintada al tamaño de pantalla o casi desde arriba.
- El `RoomEnvironment` de Three.js como entorno (quemaba a blanco); la
  penumbra de juntas con GTAO.

## Archivos

| Archivo | Qué es |
|---|---|
| `src/data/uas/<slug>.ts` | La maqueta, solo datos |
| `src/data/uas/tipos.ts` | Qué es una maqueta: piezas, acabados, calcas, partes |
| `src/data/banderas.json`, `src/data/banderas.ts` | Las banderas en pixel art |
| `src/scripts/uas-geometria.ts` | Mallas de cada tipo de pieza |
| `src/scripts/uas-hd.ts` | El HD: materiales, luz, calcas y costuras |
| `src/scripts/uas-paletas.ts` | Paletas del pixel |
| `src/scripts/uas-pixelado.ts` | El modo Pixel |
| `src/scripts/visor-uas.ts`, `src/components/VisorUAS.astro` | El visor |
| `src/scripts/uas-miniatura-hd.ts` | Tarjeta, planta y nave en pixel HD |
| `scripts/importar-notas.mjs` | Notas de la bóveda → `src/content/uas/` |
| `arte/generar-uas-miniaturas-hd.mjs` | Tarjeta y planta |
| `arte/generar-naves-uas-hd.mjs`, `arte/generar-naves-noche.py` | Nave del hero |
| `arte/encajar-camara.mjs`, `arte/comparar-foto.mjs`, `arte/vista-visor.mjs`, `arte/superponer-plano.mjs` | Medir y comparar con fotos y planos |
| `arte/capturas.mjs` | Capturas |
| `public/uas/<slug>/` | Tarjeta, planta y `fuentes/` |
| `arte/uas-fuentes/<slug>/` | Fotos grandes, `FUENTES.md`, ajustes (fuera de Git) |
| `docs/drones/<slug>.md` | El diario del dron |
| `02 - Temas/Hangar de UAS/` (bóveda) | Las notas de los drones, `Glosario y Terminología.md` y `Armamento/` |
