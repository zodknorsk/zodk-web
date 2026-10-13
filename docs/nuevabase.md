# Bases: la tarjeta de una base y cómo se hace una nueva (`/nuevabase`)

Cuando en una nota sale una base militar con su nombre oficial («Edwards
AFB», «Ramstein AB», «NAS Sigonella»), en la web lleva una tarjeta al pasar
el ratón, como los términos del glosario: el mapa de la base en pixel art,
su bandera, la rama, dónde está y qué es. Se hizo en la rama `ubicaciones`
(octubre de 2026).

## Decisiones del usuario

- **Solo bases**, de momento (no ciudades ni otros lugares).
- **Sin glosario ni página con todas**: los datos van en
  `src/data/bases.json`, no en la bóveda. En la bóveda no se marca nada: el
  nombre se enlaza solo si está escrito **igual que en `bases.json`**, que
  es el nombre oficial con su sigla (la regla de `docs/hangar-de-uas.md`,
  «Receta», paso 1).
- **El mapa**: la «versión 4» de las pruebas: 600 x 400 px de dibujo en un
  hueco de 300 x 200 px CSS (un píxel del dibujo por píxel de una pantalla
  retina), relieve de 30 m y, encima, lo de OpenStreetMap (ciudades sin
  rejilla, carreteras, agua, minas, pistas con su anchura; de cerca, calles
  y edificios con su sombra). **La vista se elige en cada base** entre
  cuatro: 10, 18, 40 y 90 km de ancho. Para Edwards, la de 90.
- **Nombres en el mapa** como los del Sáhara (mono blanca con contorno),
  menos en la vista de 10 km. Las regiones («Desierto de Mojave») van
  encima del terreno que nombran, no en la zona verde de al lado.
- Los accidentes en castellano, como en el Sáhara («Lago seco Rogers»); los
  pueblos con su nombre de allí, **solo en letras latinas** (`name:es`,
  `name:en`, `int_name`; si OSM no tiene uno latino, no se dibuja).
- **Coste**: las fuentes (~150-250 MB por base: relieve, mapas, OSM) se
  bajan para cada base y se borran al elegir; en Git queda el PNG (70-130 KB)
  y su entrada en `bases.json`.
- **La tarjeta: diseño B** (la pestaña oscura de la ventana del Sáhara con
  la bandera y el nombre, el mapa y debajo los datos en filas: rama con su
  escarapela, dónde, desde y MGRS; luego el texto).
- **Coordenadas, siempre en MGRS** («11S MU 19276 62930»), con
  `src/scripts/mgrs.js`, el de la portada. En `bases.json` se guardan
  `lat` y `lon`; el MGRS lo calcula la tarjeta.
- **El nombre en el texto**: en negrita, con el color del texto y la
  bandera de su país en pixel delante (así se distingue del glosario y se ve
  de dónde es cada base), sin raya ni puntos debajo; al pasar el ratón,
  fondo rojo muy claro.
- **Borde de la tarjeta en negro**, de 1,5 px (el de 2 px, demasiado gordo).
  La fila de las coordenadas se llama «Coord.» y van en MGRS.
- **La nota de la bóveda**: `Bases militares.md` (dentro de `Hangar de
  UAS`), con una sección por base: `## 🇺🇸 Edwards AFB`, el mapa
  (`![[base-<slug>.png]]`), la tabla (nombre oficial, país, rama, dónde,
  desde, coord.) y el texto. Es para retocar a mano el nombre oficial, el
  país, la rama, dónde, el año y el texto: `npm run importar` lo pasa a
  `bases.json`. El nombre de la sección, el mapa y las coordenadas no se
  cambian ahí (se hacen con /nuevabase). No se publica como página.
- El puntero es la marca roja del mapa. El nombre se marca solo la primera
  vez en cada artículo (y en cada tabla), como el glosario. Las demás veces
  va en un span sin tarjeta para que el glosario no marque la sigla
  («AFB») dentro del nombre.

### Probado y rechazado

- Tarjetas A (ficha con el mapa arriba) y C (tumbada, mapa a la
  izquierda): se eligió la B.
- Coordenadas en grados («34,906° N · 117,884° O»): siempre MGRS.

- Mapa de 150 px a 2 px CSS por píxel, y el de 300 px a 1 px CSS: le faltaba
  detalle («versiones 1 y 2»).
- Ciudades como un círculo de manzanas en rejilla según los habitantes (lo
  del Sáhara): el usuario pidió quitar el «enrejado».
- El perímetro de la base (de OSM): las relaciones salían rotas.
- El sombreado del relieve del Sáhara tal cual: un llano salía como montañas.
- Pintar como lago seco cualquier «arena» o «barro» de OSM: las balsas de la
  mina de Boron salían como una mancha lisa, como tapadas.

## La receta (`/nuevabase <nombre>`)

Todo desde `arte/`, en la rama `ubicaciones` (o en `main` cuando esté
fusionada). Necesita Python 3 con Pillow, curl y conexión.

