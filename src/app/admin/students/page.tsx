import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { adminDeleteUser, adminRemoveLink } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { formatDate } from "@/lib/utils";
import type { ParentChildLink, Profile, StudentProfile } from "@/lib/types";

export default async function AdminStudentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: students }, { data: studentProfiles }, { data: links }, { data: parents }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "student").order("created_at"),
      supabase.from("student_profiles").select("*"),
      supabase.from("parent_child_links").select("*"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "parent"),
    ]);

  const spByUser = new Map(
    ((studentProfiles ?? []) as StudentProfile[]).map((s) => [s.user_id, s])
  );
  const parentById = new Map(
    ((parents ?? []) as Pick<Profile, "id" | "full_name" | "email">[]).map((p) => [p.id, p])
  );
  const linksByStudent = new Map<string, ParentChildLink[]>();
  for (const l of (links ?? []) as ParentChildLink[]) {
    const arr = linksByStudent.get(l.student_user_id) ?? [];
    arr.push(l);
    linksByStudent.set(l.student_user_id, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="mt-1 text-sm text-slate-500">
          Student accounts, their parent link codes and linked parents. Students sign up themselves
          from the signup page.
        </p>
      </div>

      <DataTable
        rows={(students ?? []) as Profile[]}
        keyFor={(s) => s.id}
        emptyTitle="No students yet"
        emptyHint="Students create their own accounts from the signup page."
        columns={[
          { header: "Name", cell: (s) => <span className="font-medium">{s.full_name || "—"}</span> },
          { header: "Email", cell: (s) => s.email },
          {
            header: "Link code",
            cell: (s) => (
              <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                {spByUser.get(s.id)?.parent_link_code ?? "—"}
              </code>
            ),
          },
          {
            header: "Linked parents",
            cell: (s) => {
              const list = linksByStudent.get(s.id) ?? [];
              if (list.length === 0) return "—";
              return (
                <div className="space-y-1">
                  {list.map((l) => {
                    const parent = parentById.get(l.parent_user_id);
                    return (
                      <div key={l.id} className="flex items-center gap-2 text-xs">
                        <span>{parent?.full_name || parent?.email || l.parent_user_id}</span>
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
          { header: "Joined", cell: (s) => formatDate(s.created_at) },
          {
            header: "Actions",
            cell: (s) => (
              <form action={adminDeleteUser}>
                <input type="hidden" name="user_id" value={s.id} />
                <ConfirmSubmitButton
                  label="Delete account"
                  message={`Delete ${s.email} and ALL their progress and attempts? This cannot be undone.`}
                />
              </form>
            ),
          },
        ]}
      />

      <Card>
        <CardTitle>How parent linking works</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Every student gets a unique link code (shown above and on their profile page). A parent
          enters it on their own profile page to connect. You can also link accounts manually from
          the <a href="/admin/parents" className="font-medium text-indigo-600 hover:underline">Parents</a>{" "}
          page, and unlink here.
        </p>
      </Card>
    </div>
  );
}
