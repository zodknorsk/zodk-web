// ---------------------------------------------------------------------------
// importar-notas.mjs
//
// Puente entre la bóveda de Obsidian y la web.
//
//   1. Recorre la bóveda y se queda con los .md que tienen `publicar: true`.
//   2. Clasifica cada uno (docs/contenido.md):
//        - "…/Hangar de UAS/..."            -> colección "uas" (/uas/<slug>)
//        - etiqueta luna, marte o blog   -> colección "notas" (/notas/<slug>)
//        - el resto, por su `tipo`:
//            seguimiento -> "seguimientos" (jerárquica, /seguimiento/…)
//            operacion   -> "operaciones" (/operaciones/<slug>)
//            analisis    -> "analisis" (/analisis/<slug>)
//          Sin ninguno de esos tipos no se publica (y avisa).
//   3. Traduce el frontmatter en español al que esperan las colecciones de Astro.
//   4. Convierte la sintaxis de Obsidian a Markdown/HTML estándar:
//        - ![[imagen.png]]  y  ![](<imagen.png>)   -> ![](./imagen.png) + copia reducida
//        - ![[vídeo.mp4]]                          -> <video> + copia a public/adjuntos/
//        - ![](youtube.com/watch?v=...)            -> <iframe> embebido
//        - [[Nota]] / [[Nota#sección|texto]]       -> enlace resuelto (o texto)
//        - URL de tweet embebida (![](x.com/...))  -> tarjeta HTML ya descargada
//        - <blockquote class="tiktok-embed">       -> cita estática con enlace
//   5. Escribe el resultado en src/content/<colección>/, las imágenes de
//      tweets en public/tweets/ y los vídeos locales de la bóveda en
//      public/adjuntos/. Solo escribe lo que ha cambiado y borra lo que ya no
//      se publica, así que `npm run dev` puede seguir abierto.
//   6. Resume qué notas son nuevas, cuáles han cambiado y cuáles se retiran.
//
// Los tuits se piden a X una sola vez y se guardan en src/data/tuits/
// (tweets.mjs, «Archivo de tuits»).
//
// Uso:   npm run importar                          (BOVEDA_PATH=... para otra ruta)
//        npm run importar -- --refrescar-tuits     vuelve a pedir a X todos los tuits
//        npm run importar -- --en-esta-rama        importa aunque no se esté en main
//        npm run importar-sahara [-- --borradores] solo el Sáhara (ver abajo)
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import {
  descargarTweet,
  recortarTuit,
  leerArchivo,
  guardarEnArchivo,
  archivosDeTuit,
  enParalelo,
  mediaDeTweet,
  descargarMedia,
  videosDeTweet,
  descargarVideos,
  construirTarjeta,
} from "./tweets.mjs";

// --- Config ----------------------------------------------------------------

// Ruta de la bóveda: primero BOVEDA_PATH; si no, se prueba "Documents" (macOS,
// carpeta en inglés) y "Documentos" (Linux Mint en español) y se coge la que
// exista. Si ninguna existe se deja la primera para que el mensaje de error de
// main() muestre una ruta concreta.
const CANDIDATAS_BOVEDA = [
  process.env.BOVEDA_PATH,
  path.join(os.homedir(), "Documents", "boveda-osint"),
  path.join(os.homedir(), "Documentos", "boveda-osint"),
].filter(Boolean);

const BOVEDA = CANDIDATAS_BOVEDA.find((p) => fs.existsSync(p))
  || CANDIDATAS_BOVEDA[0];

const RAIZ = process.cwd();
const DESTINO_NOTAS = path.join(RAIZ, "src", "content", "notas");
const DESTINO_ANALISIS = path.join(RAIZ, "src", "content", "analisis");
const DESTINO_OPERACIONES = path.join(RAIZ, "src", "content", "operaciones");
const DESTINO_SEGUIMIENTOS = path.join(RAIZ, "src", "content", "seguimientos");
const DESTINO_UAS = path.join(RAIZ, "src", "content", "uas");
const DESTINOS = [DESTINO_NOTAS, DESTINO_ANALISIS, DESTINO_OPERACIONES, DESTINO_SEGUIMIENTOS, DESTINO_UAS];
// El Sáhara (/sahara, docs/sahara.md): las notas con la etiqueta
// ETIQUETA_SAHARA, estén donde estén, y su línea de tiempo (la que se llama
// «… Timeline»). Van aparte: `npm run importar` no las toca, y
// `npm run importar-sahara` (--solo-sahara) solo trata esas, en cualquier rama,
// para que el proyecto no se mezcle con lo demás. Con --borradores entran
// también las que no llevan `publicar: true` (para trabajar en la rama).
const ETIQUETA_SAHARA = "sahara-project";
const DESTINO_SAHARA = path.join(RAIZ, "src", "content", "sahara");
const HITOS_SAHARA = path.join(RAIZ, "src", "data", "sahara", "hitos.json");
const LUGARES_SAHARA = path.join(RAIZ, "src", "data", "sahara", "lugares.json");
const PUBLICO_TWEETS = path.join(RAIZ, "public", "tweets");
const PUBLICO_ADJUNTOS = path.join(RAIZ, "public", "adjuntos");
const ARCHIVO_TUITS = path.join(RAIZ, "src", "data", "tuits");

const REFRESCAR_TUITS = process.argv.includes("--refrescar-tuits");
const EN_ESTA_RAMA = process.argv.includes("--en-esta-rama");
const SOLO_SAHARA = process.argv.includes("--solo-sahara");
const BORRADORES = process.argv.includes("--borradores");

// Las notas de los proyectos van por su etiqueta, sea cual sea su tipo.
const ETIQUETAS_PROYECTO = new Set(["luna", "marte", "blog"]);
// El Hangar de UAS: sus notas son fichas de drones en /uas (docs/hangar-de-uas.md),
// salvo el glosario y el armamento (notas que empiezan por «Glosario» y por
// «Armamento»), que son páginas aparte. Las municiones son una nota cada una
// en la carpeta «Armamento» (junto a la nota índice) y van en
// /uas/armamento/<slug>.
const CARPETA_UAS = "Hangar de UAS";
const CARPETA_ARMAMENTO = "Armamento";
const RE_GLOSARIO_UAS = /^Glosario\b/i;
const RE_ARMAMENTO_UAS = /^Armamento\b/i;
const CARPETAS_IGNORADAS = new Set([
  ".git", ".obsidian", ".trash", "00 - Meta", "07 - Clippings", "Adjuntos",
]);
// Dentro de una carpeta ignorada, las subcarpetas que sí se leen: en
// 00 - Meta/Notas hay notas sobre la propia web que se pueden publicar. Las
// del blog van en 02 - Temas/blog.
const SUBCARPETAS_LEIDAS = { "00 - Meta": ["Notas"] };

