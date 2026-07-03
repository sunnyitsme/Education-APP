"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface Flashcard {
  front: string;
  back: string;
  tag: string;
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Flashcards appear automatically once study content (key points) is added to topics.
      </p>
    );
  }

  const card = cards[index];

  return (
    <div className="space-y-3">
      <button
        onClick={() => setFlipped(!flipped)}
        className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center transition hover:bg-indigo-50"
      >
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-indigo-600 shadow-sm">
          {card.tag} · {flipped ? "Answer" : "Question"} · Card {index + 1}/{cards.length}
        </span>
        <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-800">
          {flipped ? card.back : card.front}
        </p>
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <RotateCw className="h-3.5 w-3.5" /> Tap to flip
        </span>
      </button>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => (i - 1 + cards.length) % cards.length);
            setFlipped(false);
          }}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => (i + 1) % cards.length);
            setFlipped(false);
          }}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
