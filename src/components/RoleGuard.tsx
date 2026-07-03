import { requireRole } from "@/lib/auth";
import type { Role } from "@/lib/types";
import type { ReactNode } from "react";

/**
 * Server component gate: renders children only when the signed-in user has
 * the given role; otherwise redirects (handled inside requireRole).
 * Used by the role layouts; can also wrap individual pages.
 */
export async function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  await requireRole(role);
  return <>{children}</>;
}
