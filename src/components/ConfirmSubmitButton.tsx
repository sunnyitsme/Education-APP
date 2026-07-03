"use client";

import { Trash2 } from "lucide-react";

/** Submit button for destructive server-action forms, with a confirm dialog. */
export function ConfirmSubmitButton({
  label = "Delete",
  message = "Delete this record? This cannot be undone.",
}: {
  label?: string;
  message?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
    >
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
