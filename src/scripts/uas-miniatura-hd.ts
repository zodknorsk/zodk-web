// Miniaturas en pixel HD (docs/uas-hd.md) de los drones con HD: la imagen de
// las tarjetas de /uas y la planta de la tira de la portada, pintadas con el
// mismo motor que el modo Pixel del visor (materiales, luz y calcas del HD y
// la pasada de uas-pixelado.ts). El 2.0 sustituye al 1.0 en todas partes.
// Lo usa arte/generar-uas-miniaturas-hd.mjs desde un Chrome sin ventana con
// `npm run dev` en marcha; la web no lo carga.
import { Box3, Group, Mesh, PerspectiveCamera, Scene, Spherical, Vector3, WebGLRenderer } from "three";
import type { Maqueta } from "../data/uas/tipos";
import { geometriaDe } from "./uas-geometria";
import { crearLuzHD, materialHD, montarDetalles } from "./uas-hd";
import { crearPixelado, marcaPieza } from "./uas-pixelado";
import { PALETAS } from "./uas-paletas";

// Planta: teleobjetivo cerrado, casi sin perspectiva, como la cámara
// ortográfica de las 1.0 (la pasada de líneas necesita una en perspectiva).
// Tarjeta: 10°. En el visor (18°) el dron no llena el lienzo; la tarjeta lo
// llena, y con 18° la parte cercana salía más exagerada que en el visor. Con
// 10° se ve como un recorte del visor.
const FOV_PLANTA = 8, FOV_TARJETA = 10;

// Si una pieza se queda fuera: su id es uno de `quitar` o empieza por uno
// de ellos y un guion («lanzador» quita también «lanzador-rail-0»).
const fuera = (id: string, quitar: string[]) => quitar.some((q) => id === q || id.startsWith(q + "-"));

