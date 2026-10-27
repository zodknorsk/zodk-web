# Queen Hornet — diario

## Dónde estamos: fases 2, 3 y 4 hechas y dadas por buenas (27-10-2026), sin nota

- Fase 2: fotos y `FUENTES.md` en `arte/uas-fuentes/queen-hornet/` (fuera de Git; tabla abajo). Ajustes de cámara encajados en `hd/arriba.json` y `hd/lado.json`.
- Fase 3: maqueta en `src/data/uas/queen-hornet.ts`, con el detalle copiado de las fotos oficiales ampliadas ×4 (`recortes/` fuera de Git) y piezas al modo del Strike, encajada con la foto de arriba y la de lado. Tres acabados nuevos (`anodizado-qh`, `gris-cola`, `bateria-qh`) y `solo` en el dibujo `sting` (el avispón sin rótulo).
- Fase 4: `desfaseLuz` 0,35; tarjeta, tarjeta de noche y planta (`plantaDoble`) en `public/uas/queen-hornet/`; miniaturas de las fuentes en `fuentes/`.
- **Falta la fase 1, la nota en la bóveda**: sin ella no hay ficha. Para probar se usó un borrador temporal en `src/content/uas/queen-hornet/index.md`, ya borrado.
- El logo amarillo de la placa queda bajo la batería de delante (va pintado, pero no se ve).
- La caja de debajo del cubo (con letra amarilla, parece una batería) se queda como caja de suelta: el usuario lo deja así.
- El trabajo está en la rama `claude/nuevodron-fases-2-3-4-iid64t`; para importar hay que llevarlo a `main` (el importador se niega fuera de ella).
- Siguiente: `/nuevodron Queen Hornet. Fase 1` (la nota) y luego la 5.

## Decisiones del usuario

- 25-10-2026: dron elegido, el **Queen Hornet** de Wild Hornets (Ucrania), FPV bombardero de 17 pulgadas. Pide las fases 2, 3 y 4 en una sesión; la nota (fase 1) aún no está.
- 25-10-2026: versión **17" de marco de aluminio** (la actual, la de la ficha), no la de 2024 de carbono de 15".
- 25-10-2026: ejemplar **negro, el de la web** (logo amarillo, «Q0002226» en un brazo).
- 25-10-2026: carga **una granada de mortero de 81 mm**, **tumbada bajo la panza**, morro adelante, colgada del soltador. Se usa la M821 americana (plano oficial y espoleta M734A1).
- 27-10-2026: la maqueta **se deja así** (dada por buena).
- 25-10-2026: **copiar 1:1 los detalles de las fotos oficiales** (cuerpo, patas, motores, cámara…) y **baterías negras**.
- 25-10-2026: **basarse en el Strike** (misma casa): del Strike se toman las piezas y el detalle (motores, baterías con correas y hebillas, cables, cámara, tornillería); el marco, que es otro (aluminio plegable con patas), sigue medido de sus fotos.
- Slug: `queen-hornet` → `/uas/queen-hornet` (la maqueta, `src/data/uas/queen-hornet.ts`).

## Medidas clave

