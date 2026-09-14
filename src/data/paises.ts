// Países con chapa de bandera sobre el planeta del hero. Una chapa aparece solo
// si hay algún artículo (nota o evento) con una de sus etiquetas; al pasar el
// ratón por ella se despliega una ficha con esos artículos, con el mismo estilo
// que la de las naves.
//
// El dibujo pixel art de cada bandera vive en logo-files/generar-planeta-hero.py
// (BANDERAS, por el mismo código iso): añadir un país = una entrada aquí y otra
// allí, y regenerar public/planeta/.
export interface Pais {
  iso: string;
  nombre: string;
  etiquetas: string[]; // tags de los artículos (en minúsculas) que cuentan como este país
}

export const PAISES: Pais[] = [
  { iso: "ES", nombre: "España", etiquetas: ["españa", "espana"] },
  { iso: "MA", nombre: "Marruecos", etiquetas: ["marruecos"] },
  { iso: "IR", nombre: "Irán", etiquetas: ["iran", "irán"] },
  { iso: "US", nombre: "EE. UU.", etiquetas: ["eeuu", "ee.uu.", "estados-unidos"] },
  { iso: "AF", nombre: "Afganistán", etiquetas: ["afganistan", "afganistán"] },
];
