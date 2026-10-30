"use client";

import { useEffect, useRef, useState } from "react";

import { renameNote, saveNote } from "@/app/actions";
import { NoteEditor } from "@/components/editor/note-editor";
import type { NoteDoc, Topic } from "@/lib/api";
import type { NoteIndex } from "@/lib/notes";

export function NoteWorkspace(props: { topic: Topic; index: NoteIndex }) {
  const { topic } = props;
  const [doc, setDoc] = useState<NoteDoc>({ blocks: topic.blocks, cues: topic.cues, summary: topic.summary });
  const [saved, setSaved] = useState(true);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const lastSaved = useRef(JSON.stringify(doc));
  // The title last sent to the server, so a rename only fires when the first line changed.
  const savedTitle = useRef(topic.title);

  // Autosave, like any note app. Each save keeps the previous version.
  useEffect(() => {
    const json = JSON.stringify(doc);
    if (json === lastSaved.current) return;
    const timer = setTimeout(async () => {
      setSaved(false);
      await saveNote(topic.id, doc);
      lastSaved.current = json;
      setSaved(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [doc, topic.id]);

  const commitTitle = async (title: string) => {
    const previous = savedTitle.current;
    if (!title || title === previous) return;
    savedTitle.current = title;
    const error = await renameNote(topic.id, title);
    setTitleError(error);
    if (error) savedTitle.current = previous;
  };

  return (
    // Fill the screen below the top bar and padding, so the summary starts at the bottom even for a short note.
    <div className="mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-3xl flex-col md:min-h-[calc(100dvh-6rem)]">
      <h1 className="sr-only">{topic.title}</h1>
      <p aria-live="polite" className="h-5 text-right text-xs text-muted">
        {!saved && "Saving…"}
      </p>
      {titleError && <p className="text-sm text-red-600 dark:text-red-400">{titleError}</p>}
      <NoteEditor
        initialTitle={topic.title}
        initialBlocks={doc.blocks}
        known={new Set(Object.keys(props.index))}
        onBlocksChange={(blocks) => setDoc((d) => ({ ...d, blocks }))}
        onTitleCommit={commitTitle}
      />
      {/* Stays at the bottom of the screen while the note scrolls behind it. */}
      <section className="sticky bottom-0 mt-auto flex flex-col gap-1 border-t border-rule bg-paper pt-3 pb-4">
        <button
          type="button"
          aria-expanded={showSummary}
          aria-controls="summary"
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-1.5 self-start text-sm font-semibold text-muted hover:text-ink"
        >
          <span aria-hidden>{showSummary ? "▾" : "▸"}</span>
          Summary
          {!showSummary && doc.summary && (
            <span className="line-clamp-1 font-serif font-normal">: {doc.summary}</span>
          )}
        </button>
        {showSummary && (
          <textarea
            id="summary"
            aria-label="Summary"
            value={doc.summary}
            onChange={(e) => setDoc((d) => ({ ...d, summary: e.target.value }))}
            placeholder="The whole note in two or three sentences, in your own words."
            rows={2}
            className="field-sizing-content max-h-[30vh] min-h-12 w-full resize-none bg-transparent font-serif text-base leading-relaxed outline-none placeholder:text-muted/70 md:text-lg"
          />
        )}
      </section>
    </div>
  );
}
