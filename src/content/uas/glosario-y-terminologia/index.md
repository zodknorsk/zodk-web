---
title: Glosario y terminología
date: '2026-09-27'
description: >-
  Listado de terminología militar y aeronáutica de UAS. Se irá ampliando según
  aparezcan nuevos conceptos en el Hangar. Comunicar cualquier errata.
updated: '2026-10-02'
tags:
  - dron
glosario: true
---
> Listado de terminología militar y aeronáutica de UAS. Se irá ampliando según aparezcan nuevos conceptos en el Hangar. Comunicar cualquier errata.

## Tipos de vehículo no tripulado

- **UAV** *(Unmanned Aerial Vehicle)* — Vehículo aéreo no tripulado. Se refiere solo a la aeronave, la que vuela sin nadie a bordo.

- **UAS** *(Unmanned Aircraft System)* — Sistema de aeronave no tripulada. Es el conjunto completo: la aeronave (UAV) más todo lo que hace falta para usarla, como la estación de control en tierra, los enlaces de comunicación, el software de navegación y los sensores.

- **USV** *(Unmanned Surface Vehicle)* — Vehículo de superficie no tripulado. Embarcación que navega por la superficie del agua sin tripulación.

- **UUV** *(Unmanned Underwater Vehicle)* — Vehículo submarino no tripulado. Dron que opera bajo el agua. Hay dos familias: los AUV, que navegan solos, y los ROV, que se manejan desde fuera a través de un cable.

- **UGV** *(Unmanned Ground Vehicle)* — Vehículo terrestre no tripulado. Cualquier robot o vehículo que se mueve por tierra sin conductor a bordo.

- **RPAS** *(Remotely Piloted Aircraft System)* — Sistema de aeronave pilotada a distancia. Es el término de la OACI, que también usan EASA, ENAIRE y la OTAN, para los drones que lleva un piloto desde tierra. Sirve para distinguirlos de los drones que vuelan de forma autónoma.

- **Tethered drone** *(dron cautivo)* — Dron unido a tierra por un cable que le da electricidad y transmite los datos. Puede estar horas o días en el aire sin aterrizar, pero no puede alejarse. Se usa como torre de vigilancia o como repetidor de radio.

## Nomenclatura y clasificación

- **US designation system** *(designaciones de EE. UU.)* — Las letras delante del número indican para qué sirve la aeronave. 
	- La **Q** indica que es un dron, sin tripulación. La letra que va justo antes de la Q indica su misión: 
		- **R** reconocimiento _(RQ-4 Global Hawk)_.
		- **M** multimisión: combina misiones de ISR y de ataque de precisión _(MQ-9 Reaper)_.
		- **F** caza: diseñado para el combate aire-aire, es decir, para derribar otras aeronaves. 
		- **C** carga: transporta suministros _(CQ-10 Snowgoose)_.
	- Una **Y** delante indica que es un prototipo.
	- Una **X** que es experimental. 
	- Una **Q** delante del todo no significa lo mismo: es un avión tripulado convertido en dron blanco para prácticas de tiro (_QF-16_, un F-16 sin piloto).
	- La letra del final es la versión _(MQ-9A, MQ-9B)_.

- **NATO UAS classes** *(clases de la OTAN)* — Clasificación de la OTAN por peso al despegue:
	- **Clase I** (menos de 150 kg). Se divide en micro (menos de 2 kg), mini (de 2 a 20 kg) y small (más de 20 kg).
	- **Clase II** (de 150 a 600 kg). Drones tácticos, que apoyan a una brigada.
	- **Clase III** (más de 600 kg). Los MALE, los HALE y los drones de combate.

- **DoD UAS groups** *(grupos del Departamento de Defensa de EE. UU.)* — Clasificación estadounidense por peso, altitud de vuelo y velocidad:
	- **Grupo 1**: hasta 9 kg, por debajo de unos 370 m sobre el suelo. Por ejemplo, el _RQ-11 Raven._
	- **Grupo 2**: de 9 a 25 kg, por debajo de unos 1.070 m. Por ejemplo, el _ScanEagle_.
	- **Grupo 3**: hasta 600 kg, por debajo de unos 5.500 m. Por ejemplo, el _RQ-7 Shadow_.
	- **Grupo 4**: más de 600 kg, por debajo de unos 5.500 m. Por ejemplo, el _MQ-1C Gray Eagle_.
	- **Grupo 5**: más de 600 kg, por encima de unos 5.500 m. Por ejemplo, el _MQ-9 Reaper_ y el _RQ-4 Global Hawk_.

