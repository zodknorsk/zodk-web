// Amartizajes con chapa sobre el Marte de /marte. Como las chapas de /luna:
// la bandera del país en pixel art (svgBandera de alunizajes.ts), en su sitio
// exacto y a cualquier zoom (a ×1 son lo único que sale). Al pasar el ratón
// (o con un toque en el móvil), su ficha.
//
// Una chapa por cada intento que llegó a la superficie, bueno o fallido. Las
// que no llegaron enteras (`llego: false`) van en blanco y negro.
//
// La ficha: título, bandera, país, año y qué era; tres filas, Lugar, Fecha y
// Estado; y una descripción breve (la entradilla de su nota en la bóveda).
// `lugar` es el accidente con nombre que sale a su lado en el mapa
// (arte/generar-nombres.py).
//
// Las notas están en la bóveda, en 02 - Temas/mars-project (Soft Landings y
// Hard Landings). La chapa enlaza a /notas/<nota> solo si está publicada
// (`publicar: true`); si no, es solo la ficha.

import { PAISES_LUNA, type Pais } from "./alunizajes";

// Las banderas de /luna (EE. UU., URSS, China) y dos más que en la Luna no
// hacen falta. Van aparte para no salir en la columna de países de /luna.
export const PAISES_MARTE: Pais[] = [
  ...PAISES_LUNA,
  {
    codigo: "GB",
    nombre: "Reino Unido",
    bandera: "🇬🇧",
    filas: ["wbbbwrwbbbw", "bwbbwrwbbwb", "wwwwwrwwwww", "rrrrrrrrrrr",
            "wwwwwrwwwww", "bwbbwrwbbwb", "wbbbwrwbbbw"],
    paleta: { b: "#012169", w: "#f4f4f4", r: "#c8102e" },
  },
  {
    // La ESA: bandera europea, el círculo de estrellas en pixel art.
    codigo: "EU",
    nombre: "ESA (Europa)",
    bandera: "🇪🇺",
    filas: ["bbbbbybbbbb", "bbbybbbybbb", "bbbbbbbbbbb", "bbybbbbbybb",
            "bbbbbbbbbbb", "bbbybbbybbb", "bbbbbybbbbb"],
    paleta: { b: "#003399", y: "#ffcc00" },
  },
];

export interface Amartizaje {
  nombre: string;
  pais: string; // codigo de PAISES_MARTE (la bandera)
  quien: string; // cómo sale el país en la ficha ("URSS" con la bandera rusa)
  anio: number;
  tipo: string; // qué era: róver, módulo fijo…
  lat: number; // grados; norte +
  lon: number; // grados; este +
  llego: boolean; // false: se estrelló o se perdió al bajar
  lugar: string;
  fecha: string;
  estado: string;
  texto: string;
  nota: string; // slug de su nota en el blog (/notas/<nota>)
  // Foto de la ficha, en public/amartizajes/ (la misma que en la nota de la
  // bóveda). Criterio: la nave en Marte si hay foto;
  // si no, lo que vio al llegar; si no, la nave desde órbita, una maqueta o
  // un dibujo. De Wikimedia Commons; si la licencia pide citar, `credito`.
  foto: string;
  fotoPos?: string; // object-position del recorte cuadrado, si no va centrado
  credito?: string;
  // Px de pantalla a la derecha de su sitio a ×1, que crecen con el zoom:
  // para dos chapas en el mismo sitio (Ingenuity bajó dentro de Perseverance).
  separa?: number;
}

