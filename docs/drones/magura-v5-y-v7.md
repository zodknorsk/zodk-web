# Magura V5 y V7 (Uforce) — diario

## Dónde estamos: fase 6 del V5 cerrada (revisión 3 y retoques, commiteada)

- **Fases 1 y 2 hechas** (nota en borrador sin commitear en la bóveda; fotos fuera de Git, tabla abajo).
- **Commiteado el 18-10-2026 (sin push)**: `src/data/uas/magura-v5.ts` y el motor (`facetas` + `quiebre` por sección en `tipos.ts` y `uas-geometria.ts`, `tapaPlana`, `logo` "magura" y "gur", `gris-mg`, agua, `--sin-agua`). `magura-v5-y-v7.ts` reexporta el V5; ficha provisional en `src/content/uas/magura-v5-y-v7/`.
- **Revisión 3 (18-10-2026), hecha**: casco calcado de nuevo en la foto de perfil (arista larga, defensa, pantoque y quilla; franja de borda de ~10 cm a todo lo largo); rampa del techo desde el final de la primera Starlink; popa en castillo con aleta y hombros en triángulo (último medio metro); defensa más fina que sube por la roda; **tubos de proa quitados**; Starlinks sobre tapas atornilladas; torreta y caja de proa calcadas de las fotos. Retoques finales: planta de la proa en cuña uniforme (medio ancho 0,74 · (1 − t^1,6)) con la defensa de una pieza, y la escotilla con tapa en relieve y tornillos como las de las Starlink.
- Para el usuario: `~/Downloads/magura/v5-revision-3.html`.
- Herramientas, fuera de Git en `hd/rec/`: `cam.py` (`sobre_x` lleva un punto de la foto a 3D), `lineas2.py`, `lineas-maqueta.mjs`, `cruzar.py`. Python con numpy y OpenCV en un venv del scratchpad. Para vistas sueltas, `arte/vista-visor.mjs ... --modelo=magura-v5-y-v7`.
- Ojo: `arte/generar-uas-miniaturas.mjs` recorre todos los `.ts` de `src/data/uas/`: `magura-v5.ts` cuenta como maqueta suelta (fase 4).
- **Siguiente**: el V5 con R-73, el V7 y el visor con tres botones.

## Decisiones del usuario

- 16-10-2026: dron elegido, el **Magura** de Uforce (Ucrania), **V5 y V7 en la misma nota**.
- 16-10-2026: **se hacen las dos maquetas, V5 y V7**, para la misma nota.
- 16-10-2026: las dos, en **un solo visor con un botón V5 | V7**, junto al de «Maqueta | Pixel».
- 16-10-2026: mejor **tres botones**: V5 kamikaze, V5 con R-73 (la misma maqueta del V5 más los raíles y los misiles) y V7 con AIM-9.
- 16-10-2026: en el Hangar de UAS, con un sello **«Dron naval» con un toque azulado**, como el «Prototipo» del Wildfire.
- 17-10-2026: el emblema de la cubierta es el del **GUR en cirílico** («ВОЄННА РОЗВІДКА УКРАЇНИ»), «déjalo así».
- 17-10-2026: **agua en el visor**, la variante B («más tapada»), **puesta por defecto** y con el botón «Agua» para quitarla. En Pixel, sin la lámina de mar (solo el teñido).

## Medidas clave

Del fabricante y el GUR, sin planos:

