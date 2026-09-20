import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // "site" es la URL final del sitio. Astro la usa para el sitemap, el RSS y las
  // URLs canónicas. Como el dominio zodk.eu apunta a la raíz (apex), no hace
  // falta "base".
  // Todo el contenido lo genera el importador como .md, que Astro entiende de
  // serie: no hay integración de MDX porque no hay ningún .mdx.
  site: "https://zodk.eu",
  integrations: [sitemap(), tailwind()],
});