// Sitios: los de aterrizaje publicados por cada agencia (NASA NSSDC y las
// misiones); los de Mars 2 y Mars Polar Lander son aproximados.
export const AMARTIZAJES: Amartizaje[] = [
  // --- URSS ------------------------------------------------------------------
  { nombre: "Mars 2", pais: "RU", quien: "URSS", anio: 1971, tipo: "módulo de descenso",
    lat: 4, lon: -47, llego: false,
    lugar: "Nanedi Valles (aprox.)", fecha: "27 nov 1971", estado: "se estrelló",
    texto: "El primer objeto humano que tocó Marte: llegó estrellándose.", nota: "mars-2-1971", foto: "mars-2-1971.jpg", credito: "maqueta del módulo (igual que el de Mars 3), VDNKh, Moscú · foto: Alexxx1979, CC BY-SA 4.0" },
  { nombre: "Mars 3", pais: "RU", quien: "URSS", anio: 1971, tipo: "módulo de descenso",
    lat: -45.04, lon: -157.98, llego: true,
    lugar: "cráter Ptolemaeus", fecha: "2 dic 1971", estado: "silencio a los 20 s",
    texto: "Primer amartizaje suave de la historia: transmitió unos segundos y se calló.", nota: "mars-3-1971", foto: "mars-3-1971.jpg" },
  { nombre: "Mars 6", pais: "RU", quien: "URSS", anio: 1974, tipo: "módulo de descenso",
    lat: -23.90, lon: -19.42, llego: false,
    lugar: "Samara Valles", fecha: "12 mar 1974", estado: "se perdió al bajar",
    texto: "Transmitió durante toda la bajada y se calló justo al llegar al suelo.", nota: "mars-6-1974", foto: "mars-6-1974.jpg" },
  // --- EE. UU. ---------------------------------------------------------------
  { nombre: "Viking 1", pais: "US", quien: "EE. UU.", anio: 1976, tipo: "módulo fijo",
    lat: 22.27, lon: -47.95, llego: true,
    lugar: "Chryse Planitia", fecha: "20 jul 1976", estado: "fin en 1982 (6 años)",
    texto: "El primer aterrizaje que funcionó de verdad, y las primeras fotos desde la superficie de Marte.", nota: "viking-1-1976", foto: "viking-1-1976.jpg", fotoPos: "90% 50%" },
  { nombre: "Viking 2", pais: "US", quien: "EE. UU.", anio: 1976, tipo: "módulo fijo",
    lat: 47.64, lon: 134.29, llego: true,
    lugar: "Utopia Planitia", fecha: "3 sep 1976", estado: "fin en 1980 (3 años)",
    texto: "La gemela de Viking 1, posada en Utopia Planitia.", nota: "viking-2-1976", foto: "viking-2-1976.jpg" },
  { nombre: "Mars Pathfinder", pais: "US", quien: "EE. UU.", anio: 1997, tipo: "módulo y róver",
    lat: 19.13, lon: -33.22, llego: true,
    lugar: "Ares Vallis", fecha: "4 jul 1997", estado: "fin en 1997 (3 meses)",
    texto: "Aterrizó a botes con airbags y llevaba a Sojourner, el primer róver que rodó por Marte.", nota: "mars-pathfinder-1997", foto: "mars-pathfinder-1997.jpg" },
  { nombre: "Mars Polar Lander", pais: "US", quien: "EE. UU.", anio: 1999, tipo: "módulo fijo",
    lat: -76.57, lon: 165.2, llego: false,
    lugar: "Ultimi Scopuli (aprox.)", fecha: "3 dic 1999", estado: "se perdió al bajar",
    texto: "Iba a posarse cerca del polo sur; se calló al empezar la bajada y nunca más se supo de él.", nota: "mars-polar-lander-1999", foto: "mars-polar-lander-1999.jpg" },
  { nombre: "Spirit", pais: "US", quien: "EE. UU.", anio: 2004, tipo: "róver",
    lat: -14.57, lon: 175.47, llego: true,
    lugar: "cráter Gusev", fecha: "4 ene 2004", estado: "fin en 2010 (6 años)",
    texto: "Róver gemelo de Opportunity: iba a durar tres meses y duró seis años.", nota: "spirit-2004", foto: "spirit-2004.jpg" },
  { nombre: "Opportunity", pais: "US", quien: "EE. UU.", anio: 2004, tipo: "róver",
    lat: -1.95, lon: -5.53, llego: true,
    lugar: "Meridiani Planum", fecha: "25 ene 2004", estado: "fin en 2018 (14 años)",
    texto: "Aguantó casi quince años y llegó hasta el cráter Endeavour; lo apagó una tormenta de polvo.", nota: "opportunity-2004", foto: "opportunity-2004.jpg" },
  { nombre: "Phoenix", pais: "US", quien: "EE. UU.", anio: 2008, tipo: "módulo fijo",
    lat: 68.22, lon: -125.75, llego: true,
    lugar: "Scandia Colles", fecha: "25 may 2008", estado: "fin en 2008 (5 meses)",
    texto: "Se posó en las llanuras del norte y tocó hielo de agua con su pala.", nota: "phoenix-2008", foto: "phoenix-2008.jpg" },
  { nombre: "Curiosity", pais: "US", quien: "EE. UU.", anio: 2012, tipo: "róver",
    lat: -4.59, lon: 137.44, llego: true,
    lugar: "cráter Gale", fecha: "6 ago 2012", estado: "en marcha",
    texto: "Bajado con una grúa voladora: demostró que Gale fue un lago y ahora sube el monte Sharp.", nota: "curiosity-2012", foto: "curiosity-2012.jpg" },
  { nombre: "InSight", pais: "US", quien: "EE. UU.", anio: 2018, tipo: "módulo fijo",
    lat: 4.50, lon: 135.62, llego: true,
    lugar: "Elysium Planitia", fecha: "26 nov 2018", estado: "fin en 2022 (4 años)",
    texto: "El sismógrafo de Marte: escuchó más de mil terremotos y midió el planeta por dentro.", nota: "insight-2018", foto: "insight-2018.jpg" },
  { nombre: "Perseverance", pais: "US", quien: "EE. UU.", anio: 2021, tipo: "róver",
    lat: 18.44, lon: 77.45, llego: true,
    lugar: "cráter Jezero", fecha: "18 feb 2021", estado: "en marcha",
    texto: "Guarda muestras de roca de un antiguo lago para que algún día vuelvan a la Tierra.", nota: "perseverance-2021", foto: "perseverance-2021.jpg", fotoPos: "80% 50%" },
  // Ingenuity bajó colgado de Perseverance: a ×1, las dos chapas pegadas, y
  // se separan al acercar.
  { nombre: "Ingenuity", pais: "US", quien: "EE. UU.", anio: 2021, tipo: "helicóptero",
    lat: 18.44, lon: 77.45, llego: true, separa: 20,
    lugar: "cráter Jezero", fecha: "18 feb 2021", estado: "fin en 2024 (72 vuelos)",
    texto: "El primer vuelo a motor en otro planeta: despegó el 19 de abril de 2021.", nota: "ingenuity-2021", foto: "ingenuity-2021.jpg" },
  // --- Reino Unido y Europa --------------------------------------------------
  { nombre: "Beagle 2", pais: "GB", quien: "Reino Unido", anio: 2003, tipo: "módulo fijo",
    lat: 11.53, lon: 90.43, llego: true,
    lugar: "Isidis Planitia", fecha: "25 dic 2003", estado: "se posó, sin señal",
    texto: "Llegó entero el día de Navidad, pero dos paneles sin abrir le taparon la antena y nunca llegó a hablar.", nota: "beagle-2-2003", foto: "beagle-2-2003.jpg", credito: "réplica · foto: geni, CC BY-SA 4.0" },
  { nombre: "Schiaparelli", pais: "EU", quien: "ESA", anio: 2016, tipo: "módulo de prueba",
    lat: -2.05, lon: -6.21, llego: false,
    lugar: "cráter Miyamoto", fecha: "19 oct 2016", estado: "se estrelló",
    texto: "Encendió los retrocohetes demasiado pronto y cayó desde casi cuatro kilómetros.", nota: "schiaparelli-2016", foto: "schiaparelli-2016.jpg", credito: "maqueta en el ESOC · foto: Gerbil, CC BY-SA 4.0" },
  // --- China -----------------------------------------------------------------
  { nombre: "Zhurong", pais: "CN", quien: "China", anio: 2021, tipo: "róver",
    lat: 25.07, lon: 109.93, llego: true,
    lugar: "Utopia Planitia", fecha: "15 may 2021", estado: "sin despertar desde 2022",
    texto: "El primer amartizaje de China: el róver se durmió en el invierno de 2022 y no volvió a despertar.", nota: "zhurong-2021", foto: "zhurong-2021.jpg", credito: "foto: CNSA / China News Service, CC BY 4.0" },
];
