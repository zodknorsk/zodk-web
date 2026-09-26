// La portada: la Tierra del hero en WebGL (tierra-gl.js) gira sola, se
// arrastra con el ratón y se acerca pellizcando o con Ctrl + rueda (la rueda
// sola baja la página).
// La web cambia de página sin recargar (ClientRouter), así que se monta en
// cada llegada a la portada y se desmonta al salir. Se para, como el resto
// del hero, con el ratón sobre una nave o una chapa.
import { navigate } from "astro:transitions/client";
import { montarTierraGL } from "./tierra-gl.js";
import { montarMano, montarZoom } from "./gestos.js";
import { montarNombres } from "./nombres.js";
import { PLANETA_V, LUNA_V, MARTE_V } from "./versiones.js";
import { mgrs } from "./mgrs.js";
import { volarALuna, faseLunaHoy, VUELO_MARTE } from "./vuelos.js";

let planeta: { desmontar(): void; setParado(b: boolean): void } | null = null;
let quitaMira: (() => void) | null = null;
// Para y reanuda el giro del planeta desde fuera (lo usa el vuelo a la Luna).
// Va aparte porque dentro de montarViaje `planeta` es el elemento del hero.
const giroPlaneta = (gira: boolean) => planeta?.setParado(!gira);

// Mira y coordenada MGRS: con ratón, sobre el planeta el cursor pasa a ser
// una mira y bajo el marco del título sale la coordenada del punto que
// apunta (cambia también con el ratón quieto, porque el planeta gira).
// Fuera del planeta: guiones. Sobre una nave o una chapa, la mira se oculta
// y la coordenada se queda congelada, como el resto del hero.
// Clic en el planeta: se clava una X (gira con él) y la coordenada se queda
// fija en ese punto, resaltada. Clic en otro sitio del planeta: la X se
// mueve. Clic sobre la X o Esc: se quita y la lectura vuelve a seguir al
// ratón.
const VACIO = "-- --- ----- -----";
type Geo = { lat: number; lon: number };
type Planeta = {
  geo(x: number, y: number): Geo | null;
  setMarca(p: Geo | null): void;
  posMarca(): { x: number; y: number } | null;
  setParado(b: boolean): void;
};
function montarMira(hero: HTMLElement, p: Planeta) {
  const lect = hero.querySelector<HTMLElement>(".hero-mgrs");
  const mira = hero.querySelector<HTMLElement>(".hero-mira");
  if (!lect || !mira || !matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  let ptr: { x: number; y: number; ocupado: boolean } | null = null;
  let fijo: string | null = null;              // coordenada de la X, si hay
  const escribe = (txt: string) => {
    if (lect.textContent !== txt) lect.textContent = txt;
    lect.classList.toggle("fijada", fijo !== null);
  };
  const actualiza = () => {
    if (ptr?.ocupado) {                          // ficha abierta: todo quieto
      mira.hidden = true;
      hero.classList.remove("apuntando");
      return;
    }
    const g = ptr ? p.geo(ptr.x, ptr.y) : null;
    escribe(fijo ?? (g ? mgrs(g.lat, g.lon) : VACIO));
    mira.hidden = !g;
    hero.classList.toggle("apuntando", !!g);
    if (g && ptr) {
      const r = hero.getBoundingClientRect();
      mira.style.left = `${ptr.x - r.left}px`;
      mira.style.top = `${ptr.y - r.top}px`;
    }
  };
  const mueve = (e: PointerEvent) => {
    const t = e.target as Element | null;
    ptr = { x: e.clientX, y: e.clientY, ocupado: !!t?.closest(".hero-craft, .hero-bandera, .hero-cambio, a, button") };
    actualiza();
  };
  const sale = () => { ptr = null; actualiza(); };
  const quita = () => { fijo = null; p.setMarca(null); actualiza(); };
  const clic = (e: MouseEvent) => {
    if ((e.target as Element | null)?.closest(".hero-craft, .hero-bandera, a, button")) return;
    const g = p.geo(e.clientX, e.clientY);
    if (!g) return;
    const x = p.posMarca();
    if (fijo && x && Math.hypot(x.x - e.clientX, x.y - e.clientY) < 16) return quita();   // clic sobre la X
    fijo = mgrs(g.lat, g.lon);
    p.setMarca(g);
    actualiza();
  };
  const tecla = (e: KeyboardEvent) => { if (e.key === "Escape" && fijo) quita(); };
  hero.addEventListener("pointermove", mueve);
  hero.addEventListener("pointerleave", sale);
  hero.addEventListener("click", clic);
  document.addEventListener("keydown", tecla);
  window.addEventListener("scroll", actualiza, { passive: true });
  (hero as HTMLElement & { __actualizaMira?: () => void }).__actualizaMira = actualiza;
  return () => {
    hero.removeEventListener("pointermove", mueve);
    hero.removeEventListener("pointerleave", sale);
    hero.removeEventListener("click", clic);
    document.removeEventListener("keydown", tecla);
    window.removeEventListener("scroll", actualiza);
    hero.classList.remove("apuntando");
  };
}

// Botón de play/pausa junto a la coordenada: para y reanuda el giro del
// planeta (de día y de noche). Al cargar, siempre gira.
function montarGiro(hero: HTMLElement, p: Planeta) {
  const b = hero.querySelector<HTMLButtonElement>(".hero-giro");
  if (!b) return () => {};
  const pon = (parado: boolean) => {
    p.setParado(parado);
    hero.classList.toggle("giro-parado", parado);
    b.setAttribute("aria-pressed", String(parado));
    b.setAttribute("aria-label", parado ? "Reanudar el giro del planeta" : "Parar el giro del planeta");
  };
  const clic = () => pon(!hero.classList.contains("giro-parado"));
  pon(false);
  b.addEventListener("click", clic);
  return () => { b.removeEventListener("click", clic); hero.classList.remove("giro-parado"); };
}

// Acercamiento: al cargar se ve la Tierra entera y, al segundo, la cámara se
// acerca en 5 s hasta el horizonte del hemisferio norte. Arranque suave y
// frenada larga, hacia un punto fijo cerca del polo: el centro del disco baja
// a la par que crece (encuadre), y al alejar con el zoom vuelve solo al disco
// entero centrado. Al acabar entra el título (el visor se cierra y la censura
// se retira) y después la nave; los nombres esperan a que se use el zoom.
// Solo al cargar la portada: al volver en vuelo se queda el disco entero.
const ZOOM_CERCA = 2.5, ESPERA = 1000, ACERCA = 5000;
// lo alto del disco a ZOOM_CERCA, en tanto por uno del alto del hero; en vertical
// más abajo, que el sol y Marte (en las esquinas) queden en el cielo
const HORIZONTE = 0.12, HORIZONTE_VERTICAL = 0.22;
// cubic-bezier(x1, y1, x2, y2) como en CSS: de 0..1 (tiempo) a 0..1 (avance)
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const B = (a: number, b: number, t: number) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  return (x: number) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (B(x1, x2, m) < x) lo = m; else hi = m; }
    return B(y1, y2, (lo + hi) / 2);
  };
}
const curvaCamara = bezier(0.45, 0.05, 0.2, 1);
// Píxeles CSS que baja el centro del disco a zoom z (para el motor): crece
// con el zoom hasta ZOOM_CERCA, donde lo alto del disco queda a HORIZONTE.
// Las medidas se guardan y se rehacen al cambiar el tamaño de la ventana.
function encuadreLlegada(hero: HTMLElement, sonda: HTMLElement) {
  let alto = 0, disco = 0, horizonte = HORIZONTE;
  const mide = () => {
    alto = hero.clientHeight;
    disco = sonda.getBoundingClientRect().height;
    horizonte = alto > hero.clientWidth ? HORIZONTE_VERTICAL : HORIZONTE;
  };
  mide();
  const ro = new ResizeObserver(mide);
  ro.observe(hero);
  const encuadre = (z: number) => {
    const k = Math.max(0, (ZOOM_CERCA * disco / 2 - (0.5 - horizonte) * alto) / (ZOOM_CERCA - 1));
    return k * (Math.min(z, ZOOM_CERCA) - 1);
  };
  return { encuadre, quita: () => ro.disconnect() };
}
// El documento del título solo se ve en el encuadre de llegada (ZOOM_CERCA)
// y sin arrastrar; con cualquier otro zoom (también a ×1, o al volver en
// vuelo) se retira y la coordenada pasa al recuadro de la esquina
// (.titulo-fuera en portada.css). Si solo se gira arrastrando, vuelve un
// momento después de soltar. No durante el acercamiento (el zoom cambia
// solo). Se mira en cada fotograma pintado y al soltar (quieto, el planeta
// no repinta). Devuelve { mira, quita }.
function montarTituloFuera(hero: HTMLElement, zoom: () => number) {
  let t = 0;
  // la coordenada y sus botones: bajo el visor con el documento, en el
  // recuadro de la esquina sin él (se mueven los nodos: siguen sus eventos)
  const marco = hero.querySelector<HTMLElement>(".hero-marco"), hud = hero.querySelector<HTMLElement>(".hero-hud");
  const piezas = [".hero-lectura", ".hero-cambio"].map((q) => hero.querySelector<HTMLElement>(q)).filter((e) => e !== null);
  const fuera = (si: boolean) => {
    if (hero.classList.contains("titulo-fuera") === si) return;
    hero.classList.toggle("titulo-fuera", si);
    if (!marco || !hud) return;
    (si ? hud : marco).append(...piezas);
    hud.hidden = !si;
  };
  const reposo = () => hero.classList.contains("titulo-listo") && !hero.matches(".agarrando, .pellizcando")
    && Math.abs(zoom() - ZOOM_CERCA) < 0.05;
  const mira = () => {
    if (hero.classList.contains("acercandose")) return;
    if (!reposo()) {
      clearTimeout(t);
      t = 0;
      fuera(true);
    } else if (hero.classList.contains("titulo-fuera") && !t) {
      t = window.setTimeout(() => { t = 0; if (reposo()) fuera(false); else mira(); }, 900);
    }
  };
  const alSoltar = () => requestAnimationFrame(mira);
  hero.addEventListener("pointerup", alSoltar);
  hero.addEventListener("touchend", alSoltar);
  return { mira, quita: () => { clearTimeout(t); fuera(false); hero.removeEventListener("pointerup", alSoltar); hero.removeEventListener("touchend", alSoltar); } };
}
let quitaAcercamiento: (() => void) | null = null;
function montarAcercamiento(hero: HTMLElement, tierra: { acercar(z: number, ms: number, curva: (u: number) => number): Promise<void>; ponZoom(z: number, ya?: boolean): void }) {
  quitaAcercamiento?.();
  const tt: number[] = [];
  const luego = (ms: number, f: () => void) => tt.push(window.setTimeout(f, ms));
  quitaAcercamiento = () => { tt.forEach(clearTimeout); quitaAcercamiento = null; };
  // al volver en vuelo, las estrellas llegan con su sitio puesto (astro:after-swap)
  const llegaVolando = !!hero.querySelector<HTMLElement>(".hero-stars")?.style.getPropertyValue("--estrellas-pos");
  if (llegaVolando) { hero.classList.add("nave-lista"); return; }   // disco entero: sin documento (montarTituloFuera)
  hero.classList.add("astros-esquina", "sin-nombres");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    tierra.ponZoom(ZOOM_CERCA, true);
    hero.classList.add("titulo-listo", "nave-lista");
    return;
  }
  hero.classList.remove("astros-esquina");
  hero.classList.add("acercandose");               // desde ya: el segundo de espera también cuenta
  luego(ESPERA, () => {
    hero.classList.add("astros-esquina", "moviendo-astros");
    tierra.acercar(ZOOM_CERCA, ACERCA, curvaCamara).then(() => hero.classList.remove("acercandose"));
  });
  luego(ESPERA + ACERCA - 600, () => hero.classList.add("titulo-listo", "titulo-entra"));
  luego(ESPERA + ACERCA + 200, () => hero.classList.remove("moviendo-astros"));
  luego(ESPERA + ACERCA + 1000, () => hero.classList.add("nave-lista"));
}

