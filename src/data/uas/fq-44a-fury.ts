// Maqueta del FQ-44A Fury de Anduril: el prototipo YFQ-44A 25-1003 («AI»,
// Unidad de Operaciones Experimentales del CCA), en Creech, julio de 2026,
// con un AIM-120 bajo el ala.
// La forma sale del interactivo de la web de Anduril (anduril.com/fury),
// medido con una cámara ortográfica propia: perfil, planta, frente y
// secciones del fuselaje cortadas en láminas de 2 cm (el modelo no se bajó;
// arte/uas-fuentes/fq-44a-fury/hd/). Su silueta encaja con la foto de perfil
// del 25-1003 con teleobjetivo. La escala, de dos fotos: el AIM-120 (3,65 m)
// bajo el ala del 25-1001 en vuelo y las ruedas dan unos 10,0 m de largo (las
// cifras de Blue Force, 6,1 m de largo y 5,2 de envergadura, son del diseño
// de 2023). Detalles, marcas y color, de las fotos de la Fuerza Aérea.
// Todo en metros; al final, a unidades de la maqueta (1 unidad = 2,5 m).
// Fotos a tamaño completo en arte/uas-fuentes/fq-44a-fury/ (fuera de Git;
// tabla en docs/drones/fq-44a-fury.md).
import type { Calca, Costura, Maqueta, Parte, Pieza, Seccion } from "./tipos";
import { bandera } from "../banderas.ts";

const ESCALA = 2.5;

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const DVIDS = "https://www.dvidshub.net/image/";

