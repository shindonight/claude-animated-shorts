// Simplified room building for Subaru short: bedroom, kitchen, street, cafe
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { D0 } from "./story";
import { twoTone } from "./shade";

export type Kit = Record<string, THREE.Object3D>;
export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------- materials ----------------
const mats = new Map<string, THREE.Material>();
export const lam = (key: string, make: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key);
  if (!m) { m = twoTone(new THREE.MeshLambertMaterial(make())); mats.set(key, m); }
  return m as THREE.Material;
};

// Room materials
lam("bedroom_wall", () => ({ color: "#e8dcc8" }));
lam("bedroom_floor", () => ({ color: "#d4c4a8" }));
lam("bedroom_bed", () => ({ color: "#8b7355" }));
lam("bedroom_pillow", () => ({ color: "#f5f0e8" }));
lam("bedroom_blanket", () => ({ color: "#c4a484" }));
lam("kitchen_wall", () => ({ color: "#f0e8d8" }));
lam("kitchen_floor", () => ({ color: "#c8b8a0" }));
lam("kitchen_counter", () => ({ color: "#887868" }));
lam("kitchen_toast", () => ({ color: "#d4a848" }));
lam("kitchen_burnt_toast", () => ({ color: "#4a3a2a" }));
lam("street_asphalt", () => ({ color: "#4a4a4a" }));
lam("street_sidewalk", () => ({ color: "#888888" }));
lam("street_building", () => ({ color: "#b8a898" }));
lam("street_bus", () => ({ color: "#c84838" }));
lam("street_sign", () => ({ color: "#2868a8" }));
lam("cafe_wall", () => ({ color: "#d8c8b8" }));
lam("cafe_floor", () => ({ color: "#c8b098" }));
lam("cafe_table", () => ({ color: "#886848" }));
lam("cafe_chair", () => ({ color: "#685848" }));
lam("cafe_window", () => ({ color: "#88ccff" }));
lam("night_sky", () => ({ color: "#181838" }));
lam("night_moon", () => ({ color: "#f8f0d8" }));

// Character materials (shared)
lam("skin", () => ({ color: "#f8d8b8" }));
lam("hair_dark", () => ({ color: "#382820" }));
lam("hair_brown", () => ({ color: "#684830" }));
lam("shirt_blue", () => ({ color: "#4868a8" }));
lam("shirt_green", () => ({ color: "#488848" }));
lam("shirt_red", () => ({ color: "#c84838" }));
lam("pants_dark", () => ({ color: "#383848" }));
lam("pants_jeans", () => ({ color: "#485888" }));
lam("shoes", () => ({ color: "#282828" }));

// ---------------- geometry helpers ----------------
export class Batch {
  private g = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(geo: THREE.BufferGeometry, mat: THREE.Material, m?: THREE.Matrix4) {
    const src = geo.index ? geo.toNonIndexed() : geo;
    const x = new THREE.BufferGeometry();
    x.setAttribute("position", this.f32(src.attributes.position));
    if (src.attributes.normal) x.setAttribute("normal", this.f32(src.attributes.normal)); else x.computeVertexNormals();
    x.setAttribute("uv", src.attributes.uv ? this.f32(src.attributes.uv) : new THREE.Float32BufferAttribute(new Float32Array(src.attributes.position.count * 2), 2));
    if (m) x.applyMatrix4(m);
    const l = this.g.get(mat);
    if (l) l.push(x); else this.g.set(mat, [x]);
  }
  private f32(a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    return new THREE.Float32BufferAttribute(out, a.itemSize);
  }
  build(parent: THREE.Object3D, cast = true) {
    for (const [mat, list] of this.g) {
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.castShadow = cast; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
      parent.add(mesh);
    }
    this.g.clear();
  }
}

const f32 = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  return new THREE.Float32BufferAttribute(out, a.itemSize);
};

export const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, u1 = 1, v1 = 1, u0 = 0, v0 = 0) => {
  const g = new THREE.BufferGeometry();
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c, a, c, d].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2, 3, 4, 5].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1], 2));
  return g;
};

export const boxGeo = (min: THREE.Vector3, max: THREE.Vector3, tile = 0, bottom = false) => {
  const [x0, y0, z0] = [min.x, min.y, min.z], [x1, y1, z1] = [max.x, max.y, max.z];
  const t = (a: number) => (tile ? a / tile : 1);
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const faces = [
    quad(V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1), t(w), t(h)),
    quad(V(x1, y0, z0), V(x0, y0, z0), V(x0, y1, z0), V(x1, y1, z0), t(w), t(h)),
    quad(V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0), t(d), t(h)),
    quad(V(x1, y0, z1), V(x1, y0, z0), V(x1, y1, z0), V(x1, y1, z1), t(d), t(h)),
    quad(V(x0, y1, z1), V(x1, y1, z1), V(x1, y1, z0), V(x0, y1, z0), t(w), t(d)),
  ];
  if (bottom) faces.push(quad(V(x0, y0, z0), V(x1, y0, z0), V(x1, y0, z1), V(x0, y0, z1), t(w), t(d)));
  return mergeGeometries(faces, false);
};