- **Blue UAS list** *(lista Blue UAS)* — Lista del Departamento de Defensa de EE. UU. con los drones y piezas que sus unidades pueden comprar y usar porque no llevan componentes de países considerados adversarios, sobre todo China. El [Skydio X10D](/uas/skydio-x10d) está en ella.

## Categorías según altitud y autonomía

- **LALE** *(Low Altitude Long Endurance)* — Drones de **baja altitud** (en general por debajo de los 3.000 metros) que **vuelan muchas horas seguidas**, como el ScanEagle, que aguanta más de 18 horas en el aire. Se usan para patrullas cercanas, vigilancia de costas y apoyo a unidades pequeñas sin la logística que exige un MALE o un HALE.

- **MALE** *(Medium Altitude Long Endurance)* — Drones de **altitud media** (entre 3.000 y 9.000 metros) y **gran autonomía** (de 12 a más de 30 horas en vuelo). Su misión principal es vigilar zonas extensas durante mucho tiempo y, en los modelos armados como el MQ-9 Reaper, el Bayraktar TB2 o el [Wildfire](/uas/wildfire), atacar con precisión objetivos fijos o en movimiento.

- **HALE** *(High Altitude Long Endurance)* — Drones de **gran altitud**, por encima de los 9.000 metros y normalmente entre 15.000 y 20.000, más arriba que los aviones de línea, y de **autonomía muy larga** (más de 24 horas seguidas). El RQ-4 Global Hawk y el MQ-4C Triton son los más conocidos. Se dedican a la inteligencia, al reconocimiento de zonas muy amplias y a la interceptación de comunicaciones.

## Categorías según tamaño

- **Nano-UAS** *(nanodrón)* — Drones de unos pocos gramos, tan pequeños que caben en la palma de la mano, como el Black Hornet noruego, que pesa unos 30 gramos. Se usan para mirar detrás de una esquina o dentro de un edificio sin exponer a nadie.

- **Micro-UAS** *(microdrón)* — Drones de hasta unos 2 kg, el límite de la OTAN para esta categoría, que lleva un solo soldado en la mochila y despliega en minutos. Se usan para el reconocimiento cercano y el apoyo a pelotones y escuadras. El [Skydio X10D](/uas/skydio-x10d), con 2,11 kg, queda justo por encima del límite, aunque el fabricante y la prensa lo llaman microdrón.

## Drones de combate

- **UCAV** *(Unmanned Combat Aerial Vehicle)* — Dron de combate. Dron armado, pensado para atacar además de vigilar, como el MQ-9 Reaper o el Bayraktar TB2.

- **CCA** *(Collaborative Combat Aircraft)* — Programa de la Fuerza Aérea de EE. UU. de drones de combate que vuelan junto a los cazas tripulados y reciben órdenes de sus pilotos. Los primeros son el YFQ-42A de General Atomics y el YFQ-44A de Anduril.

- **Loyal wingman** *(punto leal)* — La idea general detrás del CCA: un dron que acompaña a un caza tripulado como si fuera su compañero de formación. Lleva armas, sensores o sirve de señuelo, y se puede perder sin perder un piloto. El MQ-28 Ghost Bat australiano es otro ejemplo.

- **Loitering munition** *(munición merodeadora)* — Dron de un solo uso que sirve a la vez para buscar y para atacar. Vuela sobre una zona durante un rato mientras manda vídeo al operador y, cuando este encuentra un objetivo, lo lanza contra él. Algunos modelos pueden reconocer el objetivo por su cuenta. El Switchblade estadounidense y el Lancet ruso son de este tipo.

- **One-way attack drone** *(dron de ataque de un solo uso, OWA)* — Dron de largo alcance que funciona como un misil de crucero barato. Se lanza hacia unas coordenadas fijas y programadas de antemano, y se guía por GPS y navegación inercial siguiendo una ruta de puntos de paso para esquivar las defensas. No necesita cámara ni enlace en tiempo real, aunque muchos modelos recientes los llevan. Se usa para destruir infraestructuras a cientos o miles de kilómetros. El [Shahed-136](/uas/shahed-136) iraní y el [MICH-2000](/uas/mich-2000) ucraniano son de este tipo.

