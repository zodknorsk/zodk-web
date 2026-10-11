// Los hitos de fuera del mapa del Sáhara (Madrid, Washington, Argel…): una
// ventana con la zona del lugar (public/sahara/fuera/, de
// generar-sahara.py --zonas) que entra por el lado por el que queda, con el
// mapa del Sáhara detrás. Es una imagen quieta: no gasta nada.

import { SAHARA_V } from "./versiones.js";
import { dibujarMarca } from "./sahara-mapa.js";

const MS = 900;                                   // lo que tarda en entrar y salir (el CSS, igual)
const LADO = 300;                                 // px CSS que mide la zona como mucho

/**
 * @param {HTMLElement} hero  la escena de /sahara
 * @param {HTMLElement} capa  el contenedor .sahara-lejos
 */
export function montarLejos(hero, capa) {
  const nombre = capa.querySelector(".sahara-lejos-nombre");
  const banderaEl = capa.querySelector(".sahara-bandera");
  const img = capa.querySelector(".sahara-lejos-zona");
  // La marca, la misma del mapa, pintada una vez.
  const marca = capa.querySelector(".sahara-lejos-marca");
  marca.width = marca.height = 18;
  dibujarMarca(marca.getContext("2d"), 0, 0, 2);
  let indice = null, visible = false;
  const zonas = () => (indice ??= fetch(`/sahara/fuera/fuera.json?v=${SAHARA_V}`).then((r) => r.json()));

  return {
    /**
     * Enseña el lugar del hito `h`, con su bandera (`svgBandera`: el SVG de
     * la del lugar, o ""); `dir`: [x, y] en pantalla hacia él.
     */
    async mostrar(h, dir, svgBandera = "") {
      const z = (await zonas())[h.lugar];
      if (!z) return;
      nombre.textContent = h.lugar;
      banderaEl.innerHTML = svgBandera;
      banderaEl.hidden = !svgBandera;
      img.src = `/sahara/fuera/${z.archivo}?v=${SAHARA_V}`;
      await img.decode().catch(() => {});
      // Escala entera de píxeles del dispositivo por píxel de la zona.
      const dpr = window.devicePixelRatio || 1;
      const lado = Math.min(LADO, hero.clientWidth - 60);
      const k = Math.max(1, Math.floor((lado * dpr) / img.naturalWidth));
      img.style.width = `${(img.naturalWidth * k) / dpr}px`;
      const n = Math.hypot(dir[0], dir[1]) || 1;
      capa.style.setProperty("--dx", `${(dir[0] / n) * 100}%`);
      capa.style.setProperty("--dy", `${(dir[1] / n) * 100}%`);
      capa.hidden = false;
      void capa.offsetWidth;                      // que la transición salga desde fuera
      capa.classList.add("dentro");
      visible = true;
    },
    ocultar() {
      if (!visible) return;
      visible = false;
      capa.classList.remove("dentro");
      setTimeout(() => { if (!visible) capa.hidden = true; }, MS);
    },
    quitar() { visible = false; },
  };
}
