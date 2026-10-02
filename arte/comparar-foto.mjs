// Pinta el dron en el visor (HD o pixel) desde la cámara encajada en una foto
// (arte/encajar-camara.mjs deja <ajuste>.cam.json) y lo pone debajo de la
// foto o, con --encima, encima a medias. Usa el enganche del visor que solo
// existe en local (window.__visor). Necesita `npm run dev` en marcha.
// Uso: node arte/comparar-foto.mjs <ajuste.json> <salida.png> [--ancho=1400]
//        [--pixel] [--recorte=x,y,ancho,alto (píxeles de la foto)] [--encima]
//        [--noche] [--solo (solo el render)]
// El lienzo no puede pasar de lo que cabe en la pantalla (en el Mac, unos
// 1900 px de ancho): más grande, el encuadre se descoloca.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const [ajusteF, salida, ...resto] = process.argv.slice(2);
const op = Object.fromEntries(resto.map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || true]; }));
const A = JSON.parse(fs.readFileSync(ajusteF, "utf8"));
const cam = JSON.parse(fs.readFileSync(ajusteF.replace(/\.json$/, ".cam.json"), "utf8"));
const foto = path.resolve(path.dirname(ajusteF), A.foto);
const meta = await sharp(foto).metadata();
const W = meta.width, H = meta.height;
const rad = (g) => (g * Math.PI) / 180;
// Lienzo con la forma de la foto entera; luego se recorta lo mismo en los dos.
const ancho = Number(op.ancho ?? 1400), alto = Math.round((ancho * H) / W);
const C = [cam.tx + cam.d * Math.sin(rad(cam.az)) * Math.cos(rad(cam.el)), cam.ty + cam.d * Math.sin(rad(cam.el)), cam.tz + cam.d * Math.cos(rad(cam.az)) * Math.cos(rad(cam.el))];
const T = [cam.tx, cam.ty, cam.tz];

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "comparar-"));
const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${puerto}`, `--user-data-dir=${dir}`,
  `--window-size=${ancho + 900},${alto + 900}`, "--force-device-scale-factor=1", "--hide-scrollbars", "--use-angle=metal", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let lista = [];
for (let i = 0; i < 50 && !lista.length; i++) {
  try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); } catch { /* arrancando */ }
  await espera(200);
}
const ws = new WebSocket(lista.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pendientes = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); } });
const orden = (method, params = {}) => new Promise((r) => { const i = ++id; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expression) => (await orden("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value;

if (op.noche) {
  await orden("Page.navigate", { url: "http://localhost:4321/robots.txt" });
  await espera(800);
  await evaluar("sessionStorage.setItem('theme','dark')");
}
await orden("Page.navigate", { url: `http://localhost:4321/uas/${A.modelo ?? "bayraktar-tb2"}${op.pixel ? "?estilo=pixel" : ""}` });
await espera(4000);
const caja = await evaluar(`(async () => {
  const c = document.querySelector('.visor-lienzo-caja');
  Object.assign(c.style, { position: 'fixed', left: '0px', top: '0px', width: '${ancho}px', height: '${alto}px', maxWidth: 'none', maxHeight: 'none', zIndex: 99999, background: '#ebebee' });
  // El lienzo, del mismo tamaño exacto (si no, la caja crece pero el lienzo
  // se queda con su alto y el dron sale encogido en vertical).
  Object.assign(c.querySelector('.visor-lienzo').style, { width: '${ancho}px', height: '${alto}px' });
  document.querySelectorAll('.visor-pin, .visor-rotulo, .visor-guia, header, .visor-ayuda').forEach((e) => e.style.display = 'none');
  // Fuera también todo lo que flota sobre la página (la barra de arriba).
  for (const e of document.body.querySelectorAll('*')) {
    if (e === c || c.contains(e) || e.contains(c)) continue;
    const p = getComputedStyle(e).position;
    if (p === 'fixed' || p === 'sticky') e.style.display = 'none';
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 600));
  window.__visor.mirar(${JSON.stringify(C)}, ${JSON.stringify(T)}, ${cam.fov}, ${cam.roll ?? 0});
  await new Promise((r) => setTimeout(r, 900));
  window.__visor.mirar(${JSON.stringify(C)}, ${JSON.stringify(T)}, ${cam.fov}, ${cam.roll ?? 0});
  await new Promise((r) => setTimeout(r, 600));
  const b = document.querySelector('.visor-lienzo').getBoundingClientRect();
  return JSON.stringify({ x: b.x + scrollX, y: b.y + scrollY, sx: scrollX, sy: scrollY, by: b.y, cw: document.querySelector('.visor-lienzo').width, ch: document.querySelector('.visor-lienzo').height, aspect: window.__visor?.camara.aspect, fov: window.__visor?.camara.fov, vw: innerWidth, vh: innerHeight, w: b.width, h: b.height, hay: typeof window.__visor, pos: window.__visor?.camara.position, min: window.__visor?.controles.minDistance, max: window.__visor?.controles.maxDistance, near: window.__visor?.camara.near, far: window.__visor?.camara.far });
})()`);
const r = JSON.parse(caja); if (op.depurar) console.log(caja);
const { data } = await orden("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
ws.close();
chrome.kill();
await espera(300);
try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* */ }

let render = sharp(Buffer.from(data, "base64")).resize(ancho, alto);
let fotoR = sharp(foto).resize(ancho, alto);
let [x0, y0, w0, h0] = [0, 0, ancho, alto];
if (op.recorte) {
  const [x, y, w, h] = String(op.recorte).split(",").map(Number);
  const k = ancho / W;
  [x0, y0, w0, h0] = [Math.round(x * k), Math.round(y * k), Math.round(w * k), Math.round(h * k)];
}
const bufR = await (await sharp(await render.png().toBuffer()).extract({ left: x0, top: y0, width: w0, height: h0 })).png().toBuffer();
const bufF = await (await sharp(await fotoR.png().toBuffer()).extract({ left: x0, top: y0, width: w0, height: h0 })).png().toBuffer();
if (op.solo) {
  await sharp(bufR).toFile(salida);
} else if (op.encima) {
  await sharp(bufF).composite([{ input: await sharp(bufR).ensureAlpha(0.5).png().toBuffer(), blend: "over" }]).toFile(salida);
} else {
  const vertical = w0 > h0 * 1.6;
  await sharp({ create: { width: vertical ? w0 : w0 * 2 + 10, height: vertical ? h0 * 2 + 10 : h0, channels: 3, background: "#fff" } })
    .composite([{ input: bufF, left: 0, top: 0 }, { input: bufR, left: vertical ? 0 : w0 + 10, top: vertical ? h0 + 10 : 0 }]).png().toFile(salida);
}
console.log(salida);
