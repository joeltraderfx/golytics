import { cn } from "@/lib/utils";

interface ProbabilityBarProps {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md";
}

export function ProbabilityBar({
  homeProb,
  drawProb,
  awayProb,
  className,
  showLabels = true,
  size = "md",
}: ProbabilityBarProps) {
  const barHeight = size === "sm" ? "h-2.5" : "h-3";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("w-full", className)}>
      {showLabels && (
        <div className="flex justify-between mb-1.5">
          <span className={cn("font-display font-bold tabular-nums text-primary", textSize)}>
            {homeProb.toFixed(0)}%
          </span>
          <span className={cn("font-display tabular-nums text-muted-foreground", textSize)}>
            {drawProb.toFixed(0)}%
          </span>
          <span className={cn("font-display font-bold tabular-nums text-destructive", textSize)}>
            {awayProb.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn("flex w-full rounded-full overflow-hidden bg-muted", barHeight)}>
        <div
          className="bg-primary transition-all duration-700 ease-out relative"
          style={{ width: `${homeProb}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary" />
        </div>
        <div
          className="bg-muted-foreground/40 transition-all duration-700 ease-out"
          style={{ width: `${drawProb}%` }}
        />
        <div
          className="bg-destructive transition-all duration-700 ease-out relative"
          style={{ width: `${awayProb}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-destructive/80 to-destructive" />
        </div>
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          <span>Casa</span>
          <span>Empate</span>
          <span>Fora</span>
        </div>
      )}
    </div>
  );
}
