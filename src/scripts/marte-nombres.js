// Nombres de lugares de /marte (Proyecto Marte): salen al acercarse. Lo mismo
// que el banco logo-files/prototipo-marte/nombres.html, donde se decidió
// (usuario, 22-sep-2026):
// - Zonas (planicies, tierras, mesetas, y las medianas como Kasei Valles o
//   Noctis Labyrinthus): rótulo de región, sin marco. Se van cuando ya no
//   caben en la pantalla.
// - Formas claras (montes, cráteres, calderas): el visor, las esquinas del
//   marco del título de la portada, ceñidas al lugar y crecen con él.
// - A x1 no sale ningún nombre: al llegar, Marte limpio.
// Los nombres son los oficiales de la UAI, de public/marte/marte-nombres.json
// (logo-files/generar-nombres.py). La capa es HTML encima del lienzo, con el
// origen en el centro del disco; `coloca()` se llama tras cada fotograma del
// lienzo (quieto no se repinta nada).
// En la misma capa, las chapas de los amartizajes (src/data/amartizajes.ts):
// la bandera en su sitio exacto, a cualquier zoom (a x1 son lo único que
// sale), con su ficha al pasar el ratón; la de una misión que no llegó
// entera, en blanco y negro.
// Detalle y decisiones en logo-files/MARTE-WIP.md.

import { MARTE_V } from "./marte.js";

const MARGEN = 0.06;                         // aire del visor por fuera del lugar
const CHAPA_W = 20, CHAPA_H = 14;            // la chapa (18 x 12) y 1 px de aire

/**
 * @param {HTMLElement} capa  la capa de nombres (centrada en el disco)
 * @param {{ proyecta: (lat: number, lon: number) => { x: number, y: number, z: number },
 *   pxGrado: () => number, vista: () => { zoom: number } }} marte
 * @param {{ lat: number, lon: number, llego: boolean, separa: number, bandera: string,
 *   titulo: string, clase: string, datos: [string, string][], texto: string,
 *   foto: string, fotoPos: string, credito: string | null, enlace: string | null }[]} [chapas]
 * @param {{ url?: string, radioKm?: number }} [astro]  otro astro (la Luna:
 *   /luna/luna-nombres.json y 1737,4 km); por defecto, Marte
 * @returns {Promise<{ coloca: () => void, desmontar: () => void }>}
 */
