"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Record that the student studied a topic. Upserts the topic progress row and
 * rolls the chapter progress up from its topics.
 */
export async function markTopicStudied(params: {
  topicId: string;
  status: "in_progress" | "completed" | "needs_revision";
  timeSpentSeconds?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: topic } = await supabase
    .from("topics")
    .select("id, chapter_id, chapters(subject_id)")
    .eq("id", params.topicId)
    .single();
  if (!topic) return { ok: false, error: "Topic not found" };

  const chapterId = topic.chapter_id as string;
  const subjectId = (topic.chapters as unknown as { subject_id: string }).subject_id;

  const { data: existing } = await supabase
    .from("student_progress")
    .select("id, time_spent_seconds")
    .eq("student_id", user.id)
    .eq("topic_id", params.topicId)
    .maybeSingle();

  const completion =
    params.status === "completed" ? 100 : params.status === "in_progress" ? 50 : 25;

  if (existing) {
    await supabase
      .from("student_progress")
      .update({
        completion_status: params.status,
        completion_percentage: completion,
        time_spent_seconds: (existing.time_spent_seconds ?? 0) + (params.timeSpentSeconds ?? 0),
        last_studied_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("student_progress").insert({
      student_id: user.id,
      subject_id: subjectId,
      chapter_id: chapterId,
      topic_id: params.topicId,
      completion_status: params.status,
      completion_percentage: completion,
      time_spent_seconds: params.timeSpentSeconds ?? 0,
    });
  }

  await rollUpChapterProgress(user.id, subjectId, chapterId);

  revalidatePath("/student/dashboard");
  revalidatePath(`/student/chapters/${chapterId}`);
  revalidatePath(`/student/topics/${params.topicId}`);
  return { ok: true };
}

/** Recompute a chapter-level progress row from its topic rows. */
async function rollUpChapterProgress(studentId: string, subjectId: string, chapterId: string) {
  const supabase = await createClient();

  const [{ data: topics }, { data: topicProgress }] = await Promise.all([
    supabase.from("topics").select("id").eq("chapter_id", chapterId).eq("status", "active"),
    supabase
      .from("student_progress")
      .select("topic_id, completion_status, completion_percentage")
      .eq("student_id", studentId)
      .eq("chapter_id", chapterId)
      .not("topic_id", "is", null),
  ]);

  const total = topics?.length ?? 0;
  if (total === 0) return;

  const rows = topicProgress ?? [];
  const percent =
    rows.reduce((s, r) => s + Number(r.completion_percentage ?? 0), 0) / total;
  const anyNeedsRevision = rows.some((r) => r.completion_status === "needs_revision");
  const allCompleted =
    rows.length === total && rows.every((r) => r.completion_status === "completed");

  const status = anyNeedsRevision
    ? "needs_revision"
    : allCompleted
      ? "completed"
      : rows.length > 0
        ? "in_progress"
        : "not_started";

  const { data: existing } = await supabase
    .from("student_progress")
    .select("id")
    .eq("student_id", studentId)
    .eq("chapter_id", chapterId)
    .is("topic_id", null)
    .maybeSingle();

  const payload = {
    completion_status: status,
    completion_percentage: Math.round(percent),
    last_studied_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("student_progress").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("student_progress").insert({
      student_id: studentId,
      subject_id: subjectId,
      chapter_id: chapterId,
      topic_id: null,
      ...payload,
    });
  }
}
