// La Tierra entera en WebGL (Proyecto Tierra, rama earth-project): el mismo
// planeta que el <canvas> de la portada (src/scripts/planeta.js), con los
// mismos datos (public/planeta/, de logo-files/generar-planeta-hero.py), pero
// como disco completo que gira solo, se arrastra con la mano y se acerca, como
// Marte y la Luna (src/scripts/marte-gl.js, de donde sale el esqueleto).
//
// Por qué en la GPU: planeta.js precalcula qué celda del mapa cae en cada
// píxel porque la inclinación es fija y solo cambia el giro. Al arrastrar, la
// inclinación cambia en cada fotograma y ese precálculo no sirve; en la GPU se
// calcula todo en cada fotograma sin coste que se note (Marte, 21-sep-2026).
//
// Dos pasadas por fotograma, más las nubes: (1) material y escalón de luz de
// cada píxel de arte a una textura, con los mipmaps en longitud de planeta.js
// (al juntar celdas gana la de más prioridad: costa > tierra > mar); (1b) las
// nubes, puntos de un píxel de arte encima; (2) color con la LUT, halo de
// atmósfera y borde suavizado, y ampliación sin suavizado al canvas, a un
// múltiplo entero del arte (x3 como mucho, el arreglo para Zen).
//
// Lo usa logo-files/prototipo-tierra/giro.html. Detalle en
// logo-files/TIERRA-WIP.md.

import { PLANETA_V } from "./planeta.js";

const DEG = Math.PI / 180;
// Vista inicial: la inclinación del horizonte de antes (20° al norte) y el
// Atlántico con Europa y África.
export const VISTA_INICIAL = { lat0: 20, lon0: -10 };
// Radio del disco en píxeles de arte: 180 (el disco ocupa el 70 % del alto,
// el tamaño común de los astros). Con el píxel de Marte y la Luna serían 256;
// el usuario comparó los dos y prefirió el de 180, algo más grueso (24-sep-2026:
// "no veo mucha diferencia, pero la que pone radio 180 creo que mejor").
export const RADIO_ARTE = 180;

async function bitmap(url) {
  const blob = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.blob();
  });
  // Sin gestión de color: los mapas llevan índices.
  return createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}
function pixels(bm) {
  const c = document.createElement("canvas");
  c.width = bm.width;
  c.height = bm.height;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(bm, 0, 0);
  return x.getImageData(0, 0, bm.width, bm.height).data;
}

// ------------------------------------------------------------------ shaders
const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const f = (x) => (Number.isInteger(x) ? `${x}.0` : `${x}`);

// (1) Material y escalón de luz: las cuentas del precálculo de planeta.js,
// para una vista cualquiera. Sale R/G = material (bajo/alto), B = escalón,
// A = 1 dentro del disco.
function fragCodigos(D, off, lmax) {
  return `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
uniform vec2 uTam;          // ancho y alto del arte
uniform float uR;           // radio del disco en píxeles de arte
uniform vec3 uM0, uM1, uM2; // vista -> Tierra (filas de Ry(lon0)·Rx(lat0))
uniform vec3 uS;            // sol en vista
uniform usampler2D uMapa;   // nivel 0 (filas 0..MH-1) y mipmaps 1..LMAX en fila (filas MH..2MH-1)
out vec4 o;
const float PI = 3.141592653589793;
const float AA = ${f(D.LIMB_AA)};
const float NIGHT = ${f(D.NIGHT)}, TERM_A = ${f(D.TERM_A)}, TERM_B = ${f(D.TERM_B)}, LIMB_K = ${f(D.LIMB_K)};
const float INV_LN_LS = ${f(D.LIGHT_SUB / D.LNSTEP)};
const int KMIN = ${D.LUT_KMIN * D.LIGHT_SUB}, KN = ${D.LUT_KN};
const int MW = ${D.MW}, MH = ${D.MH}, LMAX = ${lmax};
const int OFF[${lmax + 1}] = int[${lmax + 1}](${off.join(", ")});

int escalon(float lam, float dc, float limbMul) {
  float bright = (NIGHT + (1.0 - NIGHT) * smoothstep(TERM_A, TERM_B, lam))
               * (1.0 - LIMB_K * smoothstep(0.72, 1.0, dc) * limbMul);
  int k = int(floor(log(max(bright, 1e-3)) * INV_LN_LS + 0.5));
  return clamp(k - KMIN, 0, KN - 1);
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uTam) / uR;       // y hacia arriba
  float rr0 = dot(q, q), dc = sqrt(rr0);
  float k0 = rr0 >= 0.9999 ? sqrt(0.9999 / rr0) : 1.0; // en el anillo del borde, el punto del borde
  vec3 U = vec3(q * k0, 0.0);
  U.z = sqrt(max(0.0, 1.0 - dot(U.xy, U.xy)));
  vec3 B = vec3(dot(uM0, U), dot(uM1, U), dot(uM2, U));
  float lat = asin(clamp(B.y, -1.0, 1.0));
  float lon = atan(B.x, B.z);
  // Huella del píxel en longitud (derivadas: antes de cualquier rama).
  vec2 dl = vec2(dFdx(lon), dFdy(lon));
  dl = mod(dl + PI, 2.0 * PI) - PI;                   // la costura de los 180°
  float fx = max(abs(dl.x), abs(dl.y)) / (2.0 * PI) * float(MW);   // en celdas
  if (dc > 1.0 + AA / uR) { o = vec4(0.0); return; }
  float latD = lat / (PI / 180.0), lonD = lon / (PI / 180.0);
  // Mipmap en longitud: el texel al menos tan ancho como la huella.
  int L = clamp(int(ceil(log2(max(fx, 1e-6)) - 0.001)), 0, LMAX);
  int r = clamp(int(floor((90.0 - latD) / 180.0 * float(MH))), 0, MH - 1);
  int c = int(floor((lonD + 180.0) / 360.0 * float(MW))) % MW;
  uint v = texelFetch(uMapa, ivec2(OFF[L] + (c >> L), (L > 0 ? MH : 0) + r), 0).r;
  int m = int(v & 0x7fffu);
  bool hielo = (v & 0x8000u) != 0u;                   // el limbo oscurece menos el hielo
  float lam = dot(U, uS);
  int j = escalon(lam, dc, hielo ? 0.7 : 1.0);
  o = vec4(float(m & 255) / 255.0, float(m >> 8) / 255.0, float(j) / 255.0, 1.0);
}`;
}

