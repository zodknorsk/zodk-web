// El armamento del Hangar de UAS: cada munición es una entrada de la colección
// «uas» con `municion` (/uas/armamento/<slug>). Se agrupan y ordenan como en
// el índice de la nota del armamento (`grupos`, lo pone el importador); las
// que no salgan allí van al final, en «Otras».
import type { CollectionEntry } from "astro:content";

type Ficha = CollectionEntry<"uas">;
export type GrupoMuniciones = { titulo: string; municiones: Ficha[] };

export const slugMunicion = (f: Ficha) => f.id.split("/").pop()!;

export function gruposDeMuniciones(todas: Ficha[]): GrupoMuniciones[] {
  const municiones = todas.filter((f) => f.data.municion && !f.data.draft);
  const porSlug = new Map(municiones.map((f) => [slugMunicion(f), f]));
  const indice = todas.find((f) => f.data.armamento)?.data.grupos ?? [];
  const usadas = new Set<string>();
  const grupos = indice.map((g) => ({
    titulo: g.titulo,
    municiones: g.municiones.flatMap((s) => {
      const f = porSlug.get(s);
      if (!f || usadas.has(s)) return [];
      usadas.add(s);
      return [f];
    }),
  }));
  const otras = municiones.filter((f) => !usadas.has(slugMunicion(f)));
  if (otras.length) grupos.push({ titulo: "Otras", municiones: otras });
  return grupos.filter((g) => g.municiones.length);
}