// La escena del dron en HD, lista para pintar en pixel a ancho x alto.
// `quitar`: piezas que no se montan (las armas o el tren, en la portada).
function montar(maqueta: Maqueta, W: number, H: number, FOV: number, quitar: string[] = []) {
  const lienzo = document.createElement("canvas");
  const renderer = new WebGLRenderer({ canvas: lienzo, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  const escena = new Scene();
  const raiz = new Group();
  const mallas: Mesh[] = [];
  for (const [i, p] of maqueta.piezas.entries())
    for (const g of fuera(p.id, quitar) ? [] : geometriaDe(p)) {
      const malla = new Mesh(g, materialHD(p.acabado ?? "negro", "c", marcaPieza(i, p.acabado === "junta")));
      malla.castShadow = malla.receiveShadow = true;
      malla.userData.pieza = p.id;
      mallas.push(malla);
      raiz.add(malla);
    }
  const caja = new Box3().setFromObject(raiz);
  const radio = caja.getSize(new Vector3()).length() / 2;
  raiz.position.sub(caja.getCenter(new Vector3()));
  escena.add(raiz);
  raiz.updateMatrixWorld(true);
  const luz = crearLuzHD(renderer, escena, radio);
  luz.encender(true, "c");
  const sinQuitadas = <T extends { sobre: string[] }>(l: T[]) => l.filter((d) => !d.sobre.some((id) => fuera(id, quitar)));
  const detalles = maqueta.detalles
    ? montarDetalles(escena, raiz, mallas, { calcas: sinQuitadas(maqueta.detalles.calcas), costuras: sinQuitadas(maqueta.detalles.costuras) }, radio)
    : null;
  detalles?.ver(true, false);
  const pixelado = crearPixelado(renderer);
  pixelado.ponerHD(true, 1, maqueta.desfaseLuz ?? 0);
  const camara = new PerspectiveCamera(FOV, W / H, 0.05, 50);
  const v = new Vector3();
  const direccion = ([az, el]: [number, number]) =>
    new Vector3().setFromSpherical(new Spherical(1, ((90 - el) * Math.PI) / 180, (az * Math.PI) / 180));
  // Desplazamiento de la imagen (píxeles) para centrar el dron tal como se ve.
  let desplazar: [number, number] | null = null;
  // Giro de la cámara sobre su eje (radianes): gira la imagen.
  let giro = 0;
  const colocar = (vista: [number, number], escala: number) => {
    const d = H / 2 / (escala * Math.tan((FOV * Math.PI) / 360));
    camara.position.copy(direccion(vista)).multiplyScalar(d);
    camara.near = Math.max(0.01, d - radio * 2);
    camara.far = d + radio * 2;
    camara.updateProjectionMatrix();
    camara.lookAt(0, 0, 0);
    camara.rotateZ(giro);
    if (desplazar) camara.setViewOffset(W, H, desplazar[0], desplazar[1], W, H);
    else camara.clearViewOffset();
    camara.updateMatrixWorld();
  };
  // Lo que ocupa el dron en la imagen, en píxeles desde el centro (y hacia arriba).
  const borde = () => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const m of mallas) {
      const pos = m.geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).project(camara);
        x0 = Math.min(x0, (v.x * W) / 2); x1 = Math.max(x1, (v.x * W) / 2);
        y0 = Math.min(y0, (v.y * H) / 2); y1 = Math.max(y1, (v.y * H) / 2);
      }
    }
    return { x0, x1, y0, y1 };
  };
  // Dónde cae un punto de la maqueta en la imagen, en píxeles desde arriba
  // a la izquierda.
  const enImagen = (p: Vector3) => {
    v.copy(p).applyMatrix4(raiz.matrixWorld).project(camara);
    return [((v.x + 1) * W) / 2, ((1 - v.y) * H) / 2] as [number, number];
  };
  return {
    enImagen,
    mallas,
    // Gira la cámara sobre su eje para que el morro (+z) apunte en la imagen
    // hacia `angulo` (grados; 180, a la izquierda; positivo, hacia arriba).
    morroHacia(vista: [number, number], angulo: number) {
      giro = 0;
      desplazar = null;
      colocar(vista, 1);
      const [x0, y0] = enImagen(new Vector3(0, 0, -1));
      const [x1, y1] = enImagen(new Vector3(0, 0, 1));
      giro = Math.atan2(-(y1 - y0), x1 - x0) - (angulo * Math.PI) / 180;
    },
    // Medio ancho y medio alto del dron visto desde ahí, en unidades.
    ocupa(vista: [number, number]) {
      camara.position.copy(direccion(vista)).multiplyScalar(radio * 50);
      camara.lookAt(0, 0, 0);
      camara.rotateZ(giro);
      camara.updateMatrixWorld();
      let mx = 0, my = 0;
      for (const m of mallas) {
        const pos = m.geometry.getAttribute("position");
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).applyMatrix4(camara.matrixWorldInverse);
          mx = Math.max(mx, Math.abs(v.x));
          my = Math.max(my, Math.abs(v.y));
        }
      }
      return [mx, my];
    },
    // Escala que llena el recuadro dejando un margen, y el dron centrado tal
    // como se ve, con la perspectiva de verdad (lo que viene hacia la cámara
    // sale más grande: con la cuenta sin perspectiva, la punta del ala se
    // salía de la tarjeta y el dron quedaba descentrado).
    llenar(vista: [number, number], margen: number) {
      const [mx, my] = this.ocupa(vista);
      let escala = Math.min((W / 2 - margen) / mx, (H / 2 - margen) / my);
      desplazar = null;
      for (let paso = 0; paso < 4; paso++) {
        colocar(vista, escala);
        const b = borde();
        escala *= Math.min((W - 2 * margen) / (b.x1 - b.x0), (H - 2 * margen) / (b.y1 - b.y0));
      }
      colocar(vista, escala);
      const b = borde();
      desplazar = [Math.round((b.x0 + b.x1) / 2), -Math.round((b.y0 + b.y1) / 2)];
      return escala;
    },
    // Pinta desde esa vista a esa escala (píxeles por unidad), de día y de noche.
    pintar(vista: [number, number], escala: number) {
      colocar(vista, escala);
      luz.seguir(camara);
      // Como en las miniaturas 1.0: el salto que marca línea, como poco el
      // de tres píxeles.
      pixelado.ponerSalto(Math.max(0.07, 3 / escala));
      const fotograma = { dia: "", noche: "" };
      for (const momento of ["dia", "noche"] as const) {
        pixelado.ponerContorno(PALETAS[momento][maqueta.resalte === "tinta" ? "contornoClaro" : "contorno"]);
        pixelado.pintar(escena, camara);
        fotograma[momento] = lienzo.toDataURL("image/png");
      }
      return fotograma;
    },
    soltar() {
      pixelado.dispose();
      detalles?.dispose();
      luz.dispose();
      for (const m of mallas) { m.geometry.dispose(); (m.material as { dispose(): void }).dispose(); }
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

// La imagen de la tarjeta de /uas: el dron desde la vista 3D del visor, con
// su cámara y a 1 px por píxel como el modo Pixel, llenando el recuadro.
// De día y de noche (data URL).
export function tarjetaHD(maqueta: Maqueta, vista: [number, number], W: number, H: number) {
  const m = montar(maqueta, W, H, FOV_TARJETA);
  const salida = m.pintar(vista, m.llenar(vista, 4));
  m.soltar();
  return salida;
}

// La planta de la tira de la portada: desde arriba, con el morro arriba, a la
// escala de todos los drones (pxPorMetro con la «escala» de la maqueta) o
// reducida hasta caber en maxAncho x maxAlto. Sin la sombra, que la pone el
// generador. Solo el de día (la portada es siempre oscura y va así).
export function plantaHD(maqueta: Maqueta, vista: [number, number], pxPorMetro: number, maxAncho: number, maxAlto: number) {
  const medir = montar(maqueta, 8, 8, FOV_PLANTA);
  const [mx, my] = medir.ocupa(vista);
  medir.soltar();
  const escala = Math.min(pxPorMetro * maqueta.escala, (maxAncho - 4) / (2 * mx), (maxAlto - 4) / (2 * my));
  const ancho = Math.ceil(2 * mx * escala) + 4, alto = Math.ceil(2 * my * escala) + 4;
  const m = montar(maqueta, ancho, alto, FOV_PLANTA);
  const { dia } = m.pintar(vista, escala);
  m.soltar();
  return { png: dia, ancho, alto };
}

// La nave del hero de la portada (src/data/aeronaves.ts): el dron en vuelo
// desde la vista `vista`, con el morro hacia `morro` (grados; 180, a la
// izquierda, como las demás naves) y llenando un cuadrado de `lado` px a
// 1 px por píxel. Sin la sombra ni el recorte, que los pone
// arte/generar-naves-uas-hd.mjs. Devuelve también dónde caen las puntas de
// las alas (las luces de posición), en píxeles: `der` la derecha (+x).
export function naveHD(maqueta: Maqueta, vista: [number, number], morro: number, lado: number, quitar: string[] = []) {
  const m = montar(maqueta, lado, lado, FOV_TARJETA, quitar);
  m.morroHacia(vista, morro);
  const { dia } = m.pintar(vista, m.llenar(vista, 2));
  // Las puntas: los vértices del ala más a cada lado.
  const ala = m.mallas.filter((x) => x.userData.pieza === "ala");
  const p = new Vector3();
  let der: Vector3 | null = null, izq: Vector3 | null = null;
  for (const malla of ala) {
    const pos = malla.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(malla.matrix);
      if (!der || p.x > der.x) der = p.clone();
      if (!izq || p.x < izq.x) izq = p.clone();
    }
  }
  const luces = der && izq ? { der: m.enImagen(der), izq: m.enImagen(izq) } : null;
  m.soltar();
  return { png: dia, luces };
}