// (1b) Nubes: un punto de un píxel de arte por celda de cada plantilla, con
// las mismas cuentas que nubes() de planeta.js. Sale G = 64 + tono, B = luz.
const VERT_NUBES = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aGeo;      // latitud y longitud del centro de la nube (radianes)
layout(location = 1) in vec3 aCelda;    // desplazamiento desde el centro (px de arte, y abajo) y tono
uniform vec2 uTam;
uniform float uR;
uniform vec3 uM0, uM1, uM2;
uniform vec3 uS;
uniform float uTermA, uTermB;
flat out int vTono;
out float vLuz;
void main() {
  float cl = cos(aGeo.x);
  vec3 B = vec3(cl * sin(aGeo.y), sin(aGeo.x), cl * cos(aGeo.y));
  vec3 U = vec3(uM0.x * B.x + uM1.x * B.y + uM2.x * B.z,
                uM0.y * B.x + uM1.y * B.y + uM2.y * B.z,
                uM0.z * B.x + uM1.z * B.y + uM2.z * B.z);
  float bright = smoothstep(uTermA + 0.06, uTermB + 0.2, dot(U, uS));
  gl_PointSize = 1.0;
  vTono = int(aCelda.z);
  vLuz = 0.72 + 0.28 * bright;
  if (U.z <= 0.5 || bright < 0.12) { gl_Position = vec4(2.0, 2.0, 0.0, 1.0); return; }
  float cx = U.x * uR + 0.5 * uTam.x - 0.5, cy = -U.y * uR + 0.5 * uTam.y - 0.5;
  float x = floor(cx + aCelda.x * (0.72 + 0.28 * U.z) + 0.5), y = floor(cy + aCelda.y + 0.5);
  gl_Position = vec4((x + 0.5) / uTam.x * 2.0 - 1.0, 1.0 - (y + 0.5) / uTam.y * 2.0, 0.0, 1.0);
}`;
const FRAG_NUBES = `#version 300 es
precision highp float;
flat in int vTono;
in float vLuz;
out vec4 o;
void main() { o = vec4(0.0, float(64 + vTono) / 255.0, vLuz, 1.0); }`;

// (1c) Chapas de bandera, su sombra y la X de blanco: como las nubes, un
// punto por celda, clavado a un punto de la Tierra (chapasVisibles(),
// sombras(), chapas() y pintaMarca() de planeta.js). Las chapas y la X salen
// con G = 128 y R = color de la paleta (B = luz); la sombra solo suma 128 a
// B (mezcla aditiva sobre el azul), y la pasada de color la oscurece.
const VERT_SPRITES = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aGeo;      // latitud y longitud del punto (radianes)
layout(location = 1) in vec3 aCelda;    // desplazamiento (px de arte, y abajo) y color de la paleta
uniform vec2 uTam;
uniform float uR;
uniform vec3 uM0, uM1, uM2;
uniform vec3 uS;
uniform float uTermA, uTermB;
uniform float uPzMin;                   // no más cerca del borde que esto
uniform float uConLuz;                  // 1: el color se apaga hacia el terminador (chapas)
flat out int vCol;
out float vLuz;
void main() {
  float cl = cos(aGeo.x);
  vec3 B = vec3(cl * sin(aGeo.y), sin(aGeo.x), cl * cos(aGeo.y));
  vec3 U = vec3(uM0.x * B.x + uM1.x * B.y + uM2.x * B.z,
                uM0.y * B.x + uM1.y * B.y + uM2.y * B.z,
                uM0.z * B.x + uM1.z * B.y + uM2.z * B.z);
  float bright = smoothstep(uTermA + 0.06, uTermB + 0.2, dot(U, uS));
  gl_PointSize = 1.0;
  vCol = int(aCelda.z);
  vLuz = uConLuz > 0.5 ? 0.72 + 0.28 * bright : 1.0;
  if (U.z <= uPzMin || bright < 0.12) { gl_Position = vec4(2.0, 2.0, 0.0, 1.0); return; }
  float cx = U.x * uR + 0.5 * uTam.x - 0.5, cy = -U.y * uR + 0.5 * uTam.y - 0.5;
  float x = floor(cx + aCelda.x + 0.5), y = floor(cy + aCelda.y + 0.5);
  gl_Position = vec4((x + 0.5) / uTam.x * 2.0 - 1.0, 1.0 - (y + 0.5) / uTam.y * 2.0, 0.0, 1.0);
}`;
const FRAG_SPRITES = `#version 300 es
precision highp float;
flat in int vCol;
in float vLuz;
uniform int uSombra;
out vec4 o;
void main() {
  o = uSombra == 1 ? vec4(0.0, 0.0, 128.0 / 255.0, 0.0) : vec4(float(vCol) / 255.0, 128.0 / 255.0, vLuz, 1.0);
}`;

