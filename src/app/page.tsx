import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, BookOpen, Sparkles, ClipboardCheck, Users } from "lucide-react";
import { getProfile, dashboardPath } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getProfile();
  if (profile) redirect(dashboardPath(profile.role));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 inline-flex rounded-2xl bg-indigo-600 p-4 shadow-lg shadow-indigo-200">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          CBSE Class 10 Study Assistant
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Study chapter by chapter, ask AI doubts, practise questions, take mock tests and solve
          previous year papers — with a separate view for parents to track progress.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          {[
            { icon: BookOpen, title: "NCERT-based study", text: "Subjects, chapters and topics with key points, examples and exam tips." },
            { icon: Sparkles, title: "AI Tutor", text: "Ask doubts and get simple, exam-focused answers like a Class 10 teacher." },
            { icon: ClipboardCheck, title: "Mock tests & papers", text: "Fixed and random tests, previous year papers with explanations." },
            { icon: Users, title: "Parent view", text: "Parents link with a code and see progress, scores and weak topics." },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <f.icon className="h-5 w-5 shrink-0 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
