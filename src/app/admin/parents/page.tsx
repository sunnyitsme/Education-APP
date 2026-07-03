import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { adminDeleteUser, adminLinkParentChild, adminRemoveLink } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { formatDate } from "@/lib/utils";
import type { ParentChildLink, Profile } from "@/lib/types";

export default async function AdminParentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: parents }, { data: students }, { data: links }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "parent").order("created_at"),
    supabase.from("profiles").select("id, full_name, email").eq("role", "student"),
    supabase.from("parent_child_links").select("*"),
  ]);

  const studentById = new Map(
    ((students ?? []) as Pick<Profile, "id" | "full_name" | "email">[]).map((s) => [s.id, s])
  );
  const linksByParent = new Map<string, ParentChildLink[]>();
  for (const l of (links ?? []) as ParentChildLink[]) {
    const arr = linksByParent.get(l.parent_user_id) ?? [];
    arr.push(l);
    linksByParent.set(l.parent_user_id, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Parent accounts and manual parent-child linking.
        </p>
      </div>

      {/* Manual link */}
      <Card>
        <CardTitle>Manually link a parent to a student</CardTitle>
        <form action={adminLinkParentChild} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_150px_auto]">
          <SelectInput
            label="Parent"
            name="parent_user_id"
            required
            placeholder="Select parent"
            options={((parents ?? []) as Profile[]).map((p) => ({
              value: p.id,
              label: `${p.full_name || p.email}`,
            }))}
          />
          <SelectInput
            label="Student"
            name="student_user_id"
            required
            placeholder="Select student"
            options={((students ?? []) as Pick<Profile, "id" | "full_name" | "email">[]).map((s) => ({
              value: s.id,
              label: `${s.full_name || s.email}`,
            }))}
          />
          <SelectInput
            label="Relationship"
            name="relationship"
            defaultValue="guardian"
            options={[
              { value: "mother", label: "Mother" },
              { value: "father", label: "Father" },
              { value: "guardian", label: "Guardian" },
            ]}
          />
          <div className="flex items-end">
            <Button type="submit">Link</Button>
          </div>
        </form>
      </Card>

      <DataTable
        rows={(parents ?? []) as Profile[]}
        keyFor={(p) => p.id}
        emptyTitle="No parents yet"
        emptyHint="Parents create their own accounts from the signup page."
        columns={[
          { header: "Name", cell: (p) => <span className="font-medium">{p.full_name || "—"}</span> },
          { header: "Email", cell: (p) => p.email },
          {
            header: "Linked children",
            cell: (p) => {
              const list = linksByParent.get(p.id) ?? [];
              if (list.length === 0) return "—";
              return (
                <div className="space-y-1">
                  {list.map((l) => {
                    const student = studentById.get(l.student_user_id);
                    return (
                      <div key={l.id} className="flex items-center gap-2 text-xs">
                        <span>
                          {student?.full_name || student?.email} ({l.relationship}, {l.status})
                        </span>
                        <form action={adminRemoveLink}>
                          <input type="hidden" name="id" value={l.id} />
                          <ConfirmSubmitButton label="Unlink" message="Remove this parent-child link?" />
                        </form>
                      </div>
                    );
                  })}
                </div>
              );
            },
          },
          { header: "Joined", cell: (p) => formatDate(p.created_at) },
          {
            header: "Actions",
            cell: (p) => (
              <form action={adminDeleteUser}>
                <input type="hidden" name="user_id" value={p.id} />
                <ConfirmSubmitButton
                  label="Delete account"
                  message={`Delete parent account ${p.email}? This cannot be undone.`}
                />
              </form>
            ),
          },
        ]}
      />
    </div>
  );
}
