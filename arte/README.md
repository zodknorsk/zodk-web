# arte/

Los scripts que generan el pixel art y los datos de la web. Nada de esta
carpeta se publica: lo que usa la web lo escriben en `public/`. Se lanzan
desde aquí (`cd arte`), salvo los `.mjs`, que se lanzan desde la raíz del
repo (`node arte/…`).

Python 3 estándar, salvo `generar-astros.py` y `generar-naves-noche.py`, que
necesitan Pillow. Los `.mjs` necesitan Node y Chrome (lo buscan solo; si no,
la variable `CHROME`, y opciones de más en `CHROME_ARGS`).

## La Tierra (portada)

| Archivo | Qué hace | Escribe |
|---|---|---|
| `generar-tierra.py` | Los datos del motor de la Tierra: materiales, biomas, relieve, nieve, banquisa, nubes, banderas, luces, LUT de día y de noche; con `--nivel 2`, las teselas del zoom | `public/planeta/` |
| `rasterizar.py` | Costas de Natural Earth a una rejilla tierra/mar/hielo (con `--nivel 2`, la fina) | `mapa_tierra.py`, `tierra-fuentes/mascara-n2.bin` |
| `mapa_tierra.py` | La rejilla ya hecha (no editar a mano) | — |
| `elevacion.py` | Relieve ETOPO1 a 0,25° | `elev.py` (no editar a mano) |
| `elevacion-fina.py` | Relieve ETOPO1 a 24 px/grado, para el zoom | `tierra-fuentes/etopo24.i16` |
| `generar-nombres-tierra.py` | Nombres de continentes, mares, regiones, estrechos y picos | `public/planeta/tierra-nombres.json` |
| `generar-tierra-quieto.mjs` | La Tierra quieta, pintada por el propio motor | `public/planeta/tierra-quieto*.png` |
| `generar-tierra-icono.mjs` | La Tierra pequeña de `/marte`, de día y de noche | `public/zodk-tierra*.png` |

## La Luna

| Archivo | Qué hace | Escribe |
|---|---|---|
| `generar-luna.py` | Las dos caras, los datos del motor (`--canvas`) y las teselas (`--teselas`) | `public/luna/` (pruebas en `pruebas/luna/`) |
| `generar-orion.py` | La Orion en 32 fotogramas; con `--css`, la animación de su sombra | `public/luna/zodk-orion-giro*.png` |
| `generar-queqiao.py` | Los relés Queqiao y Queqiao-2 | `public/luna/zodk-sat-queqiao*-noche.svg` |

## Marte

| Archivo | Qué hace | Escribe |
|---|---|---|
| `generar-marte.py` | Datos del motor y teselas (`--canvas`), el Marte pequeño (`--icono`) | `public/marte/`, `public/zodk-marte.png` (pruebas en `pruebas/marte/`) |
| `generar-marte-quieto.mjs` | La vista inicial pintada por el motor | `public/marte/marte-quieto.png` |
| `generar-nombres.py` | Nombres de lugares de Marte (con `--luna`, de la Luna) | `public/marte/marte-nombres.json`, `public/luna/luna-nombres.json` |

## El resto

| Archivo | Qué hace | Escribe |
|---|---|---|
| `generar-astros.py` | El sol y la tira de 30 fases de la luna del cielo de la portada | `public/zodk-sol.png`, `public/zodk-luna-fases.png` |
| `generar-estrellas.py` | Las baldosas de estrellas del fondo | `zodk-estrellas.png` y `zodk-estrellas-noche.png` (aquí; se copian a `public/`) |
| `generar-aeronaves.py` | El Sentinel-2, la única nave en pixel art (las demás son fotos) | `public/zodk-sat-sentinel*.svg` |
| `generar-naves-noche.py` | La versión de noche de las fotos de las naves | `public/zodk-<nave>-noche.png` |
| `generar-logo.py` | El logo animado de la cabecera (ver `docs/logo.md`) | `zodk-logo-animado.svg` (aquí) |
| `fotos-del-motor.mjs` | Ayuda de los `.mjs`: abre un motor en un Chrome sin ventana y guarda sus fotos | — |
| `png8.py` | Escritor mínimo de PNG | — |

Otros archivos:

- `favicon*.png`, `favicon.ico`, `apple-touch-icon.png`, `zodk-favicon.svg`:
  originales de los iconos de `public/` (ver `docs/logo.md`).
- `zodk-dron-fuente.svg`, `zodk-e2-hawkeye-fuente.svg`: los dibujos en pixel
  art del dron y del E-2 de antes de pasar a fotos. No los usa nada.
- `bancos/`: páginas de prueba de los motores (ver `docs/astros.md`).

## Fuentes de datos (fuera de Git)

Pesan mucho y no van en Git (`.gitignore`): `tierra-fuentes/`,
`luna-fuentes/`, `marte-fuentes/`, `ne_land.json`, `cities15000.txt` y
`etopo.tiff`. Cómo bajar cada una está en el docstring del script que la usa.
En un ordenador nuevo solo hacen falta para regenerar; la web funciona sin
ellas.

`pruebas/` (también fuera de Git) es donde los generadores dejan los renders
para comparar variantes.
