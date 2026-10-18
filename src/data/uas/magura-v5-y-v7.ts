// El visor del Magura de Uforce: el V5 (src/data/uas/magura-v5.ts) y el V7
// (magura-v7.ts), con un botón para cada uno. Abre en el V7.
import type { Maqueta } from "./tipos";
import v7 from "./magura-v7.ts";

const magura: Maqueta = {
  ...v7,
  versiones: [
    { rotulo: "V5", modelo: "magura-v5" },
    { rotulo: "V7", modelo: "magura-v7", inicial: true },
  ],
};

export default magura;
