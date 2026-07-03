import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { savePracticalTask, deletePracticalTask } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { PracticalTask } from "@/lib/types";

export default async function AdminPracticalTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: tasks }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("practical_tasks").select("*, subjects(name)").order("created_at"),
  ]);

  const editing = sp.edit
    ? ((tasks ?? []).find((t) => t.id === sp.edit) as PracticalTask | undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Practical Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hands-on lab tasks for Computer Applications (LibreOffice Writer, Calc, Base).
        </p>
      </div>

      <Card>
        <CardTitle>{editing ? `Edit: ${editing.title}` : "Add a practical task"}</CardTitle>
        <form action={savePracticalTask} className="mt-4 grid gap-4 sm:grid-cols-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Subject"
            name="subject_id"
            required
            placeholder="Select subject"
            defaultValue={editing?.subject_id ?? ""}
            options={(subjects ?? []).map((s) => ({ value: s.id, label: s.name }))}
          />
          <div className="sm:col-span-2">
            <FormInput label="Title" name="title" required defaultValue={editing?.title ?? ""} />
          </div>
          <SelectInput
            label="Tool"
            name="tool"
            defaultValue={editing?.tool ?? "writer"}
            options={[
              { value: "writer", label: "LibreOffice Writer" },
              { value: "calc", label: "LibreOffice Calc" },
              { value: "base", label: "LibreOffice Base" },
              { value: "other", label: "Other" },
            ]}
          />
          <FormInput label="Marks" name="marks" type="number" min={1} defaultValue={editing?.marks ?? 5} />
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
            <TextareaInput label="Description" name="description" rows={2} defaultValue={editing?.description ?? ""} />
          </div>
          <div className="sm:col-span-3">
            <TextareaInput
              label="Steps (one per line, numbered automatically)"
              name="steps"
              rows={6}
              defaultValue={editing?.steps ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaInput
              label="Expected outcome"
              name="expected_outcome"
              rows={2}
              defaultValue={editing?.expected_outcome ?? ""}
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
            <Button type="submit">{editing ? "Save changes" : "Add task"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/practical-tasks">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(tasks ?? []) as (PracticalTask & { subjects: { name: string } | null })[]}
        keyFor={(t) => t.id}
        emptyTitle="No practical tasks yet"
        columns={[
          { header: "Title", cell: (t) => <span className="font-medium">{t.title}</span> },
          { header: "Tool", cell: (t) => t.tool },
          { header: "Subject", cell: (t) => t.subjects?.name ?? "—" },
          { header: "Marks", cell: (t) => String(t.marks) },
          { header: "Status", cell: (t) => t.status },
          {
            header: "Actions",
            cell: (t) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/practical-tasks?edit=${t.id}`}>
                  Edit
                </ButtonLink>
                <form action={deletePracticalTask}>
                  <input type="hidden" name="id" value={t.id} />
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
