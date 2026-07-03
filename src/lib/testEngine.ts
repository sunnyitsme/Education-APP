import { createClient } from "@/lib/supabase/server";
import type { MockTest, MockTestRule, Question, TestQuestion } from "@/lib/types";

export interface LoadedTestQuestion extends TestQuestion {
  /** Marks for THIS test (fixed tests can override question marks). */
  testMarks: number;
  order: number;
}

function strip(q: Question, marks: number, order: number): LoadedTestQuestion {
  return {
    id: q.id,
    subject_id: q.subject_id,
    chapter_id: q.chapter_id,
    topic_id: q.topic_id,
    question_type: q.question_type,
    question_text: q.question_text,
    options_json: q.options_json,
    marks: q.marks,
    difficulty: q.difficulty,
    testMarks: marks,
    order,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Load the questions a student will see for a test, WITHOUT correct answers
 * or explanations. Fixed tests load their exact question list; random tests
 * sample the question bank according to the test's rules.
 */
export async function loadTestQuestions(test: MockTest): Promise<LoadedTestQuestion[]> {
  const supabase = await createClient();

  if (test.generation_type === "fixed") {
    const { data } = await supabase
      .from("mock_test_questions")
      .select("question_order, marks, questions(*)")
      .eq("mock_test_id", test.id)
      .order("question_order");
    return (data ?? [])
      .filter((r) => r.questions)
      .map((r, i) =>
        strip(r.questions as unknown as Question, r.marks, r.question_order ?? i + 1)
      );
  }

  // Random test: apply rules.
  const { data: ruleRow } = await supabase
    .from("mock_test_rules")
    .select("*")
    .eq("mock_test_id", test.id)
    .maybeSingle();

  const rule = ruleRow as MockTestRule | null;
  const count = rule?.question_count ?? 10;

  let query = supabase.from("questions").select("*").eq("status", "active");
  if (test.subject_id) query = query.eq("subject_id", test.subject_id);
  if (test.chapter_id) query = query.eq("chapter_id", test.chapter_id);
  const topicIds = (rule?.topic_ids_json ?? []) as string[];
  if (topicIds.length > 0) query = query.in("topic_id", topicIds);

  const { data: pool } = await query.limit(500);
  const questions = (pool ?? []) as Question[];
  if (questions.length === 0) return [];

  // Difficulty mix: {"easy": 30, "medium": 50, "hard": 20} (percentages).
  const mix = rule?.difficulty_mix_json ?? {};
  const typeMix = rule?.question_type_mix_json ?? {};
  const picked: Question[] = [];
  const used = new Set<string>();

  const byDifficulty = (d: string) => shuffle(questions.filter((q) => q.difficulty === d));

  for (const [difficulty, percent] of Object.entries(mix)) {
    const want = Math.round((Number(percent) / 100) * count);
    for (const q of byDifficulty(difficulty)) {
      if (picked.filter((p) => p.difficulty === difficulty).length >= want) break;
      if (!used.has(q.id)) {
        // Respect the type mix as a soft preference when specified.
        const typeKeys = Object.keys(typeMix);
        if (typeKeys.length > 0 && !(q.question_type in typeMix)) continue;
        picked.push(q);
        used.add(q.id);
      }
    }
  }

  // Top up (or fall back entirely) with random remaining questions.
  for (const q of shuffle(questions)) {
    if (picked.length >= count) break;
    if (!used.has(q.id)) {
      picked.push(q);
      used.add(q.id);
    }
  }

  return shuffle(picked)
    .slice(0, count)
    .map((q, i) => strip(q, q.marks, i + 1));
}

/**
 * Build an on-the-fly "weak topic" revision test from topics the student is
 * struggling with. Returns stripped questions ready for the test runner.
 */
export async function loadWeakTopicQuestions(
  studentId: string,
  count = 10
): Promise<LoadedTestQuestion[]> {
  const supabase = await createClient();
  const { data: weak } = await supabase
    .from("student_progress")
    .select("topic_id")
    .eq("student_id", studentId)
    .not("topic_id", "is", null)
    .or("completion_status.eq.needs_revision,accuracy_percentage.lt.60");

  const topicIds = (weak ?? []).map((w) => w.topic_id).filter(Boolean) as string[];
  if (topicIds.length === 0) return [];

  const { data: pool } = await supabase
    .from("questions")
    .select("*")
    .eq("status", "active")
    .in("topic_id", topicIds)
    .limit(200);

  return shuffle((pool ?? []) as Question[])
    .slice(0, count)
    .map((q, i) => strip(q, q.marks, i + 1));
}
