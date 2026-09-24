"use client";

import { motion, type MotionValue } from "framer-motion";

import { SlabEdge } from "@/components/hero/SlabEdge";

type GlassTileTunnelProps = {
  cameraZ: MotionValue<number>;
  opacity: MotionValue<number>;
  visibility: MotionValue<"visible" | "hidden">;
};

const TILE_W = 320;
const TILE_D = 280;
const TILE_THICKNESS = 22;
const COLUMNS = [-510, -170, 170, 510];
const ROWS = 10;
const ROW_GAP = 320;
const FIRST_ROW_Z = -300;
const FLOOR_Y = 300;
const CEILING_Y = -330;

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

/**
 * Phase 3: a corridor of thick frosted-glass tiles (ceiling + floor) lit by a
 * blue/pink/orange glow. Only the world's translateZ animates, so the whole
 * fly-through is a single transform per frame.
 */
export function GlassTileTunnel({ cameraZ, opacity, visibility }: GlassTileTunnelProps) {
  return (
    <motion.div aria-hidden className="absolute inset-0 overflow-hidden bg-[#050507]" style={{ opacity, visibility }}>
      {/* Glow behind the glass */}
      <div
        className="absolute inset-0 blur-3xl"
        style={{
          background: [
            "radial-gradient(34% 48% at 34% 58%, rgb(59 130 246 / 1), transparent 72%)",
            "radial-gradient(30% 46% at 52% 50%, rgb(236 72 153 / 0.95), transparent 72%)",
            "radial-gradient(32% 46% at 70% 58%, rgb(251 146 60 / 1), transparent 72%)",
          ].join(","),
        }}
      />

      <div className="absolute inset-0" style={{ perspective: 900, perspectiveOrigin: "50% 50%" }}>
        <motion.div
          className="absolute left-1/2 top-1/2 h-0 w-0 will-change-transform"
          style={{ z: cameraZ, transformStyle: "preserve-3d" }}
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
}
