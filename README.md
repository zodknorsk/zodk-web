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

El resultado de esa importación **sí** se versiona en este repo, para que la web
compile en GitHub Actions sin necesidad de la bóveda.

## Estructura

```
src/
  consts.ts              Configuración del sitio (nombre, email, nº de notas en portada)
  content/
    config.ts            Esquema de la colección "notas"
    notas/               Notas generadas por el script (no editar a mano)
  layouts/PageLayout.astro   Esqueleto HTML común (<head>, header, footer)
  components/            Piezas reutilizables (Header, Footer, ArrowCard, Link...)
  pages/
    index.astro          Portada  (/)
    notas/index.astro    Listado de notas  (/notas)
    notas/[...slug].astro Página de cada nota  (/notas/<slug>)
    rss.xml.ts           Feed RSS
    robots.txt.ts        robots.txt
  styles/global.css      Estilos base (Tailwind + unos pocos ajustes)
scripts/
  importar-notas.mjs     Puente bóveda de Obsidian -> src/content/notas/
.github/workflows/
  deploy.yml             Build + publicación en GitHub Pages en cada push a main
public/
  CNAME                  Dominio personalizado para GitHub Pages
```

## Comandos

| Comando            | Qué hace                                                       |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Servidor local de desarrollo en `localhost:4321`             |
| `npm run importar` | Reimporta las notas marcadas `publicar: true` de la bóveda   |
| `npm run build`    | Compila el sitio a `dist/`                                   |
| `npm run preview`  | Previsualiza el `dist/` ya compilado                         |

La ruta de la bóveda se puede cambiar con la variable `BOVEDA_PATH`:

```
BOVEDA_PATH="/otra/ruta" npm run importar
```

## Flujo para publicar una nota nueva

1. En Obsidian, añade `publicar: true` al frontmatter de la nota.
2. `npm run importar`
3. `npm run dev` y revisa cómo queda.
4. `git add -A && git commit -m "notas: publica ..."` y `git push`.
5. GitHub Actions compila y despliega solo.