// Secciones del fuselaje, medidas en el interactivo (z hacia el morro, y = 0
// cerca de la arista) y corregidas con las fotos del 25-1003 (ver
// arte/uas-fuentes/fq-44a-fury/hd/secciones-a-ts.mjs): el lomo, más bajo; la
// arista, 4 cm más baja, y los bajos, de costados rectos y suelo plano (el
// interactivo los tenía en pendiente). Cada sección, en tres tramos con arista
// viva entre ellos: del lomo a la arista del costado; de la arista a la
// ranura que la separa del conducto de la toma (o, junto al ala y la cola,
// hasta donde nacen); y hasta la panza. Del morro (z 5,0) a la cola (z −5,0).
const PUNTA = { z: 5.0, y: -0.035 };
const SECCIONES: Seccion[] = [
  { z: PUNTA.z, ancho: 0, arriba: PUNTA.y, abajo: PUNTA.y, contorno: [[[0, PUNTA.y], [0, PUNTA.y]], [[0, PUNTA.y], [0, PUNTA.y]], [[0, PUNTA.y], [0, PUNTA.y]]] },
  { z: 4.954, ancho: 0.067, arriba: 0.014, abajo: -0.057, cintura: -0.035, contorno: [
      [[0, 0.014], [0.02, 0.011], [0.067, -0.035]],
      [[0.067, -0.035], [0.053, -0.044]],
      [[0.053, -0.044], [0, -0.057]],
  ] },
  { z: 4.781, ancho: 0.141, arriba: 0.08, abajo: -0.073, cintura: -0.038, contorno: [
      [[0, 0.08], [0.038, 0.073], [0.083, 0.039], [0.12, 0], [0.141, -0.038]],
      [[0.141, -0.038], [0.132, -0.041]],
      [[0.132, -0.041], [0.073, -0.063], [0, -0.073]],
  ] },
  { z: 4.455, ancho: 0.249, arriba: 0.19, abajo: -0.09, cintura: -0.043, contorno: [
      [[0, 0.19], [0.034, 0.187], [0.061, 0.178], [0.125, 0.131], [0.206, 0.037], [0.249, -0.043]],
      [[0.249, -0.043], [0.239, -0.046]],
      [[0.239, -0.046], [0.115, -0.078], [0, -0.09]],
  ] },
  { z: 4.129, ancho: 0.338, arriba: 0.3, abajo: -0.1, cintura: -0.051, contorno: [
      [[0, 0.3], [0.042, 0.297], [0.084, 0.283], [0.128, 0.253], [0.164, 0.218], [0.22, 0.153], [0.27, 0.084], [0.308, 0.019], [0.338, -0.051]],
      [[0.338, -0.051], [0.328, -0.053]],
      [[0.328, -0.053], [0.144, -0.087], [0, -0.1]],
  ] },
  { z: 3.694, ancho: 0.441, arriba: 0.42, abajo: -0.1, cintura: -0.04, contorno: [
      [[0, 0.42], [0.058, 0.413], [0.102, 0.398], [0.144, 0.373], [0.196, 0.328], [0.266, 0.249], [0.341, 0.144], [0.39, 0.064], [0.441, -0.04]],
      [[0.441, -0.04], [0.431, -0.042]],
      [[0.431, -0.042], [0.148, -0.089], [0, -0.1]],
  ] },
  { z: 3.259, ancho: 0.534, arriba: 0.53, abajo: -0.095, cintura: -0.035, contorno: [
      [[0, 0.53], [0.068, 0.522], [0.114, 0.507], [0.162, 0.482], [0.23, 0.425], [0.276, 0.373], [0.36, 0.259], [0.451, 0.115], [0.534, -0.035]],
      [[0.534, -0.035], [0.524, -0.036]],
      [[0.524, -0.036], [0.133, -0.087], [0, -0.095]],
  ] },
  { z: 2.825, ancho: 0.614, arriba: 0.59, abajo: -0.144, cintura: -0.024, contorno: [
      [[0, 0.59], [0.073, 0.583], [0.137, 0.562], [0.198, 0.527], [0.258, 0.477], [0.31, 0.421], [0.394, 0.31], [0.614, -0.024]],
      [[0.614, -0.024], [0.604, -0.027]],
      [[0.604, -0.027], [0.588, -0.032], [0.489, -0.04], [0.058, -0.097], [0.054, -0.126], [0.061, -0.133], [0, -0.144]],
  ] },
  { z: 2.499, ancho: 0.668, arriba: 0.598, abajo: -0.139, cintura: -0.024, contorno: [
      [[0, 0.598], [0.079, 0.591], [0.147, 0.572], [0.209, 0.538], [0.281, 0.481], [0.392, 0.355], [0.668, -0.024]],
      [[0.668, -0.024], [0.293, -0.064]],
      [[0.293, -0.064], [0.508, -0.068], [0.515, -0.076], [0.485, -0.084], [0.095, -0.132], [0, -0.139]],
  ] },
  { z: 2.168, ancho: 0.68, arriba: 0.6, abajo: -0.139, cintura: -0.023, contorno: [
      [[0, 0.6], [0.085, 0.593], [0.164, 0.566], [0.234, 0.523], [0.296, 0.472], [0.4, 0.354], [0.68, -0.023]],
      [[0.68, -0.023], [0.297, -0.063]],
      [[0.297, -0.063], [0.508, -0.068], [0.515, -0.076], [0.485, -0.084], [0.095, -0.132], [0, -0.139]],
  ] },
  { z: 1.878, ancho: 0.761, arriba: 0.62, abajo: -0.139, cintura: -0.018, contorno: [
      [[0, 0.62], [0.065, 0.617], [0.147, 0.599], [0.225, 0.563], [0.296, 0.512], [0.371, 0.443], [0.454, 0.352], [0.761, -0.018]],
      [[0.761, -0.018], [0.324, -0.062]],
      [[0.324, -0.062], [0.508, -0.067], [0.515, -0.075], [0.485, -0.083], [0.095, -0.132], [0, -0.139]],
  ] },
  { z: 1.847, ancho: 0.761, arriba: 0.62, abajo: -0.448, cintura: -0.018, contorno: [
      [[0, 0.62], [0.065, 0.617], [0.147, 0.599], [0.225, 0.563], [0.296, 0.512], [0.371, 0.443], [0.454, 0.352], [0.761, -0.018]],
      [[0.761, -0.018], [0.52, -0.034], [0.489, -0.038], [0.456, -0.063]],
      [[0.456, -0.063], [0.617, -0.068], [0.655, -0.073], [0.659, -0.083], [0.649, -0.132], [0.607, -0.143], [0.607, -0.421], [0.577, -0.448], [0, -0.448]],
  ] },
  { z: 1.521, ancho: 0.797, arriba: 0.635, abajo: -0.454, cintura: -0.018, contorno: [
      [[0, 0.635], [0.107, 0.624], [0.167, 0.606], [0.225, 0.578], [0.311, 0.519], [0.44, 0.396], [0.797, -0.018]],
      [[0.797, -0.018], [0.676, -0.023], [0.619, -0.058]],
      [[0.619, -0.058], [0.705, -0.068], [0.698, -0.098], [0.615, -0.109], [0.615, -0.427], [0.585, -0.454], [0, -0.454]],
  ] },
  { z: 1.195, ancho: 0.827, arriba: 0.65, abajo: -0.464, cintura: -0.013, contorno: [
      [[0, 0.65], [0.088, 0.643], [0.158, 0.625], [0.227, 0.593], [0.316, 0.533], [0.382, 0.478], [0.488, 0.372], [0.827, -0.013]],
      [[0.827, -0.013], [0.817, -0.014]],
      [[0.817, -0.014], [0.796, -0.018], [0.729, -0.058], [0.75, -0.063], [0.744, -0.077], [0.617, -0.088], [0.617, -0.436], [0.587, -0.464], [0, -0.464]],
  ] },
  { z: 0.869, ancho: 0.85, arriba: 0.66, abajo: -0.464, cintura: -0.013, contorno: [
      [[0, 0.66], [0.054, 0.657], [0.166, 0.629], [0.242, 0.593], [0.325, 0.537], [0.429, 0.449], [0.558, 0.32], [0.709, 0.154], [0.85, -0.013]],
      [[0.85, -0.013], [0.842, -0.019]],
      [[0.842, -0.019], [0.79, -0.058], [0.619, -0.069], [0.619, -0.436], [0.589, -0.464], [0, -0.464]],
  ] },
  { z: 0.543, ancho: 0.865, arriba: 0.67, abajo: -0.47, cintura: -0.007, contorno: [
      [[0, 0.67], [0.087, 0.658], [0.174, 0.631], [0.255, 0.589], [0.369, 0.51], [0.473, 0.421], [0.596, 0.3], [0.865, -0.007]],
      [[0.865, -0.007], [0.855, -0.007]],
      [[0.855, -0.007], [0.631, -0.018], [0.631, -0.442], [0.601, -0.47], [0, -0.47]],
  ] },
  { z: 0.217, ancho: 0.872, arriba: 0.68, abajo: -0.47, cintura: -0.007, contorno: [
      [[0, 0.68], [0.1, 0.663], [0.208, 0.62], [0.306, 0.563], [0.397, 0.496], [0.524, 0.387], [0.644, 0.269], [0.762, 0.136], [0.872, -0.007]],
      [[0.872, -0.007], [0.862, -0.007]],
      [[0.862, -0.007], [0.648, -0.018], [0.648, -0.442], [0.618, -0.47], [0, -0.47]],
  ] },
  { z: -0.109, ancho: 0.877, arriba: 0.68, abajo: -0.47, cintura: 0.047, contorno: [
      [[0, 0.68], [0.09, 0.663], [0.175, 0.63], [0.291, 0.568], [0.376, 0.511], [0.486, 0.427], [0.596, 0.326], [0.701, 0.217], [0.803, 0.094], [0.831, 0.071], [0.877, 0.047]],
      [[0.877, 0.047], [0.877, -0.069]],
      [[0.877, -0.069], [0.664, -0.08], [0.664, -0.442], [0.634, -0.47], [0, -0.47]],
  ] },
  { z: -0.543, ancho: 0.856, arriba: 0.675, abajo: -0.47, cintura: 0.058, contorno: [
      [[0, 0.675], [0.081, 0.664], [0.189, 0.621], [0.361, 0.515], [0.456, 0.444], [0.581, 0.334], [0.675, 0.239], [0.792, 0.101], [0.82, 0.077], [0.856, 0.058]],
      [[0.856, 0.058], [0.856, -0.099]],
      [[0.856, -0.099], [0.682, -0.11], [0.682, -0.442], [0.652, -0.47], [0, -0.47]],
  ] },
  { z: -0.978, ancho: 0.834, arriba: 0.67, abajo: -0.47, cintura: 0.041, contorno: [
      [[0, 0.67], [0.075, 0.658], [0.186, 0.615], [0.288, 0.557], [0.372, 0.5], [0.485, 0.41], [0.577, 0.323], [0.675, 0.218], [0.793, 0.07], [0.834, 0.041]],
      [[0.834, 0.041], [0.824, 0.04]],
      [[0.824, 0.04], [0.699, 0.03], [0.699, -0.442], [0.669, -0.47], [0, -0.47]],
  ] },
  { z: -1.412, ancho: 0.812, arriba: 0.665, abajo: -0.464, cintura: 0.014, contorno: [
      [[0, 0.665], [0.092, 0.648], [0.193, 0.61], [0.296, 0.553], [0.365, 0.504], [0.458, 0.428], [0.569, 0.317], [0.674, 0.192], [0.77, 0.053], [0.812, 0.014]],
      [[0.812, 0.014], [0.812, -0.116]],
      [[0.812, -0.116], [0.7, -0.127], [0.7, -0.436], [0.67, -0.464], [0, -0.464]],
  ] },
  { z: -1.847, ancho: 0.793, arriba: 0.66, abajo: -0.47, cintura: -0.024, contorno: [
      [[0, 0.66], [0.099, 0.648], [0.209, 0.609], [0.31, 0.551], [0.403, 0.479], [0.478, 0.407], [0.558, 0.315], [0.67, 0.16], [0.763, 0.005], [0.793, -0.024]],
      [[0.793, -0.024], [0.793, -0.108]],
      [[0.793, -0.108], [0.7, -0.119], [0.7, -0.442], [0.67, -0.47], [0, -0.47]],
  ] },
  { z: -2.282, ancho: 0.78, arriba: 0.645, abajo: -0.459, cintura: -0.062, contorno: [
      [[0, 0.645], [0.099, 0.638], [0.204, 0.609], [0.291, 0.566], [0.402, 0.481], [0.497, 0.376], [0.562, 0.29], [0.644, 0.162], [0.756, -0.047], [0.78, -0.062]],
      [[0.78, -0.062], [0.78, -0.101]],
      [[0.78, -0.101], [0.677, -0.112], [0.677, -0.432], [0.647, -0.459], [0, -0.459]],
  ] },
  { z: -2.608, ancho: 0.748, arriba: 0.63, abajo: -0.426, cintura: -0.094, contorno: [
      [[0, 0.63], [0.12, 0.618], [0.227, 0.585], [0.306, 0.542], [0.406, 0.463], [0.492, 0.368], [0.58, 0.246], [0.67, 0.085], [0.748, -0.094]],
      [[0.748, -0.094], [0.738, -0.095]],
      [[0.738, -0.095], [0.659, -0.104], [0.659, -0.399], [0.629, -0.426], [0, -0.426]],
  ] },
  { z: -2.934, ancho: 0.724, arriba: 0.615, abajo: -0.383, cintura: -0.103, contorno: [
      [[0, 0.615], [0.11, 0.604], [0.236, 0.562], [0.337, 0.501], [0.437, 0.413], [0.553, 0.274], [0.619, 0.167], [0.687, 0.018], [0.724, -0.103]],
      [[0.724, -0.103], [0.714, -0.104]],
      [[0.714, -0.104], [0.63, -0.114], [0.63, -0.356], [0.6, -0.383], [0, -0.383]],
  ] },
  { z: -3.259, ancho: 0.691, arriba: 0.6, abajo: -0.323, cintura: -0.095, contorno: [
      [[0, 0.6], [0.064, 0.573], [0.167, 0.547], [0.277, 0.497], [0.364, 0.439], [0.467, 0.346], [0.542, 0.261], [0.607, 0.164], [0.661, 0.038], [0.679, -0.019], [0.691, -0.095]],
      [[0.691, -0.095], [0.681, -0.096]],
      [[0.681, -0.096], [0.6, -0.106], [0.6, -0.295], [0.57, -0.323], [0, -0.323]],
  ] },
  { z: -3.585, ancho: 0.651, arriba: 0.57, abajo: -0.263, cintura: -0.034, contorno: [
      [[0, 0.57], [0.068, 0.568], [0.113, 0.541], [0.258, 0.485], [0.364, 0.419], [0.466, 0.333], [0.534, 0.258], [0.585, 0.18], [0.629, 0.071], [0.651, -0.034]],
      [[0.651, -0.034], [0.649, -0.098]],
      [[0.649, -0.098], [0.613, -0.114], [0.263, -0.223], [0.162, -0.244], [0, -0.263]],
  ] },
  { z: -3.911, ancho: 0.601, arriba: 0.535, abajo: -0.192, cintura: -0.042, contorno: [
      [[0, 0.535], [0.054, 0.533], [0.108, 0.494], [0.191, 0.469], [0.262, 0.439], [0.338, 0.396], [0.429, 0.328], [0.5, 0.256], [0.557, 0.162], [0.578, 0.094], [0.601, -0.042]],
      [[0.601, -0.042], [0.6, -0.052]],
      [[0.6, -0.052], [0.595, -0.091], [0.24, -0.162], [0, -0.192]],
  ] },
  { z: -4.237, ancho: 0.53, arriba: 0.5, abajo: -0.12, cintura: 0.067, contorno: [
      [[0, 0.5], [0.048, 0.498], [0.069, 0.485], [0.136, 0.473], [0.22, 0.447], [0.299, 0.414], [0.392, 0.355], [0.454, 0.296], [0.496, 0.228], [0.513, 0.173], [0.53, 0.067]],
      [[0.53, 0.067], [0.53, -0.068]],
      [[0.53, -0.068], [0.524, -0.074], [0, -0.12]],
  ] },
  { z: -4.563, ancho: 0.454, arriba: 0.47, abajo: -0.04, cintura: 0.055, contorno: [
      [[0, 0.47], [0.103, 0.459], [0.196, 0.437], [0.285, 0.401], [0.361, 0.352], [0.399, 0.312], [0.421, 0.277], [0.443, 0.188], [0.454, 0.055]],
      [[0.454, 0.055], [0.454, -0.037]],
      [[0.454, -0.037], [0, -0.04]],
  ] },
  { z: -4.781, ancho: 0.391, arriba: 0.45, abajo: 0.008, cintura: 0.141, contorno: [
      [[0, 0.45], [0.16, 0.448], [0.27, 0.406], [0.324, 0.369], [0.363, 0.322], [0.377, 0.29], [0.391, 0.141]],
      [[0.391, 0.141], [0.391, 0.011]],
      [[0.391, 0.011], [0, 0.008]],
  ] },
  { z: -4.954, ancho: 0.342, arriba: 0.44, abajo: 0.064, cintura: 0.072, contorno: [
      [[0, 0.44], [0.095, 0.431], [0.174, 0.412], [0.25, 0.379], [0.3, 0.341], [0.319, 0.317], [0.334, 0.284], [0.342, 0.072]],
      [[0.342, 0.072], [0.332, 0.072]],
      [[0.332, 0.072], [0, 0.064]],
  ] },
];
// La cola acaba recta, con la tobera arriba (ver TOBERA).
const COLA_Z = -4.99;

