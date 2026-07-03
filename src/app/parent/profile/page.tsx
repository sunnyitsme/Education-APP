import { KeyRound, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, getLinkedChildren } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";

export default async function ParentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; linked?: string }>;
}) {
  const profile = await requireRole("parent");
  const children = await getLinkedChildren(profile.id);
  const sp = await searchParams;

  async function linkChild(formData: FormData) {
    "use server";
    const code = String(formData.get("code") ?? "").trim();
    const relationship = String(formData.get("relationship") ?? "guardian");
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("link_parent_by_code", {
      p_code: code,
      p_relationship: relationship,
    });
    const result = (data ?? null) as unknown as { ok: boolean; error?: string } | null;
    if (error || !result?.ok) {
      redirect(
        `/parent/profile?error=${encodeURIComponent(error?.message ?? result?.error ?? "Could not link.")}`
      );
    }
    revalidatePath("/parent/profile");
    redirect("/parent/profile?linked=1");
  }

  async function updateName(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ full_name: String(formData.get("full_name") ?? "") })
      .eq("id", user.id);
    revalidatePath("/parent/profile");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Parent account</p>
      </div>

      {/* Link a child */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-600" /> Link your child
        </CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Enter the parent link code shown on your child&apos;s profile page. You will get read-only
          access to their progress and results.
        </p>
        <form action={linkChild} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput
              label="Link code"
              name="code"
              required
              placeholder="e.g. 4F7A2B9C"
              className="font-mono uppercase tracking-widest"
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
          </div>
          {sp.error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{sp.error}</p>
          )}
          {sp.linked && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Linked successfully! Open the dashboard to see progress.
            </p>
          )}
          <Button type="submit">Link child</Button>
        </form>
      </Card>

      {/* Linked children */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" /> Linked children
        </CardTitle>
        {children.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No children linked yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {children.map((c) => (
              <li key={c.id} className="py-2.5 text-sm">
                <p className="font-medium text-slate-700">{c.full_name || c.email}</p>
                <p className="text-xs text-slate-400">{c.email}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Details */}
      <Card>
        <CardTitle>Details</CardTitle>
        <form action={updateName} className="mt-4 space-y-4">
          <FormInput label="Full name" name="full_name" defaultValue={profile.full_name} required />
          <FormInput label="Email" name="email" defaultValue={profile.email} disabled />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
