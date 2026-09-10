// Naves y satélites que sobrevuelan / orbitan la portada. El pixel art lo
// genera logo-files/generar-aeronaves.py -> public/zodk-<id>[-noche].svg; aquí
// van los datos que necesita la web (sprite, proporción, trayectoria y la
// ficha que sale al pasar el ratón).
//
// Para añadir una nave: dibújala en generar-aeronaves.py, copia el SVG a
// public/, y añade una entrada aquí. Se suma sola a la rotación del hero.
//
// El hero muestra SIEMPRE 2 de esta lista a la vez, cada una con su trayectoria
// ("vuelo"): "sweep" barrido diagonal, "orbita" pasada de lado a lado, "fijo"
// quieta con una elipse pequeña. Cada 8 s un hueco se releva: la nave se
// desvanece y aparece (con fundido, sin recorrido de entrada) la siguiente de
// la lista que no esté ya en pantalla. Lo lleva initRotacion() en Head.astro;
// sin JS se ven las 2 primeras de la lista, quietas.
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