// Fase de la luna de hoy (faseLunaHoy() en vuelos.js; sin JS, llena).
function faseLuna() {
  const el = document.querySelector<HTMLElement>(".astro-luna");
  if (el) el.style.backgroundPosition = faseLunaHoy();
}

// Al cambiar de tema, el sol se pone tras la Tierra y sale la luna (o al
// revés): marca .a-noche / .a-dia en .hero-astro mientras dura (CSS).
let quitaAstro: (() => void) | null = null;
function montarAstro() {
  const a = document.querySelector<HTMLElement>(".hero-astro");
  if (!a) return () => {};
  const html = document.documentElement;
  let noche = html.classList.contains("dark"), t = 0;
  const mo = new MutationObserver(() => {
    const d = html.classList.contains("dark");
    if (d === noche) return;
    noche = d;
    a.classList.remove("a-noche", "a-dia");
    void a.offsetWidth;                          // reinicia la animación
    a.classList.add(d ? "a-noche" : "a-dia");
    clearTimeout(t);
    t = window.setTimeout(() => a.classList.remove("a-noche", "a-dia"), 2700);
  });
  mo.observe(html, { attributes: true, attributeFilter: ["class"] });
  return () => { mo.disconnect(); clearTimeout(t); };
}

// Vuelos a la Luna y a Marte (src/scripts/vuelos.js): al pulsar la luna
// del hero (solo de noche) o Marte (arriba a la derecha), el astro se amplía
// hasta quedar como en su página y entonces se cambia de página; las
// estrellas de allí se colocan donde quedaron (astro:after-swap). Con
// reduced-motion, directo.
type Destino = {
  ruta: string;
  enlace: string;              // el enlace del hero que se pulsa
  icono: string;               // el astro del hero que crece
  img: string;                 // la imagen que crece (la de la otra página)
  heroDestino: string;         // el hero de la otra página (para las estrellas)
  apagarTambien: string;       // lo del cielo que no va con el vuelo (se apaga)
  opciones?: { tam?: string; dy?: string; imgLado?: number; imgDisco?: number; iconoDisco?: number; claseIcono?: string };
};
const LUNA: Destino = {
  ruta: "/luna", enlace: ".hero-luna-enlace", icono: ".astro-luna",
  img: `/luna/luna-visible.png?v=${LUNA_V}`, heroDestino: ".luna-hero", apagarTambien: ".hero-marte",
};
// Marte acaba en el disco de /marte (VUELO_MARTE en vuelos.js).
const MARTE: Destino = {
  ruta: "/marte", enlace: ".hero-marte-enlace", icono: ".hero-marte",
  img: `/marte/marte-quieto.png?v=${MARTE_V}`, heroDestino: ".marte-hero", apagarTambien: ".hero-astro",
  opciones: VUELO_MARTE,
};
// Al aterrizar: en qué hero y dónde van las estrellas.
let llegada: { hero: string; pos: string } | null = null;

