// Modo «Pixel» del visor de maquetas: la misma escena 3D pintada en directo a
// baja resolución, como pixel art. Cada pieza lleva una paleta corta (cuatro
// tonos) y la luz se reparte en escalones, con tramado en el paso de uno a
// otro; luego una pasada añade el contorno
// de 1 px por fuera y oscurece donde la profundidad salta y en la junta entre
// dos piezas (separa el cuerpo del ala). Se gira y se acerca como la maqueta, y al acercarse gana detalle.
// Pixel HD (docs/uas-hd.md): en los drones con HD, la escena se pinta
// con la luz, los colores y las calcas del HD y esta pasada final la pasa a
// pixel art: tono de pantalla (ACES, como el HD), luz en escalones con tramado
// en las curvas y el mismo contorno.
import {
  DepthTexture, Mesh, NearestFilter, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, Vector3, WebGLRenderTarget, DoubleSide, HalfFloatType,
  type PerspectiveCamera, type WebGLRenderer,
} from "three";

// Tamaño de un píxel de arte, en píxeles CSS (en el pixel HD, 1).
export const TAM_PIXEL = 2;

import type { Paleta } from "./uas-paletas";
export type { Paleta };

// Los hex van tal cual (sRGB) al shader, sin la conversión a lineal de Color:
// la salida tampoco se convierte, así los tonos quedan exactos.
const aVector = (hex: string) =>
  new Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

