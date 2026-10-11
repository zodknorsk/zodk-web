// Maqueta del Geran-2 ruso: la misma forma que el Shahed-136 (su maqueta
// sale del plano de Alexpl de 2024, que coincide con el del Geran-2 de 2025),
// en el negro de los ataques nocturnos y con el panel de la antena CRPA en el
// ala derecha, del plano de 2025. Fotos de restos en Ucrania. En metros
// (escala 1), con las mismas z que el Shahed: el morro en z = 1,555.
import type { Calca, Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";
import shahed from "./shahed-136.ts";

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Distancia desde la punta del morro (como se mide en el plano) a z.
const z = (d: number) => +(1.555 - d).toFixed(3);

// Todas las piezas del Shahed 2.0: lo pintado en crema, en negro (también
// los elevones, negros en todas las fotos) y la hélice, negra (decisión del
// usuario); el motor y los pernos, como en el iraní. El anillo oscuro del iraní, sobre el negro, es solo una
// junta.
const DEL_SHAHED: Pieza[] = shahed.piezas
  .filter((p) => p.id !== "anillo")
  .map((p) => (p.acabado === "crema-ir" || p.id === "helice" ? { ...p, acabado: "negro" } : p));

// El panel de la CRPA, sobre el ala derecha.
const CRPA = { y: 0.047, giro: { centro: [-0.57, 0.047, z(2.19)] as [number, number, number], eje: "x" as const, grados: -4 } };

// Calcas: del Shahed, los tornillos del morro, las juntas y los agujeros de
// debajo; fuera lo iraní (banderas, QR) y los puntos de la CRPA, que aquí es
// el panel en relieve. Lo ruso: «НЕ БРАТЬСЯ» («no agarrar») en amarillo en
// cada elevón, junto al borde de salida y leído desde detrás (Sumy,
// Vínnytsia), y «ГЕРАНЬ-2» en blanco en la cara de fuera de los winglets
// (Kiev, 2022).
const ARRIBA: [number, number, number] = [0, 1, 0];
const CALCAS: Calca[] = [
  // Los tornillos del morro, en gris metálico: con el del Shahed no se veían
  // sobre el negro.
  ...shahed.detalles!.calcas
    .filter((k) => !["bandera-ir", "qr"].includes(k.dibujo.tipo) && !(k.dibujo.tipo === "disco" && k.dibujo.color === "#4a4b4d"))
    .map((k): Calca => (k.dibujo.tipo === "disco" && k.dibujo.color === "#6a6862" ? { ...k, dibujo: { tipo: "disco", color: "#9a9da2" } } : k)),
  ...[0.475, 0.97].map((x): Calca => ({
    sobre: ["elevon-dentro", "elevon-fuera"], en: [x, 0.3, z(3.0)], desde: ARRIBA, tam: [0.26, 0.04], giro: 180, espejo: true,
    dibujo: { tipo: "texto", texto: "НЕ БРАТЬСЯ", color: "#e3c13f" },
  })),
  { sobre: ["winglets"], en: [1.3, 0.16, z(2.97)], desde: [1, 0, 0], tam: [0.22, 0.045], espejo: true, dibujo: { tipo: "texto", texto: "ГЕРАНЬ-2", color: "#e9e9e6" } },
];

// Partes del Shahed que aquí se juntan en una.
const piezasDe = (...nombres: string[]) => shahed.partes.filter((p) => nombres.includes(p.nombre)).flatMap((p) => p.piezas);

const maqueta: Maqueta = {
  nombre: "Geran-2",
  subtitulo: "Dron de ataque de un solo uso",
  escala: 1,
  pais: bandera("RU"),
  hd: true,
  contornoPixel: true,
  // Pixel: el negro al sol cae entre 2,9 y 3,2 escalones en la planta (en el
  // borde con el 3: el ala a franjas) y en 1,7 en la vista 3D; corridos 0,4
  // abajo, en 2,5–2,8 y 1,2–1,4.
  desfaseLuz: -0.4,
  // Sin ella, las sombras salían azul marino en el pixel.
  sombraNegra: true,
  // Tarjeta de /uas desde el mismo ángulo que la del Shahed.
  vistaTarjeta: [65, 30],
  // Las juntas y los tornillos, en el juego claro (como el MICH-2000): en
  // el gris del Shahed se perdían sobre el negro. Las juntas, algo más
  // marcadas, y los tornillos, más suaves (revisión del usuario).
  detalles: { calcas: CALCAS, costuras: shahed.detalles!.costuras.map((k) => ({ ...k, claro: true })), opacidad: { juntas: 0.32, tornillos: 0.55 } },
  piezas: [
    ...DEL_SHAHED,
    {
      tipo: "tubo", id: "junta-morro", acabado: "junta", centro: [0, 0],
      perfil: [[z(0.745), 0.1462], [z(0.755), 0.1462]],
    },
    {
      // Panel de la antena CRPA en el ala derecha (−x, como los puntos del
      // Shahed): el Kometa-M4 de cuatro elementos que dibuja el plano (luego
      // los hubo de 8, 12 y 16).
      // Apoyado en el extradós, que ahí baja de 4,9 a 3,8 cm del eje de
      // delante atrás: inclinado 4° (medido con un rayo sobre el ala).
      tipo: "placa", id: "crpa", acabado: "gris", plano: "horizontal", y: CRPA.y, grosor: 0.012, bisel: 0.003, girar: CRPA.giro,
      planta: [[-0.635, z(2.12)], [-0.5, z(2.12)], [-0.5, z(2.26)], [-0.635, z(2.26)]],
    },
    ...[[-0.535, 2.155], [-0.6, 2.155], [-0.535, 2.225], [-0.6, 2.225]].map(([x, d], i): Pieza => ({
      tipo: "disco", id: `crpa-elemento-${i}`, acabado: "junta", en: [x, CRPA.y + 0.008, z(d)], normal: [0, 1, 0], radio: 0.022, grosor: 0.004, girar: CRPA.giro,
    })),
  ],
  partes: [
    {
      nombre: "Morro y cabeza de combate",
      en: [0, 0.15, z(0.4)],
      piezas: ["fuselaje", "junta-morro"],
      respaldo: "foto",
      fuentes: ["plano", "sumy", "csis"],
      texto: "La cabeza de combate va en el morro. La iraní era de unos 50 kg; Rusia la cambió por las suyas, de fragmentación, incendiarias o termobáricas, y en 2025 llegaron las de 90 kg.",
      nota: "Por fuera, el morro es igual en todas; cuál lleva cada dron solo se sabe por los restos.",
    },
    {
      nombre: "Ala en delta, en negro",
      en: [-0.75, 0.06, z(2.3)],
      piezas: ["ala"],
      respaldo: "foto",
      fuentes: ["plano", "vinnytsia", "chernihiv"],
      texto: "El mismo ala volante del Shahed, de 2,5 m. Desde noviembre de 2023 salen pintados de negro, para que no se vean de noche; al principio, los de Alabuga solo por debajo. En los elevones llevan escrito «НЕ БРАТЬСЯ», «no agarrar».",
    },
    {
      nombre: "Antena CRPA",
      en: [-0.57, 0.08, z(2.19)],
      piezas: ["crpa", ...[0, 1, 2, 3].map((i) => `crpa-elemento-${i}`)],
      respaldo: "reconstruccion",
      fuentes: ["plano", "csis"],
      texto: "Varias antenas juntas que anulan el jamming del GNSS. El Nasir iraní y el primer Kometa ruso tenían cuatro; al mejorar la guerra electrónica ucraniana pasaron a 8, 12 y 16, rusas o chinas.",
      nota: "La maqueta lleva la de cuatro elementos que dibuja el plano de 2025; el sitio y la forma cambian de una serie a otra.",
    },
    {
      nombre: "Antena GNSS y módems",
      en: [0, 0.2, -1.0],
      piezas: ["carena-gnss"],
      respaldo: "reconstruccion",
      fuentes: ["plano", "csis"],
      texto: "Además del receptor de satélites, desde 2025 casi todos llevan módems 3G/4G con tarjetas SIM rusas y ucranianas, y después radios en malla: cada dron repite la señal del de al lado y un operador puede guiarlos en directo, a veces con cámara.",
      nota: "Los módems van dentro o pegados por fuera, sin sitio fijo; en la maqueta solo se ve la carena de la antena.",
    },
    {
      nombre: "Winglets",
      en: [1.275, 0.2, -1.43],
      piezas: ["winglets"],
      respaldo: "foto",
      fuentes: ["plano", "kiev"],
      texto: "Placas verticales en las puntas del ala. Llevan pintado «ГЕРАНЬ-2» y el número de serie, con la letra de la fábrica: Ы y otras para Alabuga, К para Izhevsk. En 2023 apareció uno con un módem 4G pegado con cinta a una de ellas.",
    },
    {
      nombre: "Elevones",
      en: [-0.9, 0.02, -1.42],
      piezas: piezasDe("Elevones"),
      respaldo: "foto",
      fuentes: ["plano", "vinnytsia"],
      texto: "Dos superficies móviles a cada lado del borde de salida, con sus varillas encima del ala.",
    },
    {
      nombre: "Motor y hélice",
      en: [0.22, 0.02, -1.42],
      piezas: piezasDe("Motor MD-550", "Hélice propulsora"),
      respaldo: "foto",
      fuentes: ["plano", "motor", "csis"],
      texto: "Motor de cuatro cilindros opuestos con hélice de dos palas que empuja desde atrás. El iraní MD-550 se cambió en Izhevsk por copias chinas del mismo Limbach alemán.",
    },
  ],
  fuentes: [
    { id: "vinnytsia", imagen: "vinnytsia-negro.jpg", titulo: "Un Geran negro caído en Vínnytsia, 2024", medio: "Policía Nacional de Ucrania (Wikimedia Commons)", url: `${COMMONS}Remains_of_Shahed_drone_in_Vinnytsia_Oblast,_2024-03-18_(01).jpg` },
    { id: "sumy", imagen: "sumy-negro.jpg", titulo: "Artificieros con un Geran-2 negro en Sumy, 2024", medio: "Policía Nacional de Ucrania (Wikimedia Commons)", url: `${COMMONS}Shahed_drone_in_Sumy_Oblast_(2024-10-17)_01.jpg` },
    { id: "chernihiv", imagen: "chernihiv-hielo.jpg", titulo: "Sobre el hielo del embalse de Kiev, 2026", medio: "Servicio de Emergencias de Ucrania (Wikimedia Commons)", url: `${COMMONS}Remains_of_Shahed_drone_in_Chernihiv_Oblast,_2026-02-19_(01).jpg` },
    { id: "kiev", imagen: "kiev-winglet.jpg", titulo: "Winglet con «ГЕРАНЬ-2» derribado en Kiev, 2022", medio: "Inteligencia militar de Ucrania (Wikimedia Commons)", url: `${COMMONS}Remains_of_a_downed_Geran-2_drone_in_Kyiv,_2022-12-14.jpg` },
    { id: "motor", imagen: "motor-vinnytsia.jpg", titulo: "El motor de un Geran caído en Vínnytsia", medio: "Policía Nacional de Ucrania (Wikimedia Commons)", url: `${COMMONS}Remains_of_Shahed_drone_in_Vinnytsia_Oblast,_2024-03-15_(01).jpg` },
    { id: "plano", imagen: "plano-2025.jpg", titulo: "Plano a escala del Geran-2 de 2025", medio: "Alexpl (Wikimedia Commons)", url: `${COMMONS}Geran2-335-250-2025.svg` },
    { id: "csis", titulo: "From Shahed to Geran: How Russia Continues to Reinvent the One-Way Attack Drone", medio: "CSIS", url: "https://www.csis.org/analysis/shahed-geran-how-russia-continues-reinvent-one-way-attack-drone" },
  ],
};

export default maqueta;
