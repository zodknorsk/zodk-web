// El avatar grande de /blog, vivo. Enseña un fotograma de
// public/zodk-avatar-tira.png (arte/generar-avatar.py) encima del GIF, que
// queda debajo para cuando no hay JavaScript. De más a menos importante:
// - Sin tocar nada 30 s, se duerme: cabeza caída, ojos cerrados y zetas. Con
//   cualquier movimiento se despierta.
// - Al pincharle, cabecea dos veces con los ojos cerrados, como con música.
// - Cada 10-20 s, algo al azar: teclea, cabecea un momento o mira al texto.
// - Pestañea cada 2-6 s y, con el ratón cerca (CERCA), mira hacia él; más
//   lejos o encima, al frente.
// Quieto no gasta: solo temporizadores y el movimiento del ratón. Con
// reduced-motion no se monta. Devuelve la función que lo desmonta.
const FOTOS = ["frente", "izquierda", "derecha", "arriba", "abajo", "cerrados", "tecleando", "cabeceo"];
const SUENO = 30000, GOLPE = 300;               // ms sin tocar nada hasta dormirse; medio compás del cabeceo
const CERCA = 1.2;                              // hasta dónde mira al ratón, en anchos del avatar desde su borde
const azar = (a, b) => a + Math.random() * (b - a);

/** @param {HTMLElement} caja */
export function montarAvatar(caja) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const cara = document.createElement("span");
  cara.className = "avatar-cara";
  cara.setAttribute("aria-hidden", "true");

  let mirada = "frente", secuencia = null, parpadeo = false, dormido = false;
  let tSec = 0, tSueno = 0, tAzar = 0, tParpadeo = 0, zetas = 0, vivo = true;
  const pinta = () => {
    const f = dormido ? "cabeceo" : secuencia ?? (parpadeo ? "cerrados" : mirada);
    cara.style.backgroundPosition = `${(FOTOS.indexOf(f) / (FOTOS.length - 1)) * 100}% 0`;
  };

  // Una serie de [fotograma, ms]; corta la que hubiera.
  const haz = (pasos) => {
    clearTimeout(tSec);
    const paso = (i) => {
      if (i >= pasos.length) { secuencia = null; return pinta(); }
      secuencia = pasos[i][0];
      pinta();
      tSec = window.setTimeout(() => paso(i + 1), pasos[i][1]);
    };
    paso(0);
  };
  const alterna = (a, b, ms, n) => Array.from({ length: n }, (_, i) => [i % 2 ? b : a, ms]);

  // Las zetas: suben y se van dentro del cuadro.
  const suelta = (clase, estilo) => {
    const p = document.createElement("span");
    p.className = clase;
    p.setAttribute("aria-hidden", "true");
    Object.assign(p.style, estilo);
    p.addEventListener("animationend", () => p.remove());
    caja.append(p);
  };

  const parpadea = () => {
    tParpadeo = window.setTimeout(() => {
      parpadeo = true;
      pinta();
      window.setTimeout(() => {
        parpadeo = false;
        pinta();
        if (Math.random() < 0.2) {                   // a veces, dos seguidos
          window.setTimeout(() => { parpadeo = true; pinta(); window.setTimeout(() => { parpadeo = false; pinta(); }, 130); }, 160);
        }
      }, 140);
      parpadea();
    }, azar(2000, 6000));
  };

  const algoAlAzar = () => {
    tAzar = window.setTimeout(() => {
      if (!dormido && !secuencia) {
        const cual = Math.floor(Math.random() * 3);
        if (cual === 0) haz(alterna("abajo", "tecleando", 250, 10));   // teclea
        else if (cual === 1) haz(alterna("cerrados", "cabeceo", GOLPE, 8));   // le gusta la canción
        else haz([["derecha", 2200]]);               // mira el texto de al lado
      }
      algoAlAzar();
    }, azar(10000, 20000));
  };

  const duerme = () => {
    dormido = true;
    pinta();
    const z = () => suelta("avatar-z", { "--dx": `${azar(4, 14)}%` });
    z();
    zetas = window.setInterval(z, 1600);
  };
  const actividad = () => {
    clearTimeout(tSueno);
    tSueno = window.setTimeout(duerme, SUENO);
    if (!dormido) return;
    dormido = false;
    clearInterval(zetas);
    pinta();
  };

  const mueve = (e) => {
    actividad();
    if (e.pointerType !== "mouse") return;
    const r = caja.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const fx = Math.abs(dx) - r.width / 2, fy = Math.abs(dy) - r.height / 2;   // fuera del borde, en px
    const dentro = fx < 0 && fy < 0, lejos = Math.max(fx, fy) > CERCA * r.width;
    const m = dentro || lejos ? "frente" : Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "izquierda" : "derecha") : dy < 0 ? "arriba" : "abajo";
    if (m !== mirada) { mirada = m; pinta(); }
  };
  const clic = () => {
    actividad();
    haz(alterna("cabeceo", "cerrados", GOLPE, 4));
  };

  // Se monta cuando la tira ya está cargada: sin hueco entre el GIF y ella.
  const tira = new Image();
  tira.src = "/zodk-avatar-tira.png";
  tira.decode().catch(() => {}).then(() => {
    if (!vivo) return;
    caja.append(cara);
    caja.classList.add("avatar-vivo");
    pinta();
    parpadea();
    algoAlAzar();
    actividad();
    window.addEventListener("pointermove", mueve);
    window.addEventListener("pointerdown", actividad);
    window.addEventListener("keydown", actividad);
    window.addEventListener("scroll", actividad, { passive: true });
    caja.addEventListener("click", clic);
  });

  return () => {
    vivo = false;
    [tSec, tSueno, tAzar, tParpadeo].forEach(clearTimeout);
    clearInterval(zetas);
    window.removeEventListener("pointermove", mueve);
    window.removeEventListener("pointerdown", actividad);
    window.removeEventListener("keydown", actividad);
    window.removeEventListener("scroll", actividad);
    caja.removeEventListener("click", clic);
    caja.classList.remove("avatar-vivo");
    caja.querySelectorAll(".avatar-cara, .avatar-z").forEach((e) => e.remove());
  };
}
