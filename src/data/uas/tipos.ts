// Lo que describe la maqueta de un dron para el visor (src/scripts/visor-uas.ts
// y src/components/VisorUAS.astro).
// Ejes: x hacia la punta del ala derecha, y hacia arriba, z hacia el morro.
// Unidades libres; `escala` dice cuántos metros es una unidad.

import type { Pais } from "../banderas";

type Punto3 = [number, number, number];
type Punto2 = [number, number];

// Acabado de una pieza: de qué color va (negro por defecto).
export type Acabado = "negro" | "negro-ua" | "gris" | "gris-et" | "gris-tr" | "gris-ga" | "metal" | "junta" | "mando" | "lente" | "amarillo" | "azul" | "oliva" | "rojo" | "rojo-vivo" | "blanco" | "hueco" | "crema-ir" | "laton" | "aluminio" | "ocre" | "hueso" | "cromato" | "gris-x10" | "azul-x10" | "gris-qs" | "arena-st" | "arena-st2";

export type Pieza = (
  // Cuerpo de revolución a lo largo de z: perfil de [z, radio], de delante atrás.
  // seccion: estira el corte [ancho x, alto y] (fuselajes más altos que anchos).
  // Cada punto admite dos números más, [z, radio, sube, alto]: sube (o baja,
  // en negativo) el eje en esa z, para un morro que cae por debajo del lomo;
  // y alto es el medio alto en esa z (el radio queda como medio ancho), para
  // un cuerpo que cambia de sección a lo largo. Las z no se repiten.
  | { tipo: "tubo"; id: string; perfil: (Punto2 | [number, number, number] | [number, number, number, number])[]; centro?: Punto2; seccion?: Punto2 }
  // Casco: un cuerpo hecho de secciones a lo largo de z, de delante atrás,
  // unidas con curvas suaves (bastan pocas secciones bien medidas). Cada
  // sección da, en esa z: el medio ancho, la y del lomo y la de la panza, la
  // y donde el cuerpo es más ancho (cintura; por defecto, a media altura) y
  // lo cuadrada que es la mitad de arriba y la de abajo (n: 2 es un óvalo;
  // más, más cuadrada; menos de 2, en punta). Un medio ancho 0 cierra en
  // punta (el morro, la cola). Sirve para fuselajes que no son redondos:
  // panza plana, costados rectos, lomo abombado. Con `panza` (medio ancho de
  // una panza plana), la mitad de abajo es un trapecio: una arista viva en la
  // cintura y una cara inclinada hasta la panza (el MQ-9). `arista` (0 a 0,9)
  // hace que la mitad de arriba llegue a la cintura ya inclinada hacia
  // arriba, y la arista marca más ángulo.
  // `abierto`: sin tapa delante (la sección de mayor z): un capó con la boca
  // de la toma de aire (el TB2).
  // `tomas`: tomas de aire sumergidas (ver `Toma`).
  // `suave`: con ensanche, cada mitad de la sección se suaviza como una sola
  // curva lisa (campana de ese ancho a lo largo de la curva; el borde y su
  // dirección no se mueven) y la arista entre las dos mitades va sin línea.
  // `polo`: donde el cuerpo acaba en un punto (el morro redondo del
  // Shahed), los vértices de la punta llevan la normal del eje; si no, cada
  // copia se inclina hacia su lado y la luz hace un hoyuelo.
  // `x`: el casco, desplazado a un lado del eje (una pieza que no va en el
  // centro, como los misiles bajo el ala del Wildfire).
  | { tipo: "casco"; id: string; secciones: Seccion[]; abierto?: boolean; tomas?: Toma[]; suave?: number; polo?: boolean; x?: number }
  // Placa plana con grosor. Horizontal: la planta va en [x, z] a la altura y.
  // Vertical: el contorno va en [z, y] en el costado x.
  // espejo: se repite al otro lado (x → −x).
  // simetrica (solo horizontal): la planta es media (x ≥ 0) y se completa con
  // su reflejo en una sola pieza. bisel: redondea los bordes.
  // inclinacion (solo vertical): grados que se tumba hacia fuera, girando
  // sobre la línea y = 0 del contorno (colas en V, winglets caídos).
  // y (solo vertical): sube la placa ya inclinada; así el giro se hace
  // alrededor del eje de un misil (aletas en X).
  | { tipo: "placa"; id: string; plano: "horizontal"; planta: Punto2[]; y: number; grosor: number; espejo?: boolean; simetrica?: boolean; bisel?: number }
  | { tipo: "placa"; id: string; plano: "vertical"; planta: Punto2[]; x: number; y?: number; grosor: number; espejo?: boolean; bisel?: number; inclinacion?: number }
  // Ala con perfil (grueso delante, afilado detrás), simétrica respecto a
  // x = 0. Estaciones de la raíz a la punta: [x, z del borde de ataque, z del
  // borde de salida, grosor máximo]. Dos estaciones seguidas en la misma x
  // hacen un escalón (el hueco de la hélice). Un quinto número opcional sube
  // la estación sobre y (el diedro: las puntas del Raven suben). Si la
  // primera estación no está en x = 0, salen dos piezas sueltas, una a cada
  // lado (las puntas de un ala en tres piezas, con su junta).
  // `sola`: solo esa mitad; `vertical`: colgando hacia abajo desde y (una
  // aleta o un soporte con perfil), en el costado `x` (con `espejo`, en los dos).
  // `raizDentro`: la primera estación está dentro de un cuerpo que la tapa
  // (el ensanche del TB2), y va sin tapa.
  | { tipo: "ala"; id: string; y: number; estaciones: ([number, number, number, number] | [number, number, number, number, number])[]; sola?: boolean; vertical?: boolean; x?: number; espejo?: boolean; raizDentro?: boolean }
  // Varilla recta (mástiles, antenas, brazos, patas).
  | { tipo: "varilla"; id: string; desde: Punto3; hasta: Punto3; radio: number; espejo?: boolean; lados?: number }
  // Codo: un tubo liso que sigue una curva por sus puntos (el cuello del
  // mástil del Vector, que sube y se dobla hacia delante; antenas de pulgar).
  // Cada punto: [x, y, z, ancho] o [x, y, z, ancho, alto]: medio ancho de la
  // sección hacia x (el costado) y medio alto en el otro sentido (hacia z si
  // el tubo sube, hacia y si va a lo largo); una sección oval da una pala
  // redonda. Un ancho 0 cierra en punta; si no, la punta va con tapa plana.
  | { tipo: "codo"; id: string; puntos: ([number, number, number, number] | [number, number, number, number, number])[]; espejo?: boolean }
  // Hélice: por defecto gira en el plano vertical (empuja a lo largo de z, como
  // la del MICH); con eje "y", en el horizontal (multirrotores).
  // espejo: se repite al otro lado (x → −x). giro: grados que se giran las
  // palas sobre su eje (0: la primera, tumbada hacia x).
  // ancho: cuerda máxima de la pala; con él, cada pala tiene forma (estrecha
  // en la raíz, más ancha a un tercio y con la punta redondeada) en vez de ser
  // una tabla.
  // buje: radio de la bola del centro (por defecto, una bola blanca algo
  // mayor que el arranque de las palas); 0, sin ella (el cono la tapa).
  // punta: palas anchas cerca de la raíz y afiladas hasta una punta (las de
  // plástico del Raven), en vez de redondeadas.
  // `forma`: planta propia de la pala, [t, delante, detrás] con t de 0 a 1
  // (fracción del radio) y los anchos en fracción de `ancho`. `tramo` [t0,
  // t1]: solo ese trozo de la pala (las puntas de otro color, como pieza
  // aparte). `inversa`: gira al revés (pala en espejo); con `espejo`, la del
  // otro lado sale además en espejo de esta.
  | { tipo: "helice"; id: string; en: Punto3; radio: number; palas: number; eje?: "z" | "y"; espejo?: boolean; giro?: number; ancho?: number; buje?: number; punta?: boolean; forma?: [number, number, number][]; tramo?: Punto2; inversa?: boolean; paso?: number }
  // Caja (cuerpos, sensores): centro y medidas [ancho x, alto y, largo z].
  // redondeo: radio de las esquinas vistas desde arriba (y bisel arriba y abajo).
  | { tipo: "caja"; id: string; centro: Punto3; tam: Punto3; espejo?: boolean; redondeo?: number }
  // Viga: un brazo o una pata hecha de secciones de seis lados (cara de
  // arriba, dos costados inclinados y cara de abajo) que se unen a lo largo
  // de una ruta. Cada punto: [x, y, z, ancho, alto], con y en el centro de
  // la sección; el ancho se mide horizontal y perpendicular a la ruta vista
  // desde arriba. `arriba` y `abajo` (por uno del ancho, 0,7 y 0,5 por
  // defecto) dan el ancho de las caras de arriba y de abajo, y `cintura`
  // (por uno del alto, 0,55) dónde es más ancha. Caras planas, sin suavizar.
  | { tipo: "viga"; id: string; ruta: [number, number, number, number, number][]; arriba?: number; abajo?: number; cintura?: number; espejo?: boolean }
  // Prisma: la planta [x, z] extruida entre y y y + alto, con el borde de
  // arriba y el de abajo achaflanados ([metido, caída], en horizontal y en
  // vertical). `simetrica`: la planta es media (x ≥ 0) y se completa.
  // Con `eje: "z"`, la planta es [x, y] y se extruye a lo largo de z, de `y`
  // a `y + alto` (`y` hace entonces de z): cajas vistas de frente.
  | { tipo: "prisma"; id: string; planta: Punto2[]; y: number; alto: number; chaflanArriba?: Punto2; chaflanAbajo?: Punto2; simetrica?: boolean; espejo?: boolean; eje?: "y" | "z" }
  // Pila: secciones horizontales (cada una, la planta [x, z] a su altura y,
  // todas con los mismos puntos) unidas con caras planas, de abajo arriba:
  // patas inclinadas que se afinan, piezas que bajan en vertical.
  | { tipo: "pila"; id: string; niveles: { y: number; planta: Punto2[] }[]; espejo?: boolean }
  // Disco plano (insignias): centro, hacia dónde mira, radio y grosor.
  // espejo: se repite al otro lado (x → −x, la normal también).
  | { tipo: "disco"; id: string; en: Punto3; normal: Punto3; radio: number; grosor: number; espejo?: boolean }
) & {
  acabado?: Acabado;
  // Girada `grados` alrededor de una recta paralela al eje dado que pasa por
  // `centro` (la caja del sensor de un gimbal sobre su eje de cabeceo).
  girar?: { centro: Punto3; eje: "x" | "y" | "z"; grados: number };
  // Un segundo giro, después de `girar` (el Sting: cada pata va girada hacia
  // su diagonal y después todo el dron se pone de pie).
  girarLuego?: { centro: Punto3; eje: "x" | "y" | "z"; grados: number };
};

