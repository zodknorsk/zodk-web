# Airbus Zephyr — diario

## Dónde estamos

- **Fase 1 (la nota)**: sin hacer. No hay nota del Zephyr en la bóveda.
- **Fases 2, 3 y 4**: hechas, y la maqueta revisada a fondo el 06-11-2026 («si superpones algo y es ligeramente diferente, lo cambias»): planta del ala medida punto a punto, envergadura a los 25 m oficiales, puntas, luces y antenas (distintas a cada lado), caja del morro, bola, motores, cola y bandas de células, todo contra las dos fotos encajadas. En la rama `claude/nuevodron-fases-2-3-4-at8jwi`; no está en `main`.
- **Solo en local, fuera de Git**: la ficha provisional `src/content/uas/airbus-zephyr/` (en `.git/info/exclude`); en `arte/uas-fuentes/airbus-zephyr/hd/`, los ajustes de cámara (`frente`, `planta`, `lado`, `amanecer`, `aterrizado`) y copias de `comparar-foto`, `vista-visor` y `generar-uas-miniaturas-hd` con el Chrome de Linux.
- **Sin medir**: `desfaseLuz`. Sin nave del hero (no pedida).
- **Falta**: la nota (fase 1), importarla en `main` y probar (fase 5), y que el usuario dé la maqueta por buena (fase 6).
- **Siguiente paso**: que el usuario mire la página de revisión y diga qué no está igual.

## Decisiones del usuario

- 05-11-2026: versión **Zephyr S** (el actual de AALTO).
- 05-11-2026: el avión y la carga, a elección de Claude: el **de Kenia de 2025** (AALTOPORT), **sin carga a la vista**.
- 05-11-2026: fases 2, 3 y 4 en una sola sesión.
- 05-11-2026: rehacer la maqueta con las imágenes originales, con «fiabilidad absoluta» en los detalles.
- 06-11-2026: envergadura de 25 m (la oficial); revisión «a muerte»: cualquier diferencia al superponer, se cambia.

## Medidas clave

En metros «de foto» (los del archivo); al pasar a unidades se multiplican por K = 25/26,5 para que el ala mida 25 m. y = 0 cerca de la cuerda del ala; z = 0 en el eje del ala (borde de ataque +0,52 en el centro).

