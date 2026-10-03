// Modo HD del visor (proyecto UAS HD, docs/uas-hd.md): el dron con
// materiales que responden a la luz como los de verdad (pintura mate, metal,
// cristal), luz de ambiente con reflejos suaves y un sol que hace sombras del
// propio dron (el ala sobre el cuerpo, las armas bajo el ala).
// Tres estilos:
//   a · realista: materiales físicos y sombras, sin tinta;
//   b · ilustración: tres tonos de luz y las aristas en tinta, como una lámina;
//   c · realista con filete: el a, con las aristas en tinta muy fina.
// Se usa el c; el a y el b, solo con ?hd= en la URL.
import {
  BufferGeometry, CanvasTexture, Float32BufferAttribute, LineBasicMaterial, LineSegments, Mesh, Object3D,
  Points, PointsMaterial, Raycaster, SRGBColorSpace,
  ACESFilmicToneMapping, Color, DataTexture, DirectionalLight, EquirectangularReflectionMapping,
  FloatType, Group, HemisphereLight, LinearFilter, RGBAFormat,
  AddEquation, BackSide, CustomBlending, DoubleSide, OneFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor, ZeroFactor, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, NearestFilter, NoToneMapping, PCFShadowMap,
  PMREMGenerator, RedFormat, Spherical, Vector3, type Camera, type Material, type Scene, type Texture, type WebGLRenderer,
} from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import type { Acabado, Dibujo, Maqueta } from "../data/uas/tipos";

export type EstiloHD = "a" | "b" | "c";
export const ESTILOS_HD: { id: EstiloHD; nombre: string }[] = [
  { id: "a", nombre: "Realista" },
  { id: "b", nombre: "Ilustración" },
  { id: "c", nombre: "Realista con filete" },
];

// Cómo es cada acabado: color (sRGB), cuánto metal y lo mate que es. El gris,
// sacado de la foto del «CH» 152 (entre #97a4b4 y #b6b8c3 al sol).
type Pintura = { color: string; metal: number; rugosidad: number };
const PINTURAS: Record<Acabado, Pintura> = {
  gris: { color: "#a6b0bb", metal: 0, rugosidad: 0.5 },
  "gris-et": { color: "#a3adab", metal: 0, rugosidad: 0.65 },
  // El gris de los TB2 turcos, algo más oscuro y azulado que el del MQ-9
  // (medido al sol en las fotos de Teknofest 2021 y del TC-SRM: #acb8bf).
  "gris-tr": { color: "#8d999f", metal: 0, rugosidad: 0.5 },
  negro: { color: "#2b2d31", metal: 0, rugosidad: 0.55 },
  junta: { color: "#7d838b", metal: 0, rugosidad: 0.7 },
  mando: { color: "#a0aab6", metal: 0, rugosidad: 0.5 },
  metal: { color: "#9aa0a8", metal: 0.85, rugosidad: 0.32 },
  // Cristal oscuro algo verdoso, que refleja el cielo (torreta, buscadores).
  lente: { color: "#3a5a4c", metal: 0.1, rugosidad: 0.12 },
  amarillo: { color: "#d9ad1a", metal: 0, rugosidad: 0.5 },
  azul: { color: "#1b4fb0", metal: 0, rugosidad: 0.5 },
  oliva: { color: "#5a613f", metal: 0, rugosidad: 0.6 },
  // Las luces del lomo y del ala: cúpulas pequeñas de plástico, con brillo.
  rojo: { color: "#8e2a2d", metal: 0, rugosidad: 0.35 },
  blanco: { color: "#eeeeea", metal: 0, rugosidad: 0.25 },
  // Las franjas rojas de las vigas del TB2, del rojo de la bandera turca.
  "rojo-vivo": { color: "#d81e2a", metal: 0, rugosidad: 0.5 },
  // El fondo de una boca o un hueco (la toma de aire del TB2): casi negro y
  // mate, para que no se lea como una pieza pintada de negro.
  hueco: { color: "#08090a", metal: 0, rugosidad: 1 },
};

// Tres escalones de luz para la ilustración.
let rampa: Texture | undefined;
const rampaToon = () => {
  if (!rampa) {
    const t = new DataTexture(new Uint8Array([120, 180, 235]), 3, 1, RedFormat);
    t.minFilter = t.magFilter = NearestFilter;
    t.needsUpdate = true;
    rampa = t;
  }
  return rampa;
};

