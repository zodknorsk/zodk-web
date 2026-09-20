# La web calentaba en Zen — resuelto (portada y Luna)

**Estado al 20-sep-2026 (noche).** Resuelto, en la portada y en `/luna`. La
portada baja a **9,7-13,5 W** (antes 19,6), el pico del giro de cara desaparece
y el vuelo Tierra ↔ Luna ya no hace pico. Con la web abierta el portátil del
usuario está **en silencio y a unos 49 °C**. Queda un cabo suelto conocido y
medido: la Orion de `/luna` (ver su apartado). Este documento guarda cómo se
midió, los números y lo que se probó sin éxito.

## Cómo retomar esto (leer antes de tocar nada)

1. **Regla de oro al medir: vatios, no ventiladores, y sin grabar la pantalla.**
   Las dos veces que se ignoró esto el diagnóstico salió mal. Está explicado en
   "Cómo medir esto sin engañarse".
2. **Ahora hay medidor propio**: `zodk.eu/?medir` (o `localhost:4321/?medir`)
   pinta abajo a la izquierda los fps reales y los ms por fotograma partidos en
   *dibujo* (pintar el planeta píxel a píxel) y *volcado* (llevarlo a la
   pantalla), más el tamaño del lienzo. Con `?lienzo=N` se fuerza el múltiplo
   del arte (`?lienzo=5`, `?lienzo=3`…) y con `?lienzo=pantalla` se vuelve al
   lienzo de antes del 20-sep. Sirve para comparar nitidez y coste en Zen, que
   no se puede manejar desde fuera.
3. `/luna` tiene su propio banco de pruebas: `?orion=quieta`, `sin-z`, `capa`,
   `capa2` y `sin-sprite` atribuyen vatios a cada parte de la nave que orbita
   (las reglas están en `global.css`, la clase la pone `luna.astro`).
4. Lo que queda está en "Lo que queda suelto", y es menor.

Contexto general del proyecto: `CLAUDE.md` en la raíz. Detalle del hero y de la
Luna: `logo-files/HERO-WIP.md` y `logo-files/LUNA-WIP.md`.

## El síntoma

En Zen (el navegador del usuario, basado en Firefox) se disparan los
ventiladores y la temperatura de CPU y GPU al tener la web abierta. El usuario
lo notó sobre todo en `/luna` —en el giro de la Luna, en el vuelo Tierra ↔ Luna
y también con la Luna quieta— y apuntó un dato clave: **antes no pasaba**.
Cuando se terminó la Tierra v2 (13-sep) él mismo comprobó que en Zen no
calentaba. Empezó a pasar **después de tocar la Luna**.

## Cómo medir esto sin engañarse

Dos trampas, las dos caímos en ellas:

1. **El ventilador no sirve como medida.** Va con decenas de segundos de
   retraso: sube por lo que estabas haciendo hace un minuto y tarda en bajar.
   En la primera medición, con la Luna quieta el ventilador iba a 4629 RPM
   mientras la máquina tiraba 16,5 W; en la portada, con 27 W, iba a 2846 RPM.
   Justo al revés de lo que parecía. **Hay que mirar los vatios**, que reaccionan
   en unos 4 s. La temperatura también va con retraso, aunque menos.
2. **Grabar la pantalla falsea los números.** Las dos primeras mediciones se
   hicieron con CleanShot grabando a 120 fps, y eso mete del orden de **15 W**
   de su propia cosecha. La portada de noche marcaba 34 W grabando y 19,6 W sin
   grabar. Para comparar dos versiones, o no se graba, o se comparan dos tramos
   **dentro de la misma grabación** (la sobrecarga es la misma).

La herramienta que usa el usuario es **ThermalForge** en la barra de menús:
da RPM del ventilador, temperatura de CPU/GPU y **vatios**, que es el número
bueno.

## La causa

El planeta se dibuja en un lienzo de arte de **600×585 px**. El commit
**`625bffb`** ("Luna y Tierra: nitidez y velocidad en Firefox/Zen", 17-sep) —el
único que tocó `planeta.js` desde que nació la rama de la Luna— cambió cómo se
lleva ese dibujo a la pantalla:

- **Antes**: el `<canvas>` medía 600×585 y cada fotograma subía **solo la franja
  repintada** (`putImageData`). El CSS lo ampliaba y de eso se encargaba la GPU,
  gratis. Unos **0,35 megapíxeles por fotograma** en el peor caso.
- **Después**: el `<canvas>` intenta medir los píxeles reales de la pantalla
  —y en la práctica se quedaba en el tope `LADO_MAX` de **3000×2925**— y cada
  fotograma hace un **borrado completo más un reescalado completo** del lienzo
  entero (`vuelca()` en `src/scripts/planeta.js`): **8,78 megapíxeles, dos
  veces**, 17,6 MP de relleno por fotograma.

