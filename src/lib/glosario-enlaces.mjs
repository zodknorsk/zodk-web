// Plugin de Sätteri (el procesador de Markdown de Astro 7) para el HTML: en
// cada artículo (análisis, operaciones, seguimientos, notas y fichas del
// Hangar), la primera vez que sale
// un término del glosario de UAS o una munición del armamento se convierte en
// un enlace a su entrada (las tablas llevan su propia cuenta: quien va
// directo a las características también ve la tarjeta), con su texto en atributos `data-gl-*`. La tarjeta
// que sale al pasar el ratón la pone GlosarioTarjeta.astro.
//
// Todo sale de las notas ya importadas, así que crece con ellas:
// - Glosario: «- **MALE** *(Medium Altitude Long Endurance)* — Definición»
//   (@lib/glosario lee la misma lista para el índice). La sigla detrás de una
//   coma en el paréntesis también vale («…, OWA»).
// - Armamento: cada munición (src/content/uas/armamento/<slug>/index.md,
//   «AGM-114 Hellfire»), con el «Tipo» de su tabla y su primer párrafo. Vale
//   el nombre entero, la designación («AGM-114») y el nombre de detrás
//   («Hellfire»).
//
// Siglas (dos o más mayúsculas: MALE, EO/IR, LiDAR, C-UAS, GBU-38) distinguen
// mayúsculas, para que LOS no se confunda con «los»; las palabras (jamming,
// Hellfire) no. Se admite el plural con «s». No se tocan títulos, enlaces,
// código ni tuits. Los enlaces hechos a mano en la bóveda al glosario (si su
// texto es un término) o a una munición ganan la tarjeta.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { anclaTermino } from "./glosario.ts";

const NOTA_GLOSARIO = "src/content/uas/glosario-y-terminologia/index.md";
const URL_GLOSARIO = "/uas/glosario-y-terminologia";
const CARPETA_ARMAMENTO = "src/content/uas/armamento";
const URL_ARMAMENTO = "/uas/armamento";
const SALTAR = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "script", "style", "svg"]);

const limpiar = (s) =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Cada nota se relee solo si ha cambiado (en `astro dev` se importa a menudo).
const caches = new Map();
function leerSiCambia(ruta, leer, vacio) {
  let mtime;
  try {
    mtime = statSync(ruta).mtimeMs;
  } catch {
    return vacio;
  }
  const c = caches.get(ruta);
  if (c?.mtime === mtime) return c.valor;
  const valor = leer(readFileSync(ruta, "utf8"));
  caches.set(ruta, { mtime, valor });
  return valor;
}

// Nombres en español que llevan a una entrada del glosario sin ser entrada
// aparte (el plural, a mano: el patrón solo admite la «s»). Solo los que se
// pidan: «interferencia» o «autonomía» son palabras demasiado corrientes.
const ALIAS = {
  "Loitering munition": ["munición merodeadora", "municiones merodeadoras"],
  "Interceptor drone": ["dron interceptor", "drones interceptores"],
  Ceiling: ["techo de vuelo", "techo de servicio"],
};

// Cada entrada: { t, en, def, href, ir?, nombres }. `t` es el título de la
// tarjeta y `nombres`, cómo se la reconoce en el texto.
function leerTerminos(nota) {
  const entradas = [];
  for (const linea of nota.split("\n")) {
    const m = linea.match(/^- \*\*(.+?)\*\*\s*(?:\*\((.+?)\)\*)?\s*(?:—\s*(.*))?$/);
    if (!m) continue;
    const t = limpiar(m[1]);
    const en = m[2] ? limpiar(m[2]) : "";
    const nombres = [t, ...(ALIAS[t] ?? [])];
    const alias = en.match(/,\s*([A-Z]{2,})$/);
    if (alias) nombres.push(alias[1]);
    entradas.push({ t, en, def: m[3] ? limpiar(m[3]) : "", href: `${URL_GLOSARIO}#${anclaTermino(t)}`, nombres });
  }
  return entradas;
}

