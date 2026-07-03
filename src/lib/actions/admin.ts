"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Admin only");
  return supabase;
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string, fallback = 0): number {
  const n = Number(fd.get(key));
  return Number.isFinite(n) ? n : fallback;
}
function opt(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}

/**
 * Generic admin save/delete for simple entities. Each entity whitelists its
 * own fields; RLS admin policies authorise the writes.
 */

// ---------- subjects ----------
export async function saveSubject(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    name: str(fd, "name"),
    class_name: str(fd, "class_name") || "Class 10",
    board: str(fd, "board") || "CBSE",
    academic_year: str(fd, "academic_year") || "2025-26",
    description: str(fd, "description"),
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("subjects").update(payload).eq("id", id);
  else await supabase.from("subjects").insert(payload);
  revalidatePath("/admin/subjects");
}

export async function deleteSubject(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("subjects").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/subjects");
}

// ---------- chapters ----------
export async function saveChapter(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    subject_id: str(fd, "subject_id"),
    chapter_number: num(fd, "chapter_number", 1),
    name: str(fd, "name"),
    description: str(fd, "description"),
    marks_weightage: fd.get("marks_weightage") ? num(fd, "marks_weightage") : null,
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("chapters").update(payload).eq("id", id);
  else await supabase.from("chapters").insert(payload);
  revalidatePath("/admin/chapters");
}

export async function deleteChapter(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("chapters").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/chapters");
}

// ---------- topics ----------
export async function saveTopic(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    chapter_id: str(fd, "chapter_id"),
    name: str(fd, "name"),
    topic_order: num(fd, "topic_order", 1),
    difficulty: str(fd, "difficulty") || "medium",
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("topics").update(payload).eq("id", id);
  else await supabase.from("topics").insert(payload);
  revalidatePath("/admin/topics");
}

export async function deleteTopic(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("topics").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/topics");
}

// ---------- study contents ----------
export async function saveStudyContent(fd: FormData) {
  const supabase = await requireAdminUser();
  const topicId = str(fd, "topic_id");
  const payload = {
    topic_id: topicId,
    simple_explanation: str(fd, "simple_explanation"),
    detailed_explanation: str(fd, "detailed_explanation"),
    key_points: str(fd, "key_points"),
    examples: str(fd, "examples"),
    formulae: str(fd, "formulae"),
    exam_tips: str(fd, "exam_tips"),
    common_mistakes: str(fd, "common_mistakes"),
  };
  await supabase.from("study_contents").upsert(payload, { onConflict: "topic_id" });
  revalidatePath("/admin/study-content");
}

// ---------- questions ----------
export async function saveQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");

  let options: Record<string, string> | null = null;
  const a = str(fd, "option_a");
  const b = str(fd, "option_b");
  const c = str(fd, "option_c");
  const d = str(fd, "option_d");
  if (a || b || c || d) {
    options = {};
    if (a) options.A = a;
    if (b) options.B = b;
    if (c) options.C = c;
    if (d) options.D = d;
  }

  const payload = {
    subject_id: str(fd, "subject_id"),
    chapter_id: opt(fd, "chapter_id"),
    topic_id: opt(fd, "topic_id"),
    question_type: str(fd, "question_type") || "mcq",
    question_text: str(fd, "question_text"),
    options_json: options,
    correct_answer: str(fd, "correct_answer"),
    explanation: str(fd, "explanation"),
    marks: num(fd, "marks", 1),
    difficulty: str(fd, "difficulty") || "medium",
    academic_year: str(fd, "academic_year") || "2025-26",
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("questions").update(payload).eq("id", id);
  else await supabase.from("questions").insert(payload);
  revalidatePath("/admin/questions");
}

export async function deleteQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("questions").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/questions");
}

