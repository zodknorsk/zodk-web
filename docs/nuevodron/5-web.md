# Fase 5. En la web

Parte de `docs/nuevodron.md`, que se lee antes. Lo que pase con el dron, en su diario.

1. **Importar** (en `main`): `npm run importar`. Solo escribe lo que cambia
   y dice qué notas son nuevas. Los tuits salen de `src/data/tuits/`: no
   borrar esa carpeta.
2. **Reiniciar `npm run dev`** (no ve las notas nuevas). Si el visor no
   carga con «Outdated Optimize Dep» en la consola: parar, `rm -rf
   node_modules/.vite` y arrancar. Recargar forzando (Cmd+Mayús+R).
3. **Miniaturas** del dron (fase 4) y de las fuentes (fase 3, apartado 7),
   si no están.
4. **Probar** en `/uas/<slug>`. Atajos en la URL: `?vista=arriba|lado|frente|detras`,
   `?parte=C`, `?pestana=fuentes`, `?estilo=pixel`, `?catapulta=1`.
   Mirar: la ficha entera (nota, tabla con las banderas, términos y
   municiones enlazados), el visor en todas las vistas, en Maqueta y en
   Pixel, de día y de noche, las partes y las fuentes; la tarjeta en `/uas`
   y su filtro de país.
5. `npm run lint` y `npx astro check` sin errores nuevos. Ojo con los
   genéricos en los `<script>` de los `.astro` (en una línea).
6. **Capturas**: `node arte/capturas.mjs URL salida.png [--ir=SELECTOR]
   [--raton=SELECTOR] [--noche] [--js=CÓDIGO] [--tam=1300x900]
   [--escala=2]`. Con `--js` se pueden mandar teclas al lienzo (flechas
   giran 10°, `+` acerca):
   `--js="(()=>{const c=document.querySelector('.visor canvas');for(const k of ['ArrowUp','+','+'])c.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}))})()"`.
   La tarjeta con el ratón: `--ir=.uas-tarjetas --raton=.uas-tarjeta`.
   Recortar con ffmpeg (`crop=`) y poner al lado de la foto (`hstack`).
   Si se lanzan muchos Chrome a la vez, alguno sale sin WebGL.
7. Si se tocó el motor del visor: **consumo en Zen** (`docs/rendimiento.md`).