- **Cámaras**: frente (Arizona) y planta (Kenia), en `hd/frente.json` y `hd/planta.json` (puntos ya en unidades × K). Errores: de frente 2-17 px sobre 6333; desde arriba 1-13 px sobre 2250. La de planta solo converge empezando en az −90, el 21.
- **Ala**: tramo central recto de ±7,3; tramos de fuera de 5,1 a 13,5°, quiebro a 12,26 y 1,25 de alto (triangulado). Planta [x, ba, bs, grueso]: [0, 0,52, −1,04, 0,26], [2, 0,50, −1,00, 0,26], [4, 0,44, −0,85, 0,22], [6, 0,34, −0,67, 0,17], [7,3, 0,17, −0,62, 0,14], [12,26, 0,15, −0,66, 0,12]. Cara de arriba a 0,09 (centro) y 0,06 + diedro (fuera).
- **Puntas**: raíz en el quiebro; codo [12,8, 1,0, ba 0,15, bs −1,07]; extremo en pico [13,13, 0,46, −1,37, −1,55]. En las dos fotos la derecha acaba ~0,13 m antes que la izquierda: se deja simétrica.
- **Células**: bandas de 0,65 m centradas a 2,0, 3,5, 5,1 y 6,6 del eje; en los tramos de fuera, tres de 0,6 m a 1,18, 2,94 y 4,7 m a lo largo del tramo (perfil de brillo proyectado con la cámara). Cajón gris del borde de ataque en el primer 33 %; tira blanca de 7 cm en el borde de salida.
- **Motores**: x ±3,94, y −0,04, buje en z 1,22; huso de 0,42 m; hélice de 1,45 m, palas anchas, giradas como en la foto de frente (123° y 17°).
- **Morro**: varilla a y −0,04 con caja blanca 0,62 × 0,2 × 0,22 que acaba en z 1,62. Bola de 0,15 m en (0,18, 0,11, 0,78), triangulada; su soporte, reconstruido.
- **Cola**: deriva de ba −4,46 a bs −5,26, de y −0,14 a 1,25, cuatro nervios y larguero al 43 %. Timón de profundidad a y 1,28, semienvergadura 2,33 (triangulada), raíz [−4,46, −5,29], punta [−4,60, −5,30].
- **Luces y antenas**: izquierda (x+), antena en el quiebro (12,24, z −0,08) y luz sobre la raíz de la punta (12,58, z −0,38); derecha (x−), las dos juntas en 11,95, z −0,35.
- **Color**: ala `plata-ze`; puntas, deriva y timón `film-ze`; células, dibujo `celdas`; botalón, varillas y largueros `carbono-wh`; góndolas, caja, bola y luces `blanco`.

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
- Ala rectangular (cuerda constante): en la foto desde arriba enderezada, el borde de salida se adelanta del centro a los quiebros. Lo vio el usuario en la superposición y se había pasado por alto.
- Cuerda de 1,9 m y botalón 2,8 m por delante (primera versión): la escala de la foto desde arriba se leyó mal, y la «punta del morro» era la pierna de una persona. Con la cámara encajada: 1,5 m y 1,1 m.
- Cúpula sobre el centro del ala: es la bola del botalón delantero, delante del borde de ataque.
- Encajar la cámara en la foto de Kenia de lado (`AALTO-Zephyr.png`): gran angular y puntos dudosos (errores de 20-60 px); solo sirve para ver cómo son las piezas.
- Los recortes con `--zoom` de la foto desde arriba cambian la cámara y no casan; comparar sin `--zoom` (sí sirven los de la cola y los de la foto de frente).
- Encajar la foto del amanecer en Arizona (`hd/amanecer.json`): hecha desde muy lejos y desde detrás; sus puntos son ambiguos y ningún encaje baja de 40-100 px. Solo para ver piezas.
- Encajar la de Kenia aterrizado (`hd/aterrizado.json`): el avión está apoyado en la panza y el ala, deformada; no encaja (200+ px).
- Medir la flecha del diedro con la foto del despegue: en vuelo el ala se dobla. Sí vale para la deriva (cuatro nervios, vista desde abajo).
- Dos piezas con el mismo `id` y distinto acabado: el visor pinta todas con el acabado de la última (la luz blanca salía negra, del color de la antena).

## Registro

- 05-11-2026: fuentes (AALTO, DVIDS, TWZ); maqueta medida en las fotos de frente y desde arriba y encajada en la de frente; tarjeta, planta y miniaturas. El servidor de desarrollo necesita Node 24 (el glosario usa `(?i:…)` en expresiones regulares; con Node 22 las fichas salen vacías).
- 05-11-2026 (2.ª vuelta): maqueta rehecha con las fotos a tamaño completo. Cámaras encajadas de frente y desde arriba (el ajuste desde arriba solo converge empezando en az −90, el 21); con ellas, cuerda, góndolas, botalón delantero con caja y bola, cola, puntas en pico con codo, luz y antena, y el reparto de células medido con un perfil de brillo proyectado. Dibujo nuevo `celdas` y acabado `film-ze`.
- 06-11-2026: planta del ala corregida (el usuario vio en la superposición que no era un rectángulo). Medida enderezando la foto desde arriba con su cámara encajada (`enderezar.py` en el scratchpad de la sesión: remuestrea la foto a coordenadas del avión). Franjas del cajón y de los bordes con polígonos, sin `espejo` (con él salían volteadas).
- 06-11-2026 (3.ª vuelta): revisión «a muerte» con superposición en línea fina (contorno de la maqueta sobre la foto a resolución completa). Envergadura a 25 m (K = 25/26,5). Planta del ala medida punto a punto (borde de ataque en flecha, cuerda 0,82 m fuera), grueso, puntas, bandas de células, luces y antenas asimétricas, caja del morro y bola trianguladas, cola, hélices. Comprobado también con las fotos del despegue, el amanecer y Kenia aterrizado.
