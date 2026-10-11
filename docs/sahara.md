# El Sáhara (/sahara)

Los conflictos con Marruecos en los siglos XX y XXI, en un mapa del Sáhara
en pixel art con un deslizador que recorre los hitos por fecha. Rama
`sahara-project` (sin publicar todavía).

## Qué se ve

- **El mapa**, a pantalla completa: del sur de Mauritania al Estrecho y del
  monte Tropic a Melilla (la caja). Con el ratón solo se puede mirar el
  **cajón**, el Sáhara Occidental y alrededores; arrastrar y acercar con la
  rueda, el trackpad o el pellizco, como la Luna y Marte.
- **Niveles de detalle**, como el zoom de la Tierra: 64 px/grado la caja
  entera, y el cajón también a 128, 256 y 512. Se pinta el más fino cuyo
  píxel mida al menos 2 px CSS. El zoom es continuo y al pararse se asienta
  en una escala entera (pixel art sin píxeles de dos tamaños).
- **Nombres** de países, regiones, mares, cabos, ciudades y pueblos, con el
  estilo de los de la Luna y Marte; salen según el zoom y sin pisarse.
- **El deslizador** (abajo): un hito por paso, por fecha. Cada hito lleva la
  cámara en un vuelo a su lugar y pone la chincheta; los de Ceuta, Melilla,
  Perejil, Rabat o el monte Tropic están en el mapa pero fuera del cajón:
  la cámara va y, mientras dura el hito, se puede mirar el mapa entero.
- **La ficha** (arriba a la derecha): en la pestaña, el número («01/61»,
  sin «Hito» delante, a petición del usuario), las banderas, la fecha y la
  tecla de plegar (plegada, solo queda el título; se recuerda en el
  navegador); debajo, título, lugar, foto de la nota (si la tiene), texto y
  «Leer la nota».
- **Capas por fecha**: líneas que salen según el hito, a bloques de píxel
  sobre el mapa (`public/sahara/sahara-capas.json`). Por ahora: la cinta de
  Bucraa (desde 1969; aproximada, en línea recta de la mina a El Marsa), el
  reparto con Mauritania (14-abr-1976 a 5-ago-1979; del tratado: de la
  costa en 24°N al cruce de 23°N y 13°O) y el muro (desde 1980, entero; de
  Natural Earth, simplificado).
- **Los lugares de fuera del mapa** (Madrid, Washington, Argel…): una
  ventana con su zona dibujada que entra por el lado por el que queda.

## Diseño (decisiones del usuario)

- **Papiro**: papel crema, tinta casi negra y rojo; serifa (Plex Serif) en
  el título y el texto, Mono en pestañas y teclas; borde liso de 2 px y
  sombra dura; la pestaña de la ficha sin fondo, en rojo como a máquina y
  con una línea discontinua debajo; «Leer la nota» girada como un sello.
  Historia: elegido primero entre tres (A «Hangar», B «Expediente», C
  «Mira»); B se rehízo a píxeles, en blanco y Plex Sans, porque «tenía el
  toque IA»; luego, entre siete temas probados en la página (píxel, papiro,
  terminal, teletexto, atlas, campaña y cuaderno), el usuario volvió al
  papiro.
- **Banderas en la ficha**: la del primer implicado en grande junto al
  título y las demás pequeñas en la pestaña. Descartadas: todas pequeñas en
  la pestaña y una línea de implicados con su nombre. La de Argelia se queda
  como está aunque a 2× recuerde a una cruz.
- **Relieve sombreado desde 0 m** (la Tierra empieza en 250): se ve el
  valle de la Saguía y lo bajo del cajón, aunque se pierdan algunas dunas en
  las laderas. `--relieve-desde` lo cambia.
- Lugares de fuera: la ventana. Probadas y descartadas: una flecha en el
  borde con la distancia («Madrid · 1880 km»), una Tierra pequeña en la
  esquina que giraba hasta el sitio (el motor de la portada) y la zona a
  pantalla completa con el mapa desplazándose.