// ---------- mock tests ----------
export async function saveMockTest(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const generationType = str(fd, "generation_type") || "fixed";
  const payload = {
    name: str(fd, "name"),
    subject_id: opt(fd, "subject_id"),
    chapter_id: opt(fd, "chapter_id"),
    test_type: str(fd, "test_type") || "chapter",
    generation_type: generationType,
    duration_minutes: num(fd, "duration_minutes", 30),
    total_marks: num(fd, "total_marks", 20),
    status: str(fd, "status") || "active",
  };

  let testId = id;
  if (id) {
    await supabase.from("mock_tests").update(payload).eq("id", id);
  } else {
    const { data } = await supabase.from("mock_tests").insert(payload).select("id").single();
    testId = data?.id ?? "";
  }

  if (generationType === "random" && testId) {
    const easy = num(fd, "mix_easy", 30);
    const medium = num(fd, "mix_medium", 50);
    const hard = num(fd, "mix_hard", 20);
    const typeMixRaw = str(fd, "question_type_mix"); // e.g. "mcq:80, short_answer:20"
    const typeMix: Record<string, number> = {};
    for (const part of typeMixRaw.split(",")) {
      const [k, v] = part.split(":").map((s) => s.trim());
      if (k && Number.isFinite(Number(v))) typeMix[k] = Number(v);
    }
    await supabase.from("mock_test_rules").upsert(
      {
        mock_test_id: testId,
        difficulty_mix_json: { easy, medium, hard },
        question_type_mix_json: Object.keys(typeMix).length > 0 ? typeMix : { mcq: 100 },
        question_count: num(fd, "question_count", 10),
        topic_ids_json: [],
      },
      { onConflict: "mock_test_id" }
    );
  }
  revalidatePath("/admin/mock-tests");
}

export async function deleteMockTest(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("mock_tests").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/mock-tests");
}

/** Add/remove a question of a fixed mock test. */
export async function addTestQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  const testId = str(fd, "mock_test_id");
  await supabase.from("mock_test_questions").insert({
    mock_test_id: testId,
    question_id: str(fd, "question_id"),
    question_order: num(fd, "question_order", 1),
    marks: num(fd, "marks", 1),
  });
  revalidatePath(`/admin/mock-tests`);
}

export async function removeTestQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("mock_test_questions").delete().eq("id", str(fd, "id"));
  revalidatePath(`/admin/mock-tests`);
}

// ---------- previous year papers ----------
export async function savePaper(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    subject_id: str(fd, "subject_id"),
    paper_year: num(fd, "paper_year", new Date().getFullYear()),
    set_number: str(fd, "set_number") || "1",
    paper_type: str(fd, "paper_type") || "board",
    pdf_url: opt(fd, "pdf_url"),
    marking_scheme_url: opt(fd, "marking_scheme_url"),
    total_marks: num(fd, "total_marks", 80),
    duration_minutes: num(fd, "duration_minutes", 180),
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("previous_year_papers").update(payload).eq("id", id);
  else await supabase.from("previous_year_papers").insert(payload);
  revalidatePath("/admin/previous-year-papers");
}

export async function deletePaper(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("previous_year_papers").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/previous-year-papers");
}

export async function savePaperQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const paperId = str(fd, "paper_id");

  const { data: paper } = await supabase
    .from("previous_year_papers")
    .select("subject_id, paper_year")
    .eq("id", paperId)
    .single();
  if (!paper) return;

  let options: Record<string, string> | null = null;
  const a = str(fd, "option_a");
  const b = str(fd, "option_b");
  const c = str(fd, "option_c");
  const d = str(fd, "option_d");
  if (a || b || c || d) {
    options = {};
    if (a) options.A = a;
    if (b) options.B = b;
    if (c) options.C = c;
    if (d) options.D = d;
  }

  const payload = {
    paper_id: paperId,
    subject_id: paper.subject_id,
    chapter_id: opt(fd, "chapter_id"),
    topic_id: opt(fd, "topic_id"),
    question_number: num(fd, "question_number", 1),
    question_text: str(fd, "question_text"),
    question_type: str(fd, "question_type") || "mcq",
    options_json: options,
    marks: num(fd, "marks", 1),
    model_answer: str(fd, "model_answer"),
    marking_points: str(fd, "marking_points"),
    explanation: str(fd, "explanation"),
    difficulty: str(fd, "difficulty") || "medium",
    year: paper.paper_year,
  };
  if (id) await supabase.from("previous_year_questions").update(payload).eq("id", id);
  else await supabase.from("previous_year_questions").insert(payload);
  revalidatePath("/admin/previous-year-papers");
}

