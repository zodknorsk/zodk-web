// Marte en WebGL (Proyecto Marte, rama mars-project): el mismo planeta que
// src/scripts/marte.js (misma luz, paleta, relieve y limpieza de píxeles
// sueltos), pintado en la tarjeta gráfica, con zoom.
//
// Por qué en la GPU (21-sep-2026): con zoom x4 el disco llena la pantalla y
// son ~850.000 píxeles de arte por fotograma, no ~150.000. Medido con el
// motor de marte.js (en Node, el motor de JS de Chrome): 35 ms por fotograma
// inclinando y 11 a los lados, sin contar el volcado; la animación del zoom
// rehace todo en cada fotograma. Para la GPU es trabajo de nada, y gasta
// mucho menos que el mismo cálculo en JavaScript. Quieto no se repinta.
//
// Zoom: el píxel de arte mide siempre lo mismo en pantalla (el de la Luna de
// /luna) y lo que crece es el radio del disco, R = RADIUS·zoom. Para que al
// acercarse haya más detalle hay una pirámide de mapas (generar-marte.py
// --canvas): la base de 4 px/grado entera (marte-mapa.png) y tres niveles
// finos, 8, 16 y 24 px/grado, en teselas de 360 x 360 celdas (n1/, n2/, n3/).
// Cada píxel lee del nivel cuya celda mide lo que él en latitud (derivadas en
// la GPU); si esa tesela aún no ha llegado, del nivel de debajo. Solo se
// bajan las teselas que se ven, y en la GPU van a un atlas de tamaño fijo. En longitud, hacia los polos, las celdas se agrupan
// (mipmaps en la base, como la Luna y la Tierra; columnas agrupadas en los
// niveles finos) para que el detalle no parpadee al girar.
//
// Tres pasadas por fotograma: (1) material y escalón de luz de cada píxel de
// arte a una textura; (2) dos pasadas de limpieza, como _limpiar() del
// generador; (3) color con la LUT y ampliación sin suavizado al canvas, que
// va a un múltiplo entero del arte (x3 como mucho) y lo demás lo amplía el
// CSS (el arreglo de la Luna y la Tierra para Zen, ver temperatura-zen.md).
//
// Lo usa logo-files/prototipo-marte/zoom.html. Detalle en logo-files/MARTE-WIP.md.
//
// También pinta la Luna (23-sep-2026, logo-files/LUNA-WIP.md): sus datos de
// generar-luna.py tienen el mismo formato (mapa de 1440 x 720 con material y
// normal, LUT por material y escalón de luz). Con `prefijo: "luna-"` se leen
// esos, y `luz(lat0, lon0)` da la luz de cada vista: fase y lado del sol,
// exposición (sube o baja todos los escalones) y tono frío (el bloque de la
// LUT: la Luna tiene FRIO_PASOS + 1 paletas, una debajo de otra).

import { MARTE_V } from "./marte.js";

const DEG = Math.PI / 180;
// Vista inicial de /marte: inclinada 12,5° al norte (21-sep-2026; era 10° y
// se probó 25°: el usuario la quiso con "no tanta inclinación, la mitad por lo
// menos") y con Tharsis en el centro. Es también la de marte-quieto.png y la
// del Marte pequeño de la portada (el vuelo empieza y acaba en ella).
export const VISTA_INICIAL = { lat0: 12.5, lon0: -80 };
// Decidido por el usuario: x4 "y vamos viendo" y luego x6 (21-sep-2026). El
// nivel más fino (24 px/grado) está hecho para x6: más allá solo se agrandaría.
const ZOOM_MAX = 6;

async function bitmap(url) {
  const blob = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.blob();
  });
  // Sin gestión de color: los mapas llevan índices y normales.
  return createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}
let lienzoLectura = null;
function pixels(bm) {
  lienzoLectura ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const c = lienzoLectura.canvas;
  if (c.width < bm.width || c.height < bm.height) { c.width = bm.width; c.height = bm.height; }
  lienzoLectura.clearRect(0, 0, bm.width, bm.height);
  lienzoLectura.drawImage(bm, 0, 0);
  return lienzoLectura.getImageData(0, 0, bm.width, bm.height).data;
}
// RGBA del mapa (R material, G/B normal en 0..63) -> un entero de 16 bits
// por celda: material << 12 | este << 6 | norte.
function empaqueta(px, n) {
  const out = new Uint16Array(n);
  for (let i = 0; i < n; i++) out[i] = (px[i * 4] << 12) | (px[i * 4 + 1] << 6) | px[i * 4 + 2];
  return out;
}

