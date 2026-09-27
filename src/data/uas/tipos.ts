// Lo que describe la maqueta de un dron para el visor (src/scripts/visor-uas.ts
// y src/components/VisorUAS.astro).
// Ejes: x hacia la punta del ala derecha, y hacia arriba, z hacia el morro.
// Unidades libres: las maquetas no tienen escala.

import type { Pais } from "../alunizajes";

type Punto3 = [number, number, number];
type Punto2 = [number, number];

// Acabado de una pieza: de qué color va (negro por defecto).
export type Acabado = "negro" | "metal" | "junta" | "mando" | "amarillo" | "azul";

export type Pieza = (
  // Cuerpo de revolución a lo largo de z: perfil de [z, radio], de delante atrás.
  | { tipo: "tubo"; id: string; perfil: Punto2[]; centro?: Punto2 }
  // Placa plana con grosor. Horizontal: la planta va en [x, z] a la altura y.
  // Vertical: el contorno va en [z, y] en el costado x.
  // espejo: se repite al otro lado (x → −x).
  | { tipo: "placa"; id: string; plano: "horizontal"; planta: Punto2[]; y: number; grosor: number; espejo?: boolean }
  | { tipo: "placa"; id: string; plano: "vertical"; planta: Punto2[]; x: number; grosor: number; espejo?: boolean }
  // Ala con perfil (grueso delante, afilado detrás), simétrica respecto a
  // x = 0. Estaciones de la raíz a la punta: [x, z del borde de ataque, z del
  // borde de salida, grosor máximo]. Dos estaciones seguidas en la misma x
  // hacen un escalón (el hueco de la hélice).
  | { tipo: "ala"; id: string; y: number; estaciones: [number, number, number, number][] }
  // Varilla recta (mástiles, antenas).
  | { tipo: "varilla"; id: string; desde: Punto3; hasta: Punto3; radio: number }
  // Hélice mirando a lo largo de z.
  | { tipo: "helice"; id: string; en: Punto3; radio: number; palas: number }
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
};
