# Rendimiento: que no caliente

El usuario navega con **Zen** (basado en Firefox) en un portátil, y es ahí
donde se nota si la web calienta. En Chrome casi todo va fino, así que no
sirve de referencia.

## Cómo medir sin engañarse

1. **Vatios, no ventiladores.** El ventilador va con decenas de segundos de
   retraso (sube por lo que se hacía hace un minuto); los vatios reaccionan en
   unos 4 s. El usuario los mira con ThermalForge, en la barra de menús.
2. **Sin grabar la pantalla.** Grabar mete unos 15 W de su propia cosecha. Si
   hay que grabar, comparar dos tramos dentro de la misma grabación.
3. **Medir antes de optimizar.** Razonando sobre el papel se falló cinco
   veces seguidas: se culpó a la Orion antes de medir, se usó el ventilador,
   se midió grabando y se dio por hecho que el lienzo iba a los píxeles de la
   pantalla (iba al tope de 3000 px).

Medidores: `?medir` en los bancos (`arte/bancos/tierra.html` da ms por
fotograma a ×1; `marte-zoom.html`, a ×1 y ×6). La portada de antes tenía su
propio `?medir` en la página; el motor nuevo de la Tierra no lo tiene, así que
para el paso 8 se mide en el banco o en vatios.

## Lo que se aprendió

- **Lo caro era llevar el dibujo a la pantalla, no dibujarlo.** El planeta de
  antes se pintaba en un lienzo de arte de 600 px y se volcaba entero a un
  lienzo de 3000 × 2925 dos veces por fotograma (borrar y pintar): 17,6
  megapíxeles por fotograma a 60 fps. Tres arreglos: 30 fps (a 90 s por vuelta
  no se nota), volcado en una pasada (`copy`) y lienzo a ×3 del arte (el resto
  de la ampliación la hace el CSS, gratis). De 19,6 W a 9,7-13,5 W, el reposo
  del portátil, sin perder nitidez (comparado a ×5 y a ×3 de noche).
- **Zen suaviza un canvas pequeño ampliado por CSS** aunque lleve
  `image-rendering: pixelated`. Por eso los lienzos van a un múltiplo entero
  del arte (con la ventana estrecha, por debajo de ×2, al tamaño exacto).
- **Quieto no se repinta.** Los tres motores solo pintan cuando algo cambia;
  el de la Tierra gira a 30 fps y la mano y el zoom van a 60.
- **Durante un vuelo, el planeta se para**: se va encogiendo y el giro no se
  aprecia, y cada repintado costaba un volcado entero en el momento de más
  trabajo.
- **Giro de cara de la Luna** (motor viejo): saltarse la limpieza de píxeles
  mientras gira (en 2,8 s no se ve) y tope de 60 fps. A 30 fps "se nota
  muchísimo": rechazado.
- Nunca SVG animado con miles de formas: calienta en Zen. Canvas, WebGL o PNG.

## Cabo suelto: la Orion de `/luna`

Se lleva la mitad de los vatios de la página (6,7-7,5 W con ella orbitando,
2,8-3 W con la nave pausada) **solo por moverse**: da igual qué se mueva o
cómo. Se descartaron el `z-index` animado, `will-change` en dos sitios, el
sprite y el `filter` de la sombra. Lo siguiente que se probaría: si el coste
está en componer la capa de la órbita sobre el lienzo de la Luna (va sin
contexto de apilado a propósito, para que la nave pase por delante y por
detrás del disco). Aparcado: en reposo el portátil está en silencio y a unos
49 °C.

## Pendiente

- La Tierra nueva en Zen y en el móvil (paso 8 de `tierra.md`).
- El móvil en general, donde el consumo importa de verdad y casi no se ha
  medido.
