# Proyecto UAS (enciclopedia de drones) — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso: qué está hecho, qué no, qué está decidido y qué queda pendiente. Leyendo
solo esto hay que poder retomarlo, en el Mac o en el PC con Linux Mint.

## Dónde estamos (27-sep-2026, tarde)

**Rama `uas-project`** (creada desde `main` el 27-sep-2026). Pasos 1 y 2
commiteados (`14322ea`, `6069a83`), **sin subir** (la rama solo existe en
el Mac). Nada fusionado: `main` y zodk.eu no tienen nada de esto.

**Paso 3, versión pixel art: segunda versión funcionando, sin commitear**,
a la espera de que el usuario la vea (`localhost:4321/uas/prueba`, botón
«Pixel»). Comprobado con capturas (maqueta y pixel, día y noche, con parte
elegida). Sin probar: arrastrar, girar, zoom, Zen y el móvil.

**Siguiente paso**: lo que diga el usuario del pixel art; después, el paso
4 (campos de la nota en la bóveda).

## El pixel art (paso 3)

**Primera versión, rechazada (27-sep-2026)**: una tira de 39 dibujos de
128x80 generada con un script (la vuelta cada 10° y planta, perfil y
frente), en el blanco del «333». El usuario: «hay que detallarlo más, no
podemos dejarlo así» y «no me deja girarlo libremente, tiene una serie de
puntos predefinidos». Se borró (script y archivos; nunca llegó a commit).

**Segunda versión (la actual)**: la misma escena 3D de la maqueta, pintada
en directo a baja resolución (`src/scripts/uas-pixelado.ts`):
- Cada píxel de arte son 3 px CSS (`TAM_PIXEL`): ~240x140 en el visor de
  escritorio. Se gira y se acerca como la maqueta (libre, también arriba y
  abajo), y al acercarse gana detalle.
- Materiales propios: luz fija respecto a la cámara (arriba a la
  izquierda), cuatro escalones de paleta por pieza. Una pasada final amplía
  sin suavizar a un múltiplo entero exacto, pone el contorno de 1 px por
  fuera y oscurece donde la profundidad salta (separa cuerpo y ala).
- Solo pinta cuando algo cambia, como la maqueta. En «Pixel» se cambian los
  materiales de las mallas y se ocultan las aristas; lo demás (vistas,
  zoom, girar, chinchetas) es lo mismo.
- `?estilo=pixel` en la URL abre en pixel (para capturas).

**Color, pedido por el usuario (27-sep-2026)**: los dos modos en el
**negro original** del dron (el negro mate de la fábrica ucraniana), no en
el blanco del «333». Maqueta: relleno `#1d1f23` (noche `#1a1b1f`) con aristas
grises. Pixel: paleta negra de cuatro tonos, motor/hélice/antena en metal
gris, contorno casi negro de día y filo claro `#6b7079` de noche (si no, el
negro se pierde en la tarjeta). La parte elegida pasa a blanco papel en los
dos modos (en tinta negra no se vería sobre el dron negro).

**Más detalle y contraste (27-sep-2026, tarde)**, pedido por el usuario
(«haz el negro de la maqueta no tan oscuro, que se diferencien mejor las
partes, sobre todo de día» y «detalla más el pixel»):
- Maqueta: relleno `#454950` de día (noche `#2c2e33`) con aristas más claras,
  y luz con más contraste (hemisférica 1,7, direccional 1,9).
- Pixel: 2 px CSS por píxel de arte (antes 3; ~360x210 en escritorio) y
  tramado 2x2 en el paso entre tonos.
- Detalles de las fotos añadidos a la maqueta (salen en los dos modos):
  escarapela ucraniana a cada lado del morro (foto del morro), juntas entre
  las secciones del fuselaje (foto de las secciones) y elevones un tono más
  claros que el ala. Para ello, las piezas tienen `acabado` (negro, metal,
  junta, mando, amarillo, azul) y hay un tipo de pieza nuevo, `disco`. La
  parte «Fuselaje» resalta también sus juntas.

**Ajustes tras verlo el usuario (27-sep-2026, tarde)**: «ahora sí el
pixel art está mucho mejor» y el contraste, bien.
- Escarapela: el usuario preguntó si salía en las fuentes. Sí: en la foto
  del morro con los canards y en la de las secciones (Oboronka). Se queda.