// Una munición: su título, el «Tipo» de la tabla y el primer párrafo.
function leerMunicion(nota, slug) {
  const [, fm = "", cuerpo = ""] = nota.split(/^---$/m);
  const t = fm.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1];
  if (!t) return null;
  const [designacion, ...resto] = t.split(" ");
  const nombres = [t];
  if (resto.length && /^[A-Z]+-\d+[A-Z]?$/.test(designacion)) nombres.push(designacion, resto.join(" "));
  const x = { t, en: "", def: "", href: `${URL_ARMAMENTO}/${slug}`, ir: "Ver la munición →", nombres };
  for (const linea of cuerpo.split("\n")) {
    const tipo = linea.match(/^\|\s*\*\*Tipo\*\*\s*\|\s*(.+?)\s*\|/);
    if (tipo) x.en = limpiar(tipo[1]);
    else if (!x.def && /^[^\s|!*><#]/.test(linea)) x.def = limpiar(linea);
  }
  return x;
}

// Todas las municiones: una carpeta cada una dentro del armamento.
function leerMuniciones() {
  let carpetas = [];
  try {
    carpetas = readdirSync(CARPETA_ARMAMENTO, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    return [];
  }
  return carpetas
    .map((slug) => leerSiCambia(`${CARPETA_ARMAMENTO}/${slug}/index.md`, (nota) => leerMunicion(nota, slug), null))
    .filter(Boolean);
}

// Un solo patrón para los dos, y los nombres, por el texto tal cual (siglas)
// o en minúsculas (palabras).
let indice = { de: [], patron: null, porNombre: new Map(), porHref: new Map() };
function cargar() {
  const glosario = leerSiCambia(NOTA_GLOSARIO, leerTerminos, []);
  const armamento = leerMuniciones();
  if (indice.de[0] === glosario && indice.de.length === armamento.length + 1 && armamento.every((x, i) => indice.de[i + 1] === x)) return indice;

  const entradas = [...glosario, ...armamento];
  const porHref = new Map(entradas.map((x) => [x.href, x]));
  const porNombre = new Map();
  const partes = [];
  // Los más largos primero, para que C-UAS gane a UAS.
  const nombres = entradas.flatMap((x) => x.nombres.map((nombre) => ({ nombre, x })));
  for (const { nombre, x } of nombres.sort((a, b) => b.nombre.length - a.nombre.length)) {
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

  indice = { de: [glosario, ...armamento], patron, porNombre, porHref };
  return indice;
}

const buscar = (porNombre, texto) => porNombre.get(texto) ?? porNombre.get(texto.toLowerCase());

function propiedades(x) {
  /** @type {{ href: string, className: string[], dataGlT: string, dataGlDef: string, dataGlEn?: string, dataGlIr?: string }} */
  const p = { href: x.href, className: ["gl"], dataGlT: x.t, dataGlDef: x.def };
  if (x.en) p.dataGlEn = x.en;
  if (x.ir) p.dataGlIr = x.ir;
  return p;
}

// Se llama una vez por documento. El glosario no se enlaza a sí mismo, ni
// cada munición a su propia página.
export default function glosario({ fileURL, data }) {
  const fm = data?.astro?.frontmatter ?? {};
  if (fm.glosario || fileURL?.pathname.includes("glosario-y-terminologia")) return null;
  const { patron, porNombre, porHref } = cargar();
  // Una munición no se enlaza a sí misma.
  const propia = fileURL?.pathname.match(/\/uas\/armamento\/([^/]+)\/index\.md$/)?.[1];
  const nuevo = () => new Set(propia ? [`${URL_ARMAMENTO}/${decodeURIComponent(propia)}`] : []);
  const usados = { texto: nuevo(), tabla: nuevo() };
  const cuenta = (nodo, ctx) => {
    for (let p = ctx.parent(nodo); p && p.type === "element"; p = ctx.parent(p)) {
      if (p.tagName === "table") return usados.tabla;
    }
    return usados.texto;
  };

  const saltar = (nodo, ctx) => {
    for (let p = ctx.parent(nodo); p && p.type === "element"; p = ctx.parent(p)) {
      if (SALTAR.has(p.tagName) || (p.properties?.className ?? []).includes("tweet")) return true;
    }
    return false;
  };

  return {
    name: "glosario",
    // Enlace hecho a mano al glosario (si su texto es un término, lleva a su
    // entrada) o a una munición: enseña la tarjeta.
    element: {
      filter: ["a"],
      visit(a, ctx) {
        const href = String(a.properties?.href ?? "");
        let x = null;
        if (href.startsWith(URL_GLOSARIO)) x = buscar(porNombre, ctx.textContent(a).trim());
        else if (href.startsWith(`${URL_ARMAMENTO}/`)) x = porHref.get(decodeURI(href));
        if (!x) return;
        cuenta(a, ctx).add(x.href);
        for (const [clave, valor] of Object.entries(propiedades(x))) ctx.setProperty(a, clave, valor);
      },
    },
    text(nodo, ctx) {
      const texto = nodo.value;
      if (!patron || !texto.match(patron) || saltar(nodo, ctx)) return;
      const vistos = cuenta(nodo, ctx);
      const nuevos = [];
      let desde = 0;
      for (const m of texto.matchAll(patron)) {
        const x = buscar(porNombre, m[1]);
        if (!x || vistos.has(x.href)) continue;
        vistos.add(x.href);
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
