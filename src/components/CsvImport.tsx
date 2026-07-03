"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { importQuestionsCsv, type CsvImportResult } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";

/** Minimal CSV parser handling quoted fields and commas inside quotes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = (r[i] ?? "").trim();
    });
    return record;
  });
}

export function CsvImport() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null);
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      setError("Could not read any data rows. Check the CSV has a header row and at least one question.");
      setRows([]);
      return;
    }
    if (!("subject" in parsed[0]) || !("question" in parsed[0])) {
      setError('The header row must include at least "subject" and "question" columns.');
      setRows([]);
      return;
    }
    setRows(parsed);
  }

  async function runImport() {
    if (rows.length === 0 || importing) return;
    setImporting(true);
    setError("");
    try {
      const res = await importQuestionsCsv(rows);
      setResult(res);
      if (res.ok) setRows([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
        <Upload className="h-7 w-7 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          {fileName || "Choose a CSV file"}
        </span>
        <span className="text-xs text-slate-400">Click to browse</span>
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      </label>

      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Parsed <span className="font-semibold">{rows.length}</span> question
            {rows.length === 1 ? "" : "s"}. Preview of the first rows:
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {["subject", "chapter", "question_type", "question", "correct_answer", "marks"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{r.subject}</td>
                    <td className="px-3 py-2">{r.chapter}</td>
                    <td className="px-3 py-2">{r.question_type}</td>
                    <td className="max-w-xs truncate px-3 py-2">{r.question}</td>
                    <td className="max-w-[8rem] truncate px-3 py-2">{r.correct_answer}</td>
                    <td className="px-3 py-2">{r.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={runImport} disabled={importing}>
            {importing ? "Importing..." : `Import ${rows.length} questions`}
          </Button>
        </div>
      )}

      {result && (
        <div
          className={`space-y-2 rounded-xl px-4 py-3 text-sm ${
            result.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Imported {result.inserted} question{result.inserted === 1 ? "" : "s"}
            {result.errors.length > 0 ? ` with ${result.errors.length} error(s):` : "."}
          </p>
          {result.errors.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-xs">
              {result.errors.slice(0, 20).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
