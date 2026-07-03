import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  showLabel = false,
}: {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    clamped >= 75 ? "bg-emerald-500" : clamped >= 40 ? "bg-indigo-500" : "bg-amber-500";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-500">{clamped}%</span>}
    </div>
  );
}
