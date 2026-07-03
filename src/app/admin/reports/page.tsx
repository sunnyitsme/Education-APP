import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateTime, pct, scoreColor } from "@/lib/utils";

export default async function AdminReportsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ data: attempts }, { data: paperAttempts }, { data: aiRecent }, { count: aiWeek }] =
    await Promise.all([
      supabase
        .from("test_attempts")
        .select("*, profiles(full_name, email), mock_tests(name)")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(25),
      supabase
        .from("previous_year_attempts")
        .select("*, profiles(full_name, email), previous_year_papers(paper_year, subjects(name))")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(15),
      supabase
        .from("ai_doubt_history")
        .select("id, question, created_at, profiles(full_name, email), subjects(name)")
        .order("created_at", { ascending: false })
        .limit(15),
      supabase
        .from("ai_doubt_history")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString()),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Activity across all students: test attempts, paper attempts and AI usage ({aiWeek ?? 0}{" "}
          AI doubts this week).
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent mock test attempts</h2>
        <DataTable
          rows={(attempts ?? []) as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No test attempts yet"
          columns={[
            {
              header: "Student",
              cell: (r) => {
                const p = r.profiles as unknown as { full_name: string; email: string } | null;
                return p?.full_name || p?.email || "—";
              },
            },
            { header: "Test", cell: (r) => (r.mock_tests as unknown as { name: string } | null)?.name ?? "—" },
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
          ]}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent paper attempts</h2>
        <DataTable
          rows={(paperAttempts ?? []) as Record<string, unknown>[]}
          keyFor={(r) => String(r.id)}
          emptyTitle="No paper attempts yet"
          columns={[
            {
              header: "Student",
              cell: (r) => {
                const p = r.profiles as unknown as { full_name: string; email: string } | null;
                return p?.full_name || p?.email || "—";
              },
            },
            {
              header: "Paper",
              cell: (r) => {
                const p = r.previous_year_papers as unknown as {
                  paper_year: number;
                  subjects: { name: string } | null;
                } | null;
                return `${p?.subjects?.name ?? "—"} ${p?.paper_year ?? ""}`;
              },
            },
            {
              header: "Percentage",
              cell: (r) => (
                <span className={`font-semibold ${scoreColor(Number(r.percentage))}`}>
                  {pct(Number(r.percentage))}
                </span>
              ),
            },
            { header: "Date", cell: (r) => formatDateTime(String(r.submitted_at)) },
          ]}
        />
      </div>

      <Card>
        <CardTitle>Recent AI doubts</CardTitle>
        {(aiRecent ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No AI doubts asked yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {(aiRecent ?? []).map((h) => {
              const p = (h as unknown as { profiles: { full_name: string; email: string } | null })
                .profiles;
              const s = (h as unknown as { subjects: { name: string } | null }).subjects;
              return (
                <li key={h.id} className="py-2.5 text-sm">
                  <p className="font-medium text-slate-700">{h.question}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {p?.full_name || p?.email} · {s?.name ?? "General"} · {formatDateTime(h.created_at)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
