"use client";

import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface RenderableQuestion {
  id: string;
  question_type: QuestionType;
  question_text: string;
  options_json: Record<string, string> | null;
  marks: number;
}

/**
 * Renders any question type with the right input control.
 * Controlled: the parent owns the answer string.
 */
export function QuestionRenderer({
  question,
  index,
  answer,
  onAnswer,
  disabled = false,
}: {
  question: RenderableQuestion;
  index: number;
  answer: string;
  onAnswer: (value: string) => void;
  disabled?: boolean;
}) {
  const type = question.question_type;
  const isChoice = (type === "mcq" || type === "assertion_reason" || type === "case_based") && question.options_json;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-800">
          <span className="mr-2 text-slate-400">Q{index + 1}.</span>
          {question.question_text}
        </p>
        <div className="shrink-0 text-right">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
          <p className="mt-1 text-[11px] text-slate-400">{QUESTION_TYPE_LABELS[type]}</p>
        </div>
      </div>

      {isChoice && (
        <div className="space-y-2">
          {Object.entries(question.options_json!).map(([key, text]) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(key)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                answer === key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  answer === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {key}
              </span>
              <span className="pt-0.5">{text}</span>
            </button>
          ))}
        </div>
      )}

      {type === "true_false" && (
        <div className="flex gap-3">
          {["True", "False"].map((v) => (
            <button
              key={v}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(v)}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition",
                answer === v
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {(type === "fill_blank" || type === "numerical") && (
        <input
          type="text"
          value={answer}
          disabled={disabled}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={type === "numerical" ? "Enter the numeric answer" : "Type your answer"}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      )}

      {(type === "short_answer" || type === "long_answer" || type === "practical" || type === "viva" ||
        ((type === "case_based") && !question.options_json)) && (
        <textarea
          value={answer}
          disabled={disabled}
          onChange={(e) => onAnswer(e.target.value)}
          rows={type === "long_answer" ? 8 : 4}
          placeholder="Write your answer here as you would in the exam..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      )}
    </div>
  );
}