export async function montarNombres(capa, marte, chapas = [], {
  url = `/marte/marte-nombres.json?v=${MARTE_V}`,
  radioKm = 3389.5,
} = {}) {
  const KM_GRADO = Math.PI * radioKm / 180;    // un grado del astro, en km
  const NOMBRES = await fetch(url).then((r) => r.json());

  // Un elemento por nombre.
  const els = NOMBRES.map((n) => {
    const el = document.createElement("div");
    el.className = `marte-nombre ${n.clase}${n.menor ? " menor" : ""}`;
    el.hidden = true;
    el.innerHTML = n.clase === "region"
      ? `<span class="texto">${n.linea ? n.nombre : n.nombre.split(" ").join("<br>")}</span>`
      : `<div class="marco marco-fuera"><div class="marco-dentro marco"></div><span class="texto">${n.nombre}</span></div>`;
    capa.append(el);
    return { n, el, marco: el.querySelector(".marco-fuera"), visto: false, w: 0, h: 0 };
  });

  // Las chapas. Con la nota publicada, la chapa es un enlace a ella (cursor
  // de mano; no arrastra el planeta); sin publicar, solo la ficha.
  const chs = chapas.map((c) => {
    const el = document.createElement(c.enlace ? "a" : "div");
    el.className = `marte-chapa${c.llego ? "" : " perdida"}`;
    el.hidden = true;
    if (c.enlace) {
      el.href = c.enlace;
      el.setAttribute("aria-label", `${c.titulo}: leer la nota`);
    }
    el.innerHTML = c.bandera
      + `<div class="marte-ficha"><img class="marte-ficha-foto" src="${c.foto}" alt="" loading="lazy" style="object-position: ${c.fotoPos}">`
      + `<div class="marte-ficha-titulo">${c.titulo}</div>`
      + `<div class="marte-ficha-clase">${c.clase}</div>`
      + `<dl>${c.datos.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`
      + `<p class="marte-ficha-texto">${c.texto}</p>`
      + (c.credito ? `<p class="marte-ficha-credito">${c.credito}</p>` : "")
      + (c.enlace ? '<p class="marte-ficha-nota">leer la nota →</p>' : "")
      + "</div>";
    capa.append(el);
    const e = { c, el, ficha: el.querySelector(".marte-ficha"), x: 0, y: 0, visto: false };
    el.addEventListener("pointerenter", () => ajustaFicha(e));
    return e;
  });
  // La ficha va centrada bajo la chapa; si así se sale de la pantalla (en el
  // móvil, con la chapa cerca del borde), se corre hacia dentro; si no cabe
  // por debajo, se abre hacia arriba; y si no cabe ni arriba ni abajo (en el
  // móvil, con la foto mide ~450 px), se corre en vertical hasta quedar
  // dentro, aunque tape la chapa. Con cuentas
  // (dónde está la chapa y cuánto mide la ficha): leer su caja en pantalla no
  // vale, porque se mueve con la transición al abrirse.
  function ajustaFicha(e) {
    const w = e.ficha.offsetWidth, m = 8;
    const izq = window.innerWidth / 2 + e.x - w / 2;    // la capa está en el centro de la ventana
    const corre = Math.max(m - izq, Math.min(0, window.innerWidth - m - (izq + w)));
    e.ficha.style.setProperty("--corre", `${Math.round(corre)}px`);
    const H = window.innerHeight, h = e.ficha.offsetHeight, yc = H / 2 + e.y;   // yc: centro de la chapa
    const abajo = yc + 6 + 8, arriba = yc - 6 - 8 - h;                        // arriba de la ficha, en cada caso
    const cabeAbajo = abajo + h <= H - m, cabeArriba = arriba >= m;
    const haciaArriba = !cabeAbajo && (cabeArriba || yc > H / 2);
    const top = haciaArriba ? arriba : abajo;
    const sube = top < m ? m - top : Math.min(0, H - m - h - top);
    e.el.classList.toggle("ficha-arriba", haciaArriba);
    e.ficha.style.setProperty("--sube", `${Math.round(sube)}px`);
  }

  // En táctil no hay ratón que pasar por encima: un toque abre la ficha y
  // otro toque (en ella, si es enlace, lleva a la nota) o tocar fuera la
  // cierra. Con ratón no hace nada: la ficha sale al pasar por encima.
  const tactil = matchMedia("(hover: none)");
  const toca = (e) => {
    const el = e.target instanceof Element ? e.target.closest(".marte-chapa") : null;
    for (const x of chs) if (x.el !== el) x.el.classList.remove("abierta");
    const ch = chs.find((x) => x.el === el);
    if (!ch || !tactil.matches || el.classList.contains("abierta")) return;
    e.preventDefault();
    el.classList.add("abierta");
    ajustaFicha(ch);
  };
  document.addEventListener("click", toca);

  // El tamaño de cada texto se mide una vez, con la letra ya cargada, y el
  // reparto de sitio se hace con cuentas: leer cajas en cada fotograma del
  // zoom obligaría al navegador a maquetar ~50 elementos cada vez.
  // (las dos letras se piden a mano: el navegador solo las baja cuando algo
  // visible las usa, y se mediría con la de repuesto)
  await Promise.all(["500 12px", "600 11px"].map((f) => document.fonts.load(`${f} "IBM Plex Mono"`))).catch(() => {});
  for (const e of els) { e.el.hidden = false; e.el.style.visibility = "hidden"; }
  for (const e of els) {
    const t = e.el.querySelector(".texto");
    e.w = t.offsetWidth; e.h = t.offsetHeight;
  }
  for (const e of els) { e.el.hidden = true; e.el.style.visibility = ""; }

  function coloca() {
    const z = marte.vista().zoom, ppg = marte.pxGrado();
    const pantalla = Math.max(window.innerWidth, window.innerHeight);
    // Los umbrales (`px`) se ajustaron con el disco de 540 px de un portátil
    // (60 svh de 900; desde el 24-sep-2026 el disco es de 70 svh, 630 px, y
    // salen algo antes). En el móvil el disco es más pequeño (88 vw, unos 340
    // px) y los lugares pequeños no llegaban a su umbral ni a x6 (usuario,
    // 23-sep-2026: "Olympus Paterae … en móvil no lo llego a ver"): el umbral
    // encoge con el disco, así salen al mismo zoom que en el portátil. En
    // pantallas más grandes no crece (salen antes, como hasta ahora).
    const escala = Math.min(1, (ppg / z) * 360 / Math.PI / 540);
    const salen = [];
    for (const e of els) {
      const { n, el } = e;
      const c = marte.proyecta(n.lat, n.lon);
      // Cerca del borde del disco se funde; por detrás, fuera.
      const borde = Math.max(0, Math.min(1, (c.z - 0.12) / 0.2));
      // Cuánto mide el lugar en pantalla, sacado de su tamaño real (la caja
      // proyectada se aplasta cerca del borde y el nombre parpadearía).
      const tam = (n.km / KM_GRADO) * ppg;
      // A x1 nada; luego cada lugar sale cuando mide lo suyo (con un 6 % de
      // margen al alejar, para que no parpadee en el umbral), y las zonas se
      // van cuando ya no caben en la pantalla.
      // `zmin` y `zmax` (opcionales, los de la Tierra): desde qué zoom sale
      // (por defecto x1,2) y por encima de cuál se retira (los continentes,
      // para dejar sitio a los países).
      const toca = z >= (n.zmin ?? 1.2) * (e.visto ? 0.97 : 1)
        && tam >= n.px * escala * (e.visto ? 0.94 : 1)
        && (n.clase !== "region" || tam < 1.6 * pantalla)
        && (n.zmax == null || z < n.zmax * (e.visto ? 1.03 : 1));
      if (!toca || borde <= 0) {
        if (e.visto) { e.visto = false; el.classList.remove("visto"); }
        el.hidden = true;
        continue;
      }
      el.hidden = false;
      el.style.setProperty("--borde", borde.toFixed(2));
      if (n.clase === "region") {
        el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
        e.caja = { x0: c.x - e.w / 2, x1: c.x + e.w / 2, y0: c.y - e.h / 2, y1: c.y + e.h / 2 };
      } else {
        // El visor: cuadrado (el lado mayor de la caja del lugar en pantalla)
        // con un 6 % de aire, centrado en ella; se lee como una mira puesta
        // encima y no como un recorte.
        const [s, nn, o, es] = n.caja;
        const pts = [[nn, n.lon], [s, n.lon], [n.lat, o], [n.lat, es], [nn, o], [nn, es], [s, o], [s, es]]
          .map(([la, lo]) => marte.proyecta(la, lo));
        const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x));
        const y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, l = Math.max(x1 - x0, y1 - y0) * (1 + 2 * MARGEN) / 2;
        el.style.transform = `translate(${(cx - l).toFixed(1)}px, ${(cy - l).toFixed(1)}px)`;
        e.marco.style.width = e.marco.style.height = `${(2 * l).toFixed(1)}px`;
        // el texto va bajo la esquina de abajo a la izquierda (6 px)
        e.caja = { x0: cx - l, x1: cx - l + e.w, y0: cy + l + 6, y1: cy + l + 6 + e.h };
      }
      salen.push(e);
    }
    // Los que se pisan: se queda el del lugar más grande (el archivo viene
    // ordenado de mayor a menor) y el otro espera a que haya sitio.
    const puestos = [];
    for (const e of salen) {
      const k = e.caja, a = { x0: k.x0 - 4, x1: k.x1 + 4, y0: k.y0 - 3, y1: k.y1 + 3 };
      const pisa = puestos.some((p) => a.x0 < p.x1 && p.x0 < a.x1 && a.y0 < p.y1 && p.y0 < a.y1);
      e.el.style.visibility = pisa ? "hidden" : "";
      if (pisa) continue;
      puestos.push(a);
      if (!e.visto) {
        e.visto = true;
        requestAnimationFrame(() => e.el.classList.add("visto"));   // un fotograma después: arranca la transición
      }
    }
    // Las chapas: en su sitio exacto y a cualquier zoom. No entran en el
    // reparto de sitio de los nombres: son pequeñas. Si dos se pisan (a x1,
    // Opportunity y Schiaparelli, a 40 km), la segunda se aparta lo justo
    // para quedar pegada a la otra, hacia su lado; al acercar, en cuanto su
    // distancia real basta, cada una vuelve a su sitio.
    const puestas = [];
    for (const e of chs) {
      const c = marte.proyecta(e.c.lat, e.c.lon);
      // Dos chapas en el mismo sitio (Perseverance e Ingenuity): la segunda,
      // pegada a la derecha a x1 y cada vez más lejos al acercar.
      c.x += e.c.separa * z;
      const borde = Math.max(0, Math.min(1, (c.z - 0.12) / 0.2));
      if (borde <= 0) {
        if (e.visto) { e.visto = false; e.el.classList.remove("visto"); }
        e.el.hidden = true;
        continue;
      }
      for (const p of puestas) {
        if (Math.abs(c.x - p.x) < CHAPA_W && Math.abs(c.y - p.y) < CHAPA_H) {
          c.x = p.x + (c.x < p.x ? -CHAPA_W : CHAPA_W);
        }
      }
      puestas.push(c);
      e.el.hidden = false;
      e.el.style.setProperty("--borde", borde.toFixed(2));
      e.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
      e.x = c.x;
      e.y = c.y;
      if (e.el.classList.contains("abierta")) ajustaFicha(e);   // abierta en táctil y girando
      if (!e.visto) {
        e.visto = true;
        requestAnimationFrame(() => e.el.classList.add("visto"));
      }
    }
  }

  return {
    coloca,
    desmontar: () => {
      document.removeEventListener("click", toca);
      capa.replaceChildren();
    },
  };
}
