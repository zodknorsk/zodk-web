# Airbus Zephyr — diario

## Dónde estamos

- **Fase 1 (la nota)**: sin hacer. No hay nota del Zephyr en la bóveda.
- **Fases 2, 3 y 4**: hechas el 05-11-2026 y, el mismo día, **la maqueta rehecha con las fotos originales** a petición del usuario («fiabilidad absoluta en los detalles»): cámaras encajadas en la foto de frente (`hd/frente.json`, error ≤ 9 px sobre 6333) y en la de desde arriba (`hd/planta.json`, ≤ 13 px sobre 2250). Tarjeta, planta y miniaturas, regeneradas. En la rama `claude/nuevodron-fases-2-3-4-at8jwi` (commits `d53f2e0`, primera versión, y `9e8f847`, la rehecha); no está en `main`.
- **Solo en local, fuera de Git**: la ficha provisional `src/content/uas/airbus-zephyr/` (en `.git/info/exclude`); en `arte/uas-fuentes/airbus-zephyr/hd/`, los ajustes de cámara y copias de `comparar-foto`, `vista-visor` y `generar-uas-miniaturas-hd` con el Chrome de Linux (en el Mac, los de `arte/`).
- **Sin medir**: `desfaseLuz`. Sin nave del hero (no pedida).
- **Falta**: la nota (fase 1), importarla en `main` y probar (fase 5), y que el usuario revise la maqueta (fase 6).
- **Siguiente paso**: que el usuario mire la comparación y diga qué no está igual.

## Decisiones del usuario

- 05-11-2026: versión **Zephyr S** (el actual de AALTO).
- 05-11-2026: el avión y la carga, a elección de Claude: el **de Kenia de 2025** (AALTOPORT), **sin carga a la vista**.
- 05-11-2026: fases 2, 3 y 4 en una sola sesión.
- 05-11-2026: rehacer la maqueta con las imágenes originales, con «fiabilidad absoluta» en los detalles.

## Medidas clave

En metros; y = 0 en la cuerda del ala, z = 0 a un tercio de la cuerda (borde de ataque 0,5, de salida −1,0). Escala 1 unidad = 10 m.

