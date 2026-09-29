// El RSS (/rss.xml): los análisis, sin borradores.
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, ANALISIS } from "@consts";
import { porFecha } from "@lib/contenido";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const notas = (await getCollection("analisis")).filter((n) => !n.data.draft).sort(porFecha);

  return rss({
    title: SITE.NAME,
    description: ANALISIS.DESCRIPTION,
    site: context.site,
    items: notas.map((nota) => ({
      title: nota.data.title,
      description: nota.data.description ?? "",
      pubDate: nota.data.date,
      link: `/analisis/${nota.id}/`,
    })),
  });
}
