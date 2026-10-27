# FP-1 — diario

## Dónde estamos

- **Fase 1 (la nota)**: sin hacer. No hay nota del FP-1 en la bóveda.
- **Fases 2, 3 y 4 hechas** el 27-10-2026 en una sola sesión (lo pidió el usuario), en la rama `claude/nuevodron-fases-2-3-4-ub8zqn` del repo, a falta de que el usuario las vea: fotos en `arte/uas-fuentes/fp-1/` (fuera de Git), maqueta HD en `src/data/uas/fp-1.ts` con rampa y cohete, acabados nuevos `gris-fp` y `madera-fp`, miniaturas de fuentes, tarjeta y planta en `public/uas/fp-1/`.
- **Ficha provisional, sin commitear**: `src/content/uas/fp-1/index.md` (solo para ver el visor en local; fuera de Git, se borra cuando se importe la nota de verdad).
- **Falta**: la nota (fase 1), luego importarla en `main` y probar (fase 5), y la revisión del usuario (fase 6).
- **Siguiente paso**: que el usuario mire el visor y las comparaciones; después, la nota.

## Decisiones del usuario

- 27-10-2026: versión de **serie actual** (ala recta, sin placas en las puntas).
- 27-10-2026: color y marcas del **ejemplar gris de Kiev** (mayo de 2025).
- 27-10-2026: **sin carga a la vista** (la ojiva va dentro).
- 27-10-2026: **con la rampa** y el cohete de despegue (botón «Rampa»).

## Medidas clave

En metros de la maqueta; y = 0 en la panza del ala, z = 0 cerca del centro del ala.

- Envergadura 6 m (Fire Point). Lo demás, encajando la cámara en el render de Fire Point de la ficha de Fakty (9 puntos, error de 1 a 6 px; `hd/render.json`) y en la foto de Kiev (6 puntos, 1-16 px; `hd/kiev.json`). La foto de Kiev está hecha **desde la derecha** del dron (ala cercana = x negativa).
- Ala: cuerda constante de 0,6 m (borde de ataque 0,25, de salida −0,35), grueso 9 cm, sin diedro, punta recta. Alerones de 1,55 a 2,82 m.
- **El ala del ejemplar de Kiev está expuesta sin sus tramos de fuera**: acaba a 2 m del centro (el encaje lo da con ese valor) en una cara plana con los agujeros de dos largueros.
- Cuerpo: 1,9 m (morro en z = 1,3, cola en −0,6), 0,48 de ancho, 0,38 de alto; punta del morro a media altura; junta de la tapa del morro en z = 0,75. Lomo de 0,33 de ancho que sube 10 cm delante del ala.
- Vigas a ±0,68, de z = 0,2 a −2,02. Cola en V invertida: vértice 0,32 sobre el ala, pies a ±1 m y 0,2 por debajo; cuerda de 0,36 (−1,7 a −2,06).
- Motor en z = −0,71, hélice de 1,1 m en z = −0,85, a y = −0,17. Silenciadores sobre el centro del ala, de z = 0,1 a −0,5.
- Rampa: inclinación 18° (aproximada), raíles a y = −0,8 (la hélice pasa 8 cm por encima). Cohete inclinado unos 35°.
- Color: albedo `gris-fp` #8a8f93. Pixel: gris al sol con luminosidad 0,73-0,76 en el HD → `desfaseLuz` 0,3.
- Marcas (costado derecho, colocadas con la cámara de Kiev): etiqueta «ЗАКРІПИТИ» (y −0,02, z 0,34), aviso amarillo (−0,14, 0,32), «ЖИВЛЕННЯ» (−0,18, 0,32); etiqueta vertical del arranque en z −0,33 (de la foto de detrás, posición aproximada).

## Fuentes

Fotos en `arte/uas-fuentes/fp-1/full/` (fuera de Git), bajadas el 27-10-2026. Medidas: envergadura de Fire Point (Fakty, Defender Media).

| Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| kyiv2025-34-delante.jpg | **Ejemplar de las marcas.** Tres cuartos por delante, a la altura del ala: morro, costado, ala izquierda entera con su punta, vigas, cola en V invertida, escapes (2048×1152) | Mezha Media / RBC-Ukraine vía Militarnyi, sin licencia libre | https://militarnyi.com/wp-content/uploads/2025/05/19201080252-ezgif.com-jpg-to-webp-converter-1.webp |
| kyiv2025-motor-cohete.jpg | Mismo ejemplar, de detrás y desde abajo: motor bóxer de dos cilindros, hélice de dos palas de madera, escapes, cohete de despegue bajo la cola con sus varillas, etiquetas del costado (2048×1152) | Mezha Media / RBC-Ukraine vía Militarnyi, sin licencia libre | https://militarnyi.com/wp-content/uploads/2025/05/495043252_1796660947561573_7262151720599952032_n-ezgif.com-jpg-to-webp-converter.webp |
| fabrica-34-arriba.jpg | En fábrica, de tres cuartos por delante y desde arriba: morro, tapa del morro, carenado del ala, abrazaderas de las vigas, ala derecha (1366×768) | Visita de AP a la fábrica, vía UNITED24 Media, sin licencia libre | https://storage.united24media.com/thumbs/x/4/8a/f4bbe2cdfa76716dd04077aaf05988a4.png |
| hisutton-Ukraine-OWA-UAV-FP-1-rockets.jpg | En taller, desde arriba por detrás: lomo, ala, vigas (variante con cohetes S-5: solo para la forma) (940×410) | H I Sutton (Covert Shores), sin licencia libre | https://www.hisutton.com/images/Ukraine-OWA-UAV-FP-1-rockets.jpg |
| hisutton-Ukraine-OWA-UAV-FP-1-production.jpg | Fuselajes en la cadena, de lado: forma del cuerpo y del morro (940×605) | H I Sutton (de una foto de fábrica), sin licencia libre | https://www.hisutton.com/images/Ukraine-OWA-UAV-FP-1-production.jpg |
| hisutton-Ukraine-OAW-UAV-FP1_Cutaway.jpg | Dibujo en corte con las piezas nombradas. **Ilustración**: solo para confirmar piezas | H I Sutton (Covert Shores), sin licencia libre | https://www.hisutton.com/images/Ukraine-OAW-UAV-FP1_Cutaway.jpg |
| rampa-amanecer.jpg | En su rampa sobre remolque, al amanecer, de perfil por detrás: cola, vigas, motor, escapes, cuna. Versión primera (placas en las puntas) (2752×1536) | Fire Point, publicada en drone-warfare.com, sin licencia libre | https://drone-warfare.com/wp-content/uploads/2026/07/fire-point-fp-1-launcher.webp |
| defender-rampa-noche.jpg | En la rampa de noche, luz roja, de perfil por delante (2048×1366) | Fire Point vía Defender Media, sin licencia libre | https://thedefender.media/wp-content/uploads/2026/07/photo_2026-07-29-11.34.38.jpeg |
| defender-despegue.jpg | Despegue con el cohete encendido (1750×1096) | Fire Point vía Defender Media, sin licencia libre | https://thedefender.media/wp-content/uploads/2026/07/adxofvwugvo7scioivxb.webp |
| FP1-2_MSPO2026_1.jpg … _5.jpg | MSPO 2026 (Kielce), colgado: desde abajo y de lado; ala de carbono negra (otro ejemplar) (1920 px) | Michał Derela (Pibwl), CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/Category:FP-1/2 |
| FP1_MSPO2026_colgado.jpg | MSPO 2026, de lado y desde abajo (1920×1280) | KrzysztofPoplawski, CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Fire_Point_FP-1_unmanned_aerial_vehicle_at_MSPO_2026_in_Kielce,_Poland.jpg |
| eurosatory2026-colgado.jpg | Eurosatory 2026, colgado, de lado desde abajo (1024×684) | EDR Magazine, sin licencia libre | https://www.edrmagazine.eu/wp-content/uploads/2026/06/Fire-Point_00-1.jpg |
| fakty-ficha.jpg | Ficha con los datos del fabricante (envergadura 6 m, 215 kg, 60 kg de carga) (1080×1080) | Fakty, sin licencia libre | https://fakty.com.ua/wp-content/uploads/2026/06/18/Dron-FP-1.png |

## Probado y descartado

- La foto de fábrica (AP) para encajar la cámara: hecha muy de cerca con gran angular, no fija la cámara (errores de 20-75 px). Sirve para ver formas (lomo, cierres, cintas del ala), no para medir.
- La «punta» del ala de Kiev tomada como punta de verdad (x = 3 m): la cola salía 80-90 px desplazada. Es el ala sin sus tramos de fuera.
- `comparar-foto.mjs` con `--zoom` o `--recorte` en la foto de Kiev: el encuadre del visor sale descolocado a tan poca distancia (4,7 m); mejor el contorno de `encajar-camara.mjs` o la comparación a foto entera.

## Registro

- 27-10-2026: fases 2, 3 y 4 en una sesión. En este contenedor (Linux) hizo falta Node 24 (el glosario usa expresiones regulares `(?i:…)`, que Node 22 no entiende y deja vacías todas las fichas) y un Chrome con WebGL por software; copias de `comparar-foto.mjs` y `vista-visor.mjs` con esa ruta en `arte/uas-fuentes/fp-1/hd/`.
