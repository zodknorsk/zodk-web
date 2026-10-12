// Maqueta del FQ-44A Fury de Anduril: el prototipo YFQ-44A con las marcas
// del 25-1003 («AI», Unidad de Operaciones Experimentales del CCA, en Creech,
// julio de 2026) y el color y el número del 25-1001; sin tren y con un AIM-120
// bajo cada ala.
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
  { z: 4.954, ancho: 0.03, arriba: -0.013, abajo: -0.045, cintura: -0.035, contorno: [
      [[0, -0.013], [0.002, -0.013], [0.005, -0.014], [0.007, -0.014], [0.009, -0.015], [0.011, -0.016], [0.013, -0.018], [0.015, -0.02], [0.016, -0.021], [0.018, -0.023], [0.02, -0.025], [0.022, -0.027], [0.023, -0.028], [0.025, -0.03], [0.027, -0.032], [0.028, -0.033], [0.03, -0.035]],
      [[0.03, -0.035], [0.027, -0.037], [0.024, -0.039]],
      [[0.024, -0.039], [0.022, -0.039], [0.021, -0.04], [0.019, -0.04], [0.018, -0.041], [0.016, -0.041], [0.015, -0.041], [0.013, -0.042], [0.012, -0.042], [0.01, -0.042], [0.009, -0.043], [0.007, -0.043], [0.006, -0.043], [0.004, -0.044], [0.003, -0.044], [0.001, -0.045], [0, -0.045]],
  ] },
  { z: 4.781, ancho: 0.104, arriba: 0.05, abajo: -0.063, cintura: -0.037, contorno: [
      [[0, 0.05], [0.009, 0.048], [0.017, 0.047], [0.026, 0.045], [0.034, 0.041], [0.041, 0.035], [0.048, 0.03], [0.055, 0.025], [0.062, 0.019], [0.068, 0.013], [0.074, 0.006], [0.08, 0], [0.086, -0.007], [0.091, -0.014], [0.096, -0.022], [0.1, -0.029], [0.104, -0.037]],
      [[0.104, -0.037], [0.101, -0.038], [0.098, -0.039]],
      [[0.098, -0.039], [0.092, -0.042], [0.086, -0.044], [0.08, -0.046], [0.074, -0.048], [0.068, -0.05], [0.062, -0.053], [0.056, -0.055], [0.05, -0.056], [0.044, -0.057], [0.038, -0.058], [0.031, -0.059], [0.025, -0.06], [0.019, -0.061], [0.013, -0.061], [0.006, -0.062], [0, -0.063]],
  ] },
  { z: 4.455, ancho: 0.229, arriba: 0.172, abajo: -0.086, cintura: -0.042, contorno: [
      [[0, 0.172], [0.02, 0.17], [0.04, 0.166], [0.059, 0.159], [0.076, 0.146], [0.092, 0.134], [0.109, 0.122], [0.123, 0.108], [0.137, 0.092], [0.15, 0.077], [0.164, 0.061], [0.177, 0.046], [0.19, 0.03], [0.2, 0.012], [0.21, -0.006], [0.219, -0.024], [0.229, -0.042]],
      [[0.229, -0.042], [0.224, -0.044], [0.22, -0.045]],
      [[0.22, -0.045], [0.206, -0.049], [0.193, -0.052], [0.179, -0.056], [0.166, -0.059], [0.152, -0.063], [0.138, -0.066], [0.125, -0.07], [0.111, -0.073], [0.098, -0.075], [0.084, -0.077], [0.07, -0.078], [0.056, -0.08], [0.042, -0.081], [0.028, -0.083], [0.014, -0.084], [0, -0.086]],
  ] },
  { z: 4.129, ancho: 0.338, arriba: 0.3, abajo: -0.1, cintura: -0.051, contorno: [
      [[0, 0.3], [0.032, 0.298], [0.063, 0.29], [0.092, 0.278], [0.118, 0.26], [0.143, 0.239], [0.165, 0.216], [0.186, 0.192], [0.207, 0.168], [0.227, 0.143], [0.246, 0.117], [0.265, 0.091], [0.282, 0.064], [0.298, 0.036], [0.313, 0.008], [0.325, -0.022], [0.338, -0.051]],
      [[0.338, -0.051], [0.333, -0.052], [0.328, -0.053]],
      [[0.328, -0.053], [0.308, -0.057], [0.287, -0.061], [0.267, -0.064], [0.246, -0.068], [0.226, -0.072], [0.206, -0.076], [0.185, -0.079], [0.165, -0.083], [0.145, -0.087], [0.124, -0.089], [0.103, -0.091], [0.083, -0.093], [0.062, -0.094], [0.041, -0.096], [0.021, -0.098], [0, -0.1]],
  ] },
  { z: 3.694, ancho: 0.441, arriba: 0.42, abajo: -0.1, cintura: -0.04, contorno: [
      [[0, 0.42], [0.041, 0.415], [0.082, 0.405], [0.119, 0.388], [0.154, 0.365], [0.185, 0.337], [0.214, 0.307], [0.242, 0.276], [0.269, 0.245], [0.293, 0.211], [0.318, 0.177], [0.342, 0.143], [0.363, 0.107], [0.385, 0.072], [0.404, 0.035], [0.423, -0.003], [0.441, -0.04]],
      [[0.441, -0.04], [0.436, -0.041], [0.431, -0.042]],
      [[0.431, -0.042], [0.404, -0.046], [0.377, -0.051], [0.35, -0.055], [0.324, -0.06], [0.297, -0.064], [0.27, -0.069], [0.243, -0.073], [0.216, -0.078], [0.189, -0.082], [0.163, -0.087], [0.136, -0.09], [0.109, -0.092], [0.081, -0.094], [0.054, -0.096], [0.027, -0.098], [0, -0.1]],
  ] },
  { z: 3.259, ancho: 0.534, arriba: 0.53, abajo: -0.095, cintura: -0.035, contorno: [
      [[0, 0.53], [0.05, 0.524], [0.099, 0.512], [0.145, 0.491], [0.187, 0.461], [0.226, 0.429], [0.26, 0.391], [0.292, 0.352], [0.322, 0.311], [0.352, 0.27], [0.38, 0.228], [0.407, 0.185], [0.434, 0.142], [0.46, 0.098], [0.485, 0.054], [0.509, 0.009], [0.534, -0.035]],
      [[0.534, -0.035], [0.529, -0.036], [0.524, -0.036]],
      [[0.524, -0.036], [0.491, -0.04], [0.459, -0.045], [0.426, -0.049], [0.393, -0.053], [0.361, -0.057], [0.328, -0.062], [0.295, -0.066], [0.262, -0.07], [0.23, -0.074], [0.197, -0.079], [0.164, -0.083], [0.132, -0.087], [0.099, -0.089], [0.066, -0.091], [0.033, -0.093], [0, -0.095]],
  ] },
  { z: 2.825, ancho: 0.614, arriba: 0.59, abajo: -0.144, cintura: -0.024, contorno: [
      [[0, 0.59], [0.056, 0.585], [0.111, 0.571], [0.162, 0.548], [0.21, 0.517], [0.253, 0.481], [0.292, 0.44], [0.328, 0.397], [0.362, 0.352], [0.396, 0.307], [0.427, 0.259], [0.458, 0.212], [0.49, 0.165], [0.521, 0.118], [0.552, 0.07], [0.583, 0.023], [0.614, -0.024]],
      [[0.614, -0.024], [0.609, -0.026], [0.604, -0.027]],
      [[0.604, -0.027], [0.564, -0.034], [0.523, -0.037], [0.483, -0.041], [0.442, -0.046], [0.402, -0.051], [0.362, -0.057], [0.321, -0.062], [0.281, -0.068], [0.241, -0.073], [0.2, -0.078], [0.16, -0.084], [0.119, -0.089], [0.079, -0.094], [0.055, -0.116], [0.04, -0.137], [0, -0.144]],
  ] },
  { z: 2.499, ancho: 0.668, arriba: 0.598, abajo: -0.139, cintura: -0.024, contorno: [
      [[0, 0.598], [0.059, 0.593], [0.117, 0.58], [0.172, 0.559], [0.222, 0.528], [0.269, 0.491], [0.31, 0.448], [0.349, 0.404], [0.388, 0.359], [0.424, 0.312], [0.458, 0.264], [0.493, 0.216], [0.528, 0.168], [0.563, 0.12], [0.598, 0.072], [0.633, 0.024], [0.668, -0.024]],
      [[0.668, -0.024], [0.481, -0.044], [0.293, -0.064]],
      [[0.293, -0.064], [0.34, -0.065], [0.386, -0.066], [0.433, -0.067], [0.479, -0.067], [0.508, -0.078], [0.463, -0.087], [0.416, -0.092], [0.37, -0.098], [0.324, -0.104], [0.278, -0.11], [0.231, -0.115], [0.185, -0.121], [0.139, -0.127], [0.093, -0.132], [0.046, -0.136], [0, -0.139]],
  ] },
  { z: 2.164, ancho: 0.68, arriba: 0.6, abajo: -0.139, cintura: -0.023, contorno: [
      [[0, 0.6], [0.06, 0.595], [0.118, 0.582], [0.173, 0.56], [0.224, 0.529], [0.271, 0.492], [0.315, 0.451], [0.354, 0.406], [0.394, 0.361], [0.43, 0.314], [0.466, 0.265], [0.501, 0.217], [0.537, 0.169], [0.573, 0.121], [0.609, 0.073], [0.644, 0.025], [0.68, -0.023]],
      [[0.68, -0.023], [0.489, -0.043], [0.297, -0.063]],
      [[0.297, -0.063], [0.343, -0.064], [0.39, -0.065], [0.436, -0.066], [0.482, -0.067], [0.505, -0.079], [0.46, -0.087], [0.414, -0.093], [0.368, -0.098], [0.322, -0.104], [0.276, -0.11], [0.23, -0.115], [0.184, -0.121], [0.138, -0.127], [0.092, -0.132], [0.046, -0.136], [0, -0.139]],
  ] },
  { z: 2.162, ancho: 0.68, arriba: 0.6, abajo: -0.44, cintura: -0.023, contorno: [
      [[0, 0.6], [0.06, 0.595], [0.118, 0.582], [0.173, 0.56], [0.224, 0.529], [0.271, 0.492], [0.315, 0.451], [0.354, 0.406], [0.394, 0.361], [0.43, 0.314], [0.466, 0.265], [0.501, 0.217], [0.537, 0.169], [0.573, 0.121], [0.609, 0.073], [0.644, 0.025], [0.68, -0.023]],
      [[0.68, -0.023], [0.45, -0.068], [0.64, -0.075]],
      [[0.64, -0.075], [0.638, -0.153], [0.632, -0.198], [0.621, -0.235], [0.607, -0.267], [0.589, -0.296], [0.566, -0.322], [0.539, -0.344], [0.508, -0.365], [0.473, -0.382], [0.433, -0.398], [0.388, -0.411], [0.337, -0.421], [0.281, -0.429], [0.215, -0.435], [0.136, -0.439], [0, -0.44]],
  ] },
  { z: 1.847, ancho: 0.761, arriba: 0.62, abajo: -0.448, cintura: -0.018, contorno: [
      [[0, 0.62], [0.064, 0.617], [0.127, 0.603], [0.187, 0.581], [0.243, 0.55], [0.295, 0.513], [0.343, 0.469], [0.388, 0.424], [0.432, 0.377], [0.474, 0.328], [0.515, 0.279], [0.556, 0.229], [0.597, 0.18], [0.638, 0.13], [0.679, 0.081], [0.72, 0.031], [0.761, -0.018]],
      [[0.761, -0.018], [0.456, -0.063], [0.64, -0.075]],
      [[0.64, -0.075], [0.638, -0.154], [0.632, -0.2], [0.621, -0.239], [0.607, -0.272], [0.589, -0.301], [0.566, -0.327], [0.539, -0.35], [0.508, -0.371], [0.473, -0.389], [0.433, -0.405], [0.388, -0.418], [0.337, -0.429], [0.281, -0.437], [0.215, -0.443], [0.136, -0.447], [0, -0.448]],
  ] },
  { z: 1.521, ancho: 0.797, arriba: 0.635, abajo: -0.454, cintura: -0.018, contorno: [
      [[0, 0.635], [0.066, 0.628], [0.131, 0.617], [0.193, 0.593], [0.251, 0.56], [0.306, 0.523], [0.354, 0.478], [0.403, 0.432], [0.45, 0.385], [0.493, 0.334], [0.536, 0.284], [0.58, 0.234], [0.623, 0.183], [0.667, 0.133], [0.71, 0.083], [0.754, 0.032], [0.797, -0.018]],
      [[0.797, -0.018], [0.62, -0.063], [0.645, -0.075]],
      [[0.645, -0.075], [0.643, -0.156], [0.637, -0.202], [0.626, -0.241], [0.612, -0.275], [0.593, -0.305], [0.57, -0.331], [0.543, -0.355], [0.512, -0.376], [0.476, -0.394], [0.436, -0.41], [0.391, -0.424], [0.34, -0.435], [0.283, -0.443], [0.217, -0.449], [0.137, -0.453], [0, -0.454]],
  ] },
  { z: 1.195, ancho: 0.827, arriba: 0.65, abajo: -0.464, cintura: -0.013, contorno: [
      [[0, 0.65], [0.068, 0.645], [0.135, 0.631], [0.198, 0.606], [0.257, 0.573], [0.314, 0.534], [0.367, 0.491], [0.416, 0.444], [0.464, 0.396], [0.511, 0.346], [0.556, 0.295], [0.601, 0.243], [0.646, 0.192], [0.692, 0.141], [0.737, 0.09], [0.782, 0.038], [0.827, -0.013]],
      [[0.827, -0.013], [0.729, -0.058], [0.65, -0.07]],
      [[0.65, -0.07], [0.648, -0.154], [0.642, -0.203], [0.631, -0.243], [0.617, -0.278], [0.598, -0.309], [0.575, -0.336], [0.547, -0.361], [0.516, -0.383], [0.48, -0.402], [0.439, -0.418], [0.394, -0.432], [0.343, -0.444], [0.285, -0.453], [0.219, -0.459], [0.138, -0.463], [0, -0.464]],
  ] },
  { z: 0.869, ancho: 0.85, arriba: 0.66, abajo: -0.464, cintura: -0.013, contorno: [
      [[0, 0.66], [0.069, 0.653], [0.137, 0.636], [0.202, 0.612], [0.263, 0.579], [0.321, 0.54], [0.374, 0.495], [0.427, 0.45], [0.477, 0.401], [0.526, 0.352], [0.575, 0.302], [0.622, 0.25], [0.668, 0.199], [0.715, 0.147], [0.76, 0.094], [0.805, 0.04], [0.85, -0.013]],
      [[0.85, -0.013], [0.79, -0.058], [0.655, -0.062]],
      [[0.655, -0.062], [0.653, -0.147], [0.647, -0.197], [0.636, -0.238], [0.621, -0.274], [0.602, -0.305], [0.579, -0.334], [0.552, -0.359], [0.52, -0.381], [0.484, -0.401], [0.443, -0.417], [0.397, -0.432], [0.345, -0.443], [0.287, -0.452], [0.22, -0.459], [0.139, -0.463], [0, -0.464]],
  ] },
  { z: 0.543, ancho: 0.865, arriba: 0.67, abajo: -0.47, cintura: -0.007, contorno: [
      [[0, 0.67], [0.07, 0.66], [0.138, 0.642], [0.203, 0.616], [0.264, 0.582], [0.322, 0.542], [0.379, 0.501], [0.433, 0.455], [0.485, 0.409], [0.536, 0.359], [0.586, 0.31], [0.633, 0.258], [0.679, 0.205], [0.726, 0.152], [0.772, 0.099], [0.819, 0.046], [0.865, -0.007]],
      [[0.865, -0.007], [0.865, -0.012], [0.665, -0.05]],
      [[0.665, -0.05], [0.663, -0.139], [0.656, -0.191], [0.646, -0.234], [0.631, -0.271], [0.612, -0.304], [0.588, -0.334], [0.56, -0.36], [0.528, -0.383], [0.491, -0.404], [0.449, -0.421], [0.403, -0.436], [0.351, -0.448], [0.292, -0.458], [0.224, -0.465], [0.141, -0.469], [0, -0.47]],
  ] },
  { z: 0.217, ancho: 0.872, arriba: 0.68, abajo: -0.47, cintura: -0.007, contorno: [
      [[0, 0.68], [0.07, 0.668], [0.138, 0.648], [0.204, 0.622], [0.266, 0.586], [0.326, 0.548], [0.383, 0.506], [0.438, 0.461], [0.492, 0.415], [0.544, 0.367], [0.595, 0.317], [0.646, 0.267], [0.693, 0.214], [0.74, 0.161], [0.785, 0.106], [0.829, 0.049], [0.872, -0.007]],
      [[0.872, -0.007], [0.872, -0.012], [0.675, -0.06]],
      [[0.675, -0.06], [0.673, -0.147], [0.666, -0.198], [0.655, -0.24], [0.64, -0.276], [0.621, -0.308], [0.597, -0.337], [0.569, -0.363], [0.536, -0.385], [0.498, -0.405], [0.456, -0.423], [0.409, -0.437], [0.356, -0.449], [0.296, -0.458], [0.227, -0.465], [0.143, -0.469], [0, -0.47]],
  ] },
  { z: -0.109, ancho: 0.877, arriba: 0.68, abajo: -0.47, cintura: 0.047, contorno: [
      [[0, 0.68], [0.068, 0.667], [0.133, 0.646], [0.196, 0.619], [0.257, 0.586], [0.316, 0.551], [0.374, 0.513], [0.429, 0.471], [0.483, 0.429], [0.534, 0.383], [0.585, 0.336], [0.634, 0.287], [0.682, 0.237], [0.727, 0.185], [0.771, 0.132], [0.818, 0.082], [0.877, 0.047]],
      [[0.877, 0.047], [0.877, -0.069], [0.685, -0.08]],
      [[0.685, -0.08], [0.683, -0.164], [0.676, -0.212], [0.665, -0.252], [0.65, -0.287], [0.63, -0.317], [0.606, -0.344], [0.578, -0.369], [0.545, -0.39], [0.507, -0.409], [0.464, -0.425], [0.416, -0.439], [0.363, -0.45], [0.302, -0.459], [0.232, -0.465], [0.147, -0.469], [0, -0.47]],
  ] },
  { z: -0.543, ancho: 0.856, arriba: 0.675, abajo: -0.47, cintura: 0.058, contorno: [
      [[0, 0.675], [0.067, 0.666], [0.13, 0.644], [0.192, 0.619], [0.25, 0.584], [0.307, 0.548], [0.364, 0.513], [0.418, 0.472], [0.471, 0.431], [0.522, 0.386], [0.572, 0.342], [0.62, 0.295], [0.667, 0.247], [0.712, 0.196], [0.755, 0.145], [0.8, 0.094], [0.856, 0.058]],
      [[0.856, 0.058], [0.856, -0.099], [0.695, -0.1]],
      [[0.695, -0.1], [0.693, -0.183], [0.686, -0.229], [0.676, -0.267], [0.66, -0.299], [0.641, -0.328], [0.617, -0.353], [0.589, -0.376], [0.556, -0.396], [0.519, -0.414], [0.476, -0.429], [0.428, -0.441], [0.375, -0.452], [0.314, -0.46], [0.243, -0.465], [0.156, -0.469], [0, -0.47]],
  ] },
  { z: -0.978, ancho: 0.834, arriba: 0.67, abajo: -0.47, cintura: 0.045, contorno: [
      [[0, 0.67], [0.066, 0.66], [0.129, 0.637], [0.191, 0.613], [0.249, 0.58], [0.306, 0.546], [0.361, 0.509], [0.414, 0.468], [0.466, 0.427], [0.516, 0.383], [0.564, 0.337], [0.611, 0.289], [0.656, 0.241], [0.699, 0.19], [0.741, 0.139], [0.783, 0.087], [0.834, 0.045]],
      [[0.834, 0.045], [0.834, -0.105], [0.7, -0.115]],
      [[0.7, -0.115], [0.698, -0.198], [0.692, -0.243], [0.681, -0.279], [0.666, -0.31], [0.647, -0.337], [0.624, -0.361], [0.596, -0.382], [0.564, -0.401], [0.527, -0.417], [0.485, -0.431], [0.437, -0.443], [0.384, -0.453], [0.323, -0.46], [0.252, -0.466], [0.164, -0.469], [0, -0.47]],
  ] },
  { z: -1.412, ancho: 0.812, arriba: 0.665, abajo: -0.464, cintura: 0.014, contorno: [
      [[0, 0.665], [0.067, 0.655], [0.131, 0.637], [0.194, 0.613], [0.253, 0.581], [0.311, 0.546], [0.366, 0.507], [0.418, 0.465], [0.468, 0.421], [0.515, 0.374], [0.562, 0.326], [0.605, 0.274], [0.648, 0.223], [0.688, 0.17], [0.726, 0.115], [0.764, 0.06], [0.812, 0.014]],
      [[0.812, 0.014], [0.812, -0.112], [0.7, -0.12]],
      [[0.7, -0.12], [0.698, -0.204], [0.692, -0.247], [0.681, -0.282], [0.667, -0.312], [0.648, -0.338], [0.626, -0.36], [0.598, -0.381], [0.567, -0.399], [0.53, -0.414], [0.489, -0.427], [0.443, -0.439], [0.39, -0.448], [0.329, -0.455], [0.259, -0.46], [0.17, -0.463], [0, -0.464]],
  ] },
  { z: -1.847, ancho: 0.793, arriba: 0.66, abajo: -0.47, cintura: -0.024, contorno: [
      [[0, 0.66], [0.068, 0.651], [0.133, 0.635], [0.198, 0.613], [0.258, 0.581], [0.316, 0.545], [0.371, 0.504], [0.422, 0.46], [0.471, 0.412], [0.517, 0.362], [0.561, 0.31], [0.602, 0.256], [0.642, 0.2], [0.68, 0.144], [0.715, 0.085], [0.75, 0.027], [0.793, -0.024]],
      [[0.793, -0.024], [0.793, -0.108], [0.695, -0.117]],
      [[0.695, -0.117], [0.693, -0.206], [0.687, -0.251], [0.677, -0.287], [0.663, -0.317], [0.645, -0.343], [0.623, -0.366], [0.597, -0.387], [0.566, -0.404], [0.53, -0.42], [0.49, -0.433], [0.445, -0.445], [0.393, -0.454], [0.334, -0.461], [0.263, -0.466], [0.175, -0.469], [0, -0.47]],
  ] },
  { z: -2.282, ancho: 0.78, arriba: 0.645, abajo: -0.459, cintura: -0.06, contorno: [
      [[0, 0.645], [0.069, 0.638], [0.137, 0.624], [0.203, 0.603], [0.265, 0.572], [0.324, 0.536], [0.379, 0.494], [0.43, 0.448], [0.478, 0.398], [0.523, 0.345], [0.566, 0.291], [0.605, 0.234], [0.643, 0.177], [0.678, 0.117], [0.711, 0.057], [0.742, -0.005], [0.78, -0.06]],
      [[0.78, -0.06], [0.78, -0.101], [0.68, -0.115]],
      [[0.68, -0.115], [0.678, -0.201], [0.672, -0.245], [0.662, -0.28], [0.649, -0.309], [0.631, -0.335], [0.609, -0.358], [0.584, -0.377], [0.553, -0.395], [0.519, -0.41], [0.479, -0.423], [0.435, -0.434], [0.384, -0.443], [0.326, -0.45], [0.257, -0.455], [0.171, -0.458], [0, -0.459]],
  ] },
  { z: -2.608, ancho: 0.748, arriba: 0.63, abajo: -0.426, cintura: -0.082, contorno: [
      [[0, 0.63], [0.068, 0.621], [0.135, 0.609], [0.2, 0.588], [0.262, 0.559], [0.32, 0.523], [0.374, 0.482], [0.425, 0.436], [0.472, 0.386], [0.516, 0.333], [0.558, 0.279], [0.595, 0.221], [0.63, 0.163], [0.662, 0.102], [0.692, 0.041], [0.719, -0.022], [0.748, -0.082]],
      [[0.748, -0.082], [0.748, -0.1], [0.66, -0.112]],
      [[0.66, -0.112], [0.658, -0.19], [0.652, -0.23], [0.643, -0.261], [0.629, -0.288], [0.612, -0.312], [0.591, -0.333], [0.565, -0.351], [0.536, -0.367], [0.502, -0.381], [0.463, -0.393], [0.42, -0.403], [0.37, -0.411], [0.314, -0.418], [0.247, -0.422], [0.163, -0.425], [0, -0.426]],
  ] },
  { z: -2.934, ancho: 0.724, arriba: 0.615, abajo: -0.383, cintura: -0.09, contorno: [
      [[0, 0.615], [0.066, 0.605], [0.131, 0.59], [0.195, 0.569], [0.256, 0.542], [0.314, 0.508], [0.368, 0.468], [0.419, 0.424], [0.466, 0.375], [0.51, 0.325], [0.552, 0.272], [0.589, 0.216], [0.624, 0.158], [0.653, 0.098], [0.681, 0.036], [0.703, -0.027], [0.724, -0.09]],
      [[0.724, -0.09], [0.724, -0.102], [0.635, -0.11]],
      [[0.635, -0.11], [0.633, -0.176], [0.628, -0.211], [0.618, -0.239], [0.605, -0.262], [0.588, -0.283], [0.567, -0.301], [0.543, -0.317], [0.514, -0.331], [0.481, -0.343], [0.444, -0.354], [0.402, -0.363], [0.354, -0.37], [0.299, -0.376], [0.235, -0.38], [0.154, -0.382], [0, -0.383]],
  ] },
  { z: -3.259, ancho: 0.691, arriba: 0.6, abajo: -0.323, cintura: -0.085, contorno: [
      [[0, 0.6], [0.063, 0.589], [0.123, 0.568], [0.184, 0.547], [0.243, 0.522], [0.3, 0.491], [0.353, 0.454], [0.404, 0.413], [0.451, 0.369], [0.495, 0.322], [0.538, 0.272], [0.574, 0.218], [0.608, 0.162], [0.634, 0.102], [0.659, 0.042], [0.676, -0.021], [0.691, -0.085]],
      [[0.691, -0.085], [0.691, -0.098], [0.61, -0.105]],
      [[0.61, -0.105], [0.608, -0.157], [0.603, -0.185], [0.594, -0.207], [0.581, -0.226], [0.565, -0.242], [0.544, -0.257], [0.52, -0.27], [0.493, -0.281], [0.461, -0.291], [0.425, -0.3], [0.384, -0.307], [0.337, -0.313], [0.284, -0.317], [0.223, -0.32], [0.146, -0.322], [0, -0.323]],
  ] },
  { z: -3.585, ancho: 0.651, arriba: 0.57, abajo: -0.263, cintura: -0.07, contorno: [
      [[0, 0.57], [0.059, 0.562], [0.113, 0.537], [0.17, 0.518], [0.227, 0.495], [0.281, 0.468], [0.332, 0.436], [0.381, 0.4], [0.428, 0.36], [0.472, 0.318], [0.513, 0.272], [0.549, 0.222], [0.581, 0.169], [0.605, 0.112], [0.626, 0.053], [0.64, -0.008], [0.651, -0.07]],
      [[0.651, -0.07], [0.651, -0.09], [0.58, -0.095]],
      [[0.58, -0.095], [0.578, -0.134], [0.573, -0.156], [0.564, -0.173], [0.552, -0.187], [0.536, -0.2], [0.517, -0.211], [0.494, -0.221], [0.467, -0.23], [0.436, -0.238], [0.402, -0.245], [0.363, -0.25], [0.318, -0.255], [0.268, -0.258], [0.209, -0.261], [0.136, -0.262], [0, -0.263]],
  ] },
  { z: -3.911, ancho: 0.601, arriba: 0.535, abajo: -0.192, cintura: -0.04, contorno: [
      [[0, 0.535], [0.055, 0.53], [0.105, 0.506], [0.158, 0.49], [0.21, 0.471], [0.262, 0.449], [0.311, 0.422], [0.358, 0.392], [0.403, 0.357], [0.446, 0.321], [0.484, 0.279], [0.518, 0.234], [0.546, 0.184], [0.567, 0.13], [0.582, 0.074], [0.592, 0.017], [0.601, -0.04]],
      [[0.601, -0.04], [0.601, -0.065], [0.54, -0.08]],
      [[0.54, -0.08], [0.538, -0.103], [0.533, -0.117], [0.524, -0.128], [0.512, -0.138], [0.496, -0.147], [0.476, -0.155], [0.453, -0.162], [0.426, -0.168], [0.396, -0.174], [0.362, -0.179], [0.323, -0.183], [0.281, -0.186], [0.232, -0.189], [0.177, -0.191], [0.111, -0.192], [0, -0.192]],
  ] },
  { z: -4.237, ancho: 0.53, arriba: 0.5, abajo: -0.12, cintura: -0.01, contorno: [
      [[0, 0.5], [0.049, 0.497], [0.094, 0.48], [0.142, 0.469], [0.189, 0.455], [0.235, 0.437], [0.28, 0.415], [0.323, 0.39], [0.364, 0.36], [0.404, 0.328], [0.438, 0.29], [0.468, 0.248], [0.49, 0.2], [0.506, 0.149], [0.516, 0.097], [0.523, 0.043], [0.53, -0.01]],
      [[0.53, -0.01], [0.53, -0.03], [0.49, -0.04]],
      [[0.49, -0.04], [0.488, -0.054], [0.483, -0.063], [0.474, -0.071], [0.462, -0.079], [0.446, -0.085], [0.426, -0.091], [0.404, -0.097], [0.377, -0.102], [0.348, -0.106], [0.315, -0.11], [0.278, -0.113], [0.238, -0.115], [0.193, -0.117], [0.143, -0.119], [0.085, -0.12], [0, -0.12]],
  ] },
  { z: -4.563, ancho: 0.45, arriba: 0.47, abajo: -0.11, cintura: 0.02, contorno: [
      [[0, 0.47], [0.043, 0.467], [0.084, 0.458], [0.127, 0.45], [0.169, 0.44], [0.21, 0.426], [0.249, 0.407], [0.288, 0.387], [0.324, 0.361], [0.359, 0.332], [0.388, 0.297], [0.411, 0.257], [0.425, 0.212], [0.435, 0.165], [0.441, 0.117], [0.446, 0.068], [0.45, 0.02]],
      [[0.45, 0.02], [0.45, 0], [0.44, -0.01]],
      [[0.44, -0.01], [0.438, -0.024], [0.433, -0.036], [0.424, -0.046], [0.412, -0.055], [0.396, -0.063], [0.377, -0.071], [0.355, -0.078], [0.33, -0.085], [0.301, -0.091], [0.27, -0.096], [0.235, -0.1], [0.198, -0.104], [0.157, -0.106], [0.113, -0.108], [0.063, -0.11], [0, -0.11]],
  ] },
  { z: -4.781, ancho: 0.37, arriba: 0.45, abajo: -0.04, cintura: 0.11, contorno: [
      [[0, 0.45], [0.036, 0.448], [0.072, 0.444], [0.108, 0.44], [0.144, 0.434], [0.178, 0.424], [0.212, 0.41], [0.245, 0.395], [0.276, 0.376], [0.305, 0.353], [0.328, 0.325], [0.345, 0.294], [0.355, 0.259], [0.361, 0.222], [0.364, 0.185], [0.367, 0.147], [0.37, 0.11]],
      [[0.37, 0.11], [0.37, 0.095], [0.365, 0.08]],
      [[0.365, 0.08], [0.363, 0.065], [0.359, 0.052], [0.351, 0.04], [0.34, 0.029], [0.326, 0.019], [0.309, 0.009], [0.29, 0], [0.268, -0.008], [0.243, -0.015], [0.216, -0.022], [0.186, -0.027], [0.154, -0.032], [0.121, -0.035], [0.084, -0.038], [0.046, -0.039], [0, -0.04]],
  ] },
  { z: -4.954, ancho: 0.3, arriba: 0.41, abajo: 0.03, cintura: 0.22, contorno: [
      [[0, 0.41], [0.029, 0.409], [0.059, 0.406], [0.087, 0.402], [0.115, 0.396], [0.141, 0.388], [0.167, 0.378], [0.19, 0.367], [0.212, 0.354], [0.232, 0.341], [0.249, 0.326], [0.265, 0.31], [0.277, 0.293], [0.287, 0.275], [0.294, 0.257], [0.299, 0.239], [0.3, 0.22]],
      [[0.3, 0.22], [0.3, 0.215], [0.3, 0.211]],
      [[0.3, 0.211], [0.297, 0.193], [0.291, 0.175], [0.283, 0.158], [0.273, 0.141], [0.26, 0.125], [0.244, 0.11], [0.226, 0.095], [0.207, 0.082], [0.185, 0.071], [0.162, 0.06], [0.137, 0.051], [0.111, 0.044], [0.084, 0.038], [0.057, 0.033], [0.028, 0.031], [0, 0.03]],
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

// Estabilizadores (de una pieza, giran enteros), de las fotos y no del
// interactivo (allí son más cortos): muy en flecha, con la punta por detrás
// de la tobera (perfil al sol, el 25-1003 en vuelo, los dos en pista desde
// arriba), a la altura del canto de los bajos y del fondo de la tobera.
const ESTAB = { y: 0.05, raiz: 0.15, punta: 1.45, baRaiz: -3.6, baPunta: -4.92, bsRaiz: -4.92, bsPunta: -5.22 };
const baEstab = (x: number) => ESTAB.baRaiz + ((ESTAB.baPunta - ESTAB.baRaiz) * (x - ESTAB.raiz)) / (ESTAB.punta - ESTAB.raiz);
const bsEstab = (x: number) => ESTAB.bsRaiz + ((ESTAB.bsPunta - ESTAB.bsRaiz) * (x - ESTAB.raiz)) / (ESTAB.punta - ESTAB.raiz);

// Deriva: el borde de ataque recto desde el lomo y arriba plana a 1,91 m
// (interactivo, de lado). El borde de salida baja inclinado desde la esquina
// de arriba, sobre el final de la cola, hasta el lomo unos 35 cm más adelante
// (fotos de perfil del 25-1003 con teleobjetivo y al sol).
const DERIVA: [number, number][] = [[-2.95, 0.52], [-3.077, 0.61], [-3.259, 0.789], [-4.379, 1.893], [-4.976, 1.915], [-4.62, 0.44], [-3.7, 0.52]];

// ── Lanzadores y misil (fotos de frente, de la carga y del 25-1001 en vuelo) ─
// Un lanzador bajo cada ala, a 1,58 m del eje, colgado de un pilón corto: un
// raíl gris de 2,6 m con la punta de delante redondeada. Un AIM-120 en cada
// uno (en las fotos va uno solo, en el ala derecha), que asoma 0,9 m por
// delante.
const LANZ = { x: 1.58, y: -0.3, alto: 0.14, ancho: 0.13, z0: 0.77, z1: -1.86 };
const yBajoAla = (x: number) => ALA.y + caidaAla(x) - 0.275 * grosorAla(x);
const PILON = { y: yBajoAla(LANZ.x) + 0.02, abajo: LANZ.y + LANZ.alto / 2 - 0.01, z0: 0.35, z1: -1.2 };
// AIM-120C (en Creech, CATM-120C de instrucción, gris con bandas azules):
// 3,65 m y 178 mm (Fuerza Aérea y Marina de EE. UU.); radomo blanco, alas
// recortadas en X hacia la mitad y aletas en la cola (foto del 25-1001).
const MISIL = { y: LANZ.y - LANZ.alto / 2 - 0.02 - 0.089, punta: 1.67, r: 0.089 };
const zMisil = (d: number) => MISIL.punta - d;
// Un misil bajo el lanzador de x = `x` (el tubo no tiene espejo: uno por ala).
const misil = (x: number, lado: string): Pieza[] => {
  const aletasX = (id: string, contorno: [number, number][]): Pieza[] =>
    [45, -45, 135, -135].map((inclinacion, i) => ({
      tipo: "placa", id: `${id}-${i}${lado}`, acabado: "gris-misil", plano: "vertical", x, y: MISIL.y, grosor: 0.008, bisel: 0.002, inclinacion, planta: contorno,
    }));
  const anillo = (id: string, acabado: Pieza["acabado"], d: number, largo: number, r = MISIL.r + 0.0015): Pieza =>
    ({ tipo: "tubo", id: `${id}${lado}`, acabado, centro: [x, MISIL.y], perfil: [[zMisil(d), 0], [zMisil(d), r], [zMisil(d + largo), r], [zMisil(d + largo), 0]] });
  return [
    { tipo: "tubo", id: `misil-radomo${lado}`, acabado: "hueso", centro: [x, MISIL.y], perfil: [
      [zMisil(0), 0], [zMisil(0.03), 0.028], [zMisil(0.12), 0.055], [zMisil(0.25), 0.075], [zMisil(0.4), 0.086], [zMisil(0.52), MISIL.r], [zMisil(0.53), 0],
    ] },
    // Cuerpo gris mate que se estrecha al final, con la tobera negra.
    { tipo: "tubo", id: `misil${lado}`, acabado: "gris-misil", centro: [x, MISIL.y], perfil: [[zMisil(0.52), 0], [zMisil(0.52), MISIL.r], [zMisil(3.52), MISIL.r], [zMisil(3.65), 0.074], [zMisil(3.65), 0]] },
    anillo("misil-tobera", "hueco", 3.645, 0.01, 0.05),
    // Sección de guiado sin pintar, plateada, detrás del radomo (Udvar-Hazy).
    anillo("misil-guiado", "aluminio", 0.96, 0.46),
    // Juntas entre secciones, finas y oscuras.
    ...[0.52, 0.95, 1.42, 2.45, 3.2].map((d, i) => anillo(`misil-junta-${i}`, "junta", d - 0.005, 0.012, MISIL.r + 0.002)),
    // Canal de cables a lo largo del lomo y el enchufe del lanzador.
    { tipo: "caja", id: `misil-canal${lado}`, acabado: "gris-misil", redondeo: 0.006, centro: [x, MISIL.y + MISIL.r + 0.006, zMisil(1.95)], tam: [0.034, 0.016, 2.5] },
    { tipo: "caja", id: `misil-enchufe${lado}`, acabado: "metal", centro: [x, MISIL.y + MISIL.r + 0.014, zMisil(1.62)], tam: [0.05, 0.022, 0.07] },
    ...[1.5, 2.35, 2.62].map((d, i): Pieza => ({ tipo: "tubo", id: `misil-banda-${i}${lado}`, acabado: "azul", centro: [x, MISIL.y], perfil: [[zMisil(d), 0], [zMisil(d), MISIL.r + 0.002], [zMisil(d + 0.07), MISIL.r + 0.002], [zMisil(d + 0.07), 0]] })),
    ...aletasX("misil-alas", [[zMisil(1.62), MISIL.r - 0.01], [zMisil(1.95), MISIL.r - 0.01], [zMisil(1.93), 0.2], [zMisil(1.78), 0.2]]),
    ...aletasX("misil-aletas", [[zMisil(3.28), MISIL.r - 0.01], [zMisil(3.64), MISIL.r - 0.01], [zMisil(3.64), 0.27], [zMisil(3.5), 0.27]]),
    // Los patines con los que cuelga del raíl.
    ...[1.3, 2.6].map((d, i): Pieza => ({ tipo: "caja", id: `misil-patin-${i}${lado}`, acabado: "metal", centro: [x, MISIL.y + MISIL.r + 0.012, zMisil(d)], tam: [0.04, 0.03, 0.1] })),
  ];
};
const PIEZAS_MISIL: Pieza[] = [...misil(-LANZ.x, "-d"), ...misil(LANZ.x, "-i")];
const IDS_MISIL = PIEZAS_MISIL.map((p) => p.id);

// Boca de la toma de aire, bajo la arista: el cuenco de los bajos empieza en
// z 2,162 (el labio de abajo) y la boca es un óvalo ancho y aplanado, con el
// labio de arriba algo caído en el centro y el fondo redondo (interactivo y
// foto de frente). Por los costados, recortados en «<» hasta z 1,87 (foto del
// morro desde abajo), se ve el interior.
const TOMA = { z: 2.162, ancho: 0.6, arriba: -0.085, caida: 0.015, abajo: -0.415, n: 3, cuna: [1.869, -0.27] as [number, number] };
const BOCA_TOMA: [number, number][] = [
  ...Array.from({ length: 9 }, (_, i): [number, number] => { const x = (TOMA.ancho * i) / 8; return [x, TOMA.arriba - TOMA.caida * Math.cos((Math.PI / 2) * (x / TOMA.ancho))]; }),
  ...Array.from({ length: 16 }, (_, i): [number, number] => { const t = ((i + 1) / 16) * (Math.PI / 2); return [TOMA.ancho * Math.cos(t) ** (2 / TOMA.n), TOMA.arriba - (TOMA.arriba - TOMA.abajo) * Math.sin(t) ** (2 / TOMA.n)]; }),
];
// Tobera: la cola acaba en ella, y todo su final es el agujero (foto del
// 25-1003 en vuelo y render de detrás): un óvalo más ancho que alto, con un
// labio fino y claro y el interior negro. La última sección del fuselaje es
// este mismo óvalo (secciones-v2.mjs).
const TOBERA = { y: 0.22, r: 0.19, labio: 0.018, seccion: [0.3 / 0.19, 1] as [number, number] };

const PIEZAS: Pieza[] = [
  { tipo: "casco", id: "fuselaje", acabado: "gris-fu", secciones: [...SECCIONES, { ...SECCIONES[SECCIONES.length - 1], z: COLA_Z }] },
  { tipo: "ala", id: "ala", acabado: "gris-fu", y: ALA.y, raizDentro: true, estaciones: [
    estAla(ALA.raiz), estAla(MANDO.flap[0]), estAlaCorta(MANDO.flap[0]), estAlaCorta(MANDO.aleron[1]), estAla(MANDO.aleron[1]), estAla(ALA.punta),
  ] },
  { tipo: "ala", id: "flaps", acabado: "gris-fu", y: ALA.y, estaciones: [estMando(MANDO.flap[0] + MANDO.hueco), estMando(MANDO.flap[1])] },
  { tipo: "ala", id: "alerones", acabado: "gris-fu", y: ALA.y, estaciones: [estMando(MANDO.aleron[0]), estMando(MANDO.aleron[1] - MANDO.hueco)] },
  { tipo: "ala", id: "estabilizador", acabado: "gris-fu", y: ESTAB.y, raizDentro: true, estaciones: [
    [ESTAB.raiz, baEstab(ESTAB.raiz), bsEstab(ESTAB.raiz), 0.08, 0],
    [ESTAB.punta, ESTAB.baPunta, ESTAB.bsPunta, 0.025, 0],
  ] },
  { tipo: "placa", id: "deriva", acabado: "gris-fu2", plano: "vertical", x: 0, grosor: 0.045, bisel: 0.015, planta: DERIVA },
  { tipo: "prisma", id: "toma-boca", acabado: "hueco", eje: "z", simetrica: true, y: TOMA.z + 0.0025, alto: 0.002, planta: BOCA_TOMA },
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
  // Pilones y lanzadores, en las dos alas.
  { tipo: "ala", id: "pilones", acabado: "gris-fu", vertical: true, espejo: true, x: LANZ.x, y: PILON.y, estaciones: [[0, PILON.z0, PILON.z1, 0.07], [PILON.y - PILON.abajo, PILON.z0 - 0.08, PILON.z1, 0.06]] },
  // El lanzador, gris claro mate como el misil (fotos de la carga y del 25-1001):
  // una caja con la punta en ángulo arriba y, debajo, el raíl más estrecho y oscuro del que cuelga.
  { tipo: "placa", id: "lanzadores", acabado: "gris-misil", plano: "vertical", espejo: true, x: LANZ.x, grosor: LANZ.ancho, bisel: 0.012, planta: [
    [LANZ.z0 - 0.03, LANZ.y + 0.07], [LANZ.z1, LANZ.y + 0.07], [LANZ.z1, LANZ.y - 0.03], [LANZ.z0 - 0.16, LANZ.y - 0.03], [LANZ.z0, LANZ.y + 0.035],
  ] },
  // Tirador de la cola del lanzador.
  { tipo: "caja", id: "lanzadores-tirador", acabado: "metal", espejo: true, centro: [LANZ.x, LANZ.y + 0.02, LANZ.z1 - 0.02], tam: [0.05, 0.05, 0.04] },
  { tipo: "caja", id: "lanzadores-rail", acabado: "metal", espejo: true, redondeo: 0.01, centro: [LANZ.x, LANZ.y - LANZ.alto / 2 + 0.02, (LANZ.z0 + LANZ.z1) / 2 - 0.05], tam: [LANZ.ancho - 0.05, 0.04, LANZ.z0 - LANZ.z1 - 0.2] },
  ...PIEZAS_MISIL,
  { tipo: "tubo", id: "tobera-labio", acabado: "aluminio", centro: [0, TOBERA.y], seccion: TOBERA.seccion, perfil: [[COLA_Z + 0.004, TOBERA.r + 0.002], [COLA_Z - 0.008, TOBERA.r], [COLA_Z - 0.008, TOBERA.r - TOBERA.labio], [COLA_Z + 0.004, TOBERA.r - TOBERA.labio]] },
  { tipo: "tubo", id: "tobera-boca", acabado: "hueco", centro: [0, TOBERA.y], seccion: TOBERA.seccion, perfil: [[COLA_Z - 0.002, 0], [COLA_Z - 0.002, TOBERA.r - TOBERA.labio + 0.002], [COLA_Z - 0.004, TOBERA.r - TOBERA.labio + 0.002], [COLA_Z - 0.004, 0]] },
];

// ── Detalle pintado del HD (marcas del 25-1003, color y número del 25-1001) ───────────────────────────────────
// Posiciones medidas en la foto de perfil al sol con su cámara encajada
// (arte/uas-fuentes/fq-44a-fury/hd/perfil-der-*.json): cada punto de la foto
// llevado a la superficie de la maqueta.
// Colores del 25-1001 (foto en vuelo): gris oscuro, franja casi negra,
// marcas en gris claro y detalles amarillos.
const CLARO = "#b4b9bb", OSCURO_MARCA = "#1e2325", FRANJA = "#1d2224", AMARILLO = "#e2c21c";
const LADO: [number, number, number] = [-1, 0, 0];
// Una zona de pintura en un costado, dada por puntos [z, y]: `lado` −1, el
// derecho (x negativa), y 1, el izquierdo. La calca va del tamaño de la zona;
// en el derecho, la cola queda a la izquierda del dibujo, y en el izquierdo, a
// la derecha.
const zona = (lado: 1 | -1, puntos: [number, number][], x: number, color: string, sobre = ["fuselaje"]): Calca => {
  const zs = puntos.map(([z]) => z), ys = puntos.map(([, y]) => y);
  const [z0, z1] = [Math.min(...zs), Math.max(...zs)];
  // Proyectada de lado puro (así la altura del dibujo es la y de verdad) y con
  // la caja alta, para que su fondo llegue de la arista al lomo.
  // El centro, en la parte baja de la zona: ahí da el rayo que coloca la caja.
  const yc = Math.min(...ys) + 0.25 * (Math.max(...ys) - Math.min(...ys)), al = 2 * Math.max(0.7, Math.max(...ys) - Math.min(...ys)), an = z1 - z0;
  return {
    sobre, en: [lado * x, yc, (z0 + z1) / 2], desde: [lado, 0, 0], tam: [an, al],
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
  // Debajo de la franja, junto a la deriva, otro trozo oscuro con las puntas
  // en pico; y en la raíz de la deriva, una barra clara paralela al borde de
  // ataque (foto del 25-1001 en vuelo, con su cámara encajada).
  ...([-1, 1] as const).map((l) => zona(l, [[-3.17, 0.39], [-3.1, 0.43], [-2.55, 0.43], [-2.5, 0.39], [-2.55, 0.35], [-3.1, 0.35]], 0.55, FRANJA)),
  ...([-1, 1] as const).map((l) => zona(l, [[-3.42, 0.76], [-3.32, 0.75], [-3.58, 1.0], [-3.68, 1.0]], 0.03, "#7d8386", ["deriva"])),
  franjaArriba,
  // «YFQ-44A» en la franja, y al lado, en pequeño, «Anduril Industries /
  // Collaborative Combat Aircraft».
  { sobre: ["fuselaje"], en: [-0.53, 0.37, -1.37], desde: [-1, 0.7, 0], tam: [1.05, 0.2], dibujo: { tipo: "texto", texto: "YFQ-44A", color: CLARO, letra: "din" }, espejo: true, capa: 1 },
  { sobre: ["fuselaje"], en: [-0.55, 0.375, -0.82], desde: [-1, 0.7, 0], tam: [0.24, 0.14], dibujo: { tipo: "texto", texto: "Anduril Industries\nCollaborative\nCombat\nAircraft", color: CLARO, fino: true }, espejo: true, capa: 1 },
  // Símbolo de la Fuerza Aérea, detrás del ala, y «U.S. AIR FORCE» debajo.
  { sobre: ["fuselaje"], en: [-0.68, 0.105, -2.544], desde: [-1, 0.2, 0], tam: [0.24, 0.21], dibujo: { tipo: "logo", logo: "usaf", color: CLARO }, espejo: true },
  // En el avión va en oscuro, pero sobre los bajos en sombra no se leía: en
  // claro, como las demás marcas, y detrás del misil.
  { sobre: ["fuselaje"], en: [-0.62, -0.25, -2.6], desde: [-1, -0.1, 0], tam: [0.9, 0.09], dibujo: { tipo: "texto", texto: "U.S. AIR FORCE", color: CLARO, letra: "din" }, espejo: true },
  // Rayas «////» oscuras en el costado de abajo, delante de la cola.
  { sobre: ["fuselaje"], en: [-0.62, -0.115, -3.11], desde: [-1, 0, 0], tam: [0.22, 0.05], dibujo: { tipo: "rayas", color: OSCURO_MARCA, fondo: "rgba(0,0,0,0)", franjas: 4 }, espejo: true },
  // Logo y «ANDURIL» bajo la tapa del morro.
  { sobre: ["fuselaje"], en: [-0.68, 0.154, 1.47], desde: [-1, 0.2, 0], tam: [0.62, 0.115], dibujo: { tipo: "logo", logo: "anduril", color: CLARO }, espejo: true },
  // Rayas «////» sobre la raíz del ala.
  { sobre: ["fuselaje"], en: [-0.76, 0.179, 0.05], desde: [-1, 0.2, 0], tam: [0.25, 0.05], dibujo: { tipo: "rayas", color: CLARO, fondo: "rgba(0,0,0,0)", franjas: 4 }, espejo: true },
  // El recorte en «<» de cada costado de la toma: se ve el interior oscuro.
  ...([-1, 1] as const).map((l) => zona(l, [[TOMA.z, TOMA.arriba], TOMA.cuna, [TOMA.z, TOMA.abajo + 0.02]], 0.64, "#0c0e0e")),
  // Aviso de la toma en el lateral del carenado y rejillas.
  { sobre: ["fuselaje"], en: [-0.6, -0.2, 1.766], desde: [-1, 0, 0], tam: [0.11, 0.09], dibujo: { tipo: "aviso-toma", color: AMARILLO }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.63, 0.165, 1.98], desde: [-1, 0.4, 0], tam: [0.24, 0.19], dibujo: { tipo: "malla" }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.29, 0.568, -0.6], desde: [-1, 1, 0], tam: [0.4, 0.035], dibujo: { tipo: "malla" }, espejo: true, capa: 1 },
  { sobre: ["fuselaje"], en: [-0.33, 0.516, 1.43], desde: [-1, 1, 0], tam: [0.42, 0.014], dibujo: { tipo: "rect", color: "#262b29" }, espejo: true, capa: 1 },
  // La raya amarilla del costado del morro.
  { sobre: ["fuselaje"], en: [-0.6, 0.13, 2.5], desde: [-1, 0.2, 0], tam: [0.46, 0.028], dibujo: { tipo: "rect", color: AMARILLO }, espejo: true },
  // Toma empotrada en «Λ» junto a la veleta.
  zona(1, [[2.864, 0.169], [2.947, 0.262], [3.106, 0.224], [2.96, 0.232]], 0.45, "#1f2422"),
  zona(-1, [[2.864, 0.169], [2.947, 0.262], [3.106, 0.224], [2.96, 0.232]], 0.45, "#1f2422"),
  // Cola: rejilla de seis lados y triángulo de aviso.
  { sobre: ["fuselaje"], en: [-0.52, 0.197, -4.08], desde: [-1, 0.2, 0], tam: [0.24, 0.12], dibujo: { tipo: "malla", hex: true }, espejo: true },
  { sobre: ["fuselaje"], en: [-0.4, 0.193, -4.67], desde: [-1, 0.1, -0.4], tam: [0.15, 0.13], dibujo: { tipo: "aviso-toma", color: AMARILLO }, espejo: true },
  // Deriva: escudo del Mando de Combate Aéreo, «AI», «AF 25 1001» y la
  // punta de delante en amarillo.
  { sobre: ["deriva"], en: [-0.03, 1.386, -4.26], desde: LADO, tam: [0.21, 0.24], dibujo: { tipo: "logo", logo: "acc", color: CLARO }, espejo: true },
  { sobre: ["deriva"], en: [-0.03, 1.885, -4.47], desde: LADO, tam: [0.16, 0.03], dibujo: { tipo: "rect", color: AMARILLO }, espejo: true },
  { sobre: ["deriva"], en: [-0.03, 1.07, -4.03], desde: LADO, tam: [0.3, 0.32], dibujo: { tipo: "texto", texto: "AI", color: CLARO, letra: "din-estrecha" }, espejo: true },
  { sobre: ["deriva"], en: [-0.03, 0.8, -3.92], desde: LADO, tam: [0.46, 0.16], dibujo: { tipo: "serie", ano: "25", numero: "1001", color: CLARO, letra: "din-estrecha" }, espejo: true },
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

const PARTES: Parte[] = [
  {
    nombre: "Fuselaje",
    en: [0, 0.95, -0.6],
    piezas: ["fuselaje", "antena-0", "antena-1", "carenado-lomo", "antena-carenado", "antena-grande", "antena-ventral"],
    respaldo: "foto",
    fuentes: ["perfil", "rodaje", "interactivo", "twz"],
    texto: "10 m de largo, con el lomo en tejado, una arista viva en cada costado y los bajos redondeados. Va en el gris oscuro del 25-1001, con la franja casi negra y sus antenas en el lomo.",
    nota: "La forma sale del interactivo de Anduril; el largo, de medir con el AIM-120 en las fotos (las cifras de 6,1 m eran del diseño de 2023). El lomo, la cola y los estabilizadores, corregidos con las fotos.",
  },
  {
    nombre: "Morro y sensores",
    en: [0, 0.85, 3.0],
    piezas: ["veletas", "veletas-base"],
    respaldo: "foto",
    fuentes: ["morro", "frente", "perfil"],
    texto: "Sin cabina: un morro largo y afilado. A los lados, las veletas que miden el ángulo con el que vuela.",
    nota: "La joroba con ventana que lleva sobre el morro se ha dejado fuera. Qué cámaras o sensores lleva no se ha publicado.",
  },
  {
    nombre: "Toma de aire",
    en: [-0.85, -0.45, 2.1],
    piezas: ["toma-boca"],
    respaldo: "foto",
    fuentes: ["perfil", "frente", "vuelo"],
    texto: "Una sola toma, bajo el morro y debajo de la arista: una boca ancha y aplanada, de fondo redondo, con los costados recortados en «<». Una ranura la separa de la arista y el conducto lleva el aire al motor, en la cola.",
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
    piezas: ["deriva", "estabilizador", "tobera-labio", "tobera-boca"],
    respaldo: "foto",
    fuentes: ["vuelo", "perfil", "rodaje"],
    texto: "Una deriva alta con su timón, dos estabilizadores que giran enteros y, al final de la cola, la tobera ovalada del motor: toda la cola acaba en ella.",
    nota: "Que los estabilizadores se muevan enteros se deduce de que no tienen timón propio en las fotos.",
  },
  {
    nombre: "AIM-120 y lanzadores",
    en: [-1.58, -0.75, 0.9],
    piezas: ["pilones", "lanzadores", "lanzadores-rail", "lanzadores-tirador", ...IDS_MISIL],
    respaldo: "foto",
    fuentes: ["carga", "cautivo", "navy"],
    texto: "Un lanzador bajo cada ala, con un AIM-120 de instrucción, gris con bandas azules: el misil aire-aire de 3,65 m, guiado por radar, que el Fury disparó por primera vez en julio de 2026.",
    nota: "El misil, con las medidas oficiales; cómo cuelga, de la foto de la carga en Creech y del 25-1001 en vuelo. En las fotos lleva uno solo, en el ala derecha; aquí, uno en cada ala.",
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
    case "prisma":
      return { ...p, planta: p.planta.map(u2), y: u(p.y), alto: u(p.alto) };
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
  vistaTarjeta: [61, 20],
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