// Detalle pintado del HD (docs/uas-hd.md), en las mismas unidades que las
// piezas. Una calca se proyecta sobre las piezas `sobre` desde la dirección
// `desde` (hacia fuera de la superficie), centrada en `en`, de `tam`
// [ancho, alto]; `giro` (grados) la gira en su plano. Una costura es una
// línea de panel: la polilínea `puntos`, llevada a la superficie desde
// `desde`; con `remaches`, un tornillo cada tantas unidades, o, con
// `enVertices`, uno en cada punto de la polilínea (una tapa: esquinas y
// centros de los lados). `espejo`
// repite la calca o la costura al otro lado (x → −x). `claro`: la línea y los
// tornillos, más claros que la pintura (en un dron negro, como el MICH-2000).
export type Dibujo =
  | { tipo: "escarapela" }
  // Escarapela ucraniana: disco amarillo con el centro azul (el MICH-2000).
  | { tipo: "escarapela-ua" }
  // Texto en una o dos líneas (separadas por «\n»), en tinta o en `color`;
  // `fino`: letra de palo normal en vez de la negrita ancha.
  | { tipo: "texto"; texto: string; color?: string; fino?: boolean }
  // Bandera turca, escarapela turca (roja, blanca y roja) y logo de Baykar
  // (el TB2).
  | { tipo: "bandera-tr" }
  | { tipo: "escarapela-tr" }
  | { tipo: "baykar" }
  // Placa de aviso: amarilla, con el borde rayado en negro y unas líneas.
  | { tipo: "aviso" }
  // Cartel blanco con la bandera iraní, «MADE IN I.R.IRAN» y «ساخت ایران»
  // (los winglets del Shahed-136 de Kermanshah) y una pegatina de código QR.
  // `pegatina`: solo la bandera, con «ساخت» y «ایران» a los lados del emblema
  // (la del morro del Shahed de Qom).
  | { tipo: "bandera-ir"; pegatina?: boolean }
  | { tipo: "qr" }
  | { tipo: "serie"; ano: string; numero: string }
  | { tipo: "disco"; color: string }
  | { tipo: "escudo" }
  // El Raven: un rectángulo de color (cinta adhesiva); dos flechas que se
  // miran a través de la junta de dos piezas (la junta es la línea vertical
  // del centro del dibujo); el disco «DDL»; una etiqueta blanca con código
  // de barras y líneas de texto (con `titulo`, una línea en negrita arriba,
  // como «CAUTION»), y la rejilla de nervios del costado.
  | { tipo: "rect"; color: string }
  // Cinta americana (duct tape): plateada, con la trama de tela y los cortes
  // de los extremos rasgados; con brillo de metal.
  | { tipo: "cinta" }
  | { tipo: "flechas"; color: string }
  | { tipo: "flecha"; color: string }
  | { tipo: "ddl"; color?: string }
  | { tipo: "etiqueta"; titulo?: string }
  | { tipo: "rejilla" }
  // Ranura alrededor de una tapa: un marco oscuro y fino.
  | { tipo: "marco" }
  // Ventana de cristal oscuro (el buscador del JSM): un trapecio con las
  // esquinas redondeadas; `abajo`, el ancho del borde de abajo respecto al de
  // arriba. Con brillo.
  | { tipo: "ventana"; abajo?: number }
  // Roce de una panza que aterriza en el suelo: rayas claras finas a lo largo
  // y alguna mancha; con poca tinta (en el pixel no sale).
  | { tipo: "desgaste" }
  // Logo de Skydio: la marca (un cuadrado partido por una curva, con una
  // punta arriba a la derecha y otra abajo a la izquierda) y «Skydio» debajo.
  | { tipo: "skydio"; color?: string }
  // Fibra de carbono: sarga de cuadros oscuros (la jaula del sensor del X10D).
  | { tipo: "carbono" }
  // Logo del Sting: el avispón del logo oficial de Wild Hornets y «STING»
  // pegado debajo, con su misma letra; en relieve, del color de la pintura.
  | { tipo: "sting"; color?: string };
