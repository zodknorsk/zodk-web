# Fase 2. Fuentes y fotos

Parte de `docs/nuevodron.md`, que se lee antes. Lo que pase con el dron, en su diario.

**Qué buscar**: fotos en alta del dron real **montado**, de **un avión
concreto** para las marcas, y de todos los ángulos: de perfil, desde arriba
(la planta), desde abajo, de frente, de detrás, y de cerca de las piezas
pequeñas (cámara, tren, tomas, mandos, armas). Si hay medidas oficiales
(ficha del fabricante o del ejército), se apuntan: dan la escala.

- Wikimedia Commons: mirar las categorías del dron (dominio público de los
  ejércitos, CC BY / CC BY-SA). Commons solo sirve miniaturas de tamaños
  fijos (1920, 3840) y corta con un 429 si se bajan originales seguidos:
  **bajar despacio**.
- Planos a escala de Commons (los de Alexpl): sirven para empezar, pero
  **pueden estar mal** (el del TB2 colocaba mal el ala y abría de más las
  vigas). Mandan las fotos. Un dibujo de tres vistas de una web
  («not to exact scale») es una ilustración: solo para confirmar piezas.
- Renders o dibujos que no se parecen: fuera. Si el dron **solo tiene
  renders** (aún no ha volado, como el Wildfire), se usan los originales del
  fabricante (las copias de otros medios son los mismos, peores).
- Si el usuario pasa fotos suyas, se guardan como `usuario-*` y se usan tal
  cual.
- Para elegir entre muchas, una hoja de contactos con ffmpeg (`tile=9x9`).

**Dónde se guardan** (fuera de Git): `arte/uas-fuentes/<slug>/`, con las
grandes en `full/` y un `FUENTES.md` (archivo, miniatura, qué enseña, autor
y licencia, URL). Si son muchas, un `indice.json`. La tabla se copia al
diario del dron.

**Leer la forma** antes de modelar, y apuntarlo en el diario: planta,
perfil, dónde va cada pieza, **el color real** (de fotos al aire libre: con
la luz cálida de una exposición, un gris parece beige), y qué se ve y qué es
supuesto.

**Una foto puede engañar**: en vuelo, un ala tapa el pilón; desde un lado,
una pieza central parece ladeada; con gran angular, los bordes se deforman;
en un dron colgado o apoyado, el ala se dobla. **Cada medida, con otra foto.**