- V5: 5,5 m de largo, 1,5 m de manga, 0,5 m sobre el agua, 0,4 m de calado (Naval News, DSEI 2023). Unos 1.000 kg.
- V7: 7,2 m de largo, unos 2 m de manga (drone-warfare.com), 3.400 kg cargado.
- V5, maqueta (z −2,75 popa a 2,75 proa; flotación a y −0,07), revisión 3, calcada en la foto de perfil con `sobre_x`: arista larga (C2) 0,205 (z 2,56), 0,226 (2,26), 0,238 (1,9), 0,243 (1,55), 0,258 (1,1), 0,282 (0,43), 0,29 (0,12), 0,30 (−0,5), 0,307 desde −1,5. Defensa (eje) = C2 − 0,114 (0,118 en z 2,2 a 0,193 en −1,4), 0,17 en la punta y sube por la roda a 0,19; perfil de 2 x 2,8 cm. Medio ancho de la defensa: 0,74 · (1 − t^1,6), con t = (z + 1,4) / 4,15 (0,054 en z 2,56, 0,135 en 2,26, 0,23 en 1,9, 0,41 en 1,1, 0,54 en 0,43), 0,74 desde −1,4. Pantoque: 0,01 (2,56), −0,045 (1,9), −0,09 (1,1), −0,148 (0,43), −0,19 (−1,04), −0,165 (−1,95), −0,11 en popa. Quilla: 0,10 (punta), −0,03 (2,66), −0,23 (2,26), −0,35 (1,9), −0,41 (1,1), −0,345 (−1,04), −0,24 en popa. Cubierta de proa en el eje 0,205 (punta) → 0,32 (z 1,55) → 0,392 al pie de la caseta (z 0,12, borde a ±0,46, escotilla ±0,36, z 0,13-0,88). Frente de la caseta: de 0,392 (z 0,12) a 0,55 (z −0,05), arriba ±0,25; techo ±0,42 (−0,5), ±0,45 (−1,04). Rampa desde −1,04 (0,55): 0,47 (−1,5), 0,415 (−1,95), 0,39 (−2,25), 0,37 en popa. Castillo desde −2,25: cuerpo central ±0,30 a 0,37; hombros a 0,31 hasta ±0,66.
- Torreta: centro z −0,31, 35 cm de alto (campana r 0,118 → 0,104 en 7 cm, aros, cabeza r 0,096 con cúpula); marco ovalado 7,5 x 13 cm centrado a 0,26 sobre la base; ópticas a 0,29 (térmica) y 0,228 (día). Tapas de las Starlink: 0,66 x 0,66 (z −0,745) y 0,68 x 0,80 (z −1,62, con la caída). Starlink 1: 0,51 x 0,59, de z −0,45 a −1,04, a 0,58-0,62. Starlink 2: de z −1,23 a −1,88, con la caída de la rampa (~7,5°). Caja de cámaras: 0,115 x 0,068 x 0,165, frente a z 1,67, sobre placa negra de 0,14 x 0,19 x 0,022; ópticas a 0,028 sobre la placa, la grande (r 0,018) a estribor y la pequeña (r 0,011) a babor. Cornamusas (pares): (±0,19, z 1,78), (±0,40, z 0,515), (±0,47, z −1,39), (±0,47, z −2,66). Cúpula negra: (0,374, ~0,47, −0,151), 9 cm. Caja de popa: eje, z −2,36, 0,15 de largo. Rótulo: MAGURA de z −0,21 a −1,08, y de 0,14 (arriba de UFORCE) a −0,07.
- Color: gris neutro `#7b8383` (sala: costado `#6e6d6b`; al aire libre, techo `#98acb3`-`#bbc6cc` con el cielo).
- Cámaras (ajuste conjunto, `hd/P2` y `hd/J2`): perfil (mil-15-1) az 84,8 el 8,0 fov 1,48; tres cuartos (mil-13-1) az 38,0 el 5,7 fov 55,5.

## Fuentes

Las de la nota (`## Fuentes`). Las cifras salen de Naval News (DSEI 2023), Kyiv Post (marzo 2024), Militarnyi y el GUR (mayo 2025). Fotos: ver tabla siguiente.

Fotos en `arte/uas-fuentes/magura-v5-y-v7/full/` (todas de prensa, sin licencia libre):