export type Calca = { sobre: string[]; en: Punto3; desde: Punto3; tam: Punto2; giro?: number; dibujo: Dibujo; espejo?: boolean };
export type Costura = { sobre: string[]; puntos: Punto3[]; desde: Punto3; remaches?: number; enVertices?: boolean; espejo?: boolean; claro?: boolean };

// Una sección de un casco (ver arriba).
// Con `lomo` (su medio ancho) el cuerpo lleva encima un lomo más estrecho,
// fundido con él por un hombro suave: `arriba` es entonces lo alto del lomo y
// `hombro`, lo alto del cuerpo de debajo (el TB2). `pLomo` (8 por defecto):
// con menos, el empalme del lomo con el cuerpo es más ancho y suave (la
// góndola del Wildfire).
// Con `costado` (medio ancho del cuerpo), la sección lleva un ensanche fino
// hasta `ancho` a la altura de la cintura: la arista que corre por el costado
// y se convierte en la raíz del ala (el TB2). Por arriba, un empalme cóncavo
// sube del ensanche al costado del cuerpo hasta `sobreArista`; por abajo,
// otro baja hasta `bajoArista`. Sin ensanche (`ancho` igual a `costado`),
// el costado es recto entre esas dos alturas. `costadoArriba`: hasta dónde
// llega hacia dentro el empalme de arriba (por defecto, el costado); en la
// raíz del ala del TB2 sube hasta el pie del lomo, sin hombro.
// `bordeArriba` y `bordeAbajo`: el ensanche acaba con ese grueso (las caras
// de arriba y de abajo del perfil de la raíz del ala en esa z) en vez de en
// arista, y el ala sigue desde ahí sin escalón. `redondeo` (0 a 1,4): los
// empalmes, cóncavos con 0; con más, salen del borde ya inclinados y el
// ensanche se ve redondo (delante del ala del TB2, donde el borde de ataque
// se funde con el costado). `nariz`: el borde del ensanche, en vez de un
// filo, es media elipse de ese largo hacia dentro, del grueso que dan
// bordeArriba y bordeAbajo: un reborde redondo (delante del ala del TB2, el
// borde de ataque sigue así hacia el morro).
export type Seccion = { z: number; ancho: number; arriba: number; abajo: number; cintura?: number; n?: number; nAbajo?: number; pLomo?: number; panza?: number; arista?: number; lomo?: number; hombro?: number; nLomo?: number; costado?: number; costadoArriba?: number; sobreArista?: number; bajoArista?: number; bordeArriba?: number; bordeAbajo?: number; redondeo?: number; nariz?: number };

