import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveStudyContent } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { StudyContent } from "@/lib/types";

export default async function AdminStudyContentPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, chapters(name, subjects(name))")
    .order("name");

  const topicOptions = (topics ?? []).map((t) => {
    const ch = (t as unknown as { chapters: { name: string; subjects: { name: string } | null } | null }).chapters;
    return {
      value: t.id,
      label: `${ch?.subjects?.name ?? "?"} / ${ch?.name ?? "?"} / ${t.name}`,
    };
  });

  let content: StudyContent | null = null;
  if (sp.topic) {
    const { data } = await supabase
      .from("study_contents")
      .select("*")
      .eq("topic_id", sp.topic)
      .maybeSingle();
    content = data as StudyContent | null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Study Content</h1>
        <p className="mt-1 text-sm text-slate-500">
          Each topic gets one content sheet: explanations, key points, examples, formulae, tips and
          common mistakes. Use one line per item in list fields.
        </p>
      </div>

      <Card>
        <CardTitle>Select topic</CardTitle>
        <form method="get" className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xl">
            <SelectInput
              name="topic"
              placeholder="Choose a topic to edit its content"
              defaultValue={sp.topic ?? ""}
              options={topicOptions}
            />
          </div>
          <Button type="submit" variant="secondary">
            Load content
          </Button>
        </form>
      </Card>

      {!sp.topic ? (
        <EmptyState
          title="Pick a topic above"
          hint="Then fill in its study content. Topics are managed under Admin → Topics."
        />
      ) : (
        <Card>
          <CardTitle>
            {topicOptions.find((t) => t.value === sp.topic)?.label ?? "Topic content"}
          </CardTitle>
          <form action={saveStudyContent} className="mt-4 space-y-4">
            <input type="hidden" name="topic_id" value={sp.topic} />
            <TextareaInput
              label="Simple explanation (2-3 sentences a student reads first)"
              name="simple_explanation"
              rows={3}
              defaultValue={content?.simple_explanation ?? ""}
            />
            <TextareaInput
              label="Detailed explanation"
              name="detailed_explanation"
              rows={6}
              defaultValue={content?.detailed_explanation ?? ""}
            />
            <TextareaInput
              label="Key points (one per line)"
              name="key_points"
              rows={5}
              defaultValue={content?.key_points ?? ""}
            />
            <TextareaInput
              label="Examples (one per line)"
              name="examples"
              rows={4}
              defaultValue={content?.examples ?? ""}
            />
            <TextareaInput
              label="Formulae (one per line, leave empty if not applicable)"
              name="formulae"
              rows={3}
              defaultValue={content?.formulae ?? ""}
            />
            <TextareaInput
              label="Exam tips"
              name="exam_tips"
              rows={3}
              defaultValue={content?.exam_tips ?? ""}
            />
            <TextareaInput
              label="Common mistakes (one per line)"
              name="common_mistakes"
              rows={3}
              defaultValue={content?.common_mistakes ?? ""}
            />
            <Button type="submit">Save content</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
