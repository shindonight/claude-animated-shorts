// Character billboards, crowds, and effects for Subaru short
import * as THREE from "three";
import { Pen, getCharAtlas, FaceExpr, NOINK } from "./toon";
import { V3 } from "./story";

type V = THREE.Vector3;

// Simple actor: a billboard sprite with character texture
export class Actor {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  r: { key: string; draw: (ctx: CanvasRenderingContext2D) => void; w: number; h: number; k: number } | null = null;
  constructor(private root: THREE.Group, private geo: THREE.BufferGeometry) {
    this.mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.layers.set(NOINK);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    root.add(this.mesh);
  }
  bind() { if (this.r) { this.mesh.scale.set(this.r.k, this.r.k, this.r.k); } }
}

export class Fx {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  r: { key: string; draw: (ctx: CanvasRenderingContext2D) => void; cw: number; ch: number } | null = null;
  constructor(private root: THREE.Group) {
    this.mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
    this.mesh.layers.set(NOINK);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    root.add(this.mesh);
  }
  use(soft: boolean) { this.mat.blending = soft ? THREE.NormalBlending : THREE.AdditiveBlending; }
  bind() { if (this.r) this.mesh.scale.set(this.r.cw, this.r.ch, 1); }
}

// Pool for reusing textures
export class Pool {
  private cache = new Map<string, THREE.Texture>();
  private canvas = document.createElement("canvas");
  private ctx = this.canvas.getContext("2d")!;
  req(key: string, w: number, h: number, k: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    const k2 = `${key}_${w}_${h}_${k}`;
    let tex = this.cache.get(k2);
    if (!tex) {
      this.canvas.width = w; this.canvas.height = h;
      this.ctx.clearRect(0, 0, w, h);
      draw(this.ctx);
      tex = new THREE.CanvasTexture(this.canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      this.cache.set(k2, tex);
    }
    return { key, draw, w, h, k, tex, cw: w, ch: h };
  }
  flush() { /* textures auto-managed */ }
}

// Effect drawing functions
const pen = new Pen(null!); // dummy for static methods

const drawSweat = (ctx: CanvasRenderingContext2D) => {
  const gr = ctx.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, "rgba(100,200,255,0)"); gr.addColorStop(0.5, "rgba(100,200,255,0.8)"); gr.addColorStop(1, "rgba(100,200,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.quadraticCurveTo(0, 32, 16, 64); ctx.quadraticCurveTo(32, 32, 16, 0); ctx.fill();
};

const drawSparkle = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#ffff00";
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 64, y = Math.random() * 64, r = 2 + Math.random() * 4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
};

const drawSpeedLines = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    ctx.beginPath(); ctx.moveTo(x, 512); ctx.lineTo(x + (Math.random() - 0.5) * 100, 0); ctx.stroke();
  }
};

const drawThoughtBubble = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.strokeStyle = "#888888"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(20, 20, 216, 216, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.arc(50, 230, 15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(30, 240, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(220, 230, 12, 0, Math.PI * 2); ctx.fill();
};

const drawDeathFlash = (ctx: CanvasRenderingContext2D, intensity: number) => {
  const gr = ctx.createRadialGradient(300, 480, 0, 300, 480, 600);
  gr.addColorStop(0, `rgba(255,255,255,${intensity})`);
  gr.addColorStop(0.5, `rgba(255,200,100,${intensity * 0.5})`);
  gr.addColorStop(1, `rgba(255,50,50,0)`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 600, 1000);
};

const drawGlitch = (ctx: CanvasRenderingContext2D, intensity: number) => {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 600, 1000);
  for (let y = 0; y < 1000; y += 4) {
    const r = Math.random() * 255, g = Math.random() * 255, b = Math.random() * 255;
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, y, 600, 2);
  }
  ctx.globalAlpha = intensity * 0.3;
  for (let i = 0; i < 5; i++) {
    const sy = Math.random() * 1000, sh = 2 + Math.random() * 20, dx = (Math.random() - 0.5) * 50 * intensity;
    ctx.drawImage(ctx.canvas, dx, sy, 600, sh, 0, sy, 600, sh);
  }
  ctx.globalAlpha = 1;
};

// Stage: returns places (characters) and fx (effects) for a shot at time t
export type Place = { key: string; x: number; y: number; z: number; yaw?: number; roll?: number; size?: [number, number, number]; geo: "billboard" | "swing"; scale?: number; draw?: (ctx: CanvasRenderingContext2D) => void; mirror?: boolean };
export type FxPlace = { key: string; x: number; y: number; z: number; cw: number; ch: number; rot?: number; flat?: boolean; soft?: boolean; draw: (ctx: CanvasRenderingContext2D) => void };

