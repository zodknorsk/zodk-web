# La portada calienta en Zen — investigación en curso

**Estado al 20-sep-2026.** Hay un arreglo hecho y medido (bajar el repintado a
30 fps) que recorta un 20-25 % del consumo, y quedan dos cosas por confirmar y
un par de mejoras por hacer. Este documento es para retomarlo en frío: explica
el síntoma, cómo se mide sin engañarse, qué se encontró, qué se hizo y qué falta.

## Cómo retomar esto (leer antes de tocar nada)

Si te han mandado aquí para seguir con el tema, el orden es este:

1. **Lee este archivo entero.** Está todo: el síntoma, las dos formas de
   medirlo mal, los datos, la causa y los errores que ya se cometieron.
2. **No toques código todavía.** Lo primero que falta es una **comprobación que
   solo puede hacer el usuario** (apartado "Lo que queda por hacer", punto 1):
   repetir la medición en orden inverso. Pregúntale si ya la hizo y con qué
   resultado antes de proponer nada.
3. **Regla de oro al medir: vatios, no ventiladores, y sin grabar la pantalla.**
   Las dos veces que se ignoró esto el diagnóstico salió mal. Está explicado en
   "Cómo medir esto sin engañarse".
4. **El paso 3 (lienzo a múltiplo entero) toca la nitidez del pixel art del
   hero**, que es lo que más le importa al usuario. Ahí no se decide sin
   enseñarle una comparación real.

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

## Lo que se midió

Primera sesión (grabando, así que ~15 W de más en todo, pero las proporciones
valen):

| Pantalla | CPU | Potencia |
|---|---|---|
| Portada, Tierra de día | 62→69 °C | 27-33 W |
| Portada, Tierra de noche | 70→74 °C | 31-37 W |
| Vuelo a la Luna | 77 °C | 37 W (pico, ~3 s) |
| `/luna` quieta | 60-65 °C | 16-18 W |
| Giro a la cara oculta | 74 °C | 35 W (pico, ~3 s) |
| `/luna`, cara oculta | 62 °C | 12,7 W |

O sea: **la Luna en reposo consume lo mismo que la máquina en reposo**. Lo que
calienta de forma sostenida es **la portada**, y la noche más que el día.

Prueba limpia final (sin grabar, portada de noche, 30 s en cada una):

| Versión | Potencia |
|---|---|
| `zodk.eu` (60 fps, código de antes) | **19,6 W** |
| `localhost` (30 fps, el arreglo) | **14,5-16 W** |

## La causa

El planeta se dibuja en un lienzo de arte de **600×585 px**. El commit
**`625bffb`** ("Luna y Tierra: nitidez y velocidad en Firefox/Zen", 17-sep) —el
único que tocó `planeta.js` desde que nació la rama de la Luna— cambió cómo se
lleva ese dibujo a la pantalla:

- **Antes**: el `<canvas>` medía 600×585 y cada fotograma subía **solo la franja
  repintada** (`putImageData`). El CSS lo ampliaba y de eso se encargaba la GPU,
  gratis. Unos **0,35 megapíxeles por fotograma** en el peor caso.
- **Después**: el `<canvas>` mide los píxeles reales de la pantalla (en la
  ventana del usuario, unos 2292×2233) y cada fotograma hace un **borrado
  completo más un reescalado completo** del lienzo entero (`vuelca()` en
  `src/scripts/planeta.js`). Son **unos 10,6 megapíxeles por fotograma**.

Es **30 veces más trabajo de relleno por fotograma**. A 60 fps eran unos 640
megapíxeles por segundo, constantes, mientras el hero esté a la vista.

El cambio se hizo por un motivo legítimo: Zen suaviza un canvas pequeño ampliado
por CSS aunque lleve `image-rendering: pixelated`, y la Luna se veía borrosa. La
solución era correcta para la nitidez; el coste no se midió.

De noche es peor porque la aurora recibió el mismo tratamiento
(`vuelcaAurora()`), aunque su lienzo es pequeño (24 filas de arte): el grueso
sigue siendo el volcado del planeta.

## Lo que ya se ha hecho

**Bajar el repintado de 60 a 30 fps** (`const FPS = 30` en
`src/scripts/planeta.js`, junto a `vuelca()`; el bucle usa `1000/FPS` para
decidir cuándo pintar). El planeta da **una vuelta cada 90 s**: a 30 fps cada
fotograma avanza 0,13°, que es invisible. Medido: **19,6 → 14,5-16 W**.

## Lo que queda por hacer

### 1. Confirmar que lo del ventilador en localhost era retraso térmico

Al probar el arreglo, el usuario vio que **en localhost saltaban los
ventiladores y la CPU se ponía a 60 °C**, cosa que antes no hacía, a pesar de
que los vatios eran más bajos. La hipótesis es la trampa nº 1 de arriba: midió
`zodk.eu` primero, que calentó la máquina, y localhost después, con el
ventilador y la temperatura todavía bajando.

