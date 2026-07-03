import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ClipboardCheck,
  RefreshCcw,
  Flame,
  Target,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getSubjectStats,
  getRecentAttempts,
  getStudyStreak,
  getWeakTopics,
} from "@/lib/data";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { pct } from "@/lib/utils";

export default async function StudentDashboard() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [subjectStats, recentAttempts, streak, weakTopics, { data: lastStudied }] =
    await Promise.all([
      getSubjectStats(profile.id),
      getRecentAttempts(profile.id, 1),
      getStudyStreak(profile.id),
      getWeakTopics(profile.id, 5),
      supabase
        .from("student_progress")
        .select("chapter_id, topic_id, last_studied_at, chapters:chapter_id(id, name, subject_id), topics:topic_id(id, name)")
        .eq("student_id", profile.id)
        .order("last_studied_at", { ascending: false })
        .limit(1),
    ]);

  const lastMock = recentAttempts[0];
  const continueRow = (lastStudied ?? [])[0] as unknown as
    | {
        chapter_id: string | null;
        topic_id: string | null;
        chapters: { id: string; name: string } | null;
        topics: { id: string; name: string } | null;
      }
    | undefined;

  // Recommended chapter: first non-completed chapter of the subject with the
  // lowest progress.
  const weakestSubject = [...subjectStats].sort((a, b) => a.progressPercent - b.progressPercent)[0];
  let recommended: { id: string; name: string; subjectName: string } | null = null;
  if (weakestSubject) {
    const { data: chapterRows } = await supabase
      .from("chapters")
      .select("id, name")
      .eq("subject_id", weakestSubject.subject.id)
      .eq("status", "active")
      .order("chapter_number")
      .limit(20);
    const { data: done } = await supabase
      .from("student_progress")
      .select("chapter_id")
      .eq("student_id", profile.id)
      .is("topic_id", null)
      .eq("completion_status", "completed");
    const doneIds = new Set((done ?? []).map((d) => d.chapter_id));
    const next = (chapterRows ?? []).find((c) => !doneIds.has(c.id));
    if (next) {
      recommended = { id: next.id, name: next.name, subjectName: weakestSubject.subject.name };
    }
  }

  const firstName = (profile.full_name || "Student").split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Class 10 · CBSE · Academic year 2025-26</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ButtonLink href="/student/subjects" variant="primary" className="justify-start py-3">
          <BookOpen className="h-4 w-4" /> Study
        </ButtonLink>
        <ButtonLink href="/student/ai-tutor" variant="secondary" className="justify-start py-3">
          <Sparkles className="h-4 w-4" /> Ask Doubt
        </ButtonLink>
        <ButtonLink href="/student/mock-tests" variant="secondary" className="justify-start py-3">
          <ClipboardCheck className="h-4 w-4" /> Take Mock Test
        </ButtonLink>
        <ButtonLink href="/student/revision" variant="secondary" className="justify-start py-3">
          <RefreshCcw className="h-4 w-4" /> Revise Weak Topics
        </ButtonLink>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label="Study streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          icon={Flame}
          tone="amber"
          hint={streak > 0 ? "Keep it going!" : "Study today to start a streak"}
        />
        <DashboardStatCard
          label="Last mock test"
          value={lastMock ? pct(Number(lastMock.percentage)) : "—"}
          icon={Target}
          tone={lastMock && Number(lastMock.percentage) >= 60 ? "emerald" : "rose"}
          hint={lastMock ? `${lastMock.score}/${lastMock.total_marks} marks` : "No tests taken yet"}
        />
        <DashboardStatCard
          label="Weak topics"
          value={weakTopics.length}
          icon={AlertTriangle}
          tone={weakTopics.length > 0 ? "rose" : "emerald"}
          hint={weakTopics.length > 0 ? "Revise them soon" : "Nothing flagged — great!"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Continue studying */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-indigo-600" /> Continue studying
          </CardTitle>
          {continueRow?.topics || continueRow?.chapters ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-indigo-50/60 p-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {continueRow.topics?.name ?? continueRow.chapters?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {continueRow.topics ? "Pick up this topic where you left off" : "Continue this chapter"}
                </p>
              </div>
              <ButtonLink
                size="sm"
                href={
                  continueRow.topics
                    ? `/student/topics/${continueRow.topics.id}`
                    : `/student/chapters/${continueRow.chapters!.id}`
                }
              >
                Resume
              </ButtonLink>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              You haven&apos;t started studying yet. Open a subject to begin!
            </p>
          )}
        </Card>

        {/* Recommended chapter */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Today&apos;s recommended chapter
          </CardTitle>
          {recommended ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50/60 p-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{recommended.name}</p>
                <p className="text-xs text-slate-500">{recommended.subjectName} — your weakest subject right now</p>
              </div>
              <ButtonLink size="sm" href={`/student/chapters/${recommended.id}`}>
                Study now
              </ButtonLink>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No recommendation yet — the admin needs to add subjects and chapters.
            </p>
          )}
        </Card>
      </div>

      {/* Subject progress */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Subject progress</h2>
          <Link href="/student/subjects" className="text-sm font-medium text-indigo-600 hover:underline">
            View all subjects
          </Link>
        </div>
        {subjectStats.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            hint="Ask the admin to add subjects, or run the seed data script from the README."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjectStats.map((s) => (
              <Link
                key={s.subject.id}
                href={`/student/subjects/${s.subject.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300"
              >
                <p className="text-sm font-semibold text-slate-800">{s.subject.name}</p>
                <ProgressBar value={s.progressPercent} showLabel className="mt-2" />
                <p className="mt-2 text-xs text-slate-500">
                  {s.completedChapters}/{s.totalChapters} chapters · Avg {pct(s.averageScore)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics to revise
          </CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {weakTopics.map((w) => {
              const topic = (w as unknown as { topics: { name: string } | null }).topics;
              const topicId = (w as unknown as { topic_id: string | null }).topic_id;
              const accuracy = (w as unknown as { accuracy_percentage: number | null }).accuracy_percentage;
              return (
                <li key={(w as unknown as { id: string }).id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{topic?.name ?? "Topic"}</p>
                    {accuracy !== null && (
                      <p className="text-xs text-slate-400">Accuracy {pct(Number(accuracy))}</p>
                    )}
                  </div>
                  {topicId && (
                    <ButtonLink size="sm" variant="outline" href={`/student/topics/${topicId}`}>
                      Revise
                    </ButtonLink>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