// marca: para el pixel HD, el número de la pieza va en el canal alfa (como
// en materialPixel), para que la pasada final marque las juntas.
export function materialHD(acabado: Acabado, estilo: EstiloHD, marca?: number): MeshStandardMaterial | MeshToonMaterial {
  const p = PINTURAS[acabado];
  // Por las dos caras, como la maqueta 1.0: algunas piezas (las alas) tienen
  // los triángulos al revés y, pintadas solo por delante, salían del revés.
  if (estilo === "b") return new MeshToonMaterial({ color: new Color(p.color), gradientMap: rampaToon(), side: DoubleSide });
  const m = new MeshStandardMaterial({ color: new Color(p.color), metalness: p.metal, roughness: p.rugosidad, envMapIntensity: 0.45, side: DoubleSide });
  if (marca !== undefined) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.marca = { value: marca };
      sh.fragmentShader = "uniform float marca;\n" + sh.fragmentShader.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\ngl_FragColor.a = marca;",
      );
    };
    m.customProgramCacheKey = () => "pixel-hd";
  }
  return m;
}

// Las calcas y costuras se mezclan con el color de debajo pero dejan su alfa
// como está: en el pixel HD, el alfa es el número de la pieza.
const sinTocarAlfa = { blending: CustomBlending, blendEquation: AddEquation, blendSrc: SrcAlphaFactor, blendDst: OneMinusSrcAlphaFactor, blendSrcAlpha: ZeroFactor, blendDstAlpha: OneFactor } as const;

export const colorHD = (acabado: Acabado) => new Color(PINTURAS[acabado].color);

// Luz del HD: sol con sombras, cielo y suelo, y el entorno para los reflejos.
// Se enciende y se apaga entero al cambiar de modo.
export function crearLuzHD(renderer: WebGLRenderer, escena: Scene, radio: number) {
  // Entorno para los reflejos: un cielo degradado (claro y algo azul arriba,
  // horizonte blanquecino, tierra parda y oscura abajo).
  const W = 64, H = 32, datos = new Float32Array(W * H * 4);
  // Paradas del degradado, de abajo (0) arriba (1): la tierra oscura, que
  // se oscurece enseguida bajo el horizonte (la mitad baja del costado y la
  // panza quedan en sombra, como en las fotos al sol), el horizonte y el cielo.
  const PARADAS: [number, [number, number, number]][] = [
    [0, [0.012, 0.012, 0.014]], [0.44, [0.025, 0.027, 0.032]], [0.52, [0.2, 0.22, 0.26]], [1, [0.36, 0.43, 0.56]],
  ];
  for (let y = 0; y < H; y++) {
    // La fila 0 de la textura es la de abajo (v = 0 en el mapa
    // equirectangular).
    const a = (y + 0.5) / H;
    let i = 0;
    while (i < PARADAS.length - 2 && a > PARADAS[i + 1][0]) i++;
    const [a0, c0] = PARADAS[i], [a1, c1] = PARADAS[i + 1];
    const t = Math.min(1, Math.max(0, (a - a0) / (a1 - a0)));
    const [r, g, b] = c0.map((v, k) => v + (c1[k] - v) * t);
    for (let x = 0; x < W; x++) datos.set([r, g, b, 1], (y * W + x) * 4);
  }
  const cieloTex = new DataTexture(datos, W, H, RGBAFormat, FloatType);
  cieloTex.mapping = EquirectangularReflectionMapping;
  cieloTex.magFilter = cieloTex.minFilter = LinearFilter;
  cieloTex.needsUpdate = true;
  const pmrem = new PMREMGenerator(renderer);
  const entorno = pmrem.fromEquirectangular(cieloTex).texture;
  pmrem.dispose();
  cieloTex.dispose();
  const grupo = new Group();
  const cielo = new HemisphereLight(0x9cb2d2, 0x4a4e56, 0.85);
  const sol = new DirectionalLight(0xfffaf2, 3.9);
  // El sol va con la cámara, casi encima (78°) y un poco del lado de quien
  // mira (45°): la mitad de arriba del dron, al sol y sin sombras; las
  // sombras, de la mitad para abajo. Fijo en el mundo, desde muchos ángulos
  // alumbraba el lado que no se ve. Las otras posiciones probadas, en
  // docs/uas-hd.md.
  const ALTURA = (78 * Math.PI) / 180, LADO = (45 * Math.PI) / 180;
  const v = new Vector3(), esf = new Spherical();
  sol.castShadow = true;
  const s = sol.shadow;
  s.mapSize.set(2048, 2048);
  s.camera.left = s.camera.bottom = -radio * 1.1;
  s.camera.right = s.camera.top = radio * 1.1;
  s.camera.near = radio * 0.5;
  s.camera.far = radio * 7;
  s.bias = -0.0008;
  s.normalBias = radio * 0.012;
  grupo.add(cielo, sol, sol.target);
  grupo.visible = false;
  escena.add(grupo);
  return {
    encender(si: boolean, estilo: EstiloHD) {
      grupo.visible = si;
      escena.environment = si && estilo !== "b" ? entorno : null;
      renderer.toneMapping = si && estilo !== "b" ? ACESFilmicToneMapping : NoToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.shadowMap.enabled = si;
      renderer.shadowMap.type = PCFShadowMap;
      renderer.shadowMap.needsUpdate = true;
      // En la ilustración, el sol sin sombras suaves de ambiente.
      cielo.intensity = estilo === "b" ? 1.2 : 0.85;
    },
    seguir(camara: Camera) {
      esf.setFromVector3(camara.position);
      v.setFromSphericalCoords(radio * 3, Math.PI / 2 - ALTURA, esf.theta - LADO);
      if (!v.equals(sol.position)) { sol.position.copy(v); renderer.shadowMap.needsUpdate = true; }
    },
    dispose() { entorno.dispose(); },
  };
}

