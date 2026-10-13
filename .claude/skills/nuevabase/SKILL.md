---
name: nuevabase
description: Crear la tarjeta de una base militar nueva para hegoimarquez.com (datos en src/data/bases.json y el mapa en pixel art con sus cuatro vistas para elegir). El usuario dice tras el comando qué base.
---

# /nuevabase

1. Lee entero `docs/nuevabase.md`. Sigue su «Receta» **en orden**, sin
   saltarte pasos.
2. El nombre que da el usuario puede venir mal escrito o al revés («AFB
   Edwards»): la clave de `bases.json` es el **nombre oficial con su sigla
   en su orden** («Edwards AFB», «NAS Sigonella»). Si no está claro qué base
   es, pregunta antes de bajar nada.
3. **Para en el paso 4**: enséñale la captura de las cuatro vistas (10, 18,
   40 y 90 km) y espera a que elija y diga si cambiar algo. Solo entonces
   el paso 5 (`--elegir`, que borra las fuentes).
4. Commit y push solo cuando los pida (y por separado).
5. **No cambies `docs/nuevabase.md`** salvo que el usuario lo marque. Si
   aprendes algo que debería entrar, propónlo en el chat al final.

Argumentos del usuario: $ARGUMENTS
