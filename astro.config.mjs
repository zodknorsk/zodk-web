import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://astro.build/config
export default defineConfig({
  // "site" es la URL final del sitio. Astro la usa para el sitemap, el RSS y las
  // URLs canónicas. Como el dominio zodk.eu apunta a la raíz (apex), no hace
  // falta "base".
  // Todo el contenido lo genera el importador como .md, que Astro entiende de
  // serie: no hay integración de MDX porque no hay ningún .mdx.
  site: "https://zodk.eu",
  integrations: [sitemap()],

  // Astro 7 quita por defecto los espacios con reglas de JSX: un salto de línea
  // entre dos etiquetas desaparece, y "<a>x</a>\n<span>y</span>" se vería "xy".
  // true es el comportamiento de siempre (Astro 5): se colapsan, no se borran.
  compressHTML: true,

  // Tailwind 3 va directo como plugin de PostCSS. Antes lo metía la integración
  // @astrojs/tailwind, que no funciona con Astro 6 o posterior; esto es lo mismo
  // que hacía ella por dentro (tailwind.config.mjs + autoprefixer). Las
  // directivas @tailwind están al principio de src/styles/base.css.
  vite: {
    build: {
      // Vite 8 minifica el CSS con Lightning CSS, y Lightning CSS 1.33 se
      // estrella (Segmentation fault, sin mensaje) con el ancho de .hero-lectura
      // en portada.css: calc(16px + 0.8rem + 0.14em + 18 * (1ch + 0.14em)). El
      // CSS es válido; el fallo es suyo. esbuild es el minificador que usaba
      // Astro 5, así que el CSS sale como siempre.
      cssMinify: "esbuild",
    },
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
  },
});
