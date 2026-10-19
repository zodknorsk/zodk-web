# Wing Loong II (AVIC/CAIG, China) — diario

## Dónde estamos: fase 3 reabierta con las correcciones del usuario (19-10-2026)

- Rama `maqueta-project` (importar con `npm run importar -- --en-esta-rama`). Fase 1 (nota) sin hacer: **ficha provisional** `src/content/uas/wing-loong-ii/index.md` (solo local, no se commitea).
- Hecho y sin tocar: color (`gris-wl`, `gris-ba7`, `verde-ls6`), logo del morro (`halcon-wl`, `halcon-wl-espejo`, `letras-wl` en `logos.ts`), costuras, 8 partes y fuentes con miniaturas. Si cambia la forma del morro, **volver a pasar `--marcas`** (el logo va sobre él).
- **Correcciones del usuario sobre `~/Downloads/wing-loong-ii-fase3/comparativas.html`** (pendientes, por este orden, una sesión cada grupo):
  1. **Cuerpo y morro: la forma no es la de las fotos.** De frente, en la foto el cuerpo es ancho y casi de caja redonda por debajo de la arista (costados casi verticales, panza ancha y plana) con la cúpula redonda encima; la maqueta se cierra en «V» por abajo y asoma la punta del morro. De lado, el morro de la maqueta tiene un hundido raro en el lomo cerca de la punta y la punta afilada arriba; en las fotos (Singapur, Aerofossile) es una nariz redonda y roma, con la arista corriendo hasta la punta. Esto sí se mide (perfil y frente) y se compara a la vez de frente y de lado.
  2. **Toma de aire**: «una chapuza». Es una góndola cilíndrica posada sobre el lomo, con la boca redonda y su labio (Zhuhai), no un bulto con un disco.
  3. **Torreta EO/IR**: modelarla «a la perfección» como en las fotos (Dubái de frente, MAKS 2019): bola con sus ventanas, la horquilla/carcasa y el cuello, no una esfera con un cuello.
  4. **Tren**, **soportes de las armas** y **armas**: igual, con su forma real.
  5. **Al final, con todo hecho: el tren está en el aire** en el visor (las ruedas no tocan el suelo). Revisar dónde pone el visor el suelo para este dron y que las tres ruedas apoyen.
  - Para todo lo que no es el cuerpo: **calcar la forma de las fotos**, no medir al centímetro.
- Pregunta del usuario: la pieza bajo la panza del avión de Zhuhai 2021 («WL-2») es una góndola grande con una pala de antena debajo; el demostrador no la lleva (Dubái de frente). Qué es no está publicado (posible sensor: radar o guerra electrónica). No se pone.
- Cámaras de 4 fotos asentadas; en los json, `sin` con todas las armas y, menos en Zhuhai, el pilón de fuera; en `dubai-frente`, `ignorar` bajo el ala. Tras rehacer el cuerpo, `--ajustar --guardar` y volver a medir.
- En la bóveda, fichas vacías de BA-7 y LS-6 (borrador, sin subir). Antenas del lomo: el demostrador no lleva; cerrado.
- Sin commitear: todo lo de la fase 3.

## Lo visto en las fotos (fase 2)

- Fuselaje largo con el morro abombado por arriba (joroba del satélite, como el Reaper) y panza más plana; sonda en la punta del morro. Torreta EO/IR esférica bajo el morro, delante de la rueda del morro.
- Ala recta, poco estrechada, a media altura del fuselaje y hacia la mitad del largo, con **winglets** verticales en las puntas (el GJ-2 no los lleva). Seis pilones, tres por ala, los de dentro más grandes.
- Cola en V hacia arriba y **aleta ventral** bajo la cola (perfil de Dubái). Hélice empujadora de tres palas detrás. Toma de aire cilíndrica en el lomo, detrás del ala (Zhuhai).
- Tren triciclo fijo: principales con patas abiertas hacia fuera desde la panza, rueda sola en el morro.
- Color: gris claro uniforme; el halcón, gris oscuro. Medir en la fase 3 con fotos al aire libre (Dubái y Singapur, sol; MAKS 2019, nublado).
- Marcas del demostrador: halcón + «翼龙II» + «WING LOONG II» en los dos costados del morro; números de paneles pequeños («101-01C», «304-02C»…) por todo el fuselaje.
- Lo del Zhuhai 2021 que **no** lleva el demostrador: góndola bajo la panza y «WL-2». La cinta roja de la sonda («quitar antes de volar») no va.

