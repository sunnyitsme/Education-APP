import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { NoChildLinked } from "@/components/NoChildLinked";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime, formatDuration, pct, scoreColor } from "@/lib/utils";

export default async function ParentMockResultsPage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("*, mock_tests(name, test_type)")
    .eq("student_id", child.id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock test results</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every mock test {child.full_name || "your child"} has taken (read-only).
        </p>
      </div>

      <DataTable
        rows={(attempts ?? []) as Record<string, unknown>[]}
        keyFor={(r) => String(r.id)}
        emptyTitle="No mock tests taken yet"
        emptyHint="Results will appear here once your child takes a test."
        columns={[
          {
            header: "Test",
            cell: (r) => (r.mock_tests as unknown as { name: string } | null)?.name ?? "Test",
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
          { header: "Correct", cell: (r) => String(r.correct_count) },
          { header: "Wrong", cell: (r) => String(r.wrong_count) },
          { header: "Skipped", cell: (r) => String(r.skipped_count) },
          { header: "Time", cell: (r) => formatDuration(Number(r.time_taken_seconds)) },
          { header: "Date", cell: (r) => formatDateTime(String(r.submitted_at)) },
        ]}
      />
    </div>
  );
}
