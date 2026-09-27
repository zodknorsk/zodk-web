// Modo «Pixel» del visor de maquetas: la misma escena 3D pintada en directo a
// baja resolución, como pixel art. Cada pieza lleva una paleta corta (cuatro
// tonos) y la luz se reparte en escalones, con tramado en el paso de uno a
// otro; luego una pasada añade el contorno
// de 1 px por fuera y oscurece donde la profundidad salta (separa el cuerpo
// del ala). Se gira y se acerca como la maqueta, y al acercarse gana detalle.
import {
  DepthTexture, Mesh, NearestFilter, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, Vector3, WebGLRenderTarget, DoubleSide,
  type PerspectiveCamera, type WebGLRenderer,
} from "three";

// Tamaño de un píxel de arte, en píxeles CSS.
export const TAM_PIXEL = 2;

import type { Paleta } from "./uas-paletas";
export type { Paleta };

// Los hex van tal cual (sRGB) al shader, sin la conversión a lineal de Color:
// la salida tampoco se convierte, así los tonos quedan exactos.
const aVector = (hex: string) =>
  new Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

// Material de una pieza: luz fija respecto a la cámara (arriba a la izquierda
// y algo por delante), cuatro escalones.
export function materialPixel(paleta: Paleta) {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { paleta: { value: paleta.map(aVector) } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 paleta[4];
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
        gl_FragColor = vec4(c, 1.0);
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
      varying vec2 vUv;
      float distancia(vec2 uv) {
        return -perspectiveDepthToViewZ(texture2D(tProf, uv).x, cerca, lejos);
      }
      void main() {
        vec2 v[4];
        v[0] = vec2(paso.x, 0.0); v[1] = vec2(-paso.x, 0.0);
        v[2] = vec2(0.0, paso.y); v[3] = vec2(0.0, -paso.y);
        vec4 c = texture2D(tColor, vUv);
        if (c.a < 0.5) {
          for (int i = 0; i < 4; i++)
            if (texture2D(tColor, vUv + v[i]).a > 0.5) { gl_FragColor = vec4(contorno, 1.0); return; }
          gl_FragColor = vec4(0.0);
          return;
        }
        float d = distancia(vUv);
        for (int i = 0; i < 4; i++) {
          vec2 uv = vUv + v[i];
          if (texture2D(tColor, uv).a > 0.5 && d - distancia(uv) > 0.2) { c.rgb = mix(c.rgb, contorno, 0.6); break; }
        }
        gl_FragColor = vec4(c.rgb, 1.0);
      }`,
  });
  const escenaFinal = new Scene();
  escenaFinal.add(new Mesh(new PlaneGeometry(2, 2), final));
  const camaraFinal = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tam = new Vector2();

  return {
    ponerContorno(hex: string) { final.uniforms.contorno.value = aVector(hex); },
    pintar(escena: Scene, camara: PerspectiveCamera) {
      renderer.getSize(tam);
      const ancho = Math.max(1, Math.floor(tam.x / TAM_PIXEL));
      const alto = Math.max(1, Math.floor(tam.y / TAM_PIXEL));
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
      const x = Math.floor((tam.x - ancho * TAM_PIXEL) / 2);
      const y = Math.floor((tam.y - alto * TAM_PIXEL) / 2);
      renderer.setViewport(x, y, ancho * TAM_PIXEL, alto * TAM_PIXEL);
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
