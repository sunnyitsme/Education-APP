import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askTutor, isAiConfigured, AI_NOT_CONFIGURED_MESSAGE } from "@/lib/ai/gemini";

export const maxDuration = 60;

/**
 * AI Tutor endpoint. The Gemini key stays server-side. Prompts contain only
 * curriculum names + the doubt text - never personal student data.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!isAiConfigured()) {
    return NextResponse.json({ error: AI_NOT_CONFIGURED_MESSAGE, notConfigured: true }, { status: 503 });
  }

  let body: { question?: string; subjectId?: string; chapterId?: string; topicId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  if (question.length > 2000) {
    return NextResponse.json({ error: "Please keep your doubt under 2000 characters." }, { status: 400 });
  }

  // Admin settings: enabled flag, daily limit, model. Read with service role
  // (admin_settings has no student read policy).
  const admin = createAdminClient();
  const { data: settings } = await admin.from("admin_settings").select("setting_key, setting_value");
  const settingsMap = new Map((settings ?? []).map((s) => [s.setting_key, s.setting_value]));

  if (settingsMap.get("ai_enabled") === "false") {
    return NextResponse.json(
      { error: "The AI tutor has been switched off by the admin.", notConfigured: true },
      { status: 503 }
    );
  }

  const dailyLimit = Number(settingsMap.get("ai_daily_limit") ?? 20);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("ai_doubt_history")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id)
    .gte("created_at", startOfDay.toISOString());

  if ((count ?? 0) >= dailyLimit) {
    return NextResponse.json(
      { error: `Daily AI question limit reached (${dailyLimit}/day). Try again tomorrow or revise your saved answers.` },
      { status: 429 }
    );
  }

  // Resolve curriculum names only - no personal data goes to Gemini.
  const [subjectRes, chapterRes, topicRes] = await Promise.all([
    body.subjectId
      ? supabase.from("subjects").select("name").eq("id", body.subjectId).maybeSingle()
      : Promise.resolve({ data: null }),
    body.chapterId
      ? supabase.from("chapters").select("name").eq("id", body.chapterId).maybeSingle()
      : Promise.resolve({ data: null }),
    body.topicId
      ? supabase.from("topics").select("name").eq("id", body.topicId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  try {
    const answer = await askTutor(
      question,
      {
        subject: subjectRes.data?.name,
        chapter: chapterRes.data?.name,
        topic: topicRes.data?.name,
      },
      settingsMap.get("ai_model")
    );

    await supabase.from("ai_doubt_history").insert({
      student_id: user.id,
      subject_id: body.subjectId || null,
      chapter_id: body.chapterId || null,
      topic_id: body.topicId || null,
      question,
      ai_response: answer,
      provider: "gemini",
    });

    const remaining = dailyLimit - (count ?? 0) - 1;
    return NextResponse.json({ answer, remaining });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json(
      { error: `The AI tutor could not answer right now (${message}). Please try again.` },
      { status: 502 }
    );
  }
}
