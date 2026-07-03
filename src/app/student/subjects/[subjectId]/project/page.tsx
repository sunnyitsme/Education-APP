import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderKanban, Lightbulb } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { toList } from "@/lib/utils";
import type { ProjectTemplate, Subject } from "@/lib/types";

export default async function ProjectWorkPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  await requireRole("student");
  const supabase = await createClient();

  const { data: subjectRow } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subjectRow) notFound();
  const subject = subjectRow as Subject;

  const { data: templates } = await supabase
    .from("project_templates")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("status", "active");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href={`/student/subjects/${subjectId}`} className="hover:underline">
            {subject.name}
          </Link>{" "}
          / Project Work
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project Work</h1>
        <p className="mt-1 text-sm text-slate-500">
          The written project carries 10 marks in Part C. Pick a topic, follow the format below and
          prepare your file in LibreOffice Writer using styles.
        </p>
      </div>

      {(templates ?? []).length === 0 ? (
        <EmptyState
          title="No project templates yet"
          hint="Ask the admin to add a project template under Admin → Project Templates."
        />
      ) : (
        ((templates ?? []) as ProjectTemplate[]).map((t) => (
          <div key={t.id} className="space-y-4">
            <Card>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-600" /> {t.title}
              </CardTitle>
              <p className="mt-2 text-sm text-slate-600">{t.description}</p>
            </Card>

            <Card>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Suggested project topics
              </CardTitle>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-600">
                {toList(t.suggested_topics).map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardTitle>Project file format</CardTitle>
              <p className="mt-1 text-xs text-slate-400">
                Include every section below, in this order.
              </p>
              <ol className="mt-4 space-y-3">
                {(t.format_sections ?? []).map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{s.guidance}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
