"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { evaluateVivaAnswer, isAiConfigured } from "@/lib/ai/gemini";
import type { VivaQuestion } from "@/lib/types";

/** Mark a Computer Applications practical task as started or completed. */
export async function updatePracticalAttempt(params: {
  taskId: string;
  status: "in_progress" | "completed";
  notes?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: existing } = await supabase
    .from("practical_attempts")
    .select("id")
    .eq("student_id", user.id)
    .eq("task_id", params.taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    status: params.status,
    notes: params.notes ?? "",
    completed_at: params.status === "completed" ? new Date().toISOString() : null,
  };

  if (existing) {
    await supabase.from("practical_attempts").update(payload).eq("id", existing.id);
  } else {
    await supabase
      .from("practical_attempts")
      .insert({ student_id: user.id, task_id: params.taskId, ...payload });
  }

  revalidatePath("/student/subjects");
  return { ok: true };
}

/**
 * Submit a viva answer: AI scores it out of 10 with model answer and missing
 * points. Falls back to showing the model answer when AI is not configured.
 */
export async function submitVivaAnswer(params: { vivaQuestionId: string; answer: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const { data: questionRow } = await supabase
    .from("viva_questions")
    .select("*")
    .eq("id", params.vivaQuestionId)
    .single();
  if (!questionRow) return { ok: false as const, error: "Viva question not found" };
  const question = questionRow as VivaQuestion;

  let score: number | null = null;
  let feedback = "";
  let missingPoints = "";

  if (isAiConfigured()) {
    try {
      const result = await evaluateVivaAnswer({
        question: question.question,
        modelAnswer: question.model_answer,
        keyPoints: question.key_points,
        studentAnswer: params.answer,
      });
      score = result.score;
      feedback = result.feedback;
      missingPoints = result.missingPoints.join("\n");
    } catch {
      feedback = "AI scoring failed this time. Compare your answer with the model answer.";
    }
  } else {
    feedback =
      "AI scoring is not configured. Compare your answer with the model answer and key points.";
  }

  await supabase.from("viva_attempts").insert({
    student_id: user.id,
    viva_question_id: params.vivaQuestionId,
    student_answer: params.answer,
    score,
    max_score: 10,
    feedback,
    missing_points: missingPoints,
  });

  return {
    ok: true as const,
    score,
    feedback,
    missingPoints,
    modelAnswer: question.model_answer,
    keyPoints: question.key_points,
  };
}
