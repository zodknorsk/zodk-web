// Naves del hero de la portada (src/data/aeronaves.ts) que salen de los
// drones del hangar en pixel HD (docs/uas-hd.md): el dron en vuelo, pintado
// con el motor del modo Pixel del visor (naveHD en src/scripts/uas-miniatura-hd.ts)
// en un Chrome sin ventana, recortado y con la sombra debajo, como las fotos
// de las demás naves.
//
// Escribe public/zodk-<id>.png (la de noche sale después con
// `python3 arte/generar-naves-noche.py <id>`) y saca por pantalla la
// proporción y las luces de posición (en % de la imagen) para aeronaves.ts.
// Uso (desde la raíz del repo, con `npm run dev` en marcha):
//   node arte/generar-naves-uas-hd.mjs [id…]      (sin id, todas las de NAVES)
// Pruebas: --modelo=… --vista=ACIMUT,ELEVACIÓN --morro=GRADOS --lado=PX
// --quitar=a,b --nombre=… pinta una sola con esos valores; --lote=archivo.json,
// varias ({ nombre: { modelo, vista, morro, lado, quitar } }).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const WEB = process.env.WEB ?? "http://localhost:4321";

// Las naves: el dron del hangar (src/data/uas/<modelo>.ts), desde dónde se
// ve (acimut y elevación de la cámara, como las vistas del visor: 0° de
// frente, 90° desde la derecha, 90° de elevación desde arriba), hacia dónde
// apunta el morro en la imagen (180°, a la izquierda), el lado del cuadrado
// en que se pinta (el dron lo llena; 1 px por píxel) y las piezas que no van.
// Vista E, elegida por el usuario el 2-oct-2026: casi de lado y desde arriba.
// El MQ-9, armado y con el tren recogido, como vuela. El TB2 recoge solo la
// rueda del morro: las patas de atrás son fijas (Baykar; migflug.com).
const TREN_MQ9 = ["pata-morro", "vastago-morro", "tirante-morro", "compas-morro", "horquilla", "rueda-morro", "buje-morro", "patas", "amortiguadores", "ejes", "ruedas", "bujes"];
const NAVES = {
  mq9: { modelo: "mq-9-reaper", vista: [90, 28], morro: 180, lado: 260, quitar: TREN_MQ9 },
  tb2: { modelo: "bayraktar-tb2", vista: [90, 28], morro: 180, lado: 260, quitar: ["pata-morro", "vastago-morro", "compas-morro", "horquilla", "rueda-morro", "buje-morro"] },
  // El Shahed no tiene tren: vuela como está. Más desde arriba (42°), como la
  // nave 1.0 que le gustaba al usuario: se lee el ala en delta.
  shahed136: { modelo: "shahed-136", vista: [90, 42], morro: 180, lado: 260, quitar: [] },
};

// La sombra, como en las fotos: la silueta desplazada hacia abajo, en
// fracciones del alto del dron, y su alfa.
const SOMBRA = { dx: 0.03, dy: 0.12, alfa: 120 };

const op = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const lista = op.lote
  ? JSON.parse(fs.readFileSync(op.lote, "utf8"))
  : op.modelo
  ? { [op.nombre ?? op.modelo]: {
      modelo: op.modelo, vista: (op.vista ?? "90,70").split(",").map(Number), morro: Number(op.morro ?? 180),
      lado: Number(op.lado ?? 90), quitar: op.quitar ? op.quitar.split(",") : [] } }
  : Object.fromEntries(Object.entries(NAVES).filter(([id]) => {
      const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
      return !ids.length || ids.includes(id);
    }));

const CHROME = process.env.CHROME ?? (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "naves-hd-"));
const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${puerto}`, `--user-data-dir=${dir}`,
  "--use-angle=metal", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let pestanas = [];
for (let i = 0; i < 50 && !pestanas.length; i++) {
  try { pestanas = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); } catch { /* aún arrancando */ }
  await espera(200);
}
const ws = new WebSocket(pestanas.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pendientes = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
});
const orden = (method, params = {}) => new Promise((r) => { const i = ++id; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

try {
  await orden("Page.navigate", { url: `${WEB}/uas` });
  await espera(3000);
  for (const [nave, n] of Object.entries(lista)) {
    const r = await orden("Runtime.evaluate", {
      expression: `(async () => {
        const { naveHD } = await import("/src/scripts/uas-miniatura-hd.ts");
        const { default: maqueta } = await import("/src/data/uas/${n.modelo}.ts");
        if (!maqueta.hd) throw new Error("${n.modelo} no tiene HD");
        return JSON.stringify(naveHD(maqueta, ${JSON.stringify(n.vista)}, ${n.morro}, ${n.lado}, ${JSON.stringify(n.quitar)}));
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(`${nave}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    const { png, luces } = JSON.parse(r.result.value);
    const { data: dron, info } = await sharp(Buffer.from(png.split(",")[1], "base64")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const L = info.width;
    const en = (x, y) => x >= 0 && y >= 0 && x < L && y < L && dron[(y * L + x) * 4 + 3] > 127;
    // Sin píxeles sueltos (docs/uas-hd.md): a este tamaño, la punta de una
    // pieza fina (la sonda del morro del TB2) sale despegada del dron.
    const sueltos = [];
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++)
      if (en(x, y) && ![[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].some(([a, b]) => en(x + a, y + b))) sueltos.push((y * L + x) * 4 + 3);
    for (const k of sueltos) dron[k] = 0;
    // Recorte: lo que ocupa el dron.
    let x0 = L, x1 = -1, y0 = L, y1 = -1;
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++)
      if (en(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const dx = Math.round(SOMBRA.dx * (y1 - y0 + 1)), dy = Math.round(SOMBRA.dy * (y1 - y0 + 1));
    const ancho = x1 - x0 + 1 + dx, alto = y1 - y0 + 1 + dy;
    const img = new Uint8Array(ancho * alto * 4);
    for (let y = 0; y < alto; y++)
      for (let x = 0; x < ancho; x++) {
        const k = (y * ancho + x) * 4;
        if (en(x + x0, y + y0)) img.set(dron.subarray(((y + y0) * L + x + x0) * 4, ((y + y0) * L + x + x0) * 4 + 4), k);
        else if (en(x + x0 - dx, y + y0 - dy)) img.set([0, 0, 0, SOMBRA.alfa], k);
      }
    const salida = path.join(REPO, "public", `zodk-${nave}.png`);
    fs.mkdirSync(path.dirname(salida), { recursive: true });
    await sharp(Buffer.from(img), { raw: { width: ancho, height: alto, channels: 4 } }).png({ compressionLevel: 9 }).toFile(salida);
    const pc = ([x, y]) => [Math.round(((x - x0) / ancho) * 100), Math.round(((y - y0) / alto) * 100)];
    console.log(`${nave}: ${ancho}x${alto}`, JSON.stringify({ ratio: `${ancho} / ${alto}`, luces: luces && { der: pc(luces.der), izq: pc(luces.izq) } }));
  }
} finally {
  ws.close();
  chrome.kill();
  await espera(300);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* Chrome aún suelta archivos */ }
}
