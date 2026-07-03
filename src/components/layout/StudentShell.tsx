"use client";

import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  ScrollText,
  RefreshCcw,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { SidebarShell } from "@/components/layout/SidebarShell";
import type { ReactNode } from "react";

const items = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/subjects", label: "Subjects", icon: BookOpen },
  { href: "/student/ai-tutor", label: "AI Tutor", icon: Sparkles },
  { href: "/student/mock-tests", label: "Mock Tests", icon: ClipboardCheck },
  { href: "/student/previous-year-papers", label: "Previous Year Papers", icon: ScrollText },
  { href: "/student/revision", label: "Revision", icon: RefreshCcw },
  { href: "/student/progress", label: "Progress", icon: TrendingUp },
  { href: "/student/profile", label: "Profile", icon: UserCircle },
];

export function StudentShell({ userName, children }: { userName: string; children: ReactNode }) {
  return (
    <SidebarShell navItems={items} roleLabel="Student · Class 10 CBSE" userName={userName}>
      {children}
    </SidebarShell>
  );
}
