"use client";

import Image from "next/image";
import { motion, type MotionStyle, type MotionValue } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroLayer } from "@/lib/useHeroMotion";
import { cn } from "@/lib/utils";

export type HeroContent = {
  word: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
  nav: { label: string; href: string }[];
  portrait: { src: string; alt: string; width: number; height: number };
};

export const heroContent: HeroContent = {
  word: "DESIGN",
  eyebrow: "Product Designer",
  headline: "I design products that feel simple, even when they are not.",
  subtext: "UI/UX designer in Kolkata — research-led, end-to-end product design.",
  cta: { label: "View Work", href: "#work" },
  // TODO: point these at real section ids once Experience / Gallery / Contact exist
  nav: [
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "mailto:dasrakhi303@gmail.com" },
  ],
  portrait: {
    src: "/images/hero-cutout.png",
    alt: "Portrait of Rakhi Das, UI/UX Designer",
    width: 533,
    height: 740,
  },
};

type LayeredHeroProps = {
  content?: HeroContent;
  /** Per-layer motion styles (e.g. `{ z }`) supplied by ExplodedStage */
  layerStyles?: Partial<Record<HeroLayer, MotionStyle>>;
  /** 0–1 opacity of the soft shadows cast between exploded slabs */
  shadowOpacity?: MotionValue<number>;
  className?: string;
};

// Shared placement for the word + portrait so the three layers line up exactly
const FIGURE_POSITION = "left-1/2 md:left-[60%]";
const WORD_CLASS =
  "font-display uppercase leading-[0.8] tracking-[-0.01em] text-[26vw] md:text-[20vw] select-none whitespace-nowrap";

// Fine film grain as an inline SVG (feTurbulence), tiled over the portrait
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Layer({
  style,
  className,
  children,
  ariaHidden,
}: {
  style?: MotionStyle;
  className?: string;
  children: React.ReactNode;
  ariaHidden?: boolean;
}) {
  return (
    <motion.div
      aria-hidden={ariaHidden}
      style={{ transformStyle: "preserve-3d", ...style }}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {children}
    </motion.div>
  );
}

/** Soft contact shadow painted just below a slab; only visible once layers separate */
function SlabShadow({ opacity }: { opacity?: MotionValue<number> }) {
  if (!opacity) return null;
  return (
    <motion.div
      aria-hidden
      style={{ opacity, z: -30 }}
      className="absolute inset-[6%] rounded-[3rem] bg-black/60 blur-3xl"
    />
  );
}

export function LayeredHero({ content = heroContent, layerStyles, shadowOpacity, className }: LayeredHeroProps) {
  const { portrait } = content;
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url(${portrait.src})`,
    maskImage: `url(${portrait.src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };

  return (
    <div
      className={cn("relative h-svh w-full overflow-hidden bg-background", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Layer 1 — solid word + ambient glow */}
      <Layer ariaHidden style={layerStyles?.background}>
        <div
          className={cn(
            "absolute top-[10%] h-[60vh] w-[70vw] -translate-x-1/2 rounded-full opacity-40 blur-[120px] md:top-[20%]",
            FIGURE_POSITION,
          )}
          style={{ background: "radial-gradient(closest-side, #b16cea, #fa5f72 55%, transparent)" }}
        />
        <p
          className={cn(
            WORD_CLASS,
            "absolute top-[19%] -translate-x-1/2 text-neutral-200 md:top-[14%]",
            FIGURE_POSITION,
          )}
        >
          {content.word}
        </p>
      </Layer>

      {/* Layer 2 — grayscale portrait with halftone + grain */}
      <Layer style={layerStyles?.portrait}>
        <SlabShadow opacity={shadowOpacity} />
        <div
          className={cn(
            "absolute bottom-[36svh] aspect-[533/740] h-[44svh] -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_58%,transparent_94%)] md:bottom-0 md:h-[88svh]",
            FIGURE_POSITION,
          )}
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            priority
            className="h-full w-full object-contain [filter:grayscale(1)_contrast(1.12)_brightness(0.95)]"
          />
          {/* Halftone dots, clipped to the cutout silhouette */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-35 mix-blend-multiply"
            style={{
              ...maskStyle,
              backgroundImage: "radial-gradient(circle at center, rgb(0 0 0 / 0.55) 0.9px, transparent 1.5px)",
              backgroundSize: "4px 4px",
            }}
          />
          {/* Film grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-35 mix-blend-overlay"
            style={{ ...maskStyle, backgroundImage: GRAIN_SVG }}
          />
        </div>
      </Layer>

      {/* Layer 3 — outline word over the face */}
      <Layer ariaHidden style={layerStyles?.outline}>
        <SlabShadow opacity={shadowOpacity} />
        <p
          className={cn(
            WORD_CLASS,
            "absolute top-[19%] -translate-x-1/2 text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.75)] md:top-[14%]",
            FIGURE_POSITION,
          )}
        >
          {content.word}
        </p>
      </Layer>

      {/* Layer 4 — UI column */}
      <Layer style={layerStyles?.ui} className="pointer-events-auto">
        <div className="absolute left-5 top-6 font-sans text-lg font-semibold tracking-tight md:left-10 md:top-8">
          Rakhi<span className="text-accent-pink">.</span>UX
        </div>

        <div className="absolute inset-x-5 bottom-8 flex flex-col gap-5 md:inset-x-auto md:bottom-auto md:left-10 md:top-1/2 md:w-[min(30vw,24rem)] md:-translate-y-1/2 md:gap-6">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="bg-accent-gradient bg-clip-text text-transparent">✦</span>
            {content.eyebrow}
          </p>
          <h1 className="font-serif text-3xl leading-[1.05] text-balance md:text-5xl">{content.headline}</h1>
          <p className="max-w-xs text-sm text-muted-foreground md:text-base">{content.subtext}</p>
          <div>
            <Button asChild size="lg">
              <a href={content.cta.href}>
                {content.cta.label}
                <ArrowDownRight aria-hidden />
              </a>
            </Button>
          </div>

          <nav aria-label="Sections" className="mt-4 hidden md:block">
            <ul className="flex flex-col gap-1 border-l border-border pl-4">
              {content.nav.map((item, i) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group flex items-baseline gap-3 rounded-sm py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-pink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Layer>
    </div>
  );
}
