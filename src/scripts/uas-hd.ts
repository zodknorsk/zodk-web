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
import type { Acabado, Dibujo, Letra, Maqueta } from "../data/uas/tipos";
import { LOGOS } from "../data/uas/logos";

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
  // El gris claro y algo frío del Skydio X10D: la cara de arriba, en las
  // fotos del usuario, #dbe4e7 de media (el render, #d9dfe3); y el azul de
  // las puntas de sus hélices (#1a57a6 en la foto, a la sombra).
  "gris-x10": { color: "#b8cad2", metal: 0, rugosidad: 0.55 },
  "azul-x10": { color: "#2470cc", metal: 0, rugosidad: 0.45 },
  // El gris claro y neutro del Vector AI de Quantum Systems: al sol, encima
  // del ala, #c4c7c6 en la foto de Militarnyi en el suelo (el render, desde
  // la misma cámara, #cbccce); con el cielo cubierto, en las fotos
  // españolas, algo más frío.
  "gris-qs": { color: "#a5a6a3", metal: 0, rugosidad: 0.55 },
  // La arena del Sting, plástico impreso mate (TWZ, al sol: #b49462).
  "arena-st": { color: "#9c8156", metal: 0, rugosidad: 0.7 },
  // Alas, brazos y góndolas: otra tanda de impresión, un punto más clara.
  "arena-st2": { color: "#a58b60", metal: 0, rugosidad: 0.66 },
  negro: { color: "#2b2d31", metal: 0, rugosidad: 0.55 },
  // El negro mate del MICH-2000: neutro, sin el punto azulado del negro de
  // las piezas, y muy mate (con menos rugosidad refleja el cielo y desde
  // arriba sale gris; el usuario lo quiere negro).
  "negro-ua": { color: "#1c1d1d", metal: 0, rugosidad: 0.82 },
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
  // El cromatado amarillo verdoso del cohete de arranque del MICH-2000 (la
  // foto del cohete en su caja).
  cromato: { color: "#b9b06e", metal: 0.45, rugosidad: 0.45 },
  // El Hero-30: blanco algo frío, satinado (al sol, en el lomo, la foto de la
  // ILA da #e0e5e9 y el render desde su mismo ángulo, #dde1e5). El tubo de
  // la feria checa, negro verdoso (la foto, corregida con el blanco de la
  // mesa), y sus bloques de espuma gris muy oscuro, muy mates.
  "blanco-h30": { color: "#d8e6f3", metal: 0, rugosidad: 0.45 },
  "tubo-h30": { color: "#3d3e33", metal: 0, rugosidad: 0.45 },
  espuma: { color: "#4a4a4d", metal: 0, rugosidad: 0.95 },
  // El FQ-44A Fury 25-1003: gris claro verdoso y la franja gris oscuro del
  // lomo, mates (al sol en el costado, #a8b2ac y #697470).
  "gris-fu": { color: "#565b5f", metal: 0, rugosidad: 0.75 },
  "gris-fu2": { color: "#4a5053", metal: 0, rugosidad: 0.75 },
  // Gris claro mate de los AIM-120 de instrucción y su lanzador (fotos de Creech).
  "gris-misil": { color: "#a3a8ac", metal: 0, rugosidad: 0.55 },
  // El RQ-4B 04-2015: gris medio algo verdoso, mate (fotos de Le Bourget: al
  // sol, #888e8e arriba y #6e7673 en el costado).
  "gris-gh": { color: "#5a605f", metal: 0, rugosidad: 0.75 },
  "gris-mg": { color: "#7b8383", metal: 0, rugosidad: 0.8 },
  // El Magura V7: más verdoso que el V5 (en la misma foto, cubierta #748887
  // frente a #7d8286).
  "gris-m7": { color: "#728889", metal: 0, rugosidad: 0.8 },
  // Los AIM-9M del V7: la cinta naranja fosforito («CAUTION BREAKABLE
  // WINDOW») y la banda marrón del motor cohete.
  naranja: { color: "#f05a1c", metal: 0, rugosidad: 0.5 },
  // El gris claro y algo frío del SIRTAP: en el vídeo del pintado, bajo los
  // focos del hangar, el costado sale un 12 % más oscuro que la pared blanca
  // (#97a0a2 contra #abb1b2).
  "gris-si": { color: "#9ea7ab", metal: 0, rugosidad: 0.5 },
  // La torreta del prototipo, entre naranja y ámbar según la luz.
  "naranja-si": { color: "#ee8a1c", metal: 0, rugosidad: 0.45 },
  marron: { color: "#7a5236", metal: 0, rugosidad: 0.6 },
  // El blanco del TARSIS, neutro y satinado, y su torreta: el cuerpo gris
  // oscuro algo cálido y lo que gira por fuera (tapas y montaje), gris claro,
  // para que se distingan (foto del morro).
  "blanco-ta": { color: "#dcdedb", metal: 0, rugosidad: 0.5 },
  "gris-ta": { color: "#4f4943", metal: 0, rugosidad: 0.6 },
  "gris-ta2": { color: "#aaa69f", metal: 0, rugosidad: 0.55 },
  // La ventana grande de la torreta, de cristal azul marino.
  "lente-ta": { color: "#14304a", metal: 0.1, rugosidad: 0.12 },
  // El gris claro del TARSIS-W, neutro y satinado (costado al sol #c7cabe en
  // la foto de pista por detrás), y el azul grisáceo mate del Fox.
  "gris-tw": { color: "#c2c5be", metal: 0, rugosidad: 0.5 },
  "azul-fox": { color: "#5a7189", metal: 0, rugosidad: 0.6 },
  // El Strike: carbono de las placas y brazos, mate (si brilla, desde arriba
  // refleja el cielo y sale gris), y el gris más claro de las riostras;
  // bobinado rojo cobrizo; muelles de impacto de acero claro, dorado pálido
  // (fotos de Wild Hornets). La cinta amarilla de la carga, más pálida que el
  // XT60 (foto de DroneXL).
  "carbono-wh": { color: "#1f2123", metal: 0, rugosidad: 0.72 },
  "carbono-gris": { color: "#36383b", metal: 0, rugosidad: 0.72 },
  "cobre-wh": { color: "#8c3b26", metal: 0.45, rugosidad: 0.45 },
  "muelle-wh": { color: "#cbbf98", metal: 0.6, rugosidad: 0.35 },
  "amarillo-wh": { color: "#d4ad4a", metal: 0, rugosidad: 0.55 },
  // Las campanas de los motores, gris metalizado oscuro, y las hélices, gris
  // muy oscuro de plástico, algo más claras que el carbono.
  "campana-wh": { color: "#4f5358", metal: 0.65, rugosidad: 0.38 },
  "helice-wh": { color: "#2c2e31", metal: 0, rugosidad: 0.6 },
  // El XQ-58 de los Marines: gris medio azulado y mate; puntas rojas.
  "gris-xq": { color: "#5c6368", metal: 0, rugosidad: 0.72 },
  "rojo-xq": { color: "#d6402a", metal: 0, rugosidad: 0.6 },
  // La granada de mortero (foto de una M821): verde oliva mate, la nariz de
  // plástico pardo de la espoleta y la banda de obturación, de plástico
  // verde con brillo.
  "verde-gr": { color: "#3f5636", metal: 0, rugosidad: 0.7 },
  "pardo-gr": { color: "#86754a", metal: 0, rugosidad: 0.55 },
  "obturador": { color: "#3b6248", metal: 0, rugosidad: 0.25 },
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

