# FP-1 — diario

## Dónde estamos

- **Fase 1 (la nota)**: sin hacer. No hay nota del FP-1 en la bóveda.
- **Fases 2, 3 y 4**: hechas el 27-10-2026, en el commit `751ff15` de la rama `claude/nuevodron-fases-2-3-4-ub8zqn`.
- **Fase 6 (revisión), primera vuelta, hecha** el 27-10-2026: los 16 puntos de la comparación con las fotos (sección del cuerpo con chaflán, tapa del lomo, cola del cuerpo, panza, cintas del ala, paneles de cola planos, unión viga–cola, varillas de mando, motor, escape, hélice, etiquetas, cohete). A falta de que el usuario la vea.
- **Solo en local, fuera de Git** (excluidos en `.git/info/exclude`): la ficha provisional `src/content/uas/fp-1/` y la variante `fp-1-kiev` (ala cortada a 2 m y cohete sin rampa, para comparar con las fotos de Kiev).
- **Falta**: la nota (fase 1), importarla en `main` y probar (fase 5).
- **Siguiente paso**: que el usuario mire las comparaciones y diga qué sigue sin estar igual.

## Decisiones del usuario

- 27-10-2026: versión de **serie actual** (ala recta, sin placas en las puntas).
- 27-10-2026: color y marcas del **ejemplar gris de Kiev** (mayo de 2025).
- 27-10-2026: **sin carga a la vista** (la ojiva va dentro).
- 27-10-2026: **con la rampa** y el cohete de despegue (botón «Rampa»).
- 27-10-2026: revisión: «todo exactamente igual que en las fotos»; hacer los 16 puntos de la comparación.

## Medidas clave

En metros de la maqueta; y = 0 en la panza del ala, z = 0 cerca del centro del ala.

- Envergadura 6 m (Fire Point). Lo demás, encajando la cámara en el render de Fire Point de la ficha de Fakty (9 puntos, error de 1 a 6 px; `hd/render.json`) y en la foto de Kiev (6 puntos, 1-16 px; `hd/kiev.json`). La foto de Kiev está hecha **desde la derecha** del dron (ala cercana = x negativa).
- Ala: cuerda constante de 0,6 m (borde de ataque 0,25, de salida −0,35), grueso 9 cm, sin diedro, punta recta. Alerones de 1,55 a 2,82 m.
- **El ala del ejemplar de Kiev está expuesta sin sus tramos de fuera**: acaba a 2 m del centro (el encaje lo da con ese valor) en una cara plana con los agujeros de dos largueros.
- Cuerpo: 1,92 m (morro en z = 1,3, cara de atrás en −0,62), 0,48 de ancho, 0,38 de alto; punta del morro a media altura; junta de la tapa del morro en z = 0,75. Sección: costado vertical, arista viva a 0,08 m de la panza y chaflán hasta una panza de 0,36 de ancho (fotos de detrás y de MSPO). Detrás, la panza sube 22 cm desde z = −0,45.
- Tapa del lomo: de z = 0,75 a 0,24, 0,494 de ancho (reborde de 7 mm por costado, a y = −0,055); lomo de 0,24 arriba y 0,4 abajo que sube hasta 10 cm junto al ala.
- Vigas a ±0,68, de z = 0,2 a −2,02. Cola en V invertida de placas de 18 mm: vértice 0,363 sobre el ala, pies a ±1 m y 0,157 por debajo (4 cm más alta que en el encaje del render, para que las vigas queden bajo el panel); cuerda de 0,36 (−1,7 a −2,06); timón, el 30 % de atrás.
- Motor en z = −0,71, hélice de 1,1 m (palas de 13 cm) en z = −0,85, a y = −0,17; corona de 22 cm. Silenciadores a x = ±0,1, y = 0,14, de z = 0 a −0,64.
- Rampa: inclinación 18° (aproximada), raíles a y = −0,8 (la hélice pasa 8 cm por encima). Cohete: jaula de 1,2 m, de (y −0,46, z −0,28) a (−1,22, −1,12), unos 40°.
- Color: albedo `gris-fp` #8a8f93. Pixel: gris al sol con luminosidad 0,73-0,76 en el HD → `desfaseLuz` 0,3.
- Marcas, todas en el costado **derecho** (las dos fotos de Kiev son de ese lado): «ЗАКРІПИТИ» (y −0,017, z 0,34), aviso «НЕ ВМИКАТИ ЖИВЛЕННЯ / БЕЗ ЗНЯТТЯ ФІКСАЦІЇ ПОВЕРХОНЬ» (−0,136, 0,32), conector (−0,168, 0,32), «ЖИВЛЕННЯ» (−0,186, 0,32); conectores del arranque a y −0,055 y etiquetas verticales («СТАРТЕР», «ЗАПАЛЮВАННЯ 2», «ЗАПАЛЮВАННЯ 1», de atrás adelante) en z −0,48, −0,45, −0,42. Placa en T de la panza en z −0,2. Etiquetas plateadas (#c9cac5).

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

- Encajar la foto de Kiev de delante con más puntos (bordes del ala): está hecha pegada a la punta del ala con gran angular (unos 70°) y la cámara cae en soluciones falsas. Para comparar, cámara a mano.
- Ala 10 cm más atrás (lo que pedía la foto de Kiev): el render de Fire Point pasa de 6 a 19 px de error en el morro. Se queda donde está.
- La jaula del cohete enganchada a media panza (z −0,08): en la foto de detrás va bajo el borde de salida del ala.
- `comparar-foto.mjs` con lienzo de más de 1400 px: el encuadre sale mal (el propio script avisa).

## Registro

- 27-10-2026: fases 2, 3 y 4 en una sesión. En este contenedor (Linux) hizo falta Node 24 (el glosario usa expresiones regulares `(?i:…)`, que Node 22 no entiende y deja vacías todas las fichas) y un Chrome con WebGL por software; copias de `comparar-foto.mjs` y `vista-visor.mjs` con esa ruta en `arte/uas-fuentes/fp-1/hd/`.
- 27-10-2026, revisión: comparación con todas las fotos y los 16 puntos hechos; marcas leídas de cerca (eran del costado derecho); centro de `girar` sin pasar a unidades (las piezas giradas salían flotando), corregido en `aUnidades`.
