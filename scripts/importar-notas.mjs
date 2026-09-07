// ---------------------------------------------------------------------------
// importar-notas.mjs
//
// Puente entre la bóveda de Obsidian y la web.
//
//   1. Recorre la bóveda y se queda con los .md que tienen `publicar: true`.
//   2. Clasifica cada uno:
//        - "03 - Eventos/<carpeta>/..."  -> colección "eventos" (jerárquica)
//        - el resto                      -> colección "notas" (plana)
//   3. Traduce el frontmatter en español al que esperan las colecciones de Astro.
//   4. Convierte la sintaxis de Obsidian a Markdown/HTML estándar:
//        - ![[imagen.png]]  y  ![](<imagen.png>)   -> ![](./imagen.png) + copia
//        - [[Nota]] / [[Nota#sección|texto]]       -> enlace resuelto (o texto)
//        - URL de tweet embebida (![](x.com/...))  -> tarjeta HTML ya descargada
//        - <blockquote class="tiktok-embed">       -> cita estática con enlace
//   5. Escribe el resultado en src/content/{notas,eventos}/ (se regenera entero
//      cada vez) y las imágenes de tweets en public/tweets/.
//
// Uso:   npm run importar          (BOVEDA_PATH=... para otra ruta)
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import {
  descargarTweet,
  enParalelo,
  mediaDeTweet,
  descargarMedia,
  construirTarjeta,
} from "./tweets.mjs";

// --- Config ----------------------------------------------------------------

const BOVEDA = process.env.BOVEDA_PATH
  || path.join(os.homedir(), "Documents", "boveda-osint");

const RAIZ = process.cwd();
const DESTINO_NOTAS = path.join(RAIZ, "src", "content", "notas");
const DESTINO_EVENTOS = path.join(RAIZ, "src", "content", "eventos");
const PUBLICO_TWEETS = path.join(RAIZ, "public", "tweets");

const CARPETA_EVENTOS = "03 - Eventos";
const CARPETAS_IGNORADAS = new Set([
  ".git", ".obsidian", ".trash", "00 - Meta", "07 - Clippings", "Adjuntos",
]);

