// Visor de maquetas de drones: se gira arrastrando, se acerca con la rueda o
// pellizcando y enseña las partes con chinchetas. Estilo boceto: relleno liso
// con las aristas en tinta. Solo pinta cuando algo cambia (arrastrar, zoom,
// cambio de vista); el giro automático es lo único que pinta seguido, y se
// para si la página no se ve.
import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, EdgesGeometry,
  ExtrudeGeometry, Group, HemisphereLight, LatheGeometry, LineBasicMaterial,
  LineSegments, Mesh, MeshLambertMaterial, PerspectiveCamera, Quaternion,
  Raycaster, Scene, Shape, SphereGeometry, Spherical, Vector2, Vector3,
  WebGLRenderer, DirectionalLight, Box3, MeshBasicMaterial, OrthographicCamera,
  Float32BufferAttribute,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Maqueta, Pieza } from "../data/uas/tipos";

export type Vista = "3d" | "arriba" | "lado" | "frente" | "detras";

// Ángulos de cada vista: [acimut, elevación] en grados. Acimut 0 = de frente
// (desde el morro), 90 = desde el ala derecha.
const VISTAS: Record<Vista, [number, number]> = {
  "3d": [38, 32],
  arriba: [180, 89.9],  // desde detrás, para que el morro quede arriba
  lado: [90, 0],
  frente: [0, 0],
  detras: [180, 8],
};

type Colores = { tinta: Color; relleno: Color; acento: Color };

// Medio grosor de un perfil NACA de 4 cifras simétrico, en tanto por uno del
// grosor máximo (0 en el borde de ataque, 0,5 hacia un tercio de la cuerda,
// casi 0 en el de salida).
const perfilNaca = (s: number) =>
  5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);

