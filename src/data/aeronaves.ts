// Naves y satélites que sobrevuelan la portada: dibujo, proporción,
// trayectoria y la ficha que sale al pasar el ratón.
//
// El hero muestra un objeto de esta lista a la vez, con su trayectoria
// ("vuelo"): "sweep" barrido diagonal, "orbita" pasada de lado a lado que
// vuelve, "fijo" quieta con una elipse pequeña. Solo cambia al pulsar el
// botón .hero-cambio, que trae otro al azar (salen todos antes de repetir).
// Lo lleva initObjeto() en Head.astro; sin JS se ve el primero de la lista.
//
// Dibujos, en public/zodk-<id>[-noche].{svg,png}: fotos PNG; el Sentinel-2,
// pixel art de arte/generar-aeronaves.py; y los drones que están en el hangar
// en pixel HD (el TB2 y el MQ-9), pixel HD de arte/generar-naves-uas-hd.mjs,
// que da también su `ratio` y sus `luces`. La versión de noche (a la luz de
// la luna) sale de arte/generar-naves-noche.py. Añadir una nave = su dibujo
// en public/, la de noche con ese script y una entrada aquí.
//
// Luces de posición (solo de noche): puntos fijos encima de la nave, en % de
// su imagen (x, y). Morro a la izquierda y vista desde arriba, así que el ala
// derecha es la de arriba (verde) y la izquierda la de abajo (roja). En el
// pixel HD van donde las puntas pintadas de la maqueta, que salen al revés
// (las maquetas del hangar están en espejo: la derecha queda abajo). Sin
// `luces`, la nave va a oscuras (el Shahed-136, como en la realidad; el
// satélite no lleva).
//
// Tarjetas: todas llevan las mismas filas y en este orden (Fabricante, País,
// Primer vuelo, Envergadura, MTOW, Techo, Autonomía) y después las propias del
// tipo (Velocidad, Radar, Tripulación, Alcance, Carga). Las etiquetas son las
// de las fichas del hangar y los términos los del glosario (`País` es el del
// fabricante; lo que no se sabe, «No publicado»). El subtítulo sigue el patrón
// de la «Categoría» del hangar. El Sentinel-2, que es un satélite, lleva las
// suyas.

export type Aeronave = {
  id: string;
  nombre: string;
  clase: string; // subtítulo de la ficha
  sprite: string; // /zodk-<id>.svg  (modo claro)
  spriteNoche: string; // /zodk-<id>-noche.svg
  ratio: string; // aspect-ratio del viewBox, "ancho / alto"
  vuelo:
    | "sweep"
    | "orbita"
    | "fijo"
    | "fijo-izq"
    | "fijo-centro"
    | "fijo-arriba"
    | "fijo-arriba-der"; // trayectoria (clases .hero-craft--* de portada.css)
  escala?: number; // multiplica el ancho en el hero (1 = normal). Solo "sweep".
  ancho?: number; // pixel HD: ancho en pantalla (px). El PNG va al doble: en retina, 1 px por píxel
  pais: string; // código de src/data/banderas.json: la chapa en pixel art junto a "País"
  luces?: {
    der: [number, number];
    izq: [number, number];
  };
  specs: [string, string][]; // [etiqueta, valor]
};

