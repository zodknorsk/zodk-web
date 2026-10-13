// La nota «Bases militares.md» de la bóveda (docs/nuevabase.md): una sección
// por base con su mapa, una tabla con los datos y el texto de la tarjeta.
// Sirve para retocar a mano los datos y el texto en Obsidian; el importador
// (importar-notas.mjs) los pasa a src/data/bases.json. El mapa, el nombre y
// las coordenadas no se cambian ahí: se hacen con /nuevabase.
//
// Uso (lo hace /nuevabase al elegir la vista):
//   node scripts/bases-nota.mjs <slug>    añade la sección de la base a la
//                                         nota (sin tocar las demás) y copia
//                                         su mapa a los adjuntos de la bóveda
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mgrs } from "../src/scripts/mgrs.js";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATOS = path.join(RAIZ, "src", "data", "bases.json");
const BANDERAS = path.join(RAIZ, "src", "data", "banderas.json");
export const NOMBRE_NOTA = "Bases militares.md";
const NO_MIRAR = new Set([".git", ".obsidian", ".trash"]);
const FILAS = { "Nombre oficial": "oficial", País: "pais", Rama: "rama", Dónde: "lugar", Desde: "desde" };

const leerJson = (ruta) => JSON.parse(fs.readFileSync(ruta, "utf8"));
const emojiDe = (codigo) => leerJson(BANDERAS)[codigo]?.bandera ?? "";
const codigoDe = (emoji) => Object.entries(leerJson(BANDERAS)).find(([, b]) => b?.bandera === emoji)?.[0];

/** La ruta de la bóveda, como el importador. */
export function boveda() {
  return [
    process.env.BOVEDA_PATH,
    path.join(os.homedir(), "Documents", "boveda-osint"),
    path.join(os.homedir(), "Documentos", "boveda-osint"),
  ].find((p) => p && fs.existsSync(p));
}

/** Busca una carpeta o archivo por su nombre en la bóveda. */
function buscar(dir, nombre, carpeta) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (NO_MIRAR.has(e.name)) continue;
    const ruta = path.join(dir, e.name);
    if (e.name.normalize("NFC") === nombre && e.isDirectory() === carpeta) return ruta;
    if (e.isDirectory()) {
      const r = buscar(ruta, nombre, carpeta);
      if (r) return r;
    }
  }
  return null;
}

/** La nota en la bóveda (o null si no está). */
export const rutaNota = (bov) => buscar(bov, NOMBRE_NOTA, false);

/** La sección de una base, en Markdown de Obsidian. */
export function seccion(nombre, b) {
  return [
    `## ${emojiDe(b.pais)} ${nombre}`.replace("##  ", "## "),
    "",
    `![[base-${b.slug}.png]]`,
    "",
    "| | |",
    "|---|---|",
    `| **Nombre oficial** | ${b.oficial} |`,
    `| **País** | ${emojiDe(b.pais)} |`,
    `| **Rama** | ${b.rama} |`,
    `| **Dónde** | ${b.lugar} |`,
    `| **Desde** | ${b.desde} |`,
    `| **Coord.** | ${mgrs(b.lat, b.lon)} |`,
    "",
    b.texto,
    "",
  ].join("\n");
}

const CABECERA = `Las bases militares con tarjeta en la web: el nombre de cada sección, escrito igual en una nota, sale con su bandera y su tarjeta. Aquí se pueden cambiar el nombre oficial, el país (la bandera), la rama, dónde está, el año y el texto; \`npm run importar\` lo pasa a la web. El mapa, el nombre y las coordenadas se hacen con /nuevabase.

`;

