import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveVivaQuestion, deleteVivaQuestion } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { VivaQuestion } from "@/lib/types";

export default async function AdminVivaQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }, { data: questions }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("chapters").select("id, name, chapter_number").order("chapter_number"),
    supabase.from("viva_questions").select("*, subjects(name)").order("created_at"),
  ]);

  const editing = sp.edit
    ? ((questions ?? []).find((q) => q.id === sp.edit) as VivaQuestion | undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Viva Questions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Questions for AI-scored viva practice (Part C viva voce, 10 marks).
        </p>
      </div>

      <Card>
        <CardTitle>{editing ? "Edit viva question" : "Add a viva question"}</CardTitle>
        <form action={saveVivaQuestion} className="mt-4 grid gap-4 sm:grid-cols-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Subject"
            name="subject_id"
            required
            placeholder="Select subject"
            defaultValue={editing?.subject_id ?? ""}
            options={(subjects ?? []).map((s) => ({ value: s.id, label: s.name }))}
          />
          <SelectInput
            label="Chapter (optional)"
            name="chapter_id"
            placeholder="No chapter"
            defaultValue={editing?.chapter_id ?? ""}
            options={(chapters ?? []).map((c) => ({
              value: c.id,
              label: `Ch ${c.chapter_number}: ${c.name}`,
            }))}
          />
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
            <TextareaInput label="Question" name="question" required rows={2} defaultValue={editing?.question ?? ""} />
          </div>
          <div className="sm:col-span-3">
            <TextareaInput
              label="Model answer"
              name="model_answer"
              rows={3}
              defaultValue={editing?.model_answer ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaInput
              label="Key points expected (one per line)"
              name="key_points"
              rows={3}
              defaultValue={editing?.key_points ?? ""}
            />
          </div>
          <SelectInput
            label="Status"
            name="status"
            defaultValue={editing?.status ?? "active"}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit">{editing ? "Save changes" : "Add question"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/viva-questions">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(questions ?? []) as (VivaQuestion & { subjects: { name: string } | null })[]}
        keyFor={(q) => q.id}
        emptyTitle="No viva questions yet"
        columns={[
          {
            header: "Question",
            cell: (q) => <span className="line-clamp-2 max-w-md">{q.question}</span>,
          },
          { header: "Subject", cell: (q) => q.subjects?.name ?? "—" },
          { header: "Difficulty", cell: (q) => q.difficulty },
          { header: "Status", cell: (q) => q.status },
          {
            header: "Actions",
            cell: (q) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/viva-questions?edit=${q.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteVivaQuestion}>
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