// Enlaces "moon-project" y "mars-project" de la cabecera (Header.astro): en
// la portada se comportan como la luna y Marte del hero (disparan un clic
// real sobre su enlace, así que reutilizan montarViaje sin duplicar nada).
// La luna solo se ve de noche: de día, primero cambia a modo noche pulsando
// el propio botón de tema (mismo camino que si lo pulsara el usuario) y
// espera a que se vea la luna antes de volar. Marte se ve siempre.
function montarEnlaceCabecera(d: Destino, deNoche: boolean) {
  const enlace = document.querySelector<HTMLAnchorElement>(`header nav a[href='${d.ruta}']`);
  const hero = document.querySelector<HTMLAnchorElement>(`.hero ${d.enlace}`);
  if (!enlace || !hero) return () => {};
  const clic = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (!deNoche || document.documentElement.classList.contains("dark")) {
      hero.click();
      return;
    }
    document.getElementById("theme-button")?.click();
    const espera = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2600;
    setTimeout(() => hero.click(), espera);
  };
  enlace.addEventListener("click", clic);
  return () => enlace.removeEventListener("click", clic);
}

// Un solo vuelo a la vez, vaya a donde vaya.
let enVuelo = false;
let quitaViajes: (() => void)[] = [];
function montarViaje(hero: HTMLElement, d: Destino) {
  const enlace = hero.querySelector<HTMLAnchorElement>(d.enlace);
  const icono = hero.querySelector<HTMLElement>(d.icono);
  const estrellas = hero.querySelector<HTMLElement>(".hero-stars");
  if (!enlace || !icono || !estrellas || !hero.querySelector(".hero-planet")) return () => {};
  let img: HTMLImageElement | null = null;
  let mio = false, cancela = () => {};
  const precarga = () => {
    if (img) return;
    img = new Image();
    img.src = d.img;
    img.decode().catch(() => {});
  };
  const clic = async (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // nueva pestaña, etc.
    e.preventDefault();
    if (enVuelo) return;
    enVuelo = mio = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return navigate(d.ruta);
    precarga();
    await img!.decode().catch(() => {});
    // La cabecera también: /luna y /marte no la tienen y así no desaparece
    // de golpe. Y el otro astro del cielo: no gira con la cámara.
    const SEL_APAGAR = `.hero-titulo, .hero-hud, .tierra-nombres, .hero-craft, .hero-banderas, .hero-sparkle, .hero-scroll, .hero-mira, ${d.apagarTambien}`;
    const apagar = [...hero.querySelectorAll<HTMLElement>(SEL_APAGAR), ...document.querySelectorAll<HTMLElement>("body > header")];
    // El planeta deja de girar mientras dura el vuelo: no se aprecia y cada
    // repintado cuesta un volcado entero del lienzo justo en el momento de
    // más trabajo de toda la web (docs/rendimiento.md).
    giroPlaneta(false);
    // La Tierra que se queda atrás: el lienzo si ya ha pintado (con zoom o
    // girada, tal como esté), si no la Tierra quieta.
    const planeta = hero.querySelector<HTMLElement>(".hero-tierra.lista") ?? hero.querySelector<HTMLElement>(".hero-planet")!;
    const vuelo = volarALuna({ icono, planeta, estrellas, apagar, img: img!, ...d.opciones });
    cancela = vuelo.limpiar;
    llegada = { hero: d.heroDestino, pos: await vuelo.fin };
    // La capa se va con la página vieja al cambiar (ClientRouter sustituye el <body>).
    navigate(d.ruta);
  };
  enlace.addEventListener("pointerenter", precarga);
  enlace.addEventListener("focus", precarga);
  enlace.addEventListener("touchstart", precarga, { passive: true });
  enlace.addEventListener("click", clic);
  return () => {
    if (mio && llegada === null) { cancela(); giroPlaneta(true); }   // se sale a mitad de vuelo
    if (mio) enVuelo = false;
    enlace.removeEventListener("pointerenter", precarga);
    enlace.removeEventListener("focus", precarga);
    enlace.removeEventListener("touchstart", precarga);
    enlace.removeEventListener("click", clic);
  };
}

