// La Luna en <canvas> (Proyecto Luna): dos caras fijas, la visible y la oculta,
// y media vuelta entre ellas al pulsar un botón.
//
// En reposo se pinta el PNG aprobado de cada cara (sombras proyectadas,
// supermuestreo y limpieza: lo que sale de generar-luna.py). Solo durante la
// media vuelta se pinta en tiempo real, desde un mapa en latitud/longitud con
// el material (albedo) y la normal del relieve de cada celda, con la misma luz
// que el generador (terminador, relieve rasante, escalones de 1/LIGHT_SUB) salvo
// las sombras proyectadas. Con la Luna quieta no se gasta nada.
//
// Datos de `python3 logo-files/generar-luna.py --canvas carpeta/`:
//   luna-mapa.png   R = material 0-5, G/B = normal este/norte (0..255 -> -1..1)
//   luna-lut.png    color por material (fila) y escalón de luz (columna)
//   luna-datos.json constantes y las dos caras (lat0, lon0, fase, lado)
//   luna-visible.png, luna-oculta.png   las caras aprobadas
// Detalle y decisiones en logo-files/LUNA-WIP.md.

export const LUNA_V = 1;

const DEG = Math.PI / 180;
const smooth = (e0, e1, x) => {
  let t = (x - e0) / (e1 - e0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
};

async function bitmap(url) {
  const blob = await fetch(url).then((r) => r.blob());
  // Sin gestión de color: el mapa lleva índices y normales, no colores.
  return createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}

function pixels(bm) {
  const c = document.createElement("canvas");
  c.width = bm.width;
  c.height = bm.height;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(bm, 0, 0);
  return x.getImageData(0, 0, bm.width, bm.height).data;
}

async function preparar(base) {
  const v = `?v=${LUNA_V}`;
  const [D, mapBm, lutBm, visBm, ocuBm] = await Promise.all([
    fetch(`${base}luna-datos.json${v}`).then((r) => r.json()),
    bitmap(`${base}luna-mapa.png${v}`),
    bitmap(`${base}luna-lut.png${v}`),
    createImageBitmap(await fetch(`${base}luna-visible.png${v}`).then((r) => r.blob())),
    createImageBitmap(await fetch(`${base}luna-oculta.png${v}`).then((r) => r.blob())),
  ]);
  const MW = D.MAPA_W, MH = D.MAPA_H;

  // Mipmaps en longitud (como la Tierra): versiones del mapa con texels de 2,
  // 4… celdas de ancho. Hacia los polos un píxel del disco abarca varias
  // celdas de longitud; leer UNA hace que los cráteres pequeños parpadeen al
  // girar. En latitud no hace falta (y reducir también ahí dejaba bloques en
  // abanico alrededor del polo). Material como media ×40 (los materiales van
  // de oscuro a claro) y normal como media, en enteros de 8 bits.
  const mp = pixels(mapBm);
  const niveles = [];
  let w = MW;
  let mat = new Uint8Array(w * MH), ne = new Int8Array(w * MH), nn = new Int8Array(w * MH);
  for (let i = 0; i < w * MH; i++) {
    mat[i] = mp[i * 4] * 40;
    ne[i] = Math.round((mp[i * 4 + 1] / 127.5 - 1) * 127);
    nn[i] = Math.round((mp[i * 4 + 2] / 127.5 - 1) * 127);
  }
  niveles.push({ w, mat, ne, nn });
  while (w % 2 === 0 && niveles.length < 6) {
    const pw = w, p = niveles[niveles.length - 1];
    w >>= 1;
    mat = new Uint8Array(w * MH); ne = new Int8Array(w * MH); nn = new Int8Array(w * MH);
    for (let r = 0; r < MH; r++) {
      for (let c = 0; c < w; c++) {
        const a = r * pw + 2 * c, o = r * w + c;
        mat[o] = (p.mat[a] + p.mat[a + 1] + 1) >> 1;
        ne[o] = Math.round((p.ne[a] + p.ne[a + 1]) / 2);
        nn[o] = Math.round((p.nn[a] + p.nn[a + 1]) / 2);
      }
    }
    niveles.push({ w, mat, ne, nn });
  }

  const lp = pixels(lutBm);
  const lut = new Uint32Array(lp.length / 4);
  for (let i = 0; i < lut.length; i++) {
    lut[i] = (255 << 24) | (lp[i * 4 + 2] << 16) | (lp[i * 4 + 1] << 8) | lp[i * 4];
  }
  return { D, niveles, lut, caras: { visible: visBm, oculta: ocuBm } };
}

const cargas = new Map();
export function cargarLuna(base) {
  if (!cargas.has(base)) cargas.set(base, preparar(base));
  return cargas.get(base);
}

// Monta la Luna en `canvas` mostrando la cara `cara` ("visible" u "oculta").
// Devuelve { girar(cara), cara(), medir }. `duracion`: segundos de la media
// vuelta. `alTerminar(cara)` se llama al acabar un giro.
export async function montarLuna(canvas, {
  base = "/luna/",
  cara: inicial = "visible",
  duracion = 1.6,
  alTerminar = () => {},
} = {}) {
  const P = await cargarLuna(base);
  const { D, niveles, lut } = P;
  const MH = D.MAPA_H;
  const S = D.SIZE, R = D.RADIUS, C = S / 2;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(S, S);
  const buf = new Uint32Array(img.data.buffer);
  const LS = D.LIGHT_SUB, LN = D.LNSTEP, KN = D.LUT_KN, KMIN = D.LUT_KMIN * LS;
  const kNoche = Math.log(D.NOCHE) / LN;
  const EM = D.RELIEVE_ELEV_MAX * DEG, sinEM = Math.sin(EM), cosEM = Math.cos(EM);
  const RIN = 1 - D.LIMB_AA / R, ROUT = 1 + D.LIMB_AA / R;
  const SP = D.SPACE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // Rejilla de trabajo: material * KN + escalón (para la limpieza y la LUT).
  const cod = new Int32Array(S * S);
  const cod2 = new Int32Array(S * S);

  let actual = inicial, raf = 0;

  const solDe = (fase, lado) => {
    const f = fase * DEG, a = D.SOL_ARR * DEG;
    const x = lado * Math.sin(f) * Math.cos(a), y = Math.sin(f) * Math.sin(a), z = Math.cos(f);
    const n = Math.hypot(x, y, z);
    return [x / n, y / n, z / n];
  };

  function pintarCara(nombre) {
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(P.caras[nombre], 0, 0);
  }

  // Lo que no depende del giro ni de la luz, por píxel del disco: posición en
  // la esfera, cobertura del borde y oscurecimiento del limbo.
  const idx = [], vx = [], vy = [], vz = [], cv = [], limb = [];
  for (let sy = 0; sy < S; sy++) {
    const y = -(sy + 0.5 - C) / R;
    for (let sx = 0; sx < S; sx++) {
      const x = (sx + 0.5 - C) / R;
      const rr0 = x * x + y * y, dc = Math.sqrt(rr0);
      if (dc > ROUT) continue;
      // en el anillo de suavizado se lee el punto del borde
      const k0 = rr0 >= 0.9999 ? Math.sqrt(0.9999 / rr0) : 1;
      const ux = x * k0, uy = y * k0;
      idx.push(sy * S + sx);
      vx.push(ux); vy.push(uy); vz.push(Math.sqrt(Math.max(0, 1 - (ux * ux + uy * uy))));
      cv.push(dc > RIN ? 1 - smooth(RIN, ROUT, dc) : 1);
      limb.push(1 - D.LIMB_K * smooth(0.75, 1, dc));
    }
  }
  const NP = idx.length;
  const pIdx = Int32Array.from(idx), pX = Float32Array.from(vx), pY = Float32Array.from(vy);
  const pZ = Float32Array.from(vz), pCov = Float32Array.from(cv), pLimb = Float32Array.from(limb);
  const NIV = niveles.length, CELDA0 = D.MAPA_W / 360 / DEG / R;   // celdas de longitud que abarca un píxel en el ecuador
  const INV_LN_LS = LS / LN, INV_LN_RK = D.RELIEVE_K / LN;
  cod.fill(-1);

  // Un fotograma en tiempo real con la Luna vista desde (lat0, lon0) y la luz
  // de fase `fase`, como pasada_lenta() + colorear() del generador (sin
  // sombras proyectadas, con una muestra por píxel).
  function pintarVista(lat0, lon0, fase, lado) {
    const [SX, SY, SZ] = solDe(fase, lado);
    const sl0 = Math.sin(lat0 * DEG), cl0 = Math.cos(lat0 * DEG);
    const ay = cl0, az = sl0;                  // eje de giro en vista (x = 0)
    const lonOff = lon0 + 180;
    for (let n = 0; n < NP; n++) {
      const ux = pX[n], uy = pY[n], uz = pZ[n];
      const yy = uy * cl0 + uz * sl0, zz = uz * cl0 - uy * sl0;
      // coseno de la latitud sin asin: sqrt(1 - yy²)
      const clatR = Math.sqrt(Math.max(0, 1 - yy * yy));
      const clat = clatR > 0.02 ? clatR : 0.02;
      // huella del píxel en celdas de longitud del nivel 0 -> nivel de mipmap
      const foot = CELDA0 / clat;
      let L = 0;
      if (foot > 1) { L = 1; let f = 2; while (f < foot && L < NIV - 1) { f *= 2; L++; } }
      const nv = niveles[L];
      const lat = Math.asin(yy > 1 ? 1 : yy < -1 ? -1 : yy);
      let r = ((0.5 - lat / Math.PI) * MH) | 0;
      r = r < 0 ? 0 : r >= MH ? MH - 1 : r;
      let lon = Math.atan2(ux, zz) / DEG + lonOff;
      lon -= Math.floor(lon / 360) * 360;
      let c = (lon / 360 * nv.w) | 0;
      if (c >= nv.w) c = 0;
      const i = r * nv.w + c;
      const m = ((nv.mat[i] + 20) / 40) | 0;
      const lamS = ux * SX + uy * SY + uz * SZ;
      let bright = D.NOCHE + (1 - D.NOCHE) * smooth(D.TERM_A, D.TERM_B, lamS);
      bright *= pLimb[n];
      let j = Math.floor(Math.log(bright > 1e-3 ? bright : 1e-3) * INV_LN_LS + 0.5);   // en 1/LS de escalón
      if (lamS > 0) {
        const ne = nv.ne[i] / 127, nn = nv.nn[i] / 127;
        const nu = Math.sqrt(Math.max(0, 1 - ne * ne - nn * nn));
        // base local: E = eje x U, N = U x E
        let Ex = ay * uz - az * uy, Ey = az * ux, Ez = -ay * ux;
        const le = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez) || 1e-9;
        Ex /= le; Ey /= le; Ez /= le;
        const Nx = uy * Ez - uz * Ey, Ny = uz * Ex - ux * Ez, Nz = ux * Ey - uy * Ex;
        const nx = ne * Ex + nn * Nx + nu * ux, ny = ne * Ey + nn * Ny + nu * uy, nz = ne * Ez + nn * Nz + nu * uz;
        const lamL = nx * SX + ny * SY + nz * SZ;
        let kRel = 0;
        if (lamL <= 0) kRel = D.SOMBRA_K;
        else if (lamS > 0.02) {
          let ratio = (lamL > 0.004 ? lamL : 0.004) / lamS;
          if (lamS > sinEM) {                    // relieve rasante: el sol no sube de RELIEVE_ELEV_MAX
            const se = SX * Ex + SY * Ey + SZ * Ez, sn = SX * Nx + SY * Ny + SZ * Nz;
            const ch = cosEM / (Math.sqrt(se * se + sn * sn) || 1);
            const d = ch * (se * (nx * Ex + ny * Ey + nz * Ez) + sn * (nx * Nx + ny * Ny + nz * Nz))
              + sinEM * (nx * ux + ny * uy + nz * uz);
            ratio = (d > 0.004 ? d : 0.004) / sinEM;
          }
          kRel = Math.round(Math.log(ratio) * INV_LN_RK);
          kRel = kRel < D.RELIEVE_MIN ? D.RELIEVE_MIN : kRel > D.RELIEVE_MAX ? D.RELIEVE_MAX : kRel;
        }
        j += kRel * LS;
        const jn = Math.round(kNoche * LS);         // la sombra no pasa de la luz cenicienta
        if (j < jn) j = jn;
      }
      j -= KMIN;
      j = j < 0 ? 0 : j >= KN ? KN - 1 : j;
      cod[pIdx[n]] = m * KN + j;
    }
    // limpieza: como _limpiar() del generador, dos pasadas
    let src = cod, dst = cod2;
    for (let pasada = 0; pasada < 2; pasada++) {
      dst.set(src);
      for (let yy = 1; yy < S - 1; yy++) {
        for (let xx = 1; xx < S - 1; xx++) {
          const p = yy * S + xx, v = src[p];
          if (v < 0) continue;
          const a = src[p - S], b = src[p + S], c = src[p - 1], d = src[p + 1];
          if (a < 0 || b < 0 || c < 0 || d < 0 || v === a || v === b || v === c || v === d) continue;
          if ((a === b && (a === c || a === d)) || (a === c && a === d)) dst[p] = a;
          else if (b === c && b === d) dst[p] = b;
        }
      }
      const t = src; src = dst; dst = t;
    }
    for (let n = 0; n < NP; n++) {
      const p = pIdx[n];
      let col = lut[src[p]];
      const t = pCov[n];
      if (t < 1) {
        const r = col & 255, g = (col >> 8) & 255, b = (col >> 16) & 255;
        col = (255 << 24) | (Math.round(SP[2] + (b - SP[2]) * t) << 16)
          | (Math.round(SP[1] + (g - SP[1]) * t) << 8) | Math.round(SP[0] + (r - SP[0]) * t);
      }
      buf[p] = col;
    }
    ctx.putImageData(img, 0, 0);
  }

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  function girar(destino = actual === "visible" ? "oculta" : "visible") {
    if (destino === actual || raf) return;
    const A = D.caras[actual], B = D.caras[destino];
    if (reduce.matches) {                       // sin movimiento: cambio directo
      actual = destino;
      pintarCara(actual);
      alTerminar(actual);
      return;
    }
    const t0 = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - t0) / (duracion * 1000));
      if (t >= 1) {
        raf = 0;
        actual = destino;
        pintarCara(actual);
        alTerminar(actual);
        return;
      }
      const e = easeInOut(t);
      pintarVista(lerp(A.lat0, B.lat0, e), lerp(A.lon0, B.lon0, e), lerp(A.fase, B.fase, e), A.lado);
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  }

  // Para el banco de pruebas: pinta una cara en tiempo real (sin PNG) y
  // devuelve cuántos ms tarda un fotograma.
  function medir(nombre = actual) {
    const c = D.caras[nombre], t0 = performance.now();
    pintarVista(c.lat0, c.lon0, c.fase, c.lado);
    return performance.now() - t0;
  }

  // Fotograma intermedio `e` (0..1) del giro desde la cara actual, sin animar
  // (banco de pruebas).
  function fotograma(e) {
    const A = D.caras[actual], B = D.caras[actual === "visible" ? "oculta" : "visible"];
    pintarVista(lerp(A.lat0, B.lat0, e), lerp(A.lon0, B.lon0, e), lerp(A.fase, B.fase, e), A.lado);
  }

  pintarCara(actual);
  // El primer fotograma en tiempo real tarda varias veces más (el navegador aún
  // no ha optimizado el bucle): se hace uno en un rato libre, antes del primer
  // clic, y se vuelve a poner la cara.
  const libre = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  libre(() => { if (!raf) { medir(); pintarCara(actual); } });
  return { girar, cara: () => actual, medir, pintarCara, fotograma };
}
