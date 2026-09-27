// Lo que describe la maqueta de un dron para el visor (src/scripts/visor-uas.ts
// y src/components/VisorUAS.astro).
// Ejes: x hacia la punta del ala derecha, y hacia arriba, z hacia el morro.
// Unidades libres: las maquetas no tienen escala.

import type { Pais } from "../alunizajes";

type Punto3 = [number, number, number];
type Punto2 = [number, number];

// Acabado de una pieza: de qué color va (negro por defecto).
export type Acabado = "negro" | "gris" | "metal" | "junta" | "mando" | "lente" | "amarillo" | "azul";

export type Pieza = (
  // Cuerpo de revolución a lo largo de z: perfil de [z, radio], de delante atrás.
  // seccion: estira el corte [ancho x, alto y] (fuselajes más altos que anchos).
  | { tipo: "tubo"; id: string; perfil: Punto2[]; centro?: Punto2; seccion?: Punto2 }
  // Placa plana con grosor. Horizontal: la planta va en [x, z] a la altura y.
  // Vertical: el contorno va en [z, y] en el costado x.
  // espejo: se repite al otro lado (x → −x).
  // simetrica (solo horizontal): la planta es media (x ≥ 0) y se completa con
  // su reflejo en una sola pieza. bisel: redondea los bordes.
  // inclinacion (solo vertical): grados que se tumba hacia fuera, girando
  // sobre la línea y = 0 del contorno (colas en V, winglets caídos).
  | { tipo: "placa"; id: string; plano: "horizontal"; planta: Punto2[]; y: number; grosor: number; espejo?: boolean; simetrica?: boolean; bisel?: number }
  | { tipo: "placa"; id: string; plano: "vertical"; planta: Punto2[]; x: number; grosor: number; espejo?: boolean; bisel?: number; inclinacion?: number }
  // Ala con perfil (grueso delante, afilado detrás), simétrica respecto a
  // x = 0. Estaciones de la raíz a la punta: [x, z del borde de ataque, z del
  // borde de salida, grosor máximo]. Dos estaciones seguidas en la misma x
  // hacen un escalón (el hueco de la hélice).
  | { tipo: "ala"; id: string; y: number; estaciones: [number, number, number, number][] }
  // Varilla recta (mástiles, antenas, brazos, patas).
  | { tipo: "varilla"; id: string; desde: Punto3; hasta: Punto3; radio: number; espejo?: boolean }
  // Hélice: por defecto gira en el plano vertical (empuja a lo largo de z, como
  // la del MICH); con eje "y", en el horizontal (multirrotores).
  // espejo: se repite al otro lado (x → −x).
  | { tipo: "helice"; id: string; en: Punto3; radio: number; palas: number; eje?: "z" | "y"; espejo?: boolean }
  // Caja (cuerpos, sensores): centro y medidas [ancho x, alto y, largo z].
  // redondeo: radio de las esquinas vistas desde arriba (y bisel arriba y abajo).
  | { tipo: "caja"; id: string; centro: Punto3; tam: Punto3; espejo?: boolean; redondeo?: number }
  // Disco plano (insignias): centro, hacia dónde mira, radio y grosor.
  // espejo: se repite al otro lado (x → −x, la normal también).
  | { tipo: "disco"; id: string; en: Punto3; normal: Punto3; radio: number; grosor: number; espejo?: boolean }
) & { acabado?: Acabado };

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
};
