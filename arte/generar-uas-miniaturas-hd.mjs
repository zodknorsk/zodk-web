// Miniaturas en pixel HD de los drones con HD (`hd: true` en la maqueta;
// docs/uas-hd.md), pintadas en un Chrome sin ventana con el motor del modo
// Pixel del visor (src/scripts/uas-miniatura-hd.ts). El 2.0 sustituye al 1.0
// en todas partes: arte/generar-uas-miniaturas.mjs se salta estos drones.
//
// Escribe en public/uas/<modelo>/, con los mismos nombres y medidas que las 1.0:
//   tarjeta.png, tarjeta-noche.png   tarjeta de /uas: 256x144, a 1 px por
//                                    píxel como el visor, casi de perfil
//   planta.png                       tira de la portada, desde arriba, a
//                                    escala entre drones y con sombra
// Uso (desde la raíz del repo, con `npm run dev` en marcha):
//   node arte/generar-uas-miniaturas-hd.mjs <modelo…>
// Pruebas de ángulo: --vista=ACIMUT,ELEVACIÓN --nombre=tarjeta-x escribe solo
// esa tarjeta (tarjeta-x.png y tarjeta-x-noche.png), sin la planta.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const WEB = process.env.WEB ?? "http://localhost:4321";
const W = 256, H = 144;
const op = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
// La tarjeta, casi de perfil y un poco desde arriba y por delante (79°, 11°):
// el ángulo que eligió el usuario el 1-oct-2026 con una captura del visor.
// Desde la vista 3D del visor (38°, 32°) el ala, entera, dejaba el cuerpo
// pequeño y el dron se leía como una X de palos.
// Un dron puede llevar su propio ángulo (`vistaTarjeta` en la maqueta; el
// TB2, 61°, 20°); --vista manda sobre los dos.
const VISTA_3D = op.vista ? op.vista.split(",").map(Number) : [79, 11];
const NOMBRE = op.nombre ?? "tarjeta";
// La planta, como las 1.0 (arte/generar-uas-miniaturas.mjs).
const PX_POR_METRO = 26, SOMBRA = [3, 3], PLANTA_MAX = [72, 70], ARRIBA = [180, 89.9];
const modelos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!modelos.length) { console.error("Uso: node arte/generar-uas-miniaturas-hd.mjs <modelo…>"); process.exit(1); }


const CHROME = process.env.CHROME ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "miniaturas-hd-"));
const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${puerto}`, `--user-data-dir=${dir}`,
  "--use-angle=metal", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let lista = [];
for (let i = 0; i < 50 && !lista.length; i++) {
  try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); } catch { /* aún arrancando */ }
  await espera(200);
}
const ws = new WebSocket(lista.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pendientes = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
});
const orden = (method, params = {}) => new Promise((r) => { const i = ++id; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

try {
  // Cualquier página del servidor de desarrollo sirve: Vite resuelve los
  // módulos de src/ al importarlos.
  await orden("Page.navigate", { url: `${WEB}/uas` });
  await espera(3000);
  for (const modelo of modelos) {
    const r = await orden("Runtime.evaluate", {
      expression: `(async () => {
        const { tarjetaHD } = await import("/src/scripts/uas-miniatura-hd.ts");
        const { default: maqueta } = await import("/src/data/uas/${modelo}.ts");
        if (!maqueta.hd) throw new Error("${modelo} no tiene HD");
        const vista = ${op.vista ? "null" : "maqueta.vistaTarjeta"} ?? ${JSON.stringify(VISTA_3D)};
        return JSON.stringify(tarjetaHD(maqueta, vista, ${W}, ${H}));
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(`${modelo}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    const tarjeta = JSON.parse(r.result.value);
    const destino = path.join(REPO, "public/uas", modelo);
    for (const momento of ["dia", "noche"])
      await sharp(Buffer.from(tarjeta[momento].split(",")[1], "base64")).png({ compressionLevel: 9 })
        .toFile(path.join(destino, `${NOMBRE}${momento === "dia" ? "" : "-noche"}.png`));
    if (op.nombre) { console.log(`${modelo}: ${NOMBRE} desde ${VISTA_3D}`); continue; }
    // El giro de la 1.0 ya no se usa: el 2.0 lo sustituye.
    for (const f of ["giro-planta.png", "giro-planta-noche.png"]) fs.rmSync(path.join(destino, f), { force: true });
    // La planta, con la sombra desplazada abajo a la derecha.
    const rp = await orden("Runtime.evaluate", {
      expression: `(async () => {
        const { plantaHD } = await import("/src/scripts/uas-miniatura-hd.ts");
        const { default: maqueta } = await import("/src/data/uas/${modelo}.ts");
        return JSON.stringify(plantaHD(maqueta, ${JSON.stringify(ARRIBA)}, ${PX_POR_METRO}, ${PLANTA_MAX[0] - SOMBRA[0]}, ${PLANTA_MAX[1] - SOMBRA[1]}));
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (rp.exceptionDetails) throw new Error(`${modelo}: ${rp.exceptionDetails.exception?.description ?? rp.exceptionDetails.text}`);
    const planta = JSON.parse(rp.result.value);
    const { data: dron } = await sharp(Buffer.from(planta.png.split(",")[1], "base64")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const ancho = planta.ancho + SOMBRA[0], alto = planta.alto + SOMBRA[1];
    const img = new Uint8Array(ancho * alto * 4);
    for (let y = 0; y < alto; y++)
      for (let x = 0; x < ancho; x++) {
        const k = (y * ancho + x) * 4;
        const en = (xx, yy) => xx >= 0 && yy >= 0 && xx < planta.ancho && yy < planta.alto && dron[(yy * planta.ancho + xx) * 4 + 3] > 127;
        if (en(x, y)) img.set(dron.subarray((y * planta.ancho + x) * 4, (y * planta.ancho + x) * 4 + 4), k);
        else if (en(x - SOMBRA[0], y - SOMBRA[1])) img.set([0, 0, 0, 110], k);
      }
    await sharp(Buffer.from(img), { raw: { width: ancho, height: alto, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(destino, "planta.png"));
    console.log(`${modelo}: en pixel HD, tarjeta de ${W}x${H} (día y noche) y planta de ${ancho}x${alto}`);
  }
} finally {
  ws.close();
  chrome.kill();
  await espera(300);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* Chrome aún suelta archivos */ }
}
