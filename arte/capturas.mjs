// Capturas de la web en un Chrome sin ventana, para enseñarle al usuario cómo
// queda algo (sobre todo lo de /uas y la portada). Más cómodas que
// `--screenshot` a secas: bajan hasta un elemento, pueden pasar el ratón por
// encima de otro, poner el modo noche y ejecutar algo antes de capturar.
//
// Uso (desde la raíz del repo, con `npm run dev` en marcha):
//   node arte/capturas.mjs URL salida.png [opciones]
// Opciones:
//   --ir=SELECTOR       baja hasta ese elemento (centrado) antes de capturar
//   --raton=SELECTOR    pasa el ratón por el centro de ese elemento
//   --noche             modo noche (la web lo guarda en sessionStorage)
//   --js=CÓDIGO         ejecuta ese JavaScript en la página antes de capturar
//   --tam=ANCHOxALTO    tamaño de la ventana (1300x900 por defecto)
//   --escala=2          píxeles por punto (2 = pantalla retina; 1 por defecto)
//   --espera=MS         lo que espera tras cargar (3500 por defecto; la
//                       entrada de la portada tarda más en sacar la nave)
// Ejemplo: la tira del hangar con la puerta abierta, de noche:
//   node arte/capturas.mjs http://localhost:4321/ hangar.png --ir=.tira-sat --raton=.sat-hangar --noche
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [url, salida, ...resto] = process.argv.slice(2);
if (!url || !salida) { console.error("Uso: node arte/capturas.mjs URL salida.png [--ir=… --raton=… --noche --js=… --tam=1300x900]"); process.exit(1); }
const op = Object.fromEntries(resto.map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || true]; }));
const [ancho, alto] = String(op.tam ?? "1300x900").split("x");
const CHROME = process.env.CHROME ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capturas-"));
const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${puerto}`, `--user-data-dir=${dir}`,
  `--window-size=${ancho},${alto}`, `--force-device-scale-factor=${op.escala ?? 1}`, "--hide-scrollbars", "--use-angle=metal", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// Protocolo de depuración de Chrome, lo justo: una pestaña, órdenes y respuestas.
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
const evaluar = (expression) => orden("Runtime.evaluate", { expression, returnByValue: true });

if (op.noche) {
  await orden("Page.navigate", { url: new URL("/robots.txt", url).href });
  await espera(800);
  await evaluar("sessionStorage.setItem('theme','dark')");
}
await orden("Page.navigate", { url });
await espera(Number(op.espera ?? 3500));
if (op.js) await evaluar(op.js);
if (op.ir) await evaluar(`document.querySelector(${JSON.stringify(op.ir)})?.scrollIntoView({ block: "center" })`);
await espera(1500);
if (op.raton) {
  const r = await evaluar(`JSON.stringify(document.querySelector(${JSON.stringify(op.raton)})?.getBoundingClientRect() ?? null)`);
  const caja = JSON.parse(r.result.value);
  if (caja) {
    await orden("Input.dispatchMouseEvent", { type: "mouseMoved", x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 });
    await espera(1000);
  }
}
const { data } = await orden("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(salida, Buffer.from(data, "base64"));
ws.close();
chrome.kill();
await espera(300);
try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* Chrome aún suelta archivos */ }
console.log(salida);