// Ruido de valor en 3D y su suma en cuatro octavas, para el desgaste.
const RUIDO_GLSL = `
float pinturaAzar(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float pinturaRuido(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(pinturaAzar(i), pinturaAzar(i + vec3(1, 0, 0)), f.x), mix(pinturaAzar(i + vec3(0, 1, 0)), pinturaAzar(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(pinturaAzar(i + vec3(0, 0, 1)), pinturaAzar(i + vec3(1, 0, 1)), f.x), mix(pinturaAzar(i + vec3(0, 1, 1)), pinturaAzar(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float pinturaFbm(vec3 p) { float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { s += a * pinturaRuido(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s / 0.9375 - 0.5; }
`;

// Desgaste: la pintura no es de un color liso, como en las fotos de cerca:
// manchas suaves de tono (retoques, suciedad, sol) y el brillo que cambia de
// un sitio a otro. Cuánto aclara u oscurece cada capa (manchas grandes y
// moteado) y cuánto cambia la rugosidad, en el nivel 1 (el «fuerte» que se
// eligió en el XQ-58).
type Desgaste = { manchas: number; moteado: number; brillo: number };
const DESGASTE_BASE: Desgaste = { manchas: 0.2, moteado: 0.08, brillo: 0.25 };
// Acabados sin desgaste: cristal, metal desnudo, huecos y luces.
const SIN_DESGASTE = new Set<Acabado>(["hueco", "lente", "lente-ta", "metal", "aluminio", "laton", "cromato", "muelle-wh", "campana-wh", "blanco", "rojo"]);

// Cómo de gastada está la maqueta (`Maqueta.desgaste`): `pintura`, las
// manchas y el brillo; `bordes`, la pintura rozada en las
// aristas vivas; `suciedad`, la panza más sucia.
// `largo`: el del dron en metros (el ancho de los bordes va con él).
export type Gastado = { pintura: number; bordes: number; suciedad: number; largo: number };

// Aristas vivas para los bordes gastados: la geometría sin índices y, en cada
// vértice, su coordenada baricéntrica y la altura del triángulo sobre cada
// lado (−1 si ese lado no es arista viva), para medir en el fragmento la
// distancia al borde. Todas las piezas a la vez: una arista con una punta
// pegada a otra pieza (a menos de `junta`, en unidades) es la junta de dos
// piezas que van a tope, no un borde.
export function marcarBordes(piezas: BufferGeometry[][], junta: number): BufferGeometry[][] {
  const todas = piezas.map((gs) => gs.map((g) => (g.index ? g.toNonIndexed() : g)));
  // Rejilla de vértices de cada geometría, de celdas de `junta`.
  const rejilla = new Map<number, Set<BufferGeometry>>();
  for (const g of todas.flat()) {
    const pos = g.getAttribute("position").array;
    for (let i = 0; i < pos.length; i += 3) {
      const c = clave(Math.floor(pos[i] / junta), Math.floor(pos[i + 1] / junta), Math.floor(pos[i + 2] / junta));
      const gs = rejilla.get(c);
      if (gs) gs.add(g);
      else rejilla.set(c, new Set([g]));
    }
  }
  const pegado = (g: BufferGeometry, p: Vector3) => {
    const [x, y, z] = [Math.floor(p.x / junta), Math.floor(p.y / junta), Math.floor(p.z / junta)];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const gs = rejilla.get(clave(x + i, y + j, z + k));
      if (gs) for (const otra of gs) if (otra !== g) return true;
    }
    return false;
  };
  // Las posiciones, a medio milímetro, para juntar los vértices repetidos.
  for (const g of todas.flat()) marcarUna(g, junta / 30, pegado);
  return todas;
}

// Tres enteros (de ±65.536) en un número, para las claves de los mapas.
const clave = (x: number, y: number, z: number) => ((x + 65536) * 131072 + (y + 65536)) * 131072 + (z + 65536);

function marcarUna(g: BufferGeometry, grano: number, pegado: (g: BufferGeometry, p: Vector3) => boolean) {
  const pos = g.getAttribute("position").array;
  const n = pos.length / 3, tris = n / 3;
  // Cada posición, un número (los vértices repetidos de las caras vecinas
  // dan el mismo).
  const ids = new Map<number, number>();
  const id = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    const c = clave(Math.round(pos[3 * i] / grano), Math.round(pos[3 * i + 1] / grano), Math.round(pos[3 * i + 2] / grano));
    let x = ids.get(c);
    if (x === undefined) ids.set(c, (x = ids.size));
    id[i] = x;
  }
  const normales = new Float32Array(tris * 3);
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  const punto = (i: number, v: Vector3) => v.set(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]);
  for (let t = 0; t < tris; t++) {
    punto(3 * t, a);
    b.subVectors(punto(3 * t + 1, b), a);
    c.subVectors(punto(3 * t + 2, c), a);
    b.cross(c).normalize();
    normales.set([b.x, b.y, b.z], 3 * t);
  }
  // El lado k es el opuesto al vértice k.
  const lados = new Map<number, number[]>();
  const m = ids.size;
  for (let i = 0; i < n; i++) {
    const t = i - (i % 3), k = i % 3;
    const p = id[t + ((k + 1) % 3)], q = id[t + ((k + 2) % 3)];
    const l = Math.min(p, q) * m + Math.max(p, q);
    const ts = lados.get(l);
    if (ts) ts.push(i);
    else lados.set(l, [i]);
  }
  const vivo = new Uint8Array(n);
  // Viva: más de 35° entre las dos caras (sin mirar el sentido: hay piezas
  // con los triángulos al revés). Un borde suelto no: es donde una pieza
  // abierta se junta con otra.
  for (const ts of lados.values()) {
    for (const x of ts) for (const y of ts) {
      if (x === y) continue;
      const nx = x - (x % 3), ny = y - (y % 3);
      const d = normales[nx] * normales[ny] + normales[nx + 1] * normales[ny + 1] + normales[nx + 2] * normales[ny + 2];
      if (Math.abs(d) < 0.82) vivo[x] = 1;
    }
  }
  for (let i = 0; i < n; i++) if (vivo[i]) {
    const t = i - (i % 3), k = i % 3;
    if (pegado(g, punto(t + ((k + 1) % 3), a)) || pegado(g, punto(t + ((k + 2) % 3), a))) vivo[i] = 0;
  }
  const bari = new Float32Array(n * 3), alto = new Float32Array(n * 3);
  const p = [new Vector3(), new Vector3(), new Vector3()];
  for (let t = 0; t < tris; t++) {
    for (let k = 0; k < 3; k++) punto(3 * t + k, p[k]);
    const area2 = b.subVectors(p[1], p[0]).cross(c.subVectors(p[2], p[0])).length();
    const h = [0, 1, 2].map((k) => {
      const largo = p[(k + 1) % 3].distanceTo(p[(k + 2) % 3]);
      return vivo[3 * t + k] && largo > 0 ? area2 / largo : -1;
    });
    for (let k = 0; k < 3; k++) {
      bari[(3 * t + k) * 3 + k] = 1;
      alto.set(h, (3 * t + k) * 3);
    }
  }
  g.setAttribute("bordeBari", new Float32BufferAttribute(bari, 3));
  g.setAttribute("bordeAlto", new Float32BufferAttribute(alto, 3));
}

