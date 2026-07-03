import { FileBarChart } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { getSubjectStats, getStudyStreak } from "@/lib/data";
import { NoChildLinked } from "@/components/NoChildLinked";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatDuration, pct } from "@/lib/utils";

/**
 * Weekly report generated live from the child's activity (no cron needed for
 * a personal-use app). Saved snapshots from admins also show here if present.
 */
export default async function ParentReportsPage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [subjectStats, streak, { data: weekAttempts }, { data: weekProgress }, { data: weekAi }, { data: savedReports }] =
    await Promise.all([
      getSubjectStats(child.id),
      getStudyStreak(child.id),
      supabase
        .from("test_attempts")
        .select("score, total_marks, percentage")
        .eq("student_id", child.id)
        .gte("started_at", weekAgo.toISOString())
        .not("submitted_at", "is", null),
      supabase
        .from("student_progress")
        .select("time_spent_seconds, completion_status, last_studied_at")
        .eq("student_id", child.id)
        .gte("last_studied_at", weekAgo.toISOString()),
      supabase
        .from("ai_doubt_history")
        .select("id")
        .eq("student_id", child.id)
        .gte("created_at", weekAgo.toISOString()),
      supabase
        .from("parent_reports")
        .select("*")
        .eq("parent_user_id", profile.id)
        .eq("student_user_id", child.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const testsTaken = (weekAttempts ?? []).length;
  const weekAvg =
    testsTaken > 0
      ? (weekAttempts ?? []).reduce((s, a) => s + Number(a.percentage), 0) / testsTaken
      : null;
  const weekTime = (weekProgress ?? []).reduce((s, r) => s + (r.time_spent_seconds ?? 0), 0);
  const topicsTouched = (weekProgress ?? []).length;
  const doubtsAsked = (weekAi ?? []).length;

  const weekStart = weekAgo.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weekly report</h1>
        <p className="mt-1 text-sm text-slate-500">
          {child.full_name || "Your child"} · {weekStart} – {today}
        </p>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="h-4 w-4 text-indigo-600" /> This week at a glance
        </CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
          {[
            { label: "Tests taken", value: String(testsTaken) },
            { label: "Week average", value: pct(weekAvg) },
            { label: "Study time", value: formatDuration(weekTime) },
            { label: "Topics studied", value: String(topicsTouched) },
            { label: "AI doubts asked", value: String(doubtsAsked) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Study streak: <span className="font-semibold">{streak} day{streak === 1 ? "" : "s"}</span>
          {streak >= 5 ? " — excellent consistency! 🎉" : streak === 0 ? " — encourage a short session today." : ""}
        </p>
      </Card>

      <Card>
        <CardTitle>Subject snapshot</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Progress</th>
                <th className="py-2 pr-4">Chapters done</th>
                <th className="py-2 pr-4">Avg score</th>
                <th className="py-2">Weak topics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectStats.map((s) => (
                <tr key={s.subject.id}>
                  <td className="py-2.5 pr-4 font-medium text-slate-700">{s.subject.name}</td>
                  <td className="py-2.5 pr-4">{s.progressPercent}%</td>
                  <td className="py-2.5 pr-4">
                    {s.completedChapters}/{s.totalChapters}
                  </td>
                  <td className="py-2.5 pr-4">{pct(s.averageScore)}</td>
                  <td className="py-2.5">{s.weakTopicsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(savedReports ?? []).length > 0 && (
        <Card>
          <CardTitle>Saved reports</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {(savedReports ?? []).map((r) => (
              <li key={r.id} className="py-2.5">
                <p className="font-medium text-slate-700">
                  {r.report_type} report · {r.period_start} – {r.period_end}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