// URL de un tweet, opcionalmente envuelta en `![](...)` o entre `<...>`.
const RE_TWEET_URL =
  /https?:\/\/(?:mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/(\d+)/;
const RE_TWEET_SUELTO = new RegExp(
  `^(?:!\\[[^\\]]*\\]\\(\\s*)?<?\\s*${RE_TWEET_URL.source}\\S*\\s*>?\\s*\\)?$`,
);
const EXT_IMAGEN = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

// --- Utilidades generales ------------------------------------------------

function buscarMarkdown(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (CARPETAS_IGNORADAS.has(e.name)) continue;
      out.push(...buscarMarkdown(p));
    } else if (e.name.endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

function indexarImagenes() {
  const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
  const indice = new Map();
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if ([".git", ".obsidian", ".trash"].includes(e.name)) continue;
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
/** Slug para URLs (sin tildes, minúsculas, con guiones). */
function generarSlug(texto) {
  slugger.reset();
  return slugger.slug(texto.normalize("NFD").replace(/[̀-ͯ]/g, ""));
}
/** Ancla de encabezado, igual que las que genera Astro (conserva tildes). */
function generarAncla(texto) {
  slugger.reset();
  return slugger.slug(texto);
}

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

function parsearFechaActualizado(valor) {
  if (typeof valor !== "string") return undefined;
  const m = valor.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh = "0", min = "0"] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
}

const primero = (v) => (Array.isArray(v) ? v[0] : v);

const MESES = {
  enero: "ene", febrero: "feb", marzo: "mar", abril: "abr", mayo: "may",
  junio: "jun", julio: "jul", agosto: "ago", septiembre: "sep",
  octubre: "oct", noviembre: "nov", diciembre: "dic",
};
/** "30 JULIO al 05 AGOSTO" -> "30 jul – 5 ago" */
function formatearRango(texto) {
  return texto
    .toLowerCase()
    .replace(/\b(0)(\d)\b/g, "$2")
    .replace(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/g,
      (m) => MESES[m])
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

// --- Clasificación nota / evento ---------------------------------------

/**
 * Decide a qué colección va un archivo y, si es un evento, qué papel tiene.
 * Devuelve { tipo:"nota" }  ó
 *          { tipo:"evento", eventoSlug, kind, orden, rango, subSlug }
 */
function clasificar(ruta) {
  const partes = path.relative(BOVEDA, ruta).split(path.sep);
  if (partes[0] !== CARPETA_EVENTOS || partes.length < 3) return { tipo: "nota" };

  const carpetaEvento = partes[1];
  const eventoSlug = generarSlug(carpetaEvento);
  const stem = path.basename(ruta, ".md");

  if (stem === carpetaEvento) {
    return { tipo: "evento", eventoSlug, kind: "index", orden: 0, subSlug: "" };
  }
  const mSemana = stem.match(/^SEMANA\s+(\d+)\s*[-–—]\s*(.+)$/i);
  if (mSemana) {
    const orden = parseInt(mSemana[1], 10);
    return {
      tipo: "evento", eventoSlug, kind: "semana", orden,
      rango: formatearRango(mSemana[2]),
      subSlug: `semana-${String(orden).padStart(2, "0")}`,
    };
  }
  return { tipo: "evento", eventoSlug, kind: "pagina", orden: 0, subSlug: generarSlug(stem) };
}

// --- Transformación del cuerpo ----------------------------------------

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

function insertarTarjetasTweet(cuerpo, { tweets, mediaMapa }) {
  const lineas = separarTweetsDeLineas(cuerpo).split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].trim().match(RE_TWEET_SUELTO);
    if (!m) continue;
    const tweet = tweets.get(m[1]);
    // Envolvemos la tarjeta (HTML) en líneas en blanco: así el bloque HTML
    // queda siempre bien delimitado aunque en la bóveda no hubiera separación
    // entre el tweet y lo que venga después (si no, Markdown "se traga" el
    // texto siguiente y lo muestra en crudo).
    lineas[i] = tweet
      ? `\n${construirTarjeta(tweet, mediaMapa)}\n`
      : `\n> ⚠️ [Publicación de X no disponible](https://x.com/i/status/${m[1]})\n`;
  }
  return lineas.join("\n");
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
 * o null. `copiarImagen(nombre)` copia la imagen y devuelve su nombre final.
 */
function transformarCuerpo(cuerpo, ctx) {
  const { resolver, copiarImagen, tweets, mediaMapa, esEventoSemana } = ctx;

  let s = cuerpo;

  // En las notas de "semana" quitamos la navegación manual y el "# Cronología":
  // la página del evento ya pinta su propia navegación y el índice de días.
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
  s = insertarTarjetasTweet(s, { tweets, mediaMapa });

  // Imágenes embebidas de Obsidian: ![[archivo.png]] / ![[archivo.png|123]]
  s = s.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, archivo, alt) => {
    const copiado = copiarImagen(archivo.trim());
    if (!copiado) {
      console.warn(`  ⚠ imagen no encontrada: ${archivo.trim()}`);
      return `<!-- imagen no encontrada: ${archivo.trim()} -->`;
    }
    const etiqueta = /^\d+$/.test((alt || "").trim()) ? "" : (alt || "").trim();
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
    const etiqueta = (texto || (destino + (ancla || ""))).trim();
    if (!destino) return `[${etiqueta}](${anclaTxt || "#"})`;
    const url = resolver(destino);
    if (url) return `[${etiqueta}](${url}${anclaTxt})`;
    return etiqueta; // destino no publicado: solo el texto
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

async function main() {
  if (!fs.existsSync(BOVEDA)) {
    console.error(`No encuentro la bóveda en: ${BOVEDA}`);
    process.exit(1);
  }
  console.log(`Bóveda: ${BOVEDA}\n`);

  // El contenido generado se regenera entero. public/tweets/ NO se borra: sirve
  // de caché de imágenes entre ejecuciones (bórrala a mano si quieres limpiarla).
  for (const d of [DESTINO_NOTAS, DESTINO_EVENTOS]) {
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(d, { recursive: true });
  }
  // Astro cachea el contenido en .astro/; si no se limpia, al regenerar las
  // carpetas se queja de "Duplicate id". Se borran las dos ubicaciones.
  for (const c of [".astro", "node_modules/.astro"]) {
    fs.rmSync(path.join(RAIZ, c), { recursive: true, force: true });
  }

  const indiceImagenes = indexarImagenes();

  // --- Pasada 1: recopilar lo publicado y construir el mapa de enlaces ---
  const items = [];
  for (const ruta of buscarMarkdown(BOVEDA)) {
    const { data, content } = matter(fs.readFileSync(ruta, "utf8"));
    if (data.publicar !== true) continue;
    const titulo = primero(data.titulo) || primero(data.title) || path.basename(ruta, ".md");
    const stem = path.basename(ruta, ".md");
    const clase = clasificar(ruta);

    let url, carpetaDestino;
    if (clase.tipo === "nota") {
      const slug = generarSlug(titulo);
      url = `/notas/${slug}`;
      carpetaDestino = path.join(DESTINO_NOTAS, slug);
    } else {
      url = clase.kind === "index"
        ? `/eventos/${clase.eventoSlug}`
        : `/eventos/${clase.eventoSlug}/${clase.subSlug}`;
      carpetaDestino = clase.kind === "index"
        ? path.join(DESTINO_EVENTOS, clase.eventoSlug)
        : path.join(DESTINO_EVENTOS, clase.eventoSlug, clase.subSlug);
    }
    items.push({ ruta, data, content, titulo, stem, clase, url, carpetaDestino });
  }

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
  const resolver = (destino) => mapaEnlaces.get(generarSlug(destino)) || null;

  // --- Descarga de tweets: primero los JSON, luego todas sus imágenes ---
  const idsTweets = [...new Set(items.flatMap((it) => idsDeTweets(it.content)))];
  let tweets = new Map();
  let mediaMapa = new Map();
  if (idsTweets.length) {
    console.log(`Descargando ${idsTweets.length} tweet(s) de X...`);
    tweets = await enParalelo(idsTweets, 12, descargarTweet);
    const validos = [...tweets.values()].filter(Boolean);
    const fallidos = tweets.size - validos.length;
    if (fallidos) console.log(`  ${fallidos} no disponibles (se pondrán como enlace).`);

    const mediaUrls = validos.flatMap(mediaDeTweet);
    console.log(`Descargando ${new Set(mediaUrls).size} imagen(es) de tweets...`);
    mediaMapa = await descargarMedia(mediaUrls, PUBLICO_TWEETS, "/tweets");
  }

  // --- Pasada 2: escribir cada archivo ---
  let nNotas = 0, nEventos = 0;

  for (const it of items) {
    fs.mkdirSync(it.carpetaDestino, { recursive: true });

    const copiarImagen = (nombre) => {
      const origen = indiceImagenes.get(nombre) || indiceImagenes.get(path.basename(nombre));
      if (!origen) return null;
      const ext = path.extname(origen);
      const base = generarSlug(path.basename(origen, ext)) + ext.toLowerCase();
      fs.copyFileSync(origen, path.join(it.carpetaDestino, base));
      return base;
    };

    const cuerpo = transformarCuerpo(it.content, {
      resolver, copiarImagen, tweets, mediaMapa,
      esEventoSemana: it.clase.kind === "semana",
    });

    const fm = {
      title: it.titulo,
      date: aFechaISO(primero(it.data.creado) || primero(it.data.created)) || aFechaISO(new Date()),
    };
    const desc = extraerDescripcion(it.content);
    if (desc) fm.description = desc;
    const actualizado = parsearFechaActualizado(primero(it.data.actualizado));
    if (actualizado) fm.updated = aFechaISO(actualizado);
    if (Array.isArray(it.data.tags) && it.data.tags.length) fm.tags = it.data.tags.map(String);

    if (it.clase.tipo === "evento") {
      fm.kind = it.clase.kind;
      fm.evento = it.clase.eventoSlug;
      fm.orden = it.clase.orden;
      if (it.clase.rango) fm.rango = it.clase.rango;
      // Título limpio para la pestaña del navegador; el "SEMANA 4 - 20 AGOSTO..."
      // del archivo no se enseña.
      if (it.clase.kind === "semana") fm.title = `Semana ${it.clase.orden}`;
    }

    fs.writeFileSync(path.join(it.carpetaDestino, "index.md"), matter.stringify(cuerpo, fm));
    if (it.clase.tipo === "evento") {
      nEventos++;
      console.log(`  ✓ evento  ${it.url}`);
    } else {
      nNotas++;
      console.log(`  ✓ nota    ${it.url}`);
    }
  }

  console.log(`\nListo: ${nNotas} nota(s), ${nEventos} archivo(s) de evento.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
