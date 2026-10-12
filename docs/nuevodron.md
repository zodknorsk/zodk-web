# Nuevo dron: de la nota de Obsidian al dron publicado

Todo lo que hace falta para añadir un dron al Hangar de UAS de
hegoimarquez.com y que quede **igual que los que ya hay**: nota en la
bóveda, maqueta en HD, pixel HD, miniaturas, ficha en `/uas/<slug>` y
publicación. Se usa con `/nuevodron` (`.claude/skills/nuevodron/`).

**Cómo se usa**

- Este documento es la parte común. Cada fase tiene el suyo en
  `docs/nuevodron/`: **se lee este, el de la fase que toca y el diario del
  dron**, nada más. `docs/hangar-de-uas.md` y `docs/uas-hd.md` son el
  archivo histórico (de dónde sale cada regla): no se abren salvo que el
  usuario lo pida o para afinar estos documentos.
- **Estos documentos solo cambian cuando el usuario lo marca.** Si durante
  un dron sale algo que debería entrar, se le propone al final, en el chat,
  y él decide. No se añade nada por cuenta propia.
- **Una fase por sesión.** El usuario dice en el `/nuevodron` qué fase
  quiere y en qué centrarse («solo la nota», «empieza por la maqueta»,
  «céntrate en el gimbal»): se hace eso, se pone al día el diario y se
  para para que lo vea. La fase siguiente, en una sesión nueva, que retoma
  desde el diario. Una fase larga (la maqueta) puede ocupar varias.

| Fase | Qué sale | Dónde | Documento |
|---|---|---|---|
| 1. La nota | Nota del dron en borrador | Bóveda | `1-nota.md` |
| 2. Fuentes y fotos | Fotos, avión de las marcas, `FUENTES.md` | `arte/uas-fuentes/<slug>/` (fuera de Git) | `2-fuentes.md` |
| 3. La maqueta HD | `src/data/uas/<slug>.ts` con forma, color, marcas, partes | zodk-web | `3-maqueta.md` |
| 4. El pixel HD | Pixel del visor, tarjeta y planta | zodk-web | `4-pixel.md` |
| 5. En la web | Importada, probada, capturas | zodk-web | `5-web.md` |
| 6. Revisión del usuario | Fallos analizados con fotos y corregidos | zodk-web | `6-revision.md` |
| 7. Cierre | Commit, push (cuando lo pida) | Los dos repos | `7-cierre.md` |

## Cómo trabajar con el usuario

Vale para todas las fases, junto con lo de `CLAUDE.md` (castellano llano,
git a mano, no ampliar el alcance, sus assets tal cual, criterio técnico
sin menús de opciones).

- **No escribir en la bóveda sin permiso explícito** para eso en concreto.
  Una sugerencia de pasada no es permiso. La nota nueva del dron sí se
  escribe (es el encargo), pero no se tocan otras notas (glosario,
  armamento, notas de otros drones) sin pedirlo: se propone en el chat.
- **El push a `main` publica la web**: nunca sin que lo pida.
- Se le pregunta solo lo que tiene consecuencias visibles y no está ya
  fijado aquí, con una recomendación.
- **Capturas**: en vista previa (`SendUserFile` con `display: "render"`). Si
  son varias, juntas en **una sola página HTML** (base64, fondo oscuro,
  rótulo por fila, foto y render lado a lado). Decir qué es cada una.
- **Opciones visuales** (cuando pide «varias opciones» o «cúrratelo»):
  montadas en la página real en localhost con un panel temporal de botones
  (abajo a la derecha, solo con `import.meta.env.DEV`, recordando la
  elección en `localStorage`). Al elegir, se quita el panel y el código de
  pruebas antes del commit.
- Si algo nuevo es **visual y admite varias lecturas** (un dibujo, un punto
  de vista), preguntar antes de dibujar o enseñar un boceto.
- Si dice «como estaba» o «la original», se vuelve a la última versión
  buena (`git show HEAD:archivo`) y se aplica solo el cambio pedido.
- Después de aplicar cambios, el resumen va corto.

## Imágenes y capturas

Cada imagen que se mira se queda en el contexto hasta el final de la sesión
(una grande, unos 1.500 tokens) y cada captura arranca un Chrome con WebGL.
Las justas:

- **Las capturas para comprobar algo uno mismo, recortadas a la pieza** que
  se mira y sin `--escala=2`. Las que son para el usuario, como siempre.
- **Para repasar muchas fotos, una hoja de contactos** con ffmpeg
  (`tile=3x3` o más) en vez de abrirlas de una en una.
- **Una foto de referencia se mide una vez** y lo medido va a «Medidas
  clave» del diario; no se vuelve a abrir en cada vuelta.
- Lo que ya se comprobó recortado no se vuelve a abrir para montar la
  página del usuario.
- **No lanzar muchos Chrome a la vez** (además, alguno sale sin WebGL).
- `npm run dev` se queda en marcha entre fases: el usuario mira los cambios
  en local.

## El diario del dron

`docs/drones/<slug>.md`, uno por dron, en Git (es lo único que ve también el
PC con Linux). Se crea al empezar y es **el relevo entre sesiones**: tiene
que bastar para seguir sin nada más. Conciso. Apartados, en este orden:

