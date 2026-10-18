# Fase 3. La maqueta HD

Parte de `docs/nuevodron.md`, que se lee antes. Lo que pase con el dron, en su diario.

**Calidad antes que rapidez**: no se enseña una versión rápida para que el
usuario la corrija. Si no se le está corrigiendo, la primera versión es
mala: hay que hacer varias vueltas contra las fotos antes de enseñar nada.

**De los drones hechos se aprenden los fallos, no se reciclan sus piezas**:
cada dron se mide desde sus propias fuentes. (Excepción: una variante, que
importa la maqueta del original.)

## El archivo

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

## 1. Modelar bien el dron (lo más importante)

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
- **Cuando una foto sola no fija una medida** (la envergadura del SIRTAP:
  las puntas solo salían en una), encajar a la vez varias fotos y los puntos
  que se ven en más de una: `arte/uas-fuentes/sirtap/hd/conjunto.mjs`
  (Node, sin numpy; fuera de Git, solo en el Mac). Deja las cámaras en
  `<foto>.cam.json`, listas para `comparar-foto.mjs`.
- **El visor no ve más allá de unos 225 m**: con una cámara de teleobjetivo
  muy lejana, `comparar-foto.mjs` pinta el render vacío. Se acerca la
  cámara sin cambiar el encuadre con `acercar.py <cam.json> 150` (en la
  misma carpeta).

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

## 2. Color

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

## 3. Luz

La luz la pone el visor y **no se toca por dron**: sol casi encima (la parte
de arriba al sol, sin manchas de sombra; costados y panza más oscuros),
cielo de reflejos y teleobjetivo de 18°. Desde abajo el dron sale oscuro, y
así se queda. **En la maqueta no se pintan sombras ni degradados** copiados
de una foto: solo forma y pintura (lo negro de verdad, como la boca de un
conducto, es un hueco: acabado `hueco`).

## 4. Marcas, costuras y tornillería

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
- **Piezas repetidas (alas en X, molinillo) no llevan por fuerza las mismas
  marcas**: rayas y letras pueden ir solo en alguna ala o cara. Antes de
  pintarlas en todas, identificar en el render o la foto cuál es cada una
  (ocultándolas de una en una en `comparar-foto.mjs`) y poner en cada una
  lo suyo (el Hero-30).
- **Una calca con `espejo` da la vuelta al dibujo entero**: en el otro
  costado, una flecha acaba apuntando al revés. Lo que tenga dirección
  (flechas, «DIRECTION OF LAUNCH») lleva una calca propia en cada costado.

## 5. Cámaras y armamento

- **La óptica con su forma real**: cuerpo, cara, ventanas, cristal (algo
  verdoso), soporte (horquilla, brazo), pegatinas.
- **Las armas, del arma de verdad**, no del render ni de la foto del dron:
  se buscan fotos y medidas de la munición (maquetas 1:1 en ferias, cortes,
  fichas oficiales) y se escribe en metros reales. Del dron solo sale cómo
  va colgada. Con sus lanzadores, soportes y ganchos, pegadas.
- **El detalle del arma, de las fotos de la carga en tierra** (armeros
  montándola, museos): secciones, juntas, bandas, canal de cables, enchufe,
  tobera; y el lanzador con su forma (punta, raíl, tirador), no una caja.
- **Las armas y sus lanzadores, con un acabado mate propio** (como
  `gris-misil`): con el `aluminio` brillan como metal y no se parecen a la
  pintura de las fotos.

## 6. Accesorios: catapulta, rampa, cohete

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

## 7. Partes y fuentes del visor

- **`partes`**: 5 a 8 (más si hay catapulta), en el orden de las letras.
  Cada una: `nombre`, `en` (dónde va la chincheta), `piezas` que resalta,
  `respaldo` (`foto`, `reconstruccion` o `fabricante`), `fuentes` (ids),
  `texto` y `nota` (de qué foto sale, qué es supuesto). Con solo renders, lo
  que se ve en ellos va como `fabricante` y lo que no se distingue, como
  `reconstruccion`.
- **`fuentes`**: las fotos (con `imagen`, la miniatura) y los artículos (sin
  ella). Miniaturas: `sips -Z 560 -s format jpeg -s formatOptions 72 <foto>
  --out public/uas/<slug>/fuentes/<foto>.jpg` (~50 KB cada una).

## 8. Comparar antes de enseñar

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

## Probado y rechazado (no se reintenta salvo que lo pida)

Además de lo que ya dicen las reglas de arriba (cuerpo de cajas sueltas,
tomas en pareja o posadas, sombras pintadas, piezas pegadas «a trozos»,
sol debajo para la vista «Abajo»):

- Fuselaje de puro sin tomas ni carenados («de bulto»).
- Juntas marcadas y exageradas («son mucho más suaves»); piezas que no
  salen en ninguna foto (el hueco de la hélice en el ala del MICH).
- Biseles o cortes en una caja que no se ven claros en las fotos (la caja
  del sensor del X10D: «no merece la pena ni poner»).
- Letras y marcas de fábrica que el ejemplar elegido no lleva (las «H» y
  «V» de las alas del MICH).
- El `RoomEnvironment` de Three.js como entorno (quemaba a blanco); la
  penumbra de juntas con GTAO.
