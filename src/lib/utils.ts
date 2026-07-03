export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pct(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return `${Math.round(Number(n))}%`;
}

/** Normalise a free-text answer for objective comparison. */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?'"()]/g, "");
}

/** Objective question types the app can auto-grade without AI. */
export const OBJECTIVE_TYPES = ["mcq", "true_false", "fill_blank", "assertion_reason", "numerical"] as const;

export function isObjective(type: string): boolean {
  return (OBJECTIVE_TYPES as readonly string[]).includes(type);
}

export function scoreColor(percentage: number): string {
  if (percentage >= 75) return "text-emerald-600";
  if (percentage >= 50) return "text-amber-600";
  return "text-rose-600";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: "Not started",
    in_progress: "In progress",
    completed: "Completed",
    needs_revision: "Needs revision",
  };
  return map[status] ?? status;
}

/** Split newline-separated content field into clean list items. */
export function toList(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