## Decisiones del usuario

- 19-10-2026: dron = **Wing Loong II** (China). Solo maqueta (fases 2 y 3); la nota, más adelante.
- 19-10-2026: avión de las marcas = el **demostrador de exportación** de las ferias (gris claro, halcón y «翼龙II / WING LOONG II» en el morro; Zhuhai 2016, Dubái 2017, Singapur 2018, MAKS 2019).
- 19-10-2026: carga = **seis pilones (tres por ala) con armas**.
- 19-10-2026: armas = «una mezcla» de las de su feria y las del de Zhuhai: **las que monte de verdad y, si no, las que mejores fotos tengan para modelarlas**. Buscado: en combate solo consta el BA-7 (panel de la ONU, Trípoli, abril de 2019: restos de un Blue Arrow, ligado al Wing Loong II de los Emiratos; CSIS y SCMP). LS-6, FT-9, FT-10, TL-2: ofrecidas o expuestas en ferias (AIN, Mönch, GlobalSecurity, 2017).
- 19-10-2026: armas identificadas (BA-7 y LS-6): ficha en la bóveda sin rellenar y sin subir.
- 19-10-2026: el usuario corrige con el dron entero: en la maqueta no se le enseña nada por grupos.
- 19-10-2026: vídeos de YouTube bajados con permiso para sacar fotogramas; **los vídeos se borran al terminar** (borrados el mismo día, quedan los fotogramas).

## Medidas clave

