import { requireRole } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import type { ReactNode } from "react";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("student");
  return <StudentShell userName={profile.full_name || profile.email}>{children}</StudentShell>;
}