// Toma de aire en un casco (la del lomo del TB2): un hueco oval que se mete
// en el cuerpo, de `largo` (z) desde la `boca` hacia delante, con la pared
// de atrás recta (la entrada del conducto) en la boca y el frente
// redondeado; delante, una rampa poco honda que se estrecha hasta la `punta`
// (z); los bordes salen un poco (`ceja`). `x` e `y`, el centro del hueco en
// la boca, sobre la superficie (con x > 0, otra igual en espejo; con x = 0,
// una sola en el centro); `ancho`, su medio ancho ahí, y `hondo`, cuánto se
// mete.
export type Toma = { boca: number; largo: number; punta: number; x: number; y: number; ancho: number; hondo: number; ceja: number };

// Qué respalda lo que cuenta cada parte.
export type Respaldo = "foto" | "reconstruccion" | "fabricante";

export type Parte = {
  nombre: string;
  // Dónde se clava la chincheta.
  en: Punto3;
  // Piezas que se resaltan al elegirla.
  piezas: string[];
  respaldo: Respaldo;
  // Fuentes (por id) en las que se basa.
  fuentes: string[];
  texto: string;
  // Matiz sobre el respaldo (de qué foto sale, qué es supuesto).
  nota?: string;
  // Parte de la catapulta (ver `Maqueta.catapulta`): su chincheta solo sale
  // con ella puesta, y elegirla la pone.
  catapulta?: boolean;
};