- Juntas: son reales (la foto de las secciones enseña tramos unidos con
  anillos), pero su número y sitio son a ojo; así lo dice ahora la nota de
  la parte E. El usuario: «son mucho más suaves». Ahora apenas asoman
  (0,0012), más finas, sin raya de arista en la maqueta y solo un tono algo
  más oscuro que el cuerpo.
- Crédito, pegado a la esquina de arriba a la derecha, en tres líneas:
  «Maqueta creada a partir de fotos públicas. Hecho con» / Three.js /
  Claude Code (con sus iconos).
- **Consumo**: el usuario nota que sube algo al girar en Zen, sobre todo
  «en plan lavadora». Sin medir, se quitaron tres gastos claros: pintar a
  más de 60 fps (la pantalla del Mac va a 120 Hz), mirar en cada fotograma
  qué chinchetas tapa la maqueta (rayos contra todas las mallas; ahora
  cada 200 ms como mucho y una vez al parar) y medir el rótulo en cada
  fotograma (ahora solo al cambiar de texto). **Falta medirlo en vatios**
  (ThermalForge, sin grabar pantalla, `docs/rendimiento.md`): girar 20 s
  antes y después.

La geometría se separó del visor a `src/scripts/uas-geometria.ts` (vistas y
constructores de piezas).

**Nombre y receta (27-sep-2026)**: el usuario eligió **«el visor»** para el
recuadro completo. Pidió registrar el proceso para los drones siguientes:
está en `docs/uas.md` (qué tiene, medidas, colores, archivos, receta paso a
paso, capturas y lo que quiere y rechazó). Último ajuste: en la lista de
partes, la elegida lleva la casilla rellena en tinta y el nombre en negrita.

## Decisiones del paso 2 que siguen vigentes

**Color de la tarjeta, elegido por el usuario (27-sep-2026)**: opción
«tinta, sin color». Tarjeta `#ebebee` de día y `#25252a` de noche (un poco
más oscura / más clara que la página, idea suya); lo elegido va en tinta
(negro de día, blanco de noche); el único color es la bandera. Rechazados:
el verde azulado `#2f8f8a` («muy IA»), y comparados y descartados el azul
del blog, el naranja de señalización y el rojo de sello. Las páginas
temporales de comparación ya están borradas.

Hecho también: los iconos del crédito (Clawd, el de la tira «Hecho con»
de la portada, sacado de `STACK` en `src/consts.ts`, y el oficial de
Three.js de simple-icons).

## El visor (paso 2)

**Cambios del usuario sobre la tarjeta** (27-sep-2026, tarde): el panel
lateral lleva dos pestañas, **Partes** y **Fuentes** (las fuentes se
quitaron de debajo del visor para compactarlo); fuera el sello rojo y fuera
«Ficha UAS-UA-001» (la cabecera empieza con la bandera y «Ucrania»); el
crédito sube a la cabecera, a la derecha, donde estaba el sello; botón
**Maqueta / Pixel** en la barra (Pixel desactivado hasta el paso 3). En la
ficha de una parte, «Ver sus fuentes» salta a la pestaña de fuentes con
las que la respaldan marcadas.

**La forma** (misma tarde): el ala es ahora una pieza `ala` con perfil
(NACA simétrico, intradós más plano), gruesa en la raíz (0,17) y fina en la
punta (0,035), flecha de unos 41°; el fuselaje va medio hundido en ella. Se
quitó el hueco de la hélice en el borde de salida: no se ve claro en
ninguna foto (lo afirmaba drone-warfare) y sus escalones pintaban rayas
sobre el ala. Borde de salida recto, elevones detrás, motor y hélice al
final del cuerpo.

**Aspecto: «tarjeta de identificación»** (27-sep-2026). El usuario rechazó
la primera versión porque era «un calco» del visor de drone-warfare: quiere
la idea, no su diseño. Se montó un marco propio inspirado en las tarjetas y
manuales de reconocimiento de aeronaves:
- Cabecera en letra mono con la chapa de la bandera en pixel art (la misma
  función `svgBandera` que /luna y /marte) y el país.