// URL de un tweet, opcionalmente envuelta en `![](...)` o entre `<...>`.
const RE_TWEET_URL =
  /https?:\/\/(?:mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/(\d+)/;
const RE_TWEET_SUELTO = new RegExp(
  `^(?:!\\[[^\\]]*\\]\\(\\s*)?<?\\s*${RE_TWEET_URL.source}\\S*\\s*>?\\s*\\)?$`,
);
const EXT_IMAGEN = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

// Fotos de los artículos. Astro las sirve con los píxeles que tengan, así que
// se reducen al copiarlas: ancho máximo ANCHO_MAX_FOTO (el alto no se limita:
// un esquema largo quedaría con la letra ilegible). Los PNG que pesan más de
// PNG_A_JPG_DESDE (fotos y capturas grandes) pasan a JPG si son opacos y a
// WebP si tienen transparencia (el JPG no la guarda); los pequeños se quedan
// en PNG para que el texto salga nítido. Los originales de la bóveda no se
// tocan.
const ANCHO_MAX_FOTO = 2400;
const PNG_A_JPG_DESDE = 500 * 1024;
const CALIDAD_JPG = 88;
const EXT_VIDEO = /\.(mp4|mov|webm)$/i;

// URL de un vídeo de YouTube, envuelta en `![](...)` (así se pegan en
// Obsidian: watch?v=, live/ o youtu.be/, con o sin `?si=...`).
const RE_YOUTUBE = new RegExp(
  `!\\[[^\\]]*\\]\\(\\s*<?\\s*https?://(?:www\\.)?` +
  `(?:youtube\\.com/(?:watch\\?v=|live/|embed/)|youtu\\.be/)` +
  `([A-Za-z0-9_-]{6,})[^)\\s>]*\\s*>?\\s*\\)`,
  "gi",
);

// --- Utilidades generales ------------------------------------------------

/**
 * Copia una imagen de la bóveda a `carpeta` como `base` + extensión, reducida
 * a ANCHO_MAX_FOTO. Devuelve { nombre, nueva }: el nombre final (un PNG puede
 * acabar en .jpg o .webp) y si se ha escrito ahora.
 */
async function copiarFoto(origen, carpeta, base) {
  const ext = path.extname(origen).toLowerCase();
  // Si ya está la copia y es más nueva que el original, no se rehace. Un PNG
  // grande pudo acabar en .jpg o .webp, así que se miran los tres nombres.
  for (const final of ext === ".png" ? [ext, ".jpg", ".webp"] : [ext]) {
    if (estaAlDia(origen, path.join(carpeta, base + final))) return { nombre: base + final, nueva: false };
  }
  return { nombre: await convertirFoto(origen, carpeta, base, ext), nueva: true };
}

/** El destino existe y es posterior al origen (no hace falta copiarlo otra vez). */
function estaAlDia(origen, destino) {
  return fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs;
}

async function convertirFoto(origen, carpeta, base, ext) {
  const copiaTalCual = () => {
    fs.copyFileSync(origen, path.join(carpeta, base + ext));
    return base + ext;
  };
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return copiaTalCual();

  // El ancho ya girado según la orientación EXIF (la de .rotate() de abajo).
  const { width } = (await sharp(origen).metadata()).autoOrient;
  const grande = width > ANCHO_MAX_FOTO;
  const pngGrande = ext === ".png" && fs.statSync(origen).size > PNG_A_JPG_DESDE;
  const opaco = pngGrande && (await sharp(origen).stats()).isOpaque;
  const aJpg = pngGrande && opaco;
  const aWebp = pngGrande && !opaco;
  if (!grande && !pngGrande) return copiaTalCual();

  let img = sharp(origen).rotate(); // aplica la orientación EXIF antes de reducir
  if (grande) img = img.resize({ width: ANCHO_MAX_FOTO });
  let final = ext;
  if (aJpg || ext === ".jpg" || ext === ".jpeg") {
    img = img.jpeg({ quality: CALIDAD_JPG, mozjpeg: true });
    if (aJpg) final = ".jpg";
  } else if (aWebp) {
    img = img.webp({ quality: 90, alphaQuality: 100 });
    final = ".webp";
  } else if (ext === ".png") {
    img = img.png({ compressionLevel: 9 });
  } else {
    img = img.webp({ quality: 90 });
  }
  await img.toFile(path.join(carpeta, base + final));
  return base + final;
}

function buscarMarkdown(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (CARPETAS_IGNORADAS.has(e.name)) {
        for (const sub of SUBCARPETAS_LEIDAS[e.name] ?? []) {
          if (fs.existsSync(path.join(p, sub))) out.push(...buscarMarkdown(path.join(p, sub)));
        }
        continue;
      }
      out.push(...buscarMarkdown(p));
    } else if (e.name.endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

function indexarImagenes() {
  const exts = new Set([
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif",
    ".mp4", ".mov", ".webm",
  ]);
  const indice = new Map();
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if ([".git", ".obsidian", ".trash"].includes(e.name)) continue;
        recorrer(p);
      } else if (exts.has(path.extname(e.name).toLowerCase())) {
        // Normalizado a NFC: macOS guarda los nombres de archivo en NFD (acentos
        // "descompuestos"), pero el texto de las notas (tecleado o pegado desde
        // Obsidian) llega en NFC. Sin esto, "Composición.png" en la nota nunca
        // encuentra al "Composición.png" del disco aunque se vean idénticos.
        const nombre = e.name.normalize("NFC");
        if (!indice.has(nombre)) indice.set(nombre, p);
      }
    }
  };
  recorrer(BOVEDA);
  return indice;
}

const slugger = new GithubSlugger();
/** Slug para URLs (sin tildes, minúsculas, con guiones). */
// slugger.slug() convierte cada espacio en un guion pero deja los guiones
// literales del texto tal cual: un título con " - " como separador visual
// (p. ej. "Solo al amanecer - La historia...") produce "---" (el guion del
// espacio + el guion literal + el guion del otro espacio). Se colapsan aquí
// los guiones repetidos para que la URL quede limpia.
function limpiarGuiones(slug) {
  return slug.replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

function generarSlug(texto) {
  slugger.reset();
  return limpiarGuiones(slugger.slug(texto.normalize("NFD").replace(/[̀-ͯ]/g, "")));
}
/** Ancla de encabezado, igual que las que genera Astro (conserva tildes). */
function generarAncla(texto) {
  slugger.reset();
  return limpiarGuiones(slugger.slug(texto));
}

function aFechaISO(valor) {
  // Getters en UTC (no locales): "creado" es un día de calendario, no un
  // instante, y las fechas sin hora las parsea JS como medianoche UTC. Con
  // getters locales, importar desde una máquina en un huso horario detrás de
  // UTC (p. ej. América) desplazaría la fecha un día hacia atrás.
  const fmt = (d) => {
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${d.getUTCFullYear()}-${mm}-${dd}`;
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

function parsearFechaActualizado(valor) {
  if (typeof valor !== "string") return undefined;
  const m = valor.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh = "0", min = "0"] = m;
  // Anclada en UTC (no en la zona local): aFechaISO() lee este valor con
  // getters UTC, así que hay que construirlo igual para que coincidan.
  return new Date(Date.UTC(+yyyy, +mm - 1, +dd, +hh, +min));
}

const primero = (v) => (Array.isArray(v) ? v[0] : v);

/** "30 JULIO al 05 AGOSTO" -> "30 julio – 5 agosto" */
function formatearRango(texto) {
  return texto
    .toLowerCase()
    .replace(/\b(0)(\d)\b/g, "$2")
    .replace(/\s+al\s+/, " – ")
    .trim();
}

function extraerDescripcion(cuerpo) {
  for (let linea of cuerpo.split("\n")) {
    linea = linea.trim();
    if (!linea || linea.startsWith("#") || linea.startsWith("![") || linea === "---") continue;
    if (linea.startsWith("<") || linea.startsWith("[[")) continue;
    if (/^\*\*D[ií]as de esta semana:/i.test(linea)) continue; // barra de nav de semana
    if (/\|\s*Semana\s+\d/i.test(linea) && /\[\[/.test(linea)) continue;
    linea = linea
      .replace(/^[-*+]\s+/, "")            // marcador de lista
      .replace(/^\d+\.\s+/, "")            // lista numerada
      .replace(/^>\s?/, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // [texto](url) -> texto
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, d, t) => t || d)
      .replace(/[*_`=]/g, "")
      .replace(/\s*\(?(?:fuente|enlace)\)?\s*$/i, "") // "(fuente)" / "fuente" al final
      .trim();
    if (linea.length < 20) continue;
    if (linea.length <= 155) return linea;
    const corte = linea.slice(0, 155);
    return corte.slice(0, corte.lastIndexOf(" ")).trimEnd() + "…";
  }
  return undefined;
}

