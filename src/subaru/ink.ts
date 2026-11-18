// Ink outline pass for Subaru short (world lines only, characters on NOINK layer)
import * as THREE from "three";
import { OutlineEffect, BlendFunction, Selection } from "postprocessing";

export const NOINK = 31; // layer for characters (no world ink)

/** Ink pass using postprocessing OutlineEffect with custom settings */
export class InkPass {
  private effect: OutlineEffect;
  private selection: Selection;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // Create selection for world objects (layer 10 is default, but we'll use a custom one)
    this.selection = new Selection();
    this.selection.layer = 10; // default outline layer

    this.effect = new OutlineEffect(scene, camera, {
      resolutionScale: 1,
      edgeStrength: 5.0,
      pulseSpeed: 0,
      visibleEdgeColor: 0x030303,
      hiddenEdgeColor: 0x030303,
      blendFunction: BlendFunction.NORMAL,
      multisampling: 4,
    });

    // Add world objects to selection (not characters on NOINK layer)
    scene.traverse((obj) => {
      if (!obj.layers.test(NOINK as any) && obj.type === "Mesh") {
        this.selection.add(obj);
      }
    });

    // Replace effect's selection with ours
    (this.effect as any).selection = this.selection;
  }

  get main() { return this.effect; }
  get pre() { return this.effect; }

  /** Update ink parameters per frame (distance-based thickness) */
  updateParams(cInf: number, focusDist: number) {
    // Near: 5.1px at 6m, Far: 3.3px at 90m (at 1080p)
    // Scale with cInf (DOF blur radius)
    const nearPx = 5.1, farPx = 3.3;
    const t = Math.min(1, cInf / 16); // cInf max ~16
    const thickness = nearPx + (farPx - nearPx) * t;
    // edgeStrength controls line weight
    this.effect.edgeStrength = 5.1 * (1 - t * 0.3);
  }

  /** Update selection for new objects */
  updateSelection(scene: THREE.Scene) {
    this.selection.clear();
    scene.traverse((obj) => {
      if (!obj.layers.test(NOINK as any) && obj.type === "Mesh") {
        this.selection.add(obj);
      }
    });
  }

  dispose() { this.effect.dispose(); }
}

/** Fallback for when ink pass is disabled */
export const noInkFallback = (root: THREE.Object3D) => {
  root.traverse((o) => {
    if (o.layers.test(NOINK as any)) return;
    // Ensure world objects don't have emissive outlines
  });
};