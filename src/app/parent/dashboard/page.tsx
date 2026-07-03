import { TrendingUp, Clock, Target, AlertTriangle, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { getSubjectStats, getRecentAttempts, getWeakTopics } from "@/lib/data";
import { NoChildLinked } from "@/components/NoChildLinked";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateTime, formatDuration, pct, scoreColor } from "@/lib/utils";

export default async function ParentDashboard() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
        <NoChildLinked />
      </div>
    );
  }

  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [subjectStats, recentMocks, weakTopics, { data: weekProgress }, { data: recentPapers }] =
    await Promise.all([
      getSubjectStats(child.id),
      getRecentAttempts(child.id, 5),
      getWeakTopics(child.id, 5),
      supabase
        .from("student_progress")
        .select("time_spent_seconds, last_studied_at")
        .eq("student_id", child.id)
        .gte("last_studied_at", weekAgo.toISOString()),
      supabase
        .from("previous_year_attempts")
        .select("*, previous_year_papers(paper_year, subjects(name))")
        .eq("student_id", child.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(3),
    ]);

  const overall =
    subjectStats.length > 0
      ? Math.round(subjectStats.reduce((s, x) => s + x.progressPercent, 0) / subjectStats.length)
      : 0;

  const scores = recentMocks.map((a) => Number(a.percentage));
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const weekSeconds = (weekProgress ?? []).reduce((s, r) => s + (r.time_spent_seconds ?? 0), 0);

  // Suggested next steps.
  const suggestions: string[] = [];
  if (weakTopics.length > 0) {
    suggestions.push(`Revise weak topics (${weakTopics.length} flagged) — see the Weak Areas page.`);
  }
  const weakest = [...subjectStats].sort((a, b) => a.progressPercent - b.progressPercent)[0];
  if (weakest && weakest.progressPercent < 50) {
    suggestions.push(`${weakest.subject.name} progress is ${weakest.progressPercent}% — encourage a study session this week.`);
  }
  if (recentMocks.length === 0) {
    suggestions.push("No mock tests yet — a quick 10-question test is a good start.");
  } else if (avgScore !== null && avgScore < 60) {
    suggestions.push("Recent test average is below 60% — review mistakes together on the results pages.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Everything looks on track — keep the daily study routine going!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {child.full_name || "Your child"}&apos;s progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">Class 10 · CBSE — read-only parent view</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard label="Overall progress" value={`${overall}%`} icon={TrendingUp} tone="indigo" />
        <DashboardStatCard
          label="Average score"
          value={pct(avgScore)}
          icon={Target}
          tone={avgScore !== null && avgScore >= 60 ? "emerald" : "amber"}
          hint="Last 5 mock tests"
        />
        <DashboardStatCard
          label="Study time this week"
          value={formatDuration(weekSeconds)}
          icon={Clock}
          tone="sky"
        />
        <DashboardStatCard
          label="Weak topics"
          value={weakTopics.length}
          icon={AlertTriangle}
          tone={weakTopics.length > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Subject-wise progress */}
      <Card>
        <CardTitle>Subject-wise progress</CardTitle>
        <div className="mt-4 space-y-4">
          {subjectStats.map((s) => (
            <div key={s.subject.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{s.subject.name}</span>
                <span className="text-xs text-slate-400">
                  {s.completedChapters}/{s.totalChapters} chapters · Avg {pct(s.averageScore)}
                </span>
              </div>
              <ProgressBar value={s.progressPercent} showLabel />
            </div>
          ))}
          {subjectStats.length === 0 && (
            <p className="text-sm text-slate-500">No subjects set up yet.</p>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent mock tests */}
        <Card>
          <CardTitle>Recent mock test scores</CardTitle>
          {recentMocks.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No mock tests taken yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentMocks.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-600">{formatDateTime(a.submitted_at)}</span>
                  <span className={`font-semibold ${scoreColor(Number(a.percentage))}`}>
                    {Number(a.score)}/{a.total_marks} ({pct(Number(a.percentage))})
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ButtonLink href="/parent/mock-results" variant="ghost" size="sm" className="mt-2">
            All mock results <ArrowRight className="h-3.5 w-3.5" />
          </ButtonLink>
        </Card>

        {/* Recent papers */}
        <Card>
          <CardTitle>Recent previous year papers</CardTitle>
          {(recentPapers ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No papers attempted yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {(recentPapers ?? []).map((a) => {
                const p = (a as unknown as {
                  previous_year_papers: {
                    paper_year: number;
                    subjects: { name: string } | null;
                  } | null;
                }).previous_year_papers;
                return (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-slate-600">
                      {p?.subjects?.name} {p?.paper_year}
                    </span>
                    <span className={`font-semibold ${scoreColor(Number(a.percentage))}`}>
                      {pct(Number(a.percentage))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <ButtonLink href="/parent/previous-year-results" variant="ghost" size="sm" className="mt-2">
            All paper results <ArrowRight className="h-3.5 w-3.5" />
          </ButtonLink>
        </Card>
      </div>

      {/* Weak chapters + suggestions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics
          </CardTitle>
          {weakTopics.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Nothing flagged — great!</p>
          ) : (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
              {weakTopics.map((w) => (
                <li key={(w as unknown as { id: string }).id}>
                  {(w as unknown as { topics: { name: string } | null }).topics?.name ?? "Topic"}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Suggested next steps</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-xl bg-indigo-50/50 px-3 py-2">
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
