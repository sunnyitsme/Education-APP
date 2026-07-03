import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  emptyTitle = "No records yet",
  emptyHint,
}: {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={keyFor(row)} className="hover:bg-slate-50/60">
              {columns.map((c) => (
                <td key={c.header} className={`px-4 py-3 text-slate-700 ${c.className ?? ""}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
