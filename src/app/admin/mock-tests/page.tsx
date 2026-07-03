import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  saveMockTest,
  deleteMockTest,
  addTestQuestion,
  removeTestQuestion,
} from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { TEST_TYPE_LABELS, type MockTest, type MockTestRule, type TestType } from "@/lib/types";

export default async function AdminMockTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; manage?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }, { data: tests }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("chapters").select("id, name, chapter_number").order("chapter_number"),
    supabase
      .from("mock_tests")
      .select("*, subjects(name), chapters(name), mock_test_rules(*)")
      .order("created_at", { ascending: false }),
  ]);

  const editing = sp.edit
    ? ((tests ?? []).find((t) => t.id === sp.edit) as
        | (MockTest & { mock_test_rules: MockTestRule[] })
        | undefined)
    : undefined;
  const editingRule = editing?.mock_test_rules?.[0];

  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.id, label: s.name }));
  const chapterOptions = (chapters ?? []).map((c) => ({
    value: c.id,
    label: `Ch ${c.chapter_number}: ${c.name}`,
  }));

  // Manage fixed test questions
  let managing: (MockTest & { subjects: { name: string } | null }) | undefined;
  let testQuestions: {
    id: string;
    question_order: number;
    marks: number;
    questions: { question_text: string } | null;
  }[] = [];
  let bankQuestions: { id: string; question_text: string; marks: number }[] = [];
  if (sp.manage) {
    managing = (tests ?? []).find((t) => t.id === sp.manage) as typeof managing;
    if (managing) {
      const [{ data: mtq }, { data: bank }] = await Promise.all([
        supabase
          .from("mock_test_questions")
          .select("id, question_order, marks, questions(question_text)")
          .eq("mock_test_id", managing.id)
          .order("question_order"),
        managing.subject_id
          ? supabase
              .from("questions")
              .select("id, question_text, marks")
              .eq("subject_id", managing.subject_id)
              .eq("status", "active")
              .limit(200)
          : supabase.from("questions").select("id, question_text, marks").eq("status", "active").limit(200),
      ]);
      testQuestions = (mtq ?? []) as unknown as typeof testQuestions;
      bankQuestions = (bank ?? []) as unknown as typeof bankQuestions;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fixed tests use hand-picked questions; random tests pick from the question bank by rules.
        </p>
      </div>

      {/* Manage fixed test questions */}
      {managing && (
        <Card className="border-indigo-200">
          <CardTitle>Questions in: {managing.name}</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {testQuestions.map((tq) => (
              <li key={tq.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="line-clamp-1">
                  {tq.question_order}. {tq.questions?.question_text ?? "Question"} ({tq.marks}m)
                </span>
                <form action={removeTestQuestion}>
                  <input type="hidden" name="id" value={tq.id} />
                  <ConfirmSubmitButton label="Remove" message="Remove this question from the test?" />
                </form>
              </li>
            ))}
            {testQuestions.length === 0 && (
              <li className="py-2 text-sm text-slate-500">No questions in this test yet.</li>
            )}
          </ul>
          <form action={addTestQuestion} className="mt-4 grid gap-3 sm:grid-cols-[1fr_100px_100px_auto]">
            <input type="hidden" name="mock_test_id" value={managing.id} />
            <SelectInput
              label="Add question"
              name="question_id"
              required
              placeholder="Pick from the question bank"
              options={bankQuestions.map((q) => ({
                value: q.id,
                label: q.question_text.slice(0, 90),
              }))}
            />
            <FormInput label="Order" name="question_order" type="number" min={1} defaultValue={testQuestions.length + 1} />
            <FormInput label="Marks" name="marks" type="number" min={1} defaultValue={1} />
            <div className="flex items-end">
              <Button type="submit" size="sm">
                Add
              </Button>
            </div>
          </form>
          <ButtonLink href="/admin/mock-tests" variant="ghost" size="sm" className="mt-3">
            Done managing
          </ButtonLink>
        </Card>
      )}

      {/* Create / edit test */}
      <Card>
        <CardTitle>{editing ? `Edit: ${editing.name}` : "Create a mock test"}</CardTitle>
        <form action={saveMockTest} className="mt-4 grid gap-4 sm:grid-cols-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="sm:col-span-2">
            <FormInput label="Test name" name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <SelectInput
            label="Generation"
            name="generation_type"
            defaultValue={editing?.generation_type ?? "fixed"}
            options={[
              { value: "fixed", label: "Fixed (pick exact questions)" },
              { value: "random", label: "Random (rules-based)" },
            ]}
          />
          <SelectInput
            label="Subject"
            name="subject_id"
            placeholder="All subjects"
            defaultValue={editing?.subject_id ?? ""}
            options={subjectOptions}
          />
          <SelectInput
            label="Chapter (optional)"
            name="chapter_id"
            placeholder="Whole subject"
            defaultValue={editing?.chapter_id ?? ""}
            options={chapterOptions}
          />
          <SelectInput
            label="Test type"
            name="test_type"
            defaultValue={editing?.test_type ?? "chapter"}
            options={Object.entries(TEST_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <FormInput
            label="Duration (minutes)"
            name="duration_minutes"
            type="number"
            min={5}
            defaultValue={editing?.duration_minutes ?? 30}
          />
          <FormInput
            label="Total marks"
            name="total_marks"
            type="number"
            min={1}
            defaultValue={editing?.total_marks ?? 20}
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

          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-3">
            <p className="text-sm font-semibold text-slate-700">Random test rules</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Used only when generation is Random. Difficulty percentages should total 100.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              <FormInput label="Easy %" name="mix_easy" type="number" min={0} max={100} defaultValue={Number(editingRule?.difficulty_mix_json?.easy ?? 30)} />
              <FormInput label="Medium %" name="mix_medium" type="number" min={0} max={100} defaultValue={Number(editingRule?.difficulty_mix_json?.medium ?? 50)} />
              <FormInput label="Hard %" name="mix_hard" type="number" min={0} max={100} defaultValue={Number(editingRule?.difficulty_mix_json?.hard ?? 20)} />
              <FormInput label="Question count" name="question_count" type="number" min={1} defaultValue={editingRule?.question_count ?? 10} />
              <FormInput
                label="Type mix (type:percent)"
                name="question_type_mix"
                placeholder="mcq:80, short_answer:20"
                defaultValue={
                  editingRule
                    ? Object.entries(editingRule.question_type_mix_json ?? {})
                        .map(([k, v]) => `${k}:${v}`)
                        .join(", ")
                    : "mcq:100"
                }
              />
            </div>
          </div>

          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit">{editing ? "Save changes" : "Create test"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/mock-tests">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(tests ?? []) as (MockTest & { subjects: { name: string } | null; chapters: { name: string } | null })[]}
        keyFor={(t) => t.id}
        emptyTitle="No mock tests yet"
        columns={[
          { header: "Name", cell: (t) => <span className="font-medium">{t.name}</span> },
          { header: "Type", cell: (t) => TEST_TYPE_LABELS[t.test_type as TestType] ?? t.test_type },
          { header: "Generation", cell: (t) => t.generation_type },
          { header: "Subject", cell: (t) => t.subjects?.name ?? "All" },
          { header: "Duration", cell: (t) => `${t.duration_minutes}m` },
          { header: "Status", cell: (t) => t.status },
          {
            header: "Actions",
            cell: (t) => (
              <div className="flex items-center gap-2">
                {t.generation_type === "fixed" && (
                  <ButtonLink size="sm" variant="secondary" href={`/admin/mock-tests?manage=${t.id}`}>
                    Questions
                  </ButtonLink>
                )}
                <ButtonLink size="sm" variant="outline" href={`/admin/mock-tests?edit=${t.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteMockTest}>
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmSubmitButton message={`Delete test "${t.name}" and its attempts?`} />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
