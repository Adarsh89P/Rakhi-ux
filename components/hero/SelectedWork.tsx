import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { moreProjectsHref, projects, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

type SelectedWorkProps = {
  /** "stage": compact card landed on at the end of the fly-through; "flow": normal page section */
  variant: "stage" | "flow";
  className?: string;
};

function ProjectCard({ project, compact }: { project: Project; compact: boolean }) {
  return (
    <li className={cn(compact && "w-60 shrink-0 snap-start xl:w-auto")}>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Hover glow — opacity only */}
        <span
          aria-hidden
          className="absolute -inset-1 rounded-3xl bg-accent-gradient opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50 group-focus-visible:opacity-50"
        />
        <span className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/70 transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
          <span className="relative block aspect-[4/3] overflow-hidden bg-neutral-900">
            <Image
              src={project.thumbnail}
              alt={project.thumbnailAlt}
              fill
              sizes={compact ? "240px" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </span>
          <span className={cn("flex flex-1 flex-col gap-1.5", compact ? "p-4" : "p-5")}>
            <span className="flex items-start justify-between gap-3">
              <span className={cn("font-medium leading-snug", compact ? "text-sm" : "text-lg")}>{project.title}</span>
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              />
            </span>
            <span className="text-xs text-muted-foreground">{project.period}</span>
            <span
              className={cn(
                "text-muted-foreground",
                compact ? "line-clamp-3 text-xs leading-relaxed" : "text-sm leading-relaxed",
              )}
            >
              {project.description}
            </span>
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </a>
    </li>
  );
}

export function SelectedWork({ variant, className }: SelectedWorkProps) {
  const compact = variant === "stage";
  const headingId = compact ? "work-stage-heading" : "work-heading";

  const card = (
    <div className={cn("glass rounded-[2rem]", compact ? "w-[min(94vw,76rem)] p-6 lg:p-8" : "p-5 sm:p-8")}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Case studies</p>
          <h2 id={headingId} className={cn("mt-2 font-serif leading-none", compact ? "text-4xl lg:text-5xl" : "text-4xl sm:text-5xl")}>
            Selected Work
          </h2>
        </div>
        <Button asChild variant="outline" size="default">
          <a href={moreProjectsHref} target="_blank" rel="noopener noreferrer">
            More on Behance
            <ArrowUpRight aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
      </div>
      <ul
        className={cn(
          compact
            ? "-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2 xl:grid xl:grid-cols-5 xl:overflow-visible"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} compact={compact} />
        ))}
      </ul>
    </div>
  );

  if (compact) {
    return (
      <section aria-labelledby={headingId} className={className}>
        {card}
      </section>
    );
  }

  return (
    <section id="work" aria-labelledby={headingId} className={cn("relative overflow-hidden px-4 py-20 sm:px-8", className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(40% 30% at 25% 20%, rgb(59 130 246 / 0.6), transparent 70%), radial-gradient(40% 30% at 75% 30%, rgb(251 146 60 / 0.5), transparent 70%), radial-gradient(40% 30% at 50% 60%, rgb(236 72 153 / 0.5), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">{card}</div>
    </section>
  );
}
