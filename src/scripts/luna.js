// La Luna en <canvas> (Proyecto Luna): dos caras fijas, la visible y la oculta,
// y media vuelta entre ellas al pulsar un botón.
//
// En reposo se pinta el PNG aprobado de cada cara (sombras proyectadas,
// supermuestreo y limpieza: lo que sale de generar-luna.py). Solo durante la
// media vuelta se pinta en tiempo real, desde un mapa en latitud/longitud con
// el material (albedo) y la normal del relieve de cada celda, con la misma luz
// que el generador (terminador, relieve rasante, escalones de 1/LIGHT_SUB) salvo
// las sombras proyectadas. Durante el giro cambian a la vez la vista, la fase,
// la exposición y el tono frío de una cara a la otra. Con la Luna quieta no se
// gasta nada.
//
// Datos de `python3 logo-files/generar-luna.py --canvas public/luna/`:
//   luna-mapa.png   R = material, G/B = normal este/norte (0..NORMAL_NIVELES-1 -> -1..1)
//   luna-lut.png    color por material y escalón de luz, en FRIO_PASOS+1
//                   bloques de filas (tono frío de 0 a FRIO_MAX)
//   luna-datos.json constantes y las dos caras (lat0, lon0, fase, lado,
//                   exposicion, frio)
//   luna-visible.png, luna-oculta.png   las caras aprobadas
// El mapa (~1,5 MB) no hace falta para enseñar una cara: se baja en segundo
// plano; si se pulsa antes de que llegue, el giro espera a tenerlo.
// Lo usan src/pages/luna.astro y logo-files/prototipo-luna/canvas.html.
// Detalle y decisiones en logo-files/LUNA-WIP.md.

// Subir al regenerar public/luna/ (cache-busting: los archivos se llaman
// siempre igual).
export const LUNA_V = 2;

const DEG = Math.PI / 180;
// Sentido del giro, el mismo a la ida y a la vuelta: 1 = la superficie se
// mueve hacia la izquierda (lon0 siempre crece), -1 = hacia la derecha.
const SENTIDO = -1;
const smooth = (e0, e1, x) => {
  let t = (x - e0) / (e1 - e0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
};

async function bitmap(url, crudo = true) {
  const blob = await fetch(url).then((r) => r.blob());
  // Sin gestión de color para mapa y LUT: llevan índices y normales, no colores.
  return crudo
    ? createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" })
    : createImageBitmap(blob);
}

function pixels(bm) {
  const c = document.createElement("canvas");
  c.width = bm.width;
  c.height = bm.height;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(bm, 0, 0);
  return x.getImageData(0, 0, bm.width, bm.height).data;
}

// Lo mínimo para enseñar una cara: datos y los dos PNG.
const cargas = new Map();
export function cargarLuna(base = "/luna/") {
  if (!cargas.has(base)) {
    cargas.set(base, (async () => {
      const v = `?v=${LUNA_V}`;
      const [D, visible, oculta] = await Promise.all([
        fetch(`${base}luna-datos.json${v}`).then((r) => r.json()),
        bitmap(`${base}luna-visible.png${v}`, false),
        bitmap(`${base}luna-oculta.png${v}`, false),
      ]);
      return { D, caras: { visible, oculta } };
    })());
  }
  return cargas.get(base);
}

// Lo que hace falta para girar: mapa con mipmaps y LUT.
const cargasGiro = new Map();
function cargarGiro(base, D) {
  if (!cargasGiro.has(base)) {
    cargasGiro.set(base, (async () => {
      const v = `?v=${LUNA_V}`;
      const [mapBm, lutBm] = await Promise.all([
        bitmap(`${base}luna-mapa.png${v}`),
        bitmap(`${base}luna-lut.png${v}`),
      ]);
      const MW = D.MAPA_W, MH = D.MAPA_H, NQ = (D.NORMAL_NIVELES - 1) / 2;

      // Mipmaps en longitud (como la Tierra): versiones del mapa con texels de
      // 2, 4… celdas de ancho. Hacia los polos un píxel del disco abarca varias
      // celdas de longitud; leer UNA hace que los cráteres pequeños parpadeen
      // al girar. En latitud no hace falta (y reducir también ahí dejaba
      // bloques en abanico alrededor del polo). Material como media ×40 (los
      // materiales van de oscuro a claro) y normal como media, en 8 bits.
      const mp = pixels(mapBm);
      const niveles = [];
      let w = MW;
      let mat = new Uint8Array(w * MH), ne = new Int8Array(w * MH), nn = new Int8Array(w * MH);
      for (let i = 0; i < w * MH; i++) {
        mat[i] = mp[i * 4] * 40;
        ne[i] = Math.round((mp[i * 4 + 1] / NQ - 1) * 127);
        nn[i] = Math.round((mp[i * 4 + 2] / NQ - 1) * 127);
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
      return { niveles, lut };
    })());
  }
  return cargasGiro.get(base);
}

// Monta la Luna en `canvas` mostrando la cara `cara` ("visible" u "oculta").
// Devuelve { girar(destino?), cara(), girando(), desmontar, y para el banco de
// pruebas medir, pintarCara, fotograma }. `duracion`: segundos de la media
// vuelta. `alEmpezar(destino)` y `alTerminar(cara)` avisan del giro.
/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ base?: string, cara?: "visible" | "oculta", duracion?: number,
 *   alEmpezar?: (destino: string) => void, alTerminar?: (cara: string) => void }} [opciones]
 */