// Ala: borde de ataque en flecha que nace de la arista del costado, punta
// recta, borde de salida casi recto. Medidas del interactivo: la planta, y de
// frente, el grosor (18 cm en la raíz, 2,4 cm en la punta) y una caída de 1°.
// El perfil del motor es asimétrico (abajo, el 55 % de arriba): su grueso
// total es el 77,5 % de `grosor`.
const ALA = { y: -0.06, raiz: 0.7, punta: 3.029, baRaiz: 0.891, baPunta: -1.445, bsRaiz: -2.462, bsPunta: -1.94, tRaiz: 0.227, tPunta: 0.031, caida: -0.019 };
const xRaizBA = 0.891;
const bordeAtaque = (x: number) => (x <= xRaizBA ? 0 + (xRaizBA - x) * 0.676 : -((x - xRaizBA) * 1.445) / (ALA.punta - xRaizBA));
const bordeSalida = (x: number) => -2.466 + ((x - 0.75) * (2.466 - 1.94)) / (ALA.punta - 0.75);
const grosorAla = (x: number) => ALA.tRaiz + ((ALA.tPunta - ALA.tRaiz) * (x - ALA.raiz)) / (ALA.punta - ALA.raiz);
const caidaAla = (x: number) => (ALA.caida * (x - ALA.raiz)) / (ALA.punta - ALA.raiz);
const estAla = (x: number): [number, number, number, number, number] => [x, bordeAtaque(x), bordeSalida(x), grosorAla(x), caidaAla(x)];
// Mandos del ala, piezas aparte con su hueco: flap por dentro y alerón por
// fuera, de 20 cm de cuerda (líneas del interactivo, desde arriba).
const MANDO = { cuerda: 0.2, hueco: 0.006, flap: [0.86, 1.84], aleron: [1.86, 2.95] };
const bisagra = (x: number) => bordeSalida(x) + MANDO.cuerda;
const estAlaCorta = (x: number): [number, number, number, number, number] => [x, bordeAtaque(x), bisagra(x), grosorAla(x), caidaAla(x)];
const estMando = (x: number): [number, number, number, number, number] => [x, bisagra(x) - MANDO.hueco, bordeSalida(x), grosorAla(x) * 0.45, caidaAla(x) - grosorAla(x) * 0.06];

// Estabilizadores (de una pieza, giran enteros): planta del interactivo, a la
// altura del ala.
const ESTAB = { y: -0.02, raiz: 0.3, punta: 1.471, baPunta: -4.259, bsPunta: -4.607 };
const baEstab = (x: number) => -3.672 - ((x - 0.652) * (4.259 - 3.672)) / (ESTAB.punta - 0.652);
const bsEstab = (x: number) => -4.933 + ((x - 0.391) * (4.933 - 4.607)) / (ESTAB.punta - 0.391);

// Deriva: el borde de ataque recto desde el lomo y arriba plana a 1,91 m
// (interactivo, de lado). El borde de salida baja inclinado desde la esquina
// de arriba, sobre el final de la cola, hasta el lomo unos 35 cm más adelante
// (fotos de perfil del 25-1003 con teleobjetivo y al sol).
const DERIVA: [number, number][] = [[-2.95, 0.52], [-3.077, 0.61], [-3.259, 0.789], [-4.379, 1.893], [-4.976, 1.915], [-4.62, 0.44], [-3.7, 0.52]];