// (2) Color y ampliación al canvas.
function fragColor(D, paleta) {
  const c3 = (c) => `vec3(${c.map((x) => f(x / 255)).join(", ")})`;
  return `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uC;
uniform sampler2D uLut;
uniform vec2 uEscala;       // píxeles de arte por píxel del canvas
uniform vec2 uTam;
uniform float uR;
uniform vec3 uS;
out vec4 o;
const float AA = ${f(D.LIMB_AA)};
const vec3 ESPACIO = ${c3(D.SPACE)}, ATMO = ${c3(D.ATMO)};
const vec3 NUBE[5] = vec3[5](${D.C_NUBE.map(c3).join(", ")});
const vec3 PAL[${paleta.length}] = vec3[${paleta.length}](${paleta.map(c3).join(", ")});
void main() {
  ivec2 p = ivec2(floor(gl_FragCoord.xy * uEscala));
  vec4 t = texelFetch(uC, p, 0);
  if (t.a < 0.5) { o = vec4(0.0); return; }
  int g = int(t.g * 255.0 + 0.5);
  if (g >= 128) {                                     // chapa o X: color de la paleta, apagado hacia el terminador
    o = vec4(mix(ESPACIO, PAL[int(t.r * 255.0 + 0.5)], t.b), 1.0);
    return;
  }
  if (g >= 64) {                                      // nube: tono y luz (NUBE_T de planeta.js)
    int k = g - 64;
    float l = t.b;
    float tt = k < 2 ? min(1.0, l + 0.1) : k < 4 ? l : max(0.7, l);
    o = vec4(mix(ESPACIO, NUBE[k], tt), 1.0);
    return;
  }
  int m = int(t.r * 255.0 + 0.5) + g * 256, j = int(t.b * 255.0 + 0.5);
  bool sombra = j >= 128;                             // bajo la sombra de una chapa
  j &= 127;
  vec3 col = texelFetch(uLut, ivec2(j, m), 0).rgb;
  if (sombra) col = floor(col * 255.0 / 2.0) / 255.0 + vec3(0.0, 0.0, 6.0 / 255.0);
  // Halo de atmósfera y borde suavizado, como el "post" de planeta.js.
  vec2 q = (vec2(p) + 0.5 - 0.5 * uTam) / uR;
  float dc = length(q);
  if (dc > 0.93) {
    vec2 qb = dc >= 0.99995 ? q * (0.99995 / dc) : q;
    vec3 U = vec3(qb, sqrt(max(0.0, 1.0 - dot(qb, qb))));
    float lam = dot(U, uS);
    if (lam > 0.0) {
      float a = 0.3 * floor(smoothstep(0.93, 1.0, dc) * smoothstep(0.0, 0.45, lam) * 4.0 + 0.5) / 4.0;
      col = mix(col, ATMO, a);
    }
    float rin = 1.0 - AA / uR, rout = 1.0 + AA / uR;
    if (dc > rin) col = mix(ESPACIO, col, 1.0 - smoothstep(rin, rout, dc));
  }
  o = vec4(col, 1.0);
}`;
}

