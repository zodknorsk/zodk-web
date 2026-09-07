// ---------------------------------------------------------------------------
// importar-notas.mjs
//
// Puente entre la bóveda de Obsidian y la web.
//
// Qué hace, en orden:
//   1. Recorre tu bóveda de Obsidian buscando archivos .md.
//   2. Se queda solo con los que tienen  `publicar: true`  en el frontmatter.
//   3. Traduce el frontmatter en español (titulo, creado, actualizado, tags...)
//      al frontmatter en inglés que espera la colección "notas" de Astro.
//   4. Convierte la sintaxis propia de Obsidian a Markdown estándar:
//        - ![[imagen.png]]      -> ![](./imagen.png)  + copia la imagen
//        - [[Otra nota|texto]]  -> texto  (o enlace si esa nota también se publica)
//        - ![](https://x.com/…) -> [enlace](https://x.com/…)  (no era una imagen)
//   5. Escribe cada nota en  src/content/notas/<slug>/index.md  junto con sus
//      imágenes. Esa carpeta se borra y se regenera entera en cada ejecución,
//      así que borrar `publicar: true` en la bóveda también quita la nota aquí.
//
// Cómo se ejecuta:   npm run importar
// (o directamente:   node scripts/importar-notas.mjs)
//
// La ruta de la bóveda se puede cambiar con la variable de entorno BOVEDA_PATH:
//   BOVEDA_PATH="/otra/ruta" npm run importar
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

// --- Config ----------------------------------------------------------------

const BOVEDA = process.env.BOVEDA_PATH
  || path.join(os.homedir(), "Documents", "boveda-osint");

const DESTINO = path.join(process.cwd(), "src", "content", "notas");

// Carpetas de la bóveda que nunca se recorren (ruido o material sensible).
const CARPETAS_IGNORADAS = new Set([
  ".git", ".obsidian", ".trash", "00 - Meta", "07 - Clippings", "Adjuntos",
]);

// --- Utilidades -----------------------------------------------------------

/** Recorre un directorio de forma recursiva y devuelve todas las rutas .md. */
function buscarMarkdown(dir) {
  const encontrados = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      if (CARPETAS_IGNORADAS.has(entrada.name)) continue;
      encontrados.push(...buscarMarkdown(path.join(dir, entrada.name)));
    } else if (entrada.name.endsWith(".md")) {
      encontrados.push(path.join(dir, entrada.name));
    }
  }
  return encontrados;
}

/** Índice { nombreDeArchivo -> rutaAbsoluta } de todas las imágenes de la bóveda. */
function indexarImagenes() {
  const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
  const indice = new Map();
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === ".git" || e.name === ".obsidian" || e.name === ".trash") continue;
        recorrer(p);
      } else if (exts.has(path.extname(e.name).toLowerCase())) {
        if (!indice.has(e.name)) indice.set(e.name, p);
      }
    }
  };
  recorrer(BOVEDA);
  return indice;
}

const slugger = new GithubSlugger();
function generarSlug(texto) {
  slugger.reset();
  const sinTildes = texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return slugger.slug(sinTildes);
}

/** Normaliza a "YYYY-MM-DD" (hora local) tanto si el valor viene como Date o string. */
function aFechaISO(valor) {
  const fmt = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  if (valor instanceof Date && !isNaN(valor)) return fmt(valor);
  if (typeof valor === "string") {
    const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(valor);
    if (!isNaN(d)) return fmt(d);
  }
  return undefined;
}

/** "07-09-2026 15:27" (formato de Obsidian) -> objeto Date. */
function parsearFechaActualizado(valor) {
  if (!valor || typeof valor !== "string") return undefined;
  const m = valor.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh = "0", min = "0"] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
}