| Apartado | Qué lleva | Cómo se escribe |
|---|---|---|
| **Dónde estamos** | Fase, qué está hecho, qué falta, qué está sin commitear, siguiente paso | **Se reescribe entero** al acabar cada fase (y si se para a medias). Unas 10 líneas como mucho. Sin lo hecho que ya no afecta a lo que sigue |
| **Decisiones del usuario** | Versión, avión de las marcas, carga, nombre…, con la fecha | Una línea cada una. Solo se añade |
| **Medidas clave** | Las que hacen falta para seguir: largo, envergadura, cámaras encajadas buenas, colores medidos | Se corrige si cambia. Sin historia |
| **Fuentes** | La tabla de fotos (archivo, qué enseña, autor y licencia, URL), copiada del `FUENTES.md` de fuera de Git, para poder bajarlas en otro ordenador. De dónde salen las medidas | Como la tabla de `FUENTES.md` |
| **Probado y descartado** | Lo que no se vuelve a intentar con este dron | Una línea cada cosa, con el porqué |
| **Registro** | Lo hecho en cada vuelta | Corto. **Al retomar no se lee** salvo que haga falta algo de ahí |

## Antes de empezar

1. En `~/Documents/zodk-web`: `git pull`, `git status` y rama. **Un dron
   nuevo va en `main`**: el importador se niega fuera de `main`. Como el
   push a `main` publica, no se hace push hasta que el usuario dé el dron
   por bueno; si mientras tanto hace falta publicar otra cosa, avisar de
   que el dron a medias saldría también.
2. En la bóveda (`~/Documents/boveda-osint`), `git pull` y `git status`.
3. **Preguntar solo lo que no está fijado**: qué versión del dron (si hay
   varias, como el Raven de gimbal o de cámaras fijas), **qué avión
   concreto** da las marcas y **con qué carga** va. El usuario puede dejar
   elegir el avión («te dejo trabajando»); entonces se elige el que tenga
   más fotos de los dos lados.
4. **Ya decidido, no se pregunta**: el dron va **montado como en vuelo**
   (alas desplegadas, hélices puestas; nada plegado ni en la mochila), en
   HD con estilo C, botón «Maqueta | Pixel», partes con letras, vistas y
   modo Pixel como en los demás, pixel HD a 1 px. País = el del fabricante.
5. `npm run dev` en marcha (`localhost:4321`, no `127.0.0.1`). Antes de
   arrancarlo, `lsof -nP -iTCP:4321 -sTCP:LISTEN` y cerrar ese proceso si lo
   hay (`kill <pid>`): si el 4321 está ocupado, Astro arranca en el 4322 y
   el navegador sigue viendo el viejo.

## Decisiones que hay que respetar

- **Diseño propio**: la idea del «Airframe explorer» de drone-warfare.com,
  pero ni su diseño ni su código ni su geometría. No se usan modelos 3D de
  otros; un render de otro solo como guía de cómo es una pieza.
- **Nombres**: «el visor» (el recuadro completo, `VisorUAS`; nunca
  «tarjeta», «ficha» ni «expediente»), «Hangar de UAS» (la sección), fichas
  en `/uas/<slug>`, «munición» (no «bomba») como palabra general.
- El crédito del visor se queda igual en todos los drones, también los de
  renders: «Maqueta creada a partir de fotos públicas. Hecho con» Three.js
  y Claude Code.
- «Tinta, sin color» en el marco del visor; el único color es la bandera.
  El dron, en su color real, en la maqueta y en el pixel.
- Banderas en pixel art (`BanderaUAS.astro`), no emoji, en `/uas`, el visor
  y la portada.
- El encuadre del visor se queda como está, aunque los drones de ala larga
  salgan pequeños.

Lo probado y rechazado de cada fase está al final de su documento: no se
reintenta salvo que el usuario lo pida.

## Archivos

| Archivo | Qué es |
|---|---|
| `src/data/uas/<slug>.ts` | La maqueta, solo datos |
| `src/data/uas/tipos.ts` | Qué es una maqueta: piezas, acabados, calcas, partes |
| `src/data/banderas.json`, `src/data/banderas.ts` | Las banderas en pixel art |
| `src/scripts/uas-geometria.ts` | Mallas de cada tipo de pieza |
| `src/scripts/uas-hd.ts` | El HD: materiales, luz, calcas y costuras |
| `src/scripts/uas-paletas.ts` | Paletas del pixel |
| `src/scripts/uas-pixelado.ts` | El modo Pixel |
| `src/scripts/visor-uas.ts`, `src/components/VisorUAS.astro` | El visor |
| `src/scripts/uas-miniatura-hd.ts` | Tarjeta, planta y nave en pixel HD |
| `scripts/importar-notas.mjs` | Notas de la bóveda → `src/content/uas/` |
| `arte/generar-uas-miniaturas-hd.mjs` | Tarjeta y planta |
| `arte/generar-naves-uas-hd.mjs`, `arte/generar-naves-noche.py` | Nave del hero |
| `arte/encajar-camara.mjs`, `arte/comparar-foto.mjs`, `arte/vista-visor.mjs`, `arte/superponer-plano.mjs` | Medir y comparar con fotos y planos |
| `arte/capturas.mjs` | Capturas |
| `public/uas/<slug>/` | Tarjeta, planta y `fuentes/` |
| `arte/uas-fuentes/<slug>/` | Fotos grandes, `FUENTES.md`, ajustes (fuera de Git) |
| `docs/drones/<slug>.md` | El diario del dron |
| `02 - Temas/Hangar de UAS/` (bóveda) | Las notas de los drones, `Glosario y Terminología.md` y `Armamento/` |
