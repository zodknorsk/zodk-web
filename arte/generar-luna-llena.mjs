// La Luna llena del bloque de la portada: public/luna/luna-llena.png. Es la
// cara visible de /luna con el sol detrás de quien mira (fase 0, sin sombra),
// pintada por el motor, 600 x 600 como luna-visible.png. La portada la gira
// con esa misma luz al pasar el ratón (montarGiroBloques en portada.ts).
//
// Rehacerla cuando cambien los datos de la Luna y subir LUNA_V en
// src/scripts/versiones.js:
//   node arte/generar-luna-llena.mjs
import fs from "node:fs";
import path from "node:path";
import { fotosDelMotor, REPO } from "./fotos-del-motor.mjs";

const { SIZE, RADIUS } = JSON.parse(fs.readFileSync(path.join(REPO, "public/luna/luna-datos.json")));

await fotosDelMotor(`
import { montarMarteGL } from "/src/scripts/marte-gl.js";
const m = await montarMarteGL(document.getElementById("c"), {
  base: "/public/luna/", prefijo: "luna-", lat0: 0, lon0: 0, luz: () => ({ fase: 0, lado: 1, expo: 1, frio: 0 }), disco: () => 2 * ${RADIUS},
});
window.foto = async () => {
  await new Promise((r) => setTimeout(r, 500));
  return m.instantanea(${SIZE}).toDataURL("image/png");
};`, [{ arg: null, salida: "public/luna/luna-llena.png" }]);
