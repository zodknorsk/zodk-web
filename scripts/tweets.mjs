// ---------------------------------------------------------------------------
// tweets.mjs  —  utilidades para "hornear" tweets al importar
//
// Idea: en vez de embeber el tweet con el JavaScript de X (cookies, lento, se
// rompe cuando X cambia su API), al importar descargamos el tweet una vez y
// escribimos una TARJETA HTML FIJA dentro del Markdown. La web no depende de X.
//
// Fuente: el CDN de "syndication" de X (el mismo que usan los widgets):
//   https://cdn.syndication.twimg.com/tweet-result?id=...&token=...
//
// Flujo pensado para volumen (cientos de tweets):
//   1. descargarTweet(id)     -> JSON del tweet          (en paralelo, con pool)
//   2. mediaDeTweet(tweet)    -> lista de URLs de imágenes que necesita
//   3. descargarMedia(urls)   -> baja todas en paralelo, devuelve Map url->rutaWeb
//   4. videosDeTweet(tweet)   -> URL del mp4 en vivo de cada vídeo del tweet
//   5. descargarVideos(urls)  -> descarga + comprime cada uno con ffmpeg,
//                                 devuelve Map urlEnVivo->rutaWeb (o nada si falla)
//   6. construirTarjeta(tweet, mapa, mapaVideo) -> HTML (síncrono)
//
// Vídeo: la tarjeta lleva DOS <source>, en este orden: primero la URL en vivo
// de video.twimg.com (mejor calidad, no gasta banda propia mientras X esté
// viva) y después la copia comprimida ya alojada aquí. Si la primera falla en
// el navegador (tweet borrado, cuenta suspendida...), el <video> pasa solo a
// la segunda: el vídeo se sigue viendo aunque X ya no lo sirva.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

/** El endpoint de syndication pide un "token" derivado del ID (igual que react-tweet). */
function calcularToken(id) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

