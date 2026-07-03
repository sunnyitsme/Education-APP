# CBSE Class 10 AI Study Assistant

A personal-use study assistant for one CBSE Class 10 student and one parent.
The student studies subject by subject, chapter by chapter (NCERT/CBSE
curriculum), asks AI doubts, practises questions, takes mock tests, solves
previous year papers and tracks progress. The parent logs in separately and
sees read-only progress. An admin manages the syllabus, question bank, tests
and papers.

This is intentionally **not** a commercial product: no payments, subscriptions,
school licences, chat rooms, leaderboards or teacher modules.

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Frontend   | Next.js 16 (App Router) + React 19 + TypeScript    |
| Styling    | Tailwind CSS **4.3.2** (see note below)             |
| Database   | Supabase PostgreSQL                                 |
| Auth       | Supabase Auth (email + password, role based)        |
| AI         | Google Gemini API (free tier), server-side only     |
| Charts     | Recharts                                            |
| Icons      | Lucide React                                        |
| Hosting    | Vercel                                              |

> **Tailwind version note:** the task asked for Tailwind CSS 4.3. `npm install
> tailwindcss@^4` resolved to **4.3.2** at build time, which satisfies that
> requirement exactly. If a newer 4.x is installed later it remains compatible —
> the project uses the standard v4 `@import "tailwindcss"` + `@theme` setup with
> the `@tailwindcss/postcss` plugin (see `src/app/globals.css` and
> `postcss.config.mjs`).

## Project layout

