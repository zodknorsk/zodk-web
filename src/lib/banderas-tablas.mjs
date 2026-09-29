// Plugin de Sätteri para las notas del hangar de UAS (fichas de drones y
// armamento): en las tablas, la bandera emoji del principio de una celda
// («🇹🇷 Turquía», la fila «País») se cambia por su chapa en pixel art, la
// misma de los filtros, las tarjetas y el visor (src/data/banderas-uas.ts).
// Lo decidió el usuario el 29-sep-2026. En la bóveda sigue el emoji. Si el
// país no tiene chapa, se queda el emoji.
import { banderaPorEmoji } from "../data/banderas-uas.ts";

// Una bandera emoji: dos letras regionales seguidas.
const BANDERA = /^([\u{1F1E6}-\u{1F1FF}]{2})\s*/u;

// La chapa como nodos HAST: lo mismo que svgBandera (alunizajes.ts), con el
// contorno oscuro de 1 px.
function chapa(pais) {
  const rect = (x, y, w, h, fill) => ({ type: "element", tagName: "rect", properties: { x, y, width: w, height: h, fill }, children: [] });
  const celdas = [rect(0, 0, 13, 9, "#10131c")];
  pais.filas.forEach((fila, y) => [...fila].forEach((c, x) => celdas.push(rect(x + 1, y + 1, 1, 1, pais.paleta[c]))));
  const svg = { type: "element", tagName: "svg", properties: { viewBox: "0 0 13 9", ariaHidden: "true" }, children: celdas };
  return { type: "element", tagName: "span", properties: { className: ["bandera-uas"], title: pais.nombre }, children: [svg] };
}

export default function banderasTablas({ fileURL }) {
  if (!fileURL?.pathname.includes("/content/uas/")) return null;
  return {
    name: "banderas-tablas",
    text(nodo, ctx) {
      const m = nodo.value.match(BANDERA);
      if (!m) return;
      const padre = ctx.parent(nodo);
      if (padre?.type !== "element" || padre.tagName !== "td") return;
      const pais = banderaPorEmoji(m[1]);
      if (!pais) return;
      ctx.replaceNode(nodo, [chapa(pais), { type: "text", value: ` ${nodo.value.slice(m[0].length)}` }]);
    },
  };
}
