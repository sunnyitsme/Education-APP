"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { TestTimer } from "@/components/TestTimer";
import { QuestionRenderer, type RenderableQuestion } from "@/components/QuestionRenderer";
import { Button } from "@/components/ui/Button";
import { submitMockTest } from "@/lib/actions/tests";
import { submitPreviousYearPaper } from "@/lib/actions/papers";
import { cn } from "@/lib/utils";

export interface RunnerQuestion extends RenderableQuestion {
  testMarks: number;
}

/**
 * Shared exam runner for mock tests and previous year papers:
 * timer, question palette, next/previous, mark for review, submit.
 */
export function TestRunner({
  mode,
  targetId,
  title,
  durationMinutes,
  questions,
}: {
  mode: "mock" | "paper";
  targetId: string; // mock_test id or paper id
  title: string;
  durationMinutes: number;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(0);
  const submittedRef = useRef(false);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const q = questions[current];
  const answeredCount = useMemo(
    () => questions.filter((x) => (answers[x.id] ?? "").trim() !== "").length,
    [answers, questions]
  );

  async function submit(auto = false) {
    if (submittedRef.current) return;
    if (!auto) {
      const unanswered = questions.length - answeredCount;
      const message =
        unanswered > 0
          ? `You still have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`
          : "Submit the test?";
      if (!window.confirm(message)) return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    setError("");

    const payload = {
      answers: questions.map((x) => ({ questionId: x.id, answer: answers[x.id] ?? "" })),
      timeTakenSeconds: startedAt.current
        ? Math.round((Date.now() - startedAt.current) / 1000)
        : 0,
    };

    const res =
      mode === "mock"
        ? await submitMockTest({ testId: targetId, ...payload })
        : await submitPreviousYearPaper({ paperId: targetId, ...payload });

    if (res.ok && res.attemptId) {
      router.push(
        mode === "mock"
          ? `/student/results/${res.attemptId}`
          : `/student/previous-year-papers/${targetId}?attempt=${res.attemptId}`
      );
    } else {
      submittedRef.current = false;
      setSubmitting(false);
      setError(res.error ?? "Could not submit. Please try again.");
    }
  }

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header: title + timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h1 className="font-semibold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-500">
            {answeredCount}/{questions.length} answered
            {review.size > 0 ? ` · ${review.size} marked for review` : ""}
          </p>
        </div>
        <TestTimer durationSeconds={durationMinutes * 60} onExpire={() => submit(true)} running={!submitting} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {/* Question card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <QuestionRenderer
            question={q}
            index={current}
            answer={answers[q.id] ?? ""}
            onAnswer={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            disabled={submitting}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0 || submitting}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                disabled={current === questions.length - 1 || submitting}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant={review.has(q.id) ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                setReview((r) => {
                  const next = new Set(r);
                  if (next.has(q.id)) next.delete(q.id);
                  else next.add(q.id);
                  return next;
                })
              }
              disabled={submitting}
            >
              <Flag className="h-4 w-4" />
              {review.has(q.id) ? "Unmark review" : "Mark for review"}
            </Button>
          </div>
        </div>

        {/* Palette + submit */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Questions
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((x, i) => {
                const answered = (answers[x.id] ?? "").trim() !== "";
                const marked = review.has(x.id);
                return (
                  <button
                    key={x.id}
                    onClick={() => setCurrent(i)}
                    disabled={submitting}
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition",
                      i === current
                        ? "bg-indigo-600 text-white"
                        : answered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {i + 1}
                    {marked && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-slate-400">
              <p><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200" /> Answered</p>
              <p><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" /> Marked for review</p>
            </div>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <Button className="w-full" onClick={() => submit(false)} disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? "Submitting & grading..." : "Submit test"}
          </Button>
          {submitting && (
            <p className="text-center text-xs text-slate-400">
              Grading your answers — this can take a few seconds for written answers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
