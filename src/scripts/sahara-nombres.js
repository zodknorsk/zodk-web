// Los nombres del mapa del Sáhara: países, regiones, mares, cabos, ciudades y
// pueblos (public/sahara/sahara-nombres.json, de arte/generar-nombres-sahara.py),
// en HTML encima del lienzo, con el estilo de los nombres de la Luna y Marte.
// - Cada uno sale a partir de su zoom (`desde`, en px CSS por píxel del mapa
//   base): al abrir, los países, los mares y lo del Sáhara; al acercarse, el
//   resto, de más a menos importante.
// - Sin pisarse: la lista viene ordenada por importancia y uno que choca con
//   otro ya puesto no sale.
// - `coloca()` se llama tras cada repintado del mapa.

import { SAHARA_V } from "./versiones.js";

const AIRE = 4;                                   // px entre nombres

/**
 * @param {HTMLElement} capa
 * @param {{ aPantalla: (lat: number, lon: number) => number[], escalaCss: () => number }} mapa
 */
export async function montarNombresSahara(capa, mapa) {
  const lista = await fetch(`/sahara/sahara-nombres.json?v=${SAHARA_V}`).then((r) => r.json());
  const nombres = lista.map((n) => {
    const el = document.createElement("div");
    el.className = `sahara-nombre ${n.clase}`;
    el.textContent = n.nombre;
    capa.append(el);
    return { n, el, w: el.offsetWidth, h: el.offsetHeight, visto: false };
  });
  // Los que llevan punto (ciudades, pueblos, cabos y el triángulo de los
  // picos) van a su derecha; los demás, centrados en su sitio.
  const conPunto = new Set(["ciudad", "pueblo", "cabo", "pico"]);

  const coloca = () => {
    const zoom = mapa.escalaCss();
    const W = capa.clientWidth, H = capa.clientHeight;
    const puestos = [];
    for (const o of nombres) {
      let ve = o.n.desde <= zoom + 1e-6;
      let x = 0, y = 0;
      if (ve) {
        const [px, py] = mapa.aPantalla(o.n.lat, o.n.lon);
        [x, y] = conPunto.has(o.n.clase) ? [px - 3, py - o.h / 2] : [px - o.w / 2, py - o.h / 2];
        ve = x >= 0 && y >= 0 && x + o.w <= W && y + o.h <= H &&      // entero, sin cortar
          !puestos.some((p) => x < p[2] + AIRE && x + o.w + AIRE > p[0] && y < p[3] + AIRE && y + o.h + AIRE > p[1]);
      }
      if (ve) {
        puestos.push([x, y, x + o.w, y + o.h]);
        o.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      }
      if (ve !== o.visto) {
        o.visto = ve;
        o.el.classList.toggle("visto", ve);
      }
    }
  };
  coloca();
  return { coloca, quitar: () => capa.replaceChildren() };
}
