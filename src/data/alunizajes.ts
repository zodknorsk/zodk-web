// Alunizajes con chapa sobre la Luna de /luna. Una chapa por misión que se
// posó, aunque fuera mal (Luna 23, IM-1 e IM-2 volcaron); los intentos que se
// estrellaron o no llegaron no entran: Chandrayaan-2, Peregrine y Beresheet.
// Al pasar el ratón por una chapa se despliega su ficha.
//
// La chapa es la bandera del país en pixel art, con el mismo formato que las
// de la Tierra (11x7 celdas + contorno de 1 px; ver BANDERAS en
// arte/generar-tierra.py). Aquí van las filas porque en la Luna las chapas
// son elementos del DOM encima del lienzo, no parte del dibujo.
//
// Las notas están en la bóveda, en 02 - Temas/moon-project; la ficha enlaza
// a la del blog si está publicada (`publicar: true`). Añadir una misión = una
// entrada en ALUNIZAJES y su foto en public/alunizajes/.

export interface Pais {
  codigo: string;
  nombre: string;
  bandera: string; // emoji, para la columna y la ficha
  filas: string[]; // 7 filas de 11 letras de `paleta`
  paleta: Record<string, string>;
  // Subgrupos que se despliegan bajo el país en la columna, cada uno con su
  // casilla (hoy solo EE. UU.). Las misiones del país llevan `grupo`.
  grupos?: { codigo: string; nombre: string }[];
}

export interface Alunizaje {
  nombre: string;
  pais: string; // codigo de PAISES_LUNA
  anio: number;
  lat: number; // grados; norte +
  lon: number; // grados; este +
  grupo?: string; // codigo de uno de los `grupos` del país, si los tiene
  // Solo en esa cara. Chandrayaan-3 e IM-1, tan al sur, se ven también desde la
  // oculta; se quedan en la visible para que en la oculta estén solo los dos
  // únicos alunizajes que ha habido allí (Chang'e 4 y 6).
  cara?: "visible" | "oculta";
  foto: string; // en public/alunizajes/
  nota: string; // slug de su nota en el blog (/notas/<nota>)
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
    grupos: [
      { codigo: "surveyor", nombre: "Programa Surveyor" },
      { codigo: "apolo", nombre: "Programa Apolo" },
      { codigo: "privadas", nombre: "Misiones privadas" },
    ],
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
  { nombre: "Apolo 11", pais: "US", anio: 1969, lat: 0.674, lon: 23.473, grupo: "apolo", foto: "apolo-11.jpg", nota: "apolo-11-1969",
    texto: "El módulo lunar Eagle alunizó el 20 de julio de 1969 en el Mar de la Tranquilidad. Neil Armstrong fue el primer ser humano en pisar la Luna." },
  { nombre: "Apolo 12", pais: "US", anio: 1969, lat: -3.0125, lon: -23.4214, grupo: "apolo", foto: "apolo-12.jpg", nota: "apolo-12-1969",
    texto: "Alunizó el 19 de noviembre de 1969 en el Océano de las Tormentas, a 180 metros de la sonda Surveyor 3 (1967), de la que se trajeron piezas." },
  { nombre: "Apolo 14", pais: "US", anio: 1971, lat: -3.6453, lon: -17.4714, grupo: "apolo", foto: "apolo-14.jpg", nota: "apolo-14-1971",
    texto: "Alunizó el 5 de febrero de 1971 en Fra Mauro. Alan Shepard, primer estadounidense en el espacio, golpeó dos pelotas de golf antes de volver." },
  { nombre: "Apolo 15", pais: "US", anio: 1971, lat: 26.1008, lon: 3.6527, grupo: "apolo", foto: "apolo-15.jpg", nota: "apolo-15-1971",
    texto: "Alunizó el 30 de julio de 1971 en Hadley-Apenino. Primera misión en usar el rover lunar (LRV) para alejarse del módulo." },
  { nombre: "Apolo 16", pais: "US", anio: 1972, lat: -8.9731, lon: 15.5, grupo: "apolo", foto: "apolo-16.jpg", nota: "apolo-16-1972",
    texto: "Alunizó el 21 de abril de 1972 en las tierras altas de Descartes, el primer alunizaje en tierras altas lunares." },
  { nombre: "Apolo 17", pais: "US", anio: 1972, lat: 20.1642, lon: 30.7658, grupo: "apolo", foto: "apolo-17.jpg", nota: "apolo-17-1972",
    texto: "Alunizó el 11 de diciembre de 1972 en Taurus-Littrow. Última misión tripulada a la Luna hasta hoy." },

