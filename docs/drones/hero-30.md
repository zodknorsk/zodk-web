# Hero-30 (UVision) — diario

## Dónde estamos

- **Cerrado** el 11-10-2026: el usuario lo da por bueno; commit y push en los dos repos (publicado en zodk.eu). Añadido a «Drones hechos» de `docs/hangar-de-uas.md`.
- **Fase 1 (la nota) hecha** el 11-10-2026: `02 - Temas/Hangar de UAS/🇮🇱 Hero-30.md` en la bóveda, `estado: borrador`, `publicar: true`. Sin commitear.
- **Fase 2 (fuentes y fotos) hecha** el 11-10-2026: 21 fotos en `arte/uas-fuentes/hero-30/full/` y el render de la web en `full/intro/` (122 fotogramas), `FUENTES.md` (tabla copiada abajo). Vista por el usuario («sigue con la maqueta»).
- **Fase 3 (maqueta HD) hecha** el 11-10-2026, a falta de que la vea el usuario: `src/data/uas/hero-30.ts` con la lanzadera (botón «Lanzadera»), partes A–H y 12 fuentes (miniaturas en `public/uas/hero-30/fuentes/`). Nuevo en el motor y datos: bandera `IL` en `banderas.json`; campo `catapulta.nombre` (`tipos.ts`, `VisorUAS.astro`; el Shahed y el MICH siguen diciendo «Catapulta»); acabados `blanco-h30`, `oliva-h30` y `espuma` (en `tipos.ts`, `uas-paletas.ts`, `uas-hd.ts` y `visor-uas.ts`); dibujos `uvision` y `triangulo` (`tipos.ts`, `uas-hd.ts`). Ajustes de cámara en `arte/uas-fuentes/hero-30/hd/` (fuera de Git).
- La nota ya está importada (`npm run importar`, en `main`): `src/content/uas/hero-30/`, tres tuits en `src/data/tuits/` y sus imágenes en `public/tweets/`.
- **Fase 6 (revisión del usuario) cerrada** el 11-10-2026 (el usuario la da por terminada tras dos vueltas): puntas de las alas, cámara, varilla, cola y hélice, detalles y tubo, todo copiado del render de UVision (con los logos de la ILA) y el tubo de la feria checa, cada punto comparado lado a lado con el render o la foto desde su cámara encajada. Nuevo en el motor: calcas sobre las piezas de la catapulta (`catapulta.detalles` en `tipos.ts`, `montarDetalles(…, padre)` en `uas-hd.ts`, `visor-uas.ts`), dibujos `rayas` y `flecha-texto`, y `espejo` en `texto`. Acabado `oliva-h30` cambiado por `tubo-h30` y `espuma` oscurecida. `lint` y `astro check` sin errores.
- **Fases 4 y 5 hechas** el 11-10-2026: `desfaseLuz` 0,5 (la pintura al sol del ala caía a 5,95 escalones, en el borde), `vistaTarjeta` [69, 4] (el ángulo de una captura del visor que eligió el usuario, encajada en `hd/tarjeta.json`), `plantaSin` con las alas y aletas de abajo (asomaban corridas); tarjeta, tarjeta de noche y planta generadas en `public/uas/hero-30/`. Pixel repasado en perfil, frente, 3D y de noche; la nota, reimportada sin cambios; ficha y tarjeta de `/uas` comprobadas. `lint` y `astro check` sin errores. El consumo en Zen no se ha medido (el motor solo cambia con la lanzadera puesta).
- Nada commiteado, en ninguno de los dos repos; en `main`.

## Decisiones del usuario

- 11-10-2026: dron elegido, el **Hero-30** de UVision (Israel), «completo»: nota sencilla (Historia de uno o dos párrafos y Especificaciones), maqueta, pixel, etc.
- 11-10-2026: **España solo si hay algo público**. Lo hay: la presentación a la BRIPAC (Infodefensa, enero 2020), el Hero-30 montado en el Netón de Einsa (ferias desde 2019) y la primera compra de municiones merodeadoras del PACDEF 2024, sin modelo (Defensa.com). Va en la nota con esas fuentes; nada de los cursos que conoce el usuario.
- 11-10-2026: botón **«Lanzadera»** en el visor (como la catapulta del Shahed y del MICH-2000), con el **tubo único sobre su bípode**, y el **dron saliendo por la boca** del tubo, con las alas abiertas e inclinado siguiendo su eje.
- 11-10-2026 (fase 6): **se copia TODO del render** (forma y detalles: cámara, varilla corta y blanca, cola, motor y hélice, puntas, rayas y letras de alas y aletas) «como si se hiciera ese», pero **con los logos que ya lleva** (UVision + Rheinmetall de la ILA). La **lanzadera pasa al tubo de la feria checa** (foto de perfil `c-reise-2.jpg`, sala de muestras), en lugar del húngaro. Los seis puntos se hacen seguidos, sin parar a preguntar entre uno y otro.
- 11-10-2026: el **ejemplar** lo elige Claude. Elegido: el **blanco de serie** con los logos de UVision y Rheinmetall (ILA 2022, render de la web, feria alemana de 2025); los azul claro de Argentina son de instrucción.