- Partes con **letras** (A, B, C…) en etiquetas cuadradas. Al elegir una:
  la pieza se colorea, sale un rótulo unido por una línea a la chincheta, su
  ficha en el panel (qué la respalda: foto, reconstrucción o fabricante) y,
  en las fuentes, se apagan las que no la respaldan.
- **Tira de siluetas** (planta, perfil, frente, 3D) que hacen de botones de
  vista. Se pintan de la propia maqueta al cargar (cámara ortográfica
  ajustada a lo que ocupa) y se usan como máscara CSS, así cambian de color
  con el tema.
- **Fuentes**: miniaturas de las fotos (en `public/uas/mich-2000/fuentes/`,
  560 px, 316 KB en total) y dos artículos, con medio, enlace al original y
  qué partes respalda cada una.
- Crédito pedido por el usuario: «Maqueta de zodk.eu a partir de fotos
  públicas · Hecho con Three.js y Claude Code».

Archivos:
- `src/data/uas/tipos.ts`: qué es una maqueta (código, país, piezas, partes,
  fuentes).
- `src/data/uas/mich-2000.ts`: la del MICH-2000, **solo datos**. Un dron
  nuevo = un archivo nuevo aquí + sus miniaturas en `public/uas/<modelo>/`.
- `src/scripts/visor-uas.ts`: el motor, con Three.js (`three` en
  `package.json`). Tipos de pieza: tubo, ala (con perfil), placa, varilla,
  hélice. Pinta solo cuando algo cambia; el giro automático
  (botón «Girar», apagado al empezar) es lo único que pinta seguido y se
  para si el visor no se ve. En la URL, `?vista=arriba|lado|frente|detras`,
  `?parte=C` y `?pestana=fuentes` abren así (sirve para capturas).
  Teclado: flechas y + −.
- `src/components/VisorUAS.astro`: el marco, que se genera en el build con
  los datos (`<VisorUAS modelo="mich-2000" />`). Colores «tinta»
  (variables `--visor-*` al principio del `<style>`); sigue al botón de
  día/noche; una columna si es estrecho.
- `src/pages/uas/prueba.astro`: la página de prueba (no la enlaza nada).
  Ojo al fusionar: `@astrojs/sitemap` la metería en el sitemap; quitarla o
  sustituirla antes.

## Qué es el proyecto