// marca: para el pixel HD, el número de la pieza va en el canal alfa (como
// en materialPixel), para que la pasada final marque las juntas.
// escala: metros por unidad de la maqueta (el desgaste se mide en metros).
export function materialHD(acabado: Acabado, estilo: EstiloHD, marca?: number, escala = 1, gastado?: Gastado): MeshStandardMaterial | MeshToonMaterial {
  const p = PINTURAS[acabado];
  // Por las dos caras, como la maqueta 1.0: algunas piezas (las alas) tienen
  // los triángulos al revés y, pintadas solo por delante, salían del revés.
  if (estilo === "b") return new MeshToonMaterial({ color: new Color(p.color), gradientMap: rampaToon(), side: DoubleSide });
  const m = new MeshStandardMaterial({ color: new Color(p.color), metalness: p.metal, roughness: p.rugosidad, envMapIntensity: 0.45, side: DoubleSide });
  // El desgaste, solo en la maqueta: en el pixel serían píxeles sueltos.
  const conDesgaste = !SIN_DESGASTE.has(acabado);
  const nivel = conDesgaste ? gastado?.pintura ?? 0 : 0;
  const d: Desgaste | undefined = (nivel > 0 ? { manchas: DESGASTE_BASE.manchas * nivel, moteado: DESGASTE_BASE.moteado * nivel, brillo: DESGASTE_BASE.brillo * nivel } : undefined);
  const bordes = conDesgaste ? gastado?.bordes ?? 0 : 0;
  const suciedad = conDesgaste ? gastado?.suciedad ?? 0 : 0;
  // Ancho de los bordes gastados: 2,5 cm en un dron de 9 m.
  const anchoBorde = 0.0028 * (gastado?.largo ?? 9);
  // Los drones de menos de 6 m, con las manchas más pequeñas a la par: en
  // metros, en uno de 25 cm una mancha era más grande que el dron.
  const encoge = Math.max(1, 6 / (gastado?.largo ?? 9));
  if ((d || bordes || suciedad) && marca === undefined) {
    const f = (x: number) => x.toFixed(4);
    m.onBeforeCompile = (sh) => {
      sh.uniforms.pinturaEscala = { value: escala * encoge };
      sh.vertexShader = "varying vec3 vPintura;\nvarying vec3 vPinturaN;\nattribute vec3 bordeBari;\nattribute vec3 bordeAlto;\nvarying vec3 vBorde;\n" + sh.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvPintura = position;\nvPinturaN = normal;\n// Sin marcarBordes, sin bordes.\nvBorde = any(notEqual(bordeAlto, vec3(0.0))) ? bordeBari * max(bordeAlto, 0.0) + (1.0 - step(0.0, bordeAlto)) * 1e4 : vec3(1e4);",
      );
      // Manchas redondas de unos 50 cm (alargadas hacia atrás salían rayas);
      // moteado de unos 8 cm; el brillo, con otro ruido.
      // Bordes: a menos de `anchoBorde` de una arista viva, la pintura
      // cambia a trozos (el ruido la rompe en desconchones), y también en lo
      // que mira hacia delante. Suciedad: la mitad de abajo, más oscura a
      // manchas.
      sh.fragmentShader = "varying vec3 vPintura;\nvarying vec3 vPinturaN;\nvarying vec3 vBorde;\nuniform float pinturaEscala;\n" + RUIDO_GLSL + sh.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 pinturaM = vPintura * pinturaEscala;
        ${d ? `diffuseColor.rgb *= 1.0 + ${f(d.manchas)} * 2.0 * pinturaFbm(pinturaM * 2.0) + ${f(d.moteado)} * 2.0 * pinturaFbm(pinturaM * 12.0 + 40.0);` : ""}
        ${suciedad ? `{
          float abajo = smoothstep(0.3, -0.6, normalize(vPinturaN).y);
          diffuseColor.rgb *= 1.0 - ${f(suciedad)} * 0.22 * abajo * (0.6 + 0.8 * pinturaFbm(pinturaM * 1.5 + 9.0));
        }` : ""}
        ${bordes ? `{
          float dist = min(vBorde.x, min(vBorde.y, vBorde.z)) * pinturaEscala / ${f(encoge)};
          float roto = pinturaFbm(pinturaM * 30.0 + 5.0) + 0.5;
          float borde = smoothstep(${f(anchoBorde)} * (0.4 + roto), 0.0, dist);
          // Lo que da al aire (bordes de ataque, morro, labios): erosión.
          borde = max(borde, smoothstep(0.8, 0.98, normalize(vPinturaN).z) * smoothstep(0.35, 0.75, roto));
          // En pintura oscura, el roce aclara; en clara, oscurece (suciedad).
          float claro = smoothstep(0.25, 0.45, dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));
          vec3 rozado = mix(diffuseColor.rgb * 1.45 + 0.06, diffuseColor.rgb * 0.72, claro);
          diffuseColor.rgb = mix(diffuseColor.rgb, rozado, ${f(Math.min(bordes, 1.5))} * borde);
        }` : ""}`,
      ).replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        ${d ? `roughnessFactor = clamp(roughnessFactor + ${f(d.brillo)} * 2.0 * pinturaFbm(pinturaM * 1.8 + 17.0), 0.05, 1.0);` : ""}`,
      );
    };
    m.customProgramCacheKey = () => `desgaste-${acabado}-${nivel}-${bordes}-${suciedad}-${anchoBorde}-${encoge}`;
  }
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
// fuera es la línea. El grosor va en unidades de la maqueta. Con `retraso`
// (la `soldadura` de la maqueta), la copia se aleja de la cámara esa
// distancia sin moverse en pantalla: la tapa lo que tenga justo detrás.
export function materialContorno(grosor: number, retraso = 0) {
  const m = new MeshBasicMaterial({ color: 0x1d1f23, side: BackSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.grosor = { value: grosor };
    sh.uniforms.retraso = { value: retraso };
    sh.vertexShader = "uniform float grosor;\nuniform float retraso;\n" + sh.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\ntransformed += normalize(normal) * grosor;",
    ).replace(
      "#include <project_vertex>",
      // En perspectiva, a lo largo del rayo; en ortográfica, de frente.
      `#include <project_vertex>
      if (retraso > 0.0) {
        mvPosition.xyz += (projectionMatrix[3][3] > 0.5 ? vec3(0.0, 0.0, -1.0) : normalize(mvPosition.xyz)) * retraso;
        gl_Position = projectionMatrix * mvPosition;
      }`,
    );
  };
  return m;
}


