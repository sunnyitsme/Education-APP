import { Clock, CalendarDays, Timer } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { getStudyStreak, getTotalStudyTime } from "@/lib/data";
import { NoChildLinked } from "@/components/NoChildLinked";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { formatDuration } from "@/lib/utils";

export default async function ParentStudyTimePage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalTime, streak, { data: weekRows }, { data: spRow }] = await Promise.all([
    getTotalStudyTime(child.id),
    getStudyStreak(child.id),
    supabase
      .from("student_progress")
      .select("time_spent_seconds, last_studied_at, subjects(name)")
      .eq("student_id", child.id)
      .gte("last_studied_at", weekAgo.toISOString()),
    supabase.from("student_profiles").select("daily_study_goal").eq("user_id", child.id).maybeSingle(),
  ]);

  const weekSeconds = (weekRows ?? []).reduce((s, r) => s + (r.time_spent_seconds ?? 0), 0);
  const goalMinutes = spRow?.daily_study_goal ?? 60;

  // Per-subject share of tracked time (all-time).
  const { data: allRows } = await supabase
    .from("student_progress")
    .select("time_spent_seconds, subjects(name)")
    .eq("student_id", child.id);
  const bySubject = new Map<string, number>();
  for (const r of allRows ?? []) {
    const name = (r as unknown as { subjects: { name: string } | null }).subjects?.name ?? "Other";
    bySubject.set(name, (bySubject.get(name) ?? 0) + (r.time_spent_seconds ?? 0));
  }
  const subjectTimes = [...bySubject.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Study time</h1>
        <p className="mt-1 text-sm text-slate-500">
          Time tracked while {child.full_name || "your child"} studies topics in the app.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard label="This week" value={formatDuration(weekSeconds)} icon={Clock} tone="sky" />
        <DashboardStatCard label="All time" value={formatDuration(totalTime)} icon={Timer} tone="indigo" />
        <DashboardStatCard
          label="Study streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          icon={CalendarDays}
          tone="amber"
        />
        <DashboardStatCard label="Daily goal" value={`${goalMinutes} min`} icon={Clock} tone="emerald" />
      </div>

      <Card>
        <CardTitle>Time by subject (all time)</CardTitle>
        {subjectTimes.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No study time tracked yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {subjectTimes.map(([name, seconds]) => (
              <li key={name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="text-slate-500">{formatDuration(seconds)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Note: time is tracked while topics are open in the study pages, so real offline study
          (notebook practice) is extra.
        </p>
      </Card>
    </div>
  );
}
