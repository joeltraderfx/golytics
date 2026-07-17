import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  name: string;
  shortName: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-[10px] rounded-md",
  md: "w-12 h-12 text-xs rounded-lg",
  lg: "w-16 h-16 text-sm rounded-xl",
};

export function TeamBadge({ name, shortName, color, size = "md", className }: TeamBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-display font-bold text-white shrink-0 shadow-lg",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: `0 2px 12px ${color}40`,
      }}
      title={name}
    >
      {shortName.slice(0, 3)}
    </div>
  );
}
