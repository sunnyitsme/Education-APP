import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isAiConfigured } from "@/lib/ai/gemini";
import { VivaPractice } from "@/components/VivaPractice";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { Subject } from "@/lib/types";

export default async function VivaPracticePage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: subjectRow } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subjectRow) notFound();
  const subject = subjectRow as Subject;

  const [{ data: questions }, { data: recent }] = await Promise.all([
    supabase
      .from("viva_questions")
      .select("id, question, difficulty")
      .eq("subject_id", subjectId)
      .eq("status", "active"),
    supabase
      .from("viva_attempts")
      .select("id, score, max_score, created_at, viva_questions(question)")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // The client component moves through these in random order.
  const vivaList = questions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href={`/student/subjects/${subjectId}`} className="hover:underline">
            {subject.name}
          </Link>{" "}
          / Viva Practice
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Viva Practice</h1>
        <p className="mt-1 text-sm text-slate-500">
          Viva voce carries 10 marks in Part C. Answer one question at a time — the AI scores your
          answer, shows the model answer and lists what you missed.
        </p>
        {!isAiConfigured() && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
            AI scoring is not configured — you can still practise and compare with model answers.
          </p>
        )}
      </div>

      {vivaList.length === 0 ? (
        <EmptyState
          title="No viva questions yet"
          hint="Ask the admin to add viva questions under Admin → Viva Questions."
        />
      ) : (
        <VivaPractice questions={vivaList} />
      )}

      {(recent ?? []).length > 0 && (
        <Card>
          <CardTitle>Recent viva attempts</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {(recent ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <p className="text-slate-700">
                  {(a as unknown as { viva_questions: { question: string } | null }).viva_questions?.question}
                </p>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-indigo-700">
                    {a.score === null ? "—" : `${Number(a.score)}/${Number(a.max_score)}`}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(a.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
