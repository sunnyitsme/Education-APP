import { Clock, TrendingUp, ClipboardCheck, ScrollText, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSubjectStats, getTotalStudyTime, getWeakTopics } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";
import { ImprovementChart, type ScorePoint } from "@/components/ImprovementChart";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime, formatDuration, pct, scoreColor, statusLabel } from "@/lib/utils";

export default async function ProgressPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [subjectStats, studyTime, weakTopics, { data: mockAttempts }, { data: paperAttempts }, { data: chapterProgress }] =
    await Promise.all([
      getSubjectStats(profile.id),
      getTotalStudyTime(profile.id),
      getWeakTopics(profile.id, 10),
      supabase
        .from("test_attempts")
        .select("*, mock_tests(name)")
        .eq("student_id", profile.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: true }),
      supabase
        .from("previous_year_attempts")
        .select("*, previous_year_papers(paper_year, subjects(name))")
        .eq("student_id", profile.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: true }),
      supabase
        .from("student_progress")
        .select("*, chapters:chapter_id(name, chapter_number), subjects(name)")
        .eq("student_id", profile.id)
        .is("topic_id", null)
        .not("chapter_id", "is", null)
        .order("last_studied_at", { ascending: false }),
    ]);

  const overall =
    subjectStats.length > 0
      ? Math.round(subjectStats.reduce((s, x) => s + x.progressPercent, 0) / subjectStats.length)
      : 0;

  const chartData: ScorePoint[] = [
    ...(mockAttempts ?? []).map((a) => ({
      when: new Date(a.submitted_at!).getTime(),
      point: {
        date: new Date(a.submitted_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        percentage: Math.round(Number(a.percentage)),
        name: (a as unknown as { mock_tests: { name: string } | null }).mock_tests?.name ?? "Mock test",
      },
    })),
    ...(paperAttempts ?? []).map((a) => {
      const p = (a as unknown as {
        previous_year_papers: { paper_year: number; subjects: { name: string } | null } | null;
      }).previous_year_papers;
      return {
        when: new Date(a.submitted_at!).getTime(),
        point: {
          date: new Date(a.submitted_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          percentage: Math.round(Number(a.percentage)),
          name: `${p?.subjects?.name ?? "Paper"} ${p?.paper_year ?? ""}`,
        },
      };
    }),
  ]
    .sort((a, b) => a.when - b.when)
    .map((x) => x.point);

  const mockHistory = [...(mockAttempts ?? [])].reverse();
  const paperHistory = [...(paperAttempts ?? [])].reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything you have studied and scored, in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard label="Overall progress" value={`${overall}%`} icon={TrendingUp} tone="indigo" />
        <DashboardStatCard label="Study time" value={formatDuration(studyTime)} icon={Clock} tone="sky" />
        <DashboardStatCard label="Mock tests taken" value={(mockAttempts ?? []).length} icon={ClipboardCheck} tone="emerald" />
        <DashboardStatCard label="Papers solved" value={(paperAttempts ?? []).length} icon={ScrollText} tone="amber" />
      </div>

      {/* Improvement chart */}
      <Card>
        <CardTitle>Score improvement over time</CardTitle>
        <p className="mb-2 mt-1 text-xs text-slate-400">
          Every mock test and previous year paper attempt, oldest to newest.
        </p>
        <ImprovementChart data={chartData} />
      </Card>

      {/* Subject-wise progress */}
      <Card>
        <CardTitle>Subject-wise progress</CardTitle>
        <div className="mt-4 space-y-4">
          {subjectStats.length === 0 && (
            <p className="text-sm text-slate-500">No subjects available yet.</p>
          )}
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
        </div>
      </Card>

      {/* Chapter-wise progress */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Chapter-wise progress</h2>
        <DataTable
          rows={(chapterProgress ?? []) as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No chapters studied yet"
          emptyHint="Open a subject and start studying — progress appears here."
          columns={[
            {
              header: "Chapter",
              cell: (r) => {
                const ch = r.chapters as unknown as { name: string; chapter_number: number } | null;
                return ch ? `Ch ${ch.chapter_number}: ${ch.name}` : "—";
              },
            },
            {
              header: "Subject",
              cell: (r) => (r.subjects as unknown as { name: string } | null)?.name ?? "—",
            },
            { header: "Status", cell: (r) => statusLabel(String(r.completion_status)) },
            {
              header: "Progress",
              cell: (r) => <ProgressBar value={Number(r.completion_percentage)} showLabel className="w-32" />,
            },
            {
              header: "Accuracy",
              cell: (r) =>
                r.accuracy_percentage === null ? "—" : pct(Number(r.accuracy_percentage)),
            },
            { header: "Last studied", cell: (r) => formatDateTime(String(r.last_studied_at)) },
          ]}
        />
      </div>

      {/* Mock test history */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Mock test history</h2>
        <DataTable
          rows={mockHistory as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No mock tests taken yet"
          columns={[
            {
              header: "Test",
              cell: (r) => (r.mock_tests as unknown as { name: string } | null)?.name ?? "Test",
            },
            {
              header: "Score",
              cell: (r) => `${Number(r.score)}/${Number(r.total_marks)}`,
            },
            {
              header: "Percentage",
              cell: (r) => (
                <span className={`font-semibold ${scoreColor(Number(r.percentage))}`}>
                  {pct(Number(r.percentage))}
                </span>
              ),
            },
            { header: "Time", cell: (r) => formatDuration(Number(r.time_taken_seconds)) },
            { header: "Date", cell: (r) => formatDateTime(String(r.submitted_at)) },
            {
              header: "",
              cell: (r) => (
                <ButtonLink size="sm" variant="outline" href={`/student/results/${r.id}`}>
                  Review
                </ButtonLink>
              ),
            },
          ]}
        />
      </div>

      {/* Paper history */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Previous year paper history</h2>
        <DataTable
          rows={paperHistory as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No papers solved yet"
          columns={[
            {
              header: "Paper",
              cell: (r) => {
                const p = r.previous_year_papers as unknown as {
                  paper_year: number;
                  subjects: { name: string } | null;
                } | null;
                return `${p?.subjects?.name ?? "Paper"} ${p?.paper_year ?? ""}`;
              },
            },
            { header: "Score", cell: (r) => `${Number(r.score)}/${Number(r.total_marks)}` },
            {
              header: "Percentage",
              cell: (r) => (
                <span className={`font-semibold ${scoreColor(Number(r.percentage))}`}>
                  {pct(Number(r.percentage))}
                </span>
              ),
            },
            { header: "Date", cell: (r) => formatDateTime(String(r.submitted_at)) },
            {
              header: "",
              cell: (r) => (
                <ButtonLink
                  size="sm"
                  variant="outline"
                  href={`/student/previous-year-papers/${r.paper_id}?attempt=${r.id}`}
                >
                  Review
                </ButtonLink>
              ),
            },
          ]}
        />
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics
          </CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakTopics.map((w) => {
              const topic = (w as unknown as { topics: { name: string } | null }).topics;
              const topicId = (w as unknown as { topic_id: string | null }).topic_id;
              if (!topicId) return null;
              return (
                <ButtonLink key={topicId} size="sm" variant="outline" href={`/student/topics/${topicId}`}>
                  {topic?.name ?? "Topic"}
                </ButtonLink>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
