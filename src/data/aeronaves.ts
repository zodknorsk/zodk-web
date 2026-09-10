// Naves y satélites que sobrevuelan / orbitan la portada. El pixel art lo
// genera logo-files/generar-aeronaves.py -> public/zodk-<id>[-noche].svg; aquí
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
// Excepción de dibujo: varias no salen del script. El TB3 y el E-2 son SVG de
// diseño; el MQ-9 y el RQ-4 son PNG tal cual (sin versión de noche propia).
// Todas en public/zodk-<id>[-noche].{svg,png}.

export type Aeronave = {
  id: string;
  nombre: string;
  clase: string; // subtítulo de la ficha
  sprite: string; // /zodk-<id>.svg  (modo claro)
  spriteNoche: string; // /zodk-<id>-noche.svg
  ratio: string; // aspect-ratio del viewBox, "ancho / alto"
  vuelo: "sweep" | "orbita" | "fijo" | "fijo-izq" | "fijo-centro"; // trayectoria (ver global.css)
  escala?: number; // multiplica el ancho en el hero (1 = normal). Solo "sweep".
  bandera?: string; // emoji junto a "Origen" (o "País")
  specs: [string, string][]; // [etiqueta, valor]
};

export const AERONAVES: Aeronave[] = [
  {
    id: "dron",
    nombre: "Bayraktar TB3",
    clase: "UCAV embarcado",
    sprite: "/zodk-dron.svg",
    spriteNoche: "/zodk-dron-noche.svg",
    ratio: "116 / 108",
    vuelo: "sweep",
    bandera: "🇹🇷",
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
    spriteNoche: "/zodk-rq4.png",
    ratio: "346 / 479",
    vuelo: "fijo-izq",
    bandera: "🇺🇸",
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
    spriteNoche: "/zodk-mq9.png",
    ratio: "358 / 392",
    vuelo: "fijo-centro",
    bandera: "🇺🇸",
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
    sprite: "/zodk-e2-hawkeye.svg",
    spriteNoche: "/zodk-e2-hawkeye-noche.svg",
    ratio: "116 / 108",
    vuelo: "fijo",
    bandera: "🇺🇸",
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
