// Character card shading - lit by scene light (not emissive)
import * as THREE from "three";
import { CHAR } from "./shade";

export const cardShade = (base: THREE.MeshBasicMaterial) => {
  base.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, CHAR);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\n  uniform vec3 uCharTint, uSideTint;\n  uniform float uCharShade, uCharGrad, uBodyGrad;\n  varying vec3 vNormal;")
      .replace("#include <project_vertex>", "#include <project_vertex>\n  vNormal = normalize(normalMatrix * normal);")
      .replace("#include <map_fragment>", `
        #include <map_fragment>
        vec3 N = vNormal;
        float L = max(dot(N, vec3(0.5, 0.8, 0.3)), 0.0); // approximate scene light dir
        float side = max(dot(N, vec3(0.5, 0.0, 0.3)), 0.0);
        float shade = uCharShade + (1.0 - uCharShade) * (1.0 - smoothstep(0.3, 1.0, L + 0.5 * side));
        shade = pow(shade, uCharGrad);
        vec3 col = mix(uCharTint, vec3(0.3, 0.25, 0.35), shade);
        // body gradient (darker at feet)
        float bodyG = vUv.y;
        col = mix(col, col * 0.7, uBodyGrad * (1.0 - bodyG));
        // side tint
        col = mix(col, col * uSideTint, 0.3 * side);
        diffuseColor.rgb *= col;
      `);
    base.customProgramCacheKey = () => "cardshade1";
  };
  return base;
};