```
supabase/
  migrations/0001_schema.sql   # all 26 tables, FKs, indexes, triggers, functions
  migrations/0002_rls.sql      # Row Level Security policies for every table
  seed.sql                     # subjects, chapters, topics, 60 questions, tests, paper, IT content
src/
  middleware.ts                # session refresh + auth gate for /student /parent /admin
  lib/
    supabase/                  # browser / server / service-role clients
    ai/gemini.ts               # Gemini service (tutor, answer checking, viva scoring)
    actions/                   # server actions: study, tests, papers, IT, parent, admin CRUD
    data.ts, testEngine.ts     # progress rollups, random test generation
  components/                  # Button, Card, ProgressBar, QuestionRenderer, TestTimer, ...
  app/
    student/...                # 14 student pages + IT practical/viva/project sub-pages
    parent/...                 # 8 parent pages
    admin/...                  # 17 admin pages
    api/ai/tutor/route.ts      # AI tutor endpoint with daily limit
```

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_rls.sql`
   3. `supabase/seed.sql` (optional but recommended — see “Seeding data”)
3. In **Authentication → Providers → Email**, decide about **Confirm email**:
   - For a personal app the simplest is to **disable** email confirmation so
     signups work instantly. If you leave it on, users must click the
     confirmation link before signing in (the signup page tells them).
4. Copy the project URL and keys from **Project Settings → API**.

> Using the Supabase CLI instead? `supabase db reset` applies `migrations/`
> and `seed.sql` automatically.

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Grades tests (so students can’t edit results), reads AI settings, deletes accounts |
| `GEMINI_API_KEY` | Optional. From [Google AI Studio](https://aistudio.google.com/apikey), free tier |
| `AI_PROVIDER` | `gemini` (set to `none` to force-disable AI) |

`GEMINI_API_KEY` is **never** sent to the browser — only the server route
handler and server actions import the Gemini service.

### 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 4. Create the first accounts

1. **Student** — click *Create account* on the home page, choose **Student**.
   A student profile with a **parent link code** is created automatically.
2. **Parent** — sign up again (different email), choose **Parent**.
3. **Admin** — sign up as a student (or parent) with your admin email, then
   promote it in the Supabase SQL editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

   Sign out and back in; you’ll land on `/admin/dashboard`.
   (Roles chosen at signup are clamped to student/parent — admin can only be
   granted via SQL, so nobody can self-register as admin.)

### 5. Link parent and child

1. The student opens **Profile** and reads the 8-character **parent link code**.
2. The parent opens **Profile → Link your child**, enters the code, picks the
   relationship, done. The parent dashboard now shows the child’s data.
3. Admin alternative: **Admin → Parents → Manually link a parent to a student**
   (and unlink from either the Students or Parents page).

Parents get **read-only** access enforced by database Row Level Security: they
can see linked-child progress/results but cannot insert, update or delete any
study record.

## Seeding data

`supabase/seed.sql` is idempotent (fixed UUIDs + `on conflict do nothing`) and adds:

- 6 subjects: Mathematics, Science, Social Science, English, Hindi,
  Computer Applications / IT
- Realistic NCERT chapter lists (14 Maths, 13 Science chapters, …) and sample
  topics with full study content for several topics
- 10 sample questions per subject (60 total, mixed types)
- 1 **fixed** Science mock test (10 questions) and 1 **random** Maths test template
- 1 sample Science previous year paper (2024) with model answers and marking points
- Computer Applications structure per CBSE IT Code 402: Part A Employability
  Skills units, Part B subject units, 3 practical tasks (Writer/Calc/Base),
  5 viva questions, 1 project template
- Admin settings: `ai_enabled=true`, `ai_daily_limit=20`, `ai_model=gemini-2.5-flash`

Run it in the SQL editor (or `supabase db reset`). Without seed data the app
still works — every page shows a friendly empty state telling the admin what to add.

## Using the admin panel

Everything lives in the left sidebar at `/admin`:

- **Subjects / Chapters / Topics** — the syllabus tree. Chapters can carry a
  board marks weightage; topics have difficulty and order.
- **Study Content** — one sheet per topic: simple + detailed explanation, key
  points, examples, formulae, exam tips, common mistakes (one item per line
  for list fields).
- **Question Bank** — all 10 question types with options, correct answer,
  explanation, marks, difficulty, status. Filter by subject/type.
- **Mock Tests** — create *fixed* tests (then click **Questions** to hand-pick
  from the bank with per-question marks/order) or *random* tests (difficulty
  mix %, type mix, question count; questions are sampled at attempt time).
- **Previous Year Papers** — paper metadata (year, set, type, PDF/marking
  scheme URLs, marks, duration), then **Questions** to add each question with
  model answer, marking points, explanation and chapter/topic mapping.
- **Practical Tasks / Viva Questions / Project Templates** — the Computer
  Applications Part C content.
- **Students / Parents** — accounts, link codes, manual linking/unlinking,
  account deletion.
- **Reports** — recent attempts and AI usage across students.
- **AI Settings** — enable/disable tutor, per-student daily limit, model name.
- **CSV Import** — bulk questions (see below).

### CSV import format

Header row required, columns:

```
subject,chapter,topic,question_type,question,option_a,option_b,option_c,option_d,correct_answer,explanation,marks,difficulty
```

Subject/chapter/topic are matched by **name** (case-insensitive). Rows with an
unknown subject or chapter are listed as errors and skipped; a missing topic is
allowed (question is stored without topic mapping). A sample CSV is shown on
the import page.

## How mock tests work

- **Fixed tests** always serve the exact questions the admin picked, in order,
  with the admin’s marks.
- **Random tests** sample the question bank at attempt time using the rules
  row (difficulty mix, type mix, count, optional topic list) scoped to the
  test’s subject/chapter — so every attempt is a fresh paper.
- **Quick 10** and **Weak-topic** tests are generated on the fly from the
  student’s Mock Tests page (weak topics = accuracy < 60% or flagged
  needs-revision).
- During the test: countdown timer (auto-submit at zero), question palette,
  next/previous, mark-for-review, answered/unanswered indicators.
- Grading happens **server-side with the service role**, so students cannot
  tamper with results: objective types (MCQ, true/false, fill-in, numerical,
  assertion-reason) are compared after normalisation; written answers are
  approximately marked by Gemini when configured, otherwise shown with the
  model answer for self-assessment.
- The result page shows score, percentage, correct/wrong/skipped, time taken,
  per-question explanation and feedback, detected weak topics with one-click
  revision links, retake and try-similar-question buttons. Weak topics also
  update the student’s progress records (needs revision).

## How previous year papers work

- Students solve full papers year-wise under **Previous Year Papers** (timer,
  same runner as mock tests). Chapter-wise and topic-wise PYQs appear on each
  chapter page via the chapter/topic mapping.
- MCQs auto-check. Written answers are compared with the model answer +
  marking points by Gemini, which returns approximate marks, missing points
  and an improved answer — always labelled as *guidance, not official board
  marking*. Without an API key, written answers get the model answer to
  self-assess.
- The result shows score, model answers, marking points, explanations, weak
  chapters and suggested revision links; weak chapters are flagged in progress.

## How the Gemini API is used

All AI calls run **server-side** (`src/lib/ai/gemini.ts`):

1. **AI Tutor** (`POST /api/ai/tutor`) — answers doubts like a Class 10 CBSE
   teacher: one-line answer, steps, example, exam tip; English or simple
   Hindi; refuses non-study questions. Enforces the admin-set daily limit and
   saves every Q&A to `ai_doubt_history`.
2. **Written answer checking** — mock tests and papers, returns JSON with
   approximate marks, missing points, feedback and an improved answer.
3. **Viva scoring** — scores a spoken-style answer out of 10 with missing
   points and the model answer.

If `GEMINI_API_KEY` is missing the app **does not break**: the tutor page shows
a friendly “not configured” note, and grading falls back to model-answer
self-assessment. Static study content, mock tests and papers work fully.

### Safety and privacy note

**No child personal data is ever sent to the AI.** Prompts contain only the
selected subject/chapter/topic names and the study question or answer text.
The student’s name, email, school and profile details never leave Supabase.
The system prompt also instructs the model never to ask for personal details.
AI marking is clearly labelled as approximate guidance, not official board
marking.

## Security model (RLS)

- Students can read curriculum content and **only their own** progress,
  attempts, answers and AI history. Attempt rows are written by the server
  (service role) and are not updatable by students.
- Parents can **read** linked-child data only (`parent_child_links` with an
  active/approved status), and can never write study records.
- Admins manage everything (checked via a `security definer` role lookup).
- No anonymous/public access to any private data.
- Parent linking runs through the `link_parent_by_code()` database function so
  the link code lookup never exposes student rows to unlinked parents.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com): **New Project → Import** the repo
   (framework auto-detects Next.js; no special build settings needed).
3. Add the environment variables from `.env.example` under
   **Settings → Environment Variables** (all of them, including
   `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY`).
4. Deploy. Then in Supabase **Authentication → URL Configuration**, set the
   site URL to your Vercel domain.

## Scripts

```bash
npm run dev     # local development
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
