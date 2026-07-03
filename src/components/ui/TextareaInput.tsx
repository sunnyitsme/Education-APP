import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextareaInput({ label, className, id, ...props }: TextareaInputProps) {
  const areaId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100",
          className
        )}
        rows={props.rows ?? 4}
        {...props}
      />
    </div>
  );
}
