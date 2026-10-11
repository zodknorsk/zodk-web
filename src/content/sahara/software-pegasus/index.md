---
title: Software Pegasus
date: '2026-08-26'
description: >-
  Pegasus es un spyware desarrollado por la empresa israelí NSO Group, diseñado
  para instalarse de forma encubierta en teléfonos iOS y Android. Su venta a…
updated: '2026-08-31'
tags:
  - sahara-project
  - israel
  - osint
periodo: Mayo de 2021
lugar: Madrid
borrador: true
---
## Qué es

**Pegasus** es un spyware desarrollado por la empresa israelí <mark>**NSO Group**</mark>, diseñado para instalarse de forma encubierta en teléfonos iOS y Android. Su venta a gobiernos extranjeros requiere la aprobación del Ministerio de Defensa israelí. Aunque NSO Group lo comercializa como herramienta contra el terrorismo y el crimen organizado, múltiples investigaciones (Citizen Lab, Amnistía Internacional, el **Pegasus Project** de 2021) han documentado su uso contra periodistas, abogados, activistas de derechos humanos y disidentes políticos en todo el mundo.

- Primera versión: 2011
- Detectado públicamente por primera vez: 2016 (caso del activista emiratí Ahmed Mansoor)
- Capacidades: lectura de mensajes, escucha de llamadas, robo de contraseñas, localización, acceso a cámara/micrófono, extracción de datos de apps (WhatsApp, iMessage, Gmail, Telegram, Signal, etc.)
- Ataques **zero-click**: no requieren que la víctima haga clic en nada (desde ~2019, explotando vulnerabilidades de iMessage/WhatsApp)
- Autodestrucción tras 60 días sin contacto con el servidor de control, o bajo orden remota

### Cómo infecta y cómo funciona Pegasus, en profundidad

1. **Vectores de infección — de "un clic" a "cero clics"**

*Pegasus evolucionó en pocos años:*

**<mark>Primera generación</mark>** (2016, caso Ahmed Mansoor): enlaces por SMS. La víctima tenía que pulsar un link malicioso; al hacerlo, el navegador cargaba un exploit que rompía el sistema operativo.
Generación intermedia: ataques por network injection — cuando el móvil navegaba por HTTP sin cifrar, el operador de la red (o alguien con acceso a la infraestructura de telecomunicaciones) redirigía el tráfico a servidores de NSO que instalaban el spyware sin que la víctima hiciera nada visible. Por eso el caso de Sánchez en Ceuta se vincula a un IMSI-Catcher: un dispositivo que simula una antena de telefonía legítima para "atrapar" el móvil objetivo dentro de su propia red y manipular su tráfico.

<mark>**Generación "zero-click"**</mark> (la más peligrosa, desde ~2019): no requiere ninguna interacción. Se explotan vulnerabilidades en apps que procesan datos automáticamente en segundo plano — el ejemplo más famoso es el fallo de WhatsApp de 2019 (una llamada VoIP maliciosa infectaba el teléfono aunque no se contestara) y el exploit ForcedEntry de iMessage en iOS (una imagen o archivo GIF manipulado bastaba). En el informe de CatalanGate, Citizen Lab documentó además HOMAGE, un exploit 0-click de iMessage no revelado hasta entonces.

2. **Qué hace una vez dentro**

Tras la infección inicial, Pegasus ejecuta una cadena de exploits que va escalando privilegios hasta conseguir acceso root/jailbreak silencioso del dispositivo, sin que aparezca ningún icono, notificación ni rastro visible para el usuario. A partir de ahí puede:

- Leer mensajes de apps cifradas después de que se descifren en el propio teléfono (WhatsApp, Signal, Telegram) — no rompe el cifrado, simplemente lee lo que ya está descifrado en pantalla o en memoria.
- Acceder a correos, contactos, fotos, historial de navegación, contraseñas guardadas.
- Activar cámara y micrófono en remoto para grabar en tiempo real.
- Rastrear la geolocalización de forma continua.
- Exfiltrar todo ese material a servidores de mando y control (C2) del cliente que contrató el spyware, normalmente en paquetes comprimidos (de ahí las cifras de "2,6 GB extraídos del móvil de Sánchez").

3. **Por qué es tan difícil de rastrear**

- Huella mínima: Pegasus está diseñado para autodestruirse o borrar sus rastros si detecta riesgo de detección, y no dejar procesos visibles.
- Infraestructura desechable: NSO Group rota constantemente los dominios y servidores C2, dificultando la atribución técnica.
- El "problema de la atribución": aunque el análisis forense (como el que hace el Citizen Lab con su herramienta MVT, o el CCN-CNI en España) puede confirmar que un teléfono fue infectado con Pegasus, identificar qué gobierno concreto pagó esa operación es mucho más difícil, porque NSO Group no revela la lista de clientes y el propio software no incluye "firma" del operador. Es lo que ha bloqueado judicialmente el caso español: se sabe que hubo infección, pero no hay confirmación oficial de autoría (aunque los indicios técnicos y de inteligencia apuntan a Marruecos).
- Israel no coopera: como país donde reside NSO Group, las comisiones rogatorias españolas y francesas para que la empresa aporte datos de sus clientes han sido sistemáticamente ignoradas, lo que ha llevado al archivo (y reapertura, y nuevo archivo) del caso.

