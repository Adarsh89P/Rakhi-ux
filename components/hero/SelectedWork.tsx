import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { moreProjectsHref, projects, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Size + surface of the landing panel. GlassTileTunnel flies a blank copy of this
 * panel towards the camera, so both must stay identical for a seamless hand-over.
 */
export const WORK_PANEL_SIZE = "w-[min(80vw,68rem)] h-[min(68vh,40rem)]";
export const WORK_PANEL_SURFACE =
  "rounded-[2rem] border-2 border-white/50 bg-white/[0.14] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),inset_0_0_60px_rgb(255_255_255/0.12),0_40px_80px_-30px_rgb(0_0_0/0.6)]";

type SelectedWorkProps = {
  /** "stage": landing panel at the end of the fly-through; "flow": normal page section */
  variant: "stage" | "flow";
  className?: string;
};

const cardLink =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

/** Hover glow behind a card — opacity only */
function CardGlow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-accent-gradient opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60 group-focus-visible:opacity-60"
    />
  );
}

function ProjectCard({ project, detailed }: { project: Project; detailed: boolean }) {
  return (
    <li className="relative isolate min-h-0">
      <a href={project.href} target="_blank" rel="noopener noreferrer" className={cardLink}>
        <CardGlow />
        <span className={cn("relative block overflow-hidden bg-neutral-900", detailed ? "aspect-[16/10]" : "min-h-0 flex-1")}>
          <Image
            src={project.thumbnail}
            alt={project.thumbnailAlt}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </span>
        <span className="flex flex-col gap-1 p-3 lg:p-4">
          <span className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium leading-snug lg:text-base">{project.title}</span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            />
          </span>
          <span className="text-xs text-white/60">{project.period}</span>
          {detailed && <span className="mt-1 text-sm leading-relaxed text-white/70">{project.description}</span>}
        </span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </li>
  );
}

function MoreCard() {
  return (
    <li className="relative isolate min-h-0">
      <a
        href={moreProjectsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardLink, "min-h-40 flex-row items-center justify-center gap-2 border-dashed text-sm font-medium")}
      >
        <CardGlow />
        More on Behance
        <ArrowUpRight aria-hidden className="size-4" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </li>
  );
}

/** Small frosted chips floating at the right edge, as in the reference */
function GlassChips() {
  const chips = ["w-24 h-10", "w-16 h-12", "w-20 h-9", "w-14 h-14", "w-24 h-8"];
  return (
    <div aria-hidden className="pointer-events-none absolute right-[2.5vw] top-[14vh] hidden flex-col items-end gap-4 lg:flex">
      {chips.map((size, i) => (
        <span key={i} className={cn(size, "rounded-lg border border-white/50 bg-white/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]")} />
      ))}
    </div>
  );
}

export function SelectedWork({ variant, className }: SelectedWorkProps) {
  if (variant === "stage") {
    return (
      <section aria-labelledby="work-stage-heading" className={cn("relative h-full w-full text-white", className)}>
        <GlassChips />
        <div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", WORK_PANEL_SIZE)}>
          <h2
            id="work-stage-heading"
            className="absolute bottom-full left-2 mb-4 text-2xl font-medium tracking-tight lg:text-3xl"
          >
            Selected Work
          </h2>
          <div className={cn("h-full w-full p-4 backdrop-blur-xl lg:p-5", WORK_PANEL_SURFACE)}>
            <ul className="grid h-full grid-cols-3 grid-rows-2 gap-3 lg:gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} detailed={false} />
              ))}
              <MoreCard />
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={cn("relative isolate overflow-hidden bg-[#0a1027] px-4 py-16 text-white sm:px-8", className)}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(45% 35% at 15% 30%, rgb(59 130 246 / 0.7), transparent 70%), radial-gradient(40% 30% at 55% 10%, rgb(236 72 153 / 0.45), transparent 70%), radial-gradient(45% 35% at 90% 70%, rgb(251 146 60 / 0.6), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <h2 id="work-heading" className="mb-5 text-3xl font-medium tracking-tight sm:text-4xl">
          Selected Work
        </h2>
        <div className={cn("p-3 backdrop-blur-xl sm:p-5", WORK_PANEL_SURFACE)}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} detailed />
            ))}
            <MoreCard />
          </ul>
        </div>
      </div>
    </section>
  );
}
