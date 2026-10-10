# Sting (Wild Hornets) — diario

## Dónde estamos: cerrado

- **Fase 1 (la nota) hecha** el 09-10-2026: `02 - Temas/Hangar de UAS/🇺🇦 Sting.md` en la bóveda, `estado: borrador`, `publicar: true`. Sin revisar por el usuario.
- **Fase 2 (fuentes y fotos) hecha** el 09-10-2026, a falta de que la vea el usuario: 25 fotos elegidas en `arte/uas-fuentes/sting/full/` (fuera de Git, solo en la nube; se pasan al Mac en un zip), `FUENTES.md`, la tabla y la lectura de la forma, abajo.
- Trabajado en la nube, en la rama `claude/nifty-faraday-wj1m34` de los dos repositorios (no en `main`): el importador no se ha ejecutado y no hay nada publicado.
- **Fase 3 (maqueta HD) hecha** el 09-10-2026 en el Mac, en `main`, **commiteada y subida** (revisada por el usuario en cinco vueltas): `src/data/uas/sting.ts`, acabado nuevo `arena-st` (en `tipos.ts`, `uas-paletas.ts`, `uas-hd.ts` y `visor-uas.ts`) y dibujo nuevo `sting` (el logo) en `tipos.ts` y `uas-hd.ts`. Comparación en `~/Downloads/sting/sting-fase3-comparacion.html`; segunda vuelta (correcciones del usuario) en `sting-fase3-correcciones.html`.
- **Provisional, fuera de Git**: `src/content/uas/sting/index.md` es una ficha mínima solo para ver el visor en local (sin commitear, a propósito: publicaría una página vacía). La sustituye el importador en la fase 5. En otro ordenador hay que volver a crearla o importar la nota.
- **Vista de perfil en vuelo** (10-10-2026, sin commitear, a falta de que la vea el usuario): en Perfil el dron se tumba (morro a la izquierda, cámara arriba) y sigue así al girar con el ratón hasta pulsar otra vista. Campo nuevo `posturaPerfil` (`tipos.ts`, `visor-uas.ts`).
- **Decidido antes de la fase 4** (10-10-2026, usuario): Planta y Abajo, de pie como estaban; Frente, por la cara del logo (`vistaFrente: [180, 0]`); tarjeta de pie, como abre el visor (`vistaTarjeta: [200, 8]`); planta de la portada tumbada, por el lomo (`plantaEnVuelo`). Tarjeta y planta ya generadas en `public/uas/sting/` (planta de 18x18, a escala).
- **Fase 4 (pixel HD) hecha** el 10-10-2026, a falta de que la vea el usuario: `desfaseLuz: 0.25`; tarjeta y planta regeneradas. Comparaciones (HD, pixel sin desfase, pixel con 0,25) en el scratchpad de la sesión, no guardadas.
- **Fase 5 (en la web) hecha** el 10-10-2026: la nota ya estaba importada y al día (el importador no cambió nada); 8 miniaturas en `public/uas/sting/fuentes/` (428 KB); `lint` y `astro check` sin errores; probados visor (vistas, partes, fuentes, Pixel, noche) y la tarjeta en `/uas`. Sin medir el consumo en Zen: lo nuevo del visor solo corre al cambiar de vista, no en cada fotograma.
- **Cerrado** el 10-10-2026: el usuario pidió commit y push (en `main`, publica). La 2.0 en el visor, la tarjeta y la planta; sin nave del hero (no la pidió). Faltan las miniaturas de `fuentes` (`public/uas/sting/fuentes/`, con `sips`), que van con la fase 5.

## Decisiones del usuario

- 09-10-2026: dron elegido, el **Sting** de Wild Hornets (Ucrania), interceptor FPV contra Shahed y Geran. Solo fases 1 y 2.
- 09-10-2026: versión **Sting estándar** (no la Sting S ni la 2.0) y **carga estándar**.
- 09-10-2026: las fotos se usan **aunque no tengan licencia libre**, para enlazar las partes del dron en el visor con la foto en el blog.
- 09-10-2026: el avión de las marcas lo elige Claude (el que tenga más fotos de varios lados).
- 09-10-2026 (fase 3, revisión): el **logo, el oficial** de Wild Hornets con «STING» pegado debajo; **fuera la varilla azul con bolas**; patas, alas y cámara corregidas; más juntas y tornillería; el dron **abre de pie** y se gira con el ratón. Para la revisión vale cualquier acabado de las fotos, no solo el arena.
- 09-10-2026 (fase 3): medidas **aproximadas**, sin buscar fidelidad al 100 %; antes los detalles de la maqueta. Color **arena con los detalles en negro** (la ojiva, que es la carga, motores y bridas), aunque los del lote llevan la ojiva arena.

