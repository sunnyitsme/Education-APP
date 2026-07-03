import { requireRole } from "@/lib/auth";
import { ParentShell } from "@/components/layout/ParentShell";
import type { ReactNode } from "react";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("parent");
  return <ParentShell userName={profile.full_name || profile.email}>{children}</ParentShell>;
}
