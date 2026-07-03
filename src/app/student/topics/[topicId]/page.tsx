import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  ListChecks,
  Sigma,
  Target,
  AlertOctagon,
  BookOpen,
  FileQuestion,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PracticeQuestions } from "@/components/PracticeQuestions";
import { TopicStudyActions } from "@/components/TopicStudyActions";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { toList } from "@/lib/utils";
import type { Chapter, Question, StudyContent, Subject, Topic } from "@/lib/types";

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: topicRow } = await supabase
    .from("topics")
    .select("*, chapters(*, subjects(*))")
    .eq("id", topicId)
    .maybeSingle();
  if (!topicRow) notFound();
  const topic = topicRow as Topic & { chapters: Chapter & { subjects: Subject } };
  const chapter = topic.chapters;
  const subject = chapter?.subjects;

  const [{ data: contentRow }, { data: practiceRows }, { data: progressRow }] = await Promise.all([
    supabase.from("study_contents").select("*").eq("topic_id", topicId).maybeSingle(),
    supabase.from("questions").select("*").eq("topic_id", topicId).eq("status", "active").limit(6),
    supabase
      .from("student_progress")
      .select("completion_status")
      .eq("student_id", profile.id)
      .eq("topic_id", topicId)
      .maybeSingle(),
  ]);

  const content = contentRow as StudyContent | null;

  const sections: {
    key: keyof StudyContent;
    title: string;
    icon: typeof Lightbulb;
    tone: string;
    list?: boolean;
  }[] = [
    { key: "simple_explanation", title: "Simple explanation", icon: Lightbulb, tone: "text-amber-500" },
    { key: "detailed_explanation", title: "Detailed explanation", icon: BookOpen, tone: "text-indigo-600" },
    { key: "key_points", title: "Key points", icon: ListChecks, tone: "text-emerald-600", list: true },
    { key: "examples", title: "Examples", icon: FileQuestion, tone: "text-sky-600", list: true },
    { key: "formulae", title: "Formulae", icon: Sigma, tone: "text-violet-600", list: true },
    { key: "exam_tips", title: "Exam tips", icon: Target, tone: "text-emerald-600" },
    { key: "common_mistakes", title: "Common mistakes", icon: AlertOctagon, tone: "text-rose-600", list: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          <Link href={`/student/subjects/${subject?.id}`} className="hover:underline">
            {subject?.name}
          </Link>{" "}
          /{" "}
          <Link href={`/student/chapters/${chapter?.id}`} className="hover:underline">
            {chapter?.name}
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{topic.name}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <TopicStudyActions
            topicId={topicId}
            currentStatus={progressRow?.completion_status ?? "not_started"}
          />
          <ButtonLink
            variant="secondary"
            href={`/student/ai-tutor?topic=${topicId}&chapter=${chapter?.id}&subject=${subject?.id}`}
          >
            <Sparkles className="h-4 w-4" /> Ask AI about this topic
          </ButtonLink>
        </div>
      </div>

      {!content ? (
        <Card>
          <p className="text-sm text-slate-500">
            Study content for this topic hasn&apos;t been added yet. Ask the admin to add it under
            Admin → Study Content, or use the AI tutor to learn this topic.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => {
            const value = content[s.key] as string;
            if (!value?.trim()) return null;
            const items = s.list ? toList(value) : [];
            return (
              <Card key={s.key}>
                <CardTitle className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.tone}`} /> {s.title}
                </CardTitle>
                {s.list && items.length > 1 ? (
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-slate-600">
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {value}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Practice questions</h2>
        <PracticeQuestions questions={(practiceRows ?? []) as Question[]} />
      </div>
    </div>
  );
}
