import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveSetting } from "@/lib/actions/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import type { AdminSetting } from "@/lib/types";

export default async function AdminSettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("admin_settings")
    .select("*")
    .order("setting_key");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Key-value settings for the app. AI settings have a dedicated page under{" "}
          <a href="/admin/ai-settings" className="font-medium text-indigo-600 hover:underline">
            AI Settings
          </a>
          .
        </p>
      </div>

      <Card>
        <CardTitle>All settings</CardTitle>
        <div className="mt-4 space-y-3">
          {((settings ?? []) as AdminSetting[]).map((s) => (
            <form key={s.id} action={saveSetting} className="flex items-end gap-3">
              <input type="hidden" name="setting_key" value={s.setting_key} />
              <div className="w-56 shrink-0 pb-2">
                <code className="text-sm text-slate-700">{s.setting_key}</code>
              </div>
              <div className="flex-1">
                <FormInput name="setting_value" defaultValue={s.setting_value} />
              </div>
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          ))}
          {(settings ?? []).length === 0 && (
            <p className="text-sm text-slate-500">
              No settings yet — run the seed script or add one below.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Add a setting</CardTitle>
        <form action={saveSetting} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <FormInput label="Key" name="setting_key" required placeholder="e.g. academic_year" />
          <FormInput label="Value" name="setting_value" required placeholder="e.g. 2025-26" />
          <div className="flex items-end">
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>Account roles</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Students and parents sign up from the signup page. To create an admin, sign up as a
          student first, then promote the account with the SQL snippet in the README (Supabase SQL
          editor):
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{`update public.profiles set role = 'admin'
where email = 'you@example.com';`}
        </pre>
      </Card>
    </div>
  );
}
