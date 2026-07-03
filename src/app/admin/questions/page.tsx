import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveQuestion, deleteQuestion } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { QUESTION_TYPE_LABELS, type Question, type QuestionType } from "@/lib/types";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string; type?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }, { data: topics }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("chapters").select("id, name, chapter_number, subject_id").order("chapter_number"),
    supabase.from("topics").select("id, name, chapter_id").order("topic_order"),
  ]);

  let query = supabase
    .from("questions")
    .select("*, subjects(name), chapters(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (sp.subject) query = query.eq("subject_id", sp.subject);
  if (sp.type) query = query.eq("question_type", sp.type);
  const { data: questions } = await query;

  const editing = sp.edit
    ? (((questions ?? []).find((q) => q.id === sp.edit) ??
        (await supabase.from("questions").select("*").eq("id", sp.edit).maybeSingle()).data) as
        | Question
        | undefined)
    : undefined;

  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.id, label: s.name }));
  const chapterOptions = (chapters ?? []).map((c) => ({
    value: c.id,
    label: `Ch ${c.chapter_number}: ${c.name}`,
  }));
  const topicOptions = (topics ?? []).map((t) => ({ value: t.id, label: t.name }));
  const typeOptions = Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-500">
            All question types for practice, mock tests and random test generation. Bulk-add via{" "}
            <a href="/admin/import" className="font-medium text-indigo-600 hover:underline">CSV import</a>.
          </p>
        </div>
        <form method="get" className="flex flex-wrap items-end gap-2">
          <div className="w-44">
            <SelectInput name="subject" placeholder="All subjects" defaultValue={sp.subject ?? ""} options={subjectOptions} />
          </div>
          <div className="w-44">
            <SelectInput name="type" placeholder="All types" defaultValue={sp.type ?? ""} options={typeOptions} />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>
      </div>

      <Card>
        <CardTitle>{editing ? "Edit question" : "Add a question"}</CardTitle>
        <form action={saveQuestion} className="mt-4 grid gap-4 sm:grid-cols-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Subject"
            name="subject_id"
            required
            placeholder="Select subject"
            defaultValue={editing?.subject_id ?? sp.subject ?? ""}
            options={subjectOptions}
          />
          <SelectInput
            label="Chapter (optional)"
            name="chapter_id"
            placeholder="No chapter"
            defaultValue={editing?.chapter_id ?? ""}
            options={chapterOptions}
          />
          <SelectInput
            label="Topic (optional)"
            name="topic_id"
            placeholder="No topic"
            defaultValue={editing?.topic_id ?? ""}
            options={topicOptions}
          />
          <SelectInput
            label="Question type"
            name="question_type"
            defaultValue={editing?.question_type ?? "mcq"}
            options={typeOptions}
          />
          <FormInput label="Marks" name="marks" type="number" min={1} defaultValue={editing?.marks ?? 1} />
          <SelectInput
            label="Difficulty"
            name="difficulty"
            defaultValue={editing?.difficulty ?? "medium"}
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
          <div className="sm:col-span-3">
            <TextareaInput
              label="Question text"
              name="question_text"
              required
              rows={3}
              defaultValue={editing?.question_text ?? ""}
            />
          </div>
          <FormInput label="Option A (MCQ only)" name="option_a" defaultValue={editing?.options_json?.A ?? ""} />
          <FormInput label="Option B" name="option_b" defaultValue={editing?.options_json?.B ?? ""} />
          <FormInput label="Option C" name="option_c" defaultValue={editing?.options_json?.C ?? ""} />
          <FormInput label="Option D" name="option_d" defaultValue={editing?.options_json?.D ?? ""} />
          <div className="sm:col-span-2">
            <TextareaInput
              label="Correct answer (option letter for MCQ / True or False / model answer for written)"
              name="correct_answer"
              rows={2}
              defaultValue={editing?.correct_answer ?? ""}
            />
          </div>
          <div className="sm:col-span-3">
            <TextareaInput
              label="Explanation (shown after the test)"
              name="explanation"
              rows={2}
              defaultValue={editing?.explanation ?? ""}
            />
          </div>
          <SelectInput
            label="Status"
            name="status"
            defaultValue={editing?.status ?? "active"}
            options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit">{editing ? "Save changes" : "Add question"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/questions">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(questions ?? []) as (Question & { subjects: { name: string } | null; chapters: { name: string } | null })[]}
        keyFor={(q) => q.id}
        emptyTitle="No questions yet"
        emptyHint="Add questions above or import a CSV."
        columns={[
          {
            header: "Question",
            cell: (q) => <span className="line-clamp-2 max-w-md">{q.question_text}</span>,
          },
          { header: "Type", cell: (q) => QUESTION_TYPE_LABELS[q.question_type as QuestionType] },
          { header: "Subject", cell: (q) => q.subjects?.name ?? "—" },
          { header: "Chapter", cell: (q) => q.chapters?.name ?? "—" },
          { header: "Marks", cell: (q) => String(q.marks) },
          { header: "Difficulty", cell: (q) => q.difficulty },
          { header: "Status", cell: (q) => q.status },
          {
            header: "Actions",
            cell: (q) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/questions?edit=${q.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmSubmitButton />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
