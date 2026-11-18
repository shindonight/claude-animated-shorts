// "What If You Had Subaru's Return by Death in Real Life?" — TikTok humor short
// Timeline synced to voice words.json, story beats, and camera grammar from reference study.
// Vertical 1080x1920, 30 fps, ~60s = 1800 frames
export const FPS = 30;
export const TOTAL = 1800;
export const D0 = 1.7; // eye height (m)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- story time (tau = seconds from voice) ----------------
// Hook at tau=0, each beat ~5-7s, total ~58s
export const tauAt = (f: number) => f / FPS;

// Death counter for visual gag
export const deathCount = (tau: number) => {
  if (tau < 3) return 0;
  if (tau < 10) return Math.floor((tau - 3) / 1.5); // toast, bus, cat
  if (tau < 25) return 3 + Math.floor((tau - 10) / 0.3); // crush attempts
  if (tau < 35) return 47; // "47 times" hold
  if (tau < 45) return 47 + Math.floor((tau - 35) / 2); // learning montage
  return 200; // final perfect run
};

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night" | "reset";
export type Crowd = "bedroom" | "kitchen" | "street" | "cafe" | "bedroom2" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0,   b: 90,  light: "reset", crowd: "bedroom",   tau: (t) => t },       // Hook: wake up, die, wake up
  { id: 2, a: 90,  b: 180, light: "day",   crowd: "kitchen",   tau: (t) => t - 3 },   // Burn toast → reset (3 deaths)
  { id: 3, a: 180, b: 270, light: "day",   crowd: "street",    tau: (t) => t - 6 },   // Miss bus → reset
  { id: 4, a: 270, b: 360, light: "day",   crowd: "bedroom",   tau: (t) => t - 9 },   // Trip on cat → reset
  { id: 5, a: 360, b: 720, light: "golden", crowd: "cafe",     tau: (t) => t - 12 },  // Crush confession loop ×47
  { id: 6, a: 720, b: 900, light: "night",  crowd: "bedroom",   tau: (t) => t - 24 },  // "Wait... save point moving?"
  { id: 7, a: 900, b: 1200, light: "golden", crowd: "bedroom",  tau: (t) => t - 30 },  // Learning montage (speedrun analogy)
  { id: 8, a: 1200, b: 1500, light: "day",   crowd: "kitchen",  tau: (t) => t - 40 },  // Perfect Tuesday montage
  { id: 9, a: 1500, b: 1700, light: "golden", crowd: "cafe",    tau: (t) => t - 50 },  // Success! Kiss... alarm → NEW save
  { id: 10, a: 1700, b: TOTAL, light: "reset", crowd: "bedroom", tau: (t) => t - 57 }, // Final twist: 7 AM again
];
/** Crossfades at place/time changes; white flash on each reset */
export const XFADE: Record<number, number> = { 2: 4, 3: 4, 4: 4, 5: 6, 6: 6, 7: 6, 8: 6, 9: 6, 10: 4 };
/** White flash frames (4 frames each) - trigger on reset deaths */
export const FLASH_AT = [0, 120, 210, 300, 390, 720, 1500, 1700]; // frame numbers

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  // Check for death flashes
  for (const flash of FLASH_AT) {
    if (f >= flash && f < flash + 4) return [{ id: shotAt(f).id, alpha: 1 }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// Room positions (meters)
const BED = [0, 1.0, -2] as V3;
const KITCHEN = [0, 1.0, 3] as V3;
const STREET = [0, 1.7, 10] as V3;
const CAFE = [0, 1.0, 5] as V3;

// ---- framings per shot ----
// Shot 1: Bedroom - wake up, die (glitch), wake up
const S1a = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 0, 0.003), { fov: 45 }); // Wide bedroom
const S1b = (f: number) => dolly([0.3, 1.1, -1.2], [0, 1.0, -1.5], pushK(f, 30, 0.004), { fov: 35, roll: 0.08 }); // Close on face - death glitch
const S1c = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 60, 0.002), { fov: 45 }); // Wake up again

// Shot 2: Kitchen - burn toast (3 quick deaths)
const S2a = (f: number) => dolly([-1, 1.2, 2.5], [0, 1.0, 3.5], pushK(f, 90, 0.002), { fov: 40 });
const S2b = (f: number) => dolly([0.2, 1.0, 2.8], [0, 0.9, 3.2], pushK(f, 120, 0.005), { fov: 30, roll: -0.05 }); // Toast CU
const S2c = (f: number) => dolly([-1, 1.2, 2.5], [0, 1.0, 3.5], pushK(f, 150, 0.002), { fov: 40 }); // Reset