// ── Detalle pintado ────────────────────────────────────────────────────────
// Calcas (marcas, números, discos) proyectadas sobre las piezas y costuras
// (líneas de paneles con sus remaches) llevadas a la superficie. Los dibujos
// se hacen aquí, en un lienzo 2D: sin imágenes aparte.

const TINTA_CALCA = "#17181a";
const LETRAS: Record<Letra, string> = {
  din: `"DIN Alternate", Bahnschrift, "DejaVu Sans", Arial, sans-serif`,
  "din-estrecha": `"DIN Condensed", "Bahnschrift SemiBold Condensed", "Arial Narrow", "DejaVu Sans Condensed", sans-serif`,
};

// El logotipo de Airbus, alto 1000 (el «AIRBUS» del SIRTAP).
const LOGO_AIRBUS = "M4902 2C4867 4 4852 6 4838 9C4827 12 4815 15 4811 15C4761 23 4687 61 4645 99C4554 182 4538 340 4609 444C4642 492 4724 541 4803 561C4809 563 4823 567 4833 569C4857 577 4901 587 4929 592C4962 599 5046 624 5070 635C5113 654 5127 671 5127 705L5127 724L5123 733C5112 755 5092 768 5057 777L5036 782L4997 783C4952 784 4882 781 4866 777C4859 776 4846 774 4837 773C4826 772 4814 770 4806 768C4799 765 4790 763 4784 762C4766 759 4717 745 4686 732C4646 717 4629 709 4620 704C4599 691 4593 696 4577 743C4573 756 4566 777 4562 788C4558 800 4551 821 4545 836C4541 850 4535 866 4533 870C4528 882 4528 892 4534 898C4543 910 4638 947 4687 958C4692 959 4699 961 4703 963C4707 964 4717 967 4725 968C4732 969 4744 972 4751 974C4772 979 4821 986 4839 987C4849 988 4862 990 4869 991C4905 998 5036 1000 5065 993C5072 992 5087 989 5098 987C5206 972 5300 911 5341 829C5350 812 5365 767 5365 758C5365 755 5366 745 5368 737C5399 572 5284 450 5042 393C5028 390 5009 385 4998 383C4988 380 4978 378 4976 378C4974 378 4968 376 4962 374C4956 372 4945 369 4938 368C4785 335 4745 254 4863 216L4879 211L4925 210C4951 209 4979 209 4987 210C4995 210 5011 211 5021 211C5032 211 5047 213 5054 214C5061 216 5074 218 5084 219C5093 220 5104 222 5109 224C5114 225 5124 227 5131 228C5138 230 5152 233 5161 236C5170 239 5178 242 5179 242C5184 242 5234 261 5249 269C5275 282 5279 280 5291 248C5295 238 5301 221 5305 211C5315 187 5328 152 5336 131C5339 121 5343 110 5345 106C5349 98 5348 88 5343 84C5336 78 5271 51 5248 45C5241 43 5230 39 5224 37C5198 29 5144 17 5121 14C5112 13 5100 11 5094 10C5080 6 5049 3 4996 2C4973 1 4951 1 4950 0C4948 0 4927 1 4902 2ZM485 24C476 29 473 35 447 85C425 130 397 183 349 279C336 305 315 346 302 370C290 394 270 434 257 459C244 484 221 530 205 561C166 637 129 710 111 744C104 759 77 811 53 859C29 907 7 949 5 952C0 960 0 969 5 974L8 977L129 977L249 977L255 972C261 966 275 940 305 878C328 831 331 825 339 821L344 818L526 818L708 818L714 815L721 812L721 807C721 804 713 785 702 764C677 713 653 663 653 661C653 656 631 620 626 618C622 616 604 615 535 614L449 613L446 609C442 604 442 600 447 591C451 582 461 563 492 498C505 472 528 426 544 394L572 337L577 336C581 334 583 335 585 336C588 338 618 399 821 806C904 973 902 970 911 974L917 977L1039 977L1161 977L1165 973C1169 968 1169 962 1164 954C1160 946 1145 916 1105 838C1088 804 1073 775 1071 772C1070 770 1050 731 1027 686C979 592 960 554 913 462C895 426 869 376 857 351C844 326 828 295 821 282C814 268 793 226 773 187C687 18 693 28 682 24L675 20L583 20L491 20L485 24ZM1233 22C1231 23 1228 26 1226 29L1223 35L1223 501L1223 966L1229 972L1235 977L1340 977C1452 977 1450 977 1455 967L1458 961L1458 498L1457 34L1455 29C1453 27 1450 23 1447 22C1442 20 1240 20 1233 22ZM1617 26L1612 31L1612 498L1612 966L1617 971L1623 977L1728 977L1833 977L1839 974C1847 970 1847 984 1847 605L1847 245L1849 239C1854 228 1851 228 2006 229L2147 230L2166 237C2243 266 2266 369 2209 429C2179 462 2158 465 2012 465C1876 466 1879 465 1901 499C1907 508 1921 531 1933 549C1944 567 1961 594 1971 609C1980 624 1998 653 2010 673C2023 692 2037 716 2043 724C2048 732 2055 743 2058 749C2061 754 2066 762 2069 767C2072 771 2079 782 2084 789C2088 797 2099 813 2106 825C2114 837 2125 856 2131 866C2137 876 2144 887 2147 891C2149 894 2160 911 2171 928C2182 946 2194 964 2198 969L2206 977L2323 977C2476 978 2471 979 2451 949C2447 943 2429 916 2412 889C2395 862 2375 829 2366 816C2341 777 2334 767 2315 735C2283 684 2273 667 2266 658C2254 639 2258 632 2285 624C2434 578 2508 413 2458 236C2433 151 2355 71 2273 47C2268 46 2259 43 2255 41C2250 39 2239 36 2231 34C2222 33 2212 31 2208 30C2205 28 2183 26 2160 24L2118 20L1871 20L1623 20L1617 26ZM2590 22C2588 23 2585 26 2583 28L2581 32L2580 494C2580 979 2579 965 2586 972L2591 977L2889 977C3053 977 3192 976 3199 975C3381 952 3477 854 3473 696L3473 658L3465 632C3445 570 3407 522 3353 494C3331 483 3330 477 3348 464C3387 437 3413 398 3427 346L3433 324L3433 281L3433 237L3427 213C3408 137 3343 66 3275 46C3269 44 3261 41 3255 39C3240 33 3213 27 3193 26C3182 25 3165 23 3155 22C3131 20 2596 20 2590 22ZM3144 227C3168 232 3186 246 3199 271L3206 284L3206 307L3206 330L3200 343C3192 360 3174 378 3158 384L3147 388L3071 390C3030 390 2958 390 2912 390L2828 390L2823 385L2818 380L2817 310L2816 240L2819 233C2823 224 2821 224 2982 224L3129 225L3144 227ZM3158 585C3183 591 3208 612 3221 637L3228 651L3229 671C3231 715 3216 742 3175 765L3160 773L2993 773L2826 773L2822 769L2818 764L2817 686C2816 600 2817 594 2823 587L2828 583L2988 583C3092 583 3152 584 3158 585ZM3581 23C3579 24 3576 28 3575 31C3572 38 3573 600 3576 615C3577 621 3579 636 3581 649C3583 662 3585 676 3587 681C3588 685 3590 694 3592 701C3619 841 3752 967 3894 987C3902 988 3918 990 3929 992C3966 1000 4054 1000 4086 993C4094 991 4107 989 4116 988C4160 983 4231 956 4269 931C4365 867 4411 791 4440 648C4445 625 4446 549 4446 295L4446 31L4441 26L4435 20L4328 20L4221 20L4216 24C4207 32 4207 31 4207 318L4208 591L4204 610C4202 621 4199 633 4199 638C4198 642 4195 651 4193 657C4190 663 4187 672 4185 677C4169 725 4111 768 4052 775C3910 793 3827 730 3816 596L3813 563L3813 298C3813 17 3814 28 3804 23L3798 20L3692 20L3585 20L3581 23Z";