export type Stage = { places: Place[]; fx: FxPlace[] };

const SUBARU_KEY = "subaru";
const EMILIA_KEY = "emilia";
const REM_KEY = "rem";
const GENERIC_KEY = "generic";

function charDraw(expr: FaceExpr, hair: "subaru" | "emilia" | "rem" | "generic" = "subaru", outfit: "casual" | "school" | "tracksuit" = "casual") {
  return (ctx: CanvasRenderingContext2D) => {
    const p = new Pen(ctx);
    p.character(expr, outfit, hair);
  };
}

function charDrawEmilia(expr: FaceExpr) {
  return (ctx: CanvasRenderingContext2D) => {
    const p = new Pen(ctx);
    p.character(expr, "casual", "emilia");
  };
}

function charDrawRem(expr: FaceExpr) {
  return (ctx: CanvasRenderingContext2D) => {
    const p = new Pen(ctx);
    p.character(expr, "casual", "rem");
  };
}

export const stage = (shotId: number, t: number, b: any, cam: { pos: V3; right: THREE.Vector3 }): Stage => {
  const places: Place[] = [];
  const fx: FxPlace[] = [];
  const tau = t; // story time

  switch (shotId) {
    case 1: // Bedroom - Subaru waking up, dying, waking up
      const deathCycle = Math.floor(tau / 3) % 3;
      if (tau < 3) {
        places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("sleepy"), scale: 1 });
      } else if (deathCycle === 0) {
        places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("shocked"), scale: 1 });
        fx.push({ key: "deathFlash", x: 0, y: 1.7, z: -2, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawDeathFlash(ctx, 1) });
      } else if (deathCycle === 1) {
        places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("glitch"), scale: 1 });
        fx.push({ key: "glitch", x: 0, y: 1.7, z: -2, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawGlitch(ctx, 0.5) });
      } else {
        places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("confused"), scale: 1 });
        fx.push({ key: "sparkle", x: 0, y: 2.5, z: -2, cw: 100, ch: 100, draw: drawSparkle });
      }
      break;

    case 2: // Kitchen - burning toast
      places.push({ key: SUBARU_KEY, x: -0.5, y: 1.7, z: 3, geo: "billboard", size: [300, 500, 0.5], yaw: Math.PI / 4, draw: charDraw("shocked"), scale: 1 });
      if (tau > 6) {
        fx.push({ key: "smoke", x: -1, y: 1.5, z: 3.2, cw: 200, ch: 200, draw: (ctx) => { ctx.fillStyle = "rgba(100,100,100,0.5)"; ctx.beginPath(); ctx.arc(100, 100, 50 + tau * 5, 0, Math.PI * 2); ctx.fill(); } });
      }
      if (tau > 9) {
        fx.push({ key: "deathFlash", x: 0, y: 1.7, z: 3, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawDeathFlash(ctx, 1) });
      }
      break;

    case 3: // Street - missing bus
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: 10, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("sad"), scale: 1 });
      fx.push({ key: "sweat", x: 0.5, y: 2.5, z: 10, cw: 50, ch: 100, draw: drawSweat });
      if (tau > 9) {
        fx.push({ key: "speedLines", x: 0, y: 1.7, z: 12, cw: 512, ch: 512, draw: drawSpeedLines });
      }
      break;

    case 4: // Bedroom - trip on cat
      places.push({ key: SUBARU_KEY, x: 0, y: 0.5, z: -1.5, geo: "billboard", size: [300, 500, 0.5], roll: 0.3, draw: charDraw("shocked"), scale: 1 });
      // Cat (simple)
      places.push({ key: "cat", x: 0.3, y: 0.3, z: -1.3, geo: "billboard", size: [100, 100, 0.5], draw: (ctx) => { const p = new Pen(ctx); p.head(50, 50, 30, "#f8d8b8"); p.eyes(50, 50, 30, "neutral"); p.mouth(50, 50, 30, "neutral"); }, scale: 0.3 });
      break;

    case 5: // Cafe - crush confession loop (Emilia)
      const loopPhase = Math.floor((tau - 12) / 0.3) % 3;
      places.push({ key: SUBARU_KEY, x: -0.5, y: 1.7, z: 5, geo: "billboard", size: [300, 500, 0.5], yaw: -Math.PI / 6, draw: charDraw(loopPhase === 0 ? "determined" : loopPhase === 1 ? "embarrassed" : "shocked"), scale: 1 });
      places.push({ key: EMILIA_KEY, x: 0.5, y: 1.7, z: 5.5, geo: "billboard", size: [300, 500, 0.5], yaw: Math.PI / 6, draw: charDrawEmilia(loopPhase === 0 ? "confused" : loopPhase === 1 ? "happy" : "shocked"), scale: 1 });
      if (loopPhase === 2) {
        fx.push({ key: "deathFlash", x: 0, y: 1.7, z: 5, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawDeathFlash(ctx, 1) });
        fx.push({ key: "sparkle", x: 0, y: 2.5, z: 5, cw: 100, ch: 100, draw: drawSparkle });
      } else if (loopPhase === 1) {
        fx.push({ key: "sparkle", x: 0, y: 2.5, z: 5.2, cw: 100, ch: 100, draw: drawSparkle });
      } else {
        fx.push({ key: "sweat", x: -0.5, y: 2.5, z: 5, cw: 50, ch: 100, draw: drawSweat });
      }
      break;

    case 6: // Bedroom night - "Wait, save point moving?"
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("thinking"), scale: 1 });
      fx.push({ key: "thoughtBubble", x: 0.5, y: 2.5, z: -1.8, cw: 300, ch: 300, draw: drawThoughtBubble });
      break;

    case 7: // Montage - learning
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("determined"), scale: 1 });
      fx.push({ key: "speedLines", x: 0, y: 1.7, z: -2, cw: 512, ch: 512, draw: drawSpeedLines });
      break;

    case 8: // Perfect Tuesday montage
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: 3, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("happy"), scale: 1 });
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: 10, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("happy"), scale: 1 });
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: 5, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("determined"), scale: 1 });
      places.push({ key: EMILIA_KEY, x: 0.5, y: 1.7, z: 5.5, geo: "billboard", size: [300, 500, 0.5], yaw: Math.PI / 6, draw: charDrawEmilia("happy"), scale: 1 });
      fx.push({ key: "sparkle", x: 0, y: 2.5, z: 5, cw: 100, ch: 100, draw: drawSparkle });
      break;

    case 9: // Cafe - success kiss
      places.push({ key: SUBARU_KEY, x: -0.3, y: 1.7, z: 5, geo: "billboard", size: [300, 500, 0.5], yaw: -Math.PI / 6, draw: charDraw("kiss"), scale: 1 });
      places.push({ key: EMILIA_KEY, x: 0.3, y: 1.7, z: 5.5, geo: "billboard", size: [300, 500, 0.5], yaw: Math.PI / 6, draw: charDrawEmilia("kiss"), scale: 1 });
      fx.push({ key: "sparkle", x: 0, y: 2.5, z: 5.2, cw: 150, ch: 150, draw: drawSparkle });
      if (tau > 54) {
        fx.push({ key: "deathFlash", x: 0, y: 1.7, z: 5, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawDeathFlash(ctx, 1) });
      }
      break;

    case 10: // Final twist - 7 AM again
      places.push({ key: SUBARU_KEY, x: 0, y: 1.7, z: -2, geo: "billboard", size: [300, 500, 0.5], draw: charDraw("shocked"), scale: 1 });
      fx.push({ key: "glitch", x: 0, y: 1.7, z: -2, cw: 600, ch: 1000, flat: true, soft: true, draw: (ctx) => drawGlitch(ctx, 0.8) });
      break;
  }

  return { places, fx };
};

