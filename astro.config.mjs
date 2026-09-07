import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // "site" es la URL final del sitio. Astro la usa para el sitemap, el RSS y las
  // URLs canónicas. Como el dominio zodk.eu apunta a la raíz (apex), no hace
  // falta "base".
  site: "https://zodk.eu",
  integrations: [mdx(), sitemap(), tailwind()],
});