export type MaterialHD = Material & { color: Color };

// Contorno de silueta (estilos b y c): cada pieza se pinta otra vez, en
// tinta, por detrás e inflada a lo largo de sus normales; lo que asoma por
// fuera es la línea. El grosor va en unidades de la maqueta.
export function materialContorno(grosor: number) {
  const m = new MeshBasicMaterial({ color: 0x1d1f23, side: BackSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.grosor = { value: grosor };
    sh.vertexShader = "uniform float grosor;\n" + sh.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\ntransformed += normalize(normal) * grosor;",
    );
  };
  return m;
}


// ── Detalle pintado ────────────────────────────────────────────────────────
// Calcas (marcas, números, discos) proyectadas sobre las piezas y costuras
// (líneas de paneles con sus remaches) llevadas a la superficie. Los dibujos
// se hacen aquí, en un lienzo 2D: sin imágenes aparte.

const TINTA_CALCA = "#17181a";

function dibujar(d: Dibujo, ancho: number, alto: number): HTMLCanvasElement {
  const K = 512 / Math.max(ancho, alto);
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(ancho * K);
  lienzo.height = Math.round(alto * K);
  const W = lienzo.width, H = lienzo.height;
  const c = lienzo.getContext("2d")!;
  c.fillStyle = c.strokeStyle = TINTA_CALCA;
  const estrella = (cx: number, cy: number, r: number) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r;
      c.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
    }
    c.closePath();
  };
  switch (d.tipo) {
    case "escarapela": {
      // La de baja visibilidad sobre gris: disco negro con la estrella en el
      // color de la pintura; barras con el contorno y una raya en negro.
      const D = H * 0.96, R = D / 2, cx = W / 2, cy = H / 2, lw = D * 0.055;
      const barra = (x0: number, x1: number) => {
        c.lineWidth = lw;
        c.strokeRect(Math.min(x0, x1) + lw / 2, cy - D / 4 + lw / 2, Math.abs(x1 - x0) - lw, D / 2 - lw);
        c.fillRect(Math.min(x0, x1), cy - D / 12, Math.abs(x1 - x0), D / 6);
      };
      barra(cx + R * 0.8, Math.min(W, cx + R * 2));
      barra(Math.max(0, cx - R * 2), cx - R * 0.8);
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      estrella(cx, cy + R * 0.04, R * 0.92); c.fill();
      c.globalCompositeOperation = "source-over";
      break;
    }
    case "texto": {
      const lineas = d.texto.split("\n");
      const alto = H / lineas.length;
      c.fillStyle = d.color ?? TINTA_CALCA;
      c.font = d.fino
        ? `600 ${Math.round(alto * 0.86)}px "Helvetica Neue", Arial, sans-serif`
        : `900 ${Math.round(alto * 0.92)}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      lineas.forEach((l, i) => c.fillText(l, W / 2, alto * (i + 0.54), W * 0.98));
      break;
    }
    case "bandera-tr": {
      // Proporciones oficiales (alto A): media luna de 0,5·A a 0,5·A del
      // asta, hueco de 0,4·A corrido 0,0625·A, estrella de 0,25·A.
      const A = H;
      c.fillStyle = "#e30a17"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(A * 0.5, H / 2, A * 0.25, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#e30a17";
      c.beginPath(); c.arc(A * 0.5625, H / 2, A * 0.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#fff";
      c.save(); c.translate(A * 0.8835, H / 2); c.rotate(-Math.PI / 2);
      estrella(0, 0, A * 0.125); c.restore(); c.fill();
      break;
    }
    case "escarapela-tr": {
      const R = Math.min(W, H) / 2;
      c.fillStyle = "#e30a17"; c.beginPath(); c.arc(W / 2, H / 2, R * 0.97, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(W / 2, H / 2, R * 0.66, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#e30a17"; c.beginPath(); c.arc(W / 2, H / 2, R * 0.33, 0, Math.PI * 2); c.fill();
      break;
    }
    case "baykar": {
      // Un paralelogramo azul con la «B» blanca (una barra y dos curvas, como
      // un 3) y «BAYKAR» debajo, en azul.
      const azul = "#1d33a6", alto = H * 0.72, inc = alto * 0.32;
      c.fillStyle = azul;
      c.beginPath(); c.moveTo(inc, 0); c.lineTo(W, 0); c.lineTo(W - inc, alto); c.lineTo(0, alto); c.closePath(); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = alto * 0.11; c.lineCap = "round";
      const bx = W * 0.3, r = alto * 0.19;
      c.beginPath(); c.moveTo(bx - r * 0.6, alto * 0.14); c.lineTo(bx - r * 0.6, alto * 0.86); c.stroke();
      c.beginPath(); c.arc(bx, alto * 0.33, r, -Math.PI * 0.75, Math.PI * 0.5); c.stroke();
      c.beginPath(); c.arc(bx, alto * 0.67, r * 1.05, -Math.PI * 0.5, Math.PI * 0.8); c.stroke();
      c.fillStyle = azul;
      c.font = `700 ${Math.round(H * 0.22)}px "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "left"; c.textBaseline = "alphabetic";
      c.fillText("B A Y K A R", 0, H * 0.99, W * 0.9);
      break;
    }
    case "aviso": {
      c.fillStyle = "#f2c200"; c.fillRect(0, 0, W, H);
      const b = Math.min(W, H) * 0.16;
      c.save(); c.beginPath(); c.rect(0, 0, W, H); c.rect(b, b, W - 2 * b, H - 2 * b); c.clip("evenodd");
      c.fillStyle = "#17181a";
      for (let x = -H; x < W + H; x += b * 1.6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + b * 0.8, 0); c.lineTo(x + b * 0.8 - H, H); c.lineTo(x - H, H); c.closePath(); c.fill(); }
      c.restore();
      c.fillStyle = "#17181a";
      for (const f of [0.38, 0.62]) c.fillRect(W * 0.25, H * f - b * 0.18, W * 0.5, b * 0.36);
      break;
    }
    case "serie": {
      // «AF» sobre el año, pequeños, y el número grande al lado.
      c.textBaseline = "middle";
      c.font = `700 ${Math.round(H * 0.36)}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "center";
      c.fillText("AF", W * 0.11, H * 0.3); c.fillText(d.ano, W * 0.11, H * 0.72);
      c.font = `700 ${Math.round(H * 0.95)}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "left";
      c.fillText(d.numero, W * 0.24, H * 0.54, W * 0.76);
      break;
    }
    case "disco": {
      const r = Math.min(W, H) / 2;
      c.fillStyle = d.color;
      c.beginPath(); c.arc(W / 2, H / 2, r * 0.96, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = r * 0.12;
      c.beginPath(); c.arc(W / 2, H / 2, r * 0.9, 0, Math.PI * 2); c.stroke();
      break;
    }
    case "escudo": {
      // Escudo de unidad, en línea fina: el contorno, una figura y la cinta.
      c.lineWidth = W * 0.035;
      c.beginPath();
      c.moveTo(W * 0.18, H * 0.08); c.lineTo(W * 0.82, H * 0.08); c.lineTo(W * 0.82, H * 0.5);
      c.quadraticCurveTo(W * 0.8, H * 0.78, W * 0.5, H * 0.92); c.quadraticCurveTo(W * 0.2, H * 0.78, W * 0.18, H * 0.5);
      c.closePath(); c.stroke();
      c.beginPath(); c.ellipse(W * 0.52, H * 0.42, W * 0.16, H * 0.2, 0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(W * 0.1, H * 0.78); c.quadraticCurveTo(W * 0.5, H * 1.02, W * 0.9, H * 0.78); c.stroke();
      break;
    }
  }
  return lienzo;
}

