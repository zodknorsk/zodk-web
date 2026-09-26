// La Tierra quieta: public/planeta/tierra-quieto.png y tierra-quieto-noche.png.
// Es la vista inicial de la portada (VISTA_INICIAL de tierra-gl.js, zoom x1)
// con un píxel de arte por píxel de imagen, el disco centrado y transparente
// alrededor, de día y de noche. Se ve mientras carga el lienzo (o si no hay
// WebGL2) y la usan los vuelos de vuelta desde /luna y /marte. Va sin nubes,
// aurora ni chapas: se mueven o dependen del contenido.
//
// Rehacerla cuando cambien los datos de la Tierra o el motor, y subir
// PLANETA_V en src/scripts/versiones.js y el ?v= de tierra-quieto*.png en
// global.css:
//   node logo-files/generar-tierra-quieto.mjs
import { fotosDelMotor } from "./fotos-del-motor.mjs";

const LADO = 368;                                  // 2 x RADIO_ARTE (180) + margen para el borde suavizado

await fotosDelMotor(`
import { montarTierraGL } from "/src/scripts/tierra-gl.js";
const t = await montarTierraGL(document.getElementById("c"), {
  base: "/public/planeta/", disco: () => 2 * 180, banderas: [], sinNubes: true, sinAurora: true,
});
t.ponParado(true);
window.foto = async (noche) => {
  t.ponNoche(noche);
  await new Promise((r) => setTimeout(r, 2000));   // el fundido de día a noche dura 1,5 s
  return t.instantanea(${LADO}).toDataURL("image/png");
};`, [
  { arg: false, salida: "public/planeta/tierra-quieto.png" },
  { arg: true, salida: "public/planeta/tierra-quieto-noche.png" },
]);