// Las imágenes de las calcas `imagen`, ya cargadas: el lienzo de una calca se
// pinta de una vez, así que se cargan antes de montar el dron.
const IMAGENES = new Map<string, HTMLImageElement>();
export async function precargarImagenes(m: Maqueta) {
  const srcs = [...(m.detalles?.calcas ?? []), ...(m.catapulta?.detalles?.calcas ?? [])].flatMap((k) => (k.dibujo.tipo === "imagen" ? [k.dibujo.src] : []));
  await Promise.all([...new Set(srcs)].filter((s) => !IMAGENES.has(s)).map(async (s) => {
    const im = new Image();
    im.src = s;
    await im.decode();
    IMAGENES.set(s, im);
  }));
}

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
      if (d.color) c.fillStyle = c.strokeStyle = d.color;
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
    case "escarapela-ua": {
      // El azul ocupa la mitad del diámetro (fotos de la fábrica).
      const r = Math.min(W, H) / 2;
      c.fillStyle = "#e8c000";
      c.beginPath(); c.arc(W / 2, H / 2, r * 0.97, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#1638a8";
      c.beginPath(); c.arc(W / 2, H / 2, r * 0.5, 0, Math.PI * 2); c.fill();
      break;
    }
    case "texto": {
      const lineas = d.texto.split("\n");
      const alto = H / lineas.length;
      c.fillStyle = d.color ?? TINTA_CALCA;
      c.font = (d.cursiva ? "italic " : "") + (d.letra
        ? `700 ${Math.round(alto * (d.letra === "din" ? 0.95 : 1.1))}px ${LETRAS[d.letra]}`
        : d.fino
        ? `600 ${Math.round(alto * 0.86)}px "Helvetica Neue", Arial, sans-serif`
        : `900 ${Math.round(alto * 0.92)}px "Arial Black", "Helvetica Neue", Arial, sans-serif`);
      c.textAlign = "center"; c.textBaseline = "middle";
      if (d.espaciado) c.letterSpacing = `${Math.round(alto * d.espaciado)}px`;
      if (d.espejo) { c.translate(W, 0); c.scale(-1, 1); }
      if (d.llenar) {
        // El espaciado también va detrás de la última letra: se descuenta.
        const ancho = Math.max(...lineas.map((l) => c.measureText(l).width)) - alto * (d.espaciado ?? 0);
        c.translate(W / 2, 0); c.scale((W * 0.98) / ancho, 1); c.translate(-W / 2 + (alto * (d.espaciado ?? 0)) / 2, 0);
        lineas.forEach((l, i) => c.fillText(l, W / 2, alto * (i + 0.54)));
        // `grueso`: el mismo texto repasado con un trazo, para engordar la letra.
        if (d.grueso) {
          c.strokeStyle = c.fillStyle; c.lineWidth = alto * d.grueso; c.lineJoin = "round";
          lineas.forEach((l, i) => c.strokeText(l, W / 2, alto * (i + 0.54)));
        }
      } else lineas.forEach((l, i) => c.fillText(l, W / 2, alto * (i + 0.54), W * 0.98));
      break;
    }
    case "airbus": {
      // El logotipo calcado del final del vídeo del rodaje (potrace), de
      // 5399 x 1000, estirado a la calca.
      c.fillStyle = d.color;
      c.scale(W / 5399, H / 1000);
      c.fill(new Path2D(LOGO_AIRBUS));
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
      if (d.color) c.fillStyle = d.color;
      c.textBaseline = "middle";
      const familia = d.letra ? LETRAS[d.letra] : `"Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
      c.font = `700 ${Math.round(H * 0.36)}px ${familia}`;
      c.textAlign = "center";
      c.fillText("AF", W * 0.11, H * 0.3); c.fillText(d.ano, W * 0.11, H * 0.72);
      c.font = `700 ${Math.round(H * (d.letra ? 1.1 : 0.95))}px ${familia}`;
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
      if (d.color) c.fillStyle = c.strokeStyle = d.color;
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
    case "rayas": {
      // Franjas a 45°, del ancho de la mitad del alto.
      const n = d.franjas ?? 5, paso = W / n;
      c.fillStyle = d.fondo; c.fillRect(0, 0, W, H);
      c.fillStyle = d.color;
      for (let i = -1; i <= n; i++) {
        const x = i * paso;
        c.beginPath(); c.moveTo(x, H); c.lineTo(x + paso / 2, H); c.lineTo(x + paso / 2 + H, 0); c.lineTo(x + H, 0); c.closePath(); c.fill();
      }
      break;
    }
    case "flecha-texto": {
      // Contorno de flecha (cuerpo de media altura y punta en el último quinto)
      // y el texto dentro del cuerpo.
      const lw = H * 0.07, m = lw / 2, cuerpo = H * 0.26, punta = W * 0.8;
      c.strokeStyle = c.fillStyle = d.color; c.lineWidth = lw; c.lineJoin = "miter";
      c.save();
      if (d.izquierda) { c.translate(W, 0); c.scale(-1, 1); }
      c.beginPath();
      c.moveTo(m, H / 2 - cuerpo); c.lineTo(punta, H / 2 - cuerpo); c.lineTo(punta, m); c.lineTo(W - m * 2, H / 2);
      c.lineTo(punta, H - m); c.lineTo(punta, H / 2 + cuerpo); c.lineTo(m, H / 2 + cuerpo); c.closePath(); c.stroke();
      c.restore();
      c.font = `600 ${Math.round(cuerpo * 1.05)}px "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(d.texto, d.izquierda ? W - punta * 0.52 : punta * 0.52, H / 2 + cuerpo * 0.04, punta * 0.9);
      break;
    }
    case "carbono": {
      // Sarga 2/2: cada mechón ocupa dos casillas y se corre una por fila.
      const n = 64, k = W / n;
      c.fillStyle = "#26272a"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#3a3c40";
      for (let j = 0; j < Math.ceil(H / k); j++) {
        for (let i = 0; i < n; i++) {
          if ((i + j) % 4 < 2) c.fillRect(i * k, j * k, k, k * 0.9);
        }
      }
      break;
    }
    case "skydio": {
      // La marca arriba, en un cuadrado de lado L, y el nombre debajo.
      const L = Math.min(W, H * 0.72), x0 = (W - L) / 2, y0 = 0;
      const P = (u: number, v: number): [number, number] => [x0 + u * L, y0 + v * L];
      c.fillStyle = d.color ?? TINTA_CALCA;
      // Pieza de arriba: el lado de arriba, la punta a la derecha y la curva
      // que baja hasta media altura por la izquierda.
      c.beginPath();
      c.moveTo(...P(0, 0)); c.lineTo(...P(0.88, 0)); c.lineTo(...P(1, 0.1));
      c.bezierCurveTo(...P(0.62, 0.2), ...P(0.25, 0.3), ...P(0, 0.48));
      c.closePath(); c.fill();
      // Pieza de abajo: la curva que sube por la derecha y la punta abajo a
      // la izquierda.
      c.beginPath();
      c.moveTo(...P(0.88, 0.28)); c.lineTo(...P(0.88, 1)); c.lineTo(...P(0.08, 1));
      c.quadraticCurveTo(...P(-0.04, 0.96), ...P(0.02, 0.88));
      c.bezierCurveTo(...P(0.22, 0.58), ...P(0.55, 0.38), ...P(0.88, 0.28));
      c.closePath(); c.fill();
      c.font = `600 ${Math.round(H * 0.2)}px "Helvetica Neue", Arial, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("Skydio", W / 2, H * 0.88, W);
      break;
    }
    case "sting": {
      // El avispón del logo oficial de Wild Hornets (wildhornets.com) y, pegado
      // debajo, «STING» con su misma letra octogonal (la G, hecha como su O).
      const AVISPON = "M114.954 100.919V75.885L123.918 66.9213V99.0601L132.881 108.024V120.7L120.365 108.184L103.59 124.96H90.9133L114.954 100.919ZM177.698 111.739H141.844V129.667L150.807 138.63H168.735L177.698 129.667V111.739ZM150.807 129.667V120.703H168.735V129.667H150.807ZM141.844 138.63H150.807V147.594H168.735V138.63H177.698V174.789L159.771 192.616L141.844 174.789V138.63ZM150.807 156.558H168.735V171.061L159.771 179.974L150.807 171.061V156.558ZM204.59 75.885V100.919L228.629 124.96H215.954L199.178 108.184L186.662 120.7V108.024L195.626 99.0601V66.9213L204.59 75.885ZM132.88 149.491L112.348 170.023L94.6259 152.301H81.9494L105.989 176.341V210.339L114.953 201.376V180.095L132.88 162.167V149.491ZM207.194 170.023L186.662 149.491V162.167L204.589 180.095V201.376L213.552 210.339V176.341L237.593 152.301H224.916L207.194 170.023Z";
      const LETRAS: [string, number, number][] = [
        ["M798.924 116.374H820.877L829.751 125.334V129.812H820.883V125.334H798.918V131.008L829.751 139.35L829.75 151.902L820.877 160.862H798.924L790.05 151.902V147.424H798.918V151.902H820.883V146.228L790.05 137.886L790.051 125.333L798.924 116.374Z", 790.05, 39.7], ["M741.698 124.763V116.374H784.81V124.763H767.692V160.862H758.817V124.763H741.698Z", 741.7, 43.1], ["M349.979 116.405V160.893H358.853V116.405H349.979Z", 349.98, 8.88], ["M650.548 116.374H641.674V160.862H650.548V129.466L676.353 160.862H685.164V116.374H676.353V147.77L650.548 116.374Z", 641.67, 43.5],
        ["M8.9 0H36.1L45 8.9V13H36.1V8.9H8.9V35.6H36.1V26.5H24V18.6H45V35.6L36.1 44.5H8.9L0 35.6V8.9Z", 0, 45],
      ];
      const hueco = 9, anchoTexto = LETRAS.reduce((t, [, , w]) => t + w, 0) + hueco * (LETRAS.length - 1);
      const altoTodo = 143.4 + 10 + 44.5, anchoTodo = Math.max(anchoTexto, 155.7);
      const k = Math.min(W / anchoTodo, H / altoTodo);
      c.fillStyle = d.color ?? TINTA_CALCA;
      c.save();
      c.translate(W / 2 - (155.7 * k) / 2, (H - altoTodo * k) / 2);
      c.scale(k, k); c.translate(-81.95, -66.92);
      c.fill(new Path2D(AVISPON));
      c.restore();
      let x = W / 2 - (anchoTexto * k) / 2;
      for (const [d0, x0, w] of LETRAS) {
        c.save();
        c.translate(x, (H - altoTodo * k) / 2 + (143.4 + 10) * k);
        c.scale(k, k); c.translate(-x0, x0 === 0 ? 0 : -116.37);
        c.fill(new Path2D(d0));
        c.restore();
        x += (w + hueco) * k;
      }
      break;
    }
    case "uvision": {
      // «UVision» arriba, en una letra de palo redondeada, y el trazo rojo,
      // inclinado y que se afina, en lugar del punto de la segunda i. Con
      // Rheinmetall, debajo y a la izquierda su marca (una barra azul arriba
      // y otra marino que baja, como una F inclinada) y el nombre.
      const marino = "#1f2552", alto = d.rheinmetall ? H * 0.55 : H * 0.9;
      c.fillStyle = marino;
      c.textBaseline = "alphabetic"; c.textAlign = "left";
      let fuente = alto * 0.95;
      c.font = `600 ${Math.round(fuente)}px "Helvetica Neue", Arial, sans-serif`;
      const ancho = c.measureText("UVisıon").width;
      if (ancho > W * 0.98) { fuente *= (W * 0.98) / ancho; c.font = `600 ${Math.round(fuente)}px "Helvetica Neue", Arial, sans-serif`; }
      const x0 = d.rheinmetall ? 0 : (W - c.measureText("UVisıon").width) / 2, base = alto * 0.92;
      c.fillText("UVisıon", x0, base);
      const xi = x0 + c.measureText("UVis").width, wi = c.measureText("ı").width, yi = base - fuente * 0.78;
      c.fillStyle = "#d4213d";
      c.beginPath();
      c.moveTo(xi - wi * 1.6, yi + fuente * 0.05); c.lineTo(xi + wi * 0.6, yi - fuente * 0.12);
      c.lineTo(xi + wi * 2.6, yi - fuente * 0.02); c.lineTo(xi + wi * 0.5, yi - fuente * 0.03);
      c.closePath(); c.fill();
      if (d.rheinmetall) {
        const m = H * 0.36, my = H * 0.6;
        c.fillStyle = "#1e6fc0";
        c.beginPath(); c.moveTo(m * 0.22, my); c.lineTo(m * 1.05, my); c.lineTo(m * 0.95, my + m * 0.3); c.lineTo(m * 0.12, my + m * 0.3); c.closePath(); c.fill();
        c.fillStyle = marino;
        c.beginPath(); c.moveTo(m * 0.1, my + m * 0.38); c.lineTo(m * 0.42, my + m * 0.38); c.lineTo(m * 0.3, my + m); c.lineTo(0, my + m); c.closePath(); c.fill();
        c.fillStyle = "#2b2c32";
        const fr = H * 0.22;
        c.font = `600 ${Math.round(fr)}px "Helvetica Neue", Arial, sans-serif`;
        c.fillText("RHEINMETALL", m * 1.25, my + m * 0.95 + fr * 0.25, W - m * 1.3);
      }
      break;
    }
    case "triangulo": {
      c.fillStyle = "#141516";
      c.beginPath();
      c.moveTo(0, H * 0.25); c.lineTo(W, 0);
      c.quadraticCurveTo(W * 0.78, H * 0.45, W * 0.72, H);
      c.closePath(); c.fill();
      break;
    }
    case "ventana": {
      // Trapecio con las esquinas redondeadas (arcTo en cada vértice).
      const b = (1 - (d.abajo ?? 0.7)) * W / 2, r = Math.min(W, H) * 0.18;
      const v: [number, number][] = [[0, 0], [W, 0], [W - b, H], [b, H]];
      c.fillStyle = "#101418";
      c.beginPath();
      c.moveTo((v[0][0] + v[1][0]) / 2, 0);
      for (let i = 1; i <= 4; i++) { const p = v[i % 4], q = v[(i + 1) % 4]; c.arcTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, r); }
      c.closePath(); c.fill();
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
    case "poligono": {
      c.fillStyle = d.color;
      c.beginPath();
      d.puntos.forEach(([u, v], i) => (i ? c.lineTo(u * W, (1 - v) * H) : c.moveTo(u * W, (1 - v) * H)));
      c.closePath(); c.fill();
      break;
    }
    case "usaf": {
      // Las dos alas: bandas anchas que suben en «V» desde el centro y se
      // abren hacia arriba; debajo, el rombo con la estrella.
      c.fillStyle = d.color;
      const cx = W / 2;
      for (const s of [1, -1]) {
        c.beginPath();
        c.moveTo(cx + s * W * 0.03, H * 0.58); c.lineTo(cx + s * W * 0.5, H * 0.0); c.lineTo(cx + s * W * 0.5, H * 0.24);
        c.lineTo(cx + s * W * 0.12, H * 0.72); c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(cx + s * W * 0.15, H * 0.74); c.lineTo(cx + s * W * 0.47, H * 0.34); c.lineTo(cx + s * W * 0.42, H * 0.52);
        c.lineTo(cx + s * W * 0.2, H * 0.82); c.closePath(); c.fill();
      }
      c.beginPath(); c.moveTo(cx, H * 0.56); c.lineTo(cx + W * 0.13, H * 0.78); c.lineTo(cx, H); c.lineTo(cx - W * 0.13, H * 0.78); c.closePath(); c.fill();
      c.globalCompositeOperation = "destination-out";
      estrella(cx, H * 0.79, W * 0.08); c.fill();
      c.globalCompositeOperation = "source-over";
      break;
    }
    case "anduril": {
      // El logo: un triángulo hueco con la base curvada hacia arriba y una
      // curva dentro; a su derecha, «ANDURIL» en mayúsculas finas y anchas.
      c.strokeStyle = c.fillStyle = d.color;
      const L = d.texto ? H : Math.min(W, H), lw = L * 0.1;
      c.lineWidth = lw; c.lineJoin = "round";
      c.beginPath(); c.moveTo(L * 0.5, lw); c.lineTo(L - lw, L - lw); c.quadraticCurveTo(L * 0.5, L * 0.62, lw, L - lw); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(L * 0.5, L * 0.35); c.quadraticCurveTo(L * 0.68, L * 0.6, L * 0.62, L * 0.78); c.stroke();
      if (d.texto) {
        // Letras anchas y separadas, como en el costado del 25-1003.
        c.font = `500 ${Math.round(H * 0.95)}px "Helvetica Neue", Arial, sans-serif`;
        c.textAlign = "left"; c.textBaseline = "middle";
        (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${Math.round(H * 0.16)}px`;
        c.fillText("ANDURIL", L * 1.3, H * 0.56, W - L * 1.35);
      }
      break;
    }
    case "logo": {
      // Se pinta en un lienzo aparte a escala del SVG, se busca lo pintado
      // (el SVG puede traer márgenes) y se encaja centrado sin deformar.
      const L = LOGOS[d.logo], [x0, y0, w0, h0] = L.caja, k = 1024 / Math.max(w0, h0);
      const tmp = document.createElement("canvas");
      tmp.width = Math.ceil(w0 * k); tmp.height = Math.ceil(h0 * k);
      const t = tmp.getContext("2d")!;
      t.fillStyle = t.strokeStyle = d.color; t.lineJoin = "round"; t.lineCap = "round";
      for (const z of L.trazos) {
        const m = z.m ?? [1, 0, 0, 1, 0, 0];
        t.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
        t.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        t.globalCompositeOperation = z.modo === "borra" ? "destination-out" : "source-over";
        const p = new Path2D(z.d);
        if (z.linea) { t.lineWidth = z.linea; t.stroke(p); continue; }
        t.fill(p);
        if (z.borde) { t.lineWidth = z.borde; t.stroke(p); }
      }
      const px = t.getImageData(0, 0, tmp.width, tmp.height).data;
      let [a0, b0, a1, b1] = [tmp.width, tmp.height, 0, 0];
      for (let y = 0; y < tmp.height; y++) for (let x = 0; x < tmp.width; x++) if (px[(y * tmp.width + x) * 4 + 3] > 8) {
        a0 = Math.min(a0, x); b0 = Math.min(b0, y); a1 = Math.max(a1, x + 1); b1 = Math.max(b1, y + 1);
      }
      const e = Math.min(W / (a1 - a0), H / (b1 - b0)), dw = (a1 - a0) * e, dh = (b1 - b0) * e;
      c.drawImage(tmp, a0, b0, a1 - a0, b1 - b0, (W - dw) / 2, (H - dh) / 2, dw, dh);
      break;
    }
    case "imagen": {
      const im = IMAGENES.get(d.src);
      if (!im) break;
      const e = Math.min(W / im.naturalWidth, H / im.naturalHeight), dw = im.naturalWidth * e, dh = im.naturalHeight * e;
      c.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
      break;
    }
    case "aviso-toma": {
      c.strokeStyle = c.fillStyle = d.color;
      c.lineWidth = Math.min(W, H) * 0.05;
      const tri = (m: number) => { c.beginPath(); c.moveTo(W * m, H * (m * 0.9)); c.lineTo(W * (1 - m), H * (m * 0.9)); c.lineTo(W / 2, H * (1 - m * 0.6)); c.closePath(); };
      tri(0.04); c.stroke();
      tri(0.3); c.stroke();
      for (const f of [0.18, 0.27]) c.fillRect(W * 0.3, H * f, W * 0.4, H * 0.035);
      break;
    }
    case "malla": {
      // Malla negra con un marco claro fino y la trama en diagonal.
      c.save();
      c.beginPath();
      if (d.hex) { c.moveTo(W * 0.22, 0); c.lineTo(W * 0.78, 0); c.lineTo(W, H / 2); c.lineTo(W * 0.78, H); c.lineTo(W * 0.22, H); c.lineTo(0, H / 2); c.closePath(); }
      else c.rect(0, 0, W, H);
      c.fillStyle = "#1b1e1f"; c.fill(); c.clip();
      c.strokeStyle = "rgba(150,160,158,0.35)"; c.lineWidth = Math.max(1, Math.min(W, H) * 0.02);
      const paso = Math.min(W, H) * 0.09;
      for (let x = -H; x < W + H; x += paso) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); c.beginPath(); c.moveTo(x + H, 0); c.lineTo(x, H); c.stroke(); }
      c.restore();
      c.strokeStyle = "rgba(170,178,176,0.7)"; c.lineWidth = Math.min(W, H) * 0.05;
      c.beginPath();
      if (d.hex) { c.moveTo(W * 0.22, 0); c.lineTo(W * 0.78, 0); c.lineTo(W, H / 2); c.lineTo(W * 0.78, H); c.lineTo(W * 0.22, H); c.lineTo(0, H / 2); c.closePath(); }
      else c.rect(0, 0, W, H);
      c.stroke();
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