// ------------------------------------------------------------------ shaders
const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// (1) Material y escalón de luz. Mismas cuentas que calcular() de marte.js.
// `finos`: los niveles en teselas ({ ppd, fila0, kmax }); `A`: teselas por
// lado del atlas.
function fragCodigos(D, off, finos, A) {
  const f = (x) => (Number.isInteger(x) ? `${x}.0` : `${x}`);
  const NF = finos.length;
  const lista = (xs, conv) => xs.map(conv).join(", ");
  // Cortes entre niveles: a mitad de camino (en escala logarítmica) entre la
  // resolución de uno y la del siguiente.
  const ppd = [D.NIVELES[0].ppd, ...finos.map((n) => n.ppd)];
  const cortes = ppd.slice(1).map((p, i) => Math.log2(ppd[i] * p) / 2);
  return `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
uniform vec2 uTam;          // ancho y alto del arte
uniform float uR;           // radio del disco en píxeles de arte
uniform vec3 uM0, uM1, uM2; // vista -> Marte (filas de Ry(lon0)·Rx(lat0))
uniform vec3 uS;            // sol en vista
uniform float uExpoJ;       // exposición, en 1/LS de escalón (0 en Marte)
uniform int uJNoche;        // la sombra no pasa de la luz de noche (por la exposición)
uniform int uMatBase;       // fila de la LUT donde empieza la paleta (tono frío de la Luna)
uniform usampler2D uBase;   // nivel 0 y sus mipmaps en longitud, uno al lado del otro
uniform usampler2D uAtlas;  // teselas de los niveles finos que han llegado (A x A huecos)
uniform usampler2D uInd;    // por nivel fino y tesela: hueco del atlas + 1 (0 = no está)
uniform int uNivMax;        // 0 hasta que llega la primera tesela
out vec4 o;
const float PI = 3.141592653589793;
const float AA = ${f(D.LIMB_AA)};              // semiancho del suavizado del borde, en px de arte
const float NOCHE = ${f(D.NOCHE)}, TERM_A = ${f(D.TERM_A)}, TERM_B = ${f(D.TERM_B)}, LIMB_K = ${f(D.LIMB_K)};
const float INV_LN_LS = ${f(D.LIGHT_SUB / D.LNSTEP)}, REL_K = ${f(D.RELIEVE_K / D.LNSTEP)};
const float SIN_EM = ${f(Math.sin(D.RELIEVE_ELEV_MAX * DEG))}, COS_EM = ${f(Math.cos(D.RELIEVE_ELEV_MAX * DEG))};
const int REL_MIN = ${D.RELIEVE_MIN}, REL_MAX = ${D.RELIEVE_MAX}, SOMBRA_K = ${D.SOMBRA_K}, LS = ${D.LIGHT_SUB};
const int KMIN = ${D.LUT_KMIN * D.LIGHT_SUB}, KN = ${D.LUT_KN};
const int T = ${D.TESELA};
const int OFF[6] = int[6](${off.join(", ")});
const int NF = ${NF}, A = ${A};
const float PPD[${NF + 1}] = float[${NF + 1}](${lista(ppd, f)});
const float CORTE[${Math.max(1, NF)}] = float[${Math.max(1, NF)}](${NF ? lista(cortes, f) : "1e9"});  // (sin niveles finos, uno que no se alcanza: GLSL no admite listas vacías)
const int FILA0[${NF + 1}] = int[${NF + 1}](${lista([0, ...finos.map((n) => n.fila0)], String)});
const int KMAX[${NF + 1}] = int[${NF + 1}](${lista([5, ...finos.map((n) => n.kmax)], String)});
const float NQ = ${f((D.NORMAL_NIVELES - 1) / 2)};

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uTam) / uR;       // y hacia arriba
  float rr0 = dot(q, q), dc = sqrt(rr0);
  float rin = 1.0 - AA / uR, rout = 1.0 + AA / uR;
  // en el anillo de suavizado (y fuera) se lee el punto del borde
  float k0 = rr0 >= 0.9999 ? sqrt(0.9999 / rr0) : 1.0;
  vec3 U = vec3(q * k0, 0.0);
  U.z = sqrt(max(0.0, 1.0 - dot(U.xy, U.xy)));
  vec3 B = vec3(dot(uM0, U), dot(uM1, U), dot(uM2, U));
  float lat = asin(clamp(B.y, -1.0, 1.0));
  float lon = atan(B.x, B.z);
  // Huella del píxel en grados (derivadas: antes de cualquier rama).
  float dlat = max(abs(dFdx(lat)), abs(dFdy(lat))) / (PI / 180.0);
  vec2 dl = vec2(dFdx(lon), dFdy(lon));
  dl = mod(dl + PI, 2.0 * PI) - PI;                   // la costura de los 180°
  float dlon = max(abs(dl.x), abs(dl.y)) / (PI / 180.0);
  if (dc > rout) { o = vec4(0.0); return; }
  float latD = lat / (PI / 180.0), lonD = lon / (PI / 180.0);

  // Nivel: el de la celda más parecida al píxel en LATITUD. En longitud,
  // hacia los polos un píxel abarca varias celdas: se agrupan de 2 en 2, de
  // 4 en 4… (la de la izquierda de cada grupo, como los mipmaps de la base),
  // siempre en la misma rejilla del mapa, así que al girar no parpadea. Si el
  // nivel se eligiera también por la longitud, cerca del polo bajaría a la
  // base y saldrían bloques en abanico (probado el 21-sep-2026).
  // El que toca es el de resolución más parecida (en escala logarítmica) a
  // la que pide el píxel; si su tesela no está en el atlas, el de debajo.
  float fLat = log2(max(1e-6, 1.0 / dlat));        // px/grado que pide el píxel
  int niv = 0;
  for (int l = 0; l < NF; l++) if (fLat >= CORTE[l]) niv = l + 1;
  niv = min(niv, uNivMax);
  uint v = 0u;
  bool listo = false;
  for (int l = NF; l >= 1; l--) {
    if (listo || l > niv) continue;
    float p = PPD[l];
    int ancho = int(360.0 * p);
    int r = clamp(int((90.0 - latD) * p), 0, int(180.0 * p) - 1);
    int c = int((lonD + 180.0) * p) % ancho;
    int k = clamp(int(ceil(log2(max(1.0, dlon * p)) - 0.001)), 0, KMAX[l]);
    c = (c >> k) << k;
    uint h = texelFetch(uInd, ivec2(c / T, FILA0[l] + r / T), 0).r;
    if (h > 0u) {
      int s = int(h) - 1;
      v = texelFetch(uAtlas, ivec2((s % A) * T + c % T, (s / A) * T + r % T), 0).r;
      listo = true;
    }
  }
  if (!listo) {
    // base, con mipmap en longitud: celda al menos tan ancha como la huella
    int k = clamp(int(ceil(log2(max(1.0, dlon * 4.0)) - 0.001)), 0, 5);
    int r = clamp(int((90.0 - latD) * 4.0), 0, 719);
    int c = int((lonD + 180.0) * 4.0) % 1440;
    v = texelFetch(uBase, ivec2(OFF[k] + (c >> k), r), 0).r;
  }
  int m = int(v >> 12u);
  float ne = float((v >> 6u) & 63u) / NQ - 1.0, nn = float(v & 63u) / NQ - 1.0;

  // Luz: terminador, limbo y relieve en escalones de 1/LS (como el generador).
  float lamS = dot(U, uS);
  float bright = NOCHE + (1.0 - NOCHE) * smoothstep(TERM_A, TERM_B, lamS);
  float limb = 1.0 - LIMB_K * smoothstep(0.75, 1.0, dc);
  int j = int(floor(log(max(bright, 1e-3)) * INV_LN_LS + log(limb) * INV_LN_LS + uExpoJ + 0.5));
  if (lamS > 0.0) {
    vec3 ax = uM1;                                      // norte de Marte en vista
    float cl = sqrt(max(0.0, 1.0 - B.y * B.y));
    vec3 E = cross(ax, U) / max(1e-6, cl), N = cross(U, E);
    float se = dot(uS, E), sn = dot(uS, N);
    float nu = sqrt(max(0.0, 1.0 - ne * ne - nn * nn));
    float lamL = ne * se + nn * sn + nu * lamS;
    int kRel = 0;
    if (lamL <= 0.0) kRel = SOMBRA_K;
    else if (lamS > 0.02) {
      float ratio;
      if (lamS > SIN_EM) {                              // relieve rasante
        float ch = COS_EM / max(1e-6, sqrt(se * se + sn * sn));
        ratio = max(ch * (ne * se + nn * sn) + nu * SIN_EM, 0.004) / SIN_EM;
      } else ratio = max(lamL, 0.004) / lamS;
      kRel = clamp(int(floor(log(ratio) * REL_K + 0.5)), REL_MIN, REL_MAX);
    }
    j += kRel * LS;
    j = max(j, uJNoche);
  }
  j = clamp(j - KMIN, 0, KN - 1);
  float cov = dc > rin ? 1.0 - smoothstep(rin, rout, dc) : 1.0;
  o = vec4(float(m + uMatBase) / 255.0, float(j) / 255.0, cov, 1.0);
}`;
}