export type Fuente = {
  id: string;
  // Miniatura en public/uas/<modelo>/fuentes/; sin ella es un artículo.
  imagen?: string;
  titulo: string;
  medio: string;
  url: string;
};

export type Maqueta = {
  nombre: string;
  subtitulo: string;
  // Con su chapa en pixel art, como las banderas de /luna y /marte.
  pais: Pais;
  piezas: Pieza[];
  partes: Parte[];
  fuentes: Fuente[];
  // Metros por unidad de la maqueta (para dibujar los drones a escala entre
  // sí, como en la tira del hangar). Aproximado si no hay medidas oficiales.
  escala: number;
  // Color de la parte elegida: blanco papel (por defecto, para drones
  // oscuros) o tinta (para drones claros, donde el blanco no se distingue).
  resalte?: "papel" | "tinta";
  // Versión 2.0 (docs/uas-hd.md): el modo Maqueta pinta el dron en HD, con
  // sus calcas y costuras.
  hd?: boolean;
  detalles?: { calcas: Calca[]; costuras: Costura[] };
  // Ángulo propio de la tarjeta de /uas: [acimut, elevación] en grados (si
  // no, el de todas, en arte/generar-uas-miniaturas-hd.mjs).
  vistaTarjeta?: [number, number];
  // Vista «3D» propia del visor (con la que abre): [acimut, elevación] en
  // grados, en vez de la de todos (el Sting, de pie y visto por el lomo).
  vista3d?: [number, number];
  // Pixel HD: cuánto se corren los escalones de luz (en escalones) para que
  // la pintura al sol caiga en el centro de uno (docs/uas-hd.md).
  desfaseLuz?: number;
  // La planta de la tira de la portada sin calcas ni costuras: a ese tamaño
  // las escarapelas del MICH-2000 salían como cuadrados.
  plantaLisa?: boolean;
  // Piezas que no salen en esa planta (id o prefijo «id-»): las palas finas
  // de un cuadricóptero, que a ese tamaño son píxeles sueltos.
  plantaSin?: string[];
  // Planta pintada al doble y reducida quedándose con el píxel más claro de
  // cada 2x2 (arte/generar-uas-miniaturas-hd.mjs): drones pequeños con piezas
  // finas, que a escala miden menos de un píxel.
  plantaDoble?: boolean;
  // Pixel HD con el contorno en tinta del HD (estilo C) además del de 1 px
  // de la pasada de pixel.
  contornoPixel?: boolean;
  // Catapulta o lanzador (el Shahed): piezas en los mismos ejes que el dron,
  // que el visor enseña con el botón «Catapulta». Al ponerla, todo se inclina
  // `cabeceo` grados morro arriba (el bastidor queda con las ruedas en el
  // suelo). No sale en las siluetas, las tarjetas ni las naves.
  catapulta?: { piezas: Pieza[]; cabeceo: number };
};