export const AERONAVES: Aeronave[] = [
  {
    id: "tb2",
    nombre: "Bayraktar TB2",
    clase: "Dron armado MALE",
    sprite: "/zodk-tb2.png",
    spriteNoche: "/zodk-tb2-noche.png",
    ratio: "264 / 224",
    ancho: 132,
    vuelo: "sweep",
    pais: "TR",
    luces: { der: [53, 88], izq: [52, 1] },
    specs: [
      ["Fabricante", "Baykar"],
      ["País", "Turquía"],
      ["Primer vuelo", "2014"],
      ["Envergadura", "12 m"],
      ["MTOW", "700 kg"],
      ["Techo", "~6.100 m"],
      ["Autonomía", "más de 18 h"],
      ["Carga", "150 kg"],
    ],
  },
  {
    id: "rq4",
    nombre: "RQ-4 Global Hawk",
    clase: "Dron de reconocimiento HALE",
    sprite: "/zodk-rq4.png",
    spriteNoche: "/zodk-rq4-noche.png",
    ratio: "234 / 328",
    vuelo: "fijo-izq",
    pais: "US",
    luces: { der: [64, 2], izq: [66, 93] },
    specs: [
      ["Fabricante", "Northrop Grumman"],
      ["País", "EE. UU."],
      ["Primer vuelo", "1998"],
      ["Envergadura", "39,9 m"],
      ["MTOW", "14.630 kg"],
      ["Techo", "~18.300 m"],
      ["Autonomía", "más de 30 h"],
    ],
  },
  {
    id: "mq9",
    nombre: "MQ-9 Reaper",
    clase: "Dron armado MALE",
    sprite: "/zodk-mq9.png",
    spriteNoche: "/zodk-mq9-noche.png",
    ratio: "264 / 245",
    ancho: 132,
    vuelo: "fijo-centro",
    pais: "US",
    luces: { der: [59, 89], izq: [57, 1] },
    specs: [
      ["Fabricante", "General Atomics"],
      ["País", "EE. UU."],
      ["Primer vuelo", "2001"],
      ["Envergadura", "20,1 m"],
      ["MTOW", "4.760 kg"],
      ["Techo", "~15.000 m"],
      ["Autonomía", "más de 27 h"],
      ["Carga", "1.700 kg"],
    ],
  },
  {
    id: "e2-hawkeye",
    nombre: "E-2 Hawkeye",
    clase: "Avión de alerta temprana embarcado",
    sprite: "/zodk-e2-hawkeye.png",
    spriteNoche: "/zodk-e2-hawkeye-noche.png",
    ratio: "426 / 416",
    vuelo: "fijo",
    pais: "US",
    luces: { der: [57, 3], izq: [56, 92] },
    specs: [
      ["Fabricante", "Northrop Grumman"],
      ["País", "EE. UU."],
      ["Primer vuelo", "2007 (E-2D)"],
      ["Envergadura", "24,6 m"],
      ["MTOW", "26.100 kg"],
      ["Techo", "~10.600 m"],
      ["Autonomía", "~6 h"],
      ["Radar", "AN/APY-9"],
      ["Tripulación", "5"],
    ],
  },
  {
    id: "u2",
    nombre: "Lockheed U-2S Dragon Lady",
    clase: "Avión de reconocimiento a gran altitud",
    sprite: "/zodk-u2.png",
    spriteNoche: "/zodk-u2-noche.png",
    ratio: "813 / 394",
    vuelo: "fijo-arriba",
    pais: "US",
    luces: { der: [57, 17], izq: [65, 86] },
    specs: [
      ["Fabricante", "Lockheed (Skunk Works)"],
      ["País", "EE. UU."],
      ["Primer vuelo", "1955 (1994 el U-2S)"],
      ["Envergadura", "31,4 m"],
      ["MTOW", "18.100 kg"],
      ["Techo", "~21.300 m"],
      ["Autonomía", "~12 h"],
      ["Tripulación", "1"],
    ],
  },
  {
    id: "sr71",
    nombre: "Lockheed SR-71 Blackbird",
    clase: "Avión de reconocimiento supersónico",
    sprite: "/zodk-sr71.png",
    spriteNoche: "/zodk-sr71-noche.png",
    ratio: "857 / 466",
    vuelo: "fijo-arriba-der",
    pais: "US",
    luces: { der: [84, 7], izq: [84, 92] },
    specs: [
      ["Fabricante", "Lockheed (Skunk Works)"],
      ["País", "EE. UU."],
      ["Primer vuelo", "1964"],
      ["Envergadura", "16,9 m"],
      ["MTOW", "78.000 kg"],
      ["Techo", "~25.900 m"],
      ["Autonomía", "~1,5 h (supersónico)"],
      ["Velocidad", "más de Mach 3,2"],
      ["Tripulación", "2"],
    ],
  },
  {
    id: "shahed136",
    nombre: "Shahed-136",
    clase: "Dron de ataque de un solo uso (OWA)",
    sprite: "/zodk-shahed136.png",
    spriteNoche: "/zodk-shahed136-noche.png",
    ratio: "788 / 440",
    vuelo: "sweep",
    escala: 0.5,
    pais: "IR",
    specs: [
      ["Fabricante", "Shahed Aviation Industries y HESA"],
      ["País", "Irán"],
      ["Primer vuelo", "No publicado"],
      ["Envergadura", "2,5 m"],
      ["MTOW", "~200 kg"],
      ["Techo", "No publicado"],
      ["Autonomía", "No publicado"],
      ["Alcance", "~2.000 km (estimación)"],
      ["Carga", "~50 kg"],
    ],
  },
  {
    id: "sat-sentinel",
    nombre: "Sentinel-2",
    clase: "Satélite de observación de la Tierra",
    sprite: "/zodk-sat-sentinel.svg",
    spriteNoche: "/zodk-sat-sentinel-noche.svg",
    ratio: "208 / 96",
    vuelo: "orbita",
    pais: "EU",
    specs: [
      ["Programa", "Copernicus · ESA"],
      ["País", "Unión Europea"],
      ["Órbita", "Heliosíncrona, 786 km"],
      ["Masa", "1.140 kg"],
      ["Instrumento", "MSI · 13 bandas"],
      ["Resolución", "10 / 20 / 60 m"],
      ["Revisita", "5 días"],
    ],
  },
];
