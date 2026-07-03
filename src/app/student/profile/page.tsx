import { KeyRound, UserCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import type { StudentProfile } from "@/lib/types";

export default async function StudentProfilePage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: spRow } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  const sp = spRow as StudentProfile | null;

  const { data: links } = await supabase
    .from("parent_child_links")
    .select("*, profiles!parent_child_links_parent_user_id_fkey(full_name, email)")
    .eq("student_user_id", profile.id);

  async function updateProfile(formData: FormData) {
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

    await supabase
      .from("student_profiles")
      .update({
        school_name: String(formData.get("school_name") ?? "") || null,
        medium: String(formData.get("medium") ?? "English"),
        daily_study_goal: Number(formData.get("daily_study_goal") ?? 60) || 60,
      })
      .eq("user_id", user.id);

    revalidatePath("/student/profile");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Class 10 · CBSE · {sp?.academic_year}</p>
      </div>

      {/* Parent link code */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-600" /> Parent link code
        </CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Share this code with your parent. They enter it on their profile page to see your
          progress (they can never change your answers or study records).
        </p>
        <p className="mt-3 inline-block rounded-xl bg-white px-6 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-indigo-700 shadow-sm">
          {sp?.parent_link_code ?? "—"}
        </p>
        {(links ?? []).length > 0 && (
          <div className="mt-3 text-sm text-slate-600">
            <p className="font-medium">Linked parents:</p>
            <ul className="mt-1 list-inside list-disc">
              {(links ?? []).map((l) => {
                const parent = (l as unknown as { profiles: { full_name: string; email: string } | null }).profiles;
                return (
                  <li key={l.id}>
                    {parent?.full_name || parent?.email} ({l.status})
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      {/* Edit profile */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-slate-500" /> Details
        </CardTitle>
        <form action={updateProfile} className="mt-4 space-y-4">
          <FormInput label="Full name" name="full_name" defaultValue={profile.full_name} required />
          <FormInput label="Email" name="email" defaultValue={profile.email} disabled />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Class" name="class_name" defaultValue={sp?.class_name ?? "Class 10"} disabled />
            <FormInput label="Board" name="board" defaultValue={sp?.board ?? "CBSE"} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Medium" name="medium" defaultValue={sp?.medium ?? "English"} />
            <FormInput
              label="Daily study goal (minutes)"
              name="daily_study_goal"
              type="number"
              min={10}
              max={600}
              defaultValue={sp?.daily_study_goal ?? 60}
            />
          </div>
          <FormInput
            label="School name (optional)"
            name="school_name"
            defaultValue={sp?.school_name ?? ""}
          />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
