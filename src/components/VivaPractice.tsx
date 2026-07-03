"use client";

import { useState } from "react";
import { Mic, ArrowRight, CheckCircle2 } from "lucide-react";
import { submitVivaAnswer } from "@/lib/actions/it";
import { Button } from "@/components/ui/Button";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { toList } from "@/lib/utils";

export interface VivaItem {
  id: string;
  question: string;
  difficulty: string;
}

interface VivaResult {
  score: number | null;
  feedback: string;
  missingPoints: string;
  modelAnswer: string;
  keyPoints: string;
}

/** One viva question at a time: answer → AI score + model answer + missing points. */
export function VivaPractice({ questions }: { questions: VivaItem[] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<VivaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (questions.length === 0) return null;
  const q = questions[index];

  async function submit() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setError("");
    const res = await submitVivaAnswer({ vivaQuestionId: q.id, answer: answer.trim() });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Could not submit answer.");
      return;
    }
    setResult({
      score: res.score,
      feedback: res.feedback,
      missingPoints: res.missingPoints ?? "",
      modelAnswer: res.modelAnswer,
      keyPoints: res.keyPoints,
    });
  }

  // Jump to a random different question so every session varies.
  function next() {
    setIndex((i) => {
      if (questions.length <= 1) return i;
      const n = Math.floor(Math.random() * questions.length);
      return n === i ? (i + 1) % questions.length : n;
    });
    setAnswer("");
    setResult(null);
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-50 p-2.5">
            <Mic className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Viva question {index + 1} of {questions.length} · {q.difficulty}
            </p>
            <p className="mt-1 text-base font-medium leading-relaxed text-slate-800">{q.question}</p>
          </div>
        </div>

        {!result && (
          <div className="mt-4 space-y-3">
            <TextareaInput
              name="viva_answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer in your own words, as you would speak in the viva..."
              rows={4}
            />
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={submit} disabled={loading || !answer.trim()}>
                {loading ? "Scoring..." : "Submit answer"}
              </Button>
              <Button variant="ghost" onClick={next} disabled={loading}>
                Skip <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            {result.score !== null && (
              <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4">
                <p className="text-3xl font-bold text-indigo-700">{result.score}/10</p>
                <p className="text-sm text-slate-600">{result.feedback}</p>
              </div>
            )}
            {result.score === null && result.feedback && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-slate-600">{result.feedback}</p>
            )}
            {result.missingPoints && (
              <div className="rounded-xl bg-amber-50/70 p-3 text-sm">
                <p className="font-semibold text-amber-700">Points you missed</p>
                <ul className="mt-1 list-inside list-disc text-slate-600">
                  {toList(result.missingPoints).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl bg-emerald-50/60 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Model answer
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{result.modelAnswer}</p>
              {result.keyPoints && (
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  {toList(result.keyPoints).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
            <Button onClick={next}>
              Next question <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
