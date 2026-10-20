// El visor del TARSIS de AERTEC (hoy Indra): el ISTAR blanco
// (src/data/uas/tarsis-75.ts) y el W armado (tarsis-w.ts), con un botón para
// cada uno. Abre en el ISTAR, que es también el de las miniaturas.
import type { Maqueta } from "./tipos";
import istar from "./tarsis-75.ts";

const tarsis: Maqueta = {
  ...istar,
  nombre: "TARSIS",
  versiones: [
    { rotulo: "ISTAR", modelo: "tarsis-75", inicial: true },
    { rotulo: "W", modelo: "tarsis-w" },
  ],
};

export default tarsis;
