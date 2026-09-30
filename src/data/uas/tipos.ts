// Lo que describe la maqueta de un dron para el visor (src/scripts/visor-uas.ts
// y src/components/VisorUAS.astro).
// Ejes: x hacia la punta del ala derecha, y hacia arriba, z hacia el morro.
// Unidades libres: las maquetas no tienen escala.

import type { Pais } from "../banderas";

type Punto3 = [number, number, number];
type Punto2 = [number, number];

// Acabado de una pieza: de qué color va (negro por defecto).
export type Acabado = "negro" | "gris" | "gris-et" | "metal" | "junta" | "mando" | "lente" | "amarillo" | "azul" | "oliva" | "rojo" | "blanco";

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
  | { tipo: "casco"; id: string; secciones: Seccion[] }
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
  | { tipo: "ala"; id: string; y: number; estaciones: ([number, number, number, number] | [number, number, number, number, number])[]; sola?: boolean; vertical?: boolean; x?: number; espejo?: boolean }
  // Varilla recta (mástiles, antenas, brazos, patas).
  | { tipo: "varilla"; id: string; desde: Punto3; hasta: Punto3; radio: number; espejo?: boolean }
  // Hélice: por defecto gira en el plano vertical (empuja a lo largo de z, como
  // la del MICH); con eje "y", en el horizontal (multirrotores).
  // espejo: se repite al otro lado (x → −x). giro: grados que se giran las
  // palas sobre su eje (0: la primera, tumbada hacia x).
  | { tipo: "helice"; id: string; en: Punto3; radio: number; palas: number; eje?: "z" | "y"; espejo?: boolean; giro?: number }
  // Caja (cuerpos, sensores): centro y medidas [ancho x, alto y, largo z].
  // redondeo: radio de las esquinas vistas desde arriba (y bisel arriba y abajo).
  | { tipo: "caja"; id: string; centro: Punto3; tam: Punto3; espejo?: boolean; redondeo?: number }
  // Disco plano (insignias): centro, hacia dónde mira, radio y grosor.
  // espejo: se repite al otro lado (x → −x, la normal también).
  | { tipo: "disco"; id: string; en: Punto3; normal: Punto3; radio: number; grosor: number; espejo?: boolean }
) & { acabado?: Acabado };

// Detalle pintado del HD (docs/uas-hd.md), en las mismas unidades que las
// piezas. Una calca se proyecta sobre las piezas `sobre` desde la dirección
// `desde` (hacia fuera de la superficie), centrada en `en`, de `tam`
// [ancho, alto]; `giro` (grados) la gira en su plano. Una costura es una
// línea de panel: la polilínea `puntos`, llevada a la superficie desde
// `desde`; con `remaches`, un tornillo cada tantas unidades, o, con
// `enVertices`, uno en cada punto de la polilínea (una tapa: esquinas y
// centros de los lados). `espejo`
// repite la calca o la costura al otro lado (x → −x).
export type Dibujo =
  | { tipo: "escarapela" }
  | { tipo: "texto"; texto: string }
  | { tipo: "serie"; ano: string; numero: string }
  | { tipo: "disco"; color: string }
  | { tipo: "franja"; color: string }
  | { tipo: "escudo" };
export type Calca = { sobre: string[]; en: Punto3; desde: Punto3; tam: Punto2; giro?: number; dibujo: Dibujo; espejo?: boolean };
export type Costura = { sobre: string[]; puntos: Punto3[]; desde: Punto3; remaches?: number; enVertices?: boolean; espejo?: boolean };

// Una sección de un casco (ver arriba).
export type Seccion = { z: number; ancho: number; arriba: number; abajo: number; cintura?: number; n?: number; nAbajo?: number; panza?: number; arista?: number };

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
};
