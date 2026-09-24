"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Scroll timeline for the pinned hero → Selected Work section.
 * All values are fractions of the sticky container's scroll progress (0–1).
 */
export const TIMELINE = {
  /** Phase 2: tilt back + explode layers */
  explodeStart: 0.1,
  explodeEnd: 0.42,
  /** Phase 3: stage dives away, camera flies through the glass tunnel */
  stageExitStart: 0.5,
  stageExitEnd: 0.66,
  tunnelIn: [0.42, 0.52],
  tunnelOut: [0.86, 0.94],
  /** Selected Work reveal (with / without the fly-through) */
  workIn: [0.84, 0.96],
  workInNoFly: [0.55, 0.72],
} as const;

/** translateZ (px) of each hero layer when fully exploded, before the device depth factor */
export const LAYER_DEPTH = {
  background: 0,
  portrait: 90,
  outline: 180,
  ui: 260,
} as const;

export type HeroLayer = keyof typeof LAYER_DEPTH;

/** Total Z distance (px) the camera travels through the glass tunnel */
export const TUNNEL_LENGTH = 2400;

const MAX_TILT_X = 55;
const MAX_TILT_Z = -8;
const MIN_STAGE_SCALE = 0.72;
const STAGE_DIVE_Z = 900;

export type HeroMotionMode = "full" | "mobile" | "reduced";

type Profile = { tilt: number; depth: number; fly: number };

const PROFILES: Record<HeroMotionMode, Profile> = {
  full: { tilt: 1, depth: 1, fly: 1 },
  // Mobile: gentler tilt, shallower stack, no fly-through
  mobile: { tilt: 0.45, depth: 0.35, fly: 0 },
  reduced: { tilt: 0, depth: 0, fly: 0 },
};

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

/** 0 → 1 between `start` and `end`, clamped, with ease-in-out */
function ramp(p: number, start: number, end: number) {
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
    z: MotionValue<number>;
    opacity: MotionValue<number>;
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
 * Pass the ref of the tall (~300vh) container whose child is `position: sticky`.
 */
export function useHeroMotion(target: RefObject<HTMLElement | null>): HeroMotion {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
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

  const explode = useTransform(progress, (p) => ramp(p, TIMELINE.explodeStart, TIMELINE.explodeEnd));
  const stageExit = useTransform(progress, (p) =>
    ramp(p, TIMELINE.stageExitStart, TIMELINE.stageExitEnd),
  );

  const rotateX = useTransform([explode, tilt], ([e, t]: number[]) => e * t * MAX_TILT_X);
  const rotateZ = useTransform([explode, tilt], ([e, t]: number[]) => e * t * MAX_TILT_Z);
  const scale = useTransform(explode, (e) => 1 - e * (1 - MIN_STAGE_SCALE));
  const stageZ = useTransform([stageExit, fly], ([s, f]: number[]) => s * f * STAGE_DIVE_Z);
  const stageOpacity = useTransform(stageExit, (s) => 1 - s);

  const layers: Record<HeroLayer, MotionValue<number>> = {
    background: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.background),
    portrait: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.portrait),
    outline: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.outline),
    ui: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.ui),
  };

  const shadowOpacity = useTransform([explode, depth], ([e, d]: number[]) => e * Math.min(1, d * 2));

  const cameraZ = useTransform(
    progress,
    (p) => ramp(p, TIMELINE.tunnelIn[0], TIMELINE.tunnelOut[1]) * TUNNEL_LENGTH,
  );
  const tunnelOpacity = useTransform(
    [progress, fly],
    ([p, f]: number[]) =>
      f * (ramp(p, TIMELINE.tunnelIn[0], TIMELINE.tunnelIn[1]) - ramp(p, TIMELINE.tunnelOut[0], TIMELINE.tunnelOut[1])),
  );
  const tunnelVisibility = useTransform(tunnelOpacity, (o) => (o > 0.001 ? "visible" : "hidden"));

  const workReveal = useTransform([progress, fly], ([p, f]: number[]) => {
    const [start, end] = f > 0 ? TIMELINE.workIn : TIMELINE.workInNoFly;
    return ramp(p, start, end);
  });
  const workScale = useTransform(workReveal, (w) => 0.92 + w * 0.08);
  const workPointerEvents = useTransform(workReveal, (w) => (w > 0.6 ? "auto" : "none"));

  return {
    mode,
    progress,
    stage: { rotateX, rotateZ, scale, z: stageZ, opacity: stageOpacity },
    layers,
    shadowOpacity,
    tunnel: { cameraZ, opacity: tunnelOpacity, visibility: tunnelVisibility },
    work: { opacity: workReveal, scale: workScale, pointerEvents: workPointerEvents },
  };
}
