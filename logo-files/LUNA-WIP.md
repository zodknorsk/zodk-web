# Proyecto Luna — documento de traspaso

Rama: `moon-project` (creada desde `main` el 16-sep-2026, todavía sin código:
solo este documento). Aparcado a propósito para retomarlo otro día, o con el
reinicio semanal de tokens. **Leer esto primero** al volver, antes de tocar
nada.

## La idea (contada por el usuario, 16-sep-2026)

En la portada de zodk.eu, al lado del planeta Tierra hay un icono de sol/luna
(`.hero-astro`, ver `HERO-WIP.md` y `CLAUDE.md`) que hoy es solo decorativo:
cambia de sol a luna según el tema claro/oscuro, pero no se puede pulsar.

La idea es que **pulsar sobre la Luna lleve a otra página** con un planeta
distinto: la Luna, en el mismo estilo pixel art que la Tierra del hero (mismo
enfoque de proyección, inclinación, resolución, sensación general), pero:

- **En vez de países/biomas/costas, hace falta relieve lunar realista**:
  cráteres grandes, montañas, mares lunares (los "maria", las manchas
  oscuras), tierras altas. Es un planeta sin agua ni vegetación, así que la
  paleta y la lógica de biomas de la Tierra no valen — hay que pensarlo de
  cero (probablemente un peinado de grises/albedo con sombreado por
  elevación real, más que "materiales" por bioma).
- **En vez de banderas de país, chapas en cada alunizaje**: sitios donde ha
  aterrizado algo humano — misiones tripuladas (Apolo) y sondas no
  tripuladas (soviéticas Luna, chinas Chang'e, indias Chandrayaan, privadas
  como SLIM/IM-1...). Cada chapa, igual que las banderas de país en la
  Tierra, despliega una ficha y enlaza a una entrada del blog sobre esa
  misión/alunizaje.
- **Rotación condicionada a los datos, no decidida todavía**: si todos los
  alunizajes que se acaban marcando caen en una sola cara (como pasa de
  hecho con casi todos los históricos, salvo alguna sonda a la cara oculta
  como Chang'e-4/6), el usuario prefiere que el planeta **no gire** (no
  tendría sentido mostrar una cara vacía). Si al final hay sitios repartidos
  por toda la esfera, que **gire igual que la Tierra**. Esto se decide
  cuando se tenga la lista real de sitios a marcar, no antes.

## Qué se puede reutilizar de la Tierra (`src/scripts/planeta.js` +
`logo-files/generar-planeta-hero.py`)

- El propio motor de canvas: proyección ortográfica con inclinación, giro
  continuo (o parado, ver arriba), luz/sombra por producto escalar con el
  sol, mipmaps de longitud para que no parpadeen los detalles finos cerca
  del polo. Todo esto es geometría pura, no depende de que sea la Tierra.
- El patrón de "chapa + ficha al pasar el ratón" de las banderas
  (`BANDERAS`/`CHAPAS` en el generador, `PAISES` en `src/data/paises.ts`,
  `.hero-bandera` en `index.astro`): para la Luna sería un
  `src/data/alunizajes.ts` (o similar) con sitio, misión, fecha, lat/lon,
  tripulada o no, y las etiquetas de artículo — un registro por alunizaje en
  vez de por país.
- El patrón de "relieve real desde un modelo de elevación" que ya existe
  para las montañas de la Tierra (`logo-files/etopo.tiff` + `elev.py` /
  `elevacion.py`, sombreado con `MTN_CONTRAST` etc.): para la Luna hace falta
  el equivalente lunar de ETOPO. Candidato natural: el modelo de elevación
  LOLA de la sonda LRO (NASA), de dominio público, servido por el equipo de
  Astrogeología del USGS — hay que buscar la URL/resolución concreta cuando
  se retome esto (no se ha descargado nada todavía). Para el albedo/textura
  de fondo (distinguir *maria* oscuros de tierras altas claras) el mosaico
  de la cámara WAC de la propia LRO es la referencia obvia, también público.
- El script de resaltado de contorno que se hizo para la Tierra
  (`logo-files/extraer-fronteras.py` → `fronteras.py`, en la rama
  `planeta-resaltado-pais-hover`) **no aplica tal cual** (no hay fronteras
  políticas en la Luna), pero la misma idea — trazar un contorno progresivo
  al pasar el ratón — podría reutilizarse para marcar el borde de un cráter
  grande o de un *mare* si en algún momento interesa.
- El patrón de máscara rasterizada por capas (`mapa_tierra.py`,
  `rasterizar.py`: fuente pesada sin trackear → módulo Python pequeño
  trackeado) es el mismo patrón a seguir para lo que sea que se rasterice de
  la Luna (relieve, límites de *mare*, cráteres con nombre...).

## Lo que es nuevo de verdad (no hay equivalente en la Tierra)

- Fuente de datos de relieve/textura lunar (ver arriba: LOLA + WAC, por
  confirmar al retomarlo).
- Lógica de "material" del terreno lunar: probablemente algo mucho más
  simple que los biomas de la Tierra (no hay clima) — quizá solo "*mare*"
  vs "tierras altas" por elevación/albedo, más el sombreado de cráteres
  grandes por relieve. Sin costas, sin desiertos, sin nubes (la Luna no
  tiene atmósfera — ojo, esto también afecta a si tiene sentido dibujar
  "cielo"/limbo con el mismo brillo de atmósfera que la Tierra, o quitarlo).
- Base de datos de alunizajes: hay que compilarla a mano (son pocos, no hace
  falta un dataset enorme como Natural Earth) — sitio, coordenadas, misión,
  fecha, agencia/país, tripulada o no, y a qué entrada del blog enlaza.
- Decisión de si el planeta gira o no (pendiente de esa lista, ver arriba).
- Una ruta/página nueva en Astro para este segundo planeta, y hacer que el
  icono de la Luna en la portada de la Tierra sea un enlace de verdad.

## Estado

Nada de código hecho todavía — solo esta idea y este documento. Antes de
escribir una sola línea: reunir la lista de alunizajes a marcar (eso decide
lo de la rotación) y encontrar/descargar el modelo de elevación lunar.