// Shot 3: Street - miss bus
const S3a = (f: number) => dolly([2, 1.5, 8], [0, 1.7, 12], pushK(f, 180, 0.002), { fov: 44 });
const S3b = (f: number) => dolly([0, 1.7, 9], [0, 1.7, 11], pushK(f, 210, 0.006), { fov: 35, roll: 0.06 }); // Bus leaving CU
const S3c = (f: number) => dolly([2, 1.5, 8], [0, 1.7, 12], pushK(f, 240, 0.002), { fov: 44 }); // Reset

// Shot 4: Bedroom - trip on cat
const S4a = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 270, 0.002), { fov: 45 });
const S4b = (f: number) => dolly([0.1, 0.5, -1.3], [0, 0.3, -1.5], pushK(f, 300, 0.008), { fov: 28, roll: 0.12 }); // Floor POV - cat
const S4c = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 330, 0.002), { fov: 45 }); // Reset

// Shot 5: Cafe - Crush confession loop (47 deaths = rapid cuts)
const S5a = (f: number) => dolly([-0.5, 1.0, 4.5], [0, 1.0, 5.5], pushK(f, 360, 0.0015), { fov: 42 }); // Cafe wide
const S5b = (f: number) => dolly([0.1, 1.0, 4.8], [0, 1.0, 5.2], pushK(f, 450, 0.004), { fov: 32 }); // Face to face
const S5c = (f: number) => dolly([0.3, 1.1, 4.7], [0, 1.05, 5.1], pushK(f, 550, 0.005), { fov: 30, roll: 0.08 }); // Awkward line
const S5d = (f: number) => dolly([-0.5, 1.0, 4.5], [0, 1.0, 5.5], pushK(f, 600, 0.002), { fov: 42 }); // Reset (repeat)

// Shot 6: Bedroom night - "Wait, save point moving?"
const S6a = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 720, 0.001), { fov: 45, roll: -0.04 });
const S6b = (f: number) => dolly([0.2, 1.1, -1.3], [0, 1.0, -1.6], pushK(f, 780, 0.002), { fov: 35 }); // Thinking face

// Shot 7: Bedroom - Learning montage (speedrun analogy)
const S7a = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 900, 0.001), { fov: 45 });
const S7b = (f: number) => dolly([0.2, 1.1, -1.3], [0, 1.0, -1.6], pushK(f, 960, 0.003), { fov: 35, roll: 0.05 }); // "Ever played a boss fight?"
const S7c = (f: number) => dolly([-0.3, 1.2, -1.2], [0, 1.1, -1.5], pushK(f, 1050, 0.002), { fov: 40 }); // Visualizing patterns

// Shot 8: Kitchen - Perfect Tuesday montage
const S8a = (f: number) => dolly([-1, 1.2, 2.5], [0, 1.0, 3.5], pushK(f, 1200, 0.002), { fov: 40 }); // Perfect coffee
const S8b = (f: number) => dolly([0, 1.7, 8], [0, 1.7, 12], pushK(f, 1280, 0.002), { fov: 44 }); // Catch bus
const S8c = (f: number) => dolly([-0.5, 1.0, 4.5], [0, 1.0, 5.5], pushK(f, 1350, 0.0015), { fov: 42 }); // Cafe confident

// Shot 9: Cafe - Success! Kiss... alarm
const S9a = (f: number) => dolly([0.1, 1.0, 4.8], [0, 1.0, 5.2], pushK(f, 1500, 0.003), { fov: 32 }); // Lean in
const S9b = (f: number) => dolly([0, 1.1, 4.6], [0, 1.0, 5.0], pushK(f, 1580, 0.006), { fov: 28, roll: 0.1 }); // Kiss CU
const S9c = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 1620, 0.005), { fov: 45 }); // Alarm - bedroom