  // --- EE. UU.: programa Surveyor (no tripuladas, antes del Apolo) --------
  { nombre: "Surveyor 1", pais: "US", anio: 1966, lat: -2.4745, lon: -43.3394, grupo: "surveyor", foto: "surveyor-1.jpg", nota: "surveyor-1-1966",
    texto: "Alunizó el 2 de junio de 1966 en el Océano de las Tormentas, cerca del cráter Flamsteed: primer alunizaje suave de EE. UU., cuatro meses después de Luna 9." },
  { nombre: "Surveyor 3", pais: "US", anio: 1967, lat: -3.0162, lon: -23.4181, grupo: "surveyor", foto: "surveyor-3.jpg", nota: "surveyor-3-1967",
    texto: "Alunizó el 20 de abril de 1967 en el Océano de las Tormentas, tras rebotar varias veces. Dos años después la tripulación del Apolo 12 la visitó a pie y se trajo piezas." },
  { nombre: "Surveyor 5", pais: "US", anio: 1967, lat: 1.455, lon: 23.1943, grupo: "surveyor", foto: "surveyor-5.jpg", nota: "surveyor-5-1967",
    texto: "Alunizó el 11 de septiembre de 1967 en el Mar de la Tranquilidad: primer análisis químico del suelo lunar in situ, clave para preparar el Apolo 11 en ese mismo mar." },
  { nombre: "Surveyor 6", pais: "US", anio: 1967, lat: 0.4743, lon: -1.4276, grupo: "surveyor", foto: "surveyor-6.png", nota: "surveyor-6-1967",
    texto: "Alunizó el 10 de noviembre de 1967 en Sinus Medii, casi en el centro del disco. Encendió sus motores y se posó unos metros más allá: el primer salto en la Luna." },
  { nombre: "Surveyor 7", pais: "US", anio: 1968, lat: -40.9808, lon: -11.51, grupo: "surveyor", foto: "surveyor-7.png", nota: "surveyor-7-1968",
    texto: "Alunizó el 10 de enero de 1968 junto al cráter Tycho: el último Surveyor y el único con fines puramente científicos, en tierras altas accidentadas." },

  // --- EE. UU.: privados (programa CLPS de la NASA) ------------------------
  { nombre: "IM-1 · Odysseus", pais: "US", anio: 2024, cara: "visible", lat: -80.13, lon: 1.44, grupo: "privadas", foto: "im1-odysseus.jpg", nota: "im-1-odysseus-2024",
    texto: "Alunizó el 22 de febrero de 2024 cerca del cráter Malapert A: primer alunizaje privado de la historia y el primero de EE. UU. desde el Apolo 17. Acabó apoyado de lado." },
  { nombre: "Blue Ghost", pais: "US", anio: 2025, lat: 18.56, lon: 61.81, grupo: "privadas", foto: "blue-ghost.jpg", nota: "blue-ghost-mission-1-2025",
    texto: "Alunizó el 2 de marzo de 2025 en el Mar de las Crisis: el primer alunizaje privado completamente redondo, derecho y operando un día lunar entero." },
  { nombre: "IM-2 · Athena", pais: "US", anio: 2025, cara: "visible", lat: -84.7906, lon: 29.1957, grupo: "privadas", foto: "im2-athena.png", nota: "im-2-athena-2025",
    texto: "Alunizó el 6 de marzo de 2025 en Mons Mouton, cerca del polo sur, pero le falló el altímetro: volcó y acabó de lado dentro de un cráter. Funcionó unas 13 horas." },

  // --- URSS: programa Luna (todas no tripuladas) ---------------------------
  { nombre: "Luna 9", pais: "RU", anio: 1966, lat: 7.03, lon: -64.33, foto: "luna-9.jpg", nota: "luna-9-1966",
    texto: "Alunizó el 3 de febrero de 1966: primer alunizaje suave de la historia, con las primeras fotos panorámicas desde la superficie lunar." },
  { nombre: "Luna 13", pais: "RU", anio: 1966, lat: 18.87, lon: -62.05, foto: "luna-13.jpg", nota: "luna-13-1966",
    texto: "Alunizó el 24 de diciembre de 1966 en el Océano de las Tormentas: tercer alunizaje suave de la historia. Midió con un penetrómetro la firmeza del suelo lunar." },
  { nombre: "Luna 16", pais: "RU", anio: 1970, lat: -0.5137, lon: 56.3638, foto: "luna-16.jpg", nota: "luna-16-1970",
    texto: "Alunizó el 20 de septiembre de 1970: primera sonda no tripulada en traer muestras lunares a la Tierra (101 g)." },
  { nombre: "Luna 17", pais: "RU", anio: 1970, lat: 38.28, lon: -35.0, foto: "luna-17.jpg", nota: "luna-17-1970",
    texto: "Alunizó el 17 de noviembre de 1970 y desplegó el Lunojod 1, el primer vehículo con ruedas en otro cuerpo celeste." },
  { nombre: "Luna 20", pais: "RU", anio: 1972, lat: 3.7863, lon: 56.6242, foto: "luna-20.jpg", nota: "luna-20-1972",
    texto: "Alunizó el 21 de febrero de 1972 y trajo muestras de tierras altas, cerca de donde ya lo había hecho Luna 16." },
  { nombre: "Luna 21", pais: "RU", anio: 1973, lat: 25.85, lon: 30.45, foto: "luna-21.jpg", nota: "luna-21-1973",
    texto: "Alunizó el 15 de enero de 1973 y desplegó el Lunojod 2, que recorrió 39 km en cuatro meses." },
  { nombre: "Luna 23", pais: "RU", anio: 1974, lat: 12.6669, lon: 62.1511, foto: "luna-23.png", nota: "luna-23-1974",
    texto: "Alunizó el 6 de noviembre de 1974 en el Mar de las Crisis, pero volcó: el taladro se dañó y no pudo traer muestras. Luna 24 lo consiguió dos años después, a unos cientos de metros." },
  { nombre: "Luna 24", pais: "RU", anio: 1976, lat: 12.7145, lon: 62.2097, foto: "luna-24.jpg", nota: "luna-24-1976",
    texto: "Alunizó el 18 de agosto de 1976: última misión del programa Luna y última en traer muestras hasta la Chang'e 5 en 2020." },

