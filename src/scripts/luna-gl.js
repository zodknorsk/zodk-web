// La Luna que gira y se acerca (Proyecto Luna, 23-sep-2026): la Luna de
// /luna en el motor WebGL de Marte (src/scripts/marte-gl.js), con los datos
// de public/luna/ (generar-luna.py --canvas y --teselas). Se gira con clic y
// arrastrar (un dedo en el móvil) y se acerca con la rueda, el trackpad o
// pellizcando, hasta x6, con los niveles de teselas n1-n4.
//
// La luz va con la vista (usuario, 23-sep-2026): según gana terreno la cara
// oculta, la Luna se oscurece y se enfría, como en la media vuelta de antes.
// "Cuánto de cara oculta se ve" es el ángulo de la vista a la cara visible,
// en proporción al que hay entre las dos caras de luna-datos.json (150°), y
// la fase del sol, la exposición y el tono frío van de los de una cara a los
// de la otra.
//
// Lo prueba logo-files/prototipo-luna/giro-libre.html. Detalle en
// logo-files/LUNA-WIP.md.

import { LUNA_V } from "./luna.js";
import { montarMarteGL } from "./marte-gl.js";

const DEG = Math.PI / 180;
const dir = (lat, lon) => [Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)];
const angulo = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
const lerp = (a, b, t) => a + (b - a) * t;
const inOutSine = (t) => (1 - Math.cos(Math.PI * t)) / 2;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, disco?: () => number, alPintar?: () => void,
 *   vista?: { lat0: number, lon0: number, zoom?: number } | null }} [opciones]
 */
export async function montarLunaGL(canvas, { base = "/luna/", disco, alPintar = () => {}, vista = null } = {}) {
  const D = await fetch(`${base}luna-datos.json?v=${LUNA_V}`).then((r) => r.json());
  const CARAS = D.caras;
  const V = dir(CARAS.visible.lat0, CARAS.visible.lon0), O = dir(CARAS.oculta.lat0, CARAS.oculta.lon0);
  const ENTRE = angulo(V, O);
  // Cuánto de cara oculta se ve (0 visible, 1 oculta).
  const oculta = (lat0, lon0) => Math.max(0, Math.min(1, angulo(dir(lat0, lon0), V) / ENTRE));
  const luz = (lat0, lon0) => {
    const t = oculta(lat0, lon0), A = CARAS.visible, B = CARAS.oculta;
    return { fase: lerp(A.fase, B.fase, t), lado: A.lado, expo: lerp(A.exposicion, B.exposicion, t), frio: lerp(A.frio, B.frio, t) };
  };
  const ini = vista ?? CARAS.visible;
  const m = await montarMarteGL(canvas, {
    base, prefijo: "luna-", version: LUNA_V, lat0: ini.lat0, lon0: ini.lon0,
    disco, alPintar, luz, zoomMax: 6,
  });
  if (!m) return null;
  if (vista?.zoom > 1) m.ponZoom(vista.zoom, true);

  // Ir a una cara (el mando): un giro suave de 2,8 s, la longitud por el
  // camino corto, y si estaba acercada, a la vez de vuelta a x1. Resuelve al
  // acabar; `false` si otro giro lo interrumpió.
  let anim = 0, giro = null;
  function aCara(nombre, ms = 2800) {
    const c = CARAS[nombre], v0 = m.vista();
    const dl = ((c.lon0 - v0.lon0 + 540) % 360) - 180;
    cancelAnimationFrame(anim);
    giro?.(false);
    return new Promise((listo) => {
      giro = listo;
      const t0 = performance.now();
      const paso = (ahora) => {
        const p = Math.min(1, (ahora - t0) / ms), e = inOutSine(p);
        m.ponVista(lerp(v0.lat0, c.lat0, e), v0.lon0 + dl * e);
        if (v0.zoom > 1) m.ponZoom(v0.zoom ** (1 - e), true);
        if (p < 1) anim = requestAnimationFrame(paso);
        else { giro = null; m.suelta(); listo(true); }
      };
      anim = requestAnimationFrame(paso);
    });
  }

  return {
    ...m,
    CARAS,
    // cuánto de cara oculta se ve ahora (0..1) y la cara que domina
    oculta: () => { const v = m.vista(); return oculta(v.lat0, v.lon0); },
    cara: () => { const v = m.vista(); return oculta(v.lat0, v.lon0) >= 0.5 ? "oculta" : "visible"; },
    aCara,
    girando: () => giro !== null,
    desmontar() { cancelAnimationFrame(anim); giro?.(false); m.desmontar(); },
  };
}
