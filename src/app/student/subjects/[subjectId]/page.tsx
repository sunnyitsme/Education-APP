import { notFound } from "next/navigation";
import Link from "next/link";
import { FlaskConical, Mic, FolderKanban, ClipboardCheck, BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChaptersWithProgress } from "@/lib/data";
import { ChapterCard } from "@/components/ChapterCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Subject } from "@/lib/types";

function isComputerSubject(subject: Subject): boolean {
  const n = subject.name.toLowerCase();
  return n.includes("computer") || n.includes(" it") || n.startsWith("it ") || n.includes("information technology");
}

export default async function SubjectDetailPage({
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

  const chapters = await getChaptersWithProgress(subjectId, profile.id);
  const isIT = isComputerSubject(subject);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href="/student/subjects" className="hover:underline">Subjects</Link> / {subject.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{subject.name}</h1>
        {subject.description && <p className="mt-1 text-sm text-slate-500">{subject.description}</p>}
      </div>

      {isIT && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { href: `/student/subjects/${subjectId}`, label: "Learn", icon: BookOpen, desc: "Units & chapters" },
            { href: `/student/subjects/${subjectId}/practical`, label: "Practical Lab", icon: FlaskConical, desc: "Writer, Calc, Base tasks" },
            { href: `/student/subjects/${subjectId}/project`, label: "Project Work", icon: FolderKanban, desc: "Format & topics" },
            { href: `/student/subjects/${subjectId}/viva`, label: "Viva Practice", icon: Mic, desc: "AI-scored viva" },
            { href: `/student/mock-tests?subject=${subjectId}`, label: "Mock Test", icon: ClipboardCheck, desc: "Test yourself" },
          ].map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-indigo-300"
            >
              <s.icon className="mx-auto h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-sm font-semibold text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>
      )}

      {isIT && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">CBSE IT (Code 402) exam structure</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Part A: Employability Skills — 10 marks (Units 1-5 below)</li>
            <li>Part B: Subject-Specific Skills — 40 marks (Units 6-9 below)</li>
            <li>Part C: Practical Assessment — 50 marks (Practical exam 30 + Written project 10 + Viva voce 10)</li>
          </ul>
        </div>
      )}

      {chapters.length === 0 ? (
        <EmptyState
          title="No chapters in this subject yet"
          hint="Ask the admin to add chapters, or run the seed script from the README."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {chapters.map((c) => (
            <ChapterCard
              key={c.chapter.id}
              chapter={c.chapter}
              progressPercent={c.progressPercent}
              status={c.status}
              lastScore={c.lastScore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