## Fuentes

Las de la nota (`## Fuentes`). Cifras: dron de 0,78 m de largo y 0,8 m de envergadura (Flightglobal 2015), 3 kg; con el tubo, 7,8 kg (folleto de 2024) u 8,5 kg (web actual); tubo de unos 95 cm (Infodefensa); cabeza de 0,5 kg; 15 km (web) o 20 km (folleto); 30 min; 100 nudos. El folleto PDF se leyó y se borró.

### Fotos (copia de `arte/uas-fuentes/hero-30/FUENTES.md`)

| Archivo (full/) | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| intro/f000–f121.webp | Render oficial que gira el dron montado: detrás, perfil, planta, frente con la cámara; se abren las alas al principio | UVision, web oficial | https://uvisionuav.com/loitering-munitions/hero-30/ (Hero-30_Dramatic_Intro_NNN.webp) |
| c-ila-a.jpg | Ejemplar blanco de exposición, tres cuartos de frente: morro, cámara, logos UVision y Rheinmetall, alas en X, aletas y hélice | Boevaya mashina, CC BY-SA 3.0, ILA 2022 | https://commons.wikimedia.org/wiki/File:Uvision_Hero-30_ILA-2022.jpg |
| c-ila-frente.jpg | El mismo, de frente: torreta de la cámara, alas en X | Boevaya mashina, CC BY-SA 3.0, ILA 2022 | https://commons.wikimedia.org/wiki/File:Uvision_Hero-30_front_ILA-2022.jpg |
| c-reise-1.jpg | Dron blanco saliendo de un tubo negro sobre bípode, de lado | Reise Reise, CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:UVision_Hero-30_(1).jpg |
| c-reise-2.jpg | El mismo, más de lado: tubo entero con tapas y bípode | Reise Reise, CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:UVision_Hero-30_(2).jpg |
| c-rhk-2022.jpg | Dron blanco saliendo de un tubo oscuro sobre bípode, casi de perfil | Rhk111, CC BY-SA 4.0, 27-abr-2022 | https://commons.wikimedia.org/wiki/File:2022-04-27_Hero-30_Drone.jpg |
| c-dsei.jpg | Familia Hero en DSEI, con el Hero-30 delante | Swadim, CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:HERO_DSEI_IMG_6905.jpg |
| c-ausa.jpg, c-bourget19-a.jpg, c-bourget19-b.jpg, c-bourget23.jpg | Familia Hero en AUSA y Le Bourget (casi todo modelos mayores) | MilleniumAC, Flickr (CC BY 2.0), Mathious Ier; Commons | Category:UVision en Commons |
| de-1.jpg | Dron blanco saliendo de un tubo verde oliva sobre bípode, en una feria; tres cuartos desde arriba | MartinRosenkra3 en X, 31-may-2025 | https://x.com/MartinRosenkra3/status/1928836402994667974 |
| hu-1.jpg | Tubo verde oliva con banda amarilla, tapas de espuma y bípode, del Ejército húngaro | Balogh Ákos, honvedelem.hu, vía RyszardJonski en X, 17-jun-2025 | https://x.com/RyszardJonski/status/1934896848461762628 |
| hu-2.jpg | El tubo sobre su bípode y la antena en trípode, con soldados húngaros | Ídem | Ídem |
| hu-3.jpg | La boca del tubo: el morro con la cámara y las alas plegadas dentro | Ídem | Ídem |
| hu-4.jpg | Mando (tablet reforzada) | Ídem | Ídem |
| ar-1.jpg, ar-2.jpg, ar-3.jpg | Ejemplares de instrucción azul claro, con alas abiertas, de frente, de lado y por detrás | Zona Militar, vía SA_Defensa en X, 8-dic-2023 | https://x.com/SA_Defensa/status/1733193453897728066 |
| arg-1.jpg | Soldado argentino junto al tubo en el suelo (tapa delantera, bípode) | Ejército Argentino en X, 8-dic-2023 | https://x.com/Ejercito_Arg/status/1733251189506965730 |
| arg-2.jpg | Presentación en pantalla (no sirve para modelar) | Ídem | Ídem |

