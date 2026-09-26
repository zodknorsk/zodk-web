// Fotos de un motor WebGL de la web (tierra-gl.js, marte-gl.js) hechas en un
// Chrome sin ventana. Las usan generar-tierra-quieto.mjs y
// generar-marte-quieto.mjs para sacar las imágenes quietas de cada astro, que
// tienen que ser exactamente lo que pinta el motor.
//
// `codigo` es el cuerpo de un <script type="module"> que monta el motor y deja
// en `window.foto(arg)` una función que devuelve la foto como data URL. La
// página se sirve desde la raíz del repo, así que el código importa los
// motores con "/src/scripts/..." y lee los datos de "/public/...". Cada
// elemento de `fotos` es { arg, salida }: se llama a foto(arg) y se guarda en
// `salida` (ruta relativa al repo).
//
// Chrome: la variable CHROME, o el de siempre del Mac o del PC. Opciones de más
// para Chrome en CHROME_ARGS (p. ej. "--use-angle=swiftshader" sin tarjeta gráfica).
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

export const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CHROME = process.env.CHROME ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const TIPOS = { ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".html": "text/html" };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fotosDelMotor(codigo, fotos) {
  const pagina = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;height:100%;background:transparent}#c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}</style>
<div id="caja" style="position:fixed;inset:0"><canvas id="c"></canvas></div>
<script type="module">${codigo}
window.listo = true;
</script>`;

  // Servidor estático mínimo de la raíz del repo.
  const servidor = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(pagina); }
    const f = path.join(REPO, url);
    if (!f.startsWith(REPO) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TIPOS[path.extname(f)] ?? "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  const puerto = servidor.address().port;

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fotos-motor-"));
  const depuracion = 9500 + Math.floor(Math.random() * 400);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${depuracion}`, `--user-data-dir=${dir}`,
    "--window-size=800,800", "--force-device-scale-factor=1", ...(process.env.CHROME_ARGS?.split(" ") ?? []), "about:blank"],
    { stdio: "ignore" });

  // Chrome se maneja por su protocolo de depuración (CDP), sin dependencias.
  let pestañas;
  for (let i = 0; i < 60 && !pestañas; i++) {
    try { pestañas = await (await fetch(`http://127.0.0.1:${depuracion}/json`)).json(); } catch { await espera(200); }
  }
  const ws = new WebSocket(pestañas.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let n = 0;
  const pendientes = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
  });
  const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pendientes.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evalua = async (expression) => {
    const r = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result.result.value;
  };

  try {
    await cdp("Page.navigate", { url: `http://127.0.0.1:${puerto}/` });
    for (let i = 0; i < 100 && !(await evalua("!!window.listo").catch(() => false)); i++) await espera(100);
    for (const { arg, salida } of fotos) {
      const url = await evalua(`foto(${JSON.stringify(arg)})`);
      fs.writeFileSync(path.join(REPO, salida), Buffer.from(url.split(",")[1], "base64"));
      console.log(`-> ${salida}`);
    }
  } finally {
    const cerrado = new Promise((r) => chrome.once("exit", r));
    chrome.kill();
    await cerrado;                                 // si no, Chrome aún escribe en su carpeta
    servidor.close();
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