Del fabricante (https://wildhornets.com/en/queen-hornet-17-inch-fpv-drone): marco de aluminio de 17", motores 4320 350KV, ESC 80 A, dos baterías 6s4p, sistema de suelta, VTX 1,2–2,5 W; cámara analógica, digital (DJI O3/O4, Walksnail) o térmica Caddx IRC. Máxima 160 km/h, crucero 70–80 km/h, hasta 25 min, ida 20 km, ida y vuelta 15 km, vuelo 50–300 m (máx. 2.000 m). Carga óptima 6 kg, máxima 9 kg. **No da medidas del marco.**

Planta (`wh-inch17_3.png`, escala por la foto del soldado: hélices de 17" = 43,2 cm): motores en un cuadrado de **55 cm** de lado (±27,5 cm en x y z), 78 cm en diagonal; brazos de 3,4 cm de ancho; placa de arriba de 27,7 × 11,7 cm (de z +11,3 a −16,4); caja de la cámara delante, de z +11,3 a +20,7, 7,8 cm de ancho; patas a un 70 % del brazo; mástil de unos 15 cm con dos antenas cruzadas de 24 cm; antena de vídeo de unos 18 cm.

Granada M821: Ø 81 mm, 445 mm sin espoleta; espoleta M734A1 de 94,5 mm (66 fuera), Ø 49 mm; en total unos 52 cm; 4,1 kg. Perfil del cuerpo, el medido para el Strike en la foto de CAT-UXO.

Encajado (fotos oficiales): caja de suelta hasta y −10 cm; mástil de 12 cm a 12° hacia atrás, punta a y 18 cm; cámara a y 2,6 cm; patas hasta y −10,8 cm. Planta encajada con errores de 1-7 px; de lado, 4-12 px.

Luz del pixel (HD a 30°, 27°): tapa de las baterías 2,92 escalones, lo alto del marco 1,35-1,40, verde de la granada 0,9-1,06; con `desfaseLuz` 0,35 caen dentro de un escalón.

Placa (foto de arriba, `deArriba` en la maqueta pasa de píxel a cm): 22 x 11,4 cm de z +10,9 a −11,1, saliente de la cámara ±3,2 hasta +16,6 y del mástil ±2,9 hasta −16,6; raíles en z +1,15 y −1,0; conectores en los costados de z +2,8 a −3,5 (pines en +0,6 y −0,9); ranuras de correa en x ±4,6, z +8,35 y −8,85; avispón de 5 cm en z +5,9; ventana gris de 2,8 x 4,6 en z −6,3. Cámara: barril de eje x, Ø 3,9 cm, de x −3,1 a 3,1, en z 18,6. Pata: pala de morro a cola (no a lo largo del brazo), 4,6 cm arriba y 2,6 abajo, canto de detrás curvo, hasta y −10,8. Caja de suelta: 5 x 7 x 6,6 cm bajo un pie facetado.

Colores: baterías negras (decisión del usuario); cola de la granada gris (#70707a).

## Fuentes

Fotos en `arte/uas-fuentes/queen-hornet/full/` (fuera de Git, bajadas el 25-10-2026; sin licencia libre):

| Archivo | Qué enseña | Autor | URL |
|---|---|---|---|
| wh-inch17_1.png | De tres cuartos desde arriba y por delante, sin hélices ni baterías | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/inch17_1.png |
| wh-inch17_2_new1.png | De lado algo desde arriba: placa, patas, caja de suelta, mástil, «Q0002226» | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/inch17_2_new1.png |
| wh-inch17_3.png | Desde arriba, mástil plegado: la planta | Wild Hornets, web | https://wildhornets.com/wp-content/uploads/2025/04/inch17_3.png |
| devua-soldado.jpg | De frente en manos de un soldado, con hélices tripala | dev.ua | https://dev.ua/storage/images/43/28/60/20/derived/6da4baa8b0136cc28dcede74225e7935.jpg |
| armyinform-desde-abajo.jpg | Desde abajo, con hélices y mástil | ArmyInform | https://armyinform.com.ua/wp-content/uploads/2025/01/475139044_982523640641213_4512951687295562190_n-1.jpg |
| kyivpost-2024-*.jpg | Versión de 2024: baterías azules encima, carga colgada | Kyiv Post | https://static.kyivpost.com/storage/2024/09/05/2dd745ab6f7e188e1edd921199784383.jpg |
| emp-2024-bulava.jpg | Versión de 2024: dos baterías azules encima, en fila | Wild Hornets (Euromaidan Press) | https://euromaidanpress.com/wp-content/uploads/2024/11/Mortar-FPV-Bulava.jpg |
| bulletpicker-m821.png | Plano de la M821 (445 mm sin espoleta) | TM 43-0001-28 | https://www.bulletpicker.com/cartridge_-81mm-he_-m821.html |
| l3harris-m734a1.pdf | Espoleta M734A1, medidas | L3Harris | https://www.l3harris.com/sites/default/files/2021-08/as-pes-resource-fos-m734a1-mofm.pdf |
| catuxo-m821.jpg | M821 con cola y cargas | CAT-UXO | https://cat-uxo.com/ |

## Probado y descartado

- Vídeos de la web del fabricante: solo la imagen de su cámara; el dron no sale.
- Fotos de DroneXL (2024-2025): ninguna es del Queen de aluminio (otros FPV, un VTOL).
- Commons: la API corta con 429 desde la nube; no se pudo buscar.
- `armyinform-desde-abajo.jpg`: el marco de debajo (gris, con agujeros) no casa con el de las fotos oficiales; puede ser otra versión. No se usa para medir.
- Anodizado con brillo (metal 0,35, rugosidad 0,5): desde arriba reflejaba el cielo y la placa salía gris. Mate (0,15 / 0,72).
- Patas a lo largo del brazo: en la foto de lado las cuatro se ven de frente; van de morro a cola.
- Avispón girado −90°: salía con las filas cruzadas respecto a la foto; va sin girar.
- Caja de suelta de 8 cm de ancho: tapaba el cubo de lado; en la foto tiene unos 5.
- Planta sin `plantaDoble`: los brazos no salían, solo las hélices.

## Registro

- 25-10-2026, fase 2: fotos oficiales, de prensa y de la M821; forma leída.
- 25-10-2026, fase 3: maqueta; planta y lado encajados; mástil más corto y derecho, caja de suelta más alta, patas más cortas y cámara más baja tras encajar. Perfil de la M821 medido de nuevo en la foto de CAT-UXO (cuerpo más corto que el del Strike: la cola empieza a 343 mm de la punta).
- 25-10-2026, fase 3 (2.ª vuelta): detalle del Strike: motores con seis ventanas y ocho radios sobre el bobinado, tuerca con nailon y tornillos bajo el brazo; baterías con alfombrilla, dos correas con hebilla de escalera, balanceo y cables rojo y negro; cámara con frontal, rosca y aro; tornillos de placa, bisagras y abrazaderas; bridas del mástil, LED del receptor y etiqueta del transmisor.
- 25-10-2026, fase 3 (3.ª vuelta): detalle 1:1 de las fotos oficiales ampliadas: placa con su planta real, raíles, asas, conectores de dos pines, tornillos, ranuras, ventana gris y LED; cubo facetado; caja de la electrónica en tres tramos con el USB; cámara en barril con surco, puntos naranjas y objetivo; bisagras con nudillos; variadores con pinzas; abrazaderas con nervios y brida; patas de morro a cola; motores de ocho ventanas y diez radios; caja de suelta con pie, tornillos, agujero y letra amarilla; baterías negras de través.
- 25-10-2026, fase 4: desfase de luz medido, anodizado pasado a mate, miniaturas.
- En la nube hizo falta Node 24 (las expresiones `(?i:…)` del glosario no van en Node 22) y Chrome con `--no-sandbox`.
