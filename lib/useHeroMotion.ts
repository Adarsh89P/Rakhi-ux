"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Scroll timeline for the pinned hero → Selected Work section.
 * All values are fractions of the sticky container's scroll progress (0–1).
 */
export const TIMELINE = {
  /** Phase 2: tilt back + explode the layers (desktop / mobile) */
  explode: [0.04, 0.36],
  explodeMobile: [0.08, 0.8],
  /** Glass corridor fades in behind the tilted stack */
  tunnelIn: [0.24, 0.36],
  /** Phase 3: camera flies past the stack (it slides up and out of frame) … */
  stageExit: [0.32, 0.54],
  /** … and on down the corridor towards the Selected Work panel */
  camera: [0.34, 0.93],
  panelIn: [0.5, 0.64],
  tilesOut: [0.84, 0.93],
  /** The real, interactive Selected Work replaces the flying panel */
  work: [0.92, 0.97],
} as const;

/** Scroll position (0–1) where Selected Work has landed — used for the #work anchor */
export const WORK_ANCHOR_PROGRESS = 0.985;

/** translateZ (px) of each hero layer when fully exploded, before the device depth factor */
export const LAYER_DEPTH = {
  base: 0,
  background: 50,
  portrait: 140,
  outline: 230,
  ui: 190,
} as const;

export type HeroLayer = keyof typeof LAYER_DEPTH;

/** Z distance (px) from the camera's start to the Selected Work panel in the corridor */
export const TUNNEL_LENGTH = 3400;

const MAX_TILT_X = 60;
const EXIT_TILT_X = 14;
const MAX_TILT_Z = -3;
const MIN_STAGE_SCALE = 0.9;
const STAGE_LIFT_VH = -4;
const STAGE_EXIT_Y_VH = -115;
const STAGE_EXIT_Z = 260;

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

const toVisibility = (o: number) => (o > 0.001 ? "visible" : "hidden");

export type HeroMotion = {
  mode: HeroMotionMode;
  progress: MotionValue<number>;
  stage: {
    rotateX: MotionValue<number>;
    rotateZ: MotionValue<number>;
    scale: MotionValue<number>;
    y: MotionValue<string>;
    z: MotionValue<number>;
    visibility: MotionValue<"visible" | "hidden">;
  };
  layers: Record<HeroLayer, MotionValue<number>>;
  /** 0–1, drives the soft shadows between exploded slabs */
  shadowOpacity: MotionValue<number>;
  tunnel: {
    cameraZ: MotionValue<number>;
    opacity: MotionValue<number>;
    visibility: MotionValue<"visible" | "hidden">;
    tilesOpacity: MotionValue<number>;
    panelOpacity: MotionValue<number>;
  };
  work: {
    opacity: MotionValue<number>;
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

  const rotateX = useTransform(
    [explode, stageExit, tilt],
    ([e, s, t]: number[]) => e * t * MAX_TILT_X + s * EXIT_TILT_X,
  );
  const rotateZ = useTransform([explode, tilt], ([e, t]: number[]) => e * t * MAX_TILT_Z);
  const scale = useTransform([explode, tilt], ([e, t]: number[]) => 1 - e * t * (1 - MIN_STAGE_SCALE));
  const y = useTransform(
    [explode, stageExit],
    ([e, s]: number[]) => `${e * STAGE_LIFT_VH + s * STAGE_EXIT_Y_VH}vh`,
  );
  const stageZ = useTransform(stageExit, (s) => s * STAGE_EXIT_Z);
  const stageVisibility = useTransform(stageExit, (s) => (s < 0.999 ? "visible" : "hidden"));

  const layers: Record<HeroLayer, MotionValue<number>> = {
    base: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.base),
    background: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.background),
    portrait: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.portrait),
    outline: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.outline),
    ui: useTransform([explode, depth], ([e, d]: number[]) => e * d * LAYER_DEPTH.ui),
  };

  const shadowOpacity = useTransform([explode, depth], ([e, d]: number[]) => e * Math.min(1, d * 2));

  const cameraZ = useTransform(progress, (p) => ramp(p, TIMELINE.camera) * TUNNEL_LENGTH);
  const tunnelOpacity = useTransform([progress, fly], ([p, f]: number[]) => f * ramp(p, TIMELINE.tunnelIn));
  const tunnelVisibility = useTransform(tunnelOpacity, toVisibility);
  const tilesOpacity = useTransform(progress, (p) => 1 - ramp(p, TIMELINE.tilesOut));

  const workReveal = useTransform([progress, fly], ([p, f]: number[]) => f * ramp(p, TIMELINE.work));
  // The flying placeholder panel hands over to the real card once it has landed
  const panelOpacity = useTransform([progress, workReveal], ([p, w]: number[]) => ramp(p, TIMELINE.panelIn) * (1 - w));
  const workPointerEvents = useTransform(workReveal, (w) => (w > 0.6 ? "auto" : "none"));

  return {
    mode,
    progress,
    stage: { rotateX, rotateZ, scale, y, z: stageZ, visibility: stageVisibility },
    layers,
    shadowOpacity,
    tunnel: {
      cameraZ,
      opacity: tunnelOpacity,
      visibility: tunnelVisibility,
      tilesOpacity,
      panelOpacity,
    },
    work: { opacity: workReveal, pointerEvents: workPointerEvents },
  };
}
