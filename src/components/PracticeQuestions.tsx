"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";
import { QUESTION_TYPE_LABELS, type Question } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Self-check practice list: the student thinks, then reveals the answer and
 * explanation. Used on chapter and topic pages (not graded).
 */
export function PracticeQuestions({ questions }: { questions: Question[] }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (questions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No practice questions here yet. The admin can add them in the question bank.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const isOpen = revealed.has(q.id);
        return (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm font-medium text-slate-800">
                <span className="mr-1.5 text-slate-400">Q{i + 1}.</span>
                {q.question_text}
              </p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {QUESTION_TYPE_LABELS[q.question_type]} · {q.marks}m
              </span>
            </div>

            {q.options_json && (
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {Object.entries(q.options_json).map(([key, text]) => (
                  <li
                    key={key}
                    className={cn(
                      "rounded-lg px-3 py-1.5",
                      isOpen && key === q.correct_answer
                        ? "bg-emerald-50 font-medium text-emerald-800"
                        : "bg-slate-50"
                    )}
                  >
                    <span className="mr-1.5 font-semibold">{key}.</span>
                    {text}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() =>
                setRevealed((prev) => {
                  const next = new Set(prev);
                  if (next.has(q.id)) next.delete(q.id);
                  else next.add(q.id);
                  return next;
                })
              }
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              {isOpen ? "Hide answer" : "Show answer"}
            </button>

            {isOpen && (
              <div className="mt-2 space-y-2 rounded-xl bg-indigo-50/60 p-3 text-sm">
                <p className="text-slate-800">
                  <span className="font-semibold text-indigo-700">Answer: </span>
                  <span className="whitespace-pre-wrap">{q.correct_answer}</span>
                </p>
                {q.explanation && (
                  <p className="flex gap-1.5 text-slate-600">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span className="whitespace-pre-wrap">{q.explanation}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
