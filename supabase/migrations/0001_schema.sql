-- =============================================================
-- CBSE Class 10 AI Study Assistant - Schema
-- Migration 0001: tables, functions, triggers, indexes
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Helper: random parent link code (8 chars, uppercase)
-- -------------------------------------------------------------
create or replace function public.generate_link_code()
returns text
language sql
volatile
as $$
  select upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- -------------------------------------------------------------
-- profiles (mirrors auth.users, holds role)
-- -------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'student' check (role in ('student', 'parent', 'admin')),
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- student_profiles
-- -------------------------------------------------------------
create table public.student_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.profiles (id) on delete cascade,
  class_name        text not null default 'Class 10',
  board             text not null default 'CBSE',
  medium            text not null default 'English',
  school_name       text,
  academic_year     text not null default '2025-26',
  parent_link_code  text not null unique default public.generate_link_code(),
  daily_study_goal  integer not null default 60, -- minutes per day
  created_at        timestamptz not null default now()
);

-- -------------------------------------------------------------
-- parent_child_links
-- -------------------------------------------------------------
create table public.parent_child_links (
  id               uuid primary key default gen_random_uuid(),
  parent_user_id   uuid not null references public.profiles (id) on delete cascade,
  student_user_id  uuid not null references public.profiles (id) on delete cascade,
  relationship     text not null default 'guardian',
  status           text not null default 'pending' check (status in ('pending', 'approved', 'active')),
  created_at       timestamptz not null default now(),
  unique (parent_user_id, student_user_id)
);

create index idx_pcl_parent on public.parent_child_links (parent_user_id);
create index idx_pcl_student on public.parent_child_links (student_user_id);

-- -------------------------------------------------------------
-- subjects
-- -------------------------------------------------------------
create table public.subjects (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  class_name     text not null default 'Class 10',
  board          text not null default 'CBSE',
  academic_year  text not null default '2025-26',
  description    text not null default '',
  status         text not null default 'active' check (status in ('active', 'inactive')),
  created_at     timestamptz not null default now()
);

-- -------------------------------------------------------------
-- chapters
-- -------------------------------------------------------------
create table public.chapters (
  id               uuid primary key default gen_random_uuid(),
  subject_id       uuid not null references public.subjects (id) on delete cascade,
  chapter_number   integer not null,
  name             text not null,
  description      text not null default '',
  marks_weightage  integer,
  status           text not null default 'active' check (status in ('active', 'inactive')),
  created_at       timestamptz not null default now()
);

create index idx_chapters_subject on public.chapters (subject_id);

-- -------------------------------------------------------------
-- topics
-- -------------------------------------------------------------
create table public.topics (
  id           uuid primary key default gen_random_uuid(),
  chapter_id   uuid not null references public.chapters (id) on delete cascade,
  name         text not null,
  topic_order  integer not null default 1,
  difficulty   text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  status       text not null default 'active' check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now()
);

create index idx_topics_chapter on public.topics (chapter_id);

-- -------------------------------------------------------------
-- study_contents (one row per topic)
-- -------------------------------------------------------------
create table public.study_contents (
  id                    uuid primary key default gen_random_uuid(),
  topic_id              uuid not null unique references public.topics (id) on delete cascade,
  simple_explanation    text not null default '',
  detailed_explanation  text not null default '',
  key_points            text not null default '',
  examples              text not null default '',
  formulae              text not null default '',
  exam_tips             text not null default '',
  common_mistakes       text not null default '',
  created_at            timestamptz not null default now()
);

-- -------------------------------------------------------------
-- questions (question bank)
-- -------------------------------------------------------------
create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid not null references public.subjects (id) on delete cascade,
  chapter_id     uuid references public.chapters (id) on delete set null,
  topic_id       uuid references public.topics (id) on delete set null,
  question_type  text not null default 'mcq' check (question_type in (
                   'mcq', 'true_false', 'fill_blank', 'short_answer', 'long_answer',
                   'case_based', 'assertion_reason', 'numerical', 'practical', 'viva')),
  question_text  text not null,
  options_json   jsonb, -- e.g. {"A": "...", "B": "...", "C": "...", "D": "..."}
  correct_answer text not null default '',
  explanation    text not null default '',
  marks          integer not null default 1,
  difficulty     text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  academic_year  text not null default '2025-26',
  status         text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at     timestamptz not null default now()
);

