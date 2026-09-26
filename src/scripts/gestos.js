// Gestos sobre un astro: girarlo con la mano y acercarlo con el zoom. Los usan
// la Tierra de la portada, /luna y /marte con el mismo motor delante
// (tierra-gl.js o marte-gl.js), que es quien sabe qué hacer con cada gesto.

// La mano, como en Google Maps: clic y arrastrar gira el astro; al soltar se
// queda donde se dejó.
// - Hasta que el ratón no se mueve UMBRAL píxeles no empieza el giro: un clic
//   sin arrastrar sigue siendo un clic (las chapas lo necesitan).
// - Sobre botones, enlaces, campos y lo marcado con `data-sin-arrastre` no se
//   agarra.
// - Tras un arrastre de verdad se anula el clic que el navegador manda al
//   soltar, para que no pulse lo que quede debajo.
// - En táctil gira un dedo. Con dos es el pellizco de montarZoom (que pone
//   `pellizcando` en `zona`): mientras dura no se gira, y al levantar un dedo
//   se sigue con el otro sin salto.
// Pone en `zona` la clase `arrastrable` siempre y `agarrando` mientras se
// gira; el cursor lo pone el CSS de cada página. Con `alArrastrar`,
// `agarrando` llega al empezar a girar y no al pinchar (un clic suelto no
// cierra la mano). `tactil()` dice si un dedo agarra: en la portada solo con
// zoom, porque sin él el dedo baja la página. Devuelve la función que lo
// desmonta.
/**
 * @param {HTMLElement} zona
 * @param {{ mueve: (dx: number, dy: number) => void, suelta: () => void }} astro
 * @param {{ alArrastrar?: boolean, tactil?: () => boolean }} [opciones]
 */
export function montarMano(zona, astro, { alArrastrar = false, tactil = () => true } = {}) {
  const UMBRAL = 4;                               // px CSS antes de que cuente como arrastre
  const NO_AGARRA = "a, button, input, select, textarea, label, summary, [data-sin-arrastre]";
  let pulsado = null, arrastrado = false;         // pulsado: { id, x0, y0, x, y, activo }
  zona.classList.add("arrastrable");
  const terminar = () => {
    if (!pulsado) return;
    zona.classList.remove("agarrando");
    if (pulsado.activo) {
      if (zona.hasPointerCapture(pulsado.id)) zona.releasePointerCapture(pulsado.id);
      arrastrado = true;
      astro.suelta();
    }
    pulsado = null;
  };
  const empieza = (e) => {
    if (e.button !== 0 || pulsado || (e.target instanceof Element && e.target.closest(NO_AGARRA))) return;
    if (e.pointerType === "touch" && !tactil()) return;
    e.preventDefault();                           // sin selección de texto ni arrastrar imágenes
    pulsado = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, activo: false };
    arrastrado = false;
    if (!alArrastrar) zona.classList.add("agarrando");
  };
  const mueve = (e) => {
    if (!pulsado || e.pointerId !== pulsado.id) return;
    if (zona.classList.contains("pellizcando")) {
      pulsado.x = e.clientX;
      pulsado.y = e.clientY;
      pulsado.activo = true;                      // cuenta como arrastre: sin clic al soltar
      return;
    }
    if (!pulsado.activo) {
      if (Math.hypot(e.clientX - pulsado.x0, e.clientY - pulsado.y0) < UMBRAL) return;
      pulsado.activo = true;
      zona.setPointerCapture(pulsado.id);
      zona.classList.add("agarrando");
    }
    const dx = e.clientX - pulsado.x, dy = e.clientY - pulsado.y;
    pulsado.x = e.clientX;
    pulsado.y = e.clientY;
    if (dx || dy) astro.mueve(dx, dy);
  };
  const acaba = (e) => { if (pulsado && e.pointerId === pulsado.id) terminar(); };
  const clic = (e) => {
    if (!arrastrado) return;
    arrastrado = false;
    e.stopPropagation();
    e.preventDefault();
  };
  zona.addEventListener("pointerdown", empieza);
  zona.addEventListener("pointermove", mueve);
  zona.addEventListener("pointerup", acaba);
  zona.addEventListener("pointercancel", acaba);
  zona.addEventListener("click", clic, true);
  window.addEventListener("blur", terminar);
  return () => {
    zona.removeEventListener("pointerdown", empieza);
    zona.removeEventListener("pointermove", mueve);
    zona.removeEventListener("pointerup", acaba);
    zona.removeEventListener("pointercancel", acaba);
    zona.removeEventListener("click", clic, true);
    window.removeEventListener("blur", terminar);
    terminar();
    zona.classList.remove("arrastrable", "agarrando");
  };
}