function programa(gl, vs, fs) {
  const sh = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
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

function textura(gl) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

// Orientación: filas de M = Ry(lon0)·Rx(lat0) (vista -> Tierra), como en
// marte-gl.js.
function filas(lat0, lon0) {
  const a = lat0 * DEG, b = lon0 * DEG, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  return [[cb, -sb * sa, sb * ca], [0, ca, sa], [-sb, -cb * sa, cb * ca]];
}

// Monta la Tierra en `canvas` (WebGL2), que ocupa todo su contenedor, con el
// disco centrado. `disco()` da el diámetro del disco a zoom x1 en píxeles CSS.
// Devuelve { vista(), ponVista(lat0, lon0), ponZoom(z), zoom(factor, clientX,
// clientY), mueve(dx, dy), suelta(), ponParado(b), parado(), proyecta(lat,
// lon), geo(clientX, clientY), medir(), desmontar() }, o null si el navegador
// no tiene WebGL2. `mueve` y `suelta` son para montarMano (marte.js) y `zoom`
// para montarZoom (marte-gl.js).
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, lat0?: number, lon0?: number, radio?: number, vuelta?: number,
 *   disco?: () => number, alPintar?: () => void, zoomMax?: number,
 *   banderas?: string[] | null, pausado?: () => boolean }} [opciones]
 */
