# Proyecto Luna — documento de traspaso

Rama: `moon-project` (creada desde `main` el 16-sep-2026). Primer boceto de
la cara visible hecho y aprobado: ver "Estado". Aparcado a propósito para retomarlo otro día, o con el
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

### Decisión de diseño (16-sep-2026)

Los alunizajes/chapas se aparcan: primero se diseña la Luna. **Dos caras
FIJAS** (no gira): la **cara visible**, luminosa, con la historia de
alunizajes, y un botón que lleve a la **cara oculta**, más oscura (luz rasante,
media luz; ojo, la "cara oscura" es un mito, es decisión de estilo), con las
naves chinas y futuras. Idea para el cambio: la Luna gira media vuelta en 1-2 s
al pulsar el botón y la luz cambia a la vez. Protagonista posible de la cara
oculta: la cuenca Polo Sur-Aitken (ahí alunizaron Chang'e 4 y 6).

### Cara visible — PRIMER BOCETO APROBADO (16-sep-2026)

- Generador: `logo-files/generar-luna.py` (Python estándar, ~9 s). Imagen
  estática 600x600 (radio 292,5, como la Tierra), norte arriba, de frente.
  `python3 generar-luna.py --derecha --zoom` saca la aprobada:
  `prototipo-luna/luna-visible-derecha.png` (+ zoom x4 del centro).
- Banco de pruebas: `logo-files/prototipo-luna/` (servir la raíz del repo con
  `python3 -m http.server 4400`, abrir `/logo-files/prototipo-luna/`).
- Fuentes (NASA, dominio público, en `logo-files/luna-fuentes/`, gitignored,
  ~70 MB; los `curl` están en el docstring del script): relieve LOLA
  `ldem_16.img` (16 px/grado) y mosaico de color LROC WAC 4k del CGI Moon Kit
  (SVS 4720), pasado a BMP con `sips`.
- Aprobado por el usuario:
  - **Luz por la derecha** (`LADO` = 1), fase 38°, subida 14°. Por la
    izquierda la sombra tapaba el Mar de las Crisis.
  - **Penumbra original** (`TERM_A/B` = -0,01/0,30). Se probó una más corta
    (0,15) y la descartó: "la de antes está bien".
  - Colores por albedo en 6 materiales (`ALBEDO`: mares gris algo frío,
    tierras altas gris algo cálido, rayos claros) con las rampas de la Tierra.
  - Cráteres: relieve con exageración 3,2, sombras proyectadas cerca del
    terminador y **limpieza** (`DERIV_DEG` 0,22, `ALB_BLUR` 3, `LIMPIAR` 2:
    sin ella salía grano de foto).
  - **Relieve rasante** (`RELIEVE_ELEV_MAX` = 30°): con el sol alto los
    cráteres del centro salían blandos, de un solo tono (82 % de píxeles sin
    escalón de relieve). Para sombrear el relieve el sol no sube de 30°
    (mismo azimut); luz general y sombras proyectadas siguen con el sol real.
- En `prototipo-luna/` quedan también descartes para comparar:
  `luna-visible.png` (luz por la izquierda) y `…-penumbra-corta.png`, ambos
  ANTERIORES al relieve rasante.

### Cara visible — mares retocados: V2 APROBADA (17-sep-2026)

Al usuario la visible le parecía "de poca resolución" (la oculta menos, por
los cráteres). Causa: en la visible los mares se amontonan en albedo 80-89 y
el corte de 76 los partía en manchas de dos grises casi iguales; y los mares,
llanos, no tenían relieve que diera bordes nítidos.
- **Aprobada V2**: `--derecha --valles --relieve-mares 2.5`
  (`luna-visible-derecha-valles-rm2.5.png`). `--valles` = umbrales de albedo
  en los valles del histograma (`ALBEDO_VALLE`: un solo "mar" de 66 a 104);
  `--relieve-mares 2.5` = exageración del relieve ×2,5 donde el albedo es de
  mar (rampa `MARES_A/B` 100-120): salen las arrugas de lava.
- Descartes: V1 (solo `--valles`), V2a (relieve ×1,8: menos grano pero
  arrugas flojas), V2b (×2,5 con `--suave-mares 2`, derivada más larga en los
  mares: más suave; el usuario prefirió la V2 tal cual, con su grano), y
  `--limpiar 4` (no cambia casi nada: el grano va en grupitos, no sueltos).
- Pendiente: pasar estos ajustes a `CARAS`/`--canvas` (el mapa del giro usa
  un solo juego de umbrales y relieve para las dos caras).

### Cara oculta — PRIMER BOCETO APROBADO (17-sep-2026)

- `python3 generar-luna.py --oculta --sur --zoom` saca la aprobada:
  `prototipo-luna/luna-oculta-sur-f65.png` (**O2** en el banco de pruebas).
- Mismo generador, paleta, limpieza y relieve que la cara visible; solo
  cambian encuadre y luz:
  - **Encuadre**: de espaldas a la Tierra (`LON0` = 180) e **inclinada 30° al
    sur** (`LAT0` = -30), para que la cuenca Polo Sur-Aitken (~53° S, 191° E) y
    los sitios de Chang'e 4 y 6 queden en el centro-abajo del disco.
  - **Luz por la derecha, fase 65°** (`--fase`): el tercio izquierdo en
    sombra y los cráteres junto al terminador en luz rasante.
- Descartes: fase 90° ("media luz", O3 en el banco: la mitad izquierda negra y
  Chang'e 4 casi en sombra), 115° (casi todo a oscuras, ni se enseñó) y de
  frente sin inclinar (O1: Aitken queda pegada al borde de abajo).
- Aún no es "más oscura" que la visible (la cara oculta es casi toda tierras
  altas, claras). Si se quiere apagar: brillo general o paleta.
- El botón "marcas" del banco de pruebas dibuja el contorno aproximado de
  Aitken y los dos Chang'e encima (solo referencia, no es parte del dibujo).
- Corregido de paso: el eje de giro en vista tenía el signo de `LAT0` al
  revés (`az`); con `LAT0` = 0 (cara visible) no cambiaba nada.

### Cara oculta oscura — D3 APROBADA (17-sep-2026)

- `--oculta --sur --valles --relieve-mares 2.5 --exposicion 0.6 --frio 0.5`
  (`luna-oculta-sur-f65-valles-rm2.5-e0.6-frio0.5.png`): luz al 60 % y tono
  frío suave. Lleva también los mares de la V2 (el mapa del giro es uno solo).
- Descartes: D1 luz 70 % (tras el giro apenas se nota el cambio), D2 50 %
  (plana y sucia), D4 60 % con frío 1 (demasiado azul, parece un filtro).
  El usuario dudó y pidió criterio: se eligió D3.

### Página /luna y vuelo desde la Tierra (17-sep-2026, a revisar por el usuario)

- **`src/pages/luna.astro`** (ruta `/luna`): mismo fondo de estrellas que la
  portada (`PageLayout hero`), la Luna centrada (`.luna-disco`, tamaño
  `--luna-tam` en `global.css`) y un **botón PLACEHOLDER** abajo
  (`.luna-cambio`, texto "cara oculta"/"cara visible") que da la media vuelta.
  Sin JS se ve la cara visible (fondo del div).
- **Datos en `public/luna/`** (`generar-luna.py --canvas public/luna/`, con
  `CARAS` = V2 y D3). Al regenerar: subir `LUNA_V` en `src/scripts/luna.js` y
  el `?v=` de `luna-visible.png` en `global.css` (`.luna-disco`).
  - Durante el giro cambian a la vez vista, fase, exposición (1 → 0,6) y tono
    frío (0 → 0,5; LUT con `FRIO_PASOS` = 5 tonos intermedios).
  - **Gira siempre hacia el mismo lado**, a la ida y a la vuelta: la
    superficie se mueve hacia la DERECHA (`SENTIDO` = -1 en `luna.js`; lon0
    siempre decrece). Pedido del usuario; se probó antes hacia la izquierda y
    era "al revés".
  - Mapa con normales en 64 niveles (`NORMAL_NIVELES`): 1,5 MB (antes 2,3).
    Se baja en segundo plano tras enseñar la cara; si se pulsa antes, el giro
    espera.
- **Vuelo**: en la portada, de noche, un enlace `.hero-luna-enlace` sobre la
  luna de arriba a la izquierda (el sol no enlaza). Al pulsar (`montarViaje()`
  en `index.astro`), la cara visible crece desde el disco del icono hasta su
  sitio en `/luna` en 2,2 s mientras la Tierra baja, encoge y se apaga (acaba
  al 85 % del tiempo) y el título, naves y demás se apagan; al terminar,
  `navigate("/luna")` (ClientRouter). La Luna de `/luna` arranca con la misma
  imagen en el mismo sitio. Las estrellas no se mueven (así casan con las de
  `/luna`). Siempre aterriza en la cara visible. Con reduced-motion, directo.
- Pendiente: que el usuario lo pruebe (Chrome, Zen, móvil); dibujo definitivo
  del botón; volver a la Tierra desde `/luna` (hoy solo con el logo/cabecera).

### Siguiente

1. ~~Cara oculta~~ (hecho, ver arriba).
2. **EN CURSO (17-sep-2026): media vuelta en `<canvas>`** (el usuario eligió
   canvas frente a dos PNG con fundido). Motor en `src/scripts/luna.js`, banco
   de pruebas `prototipo-luna/canvas.html` (botón "girar"; en consola
   `luna.fotograma(0.5)` pinta un fotograma intermedio sin animar).
   - **En reposo se pinta el PNG aprobado** de cada cara, tal cual. Solo
     durante el giro (1,6 s, ease-in-out) se pinta en tiempo real: la vista va
     de (lat0 0, lon0 0, fase 38°) a (lat0 -30, lon0 180, fase 65°) interpolando
     los tres; luz siempre por la derecha. Con la Luna quieta no gasta CPU.
   - Datos: `python3 generar-luna.py --canvas prototipo-luna/canvas/` →
     `luna-mapa.png` (1440x720, 4 px/grado: R = material por albedo, G/B =
     normal del relieve ya exagerada), `luna-lut.png`, `luna-datos.json` y copia
     de las dos caras aprobadas. **El mapa pesa 2,3 MB**: aligerar antes de
     publicar (normales con menos niveles, WebP sin pérdida…).
   - En tiempo real es la misma luz que el generador (terminador, relieve
     rasante, autosombra, limpieza de 2 pasadas) salvo sombras proyectadas y
     supermuestreo; el último fotograma y el PNG casi no se distinguen, así que
     el cambio al PNG al acabar no se nota.
   - Mipmaps solo en longitud (como la Tierra): con pirámide 2x2 salían bloques
     en abanico alrededor del polo sur.
   - Rendimiento (Mac, Chrome): ~12 ms por fotograma tras calentar; el primero
     tarda ~45 ms, por eso se pinta uno en un rato libre al cargar. Falta
     probarlo en Zen y en móvil.
   - Con `prefers-reduced-motion` cambia de cara sin giro.
3. ~~Página nueva en Astro y enlace desde el icono de la Luna~~ (hecho, a
   revisar: ver "Página /luna y vuelo desde la Tierra").
4. Después: chapas de alunizajes (lista de candidatos abajo).

## Candidatos a alunizaje/sonda (repaso del 16-sep-2026, sin decidir aún)

Repartidos por categoría. **Dato clave para lo de la rotación** (ver
arriba): casi todo esto está en la cara VISIBLE; los únicos en la cara
OCULTA son Chang'e 4 y Chang'e 6 (China). Si entran esos dos, el planeta
tiene que girar; si el usuario se queda solo con cara visible, puede quedarse
quieto.

- **Tripulados — Apolo (EE. UU., cara visible):** 11 (Mar de la Tranquilidad,
  1969, primer paso humano), 12, 14, 15, 16, 17 (1972, el último). El 13 no
  cuenta, no llegó a alunizar.
- **Programa soviético Luna (cara visible):** Luna 9 (1966, primer alunizaje
  suave de la historia), Luna 16/20/24 (retorno de muestras sin
  tripulación), Luna 17 y 21 (róvers Lunojod 1 y 2, primeros vehículos con
  ruedas en otro cuerpo celeste). Luna 2 fue un impacto deliberado, no un
  aterrizaje.
- **Surveyor (EE. UU., cara visible):** 1, 3, 5, 6, 7 — aterrizajes suaves de
  prueba antes de mandar gente.
- **China — Chang'e:** Chang'e 3 (2013, cara visible, róver Yutu);
  **Chang'e 4 (2019, cara OCULTA**, cráter Von Kármán, róver Yutu-2: primer
  alunizaje de la historia en la cara oculta); Chang'e 5 (2020, cara
  visible, retorno de muestras); **Chang'e 6 (2024, cara OCULTA**, primeras
  muestras traídas de la cara oculta).
- **India:** Chandrayaan-3 (2023, primer éxito indio, cerca del polo sur
  lunar — zona de interés por el hielo de agua). Chandrayaan-2 se estrelló
  en 2019 (candidato si se quieren incluir también fracasos).
- **Japón:** SLIM (2024, alunizaje de precisión, cráter Shioli, cara
  visible).
- **Privados (EE. UU.):** Intuitive Machines "Odysseus"/IM-1 (2024, primer
  alunizaje privado con éxito, cerca del polo sur, aunque acabó tumbado de
  lado) e IM-2 (2025); Firefly "Blue Ghost" (2025, éxito); Astrobotic
  Peregrine (2024, fallo, no llegó a posarse).
- **Israel:** Beresheet (2019, intento privado, fallo — se estrelló).

Pendiente: el usuario decide qué entra de esta lista antes de avanzar con el
código (rovers vs solo alunizajes, si se incluyen fracasos, polo sur como
zona destacada por el hielo...).
