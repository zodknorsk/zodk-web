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

// Barra de contacto a sangre al final de la portada (ver index.astro). Los
// iconos son SVG en crudo (se pintan con set:html) para no montar una nueva
// dependencia de iconos por 3 enlaces.
// width/height explícitos (no solo viewBox): al pintarse con set:html no
// llevan el atributo de scope de Astro, así que el CSS con scope de
// index.astro no los alcanza para darles tamaño -- por eso el tamaño va
// también en crudo aquí, no solo en el <style>.
const ICONO_X = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zm-1.61 19.514h2.039L6.486 3.24H4.298z"/></svg>`;
const ICONO_MAIL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
const ICONO_INSTAGRAM = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none"/></svg>`;

export const CONTACTO = [
  {
    LABEL: "hegoimarquez en X",
    HREF: "https://x.com/hegoimarquez",
    TEXTO: "/hegoimarquez",
    EXTERNO: true,
    ICONO: ICONO_X,
  },
  {
    LABEL: `Escribir a ${SITE.EMAIL}`,
    HREF: `mailto:${SITE.EMAIL}`,
    TEXTO: SITE.EMAIL,
    EXTERNO: false,
    ICONO: ICONO_MAIL,
  },
  {
    LABEL: "hegoimarquez en Instagram",
    HREF: "https://instagram.com/hegoimarquez",
    TEXTO: "/hegoimarquez",
    EXTERNO: true,
    ICONO: ICONO_INSTAGRAM,
  },
] as const;
