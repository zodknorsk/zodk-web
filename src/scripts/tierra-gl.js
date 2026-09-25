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
// `finos`: los niveles de zoom en teselas ({ ppd, fila0, kmax }, de
// generar-planeta-hero.py --nivel); `A`: teselas por lado del atlas.
function fragCodigos(D, off, lmax, finos, A) {
  const NF = finos.length;
  const lista = (xs, conv) => xs.map(conv).join(", ");
  // Cortes entre niveles: a mitad de camino (en escala logarítmica) entre la
  // resolución de uno y la del siguiente (como marte-gl.js).
  const ppd = [D.MW / 360, ...finos.map((n) => n.ppd)];
  const cortes = ppd.slice(1).map((p, i) => Math.log2(ppd[i] * p) / 2);
  return `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
uniform vec2 uTam;          // ancho y alto del arte
uniform float uR;           // radio del disco en píxeles de arte
uniform vec3 uM0, uM1, uM2; // vista -> Tierra (filas de Ry(lon0)·Rx(lat0))
uniform vec3 uS;            // sol en vista
uniform usampler2D uMapa;   // nivel 0 (filas 0..MH-1) y mipmaps 1..LMAX en fila (filas MH..2MH-1)
uniform float uSuelo;       // luz de la cara sin sol: NIGHT de día, N_NIGHT a la luz de la luna
uniform usampler2D uAtlas;  // teselas de los niveles de zoom que han llegado (A x A huecos)
uniform usampler2D uInd;    // por nivel y tesela: hueco del atlas + 1 (0 = no está)
uniform int uNivMax;        // 0 hasta que llega la primera tesela
out vec4 o;
const float PI = 3.141592653589793;
const float AA = ${f(D.LIMB_AA)};
const float TERM_A = ${f(D.TERM_A)}, TERM_B = ${f(D.TERM_B)}, LIMB_K = ${f(D.LIMB_K)};
const float INV_LN_LS = ${f(D.LIGHT_SUB / D.LNSTEP)};
const int KMIN = ${D.LUT_KMIN * D.LIGHT_SUB}, KN = ${D.LUT_KN};
const int MW = ${D.MW}, MH = ${D.MH}, LMAX = ${lmax};
const int OFF[${lmax + 1}] = int[${lmax + 1}](${off.join(", ")});
const int T = ${D.TESELA ?? 360}, NF = ${NF}, A = ${A};
const float PPD[${NF + 1}] = float[${NF + 1}](${lista(ppd, f)});
const float CORTE[${Math.max(1, NF)}] = float[${Math.max(1, NF)}](${NF ? lista(cortes, f) : "1e9"});
const int FILA0[${NF + 1}] = int[${NF + 1}](${lista([0, ...finos.map((n) => n.fila0)], String)});
const int KMAX[${NF + 1}] = int[${NF + 1}](${lista([0, ...finos.map((n) => n.kmax)], String)});

int escalon(float lam, float dc, float limbMul) {
  float bright = (uSuelo + (1.0 - uSuelo) * smoothstep(TERM_A, TERM_B, lam))
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
  // Huella del píxel en latitud y longitud (derivadas: antes de cualquier rama).
  float dlat = max(abs(dFdx(lat)), abs(dFdy(lat))) / (PI / 180.0);
  vec2 dl = vec2(dFdx(lon), dFdy(lon));
  dl = mod(dl + PI, 2.0 * PI) - PI;                   // la costura de los 180°
  float dlon = max(abs(dl.x), abs(dl.y)) / (PI / 180.0);
  float fx = dlon / 360.0 * float(MW);                // en celdas de la base
  if (dc > 1.0 + AA / uR) { o = vec4(0.0); return; }
  float latD = lat / (PI / 180.0), lonD = lon / (PI / 180.0);
  // Nivel de zoom: el de la celda más parecida al píxel en LATITUD (en
  // longitud, hacia los polos, las celdas se agrupan de 2 en 2, de 4 en 4…,
  // como en marte-gl.js). Si su tesela no ha llegado, el de debajo.
  float fLat = log2(max(1e-6, 1.0 / dlat));
  int niv = 0;
  for (int l = 0; l < NF; l++) if (fLat >= CORTE[l]) niv = l + 1;
  niv = min(niv, uNivMax);
  uint v = 0u;
  bool listo = false;
  for (int l = NF; l >= 1; l--) {
    if (listo || l > niv) continue;
    float p = PPD[l];
    int ancho = int(360.0 * p);
    int rf = clamp(int((90.0 - latD) * p), 0, int(180.0 * p) - 1);
    int cf = int((lonD + 180.0) * p) % ancho;
    int k = clamp(int(ceil(log2(max(1.0, dlon * p)) - 0.001)), 0, KMAX[l]);
    cf = (cf >> k) << k;
    uint h = texelFetch(uInd, ivec2(cf / T, FILA0[l] + rf / T), 0).r;
    if (h > 0u) {
      int s = int(h) - 1;
      v = texelFetch(uAtlas, ivec2((s % A) * T + cf % T, (s / A) * T + rf % T), 0).r;
      listo = true;
    }
  }
  if (!listo) {
    // la base, con mipmap en longitud: el texel al menos tan ancho como la huella
    int L = clamp(int(ceil(log2(max(fx, 1e-6)) - 0.001)), 0, LMAX);
    int r = clamp(int(floor((90.0 - latD) / 180.0 * float(MH))), 0, MH - 1);
    int c = int(floor((lonD + 180.0) / 360.0 * float(MW))) % MW;
    v = texelFetch(uMapa, ivec2(OFF[L] + (c >> L), (L > 0 ? MH : 0) + r), 0).r;
  }
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

// (1d) Luces de las ciudades (noche): las de luces() de planeta.js, en la
// GPU. Cada ciudad deja su huella en una textura aparte, con mezcla aditiva:
// R = suma de todo, G = suma de núcleos (peso 1) y A = el halo más fuerte
// (mezcla MAX). La pasada de color saca de ahí el nivel de ámbar.
// La huella va agarrada al terreno: a x1 es la de planeta.js (HUELLA,
// HUELLA_R2 o HUELLA_GRANDE, según la fuerza) y con zoom crece con él, así
// cada ciudad ilumina siempre la misma superficie y lo que a x1 es amarillo
// lo sigue siendo al acercarse (usuario, 26-sep-2026: con la huella fija en
// píxeles, "la India a x1 está completamente amarilla pero si amplío se van
// reduciendo las luces"). Se pinta como anillos alrededor del centro, que a
// x1 dan justo las celdas de las tres huellas de planeta.js: núcleo, cruz a
// 1 (0,3), diagonales a 1,41 (0,15) y cruz a 2 (0,12); la grande, centrada
// entre sus 4 píxeles de núcleo, con anillos a 0,71 / 1,58 / 2,12 / 2,55.
const vertLuces = (D) => `#version 300 es
precision highp float;
layout(location = 0) in vec3 aLuz;      // latitud, longitud (radianes) y fuerza
uniform vec2 uTam;
uniform float uR, uZ;                   // radio del disco (px de arte) y zoom
uniform vec3 uM0, uM1, uM2;
flat out vec2 vCentro;                  // centro de la huella, px de arte (y abajo)
flat out float vA, vK;
flat out int vTipo;                     // 0 pequeña, 1 con anillo, 2 grande
const float LUZ_CORE2 = ${f(D.LUZ_CORE2)}, LUZ_R2_MIN = ${f(D.LUZ_R2_MIN)};
void main() {
  float cl = cos(aLuz.x);
  vec3 B = vec3(cl * sin(aLuz.y), sin(aLuz.x), cl * cos(aLuz.y));
  vec3 U = vec3(uM0.x * B.x + uM1.x * B.y + uM2.x * B.z,
                uM0.y * B.x + uM1.y * B.y + uM2.y * B.z,
                uM0.z * B.x + uM1.z * B.y + uM2.z * B.z);
  if (U.z <= 0.02) { gl_Position = vec4(2.0, 2.0, 0.0, 1.0); gl_PointSize = 1.0; return; }   // por detrás
  vA = aLuz.z * smoothstep(0.02, 0.25, U.z);                         // se apaga hacia el borde
  // Hacia el borde la perspectiva junta muchas ciudades en un píxel y las
  // sumas (todo y núcleos) hacían un canto brillante alrededor del disco (el
  // horizonte de antes no tenía borde a los lados): en las sumas, cada una
  // pesa lo que se ve de frente (U.z; en el centro del disco, casi 1). El
  // halo más fuerte (un máximo, no suma) no lo necesita.
  vK = min(1.0, U.z / 0.85);
  vTipo = aLuz.z >= LUZ_CORE2 ? 2 : aLuz.z >= LUZ_R2_MIN ? 1 : 0;
  vec2 c = floor(vec2(U.x * uR + 0.5 * uTam.x, -U.y * uR + 0.5 * uTam.y)) + (vTipo == 2 ? 1.0 : 0.5);
  vCentro = c;
  gl_PointSize = 2.0 * ceil(2.6 * uZ) + 4.0;
  gl_Position = vec4(c.x / uTam.x * 2.0 - 1.0, 1.0 - c.y / uTam.y * 2.0, 0.0, 1.0);
}`;
const FRAG_LUCES = `#version 300 es
precision highp float;
flat in vec2 vCentro;
flat in float vA, vK;
flat in int vTipo;
uniform vec2 uTam;
uniform float uZ;
out vec4 o;
void main() {
  vec2 p = vec2(gl_FragCoord.x, uTam.y - gl_FragCoord.y);      // centro del píxel, y abajo
  float d = length(p - vCentro) / uZ;
  float w;
  if (vTipo == 2) w = d < 1.0 ? 1.0 : d < 1.8 ? 0.3 : d < 2.3 ? 0.15 : d < 2.7 ? 0.12 : 0.0;
  else w = d < 0.5 ? 1.0 : d < 1.2 ? 0.3 : d < 1.6 ? 0.15 : (vTipo == 1 && d < 2.1) ? 0.12 : 0.0;
  if (w == 0.0) discard;
  o = w == 1.0 ? vec4(vA * vK, vA * vK, 0.0, 0.0) : vec4(vA * w * vK, 0.0, 0.0, vA * w);
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
uniform vec3 uAtmo;         // halo del borde: ATMO de día, N_ATMO de noche
uniform vec3 uNube[5];      // tonos de las nubes: C_NUBE / C_NUBE_NOCHE
uniform float uGlow;        // 1 de noche: brillo de atmósfera en el borde
uniform sampler2D uLuces;   // luces de las ciudades (1d); solo de noche
uniform int uConLuces;
out vec4 o;
const float AA = ${f(D.LIMB_AA)};
const float LUZ_UMB[${D.LUZ_UMBRAL.length}] = float[${D.LUZ_UMBRAL.length}](${D.LUZ_UMBRAL.map(f).join(", ")});
const vec3 LUZ_COL[${D.LUZ_RAMPA.length}] = vec3[${D.LUZ_RAMPA.length}](${D.LUZ_RAMPA.map((r) => c3(r[0])).join(", ")});
const float LUZ_T[${D.LUZ_RAMPA.length}] = float[${D.LUZ_RAMPA.length}](${D.LUZ_RAMPA.map((r) => f(r[1])).join(", ")});
const vec3 LUZ_SUAVE = vec3(1.0, 0.75, 0.36);          // ámbar claro del halo (nivel 2)
int nivelLuz(float v) {
  int l = 0;
  for (int i = 0; i < ${D.LUZ_UMBRAL.length}; i++) if (v >= LUZ_UMB[i]) l = i + 1;
  return l;
}
const vec3 ESPACIO = ${c3(D.SPACE)};
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
    o = vec4(mix(ESPACIO, uNube[k], tt), 1.0);
    return;
  }
  int m = int(t.r * 255.0 + 0.5) + g * 256, j = int(t.b * 255.0 + 0.5);
  bool sombra = j >= 128;                             // bajo la sombra de una chapa
  j &= 127;
  vec3 col = texelFetch(uLut, ivec2(j, m), 0).rgb;
  if (sombra) col = floor(col * 255.0 / 2.0) / 255.0 + vec3(0.0, 0.0, 6.0 / 255.0);
  if (uConLuces == 1) {                               // luces de las ciudades, bajo nubes y chapas
    vec4 lz = texelFetch(uLuces, p, 0);
    int lv = max(nivelLuz(max(lz.a, lz.g)), min(${D.LUZ_SUMA_MAX}, nivelLuz(lz.r)));
    // Los dos niveles flojos: con el ámbar oscuro de LUZ_RAMPA el suelo
    // azulado de la noche se volvía marrón, "quemado" (usuario, 26-sep-2026).
    // Se probaron sumar luz, mezclar con ámbar claro y quitar el velo; eligió
    // quitar el velo (nivel 1: nada) y el halo (nivel 2) con ámbar claro al
    // 50 %. Los fuertes, como en planeta.js.
    if (lv > 2) col = mix(col, LUZ_COL[lv - 1], LUZ_T[lv - 1]);
    else if (lv == 2) col = mix(col, LUZ_SUAVE, 0.5);
    col = floor(col * 255.0 + 0.5) / 255.0;
  }
  // Halo de atmósfera y borde suavizado, como el "post" de planeta.js.
  vec2 q = (vec2(p) + 0.5 - 0.5 * uTam) / uR;
  float dc = length(q);
  if (dc > 0.93) {
    vec2 qb = dc >= 0.99995 ? q * (0.99995 / dc) : q;
    vec3 U = vec3(qb, sqrt(max(0.0, 1.0 - dot(qb, qb))));
    float lam = dot(U, uS);
    if (lam > 0.0) {
      float a = 0.3 * floor(smoothstep(0.93, 1.0, dc) * smoothstep(0.0, 0.45, lam) * 4.0 + 0.5) / 4.0;
      col = mix(col, uAtmo, a);
    }
    // Brillo de atmósfera de noche (airglow), como planeta.js: la franja de
    // AIRGLOW_PX píxeles de arte junto al borde, alrededor de todo el disco.
    if (uGlow > 0.5) {
      float dpx = (1.0 - dc) * uR;
      float g = dpx < ${f(D.AIRGLOW_PX[0])} ? ${f(D.AIRGLOW_A[0])} : dpx < ${f(D.AIRGLOW_PX[1])} ? ${f(D.AIRGLOW_A[1])} : 0.0;
      col = mix(col, ${c3(D.AIRGLOW)}, g);
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
    // las listas (uNube[5]) llegan como "uNube[0]": se guardan sin el [0]
    const nombre = gl.getActiveUniform(p, i).name;
    u[nombre.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, nombre);
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
 *   banderas?: string[] | null, pausado?: () => boolean, noche?: boolean, sinNubes?: boolean,
 *   ladoAtlas?: number }} [opciones]
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
  noche: nocheIni = false,                       // a la luz de la luna (el tema oscuro); se cambia con ponNoche
  sinNubes = false,                              // sin nubes (la foto de tierra-quieto.png)
  ladoAtlas = 8,                                 // huecos por lado del atlas de teselas
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

  // Noche (Proyecto Tierra paso 7, en curso): la misma superficie con la LUT
  // de noche de generar-planeta-hero.py, la luna en vez del sol, el suelo de
  // la noche, el halo, las nubes de noche, las luces de las ciudades y el
  // brillo de atmósfera del borde. Sin aurora todavía. La LUT y las luces se bajan la
  // primera vez.
  let noche = false, texLutNoche = null, pidiendoNoche = null, luces = null;
  function cargaNoche() {
    pidiendoNoche ??= Promise.all([
      bitmap(`${base}planeta-lut-noche.png${v}`),
      bitmap(`${base}planeta-luces.png${v}`).catch(() => null),
    ]).then(([bm, lucesBm]) => {
      const px = pixels(bm);
      texLutNoche = textura(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, bm.width, bm.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(px.buffer, px.byteOffset, bm.width * bm.height * 4));
      if (lucesBm) luces = montaLuces(pixels(lucesBm));
    });
    return pidiendoNoche;
  }
  // Luces de las ciudades: planeta-luces.png lleva 2 píxeles por luz en filas
  // de LUZ_PNG_W luces (1º = latitud en 16 bits (R, G) + fuerza*16 (B), 2º =
  // longitud en 16 bits (R, G)), como en planeta.js. Un punto por ciudad, del
  // tamaño de su huella (ver vertLuces). Hace falta pintar en coma flotante
  // (EXT_color_buffer_float, lo tienen casi todos); sin él, la noche sale sin
  // luces.
  function montaLuces(d) {
    if (!gl.getExtension("EXT_color_buffer_float")) return null;
    const n = D.LUCES_N, lw = D.LUZ_PNG_W, datos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const o = (((i / lw) | 0) * lw * 2 + (i % lw) * 2) * 4;
      datos[i * 3] = (((d[o] << 8) | d[o + 1]) * 180 / 65535 - 90) * DEG;
      datos[i * 3 + 1] = (((d[o + 4] << 8) | d[o + 5]) * 360 / 65535 - 180) * DEG;
      datos[i * 3 + 2] = d[o + 2] / 16;
    }
    const va = gl.createVertexArray();
    gl.bindVertexArray(va);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    gl.bindVertexArray(null);
    const tex = textura(gl), fb = gl.createFramebuffer();
    return { va, n, tex, fb, prog: programa(gl, vertLuces(D), FRAG_LUCES), w: 0, h: 0 };
  }
  const aVec = (c) => c.map((x) => x / 255);
  const LUZ = {
    dia: { S: [D.SX, -D.SY, D.SZ], suelo: D.NIGHT, atmo: aVec(D.ATMO), nube: D.C_NUBE.flatMap(aVec) },
    noche: { S: [D.MX, -D.MY, D.MZ], suelo: D.N_NIGHT, atmo: aVec(D.N_ATMO), nube: D.C_NUBE_NOCHE.flatMap(aVec) },
  };
  const luz = () => (noche && texLutNoche ? LUZ.noche : LUZ.dia);

  // Niveles de zoom en teselas (como marte-gl.js): no se reserva en la GPU
  // el mapa entero de cada uno; las teselas que llegan van a un ATLAS de
  // A x A huecos y un índice dice en qué hueco está cada una. Si se llena,
  // sale la que lleva más tiempo sin usarse. A x6 se ven unas 10-20.
  const T = D.TESELA ?? 360;
  let fila0 = 0;
  const finos = (D.NIVELES ?? []).map((n, i) => ({ ...n, niv: i })).filter((n) => n.teselas).map((n) => {
    const w = 360 * n.ppd, tc = w / T, tf = (180 * n.ppd) / T;
    let kmax = 0;                                 // cuántas veces se puede agrupar de 2 en 2 la longitud
    while (kmax < 8 && (w >> (kmax + 1)) << (kmax + 1) === w) kmax++;
    const nivel = { niv: n.niv, ppd: n.ppd, tc, tf, fila0, kmax, estado: new Map() };   // "F-C" -> "pedida" | "lista" | "fallo"
    fila0 += tf;
    return nivel;
  });
  const ppds = [MW / 360, ...finos.map((n) => n.ppd)];
  const cortes = ppds.slice(1).map((p, i) => Math.log2(ppds[i] * p) / 2);
  const A = Math.max(1, Math.min(ladoAtlas, Math.floor(gl.getParameter(gl.MAX_TEXTURE_SIZE) / T)));
  const huecos = [];                              // hueco -> { n, clave, f, c, uso }
  const libres = Array.from({ length: A * A }, (_, i) => A * A - 1 - i);
  let texAtlas = null;
  const texInd = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, Math.max(1, ...finos.map((n) => n.tc)), Math.max(1, fila0), 0,
    gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array(Math.max(1, ...finos.map((n) => n.tc)) * Math.max(1, fila0)));
  const vacia = textura(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, 1, 1, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, new Uint16Array(1));
  let usoAhora = 0;
  function guarda(n, f, c, datos) {
    if (!texAtlas) {
      texAtlas = textura(gl);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R16UI, A * T, A * T);
    }
    let h = libres.pop();
    if (h === undefined) {                        // lleno: fuera la que lleva más sin usarse
      h = 0;
      for (let i = 1; i < huecos.length; i++) if (huecos[i].uso < huecos[h].uso) h = i;
      if (huecos[h].uso >= usoAhora) return false;   // todas a la vista: la que llega es de una vista vieja
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
  // Tesela (RGBA: material R + G*256, B = hielo) -> material | hielo << 15.
  const empaqueta = (px) => {
    const out = new Uint16Array(T * T);
    for (let i = 0; i < T * T; i++) out[i] = px[i * 4] | (px[i * 4 + 1] << 8) | (px[i * 4 + 2] ? 0x8000 : 0);
    return out;
  };

  const progCod = programa(gl, VERT, fragCodigos(D, off, LMAX, finos, A));
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

  // Sol (o luna) en vista (x derecha, y ARRIBA, z hacia quien mira): el de
  // los datos lleva la y hacia abajo. No cambia al girar ni al arrastrar: la
  // luz viene siempre del mismo lado, como en la portada de siempre.

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

  // --- Un fotograma, con la luz L. `mezcla` (0..1): se pinta ENCIMA de lo
  // que ya hay en el canvas con esa opacidad (el fundido de día a noche).
  function pintaCon(L, mezcla = null) {
    const M = filas(lat0, lon0), R = R0 * zoom, S = L.S;
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
    gl.uniform1f(u.uSuelo, L.suelo);
    unidad(0, texMapa, u.uMapa);
    unidad(1, texAtlas || vacia, u.uAtlas);
    unidad(2, texInd, u.uInd);
    gl.uniform1i(u.uNivMax, texAtlas ? finos.length : 0);
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
    if (!sinNubes) gl.drawArrays(gl.POINTS, 0, nCeldas);
    u = progSprites.u;
    gl.useProgram(progSprites.p);
    sprites(capaChapas, D.BAND_PZ, 1, 0);
    if (marca) sprites(capaX, 0.06, 0, 0);
    // (1d) luces de las ciudades, de noche
    const conLuces = L === LUZ.noche && luces !== null;
    if (conLuces) {
      if (luces.w !== W || luces.h !== H) {
        luces.w = W; luces.h = H;
        gl.bindTexture(gl.TEXTURE_2D, luces.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, W, H, 0, gl.RGBA, gl.HALF_FLOAT, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, luces.fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, luces.tex, 0);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, luces.fb);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      u = luces.prog.u;
      gl.useProgram(luces.prog.p);
      gl.uniform2f(u.uTam, W, H);
      gl.uniform1f(u.uR, R);
      gl.uniform3fv(u.uM0, M[0]);
      gl.uniform3fv(u.uM1, M[1]);
      gl.uniform3fv(u.uM2, M[2]);
      gl.uniform1f(u.uZ, zoom);
      gl.enable(gl.BLEND);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.MAX);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindVertexArray(luces.va);
      gl.drawArrays(gl.POINTS, 0, luces.n);
      gl.blendEquation(gl.FUNC_ADD);
      gl.disable(gl.BLEND);
    }
    // (2) color, al canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindVertexArray(vao);
    u = progColor.u;
    gl.useProgram(progColor.p);
    unidad(0, trabajo, u.uC);
    unidad(1, L === LUZ.noche ? texLutNoche : texLut, u.uLut);
    gl.uniform2f(u.uEscala, W / canvas.width, H / canvas.height);
    gl.uniform2f(u.uTam, W, H);
    gl.uniform1f(u.uR, R);
    gl.uniform3fv(u.uS, S);
    gl.uniform3fv(u.uAtmo, L.atmo);
    gl.uniform3fv(u.uNube, L.nube);
    gl.uniform1f(u.uGlow, L === LUZ.noche ? 1 : 0);
    unidad(2, conLuces ? luces.tex : trabajo, u.uLuces);
    gl.uniform1i(u.uConLuces, conLuces ? 1 : 0);
    if (mezcla !== null) {
      gl.enable(gl.BLEND);
      gl.blendColor(0, 0, 0, mezcla);
      gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND);
  }
  // Fundido al cambiar de tema (como el de planeta.js): durante FUNDIDO_MS se
  // pinta la Tierra con la luz vieja y encima con la nueva, cada vez más
  // opaca (el doble de trabajo, solo ese rato). Va a la par que el sol y la
  // luna que se esconden tras la Tierra (global.css, .hero-astro).
  const FUNDIDO_MS = 1500;
  let fundido = null;                            // { t0, desde: luz vieja }
  function pinta() {
    if (fundido) {
      const k = (performance.now() - fundido.t0) / FUNDIDO_MS;
      if (k >= 1) fundido = null;
      else {
        pintaCon(fundido.desde);
        pintaCon(luz(), k * k * (3 - 2 * k));
        alPintar();
        return;
      }
    }
    pintaCon(luz());
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
    const S = luz().S, l = U[0] * S[0] + U[1] * S[1] + U[2] * S[2];
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

  // --- Teselas: cuáles hacen falta para lo que se ve. Se muestrea la pantalla
  // en una rejilla y, en cada punto del disco, se calcula el nivel igual que
  // el shader (huella de un píxel de arte en latitud). Como marte-gl.js.
  const EN_VUELO_MAX = 6;
  let enVuelo = 0, cola = [];
  function planifica() {
    if (!finos.length) return;
    const R = R0 * zoom, paso = 24, quiere = new Map();
    for (let sy = paso / 2; sy < H; sy += paso) {
      for (let sx = paso / 2; sx < W; sx += paso) {
        const x = (sx - W / 2) / R, y = -(sy - H / 2) / R;
        const g = geoDisco(x, y), gx = geoDisco(x + 1 / R, y), gy = geoDisco(x, y + 1 / R);
        if (!g || !gx || !gy) continue;
        const dlat = Math.max(Math.abs(gx.lat - g.lat), Math.abs(gy.lat - g.lat)) / DEG;
        const fLat = Math.log2(1 / Math.max(1e-6, dlat));
        let niv = 0;
        cortes.forEach((k, l) => { if (fLat >= k) niv = l + 1; });
        if (niv < 1) continue;
        // y las de debajo, respaldo mientras llega la fina (solo hasta la primera que ya esté)
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
    // están en uso no salen.
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
        if (guarda(t.n, t.f, t.c, empaqueta(pixels(bm)))) {
          t.n.estado.set(clave, "lista");
          pide();
        } else t.n.estado.delete(clave);
      }).catch(() => t.n.estado.set(clave, "fallo")).finally(() => { enVuelo--; baja(); });
    }
  }

  // --- Bucle. El giro solo avanza la vista (lon0) de forma continua y se
  // repinta a 30 fotogramas por segundo, como la portada (a 90 s por vuelta,
  // 0,13° por fotograma: invisible, y la mitad de trabajo). La mano y el zoom
  // piden fotograma a 60. Quieto (parado o sin giro) no se repinta.
  const TAU = 0.07;
  let tPlan = 0;
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
    if (fundido) { sucio = true; sigue = true; }
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
      // qué teselas hacen falta: como mucho ~7 veces por segundo, y siempre
      // en el último fotograma (al acabar un zoom o un arrastre)
      if (ahora - tPlan > 150 || !(sucio || sigue)) { tPlan = ahora; planifica(); }
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
  if (nocheIni) { noche = true; await cargaNoche(); }
  if (ajusta()) { pinta(); planifica(); }
  arranca();
  const perdido = (e) => { e.preventDefault(); vivo = false; };
  canvas.addEventListener("webglcontextlost", perdido);
  // Si la pestaña está en segundo plano al pintar, Chrome descarta ese
  // fotograma (Marte, 22-sep-2026): al volver a verse, se repinta.
  const alVerse = () => { if (document.visibilityState === "visible") { tAnt = 0; pide(); } };
  document.addEventListener("visibilitychange", alVerse);
  reduce.addEventListener("change", pide);

  return {
    vista: () => ({
      lat0, lon0: ((lon0 + 540) % 360 + 360) % 360 - 180, zoom,
      teselas: finos.map((n) => [...n.estado.values()].filter((e) => e === "lista").length),
    }),
    ponVista(la, lo) { lat0 = Math.max(-90, Math.min(90, la)); lon0 = lo; ancla = null; pide(); },
    ponZoom(z, ya = false) {
      zoomObj = Math.max(1, Math.min(zoomMax, z));
      if (ya) zoom = zoomObj;
      ancla = null;
      pide();
    },
    zoom: hazZoom,
    mueve,
    suelta: () => { agarrado = false; tAnt = 0; planifica(); arranca(); },
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
    // Tema: a la luz de la luna (true) o del sol. De noche, en cuanto llega su
    // LUT (hasta entonces, de día).
    ponNoche(b) {
      if (b === noche) return;
      const antes = luz();
      noche = b;
      const empieza = () => {
        if (!reduce.matches && luz() !== antes) fundido = { t0: performance.now(), desde: antes };
        pide();
      };
      if (b && !texLutNoche) cargaNoche().then(empieza);   // de día hasta que llega la LUT: el fundido, después
      else empieza();
    },
    // Foto de la vista de ahora, en píxeles de arte: un lienzo de `lado` x
    // `lado` centrado en el disco (como la de marte-gl.js). Para la imagen
    // fija (tierra-quieto.png) y los vuelos. Se pinta y se copia en el mismo
    // paso: el lienzo WebGL no guarda lo pintado (preserveDrawingBuffer: false).
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