Una «enciclopedia de UAS». La base de datos completa vive en la bóveda
(`boveda-osint/02 - Temas/La gran enciclopedia de los UAS./`, una nota por
dron). En la web solo sale lo que tenga `publicar: true`, en una sección
`/uas` con fichas y filtros (país, categoría…). Cada ficha puede llevar un
**visor**: una maqueta del dron que se gira, se amplía y enseña sus partes con
chinchetas, inspirado en el «Airframe explorer» de drone-warfare.com
(https://drone-warfare.com/research/mich-2000/). No se copia su código ni su
geometría: lo nuestro se hace desde cero.

Cómo lo hacen ellos (visto el 27-sep-2026): un componente web con WebGL a
pelo y la geometría generada por código a partir de fotos públicas; chinchetas
con líneas guía sobre cada pieza y un panel lateral con la explicación y si esa
pieza «se ve en las fotos» o es «reconstrucción»; vistas fijas (3D, arriba,
lado), zoom y giro automático opcional. Avisan de «proporciones ilustrativas,
sin escala».

## Plan

- [x] 1. Rama `uas-project` y este documento.
- [x] 2. Prototipo del visor en **boceto 3D** (Three.js) con el MICH-2000, en
      una página de prueba sin enlazar. Solo se redibuja al arrastrar (nada de
      bucle continuo: el usuario usa Zen/Firefox, ver `docs/rendimiento.md`).
- [~] 3. Del mismo modelo, versión **pixel art**: tira de sprites PNG con
      ~36 ángulos; arrastrar cambia de fotograma. Poner las dos lado a lado
      y que el usuario elija (o combine).
- [ ] 4. Campos de la nota de dron en la bóveda (proponer al usuario antes
      de tocar nada: `pais`, `fabricante`, `categoria`, `envergadura`,
      `alcance`, `carga`, `motor`, `primer_uso`, `modelo3d`; `tipo: objeto`
      es nuevo) y el orden en la regla `yaml-key-sort` del Linter.
- [ ] 5. Importador: que entienda la carpeta de la enciclopedia. Comprobar el
      punto final del nombre de la carpeta (`UAS.`) y la bandera 🇺🇦 del
      nombre del archivo (la URL tiene que salir limpia).
- [ ] 6. Página `/uas` con la lista y los filtros; ficha con el visor si la
      nota tiene `modelo3d`.
- [ ] 7. Explicar el merge al usuario y fusionar en `main`.

## Decisiones tomadas

- 27-sep-2026, usuario: el proyecto va en una rama propia de zodk-web
  (`uas-project`); la bóveda sigue en `main`. Las notas que se publiquen
  mientras tanto se publican desde `main`, no desde esta rama.
- 27-sep-2026, usuario: se empieza por el MICH-2000, como drone-warfare.
- 27-sep-2026, usuario: el asistente busca las fotos de referencia.
- 27-sep-2026, usuario: el visor no copia el diseño de drone-warfare; se
  hace la «tarjeta de identificación» propuesta. Crédito con Three.js y
  Claude Code. Sección de fuentes con las fotos OSINT y enlaces.

## Decisiones pendientes

- Estética del visor: boceto 3D, pixel art o una mezcla. Recomendación:
  construir un único modelo y sacar de él las dos, compararlas lado a lado
  (pasos 2 y 3) y que el usuario elija viéndolas.

## MICH-2000: lo que se sabe para modelarlo

- Ala volante en delta recortada (puntas cortadas), con **dos canards**
  pequeños a los lados del morro: es lo que lo distingue del Shahed.
- **Winglets verticales** en las puntas del ala.
- Fuselaje central de tubo que sobresale por delante del ala; morro
  redondeado.
- **Motor de explosión con hélice propulsora** detrás, en un hueco del borde
  de salida.
- Despegue con **cohete (booster)** desde un lanzador de raíles.
- Colores vistos: blanco (el «333» del lanzador) y negro mate (fábrica, con
  escarapela ucraniana).
- Basado en el chino **ZTK-150** (ingeniería inversa a partir de fotos de la
  fábrica, finales de 2023).
- **Ninguna fuente publica medidas fiables** (envergadura, longitud, peso,
  motor). Solo datos del fabricante sin verificar: alcance hasta 2.000 km,
  carga de 25–60 kg, unos 48.000 $. El visor irá **sin escala**, avisado como
  «reconstrucción ilustrativa».

## Fotos de referencia

Guardadas en `arte/uas-fuentes/mich-2000/` (no van en Git; hay un
`FUENTES.md` al lado). Para bajarlas en otro ordenador:

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

Artículo principal: Oboronka,
https://oboronka.mezha.ua/istoriya-dronu-mich-2000-314113/ (visitó la
fábrica). Otros: United24 Media, Ukrainska Pravda, Euromaidan Press,
defence-blog, tvd.im. Descartada la imagen de dronestrike.com: es un dibujo
que no se parece al MICH-2000.

**Falta** una buena vista cenital del dron montado; la planta se saca de las
fotos de la fábrica china y del lanzador.

## Registro

- 27-sep-2026: creada la rama `uas-project` desde `main`; fotos de
  referencia buscadas y guardadas; este documento.
- 27-sep-2026, tarde: primer prototipo del visor en boceto (Three.js), en
  `/uas/prueba`. Descartado el dibujo de dronestrike.com como referencia.
- 27-sep-2026: el usuario rechaza el primer marco por parecer un calco de
  drone-warfare; se cambia a la «tarjeta de identificación» con fuentes y
  crédito (Three.js y Claude Code).
- 27-sep-2026, tarde: pestañas Partes/Fuentes, crédito arriba, sin sello
  ni código de ficha, botón Maqueta/Pixel; ala con perfil y sin el hueco
  de la hélice.
- 27-sep-2026, tarde: iconos de Three.js y Clawd en el crédito; color
  «tinta, sin color» elegido entre cuatro opciones.
- 27-sep-2026, tarde: paso 3, primera versión del pixel art (blanco «333»,
  39 fotogramas); rechazada por poco detalle y giro a saltos. Segunda
  versión: pixelado en directo de la escena 3D. El dron pasa a negro mate
  en los dos modos. Luego: negro de la maqueta más claro, pixel a 2 px con
  tramado, escarapelas, juntas del fuselaje y elevones en otro tono.