// ── Tren de aterrizaje (fotos de perfil con teleobjetivo y de frente) ──────
// Triciclo, de patas blancas. Las medidas, con la escala de cada foto: de
// perfil, 148,7 px/m (los 10 m del morro a la cola); de frente, 177,6 px/m
// (los 6,06 m entre las luces de las puntas).
const SUELO = -1.17;
const MORRO_TREN = { z: 1.34, r: 0.19 };
const PRINCIPAL = { x: 0.96, z: -0.93, r: 0.222, ancho: 0.13 };
const rMorro = SUELO + MORRO_TREN.r, rPrin = SUELO + PRINCIPAL.r;
// El pozo del tren de morro: detrás de la rueda cuelgan sus dos compuertas,
// en vertical, con los extremos achaflanados (un cajón de 1,15 m bajo la panza).
const PUERTA_MORRO = { x: 0.1, z0: 1.44, z1: 0.29, y0: -0.43, y1: -0.74, chaflan: 0.08 };
// El del principal, más atrás: compuertas blancas por dentro, remachadas.
const PUERTA_PRIN = { x: 0.36, z0: 0.25, z1: -0.95, y0: -0.43, y1: -0.72, chaflan: 0.06 };
const puerta = (id: string, q: typeof PUERTA_MORRO, acabado: Pieza["acabado"]): Pieza => ({
  tipo: "placa", id, acabado, plano: "vertical", x: q.x, grosor: 0.025, bisel: 0.006, espejo: true,
  planta: [[q.z0, q.y0], [q.z1, q.y0], [q.z1 + q.chaflan, q.y1], [q.z0 - q.chaflan, q.y1]],
});

// ── Lanzadores y misil (fotos de frente, de la carga y del 25-1001 en vuelo) ─
// Un lanzador bajo cada ala, a 1,58 m del eje, colgado de un pilón corto: un
// raíl gris de 2,6 m con la punta de delante redondeada. El AIM-120, en el
// del ala derecha (x negativa, como en la foto de la carga y en el 25-1001
// en vuelo), asoma 0,9 m por delante.
const LANZ = { x: 1.58, y: -0.3, alto: 0.14, ancho: 0.13, z0: 0.77, z1: -1.86 };
const yBajoAla = (x: number) => ALA.y + caidaAla(x) - 0.275 * grosorAla(x);
const PILON = { y: yBajoAla(LANZ.x) + 0.02, abajo: LANZ.y + LANZ.alto / 2 - 0.01, z0: 0.35, z1: -1.2 };
// AIM-120C (en Creech, CATM-120C de instrucción, gris con bandas azules):
// 3,65 m y 178 mm (Fuerza Aérea y Marina de EE. UU.); radomo blanco, alas
// recortadas en X hacia la mitad y aletas en la cola (foto del 25-1001).
const MISIL = { x: -LANZ.x, y: LANZ.y - LANZ.alto / 2 - 0.02 - 0.089, punta: 1.67, r: 0.089 };
const zMisil = (d: number) => MISIL.punta - d;
const aletasX = (id: string, contorno: [number, number][]): Pieza[] =>
  [45, -45, 135, -135].map((inclinacion, i) => ({
    tipo: "placa", id: `${id}-${i}`, acabado: "aluminio", plano: "vertical", x: MISIL.x, y: MISIL.y, grosor: 0.008, bisel: 0.002, inclinacion, planta: contorno,
  }));
const PIEZAS_MISIL: Pieza[] = [
  { tipo: "tubo", id: "misil-radomo", acabado: "hueso", centro: [MISIL.x, MISIL.y], perfil: [
    [zMisil(0), 0], [zMisil(0.03), 0.028], [zMisil(0.12), 0.055], [zMisil(0.25), 0.075], [zMisil(0.4), 0.086], [zMisil(0.52), MISIL.r], [zMisil(0.53), 0],
  ] },
  { tipo: "tubo", id: "misil", acabado: "aluminio", centro: [MISIL.x, MISIL.y], perfil: [[zMisil(0.52), 0], [zMisil(0.52), MISIL.r], [zMisil(3.64), MISIL.r], [zMisil(3.65), 0.07], [zMisil(3.65), 0]] },
  ...[1.15, 2.35].map((d, i): Pieza => ({ tipo: "tubo", id: `misil-banda-${i}`, acabado: "azul", centro: [MISIL.x, MISIL.y], perfil: [[zMisil(d), 0], [zMisil(d), MISIL.r + 0.002], [zMisil(d + 0.07), MISIL.r + 0.002], [zMisil(d + 0.07), 0]] })),
  ...aletasX("misil-alas", [[zMisil(1.62), MISIL.r - 0.01], [zMisil(1.95), MISIL.r - 0.01], [zMisil(1.93), 0.2], [zMisil(1.78), 0.2]]),
  ...aletasX("misil-aletas", [[zMisil(3.28), MISIL.r - 0.01], [zMisil(3.64), MISIL.r - 0.01], [zMisil(3.64), 0.27], [zMisil(3.5), 0.27]]),
  // Los patines con los que cuelga del raíl.
  ...[1.3, 2.6].map((d, i): Pieza => ({ tipo: "caja", id: `misil-patin-${i}`, acabado: "metal", centro: [MISIL.x, MISIL.y + MISIL.r + 0.012, zMisil(d)], tam: [0.04, 0.03, 0.1] })),
];
const IDS_MISIL = PIEZAS_MISIL.map((p) => p.id);

