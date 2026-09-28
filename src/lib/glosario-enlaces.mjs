// Plugin de Sätteri (el procesador de Markdown de Astro 7) para el HTML: en cada artículo (notas, eventos y fichas del Hangar),
// la primera vez que sale un término del glosario de UAS se convierte en un
// enlace a su entrada, con su definición en atributos `data-gl-*`. La tarjeta
// que sale al pasar el ratón la pone GlosarioTarjeta.astro.
//
// Los términos salen de la nota del glosario ya importada (@lib/glosario lee
// la misma lista para el índice): «- **MALE** *(Medium Altitude Long
// Endurance)* — Definición». Así el glosario crece y las tarjetas con él.
//
// Siglas (dos o más mayúsculas: MALE, EO/IR, LiDAR, C-UAS) distinguen
// mayúsculas, para que LOS no se confunda con «los»; las palabras (jamming,
// payload) no. Se admite el plural con «s». No se tocan títulos, enlaces,
// código ni tuits. Los enlaces que ya apuntan al glosario (hechos a mano en la
// bóveda) ganan la tarjeta si su texto es un término.
import { readFileSync, statSync } from "node:fs";
import { anclaTermino } from "./glosario.ts";

const NOTA = "src/content/uas/glosario-y-terminologia/index.md";
const URL_GLOSARIO = "/uas/glosario-y-terminologia";
const SALTAR = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "script", "style", "svg"]);

const limpiar = (s) =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Se relee la nota solo si ha cambiado (en `astro dev` se importa a menudo).
let cache = { mtime: 0, terminos: [], patron: null, porNombre: new Map() };
function cargar() {
  let mtime;
  try {
    mtime = statSync(NOTA).mtimeMs;
  } catch {
    return cache;
  }
  if (mtime === cache.mtime) return cache;

  const terminos = [];
  for (const linea of readFileSync(NOTA, "utf8").split("\n")) {
    const m = linea.match(/^- \*\*(.+?)\*\*\s*(?:\*\((.+?)\)\*)?\s*(?:—\s*(.*))?$/);
    if (!m) continue;
    const t = limpiar(m[1]);
    const en = m[2] ? limpiar(m[2]) : "";
    const termino = { t, en, def: m[3] ? limpiar(m[3]) : "", ancla: anclaTermino(t) };
    terminos.push(termino);
    // Siglas que el glosario da entre paréntesis como otro nombre del
    // término: «dron de ataque de un solo uso, OWA».
    const alias = en.match(/,\s*([A-Z]{2,})$/);
    if (alias) terminos.push({ ...termino, nombre: alias[1] });
  }

  const porNombre = new Map();
  const partes = [];
  // Los más largos primero, para que C-UAS gane a UAS.
  for (const x of [...terminos].sort((a, b) => (b.nombre ?? b.t).length - (a.nombre ?? a.t).length)) {
    const nombre = x.nombre ?? x.t;
    const sigla = (nombre.match(/[A-Z]/g) ?? []).length >= 2;
    const clave = sigla ? nombre : nombre.toLowerCase();
    if (porNombre.has(clave)) continue;
    porNombre.set(clave, x);
    partes.push(sigla ? escapar(nombre) : `(?i:${escapar(nombre)})`);
  }
  // Borde de palabra con letras de cualquier idioma; un guion o una barra
  // pegados tampoco valen (UAS dentro de C-UAS, IR dentro de EO/IR).
  const patron = partes.length
    ? new RegExp(`(?<![\\p{L}\\p{N}\\-/])(${partes.join("|")})s?(?![\\p{L}\\p{N}\\-/])`, "gu")
    : null;

  cache = { mtime, terminos, patron, porNombre };
  return cache;
}

const buscar = (porNombre, texto) => porNombre.get(texto) ?? porNombre.get(texto.toLowerCase());

function propiedades(x) {
  const p = { href: `${URL_GLOSARIO}#${x.ancla}`, className: ["gl"], dataGlT: x.t, dataGlDef: x.def };
  if (x.en) p.dataGlEn = x.en;
  return p;
}

// Se llama una vez por documento. El glosario no se enlaza a sí mismo.
export default function glosario({ fileURL, data }) {
  if (data?.astro?.frontmatter?.glosario || fileURL?.pathname.includes("glosario-y-terminologia")) return null;
  const { patron, porNombre } = cargar();
  if (!patron) return null;
  const usados = new Set();

  const saltar = (nodo, ctx) => {
    for (let p = ctx.parent(nodo); p && p.type === "element"; p = ctx.parent(p)) {
      if (SALTAR.has(p.tagName) || (p.properties?.className ?? []).includes("tweet")) return true;
    }
    return false;
  };

  return {
    name: "glosario",
    // Enlace hecho a mano al glosario: si su texto es un término, lleva a su
    // entrada y enseña la tarjeta.
    element: {
      filter: ["a"],
      visit(a, ctx) {
        if (!String(a.properties?.href ?? "").startsWith(URL_GLOSARIO)) return;
        const x = buscar(porNombre, ctx.textContent(a).trim());
        if (!x) return;
        usados.add(x.ancla);
        for (const [clave, valor] of Object.entries(propiedades(x))) ctx.setProperty(a, clave, valor);
      },
    },
    text(nodo, ctx) {
      const texto = nodo.value;
      if (!texto.match(patron) || saltar(nodo, ctx)) return;
      const nuevos = [];
      let desde = 0;
      for (const m of texto.matchAll(patron)) {
        const x = buscar(porNombre, m[1]);
        if (!x || usados.has(x.ancla)) continue;
        usados.add(x.ancla);
        if (m.index > desde) nuevos.push({ type: "text", value: texto.slice(desde, m.index) });
        nuevos.push({ type: "element", tagName: "a", properties: propiedades(x), children: [{ type: "text", value: m[0] }] });
        desde = m.index + m[0].length;
      }
      if (!desde) return;
      if (desde < texto.length) nuevos.push({ type: "text", value: texto.slice(desde) });
      ctx.replaceNode(nodo, nuevos);
    },
  };
}
