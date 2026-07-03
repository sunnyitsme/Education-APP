"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkWrittenAnswer, isAiConfigured } from "@/lib/ai/gemini";
import { isObjective, normalizeAnswer } from "@/lib/utils";
import type { Question } from "@/lib/types";

export interface SubmittedAnswer {
  questionId: string;
  answer: string;
}

/**
 * Start an on-the-fly test (Quick 10 or Weak-topic revision). Creates a
 * hidden random mock test row (status "inactive" keeps it out of the shared
 * test list) and returns its id for the test runner page.
 */
export async function startDynamicTest(params: {
  kind: "quick10" | "weak_topic";
  subjectId?: string;
}): Promise<{ ok: boolean; testId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const admin = createAdminClient();
  const name =
    params.kind === "quick10"
      ? `Quick 10-Question Test (${new Date().toLocaleDateString("en-IN")})`
      : `Weak Topic Revision Test (${new Date().toLocaleDateString("en-IN")})`;

  const { data: test, error } = await admin
    .from("mock_tests")
    .insert({
      name,
      subject_id: params.subjectId || null,
      test_type: params.kind,
      generation_type: "random",
      duration_minutes: params.kind === "quick10" ? 15 : 20,
      total_marks: 10,
      status: "inactive",
    })
    .select("id")
    .single();

  if (error || !test) return { ok: false, error: error?.message ?? "Could not create test" };
  return { ok: true, testId: test.id };
}

/**
 * Grade and store a mock test attempt. Runs entirely server-side:
 * - Objective questions (MCQ, T/F, fill-in, numerical, assertion-reason) are
 *   compared directly against the stored correct answer.
 * - Written questions are approximately marked by Gemini when configured;
 *   otherwise they receive the model answer as feedback for self-checking.
 * Results are written with the service role so students can never edit them.
 */