3. **El "candado" legal de NSO Group**

- Pegasus se vende oficialmente solo a gobiernos y agencias estatales, bajo <mark>licencia de exportación del Ministerio de Defensa israelí</mark>, con la justificación de combatir terrorismo y crimen organizado. Esto significa que, técnicamente, cualquier infección tiene que haber sido encargada por un Estado — lo cual es precisamente lo que hace tan grave el caso: implica que un gobierno (presuntamente Marruecos) espió al jefe de otro gobierno de la UE con una herramienta que, en teoría, tiene controles de exportación.

## El Pegasus Project (2021)

Filtración de una lista de **50.000 números de teléfono** seleccionados como posibles objetivos por clientes de NSO Group, investigada por un [consorcio](https://forbiddenstories.org/about-the-pegasus-project/) de 17 medios (The Guardian, Le Monde, Washington Post, El País entre otros) coordinado por Forbidden Stories y Amnistía Internacional. Se identificaron **11 países clientes**: Azerbaiyán, Baréin, Hungría, India, Kazajistán, México, Marruecos, Ruanda, Arabia Saudí, Togo y Emiratos Árabes Unidos.

### Pegasus Project: Inside Morocco's spying machine


<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/eWS9Dq76nWg" title="Vídeo de YouTube" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe></div>


- [Moroccan intelligence is believed to have spied on Spanish agents who were training them](https://forbiddenstories.org/moroccan-intelligence-is-believed-to-have-spied-on-spanish-agents-who-were-training-them/)
- [While France was considering buying Pegasus, Morocco was spying on its ministers](https://forbiddenstories.org/while-france-was-considering-buying-pegasus-morocco-was-spying-on-its-ministers/)
- [How Morocco allegedly spied on an African ally](https://forbiddenstories.org/how-morocco-allegedly-spies-on-an-african-ally/)
- [Codename “Morgan”: how Morocco accessed Pegasus, involving Israel and the United Arab Emirates](https://forbiddenstories.org/codename-morgan-a-look-back-at-moroccos-acquisition-of-pegasus-involving-israel-and-the-united-arab-emirates/)
- [Morocco Denied Using Pegasus. Documents and Insider Accounts Tell a Different Story](https://forbiddenstories.org/how-did-morocco-become-addicted-to-tracking-down-its-opponents-with-spyware/)
## CatalanGate (España, 2022)

Según una investigación de *The Guardian* y *El País*, y posteriormente confirmada por Citizen Lab en abril de 2022, el Gobierno de España usó Pegasus para intervenir los teléfonos de **al menos 63 personas** vinculadas al independentismo catalán y vasco, incluyendo:

- Roger Torrent (expresidente del Parlament de Catalunya)
- Anna Gabriel
- Arnaldo Otegi y Jon Iñarritu (EH Bildu)

El 5 de mayo de 2022 la ministra de Defensa, **Margarita Robles**, admitió la vigilancia judicialmente autorizada de 18 personas del entorno independentista.

## El espionaje al propio Pedro Sánchez

Días después de admitirse el caso CatalanGate, el Gobierno reveló que él mismo había sido víctima:

- **Mayo de 2022**: Moncloa denuncia que los móviles de **Pedro Sánchez** y la ministra **Margarita Robles** fueron infectados con Pegasus en **mayo de 2021**.
- Los datos definitivos que arrojó la investigación posterior: el teléfono de Sánchez fue infectado **hasta 5 veces** entre 2020 y 2021, con extracción de **más de 2,5-2,7 GB de datos**; el de Robles fue accedido varias veces (cifras algo menores, ~9 MB en una de las intrusiones reportadas inicialmente).
- La investigación se amplió después a los ministros **Fernando Grande-Marlaska** (Interior) y **Luis Planas** (Agricultura).
- **10 de mayo de 2022**: cesada **Paz Esteban**, directora del CNI (Centro Nacional de Inteligencia) — la primera mujer al frente del organismo —, como consecuencia política del escándalo. Recibió una indemnización de 174.122 €.
- La autoría nunca se ha confirmado oficialmente, pero las sospechas apuntan de forma consistente a **Marruecos**, en un contexto de fuerte tensión diplomática por el Sáhara Occidental y las crisis migratorias en Ceuta.

### Recorrido judicial

| Fecha      | Hito                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2022       | La Abogacía del Estado denuncia los hechos ante la Audiencia Nacional; instruye el juez **José Luis Calama**                                                                               |
| Julio 2023 | Calama archiva provisionalmente la causa: España enviò varias comisiones rogatorias a Israel que **nunca fueron respondidas**                                                              |
| Abril 2024 | Se reabre la causa al recibir una Orden Europea de Investigación con datos de Francia (donde Pegasus también afectó a políticos franceses, incluido Macron)                                |
| 2024-2025  | El Centro Criptológico Nacional (CNI) elabora informes periciales comparando los ataques español y francés; se declara imposible identificar con certeza al operador que ejecutó el ataque |
| **2025**   | La Audiencia Nacional **archiva por segunda vez** el caso, citando la "obstrucción" de Israel a cooperar con la investigación                                                              |

Israel, como país de origen de NSO Group y único capaz de identificar qué cliente ejecutó el ataque, nunca ha colaborado con la Justicia española.

## El "chantaje": lo que se sabe y lo que es especulación

Existe un relato extendido en medios y en el debate político español que vincula el hackeo con la política exterior posterior de Sánchez hacia Marruecos, pero es importante distinguir los hechos confirmados de la especulación:

**Hechos verificados:**
- El hackeo del móvil de Sánchez ocurrió en 2021.
- Poco después, en **marzo de 2022**, España dio un giro histórico en su posición sobre el Sáhara Occidental, respaldando el plan de autonomía marroquí (rompiendo con décadas de neutralidad española).
- El Gobierno nunca ha roto relaciones diplomáticas con Marruecos ni ha adoptado medidas de presión pese al presunto espionaje.
- El CNI ha advertido (según informes citados por prensa) de un "alto riesgo" de que Israel —a través de NSO Group, que según varios expertos comparte datos con el Mossad— tenga acceso a la información extraída del móvil de Sánchez.

**Especulación / no confirmado:**
- La hipótesis del "chantaje" (que Marruecos o Israel poseerían información comprometedora sobre Sánchez, su entorno familiar o casos como el de Begoña Gómez, David Sánchez, Ábalos/Koldo/Cerdán, y la usarían como palanca) ha sido planteada por columnistas, opositores políticos y, en septiembre de 2025, por un exoficial de las fuerzas armadas israelíes (José Lev Álvarez Gómez, sargento retirado), en un artículo de opinión publicado en *The Times of Israel*. Se trata de una hipótesis, no de una acusación probada.
- En mayo de 2025 el embajador israelí en España, en el marco de las tensiones por Gaza, hizo unas declaraciones que algunos medios interpretaron como una velada amenaza de "revelaciones de Pegasus" — otro dato que alimenta la teoría pero que tampoco constituye prueba de nada.
- Maldita.es (verificador de datos) señala que la afirmación de que "Sánchez gobierna bajo el chantaje de Marruecos" no ha sido investigada/verificada como cierta ni como falsa; sigue en el terreno del rumor político.

En resumen: el espionaje al móvil de Sánchez está acreditado documentalmente y sin resolver judicialmente (autoría no probada, caso archivado por falta de cooperación israelí). El "chantaje" es una interpretación/hipótesis political-mediática sobre las posibles consecuencias de ese espionaje, ampliamente difundida pero no demostrada con pruebas concluyentes.

## Otros casos relevantes citados en la Wikipedia (contexto internacional)

- **Marruecos**: también señalado como responsable del espionaje a Emmanuel Macron y 14 ministros franceses (2021), y a más de 6.000 teléfonos argelinos (lo que llevó a Argelia a romper relaciones diplomáticas con Rabat en 2021).
- **Polonia**: uso masivo contra la oposición (Roman Giertych, Krzysztof Brejza) bajo el gobierno de Ley y Justicia (PiS); en enero de 2025 el exministro de Justicia Zbigniew Ziobro fue detenido por presunto uso indebido de Pegasus.
- **Arabia Saudí**: vinculado al asesinato de Jamal Khashoggi (2018) y al espionaje a Jeff Bezos.
- **Reino Unido**: Downing Street y el móvil de Boris Johnson, presuntamente atacados por Emiratos Árabes Unidos.
- **EE. UU.**: NSO Group en la lista negra del Departamento de Comercio desde 2021; en mayo de 2025 un tribunal ordenó a NSO pagar 167 millones de dólares a Meta/WhatsApp por daños.

## Fuentes
- [Pegasus (spyware) — Wikipedia (inglés)](https://en.wikipedia.org/wiki/Pegasus_(spyware))
- [Paz Esteban López — Wikipedia](https://en.wikipedia.org/wiki/Paz_Esteban_L%C3%B3pez)
- Vozpópuli (sept. 2025) — "Un exoficial israelí insinúa que Sánchez gobierna bajo el 'chantaje' de Marruecos por Pegasus"
- Maldita.es — La Buloteca, verificación pendiente sobre el bulo/rumor del chantaje
- El Independiente (abr. 2024) — reapertura de la causa en la Audiencia Nacional
- Poder Judicial / CGPJ — nota de prensa sobre el segundo archivo del caso
- El Confidencial Digital (dic. 2023) — temor a represalias de Israel usando datos de Pegasus
- Diario Socialista (oct. 2025) — "Pegasus: ¿Qué le debe Sánchez a Israel?"
- BBC News — "Spain dismisses spy chief in Pegasus phone spyware scandal"

---