// `padre`: de quién cuelgan (por defecto, la raíz del dron; las de la
// catapulta, de su grupo, para que salgan y se vayan con ella).
export function montarDetalles(escena: Scene, raiz: Object3D, mallas: Mesh[], detalles: NonNullable<Maqueta["detalles"]>, radio: number, padre: Object3D = raiz) {
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
  const texturas = new Map<string, CanvasTexture>();

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
      // Las calcas iguales (los tornillos) comparten la textura.
      const clave = JSON.stringify([k.dibujo, k.tam]);
      let textura = texturas.get(clave);
      if (!textura) {
        textura = new CanvasTexture(dibujar(k.dibujo, k.tam[0], k.tam[1]));
        textura.colorSpace = SRGBColorSpace;
        textura.anisotropy = 4;
        texturas.set(clave, textura);
      }
      // La cinta americana brilla como el aluminio; el resto, mate. Sobre una
      // pintura muy mate (el negro del MICH), la calca, igual de mate: más
      // brillante, reflejaba el cielo y salía pastel. Con `mate`, igual de
      // mate aunque la pintura de debajo brille (lo negro del SIRTAP sobre el gris).
      const metal = k.dibujo.tipo === "cinta", cristal = k.dibujo.tipo === "ventana";
      const debajo = PINTURAS[(s.malla.userData.acabado as Acabado | undefined) ?? "negro"].rugosidad;
      const m = new MeshStandardMaterial({
        map: textura, transparent: true, depthWrite: false, roughness: metal ? 0.38 : cristal ? 0.15 : k.mate ? 0.82 : debajo > 0.7 ? debajo : 0.55, metalness: metal ? 0.55 : cristal ? 0.1 : 0,
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
      const malla = new Mesh(g, m);
      if (k.capa) malla.renderOrder = k.capa;
      grupo.add(malla);
      aDesechar.push(g, m, textura);
    }
  }

  // Dos juegos: las costuras de siempre y las claras (en un dron negro, las
  // juntas y los tornillos de metal se ven más claros que la pintura).
  const juegos = [false, true].map(() => ({ lineas: [] as number[], remaches: [] as number[] }));
  const puntos: Points[] = [];
  for (const k of detalles.costuras) {
    const { lineas, remaches } = juegos[k.claro ? 1 : 0];
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
  // Tornillos redondos y pequeños (los puntos de WebGL son cuadrados: se
  // recortan con un círculo).
  const circulo = document.createElement("canvas");
  circulo.width = circulo.height = 32;
  const c = circulo.getContext("2d")!;
  c.fillStyle = "#fff"; c.beginPath(); c.arc(16, 16, 14, 0, Math.PI * 2); c.fill();
  const mapa = new CanvasTexture(circulo);
  aDesechar.push(mapa);
  juegos.forEach(({ lineas, remaches }, claro) => {
    if (lineas.length) {
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(lineas, 3));
      // Finas: en las fotos, las juntas son casi solo un cambio de tono.
      const m = new LineBasicMaterial({ color: claro ? 0x6c7279 : 0x4a4f56, transparent: true, opacity: detalles.opacidad?.juntas ?? 0.22, ...sinTocarAlfa });
      grupo.add(new LineSegments(g, m));
      aDesechar.push(g, m);
    }
    if (remaches.length) {
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(remaches, 3));
      const m = new PointsMaterial({ color: claro ? 0xb4b9bf : 0x5a6068, size: 1.3, sizeAttenuation: false, transparent: true, opacity: detalles.opacidad?.tornillos ?? (claro ? 0.8 : 0.55), alphaMap: mapa, alphaTest: 0.3 });
      const p = new Points(g, m);
      puntos.push(p);
      grupo.add(p);
      aDesechar.push(g, m);
    }
  });
  // Colgadas de la raíz, conservando su sitio: así giran con el dron cuando se
  // inclina sobre su catapulta.
  padre.attach(grupo);
  return {
    // En el pixel, sin tornillos: a un píxel cada uno solo serían ruido.
    ver(si: boolean, conTornillos = true) {
      grupo.visible = si;
      for (const p of puntos) p.visible = conTornillos;
      nitidez.value = conTornillos ? 0 : 1;
    },
    dispose() { for (const d of aDesechar) d.dispose(); grupo.removeFromParent(); },
  };
}
