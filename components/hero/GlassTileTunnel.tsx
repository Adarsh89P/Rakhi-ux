"use client";

import { motion, type MotionValue } from "framer-motion";

import { SlabEdge } from "@/components/hero/SlabEdge";
import { WORK_PANEL_SIZE, WORK_PANEL_SURFACE } from "@/components/hero/SelectedWork";
import { TUNNEL_LENGTH } from "@/lib/useHeroMotion";
import { cn } from "@/lib/utils";

type GlassTileTunnelProps = {
  cameraZ: MotionValue<number>;
  opacity: MotionValue<number>;
  visibility: MotionValue<"visible" | "hidden">;
  tilesOpacity: MotionValue<number>;
  panelOpacity: MotionValue<number>;
};

const PERSPECTIVE = 900;
const TILE_W = 320;
const TILE_D = 280;
const TILE_THICKNESS = 26;
const COLUMNS = [-510, -170, 170, 510];
const ROWS = 12;
const ROW_GAP = 320;
const FIRST_ROW_Z = -200;
const FLOOR_Y = 320;
const CEILING_Y = -360;

type Tile = { key: string; x: number; y: number; z: number; plane: "floor" | "ceiling" };

const TILES: Tile[] = (["ceiling", "floor"] as const).flatMap((plane) =>
  Array.from({ length: ROWS }, (_, row) =>
    COLUMNS.map((x) => ({
      key: `${plane}-${row}-${x}`,
      x,
      y: plane === "floor" ? FLOOR_Y : CEILING_Y,
      z: FIRST_ROW_Z - row * ROW_GAP,
      plane,
    })),
  ).flat(),
);

/** A perspective viewport whose single child "world" is moved by the camera */
function World({
  cameraZ,
  opacity,
  children,
}: {
  cameraZ: MotionValue<number>;
  opacity: MotionValue<number>;
  children: React.ReactNode;
}) {
  // Opacity sits on the flat wrapper: on the preserve-3d world it would flatten it
  return (
    <motion.div className="absolute inset-0" style={{ opacity, perspective: PERSPECTIVE }}>
      <motion.div
        className="absolute left-1/2 top-1/2 h-0 w-0 will-change-transform"
        style={{ z: cameraZ, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Phase 3: a corridor of thick frosted-glass tiles (ceiling + floor) under an
 * arched blue/pink/orange glow, ending in the blank Selected Work panel.
 * Only the worlds' translateZ animates — one transform per frame.
 */
export function GlassTileTunnel({ cameraZ, opacity, visibility, tilesOpacity, panelOpacity }: GlassTileTunnelProps) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_50%_45%,#1a2552_0%,#0b1230_55%,#060a1c_100%)]"
      style={{ opacity, visibility }}
    >
      {/* Arched glow: blue → pink → orange ring, blurred, only its top half on screen */}
      <div className="absolute left-1/2 top-[calc(78vh-46vw)] aspect-square w-[92vw] -translate-x-1/2 blur-[60px]">
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "conic-gradient(from 240deg, rgb(37 99 235) 0deg, rgb(147 197 253) 50deg, rgb(244 114 182) 120deg, rgb(251 146 60) 190deg, rgb(251 191 36) 240deg, rgb(37 99 235) 360deg)",
            WebkitMaskImage: "radial-gradient(closest-side, transparent 52%, #000 64%, #000 80%, transparent 100%)",
            maskImage: "radial-gradient(closest-side, transparent 52%, #000 64%, #000 80%, transparent 100%)",
          }}
        />
      </div>

      <World cameraZ={cameraZ} opacity={tilesOpacity}>
        {TILES.map((tile) => (
          <div
            key={tile.key}
            className="absolute rounded-[14px] border border-white/60 bg-[linear-gradient(140deg,rgb(255_255_255/0.55),rgb(226_232_240/0.22)_45%,rgb(191_219_254/0.3))] shadow-[inset_0_0_40px_rgb(255_255_255/0.25)]"
            style={{
              width: TILE_W,
              height: TILE_D,
              left: -TILE_W / 2,
              top: -TILE_D / 2,
              transformStyle: "preserve-3d",
              transform: `translate3d(${tile.x}px, ${tile.y}px, ${tile.z}px) rotateX(${tile.plane === "floor" ? 90 : -90}deg)`,
            }}
          >
            {/* The edge facing the camera: bottom for the floor, top for the ceiling */}
            <SlabEdge
              thickness={TILE_THICKNESS}
              side={tile.plane === "floor" ? "bottom" : "top"}
              className="bg-gradient-to-b from-white/90 to-sky-100/40"
            />
          </div>
        ))}
      </World>

      {/* Blank panel waiting at the end of the corridor; lands exactly where SelectedWork renders */}
      <World cameraZ={cameraZ} opacity={panelOpacity}>
        <div
          className={cn("absolute left-0 top-0", WORK_PANEL_SIZE, WORK_PANEL_SURFACE)}
          style={{ transform: `translate(-50%, -50%) translateZ(${-TUNNEL_LENGTH}px)` }}
        />
      </World>
    </motion.div>
  );
}