export async function deletePaperQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("previous_year_questions").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/previous-year-papers");
}

// ---------- practical tasks ----------
export async function savePracticalTask(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    subject_id: str(fd, "subject_id"),
    title: str(fd, "title"),
    tool: str(fd, "tool") || "writer",
    description: str(fd, "description"),
    steps: str(fd, "steps"),
    expected_outcome: str(fd, "expected_outcome"),
    marks: num(fd, "marks", 5),
    difficulty: str(fd, "difficulty") || "medium",
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("practical_tasks").update(payload).eq("id", id);
  else await supabase.from("practical_tasks").insert(payload);
  revalidatePath("/admin/practical-tasks");
}

export async function deletePracticalTask(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("practical_tasks").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/practical-tasks");
}

// ---------- viva questions ----------
export async function saveVivaQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");
  const payload = {
    subject_id: str(fd, "subject_id"),
    chapter_id: opt(fd, "chapter_id"),
    question: str(fd, "question"),
    model_answer: str(fd, "model_answer"),
    key_points: str(fd, "key_points"),
    difficulty: str(fd, "difficulty") || "medium",
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("viva_questions").update(payload).eq("id", id);
  else await supabase.from("viva_questions").insert(payload);
  revalidatePath("/admin/viva-questions");
}

export async function deleteVivaQuestion(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("viva_questions").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/viva-questions");
}

// ---------- project templates ----------
export async function saveProjectTemplate(fd: FormData) {
  const supabase = await requireAdminUser();
  const id = str(fd, "id");

  // Sections come in as "Title | guidance" lines.
  const sections = str(fd, "format_sections")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), guidance: rest.join("|").trim() };
    });

  const payload = {
    subject_id: str(fd, "subject_id"),
    title: str(fd, "title"),
    description: str(fd, "description"),
    suggested_topics: str(fd, "suggested_topics"),
    format_sections: sections,
    status: str(fd, "status") || "active",
  };
  if (id) await supabase.from("project_templates").update(payload).eq("id", id);
  else await supabase.from("project_templates").insert(payload);
  revalidatePath("/admin/project-templates");
}

export async function deleteProjectTemplate(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("project_templates").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/project-templates");
}

// ---------- settings ----------
export async function saveSetting(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase
    .from("admin_settings")
    .upsert(
      { setting_key: str(fd, "setting_key"), setting_value: str(fd, "setting_value") },
      { onConflict: "setting_key" }
    );
  revalidatePath("/admin/ai-settings");
  revalidatePath("/admin/settings");
}

// ---------- parent-child link management ----------
export async function adminLinkParentChild(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("parent_child_links").upsert(
    {
      parent_user_id: str(fd, "parent_user_id"),
      student_user_id: str(fd, "student_user_id"),
      relationship: str(fd, "relationship") || "guardian",
      status: "active",
    },
    { onConflict: "parent_user_id,student_user_id" }
  );
  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");
}

export async function adminRemoveLink(fd: FormData) {
  const supabase = await requireAdminUser();
  await supabase.from("parent_child_links").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");
}

/** Delete a user account entirely (auth + cascading profile data). */
export async function adminDeleteUser(fd: FormData) {
  await requireAdminUser();
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(str(fd, "user_id"));
  revalidatePath("/admin/students");
  revalidatePath("/admin/parents");
}

