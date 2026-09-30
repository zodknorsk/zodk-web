// Maqueta del Shahed-136 iraní, sacada del plano a escala de Commons (Alexpl,
// la revisión de 2024: 3,35 m de largo y 2,5 m de envergadura; dibuja un
// Geran-2 de la serie M, iraní, que por fuera es igual), del de la DIA y de
// fotos de ejemplares iraníes en exposiciones y desfiles de 2023. La primera
// versión salió de la de 2023 (3,5 m), con el morro más largo y otro borde de
// ataque; se rehízo con esta, que es la que se parece al plano de la DIA y la
// misma forma que el del Geran-2 de 2025. Es la geometría de los dos: la
// maqueta del Geran-2 la importa. Se escribe en metros (escala 1): el morro
// en z = 1,555 y la hélice en z = −1,66. Las fotos, a tamaño completo, en
// arte/uas-fuentes/shahed-136/ (fuera de Git; enlaces en docs/uas.md).
import type { Maqueta, Pieza } from "./tipos";
import { bandera } from "../banderas.ts";

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Distancia desde la punta del morro (como se mide en el plano) a z.
const z = (d: number) => +(1.555 - d).toFixed(3);

// El ala va 1,5 cm por debajo del eje del cuerpo (vista de frente del plano).
const ALA_Y = -0.015;

// Borde de ataque: recto, 1,34 m hacia atrás por cada metro hacia la punta.
const ba = (x: number) => z(0.988 + (x - 0.185) * 1.34);

// Motor Mado MD-550: cuatro cilindros opuestos, dos a cada lado del cárter.
const cilindros: Pieza[] = [z(2.905), z(3.035)].map((zc) => ({
  tipo: "varilla", id: `cilindro-${zc}`, acabado: "metal", espejo: true,
  desde: [0.06, 0, zc], hasta: [0.22, 0, zc], radio: 0.045,
}));

// Varillas de mando de los elevones, encima del ala (dos por lado).
const varillas: Pieza[] = [0.7, 0.82].map((x) => ({
  tipo: "varilla", id: `varilla-${x}`, acabado: "metal", espejo: true,
  desde: [x, ALA_Y + 0.02, z(2.805)], hasta: [x, ALA_Y + 0.025, z(2.925)], radio: 0.006,
}));

