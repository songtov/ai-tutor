"use client";

import { useState, useTransition } from "react";

import { saveNote } from "@/app/actions";

export function NotesPanel({
  topicId,
  cycleId,
  initialBody,
  saved,
}: {
  topicId: string;
  cycleId: string;
  initialBody: string;
  saved: boolean;
}) {
  const [body, setBody] = useState(initialBody);
  const [pending, startTransition] = useTransition();
  const unchanged = saved && body === initialBody;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">
        Write what you now understand, in your own words. Notes stay on the topic across every cycle.
      </p>
      <label htmlFor="note-body" className="sr-only">
        Note
      </label>
      <textarea
        id="note-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className="rounded-lg border border-rule bg-surface p-5 font-serif text-lg leading-relaxed outline-none focus:border-pen"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || unchanged || !body.trim()}
          onClick={() => startTransition(() => saveNote(topicId, cycleId, body))}
          className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface disabled:opacity-40"
        >
          Save note
        </button>
        {unchanged && <span className="text-sm text-muted">Saved</span>}
      </div>
    </div>
  );
}
