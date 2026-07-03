import Link from "next/link";
import { BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SubjectStats } from "@/lib/data";
import { pct } from "@/lib/utils";

export function SubjectCard({ stats }: { stats: SubjectStats }) {
  const { subject } = stats;
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{subject.name}</h3>
            <p className="text-xs text-slate-500">
              {subject.class_name} · {subject.board}
            </p>
          </div>
        </div>
      </div>

      <ProgressBar value={stats.progressPercent} showLabel />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <p className="text-sm font-semibold text-slate-800">
            {stats.completedChapters}/{stats.totalChapters}
          </p>
          <p className="text-[11px] text-slate-500">Chapters done</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <p className="text-sm font-semibold text-slate-800">{pct(stats.averageScore)}</p>
          <p className="text-[11px] text-slate-500">Avg score</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-800">
            {stats.weakTopicsCount > 0 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            {stats.weakTopicsCount}
          </p>
          <p className="text-[11px] text-slate-500">Weak topics</p>
        </div>
      </div>

      <Link
        href={`/student/subjects/${subject.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Open subject <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
