// Pinta el visor desde una cámara cualquiera (en metros de la maqueta), sin
// foto. Uso: node arte/vista-visor.mjs salida.png az el d [fov=20] [tx,ty,tz=0,0,0]
//   [--ancho=1600] [--alto=900] [--pixel] [--noche] [--modelo=bayraktar-tb2]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const [salida, az, el, d, fov = "20", t = "0,0,0", ...resto] = process.argv.slice(2);
const op = Object.fromEntries(resto.map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || true]; }));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vista-"));
const ajuste = path.join(dir, "a.json");
const [tx, ty, tz] = t.split(",").map(Number);
const ancho = Number(op.ancho ?? 1600), alto = Number(op.alto ?? 900);
// Una «foto» vacía del tamaño pedido y una cámara a mano.
const sharp = (await import("sharp")).default;
await sharp({ create: { width: ancho, height: alto, channels: 3, background: "#ebebee" } }).png().toFile(path.join(dir, "f.png"));
fs.writeFileSync(ajuste, JSON.stringify({ foto: "f.png", modelo: op.modelo ?? "bayraktar-tb2", puntos: [] }));
fs.writeFileSync(path.join(dir, "a.cam.json"), JSON.stringify({ az: +az, el: +el, d: +d, fov: +fov, tx, ty, tz, roll: 0 }));
const { execFileSync } = await import("node:child_process");
const args = [path.join(path.dirname(new URL(import.meta.url).pathname), "comparar-foto.mjs"), ajuste, salida, `--ancho=${ancho}`, "--solo"];
if (op.pixel) args.push("--pixel");
if (op.noche) args.push("--noche");
if (op.catapulta) args.push("--catapulta");
execFileSync("node", args, { stdio: "inherit" });
