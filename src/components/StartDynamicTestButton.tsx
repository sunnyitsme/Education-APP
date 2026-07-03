"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, AlertTriangle } from "lucide-react";
import { startDynamicTest } from "@/lib/actions/tests";
import { Button } from "@/components/ui/Button";

export function StartDynamicTestButton({
  kind,
  subjectId,
  label,
}: {
  kind: "quick10" | "weak_topic";
  subjectId?: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function start() {
    startTransition(async () => {
      const res = await startDynamicTest({ kind, subjectId });
      if (res.ok && res.testId) {
        router.push(`/student/mock-tests/${res.testId}`);
      } else {
        setError(res.error ?? "Could not start the test.");
      }
    });
  }

  return (
    <div>
      <Button onClick={start} disabled={pending} variant={kind === "quick10" ? "primary" : "secondary"}>
        {kind === "quick10" ? <Zap className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {pending ? "Preparing..." : label}
      </Button>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