// --- Clasificación por secciones ---------------------------------------

const tiposDe = (data) => [].concat(data?.tipo ?? []).map((t) => String(t).trim().toLowerCase());

const frontmatterIndices = new Map();
function frontmatterDe(ruta) {
  if (!frontmatterIndices.has(ruta)) {
    frontmatterIndices.set(ruta, fs.existsSync(ruta) ? matter(fs.readFileSync(ruta, "utf8")).data : null);
  }
  return frontmatterIndices.get(ruta);
}

function esDelSahara(data) {
  return [].concat(data.tags ?? []).some((t) => String(t).toLowerCase() === ETIQUETA_SAHARA);
}

/**
 * Decide a qué colección va un archivo. Devuelve { tipo: "uas" | "nota" |
 * "analisis" | "operacion" | "seguimiento" | null, … }; los seguimientos,
 * además, { eventoSlug, kind, orden, rango, subSlug }.
 */
function clasificar(ruta, data) {
  const partes = path.relative(BOVEDA, ruta).split(path.sep);
  const stem = path.basename(ruta, ".md");
  if (partes.includes(CARPETA_UAS)) {
    const armamento = RE_ARMAMENTO_UAS.test(stem);
    const municion = !armamento && partes.includes(CARPETA_ARMAMENTO);
    return { tipo: "uas", glosario: RE_GLOSARIO_UAS.test(stem), armamento, municion };
  }
  if (esDelSahara(data)) return { tipo: "sahara", timeline: /timeline/i.test(stem) };
  if ([].concat(data.tags ?? []).some((t) => ETIQUETAS_PROYECTO.has(String(t).toLowerCase()))) {
    return { tipo: "nota" };
  }

  // Un seguimiento de varias páginas es una carpeta con una nota índice que
  // se llama como ella y lleva `tipo: seguimiento`. Todo lo de dentro va con
  // él: las semanas («SEMANA 4 - 20 AGOSTO…») y las páginas sueltas, sea
  // cual sea su tipo.
  const carpeta = path.basename(path.dirname(ruta));
  const indice = path.join(path.dirname(ruta), `${carpeta}.md`);
  if (tiposDe(frontmatterDe(indice)).includes("seguimiento")) {
    const eventoSlug = generarSlug(carpeta);
    if (stem === carpeta) {
      return { tipo: "seguimiento", eventoSlug, kind: "index", orden: 0, subSlug: "" };
    }
    const mSemana = stem.match(/^SEMANA\s+(\d+)\s*[-–—]\s*(.+)$/i);
    if (mSemana) {
      const orden = parseInt(mSemana[1], 10);
      return {
        tipo: "seguimiento", eventoSlug, kind: "semana", orden,
        rango: formatearRango(mSemana[2]),
        subSlug: `semana-${String(orden).padStart(2, "0")}`,
      };
    }
    return { tipo: "seguimiento", eventoSlug, kind: "pagina", orden: 0, subSlug: generarSlug(stem) };
  }

  const tipos = tiposDe(data);
  if (tipos.includes("seguimiento")) {
    // Seguimiento de una sola página, sin carpeta.
    return { tipo: "seguimiento", eventoSlug: generarSlug(stem), kind: "index", orden: 0, subSlug: "" };
  }
  if (tipos.includes("operacion")) return { tipo: "operacion" };
  if (tipos.includes("analisis")) return { tipo: "analisis", opinion: tipos.includes("opinion") };
  return { tipo: null };
}

// --- Transformación del cuerpo ----------------------------------------

/**
 * Resaltados de Obsidian (`==texto==`) a `<mark>`, fuera del código (bloques
 * con ``` y `código en línea`), donde un `==` es un operador.
 */
function resaltados(cuerpo) {
  return cuerpo
    .split(/(```[\s\S]*?```|`[^`\n]*`)/)
    .map((trozo, i) => (i % 2 ? trozo : trozo.replace(/==([^=\n](?:[^\n]*?[^=\n])?)==/g, "<mark>$1</mark>")))
    .join("");
}

/**
 * País y categoría de una ficha de dron, de las filas «País» y «Categoría»
 * de su tabla de características (`| **País** | 🇺🇦 Ucrania |`): la bandera
 * (emoji), el nombre del país y la categoría, para los filtros de /uas.
 */
function paisDeFicha(cuerpo) {
  const fila = (nombre) => cuerpo.match(new RegExp(`^\\|\\s*\\*\\*${nombre}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "mu"))?.[1];
  const datos = {};
  const pais = fila("Pa[ií]s");
  if (pais) {
    const bandera = pais.match(/^(\p{Regional_Indicator}{2})\s*/u);
    if (bandera) datos.bandera = bandera[1];
    datos.pais = pais.slice(bandera ? bandera[0].length : 0).trim();
  }
  // La categoría, sin lo que vaya tras una coma o entre paréntesis
  // («Ataque de un solo uso, largo alcance» → «Ataque de un solo uso»).
  const categoria = fila("Categor[ií]a")?.split(/[,(]/)[0].trim();
  if (categoria) datos.categoria = categoria;
  return datos;
}