// Effect triggers
export const snapFx = (tau: number, bolt: V3, st: Stage) => {
  if (tau > 34.6 && tau < 35) {
    st.fx.push({ key: "snap", x: bolt[0], y: bolt[1], z: bolt[2], cw: 100, ch: 100, draw: (ctx) => { ctx.fillStyle = "#ffff00"; ctx.beginPath(); ctx.arc(50, 50, 30, 0, Math.PI * 2); ctx.fill(); } });
  }
};

export const splashFx = (tau: number, st: Stage) => {
  if (tau > 36.3) {
    st.fx.push({ key: "splash", x: 0, y: 0.5, z: -20, cw: 200, ch: 200, flat: true, draw: (ctx) => { ctx.fillStyle = "rgba(100,200,255,0.6)"; ctx.beginPath(); ctx.arc(100, 100, 50 + (tau - 36.3) * 50, 0, Math.PI * 2); ctx.fill(); } });
  }
};

export const creakFx = (t: number, pts: V3[], st: Stage, intensity: number) => {
  if (Math.random() < 0.1 * intensity) {
    for (const p of pts) {
      st.fx.push({ key: "creak", x: p[0], y: p[1], z: p[2], cw: 50, ch: 50, draw: (ctx) => { ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(50, 25); ctx.stroke(); } });
    }
  }
};

export const SU_SWING = 1.0;
export const SIGN_AT: V3 = [0, 0, 0];