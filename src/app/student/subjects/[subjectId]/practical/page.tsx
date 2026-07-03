import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PracticalTaskCard } from "@/components/PracticalTaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PracticalTask, Subject } from "@/lib/types";

export default async function PracticalLabPage({
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

  const [{ data: tasks }, { data: attempts }] = await Promise.all([
    supabase
      .from("practical_tasks")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("status", "active")
      .order("created_at"),
    supabase
      .from("practical_attempts")
      .select("task_id, status")
      .eq("student_id", profile.id),
  ]);

  const statusByTask = new Map((attempts ?? []).map((a) => [a.task_id, a.status as string]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href={`/student/subjects/${subjectId}`} className="hover:underline">
            {subject.name}
          </Link>{" "}
          / Practical Lab
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Practical Lab</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hands-on tasks for LibreOffice Writer, Calc and Base — Part C practical examination
          carries 30 marks. Do each task on your computer, then mark it completed.
        </p>
      </div>

      {(tasks ?? []).length === 0 ? (
        <EmptyState
          title="No practical tasks yet"
          hint="Ask the admin to add practical tasks under Admin → Practical Tasks."
        />
      ) : (
        <div className="space-y-4">
          {((tasks ?? []) as PracticalTask[]).map((t) => (
            <PracticalTaskCard key={t.id} task={t} initialStatus={statusByTask.get(t.id) ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