/** JSON de un tweet, o null si no existe / está borrado / X no responde. */
export async function descargarTweet(id) {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${id}` +
    `&token=${calcularToken(id)}&lang=es`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.__typename === "Tweet" ? j : null; // "TweetTombstone" = borrado
  } catch {
    return null;
  }
}

/** Ejecuta `fn` sobre cada item con como mucho `limite` en paralelo. */
export async function enParalelo(items, limite, fn) {
  const resultado = new Map();
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const actual = items[i++];
      resultado.set(actual, await fn(actual));
    }
  };
  await Promise.all(Array.from({ length: Math.min(limite, items.length) || 1 }, worker));
  return resultado;
}

// --- Multimedia --------------------------------------------------------

/** URLs de imágenes que hay que descargar para la tarjeta (avatar + media). */
export function mediaDeTweet(tweet) {
  const urls = [];
  const avatar = tweet.user?.profile_image_url_https;
  if (avatar) urls.push(avatar.replace("_normal.", "_bigger."));
  for (const m of tweet.mediaDetails || []) {
    if (m.media_url_https) urls.push(`${m.media_url_https}?name=medium`);
  }
  return urls;
}

function nombreDesdeUrl(url) {
  const limpia = url.split("?")[0];
  const base = limpia.split("/").slice(-2).join("-").replace(/[^\w.-]/g, "");
  if (/\.(jpe?g|png|webp|gif)$/i.test(base)) return base.toLowerCase();
  const ext = (limpia.match(/\.(jpe?g|png|webp|gif)/i)?.[1] || "jpg").toLowerCase();
  return `${base}.${ext === "jpeg" ? "jpg" : ext}`.toLowerCase();
}

/**
 * Descarga en paralelo una lista de URLs de imágenes (deduplicadas) a
 * `dirDestino` (dentro de public/). Devuelve un Map  url -> rutaWeb.
 * Si ya existe el archivo, no lo vuelve a descargar (caché entre ejecuciones).
 */
export async function descargarMedia(urls, dirDestino, rutaWeb, limite = 16) {
  fs.mkdirSync(dirDestino, { recursive: true });
  const unicas = [...new Set(urls)];
  const mapa = new Map();
  await enParalelo(unicas, limite, async (url) => {
    const nombre = nombreDesdeUrl(url);
    const destino = path.join(dirDestino, nombre);
    const web = `${rutaWeb}/${nombre}`;
    if (fs.existsSync(destino)) {
      mapa.set(url, web);
      return;
    }
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) return;
      fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      mapa.set(url, web);
    } catch {
      /* imagen que falla: se omite, la tarjeta se muestra sin ella */
    }
  });
  return mapa;
}

// --- Vídeo --------------------------------------------------------------

/** URL del .mp4 de mayor bitrate de un vídeo/gif del tweet, o null. */
function mejorVarianteVideo(media) {
  const variantes = (media.video_info?.variants || [])
    .filter((v) => v.content_type === "video/mp4");
  if (!variantes.length) return null;
  return variantes.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0].url;
}

/** URLs (en vivo, de video.twimg.com) de los vídeos/gifs que hay que comprimir. */
export function videosDeTweet(tweet) {
  const urls = [];
  for (const m of tweet.mediaDetails || []) {
    if (m.type !== "video" && m.type !== "animated_gif") continue;
    const url = mejorVarianteVideo(m);
    if (url) urls.push(url);
  }
  return urls;
}

function nombreVideoDesdeUrl(url) {
  const limpia = url.split("?")[0];
  const base = limpia.split("/").slice(-2).join("-").replace(/[^\w.-]/g, "").toLowerCase();
  return `${base.replace(/\.mp4$/i, "")}.mp4`;
}

/**
 * Descarga cada URL de vídeo en vivo y la recomprime con ffmpeg (H.264, hasta
 * 640px de ancho, 20 fps, CRF 34: de OSINT no hace falta más calidad y así no
 * se descontrola el peso del repo -- probado a mano contra la fuente en un
 * vídeo de 3 min: de 58 MB sin comprimir a ~10 MB, sigue siendo legible). Como
 * comprimir gasta CPU, va con un límite de paralelismo bajo. Si ya existe el
 * archivo comprimido, no lo vuelve a hacer (caché entre ejecuciones, igual que
 * las imágenes).
 * Devuelve un Map  urlEnVivo -> rutaWeb  (los que fallan no entran en el mapa:
 * la tarjeta se queda solo con la fuente en vivo para ese vídeo).
 */
export async function descargarVideos(urls, dirDestino, rutaWeb, limite = 3) {
  fs.mkdirSync(dirDestino, { recursive: true });
  const unicas = [...new Set(urls)];
  const mapa = new Map();
  await enParalelo(unicas, limite, async (url) => {
    const nombre = nombreVideoDesdeUrl(url);
    const destino = path.join(dirDestino, nombre);
    const web = `${rutaWeb}/${nombre}`;
    if (fs.existsSync(destino)) {
      mapa.set(url, web);
      return;
    }
    const tmp = path.join(os.tmpdir(), `tw-video-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`);
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) return;
      fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-i", tmp,
        "-vf", "scale='min(640,iw)':-2,fps=20",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "34",
        "-c:a", "aac", "-b:a", "64k",
        "-movflags", "+faststart",
        destino,
      ]);
      mapa.set(url, web);
    } catch {
      /* vídeo que falla al bajar o comprimir: la tarjeta se queda solo con
         la fuente en vivo de X para este vídeo. */
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  });
  return mapa;
}

// --- Construcción de la tarjeta ---------------------------------------

const escaparHtml = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatearTexto(tweet) {
  let texto = tweet.text || "";
  for (const media of tweet.mediaDetails || []) {
    if (media.url) texto = texto.replace(media.url, "");
  }
  texto = texto.replace(/\s*https:\/\/t\.co\/\w+\s*$/, "");
  texto = escaparHtml(texto.trim());
  if (tweet.note_tweet) texto += " […]"; // tweet largo: el CDN solo da el principio

  for (const u of tweet.entities?.urls || []) {
    if (!u.url) continue;
    texto = texto.replaceAll(
      u.url,
      `<a href="${escaparHtml(u.expanded_url)}" target="_blank" rel="noopener">${escaparHtml(u.display_url)}</a>`,
    );
  }
  return texto
    .replace(/(^|[^\w@/])@(\w{1,15})/g,
      '$1<a href="https://x.com/$2" target="_blank" rel="noopener">@$2</a>')
    .replace(/(^|[^\w&/])#([\p{L}\p{N}_]+)/gu,
      '$1<a href="https://x.com/hashtag/$2" target="_blank" rel="noopener">#$2</a>')
    .replace(/\n/g, "<br>\n");
}

function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-ES",
      { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

/**
 * HTML de la tarjeta.
 * `mapa` es el Map url->rutaWeb de descargarMedia() (imágenes/miniaturas).
 * `mapaVideo` es el Map urlEnVivo->rutaWeb de descargarVideos() (copia
 * comprimida ya alojada de cada vídeo; puede faltar una entrada si falló).
 */
export function construirTarjeta(tweet, mapa, mapaVideo = new Map()) {
  const id = tweet.id_str;
  const u = tweet.user || {};
  const handle = u.screen_name || "i";
  const urlTweet = `https://x.com/${handle}/status/${id}`;

  const avatarUrl = u.profile_image_url_https?.replace("_normal.", "_bigger.");
  const avatar = avatarUrl ? mapa.get(avatarUrl) : null;

  const bloquesMedia = [];
  for (const media of tweet.mediaDetails || []) {
    if (!media.media_url_https) continue;
    const src = mapa.get(`${media.media_url_https}?name=medium`);
    if (!src) continue;
    if (media.type === "photo") {
      bloquesMedia.push(`  <img class="tweet-media" src="${src}" alt="Imagen del tweet" loading="lazy" />`);
    } else {
      // Vídeo o gif animado: dos <source>, primero la copia en vivo de X
      // (mejor calidad) y luego la comprimida autoalojada. Si la primera
      // falla en el navegador (borrado, suspendido...), el <video> pasa solo
      // a la segunda -- el vídeo se sigue viendo igualmente.
      const enVivo = mejorVarianteVideo(media);
      const local = enVivo ? mapaVideo.get(enVivo) : null;
      if (enVivo || local) {
        const fuentes = [
          enVivo ? `<source src="${enVivo}" type="video/mp4" />` : "",
          local ? `<source src="${local}" type="video/mp4" />` : "",
        ].filter(Boolean).join("");
        bloquesMedia.push(
          `  <video class="tweet-media tweet-media-video" controls preload="none" playsinline poster="${src}">` +
          fuentes +
          `Tu navegador no admite vídeo. <a href="${urlTweet}" target="_blank" rel="noopener">Verlo en X</a>` +
          `</video>`,
        );
      } else {
        bloquesMedia.push(
          `  <a class="tweet-media tweet-media-video" href="${urlTweet}" target="_blank" rel="noopener">` +
          `<img src="${src}" alt="Miniatura del vídeo" loading="lazy" /><span>▶ Ver vídeo en X</span></a>`,
        );
      }
    }
  }

  return [
    `<blockquote class="tweet" data-tweet-id="${id}">`,
    `  <a class="tweet-author" href="${urlTweet}" target="_blank" rel="noopener">`,
    avatar ? `    <img class="tweet-avatar" src="${avatar}" alt="" width="44" height="44" loading="lazy" />` : "",
    `    <span class="tweet-name">${escaparHtml(u.name || handle)}</span>`,
    `    <span class="tweet-handle">@${escaparHtml(handle)}</span>`,
    `  </a>`,
    `  <div class="tweet-text">${formatearTexto(tweet)}</div>`,
    ...bloquesMedia,
    `  <a class="tweet-date" href="${urlTweet}" target="_blank" rel="noopener">${formatearFecha(tweet.created_at)}</a>`,
    `</blockquote>`,
  ].filter(Boolean).join("\n");
}
