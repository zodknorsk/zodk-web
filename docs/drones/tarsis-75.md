# TARSIS 75 (AERTEC, hoy Indra) — diario

## Dónde estamos: fase 3, primera revisión del usuario corregida (19-10-2026)

- **Maqueta HD**: `src/data/uas/tarsis-75.ts` (sin commitear), con los acabados `blanco-ta`, `gris-ta`, `gris-ta2` y `lente-ta` en `tipos.ts`, `uas-hd.ts`, `uas-paletas.ts` y `visor-uas.ts`, y los logos nuevos «aertec» y «tarsis» en `src/data/uas/logos.ts` (también sin commitear). Partes A-G y fuentes con miniaturas en `public/uas/tarsis-75/fuentes/`.
- Hechas las correcciones de la primera revisión (capturas marcadas en `arte/uas-fuentes/tarsis-75/usuario-r1…r4-*.webp`): mejillas, motor, boquete de la torreta, panza plana con aristas, logos, cola, tren y flaps. Comparativas en `arte/uas-fuentes/tarsis-75/comparativas-revision.html` (fuera de Git; copia en `~/Downloads/tarsis-75/`).
- **Ficha provisional solo para ver el visor en local**: `src/content/uas/tarsis-75/index.md`. **No se commitea**: la sustituye el importador en la fase 5.
- Siguiente: que el usuario mire la maqueta (`localhost:4321/uas/tarsis-75`, `npm run dev` en marcha) y diga si queda algo; después, fase 4 (pixel HD), en otra sesión cuando él diga.
- Sin commitear: todo lo de arriba, este diario y el del W. Nota de la bóveda en borrador, sin commitear.
- **Wing Loong II fuera de `main`**: rama `wing-loong-ii` (subida); en `main` el commit `2c2df51` lo deshace (sin push). Si `npm run importar` trae `src/content/uas/wing-loong-ii/`, descartar esa carpeta antes de commitear.

## Decisiones del usuario

- 19-10-2026: dron = **TARSIS 75** (no el 25). Nombre y slug «TARSIS 75» / `tarsis-75`.
- 19-10-2026: el Wing Loong II no se publica: rama `wing-loong-ii`, revert en `main`.
- 19-10-2026: se hacen **dos drones**, el TARSIS 75 y el TARSIS-W (`tarsis-w`), cada uno con su nota. El TARSIS VTOL va en la Historia de la nota del W, como su hermano; la del 75 cuenta sus versiones.
- 19-10-2026: los PDF del fabricante se bajan, se leen y se borran.
- 19-10-2026: criba de fotos (borradas 8, 11, 12, 17, 19, 20, 33, 34, 35, 36, 38, 40; la 18 y la 24 son del W). **La maqueta, del modelo blanco (TARSIS-ISTAR)**: tiene las mejores fotos, sobre todo en vuelo.
- 19-10-2026: **carga = la torreta EO/IR bajo el morro** (fotos 21 y 22).
- 19-10-2026, fase 3: lo que más cuenta, con sus capturas marcadas (`arte/uas-fuentes/tarsis-75/usuario-*.webp`): **el morro con su forma** (22), **la torreta copiada al detalle** (22) y **la cola del fuselaje con el motor dentro** (31). Para la forma, sobre todo las fotos 27, 28, 29, 30 y 23.

## Medidas clave