// Al aterrizar en /luna o /marte, sus estrellas donde quedaron las del vuelo
// (antes de que se pinte la página nueva).
document.addEventListener("astro:after-swap", () => {
  if (llegada === null) return;
  document.querySelector<HTMLElement>(`${llegada.hero} .hero-stars`)?.style.setProperty("--estrellas-pos", llegada.pos);
  llegada = null;
});

document.addEventListener("astro:page-load", async () => {
  faseLuna();
  quitaAstro?.();
  quitaAstro = montarAstro();
  for (const q of quitaViajes) q();
  quitaViajes = [];
  const heroViaje = document.querySelector<HTMLElement>(".hero");
  if (heroViaje?.querySelector(".hero-planet")) {
    quitaViajes = [
      montarViaje(heroViaje, LUNA), montarEnlaceCabecera(LUNA, true),
      montarViaje(heroViaje, MARTE), montarEnlaceCabecera(MARTE, false),
    ];
  }
  const cv = document.querySelector<HTMLCanvasElement>(".hero-tierra-canvas");
  const hero = cv?.closest<HTMLElement>(".hero");
  if (!cv || !hero) return;
  const caja = cv.parentElement!, quieta = hero.querySelector<HTMLElement>(".hero-planet");
  const sonda = hero.querySelector<HTMLElement>(".hero-tierra-sonda")!;
  const html = document.documentElement;

  // Chapas: cada una lleva encima un <div> que reacciona al ratón (y al
  // teclado) y despliega la ficha de artículos; el motor dice en cada
  // fotograma dónde queda cada chapa visible y aquí se coloca su <div>,
  // del tamaño de la chapa (13 x 9 píxeles de arte con el contorno).
  const chapas = new Map(
    [...hero.querySelectorAll<HTMLElement>(".hero-bandera")].map((el) => [el.dataset.iso ?? "", el]),
  );
  for (const el of chapas.values()) {
    const lado = () => {
      const r = el.getBoundingClientRect();
      el.classList.toggle("flip-x", r.right + 380 > window.innerWidth);   // la ficha no cabe a la derecha
    };
    el.addEventListener("mouseenter", lado);
    el.addEventListener("focus", lado);
  }
  let t: Awaited<ReturnType<typeof montarTierraGL>> = null;
  const colocaChapas = () => {
    if (!t) return;
    const r = hero.getBoundingClientRect(), px = t.pxArte();
    const vistas: Set<string> = new Set();
    for (const { iso, x, y } of t.chapas()) {
      const el = chapas.get(iso);
      if (!el) continue;
      vistas.add(iso);
      el.style.left = `${x - r.left}px`;
      el.style.top = `${y - r.top}px`;
      el.style.width = `${13 * px}px`;
      el.style.height = `${9 * px}px`;
      el.hidden = false;
    }
    for (const [iso, el] of chapas) {
      if (!vistas.has(iso) && !el.matches(":hover, :focus-within")) el.hidden = true;
    }
  };
  const alPintar = () => {
    if (!t) return;
    quieta?.classList.add("planeta-listo");
    caja.classList.add("lista");
    // con zoom, un dedo mueve el globo; sin él, baja la página (CSS)
    hero.classList.toggle("con-zoom", t.vista().zoom > 1.01);
    colocaChapas();
    colocaNombres?.();
    tituloFuera?.mira();
    (hero as HTMLElement & { __actualizaMira?: () => void }).__actualizaMira?.();
  };
  let colocaNombres: (() => void) | null = null, quitaNombres = () => {};
  let tituloFuera: ReturnType<typeof montarTituloFuera> | null = null;

  const enc = encuadreLlegada(hero, sonda);
  t = await montarTierraGL(cv, {
    disco: () => sonda.getBoundingClientRect().height,
    encuadre: enc.encuadre,
    alPintar,
    banderas: [...chapas.keys()],
    pausado: () => !!hero.querySelector(".hero-craft:hover, .hero-bandera:hover, .hero-bandera:focus-within"),
    noche: html.classList.contains("dark"),
  });
  // Sin WebGL2 se queda la Tierra quieta, sin mano, zoom, mira ni acercamiento.
  if (!t) { enc.quita(); hero.classList.add("titulo-listo", "nave-lista"); return; }
  const tierra = t;
  if (!cv.isConnected) { enc.quita(); return tierra.desmontar(); }   // se salió de la portada mientras cargaba
  montarAcercamiento(hero, tierra);
  tituloFuera = montarTituloFuera(hero, () => tierra.vista().zoom);
  alPintar();
  // Tema: a la luz del sol o de la luna (la clase .dark en <html>; la lista
  // de clases cambia también al hacer scroll, de ahí comparar).
  let temaNoche = html.classList.contains("dark");
  const mo = new MutationObserver(() => {
    if (html.classList.contains("dark") === temaNoche) return;
    temaNoche = !temaNoche;
    tierra.ponNoche(temaNoche);
  });
  mo.observe(html, { attributes: true, attributeFilter: ["class"] });
  const capaNombres = hero.querySelector<HTMLElement>(".tierra-nombres");
  if (capaNombres) {
    montarNombres(capaNombres, tierra, [], { url: `/planeta/tierra-nombres.json?v=${PLANETA_V}`, radioKm: 6371 })
      .then((n) => {
        if (!capaNombres.isConnected) return n.desmontar();
        colocaNombres = n.coloca;
        quitaNombres = n.desmontar;
        n.coloca();
      }).catch(() => {});
  }
  const quitaMano = montarMano(hero, tierra, { alArrastrar: true, tactil: () => tierra.vista().zoom > 1.01 });
  // al usar el zoom salen los nombres (tras el acercamiento esperan a esto)
  const conNombres = { ...tierra, zoom: (f: number, x?: number, y?: number) => { hero.classList.remove("sin-nombres"); tierra.zoom(f, x, y); } };
  const quitaZoom = montarZoom(hero, conNombres, { soloCtrl: true });
  const p = {
    geo: tierra.geo, setMarca: tierra.ponMarca, posMarca: tierra.posMarca, setParado: tierra.ponParado,
    desmontar() { mo.disconnect(); enc.quita(); tituloFuera?.quita(); quitaMano(); quitaZoom(); quitaNombres(); colocaNombres = null; tierra.desmontar(); },
  };
  planeta?.desmontar();
  quitaMira?.();
  planeta = p;
  const q1 = montarMira(hero, p), q2 = montarGiro(hero, p);
  quitaMira = () => { q1(); q2(); };
});

document.addEventListener("astro:before-swap", () => {
  quitaAcercamiento?.();
  quitaAstro?.();
  quitaAstro = null;
  for (const q of quitaViajes) q();
  quitaViajes = [];
  planeta?.desmontar();
  quitaMira?.();
  planeta = null;
  quitaMira = null;
});
