---
title: Skydio X10D
date: '2026-09-27'
description: >-
  El Skydio X10D es un microdrón cuadricóptero de reconocimiento que fabrica la
  empresa estadounidense Skydio, la versión militar de su X10 civil. Pesa poco…
updated: '2026-10-09'
tags:
  - eeuu
  - dron
bandera: "\U0001F1FA\U0001F1F8"
pais: Estados Unidos
categoria: Microdrón de reconocimiento
---
> El Skydio X10D es un <mark>microdrón cuadricóptero de reconocimiento</mark> que fabrica la empresa estadounidense Skydio, la versión militar de su X10 civil. Pesa poco más de 2 kg, se pliega y lo maneja un solo soldado. Lleva una cámara de día y otra térmica, y seis cámaras de navegación con las que <mark>vuela solo y esquiva obstáculos</mark>, incluso sin GPS y sin conexión a internet. Lo usa el ejército de EE. UU. y fue adquirido recientemente por España.


<div class="visor-hueco"></div>

## CARACTERÍSTICAS

|                                   |                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **País**                          | 🇺🇸 Estados Unidos                                                                                       |
| **Fabricante**                    | Skydio (California)                                                                                       |
| **Operador**                      | Ejército de Tierra, Ejército del Aire y del Espacio y Armada (España); Ejército de EE. UU.; Noruega; OTAN |
| **Categoría**                     | Microdrón de reconocimiento (cuadricóptero)                                                               |
| **Situación**                     | En servicio                                                                                               |
| **Primer uso en combate**         | No documentado (entregas desde 2024)                                                                      |
| **Envergadura / longitud / peso** | 79 × 65 × 14,5 cm desplegado con hélices / 2,14 kg; 2,49 kg de MTOW (fabricante)                          |
| **Alcance**                       | 10 km de enlace LOS (fabricante)                                                                          |
| **Carga**                         | Módulo EO/IR VT300-Z o VT300-L (fabricante)                                                               |
| **Motor**                         | Cuatro motores eléctricos; 72 km/h (fabricante)                                                           |
| **Despegue**                      | VTOL                                                                                                      |
| **Origen**                        | Skydio X10 (versión civil, 2023)                                                                      |

## Historia

Skydio nació en 2014 en California, fundada por antiguos estudiantes del MIT, y se hizo conocida por sus drones civiles que siguen solos a quien los lleva, pensados para deportes de riesgo. En septiembre de 2023 presentó el X10, para policías, bomberos y emergencias, y su versión militar, el X10D: la misma estructura, con una radio que cambia de frecuencia si la interfieren, vuelo sin GPS, almacenamiento cifrado y sin límites de zona.

