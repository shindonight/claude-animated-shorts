// Color grade effect for Subaru short
import { Effect, EffectPass, BlendFunction } from "postprocessing";
import * as THREE from "three";
import { Uniform } from "three";
import { GRADES, GRADE_STRENGTH } from "./lights";

export { GRADES, GRADE_STRENGTH } from "./lights";

type GradeConfig = { lift: number[]; gamma: number[]; gain: number[]; sat: number };

// Internal effect class for color grading
class GradePass extends Effect {
  private uLift: Uniform;
  private uGamma: Uniform;
  private uGain: Uniform;
  private uSat: Uniform;
  private uStrength: Uniform;

  constructor(grade: GradeConfig, strength: number) {
    const uLift = new Uniform(new THREE.Vector3(...grade.lift));
    const uGamma = new Uniform(new THREE.Vector3(...grade.gamma));
    const uGain = new Uniform(new THREE.Vector3(...grade.gain));
    const uSat = new Uniform(grade.sat);
    const uStrength = new Uniform(strength);

    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform vec3 uLift, uGamma, uGain;
      uniform float uSat, uStrength;
      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord;
        vec3 col = texture2D(tDiffuse, uv).rgb;
        col = col + uLift * uStrength;
        col = pow(col, uGamma * uStrength + vec3(1.0) * (1.0 - uStrength));
        col = col * uGain * uStrength + col * (1.0 - uStrength);
        float gray = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(gray), col, uSat * uStrength + (1.0 - uStrength));
        fragColor = vec4(col, 1.0);
      }
    `;

    super("GradePass", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["tDiffuse", new Uniform(null)],
        ["uLift", uLift],
        ["uGamma", uGamma],
        ["uGain", uGain],
        ["uSat", uSat],
        ["uStrength", uStrength],
      ]),
    });
    this.uLift = uLift;
    this.uGamma = uGamma;
    this.uGain = uGain;
    this.uSat = uSat;
    this.uStrength = uStrength;
  }

  setGrade(grade: GradeConfig, strength: number) {
    this.uLift.value.set(...grade.lift);
    this.uGamma.value.set(...grade.gamma);
    this.uGain.value.set(...grade.gain);
    this.uSat.value = grade.sat;
    this.uStrength.value = strength;
  }
}

export class GradeEffect extends EffectPass {
  private pass: GradePass;

  constructor(grade: GradeConfig, strength: number) {
    const pass = new GradePass(grade, strength);
    super(undefined as any, pass);
    this.pass = pass;
  }

  setGrade(grade: GradeConfig, strength: number) {
    this.pass.setGrade(grade, strength);
  }
}

export const gradeFor = (gradeEffect: GradeEffect, light: keyof typeof GRADES) => {
  gradeEffect.setGrade(GRADES[light], GRADE_STRENGTH[light]);
};