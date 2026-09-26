// Naves y satélites que sobrevuelan / orbitan la portada. El pixel art lo
// genera arte/generar-aeronaves.py -> public/zodk-<id>[-noche].svg; aquí
// van los datos que necesita la web (sprite, proporción, trayectoria y la
// ficha que sale al pasar el ratón).
//
// Para añadir una nave: dibújala en generar-aeronaves.py, copia el SVG a
// public/, y añade una entrada aquí. Se suma sola a la rotación del hero.
//
// El hero muestra UN objeto de esta lista a la vez, con su trayectoria
// ("vuelo"): "sweep" barrido diagonal, "orbita" pasada de lado a lado que rebota
// en el limbo y vuelve, "fijo" quieta con una elipse pequeña. No hay relevo
// automático: el objeto solo cambia al pulsar el botón .hero-cambio (espacio
// profundo, arriba a la izquierda), que desvanece el actual y trae otro al azar
// —"bolsa barajada": se recorren todos antes de repetir—. Lo lleva initObjeto()
// en Head.astro; sin JS se ve el primero de la lista, quieto.
//
// Excepción de dibujo: ninguna sale ya del script salvo el Sentinel-2. El
// TB3, el MQ-9, el RQ-4, el E-2, el U-2, el SR-71 y el Shahed-136 son fotos
// PNG tal cual; su versión de noche (-noche.png, a la luz de la luna) la saca
// arte/generar-naves-noche.py. Todas en public/zodk-<id>[-noche].{svg,png}.
//
// Luces de posición (solo de noche): puntos fijos encima de la nave, en % de
// su imagen (x, y). Morro a la izquierda y vista desde arriba, así que el ala
// DERECHA es la de arriba (verde) y la IZQUIERDA la de abajo (roja). Solo esas
// dos (el usuario quitó la blanca de cola, los destellos y la baliza). Sin
// `luces`, la nave va a oscuras (el Shahed-136, como en la realidad; el
// satélite no lleva).

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
    | "fijo-arriba-der"; // trayectoria (ver global.css)
  escala?: number; // multiplica el ancho en el hero (1 = normal). Solo "sweep".
  bandera?: string; // emoji junto a "Origen" (o "País")
  luces?: {
    der: [number, number];
    izq: [number, number];
  };
  specs: [string, string][]; // [etiqueta, valor]
};