/** Una munición sin sus fotos, sus pies ni su tabla: lo que queda empieza por el texto. */
function sinFotosNiTabla(cuerpo) {
  return cuerpo
    .split("\n")
    .filter((l) => !/^\s*(!\[|\||\*[^*\s].*\*\s*$)/.test(l))
    .join("\n");
}

/**
 * Los grupos del índice de la nota del armamento («- **Misiles**» y, debajo,
 * las líneas con sus enlaces), con el slug de cada munición en su orden.
 */
function gruposDelIndice(cuerpo, resolver) {
  const indice = cuerpo.match(/^## Índice\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";
  const grupos = [];
  for (const linea of indice.split("\n")) {
    const grupo = linea.match(/^[-*]\s+\*\*(.+?)\*\*/);
    if (grupo) {
      grupos.push({ titulo: grupo[1], municiones: [] });
      continue;
    }
    for (const m of linea.matchAll(/\[\[([^\]|#]+)/g)) {
      const url = resolver(m[1]);
      if (url?.startsWith("/uas/armamento/") && grupos.length) grupos.at(-1).municiones.push(url.split("/").pop());
    }
  }
  return grupos.filter((g) => g.municiones.length);
}

/**
 * En Obsidian, la línea sangrada bajo un punto de lista (la descripción de
 * cada fuente en las fichas de drones) sale debajo; en Markdown se pegaría a
 * la línea anterior. Se fuerza el salto (dos espacios al final).
 */
function saltosEnListas(cuerpo) {
  return cuerpo.replace(/^(\s*[-*+] .*\S)[ \t]*\n(?=[ \t]+\S)/gm, "$1  \n");
}

/**
 * Sección `## Visor` de las notas de drones (enciclopedia de UAS): si hay
 * maqueta para esta nota (src/data/uas/<slug>.ts), la sección (título
 * incluido: en la web no sale) se cambia por un hueco donde la ficha pone el
 * visor; si no hay maqueta, se quita. Ver docs/hangar-de-uas.md.
 */
function colocarVisor(cuerpo, slug) {
  const seccion = /^##[ \t]+Visor[ \t]*\n[\s\S]*?(?=^##[ \t]|(?![\s\S]))/m;
  if (!seccion.test(cuerpo)) return cuerpo;
  const hayMaqueta = fs.existsSync(path.join(RAIZ, "src", "data", "uas", `${slug}.ts`));
  return cuerpo.replace(seccion, hayMaqueta ? "<div class=\"visor-hueco\"></div>\n\n" : "");
}

/** Pone en su propia línea los `![](tweet)` que van pegados a un texto. */
function separarTweetsDeLineas(cuerpo) {
  return cuerpo.replace(
    new RegExp(`^(.+\\S)[ \\t]*(!\\[[^\\]]*\\]\\(\\s*<?\\s*${RE_TWEET_URL.source}[^)]*>?\\s*\\))[ \\t]*$`, "gm"),
    "$1\n\n$2",
  );
}

/** IDs de todos los tweets embebidos (no los enlaces `[fuente](x.com...)`). */
function idsDeTweets(cuerpo) {
  const ids = new Set();
  const re = new RegExp(`!\\[[^\\]]*\\]\\(\\s*<?\\s*${RE_TWEET_URL.source}`, "g");
  let m;
  while ((m = re.exec(cuerpo))) ids.add(m[1]);
  for (const linea of cuerpo.split("\n")) {
    const mm = linea.trim().match(new RegExp(`^<?\\s*${RE_TWEET_URL.source}`));
    if (mm) ids.add(mm[1]);
  }
  return [...ids];
}

function insertarTarjetasTweet(cuerpo, { tweets, mediaMapa, videoMapa, tarjetas }) {
  const lineas = separarTweetsDeLineas(cuerpo).split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].trim().match(RE_TWEET_SUELTO);
    if (!m) continue;
    const tweet = tweets.get(m[1]);
    let html;
    if (tweet) {
      html = construirTarjeta(tweet, mediaMapa, videoMapa);
    } else if (tarjetas.has(m[1])) {
      // Tuit que X ya había borrado cuando se hizo el archivo: solo queda su
      // tarjeta, tal cual se hizo entonces.
      html = tarjetas.get(m[1]);
    } else {
      html = `> ⚠️ [Publicación de X no disponible](https://x.com/i/status/${m[1]})`;
    }
    // Envolvemos la tarjeta (HTML) en líneas en blanco: así el bloque HTML
    // queda siempre bien delimitado aunque en la bóveda no hubiera separación
    // entre el tweet y lo que venga después (si no, Markdown "se traga" el
    // texto siguiente y lo muestra en crudo).
    lineas[i] = `\n${html}\n`;
  }
  return lineas.join("\n");
}

/**
 * Las tarjetas de tweet (<blockquote class="tweet" data-tweet-id="...">) que
 * ya están hechas en src/content/, por ID. Solo se usan para un tuit que no
 * está en el archivo y X ya no sirve: se guarda su tarjeta tal cual.
 */
function recogerTarjetasExistentes() {
  const cache = new Map();
  const RE_BLOCKQUOTE = /<blockquote class="tweet" data-tweet-id="(\d+)">[\s\S]*?<\/blockquote>/g;
  const contenido = path.join(RAIZ, "src", "content");
  if (!fs.existsSync(contenido)) return cache;
  for (const archivo of buscarMarkdown(contenido)) {
    const texto = fs.readFileSync(archivo, "utf8");
    let m;
    while ((m = RE_BLOCKQUOTE.exec(texto))) {
      if (!cache.has(m[1])) cache.set(m[1], m[0]);
    }
  }
  return cache;
}

/** <blockquote class="tiktok-embed" cite="URL"> … </blockquote> -> cita estática. */
function convertirTikTok(cuerpo) {
  return cuerpo.replace(
    /<blockquote class="tiktok-embed"[^>]*cite="([^"]+)"[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_, cite, interior) => {
      const usuario = (interior.match(/@[\w.]+/) || [""])[0];
      const texto = interior
        .replace(/<[^>]+>/g, " ")
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400);
      return [
        `<blockquote class="tiktok">`,
        `  <p>${texto}</p>`,
        `  <a href="${cite}" target="_blank" rel="noopener">▶ Ver vídeo en TikTok${usuario ? ` (${usuario})` : ""}</a>`,
        `</blockquote>`,
      ].join("\n");
    },
  );
}

/**
 * Transforma el cuerpo. `resolver(destino)` devuelve la URL de un [[wikilink]]
 * o null. `copiarImagen(nombre)` copia la imagen y devuelve lo que va en el enlace.
 */