// (2) Limpieza: como _limpiar() del generador (y marte.js).
const FRAG_LIMPIA = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uC;
uniform ivec2 uTam;
out vec4 o;
int cod(ivec2 p) {
  vec4 t = texelFetch(uC, p, 0);
  return t.a < 0.5 ? -1 : int(t.r * 255.0 + 0.5) * 256 + int(t.g * 255.0 + 0.5);
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 t = texelFetch(uC, p, 0);
  o = t;
  if (t.a < 0.5 || p.x < 1 || p.y < 1 || p.x >= uTam.x - 1 || p.y >= uTam.y - 1) return;
  int v = cod(p);
  int a = cod(p + ivec2(0, 1)), b = cod(p - ivec2(0, 1)), c = cod(p - ivec2(1, 0)), d = cod(p + ivec2(1, 0));
  if (a < 0 || b < 0 || c < 0 || d < 0 || v == a || v == b || v == c || v == d) return;
  int n = -1;
  if ((a == b && (a == c || a == d)) || (a == c && a == d)) n = a;
  else if (b == c && b == d) n = b;
  if (n >= 0) o = vec4(float(n / 256) / 255.0, float(n % 256) / 255.0, t.b, 1.0);
}`;

// (3) Color y ampliación al canvas.
const FRAG_COLOR = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uC;
uniform sampler2D uLut;
uniform vec2 uEscala;       // píxeles de arte por píxel del canvas
uniform vec3 uEspacio;
out vec4 o;
void main() {
  vec4 t = texelFetch(uC, ivec2(floor(gl_FragCoord.xy * uEscala)), 0);
  if (t.a < 0.5) { o = vec4(0.0); return; }
  vec3 col = texelFetch(uLut, ivec2(int(t.g * 255.0 + 0.5), int(t.r * 255.0 + 0.5)), 0).rgb;
  o = vec4(mix(uEspacio, col, t.b), 1.0);
}`;

function programa(gl, fs) {
  const sh = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "programa");
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const nombre = gl.getActiveUniform(p, i).name;
    u[nombre] = gl.getUniformLocation(p, nombre);
  }
  return { p, u };
}

function textura(gl, filtro = gl.NEAREST) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtro);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtro);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

// Orientación: filas de M = Ry(lon0)·Rx(lat0) (vista -> Marte), como
// orientacion() de luna.js.
function filas(lat0, lon0) {
  const a = lat0 * DEG, b = lon0 * DEG, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  return [[cb, -sb * sa, sb * ca], [0, ca, sa], [-sb, -cb * sa, cb * ca]];
}

