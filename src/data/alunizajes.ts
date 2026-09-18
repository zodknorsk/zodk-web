// Alunizajes con chapa sobre la Luna de /luna. Una chapa por misión que SÍ se
// posó (los intentos que se estrellaron o no llegaron no entran: Chandrayaan-2,
// Peregrine, IM-2 y Beresheet). Al pasar el ratón por una chapa se despliega su
// ficha, con el mismo estilo que las de las naves y los países de la portada.
//
// La chapa es la bandera del país en pixel art, con el mismo formato que las de
// la Tierra (11x7 celdas + contorno de 1 px; ver BANDERAS en
// logo-files/generar-planeta-hero.py). Aquí van las filas porque la Luna en
// reposo es un PNG fijo y las chapas se pintan encima con el DOM, no dentro del
// dibujo como en la Tierra.
//
// Cada nota de la bóveda está en 02 - Temas/moon-project (boveda-osint).
// Detalle y decisiones en logo-files/LUNA-WIP.md.

export interface Pais {
  codigo: string;
  nombre: string;
  bandera: string; // emoji, para la columna y la ficha
  filas: string[]; // 7 filas de 11 letras de `paleta`
  paleta: Record<string, string>;
}

export interface Alunizaje {
  nombre: string;
  pais: string; // codigo de PAISES_LUNA
  anio: number;
  lat: number; // grados; norte +
  lon: number; // grados; este +
  foto: string; // en public/alunizajes/
  texto: string;
}

export const PAISES_LUNA: Pais[] = [
  {
    codigo: "US",
    nombre: "EE. UU.",
    bandera: "🇺🇸",
    // La misma bandera que lleva EE. UU. en la Tierra (BAND_PAL "US").
    filas: ["BwBwBuuuuuu", "BBBBBwwwwww", "BwBwBuuuuuu", "BBBBBwwwwww",
            "uuuuuuuuuuu", "wwwwwwwwwww", "uuuuuuuuuuu"],
    paleta: { u: "#b82638", w: "#f4f4f0", B: "#333d74" },
  },
  {
    codigo: "RU",
    nombre: "Rusia (URSS)",
    bandera: "🇷🇺",
    // Tricolor a partes iguales (2/3/2 de las 7 filas). Se usa la bandera rusa
    // porque Unicode no tiene una de la URSS que se pinte en la mayoría de
    // sistemas (saldría "SU" en una cajita).
    filas: ["wwwwwwwwwww", "wwwwwwwwwww", "zzzzzzzzzzz", "zzzzzzzzzzz",
            "zzzzzzzzzzz", "vvvvvvvvvvv", "vvvvvvvvvvv"],
    paleta: { w: "#f4f4f4", z: "#0039a6", v: "#d52b1e" },
  },
  {
    codigo: "CN",
    nombre: "China",
    bandera: "🇨🇳",
    // Estrella grande (bloque 2x2) y las cuatro pequeñas en arco a su derecha,
    // compactas arriba a la izquierda, como el cantón real.
    filas: ["rrrrsrrrrrr", "rssrrsrrrrr", "rssrrrrrrrr", "rrrrrsrrrrr",
            "rrrrsrrrrrr", "rrrrrrrrrrr", "rrrrrrrrrrr"],
    paleta: { r: "#c8102e", s: "#f4c430" },
  },
  {
    codigo: "IN",
    nombre: "India",
    bandera: "🇮🇳",
    filas: ["ooooooooooo", "ooooooooooo", "wwwwwCwwwww", "wwwwwCwwwww",
            "wwwwwwwwwww", "ggggggggggg", "ggggggggggg"],
    paleta: { o: "#ff9933", w: "#f4f4f4", g: "#138808", C: "#000080" },
  },
  {
    codigo: "JP",
    nombre: "Japón",
    bandera: "🇯🇵",
    filas: ["wwwwwwwwwww", "wwwwHHHwwww", "wwwHHHHHwww", "wwwHHHHHwww",
            "wwwHHHHHwww", "wwwwHHHwwww", "wwwwwwwwwww"],
    paleta: { w: "#f4f4f4", H: "#bc002d" },
  },
];