- Envergadura 5,2 m, longitud 3,8 m, altura 0,96 m con el tren, 74,5 kg de MTOW (folleto de AERTEC). Fibra de carbono, hélice propulsora, motor de dos tiempos de 100 cm³.
- Ojo: el TARSIS-ISTAR (evolución, 95 kg) tiene las mismas medidas; el TARSIS-W (armado) es más grande: 6,2 m y 4,3 m. Al buscar fotos, distinguir el 75/ISTAR del W.
- **Ejes de la maqueta** (metros): y = 0 a media altura del fuselaje, z = 0 a mitad de la cuerda del ala; x+ = ala izquierda de verdad. La 22, 21 y 29 enseñan el costado izquierdo (x+); la 23 y la 30, el derecho (x−). La 31 es tres cuartos por detrás e izquierda.
- **Fuselaje**: punta del morro en z = 1,67 (y = 0,025), cola en z = −0,90; 0,37 m de ancho y 0,34 de alto, lomo +0,17, panza −0,17. Morro (perfil medido en la 30): la panza sube deprisa a la punta y el lomo cae en curva; arista entre lomo y costado desde la punta hasta 0,43 m. **Junta del morro a 0,58 m de la punta** en el ISTAR de la torreta grande (22, 21: la pata del morro queda delante de la junta); en los de la torreta pequeña (23, 30), a 0,43.
- **Sección del cuerpo**: costado recto hasta y = −0,05; debajo, una cara inclinada y la panza plana (62 % del medio ancho), con dos aristas que nacen en la torreta (21, 22); la barbilla, redonda y sin aristas.
- **Carenado del motor**: mejillas desde z = −0,555 hasta la cola, medio ancho 0,25, reborde a y = 0,13, bajan hasta y = −0,07 delante y −0,10 detrás; de ahí, una cara inclinada a la panza (31, 39). Escapes a x = ±0,10 (39).
- **Boquete de la torreta**: de d = 0,115 a 0,335 desde la punta; detrás de la torreta sube por el costado unos 14 cm de piel desde el centro de la panza (22). Boca abierta con el motor dentro, hélice de 0,66 m en z = −0,935, a media altura.
- **Ala**: cuerda 0,42 (z de 0,21 a −0,21), y = −0,03, sin diedro, 5,22 m. Flap de 0,19 a 0,735, cuerda 0,16 (bajado en 30, 31, 32); alerón de 0,75 a 1,97, cuerda 0,09; tramo fijo hasta la punta (planta 27).
- **Botalones** a x = ±0,658, centro y = −0,105, 6 cm de lado, de z = 0,22 a −2,16. **Derivas**: base y = −0,075, 0,49 de alto, cuerda 0,44 abajo y 0,26 arriba, borde de salida en z = −2,20. Estabilizador en y = 0,10, de z = −1,83 a −2,07.
- **Tren**: suelo en y = −0,645 (más alto que el del plano del TARSIS 75). Ruedas principales de 0,2 m a x = ±0,435, z = −0,15, en patas de 0,18 m de ancho arriba y 0,11 abajo (30); la del morro, 0,15 m, eje en z = 1,20, pata de metal de 2 cm con amortiguador detrás, collar a y = −0,45 y brazo de dos chapas (30, 21).
- **Cola, por debajo del botalón**: timón de 0,12 con la punta negra hasta y = −0,175; patín negro de z = −1,925 a −2,07, hasta y = −0,21; aleta blanca delante, hasta z = −1,66 (30).
- **Torreta** (22): centro z = 1,48, de y = −0,085 (aro fijo) a −0,236; cuerpo 0,11 de ancho y 0,125 de largo, tapas a ±0,06, ventana de 0,072 m.
- **Logos** (30, 28): «TΛRSIS» del costado, 0,49 m de largo y 10 cm de alto; en el ala, 14 cm de alto y el «75» detrás; la «A» de AERTEC, 0,134 × 0,12 m. Dibujos en `logos.ts`: la «A», el SVG de aertecsolutions.com; «TΛRSIS», Avenir Next Demi Bold con la «A» a 0,8 de ancho (no hay archivo oficial), casado con la 30.
- **Color y marcas del blanco**: blanco (al aire libre, 23 y 28; en la feria, 21, parece beige por la luz). «TARSIS» y la «A» en gris oscuro a los lados del fuselaje (23, 25, 29, 30), «TΛRSIS75» en el extradós de las alas, cerca de las puntas, con el «75» gris claro (27, 28), la «A» encima del fuselaje (27). En las derivas no hay «A»: una tapita con una raya oscura (29, 30). Luces de navegación junto a la raíz del ala, roja a la izquierda y verde a la derecha (29, 30). Hélice negra (23, 30; la amarilla de la 31 es de la cadena de montaje).

