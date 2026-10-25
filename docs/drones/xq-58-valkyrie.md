# XQ-58 Valkyrie (Kratos) — diario

## Dónde estamos

- **Cerrado** el 25-10-2026: fases 4 (pixel HD), 5 (en la web) y 7 (cierre) hechas; el usuario lo dio por terminado sin revisión aparte (fase 6).
- En la web: ficha importada, visor en Maqueta y Pixel (todas las vistas, día y noche), partes, fuentes y tarjeta en `/uas` con su filtro, probados; lint y `astro check` sin errores. Sin nave en el hero.
- Añadido a «Drones hechos» de `docs/hangar-de-uas.md`.
- Commiteado en zodk-web y en la bóveda (la nota). **Sin push**: el de `main` publica.
- Quedó sin decidir (de la fase 3): el parche oscuro de la rampa delante de la toma.

## Decisiones del usuario

- 25-10-2026: pintura con desgaste, nivel **fuerte**; juntas con la opacidad de siempre.

- 24-10-2026: dron elegido, el **XQ-58 Valkyrie** («XQ58 Valkyrie»), nombre `XQ-58 Valkyrie`.
- 24-10-2026: versión **XQ-58A de tren (Marines)**; carga: **bodega cerrada, limpio**; avión de las marcas: **uno con la pintura de los Marines** (170740-170742).
- 24-10-2026 (revisión 2): las medidas están bien; corregir sin volver a medir.
- 24-10-2026 (fase 3): forma de las mejores fotos de cualquiera de los dos modelos; pintura y marcas, de los Marines (se eligió el **170741, «108»**); **sin tren** (va en vuelo); logos reales descargados, tal cual.

## Medidas clave

- 9,1 m de largo, 8,2 m de envergadura, 2.722 kg de MTOW (Kratos, Airbus). Escala de la maqueta: 3 m por unidad.
- Ejes: punta del morro en z 4,55, y = 0; punta de la cola (canal) en (0, −0,3, −4,55).
- Medido en la revisión 1 (cámaras del encaje conjunto, retroproyectando píxeles con un eje fijo o sobre el plano de la deriva; perfil y foto desde arriba casan a 1-8 cm): deriva en el plano y = −0,611 + 0,844·x (40°, revisión 2: pasa por la arista y por la punta medida); borde de ataque de (0,55, −2,66) a (2,05, −3,63); borde de salida de (0,55, −3,57) a un quiebro en (1,6, −4,29) y a la punta (2,05, −4,06). Ala: borde de salida z = −2,2 + 0,45·(4,1 − x) hasta la esquina de la muesca (x 1,0, z −0,81) y curva hasta la arista en (0,66, −1,45). «MARINES» del costado (revisión 2), de z −2,62 a −0,82, 0,24 m de alto, entero encima de la arista. Ala: `cabeceo` 0,053 (sigue la arista, de y 0,045 en z 0,84 a −0,077 en z −1,45) y diedro 0,17 para que la punta siga en (4,1, 0,09, −1,53). Labio de la toma: de la punta (z 1,93) al pie de las paredes en z 1,74. Capota de 5 cm de grueso; la esquina del techo empieza al 70 % del medio ancho (0,55 m). Tobera: r 0,20 m, centro y −0,01, boca en z −3,81; capó de 2 cm, borde arriba en z −3,85 y pie en −3,97; canal de medio ancho 0,24 (z −3,72), 0,3 (−3,9), 0,2 (−4,3), suelo plano.
- Encaje conjunto de 4 fotos en vuelo (`arte/uas-fuentes/xq-58-valkyrie/hd/conjunto-datos.json`, `conjunto.mjs` copiado del SIRTAP; deja las `.cam.json` para `comparar-foto.mjs`), errores de 3-9 px: labio de la toma (0, 0,62, 1,93); punta del ala, borde de ataque (4,1, 0,09, −1,53) y de salida z −2,2; raíz del borde de ataque en la arista, z ≈ 0,8 (flecha 34°); borde de salida en la raíz ≈ −0,95; punta de las derivas (2,0, 1,1, −3,58) a −4,16. La raíz de las derivas no la fija el encaje: se puso a ojo, superponiendo (baja casi hasta la arista).
- Color al sol en el lomo: foto #76838c, render #788088 (perfil de los Marines).
- Pixel (barriendo el desfase): la pintura al sol entra al pixel en 3,6-3,95 escalones (el HD medido sale más claro por el desgaste, que el pixel no lleva); con −0,2 queda en 3,4-3,75 y la planta sale sin franjas; con −0,25 el lomo se parte más. Costado a la sombra: HD #0a0e14; sin `sombraNegra` el pixel lo daba #121b26 (azul marino), con ella #0a0e14.
- Cámaras encajadas para el detalle: rampa (DVIDS 8261981 a 3000 px; morro, labio, puntas del ala y de las derivas, errores de 3-18 px; para pintarla en el visor, `rampa-cerca` acercada a 40 m) y Pentágono (Nikon Z 8 a 70 mm, campo fijo 19,45°; labio y derivas, 4-35 px). Juntas del 170741 medidas: la del morro corta la arista en z 3,88; la vertical «C», en 2,92; la bisagra del timón, de (0,69, −0,04, −3,36) a (1,59, 0,74, −4,05).

