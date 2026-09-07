import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, NOTAS } from "@consts";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const notas = (await getCollection("notas"))
    .filter((nota) => !nota.data.draft)
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  return rss({
    title: SITE.NAME,
    description: NOTAS.DESCRIPTION,
    site: context.site,
    items: notas.map((nota) => ({
      title: nota.data.title,
      description: nota.data.description ?? "",
      pubDate: nota.data.date,
      link: `/notas/${nota.slug}/`,
    })),
  });
}