### La forma (primera lectura, antes de medir)

- **Cuerpo**: un cilindro blanco de unos 78 cm, algo más estrecho hacia la cola. Delante, una sección aparte (junta clara) que acaba en la **torreta de la cámara**: una cabeza redonda con dos ventanas pequeñas arriba y una grande abajo, y una barbilla con otra ventana debajo (c-ila-frente). Una varilla fina sale hacia abajo y adelante bajo el morro (c-ila-a: antena o sonda; comprobar en más fotos).
- **Alas delanteras**: cuatro, en X a 45°, nacen juntas a poco más de la mitad del cuerpo y giran sobre un pasador (los tornillos se ven en de-1). Rectas, de cuerda constante, punta redondeada, con un pliegue a lo largo cerca del borde de salida. Plegadas, van pegadas al cuerpo hacia atrás (hu-3, render).
- **Aletas traseras**: cuatro, en X, cortas y anchas, cerca de la cola, con la misma bisagra.
- **Hélice**: propulsora, de dos palas negras, detrás de la cola; las palas se pliegan (c-ila-a).
- **Marcas** del ejemplar elegido: logo «UVision» y «RHEINMETALL» con su rombo en el costado delantero; triángulo negro pequeño detrás; letras pequeñas en las alas (render).
- **Color**: blanco algo cálido; la torreta y el morro, del mismo blanco; ventanas negras con cristal.
- **Tubo** (lanzadera): verde oliva, con collarines grises de espuma, con muescas, en las dos puntas; la botella de aire comprimido, oliva, pegada detrás por un lado; cinta para colgarlo; flecha «LAUNCH DIRECTION»; bípode negro bajo el collarín delantero y la culata en el suelo (de-1, hu-1, hu-2, folleto). Las fotos de feria en negro (c-reise, c-rhk) son otra versión.

### Medidas de la maqueta (fase 3)

- Escala 0,3 m por unidad. Cuerpo de 8,2 cm y 0,78 m (render de planta a escala con el largo). Envergadura 0,79 m.
- **Cuerda del ala, 10 cm** (de 0,38 a 0,48 m desde la punta del morro), medida en la foto de la ILA con la cámara encajada y la superficie de la maqueta. El render de planta daba 13,6 cm: su cámara está a menos de 1 m y el ala, más cerca de ella que el cuerpo, sale más grande. **Las medidas del render no valen sin encajar su cámara.**
- Alas en molinillo: cada tabla, tangente al cuerpo (a la altura del radio), desde 0,8 radios al otro lado del eje hasta la punta; las cuatro, a 45° + 90°·k. El sentido del molinillo, del render de planta (el ala de arriba va del lado de la cámara).
- **Arriba y abajo**: con la cámara encajada en el render y en la foto de la ILA, «abajo» (bola de la cámara, joroba y varilla) cae a 90° del logo: el logo va en los costados, entre dos alas, y hay uno a cada lado (la ILA y el render enseñan costados distintos). La tapa en D y el asa, a 135° (arriba, del lado del ala de arriba a la derecha).
- Aletas: puntas a ~16,5 cm del eje (medidas en la foto de la ILA y en la de la feria checa con la z fija), cuerda 7 cm, de 0,655 a 0,725 m.
- Cola como en la ILA (cono suave hasta la lata negra del motor); el render nuevo tiene un tramo estrecho con las aletas, otra versión.
- Color: al sol en el lomo, foto de la ILA #e0e5e9, render #dde1e5 (pintura `blanco-h30` #d8e6f3).
- Lanzadera: el tubo húngaro (oliva, bloques de espuma, banda amarilla, dos anillos, correa, nivel, botella, bípode bajo el bloque de delante). Grueso 17 cm (foto de la feria checa junto a la boca); largo 1,12 m por las proporciones de las fotos checa y húngara (la ficha da 95 cm de contenedor). Inclinación 30° (de 23° en la feria checa a 35° en el folleto); la de la foto checa no se puede encajar porque el dron está girado sobre su eje.

## Registro