create index idx_questions_subject on public.questions (subject_id);
create index idx_questions_chapter on public.questions (chapter_id);
create index idx_questions_topic on public.questions (topic_id);
create index idx_questions_type on public.questions (question_type);
create index idx_questions_difficulty on public.questions (difficulty);

-- -------------------------------------------------------------
-- mock_tests
-- -------------------------------------------------------------
create table public.mock_tests (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  subject_id        uuid references public.subjects (id) on delete cascade,
  chapter_id        uuid references public.chapters (id) on delete set null,
  test_type         text not null default 'chapter' check (test_type in (
                      'chapter', 'subject', 'quick10', 'weak_topic', 'full_syllabus',
                      'board_pattern', 'computer_practical', 'viva')),
  generation_type   text not null default 'fixed' check (generation_type in ('fixed', 'random')),
  duration_minutes  integer not null default 30,
  total_marks       integer not null default 20,
  status            text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at        timestamptz not null default now()
);

create index idx_mock_tests_subject on public.mock_tests (subject_id);

-- -------------------------------------------------------------
-- mock_test_questions (fixed tests)
-- -------------------------------------------------------------
create table public.mock_test_questions (
  id              uuid primary key default gen_random_uuid(),
  mock_test_id    uuid not null references public.mock_tests (id) on delete cascade,
  question_id     uuid not null references public.questions (id) on delete cascade,
  question_order  integer not null default 1,
  marks           integer not null default 1,
  unique (mock_test_id, question_id)
);

create index idx_mtq_test on public.mock_test_questions (mock_test_id);

-- -------------------------------------------------------------
-- mock_test_rules (random tests)
-- -------------------------------------------------------------
create table public.mock_test_rules (
  id                      uuid primary key default gen_random_uuid(),
  mock_test_id            uuid not null unique references public.mock_tests (id) on delete cascade,
  difficulty_mix_json     jsonb not null default '{"easy": 30, "medium": 50, "hard": 20}',
  question_type_mix_json  jsonb not null default '{"mcq": 100}',
  question_count          integer not null default 10,
  topic_ids_json          jsonb not null default '[]'
);

-- -------------------------------------------------------------
-- test_attempts
-- -------------------------------------------------------------
create table public.test_attempts (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  mock_test_id        uuid not null references public.mock_tests (id) on delete cascade,
  score               numeric not null default 0,
  total_marks         integer not null default 0,
  percentage          numeric not null default 0,
  correct_count       integer not null default 0,
  wrong_count         integer not null default 0,
  skipped_count       integer not null default 0,
  weak_topics_json    jsonb not null default '[]',
  time_taken_seconds  integer not null default 0,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz
);

create index idx_attempts_student on public.test_attempts (student_id);
create index idx_attempts_test on public.test_attempts (mock_test_id);

-- -------------------------------------------------------------
-- student_answers
-- -------------------------------------------------------------
create table public.student_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.test_attempts (id) on delete cascade,
  question_id     uuid not null references public.questions (id) on delete cascade,
  student_answer  text not null default '',
  correct_answer  text not null default '',
  is_correct      boolean,
  marks_awarded   numeric not null default 0,
  feedback        text not null default ''
);

create index idx_sa_attempt on public.student_answers (attempt_id);

-- -------------------------------------------------------------
-- previous_year_papers
-- -------------------------------------------------------------
create table public.previous_year_papers (
  id                  uuid primary key default gen_random_uuid(),
  subject_id          uuid not null references public.subjects (id) on delete cascade,
  paper_year          integer not null,
  set_number          text not null default '1',
  paper_type          text not null default 'board' check (paper_type in ('board', 'sample', 'compartment', 'pre_board')),
  pdf_url             text,
  marking_scheme_url  text,
  total_marks         integer not null default 80,
  duration_minutes    integer not null default 180,
  status              text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at          timestamptz not null default now()
);

create index idx_pyp_subject on public.previous_year_papers (subject_id);
create index idx_pyp_year on public.previous_year_papers (paper_year);

