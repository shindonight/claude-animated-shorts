// Two-tone shading for Subaru short (adapted from bridge)
import * as THREE from "three";

/** uShadeCol (rgb), uShadeLift (rgb), uLambert (float), uSideK (float), uTerm (float), uBounce (rgb), uSat (float) */
export const TONE = {
  uLitCol: { value: new THREE.Color() },
  uShadeCol: { value: new THREE.Color() },
  uShadeLift: { value: new THREE.Color() },
  uLambert: { value: 0.5 },
  uSideK: { value: 0.3 },
  uTerm: { value: 0.15 },
  uBounce: { value: new THREE.Vector3(1, 1, 1) },
  uSat: { value: 1.0 },
};
/** Character card shading uniforms */
export const CHAR = {
  uCharTint: { value: new THREE.Color(1, 1, 1) },
  uCharShade: { value: 0.4 },
  uCharGrad: { value: 0.6 },
  uBodyGrad: { value: 0.7 },
  uSideTint: { value: new THREE.Color(1, 1, 1) },
};
/** Light-facing blend for water shader */
export const LFB = `
  vec3 L = normalize(lightDirection);
  float NdotL = max(dot(normal, L), 0.0);
  float sunVis = smoothstep(0.0, 0.3, NdotL);
`;

export const twoTone = (base: THREE.MeshLambertMaterial | THREE.MeshPhongMaterial) => {
  base.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, TONE);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\n  uniform vec3 uLitCol, uShadeCol, uShadeLift;\n  uniform float uLambert, uSideK, uTerm, uSat;\n  uniform vec3 uBounce;\n  varying float vLambert;")
      .replace("#include <map_fragment>", "")
      .replace("#include <lights_lambert_vertex>", `
        #include <lights_lambert_vertex>
        vLambert = max(dot(normalize(transformedNormal), lightDirection), 0.0);
      `)
      .replace("#include <lights_fragment_begin>", `
        #include <lights_fragment_begin>
        float L = vLambert;
        float side = max(dot(normalize(transformedNormal), vec3(lightDirection.x, 0.0, lightDirection.z)), 0.0);
        float shade = uShadeLift.r + (1.0 - uShadeLift.r) * (1.0 - smoothstep(uLambert, 1.0, L + uSideK * side));
        shade = pow(shade, uTerm);
        vec3 col = mix(uLitCol, uShadeCol, shade);
        col *= uBounce;
        float sat = uSat;
        col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, sat);
        diffuseColor.rgb = col;
      `)
      .replace("#include <lights_fragment_end>", "");
    base.customProgramCacheKey = () => "twotone1";
  };
  return base;
};

/** Untone a display-referred hex to linear for the sky shader */
export const untone = (hex: string, out: THREE.Color) => {
  const c = new THREE.Color(hex);
  const lin = (x: number) => x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  out.set(lin(c.r), lin(c.g), lin(c.b));
};