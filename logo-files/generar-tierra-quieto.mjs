// La Tierra quieta (public/planeta/tierra-quieto.png y tierra-quieto-noche.png):
// la vista inicial de la portada (VISTA_INICIAL de tierra-gl.js, zoom x1) en
// píxeles de arte, LADO x LADO con el disco centrado (radio RADIO_ARTE) y
// transparente alrededor, de día y a la luz de la luna.
// Lo usan la portada mientras carga el lienzo (y si no hay WebGL2: fondo de
// .hero-planet) y los vuelos de vuelta a la Tierra desde /luna y /marte, así
// que tiene que ser exactamente lo que pinta el motor: se abre
// src/scripts/tierra-gl.js en un Chrome sin ventana y se le hace la foto
// (instantanea()). Sin nubes ni chapas: las nubes se mueven con el giro y las
// chapas son del contenido; la foto es solo el planeta.
// Rehacerlo cada vez que cambien los datos de la Tierra (generar-planeta-hero.py)
// o el motor, y subir PLANETA_V en planeta.js:
//   node logo-files/generar-tierra-quieto.mjs
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CHROME = process.env.CHROME ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const LADO = 368;                                  // 2 x RADIO_ARTE (180) + margen para el borde suavizado

// Servidor estático mínimo de la raíz del repo, con una página que monta el
// motor y deja a mano la foto.
const TIPOS = { ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".html": "text/html" };
const PAGINA = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;height:100%;background:transparent}#c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}</style>
<div id="caja" style="position:fixed;inset:0"><canvas id="c"></canvas></div>
<script type="module">
import { montarTierraGL } from "/src/scripts/tierra-gl.js";
const t = await montarTierraGL(document.getElementById("c"), {
  base: "/public/planeta/", disco: () => 2 * 180, banderas: [], sinNubes: true,
});
t.ponParado(true);
window.foto = async (noche) => {
  t.ponNoche(noche);
  await new Promise((r) => setTimeout(r, 2000));   // el fundido de día a noche dura 1,5 s
  return t.instantanea(${LADO}).toDataURL("image/png");
};
window.listo = true;
</script>`;
const servidor = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(PAGINA); }
  const f = path.join(REPO, url);
  if (!f.startsWith(REPO) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TIPOS[path.extname(f)] ?? "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
const puerto = servidor.address().port;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tierra-quieto-"));
const depuracion = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${depuracion}`, `--user-data-dir=${dir}`,
  "--window-size=800,800", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
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
  for (const [noche, nombre] of [[false, "tierra-quieto.png"], [true, "tierra-quieto-noche.png"]]) {
    const url = await evalua(`foto(${noche})`);
    const salida = path.join(REPO, "public/planeta", nombre);
    fs.writeFileSync(salida, Buffer.from(url.split(",")[1], "base64"));
    console.log(`${path.relative(REPO, salida)}: ${LADO} x ${LADO}`);
  }
} finally {
  const cerrado = new Promise((r) => chrome.once("exit", r));
  chrome.kill();
  await cerrado;                                   // si no, Chrome aún escribe en su carpeta
  servidor.close();
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
