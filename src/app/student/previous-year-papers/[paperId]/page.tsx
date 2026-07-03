import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  FileText,
  PlayCircle,
  AlertTriangle,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TestRunner } from "@/components/TestRunner";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ResultReviewCard } from "@/components/ResultReviewCard";
import { formatDuration, pct, scoreColor } from "@/lib/utils";
import type {
  PreviousYearAnswer,
  PreviousYearAttempt,
  PreviousYearPaper,
  PreviousYearQuestion,
} from "@/lib/types";

export default async function PaperPage({
  params,
  searchParams,
}: {
  params: Promise<{ paperId: string }>;
  searchParams: Promise<{ start?: string; attempt?: string }>;
}) {
  const { paperId } = await params;
  const sp = await searchParams;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: paperRow } = await supabase
    .from("previous_year_papers")
    .select("*, subjects(name)")
    .eq("id", paperId)
    .maybeSingle();
  if (!paperRow) notFound();
  const paper = paperRow as PreviousYearPaper & { subjects: { name: string } | null };

  const { data: questionRows } = await supabase
    .from("previous_year_questions")
    .select("*")
    .eq("paper_id", paperId)
    .order("question_number");
  const questions = (questionRows ?? []) as PreviousYearQuestion[];

  // -------- Result view --------
  if (sp.attempt) {
    const { data: attemptRow } = await supabase
      .from("previous_year_attempts")
      .select("*")
      .eq("id", sp.attempt)
      .eq("student_id", profile.id)
      .maybeSingle();
    if (!attemptRow) notFound();
    const attempt = attemptRow as PreviousYearAttempt;

    const { data: answerRows } = await supabase
      .from("previous_year_answers")
      .select("*")
      .eq("attempt_id", attempt.id);
    const answers = (answerRows ?? []) as PreviousYearAnswer[];
    const qMap = new Map(questions.map((q) => [q.id, q]));
    const weakChapters = (attempt.weak_chapters_json ?? []) as unknown as {
      chapter_id: string | null;
      chapter_name: string;
    }[];
    const percentage = Number(attempt.percentage);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paper result</h1>
          <p className="mt-1 text-sm text-slate-500">
            {paper.subjects?.name} {paper.paper_year} · Set {paper.set_number}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className={`text-5xl font-bold ${scoreColor(percentage)}`}>{pct(percentage)}</p>
          <p className="mt-2 text-slate-600">
            Scored <span className="font-semibold">{Number(attempt.score)}</span> /{" "}
            <span className="font-semibold">{attempt.total_marks}</span> marks · Time{" "}
            {formatDuration(attempt.time_taken_seconds)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Written answers are AI-checked approximately — this is guidance, not official board
            marking.
          </p>
        </div>

        {weakChapters.length > 0 && (
          <Card>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak chapters — suggested revision
            </CardTitle>
            <ul className="mt-3 space-y-2">
              {weakChapters.map((w, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl bg-amber-50/60 px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-slate-700">{w.chapter_name}</span>
                  {w.chapter_id && (
                    <ButtonLink size="sm" variant="outline" href={`/student/chapters/${w.chapter_id}`}>
                      <RefreshCcw className="h-3.5 w-3.5" /> Revise chapter
                    </ButtonLink>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="space-y-4">
          {answers
            .slice()
            .sort(
              (a, b) =>
                (qMap.get(a.question_id)?.question_number ?? 0) -
                (qMap.get(b.question_id)?.question_number ?? 0)
            )
            .map((a) => {
              const q = qMap.get(a.question_id);
              if (!q) return null;
              const explanation = [
                q.marking_points ? `Marking points:\n${q.marking_points}` : "",
                q.explanation,
              ]
                .filter(Boolean)
                .join("\n\n");
              return (
                <ResultReviewCard
                  key={a.id}
                  item={{
                    index: q.question_number,
                    questionText: q.question_text,
                    options: q.options_json,
                    studentAnswer: a.student_answer,
                    correctAnswer: q.model_answer,
                    isCorrect: a.is_correct,
                    marksAwarded: Number(a.marks_awarded),
                    maxMarks: q.marks,
                    explanation,
                    feedback: a.ai_feedback,
                  }}
                />
              );
            })}
        </div>

        <ButtonLink href="/student/previous-year-papers" variant="ghost">
          Back to papers
        </ButtonLink>
      </div>
    );
  }

  // -------- Solving view --------
  if (sp.start === "1") {
    if (questions.length === 0) notFound();
    return (
      <TestRunner
        mode="paper"
        targetId={paper.id}
        title={`${paper.subjects?.name} ${paper.paper_year} · Set ${paper.set_number}`}
        durationMinutes={paper.duration_minutes}
        questions={questions.map((q) => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          options_json: q.options_json,
          marks: q.marks,
          testMarks: q.marks,
        }))}
      />
    );
  }

  // -------- Intro view --------
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href="/student/previous-year-papers" className="hover:underline">
            Previous Year Papers
          </Link>{" "}
          / {paper.paper_year}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {paper.subjects?.name} — {paper.paper_year} Board Paper
        </h1>
      </div>

      <Card>
        <div className="grid gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Subject</p>
            <p className="mt-1 font-medium text-slate-800">{paper.subjects?.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Year / Set</p>
            <p className="mt-1 font-medium text-slate-800">
              {paper.paper_year} · Set {paper.set_number}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total marks</p>
            <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
              <FileText className="h-4 w-4 text-slate-400" /> {paper.total_marks}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Duration</p>
            <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
              <Clock className="h-4 w-4 text-slate-400" /> {paper.duration_minutes} minutes
            </p>
          </div>
        </div>

        {(paper.pdf_url || paper.marking_scheme_url) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-sm">
            {paper.pdf_url && (
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Original paper PDF
              </a>
            )}
            {paper.marking_scheme_url && (
              <a
                href={paper.marking_scheme_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Marking scheme PDF
              </a>
            )}
          </div>
        )}
      </Card>

      {questions.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            This paper has no solvable questions yet. Ask the admin to add its questions in the
            admin panel{paper.pdf_url ? ", or study from the original PDF above" : ""}.
          </p>
        </Card>
      ) : (
        <div className="flex items-center gap-4">
          <ButtonLink href={`/student/previous-year-papers/${paper.id}?start=1`} size="lg">
            <PlayCircle className="h-5 w-5" /> Start paper ({questions.length} questions)
          </ButtonLink>
          <p className="text-xs text-slate-400">
            Timer starts immediately. MCQs auto-check; written answers get AI feedback.
          </p>
        </div>
      )}
    </div>
  );
}