/** Lo que dice la nota: { nombre: { oficial, pais, rama, lugar, desde, texto } }. */
export function leerNota(texto) {
  const bases = {};
  for (const trozo of texto.split(/^## /m).slice(1)) {
    const [cabeza, ...lineas] = trozo.split("\n");
    const nombre = cabeza.replace(/^(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}️?)\s*/u, "").trim();
    const b = {};
    const parrafos = [];
    for (const linea of lineas) {
      const fila = linea.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|\s*$/);
      if (fila) {
        const campo = FILAS[fila[1]];
        if (campo === "pais") b.pais = codigoDe(fila[2].trim()) ?? fila[2].trim();
        else if (campo === "desde") b.desde = Number(fila[2]) || fila[2];
        else if (campo) b[campo] = fila[2];
      } else if (linea.trim() && !/^\s*[|!#>]/.test(linea)) {
        parrafos.push(linea.trim());
      }
    }
    if (parrafos.length) b.texto = parrafos.join(" ");
    bases[nombre] = b;
  }
  return bases;
}

/**
 * Pasa lo cambiado en la nota a bases.json. Devuelve los nombres de las
 * bases que han cambiado y avisa de las secciones que no son de ninguna.
 */
export function importarNota(bov) {
  const ruta = rutaNota(bov);
  if (!ruta) return [];
  const datos = leerJson(DATOS);
  const cambiadas = [];
  for (const [nombre, nota] of Object.entries(leerNota(fs.readFileSync(ruta, "utf8")))) {
    if (!datos[nombre] || nombre.startsWith("_")) {
      console.warn(`  ⚠ ${NOMBRE_NOTA}: «${nombre}» no está en src/data/bases.json (una base nueva se hace con /nuevabase)`);
      continue;
    }
    if (nota.pais && !leerJson(BANDERAS)[nota.pais]) {
      console.warn(`  ⚠ ${NOMBRE_NOTA}: «${nombre}» lleva un país sin bandera en src/data/banderas.json; se deja el de antes`);
      delete nota.pais;
    }
    const antes = JSON.stringify(datos[nombre]);
    Object.assign(datos[nombre], nota);
    if (JSON.stringify(datos[nombre]) !== antes) cambiadas.push(nombre);
  }
  if (cambiadas.length) fs.writeFileSync(DATOS, `${JSON.stringify(datos, null, 2)}\n`);
  return cambiadas;
}

/** Añade la sección de la base a la nota (la crea si no está) y copia su mapa. */
function anadir(slug) {
  const bov = boveda();
  if (!bov) throw new Error("No encuentro la bóveda (BOVEDA_PATH, ~/Documents/boveda-osint o ~/Documentos/boveda-osint)");
  const datos = leerJson(DATOS);
  const [nombre, b] = Object.entries(datos).find(([, v]) => v?.slug === slug) ?? [];
  if (!b) throw new Error(`No hay ninguna base «${slug}» en src/data/bases.json`);
  let ruta = rutaNota(bov);
  if (!ruta) {
    ruta = path.join(buscar(bov, "Hangar de UAS", true) ?? bov, NOMBRE_NOTA);
    fs.writeFileSync(ruta, CABECERA);
  }
  const nota = fs.readFileSync(ruta, "utf8");
  if (nombre in leerNota(nota)) {
    console.log(`«${nombre}» ya está en ${path.relative(bov, ruta)}: no se toca`);
  } else {
    fs.writeFileSync(ruta, `${nota.trimEnd()}\n\n${seccion(nombre, b)}`);
    console.log(`«${nombre}» añadida a ${path.relative(bov, ruta)}`);
  }
  const adjuntos = path.join(path.dirname(ruta), "Adjuntos");
  fs.mkdirSync(adjuntos, { recursive: true });
  fs.copyFileSync(path.join(RAIZ, "public", "bases", `${slug}.png`), path.join(adjuntos, `base-${slug}.png`));
  console.log(`Mapa copiado a ${path.relative(bov, path.join(adjuntos, `base-${slug}.png`))}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!process.argv[2]) {
    console.error("uso: node scripts/bases-nota.mjs <slug>");
    process.exit(1);
  }
  anadir(process.argv[2]);
}
