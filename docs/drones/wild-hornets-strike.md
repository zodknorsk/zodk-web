# Wild Hornets Strike — diario

## Dónde estamos: fase 3 terminada, sigue la 4 (pixel)

- **Maqueta HD** en `src/data/uas/wild-hornets-strike.ts` (247 piezas; las partes del visor se sacan por prefijo con `ids()`), dada por buena el 22-10-2026. Granada de mortero de 81 mm con la espoleta delante, cuello con cinta y tapa negra detrás, cables del detonador a la placa.
- Ocho acabados nuevos (`carbono-wh`, `carbono-gris`, `cobre-wh`, `muelle-wh`, `oliva-wh`, `amarillo-wh`, `campana-wh`, `helice-wh`).
- Fotos de referencia extra (Digital y Queen Hornet, mismo marco) en `arte/uas-fuentes/wild-hornets-strike/extra/` (fuera de Git).
- Commiteado en `main`, sin push. **Sin commitear a propósito**: la ficha provisional `src/content/uas/wild-hornets-strike/index.md` (la escribe el importador en la fase 5) y la nota de la bóveda.
- Siguiente: `/nuevodron Wild Hornets Strike. Fase 4` (pixel).

## Decisiones del usuario

- 22-10-2026: dron elegido, el **Wild Hornets Strike** (Ucrania), FPV de ataque de 10 pulgadas.
- 22-10-2026: versión **Strike 10" estándar** (una sola ficha; analógico/digital, en el texto).
- 22-10-2026: carga **ojiva de 2,5 kg** (la óptima del fabricante; la máxima es 3 kg).
- 22-10-2026: el avión de las marcas lo elige Claude (el que tenga más fotos de varios lados).
- 22-10-2026: la **cruz negra** de las fotos oficiales es la peana de exposición: no va en la maqueta.
- 22-10-2026: **con batería** encima, como en vuelo (las fotos oficiales salen sin ella); va como reconstrucción.
- 22-10-2026: la espoleta es la parte **gruesa** de la granada y va delante: en la foto del soldado el dron vuela hacia la izquierda; el bultito negro de la cara gruesa es la espoleta. Los muelles de impacto, **casi horizontales** (8° hacia abajo), no a 30°.
- 22-10-2026: el usuario pide **todo el detalle posible** en cada pieza (cuerpo, cámara, motores, hélices, ojiva, batería).
- Título de la nota y slug: `Wild Hornets Strike` → `/uas/wild-hornets-strike` (la maqueta, `src/data/uas/wild-hornets-strike.ts`).
- 22-10-2026: la **granada** se da por buena; la espoleta se queda delante, como en la foto del soldado (en abierto no hay una regla: unas llevan la original y otras no).

## Medidas clave

Del fabricante (https://wildhornets.com/en/fpv-drone-with-10-inch-propellers-analog): hélices 1050 (10 in = 25,4 cm), motores 3115 900KV, ESC 55 A, batería 6s3p o 6s4p, VTX 2,5 W, cámara analógica de día o térmica Caddx IRC-640CA / IRC-384CA. Crucero 80 km/h, máxima 120 km/h, vuelo 50–300 m (máx. 2.000 m), ida 30 km, con vuelta 20 km, hasta 25 min. Carga óptima 2,5 kg, máxima 3 kg. **No publica longitud, envergadura ni peso**.

Maqueta (en cm; el usuario pide detalle antes que medidas): motores a ±17 (x) y ±15 (z), 44 cm en diagonal; hélices de 25,4 cm. Placas de 23,4 x 3,9 cm, a 3,6 cm una de otra. Riostras del 82 % del brazo de detrás al 66 % del de delante (foto de arriba). Mástil de 20 cm subiendo hacia atrás. Muelles de impacto en el 57 % del brazo de delante, 8° hacia abajo; varilla de 14 cm. Ojiva de 35 cm: cabeza y cuerpo Ø 7,8 cm (z de 16,3 a −4), hombro, cuello Ø 5 cm con cinta (−8,6 a −15), tapa negra Ø 4,1 cm detrás; espoleta Ø 2,2 cm delante (proporciones de la foto del soldado). Batería 6s3p de 14 x 6,8 x 4,6 cm. 1 unidad = 25 cm.

## Fuentes

Las de la nota (`## Fuentes`). Fotos (en `arte/uas-fuentes/wild-hornets-strike/full/`, fuera de Git, bajadas el 22-10-2026; sin licencia libre):

| Archivo | Qué enseña | Autor | URL |
|---|---|---|---|
| wh-10inch_1.png | De tres cuartos por delante y desde arriba, sin hélices, con los muelles (331×400) | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/10inch_1.png |
| wh-10inch_2.png | Perspectiva con hélices (480×400) | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/10inch_2.png |
| wh-10inch_4.png | Desde arriba (322×400; en fase 2 se anotó «desde abajo»: es la placa de arriba) | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/10inch_4.png |
| wh-bg_10_analog_full.jpg | Perspectiva sobre negro (490×271) | Wild Hornets, web | https://wildhornets.com/wp-content/themes/hornets/images/bg_10_analog_full.jpg |
| extra/inch17_*.png, extra/zen*.png | Queen Hornet 17" y antiaéreo Digital (mismo marco que el Strike: cuerpo, cola, soportes) | Wild Hornets, web oficial | https://wildhornets.com/en/anti-aircraft-fpv-drone-digital |
| dronexl-soldado-ojiva.jpg | En vuelo con la munición colgada; modelo menor, solo para la carga | DroneXL | https://cdn.dronexl.co/wp-content/uploads/2024/02/img_0615.jpg |

## Probado y descartado

- Fotos de DroneXL (bosque, caja negra encima) y Kyiv Post (mesa con drones pequeños): descartadas por el usuario, 22-10-2026. Commons y prensa: sin fotos libres del Strike.
- Tuits del Strike para «En acción»: búsqueda sin resultados (22-10-2026).
- El film transparente de la ojiva como calcas `rect` con color rgba: salía a manchas, como camuflaje. Quitado; la ojiva va sin film.
- Tapas de cartón claras en los extremos de la batería: salían como placas blancas que no se ven en la foto. Quitadas.
- `espejo` en una pieza con `girar` sobre y: el reflejo gira sobre el centro del otro lado y sale suelto. Se hace con `aLosDosLados` (dos piezas, el ángulo cambiado de signo).

## Registro

- 22-10-2026: fase 1. Página del fabricante bajada con `curl` (WebFetch da 403). Hay otra ficha, «Anti-aircraft FPV drone, digital» (10", 0,3 kg, 140 km/h): es otro dron, solo se menciona.
- 22-10-2026: fase 3. Maqueta entera en una sesión; dos vueltas contra la foto de tres cuartos (cuerpo más estrecho, riostras en diagonal, muelles más gordos y más afuera, mástil más largo, menos cobre en los motores) y contra la del soldado (etiqueta de la batería al costado). El servidor del panel no arrancaba: `npm run dev -- --port 4321` desde la terminal.
- 22-10-2026: fase 3, segunda vuelta: muelles a 8°, motores rehechos (campana metalizada, cinco ventanas, logo, eje, arandela, tuerca), palas con forma y detalles en todo el dron.
- 22-10-2026: fase 3, tercera vuelta: granada al revés (la cabeza delante), y mejoras de batería, cuerpo, cámara, patas, riostras y cola con las fotos del Digital.
- 22-10-2026, cuarta vuelta: el usuario da por buena la granada y la maqueta. Pregunta por la espoleta original: contestado en el chat con lo publicado en abierto; la maqueta no cambia. Commit.