Es **50 veces más trabajo de relleno por fotograma**. A 60 fps era más de mil
megapíxeles por segundo, constantes, mientras el hero esté a la vista. Medido
después con `?medir`: 7,1 ms de volcado frente a 2,9 ms de dibujar la Tierra.

El cambio se hizo por un motivo legítimo: Zen suaviza un canvas pequeño ampliado
por CSS aunque lleve `image-rendering: pixelated`, y la Luna se veía borrosa. La
solución era correcta para la nitidez; el coste no se midió.

De noche es peor porque la aurora recibió el mismo tratamiento
(`vuelcaAurora()`), aunque su lienzo es pequeño (24 filas de arte): el grueso
sigue siendo el volcado del planeta.

## Lo que se ha hecho

### 1. Repintar a 30 fps en vez de 60 (20-sep, mañana)

`const FPS = 30` en `src/scripts/planeta.js`, junto a `vuelca()`; el bucle usa
`1000/FPS` para decidir cuándo pintar. El planeta da una vuelta cada 90 s: a
30 fps cada fotograma avanza 0,13°, que es invisible. Medido: **19,6 → 14,5-16 W**.

### 2. El volcado, en una pasada en vez de dos (20-sep, noche)

`vuelca()` borraba el lienzo entero (`clearRect`) y pintaba encima
(`drawImage`): dos pasadas de relleno sobre los mismos megapíxeles. Ahora pinta
con `globalCompositeOperation = "copy"`, que sustituye lo que había. El
resultado es idéntico —también con el cielo transparente, porque se cubre el
lienzo entero—, con la mitad de relleno.

### 3. El lienzo visible, a ×3 del arte (20-sep, noche)

Es el recorte grande, y salió de mirar el medidor en vez de razonar:

| | ×5 (como estaba) | ×3 (ahora) |
|---|---|---|
| Lienzo | 3000×2925 | 1800×1755 |
| Píxeles por volcado | 8,78 MP | **3,16 MP** |
| Volcado | 7,1 ms | **3,8 ms** |
| Dibujo (el planeta en sí) | 2,9 ms de noche · 1,1 de día | igual |

Dos cosas que solo se supieron al medir:

- **El lienzo estaba en ×5 por el tope `LADO_MAX` de 3000 px**, no por los
  píxeles de la pantalla: el hero del usuario mide más de 3000 px de
  dispositivo, así que **el CSS ya ampliaba un ×1,27 por su cuenta**. La
  nitidez 1:1 que se creía tener desde `625bffb` no existía.
- **El volcado cuesta 2,5 veces más que dibujar la Tierra entera.** Todo el
  esfuerzo de optimizar el pintado píxel a píxel habría sido perseguir la
  parte barata.

Como lo que falta de ampliación lo hace el CSS (la GPU al componer, gratis),
bajar el múltiplo solo se paga en nitidez. **El usuario comparó ×5 y ×3 de
noche, con las luces de ciudad, y las vio iguales**, así que `MULT_MAX = 3`.
Por debajo de ×2 (ventana estrecha) se sigue usando el tamaño exacto de
pantalla: ahí el múltiplo entero se veía suavizado, como ya se comprobó al
hacer `625bffb`.

## Lo que se midió al terminar

Con la máquina fría y **sin grabar la pantalla**, que es la única forma de que
los números valgan:

| Pantalla | Potencia |
|---|---|
| Portada de noche, antes de nada (60 fps) | 19,6 W |
| Portada, con los 30 fps | 14,5-16 W |
| Portada en frío, ya desplegada | 10,5-13,5 W |
| Portada de día a ×3 | **9,7 W** |

También quedó **descartado que localhost calentase más que zodk.eu**: en frío
localhost dio 10,5-12,4 W y zodk.eu 12,6-13,5 W (misma versión, la diferencia
es ruido). Lo que se vio el primer día era el retraso del ventilador, la trampa
nº 1 de aquí abajo.

## La Luna (`/luna`), misma noche

El usuario avisó de que `/luna` calentaba "bastante con las animaciones". Medido
con el mismo método, salieron dos cosas distintas: un gasto continuo (la Orion)
y un pico (el giro de cara). Solo el pico le molestaba.

### La Orion se lleva la mitad del consumo de la página, y no sabemos por qué

Poniendo el ratón encima de la nave se pausan todas sus animaciones, lo que da
una comparación limpia sin tocar código:

| | Potencia |
|---|---|
| `/luna` con la Orion orbitando | 6,7-7,5 W |
| Con la nave pausada | 2,8-3 W |

Cuatro hipótesis probadas con el banco `?orion=` (las reglas están en
`global.css`, junto a la nave; la clase la pone `luna.astro`), **las cuatro
descartadas**:

| Prueba | Qué hace | Potencia |
|---|---|---|
| `?orion=quieta` | para solo el movimiento; sprite y sombra siguen | **2,7-3,4 W** |
| `?orion=sin-z` | quita la animación de `z-index` | 6-7,2 W |
| `?orion=capa` | `will-change` en los envoltorios que se mueven | 6,1-7 W |
| `?orion=capa2` | `will-change` en el elemento que pinta el sprite | 6,1-6,6 W |
| `?orion=sin-sprite` | se mueve, pero pintada como un bloque liso | 6,5-7 W |

O sea: **todo el coste está en que la nave se mueva, y da igual qué se mueva o
cómo**. No es el sprite, no es rasterizar, no es la falta de capa propia y no es
el `z-index` arrastrando el grupo al hilo principal. También se probó a cambiar
el `filter: brightness()` de la sombra por una capa oscura con la opacidad
animada —lo que recomendaba este documento— y **no cambió nada**: se revirtió
para no dejar un PNG y una capa de más a cambio de cero vatios.

Queda abierto, pero **no urgente**: con la web en reposo el portátil está en
silencio y a unos 49 °C. Si alguien lo retoma, el banco `?orion=` ya está
puesto y lo siguiente que probaría es si el coste está en la composición de la
capa de la órbita sobre el lienzo de la Luna (esa capa está **a propósito sin
contexto de apilado** para que la nave pueda pasar por detrás del disco y por
delante; cambiarlo rompe el efecto).

### El giro de cara: el pico, resuelto

Subía la CPU de 50-54 °C a 60-64. Tres cosas, en orden de lo que aportó:

1. **Saltarse las dos pasadas de limpieza mientras gira** (`limpia = false` en
   `girar()`, `src/scripts/luna.js`). Recorren las 360.000 celdas dos veces por
   fotograma para quitar píxeles sueltos, y son la mitad larga del cálculo. En
   un giro de 2,8 s no se ven, y la cara con la que termina es un PNG ya limpio.
   Probado por el usuario: **"con sucio no se nota nada"**, y el pico desaparece.
2. **Tope de 60 fotogramas por segundo** en el giro. La pantalla del usuario va
   a 120 Hz, así que el cálculo se pedía hasta 120 veces por segundo. **A 30 fps
   se nota muchísimo** (lo probó: rechazado), a 60 no.
3. **El mismo arreglo que la portada en el lienzo**: volcado en una pasada
   (`copy`) y lienzo a ×3 del arte en vez del tope de 2400 (×4). De unos 11,5
   megapíxeles de relleno por fotograma a 3,2.

### El vuelo Tierra ↔ Luna: resuelto

Ya no hace pico. **El planeta seguía girando y repintándose durante los 6 s del
vuelo** —un volcado entero del lienzo por fotograma— mientras además se le
aplicaba una escala. Ahora `montarViaje()` (`src/pages/index.astro`) para el
giro al empezar el vuelo: el planeta se va encogiendo y alejando, así que no se
aprecia.

## Lo que queda suelto

1. **La Orion** (arriba): se lleva la mitad de los vatios de `/luna` y no
   sabemos por qué. Aparcado por decisión del usuario.
2. **Probarlo en el móvil**, que es donde el consumo importa de verdad y donde
   no se ha mirado nunca.
3. Cuando el tema se dé por cerrado del todo, se pueden borrar los bancos de
   pruebas: `?orion=` (`global.css` y `luna.astro`). El `?medir` y el `?lienzo`
   de la portada merece la pena dejarlos.

## Errores de diagnóstico, para no repetirlos

1. **Se culpó a la Orion antes de medir.** El razonamiento (cinco animaciones
   infinitas, un `filter` animado, sin capa propia) era sólido sobre el papel y
   los vatios lo desmintieron: la Luna entera estaba en 16 W y la portada en 27-33.
   Medir primero.
2. **Se usó el ventilador como señal.** Es la más engañosa de todas. Vatios.
3. **Se midió grabando la pantalla.** +15 W de sobrecarga en todas las lecturas.
4. **Se dio por hecho que el lienzo iba a los píxeles exactos de la pantalla.**
   Iba al tope de 3000 px, y el CSS ampliaba el resto. Bastó con imprimir el
   tamaño del lienzo para verlo. Antes de optimizar algo, imprimir lo que de
   verdad está pasando: el medidor lo pone en pantalla en una línea.

## Contexto que conviene tener a mano

- El motor de la Tierra es `src/scripts/planeta.js`; el de la Luna,
  `src/scripts/luna.js`; el vuelo, `src/scripts/viaje-luna.js`.
- El bucle de la Tierra ya **se para solo** cuando el hero no está a la vista
  (un `IntersectionObserver`) y cuando se pulsa el botón de play/pausa.
- El detalle de por qué el canvas se pinta como se pinta está en
  `logo-files/HERO-WIP.md` (la Tierra) y `logo-files/LUNA-WIP.md`, apartado
  "Pruebas en Zen" (la Luna).
