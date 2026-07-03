import {
  Users,
  UserCheck,
  BookOpen,
  BookMarked,
  HelpCircle,
  ClipboardCheck,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { DashboardStatCard } from "@/components/ui/DashboardStatCard";
import { formatDateTime, pct, scoreColor } from "@/lib/utils";

export default async function AdminDashboard() {
  await requireRole("admin");
  const supabase = await createClient();

  const head = { count: "exact" as const, head: true };
  const [
    { count: students },
    { count: parents },
    { count: subjects },
    { count: chapters },
    { count: questions },
    { count: mockTests },
    { count: papers },
    { count: aiDoubts },
    { data: recentAttempts },
  ] = await Promise.all([
    supabase.from("profiles").select("id", head).eq("role", "student"),
    supabase.from("profiles").select("id", head).eq("role", "parent"),
    supabase.from("subjects").select("id", head),
    supabase.from("chapters").select("id", head),
    supabase.from("questions").select("id", head),
    supabase.from("mock_tests").select("id", head),
    supabase.from("previous_year_papers").select("id", head),
    supabase.from("ai_doubt_history").select("id", head),
    supabase
      .from("test_attempts")
      .select("*, profiles(full_name, email), mock_tests(name)")
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Content, accounts and activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard label="Students" value={students ?? 0} icon={Users} tone="indigo" />
        <DashboardStatCard label="Parents" value={parents ?? 0} icon={UserCheck} tone="sky" />
        <DashboardStatCard label="Subjects" value={subjects ?? 0} icon={BookOpen} tone="emerald" />
        <DashboardStatCard label="Chapters" value={chapters ?? 0} icon={BookMarked} tone="emerald" />
        <DashboardStatCard label="Questions" value={questions ?? 0} icon={HelpCircle} tone="amber" />
        <DashboardStatCard label="Mock tests" value={mockTests ?? 0} icon={ClipboardCheck} tone="amber" />
        <DashboardStatCard label="Previous year papers" value={papers ?? 0} icon={ScrollText} tone="rose" />
        <DashboardStatCard label="AI doubts asked" value={aiDoubts ?? 0} icon={Sparkles} tone="indigo" />
      </div>

      <Card>
        <CardTitle>Recent test attempts</CardTitle>
        {(recentAttempts ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No attempts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {(recentAttempts ?? []).map((a) => {
              const student = (a as unknown as { profiles: { full_name: string; email: string } | null }).profiles;
              const test = (a as unknown as { mock_tests: { name: string } | null }).mock_tests;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{student?.full_name || student?.email}</p>
                    <p className="text-xs text-slate-400">
                      {test?.name} · {formatDateTime(a.submitted_at)}
                    </p>
                  </div>
                  <span className={`font-semibold ${scoreColor(Number(a.percentage))}`}>
                    {pct(Number(a.percentage))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
