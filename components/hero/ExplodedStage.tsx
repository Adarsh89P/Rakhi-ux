"use client";

import { motion } from "framer-motion";

import { LayeredHero } from "@/components/hero/LayeredHero";
import type { HeroMotion } from "@/lib/useHeroMotion";

type ExplodedStageProps = {
  motion: HeroMotion;
};

/**
 * Phase 2: tilts the layered hero back into an exploded stack of slabs, then
 * slides the stack up and out of frame as the camera flies past it.
 */
export function ExplodedStage({ motion: m }: ExplodedStageProps) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        visibility: m.stage.visibility,
        perspective: 1200,
        perspectiveOrigin: "50% 40%",
      }}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        style={{
          rotateX: m.stage.rotateX,
          rotateZ: m.stage.rotateZ,
          scale: m.stage.scale,
          y: m.stage.y,
          z: m.stage.z,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 55%",
        }}
      >
        <LayeredHero
          shadowOpacity={m.shadowOpacity}
          layerStyles={{
            base: { z: m.layers.base },
            background: { z: m.layers.background },
            portrait: { z: m.layers.portrait },
            outline: { z: m.layers.outline },
            ui: { z: m.layers.ui },
          }}
        />
      </motion.div>
    </motion.div>
  );
}
