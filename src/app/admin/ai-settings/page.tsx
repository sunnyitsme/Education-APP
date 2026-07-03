import { Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveSetting } from "@/lib/actions/admin";
import { isAiConfigured } from "@/lib/ai/gemini";
import { Card, CardTitle } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";

export default async function AdminAiSettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: settings } = await supabase.from("admin_settings").select("*");
  const map = new Map((settings ?? []).map((s) => [s.setting_key, s.setting_value]));
  const configured = isAiConfigured();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Tutor Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Controls for the Gemini-powered tutor, answer checking and viva scoring.
        </p>
      </div>

      <Card className={configured ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" /> Gemini API status
        </CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          {configured
            ? "GEMINI_API_KEY is set on the server. The AI tutor, written-answer checking and viva scoring are available."
            : "GEMINI_API_KEY is NOT set. Add it to your server environment (.env.local or Vercel env vars). The rest of the app works without it."}
        </p>
      </Card>

      <Card>
        <CardTitle>AI tutor enabled</CardTitle>
        <p className="mt-1 text-xs text-slate-400">Switch the tutor off for everyone without removing the key.</p>
        <form action={saveSetting} className="mt-3 flex items-end gap-3">
          <input type="hidden" name="setting_key" value="ai_enabled" />
          <div className="w-48">
            <SelectInput
              name="setting_value"
              defaultValue={map.get("ai_enabled") ?? "true"}
              options={[
                { value: "true", label: "Enabled" },
                { value: "false", label: "Disabled" },
              ]}
            />
          </div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Daily AI question limit (per student)</CardTitle>
        <p className="mt-1 text-xs text-slate-400">
          Keeps free-tier usage under control. Applies to the AI tutor chat.
        </p>
        <form action={saveSetting} className="mt-3 flex items-end gap-3">
          <input type="hidden" name="setting_key" value="ai_daily_limit" />
          <div className="w-48">
            <FormInput
              name="setting_value"
              type="number"
              min={1}
              max={500}
              defaultValue={map.get("ai_daily_limit") ?? "20"}
            />
          </div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Gemini model</CardTitle>
        <p className="mt-1 text-xs text-slate-400">
          Free-tier friendly default: gemini-2.5-flash. Change only if Google renames models.
        </p>
        <form action={saveSetting} className="mt-3 flex items-end gap-3">
          <input type="hidden" name="setting_key" value="ai_model" />
          <div className="w-64">
            <FormInput name="setting_value" defaultValue={map.get("ai_model") ?? "gemini-2.5-flash"} />
          </div>
          <Button type="submit" size="sm">Save</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Privacy note</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Prompts sent to Gemini contain only the selected subject/chapter/topic names and the
          study question. The student&apos;s name, email, school and any other personal data are
          never included.
        </p>
      </Card>
    </div>
  );
}
