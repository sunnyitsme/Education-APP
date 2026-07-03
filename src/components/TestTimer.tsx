"use client";

import { useEffect, useRef, useState } from "react";
import { TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestTimer({
  durationSeconds,
  onExpire,
  running = true,
}: {
  durationSeconds: number;
  onExpire: () => void;
  running?: boolean;
}) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true;
            // Defer so we never call the parent's submit during render.
            setTimeout(() => onExpireRef.current(), 0);
          }
          clearInterval(interval);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const low = remaining <= 60;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold tabular-nums",
        low ? "bg-rose-50 text-rose-700 animate-pulse" : "bg-indigo-50 text-indigo-700"
      )}
    >
      <TimerIcon className="h-4 w-4" />
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