- Oficiales (Xinhua, 28-02-2017, citando a AVIC): largo **11 m**, envergadura **20,5 m**, alto **4,1 m**, MTOW 4,2 t, techo 9000 m, 370 km/h. Ancla de la escala: la envergadura (winglet a winglet).
- Ala: plano medio y = −0,06 en la raíz, sube 0,28 hasta la punta (x 10,1); borde de ataque 0,58 en la raíz (carenado) → 0,36 en x 2 → 0,22 en la punta; borde de salida −1,3 → −0,33; grueso 0,30 → 0,11. Winglet: 0,53 de alto, inclinado 16° hacia fuera.
- Cola en V a 35,6°, nace baja en los costados (raíz en x 0,2, y −0,23); punta en (±3,43; 2,09), de z −3,90 a −4,67; borde de ataque en la raíz −3,22, de salida −4,74. Aleta ventral de z −3,2 a −4,07, hasta y −1,19. Hélice en z −5,45, radio 1,37; cono hasta −5,88.
- Tren: rueda del morro r 0,15, eje (0; −1,535; 3,06), pata desde (0; −0,5; 2,87); principales r 0,185, eje (±1,36; −1,63; −0,79), pata en diagonal desde (±0,5; −0,5; −0,82) hasta el amortiguador vertical en x ±1,18; rueda por fuera.
- Ejes de la maqueta: y = 0 a la altura de la punta del morro; punta del morro en z = 5,2. `ESCALA` 7,8 m por unidad (como el MQ-9).
- Encaje conjunto (envergadura 20,5 como restricción): morro–cono de la hélice **11,14 m** (cuadra con los 11 m); alto de las antenas de la cola sobre el suelo ≈ 4,1 m (cuadra). Puntos: cono `S` (0; 0,06; −5,94), boca de la toma `IN` (0; 0,42; −3,04), antena de la cola `VA` (±3,39; 2,24; −4,23), winglet `WG` (±10,25; 0,76; −0,10), rueda del morro `NW` (0; −1,59; 3,10), ruedas principales `MW` (±1,48; −1,65; −0,74). Error de los puntos: 1-16 px (lo peor, antenas de la cola en Dubái).
- Cámaras: `zhuhai-16` az −53, 101 m, fov 4,4 (tele, de la derecha); `dubai-tres-cuartos` az 44, 16 m, fov 48; `dubai-frente` az 1, 9,9 m, fov 29; `aerofossile` az 58, 13 m, fov 35.
- Cuerpo: lomo y panza medidos en el plano del eje en Dubái y Aerofossile (coinciden a 1-3 cm); joroba hasta 0,67 m en z = 3,2; panza −0,5 a −0,57; medio ancho máximo 0,58 (foto de frente); plato de la hélice en z = −5,33, redondo, de y −0,185 a 0,27 (Zhuhai). Toma: tubo en el lomo, boca en z = −3,0, lo alto a 0,53, radio de boca ~0,1.
- Pilones (foto de frente para x y alto; Dubái tres cuartos y Aerofossile para la cuerda): dentro x ±1,30, medio ±2,22; bajan hasta y −0,38 y −0,37; cuerda de z ≈ 0,12 a −1,0 (Dubái daba el borde de delante en 0,16-0,21, Aerofossile en 0,02-0,04: se tomó lo de en medio). El demostrador **solo lleva esos cuatro** (de frente no hay nada hasta x 3,7); el de fuera, en x ±3,14, al paso de los tres que se ven seguidos en Zhuhai (reconstrucción).
- Soportes: lanzador doble bajo el del medio (viga de 0,52 m, raíles a ±0,225, hasta y −0,52; largo de z 0,25 a −0,85, lo que pide Aerofossile); bajo el de dentro, bastidor que se abre hasta dos zapatas a ±0,24, hasta y −0,58.
- BA-7: 1,775 m, 170 mm, 47 kg (GlobalSecurity, AKD-10). Forma de la maqueta 1:1 de Aerofossile, en fracciones del largo: buscador rojo hasta 0,046; franja azul 0,225-0,25; ganchos 0,31 y 0,65; alas en X de 0,69 a 0,955 (punta de 0,80 a 0,95), a 0,18 m del eje; timones 0,96-0,995.
- LS-6: sin medidas publicadas de la de 50 kg; medida al lado del BA-7 en Aerofossile: unos 1,9 m y 0,16 m. Morro blanco hasta 0,03; cuerpo verde hasta 0,8; cola blanca; gancho en 0,35; alas plegadas a los costados de 0,50 a 0,83 (0,155 m del eje); aletas en X de 0,885 al final.
- Carga montada: 8 BA-7 (medio y fuera, dos por pilón) y 4 LS-6 (dos por pilón de dentro). AIN y Defense News: lanzadores dobles en los seis pilones, hasta 12 armas; 480 kg de carga externa (con estas, ~580 kg: se dejó así, como la cuenta de las 12).

## Piezas

Comprobadas con `revisar-maqueta.mjs --piezas --tol=3` (error medio del borde, en cm):