/** Primer valor si es lista de un elemento; si no, el valor tal cual. */
function primero(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

/** Saca una descripción corta del cuerpo (primera línea de texto real). */
function extraerDescripcion(cuerpo) {
  for (let linea of cuerpo.split("\n")) {
    linea = linea.trim();
    if (!linea) continue;
    if (linea.startsWith("#")) continue;              // encabezado
    if (linea.startsWith("![")) continue;             // imagen
    if (linea === "---") continue;                    // regla horizontal
    linea = linea.replace(/^>\s?/, "");               // quita marca de cita
    linea = linea.replace(/[*_`=]/g, "");             // quita énfasis / resaltado
    linea = linea.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // [texto](url) -> texto
    linea = linea.trim();
    if (linea.length < 20) continue;
    if (linea.length <= 155) return linea;
    const corte = linea.slice(0, 155);
    return corte.slice(0, corte.lastIndexOf(" ")).trimEnd() + "…";
  }
  return undefined;
}

const EXT_IMAGEN = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

/**
 * Transforma el cuerpo de la nota de sintaxis Obsidian a Markdown estándar.
 * `copiarImagen(nombre)` devuelve el nombre final del archivo ya copiado a la
 * carpeta de la nota, o null si no se encontró.
 */
function transformarCuerpo(cuerpo, { slugsPublicados, copiarImagen }) {
  let salida = cuerpo;

  // 1. Imágenes embebidas de Obsidian: ![[archivo.png]]  o  ![[archivo.png|alt]]
  salida = salida.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, archivo, alt) => {
    const nombre = archivo.trim();
    const copiado = copiarImagen(nombre);
    if (!copiado) {
      console.warn(`  ⚠ imagen no encontrada en la bóveda: ${nombre}`);
      return `<!-- imagen no encontrada: ${nombre} -->`;
    }
    return `![${(alt || "").trim()}](./${copiado})`;
  });

  // 2. Enlaces internos: [[Nota|texto]]  o  [[Nota]]
  salida = salida.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, destino, texto) => {
    const etiqueta = (texto || destino).trim();
    const slugDestino = generarSlug(destino.trim());
    if (slugsPublicados.has(slugDestino)) return `[${etiqueta}](/notas/${slugDestino})`;
    return etiqueta; // la nota destino no está publicada: dejamos solo el texto
  });

  // 3. "Imágenes" que en realidad son URLs a webs (típico ![](https://x.com/...)).
  salida = salida.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (original, alt, url) => {
    if (EXT_IMAGEN.test(url.split("?")[0])) return original; // sí era imagen: se deja
    return `[${alt.trim() || "enlace"}](${url})`;
  });

  // 4. Regla horizontal justo al empezar el cuerpo (algunas notas antiguas).
  salida = salida.replace(/^\s*---\s*\n/, "");

  return salida.trim() + "\n";
}

// --- Programa principal --------------------------------------------------

function main() {
  if (!fs.existsSync(BOVEDA)) {
    console.error(`No encuentro la bóveda en: ${BOVEDA}`);
    console.error("Ajusta la ruta con la variable de entorno BOVEDA_PATH.");
    process.exit(1);
  }

  console.log(`Bóveda:  ${BOVEDA}`);
  console.log(`Destino: ${DESTINO}\n`);

  // Regeneramos la carpeta de notas desde cero.
  fs.rmSync(DESTINO, { recursive: true, force: true });
  fs.mkdirSync(DESTINO, { recursive: true });

  const indiceImagenes = indexarImagenes();
  const rutasMd = buscarMarkdown(BOVEDA);

  // Primera pasada: qué notas se publican y con qué slug (para resolver enlaces).
  const aPublicar = [];
  for (const ruta of rutasMd) {
    const { data, content } = matter(fs.readFileSync(ruta, "utf8"));
    if (data.publicar !== true) continue;
    const titulo = primero(data.titulo) || primero(data.title)
      || path.basename(ruta, ".md");
    aPublicar.push({ ruta, data, content, titulo, slug: generarSlug(titulo) });
  }
  const slugsPublicados = new Set(aPublicar.map((n) => n.slug));

  if (aPublicar.length === 0) {
    console.log("No hay ninguna nota con `publicar: true`. Nada que importar.");
    return;
  }

  // Segunda pasada: escribir cada nota.
  for (const nota of aPublicar) {
    const carpeta = path.join(DESTINO, nota.slug);
    fs.mkdirSync(carpeta, { recursive: true });

    const copiarImagen = (nombre) => {
      const origen = indiceImagenes.get(nombre) || indiceImagenes.get(path.basename(nombre));
      if (!origen) return null;
      // Renombramos a algo seguro para URLs, conservando la extensión.
      const ext = path.extname(origen);
      const base = generarSlug(path.basename(origen, ext)) + ext.toLowerCase();
      fs.copyFileSync(origen, path.join(carpeta, base));
      return base;
    };

    const cuerpo = transformarCuerpo(nota.content, { slugsPublicados, copiarImagen });

    const frontmatter = {
      title: nota.titulo,
      date: aFechaISO(primero(nota.data.creado) || primero(nota.data.created))
        || aFechaISO(new Date()),
    };
    const descripcion = extraerDescripcion(nota.content);
    if (descripcion) frontmatter.description = descripcion;
    const actualizado = parsearFechaActualizado(primero(nota.data.actualizado));
    if (actualizado) frontmatter.updated = aFechaISO(actualizado);
    const tags = nota.data.tags;
    if (Array.isArray(tags) && tags.length) frontmatter.tags = tags.map(String);

    const salida = matter.stringify(cuerpo, frontmatter);
    fs.writeFileSync(path.join(carpeta, "index.md"), salida);
    console.log(`  ✓ ${nota.slug}  (desde "${path.relative(BOVEDA, nota.ruta)}")`);
  }

  console.log(`\nListo: ${aPublicar.length} nota(s) importada(s).`);
}

main();
