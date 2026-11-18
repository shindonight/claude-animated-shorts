// Light presets for Subaru short
export type LightPreset = {
  name: string;
  az: number; el: number;           // sun azimuth/elevation (deg)
  sky: string; ground: string; hemiI: number;
  sunCol: string; sunI: number;
  lit: [number, number, number];    // two-tone lit colour
  shade: [number, number, number];  // two-tone shade colour
  lift: [number, number, number];   // shade lift
  lambert: number; sideK: number; term: number; bias: number; normalBias: number;
  fog: string; fogNear: number; fogFar: number;
  charTint: [number, number, number]; charShade: number; charGrad: number;
  bodyGrad: number; sideTint: [number, number, number];
  sat: number;
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: [number, number, number] };
};

export const LIGHTS: Record<string, LightPreset> = {
  // Morning bedroom - warm, soft
  reset: {
    name: "reset",
    az: 45, el: 30,
    sky: "#ffebd8", ground: "#f8e8d8", hemiI: 1.0,
    sunCol: "#fff8e8", sunI: 2.0,
    lit: [1.15, 1.08, 0.95], shade: [0.35, 0.32, 0.38], lift: [0.08, 0.09, 0.12],
    lambert: 0.5, sideK: 0.3, term: 0.15, bias: -0.0002, normalBias: 2.5,
    fog: "#ffe8d0", fogNear: 3, fogFar: 30,
    charTint: [1.1, 1.0, 0.9], charShade: 0.4, charGrad: 0.6,
    bodyGrad: 0.7, sideTint: [1.0, 0.95, 0.85],
    sat: 1.1,
    water: { near: "#4a6888", mid: "#385878", far: "#284868", crest: "#88aacc", trough: "#283858", glint: "#fff8d8", shade: [0.4, 0.5, 0.6] },
  },
  // Day kitchen - bright, cheerful
  day: {
    name: "day",
    az: 60, el: 50,
    sky: "#cce8ff", ground: "#e8f0e8", hemiI: 1.2,
    sunCol: "#fff8e0", sunI: 2.5,
    lit: [1.2, 1.1, 0.95], shade: [0.3, 0.35, 0.4], lift: [0.06, 0.08, 0.1],
    lambert: 0.55, sideK: 0.35, term: 0.12, bias: -0.0002, normalBias: 2.5,
    fog: "#d0e8f8", fogNear: 5, fogFar: 50,
    charTint: [1.0, 1.0, 0.95], charShade: 0.35, charGrad: 0.55,
    bodyGrad: 0.65, sideTint: [0.95, 1.0, 0.9],
    sat: 1.15,
    water: { near: "#4888a8", mid: "#387898", far: "#286888", crest: "#88ccff", trough: "#285878", glint: "#fff0c8", shade: [0.35, 0.45, 0.55] },
  },
  // Golden hour street - warm, dramatic
  golden: {
    name: "golden",
    az: 10, el: 8,
    sky: "#ffd8a0", ground: "#f8e0c8", hemiI: 0.8,
    sunCol: "#ffc880", sunI: 3.0,
    lit: [1.3, 1.0, 0.7], shade: [0.45, 0.35, 0.55], lift: [0.1, 0.08, 0.15],
    lambert: 0.4, sideK: 0.5, term: 0.2, bias: -0.0001, normalBias: 3.0,
    fog: "#ffc080", fogNear: 10, fogFar: 80,
    charTint: [1.2, 0.95, 0.8], charShade: 0.5, charGrad: 0.7,
    bodyGrad: 0.8, sideTint: [1.1, 0.9, 0.75],
    sat: 1.25,
    water: { near: "#c88040", mid: "#a86030", far: "#884020", crest: "#ffd880", trough: "#683018", glint: "#ffc860", shade: [0.3, 0.4, 0.5] },
  },
  // Night bedroom - cool, moody
  night: {
    name: "night",
    az: 180, el: -20, // Moon from behind
    sky: "#181838", ground: "#282030", hemiI: 0.3,
    sunCol: "#e8e0f8", sunI: 0.5,
    lit: [0.6, 0.55, 0.7], shade: [0.15, 0.12, 0.2], lift: [0.03, 0.02, 0.05],
    lambert: 0.3, sideK: 0.6, term: 0.25, bias: -0.0003, normalBias: 2.0,
    fog: "#201830", fogNear: 2, fogFar: 20,
    charTint: [0.8, 0.75, 1.0], charShade: 0.6, charGrad: 0.8,
    bodyGrad: 0.5, sideTint: [0.7, 0.65, 0.9],
    sat: 0.8,
    water: { near: "#182840", mid: "#102038", far: "#081830", crest: "#486898", trough: "#081020", glint: "#a8c8f8", shade: [0.2, 0.3, 0.4] },
  },
};

// Sky colour stops per preset (elevation in degrees)
export const LOOK: Record<string, {
  sky: { c: string[]; e: number[] };
  cloud: string;
  water: LightPreset["water"];
  bounce: [number, number, number];
}> = {
  reset: {
    sky: { c: ["#fff0d8", "#ffe8c8", "#ffd8a8", "#ffc888", "#ffb868"], e: [85, 45, 15, 5, -10] },
    cloud: "#fff8e8",
    water: LIGHTS.reset.water,
    bounce: [1.1, 1.05, 0.9],
  },
  day: {
    sky: { c: ["#d8e8ff", "#cce0ff", "#b8d0ff", "#a0b8e8", "#8898c8"], e: [85, 50, 20, 10, -10] },
    cloud: "#ffffff",
    water: LIGHTS.day.water,
    bounce: [1.0, 1.05, 1.0],
  },
  golden: {
    sky: { c: ["#ffe0b0", "#ffd080", "#ffb860", "#ff9840", "#ff7830"], e: [85, 40, 15, 5, -10] },
    cloud: "#ffd8a8",
    water: LIGHTS.golden.water,
    bounce: [1.2, 1.0, 0.8],
  },
  night: {
    sky: { c: ["#282048", "#201840", "#181038", "#100830", "#080428"], e: [85, 50, 20, 10, -10] },
    cloud: "#383058",
    water: LIGHTS.night.water,
    bounce: [0.6, 0.55, 0.7],
  },
};

export const GRADES = {
  reset: { lift: [0.02, 0.01, 0.0], gamma: [1.0, 1.0, 1.0], gain: [1.05, 1.02, 0.98], sat: 1.05 },
  day: { lift: [0.01, 0.0, -0.01], gamma: [1.02, 1.0, 0.98], gain: [1.03, 1.0, 0.97], sat: 1.08 },
  golden: { lift: [0.03, 0.01, -0.02], gamma: [1.0, 1.02, 1.05], gain: [1.08, 1.0, 0.92], sat: 1.15 },
  night: { lift: [-0.01, -0.02, 0.0], gamma: [1.05, 1.03, 0.95], gain: [0.95, 0.92, 1.05], sat: 0.9 },
};

export const GRADE_STRENGTH = { reset: 0.8, day: 0.9, golden: 1.0, night: 0.7 };