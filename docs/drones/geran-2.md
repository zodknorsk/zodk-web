# Geran-2 — diario

## Dónde estamos: cerrado

- **Fase 1 (la nota)**: rehecha y publicada antes de este diario (commits `395eac0` y `c826ded` de la bóveda).
- **Fase 2 (fuentes)**: las de la 1.0, en `arte/uas-fuentes/geran-2/` (`FUENTES.md`) y sus miniaturas en `public/uas/geran-2/fuentes/`. La forma sale de las del Shahed-136.
- **Fases 3 y 4 (maqueta HD y pixel HD) hechas** el 11-10-2026 en `main`, sin commitear, a falta de que las vea el usuario: `src/data/uas/geran-2.ts` con `hd: true`; tarjeta y planta nuevas, y fuera `giro-planta*.png` de la 1.0.
- **Revisión del usuario, primera vuelta** (11-10-2026): corregidos los tres fallos (CRPA flotando, juntas y tornillos sin verse, hélice negra); tarjeta y planta regeneradas.
- **Fase 5 hecha** el 11-10-2026: `lint` y `astro check` sin errores; visor en todas las vistas, Maqueta y Pixel, de día y de noche; partes, fuentes y tarjeta en `/uas`.
- **Cerrado** el 11-10-2026: el usuario pidió commit y push (en `main`, publica). Sin nave del hero (no la pidió).

## Decisiones del usuario

- 10-10-2026: el Geran-2 se pasa al HD partiendo del Shahed 2.0 («poco debería cambiar»: color y algún detalle en Partes).
- 11-10-2026: **hélice negra** (revisión).
- 11-10-2026: marcas en **elevones y winglets**; **sin catapulta** (la del Shahed es el lanzador iraní de Qom); **negro satinado** (el `negro` del HD: en las fotos el ala refleja el cielo, #50585F de media al sol en Sumy).

## Registro

- 11-10-2026: las piezas siguen saliendo de `shahed.piezas`: ahora solo el `crema-ir` pasa a `negro` (antes todo menos el metal, y los elevones en `mando`, gris claro, aunque en las fotos son negros). Se quedan el aluminio del motor, el latón de la corona y la hélice blanca del Shahed (no hay foto del Geran que la enseñe; sin comprobar).
- Partes: cuatro apuntaban a piezas que ya no existían tras rehacer el Shahed (`varilla-0.7`, `varilla-0.82`, `cilindro--1.35`, `cilindro--1.48`): ahora Elevones y Motor y hélice toman las piezas de las partes del Shahed (`piezasDe`).
- **La CRPA estaba en el ala izquierda** (+x). La derecha es −x (los puntos de la CRPA del Shahed, del plano, están ahí): panel, elementos y chincheta pasados a −x.
- Calcas: del Shahed, los tornillos del morro y los agujeros de debajo; fuera banderas, QR y los puntos de la CRPA (aquí es el panel). Nuevas: «НЕ БРАТЬСЯ» amarillo (#e3c13f) en los cuatro elevones junto al borde de salida, leído desde detrás (`giro: 180`; sin él salía al revés en Planta), y «ГЕРАНЬ-2» blanco en la cara de fuera de cada winglet, arriba (Kiev, 2022). Costuras: las del Shahed.
- Pixel: el negro al sol cae entre 2,9 y 3,2 escalones en la planta (el ala salía a franjas) y en 1,7 en la vista 3D: `desfaseLuz: -0.4` (2,5–2,8 y 1,2–1,4). Tarjeta desde [65, 30], como la del Shahed.
- 11-10-2026, revisión: (1) **la CRPA flotaba**: plana a 7 cm del eje, con el ala del Shahed 2.0 (más fina que la de la 1.0) a 4,9 cm delante y 3,8 detrás, medido con un rayo: 1,5–2,6 cm de hueco. Ahora `y: 0.047` e inclinada −4° sobre x (los elementos, igual): la base queda 0,4–3 mm dentro del ala en las cuatro esquinas. (2) **Juntas y tornillos sin verse**: el gris de las costuras del Shahed se perdía en el negro: costuras con `claro: true` (como el MICH) y tornillos del morro #9a9da2. (3) Hélice en `negro`.
- 11-10-2026, revisión, segunda vuelta: tornillos de las juntas más suaves y juntas algo más marcadas. Campo nuevo `detalles.opacidad` (`tipos.ts`, `uas-hd.ts`; también pasa a las miniaturas): el Geran, juntas 0,32 (antes 0,22) y tornillos 0,55 (antes 0,8; con 0,45 casi no se veían). Los demás drones no cambian.
- 11-10-2026, comprobaciones: en Pixel las sombras salían azul marino (HD (0, 1, 2) → pixel (18, 33, 71)): el motor sube cada escalón al centro de su luminosidad, también el más oscuro, y el punto azul del cielo se multiplicaba (el desfase −0,4 lo empeoraba). Campo nuevo `sombraNegra` (`tipos.ts`, `uas-pixelado.ts`, visor y miniaturas): en el escalón más oscuro el color no se aclara. Solo el Geran; los demás no cambian.