En abril de 2025 el Ejército de EE. UU. [empezó a recibirlo](https://www.skydio.com/blog/skydio-delivers-first-systems-for-army-srr-t2) dentro de su programa de reconocimiento de corto alcance ([SRR](https://www.congress.gov/crs-product/IF12668)). Noruega lo compró en 2025 y la agencia de compras de la OTAN lo eligió poco después.

## Especificaciones y Uso

Es un cuadricóptero plegable de 2,14 kg con la radio Connect MH, la multibanda (con la Connect SL pesa 2,11), y 2,49 kg de MTOW. Desplegado mide 79 × 65 × 14,5 cm con las hélices, y plegado y sin batería, 35 × 16,5 × 12 cm. Se pone en marcha en unos 60 segundos (40 con la radio SL). Según el fabricante vuela hasta 40 minutos, 35 en estacionario, con una batería de 156 Wh, y llega a 72 km/h, o 58 km/h cuando esquiva obstáculos. Aguanta ráfagas de 12,8 m/s, su techo de servicio es de 4.572 m y tiene protección IP55 contra polvo y agua.

Para orientarse lleva seis cámaras de navegación, de 200° cada una y repartidas arriba y abajo, que cubren los 360° y ven obstáculos hasta 20 m. Dos procesadores, un NVIDIA Jetson Orin y un Qualcomm QRB5165, hacen el trabajo. Sin señal de satélite, la odometría visual-inercial le permite seguir volando y volver por puntos de anclaje, con un error de ±10 cm en estacionario. Está pensado para entornos GPS-denied con jamming. Esas cámaras necesitan luz: de noche, sin ella, el dron desactiva la evitación de obstáculos. Para eso existe <mark>NightSense</mark>, un accesorio opcional de dos luces, una arriba y otra abajo, que alumbra el entorno para las cámaras de navegación, con luz visible o infrarroja que no se ve a simple vista. Con él puesto, el dron esquiva obstáculos a oscuras, pero queda limitado a 8 m/s. España no ha comprado esta pieza: su pliego solo la pide como deseable.

El módulo de cámaras viene en dos versiones. Las dos tienen una cámara de día de 64 MP y una cámara térmica FLIR Boson+ de 640 × 512 píxeles, que distingue diferencias de temperatura de menos de 30 mK. Lo que cambia es la tercera cámara. La VT300-Z añade un teleobjetivo de 48 MP, que acerca la imagen unas cuatro veces más que la cámara normal; la que pide el E.T. (Ejército de Tierra) en su pliego. La VT300-L lleva en su lugar un gran angular de 50 MP, que abarca mucho más campo. Sobre la imagen en directo se ven las coordenadas del punto del suelo al que apunta la cámara, para marcar un objetivo.

Hay dos radios. La <mark>Connect SL</mark> usa solo la banda de 5 GHz y llega a 12 km; la <mark>Connect MH</mark>, multibanda en varias frecuencias entre 1,79 y 2,5 GHz, llega a 10 km, los dos con línea de visión y sin interferencias. El pliego del Ejército de Tierra apunta que el <mark>modelo español lleva la MH</mark>. Los datos van cifrados con AES-256, y también el disco interno y las tarjetas de memoria, con arranque y actualizaciones firmados. Está en la lista Blue UAS, una lista del Pentágono de drones de confianza que no utilizan piezas chinas. Se maneja con un mando con pantalla de 6,6 pulgadas y unas 5 horas de batería.

En España lo suministra Paukner, el socio de Skydio. El Ejército de Tierra [formalizó la compra en febrero de 2025](https://www.infodefensa.com/texto-diario/mostrar/5196185/ejercito-tierra-formaliza-compra-drones-skydio-x10d): 114 sistemas de cuatro drones, ampliables hasta 900 drones, que llegarán también al Ejército del Aire y a la Armada. Para volarlo hay que pasar un curso, con una parte teórica y otra práctica, de al menos seis horas de vuelo, que incluye volar sin GPS y cartografiar, y que certifica a cada operador. Sus misiones van desde la adquisición de objetivos y la corrección del fuego de morteros y artillería hasta el reconocimiento, la protección de la fuerza y el control de masas. Se desplegó en [Letonia](https://www.infodefensa.com/texto-diario/mostrar/6026918/ejercito-avanza-incorporacion-dron-x10d-elige-letonia-despliegue-operaciones-exterior) en septiembre de 2026, en su primer despliegue internacional con España.

## En acción


<blockquote class="tweet" data-tweet-id="1866794019235541298">
  <a class="tweet-author" href="https://x.com/ArmyRecognition/status/1866794019235541298" target="_blank" rel="noopener">
    <img class="tweet-avatar" src="/tweets/1786054478560382976-oiedrrtd_bigger.jpg" alt="" width="44" height="44" loading="lazy" />
    <span class="tweet-name">Army Recognition</span>
    <span class="tweet-handle">@ArmyRecognition</span>
  </a>
  <div class="tweet-text">🇺🇸🇫🇷US-made Skydio X10D micro-drone proves potential for urban warfare in French Army trials<br>
<a href="https://armyrecognition.com/news/army-news/army-news-2024/us-made-skydio-x10d-micro-drone-proves-potential-for-urban-warfare-in-french-army-trials" target="_blank" rel="noopener">armyrecognition.com/news/army-news…</a><br>
<a href="https://x.com/SkydioHQ" target="_blank" rel="noopener">@SkydioHQ</a></div>
  <a class="tweet-date" href="https://x.com/ArmyRecognition/status/1866794019235541298" target="_blank" rel="noopener">11 de diciembre de 2024</a>
</blockquote>



<blockquote class="tweet" data-tweet-id="2101033828014063780">
  <a class="tweet-author" href="https://x.com/SkydioHQ/status/2101033828014063780" target="_blank" rel="noopener">
    <img class="tweet-avatar" src="/tweets/1687215301979688965-bv1e8_y1_bigger.jpg" alt="" width="44" height="44" loading="lazy" />
    <span class="tweet-name">Skydio</span>
    <span class="tweet-handle">@SkydioHQ</span>
  </a>
  <div class="tweet-text">✈️ <a href="https://x.com/62dAirliftWing" target="_blank" rel="noopener">@62dAirliftWing</a> Maintenance Group personnel completed a four-day, hands-on training program on the Skydio X10D small unmanned aircraft system at Joint Base Lewis-McChord, Sept. 3, 2026. The training, which is the first of its kind in Air Mobility Command, included classroom […]</div>
  <img class="tweet-media" src="/tweets/media-hshd8saaaaene5f.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hshd-gma4aakdhb.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hshd_hpboaed6ah.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hshegnjbkaavxcd.jpg" alt="Imagen del tweet" loading="lazy" />
  <a class="tweet-date" href="https://x.com/SkydioHQ/status/2101033828014063780" target="_blank" rel="noopener">18 de septiembre de 2026</a>
</blockquote>



<blockquote class="tweet" data-tweet-id="2035737998617420140">
  <a class="tweet-author" href="https://x.com/SkydioHQ/status/2035737998617420140" target="_blank" rel="noopener">
    <img class="tweet-avatar" src="/tweets/1687215301979688965-bv1e8_y1_bigger.jpg" alt="" width="44" height="44" loading="lazy" />
    <span class="tweet-name">Skydio</span>
    <span class="tweet-handle">@SkydioHQ</span>
  </a>
  <div class="tweet-text">BREAKING NEWS: The <a href="https://x.com/USArmy" target="_blank" rel="noopener">@USArmy</a> just placed a $52M+ order for over 2,500 Skydio X10D drones. <br>
<br>
This is the largest single-vendor tactical sUAS order in Army history and went from bid to award in under 72 hours.<br>
<br>
Full story:</div>
  <img class="tweet-media" src="/tweets/media-hebk4h3agaaqxej.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hebk4h_byaayq6m.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hebk4h4a4aagfjx.jpg" alt="Imagen del tweet" loading="lazy" />
  <img class="tweet-media" src="/tweets/media-hebk4h4bmae3fgo.jpg" alt="Imagen del tweet" loading="lazy" />
  <a class="tweet-date" href="https://x.com/SkydioHQ/status/2035737998617420140" target="_blank" rel="noopener">22 de marzo de 2026</a>
</blockquote>



## Fuentes

* **Skydio** - Skydio X10D ([fuente](https://www.skydio.com/x10d))
* **Skydio** - Skydio X10D technical specs ([fuente](https://www.skydio.com/x10d/technical-specs))
* **Skydio** - Introducción a Skydio X10D ([fuente](https://support.skydio.com/hc/es/articles/30193790084635-Introducci%C3%B3n-a-Skydio-X10D))
* **Skydio** - Cómo volar Skydio X10 de noche ([fuente](https://support.skydio.com/hc/es/articles/21479288051867-C%C3%B3mo-volar-Skydio-X10-de-noche))
* **Defensa.com** - El Ejército de Tierra despliega los drones Skydio X10D en Letonia tras iniciar su incorporación a las unidades ([fuente](https://www.defensa.com/espana/ejercito-tierra-despliega-drones-skydio-x10d-letonia-tras))
* **Plataforma de Contratación del Sector Público**, junio 2024 - Pliego de Prescripciones Técnicas: Adquisición RPAS Clase I Categoría Micro Ala Rotatoria para Protección de la Fuerza ([fuente](https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=e0wDEiu0gPES7pcxhTeWOg%3D%3D))
* **Infodefensa**, febrero 2025 - El Ejército de Tierra formaliza la compra de drones X10D de la estadounidense Skydio ([fuente](https://www.infodefensa.com/texto-diario/mostrar/5196185/ejercito-tierra-formaliza-compra-drones-skydio-x10d))
* **Skydio**, mayo 2025 - Skydio Delivers the First Systems for Tranche 2 of the U.S. Army's Short Range Reconnaissance Program, Equipping a Deploying Unit in Days ([fuente](https://www.skydio.com/blog/skydio-delivers-first-systems-for-army-srr-t2))
* **Army Technology**, noviembre 2025 - Skydio X10D sUAS, USA ([fuente](https://www.army-technology.com/projects/skydio-x10d-suas-usa/))
* **Infodefensa**, mayo 2026 - El Ejército de Tierra acelera la 'dronificación': recibirá hasta 900 microdrones X10D de la estadounidense Skydio ([fuente](https://www.infodefensa.com/texto-diario/mostrar/5895641/ejercito-tierra-espanol-recibira-900-unidades-microdron-x10d-estadounidense-skydio))
* **Infodefensa**, septiembre 2026 - El Ejército avanza en la incorporación del dron X10D y elige Letonia para el primer despliegue en operaciones en el exterior ([fuente](https://www.infodefensa.com/texto-diario/mostrar/6026918/ejercito-avanza-incorporacion-dron-x10d-elige-letonia-despliegue-operaciones-exterior))
