-- =============================================================
-- CBSE Class 10 AI Study Assistant - Row Level Security
-- Migration 0002: enable RLS + policies for every table
--
-- Rules:
--   * Students read/write only their own progress, attempts, AI history.
--   * Parents read only linked child data (never write it).
--   * Admin manages everything.
--   * No public (anon) access to private student data.
-- =============================================================

-- ---------- profiles ----------
alter table public.profiles enable row level security;

create policy "profiles: own read" on public.profiles
  for select using (id = auth.uid());
create policy "profiles: parent reads linked child" on public.profiles
  for select using (public.is_parent_of(id));
create policy "profiles: admin all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "profiles: own update name" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role()); -- cannot change own role

-- ---------- student_profiles ----------
alter table public.student_profiles enable row level security;

create policy "student_profiles: own read" on public.student_profiles
  for select using (user_id = auth.uid());
create policy "student_profiles: parent reads linked child" on public.student_profiles
  for select using (public.is_parent_of(user_id));
create policy "student_profiles: own update" on public.student_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "student_profiles: admin all" on public.student_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- parent_child_links ----------
alter table public.parent_child_links enable row level security;

create policy "links: parent reads own" on public.parent_child_links
  for select using (parent_user_id = auth.uid());
create policy "links: student reads own" on public.parent_child_links
  for select using (student_user_id = auth.uid());
create policy "links: admin all" on public.parent_child_links
  for all using (public.is_admin()) with check (public.is_admin());
-- Parents create links only through link_parent_by_code() (security definer).

-- ---------- curriculum & content: any signed-in user reads, admin writes ----
alter table public.subjects enable row level security;
create policy "subjects: authenticated read" on public.subjects
  for select using (auth.uid() is not null);
create policy "subjects: admin all" on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.chapters enable row level security;
create policy "chapters: authenticated read" on public.chapters
  for select using (auth.uid() is not null);
create policy "chapters: admin all" on public.chapters
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.topics enable row level security;
create policy "topics: authenticated read" on public.topics
  for select using (auth.uid() is not null);
create policy "topics: admin all" on public.topics
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.study_contents enable row level security;
create policy "study_contents: authenticated read" on public.study_contents
  for select using (auth.uid() is not null);
create policy "study_contents: admin all" on public.study_contents
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.questions enable row level security;
create policy "questions: authenticated read" on public.questions
  for select using (auth.uid() is not null);
create policy "questions: admin all" on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.mock_tests enable row level security;
create policy "mock_tests: authenticated read" on public.mock_tests
  for select using (auth.uid() is not null);
create policy "mock_tests: admin all" on public.mock_tests
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.mock_test_questions enable row level security;
create policy "mtq: authenticated read" on public.mock_test_questions
  for select using (auth.uid() is not null);
create policy "mtq: admin all" on public.mock_test_questions
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.mock_test_rules enable row level security;
create policy "rules: authenticated read" on public.mock_test_rules
  for select using (auth.uid() is not null);
create policy "rules: admin all" on public.mock_test_rules
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.previous_year_papers enable row level security;
create policy "pyp: authenticated read" on public.previous_year_papers
  for select using (auth.uid() is not null);
create policy "pyp: admin all" on public.previous_year_papers
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.previous_year_questions enable row level security;
create policy "pyq: authenticated read" on public.previous_year_questions
  for select using (auth.uid() is not null);
create policy "pyq: admin all" on public.previous_year_questions
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.practical_tasks enable row level security;
create policy "practical_tasks: authenticated read" on public.practical_tasks
  for select using (auth.uid() is not null);
create policy "practical_tasks: admin all" on public.practical_tasks
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.viva_questions enable row level security;
create policy "viva_questions: authenticated read" on public.viva_questions
  for select using (auth.uid() is not null);
create policy "viva_questions: admin all" on public.viva_questions
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.project_templates enable row level security;
create policy "project_templates: authenticated read" on public.project_templates
  for select using (auth.uid() is not null);
create policy "project_templates: admin all" on public.project_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- test_attempts ----------
alter table public.test_attempts enable row level security;

create policy "attempts: student own read" on public.test_attempts
  for select using (student_id = auth.uid());
create policy "attempts: student own insert" on public.test_attempts
  for insert with check (student_id = auth.uid());
