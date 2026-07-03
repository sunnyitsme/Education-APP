import { getLinkedChildren } from "@/lib/auth";
import type { Profile } from "@/lib/types";

/**
 * The parent view is built around one linked child (the personal-use case).
 * If several children are linked, the first is shown; extending to a child
 * switcher later only needs this helper to change.
 */
export async function getFirstChild(
  parentUserId: string
): Promise<Pick<Profile, "id" | "full_name" | "email"> | null> {
  const children = await getLinkedChildren(parentUserId);
  return children[0] ?? null;
}