## Fuentes

| Archivo (`full/`) | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| usmc-vuelo-2.jpg | 170741 «108», perfil derecho en vuelo | Fuerza Aérea de EE. UU., dominio público | commons.wikimedia.org/wiki/File:Marine_Corps_XQ-58A_Valkyrie.jpg |
| usmc-vuelo-1.jpg | «107» de los Marines desde arriba | Fuerza Aérea de EE. UU., dominio público | commons.wikimedia.org/wiki/File:U.S._Marine_Corps_XQ-58A_Valkyrie.jpg |
| dvids-8261981.jpg | 170741 en la rampa, Eglin AFB (izquierda, cola, toma) | Samuel King Jr., Fuerza Aérea, dominio público | dvidshub.net/image/8261981 |
| museo-usaf-1.jpg, museo-usaf-2.jpg | Toma y morro de cerca (prototipo) | Logan Rickert, CC BY 4.0 | commons.wikimedia.org/wiki/File:Kratos_XQ-58A_Valkyrie.jpg |
| maqueta-ila.jpg | Maqueta con marcas de los Marines, ILA 2026 | André Gerwing, CC BY-SA 4.0 | commons.wikimedia.org/wiki/File:Kratos_XQ-58A_Valkyrie_Mockup_2026-06-11_Andre_Gerwing_Collection_ID_029735.jpg |
| primer-vuelo.jpg | Prototipo de perfil izquierdo | 88 Air Base Wing, dominio público | commons.wikimedia.org/wiki/File:XQ-58A_Valkyrie_demonstrator_first_flight.jpg |
| cuarto-vuelo.jpg | Prototipo desde arriba y detrás | AFRL, dominio público | commons.wikimedia.org/wiki/File:AFRL_XQ-58A_Valkyrie_expands_flight_envelope_in_fourth_test_6054347.jpg |
| logos/mcwl-oficial.png | Escudo del Laboratorio de Combate de los Marines (el de la deriva) | Marines, dominio público | media.defense.gov/2025/May/29/2003726896/-1/-1/0/240418-M-M0321-0022.PNG (web mcwl.marines.mil; se baja desde el navegador, curl da 403) |
| orig/dvids-8261981.jpg | El mismo 170741 en la rampa, original de 3000 px (lomo, ala izquierda, derivas desde arriba y detrás) | Samuel King Jr., Fuerza Aérea, dominio público | d34w7g4gy10iej.cloudfront.net/photos/2402/8261981.jpg |
| orig/pentagono.jpg | Otro XQ-58A de los Marines («CF 02», VMFA-211) en el Pentágono, costado izquierdo, 8256 px | Departamento de Defensa, dominio público | commons.wikimedia.org/wiki/File:XQ-58A_Valkrie_displayed_at_the_Pentagon_Center_Courtyard.jpg |
| orig/usmc-miramar.jpg | XQ-58A de los Marines en Miramar, costado derecho a contraluz, 7534 px | Marines, dominio público | commons.wikimedia.org/wiki/File:Marine_XQ-58A_at_2023_MCAS_Miramar_airshow.jpg |
| logos/hqmc-aviation.png | Escudo del Departamento de Aviación de los Marines | Marines, dominio público | commons.wikimedia.org/wiki/File:HQMC_Aviation_(color).png |

Las de la nota (`## Fuentes`). Cifras: largo, envergadura y MTOW de Kratos y Airbus; Mach 0,86 y 13.700 m de la web de Kratos; alcance «más de 3.000 nmi» (Kratos) y «más de 5.000 km» (Airbus); FJ33 de 8,9 kN de Wikipedia (hoja de Kratos, enlace muerto); bodega de hasta 1.200 lb en el de rampa, la mitad en el de tren, 600 lb por ala (The War Zone, agosto 2026).

## Probado y descartado

