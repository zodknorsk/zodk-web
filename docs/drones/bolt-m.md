# Bolt-M (Anduril) — diario

## Dónde estamos

- **Publicado** el 19-11-2026: el usuario pidió crear la nota y hacer commit y push. Nota en la bóveda, `02 - Temas/Hangar de UAS/🇺🇸 Bolt-M.md`, `estado: borrador` (la revisa y la pasa a `completa` él). Ficha importada solo para el Bolt-M; `lint` y `astro check` sin errores; visor probado en local.
- Maqueta calcada del 3D de Anduril (revisión del 30-10, ver «Medidas clave»); tarjeta, tarjeta de noche y planta en `public/uas/bolt-m/`. Comparación: `arte/uas-fuentes/bolt-m/revision-calcado.html`.
- Fuentes, capturas y herramientas en `arte/uas-fuentes/bolt-m/` (fuera de Git; zip para el Mac).
- **Fuera del commit, a propósito**: al importar en la nube salieron otras notas de la bóveda aún sin importar (la nueva del XQ-58 Valkyrie y la operación del F-15E, con su imagen en webp) y fotos reprocesadas por el sharp de Linux. Se deshicieron: se importan desde el Mac.
- Pendiente del usuario: revisar la nota y la banda azul (instrucción) o amarilla (explosiva).

## Decisiones del usuario

- 29-10-2026: dron elegido, el **Bolt-M** de Anduril. Fases 2, 3 y 4 en una sola sesión; la fase 1 (la nota), en otra.
- 30-10-2026: «pon tu maqueta al lado del original desde varios ángulos, y la parte que no sea igual, la calcas».
- 19-11-2026: crear la nota y hacer commit y push (en `main`, publica).
- 29-10-2026: la maqueta, **fiel al modelo 3D interactivo de la web de Anduril**. Como con el Fury: el modelo no se baja ni se copia; se sacan capturas con una cámara puesta a mano y se mide sobre ellas. Donde no coincida con las fotos, mandan las fotos.
- 29-10-2026: versión, ejemplar de las marcas y carga, **a elección de Claude**: el Bolt-M de serie de los Marines (BLT 1/8, Camp Lejeune, 28-ago-2026), ejemplar **B40E**, con la cabeza de guerra que lleva en la foto (banda azul, de instrucción).

## Medidas clave

En unidades del interactivo (1 = 0,20 m; ejes de la maqueta: z al morro, y arriba, x positiva al costado izquierdo).