- **Interceptor drone** *(dron interceptor)* — Dron que se lanza para derribar otros drones, chocando contra ellos o explotando a su lado. Es mucho más barato que un misil antiaéreo, y Ucrania lo usa como una de sus principales defensas contra los Shahed.

- **Cruise missile** *(misil de crucero)* — Misil con alas y motor propio que vuela como un avión, normalmente a baja altura y siguiendo el terreno, hasta su objetivo. El Tomahawk es el más conocido. El [Wildfire](/uas/wildfire) está pensado para llevar los JSM y los LRASM.

## Municiones y guiado

- **Semi-active laser** *(guiado láser semiactivo)* — Forma de guiar un misil o una bomba en la que alguien, sea el propio dron, otro avión o un soldado en tierra, apunta un láser al objetivo, y el arma sigue el reflejo de ese láser hasta él. Es muy precisa, pero hay que mantener el láser sobre el blanco hasta el impacto, y no atraviesa bien las nubes ni el humo. Así se guían el [Hellfire](/uas/armamento/agm-114-hellfire) y la [GBU-12](/uas/armamento/gbu-12-paveway-ii).

- **Fire and forget** *(dispara y olvida)* — Arma que, una vez lanzada, se guía sola hasta el blanco, sin que quien la disparó tenga que seguir apuntando, así que puede alejarse o atacar otro objetivo enseguida. El nombre del [Hellfire](/uas/armamento/agm-114-hellfire) viene de ahí, aunque de sus versiones solo lo es de verdad la de radar, el AGM-114L: las de láser necesitan que alguien siga iluminando el blanco.

- **Sea-skimming** *(vuelo rasante sobre el mar)* — Volar a muy pocos metros por encima de las olas. Los misiles antibuque lo hacen en el último tramo para que el radar del barco los detecte lo más tarde posible, cuando ya casi no queda tiempo para derribarlos. Lo hacen el [JSM](/uas/armamento/jsm) y el [LRASM](/uas/armamento/agm-158c-lrasm).

## Piezas y sistemas del propio dron

- **Payload** *(carga útil)* — Todo lo que lleva el dron para cumplir la misión y que no sirve para hacerlo volar: una cámara, un sensor térmico, un escáner LiDAR, munición. Quitarla o cambiarla no deja el dron inútil para volar, pero sí cambia su peso y su centro de gravedad, y si el peso está mal repartido se puede caer.

- **OEW** *(Operating Empty Weight)* — Peso en vacío operativo. Lo que pesa el dron listo para volar (estructura, motores, electrónica y, si es eléctrico, la batería), pero **sin la carga útil** y, si va con motor de combustión, sin el combustible.

- **MTOW** *(Maximum Takeoff Weight)* — Peso máximo al despegue. Es el peso total máximo con el que el dron puede despegar con seguridad. Incluye todo: la estructura, las baterías o el combustible, los sensores y la carga que lleve a bordo. Por encima de ese límite ya no se garantiza que vuele con seguridad. La diferencia entre el MTOW y el OEW es lo que el dron puede cargar (*payload capacity*):
	```
	Dron eléctrico:          MTOW − OEW = carga útil máxima
	Dron con combustible:    MTOW − OEW = carga útil + combustible
	```
	Por eso, en los drones de combustible, cuanto más carga llevan, menos combustible pueden cargar y menos alcance tienen.

- **Warhead** *(cabeza de combate)* — La carga explosiva de un misil o de un dron de un solo uso.

- **Data-link** *(enlace de datos)* — Canal de radio entre el dron y el operador. Puede ser **analógico** (muy poco retraso, habitual en los FPV), **digital** (vídeo de más calidad y cifrado) o **por satélite** (SATCOM o Starlink), que no depende del horizonte ni del terreno, aunque también se puede interferir.

- **GCS** *(Ground Control Station)* — Estación de control en tierra. El puesto (pantallas, mandos, antenas y software de mapas) desde el que el piloto o el equipo vigila el dron, lo pilota o le programa la ruta.

- **SATCOM** *(Satellite Communications)* — Comunicaciones por satélite. Permiten controlar un dron al otro lado del mundo. En el MQ-9 Reaper, la antena va en la joroba del morro. El [Wildfire](/uas/wildfire) no la tiene porque se controlará a través de constelaciones en órbita baja como Starlink.