// Solo los triángulos de la calca que miran hacia donde se proyecta: en una
// pieza fina (la cola, la aleta de debajo) la caja de la calca atraviesa y la
// pintaba también, del revés, en la cara de detrás.
function soloDeCara(g: BufferGeometry, desde: Vector3): BufferGeometry {
  const pos = g.getAttribute("position"), nor = g.getAttribute("normal"), uv = g.getAttribute("uv");
  const P: number[] = [], N: number[] = [], U: number[] = [];
  const n = new Vector3();
  for (let t = 0; t < pos.count; t += 3) {
    n.set(0, 0, 0);
    for (let k = 0; k < 3; k++) n.x += nor.getX(t + k), n.y += nor.getY(t + k), n.z += nor.getZ(t + k);
    if (n.normalize().dot(desde) < 0.25) continue;
    for (let k = 0; k < 3; k++) {
      P.push(pos.getX(t + k), pos.getY(t + k), pos.getZ(t + k));
      N.push(nor.getX(t + k), nor.getY(t + k), nor.getZ(t + k));
      U.push(uv.getX(t + k), uv.getY(t + k));
    }
  }
  const h = new BufferGeometry();
  h.setAttribute("position", new Float32BufferAttribute(P, 3));
  h.setAttribute("normal", new Float32BufferAttribute(N, 3));
  h.setAttribute("uv", new Float32BufferAttribute(U, 2));
  g.dispose();
  return h;
}

