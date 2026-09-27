// Maqueta del MICH-2000 sacada de fotos públicas (Oboronka, el ejemplar «333»
// en el lanzador y las alas del ZTK-150 en la fábrica china). No hay medidas
// publicadas: las proporciones son a ojo. Las fotos, a tamaño completo, en
// arte/uas-fuentes/mich-2000/ (fuera de Git; enlaces en logo-files/UAS-WIP.md).
import type { Maqueta } from "./tipos";

const OBORONKA = "https://oboronka.mezha.ua/istoriya-dronu-mich-2000-314113/";

const maqueta: Maqueta = {
  nombre: "MICH-2000",
  subtitulo: "Dron de ataque de largo alcance",
  // ~2,5 m de envergadura, como el Shahed-136 (no hay medidas publicadas).
  escala: 1,
  pais: {
    codigo: "UA", nombre: "Ucrania", bandera: "🇺🇦",
    filas: ["aaaaaaaaaaa", "aaaaaaaaaaa", "aaaaaaaaaaa", "aaaaaaaaaaa",
            "ooooooooooo", "ooooooooooo", "ooooooooooo"],
    paleta: { a: "#0057b7", o: "#ffd700" },
  },
  piezas: [
    {
      // El cuerpo va medio hundido en el ala, como en las fotos del lanzador:
      // por encima asoma el lomo y por delante sobresale el morro.
      tipo: "tubo", id: "fuselaje", centro: [0, 0.02],
      perfil: [
        [1.4, 0], [1.37, 0.07], [1.3, 0.12], [1.18, 0.15], [1.02, 0.16],
        [-0.5, 0.155], [-0.68, 0.11], [-0.78, 0.065], [-0.8, 0.03], [-0.8, 0],
      ],
    },
    {
      // Media ala (x ≥ 0): [x, borde de ataque, borde de salida, grosor].
      // El borde de salida es recto; detrás van los elevones.
      tipo: "ala", id: "ala", y: 0,
      estaciones: [
        [0, 0.62, -0.77, 0.17],
        [1.22, -0.44, -0.76, 0.035],
      ],
    },
    // Juntas entre las secciones del fuselaje: la foto de las secciones
    // enseña que se monta por tramos unidos con anillos; cuántas hay y dónde,
    // no se ve en ningún dron montado (a ojo). Apenas asoman.
    ...[1.02, 0.55, 0.05, -0.42].map((z) => ({
      tipo: "tubo" as const, id: `junta-${z}`, acabado: "junta" as const, centro: [0, 0.02] as [number, number],
      perfil: [[z + 0.005, 0.1612], [z - 0.005, 0.1612]] as [number, number][],
    })),
    // Escarapela ucraniana a cada lado del morro, tras los canards.
    {
      tipo: "disco", id: "escarapela", acabado: "amarillo", espejo: true,
      en: [0.158, 0.03, 0.8], normal: [1, 0, 0], radio: 0.07, grosor: 0.008,
    },
    {
      tipo: "disco", id: "escarapela-centro", acabado: "azul", espejo: true,
      en: [0.164, 0.03, 0.8], normal: [1, 0, 0], radio: 0.042, grosor: 0.006,
    },
    {
      tipo: "placa", id: "elevones", acabado: "mando", plano: "horizontal", y: 0.004, grosor: 0.016, espejo: true,
      planta: [[0.2, -0.762], [1.16, -0.762], [1.16, -0.85], [0.2, -0.85]],
    },
    {
      tipo: "placa", id: "canards", plano: "horizontal", y: 0.02, grosor: 0.015, espejo: true,
      planta: [[0.14, 1.12], [0.38, 1.02], [0.38, 0.95], [0.14, 0.97]],
    },
    {
      // Más por debajo del ala que por encima, como el «333» del lanzador.
      tipo: "placa", id: "winglets", plano: "vertical", x: 1.23, grosor: 0.015, espejo: true,
      planta: [[-0.46, 0.12], [-0.78, 0.16], [-0.8, -0.3], [-0.54, -0.26]],
    },
    { tipo: "varilla", id: "motor", acabado: "metal", desde: [0, 0.02, -0.79], hasta: [0, 0.02, -0.9], radio: 0.045 },
    { tipo: "helice", id: "helice", acabado: "metal", en: [0, 0.02, -0.92], radio: 0.28, palas: 2 },
    { tipo: "varilla", id: "antena", acabado: "metal", desde: [0, 0.16, 0.82], hasta: [0, 0.28, 0.78], radio: 0.008 },
  ],
  partes: [
    {
      nombre: "Canards",
      en: [0.3, 0.02, 1.0],
      piezas: ["canards"],
      respaldo: "foto",
      fuentes: ["morro", "ztk150"],
      texto: "Dos aletas pequeñas a los lados del morro, por delante del ala. Son lo que distingue a primera vista al MICH-2000 —y al ZTK-150 chino del que sale— del Shahed iraní.",
    },
    {
      nombre: "Ala en delta recortada",
      en: [0.7, 0.07, -0.25],
      piezas: ["ala"],
      respaldo: "foto",
      fuentes: ["ztk150", "lanzador", "centro"],
      texto: "Ala volante: el borde de ataque va en flecha hasta unas puntas cortadas, y el borde de salida es casi recto. No tiene cola.",
      nota: "La flecha y la envergadura son a ojo: no hay medidas publicadas.",
    },
    {
      nombre: "Winglets",
      en: [1.23, -0.12, -0.66],
      piezas: ["winglets"],
      respaldo: "foto",
      fuentes: ["lanzador", "cola"],
      texto: "Placas verticales en las puntas del ala. Hacen de deriva, porque el dron no tiene cola. En el ejemplar blanco del lanzador llevan pintado el número 333.",
    },
    {
      nombre: "Elevones",
      en: [0.8, 0.012, -0.81],
      piezas: ["elevones"],
      respaldo: "foto",
      fuentes: ["ztk150"],
      texto: "Superficies móviles en el borde de salida. Suben y bajan a la vez para cabecear, y en sentido contrario para alabear.",
      nota: "Se ven con sus bisagras en las alas del ZTK-150 de la fábrica china.",
    },
    {
      nombre: "Fuselaje y cabeza de combate",
      en: [0.1, 0.16, 0.45],
      piezas: ["fuselaje", "junta-1.02", "junta-0.55", "junta-0.05", "junta--0.42"],
      respaldo: "fabricante",
      fuentes: ["secciones", "morro", "oboronka"],
      texto: "Un tubo que sobresale por delante del ala; en la fábrica ucraniana se monta por secciones. El fabricante habla de una cabeza de combate de 25 a 60 kg y de depósitos de varios tamaños según el alcance, hasta 2.000 km.",
      nota: "Dónde va cada cosa por dentro no se ha publicado. Las juntas entre secciones son reales, pero su número y su sitio son a ojo.",
    },
    {
      nombre: "Motor y hélice",
      en: [0.2, 0.02, -0.92],
      piezas: ["motor", "helice"],
      respaldo: "foto",
      fuentes: ["cola", "centro", "united24"],
      texto: "Motor de explosión de fabricación ucraniana con una hélice de dos palas que empuja desde atrás, al final del cuerpo.",
      nota: "El modelo del motor no es público.",
    },
    {
      nombre: "Antena dorsal",
      en: [0, 0.28, 0.78],
      piezas: ["antena"],
      respaldo: "reconstruccion",
      fuentes: ["lanzador", "oboronka"],
      texto: "Un mástil pequeño encima del morro. El fabricante ofrece enlace analógico, digital o por Starlink, y una antena anti-interferencias (CRPA) opcional.",
      nota: "Se ve un mástil en la foto del lanzador; qué antena es, no se sabe.",
    },
  ],
  fuentes: [
    { id: "morro", imagen: "morro-canard.jpg", titulo: "Morro con los canards, en la fábrica ucraniana", medio: "Oboronka", url: OBORONKA },
    { id: "lanzador", imagen: "lanzador-333-a.jpg", titulo: "El ejemplar «333» en su lanzador", medio: "Oboronka", url: OBORONKA },
    { id: "cola", imagen: "cola-winglets.jpg", titulo: "Drones terminados, vistos por detrás", medio: "Oboronka", url: OBORONKA },
    { id: "ztk150", imagen: "ztk150-fabrica-china-a.jpg", titulo: "Alas del ZTK-150 en la fábrica china", medio: "Oboronka", url: OBORONKA },
    { id: "secciones", imagen: "fuselaje-secciones.jpg", titulo: "Secciones del fuselaje antes de montar", medio: "Oboronka", url: OBORONKA },
    { id: "centro", imagen: "centro-ala-motor.jpg", titulo: "Centro del ala y soporte del motor", medio: "Oboronka", url: OBORONKA },
    { id: "oboronka", titulo: "Дрон MICH 2000: історія українського діпстрайку (datos del fabricante)", medio: "Oboronka", url: OBORONKA },
    { id: "united24", titulo: "Ukraine Secretly Built a Shahed-Like Drone for SBU", medio: "United24 Media", url: "https://united24media.com/defense-tech/ukraine-secretly-built-a-shahed-like-drone-for-sbu-now-thousands-are-flying-deep-into-russia-21681" },
  ],
};

export default maqueta;
