# Proyecto Marte — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso (lo pidió el usuario el 21-sep-2026): qué está hecho, qué no, qué está
decidido y qué queda pendiente. Leyendo solo esto hay que poder retomarlo.

## Dónde estamos (23-sep-2026, noche: PUBLICADO)

**PUBLICADO.** La rama `mars-project` se fusionó en `main` el **23-sep-2026**
(merge `b0ada47`, con `--no-ff`, a petición del usuario: "ok go") y zodk.eu
ya sirve Marte y la Luna nueva (la que gira y se acerca, ver `LUNA-WIP.md`).
Comprobado tras el despliegue: `/`, `/luna` y `/marte` responden, las
teselas se sirven y la cabecera lleva `mars-project`. La rama se deja en
GitHub como registro; lo que se siga tocando va sobre `main` o en rama nueva.

**Plan del usuario** (23-sep-2026): "terminar de agregar / corregir cosas y
finalmente hacer merge con main cuando esté listo".

**Hecho para publicar**:
- Pixel art de Marte definitivo; teselas de Marte (`public/marte/n1`-`n3`) y
  de la Luna (`public/luna/n1`-`n4`) en Git.
- Las 17 chapas de amartizaje con ficha (Lugar, Fecha, Estado, descripción y
  foto), y sus notas en la bóveda (`publicar: false`).
- Probado por el usuario en Zen y en su iPhone. Vuelto a probar en el Mac
  (23-sep-2026, noche, `npm run dev`): "se amplía bien con los dedos en el
  Mac. No parece que se caliente en exceso".
