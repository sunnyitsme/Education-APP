import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loadTestQuestions, loadWeakTopicQuestions } from "@/lib/testEngine";
import { TestRunner } from "@/components/TestRunner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import type { MockTest } from "@/lib/types";

export default async function MockTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: testRow } = await supabase
    .from("mock_tests")
    .select("*")
    .eq("id", testId)
    .maybeSingle();
  if (!testRow) notFound();
  const test = testRow as MockTest;

  const questions =
    test.test_type === "weak_topic"
      ? await loadWeakTopicQuestions(profile.id, 10)
      : await loadTestQuestions(test);

  if (questions.length === 0) {
    return (
      <EmptyState
        title={
          test.test_type === "weak_topic"
            ? "No weak topics found — nothing to test!"
            : "This test has no questions yet"
        }
        hint={
          test.test_type === "weak_topic"
            ? "Take a few mock tests first; topics where you score below 60% will appear here."
            : "The admin needs to add questions to this test (or to the question bank for random tests)."
        }
        action={<ButtonLink href="/student/mock-tests">Back to mock tests</ButtonLink>}
      />
    );
  }

  return (
    <TestRunner
      mode="mock"
      targetId={test.id}
      title={test.name}
      durationMinutes={test.duration_minutes}
      questions={questions.map((q) => ({
        id: q.id,
        question_type: q.question_type,
        question_text: q.question_text,
        options_json: q.options_json,
        marks: q.testMarks,
        testMarks: q.testMarks,
      }))}
    />
  );
}