function transformarCuerpo(cuerpo, ctx) {
  const { resolver, copiarImagen, buscarOscura, copiarVideo, tweets, mediaMapa, videoMapa, tarjetas, esEventoSemana } = ctx;

  let s = cuerpo;

  // En las notas de "semana" quitamos la navegación manual y el "# Cronología":
  // la página del seguimiento ya pinta su propia navegación y el índice de días.
  if (esEventoSemana) {
    s = s.split("\n").filter((l) => {
      const t = l.trim();
      if (/\|\s*Semana\s+\d/i.test(t) && /\[\[/.test(t)) return false; // barra de nav
      if (/^\*\*D[ií]as de esta semana:\*\*/i.test(t)) return false;
      if (/^#\s+Cronolog[ií]a\s*$/i.test(t)) return false;
      return true;
    }).join("\n");
    s = s.replace(/^[\s\n]*(?:---[ \t]*\n[\s\n]*)?/, ""); // regla horizontal huérfana al inicio
    s = s.replace(/[\s\n]*(?:\n---[ \t]*)?[\s\n]*$/, "\n"); // ídem al final
  }

  s = convertirTikTok(s);
  s = insertarTarjetasTweet(s, { tweets, mediaMapa, videoMapa, tarjetas });

  // Adjuntos embebidos de Obsidian: ![[archivo.png]] / ![[archivo.png|123]] /
  // ![[archivo.mp4]]. Los vídeos locales se renderizan como <video>, el resto
  // como imagen.
  s = s.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, archivo, alt) => {
    archivo = archivo.trim();
    if (EXT_VIDEO.test(archivo)) {
      const copiado = copiarVideo(archivo);
      if (!copiado) {
        console.warn(`  ⚠ vídeo no encontrado: ${archivo}`);
        return `<!-- vídeo no encontrado: ${archivo} -->`;
      }
      // preload="none" (no "metadata"): así no dispara ninguna petición al
      // cargar la página. El CDN de GitHub Pages a veces responde mal a la
      // petición Range con la que el navegador pide los metadatos nada más
      // cargar (200 con el archivo entero en vez de 206 parcial), y eso hace
      // que el navegador dé el vídeo por no soportado. Con preload="none" no
      // se pide nada hasta que el usuario pulsa play, y ahí sí responde bien.
      return `\n<video controls playsinline preload="none" src="/adjuntos/${copiado}"></video>\n`;
    }
    const copiado = copiarImagen(archivo);
    if (!copiado) {
      console.warn(`  ⚠ imagen no encontrada: ${archivo}`);
      return `<!-- imagen no encontrada: ${archivo} -->`;
    }
    const etiqueta = /^\d+$/.test((alt || "").trim()) ? "" : (alt || "").trim();
    // Imagen de día y de noche: si hay «nombre-oscuro» junto a
    // «nombre-claro», van las dos seguidas y el CSS enseña la del tema.
    const oscura = /-claro\.[a-z]+$/i.test(archivo) && buscarOscura(archivo);
    const copiadaOscura = oscura && copiarImagen(oscura);
    if (copiadaOscura) return `![${etiqueta}](./${copiado})![${etiqueta}](./${copiadaOscura})`;
    return `![${etiqueta}](./${copiado})`;
  });

  // Imágenes locales en sintaxis Markdown: ![alt](imagen.png) o ![alt](<imagen.png>)
  s = s.replace(
    /!\[([^\]]*)\]\(\s*<?\s*([^)>]+?\.(?:png|jpe?g|webp|gif|svg|avif))(?:\|\d+)?\s*>?\s*\)/gi,
    (original, alt, ruta) => {
      ruta = ruta.trim();
      if (/^(https?:|\.\/)/i.test(ruta)) return original; // externa o ya procesada
      let nombre = path.basename(ruta);
      try { nombre = decodeURIComponent(nombre); } catch { /* deja el crudo */ }
      const copiado = copiarImagen(nombre);
      if (!copiado) {
        console.warn(`  ⚠ imagen no encontrada: ${nombre}`);
        return `<!-- imagen no encontrada: ${nombre} -->`;
      }
      return `![${alt.trim()}](./${copiado})`;
    },
  );

  // Enlaces internos: [[Nota]] / [[Nota#sección|texto]] / [[#sección|texto]]
  s = s.replace(/\[\[([^\]|#]*)(#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_, destino, ancla, texto) => {
    destino = (destino || "").trim();
    const anclaTxt = ancla ? "#" + generarAncla(ancla.slice(1).trim()) : "";
    // [[#sección]] sin texto se lee «sección», como en Obsidian.
    const etiqueta = (texto || (destino ? destino + (ancla || "") : ancla.slice(1))).trim();
    if (!destino) return `[${etiqueta}](${anclaTxt || "#"})`;
    const url = resolver(destino);
    if (url) return `[${etiqueta}](${url}${anclaTxt})`;
    return etiqueta; // destino no publicado: solo el texto
  });

  // Vídeos de YouTube embebidos como si fueran una imagen: ![](url). Van
  // antes de la regla genérica de abajo, si no se convertirían en un enlace.
  s = s.replace(RE_YOUTUBE, (_, id) => {
    return (
      `\n<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" ` +
      `title="Vídeo de YouTube" loading="lazy" allowfullscreen ` +
      `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe></div>\n`
    );
  });

  // "Imágenes" que son URLs a webs (no imágenes reales).
  s = s.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (original, alt, url) => {
    if (EXT_IMAGEN.test(url.split("?")[0])) return original;
    return `[${alt.trim() || "enlace"}](${url})`;
  });

  s = s.replace(/^\s*---\s*\n/, ""); // regla horizontal al empezar el cuerpo
  // "**\## Texto**" (negrita con almohadillas escapadas) -> negrita a secas.
  s = s.replace(/^\*\*\s*\\?#{1,6}\s*([^*\n]+?)\s*\*\*\s*$/gm, "**$1**");

  return s.trim() + "\n";
}

// --- Programa principal ------------------------------------------------

/** Rama de Git en la que está la web, o null si no se sabe. */
function ramaActual() {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** Todos los archivos que hay bajo `dir`, en cualquier subcarpeta. */
function archivosBajo(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? archivosBajo(p) : [p];
  });
}

/** Borra las carpetas que se han quedado vacías bajo `dir`. */
function borrarCarpetasVacias(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    borrarCarpetasVacias(p);
    if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
  }
}

/** Escribe `texto` en `ruta` solo si cambia. Devuelve "nueva", "cambiada" o null. */
function escribirSiCambia(ruta, texto) {
  const existe = fs.existsSync(ruta);
  if (existe && fs.readFileSync(ruta, "utf8") === texto) return null;
  fs.writeFileSync(ruta, texto);
  return existe ? "cambiada" : "nueva";
}

// --- Hitos del Sáhara --------------------------------------------------

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/**
 * El día con el que se ordena un hito, como AAAA-MM-DD: el primero que diga
 * su fecha («6 de noviembre de 1975», «Octubre de 1957 – Abril de 1958»,
 * «31 de octubre – 1 de noviembre de 2021», «Finales de 1962»). Del texto
 * hasta el primer año, el primer mes y el primer número.
 */
function ordenDeFecha(texto) {
  const t = texto.toLowerCase();
  const ano = t.match(/\b(1[5-9]\d\d|20\d\d)\b/);
  if (!ano) return null;
  const antes = t.slice(0, ano.index);
  const conMes = MESES_ES.map((m, i) => [antes.indexOf(m), i]).filter(([p]) => p >= 0).sort((x, y) => x[0] - y[0]);
  const mes = conMes.length ? conMes[0][1] : /finales/.test(antes) ? 11 : /mediados/.test(antes) ? 5 : 0;
  const dia = antes.match(/\b(\d{1,2})\b/);
  return `${ano[1]}-${String(mes + 1).padStart(2, "0")}-${String(dia ? dia[1] : 1).padStart(2, "0")}`;
}

/** [[Nota|texto]] -> texto, sin ** ni ==: los títulos de los hitos. */
function textoPlano(md) {
  return md.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, d, alias) => alias ?? d)
    .replace(/\*\*|==/g, "").trim();
}

/** El texto de un hito, a HTML: enlaces a lo publicado y negritas. */
function enLinea(md, resolver) {
  return md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, d, alias) => {
      const url = resolver(d);
      return url ? `<a href="${url}">${alias ?? d}</a>` : (alias ?? d);
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/==(.+?)==/g, "$1");
}

/**
 * Los hitos de la línea de tiempo del Sáhara: cada bloque que empieza por la
 * fecha (`>==**fecha**==`), con el título en la línea siguiente, el texto y
 * el lugar (`📍 Lugar`) hasta la línea en blanco.
 */
function hitosDeTimeline(content) {
  const hitos = [];
  let h = null;
  for (const linea of content.split("\n")) {
    const l = linea.trim();
    const fecha = l.match(/^>\s*==\*\*(.+?)\*\*==$/);
    if (fecha) {
      h = { fecha: fecha[1].trim(), titulo: null, texto: [], lugar: null };
      hitos.push(h);
    } else if (!h || !l || l.startsWith("#")) {
      h = null;
    } else if (h.titulo === null) {
      h.titulo = l.replace(/^[>*=\s]+|[*=\s]+$/g, "");
    } else if (l.startsWith("📍")) {
      h.lugar = l.replace(/^📍\s*/, "");
    } else {
      h.texto.push(l.replace(/^>\s?/, ""));
    }
  }
  return hitos;
}

