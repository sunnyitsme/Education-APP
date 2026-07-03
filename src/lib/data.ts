import { createClient } from "@/lib/supabase/server";
import type {
  Chapter,
  StudentProgress,
  Subject,
  TestAttempt,
  Topic,
} from "@/lib/types";

/** Per-subject rollup used on dashboards and the subjects page. */
export interface SubjectStats {
  subject: Subject;
  totalChapters: number;
  completedChapters: number;
  averageScore: number | null;
  weakTopicsCount: number;
  progressPercent: number;
}

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("status", "active")
    .order("name");
  return (data ?? []) as Subject[];
}

export async function getSubjectStats(studentId: string): Promise<SubjectStats[]> {
  const supabase = await createClient();

  const [{ data: subjects }, { data: chapters }, { data: progress }, { data: attempts }] =
    await Promise.all([
      supabase.from("subjects").select("*").eq("status", "active").order("name"),
      supabase.from("chapters").select("id, subject_id").eq("status", "active"),
      supabase.from("student_progress").select("*").eq("student_id", studentId),
      supabase
        .from("test_attempts")
        .select("percentage, mock_test_id, mock_tests(subject_id)")
        .eq("student_id", studentId)
        .not("submitted_at", "is", null),
    ]);

  const chapterList = (chapters ?? []) as Pick<Chapter, "id" | "subject_id">[];
  const progressList = (progress ?? []) as StudentProgress[];

  return ((subjects ?? []) as Subject[]).map((subject) => {
    const subjectChapters = chapterList.filter((c) => c.subject_id === subject.id);
    const chapterIds = new Set(subjectChapters.map((c) => c.id));
    const subjectProgress = progressList.filter((p) => p.subject_id === subject.id);

    const completedChapters = subjectProgress.filter(
      (p) => p.topic_id === null && p.chapter_id && chapterIds.has(p.chapter_id) && p.completion_status === "completed"
    ).length;

    const weakTopicsCount = subjectProgress.filter(
      (p) => p.topic_id !== null && p.completion_status === "needs_revision"
    ).length;

    const subjectAttempts = ((attempts ?? []) as unknown as {
      percentage: number;
      mock_tests: { subject_id: string | null } | null;
    }[]).filter((a) => a.mock_tests?.subject_id === subject.id);

    const averageScore =
      subjectAttempts.length > 0
        ? subjectAttempts.reduce((s, a) => s + Number(a.percentage), 0) / subjectAttempts.length
        : null;

    const chapterProgress = subjectProgress.filter((p) => p.topic_id === null && p.chapter_id);
    const progressPercent =
      subjectChapters.length > 0
        ? Math.round(
            chapterProgress.reduce((s, p) => s + Number(p.completion_percentage), 0) /
              subjectChapters.length
          )
        : 0;

    return {
      subject,
      totalChapters: subjectChapters.length,
      completedChapters,
      averageScore,
      weakTopicsCount,
      progressPercent: Math.min(100, progressPercent),
    };
  });
}

/** Weak topics = topic-level progress rows flagged needs_revision or accuracy < 60%. */
export async function getWeakTopics(studentId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_progress")
    .select("*, topics(name, chapter_id, chapters:chapter_id(name, subject_id))")
    .eq("student_id", studentId)
    .not("topic_id", "is", null)
    .or("completion_status.eq.needs_revision,accuracy_percentage.lt.60")
    .order("last_studied_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentAttempts(studentId: string, limit = 5): Promise<TestAttempt[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("test_attempts")
    .select("*")
    .eq("student_id", studentId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as TestAttempt[];
}

/** Consecutive-day study streak ending today (from progress + attempts activity). */
export async function getStudyStreak(studentId: string): Promise<number> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const [{ data: progress }, { data: attempts }] = await Promise.all([
    supabase
      .from("student_progress")
      .select("last_studied_at")
      .eq("student_id", studentId)
      .gte("last_studied_at", since.toISOString()),
    supabase
      .from("test_attempts")
      .select("submitted_at")
      .eq("student_id", studentId)
      .gte("started_at", since.toISOString()),
  ]);

  const days = new Set<string>();
  for (const p of progress ?? []) {
    if (p.last_studied_at) days.add(new Date(p.last_studied_at).toDateString());
  }
  for (const a of attempts ?? []) {
    if (a.submitted_at) days.add(new Date(a.submitted_at).toDateString());
  }

  let streak = 0;
  const cursor = new Date();
  // Allow the streak to survive if the student hasn't studied *yet* today.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getTotalStudyTime(studentId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_progress")
    .select("time_spent_seconds")
    .eq("student_id", studentId);
  return (data ?? []).reduce((s, r) => s + (r.time_spent_seconds ?? 0), 0);
}

/** Chapters of a subject annotated with the student's progress + last score. */
export async function getChaptersWithProgress(subjectId: string, studentId: string) {
  const supabase = await createClient();
  const [{ data: chapters }, { data: progress }, { data: attempts }] = await Promise.all([
    supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("status", "active")
      .order("chapter_number"),
    supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("subject_id", subjectId),
    supabase
      .from("test_attempts")
      .select("percentage, submitted_at, mock_tests!inner(chapter_id, subject_id)")
      .eq("student_id", studentId)
      .eq("mock_tests.subject_id", subjectId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false }),
  ]);

  const progressList = (progress ?? []) as StudentProgress[];
  return ((chapters ?? []) as Chapter[]).map((chapter) => {
    const p = progressList.find((r) => r.chapter_id === chapter.id && r.topic_id === null);
    const lastAttempt = ((attempts ?? []) as unknown as {
      percentage: number;
      mock_tests: { chapter_id: string | null };
    }[]).find((a) => a.mock_tests?.chapter_id === chapter.id);
    return {
      chapter,
      progressPercent: p ? Number(p.completion_percentage) : 0,
      status: p?.completion_status ?? "not_started",
      lastScore: lastAttempt ? Number(lastAttempt.percentage) : null,
    };
  });
}

export async function getTopicsForChapter(chapterId: string): Promise<Topic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("status", "active")
    .order("topic_order");
  return (data ?? []) as Topic[];
}
