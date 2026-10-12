# FQ-44A Fury (Anduril) — diario

## Dónde estamos

- **Fase 1 (la nota) hecha** el 12-10-2026: `02 - Temas/Hangar de UAS/🇺🇸 FQ-44A Fury.md` en la bóveda, `estado: borrador`, `publicar: true`. Vista por el usuario («sigue, ya editaré la nota»). Sin commitear.
- **Fase 2 (fuentes y fotos) hecha** el 12-10-2026, a falta de que la vea el usuario: 30 fotos en `arte/uas-fuentes/fq-44a-fury/full/`, 10 capturas del interactivo en `full/interactivo/`, 6 del AIM-120 en `arte/uas-fuentes/aim-120/full/`, `FUENTES.md` (tabla copiada abajo) y el código de la cámara del interactivo en `hd/interactivo-camara.js`.
- **Fase 3 (maqueta) a medias**, 12-10-2026: `src/data/uas/fq-44a-fury.ts` con cuerpo, ala con flaps y alerones, cola, tobera redonda, toma con labios en «<», tren, compuertas, lanzadores, AIM-120 (ala derecha, x negativa), antenas, joroba, veletas, cúpulas, franja oscura, marcas, costuras, partes A-G y 11 fuentes (miniaturas en `public/uas/fq-44a-fury/fuentes/`). Nota importada (`src/content/uas/fq-44a-fury/`). Motor ampliado: `Seccion.contorno` (`tipos.ts`, `uas-geometria.ts`), `Calca.capa`, dibujos `poligono`, `usaf`, `anduril`, `aviso-toma`, `malla`, `color` en `serie` y `escudo`, `cursiva` en `texto` (`uas-hd.ts`); acabados `gris-fu` y `gris-fu2`. Encajes en `arte/uas-fuentes/fq-44a-fury/hd/` (perfil-der, frente, vuelo).
- **Pendiente al cortar**: la ficha en local dio un error 500 en algún recurso (mirar `preview_logs` / consola); revisar `npm run lint` y `astro check`; ver el visor en todas las vistas; luego fases 4 (pixel, tarjeta, planta, `vistaTarjeta`, `desfaseLuz`) y 5.
- **Medidas clave** (fotos, no interactivo): 10,0 m de largo (con el AIM-120 y las ruedas), 6,06 m de envergadura; el lomo real 13-16 cm más bajo que el interactivo y la arista 4 cm más baja; bajos de costados rectos y suelo plano; boca de la toma en z 2,16 con la cuña hasta 1,87; tobera redonda de 36 cm. Con el morro a la derecha se ve el costado **derecho** (las fotos se renombraron).
- Proponer al usuario: la cita de la nota dice «unos 6 m de largo»; lo medido son 10 m.
- Nada commiteado, en ninguno de los dos repos; en `main`.

## Decisiones del usuario

- 12-10-2026: dron elegido, el **Fury de Anduril**, para aprender del programa CCA. «Completo»: nota sencilla (Historia: el programa y si se ha elegido; Especificaciones: lo poco que se sabe y su uso como loyal wingman), maqueta, pixel, etc.
- 12-10-2026: **nombre** «YFQ-44A Fury, salvo que el proyecto ya salga adelante». Ha salido (contrato de producción del 17-jun-2026, nombre oficial del 14-sep-2026): va como **FQ-44A Fury** (`/uas/fq-44a-fury`), con la maqueta del prototipo YFQ-44A, que es el de las fotos.
- 12-10-2026: **carga**, un **AIM-120 AMRAAM bajo el ala**, como en las pruebas de 2026.
- 12-10-2026: el **ejemplar** de las marcas lo elige Claude (el que tenga más fotos de los dos lados).
- 12-10-2026: **forma del interactivo de la web de Anduril, detalles y acabado de las fotos reales** (el interactivo no tiene el mismo acabado que los prototipos). El modelo 3D de Anduril no se baja ni se copia: se sacan capturas desde ángulos conocidos y se mide sobre ellas, como con los renders del Wildfire. Donde no coincida con las fotos, mandan las fotos.
- El usuario avisa de los fallos de otras maquetas: los **detalles** (cámaras, juntas, tornillos, tomas y salidas de aire) salen peor que la forma. Cuidarlos aquí.

