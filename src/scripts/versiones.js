// Versión de los datos de cada astro. Los archivos de public/planeta/,
// public/luna/ y public/marte/ se llaman siempre igual, así que al
// regenerarlos hay que subir aquí su número: va en el ?v= de cada petición y
// el navegador deja de usar los viejos. Las fotos quietas que carga el CSS
// (tierra-quieto*.png, luna-visible.png, marte-quieto.png) llevan su propio
// ?v= en global.css: subirlo también.
export const PLANETA_V = 14;
export const LUNA_V = 5;
export const MARTE_V = 7;
