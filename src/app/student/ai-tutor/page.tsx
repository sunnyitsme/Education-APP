import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAiConfigured } from "@/lib/ai/gemini";
import { AiTutorChat } from "@/components/AiTutorChat";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";

export default async function AiTutorPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; chapter?: string; topic?: string }>;
}) {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const sp = await searchParams;

  const [{ data: subjects }, { data: chapters }, { data: topics }, { data: history }] =
    await Promise.all([
      supabase.from("subjects").select("id, name").eq("status", "active").order("name"),
      supabase.from("chapters").select("id, name, subject_id").eq("status", "active").order("chapter_number"),
      supabase.from("topics").select("id, name, chapter_id").eq("status", "active").order("topic_order"),
      supabase
        .from("ai_doubt_history")
        .select("id, question, ai_response, created_at")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  // Daily usage + limit (settings are admin-only readable, so use service role).
  let dailyLimit = 20;
  let usedToday = 0;
  try {
    const admin = createAdminClient();
    const { data: limitRow } = await admin
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "ai_daily_limit")
      .maybeSingle();
    if (limitRow) dailyLimit = Number(limitRow.setting_value) || 20;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count } = await admin
      .from("ai_doubt_history")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .gte("created_at", startOfDay.toISOString());
    usedToday = count ?? 0;
  } catch {
    // Service key missing: keep defaults; the API route will enforce limits.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Tutor</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick your subject, chapter and topic, then ask your doubt. The AI answers like a Class 10
          CBSE teacher — in English or simple Hindi.
        </p>
      </div>

      <AiTutorChat
        subjects={(subjects ?? []).map((s) => ({ id: s.id, name: s.name }))}
        chapters={(chapters ?? []).map((c) => ({ id: c.id, name: c.name, parentId: c.subject_id }))}
        topics={(topics ?? []).map((t) => ({ id: t.id, name: t.name, parentId: t.chapter_id }))}
        initialSubjectId={sp.subject}
        initialChapterId={sp.chapter}
        initialTopicId={sp.topic}
        aiConfigured={isAiConfigured()}
        dailyLimit={dailyLimit}
        usedToday={usedToday}
      />

      {(history ?? []).length > 0 && (
        <Card>
          <CardTitle>Recent doubts</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {(history ?? []).map((h) => (
              <li key={h.id} className="py-3">
                <p className="text-sm font-medium text-slate-700">{h.question}</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-500">
                  {h.ai_response}
                </p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(h.created_at)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
