import { KeyRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export function NoChildLinked() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center">
      <div className="rounded-full bg-indigo-50 p-3">
        <KeyRound className="h-6 w-6 text-indigo-600" />
      </div>
      <p className="font-medium text-slate-800">No child linked yet</p>
      <p className="max-w-md text-sm text-slate-500">
        Ask your child for the parent link code shown on their profile page, then enter it on your
        profile to connect. The admin can also link accounts manually.
      </p>
      <ButtonLink href="/parent/profile">Enter link code</ButtonLink>
    </div>
  );
}
