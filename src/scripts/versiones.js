// Versión de los datos de cada astro. Los archivos de public/planeta/,
// public/luna/ y public/marte/ se llaman siempre igual, así que al
// regenerarlos hay que subir aquí su número: va en el ?v= de cada petición y
// el navegador deja de usar los viejos. Las fotos quietas que carga el CSS
// llevan su propio ?v= en los CSS: subirlo también (tierra-quieto*.png en
// portada.css, luna-visible.png en luna.css, marte-quieto.png en marte.css).
export const PLANETA_V = 14;
export const LUNA_V = 5;
export const MARTE_V = 7;
