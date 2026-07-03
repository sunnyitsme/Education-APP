"use client";

import {
  LayoutDashboard,
  TrendingUp,
  ClipboardCheck,
  ScrollText,
  AlertTriangle,
  Clock,
  FileBarChart,
  UserCircle,
} from "lucide-react";
import { SidebarShell } from "@/components/layout/SidebarShell";
import type { ReactNode } from "react";

const items = [
  { href: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parent/progress", label: "Progress", icon: TrendingUp },
  { href: "/parent/mock-results", label: "Mock Test Results", icon: ClipboardCheck },
  { href: "/parent/previous-year-results", label: "Paper Results", icon: ScrollText },
  { href: "/parent/weak-areas", label: "Weak Areas", icon: AlertTriangle },
  { href: "/parent/study-time", label: "Study Time", icon: Clock },
  { href: "/parent/reports", label: "Reports", icon: FileBarChart },
  { href: "/parent/profile", label: "Profile", icon: UserCircle },
];

export function ParentShell({ userName, children }: { userName: string; children: ReactNode }) {
  return (
    <SidebarShell navItems={items} roleLabel="Parent" userName={userName}>
      {children}
    </SidebarShell>
  );
}