const maqueta: Maqueta = {
  nombre: "Shahed-136",
  subtitulo: "Dron de ataque de un solo uso",
  escala: 1,
  pais: bandera("IR"),
  resalte: "tinta",
  piezas: [
    {
      // Morro redondo (la cabeza de combate) y un tubo de 0,29 m que se
      // estrecha al final, donde se atornilla el motor.
      tipo: "tubo", id: "fuselaje", acabado: "gris", centro: [0, 0],
      perfil: [
        [z(0), 0], [z(0.012), 0.043], [z(0.025), 0.058], [z(0.049), 0.077], [z(0.074), 0.089],
        [z(0.098), 0.098], [z(0.123), 0.108], [z(0.172), 0.12], [z(0.277), 0.132], [z(0.369), 0.138],
        [z(0.462), 0.142], [z(0.554), 0.145], [z(2.505), 0.145], [z(2.705), 0.132], [z(2.805), 0.11],
        [z(2.845), 0.078], [z(2.855), 0],
      ],
    },
    {
      // El anillo oscuro donde el morro se une al cuerpo (A642 del desfile,
      // ejemplares de Kermanshah).
      tipo: "tubo", id: "anillo", acabado: "negro", centro: [0, 0],
      perfil: [[z(0.75), 0.1515], [z(0.79), 0.1515]],
    },
    {
      // Carena baja de la antena GNSS, encima del último tramo del cuerpo
      // (plano de frente y de lado; drone-warfare la marca en el mismo
      // sitio). La planta va encogida lo que crece el bisel.
      tipo: "placa", id: "carena-gnss", acabado: "gris", plano: "horizontal", simetrica: true,
      y: 0.158, grosor: 0.05, bisel: 0.015,
      planta: [[0, z(2.405)], [0.045, z(2.435)], [0.065, z(2.505)], [0.065, z(2.605)], [0.045, z(2.665)], [0, z(2.685)]],
    },
    {
      // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor].
      // Junto al cuerpo, el borde de salida se corta donde va el motor; de
      // 0,24 a 1,22 m, detrás van los elevones; la punta llega hasta atrás.
      tipo: "ala", id: "ala", acabado: "gris", y: ALA_Y,
      estaciones: [
        [0, ba(0), z(2.845), 0.22],
        [0.24, ba(0.24), z(2.845), 0.2],
        [0.24, ba(0.24), z(2.895), 0.2],
        [1.22, ba(1.22), z(2.895), 0.055],
        [1.22, ba(1.22), z(3.055), 0.055],
        [1.27, ba(1.27), z(3.055), 0.052],
      ],
    },
    // Dos elevones a cada lado, con la junta entre ellos.
    {
      tipo: "placa", id: "elevon-dentro", acabado: "gris", plano: "horizontal", y: ALA_Y, grosor: 0.018, espejo: true,
      planta: [[0.26, z(2.9)], [0.765, z(2.9)], [0.765, z(3.055)], [0.26, z(3.055)]],
    },
    {
      tipo: "placa", id: "elevon-fuera", acabado: "gris", plano: "horizontal", y: ALA_Y, grosor: 0.018, espejo: true,
      planta: [[0.775, z(2.9)], [1.215, z(2.9)], [1.215, z(3.055)], [0.775, z(3.055)]],
    },
    ...varillas,
    {
      // Casi lo mismo por encima del ala que por debajo, con el borde de
      // ataque en flecha y el de detrás recto (plano de lado y de frente).
      tipo: "placa", id: "winglets", acabado: "gris", plano: "vertical", x: 1.275, grosor: 0.02, espejo: true, bisel: 0.004,
      planta: [[z(2.705), ALA_Y], [z(2.825), 0.21], [z(3.135), 0.21], [z(3.135), -0.235], [z(2.855), -0.235]],
    },
    {
      // Tubos de Pitot en el borde de ataque, a media ala (plano de la DIA).
      tipo: "varilla", id: "pitot", acabado: "metal", espejo: true,
      desde: [0.7, ALA_Y, ba(0.7) + 0.02], hasta: [0.7, ALA_Y, ba(0.7) + 0.25], radio: 0.008,
    },
    {
      tipo: "caja", id: "carter", acabado: "metal", centro: [0, 0, z(2.975)], tam: [0.13, 0.14, 0.24], redondeo: 0.02,
    },
    ...cilindros,
    { tipo: "varilla", id: "buje", acabado: "metal", desde: [0, 0, z(3.095)], hasta: [0, 0, z(3.225)], radio: 0.03 },
    { tipo: "helice", id: "helice", acabado: "gris", en: [0, 0, z(3.215)], radio: 0.33, palas: 2, giro: 60 },
  ],
  partes: [
    {
      nombre: "Morro y cabeza de combate",
      en: [0, 0.15, z(0.4)],
      piezas: ["fuselaje", "anillo"],
      respaldo: "foto",
      fuentes: ["desfile", "frente", "plano", "csis"],
      texto: "La cabeza de combate va en el morro, delante del anillo oscuro que lo une al cuerpo: unos 50 kg de explosivo. Detrás van el depósito, la electrónica de navegación y el motor.",
      nota: "Qué hay dentro de cada tramo sale de los restos analizados en Ucrania y del plano de la DIA, no de Irán.",
    },
    {
      nombre: "Ala en delta",
      en: [0.75, 0.06, z(2.305)],
      piezas: ["ala"],
      respaldo: "foto",
      fuentes: ["plano", "lado", "detras"],
      texto: "Ala volante en delta, sin cola, de 2,5 m de punta a punta. El borde de ataque va en flecha hasta unas puntas cortadas y el de salida es recto.",
    },
    {
      nombre: "Winglets",
      en: [1.275, 0.2, z(3.005)],
      piezas: ["winglets"],
      respaldo: "foto",
      fuentes: ["desfile", "lado", "mercer"],
      texto: "Placas verticales en las puntas del ala, que hacen de deriva. En los ejemplares de exposición llevan pintada la bandera iraní y «Made in I.R. Iran»; en el desfile, un número de serie. Una de ellas, con su número, se recuperó entre los restos del Mercer Street.",
    },
    {
      nombre: "Elevones",
      en: [0.9, 0.02, z(2.975)],
      piezas: ["elevon-dentro", "elevon-fuera", ...varillas.map((v) => v.id)],
      respaldo: "foto",
      fuentes: ["detras", "plano"],
      texto: "Dos superficies móviles a cada lado del borde de salida. Encima del ala se ven las varillas que las mueven.",
    },
    {
      nombre: "Motor MD-550",
      en: [0.22, 0.02, z(2.975)],
      piezas: ["carter", ...cilindros.map((c) => c.id)],
      respaldo: "foto",
      fuentes: ["motor", "detras", "lado"],
      texto: "Motor de explosión iraní de cuatro cilindros opuestos, el Mado MD-550, copia del alemán Limbach L550E. Va al aire, al final del cuerpo, y es lo que hace ese zumbido de moto que se oye desde el suelo.",
    },
    {
      nombre: "Hélice propulsora",
      en: [0, 0.3, z(3.215)],
      piezas: ["helice", "buje"],
      respaldo: "foto",
      fuentes: ["lado", "detras"],
      texto: "Hélice de dos palas que empuja desde atrás.",
    },
    {
      nombre: "Antena GNSS",
      en: [0, 0.2, z(2.545)],
      piezas: ["carena-gnss"],
      respaldo: "reconstruccion",
      fuentes: ["plano", "detras", "dronewarfare"],
      texto: "Una carena baja encima del cuerpo, delante del motor, con la antena del receptor de satélites. Con ella y la navegación inercial sigue su ruta sin que nadie lo pilote.",
      nota: "Sale en el plano de Alexpl y en el esquema de drone-warfare; en las fotos iraníes solo se adivina el bulto. Su forma exacta es supuesta.",
    },
    {
      nombre: "Tubos de Pitot",
      en: [0.7, 0.02, ba(0.7) + 0.2],
      piezas: ["pitot"],
      respaldo: "reconstruccion",
      fuentes: ["dia", "frente"],
      texto: "Dos tubos finos que salen del borde de ataque, uno en cada ala, para medir la velocidad del aire.",
      nota: "Su sitio y su largo salen del plano de la DIA; en las fotos iraníes apenas se distinguen.",
    },
  ],
  fuentes: [
    { id: "desfile", imagen: "desfile-teheran.jpg", titulo: "En un desfile en Teherán, en 2023", medio: "Meghdad Madadi, Tasnim (Wikimedia Commons)", url: `${COMMONS}Military_equipment_displayed_for_the_44th_Iranian_revolution_anniversary_rally_-_Shahed_136.jpg` },
    { id: "lado", imagen: "expo-lado.jpg", titulo: "De lado, con el motor al aire, en Kermanshah", medio: "Behrouz Ahmadi (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(018).jpg` },
    { id: "detras", imagen: "expo-detras.jpg", titulo: "Desde detrás: el motor, la hélice y los elevones", medio: "Yahya Biabadi, Mehr (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Kermanshah_(033).jpg` },
    { id: "frente", imagen: "expo-frente.jpg", titulo: "De frente, en una exposición en Qom", medio: "Mohammadreza Jabbari (Wikimedia Commons)", url: `${COMMONS}2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Qom_(33).jpg` },
    { id: "motor", imagen: "motor-md-550.jpg", titulo: "Un motor MD-550 recuperado en Ucrania", medio: "Zenwort (Wikimedia Commons)", url: `${COMMONS}MD-550_Shahed-136_20260702_122912cr.jpg` },
    { id: "mercer", imagen: "mercer-street-winglet.jpg", titulo: "Restos del winglet en el Mercer Street, 2021", medio: "Mando Central Naval de EE. UU. (Wikimedia Commons)", url: `${COMMONS}29-30JULY2021_Drone_Attack_on_MT_Mercer_Street_-_Vertical_Stabilizer.jpg` },
    { id: "plano", imagen: "plano-cuatro-vistas.jpg", titulo: "Plano de cuatro vistas, a escala (revisión de 2024)", medio: "Alexpl (Wikimedia Commons)", url: `${COMMONS}Shahed-136-335-250draw.svg` },
    { id: "dia", imagen: "plano-dia.jpg", titulo: "Planta, perfil y panza, con sus partes", medio: "Agencia de Inteligencia de Defensa de EE. UU. (Wikimedia Commons)", url: `${COMMONS}Shahed-136_(Geran-2)_drawing_by_Defense_Intelligence_Agency.jpg` },
    { id: "dronewarfare", titulo: "Shahed-136 and Geran: Specs, Production, Jet Variants", medio: "Drone Warfare", url: "https://drone-warfare.com/research/shahed-136/" },
    { id: "csis", titulo: "Shahed-131 and -136", medio: "CSIS Missile Defense Project", url: "https://missilethreat.csis.org/missile/shahed-131-and-136/" },
  ],
};

export default maqueta;
