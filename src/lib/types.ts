// Shared row types matching the Supabase schema (supabase/migrations/0001_schema.sql)

export type Role = "student" | "parent" | "admin";
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "long_answer"
  | "case_based"
  | "assertion_reason"
  | "numerical"
  | "practical"
  | "viva";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "MCQ",
  true_false: "True / False",
  fill_blank: "Fill in the Blanks",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  case_based: "Case-based",
  assertion_reason: "Assertion-Reason",
  numerical: "Numerical",
  practical: "Practical",
  viva: "Viva",
};

export type TestType =
  | "chapter"
  | "subject"
  | "quick10"
  | "weak_topic"
  | "full_syllabus"
  | "board_pattern"
  | "computer_practical"
  | "viva";

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  chapter: "Chapter-wise Test",
  subject: "Subject-wise Test",
  quick10: "Quick 10-Question Test",
  weak_topic: "Weak-Topic Test",
  full_syllabus: "Full Syllabus Test",
  board_pattern: "Board Pattern Test",
  computer_practical: "Computer Practical Test",
  viva: "Viva Test",
};

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  class_name: string;
  board: string;
  medium: string;
  school_name: string | null;
  academic_year: string;
  parent_link_code: string;
  daily_study_goal: number;
  created_at: string;
}

export interface ParentChildLink {
  id: string;
  parent_user_id: string;
  student_user_id: string;
  relationship: string;
  status: "pending" | "approved" | "active";
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  class_name: string;
  board: string;
  academic_year: string;
  description: string;
  status: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  name: string;
  description: string;
  marks_weightage: number | null;
  status: string;
  created_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  topic_order: number;
  difficulty: Difficulty;
  status: string;
  created_at: string;
}

export interface StudyContent {
  id: string;
  topic_id: string;
  simple_explanation: string;
  detailed_explanation: string;
  key_points: string;
  examples: string;
  formulae: string;
  exam_tips: string;
  common_mistakes: string;
  created_at: string;
}

export interface Question {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  topic_id: string | null;
  question_type: QuestionType;
  question_text: string;
  options_json: Record<string, string> | null;
  correct_answer: string;
  explanation: string;
  marks: number;
  difficulty: Difficulty;
  academic_year: string;
  status: string;
  created_at: string;
}

/** A question with answer/explanation stripped, safe to send to the test-taking client. */
export type TestQuestion = Omit<Question, "correct_answer" | "explanation" | "status" | "academic_year" | "created_at">;

export interface MockTest {
  id: string;
  name: string;
  subject_id: string | null;
  chapter_id: string | null;
  test_type: TestType;
  generation_type: "fixed" | "random";
  duration_minutes: number;
  total_marks: number;
  status: string;
  created_at: string;
}

export interface MockTestQuestion {
  id: string;
  mock_test_id: string;
  question_id: string;
  question_order: number;
  marks: number;
}

export interface MockTestRule {
  id: string;
  mock_test_id: string;
  difficulty_mix_json: Record<string, number>;
  question_type_mix_json: Record<string, number>;
  question_count: number;
  topic_ids_json: string[];
}

export interface TestAttempt {
  id: string;
  student_id: string;
  mock_test_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  weak_topics_json: { topic_id: string | null; topic_name: string }[];
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string | null;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean | null;
  marks_awarded: number;
  feedback: string;
}

export interface PreviousYearPaper {
  id: string;
  subject_id: string;
  paper_year: number;
  set_number: string;
  paper_type: string;
  pdf_url: string | null;
  marking_scheme_url: string | null;
  total_marks: number;
  duration_minutes: number;
  status: string;
  created_at: string;
}

export interface PreviousYearQuestion {
  id: string;
  paper_id: string;
  subject_id: string;
  chapter_id: string | null;
  topic_id: string | null;
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  options_json: Record<string, string> | null;
  marks: number;
  model_answer: string;
  marking_points: string;
  explanation: string;
  difficulty: Difficulty;
  year: number;
}

export interface PreviousYearAttempt {
  id: string;
  student_id: string;
  paper_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  weak_chapters_json: { chapter_id: string | null; chapter_name: string }[];
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string | null;
}

export interface PreviousYearAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer: string;
  is_correct: boolean | null;
  marks_awarded: number;
  ai_feedback: string;
}

export interface PracticalTask {
  id: string;
  subject_id: string;
  title: string;
  tool: "writer" | "calc" | "base" | "other";
  description: string;
  steps: string;
  expected_outcome: string;
  marks: number;
  difficulty: Difficulty;
  status: string;
  created_at: string;
}

export interface PracticalAttempt {
  id: string;
  student_id: string;
  task_id: string;
  status: "in_progress" | "completed";
  notes: string;
  completed_at: string | null;
  created_at: string;
}

export interface VivaQuestion {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  question: string;
  model_answer: string;
  key_points: string;
  difficulty: Difficulty;
  status: string;
  created_at: string;
}

export interface VivaAttempt {
  id: string;
  student_id: string;
  viva_question_id: string;
  student_answer: string;
  score: number | null;
  max_score: number;
  feedback: string;
  missing_points: string;
  created_at: string;
}

export interface ProjectTemplate {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  suggested_topics: string;
  format_sections: { title: string; guidance: string }[];
  status: string;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  subject_id: string;
  chapter_id: string | null;
  topic_id: string | null;
  completion_status: "not_started" | "in_progress" | "completed" | "needs_revision";
  completion_percentage: number;
  time_spent_seconds: number;
  accuracy_percentage: number | null;
  last_studied_at: string;
}

export interface AiDoubtHistory {
  id: string;
  student_id: string;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  question: string;
  ai_response: string;
  provider: string;
  created_at: string;
}

export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string;
}