- **Cámaras**: frente (Arizona): az −8,3°, 245 px/m a la altura del ala. Desde arriba (Kenia): az −90,8°, el 21,3°, d 42 m, campo 16,4° (98 px/m a lo largo del avión). Rehacer con `node arte/encajar-camara.mjs arte/uas-fuentes/airbus-zephyr/hd/<frente|planta>.json`.
- **Ala**: tramo central recto de ±7,3 m; tramos de fuera de 5 m a 14°; cuerda 1,5 m en todo el ala; grueso 0,18 (0,15 en el quiebro). Puntas en tres estaciones (raíz, codo, extremo): codo en x 12,9, y 1,0, ba −0,4, bs −1,35; extremo en pico en x 13,15, y 0,62, ba −1,3, bs −1,55. **Así el ala mide ~26,3 m de punta a punta; la cifra oficial es 25 m** (toda la escala sale de suponer ~25 m de ancho en la foto de frente; si hubiera que cuadrar los 25 m, se encoge todo un 5 %).
- **Cara de arriba**: módulos de células de 0,55 m a lo ancho, uno cada 1,55 m (el primero centrado a 1,95 m del eje; 3,4 m centrales sin células), del 4 al 96 % de la cuerda; en los tramos de fuera, de 0,45 m cada 1,2 m. Cajón del borde de ataque gris oscuro en el primer 28 %. Tira blanca fina en los dos bordes. Medido con un perfil de brillo a lo largo del ala proyectado con la cámara de desde arriba.
- **Motores**: x ±3,94, y −0,04; huso blanco de 0,42 m (punta a 0,7 m del borde de ataque) sobre varilla negra; hélice de 1,45 m, dos palas.
- **Botalón**: de un carenado negro bajo el ala (del borde de ataque a 1,1 m tras el de salida) a la deriva, a y −0,14. Por delante, tramo corto a y 0,07 hasta z 1,6 (1,1 m delante del borde de ataque) con caja blanca de 0,45 m; bola blanca de 0,27 m en z 0,81 con la cima a y 0,35 (las dos cámaras la ponen en el mismo sitio).
- **Cola**: deriva de 0,8 m de cuerda (ba −4,46, bs −5,26), de y −0,14 a 1,25, largueros en los bordes, nervios a ¼, ½ y ¾ y larguero al 43 %. Timón de profundidad a y 1,28, 4,7 m de punta a punta, misma cuerda que la deriva, larguero oscuro en el primer 20 % y nervios cada 0,2 m.
- **Puntas**: luz blanca en el quiebro, arriba (z −0,37) y antenita oscura 0,3 m hacia dentro.
- **Color**: ala `plata-ze` (#c2c7cb, algo metálico); puntas, deriva y timón `film-ze` (#d3d7d8, mate); células, dibujo `celdas` (casillas #141922, rendijas #c9ced3); botalón y largueros `carbono-wh`; góndolas, caja y bola `blanco`.

## Fuentes

Fotos en `arte/uas-fuentes/airbus-zephyr/full/` (también en su `FUENTES.md`). Commons no tiene nada del Zephyr; DVIDS, la web de Airbus y YouTube cortan las descargas automáticas. Las buenas, de la mediateca de prensa de AALTO.


| Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| aalto-Zephyr_Kenya_2025.png | Kenia 2025, de noche, desde arriba en su carro: la planta (ala, cola en T, botalón, hélices, morro). 2250x1250 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Kenya_2025.png |
| aalto-Zephyr_OnRunway.jpg | Arizona, de frente en pista sobre el carro: diedro, puntas caídas, hélices, cola en T. 6333x4227 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_OnRunway.jpg |
| aalto-Zephyr_Sunrise.jpg | Arizona al amanecer, de frente-izquierda en el carro: color del ala al sol, deriva y timón de profundidad, cúpula. 7360x4912 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Sunrise.jpg |
| aalto-Zephyr_Landing_2025.jpg | Kenia 2025, en vuelo bajo desde abajo-lado: ala, cola, cúpula del centro. 7680x4320 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Landing_2025.jpg |
| aalto-Zephyr_Kenya_Landing_2025.jpg | Kenia 2025, aterrizado sobre la panza: el ala de lado, la deriva. 7680x4320 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Kenya_Landing_2025.jpg |
| aalto-Zephyr_Production_Hangar.jpg | Fábrica de Farnborough, ala en su bancada (= lado-kelleher). 4724x3149 | AALTO HAPS / Airbus, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Production_Hangar.jpg |
| aalto-Zephyr_Solar_Cells.jpg | Detalle de las células solares. 1200x800 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Solar_Cells.jpg |
| aalto-Zephyr_Take-off.jpg | Arizona, despegando, de frente-abajo. 1920x1080 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr_Take-off.jpg |
| aalto-Zephyr-in-Kenyan-Sunshine.png | Kenia, de frente en el carro ELVIS. 2255x1261 | AALTO HAPS, prensa | https://www.aaltohaps.com/wp-content/uploads/2025/03/Zephyr-in-Kenyan-Sunshine.png |
| aalto-Zephyr-Launched.png, aalto-AALTO-Zephyr.png, aalto-AALTOPORT-Kenya-2025-1.png | Kenia, de noche y la base: poco útiles | AALTO HAPS, prensa | https://www.aaltohaps.com/media-library/ |
| dvids-6883883-vertical.jpg, dvids-6883883-grande.jpg | Arizona 2022, en vuelo de frente-abajo (la 2.ª, recorte apaisado de Breaking Defense) | Ejército de EE. UU. (courtesy photo), dominio público | https://www.dvidshub.net/image/6883883 |
| twz-yuma.jpg | Arizona 2022, en vuelo de frente | Airbus, vía The War Zone | https://www.twz.com/wp-content/uploads/2022/07/01/Zephyr-S-test-flight-yuma.jpg |
| lado-kelleher.jpg | Fábrica de Farnborough (2018), ala en la bancada. 1631x886 | Airbus (Kelleher) | https://www.airbus.com/en/products-services/defence/uas/zephyr |

## Probado y descartado

- Las cintas rojas de las fotos en tierra: sujetan el ala al carro de lanzamiento; no van en vuelo. Fuera.
- Pilón colgando bajo el ala para los motores: de frente, el buje está casi a la altura del ala.
- Las pestañas oscuras bajo el ala de la foto del despegue: no se distingue qué son; sin poner.
- La matrícula del botalón (foto de Kenia): ilegible; sin poner.
- Cuerda de 1,9 m y botalón 2,8 m por delante (primera versión): la escala de la foto desde arriba se leyó mal, y la «punta del morro» era la pierna de una persona. Con la cámara encajada: 1,5 m y 1,1 m.
- Cúpula sobre el centro del ala: es la bola del botalón delantero, delante del borde de ataque.
- Encajar la cámara en la foto de Kenia de lado (`AALTO-Zephyr.png`): gran angular y puntos dudosos (errores de 20-60 px); solo sirve para ver cómo son las piezas.
- Los recortes con `--zoom` de la foto desde arriba cambian la cámara y no casan; comparar sin `--zoom` (sí sirven los de la cola y los de la foto de frente).

## Registro

- 05-11-2026: fuentes (AALTO, DVIDS, TWZ); maqueta medida en las fotos de frente y desde arriba y encajada en la de frente; tarjeta, planta y miniaturas. El servidor de desarrollo necesita Node 24 (el glosario usa `(?i:…)` en expresiones regulares; con Node 22 las fichas salen vacías).
- 05-11-2026 (2.ª vuelta): maqueta rehecha con las fotos a tamaño completo. Cámaras encajadas de frente y desde arriba (el ajuste desde arriba solo converge empezando en az −90, el 21); con ellas, cuerda, góndolas, botalón delantero con caja y bola, cola, puntas en pico con codo, luz y antena, y el reparto de células medido con un perfil de brillo proyectado. Dibujo nuevo `celdas` y acabado `film-ze`.
