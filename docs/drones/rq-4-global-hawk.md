# RQ-4 Global Hawk (Northrop Grumman) — diario

## Dónde estamos

- **Cerrado el 12-10-2026.** Fases 3 a 7 hechas: maqueta HD con marcas del 04-2015 y juntas de la foto en vuelo, pixel HD (contorno y oscurecido con la misma medida de lo fino, para todos los drones), tarjeta y planta generadas, nota importada y ficha probada en `/uas/rq-4-global-hawk` (vistas, Maqueta y Pixel, día y noche, partes, fuentes, tarjeta en `/uas`). `npm run lint` y `npx astro check` sin errores.
- Sin nave en el hero (no se pidió).
- En `main`.

## Decisiones del usuario

- 12-10-2026: versión, «la que sale al abrir la Wikipedia»: la foto es el **RQ-4B Block 20 04-2015** (AF-8, el primer RQ-4B) en su primer vuelo de Palmdale a Edwards, 1-mar-2007 (Bobbi Zapka, USAF, DP, `commons: Global_Hawk_1.jpg`).
- 12-10-2026: marcas, **ese mismo avión**: USAF, «U.S. AIR FORCE», estrella, 04-2015 en la deriva, en su gris.
- Carga: sin armas; la del Block 20 (sensores internos, panza sin la góndola del radar del Block 40).
- 12-10-2026, sobre la forma: la boca de la toma mira hacia delante y arriba (labio de abajo adelantado); los costados de la góndola son los del cuerpo, no una pieza posada; el escape es un agujero negro grande con escalones.
- 12-10-2026, tercera vuelta: la boca no es redonda (en D) y tiene un hueco debajo, entre el labio y el cuerpo; la tobera nace de la misma pieza; el «escalón» es una pieza vertical en el centro, de la tobera al final de la cola; el morro, más chupado de frente; bajo el morro, una segunda parte que le da aspecto de boca.
- 12-10-2026: pasar a la fase 4 (pixel) antes de las marcas.
- 12-10-2026, cuarta vuelta: **sin tren de aterrizaje** (el dron va en vuelo). Bajo la cola, dos aletas pequeñas a los lados y una en el centro; las aletas de la V nunca acaban en el aire; la mandíbula, con las muescas y la forma de su foto de perfil (`usuario-4-3.png`).
- 12-10-2026: la toma y la góndola, sin raya entre ellas; juntas, las que marcó en rojo sobre la foto en vuelo, bien visibles; sin los seis recuadros del cuello. Color, el de siempre (#5a605f).
- 12-10-2026: el arreglo de lo fino en el pixel (contorno y oscurecido con la misma medida), para todos los drones aunque cambien algo.

## Medidas clave

- Perfil de Andersen (`aterrizaje-perfil-andersen-2014`, 3840 px de ancho): recorte `crop=3820:1400:150:900` (ffmpeg lo corre a x = 20 porque no cabe), escalado a 1600 de ancho: morro en x 1473, **97,1 px/m**; z = (x − 769)/97,1, y = (350 − y_px)/97,1 (y = 0 a la altura de la punta del morro). **En la foto original: z = (X − 1856)/231,8, y = (1736 − Y)/231,8** (`andersen.json` + `andersen.cam.json`, az 270, d 57,8, fov 10,9). Encaje para comparar (corregido: el de antes salía un 3 % pequeño y 0,2 m adelantado): `node arte/vista-visor.mjs salida.png 270 0 57.8 6 0,0.59,0.32 --modelo=rq-4-global-hawk --ancho=1600 --alto=586`, encima del recorte.
- Lomo medido en Andersen (z → y): 7,01 → 0,87; 6,51 → 1,26; 6,02 → 1,50; 5,5 → 1,65; 5,0 → 1,71 (lo más alto); 4,5 → 1,69; 4,0 → 1,60; 3,5 → 1,48; 3,0 → 1,34; 2,5 → 1,17; 2,0 → 1,03; 1,5 → 0,90; 1,0 → 0,81; 0,5 → 0,78. Góndola: −1 → 1,82; −3 → 1,72; −4 → 1,65; −5 → 1,52; −5,5 → 1,41.
- Panza medida en Andersen: 3,6 → −0,99; 2,5 → −1,01; 1,5 → −1,05 (lo más bajo); 0,5 → −1,02; −0,5 → −0,92; −0,9 → −0,86; −1,5 → −0,79; −2,4 → −0,68; −3,0 → −0,63; −4,4 → −0,62; −5,2 → −0,52; −6,0 → −0,42; −6,6 → −0,27; −7,0 → −0,15; acaba en −7,2 a −0,05.
- Morro: punta en z 7,28 a 0,2; ceja (arista de la cintura) a 0,5 m. Ventanita bajo la punta: z 7,216, y −0,14.
- Joroba: arriba 1,72 m en z 5; panza −0,9/−1,0; ancho 1,68 m (foto de frente de Sigonella con la envergadura de escala), arco alto con costados casi rectos.
- Toma: labio de abajo en z 0,16 a 0,93 m, de arriba en z −0,40 a 1,84 m (32° sobre la vertical, mirando hacia delante y arriba); 1,06 m de ancho por fuera, labio de 0,1 m; boca en D (abajo casi plana). La cara de abajo va horizontal hacia atrás y deja un hueco de ~0,1 m sobre el cuerpo, hasta el frente de la góndola en z −0,02/−0,12. Góndola: arriba 1,84 (z −0,5 a −1,3), 1,76 (−3), 1,58 (−4,6), 1,49 (−5,15), 1,36 (−5,55); medio ancho 0,55, costados que bajan rectos hasta el cuerpo. Delante de −0,5, el lomo va por detrás del plano de la boca (si no, asoma dentro).
- Tobera: centro z −5,75, a 1,0 m; 0,66 m de diámetro por fuera, enrasada con la góndola; el borde de abajo, 15° más atrás que el de arriba.
- Cola, detrás de la tobera: cubierta plana con arista (arriba ~0,3 m) y encima un cajón central de costados rectos, de 0,55 m de ancho y lo alto bajo la tobera (0,68 → 0,58), hasta z −7,0, donde todo acaba recto (fotos de la lluvia y de la NASA).
- Morro de frente: costados casi rectos de la ceja (0,5) a −0,25, luego se recoge. Mandíbula (fondo, z → y): 7,2 → −0,31 (cara con la ventanita de 0 a −0,3); 7,04 → −0,48; 6,85 → −0,68; 6,55 → −0,76; 6,0 → −0,775; 5,3 → −0,80; medio ancho 0,4; muescas en z 6,34 y 5,27; detrás de la segunda, escalón al carenado (fondo de −0,875 en 5,25 a −1,0 en 3,75). Se funde con la panza en z 3,6.
- Pliegue de la góndola con el cuerpo (Andersen; no va en la forma, ver «Probado y descartado»): de (z −0,21, y 0,76) a (−1,25, 0,56) y (−1,75, 0,40), bajo el ala; detrás del ala no hay pliegue.
- Bajo la cola (Andersen): aleta lateral con la raíz de (−5,15, −0,56) a (−6,82, −0,22) y lo de abajo de (−5,4, −0,90) a (−6,6, −0,63). Quilla: de z −3,05 a −4,38, lo más bajo −1,05 en −3,45, frente romo y cola larga.
- Antena (Andersen): pie de 0,24 m de largo y 0,05 de ancho; tapa clara de 0,42 m de largo, 0,3 de ancho y 0,03 de grueso, arriba a 1,99 m, centrada en z −2,03.
- Hoyuelos de las mejillas: centro en z 5,6, y 0,27, medio largo 0,95, medio alto 0,22, 9 cm de hondo (a ojo).
- Ala: raíz z 0,85/−1,75 (cuerda 2,6 m), punta z −0,75/−1,55, y −0,15, sube 1,2 m en la punta (en vuelo, aproximado).
- Cola en V a 45° (foto de frente), raíz en los costados a y 0, 2,8 m de alto, cuerdas 1,65 y 0,82 m.
- Gris `gris-gh` #5a605f en el HD: arriba al sol, render #7d8485 y foto de Le Bourget #7a8688.
- Pixel HD: pintura al sol en 3,6-3,8 de los siete escalones (desde arriba y a [61, 20]): `desfaseLuz` −0,2.
- Marcas (foto en vuelo, `vuelo.json` con su cámara): estrella del costado centrada en z −2,9, y 0,54, disco de 0,5 m y 1,0 m con las barras; «U.S. AIR FORCE» de z −0,9 a 1,47 (centro 0,29), y 0,34, letras de 0,3 m; 042015 en la aleta a d 0,3, z −6,42, 0,91 por 0,15 m; recuadros (0,26 por 0,2 m) en d 3,45/1,48/0,77, z −6,91/−6,77/−6,72; estrella del ala en x 13,5, «USAF» en x −16,2 (2 m). Color de las marcas: el disco, a 0,45 de la luz de la pintura de al lado.
- RQ-4B: 39,9 m de envergadura, 14,5 m de largo, 4,7 m de alto (Designation-Systems, Air & Space Forces).

## Fuentes

Las de la nota (`## Fuentes`). Fotos de `arte/uas-fuentes/rq-4-global-hawk/full/` (Commons; bajar despacio, 429 si van seguidas; el ancho 3840 falla si el original es menor: usar la URL `upload.wikimedia.org` del original). La categoría de Commons del 04-2015 incluye las de Le Bourget 2009: se da por el mismo avión, sin ver la cola.

| Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| perfil-vuelo-04-2015.jpg | El 04-2015 en vuelo, de tres cuartos por arriba-izquierda, con la estrella, «U.S. AIR FORCE» y el 04-2015 en la deriva: forma, ala y gris (3000x1965) | Bobbi Zapka, USAF; dominio público (1-mar-2007) | https://commons.wikimedia.org/wiki/File:Global_Hawk_1.jpg |
| paris-3-4-delante-izq.jpg | El 04-2015 en tierra, de tres cuartos delante-izquierda: morro, toma de aire, tren y deriva (3456x2142) | Georges Seguin (Okki); CC BY-SA 3.0 (Le Bourget 2009) | https://commons.wikimedia.org/wiki/File:Salon_du_Bourget_20090619_212.jpg |
| paris-ala-tren.jpg | Detalle: raíz del ala, toma de aire y pata principal (4416x3312) | Tangopaso; CC BY-SA 3.0 (Le Bourget 2009) | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_at_Paris_Air_Show-2009.jpg |
| paris-izq-3-4.jpg | Lado izquierdo y ala vistos desde delante-izquierda, con el alerón (4416x3312) | Tangopaso; CC BY-SA 3.0 (Le Bourget 2009) | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_at_Paris_Air_Show_2009.jpg |
| paris-morro-frente.jpg | El morro visto de frente: ancho del radomo y fuselaje (3312x4416) | Tangopaso; CC BY-SA 3.0 (Le Bourget 2009) | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_nose.jpg |
| paris-lejos-frente.jpg | De frente y lejos, con las alas en V de la cola y un motor de A380 como escala (4416x3312) | Tangopaso; CC BY-SA 3.0 (Le Bourget 2009) | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_Wingspan.JPG |
| hangar-3-4-trasero-izq.jpg | De tres cuartos por detrás-izquierda: la V de la cola y la toma de aire, en hangar (3888x2592) | Rennett Stowe; CC BY 2.0 (17-oct-2009) | https://commons.wikimedia.org/wiki/File:Global_Hawk_Drone_%284020342776%29.jpg |
| aterrizaje-perfil-andersen-2014.jpg | De perfil aterrizando, casi sin perspectiva: contorno, ala con flecha y cola (4256x2832) | Staff Sgt. Nathan Lipscomb, USAF; dominio público (24-may-2014) | https://commons.wikimedia.org/wiki/File:RQ-4B_Global_Hawk_lands_at_Andersen_AFB_%28140524-F-XD880-9027%29.jpg |
| aterrizaje-perfil-yokota-2019.jpg | De perfil aterrizando, ala doblada por el peso (2500x1406) | Sr. Airman Juan Torres, USAF; dominio público (5-ago-2019) | https://commons.wikimedia.org/wiki/File:RQ-4B_Global_Hawk_lands_at_Yokota_Air_Base_%28190805-F-KG439-0101%29.jpg |
| trasera-3-4-pista-mojada.jpg | De tres cuartos por detrás: la V de la cola y el escape (2100x1395) | Sr. Airman Nichelle Anderson, USAF; dominio público (7-oct-2010) | https://commons.wikimedia.org/wiki/File:USAF_RQ-4_in_the_rain_at_Anderson.jpg |
| remolque-3-4-delante.jpg | De tres cuartos delante-izquierda remolcado, con personas como escala (RQ-4A de 2006; 3008x1960) | Staff Sgt. Christopher Matthews, USAF; dominio público | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_3.jpg |
| frente-aterrizaje.jpg | De frente al aterrizar: ala con diedro, tren y V de la cola (2100x1500). La licencia de Commons («dominio público», fecha 1891) está mal rellenada: pendiente de confirmar | Jet Fabara; licencia dudosa | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_above_the_runaway.jpg |
| detras-panoramica.jpg | Desde detrás, muy ancha: ala y V de la cola (3008x1056). Sin autor en Commons | Sin autor; «dominio público» según Commons | https://commons.wikimedia.org/wiki/File:Global_Hawk_from_the_rear.jpg |
| block20-3-4-pista-mojada.jpg | RQ-4B Block 20 en la prueba de pista mojada, de tres cuartos delante (4400x3400) | 452d Flight Test Squadron, USAF; dominio público (12-mar-2010) | https://commons.wikimedia.org/wiki/File:452d_Flight_Test_Squadron_-_RQ-4B_Global_Hawk.jpg |
| planta-arriba-nasa.jpg | Desde arriba, en tierra: la planta (blanco de la NASA, tipo RQ-4A; 2400x1600) | NASA Goddard Space Flight Center; CC BY 2.0 (12-sep-2012) | https://commons.wikimedia.org/wiki/File:Global_Hawk_%288009100505%29.jpg |
| beale-3-4-delante-izq.jpg | De tres cuartos delante-izquierda en Beale, con el panel de servicio abierto (1000x667) | USAF; dominio público (2009) | https://commons.wikimedia.org/wiki/File:Rq-4-global-hawk-9thog-beale.jpg |
| hangar-perfil-sigonella.jpg | De perfil en hangar (Block 40, Sigonella 2018; 5694x3800) | Staff Sgt. Ramon Adelan, USAF; dominio público (25-oct-2018) | https://commons.wikimedia.org/wiki/File:RQ-4_Global_Hawk_at_NAS_Sigonella_%284909449%29.jpg |
| block40-frente-sigonella.jpg | Block 40 de frente, para ver la góndola del radar bajo la panza si asoma (7433x4955) | Sr. Airman Ashley Richards, USAF; dominio público (2023) | https://commons.wikimedia.org/wiki/File:US_Air_Force_RQ-4_Global_Hawk_Block_40_at_Sigonella.jpg |
| fairford-hangar.jpg | RQ-4B Block 40 en hangar, de frente con ala larga (5152x3428) | Airman Adam Enbal, USAF; dominio público (22-ago-2024) | https://commons.wikimedia.org/wiki/File:RQ-4B_Arrives_at_RAF_Fairford_%288611831%29.jpg |
| museo-trasera-dcha.jpg | Un fuselaje de RQ-4 (sin alas ni cola) por detrás-derecha, en el Empire State Aerosciences Museum: tobera, góndola fundida con el cuerpo, cubierta de la cola (1200x803) | Valder137 (Flickr); CC BY 2.0 (4-feb-2010) | https://commons.wikimedia.org/wiki/File:Northrop-Grumman_RQ-4_Global_Hawk_RSideRear_EASM_4Feb2010_(14404362090).jpg |
| nasa-motor-cola.jpg | Global Hawk de la NASA por detrás-derecha: tobera, góndola y raíz de la cola en V (3000x2400) | NASA Dryden (ED07-0244-058); dominio público (3-dic-2007) | https://commons.wikimedia.org/wiki/File:The_above-the-fuselage_engine_and_V-tail_distinguish_one_of_NASA%27s_two_Global_Hawk_unmanned_aircraft_parked_on_the_ramp_at_the_Dryden_Flight_Research_Center_(ED07-0244-058).jpg |

## Probado y descartado

- Góndola como casco aparte, un tubo posado encima del cuerpo: el usuario la ve como pieza suelta; sus costados son los del cuerpo. Va como `lomo` del casco del cuerpo.
- Boca de la toma inclinada con lo de arriba hacia delante: es al revés (perfil de Andersen).
- Antena en seta (disco sobre un pie) y en lata con tapa: es una tapa ancha y fina sobre un pie alargado.
- Punta del morro con secciones muy juntas que no siguen una curva redonda: sale un bulto y, de frente, un hoyuelo con un anillo de luz.
- Cola en V a 58°: en la foto de frente la V es mucho más abierta (45°).
- Toma larga (0,6 m) con la góndola más estrecha detrás: el labio asoma por los lados como un bulbo. La toma va corta y la góndola nace con su ancho.
- Lomo que nace con `arriba` igual al cuerpo y el empalme suave: el empalme hincha lo alto y sale un escalón delante de la toma. Lomo con `arriba` bajo: recorta el cuerpo (el cuerpo no pasa de `arriba`). Lo que vale: `pLomo: 40` donde nace.
- Mandíbula tan ancha como el morro por detrás: de frente no se ve cómo se recoge.

- Mandíbula con la cara de delante vertical y el fondo plano hasta delante: la de verdad se recoge en curva redonda bajo la ventanita (foto de perfil del usuario).
- Medir a ojo el perfil de la joroba y de la panza: salía hasta 20 cm alto entre la toma y la joroba y hasta 30 cm bajo detrás del ala. Se mide columna a columna sobre la foto de Andersen.
- Pliegue de la góndola bajando el hombro del cuerpo (en diagonal del labio al ala): en la foto es una raya fina, en la maqueta salía una ondulación ancha y el costado se veía hundido, con franjas de luz. Góndola como en la tercera vuelta; el pliegue, si acaso, como costura.
- Pixel, ala de frente: pedir también tres píxeles en las columnas de al lado para poner contorno. Las cuentas se quedan (salen también del oscurecido de lo fino) y el cambio toca a todos los drones.
- Rehacer la toma (labio largo con hueco, góndola en rampa de una pieza, cuerpo más cuadrado), letra DIN estrecha y gris más cálido (#64665d): el usuario lo rechazó, se volvió atrás.
- Encajar la foto en vuelo con la punta del ala: cuánto se dobla el ala es supuesto y tuerce el encaje (el morro salía corrido).

## Registro

- 12-10-2026, fase 1: nota escrita. El 04-2015 sale identificado como el primer Block 20 por la fecha y el vuelo de la foto (EXIF: «First flight… Palmdale to Edwards») y la nota de Defence Talk (AF-8, 1-mar-2007). Tuits: solo se encuentran capturas de seguimiento (Flightradar24 y similares), ningún vídeo; van tres. Sin fuente fiable del derribo de un BAMS-D en la guerra de Irán de 2026: no va.
- 12-10-2026, fase 2: 34 candidatas en Commons, hoja de contactos, 19 bajadas. Una más (`RQ-4 Global Hawk.jpg`, Beale, 3008x2000) dio 429 y se dejó. Glosario: GMTI añadido; SIGINT e ISR ya estaban (el diario decía que no).
- 12-10-2026, fase 3: primera vuelta de la maqueta (forma, color, partes). Toma rehecha tres veces contra la foto de Le Bourget; boca y tren retrasados 0,3 m tras superponer el perfil; morro ensanchado y V abierta tras la foto de frente.
- 12-10-2026, fase 3, segunda vuelta: el usuario marcó toma, góndola, antena, morro y escape. Dos fotos nuevas de detrás (museo de Glenville, NASA). Encaje del perfil corregido. Góndola pasada a lomo del cuerpo; toma girada (−32°) y más grande; tobera con aro; barbilla bajo el morro; punta rehecha.
- 12-10-2026, fase 3, tercera vuelta: el usuario marcó toma (hueco y forma), tobera y cajón, morro y «boca». Toma pasada a casco en D, corta y con la cara de abajo horizontal; góndola con su ancho desde el labio y sin escalón delante. Tobera enrasada; cajón y cubierta hasta z −7,0, recta. Morro con la mitad de abajo más cuadrada; barbilla cambiada por la mandíbula. Punta del morro con más secciones: el anillo de luz sigue (deshecho).
- 12-10-2026, fase 3, cuarta vuelta: el usuario marcó morro y mandíbula (líneas que no seguían la foto), toma y cuello, aletas bajo la cola, aletas de la V al aire, tren fuera, y el perfil entero. Perfil medido columna a columna en Andersen, sobre la foto original (el recorte de ffmpeg del diario empieza en x 20, no en 150: apuntado en «Medidas clave»). Lomo bajado entre toma y joroba, panza que sube detrás del ala, mandíbula nueva con muescas, pliegue de la góndola, cuerpo hasta −7,2, aletas bajas y quilla. Encajes nuevos: foto en vuelo, Le Bourget y la foto del usuario.
- 12-10-2026, fase 3, quinta vuelta: antena en T; carenado en la raíz de las aletas de la V; hoyuelos en las mejillas (opción nueva del casco); góndola vuelta a la de la tercera vuelta (el pliegue bajando el hombro dejaba el costado ondulado), con el perfil nuevo.
- 12-10-2026, fase 3, marcas: las del 04-2015 y las juntas medidas con `medir:superficie` sobre la foto en vuelo; comprobadas lado a lado con la foto (costado, cola, ala) y desde el otro costado y arriba (textos al derecho). Fase 4: contorno y oscurecido con la misma medida de lo fino; un tramo de 3 px cuenta como fino si a menos de tres columnas (también en diagonal) hay uno de 2. Mirando solo la columna de al lado quedaban trozos de contorno en la escalera del ala. Comparados los 13 drones antes y después (frente, perfil, planta en pixel): ~1.300 píxeles de contorno que desaparecen y ~700 que se oscurecen en total, todos en piezas finas.
- 12-10-2026, fase 3, juntas: el usuario rechazó una vuelta de toma, letra y color (deshecha). Luego: `soldadura` para el contorno de tinta, góndola más estrecha al nacer (sin la raya de la «A»), juntas marcadas por el usuario medidas sobre la foto en vuelo (las del ala, por la cuerda: el ala de la foto va más doblada) y opacidad 0,7.
- 12-10-2026, fases 5 a 7: importada la nota (con el glosario y tres tuits nuevos), servidor reiniciado, ficha y tarjeta probadas, lint y `astro check` sin errores; miniaturas regeneradas sin cambios. Commit y push.
