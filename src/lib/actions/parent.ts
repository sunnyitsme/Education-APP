"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Parent enters the child's link code to connect the two accounts. */
export async function linkChildByCode(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "guardian");
  if (!code) return { ok: false, error: "Please enter a link code." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("link_parent_by_code", {
    p_code: code,
    p_relationship: relationship,
  });

  if (error) return { ok: false, error: error.message };
  const result = data as unknown as { ok: boolean; error?: string };
  if (!result?.ok) return { ok: false, error: result?.error ?? "Could not link." };

  revalidatePath("/parent/dashboard");
  revalidatePath("/parent/profile");
  return { ok: true };
}
