"use client";

import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  ListTree,
  FileText,
  HelpCircle,
  ClipboardCheck,
  ScrollText,
  Wrench,
  Mic,
  FolderKanban,
  Users,
  UserCheck,
  FileBarChart,
  Sparkles,
  Upload,
  Settings,
} from "lucide-react";
import { SidebarShell } from "@/components/layout/SidebarShell";
import type { ReactNode } from "react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/chapters", label: "Chapters", icon: BookMarked },
  { href: "/admin/topics", label: "Topics", icon: ListTree },
  { href: "/admin/study-content", label: "Study Content", icon: FileText },
  { href: "/admin/questions", label: "Question Bank", icon: HelpCircle },
  { href: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardCheck },
  { href: "/admin/previous-year-papers", label: "Previous Year Papers", icon: ScrollText },
  { href: "/admin/practical-tasks", label: "Practical Tasks", icon: Wrench },
  { href: "/admin/viva-questions", label: "Viva Questions", icon: Mic },
  { href: "/admin/project-templates", label: "Project Templates", icon: FolderKanban },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/parents", label: "Parents", icon: UserCheck },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/ai-settings", label: "AI Settings", icon: Sparkles },
  { href: "/admin/import", label: "CSV Import", icon: Upload },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ userName, children }: { userName: string; children: ReactNode }) {
  return (
    <SidebarShell navItems={items} roleLabel="Admin" userName={userName}>
      {children}
    </SidebarShell>
  );
}