// Boca de la toma de aire, bajo la arista (foto de perfil): los labios en z
// 2,16 y los costados recortados en «<» hasta z 1,87, donde empieza el
// conducto (el casco) con su cara oscura. Por la cuña de cada costado se ve
// el interior, en sombra.
const TOMA = { z: 1.882, y: -0.265, ancho: 0.57, alto: 0.165, labios: 2.162, pared: 0.6, techo: -0.09, suelo: -0.437, fondo: 1.85, cuna: [1.869, -0.302] as [number, number] };
// Tobera: un cilindro corto de 36 cm que asoma por el final de la cola, con
// el labio algo más claro y el interior negro (foto del 25-1003 en vuelo, desde
// atrás); centrada algo por encima de los estabilizadores.
const TOBERA = { y: 0.26, r: 0.18, sale: 0.07 };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-fu", secciones: [...SECCIONES, { ...SECCIONES[SECCIONES.length - 1], z: COLA_Z }] },
  { tipo: "ala", id: "ala", acabado: "gris-fu", y: ALA.y, raizDentro: true, estaciones: [
    estAla(ALA.raiz), estAla(MANDO.flap[0]), estAlaCorta(MANDO.flap[0]), estAlaCorta(MANDO.aleron[1]), estAla(MANDO.aleron[1]), estAla(ALA.punta),
  ] },
  { tipo: "ala", id: "flaps", acabado: "gris-fu", y: ALA.y, estaciones: [estMando(MANDO.flap[0] + MANDO.hueco), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris-fu", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1] - MANDO.hueco)] },
  { tipo: "ala", id: "estabilizador", acabado: "gris-fu", y: ESTAB.y, raizDentro: true, estaciones: [
    [ESTAB.raiz, baEstab(ESTAB.raiz), bsEstab(ESTAB.raiz), 0.08, 0],
    [ESTAB.punta, ESTAB.baPunta, ESTAB.bsPunta, 0.03, 0],
  ] },
  { tipo: "placa", id: "deriva", acabado: "gris-fu", plano: "vertical", x: 0, grosor: 0.045, bisel: 0.015, planta: DERIVA },
  { tipo: "tubo", id: "toma-boca", acabado: "hueco", centro: [0, TOMA.y], seccion: [TOMA.ancho / TOMA.alto, 1], perfil: [[TOMA.z + 0.004, 0], [TOMA.z + 0.004, TOMA.alto], [TOMA.z - 0.004, TOMA.alto], [TOMA.z - 0.004, 0]] },
  // Joroba del lomo sobre el morro, con su ventana de cristal oscuro delante
  // (de frente se ve como un ojo): 60 cm de largo, 5 cm sobre el lomo.
  { tipo: "tubo", id: "joroba", acabado: "gris-fu", centro: [0, 0.55], seccion: [1.4, 0.5], perfil: [[3.32, 0], [3.26, 0.06], [3.12, 0.1], [2.92, 0.11], [2.76, 0.08], [2.64, 0]] },
  { tipo: "tubo", id: "joroba-ventana", acabado: "lente", centro: [0, 0.578], seccion: [1.6, 0.75], perfil: [[3.268, 0], [3.268, 0.058], [3.252, 0.058], [3.252, 0]] },
  // Cúpulas de cristal sobre y bajo el ala, a la altura del pilón, junto al
  // borde de ataque (foto de la carga, de cerca), y otra en cada punta, junto
  // a la luz de posición (foto de perfil).
  ...([[1.58, -0.62, 0.012, 1], [1.58, -0.62, -0.112, -1], [2.97, -1.6, -0.058, 1]] as const).flatMap(([x, z, y, s], i) => [1, -1].map((l): Pieza => ({
    tipo: "tubo", id: `cupula-${i}-${l > 0 ? "i" : "d"}`, acabado: "lente", centro: [l * x, y], seccion: [1, 0.8 * s], perfil: [[z + 0.04, 0], [z + 0.03, 0.026], [z, 0.034], [z - 0.03, 0.026], [z - 0.04, 0]],
  }))),
  // Veletas de ángulo de ataque, a los lados del morro, sobre su base.
  { tipo: "disco", id: "veletas-base", acabado: "gris-fu", espejo: true, en: [0.37, 0.268, 3.29], normal: [0.85, 0.53, 0], radio: 0.03, grosor: 0.01 },
  { tipo: "varilla", id: "veletas", acabado: "metal", espejo: true, desde: [0.375, 0.272, 3.29], hasta: [0.43, 0.29, 3.5], radio: 0.009 },
  // Antenas del lomo: dos palas pequeñas delante, un carenado bajo con otra
  // en medio y una pala negra grande, en flecha, detrás (fotos de perfil).
  ...[1.03, 0.72].map((z, i): Pieza => ({ tipo: "placa", id: `antena-${i}`, acabado: "gris-fu", plano: "vertical", x: 0, grosor: 0.014, bisel: 0.004, planta: [[z + 0.04, 0.64], [z - 0.04, 0.64], [z - 0.07, 0.71], [z - 0.04, 0.71]] })),
  { tipo: "tubo", id: "carenado-lomo", acabado: "gris-fu", centro: [0, 0.655], seccion: [1, 0.5], perfil: [[0.34, 0], [0.26, 0.04], [0, 0.05], [-0.22, 0.04], [-0.28, 0]] },
  { tipo: "placa", id: "antena-carenado", acabado: "gris-fu", plano: "vertical", x: 0, grosor: 0.012, bisel: 0.004, planta: [[0.31, 0.66], [0.24, 0.66], [0.22, 0.72], [0.25, 0.72]] },
  // Antena bajo la cola (foto de perfil).
  { tipo: "placa", id: "antena-ventral", acabado: "negro", plano: "vertical", x: 0, grosor: 0.016, bisel: 0.005, planta: [[-3.0, -0.28], [-3.12, -0.28], [-3.2, -0.4], [-3.15, -0.4]] },
  { tipo: "placa", id: "antena-grande", acabado: "negro", plano: "vertical", x: 0, grosor: 0.018, bisel: 0.005, planta: [[-2.16, 0.62], [-2.31, 0.62], [-2.37, 0.745], [-2.32, 0.745]] },
  // Los labios de la toma: el de abajo y los dos costados en «<», con el
  // interior oscuro detrás de cada costado.
  { tipo: "placa", id: "toma-labio", acabado: "gris-fu", plano: "horizontal", simetrica: true, y: TOMA.suelo, grosor: 0.026, bisel: 0.006, planta: [[0, TOMA.fondo], [TOMA.pared + 0.012, TOMA.fondo], [TOMA.pared + 0.012, TOMA.labios + 0.006], [0, TOMA.labios + 0.006]] },
  { tipo: "placa", id: "toma-costados", acabado: "gris-fu", plano: "vertical", x: TOMA.pared, espejo: true, grosor: 0.022, bisel: 0.006, planta: [[TOMA.fondo, TOMA.techo], [TOMA.labios - 0.004, TOMA.techo - 0.01], TOMA.cuna, [TOMA.labios + 0.006, TOMA.suelo - 0.006], [TOMA.fondo, TOMA.suelo - 0.006]] },
  { tipo: "placa", id: "toma-interior", acabado: "hueco", plano: "vertical", x: TOMA.pared - 0.018, espejo: true, grosor: 0.006, planta: [[TOMA.fondo, TOMA.techo], [TOMA.labios - 0.01, TOMA.techo], [TOMA.labios - 0.01, TOMA.suelo + 0.01], [TOMA.fondo, TOMA.suelo + 0.01]] },
  // Tren de morro: la pata blanca con su horquilla y la rueda.
  { tipo: "varilla", id: "pata-morro", acabado: "blanco", desde: [0, -0.42, MORRO_TREN.z - 0.04], hasta: [0, rMorro + 0.12, MORRO_TREN.z - 0.02], radio: 0.04 },
  { tipo: "varilla", id: "vastago-morro", acabado: "metal", desde: [0, rMorro + 0.16, MORRO_TREN.z - 0.02], hasta: [0, rMorro + 0.04, MORRO_TREN.z], radio: 0.026 },
  { tipo: "varilla", id: "horquilla-morro", acabado: "blanco", espejo: true, desde: [0.075, rMorro + 0.06, MORRO_TREN.z], hasta: [0.075, rMorro, MORRO_TREN.z], radio: 0.022 },
  { tipo: "disco", id: "rueda-morro", acabado: "negro", en: [0, rMorro, MORRO_TREN.z], normal: [1, 0, 0], radio: MORRO_TREN.r, grosor: 0.11 },
  { tipo: "disco", id: "buje-morro", acabado: "metal", espejo: true, en: [0.056, rMorro, MORRO_TREN.z], normal: [1, 0, 0], radio: 0.085, grosor: 0.01 },
  puerta("puertas-morro", PUERTA_MORRO, "negro"),
  // Tren principal: pata casi vertical, abierta hacia fuera (de frente), con
  // el amortiguador brillante, un tirante en diagonal hacia delante y la rueda.
  { tipo: "varilla", id: "patas", acabado: "blanco", espejo: true, desde: [0.62, -0.42, PRINCIPAL.z + 0.06], hasta: [PRINCIPAL.x - 0.12, rPrin + 0.16, PRINCIPAL.z], radio: 0.05 },
  { tipo: "varilla", id: "vastagos", acabado: "metal", espejo: true, desde: [PRINCIPAL.x - 0.11, rPrin + 0.2, PRINCIPAL.z], hasta: [PRINCIPAL.x - 0.08, rPrin, PRINCIPAL.z], radio: 0.032 },
  { tipo: "varilla", id: "tirantes", acabado: "blanco", espejo: true, desde: [0.5, -0.44, -0.32], hasta: [0.83, -0.78, PRINCIPAL.z + 0.05], radio: 0.028 },
  { tipo: "varilla", id: "ejes", acabado: "metal", espejo: true, desde: [PRINCIPAL.x - 0.09, rPrin, PRINCIPAL.z], hasta: [PRINCIPAL.x, rPrin, PRINCIPAL.z], radio: 0.03 },
  { tipo: "disco", id: "ruedas", acabado: "negro", espejo: true, en: [PRINCIPAL.x, rPrin, PRINCIPAL.z], normal: [1, 0, 0], radio: PRINCIPAL.r, grosor: PRINCIPAL.ancho },
  { tipo: "disco", id: "bujes", acabado: "metal", espejo: true, en: [PRINCIPAL.x + PRINCIPAL.ancho / 2 + 0.002, rPrin, PRINCIPAL.z], normal: [1, 0, 0], radio: 0.1, grosor: 0.01 },
  puerta("puertas-principal", PUERTA_PRIN, "blanco"),
  // Pilones y lanzadores, en las dos alas.
  { tipo: "ala", id: "pilones", acabado: "gris-fu", vertical: true, espejo: true, x: LANZ.x, y: PILON.y, estaciones: [[0, PILON.z0, PILON.z1, 0.07], [PILON.y - PILON.abajo, PILON.z0 - 0.08, PILON.z1, 0.06]] },
  { tipo: "caja", id: "lanzadores", acabado: "gris-fu", espejo: true, redondeo: 0.04, centro: [LANZ.x, LANZ.y, (LANZ.z0 + LANZ.z1) / 2], tam: [LANZ.ancho, LANZ.alto, LANZ.z0 - LANZ.z1] },
  ...PIEZAS_MISIL,
  { tipo: "tubo", id: "tobera", acabado: "gris-fu", centro: [0, TOBERA.y], perfil: [
    [COLA_Z + 0.06, 0], [COLA_Z + 0.06, TOBERA.r], [COLA_Z - TOBERA.sale + 0.01, TOBERA.r], [COLA_Z - TOBERA.sale, TOBERA.r - 0.01], [COLA_Z - TOBERA.sale, TOBERA.r - 0.022], [COLA_Z - 0.02, TOBERA.r - 0.026], [COLA_Z - 0.02, 0],
  ] },
  { tipo: "tubo", id: "tobera-labio", acabado: "aluminio", centro: [0, TOBERA.y], perfil: [[COLA_Z - TOBERA.sale + 0.004, TOBERA.r - 0.006], [COLA_Z - TOBERA.sale - 0.002, TOBERA.r - 0.009], [COLA_Z - TOBERA.sale - 0.002, TOBERA.r - 0.02], [COLA_Z - TOBERA.sale + 0.004, TOBERA.r - 0.023]] },
  { tipo: "disco", id: "tobera-boca", acabado: "hueco", en: [0, TOBERA.y, COLA_Z - 0.024], normal: [0, 0, -1], radio: TOBERA.r - 0.028, grosor: 0.004 },
];

// ── Detalle pintado del HD (el 25-1003) ───────────────────────────────────
// Posiciones medidas en la foto de perfil al sol con su cámara encajada
// (arte/uas-fuentes/fq-44a-fury/hd/perfil-der-*.json): cada punto de la foto
// llevado a la superficie de la maqueta.
const CLARO = "#b4bcb8", OSCURO_MARCA = "#3e4643", FRANJA = "#212825";
const LADO: [number, number, number] = [-1, 0, 0];
// Una zona de pintura en un costado, dada por puntos [z, y]: `lado` −1, el
// derecho (x negativa), y 1, el izquierdo. La calca va del tamaño de la zona;
// en el derecho, la cola queda a la izquierda del dibujo, y en el izquierdo, a
// la derecha.
const zona = (lado: 1 | -1, puntos: [number, number][], x: number, color: string): Calca => {
  const zs = puntos.map(([z]) => z), ys = puntos.map(([, y]) => y);
  const [z0, z1] = [Math.min(...zs), Math.max(...zs)];
  // Proyectada de lado puro (así la altura del dibujo es la y de verdad) y con
  // la caja alta, para que su fondo llegue de la arista al lomo.
  // El centro, en la parte baja de la zona: ahí da el rayo que coloca la caja.
  const yc = Math.min(...ys) + 0.25 * (Math.max(...ys) - Math.min(...ys)), al = 2 * Math.max(0.7, Math.max(...ys) - Math.min(...ys)), an = z1 - z0;
  return {
    sobre: ["fuselaje"], en: [lado * x, yc, (z0 + z1) / 2], desde: [lado, 0, 0], tam: [an, al],
    dibujo: { tipo: "poligono", color, puntos: puntos.map(([z, y]) => [lado < 0 ? (z - z0) / an : (z1 - z) / an, 0.5 + (y - yc) / al]) },
  };
};
// Franja gris oscuro del lomo (25-1003): estrecha junto a la deriva, baja en
// escalón para el «YFQ-44A», sube en dos escalones y acaba en diagonal
// contra el lomo, junto a la rejilla. Por arriba cubre todo el lomo.
const FRANJA_LADO: [number, number][] = [[-3.42, 0.52], [-3.3, 0.47], [-1.85, 0.465], [-1.6, 0.294], [-0.36, 0.291], [-0.22, 0.434], [0.32, 0.432], [0.445, 0.489], [1.64, 0.483], [1.83, 0.604], [1.95, 0.95], [-3.42, 0.95]];
const franjaArriba: Calca = {
  sobre: ["fuselaje"], en: [0, 0.68, -0.76], desde: [0, 1, 0.001], tam: [0.5, 5.4],
  dibujo: { tipo: "poligono", color: FRANJA, puntos: [[0.33, 1], [0.67, 1], [1, 0.9], [1, 0.03], [0.6, 0], [0.4, 0], [0, 0.03], [0, 0.9]] },
};
const CALCAS: Calca[] = [
  zona(1, FRANJA_LADO, 0.5, FRANJA),
  zona(-1, FRANJA_LADO, 0.5, FRANJA),
  franjaArriba,
  // «YFQ-44A» en la franja, y al lado, en pequeño, «Anduril Industries /
  // Collaborative Combat Aircraft».
  { sobre: ["fuselaje"], en: [-0.53, 0.38, -1.37], desde: [-1, 0.7, 0], tam: [0.78, 0.15], dibujo: { tipo: "texto", texto: "YFQ-44A", color: CLARO, cursiva: true }, espejo: true, capa: 1 },
  { sobre: ["fuselaje"], en: [-0.55, 0.375, -0.82], desde: [-1, 0.7, 0], tam: [0.24, 0.14], dibujo: { tipo: "texto", texto: "Anduril Industries\nCollaborative\nCombat\nAircraft", color: CLARO, fino: true }, espejo: true, capa: 1 },
  // Símbolo de la Fuerza Aérea, detrás del ala, y «U.S. AIR FORCE» debajo.
  { sobre: ["fuselaje"], en: [-0.68, 0.105, -2.544], desde: [-1, 0.2, 0], tam: [0.24, 0.21], dibujo: { tipo: "usaf", color: CLARO }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.68, -0.16, -2.45], desde: [-1, -0.2, 0], tam: [0.6, 0.06], dibujo: { tipo: "texto", texto: "U.S. AIR FORCE", color: OSCURO_MARCA, fino: true }, espejo: true },
  // Logo y «ANDURIL» bajo la tapa del morro.
  { sobre: ["fuselaje"], en: [-0.68, 0.154, 1.49], desde: [-1, 0.2, 0], tam: [0.53, 0.07], dibujo: { tipo: "anduril", color: CLARO, texto: true }, espejo: true },
  // Rayas «////» sobre la raíz del ala.
  { sobre: ["fuselaje"], en: [-0.76, 0.179, 0.05], desde: [-1, 0.2, 0], tam: [0.25, 0.05], dibujo: { tipo: "rayas", color: CLARO, fondo: "rgba(0,0,0,0)", franjas: 4 }, espejo: true },
  // Aviso de la toma en el lateral del carenado y rejillas.
  { sobre: ["fuselaje"], en: [-0.6, -0.2, 1.766], desde: [-1, 0, 0], tam: [0.11, 0.09], dibujo: { tipo: "aviso-toma", color: OSCURO_MARCA }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.63, 0.155, 1.98], desde: [-1, 0.4, 0], tam: [0.17, 0.17], dibujo: { tipo: "malla" }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.29, 0.568, -0.6], desde: [-1, 1, 0], tam: [0.4, 0.035], dibujo: { tipo: "malla" }, espejo: true, capa: 1 },
  { sobre: ["fuselaje"], en: [-0.33, 0.516, 1.43], desde: [-1, 1, 0], tam: [0.42, 0.014], dibujo: { tipo: "rect", color: "#262b29" }, espejo: true, capa: 1 },
  { sobre: ["fuselaje"], en: [-0.655, 0.038, 2.48], desde: [-1, 0, 0], tam: [0.38, 0.018], dibujo: { tipo: "rect", color: "#262b29" }, espejo: true },
  // Toma empotrada en «Λ» junto a la veleta.
  zona(1, [[2.864, 0.169], [2.947, 0.262], [3.106, 0.224], [2.96, 0.232]], 0.45, "#1f2422"),
  zona(-1, [[2.864, 0.169], [2.947, 0.262], [3.106, 0.224], [2.96, 0.232]], 0.45, "#1f2422"),
  // Cola: rejilla de seis lados y triángulo de aviso.
  { sobre: ["fuselaje"], en: [-0.51, 0.198, -4.19], desde: [-1, 0.2, 0], tam: [0.11, 0.06], dibujo: { tipo: "malla", hex: true }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.4, 0.21, -4.71], desde: [-1, 0.1, -0.4], tam: [0.08, 0.07], dibujo: { tipo: "aviso-toma", color: OSCURO_MARCA }, espejo: true },
  // Deriva: escudo del Mando de Combate Aéreo, «AI» y «AF 25 1003».
  { sobre: ["deriva"], en: [-0.03, 1.396, -4.309], desde: LADO, tam: [0.17, 0.2], dibujo: { tipo: "escudo", color: CLARO }, espejo: true },
  { sobre: ["deriva"], en: [-0.03, 1.07, -4.09], desde: LADO, tam: [0.2, 0.18], dibujo: { tipo: "texto", texto: "AI", color: CLARO, fino: true }, espejo: true },
  { sobre: ["deriva"], en: [-0.03, 0.795, -4.04], desde: LADO, tam: [0.34, 0.11], dibujo: { tipo: "serie", ano: "25", numero: "1003", color: CLARO }, espejo: true },
  // Luces de posición en las puntas del ala: roja a la izquierda (x
  // positiva) y verde a la derecha.
  { sobre: ["ala"], en: [ALA.punta, ALA.y + ALA.caida, -1.6], desde: [1, 0, 0], tam: [0.05, 0.05], dibujo: { tipo: "disco", color: "#d0222a" } },
  { sobre: ["ala"], en: [-ALA.punta, ALA.y + ALA.caida, -1.6], desde: [-1, 0, 0], tam: [0.05, 0.05], dibujo: { tipo: "disco", color: "#1fae5a" } },
];

