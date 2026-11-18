// Character drawing API for Subaru short (simplified bean-head style)
import * as THREE from "three";
import { skinTex, hairDarkTex, shirtBlueTex, pantsJeansTex, shoesTex, sweatDropTex, sparkleTex, speedLinesTex, thoughtBubbleTex, deathFlashTex, glitchTex } from "./paint";

const CW = 600, CH = 1000; // design canvas
const SOLES = 975; // y where soles sit

export type FaceExpr = "neutral" | "happy" | "sad" | "shocked" | "confused" | "determined" | "embarrassed" | "sleepy" | "dead" | "glitch" | "sweating" | "sparkle" | "thinking" | "kiss" | "angry";

export class Pen {
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) { this.ctx = ctx; }

  // Head shape (bean head: wider at top, narrower at chin)
  head(cx: number, cy: number, r: number, fill: string) {
    const { ctx } = this;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.95);
    ctx.bezierCurveTo(cx + r * 0.9, cy - r * 0.95, cx + r * 1.0, cy - r * 0.3, cx + r * 0.95, cy + r * 0.4);
    ctx.bezierCurveTo(cx + r * 0.7, cy + r * 0.95, cx, cy + r * 1.0, cx, cy + r * 0.95);
    ctx.bezierCurveTo(cx, cy + r * 1.0, cx - r * 0.7, cy + r * 0.95, cx - r * 0.95, cy + r * 0.4);
    ctx.bezierCurveTo(cx - r * 1.0, cy - r * 0.3, cx - r * 0.9, cy - r * 0.95, cx, cy - r * 0.95);
    ctx.fill();
  }

  // Plum outline (variable width, thicker on bottom/shadow side)
  outline(cx: number, cy: number, r: number, color = "#241726", width = 6) {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.95);
    ctx.bezierCurveTo(cx + r * 0.9, cy - r * 0.95, cx + r * 1.0, cy - r * 0.3, cx + r * 0.95, cy + r * 0.4);
    ctx.bezierCurveTo(cx + r * 0.7, cy + r * 0.95, cx, cy + r * 1.0, cx, cy + r * 0.95);
    ctx.bezierCurveTo(cx, cy + r * 1.0, cx - r * 0.7, cy + r * 0.95, cx - r * 0.95, cy + r * 0.4);
    ctx.bezierCurveTo(cx - r * 1.0, cy - r * 0.3, cx - r * 0.9, cy - r * 0.95, cx, cy - r * 0.95);
    ctx.stroke();
  }

  // Eyes: two dots, 0.26W apart
  eyes(cx: number, cy: number, r: number, expr: FaceExpr) {
    const { ctx } = this;
    const spacing = r * 0.26;
    const eyeY = cy - r * 0.15;
    const eyeR = r * 0.08;

    ctx.fillStyle = "#1a1a2e";
    // Left eye
    ctx.beginPath();
    if (expr === "shocked") {
      ctx.arc(cx - spacing, eyeY, eyeR * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (expr === "dead") {
      // X eyes drawn in mouth() for dead
      ctx.moveTo(cx - spacing - eyeR, eyeY - eyeR);
      ctx.lineTo(cx - spacing + eyeR, eyeY + eyeR);
      ctx.moveTo(cx - spacing + eyeR, eyeY - eyeR);
      ctx.lineTo(cx - spacing - eyeR, eyeY + eyeR);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (expr === "sleepy") {
      ctx.moveTo(cx - spacing - eyeR, eyeY);
      ctx.lineTo(cx - spacing + eyeR, eyeY);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (expr === "glitch") {
      ctx.arc(cx - spacing + (Math.random() - 0.5) * 4, eyeY + (Math.random() - 0.5) * 4, eyeR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(cx - spacing, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right eye
    ctx.beginPath();
    if (expr === "shocked") {
      ctx.arc(cx + spacing, eyeY, eyeR * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (expr === "dead") {
      ctx.moveTo(cx + spacing - eyeR, eyeY - eyeR);
      ctx.lineTo(cx + spacing + eyeR, eyeY + eyeR);
      ctx.moveTo(cx + spacing + eyeR, eyeY - eyeR);
      ctx.lineTo(cx + spacing - eyeR, eyeY + eyeR);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (expr === "sleepy") {
      ctx.moveTo(cx + spacing - eyeR, eyeY);
      ctx.lineTo(cx + spacing + eyeR, eyeY);
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (expr === "glitch") {
      ctx.arc(cx + spacing + (Math.random() - 0.5) * 4, eyeY + (Math.random() - 0.5) * 4, eyeR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(cx + spacing, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Highlights (except dead/sleepy/glitch)
    if (expr !== "dead" && expr !== "sleepy" && expr !== "glitch") {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath(); ctx.arc(cx - spacing + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + spacing + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // Eyebrows for expressions
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    if (expr === "confused" || expr === "thinking") {
      ctx.beginPath(); ctx.moveTo(cx - spacing - eyeR * 1.5, eyeY - eyeR * 2); ctx.lineTo(cx - spacing, eyeY - eyeR); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + spacing + eyeR * 1.5, eyeY - eyeR * 2); ctx.lineTo(cx + spacing, eyeY - eyeR); ctx.stroke();
    } else if (expr === "determined" || expr === "angry") {
      ctx.beginPath(); ctx.moveTo(cx - spacing - eyeR, eyeY - eyeR * 1.5); ctx.lineTo(cx - spacing + eyeR, eyeY - eyeR * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + spacing - eyeR, eyeY - eyeR * 1.5); ctx.lineTo(cx + spacing + eyeR, eyeY - eyeR * 2); ctx.stroke();
    } else if (expr === "sad") {
      ctx.beginPath(); ctx.moveTo(cx - spacing - eyeR, eyeY - eyeR); ctx.lineTo(cx - spacing, eyeY - eyeR * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + spacing - eyeR, eyeY - eyeR); ctx.lineTo(cx + spacing, eyeY - eyeR * 2); ctx.stroke();
    } else if (expr === "embarrassed") {
      // Blush marks
      ctx.fillStyle = "rgba(255,100,100,0.4)";
      ctx.beginPath(); ctx.arc(cx - spacing * 2.5, cy + r * 0.1, r * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + spacing * 2.5, cy + r * 0.1, r * 0.15, 0, Math.PI * 2); ctx.fill();
    } else if (expr === "happy") {
      ctx.beginPath(); ctx.moveTo(cx - spacing - eyeR, eyeY - eyeR * 1.5); ctx.lineTo(cx - spacing + eyeR, eyeY - eyeR * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + spacing - eyeR, eyeY - eyeR * 1.5); ctx.lineTo(cx + spacing + eyeR, eyeY - eyeR * 2); ctx.stroke();
    }
  }

  // Mouth
  mouth(cx: number, cy: number, r: number, expr: FaceExpr) {
    const { ctx } = this;
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    const mouthY = cy + r * 0.35;
    const mouthW = r * 0.3;

    ctx.beginPath();
    switch (expr) {
      case "happy":
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.quadraticCurveTo(cx, mouthY - r * 0.2, cx + mouthW, mouthY);
        break;
      case "sad":
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + r * 0.2, cx + mouthW, mouthY);
        break;
      case "shocked":
        ctx.arc(cx, mouthY, r * 0.15, 0, Math.PI * 2);
        break;
      case "confused":
        ctx.moveTo(cx - mouthW * 0.5, mouthY);
        ctx.lineTo(cx + mouthW * 0.5, mouthY + r * 0.1);
        break;
      case "determined":
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.lineTo(cx + mouthW, mouthY);
        break;
      case "embarrassed":
        ctx.moveTo(cx - mouthW * 0.3, mouthY);
        ctx.quadraticCurveTo(cx, mouthY - r * 0.1, cx + mouthW * 0.3, mouthY);
        break;
      case "sleepy":
        ctx.moveTo(cx - mouthW * 0.5, mouthY);
        ctx.lineTo(cx + mouthW * 0.5, mouthY);
        break;
      case "dead":
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.lineTo(cx + mouthW, mouthY);
        break;
      case "glitch":
        // Random glitch mouth
        for (let i = 0; i < 3; i++) {
          ctx.moveTo(cx - mouthW + Math.random() * mouthW * 2, mouthY + (Math.random() - 0.5) * 10);
          ctx.lineTo(cx - mouthW + Math.random() * mouthW * 2, mouthY + (Math.random() - 0.5) * 10 + 5);
        }
        break;
      case "sweating":
        ctx.moveTo(cx - mouthW * 0.5, mouthY);
        ctx.lineTo(cx + mouthW * 0.5, mouthY);
        break;
      case "sparkle":
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.quadraticCurveTo(cx, mouthY - r * 0.3, cx + mouthW, mouthY);
        break;
      case "thinking":
        ctx.moveTo(cx - mouthW * 0.5, mouthY);
        ctx.lineTo(cx, mouthY + r * 0.1);
        ctx.lineTo(cx + mouthW * 0.5, mouthY);
        break;
      case "kiss":
        ctx.moveTo(cx - mouthW * 0.3, mouthY);
        ctx.quadraticCurveTo(cx, mouthY - r * 0.15, cx + mouthW * 0.3, mouthY);
        break;
      default:
        ctx.moveTo(cx - mouthW * 0.5, mouthY);
        ctx.lineTo(cx + mouthW * 0.5, mouthY);
    }
    ctx.stroke();
  }

  // Hair (simple style for Subaru)
  hair(cx: number, cy: number, r: number, color = "#382820", style: "subaru" | "emilia" | "rem" | "generic" = "subaru") {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (style === "subaru") {
      // Subaru's messy black hair
      ctx.moveTo(cx - r * 1.1, cy - r * 0.9);
      ctx.bezierCurveTo(cx - r * 1.2, cy - r * 1.3, cx - r * 0.5, cy - r * 1.5, cx, cy - r * 1.4);
      ctx.bezierCurveTo(cx + r * 0.5, cy - r * 1.5, cx + r * 1.2, cy - r * 1.3, cx + r * 1.1, cy - r * 0.9);
      ctx.bezierCurveTo(cx + r * 1.3, cy - r * 0.5, cx + r * 1.1, cy + r * 0.2, cx + r * 0.9, cy + r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.3, cy + r * 0.2, cx, cy + r * 0.1, cx, cy - r * 0.1);
      ctx.bezierCurveTo(cx, cy + r * 0.1, cx - r * 0.3, cy + r * 0.2, cx - r * 0.9, cy + r * 0.4);
      ctx.bezierCurveTo(cx - r * 1.1, cy + r * 0.2, cx - r * 1.3, cy - r * 0.5, cx - r * 1.1, cy - r * 0.9);
    } else if (style === "emilia") {
      // Emilia's long silver hair
      ctx.moveTo(cx - r * 1.2, cy - r * 1.0);
      ctx.bezierCurveTo(cx - r * 1.5, cy - r * 0.5, cx - r * 1.8, cy + r * 0.5, cx - r * 1.5, cy + r * 1.5);
      ctx.bezierCurveTo(cx - r * 1.0, cy + r * 1.0, cx, cy + r * 0.8, cx, cy - r * 0.2);
      ctx.bezierCurveTo(cx, cy + r * 0.8, cx + r * 1.0, cy + r * 1.0, cx + r * 1.5, cy + r * 1.5);
      ctx.bezierCurveTo(cx + r * 1.8, cy + r * 0.5, cx + r * 1.5, cy - r * 0.5, cx + r * 1.2, cy - r * 1.0);
      ctx.bezierCurveTo(cx + r * 1.4, cy - r * 1.2, cx + r * 0.8, cy - r * 1.4, cx, cy - r * 1.3);
      ctx.bezierCurveTo(cx - r * 0.8, cy - r * 1.4, cx - r * 1.4, cy - r * 1.2, cx - r * 1.2, cy - r * 1.0);
    } else {
      // Generic short hair
      ctx.arc(cx, cy - r * 0.9, r * 1.1, Math.PI, 0);
      ctx.lineTo(cx + r * 1.1, cy + r * 0.2);
      ctx.quadraticCurveTo(cx, cy + r * 0.5, cx - r * 1.1, cy + r * 0.2);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Body (stick figure with plum outline)
  body(cx: number, cy: number, r: number, scale = 1, outfit: "casual" | "school" | "tracksuit" = "casual") {
    const { ctx } = this;
    const headBottom = cy + r * 0.95;
    const neckY = headBottom + r * 0.15;
    const torsoH = r * 1.8 * scale;
    const legL = r * 2.5 * scale;
    const armL = r * 1.6 * scale;
    const shoulderW = r * 1.2 * scale;

    // Torso
    ctx.fillStyle = outfit === "school" ? "#4868a8" : outfit === "tracksuit" ? "#684838" : "#488848";
    ctx.beginPath();
    ctx.moveTo(cx - shoulderW * 0.6, neckY);
    ctx.lineTo(cx + shoulderW * 0.6, neckY);
    ctx.lineTo(cx + shoulderW * 0.4, neckY + torsoH);
    ctx.lineTo(cx - shoulderW * 0.4, neckY + torsoH);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = "#f8d8b8"; // skin
    // Left arm
    ctx.beginPath();
    ctx.moveTo(cx - shoulderW * 0.6, neckY + r * 0.2);
    ctx.lineTo(cx - shoulderW * 1.2, neckY + torsoH * 0.6);
    ctx.lineTo(cx - shoulderW * 1.4, neckY + torsoH * 0.6);
    ctx.lineTo(cx - shoulderW * 0.8, neckY + r * 0.2);
    ctx.closePath();
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(cx + shoulderW * 0.6, neckY + r * 0.2);
    ctx.lineTo(cx + shoulderW * 1.2, neckY + torsoH * 0.6);
    ctx.lineTo(cx + shoulderW * 1.4, neckY + torsoH * 0.6);
    ctx.lineTo(cx + shoulderW * 0.8, neckY + r * 0.2);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.fillStyle = "#485888"; // jeans
    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - shoulderW * 0.25, neckY + torsoH);
    ctx.lineTo(cx - shoulderW * 0.3, neckY + torsoH + legL);
    ctx.lineTo(cx - shoulderW * 0.15, neckY + torsoH + legL);
    ctx.lineTo(cx - shoulderW * 0.1, neckY + torsoH);
    ctx.closePath();
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + shoulderW * 0.1, neckY + torsoH);
    ctx.lineTo(cx + shoulderW * 0.15, neckY + torsoH + legL);
    ctx.lineTo(cx + shoulderW * 0.3, neckY + torsoH + legL);
    ctx.lineTo(cx + shoulderW * 0.25, neckY + torsoH);
    ctx.closePath();
    ctx.fill();

    // Shoes
    ctx.fillStyle = "#282828";
    ctx.fillRect(cx - shoulderW * 0.35, neckY + torsoH + legL, shoulderW * 0.3, r * 0.2);
    ctx.fillRect(cx + shoulderW * 0.05, neckY + torsoH + legL, shoulderW * 0.3, r * 0.2);
  }

  // Full character drawing
  character(expr: FaceExpr, outfit: "casual" | "school" | "tracksuit" = "casual", hairStyle: "subaru" | "emilia" | "rem" | "generic" = "subaru") {
    const cx = CW / 2, cy = CH * 0.25, r = 120;
    // Body first (behind head)
    this.body(cx, cy, r, 1, outfit);
    // Head
    this.head(cx, cy, r, "#f8d8b8");
    this.hair(cx, cy, r, "#382820", hairStyle);
    this.outline(cx, cy, r);
    this.eyes(cx, cy, r, expr);
    this.mouth(cx, cy, r, expr);
  }

  // Effect sprites (textures created lazily)
  private _sweatTex: THREE.Texture | null = null;
  private _sparkleTex: THREE.Texture | null = null;
  private _speedLinesTex: THREE.Texture | null = null;
  private _thoughtBubbleTex: THREE.Texture | null = null;
  private _deathFlashTex: THREE.Texture | null = null;
  private _glitchTex: THREE.Texture | null = null;

  private getSweatTex() { if (!this._sweatTex) this._sweatTex = sweatDropTex(); return this._sweatTex; }
  private getSparkleTex() { if (!this._sparkleTex) this._sparkleTex = sparkleTex(); return this._sparkleTex; }
  private getSpeedLinesTex() { if (!this._speedLinesTex) this._speedLinesTex = speedLinesTex(); return this._speedLinesTex; }
  private getThoughtBubbleTex() { if (!this._thoughtBubbleTex) this._thoughtBubbleTex = thoughtBubbleTex(); return this._thoughtBubbleTex; }
  private getDeathFlashTex() { if (!this._deathFlashTex) this._deathFlashTex = deathFlashTex(); return this._deathFlashTex; }
  private getGlitchTex() { if (!this._glitchTex) this._glitchTex = glitchTex(); return this._glitchTex; }

  sweatDrop(x: number, y: number, scale = 1) {
    const { ctx } = this;
    const tex = this.getSweatTex();
    ctx.drawImage(tex.source.data, x - 16 * scale, y - 64 * scale, 32 * scale, 64 * scale);
  }

  sparkle(x: number, y: number, scale = 1) {
    const { ctx } = this;
    const tex = this.getSparkleTex();
    ctx.drawImage(tex.source.data, x - 32 * scale, y - 32 * scale, 64 * scale, 64 * scale);
  }

  speedLines(x: number, y: number, w: number, h: number, scale = 1) {
    const { ctx } = this;
    const tex = this.getSpeedLinesTex();
    ctx.drawImage(tex.source.data, x - w/2 * scale, y - h/2 * scale, w * scale, h * scale);
  }

  thoughtBubble(x: number, y: number, scale = 1) {
    const { ctx } = this;
    const tex = this.getThoughtBubbleTex();
    ctx.drawImage(tex.source.data, x - 128 * scale, y - 128 * scale, 256 * scale, 256 * scale);
  }

  deathFlash(intensity: number) {
    const { ctx } = this;
    const tex = this.getDeathFlashTex();
    ctx.globalAlpha = intensity;
    ctx.drawImage(tex.source.data, 0, 0, CW, CH);
    ctx.globalAlpha = 1;
  }

  glitchEffect(intensity: number) {
    const { ctx } = this;
    const tex = this.getGlitchTex();
    ctx.globalAlpha = intensity * 0.3;
    for (let i = 0; i < 5; i++) {
      const sy = Math.random() * CH;
      const sh = 2 + Math.random() * 20;
      const dx = (Math.random() - 0.5) * 50 * intensity;
      ctx.drawImage(tex.source.data, dx, sy, CW, sh, 0, sy, CW, sh);
    }
    ctx.globalAlpha = 1;
  }
}

// Pre-rendered character atlases (one per expression) - lazy initialization for SSR
let _charAtlas: Map<FaceExpr, THREE.Texture> | null = null;

export const buildAtlas = (): Map<FaceExpr, THREE.Texture> => {
  const atlas = new Map<FaceExpr, THREE.Texture>();
  const canvas = document.createElement("canvas");
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext("2d")!;
  const pen = new Pen(ctx);

  const expressions: FaceExpr[] = ["neutral", "happy", "sad", "shocked", "confused", "determined", "embarrassed", "sleepy", "dead", "glitch", "sweating", "sparkle", "thinking", "kiss"];

  for (const expr of expressions) {
    ctx.clearRect(0, 0, CW, CH);
    pen.character(expr);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    atlas.set(expr, tex);
  }
  return atlas;
};

export const getCharAtlas = (): Map<FaceExpr, THREE.Texture> => {
  if (!_charAtlas) _charAtlas = buildAtlas();
  return _charAtlas;
};

export const NOINK = 31; // layer for characters (no world ink)