// Monta Marte en `canvas` (WebGL2), que ocupa todo su contenedor, con el
// disco centrado. `disco()` da el diámetro del disco a zoom x1 en píxeles
// CSS. Devuelve { vista(), ponVista(lat0, lon0), ponZoom(z), zoom(factor,
// clientX, clientY), mueve(dx, dy), suelta(), medir(), desmontar() }, o null
// si el navegador no tiene WebGL2.
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, prefijo?: string, version?: number, lat0?: number, lon0?: number,
 *   disco?: () => number, alPintar?: () => void, ladoAtlas?: number, lut?: string | null,
 *   luz?: ((lat0: number, lon0: number) => { fase: number, lado: number, expo: number, frio: number }) | null,
 *   zoomMax?: number }} [opciones]
 */
export async function montarMarteGL(canvas, {
  base = "/marte/",
  lat0: lat0Ini = VISTA_INICIAL.lat0,
  lon0: lon0Ini = VISTA_INICIAL.lon0,
  disco = () => 0.6 * window.innerHeight,
  alPintar = () => {},
  ladoAtlas = 12,                                // huecos por lado del atlas (menos, para probar que se vacía bien)
  lut = null,                                    // otra LUT (URL), para comparar colores en el banco
  prefijo = "marte-",                            // "luna-" para la Luna
  version = MARTE_V,
  luz = null,                                    // la luz según la vista (la Luna); null: la fija de los datos
  zoomMax = ZOOM_MAX,
} = {}) {
  const gl = canvas.getContext("webgl2", {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false, powerPreference: "low-power",
  });
  if (!gl) return null;
  const v = `?v=${version}`;
  const [D, baseBm, lutBm] = await Promise.all([
    fetch(`${base}${prefijo}datos.json${v}`).then((r) => r.json()),
    bitmap(`${base}${prefijo}mapa.png${v}`),
    bitmap(lut ?? `${base}${prefijo}lut.png${v}`),
  ]);
  // La Luna no trae niveles finos (de momento) ni una luz fija.
  D.NIVELES ??= [{ ppd: 4, teselas: false }];
  D.TESELA ??= 360;
  const MW = D.MAPA_W, MH = D.MAPA_H, R0 = D.RADIUS, T = D.TESELA;
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  // Base y sus mipmaps en longitud (material: el de la izquierda del par;
  // normal: la media), uno al lado del otro en una sola textura.
  const off = [0];
  for (let k = 1; k < 6; k++) off.push(off[k - 1] + (MW >> (k - 1)));
  const anchoBase = off[5] + (MW >> 5);
  const base0 = empaqueta(pixels(baseBm), MW * MH);
  const atlas = new Uint16Array(anchoBase * MH);
  let nivel = base0, w = MW;
  for (let k = 0; k < 6; k++) {
    for (let r = 0; r < MH; r++) atlas.set(nivel.subarray(r * w, (r + 1) * w), r * anchoBase + off[k]);
    if (k === 5) break;
    const nw = w >> 1, sig = new Uint16Array(nw * MH);
    for (let r = 0; r < MH; r++) {
      for (let c = 0; c < nw; c++) {
        const p = nivel[r * w + 2 * c], q = nivel[r * w + 2 * c + 1];
        const e = (((p >> 6) & 63) + ((q >> 6) & 63) + 1) >> 1, n = ((p & 63) + (q & 63) + 1) >> 1;
        sig[r * nw + c] = (p & 0xf000) | (e << 6) | n;
      }
    }
    nivel = sig;
    w = nw;
  }
  const texBase = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, anchoBase, MH, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, atlas);
  const lp = pixels(lutBm);
  const texLut = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, lutBm.width, lutBm.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array(lp.buffer, lp.byteOffset, lutBm.width * lutBm.height * 4));

  // Niveles finos (en teselas). No se reserva en la GPU el mapa entero de
  // cada uno (el de 24 px/grado serían 75 MB): las teselas que llegan van a un
  // ATLAS de A x A huecos (37 MB con A = 12), y un índice dice en qué hueco
  // está cada tesela de cada nivel. Si se llena, sale la que lleva más tiempo
  // sin usarse. Una vista normal a x6 usa unas 20-40; mirando al polo, que se
  // ven todas las longitudes, unas 70.
  let fila0 = 0;
  const finos = D.NIVELES.map((n, i) => ({ ...n, niv: i })).filter((n) => n.teselas).map((n) => {
    const w = 360 * n.ppd, tc = w / T, tf = (180 * n.ppd) / T;
    let kmax = 0;                                 // cuántas veces se puede agrupar de 2 en 2 la longitud
    while (kmax < 8 && (w >> (kmax + 1)) << (kmax + 1) === w) kmax++;
    const nivel = { niv: n.niv, ppd: n.ppd, tc, tf, fila0, kmax, estado: new Map() };   // "F-C" -> "pedida" | "lista" | "fallo"
    fila0 += tf;
    return nivel;
  });
  const indW = Math.max(1, ...finos.map((n) => n.tc)), indH = Math.max(1, fila0);
  // cortes entre niveles, como en el shader
  const ppds = [D.NIVELES[0].ppd, ...finos.map((n) => n.ppd)];
  const cortes = ppds.slice(1).map((p, i) => Math.log2(ppds[i] * p) / 2);
  const A = Math.max(1, Math.min(ladoAtlas, Math.floor(gl.getParameter(gl.MAX_TEXTURE_SIZE) / T)));
  const huecos = [];                              // hueco -> { n, clave, f, c, uso }
  const libres = Array.from({ length: A * A }, (_, i) => A * A - 1 - i);
  let texAtlas = null;
  const texInd = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, indW, indH, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array(indW * indH));
  const vacia = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, 1, 1, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array(1));
  let usoAhora = 0;                               // marca de "vista actual" para saber qué se usa
  function guarda(n, f, c, datos) {
    if (!texAtlas) {
      texAtlas = textura(gl);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R16UI, A * T, A * T);
    }
    let h = libres.pop();
    if (h === undefined) {                        // lleno: fuera la que lleva más sin usarse
      h = 0;
      for (let i = 1; i < huecos.length; i++) if (huecos[i].uso < huecos[h].uso) h = i;
      // si todas están a la vista, la que llega es de una vista vieja: se tira
      if (huecos[h].uso >= usoAhora) return false;
      const viejo = huecos[h];
      viejo.n.estado.delete(viejo.clave);
      gl.bindTexture(gl.TEXTURE_2D, texInd);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, viejo.c, viejo.n.fila0 + viejo.f, 1, 1, gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array([0]));
    }
    huecos[h] = { n, clave: `${f}-${c}`, f, c, uso: usoAhora };
    gl.bindTexture(gl.TEXTURE_2D, texAtlas);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, (h % A) * T, Math.floor(h / A) * T, T, T, gl.RED_INTEGER, gl.UNSIGNED_SHORT, datos);
    gl.bindTexture(gl.TEXTURE_2D, texInd);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, c, n.fila0 + f, 1, 1, gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array([h + 1]));
    return true;
  }

  let progCod = programa(gl, fragCodigos(D, off, finos, A));
  const progLimpia = programa(gl, FRAG_LIMPIA);
  const progColor = programa(gl, FRAG_COLOR);
  const vao = gl.createVertexArray();

  // Luz de una vista: el sol en vista (x derecha, y arriba, z hacia quien
  // mira), la exposición en escalones, el suelo de la noche y la paleta.
  function luzDe(lat0v, lon0v) {
    const l = luz ? luz(lat0v, lon0v) : { fase: D.FASE, lado: D.LADO, expo: 1, frio: 0 };
    const fa = l.fase * DEG, sa = D.SOL_ARR * DEG;
    const S = [l.lado * Math.sin(fa) * Math.cos(sa), Math.sin(fa) * Math.sin(sa), Math.cos(fa)];
    const sn = Math.hypot(...S);
    const paso = D.FRIO_MAX > 0 ? Math.round(l.frio / D.FRIO_MAX * D.FRIO_PASOS) : 0;
    return {
      S: S.map((x) => x / sn),
      expoJ: Math.log(l.expo) * D.LIGHT_SUB / D.LNSTEP,
      jNoche: Math.round(Math.log(D.NOCHE * l.expo) / D.LNSTEP * D.LIGHT_SUB),
      matBase: paso * (D.MATERIALES ?? 0),
    };
  }

  let lat0 = lat0Ini, lon0 = lon0Ini, zoom = 1, zoomObj = 1, ancla = null, vivo = true;

  // --- Lienzo: W x H píxeles de arte (los que caben en el contenedor), dos
  // texturas de trabajo de ese tamaño y el canvas a un múltiplo entero.
  const MULT_MAX = 3;
  let W = 0, H = 0, px = 1;
  const trabajo = [textura(gl), textura(gl)];
  const fbos = trabajo.map((t) => {
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return f;
  });
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  function ajusta() {
    const r = canvas.parentElement.getBoundingClientRect();
    const d = disco();
    if (!(r.width > 0 && r.height > 0 && d > 0)) return false;
    px = d / (2 * R0);
    // Lienzo de arte de lado PAR: el centro del disco cae entre dos píxeles,
    // igual que en public/marte/marte-quieto.png (el vuelo desde la portada y el
    // fondo mientras carga), así que al cambiar de la imagen al lienzo no salta.
    const par = (n) => n + (n & 1);
    const nW = par(Math.ceil(r.width / px)), nH = par(Math.ceil(r.height / px));
    const dpr = window.devicePixelRatio || 1;
    const k = Math.min(MULT_MAX, Math.floor(px * dpr));
    canvas.style.width = `${nW * px}px`;
    canvas.style.height = `${nH * px}px`;
    // por debajo de x2, el tamaño exacto de pantalla (como la Luna)
    const cw = k >= 2 ? nW * k : Math.round(nW * px * dpr), ch = k >= 2 ? nH * k : Math.round(nH * px * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    if (nW !== W || nH !== H) {
      W = nW; H = nH;
      for (const t of trabajo) {
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
    }
    return true;
  }

  // --- Un fotograma.
  function pinta() {
    const M = filas(lat0, lon0), R = R0 * zoom;
    gl.bindVertexArray(vao);
    gl.disable(gl.BLEND);
    // (1) códigos
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0]);
    gl.viewport(0, 0, W, H);
    const u = progCod.u;
    gl.useProgram(progCod.p);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uM0, M[0]);
    gl.uniform3fv(u.uM1, M[1]);
    gl.uniform3fv(u.uM2, M[2]);
    const L = luzDe(lat0, lon0);
    gl.uniform3fv(u.uS, L.S);
    gl.uniform1f(u.uExpoJ, L.expoJ);
    gl.uniform1i(u.uJNoche, L.jNoche);
    gl.uniform1i(u.uMatBase, L.matBase);
    const unidad = (i, tex, loc) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, i); };
    unidad(0, texBase, u.uBase);
    unidad(1, texAtlas || vacia, u.uAtlas);
    unidad(2, texInd, u.uInd);
    gl.uniform1i(u.uNivMax, texAtlas ? finos.length : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // (2) limpieza: 0 -> 1 -> 0
    gl.useProgram(progLimpia.p);
    gl.uniform2i(progLimpia.u.uTam, W, H);
    for (let i = 0; i < 2; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1 - i]);
      unidad(0, trabajo[i], progLimpia.u.uC);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    // (3) color, al canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(progColor.p);
    unidad(0, trabajo[0], progColor.u.uC);
    unidad(1, texLut, progColor.u.uLut);
    gl.uniform2f(progColor.u.uEscala, W / canvas.width, H / canvas.height);
    gl.uniform3f(progColor.u.uEspacio, D.SPACE[0] / 255, D.SPACE[1] / 255, D.SPACE[2] / 255);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    alPintar();
  }

  // --- Qué punto de Marte cae en un punto de la pantalla. (x, y) en radios
  // del disco desde su centro, y hacia arriba. null fuera del disco.
  function geo(x, y, la0 = lat0, lo0 = lon0) {
    const rr = x * x + y * y;
    if (rr >= 1) return null;
    const U = [x, y, Math.sqrt(1 - rr)], M = filas(la0, lo0);
    const B = M.map((f) => f[0] * U[0] + f[1] * U[1] + f[2] * U[2]);
    return { lat: Math.asin(Math.max(-1, Math.min(1, B[1]))), lon: Math.atan2(B[0], B[2]) };
  }
  // Al revés: dónde cae en la pantalla el punto (lat, lon) de Marte, en
  // grados. Píxeles CSS desde el centro del disco (y hacia abajo) y `z`, cuánto
  // mira hacia quien mira (1 en el centro, 0 en el borde, negativo por
  // detrás). Lo usan los nombres de lugares, en una capa HTML sobre el lienzo.
  function proyecta(lat, lon) {
    const la = lat * DEG, lo = lon * DEG, cl = Math.cos(la);
    const B = [cl * Math.sin(lo), Math.sin(la), cl * Math.cos(lo)];
    const M = filas(lat0, lon0), k = R0 * zoom * px;
    const U = [0, 1, 2].map((i) => M[0][i] * B[0] + M[1][i] * B[1] + M[2][i] * B[2]);
    return { x: U[0] * k, y: -U[1] * k, z: U[2] };
  }
  // De píxeles CSS de la ventana a radios del disco.
  function aDisco(clientX, clientY, R = R0 * zoom) {
    const r = canvas.getBoundingClientRect();
    return [((clientX - r.left) / px - W / 2) / R, -((clientY - r.top) / px - H / 2) / R];
  }
  // Orientación (sin ladear) que deja el punto (lat, lon) de Marte bajo el
  // punto (x, y) del disco: la inclinación sale de que la latitud cuadre
  // (A·cos t + C·sen t = sen lat) y la longitud del centro, de la longitud
  // relativa. Si no hay solución exacta (sin ladear no siempre la hay), la
  // más cercana. De las dos inclinaciones posibles, la más cerca de la actual.
  function orientaPara(x, y, lat, lon) {
    const rr = x * x + y * y;
    if (rr >= 0.998) return null;
    const ux = x, uy = y, uz = Math.sqrt(1 - rr);
    const rho = Math.hypot(uy, uz), del = Math.atan2(uz, uy);
    const ac = Math.acos(Math.max(-1, Math.min(1, Math.sin(lat) / rho)));
    const cand = [del + ac, del - ac].map((t) => Math.atan2(Math.sin(t), Math.cos(t)))
      .filter((t) => Math.abs(t) <= Math.PI / 2 + 1e-9);
    if (!cand.length) return null;
    const t = cand.reduce((m, c) => (Math.abs(c - lat0 * DEG) < Math.abs(m - lat0 * DEG) ? c : m));
    const zz = -uy * Math.sin(t) + uz * Math.cos(t);
    return { lat0: t / DEG, lon0: (lon - Math.atan2(ux, zz)) / DEG };
  }

  // --- Teselas: cuáles hacen falta para lo que se ve. Se muestrea la pantalla
  // en una rejilla y, en cada punto del disco, se calcula el nivel igual que
  // el shader (huella de un píxel de arte en latitud).
  const EN_VUELO_MAX = 6;
  let enVuelo = 0, cola = [];
  function planifica() {
    if (!finos.length) return;
    const R = R0 * zoom, paso = 24, quiere = new Map();
    for (let sy = paso / 2; sy < H; sy += paso) {
      for (let sx = paso / 2; sx < W; sx += paso) {
        const x = (sx - W / 2) / R, y = -(sy - H / 2) / R;
        const g = geo(x, y), gx = geo(x + 1 / R, y), gy = geo(x, y + 1 / R);
        if (!g || !gx || !gy) continue;
        const dlat = Math.max(Math.abs(gx.lat - g.lat), Math.abs(gy.lat - g.lat)) / DEG;
        const fLat = Math.log2(1 / Math.max(1e-6, dlat));
        let niv = 0;
        cortes.forEach((k, l) => { if (fLat >= k) niv = l + 1; });
        if (niv < 1) continue;
        // y las de debajo, que son el respaldo mientras llega la fina (solo
        // hasta la primera que ya esté: con la fina puesta no hacen falta)
        for (let l = niv; l >= 1; l--) {
          const n = finos[l - 1];
          const f = Math.min(n.tf - 1, Math.floor((90 - g.lat / DEG) * n.ppd / T));
          const c = Math.floor(((g.lon / DEG + 180) * n.ppd) / T) % n.tc;
          const clave = `${n.niv}:${f}-${c}`;
          const d = x * x + y * y + (niv - l) * 4;
          if (!quiere.has(clave) || quiere.get(clave).d > d) quiere.set(clave, { n, f, c, d });
          if (n.estado.get(`${f}-${c}`) === "lista") break;
        }
      }
    }
    // Nunca más de las que caben en el atlas (las más centrales), y las que
    // están en uso no salen: si no, con más teselas a la vista que huecos,
    // unas echarían a otras y se bajarían y repintarían sin parar.
    const usadas = [...quiere.values()].sort((a, b) => a.d - b.d).slice(0, A * A);
    const enUso = new Set(usadas.map((t) => `${t.n.niv}:${t.f}-${t.c}`));
    usoAhora++;
    for (const hc of huecos) if (hc && enUso.has(`${hc.n.niv}:${hc.clave}`)) hc.uso = usoAhora;
    cola = usadas.filter((t) => !t.n.estado.has(`${t.f}-${t.c}`));
    baja();
  }
  function baja() {
    while (enVuelo < EN_VUELO_MAX && cola.length) {
      const t = cola.shift(), clave = `${t.f}-${t.c}`;
      if (t.n.estado.has(clave)) continue;
      t.n.estado.set(clave, "pedida");
      enVuelo++;
      bitmap(`${base}n${t.n.niv}/${clave}.png${v}`).then((bm) => {
        if (!vivo) return;
        if (guarda(t.n, t.f, t.c, empaqueta(pixels(bm), T * T))) {
          t.n.estado.set(clave, "lista");
          pide();
        } else t.n.estado.delete(clave);
      }).catch(() => t.n.estado.set(clave, "fallo")).finally(() => { enVuelo--; baja(); });
    }
  }

  // --- Bucle: solo mientras hay algo que pintar; como mucho 60 fotogramas por
  // segundo (el portátil del usuario va a 120 Hz). El zoom se acerca a su
  // objetivo con una curva suave (cada rueda o pellizco mueve el objetivo).
  const FPS = 60, TAU = 0.07;
  let raf = 0, sucio = false, ultimoHueco = -1, tAnt = 0, tPlan = 0;
  function bucle(ahora) {
    raf = 0;
    if (!vivo) return;
    let sigue = false;
    if (zoom !== zoomObj) {
      const dt = tAnt ? Math.min(0.1, (ahora - tAnt) / 1000) : 1 / FPS;
      zoom += (zoomObj - zoom) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(zoomObj - zoom) < zoomObj * 1e-3) zoom = zoomObj;
      if (ancla) {
        const o = orientaPara(ancla.x * ancla.z / zoom, ancla.y * ancla.z / zoom, ancla.lat, ancla.lon);
        if (o) { lat0 = o.lat0; lon0 = o.lon0; }
      }
      sucio = true;
      sigue = zoom !== zoomObj;
    }
    tAnt = sigue ? ahora : 0;
    const hueco = Math.floor(ahora / 1000 * FPS);
    if (sucio && hueco !== ultimoHueco) {
      ultimoHueco = hueco;
      sucio = false;
      pinta();
      if (ahora - tPlan > 120 || !sigue) { tPlan = ahora; planifica(); }
    }
    if (sucio || sigue) raf = requestAnimationFrame(bucle);
  }
  const pide = () => { sucio = true; if (!raf) raf = requestAnimationFrame(bucle); };

  function mueve(dx, dy) {
    // Píxeles CSS -> grados, como si se agarrara el globo por su centro: un
    // radio de disco arrastrado es un radián de giro (a cualquier zoom).
    const k = 180 / Math.PI / (R0 * zoom * px);
    lon0 -= dx * k;
    lat0 = Math.max(-90, Math.min(90, lat0 + dy * k));
    ancla = null;
    pide();
  }
  // Zoom hacia el cursor al ACERCARSE: el punto de Marte que hay bajo el
  // ratón se queda bajo el ratón (si el ratón está fuera del disco, hacia el
  // centro). Al ALEJARSE, hacia el centro y sin girar, como Google Earth:
  // mantener el punto bajo el ratón obliga a girar el globo cada vez más según
  // encoge, y con el ratón en una esquina acababa mirando al polo (probado el
  // 21-sep-2026: de lat0 29° a 83° en un solo alejamiento).
  function hazZoom(factor, clientX, clientY) {
    const nuevo = Math.max(1, Math.min(zoomMax, zoomObj * factor));
    if (nuevo === zoomObj) return;
    if (nuevo < zoomObj) ancla = null;
    else {
      const [x, y] = aDisco(clientX, clientY);
      const g = clientX == null ? null : geo(x, y);
      ancla = g ? { x, y, z: zoom, lat: g.lat, lon: g.lon } : null;
    }
    zoomObj = nuevo;
    pide();
  }

  const observa = new ResizeObserver(() => { if (ajusta()) pide(); });
  observa.observe(canvas.parentElement);
  if (ajusta()) { pinta(); planifica(); }
  const perdido = (e) => { e.preventDefault(); vivo = false; };
  canvas.addEventListener("webglcontextlost", perdido);
  // Quieto no se repinta, y si la pestaña está en segundo plano al pintar (p.
  // ej. /marte abierta en otra pestaña), Chrome descarta ese fotograma: Marte
  // no salía hasta tocarlo (22-sep-2026). Al volver a verse, se repinta.
  const alVerse = () => { if (document.visibilityState === "visible") pide(); };
  document.addEventListener("visibilitychange", alVerse);

  return {
    vista: () => {
      const n = finos.map((f) => [...f.estado.values()].filter((e) => e === "lista").length);
      return { lat0, lon0: ((lon0 + 540) % 360 + 360) % 360 - 180, zoom, teselas: n, huecos: A * A };
    },
    ponVista(la, lo) { lat0 = Math.max(-90, Math.min(90, la)); lon0 = lo; ancla = null; pide(); },
    // `ya`: sin el suavizado de la rueda (lo lleva quien llama, fotograma a
    // fotograma: el vuelo de vuelta a la Tierra).
    ponZoom(z, ya = false) {
      zoomObj = Math.max(1, Math.min(zoomMax, z));
      if (ya) zoom = zoomObj;
      ancla = null;
      pide();
    },
    // Banco de pruebas: cambia constantes de luz de marte-datos.json (p. ej.
    // { NOCHE: 0.28 }) sin regenerar nada; van en el shader, que se recompila.
    ajustaLuz(cambios) {
      Object.assign(D, cambios);
      progCod = programa(gl, fragCodigos(D, off, finos, A));
      pide();
    },
    zoom: hazZoom,
    proyecta,
    // Píxeles CSS que mide un grado de Marte en el centro del disco.
    pxGrado: () => R0 * zoom * px * DEG,
    mueve,
    suelta: () => { planifica(); },
    // Foto de la vista de ahora, en píxeles de arte: un lienzo de `lado` x
    // `lado` centrado en el disco (el de marte-quieto.png es de 450). La usa
    // el vuelo de vuelta a la Tierra, que así sale de Marte tal como se ha
    // dejado. Se pinta y se copia en el mismo paso: el lienzo WebGL no guarda
    // lo pintado una vez en pantalla (preserveDrawingBuffer: false).
    instantanea(lado) {
      pinta();
      const c = document.createElement("canvas");
      c.width = c.height = lado;
      const x = c.getContext("2d");
      x.imageSmoothingEnabled = false;
      const e = canvas.width / W;                  // px del lienzo por px de arte
      x.drawImage(canvas, (canvas.width - lado * e) / 2, (canvas.height - lado * e) / 2, lado * e, lado * e, 0, 0, lado, lado);
      return c;
    },
    // Banco de pruebas: ms de `n` fotogramas completos esperando a la GPU.
    medir(n = 20) {
      const t0 = performance.now();
      for (let i = 0; i < n; i++) { lon0 += 0.5; pinta(); }
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      lon0 -= 0.5 * n;
      pinta();
      return (performance.now() - t0) / n;
    },
    desmontar() {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      observa.disconnect();
      canvas.removeEventListener("webglcontextlost", perdido);
      document.removeEventListener("visibilitychange", alVerse);
    },
  };
}

