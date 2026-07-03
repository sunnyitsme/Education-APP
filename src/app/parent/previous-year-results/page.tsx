import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { NoChildLinked } from "@/components/NoChildLinked";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime, formatDuration, pct, scoreColor } from "@/lib/utils";

export default async function ParentPaperResultsPage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from("previous_year_attempts")
    .select("*, previous_year_papers(paper_year, set_number, subjects(name))")
    .eq("student_id", child.id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Previous year paper results</h1>
        <p className="mt-1 text-sm text-slate-500">
          Board paper practice attempts by {child.full_name || "your child"} (read-only).
        </p>
      </div>

      <DataTable
        rows={(attempts ?? []) as Record<string, unknown>[]}
        keyFor={(r) => String(r.id)}
        emptyTitle="No papers attempted yet"
        columns={[
          {
            header: "Paper",
            cell: (r) => {
              const p = r.previous_year_papers as unknown as {
                paper_year: number;
                set_number: string;
                subjects: { name: string } | null;
              } | null;
              return `${p?.subjects?.name ?? "Paper"} ${p?.paper_year ?? ""} (Set ${p?.set_number ?? "-"})`;
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
          {
            header: "Weak chapters",
            cell: (r) => {
              const weak = (r.weak_chapters_json ?? []) as unknown as { chapter_name: string }[];
              return weak.length === 0 ? "—" : weak.map((w) => w.chapter_name).join(", ");
            },
          },
          { header: "Time", cell: (r) => formatDuration(Number(r.time_taken_seconds)) },
          { header: "Date", cell: (r) => formatDateTime(String(r.submitted_at)) },
        ]}
      />
    </div>
  );
}