export const ALUNIZAJES: Alunizaje[] = [
  // --- EE. UU.: programa Apolo (tripulados) --------------------------------
  { nombre: "Apolo 11", pais: "US", anio: 1969, lat: 0.674, lon: 23.473, foto: "apolo-11.jpg",
    texto: "El módulo lunar Eagle alunizó el 20 de julio de 1969 en el Mar de la Tranquilidad. Neil Armstrong fue el primer ser humano en pisar la Luna." },
  { nombre: "Apolo 12", pais: "US", anio: 1969, lat: -3.0125, lon: -23.4214, foto: "apolo-12.jpg",
    texto: "Alunizó el 19 de noviembre de 1969 en el Océano de las Tormentas, a 180 metros de la sonda Surveyor 3 (1967), de la que se trajeron piezas." },
  { nombre: "Apolo 14", pais: "US", anio: 1971, lat: -3.6453, lon: -17.4714, foto: "apolo-14.jpg",
    texto: "Alunizó el 5 de febrero de 1971 en Fra Mauro. Alan Shepard, primer estadounidense en el espacio, golpeó dos pelotas de golf antes de volver." },
  { nombre: "Apolo 15", pais: "US", anio: 1971, lat: 26.1008, lon: 3.6527, foto: "apolo-15.jpg",
    texto: "Alunizó el 30 de julio de 1971 en Hadley-Apenino. Primera misión en usar el rover lunar (LRV) para alejarse del módulo." },
  { nombre: "Apolo 16", pais: "US", anio: 1972, lat: -8.9731, lon: 15.5, foto: "apolo-16.jpg",
    texto: "Alunizó el 21 de abril de 1972 en las tierras altas de Descartes, el primer alunizaje en tierras altas lunares." },
  { nombre: "Apolo 17", pais: "US", anio: 1972, lat: 20.1642, lon: 30.7658, foto: "apolo-17.jpg",
    texto: "Alunizó el 11 de diciembre de 1972 en Taurus-Littrow. Última misión tripulada a la Luna hasta hoy." },

  // --- EE. UU.: privados (programa CLPS de la NASA) ------------------------
  { nombre: "IM-1 · Odysseus", pais: "US", anio: 2024, lat: -80.13, lon: 1.44, foto: "im1-odysseus.jpg",
    texto: "Alunizó el 22 de febrero de 2024 cerca del cráter Malapert A: primer alunizaje privado de la historia y el primero de EE. UU. desde el Apolo 17. Acabó apoyado de lado." },
  { nombre: "Blue Ghost", pais: "US", anio: 2025, lat: 18.56, lon: 61.81, foto: "blue-ghost.jpg",
    texto: "Alunizó el 2 de marzo de 2025 en el Mar de las Crisis: el primer alunizaje privado completamente redondo, derecho y operando un día lunar entero." },

  // --- URSS: programa Luna (todas no tripuladas) ---------------------------
  { nombre: "Luna 9", pais: "RU", anio: 1966, lat: 7.03, lon: -64.33, foto: "luna-9.jpg",
    texto: "Alunizó el 3 de febrero de 1966: primer alunizaje suave de la historia, con las primeras fotos panorámicas desde la superficie lunar." },
  { nombre: "Luna 16", pais: "RU", anio: 1970, lat: -0.5137, lon: 56.3638, foto: "luna-16.jpg",
    texto: "Alunizó el 20 de septiembre de 1970: primera sonda no tripulada en traer muestras lunares a la Tierra (101 g)." },
  { nombre: "Luna 17", pais: "RU", anio: 1970, lat: 38.28, lon: -35.0, foto: "luna-17.jpg",
    texto: "Alunizó el 17 de noviembre de 1970 y desplegó el Lunojod 1, el primer vehículo con ruedas en otro cuerpo celeste." },
  { nombre: "Luna 20", pais: "RU", anio: 1972, lat: 3.7863, lon: 56.6242, foto: "luna-20.jpg",
    texto: "Alunizó el 21 de febrero de 1972 y trajo muestras de tierras altas, cerca de donde ya lo había hecho Luna 16." },
  { nombre: "Luna 21", pais: "RU", anio: 1973, lat: 25.85, lon: 30.45, foto: "luna-21.jpg",
    texto: "Alunizó el 15 de enero de 1973 y desplegó el Lunojod 2, que recorrió 39 km en cuatro meses." },
  { nombre: "Luna 24", pais: "RU", anio: 1976, lat: 12.7145, lon: 62.2097, foto: "luna-24.jpg",
    texto: "Alunizó el 18 de agosto de 1976: última misión del programa Luna y última en traer muestras hasta la Chang'e 5 en 2020." },

  // --- China: programa Chang'e (4 y 6, en la cara oculta) ------------------
  { nombre: "Chang'e 3", pais: "CN", anio: 2013, lat: 44.1214, lon: -19.5116, foto: "change-3.jpg",
    texto: "Alunizó el 14 de diciembre de 2013: primer alunizaje lunar chino, con el róver Yutu." },
  { nombre: "Chang'e 4", pais: "CN", anio: 2019, lat: -45.444, lon: 177.599, foto: "change-4.jpg",
    texto: "Alunizó el 3 de enero de 2019 en la cara oculta de la Luna: primer alunizaje de la historia ahí, con el róver Yutu-2." },
  { nombre: "Chang'e 5", pais: "CN", anio: 2020, lat: 43.0576, lon: -51.9161, foto: "change-5.jpg",
    texto: "Alunizó el 1 de diciembre de 2020: primera misión china en traer muestras lunares a la Tierra (casi 2 kg)." },
  { nombre: "Chang'e 6", pais: "CN", anio: 2024, lat: -41.64, lon: 206.01, foto: "change-6.jpg",
    texto: "Alunizó el 2 de junio de 2024 en la cara oculta: primeras muestras traídas de esa cara de la Luna." },

  // --- India y Japón -------------------------------------------------------
  { nombre: "Chandrayaan-3", pais: "IN", anio: 2023, lat: -69.373, lon: 32.319, foto: "chandrayaan-3.jpg",
    texto: "Alunizó el 23 de agosto de 2023 a 69° de latitud sur, lo más cerca del polo a lo que ha llegado nadie. India fue el cuarto país en alunizar." },
  { nombre: "SLIM", pais: "JP", anio: 2024, lat: -13.316, lon: 25.251, foto: "slim.jpg",
    texto: "Alunizó el 19 de enero de 2024 junto al cráter Shioli, a 55 m de su objetivo: el alunizaje más preciso hasta la fecha. Quedó volcado y aun así siguió midiendo." },
];

/** La chapa de un país como SVG (11x7 + contorno de 1 px), igual que en la Tierra. */
export function svgBandera(pais: Pais): string {
  const fw = 11, fh = 7;
  let r = `<rect x="0" y="0" width="${fw + 2}" height="${fh + 2}" fill="#10131c"/>`;
  for (let y = 0; y < fh; y++)
    for (let x = 0; x < fw; x++)
      r += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="${pais.paleta[pais.filas[y][x]]}"/>`;
  return `<svg viewBox="0 0 ${fw + 2} ${fh + 2}" aria-hidden="true">${r}</svg>`;
}
