"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, FlaskConical } from "lucide-react";
import { updatePracticalAttempt } from "@/lib/actions/it";
import { Button } from "@/components/ui/Button";
import { cn, toList } from "@/lib/utils";
import type { PracticalTask } from "@/lib/types";

const toolLabels: Record<string, string> = {
  writer: "LibreOffice Writer",
  calc: "LibreOffice Calc",
  base: "LibreOffice Base",
  other: "Other tool",
};

export function PracticalTaskCard({
  task,
  initialStatus,
}: {
  task: PracticalTask;
  initialStatus: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function update(next: "in_progress" | "completed") {
    startTransition(async () => {
      const res = await updatePracticalAttempt({ taskId: task.id, status: next });
      if (res.ok) setStatus(next);
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-sky-50 p-2.5">
            <FlaskConical className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{task.title}</h3>
            <p className="text-xs text-slate-500">
              {toolLabels[task.tool]} · {task.marks} marks · {task.difficulty}
            </p>
          </div>
        </div>
        {status === "completed" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        ) : status === "in_progress" ? (
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
            In progress
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-slate-600">{task.description}</p>

      <button
        onClick={() => setOpen(!open)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        {open ? "Hide steps" : "Show steps"}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <ol className="list-inside list-decimal space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {toList(task.steps).map((s, i) => (
              <li key={i}>{s.replace(/^\d+\.\s*/, "")}</li>
            ))}
          </ol>
          {task.expected_outcome && (
            <p className="rounded-xl bg-emerald-50/60 p-3 text-sm text-slate-600">
              <span className="font-semibold text-emerald-700">Expected outcome: </span>
              {task.expected_outcome}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {status !== "completed" && (
          <>
            {status !== "in_progress" && (
              <Button size="sm" variant="outline" onClick={() => update("in_progress")} disabled={pending}>
                Start task
              </Button>
            )}
            <Button size="sm" onClick={() => update("completed")} disabled={pending}>
              <CheckCircle2 className="h-4 w-4" /> Mark completed
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
