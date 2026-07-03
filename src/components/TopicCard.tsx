import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/types";

const difficultyStyles: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700",
};

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link
      href={`/student/topics/${topic.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-50 p-2">
          <FileText className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{topic.name}</p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
              difficultyStyles[topic.difficulty]
            )}
          >
            {topic.difficulty}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}