| Archivo | Qué enseña | Autor | URL |
|---|---|---|---|
| v7-v5-militarnyi-juntos.jpg (2240x1440) | V7 y V5 en exposición, de lado, rótulo UFORCE MAGURA, AIM-9M en pilones del V7 | Militarnyi | https://euromaidanpress.com/wp-content/uploads/2025/05/Bez-imeni-13-1-scaled-e1747255649181.jpg |
| v5-v7-militarnyi-frente.jpg | V5 delante, V7 detrás, de frente | Militarnyi | https://euromaidanpress.com/wp-content/uploads/2025/05/Bez-imeni-15-1-1024x411-1.jpg |
| v7-aim9-pilonos-militarnyi.jpg | AIM-9M en pilón del V7 y cámara | Militarnyi | https://euromaidanpress.com/wp-content/uploads/2025/05/Bez-imeni-12-1-1024x576-1.jpg |
| v7-torreta-militarnyi.jpg | V7 con torreta, cámara y rejillas | Militarnyi | https://euromaidanpress.com/wp-content/uploads/2025/05/Bez-imeni-16-1-1024x576-1.jpg |
| v5-gur-flota.jpg (2048x1366) | Fila de V5 desde arriba y de lado | GUR | https://euromaidanpress.com/wp-content/uploads/2024/03/20231222-3.jpg |
| v5-crimea-capturado.jpg | V5 varado, de lado, tobera a popa | dva mayora vía mil.in.ua | https://euromaidanpress.com/wp-content/uploads/2024/03/photo_2023-11-22_18-11-57-e1700728320624-1.jpg |
| v5-lanzamiento-cpd.jpg | V5 por detrás con una persona | cpd.gov.ua | https://euromaidanpress.com/wp-content/uploads/2024/03/img_7118.jpeg |
| v5-euronews-mar.png | V5 navegando, desde arriba y detrás | Euronews | https://euromaidanpress.com/wp-content/uploads/2024/03/Screenshot-2024-03-14-at-15.25.16.png |
| v5-militarnyi-marina.jpg | V5 en el agua visto de frente y algo desde arriba: morro en cuña, cámara en torreta y antena plana en la cubierta | Militarnyi | https://militarnyi.com/wp-content/uploads/2024/03/MAGURA_V5.jpg |
| v5-twz-r73.jpg | V5 en marcha desde arriba con un R-73 en un raíl a popa (vídeo del MoD ruso) | MoD ruso (captura) vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/USV-ARMED-WITH-R-73-1-copy.jpg |
| v7-navalnews-sidewinders.jpg | V7 navegando, de tres cuartos desde arriba: cubierta con paneles, cámara y dos AIM-9 en raíles | GUR vía Naval News | https://www.navalnews.com/wp-content/uploads/2025/05/Ukraine-HUR-Magura-V7-USV-with-Sidewinders.jpg |
| v7-twz-aim9-antes.jpg | V7 a velocidad, de lado y desde arriba: cubierta y raíles | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/magura-7-aim-9m-drone-boat-ukraine.jpg |
| v7-twz-aim9-detalle.jpg | AIM-9 y su raíl con agujeros de aligeramiento | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/GUR-Magura-5.jpg |
| v7-twz-camara.jpg | Cámara día/térmica en torreta y panel plano (antena) delante | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/Gur-Magura-8.jpg |
| v7-twz-railes.jpg | V7 de costado: dos AIM-9, cámara, bocinas/luces a proa, costado con aletas de ventilación | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/GUR-Magura-4-1.jpg |
| v7-twz-torreta.jpg | Módulo de ametralladora sobre la cubierta, costado | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/Gur-Magura-Machine-gun-module-2.jpg |
| v7-twz-vista-nueva.jpg | V7 desde detrás-arriba: cubierta con antena plana, cámara, dos AIM-9, proa con dos ópticas | GUR vía TWZ | https://www.twz.com/wp-content/uploads/2025/05/Magura-7-New-View-copy.jpg |
| mil-15-1.jpg (2560x1029) | El perfil del V5 (la misma que v5-v7-militarnyi-frente) a tamaño grande: se usa para medir y calcar el rótulo | Militarnyi | https://militarnyi.com/wp-content/uploads/2025/05/Bez-imeni-15-1-scaled.jpg |
| mil-13-1-scaled-e1747255649181-1.jpg (2240x1440) | V7 y V5 de tres cuartos (la misma que v7-v5-militarnyi-juntos), para el ajuste | Militarnyi | https://militarnyi.com/wp-content/uploads/2025/05/Bez-imeni-13-1-scaled-e1747255649181-1.jpg |
| mil-12-1, mil-14-1, mil-16-1, mil-16aa-1 (2560) | V7 en la presentación (para el V7) | Militarnyi | https://militarnyi.com/wp-content/uploads/2025/05/Bez-imeni-14-1-scaled.jpg (y 12, 16, 16aa) |
| v5-navalnews-dsei.jpg (2048x1536) | Maqueta del V5 en DSEI 2023, desde arriba: las caras de la cubierta muy claras | Naval News | https://www.navalnews.com/wp-content/uploads/2023/09/magura-v5-dsei-2023-scaled.jpeg |
| usuario-perfil-comparado.webp, usuario-frente-comparado.webp | Las capturas del usuario con sus fallos (17-10-2026) | — | — |
| usuario-emblema-gur.webp | El emblema del GUR en cirílico, plano (de sus redes), el que va en la cubierta | GUR, vía el usuario | — |
| usuario-perfil-comparado-2.webp, usuario-frente-comparado-2.webp | Las capturas del usuario con los fallos de la revisión 2 (17-10-2026) | — | — |
| usuario-perfil-comparado-3.webp, usuario-proa-comparado-3.webp, usuario-tubos-3.png, usuario-popa-comparado-3.webp | Las capturas del usuario con los fallos de la revisión 3 (18-10-2026) | — | — |
| usuario-v5-varado-3.png, usuario-v5-flota-gur-3.webp | V5 varado; fila de V5 del GUR con las tapas de la cubierta (las Starlink van sobre tapas) | vía el usuario (GUR la segunda) | — |
| usuario-v5-popa-rbk.png, usuario-v5-dos-rbk.webp, usuario-v5-rbk.webp | V5 en el agua (prueba en un río): popa en castillo con dos ventiladores, Starlinks sobre cajas con rejilla | RBK-Україна, vía el usuario | — |

