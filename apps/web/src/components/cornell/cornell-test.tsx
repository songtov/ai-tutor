"use client";

import { useState, useTransition } from "react";

import { scheduleReview, submitAttempt } from "@/app/actions";
import type { Feedback, NoteDoc } from "@/lib/api";
import { noteStatements } from "@/lib/notes";

// The Cornell split: answers on the left, a cue column about a third wide on the right.
const CORNELL_COLS = "grid-cols-[minmax(0,1fr)_32%] md:grid-cols-[minmax(0,1fr)_15rem]";

const INTERVALS = [
  { days: 1, label: "Tomorrow", hint: "I barely remembered" },
  { days: 3, label: "In 3 days", hint: "Some gaps" },
  { days: 7, label: "In a week", hint: "Mostly solid" },
  { days: 30, label: "In a month", hint: "I knew it cold" },
];

// Cornell review: cover the notes, answer each cue from memory, then uncover and compare.
export function CornellTest({
  topicId,
  doc,
  onDone,
}: {
  topicId: string;
  doc: NoteDoc;
  onDone: () => void;
}) {
  const cues = doc.blocks.flatMap((b) => doc.cues.filter((c) => c.blockId === b.id));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  const results = feedback?.results ?? [];
  const known = results.reduce((n, r) => n + r.known.length, 0);
  const total = results.reduce((n, r) => n + r.known.length + r.missing.length, 0);
  const uncued = doc.blocks.filter(
    (b) => noteStatements(b.text).length > 0 && !doc.cues.some((c) => c.blockId === b.id),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted">
        {feedback
          ? `You recalled ${known} of ${total} points. Highlighted parts are what you missed.`
          : `Your notes are covered. Answer each cue from memory.${uncued ? ` ${uncued} ${uncued === 1 ? "paragraph has" : "paragraphs have"} no cue, so ${uncued === 1 ? "it isn't" : "they aren't"} tested.` : ""}`}
      </p>

      <div>
        {cues.map((cue) => {
          const result = results.find((r) => r.cueId === cue.id);
          return (
            <div key={cue.id} className={`grid ${CORNELL_COLS}`}>
              <div className="flex flex-col gap-3 border-b border-rule py-3 pr-4 md:pr-8">
                {feedback ? (
                  <>
                    <p className="font-serif text-base text-pen md:text-lg">{answers[cue.id]?.trim() || "(no answer)"}</p>
                    {result && (
                      <ul className="flex flex-col gap-1.5 border-l-2 border-rule pl-3 text-sm">
                        {result.known.map((k) => (
                          <li key={k} className="text-muted">
                            {k}
                          </li>
                        ))}
                        {result.missing.map((m) => (
                          <li key={m}>
                            <span className="highlight">{m}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <textarea
                    aria-label={`Answer: ${cue.question}`}
                    value={answers[cue.id] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [cue.id]: e.target.value })}
                    rows={3}
                    placeholder="From memory…"
                    className="ruled field-sizing-content min-h-24 w-full resize-none bg-transparent font-serif text-base text-pen outline-none placeholder:text-muted/60 md:text-lg"
                  />
                )}
              </div>
              <div className="border-b border-l border-rule py-3 pl-3 text-xs leading-snug font-semibold md:pl-5 md:text-sm">
                {cue.question}
              </div>
            </div>
          );
        })}
      </div>

      {!feedback ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={pending || !Object.values(answers).some((a) => a.trim())}
            onClick={() =>
              startTransition(async () => {
                setFeedback(await submitAttempt(topicId, cues.map((c) => ({ cueId: c.id, text: answers[c.id] ?? "" }))));
              })
            }
            className="rounded-md bg-pen px-5 py-2 font-semibold text-surface disabled:opacity-40"
          >
            Uncover and check
          </button>
          <button type="button" onClick={onDone} className="px-3 py-2 text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">When should we ask again?</h2>
          <p className="text-sm text-muted">Fix the highlighted parts in your note, in your own words, before you go.</p>
          <div className="grid gap-3 sm:grid-cols-4">
            {INTERVALS.map((o) => (
              <button
                key={o.days}
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await scheduleReview(topicId, o.days);
                    onDone();
                  })
                }
                className="flex flex-col gap-1 rounded-lg border border-rule bg-surface p-4 text-left hover:border-pen"
              >
                <span className="font-semibold">{o.label}</span>
                <span className="text-sm text-muted">{o.hint}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