- `fuselaje`: dubai-frente 2,4 ✓ · dubai-tres-cuartos 3,2 ✓ · aerofossile 4,2 ✓ · zhuhai-16 9,8. Zhuhai es otro avión («WL-2») y debajo le faltan aún tren, pilones y góndola. Las «faltas» que quedan son de piezas de otros grupos: raíces de la cola en V (z −4,5 a −5,2 por arriba), aleta ventral (z −3,3 a −4,8 por abajo), torreta y pata del morro (z 3,0-4,1), patas y pilones (z −2,6 a 0,5), raíz del ala en la arista. Sin explicar, pequeño: Zhuhai pide la joroba 4 cm más alta (las del demostrador no).
- Arista viva del costado (morro → ala): vista en la foto de Singapur (`commons-flickr-drone-2018`), sin medir con números (esa foto aún no está encajada).
- `ala`: dubai-tres-cuartos 2,5 ✓ · aerofossile 3,3 ✓ · dubai-frente 4,1 ✓ · zhuhai-16 9,7 (el ala cercana se sale de la foto y pide bajar 17 cm a x −8,5: solo en esa foto). Debajo, a media envergadura, faltas que son los pilones y armas. Medido: borde de ataque en la raíz (Zhuhai y Dubái), punta y base del winglet (Zhuhai), alto y diedro (frente). **El borde de salida en la raíz (z −1,3) es supuesto**: ninguna foto lo enseña.
- `winglet`: dubai-tres-cuartos 2,2 ✓ · zhuhai-16 3,0 ✓.
- `flaps` y `alerones`: **reconstrucción** (bisagra al 25 %, flap x 1,0-4,8, alerón 4,8-9,6): el borde de salida no sale de cerca en ninguna foto. Alerones: aerofossile 5,3.
- `cola`: dubai-frente 2,8 ✓ · dubai-tres-cuartos 5,4 ✓ · aerofossile 5,5 ✓ · zhuhai-16 6,3. `timones`: dubai-tres-cuartos 3,8 ✓ · aerofossile 5,4 ✓ · zhuhai-16 7,6 (la bisagra se ve como una línea en las dos colas; su cuerda, 30 %, supuesta).
- `aleta-ventral`: dubai-tres-cuartos 3,9 ✓; en Aerofossile la tapa una persona (10,1) y en Zhuhai la góndola de ese avión (15,7). Solo una foto.
- `cono`, `helice`, `helice-puntas`: el plato (Zhuhai) y una pala con la punta amarilla (Dubái, radio 1,37); demasiado pequeñas o tapadas para el informe. Ancho y forma de las palas, supuestos.
- Tren (`--tol=4`): `rueda-1` 2,1/2,3/4,6/6,5 ✓, `rueda--1` 3,6/3,9/4,8/6,9 ✓, `rueda-morro` Zhuhai 1,3 ✓ · frente 4,3 ✓ (en Aerofossile y Dubái la tapan torreta y armas), `pata-morro` 3,9-5,7 ✓ en las cuatro, `horquilla-morro*` 0,9-5,8 ✓ en tres, `amortiguador-±1` 2,7-5,6 ✓ en tres, `pata--1` 3,6-6,6 ✓ en tres, `pata-1` Dubái 6,7 ✓ · frente 7,5 ✓ (Aerofossile 9,0; Zhuhai 19: góndola y armas junto a la raíz). `eje-±1`: solo de frente. De frente, los calzos negros quedan fuera del recorte (la rueda «sobra» por abajo).
- `torreta`: frente 1,9 ✓ · aerofossile 6,6 ✓ · zhuhai 7,3 ✓ · dubai-tres-cuartos 7,5 ✓; `torreta-plato` en las cuatro ✓; `torreta-cuello` 4,2/4,8 ✓. Ventanas: de la foto de frente (sitio y tamaño), demasiado pequeñas para el informe.
- `toma-boca`: demasiado pequeña para el informe; su sitio sale del punto `IN` del encaje conjunto (3 fotos).
- Pilones y soportes (`--tol=3`; armas y pilón de fuera fuera de la cuenta, ver «Dónde estamos»): `pilon-medio` dubai-tres-cuartos 2,4 ✓ (Aerofossile, demasiado pequeño); `rail-medio-1-1` aerofossile 3,8 ✓ · dubai-tres-cuartos 5,8 ✓; `zapata-dentro-1--1` aerofossile 4,1 ✓ · dubai-tres-cuartos 4,8 ✓; `zapata-dentro-1-1` 6,6/8,8 en dos fotos hacia lados contrarios (cámara). `pilon-dentro`, los lanzadores y el resto, demasiado pequeños o tapados. En Zhuhai «faltan» 20-50 cm bajo los soportes: ese avión va cargado con otras armas.
- `pilon-fuera`, `lanzador-fuera-*`, `rail-fuera-*`: **reconstrucción** (el demostrador no los lleva).
- Antenas del lomo: ninguna; el demostrador no las lleva.
- Armas (`ba7-*`, `ls6-*`): ninguna foto del demostrador las lleva puestas; su forma, de las maquetas 1:1 de la feria (Aerofossile, Singapur); cómo cuelgan, de los soportes. Comprobado en el visor de cerca que no flotan.
- Color (`gris-wl` #acaeb2): al sol en Singapur, el lomo #cfcfd2; el render, desde la cámara de frente, da #cfd0d3 en la cara de arriba. Las fotos de Dubái salen más oscuras (#7f8b9b): es la exposición. Armas: `gris-ba7` #b3b5ba (BA-7: #a09fa5 a la sombra en Singapur, #cacfd5 al sol en Aerofossile), `verde-ls6` #46503c (LS-6: #3e4c3b-#495646, siempre a la sombra o tapada; poco fiable). Las bandas roja y azul del BA-7 se quedan con `rojo-vivo` y `azul`.
- Marcas (`--marcas`): halcón (calca 0) en su sitio en Aerofossile y a 10 cm hacia el morro en Dubái tres cuartos; el del otro costado (calca 1) a 8-9 cm en Zhuhai (el halcón en espejo casa: parecido de 0,37 a 0,77). Letras (calca 2) en su sitio en Aerofossile, a 8-10 cm en Dubái y Zhuhai, hacia lados distintos. El halcón, un 5 % más pequeño de lo medido en Aerofossile (dos fotos pedían ×0,92-0,96). Calcado del primer plano de Singapur con potrace (umbral por alturas: arriba lo sombrea la joroba); medido con `medir-plano.mjs` en Aerofossile. «101-01C» y «304-02C» en su sitio en Aerofossile; en las demás, demasiado finos. Solo esos dos números: los demás no se leen.
- Costuras: la junta remachada del panel del morro (sobre la arista y en diagonal hasta el lomo) y la tapa de detrás, medidas en Aerofossile y vistas en Singapur; en los dos costados (son de estructura). Ninguna en el ala ni en la cola: no se ven en las fotos.

## Fuentes

| Archivo | Qué enseña | Autor y licencia | URL |
|---|---|---|---|
| commons-dubai2017-frente.jpg | Demostrador de frente, Dubai Airshow 2017 | Mztourist, CC BY-SA 4.0 | commons.wikimedia.org/wiki/File:Wing_Loong_II_fron_view.jpg |
| commons-dubai2017-perfil.jpg | Demostrador, perfil izquierdo, Dubái 2017 | Mztourist, CC BY-SA 4.0 | commons.wikimedia.org/wiki/File:Wing_Loong_II_side_view.jpg |
| commons-flickr-drone-2018.jpg | Demostrador, perfil derecho (6000 px), Singapore Airshow 2018 | aamanatullah, CC BY 2.0 | commons.wikimedia.org/wiki/File:Drone_(40203028111).jpg |
| commons-jasdf-gj2-2025.jpg | GJ-2 (PLAAF) en vuelo, desde abajo | Japan Ministry of Defense, CC BY 4.0 | commons.wikimedia.org/wiki/File:2025-02-26_PLA_GJ-2_(Chengdu_Wing_Loong_2).jpg |
| commons-changchun2025.jpg | GJ-1 y GJ-2, Changchun 2025 | 颐园居, CC BY-SA 4.0 | commons.wikimedia.org/wiki/File:GJ-1%26GJ-2_at_Changchun_Airshow_20250921.jpg |
| commons-maks2017-01/02.jpg, commons-maks2017-ffa.jpg | **Wing Loong I** (Commons las llama II), MAKS 2017 | Vitaly V. Kuzmin / FFA P-16, CC BY-SA 4.0 | Commons, Category:Wing Loong-2 |
| flickr-aerofossile.jpg | Demostrador tres cuartos izquierdo con armas al lado (feria sin identificar, carteles de Malasia) | Aerofossile2012, CC BY-NC-SA 2.0 | flickr.com/photos/17350451@N08/44306344104 |
| flickr-sinodefence-2.jpg | Ala con pilones cargados y tren, de cerca | SinoDefence.com, dominio público (PDM) | flickr.com/photos/164925283@N02/42858589401 |
| video/fotogramas/maks2019-*.jpg | Demostrador en MAKS 2019: logo del morro, tres cuartos, torreta, tren | The Aviationist, YouTube | youtube.com/watch?v=9hUuDqw7Vh0 (yt-dlp, 1080p) |
| video/fotogramas/zhuhai2021-*.jpg | Wing Loong-2 «WL-2» rodando en Airshow China 2021, pilones cargados (otro avión: forma y armas, no marcas) | New China TV (Xinhua), YouTube | youtube.com/watch?v=_CR-XGy5Ry8 (yt-dlp, 1080p) |

Medidas: Xinhua por chinanews.com (chinanews.com/mil/2017/02-28/8161585.shtml). BA-7: GlobalSecurity (globalsecurity.org/military/world/china/akd-10.htm). Lanzadores dobles en los seis pilones: AIN (ainonline.com, Singapur 2016 y París 2017) y Defense News (Singapur 2018). LS-6: GlobalSecurity (ls-6.htm) y Wikipedia (LS PGB), sin medidas de la de 50 kg. Buscado sin éxito: Openverse/Flickr (casi todo es un restaurante «Wing Loong»), web del fabricante (中航(成都)无人机, no responde), galería de Army Recognition (640 px, descartada).

## Probado y descartado

- Antena en gota bajo la panza (z 2,4): la lleva el avión de Zhuhai, no el demostrador.
- «Antenas» blancas sobre el lomo, encima del ala, en Dubái, Aerofossile y Singapur: son colas de aviones de detrás.
- Reencajar cámaras con `--ajustar` con la maqueta a medias (solo cuerpo y ala): resbalan y mueven 0,5 m la cola.

- Fotos de Army Recognition (Zhuhai 2016): solo 640 px.
- Medir pilones y soportes con la silueta de `dubai-frente`: su recorte de SAM no los coge (gris claro sobre el suelo) y pedía estrecharlos y acortarlos; se ignora esa zona.
- Calcar el logo con un umbral fijo: la sombra de la joroba se come el borde de arriba del halcón; se usa un umbral que cambia con la altura.
- Pilón de fuera en x 3,35 (leído en Dubái tres cuartos): de frente no hay nada ahí; el demostrador solo lleva cuatro pilones.

## Registro

- 19-10-2026, fase 2 (fotos), 13:36–13:52: Commons, Openverse, Flickr y YouTube; 2 vídeos bajados y borrados tras sacar fotogramas; hoja de fotos; veto del usuario; forma leída. Tokens (transcripción `3bd73053…jsonl`, 62 llamadas): 8,86 M en total = 8,69 M leídos de caché + 0,14 M escritos en caché + 34 k de salida + 124 de entrada.
- 19-10-2026, fase 3 grupo «cuerpo», 13:54–14:10: 4 cámaras encajadas a la vez; recortes SAM; cuerpo de una pieza con arista y toma en el lomo, comprobado con números; ficha provisional para verlo en local.
- 19-10-2026, fase 3 grupo «ala y mandos», 14:10–14:16: ala, winglets y mandos (reconstrucción); cámaras reencajadas con siluetas (menos la de frente).
- 19-10-2026, fase 3 grupo «cola», 14:16–14:23: encaje conjunto ampliado (esquinas de la cola, raíz y punta del ala); cola en V, timones, aleta ventral, cono y hélice; cámaras reencajadas con siluetas.
- 19-10-2026, fase 3 grupo «tren», 14:23–14:29: ruedas medidas en Zhuhai, patas en la foto de frente; recortes de SAM rehechos con el tren; cámaras asentadas con `--ajustar`.
- 19-10-2026, fase 3 grupo «cámaras, armas y antenas» (a medias), 14:29–14:32: torreta medida (frente y Zhuhai) y comprobada; antena en gota descartada (solo Zhuhai); pregunta de las armas.
- 19-10-2026, búsqueda de las armas del Wing Loong II, hasta 14:33: decisión apuntada; sin modelar aún.
- 19-10-2026, fase 3 grupo «cámaras, armas y antenas», armas, 14:34–15:00: BA-7 y LS-6 medidos (fuentes y maquetas 1:1 de Aerofossile); pilones y soportes medidos en las fotos encajadas y comprobados; armas montadas y vistas en el visor; fichas vacías de las dos en la bóveda.
