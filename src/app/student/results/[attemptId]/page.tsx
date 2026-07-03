import { notFound } from "next/navigation";
import {
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  AlertTriangle,
  RefreshCcw,
  Repeat,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { ButtonLink } from "@/components/ui/Button";
import { ResultReviewCard } from "@/components/ResultReviewCard";
import { formatDuration, pct, scoreColor } from "@/lib/utils";
import type { MockTest, Question, StudentAnswer, TestAttempt } from "@/lib/types";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: attemptRow } = await supabase
    .from("test_attempts")
    .select("*, mock_tests(*)")
    .eq("id", attemptId)
    .eq("student_id", profile.id)
    .maybeSingle();
  if (!attemptRow) notFound();
  const attempt = attemptRow as TestAttempt & { mock_tests: MockTest | null };

  const { data: answerRows } = await supabase
    .from("student_answers")
    .select("*")
    .eq("attempt_id", attemptId);
  const answers = (answerRows ?? []) as StudentAnswer[];

  const { data: questionRows } = await supabase
    .from("questions")
    .select("*")
    .in("id", answers.map((a) => a.question_id));
  const questions = new Map(((questionRows ?? []) as Question[]).map((q) => [q.id, q]));

  const weakTopics = (attempt.weak_topics_json ?? []) as unknown as { topic_id: string | null; topic_name: string }[];
  const percentage = Number(attempt.percentage);

  // Try similar question: link to practice on the chapter of the first wrong answer.
  const firstWrong = answers.find((a) => a.is_correct === false);
  const similarChapterId = firstWrong ? questions.get(firstWrong.question_id)?.chapter_id : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Test result</h1>
        <p className="mt-1 text-sm text-slate-500">{attempt.mock_tests?.name ?? "Mock test"}</p>
      </div>

      {/* Score summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className={`text-5xl font-bold ${scoreColor(percentage)}`}>{pct(percentage)}</p>
        <p className="mt-2 text-slate-600">
          Scored <span className="font-semibold">{Number(attempt.score)}</span> out of{" "}
          <span className="font-semibold">{attempt.total_marks}</span> marks
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {percentage >= 75
            ? "Excellent work! Keep it up. 🎉"
            : percentage >= 50
              ? "Good effort — review the explanations below to improve."
              : "Don't worry — go through each explanation and revise the weak topics."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard label="Correct" value={attempt.correct_count} icon={CheckCircle2} tone="emerald" />
        <DashboardStatCard label="Wrong" value={attempt.wrong_count} icon={XCircle} tone="rose" />
        <DashboardStatCard label="Skipped" value={attempt.skipped_count} icon={MinusCircle} tone="amber" />
        <DashboardStatCard
          label="Time taken"
          value={formatDuration(attempt.time_taken_seconds)}
          icon={Clock}
          tone="sky"
        />
      </div>

      {/* Weak topics detected */}
      {weakTopics.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics detected in this test
          </CardTitle>
          <ul className="mt-3 space-y-2">
            {weakTopics.map((w, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-50/60 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-slate-700">{w.topic_name}</span>
                {w.topic_id && (
                  <ButtonLink size="sm" variant="outline" href={`/student/topics/${w.topic_id}`}>
                    <RefreshCcw className="h-3.5 w-3.5" /> Revise this topic
                  </ButtonLink>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {attempt.mock_tests && attempt.mock_tests.status === "active" && (
          <ButtonLink href={`/student/mock-tests/${attempt.mock_test_id}`} variant="secondary">
            <Repeat className="h-4 w-4" /> Retake this test
          </ButtonLink>
        )}
        {similarChapterId && (
          <ButtonLink href={`/student/chapters/${similarChapterId}#practice`} variant="outline">
            Try similar questions
          </ButtonLink>
        )}
        <ButtonLink href="/student/mock-tests" variant="ghost">
          Back to mock tests
        </ButtonLink>
      </div>

      {/* Answer review */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Target className="h-5 w-5 text-indigo-600" /> Answer review
        </h2>
        <div className="space-y-4">
          {answers.map((a, i) => {
            const q = questions.get(a.question_id);
            return (
              <ResultReviewCard
                key={a.id}
                item={{
                  index: i + 1,
                  questionText: q?.question_text ?? "Question",
                  options: q?.options_json ?? null,
                  studentAnswer: a.student_answer,
                  correctAnswer: a.correct_answer,
                  isCorrect: a.is_correct,
                  marksAwarded: Number(a.marks_awarded),
                  maxMarks: q?.marks ?? 1,
                  explanation: q?.explanation ?? "",
                  feedback: a.feedback,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
