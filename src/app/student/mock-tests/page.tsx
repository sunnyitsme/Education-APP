import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StartDynamicTestButton } from "@/components/StartDynamicTestButton";
import { TEST_TYPE_LABELS, type MockTest, type TestType } from "@/lib/types";
import { formatDateTime, pct, scoreColor } from "@/lib/utils";
import { Clock, FileQuestion, Shuffle, Pin } from "lucide-react";

export default async function MockTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; subject?: string }>;
}) {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const sp = await searchParams;

  let query = supabase
    .from("mock_tests")
    .select("*, subjects(name), chapters(name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (sp.chapter) query = query.eq("chapter_id", sp.chapter);
  if (sp.subject) query = query.eq("subject_id", sp.subject);

  const [{ data: tests }, { data: attempts }] = await Promise.all([
    query,
    supabase
      .from("test_attempts")
      .select("*, mock_tests(name)")
      .eq("student_id", profile.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Timed tests with instant results, correct answers and explanations.
        </p>
      </div>

      {/* Quick tests */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Quick 10-question test</CardTitle>
          <p className="mb-3 mt-1 text-sm text-slate-500">
            Random questions from {sp.subject ? "this subject" : "the whole question bank"} — a fast
            daily workout.
          </p>
          <StartDynamicTestButton kind="quick10" subjectId={sp.subject} label="Start quick test" />
        </Card>
        <Card>
          <CardTitle>Weak-topic test</CardTitle>
          <p className="mb-3 mt-1 text-sm text-slate-500">
            Questions only from topics where your accuracy is low. Great before revision.
          </p>
          <StartDynamicTestButton kind="weak_topic" label="Start weak-topic test" />
        </Card>
      </div>

      {/* Available tests */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Available tests{sp.chapter ? " for this chapter" : sp.subject ? " for this subject" : ""}
        </h2>
        {(tests ?? []).length === 0 ? (
          <EmptyState
            title="No mock tests available yet"
            hint="Ask the admin to create fixed or random mock tests in the admin panel — or use the quick tests above."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(tests ?? []).map((raw) => {
              const t = raw as MockTest & {
                subjects: { name: string } | null;
                chapters: { name: string } | null;
              };
              return (
                <Card key={t.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{t.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[t.subjects?.name, t.chapters?.name].filter(Boolean).join(" · ") ||
                          "All subjects"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {t.generation_type === "fixed" ? (
                        <>
                          <Pin className="h-3 w-3" /> Fixed
                        </>
                      ) : (
                        <>
                          <Shuffle className="h-3 w-3" /> Random
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5" />
                      {TEST_TYPE_LABELS[t.test_type as TestType] ?? t.test_type}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {t.duration_minutes} min
                    </span>
                    <span>{t.total_marks} marks</span>
                  </div>
                  <ButtonLink href={`/student/mock-tests/${t.id}`} className="self-start">
                    Start test
                  </ButtonLink>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent attempts */}
      {(attempts ?? []).length > 0 && (
        <Card>
          <CardTitle>Recent attempts</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {(attempts ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {(a as unknown as { mock_tests: { name: string } | null }).mock_tests?.name ?? "Test"}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(a.submitted_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${scoreColor(Number(a.percentage))}`}>
                    {pct(Number(a.percentage))}
                  </span>
                  <ButtonLink size="sm" variant="outline" href={`/student/results/${a.id}`}>
                    Review
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