export const AERONAVES: Aeronave[] = [
  {
    id: "dron",
    nombre: "Bayraktar TB3",
    clase: "UCAV embarcado",
    sprite: "/zodk-dron.png",
    spriteNoche: "/zodk-dron-noche.png",
    ratio: "430 / 450",
    vuelo: "sweep",
    bandera: "🇹🇷",
    luces: { der: [52, 2], izq: [52, 97] },
    specs: [
      ["Fabricante", "Baykar"],
      ["Origen", "Turquía"],
      ["Primer vuelo", "2023"],
      ["Envergadura", "14,2 m"],
      ["MTOW", "1.450 kg"],
      ["Autonomía", "~32 h"],
    ],
  },
  {
    id: "rq4",
    nombre: "RQ-4 Global Hawk",
    clase: "HALE de reconocimiento",
    sprite: "/zodk-rq4.png",
    spriteNoche: "/zodk-rq4-noche.png",
    ratio: "234 / 328",
    vuelo: "fijo-izq",
    bandera: "🇺🇸",
    luces: { der: [64, 2], izq: [66, 93] },
    specs: [
      ["Fabricante", "Northrop Grumman"],
      ["Origen", "EE. UU."],
      ["Primer vuelo", "1998"],
      ["Envergadura", "39,9 m"],
      ["MTOW", "14.630 kg"],
      ["Techo", "~18.300 m"],
      ["Autonomía", "~32 h"],
    ],
  },
  {
    id: "mq9",
    nombre: "MQ-9 Reaper",
    clase: "UAV MALE armado",
    sprite: "/zodk-mq9.png",
    spriteNoche: "/zodk-mq9-noche.png",
    ratio: "244 / 265",
    vuelo: "fijo-centro",
    bandera: "🇺🇸",
    luces: { der: [54, 2], izq: [53, 89] },
    specs: [
      ["Fabricante", "General Atomics"],
      ["Origen", "EE. UU."],
      ["Primer vuelo", "2001"],
      ["Envergadura", "20,1 m"],
      ["MTOW", "4.760 kg"],
      ["Techo", "~15.000 m"],
      ["Autonomía", "~27 h"],
    ],
  },
  {
    id: "e2-hawkeye",
    nombre: "E-2 Hawkeye",
    clase: "AEW&C embarcado",
    sprite: "/zodk-e2-hawkeye.png",
    spriteNoche: "/zodk-e2-hawkeye-noche.png",
    ratio: "426 / 416",
    vuelo: "fijo",
    bandera: "🇺🇸",
    luces: { der: [57, 3], izq: [56, 92] },
    specs: [
      ["Fabricante", "Northrop Grumman"],
      ["Origen", "EE. UU."],
      ["Primer vuelo", "2007 (E-2D)"],
      ["Envergadura", "24,6 m"],
      ["Radar", "AN/APY-9"],
      ["Tripulación", "5"],
      ["Autonomía", "~6 h"],
    ],
  },
  {
    id: "u2",
    nombre: "Lockheed U-2S Dragon Lady",
    clase: "Reconocimiento estratégico a gran altitud",
    sprite: "/zodk-u2.png",
    spriteNoche: "/zodk-u2-noche.png",
    ratio: "813 / 394",
    vuelo: "fijo-arriba",
    bandera: "🇺🇸",
    luces: { der: [57, 17], izq: [65, 86] },
    specs: [
      ["Fabricante", "Lockheed (Skunk Works)"],
      ["Origen", "EE. UU."],
      ["Primer vuelo", "1955 (1994 el U-2S)"],
      ["Envergadura", "31,4 m"],
      ["Techo", "~21.300 m"],
      ["Tripulación", "1"],
      ["Autonomía", "~12 h"],
    ],
  },
  {
    id: "sr71",
    nombre: "Lockheed SR-71 Blackbird",
    clase: "Reconocimiento estratégico supersónico",
    sprite: "/zodk-sr71.png",
    spriteNoche: "/zodk-sr71-noche.png",
    ratio: "857 / 466",
    vuelo: "fijo-arriba-der",
    bandera: "🇺🇸",
    luces: { der: [84, 7], izq: [84, 92] },
    specs: [
      ["Fabricante", "Lockheed (Skunk Works)"],
      ["Origen", "EE. UU."],
      ["Primer vuelo", "1964"],
      ["Envergadura", "16,9 m"],
      ["Velocidad", "Mach 3,3"],
      ["Techo", "~25.900 m"],
      ["Tripulación", "2"],
    ],
  },
  {
    id: "shahed136",
    nombre: "Shahed-136 / Geran-2",
    clase: "Munición merodeadora (kamikaze)",
    sprite: "/zodk-shahed136.png",
    spriteNoche: "/zodk-shahed136-noche.png",
    ratio: "788 / 440",
    vuelo: "sweep",
    escala: 0.5,
    bandera: "🇮🇷",
    specs: [
      ["Fabricante", "HESA (Irán)"],
      ["Origen", "Irán / Rusia"],
      ["Primer uso", "2022 (Ucrania)"],
      ["Envergadura", "2,5 m"],
      ["Alcance", "~2.500 km"],
      ["Carga", "40-50 kg"],
    ],
  },
  {
    id: "sat-sentinel",
    nombre: "Sentinel-2",
    clase: "Observación de la Tierra",
    sprite: "/zodk-sat-sentinel.svg",
    spriteNoche: "/zodk-sat-sentinel-noche.svg",
    ratio: "208 / 96",
    vuelo: "orbita",
    bandera: "🇪🇺",
    specs: [
      ["Programa", "Copernicus · ESA"],
      ["Origen", "Unión Europea"],
      ["Órbita", "Heliosíncrona, 786 km"],
      ["Masa", "1.140 kg"],
      ["Instrumento", "MSI · 13 bandas"],
      ["Resolución", "10 / 20 / 60 m"],
      ["Revisita", "5 días"],
    ],
  },
];
