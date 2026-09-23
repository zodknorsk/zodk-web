// Amartizajes con chapa sobre el Marte de /marte (Proyecto Marte). Como las
// chapas de /luna: la bandera del país en pixel art (svgBandera y PAISES_LUNA
// de alunizajes.ts), en su sitio exacto y a cualquier zoom (a x1 son lo único
// que sale). Al pasar el ratón, su ficha.
//
// Las que no llegaron enteras (`llego: false`) van con la bandera en color y
// una raya encima (usuario, 22-sep-2026: el blanco y negro no deja distinguir
// los países; el aspa se come la bandera).
//
// Las notas están en la bóveda (boveda-osint), en 02 - Temas/mars-project
// (Soft Landings y Hard Landings). La chapa enlaza a /notas/<nota> solo si está
// publicada (`publicar: true`); si no, es solo la ficha.
// De momento, solo Mars 3 y Mars 2, las dos de prueba del banco (usuario,
// 22-sep-2026). Detalle y decisiones en logo-files/MARTE-WIP.md.

export interface Amartizaje {
  nombre: string;
  pais: string; // codigo de PAISES_LUNA (la bandera)
  quien: string; // cómo sale el país en la ficha ("URSS" con la bandera rusa)
  anio: number;
  lat: number; // grados; norte +
  lon: number; // grados; este +
  llego: boolean; // false: se estrelló o se perdió al bajar
  clase: string; // la línea de debajo del título de la ficha
  datos: [string, string][];
  nota: string; // slug de su nota en el blog (/notas/<nota>)
}

export const AMARTIZAJES: Amartizaje[] = [
  {
    nombre: "Mars 3", pais: "RU", quien: "URSS", anio: 1971, lat: -45.04, lon: -157.98, llego: true,
    clase: "módulo de descenso · se posó entero",
    datos: [["cuándo", "2 de diciembre de 1971"], ["dónde", "45° S, región del cráter Ptolemaeus"],
      ["qué pasó", "primer amartizaje suave de la historia; transmitió unos 20 segundos y se calló"]],
    nota: "mars-3-1971",
  },
  {
    // Sitio aproximado: se estrelló y no hay imagen de los restos (NASA NSSDC:
    // "near 4 N, 47 W").
    nombre: "Mars 2", pais: "RU", quien: "URSS", anio: 1971, lat: 4, lon: -47, llego: false,
    clase: "módulo de descenso · se estrelló",
    datos: [["cuándo", "27 de noviembre de 1971"], ["dónde", "4° N, 47° O (sitio aproximado)"],
      ["qué pasó", "el paracaídas no se abrió; primer objeto humano en tocar Marte"]],
    nota: "mars-2-1971",
  },
];