- 11-10-2026: nota escrita con fuentes cruzadas (folleto y web de UVision, Infodefensa, Defensa.com, Defense News, Defence24, Zona Militar, EDR, Army Technology, Army Recognition). La web de UVision da 403 a `fetch`: se leyó con Chrome; la animación es una secuencia de `.webp` que se bajó entera. X no deja buscar sin cuenta: los tuits salieron de Google (`site:x.com`) y se comprobaron con la API de syndication. No hay vídeos en X del Hero-30: los tres tuits de «En acción» son de fotos.
- 11-10-2026, fase 3: primera versión con medidas del render de planta; al encajar la foto de la ILA se vio que el ala era más estrecha (10 cm) y se corrigió. La cabeza se rehízo dos veces contra la foto de frente de la ILA (capota con cara plana y dos objetivos pequeños, bola debajo con el grande, joroba con dos ventanas que asoma bajo la bola). La lanzadera empezó como la de la feria checa (tubo negro con tres bandas y la pata a 40 cm) y se cambió por la húngara, que es la del ejército. Probado y descartado: encajar la foto de la feria alemana (de-1), demasiado cerca y con pocos puntos; medir el tubo lejos del dron en la foto checa (la perspectiva daba 1,46 m).
- Visto y sin hacer (fase 3): la etiqueta negra con letras amarillas del tubo húngaro y la flecha «LAUNCH DIRECTION»; las rayas y los textos de las alas del render. Hecho en la fase 6 (abajo).
- 11-10-2026, fase 6 (el usuario: copiar todo del render menos los logos; tubo de la feria checa; todos los pasos seguidos). Cámara del render de lado encajada en `hd/r084.json` (render-084.png, error < 3 px); el tubo, medido en `c-reise-1.jpg` girada 22° hasta dejarlo horizontal, a escala con 17 cm de grueso (`hd/tubo-r1.json`, encaje flojo: sirve solo de orientación).
  - **Puntas**: asimétricas (esquina redonda que sobresale del lado del borde de ataque, curva hacia dentro del de salida), 3 cm más allá de una junta de lado a lado. Primero salieron de 5,5 cm (contorno leído sin escala); medidas con la cuerda en f084, 3 cm.
  - **Cámara**: capota de medio cilindro (6,8 cm) con dos tornillos por lado; bola de 6,1 cm cortada por delante en una cara plana, inclinada 18° abajo, con el objetivo grande metido en ella; el pequeño, en la punta de la capota; la joroba sale del collarín con dos ventanas. Probado y descartado: tambor tumbado (no se parecía), objetivo como cilindro que sobresale y lámina bajo la bola (desde abajo era una caja que no está en f116).
  - **Varilla**: L corta y blanca bajo el cuerpo, detrás del collarín (cuadra encima del render).
  - **Cola**: tras una junta a 0,638 m, tramo de 3,4 cm de radio con las aletas (adelantadas 3 cm, con una muesca de 1,2 cm en la raíz y la bisagra en ella), cono corto, cilindro de 2,3 cm hasta el aro de metal del motor, buje con dos horquillas y palas de remo de 15,3 cm de radio casi en vertical. El motor de la ILA es una lata negra; el del render, metal: va el del render.
  - **Detalles**: juntas a lo largo de cada ala y de cada aleta y la de la punta; las rayas, «Autonomous / Technology» (en espejo, como sale en el render) y «Munition System» van ala por ala, solo donde se ven en el render (f084 y f078); tornillos en la punta, la tapa en D, el tramo de las aletas y el collarín; ranura y agujero bajo el cuerpo; cierres de metal en dos alas. Probado y descartado: raíz del ala hasta 1,12 radios (choca con la tabla del ala de al lado; se queda en 0,9) y las rayas en las cuatro alas (en el render, el ala de atrás no las lleva).
  - **Tubo**: 1,07 m, negro verdoso; bloque de delante de 12 cm a ras de la boca; el de detrás con pie y resalte; tres bandas con cierres; botella de 6 cm a un costado; correa con su mando; bípode a 33 cm de la boca con puntas de metal; «DIRECTION OF LAUNCH» e «IMPORTANT / POSITION ON FLAT GROUND» en blanco. Inclinación 24°, la de la foto. Los textos salieron primero de través y luego boca abajo (orientación de la calca); corregidos.
- 11-10-2026, fase 6, segunda vuelta (apuntes del usuario): la muesca de las aletas va en el borde de salida, no en el de ataque; los textos del tubo, más arriba (a 50° y 40°), «IMPORTANT» sin pisar la banda y repetidos en el otro costado; la boca del tubo vuelve a verse (el borde asoma 4 mm del bloque y el hueco va delante); más contraste en el tubo (tubo `#3d3e33`, espuma `#4a4a4d`, juntas claras en los bordes de las bandas y a la entrada de los bloques) y juntas del dron más marcadas (`opacidad.juntas` 0,5).
- 11-10-2026, tras las fases 4 y 5: la flecha «DIRECTION OF LAUNCH» del otro costado apuntaba a la culata (la calca en espejo da la vuelta al dibujo entero); ahora va una aparte con `izquierda` (la flecha al revés y el texto al derecho). Tarjeta rehecha con el ángulo de la captura del usuario.
