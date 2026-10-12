# Fase 1. La nota en la bóveda

Parte de `docs/nuevodron.md`, que se lee antes. Lo que pase con el dron, en su diario.

En `02 - Temas/Hangar de UAS/`. Modelos: la nota del Bayraktar TB2 y la del
MQ-9 Reaper. La plantilla `00 - Meta/Plantilla UAS (Templater).md` da el
esqueleto, pero **tiene viejos el formato de las fuentes y le falta la fila
«Despegue»**: manda lo de aquí.

**Archivo**: la bandera y el nombre, `🇺🇸 Skydio X10D.md`. El `titulo` (sin
bandera) da la dirección: `Skydio X10D` → `/uas/skydio-x10d`, y **tiene que
coincidir con el nombre de la maqueta** (`src/data/uas/skydio-x10d.ts`).

**Frontmatter**, el de todas las notas, en este orden y sin claves propias:

```yaml
---
titulo: Bayraktar TB2
tipo:
  - analisis
autor:
  - hegoi-marquez
estado:
  - borrador
creado: 2026-09-29
actualizado: 29-09-2026 18:38
publicar: true
tags:
  - turquia
  - dron
---
```

- `estado: borrador` y se queda así: **la nota la revisa y la pasa a
  `completa` el usuario**. No preguntarle si se pasa.
- `tags`: solo el **país del fabricante** y `dron`. Nunca los países que lo
  operan.
- Sin línea en blanco entre el `---` de cierre y el cuerpo.

**Cuerpo**, sin reglas `---` entre apartados y con una línea en blanco antes
de cada `##`:

- **Una cita `>`** justo debajo, sin título (nada de `## Introducción`): un párrafo con qué es, quién lo
  fabrica y para qué se usa. **Sin enlaces.** `==resaltado==` para lo clave. Si las cifras son del
  fabricante, un aviso ⚠️ en un párrafo aparte.
- `## Visor` con `*Aquí se inserta el visor creado para el blog*` (en la web
  se cambia por el visor).
- `## CARACTERÍSTICAS`: tabla de dos columnas, filas en negrita, en este
  orden:
  - **País**: con la bandera delante (`🇹🇷 Turquía`). Siempre el **país del
    fabricante oficial**, lo opere quien lo opere. Lo usa el filtro de
    `/uas`.
  - **Fabricante**, **Operador** (aquí van los países que lo usan).
  - **Categoría**: sale en las tarjetas, hasta la primera coma («Dron armado
    MALE»).
  - **Situación**, **Primer uso en combate**, **Envergadura / longitud /
    peso**, **Alcance**, **Carga**, **Motor**.
  - **Despegue**: RATO desde una rampa, desde pista con tren, a mano, VTOL…
    o «No publicado».
  - **Origen**, con `[[…]]`.
  - Lo que no se sepa: «No publicado». Lo que solo dice el fabricante:
    «(fabricante)». En una tabla, el alias de un enlace va con la barra
    escapada: `[[🇹🇷 MAM-L\|MAM-L]]`.
- `## Historia`: **solo el origen**: quién lo hizo, de dónde sale, por qué
  nace y cómo llega a su primer uso. Uno o dos párrafos, sin balance de
  derribos ni de uso reciente. Se cuenta como un relato que se lee de
  corrido, con frases de largo normal. **Ni informe técnico ni redacción de
  colegio.**
- `## Especificaciones y Uso`: todo lo demás, **en párrafos sueltos, sin
  subtítulos**: diseño y prestaciones, carga y cámaras, versiones y
  variantes, cómo se maneja y se emplea, hitos y contra qué se usa. Amplía
  la tabla, no la repite; las cifras del texto, solo las que hacen falta.
- **Enlaces en el texto: pocos**, solo donde el lector querrá comprobar algo
  (una cifra discutible, un hito, el vídeo del primer derribo). Lo demás se
  apoya en `## Fuentes`. Los balances del tipo «en 2024 llevaba tantos
  derribos» solo van si definen al dron, no por defecto en todos.
- `## En acción`: tuits embebidos (`![](https://x.com/…/status/…)`), de este
  dron y no de sus variantes (buscar `"x.com" <dron>`). Si no se encuentra
  ninguno, la sección no va y se dice. x.com no deja leer los tuits; para
  ver el texto, la fecha y si lleva vídeo de cada candidato:
  `curl -s "https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a"`
  (JSON con `text`, `created_at` y `mediaDetails[].type`: `video` o
  `photo`).
- `## Fuentes`: una línea por fuente,
  `* **Medio**, mes año - Título real ([fuente](url))`:
  - el medio en negrita, con el nombre que use el usuario;
  - el título real, en su idioma, no un resumen;
  - primero las webs sin fecha (Wikipedia, ficha del fabricante), sin mes
    ni año: `* **Wikipedia** - Título ([fuente](url))`;
  - después, de la más antigua a la más reciente;
  - si no se encuentra la fecha de algo que la tiene, no se inventa: se deja
    sin ella y se avisa.