const COSTURAS: Costura[] = [
  // Timón: su bisagra, paralela al borde de salida, y la junta de la raíz.
  { sobre: ["deriva"], desde: LADO, espejo: true, puntos: [[-0.03, 1.857, -4.556], [-0.03, 0.622, -4.269]] },
  { sobre: ["deriva"], desde: LADO, espejo: true, puntos: [[-0.03, 0.547, -4.606], [-0.03, 0.662, -3.369]] },
  // Tapa grande del morro y la de la toma en «Λ», atornilladas.
  { sobre: ["fuselaje"], desde: [-1, 0.5, 0], espejo: true, remaches: 0.07, puntos: [[-0.511, 0.312, 1.764], [-0.168, 0.587, 1.976], [-0.22, 0.477, 3.078], [-0.453, 0.141, 3.259], [-0.526, 0.049, 3.167], [-0.724, 0.052, 1.931], [-0.511, 0.312, 1.764]] },
  { sobre: ["fuselaje"], desde: [-1, 0.5, 0], espejo: true, remaches: 0.05, puntos: [[-0.471, 0.235, 2.738], [-0.397, 0.328, 2.802], [-0.353, 0.327, 3.097], [-0.406, 0.233, 3.179], [-0.479, 0.141, 3.114], [-0.526, 0.142, 2.821], [-0.471, 0.235, 2.738]] },
  // Remaches del lanzador, a lo largo de su costado.
  { sobre: ["lanzadores"], desde: [1, 0, 0], espejo: true, remaches: 0.06, puntos: [[LANZ.x + 0.07, LANZ.y + 0.03, LANZ.z0 - 0.15], [LANZ.x + 0.07, LANZ.y + 0.03, LANZ.z1 + 0.1]] },
  { sobre: ["lanzadores"], desde: [-1, 0, 0], espejo: true, remaches: 0.06, puntos: [[LANZ.x - 0.07, LANZ.y + 0.03, LANZ.z0 - 0.15], [LANZ.x - 0.07, LANZ.y + 0.03, LANZ.z1 + 0.1]] },
];