## Fuentes

Las de la nota (`## Fuentes`). Cifras: 6,1 m de largo, 5,2 m de envergadura, 2.270 kg de MTOW, FJ44-4M de 4.000 lbf, Mach 0,95, 50.000 ft, +9/−3 g, hasta 400 lb de carga interna; todas del diseño de Blue Force (The War Zone, «The Rise Of Fury», septiembre 2023); nada oficial del YFQ-44A. Dos soportes bajo las alas en el prototipo, cuatro en el de serie (The War Zone y The Aviationist, 2026). La web de Anduril no da cifras (solo el interactivo).

### Fotos (copia de `arte/uas-fuentes/fq-44a-fury/FUENTES.md`)

Ejemplar de las marcas: **YFQ-44A 25-1003** («AI»), de la Unidad de Operaciones Experimentales del CCA, en Creech AFB, 20-21 de julio de 2026 (el que más fotos tiene, de cerca y al sol). Fotos de la USAF, dominio público.

| Archivo (full/) | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| d1003-perfil-der.jpg | Perfil derecho al sol, casi a nivel: forma, marcas, tren | SrA Renee Blundon, USAF, DP, 20-jul-2026 | https://www.dvidshub.net/image/9870311 |
| d1003-perfil-der-sombra.jpg | Perfil derecho bajo el parasol, algo de abajo | Ídem | https://www.dvidshub.net/image/9870316 |
| d1003-frente.jpg | De frente rodando, teleobjetivo | Ídem | https://www.dvidshub.net/image/9870308 |
| d1003-morro-bajo.jpg | Morro de cerca: sonda, rejilla, arista, «DANGER JET INLET» | Ídem | https://www.dvidshub.net/image/9870340 |
| d1003-carga-ala.jpg, d1003-carga-cerca.jpg, d1003-carga-lado.jpg | AIM-120 inerte entrando en el lanzador del ala izquierda | Ídem | https://www.dvidshub.net/image/9870323, …/9870326, …/9870333 |
| d1003-tren-ala.jpg | Tren principal, pilón y puerta, bajo el ala izquierda | Ídem | https://www.dvidshub.net/image/9870321 |
| d1003-sombra-tres-cuartos.jpg, d1003-sombra-detras.jpg | Tres cuartos de delante y de detrás bajo el parasol | Ídem | https://www.dvidshub.net/image/9870315, …/9870314 |
| d1003-rodaje-sombra.jpg, d1003-rodaje-izq.jpg | Perfil derecho rodando al sol; perfil izquierdo rodando, con teleobjetivo | Ídem | https://www.dvidshub.net/image/9870312, …/9870304 |
| d1003-pista.jpg, d1003-rodaje-lejos.jpg | En pista, lejos | Ídem | https://www.dvidshub.net/image/9870307, …/9870302 |
| d1003-despegue.jpg, d1003-despegue-lejos.jpg | Despegando, 21-jul-2026 | USAF (DVIDS), DP | https://www.dvidshub.net/image/9878412, …/9878396 |
| c1003-creech.jpg | Perfil izquierdo en la pista | SrA Renee Blundon, USAF, DP | https://commons.wikimedia.org/wiki/File:A_USAF_YFQ-44A_Fury_sits_on_the_flightline_at_Creech_AFB_260720-F-NV774-1009.jpg |
| c1003-holanda.jpg | Costado izquierdo de la cola y el ala; «YFQ-44A» bajo el ala | William R. Lewis, USAF, DP | https://commons.wikimedia.org/wiki/File:Members_of_the_RNLASF_observe_a_U.S._Air_Force_YFQ-44A_Fury_260720-F-UT528-1013.jpg |
| c1003-repostaje.jpg, c1003-arranque.jpg | Perfil izquierdo con misil; arranque | Airman Vinh Phan, USAF, DP | https://commons.wikimedia.org/wiki/File:An_Airman_refuels_a_YFQ-44A_Fury_at_Creech_AFB_260721-F-NO357-1002.jpg, https://commons.wikimedia.org/wiki/File:Airmen_observe_a_YFQ-44A_Fury_aircraft_during_startup_procedures_260721-F-NO357-1003.jpg |
| c1003-carga.jpg | Carro con dos AIM-120 inertes (bandas azules) | William R. Lewis, USAF, DP | https://commons.wikimedia.org/wiki/File:Airmen_prepare_to_load_inert_AIM-120_missiles_onto_a_YFQ-44A_Fury_260720-F-UT528-1020.jpg |
| c1001-cautivo.jpg, c1001-disparo.jpg, c1003-vuelo.jpg | 25-1001 en vuelo con el AIM-120 inerte bajo el ala derecha y disparando; el 25-1003 en vuelo desde arriba y detrás (Commons lo pone como 25-1001) | SAF Public Affairs; Jennifer Healy, USAF, DP | https://commons.wikimedia.org/wiki/File:YFQ-44A_-_Collaborative_Combat_Aircraft_(CCA)_program.jpg, https://commons.wikimedia.org/wiki/File:A_YFQ-44A_fires_an_AIM-120_over_the_Mojave_Desert_260710-F-UU560-1115.jpg, https://commons.wikimedia.org/wiki/File:A_YFQ-44A_flies_over_the_Mojave_Desert_after_conducting_live-fire_testing_260710-F-UU560-1070.jpg |
| c-pista-dos.jpg | Dos YFQ-44A en pista, desde arriba | USAF, DP | https://commons.wikimedia.org/wiki/File:YFQ-44_are_parked_on_the_flightline_at_a_California_test_location_260212-F-AF000-1313.jpg |
| c-camara-ensayo.jpg, d-camara-ensayo-2.jpg | Prototipo en una cámara de ensayos, Costa Mesa, 2025 | MSgt Gustavo Castillo, USAF, DP | https://commons.wikimedia.org/wiki/File:YFQ-44_ground_test.jpg, https://www.dvidshub.net/image/9006934 |
| c-bourget.jpg | Maqueta del Bourget 2025 (no es un avión real) | Artvill, CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Drone_Anduril_YFQ-44_au_Salon_du_Bourget_2025.jpg |
| d-render-frente.jpg | Render de frente sobre negro, dic. 2025 | USAF/Anduril (DVIDS) | https://www.dvidshub.net/image/9456988 |
| a-vuelo-tren.png | En vuelo con el tren fuera (web de Anduril) | Anduril | https://www.anduril.com/fury |
| interactivo/i-*.jpg | Capturas del interactivo de Anduril con la cámara puesta a mano (`hd/interactivo-camara.js`): perfil, planta, panza, frente, detrás; distancia 80 y campo de 0,9-2,3°, casi ortográficas. Modelo negro, sin marcas | Anduril, web oficial | https://www.anduril.com/fury |
| ../aim-120/full/*.jpg, *.png | AIM-120 en el Udvar-Hazy (CC0), de cerca (USAF), en la ILA 2024 (CC BY-SA 3.0), en un F-15 (USAF); dibujos de frente y de detrás (100Polar, CC BY-SA 4.0) | Ver `FUENTES.md` | Commons |

### La forma (primera lectura, antes de medir)

- **Cuerpo**: largo y estrecho, con morro cónico afilado y **aristas vivas** a los costados (la línea donde cambia la luz en el perfil) desde el morro hasta el ala. Lomo redondeado; panza ancha y más plana. En la cola, cono corto con un tapón redondo en la punta.
- **Toma de aire**: **una, bajo el fuselaje delantero** (ventral), detrás de la rueda de morro: en el interactivo de frente, boca ancha ovalada bajo el morro; en las fotos, el aviso «DANGER JET INLET» en la arista de abajo, cerca del tren de morro.
- **Salida del motor**: en el interactivo de detrás, **boca ovalada arriba, bajo la deriva**, sobre la panza. Comprobar en fotos reales de detrás (c1001-vuelo, d1003-sombra-detras) antes de modelarla.
- **Ala**: media, trapezoidal; borde de ataque con mucha flecha, borde de salida casi recto, punta corta y recta. Alerones/flaps en el borde de salida (juntas en el interactivo). Un pilón bajo cada ala, hacia la mitad de la semienvergadura.
- **Cola**: una deriva grande en flecha, con timón; dos estabilizadores horizontales trapezoidales, más bajos que el ala.
- **Tren**: triciclo; patas blancas o claras; el principal sale del fuselaje bajo el ala (no del ala).
- **Detalles vistos en fotos**: sonda en el morro arriba (veleta), rejilla en el costado detrás del morro, una toma pequeña, antenas de pala en el lomo (dos o tres), luces verde y roja en las puntas, luces de aterrizaje en el tren de morro, tapa con tornillos en el lomo detrás del morro.
- **Marcas del 25-1003** (costado derecho, d1003-perfil-der): en la deriva, escudo del ACC, «AI» y «AF 25 1003»; insignia (las alas) de la USAF en el fuselaje trasero; franja gris oscuro por el lomo con «YFQ-44A» y en pequeño «Anduril Industries / Collaborative Combat Aircraft»; logo y «ANDURIL» detrás del morro; «U.S. AIR FORCE» abajo, detrás del ala; triángulo de aviso de la toma; logos de Anduril (triángulo) en la cola; rayitas «////» de paso. Bajo el ala derecha, «YFQ-44A» (c1003-holanda). Sin estrella nacional a la vista.
- **Color**: gris claro verdoso mate, con zonas y franjas en gris más oscuro (lomo, morro). Medir en fotos al sol (d1003-perfil-izq, d1003-rodaje-sombra).
- **El interactivo de Anduril** tiene la misma disposición (morro, ala, cola, toma ventral), pero es negro y más liso; antes de usar sus medidas, encajarlo con el perfil del 25-1003 y ver si es el mismo avión o un Fury anterior.
- **Escala**: la envergadura del interactivo es el 61 % del largo; las cifras de Blue Force (5,2 / 6,1 m) dan el 85 %. Una de las dos no vale para el YFQ-44A: medir con las fotos (ruedas, personas, el AIM-120 de 3,65 m bajo el ala).
- **AIM-120**: inerte (bandas azules), en un lanzador bajo el pilón del ala izquierda (d1003-carga-ala). En el 25-1001, uno bajo el ala derecha (c1001-cautivo).

## Registro

- 12-10-2026: nota escrita con fuentes cruzadas (The War Zone, DefenseScoop, The Aviationist, Defense News, AFRL, Wikipedia). La web de Anduril no se lee con `fetch` (JavaScript); en Chrome solo da textos de marketing y el botón «Launch Interactive View». Tuits de «En acción» sacados de los artículos de The War Zone y The Aviationist y comprobados con la API de syndication: el SecAF en el primer vuelo (foto), Anduril en febrero de 2026 (vídeo, «Fight Unfair.») y el disparo del AIM-120 (vídeo, 15-jul-2026).
- 12-10-2026, fase 2: fotos de Commons (categorías de los dos prototipos con número de cola, 25-1001 y 25-1003) y de DVIDS (búsqueda «YFQ-44A»; DVIDS bloquea `curl`, se leyó con Chrome y las imágenes salen de su CDN a 2000 px). Interactivo de Anduril: escena WebGL (framework Hydra); se puso una cámara propia casi ortográfica (código en `hd/interactivo-camara.js`) y se capturó la pantalla. Probado y descartado: mandar el lienzo a 3200 px a un receptor en el Mac (Chrome no deja a una web pública escribir en localhost) y las capturas reducidas (se guardan al tamaño de la vista previa). La web de Anduril solo confirma Mach 0,95; de sus imágenes grandes, solo sirve una (en vuelo con el tren fuera).
- Para proponer al final: nota del **AIM-120 AMRAAM** en `Armamento/` (en la nota del Fury va sin enlace porque no existe).