// Los implicados de cada hito, por lo que dice su texto: palabra -> bandera
// (el código de src/data/banderas.json). Van en la ficha, en el orden en que
// salen. Los lugares (Madrid, Rabat) no cuentan: son el sitio, no el actor.
const IMPLICADOS = [
  [/\bEspañ(a|ola|oles|olas|ol)\b|franquista|\bFranco\b/i, "ES"],
  [/Marruecos|marroqu[ií](es)?|Hasán|Hassán|Mohamed VI|\bDGST\b|\bDGED\b/i, "MA"],
  [/Polisario|saharaui|\bRASD\b/i, "EH"],
  [/Mauritania|mauritan[oa]s?/i, "MR"],
  [/Argelia|argelin[oa]s?|\bArgel\b/i, "DZ"],
  [/Francia|franc[eé]s|francesa|Macron/i, "FR"],
  [/EE\. ?UU\.|Estados Unidos|estadounidense|Trump|Kissinger/i, "US"],
  [/Israel|israel[ií]/i, "IL"],
  [/Alemania|alem[aá]n(a)?/i, "DE"],
  [/Reino Unido|brit[aá]nic[oa]|Londres/i, "GB"],
  [/\bONU\b|Naciones Unidas|MINURSO|\bCIJ\b|Corte Internacional/i, "UN"],
  [/\bUE\b|Unión Europea|Parlamento Europeo|Eurocámara|TJUE|Justicia de la UE|eurodiputad/i, "EU"],
];

function implicados(texto) {
  return IMPLICADOS.map(([re, b]) => [texto.search(re), b]).filter(([i]) => i >= 0).sort((a, b) => a[0] - b[0]).map(([, b]) => b);
}

/**
 * src/data/sahara/hitos.json, lo que recorre el deslizador de /sahara, por
 * fecha. Salen de dos sitios:
 *  - los bloques de la línea de tiempo; si su título enlaza a una nota del
 *    Sáhara (o se llama como ella), el hito lleva a esa nota;
 *  - las notas del Sáhara con `periodo` y `lugar` a las que no lleva ningún
 *    hito de la línea de tiempo, con su primer párrafo como texto.
 * Las notas sin `periodo` (el Polisario, el Muro) son páginas, no hitos.
 */