// ---------------- room builders ----------------
export const buildBedroom = (root: THREE.Object3D) => {
  const b = new Batch();
  const m = new THREE.Matrix4();
  // Floor
  b.add(boxGeo(V(-4, 0, -4), V(4, 0.05, 4), 0, true), lam("bedroom_floor", () => ({})));
  // Walls
  b.add(boxGeo(V(-4, 0, -4), V(4, 3, -3.95)), lam("bedroom_wall", () => ({}))); // back
  b.add(boxGeo(V(-4, 0, 3.95), V(4, 3, 4), 0, true), lam("bedroom_wall", () => ({}))); // front (window)
  b.add(boxGeo(V(-4, 0, -4), V(-3.95, 3, 4)), lam("bedroom_wall", () => ({}))); // left
  b.add(boxGeo(V(3.95, 0, -4), V(4, 3, 4)), lam("bedroom_wall", () => ({}))); // right
  // Bed
  b.add(boxGeo(V(-1.5, 0.05, -1), V(1.5, 0.6, 1.5)), lam("bedroom_bed", () => ({})));
  // Pillow
  b.add(boxGeo(V(-0.8, 0.6, -0.5), V(0.8, 0.8, 0.5)), lam("bedroom_pillow", () => ({})));
  // Blanket
  b.add(boxGeo(V(-1.3, 0.05, -0.8), V(1.3, 0.1, 1.3)), lam("bedroom_blanket", () => ({})));
  // Nightstand
  b.add(boxGeo(V(1.8, 0.05, -1.5), V(2.5, 0.7, -0.8)), lam("bedroom_bed", () => ({})));
  // Alarm clock on nightstand
  b.add(boxGeo(V(2.0, 0.75, -1.3), V(2.3, 0.9, -1.0)), lam("hair_dark", () => ({})));
  b.build(root);
};

export const buildKitchen = (root: THREE.Object3D) => {
  const b = new Batch();
  // Floor
  b.add(boxGeo(V(-4, 0, -3), V(4, 0.05, 3), 0, true), lam("kitchen_floor", () => ({})));
  // Walls
  b.add(boxGeo(V(-4, 0, -3), V(4, 3, -2.95)), lam("kitchen_wall", () => ({})));
  b.add(boxGeo(V(-4, 0, 2.95), V(4, 3, 3), 0, true), lam("kitchen_wall", () => ({}))); // window
  b.add(boxGeo(V(-4, 0, -3), V(-3.95, 3, 3)), lam("kitchen_wall", () => ({})));
  b.add(boxGeo(V(3.95, 0, -3), V(4, 3, 3)), lam("kitchen_wall", () => ({})));
  // Counter
  b.add(boxGeo(V(-3.5, 0.05, -2.5), V(3.5, 1.0, -1.5)), lam("kitchen_counter", () => ({})));
  // Toaster
  b.add(boxGeo(V(-1, 1.0, -2.2), V(-0.3, 1.5, -1.7)), lam("kitchen_toast", () => ({})));
  // Toast (burnt)
  b.add(boxGeo(V(-0.8, 1.5, -2.1), V(-0.5, 1.6, -1.8)), lam("kitchen_burnt_toast", () => ({})));
  // Fridge
  b.add(boxGeo(V(2.5, 0.05, -2.8), V(3.5, 2.0, -1.8)), lam("kitchen_counter", () => ({})));
  b.build(root);
};

export const buildStreet = (root: THREE.Object3D) => {
  const b = new Batch();
  // Asphalt road
  b.add(boxGeo(V(-50, 0, -3), V(50, 0.05, 3), 0, true), lam("street_asphalt", () => ({})));
  // Sidewalks
  b.add(boxGeo(V(-50, 0.05, 3), V(50, 0.15, 6), 0, true), lam("street_sidewalk", () => ({})));
  b.add(boxGeo(V(-50, 0.05, -6), V(50, 0.15, -3), 0, true), lam("street_sidewalk", () => ({})));
  // Buildings along street
  for (let x = -45; x <= 45; x += 10) {
    const w = 8, h = 8 + Math.random() * 4;
    b.add(boxGeo(V(x - w/2, 0.15, 3.2), V(x + w/2, h, 5.2)), lam("street_building", () => ({})));
    b.add(boxGeo(V(x - w/2, 0.15, -5.2), V(x + w/2, h, -3.2)), lam("street_building", () => ({})));
  }
  // Bus stop sign
  b.add(boxGeo(V(0, 0.15, 3.5), V(0.1, 3.0, 3.6)), lam("street_sign", () => ({})));
  // Bus (positioned for shot)
  b.add(boxGeo(V(15, 0.15, -2), V(25, 2.5, 2)), lam("street_bus", () => ({})));
  b.build(root);
};