## Fuentes

Las de la nota (`## Fuentes`). Especificaciones, de la web del fabricante (https://wildhornets.com/en/sting-interceptor): máxima 280 km/h, crucero 140–170 km/h, techo operativo 0–5.000 m y máximo 7.000 m, alcance 37 km, radio con vuelta 18,5 km, autonomía 6 min a máxima velocidad y hasta 15 de crucero, carga 500 g, MTOW 4 ± 0,2 kg, batería 8s3p, mando ELRS, vídeo digital y analógico. **No publica longitud ni envergadura**: la escala de la maqueta tendrá que salir de fotos con algo de tamaño conocido.

### Fotos (copia de `arte/uas-fuentes/sting/FUENTES.md`)

Fotos en `full/` (25, 2,3 MB). Ninguna con licencia libre: uso autorizado por el usuario (ver Decisiones). Los vídeos de la web del fabricante no valen para modelar y no se guardan.

| Archivo (full/) | Qué enseña | Autor | URL |
|---|---|---|---|
| wh-web-vuelo.jpg | En vuelo estacionario, de frente, sobre girasoles: ojiva negra, banda arena, dos alas, brazos con motores y patas | Wild Hornets, web oficial | https://wildhornets.com/en/sting-interceptor |
| defender-oliva-mano.webp | Ejemplar verde oliva en la mano, de lado y por debajo: conector negro, clips amarillos y anillo oscuro en la cola | Wild Hornets, vía The Defender, ago. 2025 | https://thedefender.media/en/2025/08/dyki-shershni-showcased-sting-315-km-god/ |
| twz-dos-en-mano.jpg | Dos ejemplares sobre las palmas, de frente: uno arena con ojiva negra y otro arena y negro | Wild Hornets, vía TWZ, mar. 2026 | https://www.twz.com/news-features/ukrainian-companies-prohibited-from-exporting-shahed-interceptor-drones |
| u24-lote-arriba.jpg | Lote de ejemplares arena visto desde arriba: planta completa, logo STING impreso en el cuerpo y etiquetas blancas | United24 Media, ago. 2026 | https://united24media.com/war-in-ukraine/ukrainian-sting-interceptor-drone-sets-new-altitude-record-destroying-russian-uav-at-75-km-21806 |
| u24-lote-rack.jpg | Ejemplares arena en estantería, vistos desde arriba | United24 Media, abr. 2026 | https://united24media.com/latest-news/ukraine-sets-record-with-2000-km-remote-drone-control-from-abroad-18004 |
| u24-ficha-planta.jpg | Infografía con la planta del dron (render, no foto) y las cifras del fabricante | United24 Media, ago. 2026 | https://united24media.com/war-in-ukraine/ukrainian-sting-interceptor-drone-sets-new-altitude-record-destroying-russian-uav-at-75-km-21806 |
| devua-lateral-caja.jpg | Ejemplar sobre una caja, de lado, con el piloto de pie con gafas | Wild Hornets, vía dev.ua, jul. 2026 | https://dev.ua/en/news/perekhopliuvachamy-sting-1783597380 |
| devua-debajo-recorte.jpg | Ejemplar recortado sobre fondo verde, desde la cola: patas, brazos y hélices | Wild Hornets, vía dev.ua, ago. 2025 | https://dev.ua/en/news/kurbas-poliuie-na-shakhedy-1754046607 |
| militarnyi-prototipo-rotulos.jpg | Prototipo de 2024 sobre una caja, con rótulos Camera / Explosive payload / Quadcopter (baja resolución) | Wild Hornets, vía Militarnyi, may. 2025 | https://militarnyi.com/en/news/first-footage-appears-of-ukrainian-interceptor-drone-targeting-shahed/ |
| kyivpost-prototipo.jpg | Mismo prototipo de 2024 con flechas (baja resolución) | Wild Hornets, vía Kyiv Post, oct. 2024 | https://www.kyivpost.com/post/40882 |
| ie-render-frente.jpg | Render claro, de frente (a la derecha; a la izquierda, otro dron FPV) | Interesting Engineering, nov. 2025 | https://interestingengineering.com/military/ukraine-sting-interceptor-drone-russian-shaheds |
| tg3907-primer-plano.jpg | Primer plano del morro y la mitad del cuerpo: ojiva negra con anillo estriado, cinta de aluminio, cámara pequeña en la cola | Wild Hornets, Telegram, 5-dic-2025 | https://t.me/wild_hornets/3907 |
| tg4158-noche-lado.jpg | Ejemplar arena de lado, sobre una caja, de noche | 1020 ZRAP vía Wild Hornets, Telegram, 15-ene-2026 | https://t.me/wild_hornets/4158 |
| tg4567-furgoneta.jpg | Soldado sosteniendo un ejemplar arena, de lado | 208 ZRB vía Wild Hornets, Telegram, 28-abr-2026 | https://t.me/wild_hornets/4567 |
| tg4567-vuelo-abajo.jpg | En vuelo, visto desde abajo, con las hélices girando | 208 ZRB vía Wild Hornets, Telegram, 28-abr-2026 | https://t.me/wild_hornets/4567 |
| tg4595-campo-tres-cuartos.jpg | De pie en el campo, tres cuartos de frente desde arriba: ojiva tapada con cinta, brazos, cámara en la cola y hélices | 420 OBBpS «Hort» vía Wild Hornets, Telegram, 5-may-2026 | https://t.me/wild_hornets/4595 |
| tg4665-caja-lado.jpg | Sobre una caja, de lado, junto a un soldado | Horizon Group vía Wild Hornets, Telegram, 26-may-2026 | https://t.me/wild_hornets/4665 |
| tg4665-vuelo-frente.jpg | En vuelo, de frente y desde abajo | Horizon Group vía Wild Hornets, Telegram, 26-may-2026 | https://t.me/wild_hornets/4665 |
| tg4685-cuatro-manos.jpg | Varias personas con ejemplares en las manos, de varios colores | 422 OPBS vía Wild Hornets, Telegram, 28-may-2026 | https://t.me/wild_hornets/4685 |
| tg4991-grises-campo.jpg | Ejemplares grises o plateados de pie en el campo, de frente | Wild Hornets, Telegram, 1-sep-2026 | https://t.me/wild_hornets/4991 |
| tg5138-noche-pie.jpg | Ejemplar arena de pie, de noche, junto a un soldado | Maritime Recon vía Wild Hornets, Telegram, 8-oct-2026 | https://t.me/wild_hornets/5138 |
| tg5138-noche-arriba.jpg | Visto desde arriba, de noche, con el logo STING impreso en el cuerpo | Maritime Recon vía Wild Hornets, Telegram, 8-oct-2026 | https://t.me/wild_hornets/5138 |
| tg5098-oliva-manos.jpg | Soldado sosteniendo un ejemplar verde oliva con una hélice | El Español vía Wild Hornets, Telegram, 30-sep-2026 | https://t.me/wild_hornets/5098 |
| tg5098-oliva-mesa.jpg | Ejemplar verde oliva sobre una mesa de trabajo, con etiqueta de aviso en el cuerpo | El Español vía Wild Hornets, Telegram, 30-sep-2026 | https://t.me/wild_hornets/5098 |
| tg5098-vuelo-lejos.jpg | En vuelo, a lo lejos | El Español vía Wild Hornets, Telegram, 30-sep-2026 | https://t.me/wild_hornets/5098 |

### Leer la forma (de las fotos de `full/`)

- **Planta** (u24-lote-arriba, tg5138-noche-arriba, u24-ficha-planta): cuerpo cilíndrico de ancho constante con una ojiva delante; dos alas rectangulares, planas y cortas, una a cada lado, en la mitad trasera; detrás, dos brazos rectos hacia los lados, cada uno con un carenado redondeado en la punta; las patas y una cámara pequeña salen de la cola. En el lomo, el logo hexagonal y la palabra STING impresos.
- **Perfil** (devua-lateral-caja, tg4158-noche-lado, tg4665-caja-lado, tg4567-furgoneta): se posa de pie, con la ojiva arriba y las patas en el suelo; el cuerpo se estrecha en un cuello donde nacen los brazos.
- **Ojiva**: negra y mate, con un anillo estriado en la base (tg3907-primer-plano, defender-oliva-mano); en algunos ejemplares va tapada con cinta (tg4595-campo-tres-cuartos). Debajo, un tramo del cuerpo de otro color (banda arena en wh-web-vuelo).
- **Piezas pequeñas**: conector negro y tapa en el costado (defender-oliva-mano), clips amarillos y un anillo oscuro en la cola, cámara pequeña con objetivo redondo bajo el cuerpo (tg3907-primer-plano, tg5138-noche-arriba), etiquetas blancas en las alas y en el cuerpo, cinta de aluminio en algunos ejemplares.
- **Color**: tres acabados, de la misma forma. **Arena** (el más repetido: lotes de fábrica, de noche y en vuelo), **verde oliva** (con alas y brazos arena en algunos) y **gris plateado** (tg4991-grises-campo). Ojiva negra en casi todos. Colores medidos al aire libre, no a la luz de una exposición, pendientes de medir en la fase 3.
- **Visto y supuesto**: la planta, el perfil y las piezas anteriores se ven en varias fotos. **Por confirmar en la fase 3**: cómo salen los cuatro motores de los dos brazos (cuántos hay en cada punta y hacia dónde apuntan), la forma exacta de las patas y la escala. **No hay medidas oficiales**: el fabricante solo da 4 ± 0,2 kg de peso máximo al despegue, así que la escala saldrá de objetos de tamaño conocido en las fotos (manos, soldados, la caja de lanzamiento).

### Avión de las marcas

Elegido por Claude (el usuario lo dejó a su criterio): **ejemplar arena de lote de producción**, el más fotografiado y con vistas desde arriba, de frente, de lado y por debajo (u24-lote-arriba, twz-dos-en-mano, tg5138-noche-arriba, tg4567-vuelo-abajo, tg4158-noche-lado). Sus marcas: logo STING y hexágono en el lomo, etiquetas blancas en las alas. El verde oliva (defender-oliva-mano, tg5098-*) aporta los detalles de cerca. Si el usuario prefiere otro acabado, es una decisión de la fase 3.


### Medidas (fase 3)

Todo en diámetros del cuerpo (D), medido en las fotos de prensa, y D pasado a metros con personas:

| Medida | Valor | De dónde | Fotos |
|---|---|---|---|
| D (grueso del cuerpo) | ≈ 10 cm | Manos en la ojiva (tg4567-furgoneta, ~9 cm) y estatura de los soldados (tg4685, ~8 cm); redondeado a 10 por los 4 kg | 2 |
| Envergadura del ala | 3,67 D = 37 cm | u24-lote-arriba y twz-dos-en-mano (3,68 y 3,67 D) | 2 |
| Cuerda del ala | 0,7 D = 7 cm | u24 (corregida por la inclinación de la cámara) y twz | 2 |
| Del morro al borde de ataque | 1,85 D | Encaje de u24 y twz | 2 |
| Del eje al motor | 1,95 D = 19,5 cm | twz (1,92) y wh-web-vuelo (2,1) | 2 |
| Del morro a los brazos | 3,1 D | twz y encaje de u24 | 2 |
| Góndola y motor | Ø 0,48 y 0,42 D | u24-lote-arriba de cerca | 1 |
| Hélices | 7" (radio 8,9 cm), dos palas | Supuesto: radio ≈ 0,9 D en wh-web-vuelo y devua; dos palas en tg4595 | 2 |
| Varilla de los pies | 34 cm de punta a punta | tg4567-vuelo-abajo (1,7 D por lado) | 1 |

Encajes de cámara (`arte/uas-fuentes/sting/hd/ajustes/`): u24 (10 puntos, error medio 3,4 px, campo fijo a 14° porque suelto se iba a 3,7° y el visor no lo pintaba) y twz-a (9 puntos, 2,8 px). La medida de dev.ua no se usa: es un oliva de otra tanda (brazos y góndolas negros, raíl en el costado) y sale más corto.

### Motores y patas (confirmado en la fase 3)

- **Cuatro brazos en X, a 45° del plano de las alas, un motor en la punta de cada uno**, con el cono hacia el morro y el motor y la hélice detrás. Trazado en cinco fotos: tg4595 (de pie, tres cuartos: un brazo a cada lado y otro hacia la cámara), u24-lote-arriba (desde arriba los de abajo quedan tapados y solo asoman sus conos delante del ala), tg5098-oliva-mesa (igual), wh-web-vuelo y twz (dos góndolas fuera y dos dentro según el giro) y tg4567-vuelo-abajo (las cuatro; el mejor reparto de las 24 posibles es una X). No son dos motores por brazo.
- **Patas** (tercera vuelta, corregido por el usuario): **cuatro**, finas, en X como los brazos, cada una una chapa que baja del costado de la cola hasta un pie, sin travesaño. En wh-web-vuelo salen dos fuera y dos dentro por el mismo giro que los motores. (Las dos patas con travesaño de la segunda vuelta estaban mal.)
- **Cuerpo de la batería**: plano por el lado del logo, a lo largo (corrección del usuario: lo plano es el cuerpo, **no la ojiva**, que es redonda; se interpretó mal y se aplanó la ojiva). En el lote sin ojiva, el arco apuntado de u24 es donde ese plano corta la tapa redonda del cuerpo. Pitón en la punta de la ojiva.
- La varilla azul con dos bolas de madera de algunas fotos de campo (tg4567, twz, tg5098) no se sabe qué es y no está en el lote ni en wh-web-vuelo: **no se pone**.
- **Cámara** (corregida): FPV de caja negra con el objetivo y su aro claro, en la cola, entre los dos cierres, mirando hacia el lomo (tg3907, tg4595, u24).

## Registro

- 09-10-2026: la red del entorno estaba cerrada; el usuario la abrió y se pudo investigar.
- 09-10-2026: nota escrita con cada cifra enlazada a su fuente. Dato descartado por no comprobarse en la fuente que lo cita: los «213 mph» de Wikipedia (Kyiv Post dice 160 km/h). La primera interceptación desde un dron naval (Kyiv Independent, abril 2026) no nombra el Sting, así que no se usa; sí el MV11 con 18 Sting de TWZ (agosto 2026).
- 09-10-2026: vídeos de la web del fabricante (`videos/wh-*.mp4`): no valen para modelar (el dron sale como un punto lejano o es la vista térmica del que persigue).
- 09-10-2026: las fotos del Sting se ven en varios colores (verde oliva, arena y gris), con la misma forma: cuerpo en forma de bala con ojiva negra y banda, dos alas cortas rectangulares, dos brazos con motores y patas en la cola.
- 09-10-2026, fase 3: primera forma, encajada con u24 y twz (error medio 8 px). Corregido tras comparar: ojiva más alta (punta a 3,1 D de los brazos), ala con más cuerda y 1 cm más atrás (error a menos de 3 px); góndolas y motores más gordos, brazos de 3 cm, patas más robustas, cámara en su caja en el lomo y espiga de cola (de la foto del lote de cerca).
- 09-10-2026, fase 3: marcas, sobre la forma final: el logo del avispón y «STING» en relieve (calca `sting`, del color de la pintura algo más oscuro), la etiqueta blanca pequeña del lote a su izquierda y dos bridas negras por brazo. En las alas del lote no hay etiquetas (las grandes de tg5098 son del oliva): no se ponen.
- Visto y sin hacer: el relieve del lomo delante del logo (una tapa en punta de flecha con dos aletas junto a la ojiva) y el anillo de unión de cada brazo cerca del cuerpo (u24). Se pueden añadir si el usuario quiere más detalle.
- 09-10-2026, fase 3, revisión del usuario: logo con los trazos del SVG oficial (`wh_logosign_eng_-v3_yellow.svg` de wildhornets.com): el avispón tal cual y «STING» con sus letras S, T, I y N; la G, hecha como su O. Alas con perfil (`ala`) y la punta redondeada en las dos esquinas. Patas, cámara y antena rehechas; fuera la varilla con bolas. Juntas: aros con tornillos al final de la banda (z 0,157) y a la altura de los brazos, tira y aletas en flecha del lomo; ranura doble y conector negro en la panza; filas de tornillos en los costados.
- De pie: el dron se escribe tumbado y al final todo gira −90° sobre x (`girar` en cada pieza; calcas, costuras y chinchetas con `dePie`), sin tocar el visor. Ojo para la fase 4: la planta de la tira de la portada y la tarjeta salen ahora con el dron de pie (la planta, vista desde la ojiva); habrá que decidir allí.
- Los encajes de cámara de `hd/ajustes/` (u24, twz-a) están en los ejes tumbados: con el dron de pie ya no sirven tal cual.
- 09-10-2026, tercera vuelta: cuatro patas en X sin travesaño; ojiva y anillo con la cara plana (`casco` con `arriba` cortado) y el pitón; hélices negras (como en las fotos); bobinado cobrizo y tuerca en cada motor; capas de impresión (dibujo nuevo `capas`) en el cuerpo y las alas, para que no parezca de plástico liso.
- Motor y visor, ampliados (sin cambiar los demás drones): `girarLuego` en las piezas (un segundo giro tras `girar`: cada pata a su diagonal y después todo de pie) y `vista3d` en la maqueta (la vista «3D» con la que abre el visor; el Sting, [200, 8], de pie y por el lomo).
- Visto y sin hacer: los iconos de los botones de vista (Planta, Abajo, Perfil, Frente) se pintan con el dron de pie y se nombran como si estuviera tumbado; decidir en la fase 4 junto con la planta y la tarjeta.
- 09-10-2026, cuarta vuelta: ojiva redonda otra vez; el cuerpo, `casco` con la cara plana del logo (a 4 cm del eje). Fuera las capas de impresión (no le gustaron al usuario; dibujo `capas` quitado). Contra el «efecto maqueta»: cartelas entre el borde de salida del ala y el cuerpo (u24), cabeza en cada brida, hélices con torsión (`paso`), tornillos algo más grandes y oscuros. Lección: ante una indicación breve («la ojiva no es redonda»), preguntar a qué pieza se refiere si hay dos lecturas.
- 09-10-2026, quinta vuelta: cuerpo redondo otra vez (decisión del usuario, aunque en el lote sea plano por el lado del logo). Detalles: dos tonos de arena (`arena-st2` en alas, brazos y góndolas), cables negros del motor por cada brazo, estrías del anillo de la ojiva, roces en la cola (`desgaste`), cierres laterales y junta de la tapa de la batería. **Cartelas quitadas**: no se ven en ninguna foto (lo que se tomó por cartelas en u24 eran los brazos de abajo); el usuario lo marcó como inventado.
- 09-10-2026: **quitada la «antena»** de la punta de la cola (varilla gris): no se sabe qué es y, junto a la cámara, parecía un mechero. Decisión del usuario.
- 10-10-2026: el usuario no podía poner el dron «volando hacia la izquierda» girando con el ratón. Causa: `OrbitControls` deja siempre vertical el eje del mundo y no ladea la cámara, y el Sting está de pie, así que su eje largo sale siempre vertical. Arreglo (aprobado por el usuario: la vista Perfil y que la postura se mantenga al girar): el que gira es el dron, no la cámara. `posturaPerfil: { eje: "x", grados: 90 }` deshace el `dePie` solo en Perfil, con animación a la vez que viaja la cámara. El icono de Perfil se pinta tumbado. Las calcas y las chinchetas ya colgaban de `raiz` y giran con él. La luz HD sigue a la cámara con su altura fija, así que la sombra cae desde arriba como en vuelo. Los demás drones no cambian.
- 10-10-2026: tarjeta: se le enseñaron tres (de pie a 200°, 8°; en vuelo a 65°, 30° y a 80°, 24°). En vuelo salía pequeña: los brazos en X ocupan mucho alto. Eligió de pie. Para pintar tumbadas la tarjeta o la planta: `tarjetaEnVuelo` y `plantaEnVuelo` (`uas-miniatura-hd.ts`, que gira la raíz con las calcas ya montadas) y `--vuelo=si|no` en `arte/generar-uas-miniaturas-hd.mjs` para las pruebas.
- 10-10-2026: Frente salía por la tripa: de pie, el lomo (el logo) mira a −z y `frente` es [0, 0]. Campo nuevo `vistaFrente` en la maqueta (como `vista3d`).
- 10-10-2026, fase 4: medido en el luma de siete escalones del pixel: la arena al sol cae en 5,0 (borde: en Planta los brazos salían a franjas) y la cara del logo, en la vista 3D y Frente, en 2,45. No hay desfase que centre las dos (distan 2,55 escalones): 0,25 las deja a un cuarto del borde. Errores frente al HD: sol +7 % → +2 %, cara del logo −24 % → +15 %; a cambio, en 3D alas y cuerpo quedan en el mismo tono. Perfil medido en columna: el pixel sigue al HD escalón a escalón. Noche, logo y patas, bien.
