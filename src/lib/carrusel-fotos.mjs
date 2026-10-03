// Plugin de Sätteri para las municiones del armamento del hangar de UAS: dos
// o más fotos seguidas, cada una con su pie («![[foto.jpg]]» y debajo
// «*pie*», separadas por una línea en blanco), se juntan en un carrusel: se
// ve una foto, y debajo «‹ 1 / 4 ›» y su pie. En la bóveda se siguen viendo
// todas, una debajo de otra. Lo que hace al pulsar está en
// src/components/Carrusel.astro.
//
// Corre antes que el plugin de imágenes de Astro, así que las fotos del
// carrusel se optimizan como las demás.

const el = (tagName, properties, children = []) => ({ type: "element", tagName, properties, children });
const texto = (value) => ({ type: "text", value });

// Copia un nodo para meterlo en el carrusel (los del árbol no se pueden mover).
function copia(n) {
  if (n.type === "text") return texto(n.value);
  if (n.type !== "element") return null;
  return el(n.tagName, { ...(n.properties ?? {}) }, (n.children ?? []).map(copia).filter(Boolean));
}

// Un párrafo que solo tiene una foto y su pie en cursiva: { img, em }.
function foto(n) {
  if (n?.type !== "element" || n.tagName !== "p") return null;
  const hijos = (n.children ?? []).filter((c) => !(c.type === "text" && !c.value.trim()));
  if (hijos.length !== 2) return null;
  const [img, em] = hijos;
  if (img.type !== "element" || img.tagName !== "img" || em.type !== "element" || em.tagName !== "em") return null;
  return { img, em };
}

function carrusel(fotos) {
  const n = fotos.length;
  // Sin clase en las fotos (el plugin de imágenes de Astro la sacaría como
  // atributo «className»): hasta que carga el script, las ocultas el CSS.
  const imgs = fotos.map(({ img }) => copia(img));
  const pies = fotos.map(({ em }, i) => {
    const c = copia(em);
    if (i) c.properties.hidden = true;
    return c;
  });
  const flecha = (dir, signo, nombre) =>
    el("button", { type: "button", className: ["car-flecha"], dataDir: String(dir), ariaLabel: nombre }, [texto(signo)]);
  return el("figure", { className: ["carrusel"], dataCarrusel: "", tabIndex: 0, ariaRoledescription: "carrusel", ariaLabel: `${n} fotos` }, [
    el("div", { className: ["car-marco"] }, imgs),
    el("figcaption", { className: ["car-pie"] }, [
      el("span", { className: ["car-nav"] }, [
        flecha(-1, "‹", "Foto anterior"),
        el("span", { className: ["car-cont"], ariaLive: "polite" }, [texto(`1 / ${n}`)]),
        flecha(1, "›", "Foto siguiente"),
      ]),
      el("span", { className: ["car-pies"] }, pies),
    ]),
  ]);
}

export default function carruselFotos({ fileURL, data }) {
  const fm = data?.astro?.frontmatter ?? {};
  if (!fm.municion && !fileURL?.pathname.includes("/uas/armamento/")) return null;
  return {
    name: "carrusel-fotos",
    after(root, ctx) {
      // Grupos de párrafos-foto seguidos (entre ellos solo puede haber saltos de línea).
      const grupos = [];
      let actual = [];
      const cerrar = () => {
        if (actual.length > 1) grupos.push(actual);
        actual = [];
      };
      for (const n of root.children) {
        if (n.type === "text" && !n.value.trim()) continue;
        const f = foto(n);
        if (f) actual.push({ nodo: n, ...f });
        else cerrar();
      }
      cerrar();
      for (const g of grupos) {
        ctx.insertBefore(g[0].nodo, carrusel(g));
        for (const { nodo } of g) ctx.removeNode(nodo);
      }
    },
  };
}
