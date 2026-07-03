import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { getSubjectStats } from "@/lib/data";
import { NoChildLinked } from "@/components/NoChildLinked";
import { Card, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime, pct, statusLabel } from "@/lib/utils";

export default async function ParentProgressPage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const [subjectStats, { data: chapterProgress }, { data: topicProgress }] = await Promise.all([
    getSubjectStats(child.id),
    supabase
      .from("student_progress")
      .select("*, chapters:chapter_id(name, chapter_number), subjects(name)")
      .eq("student_id", child.id)
      .is("topic_id", null)
      .not("chapter_id", "is", null)
      .order("last_studied_at", { ascending: false }),
    supabase
      .from("student_progress")
      .select("*, topics:topic_id(name), subjects(name)")
      .eq("student_id", child.id)
      .not("topic_id", "is", null)
      .order("last_studied_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {child.full_name || "Your child"}&apos;s study progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          What was studied, chapter completion and recent topics.
        </p>
      </div>

      <Card>
        <CardTitle>Subject-wise progress</CardTitle>
        <div className="mt-4 space-y-4">
          {subjectStats.map((s) => (
            <div key={s.subject.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{s.subject.name}</span>
                <span className="text-xs text-slate-400">
                  {s.completedChapters}/{s.totalChapters} chapters
                </span>
              </div>
              <ProgressBar value={s.progressPercent} showLabel />
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Chapter progress</h2>
        <DataTable
          rows={(chapterProgress ?? []) as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No chapters studied yet"
          columns={[
            {
              header: "Chapter",
              cell: (r) => {
                const ch = r.chapters as unknown as { name: string; chapter_number: number } | null;
                return ch ? `Ch ${ch.chapter_number}: ${ch.name}` : "—";
              },
            },
            { header: "Subject", cell: (r) => (r.subjects as unknown as { name: string } | null)?.name ?? "—" },
            { header: "Status", cell: (r) => statusLabel(String(r.completion_status)) },
            {
              header: "Progress",
              cell: (r) => <ProgressBar value={Number(r.completion_percentage)} showLabel className="w-32" />,
            },
            {
              header: "Accuracy",
              cell: (r) => (r.accuracy_percentage === null ? "—" : pct(Number(r.accuracy_percentage))),
            },
            { header: "Last studied", cell: (r) => formatDateTime(String(r.last_studied_at)) },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recently studied topics</h2>
        <DataTable
          rows={(topicProgress ?? []) as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No topics studied yet"
          columns={[
            { header: "Topic", cell: (r) => (r.topics as unknown as { name: string } | null)?.name ?? "—" },
            { header: "Subject", cell: (r) => (r.subjects as unknown as { name: string } | null)?.name ?? "—" },
            { header: "Status", cell: (r) => statusLabel(String(r.completion_status)) },
            {
              header: "Accuracy",
              cell: (r) => (r.accuracy_percentage === null ? "—" : pct(Number(r.accuracy_percentage))),
            },
            { header: "When", cell: (r) => formatDateTime(String(r.last_studied_at)) },
          ]}
        />
      </div>
    </div>
  );
}