- Labio de la toma vertical, con las paredes delante: desde arriba y de lado (ILA, museo) el labio de arriba va adelantado y los lados caen hacia atrás.
- Cola en V con la raíz sobre los hombros: en el perfil de los Marines la deriva cercana baja casi hasta la arista.
- El escudo del Laboratorio de Combate de Commons (fondo azul): el avión lleva el de su web, con el fondo naranja.
- Labio de la toma en «V» hasta la boca (z 1,45): desde arriba en punta, pero de perfil sin pared; en la foto de perfil la pared es casi vertical y el labio cae casi recto (pie en z 1,74).
- Capota que sigue por debajo del lomo detrás de la boca, para borrar la junta: sale una raya más oscura. Se quedó a ras, con `soldadura`.
- Boca en media luna pintada en el frente del lomo: desde ninguna vista se ve distinta; lo que oscurece la toma es el forro negro bajo el techo.
- Labio de la toma en «V» desde arriba: de frente sale un arco; en el museo, horizontal arriba y luego cae (revisión 2).
- Capó de la tobera como pieza aparte, cortado recto: dejaba un escalón al lado y una boca ancha y baja. Ahora es el final del lomo en el fuselaje (revisión 2).
- Techo de la capota con la curva de la «tienda» (lo alto contado desde el eje): de frente, el labio sale en arco; tiene que ser plano y horizontal (usuario, revisión 3).
- Tobera a ras del final del lomo, con su anillo a la vista: en las fotos va metida bajo el capó, cuyo borde pasa justo detrás de ella.
- Borde del capó de la tobera que baja hacia atrás 45 cm: en la foto del cuarto vuelo es casi recto, a ras de la tobera.
- Antena de látigo sobre el lomo y pala bajo la cola: quitadas (usuario, revisión 4).
- Canal de la tobera más ancha, con paredes vivas y el suelo con la curva del lomo: salían protuberancias; el usuario la quiere lisa y continua, como antes (revisión 4).
- Paso de la caja de la toma a la campana del lomo en 0,75 m (z 1,45 a 0,7): cintura detrás de la capota (revisión 4).
- Pie de la capota (o del capó de la tobera) hundido en el lomo a lo largo: se cruzan casi tangentes y salen manchas y arrugas. Ahora va por encima, salvo delante de la boca.
- Juntas del morro sacadas del Pentágono: ese avión tiene la junta del morro y la vertical 20-30 cm más adelante que el 170741 (o la cámara no casa en el morro); el morro y el lomo, de la foto de la rampa.
- Comparar con cámaras de teleobjetivo a 90-200 m en el visor: la capota parpadea con el lomo (poca precisión de profundidad) y salen manchas negras que no existen. Acercar la cámara a unos 40 m.
- Capota que acaba a ras en la boca, con su tapa o abierta: raya en la unión (el canto de la boca del fuselaje asomaba por la tinta). Ahora sigue hasta z 1,2 y el lomo se hunde 1,5 cm bajo ella.

## Registro

- 24-10-2026: fase 1. Nota escrita con Wikipedia, Kratos, AFRL, Fuerza Aérea, Defense News, Shephard, The War Zone, Army Recognition y Airbus. Fuera de la nota por mesura: los accidentes de octubre de 2019 y de Dugway (4-ago-2026), el concurso OBSS perdido ante el XQ-67A, Taiwán como posible cliente.
- 24-10-2026: fase 3. Encaje conjunto de 4 fotos; fuselaje de secciones en «tienda» con arista viva (contorno generado en el `.ts`), capota de la toma aparte (abierta delante, labio en parábola), rampa, boca y tobera con canal; ala con alerón y puntas rojas; cola en V. Calca nueva `imagen` para los dos escudos en color. Marcas colocadas superponiendo con el perfil y la foto desde arriba de los Marines. Fallo cazado: una sección repetida (misma z) en la capota dejaba la cámara en NaN.
- 24-10-2026: revisión 1 del usuario (6 capturas). Derivas, muesca, panza, «MARINES», ala a la altura de la arista, toma (labio en punta, paredes, forro negro, rampa menos honda) y tobera (capó hueco con tobera redonda de 30 cm), medidos con las cámaras del encaje. `soldadura` en la maqueta para las uniones. El tubo se pasa a unidades en `aUnidades`.
- 24-10-2026, revisión 2: ala y derivas desde la arista, «MARINES» más grande, labio de la toma recto arriba, capota sin raya, capó de la tobera en el fuselaje.
- 24-10-2026, revisión 3: toma (techo plano, labio recto arriba y cayendo por las paredes, suelo oscuro bajo la capota) y tobera (más grande, bajo un capó fino; canal más ancha), comparadas con el museo, la ILA, Eglin y el cuarto vuelo.
- 25-10-2026, revisión 4: fuera las dos antenas, lomo liso detrás de la capota, canal de la tobera lisa con suelo plano, capó de la tobera sin arrugas.
- 25-10-2026, fase 4: luz del pixel medida en el visor (3D, planta, perfil) con desfases de −0,5 a 0,5; −0,2. `sombraNegra` por el costado azul marino. Tarjeta desde [61, 20]; planta lisa (las letras salían como manchas). Miniaturas generadas y página de revisión.
- 25-10-2026, fases 5 y 7: ficha, visor y tarjeta probados en local con capturas; lint y check limpios; a la lista de drones hechos; commit.
