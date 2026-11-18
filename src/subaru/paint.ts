// Simple painted textures for Subaru short (Canvas2D)
import * as THREE from "three";

const ctex = (name: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  t.needsUpdate = true;
  return t;
};

// We'll use simple solid colors with minimal texture for rooms
// The two-tone shading in shade.ts handles the lighting look

export const bedroomTex = () => ctex("bedroom", 256, 256, (g) => {
  g.fillStyle = "#e8dcc8";
  g.fillRect(0, 0, 256, 256);
  // Subtle wallpaper pattern
  g.fillStyle = "#d8ccc0";
  for (let x = 0; x < 256; x += 32) {
    for (let y = 0; y < 256; y += 32) {
      g.fillRect(x + 14, y + 14, 4, 4);
    }
  }
});

export const kitchenTex = () => ctex("kitchen", 256, 256, (g) => {
  g.fillStyle = "#f0e8d8";
  g.fillRect(0, 0, 256, 256);
  // Tile pattern
  g.fillStyle = "#e0d8c8";
  for (let x = 0; x < 256; x += 64) {
    for (let y = 0; y < 256; y += 64) {
      g.strokeRect(x, y, 64, 64);
    }
  }
});

export const streetTex = () => ctex("street", 512, 256, (g) => {
  g.fillStyle = "#4a4a4a";
  g.fillRect(0, 0, 512, 256);
  // Road lines
  g.fillStyle = "#ffffff";
  for (let x = 0; x < 512; x += 40) {
    g.fillRect(x, 120, 20, 4);
  }
});

export const cafeTex = () => ctex("cafe", 256, 256, (g) => {
  g.fillStyle = "#d8c8b8";
  g.fillRect(0, 0, 256, 256);
  // Wood grain hint
  g.strokeStyle = "#b8a088";
  g.lineWidth = 1;
  for (let y = 0; y < 256; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y + Math.sin(y * 0.1) * 4);
    g.stroke();
  }
});

export const nightTex = () => ctex("night", 512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#080820");
  gr.addColorStop(0.5, "#181840");
  gr.addColorStop(1, "#282038");
  g.fillStyle = gr;
  g.fillRect(0, 0, 512, 512);
  // Stars
  g.fillStyle = "#ffffff";
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512, y = Math.random() * 400, r = Math.random() * 1.5;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
});

// Character textures (simple flat colors with painted details)
export const skinTex = () => ctex("skin", 128, 256, (g) => {
  g.fillStyle = "#f8d8b8";
  g.fillRect(0, 0, 128, 256);
});

export const hairDarkTex = () => ctex("hair_dark", 128, 256, (g) => {
  g.fillStyle = "#382820";
  g.fillRect(0, 0, 128, 256);
});

export const shirtBlueTex = () => ctex("shirt_blue", 128, 256, (g) => {
  g.fillStyle = "#4868a8";
  g.fillRect(0, 0, 128, 256);
});

export const pantsJeansTex = () => ctex("pants_jeans", 128, 256, (g) => {
  g.fillStyle = "#485888";
  g.fillRect(0, 0, 128, 256);
  // Pocket stitching
  g.strokeStyle = "#f8e8c8";
  g.lineWidth = 2;
  g.strokeRect(20, 180, 40, 50);
  g.strokeRect(68, 180, 40, 50);
});

export const shoesTex = () => ctex("shoes", 128, 128, (g) => {
  g.fillStyle = "#282828";
  g.fillRect(0, 0, 128, 128);
});

// Effect textures
export const deathFlashTex = () => ctex("death_flash", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.5, "rgba(255,200,100,0.5)");
  gr.addColorStop(1, "rgba(255,50,50,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
});

export const glitchTex = () => ctex("glitch", 512, 512, (g) => {
  g.fillStyle = "#000000";
  g.fillRect(0, 0, 512, 512);
  // RGB shift lines
  for (let y = 0; y < 512; y += 4) {
    const r = Math.random() * 255, gg = Math.random() * 255, b = Math.random() * 255;
    g.fillStyle = `rgb(${r},${gg},${b})`;
    g.fillRect(0, y, 512, 2);
  }
});

export const sparkleTex = () => ctex("sparkle", 64, 64, (g) => {
  g.fillStyle = "#ffff00";
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 64, y = Math.random() * 64, r = 2 + Math.random() * 4;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
});

export const sweatDropTex = () => ctex("sweat", 32, 64, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, "rgba(100,200,255,0)");
  gr.addColorStop(0.5, "rgba(100,200,255,0.8)");
  gr.addColorStop(1, "rgba(100,200,255,0)");
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(16, 0);
  g.quadraticCurveTo(0, 32, 16, 64);
  g.quadraticCurveTo(32, 32, 16, 0);
  g.fill();
});

export const thoughtBubbleTex = () => ctex("thought", 256, 256, (g) => {
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.strokeStyle = "#888888";
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(20, 20, 216, 216, 30);
  g.fill();
  g.stroke();
  // Small bubbles
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.beginPath(); g.arc(50, 230, 15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(30, 240, 10, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(220, 230, 12, 0, Math.PI * 2); g.fill();
});

export const speedLinesTex = () => ctex("speedlines", 512, 512, (g) => {
  g.strokeStyle = "rgba(255,255,255,0.6)";
  g.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    g.beginPath();
    g.moveTo(x, 512);
    g.lineTo(x + (Math.random() - 0.5) * 100, 0);
    g.stroke();
  }
});