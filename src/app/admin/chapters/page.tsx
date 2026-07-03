import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveChapter, deleteChapter } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { Chapter } from "@/lib/types";

export default async function AdminChaptersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase
      .from("chapters")
      .select("*, subjects(name)")
      .order("chapter_number"),
  ]);

  const filtered = sp.subject
    ? (chapters ?? []).filter((c) => c.subject_id === sp.subject)
    : (chapters ?? []);
  const editing = sp.edit
    ? ((chapters ?? []).find((c) => c.id === sp.edit) as Chapter | undefined)
    : undefined;
  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chapters</h1>
          <p className="mt-1 text-sm text-slate-500">NCERT chapters per subject.</p>
        </div>
        <form method="get" className="w-56">
          <SelectInput
            name="subject"
            placeholder="All subjects"
            defaultValue={sp.subject ?? ""}
            options={subjectOptions}
          />
          <button type="submit" className="mt-1 text-xs font-medium text-indigo-600 hover:underline">
            Apply filter
          </button>
        </form>
      </div>

      <Card>
        <CardTitle>{editing ? `Edit: ${editing.name}` : "Add a chapter"}</CardTitle>
        <form action={saveChapter} className="mt-4 grid gap-4 sm:grid-cols-2">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Subject"
            name="subject_id"
            required
            defaultValue={editing?.subject_id ?? sp.subject ?? ""}
            placeholder="Select subject"
            options={subjectOptions}
          />
          <FormInput
            label="Chapter number"
            name="chapter_number"
            type="number"
            min={1}
            required
            defaultValue={editing?.chapter_number ?? ""}
          />
          <FormInput label="Name" name="name" required defaultValue={editing?.name ?? ""} />
          <FormInput
            label="Board marks weightage (optional)"
            name="marks_weightage"
            type="number"
            defaultValue={editing?.marks_weightage ?? ""}
          />
          <div className="sm:col-span-2">
            <TextareaInput label="Description" name="description" rows={2} defaultValue={editing?.description ?? ""} />
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
          <div className="flex items-end gap-2">
            <Button type="submit">{editing ? "Save changes" : "Add chapter"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/chapters">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={filtered as (Chapter & { subjects: { name: string } | null })[]}
        keyFor={(c) => c.id}
        emptyTitle="No chapters yet"
        columns={[
          { header: "#", cell: (c) => String(c.chapter_number) },
          { header: "Name", cell: (c) => <span className="font-medium">{c.name}</span> },
          { header: "Subject", cell: (c) => c.subjects?.name ?? "—" },
          { header: "Weightage", cell: (c) => (c.marks_weightage ? `${c.marks_weightage}m` : "—") },
          { header: "Status", cell: (c) => c.status },
          {
            header: "Actions",
            cell: (c) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/chapters?edit=${c.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteChapter}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmitButton message={`Delete chapter "${c.name}" and its topics?`} />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