Logos: UFORCE, `https://cdn.prod.website-files.com/69844f2062f5867ca9e6b409/698f53e17f90be48592bf827_UFORCE.svg` (uforce.com). MAGURA, calcado de mil-15-1 (`hd/rec/`, potrace).

Color a primera vista: gris azulado/verdoso mate (V5 al aire libre, más claro de lo previsto), gris más neutro el V7 en sala; medirlo en la fase 3. Rótulo «UFORCE MAGURA» en blanco en el costado del V7 (calca posible).

## Para la fase 3 y siguientes

Lo que hace falta para la maqueta y la web, apuntado en la fase 1:

- **El visor sirve**: no da por hecho que haya alas ni hélices. Es un visor de piezas (cascos, placas, cajas, tubos…) con vistas Planta, Abajo, Perfil, Frente y 3D. El `casco` por secciones, con `arista` (pantoque) y `panza`, debería dar el casco en V de una lancha de planeo.
- **Las dos versiones**: el visor hoy enseña una sola maqueta. Decidido: **un solo visor con tres botones** (V5 · V5 R-73 · V7), junto al de «Maqueta | Pixel». Es código nuevo en `visor-uas.ts` y `VisorUAS.astro` (cambiar de maqueta, recalcular encuadre, siluetas de la tira de vistas, partes con letras y modo Pixel de cada una), y tiene que quedar sin efecto en los demás drones, que siguen con una sola. Archivos: `magura-v5.ts` y `magura-v7.ts`, con lo común (el casco, si se parece) compartido, como el Geran-2 importa el Shahed-136.
- **Tarjeta, planta y portada**: son una por dron. Hay que elegir cuál de los dos sale en `/uas` y en el hangar (propuesta: el V7, el más reciente).
- **Doble trabajo** en las fases 3 y 4: dos maquetas, dos pixel; la 2 tiene que traer fotos de los dos.
- **Cargas, decididas**: V5 kamikaze (la carga va dentro, no se ve); V5 con R-73, que **no es otra maqueta**: la del V5 más los dos raíles y los misiles (mayo y diciembre de 2024); V7 con dos AIM-9. La torreta del V7 no va. Los misiles: mirar los del FQ-44A (`fq-44a-fury.ts`, acabado `gris-misil`). Rótulos cortos («V5», «V5 R-73», «V7») para que quepan en el móvil junto a «Maqueta | Pixel».
- **«Montado como en vuelo»**, en un barco: navegando, sin remolque ni soportes. **Sin mar** en el visor (sería código nuevo). Queda por ver si la línea de flotación se marca con pintura (si las fotos la enseñan) o no se marca.
- **Sin hélices que giren**: el V5 lleva hidrorreactor (una tobera en la popa); el V7, motor diésel, sin publicar si es hidrorreactor o hélice: mirarlo en las fotos.
- **Piezas que buscar en las fotos**: casco en V con cubierta casi plana, tapa del motor, antenas de satélite (dos Starlink planas y una Kymeta), mástil o soporte de cámaras (día y térmica), tobera, raíles de misiles, torreta del V7.
- **Color**: gris oscuro casi negro mate. Seguramente acabado nuevo (en `tipos.ts`, `uas-paletas.ts`, `uas-hd.ts`).
- **Marcas**: probablemente ninguna; comprobar en las fotos.
- **Encuadre**: largo y estrecho, como los drones de ala larga; el encuadre del visor no se toca.
- **Sello «Dron naval»** (fase 5): hoy el «Prototipo» sale en `src/pages/uas/index.astro` (línea ~110) si la nota lleva el tag `prototipo`. Hacer lo mismo con `naval`, con un toque azulado en el CSS.
- **Portada** (fase 5 o 7): el hangar elige un dron de dos listas fijas en `src/pages/index.astro` (`pequenos` y `grandes`); el Magura, si entra, iría en `grandes`. Preguntar si el usuario lo quiere en el hangar, siendo un barco.
- **Fotos para la fase 2**: Naval News en IDEF y DSEI 2023 (V5 entero, de lado), presentación del GUR del 14-05-2025 (V5 y V7 juntos, V7 con AIM-9 y con torreta), fotos rusas de V5 capturados (interior y antenas).