- **Starlink** — Red de internet por satélite de SpaceX, formada por miles de satélites en órbita baja, a unos 550 km de altura. Al estar mucho más cerca que los satélites de comunicaciones clásicos (a 36.000 km), la señal llega con poco retraso y basta una antena pequeña y barata, del tamaño de una caja de pizza. Desde 2022, Ucrania la usa para las comunicaciones del frente y para controlar drones más allá del horizonte, como algunas versiones del [MICH-2000](/uas/mich-2000). SpaceX tiene una versión militar, Starshield (ver abajo).

- **Starshield** — La versión de Starlink que SpaceX ofrece al Gobierno de EE. UU., sobre todo al Pentágono y a los servicios de inteligencia. Usa la misma tecnología, pero con un cifrado más fuerte, y sus satélites pueden llevar equipos del Gobierno, como sensores para observar la Tierra. La Fuerza Espacial la usa para dar comunicaciones a sus unidades, y la NRO, la agencia de satélites espía de EE. UU., le ha encargado una red de satélites de reconocimiento.

- **EO/IR** *(Electro-Optical / Infrared)* — Módulo que junta dos cámaras: una de luz visible para el día (**EO**) y otra térmica, que detecta el calor, para la noche (**IR**).

- **FLIR** *(Forward Looking Infrared)* — Cámara térmica que mira hacia delante. En lugar de captar la luz visible, como el ojo o una cámara normal, detecta la **radiación infrarroja (el calor)** que emiten los objetos y las personas. Suele mostrar la imagen en escala de grises, con lo caliente en blanco (*white hot*) o en negro (*black hot*).

- **LiDAR** *(Light Detection and Ranging)* — Sensor que mide distancias con láser. Lanza cientos de miles de pulsos por segundo contra el suelo o una estructura y mide lo que tarda cada uno en volver. Con eso calcula distancias exactas y crea un modelo en 3D muy preciso del terreno.

## Aerodinámica

- **Flying wing** *(ala volante)* — Diseño sin fuselaje ni cola separados: todo el avión es una sola ala. Es muy eficiente y devuelve menos eco al radar (ver RCS).

- **Canard** — Pequeño plano con forma de ala situado en la parte delantera del fuselaje, por delante del ala principal. Ayuda a controlar el cabeceo y mejora la maniobrabilidad.

- **Pusher configuration** *(hélice propulsora)* — El motor y la hélice van en la **parte trasera** y empujan la aeronave hacia delante. Así el morro queda libre para las cámaras y los sensores. Es lo que llevan el MQ-9 Reaper, el [Wildfire](/uas/wildfire) y el [MICH-2000](/uas/mich-2000).

- **Tractor configuration** *(hélice tractora)* — El motor y la hélice van en la **parte delantera** y tiran de la aeronave hacia delante, como en la mayoría de las avionetas.

## Despegue

- **RATO** *(Rocket-Assisted Take-Off)* — Despegue con cohete. Un pequeño cohete acoplado al dron le da el impulso inicial para despegar sin pista, desde una rampa, y se suelta al agotarse. El [MICH-2000](/uas/mich-2000) despega así.

- **Catapult launch** *(lanzamiento con catapulta)* — El dron sale disparado desde un raíl con una catapulta neumática, hidráulica o de gomas. Es habitual en drones tácticos que no tienen pista.

- **VTOL** *(Vertical Take-Off and Landing)* — Despegue y aterrizaje en vertical, sin pista. Lo hacen los multicópteros como el [Skydio X10D](/uas/skydio-x10d) y los drones híbridos de ala fija con rotores para despegar.

## Vuelo y navegación

- **FPV** *(First Person View)* — Vuelo en primera persona. El piloto lleva unas gafas en las que ve en directo lo que ve la cámara del dron, y lo pilota como si fuera a bordo. Los FPV pequeños cargados con explosivo son hoy el arma más habitual del frente en Ucrania. Algunos se guían por un cable de fibra óptica que la guerra electrónica no puede interferir.

- **LOS** *(Line of Sight)* — Enlace en visión directa: la antena y el dron se «ven» sin nada en medio. Su alcance lo limitan el horizonte y el terreno.

