import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, NOTAS } from "@consts";
import { esDelBlog, porFecha } from "@lib/contenido";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const notas = (await getCollection("notas")).filter(esDelBlog).sort(porFecha);

  return rss({
    title: SITE.NAME,
    description: NOTAS.DESCRIPTION,
    site: context.site,
    items: notas.map((nota) => ({
      title: nota.data.title,
      description: nota.data.description ?? "",
      pubDate: nota.data.date,
      link: `/notas/${nota.id}/`,
    })),
  });
}