// El zoom: rueda del ratón, trackpad y pellizco en táctil.
// - En Chrome y Firefox el pellizco del trackpad llega como rueda con ctrlKey
//   (en pasos pequeños); Safari lo manda como eventos gesture*. En todos se
//   anula lo que harían por defecto (scroll o zoom de la página).
// - En táctil, la distancia entre dos dedos es el zoom, hacia su punto medio.
//   Mientras dura, `zona` lleva `pellizcando`. iOS manda además gesture* con
//   el mismo pellizco: se ignoran si hay dedos, o el zoom iría doble.
// - `soloCtrl` (la portada, que tiene página debajo): la rueda normal baja la
//   página; solo el pellizco del trackpad o Ctrl + rueda acercan.
// Devuelve la función que lo desmonta.
/**
 * @param {HTMLElement} zona
 * @param {{ zoom: (factor: number, clientX?: number, clientY?: number) => void }} astro
 * @param {{ soloCtrl?: boolean }} [opciones]
 */
export function montarZoom(zona, astro, { soloCtrl = false } = {}) {
  const rueda = (e) => {
    if (soloCtrl && !e.ctrlKey) return;
    e.preventDefault();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;                // en líneas
    else if (e.deltaMode === 2) d *= window.innerHeight;
    // un golpe de rueda (100 px) = x1,28; el pellizco, más sensible
    const k = e.ctrlKey ? 0.012 : 0.0025;
    astro.zoom(Math.exp(-Math.max(-300, Math.min(300, d)) * k), e.clientX, e.clientY);
  };
  const dedos = new Map();                         // pointerId -> { x, y }, solo táctiles
  let separacion = 0;                              // entre los dos dedos, en px CSS
  const medida = () => {
    const [a, b] = [...dedos.values()];
    return [Math.hypot(a.x - b.x, a.y - b.y), (a.x + b.x) / 2, (a.y + b.y) / 2];
  };
  const dedo = (e) => {
    if (e.pointerType !== "touch") return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size === 2) {
      zona.classList.add("pellizcando");
      separacion = medida()[0];
    }
  };
  const dedoMueve = (e) => {
    if (!dedos.has(e.pointerId)) return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size !== 2) return;
    const [d, x, y] = medida();
    if (separacion > 0 && d > 0) astro.zoom(d / separacion, x, y);
    separacion = d;
  };
  const dedoFuera = (e) => {
    if (!dedos.delete(e.pointerId)) return;
    if (dedos.size < 2) {
      zona.classList.remove("pellizcando");
      separacion = 0;
    }
  };
  let escala = 1;
  const gesto0 = (e) => { e.preventDefault(); escala = 1; };
  const gesto = (e) => {
    e.preventDefault();
    if (dedos.size) return;                        // iOS: ya lo lleva el pellizco táctil
    astro.zoom(e.scale / escala, e.clientX, e.clientY);
    escala = e.scale;
  };
  zona.addEventListener("wheel", rueda, { passive: false });
  zona.addEventListener("pointerdown", dedo);
  zona.addEventListener("pointermove", dedoMueve);
  zona.addEventListener("pointerup", dedoFuera);
  zona.addEventListener("pointercancel", dedoFuera);
  zona.addEventListener("gesturestart", gesto0);
  zona.addEventListener("gesturechange", gesto);
  return () => {
    zona.removeEventListener("wheel", rueda);
    zona.removeEventListener("pointerdown", dedo);
    zona.removeEventListener("pointermove", dedoMueve);
    zona.removeEventListener("pointerup", dedoFuera);
    zona.removeEventListener("pointercancel", dedoFuera);
    zona.removeEventListener("gesturestart", gesto0);
    zona.removeEventListener("gesturechange", gesto);
    zona.classList.remove("pellizcando");
  };
}
