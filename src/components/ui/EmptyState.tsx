import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="max-w-md text-sm text-slate-500">{hint}</p>}
      {action}
    </div>
  );
}
