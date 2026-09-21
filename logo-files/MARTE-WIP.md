# Proyecto Marte — documento de traspaso

**Este documento dice en qué punto está el proyecto.** Se actualiza en cada
paso (lo pidió el usuario el 21-sep-2026): qué está hecho, qué no, qué está
decidido y qué queda pendiente. Leyendo solo esto hay que poder retomarlo.

## Dónde estamos (21-sep-2026, tarde)

- Rama **`mars-project`**, creada desde `main` el 21-sep-2026. **Solo en el
  Mac, sin subir a GitHub.** Nada fusionado ni publicado.
- **Hecho**: estudio del proyecto (abajo), primeras decisiones y **paso 1:
  Marte provisional**, aprobado por el usuario y commiteado en la rama (dos
  caras de prueba en el banco, `logo-files/prototipo-marte/`).
- **En marcha**: paso 2, giro con la barra espaciadora. Primero hay que pasar
  el mapa al formato del `<canvas>` (material + normal, como `luna-mapa.png`)
  y montar el motor en JS.

## Plan (pasos cortos, en un banco de pruebas `logo-files/prototipo-marte/`)

- [x] 1. Descargar las fuentes y sacar un **Marte provisional** con el mismo
      recorrido de `generar-luna.py` (sin pulir: el pixel art definitivo va
      después), a ~60 svh. Enseñar un render. **Hecho y aprobado el
      21-sep-2026** ("me gusta mucho el enfoque… vamos muy bien"). Ver
      "Marte provisional" abajo.
- [ ] 2. **Giro con la barra espaciadora** (estilo Photoshop, ver
      decisiones).
- [ ] 3. **Zoom** con rueda y trackpad, hasta ×4, con la pirámide de mapas.
- [ ] 4. Dos o tres **chapas de prueba** pegadas al terreno (Curiosity,
      Perseverance…).
- [ ] Giro automático y botón, si se decide (ver pendientes).

Después, sin orden cerrado: pixel art definitivo de Marte, las misiones
(chapa, ficha y nota en la bóveda), página `/marte`, el Marte pequeño que se
pulsa para viajar, y la publicación (merge en `main`).

## Decisiones tomadas

- **Barra espaciadora, como la mano de Photoshop** (usuario, 21-sep-2026):
  con el espacio pulsado, el cursor es una mano abierta; con espacio + clic y
  arrastrar, mano cerrada y el planeta gira. Soltar el clic o el espacio
  termina el arrastre.
- **Zoom máximo ×4** (16 px/grado) "y vamos viendo" (usuario, 21-sep-2026).
  Si se queda corto, ×8 (32 px/grado), sabiendo que pesa cuatro veces más.
- Criterio propio, propuesto al usuario y sin objeciones (se cambia si lo
  pide):
  - Giro **tipo globo terráqueo**: norte siempre arriba y sin ladear;
    arrastrar a los lados cambia la longitud, arriba y abajo inclina hasta
    ver los polos.
  - El píxel no cambia de tamaño con el zoom: el planeta gana detalle.
  - Zoom **hacia el cursor**, como en un mapa.
  - Las chapas no crecen con el zoom.
  - La luz se queda fija respecto a quien mira, como en la Tierra.
  - El planeta, a ~60 svh (la Luna está a 80): se confirma con un render.

## Decisiones pendientes

1. **¿Marte gira solo?** El usuario lo está pensando (21-sep-2026). Dos
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

## Marte provisional (paso 1, 21-sep-2026)

- **Generador**: `logo-files/generar-marte.py` (Python estándar, como el de
  la Luna; ~6 s por cara). Script nuevo: `generar-luna.py` no se ha tocado.
  `python3 generar-marte.py --zoom` saca las dos caras y un recorte ×4 del
  centro de cada una en `prototipo-marte/`.
- **Banco**: `logo-files/prototipo-marte/index.html`. Servir la raíz del repo
  (`python3 -m http.server 4400`) y abrir
  `http://127.0.0.1:4400/logo-files/prototipo-marte/`. Enseña el disco a 60
  svh sobre las estrellas de la portada, con botones de cara y de zoom ×4.
- **Fuentes descargadas** en `logo-files/marte-fuentes/` (824 MB, en
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
- Irán a `logo-files/marte-fuentes/`, sin trackear, como `luna-fuentes/`.