## Probado y descartado

- Agua: variantes A (translúcida) y C (casi opaca); se eligió la B.
- Configuración de las fotos en el agua (antena ovalada en poste): la foto `marina` está muy cerca y tapada por una persona y no encaja (más de 20 px); se usa la de la exposición de 2025.
- Primer casco con la proa llena (en U): la foto de tres cuartos da una cuña larga.
- Agua como una lámina sola: en «Perfil» y «Frente» (a ras del agua) se ve de canto y no tapa nada. Por eso, el teñido.
- Dos `npm run dev` a la vez: Astro no deja. Para las herramientas de `arte/` (que miran al 4321) con el servidor en el 4322, un puente de puertos en el scratchpad.
- Rótulo «MAGURA» dibujado a mano con trazos y una sola calca con `espejo` (salía al revés en un costado): rechazado; los logos, copiados 1:1 o el archivo oficial.
- Casco con curvas suaves entre secciones, una sola Starlink, techo plano hasta la popa, torreta de columna con platillo, cuatro cámaras de proa, defensa gorda con pomo, popa en hexágono con tobera de bola: rechazados en la revisión.
- Encaje de una foto sola para el perfil: la cámara está ~8° por encima y daba alturas falsas; ajuste conjunto de las dos fotos (con la borda nivelada para fijar el cabeceo).
- Tubos de proa como cilindros largos con la placa detrás: son cápsulas sobre una placa atornillada a la cubierta.
- Casco por facetas con arista en cada sección (revisión 1): el costado salía a tropezones. Ahora liso a lo largo con `quiebre` solo donde el barco dobla.
- Castillo de popa de 35 cm: en el perfil el escalón caía más a proa que en la foto; se dejó en 25 cm.
- Tubos de proa sobre una placa horizontal: parecían flotar. Van apoyados en el borde con una placa de pie en la punta de popa.
- Tubos de proa (cápsulas sobre placa, en el borde): el usuario los rechaza del todo (revisión 3); no van.
- Rampa del techo desde z −0,85 (dentro de la primera Starlink) y castillo de popa de 25 cm a escalón: rechazados en la revisión 3.
- Planta de la proa con la punta estrecha (0,11 a 19 cm de la punta, de la foto de tres cuartos): desde arriba salía un «morro de cocodrilo»; rechazado, ahora cuña uniforme. Defensa con un extremo en cada lado: dos bolas en la punta; ahora de una pieza.
- `arte/comparar-foto.mjs --zoom` saca la maqueta algo más grande que la foto: para comparar de cerca, mejor sin `--zoom` y recortar la misma zona de las dos.

