import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
  } as const;
  return (
    <Card className="flex items-center gap-4">
      <div className={cn("rounded-xl p-3", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-xl font-semibold text-slate-800">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}
