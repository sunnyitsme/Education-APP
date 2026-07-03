import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

export function dashboardPath(role: Role): string {
  return `/${role}/dashboard`;
}

/** Current user's profile, or null when signed out. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

/**
 * Server-side role gate used by the /student, /parent and /admin layouts.
 * Redirects to /login when signed out, or to the user's own dashboard when
 * they try to open another role's area.
 */
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(dashboardPath(profile.role));
  return profile;
}

/** For parents: linked children profiles (active/approved links only). */
export async function getLinkedChildren(parentUserId: string) {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("parent_child_links")
    .select("student_user_id, relationship, status")
    .eq("parent_user_id", parentUserId)
    .in("status", ["approved", "active"]);

  if (!links || links.length === 0) return [];

  const ids = links.map((l) => l.student_user_id);
  const { data: children } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);

  return (children ?? []) as Pick<Profile, "id" | "full_name" | "email">[];
}
