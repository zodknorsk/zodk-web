# Proyecto UAS (enciclopedia de drones) — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso: qué está hecho, qué no, qué está decidido y qué queda pendiente. Leyendo
solo esto hay que poder retomarlo, en el Mac o en el PC con Linux Mint.

## Dónde estamos (27-sep-2026)

**Rama `uas-project`** (creada desde `main` el 27-sep-2026). **Sin commitear**
todavía: este documento y la línea `arte/uas-fuentes/` del `.gitignore`.
Nada subido, nada fusionado: `main` y zodk.eu no tienen nada de esto.

**Hecho**:
- Paso 1: rama y este documento.
- Fotos de referencia del MICH-2000 buscadas y guardadas en
  `arte/uas-fuentes/mich-2000/` (fuera de Git, como `marte-fuentes/`; la
  lista con los enlaces está abajo, en «Fotos de referencia», para poder
  volver a bajarlas en el otro ordenador).

**Siguiente paso**: paso 2, el prototipo del visor en boceto con el
MICH-2000, en una página de prueba sin enlazar.

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
- [ ] 2. Prototipo del visor en **boceto 3D** (Three.js) con el MICH-2000, en
      una página de prueba sin enlazar. Solo se redibuja al arrastrar (nada de
      bucle continuo: el usuario usa Zen/Firefox, ver `docs/rendimiento.md`).
- [ ] 3. Del mismo modelo, versión **pixel art**: tira de sprites PNG con
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
