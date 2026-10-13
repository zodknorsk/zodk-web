// Plugin de Sätteri para el HTML: en cada artículo, la primera vez que sale
// una base de src/data/bases.json con su mapa ya elegido («Edwards AFB»,
// escrita igual que la clave) se envuelve en <span class="base-ref"
// data-base="<slug>">; las tablas llevan su propia cuenta, como el glosario.
// La tarjeta del ratón la pone BaseTarjeta.astro (docs/nuevabase.md).
// Va antes que el del glosario, que no entra en estos span: si no, la sigla
// («AFB») se llevaría su tarjeta del glosario.
import { readFileSync, statSync } from "node:fs";

const DATOS = "src/data/bases.json";
const SALTAR = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "script", "style", "svg"]);
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Se relee solo si ha cambiado (en `astro dev` se importa a menudo).
let cache = { mtime: 0, porNombre: new Map(), patron: null };
function cargar() {
  let mtime;
  try {
    mtime = statSync(DATOS).mtimeMs;
  } catch {
    return cache;
  }
  if (cache.mtime === mtime) return cache;
  const datos = JSON.parse(readFileSync(DATOS, "utf8"));
  const porNombre = new Map(
    Object.entries(datos).filter(([k, b]) => !k.startsWith("_") && b.mapa).map(([k, b]) => [k, b.slug]),
  );
  // Los más largos primero; el nombre tal cual (mayúsculas incluidas).
  const nombres = [...porNombre.keys()].sort((a, b) => b.length - a.length).map(escapar);
  const patron = nombres.length ? new RegExp(`(?<![\\p{L}\\p{N}\\-/])(${nombres.join("|")})(?![\\p{L}\\p{N}\\-/])`, "gu") : null;
  cache = { mtime, porNombre, patron };
  return cache;
}

export default function bases() {
  const { porNombre, patron } = cargar();
  if (!patron) return null;
  const usados = { texto: new Set(), tabla: new Set() };
  const enTabla = (nodo, ctx) => {
    for (let p = ctx.parent(nodo); p && p.type === "element"; p = ctx.parent(p)) if (p.tagName === "table") return true;
    return false;
  };
  const saltar = (nodo, ctx) => {
    for (let p = ctx.parent(nodo); p && p.type === "element"; p = ctx.parent(p)) {
      const clases = p.properties?.className ?? [];
      if (SALTAR.has(p.tagName) || clases.includes("tweet") || clases.some((c) => c.startsWith("base-"))) return true;
    }
    return false;
  };

  return {
    name: "bases",
    text(nodo, ctx) {
      const texto = nodo.value;
      if (!texto.match(patron) || saltar(nodo, ctx)) return;
      const vistos = enTabla(nodo, ctx) ? usados.tabla : usados.texto;
      const nuevos = [];
      let desde = 0;
      for (const m of texto.matchAll(patron)) {
        const slug = porNombre.get(m[1]);
        if (!slug) continue;
        // Las demás veces, un span sin tarjeta: solo para que el glosario no
        // marque la sigla dentro del nombre.
        const primera = !vistos.has(slug);
        vistos.add(slug);
        if (m.index > desde) nuevos.push({ type: "text", value: texto.slice(desde, m.index) });
        nuevos.push({
          type: "element",
          tagName: "span",
          properties: primera ? { className: ["base-ref"], dataBase: slug, tabIndex: 0 } : { className: ["base-nombre"] },
          children: [{ type: "text", value: m[0] }],
        });
        desde = m.index + m[0].length;
      }
      if (!desde) return;
      if (desde < texto.length) nuevos.push({ type: "text", value: texto.slice(desde) });
      ctx.replaceNode(nodo, nuevos);
    },
  };
}
