import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, ClipboardCheck, ScrollText, ListChecks, BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTopicsForChapter } from "@/lib/data";
import { TopicCard } from "@/components/TopicCard";
import { PracticeQuestions } from "@/components/PracticeQuestions";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toList } from "@/lib/utils";
import type { Chapter, Question, StudyContent, Subject } from "@/lib/types";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  await requireRole("student");
  const supabase = await createClient();

  const { data: chapterRow } = await supabase
    .from("chapters")
    .select("*, subjects(*)")
    .eq("id", chapterId)
    .maybeSingle();
  if (!chapterRow) notFound();
  const chapter = chapterRow as Chapter & { subjects: Subject };

  const topics = await getTopicsForChapter(chapterId);
  const topicIds = topics.map((t) => t.id);

  const [{ data: contents }, { data: practiceRows }, { data: pyqRows }] = await Promise.all([
    topicIds.length > 0
      ? supabase.from("study_contents").select("*").in("topic_id", topicIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("questions")
      .select("*")
      .eq("chapter_id", chapterId)
      .eq("status", "active")
      .limit(8),
    supabase
      .from("previous_year_questions")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("year", { ascending: false })
      .limit(5),
  ]);

  const keyPoints = ((contents ?? []) as StudyContent[]).flatMap((c) => toList(c.key_points)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href="/student/subjects" className="hover:underline">Subjects</Link> /{" "}
          <Link href={`/student/subjects/${chapter.subject_id}`} className="hover:underline">
            {chapter.subjects?.name}
          </Link>{" "}
          / Chapter {chapter.chapter_number}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{chapter.name}</h1>
        {chapter.description && <p className="mt-1 text-sm text-slate-500">{chapter.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href={`/student/mock-tests?chapter=${chapterId}`}>
            <ClipboardCheck className="h-4 w-4" /> Chapter mock test
          </ButtonLink>
          <ButtonLink href={`/student/ai-tutor?chapter=${chapterId}&subject=${chapter.subject_id}`} variant="secondary">
            <Sparkles className="h-4 w-4" /> Ask AI
          </ButtonLink>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" /> Chapter overview
        </CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {chapter.description ||
            `This chapter has ${topics.length} topic${topics.length === 1 ? "" : "s"}. Study each topic, then practise the questions below and finish with a chapter mock test.`}
          {chapter.marks_weightage
            ? ` In board exams this chapter usually carries around ${chapter.marks_weightage} marks.`
            : ""}
        </p>
      </Card>

      {/* Topics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Topics</h2>
        {topics.length === 0 ? (
          <EmptyState
            title="No topics added yet"
            hint="Ask the admin to add topics for this chapter."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
          </div>
        )}
      </div>

      {/* Important points */}
      {keyPoints.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" /> Important points
          </CardTitle>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-600">
            {keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* NCERT exercises placeholder */}
      <Card>
        <CardTitle>NCERT exercise solutions</CardTitle>
        <p className="mt-2 text-sm text-slate-500">
          Solve the NCERT textbook exercises for this chapter in your notebook. Step-by-step NCERT
          solutions will appear here in a future update — for now, ask the AI tutor about any
          exercise question you get stuck on.
        </p>
      </Card>

      {/* Previous year questions */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-amber-600" /> Previous year questions from this chapter
        </CardTitle>
        {(pyqRows ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No previous year questions are mapped to this chapter yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(pyqRows ?? []).map((q) => (
              <li key={q.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="whitespace-pre-wrap font-medium text-slate-700">{q.question_text}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Board {q.year} · {q.marks} marks
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Practice questions */}
      <div id="practice">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Practice questions</h2>
        <PracticeQuestions questions={(practiceRows ?? []) as Question[]} />
      </div>
    </div>
  );
}
