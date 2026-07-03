import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveProjectTemplate, deleteProjectTemplate } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextareaInput } from "@/components/ui/TextareaInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { ProjectTemplate } from "@/lib/types";

const DEFAULT_SECTIONS = `Cover Page | Project title, student name, class, roll number, school, academic year.
Certificate | Completion statement with signature spaces.
Acknowledgement | Thank teacher, school and family briefly.
Index | Auto Table of Contents from heading styles.
Introduction | One page on the topic and why it was chosen.
Objective | 3-5 bullet points on what the project demonstrates.
Tools Used | Software and hardware used, one or two lines.
Steps Followed | Numbered steps of the work done.
Screenshots | Labelled screenshots with captions.
Conclusion | What was learnt and difficulties solved.
Bibliography | Books, NCERT material and websites referred.`;

export default async function AdminProjectTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: templates }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("project_templates").select("*, subjects(name)").order("created_at"),
  ]);

  const editing = sp.edit
    ? ((templates ?? []).find((t) => t.id === sp.edit) as ProjectTemplate | undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Templates</h1>
        <p className="mt-1 text-sm text-slate-500">
          The project format students follow for their written project work (10 marks).
        </p>
      </div>

      <Card>
        <CardTitle>{editing ? "Edit template" : "Add a template"}</CardTitle>
        <form action={saveProjectTemplate} className="mt-4 grid gap-4 sm:grid-cols-3">
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
          <div className="sm:col-span-3">
            <TextareaInput label="Description" name="description" rows={2} defaultValue={editing?.description ?? ""} />
          </div>
          <div className="sm:col-span-3">
            <TextareaInput
              label="Suggested project topics (one per line)"
              name="suggested_topics"
              rows={4}
              defaultValue={editing?.suggested_topics ?? ""}
            />
          </div>
          <div className="sm:col-span-3">
            <TextareaInput
              label='Format sections — one per line as "Section title | guidance"'
              name="format_sections"
              rows={12}
              defaultValue={
                editing
                  ? (editing.format_sections ?? [])
                      .map((s) => `${s.title} | ${s.guidance}`)
                      .join("\n")
                  : DEFAULT_SECTIONS
              }
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
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit">{editing ? "Save changes" : "Add template"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/project-templates">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={(templates ?? []) as (ProjectTemplate & { subjects: { name: string } | null })[]}
        keyFor={(t) => t.id}
        emptyTitle="No project templates yet"
        columns={[
          { header: "Title", cell: (t) => <span className="font-medium">{t.title}</span> },
          { header: "Subject", cell: (t) => t.subjects?.name ?? "—" },
          { header: "Sections", cell: (t) => String((t.format_sections ?? []).length) },
          { header: "Status", cell: (t) => t.status },
          {
            header: "Actions",
            cell: (t) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/project-templates?edit=${t.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteProjectTemplate}>
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
