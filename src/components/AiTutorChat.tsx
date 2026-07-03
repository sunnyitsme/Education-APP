"use client";

import { useMemo, useRef, useState } from "react";
import { Sparkles, Send, User } from "lucide-react";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";

interface Option {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export function AiTutorChat({
  subjects,
  chapters,
  topics,
  initialSubjectId,
  initialChapterId,
  initialTopicId,
  aiConfigured,
  dailyLimit,
  usedToday,
}: {
  subjects: Option[];
  chapters: Option[];
  topics: Option[];
  initialSubjectId?: string;
  initialChapterId?: string;
  initialTopicId?: string;
  aiConfigured: boolean;
  dailyLimit: number;
  usedToday: number;
}) {
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");
  const [chapterId, setChapterId] = useState(initialChapterId ?? "");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(Math.max(0, dailyLimit - usedToday));
  const bottomRef = useRef<HTMLDivElement>(null);

  const chapterOptions = useMemo(
    () => chapters.filter((c) => !subjectId || c.parentId === subjectId),
    [chapters, subjectId]
  );
  const topicOptions = useMemo(
    () => topics.filter((t) => !chapterId || t.parentId === chapterId),
    [topics, chapterId]
  );

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setError("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, subjectId, chapterId, topicId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setMessages((m) => [...m, { role: "ai", text: data.answer }]);
        if (typeof data.remaining === "number") setRemaining(Math.max(0, data.remaining));
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  if (!aiConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 font-medium text-slate-800">AI tutor is not configured yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
          Ask the admin to add a <code className="rounded bg-white px-1">GEMINI_API_KEY</code> in
          the server environment. Your study content, mock tests and previous year papers work
          normally without it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectInput
          label="Subject"
          name="subject"
          placeholder="Any subject"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setChapterId("");
            setTopicId("");
          }}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
        <SelectInput
          label="Chapter"
          name="chapter"
          placeholder="Any chapter"
          value={chapterId}
          onChange={(e) => {
            setChapterId(e.target.value);
            setTopicId("");
          }}
          options={chapterOptions.map((c) => ({ value: c.id, label: c.name }))}
        />
        <SelectInput
          label="Topic"
          name="topic"
          placeholder="Any topic"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          options={topicOptions.map((t) => ({ value: t.id, label: t.name }))}
        />
      </div>

      <div className="min-h-[280px] space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <Sparkles className="h-7 w-7 text-indigo-400" />
            <p className="text-sm font-medium text-slate-600">
              Ask any doubt from your Class 10 syllabus
            </p>
            <p className="max-w-sm text-xs text-slate-400">
              Example: &quot;Why is the parallel combination resistance always smaller?&quot; or
              &quot;इस पाठ का सार सरल हिंदी में समझाइए&quot;
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "ai" && (
              <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-indigo-100 p-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-slate-100 p-1.5">
                <User className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" /> Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <form onSubmit={ask} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your doubt here..."
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <Button type="submit" disabled={loading || !question.trim()}>
          <Send className="h-4 w-4" /> Ask
        </Button>
      </form>
      <p className="text-xs text-slate-400">
        {remaining} of {dailyLimit} AI questions left today · Answers are exam-focused guidance, not
        official board material. Personal details are never sent to the AI.
      </p>
    </div>
  );
}