// Ala con perfil: cada estación es un contorno de perfil (extradós abombado,
// intradós más plano); las estaciones se unen a lo largo de la envergadura y
// las puntas se cierran.
function geometriaAla(y: number, mitad: [number, number, number, number][]): BufferGeometry {
  const N = 14;  // puntos por cara, más juntos cerca del borde de ataque
  const cuerda = Array.from({ length: N + 1 }, (_, i) => (1 - Math.cos((i / N) * Math.PI)) / 2);
  // El contorno va del borde de salida por arriba hasta el de ataque y vuelve
  // por abajo, sin repetir los extremos.
  const contorno: [number, number][] = [
    ...cuerda.slice().reverse().map((s): [number, number] => [s, 1]),
    ...cuerda.slice(1, -1).map((s): [number, number] => [s, -0.55]),
  ];
  const M = contorno.length;
  const estaciones = [
    ...mitad.slice().reverse().map(([x, a, b, t]) => [-x, a, b, t] as const),
    ...mitad.filter(([x]) => x > 0),
  ];
  const pos: number[] = [];
  for (const [x, zBA, zBS, t] of estaciones)
    for (const [s, lado] of contorno) pos.push(x, y + lado * t * perfilNaca(s), zBA + (zBS - zBA) * s);
  const idx: number[] = [];
  for (let e = 0; e < estaciones.length - 1; e++)
    for (let k = 0; k < M; k++) {
      const a = e * M + k, b = e * M + ((k + 1) % M), c = a + M, d = b + M;
      idx.push(a, b, c, b, d, c);
    }
  // Tapas de las puntas: abanico desde el centro de cada contorno.
  for (const e of [0, estaciones.length - 1]) {
    const [x, zBA, zBS] = estaciones[e];
    const centro = pos.length / 3;
    pos.push(x, y, (zBA + zBS) / 2);
    for (let k = 0; k < M; k++) idx.push(centro, e * M + k, e * M + ((k + 1) % M));
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function geometriaDe(p: Pieza): BufferGeometry[] {
  switch (p.tipo) {
    case "ala":
      return [geometriaAla(p.y, p.estaciones)];
    case "tubo": {
      // El torno gira alrededor de y; luego se tumba para que el eje sea z.
      const puntos = p.perfil.map(([z, r]) => new Vector2(r, z)).reverse();
      const g = new LatheGeometry(puntos, 28);
      g.rotateX(Math.PI / 2);
      g.translate(p.centro?.[0] ?? 0, p.centro?.[1] ?? 0, 0);
      return [g];
    }
    case "placa": {
      const lados = p.espejo ? [1, -1] : [1];
      return lados.map((s) => {
        const forma = new Shape(p.planta.map(([a, b]) => new Vector2(p.plano === "horizontal" ? a * s : a, b)));
        const g = new ExtrudeGeometry(forma, { depth: p.grosor, bevelEnabled: false });
        if (p.plano === "horizontal") {
          // Planta en [x, z]; el grosor queda hacia abajo desde y.
          g.rotateX(Math.PI / 2);
          g.translate(0, p.y + p.grosor / 2, 0);
        } else {
          // Contorno en [z, y]; el grosor, a lo largo de x.
          g.rotateY(-Math.PI / 2);
          g.translate(s * p.x + p.grosor / 2, 0, 0);
        }
        return g;
      });
    }
    case "varilla": {
      const a = new Vector3(...p.desde);
      const b = new Vector3(...p.hasta);
      const dir = b.clone().sub(a);
      const g = new CylinderGeometry(p.radio, p.radio, dir.length(), 12);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize()));
      g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      return [g];
    }
    case "helice": {
      const piezas: BufferGeometry[] = [];
      for (let i = 0; i < p.palas; i++) {
        const pala = new BoxGeometry(p.radio, 0.045, 0.008);
        pala.translate(p.radio / 2, 0, 0);
        pala.rotateX(0.35);  // paso de la pala
        pala.rotateZ((i / p.palas) * Math.PI * 2);
        pala.translate(...p.en);
        piezas.push(pala);
      }
      const buje = new SphereGeometry(0.035, 12, 8);
      buje.translate(...p.en);
      piezas.push(buje);
      return piezas;
    }
  }
}

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

  const escena = new Scene();
  escena.add(new HemisphereLight(0xffffff, 0x9a9aa2, 2.2));
  const sol = new DirectionalLight(0xffffff, 1.1);
  sol.position.set(2, 4, 3);
  escena.add(sol);

  const camara = new PerspectiveCamera(32, 1, 0.05, 50);
  const controles = new OrbitControls(camara, lienzo);
  controles.enablePan = false;
  controles.autoRotateSpeed = 1.2;

  // Piezas: relleno + aristas. Cada pieza guarda sus materiales para
  // resaltarla.
  const raiz = new Group();
  const materiales = new Map<string, { relleno: MeshLambertMaterial; linea: LineBasicMaterial }>();
  const mallas: Mesh[] = [];
  for (const p of maqueta.piezas) {
    const relleno = new MeshLambertMaterial({ side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const linea = new LineBasicMaterial();
    materiales.set(p.id, { relleno, linea });
    for (const g of geometriaDe(p)) {
      const malla = new Mesh(g, relleno);
      mallas.push(malla);
      raiz.add(malla, new LineSegments(new EdgesGeometry(g, 28), linea));
    }
  }
  // Centrar la maqueta en el origen, que es donde mira la cámara.
  const caja3 = new Box3().setFromObject(raiz);
  const centro = caja3.getCenter(new Vector3());
  const radio = caja3.getSize(new Vector3()).length() / 2;
  raiz.position.sub(centro);
  escena.add(raiz);

  // La tira de siluetas.
  const botonesVista = [...caja.querySelectorAll<HTMLElement>("[data-vista]")];
  const siluetas = pintarSiluetas(raiz, radio, botonesVista.map((b) => b.dataset.vista as Vista));
  for (const b of botonesVista) {
    const url = siluetas.get(b.dataset.vista as Vista);
    const s = b.querySelector<HTMLElement>(".visor-silueta");
    if (url && s) { s.style.maskImage = `url(${url})`; s.style.webkitMaskImage = `url(${url})`; }
  }

  // Distancia a la que la maqueta entera cabe en el lienzo, mire desde donde
  // mire; el zoom va de la mitad a más del doble.
  let distancia = 4;
  const encuadrar = () => {
    const vertical = (camara.fov * Math.PI) / 360;
    const horizontal = Math.atan(Math.tan(vertical) * camara.aspect);
    distancia = (radio * 0.78) / Math.sin(Math.min(vertical, horizontal));
    controles.minDistance = distancia * 0.45;
    controles.maxDistance = distancia * 2.2;
  };

  // Colores del tema (variables CSS del visor): se releen al cambiar día/noche.
  let colores: Colores;
  const leerColores = () => {
    const css = getComputedStyle(caja);
    const c = (n: string) => new Color(css.getPropertyValue(n).trim() || "#888");
    colores = { tinta: c("--visor-tinta"), relleno: c("--visor-relleno"), acento: c("--visor-acento") };
    pintarPiezas();
  };

  let elegida = -1;
  const pintarPiezas = () => {
    const resaltadas = new Set(elegida >= 0 ? maqueta.partes[elegida].piezas : []);
    for (const [id, m] of materiales) {
      const si = resaltadas.has(id);
      m.relleno.color.copy(si ? colores.acento : colores.relleno);
      m.linea.color.copy(si ? colores.acento.clone().multiplyScalar(0.6) : colores.tinta);
    }
  };

  // Chinchetas (las pone el marco, una por parte): se colocan en la
  // proyección de su punto.
  const pines = [...caja.querySelectorAll<HTMLElement>(".visor-pin")].map((b) => ({
    b, en: new Vector3(...maqueta.partes[Number(b.dataset.parte)].en).sub(centro),
  }));

  const rayo = new Raycaster();
  const v = new Vector3();
  const colocarPines = () => {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    pines.forEach(({ b, en }, i) => {
      v.copy(en).project(camara);
      const x = ((v.x + 1) / 2) * ancho;
      const y = ((1 - v.y) / 2) * alto;
      b.style.transform = `translate(${x}px, ${y}px)`;
      // Tapada si algo de la maqueta queda entre la cámara y el punto.
      const hasta = camara.position.distanceTo(en);
      rayo.set(camara.position, en.clone().sub(camara.position).normalize());
      const choque = rayo.intersectObjects(mallas, false)[0];
      b.classList.toggle("visor-pin--tapado", !!choque && choque.distance < hasta - 0.04);
      if (i === elegida) colocarRotulo(x, y, ancho, alto);
    });
  };

  // Rótulo de la parte elegida: sale hacia fuera de la maqueta (desde el
  // centro del lienzo hacia la chincheta), unido a ella por una línea.
  const colocarRotulo = (x: number, y: number, ancho: number, alto: number) => {
    let dx = x - ancho / 2;
    let dy = y - alto / 2;
    const largo = Math.hypot(dx, dy) || 1;
    dx /= largo; dy /= largo;
    const w = rotulo.offsetWidth;
    const h = rotulo.offsetHeight;
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
  const pintar = (t: number) => {
    pedido = 0;
    const dt = ultimo ? (t - ultimo) / 1000 : 1 / 60;
    ultimo = t;
    if (controles.autoRotate) controles.update(dt);
    renderer.render(escena, camara);
    colocarPines();
    if (controles.autoRotate || animando) pedir();
    else ultimo = 0;
  };
  const pedir = () => { if (!pedido) pedido = requestAnimationFrame(pintar); };
  controles.addEventListener("change", pedir);

  // Vistas fijas: la cámara viaja hasta ellas en medio segundo.
  let animando = false;
  const ponerVista = (vista: Vista, sinViaje = false) => {
    const [az, el] = VISTAS[vista];
    const desde = new Spherical().setFromVector3(camara.position);
    const hasta = new Spherical(distancia, ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180);
    // Por el camino más corto.
    let dTheta = hasta.theta - desde.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    botonesVista.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vista === vista)));
    if (sinViaje) {
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
      camara.position.setFromSpherical(s);
      controles.update();
      if (k < 1) requestAnimationFrame(paso);
      else animando = false;
      pedir();
    };
    requestAnimationFrame(paso);
  };

  const acercar = (factor: number) => {
    const d = Math.min(controles.maxDistance, Math.max(controles.minDistance, camara.position.length() * factor));
    camara.position.setLength(d);
    controles.update();
  };

  const girar = (dAz: number, dEl: number) => {
    const s = new Spherical().setFromVector3(camara.position);
    s.theta += dAz;
    s.phi = Math.min(Math.PI - 0.01, Math.max(0.01, s.phi - dEl));
    camara.position.setFromSpherical(s);
    controles.update();
  };

  // Elegir una parte: se resalta la pieza, sale su ficha y su rótulo, y en
  // las fuentes se apagan las que no la respaldan.
  const fichas = [...caja.querySelectorAll<HTMLElement>("[data-ficha]")];
  const botonesLista = [...caja.querySelectorAll<HTMLElement>(".visor-lista [data-parte]")];
  const fuentes = [...caja.querySelectorAll<HTMLElement>("[data-fuente]")];
  const elegir = (i: number) => {
    elegida = elegida === i ? -1 : i;
    const parte = maqueta.partes[elegida];
    pines.forEach(({ b }, j) => b.classList.toggle("visor-pin--elegido", j === elegida));
    botonesLista.forEach((b, j) => b.setAttribute("aria-pressed", String(j === elegida)));
    fichas.forEach((f, j) => { f.hidden = j !== elegida; });
    fuentes.forEach((f) => f.classList.toggle("visor-fuente--respalda", !!parte?.fuentes.includes(f.dataset.fuente!)));
    caja.classList.toggle("visor--filtrando", !!parte);
    rotulo.hidden = !parte;
    guia.style.visibility = parte ? "visible" : "hidden";
    if (parte) rotulo.textContent = `${String.fromCharCode(65 + elegida)} · ${parte.nombre}`;
    pintarPiezas();
    pedir();
  };
  guia.style.visibility = "hidden";

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
    else if (b.dataset.vista) ponerVista(b.dataset.vista as Vista);
    else if (b.dataset.accion === "acercar") acercar(0.8);
    else if (b.dataset.accion === "alejar") acercar(1.25);
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
    camara.position.clampLength(controles.minDistance, controles.maxDistance);
    camara.updateProjectionMatrix();
    pedir();
  };
  const medidor = new ResizeObserver(ajustar);
  medidor.observe(lienzo);

  // Día/noche.
  const tema = new MutationObserver(() => { leerColores(); pedir(); });
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
  // parte elegida; ?pestana=fuentes, en las fuentes.
  const params = new URLSearchParams(location.search);
  const pedida = params.get("vista") as Vista | null;
  ajustar();
  ponerVista(pedida && pedida in VISTAS ? pedida : "3d", true);
  const parteInicial = (params.get("parte") ?? "").toUpperCase().charCodeAt(0) - 65;
  if (parteInicial >= 0 && parteInicial < maqueta.partes.length) elegir(parteInicial);
  if (params.get("pestana") === "fuentes") cambiarPestana("fuentes");
  caja.classList.add("visor-listo");

  return () => {
    cancelAnimationFrame(pedido);
    medidor.disconnect();
    tema.disconnect();
    vigia.disconnect();
    document.removeEventListener("visibilitychange", alOcultar);
    caja.removeEventListener("click", alPulsar);
    lienzo.removeEventListener("keydown", alTeclear);
    controles.dispose();
    raiz.traverse((o) => {
      if (o instanceof Mesh || o instanceof LineSegments) o.geometry.dispose();
    });
    for (const m of materiales.values()) { m.relleno.dispose(); m.linea.dispose(); }
    renderer.dispose();
  };
}
