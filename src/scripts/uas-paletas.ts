// Paletas del pixel art de las maquetas de drones: las usan el modo Pixel del
// visor (visor-uas.ts) y las miniaturas (arte/generar-uas-miniaturas.mjs).
import type { Acabado } from "../data/uas/tipos";

export type Paleta = [string, string, string, string];

// Paletas del modo Pixel (de oscuro a claro), por acabado. El negro, mate;
// las juntas, un punto más oscuras;
// los elevones, un punto más claros; motor, hélice y antena, metal gris; la
// escarapela, sus colores; las bombas del Reaper, verde oliva; el Raven, el gris
// algo verdoso de los del Ejército de Tierra (gris-et). La parte elegida va en blanco papel. De noche, el
// negro sube un poco para no perderse en la tarjeta oscura y el contorno
// pasa a ser un filo claro. Los drones claros (resalte «tinta», como el X10D
// o el Wildfire) llevan siempre contorno oscuro (contornoClaro): con el filo
// claro, las líneas se perdían sobre el gris.
export type Paletas = Record<Acabado | "resalte" | "tinta", Paleta> & { contorno: string; contornoClaro: string };
const COMUNES = {
  metal: ["#3b3f45", "#5a5f67", "#7d838c", "#a3a9b1"],
  gris: ["#50555d", "#7c828a", "#aab0b7", "#dcdfe3"],
  "gris-et": ["#4e5857", "#7a8584", "#a8b3b2", "#d9e0df"],
  "gris-tr": ["#4b535c", "#77818b", "#a4afb8", "#d4dbe1"],
  "gris-ga": ["#53535b", "#7f7f88", "#acacb5", "#dedde3"],
  "gris-x10": ["#525a60", "#7f888f", "#aeb7bd", "#e0e6ea"],
  "azul-x10": ["#0f3a72", "#1a55a0", "#2470cc", "#4d95e8"],
  "gris-qs": ["#565b5f", "#848a8f", "#b3b9bd", "#e2e6e9"],
  "arena-st": ["#4f3f26", "#7a6440", "#a68a5c", "#cfb383"],
  "arena-st2": ["#56462c", "#816a46", "#ae9466", "#d6bd8f"],
  lente: ["#070a10", "#0f1622", "#1b2738", "#324a6e"],
  amarillo: ["#8a6d00", "#b89200", "#e0b400", "#ffd500"],
  azul: ["#0b2a66", "#12398a", "#1a4fb5", "#2f68d6"],
  oliva: ["#2c301f", "#434a2f", "#5e6743", "#7e885c"],
  rojo: ["#5c0c10", "#8a141a", "#b5262c", "#d9474c"],
  blanco: ["#9a9c9e", "#c4c6c8", "#e4e5e6", "#f7f7f5"],
  "rojo-vivo": ["#6e0a10", "#a8121c", "#d81e2a", "#f0454f"],
  hueco: ["#050506", "#08090a", "#0c0d0f", "#121316"],
  "crema-ir": ["#5f5a50", "#8f887c", "#bfb6a7", "#e7e0d3"],
  aluminio: ["#4a4e54", "#767b82", "#a5aab0", "#d3d6da"],
  ocre: ["#5a4718", "#86692a", "#b8953e", "#dcc072"],
  laton: ["#5a4718", "#86692a", "#b8953f", "#e0c271"],
  hueso: ["#6a675e", "#9c988b", "#cac5b6", "#ece8dc"],
  cromato: ["#5a5630", "#86804a", "#b9b06e", "#dcd59a"],
  "blanco-h30": ["#959ba1", "#c0c6cc", "#dfe4e8", "#f3f6f8"],
  "tubo-h30": ["#22231d", "#34352c", "#4a4b3f", "#666858"],
  espuma: ["#262628", "#38383b", "#4e4e52", "#6c6c71"],
  "gris-fu": ["#333739", "#4f5458", "#6e7178", "#8b8d96"],
  "gris-fu2": ["#202526", "#333a3b", "#484f53", "#646b70"],
  "gris-misil": ["#4d5256", "#777c80", "#9fa4a8", "#c4c8cb"],
  "gris-gh": ["#2f3433", "#4a504f", "#69706e", "#878e8c"],
  "gris-mg": ["#3b4142", "#576061", "#7b8383", "#9ca4a4"],
  "gris-m7": ["#344243", "#4f6263", "#728889", "#93a9aa"],
  naranja: ["#7a2a08", "#b8420f", "#ee5a1a", "#ff8a4d"],
  marron: ["#3a2618", "#5a3c26", "#7e5638", "#a37452"],
  "gris-si": ["#4b5256", "#777f83", "#a4acb0", "#d5dbde"],
  "naranja-si": ["#7a4108", "#b5640f", "#ee8a1c", "#ffb45a"],
  "blanco-ta": ["#8f9290", "#bcbfbc", "#dee0dd", "#f4f5f2"],
  "gris-ta": ["#1f1d1b", "#34312e", "#4c4843", "#68635c"],
  "gris-ta2": ["#5e5c58", "#82807b", "#a9a69f", "#c9c6c0"],
  "lente-ta": ["#081520", "#0f2433", "#1a3a50", "#2d5672"],
  "gris-tw": ["#7b7e79", "#a2a59f", "#c4c7c0", "#e0e2dd"],
  "azul-fox": ["#2c3846", "#435669", "#5a7189", "#7f95ab"],
  "carbono-wh": ["#0f1012", "#1b1c1e", "#2a2c2f", "#43464a"],
  "carbono-gris": ["#1c1d1f", "#2c2e31", "#3c3e41", "#5a5d61"],
  "cobre-wh": ["#3d1810", "#62281a", "#8c3b26", "#b85c40"],
  "muelle-wh": ["#6b6450", "#958c70", "#cbbf98", "#e6dcbc"],
  "amarillo-wh": ["#6e5520", "#a07e30", "#d4ad4a", "#ecca72"],
  "campana-wh": ["#202225", "#363a3e", "#4f5358", "#767b81"],
  "helice-wh": ["#121315", "#1f2124", "#2c2e31", "#46494d"],
  "verde-gr": ["#1c2818", "#2c3d26", "#3f5636", "#5c774f"],
  "pardo-gr": ["#3d3420", "#5f5233", "#86754a", "#a8976a"],
  "obturador": ["#1a2c20", "#2a4634", "#3b6248", "#5a8468"],
  "anodizado-qh": ["#0e0f11", "#1a1b1e", "#2a2c30", "#45484d"],
  "gris-cola": ["#34353a", "#55565b", "#75767b", "#9d9ea3"],
} satisfies Record<string, Paleta>;
export const PALETAS: Record<"dia" | "noche", Paletas> = {
  dia: {
    ...COMUNES,
    negro: ["#101114", "#1c1e22", "#2c2f35", "#43474f"],
    "negro-ua": ["#101114", "#1c1e22", "#2c2f35", "#43474f"],
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
    "negro-ua": ["#15161a", "#23252a", "#34373e", "#4c5058"],
    junta: ["#121316", "#1f2125", "#2f3238", "#464a52"],
    mando: ["#1b1d21", "#2b2e34", "#3f434a", "#5a5f67"],
    resalte: ["#8f959d", "#b4b9c0", "#d6d9de", "#f1f2f4"],
    tinta: ["#0c0d10", "#17191d", "#24272c", "#363a41"],
    contorno: "#6b7079",
    contornoClaro: "#0c0d10",
  },
};