-- -------------------------------------------------------------
-- previous_year_questions
-- -------------------------------------------------------------
create table public.previous_year_questions (
  id               uuid primary key default gen_random_uuid(),
  paper_id         uuid not null references public.previous_year_papers (id) on delete cascade,
  subject_id       uuid not null references public.subjects (id) on delete cascade,
  chapter_id       uuid references public.chapters (id) on delete set null,
  topic_id         uuid references public.topics (id) on delete set null,
  question_number  integer not null default 1,
  question_text    text not null,
  question_type    text not null default 'mcq' check (question_type in (
                     'mcq', 'true_false', 'fill_blank', 'short_answer', 'long_answer',
                     'case_based', 'assertion_reason', 'numerical', 'practical', 'viva')),
  options_json     jsonb,
  marks            integer not null default 1,
  model_answer     text not null default '',
  marking_points   text not null default '',
  explanation      text not null default '',
  difficulty       text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  year             integer not null
);

create index idx_pyq_paper on public.previous_year_questions (paper_id);
create index idx_pyq_chapter on public.previous_year_questions (chapter_id);
create index idx_pyq_topic on public.previous_year_questions (topic_id);

-- -------------------------------------------------------------
-- previous_year_attempts
-- -------------------------------------------------------------
create table public.previous_year_attempts (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  paper_id            uuid not null references public.previous_year_papers (id) on delete cascade,
  score               numeric not null default 0,
  total_marks         integer not null default 0,
  percentage          numeric not null default 0,
  weak_chapters_json  jsonb not null default '[]',
  time_taken_seconds  integer not null default 0,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz
);

create index idx_pya_student on public.previous_year_attempts (student_id);
create index idx_pya_paper on public.previous_year_attempts (paper_id);

-- -------------------------------------------------------------
-- previous_year_answers
-- -------------------------------------------------------------
create table public.previous_year_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.previous_year_attempts (id) on delete cascade,
  question_id     uuid not null references public.previous_year_questions (id) on delete cascade,
  student_answer  text not null default '',
  is_correct      boolean,
  marks_awarded   numeric not null default 0,
  ai_feedback     text not null default ''
);

create index idx_pyans_attempt on public.previous_year_answers (attempt_id);

-- -------------------------------------------------------------
-- practical_tasks (Computer Applications / IT lab)
-- -------------------------------------------------------------
create table public.practical_tasks (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.subjects (id) on delete cascade,
  title             text not null,
  tool              text not null default 'writer' check (tool in ('writer', 'calc', 'base', 'other')),
  description       text not null default '',
  steps             text not null default '',
  expected_outcome  text not null default '',
  marks             integer not null default 5,
  difficulty        text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  status            text not null default 'active' check (status in ('active', 'inactive')),
  created_at        timestamptz not null default now()
);

create index idx_practical_subject on public.practical_tasks (subject_id);