// Zoom con la rueda del ratón y el trackpad sobre `zona`. En Chrome y Firefox
// el pellizco del trackpad llega como rueda con ctrlKey (y más fino: pasos
// pequeños), y el arrastre con dos dedos, como rueda normal. Safari manda el
// pellizco como eventos gesture*. En todos se anula lo que harían por
// defecto (scroll o el zoom de la página).
// En táctil (móvil, tableta), el pellizco con dos dedos: la distancia entre
// ellos es el zoom, hacia su punto medio. Mientras dura, `zona` lleva la
// clase `pellizcando` (la mano no gira con el primer dedo). En iOS llegan
// además gesture* con el mismo pellizco: se ignoran si hay dedos (si no, el
// zoom iría doble). Devuelve la función que lo desmonta.
// `soloCtrl` (la portada, que tiene página debajo): la rueda normal baja la
// página como siempre; solo el pellizco del trackpad (rueda con ctrlKey) o
// Ctrl + rueda acercan (usuario, 24-sep-2026).
/**
 * @param {HTMLElement} zona
 * @param {{ zoom: (factor: number, clientX?: number, clientY?: number) => void }} marte
 * @param {{ soloCtrl?: boolean }} [opciones]
 */
export function montarZoom(zona, marte, { soloCtrl = false } = {}) {
  const rueda = (e) => {
    if (soloCtrl && !e.ctrlKey) return;
    e.preventDefault();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;                // en líneas
    else if (e.deltaMode === 2) d *= window.innerHeight;
    // un golpe de rueda (100 px) = x1,28; el pellizco, más sensible
    const k = e.ctrlKey ? 0.012 : 0.0025;
    marte.zoom(Math.exp(-Math.max(-300, Math.min(300, d)) * k), e.clientX, e.clientY);
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
    if (separacion > 0 && d > 0) marte.zoom(d / separacion, x, y);
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
    marte.zoom(e.scale / escala, e.clientX, e.clientY);
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
