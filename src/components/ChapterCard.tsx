import { BookOpenCheck, PencilLine, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";
import { pct, statusLabel, cn } from "@/lib/utils";
import type { Chapter } from "@/lib/types";

const statusStyles: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
  needs_revision: "bg-amber-50 text-amber-700",
};

export function ChapterCard({
  chapter,
  progressPercent,
  status,
  lastScore,
}: {
  chapter: Chapter;
  progressPercent: number;
  status: string;
  lastScore: number | null;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-indigo-600">Chapter {chapter.chapter_number}</p>
          <h3 className="font-semibold text-slate-800">{chapter.name}</h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[status] ?? statusStyles.not_started
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      <ProgressBar value={progressPercent} showLabel />

      <p className="text-xs text-slate-500">
        Last test score: <span className="font-medium text-slate-700">{pct(lastScore)}</span>
        {chapter.marks_weightage ? ` · Board weightage ~${chapter.marks_weightage} marks` : ""}
      </p>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href={`/student/chapters/${chapter.id}`} size="sm">
          <BookOpenCheck className="h-4 w-4" /> Study
        </ButtonLink>
        <ButtonLink href={`/student/chapters/${chapter.id}#practice`} variant="secondary" size="sm">
          <PencilLine className="h-4 w-4" /> Practice
        </ButtonLink>
        <ButtonLink
          href={`/student/mock-tests?chapter=${chapter.id}`}
          variant="outline"
          size="sm"
        >
          <ClipboardCheck className="h-4 w-4" /> Take Test
        </ButtonLink>
      </div>
    </Card>
  );
}
