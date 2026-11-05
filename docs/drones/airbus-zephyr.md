# Airbus Zephyr — diario

## Dónde estamos

- **Fase 1 (la nota)**: sin hacer. No hay nota del Zephyr en la bóveda.
- **Fases 2, 3 y 4**: hechas el 05-11-2026 en una sola sesión (rama `claude/nuevodron-fases-2-3-4-at8jwi`): fuentes, maqueta HD (`src/data/uas/airbus-zephyr.ts`, acabado nuevo `plata-ze`), tarjeta, planta y miniaturas de las fuentes.
- **Solo en local, fuera de Git**: la ficha provisional `src/content/uas/airbus-zephyr/` (en `.git/info/exclude`) para ver el visor sin nota; y en `arte/uas-fuentes/airbus-zephyr/hd/`, copias de `comparar-foto`, `vista-visor` y `generar-uas-miniaturas-hd` con el Chrome de Linux (la sesión fue en la nube; en el Mac se usan los de `arte/`).
- **Sin medir**: `desfaseLuz` (el ala sale lisa, sin franjas, en el pixel); sin nave del hero (no pedida).
- **Falta**: la nota (fase 1), importarla en `main` y probar (fase 5), y la revisión del usuario (fase 6).
- **Siguiente paso**: que el usuario mire la comparación y diga qué no está igual.

## Decisiones del usuario

- 05-11-2026: versión **Zephyr S** (el actual de AALTO).
- 05-11-2026: el avión y la carga, a elección de Claude: el **de Kenia de 2025** (AALTOPORT), **sin carga a la vista**.
- 05-11-2026: fases 2, 3 y 4 en una sola sesión.

## Medidas clave

En metros; y = 0 en la cuerda del ala, z = 0 cerca del borde de ataque (ba 0,65, bs −1,25).

- Envergadura 25 m (oficial). Escala: 1 unidad = 10 m.
- Foto de frente de Arizona (`hd/frente.json`, 7 puntos, error 16-61 px en 6333 px): 245 px/m a la altura del ala (hélices a ±4 m).
- Ala: tramo central recto de 14,6 m (x ≤ 7,3), cuerda 1,9 m, grueso 0,14; tramos de fuera de 5 m a 14° de diedro, cuerda hasta 1,6; puntas de 0,8 m caídas 55°, cuerda hasta 1,05.
- Cuerda y largos de la foto desde arriba de Kenia, con escala aproximada (0,0125 m/px a lo largo del botalón, 0,0276 m/px a lo ancho): botalón 2,8 m por delante del borde de ataque y 4,2 m por detrás del de salida hasta la deriva; largo total ≈ 9,6 m. **Lo menos seguro**.
- Cola en T: deriva de cuerda 0,7 m, de y −0,16 (botalón) a 1,25; timón de profundidad de 4,5 m, cuerda 0,75 en la raíz y 0,55 en la punta.
- Motores: buje a x ±4, y −0,13, 0,9 m por delante del borde de ataque; hélices de dos palas de 1,4 m.
- Color: forro plateado (`plata-ze`, #c2c7cb, algo metálico); células #1b2130 en bandas de 0,6 m cada metro, del 12 al 82 % de la cuerda; botalón `carbono-wh`; góndolas y cúpula `blanco`.

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
- Pilón colgando bajo el ala para los motores: en la foto de frente el buje está casi a la altura del ala; la foto del despegue, desde abajo, engañaba.
- Las pestañas oscuras bajo el ala de la foto del despegue: no se distingue qué son; sin poner.
- La matrícula del botalón (foto de Kenia): ilegible; sin poner.

## Registro

- 05-11-2026: fuentes (AALTO, DVIDS, TWZ); maqueta medida en las fotos de frente y desde arriba y encajada en la de frente; tarjeta, planta y miniaturas. El servidor de desarrollo necesita Node 24 (el glosario usa `(?i:…)` en expresiones regulares; con Node 22 las fichas salen vacías).