- **Escala**: 0,20 m por unidad, del B44C con el vaso en la 9901709 (cuerpo de unos 50 cm por 16). Aproximada: Anduril no da medidas; solo «unos 13-15 lb» (5,9-6,8 kg), 20 km y 40 min.
- **Carcasa** (calcada): de z −1,01 a 1,187; lomo a 0,184, panza a −0,257, medio ancho 0,385 con el canto achaflanado (de 0,28 a 0,184 a 0,385 a 0,09). Frente: cara de y 0,066 a −0,218 en z 1,187, chaflanes hasta (1,077, 0,184) y (1,095, −0,257). Trasera: el lomo baja a 0,131 en z −0,951 y a 0,008 en −0,991. Aletas en el canto y el costado (z −0,45 a 0,95) y en el centro del lomo (z 0,72-1,06 y −0,08-0,24). Repisa trasera de ±0,42, de y −0,215 a −0,15, hasta z −1,047.
- **Hombros** (bloques de las bisagras): delante, en cuña, hasta x 0,566 entre y −0,19 y 0 (0,522 abajo, con chaflán) y el lomo bajando a 0,34 en y 0,14; planta de z 0,72 a 1,18. Detrás, escudo de ±0,545 hasta y 0,02 con la cumbre en 0,17 (x 0,44) y la repisa de ±0,553 en y −0,19; de z −0,48 a −1,047.
- **Batería**: caja de lados rectos ±0,254, de y −0,257 a −0,637 (chaflán de la panza a ±0,235), de z 0,93 a −1,032, con un chaflán grande abajo detrás de (z −0,89, y −0,637) a (−1,01, −0,50). Cierres a los lados en z −0,96 (x 0,254-0,30, y −0,29 a −0,39). Bajo la cámara, el bloque oscuro del frente: ±0,33, y −0,26 a −0,46, z 0,93-1,10.
- **Panel lateral** (el del «002», una pieza en zeta): barra vertical en x 0,395 de z −0,511 (punta de flecha) a 0,684, entre y −0,035 y −0,26; lados del morro (z 1,11-1,68, y −0,045 a −0,26) en x 0,385; por debajo de y −0,26, inclinado 18,6° hacia dentro (de x 0,40 a 0,28): de z 0,30-1,66 arriba a 0,57-0,99 abajo (y −0,616). Cartela abajo en z 0,97. Contornos en el `.ts`.
- **Cámara**: cabeza de x −0,12 a 0,216, y −0,212 a 0,068, z 1,275-1,60; objetivo grande r 0,06 en (0,02, −0,058) y dos de r 0,04 en (0,16, −0,009) y (0,16, −0,10); motor alto a la derecha (x −0,267 a −0,176, z 1,24-1,60), uno pequeño a la izquierda, tapa arriba y motor de r 0,09 debajo (y −0,19 a −0,31). Horquilla: banda vertical en U (de y −0,24 a 0,05), brazos en x ±0,29 hasta z 1,666, cerrada detrás en z 1,20; tetones de giro a los lados en y −0,10, z 1,45.
- **Cúpula cuadrada**: base x ±0,21, z 0,231-0,718; en y 0,345, ±0,19 y z 0,287-0,70; techo a 0,379, ±0,15 y z 0,394-0,673 (cara de atrás en rampa suave). Negra.
- **Cabeza de guerra** (la «cúpula trasera»: va con dos enganches «POSITION BEFORE FLIGHT», el B44C sin armar no la lleva y su banda sigue el código de colores de la munición de EE. UU.): vaso de sección oval algo cuadrada (ancho 0,52, alto 0,43), aro con centro en (z −0,21, y 0,44), cara muy abombada (0,10) hacia delante y 17,5° hacia arriba; se estrecha hasta 0,32 x 0,26 a 0,6 por detrás. Casa con el contorno del 3D de perfil. Banda azul en el B40E (instrucción), amarilla en el 3D de Anduril (explosiva).
- **Antenas**: dos, en x ±0,27, z −0,93, de y 0,33 a 0,73.
- **Brazos** (tubos de carbono, r 0,093): delanteros horizontales a y −0,006, de (0,61, 0,96) a (2,38, 1,734), 23,5° hacia delante; traseros a y 0,193, de (0,56, −0,742) a (2,38, −1,907), 32,6° hacia atrás.
- **Bisagras**: tetón claro sobre el hombro (r 0,095 delante, en z 0,91-0,95 e y −0,075; r 0,09 detrás, en z −0,66 e y 0,12); rótula negra encima (delante en (0,60, 0,09, 0,85), 0,13 x 0,17 x 0,21; detrás en (0,54, 0,295, −0,67), por encima del tubo); casquillo r 0,105 de x 0,60 a 0,83; pestillo plano junto al tubo (planta en el `.ts`), el de detrás con gancho.
- **Motores** (eje en x ±2,38; z +1,73 y −1,90): variador en corona (r 0,10 abajo, 0,15 arriba, y −0,10 a 0), aro de anclaje r 0,195 (y 0 a 0,10), jaula de ocho radios hasta la campana (y 0,17) alrededor de un cubo r 0,075, campana r 0,087 hasta 0,22, aro de color r 0,095 hasta 0,26, tapa del buje r 0,075 hasta 0,34. Los traseros, 0,19 más altos. Aros **rojos detrás a la izquierda y delante a la derecha, azules en los otros dos** (parejas en diagonal por el sentido de giro; fotos del B40E posado y en vuelo).
- **Hélices**: bipala, radio 1,79; cuerda máxima 0,345 a un tercio, raíz 0,16, punta afilada; un borde casi recto. Plano a y 0,26 delante y 0,45 detrás.
- **Color**: carcasa blanca algo cálida (`blanco-bo` #dcdbd6; en la sombra de la 9901709, #a89f9e); batería, cúpulas, cámara y motores negros mates (`negro-bo`); banda azul `azul-bo` #2f78b5; tubos y hélices de carbono.
- **Cámaras encajadas**: `arte/uas-fuentes/bolt-m/hd/b40e.json` (9901713; errores de 4 a 18 px). Las capturas del interactivo valen como cámaras exactas: distancia 80 unidades = 16 m y su mismo campo, con el origen y los ejes de la maqueta (`hd/comparar.sh` y `hd/superponer.py`; las siluetas por piezas, en `full/interactivo-piezas/`).
- **Probado y bien**: perfil, planta, frente y detrás casan con el contorno del 3D; seis ángulos y cinco vistas de cerca lado a lado con el 3D (`hd/lado.sh`).

## Fuentes

Especificaciones de la web de Anduril (https://www.anduril.com/bolt): Bolt-M, más de 20 km de alcance, más de 40 min, unos 13-15 lb. Cabeza de guerra de unas 3 lb (1,4 kg), de Kraken Kinetics (Inside Unmanned Systems, oct-2024). Contrato OPF-L de los Marines: más de 600 Bolt-M por 23,9 M$ (The Defense Post, ene-2026); primer tiro real en Camp Lejeune con el BLT 1/8 (DVIDS, ago-2026).

### Fotos (copia de `arte/uas-fuentes/bolt-m/FUENTES.md`)

Ejemplar de las marcas: **B40E**, BLT 1/8 (26th MEU), Camp Lejeune, 28-ago-2026. Las de DVIDS se bajaron de su CDN (`d1ldvf68ux039x.cloudfront.net/thumbs/photos/2608/<id>/2000w_q95.jpg`): la web de DVIDS y marines.mil dan 403 desde la nube.

| Archivo (full/) | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| dv-9901713.jpg | B40E posado, despegando, de tres cuartos por detrás: trasera, cúpula de banda azul, batería negra, campanas rojas y azules | Sgt. Jorge Borjas, USMC, DP | https://www.dvidshub.net/image/9901713 |
| dv-9901709.jpg | El B44C desde arriba (sin la cúpula trasera), con el vaso que da la escala | Cpl. Matthew Williams, USMC, DP | https://www.dvidshub.net/image/9901709 |
| dv-9901711.jpg | Un Bolt-M de pie sobre su maleta, sin hélices | Sgt. Jorge Borjas, USMC, DP | https://www.dvidshub.net/image/9901711 |
| dv-9901736.jpg | El morro facetado con el pasador «REMOVE BEFORE FLIGHT» | Sgt. Jorge Borjas, USMC, DP | https://www.dvidshub.net/image/9901736 |
| dv-9901722.jpg | En vuelo por detrás: brazos de detrás más altos | Serie de DVIDS, DP | https://www.dvidshub.net/image/9901722 |
| dv-9901715.jpg | En vuelo desde abajo | Serie de DVIDS, DP | https://www.dvidshub.net/image/9901715 |
| bd-hero2.jpg, ius-2.jpg | Bolt-M «007» de Anduril en vuelo, de lado y desde abajo | Anduril (prensa, 2024) | https://breakingdefense.com/2024/10/anduril-debuts-new-bolt-quadcopter-for-sensing-strike-missions/ |
| ds-bolt-m.jpg, ius-1.jpg, dscoop-bolt.jpg, tdp-bolt-drone.jpg | Bolt «009» y Bolt en vuelo (cúpula de banda amarilla) | Anduril (prensa, 2024) | https://designation-systems.net/dusrm/app4/bolt.html |
| tdp-bolt-m-2026.jpg | Estanterías con Bolt-M de serie | Anduril (The Defense Post, ene-2026) | https://thedefensepost.com/2026/01/15/usmc-anduril-bolt-m/ |
| interactivo/*.png | Capturas del 3D de la web de Anduril con cámara propia casi ortográfica (`hd/interactivo-camara.js`): un Bolt-M gris medio, con «AI 002» y la cabeza de guerra de banda amarilla | Anduril, web oficial | https://www.anduril.com/bolt |

**Lo que se ve y lo que es supuesto**: la forma de todo, del interactivo; que el Bolt-M de serie es igual por fuera, de las fotos de los Marines (planta del B44C, trasera del B40E, morro de la 9901736). Que la cúpula trasera es la cabeza de guerra se deduce (enganches, B44C sin ella, color de la banda); Anduril solo dice que la carga es modular: antipersona, antimaterial, anticarro o de instrucción. Las marcas del costado del B40E no se ven en ninguna foto: no se ponen.

## Probado y descartado

- La web de DVIDS, marines.mil y Wikimedia Commons desde la nube: 403 o «demasiadas peticiones». Las fotos de DVIDS salen de su CDN.
- El interactivo en Chrome sin pantalla dice «unsupported device» (SwiftShader en su lista negra): se salta con `?preventFallback=1`.
- Aros de los motores rojos delante y azules detrás: no, van por parejas en diagonal (foto del B40E).
- Dos piezas con el mismo id y distinto acabado: el visor da el material por id y salen iguales.
- Una pieza con `girar` y `espejo`: la copia gira sobre el centro de la otra y sale suelta (las rótulas). Se ponen una a cada lado.
- Los faldones del morro con la inclinación de la batería al revés, y la batería entera hasta el morro: asomaba a escalones por fuera en el pixel.
- Primera maqueta (29-10): batería en trapecio de todo el ancho, faldones sueltos en el morro, bisagras en caja, gimbal grande en una placa en U, cabeza de guerra redonda. Distintos del 3D al ponerlos al lado: sustituidos por lo calcado (30-10).
- Cortar el 3D con el plano cercano para sacar secciones: es una cáscara hueca y las lonchas finas no salen (las paredes quedan de canto). Se calcan siluetas en vistas casi ortográficas, con las piezas por grupos (`hd/calcar.py`).
- La cabeza de guerra en sección casi octogonal (superelipse 3,6): salía como una caja. Va en 2,6.
- En la maqueta, `girarLuego` sin pasar su centro a unidades: la cabeza de guerra salía adelantada y alta. `aUnidades` pasa los dos giros.

## Registro

- 29-10-2026, fase 2: interactivo de Anduril (framework Hydra) con una cámara propia: se intercepta `World.RENDERER.render` y, antes de pintar, se pone la cámara del producto donde se quiere (posición local = inversa del padre × la deseada), sin el `view` desplazado; `Render.setTimeScale(0)` para las hélices. Capturas estables (dos seguidas iguales) con `toma.sh`. Las piezas del 3D van por materiales (12 grupos), no por función: con solo la 4 y la 10 salen siluetas limpias del cuerpo. Fotos reales del Bolt-M en la serie de DVIDS del BLT 1/8.
- 29-10-2026, fase 3: maqueta en las unidades del interactivo (×0,2 m, ×0,4 unidades de la maqueta), con su origen y sus ejes: las capturas del 3D sirven como cámaras exactas y se compara superponiendo contornos (rojo el 3D, azul la maqueta). Carcasa en `pila` a lo largo de z con las aletas del canto y del lomo como piezas (prismas de 1,4 y 1,2 cm). Encajada la foto del B40E (9901713). En la nube, Astro necesita Node 24 (el glosario usa `(?i:…)`, que Node 22 no entiende: las fichas salían vacías) y, tras borrar `.astro/data-store.json`, recarga el contenido.
- 29-10-2026, fase 4: el pixel sale sin franjas en lomo, costado ni frente, de día y de noche; tarjeta [30, 27] y planta de 48x37 sin pintar al doble.
- 30-10-2026, revisión: el usuario pide poner la maqueta al lado del 3D desde varios ángulos y calcar del original lo que no sea igual. Herramientas nuevas (en `hd/`): `abrir-3d.sh` (abre el 3D con la cámara propia), `lado.sh` (el 3D y la maqueta con la misma cámara, lado a lado), `calcar.py` (contorno de una silueta, en unidades del 3D, con OpenCV) y `rej2.py`. El 3D, por grupos: el 10 es la carcasa (con cúpulas, hombros y batería en gris), el 11 lo oscuro más el panel lateral claro, el 5 los tubos, el 6/7 las hélices (el orden cambia al recargar: comprobarlo cada vez). Rehechos, calcados: carcasa, hombros, batería, panel lateral, cúpula, cabeza de guerra, gimbal (cabeza más pequeña, horquilla en banda), bisagras (tetón, rótula, casquillo y pestillo) y jaula de los motores con radios. Tarjeta y planta regeneradas.
- 19-11-2026, fase 1 y cierre: nota escrita con Defense News, The War Zone, Breaking Defense, Inside Unmanned Systems, The Defense Post, Military.com y DVIDS; «En acción», el tuit del lanzamiento (con vídeo) y el del contrato de 2026. Importada con `BOVEDA_PATH` y Node 24.
