import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  savePaper,
  deletePaper,
  savePaperQuestion,
  deletePaperQuestion,
} from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { QUESTION_TYPE_LABELS, type PreviousYearPaper, type PreviousYearQuestion } from "@/lib/types";

export default async function AdminPapersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; manage?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }, { data: topics }, { data: papers }] =
    await Promise.all([
      supabase.from("subjects").select("id, name").order("name"),
      supabase.from("chapters").select("id, name, chapter_number, subject_id").order("chapter_number"),
      supabase.from("topics").select("id, name, chapter_id").order("topic_order"),
      supabase
        .from("previous_year_papers")
        .select("*, subjects(name)")
        .order("paper_year", { ascending: false }),
    ]);

  const editing = sp.edit
    ? ((papers ?? []).find((p) => p.id === sp.edit) as PreviousYearPaper | undefined)
    : undefined;

  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.id, label: s.name }));
  const chapterOptions = (chapters ?? []).map((c) => ({
    value: c.id,
    label: `Ch ${c.chapter_number}: ${c.name}`,
  }));
  const topicOptions = (topics ?? []).map((t) => ({ value: t.id, label: t.name }));

  // Manage paper questions
  let managing: (PreviousYearPaper & { subjects: { name: string } | null }) | undefined;
  let paperQuestions: PreviousYearQuestion[] = [];
  if (sp.manage) {
    managing = (papers ?? []).find((p) => p.id === sp.manage) as typeof managing;
    if (managing) {
      const { data } = await supabase
        .from("previous_year_questions")
        .select("*")
        .eq("paper_id", managing.id)
        .order("question_number");
      paperQuestions = (data ?? []) as PreviousYearQuestion[];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Previous Year Papers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create board papers with questions, model answers, marking points and chapter/topic
          mapping. Students solve them with a timer and AI checking for written answers.
        </p>
      </div>

      {/* Manage paper questions */}
      {managing && (
        <Card className="border-indigo-200">
          <CardTitle>
            Questions in: {managing.subjects?.name} {managing.paper_year} (Set {managing.set_number})
          </CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {paperQuestions.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="line-clamp-1">
                  Q{q.question_number}. {q.question_text} ({q.marks}m ·{" "}
                  {QUESTION_TYPE_LABELS[q.question_type]})
                </span>
                <form action={deletePaperQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmSubmitButton label="Remove" message="Remove this question from the paper?" />
                </form>
              </li>
            ))}
            {paperQuestions.length === 0 && (
              <li className="py-2 text-sm text-slate-500">No questions yet.</li>
            )}
          </ul>

          <form action={savePaperQuestion} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="paper_id" value={managing.id} />
            <FormInput
              label="Question number"
              name="question_number"
              type="number"
              min={1}
              defaultValue={paperQuestions.length + 1}
            />
            <SelectInput
              label="Type"
              name="question_type"
              defaultValue="mcq"
              options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <FormInput label="Marks" name="marks" type="number" min={1} defaultValue={1} />
            <div className="sm:col-span-3">
              <TextareaInput label="Question text" name="question_text" required rows={2} />
            </div>
            <FormInput label="Option A (MCQ)" name="option_a" />
            <FormInput label="Option B" name="option_b" />
            <FormInput label="Option C" name="option_c" />
            <FormInput label="Option D" name="option_d" />
            <SelectInput label="Chapter mapping" name="chapter_id" placeholder="No chapter" options={chapterOptions} />
            <SelectInput label="Topic mapping" name="topic_id" placeholder="No topic" options={topicOptions} />
            <div className="sm:col-span-3">
              <TextareaInput
                label="Model answer (option letter for MCQ / full answer for written)"
                name="model_answer"
                rows={2}
              />
            </div>
            <div className="sm:col-span-3">
              <TextareaInput
                label="Marking points (one per line, e.g. 'Definition: 1 mark')"
                name="marking_points"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <TextareaInput label="Explanation" name="explanation" rows={2} />
            </div>
            <SelectInput
              label="Difficulty"
              name="difficulty"
              defaultValue="medium"
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">
                Add question to paper
              </Button>
            </div>
          </form>
          <ButtonLink href="/admin/previous-year-papers" variant="ghost" size="sm" className="mt-3">
            Done managing
          </ButtonLink>
        </Card>
      )}

      {/* Create / edit paper */}
      <Card>
        <CardTitle>{editing ? "Edit paper" : "Add a paper"}</CardTitle>
        <form action={savePaper} className="mt-4 grid gap-4 sm:grid-cols-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Subject"
            name="subject_id"
            required
            placeholder="Select subject"
            defaultValue={editing?.subject_id ?? ""}
            options={subjectOptions}
          />
          <FormInput
            label="Year"
            name="paper_year"
            type="number"
            min={2000}
            required
            defaultValue={editing?.paper_year ?? new Date().getFullYear()}
          />
          <FormInput label="Set number" name="set_number" defaultValue={editing?.set_number ?? "1"} />
          <SelectInput
            label="Paper type"
            name="paper_type"
            defaultValue={editing?.paper_type ?? "board"}
            options={[
              { value: "board", label: "Board exam" },
              { value: "sample", label: "Sample paper" },
              { value: "compartment", label: "Compartment" },
              { value: "pre_board", label: "Pre-board" },
            ]}
          />
          <FormInput
            label="Total marks"
            name="total_marks"
            type="number"
            min={1}
            defaultValue={editing?.total_marks ?? 80}
          />
          <FormInput
            label="Duration (minutes)"
            name="duration_minutes"
            type="number"
            min={10}
            defaultValue={editing?.duration_minutes ?? 180}
          />
          <FormInput label="PDF URL (optional)" name="pdf_url" defaultValue={editing?.pdf_url ?? ""} />
          <FormInput
            label="Marking scheme URL (optional)"
            name="marking_scheme_url"
            defaultValue={editing?.marking_scheme_url ?? ""}
          />
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
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit">{editing ? "Save changes" : "Add paper"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/previous-year-papers">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(papers ?? []) as (PreviousYearPaper & { subjects: { name: string } | null })[]}
        keyFor={(p) => p.id}
        emptyTitle="No papers yet"
        columns={[
          { header: "Subject", cell: (p) => <span className="font-medium">{p.subjects?.name ?? "—"}</span> },
          { header: "Year", cell: (p) => String(p.paper_year) },
          { header: "Set", cell: (p) => p.set_number },
          { header: "Type", cell: (p) => p.paper_type },
          { header: "Marks", cell: (p) => String(p.total_marks) },
          { header: "Status", cell: (p) => p.status },
          {
            header: "Actions",
            cell: (p) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="secondary" href={`/admin/previous-year-papers?manage=${p.id}`}>
                  Questions
                </ButtonLink>
                <ButtonLink size="sm" variant="outline" href={`/admin/previous-year-papers?edit=${p.id}`}>
                  Edit
                </ButtonLink>
                <form action={deletePaper}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmSubmitButton message="Delete this paper and its questions/attempts?" />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