## Registro

- 16-10-2026, fase 1: buscadas las fuentes (Naval News, Kyiv Post, Militarnyi, GUR, Janes, LIGA, The Aviationist, Ukrainska Pravda, Rubryka, Babel; Wikipedia y drone-warfare.com para orientarse). Escrita la nota con V5 y V7. Tres tuits en «En acción»: Ivanovets (V5, feb. 2024), Mi-8 (V5, dic. 2024) y Su-30 (V7, mayo 2025).
- 16-10-2026, fase 2: buscadas fotos (Commons solo tiene vídeos; Euromaidan Press/Militarnyi/GUR/Euronews). Bajadas 8; sin planta ni vista inferior del V7.
- 16-10-2026, fase 2 (2.ª vuelta): +9 fotos; sin vista inferior ni tobera en ninguna fuente.
- 17-10-2026, fase 3 (1.ª sesión): casco del V5 encajado de perfil; elegida la configuración de las fotos en el agua (torreta a media eslora, antena ovalada en poste a popa). Prueba del agua en el visor con tres variantes; el usuario decide.
- 17-10-2026, fase 3 (2.ª vuelta): configuración de la exposición; techo 10 cm más alto (el perfil se mira algo desde arriba); planta medida sobre la defensa; cubierta, logo propio, partes y fuentes; tapa de popa plana.
- 17-10-2026, fase 6 (revisión 1): el usuario señala 5 fallos (logo, perfil y 2.ª Starlink, cámaras y tubos, casco facetado, popa) y pide el emblema. Ajuste conjunto de las fotos grandes de Militarnyi, casco por facetas (`facetas` en el motor), rótulo con el logo oficial de UFORCE y MAGURA calcado, torreta, tubos, defensa y popa rehechos. Emblema del GUR: el usuario da la versión en cirílico; calcada y puesta. Caja de proa estrechada a 0,115.
- 17-10-2026, fase 6 (revisión 2): el usuario señala tropezones del casco, arista larga cortada, tubos flotando, caseta, cornamusas y popa; da tres fotos de RBK-Україна. Analizado con las dos cámaras, la foto de DSEI y las nuevas; esperando su visto bueno.
- 17-10-2026, fase 6 (revisión 2, corrección): motor con `quiebre`; casco remedido (defensa, frente y costado de la caseta, popa en castillo); tubos, cornamusas, cúpula, caja de popa, ventiladores, herrajes y tapa redonda de la escotilla.
- 18-10-2026, fase 6 (revisión 3): el usuario señala líneas del perfil (franja de borda, pantoque, quilla, rampa), tubos, defensa, popa y tapas, y pide calcar las cámaras. Líneas medidas con `sobre_x` en la foto de perfil y en sus trazos; casco, defensa, rampa y castillo rehechos; tubos fuera; tapas con tornillos; torreta y caja de proa calcadas.
- 18-10-2026, fase 6 (retoques): proa en cuña uniforme desde arriba y defensa de una pieza; tapa de la escotilla en relieve con tornillos. Commit.