export async function montarLuna(canvas, {
  base = "/luna/",
  cara: inicial = "visible",
  duracion = 1.6,
  alEmpezar = () => {},
  alTerminar = () => {},
} = {}) {
  const P = await cargarLuna(base);
  const { D } = P;
  const S = D.SIZE, R = D.RADIUS, C = S / 2, MH = D.MAPA_H;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  let actual = inicial, raf = 0, girando = false, vivo = true;

  function pintarCara(nombre) {
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(P.caras[nombre], 0, 0);
  }
  pintarCara(actual);

  // Lo del giro se prepara en un rato libre (o al pulsar, si llega antes).
  let preparando = null;
  const preparar = () => (preparando ??= cargarGiro(base, D).then(montarGiro));
  const libre = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  libre(() => preparar().then((g) => {
    // El primer fotograma en tiempo real tarda varias veces más (el navegador
    // aún no ha optimizado el bucle): se hace uno sin enseñarlo.
    if (vivo && !girando) g.calentar();
  }));

  function montarGiro({ niveles, lut }) {
    const img = ctx.createImageData(S, S);
    const buf = new Uint32Array(img.data.buffer);
    const LS = D.LIGHT_SUB, LN = D.LNSTEP, KN = D.LUT_KN, KMIN = D.LUT_KMIN * LS;
    const NMAT = D.MATERIALES;
    const EM = D.RELIEVE_ELEV_MAX * DEG, sinEM = Math.sin(EM), cosEM = Math.cos(EM);
    const RIN = 1 - D.LIMB_AA / R, ROUT = 1 + D.LIMB_AA / R;
    const SP = D.SPACE;

    // Rejilla de trabajo: código de LUT por píxel (para la limpieza).
    const cod = new Int32Array(S * S).fill(-1);
    const cod2 = new Int32Array(S * S);

    // Lo que no depende del giro ni de la luz, por píxel del disco: posición
    // en la esfera, cobertura del borde y oscurecimiento del limbo.
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

    // Un fotograma con la Luna vista desde (lat0, lon0), luz de fase `fase`,
    // exposición `expo` y tono frío `frio`, como pasada_lenta() + colorear()
    // del generador (sin sombras proyectadas, con una muestra por píxel).
    function calcular(lat0, lon0, fase, lado, expo, frio) {
      const f = fase * DEG, a = D.SOL_ARR * DEG;
      let SX = lado * Math.sin(f) * Math.cos(a), SY = Math.sin(f) * Math.sin(a), SZ = Math.cos(f);
      const sn0 = Math.sqrt(SX * SX + SY * SY + SZ * SZ);
      SX /= sn0; SY /= sn0; SZ /= sn0;
      const sl0 = Math.sin(lat0 * DEG), cl0 = Math.cos(lat0 * DEG);
      const ay = cl0, az = sl0;                  // eje de giro en vista (x = 0)
      const lonOff = lon0 + 180;
      const jNoche = Math.round(Math.log(D.NOCHE * expo) / LN * LS);   // la sombra no pasa de la luz cenicienta
      const paso = D.FRIO_MAX > 0 ? Math.round(frio / D.FRIO_MAX * D.FRIO_PASOS) : 0;
      const base = paso * NMAT;
      for (let n = 0; n < NP; n++) {
        const ux = pX[n], uy = pY[n], uz = pZ[n];
        const yy = uy * cl0 + uz * sl0, zz = uz * cl0 - uy * sl0;
        const clatR = Math.sqrt(Math.max(0, 1 - yy * yy));   // coseno de la latitud
        const clat = clatR > 0.02 ? clatR : 0.02;
        // huella del píxel en celdas de longitud del nivel 0 -> nivel de mipmap
        const foot = CELDA0 / clat;
        let L = 0;
        if (foot > 1) { L = 1; let fm = 2; while (fm < foot && L < NIV - 1) { fm *= 2; L++; } }
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
        bright *= pLimb[n] * expo;
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
            if (lamS > sinEM) {                  // relieve rasante: el sol no sube de RELIEVE_ELEV_MAX
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
          if (j < jNoche) j = jNoche;
        }
        j -= KMIN;
        j = j < 0 ? 0 : j >= KN ? KN - 1 : j;
        cod[pIdx[n]] = (base + m) * KN + j;
      }
      // limpieza: como _limpiar() del generador, dos pasadas
      let src = cod, dst = cod2;
      for (let pasada = 0; pasada < 2; pasada++) {
        dst.set(src);
        for (let yy = 1; yy < S - 1; yy++) {
          for (let xx = 1; xx < S - 1; xx++) {
            const p = yy * S + xx, v = src[p];
            if (v < 0) continue;
            const a1 = src[p - S], b1 = src[p + S], c1 = src[p - 1], d1 = src[p + 1];
            if (a1 < 0 || b1 < 0 || c1 < 0 || d1 < 0 || v === a1 || v === b1 || v === c1 || v === d1) continue;
            if ((a1 === b1 && (a1 === c1 || a1 === d1)) || (a1 === c1 && a1 === d1)) dst[p] = a1;
            else if (b1 === c1 && b1 === d1) dst[p] = b1;
          }
        }
        const t = src; src = dst; dst = t;
      }
      for (let n = 0; n < NP; n++) {
        const p = pIdx[n];
        let col = lut[src[p]];
        const t = pCov[n];
        if (t < 1) {
          const r0 = col & 255, g0 = (col >> 8) & 255, b0 = (col >> 16) & 255;
          col = (255 << 24) | (Math.round(SP[2] + (b0 - SP[2]) * t) << 16)
            | (Math.round(SP[1] + (g0 - SP[1]) * t) << 8) | Math.round(SP[0] + (r0 - SP[0]) * t);
        }
        buf[p] = col;
      }
    }

    const lerp = (x, y, t) => x + (y - x) * t;
    // Vista intermedia `e` (0..1) entre las caras A y B. La longitud avanza
    // siempre en el mismo sentido (SENTIDO), también al volver.
    function pintar(A, B, e) {
      const dLon = (((B.lon0 - A.lon0) * SENTIDO % 360) + 360) % 360 * SENTIDO;
      calcular(lerp(A.lat0, B.lat0, e), A.lon0 + dLon * e, lerp(A.fase, B.fase, e), A.lado,
        lerp(A.exposicion, B.exposicion, e), lerp(A.frio, B.frio, e));
      ctx.putImageData(img, 0, 0);
    }
    function calentar() {
      const c = D.caras[actual];
      calcular(c.lat0, c.lon0, c.fase, c.lado, c.exposicion, c.frio);   // sin putImageData: no se ve
    }
    return { pintar, calentar };
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const otra = (c) => (c === "visible" ? "oculta" : "visible");

  async function girar(destino = otra(actual)) {
    if (destino === actual || girando) return;
    girando = true;
    alEmpezar(destino);
    const termina = () => {
      raf = 0;
      girando = false;
      actual = destino;
      pintarCara(actual);
      alTerminar(actual);
    };
    if (reduce.matches) return termina();       // sin movimiento: cambio directo
    const g = await preparar();
    if (!vivo) return;
    const A = D.caras[actual], B = D.caras[destino];
    const t0 = performance.now();
    const paso = (ahora) => {
      if (!vivo) return;
      const t = Math.min(1, (ahora - t0) / (duracion * 1000));
      if (t >= 1) return termina();
      g.pintar(A, B, easeInOut(t));
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  }

  // Banco de pruebas: fotograma intermedio `e` (0..1) desde la cara actual, y
  // cuánto tarda uno en ms.
  async function fotograma(e) {
    const g = await preparar();
    g.pintar(D.caras[actual], D.caras[otra(actual)], e);
  }
  async function medir() {
    const g = await preparar();
    const t0 = performance.now();
    g.pintar(D.caras[actual], D.caras[actual], 0);
    return performance.now() - t0;
  }

  function desmontar() {
    vivo = false;
    if (raf) cancelAnimationFrame(raf);
  }

  return { girar, cara: () => actual, girando: () => girando, medir, pintarCara, fotograma, desmontar };
}
