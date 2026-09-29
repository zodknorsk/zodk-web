# zodk-web

El código de mi web personal, **[zodk.eu](https://zodk.eu)**: un blog de
historia, inteligencia y OSINT con una portada en pixel art (la Tierra) y dos
páginas más para la Luna y Marte. Hecha con [Astro](https://astro.build) a
partir de la plantilla [astro-nano](https://github.com/markhorn-dev/astro-nano)
(MIT) y publicada en GitHub Pages.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run dev:network` | Lo mismo, visible desde el móvil en la misma wifi |
| `npm run importar` | Trae de la bóveda de Obsidian las notas con `publicar: true` (solo en `main`) y dice qué ha cambiado |
| `npm run build` | Comprueba tipos (`astro check`) y compila a `dist/` |
| `npm run preview` | Sirve el `dist/` ya compilado |
| `npm run lint` | ESLint (`lint:fix` arregla lo obvio) |

Cada push a `main` compila y publica la web sola
(`.github/workflows/deploy.yml`). Las demás ramas no publican nada.

## Documentación

| Documento | De qué va |
|---|---|
| [`docs/contenido.md`](docs/contenido.md) | Cómo llegan las notas desde Obsidian (análisis, operaciones y seguimiento, por su `tipo`), y cómo publicar |
| [`docs/tierra.md`](docs/tierra.md) | La portada: la Tierra, el título, la noche, qué se probó y rechazó |
| [`docs/luna.md`](docs/luna.md) | `/luna`: la Luna, los alunizajes, los relés y la Orion |
| [`docs/marte.md`](docs/marte.md) | `/marte`: Marte y los amartizajes |
| [`docs/uas.md`](docs/uas.md) | El Hangar de UAS: fichas de drones, el visor, la tira de la portada y cómo se hace un dron nuevo |
| [`docs/astros.md`](docs/astros.md) | Lo común a los tres: motores, gestos, vuelos, nombres, versiones de datos |
| [`docs/rendimiento.md`](docs/rendimiento.md) | Que no caliente: cómo medir y qué se aprendió |
| [`docs/logo.md`](docs/logo.md) | El logo animado y los iconos |
| [`arte/README.md`](arte/README.md) | Qué genera cada script de pixel art |

## Mapa del repositorio

```
src/
  pages/                   Las páginas (cada archivo es una URL)
    index.astro              Portada: el hero con la Tierra y, debajo, el blog
    luna.astro               /luna (con todo su JavaScript)
    marte.astro              /marte (con todo su JavaScript)
    analisis/                /analisis: los análisis por años y la página de cada uno
    operaciones/             /operaciones: por fecha del suceso y la página de cada una
    seguimiento/             /seguimiento: índice, semanas y piezas de cada seguimiento
    notas/[...slug].astro    Las notas de la Luna, Marte y el blog (y redirecciones)
    eventos/, notas/index    Solo redirecciones a las direcciones nuevas
    uas/index.astro          /uas: la enciclopedia de drones, con filtro por país
    uas/[...slug].astro      La ficha de cada dron, con su visor (docs/uas.md)
    404.astro                La página de las direcciones que no existen
    rss.xml.ts, robots.txt.ts
  layouts/PageLayout.astro   El esqueleto común: <head>, cabecera, pie
  components/
    Head.astro               <head>, estilos, fuentes, tema día/noche, naves
                             del hero y su hélice
    Header.astro             La cabecera: logo y día/noche (no sale en los astros)
    ThemeToggle.astro        El botón de día/noche
    VisorUAS.astro           El visor de cada dron (maqueta 3D y pixel, partes,
                             fuentes)
    Footer.astro, Container.astro, Link.astro, ArrowCard.astro (tarjeta de
    análisis u operación), BackToPrev.astro (botón de volver), EventoNav.astro
    (semana anterior/siguiente de un seguimiento), ArticuloPagina.astro
    (página de un análisis, una operación o una nota), Redireccion.astro, FormattedDate.astro
  scripts/                 El JavaScript de los astros
    portada.ts               Todo lo de la portada (Tierra, acercamiento,
                             título, coordenada, chapas, vuelos)
    tierra-gl.js             Motor WebGL de la Tierra
    marte-gl.js              Motor WebGL de Marte (y base del de la Luna)
    luna-gl.js               La Luna sobre el motor de Marte
    gestos.js                Arrastrar y zoom
    nombres.js               Nombres de lugares y chapas sobre los astros
    vuelos.js                Los vuelos entre páginas
    versiones.js             Versión de los datos de cada astro
    mgrs.js                  Coordenada MGRS
    visor-uas.ts             Motor del visor de los drones (Three.js)
    uas-geometria.ts, uas-pixelado.ts, uas-paletas.ts
                             Piezas, modo Pixel y paletas de las maquetas
  styles/                  Los estilos, en el orden en que se cargan
    base.css                 Toda la web (Tailwind, cabecera, notas, tuits)
    astros.css               Lo común a los tres astros
    portada.css, luna.css, marte.css
  data/                    Datos a mano (y el archivo de tuits)
    aeronaves.ts             Las naves del hero y sus fichas
    paises.ts                Países con chapa sobre la Tierra
    alunizajes.ts            Las 28 misiones de /luna, países y relés
    amartizajes.ts           Las 17 misiones de /marte
    uas/                     Las maquetas de los drones (una por dron) y sus
                             tipos
    tuits/                   El archivo de tuits: cada uno, tal como estaba
                             al citarlo (lo escribe el importador)
  lib/
    contenido.ts             Proyecto de una nota, fotos y fechas
    utils.ts                 Utilidades (clases CSS, tiempo de lectura)
  content/                 Lo que escribe el importador (no tocar)
  content.config.ts        El esquema de las colecciones (análisis, operaciones, seguimientos, notas, uas)
  consts.ts                Nombre de la web, textos, "hecho con" y contacto
  types.ts, env.d.ts       Tipos de TypeScript
scripts/
  importar-notas.mjs       De la bóveda de Obsidian a src/content/
  tweets.mjs               Descarga los tuits, los guarda y hace sus tarjetas
arte/                      Generadores del pixel art (no se publica)
  bancos/                  Páginas de prueba de los motores
docs/                      La documentación
public/                    Lo que se sirve tal cual
  planeta/  luna/  marte/  Datos de los tres astros (los hace arte/)
  alunizajes/  amartizajes/  Fotos de las fichas
  uas/                     Miniaturas y fotos de fuentes de cada dron, y el
                           hangar de la portada (los hace arte/)
  tweets/  adjuntos/       Imágenes de tuits y vídeos (los hace el importador)
  zodk-*.png, zodk-*.svg   Naves, sol, luna, Marte, Tierra pequeña, estrellas, logo
  CNAME                    El dominio zodk.eu para GitHub Pages
```

## Licencia

El código tiene licencia MIT (ver `LICENSE`): la plantilla de partida es de
Mark Horn y el resto, de Hegoi Márquez.
