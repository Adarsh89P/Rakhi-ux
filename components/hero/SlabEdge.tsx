import { cn } from "@/lib/utils";

type SlabEdgeProps = {
  /** Thickness of the slab in px */
  thickness: number;
  /** Which edge of the parent the face hangs from; it extends backwards (−Z) from there */
  side?: "top" | "bottom";
  className?: string;
};

/**
 * The visible side face of a thick slab. Edge-on (invisible) while the parent is flat,
 * it catches the light once the parent tilts in 3D. Parent needs `transform-style: preserve-3d`.
 */
export function SlabEdge({ thickness, side = "bottom", className }: SlabEdgeProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0", className)}
      style={{
        height: thickness,
        ...(side === "bottom"
          ? { top: "100%", transformOrigin: "top", transform: "rotateX(-90deg)" }
          : { bottom: "100%", transformOrigin: "bottom", transform: "rotateX(90deg)" }),
      }}
    />
  );
}
