import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface ReviewItem {
  index: number;
  questionText: string;
  options: Record<string, string> | null;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean | null;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
  feedback?: string;
}

export function ResultReviewCard({ item }: { item: ReviewItem }) {
  const skipped = item.studentAnswer.trim() === "";
  const icon = skipped ? (
    <MinusCircle className="h-5 w-5 text-slate-400" />
  ) : item.isCorrect ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  ) : (
    <XCircle className="h-5 w-5 text-rose-500" />
  );

  const expand = (v: string) =>
    item.options && item.options[v] ? `${v}. ${item.options[v]}` : v;

  return (
    <Card
      className={cn(
        "space-y-3 border-l-4",
        skipped ? "border-l-slate-300" : item.isCorrect ? "border-l-emerald-400" : "border-l-rose-400"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {icon}
          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-800">
            <span className="mr-1 text-slate-400">Q{item.index}.</span>
            {item.questionText}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {item.marksAwarded}/{item.maxMarks}
        </span>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your answer</p>
          <p className={cn("mt-1 whitespace-pre-wrap", skipped ? "italic text-slate-400" : "text-slate-700")}>
            {skipped ? "Skipped" : expand(item.studentAnswer)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Correct / model answer
          </p>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{expand(item.correctAnswer)}</p>
        </div>
      </div>

      {item.explanation && (
        <div className="rounded-xl bg-indigo-50/60 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Explanation</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{item.explanation}</p>
        </div>
      )}

      {item.feedback && (
        <div className="rounded-xl bg-amber-50/70 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Feedback</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{item.feedback}</p>
        </div>
      )}
    </Card>
  );
}
