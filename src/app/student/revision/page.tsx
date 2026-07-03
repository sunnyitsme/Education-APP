import {
  Layers,
  Sigma,
  BookMarked,
  FileText,
  XCircle,
  AlertTriangle,
  Star,
  Zap,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getWeakTopics } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Flashcards, type Flashcard } from "@/components/Flashcards";
import { toList } from "@/lib/utils";
import type { Question, StudyContent } from "@/lib/types";

export default async function RevisionPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: contents }, weakTopics, { data: mistakes }, { data: importantQs }] =
    await Promise.all([
      supabase
        .from("study_contents")
        .select("*, topics(name, chapter_id, chapters:chapter_id(name))")
        .limit(60),
      getWeakTopics(profile.id, 8),
      supabase
        .from("student_answers")
        .select("id, student_answer, correct_answer, feedback, questions(question_text, explanation), test_attempts!inner(student_id)")
        .eq("test_attempts.student_id", profile.id)
        .eq("is_correct", false)
        .order("id", { ascending: false })
        .limit(6),
      supabase
        .from("questions")
        .select("*")
        .eq("status", "active")
        .in("difficulty", ["medium", "hard"])
        .gte("marks", 2)
        .limit(6),
    ]);

  type ContentRow = StudyContent & {
    topics: { name: string; chapters: { name: string } | null } | null;
  };
  const contentRows = (contents ?? []) as ContentRow[];

  // Flashcards from key points (front = topic, back = key points).
  const cards: Flashcard[] = contentRows
    .filter((c) => c.key_points?.trim())
    .map((c) => ({
      front: `Recall the key points of: ${c.topics?.name ?? "Topic"}`,
      back: toList(c.key_points).map((p) => `• ${p}`).join("\n"),
      tag: c.topics?.chapters?.name ?? "Chapter",
    }));

  const formulaSheets = contentRows.filter((c) => c.formulae?.trim());
  const definitions = contentRows.filter((c) => c.simple_explanation?.trim()).slice(0, 6);
  const summaries = contentRows.filter((c) => c.detailed_explanation?.trim()).slice(0, 4);
  const lastMinute = contentRows.filter((c) => c.exam_tips?.trim()).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revision Corner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Flashcards, formula sheets, your past mistakes and last-minute notes — everything for a
          quick revision session.
        </p>
      </div>

      {/* Weak topic revision first: the most valuable */}
      {weakTopics.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak topics — revise these first
          </CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakTopics.map((w) => {
              const topic = (w as unknown as { topics: { name: string } | null }).topics;
              const topicId = (w as unknown as { topic_id: string | null }).topic_id;
              if (!topicId) return null;
              return (
                <ButtonLink key={topicId} size="sm" variant="outline" href={`/student/topics/${topicId}`}>
                  {topic?.name ?? "Topic"}
                </ButtonLink>
              );
            })}
          </div>
        </Card>
      )}

      {/* Flashcards */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" /> Flashcards
        </CardTitle>
        <div className="mt-3">
          <Flashcards cards={cards} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Formula sheet */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Sigma className="h-4 w-4 text-violet-600" /> Formula sheets
          </CardTitle>
          {formulaSheets.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No formulae added yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {formulaSheets.map((c) => (
                <div key={c.id} className="rounded-xl bg-violet-50/60 p-3">
                  <p className="text-xs font-semibold text-violet-700">{c.topics?.name}</p>
                  <ul className="mt-1 space-y-0.5 font-mono text-sm text-slate-700">
                    {toList(c.formulae).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Important definitions */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-emerald-600" /> Important definitions
          </CardTitle>
          {definitions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No definitions added yet.</p>
          ) : (
            <dl className="mt-3 space-y-3">
              {definitions.map((c) => (
                <div key={c.id} className="rounded-xl bg-emerald-50/50 p-3">
                  <dt className="text-xs font-semibold text-emerald-700">{c.topics?.name}</dt>
                  <dd className="mt-1 text-sm text-slate-700">{c.simple_explanation}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      {/* One-page summaries */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-600" /> One-page chapter summaries
        </CardTitle>
        {summaries.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No summaries yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {summaries.map((c) => (
              <details key={c.id} className="rounded-xl border border-slate-200 p-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-800">
                  {c.topics?.chapters?.name} — {c.topics?.name}
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {c.detailed_explanation}
                </p>
              </details>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Previous mistakes */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-rose-500" /> Your previous mistakes
          </CardTitle>
          {(mistakes ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No mistakes recorded — take a mock test and wrong answers will collect here for
              revision.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {(mistakes ?? []).map((m) => {
                const q = (m as unknown as { questions: { question_text: string; explanation: string } | null })
                  .questions;
                return (
                  <li key={m.id} className="rounded-xl bg-rose-50/50 p-3 text-sm">
                    <p className="font-medium text-slate-800">{q?.question_text}</p>
                    <p className="mt-1 text-xs text-rose-600">Your answer: {m.student_answer || "—"}</p>
                    <p className="text-xs text-emerald-700">Correct: {m.correct_answer}</p>
                    {q?.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Important questions */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" /> Important questions
          </CardTitle>
          {(importantQs ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No important questions yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {((importantQs ?? []) as Question[]).map((q) => (
                <li key={q.id} className="rounded-xl bg-amber-50/50 p-3 text-sm">
                  <p className="font-medium text-slate-800">{q.question_text}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {q.marks} marks · {q.difficulty}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Last-minute notes */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" /> Last-minute notes (exam tips)
        </CardTitle>
        {lastMinute.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No exam tips added yet.</p>
        ) : (
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-600">
            {lastMinute.map((c) => (
              <li key={c.id}>
                <span className="font-medium text-slate-700">{c.topics?.name}: </span>
                {c.exam_tips}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
