import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveSubject, deleteSubject } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { Subject } from "@/lib/types";

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const { data: subjects } = await supabase.from("subjects").select("*").order("name");
  const editing = sp.edit
    ? ((subjects ?? []).find((s) => s.id === sp.edit) as Subject | undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the Class 10 subjects students see.</p>
      </div>

      <Card>
        <CardTitle>{editing ? `Edit: ${editing.name}` : "Add a subject"}</CardTitle>
        <form action={saveSubject} className="mt-4 grid gap-4 sm:grid-cols-2">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <FormInput label="Name" name="name" required defaultValue={editing?.name ?? ""} placeholder="e.g. Mathematics" />
          <SelectInput
            label="Status"
            name="status"
            defaultValue={editing?.status ?? "active"}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <FormInput label="Class" name="class_name" defaultValue={editing?.class_name ?? "Class 10"} />
          <FormInput label="Academic year" name="academic_year" defaultValue={editing?.academic_year ?? "2025-26"} />
          <div className="sm:col-span-2">
            <TextareaInput label="Description" name="description" rows={2} defaultValue={editing?.description ?? ""} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">{editing ? "Save changes" : "Add subject"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/subjects">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(subjects ?? []) as Subject[]}
        keyFor={(s) => s.id}
        emptyTitle="No subjects yet"
        emptyHint="Add your first subject above, or run the seed script."
        columns={[
          { header: "Name", cell: (s) => <span className="font-medium">{s.name}</span> },
          { header: "Class", cell: (s) => s.class_name },
          { header: "Year", cell: (s) => s.academic_year },
          { header: "Status", cell: (s) => s.status },
          {
            header: "Actions",
            cell: (s) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/subjects?edit=${s.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteSubject}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmSubmitButton message={`Delete "${s.name}" and ALL its chapters, topics and questions?`} />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