// Shot 10: Bedroom - Final twist: 7 AM again (NEW save point)
const S10a = (f: number) => dolly([0, 1.3, -1.5], [0, 1.1, -1.8], pushK(f, 1700, 0.002), { fov: 45, roll: -0.08 });
const S10b = (f: number) => dolly([0.2, 1.1, -1.3], [0, 1.0, -1.6], pushK(f, 1740, 0.004), { fov: 30, roll: 0.15 }); // Horror realization

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 30, dur: 20, s: S1b }, { f: 60, dur: 20, s: S1c }],
  2: [{ f: 90, s: S2a }, { f: 120, dur: 15, s: S2b }, { f: 150, dur: 15, s: S2c }],
  3: [{ f: 180, s: S3a }, { f: 210, dur: 15, cut: true, s: S3b }, { f: 240, dur: 15, s: S3c }],
  4: [{ f: 270, s: S4a }, { f: 300, dur: 12, cut: true, s: S4b }, { f: 330, dur: 12, s: S4c }],
  5: [{ f: 360, s: S5a }, { f: 450, dur: 18, s: S5b }, { f: 550, dur: 18, s: S5c }, { f: 600, dur: 18, s: S5d }],
  6: [{ f: 720, s: S6a }, { f: 780, dur: 20, s: S6b }],
  7: [{ f: 900, s: S7a }, { f: 960, dur: 25, s: S7b }, { f: 1050, dur: 25, s: S7c }],
  8: [{ f: 1200, s: S8a }, { f: 1280, dur: 20, s: S8b }, { f: 1350, dur: 20, s: S8c }],
  9: [{ f: 1500, s: S9a }, { f: 1580, dur: 15, cut: true, s: S9b }, { f: 1620, dur: 15, cut: true, s: S9c }],
  10: [{ f: 1700, s: S10a }, { f: 1740, dur: 20, s: S10b }],
};

// Death flash kicks (screen shake on each reset)
const DEATH_KICKS: [number, number][] = [
  [0, 1.2], [3, 1.2], [6, 1.2],     // Hook: 3 quick deaths
  [4, 1.0], [7, 1.0], [10, 1.0],    // Toast, bus, cat
  [12, 0.8], [12.3, 0.8], [12.6, 0.8], // Crush loop (representative)
  [24, 1.5], [30, 1.2],             // Save point moving, montage
  [50, 1.8], [57, 2.0],             // Kiss, final twist
];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of DEATH_KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const faceFocus = (baseZ: number) => (f: number): V3 => [0, 1.0, baseZ];
export const DOF: Dof[] = [
  { f: 0, cInf: 12, focus: faceFocus(-1.5) },      // Bedroom CU
  { f: 90, cInf: 8, focus: faceFocus(3) },         // Kitchen
  { f: 120, dur: 15, cInf: 14, focus: faceFocus(3) }, // Toast CU
  { f: 180, cInf: 0 },                             // Street wide
  { f: 210, dur: 15, cInf: 16, focus: faceFocus(10) }, // Bus CU
  { f: 270, cInf: 10, focus: faceFocus(-1.5) },    // Bedroom
  { f: 300, dur: 12, cInf: 18, focus: faceFocus(-1.3) }, // Cat floor POV
  { f: 360, cInf: 6, focus: faceFocus(5) },        // Cafe wide
  { f: 450, dur: 18, cInf: 14, focus: faceFocus(5) }, // Face to face
  { f: 720, cInf: 10, focus: faceFocus(-1.5) },    // Bedroom night
  { f: 900, cInf: 8, focus: faceFocus(-1.5) },     // Montage
  { f: 1200, cInf: 8, focus: faceFocus(3) },       // Perfect kitchen
  { f: 1500, cInf: 14, focus: faceFocus(5) },      // Kiss CU
  { f: 1620, cInf: 10, focus: faceFocus(-1.5) },   // Alarm bedroom
  { f: 1700, cInf: 12, focus: faceFocus(-1.5) },   // Final twist
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

// ---------------- foreground props ----------------
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [
  // Bedroom: pillow near lens
  { a: 0, b: 90, kit: "pillow", pos: [0.5, 0.8, -1.2], s: 0.5, yaw: 0.3 },
  { a: 270, b: 360, kit: "pillow", pos: [0.5, 0.8, -1.2], s: 0.5, yaw: 0.3 },
  { a: 720, b: 900, kit: "pillow", pos: [0.5, 0.8, -1.2], s: 0.5, yaw: 0.3 },
  { a: 900, b: 1200, kit: "pillow", pos: [0.5, 0.8, -1.2], s: 0.5, yaw: 0.3 },
  { a: 1700, b: TOTAL, kit: "pillow", pos: [0.5, 0.8, -1.2], s: 0.5, yaw: 0.3 },
  // Kitchen: coffee mug
  { a: 90, b: 180, kit: "mug", pos: [-0.8, 1.0, 2.8], s: 0.15, yaw: 0 },
  { a: 1200, b: 1350, kit: "mug", pos: [-0.8, 1.0, 2.8], s: 0.15, yaw: 0 },
  // Street: bus stop sign
  { a: 180, b: 270, kit: "sign_post", pos: [1.5, 0, 9], s: 2.5, yaw: 0 },
  // Cafe: table edge
  { a: 360, b: 720, kit: "table_round", pos: [0, 0.7, 4.2], s: 0.8, yaw: 0 },
  { a: 1500, b: 1700, kit: "table_round", pos: [0, 0.7, 4.2], s: 0.8, yaw: 0 },
];