- **BLOS** *(Beyond Line of Sight)* — Enlace más allá del horizonte, a través de satélites o de repetidores. Es lo que permite controlar un MALE desde otro continente.

- **BVLOS** *(Beyond Visual Line of Sight)* — Vuelo fuera del alcance de la vista del operador.

- **GNSS** *(Global Navigation Satellite System)* — Nombre general de los sistemas de navegación por satélite. GPS (EE. UU), GLONASS (Rusia), Galileo (Unión Europea) y BeiDou (China).

- **INS** *(Inertial Navigation System)* — Navegación inercial. Unos acelerómetros y giróscopos miden cada movimiento del dron y calculan su posición a partir de la última conocida. No se puede interferir, pero acumula error con el tiempo, por lo que suele combinarse con el GNSS.

- **Waypoint** *(punto de paso)* — Cada una de las coordenadas por las que se programa que pase un dron. Unidas forman su ruta. Los drones de ataque de un solo uso vuelan así, cambiando de rumbo en cada punto para esquivar las defensas.

- **RTH** *(Return to Home)* — Vuelta a casa. Función que manda al dron volver solo a las coordenadas desde las que despegó (el punto «home»).
	- **RTL** *(Return to Launch)* — Lo mismo que el RTH con el nombre que usan los programas de control de vuelo de código abierto, como ArduPilot o PX4.
	- **Fail-safe** — Vuelta automática de emergencia. Se activa sola cuando el dron detecta la batería muy baja, pierde el enlace de radio (*signal loss*) o sufre interferencias de guerra electrónica.

- **Drone swarm** *(enjambre de drones)* — Grupo de drones que vuelan coordinados y se reparten la misión. Si cae uno, el resto se reorganiza. Pueden coordinarse mediante software autónomo o con varios operadores. General Atomics dice que el [Wildfire](/uas/wildfire) podrá volar en grupos de decenas.

- **Human-in-the-loop** *(con una persona en el bucle)* — Una persona decide y autoriza cada ataque. Hay otros dos grados de autonomía:
	- **Human-on-the-loop** — El sistema actúa solo y una persona lo supervisa y puede pararlo.
	- **Human-out-of-the-loop** — El sistema elige y ataca el objetivo sin que intervenga nadie.

## Guerra electrónica y contramedidas

- **EW** *(Electronic Warfare)* — Guerra electrónica. Uso del espectro electromagnético para atacar, defenderse o espiar. Tiene tres ramas: el **ataque electrónico** (interferir o engañar los sistemas del enemigo), la **protección electrónica** (resistir esos ataques, por ejemplo con radios que cambian de frecuencia) y el **apoyo electrónico** (escuchar y localizar las emisiones del enemigo).

- **Jamming** *(interferencia)* — Ataque electrónico que emite ruido de radio a mucha potencia para tapar las frecuencias que usa el dron, tanto las del GNSS como las del enlace con el operador. El dron pierde el control y cae, se queda quieto en el sitio o activa el RTH.

- **Spoofing** *(engaño o suplantación)* — Ataque electrónico que emite señales de GNSS falsas con más potencia que las reales. En lugar de dejar al dron a ciegas, como el jamming, engaña al piloto automático y le hace creer que está en otro sitio o a otra altura.

- **GPS-denied** *(sin GPS)* — Entorno en el que no hay señal de navegación por satélite, porque la interfieren o porque no llega. Para volar así, los drones usan la navegación inercial (INS), sensores de flujo óptico o navegación visual (VBN, *Vision-Based Navigation*), que calcula la posición comparando lo que ven sus cámaras con el terreno. El [Skydio X10D](/uas/skydio-x10d) puede volar así, incluso de noche.

- **RCS** *(Radar Cross Section)* — Sección radar equivalente. Lo grande que «se ve» un objeto en el radar, medido en metros cuadrados. Depende más de la forma y los materiales que del tamaño real, así que un avión grande con buena forma puede verse como un pájaro.

- **C-UAS** *(Counter-UAS)* — Sistemas antidrón. Conjunto de radares, sensores y armas para detectar, seguir, identificar y neutralizar drones enemigos. Hay dos familias:
	- **Soft-kill** *(sin destruir el dron)* — Inhibidores de radio (*jammers*), *spoofing* o toma del control del enlace de mando.
	- **Hard-kill** *(destrucción física)* — Cañones y misiles antiaéreos, láseres de alta energía, microondas de alta potencia (HPM), drones interceptores o redes lanzadas desde otros drones.