- El mapa, solo de día y con el estilo exacto de la Tierra; con fronteras
  (la Tierra no las lleva): discontinuas de 2 px. El Sáhara Occidental va
  entero, con su frontera de 1975 (la de la ONU); Natural Earth dibuja el
  muro como frontera y eso se corrige en el generador.
- Mar por profundidad real, no por distancia a la costa; franja del talud
  (600-1.500 m) para que se vean el talud y el monte Tropic.

## Cómo se construye

```
 Obsidian                                  la web
 ─────────                                 ──────
 0 Timeline.md (📍 Lugar en cada hito) ┐
 notas con la etiqueta sahara-project  ├─ npm run importar-sahara ─┐
   (periodo y lugar si son hitos)      ┘                           │
                                         src/content/sahara/       │ /sahara/<nota>
                                         src/data/sahara/hitos.json ─ el deslizador
 src/data/sahara/lugares.json (nombre → coordenadas)  ─────────────┘
 arte/generar-nombres-sahara.py → public/sahara/sahara-nombres.json (nombres y pueblos)
 arte/generar-sahara.py         → public/sahara/n<ppd>/, fuera/   (el mapa y las zonas)
arte/generar-capas-sahara.py   → public/sahara/sahara-capas.json (capas por fecha)
```

- **Hitos**: ver `docs/contenido.md` («El Sáhara»). Una nota nueva con la
  etiqueta `sahara-project` y `periodo` y `lugar` entra sola en el
  deslizador. Un lugar que no esté en `lugares.json` lo avisa el importador.
- **Lugares**: las coordenadas, de GeoNames (los archivos por país: EH, MA,
  MR); lo que no está (Gdeim Izik, los campamentos de Tinduf), aproximado
  con fuentes. `generar-nombres-sahara.py` avisa si un sitio de tierra cae
  en el mar.
- **Motor**: `src/scripts/sahara-mapa.js` (canvas 2D, teselas por nivel,
  vuelos, chincheta), `sahara-nombres.js`, `sahara-lejos.js` (la ventana).
  Página: `src/pages/sahara.astro`; estilos: `src/styles/sahara.css`.

## Regenerar

Las fuentes van en `arte/tierra-fuentes/` (fuera de Git); cómo bajarlas, en
el docstring de cada script.

```bash
cd arte
python3 elevacion-sahara.py          # relieve de 15" (NOAA), ~200 MB
python3 elevacion-sahara-90.py       # relieve de 90 m del cajón (Copernicus), ~400 MB
python3 generar-nombres-sahara.py    # nombres, ciudades y pueblos
python3 generar-sahara.py            # los cuatro niveles (~15 min)
python3 generar-sahara.py --zonas    # las zonas de los lugares de fuera
python3 generar-capas-sahara.py      # capas por fecha (muro, reparto, cinta)
cd .. && npm run importar-sahara -- --borradores
```

Después, subir `SAHARA_V` en `src/scripts/versiones.js`.

Fuentes: costas y relieve de 15" del mosaico de NOAA (dominio público);
relieve de 90 m, Copernicus DEM GLO-90 («© DLR e.V. 2010-2014 and © Airbus
Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European
Union and ESA»: hay que citarlo en la web al publicar); países, manchas
urbanas, carreteras, ríos y lagos de Natural Earth 1:10m (dominio público);
ciudades y pueblos de GeoNames (CC BY); la línea del reparto de 1976, del
convenio de Rabat (ONU, Treaty Series n.º 15406).

## Pendiente

Más capas por fecha: Cabo Juby (franja de Tarfaya, hasta 1958; falta el
curso del Draa, que Natural Earth no trae), Ifni (entero hasta 1958 y
reducido hasta 1969), la Línea Negra de 1975, Guerguerat, las fases del muro
(1980-87) y la cinta con su trazado real (OpenStreetMap no respondió);
animaciones (Marcha Verde, Golondrina), el recuadro del Estrecho a mano, el bloque de la portada,
el móvil, medir en vatios, citar las fuentes en la página e importar sin
borradores antes de fusionar en `main`.
