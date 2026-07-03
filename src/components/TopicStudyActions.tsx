"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, BookOpenCheck } from "lucide-react";
import { markTopicStudied } from "@/lib/actions/study";
import { Button } from "@/components/ui/Button";

export function TopicStudyActions({
  topicId,
  currentStatus,
}: {
  topicId: string;
  currentStatus: string;
}) {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();

  function update(next: "in_progress" | "completed") {
    const timeSpentSeconds = startedAt.current
      ? Math.min(3600, Math.round((Date.now() - startedAt.current) / 1000))
      : 0;
    startTransition(async () => {
      const res = await markTopicStudied({ topicId, status: next, timeSpentSeconds });
      if (res.ok) setStatus(next);
      startedAt.current = Date.now();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== "completed" ? (
        <>
          <Button onClick={() => update("completed")} disabled={pending}>
            <CheckCircle2 className="h-4 w-4" /> Mark as completed
          </Button>
          {status === "not_started" && (
            <Button variant="outline" onClick={() => update("in_progress")} disabled={pending}>
              <BookOpenCheck className="h-4 w-4" /> Studying now
            </Button>
          )}
        </>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Completed — well done!
        </span>
      )}
    </div>
  );
}