export async function submitMockTest(params: {
  testId: string;
  answers: SubmittedAnswer[];
  timeTakenSeconds: number;
  weakTopicMode?: boolean;
}): Promise<{ ok: boolean; attemptId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: testRow } = await supabase
    .from("mock_tests")
    .select("id")
    .eq("id", params.testId)
    .single();
  if (!testRow) return { ok: false, error: "Test not found" };

  const questionIds = params.answers.map((a) => a.questionId);
  if (questionIds.length === 0) return { ok: false, error: "No answers submitted" };

  const [{ data: questionRows }, { data: mtqRows }] = await Promise.all([
    supabase.from("questions").select("*").in("id", questionIds),
    supabase
      .from("mock_test_questions")
      .select("question_id, marks")
      .eq("mock_test_id", params.testId),
  ]);

  const questions = new Map((questionRows ?? []).map((q) => [q.id, q as Question]));
  const fixedMarks = new Map((mtqRows ?? []).map((r) => [r.question_id, r.marks as number]));

  const aiEnabled = isAiConfigured();
  let score = 0;
  let totalMarks = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  const answerRows: {
    question_id: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean | null;
    marks_awarded: number;
    feedback: string;
  }[] = [];

  const graded = await Promise.all(
    params.answers.map(async ({ questionId, answer }) => {
      const q = questions.get(questionId);
      if (!q) return null;
      const maxMarks = fixedMarks.get(questionId) ?? q.marks;
      const trimmed = answer.trim();

      if (trimmed === "") {
        return { q, maxMarks, awarded: 0, isCorrect: null as boolean | null, feedback: "", skipped: true };
      }

      if (isObjective(q.question_type)) {
        const ok = normalizeAnswer(trimmed) === normalizeAnswer(q.correct_answer);
        return { q, maxMarks, awarded: ok ? maxMarks : 0, isCorrect: ok, feedback: "", skipped: false };
      }

      // Written answer.
      if (aiEnabled) {
        try {
          const result = await checkWrittenAnswer({
            question: q.question_text,
            modelAnswer: q.correct_answer,
            markingPoints: "",
            studentAnswer: trimmed,
            maxMarks,
          });
          const isCorrect = result.awarded >= maxMarks * 0.6;
          const feedback = [
            result.feedback,
            result.missingPoints.length > 0
              ? `Missing points: ${result.missingPoints.join("; ")}`
              : "",
            "(AI marking is guidance only, not official board marking.)",
          ]
            .filter(Boolean)
            .join("\n");
          return { q, maxMarks, awarded: result.awarded, isCorrect, feedback, skipped: false };
        } catch {
          // fall through to self-check
        }
      }
      return {
        q,
        maxMarks,
        awarded: 0,
        isCorrect: null as boolean | null,
        feedback:
          "AI marking is not available. Compare your answer with the model answer and self-assess.",
        skipped: false,
      };
    })
  );

  for (const g of graded) {
    if (!g) continue;
    totalMarks += g.maxMarks;
    score += g.awarded;
    if (g.skipped) skipped += 1;
    else if (g.isCorrect === true) correct += 1;
    else if (g.isCorrect === false) wrong += 1;

    answerRows.push({
      question_id: g.q.id,
      student_answer: params.answers.find((a) => a.questionId === g.q.id)?.answer ?? "",
      correct_answer: g.q.correct_answer,
      is_correct: g.isCorrect,
      marks_awarded: g.awarded,
      feedback: g.feedback,
    });
  }

  // Weak topic detection: topic accuracy below 60% within this attempt.
  const topicStats = new Map<string, { earned: number; possible: number }>();
  for (const g of graded) {
    if (!g || !g.q.topic_id) continue;
    const s = topicStats.get(g.q.topic_id) ?? { earned: 0, possible: 0 };
    s.earned += g.awarded;
    s.possible += g.maxMarks;
    topicStats.set(g.q.topic_id, s);
  }
  const weakTopicIds = [...topicStats.entries()]
    .filter(([, s]) => s.possible > 0 && s.earned / s.possible < 0.6)
    .map(([topicId]) => topicId);

  let weakTopics: { topic_id: string; topic_name: string }[] = [];
  if (weakTopicIds.length > 0) {
    const { data: topicRows } = await supabase
      .from("topics")
      .select("id, name")
      .in("id", weakTopicIds);
    weakTopics = (topicRows ?? []).map((t) => ({ topic_id: t.id, topic_name: t.name }));
  }

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  // Persist with the service role: attempts/answers stay student-immutable.
  const admin = createAdminClient();
  const { data: attempt, error: attemptError } = await admin
    .from("test_attempts")
    .insert({
      student_id: user.id,
      mock_test_id: params.testId,
      score,
      total_marks: totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      correct_count: correct,
      wrong_count: wrong,
      skipped_count: skipped,
      weak_topics_json: weakTopics,
      time_taken_seconds: params.timeTakenSeconds,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return { ok: false, error: attemptError?.message ?? "Could not save attempt" };
  }

  await admin
    .from("student_answers")
    .insert(answerRows.map((r) => ({ ...r, attempt_id: attempt.id })));

  // Update topic-level progress accuracy for every topic touched by the test.
  for (const [topicId, s] of topicStats.entries()) {
    const accuracy = s.possible > 0 ? Math.round((s.earned / s.possible) * 100) : null;
    const q = [...questions.values()].find((x) => x.topic_id === topicId);
    if (!q) continue;
    const { data: existing } = await admin
      .from("student_progress")
      .select("id")
      .eq("student_id", user.id)
      .eq("topic_id", topicId)
      .maybeSingle();
    const isWeak = accuracy !== null && accuracy < 60;
    if (existing) {
      await admin
        .from("student_progress")
        .update({
          accuracy_percentage: accuracy,
          ...(isWeak ? { completion_status: "needs_revision" } : {}),
          last_studied_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await admin.from("student_progress").insert({
        student_id: user.id,
        subject_id: q.subject_id,
        chapter_id: q.chapter_id,
        topic_id: topicId,
        completion_status: isWeak ? "needs_revision" : "in_progress",
        completion_percentage: isWeak ? 25 : 50,
        accuracy_percentage: accuracy,
      });
    }
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/student/progress");
  revalidatePath("/student/mock-tests");
  return { ok: true, attemptId: attempt.id };
}