const PIEZAS_TREN = ["pata-morro", "vastago-morro", "horquilla-morro", "rueda-morro", "buje-morro", "puertas-morro", "patas", "vastagos", "tirantes", "ejes", "ruedas", "bujes", "puertas-principal"];
const PARTES: Parte[] = [
  {
    nombre: "Fuselaje",
    en: [0, 0.95, -0.6],
    piezas: ["fuselaje", "antena-0", "antena-1", "carenado-lomo", "antena-carenado", "antena-grande", "antena-ventral"],
    respaldo: "foto",
    fuentes: ["perfil", "rodaje", "interactivo", "twz"],
    texto: "10 m de largo, con el lomo en tejado, una arista viva en cada costado y los bajos de costados rectos. Va en el gris de la Fuerza Aérea, con la franja oscura del 25-1003 y sus antenas en el lomo.",
    nota: "La forma sale del interactivo de Anduril; el largo, de medir con el AIM-120 en las fotos (las cifras de 6,1 m eran del diseño de 2023). El lomo y los bajos, corregidos con las fotos del 25-1003.",
  },
  {
    nombre: "Morro y sensores",
    en: [0, 0.85, 3.0],
    piezas: ["joroba", "joroba-ventana", "veletas", "veletas-base"],
    respaldo: "foto",
    fuentes: ["morro", "frente", "perfil"],
    texto: "Sin cabina: un morro afilado con una joroba encima y una ventana de cristal oscuro delante. A los lados, las veletas que miden el ángulo con el que vuela.",
    nota: "Qué cámaras o sensores hay detrás de la ventana no se ha publicado.",
  },
  {
    nombre: "Toma de aire",
    en: [-0.85, -0.45, 2.1],
    piezas: ["toma-labio", "toma-costados", "toma-interior", "toma-boca"],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "vuelo"],
    texto: "Una sola toma, bajo el morro y debajo de la arista, con los costados recortados en «<». Una ranura la separa del fuselaje y el conducto lleva el aire al motor, en la cola.",
    nota: "El recorrido del conducto por dentro es supuesto.",
  },
  {
    nombre: "Ala y mandos",
    en: [2.4, 0.35, -1.3],
    piezas: ["ala", "flaps", "alerones", ...["0", "1", "2"].flatMap((i) => [`cupula-${i}-i`, `cupula-${i}-d`])],
    respaldo: "fabricante",
    fuentes: ["interactivo", "frente", "vuelo"],
    texto: "Un ala en flecha de 6,1 m, fina (unos 18 cm de grueso en la raíz), con flaps y alerones en el borde de salida. Sobre y bajo el ala, junto al soporte, cúpulas de cristal; en las puntas, las luces.",
    nota: "La planta y el grosor, del interactivo de Anduril; la envergadura, de escalarlo a los 10 m medidos en las fotos.",
  },
  {
    nombre: "Cola y tobera",
    en: [0, 2.15, -4.7],
    piezas: ["deriva", "estabilizador", "tobera", "tobera-labio", "tobera-boca"],
    respaldo: "foto",
    fuentes: ["vuelo", "perfil", "rodaje"],
    texto: "Una deriva alta con su timón, dos estabilizadores que giran enteros y, al final de la cola, la tobera redonda del motor, que asoma unos centímetros.",
    nota: "Que los estabilizadores se muevan enteros se deduce de que no tienen timón propio en las fotos.",
  },
  {
    nombre: "AIM-120 y lanzadores",
    en: [-1.58, -0.75, 0.9],
    piezas: ["pilones", "lanzadores", ...IDS_MISIL],
    respaldo: "foto",
    fuentes: ["carga", "cautivo", "navy"],
    texto: "Un lanzador bajo cada ala. En el derecho, un AIM-120 de instrucción, gris con bandas azules: el misil aire-aire de 3,65 m, guiado por radar, que el Fury disparó por primera vez en julio de 2026.",
    nota: "El misil, con las medidas oficiales; cómo cuelga, de la foto de la carga en Creech y del 25-1001 en vuelo.",
  },
  {
    nombre: "Tren de aterrizaje",
    en: [1.2, SUELO - 0.15, -0.93],
    piezas: PIEZAS_TREN,
    respaldo: "foto",
    fuentes: ["perfil", "tren", "rodaje"],
    texto: "Tres ruedas de patas blancas que se recogen en el fuselaje. En tierra, las compuertas de los pozos quedan abiertas y cuelgan bajo la panza.",
  },
];

