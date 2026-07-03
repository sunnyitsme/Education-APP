import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, pct, scoreColor } from "@/lib/utils";
import { Clock, FileText, ScrollText } from "lucide-react";
import type { PreviousYearPaper } from "@/lib/types";

export default async function PreviousYearPapersPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: papers }, { data: attempts }] = await Promise.all([
    supabase
      .from("previous_year_papers")
      .select("*, subjects(name)")
      .eq("status", "active")
      .order("paper_year", { ascending: false }),
    supabase
      .from("previous_year_attempts")
      .select("*, previous_year_papers(paper_year, set_number, subjects(name))")
      .eq("student_id", profile.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Previous Year Papers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Solve real board papers year-wise with model answers, marking points and AI feedback for
          written answers. For chapter-wise and topic-wise previous year questions, open any chapter
          from{" "}
          <Link href="/student/subjects" className="font-medium text-indigo-600 hover:underline">
            Subjects
          </Link>
          .
        </p>
      </div>

      {(papers ?? []).length === 0 ? (
        <EmptyState
          title="No previous year papers yet"
          hint="Ask the admin to add papers under Admin → Previous Year Papers, or run the seed script."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(papers ?? []).map((raw) => {
            const p = raw as PreviousYearPaper & { subjects: { name: string } | null };
            return (
              <Card key={p.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-2.5">
                      <ScrollText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {p.subjects?.name} — {p.paper_year}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Set {p.set_number} · {p.paper_type.replace("_", " ")} paper
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {p.total_marks} marks
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.duration_minutes} min
                  </span>
                </div>
                <ButtonLink href={`/student/previous-year-papers/${p.id}`} className="self-start">
                  Open paper
                </ButtonLink>
              </Card>
            );
          })}
        </div>
      )}

      {(attempts ?? []).length > 0 && (
        <Card>
          <CardTitle>Your paper attempts</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {(attempts ?? []).map((a) => {
              const paper = (a as unknown as {
                previous_year_papers: {
                  paper_year: number;
                  set_number: string;
                  subjects: { name: string } | null;
                } | null;
              }).previous_year_papers;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {paper?.subjects?.name} {paper?.paper_year} (Set {paper?.set_number})
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(a.submitted_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${scoreColor(Number(a.percentage))}`}>
                      {pct(Number(a.percentage))}
                    </span>
                    <ButtonLink
                      size="sm"
                      variant="outline"
                      href={`/student/previous-year-papers/${a.paper_id}?attempt=${a.id}`}
                    >
                      Review
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
