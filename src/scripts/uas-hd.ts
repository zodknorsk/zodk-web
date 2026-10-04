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
  // El gris muy claro, algo azulado, de los Raven del Ejército de Tierra:
  // al sol, en la foto de El Español de 2024 desde arriba, #d9dfe6 (el
  // render, #d9dde1). La 1.0 tenía uno más oscuro y verdoso, de una foto
  // de 2009 bajo techo.
  "gris-et": { color: "#bdc1c4", metal: 0, rugosidad: 0.65 },
  // El gris de los TB2 turcos, algo más oscuro y azulado que el del MQ-9
  // (medido al sol en las fotos de Teknofest 2021 y del TC-SRM: #acb8bf).
  "gris-tr": { color: "#8d999f", metal: 0, rugosidad: 0.5 },
  // El gris claro y neutro de los renders del Wildfire (General Atomics): al
  // sol, desde arriba, #b5b2bb de media en el render; con el gris del MQ-9 el
  // visor salía azulado.
  "gris-ga": { color: "#a6a6b2", metal: 0, rugosidad: 0.5 },
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
  // La pintura crema de los Shahed-136 iraníes (fotos de Qom y Kermanshah;
  // cada una con su luz: de #c3bc9f a #dccebc en lo alto del ala). Un punto
  // menos crema que la de Qom, a petición del usuario: hueso claro al sol.
  "crema-ir": { color: "#b8ae9e", metal: 0, rugosidad: 0.55 },
  // El aluminio en bruto del motor del Shahed (cárter, cilindros y aletas),
  // más claro y menos espejo que el «metal».
  aluminio: { color: "#c3c6ca", metal: 0.55, rugosidad: 0.42 },
  // El amarillo ocre de los lanzadores iraníes (Qom, al sol: #c9a64a).
  ocre: { color: "#b8953e", metal: 0, rugosidad: 0.6 },
  // La corona dentada del arranque del motor del Shahed, dorada.
  laton: { color: "#d2ab4c", metal: 0.5, rugosidad: 0.4 },
  // El cerco blanco hueso entre el módulo de la cámara y la barquilla del
  // Raven (fotos del Ejército italiano y del Ejército de Tierra).
  hueso: { color: "#d8d3c3", metal: 0, rugosidad: 0.6 },
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
    case "bandera-ir": {
      // El cartel de los winglets del Shahed de Kermanshah: blanco, con un
      // filete gris; arriba la bandera (verde, blanca con el emblema rojo y
      // roja, con el «Allahu akbar» repetido en blanco en los bordes de las
      // franjas: aquí, una fila de trazos), y debajo «MADE IN I.R.IRAN» y
      // «ساخت ایران».
      // Con `pegatina` (la del morro del de Qom), solo la bandera, con
      // «ساخت» y «ایران» en la franja blanca a los lados del emblema.
      c.fillStyle = "#f4f3ee"; c.fillRect(0, 0, W, H);
      if (!d.pegatina) { c.strokeStyle = "#a9aaa6"; c.lineWidth = H * 0.018; c.strokeRect(c.lineWidth / 2, c.lineWidth / 2, W - c.lineWidth, H - c.lineWidth); }
      const m = d.pegatina ? 0 : W * 0.06, fw = W - 2 * m, fy = d.pegatina ? 0 : H * 0.06, fh = d.pegatina ? H : H * 0.66, f = fh / 3;
      c.fillStyle = "#239f40"; c.fillRect(m, fy, fw, f);
      c.fillStyle = "#da0000"; c.fillRect(m, fy + 2 * f, fw, f);
      c.fillStyle = "#f4f3ee";
      for (let i = 0; i < 11; i++) {
        const x = m + ((i + 0.5) / 11) * fw;
        c.fillRect(x - fw * 0.025, fy + f * 0.86, fw * 0.05, f * 0.09);
        c.fillRect(x - fw * 0.025, fy + 2 * f + f * 0.05, fw * 0.05, f * 0.09);
      }
      // El emblema: cuatro medias lunas y la espada, en rojo.
      const ex = W / 2, ey = fy + 1.5 * f, er = f * 0.36;
      c.strokeStyle = "#da0000"; c.lineWidth = er * 0.16; c.lineCap = "round";
      for (const s of [1, -1]) {
        c.beginPath(); c.arc(ex, ey, er, s > 0 ? -1.2 : Math.PI - 1.95, s > 0 ? 1.95 - Math.PI : Math.PI + 1.2, s < 0); c.stroke();
        c.beginPath(); c.arc(ex + s * er * 0.18, ey, er * 0.62, s > 0 ? -1.1 : Math.PI - 2.0, s > 0 ? 2.0 - Math.PI : Math.PI + 1.1, s < 0); c.stroke();
      }
      c.beginPath(); c.moveTo(ex, ey - er * 1.05); c.lineTo(ex, ey + er * 0.95); c.stroke();
      if (d.pegatina) {
        c.fillStyle = "#24262b"; c.textBaseline = "middle"; c.direction = "rtl";
        c.font = `700 ${Math.round(f * 0.55)}px "Geeza Pro", Tahoma, "Noto Naskh Arabic", sans-serif`;
        c.textAlign = "center";
        c.fillText("ساخت", W * 0.76, ey, W * 0.3);
        c.fillText("ایران", W * 0.24, ey, W * 0.3);
        c.direction = "ltr";
        break;
      }
      // Las dos leyendas, en una línea: en inglés a la izquierda y en persa a
      // la derecha.
      const ty = fy + fh + (H - fy - fh) * 0.5, th = (H - fy - fh) * 0.5;
      c.textBaseline = "middle";
      c.fillStyle = "#2a2c33"; c.textAlign = "left";
      c.font = `700 ${Math.round(th)}px "Helvetica Neue", Arial, sans-serif`;
      c.fillText("MADE IN I.R.IRAN", m, ty, fw * 0.48);
      c.fillStyle = "#9a1c1f"; c.textAlign = "right"; c.direction = "rtl";
      c.font = `700 ${Math.round(th * 1.25)}px "Geeza Pro", Tahoma, "Noto Naskh Arabic", sans-serif`;
      c.fillText("ساخت ایران", W - m, ty, fw * 0.45);
      c.direction = "ltr";
      break;
    }
    case "qr": {
      // Pegatina de código QR: blanca, con los tres cuadros de las esquinas
      // y el resto de módulos repartidos siempre igual.
      c.fillStyle = "#f4f3ee"; c.fillRect(0, 0, W, H);
      const n = 25, q = Math.min(W, H) / (n + 2), o = q;
      c.fillStyle = "#151619";
      let semilla = 7;
      const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const enEsquina = (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);
          if (!enEsquina && azar() < 0.5) c.fillRect(o + i * q, o + j * q, q, q);
        }
      for (const [i, j] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
        c.fillRect(o + i * q, o + j * q, 7 * q, 7 * q);
        c.fillStyle = "#f4f3ee"; c.fillRect(o + (i + 1) * q, o + (j + 1) * q, 5 * q, 5 * q);
        c.fillStyle = "#151619"; c.fillRect(o + (i + 2) * q, o + (j + 2) * q, 3 * q, 3 * q);
      }
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
    case "rect": {
      c.fillStyle = d.color; c.fillRect(0, 0, W, H);
      break;
    }
    case "flechas": {
      // Una flecha a cada lado de la junta (la vertical del centro), la de
      // arriba apuntando a la derecha y la de abajo a la izquierda, con la
      // punta tocando la junta (fotos del ala sola y del Raven español).
      c.fillStyle = d.color;
      const flecha = (x0: number, y0: number, s: number) => {
        const L = W * 0.46, h = H * 0.44, cola = h * 0.42;
        c.beginPath();
        c.moveTo(x0, y0);
        c.lineTo(x0 - s * L * 0.45, y0 - h / 2); c.lineTo(x0 - s * L * 0.45, y0 - cola / 2);
        c.lineTo(x0 - s * L, y0 - cola / 2); c.lineTo(x0 - s * L, y0 + cola / 2);
        c.lineTo(x0 - s * L * 0.45, y0 + cola / 2); c.lineTo(x0 - s * L * 0.45, y0 + h / 2);
        c.closePath(); c.fill();
      };
      flecha(W / 2, H * 0.27, 1);
      flecha(W / 2, H * 0.73, -1);
      break;
    }
    case "cinta": {
      // Cinta americana: gris plata, con la trama de tela (hilos finos a lo
      // largo y a lo ancho, algo más claros y oscuros) y los extremos
      // rasgados en zigzag, como cortada a mano.
      let semilla = 23;
      const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
      const diente = W * 0.035;
      c.beginPath();
      c.moveTo(diente, 0);
      for (let y = 0; y <= H; y += H / 9) c.lineTo(diente * azar() * 1.6, y);
      c.lineTo(W - diente, H);
      for (let y = H; y >= 0; y -= H / 9) c.lineTo(W - diente * azar() * 1.6, y);
      c.closePath();
      c.save(); c.clip();
      const g = c.createLinearGradient(0, 0, W * 0.4, H);
      g.addColorStop(0, "#c3c7cb"); g.addColorStop(0.5, "#aeb2b7"); g.addColorStop(1, "#bcc0c4");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const paso = Math.max(W, H) / 70;
      for (let x = 0; x < W; x += paso) { c.fillStyle = azar() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(40,44,50,0.06)"; c.fillRect(x, 0, paso * 0.45, H); }
      for (let y = 0; y < H; y += paso * 1.4) { c.fillStyle = "rgba(40,44,50,0.05)"; c.fillRect(0, y, W, paso * 0.4); }
      c.restore();
      c.strokeStyle = "rgba(60,64,70,0.35)"; c.lineWidth = Math.max(W, H) * 0.012; c.stroke();
      break;
    }
    case "flecha": {
      // Una sola flecha, con la punta en el borde derecho del dibujo.
      c.fillStyle = d.color;
      c.beginPath();
      c.moveTo(W, H / 2); c.lineTo(W * 0.5, 0); c.lineTo(W * 0.5, H * 0.3); c.lineTo(0, H * 0.3);
      c.lineTo(0, H * 0.7); c.lineTo(W * 0.5, H * 0.7); c.lineTo(W * 0.5, H); c.closePath(); c.fill();
      break;
    }
    case "ddl": {
      // Disco blanco con el aro y «DDL» en su color, y una línea fina debajo.
      const r = Math.min(W, H) / 2, cx = W / 2, cy = H / 2, tinta = d.color ?? "#3b3d42";
      c.fillStyle = "#f2f1ec"; c.beginPath(); c.arc(cx, cy, r * 0.97, 0, Math.PI * 2); c.fill();
      c.strokeStyle = tinta; c.lineWidth = r * 0.1; c.beginPath(); c.arc(cx, cy, r * 0.86, 0, Math.PI * 2); c.stroke();
      c.fillStyle = tinta; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `700 ${Math.round(r * 0.62)}px "Helvetica Neue", Arial, sans-serif`;
      c.fillText("DDL", cx, cy - r * 0.08, r * 1.4);
      c.fillRect(cx - r * 0.42, cy + r * 0.38, r * 0.84, r * 0.07);
      break;
    }
    case "etiqueta": {
      // Etiqueta blanca: código de barras a la izquierda y renglones de texto
      // (o un título en negrita arriba y los renglones debajo).
      c.fillStyle = "#f3f2ed"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#26282c";
      const m = Math.min(W, H) * 0.1;
      let y0 = m;
      if (d.titulo) {
        c.textAlign = "center"; c.textBaseline = "top";
        c.font = `800 ${Math.round(H * 0.2)}px "Helvetica Neue", Arial, sans-serif`;
        c.fillText(d.titulo, W / 2, m * 0.8, W - 2 * m);
        y0 = m + H * 0.26;
      } else {
        let semilla = 11;
        const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
        for (let x = m; x < W * 0.42; ) { const g = W * (0.006 + 0.012 * azar()); c.fillRect(x, m, g, H - 2 * m); x += g + W * (0.008 + 0.01 * azar()); }
      }
      const x0 = d.titulo ? m : W * 0.48;
      for (let y = y0; y < H - m; y += H * 0.13) c.fillRect(x0, y, (W - m - x0) * (0.55 + 0.45 * ((y * 7) % 1)), H * 0.05);
      break;
    }
    case "desgaste": {
      // Rayas finas a lo largo (el eje largo del dibujo) y manchas suaves,
      // claras y oscuras, más en el centro, donde apoya.
      let semilla = 41;
      const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
      const largo = H >= W;
      for (let i = 0; i < 90; i++) {
        const u = (0.5 + (azar() - 0.5) * (0.35 + 0.65 * azar())) * (largo ? W : H);
        const v0 = azar() * (largo ? H : W), l = (0.05 + azar() * 0.3) * (largo ? H : W);
        c.strokeStyle = azar() < 0.65 ? `rgba(245,244,238,${0.12 + azar() * 0.12})` : `rgba(70,70,66,${0.08 + azar() * 0.1})`;
        c.lineWidth = Math.max(W, H) * (0.002 + azar() * 0.004);
        c.beginPath();
        if (largo) { c.moveTo(u, v0); c.lineTo(u + (azar() - 0.5) * W * 0.05, v0 + l); }
        else { c.moveTo(v0, u); c.lineTo(v0 + l, u + (azar() - 0.5) * H * 0.05); }
        c.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const x = W * (0.25 + azar() * 0.5), y = H * (0.1 + azar() * 0.8), r = Math.min(W, H) * (0.08 + azar() * 0.18);
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, azar() < 0.5 ? "rgba(120,116,104,0.14)" : "rgba(240,238,230,0.16)"); g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      break;
    }
    case "marco": {
      // La ranura de una tapa: una línea oscura a todo el borde.
      const g = Math.min(W, H) * 0.035;
      c.strokeStyle = "rgba(30,32,36,0.8)"; c.lineWidth = g;
      c.strokeRect(g / 2, g / 2, W - g, H - g);
      break;
    }
    case "rejilla": {
      // Placa gris oscura con nervios a lo largo (la del costado del Raven).
      c.fillStyle = "#a4aab0"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#5d6268";
      for (let i = 0; i < 9; i++) c.fillRect(W * 0.12, H * (0.1 + i * 0.09), W * 0.76, H * 0.045);
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
      // La cinta americana brilla como el aluminio; el resto, mate.
      const metal = k.dibujo.tipo === "cinta";
      const m = new MeshStandardMaterial({
        map: textura, transparent: true, depthWrite: false, roughness: metal ? 0.38 : 0.55, metalness: metal ? 0.55 : 0,
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
  // Colgadas de la raíz, conservando su sitio: así giran con el dron cuando se
  // inclina sobre su catapulta.
  raiz.attach(grupo);
  return {
    // En el pixel, sin tornillos: a un píxel cada uno solo serían ruido.
    ver(si: boolean, conTornillos = true) {
      grupo.visible = si;
      if (puntos) puntos.visible = conTornillos;
      nitidez.value = conTornillos ? 0 : 1;
    },
    dispose() { for (const d of aDesechar) d.dispose(); grupo.removeFromParent(); },
  };
}