// Todo lo de arriba, de metros a unidades de la maqueta.
const u = (v: number) => v / ESCALA;
const u2 = ([a, b]: [number, number]): [number, number] => [u(a), u(b)];
const u3 = ([a, b, c]: [number, number, number]): [number, number, number] => [u(a), u(b), u(c)];
const aUnidades = (p: Pieza): Pieza => {
  switch (p.tipo) {
    case "tubo":
      return { ...p, perfil: p.perfil.map((q) => q.map(u) as typeof q), ...(p.centro && { centro: u2(p.centro) }) };
    case "casco":
      return { ...p, secciones: p.secciones.map((q) => ({ ...q, z: u(q.z), ancho: u(q.ancho), arriba: u(q.arriba), abajo: u(q.abajo), ...(q.cintura !== undefined && { cintura: u(q.cintura) }), ...(q.contorno && { contorno: q.contorno.map((t) => t.map(u2)) }) })) };
    case "placa":
      return p.plano === "horizontal"
        ? { ...p, planta: p.planta.map(u2), y: u(p.y), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) }
        : { ...p, planta: p.planta.map(u2), x: u(p.x), ...(p.y !== undefined && { y: u(p.y) }), grosor: u(p.grosor), ...(p.bisel && { bisel: u(p.bisel) }) };
    case "ala":
      return { ...p, y: u(p.y), ...(p.x !== undefined && { x: u(p.x) }), estaciones: p.estaciones.map(([x, a, b, t, sube = 0]): [number, number, number, number, number] => [u(x), u(a), u(b), u(t), u(sube)]) };
    case "varilla":
      return { ...p, desde: u3(p.desde), hasta: u3(p.hasta), radio: u(p.radio) };
    case "caja":
      return { ...p, centro: u3(p.centro), tam: u3(p.tam), ...(p.redondeo && { redondeo: u(p.redondeo) }) };
    case "disco":
      return { ...p, en: u3(p.en), radio: u(p.radio), grosor: u(p.grosor) };
    default:
      throw new Error(`Pieza sin convertir: ${p.tipo}`);
  }
};
const aCalca = (k: Calca): Calca => ({ ...k, en: u3(k.en), tam: u2(k.tam) });
const aCostura = (k: Costura): Costura => ({ ...k, puntos: k.puntos.map(u3), ...(k.remaches && { remaches: u(k.remaches) }) });

const maqueta: Maqueta = {
  nombre: "FQ-44A Fury",
  subtitulo: "Dron de combate CCA",
  escala: ESCALA,
  resalte: "tinta",
  hd: true,
  contornoPixel: true,
  detalles: { calcas: CALCAS.map(aCalca), costuras: COSTURAS.map(aCostura) },
  pais: bandera("US"),
  piezas: PIEZAS.map(aUnidades),
  partes: PARTES.map((p) => ({ ...p, en: u3(p.en) })),
  fuentes: [
    { id: "perfil", imagen: "perfil-creech.jpg", titulo: "El 25-1003 de perfil, en Creech, julio de 2026", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870311` },
    { id: "rodaje", imagen: "rodaje-izquierda.jpg", titulo: "Rodando por la pista de Creech, por la izquierda", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870304` },
    { id: "frente", imagen: "frente.jpg", titulo: "De frente, rodando, con teleobjetivo", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870308` },
    { id: "morro", imagen: "morro.jpg", titulo: "El morro, de cerca y desde abajo", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870340` },
    { id: "carga", imagen: "carga-aim120.jpg", titulo: "Cargando un AIM-120 de instrucción bajo el ala derecha", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870323` },
    { id: "tren", imagen: "tren-ala.jpg", titulo: "Bajo el ala: tren principal, compuertas y lanzador", medio: "Fuerza Aérea de EE. UU. (DVIDS)", url: `${DVIDS}9870321` },
    { id: "vuelo", imagen: "vuelo-detras.jpg", titulo: "En vuelo sobre el desierto de Mojave, desde arriba y detrás", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}A_YFQ-44A_flies_over_the_Mojave_Desert_after_conducting_live-fire_testing_260710-F-UU560-1070.jpg` },
    { id: "cautivo", imagen: "vuelo-aim120.jpg", titulo: "El 25-1001 en vuelo con un AIM-120 inerte bajo el ala", medio: "Fuerza Aérea de EE. UU. (Wikimedia Commons)", url: `${COMMONS}YFQ-44A_-_Collaborative_Combat_Aircraft_(CCA)_program.jpg` },
    { id: "interactivo", imagen: "interactivo-perfil.jpg", titulo: "Fury, vista interactiva", medio: "Anduril", url: "https://www.anduril.com/fury" },
    { id: "twz", titulo: "The Rise Of Fury", medio: "The War Zone", url: "https://www.twz.com/the-rise-of-fury" },
    { id: "navy", titulo: "AIM-120 Advanced Medium-Range Air-to-Air Missile (AMRAAM)", medio: "Marina de EE. UU.", url: "https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2168352/aim-120-advanced-medium-range-air-to-air-missile-amraam" },
  ],
};

export default maqueta;
