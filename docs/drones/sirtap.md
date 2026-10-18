# SIRTAP (Airbus) — diario

## Dónde estamos: cerrado (18-10-2026)

- Fases 1-5 hechas y nota importada; ficha, visor (maqueta, pixel, noche, partes, fuentes) y tarjeta de `/uas` comprobados en local, sin errores en consola. `astro check` sin errores.
- Fase 6 (revisión) saltada a petición del usuario: se cierra con las dos revisiones de la fase 3 y la revisión del pixel de la fase 4.
- Commit y push de la bóveda y de la web pedidos por el usuario el 18-10-2026.
- Queda: nave del hero, solo si la pide. Archivo `undefined` de la raíz (PNG suelto): no se commitea; borrarlo si el usuario quiere.
- `npm run lint` da un error que ya estaba en `HEAD`: `VisorUAS.astro:240` (`querySelector<…>(…)!.dataset` no lo entiende el extractor). Sin tocar; pendiente de que el usuario diga.
- Capturas: `~/Downloads/sirtap-fase5/`.

## Lo visto en el prototipo (fase 3)

- Sin pilones bajo el ala (la maqueta de Japón lleva 4); hélice de **tres** palas blancas con una franja negra cerca de la punta; aleta ventral **negra**; tren fijo con patas hacia fuera y brazo corto hacia atrás.
- Radomo negro con una capucha que sigue por el lomo hasta z 2,25; cámara pequeña encima del radomo; torreta naranja (en el vídeo del pintado sale amarilla); toma de aire partida en dos en el lomo, delante de la V; la V nace en lo alto de los costados de la góndola.
- Marcas: «AIRBUS» y «SIRTAP001» en los dos costados, «III» bajo la V, triángulo blanco hacia el morro (solo visto en el izquierdo), franja roja alrededor de la góndola.

## Decisiones del usuario

- 18-10-2026: dron elegido, el **SIRTAP** de Airbus (España).
- 18-10-2026: avión de las marcas = el **prototipo** (único que hay). Carga = **torreta EO/IR y radar**, sin armas.
- 18-10-2026 (revisión 2): de las líneas verdes del perfil, solo la cola y la aleta de debajo; lo demás (la panza de la góndola) estaba bien.
- 18-10-2026 (revisión 2): fuera la tapa de registro pintada de los costados del morro y los tornillos blancos de la junta del radomo; se quedan las asas. La toma del lomo es una sola abertura cuadrada y hundida, partida en dos.
- 18-10-2026 (fase 3): fuentes = fotogramas de los dos vídeos de @AirbusDefence (pintado y rodaje), bajados con su permiso. La maqueta de Japón no se usa (no tiene tren, lleva 4 pilones que el prototipo no tiene).

## Medidas clave

En metros de la maqueta: y = 0 a media altura del fuselaje, z = 0 a mitad de la cuerda del ala; la maqueta va en espejo (ala izquierda real = x positiva).

