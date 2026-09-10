// Naves y satélites que sobrevuelan / orbitan la portada. El pixel art lo
// genera logo-files/generar-aeronaves.py -> public/zodk-<id>[-noche].svg; aquí
// van los datos que necesita la web (sprite, proporción, trayectoria y la
// ficha que sale al pasar el ratón).
//
// Para añadir una nave: dibújala en generar-aeronaves.py, copia el SVG a
// public/, y añade una entrada aquí.
//
// Cómo salen en el hero según "vuelo":
//   - "fijo" / "orbita": SIEMPRE en pantalla, cada una con su trayectoria.
//   - "sweep": entran en una ROTACIÓN. Vuelan 2 a la vez (sin solaparse) dando
//     pasadas diagonales; cuando una sale de pantalla, el JS mete el siguiente
//     "sweep" de la lista, y así en bucle. Añade drones con vuelo:"sweep" y se
//     suman solos a la rotación (ver index.astro + initRotacion en Head.astro).
//
// Excepción de dibujo: el dron (TB3) y el E-2 son SVG de diseño hechos a mano,
// no salen del script; viven en public/zodk-{dron,e2-hawkeye}[-noche].svg.

export type Aeronave = {
  id: string;
  nombre: string;
  clase: string; // subtítulo de la ficha
  sprite: string; // /zodk-<id>.svg  (modo claro)
  spriteNoche: string; // /zodk-<id>-noche.svg
  ratio: string; // aspect-ratio del viewBox, "ancho / alto"
  vuelo: "sweep" | "orbita" | "fijo"; // trayectoria (ver global.css)
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