-- -------------------------------------------------------------
-- practical_attempts
-- -------------------------------------------------------------
create table public.practical_attempts (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  task_id       uuid not null references public.practical_tasks (id) on delete cascade,
  status        text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  notes         text not null default '',
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_practical_attempts_student on public.practical_attempts (student_id);

-- -------------------------------------------------------------
-- viva_questions
-- -------------------------------------------------------------
create table public.viva_questions (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid not null references public.subjects (id) on delete cascade,
  chapter_id    uuid references public.chapters (id) on delete set null,
  question      text not null,
  model_answer  text not null default '',
  key_points    text not null default '',
  difficulty    text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  status        text not null default 'active' check (status in ('active', 'inactive')),
  created_at    timestamptz not null default now()
);

create index idx_viva_subject on public.viva_questions (subject_id);

-- -------------------------------------------------------------
-- viva_attempts
-- -------------------------------------------------------------
create table public.viva_attempts (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.profiles (id) on delete cascade,
  viva_question_id  uuid not null references public.viva_questions (id) on delete cascade,
  student_answer    text not null default '',
  score             numeric,
  max_score         numeric not null default 10,
  feedback          text not null default '',
  missing_points    text not null default '',
  created_at        timestamptz not null default now()
);

create index idx_viva_attempts_student on public.viva_attempts (student_id);

-- -------------------------------------------------------------
-- project_templates
-- -------------------------------------------------------------
create table public.project_templates (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.subjects (id) on delete cascade,
  title             text not null,
  description       text not null default '',
  suggested_topics  text not null default '',
  format_sections   jsonb not null default '[]', -- ordered [{"title": "...", "guidance": "..."}]
  status            text not null default 'active' check (status in ('active', 'inactive')),
  created_at        timestamptz not null default now()
);

-- -------------------------------------------------------------
-- student_progress
-- -------------------------------------------------------------
create table public.student_progress (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid not null references public.profiles (id) on delete cascade,
  subject_id             uuid not null references public.subjects (id) on delete cascade,
  chapter_id             uuid references public.chapters (id) on delete cascade,
  topic_id               uuid references public.topics (id) on delete cascade,
  completion_status      text not null default 'not_started' check (completion_status in (
                           'not_started', 'in_progress', 'completed', 'needs_revision')),
  completion_percentage  numeric not null default 0,
  time_spent_seconds     integer not null default 0,
  accuracy_percentage    numeric,
  last_studied_at        timestamptz not null default now()
);

create index idx_progress_student on public.student_progress (student_id);
create index idx_progress_subject on public.student_progress (subject_id);
create unique index idx_progress_topic_unique
  on public.student_progress (student_id, topic_id) where topic_id is not null;
create unique index idx_progress_chapter_unique
  on public.student_progress (student_id, chapter_id) where topic_id is null and chapter_id is not null;

-- -------------------------------------------------------------
-- ai_doubt_history
-- -------------------------------------------------------------
create table public.ai_doubt_history (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  subject_id   uuid references public.subjects (id) on delete set null,
  chapter_id   uuid references public.chapters (id) on delete set null,
  topic_id     uuid references public.topics (id) on delete set null,
  question     text not null,
  ai_response  text not null default '',
  provider     text not null default 'gemini',
  created_at   timestamptz not null default now()
);

create index idx_ai_history_student on public.ai_doubt_history (student_id);
create index idx_ai_history_created on public.ai_doubt_history (created_at);

-- -------------------------------------------------------------
-- parent_reports
-- -------------------------------------------------------------
create table public.parent_reports (
  id               uuid primary key default gen_random_uuid(),
  parent_user_id   uuid not null references public.profiles (id) on delete cascade,
  student_user_id  uuid not null references public.profiles (id) on delete cascade,
  report_type      text not null default 'weekly',
  period_start     date,
  period_end       date,
  report_json      jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

create index idx_reports_parent on public.parent_reports (parent_user_id);

-- -------------------------------------------------------------
-- admin_settings
-- -------------------------------------------------------------
create table public.admin_settings (
  id             uuid primary key default gen_random_uuid(),
  setting_key    text not null unique,
  setting_value  text not null default ''
);

-- -------------------------------------------------------------
-- Trigger: create profile (and student profile) on signup
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  -- Admin role is never self-assigned at signup; promote via SQL (see README).
  if v_role not in ('student', 'parent') then
    v_role := 'student';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), v_role);

  if v_role = 'student' then
    insert into public.student_profiles (user_id)
    values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- RLS helper functions (security definer avoids recursive RLS)
-- -------------------------------------------------------------
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_parent_of(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_child_links
    where parent_user_id = auth.uid()
      and student_user_id = sid
      and status in ('approved', 'active')
  );
$$;

-- -------------------------------------------------------------
-- Parent linking by code (called by parent from the app)
-- -------------------------------------------------------------
create or replace function public.link_parent_by_code(p_code text, p_relationship text default 'guardian')
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid;
  v_caller_role text;
begin
  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role is distinct from 'parent' then
    return json_build_object('ok', false, 'error', 'Only a parent account can use a link code.');
  end if;

  select user_id into v_student
  from public.student_profiles
  where upper(parent_link_code) = upper(trim(p_code));

  if v_student is null then
    return json_build_object('ok', false, 'error', 'Invalid link code. Please check with your child.');
  end if;

  insert into public.parent_child_links (parent_user_id, student_user_id, relationship, status)
  values (auth.uid(), v_student, coalesce(nullif(trim(p_relationship), ''), 'guardian'), 'active')
  on conflict (parent_user_id, student_user_id)
  do update set status = 'active', relationship = excluded.relationship;

  return json_build_object('ok', true, 'student_user_id', v_student);
end;
$$;