- Largo 7,3 m del morro (z 3,824) a la punta del cono (z −3,49), el ancla de la escala (Ministerio). Alto hasta la punta de la V: 2,3 m (el Ministerio da 2,2).
- Envergadura 11 m (Ministerio; el encaje da 10,8-11,2 según la lente del montaje). Ala alta en y 0,16, punta 0,1 m más baja. Cuerda: raíz z 0,58 a −0,59; punta z 0,03 a −0,37.
- Cola en V a 28°, raíz y 0,224 en x 0, puntas en (±2,0; 1,29; −2,40). Raíz z −2,03 a −2,86, punta −2,29 a −2,54.
- Suelo y −1,0. Rueda del morro z 2,09; principales en x ±0,77, z −0,55; ruedas de r 0,127.
- Góndola: cara de atrás z −3,16, de y −0,045 a 0,46; hélice de 3 palas, r 0,76, en z −3,22, eje y 0,33.
- Panza (perfil del rodaje, medir.mjs): −0,245 en z 0,5; −0,256 de −1 a −1,45; −0,232 en −2,2; −0,18 en −2,86; −0,045 en la cara de atrás. Medio ancho del fuselaje 0,30 en el centro y 0,287 en la góndola (más cuadrado: n 3 arriba, 3,4 abajo). Cara de atrás de 0,544 m de ancho; boca del motor de y 0,05 a 0,445 y 0,5 m de ancho.
- Marcas (perfil): «AIRBUS» de 0,74 × 0,13 m (alto de letra) centrado en z 0,84, y −0,04; «SIRTAP001» de 1,01 m y letra de 0,157, en z −1,75, y −0,04; «III» de 0,11 en z −2,48, y 0,19; franja roja de 0,028 en z −3,04.
- Torreta naranja en z 2,52, r 0,2, fondo en y −0,58. Aleta ventral negra (perfil medido): delante z −1,38, detrás −1,63 en la raíz y −1,56 abajo, fondo y −0,635. Toma del lomo: boca z −2,0, 0,34 m de ancho, 10 cm de honda, rampa desde z −1,6.
- Cola (perfil, sobre las líneas verdes del usuario; d = distancia por la superficie desde la raíz): borde de ataque z −2,08 en la raíz y −2,26 en la punta; borde de salida −2,99 (d 0), −2,953 (0,42), −2,872 (0,906), −2,788 (1,65), −2,745 (2,0) y esquina redonda hasta −2,66 en la punta.
- Lo negro del costado: abajo en y 0,17, hasta z 2,34; sube con la esquina redonda hasta z 2,28.
- Boca del motor (primer plano enderezado 29°): borde de arriba recto en y 0,43 (±0,2), lados a ±0,245, fondo redondo en y 0,03. Soportes a ±0,19 en y 0,33. Raya roja: recta a z −3,045 (perfil), da la vuelta entera a la góndola, también por encima.
- Cámaras encajadas: `arte/uas-fuentes/sirtap/hd/*.cam.json` (perfil acercada a 150 m: el visor no ve tan lejos). Errores: perfil y vistas del rodaje < 10 px; montaje 10-25 px de 6000.
- Color: costado al 88 % de la pared blanca en el vídeo del pintado (#97a0a2 / #abb1b2). El vídeo del rodaje va etalonado (azulado): no vale para medir color.

## Fuentes

Fotos (también en `arte/uas-fuentes/sirtap/FUENTES.md`):

| Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| maqueta-perfil-izq, -tres-cuartos-izq-01/02, -tres-cuartos-der, -trasera-izq | Maqueta a escala en JGSDF Camp Akeno (22-11-2025) | Hunini, CC BY-SA 4.0 | Commons, Category:Airbus Sirtap (bajadas a 3840 px) |
| airbus-montaje-03 | Prototipo real en montaje, 6000x4000 | Airbus Defence and Space, uso editorial | mediaassets.airbus.com/pm_38_720_720378-sl0mfj6h5g.jpg?fileName=first-sirtap-assembly-03.jpg |

| video/rodaje.mp4, video/pintado.mp4 | Vídeos del rodaje (15-06-2026) y del pintado (04-09-2025); fotogramas en video/fotogramas/ | Airbus Defence and Space, uso editorial | x.com/AirbusDefence/status/2066493295467876448 y /1963583414931489020 (bajados con yt-dlp, formato http-2176) |

Las de la nota (`## Fuentes`). Tuits de «En acción», los dos de @AirbusDefence con vídeo: prototipo pintado (04-09-2025) y primer rodaje en Getafe (15-06-2026). No se encontró ninguno más del SIRTAP.

## Probado y descartado
- Cola con la punta hasta z −2,78 (contando la franja clara del perfil, que es la otra superficie): «muy gorda». Y antes, con la punta de 0,25 m: «muy fina».
- Raya roja que dobla hacia atrás por el canto («L»): el perfil la da recta; lo que se ve desde atrás es el tramo de debajo.
- Cono blanco detrás de la hélice: en los primeros planos del rodaje no hay; va el buje de metal con el plato blanco.
- Zona negra en diagonal (como se leía en la foto del montaje, sin pintar): el perfil del rodaje y el vídeo del pintado la dan recta, encima de la tapa.

- Distorsión de lente en la foto del montaje (k1): sale inestable (de −0,08 a +0,11) y cambia la envergadura; se deja sin ella.
- Agrandar la góndola para cuadrar la vista trasera cercana: empeora el perfil; la diferencia es de perspectiva de esa cámara.
- Rendijas entre el ala y los mandos (6 mm en la bisagra, 4 cm entre flap y alerón): en el pixel salían como raya negra.

## Registro

- 18-10-2026, fase 1: nota escrita con Airbus, Revista Española de Defensa, Infodefensa, Naval News, Airforce Technology, Aviacionline, El Español, UAS Vision y Army Recognition. No se encontró el modelo del motor ni ninguna noticia del primer vuelo hasta octubre de 2026.
- 18-10-2026, fase 2: buscadas fotos en Commons, Airbus y Aviationist. Commons solo tiene la maqueta; del real, solo la foto de montaje de Airbus (14 MB). Bajadas con permiso del usuario.
- 18-10-2026, fase 3: bajados los dos vídeos de Airbus y sacados fotogramas. Encaje conjunto (script propio `hd/conjunto.mjs`, Levenberg-Marquardt) de seis cámaras con los puntos que se ven en varias. Maqueta completa con marcas; ampliado el motor para tomas sin ensanche. Capturas en `~/Downloads/sirtap-fase3/`.

- 18-10-2026, revisión 1 del usuario (cuerpo, zona negra, cola, motor, tipografía, tren, hélice, torreta): todo medido de nuevo en el perfil del rodaje (`hd/perfil150.cam.json`, la cámara del perfil acercada a 150 m), en el vídeo del pintado (morro de costado, `pintado-17.5`) y en los primeros planos del rodaje (`rodaje-3.5` motor, `r-4.6` letras, `rodaje-46.5` logo). Página: `~/Downloads/sirtap-fase3/revision-1.html`.
- 18-10-2026, revisión 2 del usuario (logos, morro, perfil, boca del motor, raya roja, toma): logo vectorizado con potrace de `rodaje-46.5`; cola, aleta y lo negro medidos con `medir.mjs` en el perfil; boca, de `rodaje-3.5` enderezado; raya, de `r-7.6`; toma, de la foto del montaje. Página: `~/Downloads/sirtap-fase3/revision-2.html`.
- 18-10-2026, fase 4: luz medida (sin desfase); mandos metidos en el ala para quitar las rayas negras del pixel; `vistaTarjeta` [61, 20]; tarjeta y planta regeneradas; capturas en `~/Downloads/sirtap-fase4/pixel.html`.
- 18-10-2026, fase 5: `npm run importar` (SIRTAP cambiada, 2 tuits nuevos); probado en `/uas/sirtap` y `/uas`; cierre.
