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
// El giro (17-sep-2026, rehecho: antes giraba e inclinaba a la vez, rápido, y
// la luz se apagaba en mitad del movimiento):
// - UNA sola rotación de verdad de una orientación a la otra, alrededor de un
//   único eje (de la visible a la oculta sale un eje casi vertical, inclinado
//   15° hacia quien mira), siempre hacia el mismo lado (SENTIDO);
// - suave (`duracion`, 2,8 s, arranque y frenada en seno);
// - la fase de la luz, la exposición y el tono frío pasan de una cara a la
//   otra a la vez que gira: se va oscureciendo (o aclarando) según rota.
//   (Se probó que la exposición llegara al final, como una cámara que se
//   adapta: el usuario lo prefiere a la vez que el giro.)
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
export const LUNA_V = 3;

const DEG = Math.PI / 180;
// Sentido del giro, el mismo a la ida y a la vuelta: 1 = la superficie se
// mueve hacia la izquierda, -1 = hacia la derecha (elegido por el usuario).
const SENTIDO = -1;

// --- Orientaciones como matrices 3x3 (filas). Una cara se ve desde (lat0,
// lon0): la matriz pasa de coordenadas de vista (x derecha, y arriba, z hacia
// quien mira) a las de la Luna (y = norte, z = lon 0 en el ecuador, x = lon
// 90° E): M = Ry(lon0) · Rx(lat0).
const mul3 = (A, B) => A.map((f) => [0, 1, 2].map((j) => f[0] * B[0][j] + f[1] * B[1][j] + f[2] * B[2][j]));
const tras3 = (A) => [0, 1, 2].map((i) => [A[0][i], A[1][i], A[2][i]]);
function orientacion(lat0, lon0) {
  const a = lat0 * DEG, b = lon0 * DEG, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  return mul3([[cb, 0, sb], [0, 1, 0], [-sb, 0, cb]], [[1, 0, 0], [0, ca, sa], [0, -sa, ca]]);
}
// Rotación de ángulo `phi` alrededor del eje unitario n (Rodrigues).
function rotEje(n, phi) {
  const c = Math.cos(phi), s = Math.sin(phi), k = 1 - c, [x, y, z] = n;
  return [
    [c + x * x * k, x * y * k - z * s, x * z * k + y * s],
    [y * x * k + z * s, c + y * y * k, y * z * k - x * s],
    [z * x * k - y * s, z * y * k + x * s, c + z * z * k],
  ];
}
// Trayecto de la cara A a la B: eje y ángulo de la rotación D = MB·MAᵀ, con
// el ángulo elegido (θ o θ - 2π, las dos llegan) para girar según SENTIDO.
function trayecto(A, B) {
  const MA = orientacion(A.lat0, A.lon0), MB = orientacion(B.lat0, B.lon0);
  const Dm = mul3(MB, tras3(MA));
  const tr = Dm[0][0] + Dm[1][1] + Dm[2][2];
  const th = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  let n;
  if (Math.sin(th) > 1e-3) {
    const d = 2 * Math.sin(th);
    n = [(Dm[2][1] - Dm[1][2]) / d, (Dm[0][2] - Dm[2][0]) / d, (Dm[1][0] - Dm[0][1]) / d];
  } else {                                        // media vuelta exacta: eje desde la diagonal
    n = [0, 1, 2].map((i) => Math.sqrt(Math.max(0, (Dm[i][i] + 1) / 2)));
    const g = n.indexOf(Math.max(...n));
    for (let i = 0; i < 3; i++) if (i !== g && Dm[g][i] + Dm[i][g] < 0) n[i] = -n[i];
  }
  // ¿Hacia dónde va en pantalla, con ángulo positivo, el punto del centro?
  const P0 = [MA[0][2], MA[1][2], MA[2][2]];      // MA·(0,0,1)
  const nxP = [n[1] * P0[2] - n[2] * P0[1], n[2] * P0[0] - n[0] * P0[2], n[0] * P0[1] - n[1] * P0[0]];
  const vx = -(MA[0][0] * nxP[0] + MA[1][0] * nxP[1] + MA[2][0] * nxP[2]);   // x de MAᵀ·(-(n × P0))
  const derecha = vx > 0;
  const phiFin = derecha === (SENTIDO < 0) ? th : th - 2 * Math.PI;
  return { MA, n, phiFin };
}
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
  duracion = 2.8,
  alEmpezar = () => {},
  alTerminar = () => {},
} = {}) {
  const P = await cargarLuna(base);
  const { D } = P;
  const S = D.SIZE, R = D.RADIUS, C = S / 2, MH = D.MAPA_H;
  const ctx = canvas.getContext("2d");
  let actual = inicial, raf = 0, girando = false, vivo = true;

  // La Luna (600 px de arte) se amplía al dibujarla en el lienzo visible, sin
  // suavizado. El canvas NO era de 600 px ampliado por CSS porque Firefox/Zen
  // lo suavizaba igual: se veía con menos detalle, más cuanto más grande. Si se
  // ve más pequeña que 600, suavizada (reducir sin suavizado pierde píxeles).
  //
  // Pero tampoco va a los píxeles exactos de la pantalla: se queda en un
  // múltiplo ENTERO del arte y como mucho ×3, y lo que falte lo amplía el CSS,
  // o sea la GPU al componer, que sale gratis. Es el mismo arreglo que la
  // portada (src/scripts/planeta.js, 20-sep-2026): allí el volcado costaba
  // 7,1 ms por fotograma a ×5 y 3,8 a ×3, y el usuario no vio diferencia de
  // nitidez. Aquí se notaba en el giro, que es lo que más calienta de /luna.
  // Ver temperatura-zen.md.
  const LADO_MAX = 2400, MULT_MAX = 3;
  let lado = 0;
  const fuente = document.createElement("canvas");   // fotograma del giro a 600 px, antes de ampliar
  fuente.width = fuente.height = S;
  const fuenteCtx = fuente.getContext("2d");
  function vuelca(origen) {
    ctx.imageSmoothingEnabled = lado < S;
    ctx.imageSmoothingQuality = "high";
    // "copy" sustituye lo que había: una pasada de relleno en vez de dos
    // (clearRect + drawImage), con el mismo resultado.
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(origen, 0, 0, lado, lado);
    ctx.globalCompositeOperation = "source-over";
  }
  function pintarCara(nombre) {
    vuelca(P.caras[nombre]);
  }
  function ajusta() {
    const w = Math.round(canvas.getBoundingClientRect().width * (window.devicePixelRatio || 1));
    const bruto = Math.min(LADO_MAX, w > 0 ? w : S);
    const k = Math.min(MULT_MAX, Math.floor(bruto / S));
    const nuevo = k >= 2 ? k * S : bruto;            // por debajo de ×2, el tamaño exacto de pantalla
    if (nuevo === lado) return;
    lado = canvas.width = canvas.height = nuevo;   // (cambiar el tamaño borra el lienzo)
    if (!girando) pintarCara(actual);
  }
  ajusta();
  const observa = new ResizeObserver(() => ajusta());
  observa.observe(canvas);

  // Lo del giro se prepara en un rato libre (o al pulsar, si llega antes).
  let preparando = null;
  const preparar = () => (preparando ??= cargarGiro(base, D).then(montarGiro));
  const libre = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  libre(() => preparar().then((g) => {
    // El primer fotograma en tiempo real tarda varias veces más (el navegador
    // aún no ha optimizado el bucle): se hace uno sin enseñarlo.
    if (vivo && !girando) g.calentar();
  }));

  const lerp = (x, y, t) => x + (y - x) * t;

  function montarGiro({ niveles, lut }) {
    const img = fuenteCtx.createImageData(S, S);
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
    const pZ = Float32Array.from(vz), pCov = Float32Array.from(cv);
    const INV_LN_LS = LS / LN, INV_LN_RK = D.RELIEVE_K / LN;
    const NIV = niveles.length, CELDA0 = D.MAPA_W / 360 / DEG / R;   // celdas de longitud que abarca un píxel en el ecuador
    // Todos los niveles de mipmap seguidos en un solo array por dato (leer de
    // objetos en cada píxel era de lo que más pesaba en Firefox).
    const nvOff = new Int32Array(NIV), nvW = new Int32Array(NIV);
    let totalCeldas = 0;
    niveles.forEach((nv, L) => { nvOff[L] = totalCeldas; nvW[L] = nv.w; totalCeldas += nv.w * MH; });
    const MAT = new Uint8Array(totalCeldas), NE = new Int8Array(totalCeldas), NN = new Int8Array(totalCeldas);
    niveles.forEach((nv, L) => { MAT.set(nv.mat, nvOff[L]); NE.set(nv.ne, nvOff[L]); NN.set(nv.nn, nvOff[L]); });
    for (let i = 0; i < totalCeldas; i++) MAT[i] = ((MAT[i] + 20) / 40) | 0;   // media ×40 -> material
    // Escalón de relieve round(log(ratio)·k) por tabla directa: ratio de 0 a
    // 4 en pasos de 1/KR_PASO (por encima de 4 ya es el máximo).
    const KR_PASO = 1024, KR_N = 4 * KR_PASO;
    const KREL = new Int8Array(KR_N);
    for (let i = 0; i < KR_N; i++) {
      const k = Math.round(Math.log(Math.max(i + 0.5, 0.5) / KR_PASO) * INV_LN_RK);
      KREL[i] = k < D.RELIEVE_MIN ? D.RELIEVE_MIN : k > D.RELIEVE_MAX ? D.RELIEVE_MAX : k;
    }
    const INV127 = 1 / 127, INV_2PI = 1 / (2 * Math.PI);

    // Tablas para no hacer en cada píxel lo más caro (en Firefox/Zen el giro
    // iba a 20-22 ms por fotograma y en Chrome a 12; con esto, 7-9 en los dos):
    // - brillo por terminador (smooth + log) según lamS, de -1 a 1;
    const TN = 4096, TH = TN / 2;
    const TERM_J = new Float32Array(TN + 1);
    for (let i = 0; i <= TN; i++) {
      const b = D.NOCHE + (1 - D.NOCHE) * smooth(D.TERM_A, D.TERM_B, i / TH - 1);
      TERM_J[i] = Math.log(b > 1e-3 ? b : 1e-3) * INV_LN_LS;
    }
    const pLimbJ = Float32Array.from(limb, (l) => Math.log(l) * INV_LN_LS);
    // - fila del mapa (asin) y nivel de mipmap según la coordenada norte.
    //   (El escalón de relieve con un bucle de umbrales en vez de log era más
    //   lento; con tabla directa, KREL más abajo, no.)
    const YN = 8192, YH = YN / 2;
    const FILA = new Int32Array(YN + 1), NIVEL = new Uint8Array(YN + 1), CLAT = new Float32Array(YN + 1);
    for (let i = 0; i <= YN; i++) {
      const y = i / YH - 1;
      const r = ((0.5 - Math.asin(y) / Math.PI) * MH) | 0;
      FILA[i] = r < 0 ? 0 : r >= MH ? MH - 1 : r;
      CLAT[i] = Math.sqrt(Math.max(0, 1 - y * y));
      const cl = Math.max(0.02, CLAT[i]);
      const foot = CELDA0 / cl;                    // huella del píxel en celdas de longitud del nivel 0
      let L = 0;
      if (foot > 1) { L = 1; let fm = 2; while (fm < foot && L < NIV - 1) { fm *= 2; L++; } }
      NIVEL[i] = L;
    }

    // Un fotograma con la Luna en la orientación M (ver orientacion()), luz
    // de fase `fase`, exposición `expo` y tono frío `frio`, como pasada_lenta()
    // + colorear() del generador (sin sombras proyectadas, una muestra por píxel).
    function calcular(M, fase, lado, expo, frio, limpia = true) {
      const f = fase * DEG, a = D.SOL_ARR * DEG;
      let SX = lado * Math.sin(f) * Math.cos(a), SY = Math.sin(f) * Math.sin(a), SZ = Math.cos(f);
      const sn0 = Math.sqrt(SX * SX + SY * SY + SZ * SZ);
      SX /= sn0; SY /= sn0; SZ /= sn0;
      const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = M;
      const ax = m10, ay = m11, az = m12;        // norte de la Luna en vista (Mᵀ·(0,1,0))
      const jNoche = Math.round(Math.log(D.NOCHE * expo) / LN * LS);   // la sombra no pasa de la luz cenicienta
      const expoJ = Math.log(expo) * INV_LN_LS;
      const paso = D.FRIO_MAX > 0 ? Math.round(frio / D.FRIO_MAX * D.FRIO_PASOS) : 0;
      const base = paso * NMAT;
      for (let n = 0; n < NP; n++) {
        const ux = pX[n], uy = pY[n], uz = pZ[n];
        const xx = m00 * ux + m01 * uy + m02 * uz;
        const yy = m10 * ux + m11 * uy + m12 * uz;
        const zz = m20 * ux + m21 * uy + m22 * uz;
        let yi = ((yy + 1) * YH) | 0;
        yi = yi < 0 ? 0 : yi > YN ? YN : yi;
        const L = NIVEL[yi], w = nvW[L];
        // longitud: atan2(xx, zz) aproximado (error < 1e-5 rad), de 0 a 1 vuelta
        const axx = xx < 0 ? -xx : xx, azz = zz < 0 ? -zz : zz;
        const mayor = axx > azz ? axx : azz;
        const q = mayor > 0 ? (axx > azz ? azz : axx) / mayor : 0, q2 = q * q;
        let ang = q * (0.999866 + q2 * (-0.3302995 + q2 * (0.180141 + q2 * (-0.085133 + q2 * 0.0208351))));
        if (axx > azz) ang = 1.5707963 - ang;
        if (zz < 0) ang = 3.1415927 - ang;
        if (xx < 0) ang = -ang;
        let c = ((ang * INV_2PI + 0.5) * w) | 0;
        if (c >= w) c = 0;
        const i = nvOff[L] + FILA[yi] * w + c;
        const m = MAT[i];
        const lamS = ux * SX + uy * SY + uz * SZ;
        let li = ((lamS + 1) * TH) | 0;
        li = li < 0 ? 0 : li > TN ? TN : li;
        let j = Math.floor(TERM_J[li] + pLimbJ[n] + expoJ + 0.5);   // en 1/LS de escalón
        if (lamS > 0) {
          const ne = NE[i] * INV127, nn = NN[i] * INV127;
          const nu = Math.sqrt(Math.max(0, 1 - ne * ne - nn * nn));
          // base local: E = eje x U, N = U x E
          // |eje x U| = coseno de la latitud (tabla)
          const le = 1 / (CLAT[yi] || 1e-9);
          const Ex = (ay * uz - az * uy) * le, Ey = (az * ux - ax * uz) * le, Ez = (ax * uy - ay * ux) * le;
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
            kRel = ratio >= 4 ? D.RELIEVE_MAX : KREL[(ratio * KR_PASO) | 0];
          }
          j += kRel * LS;
          if (j < jNoche) j = jNoche;
        }
        j -= KMIN;
        j = j < 0 ? 0 : j >= KN ? KN - 1 : j;
        cod[pIdx[n]] = (base + m) * KN + j;
      }
      // limpieza: como _limpiar() del generador, dos pasadas sobre las S x S
      // celdas. Es la mitad larga del fotograma, y durante el giro se puede
      // saltar (?giro=sucio): dura 2,8 s y la cara final es un PNG ya limpio.
      let src = cod, dst = cod2;
      for (let pasada = 0; limpia && pasada < 2; pasada++) {
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

    // De la cara A a la B: `e` = cuánto ha girado (0..1), `x` = cuánto ha
    // cambiado la exposición y el tono (0..1; hoy, lo mismo que `e`).
    function pintar(A, B, tray, e, x, limpia = true) {
      const M = mul3(rotEje(tray.n, tray.phiFin * e), tray.MA);
      calcular(M, lerp(A.fase, B.fase, e), A.lado, lerp(A.exposicion, B.exposicion, x), lerp(A.frio, B.frio, x), limpia);
      fuenteCtx.putImageData(img, 0, 0);
      vuelca(fuente);
    }
    function calentar() {
      const c = D.caras[actual];
      calcular(orientacion(c.lat0, c.lon0), c.fase, c.lado, c.exposicion, c.frio);   // sin putImageData: no se ve
    }
    return { pintar, calentar };
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
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
    const A = D.caras[actual], B = D.caras[destino], tray = trayecto(A, B);
    const t0 = performance.now();
    // Tope de fotogramas por segundo: cada uno calcula la Luna entera píxel a
    // píxel (7-9 ms en Zen) y el portátil del usuario va a 120 Hz, así que sin
    // tope el giro pedía ese cálculo 120 veces por segundo y era el pico de
    // consumo de toda la web. A 60 el giro se ve igual. Ver temperatura-zen.md.
    const FPS = 60;
    // Sin las dos pasadas de limpieza: son la mitad larga del fotograma y en un
    // giro de 2,8 s no se ven (probado por el usuario el 20-sep-2026: "con
    // sucio no se nota nada", y la CPU dejó de subir de 50 y algo a 60-64 °C).
    // La cara con la que termina el giro es un PNG ya limpio, así que lo que
    // queda en pantalla al acabar no se ve afectado.
    const limpia = false;
    let ultimo = -1;
    const paso = (ahora) => {
      if (!vivo) return;
      const s = (ahora - t0) / 1000;
      if (s >= duracion) return termina();
      const hueco = Math.floor(s * FPS);
      if (hueco !== ultimo) {
        ultimo = hueco;
        const e = inOutSine(s / duracion);
        g.pintar(A, B, tray, e, e, limpia);
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  }

  // Banco de pruebas: fotograma intermedio `e` (0..1) desde la cara actual, y
  // cuánto tarda uno en ms.
  async function fotograma(e) {
    const g = await preparar();
    const A = D.caras[actual], B = D.caras[otra(actual)];
    g.pintar(A, B, trayecto(A, B), e, e);
  }
  async function medir() {
    const g = await preparar();
    const A = D.caras[actual], B = D.caras[otra(actual)];
    const t0 = performance.now();
    g.pintar(A, B, trayecto(A, B), 0, 0);
    return performance.now() - t0;
  }

  function desmontar() {
    vivo = false;
    if (raf) cancelAnimationFrame(raf);
    observa.disconnect();
  }

  // Dónde cae un punto de la Luna (lat/lon en grados, norte y este +) sobre la
  // cara que se está viendo: en píxeles del lienzo de arte (0..SIZE, los del
  // PNG) y en tanto por uno, que es lo que necesitan las chapas de alunizaje
  // para colocarse encima con el DOM. `vis` es false si el punto cae en la
  // cara de atrás. Misma cuenta que orientacion() y que generar-luna.py.
  function sitio(lat, lon, cara = actual) {
    const { lat0, lon0 } = D.caras[cara];
    const la = lat * DEG, lo = (lon - lon0) * DEG, l0 = lat0 * DEG;
    const xx = Math.cos(la) * Math.sin(lo), yy = Math.sin(la), zz = Math.cos(la) * Math.cos(lo);
    const c0 = Math.cos(l0), s0 = Math.sin(l0);
    const x = C + xx * R, y = C - (yy * c0 - zz * s0) * R;
    return { x, y, u: x / S, v: y / S, vis: yy * s0 + zz * c0 > 0 };
  }

  return { girar, cara: () => actual, girando: () => girando, sitio, medir, pintarCara, fotograma, desmontar };
}