// Material de una pieza: luz fija respecto a la cámara (arriba a la izquierda
// y algo por delante), cuatro escalones. marca: número de la pieza, que va en
// el canal alfa (de 0,55 a 1) para que la pasada final marque las juntas
// entre piezas distintas; 1 = sin juntas (los anillos del fuselaje).
export const marcaPieza = (i: number, sinJuntas = false) => (sinJuntas ? 1 : 0.55 + (i % 110) / 255);
export function materialPixel(paleta: Paleta, marca = 1) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { paleta: { value: paleta.map(aVector) }, marca: { value: marca } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 paleta[4];
      uniform float marca;
      varying vec3 vNormal;
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        float luz = 0.18 + 0.82 * max(dot(n, normalize(vec3(-0.45, 0.8, 0.4))), 0.0);
        // Tramado 2x2 (Bayer): cerca del paso entre dos tonos, los píxeles se
        // alternan en damero en vez de cortar en seco. Solo en superficies
        // curvas (donde la luz cambia de un píxel a otro): en una cara plana
        // que cae justo en el paso, dibujaría rayas.
        vec2 p = mod(floor(gl_FragCoord.xy), 2.0);
        float curva = clamp(fwidth(luz) * 60.0, 0.0, 1.0);
        luz += (p.x == p.y ? (p.x == 0.0 ? -0.375 : 0.125) : (p.x == 0.0 ? 0.375 : -0.125)) * 0.09 * curva;
        vec3 c = paleta[0];
        if (luz > 0.78) c = paleta[3];
        else if (luz > 0.5) c = paleta[2];
        else if (luz > 0.25) c = paleta[1];
        gl_FragColor = vec4(c, marca);
      }`,
  });
}

export function ponerPaleta(m: ShaderMaterial, paleta: Paleta) {
  m.uniforms.paleta.value = paleta.map(aVector);
}

export function crearPixelado(renderer: WebGLRenderer) {
  const destino = new WebGLRenderTarget(1, 1, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthTexture: new DepthTexture(1, 1),
    // Media precisión: la luz del HD pasa de 1 al sol y el tono de pantalla
    // se aplica aquí, en la pasada final.
    type: HalfFloatType,
  });
  // Pasada final: el dibujo pequeño ampliado sin suavizar, con el contorno.
  const final = new ShaderMaterial({
    transparent: true,
    uniforms: {
      tColor: { value: destino.texture },
      tProf: { value: destino.depthTexture },
      paso: { value: new Vector2() },
      contorno: { value: new Vector3() },
      cerca: { value: 0.05 },
      lejos: { value: 50 },
      hd: { value: 0 },
      exposicion: { value: 0.95 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      #include <packing>
      uniform sampler2D tColor;
      uniform sampler2D tProf;
      uniform vec2 paso;
      uniform vec3 contorno;
      uniform float cerca;
      uniform float lejos;
      uniform float hd;
      uniform float exposicion;
      varying vec2 vUv;
      float distancia(vec2 uv) {
        return -perspectiveDepthToViewZ(texture2D(tProf, uv).x, cerca, lejos);
      }
      // Tono de pantalla del HD (el ACES de Three.js) y paso a sRGB: en un
      // destino intermedio Three.js no los aplica.
      vec3 rrt(vec3 v) {
        vec3 a = v * (v + 0.0245786) - 0.000090537;
        vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
        return a / b;
      }
      vec3 tono(vec3 c) {
        if (hd < 0.5) return c;
        const mat3 entrada = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
        const mat3 salida = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
        c = clamp(salida * rrt(entrada * (c * exposicion / 0.6)), 0.0, 1.0);
        return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
      }
      float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
      // Luz en escalones conservando el color: se cuantiza la luminosidad y
      // el color se escala a ella. Con siete escalones, el gris del MQ-9 al
      // sol (luminosidad ~0,8) cae en el centro de uno: si cae en el borde, el
      // ala sale a franjas. Sin tramado: con la luz del HD (el reflejo del
      // cielo cambia un pelo de un píxel a otro) dibujaba rayas en las caras
      // planas y puntos sueltos por todo el dron.
      const float NIVELES = 7.0;
      float nivel(vec3 c) { return clamp(floor(luma(c) * NIVELES), 0.0, NIVELES - 1.0); }
      vec3 aNivel(vec3 c, float k) {
        float l = luma(c);
        if (l < 0.002) return c;
        return clamp(c * (((k + 0.5) / NIVELES) / l), 0.0, 1.0);
      }
      void main() {
        vec2 v[4];
        v[0] = vec2(paso.x, 0.0); v[1] = vec2(-paso.x, 0.0);
        v[2] = vec2(0.0, paso.y); v[3] = vec2(0.0, -paso.y);
        vec4 c = texture2D(tColor, vUv);
        if (c.a < 0.5) {
          // En el pixel HD, lo que tiene uno o dos píxeles de grueso (el ala
          // vista de frente, las colas, las patas) no lleva contorno: con él,
          // una raya fina salía como una barra negra de cuatro píxeles.
          for (int i = 0; i < 4; i++)
            if (texture2D(tColor, vUv + v[i]).a > 0.5 && (hd < 0.5 ||
                (texture2D(tColor, vUv + 2.0 * v[i]).a > 0.5 && texture2D(tColor, vUv + 3.0 * v[i]).a > 0.5))) {
              gl_FragColor = vec4(contorno, 1.0);
              return;
            }
          gl_FragColor = vec4(0.0);
          return;
        }
        c.rgb = tono(c.rgb);
        if (hd > 0.5) {
          // Limpieza: un píxel suelto, rodeado por los cuatro lados de un
          // mismo escalón que se lleva uno con el suyo, toma el color de al
          // lado (si no, el lomo sale salpicado de puntos). Los que se
          // diferencian más (una luz roja, una calca) se quedan.
          float k = nivel(c.rgb), kn = -1.0;
          vec3 vecino = c.rgb;
          bool suelto = true;
          for (int i = 0; i < 4; i++) {
            vec4 n = texture2D(tColor, vUv + v[i]);
            vec3 nt = tono(n.rgb);
            float kk = nivel(nt);
            if (n.a < 0.5 || (kn >= 0.0 && kk != kn)) { suelto = false; break; }
            kn = kk;
            vecino = nt;
          }
          c.rgb = suelto && abs(kn - k) == 1.0 ? aNivel(vecino, kn) : aNivel(c.rgb, k);
        }
        // Salto de profundidad: línea fuerte en lo que queda detrás. Junta
        // entre dos piezas (el ala que entra en el fuselaje): línea más
        // suave, también en la que queda detrás.
        float d = distancia(vUv);
        float mezcla = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 uv = vUv + v[i];
          vec4 n = texture2D(tColor, uv);
          if (n.a < 0.5) continue;
          float dn = distancia(uv);
          if (d - dn > 0.07) { mezcla = 0.6; break; }
          if (c.a < 0.998 && n.a < 0.998 && abs(c.a - n.a) > 0.002 && d > dn) mezcla = 0.45;
        }
        // En el pixel HD, las líneas de dentro son el tono de la pieza más
        // oscuro, no negro: en negro, las juntas del ala pesaban mucho más
        // que en el HD y las piezas oscuras (los lanzadores) se volvían un
        // borrón. Salto de profundidad (el ala delante del cuerpo), bien
        // oscuro; junta entre piezas (flaps, alerones), más suave. El
        // contorno de fuera sigue en negro.
        if (hd > 0.5) {
          c.rgb *= mezcla > 0.5 ? 0.55 : mezcla > 0.0 ? 0.75 : 1.0;
          // Lo fino (uno o dos píxeles de grueso), sin contorno, más oscuro
          // para que se lea como raya (en el HD, el ala de frente es una raya
          // gris oscura).
          bool d0 = texture2D(tColor, vUv + v[0]).a < 0.5, d1 = texture2D(tColor, vUv + v[1]).a < 0.5;
          bool d2 = texture2D(tColor, vUv + v[2]).a < 0.5, d3 = texture2D(tColor, vUv + v[3]).a < 0.5;
          bool finoX = (d0 && (d1 || texture2D(tColor, vUv + 2.0 * v[1]).a < 0.5)) || (d1 && texture2D(tColor, vUv + 2.0 * v[0]).a < 0.5);
          bool finoY = (d2 && (d3 || texture2D(tColor, vUv + 2.0 * v[3]).a < 0.5)) || (d3 && texture2D(tColor, vUv + 2.0 * v[2]).a < 0.5);
          if (finoX || finoY) c.rgb *= 0.5;
        }
        else c.rgb = mix(c.rgb, contorno, mezcla);
        gl_FragColor = vec4(c.rgb, 1.0);
      }`,
  });
  const escenaFinal = new Scene();
  escenaFinal.add(new Mesh(new PlaneGeometry(2, 2), final));
  const camaraFinal = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tam = new Vector2();
  let tamPixel = TAM_PIXEL;

  return {
    ponerContorno(hex: string) { final.uniforms.contorno.value = aVector(hex); },
    ponerHD(si: boolean, tamano = TAM_PIXEL) {
      final.uniforms.hd.value = si ? 1 : 0;
      // Cada píxel de arte, un número entero de píxeles de la pantalla.
      const r = renderer.getPixelRatio();
      tamPixel = Math.max(1, Math.round(tamano * r)) / r;
    },
    pintar(escena: Scene, camara: PerspectiveCamera) {
      renderer.getSize(tam);
      const ancho = Math.max(1, Math.floor(tam.x / tamPixel));
      const alto = Math.max(1, Math.floor(tam.y / tamPixel));
      destino.setSize(ancho, alto);
      final.uniforms.paso.value.set(1 / ancho, 1 / alto);
      final.uniforms.cerca.value = camara.near;
      final.uniforms.lejos.value = camara.far;
      renderer.setRenderTarget(destino);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(escena, camara);
      renderer.setRenderTarget(null);
      renderer.clear();
      // Justo un múltiplo entero del dibujo, centrado: píxeles iguales.
      const x = Math.floor((tam.x - ancho * tamPixel) / 2);
      const y = Math.floor((tam.y - alto * tamPixel) / 2);
      renderer.setViewport(x, y, ancho * tamPixel, alto * tamPixel);
      renderer.render(escenaFinal, camaraFinal);
      renderer.setViewport(0, 0, tam.x, tam.y);
    },
    dispose() {
      destino.depthTexture?.dispose();
      destino.dispose();
      final.dispose();
    },
  };
}
