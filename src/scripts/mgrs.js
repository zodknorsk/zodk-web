// Coordenadas MGRS (Military Grid Reference System) sobre el elipsoide WGS84,
// con precisión de 1 m (5 dígitos por eje): "28R CS 77445 49197".
// Entre 80°S y 84°N es UTM con su cuadrícula de 100 km; en los casquetes
// polares MGRS usa UPS (Universal Polar Stereographic), sin número de zona:
// "Z AH 12345 67890" (norte: Y/Z; sur: A/B).
// Lo usa la coordenada de la portada (portada.ts). El planeta tiene píxeles
// de 20-30 km, así que los últimos dígitos son de adorno, a propósito.

const A = 6378137;                     // semieje mayor WGS84
const F = 1 / 298.257223563;
const E2 = F * (2 - F);
const E = Math.sqrt(E2);
const EP2 = E2 / (1 - E2);
const RAD = Math.PI / 180;

const cinco = (v) => String(Math.floor(v % 100000)).padStart(5, "0");

function utm(lat, lon) {
  let zona = Math.floor((lon + 180) / 6) + 1;
  // Excepciones de la cuadrícula: Noruega y Svalbard
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zona = 32;
  if (lat >= 72) {
    if (lon >= 0 && lon < 9) zona = 31;
    else if (lon >= 9 && lon < 21) zona = 33;
    else if (lon >= 21 && lon < 33) zona = 35;
    else if (lon >= 33 && lon < 42) zona = 37;
  }
  const k0 = 0.9996;
  const lon0 = ((zona - 1) * 6 - 180 + 3) * RAD;
  const p = lat * RAD, l = lon * RAD;
  const sp = Math.sin(p), cp = Math.cos(p), tp = Math.tan(p);
  const N = A / Math.sqrt(1 - E2 * sp * sp);
  const T = tp * tp, C = EP2 * cp * cp, Aa = cp * (l - lon0);
  const M = A * ((1 - E2 / 4 - 3 * E2 ** 2 / 64 - 5 * E2 ** 3 / 256) * p
    - (3 * E2 / 8 + 3 * E2 ** 2 / 32 + 45 * E2 ** 3 / 1024) * Math.sin(2 * p)
    + (15 * E2 ** 2 / 256 + 45 * E2 ** 3 / 1024) * Math.sin(4 * p)
    - (35 * E2 ** 3 / 3072) * Math.sin(6 * p));
  const este = k0 * N * (Aa + (1 - T + C) * Aa ** 3 / 6
    + (5 - 18 * T + T * T + 72 * C - 58 * EP2) * Aa ** 5 / 120) + 500000;
  let norte = k0 * (M + N * tp * (Aa * Aa / 2 + (5 - T + 9 * C + 4 * C * C) * Aa ** 4 / 24
    + (61 - 58 * T + T * T + 600 * C - 330 * EP2) * Aa ** 6 / 720));
  if (lat < 0) norte += 10000000;
  return { zona, este, norte };
}

function ups(lat, lon) {
  const nortep = lat > 0;
  const p = Math.abs(lat) * RAD, l = lon * RAD;
  const es = E * Math.sin(p);
  const t = Math.tan(Math.PI / 4 - p / 2) / Math.pow((1 - es) / (1 + es), E / 2);
  const rho = 2 * A * 0.994 * t / Math.sqrt(Math.pow(1 + E, 1 + E) * Math.pow(1 - E, 1 - E));
  const este = 2000000 + rho * Math.sin(l);
  const norte = nortep ? 2000000 - rho * Math.cos(l) : 2000000 + rho * Math.cos(l);
  return { nortep, este, norte };
}

// Letras de las zonas polares (como en GeographicLib): columnas por zona
// A, B, Y, Z y filas sur/norte, contadas desde 800 km (sur) o 1300 km (norte).
const UPS_COLS = ["JKLPQRSTUXYZ", "ABCFGHJKLPQR", "RSTUXYZ", "ABCFGHJ"];
const UPS_FILAS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "ABCDEFGHJKLMNP"];

/** lat, lon en grados -> texto MGRS con 5 dígitos por eje. */
export function mgrs(lat, lon) {
  if (lat >= 84 || lat < -80) {
    const { nortep, este, norte } = ups(lat, lon);
    const este100 = Math.floor(este / 100000), norte100 = Math.floor(norte / 100000);
    const lado = este >= 2000000 ? 1 : 0;
    const banda = (nortep ? 2 : 0) + lado;
    const minimo = nortep ? 13 : 8;
    const col = UPS_COLS[banda][este100 - (lado ? 20 : minimo)] ?? "?";
    const fila = UPS_FILAS[nortep ? 1 : 0][norte100 - minimo] ?? "?";
    return `${"ABYZ"[banda]} ${col}${fila} ${cinco(este)} ${cinco(norte)}`;
  }
  const { zona, este, norte } = utm(lat, lon);
  const banda = "CDEFGHJKLMNPQRSTUVWXX"[Math.floor((lat + 80) / 8)];
  const col = ["ABCDEFGH", "JKLMNPQR", "STUVWXYZ"][(zona - 1) % 3][Math.floor(este / 100000) - 1];
  const fila = "ABCDEFGHJKLMNPQRSTUV"[(Math.floor(norte / 100000) + (zona % 2 === 0 ? 5 : 0)) % 20];
  return `${zona}${banda} ${col}${fila} ${cinco(este)} ${cinco(norte)}`;
}
