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

// Sección "Hecha con" de la portada: con qué está construida la web. Cada
// insignia enlaza a la web oficial de la tecnología. Los SVG son los oficiales
// de cada proyecto (simple-icons), con width/height en crudo -- se pintan con
// set:html y por tanto no llevan el atributo de scope de Astro, así que
// cualquier tamaño tiene que ir en el propio SVG, no en un <style> con scope
// (ver la nota igual en ICONO_X/MAIL/INSTAGRAM más abajo).
export const STACK = [
  {
    NAME: "Astro",
    HREF: "https://astro.build",
    // Logomark oficial (astro.build/favicon.svg): cuerpo en currentColor (sigue
    // el tema, como el resto de iconos) y la llama con el degradado real de marca.
    ICONO: `<svg width="20" height="20" viewBox="0 0 128 128" aria-hidden="true"><path fill="currentColor" d="M16 82.4s16.5-8 33-8l12.4-38.3c.5-2 1.8-3.2 3.3-3.2 1.6 0 3 1.3 3.4 3.2l12.4 38.3c19.6 0 33 8 33 8l-28-76c-.8-2.3-2.2-3.7-4-3.7H48c-1.8 0-3.1 1.4-4 3.7l-28 76Z"/><path fill="url(#astro-flame)" d="M47.7 107.1c-5.5-5-7.2-15.7-4.9-23.4 4 4.9 9.6 6.4 15.4 7.3 8.9 1.3 17.6.8 25.9-3.2l2.8-1.7a18 18 0 0 1-7.2 20l-5.5 3.8c-5.6 3.8-7.2 8.2-5 14.7l.2.7a14 14 0 0 1-6.6-5.6 15.8 15.8 0 0 1-2.6-8.6c0-1.5 0-3-.2-4.5-.5-3.7-2.2-5.3-5.5-5.4-3.3-.1-5.9 2-6.6 5.2l-.2.7Z"/><defs><linearGradient id="astro-flame" x1="64.7" x2="77.4" y1="119.2" y2="77.4" gradientUnits="userSpaceOnUse"><stop stop-color="#D83333"/><stop offset="1" stop-color="#F041FF"/></linearGradient></defs></svg>`,
  },
  {
    NAME: "JavaScript",
    HREF: "https://developer.mozilla.org/docs/Web/JavaScript",
    ICONO: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#f7df1e" aria-hidden="true"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>`,
  },
  {
    NAME: "TypeScript",
    HREF: "https://www.typescriptlang.org",
    ICONO: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#3178c6" aria-hidden="true"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>`,
  },
  {
    NAME: "Tailwind",
    HREF: "https://tailwindcss.com",
    ICONO: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#38bdf8" aria-hidden="true"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>`,
  },
] as const;

// Barra de contacto a sangre al final de la portada (ver index.astro). Los
// iconos son SVG en crudo (se pintan con set:html) para no montar una nueva
// dependencia de iconos por 3 enlaces.
// width/height explícitos (no solo viewBox): al pintarse con set:html no
// llevan el atributo de scope de Astro, así que el CSS con scope de
// index.astro no los alcanza para darles tamaño -- por eso el tamaño va
// también en crudo aquí, no solo en el <style>.
const ICONO_X = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zm-1.61 19.514h2.039L6.486 3.24H4.298z"/></svg>`;
const ICONO_MAIL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
// Degradado de marca de Instagram (mismos tonos que su logo oficial); por eso
// va en color fijo y no en currentColor, a diferencia de los otros iconos.
const ICONO_INSTAGRAM = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0"><stop offset="0%" stop-color="#feda75"/><stop offset="35%" stop-color="#d62976"/><stop offset="70%" stop-color="#962fbf"/><stop offset="100%" stop-color="#4f5bd5"/></linearGradient></defs><path fill="url(#ig-grad)" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zm0-2.16c-3.26 0-3.67.01-4.95.07-4.35.2-6.78 2.62-6.98 6.98-.06 1.28-.07 1.69-.07 4.95s.01 3.67.07 4.95c.2 4.35 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98-1.28-.06-1.69-.07-4.95-.07zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>`;

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