- **MANPADS** *(Man-Portable Air-Defense System)* — Misil antiaéreo portátil. Lo dispara un solo soldado desde el hombro y casi siempre se guía por el calor del motor del objetivo, como el Stinger estadounidense o el Igla ruso. Es una amenaza para los helicópteros y los drones que vuelan bajo.

## Misiones

- **ISR** *(Intelligence, Surveillance, Reconnaissance)* — Inteligencia, vigilancia y reconocimiento. Misión que junta la recogida de información (inteligencia), la observación prolongada de una zona (vigilancia) y la exploración puntual de las posiciones enemigas (reconocimiento). Es la misión típica de los MALE y los HALE.

- **SIGINT** *(Signals Intelligence)* — Inteligencia de señales. Interceptar y analizar las emisiones electromagnéticas del enemigo. Se divide en:
	- **COMINT** *(Communications Intelligence)* — Las comunicaciones: radios, teléfonos y enlaces de datos.
	- **ELINT** *(Electronic Intelligence)* — Las señales que no son comunicaciones, sobre todo las de radar: dónde están, de qué tipo son y cómo funcionan.

- **SEAD** *(Suppression of Enemy Air Defenses)* — Supresión de defensas aéreas enemigas. Misiones para neutralizar o dejar ciegos los radares y los sistemas antiaéreos enemigos y abrir un pasillo seguro a los aviones propios. Basta con que las defensas no funcionen mientras dura la misión.

- **DEAD** *(Destruction of Enemy Air Defenses)* — Destrucción de defensas aéreas enemigas. Como la SEAD, pero el objetivo es destruirlas para siempre.

- **Deep strike** *(ataque en profundidad)* — Ataque contra objetivos muy por detrás del frente, dentro del territorio enemigo, como refinerías, aeródromos, fábricas o depósitos. En los últimos meses, Ucrania ha lanzado muchos ataques de este tipo contra refinerías y terminales petroleras rusas, como el de la [refinería de Kapotnya](https://kyivindependent.com/russia-says-dozens-of-ukrainian-drones-targeted-moscow-as-broader-attack-hit-multiple-regions/), en Moscú, con drones como el [MICH-2000](/uas/mich-2000).

- **Kill chain** *(cadena de ataque)* — Los pasos que van desde encontrar un objetivo hasta destruirlo: localizarlo, fijar su posición, seguirlo, decidir el ataque, atacarlo y evaluar el resultado. Un solo dron puede encargarse de varios de esos pasos, y eso acorta la cadena.

- **BDA** *(Battle Damage Assessment)* — Evaluación de daños en combate. Consiste en comprobar, después de un ataque, si el objetivo ha quedado destruido, dañado o intacto, para decidir si hay que atacarlo otra vez. Es uno de los trabajos más habituales de los drones de vigilancia, que graban el antes y el después.

## Rendimiento y unidades

- **Combat radius** *(radio de combate)* — La distancia máxima a la que un dron o un avión puede ir desde su base, cumplir la misión y volver. El concurso al que se presenta el [Wildfire](/uas/wildfire) pide 2.300 millas náuticas (4.260 km).

- **Ferry range** *(alcance de traslado)* — La distancia máxima que puede volar en un **solo sentido**, normalmente sin armas, con depósitos de combustible extra y a la velocidad más económica, para trasladarse de una base a otra.

- **Ceiling** *(techo de vuelo)* — La altitud máxima a la que puede volar la aeronave. El **techo de servicio**, que es el que suele dar el fabricante, es la altitud en la que ya solo puede subir a 0,5 m/s (100 pies por minuto).

- **Endurance** *(autonomía)* — El tiempo que el dron puede mantenerse en el aire con una carga de batería o un depósito de combustible, sin importar la distancia que recorra.

- **Knot** *(nudo)* — Unidad de velocidad de la aviación y la navegación: una milla náutica por hora, es decir, 1,852 km/h. Por ejemplo, 200 nudos son unos 370 km/h.

- **Nautical mile** *(milla náutica)* — Unidad de distancia de la aviación y la navegación: 1.852 metros. No es la milla terrestre (1.609 metros).
