// "What If You Had Subaru's Return by Death in Real Life?" — TikTok humor short
// One three.js world (world.ts) posed per frame from the story timeline (story.ts).
// Post chain: InkPass -> LensBlur (DOF) -> Bloom -> NEUTRAL tone mapping -> Grade (MSAA 4).
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback, NOINK } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from "./story";

export const SUBARU_FRAMES = TOTAL;

/** A/B switches for test stills only */
/** Dev mode: inputProps `{ dev: true }` disables heavy post-processing (lens blur, bloom, grain) for faster rendering on low-end devices. */
type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean; dev: boolean };
const toggles = (): PostToggles => {
  const input = getInputProps() as { post?: Partial<PostToggles>; dev?: boolean };
  const dev = input.dev === true;
  // In dev mode, disable lens blur, bloom, and grain for performance
  return {
    ink: true,
    lens: !dev,
    pre: !dev,
    bloom: !dev,
    grade: !dev,
    grain: false,
    dev,
    ...(input.post ?? {}),
  };
};

/** Bloom for emissive sources only */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("subaru kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }),
  }), [camera, scene]);
  useEffect(() => () => { if (fx.ink && typeof fx.ink.dispose === 'function') fx.ink.dispose(); }, [fx]);

  const post = useMemo(() => {
    const passes = [];
    if (on.ink) passes.push(<primitive key="ink" object={fx.ink} dispose={null} />);
    if (on.lens && on.pre) passes.push(<primitive key="lensPre" object={fx.lens.pre} dispose={null} />);
    if (on.lens) passes.push(<primitive key="lensMain" object={fx.lens.main} dispose={null} />);
    if (on.bloom) passes.push(<primitive key="bloom" object={fx.bloom} dispose={null} />);
    passes.push(<primitive key="tone" object={fx.tone} dispose={null} />);
    if (on.grade) passes.push(<primitive key="grade" object={fx.grade} dispose={null} />);
    if (on.grain) passes.push(<primitive key="grain" object={fx.grain} dispose={null} />);
    return <EffectComposer multisampling={4}>{passes}</EffectComposer>;
  }, [fx, on]);

  const cam = camera as THREE.PerspectiveCamera;
  const focusArr = world.update(id, f, cam, scene);
  target.set(focusArr[0], focusArr[1], focusArr[2]);
  noInkFallback(world.root);

  // thin-lens focus
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) { const foc = d.focus(f); fpt.set(foc[0], foc[1], foc[2]); } else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  fx.ink.updateParams(d.cInf, fx.lens.focus);
  gradeFor(fx.grade, SHOTS[id - 1].light);
  fx.grain.seed = f;

  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;

const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.2, far: 500 }}>
      <Inner id={id} kit={kit} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const SubaruShort: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;

  // White flash on death resets
  let flash = 0;
  for (const flashFrame of FLASH_AT) {
    if (f >= flashFrame && f < flashFrame + 4) {
      flash = [1, 0.75, 0.45, 0.2][f - flashFrame];
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
    </AbsoluteFill>
  );
};