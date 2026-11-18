// Thin-lens depth of field for Subaru short
import { EffectPass, BokehEffect, BlendFunction } from "postprocessing";
import * as THREE from "three";
import { Uniform } from "three";

/** Lens blur with bokeh effect */
export class LensBlur {
  pre: EffectPass;
  main: EffectPass;
  bokeh: BokehEffect;
  focus = 10;
  cInf = 0;

  constructor(opts: { maxCoC: number; nearScale: number }) {
    this.bokeh = new BokehEffect({
      blendFunction: BlendFunction.SCREEN,
      focus: this.focus,
      aperture: 0.1,
      maxBlur: opts.maxCoC,
      dof: opts.nearScale, // nearScale maps to dof in v6
    });
    // EffectPass requires a camera, but we'll set it later
    this.pre = new EffectPass(undefined as any, this.bokeh);
    this.main = new EffectPass(undefined as any, this.bokeh);
  }

  update(camera: THREE.Camera) {
    // Update bokeh uniforms directly
    const uniforms = this.bokeh.uniforms;
    if (uniforms.has("focus")) uniforms.get("focus")!.value = this.focus;
    if (uniforms.has("maxBlur")) uniforms.get("maxBlur")!.value = this.cInf;
    if (uniforms.has("aperture")) uniforms.get("aperture")!.value = this.cInf > 0 ? 0.15 : 0.001;
    if (uniforms.has("dof")) uniforms.get("dof")!.value = 0.02; // default
  }
}

/** Film grain effect (disabled by default) */
export class GrainEffect {
  seed = 0;
  constructor(opts: { amount: number; cellPx: number }) {
    // Placeholder - would use postprocessing NoiseEffect
  }
}