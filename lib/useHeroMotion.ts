"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";
import {
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Scroll timeline for the pinned hero → Selected Work section.
 * All values are fractions of the sticky container's scroll progress (0–1).
 */
export const TIMELINE = {
  /** Phase 2: tilt back + explode layers (desktop / mobile) */
  explode: [0.06, 0.36],
  explodeMobile: [0.08, 0.8],
  /** Phase 3: stage dives under the camera while the glass tunnel takes over */
  stageExit: [0.37, 0.49],
  tunnelIn: [0.42, 0.52],
  camera: [0.4, 0.92],
  tunnelDim: [0.84, 0.96],
  /** Selected Work lands */
  work: [0.84, 0.96],
} as const;

/** Scroll position (0–1) where Selected Work is fully visible — used for the #work anchor */
export const WORK_ANCHOR_PROGRESS = 0.97;

/** translateZ (px) of each hero layer when fully exploded, before the device depth factor */
export const LAYER_DEPTH = {
  base: 0,
  background: 40,
  portrait: 130,
  outline: 200,
  ui: 280,
} as const;

export type HeroLayer = keyof typeof LAYER_DEPTH;

/** Total Z distance (px) the camera travels through the glass tunnel */
export const TUNNEL_LENGTH = 2600;

const MAX_TILT_X = 55;
const MAX_TILT_Z = -6;
const MIN_STAGE_SCALE = 0.62;
const STAGE_LIFT_VH = -6;
const STAGE_DIVE_Z = 700;

export type HeroMotionMode = "full" | "mobile" | "reduced";

type Profile = { tilt: number; depth: number; fly: number };

const PROFILES: Record<HeroMotionMode, Profile> = {
  full: { tilt: 1, depth: 1, fly: 1 },
  // Mobile: gentler tilt, shallower stack, no fly-through
  mobile: { tilt: 0.55, depth: 0.4, fly: 0 },
  reduced: { tilt: 0, depth: 0, fly: 0 },
};

/**
 * Media query state that hydrates safely: the server snapshot (false) is used
 * during hydration, then React re-renders with the real value.
 */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** 0 → 1 between `start` and `end`, clamped, with ease-in-out */
function ramp(p: number, [start, end]: readonly [number, number]) {
  const t = Math.min(1, Math.max(0, (p - start) / (end - start)));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export type HeroMotion = {
  mode: HeroMotionMode;
  progress: MotionValue<number>;
  stage: {
    rotateX: MotionValue<number>;
    rotateZ: MotionValue<number>;
    scale: MotionValue<number>;
    y: MotionValue<string>;
    z: MotionValue<number>;
    opacity: MotionValue<number>;
    visibility: MotionValue<"visible" | "hidden">;
  };
  layers: Record<HeroLayer, MotionValue<number>>;
  /** 0–1, drives the soft shadows between exploded slabs */
  shadowOpacity: MotionValue<number>;
  tunnel: {
    cameraZ: MotionValue<number>;
    opacity: MotionValue<number>;
    visibility: MotionValue<"visible" | "hidden">;
  };
  work: {
    opacity: MotionValue<number>;
    scale: MotionValue<number>;
    pointerEvents: MotionValue<"auto" | "none">;
  };
};

/**
 * Single source of scroll-driven motion for the hero → Selected Work sequence.
 * Pass the ref of the tall container whose child is `position: sticky`.
 */
export function useHeroMotion(target: RefObject<HTMLElement | null>): HeroMotion {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const mode: HeroMotionMode = prefersReduced ? "reduced" : isMobile ? "mobile" : "full";

  const { scrollYProgress: progress } = useScroll({
    target,
    offset: ["start start", "end end"],
  });

  // Profile factors live in motion values so the transforms below re-evaluate
  // when the device mode changes, without re-creating hooks.
  const tilt = useMotionValue(PROFILES[mode].tilt);
  const depth = useMotionValue(PROFILES[mode].depth);
  const fly = useMotionValue(PROFILES[mode].fly);

  useEffect(() => {
    const profile = PROFILES[mode];
    tilt.set(profile.tilt);
    depth.set(profile.depth);
    fly.set(profile.fly);
  }, [mode, tilt, depth, fly]);

  const explode = useTransform([progress, fly], ([p, f]: number[]) =>
    ramp(p, f > 0 ? TIMELINE.explode : TIMELINE.explodeMobile),
  );
  // Only the desktop fly-through takes the stage away
  const stageExit = useTransform([progress, fly], ([p, f]: number[]) => f * ramp(p, TIMELINE.stageExit));

  const rotateX = useTransform([explode, tilt], ([e, t]: number[]) => e * t * MAX_TILT_X);
  const rotateZ = useTransform([explode, tilt], ([e, t]: number[]) => e * t * MAX_TILT_Z);
  const scale = useTransform([explode, tilt], ([e, t]: number[]) => 1 - e * t * (1 - MIN_STAGE_SCALE));
  const y = useTransform([explode, stageExit], ([e, s]: number[]) => `${e * STAGE_LIFT_VH + s * 40}vh`);
  const stageZ = useTransform(stageExit, (s) => s * STAGE_DIVE_Z);
  const stageOpacity = useTransform(stageExit, (s) => 1 - s);
  const stageVisibility = useTransform(stageOpacity, (o) => (o > 0.001 ? "visible" : "hidden"));

  const layers: Record<HeroLayer, MotionValue<number>> = {
    base: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.base),
    background: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.background),
    portrait: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.portrait),
    outline: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.outline),
    ui: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.ui),
  };

  const shadowOpacity = useTransform([explode, depth], ([e, d]: number[]) => e * Math.min(1, d * 2));

  const cameraZ = useTransform(progress, (p) => ramp(p, TIMELINE.camera) * TUNNEL_LENGTH);
  const tunnelOpacity = useTransform(
    [progress, fly],
    ([p, f]: number[]) => f * (ramp(p, TIMELINE.tunnelIn) - 0.45 * ramp(p, TIMELINE.tunnelDim)),
  );
  const tunnelVisibility = useTransform(tunnelOpacity, (o) => (o > 0.001 ? "visible" : "hidden"));

  const workReveal = useTransform([progress, fly], ([p, f]: number[]) => f * ramp(p, TIMELINE.work));
  const workScale = useTransform(workReveal, (w) => 0.9 + w * 0.1);
  const workPointerEvents = useTransform(workReveal, (w) => (w > 0.6 ? "auto" : "none"));

  return {
    mode,
    progress,
    stage: {
      rotateX,
      rotateZ,
      scale,
      y,
      z: stageZ,
      opacity: stageOpacity,
      visibility: stageVisibility,
    },
    layers,
    shadowOpacity,
    tunnel: { cameraZ, opacity: tunnelOpacity, visibility: tunnelVisibility },
    work: { opacity: workReveal, scale: workScale, pointerEvents: workPointerEvents },
  };
}
