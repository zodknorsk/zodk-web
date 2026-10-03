# Pendiente en el PC con Linux Mint

Cosas que hacer en `~/Documentos/zodk-web` la próxima vez que se use el PC.

## Volver a clonar el repositorio

El 26-sep-2026 se reescribió el historial de Git para quitar versiones viejas
de imágenes y teselas (el `.git` bajó de 651 MB a 334 MB) y se subió con push
forzado. La copia del PC tiene la historia antigua: **no hacer `git pull`**,
que mezclaría las dos historias.

1. Si hay cambios sin subir en el PC, copiarlos aparte (no hacer push).
2. Guardar las fuentes de datos que no están en Git. Según si ya se hizo la
   reorganización, estarán en `arte/` o en `logo-files/`:
   `cities15000.txt`, `etopo.tiff`, `ne_land.json`, `luna-fuentes/`,
   `marte-fuentes/`, `tierra-fuentes/`.

   ```
   mkdir -p ~/zodk-fuentes
   cd ~/Documentos/zodk-web
   mv arte/{luna-fuentes,marte-fuentes,tierra-fuentes,ne_land.json,cities15000.txt,etopo.tiff} ~/zodk-fuentes/ 2>/dev/null
   mv logo-files/{luna-fuentes,marte-fuentes,tierra-fuentes,ne_land.json,cities15000.txt,etopo.tiff} ~/zodk-fuentes/ 2>/dev/null
   ```

3. Borrar la carpeta vieja y clonar de nuevo:

   ```
   cd ~/Documentos
   rm -rf zodk-web
   git clone https://github.com/zodknorsk/zodk-web.git
   cd zodk-web
   npm install
   ```

4. Devolver las fuentes a su sitio: `mv ~/zodk-fuentes/* arte/`
