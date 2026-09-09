// Naves y satélites que sobrevuelan / orbitan la portada. El pixel art lo
// genera logo-files/generar-aeronaves.py -> public/zodk-<id>[-noche].svg; aquí
// van los datos que necesita la web (sprite, proporción, trayectoria y la
// ficha que sale al pasar el ratón).
//
// Para añadir una nave: dibújala en generar-aeronaves.py, copia el SVG a
// public/, y añade una entrada aquí. Todas las de este array salen en el hero.

export type Aeronave = {
  id: string;
  nombre: string;
  clase: string; // subtítulo de la ficha
  sprite: string; // /zodk-<id>.svg  (modo claro)
  spriteNoche: string; // /zodk-<id>-noche.svg
  ratio: string; // aspect-ratio del viewBox, "ancho / alto"
  vuelo: "sweep" | "orbita"; // trayectoria (ver global.css)
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
    ratio: "96 / 56",
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
