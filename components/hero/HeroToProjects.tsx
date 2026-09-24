"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import { ExplodedStage } from "@/components/hero/ExplodedStage";
import { GlassTileTunnel } from "@/components/hero/GlassTileTunnel";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { SelectedWork } from "@/components/hero/SelectedWork";
import { useHeroMotion, WORK_ANCHOR_PROGRESS } from "@/lib/useHeroMotion";

const HEIGHT = { full: "500vh", mobile: "220vh" } as const;

/**
 * Pinned hero → exploded stack → glass fly-through → Selected Work.
 * - full: the whole sequence inside one sticky viewport
 * - mobile: gentler tilt only, projects follow as a normal section
 * - reduced motion: static hero followed by a normal projects grid
 */
export function HeroToProjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const m = useHeroMotion(containerRef);
  const animated = m.mode !== "reduced";
  const full = m.mode === "full";

  // Keyboard users can tab into layers that are currently scrolled out of view;
  // jump the scroll position to wherever the focused element is visible.
  const handleFocus = (event: React.FocusEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top + window.scrollY;
    const range = container.offsetHeight - window.innerHeight;
    const p = m.progress.get();
    if (workRef.current?.contains(event.target as Node)) {
      if (p < WORK_ANCHOR_PROGRESS - 0.02) window.scrollTo({ top: top + WORK_ANCHOR_PROGRESS * range });
    } else if (p > 0.3) {
      window.scrollTo({ top });
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: animated ? HEIGHT[m.mode as "full" | "mobile"] : undefined }}
      >
        {animated ? (
          <div className="sticky top-0 h-svh overflow-hidden bg-[#050507]" onFocusCapture={handleFocus}>
            {/* Corridor sits behind the stack, so it is already there as the stack flies away */}
            {full && (
              <GlassTileTunnel
                cameraZ={m.tunnel.cameraZ}
                opacity={m.tunnel.opacity}
                visibility={m.tunnel.visibility}
                tilesOpacity={m.tunnel.tilesOpacity}
                panelOpacity={m.tunnel.panelOpacity}
              />
            )}
            <ExplodedStage motion={m} />
            {full && (
              <motion.div
                ref={workRef}
                className="absolute inset-0"
                style={{ opacity: m.work.opacity, pointerEvents: m.work.pointerEvents }}
              >
                <SelectedWork variant="stage" />
              </motion.div>
            )}
          </div>
        ) : (
          <LayeredHero />
        )}
        {full && (
          // Scroll target for "View Work": the point where Selected Work has landed
          <div
            id="work"
            className="absolute inset-x-0 h-px"
            style={{ top: `calc(${WORK_ANCHOR_PROGRESS} * (100% - 100vh))` }}
          />
        )}
      </div>
      {!full && <SelectedWork variant="flow" />}
    </>
  );
}
