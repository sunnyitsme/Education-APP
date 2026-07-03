"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkWrittenAnswer, isAiConfigured } from "@/lib/ai/gemini";
import { isObjective, normalizeAnswer } from "@/lib/utils";
import type { PreviousYearQuestion } from "@/lib/types";

export interface PaperAnswer {
  questionId: string;
  answer: string;
}

/**
 * Grade a previous year paper attempt. MCQs auto-check; written answers are
 * compared with the model answer + marking points via Gemini (approximate,
 * clearly labelled as guidance). Weak chapters are detected from per-chapter
 * accuracy.
 */
export async function submitPreviousYearPaper(params: {
  paperId: string;
  answers: PaperAnswer[];
  timeTakenSeconds: number;
}): Promise<{ ok: boolean; attemptId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: questionRows } = await supabase
    .from("previous_year_questions")
    .select("*")
    .eq("paper_id", params.paperId);
  const questions = new Map(
    (questionRows ?? []).map((q) => [q.id, q as PreviousYearQuestion])
  );
  if (questions.size === 0) return { ok: false, error: "This paper has no questions yet." };

  const aiEnabled = isAiConfigured();

  const graded = await Promise.all(
    params.answers.map(async ({ questionId, answer }) => {
      const q = questions.get(questionId);
      if (!q) return null;
      const trimmed = answer.trim();

      if (trimmed === "") {
        return {
          q,
          awarded: 0,
          isCorrect: null as boolean | null,
          feedback: "Skipped. Study the model answer and marking points.",
        };
      }

      if (isObjective(q.question_type)) {
        const ok = normalizeAnswer(trimmed) === normalizeAnswer(q.model_answer);
        return {
          q,
          awarded: ok ? q.marks : 0,
          isCorrect: ok,
          feedback: "",
        };
      }

      if (aiEnabled) {
        try {
          const result = await checkWrittenAnswer({
            question: q.question_text,
            modelAnswer: q.model_answer,
            markingPoints: q.marking_points,
            studentAnswer: trimmed,
            maxMarks: q.marks,
          });
          const feedback = [
            result.feedback,
            result.missingPoints.length > 0
              ? `Missing points: ${result.missingPoints.join("; ")}`
              : "",
            result.improvedAnswer ? `Improved answer: ${result.improvedAnswer}` : "",
            "(AI marking is approximate guidance, not official board marking.)",
          ]
            .filter(Boolean)
            .join("\n\n");
          return {
            q,
            awarded: result.awarded,
            isCorrect: result.awarded >= q.marks * 0.6,
            feedback,
          };
        } catch {
          // fall through
        }
      }
      return {
        q,
        awarded: 0,
        isCorrect: null as boolean | null,
        feedback:
          "AI marking is not available. Compare your answer with the model answer and marking points to self-assess.",
      };
    })
  );

  let score = 0;
  const totalMarks = [...questions.values()].reduce((s, q) => s + q.marks, 0);
  const chapterStats = new Map<string, { earned: number; possible: number }>();

  const answerRows: {
    question_id: string;
    student_answer: string;
    is_correct: boolean | null;
    marks_awarded: number;
    ai_feedback: string;
  }[] = [];

  for (const g of graded) {
    if (!g) continue;
    score += g.awarded;
    answerRows.push({
      question_id: g.q.id,
      student_answer: params.answers.find((a) => a.questionId === g.q.id)?.answer ?? "",
      is_correct: g.isCorrect,
      marks_awarded: g.awarded,
      ai_feedback: g.feedback,
    });
    if (g.q.chapter_id) {
      const s = chapterStats.get(g.q.chapter_id) ?? { earned: 0, possible: 0 };
      s.earned += g.awarded;
      s.possible += g.q.marks;
      chapterStats.set(g.q.chapter_id, s);
    }
  }

  const weakChapterIds = [...chapterStats.entries()]
    .filter(([, s]) => s.possible > 0 && s.earned / s.possible < 0.6)
    .map(([id]) => id);

  let weakChapters: { chapter_id: string; chapter_name: string }[] = [];
  if (weakChapterIds.length > 0) {
    const { data: chapterRows } = await supabase
      .from("chapters")
      .select("id, name")
      .in("id", weakChapterIds);
    weakChapters = (chapterRows ?? []).map((c) => ({ chapter_id: c.id, chapter_name: c.name }));
  }

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  const admin = createAdminClient();
  const { data: attempt, error } = await admin
    .from("previous_year_attempts")
    .insert({
      student_id: user.id,
      paper_id: params.paperId,
      score,
      total_marks: totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      weak_chapters_json: weakChapters,
      time_taken_seconds: params.timeTakenSeconds,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !attempt) return { ok: false, error: error?.message ?? "Could not save attempt" };

  await admin
    .from("previous_year_answers")
    .insert(answerRows.map((r) => ({ ...r, attempt_id: attempt.id })));

  // Flag weak chapters in progress records for the revision page.
  for (const chapterId of weakChapterIds) {
    const q = [...questions.values()].find((x) => x.chapter_id === chapterId);
    if (!q) continue;
    const { data: existing } = await admin
      .from("student_progress")
      .select("id")
      .eq("student_id", user.id)
      .eq("chapter_id", chapterId)
      .is("topic_id", null)
      .maybeSingle();
    if (existing) {
      await admin
        .from("student_progress")
        .update({ completion_status: "needs_revision", last_studied_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await admin.from("student_progress").insert({
        student_id: user.id,
        subject_id: q.subject_id,
        chapter_id: chapterId,
        topic_id: null,
        completion_status: "needs_revision",
        completion_percentage: 25,
      });
    }
  }

  revalidatePath("/student/previous-year-papers");
  revalidatePath("/student/dashboard");
  return { ok: true, attemptId: attempt.id };
}
