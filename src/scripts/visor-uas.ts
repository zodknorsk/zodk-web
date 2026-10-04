// Visor de maquetas de drones: se gira arrastrando, se acerca con la rueda o
// pellizcando y enseña las partes con chinchetas. En la 1.0, relleno liso
// con las aristas en tinta; con `hd`, el dron pintado (uas-hd.ts). Solo
// pinta cuando algo cambia (arrastrar, zoom,
// cambio de vista); el giro automático es lo único que pinta seguido, y se
// para si la página no se ve.
import {
  Color, DoubleSide, EdgesGeometry, Group, HemisphereLight, LineBasicMaterial,
  LineSegments, Mesh, MeshLambertMaterial, PerspectiveCamera, Raycaster, Scene,
  Spherical, Vector3, WebGLRenderer, DirectionalLight, Box3, MeshBasicMaterial,
  OrthographicCamera, type ShaderMaterial,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Acabado, Maqueta } from "../data/uas/tipos";
import { geometriaDe, VISTAS, type Vista } from "./uas-geometria";
import { crearPixelado, marcaPieza, materialPixel, ponerPaleta } from "./uas-pixelado";
import { PALETAS } from "./uas-paletas";
import { colorHD, crearLuzHD, ESTILOS_HD, materialContorno, materialHD, montarDetalles, type EstiloHD, type MaterialHD } from "./uas-hd";

type Pin = { x: number; y: number; tapado: boolean };

// En la maqueta, las insignias llevan su color; lo demás, el relleno del tema.
const COLOR_MAQUETA: Partial<Record<Acabado, string>> = {
  amarillo: "#e0b400", azul: "#1a4fb5", gris: "#b9bdc3", "gris-et": "#b4bebd", "gris-tr": "#b2bcc4", lente: "#141b26", oliva: "#5e6743", rojo: "#b5262c", "rojo-vivo": "#d81e2a", hueco: "#08090a", blanco: "#f1f1ec", "crema-ir": "#d8d0c2", laton: "#b8953f", aluminio: "#c3c6ca", ocre: "#c9a64a", hueso: "#e0dccd",
};

export type { Vista };

type Colores = { relleno: Color; arista: Color; resalte: Color; resalteArista: Color };

// Siluetas de la tira de vistas: la maqueta entera en un solo color, con
// cámara ortográfica (planta, perfil, frente) o en perspectiva (3D). Se
// pintan una vez en un lienzo aparte y se usan como máscara CSS.
function pintarSiluetas(raiz: Group, radio: number, vistas: Vista[]): Map<Vista, string> {
  const ancho = 256, alto = 128;
  const lienzo = document.createElement("canvas");
  const r = new WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(ancho, alto, false);
  const escena = new Scene();
  const negro = new MeshBasicMaterial({ color: 0x000000, side: DoubleSide });
  const copia = raiz.clone();
  copia.traverse((o) => {
    if (o instanceof Mesh) o.material = negro;
    if (o instanceof LineSegments) o.visible = false;
  });
  escena.add(copia);
  const salida = new Map<Vista, string>();
  for (const vista of vistas) {
    const [az, el] = VISTAS[vista];
    const pos = new Vector3().setFromSpherical(new Spherical(radio * 4, ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180));
    let camara: OrthographicCamera | PerspectiveCamera;
    if (vista === "3d") {
      camara = new PerspectiveCamera(32, ancho / alto, 0.05, 50);
      pos.setLength((radio * 0.8) / Math.sin((16 * Math.PI) / 180));
      camara.position.copy(pos);
      camara.lookAt(0, 0, 0);
    } else {
      // Ajustada a lo que ocupa la maqueta vista desde ahí.
      camara = new OrthographicCamera(-1, 1, 1, -1, 0.01, radio * 10);
      camara.position.copy(pos);
      camara.lookAt(0, 0, 0);
      camara.updateMatrixWorld();
      const ocupa = new Box3().setFromObject(copia).applyMatrix4(camara.matrixWorldInverse);
      const mitadX = Math.max(-ocupa.min.x, ocupa.max.x);
      const mitadY = Math.max(-ocupa.min.y, ocupa.max.y);
      const h = Math.max(mitadY, (mitadX * alto) / ancho) * 1.08;
      camara.left = (-h * ancho) / alto; camara.right = (h * ancho) / alto;
      camara.top = h; camara.bottom = -h;
      camara.updateProjectionMatrix();
    }
    r.render(escena, camara);
    salida.set(vista, lienzo.toDataURL("image/png"));
  }
  negro.dispose();
  r.dispose();
  r.forceContextLoss();
  return salida;
}

