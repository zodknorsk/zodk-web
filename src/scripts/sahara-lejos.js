// Los hitos de fuera del mapa del Sáhara (Madrid, Washington, Argel…): cómo
// se enseña dónde pasan. PRUEBA: tres formas para elegir, con ?lejos= en la
// dirección (la elegida se queda y las demás se quitan):
// - "tierra": una Tierra pequeña (el motor de la portada) en una esquina, que
//   gira hasta el lugar y lo marca con la X de la portada;
// - "zona": el mapa (y sus nombres) se desplaza hacia allí y entra la zona del lugar
//   (public/sahara/fuera/, de generar-sahara.py --zonas), quieta;
// - "ventana": la zona en un recuadro que entra por el lado del lugar, con el
//   mapa del Sáhara detrás.
// Nada se repinta mientras está quieto: la Tierra se para tras girar y la
// zona es una imagen.

import { SAHARA_V } from "./versiones.js";
import { dibujarMarca } from "./sahara-mapa.js";

const MS = 900;                                   // lo que tarda en ir y volver

/**
 * @param {HTMLElement} hero  la escena de /sahara
 * @param {HTMLElement} capa  el contenedor .sahara-lejos
 */
export function montarLejos(hero, capa) {
  const modo = new URLSearchParams(location.search).get("lejos") ?? "tierra";
  capa.dataset.modo = modo;
  const nombre = capa.querySelector(".sahara-lejos-nombre");
  const img = capa.querySelector(".sahara-lejos-zona");
  const lienzoTierra = capa.querySelector(".sahara-lejos-tierra");
  // La marca de la zona, pintada una vez con la del mapa.
  const marca = capa.querySelector(".sahara-lejos-marca");
  marca.width = 18;
  marca.height = 18;
  dibujarMarca(marca.getContext("2d"), 0, 0, 2);
  let indice = null, tierra = null, giro = 0, visible = false;

  const zonas = () => (indice ??= fetch(`/sahara/fuera/fuera.json?v=${SAHARA_V}`).then((r) => r.json()));

  // La Tierra: se monta la primera vez y gira de donde esté al lugar.
  const girar = async (lat, lon) => {
    if (!tierra) {
      const { montarTierraGL } = await import("./tierra-gl.js");
      tierra = await montarTierraGL(lienzoTierra, {
        disco: () => lienzoTierra.clientWidth * 0.86, radio: 64,
        sinNubes: true, sinAurora: true, banderas: [], lat0: lat, lon0: lon,
      });
      if (!tierra) return;
      tierra.ponParado(true);
    }
    tierra.ponMarca({ lat, lon });
    const { lat0, lon0 } = tierra.vista();
    const dl = ((lon - lon0 + 540) % 360) - 180;  // por el camino corto
    const t0 = performance.now(), yo = ++giro;
    const paso = (t) => {
      if (yo !== giro) return;
      const u = Math.min(1, (t - t0) / MS), k = u * u * (3 - 2 * u);
      tierra.ponVista(lat0 + (lat - lat0) * k, lon0 + dl * k);
      if (u < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  return {
    /** Enseña el lugar `h` (con nombre y coordenadas); `dir`: [x, y] en pantalla hacia él. */
    async mostrar(h, dir) {
      const [lat, lon] = h.coordenadas;
      nombre.textContent = h.lugar;
      const n = Math.hypot(dir[0], dir[1]) || 1;
      capa.style.setProperty("--dx", `${(dir[0] / n) * 100}%`);
      capa.style.setProperty("--dy", `${(dir[1] / n) * 100}%`);
      hero.style.setProperty("--dx-mapa", `${(dir[0] / n) * 100}%`);
      hero.style.setProperty("--dy-mapa", `${(dir[1] / n) * 100}%`);
      if (modo === "tierra") {
        capa.hidden = false;
        visible = true;
        await girar(lat, lon);
        return;
      }
      const z = (await zonas())[h.lugar];
      if (!z) return;
      img.src = `/sahara/fuera/${z.archivo}?v=${SAHARA_V}`;
      await img.decode().catch(() => {});
      // Escala entera de píxeles del dispositivo por píxel de la zona: la que
      // la cubre entera (zona) o la que cabe en el recuadro (ventana).
      const dpr = window.devicePixelRatio || 1;
      const lado = modo === "zona" ? Math.max(hero.clientWidth, hero.clientHeight) : Math.min(340, hero.clientWidth - 32);
      const k = Math.max(1, (modo === "zona" ? Math.ceil : Math.floor)((lado * dpr) / img.naturalWidth));
      img.style.width = `${(img.naturalWidth * k) / dpr}px`;
      capa.hidden = false;
      void capa.offsetWidth;                      // que la transición salga desde fuera
      capa.classList.add("dentro");
      if (modo === "zona") hero.classList.add("lejos-zona");
      visible = true;
    },
    ocultar() {
      if (!visible) return;
      visible = false;
      giro++;
      capa.classList.remove("dentro");
      hero.classList.remove("lejos-zona");
      if (modo === "tierra") capa.hidden = true;
      else setTimeout(() => { if (!visible) capa.hidden = true; }, MS);
    },
    quitar() {
      giro++;
      tierra?.desmontar();
      hero.classList.remove("lejos-zona");
    },
  };
}