  // --- China: programa Chang'e (4 y 6, en la cara oculta) ------------------
  { nombre: "Chang'e 3", pais: "CN", anio: 2013, lat: 44.1214, lon: -19.5116, foto: "change-3.jpg", nota: "change-3-2013",
    texto: "Alunizó el 14 de diciembre de 2013: primer alunizaje lunar chino, con el róver Yutu." },
  { nombre: "Chang'e 4", pais: "CN", anio: 2019, lat: -45.444, lon: 177.599, foto: "change-4.jpg", nota: "change-4-2019",
    texto: "Alunizó el 3 de enero de 2019 en la cara oculta de la Luna: primer alunizaje de la historia ahí, con el róver Yutu-2." },
  { nombre: "Chang'e 5", pais: "CN", anio: 2020, lat: 43.0576, lon: -51.9161, foto: "change-5.jpg", nota: "change-5-2020",
    texto: "Alunizó el 1 de diciembre de 2020: primera misión china en traer muestras lunares a la Tierra (casi 2 kg)." },
  { nombre: "Chang'e 6", pais: "CN", anio: 2024, lat: -41.64, lon: 206.01, foto: "change-6.jpg", nota: "change-6-2024",
    texto: "Alunizó el 2 de junio de 2024 en la cara oculta: primeras muestras traídas de esa cara de la Luna." },

  // --- India y Japón -------------------------------------------------------
  { nombre: "Chandrayaan-3", pais: "IN", anio: 2023, cara: "visible", lat: -69.373, lon: 32.319, foto: "chandrayaan-3.jpg", nota: "chandrayaan-3-2023",
    texto: "Alunizó el 23 de agosto de 2023 a 69° de latitud sur, lo más cerca del polo a lo que ha llegado nadie. India fue el cuarto país en alunizar." },
  { nombre: "SLIM", pais: "JP", anio: 2024, lat: -13.316, lon: 25.251, foto: "slim.jpg", nota: "slim-2024",
    texto: "Alunizó el 19 de enero de 2024 junto al cráter Shioli, a 55 m de su objetivo: el alunizaje más preciso hasta la fecha. Quedó volcado y aun así siguió midiendo." },
];

// Relés de la cara oculta: sin chapa ni filtro, siempre a la vista en la
// oculta. Cada uno hizo de puente con la Tierra para una Chang'e (`sirve`), que
// desde la cara oculta no la ve. La ficha enlaza a su nota si está publicada.
export interface Rele {
  nombre: string;
  anio: number;
  sprite: string; // en public/luna/
  sirve: string; // nombre del alunizaje al que da servicio
  nota: string;
  texto: string;
}

export const RELES: Rele[] = [
  { nombre: "Queqiao", anio: 2018, sprite: "zodk-sat-queqiao-noche.svg", sirve: "Chang'e 4", nota: "queqiao-2018",
    texto: "Lanzado en mayo de 2018 a una órbita de halo más allá de la Luna, en torno al punto L2. Desde ahí ve a la vez la cara oculta y la Tierra, y hace de repetidor para la Chang'e 4." },
  { nombre: "Queqiao-2", anio: 2024, sprite: "zodk-sat-queqiao2-noche.svg", sirve: "Chang'e 6", nota: "queqiao-2-2024",
    texto: "Lanzado en marzo de 2024 a una órbita elíptica alrededor de la Luna. Hizo de repetidor para la Chang'e 6 y lo hará para las siguientes misiones chinas al polo sur." },
];

// Ficha de la Orion (Artemis II) en luna.astro: el texto vive en el propio
// .astro (no orbita como un dato más), pero el enlace a su nota sigue el mismo
// patrón que RELES ("Leer la nota" solo si está publicada).
export const ORION_NOTA = "orion-artemis-ii";

/** La chapa de un país como SVG (11x7 + contorno de 1 px), igual que en la Tierra. */
export function svgBandera(pais: Pais): string {
  const fw = 11, fh = 7;
  let r = `<rect x="0" y="0" width="${fw + 2}" height="${fh + 2}" fill="#10131c"/>`;
  for (let y = 0; y < fh; y++)
    for (let x = 0; x < fw; x++)
      r += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="${pais.paleta[pais.filas[y][x]]}"/>`;
  return `<svg viewBox="0 0 ${fw + 2} ${fh + 2}" aria-hidden="true">${r}</svg>`;
}
