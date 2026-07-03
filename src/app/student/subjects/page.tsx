import { requireRole } from "@/lib/auth";
import { getSubjectStats } from "@/lib/data";
import { SubjectCard } from "@/components/SubjectCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function SubjectsPage() {
  const profile = await requireRole("student");
  const stats = await getSubjectStats(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Subjects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Class 10 CBSE subjects — open a subject to study its chapters.
        </p>
      </div>

      {stats.length === 0 ? (
        <EmptyState
          title="No subjects added yet"
          hint="Ask the admin to add subjects from the admin panel, or run the seed script (see README)."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => (
            <SubjectCard key={s.subject.id} stats={s} />
          ))}
        </div>
      )}
    </div>
  );
}