**Fuentes de la nota**: **varias e independientes**, cada cifra en al menos
dos cuando se pueda. Think tanks (CSIS, RUSI), inteligencia ucraniana (GUR),
medios especializados (Infodefensa, Militarnyi, Defense Express, The War
Zone, Naval News, Army Technology), agencias y prensa general, la web del
fabricante, los medios que visitan la fábrica. drone-warfare.com y
Wikipedia sirven para orientarse, no como base.

**Cómo se escribe**:

- Castellano llano, como lo contaría una persona. Nada de calcos del inglés
  («el tipo», «la plataforma», «capacidades»), frases de resumen ni giros
  grandilocuentes («se puede perder sin gran drama»). Se dice «el dron» o
  su nombre.
- Nombrar los hechos (qué se atacó, cuándo) en vez de resumirlos.
- Decir siempre lo que solo afirma el fabricante.
- **No se resaltan con `==` los términos del glosario** (VTOL, MTOW, jamming,
  EO/IR…): en la web ya se enlazan solos. El resaltado es solo para lo clave
  de la frase, como en la cita.
- **Nada de información absurda.** Cada dato tiene que servir para entender
  qué es el dron, cómo funciona o cómo se usa. Fuera lo que no cambia nada:
  pedidos y entregas de países que no interesan, cuántos derribos o salidas
  lleva, cifras sueltas de balance. Ante la duda, no va.
- **La tabla es una guía rápida**: nombres y cifras clave. El detalle (alcance
  de un sensor, variantes de cámara, matices, minutos de autonomía) va en
  `Especificaciones y Uso`, no en la tabla.
- **Carga útil no es cabeza de combate.** Si la ficha solo da la carga útil
  máxima, se dice eso y que no se publica cuánto es explosivo.
- Cuando dos fuentes dan cifras distintas (autonomía, velocidad), se ponen
  las dos con su atribución y la tabla se queda con la del fabricante.
- Comillas latinas «», raya pegada para los incisos (`—así—`). Las fotos,
  con su pie en cursiva en la línea siguiente.

**Nombres que se enlazan solos**: en la web, la primera vez que sale un
término del glosario o una munición del armamento lleva su tarjeta (y otra
vez la primera vez en la tabla), pero **solo si está escrito igual que en su
nota**:

- Términos: tal cual los pone `Glosario y Terminología.md`, con las siglas
  en mayúsculas («MTOW», «jamming», «RATO», «SATCOM»; no «peso máximo al
  despegue» ni «interferencia»). La categoría, «Dron armado MALE», no «MALE,
  de media altitud y gran autonomía». En tablas, término siempre; en el
  texto corrido, con mesura.
- Municiones: el nombre de su nota en `Hangar de UAS/Armamento/`, su
  designación o su nombre («AGM-114 Hellfire», «AGM-114», «Hellfire»;
  «GBU-38», no «GBU 38» ni «bomba JDAM de 500 libras»).
- Si hace falta un término o una munición que no está, **se propone** añadirlo
  a su nota, en vez de explicarlo en la del dron (ver «Si el dron trae algo
  nuevo»).

**Variante de un dron ya hecho** (el Geran-2 del Shahed): nota aparte con su
país (el del fabricante), su historia y sus fotos; en «En acción», solo
vídeos de esa variante. La maqueta importa la del original y cambia lo que
cambie (ver fase 3).

## Si el dron trae algo nuevo

- **Una munición que no está en el armamento**: se propone al usuario
  crearla. Va en `Hangar de UAS/Armamento/`, una nota por munición
  (`🇺🇸 AGM-114 Hellfire.md`): `titulo` «designación nombre» o solo el
  nombre si no tiene designación de EE. UU. («JSM»); el frontmatter de
  siempre; fotos con su pie (varias seguidas, con una línea en blanco entre
  ellas, salen en carrusel); tabla (País, Fabricante, Tipo, Guiado, Peso /
  longitud, Warhead, Alcance, En servicio, Lo llevan); el texto, cuyo
  **primer párrafo empieza diciendo qué es** (sale en la tarjeta); y
  `## Fuentes` como los drones. Se añade al `## Índice` de `Armamento.md`
  en su grupo. Las fotos, en `02 - Temas/Adjuntos/armamento-*.jpg`, de
  Commons con licencia libre y su crédito en el pie.
- **Un término que no está en el glosario**: se propone añadirlo a
  `Glosario y Terminología.md` (el término en inglés delante y el
  castellano detrás).
- **Un país nuevo**: su bandera en `src/data/banderas.json`.
- **Un enlace desde otra nota** (otro dron, el glosario) al nuevo: se
  propone; no se toca otra nota sin permiso.
