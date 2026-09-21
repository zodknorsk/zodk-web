import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, NOTAS } from "@consts";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  // Las notas del Proyecto Luna (etiqueta "luna") no salen aquí: se quedan en
  // /luna, y solo se llega a ellas desde allí o desde "moon-project".
  const notas = (await getCollection("notas"))
    .filter((nota) => !nota.data.draft && !nota.data.tags.some((t) => t.toLowerCase() === "luna"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

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