1. **Datos.** Buscar en fuentes fiables (la web de la base o de su rama,
   Wikipedia en inglés para coordenadas) y añadir la entrada a
   `src/data/bases.json`, con la clave **exactamente como se escribe en las
   notas** (nombre oficial y sigla):
   - `slug`: el nombre en minúsculas con guiones (`ramstein-ab`).
   - `oficial`: el nombre oficial completo («Ramstein Air Base»).
   - `pais`: el código de `src/data/banderas.json` (si no está, se añade la
     bandera allí, en pixel 11x7, como dice su `_leeme`).
   - `rama`: en castellano con la sigla («Fuerza Aérea de EE. UU. (USAF)»).
   - `lugar`: región y país en castellano («Renania-Palatinado, Alemania»).
   - `lat`, `lon`: el punto de referencia del aeródromo (o el centro de la
     base si no tiene pista), con 4 decimales. Es donde va la marca.
   - `desde`: el año en que se abrió.
   - `texto`: una o dos frases de qué es y por qué suena, en castellano
     llano y en métrico; nada de «la instalación» ni «capacidades».
   - `nombres`: los accidentes y regiones que el lector reconoce, con un
     punto cada uno: `{"nombre", "clase": "accidente"|"region", "lat",
     "lon"}`. El punto de una región, dentro de ella y en el terreno que
     nombra. Los pueblos y ciudades salen solos de OSM.
2. **Fuentes**: `python3 fuentes-base.py <slug>` (unos minutos; Overpass a
   veces tarda). Con Pillow 11.3 el relieve falló al leer las piezas (`px`
   no admitía cortes); `fuentes-base.py` ya lo convierte en lista.
3. **Las cuatro vistas**: `python3 generar-base.py <slug>` (1-2 min) →
   `public/bases/prueba/<slug>-<km>.png` y `.json` (los nombres colocados).
   Dos interruptores, solo para cuando hagan falta (sin ellos todo sale como
   siempre):
   - `--sin-ne`: la mancha urbana sin Natural Earth, solo con OpenStreetMap.
     Para cuando esa mancha cubre bosque o campo (Fort Bragg: 371 km² que
     incluían todo el bosque de la base).
   - `--seco`: zonas desérticas como las de Oriente Medio. La estepa sale en
     pardo y la lluvia no se aumenta por la altura (la de WorldClim ya la
     lleva); sin él, FOB Gardez salía verde.
4. **Enseñarlas**: con `npm run dev`, la página
   `localhost:4321/bases/prueba/<slug>` (solo existe en local) y una captura
   de las cuatro para el usuario. **Parar aquí**: el usuario elige la vista y
   dice si cambiar algo (un nombre, dónde va, otra vista). Si hay dudas con
   la mancha urbana o con el verde, enseñar **las dos opciones** (con y sin
   el interruptor) una al lado de la otra **antes** de `--elegir`, que borra
   las fuentes. Para cambiar un
   nombre o su punto, se toca `bases.json` y se repite el paso 3 (las
   fuentes siguen ahí). Los pueblos los elige el script solo, por tamaño, y
   no tiene «excluir»: si salen demasiados (en Sigonella, 14), antes de
   `--elegir` se quitan a mano de `prueba/<slug>-<km>.json` los que sobran
   (queda el PNG igual, solo cambian los nombres que se dibujan encima).
5. **Elegir**: `python3 generar-base.py <slug> --elegir <km>` copia la vista
   a `public/bases/<slug>.png`, guarda sus nombres en `bases.json` (`mapa`)
   y **borra las pruebas y las fuentes**.
6. **La nota de la bóveda**: `node scripts/bases-nota.mjs <slug>` añade la
   sección de la base a `Bases militares.md` (sin tocar las demás; la crea
   si no está) y copia el mapa a sus `Adjuntos/`. Solo donde está la bóveda
   (el Mac o el PC): en una sesión en la nube, decirle al usuario que lo
   lance él.
7. Enseñar `git status` y `git diff` y esperar a que el usuario pida el
   commit.

## Dónde está cada cosa

```
src/data/bases.json            datos de cada base (y su mapa elegido)
arte/vistas_base.py            las cuatro vistas (km, px por grado, márgenes)
arte/fuentes-base.py           baja las fuentes a arte/bases-fuentes/<slug>/ (fuera de Git)
arte/generar-base.py           el mapa y los nombres; --elegir
public/bases/<slug>.png        el mapa elegido
src/components/BaseMapa.astro  el mapa con la marca y los nombres
src/components/BaseTarjeta.astro  la tarjeta del ratón
scripts/bases-nota.mjs         la nota de la bóveda: añade una base; el importador la lee
src/lib/bases-enlaces.mjs      marca el nombre en los artículos (plugin de Sätteri,
                               antes que el del glosario en astro.config.mjs)
src/pages/bases/prueba/        la página de las cuatro vistas (solo en local)
```

Fuentes y licencias: relieve Copernicus DEM GLO-30 y GLO-90 (ESA, libre con
atribución), lluvia de WorldClim 2.1, Natural Earth (dominio público) y
OpenStreetMap (© colaboradores de OSM, ODbL). Si la tarjeta se publica, OSM
pide la atribución en la web.