function escribirHitosSahara(items, resolver) {
  const lugares = JSON.parse(fs.readFileSync(LUGARES_SAHARA, "utf8"));
  const delSahara = items.filter((it) => it.clase.tipo === "sahara");
  const notas = delSahara.filter((it) => !it.clase.timeline);
  const porSlug = new Map();
  for (const n of notas) {
    porSlug.set(generarSlug(n.titulo), n);
    porSlug.set(generarSlug(n.stem), n);
  }
  const timeline = delSahara.find((it) => it.clase.timeline);
  const hitos = [];
  const cubiertas = new Set();
  for (const h of timeline ? hitosDeTimeline(timeline.content) : []) {
    const enlazadas = [...h.titulo.matchAll(/\[\[([^\]|#]+)/g)].map((m) => porSlug.get(generarSlug(m[1]))).filter(Boolean);
    const nota = enlazadas[0] ?? porSlug.get(generarSlug(textoPlano(h.titulo))) ?? null;
    if (nota) cubiertas.add(nota);
    hitos.push({ fecha: h.fecha, titulo: textoPlano(h.titulo), texto: enLinea(h.texto.join(" "), resolver), lugar: h.lugar, nota });
  }
  for (const n of notas) {
    const periodo = primero(n.data.periodo), lugar = primero(n.data.lugar);
    if (cubiertas.has(n) || !periodo || !lugar) continue;
    hitos.push({
      fecha: String(periodo).trim(), titulo: n.titulo, lugar: String(lugar).trim(), nota: n,
      texto: enLinea(extraerDescripcion(n.content) ?? "", resolver),
    });
  }

  const avisos = [];
  const salida = hitos.map((h) => {
    const orden = ordenDeFecha(h.fecha);
    if (!orden) avisos.push(`sin año en la fecha: «${h.fecha}» (${h.titulo})`);
    if (!h.lugar) avisos.push(`sin lugar: ${h.titulo}`);
    else if (!lugares[h.lugar]) avisos.push(`lugar desconocido: «${h.lugar}» (${h.titulo}); añadirlo a src/data/sahara/lugares.json`);
    const lugar = lugares[h.lugar];
    return {
      id: generarSlug(`${orden ?? ""} ${h.titulo}`),
      fecha: h.fecha, orden: orden ?? "9999-12-31", titulo: h.titulo, texto: h.texto,
      lugar: h.lugar, coordenadas: lugar ? lugar.slice(0, 2) : null, banderaLugar: lugar?.[2] ?? null,
      banderas: implicados(`${h.titulo} ${h.texto.replace(/<[^>]+>/g, "")}`).slice(0, 4),   // como mucho 4
      nota: h.nota ? path.basename(h.nota.carpetaDestino) : null,
    };
  }).sort((a, b) => a.orden.localeCompare(b.orden));

  fs.mkdirSync(path.dirname(HITOS_SAHARA), { recursive: true });
  const estado = escribirSiCambia(HITOS_SAHARA, JSON.stringify(salida, null, 1) + "\n");
  console.log(`\nHitos del Sáhara: ${salida.length} (${salida.filter((h) => h.nota).length} con nota)${estado ? `, ${estado === "nueva" ? "nuevos" : "cambiados"}` : ", sin cambios"}.`);
  if (!timeline) console.warn("  ⚠ no encuentro la línea de tiempo (una nota del Sáhara que se llame «… Timeline»)");
  for (const a of avisos) console.warn(`  ⚠ ${a}`);
}

async function main() {
  if (!fs.existsSync(BOVEDA)) {
    console.error(`No encuentro la bóveda en: ${BOVEDA}`);
    process.exit(1);
  }
  // Las notas se publican desde main: en una rama de proyecto el contenido se
  // mezclaría con el proyecto.
  const rama = ramaActual();
  if (rama && rama !== "main" && !EN_ESTA_RAMA && !SOLO_SAHARA) {
    console.error(
      `Estás en la rama «${rama}». Las notas se publican desde main:\n\n` +
      "  git switch main\n\n" +
      "Para importar aquí de todas formas: npm run importar -- --en-esta-rama",
    );
    process.exit(1);
  }
  console.log(`Bóveda: ${BOVEDA}\n`);

  for (const d of [...DESTINOS, DESTINO_SAHARA, PUBLICO_ADJUNTOS]) fs.mkdirSync(d, { recursive: true });

  // Lo que escribe (o deja como estaba) esta importación en src/content/ y
  // public/adjuntos/. Al final se borra de ahí todo lo demás: es lo que ya
  // no se publica.
  const vigentes = new Set();

  const indiceImagenes = indexarImagenes();

  // Los vídeos van a una carpeta pública compartida (no a la del artículo,
  // como las imágenes), así que el nombre lleva un hash de su ruta dentro de
  // la bóveda para no colisionar si dos notas usan un vídeo con el mismo
  // nombre. Dentro de la bóveda: así sale igual en el Mac y en el PC.
  const copiarVideo = (nombre) => {
    nombre = nombre.normalize("NFC");
    const origen = indiceImagenes.get(nombre) || indiceImagenes.get(path.basename(nombre));
    if (!origen) return null;
    const ext = path.extname(origen).toLowerCase();
    const relativa = path.relative(BOVEDA, origen).split(path.sep).join("/").normalize("NFC");
    const hash = crypto.createHash("sha1").update(relativa).digest("hex").slice(0, 8);
    const base = `${generarSlug(path.basename(origen, ext))}-${hash}${ext}`;
    const destino = path.join(PUBLICO_ADJUNTOS, base);
    if (!estaAlDia(origen, destino)) fs.copyFileSync(origen, destino);
    vigentes.add(destino);
    return base;
  };

  // La versión de noche de una imagen «nombre-claro.ext»: «nombre-oscuro.*»
  // en cualquier formato de imagen, o null.
  const buscarOscura = (nombre) => {
    const base = nombre.normalize("NFC").replace(/-claro\.[a-z]+$/i, "-oscuro");
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      if (indiceImagenes.has(`${base}.${ext}`)) return `${base}.${ext}`;
    }
    return null;
  };

  // --- Pasada 1: recopilar lo publicado y construir el mapa de enlaces ---
  const items = [];
  for (const ruta of buscarMarkdown(BOVEDA)) {
    const { data, content } = matter(fs.readFileSync(ruta, "utf8"));
    const sahara = esDelSahara(data);
    if (data.publicar !== true && !(SOLO_SAHARA && BORRADORES && sahara)) continue;
    if (sahara && !SOLO_SAHARA) continue;            // el Sáhara va con importar-sahara
    const titulo = primero(data.titulo) || primero(data.title) || path.basename(ruta, ".md");
    const stem = path.basename(ruta, ".md");
    const clase = clasificar(ruta, data);
    if (!clase.tipo) {
      console.warn(`  ⚠ sin sección (tipo seguimiento, operacion o analisis), no se publica: ${path.relative(BOVEDA, ruta)}`);
      continue;
    }

    let url, carpetaDestino;
    const plana = { nota: ["notas", DESTINO_NOTAS], uas: ["uas", DESTINO_UAS], analisis: ["analisis", DESTINO_ANALISIS], operacion: ["operaciones", DESTINO_OPERACIONES], sahara: ["sahara", DESTINO_SAHARA] };
    if (plana[clase.tipo]) {
      const [base, destino] = plana[clase.tipo];
      const slug = generarSlug(titulo);
      if (clase.municion) {
        url = `/uas/armamento/${slug}`;
        carpetaDestino = path.join(DESTINO_UAS, "armamento", slug);
      } else {
        url = `/${base}/${slug}`;
        carpetaDestino = path.join(destino, slug);
      }
    } else {
      url = clase.kind === "index"
        ? `/seguimiento/${clase.eventoSlug}`
        : `/seguimiento/${clase.eventoSlug}/${clase.subSlug}`;
      carpetaDestino = clase.kind === "index"
        ? path.join(DESTINO_SEGUIMIENTOS, clase.eventoSlug)
        : path.join(DESTINO_SEGUIMIENTOS, clase.eventoSlug, clase.subSlug);
    }
    // Con --solo-sahara las demás notas solo sirven para resolver enlaces, y
    // la línea de tiempo no es una página: da los hitos.
    const escribe = !SOLO_SAHARA || (sahara && !clase.timeline);
    items.push({ ruta, data, content, titulo, stem, clase, url, carpetaDestino, escribe });
  }
  const aEscribir = items.filter((it) => it.escribe);

  if (items.length === 0) {
    console.log("No hay ninguna nota con `publicar: true`. Nada que importar.");
    return;
  }

  // Mapa para resolver [[wikilinks]]: por slug del título y del nombre de archivo.
  const mapaEnlaces = new Map();
  for (const it of items) {
    mapaEnlaces.set(generarSlug(it.titulo), it.url);
    mapaEnlaces.set(generarSlug(it.stem), it.url);
  }

  // Vídeo autoalojado: activado por defecto, pero se puede desactivar con
  // `videos_locales: false` en el frontmatter. En un seguimiento se lee solo del
  // índice y se aplica a todas sus páginas/semanas (no hace falta repetirlo
  // en cada una). Para esas notas, la tarjeta usa solo la fuente en
  // vivo de X, sin descargar ni comprimir nada.
  const eventoVideoLocal = new Map();
  for (const it of items) {
    if (it.clase.tipo === "seguimiento" && it.clase.kind === "index") {
      eventoVideoLocal.set(it.clase.eventoSlug, it.data.videos_locales !== false);
    }
  }
  const permiteVideoLocal = (it) => it.clase.tipo === "seguimiento"
    ? eventoVideoLocal.get(it.clase.eventoSlug) ?? true
    : it.data.videos_locales !== false;
  const resolver = (destino) => mapaEnlaces.get(generarSlug(destino)) || null;

  // --- Tuits: salen del archivo; a X solo se piden los que no están ---
  const archivo = leerArchivo(ARCHIVO_TUITS);
  const idsTweets = [...new Set(aEscribir.flatMap((it) => idsDeTweets(it.content)))];
  const pedir = idsTweets.filter((id) => REFRESCAR_TUITS || !archivo.has(id));
  let tuitsNuevos = 0;
  const noDisponibles = [];
  if (pedir.length) {
    console.log(`Pidiendo ${pedir.length} tuit(s) a X...`);
    const descargados = await enParalelo(pedir, 12, descargarTweet);
    const hoy = aFechaISO(new Date());
    let tarjetasHechas = null;
    for (const id of pedir) {
      const tuit = descargados.get(id);
      const previa = archivo.get(id);
      let entrada = null;
      if (tuit) {
        entrada = { capturado: previa?.capturado ?? hoy, tuit: recortarTuit(tuit) };
      } else if (!previa) {
        // X ya no lo da, pero puede que su tarjeta esté hecha de antes.
        tarjetasHechas ??= recogerTarjetasExistentes();
        if (tarjetasHechas.has(id)) entrada = { capturado: hoy, tarjeta: tarjetasHechas.get(id) };
      }
      if (entrada) {
        if (!previa) tuitsNuevos++;
        archivo.set(id, entrada);
        guardarEnArchivo(ARCHIVO_TUITS, id, entrada);
      } else if (!previa) {
        noDisponibles.push(id);
      }
    }
  }

  const tweets = new Map();
  const tarjetas = new Map();
  for (const id of idsTweets) {
    const entrada = archivo.get(id);
    if (entrada?.tuit) tweets.set(id, entrada.tuit);
    else if (entrada?.tarjeta) tarjetas.set(id, entrada.tarjeta);
  }

  // Imágenes y vídeos: solo se bajan los que no están ya en public/tweets/.
  const mediaMapa = await descargarMedia([...tweets.values()].flatMap(mediaDeTweet), PUBLICO_TWEETS, "/tweets");
  const idsSinVideoLocal = new Set(
    aEscribir.filter((it) => !permiteVideoLocal(it)).flatMap((it) => idsDeTweets(it.content)),
  );
  const videoUrls = [...tweets.values()]
    .filter((t) => !idsSinVideoLocal.has(t.id_str))
    .flatMap(videosDeTweet);
  const videoMapa = await descargarVideos(videoUrls, PUBLICO_TWEETS, "/tweets");

  // --- Pasada 2: escribir cada archivo ---
  const cuenta = {};
  const resumen = { nueva: [], cambiada: [] };

  for (const it of aEscribir) {
    fs.mkdirSync(it.carpetaDestino, { recursive: true });

    // Reducir una foto es asíncrono y transformarCuerpo no, así que aquí se
    // deja una marca en el texto y se cambia por el nombre final al terminar.
    const fotos = new Map(); // origen -> { marca, promesa }
    const copiarImagen = (nombre) => {
      nombre = nombre.normalize("NFC");
      const origen = indiceImagenes.get(nombre) || indiceImagenes.get(path.basename(nombre));
      if (!origen) return null;
      if (!fotos.has(origen)) {
        const base = generarSlug(path.basename(origen, path.extname(origen)));
        fotos.set(origen, {
          marca: `\u0000foto${fotos.size}\u0000`,
          promesa: copiarFoto(origen, it.carpetaDestino, base),
        });
      }
      return fotos.get(origen).marca;
    };

    let cuerpo = transformarCuerpo(it.content, {
      resolver, copiarImagen, buscarOscura, copiarVideo, tweets, mediaMapa, videoMapa, tarjetas,
      esEventoSemana: it.clase.kind === "semana",
    });
    let fotoNueva = false;
    for (const { marca, promesa } of fotos.values()) {
      const { nombre, nueva } = await promesa;
      cuerpo = cuerpo.replaceAll(marca, nombre);
      vigentes.add(path.join(it.carpetaDestino, nombre));
      fotoNueva ||= nueva;
    }
    cuerpo = resaltados(cuerpo);
    const esDron = it.clase.tipo === "uas" && !it.clase.glosario && !it.clase.armamento && !it.clase.municion;
    if (esDron) cuerpo = saltosEnListas(colocarVisor(cuerpo, path.basename(it.carpetaDestino)));
    // El índice del armamento lo monta la página (ArmamentoLista) con las
    // municiones, en el orden y los grupos del índice de la nota (`grupos`);
    // la lista, que sirve en Obsidian, sobra.
    if (it.clase.armamento) cuerpo = cuerpo.replace(/^## Índice\n[\s\S]*?(?=^## |(?![\s\S]))/m, "").trimEnd() + "\n";

    const fm = {
      title: it.titulo,
      date: aFechaISO(primero(it.data.creado) || primero(it.data.created)) || aFechaISO(new Date()),
    };
    // En una munición, la descripción es su primer párrafo, no el pie de foto.
    const desc = extraerDescripcion(it.clase.municion ? sinFotosNiTabla(it.content) : it.content);
    if (desc) fm.description = desc;
    const actualizado = parsearFechaActualizado(primero(it.data.actualizado));
    if (actualizado) fm.updated = aFechaISO(actualizado);
    if (Array.isArray(it.data.tags) && it.data.tags.length) fm.tags = it.data.tags.map(String);
    if (it.clase.glosario) fm.glosario = true;
    else if (it.clase.armamento) {
      fm.armamento = true;
      fm.grupos = gruposDelIndice(it.content, resolver);
    } else if (it.clase.municion) {
      fm.municion = true;
      Object.assign(fm, paisDeFicha(it.content));
      const tipo = it.content.match(/^\|\s*\*\*Tipo\*\*\s*\|\s*(.+?)\s*\|\s*$/m)?.[1];
      if (tipo) fm.categoria = tipo;
    } else if (esDron) Object.assign(fm, paisDeFicha(it.content));

    if (it.clase.opinion) fm.opinion = true;
    if (it.clase.tipo === "operacion" || it.clase.tipo === "sahara") {
      const periodo = primero(it.data.periodo);
      if (periodo) fm.periodo = String(periodo).trim();
    }
    if (it.clase.tipo === "sahara") {
      const lugar = primero(it.data.lugar);
      if (lugar) fm.lugar = String(lugar).trim();
      if (it.data.publicar !== true) fm.borrador = true;
    }
    if (it.clase.tipo === "seguimiento") {
      fm.kind = it.clase.kind;
      fm.evento = it.clase.eventoSlug;
      fm.orden = it.clase.orden;
      if (it.clase.rango) fm.rango = it.clase.rango;
      // "periodo": texto libre en la nota índice de la bóveda con las fechas
      // reales del suceso (no la de creación de la nota). Solo en el "index".
      if (it.clase.kind === "index") {
        const periodo = primero(it.data.periodo);
        if (periodo) fm.periodo = String(periodo).trim();
      }
      // Título limpio para la pestaña del navegador; el "SEMANA 4 - 20 AGOSTO..."
      // del archivo no se enseña.
      if (it.clase.kind === "semana") fm.title = `Semana ${it.clase.orden}`;
    }

    const ruta = path.join(it.carpetaDestino, "index.md");
    vigentes.add(ruta);
    const estado = escribirSiCambia(ruta, matter.stringify(cuerpo, fm)) ?? (fotoNueva ? "cambiada" : null);
    if (estado) resumen[estado].push(`${it.titulo}  (${it.url})`);
    cuenta[it.clase.tipo] = (cuenta[it.clase.tipo] ?? 0) + 1;
  }

  // --- Limpieza: lo que ya no se publica ---
  // Los vídeos de public/adjuntos/ que usan las notas del Sáhara se quedan
  // aunque esta importación no las trate (y al revés).
  const tocadas = SOLO_SAHARA ? [DESTINO_SAHARA] : [...DESTINOS, PUBLICO_ADJUNTOS];
  const ajenas = SOLO_SAHARA ? [] : [DESTINO_SAHARA];
  for (const ruta of ajenas.flatMap(archivosBajo)) {
    if (!ruta.endsWith(".md")) continue;
    for (const m of fs.readFileSync(ruta, "utf8").matchAll(/\/adjuntos\/([^"\s)]+)/g)) {
      vigentes.add(path.join(PUBLICO_ADJUNTOS, m[1]));
    }
  }
  const retiradas = [];
  for (const dir of tocadas) {
    for (const ruta of archivosBajo(dir)) {
      if (vigentes.has(ruta)) continue;
      if (path.basename(ruta) === "index.md") {
        const titulo = matter(fs.readFileSync(ruta, "utf8")).data.title;
        retiradas.push(`${titulo}  (${path.relative(path.join(RAIZ, "src", "content"), path.dirname(ruta))})`);
      }
      fs.rmSync(ruta);
    }
    borrarCarpetasVacias(dir);
  }
  // En public/tweets/ se queda todo lo de los tuits del archivo, aunque ya no
  // salgan en ninguna nota, y lo que enlace alguna tarjeta. Lo demás (avatares
  // que X cambió, restos de antes del archivo) sobra.
  const enUso = new Set([...archivo.values()].flatMap(archivosDeTuit));
  for (const ruta of [...DESTINOS, DESTINO_SAHARA].flatMap(archivosBajo)) {
    if (!ruta.endsWith(".md")) continue;
    for (const m of fs.readFileSync(ruta, "utf8").matchAll(/\/tweets\/([^"\s)]+)/g)) enUso.add(m[1]);
  }
  let tuitsSobrantes = 0;
  for (const nombre of SOLO_SAHARA ? [] : fs.readdirSync(PUBLICO_TWEETS)) {
    if (enUso.has(nombre)) continue;
    fs.rmSync(path.join(PUBLICO_TWEETS, nombre));
    tuitsSobrantes++;
  }

  if (SOLO_SAHARA) escribirHitosSahara(items, resolver);

  // --- Resumen ---
  const lista = (titulos) => (titulos.length ? titulos.map((t) => `\n    ${t}`).join("") : " —");
  console.log(`\nNuevas:${lista(resumen.nueva)}`);
  console.log(`Cambiadas:${lista(resumen.cambiada)}`);
  console.log(`Retiradas:${lista(retiradas)}`);
  const guardados = idsTweets.length - tuitsNuevos - noDisponibles.length;
  console.log(`Tuits: ${tuitsNuevos} nuevo(s) en el archivo, ${guardados} ya guardado(s).`);
  if (noDisponibles.length) {
    console.log(`  ${noDisponibles.length} que X ya no da y no se llegaron a guardar (salen como enlace): ${noDisponibles.join(", ")}`);
  }
  if (tuitsSobrantes) console.log(`  Borradas ${tuitsSobrantes} imagen(es) de public/tweets/ que ya no usa ningún tuit.`);
  console.log(`\nEn la web: ${Object.entries(cuenta).map(([t, n]) => `${n} ${t}`).join(", ")}.`);
}


main().catch((e) => {
  console.error(e);
  process.exit(1);
});