export function montarVisor(caja: HTMLElement, maqueta: Maqueta) {
  const lienzo = caja.querySelector<HTMLCanvasElement>(".visor-lienzo")!;
  const rotulo = caja.querySelector<HTMLElement>(".visor-rotulo")!;
  const guia = caja.querySelector<SVGLineElement>(".visor-guia line")!;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
  } catch {
    caja.classList.add("visor-sin-webgl");
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const pixelado = crearPixelado(renderer);

  const escena = new Scene();
  const cielo = new HemisphereLight(0xffffff, 0x60606a, 1.7);
  const sol = new DirectionalLight(0xffffff, 1.9);
  sol.position.set(2, 4, 3);
  escena.add(cielo, sol);

  const camara = new PerspectiveCamera(32, 1, 0.05, 50);
  const controles = new OrbitControls(camara, lienzo);
  // Con el botón derecho (o dos dedos), la vista se desliza de lado y arriba
  // y abajo; con el izquierdo, gira como siempre.
  controles.enablePan = true;
  controles.screenSpacePanning = true;
  // La rueda y el pellizco acercan hacia lo que hay bajo el cursor (el
  // punto al que se mira se mueve con él); al alejarse, vuelve al centro
  // (ver «centrar»). Con la cámara siempre mirando al centro no se podía
  // acercar casi nada sin meterse dentro del ala.
  controles.zoomToCursor = true;
  controles.autoRotateSpeed = 1.2;

  // Piezas: relleno + aristas. Cada pieza guarda sus materiales para
  // resaltarla.
  const raiz = new Group();
  const materiales = new Map<string, { acabado: Acabado; marca: number; relleno: MeshLambertMaterial; linea: LineBasicMaterial; pixel: ShaderMaterial; hd?: MaterialHD }>();
  const mallas: Mesh[] = [];
  const aristas: LineSegments[] = [];
  for (const [i, p] of maqueta.piezas.entries()) {
    const relleno = new MeshLambertMaterial({ side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const linea = new LineBasicMaterial();
    const marca = marcaPieza(i, p.acabado === "junta");
    materiales.set(p.id, { acabado: p.acabado ?? "negro", marca, relleno, linea, pixel: materialPixel(PALETAS.dia.negro, marca) });
    for (const g of geometriaDe(p)) {
      const malla = new Mesh(g, relleno);
      malla.castShadow = malla.receiveShadow = true;
      mallas.push(malla);
      malla.userData.pieza = p.id;
      raiz.add(malla);
      // Las juntas, sin raya: solo un tono algo más oscuro.
      if (p.acabado === "junta") continue;
      const arista = new LineSegments(new EdgesGeometry(g, 28), linea);
      aristas.push(arista);
      raiz.add(arista);
    }
  }
  // Centrar la maqueta en el origen, que es donde mira la cámara.
  const caja3 = new Box3().setFromObject(raiz);
  const centro = caja3.getCenter(new Vector3());
  let radio = caja3.getSize(new Vector3()).length() / 2;
  raiz.position.sub(centro);
  escena.add(raiz);

  // HD: estilo C (realista con filete). Con ?hd=a|b|c|no en la URL se prueba
  // otro y sale el selector de pruebas sobre el lienzo (en la web normal no
  // se ve).
  const luzHD = maqueta.hd ? crearLuzHD(renderer, escena, radio) : null;
  let estiloHD: EstiloHD | null = null;
  if (luzHD) {
    const pedido = new URLSearchParams(location.search).get("hd");
    estiloHD = pedido === null ? "c" : ESTILOS_HD.some((e) => e.id === pedido) ? (pedido as EstiloHD) : null;
    if (pedido !== null) {
      const selector = document.createElement("div");
      selector.className = "visor-hd-prueba";
      selector.innerHTML = `<span>Prueba</span>` + [["no", "1.0"], ...ESTILOS_HD.map((e) => [e.id, `${e.id.toUpperCase()} · ${e.nombre}`])]
        .map(([id, t]) => `<button type="button" data-hd="${id}">${t}</button>`).join("");
      caja.querySelector(".visor-lienzo-caja")?.append(selector);
    }
  }
  // Calcas y costuras del HD (docs/uas-hd.md).
  const detallesHD = luzHD && maqueta.detalles ? montarDetalles(escena, raiz, mallas, maqueta.detalles, radio) : null;
  // Siluetas en tinta de los estilos b y c: una copia de cada malla.
  const tintaContorno = luzHD ? materialContorno(radio * 0.0011) : null;
  const contornos: Mesh[] = [];
  if (tintaContorno) for (const malla of mallas) {
    const c = new Mesh(malla.geometry, tintaContorno);
    c.visible = false;
    c.raycast = () => {};
    contornos.push(c);
    malla.parent!.add(c);
  }

  // La tira de siluetas.
  const botonesVista = [...caja.querySelectorAll<HTMLElement>("[data-vista]")];
  const siluetas = pintarSiluetas(raiz, radio, botonesVista.map((b) => b.dataset.vista as Vista));
  for (const b of botonesVista) {
    const url = siluetas.get(b.dataset.vista as Vista);
    const s = b.querySelector<HTMLElement>(".visor-silueta");
    if (url && s) { s.style.maskImage = `url(${url})`; s.style.webkitMaskImage = `url(${url})`; }
  }

  // Catapulta (el Shahed): sus piezas, aparte y escondidas, con materiales
  // como los del dron (resalte, pixel y HD). Se montan después de las
  // siluetas y del centrado: no cuentan para ellos.
  const grupoCatapulta = new Group();
  grupoCatapulta.visible = false;
  raiz.add(grupoCatapulta);
  const mallasCatapulta: Mesh[] = [];
  if (maqueta.catapulta) for (const [j, p] of maqueta.catapulta.piezas.entries()) {
    const relleno = new MeshLambertMaterial({ side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const linea = new LineBasicMaterial();
    const marca = marcaPieza(maqueta.piezas.length + j, p.acabado === "junta");
    materiales.set(p.id, { acabado: p.acabado ?? "negro", marca, relleno, linea, pixel: materialPixel(PALETAS.dia.negro, marca) });
    for (const g of geometriaDe(p)) {
      const malla = new Mesh(g, relleno);
      malla.castShadow = malla.receiveShadow = true;
      malla.userData.pieza = p.id;
      mallasCatapulta.push(malla);
      grupoCatapulta.add(malla);
      const arista = new LineSegments(new EdgesGeometry(g, 28), linea);
      aristas.push(arista);
      grupoCatapulta.add(arista);
      if (tintaContorno) {
        const c = new Mesh(g, tintaContorno);
        c.visible = false;
        c.raycast = () => {};
        contornos.push(c);
        grupoCatapulta.add(c);
      }
    }
  }
  const radioSinCatapulta = radio;
  // Su botón va en la tira de vistas, con la silueta del dron sobre ella, de
  // perfil: se pinta con la catapulta puesta y el dron inclinado, y se deja
  // todo como estaba.
  const botonCatapulta = caja.querySelector<HTMLElement>("[data-accion=catapulta] .visor-silueta");
  if (maqueta.catapulta && botonCatapulta) {
    const antes = raiz.position.clone();
    grupoCatapulta.visible = true;
    raiz.position.set(0, 0, 0);
    raiz.rotation.x = (-maqueta.catapulta.cabeceo * Math.PI) / 180;
    raiz.updateMatrixWorld(true);
    const todo = new Box3().setFromObject(raiz);
    raiz.position.copy(todo.getCenter(new Vector3()).negate());
    const url = pintarSiluetas(raiz, todo.getSize(new Vector3()).length() / 2, ["lado"]).get("lado");
    if (url) { botonCatapulta.style.maskImage = `url(${url})`; botonCatapulta.style.webkitMaskImage = `url(${url})`; }
    grupoCatapulta.visible = false;
    raiz.rotation.x = 0;
    raiz.position.copy(antes);
    raiz.updateMatrixWorld(true);
  }

  // Distancia a la que la maqueta entera cabe en el lienzo, mire desde donde
  // mire; el zoom va de 1/16 (de cerca, hacia el cursor) a 1,2 veces.
  let distancia = 4;
  // Solo en local (window.__visor.mirar): la cámara puesta a mano no se
  // vuelve a encuadrar ni a acotar al cambiar el tamaño del lienzo.
  let camaraFija = false;
  const encuadrar = () => {
    if (camaraFija) return;
    const vertical = (camara.fov * Math.PI) / 360;
    const horizontal = Math.atan(Math.tan(vertical) * camara.aspect);
    distancia = (radio * 0.78) / Math.sin(Math.min(vertical, horizontal));
    controles.minDistance = distancia / 16;
    controles.maxDistance = distancia * 1.2;
  };

  // Colores del tema (variables CSS del visor): se releen al cambiar día/noche.
  let colores: Colores;
  const leerColores = () => {
    const css = getComputedStyle(caja);
    const c = (n: string) => new Color(css.getPropertyValue(n).trim() || "#888");
    colores = {
      relleno: c("--visor-relleno"), arista: c("--visor-arista"),
      resalte: c("--visor-resalte"), resalteArista: c("--visor-resalte-arista"),
    };
    pintarPiezas();
  };

  let elegida = -1;
  // Drones claros: la parte elegida en tinta (en blanco no se distinguiría).
  const enTinta = maqueta.resalte === "tinta";
  const TINTA = new Color("#1d1f23");
  const pintarPiezas = () => {
    const resaltadas = new Set(elegida >= 0 ? maqueta.partes[elegida].piezas : []);
    const paletas = PALETAS[document.documentElement.classList.contains("dark") ? "noche" : "dia"];
    for (const [id, m] of materiales) {
      const si = resaltadas.has(id);
      const color = COLOR_MAQUETA[m.acabado];
      const base = m.acabado === "junta" ? colores.relleno.clone().multiplyScalar(0.8) : colores.relleno;
      m.relleno.color.copy(si ? (enTinta ? TINTA : colores.resalte) : color ? new Color(color) : base);
      m.hd?.color.copy(si ? (enTinta ? TINTA : colores.resalte) : colorHD(m.acabado));
      m.linea.color.copy(si ? (enTinta ? colores.arista : colores.resalteArista) : colores.arista);
      ponerPaleta(m.pixel, si ? paletas[enTinta ? "tinta" : "resalte"] : paletas[m.acabado]);
    }
    pixelado.ponerContorno(enTinta ? paletas.contornoClaro : paletas.contorno);
  };

  // Chinchetas (las pone el marco, una por parte): se colocan en la
  // proyección de su punto.
  const pines = [...caja.querySelectorAll<HTMLElement>(".visor-pin")].map((b) => ({
    b, en: new Vector3(...maqueta.partes[Number(b.dataset.parte)].en),
  }));
  // Punto de la maqueta en el mundo (la raíz está desplazada para centrarla y,
  // con la catapulta, inclinada).
  pines.forEach(({ b }, j) => { if (maqueta.partes[j].catapulta) b.hidden = true; });
  const enMundo = new Vector3();
  const aMundo = (p: Vector3) => enMundo.copy(p).applyMatrix4(raiz.matrixWorld);

  const rayo = new Raycaster();
  const v = new Vector3();
  // Qué chinchetas tapa la maqueta: lanzar un rayo contra todas las mallas
  // es lo caro, así que mientras se gira se mira como mucho cada 200 ms y,
  // al parar, una vez más.
  const tapadas = pines.map(() => false);
  let ultimaMirada = 0;
  let miradaFinal = 0;
  const mirarTapadas = () => {
    ultimaMirada = performance.now();
    pines.forEach(({ en }, i) => {
      const w = aMundo(en);
      const hasta = camara.position.distanceTo(w);
      rayo.set(camara.position, w.clone().sub(camara.position).normalize());
      const choque = rayo.intersectObjects(mallas, false)[0];
      tapadas[i] = !!choque && choque.distance < hasta - 0.04;
    });
  };
  const colocarPines = (repaso = false) => {
    clearTimeout(miradaFinal);
    if (repaso || performance.now() - ultimaMirada > 200) mirarTapadas();
    else miradaFinal = window.setTimeout(() => colocarPines(true), 220);
    const ancho = lienzo.clientWidth, alto = lienzo.clientHeight;
    aplicarPines(pines.map(({ en }, i) => {
      v.copy(aMundo(en)).project(camara);
      return { x: ((v.x + 1) / 2) * ancho, y: ((1 - v.y) / 2) * alto, tapado: tapadas[i] };
    }));
  };
  // Las chinchetas y el rótulo en su sitio (de la maqueta 3D o del pixel art).
  const aplicarPines = (posiciones: Pin[]) => {
    posiciones.forEach(({ x, y, tapado }, i) => {
      const { b } = pines[i];
      b.style.transform = `translate(${x}px, ${y}px)`;
      b.classList.toggle("visor-pin--tapado", tapado);
      if (i === elegida) colocarRotulo(x, y, lienzo.clientWidth, lienzo.clientHeight);
    });
  };

  // Medido solo al cambiar de texto (medirlo en cada fotograma obliga al
  // navegador a recalcular la página).
  let tamRotulo = [0, 0];

  // Rótulo de la parte elegida: sale hacia fuera de la maqueta (desde el
  // centro del lienzo hacia la chincheta), unido a ella por una línea.
  const colocarRotulo = (x: number, y: number, ancho: number, alto: number) => {
    let dx = x - ancho / 2;
    let dy = y - alto / 2;
    const largo = Math.hypot(dx, dy) || 1;
    dx /= largo; dy /= largo;
    const [w, h] = tamRotulo;
    const rx = Math.min(ancho - w - 8, Math.max(8, x + dx * 70 - (dx < 0 ? w : 0)));
    const ry = Math.min(alto - h - 8, Math.max(8, y + dy * 55 - h / 2));
    rotulo.style.transform = `translate(${rx}px, ${ry}px)`;
    // La línea va de la chincheta al borde más cercano del rótulo.
    guia.setAttribute("x1", String(x));
    guia.setAttribute("y1", String(y));
    guia.setAttribute("x2", String(dx < 0 ? rx + w : rx));
    guia.setAttribute("y2", String(ry + h / 2));
  };

  // Pintar solo cuando haga falta.
  let pedido = 0;
  let ultimo = 0;
  // Como mucho 60 fotogramas por segundo: en pantallas de 120 Hz (la del
  // Mac) se pintaba el doble al girar.
  let ultimoPintado = 0;
  const pintar = (t: number) => {
    pedido = 0;
    if (t - ultimoPintado < 15) { pedir(); return; }
    ultimoPintado = t;
    const dt = ultimo ? (t - ultimo) / 1000 : 1 / 60;
    ultimo = t;
    if (controles.autoRotate) controles.update(dt);
    if (modo === "pixel") {
      luzHD?.seguir(camara);
      pixelado.pintar(escena, camara);
    }
    else {
      if (estiloHD) luzHD?.seguir(camara);
      renderer.render(escena, camara);
    }
    colocarPines();
    if (controles.autoRotate || animando) pedir();
    else ultimo = 0;
  };
  const pedir = () => { if (!pedido) pedido = requestAnimationFrame(pintar); };
  controles.addEventListener("change", pedir);

  // Distancia a la que el dron, visto desde esa vista, llena el lienzo (con
  // margen): lo que ocupa de verdad desde ahí, no la esfera que lo envuelve
  // (con ella, un ala vista de canto dejaba el dron pequeñísimo).
  const punto = new Vector3();
  const distanciaVista = (vista: Vista) => {
    const [az, el] = VISTAS[vista];
    const giro = new PerspectiveCamera();
    giro.position.setFromSpherical(new Spherical(1, ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180));
    giro.lookAt(0, 0, 0);
    giro.updateMatrixWorld();
    raiz.updateMatrixWorld(true);
    // Cada punto cabe si la cámara está, como poco, a la distancia que lo
    // deja dentro del 88 % del lienzo contando con lo que está más cerca de
    // ella (la perspectiva); la vista se pone a la mayor de todas.
    const tanV = Math.tan((camara.fov * Math.PI) / 360) * 0.88, tanH = tanV * camara.aspect;
    let d = 0;
    for (const m of mallas) {
      if (!m.parent?.visible) continue;
      const pos = m.geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i += 3) {
        punto.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).applyMatrix4(giro.matrixWorldInverse);
        d = Math.max(d, Math.max(Math.abs(punto.x) / tanH, Math.abs(punto.y) / tanV) + punto.z + 1);
      }
    }
    return Math.min(distancia, d);
  };

  // Vistas fijas: la cámara viaja hasta ellas en medio segundo.
  let animando = false;
  const ponerVista = (vista: Vista, sinViaje = false) => {
    const [az, el] = VISTAS[vista];
    // Desde donde se mire, con el punto de mira de vuelta al centro.
    const desde = new Spherical().setFromVector3(desdeObjetivo());
    const objetivo0 = controles.target.clone();
    const hasta = new Spherical(distanciaVista(vista), ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180);
    // Por el camino más corto.
    let dTheta = hasta.theta - desde.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    botonesVista.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vista === vista)));
    if (sinViaje) {
      controles.target.set(0, 0, 0);
      camara.position.setFromSpherical(hasta);
      camara.lookAt(0, 0, 0);
      controles.update();
      pedir();
      return;
    }
    const t0 = performance.now();
    animando = true;
    const paso = () => {
      const k = Math.min(1, (performance.now() - t0) / 550);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const s = new Spherical(
        desde.radius + (hasta.radius - desde.radius) * e,
        desde.phi + (hasta.phi - desde.phi) * e,
        desde.theta + dTheta * e,
      );
      controles.target.copy(objetivo0).multiplyScalar(1 - e);
      camara.position.copy(controles.target).add(new Vector3().setFromSpherical(s));
      controles.update();
      if (k < 1) requestAnimationFrame(paso);
      else animando = false;
      pedir();
    };
    requestAnimationFrame(paso);
  };

  // Los botones y las teclas acercan y giran alrededor del punto al que se
  // mira (con el zoom hacia el cursor, no siempre es el centro).
  const desdeObjetivo = () => camara.position.clone().sub(controles.target);
  const acercar = (factor: number) => {
    const v = desdeObjetivo();
    v.setLength(Math.min(controles.maxDistance, Math.max(controles.minDistance, v.length() * factor)));
    camara.position.copy(controles.target).add(v);
    controles.update();
  };

  const girar = (dAz: number, dEl: number) => {
    const s = new Spherical().setFromVector3(desdeObjetivo());
    s.theta += dAz;
    s.phi = Math.min(Math.PI - 0.01, Math.max(0.01, s.phi - dEl));
    camara.position.copy(controles.target).add(new Vector3().setFromSpherical(s));
    controles.update();
  };

  // Al alejarse (solo entonces: girar o deslizar no cambian la distancia),
  // el punto al que se mira vuelve al centro: puede apartarse más cuanto más
  // cerca está la cámara, y nada a la distancia del encuadre. Se mueven los
  // dos a la vez, así la vista no gira. Al deslizar con el botón derecho, el
  // punto de mira no se aparta más de un radio y medio del dron, para no
  // perderlo de vista.
  let distanciaPrevia = desdeObjetivo().length();
  controles.addEventListener("change", () => {
    if (camaraFija || animando) return;
    const ahora = desdeObjetivo().length();
    const alejando = ahora > distanciaPrevia + 1e-6;
    distanciaPrevia = ahora;
    const t = controles.target;
    const libre = alejando ? radio * Math.max(0, 1 - ahora / distancia) : radio * 1.5;
    if (t.length() <= libre + 1e-6) return;
    const d = t.clone().setLength(t.length() - libre);
    t.sub(d);
    camara.position.sub(d);
  });

  // Elegir una parte: se resalta la pieza, sale su ficha y su rótulo, y en
  // las fuentes se apagan las que no la respaldan.
  const fichas = [...caja.querySelectorAll<HTMLElement>("[data-ficha]")];
  const botonesLista = [...caja.querySelectorAll<HTMLElement>(".visor-lista [data-parte]")];
  const fuentes = [...caja.querySelectorAll<HTMLElement>("[data-fuente]")];
  const elegir = (i: number) => {
    elegida = elegida === i ? -1 : i;
    // Una parte de la catapulta la pone.
    if (maqueta.partes[elegida]?.catapulta && !conCatapulta) ponerCatapulta(true);
    const parte = maqueta.partes[elegida];
    pines.forEach(({ b }, j) => b.classList.toggle("visor-pin--elegido", j === elegida));
    botonesLista.forEach((b, j) => b.setAttribute("aria-pressed", String(j === elegida)));
    fichas.forEach((f, j) => { f.hidden = j !== elegida; });
    fuentes.forEach((f) => f.classList.toggle("visor-fuente--respalda", !!parte?.fuentes.includes(f.dataset.fuente!)));
    caja.classList.toggle("visor--filtrando", !!parte);
    rotulo.hidden = !parte;
    guia.style.visibility = parte ? "visible" : "hidden";
    if (parte) {
      rotulo.textContent = `${String.fromCharCode(65 + elegida)} · ${parte.nombre}`;
      tamRotulo = [rotulo.offsetWidth, rotulo.offsetHeight];
    }
    pintarPiezas();
    pedir();
  };
  guia.style.visibility = "hidden";

  // Modo «Pixel»: la misma escena, con los materiales de pixel art y sin
  // aristas, pintada a baja resolución (uas-pixelado.ts).
  let modo: "maqueta" | "pixel" = "maqueta";
  const cambiarEstilo = (estilo: "maqueta" | "pixel") => {
    modo = estilo;
    caja.querySelectorAll<HTMLElement>("[data-estilo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.estilo === estilo)));
    const hd = estilo === "maqueta" && estiloHD ? estiloHD : null;
    // Pixel HD: la escena con los materiales, la luz y las calcas del HD (C).
    const pixelHD = estilo === "pixel" && !!luzHD;
    const hdMat = hd ?? (pixelHD ? "c" : null);
    for (const m of materiales.values()) {
      m.hd?.dispose();
      m.hd = hdMat ? materialHD(m.acabado, hdMat, pixelHD ? m.marca : undefined) : undefined;
    }
    for (const malla of mallas) {
      const m = materiales.get(malla.userData.pieza)!;
      malla.material = estilo === "pixel" && !pixelHD ? m.pixel : m.hd ?? m.relleno;
    }
    for (const a of aristas) a.visible = estilo === "maqueta" && (!hd || hd === "b");
    for (const c of contornos) c.visible = hd === "b" || hd === "c" || (pixelHD && !!maqueta.contornoPixel);
    cielo.visible = sol.visible = !hdMat;
    luzHD?.encender(!!hdMat, hdMat ?? "a");
    detallesHD?.ver(!!hd || pixelHD, !pixelHD);
    // Pixel HD a 1 px por píxel de arte (ver docs/uas-hd.md, «Pasar un dron
    // al pixel HD»).
    pixelado.ponerHD(pixelHD, pixelHD ? 1 : undefined, maqueta.desfaseLuz ?? 0);
    // En HD, cámara de teleobjetivo: casi sin perspectiva, como en las fotos.
    const fov = hdMat ? 18 : 32;
    const distanciaAntes = distancia;
    camara.fov = fov;
    camara.updateProjectionMatrix();
    encuadrar();
    if (distancia !== distanciaAntes) {
      const v = desdeObjetivo().multiplyScalar(distancia / distanciaAntes);
      camara.position.copy(controles.target).add(v);
      controles.update();
    }
    caja.querySelectorAll<HTMLElement>("[data-hd]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hd === (estiloHD ?? "no"))));
    pintarPiezas();
    lienzo.classList.toggle("visor-lienzo--pixel", estilo === "pixel");
    pedir();
  };

  // Catapulta: el dron se inclina sobre ella, todo se vuelve a centrar y el
  // encuadre crece lo que crece el conjunto.
  let conCatapulta = false;
  const ponerCatapulta = (si: boolean) => {
    if (!maqueta.catapulta) return;
    conCatapulta = si;
    caja.querySelector("[data-accion=catapulta]")?.setAttribute("aria-pressed", String(si));
    // Sus chinchetas, solo con ella; si se quita con una de sus partes
    // elegida, se deja de elegir.
    pines.forEach(({ b }, j) => { if (maqueta.partes[j].catapulta) b.hidden = !si; });
    if (!si && maqueta.partes[elegida]?.catapulta) elegir(elegida);
    grupoCatapulta.visible = si;
    for (const m of mallasCatapulta) {
      const i = mallas.indexOf(m);
      if (si && i < 0) mallas.push(m);
      if (!si && i >= 0) mallas.splice(i, 1);
    }
    raiz.position.set(0, 0, 0);
    raiz.rotation.x = si ? (-maqueta.catapulta.cabeceo * Math.PI) / 180 : 0;
    raiz.updateMatrixWorld(true);
    const todo = new Box3();
    for (const m of mallas) todo.expandByObject(m);
    raiz.position.copy(todo.getCenter(new Vector3()).negate());
    raiz.updateMatrixWorld(true);
    const antes = distancia;
    // Un 15 % más de margen: la catapulta es alta y en 3D las ruedas de
    // delante quedaban cortadas abajo.
    radio = si ? (todo.getSize(new Vector3()).length() / 2) * 1.15 : radioSinCatapulta;
    encuadrar();
    const v = desdeObjetivo().multiplyScalar(distancia / antes);
    camara.position.copy(controles.target).add(v);
    controles.update();
    pedir();
  };

  // Pestañas del panel: partes y fuentes.
  const cambiarPestana = (nombre: string) => {
    caja.querySelectorAll<HTMLElement>("[role=tab]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.pestana === nombre)));
    caja.querySelectorAll<HTMLElement>("[data-hoja]").forEach((h) => { h.hidden = h.dataset.hoja !== nombre; });
  };

  // Un solo manejador para todos los botones del visor.
  const alPulsar = (e: Event) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    if (b.dataset.pestana) cambiarPestana(b.dataset.pestana);
    else if (b.dataset.parte) elegir(Number(b.dataset.parte));
    else if (b.dataset.estilo) cambiarEstilo(b.dataset.estilo as "maqueta" | "pixel");
    else if (b.dataset.hd) {
      estiloHD = b.dataset.hd === "no" ? null : (b.dataset.hd as EstiloHD);
      cambiarEstilo("maqueta");
    }
    else if (b.dataset.vista) ponerVista(b.dataset.vista as Vista);
    else if (b.dataset.accion === "acercar") acercar(0.8);
    else if (b.dataset.accion === "alejar") acercar(1.25);
    else if (b.dataset.accion === "catapulta") ponerCatapulta(!conCatapulta);
    else if (b.dataset.accion === "girar") {
      controles.autoRotate = !controles.autoRotate;
      b.setAttribute("aria-pressed", String(controles.autoRotate));
      pedir();
    }
  };
  caja.addEventListener("click", alPulsar);

  // Teclado sobre el lienzo: flechas giran, + y − acercan.
  const alTeclear = (e: KeyboardEvent) => {
    const paso = Math.PI / 18;
    const acciones: Record<string, () => void> = {
      ArrowLeft: () => girar(-paso, 0), ArrowRight: () => girar(paso, 0),
      ArrowUp: () => girar(0, paso), ArrowDown: () => girar(0, -paso),
      "+": () => acercar(0.8), "=": () => acercar(0.8), "-": () => acercar(1.25),
    };
    const accion = acciones[e.key];
    if (accion) { e.preventDefault(); accion(); }
  };
  lienzo.addEventListener("keydown", alTeclear);

  // Tamaño: el lienzo sigue a su caja.
  const ajustar = () => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    encuadrar();
    if (!camaraFija) { const v = desdeObjetivo().clampLength(controles.minDistance, controles.maxDistance); camara.position.copy(controles.target).add(v); }
    camara.updateProjectionMatrix();
    pedir();
  };
  const medidor = new ResizeObserver(ajustar);
  medidor.observe(lienzo);

  // Día/noche.
  const tema = new MutationObserver(() => {
    leerColores();
    pedir();
  });
  tema.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // El giro automático se para si el visor no se ve o la pestaña está oculta.
  let girabaAntes = false;
  const pausar = (visible: boolean) => {
    if (!visible && controles.autoRotate) { girabaAntes = true; controles.autoRotate = false; }
    else if (visible && girabaAntes) { girabaAntes = false; controles.autoRotate = true; pedir(); }
  };
  const vigia = new IntersectionObserver(([e]) => pausar(e.isIntersecting));
  vigia.observe(caja);
  const alOcultar = () => pausar(!document.hidden);
  document.addEventListener("visibilitychange", alOcultar);

  leerColores();
  // ?vista=arriba (o lado, frente…) abre en esa vista; ?parte=C, con esa
  // parte elegida; ?pestana=fuentes, en las fuentes; ?estilo=pixel, en pixel.
  const params = new URLSearchParams(location.search);
  const pedida = params.get("vista") as Vista | null;
  ajustar();
  ponerVista(pedida && pedida in VISTAS ? pedida : "3d", true);
  const parteInicial = (params.get("parte") ?? "").toUpperCase().charCodeAt(0) - 65;
  if (parteInicial >= 0 && parteInicial < maqueta.partes.length) elegir(parteInicial);
  if (params.get("pestana") === "fuentes") cambiarPestana("fuentes");
  cambiarEstilo(params.get("estilo") === "pixel" ? "pixel" : "maqueta");
  if (params.get("catapulta") === "1") ponerCatapulta(true);
  caja.classList.add("visor-listo");
  // Solo en local: las capturas de comparación con fotos (arte/capturas.mjs
  // --js) ponen la cámara donde se encajó la de la foto.
  if (import.meta.env.DEV) {
    (window as unknown as { __visor: unknown }).__visor = {
      camara, controles, pedir, escala: maqueta.escala, raiz,
      // En metros de la maqueta (la raíz está desplazada para centrarla).
      mirar(desde: [number, number, number], hacia: [number, number, number], fov: number, giro = 0) {
        const e = maqueta.escala;
        camaraFija = true;
        camara.fov = fov;
        camara.updateProjectionMatrix();
        controles.minDistance = 0.01;
        controles.maxDistance = 1000;
        // Con la catapulta, la cámara encajada con el dron inclinado (cabeceo
        // en arte/encajar-camara.mjs) ya está en los ejes del mundo: solo se
        // suma el desplazamiento de la raíz.
        const o = raiz.position;
        controles.target.set(hacia[0] / e + o.x, hacia[1] / e + o.y, hacia[2] / e + o.z);
        camara.position.set(desde[0] / e + o.x, desde[1] / e + o.y, desde[2] / e + o.z);
        controles.update();
        camara.rotateZ((giro * Math.PI) / 180);
        pedir();
      },
    };
  }

  return () => {
    cancelAnimationFrame(pedido);
    clearTimeout(miradaFinal);
    medidor.disconnect();
    tema.disconnect();
    vigia.disconnect();
    document.removeEventListener("visibilitychange", alOcultar);
    caja.removeEventListener("click", alPulsar);
    lienzo.removeEventListener("keydown", alTeclear);
    pixelado.dispose();
    controles.dispose();
    raiz.traverse((o) => {
      if (o instanceof Mesh || o instanceof LineSegments) o.geometry.dispose();
    });
    for (const m of materiales.values()) { m.relleno.dispose(); m.linea.dispose(); m.pixel.dispose(); m.hd?.dispose(); }
    luzHD?.dispose();
    tintaContorno?.dispose();
    detallesHD?.dispose();
    renderer.dispose();
    // Soltar el contexto WebGL: si no, al ir y volver entre páginas se
    // acumulan y el navegador acaba tirando alguno (el visor sale mal).
    renderer.forceContextLoss();
  };
}