export async function montarTierraGL(canvas, {
  base = "/planeta/",
  lat0: lat0Ini = VISTA_INICIAL.lat0,
  lon0: lon0Ini = VISTA_INICIAL.lon0,
  radio = RADIO_ARTE,
  vuelta = 90,                                   // segundos por vuelta (elegido por el usuario)
  disco = () => 0.7 * window.innerHeight,
  alPintar = () => {},
  banderas = null,                               // códigos iso de las chapas a pintar (null = todas)
  pausado = () => false,                         // no gira mientras dé true (en la portada: ratón sobre una chapa o una nave)
  zoomMax = 6,                                   // como Marte y la Luna (usuario, 24-sep-2026: "¿sería posible un x5 o x6?")
} = {}) {
  const gl = canvas.getContext("webgl2", {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false, powerPreference: "low-power",
  });
  if (!gl) return null;
  const v = `?v=${PLANETA_V}`;
  const [D, mapaBm, lutBm] = await Promise.all([
    fetch(`${base}planeta-datos.json${v}`).then((r) => r.json()),
    bitmap(`${base}planeta-mapa.png${v}`),
    bitmap(`${base}planeta-lut.png${v}`),
  ]);
  const MW = D.MW, MH = D.MH, R0 = radio;
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  // Mapa y mipmaps en longitud, como preparar() de planeta.js: material de
  // cada celda (R + G*256) con el bit 15 si es hielo; en cada nivel, de cada
  // par de celdas gana la de más prioridad, y desde el nivel 3 la costa ya no
  // gana (si no, los islotes árticos salpicaban el polo).
  const mp = pixels(mapaBm);
  const nivel0 = new Uint16Array(MW * MH);
  const hielo = new Uint8Array(D.MATERIALES);
  for (let i = 0; i < MW * MH; i++) {
    const m = mp[i * 4] | (mp[i * 4 + 1] << 8);
    nivel0[i] = m;
    if (mp[i * 4 + 2]) hielo[m] = 1;
  }
  const PRIO = Uint8Array.from(D.prio), PRIO_LO = PRIO.map((p) => Math.min(p, 1));
  let LMAX = 0;
  while (LMAX < 6 && MW % (2 << LMAX) === 0) LMAX++;
  const off = [0];
  const tex = new Uint16Array(MW * MH * 2);
  for (let i = 0; i < MW * MH; i++) tex[i] = nivel0[i] | (hielo[nivel0[i]] << 15);
  let prev = nivel0, pw = MW, x0 = 0;
  for (let L = 1; L <= LMAX; L++) {
    const w = pw >> 1, sig = new Uint16Array(w * MH), P = L >= 3 ? PRIO_LO : PRIO;
    for (let r = 0; r < MH; r++) {
      for (let c = 0; c < w; c++) {
        const a = prev[r * pw + 2 * c], b = prev[r * pw + 2 * c + 1];
        const m = P[b] > P[a] ? b : a;
        sig[r * w + c] = m;
        tex[(MH + r) * MW + x0 + c] = m | (hielo[m] << 15);
      }
    }
    off.push(x0);
    x0 += w;
    prev = sig;
    pw = w;
  }
  const texMapa = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, MW, MH * 2, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, tex);
  const lp = pixels(lutBm);
  const texLut = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, lutBm.width, lutBm.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array(lp.buffer, lp.byteOffset, lutBm.width * lutBm.height * 4));

  const progCod = programa(gl, VERT, fragCodigos(D, off, LMAX));
  const progNubes = programa(gl, VERT_NUBES, FRAG_NUBES);
  // Chapas de bandera (países del blog) y X de blanco. Sus colores van a una
  // paleta (pocos: los de las banderas, el contorno y la X).
  const paleta = [], color = new Map();
  const indice = (c) => {
    const k = c.join(",");
    if (!color.has(k)) { color.set(k, paleta.length); paleta.push(c); }
    return color.get(k);
  };
  const FLAGS = banderas ? D.banderas.filter((b) => banderas.includes(b.iso)) : D.banderas;
  const celdasChapas = [], celdasSombras = [];
  for (const b of FLAGS) {
    const la = b.lat * DEG, lo = b.lon * DEG;
    for (const [x, y, r, g, bl] of b.cells) celdasChapas.push(la, lo, x - b.ax, y - b.ay, indice([r, g, bl]));
    for (const [x, y] of b.sombra) celdasSombras.push(la, lo, x - b.ax, y - b.ay, 0);
  }
  // La X de marca: blanca con contorno oscuro, como la de planeta.js.
  const X_ART = ["#...#", "##.##", ".###.", "##.##", "#...#"], XN = X_ART.length;
  const celdasX = [];                            // sin la latitud y longitud: van al marcar
  const lleno = (y, x) => y >= 0 && y < XN && x >= 0 && x < XN && X_ART[y][x] === "#";
  for (let y = -1; y <= XN; y++) {
    for (let x = -1; x <= XN; x++) {
      let c = null;
      if (lleno(y, x)) c = y >= XN - 2 ? [214, 220, 228] : [246, 248, 250];
      else if (lleno(y - 1, x) || lleno(y + 1, x) || lleno(y, x - 1) || lleno(y, x + 1)) c = [16, 19, 28];
      if (c) celdasX.push([x - (XN >> 1), y - (XN >> 1), indice(c)]);
    }
  }
  function capa(datos) {
    const va = gl.createVertexArray();
    gl.bindVertexArray(va);
    const bu = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bu);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(datos), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
    gl.bindVertexArray(null);
    return { va, bu, n: datos.length / 5 };
  }
  const capaChapas = capa(celdasChapas), capaSombras = capa(celdasSombras);
  const capaX = capa([]);
  let marca = null;                              // { lat, lon } en grados
  const progSprites = programa(gl, VERT_SPRITES, FRAG_SPRITES);
  const progColor = programa(gl, VERT, fragColor(D, paleta));
  const vao = gl.createVertexArray();

  // Nubes: una celda por vértice. Se dibujan en orden inverso para que, donde
  // dos se pisan, gane la primera de la lista (como el `stamped` de planeta.js).
  const celdas = [];
  for (const nb of [...D.nubes].reverse()) {
    for (const [ox, oy, k] of nb.cells) {
      celdas.push(nb.lat * DEG, nb.lon * DEG, ox - nb.dw / 2, oy - nb.dh / 2, k);
    }
  }
  const nCeldas = celdas.length / 5;
  const vaoNubes = gl.createVertexArray();
  gl.bindVertexArray(vaoNubes);
  const bufNubes = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufNubes);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(celdas), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
  gl.bindVertexArray(null);

  // Sol en vista (x derecha, y ARRIBA, z hacia quien mira): el de los datos
  // lleva la y hacia abajo. No cambia al girar ni al arrastrar: la luz viene
  // siempre de arriba a la izquierda, como en la portada de siempre.
  const S = [D.SX, -D.SY, D.SZ];

  let lat0 = lat0Ini, lon0 = lon0Ini, zoom = 1, zoomObj = 1, ancla = null, vivo = true;
  let parado = false, agarrado = false, enVista = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // --- Lienzo: W x H píxeles de arte (los que caben en el contenedor), una
  // textura de trabajo de ese tamaño y el canvas a un múltiplo entero.
  const MULT_MAX = 3;
  let W = 0, H = 0, px = 1;
  const trabajo = textura(gl);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, trabajo, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  function ajusta() {
    const r = canvas.parentElement.getBoundingClientRect();
    const d = disco();
    if (!(r.width > 0 && r.height > 0 && d > 0)) return false;
    px = d / (2 * R0);
    const par = (n) => n + (n & 1);                // lado par: el centro del disco entre dos píxeles
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
      gl.bindTexture(gl.TEXTURE_2D, trabajo);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    return true;
  }

  // --- Un fotograma.
  function pinta() {
    const M = filas(lat0, lon0), R = R0 * zoom;
    const unidad = (i, t, loc) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, i); };
    gl.disable(gl.BLEND);
    // (1) códigos
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, W, H);
    gl.bindVertexArray(vao);
    let u = progCod.u;
    gl.useProgram(progCod.p);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uM0, M[0]);
    gl.uniform3fv(u.uM1, M[1]);
    gl.uniform3fv(u.uM2, M[2]);
    gl.uniform3fv(u.uS, S);
    unidad(0, texMapa, u.uMapa);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // (1b) nubes: aquí sus uniformes; se pintan después de las sombras de las chapas
    u = progNubes.u;
    gl.useProgram(progNubes.p);
    gl.bindVertexArray(vaoNubes);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uM0, M[0]);
    gl.uniform3fv(u.uM1, M[1]);
    gl.uniform3fv(u.uM2, M[2]);
    gl.uniform3fv(u.uS, S);
    gl.uniform1f(u.uTermA, D.TERM_A);
    gl.uniform1f(u.uTermB, D.TERM_B);
    // (1c) sombras de las chapas (antes que las nubes, que las tapan), chapas y X
    u = progSprites.u;
    gl.useProgram(progSprites.p);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uM0, M[0]);
    gl.uniform3fv(u.uM1, M[1]);
    gl.uniform3fv(u.uM2, M[2]);
    gl.uniform3fv(u.uS, S);
    gl.uniform1f(u.uTermA, D.TERM_A);
    gl.uniform1f(u.uTermB, D.TERM_B);
    const sprites = (c, pzMin, conLuz, sombra) => {
      if (!c.n) return;
      gl.uniform1f(u.uPzMin, pzMin);
      gl.uniform1f(u.uConLuz, conLuz);
      gl.uniform1i(u.uSombra, sombra);
      gl.bindVertexArray(c.va);
      gl.drawArrays(gl.POINTS, 0, c.n);
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.colorMask(false, false, true, false);
    sprites(capaSombras, D.BAND_PZ, 1, 1);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.BLEND);
    // las nubes, encima de las sombras y debajo de las chapas (como planeta.js)
    u = progNubes.u;
    gl.useProgram(progNubes.p);
    gl.bindVertexArray(vaoNubes);
    gl.drawArrays(gl.POINTS, 0, nCeldas);
    u = progSprites.u;
    gl.useProgram(progSprites.p);
    sprites(capaChapas, D.BAND_PZ, 1, 0);
    if (marca) sprites(capaX, 0.06, 0, 0);
    // (2) color, al canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindVertexArray(vao);
    u = progColor.u;
    gl.useProgram(progColor.p);
    unidad(0, trabajo, u.uC);
    unidad(1, texLut, u.uLut);
    gl.uniform2f(u.uEscala, W / canvas.width, H / canvas.height);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uS, S);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    alPintar();
  }

  // --- Qué punto de la Tierra cae en un punto del disco. (x, y) en radios
  // del disco desde su centro, y hacia arriba. null fuera del disco.
  function geoDisco(x, y, la0 = lat0, lo0 = lon0) {
    const rr = x * x + y * y;
    if (rr >= 1) return null;
    const U = [x, y, Math.sqrt(1 - rr)], M = filas(la0, lo0);
    const B = M.map((fl) => fl[0] * U[0] + fl[1] * U[1] + fl[2] * U[2]);
    return { lat: Math.asin(Math.max(-1, Math.min(1, B[1]))), lon: Math.atan2(B[0], B[2]) };
  }
  // Al revés: dónde cae en la pantalla el punto (lat, lon), en grados.
  // Píxeles CSS desde el centro del disco (y hacia abajo) y `z`, cuánto mira
  // hacia quien mira (1 en el centro, 0 en el borde, negativo por detrás).
  function proyecta(lat, lon) {
    const la = lat * DEG, lo = lon * DEG, cl = Math.cos(la);
    const B = [cl * Math.sin(lo), Math.sin(la), cl * Math.cos(lo)];
    const M = filas(lat0, lon0), k = R0 * zoom * px;
    const U = [0, 1, 2].map((i) => M[0][i] * B[0] + M[1][i] * B[1] + M[2][i] * B[2]);
    return { x: U[0] * k, y: -U[1] * k, z: U[2] };
  }
  // Punto (lat, lon) en grados -> en la vista (U, y arriba), su luz (como el
  // sombreado de las chapas y la X en el shader) y su sitio en píxeles de arte
  // (cx, cy, y abajo, del centro del píxel del que parten las celdas).
  function enVistaArte(lat, lon) {
    const la = lat * DEG, lo = lon * DEG, cl = Math.cos(la);
    const B = [cl * Math.sin(lo), Math.sin(la), cl * Math.cos(lo)];
    const M = filas(lat0, lon0), R = R0 * zoom;
    const U = [0, 1, 2].map((i) => M[0][i] * B[0] + M[1][i] * B[1] + M[2][i] * B[2]);
    const l = U[0] * S[0] + U[1] * S[1] + U[2] * S[2];
    const a = D.TERM_A + 0.06, b = D.TERM_B + 0.2, t = Math.max(0, Math.min(1, (l - a) / (b - a)));
    return { z: U[2], luz: t * t * (3 - 2 * t), cx: U[0] * R + W / 2 - 0.5, cy: -U[1] * R + H / 2 - 0.5 };
  }
  // Chapas que se ven ahora: { iso, x, y } con la esquina de arriba a la
  // izquierda de su contorno en píxeles CSS de la ventana (como las que daba
  // alMoverBanderas en planeta.js), y `px`, lo que mide un píxel de arte.
  function chapasVisibles() {
    const r = canvas.getBoundingClientRect(), out = [];
    for (const b of FLAGS) {
      const e = enVistaArte(b.lat, b.lon);
      if (e.z <= D.BAND_PZ || e.luz < 0.12) continue;
      const ox = Math.floor(e.cx - b.ax + 0.5), oy = Math.floor(e.cy - b.ay + 0.5);
      out.push({ iso: b.iso, x: r.left + (ox - 1) * px, y: r.top + (oy - 1) * px });
    }
    return out;
  }
  // De píxeles CSS de la ventana a radios del disco.
  function aDisco(clientX, clientY, R = R0 * zoom) {
    const r = canvas.getBoundingClientRect();
    return [((clientX - r.left) / px - W / 2) / R, -((clientY - r.top) / px - H / 2) / R];
  }
  // Orientación (sin ladear) que deja el punto (lat, lon) bajo el punto (x, y)
  // del disco: la de marte-gl.js, para el zoom hacia el cursor.
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

  // --- Bucle. El giro solo avanza la vista (lon0) de forma continua y se
  // repinta a 30 fotogramas por segundo, como la portada (a 90 s por vuelta,
  // 0,13° por fotograma: invisible, y la mitad de trabajo). La mano y el zoom
  // piden fotograma a 60. Quieto (parado o sin giro) no se repinta.
  const TAU = 0.07;
  let raf = 0, sucio = false, tAnt = 0, ultimo30 = -1, ultimo60 = -1;
  const quieto = () => parado || agarrado || !enVista || reduce.matches || document.visibilityState !== "visible";
  const gira = () => !quieto() && !pausado();
  function bucle(ahora) {
    raf = 0;
    if (!vivo) return;
    const dt = tAnt ? Math.min(0.1, (ahora - tAnt) / 1000) : 0;
    let sigue = false;
    if (zoom !== zoomObj) {
      zoom += (zoomObj - zoom) * (1 - Math.exp(-(dt || 1 / 60) / TAU));
      if (Math.abs(zoomObj - zoom) < zoomObj * 1e-3) zoom = zoomObj;
      if (ancla) {
        const o = orientaPara(ancla.x * ancla.z / zoom, ancla.y * ancla.z / zoom, ancla.lat, ancla.lon);
        if (o) { lat0 = o.lat0; lon0 = o.lon0; }
      }
      sucio = true;
      sigue = zoom !== zoomObj;
    }
    if (gira()) {
      // Con zoom el giro se ralentiza a la par: la superficie pasa por la
      // pantalla a la misma velocidad que a x1. Mientras el zoom va hacia el
      // cursor, manda el zoom (orientaPara fija la vista).
      if (zoom === zoomObj) lon0 -= 360 / vuelta * dt / zoom;
      sigue = true;
      const s30 = Math.floor(ahora / 1000 * 30);
      if (s30 !== ultimo30) { ultimo30 = s30; sucio = true; }
    } else if (!quieto()) sigue = true;            // pausado (ratón sobre una chapa): se sigue mirando

    tAnt = sigue ? ahora : 0;
    const s60 = Math.floor(ahora / 1000 * 60);
    if (sucio && s60 !== ultimo60) {
      ultimo60 = s60;
      sucio = false;
      pinta();
    }
    if (sucio || sigue) raf = requestAnimationFrame(bucle);
  }
  const pide = () => { sucio = true; if (!raf && vivo) raf = requestAnimationFrame(bucle); };
  const arranca = () => { if (!raf && vivo) raf = requestAnimationFrame(bucle); };

  function mueve(dx, dy) {
    // Píxeles CSS -> grados, como si se agarrara el globo por su centro: un
    // radio de disco arrastrado es un radián de giro (a cualquier zoom).
    const k = 180 / Math.PI / (R0 * zoom * px);
    lon0 -= dx * k;
    lat0 = Math.max(-90, Math.min(90, lat0 + dy * k));
    agarrado = true;
    ancla = null;
    pide();
  }
  // Zoom hacia el cursor al acercarse; al alejarse, hacia el centro (como
  // Marte, ver marte-gl.js).
  function hazZoom(factor, clientX, clientY) {
    const nuevo = Math.max(1, Math.min(zoomMax, zoomObj * factor));
    if (nuevo === zoomObj) return;
    if (nuevo < zoomObj) ancla = null;
    else {
      const [x, y] = aDisco(clientX, clientY);
      const g = clientX == null ? null : geoDisco(x, y);
      ancla = g ? { x, y, z: zoom, lat: g.lat, lon: g.lon } : null;
    }
    zoomObj = nuevo;
    pide();
  }

  const observa = new ResizeObserver(() => { if (ajusta()) pide(); });
  observa.observe(canvas.parentElement);
  const io = new IntersectionObserver(([e]) => { enVista = e.isIntersecting; arranca(); });
  io.observe(canvas);
  if (ajusta()) pinta();
  arranca();
  const perdido = (e) => { e.preventDefault(); vivo = false; };
  canvas.addEventListener("webglcontextlost", perdido);
  // Si la pestaña está en segundo plano al pintar, Chrome descarta ese
  // fotograma (Marte, 22-sep-2026): al volver a verse, se repinta.
  const alVerse = () => { if (document.visibilityState === "visible") { tAnt = 0; pide(); } };
  document.addEventListener("visibilitychange", alVerse);
  reduce.addEventListener("change", pide);

  return {
    vista: () => ({ lat0, lon0: ((lon0 + 540) % 360 + 360) % 360 - 180, zoom }),
    ponVista(la, lo) { lat0 = Math.max(-90, Math.min(90, la)); lon0 = lo; ancla = null; pide(); },
    ponZoom(z, ya = false) {
      zoomObj = Math.max(1, Math.min(zoomMax, z));
      if (ya) zoom = zoomObj;
      ancla = null;
      pide();
    },
    zoom: hazZoom,
    mueve,
    suelta: () => { agarrado = false; tAnt = 0; arranca(); },
    ponParado(b) { parado = b; tAnt = 0; arranca(); },
    parado: () => parado,
    proyecta,
    // Latitud y longitud (grados) del punto de la ventana (clientX, clientY),
    // o null fuera del disco.
    geo(clientX, clientY) {
      const g = geoDisco(...aDisco(clientX, clientY));
      return g && { lat: g.lat / DEG, lon: g.lon / DEG };
    },
    chapas: chapasVisibles,
    // Píxeles CSS que mide un píxel de arte.
    pxArte: () => px,
    // X de blanco en { lat, lon } (grados; null = quitarla). Gira con la Tierra.
    ponMarca(g) {
      marca = g;
      if (g) {
        const la = g.lat * DEG, lo = g.lon * DEG, datos = [];
        for (const [x, y, c] of celdasX) datos.push(la, lo, x, y, c);
        gl.bindBuffer(gl.ARRAY_BUFFER, capaX.bu);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(datos), gl.DYNAMIC_DRAW);
        capaX.n = celdasX.length;
      }
      pide();
    },
    // Dónde se ve ahora el centro de la X, en píxeles CSS de la ventana (null
    // si no hay o no se ve).
    posMarca() {
      if (!marca) return null;
      const e = enVistaArte(marca.lat, marca.lon);
      if (e.z <= 0.06 || e.luz < 0.12) return null;
      const r = canvas.getBoundingClientRect();
      return { x: r.left + (e.cx + 0.5) * px, y: r.top + (e.cy + 0.5) * px };
    },
    // Píxeles CSS que mide un grado en el centro del disco.
    pxGrado: () => R0 * zoom * px * DEG,
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
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", perdido);
      document.removeEventListener("visibilitychange", alVerse);
      reduce.removeEventListener("change", pide);
    },
  };
}