// ---------- CSV import ----------
export interface CsvImportResult {
  ok: boolean;
  inserted: number;
  errors: string[];
}

/**
 * Import question bank rows from parsed CSV records. Subject/chapter/topic
 * are resolved by name (case-insensitive); missing chapters/topics are
 * reported as row errors rather than silently created.
 */
export async function importQuestionsCsv(
  rows: Record<string, string>[]
): Promise<CsvImportResult> {
  const supabase = await requireAdminUser();
  const errors: string[] = [];
  let inserted = 0;

  const [{ data: subjects }, { data: chapters }, { data: topics }] = await Promise.all([
    supabase.from("subjects").select("id, name"),
    supabase.from("chapters").select("id, name, subject_id"),
    supabase.from("topics").select("id, name, chapter_id"),
  ]);

  const findSubject = (name: string) =>
    (subjects ?? []).find((s) => s.name.toLowerCase() === name.toLowerCase());
  const findChapter = (name: string, subjectId: string) =>
    (chapters ?? []).find(
      (c) => c.subject_id === subjectId && c.name.toLowerCase() === name.toLowerCase()
    );
  const findTopic = (name: string, chapterId: string) =>
    (topics ?? []).find(
      (t) => t.chapter_id === chapterId && t.name.toLowerCase() === name.toLowerCase()
    );

  const validTypes = [
    "mcq", "true_false", "fill_blank", "short_answer", "long_answer",
    "case_based", "assertion_reason", "numerical", "practical", "viva",
  ];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2; // header is line 1
    const subjectName = (row.subject ?? "").trim();
    const subject = findSubject(subjectName);
    if (!subject) {
      errors.push(`Line ${line}: subject "${subjectName}" not found`);
      continue;
    }

    let chapterId: string | null = null;
    if ((row.chapter ?? "").trim()) {
      const chapter = findChapter(row.chapter.trim(), subject.id);
      if (!chapter) {
        errors.push(`Line ${line}: chapter "${row.chapter}" not found in ${subject.name}`);
        continue;
      }
      chapterId = chapter.id;
    }

    let topicId: string | null = null;
    if ((row.topic ?? "").trim() && chapterId) {
      const topic = findTopic(row.topic.trim(), chapterId);
      if (topic) topicId = topic.id; // topic optional: no hard error
    }

    const qType = (row.question_type ?? "mcq").trim().toLowerCase();
    if (!validTypes.includes(qType)) {
      errors.push(`Line ${line}: invalid question_type "${row.question_type}"`);
      continue;
    }
    if (!(row.question ?? "").trim()) {
      errors.push(`Line ${line}: question text is empty`);
      continue;
    }

    const options: Record<string, string> = {};
    if ((row.option_a ?? "").trim()) options.A = row.option_a.trim();
    if ((row.option_b ?? "").trim()) options.B = row.option_b.trim();
    if ((row.option_c ?? "").trim()) options.C = row.option_c.trim();
    if ((row.option_d ?? "").trim()) options.D = row.option_d.trim();

    const difficulty = ["easy", "medium", "hard"].includes(
      (row.difficulty ?? "").trim().toLowerCase()
    )
      ? row.difficulty.trim().toLowerCase()
      : "medium";

    const { error } = await supabase.from("questions").insert({
      subject_id: subject.id,
      chapter_id: chapterId,
      topic_id: topicId,
      question_type: qType,
      question_text: row.question.trim(),
      options_json: Object.keys(options).length > 0 ? options : null,
      correct_answer: (row.correct_answer ?? "").trim(),
      explanation: (row.explanation ?? "").trim(),
      marks: Number(row.marks) || 1,
      difficulty,
      status: "active",
    });
    if (error) errors.push(`Line ${line}: ${error.message}`);
    else inserted++;
  }

  revalidatePath("/admin/questions");
  return { ok: errors.length === 0, inserted, errors };
}
