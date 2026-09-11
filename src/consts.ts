import type { Site, Metadata, Socials } from "@types";

// Configuración central del sitio. Casi todo el texto "de marca" sale de aquí,
// así que este es el primer archivo que tocarás para personalizar la web.

export const SITE: Site = {
  NAME: "zodk.eu",
  EMAIL: "zodknorsk@gmail.com",
  NUM_NOTAS_ON_HOMEPAGE: 5, // cuántas notas se muestran en la portada
};

export const HOME: Metadata = {
  TITLE: "Inicio",
  DESCRIPTION: "Notas y análisis propios sobre actualidad, historia y OSINT.",
};

export const NOTAS: Metadata = {
  TITLE: "Notas",
  DESCRIPTION: "Análisis y notas publicadas desde mi bóveda de trabajo.",
};

export const EVENTOS: Metadata = {
  TITLE: "Eventos",
  DESCRIPTION: "Seguimiento en profundidad de sucesos, semana a semana.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/zodknorsk",
  },
];

// Sección "Hecha con" de la portada: con qué está construida la web.
export const STACK = [
  { NAME: "Astro", MARCA: "A", COLOR: "#17191e" },
  { NAME: "TypeScript", MARCA: "TS", COLOR: "#3178c6" },
  { NAME: "Tailwind CSS", MARCA: "tw", COLOR: "#0ea5e9" },
] as const;
