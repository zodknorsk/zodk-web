// ---------------------------------------------------------------------------
// tweets.mjs  —  utilidades para "hornear" tweets al importar
//
// Idea: en vez de embeber el tweet con JavaScript de X (que trae cookies, es
// lento y se rompe cuando X cambia su API), al importar una nota descargamos el
// tweet una sola vez y escribimos una TARJETA HTML FIJA dentro del Markdown.
// La web resultante no depende de X para nada.
//
// Fuente de datos: el CDN de "syndication" de X, el mismo que usan los widgets
// oficiales:  https://cdn.syndication.twimg.com/tweet-result?id=...&token=...
// Devuelve un JSON con autor, texto, fecha, enlaces y multimedia.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";

/**
 * El endpoint de syndication pide un "token" que se deriva del ID del tweet.
 * Este es el mismo cálculo que usa la librería oficial react-tweet.
 */
function calcularToken(id) {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36) // base 36
    .replace(/(0+|\.)/g, "");
}

/**
 * Descarga los datos de un tweet. Devuelve el objeto JSON, o null si el tweet
 * no existe, está borrado, es de una cuenta protegida o X no responde.
 */
export async function descargarTweet(id) {
  const url =
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}` +
    `&token=${calcularToken(id)}&lang=es`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || j.__typename !== "Tweet") return null; // "TweetTombstone" = borrado
    return j;
  } catch {
    return null;
  }
}

/** Lanza `fn` sobre cada elemento de `items` con como mucho `limite` en paralelo. */
export async function enParalelo(items, limite, fn) {
  const resultado = new Map();
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const actual = items[i++];
      resultado.set(actual, await fn(actual));
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, worker),
  );
  return resultado;
}

// --- Construcción de la tarjeta HTML ------------------------------------

function escaparHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Pasa el texto plano del tweet a HTML: enlaces t.co, @menciones, #hashtags. */
function formatearTexto(tweet) {
  let texto = tweet.text || "";

  // El texto trae al final la URL t.co de la imagen/vídeo adjuntos; se quita.
  for (const media of tweet.mediaDetails || []) {
    if (media.url) texto = texto.replace(media.url, "");
  }
  texto = texto.replace(/\s*https:\/\/t\.co\/\w+\s*$/, "");

  texto = escaparHtml(texto.trim());

  // Los "tweets largos" (X Premium) llegan recortados: el CDN solo da el
  // principio. Se marca con puntos suspensivos y el enlace "ver en X" basta.
  if (tweet.note_tweet) texto += " […]";

  // Enlaces reales (t.co -> URL de verdad, mostrando el dominio).
  for (const u of tweet.entities?.urls || []) {
    if (!u.url) continue;
    texto = texto.replaceAll(
      u.url,
      `<a href="${escaparHtml(u.expanded_url)}" target="_blank" rel="noopener">${escaparHtml(u.display_url)}</a>`,
    );
  }

  texto = texto
    .replace(
      /(^|[^\w@\/])@(\w{1,15})/g,
      '$1<a href="https://x.com/$2" target="_blank" rel="noopener">@$2</a>',
    )
    .replace(
      /(^|[^\w&\/])#([\p{L}\p{N}_]+)/gu,
      '$1<a href="https://x.com/hashtag/$2" target="_blank" rel="noopener">#$2</a>',
    )
    .replace(/\n/g, "<br>\n");

  return texto;
}

function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Devuelve el HTML de la tarjeta del tweet. `descargar(url, base)` guarda un
 * archivo y devuelve la ruta web con la que enlazarlo (p. ej. "/tweets/x.jpg").
 */
export async function construirTarjeta(tweet, descargar) {
  const id = tweet.id_str;
  const usuario = tweet.user || {};
  const handle = usuario.screen_name || "i";
  const urlTweet = `https://x.com/${handle}/status/${id}`;

  // Avatar (versión un poco más grande que la "_normal" de 48px).
  let avatar = "";
  if (usuario.profile_image_url_https) {
    try {
      avatar = await descargar(
        usuario.profile_image_url_https.replace("_normal.", "_bigger."),
        `${id}-avatar`,
      );
    } catch {
      /* si falla, la tarjeta se muestra sin avatar */
    }
  }

  // Multimedia: fotos tal cual; vídeos/gifs como su miniatura enlazada a X.
  const bloquesMedia = [];
  for (const [n, media] of (tweet.mediaDetails || []).entries()) {
    if (!media.media_url_https) continue;
    try {
      const archivo = await descargar(
        `${media.media_url_https}?name=medium`,
        `${id}-media-${n + 1}`,
      );
      if (media.type === "photo") {
        bloquesMedia.push(
          `  <img class="tweet-media" src="${archivo}" alt="Imagen del tweet" loading="lazy" />`,
        );
      } else {
        bloquesMedia.push(
          `  <a class="tweet-media tweet-media-video" href="${urlTweet}" target="_blank" rel="noopener">` +
            `<img src="${archivo}" alt="Miniatura del vídeo" loading="lazy" />` +
            `<span>▶ Ver vídeo en X</span></a>`,
        );
      }
    } catch {
      /* si una imagen falla, se omite */
    }
  }

  return [
    `<blockquote class="tweet" data-tweet-id="${id}">`,
    `  <a class="tweet-author" href="${urlTweet}" target="_blank" rel="noopener">`,
    avatar
      ? `    <img class="tweet-avatar" src="${avatar}" alt="" width="44" height="44" loading="lazy" />`
      : "",
    `    <span class="tweet-name">${escaparHtml(usuario.name || handle)}</span>`,
    `    <span class="tweet-handle">@${escaparHtml(handle)}</span>`,
    `  </a>`,
    `  <div class="tweet-text">${formatearTexto(tweet)}</div>`,
    ...bloquesMedia,
    `  <a class="tweet-date" href="${urlTweet}" target="_blank" rel="noopener">${formatearFecha(tweet.created_at)}</a>`,
    `</blockquote>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Crea la función que descarga imágenes de tweets. Los archivos se guardan en
 * `dirDestino` (una carpeta dentro de public/) y la función devuelve su ruta web
 * (`rutaWeb` + "/" + nombre), lista para poner en un src="".
 *
 * Van a public/ y no a la carpeta de la nota porque Astro solo procesa las
 * imágenes escritas con la sintaxis Markdown `![]()`, no las de un <img> suelto
 * dentro de HTML como el de estas tarjetas.
 */
export function crearDescargador(dirDestino, rutaWeb) {
  fs.mkdirSync(dirDestino, { recursive: true });
  return async (url, nombreBase) => {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error(`descarga ${r.status}: ${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = (url.match(/\.(jpe?g|png|webp|gif)/i)?.[1] || "jpg").toLowerCase();
    const nombre = `${nombreBase}.${ext === "jpeg" ? "jpg" : ext}`;
    fs.writeFileSync(path.join(dirDestino, nombre), buf);
    return `${rutaWeb}/${nombre}`;
  };
}