- **Filtros de las notas de Marte** (23-sep-2026, noche): las notas con
  etiqueta `marte` no salen en `/notas`, la portada (lista y banderas) ni el
  RSS, como las de `luna`; y en su página, "volver" lleva a `/marte` ("Volver
  a Marte"). Las 17 notas de misiones de la bóveda llevan esa etiqueta, y
  ninguna otra nota la usa. `npm run build` sin errores.

**Lo que faltaba para fusionar** (todo hecho):
1. Lo que el usuario quiera agregar o corregir tras repasarlo.
2. ~~Traer a la rama lo nuevo de `main`~~: hecho el 23-sep-2026, noche
   (merge `b4129f9`, sin conflictos: 2 commits de notas, "Ley de nietos" y
   eventos fronterizos; sin subir). `npm run build` sin errores (`dist`,
   403 MB: Luna 211, tweets 76, Marte 46) y capturas de la versión de
   producción: portada, `/notas` (sin notas de Marte ni de la Luna), `/luna`,
   `/marte`, "Ley de nietos" y la semana 9, bien. Si `main` recibe más notas
   antes de fusionar, repetir.
3. ~~Explicarle el merge y fusionar con `--no-ff`~~: hecho (`b0ada47`).

**Abierto, sin bloquear la fusión**: el pellizco del trackpad en Safari del
Mac (sin probar); el "salto" de detalle al cambiar de nivel de teselas (se
deja salvo que moleste); Marte de día y de noche en la portada (era la
recomendación, sin confirmación expresa); las chapas enlazan a su nota solo
cuando esté publicada (hoy, ninguna).

Lo de abajo es el registro de lo hecho, sesión a sesión.

## Registro del 23-sep-2026

**Hecho** (23-sep-2026, primera tanda):
- **Los nombres de lugares salen en `/marte`** (antes solo estaban en el
  banco): `src/scripts/nombres.js`, `marte.astro`, `global.css` y la
  letra IBM Plex Mono 500 en `Head.astro`.
- **Un accidente geográfico para cada amartizaje**: 9 nombres nuevos en
  `generar-nombres.py` (58 en total). Ver "Un accidente geográfico para cada
  amartizaje".
- **Chapas de Mars 3 y Mars 2 en `/marte`** (las del banco), con sus datos
  en `src/data/amartizajes.ts`: la bandera, la ficha al pasar el ratón y, la
  fallida, en color con una raya. Enlazan a su nota solo cuando esté
  publicada; hoy, solo ficha.
- **Arreglado: la Tierra pequeña se veía encima de Marte al acercarse**
  (usuario: "si amplías, la Tierra se sigue viendo por encima"). Ahora va
  **detrás** de Marte: al acercarse, Marte la tapa, y su enlace se desactiva
  mientras su centro cae dentro del disco (para no irse a la Tierra al
  pulsar Marte). Al alejarse vuelve a asomar y a poder pulsarse.
- Comprobado en Chrome (el de la extensión y sin ventana): nombres a partir
  de ×1,2; Nanedi Valles junto a Mars 2 y Ptolemaeus junto a Mars 3; la ficha
  de Mars 2 con la raya; la Tierra tapada al acercar y de vuelta a ×1; vuelo
  a la Tierra limpio. Sin errores en la consola.

**Probado por el usuario en Zen** (23-sep-2026): "no se calienta mucho, sube
como a 13W cuando giro pero bien". Como referencia, `/luna` quieta marcaba
~16,5 W y la portada ~27 W: los nombres y las chapas no añaden un gasto que
se note.

**Decidido hoy por el usuario** (23-sep-2026):
- **Marte NO gira solo** ("creo que me voy a decantar por que marte NO
  gire"): quieto, solo se mueve al arrastrarlo. Nada de botón play/pausa.
- **En el móvil sí: girar con el dedo y zoom pellizcando** ("en movil si que
  habria que probar que girase con el dedo e hiciese zoom").
- **Cada amartizaje, bueno o fallido, tiene que tener cerca un accidente
  geográfico con nombre** ("mete los accidentes de la tabla").
- **Las chapas del banco, a la página** ("si hay que meter los que ayer se
  quedaron en el banco de pruebas, también"), y la de los fallidos **en color
  con una raya**.

**Móvil y táctil (23-sep-2026, commiteado y subido)**, lo que el usuario aprobó
("commit push y vamos con el móvil"):
- **Un dedo gira, dos dedos pellizcan para el zoom** (hacia el punto medio).
  `touch-action: none` en `.marte-hero` (antes el navegador se quedaba el
  gesto: por eso en táctil no giraba), el pellizco en `montarZoom`
  (`marte-gl.js`, con eventos de puntero) y la mano deja de girar mientras
  se pellizca (clase `pellizcando`). En iOS se ignoran los `gesture*` si hay
  dedos, para que el zoom no vaya doble.
- **En vertical, Marte se ciñe al ancho**: `--marte-disco: min(60svh, 88vw)`
  (en horizontal no cambia nada). Los vuelos lo toman de ahí.
- **La Tierra pequeña, en vertical, va encima de Marte** pegada a la derecha
  (no cabe a su derecha).
- **Chapas en táctil**: un toque abre la ficha, tocar fuera la cierra (con la
  nota publicada, el segundo toque llevará a ella). Zona de toque de 12 px
  más por cada lado. La ficha se corre hacia dentro si se saldría de la
  pantalla, también mientras se gira con ella abierta.
- Comprobado en Chrome sin ventana haciéndose pasar por un móvil (390 × 844,
  toques de verdad): giro con un dedo, pellizco (salen los nombres y la
  Tierra queda tapada), ficha de Mars 2, vuelo portada → `/marte` (aterriza
  en el disco del móvil) y toque en la Tierra → portada. En escritorio,
  todo igual que antes. Sin errores.
- **Probado por el usuario en su móvil** (23-sep-2026): "no se calienta",
  "gira con un dedo y hace zoom pellizcando", "la ficha se abre bien", "el
  tamaño de Marte es correcto".
- **Arreglado tras su prueba**: los nombres pequeños no salían en el móvil ni
  a ×6 ("Olympus Paterae … en móvil no lo llego a ver"). Los umbrales `px`
  eran píxeles de pantalla, ajustados con el disco de 540 px de un portátil;
  con el disco del móvil (~340 px) no se llegaba. Ahora el umbral encoge con
  el disco (`escala` en `marte-nombres.js`; nunca crece), y salen al mismo
  zoom que en el portátil. Comprobado: Olympus Paterae y Korolev a ×6 en
  390 × 844.
- **Los astros en el móvil**: el usuario pidió que al pulsar la Tierra (y
  cualquier astro) se hiciera el vuelo. No se cambió nada: vuelto a probar
  en su iPhone con Safari, "ya funciona … al pulsar sobre la Tierra viaja (y
  al resto de astros)".

**Chapas de todas las misiones (23-sep-2026, EN CURSO)**. Decidido por el
usuario ("Vale, vamos con las chapas"):
- **Las fallidas, en blanco y negro** ("finalmente en blanco y negro. Vamos a
  ver cómo queda con muchos países"). Cambia la decisión del 22-sep (una
  raya): hay que quitar la raya, poner el gris y verlo con todas las chapas
  puestas. La nota "Amartizajes" de la bóveda dice ahora "en color, tachada
  con una raya": habrá que corregirla otra vez.
- **Perseverance e Ingenuity**: a ×1, pegadas una a la otra, y que se vayan
  separando según se acerca.
- **Beagle 2, en color** (se posó, aunque no llegó a transmitir).
- **Mars Polar Lander**: en la zona a la que iba y, en la ficha, que el sitio
  es aproximado.
- Las fallidas sin nota (Mars 6, Mars Polar Lander, Schiaparelli): notas
  nuevas en `Hard Landings`, que se le enseñan antes de crearlas.
- **La ficha** (usuario, 23-sep-2026): se le propusieron filas "dónde /
  cuándo / duró" y no le gustaron ("no me termina de gustar"); propuso él
  **Lugar, Fecha, Estado**, "y además una breve descripción debajo. Después
  foto como en la Luna". Cuánto duró va dentro de Estado ("fin en 2018 (14
  años)"). La Luna se deja como está ("dejamos la Luna"): sus fichas no
  tenían esas filas.
- **Banderas**: las mismas que ya hay en la web para EE. UU., URSS (la rusa)
  y China (usuario: "utilizamos las mismas"); nuevas solo Reino Unido
  (Beagle 2) y Europa (ESA, Schiaparelli), en `PAISES_MARTE`
  (`amartizajes.ts`), aparte de `PAISES_LUNA` para no salir en la columna
  de países de `/luna`.
- **HECHO** (commiteado después, `0c1b504`): las 17 chapas en `src/data/amartizajes.ts`
  (URSS: Mars 2, 3 y 6; EE. UU.: Viking 1 y 2, Pathfinder, Polar Lander,
  Spirit, Opportunity, Phoenix, Curiosity, InSight, Perseverance, Ingenuity;
  Reino Unido: Beagle 2; ESA: Schiaparelli; China: Zhurong). Las
  descripciones salen de la entradilla de cada nota de la bóveda; las de
  Mars 6, Polar Lander y Schiaparelli (sin nota todavía) las escribió el
  asistente.
  - Fallidas (Mars 2, Mars 6, Polar Lander, Schiaparelli) en blanco y negro;
    Beagle 2 en color.
  - Perseverance e Ingenuity: `separa: 20` (px a x1, que crecen con el
    zoom): pegadas a x1 (20 px), 89 px hacia ×2,5 y 120 px a ×6.
  - **Chapas que se pisan**: a x1, Opportunity y Schiaparelli (a 40 km)
    caían una encima de otra. Regla general: la segunda se aparta lo justo
    para quedar pegada, hacia su lado; en cuanto la distancia real basta,
    cada una vuelve a su sitio.
  - La ficha se corre para no salirse por los lados y **se abre hacia
    arriba** si no cabe por debajo.
  - Comprobado en Chrome sin ventana (escritorio y móvil 390 × 844).
- La nota "Amartizajes" de la bóveda dice ya "en blanco y negro" (sin
  commitear allí).
- Lo que faltaba entonces (que el usuario lo viera, las fotos y las notas
  de Mars 6, Polar Lander y Schiaparelli) se hizo después: ver abajo.

Chapas y fichas **commiteadas** (`0c1b504`).

**Fotos de las fichas (23-sep-2026, commiteado: `f7a3a4f`)**. El usuario: "Ok a la
prioridad. Si las fotos son buenas, aunque pidan citar, ponlas". Criterio:
la nave en Marte si hay foto; si no, lo que vio al llegar; si no, la nave
desde órbita, una maqueta o un dibujo.
- De Wikimedia Commons, las 17 en `public/amartizajes/<nota>.jpg` (JPEG de
  800 px; Mars 6 se queda en sus 250 px para no ampliarla). Campo `foto`
  en `amartizajes.ts`; `fotoPos` para recortar hacia un lado (Perseverance,
  Viking 1) y `credito` para las que piden citar (Mars 2, Beagle 2,
  Schiaparelli: CC BY-SA 4.0; Zhurong: CC BY 4.0), que sale en pequeño al
  pie de la ficha.
- Cuáles: Mars 2, maqueta del módulo (igual que el de Mars 3) en la VDNKh;
  Mars 3, sello soviético de 1972; Mars 6, foto de la NASA de la sonda;
  Viking 1, la primera foto desde la superficie; Viking 2, la escarcha de
  Utopia; Pathfinder, Sojourner sobre el módulo; Polar Lander, dibujo de la
  NASA; Beagle 2, réplica; Spirit, Opportunity (PIA18079), Curiosity (Mont
  Mercou), InSight (el primero), Perseverance, autorretratos; Ingenuity,
  recortado del de Perseverance; Phoenix, su cubierta y el brazo; Zhurong,
  con su módulo; Schiaparelli, maqueta en el ESOC.
- Descartadas al verlas: un sello que ponía "Марс-3" iba a ir en Mars 2 (se
  pasó a Mars 3); la primera de Opportunity era una imagen gris sin
  interés.
- La ficha, con la foto, mide ~450 px: si no cabe ni arriba ni abajo (el
  móvil), se corre en vertical hasta quedar dentro (`--sube`).
- **Aprobadas por el usuario** ("Sí, ponlas en las notas y commit") y
  puestas en la bóveda como las de la Luna: `02 - Temas/Adjuntos/
  amartizaje-<nota>.jpg` (las mismas 17), bajo el titular de cada nota con
  un pie en cursiva que dice qué es y de quién es.
- **Notas nuevas en `Hard Landings`** ("crea las notas de Mars 6 etc."):
  Mars 6 (1974), Mars Polar Lander (1999) y Schiaparelli (2016), con su foto,
  `publicar: false`, y enlazadas en el índice "Amartizajes". Ya hay nota para
  las 17 chapas.

**Tanda del 23-sep-2026 (tarde)**, lo que pidió el usuario: "Pixel art está
ok. Hay que subirlas [las teselas] si son necesarias. Fusionar todavía no.
[Documentación] eso sí. Ceñir el visor sí: hazlo. No menú. Cosas sueltas
míralas".
- **Pixel art de Marte: definitivo** (usuario).
- **Teselas en Git**: regeneradas con el generador actual (las del disco eran
  de antes de los últimos retoques del 21-sep por la tarde; el mapa base, la
  LUT y los datos salieron idénticos a los commiteados) y fuera de
  `.gitignore`: `public/marte/n1`-`n3`, 448 archivos, 38 MB.
- **Visor ceñido a la geografía** (`generar-nombres.py`, con el MOLA de 32):
  solo en los montes (Mons, Tholus), buscando el pie de la ladera en 36
  direcciones; nunca agranda el marco más de un 10 % sobre el del catálogo.
  Ceñidos: Olympus Mons (se estrecha y se corre ~30 km al oeste: ya no sobra
  por la derecha), Ascraeus, Elysium, Pavonis, Apollinaris, Hecates Tholus y
  Aeolis Mons. **Probado y descartado para cráteres y calderas**: su
  diámetro del catálogo ya es de borde a borde y buscar el borde en el
  relieve agrandaba el marco donde el terreno de fuera es más alto (Newton,
  Gusev). Alba Mons, casi plano, se queda con el del catálogo (el pie se iba
  lejísimos). Comprobado con capturas del Olympus antes y después.
- **Fusionar**: todavía no (usuario). **Menú en `/marte`**: no (usuario).
- **Documentación**: sección del Proyecto Marte en `CLAUDE.md`. `LUNA-WIP.md`
  ya recogía lo de Marte en `/luna`.
- **Cosas sueltas**:
  - Arreglado: en el vuelo de `/luna` a la Tierra, el menú de arriba a la
    derecha se quedaba flotando; ahora se apaga como en el vuelo a Marte.
  - Safari en el Mac (pellizco del trackpad, `gesture*`): no se puede probar
    desde aquí; lo prueba el usuario si usa Safari.
  - El "salto" de detalle al cambiar de nivel de teselas: normal en mapas
    por niveles; suavizarlo pediría mezclar dos niveles en el shader. Se
    deja como está salvo que al usuario le moleste.
  - Marte de día y de noche en la portada: pendiente de que el usuario lo
    confirme.
- **Ojo para cuando se publiquen notas de Marte**: las de la Luna tienen
  filtros para no salir en `/notas`, la portada ni el RSS; las de Marte aún
  no (anotado en `CLAUDE.md`).

**Siguiente paso** (usuario): la Luna, "que sea capaz de moverse al hacer
clic, exactamente igual que Marte, manteniendo el botón cara oculta / cara
visible para centrar en las caras. Y los accidentes geográficos de la Luna
igual". Va en `LUNA-WIP.md` cuando se empiece.

**En la bóveda** (`boveda-osint`, repositorio aparte): las notas de las
misiones están en `02 - Temas/mars-project/Soft Landings/` (el índice
"Amartizajes" y las que se posaron) y `Hard Landings/` (Mars 2, Mars 6, Mars
Polar Lander y Schiaparelli), todas con `publicar: false` y etiqueta `marte`.
Hay nota para las 17 chapas de `/marte`. El índice dice que la chapa de los
fallidos sale "en blanco y negro" (lo último que decidió el usuario;
commiteado en la bóveda).

Verlo: `npm run dev` y abrir `http://localhost:4321/` (pulsar Marte, arriba a
la derecha, o `mars-project` en la cabecera), `http://localhost:4321/luna`
(Marte arriba a la izquierda) o `http://localhost:4321/marte`.

### Qué hay hoy

- **`/marte`** (`src/pages/marte.astro`, motor `src/scripts/marte-gl.js`):
  Marte en pixel art a pantalla completa (60 svh a ×1), quieto; se gira con
  clic y arrastrar (flecha normal y mano cerrada solo al pinchar) y se acerca
  con la rueda o el trackpad hasta ×6, con más detalle según se acerca
  (teselas). Sin cabecera ni scroll. Sin título. **Al acercarse salen los
  nombres de lugares** (desde ×1,2). Las **17 chapas** de amartizaje, con
  ficha (y foto); las fallidas, en blanco y negro.
  - **Tierra pequeña** arriba a la derecha de Marte (a 1,6 radios a la
    derecha y 0,85 por encima), de día o de noche según el tema: se pulsa y
    hay un **vuelo hacia delante** a la portada. Va **detrás** de Marte: al
    acercarse, Marte la tapa (y no se puede pulsar).
  - **"volver a la Luna"** (abajo a la derecha) solo si se llegó desde
    `/luna`: deshace ese vuelo.
- **Portada**: **Marte pequeño** arriba a la derecha (de día y de noche) y
  **`mars-project`** en la cabecera; los dos hacen el **vuelo a `/marte`**.
- **`/luna`**: **Marte pequeño** arriba a la izquierda, con **vuelo a
  `/marte`** (la Luna grande sale por abajo).
- **Vuelos** (`src/scripts/vuelos.js`, el motor del de la Luna,
  generalizado): Tierra → Marte, Luna → Marte, Marte → Tierra (hacia delante;
  aterriza en el horizonte de la portada) y Marte → Luna (al revés, desde
  Marte tal como se dejó y sin pararse si estaba acercado). Los de la Luna no
  cambian.

### Hecho (todo commiteado y subido)

1. **Estudio y Marte provisional** (`generar-marte.py`, relieve MOLA + color
   Viking, pixel art con el recorrido de la Luna). `5a99c5c`.
2. **Giro con la mano**, tipo globo: primero con la barra espaciadora
   (`eafc8b6`), luego **clic y arrastrar, como Google Maps** (`de62b88`).
3. **Zoom con rueda y trackpad hasta ×6**, en **WebGL**, con pirámide de
   mapas y teselas. `c8bc302` (×4) y `21d404b` (×6). Zen y trackpad,
   probados por el usuario.
4. **Pulido del pixel art** (sin pasarse de realismo): sombra menos oscura
   (`1e4641b`), llanuras en dos tonos (`a907648`), zonas oscuras en
   "chocolate suave" (`105ff78`), vista inicial a 12,5° al norte (`3b31e39`);
   casquete y grano, como estaban.
5. **Bancos de prueba** en `arte/prototipo-marte/` (`zoom.html` es el de
   ahora).
6. **Página `/marte`** (`1aa8175`). El título "mars project" animado se hizo,
   se pulió y **se quitó** (registro en "El título: esquinas que se cierran").
7. **Marte en la portada, `mars-project` en la cabecera y vuelo Tierra →
   Marte** (`1aa8175`). La cabecera, en el móvil, ya no parte "moon-project".
8. **Volver a la Tierra desde `/marte`** (`9db68d3`): primero un botón con el
   vuelo al revés; luego sustituido por la Tierra pequeña (punto 10).
9. **Marte en `/luna` y vuelos Luna ↔ Marte** (`18256e6`).
10. **Tierra pequeña de `/marte` con vuelo hacia delante** y botón "volver a
    la Luna" solo si se vino de allí (`18256e6`).
11. **Cursor de `/marte`**: flecha normal, mano cerrada al pinchar
    (`18256e6`).
12. **Arreglado Marte en blanco** al abrir `/marte` en segundo plano: se
    repinta al volver a verse la pestaña (`18256e6`).
13. **Tierra pequeña rehecha** (último commit de la sesión, "Proyecto Marte:
    la Tierra pequeña de /marte, de pie y con la luz de Marte"): la variante
    C elegida por el usuario, de día y de noche (el vuelo va de noche a noche
    en modo oscuro), y colocada respecto a Marte. Ver "La Tierra pequeña de
    /marte".
14. **Nombres de lugares en `/marte`** (23-sep-2026): la capa del banco
    pasada a la página (`src/scripts/nombres.js`, con
    `montarNombres(capa, marte, chapas)`). Ver "Nombres de lugares".
15. **Un accidente con nombre junto a cada amartizaje** (23-sep-2026): 9
    nombres más en `generar-nombres.py`.
16. **Chapas de Mars 3 y Mars 2 en `/marte`** (23-sep-2026), datos en
    `src/data/amartizajes.ts`; después, las 17 con foto (`0c1b504`,
    `f7a3a4f`).
17. **La Tierra pequeña, detrás de Marte** (23-sep-2026): arreglado que se
    viera encima al acercarse.

### Lo que NO está en Git (ojo al cambiar de ordenador)

- Las teselas (`public/marte/n1/`-`n3/`, 38 MB) **sí están en Git** desde
  el 23-sep-2026 (pixel art definitivo). Antes solo estaban en el Mac.
- **Las fuentes** (`arte/marte-fuentes/`, ~1 GB: MOLA de 16 y 32
  px/grado y el mosaico Viking con sus reducciones a 8, 16 y 24).
- Solo hacen falta para regenerar: bajar las fuentes (los `curl`/`sips`
  están en el docstring de `generar-marte.py`) y `cd arte && python3
  generar-marte.py --canvas ../public/marte/` (unos 4 min).
- Lo que se genera y **sí** está en Git: `public/zodk-marte.png`
  (`generar-marte.py --icono`), `public/marte/marte-quieto.png` (`node
  arte/generar-marte-quieto.mjs`) y `public/zodk-tierra*.png` (`node
  arte/generar-tierra-icono.mjs`). Si cambian los datos de Marte o la
  Tierra de la portada, rehacerlos (y subir `MARTE_V` en `marte.js`).

### Pendiente (por orden)

Hecho y fuera de la lista (23-sep-2026): Zen, móvil y táctil (probado en el
iPhone del usuario), "Marte no gira solo", las 17 chapas con ficha y foto y
sus notas en la bóveda.

1. ~~El visor ceñido a la geografía~~: hecho en los montes (23-sep-2026).
2. ~~Menú en `/marte`~~: el usuario no lo quiere (23-sep-2026).
3. **Visto** (23-sep-2026, ver arriba):
   - ~~En el vuelo de `/luna` a la Tierra, el menú no se apaga~~: arreglado.
   - Safari: el pellizco del trackpad (`gesture*`) está previsto pero sin
     probar (en el iPhone, el pellizco táctil sí funciona).
   - Al pasar de un nivel de teselas a otro durante el zoom, el detalle
     "salta" (normal en mapas por niveles).
   - Que Marte se vea de día y de noche en la portada se dio por bueno (era
     la recomendación; no lo dijo expresamente).
4. **Antes de publicar**: ~~pixel art definitivo → commitear las teselas~~
   (hecho); ~~filtros de las notas de Marte como los de la Luna~~ (hecho,
   23-sep-2026, noche); ~~poner al día `CLAUDE.md` y `LUNA-WIP.md`~~ (hecho);
   fusionar `mars-project` en `main` explicándole antes el merge al usuario
   (el push a `main` publica zodk.eu). Ver "Falta para fusionar" arriba.

### Para la próxima sesión

- Leer esto primero. La memoria del asistente no está en el PC con Linux:
  aquí está todo.
- Estilo de trabajo que ha pedido el usuario en este proyecto: pasos cortos y
  enseñar el resultado antes de seguir; los astros pequeños van en las
  esquinas de arriba y pulsarlos hace un vuelo **hacia delante** (el vuelo al
  revés, solo para un "volver" explícito); animaciones fluidas, sin parones
  entre fases; colores reales, sin pasarse de realismo en el detalle.
- Para mirarlo en el Chrome del usuario con la extensión: la pestaña que abre
  puede quedar en segundo plano y Chrome congela ahí las animaciones (y el
  lienzo WebGL); tiene que estar delante. Las pruebas de vuelos se hicieron
  con Chrome sin ventana (`--headless=new` + CDP) y fotogramas.

## Plan (pasos cortos, en un banco de pruebas `arte/prototipo-marte/`)

- [x] 1. Descargar las fuentes y sacar un **Marte provisional** con el mismo
      recorrido de `generar-luna.py` (sin pulir: el pixel art definitivo va
      después), a ~60 svh. Enseñar un render. **Hecho y aprobado el
      21-sep-2026** ("me gusta mucho el enfoque… vamos muy bien"). Ver
      "Marte provisional" abajo.
- [x] 2. **Giro con la barra espaciadora** (estilo Photoshop, ver
      decisiones). **Hecho y probado por el usuario el 21-sep-2026** (Zen
      bien). Ver "Giro con la barra espaciadora" abajo.
- [x] 3. **Zoom** con rueda y trackpad, hasta ×4, con la pirámide de mapas.
      **Hecho y probado por el usuario el 21-sep-2026** (Zen y trackpad
      bien). Ver "Zoom" abajo.
- [x] 3b. **Zoom hasta ×6** (pedido por el usuario tras probar el ×4). **Hecho
      el 21-sep-2026.** Ver "Zoom ×6" abajo.
- [x] 4. **Chapas** pegadas al terreno: aplazado el 21-sep-2026 y hecho el
      23-sep-2026 con las 17 misiones.
- [x] ~~Giro automático y botón~~: el usuario decidió que no (23-sep-2026).
- [x] 6. **Página `/marte`** con Marte, la mano, el zoom y el título "mars
      project" animado (21-sep-2026; el título se quitó después). Ver "Página
      /marte" abajo.

- [x] 5. **Pulido del pixel art** (21-sep-2026), **sin pasarse de realismo**
      (ver decisiones). Hecho: sombra menos oscura, llanuras en dos tonos,
      zonas oscuras en chocolate suave y vista inicial a 12,5°. El casquete y
      el grano de las llanuras se quedan como estaban (decisión del usuario).

Después, sin orden cerrado: las misiones
(chapa, ficha y nota en la bóveda), el Marte pequeño que se pulsa para
viajar, y la publicación (merge en `main`).

## Decisiones tomadas

- **Girar con clic y arrastrar, como Google Maps** (usuario, 21-sep-2026). Al
  pasar por encima, mano abierta; al arrastrar, mano cerrada, y el planeta
  gira. Sustituye a la barra espaciadora (espacio + arrastrar, como la mano
  de Photoshop), que fue lo primero que eligió y probó. La cambió "antes de
  seguir": "en lugar de barra espaciadora, se pueda desplazar haciendo click?
  a lo google maps". La barra espaciadora ya no hace nada.
- **Zoom máximo ×6** (usuario, 21-sep-2026). Primero decidió ×4 "y vamos
  viendo". Tras probarlo preguntó por ×5-×6 ("tal vez un x8 es demasiado"),
  y con la recomendación de hacerlo con un nivel nuevo, no agrandando el de
  ×4: "vamos con el x6".
- **Pulido sin pasarse de realismo** (usuario, 21-sep-2026, al empezar el
  pulido): "me gusta bastante como está el pixel art ahora, tal vez si
  añadimos muchísimo realismo se pase de frenada (creo que en la luna se
  cometió ese fallo)". Retoques contenidos sobre lo que hay, siempre con la
  versión actual como referencia al comparar.
- Criterio propio, propuesto al usuario y sin objeciones (se cambia si lo
  pide):
  - Giro **tipo globo terráqueo**: norte siempre arriba y sin ladear;
    arrastrar a los lados cambia la longitud, arriba y abajo inclina hasta
    ver los polos.
  - El píxel no cambia de tamaño con el zoom: el planeta gana detalle.
  - Zoom **hacia el cursor** al acercarse, como en un mapa; al alejarse,
    hacia el centro y sin girar (como Google Earth; ver "Zoom").
  - Las chapas no crecen con el zoom.
  - La luz se queda fija respecto a quien mira, como en la Tierra.
  - El planeta, a ~60 svh (la Luna está a 80): se confirma con un render.
- **Vista inicial inclinada 12,5° al norte** (usuario, 21-sep-2026). Antes
  era 10°. Se probó 25° y le pareció demasiado: "la mitad por lo menos".
- **`/marte` sin título** (usuario, 22-sep-2026: "Quitamos el titulo mars
  project con la animacion cuando llega al planeta"). Antes se había hecho
  con las esquinas de visor del blog y cierre en dos puertas (opción C,
  pulida); se quitó del código y queda descrito en "El título: esquinas que
  se cierran".
- **Marte más a la derecha en la portada** (usuario, 22-sep-2026: "un poco
  más a la derecha"): `right: 3%` en vez del 5 % simétrico a la luna (solo
  en escritorio; en el móvil ya estaba al 3 %).
- **Marte en la portada** (usuario, 21-sep-2026): arriba a la derecha,
  "un poco más pequeña que la luna" (opción B), enlace `mars-project` en la
  cabecera y vuelo como el de la Luna. De día y de noche: la recomendación,
  sin objeción expresa.

- **Marte no gira solo** (usuario, 23-sep-2026: "creo que me voy a decantar
  por que marte NO gire"): la opción A de abajo. Quieto; solo se mueve al
  arrastrarlo. Sin botón play/pausa.
- **En el móvil, girar con un dedo y zoom pellizcando** (usuario,
  23-sep-2026).
- **Cada amartizaje (bueno o fallido) tendrá cerca un accidente geográfico
  con nombre** (usuario, 23-sep-2026). Lista propuesta en "Un accidente
  geográfico para cada amartizaje".

## Decisiones pendientes

1. ~~¿Marte gira solo?~~ **Decidido el 23-sep-2026: A, quieto.** Lo que se
   planteó (21-sep-2026), para el registro. Dos
   opciones que planteó él:
   - A: siempre quieto; solo gira cuando el usuario lo arrastra.
   - B: **empieza quieto** y un botón play/pausa, como el de la Tierra, lo
     arranca y lo para.

   Recomendación: **B**. Quieto por defecto es lo mejor para hacer zoom y
   leer chapas, y en reposo no gasta nada: el lienzo solo se repinta al
   tocarlo. El botón da la opción de verlo girar y es coherente con la
   Tierra. En los dos casos, al soltar el espacio el planeta **se queda donde
   se dejó**, y si el giro está encendido sigue girando desde ahí. La idea
   de "volver adonde estaba" deja de tener sentido y se descarta.

   No bloquea nada: los pasos 1 a 4 son iguales con A y con B, y el botón se
   añade al final.
2. ~~Móvil / táctil~~: **decidido el 23-sep-2026**: un dedo para girar y
   pellizco para el zoom.
3. **El Marte de la portada**: **decidido** el 21-sep-2026 ("Si, opción B,
   un poco más pequeña que la luna. Si, mars project en cabecera y que haga
   el viaje") y hecho (ver "Marte en la portada y el vuelo"). Opciones que se
   le dieron, con la recomendación:
   - **Sitio**: arriba a la derecha, simétrico al sol y la luna (que están
     arriba a la izquierda). Comprobado en capturas de día y de noche: esa
     esquina está libre (la cabecera va más al centro y la nave
     `fijo-arriba-der` queda debajo, en el 60 %). Recomendado.
   - **Tamaño**: A, como el icono de la luna (se lee y se pulsa bien, pero
     parece tan cerca como ella); **B, unos dos tercios (recomendado)**: más
     lejano y aún se ven el casquete y las zonas oscuras; C, un punto rojizo
     con brillo, como se ve de verdad a simple vista (difícil de ver, de
     pulsar y de reconocer).
   - **Cuándo se ve**: **de día y de noche (recomendado**: el fondo del hero
     es siempre espacio negro y así siempre se puede ir), o solo de noche
     como la luna.
   - **Enlace `mars-project` en la cabecera**, junto a `moon-project`, que
     hace el mismo vuelo (recomendado).
   - **Vuelo**: el de la Luna (`viaje-luna.js`) hacia la derecha: la cámara
     gira hacia Marte, la Tierra sale por la izquierda y Marte aterriza justo
     en el disco de `/marte`; al aterrizar entra el título. En `/marte`, un
     "volver a la Tierra" con el vuelo al revés, como en `/luna`.
   - **Luna → Marte**: necesita un Marte también en el cielo de `/luna`
     (arriba a la izquierda parece libre: el menú va a la derecha y la
     columna de países, centrada a la izquierda). Recomendado hacerlo
     después del de la Tierra, con el mismo vuelo.
   - Pixel art del icono: sacado de los datos de Marte (misma paleta), para
     que el vuelo aterrice en el mismo planeta. Antes de decidir tamaño, se
     le enseña una captura de la portada con Marte puesto.

## Nombres de lugares (22-sep-2026, en curso)

- **Lo que pidió el usuario**: "según se va acercando (ampliando los x)
  fuesen saliendo nombres de lugares, etc. por ejemplo, podemos empezar por
  el monte olympus? Dame ejemplos y opciones de cómo montar esto".
- **Datos**: los nombres oficiales de la UAI (Gazetteer of Planetary
  Nomenclature, USGS; dominio público). Se bajan en un zip
  (`https://asc-planetarynames-data.s3.us-west-2.amazonaws.com/MARS_nomenclature_center_pts.zip`,
  5 MB; el `.dbf` trae nombre, centro, diámetro en km, caja lat/lon, tipo y
  origen del nombre). **2052 nombres** en Marte: 1240 cráteres, 157 valles, 62
  montes… Por tamaño: 83 de más de 1000 km (Arabia Terra, Valles Marineris,
  Utopia Planitia…), 235 de 300-1000, 323 de 100-300, 482 de 30-100, 802 de
  menos de 30 y 127 nombres clásicos de albedo sin tamaño (Tharsis, Ophir…).
- **Para el ejemplo**, dos nombres:
  - **Olympus Mons** (18,65° N, 226,20° E; 610 km), sale a **×2**.
  - **Olympus Paterae**, su caldera (18,32° N, 226,81° E; 85 km; nombre
    oficial desde 2017), sale a **×4,5**. Sirve para ver el "según acercas,
    salen más nombres".
  - Cerca, para más adelante: Olympus Rupes (el escarpe), Lycus Sulci (la
    aureola del noroeste), los cráteres Karzok y Pangboche (15 y 10 km; de
    ahí salieron meteoritos que han caído en la Tierra) y los tres Tharsis
    Montes.
- **Banco**: `prototipo-marte/nombres.html` (mismo servidor que `zoom.html`).
  Botones de estilo (A, B, C) y de "Olympus Mons ×1/×2/×4/×6". Por la URL:
  `?estilo=a|b|c`, `?vista=lat0,lon0,zoom` y `?ficha=N` (deja abierta la
  ficha del nombre N, para capturas).
- **Cómo funciona** (igual en los tres estilos):
  - Una **capa HTML encima del lienzo**, con el origen en el centro del
    disco. Tras cada fotograma del lienzo (`alPintar`) cada nombre se coloca
    con `marte.proyecta(lat, lon)`, nuevo en `marte-gl.js`: píxeles CSS desde
    el centro del disco y `z` (1 de frente, 0 en el borde). Quieto no se
    repinta el lienzo y los nombres tampoco se mueven: no gasta nada.
  - Cada nombre tiene su **zoom de aparición** (`desde`), con un 6 % de
    margen al alejar para que no parpadee en el umbral. Entra y sale con un
    fundido.
  - Cerca del borde del disco se funde (`z` de 0,32 a 0,12) y por detrás
    no está.
  - El texto no crece con el zoom (como estaba decidido para las chapas).
  - El texto es el del lema de la portada: IBM Plex Mono 600, mayúsculas
    espaciadas, blanco con contorno negro de 1 px.
- **Los tres estilos**:
  - **A · rótulo de atlas**: solo el nombre, como en un mapa impreso. Los
    lugares grandes, encima de su borde norte; los de dentro, a la derecha.
    Lo más limpio y lo que mejor aguantará muchos nombres a la vez.
  - **B · visor**: las cuatro esquinas del marco del título de la portada
    alrededor del lugar, ceñidas a su caja real en pantalla (crecen al
    acercarse), y el nombre bajo la esquina de abajo a la izquierda. Al
    aparecer, las esquinas se cierran desde fuera, como al fijar un blanco.
    La caldera sale con su marco pequeño dentro del grande.
  - **C · chapa y ficha**: un punto dorado en el sitio, una línea y el nombre
    en una chapa; al pasar el ratón, la ficha dorada de las naves y de
    `/luna` (tipo, altura, diámetro, origen del nombre). Los grandes van
    arriba a la izquierda y los de dentro abajo a la derecha, para no
    pisarse.
- **Comprobado en Chrome sin ventana** (1440 × 900): los tres estilos a ×2,
  ×4 y ×6 sobre el Olympus Mons; desde ×1 con ocho golpes de rueda salen los
  dos nombres a su zoom; la ficha de C. Sin errores en la consola.
- **Decisiones pendientes** (del usuario):
  1. **Estilo**: ya decidido (ver arriba: B para las formas claras, rótulo
     para las regiones, chapa para lo que tenga entrada en el blog). Queda
     **a qué zoom entran los rótulos de región**: el usuario preguntó si se
     recomiendan ya a ×1. Recomendado: **a ×1 no** (el planeta limpio, que es
     lo que quiere verse al llegar, y así los nombres "salen al acercarse",
     que era la idea); que entren en cuanto se toca la rueda, hacia **×1,2**,
     y se vayan hacia ×3,5. Es un número por nombre.
  2. **Idioma** (el usuario, 22-sep-2026: "¿nombres en español, inglés o
     unificamos?"). Recomendado: **unificar en los oficiales de la UAI**, que
     no son ingleses sino latinos ("Olympus Mons", "Amazonis Planitia"): son
     los de todos los mapas, y la mitad no tiene versión en castellano (Nili
     Fossae, Syrtis Major, Tharsis), así que traducir solo unos pocos quedaría
     a medias. El castellano y el significado, en la ficha ("Monte Olimpo";
     "Nix Olympica, las nieves del Olimpo").
  3. **Qué nombres**: los 2052 no (la mitad son cráteres pequeños). Propuesta:
     una lista elegida a mano, por tamaño y por interés (montes, valles,
     llanuras, cuencas, los sitios de las misiones), con el zoom de aparición
     sacado del tamaño (que el lugar mida unos 90 px en pantalla) y
     retocable uno a uno. Algo así como ×1: las regiones enormes (Tharsis,
     Valles Marineris, Utopia, Hellas); ×2: los grandes volcanes y cañones;
     ×4: cráteres de más de 100 km y los sitios de las misiones (Gale,
     Jezero); ×6: calderas y detalles.
- **El usuario, entre B y C** (22-sep-2026): "B me gusta mucho para cosas
  como montañas y cráteres, pero por ejemplo para grandes planicies?".
  - Añadida al banco **Amazonis Planitia** (25,75° N, 197,09° E; 2809 km),
    al oeste del Olympus Mons: en el banco sale de **×1 a ×3,5** (`hasta`: al acercarse
    mucho se va, como los nombres de región en los mapas).
  - Fila "planicie" en el banco: **"rótulo de región"** (letras muy
    espaciadas, más finas y algo transparentes, en dos líneas, en medio de la
    región; igual en los tres estilos) y **"con marco (B)"**, para comparar
    (`?planicie=marco`).
  - Visto a ×2: con marco, las esquinas encierran media cara del planeta sin
    señalar nada concreto y llegan hasta el Olympus; a más zoom la caja es más
    grande que la pantalla. El rótulo de región se lee como "esto es una zona".
  - Propuesta: **según el tipo de lugar**. Con forma clara (montes, cráteres,
    calderas): el marco de B. Sin borde (planicies, tierras, mesetas,
    nombres de albedo): el rótulo de región. Largos y estrechos (valles,
    fosas): por ver cuando se llegue a Valles Marineris. **C, para las
    misiones** (un punto exacto: Curiosity, Perseverance…), que ya estaban
    pendientes como chapas, y su ficha podría abrirse también al pasar por
    un marco de B.
- **Decidido por el usuario (22-sep-2026), cada estilo en su sitio**:
  - **Formas claras (montes, cráteres, calderas): el visor B**, "pero
    ajustar bien, por ejemplo el monte olympus no está del todo ajustado".
  - **Planicies, mesetas y demás: el rótulo de región.**
  - **Chapa con ficha (C): los sitios que tengan una entrada en el blog.** Es
    la misma regla que las chapas de bandera de la portada (solo países con
    artículos) y las de `/luna`: la chapa quiere decir "aquí hay algo que
    leer". Los demás lugares llevan solo el nombre. Las misiones tendrán
    chapa cuando se escriban sus notas.
- **El marco de B, ajustado** (22-sep-2026): antes era la caja exacta de
  latitud y longitud del catálogo, que en el Olympus Mons abarca el volcán
  entero (incluido el pie de las laderas) y es más ancha que alta, así que
  cortaba el escudo y se veía torcida. Ahora el marco es **cuadrado** (el
  lado mayor de la caja) con un **6 % de aire por fuera** (`MARGEN`),
  centrado en el lugar: se lee como una mira puesta encima y no como un
  recorte. Comprobado a ×4 y ×6. En el banco, `?cuadrado=0` enseña el de
  antes y `?margen=N` cambia el aire. Si algún lugar no queda fino, su caja
  son cuatro números a mano en los datos.
- **Confirmado por el usuario (22-sep-2026)**: nombres latinos (los oficiales
  de la UAI); los rótulos de región entran al empezar a acercarse, no a ×1
  ("cuando haya bastantes nombres te iré diciendo"); chapa con ficha para lo
  que tenga entrada en el blog ("de momento no he escrito nada, pero
  llevarán ficha"). Sobre el marco cuadrado: "se ve mejor…, aunque parece
  que por la derecha sigue teniendo más espacio. No me molesta, pero para
  futuros sí que quiero que **sea ajustado a la geografía**".
  - Cómo hacerlo bien (pendiente): la caja del catálogo es un rectángulo de
    latitud y longitud, no la forma del lugar. Lo fino es **sacar el borde
    del relieve MOLA que ya tenemos** (en el generador, al hacer las
    teselas): para cada nombre, partir de su caja oficial y encogerla hasta
    donde el relieve deja de subir, y guardar esa caja en el archivo de
    nombres. Así el marco se ceñiría al volcán, al cráter o a la fosa de
    verdad.
- **Primera tanda de nombres: HECHA** (22-sep-2026; el usuario: "Ok me parece
  bien, no conozco marte, me fío, si crees que hay que meter más, mete"). Son
  **49**: 18 rótulos de región y 31 con visor.
  - **`arte/generar-nombres.py`** lee el catálogo (el `.dbf` va en
    `marte-fuentes/`, sin trackear; el `curl` está en su docstring) y escribe
    **`public/marte/marte-nombres.json`** (14 KB, sí se commitea) con el
    centro, el diámetro, la caja y, por nombre, `clase` (region o visor), `px`
    y `menor`. La lista elegida a mano está arriba del script: para añadir o
    quitar un nombre se toca ahí y se vuelve a lanzar.
  - **Cuándo sale cada uno**: no por un zoom fijo, sino por **cuánto mide el
    lugar en la pantalla** (`px`), que se calcula con su tamaño real, no con
    la caja proyectada (cerca del borde la caja se aplasta y el nombre
    parpadearía al girar). Por defecto 90 px; los pequeños pero interesantes
    llevan menos: Gale y Gusev 55, la caldera del Olympus 34, Korolev 34,
    Jezero 20. Así el mismo archivo vale para cualquier tamaño de ventana.
  - **A ×1 no sale ningún nombre** (usuario, 22-sep-2026: "en x1 no me
    gustaría que apareciese nada que en el futuro no sean misiones
    marcianas"). Es una regla dura del banco: por debajo de ×1,2 no se pinta
    ningún rótulo ni marco. Las chapas de las misiones sí se ven a ×1.
  - **Las zonas** salen a partir de ×1,2 (las grandes) o de su umbral (las
    medianas) y se van cuando ya no caben (más de 1,6 pantallas de ancho).
  - **Las zonas grandes NO llevan visor** (usuario, 22-sep-2026: "grandes
    áreas NO VAN con visor, por ejemplo noctis labyrinthus o kasei valles").
    Pasaron de visor a rótulo, con umbral para que no salgan a ×1,2 como las
    grandes: Kasei Valles (260 px), Noctis Labyrinthus (220), Coprates Chasma
    (220), Ma'adim Vallis (220), Melas Chasma y Nili Fossae (200). El visor
    queda para lo que tiene una forma clara que enmarcar: montes, cráteres y
    calderas.
  - **Los rótulos alargados van en una línea** (un valle, un cañón) y los de
    zonas más o menos redondas, en dos, como en los mapas. Lo decide el
    generador por la proporción de la caja (`linea`).
  - **Los que se pisan**: el archivo va ordenado de mayor a menor y, si dos
    rótulos se solapan en pantalla, se queda el del lugar más grande; el otro
    vuelve en cuanto hay sitio. `?sin-orden` en el banco lo apaga para ver el
    lío que sería sin eso.
  - **Tharsis** no está en el catálogo como zona (es un nombre de albedo, un
    punto suelto): su caja va a mano en el generador. **Vastitas Borealis** se
    quitó: su centro es prácticamente el polo y el rótulo caía en el borde.
  - **Comprobado en Chrome sin ventana**: a ×1,4 salen 12 nombres, a ×2 salen
    13 con el Olympus Mons ya enmarcado, y a ×6 sobre Gale salen Gale, Aeolis
    Mons (el monte Sharp, dentro), Herschel y Elysium Planitia.
  - El banco ya no tiene los estilos A y C: la decisión está tomada. Quedan en
    el historial de Git (y descritos aquí) por si hiciera falta.
- **La tanda, por si hay que revisarla**: unos 30 eran la propuesta y se
  quedaron 49, con el zoom de aparición sacado del tamaño en pantalla.
  - **Rótulo de región** (entran hacia ×1,2): Tharsis, Valles Marineris,
    Amazonis Planitia, Utopia Planitia, Elysium Planitia, Acidalia Planitia,
    Chryse Planitia, Isidis Planitia, Hellas Planitia, Argyre Planitia,
    Arabia Terra, Noachis Terra, Syrtis Major Planum, Vastitas Borealis y los
    dos casquetes (Planum Boreum, Planum Australe).
  - **Visor, hacia ×2**: Olympus Mons (610 km), Alba Mons (548), Arsia (470),
    Ascraeus (456), Pavonis (367), Elysium Mons (401), Noctis Labyrinthus
    (1190), Kasei Valles (1580), Melas Chasma (564), Chasma Boreale (460),
    Schiaparelli (459), Huygens (467), Antoniadi (401), Cassini (408), Nili
    Fossae (728).
  - **Visor, hacia ×4**: Herschel (298), Newton (300), Apollinaris Mons
    (275), Medusae Fossae (279), Lyot (222), Lowell (202), Ma'adim Vallis
    (913, estrecho), Gale (154), Gusev (158), Holden (153).
  - **Visor, hacia ×6** (los detalles dentro de otros): Olympus Paterae (85),
    Aeolis Mons (89, el monte Sharp dentro de Gale), Jezero (48), Korolev
    (81), Hecates Tholus (182), Pangboche y Karzok (10 y 15) en el Olympus.
  - **Chapas con ficha**: las notas ya están creadas en la bóveda
    (`02 - Temas/mars-project/Soft Landings/`, `publicar: false`, el usuario
    las irá completando): Mars 3 (1971), Viking 1 y 2 (1976), Mars Pathfinder
    (1997), Beagle 2 (2003), Spirit y Opportunity (2004), Phoenix (2008),
    Curiosity (2012), InSight (2018), Perseverance, Ingenuity y Zhurong
    (2021), más el índice "Amartizajes". Las chapas se harán cuando estén
    publicadas.
- **Llevado a `/marte`** (23-sep-2026): `src/scripts/nombres.js` hace
  lo mismo que el banco (umbrales, visor cuadrado con 6 % de aire, rótulos,
  fundidos, reparto de sitio), con dos cambios de cocina: el tamaño de cada
  texto se mide una vez al montar (con la letra ya cargada) y el reparto de
  sitio se hace con cuentas, sin leer cajas del navegador en cada fotograma
  del zoom (sería maquetar ~50 elementos por fotograma); y la capa se quita
  en cuanto se pulsa para irse (a la Tierra o a la Luna). Las chapas de
  prueba se llevaron después, a petición del usuario (ver "Dónde estamos"). La letra IBM Plex Mono 500 (rótulos de región)
  se carga ahora en `Head.astro`; solo se baja donde se usa.
- **Sin hacer (a propósito)**:  los nombres no se pisan
  entre ellos más que por su colocación (con muchos habrá que apartar o
  esconder los que choquen); nada para táctil.

## Un accidente geográfico para cada amartizaje (23-sep-2026, hecho)

- **Lo que pidió el usuario**: "en mi obsidian (boveda-osint) hay una entrada
  de mars-project donde se pondrán todos los amartizajes fallidos y
  exitosos. Todos estos tienen que tener cerca un accidente geográfico con el
  que asociarlos."
- **Cómo se buscó**: para cada sitio de aterrizaje, los nombres oficiales
  del catálogo de la UAI (el mismo `.dbf`) más cercanos y los que lo
  contienen. Ojo con el tamaño: a ×6 un grado mide unos 28 px, así que un
  cráter de menos de ~40 km no llega a tener visor que se vea. Por eso se
  propone el accidente con nombre **más cercano que se vea en el mapa**, no
  el más cercano a secas (Viking 1 tiene al lado Yorktown y Lexington, de 5 a
  8 km: invisibles).
- **Sitio de Mars 2**: 4° N, 47° O, confirmado en NASA NSSDC ("impacted Mars
  at high velocity near 4 N, 47 W").
- **Aprobada y hecha** (usuario, 23-sep-2026: "mete los accidentes de la
  tabla"). En `generar-nombres.py`: los valles, colinas y escarpes, como
  rótulo con umbral (200-220 px, salen hacia ×4); Ptolemaeus y Miyamoto,
  visor a 55 px (como Gale); Mie, a 45; Endeavour, a 9 (22 km: sale a ×6).
  Comprobado: Nanedi Valles junto a Mars 2 y Ptolemaeus junto a Mars 3.
- **La lista** (✓ = ya estaba):

  | Misión | Sitio | Accidente propuesto | Distancia | ¿En la lista? |
  |---|---|---|---|---|
  | Mars 2 (1971, fallida) | 4° N, 47° O | Nanedi Valles (valle, 550 km) | 114 km | añadir |
  | Mars 3 (1971) | 45,0° S, 158,0° O | Ptolemaeus (cráter, 165 km) | dentro | añadir |
  | Mars 6 (1974, fallida) | 23,9° S, 19,4° O | Samara Valles (valle, 662 km) | dentro | añadir |
  | Viking 1 (1976) | 22,3° N, 48,0° O | Chryse Planitia | dentro | ✓ |
  | Viking 2 (1976) | 47,6° N, 134,3° E | Mie (cráter, 101 km) | 215 km | añadir |
  | Pathfinder (1997) | 19,1° N, 33,2° O | Ares Vallis (valle, 1758 km) | dentro | añadir |
  | Mars Polar Lander (1999, fallida) | 76,6° S, 165,2° E (objetivo) | Ultimi Scopuli (escarpes, 560 km) | dentro | añadir |
  | Beagle 2 (2003) | 11,5° N, 90,4° E | Isidis Planitia | dentro | ✓ |
  | Spirit (2004) | 14,6° S, 175,5° E | Gusev (cráter) | dentro | ✓ |
  | Opportunity (2004) | 1,9° S, 5,5° O | Endeavour (cráter, 22 km, lo exploró 11 años) y Meridiani Planum | 28 km | Meridiani ✓; Endeavour, añadir |
  | Phoenix (2008) | 68,2° N, 125,8° O | Scandia Colles (colinas, 1522 km) | dentro | añadir |
  | Curiosity (2012) | 4,6° S, 137,4° E | Gale y Aeolis Mons | dentro | ✓ |
  | Schiaparelli (2016, fallida) | 2,1° S, 6,2° O | Miyamoto (cráter, 145 km) | dentro | añadir |
  | InSight (2018) | 4,5° N, 135,6° E | Elysium Planitia | dentro | ✓ |
  | Perseverance e Ingenuity (2021) | 18,4° N, 77,5° E | Jezero | dentro | ✓ |
  | Zhurong (2021) | 25,1° N, 109,9° E | Utopia Planitia | dentro | ✓ |

- **Dudas para el usuario**: Endeavour (22 km) es pequeño pero es *el*
  cráter de Opportunity: con `px` bajo, como Jezero, saldría a ×6. InSight
  y Zhurong solo tienen al lado su llanura (a Zhurong lo rodean nombres
  chinos de 6 a 22 km puestos en 2023, demasiado pequeños para verse).
  Mars 6, Polar Lander y Schiaparelli aún no tienen nota en la bóveda.

## Chapas de las misiones: la prueba de Mars 3 y Mars 2 (22-sep-2026)

- **Lo que pidió el usuario**: "Podemos crear en obsidian otro apartado para
  las sondas que NO han llegado (cuando leo Mars 3 me pones el ejemplo de Mars
  2, estas irían por ejemplo en blanco y negro o tachadas). Vamos a hacer la
  prueba con Mars 3 y Mars 2, le creamos la chapa y le creamos la nota, el
  resto no, estas solo de prueba."
- **En la bóveda**: carpeta nueva `02 - Temas/mars-project/Hard Landings/`
  (nombre a juego con `Soft Landings`; se puede cambiar) con
  `🇷🇺 Mars 2 (1971)`. El índice "Amartizajes" la enlaza ya en su sección "Los
  que no lo lograron". De paso se corrigió la nota de Mars 3: Mars 2 se
  estrelló **cinco** días antes (27 de noviembre de 1971), no seis, y la
  señal de Mars 3 duró unos veinte segundos, noventa segundos después de
  posarse (fuentes: NASA NSSDC y Wikipedia).
- **En el banco**: las dos chapas, con la bandera en pixel art de `/luna`
  (11 × 7 celdas con contorno, `svgBandera` de `src/data/alunizajes.ts`;
  se usa la rusa porque la de la URSS no se pinta en la mayoría de sistemas).
  - Van en su **sitio exacto**, no crecen con el zoom y **se ven a cualquier
    zoom**, también a ×1, donde son lo único que aparece.
  - Sitios: Mars 3 en 45,04° S, 202,02° E (región del cráter Ptolemaeus) y
    Mars 2 en 4° N, 47° O, que es aproximado (se estrelló y no hay imagen de
    los restos; así lo dice su ficha).
  - **La chapa es un enlace a su nota** (usuario, 22-sep-2026): cursor de
    mano al pasar por encima, y mientras se arrastra el planeta, el de
    agarrar. En la web irá a `/notas/<slug>`; en el banco, a "#".
  - **La que no llegó, apagada**. Cuatro variantes en el panel: **aspa** (la
    que está puesta), **una raya**, **blanco y negro** y **aspa + b/n**.
    - El usuario descartó el blanco y negro él mismo: "puede que no se
      diferencien los países". Es verdad: de las banderas que salen en Marte,
      la rusa, la estadounidense y la británica son las tres de los mismos
      colores y en gris se confunden.
    - **Elegida: una raya** (usuario, 22-sep-2026: "Ok una raya"), que era la
      recomendación: tacha igual de claro y deja ver los colores; el aspa, a
      este tamaño (18 × 12 px), se come casi toda la bandera.
    - **Arreglado de paso**: el aspa salía con una sola raya. La bandera es un
      hijo del enlace y tapaba el `::before`; las rayas llevan ahora
      `z-index`.
  - **Ficha al pasar el ratón**, la dorada de las naves y de `/luna`: misión,
    país y año, qué era, cuándo, dónde y qué pasó. De momento acaba en "nota
    en la bóveda, sin publicar todavía"; cuando la nota se publique, ahí irá
    el enlace, como en `/luna`.
- **Comprobado en Chrome sin ventana**: a ×1 salen las dos chapas y ningún
  nombre; las dos fichas; y la variante tachada.

### Cuántos países han mandado algo a Marte (22-sep-2026)

Lo preguntó el usuario al hablar del blanco y negro. Para el mapa importa el
primer grupo, que es el que lleva chapa:

- **Han intentado posar algo en el suelo: cuatro.** URSS (Mars 2, 3, 6 y 7),
  EE. UU. (de las Viking a Perseverance), Europa —ESA con el Reino Unido—
  (Beagle 2 y Schiaparelli) y China (Zhurong).
- **Han llegado a Marte de alguna forma, contando orbitadores: siete.** Los
  cuatro de arriba más la India (Mangalyaan, 2014), los Emiratos Árabes
  Unidos (Hope, 2021) y Japón, que lo intentó y no lo logró (Nozomi, que no
  llegó a entrar en órbita en 2003).
- Para la URSS se usa la bandera rusa, como en `/luna`: Unicode no tiene una
  soviética que se pinte en la mayoría de sistemas.

## Marte provisional (paso 1, 21-sep-2026)

- **Generador**: `arte/generar-marte.py` (Python estándar, como el de
  la Luna; ~6 s por cara). Script nuevo: `generar-luna.py` no se ha tocado.
  `python3 generar-marte.py --zoom` saca las dos caras y un recorte ×4 del
  centro de cada una en `prototipo-marte/`.
- **Banco**: `arte/prototipo-marte/index.html`. Servir la raíz del repo
  (`python3 -m http.server 4400`) y abrir
  `http://127.0.0.1:4400/arte/prototipo-marte/`. Enseña el disco a 60
  svh sobre las estrellas de la portada, con botones de cara y de zoom ×4.
- **Fuentes descargadas** en `arte/marte-fuentes/` (824 MB, en
  `.gitignore`; los `curl` y el `sips` están en el docstring del script):
  MOLA de 16 px/grado y el mosaico Viking de 925 m, reducido con `sips` a
  8 px/grado (`viking_8.bmp`). Para el zoom ×4 habrá que reducirlo a 16.
- **Lo que hay en el dibujo**:
  - Disco de 450 px con radio de 219,4: a 60 svh, el píxel mide lo mismo que
    el de la Luna de `/luna`.
  - Dos caras de prueba (en giro "tipo globo", `CARAS`): **tharsis** (lat0
    10, lon0 -80: Olympus Mons, Tharsis, Valles Marineris) y **syrtis** (lat0
    10, lon0 105: Syrtis Major, Isidis, Utopia, Elysium, Hellas).
  - Luz desde arriba a la izquierda, como el sol de la Tierra de la portada:
    fase 40°, subida 20°. Terminador algo más suave que el de la Luna (Marte
    tiene atmósfera fina). Luz del lado sin sol, la de la Luna (0,16).
  - **Seis materiales por brillo del mosaico** más **hielo** en los polos.
    Hielo = claro y poco rojo, por encima de 50° de latitud. Cortes de brillo
    56/68/80/98/112, con el pico del histograma (84-95) entero en un solo
    material, porque en la Luna partirlo salía a manchas. Paleta de óxidos:
    de basalto oscuro a polvo claro.
  - Rampa de la Luna con un cambio: en la sombra, los óxidos giran hacia el
    granate (antes solo se oscurecían).
  - Relieve MOLA con exageración de 2,5, relieve rasante (el sol no sube de
    30° para sombrearlo), sombras proyectadas cerca del terminador (se buscan
    picos de hasta 22 km) y dos pasadas de limpieza.
- **Flojo, a propósito (es provisional)**: las llanuras grandes salen de un
  solo tono (Utopia, Tharsis); el casquete norte se ve pequeño; las regiones
  oscuras, algo pardas. Todo eso es del pulido del pixel art, que va después.
- **Pedido por el usuario para el pulido**: la sombra, **menos oscura** ("se
  podrá tocar luego"). Se refiere a la zona sin sol de la derecha (hoy
  `NOCHE` = 0,16, el valor de la Luna) y quizá al terminador.
- **Aviso para el motor**: este render lleva supermuestreo y sombras
  proyectadas, que el giro en tiempo real de la Luna no hace. Como Marte
  estará casi siempre quieto, en reposo se puede pintar un fotograma de
  calidad y dejar el rápido solo para mientras se arrastra o se hace zoom (la
  Luna ya hace eso mismo: gira "sucia" y acaba en el PNG limpio).
- Para revisar el banco no se pudo usar Chrome: la extensión no estaba
  conectada. Se revisaron los PNG directamente.

## Giro con la barra espaciadora (paso 2, 21-sep-2026)

- **Banco**: `prototipo-marte/canvas.html` (mismo servidor que el otro
  banco). Marte a 60 svh sobre las estrellas, en una ventana de pantalla
  completa. Con **espacio** pulsado sale la mano abierta; con **espacio +
  clic y arrastrar**, la mano cerrada y el planeta gira. Botones para saltar a
  Tharsis, Syrtis y los dos polos; abajo, la vista (lat0/lon0) y los ms del
  último fotograma. `?medir` mide al cargar (para Zen).
- **Motor**: `src/scripts/marte.js`.
  - `montarMarte(canvas, opciones)` pinta el planeta.
  - `montarMano(zona, marte)` hace la mano. Pone las clases `mano` y
    `agarrando` en la zona; el cursor lo pone el CSS de la página.
  - Datos en `public/marte/`, de `generar-marte.py --canvas ../public/marte/`
    (mapa de 1440 x 720, 641 KB). Al regenerar hay que subir `MARTE_V`; va
    por 2.
- **Cómo gira**:
  - Tipo globo: el norte siempre arriba. Arrastrar a los lados cambia la
    longitud del centro y arriba o abajo inclina hasta los polos (tope de
    ±90°).
  - Un radio de disco arrastrado es un radián de giro.
  - Al soltar se queda donde se dejó, sin inercia.
  - Se puede agarrar en todo el hero, no solo sobre el disco.
- **Coste** (medido en Node, que usa el motor de JavaScript de Chrome; sin
  contar el volcado a pantalla): **1,5 ms** por fotograma arrastrando a los
  lados (solo se desplaza el mapa, como la Tierra) y **6 ms** inclinando
  (rehace las tablas por píxel). Mientras se arrastra, como mucho 60
  fotogramas por segundo y sin limpieza. Al soltar se pinta uno limpio y ya
  no se gasta nada. **Falta medir en Zen.**
- **El lienzo ya ocupa toda la ventana**, con el disco centrado, pensando en
  el zoom: al acercarse, el disco se saldrá de la pantalla. El píxel de arte
  mide lo mismo que en la Luna. El volcado es a un múltiplo entero, ×3 como
  mucho, como en la Luna y la Tierra.
- **La barra espaciadora** no hace scroll ni pulsa el último botón clicado.
  Si se navega con el teclado (foco visible en un botón), el espacio sigue
  pulsando ese botón. Si la ventana pierde el foco con el espacio pulsado
  (Cmd+Tab), se da por soltado.
- **Arreglado de paso**: una raya oscura de polo a polo en los 180° O. La
  columna 0 del mosaico reducido con `sips` sale oscura (la mezcla con negro
  del borde); el generador usa la columna de al lado.
- **Aún sin hacer (a propósito)**:
  - Las sombras proyectadas y el supermuestreo del render de Python: el
    fotograma en reposo no los tiene. Por la geometría no hacían falta;
    comparar a ojo si se echan de menos.
  - Pantallas táctiles: no hay barra espaciadora. **Pendiente de decidir**
    (el usuario, 21-sep-2026: "Móvil se queda por decidir").
- **Prueba sin navegador**: `node arte/prototipo-marte/probar-en-node.mjs
  carpeta/` ejecuta `marte.js` con un canvas simulado y guarda en PNG varias
  vistas y dos fotogramas a mitad de arrastre, además de medir los ms. Sirvió
  para ver la raya de los 180° antes de enseñarlo.

### Cambio: clic y arrastrar en vez de barra espaciadora (21-sep-2026)

- `montarMano(zona, marte)` en `marte.js`, la misma para los dos motores.
  Pone en `zona` la clase `arrastrable` (cursor `grab` en el CSS de la
  página) y `agarrando` mientras se arrastra (`grabbing`).
- El giro no empieza hasta moverse **4 px**: un clic sin arrastrar sigue
  siendo un clic (lo necesitarán las chapas). Tras un arrastre de verdad se
  anula el clic que manda el navegador al soltar.
- No se agarra sobre botones, enlaces, campos ni lo que lleve
  `data-sin-arrastre` (el panel de los bancos lo lleva).
- Probado en Chrome: el arrastre gira, un clic sin moverse no cambia nada y
  los botones del panel funcionan igual.
- Se quitó todo lo de la barra espaciadora (anular el scroll, el foco
  visible, etc.). Queda en el historial de Git (commit `eafc8b6`) por si
  vuelve.

## Zoom (paso 3, 21-sep-2026)

- **Banco**: `prototipo-marte/zoom.html`, en el mismo servidor. Rueda o
  trackpad (pellizco o dos dedos) para el zoom, hasta ×4; espacio + arrastrar
  para girar, como en el paso 2. Tiene botones de sitios y de zoom ×1/×4.
  Abajo salen el zoom, la vista y cuántas teselas han llegado. `?medir` mide
  al cargar (para Zen).
- **Cambio de motor: WebGL** (`src/scripts/marte-gl.js`). Marte se pinta en
  la tarjeta gráfica. El motor de CPU (`marte.js`, el del paso 2) no daba
  abasto con el zoom:
  - A ×4 el disco llena la pantalla: unos 850.000 píxeles de arte por
    fotograma en vez de unos 150.000.
  - Medido en Node, que usa el motor de JavaScript de Chrome, y sin contar el
    volcado: **35 ms** por fotograma inclinando y 11 a los lados. La animación
    del zoom rehace todo en cada fotograma.
  - **En WebGL: 0,5-0,6 ms por fotograma** en Chrome, a ×1 y a ×4, con la GPU
    incluida.
  - Hace las mismas cuentas de luz, la misma paleta y la misma limpieza de
    píxeles sueltos, y ahora limpia **siempre**, también mientras se arrastra.
    A ×1 se ve igual que el motor de CPU.
  - Quieto no se repinta.
  - `marte.js` se queda por ahora, como respaldo si no hay WebGL2 (pendiente
    de decidir) y porque `montarMano` vive ahí y la usan los dos motores.
- **Cómo funciona el zoom**:
  - El píxel de arte mide siempre lo mismo y el radio del disco crece
    (`RADIUS × zoom`).
  - Hay una **pirámide de mapas**: la base de 4 px/grado (`marte-mapa.png`,
    entera) y dos niveles finos, **8 y 16 px/grado, en teselas** de 360 × 360
    celdas (`public/marte/n1/` = 32 teselas y 2,4 MB; `n2/` = 128 y 11 MB).
    Pesan menos de lo estimado en el estudio.
  - Cada nivel se calcula desde las fuentes a su resolución: al acercarse
    aparecen de verdad cráteres, fosas y cañones que la base no tiene.
  - Cada píxel lee del nivel cuya celda mide lo que él **en latitud**. Si su
    tesela no ha llegado, lee del nivel de debajo.
  - Solo se bajan las teselas que se ven, las más centrales primero, como
    mucho 6 a la vez. Una vista a ×4 baja unas 20-30 (~2-3 MB).
- **Controles**: la rueda cambia el zoom ×1,28 por golpe (100 px); el
  pellizco (rueda con `ctrlKey`) es más sensible. Hay suavizado de 0,07 s.
  Safari manda el pellizco como `gesture*`: está previsto, sin probar.
  **Pellizco y dos dedos sin probar con un trackpad de verdad**: las
  sensibilidades (`k` en `montarZoom`) se ajustan cuando lo pruebe el
  usuario.
- **Comprobado en Chrome** (21-sep-2026):
  - A ×4 se ven Noctis Labyrinthus, Kasei Valles, las calderas de Tharsis, las
    fosas de Nili junto a Jezero, **Gale con el Monte Sharp** en el centro y
    **las espirales del casquete norte** con Chasma Boreale.
- **Arreglado mientras se probaba**:
  - **Bloques en abanico en el polo** a ×4. El nivel se elegía también por la
    longitud, y cerca del polo bajaba a la base. Ahora se elige solo por la
    latitud. En longitud, las columnas se agrupan de 2 en 2, de 4 en 4… en una
    rejilla fija del mapa, así que no parpadea al girar.
  - **Alejar desde una esquina tumbaba el planeta** (de lat0 29° a 83°):
    mantener el punto bajo el ratón al encoger obliga a girar cada vez más.
    Ahora, al alejar, hacia el centro y sin girar.
- **Sin probar o pendiente**:
  - Safari (el pellizco llega por `gesture*`).
  - Sin WebGL2, el banco solo lo dice. Para la página de verdad: el motor de
    CPU sin zoom, o una imagen quieta.
  - Al pasar de un nivel a otro durante el zoom (×1,5 y ×3) el detalle
    "salta" de golpe. Es lo normal en un mapa por niveles. Si molesta, se
    puede mirar.
  - En las llanuras grandes se ven rayitas de norte a sur a ×4. Parecen
    fosas reales, pero podrían ser huellas de las órbitas del MOLA. Mirar al
    pulir.
  - **Teselas y Git** (decidido): 13 MB por versión, y cada regeneración
    (con el pulido del pixel art) sumaría otros 13 MB al historial. **No se
    commitean hasta que el pixel art sea el definitivo** (usuario,
    21-sep-2026: "me vale así"; esa semana no iba a usar el PC de Linux). En
    `.gitignore` (`public/marte/n*/`). Para tenerlas en otro ordenador hay
    que regenerarlas: 800 MB de fuentes y unos 90 s.
  - **Zen y trackpad: probados por el usuario**, bien.

## Zoom ×6 (21-sep-2026)

- **Por qué un nivel nuevo**: el nivel de 16 px/grado está hecho para ×4. Por
  encima solo se agrandarían las mismas celdas: sin detalle nuevo y con
  píxeles de tamaños distintos, que en pixel art se nota.
- **Nivel 3 de 24 px/grado, no de 32** (cambio sobre lo propuesto al usuario,
  que era 32 y ~44 MB):
  - A ×6 un píxel de arte son ~23 px/grado, así que 32 no enseñaría más
    detalle y pesaría el doble. Con 24 cada celda cae en un píxel.
  - Relieve del **MOLA de 32 px/grado** (`megt90n000fb.img`, un solo archivo
    global de 133 MB, mismo formato que el de 16; `curl` en el docstring).
  - Color del Viking reducido a 24 (`viking_24.bmp`).
  - Resultado: **288 teselas y 23 MB**, generadas en 2,4 min (`--canvas
    ../public/marte/ --niveles 3`). En total, n1 + n2 + n3 = 36 MB.
- **Cambios en el motor** (`marte-gl.js`):
  - **Niveles genéricos**: el shader recorre los niveles que traiga
    `marte-datos.json`. El corte entre dos niveles va a mitad de camino (en
    escala logarítmica) entre sus resoluciones: de 16 a 24 se pasa hacia
    ×5,1.
  - **Atlas de teselas de tamaño fijo en la GPU**: 12 × 12 huecos (37 MB), en
    vez de reservar el mapa entero de cada nivel (el de 24 serían 75 MB). Un
    índice dice en qué hueco está cada tesela. Si se llena, sale la que lleva
    más tiempo sin usarse, nunca una que esté a la vista.
  - Solo se piden las teselas que caben, las más centrales primero. Las de
    respaldo (nivel de debajo) solo mientras la fina no ha llegado. Con esto,
    aunque se vean más teselas que huecos, no entran y salen sin parar.
    Probado con un atlas de 6 × 6 mirando al polo a ×6: se llena y se queda
    quieto. `?atlas=N` en el banco cambia el tamaño para probarlo.
  - `MARTE_V` a 4: el navegador guardaba el `marte-datos.json` viejo, sin el
    nivel 3.
- **Comprobado en Chrome**:
  - Gale a ×6 con muchos más cráteres pequeños.
  - Jezero con las fosas de Nili muy marcadas.
  - **El casquete norte entero a ×6** con sus espirales y Chasma Boreale:
    84 teselas y 3,5 MB para ir de ×1 a ×6 mirando al polo.
  - 0,25 ms por fotograma.
- **Visto y apuntado para el pulido**: en las llanuras (p. ej. Elysium
  Planitia) a ×6 hay algo de grano. Son rayitas finas norte-sur, seguramente
  las órbitas del MOLA, y puntitos sueltos. Es sutil. Si molesta: suavizar el
  relieve del nivel 3 (derivada a 1,5 celdas) o el color.
- **Falta**: que lo pruebe el usuario (trackpad y Zen) y el commit.

## Pulido del pixel art (desde el 21-sep-2026)

### 1. La sombra menos oscura

- Es la zona sin sol (a la derecha) y el suelo de las sombras del relieve.
  Lo controla `NOCHE` en `generar-marte.py`, que pasa a `marte-datos.json`
  (hoy 0,16, el valor de la Luna). La LUT ya tiene esos tonos: cambiarlo no
  toca los mapas ni las teselas, solo el JSON.
- **Banco**: en `zoom.html`, fila "sombra": **0,16 (la de ahora)**, 0,22, 0,28
  y 0,35. Cambian al momento (`marte.ajustaLuz({ NOCHE })` recompila el
  shader).
- Visto en Chrome: con 0,16 el lado oscuro es casi negro granate; con 0,28 se
  lee el terreno y sigue pareciendo de noche; con 0,35 se ve bastante. El
  relieve no se ve en la zona sin sol, porque no hay luz que lo dibuje.
  Mejor compararlo a zoom ×1.
- Se recomendó 0,28 y **el usuario eligió 0,22** (21-sep-2026). Aplicado:
  `NOCHE` = 0,22 en el generador, base regenerada (`--canvas ../public/marte/
  --niveles 0`, que reescribe el JSON; mapa y LUT salen idénticos) y
  `MARTE_V` a 5. Los botones siguen en el banco para comparar.
- Los PNG del paso 1 (`marte-tharsis.png`, `marte-syrtis.png`) se quedan con
  0,16: son el registro del boceto provisional.

### 2. Las llanuras de un solo tono (21-sep-2026)

- **Por qué salen lisas**: casi la mitad del planeta cae en el pico de brillo
  del mosaico (80-98), que es un solo material, y las llanuras son tan llanas
  que el relieve no dibuja nada.
- **Variantes** (`generar-marte.py --variante X`, solo la base, sin teselas:
  se comparan a ×1). Están en `prototipo-marte/llanuras/<variante>/`
  (`antes` = como estaba, un solo tono; B y C se generaron sobre esa):
  - **A · `dos-tonos`**: el material del pico se parte en dos tonos casi
    iguales (`DOS_TONOS`: corte en 89, `#a1613e` y `#ab6843`). Salen manchas
    suaves que siguen el brillo real (polvo, coladas).
  - **B · `bandas`**: cada 1000 m de altura suavizada, la banda impar se
    aclara un tercio de escalón (materiales 8-15 en la LUT). Son terrazas que
    dibujan las cuencas.
  - **C · `relieve-llanos`**: la exageración del relieve ×3 donde la pendiente
    es menor del 0,5 %, con rampa hasta el 3 %. Es como los mares de la Luna.
- **Banco**: `zoom.html`, fila "llanuras": "la de verdad" (con teselas),
  "antes", A, B y C. Recarga con los otros datos y la misma vista
  (`?datos=llanuras/X&vista=lat0,lon0,zoom`). Hay botones nuevos de sitio:
  **Utopia** (30, 115) y **Amazonis** (20, −155).
- **Visto en Chrome** (Utopia y Amazonis a ×1):
  - A rompe las llanuras con manchas suaves y naturales.
  - B hace terrazas, pero alrededor del volcán Elysium salen anillos
    concéntricos, como una diana: parece un mapa topográfico.
  - C llena las llanuras (y algo las tierras altas) de granitos: es lo que
    más empuja al realismo.
- **Elegida: A** (usuario, 21-sep-2026: "la A"), la recomendada.
  Aplicada:
  - Los dos tonos ya son lo normal en `MATERIALES` y `UMBRALES` del
    generador: 8 materiales con el hielo.
  - `--variante` solo admite ya las descartadas, B y C, por si se quieren
    volver a ver.
  - Base y teselas regeneradas y `MARTE_V` a 6. En el banco, "antes (un
    tono)" y "A · dos tonos (elegida)".
- **Arreglado de paso** en `marte-gl.js`: sin niveles finos (como en estas
  variantes), el shader no compilaba. GLSL no admite listas vacías y quedaba
  una coma colgando.
- Ojo al probar: Chrome guarda en caché los módulos JS del banco. Tras
  cambiar `marte-gl.js` hace falta recargar a fondo (Cmd+Mayús+R).

### 3. Las zonas oscuras "algo pardas" (21-sep-2026)

- Son los tres materiales oscuros: basalto muy oscuro (el corazón de Syrtis
  Major), regiones oscuras (Acidalia, Mare Erythraeum…) y la transición. Eran
  tres marrones (`#5c3c31`, `#724937`, `#8c563b`) que junto al naranja quedan
  apagados.
- **Solo cambia la LUT**: el mapa y las teselas son los mismos. Por eso se
  comparan con todos los niveles de zoom: `generar-marte.py --solo-lut
  prototipo-marte/oscuras/X.png --oscuras X`, y en el banco `?lut=`.
- **Variantes** (`OSCURAS` en el generador; `antes` = la de verdad):
  - **A · `basalto`**: el mismo marrón menos saturado y algo más frío
    (`#57443f`, `#6c5247`, `#885d46`).
  - **B · `gris-azulado`**: gris con un punto frío (`#4e474c`, `#655653`,
    `#845d49`), contraste con el naranja como en las ilustraciones clásicas.
  - **C · `chocolate`**: marrón más hondo y oscuro (`#4f3129`, `#67402f`,
    `#88543a`).
- **Banco**: `zoom.html`, fila "zonas oscuras" (recarga con la misma vista).
  Botón de sitio nuevo: **Acidalia** (40, −25). Syrtis Major sale con el
  botón Syrtis o con `?vista=10,85,1`.
- **Visto en Chrome** (Syrtis a ×1 y ×4, Acidalia a ×1):
  - A se lee como basalto y se separa mejor del naranja.
  - B da el contraste más fuerte a ×1, pero a ×4, con la pantalla llena de
    Syrtis, se ve fría, casi como un filtro (en la Luna se rechazó por "demasiado
    azul").
  - C gana contraste pero sigue terrosa.
- Se recomendó A. **El usuario rechazó A y B** (21-sep-2026): "no me gusta
  basalto ni gris, me gusta de hecho el pardo / chocolate, ¿son las más
  reales?".
  - Respuesta: sí, de las cuatro son las más fieles. En color real, las
    zonas oscuras de Marte son pardo oscuro (arena basáltica con polvo
    encima), algo menos rojas que las claras. El gris azulado sale de
    imágenes procesadas: el mosaico Viking coloreado, contrastes forzados.
  - Contraste: el albedo de las zonas oscuras es aproximadamente la mitad o
    un tercio del de las claras. En luminancia, el material más oscuro frente
    al polvo claro está a ~0,44 en el pardo y a ~0,37 en el chocolate: el
    chocolate se acerca un poco más.
  - El usuario: "el chocolate. O un pelín menos de contraste que
    chocolate". Se hizo **`chocolate-suave`**, a un 70 % del camino del
    pardo al chocolate (`#53342b`, `#6a4331`, `#89553a`). Comparado sin
    navegador (prueba en Node, Syrtis a ×1), la diferencia es sutil: deja
    Syrtis un pelín menos pesada.
  - **Aplicado el chocolate suave y confirmado por el usuario**
    (21-sep-2026): en `MATERIALES`, base regenerada (solo cambia la LUT) y
    `MARTE_V` a 7. En el banco: "la de verdad (chocolate suave)",
    "pardo (antes)", A, B, C y "C2 · chocolate suave (elegida)".
  - Durante esta comparación la ventana de Chrome cambió de tamaño y las
    capturas del navegador fallaron. Para comparar colores sin navegador:
    la prueba en Node con otra LUT en la carpeta de datos.

### 4. El casquete norte pequeño a ×1 (21-sep-2026)

- **Cuánto hielo hay en el mapa** (base, % de celdas por banda de 2°):
  entero hasta 84° N, a medias en ~83° N (57 % en 84-82°), y se acaba hacia
  76° N. El casquete residual real llega más o menos a 80-81° N: el nuestro
  es algo más pequeño, pero no mucho. El sur (pequeño y descentrado, 86-90°
  S) cuadra con el real.
- **Por qué se ve pequeño**: sobre todo por la vista. Con `lat0` = 10 el polo
  cae al 98 % del radio, casi en el borde, y el casquete se ve de canto.
- **Opciones**:
  1. **Casquete más amplio** (`--variante casquete-amplio`: umbrales de hielo
     `HIELO_R_MIN` 125, `HIELO_B_R` 0,72, `HIELO_T` 0,3; antes 150, 0,78,
     0,5). A medias en ~82,7° N en vez de ~83,2°: apenas se nota.
  2. **Vista inicial más inclinada al norte** (25° en vez de 10°). El
     casquete se ve de frente, como un óvalo arriba, y encaja con la Tierra
     de la portada (vista de horizonte inclinada, hemisferio norte). Es la
     vista con la que arrancaría la página `/marte`.
  3. Las dos.
- Comparado sin navegador (prueba en Node, Tharsis, `lat0` 10 y 25, con y
  sin casquete amplio): lo que cambia de verdad es la inclinación.
- **Banco**: `zoom.html`, botón "inclinar 25° al norte" (fila "ir a") y fila
  "casquete norte": "el de verdad" / "más amplio" (`?datos=casquete/amplio`,
  solo la base).
- Se recomendó la 3. **El usuario prefiere el casquete "de verdad"**
  (21-sep-2026: "me gusta más el de 'verdad'"): los umbrales de hielo no
  cambian. La variante `casquete-amplio` queda en el generador y en el banco
  como descartada.
- **Vista inicial más inclinada al norte** (opción 2):
  - Primero a 25° (el usuario: "vale, dale, que quiero ver cómo queda").
  - Al verlo: "no tanta inclinación, la mitad por lo menos de 25". Queda en
    **12,5°**: `lat0` por defecto en `marte-gl.js` y `marte.js`, y los
    botones Tharsis y Syrtis de los bancos. Aprobado: "está bien así".
  - Si elige el amplio: dejar los umbrales en el generador, regenerar base
    y teselas (unos 4 min) y subir `MARTE_V`.
  - Si elige la vista: `lat0` inicial = 25 (en el banco y en `/marte`).
- Una posible opción más, **no preparada**: un casquete "de invierno" más
  grande (escarcha estacional hasta ~65° N). Es real en invierno, pero no
  sale del mosaico: habría que inventar su borde.

### 5. El grano en las llanuras a ×6 (21-sep-2026)

- **Qué es** (visto a ×6 en Elysium Planitia, `?vista=3,150,6`):
  - Rayitas verticales discontinuas, de norte a sur. Son las huellas de las
    órbitas del MOLA, casi de polo a polo: entre pasadas el relieve se
    rellena y quedan escalones este-oeste que la derivada este-oeste recoge.
  - Puntitos oscuros sueltos: muchos son cráteres pequeños reales.
  - Líneas diagonales: parecen crestas reales y no se tocan.
- **Variantes** (`--variante X`, solo en los niveles de 16 px/grado o más,
  `GRANO_DESDE_PPD`):
  - **A · `grano-eo`**: derivada este-oeste a 3 celdas en todas partes. Quita
    las rayitas, pero **ablanda Gale y las mesetas** de alrededor.
  - **B · `grano-suave`**: A y además 1,5 celdas norte-sur. Algo más blanda
    todavía.
  - **C · `grano-llanos`**: la derivada este-oeste de 3 celdas **solo donde
    es llano** (pendiente regional por debajo del 1 %, con rampa hasta el
    4 %); en el relieve abrupto, la de siempre. **Quita las rayitas de las
    llanuras y deja Gale igual de nítido.**
- **Generar solo una zona**: `--zona lat_sur,lat_norte,lon_oeste,lon_este`
  saca solo las teselas que la tocan (unos segundos en vez de minutos). Las
  variantes están en `prototipo-marte/grano/<eo|suave|llanos>/`, con la base,
  n2 y n3 de la zona −12..18° N, 132..168° E (Gale y Elysium Planitia) y n1
  enlazado a `public/marte/n1`. Fuera de la zona, el banco cae al nivel 1.
  Sin variante, el generador saca las teselas idénticas a las de antes
  (comprobado).
- **Se comparó** (`zoom.html`, sin botones: por la URL):
  - Elysium: `?vista=3,150,6` (actual) y `?vista=3,150,6&datos=grano/llanos`.
  - Gale: `?vista=-5.4,137.4,6` y `?vista=-5.4,137.4,6&datos=grano/llanos`.
- Se recomendó C. **El usuario dijo "No. Déjalo como estaba"**
  (21-sep-2026): no se aplica ninguna. Las variantes se quedan en el
  generador como descartadas (`--variante grano-eo|grano-suave|grano-llanos`,
  y `--zona` para generar solo una zona). Los datos de prueba de
  `prototipo-marte/grano/` (6,4 MB de teselas) se borraron: se sacan de
  nuevo con `--canvas prototipo-marte/grano/llanos/ --niveles 0,2,3 --zona
  -12,18,132,168 --variante grano-llanos` (y un enlace de `n1` a
  `public/marte/n1`).

## Página /marte (21-sep-2026)

- **Lo que pidió el usuario**: montar la página `/marte` y "una animación
  parecida a la del blog 'el blog de hegoi marquez' que ponga mars project y
  que esté un par de segundos y desaparezca".
- **`src/pages/marte.astro`**, calcada de `/luna`: `PageLayout` con `hero` y
  `cabecera={false}`, las estrellas de la portada (siempre las de noche, como
  en `/luna`) y el lienzo de `marte-gl.js`. Se monta en cada llegada
  (`astro:page-load`) y se desmonta al salir (`astro:before-swap`), porque la
  web cambia de página sin recargar. La mano (`montarMano`) y el zoom
  (`montarZoom`) se agarran en todo el hero, como en el banco. El disco a ×1
  lo mide una sonda de 60 svh, también como en el banco.
- **La página no hace scroll** (`html:has(.marte-hero) { overflow: hidden }`):
  la rueda es el zoom. El pie de página existe pero no se ve.
- **El título, primera versión** (sustituida por la de las esquinas, ver "El
  título: esquinas que se cierran"; `.marte-titulo`, solo CSS): mismo tipo, contorno negro de
  1 px, velo oscuro detrás y barra de censura que el título de la portada.
  Centrado sobre Marte. Tiempos:
  - 0-1,3 s tachado; en 0,5 s se destacha (la misma animación de la
    portada, `hero-redact-in`).
  - 2 s a la vista.
  - Desde 3,8 s se vuelve a tachar en 0,5 s (como el de la portada al bajar)
    y desde 4,6 s se funde en 0,5 s. A los 5,1 s ya no está.
  - No estorba: el arrastre y el zoom funcionan por debajo desde el primer
    momento. Con "reducir movimiento" no hay barra: se ve y se funde.
- **Comprobado** (Chrome sin ventana desde la terminal, 1440 × 900; la
  extensión de Chrome no estaba conectada): Marte a ×1 con Tharsis, el
  título fotograma a fotograma (tachado, destachando, a la vista, tachando,
  fundiéndose), un arrastre que gira y seis golpes de rueda que acercan sin
  mover la página. `astro check` sin errores y lint limpio.
- **No hecho, a propósito**: sin menú HUD (aún no hay notas de Marte), sin
  botón de salir, nada enlaza a `/marte` (eso llegará con el Marte pequeño y
  el viaje), sin respaldo si no hay WebGL2 (pantalla de estrellas vacía) y
  sin nada para táctil (pendiente de decidir).

## La Tierra pequeña de /marte (22-sep-2026)

- **Lo que pidió el usuario**: "Si has ido desde la luna: aparece una
  pequeña tierra y aparece el botón de volver a la luna. Si has ido desde la
  tierra: aparece directamente una pequeña tierra y no hay botón ninguno."
- **La Tierra pequeña** (`public/zodk-tierra.png` y `zodk-tierra-noche.png`,
  de `node arte/generar-tierra-icono.mjs`): la Tierra de la portada
  (`planeta-quieto*.png`) reducida al lienzo del Marte pequeño (56 px de
  arte, ×3; radio 12), con halo azulado como el de la luna. Cada píxel es la
  media de los de la Tierra grande. De día o de noche según el tema. Se
  reconocen Europa y África.
- **En `/marte`**: `.marte-tierra` y su enlace, **arriba a la derecha**
  (`right: 3%`, `top: 5%`, como Marte en la portada; en el móvil top 6 %,
  112 px), por encima de Marte (con zoom, Marte llena la pantalla). Aparece
  con un fundido de 0,8 s al llegar, como el botón.
  - Primero se puso abajo a la izquierda con el vuelo de vuelta al revés. El
    usuario: "La tierra la quiero igual que el resto de esferas 'arriba a
    derecha' por ejemplo y la animación sería ir hacia adelante, no hacia
    detrás".
- **Al pulsarla, vuelo hacia delante** (`irATierra` en `marte.astro`), como
  los de ida:
  - La cámara gira hacia la Tierra pequeña, que viene hacia el centro y
    crece; Marte, tal como está, crece un poco y sale por abajo (el astro que
    se deja atrás, como la Luna en el vuelo de `/luna` a Marte).
  - La Tierra de la portada no es un disco centrado sino el horizonte de
    abajo: `volarALuna` admite `destino` (un `.hero-planet` puesto en
    `/marte` sin verse, para medir su caja) y, al final, mientras se acerca,
    la cámara **sube la vista** lo justo (`inclina`) para que la Tierra baje
    hasta su sitio. Una primera versión apuntaba la cámara desde el principio
    a ese sitio (por debajo de la pantalla): la Tierra se iba pequeña hasta
    el borde de abajo y crecía desde allí; no se leía como ir hacia ella.
  - La imagen que vuela es `planeta-quieto*.png` (la del tema), que es el
    fotograma con el que arranca la Tierra de la portada, puesta a ×2 en un
    lienzo cuadrado de 1200 con el disco en medio (`VUELO_TIERRA`). Aterriza
    encima de la de la portada.
  - Si estaba acercado, antes Marte se aleja hasta ×1 sin girar
    (`alejarAx1`, 1,6 s por cada e de zoom, curva de seno): el lienzo solo
    pinta lo que cabe en la ventana y, con zoom, al salir por abajo asomaba
    cortado en seco por arriba.
- **El botón** solo dice ya "volver a la Luna" y solo sale si se llegó desde
  `/luna` (`marte-desde`).
- **Comprobado en Chrome sin ventana**: portada → Marte (Tierra pequeña, sin
  botón) → Tierra; portada → Luna → Marte (Tierra pequeña y botón) → Luna;
  Luna → Marte → Tierra pequeña → portada; y el vuelo a la Tierra fotograma
  a fotograma sin zoom y desde ×3,5 girado. Sin errores.

## Luna ↔ Marte (22-sep-2026)

- **Marte en `/luna`**: el mismo Marte pequeño de la portada, arriba a la
  izquierda (`.hero-marte--luna`: `left: 5%`, 3 % en el móvil), en el sitio
  del sol y la luna de la portada; el menú de `/luna` va a la derecha y la
  columna de países, a media altura a la izquierda. Detrás de la Luna.
- **Vuelo Luna → Marte** (`volarAMarte` en `luna.astro`): `volarALuna` con
  `VUELO_MARTE`, y como astro que se deja atrás, la Luna grande
  (`.luna-disco`, con la cara que se esté viendo): crece un poco y sale por
  abajo, como la Tierra en el vuelo a la Luna. Se apagan el mando, "volver a
  la Tierra", las chapas, la columna, los relés, la Orion y el menú. La
  selección de la Luna (países y cara) queda guardada.
  - Para eso `viaje-luna.js` respeta ya la colocación del CSS del astro que se
    deja atrás (antes, `translateX(-50%)` fijo, el de la Tierra).
- **Vuelta a la Luna**: `/luna` deja `marte-desde = "luna"` en
  `sessionStorage` justo antes de ir; `/marte` lo lee y lo borra al llegar.
  Con él sale el botón "volver a la Luna" (con el icono de la cara visible):
  el vuelo de vuelta acaba en `/luna`, Marte encoge hacia arriba a la
  izquierda y la Luna vuelve desde abajo con la cara que se dejó (la lee de
  `luna-estado`). Llegar de otro modo, o recargar `/marte`, no saca el botón.
- En el vuelo de `/luna` a la Tierra, Marte se apaga (no gira con la cámara),
  como el sol y la luna en la portada.
- **Comprobado en Chrome sin ventana**: portada → Luna → cara oculta → Marte
  → Luna (sigue en la cara oculta) → Tierra; fotograma a fotograma los dos
  vuelos Luna ↔ Marte. Sin errores. El cursor de `/marte`: `auto` en
  reposo, `grabbing` al pinchar, `auto` al soltar. `astro check` y lint
  limpios.
- **Visto de paso, sin tocar**: en el vuelo de `/luna` a la Tierra, el menú
  de arriba a la derecha (alunizajes / relés / orion) no se apaga (ya pasaba
  antes). En el de Marte sí se apaga.

## Volver a la Tierra (22-sep-2026)

**Ya no hay botón "volver a la Tierra" en `/marte`**: se vuelve pulsando la
Tierra pequeña (ver arriba). El vuelo es el mismo que se describe aquí.


- **El botón** (primera versión, commit `9db68d3`): el mismo de `/luna`
  (clase `luna-volver`: "volver a la Tierra" con la Tierra pequeña y esquinas
  doradas, abajo a la derecha). Hoy ese botón solo sale para volver a la
  Luna.
- **El vuelo**: el de la portada al revés (`volarALuna` con `inverso` y
  `VUELO_MARTE`), como el de `/luna`: se ponen en `/marte` un Marte pequeño y
  una Tierra con las clases de la portada para medir dónde acaban. Marte se
  aleja hacia arriba a la derecha y la Tierra sube; en la portada, las
  estrellas quedan donde acabaron y la cabecera entra con un fundido.
- **Sale de Marte tal como se ha dejado** (usuario, 22-sep-2026: "No se
  podría hacer que el vuelo de regreso empiece desde donde esté el planeta en
  este momento?"):
  - Si se había acercado, primero se aleja hasta ×1 **sin girar**: con zoom
    el disco no cabe entero y no se le puede hacer la foto.
  - **Alejarse y volar son un solo movimiento** (opción `alejar` de
    `volarALuna`). El usuario pidió primero el alejamiento "algo más lento?
    se ve como forzada" y luego "a la misma velocidad más o menos que la
    vuelta a la tierra … que sea practicamente fluido". Cómo va:
    - El logaritmo del tamaño aparente de Marte (1 = ×1) baja de log(zoom)
      al del icono siguiendo UNA curva, E(x) = 6x² − 8x³ + 3x⁴: arranca desde
      parado, va más rápido hacia un tercio y frena despacio hasta el final.
    - Mientras el tamaño es mayor que 1, se aleja el lienzo (`ponZoom(z,
      true)`, sin el suavizado de la rueda). Al llegar a 1, la foto
      (`instantanea`) y sigue el vuelo sin pararse: del tamaño se saca la
      distancia de la cámara y de ahí el instante del vuelo, así que el giro,
      la Tierra y el fundido con el icono llegan donde siempre.
    - Duración: 6 s + 1,6 s por cada e de zoom (8 s desde ×3,5; 8,9 s desde
      ×6), para que la velocidad máxima sea la del vuelo de siempre.
    - Simulado con la geometría real (1440 × 900): desde ×3,5 pasa al vuelo
      a los 2,5 s yendo a su velocidad máxima (0,75 por segundo en
      logaritmo del tamaño; el vuelo de siempre llega a 0,82). Sin zoom, el
      vuelo empieza algo antes a moverse que el de la Luna.
    - Historia: primero se alejaba aparte en 0,3-1 s con curva cúbica y
      luego en 0,8-1,8 s con curva de seno; entre alejarse y volar quedaba
      casi un segundo parado. Se quitó (`alejarAx1`).
  - Luego vuela una **foto del lienzo** con el giro de ese momento
    (`instantanea(450)` de `marte-gl.js`: pinta y copia en el mismo paso,
    porque el lienzo WebGL no guarda lo pintado). `volarALuna` acepta ya un
    lienzo como imagen.
  - Al final, ya pequeño, se funde con el Marte de la portada, que tiene su
    cara de siempre (la vista inicial): a ese tamaño apenas se nota.
  - Mientras se aleja y vuela no hay mano ni zoom.
  - Primero se hizo al revés: Marte volvía a su vista inicial (giro y zoom)
    antes de despegar. El usuario prefirió que saliera tal cual.
  - Sin WebGL2 vuela Marte quieto (`marte-quieto.png`).
- `VISTA_INICIAL` (12,5° N, 80° O) vive ahora en `marte-gl.js` y la usan el
  motor y `generar-marte-quieto.mjs`; `VUELO_MARTE` (destino, icono e imagen
  del vuelo), en `viaje-luna.js`, y la usan la portada y `/marte`.
- **Comprobado en Chrome sin ventana**: portada → Marte, girar hasta ver el
  polo norte y acercar a ×3,5, volver (se aleja mirando al polo y encoge sin
  pararse hasta el icono, aterriza en la portada con las estrellas en su
  sitio) y otra vez a Marte. Sin errores. `astro check` y lint limpios. El
  vuelo a la Luna y el de ida a Marte no cambian (sin `alejar`, el motor
  hace lo de siempre).
- **En el Chrome del usuario no se pudo mirar**: la pestaña que abre la
  extensión queda en segundo plano (`visibilityState` "hidden") y Chrome
  congela las animaciones. Para usarlo, esa pestaña tiene que estar delante.

## Marte en la portada y el vuelo (21/22-sep-2026)

- **Lo que pidió el usuario**: "un 'marte' en pixel art … en la pagina
  principal del blog, pero a la derecha, para que desde la tierra se viaje a
  un lado o se viaje a otro … El vuelo seria similar al que se hace
  tierra-luna". Eligió el tamaño B, "un poco más pequeña que la luna", el
  enlace en la cabecera y "que haga el viaje".
- **El Marte pequeño** (`public/zodk-marte.png`, de `generar-marte.py
  --icono`):
  - Mismo lienzo que la luna (56 px de arte, ×3; ×2 en móvil) con **radio
    12 frente a 16** (tres cuartos).
  - Sale de los datos de Marte con la misma cara y la misma luz que la
    vista inicial de `/marte` (12,5° N, 80° O: Tharsis), para que el vuelo
    acabe en el mismo planeta.
  - Borde seco y halo cálido en tres escalones, como el de la luna.
  - Se probaron radio 11 y 12 y otros ajustes del relieve; se quedó el de 12
    con los ajustes del Marte grande.
- **En la portada** (`index.astro`, `global.css`): `.hero-marte` arriba a la
  derecha (`right: 3%`, `top: 5%`; primero al 5 %, simétrico al sol y la
  luna, y el usuario lo quiso "un poco más a la derecha"), detrás del
  planeta, de día y de noche. Encima, el enlace `.hero-marte-enlace` (círculo
  de 168 px, como el de la luna).
- **Cabecera** (`Header.astro`): `notas / eventos / moon-project /
  mars-project`. En la portada, `mars-project` hace el mismo vuelo que pulsar
  Marte (sin pasar a noche: Marte se ve siempre). En el resto de páginas es un
  enlace normal a `/marte`.
  - **Arreglo en el móvil**: con el enlace nuevo el menú no cabía; partía
    "moon-" / "project" por el guion y en la portada se salía por la
    izquierda (a 320 px). Ahora los enlaces no se cortan y la letra del menú
    baja en pantallas estrechas (`clamp(0.72rem, 3.6vw, 1rem)`: 11,5 px a
    320, 14 px a 390; desde ~440 px, los 16 de siempre). Comprobado a 320,
    360, 390 y 430.
- **El vuelo** (`viaje-luna.js`, generalizado): el mismo motor que el de la
  Luna, con el destino, el icono y la imagen como parámetros (por defecto,
  los de la Luna: su vuelo no cambia). Para Marte:
  - Destino: la caja de `marte-quieto.png` en `/marte` (`--marte-caja`,
    centrada, `dy` 0).
  - La cámara gira hacia la derecha, Marte crece y se centra, la Tierra sale
    por abajo ("encima", la variante elegida para la Luna) y las estrellas se
    desplazan; en `/marte` quedan donde acabaron.
  - Se apagan el título, las naves, las banderas y la cabecera, y también
    el sol o la luna (no giran con la cámara). En el vuelo a la Luna, Marte
    se apaga igual.
  - En `index.astro`, `montarViaje` y `montarEnlaceCabecera` sirven para los
    dos destinos (`LUNA` y `MARTE`); un solo vuelo a la vez.
- **El aterrizaje sin saltos**:
  - `public/marte/marte-quieto.png` (de `node
    arte/generar-marte-quieto.mjs`) es la vista inicial pintada por
    el propio motor (`marte.js` en Node), en píxeles de arte, 450 × 450.
  - Es la imagen que crece en el vuelo y el fondo de `.marte-disco` en
    `/marte` mientras carga el lienzo. Cuando el lienzo pinta, se oculta.
  - Para que caigan en la misma rejilla, los dos motores usan ahora un lienzo
    de arte de lado **par** (el centro del disco entre dos píxeles, como en
    la imagen).
  - Comprobado: el fotograma final del vuelo y `/marte` coinciden en sitio,
    tamaño y estrellas. **Hay que rehacer `marte-quieto.png` si cambian los
    datos de Marte** (y subir `MARTE_V`).
- **Comprobado en Chrome sin ventana** (1440 × 900): vuelo pulsando Marte (de
  noche) y con `mars-project` (de día), fotograma a fotograma; el vuelo a la
  Luna sigue igual y llega a `/luna`. Sin errores en la consola. Móvil a 320
  y 390. `astro check`, lint y `npm run build`, limpios; el panel del título
  no llega a la web publicada.
- **Sin hacer**: volver de `/marte` a la Tierra con el vuelo al revés, y
  Luna → Marte.

## El título: esquinas que se cierran (21-sep-2026) — QUITADO

**Registro: el 22-sep-2026 el usuario pidió quitar el título ("Quitamos el
titulo mars project con la animacion cuando llega al planeta").** Se borró
todo del código (marcado, CSS y panel). Lo de abajo queda como historia.


- **Lo que pidió el usuario** tras ver la primera versión: que al terminar el
  vuelo Tierra-Marte o Luna-Marte salga el título "con los mismos o unos
  recuadros similares a los que tiene 'el blog de hegoi marquez'", aguante
  un par de segundos y se vaya, con "una animación en la que los cuadrados
  se cierren, cerrando el título, dame opciones".
- **Montado** (sustituye a la barra de censura sola de la primera versión):
  - El título lleva las esquinas de `.hero-marco` de la portada (28 px,
    1,5 px, blanco al 85 %). Texto y marco van en la misma caja, y el texto
    se corta con el marco (`clip-path` con los mismos valores que el `inset`
    del marco).
  - Sin la sombra difusa del texto de la portada (el corte la dejaría en
    seco); el velo oscuro de detrás entra y sale en 0,6 s.
  - Entra cuando Marte ya está pintado (clase `.entra`, la pone
    `marte.astro`). Cuando haya vuelo, entrará al aterrizar.
  - La entrada es el mismo movimiento que la salida, al revés. A la vista,
    2 s (2,1 en A-C).
- **Opciones** (`data-cierre` en `.marte-titulo`; panel abajo a la izquierda
  con A-D, que las cambia y las repite; solo sale con `npm run dev`):
  - **A · al centro**: las cuatro esquinas se juntan en diagonal hasta un
    cuadradito, como un blanco fijado, que se apaga. 3,6 s en total.
  - **B · monitor viejo**: primero de arriba abajo hasta una raya y luego la
    raya se cierra al centro. 3,6 s.
  - **C · por los lados**: las esquinas izquierdas y derechas se juntan como
    dos puertas. 3,6 s.
  - **D · tachado y cierre**: se abre como A sobre el texto tachado y se
    quita la barra (como en la portada); al irse, la barra tacha y las
    esquinas se cierran sobre ella hasta un cuadradito negro. 4,5 s.
- Comprobado fotograma a fotograma en Chrome sin ventana (las cuatro).
  `astro check` y lint, limpios.
- **Elegida la C** (usuario, 21-sep-2026): "me quedo con C aunque me
  gustaría que lo pulieses un poco". Se quitaron A, B y D del código (quedan
  descritas aquí).
- **C pulida** (`data-cierre="c"`, 3,7 s), sin cambiar la idea:
  - Antes, al cerrarse quedaban dos rayitas sueltas arriba y abajo (los
    brazos de las esquinas) y se apagaban. Ahora, al juntarse las puertas,
    sale una **costura** vertical entera (`.marte-titulo-costura`) que se
    recoge hacia el centro.
  - Al entrar, lo mismo al revés: la costura crece desde el centro y de ella
    se abren las esquinas.
  - Las puertas se cierran con arranque y frenada suaves (antes, acelerando
    hasta el golpe). El velo entra y sale en 0,8 s, a la par que las puertas.
  - Tiempos: costura 0,2 s; se abre en 0,6 s; 2,1 s abierto; se cierra en
    0,55 s; la costura se recoge en 0,25 s.
  - La C de antes sigue como `data-cierre="c0"` y en el panel ("C antes")
    para comparar. Se quita con el visto bueno.
- Comprobado fotograma a fotograma (las dos).
- **Duda**: "mars project" (así está) o "mars-project" (como el enlace de
  la cabecera).

## La idea (contada por el usuario, 21-sep-2026)

Seguir la idea de `/luna` (ver `LUNA-WIP.md`), pero con Marte, y aprovechar
para **probar dos funciones nuevas**. Si funcionan, más adelante se llevarían
también a la Tierra y a la Luna.

1. **Zoom** con la rueda del ratón y con el trackpad. "La cantidad de píxeles,
   resolución, etc. variará según el zoom": al acercarse, el planeta gana
   detalle; no se limita a ampliar los píxeles.
2. **Barra espaciadora**: mientras se pulsa, el cursor pasa a una mano y el
   planeta se puede girar a voluntad hacia un lado y hacia otro, y mirar los
   polos norte y sur.
   - El planeta, algo más pequeño que la Luna de `/luna`.
   - Las chapas se quedan pegadas a su sitio mientras se gira y se hace zoom.

Para más adelante (dicho por el usuario): Marte en el mismo estilo pixel art,
fiel a los accidentes del terreno; las misiones que se han posado allí, con
chapa y ficha; un Marte pequeño en algún sitio que se pulse para viajar.

## Estudio (21-sep-2026)

### Qué se puede aprovechar

- **`src/scripts/luna.js` ya pinta una esfera en cualquier orientación en
  tiempo real**: es lo que hace durante la media vuelta de 2,8 s (`calcular()`
  con una matriz de orientación, a partir de un mapa lat/lon de material +
  normal del relieve). Sirve de base para girar Marte con la mano. Coste
  medido: 7-9 ms por fotograma en Zen a 600 px, sin las pasadas de limpieza.
- **`src/scripts/planeta.js` (la Tierra) gira casi gratis**: con la
  inclinación fija, cada píxel de pantalla cae siempre en la misma latitud y
  en la misma longitud relativa; girar es solo desplazar la columna del mapa.
- **`generar-luna.py`**: relieve (DEM) + albedo → material + normal + LUT. Para
  Marte es el mismo recorrido con otras fuentes y otra paleta.
- Chapas que siguen al terreno en cada fotograma: `alMoverBanderas` de la
  portada.

### Cómo girar sin gastar (la idea técnica)

Con el giro tipo globo, la orientación son solo dos números, igual que en
`orientacion(lat0, lon0)` de la Luna. Con eso:

- **Girar solo o arrastrar hacia los lados** = cambiar `lon0` con la
  inclinación fija. Es el caso de la Tierra: tablas por píxel calculadas una
  vez y desplazamiento de columna. Hasta la luz del relieve se puede
  precalcular por píxel, porque el eje del planeta no se mueve en pantalla.
  Barato.
- **Inclinar o hacer zoom** = rehacer esas tablas. Cuesta como un fotograma
  del giro de la Luna, y solo mientras se está haciendo.
- **Quieto** = no se repinta nada.

Lo que se arrastra hacia la zona de sombra se oscurece (la luz no se mueve).

### Zoom con detalle: pirámide de mapas por teselas

El píxel de pantalla no cambia de tamaño: lo que crece es el radio del disco
en píxeles de arte, y hace falta un mapa más fino para rellenarlo. Con el
disco a ~60 svh (radio de ~225 px de arte, con el píxel de la Luna) el mapa
base de 4 px/grado basta para el zoom ×1:

| zoom | px/grado | mapa entero  | peso aprox. (como el de la Luna) |
|------|----------|--------------|----------------------------------|
| ×1   | 4        | 1440 × 720   | ~1,5 MB                          |
| ×2   | 8        | 2880 × 1440  | ~6 MB                            |
| ×4   | 16       | 5760 × 2880  | ~24 MB                           |
| ×8   | 32       | 11520 × 5760 | ~95 MB (no se hace por ahora)    |

Los niveles finos se cortan en teselas y solo se baja lo que se ve: una
pantalla cuesta unos cientos de KB a cualquier zoom. Lo que sí crece es el
**repositorio**: `.git` ya ocupa 321 MB, así que hasta ×4 va bien (~30 MB) y
×8 (~125 MB, y otro tanto cada vez que se regenere) pesa. Mientras se itera,
las teselas no se commitean; solo la versión aprobada.

Qué se ve con el zoom ×4 (16 px/grado): el Olympus Mons ocupa ~170 px de
arte, el cráter Gale (Curiosity) ~40 y Jezero (Perseverance) ~12.

Detalles para cuando se programe:
- Trackpad: el pellizco llega como rueda con `ctrlKey` en Chrome y Firefox
  (en Safari, con los eventos `gesture*`).
- Si gira solo y hay zoom, la velocidad se divide por el zoom: si no, el
  terreno pasaría volando.
- La barra espaciadora hace scroll y pulsa el botón que tenga el foco: hay
  que anular eso mientras se usa para girar.

### Fuentes de datos (NASA/USGS, dominio público)

- **Relieve**: MOLA MEGDR (Mars Global Surveyor), a 4, 16, 32, 64 y
  128 px/grado. El de 16:
  `https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.img`
- **Color / albedo**: mosaico en color de las Viking, 925 m/píxel
  (64 px/grado, 23059 × 11530, 764 MB):
  `https://planetarymaps.usgs.gov/mosaic/Mars_Viking_ClrMosaic_global_925m.tif`
  (existe también a 232 m, 12 GB: no hace falta).
- Irán a `arte/marte-fuentes/`, sin trackear, como `luna-fuentes/`.