create policy "attempts: parent reads linked child" on public.test_attempts
  for select using (public.is_parent_of(student_id));
create policy "attempts: admin all" on public.test_attempts
  for all using (public.is_admin()) with check (public.is_admin());
-- No student update/delete: results are immutable once graded (grading uses
-- the service role on the server). Parents can never write.

-- ---------- student_answers ----------
alter table public.student_answers enable row level security;

create policy "answers: student own read" on public.student_answers
  for select using (exists (
    select 1 from public.test_attempts a
    where a.id = attempt_id and a.student_id = auth.uid()));
create policy "answers: parent reads linked child" on public.student_answers
  for select using (exists (
    select 1 from public.test_attempts a
    where a.id = attempt_id and public.is_parent_of(a.student_id)));
create policy "answers: admin all" on public.student_answers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- previous_year_attempts ----------
alter table public.previous_year_attempts enable row level security;

create policy "pya: student own read" on public.previous_year_attempts
  for select using (student_id = auth.uid());
create policy "pya: student own insert" on public.previous_year_attempts
  for insert with check (student_id = auth.uid());
create policy "pya: parent reads linked child" on public.previous_year_attempts
  for select using (public.is_parent_of(student_id));
create policy "pya: admin all" on public.previous_year_attempts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- previous_year_answers ----------
alter table public.previous_year_answers enable row level security;

create policy "pyans: student own read" on public.previous_year_answers
  for select using (exists (
    select 1 from public.previous_year_attempts a
    where a.id = attempt_id and a.student_id = auth.uid()));
create policy "pyans: parent reads linked child" on public.previous_year_answers
  for select using (exists (
    select 1 from public.previous_year_attempts a
    where a.id = attempt_id and public.is_parent_of(a.student_id)));
create policy "pyans: admin all" on public.previous_year_answers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- practical_attempts ----------
alter table public.practical_attempts enable row level security;

create policy "practical_attempts: student own" on public.practical_attempts
  for select using (student_id = auth.uid());
create policy "practical_attempts: student insert" on public.practical_attempts
  for insert with check (student_id = auth.uid());
create policy "practical_attempts: student update own" on public.practical_attempts
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "practical_attempts: parent reads linked child" on public.practical_attempts
  for select using (public.is_parent_of(student_id));
create policy "practical_attempts: admin all" on public.practical_attempts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- viva_attempts ----------
alter table public.viva_attempts enable row level security;

create policy "viva_attempts: student own read" on public.viva_attempts
  for select using (student_id = auth.uid());
create policy "viva_attempts: student insert" on public.viva_attempts
  for insert with check (student_id = auth.uid());
create policy "viva_attempts: parent reads linked child" on public.viva_attempts
  for select using (public.is_parent_of(student_id));
create policy "viva_attempts: admin all" on public.viva_attempts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- student_progress ----------
alter table public.student_progress enable row level security;

create policy "progress: student own read" on public.student_progress
  for select using (student_id = auth.uid());
create policy "progress: student own insert" on public.student_progress
  for insert with check (student_id = auth.uid());
create policy "progress: student own update" on public.student_progress
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "progress: parent reads linked child" on public.student_progress
  for select using (public.is_parent_of(student_id));
create policy "progress: admin all" on public.student_progress
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- ai_doubt_history ----------
alter table public.ai_doubt_history enable row level security;

create policy "ai_history: student own read" on public.ai_doubt_history
  for select using (student_id = auth.uid());
create policy "ai_history: student own insert" on public.ai_doubt_history
  for insert with check (student_id = auth.uid());
create policy "ai_history: parent reads linked child" on public.ai_doubt_history
  for select using (public.is_parent_of(student_id));
create policy "ai_history: admin all" on public.ai_doubt_history
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- parent_reports ----------
alter table public.parent_reports enable row level security;

create policy "reports: parent reads own" on public.parent_reports
  for select using (parent_user_id = auth.uid() and public.is_parent_of(student_user_id));
create policy "reports: admin all" on public.parent_reports
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- admin_settings ----------
alter table public.admin_settings enable row level security;

create policy "settings: admin all" on public.admin_settings
  for all using (public.is_admin()) with check (public.is_admin());
-- Server-side code reads settings with the service role key when needed
-- (e.g. the AI daily limit), so no student/parent read policy is required.
