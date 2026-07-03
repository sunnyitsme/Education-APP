import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  return <AdminShell userName={profile.full_name || profile.email}>{children}</AdminShell>;
}
