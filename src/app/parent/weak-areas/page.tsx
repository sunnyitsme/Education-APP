import { AlertTriangle, BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFirstChild } from "@/lib/parentData";
import { getWeakTopics } from "@/lib/data";
import { NoChildLinked } from "@/components/NoChildLinked";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { pct } from "@/lib/utils";

export default async function ParentWeakAreasPage() {
  const profile = await requireRole("parent");
  const child = await getFirstChild(profile.id);
  if (!child) return <NoChildLinked />;

  const supabase = await createClient();
  const [weakTopics, { data: weakChapters }] = await Promise.all([
    getWeakTopics(child.id, 20),
    supabase
      .from("student_progress")
      .select("*, chapters:chapter_id(name, chapter_number), subjects(name)")
      .eq("student_id", child.id)
      .is("topic_id", null)
      .eq("completion_status", "needs_revision"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weak areas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Topics and chapters where {child.full_name || "your child"} needs revision — flagged
          automatically from test accuracy below 60%.
        </p>
      </div>

      {weakTopics.length === 0 && (weakChapters ?? []).length === 0 ? (
        <EmptyState
          title="No weak areas flagged"
          hint="Weak topics appear automatically after mock tests where accuracy falls below 60%."
        />
      ) : (
        <>
          {(weakChapters ?? []).length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-rose-500" /> Chapters needing revision
              </CardTitle>
              <ul className="mt-3 space-y-2">
                {(weakChapters ?? []).map((c) => {
                  const ch = (c as unknown as { chapters: { name: string; chapter_number: number } | null }).chapters;
                  const subject = (c as unknown as { subjects: { name: string } | null }).subjects;
                  return (
                    <li key={c.id} className="rounded-xl bg-rose-50/60 px-4 py-2.5 text-sm">
                      <span className="font-medium text-slate-700">
                        {ch ? `Ch ${ch.chapter_number}: ${ch.name}` : "Chapter"}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">{subject?.name}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {weakTopics.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics
              </CardTitle>
              <ul className="mt-3 divide-y divide-slate-100">
                {weakTopics.map((w) => {
                  const topic = (w as unknown as { topics: { name: string } | null }).topics;
                  const accuracy = (w as unknown as { accuracy_percentage: number | null }).accuracy_percentage;
                  return (
                    <li key={(w as unknown as { id: string }).id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-medium text-slate-700">{topic?.name ?? "Topic"}</span>
                      <span className="text-xs text-slate-400">
                        {accuracy === null ? "Needs revision" : `Accuracy ${pct(Number(accuracy))}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 rounded-xl bg-indigo-50/60 px-3 py-2 text-xs text-slate-500">
                Recommended: the student can open Revision → Weak topics to practise these, or take
                a weak-topic test from the Mock Tests page.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
