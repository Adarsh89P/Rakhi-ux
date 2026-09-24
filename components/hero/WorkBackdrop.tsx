"use client";

import { motion, type MotionValue } from "framer-motion";

import { WORK_PANEL_SIZE, WORK_PANEL_SURFACE } from "@/components/hero/SelectedWork";
import { cn } from "@/lib/utils";

type WorkBackdropProps = {
  opacity: MotionValue<number>;
  visibility: MotionValue<"visible" | "hidden">;
  panelZ: MotionValue<number>;
  panelOpacity: MotionValue<number>;
};

/**
 * Phase 3: navy backdrop with an arched blue/pink/orange glow, and a blank
 * frosted panel that flies towards the camera and lands exactly where
 * SelectedWork renders.
 */
export function WorkBackdrop({ opacity, visibility, panelZ, panelOpacity }: WorkBackdropProps) {
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

      {/* Opacity sits on the flat perspective wrapper, the panel carries the 3D transform */}
      <motion.div className="absolute inset-0" style={{ opacity: panelOpacity, perspective: 900 }}>
        <motion.div
          className={cn("absolute left-1/2 top-1/2 will-change-transform", WORK_PANEL_SIZE, WORK_PANEL_SURFACE)}
          style={{ x: "-50%", y: "-50%", z: panelZ }}
        />
      </motion.div>
    </motion.div>
  );
}
