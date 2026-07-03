import { requireRole } from "@/lib/auth";
import { CsvImport } from "@/components/CsvImport";
import { Card, CardTitle } from "@/components/ui/Card";

const CSV_COLUMNS = [
  "subject", "chapter", "topic", "question_type", "question",
  "option_a", "option_b", "option_c", "option_d",
  "correct_answer", "explanation", "marks", "difficulty",
];

const SAMPLE = `subject,chapter,topic,question_type,question,option_a,option_b,option_c,option_d,correct_answer,explanation,marks,difficulty
Science,Chemical Reactions and Equations,,mcq,"Which gas turns lime water milky?",Oxygen,Carbon dioxide,Hydrogen,Nitrogen,B,"CO2 reacts with lime water forming CaCO3.",1,easy
Mathematics,Real Numbers,,short_answer,"State the Fundamental Theorem of Arithmetic.",,,,,"Every composite number can be expressed as a product of primes in a unique way.","Definition question.",2,easy`;

export default async function AdminImportPage() {
  await requireRole("admin");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CSV Import</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bulk-import questions into the question bank. Subject/chapter/topic are matched by name
          (case-insensitive); rows with unknown subjects or chapters are reported, not imported.
        </p>
      </div>

      <Card>
        <CardTitle>Expected columns</CardTitle>
        <p className="mt-2 flex flex-wrap gap-1.5">
          {CSV_COLUMNS.map((c) => (
            <code key={c} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {c}
            </code>
          ))}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          question_type: mcq, true_false, fill_blank, short_answer, long_answer, case_based,
          assertion_reason, numerical, practical, viva · difficulty: easy, medium, hard · For MCQ,
          correct_answer is the option letter (A/B/C/D).
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-indigo-600">
            Show sample CSV
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {SAMPLE}
          </pre>
        </details>
      </Card>

      <Card>
        <CardTitle>Upload</CardTitle>
        <div className="mt-4">
          <CsvImport />
        </div>
      </Card>
    </div>
  );
}