export function montarDetalles(escena: Scene, raiz: Object3D, mallas: Mesh[], detalles: NonNullable<Maqueta["detalles"]>, radio: number) {
  const grupo = new Group();
  grupo.visible = false;
  escena.add(grupo);
  raiz.updateMatrixWorld(true);
  const rayo = new Raycaster();
  const deIds = (ids: string[]) => mallas.filter((m) => ids.includes(m.userData.pieza));
  const espejar = (v: number[], si: boolean) => (si ? [-v[0], v[1], v[2]] : v);
  // El punto de la superficie más cercano a `en` visto desde `desde`.
  const aSuperficie = (objetivos: Mesh[], en: number[], desde: Vector3) => {
    const origen = raiz.localToWorld(new Vector3(en[0], en[1], en[2])).addScaledVector(desde, radio * 0.25);
    rayo.set(origen, desde.clone().negate());
    const golpe = rayo.intersectObjects(objetivos, false)[0];
    if (!golpe) return null;
    const n = golpe.face!.normal.clone().transformDirection(golpe.object.matrixWorld);
    if (n.dot(desde) < 0) n.negate();
    return { punto: golpe.point, normal: n, malla: golpe.object as Mesh };
  };
  const aDesechar: { dispose(): void }[] = [];
  // En el pixel, cada píxel de la calca va entero o no va: reducida a pocos
  // píxeles, la tinta mezclada con el transparente era un gris que se perdía
  // en los escalones de luz (no se veían ni el «CH» ni la escarapela).
  const nitidez = { value: 0 };

  for (const k of detalles.calcas) {
    for (const lado of k.espejo ? [false, true] : [false]) {
      const desde = new Vector3(...(espejar(k.desde, lado) as [number, number, number])).normalize();
      const s = aSuperficie(deIds(k.sobre), espejar(k.en, lado), desde);
      if (!s) continue;
      const ayuda = new Object3D();
      ayuda.position.copy(s.punto);
      ayuda.lookAt(s.punto.clone().add(desde));
      ayuda.rotateZ(((k.giro ?? 0) * Math.PI) / 180);
      const tam = new Vector3(k.tam[0], k.tam[1], Math.min(k.tam[0], k.tam[1]) * 0.8);
      const g = soloDeCara(new DecalGeometry(s.malla, s.punto, ayuda.rotation, tam), desde);
      const textura = new CanvasTexture(dibujar(k.dibujo, k.tam[0], k.tam[1]));
      textura.colorSpace = SRGBColorSpace;
      textura.anisotropy = 4;
      const m = new MeshStandardMaterial({
        map: textura, transparent: true, depthWrite: false, roughness: 0.55, metalness: 0,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, ...sinTocarAlfa,
      });
      m.onBeforeCompile = (sh) => {
        sh.uniforms.nitidez = nitidez;
        sh.fragmentShader = "uniform float nitidez;\n" + sh.fragmentShader.replace(
          "#include <map_fragment>",
          "#include <map_fragment>\nif (nitidez > 0.5) { diffuseColor.rgb /= max(diffuseColor.a, 0.001); diffuseColor.a = step(0.3, diffuseColor.a); }",
        );
      };
      m.customProgramCacheKey = () => "calca";
      grupo.add(new Mesh(g, m));
      aDesechar.push(g, m, textura);
    }
  }

  const lineas: number[] = [], remaches: number[] = [];
  let puntos: Points | null = null;
  for (const k of detalles.costuras) {
    for (const lado of k.espejo ? [false, true] : [false]) {
      const desde = new Vector3(...(espejar(k.desde, lado) as [number, number, number])).normalize();
      const objetivos = deIds(k.sobre);
      const pts = k.puntos.map((p) => espejar(p, lado));
      let previo: Vector3 | null = null, hastaRemache = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = new Vector3(...(pts[i] as [number, number, number])), b = new Vector3(...(pts[i + 1] as [number, number, number]));
        const largo = a.distanceTo(b), pasos = Math.max(1, Math.ceil(largo / (radio * 0.006)));
        for (let j = i === 0 ? 0 : 1; j <= pasos; j++) {
          const p = a.clone().lerp(b, j / pasos);
          const s = aSuperficie(objetivos, [p.x, p.y, p.z], desde);
          if (!s) { previo = null; continue; }
          const q = s.punto.clone().addScaledVector(s.normal, radio * 0.0012);
          if (previo) lineas.push(previo.x, previo.y, previo.z, q.x, q.y, q.z);
          if (k.enVertices) {
            if (j === 0 || j === pasos) remaches.push(q.x, q.y, q.z);
          } else if (k.remaches) {
            hastaRemache -= previo ? previo.distanceTo(q) : 0;
            if (hastaRemache <= 0) { remaches.push(q.x, q.y, q.z); hastaRemache = k.remaches; }
          }
          previo = q;
        }
      }
    }
  }
  if (lineas.length) {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(lineas, 3));
    // Finas: en las fotos, las juntas son casi solo un cambio de tono.
    const m = new LineBasicMaterial({ color: 0x4a4f56, transparent: true, opacity: 0.22, ...sinTocarAlfa });
    grupo.add(new LineSegments(g, m));
    aDesechar.push(g, m);
  }
  if (remaches.length) {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(remaches, 3));
    // Tornillos redondos y pequeños (los puntos de WebGL son cuadrados: se
    // recortan con un círculo).
    const circulo = document.createElement("canvas");
    circulo.width = circulo.height = 32;
    const c = circulo.getContext("2d")!;
    c.fillStyle = "#fff"; c.beginPath(); c.arc(16, 16, 14, 0, Math.PI * 2); c.fill();
    const mapa = new CanvasTexture(circulo);
    const m = new PointsMaterial({ color: 0x5a6068, size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.55, alphaMap: mapa, alphaTest: 0.3 });
    aDesechar.push(mapa);
    puntos = new Points(g, m);
    grupo.add(puntos);
    aDesechar.push(g, m);
  }
  return {
    // En el pixel, sin tornillos: a un píxel cada uno solo serían ruido.
    ver(si: boolean, conTornillos = true) {
      grupo.visible = si;
      if (puntos) puntos.visible = conTornillos;
      nitidez.value = conTornillos ? 0 : 1;
    },
    dispose() { for (const d of aDesechar) d.dispose(); escena.remove(grupo); },
  };
}
