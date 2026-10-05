// Plugin de Sätteri para la portada de un seguimiento (kind: index): a partir
// del encabezado «Cronología», las semanas ("## Semana N (…)" con la lista de
// sus días) se reparten en dos columnas, la mitad de las semanas en cada una
// (con 10 semanas, de la 1 a la 5 a la izquierda y de la 6 a la 10 a la
// derecha). «Cronología» queda centrado encima. En móvil, una sola columna
// (src/styles/base.css). La última semana de un seguimiento en curso lleva la
// clase «cronologia-actual» y un punto «en curso». En la bóveda no cambia nada.

const el = (tagName, properties, children = []) => ({ type: "element", tagName, properties, children });

// Copia un nodo para meterlo en las columnas (los del árbol no se pueden mover).
function copia(n) {
  if (n.type === "text") return { type: "text", value: n.value };
  if (n.type !== "element") return null;
  return el(n.tagName, { ...(n.properties ?? {}) }, (n.children ?? []).map(copia).filter(Boolean));
}

const textoDe = (n) =>
  n.type === "text" ? n.value : (n.children ?? []).map(textoDe).join("");

const esH2 = (n, re) => n.type === "element" && n.tagName === "h2" && re.test(textoDe(n).trim());

export default function cronologiaColumnas({ data }) {
  const fm = data?.astro?.frontmatter;
  if (fm?.kind !== "index") return null;
  const abierto = /en (desarrollo|curso)/i.test(fm.periodo ?? "");
  return {
    name: "cronologia-columnas",
    after(root, ctx) {
      const hijos = root.children.filter((n) => !(n.type === "text" && !n.value.trim()));
      const ini = hijos.findIndex((n) => esH2(n, /^cronolog[ií]a$/i));
      if (ini < 0) return;
      // Las semanas: cada «## Semana…» con lo que lleve debajo hasta la siguiente.
      const semanas = [];
      for (const n of hijos.slice(ini + 1)) {
        if (esH2(n, /^semana\s/i)) semanas.push([n]);
        else if (semanas.length) semanas.at(-1).push(n);
        else return; // algo que no es una semana justo tras «Cronología»: no tocar
      }
      if (semanas.length < 2) return;
      const ultima = semanas.at(-1)[0];
      const mitad = Math.ceil(semanas.length / 2);
      const columna = (grupo) =>
        el("div", { className: ["cronologia-col"] }, grupo.flat().map((n) => {
          const c = copia(n);
          // El punto de «en curso»: un <i> con su halo, como el piloto de la portada.
          if (abierto && n === ultima) {
            c.properties.className = ["cronologia-actual"];
            c.children.push(el("i", { className: ["vivo"], ariaHidden: "true" }));
          }
          return c;
        }));
      const titulo = copia(hijos[ini]);
      titulo.properties.className = ["cronologia-titulo"];
      ctx.insertBefore(hijos[ini], titulo);
      ctx.insertBefore(hijos[ini], el("div", { className: ["cronologia-cols"] }, [
        columna(semanas.slice(0, mitad)),
        columna(semanas.slice(mitad)),
      ]));
      for (const n of [hijos[ini], ...semanas.flat()]) ctx.removeNode(n);
    },
  };
}
