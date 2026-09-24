"use client";

import Image from "next/image";
import { motion, type MotionStyle, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { SlabEdge } from "@/components/hero/SlabEdge";
import { moreProjectsHref } from "@/lib/projects";
import type { HeroLayer } from "@/lib/useHeroMotion";
import { cn } from "@/lib/utils";

export type HeroContent = {
  name: string;
  word: string;
  tagline: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
  nav: { label: string; href: string; external?: boolean }[];
  portrait: { src: string; alt: string; width: number; height: number };
};

export const heroContent: HeroContent = {
  name: "Rakhi Das",
  word: "DESIGN",
  tagline: "research-led, end to end.",
  eyebrow: "Product Designer · Kolkata",
  headline: "I’m a product designer",
  subtext: "I design products that feel simple, even when they are not.",
  cta: { label: "View Work", href: "#work" },
  nav: [
    { label: "Work", href: "#work" },
    { label: "Behance", href: moreProjectsHref, external: true },
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

// Shared placement so the solid word, portrait and outline word line up exactly
const FIGURE_X = "left-1/2 md:left-[60%]";
const WORD_TOP = "top-[19%] md:top-[14%]";
const WORD_CLASS =
  "absolute -translate-x-1/2 select-none whitespace-nowrap font-display uppercase leading-[0.8] tracking-[-0.01em] text-[26vw] md:text-[20vw]";

// Fine film grain as an inline SVG (feTurbulence), tiled over the portrait
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** translateZ (px) of the blank sheets stacked under the hero page */
const UNDER_SHEETS = [-48, -96, -144];

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

/** Soft contact shadow painted just below a lifted layer; invisible while flat */
function SlabShadow({ opacity, className }: { opacity?: MotionValue<number>; className?: string }) {
  if (!opacity) return null;
  return (
    <motion.div
      aria-hidden
      style={{ opacity, z: -24 }}
      className={cn("absolute rounded-[2rem] bg-black/25 blur-2xl", className)}
    />
  );
}

export function LayeredHero({ content = heroContent, layerStyles, shadowOpacity, className }: LayeredHeroProps) {
  const { portrait } = content;
  const silhouetteMask: React.CSSProperties = {
    WebkitMaskImage: `url(${portrait.src})`,
    maskImage: `url(${portrait.src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };

  return (
    <div
      className={cn("relative h-svh w-full text-neutral-900", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Base slab — the light "paper" the hero is printed on */}
      <Layer ariaHidden style={layerStyles?.base}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 60% 35%, #f4f3f0 0%, #e6e5e1 60%, #d9d8d3 100%)" }}
        />
        <SlabEdge thickness={26} className="bg-gradient-to-b from-white to-[#c9c7c1]" />
        {/* Sheets stacked underneath — hidden while flat, an exploded stack once tilted */}
        {UNDER_SHEETS.map((z) => (
          <div
            key={z}
            className="absolute inset-0 bg-white/55"
            style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}
          >
            <SlabEdge thickness={22} className="bg-gradient-to-b from-white/95 to-[#d4d2cc]/80" />
          </div>
        ))}
      </Layer>

      {/* Page chrome printed on the slab: name + vertical nav */}
      <Layer style={layerStyles?.base}>
        <p className="pointer-events-auto absolute left-5 top-6 text-xs font-semibold uppercase tracking-[0.25em] md:left-16 md:top-8">
          {content.name}
        </p>

        <nav
          aria-label="Primary"
          className="pointer-events-auto absolute right-5 top-5 md:bottom-10 md:left-5 md:right-auto md:top-auto"
        >
          <ul className="flex gap-5 text-xs font-medium text-neutral-600 md:rotate-180 md:[writing-mode:vertical-rl]">
            {content.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded-sm transition-colors hover:text-neutral-950 focus-visible:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

      </Layer>

      {/* Layer 1 — solid word + tagline */}
      <Layer ariaHidden style={layerStyles?.background}>
        <p className={cn(WORD_CLASS, WORD_TOP, FIGURE_X, "text-neutral-950")}>{content.word}</p>
        <p className="absolute right-[4vw] top-[calc(14svh+24vw)] hidden max-w-[16rem] text-right text-2xl font-semibold leading-tight tracking-tight md:block">
          {content.tagline}
        </p>
      </Layer>

      {/* Layer 2 — grayscale portrait with halftone + grain */}
      <Layer style={layerStyles?.portrait}>
        <SlabShadow
          opacity={shadowOpacity}
          className={cn("bottom-0 h-[70svh] w-[34vw] -translate-x-1/2", FIGURE_X)}
        />
        <div
          className={cn(
            "absolute bottom-[36svh] aspect-[533/740] h-[44svh] -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_58%,transparent_94%)] md:bottom-0 md:h-[88svh] md:[mask-image:none]",
            FIGURE_X,
          )}
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            priority
            className="h-full w-full object-contain [filter:grayscale(1)_contrast(1.15)]"
          />
          {/* Halftone dots, clipped to the cutout silhouette */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-35 mix-blend-multiply"
            style={{
              ...silhouetteMask,
              backgroundImage: "radial-gradient(circle at center, rgb(0 0 0 / 0.55) 0.9px, transparent 1.5px)",
              backgroundSize: "4px 4px",
            }}
          />
          {/* Film grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-35 mix-blend-overlay"
            style={{ ...silhouetteMask, backgroundImage: GRAIN_SVG }}
          />
        </div>
      </Layer>

      {/* Layer 3 — outline word over the face */}
      <Layer ariaHidden style={layerStyles?.outline}>
        <p
          className={cn(
            WORD_CLASS,
            WORD_TOP,
            FIGURE_X,
            "text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.85)]",
          )}
        >
          {content.word}
        </p>
      </Layer>

      {/* Layer 4 — intro card */}
      <Layer style={layerStyles?.ui}>
        <div
          className="pointer-events-auto absolute inset-x-5 bottom-6 md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:w-[min(30vw,25rem)] md:-translate-y-1/2"
          style={{ transformStyle: "preserve-3d" }}
        >
          <SlabShadow opacity={shadowOpacity} className="inset-2" />
          <div
            className="relative rounded-2xl bg-[#f7f6f3] p-6 shadow-[0_1px_0_rgb(255_255_255)_inset,0_10px_30px_-12px_rgb(0_0_0/0.25)] md:p-8"
            style={{ transformStyle: "preserve-3d" }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              ✦ {content.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.02] md:text-6xl">{content.headline}</h1>
            <p className="mt-4 max-w-xs text-sm text-neutral-600 md:text-base">{content.subtext}</p>
            <a
              href={content.cta.href}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgb(37_99_235/0.8)] transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
            >
              {content.cta.label}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <SlabEdge thickness={18} className="rounded-b-2xl bg-gradient-to-b from-[#dcdad5] to-[#b3b1ab]" />
          </div>
        </div>
      </Layer>
    </div>
  );
}
