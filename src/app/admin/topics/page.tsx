import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveTopic, deleteTopic } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import type { Chapter, Topic } from "@/lib/types";

export default async function AdminTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; chapter?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: chapters }, { data: topics }] = await Promise.all([
    supabase.from("chapters").select("id, name, chapter_number, subjects(name)").order("chapter_number"),
    supabase.from("topics").select("*, chapters(name, subjects(name))").order("topic_order"),
  ]);

  const filtered = sp.chapter
    ? (topics ?? []).filter((t) => t.chapter_id === sp.chapter)
    : (topics ?? []);
  const editing = sp.edit
    ? ((topics ?? []).find((t) => t.id === sp.edit) as Topic | undefined)
    : undefined;

  const chapterOptions = (chapters ?? []).map((c) => {
    const subjectName = (c as unknown as Chapter & { subjects: { name: string } | null }).subjects?.name;
    return { value: c.id, label: `${subjectName ?? "?"} — Ch ${c.chapter_number}: ${c.name}` };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Topics</h1>
          <p className="mt-1 text-sm text-slate-500">Topics inside each chapter.</p>
        </div>
        <form method="get" className="w-72">
          <SelectInput
            name="chapter"
            placeholder="All chapters"
            defaultValue={sp.chapter ?? ""}
            options={chapterOptions}
          />
          <button type="submit" className="mt-1 text-xs font-medium text-indigo-600 hover:underline">
            Apply filter
          </button>
        </form>
      </div>

      <Card>
        <CardTitle>{editing ? `Edit: ${editing.name}` : "Add a topic"}</CardTitle>
        <form action={saveTopic} className="mt-4 grid gap-4 sm:grid-cols-2">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <SelectInput
            label="Chapter"
            name="chapter_id"
            required
            defaultValue={editing?.chapter_id ?? sp.chapter ?? ""}
            placeholder="Select chapter"
            options={chapterOptions}
          />
          <FormInput label="Name" name="name" required defaultValue={editing?.name ?? ""} />
          <FormInput
            label="Order"
            name="topic_order"
            type="number"
            min={1}
            defaultValue={editing?.topic_order ?? 1}
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
            <Button type="submit">{editing ? "Save changes" : "Add topic"}</Button>
            {editing && (
              <ButtonLink variant="ghost" href="/admin/topics">
                Cancel
              </ButtonLink>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        rows={filtered as (Topic & { chapters: { name: string; subjects: { name: string } | null } | null })[]}
        keyFor={(t) => t.id}
        emptyTitle="No topics yet"
        columns={[
          { header: "Name", cell: (t) => <span className="font-medium">{t.name}</span> },
          { header: "Chapter", cell: (t) => t.chapters?.name ?? "—" },
          { header: "Subject", cell: (t) => t.chapters?.subjects?.name ?? "—" },
          { header: "Difficulty", cell: (t) => t.difficulty },
          { header: "Status", cell: (t) => t.status },
          {
            header: "Actions",
            cell: (t) => (
              <div className="flex items-center gap-2">
                <ButtonLink size="sm" variant="outline" href={`/admin/study-content?topic=${t.id}`}>
                  Content
                </ButtonLink>
                <ButtonLink size="sm" variant="outline" href={`/admin/topics?edit=${t.id}`}>
                  Edit
                </ButtonLink>
                <form action={deleteTopic}>
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmSubmitButton message={`Delete topic "${t.name}"?`} />
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