## Fuentes

Tabla copiada de `arte/uas-fuentes/tarsis-75/FUENTES.md` (URL sin `https://`; las de AERTEC salen de la API `wp-json/wp/v2/media?search=tarsis`).

| N.º | Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|---|
| 1 | full/01-tarsis75-perfil-pista.jpg | Perfil izquierdo en pista, de cerca (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/tarsis75master.jpg |
| 2 | full/02-tarsis75-tres-cuartos-suelo.jpg | Tres cuartos delantero derecho, en el suelo (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/TARSIS75-102.jpg |
| 3 | full/03-tarsis75-pista-bajo.jpg | Tres cuartos trasero izquierdo, cámara baja, en pista (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/AERTECsolutions-RPAS-004-2.jpg |
| 4 | full/04-tarsis75-ceus-perfil.jpg | Perfil derecho con un operario (escala) (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-AERTEC-News-CEUS-TARSIS-001.jpg |
| 5 | full/05-tarsis75-campo.jpg | En un campo, tres cuartos (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/cabecera-587.jpg |
| 6 | full/06-tarsis75-frente-hangar.jpg | De frente, junto a un hangar (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/cabecera-395.jpg |
| 7 | full/07-tarsis75-rapaz-carpa.jpg | Con el equipo bajo la carpa (programa RAPAZ), desde arriba (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-noticia-Rapaz.jpg |
| 9 | full/09-tarsis25-y-75.jpg | TARSIS 25 delante; el 75 detrás (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/TARSIS-25-75-002.jpg |
| 10 | full/10-tarsis75-feria-homsec.jpg | En feria (Homsec), perfil y rótulo (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-homsec-003.jpg |
| 13 | full/13-tarsis75-feria-feindef.jpg | En feria (FEINDEF), de lado (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-comunicado-AERTEC-FEINDEF-001.jpg |
| 14 | full/14-tarsis75-vuelo-frente.jpg | En vuelo, de frente, sobre nubes (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-100km-300m.jpg |
| 15 | full/15-tarsis75-vuelo-nubes.jpg | En vuelo, de lado, bajo nubes (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Tarsis-202.jpg |
| 16 | full/16-tarsis75-vuelo-playa-arriba.jpg | En vuelo sobre la playa, desde arriba (1024×383) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-RPAS-Huelva-002.jpg |
| 21 | full/21-istar-feria-gimbal.jpg | En feria (FEINDEF), tres cuartos con la torreta bajo el morro (1200×495) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Landing-FEINDEF-header-001.jpg |
| 22 | full/22-istar-morro-gimbal.jpg | Morro de cerca con la torreta (designación láser) (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-AERTEC-UAS-Laser-designation-001.jpg |
| 23 | full/23-istar-pista-frente.jpg | En pista, tres cuartos delantero (1600 px) (1600×700) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/02/cabecera-726.jpg |
| 25 | full/25-istar-pista-gente.jpg | En pista con el equipo (U-ELCOME), escala (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2024/10/20241106-UELCOME-100-header.jpg |
| 26 | full/26-istar-dos-con-ejercito.jpg | Dos en el suelo con vehículos del Ejército (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/Header-TARSIS-ET.jpg |
| 27 | full/27-istar-planta-costa.jpg | Planta: desde arriba en vuelo sobre la costa (1200×674) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/TARSIS-2024-005-LT.jpg |
| 28 | full/28-istar-vuelo-arriba.jpg | En vuelo, tres cuartos desde arriba (1200×599) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/07/TARSIS-204-Header.jpg |
| 29 | full/29-istar-vuelo-bajo.jpg | En vuelo bajo, de lado (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/TARSIS-2024-204-headerweb.jpg |
| 30 | full/30-istar-despegue-atlas.jpg | Despegando delante de la torre del Centro ATLAS (2400 px) (2400×1212) | AntonioTote, CC BY-SA 4.0 | commons.wikimedia.org/wiki/File:AERTEC-TARSIS-CentroATLAS-20230330-004.jpg |
| 31 | full/31-istar-montaje-trasera.jpg | En la cadena de montaje, tres cuartos trasero con la hélice (1024×683) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/06/AERTEC-FAL-TARSIS-203-LT.jpg |
| 32 | full/32-istar-montaje-frente.jpg | En la cadena de montaje, tres cuartos delantero (1200×450) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/03/AERTEC-FAL-ComunicadoNuevaEmpresa-005-header.jpg |
| 37 | full/37-video5g-36s.jpg | Vídeo 5G, 0:36: morro, torreta y cámara 4K (1920×1080) | AERTEC (YouTube), uso editorial | youtube.com/watch?v=jvHfhx5I7po |
| 39 | full/39-video5g-250s.jpg | Vídeo 5G, 4:10: de detrás en vuelo, de cerca: motor, botalones y tren (1920×1080) | AERTEC (YouTube), uso editorial | youtube.com/watch?v=jvHfhx5I7po |
| 41 | full/41-folleto-tarsis75-tres-vistas.png | Folleto TARSIS 75, pág. 2: tres vistas con cotas y ficha (1241×1754) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/05/tarsis75.pdf |
| 42 | full/42-folleto-tarsis75-portada.png | Folleto TARSIS 75, pág. 1 (1241×1754) | AERTEC, uso editorial (referencia) | aertecsolutions.com/wp-content/uploads/2025/05/tarsis75.pdf |

Vídeos en video/ (jvHfhx5I7po.mp4 «Surveillance of rural areas with 5G and UAS TARSIS», 4:45; 6M2dLYKjCXI.mp4 «Proyecto VIGIA», 3:53; 1080p, AERTEC). Folletos (TARSIS 75, ISTAR y W, en aertecsolutions.com/wp-content/uploads/2025/05/): leídos y borrados; de ellos quedan solo las páginas 41 y 42.

Criba del usuario (19-10-2026): borradas la 8, 11, 12, 17, 19, 20, 33, 34, 35, 36, 38 y 40; la 18 y la 24 son del TARSIS-W y se pasaron a ../tarsis-w/full/. Los números no se cambian. Fuera desde el principio: las rotuladas «TARSIS-W» y las del TARSIS 25. Las fotos de AERTEC se bajaron con la API de su web (wp-json/wp/v2/media y posts, búsqueda «tarsis»); casi todas son cabeceras de 1024-1200 px.

## Probado y descartado

- Encajar la cámara de la 22 (y de otras cabeceras de AERTEC de cerca): recortadas, sin el centro óptico; da campos de 1,5° o 70°. Se compara a ojo desde un ángulo parecido.
- La torreta saliendo directa del fuselaje (sin boquete) y la media luna pintada detrás: el usuario quiere ver que cuelga de un hueco.
- Rótulos con letra de sistema estrecha: «TΛRSIS» va con su logo.
- Medidas de alto del plano de tres vistas del TARSIS 75 tal cual: el ISTAR tiene el tren más alto y la cola algo más atrás (encajes de la 23 y la 30).

## Registro

- 19-10-2026, fase 1: nota con fuentes de Infodefensa, sUAS News, Airforce Technology, Hispaviación, El Español y EspacioAereo. El motor no se publica en ninguna. Las cifras de sUAS News de 2017 (7,5 m, 110 h) son erratas: no se usan.
- 19-10-2026, fase 2: fotos de la mediateca de AERTEC (API de WordPress), una de Commons, fotogramas de dos vídeos de AERTEC en YouTube y el folleto. Página de candidatas hecha; esperando la criba del usuario.
- 19-10-2026, fase 2 (sigue): el usuario decide hacer también el TARSIS-W. Nota del W escrita y la del 75 retocada con los folletos (motor, autonomía 8/14 h, techo 5.500 m) y prensa de 2026 (Euronews, Indra, Escudo Digital). PDF borrados.
- 19-10-2026, fase 2: criba del usuario hecha, marcas del modelo blanco, forma leída de una hoja de contactos de las fotos blancas.
- 19-10-2026, fase 2 cerrada: carga elegida (torreta EO/IR).
- 19-10-2026, fase 3: maqueta HD completa (cuerpo de contorno con la arista del morro y las mejillas, torreta de la 22, motor dentro de la boca, ala, botalones, cola en H, tren, antenas, marcas, partes y fuentes). Encajes de la 23 y la 30; comparativas en `comparativas-maqueta.html`.
- 19-10-2026, fase 3, revisión del usuario: mejillas más anchas y cerradas por abajo, escapes que salen por la panza, motor con volante de radios, plato y pipas; torreta en un boquete (piel oscura 4 mm por fuera que sube por el costado), aro fijo negro y parte que gira más clara; barbilla redonda y panza plana con dos aristas; logos de verdad («A» de la web de AERTEC y «TΛRSIS» calcado), más grandes en el ala; cola con timón, patín y aleta de debajo; patas anchas y pata del morro de metal con amortiguador; flap de 16 cm hasta 0,735 y alerón de 0,75 a 1,97 (planta). El encaje de la 30 que vale es `30c` (la 30b acercada con `acercar.py` a 60 m).
- 19-10-2026, fase 3, segunda revisión del usuario (sin medir de nuevo: la maqueta vale): panza del morro más alta, subiendo recta a la punta, con la torreta 3 cm más arriba y el boquete del tamaño de la torreta; motor con el lomo bajando hacia la boca y las mejillas como caja aparte (frente redondo, reborde 7 cm bajo el lomo, recorte abajo al final); «TΛRSIS» calcado de la 30 con potrace (fuera la Avenir); cola sin aleta bajo el botalón, con el patín negro envolviendo su final y la punta del timón hasta él; ala con un solo mando de 9 cm de la raíz a la punta, sin juntas a lo ancho. Capturas en `~/Downloads/tarsis-75/r2/`.
- 19-10-2026, fase 3, tercera revisión: carenado del motor como pieza aparte (`capo`), con el lomo recto, mejilla corta (de y 0,09 a −0,05), costado hasta casi la panza con recorte atrás y **abierto por debajo** (forro negro y pared delante); cola de una pieza, sin patín: el botalón llega al borde de salida y solo sus últimos 8 cm son negros; flap bajado 15° hasta 0,75 y alerón de ahí a la punta, con la bisagra a la misma cuerda; torreta 5 cm más arriba que al principio, metida en el boquete; la aleta de la panza, adelantada al final del cuerpo. Capturas en `~/Downloads/tarsis-75/r3/`.
- 19-10-2026, fase 3, cuarta revisión: carenado unido al cuerpo (sin la junta pintada; por debajo de la mejilla sigue el mismo costado y la misma cara inclinada del cuerpo, abierto en el centro); el costado del cuerpo, de una tira hasta la cara inclinada y sin la arista de arriba de esa cara (c = 0) para que no parezca de dos colores. Capturas en `~/Downloads/tarsis-75/r4/`.
- 19-10-2026, fase 3, quinta revisión: el carenado empieza justo donde acaba el cuerpo, con su misma sección, y la maqueta lleva `soldadura` (5 cm) para que no salga raya en la unión; tapas blancas atrás en los dos laterales del carenado (`capo-tapa`), para que desde atrás no se vea hueco. Capturas en `~/Downloads/tarsis-75/r5/`.
- 19-10-2026, fase 3: la raya de la unión cuerpo-carenado venía de la tapa de delante del carenado, que compartía vértices con el borde y caía justo en la unión. Arreglo: `tapaPlana` y la primera sección del carenado 1 cm metida en el cuerpo (encogida al 99,5 %). Captura en `~/Downloads/tarsis-75/r6/`.
