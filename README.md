# zodk-web

Código de mi web personal, **[zodk.eu](https://zodk.eu)**. Hecha con
[Astro](https://astro.build), partiendo de la plantilla
[astro-nano](https://github.com/markhorn-dev/astro-nano) (licencia MIT).

## Cómo funciona el contenido

Las notas de la web NO se escriben aquí a mano. Se escriben en mi bóveda de
Obsidian y se marcan con `publicar: true` en el frontmatter. El script
`scripts/importar-notas.mjs` las copia a `src/content/notas/`, traduciendo el
frontmatter en español y la sintaxis de Obsidian (`![[imagen]]`, `[[enlaces]]`)
a Markdown estándar.

**Tweets:** una URL de X sola en su línea se convierte en una tarjeta con el
tweet ya descargado (autor, texto, fecha, imágenes) — ver `scripts/tweets.mjs`.
Una URL de X dentro de una frase se queda como enlace normal. Las imágenes de
los tweets se guardan en `public/tweets/` (esa carpeta la regenera el script;
no se edita a mano).

El resultado de esa importación **sí** se versiona en este repo, para que la web
compile en GitHub Actions sin necesidad de la bóveda ni de X.

**Eventos** (colección `eventos`): las notas dentro de `03 - Eventos/<carpeta>/`
de la bóveda forman un evento jerárquico:

- el `.md` que se llama igual que la carpeta  → página índice  `/eventos/<slug>`
- `SEMANA N - ...`                            → `/eventos/<slug>/semana-0N`
- cualquier otra nota de la carpeta           → página de análisis `/eventos/<slug>/<slug-nota>`

Una nota suelta directamente en `03 - Eventos/` (sin carpeta propia) es un
evento de una sola página: `/eventos/<slug-del-nombre-de-archivo>`.

El importador traduce los `[[SEMANA 2]]` y los `[[...#30 de julio]]` a enlaces y
anclas reales, y convierte los embeds de TikTok en una cita estática con enlace.

**Notas del Proyecto Luna:** las que llevan la etiqueta `luna` se importan y se
publican como cualquier otra, pero **no salen en `/notas`, ni en "últimas
notas" de la portada, ni en el RSS**: pertenecen a la página de la Luna y solo
se llega a ellas desde ahí (o desde `moon-project`, en la cabecera). Su botón
de volver lleva a `/luna` en vez de al listado de notas.

## La portada y la Luna

La portada es un hero a pantalla completa con la **Tierra en pixel art** en un
`<canvas>` (gira sola, cambia de día a noche con el tema, chapas de bandera en
los países con artículos). Pulsando la luna del icono —o `moon-project` en la
cabecera— se vuela a **`/luna`**, una segunda portada con la Luna, los 28
alunizajes de la historia, los relés chinos de la cara oculta y la Orion de
Artemis II orbitando.

Los dibujos no se hacen a mano: los generan los scripts de Python de
`logo-files/` y su salida vive en `public/planeta/` y `public/luna/`. El
detalle, las decisiones y lo que se probó y descartó está en
`logo-files/HERO-WIP.md` (la Tierra) y `logo-files/LUNA-WIP.md` (la Luna).

## Estructura

```
src/
  consts.ts              Configuración del sitio (nombre, email, nº de notas en portada)
  content/
    config.ts            Esquemas de las colecciones "notas" y "eventos"
    notas/  eventos/     Contenido generado por el script (no editar a mano)
  layouts/PageLayout.astro   Esqueleto HTML común (<head>, header, footer)
  components/            Piezas reutilizables (Header, Footer, ArrowCard, EventoNav...)
  data/
    aeronaves.ts         Naves del hero (sprite, trayectoria y ficha)
    paises.ts            Países con chapa de bandera sobre la Tierra
    alunizajes.ts        Las 28 misiones de /luna, sus países y los relés
  scripts/
    planeta.js           Motor del canvas de la Tierra (giro, luz, chapas)
    luna.js              Motor del canvas de la Luna (media vuelta entre caras)
    viaje-luna.js        El vuelo Tierra <-> Luna, en los dos sentidos
    mgrs.js              Coordenada MGRS del punto bajo el cursor
  pages/
    index.astro          Portada  (/)
    luna.astro           La Luna  (/luna)
    notas/               Listado y página de cada nota
    eventos/             Listado de eventos y [...slug] (índice / semana / análisis)
    rss.xml.ts           Feed RSS
    robots.txt.ts        robots.txt
  styles/global.css      Estilos base (Tailwind + los del hero y la Luna)
scripts/
  importar-notas.mjs     Puente bóveda de Obsidian -> src/content/{notas,eventos}/
  tweets.mjs             Descarga tweets (en paralelo) y genera sus tarjetas HTML
logo-files/
  generar-*.py           Generan el pixel art (planeta, luna, naves, estrellas...)
  HERO-WIP.md            Cómo funciona la Tierra del hero y qué se descartó
  LUNA-WIP.md            Lo mismo para /luna
  prototipo-*/           Bancos de pruebas sueltos (no se publican)
.github/workflows/
  deploy.yml             Build + publicación en GitHub Pages en cada push a main
public/
  CNAME                  Dominio personalizado para GitHub Pages
  planeta/  luna/        Datos de los canvas (los generan los scripts de Python)
  alunizajes/  tweets/   Fotos de las misiones e imágenes de los tweets
```

## Comandos

| Comando            | Qué hace                                                       |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Servidor local de desarrollo en `localhost:4321`             |
| `npm run importar` | Reimporta las notas marcadas `publicar: true` de la bóveda   |
| `npm run build`    | Comprueba tipos (`astro check`) y compila el sitio a `dist/` |
| `npm run preview`  | Previsualiza el `dist/` ya compilado                         |
| `npm run lint`     | ESLint sobre `src/` y `scripts/` (`lint:fix` arregla lo obvio) |

La ruta de la bóveda se puede cambiar con la variable `BOVEDA_PATH`:

```
BOVEDA_PATH="/otra/ruta" npm run importar
```

## Flujo para publicar una nota nueva

1. En Obsidian, añade `publicar: true` al frontmatter de la nota.
2. `npm run importar`
3. `npm run dev` y revisa cómo queda. Si el servidor ya estaba abierto,
   **reinícialo** (Ctrl+C y otra vez `npm run dev`): la importación regenera
   `src/content/` y limpia la caché `.astro`, y el servidor en marcha se lía.
4. `git add -A && git commit -m "notas: publica ..."` y `git push`.
5. GitHub Actions compila y despliega solo.
