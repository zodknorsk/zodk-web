// Marte quieto: public/marte/marte-quieto.png. Es la vista inicial de /marte
// (VISTA_INICIAL de marte-gl.js, zoom x1) con un píxel de arte por píxel de
// imagen, 450 x 450, el disco centrado y transparente alrededor. La usan el
// vuelo de la portada a /marte (la imagen que crece desde el Marte pequeño) y
// /marte mientras carga el lienzo.
//
// Rehacerla cuando cambien los datos de Marte (generar-marte.py --canvas) y
// subir MARTE_V en src/scripts/versiones.js y el ?v= de marte-quieto.png en
// global.css:
//   node logo-files/generar-marte-quieto.mjs
import fs from "node:fs";
import path from "node:path";
import { fotosDelMotor, REPO } from "./fotos-del-motor.mjs";

const LADO = 450;
const { RADIUS } = JSON.parse(fs.readFileSync(path.join(REPO, "public/marte/marte-datos.json")));

await fotosDelMotor(`
import { montarMarteGL } from "/src/scripts/marte-gl.js";
const m = await montarMarteGL(document.getElementById("c"), { base: "/public/marte/", disco: () => 2 * ${RADIUS} });
window.foto = async () => {
  await new Promise((r) => setTimeout(r, 500));
  return m.instantanea(${LADO}).toDataURL("image/png");
};`, [{ arg: null, salida: "public/marte/marte-quieto.png" }]);
