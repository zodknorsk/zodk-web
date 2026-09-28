// Paletas del pixel art de las maquetas de drones: las usan el modo Pixel del
// visor (visor-uas.ts) y las miniaturas (arte/generar-uas-miniaturas.mjs).
import type { Acabado } from "../data/uas/tipos";

export type Paleta = [string, string, string, string];

// Paletas del modo Pixel (de oscuro a claro), por acabado. El dron, negro
// mate como los ejemplares de la fábrica; las juntas, un punto más oscuras;
// los elevones, un punto más claros; motor, hélice y antena, metal gris; la
// escarapela, sus colores; las bombas del Reaper, verde oliva. La parte elegida va en blanco papel. De noche, el
// negro sube un poco para no perderse en la tarjeta oscura y el contorno
// pasa a ser un filo claro. Los drones claros (resalte «tinta», como el X10D
// o el Wildfire) llevan siempre contorno oscuro (contornoClaro): con el filo
// claro, las líneas se perdían sobre el gris.
export type Paletas = Record<Acabado | "resalte" | "tinta", Paleta> & { contorno: string; contornoClaro: string };
const COMUNES = {
  metal: ["#3b3f45", "#5a5f67", "#7d838c", "#a3a9b1"],
  gris: ["#50555d", "#7c828a", "#aab0b7", "#dcdfe3"],
  lente: ["#070a10", "#0f1622", "#1b2738", "#324a6e"],
  amarillo: ["#8a6d00", "#b89200", "#e0b400", "#ffd500"],
  azul: ["#0b2a66", "#12398a", "#1a4fb5", "#2f68d6"],
  oliva: ["#2c301f", "#434a2f", "#5e6743", "#7e885c"],
} satisfies Record<string, Paleta>;
export const PALETAS: Record<"dia" | "noche", Paletas> = {
  dia: {
    ...COMUNES,
    negro: ["#101114", "#1c1e22", "#2c2f35", "#43474f"],
    junta: ["#0d0e11", "#18191d", "#27292e", "#3c4047"],
    mando: ["#16181b", "#25282d", "#383c43", "#51565f"],
    resalte: ["#9aa0a8", "#bfc4ca", "#dfe2e6", "#f7f8f9"],
    tinta: ["#0c0d10", "#17191d", "#24272c", "#363a41"],
    contorno: "#08090b",
    contornoClaro: "#08090b",
  },
  noche: {
    ...COMUNES,
    negro: ["#15161a", "#23252a", "#34373e", "#4c5058"],
    junta: ["#121316", "#1f2125", "#2f3238", "#464a52"],
    mando: ["#1b1d21", "#2b2e34", "#3f434a", "#5a5f67"],
    resalte: ["#8f959d", "#b4b9c0", "#d6d9de", "#f1f2f4"],
    tinta: ["#0c0d10", "#17191d", "#24272c", "#363a41"],
    contorno: "#6b7079",
    contornoClaro: "#0c0d10",
  },
};