**Para confirmarlo, repetir la prueba al revés**: dejar la máquina tranquila un
par de minutos, abrir **primero `localhost:4321`** (en frío) y **después
`zodk.eu`**. Si es retraso, localhost se queda fresco y el ventilador sube **al
cambiar a zodk.eu**. Si aun en frío localhost calienta más, hay algo que se nos
escapa y hay que perseguirlo.

Para levantar el servidor local con el sitio compilado:

```bash
cd ~/Documents/zodk-web
npm run build && npm run preview     # http://localhost:4321
```

(Ojo: eso deja un proceso de Node corriendo. Al terminar, `pkill -f "astro preview"`.)

### 2. Medir de verdad, con un `?medir` en la portada

Hasta ahora se ha razonado sobre dónde se va el tiempo, y la primera vez el
razonamiento falló (ver abajo). Lo que funcionó con el giro de la Luna en Zen
fue medir: `logo-files/prototipo-luna/canvas.html?medir` imprime los
milisegundos por fotograma.

**Falta montar lo mismo en la portada**: un `?medir` que separe cuánto cuesta
dibujar píxel a píxel (`draw()`) y cuánto cuesta volcar el lienzo (`vuelca()`).
Sin ese dato, el paso 3 es una apuesta.

### 3. Ajustar el lienzo visible a un múltiplo entero del arte

Hoy el lienzo se ajusta a los píxeles exactos de la pantalla: en la ventana del
usuario, una ampliación de **3,82×** sobre el arte de 600 px. Propuesta: usar el
múltiplo entero inmediatamente inferior (**3×**, o sea 1800×1755) y dejar que el
CSS haga el resto.

- Recorta el relleno alrededor de un **38 %** (de 5,1 a 3,16 megapíxeles por
  volcado).
- Y debería **verse mejor**: con una ampliación de 3,82×, unos píxeles del
  dibujo ocupan 4 píxeles de pantalla y otros 3, que es el temblor típico del
  pixel art mal escalado. A 3× exacto, todos iguales.
- Cuidado: en ventanas estrechas, donde la ampliación no llegue a 2×, hay que
  dejar el comportamiento de ahora o se volverá a ver borroso (fue justo lo que
  se probó y se descartó al hacer `625bffb`).

**Esto toca la nitidez del hero, que es lo que más le importa al usuario: hay
que enseñarle una comparación real antes de darlo por bueno.**

### 4. La Orion de `/luna` (pequeño, pero confirmado)

En `/luna` la única animación continua es la Orion: cinco animaciones infinitas
(posición X, posición Y, `z-index`, los 32 fotogramas del sprite y el brillo de
la sombra). El usuario confirmó con la prueba del ratón encima —que las pausa
todas— que **sí se nota**. En términos absolutos es poco (la página entera se
mueve en 16-18 W, casi el reposo de la máquina), pero hay dos cosas fáciles:

- **`filter: brightness()` → capa oscura con `opacity`.** En Firefox solo
  `transform` y `opacity` se animan fuera del hilo principal; `filter` fuerza
  repintado cada fotograma. El efecto visual se puede conseguir igual con una
  capa negra encima y la opacidad animada.
- **Bug**: la regla de `prefers-reduced-motion` de la Orion
  (`src/styles/global.css`, busca `.luna-nave-x, .luna-nave-y, .luna-nave`)
  pausa el movimiento pero **no `.luna-nave::before`**, que es donde están las
  animaciones del sprite y del brillo. Con movimiento reducido la nave se queda
  quieta pero sigue pasando fotogramas y pulsando. Hay que añadir `::before` a
  esa regla.

La capa de la órbita está hecha **a propósito sin contexto de apilado**, para
que la nave pueda pasar por detrás del disco (z 0) y por delante (z 3). Eso
impide que Firefox le dé capa propia en la GPU, así que repinta el trozo de Luna
que hay debajo en cada fotograma. Si algún día molesta de verdad, ahí está la
raíz — pero cambiarlo rompe el efecto de pasar por detrás.

## Errores de diagnóstico, para no repetirlos

1. **Se culpó a la Orion antes de medir.** El razonamiento (cinco animaciones
   infinitas, un `filter` animado, sin capa propia) era sólido sobre el papel y
   los vatios lo desmintieron: la Luna entera estaba en 16 W y la portada en 27-33.
   Medir primero.
2. **Se usó el ventilador como señal.** Es la más engañosa de todas. Vatios.
3. **Se midió grabando la pantalla.** +15 W de sobrecarga en todas las lecturas.

## Contexto que conviene tener a mano

- El motor de la Tierra es `src/scripts/planeta.js`; el de la Luna,
  `src/scripts/luna.js`; el vuelo, `src/scripts/viaje-luna.js`.
- El bucle de la Tierra ya **se para solo** cuando el hero no está a la vista
  (un `IntersectionObserver`) y cuando se pulsa el botón de play/pausa.
- El detalle de por qué el canvas se pinta como se pinta está en
  `logo-files/HERO-WIP.md` (la Tierra) y `logo-files/LUNA-WIP.md`, apartado
  "Pruebas en Zen" (la Luna).