export const buildCafe = (root: THREE.Object3D) => {
  const b = new Batch();
  // Floor
  b.add(boxGeo(V(-5, 0, -5), V(5, 0.05, 5), 0, true), lam("cafe_floor", () => ({})));
  // Walls
  b.add(boxGeo(V(-5, 0, -5), V(5, 3, -4.95)), lam("cafe_wall", () => ({})));
  b.add(boxGeo(V(-5, 0, 4.95), V(5, 3, 5), 0, true), lam("cafe_window", () => ({}))); // big window
  b.add(boxGeo(V(-5, 0, -5), V(-4.95, 3, 5)), lam("cafe_wall", () => ({})));
  b.add(boxGeo(V(4.95, 0, -5), V(5, 3, 5)), lam("cafe_wall", () => ({})));
  // Tables and chairs
  for (let i = 0; i < 4; i++) {
    const x = -2 + i * 1.5;
    b.add(boxGeo(V(x - 0.5, 0.05, -1), V(x + 0.5, 0.75, 1)), lam("cafe_table", () => ({})));
    b.add(boxGeo(V(x - 0.7, 0.05, -1.5), V(x - 0.3, 0.45, -1.1)), lam("cafe_chair", () => ({})));
    b.add(boxGeo(V(x + 0.3, 0.05, -1.5), V(x + 0.7, 0.45, -1.1)), lam("cafe_chair", () => ({})));
  }
  // Counter
  b.add(boxGeo(V(-5, 0.05, -5), V(5, 1.1, -4.5)), lam("cafe_table", () => ({ color: "#886848" })));
  b.build(root);
};

export const buildNightBedroom = (root: THREE.Object3D) => {
  const b = new Batch();
  // Same as bedroom but darker
  b.add(boxGeo(V(-4, 0, -4), V(4, 0.05, 4), 0, true), lam("bedroom_floor", () => ({ color: "#4a4038" })));
  b.add(boxGeo(V(-4, 0, -4), V(4, 3, -3.95)), lam("bedroom_wall", () => ({ color: "#383028" })));
  b.add(boxGeo(V(-4, 0, 3.95), V(4, 3, 4), 0, true), lam("night_sky", () => ({})));
  b.add(boxGeo(V(-4, 0, -4), V(-3.95, 3, 4)), lam("bedroom_wall", () => ({ color: "#383028" })));
  b.add(boxGeo(V(3.95, 0, -4), V(4, 3, 4)), lam("bedroom_wall", () => ({ color: "#383028" })));
  // Bed
  b.add(boxGeo(V(-1.5, 0.05, -1), V(1.5, 0.6, 1.5)), lam("bedroom_bed", () => ({ color: "#4a3828" })));
  b.add(boxGeo(V(-0.8, 0.6, -0.5), V(0.8, 0.8, 0.5)), lam("bedroom_pillow", () => ({ color: "#584838" })));
  b.add(boxGeo(V(-1.3, 0.05, -0.8), V(1.3, 0.1, 1.3)), lam("bedroom_blanket", () => ({ color: "#584838" })));
  // Moon through window
  b.add(boxGeo(V(-2, 2.0, 3.95), V(-1.5, 2.5, 4.0)), lam("night_moon", () => ({})));
  b.build(root);
};

// Export a function to build the right room for a shot
export const buildRoom = (root: THREE.Object3D, crowd: string) => {
  switch (crowd) {
    case "bedroom":
    case "bedroom2":
      buildBedroom(root);
      break;
    case "kitchen":
      buildKitchen(root);
      break;
    case "street":
      buildStreet(root);
      break;
    case "cafe":
      buildCafe(root);
      break;
    case "none":
      // Empty void for transition shots
      break;
  }
};

export const kitClone = (kit: Kit, name: string, h: number): THREE.Object3D | null => {
  // For foreground props - simple boxes
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = lam(name, () => ({ color: "#888888" }));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(h);
  mesh.position.y = h / 2;
  g.add(mesh);
  return g;
};