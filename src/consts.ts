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
    ICONO: `<svg width="20" height="20" viewBox="0 0 128 128" aria-hidden="true"><path class="astro-body" fill="currentColor" d="M16 82.4s16.5-8 33-8l12.4-38.3c.5-2 1.8-3.2 3.3-3.2 1.6 0 3 1.3 3.4 3.2l12.4 38.3c19.6 0 33 8 33 8l-28-76c-.8-2.3-2.2-3.7-4-3.7H48c-1.8 0-3.1 1.4-4 3.7l-28 76Z"/><path fill="url(#astro-flame)" d="M47.7 107.1c-5.5-5-7.2-15.7-4.9-23.4 4 4.9 9.6 6.4 15.4 7.3 8.9 1.3 17.6.8 25.9-3.2l2.8-1.7a18 18 0 0 1-7.2 20l-5.5 3.8c-5.6 3.8-7.2 8.2-5 14.7l.2.7a14 14 0 0 1-6.6-5.6 15.8 15.8 0 0 1-2.6-8.6c0-1.5 0-3-.2-4.5-.5-3.7-2.2-5.3-5.5-5.4-3.3-.1-5.9 2-6.6 5.2l-.2.7Z"/><defs><linearGradient id="astro-flame" x1="64.7" x2="77.4" y1="119.2" y2="77.4" gradientUnits="userSpaceOnUse"><stop stop-color="#D83333"/><stop offset="1" stop-color="#F041FF"/></linearGradient></defs></svg>`,
  },
  {
    NAME: "JavaScript",
    HREF: "https://developer.mozilla.org/docs/Web/JavaScript",
    ICONO: `<svg width="20" height="20" viewBox="0 0 256 256" fill="none" aria-hidden="true"><rect width="256" height="256" rx="60" fill="#F0DB4F"/><path fill="#323330" d="M67.3117 213.932L86.9027 202.076C90.6821 208.777 94.1202 214.447 102.367 214.447C110.272 214.447 115.256 211.355 115.256 199.327V117.529H139.314V199.667C139.314 224.584 124.708 235.926 103.398 235.926C84.1533 235.926 72.9819 225.959 67.3113 213.93"/><path fill="#323330" d="M152.381 211.354L171.969 200.013C177.126 208.434 183.828 214.62 195.684 214.62C205.653 214.62 212.009 209.636 212.009 202.762C212.009 194.514 205.479 191.592 194.481 186.782L188.468 184.203C171.111 176.815 159.597 167.535 159.597 147.945C159.597 129.901 173.345 116.153 194.826 116.153C210.12 116.153 221.118 121.481 229.022 135.4L210.291 147.429C206.166 140.04 201.7 137.119 194.826 137.119C187.78 137.119 183.312 141.587 183.312 147.429C183.312 154.646 187.78 157.568 198.09 162.037L204.104 164.614C224.553 173.379 236.067 182.313 236.067 202.418C236.067 224.072 219.055 235.928 196.2 235.928C173.861 235.928 159.426 225.274 152.381 211.354"/></svg>`,
  },
  {
    NAME: "TypeScript",
    HREF: "https://www.typescriptlang.org",
    ICONO: `<svg width="20" height="20" viewBox="0 0 256 256" fill="none" aria-hidden="true"><rect width="256" height="256" fill="#007ACC" rx="60"/><path fill="#fff" d="M56.6112 128.849L56.5299 139.333H73.1902H89.8505L89.8505 186.673V234.012H101.635H113.419V186.673L113.419 139.333H130.079H146.739V129.052C146.739 123.363 146.618 118.609 146.455 118.487C146.333 118.325 126.056 118.243 101.472 118.284L56.7331 118.406L56.6112 128.849Z"/><path fill="#fff" d="M206.567 118.108C213.068 119.734 218.026 122.619 222.577 127.332C224.934 129.852 228.428 134.444 228.713 135.541C228.794 135.866 217.66 143.343 210.915 147.528C210.671 147.691 209.695 146.634 208.598 145.009C205.307 140.214 201.853 138.141 196.57 137.776C188.809 137.247 183.811 141.311 183.852 148.097C183.852 150.088 184.136 151.266 184.949 152.892C186.655 156.427 189.825 158.54 199.781 162.847C218.107 170.731 225.949 175.932 230.826 183.327C236.271 191.576 237.49 204.742 233.792 214.535C229.729 225.181 219.651 232.414 205.469 234.812C201.081 235.584 190.678 235.462 185.965 234.609C175.684 232.78 165.932 227.701 159.918 221.037C157.561 218.436 152.969 211.65 153.254 211.162C153.375 211 154.432 210.35 155.61 209.659C156.748 209.009 161.056 206.53 165.119 204.173L172.474 199.906L174.018 202.182C176.172 205.473 180.885 209.984 183.73 211.487C191.897 215.795 203.113 215.185 208.639 210.228C210.996 208.074 211.971 205.839 211.971 202.548C211.971 199.581 211.605 198.281 210.061 196.046C208.07 193.202 204.007 190.804 192.466 185.806C179.26 180.117 173.571 176.582 168.37 170.974C165.363 167.724 162.518 162.522 161.34 158.174C160.365 154.558 160.121 145.496 160.893 141.839C163.615 129.08 173.246 120.181 187.143 117.539C191.654 116.686 202.137 117.011 206.567 118.108Z"/></svg>`,
  },
  {
    NAME: "Tailwind",
    HREF: "https://tailwindcss.com",
    ICONO: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#38bdf8" aria-hidden="true"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>`,
  },
  {
    // Crédito aparte del stack técnico en sí: quien ayuda a construir la web.
    // El icono es "Clawd", la mascota pixel-art de Claude Code, reconstruida a
    // partir de un fotograma de clawd-laptop.mov (Claude.app/.../install-hub) —
    // cuadrícula de 12x8 medida a mano sobre el original.
    NAME: "Claude",
    HREF: "https://claude.ai",
    ICONO: `<svg width="20" height="20" viewBox="0 0 12 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="8" height="1" fill="#D97757"/><rect x="2" y="1" width="1" height="1" fill="#D97757"/><rect x="3" y="1" width="1" height="1" fill="#000"/><rect x="4" y="1" width="4" height="1" fill="#D97757"/><rect x="8" y="1" width="1" height="1" fill="#000"/><rect x="9" y="1" width="1" height="1" fill="#D97757"/><rect x="0" y="2" width="12" height="2" fill="#D97757"/><rect x="2" y="4" width="8" height="2" fill="#D97757"/><rect x="2" y="6" width="1" height="2" fill="#D97757"/><rect x="4" y="6" width="1" height="2" fill="#D97757"/><rect x="7" y="6" width="1" height="2" fill="#D97757"/><rect x="9" y="6" width="1" height="2" fill="#D97757"/></svg>`,
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
